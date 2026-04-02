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
      uJarvis: { value: 0.0 }
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
        
        // Combine noises for spiky/loby look
        float displacement = (n1 * 0.6 + n2 * 0.4 * uEdgeRoughness) * currentAgitation;
        
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

export class MorphingMassController {
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

  setPointer(clientX: number, clientY: number) {
    const rect = this.container.getBoundingClientRect();
    // Normalize to -1 to 1
    this.targetPointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    this.targetPointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
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
    
    // Update springs
    this.energySpring.update();
    this.presenceSpring.update();
    
    Object.values(this.springs).forEach(spring => spring.update());
    
    // Smooth pointer follow
    this.pointer.lerp(this.targetPointer, 0.1);
    
    // Update uniforms
    this.material.uniforms.uTime.value = time;
    this.material.uniforms.uEnergy.value = this.energySpring.value;
    this.material.uniforms.uPresence.value = this.presenceSpring.value;
    this.material.uniforms.uPointer.value.copy(this.pointer);
    
    this.material.uniforms.uBaseScale.value = this.springs.baseScale.value;
    this.material.uniforms.uLobeCountBias.value = this.springs.lobeCountBias.value;
    this.material.uniforms.uEdgeRoughness.value = this.springs.edgeRoughness.value;
    this.material.uniforms.uDriftSpeed.value = this.springs.driftSpeed.value;
    this.material.uniforms.uAgitationStrength.value = this.springs.agitationStrength.value;
    this.material.uniforms.uDirectionalBias.value = this.springs.directionalBias.value;
    
    // Gentle rotation
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
  }
  
  private get geometry() {
    return this.mesh.geometry;
  }
}
