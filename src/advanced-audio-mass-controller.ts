import * as THREE from "three";

const DEFAULT_ENERGY = 0.18;
const BASE_PRESET = {
  name: "advanced-audio-mass",
  seed: 1,
  baseScale: 0.82,
  lobeCountBias: 6.0,
  edgeRoughness: 0.1,
  driftSpeed: 1.5,
  agitationStrength: 0.3,
  directionalBias: 0.0,
  backgroundColor: "#111111",
  fillColor: "#000000"
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
      uVantablack: { value: 1.0 },
      uJarvis: { value: 0.0 },
      uKick: { value: 0.0 },
      uSnare: { value: 0.0 },
      uCustom: { value: 0.0 },
      uIntensity: { value: 0.0 }
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
      
      uniform float uKick;
      uniform float uSnare;
      uniform float uCustom;
      uniform float uIntensity;

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
        vec4 p = permute(
          permute(
            permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) +
              i.y +
              vec4(0.0, i1.y, i2.y, 1.0)
          ) +
            i.x +
            vec4(0.0, i1.x, i2.x, 1.0)
        );

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

        vec4 norm = taylorInvSqrt(
          vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3))
        );
        p0 *= norm.x;
        p1 *= norm.y;
        p2 *= norm.z;
        p3 *= norm.w;

        vec4 m = max(
          0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)),
          0.0
        );
        m = m * m;

        return 42.0 *
          dot(
            m * m,
            vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3))
          );
      }

      vec3 getDisplacedPosition(vec3 baseNormal, float t) {
        vec3 warpedNormal = normalize(baseNormal + snoise(baseNormal * 2.5 + t * 0.5) * 0.25);
        
        vec3 m1 = normalize(vec3(sin(t * 1.2 + uSeed), cos(t * 1.3 + uSeed), sin(t * 0.7)));
        vec3 m2 = normalize(vec3(cos(t * 1.4), sin(t * 1.1 + uSeed), -cos(t * 0.8)));
        vec3 m3 = normalize(vec3(-sin(t * 1.1), -cos(t * 1.5), sin(t * 1.2 + uSeed)));
        vec3 m4 = normalize(vec3(cos(t * 1.3), -sin(t * 1.2), -cos(t * 1.4)));
        vec3 m5 = normalize(vec3(sin(t * 1.5), cos(t * 1.0), -sin(t * 1.1)));
        vec3 m6 = normalize(vec3(-cos(t * 1.2), sin(t * 1.4), cos(t * 1.3)));
        
        float i1 = max(0.0, dot(warpedNormal, m1));
        float i2 = max(0.0, dot(warpedNormal, m2));
        float i3 = max(0.0, dot(warpedNormal, m3));
        float i4 = max(0.0, dot(warpedNormal, m4));
        float i5 = max(0.0, dot(warpedNormal, m5));
        float i6 = max(0.0, dot(warpedNormal, m6));
        
        float sharpness = uLobeCountBias * 1.5;
        i1 = pow(i1, sharpness);
        i2 = pow(i2, sharpness);
        i3 = pow(i3, sharpness);
        i4 = pow(i4, sharpness);
        i5 = pow(i5, sharpness);
        i6 = pow(i6, sharpness);
        
        float pull = i1 + i2 + i3 + i4 + i5 + i6;
        
        float fluidNoise = snoise(baseNormal * 2.0 - t * 0.5) * 0.5 + 0.5;
        float r = 0.68;
        
        r += pull * (uAgitationStrength + uEnergy * 0.3);
        r += fluidNoise * uEdgeRoughness;
        
        // --- NEW AUDIO REACTIVITY ---
        // Kick: Low frequency, large blob-like protrusions
        float kickNoise = snoise(baseNormal * 1.5 - t * 1.2) * 0.5 + 0.5;
        r += kickNoise * uKick * 0.5;

        // Snare: Mid-crack, sharp higher frequency ripples
        float snareNoise = abs(snoise(baseNormal * 8.0 + t * 3.0));
        r += snareNoise * uSnare * 0.25;

        // Custom: Overall spiky agitation (placeholder)
        float customNoise = snoise(baseNormal * 4.0 + t * 5.0);
        r += customNoise * uCustom * 0.3;
        
        // Intensity: Drives overall base scale and agitation (placeholder)
        r += uIntensity * 0.1;
        // ----------------------------

        float pointerPush = dot(baseNormal.xy, uPointer) * 0.15 * (0.5 + uPresence);
        r += pointerPush;
        
        vec3 pos = baseNormal * r * uBaseScale;
        pos.z *= 0.8;
        
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

export class AdvancedAudioMassController {
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
  clock: THREE.Clock;
  frameId: number;
  isDestroyed: boolean;
  handleResize: () => void;

  // Audio Setup
  audioContext: AudioContext | null = null;
  audioElement: HTMLAudioElement | null = null;
  source: MediaElementAudioSourceNode | null = null;
  analyser: AnalyserNode | null = null;
  dataArray: Uint8Array | null = null;
  prevDataArray: Uint8Array | null = null;
  lastAudioTime: number = 0;

  // Timeline / DSP Features (The 4 Pipes)
  kick: number = 0;
  snare: number = 0;
  custom: number = 0;
  intensity: number = 0;

  // Mode Toggle
  useTimeline: boolean = false;
  timelineData: any = null;
  
  // Timeline Indices (Bookmarks for the Player Piano)
  kickIndex: number = 0;
  snareIndex: number = 0;
  customIndex: number = 0;
  intensityIndex: number = 0;

  // Debug Toggles
  enableKick: boolean = false;
  enableSnare: boolean = false;
  enableCustom: boolean = true;
  enableIntensity: boolean = true;

  constructor(container: HTMLElement, options: any = {}) {
    this.container = container;
    this.loadTimelineData();
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
    this.camera.position.set(0, 0, 10.8);

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

    this.clock = new THREE.Clock();
    this.frameId = 0;
    this.isDestroyed = false;

    this.setPreset(this.preset);
    this.resize();

    this.handleResize = () => this.resize();
    window.addEventListener("resize", this.handleResize);

    this.animate = this.animate.bind(this);
    this.frameId = window.requestAnimationFrame(this.animate);
  }

  async loadTimelineData() {
    try {
      const res = await fetch('/data/c6/timeline.json');
      this.timelineData = await res.json();
    } catch (err) {
      console.error("Failed to load timeline data", err);
    }
  }

  async enableAudio() {
    if (this.audioContext) return;
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 2048;
    this.analyser.smoothingTimeConstant = 0.8;
    this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.prevDataArray = new Uint8Array(this.analyser.frequencyBinCount);

    try {
      this.audioElement = new Audio('/ms.mp3');
      this.audioElement.crossOrigin = "anonymous";
      this.audioElement.loop = true;
      
      this.source = this.audioContext.createMediaElementSource(this.audioElement);
      this.source.connect(this.analyser);
      this.analyser.connect(this.audioContext.destination);
      
      await this.audioElement.play();
      this.lastAudioTime = this.audioElement.currentTime;
    } catch (err) {
      console.error("Audio playback failed", err);
    }
  }

  updateAudio() {
    if (!this.audioElement) return;
    const currentTime = this.audioElement.currentTime;
    
    // Handle looping or seeking backwards
    if (currentTime < this.lastAudioTime) {
      this.lastAudioTime = currentTime;
      this.kickIndex = 0;
      this.snareIndex = 0;
      this.customIndex = 0;
      this.intensityIndex = 0;
    }

    if (this.useTimeline && this.timelineData) {
      // --- TIMELINE MODE (Player Piano with Bookmarks) ---
      
      const kicks = this.timelineData.kick || [];
      while (this.kickIndex < kicks.length && kicks[this.kickIndex].time <= currentTime) {
        if (kicks[this.kickIndex].time > this.lastAudioTime) {
          const rawInt = kicks[this.kickIndex].intensity !== undefined ? kicks[this.kickIndex].intensity : 0.5;
          this.kick = Math.log10(1 + 9 * rawInt);
        }
        this.kickIndex++;
      }

      const snares = this.timelineData.snare || [];
      while (this.snareIndex < snares.length && snares[this.snareIndex].time <= currentTime) {
        if (snares[this.snareIndex].time > this.lastAudioTime) {
          const rawInt = snares[this.snareIndex].intensity !== undefined ? snares[this.snareIndex].intensity : 0.5;
          this.snare = Math.log10(1 + 9 * rawInt);
        }
        this.snareIndex++;
      }

      const customs = this.timelineData.custom || [];
      while (this.customIndex < customs.length && customs[this.customIndex].time <= currentTime) {
        if (customs[this.customIndex].time > this.lastAudioTime) {
          const rawInt = customs[this.customIndex].intensity !== undefined ? customs[this.customIndex].intensity : 0.5;
          this.custom = Math.log10(1 + 9 * rawInt);
        }
        this.customIndex++;
      }

      const curves = this.timelineData.intensityCurve || [];
      while (this.intensityIndex < curves.length - 1 && curves[this.intensityIndex + 1].time <= currentTime) {
        this.intensityIndex++;
      }
      if (curves.length > 0) {
        const currentIntensityFrame = curves[this.intensityIndex];
        const rawInt = currentIntensityFrame.value !== undefined ? currentIntensityFrame.value : 0.5;
        const targetInt = Math.log10(1 + 9 * rawInt);
        this.intensity = this.intensity * 0.9 + targetInt * 0.1;
      }

      this.kick *= 0.85;
      this.snare *= 0.80;
      this.custom *= 0.90;
    } else {
      // --- LIVE DSP MODE ---
      if (!this.analyser || !this.dataArray) return;
      this.analyser.getByteFrequencyData(this.dataArray);

      const sampleRate = this.audioContext?.sampleRate || 44100;
      const binSize = sampleRate / this.analyser.fftSize;

      let kickSum = 0, kickCount = 0;
      let snareSum = 0, snareCount = 0;
      let flux = 0;

      for (let i = 0; i < this.dataArray.length; i++) {
        const freq = i * binSize;
        const val = this.dataArray[i] / 255.0;

        if (freq >= 60 && freq <= 120) { kickSum += val; kickCount++; }
        if (freq >= 1000 && freq <= 3000) { snareSum += val; snareCount++; }

        if (this.prevDataArray) {
          const prevVal = this.prevDataArray[i] / 255.0;
          if (val > prevVal) flux += (val - prevVal);
        }
      }

      if (this.prevDataArray) this.prevDataArray.set(this.dataArray);

      const rawKick = kickCount > 0 ? kickSum / kickCount : 0;
      const rawSnare = snareCount > 0 ? snareSum / snareCount : 0;

      if (rawKick > this.kick) this.kick = rawKick;
      else this.kick = this.kick * 0.85 + rawKick * 0.15;

      if (rawSnare > this.snare) this.snare = rawSnare;
      else this.snare = this.snare * 0.8 + rawSnare * 0.2;

      const rawOnset = Math.min(flux / 20.0, 1.0);
      if (rawOnset > this.custom) this.custom = rawOnset;
      else this.custom = this.custom * 0.85 + rawOnset * 0.15;
      
      this.intensity = 0.5; // Default baseline for live mode
    }

    this.lastAudioTime = currentTime;
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
    this.geometry.dispose();
    this.material.dispose();
    this.renderer.dispose();
    this.container.replaceChildren();
    
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.src = '';
    }
    if (this.audioContext) {
      this.audioContext.close();
    }
  }

  animate() {
    if (this.isDestroyed) {
      return;
    }

    const deltaSeconds = Math.min(this.clock.getDelta(), 0.033);
    const elapsed = this.clock.elapsedTime;
    const active = this.activeSpring.update(deltaSeconds);
    const energy = this.energySpring.update(deltaSeconds);
    const pointerX = this.pointerXSpring.update(deltaSeconds);
    const pointerY = this.pointerYSpring.update(deltaSeconds);

    this.pointer.set(pointerX, pointerY);
    this.updateAudio();

    const activeKick = this.enableKick ? this.kick : 0;
    const activeSnare = this.enableSnare ? this.snare : 0;
    const activeCustom = this.enableCustom ? this.custom : 0;
    const activeIntensity = this.enableIntensity ? this.intensity : 0;

    this.material.uniforms.uTime.value = elapsed;
    this.material.uniforms.uEnergy.value = energy;
    this.material.uniforms.uPresence.value = active;
    this.material.uniforms.uPointer.value.copy(this.pointer);
    
    this.material.uniforms.uKick.value = activeKick;
    this.material.uniforms.uSnare.value = activeSnare;
    this.material.uniforms.uCustom.value = activeCustom;
    this.material.uniforms.uIntensity.value = activeIntensity;

    // Scale Zoom mapped to Kick
    const baseScale = 1.05;
    const aspectBias = THREE.MathUtils.clamp((this.renderer.domElement.width / this.renderer.domElement.height - 0.8) * 0.12, -0.08, 0.12);
    const kickZoom = activeKick * 0.25; // Up to 25% larger on kick
    this.massGroup.scale.set(baseScale + aspectBias + kickZoom, 1.0 - aspectBias * 0.32 + kickZoom, 1 + kickZoom);

    this.massGroup.rotation.z = elapsed * 0.5;
    this.massGroup.rotation.y = pointerX * 0.18 + Math.sin(elapsed * 0.3) * 0.2;
    this.massGroup.rotation.x = pointerY * 0.08 + Math.cos(elapsed * 0.4) * 0.2;
    
    this.massGroup.position.y = pointerY * 0.08 + active * 0.06;
    this.massGroup.position.x = pointerX * 0.18;

    this.renderer.render(this.scene, this.camera);
    this.frameId = window.requestAnimationFrame(this.animate);
  }
}
