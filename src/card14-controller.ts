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

// Envelope decay for all peak-hold event detectors (Card 7 shape).
const ENV_DECAY = 0.85;

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

// Event-detector bank. Every public field is either a peak-hold envelope
// (instant attack, slow decay) or an event-spike scalar. No level meters.
class AudioAnalyzer {
  context: AudioContext | null = null;
  audioElement: HTMLAudioElement | null = null;
  source: MediaElementAudioSourceNode | null = null;

  // Primary analyser (smoothed) — used for full/bass/treble flux, pitch, similarity.
  analyser: AnalyserNode | null = null;
  dataArray: Uint8Array | null = null;

  // Flux-dedicated analyser (unsmoothed) — sharper detection for bass/treble/snare/onset.
  fluxAnalyser: AnalyserNode | null = null;
  fluxData: Uint8Array | null = null;
  fluxPrev: Uint8Array | null = null;

  // --- Event envelopes (0..1, peak-hold with ENV_DECAY) ---
  onset: number = 0;          // full-spectrum flux envelope
  bassHit: number = 0;        // low-band flux envelope
  trebleHit: number = 0;      // high-band flux envelope
  snareHit: number = 0;       // dual-band flux × notKick envelope
  similarityDrop: number = 0; // (1 - cosine similarity vs rolling avg), peak-hold

  // --- Raw scalars (already event-shaped or ambient support) ---
  flux: number = 0;           // raw full-spectrum flux, only feeds morphTime
  pitchDelta: number = 0;     // HPS-based pitch-change, fires on slides

  private history: Float32Array[] = [];
  private prevPitchBin: number = 0;

  async start() {
    if (this.context) return;
    this.context = new (window.AudioContext || (window as any).webkitAudioContext)();

    // Smoothed analyser — used for similarity history and pitch tracking.
    this.analyser = this.context.createAnalyser();
    this.analyser.fftSize = 2048;
    this.analyser.smoothingTimeConstant = 0.8;
    this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);

    // Flux analyser — raw (smoothing=0) so deltas aren't blunted.
    this.fluxAnalyser = this.context.createAnalyser();
    this.fluxAnalyser.fftSize = 2048;
    this.fluxAnalyser.smoothingTimeConstant = 0;
    this.fluxData = new Uint8Array(this.fluxAnalyser.frequencyBinCount);
    this.fluxPrev = new Uint8Array(this.fluxAnalyser.frequencyBinCount);

    try {
      this.audioElement = new Audio('/songs/foyou.mp3');
      this.audioElement.crossOrigin = "anonymous";
      this.audioElement.loop = true;

      this.source = this.context.createMediaElementSource(this.audioElement);
      this.source.connect(this.analyser);
      this.source.connect(this.fluxAnalyser);
      this.analyser.connect(this.context.destination);

      await this.audioElement.play();
    } catch (err) {
      console.error("Audio playback failed", err);
    }
  }

  update() {
    this.updateFluxDetectors();
    this.updatePitchAndSimilarity();
  }

  // Full-spectrum / bass / treble / snare flux envelopes (Card 7 pattern).
  private updateFluxDetectors() {
    if (!this.fluxAnalyser || !this.fluxData || !this.fluxPrev) return;
    this.fluxAnalyser.getByteFrequencyData(this.fluxData);

    // fftSize=2048 @ 44.1kHz → binΔ ≈ 21.53 Hz.
    // Bands:
    //   BASS:   bins 2..9      (~43–194 Hz)   — kick / sub / low body
    //   TREBLE: bins 186..464  (~4–10 kHz)    — hats, cymbals, air
    //   BODY   (snare shell):   8..18         (~172–387 Hz)
    //   CRACK  (snare wire):    185..371      (~4–8 kHz)
    //   LOW reject (kick gate): 0..6          (<150 Hz)
    const BASS_LO = 2, BASS_HI = 10;
    const TREBLE_LO = 186, TREBLE_HI = 464;
    const BODY_LO = 8, BODY_HI = 19;
    const CRACK_LO = 185, CRACK_HI = 372;
    const LOW_HI = 7;
    const EPS = 1e-6;

    let fullFlux = 0;
    let bassFlux = 0;
    let trebleFlux = 0;
    let bodyFlux = 0;
    let crackFlux = 0;
    let lowE = 0;
    let totalE = 0;

    const n = this.fluxData.length;
    for (let i = 0; i < n; i++) {
      const v = this.fluxData[i] / 255.0;
      const p = this.fluxPrev[i] / 255.0;
      const d = v - p;

      totalE += v;
      if (i < LOW_HI) lowE += v;

      if (d > 0) {
        fullFlux += d;
        if (i >= BASS_LO && i < BASS_HI) bassFlux += d;
        if (i >= TREBLE_LO && i < TREBLE_HI) trebleFlux += d;
        if (i >= BODY_LO && i < BODY_HI) bodyFlux += d;
        if (i >= CRACK_LO && i < CRACK_HI) crackFlux += d;
      }
    }
    this.fluxPrev.set(this.fluxData);

    // Normalize per-band. Constants tuned so a typical hit lands near 0.7–1.0.
    const rawOnset = Math.min(fullFlux / 20.0, 1.0);
    const rawBass = Math.min(bassFlux / 3.0, 1.0);
    const rawTreble = Math.min(trebleFlux / 12.0, 1.0);
    const bodyNorm = Math.min(bodyFlux / 4.0, 1.0);
    const crackNorm = Math.min(crackFlux / 12.0, 1.0);
    const notKick = 1 - Math.min(lowE / (totalE + EPS), 1);
    const rawSnare = bodyNorm * crackNorm * notKick;

    // Peak-hold envelopes: instant attack, ENV_DECAY exponential decay.
    this.onset = rawOnset > this.onset ? rawOnset : this.onset * ENV_DECAY + rawOnset * (1 - ENV_DECAY);
    this.bassHit = rawBass > this.bassHit ? rawBass : this.bassHit * ENV_DECAY + rawBass * (1 - ENV_DECAY);
    this.trebleHit = rawTreble > this.trebleHit ? rawTreble : this.trebleHit * ENV_DECAY + rawTreble * (1 - ENV_DECAY);
    this.snareHit = rawSnare > this.snareHit ? rawSnare : this.snareHit * ENV_DECAY + rawSnare * (1 - ENV_DECAY);

    // Expose raw full flux for morphTime accumulation.
    this.flux = fullFlux / (n * 1.0);
  }

  // HPS pitch tracking + rolling-average cosine similarity for section-change detection.
  private updatePitchAndSimilarity() {
    if (!this.analyser || !this.dataArray) return;
    this.analyser.getByteFrequencyData(this.dataArray);

    const binCount = this.dataArray.length;
    const specLen = Math.min(512, binCount);
    const currentSpectrum = new Float32Array(specLen);
    for (let i = 0; i < specLen; i++) {
      currentSpectrum[i] = this.dataArray[i];
    }

    // HPS pitch detection — fundamental search in ~43–1000 Hz.
    let maxHPS = 0;
    let peakBin = 1;
    for (let i = 1; i < 24; i++) {
      let hps = currentSpectrum[i] / 255.0;
      if (i * 2 < specLen) hps *= currentSpectrum[i * 2] / 255.0;
      if (i * 3 < specLen) hps *= currentSpectrum[i * 3] / 255.0;
      if (i * 4 < specLen) hps *= currentSpectrum[i * 4] / 255.0;
      if (i * 5 < specLen) hps *= currentSpectrum[i * 5] / 255.0;
      if (hps > maxHPS) {
        maxHPS = hps;
        peakBin = i;
      }
    }
    this.pitchDelta = Math.abs(peakBin - this.prevPitchBin);
    this.prevPitchBin = peakBin;

    // Rolling-average cosine similarity → similarity-drop envelope.
    this.history.push(currentSpectrum);
    if (this.history.length > 10) this.history.shift();

    let similarity = 1.0;
    if (this.history.length > 1) {
      const avgSpectrum = new Float32Array(specLen);
      for (const h of this.history) {
        for (let i = 0; i < specLen; i++) avgSpectrum[i] += h[i];
      }
      let dot = 0;
      let normA = 0;
      let normB = 0;
      for (let i = 0; i < specLen; i++) {
        avgSpectrum[i] /= this.history.length;
        dot += currentSpectrum[i] * avgSpectrum[i];
        normA += currentSpectrum[i] ** 2;
        normB += avgSpectrum[i] ** 2;
      }
      similarity = normA > 0 && normB > 0 ? dot / (Math.sqrt(normA) * Math.sqrt(normB)) : 1.0;
    }

    // Anything under 0.92 cosine similarity counts as a divergence event.
    // Below that threshold we grow the raw value; above → zero. Peak-hold envelope.
    const SIM_THRESH = 0.92;
    const rawDrop = similarity < SIM_THRESH ? Math.min((SIM_THRESH - similarity) / 0.3, 1.0) : 0;
    this.similarityDrop = rawDrop > this.similarityDrop
      ? rawDrop
      : this.similarityDrop * ENV_DECAY + rawDrop * (1 - ENV_DECAY);
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
      // Event-driven uniforms (all peak-hold envelopes except pitchDelta).
      uOnset: { value: 0.0 },
      uBassHit: { value: 0.0 },
      uTrebleHit: { value: 0.0 },
      uSnareHit: { value: 0.0 },
      uPitchDelta: { value: 0.0 },
      uMorphTime: { value: 0.0 },
      uBend: { value: 0.0 },
      uBendDir1: { value: new THREE.Vector3(0, 1, 0) },
      uBendDir2: { value: new THREE.Vector3(1, 0, 0) },
      uBendFreq: { value: 4.0 },
      uSplit: { value: 0.0 },
      uSplitAxis: { value: new THREE.Vector3(0, 1, 0) },
      uSquiggleBlend: { value: 0.0 }
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

      uniform float uOnset;
      uniform float uBassHit;
      uniform float uTrebleHit;
      uniform float uSnareHit;
      uniform float uPitchDelta;
      uniform float uMorphTime;
      uniform float uBend;
      uniform vec3 uBendDir1;
      uniform vec3 uBendDir2;
      uniform float uBendFreq;
      uniform float uSplit;
      uniform vec3 uSplitAxis;
      uniform float uSquiggleBlend;

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
        // Organic warp — unchanged ambient layer.
        vec3 warpedNormal = normalize(baseNormal + snoise(baseNormal * 2.5 + t * 0.5) * 0.25);

        // 5 orbiting attractor pulls — ambient motion, independent of audio.
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

        float sharpness = uLobeCountBias;
        i1 = pow(i1, sharpness);
        i2 = pow(i2, sharpness);
        i3 = pow(i3, sharpness);
        i4 = pow(i4, sharpness);
        i5 = pow(i5, sharpness);

        float pull = i1 + i2 + i3 + i4 + i5;

        // Fluid-noise baseline — advances by uMorphTime (monotonic, never reverses).
        float fluidNoise = snoise(warpedNormal * 1.5 - uMorphTime) * 0.5 + 0.5;

        float r = 0.68;

        // Ambient displacement — driven by energy only, NOT by continuous loudness.
        r += pull * (uAgitationStrength + uEnergy * 0.2);
        r += fluidNoise * uEdgeRoughness;

        // --- EVENT-DRIVEN DISPLACEMENT (all envelopes self-silence between events) ---

        // Bass throb — low-band flux envelope drives a deep expansion.
        float bassThrob = uBassHit * 0.35 * (1.0 + snoise(warpedNormal * 2.0 - t * 2.0));
        r += bassThrob;

        // Treble spikes — high-band flux envelope drives jagged high-freq ripples.
        float trebleSpikes = uTrebleHit * 0.18 * snoise(warpedNormal * 15.0 + t * 10.0);
        r += trebleSpikes;

        // Snare goop — dual-band flux × notKick drives mid-freq protrusions.
        float snareGoop = uSnareHit * 0.45 * pow(max(0.0, snoise(warpedNormal * 4.0 - t * 8.0)), 2.0);
        r += snareGoop;

        // Full-spectrum onset — overall expansion bloom.
        r += uOnset * 0.12;

        // Pointer magnet (user input).
        float magnetStrength = 0.35 + uPresence * 0.8;
        float pointerPush = dot(baseNormal.xy, uPointer) * magnetStrength;
        r += pointerPush;

        // Split / mitosis — triggered by similarity-drop events.
        float splitDist = dot(baseNormal, uSplitAxis);
        float isPositiveSide = step(0.0, splitDist) * 2.0 - 1.0;
        float pinch = smoothstep(0.0, 0.25, abs(splitDist));
        r *= mix(1.0, pinch, uSplit);

        vec3 pos = baseNormal * r * uBaseScale;

        pos += uSplitAxis * isPositiveSide * uSplit * 1.8;

        // PitchDelta Y-stretch — already event-shaped (fires on slides, silent on held notes).
        pos.y *= 1.0 + clamp(uPitchDelta * 0.035, 0.0, 0.6);

        // Bend — triggered by full-spectrum flux spikes.
        float bPhase = dot(baseNormal, uBendDir1) * uBendFreq + t * 8.0;
        pos += uBendDir2 * sin(bPhase) * uBend * 0.6;
        pos += uBendDir1 * (abs(cos(bPhase * 0.5)) - 0.5) * uBend * 1.2;

        // Squiggle — decoration layer, clock-driven every 20–60s. Same shader path as before.
        float sBlend = clamp(uSquiggleBlend, 0.0, 1.5);
        if (sBlend > 0.0) {
          // High frequency wiggle
          pos.x += sin(baseNormal.y * 8.0 + t * 5.0) * 0.4 * sBlend;
          pos.z += cos(baseNormal.y * 7.0 + t * 4.5) * 0.4 * sBlend;
          // Low frequency bend (loop/curve)
          float sbend = sin(baseNormal.y * 3.14159);
          pos.x += sbend * 0.6 * cos(t * 3.0) * sBlend;
          pos.y += sbend * 0.6 * sin(t * 3.0) * sBlend;
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

        finalColor = mix(finalColor, vec3(0.0), uVantablack);

        if (uJarvis > 0.5) {
          vec3 quadBlue = vec3(0.302, 0.765, 1.0);
          float fresnel = pow(1.0 - max(dot(normal, viewDirection), 0.0), 3.0);
          vec3 jarvisRim = quadBlue * fresnel * 1.5;

          float oilFresnel = pow(1.0 - max(dot(normal, viewDirection), 0.0), 1.3);
          vec3 oil = oilPalette(oilFresnel + uTime * 0.2) * 0.8;

          vec3 lightDir = normalize(vec3(0.0, 2.0, 2.0) - vWorldPosition);
          float diff = max(dot(normal, lightDir), 0.0);
          float pointFlicker = 1.0 + fract(sin(uTime * 43.2178) * 4378.5453) * 0.15;
          vec3 lightContrib = quadBlue * diff * 0.4 * pointFlicker;

          finalColor += (oil * oilFresnel) + jarvisRim + lightContrib;
        }

        gl_FragColor = vec4(finalColor, 1.0);
      }
    `,
    transparent: false
  });
}

export class Card14Controller {
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
  bendSpring: SpringValue;
  splitSpring: SpringValue;
  squiggleSpring: SpringValue;
  clock: THREE.Clock;
  frameId: number;
  isDestroyed: boolean;
  handleResize: () => void;
  audioAnalyzer: AudioAnalyzer;
  shaderTime: number = 0;
  morphTime: number = 0;

  // Event-hygiene cooldowns — prevent re-triggering on the decay tail of the
  // previous event. Not a clock rotator: event triggers still require a real
  // audio event above threshold.
  private lastBendAt: number = -10;
  private lastSplitAt: number = -10;
  private readonly BEND_COOLDOWN = 0.8;
  private readonly SPLIT_COOLDOWN = 1.2;
  private readonly BEND_THRESHOLD = 0.55;
  private readonly SPLIT_THRESHOLD = 0.25;

  // "active until" timestamps — any trigger (event or choreo) sets these.
  // Spring targets are 1.0 while now < activeUntil, else 0. Lets event-reactive
  // and clock-driven paths coexist without overwriting each other frame-to-frame.
  private bendActiveUntil: number = 0;
  private splitActiveUntil: number = 0;
  private squiggleActiveUntil: number = 0;
  private readonly BEND_HOLD = 0.4;
  private readonly SPLIT_HOLD = 1.6;
  private readonly SQUIGGLE_HOLD = 2.5;

  // Choreography layer — decoration, not reactivity. Clock-driven.
  // Every CHOREO_MIN..CHOREO_MAX seconds, pick squiggle or split and bloom it.
  // Runs in parallel with event-reactive behavior; the blob still responds to
  // onsets / bass / snare / treble the whole time.
  private nextChoreoAt: number = 0;
  private choreoEnabled: boolean = true;
  private readonly CHOREO_MIN = 20;
  private readonly CHOREO_MAX = 60;

  // Squiggle is on continuously, but takes a 10s break every 30–45s.
  private squiggleBreakUntil: number = 0;
  private nextSquiggleBreakAt: number = 30 + Math.random() * 15;
  private readonly SQUIGGLE_BREAK_LEN = 10;
  private readonly SQUIGGLE_BREAK_MIN = 30;
  private readonly SQUIGGLE_BREAK_MAX = 45;

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
    this.geometry = new THREE.IcosahedronGeometry(0.68, 128);
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.massGroup.add(this.mesh);

    this.activeSpring = new SpringValue(0, { stiffness: 24, damping: 6.6 });
    this.energySpring = new SpringValue(DEFAULT_ENERGY, { stiffness: 34, damping: 6.4 });
    this.pointerXSpring = new SpringValue(0, { stiffness: 20, damping: 7.8 });
    this.pointerYSpring = new SpringValue(0, { stiffness: 20, damping: 7.8 });
    // Bend: springs up fast on trigger, decays naturally (target returns to 0 after hold).
    this.bendSpring = new SpringValue(0, { stiffness: 18, damping: 5 });
    // Split: slower buildup, slower release for discrete moment.
    this.splitSpring = new SpringValue(0, { stiffness: 12, damping: 4 });
    // Squiggle: matches old pre-rewrite feel.
    this.squiggleSpring = new SpringValue(0, { stiffness: 10, damping: 5 });

    // First choreography event falls somewhere in the first window.
    this.nextChoreoAt = this.CHOREO_MIN + Math.random() * (this.CHOREO_MAX - this.CHOREO_MIN);

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

    // Detector bank first — everything downstream reads these envelopes.
    this.audioAnalyzer.update();

    // Monotonic morph-time (never reverses, modulated by raw flux).
    this.morphTime += deltaSeconds * (0.3 + this.audioAnalyzer.flux * 1.0);
    this.shaderTime += deltaSeconds;

    const now = this.shaderTime;

    // --- Event triggers (reactive layer) ---
    // Bend: full-spectrum flux spike → discrete bloom.
    if (
      this.audioAnalyzer.onset > this.BEND_THRESHOLD &&
      this.bendSpring.value < 0.15 &&
      now - this.lastBendAt > this.BEND_COOLDOWN
    ) {
      const d1 = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
      const d2 = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
      this.material.uniforms.uBendDir1.value.copy(d1);
      this.material.uniforms.uBendDir2.value.copy(d2);
      this.material.uniforms.uBendFreq.value = 2.0 + Math.random() * 6.0;
      this.bendActiveUntil = now + this.BEND_HOLD;
      this.lastBendAt = now;
    }

    // Split: similarity-drop event (section change / cut).
    if (
      this.audioAnalyzer.similarityDrop > this.SPLIT_THRESHOLD &&
      this.splitSpring.value < 0.1 &&
      now - this.lastSplitAt > this.SPLIT_COOLDOWN
    ) {
      const axis = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
      this.material.uniforms.uSplitAxis.value.copy(axis);
      this.splitActiveUntil = now + this.SPLIT_HOLD;
      this.lastSplitAt = now;
    }

    // --- Choreography layer (decoration, clock-driven) ---
    // Every 20–60s, pick squiggle or split at random and bloom it. Coexists
    // with event-reactive behavior; the blob keeps responding to onsets.
    if (now >= this.nextChoreoAt) {
      // Choreo only handles split now (squiggle has its own always-on-with-breaks cycle).
      const axis = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
      this.material.uniforms.uSplitAxis.value.copy(axis);
      this.splitActiveUntil = now + this.SPLIT_HOLD;
      this.nextChoreoAt = now + this.CHOREO_MIN + Math.random() * (this.CHOREO_MAX - this.CHOREO_MIN);
    }

    // Squiggle: always on, except for a 10s break every 30–45s.
    if (now >= this.nextSquiggleBreakAt && now >= this.squiggleBreakUntil) {
      this.squiggleBreakUntil = now + this.SQUIGGLE_BREAK_LEN;
      this.nextSquiggleBreakAt =
        this.squiggleBreakUntil +
        this.SQUIGGLE_BREAK_MIN +
        Math.random() * (this.SQUIGGLE_BREAK_MAX - this.SQUIGGLE_BREAK_MIN);
    }

    // Spring targets from activeUntil windows (event + choreo both feed these).
    this.bendSpring.setTarget(now < this.bendActiveUntil ? 1.0 : 0);
    this.splitSpring.setTarget(now < this.splitActiveUntil ? 1.0 : 0);
    this.squiggleSpring.setTarget(now >= this.squiggleBreakUntil ? 1.0 : 0);

    const active = this.activeSpring.update(deltaSeconds);
    const energy = this.energySpring.update(deltaSeconds);
    const pointerX = this.pointerXSpring.update(deltaSeconds);
    const pointerY = this.pointerYSpring.update(deltaSeconds);
    const bendBlend = this.bendSpring.update(deltaSeconds);
    const splitBlend = this.splitSpring.update(deltaSeconds);
    const squiggleBlend = this.squiggleSpring.update(deltaSeconds);

    this.pointer.set(pointerX, pointerY);

    // Uniform writes — all audio-reactive uniforms are fed from peak-hold envelopes.
    const u = this.material.uniforms;
    u.uTime.value = this.shaderTime;
    u.uEnergy.value = energy;
    u.uPresence.value = active;
    u.uPointer.value.copy(this.pointer);
    u.uOnset.value = this.audioAnalyzer.onset;
    console.log('onset', this.audioAnalyzer.onset);
    u.uBassHit.value = this.audioAnalyzer.bassHit;
    u.uTrebleHit.value = 0; // muted for vibration diagnosis
    u.uSnareHit.value = this.audioAnalyzer.snareHit;
    u.uPitchDelta.value = this.audioAnalyzer.pitchDelta;
    u.uMorphTime.value = this.morphTime;
    u.uBend.value = bendBlend;
    u.uSplit.value = splitBlend;
    u.uSquiggleBlend.value = squiggleBlend;

    this.massGroup.rotation.y = pointerX * 0.18 + active * 0.05;
    this.massGroup.rotation.x = pointerY * 0.08 - 0.08 - active * 0.02;
    this.massGroup.position.y = pointerY * 0.08 + active * 0.06;
    this.massGroup.position.x = pointerX * 0.18;

    this.renderer.render(this.scene, this.camera);
    this.frameId = window.requestAnimationFrame(this.animate);
  }
}
