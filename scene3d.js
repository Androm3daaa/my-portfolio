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
    this.scene.fog = new THREE.FogExp2(BG, 0.035);

    this.camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    this.camera.position.set(0, 0, 7.5);

    this.group = new THREE.Group();
    this.scene.add(this.group);

    this._buildLights();
    this._buildParticles();
    this._buildProfile();
    this._buildAccents();

    this._onResize = this._onResize.bind(this);
    this._onPointerMove = this._onPointerMove.bind(this);
    window.addEventListener('resize', this._onResize);
    window.addEventListener('pointermove', this._onPointerMove, { passive: true });

    this._onResize();
    this._animate();
  }

  _buildLights() {
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.45));

    const key = new THREE.PointLight(ACCENT, 1.2, 24);
    key.position.set(3, 2, 6);
    this.scene.add(key);

    const fill = new THREE.PointLight(ACCENT_SECONDARY, 0.7, 20);
    fill.position.set(-3, -1, 5);
    this.scene.add(fill);

    const rim = new THREE.PointLight(0xffffff, 0.35, 16);
    rim.position.set(0, 0, -2);
    this.scene.add(rim);
  }

  _buildParticles() {
    const count = window.innerWidth < 768 ? 280 : 520;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const accent = new THREE.Color(ACCENT);
    const secondary = new THREE.Color(ACCENT_SECONDARY);
    const white = new THREE.Color(0xf4f4f5);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const radius = 8 + Math.random() * 10;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi) - 5;

      const mix = Math.random();
      const color = mix < 0.08 ? accent : mix < 0.16 ? secondary : white;
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.022,
      vertexColors: true,
      transparent: true,
      opacity: 0.45,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    this.particles = new THREE.Points(geometry, material);
    this.group.add(this.particles);
    this.animated.push({
      update: (t) => {
        this.particles.rotation.y = t * 0.012;
      },
    });
  }

  _buildProfile() {
    this.profileGroup = new THREE.Group();
    this.profileGroup.position.set(0, 0, 0);
    this.group.add(this.profileGroup);

    const glow = new THREE.Mesh(
      new THREE.PlaneGeometry(3.4, 3.4),
      new THREE.MeshStandardMaterial({
        color: ACCENT,
        emissive: ACCENT,
        emissiveIntensity: 0.08,
        transparent: true,
        opacity: 0.1,
        side: THREE.DoubleSide,
      })
    );
    glow.position.z = -0.1;
    this.profileGroup.add(glow);

    const loader = new THREE.TextureLoader();
    loader.load(
      'assets/images/profile.jpg',
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        const photo = new THREE.Mesh(
          new THREE.PlaneGeometry(2.85, 2.85),
          new THREE.MeshStandardMaterial({
            map: texture,
            metalness: 0.05,
            roughness: 0.9,
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

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(1.75, 0.006, 8, 96),
      new THREE.MeshBasicMaterial({
        color: ACCENT_SECONDARY,
        transparent: true,
        opacity: 0.18,
        side: THREE.DoubleSide,
      })
    );
    ring.rotation.x = Math.PI * 0.48;
    this.profileGroup.add(ring);
    this.ring = ring;

    this.animated.push({
      update: (t) => {
        this.profileGroup.position.y = Math.sin(t * 0.6) * 0.05;
        this.profileGroup.rotation.y = Math.sin(t * 0.35) * 0.04;
        if (this.ring) this.ring.rotation.z = t * 0.12;
      },
    });
  }

  _buildAccents() {
    const accent = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.32, 0),
      new THREE.MeshStandardMaterial({
        color: ACCENT_SECONDARY,
        emissive: ACCENT_SECONDARY,
        emissiveIntensity: 0.15,
        metalness: 0.6,
        roughness: 0.4,
        wireframe: true,
        transparent: true,
        opacity: 0.22,
      })
    );
    accent.position.set(2.1, 1.3, -1.4);
    this.group.add(accent);
    this.animated.push({
      update: (t) => {
        accent.rotation.x = -t * 0.2;
        accent.rotation.z = t * 0.25;
        accent.position.y = 1.3 + Math.sin(t * 0.8) * 0.08;
      },
    });

    const dot = new THREE.Mesh(
      new THREE.SphereGeometry(0.08, 16, 16),
      new THREE.MeshStandardMaterial({
        color: ACCENT,
        emissive: ACCENT,
        emissiveIntensity: 0.4,
        transparent: true,
        opacity: 0.6,
      })
    );
    dot.position.set(-1.9, -1.5, -0.8);
    this.group.add(dot);
    this.animated.push({
      update: (t) => {
        dot.position.y = -1.5 + Math.sin(t * 1.1 + 1) * 0.1;
      },
    });
  }

  _onPointerMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    this.mouse.targetX = x * 0.2;
    this.mouse.targetY = y * 0.15;
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
    const lerp = this.reducedMotion ? 1 : 0.05;
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * lerp;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * lerp;

    this.group.rotation.y = this.mouse.x * 0.25;
    this.group.rotation.x = this.mouse.y * 0.2;

    const scrollOffset = this.scrollProgress * 2.5;
    this.group.position.y = -scrollOffset;
    this.camera.position.z = 7.5 - this.scrollProgress * 1.5;

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
