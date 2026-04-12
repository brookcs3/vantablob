import * as THREE from "three";

const DEFAULT_ENERGY = 0.18;
const BASE_PRESET = {
  name: "music-mass",
  seed: 1,
  baseScale: 0.82,
  lobeCountBias: 4.8,
  edgeRoughness: 0.18,
  driftSpeed: 0.62,
  agitationStrength: 0.2,
  directionalBias: 0.72,
  backgroundColor: "#0a0a1a",
  fillColor: "#050505"
};

class SpringValue {
  value: number;
  target: number;
  velocity: number;
  config: { stiffness: number; damping: number };

  constructor(value: number, config: { stiffness: number; damping: number }) {
    this.value = value;
    this.target = value;
    this.velocity = 0;
    this.config = config;
  }

  setTarget(target: number) {
    this.target = target;
  }

  snap(value: number) {
    this.value = value;
    this.target = value;
    this.velocity = 0;
  }

  update(deltaSeconds: number) {
    const { stiffness, damping } = this.config;
    const displacement = this.target - this.value;
    this.velocity += displacement * stiffness * deltaSeconds;
    this.velocity *= Math.exp(-damping * deltaSeconds);
    this.value += this.velocity * deltaSeconds;
    return this.value;
  }
}

class AudioAnalyzer {
  context: AudioContext | null = null;
  analyser: AnalyserNode | null = null;
  dataArray: Uint8Array | null = null;
  source: MediaElementAudioSourceNode | null = null;
  audioElement: HTMLAudioElement | null = null;
  
  bass: number = 0;
  treble: number = 0;
  onset: number = 0;
  squelch: number = 0;
  centroid: number = 0;
  similarity: number = 1;
  
  // Dynamic hits
  bassHit: number = 0;
  trebleHit: number = 0;
  snareHit: number = 0;
  private bassAvg: number = 0;
  private trebleAvg: number = 0;
  private snareAvg: number = 0;
  
  // Advanced 303 Metrics
  flux: number = 0;
  pitchDelta: number = 0;
  prominence: number = 0;
  hnr: number = 0;
  vibration: number = 0;

  private history: Float32Array[] = [];
  private prevSpectrum: Float32Array | null = null;
  private prevPitchBin: number = 0;

  async start() {
    if (this.context) return;
    this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.analyser = this.context.createAnalyser();
    this.analyser.fftSize = 1024;
    this.analyser.smoothingTimeConstant = 0.8;
    this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);

    try {
      this.audioElement = new Audio('/ms.mp3');
      this.audioElement.crossOrigin = "anonymous";
      this.audioElement.loop = true;
      
      this.source = this.context.createMediaElementSource(this.audioElement);
      this.source.connect(this.analyser);
      this.analyser.connect(this.context.destination); // Route to speakers
      
      await this.audioElement.play();
    } catch (err) {
      console.error("Audio playback failed", err);
    }
  }

  update() {
    if (!this.analyser || !this.dataArray) return;
    this.analyser.getByteFrequencyData(this.dataArray);
    
    let bassSum = 0;
    let trebleSum = 0;
    let snareSum = 0;
    let totalSum = 0;
    
    let squelchPeak = 0;
    let squelchSum = 0;
    let squelchCount = 0;

    let weightedSum = 0;

    const currentSpectrum = new Float32Array(512);
    let fluxSum = 0;
    
    // 512 bins up to ~22050Hz. Each bin is ~43Hz.
    for (let i = 0; i < 512; i++) {
        const val = this.dataArray[i];
        currentSpectrum[i] = val;
        totalSum += val;
        weightedSum += val * i;

        if (this.prevSpectrum) {
            const diff = val - this.prevSpectrum[i];
            if (diff > 0) fluxSum += diff;
        }

        // Bass: 0-4 bins (0-172Hz)
        if (i < 5) bassSum += val;
        // Snare/Mid: 23-69 bins (~1000Hz - 3000Hz)
        if (i >= 23 && i < 70) snareSum += val;
        // Treble: 116-348 bins (5000Hz - 15000Hz)
        if (i >= 116 && i < 348) trebleSum += val;

        // Squelch band: roughly 500Hz to 2000Hz (bins 11 to 46)
        if (i >= 11 && i <= 46) {
            squelchSum += val;
            if (val > squelchPeak) squelchPeak = val;
            squelchCount++;
        }
    }

    this.bass = (bassSum / 5) / 255.0;
    this.treble = (trebleSum / 232) / 255.0;
    const snare = (snareSum / 47) / 255.0;
    this.onset = (totalSum / 512) / 255.0;

    // Envelope followers for dynamic hits (detects spikes above the running average)
    this.bassAvg = this.bassAvg * 0.95 + this.bass * 0.05;
    this.trebleAvg = this.trebleAvg * 0.95 + this.treble * 0.05;
    this.snareAvg = this.snareAvg * 0.9 + snare * 0.1; // Faster envelope for snare

    // Decay hits
    this.bassHit *= 0.85;
    this.snareHit *= 0.85;
    this.trebleHit *= 0.85;

    // Fallback
    this.bassHit = Math.max(this.bassHit, Math.max(0, this.bass - this.bassAvg * 1.1));
    this.snareHit = Math.max(this.snareHit, Math.max(0, snare - this.snareAvg * 1.25));
    this.trebleHit = Math.max(this.trebleHit, Math.max(0, this.treble - this.trebleAvg * 1.2));

    const squelchMean = (squelchSum / squelchCount) || 1;
    this.squelch = Math.min((squelchPeak / squelchMean) / 10.0, 1.0);

    this.centroid = totalSum > 0 ? (weightedSum / totalSum) / 512.0 : 0;
    this.flux = this.prevSpectrum ? fluxSum / (512 * 255.0) : 0;
    this.prevSpectrum = currentSpectrum;

    // --- ADVANCED 303 ANALYSIS ---
    
    // 1. Harmonic Product Spectrum (HPS) for Pitch Tracking
    let maxHPS = 0;
    let peakBin = 1;
    // Search fundamental between ~43Hz and ~1000Hz (bins 1 to 23)
    for (let i = 1; i < 24; i++) {
        let hps = currentSpectrum[i] / 255.0;
        if (i * 2 < 512) hps *= (currentSpectrum[i * 2] / 255.0);
        if (i * 3 < 512) hps *= (currentSpectrum[i * 3] / 255.0);
        if (i * 4 < 512) hps *= (currentSpectrum[i * 4] / 255.0);
        if (i * 5 < 512) hps *= (currentSpectrum[i * 5] / 255.0);
        
        if (hps > maxHPS) {
            maxHPS = hps;
            peakBin = i;
        }
    }

    // 2. Pitch Derivative (Slide/Stretch)
    this.pitchDelta = Math.abs(peakBin - this.prevPitchBin);
    this.prevPitchBin = peakBin;

    // 3. Peak-to-Average Ratio (Prominence / Whistle)
    let windowSize = 3;
    let localSum = 0;
    let count = 0;
    for (let i = Math.max(0, peakBin - windowSize); i <= Math.min(511, peakBin + windowSize); i++) {
        if (i !== peakBin) {
            localSum += currentSpectrum[i];
            count++;
        }
    }
    let localAvg = count > 0 ? (localSum / count) : 1;
    this.prominence = currentSpectrum[peakBin] / Math.max(1, localAvg);

    // 4. Harmonic-to-Noise Ratio (HNR / Growl Vibration)
    let harmonicEnergy = 0;
    let filteredTotalEnergy = 0;
    // Filtered range: ~200Hz - 2kHz (bins 5 to 46) to ignore kick drum
    for (let i = 5; i <= 46; i++) {
        filteredTotalEnergy += currentSpectrum[i];
    }
    for (let m = 1; m <= 5; m++) {
        let bin = peakBin * m;
        if (bin >= 5 && bin <= 46) {
            harmonicEnergy += currentSpectrum[bin];
        }
    }
    let noiseEnergy = Math.max(0.1, filteredTotalEnergy - harmonicEnergy);
    this.hnr = harmonicEnergy / noiseEnergy;
    
    // Vibration spikes when HNR is low (noisy/growl) and overall energy is present
    let isActive = filteredTotalEnergy > 1000;
    this.vibration = isActive ? Math.max(0, 1.0 - (this.hnr / 5.0)) : 0.0;

    // --- END ADVANCED ANALYSIS ---

    this.history.push(currentSpectrum);
    if (this.history.length > 10) this.history.shift();

    if (this.history.length > 1) {
        let avgSpectrum = new Float32Array(512);
        for (let h of this.history) {
            for (let i = 0; i < 512; i++) avgSpectrum[i] += h[i];
        }
        let dot = 0, normA = 0, normB = 0;
        for (let i = 0; i < 512; i++) {
            avgSpectrum[i] /= this.history.length;
            dot += currentSpectrum[i] * avgSpectrum[i];
            normA += currentSpectrum[i] ** 2;
            normB += avgSpectrum[i] ** 2;
        }
        this.similarity = (normA > 0 && normB > 0) ? dot / (Math.sqrt(normA) * Math.sqrt(normB)) : 1.0;
    }
  }

  stop() {
    if (this.audioElement) {
        this.audioElement.pause();
        this.audioElement.src = "";
        this.audioElement = null;
    }
    if (this.source) {
        this.source.disconnect();
    }
    if (this.context) this.context.close();
    this.context = null;
  }
}

function createMassMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uEnergy: { value: DEFAULT_ENERGY },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uPresence: { value: 0 },
      uSeed: { value: BASE_PRESET.seed },
      uBaseScale: { value: BASE_PRESET.baseScale },
      uLobeCountBias: { value: BASE_PRESET.lobeCountBias },
      uEdgeRoughness: { value: BASE_PRESET.edgeRoughness },
      uDriftSpeed: { value: BASE_PRESET.driftSpeed },
      uAgitationStrength: { value: BASE_PRESET.agitationStrength },
      uDirectionalBias: { value: BASE_PRESET.directionalBias },
      uBlobColor: { value: new THREE.Color(BASE_PRESET.fillColor) },
      uVantablack: { value: 0.0 },
      uJarvis: { value: 0.0 },
      uBass: { value: 0.0 },
      uTreble: { value: 0.0 },
      uBassHit: { value: 0.0 },
      uTrebleHit: { value: 0.0 },
      uSnareHit: { value: 0.0 },
      uOnset: { value: 0.0 },
      uSquelch: { value: 0.0 },
      uCentroid: { value: 0.0 },
      uSimilarity: { value: 1.0 },
      uTubeBlend: { value: 0.0 },
      uSquiggleBlend: { value: 0.0 },
      uFlowState: { value: 0.0 },
      uBend: { value: 0.0 },
      uBendDir1: { value: new THREE.Vector3(0, 1, 0) },
      uBendDir2: { value: new THREE.Vector3(1, 0, 0) },
      uBendFreq: { value: 4.0 },
      uSplit: { value: 0.0 },
      uSplitAxis: { value: new THREE.Vector3(0, 1, 0) },
      uFlux: { value: 0.0 },
      uMorphTime: { value: 0.0 },
      uPitchDelta: { value: 0.0 },
      uProminence: { value: 1.0 },
      uVibration: { value: 0.0 }
    },
    vertexShader: `
      varying vec3 vWorldNormal;
      varying vec3 vViewPosition;
      varying vec3 vWorldPosition;

      uniform float uTime;
      uniform float uEnergy;
      uniform vec2 uPointer;
      uniform float uPresence;
      uniform float uSeed;
      uniform float uBaseScale;
      uniform float uLobeCountBias;
      uniform float uEdgeRoughness;
      uniform float uDriftSpeed;
      uniform float uAgitationStrength;
      
      uniform float uBass;
      uniform float uTreble;
      uniform float uBassHit;
      uniform float uTrebleHit;
      uniform float uSnareHit;
      uniform float uOnset;
      uniform float uSquelch;
      uniform float uCentroid;
      uniform float uSimilarity;
      uniform float uTubeBlend;
      uniform float uSquiggleBlend;
      uniform float uFlowState;
      uniform float uBend;
      uniform vec3 uBendDir1;
      uniform vec3 uBendDir2;
      uniform float uBendFreq;
      uniform float uSplit;
      uniform vec3 uSplitAxis;
      uniform float uFlux;
      uniform float uMorphTime;
      uniform float uPitchDelta;
      uniform float uProminence;
      uniform float uVibration;

      vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      float mod289(float x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
      float permute(float x) { return mod289(((x * 34.0) + 1.0) * x); }
      vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

      float snoise(vec3 v) {
        const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
        const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

        vec3 i = floor(v + dot(v, C.yyy));
        vec3 x0 = v - i + dot(i, C.xxx);

        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min(g.xyz, l.zxy);
        vec3 i2 = max(g.xyz, l.zxy);

        vec3 x1 = x0 - i1 + C.xxx;
        vec3 x2 = x0 - i2 + C.yyy;
        vec3 x3 = x0 - D.yyy;

        i = mod289(i);
        vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));

        float n_ = 0.142857142857;
        vec3 ns = n_ * D.wyz - D.xzx;

        vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
        vec4 x_ = floor(j * ns.z);
        vec4 y_ = floor(j - 7.0 * x_);

        vec4 x = x_ * ns.x + ns.yyyy;
        vec4 y = y_ * ns.x + ns.yyyy;
        vec4 h = 1.0 - abs(x) - abs(y);

        vec4 b0 = vec4(x.xy, y.xy);
        vec4 b1 = vec4(x.zw, y.zw);

        vec4 s0 = floor(b0) * 2.0 + 1.0;
        vec4 s1 = floor(b1) * 2.0 + 1.0;
        vec4 sh = -step(h, vec4(0.0));

        vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
        vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

        vec3 p0 = vec3(a0.xy, h.x);
        vec3 p1 = vec3(a0.zw, h.y);
        vec3 p2 = vec3(a1.xy, h.z);
        vec3 p3 = vec3(a1.zw, h.w);

        vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
        p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;

        vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
        m = m * m;

        return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
      }

      vec3 getDisplacedPosition(vec3 baseNormal, float t) {
        // Twist based on squelch
        float twistAngle = uSquelch * 3.0 * baseNormal.y;
        mat2 twistMat = mat2(cos(twistAngle), -sin(twistAngle), sin(twistAngle), cos(twistAngle));
        vec3 twistedNormal = baseNormal;
        twistedNormal.xz = twistMat * twistedNormal.xz;

        vec3 warpedNormal = normalize(twistedNormal + snoise(twistedNormal * 2.5 + t * 0.5) * 0.25);
        
        vec3 m1 = normalize(vec3(sin(t * 0.8 + uSeed), cos(t * 0.9 + uSeed), sin(t * 0.7)));
        vec3 m2 = normalize(vec3(cos(t * 1.1), sin(t * 0.6 + uSeed), -cos(t * 0.8)));
        vec3 m3 = normalize(vec3(-sin(t * 0.7), -cos(t * 1.2), sin(t * 1.1 + uSeed)));
        vec3 m4 = normalize(vec3(cos(t * 0.9), -sin(t * 0.8), -cos(t * 1.3)));
        vec3 m5 = normalize(vec3(sin(t * 1.3), cos(t * 0.5), -sin(t * 0.9)));
        
        float i1 = max(0.0, dot(warpedNormal, m1));
        float i2 = max(0.0, dot(warpedNormal, m2));
        float i3 = max(0.0, dot(warpedNormal, m3));
        float i4 = max(0.0, dot(warpedNormal, m4));
        float i5 = max(0.0, dot(warpedNormal, m5));
        
        float sharpness = uLobeCountBias - (uBassHit * 3.0); // Bass hits make lobes fatter, but constant bass doesn't
        // Prominence (Peak-to-Average) makes the lobes sharper (whistling) - dialed back for surface effect
        sharpness *= clamp(1.0 + (uProminence - 1.0) * 0.15, 0.8, 1.4);
        
        i1 = pow(i1, max(1.0, sharpness));
        i2 = pow(i2, max(1.0, sharpness));
        i3 = pow(i3, max(1.0, sharpness));
        i4 = pow(i4, max(1.0, sharpness));
        i5 = pow(i5, max(1.0, sharpness));
        
        float pull = i1 + i2 + i3 + i4 + i5;
        pull = mix(pull, smoothstep(0.0, 1.0, pull), uFlowState); // Smoother pull in flow mode
        
        // Centroid increases noise frequency, morphTime handles the continuous forward motion
        float fluidNoise = snoise(twistedNormal * (1.2 + uCentroid * 5.0) - uMorphTime) * 0.5 + 0.5;
        
        float r = 0.68;
        
        // Base fluid dynamics
        float currentAgitation = mix(uAgitationStrength * (0.5 + uOnset * 0.5) + uEnergy * 0.2, 0.1, uFlowState);
        r += pull * currentAgitation;
        r += fluidNoise * uEdgeRoughness * (0.4 + uOnset * 0.6) * mix(1.0, 0.5, uFlowState);
        
        // --- MUSIC REACTIVITY ---
        // Bass: Throbbing expansion and deep distortion (now using dynamic hits instead of constant presence)
        float activeBass = smoothstep(0.1, 0.8, uBassHit * 5.0);
        float bassThrob = activeBass * 0.3 * (1.0 + snoise(twistedNormal * 2.0 - t * 2.0));
        r += bassThrob * mix(1.0, 0.4, uFlowState); // Less throb in flow
        
        // Treble: High frequency jagged spikes (also using dynamic hits)
        float activeTreble = smoothstep(0.1, 0.8, uTrebleHit * 5.0);
        float trebleSpikes = activeTreble * 0.15 * snoise(twistedNormal * 15.0 + t * 10.0);
        r += trebleSpikes * (1.0 - uFlowState); // No spikes in flow
        
        // Snare: Goop protruding out
        float activeSnare = smoothstep(0.15, 0.8, uSnareHit * 4.0);
        float snareGoop = activeSnare * 0.4 * pow(max(0.0, snoise(twistedNormal * 4.0 - t * 8.0)), 2.0);
        r += snareGoop * mix(1.0, 0.6, uFlowState);
        
        // Onset: Quick overall expansion
        float activeOnset = smoothstep(0.2, 1.0, uOnset);
        r += activeOnset * 0.1 * (1.0 - uFlowState * 0.5);
        
        // Vibration (Growl / HNR): High frequency noise when sound breaks up (surface level)
        float growlNoise = snoise(twistedNormal * 40.0 + t * 20.0);
        r += growlNoise * uVibration * 0.03;
        
        // MAGNET EFFECT (Pointer interaction trumps music)
        float magnetStrength = 0.35 + uPresence * 0.8;
        float pointerPush = dot(baseNormal.xy, uPointer) * magnetStrength;
        r += pointerPush;
        
        // Mitosis / Split effect
        float splitDist = dot(baseNormal, uSplitAxis);
        float isPositiveSide = step(0.0, splitDist) * 2.0 - 1.0; // -1.0 or 1.0
        
        // Pinch the equator to 0 to close the mesh holes
        float pinch = smoothstep(0.0, 0.25, abs(splitDist));
        r *= mix(1.0, pinch, uSplit);
        
        vec3 pos = baseNormal * r * uBaseScale;
        
        // Pull halves apart completely
        pos += uSplitAxis * isPositiveSide * uSplit * 1.8;
        
        // Pitch Delta (Slide/Stretch)
        // Stretches the blob vertically when the pitch slides rapidly (prominent)
        pos.y *= 1.0 + clamp(uPitchDelta * 0.035, 0.0, 0.6);
        
        // Bend effect (Anisotropic zoom equivalent)
        float bPhase = dot(baseNormal, uBendDir1) * uBendFreq + t * 8.0;
        pos += uBendDir2 * sin(bPhase) * uBend * 0.6;
        pos += uBendDir1 * (abs(cos(bPhase * 0.5)) - 0.5) * uBend * 1.2;
        
        // --- CHOREOGRAPHY / DANCE MOVES ---
        // Tube effect
        float tBlend = clamp(uTubeBlend, -1.0, 1.0);
        if (tBlend > 0.0) {
            pos.y *= (1.0 + tBlend * 2.0); // Up to 3x taller
            pos.xz *= (1.0 - tBlend * 0.6); // Up to 0.4x narrower
        } else {
            pos.y *= (1.0 + tBlend * 0.8); // Up to 0.2x shorter (tBlend is negative)
            pos.xz *= (1.0 - tBlend * 0.8); // Up to 1.8x wider
        }
        
        // Squiggle / Dance effect
        float sBlend = clamp(uSquiggleBlend, 0.0, 1.5);
        if (sBlend > 0.0) {
            // High frequency wiggle
            pos.x += sin(baseNormal.y * 8.0 + t * 5.0) * 0.4 * sBlend;
            pos.z += cos(baseNormal.y * 7.0 + t * 4.5) * 0.4 * sBlend;
            
            // Low frequency bend (makes it loop/curve)
            float bend = sin(baseNormal.y * 3.14159); // 0 at poles, 1 at equator
            pos.x += bend * 0.6 * cos(t * 3.0) * sBlend;
            pos.y += bend * 0.6 * sin(t * 3.0) * sBlend;
        }
        
        return pos;
      }

      void main() {
        float time = uTime * uDriftSpeed;

        vec3 pos = getDisplacedPosition(normal, time);

        float offset = 0.01;
        vec3 tangent = normalize(cross(normal, vec3(0.0, 1.0, 0.0)));
        if (length(tangent) < 0.1) tangent = normalize(cross(normal, vec3(1.0, 0.0, 0.0)));
        vec3 bitangent = normalize(cross(normal, tangent));
        
        vec3 posT = getDisplacedPosition(normalize(normal + tangent * offset), time);
        vec3 posB = getDisplacedPosition(normalize(normal + bitangent * offset), time);
        
        vec3 newNormal = normalize(cross(posT - pos, posB - pos));

        vec4 worldPosition = modelMatrix * vec4(pos, 1.0);
        vec4 mvPosition = viewMatrix * worldPosition;

        vWorldNormal = normalize(mat3(modelMatrix) * newNormal);
        vViewPosition = -mvPosition.xyz;
        vWorldPosition = worldPosition.xyz;

        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform vec3 uBlobColor;
      uniform float uVantablack;
      uniform float uJarvis;
      uniform float uTime;
      uniform vec2 uPointer;
      
      uniform float uBass;
      uniform float uTreble;
      uniform float uBassHit;
      uniform float uTrebleHit;
      uniform float uSnareHit;
      uniform float uOnset;
      uniform float uSquelch;
      uniform float uCentroid;
      uniform float uSimilarity;
      uniform float uFlowState;

      varying vec3 vWorldNormal;
      varying vec3 vViewPosition;
      varying vec3 vWorldPosition;

      vec3 oilPalette(float t) {
          return vec3(0.5) + vec3(0.5) * cos(6.28318 * (vec3(1.0, 0.7, 0.4) * t + vec3(0.1, 0.2, 0.3)));
      }

      void main() {
        vec3 normal = normalize(vWorldNormal);
        vec3 viewDirection = normalize(vViewPosition);

        vec3 baseColor = uBlobColor;

        vec3 lightDir1 = normalize(vec3(1.0, 1.5, 1.0));
        float diff1 = max(dot(normal, lightDir1), 0.0);
        vec3 diffuse1 = diff1 * vec3(0.15, 0.14, 0.13);

        vec3 lightDir2 = normalize(vec3(-1.0, -0.5, 0.5));
        float diff2 = max(dot(normal, lightDir2), 0.0);
        vec3 diffuse2 = diff2 * vec3(0.05, 0.06, 0.08);

        float rimPower = 1.0 - max(dot(normal, viewDirection), 0.0);
        float rim = smoothstep(0.6, 1.0, rimPower);
        vec3 rimColor = rim * vec3(0.15, 0.15, 0.18);

        vec3 halfVector1 = normalize(lightDir1 + viewDirection);
        float spec1 = pow(max(dot(normal, halfVector1), 0.0), 48.0);
        vec3 specular1 = spec1 * vec3(0.3, 0.3, 0.3);

        vec3 finalColor = baseColor + diffuse1 + diffuse2 + rimColor + specular1;
        
        // --- MUSIC REACTIVITY (COLOR) ---
        // Reverse gradient smoothing for small intensity changes
        float intensity = uOnset * 0.6 + uBassHit * 0.8;
        float smoothedIntensity = 1.0 - exp(-intensity * 3.0);
        
        // Bass adds a deep purple/blue throb to the shadows
        vec3 bassColor = vec3(0.2, 0.0, 0.5) * smoothedIntensity * 2.0;
        finalColor += bassColor * (1.0 - diff1); 
        
        // Treble adds a sharp cyan/white crackle to the highlights
        vec3 trebleColor = vec3(0.0, 0.8, 1.0) * uTreble * 1.5;
        finalColor += trebleColor * spec1;
        
        // Snare adds a bright yellow/white flash
        vec3 snareColor = vec3(1.0, 0.9, 0.5) * uSnareHit * 2.0;
        finalColor += snareColor * spec1;
        
        // Onset flashes the rim light bright pink/red
        vec3 onsetColor = vec3(1.0, 0.2, 0.5) * smoothedIntensity * 1.2;
        finalColor += onsetColor * rim;

        // Similarity drop (key change / chaos) -> Invert colors / glitch
        float glitch = smoothstep(0.95, 0.7, uSimilarity) * (1.0 - uFlowState); // Disable glitch in flow
        if (glitch > 0.0) {
            // Chromatic aberration / inversion effect
            vec3 inverted = vec3(1.0) - finalColor;
            // Shift RGB channels slightly for chroma effect
            finalColor.r = mix(finalColor.r, inverted.r, glitch * 0.8);
            finalColor.g = mix(finalColor.g, inverted.g, glitch * 0.9);
            finalColor.b = mix(finalColor.b, inverted.b, glitch * 0.7);
            // Add some erratic brightness
            finalColor += vec3(0.2, 0.8, 0.4) * glitch * uSquelch;
        }
        
        // Add a smooth iridescent sheen in FLOW mode
        float flowFresnel = pow(1.0 - max(dot(normal, viewDirection), 0.0), 2.0);
        vec3 flowSheen = oilPalette(flowFresnel + uTime * 0.3) * flowFresnel;
        finalColor = mix(finalColor, finalColor + flowSheen, uFlowState);

        finalColor = mix(finalColor, vec3(0.0), uVantablack);

        if (uJarvis > 0.5) {
            vec3 quadBlue = vec3(0.302, 0.765, 1.0);
            float fresnel = pow(1.0 - max(dot(normal, viewDirection), 0.0), 3.0);
            vec3 rimColor = quadBlue * fresnel * 1.5;
            
            float oilFresnel = pow(1.0 - max(dot(normal, viewDirection), 0.0), 1.3);
            vec3 oil = oilPalette(oilFresnel + uTime * 0.2) * 0.8;
            
            vec3 lightDir = normalize(vec3(0.0, 2.0, 2.0) - vWorldPosition);
            float diff = max(dot(normal, lightDir), 0.0);
            float pointFlicker = 1.0 + fract(sin(uTime * 43.2178) * 4378.5453) * 0.15;
            vec3 lightContrib = quadBlue * diff * 0.4 * pointFlicker;
            
            finalColor += (oil * oilFresnel) + rimColor + lightContrib;
        }

        gl_FragColor = vec4(finalColor, 1.0);
      }
    `,
    transparent: false
  });
}

export class MusicMassController {
  container: HTMLElement;
  preset: any;
  pointer: THREE.Vector2;
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  massGroup: THREE.Group;
  material: THREE.ShaderMaterial;
  geometry: THREE.IcosahedronGeometry;
  mesh: THREE.Mesh;
  activeSpring: SpringValue;
  energySpring: SpringValue;
  pointerXSpring: SpringValue;
  pointerYSpring: SpringValue;
  tubeSpring: SpringValue;
  squiggleSpring: SpringValue;
  clock: THREE.Clock;
  frameId: number;
  isDestroyed: boolean;
  handleResize: () => void;
  audioAnalyzer: AudioAnalyzer;
  shaderTime: number = 0;
  bendSpring: SpringValue;
  splitSpring: SpringValue;

  morphTime: number = 0;

  // --- Mutex effect cycler ---
  // One effect active at a time, held for a random duration, then swaps to a
  // different random effect. No Director, no overlapping choreography.
  activeEffect: 'bass' | 'treble' | 'snare' | 'tube' | 'squiggle' | 'bend' | 'split' = 'bass';
  effectTimeRemaining: number = 0;
  readonly effectList: Array<'bass' | 'treble' | 'snare' | 'tube' | 'squiggle' | 'bend' | 'split'> =
    ['bass', 'treble', 'snare', 'tube', 'squiggle', 'bend', 'split'];

  constructor(container: HTMLElement, options: any = {}) {
    this.container = container;
    this.preset = { ...BASE_PRESET, ...(options.preset ?? {}) };
    this.pointer = new THREE.Vector2(0, 0);
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(this.preset.backgroundColor, 1);
    
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';
    this.renderer.domElement.style.display = 'block';
    this.renderer.domElement.style.objectFit = 'contain';
    
    this.container.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(18, 1, 0.1, 100);
    this.camera.position.set(0, 0.04, 10.8);

    this.massGroup = new THREE.Group();
    this.scene.add(this.massGroup);

    this.material = createMassMaterial();
    this.geometry = new THREE.IcosahedronGeometry(0.68, 128); // High res for sharp treble spikes
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.massGroup.add(this.mesh);

    this.activeSpring = new SpringValue(0, { stiffness: 24, damping: 6.6 });
    this.energySpring = new SpringValue(DEFAULT_ENERGY, { stiffness: 34, damping: 6.4 });
    this.pointerXSpring = new SpringValue(0, { stiffness: 20, damping: 7.8 });
    this.pointerYSpring = new SpringValue(0, { stiffness: 20, damping: 7.8 });
    this.tubeSpring = new SpringValue(0, { stiffness: 8, damping: 6 });
    this.squiggleSpring = new SpringValue(0, { stiffness: 10, damping: 5 });
    this.bendSpring = new SpringValue(0, { stiffness: 15, damping: 4 });
    this.splitSpring = new SpringValue(0, { stiffness: 40, damping: 8 });

    // Seed the cycler with a random first effect
    this.activeEffect = this.effectList[Math.floor(Math.random() * this.effectList.length)];
    this.effectTimeRemaining = 3.0 + Math.random() * 5.0;

    this.clock = new THREE.Clock();
    this.frameId = 0;
    this.isDestroyed = false;
    
    this.audioAnalyzer = new AudioAnalyzer();

    this.setPreset(this.preset);
    this.resize();

    this.handleResize = () => this.resize();
    window.addEventListener("resize", this.handleResize);

    this.animate = this.animate.bind(this);
    this.frameId = window.requestAnimationFrame(this.animate);
  }

  async enableAudio() {
    await this.audioAnalyzer.start();
  }

  setActive(isActive: boolean) {
    this.activeSpring.setTarget(isActive ? 1 : 0);
  }

  setPointer(clientX: number, clientY: number) {
    const rect = this.container.getBoundingClientRect();
    const normalizedX = ((clientX - rect.left) / rect.width) * 2 - 1;
    const normalizedY = -(((clientY - rect.top) / rect.height) * 2 - 1);
    this.pointerXSpring.setTarget(THREE.MathUtils.clamp(normalizedX, -1, 1));
    this.pointerYSpring.setTarget(THREE.MathUtils.clamp(normalizedY, -1, 1));
  }

  resetPointer() {
    this.pointerXSpring.setTarget(0);
    this.pointerYSpring.setTarget(0);
  }

  setPreset(preset: any) {
    this.preset = { ...BASE_PRESET, ...preset };
    this.material.uniforms.uSeed.value = this.preset.seed;
    this.material.uniforms.uBaseScale.value = this.preset.baseScale;
    this.material.uniforms.uLobeCountBias.value = this.preset.lobeCountBias;
    this.material.uniforms.uEdgeRoughness.value = this.preset.edgeRoughness;
    this.material.uniforms.uDriftSpeed.value = this.preset.driftSpeed;
    this.material.uniforms.uAgitationStrength.value = this.preset.agitationStrength;
    this.material.uniforms.uDirectionalBias.value = this.preset.directionalBias;
    this.material.uniforms.uBlobColor.value.set(this.preset.fillColor);
    
    this.renderer.setClearColor(this.preset.backgroundColor, 1);
    
    if (this.container.parentElement) {
      this.container.parentElement.style.backgroundColor = this.preset.backgroundColor;
    }
  }

  setVantablack(isVantablack: boolean) {
    this.material.uniforms.uVantablack.value = isVantablack ? 1.0 : 0.0;
  }

  setJarvis(isJarvis: boolean) {
    this.material.uniforms.uJarvis.value = isJarvis ? 1.0 : 0.0;
  }

  setEnergy(level: number) {
    this.energySpring.setTarget(THREE.MathUtils.clamp(level, 0.08, 1));
  }

  resize(width?: number, height?: number) {
    const nextWidth = width ?? this.container.clientWidth ?? window.innerWidth;
    const nextHeight = height ?? this.container.clientHeight ?? window.innerHeight;

    this.camera.aspect = nextWidth / nextHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(nextWidth, nextHeight, false);

    const aspectBias = THREE.MathUtils.clamp((nextWidth / nextHeight - 0.8) * 0.12, -0.08, 0.12);
    this.massGroup.scale.set(1.05 + aspectBias, 1.0 - aspectBias * 0.32, 1);
  }

  destroy() {
    if (this.isDestroyed) {
      return;
    }

    this.isDestroyed = true;
    window.cancelAnimationFrame(this.frameId);
    window.removeEventListener("resize", this.handleResize);
    this.audioAnalyzer.stop();
    this.geometry.dispose();
    this.material.dispose();
    this.renderer.dispose();
    this.container.replaceChildren();
  }

  animate() {
    if (this.isDestroyed) {
      return;
    }

    const deltaSeconds = Math.min(this.clock.getDelta(), 0.033);
    const active = this.activeSpring.update(deltaSeconds);
    const energy = this.energySpring.update(deltaSeconds);
    const pointerX = this.pointerXSpring.update(deltaSeconds);
    const pointerY = this.pointerYSpring.update(deltaSeconds);
    const tubeBlend = this.tubeSpring.update(deltaSeconds);
    const squiggleBlend = this.squiggleSpring.update(deltaSeconds);
    const bendBlend = this.bendSpring.update(deltaSeconds);
    const splitBlend = this.splitSpring.update(deltaSeconds);

    this.pointer.set(pointerX, pointerY);
    
    // Update audio features
    this.audioAnalyzer.update();
    
    // Accumulate morph time to prevent reversing when flux drops
    this.morphTime += deltaSeconds * (0.3 + this.audioAnalyzer.flux * 1.0);

    // --- MUTEX EFFECT CYCLER ---
    // One effect at a time, held for a random 3–8s, then swap to a different
    // random one. Replaces the old Director + choreography + time-reversal.
    this.effectTimeRemaining -= deltaSeconds;
    if (this.effectTimeRemaining <= 0) {
      let next = this.activeEffect;
      while (next === this.activeEffect) {
        next = this.effectList[Math.floor(Math.random() * this.effectList.length)];
      }
      this.activeEffect = next;
      this.effectTimeRemaining = 3.0 + Math.random() * 5.0;

      // Re-seed direction vectors so effect feels fresh each activation
      if (next === 'bend') {
        const d1 = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
        const d2 = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
        this.material.uniforms.uBendDir1.value.copy(d1);
        this.material.uniforms.uBendDir2.value.copy(d2);
        this.material.uniforms.uBendFreq.value = 2.0 + Math.random() * 6.0;
      } else if (next === 'split') {
        const axis = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
        this.material.uniforms.uSplitAxis.value.copy(axis);
      }
    }

    // Spring targets — only the active choreography spring gets a non-zero target.
    this.tubeSpring.setTarget(this.activeEffect === 'tube' ? 0.8 : 0);
    this.squiggleSpring.setTarget(this.activeEffect === 'squiggle' ? 1.0 : 0);
    this.bendSpring.setTarget(this.activeEffect === 'bend' ? 1.0 : 0);
    this.splitSpring.setTarget(this.activeEffect === 'split' ? 1.0 : 0);

    // Shader time always runs forward — no more reversals.
    this.shaderTime += deltaSeconds;

    this.material.uniforms.uTime.value = this.shaderTime;
    this.material.uniforms.uEnergy.value = energy;
    this.material.uniforms.uPresence.value = active;
    this.material.uniforms.uPointer.value.copy(this.pointer);
    
    // Mask audio-reactive uniforms by active effect (mutex).
    // Only the currently-active feature's signal reaches the shader.
    const isBass   = this.activeEffect === 'bass';
    const isTreble = this.activeEffect === 'treble';
    const isSnare  = this.activeEffect === 'snare';
    this.material.uniforms.uBass.value      = isBass   ? this.audioAnalyzer.bass     : 0;
    this.material.uniforms.uTreble.value    = isTreble ? this.audioAnalyzer.treble   : 0;
    this.material.uniforms.uBassHit.value   = isBass   ? this.audioAnalyzer.bassHit  : 0;
    this.material.uniforms.uTrebleHit.value = isTreble ? this.audioAnalyzer.trebleHit: 0;
    this.material.uniforms.uSnareHit.value  = isSnare  ? this.audioAnalyzer.snareHit : 0;

    // Ambient signals (always on, not mutex'd): onset + basic timbre
    this.material.uniforms.uOnset.value = this.audioAnalyzer.onset;
    this.material.uniforms.uSquelch.value = this.audioAnalyzer.squelch;
    this.material.uniforms.uCentroid.value = this.audioAnalyzer.centroid;
    this.material.uniforms.uSimilarity.value = this.audioAnalyzer.similarity;

    // Choreography spring blends — always pushed; only active one is non-zero target
    this.material.uniforms.uTubeBlend.value = tubeBlend;
    this.material.uniforms.uSquiggleBlend.value = squiggleBlend;
    this.material.uniforms.uBend.value = bendBlend;
    this.material.uniforms.uSplit.value = splitBlend;

    // FlowState was Director-driven; Director is gone, so hold at 0.
    this.material.uniforms.uFlowState.value = 0;
    
    // Advanced 303 metrics
    this.material.uniforms.uFlux.value = this.audioAnalyzer.flux;
    this.material.uniforms.uMorphTime.value = this.morphTime;
    this.material.uniforms.uPitchDelta.value = this.audioAnalyzer.pitchDelta;
    this.material.uniforms.uProminence.value = this.audioAnalyzer.prominence;
    this.material.uniforms.uVibration.value = this.audioAnalyzer.vibration;

    this.massGroup.rotation.y = pointerX * 0.18 + active * 0.05;
    this.massGroup.rotation.x = pointerY * 0.08 - 0.08 - active * 0.02;
    this.massGroup.position.y = pointerY * 0.08 + active * 0.06;
    this.massGroup.position.x = pointerX * 0.18;

    this.renderer.render(this.scene, this.camera);
    this.frameId = window.requestAnimationFrame(this.animate);
  }
}
