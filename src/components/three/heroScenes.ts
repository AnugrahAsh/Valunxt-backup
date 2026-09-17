/**
 * The four hand-modeled hero scenes (20260917), one per distinct banner in
 * HomeAeBody's hero slider (banners/uae-slider-1..4.webp — see region.ts for
 * which service takes which). Each is a real 3D rebuild of what its render
 * shows — twisted vertical blades, glass dishes over blurred light rings,
 * glowing-edged sheets, soft folded petals — composed in world units mapped
 * from the image's own coordinates, so the framing matches at 16:9 and
 * anchors sensibly at any other aspect.
 *
 * HeroAbstractCanvas.tsx owns the renderer, resize and render loop; each
 * builder returns the scene, its camera, a per-frame update and a dispose.
 */
import * as THREE from 'three';

export type HeroVariant = 'flute' | 'terrain' | 'rings' | 'waves';

export interface HeroScene {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  /** Runs every frame. `t` is seconds since the scene was built. */
  update: (t: number, delta: number) => void;
  /** Frees geometries and materials the builder made. The canvas disposes
      the renderer itself. */
  dispose: () => void;
}

const Y_AXIS = new THREE.Vector3(0, 1, 0);

/** A hex colour handed to a custom shader as-is. These shaders write
    gl_FragColor straight to the canvas with no output colour-space
    conversion, so the usual sRGB-to-linear decode of `new THREE.Color(hex)`
    would come out visibly darker and more saturated than the hex says. */
function raw(hex: string): THREE.Color {
  return new THREE.Color().setStyle(hex, THREE.LinearSRGBColorSpace);
}

/** Half the visible world width at `dist` in front of the camera. */
function halfWidth(camera: THREE.PerspectiveCamera, dist: number): number {
  return Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * dist * camera.aspect;
}

/** Collects everything a builder creates so dispose() is one call. */
function tracker() {
  const items: { dispose: () => void }[] = [];
  return {
    add<T extends { dispose: () => void }>(x: T): T {
      items.push(x);
      return x;
    },
    dispose() {
      for (const x of items) x.dispose();
    },
  };
}

/* ==========================================================================
   FLUTE — banners/uae-slider-3.webp.
   A wall of vertical blades, each twisting about its own axis. Below a wave
   line the blades face the light (bright cyan); above it they turn edge-on
   (navy). The twist happens over a short stretch of each blade, and that
   turning edge seen in perspective is the curved "hook" the render shows on
   every slat. The wave line travels, so the lit region rolls across.
   ========================================================================== */
function buildFluteScene(): HeroScene {
  const bin = tracker();
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#00004e');
  const camera = new THREE.PerspectiveCamera(38, 16 / 9, 0.1, 50);
  const DIST = 9;
  camera.position.set(0, 0, DIST);

  const SPACING = 0.3;
  const COUNT = 110;
  const HEIGHT = 9;

  const base = bin.add(new THREE.PlaneGeometry(SPACING * 1.5, HEIGHT, 1, 72));
  const geometry = bin.add(new THREE.InstancedBufferGeometry());
  geometry.index = base.index;
  geometry.setAttribute('position', base.getAttribute('position'));
  geometry.setAttribute('uv', base.getAttribute('uv'));
  const centers = new Float32Array(COUNT);
  for (let i = 0; i < COUNT; i++) centers[i] = (i - (COUNT - 1) / 2) * SPACING;
  geometry.setAttribute('aCenter', new THREE.InstancedBufferAttribute(centers, 1));
  geometry.instanceCount = COUNT;

  const material = bin.add(
    new THREE.ShaderMaterial({
      side: THREE.DoubleSide,
      uniforms: {
        uTime: { value: 0 },
        uHalfW: { value: 5.5 },
        uHeight: { value: HEIGHT },
      },
      vertexShader: `
        attribute float aCenter;
        uniform float uTime;
        uniform float uHalfW;
        uniform float uHeight;
        varying float vNdl;
        varying float vU;
        varying float vY;
        void main() {
          float cx = aCenter / uHalfW * 0.5 + 0.5;
          float y01 = position.y / uHeight * 1.45 + 0.5;
          float b = 0.47 + 0.18 * sin(6.0 * cx - 0.9 + uTime * 0.22)
                         + 0.035 * sin(13.0 * cx + uTime * 0.37);
          float thMax = mix(0.86, 0.5, smoothstep(0.6, 1.0, cx));
          float th = thMax * smoothstep(b - 0.03, b + 0.15, y01);
          th += 0.06 * sin(uTime * 0.3 + cx * 9.0) * smoothstep(b, b + 0.4, y01);
          float c = cos(th);
          float s = sin(th);
          /* Blades are 1.5 spacings wide and each sits a hair behind its left
             neighbour, so the wall has no gaps flat or twisted. */
          vec3 p = vec3(position.x * c + aCenter, position.y, -position.x * s - aCenter * 0.002);
          vec3 n = vec3(s, 0.0, c);
          vec3 l = normalize(vec3(-0.66, 0.0, 0.75));
          vNdl = dot(n, l) / 0.75;
          vU = clamp((uv.x - 0.333) / 0.667, 0.0, 1.0);
          vY = y01;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }
      `,
      fragmentShader: `
        varying float vNdl;
        varying float vU;
        varying float vY;
        void main() {
          vec3 dark = vec3(0.0, 0.0, 0.42);
          vec3 mid = vec3(0.0, 0.15, 0.86);
          vec3 bright = vec3(0.03, 0.56, 1.0);
          float d = clamp(vNdl, 0.0, 1.0);
          vec3 col = mix(dark, mid, smoothstep(0.0, 0.45, d));
          col = mix(col, bright, smoothstep(0.5, 0.92, d));
          col *= 1.0 - 0.30 * vU;
          col *= 1.0 - 0.55 * smoothstep(0.9, 1.0, vU);
          col += mid * 0.35 * smoothstep(0.1, 0.0, vU) * (1.0 - d);
          col += bright * 0.07 * (1.0 - clamp(vY, 0.0, 1.0));
          col *= mix(0.78, 1.0, smoothstep(1.05, 0.45, vY));
          gl_FragColor = vec4(col, 1.0);
        }
      `,
    }),
  );

  const mesh = new THREE.Mesh(geometry, material);
  mesh.frustumCulled = false;
  scene.add(mesh);

  return {
    scene,
    camera,
    update(t) {
      material.uniforms.uTime.value = t;
      material.uniforms.uHalfW.value = Math.max(halfWidth(camera, DIST), 2.2);
    },
    dispose: bin.dispose,
  };
}

/* ==========================================================================
   RINGS — banners/uae-slider-1.webp.
   Glass dishes in the upper right, tilted toward the viewer, over a set of
   large out-of-focus light rings, with two defocused light bars on the left.
   "Out of focus" is a view-angle falloff on the tubes (bright core, edges
   fading to nothing) rather than a blur pass. The group is anchored to the
   right edge of the frame, the bars to the left, at any aspect.
   ========================================================================== */
function buildRingsScene(): HeroScene {
  const bin = tracker();
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#000070');
  const camera = new THREE.PerspectiveCamera(35, 16 / 9, 0.1, 60);
  const DIST = 10;
  camera.position.set(0, 0, DIST);
  const REF_HALF_W = 5.6;

  const softMat = (color: string, power: number, alpha: number, fade = 0) =>
    bin.add(
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        uniforms: {
          uColor: { value: raw(color) },
          uPower: { value: power },
          uAlpha: { value: alpha },
          uFade: { value: fade },
        },
        vertexShader: `
          varying vec3 vN;
          varying vec3 vV;
          varying float vAlong;
          void main() {
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            vN = normalize(normalMatrix * normal);
            vV = normalize(-mv.xyz);
            vAlong = uv.y;
            gl_Position = projectionMatrix * mv;
          }
        `,
        fragmentShader: `
          uniform vec3 uColor;
          uniform float uPower;
          uniform float uAlpha;
          uniform float uFade;
          varying vec3 vN;
          varying vec3 vV;
          varying float vAlong;
          void main() {
            float f = abs(dot(normalize(vN), normalize(vV)));
            float a = pow(f, uPower) * uAlpha;
            a *= mix(1.0, smoothstep(1.0, 0.0, vAlong) * 0.9 + 0.1, uFade);
            gl_FragColor = vec4(uColor * (0.75 + 0.6 * f), a);
          }
        `,
      }),
    );

  const glassMat = bin.add(
    new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      uniforms: { uTime: { value: 0 }, uRadius: { value: 2.5 } },
      vertexShader: `
        uniform float uRadius;
        varying vec3 vN;
        varying vec3 vV;
        varying float vGrad;
        void main() {
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          vN = normalize(normalMatrix * normal);
          vV = normalize(-mv.xyz);
          vGrad = position.x / uRadius * 0.5 + 0.5;
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: `
        uniform float uTime;
        varying vec3 vN;
        varying vec3 vV;
        varying float vGrad;
        void main() {
          float f = 1.0 - abs(dot(normalize(vN), normalize(vV)));
          float rim = pow(f, 2.2);
          float sweep = 0.5 + 0.5 * sin(uTime * 0.35 + vGrad * 3.0);
          vec3 face = mix(vec3(0.0, 0.07, 0.56), vec3(0.06, 0.40, 0.98), vGrad * 0.8 + sweep * 0.2);
          vec3 col = mix(face, vec3(0.25, 0.7, 1.0), rim);
          gl_FragColor = vec4(col, 0.70 + 0.3 * rim);
        }
      `,
    }),
  );

  const right = new THREE.Group();
  scene.add(right);

  /* Tilt shared by both dishes: face toward the camera, then leaned back
     about the ellipse's long axis so the near rim is the lower one. */
  const dishTilt = (lean: number, axisDeg: number) => {
    const face = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2);
    const a = THREE.MathUtils.degToRad(axisDeg);
    const tilt = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(Math.cos(a), Math.sin(a), 0), lean);
    return tilt.multiply(face);
  };

  const dish = new THREE.Group();
  dish.position.set(2.74, 1.26, 0.6);
  dish.quaternion.copy(dishTilt(-0.73, 24));
  right.add(dish);
  const dishBaseQ = dish.quaternion.clone();

  const R = 2.5;
  const body = new THREE.Mesh(bin.add(new THREE.CylinderGeometry(R, R, 0.34, 96, 1, false)), glassMat);
  dish.add(body);
  const rimSharp = softMat('#48a8ff', 0.7, 0.85);
  for (const [y, r, tube] of [
    [0.17, R, 0.035],
    [-0.17, R, 0.03],
    [0.18, R * 0.8, 0.02],
  ] as const) {
    const ring = new THREE.Mesh(bin.add(new THREE.TorusGeometry(r, tube, 12, 160)), rimSharp);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = y;
    dish.add(ring);
  }

  const dish2 = new THREE.Group();
  dish2.position.set(3.75, -0.85, 0.2);
  dish2.quaternion.copy(dishTilt(-0.85, 12));
  right.add(dish2);
  const dish2BaseQ = dish2.quaternion.clone();
  const rim2Mat = softMat('#3aa0ff', 0.8, 0.9);
  for (const [y, tube] of [
    [0.0, 0.05],
    [-0.3, 0.035],
  ] as const) {
    const ring = new THREE.Mesh(bin.add(new THREE.TorusGeometry(2.45, tube, 12, 160)), rim2Mat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = y;
    dish2.add(ring);
  }

  const glowMat = bin.add(
    new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uAlpha: { value: 0.55 } },
      vertexShader: `
        varying vec2 vUv;
        void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
      `,
      fragmentShader: `
        uniform float uAlpha;
        varying vec2 vUv;
        void main() {
          float d = distance(vUv, vec2(0.5)) * 2.0;
          float a = pow(1.0 - clamp(d, 0.0, 1.0), 2.0) * uAlpha;
          gl_FragColor = vec4(vec3(0.05, 0.55, 1.0) * a, a);
        }
      `,
    }),
  );
  const glow = new THREE.Mesh(bin.add(new THREE.PlaneGeometry(3.4, 4.2)), glowMat);
  glow.position.set(3.0, -1.0, -0.4);
  right.add(glow);

  const halo = new THREE.Group();
  halo.position.set(3.36, -1.9, -1.2);
  halo.rotation.set(0.3, -0.28, 0);
  right.add(halo);
  const haloRings: { mesh: THREE.Mesh; mat: THREE.ShaderMaterial; alpha: number }[] = [];
  for (const [r, tube, alpha] of [
    [5.65, 0.2, 0.62],
    [3.8, 0.15, 0.7],
    [2.65, 0.13, 0.78],
  ] as const) {
    const mat = softMat('#0f86ff', 1.6, alpha);
    const mesh = new THREE.Mesh(bin.add(new THREE.TorusGeometry(r, tube, 16, 200)), mat);
    halo.add(mesh);
    haloRings.push({ mesh, mat, alpha });
  }

  const left = new THREE.Group();
  scene.add(left);
  const bars: { mesh: THREE.Mesh; base: THREE.Vector3; dir: THREE.Vector3; phase: number }[] = [];
  const addBar = (a: THREE.Vector3, b: THREE.Vector3, radius: number, alpha: number, fade: number, phase: number) => {
    const dir = b.clone().sub(a);
    const len = dir.length();
    dir.normalize();
    const mesh = new THREE.Mesh(
      bin.add(new THREE.CapsuleGeometry(radius, len, 8, 24)),
      softMat('#1290ff', 1.7, alpha, fade),
    );
    const mid = a.clone().add(b).multiplyScalar(0.5);
    mesh.position.copy(mid);
    mesh.quaternion.setFromUnitVectors(Y_AXIS, dir);
    left.add(mesh);
    bars.push({ mesh, base: mid, dir, phase });
  };
  addBar(new THREE.Vector3(-6.4, 0.9, -1), new THREE.Vector3(-3.5, 3.7, -1), 0.26, 0.85, 0, 0);
  addBar(new THREE.Vector3(-4.75, -0.95, -0.5), new THREE.Vector3(-1.6, 2.8, -0.5), 0.15, 0.95, 1, 1.9);

  const wobble = new THREE.Quaternion();
  const euler = new THREE.Euler();

  return {
    scene,
    camera,
    update(time) {
      /* Client feedback (20260917): the blade wall's pace was right, the other
         three read as too slow. Each of those runs its own clock faster rather
         than having every rate in it retuned by hand. */
      const t = time * 2.8;
      const shift = halfWidth(camera, DIST) - REF_HALF_W;
      right.position.x = shift;
      left.position.x = -shift;

      glassMat.uniforms.uTime.value = t;
      euler.set(Math.sin(t * 0.23) * 0.06, Math.sin(t * 0.17 + 1.0) * 0.08, Math.sin(t * 0.13) * 0.04);
      dish.quaternion.copy(dishBaseQ).multiply(wobble.setFromEuler(euler));
      dish.position.y = 1.26 + Math.sin(t * 0.31) * 0.08;
      euler.set(Math.sin(t * 0.19 + 2.0) * 0.07, Math.sin(t * 0.21) * 0.06, 0);
      dish2.quaternion.copy(dish2BaseQ).multiply(wobble.setFromEuler(euler));

      halo.rotation.x = 0.3 + Math.sin(t * 0.15) * 0.07;
      halo.rotation.y = -0.28 + Math.sin(t * 0.11 + 0.7) * 0.09;
      haloRings.forEach((h, i) => {
        h.mat.uniforms.uAlpha.value = h.alpha * (0.82 + 0.18 * Math.sin(t * 0.5 + i * 1.4));
        const s = 1 + 0.015 * Math.sin(t * 0.27 + i * 2.1);
        h.mesh.scale.set(s, s, 1);
      });
      glowMat.uniforms.uAlpha.value = 0.5 + 0.12 * Math.sin(t * 0.4);

      for (const b of bars) {
        const k = Math.sin(t * 0.22 + b.phase) * 0.35;
        b.mesh.position.copy(b.base).addScaledVector(b.dir, k);
      }
    },
    dispose: bin.dispose,
  };
}

/* ==========================================================================
   WAVES — banners/uae-slider-2.webp.
   Two large sheets whose edges catch the light. Each edge is a curve traced
   from the image; a strip is extruded to either side of it — a tight bright
   glow with a broad sheen on the lit side, a soft shade or lighter panel on
   the other — fading to nothing with distance from the edge. The edges
   undulate slowly along their length; both strips of an edge move together.
   ========================================================================== */
function buildWavesScene(): HeroScene {
  const bin = tracker();
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 16 / 9, 0.1, 50);
  camera.position.set(0, 0, 9);
  const W = 11.65;
  const H = 6.55;

  const bgMat = bin.add(
    new THREE.ShaderMaterial({
      depthWrite: false,
      uniforms: { uTime: { value: 0 }, uSize: { value: new THREE.Vector2(W, H) } },
      vertexShader: `
        uniform vec2 uSize;
        varying vec2 vP;
        void main() {
          vP = position.xy / uSize + 0.5;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        varying vec2 vP;
        void main() {
          vec3 navy = vec3(0.0, 0.0, 0.46);
          vec3 mid = vec3(0.0, 0.16, 0.82);
          vec3 bright = vec3(0.03, 0.34, 0.98);
          float breathe = 0.04 * sin(uTime * 0.3);
          float tl = 1.0 - smoothstep(0.0, 0.78 + breathe, distance(vP, vec2(0.12, 0.98)));
          float br = 1.0 - smoothstep(0.0, 0.72 - breathe, distance(vP, vec2(1.02, 0.34)));
          vec3 col = mix(navy, mid, clamp(tl * 1.15 + br * 0.95, 0.0, 1.0));
          col = mix(col, bright, clamp(tl * tl * 0.75 + br * br * 0.4, 0.0, 1.0));
          gl_FragColor = vec4(col, 1.0);
        }
      `,
    }),
  );
  const bg = new THREE.Mesh(bin.add(new THREE.PlaneGeometry(60, 20)), bgMat);
  bg.position.z = -1;
  bg.renderOrder = 0;
  scene.add(bg);

  const stripMats: THREE.ShaderMaterial[] = [];

  interface StripOpts {
    side: 1 | -1;
    width: number;
    color: string;
    tight: number;
    tightK: number;
    broad: number;
    broadK: number;
    seed: number;
    order: number;
  }

  /** Image-space points (x right, y down, 0..1) to a strip on one side. */
  const addStrip = (pts: [number, number][], o: StripOpts) => {
    const curve = new THREE.CatmullRomCurve3(
      pts.map(([x, y]) => new THREE.Vector3((x - 0.5) * W, (0.5 - y) * H, 0)),
      false,
      'centripetal',
    );
    const N = 200;
    const position = new Float32Array((N + 1) * 2 * 3);
    const dir = new Float32Array((N + 1) * 2 * 2);
    const wob = new Float32Array((N + 1) * 2 * 2);
    const av = new Float32Array((N + 1) * 2);
    const as = new Float32Array((N + 1) * 2);
    const index: number[] = [];
    const DS = 0.004;
    for (let i = 0; i <= N; i++) {
      const s = i / N;
      const p = curve.getPoint(s);
      const tg = curve.getTangent(s);
      const lx = -tg.y;
      const ly = tg.x;
      /* On the inside of a bend a strip wider than the bend's radius folds
         over itself and draws a cross. Signed curvature (positive = turning
         left) says which side is the inside; there the far edge stops just
         short of the centre of curvature, and aV carries the true distance
         so the falloff stays continuous along the strip. */
      const s0 = Math.max(0, s - DS);
      const s1 = Math.min(1, s + DS);
      const t0 = curve.getTangent(s0);
      const t1 = curve.getTangent(s1);
      const arc = curve.getPoint(s0).distanceTo(curve.getPoint(s1)) || 1e-6;
      const kappa = (t0.x * t1.y - t0.y * t1.x) / arc;
      const inside = kappa * o.side > 0;
      const reach = inside ? Math.min(o.width, 0.6 / Math.max(Math.abs(kappa), 1e-6)) : o.width;
      for (let k = 0; k < 2; k++) {
        const j = i * 2 + k;
        position.set([p.x, p.y, 0], j * 3);
        dir.set([lx * o.side, ly * o.side], j * 2);
        wob.set([lx, ly], j * 2);
        av[j] = k * (reach / o.width);
        as[j] = s;
      }
      if (i < N) {
        const a = i * 2;
        index.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
      }
    }
    const geo = bin.add(new THREE.BufferGeometry());
    geo.setAttribute('position', new THREE.BufferAttribute(position, 3));
    geo.setAttribute('aDir', new THREE.BufferAttribute(dir, 2));
    geo.setAttribute('aWob', new THREE.BufferAttribute(wob, 2));
    geo.setAttribute('aV', new THREE.BufferAttribute(av, 1));
    geo.setAttribute('aS', new THREE.BufferAttribute(as, 1));
    geo.setIndex(index);

    const mat = bin.add(
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        depthTest: false,
        side: THREE.DoubleSide,
        uniforms: {
          uTime: { value: 0 },
          uWidth: { value: o.width },
          uSeed: { value: o.seed },
          uColor: { value: raw(o.color) },
          uTight: { value: o.tight },
          uTightK: { value: o.tightK },
          uBroad: { value: o.broad },
          uBroadK: { value: o.broadK },
        },
        vertexShader: `
          attribute vec2 aDir;
          attribute vec2 aWob;
          attribute float aV;
          attribute float aS;
          uniform float uTime;
          uniform float uWidth;
          uniform float uSeed;
          varying float vV;
          void main() {
            float w = 0.16 * sin(aS * 5.0 + uTime * 0.33 + uSeed)
                    + 0.08 * sin(aS * 11.0 - uTime * 0.21 + uSeed * 1.7);
            vec2 p = position.xy + aWob * w + aDir * (aV * uWidth);
            vV = aV;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 0.0, 1.0);
          }
        `,
        fragmentShader: `
          uniform vec3 uColor;
          uniform float uTight;
          uniform float uTightK;
          uniform float uBroad;
          uniform float uBroadK;
          varying float vV;
          void main() {
            float tight = uTight * exp(-vV * uTightK);
            float a = tight + uBroad * exp(-vV * uBroadK);
            a *= 1.0 - smoothstep(0.8, 1.0, vV);
            vec3 col = mix(uColor, vec3(0.45, 0.85, 1.0), clamp(tight * exp(-vV * uTightK), 0.0, 1.0));
            gl_FragColor = vec4(col, clamp(a, 0.0, 1.0));
          }
        `,
      }),
    );
    const mesh = new THREE.Mesh(geo, mat);
    mesh.frustumCulled = false;
    mesh.renderOrder = o.order;
    scene.add(mesh);
    stripMats.push(mat);
  };

  /* Edge A: in from the top, down the S, round the bottom bend and out to
     the right. The sheet is on the traveller's right. */
  const A: [number, number][] = [
    [0.25, -0.2], [0.30, 0.0], [0.37, 0.15], [0.41, 0.30], [0.43, 0.47], [0.45, 0.58],
    [0.50, 0.67], [0.58, 0.71], [0.66, 0.69], [0.78, 0.60], [0.90, 0.52], [1.0, 0.47], [1.3, 0.36],
  ];
  /* Edge B: in from the top, round a tighter bend, out to the upper right.
     The lighter panel hangs below it; the glow sits inside the bend. */
  const B: [number, number][] = [
    [0.588, -0.2], [0.592, 0.0], [0.60, 0.10], [0.615, 0.20], [0.65, 0.27], [0.70, 0.30],
    [0.76, 0.29], [0.83, 0.24], [0.92, 0.16], [1.0, 0.085], [1.3, -0.12],
  ];

  addStrip(B, { side: -1, width: 3.0, color: '#0a52f2', tight: 0.0, tightK: 1, broad: 0.62, broadK: 1.6, seed: 2.4, order: 1 });
  addStrip(B, { side: 1, width: 2.2, color: '#1a8cff', tight: 0.95, tightK: 22, broad: 0.5, broadK: 3.2, seed: 2.4, order: 2 });
  addStrip(A, { side: 1, width: 2.6, color: '#000066', tight: 0.0, tightK: 1, broad: 0.5, broadK: 2.4, seed: 0.0, order: 3 });
  addStrip(A, { side: -1, width: 3.2, color: '#1686ff', tight: 0.95, tightK: 24, broad: 0.55, broadK: 2.6, seed: 0.0, order: 4 });

  return {
    scene,
    camera,
    update(time) {
      const t = time * 3.0;
      bgMat.uniforms.uTime.value = t;
      for (const m of stripMats) m.uniforms.uTime.value = t;
    },
    dispose: bin.dispose,
  };
}

/* ==========================================================================
   TERRAIN — banners/uae-slider-4.webp.
   Matte folded petals rising from the lower right over a flat blue ground:
   two tall pointed ones, a smaller one in front of them, and rounded mounds
   along the bottom. Each is a cone-like sheet with its own profile (pointed
   to domed), softly lit from the upper left, swaying from its base.
   ========================================================================== */
function buildTerrainScene(): HeroScene {
  const bin = tracker();
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 16 / 9, 0.1, 60);
  const DIST = 10;
  camera.position.set(0, 0, DIST);
  const REF_HALF_W = 5.6;

  const bgMat = bin.add(
    new THREE.ShaderMaterial({
      depthWrite: false,
      vertexShader: `
        varying vec2 vP;
        void main() {
          vP = position.xy / vec2(11.2, 6.3) + 0.5;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec2 vP;
        void main() {
          vec3 a = vec3(0.0, 0.06, 0.62);
          vec3 b = vec3(0.0, 0.10, 0.74);
          float g = clamp(vP.x * 0.5 + vP.y * 0.5, 0.0, 1.0);
          gl_FragColor = vec4(mix(a, b, g), 1.0);
        }
      `,
    }),
  );
  const bg = new THREE.Mesh(bin.add(new THREE.PlaneGeometry(80, 30)), bgMat);
  bg.position.z = -6;
  scene.add(bg);

  const petalMat = (lit: string, shadow: string) =>
    bin.add(
      new THREE.ShaderMaterial({
        side: THREE.DoubleSide,
        uniforms: {
          uLight: { value: new THREE.Vector3(-0.7, 0.55, 0.45) },
          uLit: { value: raw(lit) },
          uShadow: { value: raw(shadow) },
        },
        vertexShader: `
          varying vec3 vN;
          varying float vH;
          void main() {
            vN = normalize(normalMatrix * normal);
            vH = uv.y;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform vec3 uLight;
          uniform vec3 uLit;
          uniform vec3 uShadow;
          varying vec3 vN;
          varying float vH;
          void main() {
            vec3 n = normalize(vN);
            float front = gl_FrontFacing ? 1.0 : 0.0;
            if (front < 0.5) n = -n;
            float d = dot(n, normalize(uLight)) * 0.5 + 0.5;
            vec3 col = mix(uShadow, uLit, smoothstep(0.32, 0.9, d));
            col *= mix(0.6, 1.0, smoothstep(0.0, 0.75, vH));
            col += uLit * 0.22 * pow(1.0 - abs(n.z), 3.0) * smoothstep(0.4, 0.8, d);
            col *= mix(0.72, 1.0, front);
            gl_FragColor = vec4(col, 1.0);
          }
        `,
      }),
    );

  /** A cone-like sheet: radius R at the base shrinking to a point over
      height H by (1-v)^p — p near 1 is a pointed petal, near 0.45 a dome. */
  const petalGeometry = (R: number, H: number, p: number, bend: number, depth: number) => {
    const NU = 64;
    const NV = 40;
    const position: number[] = [];
    const uv: number[] = [];
    const index: number[] = [];
    for (let j = 0; j <= NV; j++) {
      const v = j / NV;
      const r = R * Math.pow(1 - v, p) + 0.012;
      for (let i = 0; i <= NU; i++) {
        const a = (i / NU) * Math.PI * 2 - Math.PI;
        position.push(r * Math.sin(a) + bend * v * v, v * H, r * Math.cos(a) * depth);
        uv.push(i / NU, v);
      }
    }
    for (let j = 0; j < NV; j++) {
      for (let i = 0; i < NU; i++) {
        const a = j * (NU + 1) + i;
        const b = a + NU + 1;
        index.push(a, a + 1, b, a + 1, b + 1, b);
      }
    }
    const geo = bin.add(new THREE.BufferGeometry());
    geo.setAttribute('position', new THREE.Float32BufferAttribute(position, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    geo.setIndex(index);
    geo.computeVertexNormals();
    return geo;
  };

  const group = new THREE.Group();
  scene.add(group);

  const mats: THREE.ShaderMaterial[] = [];
  const petals: { mesh: THREE.Mesh; rot: number; amp: number; speed: number; phase: number }[] = [];
  const addPetal = (
    x: number, z: number, R: number, H: number, p: number, bend: number, rot: number,
    lit: string, shadow: string, amp: number, speed: number, phase: number,
  ) => {
    const mat = petalMat(lit, shadow);
    mats.push(mat);
    const mesh = new THREE.Mesh(petalGeometry(R, H, p, bend, 0.8), mat);
    mesh.position.set(x, -4.0, z);
    mesh.rotation.z = rot;
    group.add(mesh);
    petals.push({ mesh, rot, amp, speed, phase });
  };

  addPetal(5.6, -2.6, 5.4, 8.7, 1.0, -0.6, 0.04, '#0a62ff', '#0016cc', 0.016, 0.21, 0.0);
  addPetal(3.2, -1.2, 3.7, 5.75, 1.0, -0.45, 0.02, '#0b68ff', '#0018d2', 0.022, 0.26, 1.3);
  addPetal(1.35, 0.2, 2.15, 3.75, 0.95, -0.3, 0.02, '#0a60ff', '#0014c8', 0.026, 0.31, 2.2);
  addPetal(5.4, 0.8, 2.5, 4.0, 0.5, -0.3, 0.0, '#0a64ff', '#0016cc', 0.02, 0.24, 3.1);
  addPetal(3.1, 1.7, 3.1, 3.1, 0.46, -0.5, 0.0, '#0960fc', '#0015ca', 0.022, 0.28, 0.7);
  addPetal(0.3, 2.3, 2.3, 2.5, 0.45, 0.35, 0.0, '#085cf8', '#0013c4', 0.026, 0.33, 4.0);
  addPetal(3.6, 3.1, 3.4, 1.5, 0.42, 0.2, 0.0, '#0a62ff', '#0016cc', 0.02, 0.22, 5.2);

  return {
    scene,
    camera,
    update(time) {
      const t = time * 3.0;
      group.position.x = halfWidth(camera, DIST) - REF_HALF_W;
      for (const p of petals) {
        p.mesh.rotation.z = p.rot + p.amp * 1.6 * Math.sin(t * p.speed + p.phase);
        p.mesh.scale.y = 1 + 0.03 * Math.sin(t * p.speed * 0.8 + p.phase * 1.7);
      }
      const lx = -0.7 + 0.16 * Math.sin(t * 0.18);
      const ly = 0.55 + 0.1 * Math.sin(t * 0.13 + 1.2);
      for (const m of mats) (m.uniforms.uLight.value as THREE.Vector3).set(lx, ly, 0.45);
    },
    dispose: bin.dispose,
  };
}

const BUILDERS: Record<HeroVariant, () => HeroScene> = {
  flute: buildFluteScene,
  terrain: buildTerrainScene,
  rings: buildRingsScene,
  waves: buildWavesScene,
};

export function buildHeroScene(variant: HeroVariant): HeroScene {
  return BUILDERS[variant]();
}

/** `rimgFirst`'s resolved path names the file that actually won the fallback
    chain. Unmatched banners keep the plain image (HeroSlideMedia's null case)
    rather than guessing a variant. */
export function variantForBanner(resolvedSrc: string): HeroVariant | null {
  if (resolvedSrc.includes('uae-slider-1')) return 'rings';
  if (resolvedSrc.includes('uae-slider-2')) return 'waves';
  if (resolvedSrc.includes('uae-slider-3')) return 'flute';
  if (resolvedSrc.includes('uae-slider-4')) return 'terrain';
  return null;
}
