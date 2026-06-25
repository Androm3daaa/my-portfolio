import * as THREE from 'three';

const ACCENT = 0xe8b84a;
const ACCENT_SECONDARY = 0x5eead4;
const BG = 0x070709;

class HeroScene3D {
  constructor(canvas) {
    this.canvas = canvas;
    this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    this.scrollProgress = 0;
    this.clock = new THREE.Clock();
    this.animated = [];
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(BG, 0);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(BG, 0.045);

    this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    this.camera.position.set(0, 0, 8);

    this.group = new THREE.Group();
    this.scene.add(this.group);

    this._buildLights();
    this._buildParticles();
    this._buildShapes();
    this._buildProfile();
    this._buildRings();

    this._onResize = this._onResize.bind(this);
    this._onPointerMove = this._onPointerMove.bind(this);
    window.addEventListener('resize', this._onResize);
    window.addEventListener('pointermove', this._onPointerMove, { passive: true });

    this._onResize();
    this._animate();
  }

  _buildLights() {
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.35));

    const key = new THREE.PointLight(ACCENT, 2.2, 20);
    key.position.set(4, 3, 5);
    this.scene.add(key);

    const fill = new THREE.PointLight(ACCENT_SECONDARY, 1.4, 18);
    fill.position.set(-4, -2, 4);
    this.scene.add(fill);
  }

  _buildParticles() {
    const count = window.innerWidth < 768 ? 900 : 1800;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const accent = new THREE.Color(ACCENT);
    const secondary = new THREE.Color(ACCENT_SECONDARY);
    const white = new THREE.Color(0xf4f4f5);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const radius = 6 + Math.random() * 14;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi) - 4;

      const mix = Math.random();
      const color = mix < 0.15 ? accent : mix < 0.3 ? secondary : white;
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.035,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    this.particles = new THREE.Points(geometry, material);
    this.group.add(this.particles);
    this.animated.push({
      mesh: this.particles,
      update: (t) => {
        this.particles.rotation.y = t * 0.02;
        this.particles.rotation.x = Math.sin(t * 0.15) * 0.04;
      },
    });
  }

  _buildShapes() {
    const torus = new THREE.Mesh(
      new THREE.TorusKnotGeometry(0.85, 0.22, 120, 16),
      new THREE.MeshStandardMaterial({
        color: ACCENT,
        emissive: ACCENT,
        emissiveIntensity: 0.35,
        metalness: 0.85,
        roughness: 0.25,
        wireframe: true,
        transparent: true,
        opacity: 0.55,
      })
    );
    torus.position.set(-2.4, 0.6, -1.2);
    this.group.add(torus);
    this.animated.push({
      mesh: torus,
      update: (t) => {
        torus.rotation.x = t * 0.35;
        torus.rotation.y = t * 0.5;
      },
    });

    const ico = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.65, 1),
      new THREE.MeshStandardMaterial({
        color: ACCENT_SECONDARY,
        emissive: ACCENT_SECONDARY,
        emissiveIntensity: 0.3,
        metalness: 0.7,
        roughness: 0.3,
        wireframe: true,
        transparent: true,
        opacity: 0.45,
      })
    );
    ico.position.set(2.5, -0.8, -0.6);
    this.group.add(ico);
    this.animated.push({
      mesh: ico,
      update: (t) => {
        ico.rotation.x = -t * 0.4;
        ico.rotation.z = t * 0.55;
      },
    });

    const octa = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.4, 0),
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: ACCENT,
        emissiveIntensity: 0.2,
        metalness: 0.9,
        roughness: 0.15,
        transparent: true,
        opacity: 0.7,
      })
    );
    octa.position.set(1.8, 1.4, 0.4);
    this.group.add(octa);
    this.animated.push({
      mesh: octa,
      update: (t) => {
        octa.position.y = 1.4 + Math.sin(t * 1.2) * 0.15;
        octa.rotation.y = t * 0.8;
      },
    });
  }

  _buildProfile() {
    this.profileGroup = new THREE.Group();
    this.profileGroup.position.set(0, 0, 0.2);
    this.group.add(this.profileGroup);

    const frameGeo = new THREE.PlaneGeometry(2.6, 2.6);
    const frameMat = new THREE.MeshStandardMaterial({
      color: ACCENT,
      emissive: ACCENT,
      emissiveIntensity: 0.15,
      metalness: 0.6,
      roughness: 0.4,
      transparent: true,
      opacity: 0.12,
      side: THREE.DoubleSide,
    });
    const glow = new THREE.Mesh(frameGeo, frameMat);
    glow.position.z = -0.08;
    this.profileGroup.add(glow);

    const loader = new THREE.TextureLoader();
    loader.load(
      'assets/images/profile.jpg',
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        const photo = new THREE.Mesh(
          new THREE.PlaneGeometry(2.2, 2.2),
          new THREE.MeshStandardMaterial({
            map: texture,
            metalness: 0.1,
            roughness: 0.85,
          })
        );
        this.profileGroup.add(photo);
        this.profileMesh = photo;
        document.querySelector('.hero-visual')?.classList.add('hero-visual--3d-ready');
      },
      undefined,
      () => {
        document.querySelector('.hero-visual')?.classList.remove('hero-visual--3d-ready');
      }
    );

    const borderPoints = [];
    const s = 1.15;
    const segments = 32;
    for (let i = 0; i <= segments; i++) {
      const t = (i / segments) * Math.PI * 2;
      borderPoints.push(new THREE.Vector3(Math.cos(t) * s * 1.1, Math.sin(t) * s * 1.1, 0.02));
    }
    const borderGeo = new THREE.BufferGeometry().setFromPoints(borderPoints);
    const border = new THREE.Line(
      borderGeo,
      new THREE.LineBasicMaterial({ color: ACCENT, transparent: true, opacity: 0.6 })
    );
    this.profileGroup.add(border);

    this.animated.push({
      mesh: this.profileGroup,
      update: (t) => {
        this.profileGroup.position.y = Math.sin(t * 0.8) * 0.08;
        this.profileGroup.rotation.y = Math.sin(t * 0.5) * 0.06;
        this.profileGroup.rotation.x = Math.cos(t * 0.4) * 0.04;
      },
    });
  }

  _buildRings() {
    const ringMat = new THREE.MeshBasicMaterial({
      color: ACCENT_SECONDARY,
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide,
    });

    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(1.65, 0.012, 8, 80), ringMat);
    ring1.rotation.x = Math.PI * 0.45;
    this.profileGroup.add(ring1);

    const ring2 = new THREE.Mesh(
      new THREE.TorusGeometry(1.85, 0.008, 8, 80),
      new THREE.MeshBasicMaterial({ color: ACCENT, transparent: true, opacity: 0.2, side: THREE.DoubleSide })
    );
    ring2.rotation.x = Math.PI * 0.55;
    ring2.rotation.y = Math.PI * 0.2;
    this.profileGroup.add(ring2);

    this.animated.push({
      mesh: ring1,
      update: (t) => {
        ring1.rotation.z = t * 0.25;
        ring2.rotation.z = -t * 0.18;
      },
    });
  }

  _onPointerMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    this.mouse.targetX = x * 0.35;
    this.mouse.targetY = y * 0.25;
  }

  _onResize() {
    const parent = this.canvas.parentElement;
    if (!parent) return;

    const width = parent.clientWidth;
    const height = parent.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  }

  setScrollProgress(progress) {
    this.scrollProgress = THREE.MathUtils.clamp(progress, 0, 1);
  }

  _animate() {
    this._raf = requestAnimationFrame(() => this._animate());

    const t = this.clock.getElapsedTime();
    const lerp = this.reducedMotion ? 1 : 0.06;
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * lerp;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * lerp;

    this.group.rotation.y = this.mouse.x * 0.4;
    this.group.rotation.x = this.mouse.y * 0.3;

    const scrollOffset = this.scrollProgress * 2.5;
    this.group.position.y = -scrollOffset;
    this.camera.position.z = 8 - this.scrollProgress * 1.5;

    if (!this.reducedMotion) {
      this.animated.forEach(({ update }) => update(t));
    }

    const opacity = 1 - this.scrollProgress * 0.85;
    this.canvas.style.opacity = String(opacity);

    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    cancelAnimationFrame(this._raf);
    window.removeEventListener('resize', this._onResize);
    window.removeEventListener('pointermove', this._onPointerMove);
    this.renderer.dispose();
  }
}

function init() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return null;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) {
    canvas.closest('.hero-3d')?.classList.add('hero-3d--static');
    return null;
  }

  try {
    const scene = new HeroScene3D(canvas);
    window.HeroScene3D = scene;
    document.body.classList.add('has-3d-hero');
    return scene;
  } catch {
    canvas.closest('.hero-3d')?.classList.add('hero-3d--static');
    return null;
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
