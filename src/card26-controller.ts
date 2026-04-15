import * as THREE from 'three';
import { MassPreset } from './mass-presets';

const BASE_PRESET: MassPreset = {
  name: "Base",
  fillColor: "#000000",
  backgroundColor: "#ffffff",
  baseScale: 1.0,
  lobeCountBias: 4.0,
  edgeRoughness: 0.5,
  driftSpeed: 0.3,
  agitationStrength: 0.5,
  directionalBias: 0.0,
  seed: 0.0
};

const DEFAULT_ENERGY = 0.18;

// Simple spring physics for smooth transitions
class Spring {
  value: number;
  target: number;
  velocity: number;
  tension: number;
  friction: number;

  constructor(initialValue: number, tension = 0.1, friction = 0.8) {
    this.value = initialValue;
    this.target = initialValue;
    this.velocity = 0;
    this.tension = tension;
    this.friction = friction;
  }

  setTarget(target: number) {
    this.target = target;
  }

  update() {
    const d = (this.target - this.value) * this.tension;
    this.velocity += d;
    this.velocity *= this.friction;
    this.value += this.velocity;
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
      uniform float uDirectionalBias;
      uniform float uSnare;

      // Simplex 3D Noise
      vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
      vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

      float snoise(vec3 v){ 
        const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
        const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

        vec3 i  = floor(v + dot(v, C.yyy) );
        vec3 x0 = v - i + dot(i, C.xxx) ;

        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min( g.xyz, l.zxy );
        vec3 i2 = max( g.xyz, l.zxy );

        vec3 x1 = x0 - i1 + 1.0 * C.xxx;
        vec3 x2 = x0 - i2 + 2.0 * C.xxx;
        vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;

        i = mod(i, 289.0 ); 
        vec4 p = permute( permute( permute( 
                   i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
                 + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
                 + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

        float n_ = 1.0/7.0;
        vec3  ns = n_ * D.wyz - D.xzx;

        vec4 j = p - 49.0 * floor(p * ns.z *ns.z);

        vec4 x_ = floor(j * ns.z);
        vec4 y_ = floor(j - 7.0 * x_ );

        vec4 x = x_ *ns.x + ns.yyyy;
        vec4 y = y_ *ns.x + ns.yyyy;
        vec4 h = 1.0 - abs(x) - abs(y);

        vec4 b0 = vec4( x.xy, y.xy );
        vec4 b1 = vec4( x.zw, y.zw );

        vec4 s0 = floor(b0)*2.0 + 1.0;
        vec4 s1 = floor(b1)*2.0 + 1.0;
        vec4 sh = -step(h, vec4(0.0));

        vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
        vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

        vec3 p0 = vec3(a0.xy,h.x);
        vec3 p1 = vec3(a0.zw,h.y);
        vec3 p2 = vec3(a1.xy,h.z);
        vec3 p3 = vec3(a1.zw,h.w);

        vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
        p0 *= norm.x;
        p1 *= norm.y;
        p2 *= norm.z;
        p3 *= norm.w;

        vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
        m = m * m;
        return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                      dot(p2,x2), dot(p3,x3) ) );
      }

      void main() {
        vec3 pos = position;
        
        // Base drift
        float t = uTime * uDriftSpeed + uSeed;
        
        // Pointer interaction
        vec3 pointerPos = vec3(uPointer.x * 5.0, uPointer.y * 5.0, 0.0);
        float distToPointer = distance(pos, pointerPos);
        
        // Magnetic pull towards pointer
        float pullStrength = smoothstep(4.0, 0.0, distToPointer) * uPresence * 0.5;
        vec3 pullDir = normalize(pointerPos - pos);
        
        // Apply pull
        pos += pullDir * pullStrength;

        // Complex noise for ferrofluid-like spikes and lobes
        float noiseFreq1 = uLobeCountBias;
        float noiseFreq2 = uLobeCountBias * 2.5;
        
        // Agitation increases with energy and presence
        float currentAgitation = uAgitationStrength * (1.0 + uEnergy * 2.0 + uPresence);
        
        vec3 noisePos1 = pos * noiseFreq1 + vec3(t, t * 0.8, t * 1.2);
        vec3 noisePos2 = pos * noiseFreq2 - vec3(t * 1.5, t, t * 0.5);
        
        float n1 = snoise(noisePos1);
        float n2 = snoise(noisePos2);
        
        // Combine noises for spiky/loby look.
        // Variant C: snare enters shader directly (not spring-smoothed) — sharpens n2 on hits.
        // Kick/onset/intensity are handled in JS by modulating uBaseScale/uAgitation/uDriftSpeed via springs.
        float edgeBoost = uEdgeRoughness * (1.0 + uSnare * 1.6);
        float displacement = (n1 * 0.6 + n2 * 0.4 * edgeBoost) * currentAgitation;
        
        // Directional bias (e.g., gravity or flow)
        displacement += pos.y * uDirectionalBias * 0.2;

        // Apply displacement along normal
        pos += normal * displacement * uBaseScale;

        // Recalculate normal (approximate)
        float eps = 0.01;
        vec3 posU = position + vec3(eps, 0.0, 0.0);
        vec3 posV = position + vec3(0.0, eps, 0.0);
        
        // Apply same displacement to neighbors to find new normal
        float n1U = snoise(posU * noiseFreq1 + vec3(t, t * 0.8, t * 1.2));
        float n2U = snoise(posU * noiseFreq2 - vec3(t * 1.5, t, t * 0.5));
        float dU = (n1U * 0.6 + n2U * 0.4 * uEdgeRoughness) * currentAgitation + posU.y * uDirectionalBias * 0.2;
        posU += vec3(1.0, 0.0, 0.0) * dU * uBaseScale; // simplified normal

        float n1V = snoise(posV * noiseFreq1 + vec3(t, t * 0.8, t * 1.2));
        float n2V = snoise(posV * noiseFreq2 - vec3(t * 1.5, t, t * 0.5));
        float dV = (n1V * 0.6 + n2V * 0.4 * uEdgeRoughness) * currentAgitation + posV.y * uDirectionalBias * 0.2;
        posV += vec3(0.0, 1.0, 0.0) * dV * uBaseScale; // simplified normal

        vec3 newNormal = normalize(cross(posU - pos, posV - pos));
        // Blend with original normal to soften
        newNormal = normalize(mix(normal, newNormal, 0.8));

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
            vec3 quadRimColor = quadBlue * fresnel * 1.5;
            
            // Oil slick iridescence based on viewing angle and time
            float oilFresnel = pow(1.0 - max(dot(normal, viewDirection), 0.0), 1.3);
            vec3 oil = oilPalette(oilFresnel + uTime * 0.2) * 0.8;
            
            // Point light with flicker
            vec3 lightDir = normalize(vec3(0.0, 2.0, 2.0) - vWorldPosition);
            float diff = max(dot(normal, lightDir), 0.0);
            float pointFlicker = 1.0 + fract(sin(uTime * 43.2178) * 4378.5453) * 0.15;
            vec3 lightContrib = quadBlue * diff * 0.4 * pointFlicker;
            
            // Combine: Oil slick base + Quad Damage rim + Flickering light
            finalColor += (oil * oilFresnel) + quadRimColor + lightContrib;
        }

        gl_FragColor = vec4(finalColor, 1.0);
      }
    `,
    transparent: true,
  });
}

export class Card26Controller {
  private container: HTMLElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private mesh: THREE.Mesh;
  private material: THREE.ShaderMaterial;
  
  private energySpring = new Spring(DEFAULT_ENERGY, 0.1, 0.8);
  private presenceSpring = new Spring(0, 0.05, 0.9);
  
  private pointer = new THREE.Vector2(0, 0);
  private targetPointer = new THREE.Vector2(0, 0);
  
  private clock = new THREE.Clock();
  private animationFrameId: number | null = null;
  private resizeObserver: ResizeObserver;

  // Preset springs
  private springs = {
    baseScale: new Spring(BASE_PRESET.baseScale, 0.05, 0.8),
    lobeCountBias: new Spring(BASE_PRESET.lobeCountBias, 0.05, 0.8),
    edgeRoughness: new Spring(BASE_PRESET.edgeRoughness, 0.05, 0.8),
    driftSpeed: new Spring(BASE_PRESET.driftSpeed, 0.05, 0.8),
    agitationStrength: new Spring(BASE_PRESET.agitationStrength, 0.05, 0.8),
    directionalBias: new Spring(BASE_PRESET.directionalBias, 0.05, 0.8),
  };

  // ─── Audio analysers (dual, from Card 7 pattern) ───
  // Variant C: kick/onset/intensity go through springs (slow stuff); snare goes direct to shader.
  audioContext: AudioContext | null = null;
  audioElement: HTMLAudioElement | null = null;
  source: MediaElementAudioSourceNode | null = null;
  analyser: AnalyserNode | null = null;
  dataArray: Uint8Array | null = null;
  prevDataArray: Uint8Array | null = null;
  snareAnalyser: AnalyserNode | null = null;
  snareData: Uint8Array | null = null;
  snarePrev: Uint8Array | null = null;

  kick: number = 0;
  snare: number = 0;
  onset: number = 0;
  intensity: number = 0;

  private audioSprings = {
    kick: new Spring(0, 0.25, 0.75),       // swell → baseScale (physics-smoothed)
    onset: new Spring(0, 0.20, 0.80),      // agitation → agitationStrength (physics-smoothed)
    intensity: new Spring(0, 0.10, 0.88),  // tempo bias → driftSpeed (physics-smoothed)
  };
  // NOTE: no snareSpring — snare goes straight to uSnare uniform for snap.

  constructor(container: HTMLElement, options: { preset?: MassPreset } = {}) {
    this.container = container;
    
    // Setup Scene
    this.scene = new THREE.Scene();
    
    // Setup Camera
    const rect = container.getBoundingClientRect();
    this.camera = new THREE.PerspectiveCamera(45, rect.width / rect.height, 0.1, 100);
    this.camera.position.z = 6;
    
    // Setup Renderer
    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    this.renderer.setSize(rect.width, rect.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(this.renderer.domElement);
    
    // Setup Mesh
    const geometry = new THREE.IcosahedronGeometry(1.5, 64);
    this.material = createMassMaterial();
    this.mesh = new THREE.Mesh(geometry, this.material);
    this.scene.add(this.mesh);
    
    // Handle Resize
    this.resizeObserver = new ResizeObserver(() => this.handleResize());
    this.resizeObserver.observe(container);
    
    if (options.preset) {
      this.setPreset(options.preset, true);
    }

    // Start Loop
    this.animate();
  }

  setPreset(preset: MassPreset, immediate = false) {
    this.springs.baseScale.setTarget(preset.baseScale);
    this.springs.lobeCountBias.setTarget(preset.lobeCountBias);
    this.springs.edgeRoughness.setTarget(preset.edgeRoughness);
    this.springs.driftSpeed.setTarget(preset.driftSpeed);
    this.springs.agitationStrength.setTarget(preset.agitationStrength);
    this.springs.directionalBias.setTarget(preset.directionalBias);
    
    if (immediate) {
      Object.values(this.springs).forEach(spring => {
        spring.value = spring.target;
      });
    }
    
    this.material.uniforms.uSeed.value = preset.seed;
    this.material.uniforms.uBlobColor.value.set(preset.fillColor);
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

  setActive(active: boolean) {
    this.presenceSpring.setTarget(active ? 1 : 0);
  }

  async enableAudio() {
    if (this.audioContext) return;
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 2048;
    this.analyser.smoothingTimeConstant = 0.8;
    this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.prevDataArray = new Uint8Array(this.analyser.frequencyBinCount);

    this.snareAnalyser = this.audioContext.createAnalyser();
    this.snareAnalyser.fftSize = 2048;
    this.snareAnalyser.smoothingTimeConstant = 0;
    this.snareData = new Uint8Array(this.snareAnalyser.frequencyBinCount);
    this.snarePrev = new Uint8Array(this.snareAnalyser.frequencyBinCount);

    try {
      this.audioElement = new Audio('/ms.mp3');
      this.audioElement.crossOrigin = 'anonymous';
      this.audioElement.loop = true;
      this.source = this.audioContext.createMediaElementSource(this.audioElement);
      this.source.connect(this.analyser);
      this.source.connect(this.snareAnalyser);
      this.analyser.connect(this.audioContext.destination);
      await this.audioElement.play();
      console.log('[Card26] audio started — variant C (hybrid)');
    } catch (err) {
      console.error('Card26 audio playback failed', err);
    }
  }

  private updateAudio() {
    if (!this.analyser || !this.dataArray || !this.prevDataArray) return;

    this.analyser.getByteFrequencyData(this.dataArray);

    let flux = 0, totalE = 0, kickE = 0;
    const KICK_HI = 7;
    for (let i = 0; i < this.dataArray.length; i++) {
      const val = this.dataArray[i] / 255.0;
      const prev = this.prevDataArray[i] / 255.0;
      totalE += val;
      if (i < KICK_HI) kickE += val;
      if (val > prev) flux += (val - prev);
    }
    this.prevDataArray.set(this.dataArray);

    const rawOnset = Math.min(flux / 20.0, 1.0);
    if (rawOnset > this.onset) this.onset = rawOnset;
    else this.onset = this.onset * 0.85 + rawOnset * 0.15;

    const rawKick = Math.min(kickE / KICK_HI, 1.0);
    if (rawKick > this.kick) this.kick = rawKick;
    else this.kick = this.kick * 0.82 + rawKick * 0.18;

    const rawIntensity = Math.min(totalE / this.dataArray.length, 1.0);
    this.intensity = this.intensity * 0.92 + rawIntensity * 0.08;

    if (this.snareAnalyser && this.snareData && this.snarePrev) {
      this.snareAnalyser.getByteFrequencyData(this.snareData);

      const LOW_HI = 7;
      const BODY_LO = 8, BODY_HI = 19;
      const CRACK_LO = 185, CRACK_HI = 372;
      const EPS = 1e-6;

      let bodyFlux = 0, crackFlux = 0, lowE = 0, totalE2 = 0;
      for (let i = 0; i < this.snareData.length; i++) {
        const v = this.snareData[i] / 255.0;
        totalE2 += v;
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
      const notKick = 1 - Math.min(lowE / (totalE2 + EPS), 1);
      const rawSnare = bodyNorm * crackNorm * notKick;

      if (rawSnare > this.snare) this.snare = rawSnare;
      else this.snare = this.snare * 0.85 + rawSnare * 0.15;
    }
  }

  setPointer(clientX: number, clientY: number) {
    const rect = this.container.getBoundingClientRect();
    // Normalize to -1 to 1
    this.targetPointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    this.targetPointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
  }

  resetPointer() {
    this.targetPointer.x = 0;
    this.targetPointer.y = 0;
  }

  private handleResize() {
    const rect = this.container.getBoundingClientRect();
    this.camera.aspect = rect.width / rect.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(rect.width, rect.height);
  }

  private animate = () => {
    this.animationFrameId = requestAnimationFrame(this.animate);

    const time = this.clock.getElapsedTime();

    // Read audio pipes
    this.updateAudio();

    // Variant C: feed kick/onset/intensity to audio springs; snare bypasses
    this.audioSprings.kick.setTarget(this.kick);
    this.audioSprings.onset.setTarget(this.onset);
    this.audioSprings.intensity.setTarget(this.intensity);
    Object.values(this.audioSprings).forEach(s => s.update());

    // Base springs
    this.energySpring.update();
    this.presenceSpring.update();
    Object.values(this.springs).forEach(spring => spring.update());

    this.pointer.lerp(this.targetPointer, 0.1);

    // Base uniforms
    this.material.uniforms.uTime.value = time;
    this.material.uniforms.uEnergy.value = this.energySpring.value;
    this.material.uniforms.uPresence.value = this.presenceSpring.value;
    this.material.uniforms.uPointer.value.copy(this.pointer);

    // Audio-modulated preset uniforms (slow audio via springs)
    this.material.uniforms.uBaseScale.value = this.springs.baseScale.value * (1 + this.audioSprings.kick.value * 0.45);
    this.material.uniforms.uLobeCountBias.value = this.springs.lobeCountBias.value;
    this.material.uniforms.uEdgeRoughness.value = this.springs.edgeRoughness.value;
    this.material.uniforms.uDriftSpeed.value = this.springs.driftSpeed.value * (1 + this.audioSprings.intensity.value * 0.6);
    this.material.uniforms.uAgitationStrength.value = this.springs.agitationStrength.value * (1 + this.audioSprings.onset.value * 1.2);
    this.material.uniforms.uDirectionalBias.value = this.springs.directionalBias.value;

    // Snare bypasses springs → sharp hit response in shader
    this.material.uniforms.uSnare.value = this.snare;

    this.mesh.rotation.y = time * 0.1;
    this.mesh.rotation.z = time * 0.05;

    this.renderer.render(this.scene, this.camera);
  };

  destroy() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.resizeObserver.disconnect();
    this.geometry?.dispose();
    this.material.dispose();
    this.renderer.dispose();
    this.container.removeChild(this.renderer.domElement);

    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.src = '';
    }
    if (this.audioContext) {
      this.audioContext.close();
    }
  }
  
  private get geometry() {
    return this.mesh.geometry;
  }
}
