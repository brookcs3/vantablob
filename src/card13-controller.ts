import * as THREE from "three";

const DEFAULT_ENERGY = 0.18;
const BASE_PRESET = {
  name: "default-mass",
  seed: 1,
  baseScale: 0.82,
  lobeCountBias: 4.8,
  edgeRoughness: 0.18,
  driftSpeed: 0.62,
  agitationStrength: 0.2,
  directionalBias: 0.72,
  backgroundColor: "#585500",
  fillColor: "#010101"
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
      uVantablack: { value: 0.0 },
      uJarvis: { value: 0.0 },
      uOnset: { value: 0.0 },
      uSnare: { value: 0.0 }
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
      uniform float uSnare;

      vec4 mod289(vec4 x) {
        return x - floor(x * (1.0 / 289.0)) * 289.0;
      }

      float mod289(float x) {
        return x - floor(x * (1.0 / 289.0)) * 289.0;
      }

      vec3 mod289(vec3 x) {
        return x - floor(x * (1.0 / 289.0)) * 289.0;
      }

      vec4 permute(vec4 x) {
        return mod289(((x * 34.0) + 1.0) * x);
      }

      float permute(float x) {
        return mod289(((x * 34.0) + 1.0) * x);
      }

      vec4 taylorInvSqrt(vec4 r) {
        return 1.79284291400159 - 0.85373472095314 * r;
      }

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
        // Warp the normal slightly to make the pulls organic and asymmetrical
        vec3 warpedNormal = normalize(baseNormal + snoise(baseNormal * 2.5 + t * 0.5) * 0.25);
        
        // 5 Orbiting "Magnets" that pull the fluid outward
        vec3 m1 = normalize(vec3(sin(t * 0.8 + uSeed), cos(t * 0.9 + uSeed), sin(t * 0.7)));
        vec3 m2 = normalize(vec3(cos(t * 1.1), sin(t * 0.6 + uSeed), -cos(t * 0.8)));
        vec3 m3 = normalize(vec3(-sin(t * 0.7), -cos(t * 1.2), sin(t * 1.1 + uSeed)));
        vec3 m4 = normalize(vec3(cos(t * 0.9), -sin(t * 0.8), -cos(t * 1.3)));
        vec3 m5 = normalize(vec3(sin(t * 1.3), cos(t * 0.5), -sin(t * 0.9)));
        
        // Calculate influence of each magnet (0 to 1)
        float i1 = max(0.0, dot(warpedNormal, m1));
        float i2 = max(0.0, dot(warpedNormal, m2));
        float i3 = max(0.0, dot(warpedNormal, m3));
        float i4 = max(0.0, dot(warpedNormal, m4));
        float i5 = max(0.0, dot(warpedNormal, m5));
        
        // Sharpen the influence to create distinct lobes/spikes
        float sharpness = uLobeCountBias;
        i1 = pow(i1, sharpness);
        i2 = pow(i2, sharpness);
        i3 = pow(i3, sharpness);
        i4 = pow(i4, sharpness);
        i5 = pow(i5, sharpness);
        
        float pull = i1 + i2 + i3 + i4 + i5;
        
        // Add some general fluid noise to the surface
        float fluidNoise = snoise(baseNormal * 1.5 - t * 0.4) * 0.5 + 0.5;
        
        // Base radius of the sphere
        float r = 0.68;
        
        // Apply the magnet pulls and fluid noise
        r += pull * (uAgitationStrength + uEnergy * 0.2);
        r += fluidNoise * uEdgeRoughness;

        // Onset reactivity — same displacement style as Card 6's uCustom
        float onsetNoise = snoise(baseNormal * 4.0 + t * 5.0);
        r += onsetNoise * uOnset * 0.3;

        // Snare reactivity — placeholder (subtle swell). Sub-animation to be
        // defined later; shader threshold lives here.
        r += uSnare * 0.15;

        // Pointer interaction (pushes the fluid away)
        float pointerPush = dot(baseNormal.xy, uPointer) * 0.15 * (0.5 + uPresence);
        r += pointerPush;
        
        // Apply base scale
        return baseNormal * r * uBaseScale;
      }

      void main() {
        float time = uTime * uDriftSpeed;

        // Get the displaced position for the current vertex
        vec3 pos = getDisplacedPosition(normal, time);

        // Approximate the new normal by sampling nearby points
        // This is CRITICAL for making the lighting look like a real 3D fluid
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

      // Oil Slick Palette
      vec3 oilPalette(float t) {
          return vec3(0.5) + vec3(0.5) * cos(6.28318 * (vec3(1.0, 0.7, 0.4) * t + vec3(0.1, 0.2, 0.3)));
      }

      void main() {
        vec3 normal = normalize(vWorldNormal);
        vec3 viewDirection = normalize(vViewPosition);

        // Base color (very dark)
        vec3 baseColor = uBlobColor;

        // Key light (warm, from top right)
        vec3 lightDir1 = normalize(vec3(1.0, 1.5, 1.0));
        float diff1 = max(dot(normal, lightDir1), 0.0);
        vec3 diffuse1 = diff1 * vec3(0.15, 0.14, 0.13);

        // Fill light (cool, from bottom left)
        vec3 lightDir2 = normalize(vec3(-1.0, -0.5, 0.5));
        float diff2 = max(dot(normal, lightDir2), 0.0);
        vec3 diffuse2 = diff2 * vec3(0.05, 0.06, 0.08);

        // Rim light (sharp, catches the edges of the goop)
        float rimPower = 1.0 - max(dot(normal, viewDirection), 0.0);
        float rim = smoothstep(0.6, 1.0, rimPower);
        vec3 rimColor = rim * vec3(0.15, 0.15, 0.18);

        // Specular highlight (makes it look wet/glossy)
        vec3 halfVector1 = normalize(lightDir1 + viewDirection);
        float spec1 = pow(max(dot(normal, halfVector1), 0.0), 48.0);
        vec3 specular1 = spec1 * vec3(0.3, 0.3, 0.3);

        vec3 finalColor = baseColor + diffuse1 + diffuse2 + rimColor + specular1;
        
        // Vantablack override: pure black silhouette
        finalColor = mix(finalColor, vec3(0.0), uVantablack);

        // Quad Damage / Oil Slick Effect
        if (uJarvis > 0.5) {
            // Quad Damage Blue
            vec3 quadBlue = vec3(0.302, 0.765, 1.0);
            
            // Fresnel rim glow (Quad Damage style)
            float fresnel = pow(1.0 - max(dot(normal, viewDirection), 0.0), 3.0);
            vec3 rimColor = quadBlue * fresnel * 1.5;
            
            // Oil slick iridescence based on viewing angle and time
            float oilFresnel = pow(1.0 - max(dot(normal, viewDirection), 0.0), 1.3);
            vec3 oil = oilPalette(oilFresnel + uTime * 0.2) * 0.8;
            
            // Point light with flicker
            vec3 lightDir = normalize(vec3(0.0, 2.0, 2.0) - vWorldPosition);
            float diff = max(dot(normal, lightDir), 0.0);
            float pointFlicker = 1.0 + fract(sin(uTime * 43.2178) * 4378.5453) * 0.15;
            vec3 lightContrib = quadBlue * diff * 0.4 * pointFlicker;
            
            // Combine: Oil slick base + Quad Damage rim + Flickering light
            finalColor += (oil * oilFresnel) + rimColor + lightContrib;
        }

        gl_FragColor = vec4(finalColor, 1.0);
      }
    `,
    transparent: false
  });
}

export class Card13Controller {
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

  // Audio + onset detection (continuous spectral-flux value — same approach as Card 6)
  audioContext: AudioContext | null = null;
  audioElement: HTMLAudioElement | null = null;
  source: MediaElementAudioSourceNode | null = null;
  analyser: AnalyserNode | null = null;
  dataArray: Uint8Array | null = null;
  prevDataArray: Uint8Array | null = null;
  onset: number = 0; // 0..1, spikes on transients, decays smoothly

  // Snare detection — separate analyser at smoothingTimeConstant=0 for sharper flux.
  // Dual-band flux (180–400 Hz body × 4–8 kHz crack) × notKick gate.
  snareAnalyser: AnalyserNode | null = null;
  snareData: Uint8Array | null = null;
  snarePrev: Uint8Array | null = null;
  snare: number = 0; // 0..1, peak-hold with decay, same envelope as onset

  // Base RGB of the card background, parsed from preset.backgroundColor.
  // Per-frame we lift each channel by `snare * SNARE_BG_LIFT` to pulse on hits.
  bgBaseR: number = 17;
  bgBaseG: number = 17;
  bgBaseB: number = 17;

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
    this.renderer.setClearColor(this.preset.backgroundColor, 0);
    
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
    this.geometry = new THREE.IcosahedronGeometry(0.68, 64);
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
    
    this.renderer.setClearColor(this.preset.backgroundColor, 0);

    // Parse #RRGGBB into cached RGB ints (fallback to dark grey if malformed)
    const hex = (this.preset.backgroundColor || '#111111').replace('#', '');
    if (hex.length === 6) {
      this.bgBaseR = parseInt(hex.slice(0, 2), 16);
      this.bgBaseG = parseInt(hex.slice(2, 4), 16);
      this.bgBaseB = parseInt(hex.slice(4, 6), 16);
    }

    // Update container background color if we want it to match
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

  async enableAudio() {
    if (this.audioContext) return;
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    // Onset analyser — preserved exactly as before (default 0.8 smoothing)
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 2048;
    this.analyser.smoothingTimeConstant = 0.8;
    this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.prevDataArray = new Uint8Array(this.analyser.frequencyBinCount);

    // Snare analyser — smoothingTimeConstant=0 so flux isn't blunted
    this.snareAnalyser = this.audioContext.createAnalyser();
    this.snareAnalyser.fftSize = 2048;
    this.snareAnalyser.smoothingTimeConstant = 0;
    this.snareData = new Uint8Array(this.snareAnalyser.frequencyBinCount);
    this.snarePrev = new Uint8Array(this.snareAnalyser.frequencyBinCount);

    try {
      this.audioElement = new Audio('/songs/softtouch.mp3');
      this.audioElement.crossOrigin = 'anonymous';
      this.audioElement.loop = true;
      this.source = this.audioContext.createMediaElementSource(this.audioElement);
      this.source.connect(this.analyser);
      this.source.connect(this.snareAnalyser); // analyser-only tap, no routing to destination
      this.analyser.connect(this.audioContext.destination);
      await this.audioElement.play();
      console.log('[Card7] audio started');
    } catch (err) {
      console.error('Card7 audio playback failed', err);
    }
  }

  // Continuous spectral-flux onset value (Card 6's approach, exactly).
  // this.onset spikes fast on transients, decays smoothly — no triggers, no cooldowns.
  updateAudio() {
    if (!this.analyser || !this.dataArray || !this.prevDataArray) return;

    this.analyser.getByteFrequencyData(this.dataArray);

    let flux = 0;
    for (let i = 0; i < this.dataArray.length; i++) {
      const val = this.dataArray[i] / 255.0;
      const prev = this.prevDataArray[i] / 255.0;
      if (val > prev) flux += (val - prev);
    }
    this.prevDataArray.set(this.dataArray);

    const rawOnset = Math.min(flux / 20.0, 1.0);
    if (rawOnset > this.onset) this.onset = rawOnset;
    else this.onset = this.onset * 0.85 + rawOnset * 0.15;

    // --- Snare: dual-band flux × notKick gate (Approach 3) ---
    // Bins for fftSize=2048 @ 44.1kHz (binΔ ≈ 21.53 Hz):
    //   LOW reject 0–6   (<150 Hz)   — kick territory
    //   BODY       8–18  (172–409 Hz) — snare shell fundamental
    //   CRACK      185–371 (3983–7988 Hz) — snare wire noise
    if (this.snareAnalyser && this.snareData && this.snarePrev) {
      this.snareAnalyser.getByteFrequencyData(this.snareData);

      const LOW_HI = 7;
      const BODY_LO = 8, BODY_HI = 19;
      const CRACK_LO = 185, CRACK_HI = 372;
      const EPS = 1e-6;

      let bodyFlux = 0, crackFlux = 0, lowE = 0, totalE = 0;
      for (let i = 0; i < this.snareData.length; i++) {
        const v = this.snareData[i] / 255.0;
        totalE += v;
        if (i < LOW_HI) lowE += v;
        if (i >= BODY_LO && i < BODY_HI) {
          const d = v - this.snarePrev[i] / 255.0;
          if (d > 0) bodyFlux += d;
        }
        if (i >= CRACK_LO && i < CRACK_HI) {
          const d = v - this.snarePrev[i] / 255.0;
          if (d > 0) crackFlux += d;
        }
      }
      this.snarePrev.set(this.snareData);

      const bodyNorm = Math.min(bodyFlux / 4.0, 1.0);
      const crackNorm = Math.min(crackFlux / 12.0, 1.0);
      const notKick = 1 - Math.min(lowE / (totalE + EPS), 1);
      const rawSnare = bodyNorm * crackNorm * notKick;

      if (rawSnare > this.snare) this.snare = rawSnare;
      else this.snare = this.snare * 0.85 + rawSnare * 0.15;
    }
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

    this.updateAudio();
    this.material.uniforms.uOnset.value = this.onset;
    this.material.uniforms.uSnare.value = this.snare;

    // Snare → slight lift on card background color (subtle ambient pulse)
    if (this.container.parentElement) {
      const SNARE_BG_LIFT = 25; // max added to each channel on a full-intensity snare
      const lift = this.snare * SNARE_BG_LIFT;
      const r = Math.min(255, Math.round(this.bgBaseR + lift));
      const g = Math.min(255, Math.round(this.bgBaseG + lift));
      const b = Math.min(255, Math.round(this.bgBaseB + lift));
      this.container.parentElement.style.backgroundColor = `rgb(${r},${g},${b})`;
    }

    const active = this.activeSpring.update(deltaSeconds);
    const energy = this.energySpring.update(deltaSeconds);
    const pointerX = this.pointerXSpring.update(deltaSeconds);
    const pointerY = this.pointerYSpring.update(deltaSeconds);

    this.pointer.set(pointerX, pointerY);

    this.material.uniforms.uTime.value = elapsed;
    this.material.uniforms.uEnergy.value = energy;
    this.material.uniforms.uPresence.value = active;
    this.material.uniforms.uPointer.value.copy(this.pointer);

    this.massGroup.rotation.y = pointerX * 0.18 + active * 0.05;
    this.massGroup.rotation.x = pointerY * 0.08 - 0.08 - active * 0.02;
    this.massGroup.position.y = pointerY * 0.08 + active * 0.06;
    this.massGroup.position.x = pointerX * 0.18;

    this.renderer.render(this.scene, this.camera);
    this.frameId = window.requestAnimationFrame(this.animate);
  }
}
