/**
 * THE REAL ESTATE PRACTICE'S OWN ABSTRACTS (20260921).
 *
 * Five live Three.js scenes, built for this section only, so nothing here
 * repeats the four home-page hero scenes (src/components/three/heroScenes.ts).
 * Same language as the group's abstracts — deep navy to electric blue, light
 * catching edges, slow continuous motion — but each one says something about
 * Dubai property:
 *
 *   skyline  a city of glass towers, breathing, with a band of light sweeping
 *            across it
 *   dunes    an endless desert of ridged dunes drifting toward the viewer, the
 *            crests catching a low sun
 *   arches   a corridor of pointed arches the camera travels through
 *   globe    a dotted globe with flight arcs running out of Dubai
 *   lattice  a mashrabiya screen of eight-point stars rippling in the light
 *
 * EstateCanvas.tsx owns the renderer, resize and render loop; each builder
 * returns the scene, its camera, a per-frame update and a dispose.
 */
import * as THREE from 'three';

export type EstateVariant = 'skyline' | 'dunes' | 'arches' | 'globe' | 'lattice';

export interface EstateScene {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  /** `t` is seconds since the scene was built. */
  update: (t: number) => void;
  dispose: () => void;
}

/** A hex colour handed to a shader as-is (the shaders write gl_FragColor
    straight to the canvas, with no colour-space conversion on the way out). */
function raw(hex: string): THREE.Color {
  return new THREE.Color().setStyle(hex, THREE.LinearSRGBColorSpace);
}

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

/** A full-frame gradient drawn first, in clip space, so it fills any aspect. */
function backdrop(
  bin: ReturnType<typeof tracker>,
  opts: { top: string; bottom: string; glow: string; at: [number, number]; amount: number; horizon?: number },
): THREE.Mesh {
  const mat = bin.add(
    new THREE.ShaderMaterial({
      depthWrite: false,
      depthTest: false,
      uniforms: {
        uTop: { value: raw(opts.top) },
        uBottom: { value: raw(opts.bottom) },
        uGlow: { value: raw(opts.glow) },
        uAt: { value: new THREE.Vector2(opts.at[0], opts.at[1]) },
        uAmt: { value: opts.amount },
        uHorizon: { value: opts.horizon ?? 0.5 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
      `,
      fragmentShader: `
        uniform vec3 uTop; uniform vec3 uBottom; uniform vec3 uGlow;
        uniform vec2 uAt; uniform float uAmt; uniform float uHorizon;
        varying vec2 vUv;
        void main() {
          float k = smoothstep(0.0, 1.0, (vUv.y - uHorizon) * 1.4 + 0.5);
          vec3 c = mix(uBottom, uTop, k);
          float g = exp(-pow(length((vUv - uAt) * vec2(1.6, 1.0)) * 2.2, 2.0));
          c += uGlow * g * uAmt;
          gl_FragColor = vec4(c, 1.0);
        }
      `,
    }),
  );
  const mesh = new THREE.Mesh(bin.add(new THREE.PlaneGeometry(2, 2)), mat);
  mesh.frustumCulled = false;
  mesh.renderOrder = -1000;
  return mesh;
}

/** An instanced copy of a base geometry, with its own per-instance attributes. */
function instanced(bin: ReturnType<typeof tracker>, base: THREE.BufferGeometry, count: number) {
  const g = bin.add(new THREE.InstancedBufferGeometry());
  g.index = base.index;
  g.setAttribute('position', base.getAttribute('position'));
  if (base.getAttribute('normal')) g.setAttribute('normal', base.getAttribute('normal'));
  if (base.getAttribute('uv')) g.setAttribute('uv', base.getAttribute('uv'));
  g.instanceCount = count;
  return g;
}

/* Deterministic randomness, so a scene looks the same on every load. */
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/* ==========================================================================
   SKYLINE — a city of glass towers.
   ========================================================================== */
function buildSkyline(): EstateScene {
  const bin = tracker();
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 16 / 9, 0.1, 200);
  scene.add(backdrop(bin, { top: '#0B2DBE', bottom: '#020733', glow: '#3E6BFF', at: [0.5, 0.42], amount: 0.55, horizon: 0.45 }));

  const COLS = 36;
  const ROWS = 18;
  const N = COLS * ROWS;
  const r = rng(7);
  const off = new Float32Array(N * 2);
  const size = new Float32Array(N * 3);
  const phase = new Float32Array(N);
  let i = 0;
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const x = (col - COLS / 2) * 1.35 + (r() - 0.5) * 0.4;
      const z = -row * 1.9 + (r() - 0.5) * 0.5;
      const centre = Math.exp(-Math.pow(x / 9, 2)) * Math.exp(-Math.pow((z + 14) / 14, 2));
      let h = 0.8 + r() * 3 + centre * 9 * (0.4 + r());
      if (r() > 0.985) h += 6;
      off[i * 2] = x;
      off[i * 2 + 1] = z;
      size[i * 3] = 0.55 + r() * 0.45;
      size[i * 3 + 1] = 0.55 + r() * 0.45;
      size[i * 3 + 2] = h;
      phase[i] = r() * Math.PI * 2;
      i++;
    }
  }
  const box = bin.add(new THREE.BoxGeometry(1, 1, 1));
  box.translate(0, 0.5, 0);
  const geo = instanced(bin, box, N);
  geo.setAttribute('aOff', new THREE.InstancedBufferAttribute(off, 2));
  geo.setAttribute('aSize', new THREE.InstancedBufferAttribute(size, 3));
  geo.setAttribute('aPhase', new THREE.InstancedBufferAttribute(phase, 1));

  const mat = bin.add(
    new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uDeep: { value: raw('#040C52') },
        uMid: { value: raw('#1C45E8') },
        uHi: { value: raw('#A9C6FF') },
        uFog: { value: raw('#0A1C8A') },
      },
      vertexShader: `
        attribute vec2 aOff; attribute vec3 aSize; attribute float aPhase;
        uniform float uTime;
        varying vec3 vN; varying vec3 vW; varying float vH; varying float vFog;
        void main() {
          float h = aSize.z * (0.84 + 0.16 * sin(uTime * 0.8 + aPhase));
          vec3 p = vec3(position.x * aSize.x + aOff.x, position.y * h, position.z * aSize.y + aOff.y);
          vH = position.y;
          vN = normal;
          vec4 wp = modelMatrix * vec4(p, 1.0);
          vW = wp.xyz;
          vec4 mv = viewMatrix * wp;
          vFog = smoothstep(16.0, 52.0, -mv.z);
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: `
        uniform float uTime; uniform vec3 uDeep; uniform vec3 uMid; uniform vec3 uHi; uniform vec3 uFog;
        varying vec3 vN; varying vec3 vW; varying float vH; varying float vFog;
        void main() {
          vec3 L = normalize(vec3(-0.55, 0.5, 0.65));
          float diff = max(dot(vN, L), 0.0);
          vec3 c = mix(uDeep, uMid, clamp(vW.y / 8.0, 0.0, 1.0) * 0.75 + 0.1);
          c = mix(c, uHi, diff * 0.35);
          float top = step(0.99, vN.y);
          float band = smoothstep(0.35, 0.45, fract(vW.y * 1.3)) * (1.0 - top);
          c *= 0.82 + 0.22 * band;
          float sweep = mod(uTime * 5.0, 70.0) - 35.0;
          float g = exp(-pow((vW.x - sweep + vW.z * 0.35) * 0.22, 2.0));
          c += uHi * g * (0.25 + 0.5 * vH);
          c = mix(c, uHi, top * 0.55);
          c = mix(c, uFog, vFog);
          gl_FragColor = vec4(c, 1.0);
        }
      `,
    }),
  );
  const city = new THREE.Mesh(geo, mat);
  city.frustumCulled = false;
  scene.add(city);

  const groundMat = bin.add(
    new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uLine: { value: raw('#2E5BFF') }, uBase: { value: raw('#030A45') }, uFog: { value: raw('#0A1C8A') } },
      vertexShader: `
        varying vec3 vW; varying float vFog;
        void main() {
          vec4 wp = modelMatrix * vec4(position, 1.0);
          vW = wp.xyz;
          vec4 mv = viewMatrix * wp;
          vFog = smoothstep(10.0, 52.0, -mv.z);
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: `
        uniform vec3 uLine; uniform vec3 uBase; uniform vec3 uFog; uniform float uTime;
        varying vec3 vW; varying float vFog;
        void main() {
          vec2 g = abs(fract(vW.xz * vec2(0.74, 0.53)) - 0.5);
          float line = 1.0 - smoothstep(0.0, 0.03, min(g.x, g.y));
          vec3 c = mix(uBase, uLine, line * 0.35);
          c = mix(c, uFog, vFog);
          gl_FragColor = vec4(c, 1.0);
        }
      `,
    }),
  );
  const ground = new THREE.Mesh(bin.add(new THREE.PlaneGeometry(200, 120)), groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.z = -30;
  scene.add(ground);

  return {
    scene,
    camera,
    update(t) {
      mat.uniforms.uTime.value = t;
      camera.position.set(Math.sin(t * 0.11) * 5, 7.2 + Math.sin(t * 0.17) * 0.6, 24);
      camera.lookAt(camera.position.x * 0.35, 2.6, -8);
    },
    dispose: () => bin.dispose(),
  };
}

/* ==========================================================================
   DUNES — ridged sand drifting toward the viewer under a low sun.
   ========================================================================== */
function buildDunes(): EstateScene {
  const bin = tracker();
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 16 / 9, 0.1, 200);
  camera.position.set(0, 3.4, 14);
  camera.lookAt(0, 0.8, -12);
  scene.add(backdrop(bin, { top: '#020A55', bottom: '#3E6BFF', glow: '#D9E6FF', at: [0.68, 0.52], amount: 0.55, horizon: 0.58 }));

  const plane = bin.add(new THREE.PlaneGeometry(90, 70, 240, 180));
  plane.rotateX(-Math.PI / 2);
  plane.translate(0, 0, -22);
  const mat = bin.add(
    new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uShade: { value: raw('#030B4F') },
        uLit: { value: raw('#2F5BFF') },
        uHi: { value: raw('#C9DAFF') },
        uSand: { value: raw('#F2DDB4') },
        uFog: { value: raw('#3159F2') },
      },
      vertexShader: `
        uniform float uTime;
        varying vec3 vN; varying float vRidge; varying float vFog;
        float ridge(vec2 p) {
          float a = sin(p.x * 0.17 + p.y * 0.06 + sin(p.y * 0.09 + p.x * 0.03) * 1.6);
          return pow(1.0 - abs(a), 1.8);
        }
        float h(vec2 p) {
          float b = sin(p.x * 0.06 - p.y * 0.11 + 1.3) * 0.5 + 0.5;
          return ridge(p) * 1.9 * (0.55 + 0.45 * b) + ridge(p * 2.3 + 4.0) * 0.22;
        }
        void main() {
          vec2 p = position.xz + vec2(uTime * 0.25, -uTime * 1.1);
          float e = 0.06;
          float y = h(p);
          float dx = (h(p + vec2(e, 0.0)) - y) / e;
          float dz = (h(p + vec2(0.0, e)) - y) / e;
          vN = normalize(vec3(-dx, 1.0, -dz));
          vRidge = ridge(p);
          vec4 mv = modelViewMatrix * vec4(position.x, y, position.z, 1.0);
          vFog = smoothstep(14.0, 62.0, -mv.z);
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: `
        uniform vec3 uShade; uniform vec3 uLit; uniform vec3 uHi; uniform vec3 uSand; uniform vec3 uFog;
        varying vec3 vN; varying float vRidge; varying float vFog;
        void main() {
          vec3 L = normalize(vec3(0.75, 0.32, -0.6));
          float d = dot(normalize(vN), L);
          vec3 c = mix(uShade, uLit, smoothstep(-0.25, 0.6, d));
          float crest = smoothstep(0.9, 0.995, vRidge) * smoothstep(0.0, 0.3, d);
          c = mix(c, mix(uHi, uSand, 0.35), crest * 0.85);
          c = mix(c, uFog, vFog);
          gl_FragColor = vec4(c, 1.0);
        }
      `,
    }),
  );
  scene.add(new THREE.Mesh(plane, mat));

  return {
    scene,
    camera,
    update(t) {
      mat.uniforms.uTime.value = t;
      camera.position.x = Math.sin(t * 0.13) * 1.6;
      camera.lookAt(camera.position.x * 0.5, 0.8, -12);
    },
    dispose: () => bin.dispose(),
  };
}

/* ==========================================================================
   ARCHES — a corridor of pointed arches, travelled through.
   ========================================================================== */
function archShape(w: number, side: number): THREE.Shape {
  const s = new THREE.Shape();
  const hw = w / 2;
  s.moveTo(-hw, 0);
  s.lineTo(-hw, side);
  /* A pointed (two-centred) arch: each side is an arc centred on the other
     springing point, meeting at the apex. */
  const steps = 24;
  for (let k = 1; k <= steps; k++) {
    const a = (Math.PI / 3) * (k / steps);
    s.lineTo(hw - w * Math.cos(a), side + w * Math.sin(a));
  }
  for (let k = steps - 1; k >= 0; k--) {
    const a = (Math.PI / 3) * (k / steps);
    s.lineTo(-hw + w * Math.cos(a), side + w * Math.sin(a));
  }
  s.lineTo(hw, 0);
  s.lineTo(-hw, 0);
  return s;
}

function buildArches(): EstateScene {
  const bin = tracker();
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 16 / 9, 0.1, 200);
  camera.position.set(0, 2.6, 6);
  camera.lookAt(0, 3.2, -20);
  scene.add(backdrop(bin, { top: '#010637', bottom: '#0B2DBE', glow: '#6F97FF', at: [0.5, 0.55], amount: 0.7, horizon: 0.5 }));

  const outer = archShape(7.2, 5.2);
  const inner = archShape(6.2, 4.9);
  const hole = new THREE.Path(inner.getPoints().map((p) => new THREE.Vector2(p.x, p.y + 0.02)).reverse());
  outer.holes.push(hole);
  const frame = bin.add(new THREE.ExtrudeGeometry(outer, { depth: 0.5, bevelEnabled: false, curveSegments: 1 }));

  const COUNT = 16;
  const GAP = 3.4;
  const zs = new Float32Array(COUNT);
  for (let k = 0; k < COUNT; k++) zs[k] = -k * GAP;
  const geo = instanced(bin, frame, COUNT);
  const zAttr = new THREE.InstancedBufferAttribute(zs, 1);
  geo.setAttribute('aZ', zAttr);

  const mat = bin.add(
    new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uFace: { value: raw('#0E2FC4') },
        uEdge: { value: raw('#9CBBFF') },
        uDeep: { value: raw('#020833') },
        uFog: { value: raw('#0B2DBE') },
      },
      vertexShader: `
        attribute float aZ;
        uniform float uTime;
        varying vec3 vN; varying float vY; varying float vDepth; varying float vFog;
        void main() {
          vec3 p = position + vec3(0.0, 0.0, aZ);
          vN = normal;
          vY = position.y;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          vDepth = -mv.z;
          vFog = smoothstep(12.0, 52.0, vDepth);
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: `
        uniform float uTime; uniform vec3 uFace; uniform vec3 uEdge; uniform vec3 uDeep; uniform vec3 uFog;
        varying vec3 vN; varying float vY; varying float vDepth; varying float vFog;
        void main() {
          float front = step(0.9, abs(vN.z));
          vec3 c = mix(uDeep, uFace, clamp(vY / 8.0, 0.0, 1.0) * 0.8 + 0.2);
          vec3 rim = mix(uFace, uEdge, 0.55 + 0.45 * abs(vN.x));
          c = mix(rim, c, front);
          float pulse = exp(-pow((vDepth - mod(uTime * 9.0, 60.0)) * 0.22, 2.0));
          c += uEdge * pulse * 0.45;
          c = mix(c, uFog, vFog);
          gl_FragColor = vec4(c, 1.0);
        }
      `,
    }),
  );
  const arches = new THREE.Mesh(geo, mat);
  arches.frustumCulled = false;
  scene.add(arches);

  const floorMat = bin.add(
    new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uLine: { value: raw('#4B78FF') }, uBase: { value: raw('#020833') }, uFog: { value: raw('#0B2DBE') } },
      vertexShader: `
        varying vec3 vW; varying float vFog;
        void main() {
          vec4 wp = modelMatrix * vec4(position, 1.0);
          vW = wp.xyz;
          vec4 mv = viewMatrix * wp;
          vFog = smoothstep(8.0, 50.0, -mv.z);
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: `
        uniform float uTime; uniform vec3 uLine; uniform vec3 uBase; uniform vec3 uFog;
        varying vec3 vW; varying float vFog;
        void main() {
          float gx = abs(fract(vW.x * 0.5) - 0.5);
          float gz = abs(fract((vW.z - uTime * 1.8) * 0.3) - 0.5);
          float line = 1.0 - smoothstep(0.0, 0.025, min(gx, gz));
          vec3 c = mix(uBase, uLine, line * 0.3);
          c = mix(c, uFog, vFog);
          gl_FragColor = vec4(c, 1.0);
        }
      `,
    }),
  );
  const floor = new THREE.Mesh(bin.add(new THREE.PlaneGeometry(60, 120)), floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.z = -40;
  scene.add(floor);

  const SPEED = 1.8;
  const SPAN = COUNT * GAP;
  return {
    scene,
    camera,
    update(t) {
      mat.uniforms.uTime.value = t;
      floorMat.uniforms.uTime.value = t;
      const travel = (t * SPEED) % SPAN;
      for (let k = 0; k < COUNT; k++) {
        let z = -k * GAP + travel;
        if (z > camera.position.z + 1) z -= SPAN;
        zs[k] = z;
      }
      zAttr.needsUpdate = true;
      camera.position.x = Math.sin(t * 0.2) * 0.5;
      camera.lookAt(camera.position.x * 0.3, 3.2, -20);
    },
    dispose: () => bin.dispose(),
  };
}

/* ==========================================================================
   GLOBE — Dubai, and the routes out of it.
   ========================================================================== */
const DUBAI: [number, number] = [25.2, 55.3];
const CITIES: [number, number][] = [
  [51.5, -0.1], [48.9, 2.35], [55.75, 37.6], [19.1, 72.9], [28.6, 77.2], [1.35, 103.8],
  [31.2, 121.5], [22.3, 114.2], [-33.9, 151.2], [40.7, -74.0], [-1.3, 36.8], [-26.2, 28.0], [35.7, 139.7], [41.0, 29.0],
];

function onSphere(lat: number, lon: number, r: number): THREE.Vector3 {
  const phi = THREE.MathUtils.degToRad(90 - lat);
  const theta = THREE.MathUtils.degToRad(lon + 180);
  return new THREE.Vector3(-r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta));
}

function buildGlobe(): EstateScene {
  const bin = tracker();
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 16 / 9, 0.1, 100);
  camera.position.set(0, 0, 13);
  scene.add(backdrop(bin, { top: '#010637', bottom: '#050F5C', glow: '#2B58FF', at: [0.5, 0.5], amount: 0.75, horizon: 0.5 }));

  const R = 3.2;
  const tilt = new THREE.Group();
  const spin = new THREE.Group();
  tilt.add(spin);
  scene.add(tilt);
  tilt.rotation.x = 0.36;

  const N = 3200;
  const pos = new Float32Array(N * 3);
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let k = 0; k < N; k++) {
    const y = 1 - (k / (N - 1)) * 2;
    const rr = Math.sqrt(1 - y * y);
    const th = golden * k;
    pos[k * 3] = Math.cos(th) * rr * R;
    pos[k * 3 + 1] = y * R;
    pos[k * 3 + 2] = Math.sin(th) * rr * R;
  }
  const dotsGeo = bin.add(new THREE.BufferGeometry());
  dotsGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const dotsMat = bin.add(
    new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uColor: { value: raw('#8FB7FF') }, uScale: { value: 1 } },
      vertexShader: `
        uniform float uScale;
        varying float vFace; varying float vLand;
        void main() {
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          vec3 n = normalize(normalMatrix * position);
          vFace = n.z;
          vec3 q = normalize(position);
          vLand = smoothstep(0.1, 0.6, sin(q.x * 5.0 + sin(q.y * 4.0) * 1.7) * sin(q.y * 6.0 + q.z * 3.0) + 0.35);
          gl_PointSize = (1.6 + vLand * 1.6) * uScale * (13.0 / -mv.z);
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        varying float vFace; varying float vLand;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          float a = smoothstep(0.5, 0.15, d);
          float f = mix(0.08, 0.85, smoothstep(-0.3, 0.6, vFace)) * (0.35 + 0.65 * vLand);
          gl_FragColor = vec4(uColor * a * f, 1.0);
        }
      `,
    }),
  );
  spin.add(new THREE.Points(dotsGeo, dotsMat));

  /* The glow at the limb. */
  const haloMat = bin.add(
    new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      uniforms: { uColor: { value: raw('#3E6BFF') } },
      vertexShader: `
        varying vec3 vN; varying vec3 vV;
        void main() {
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz);
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        varying vec3 vN; varying vec3 vV;
        void main() {
          float f = pow(1.0 - abs(dot(vN, vV)), 2.5);
          gl_FragColor = vec4(uColor * f * 0.9, 1.0);
        }
      `,
    }),
  );
  tilt.add(new THREE.Mesh(bin.add(new THREE.SphereGeometry(R * 1.12, 48, 32)), haloMat));

  /* Routes: great circles lifted off the surface, a light running along each. */
  const from = onSphere(DUBAI[0], DUBAI[1], R);
  const arcMats: THREE.ShaderMaterial[] = [];
  CITIES.forEach(([lat, lon], k) => {
    const to = onSphere(lat, lon, R);
    const angle = from.angleTo(to);
    const pts: THREE.Vector3[] = [];
    for (let s = 0; s <= 48; s++) {
      const f = s / 48;
      const v = new THREE.Vector3().copy(from).normalize().lerp(to.clone().normalize(), f).normalize();
      v.multiplyScalar(R * (1 + Math.sin(Math.PI * f) * 0.22 * angle));
      pts.push(v);
    }
    const tube = bin.add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 64, 0.014, 5, false));
    const m = bin.add(
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: { uTime: { value: 0 }, uPhase: { value: k * 0.137 }, uColor: { value: raw('#CFE0FF') } },
        vertexShader: `
          varying float vA;
          void main() { vA = uv.x; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
        `,
        fragmentShader: `
          uniform float uTime; uniform float uPhase; uniform vec3 uColor;
          varying float vA;
          void main() {
            float head = fract(uTime * 0.28 + uPhase) * 1.4 - 0.2;
            float trail = smoothstep(head - 0.3, head, vA) * step(vA, head);
            float a = 0.14 + trail * 0.95;
            gl_FragColor = vec4(uColor * a, 1.0);
          }
        `,
      }),
    );
    arcMats.push(m);
    spin.add(new THREE.Mesh(tube, m));
    const dot = new THREE.Mesh(bin.add(new THREE.SphereGeometry(0.045, 10, 8)), bin.add(new THREE.MeshBasicMaterial({ color: '#CFE0FF' })));
    dot.position.copy(to);
    spin.add(dot);
  });

  /* Dubai, pulsing. */
  const pinMat = bin.add(
    new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      uniforms: { uTime: { value: 0 }, uColor: { value: raw('#FFFFFF') } },
      vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: `
        uniform float uTime; uniform vec3 uColor; varying vec2 vUv;
        void main() {
          float d = length(vUv - 0.5) * 2.0;
          float ring = fract(uTime * 0.6);
          float a = smoothstep(0.08, 0.0, abs(d - ring)) * (1.0 - ring) + smoothstep(0.22, 0.12, d);
          gl_FragColor = vec4(uColor * a, 1.0);
        }
      `,
    }),
  );
  const pin = new THREE.Mesh(bin.add(new THREE.PlaneGeometry(0.7, 0.7)), pinMat);
  pin.position.copy(from).multiplyScalar(1.002);
  pin.lookAt(from.clone().multiplyScalar(2));
  spin.add(pin);

  const face = Math.atan2(-from.x, from.z);
  return {
    scene,
    camera,
    update(t) {
      spin.rotation.y = face + Math.sin(t * 0.16) * 0.75 - 0.25;
      for (const m of arcMats) m.uniforms.uTime.value = t;
      pinMat.uniforms.uTime.value = t;
      /* Narrow panels pull the camera back so the globe always fits; wide
         ones slide it right, leaving the left for copy. */
      const small = camera.aspect < 1.25;
      camera.position.z = small ? Math.min(24, 13 * (1.3 / Math.max(0.5, camera.aspect))) : 13;
      tilt.position.x = small ? 0 : Math.min(2.4, (camera.aspect - 1.25) * 1.6);
    },
    dispose: () => bin.dispose(),
  };
}

/* ==========================================================================
   LATTICE — a mashrabiya screen of eight-point stars.
   ========================================================================== */
function starShape(r: number, inner: number): THREE.Shape {
  /* Two squares, one rotated 45°: the eight-point star of the screen. */
  const pts: THREE.Vector2[] = [];
  for (let k = 0; k < 16; k++) {
    const a = (k / 16) * Math.PI * 2 + Math.PI / 16;
    const rad = k % 2 === 0 ? r : r * inner;
    pts.push(new THREE.Vector2(Math.cos(a) * rad, Math.sin(a) * rad));
  }
  return new THREE.Shape(pts);
}

function buildLattice(): EstateScene {
  const bin = tracker();
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 16 / 9, 0.1, 100);
  scene.add(backdrop(bin, { top: '#030B55', bottom: '#010530', glow: '#2F5BFF', at: [0.62, 0.55], amount: 0.6, horizon: 0.5 }));

  const outer = starShape(0.62, 0.8);
  const hole = starShape(0.46, 0.8);
  outer.holes.push(new THREE.Path(hole.getPoints().reverse()));
  const star = bin.add(new THREE.ExtrudeGeometry(outer, { depth: 0.1, bevelEnabled: false }));

  const COLS = 30;
  const ROWS = 18;
  const N = COLS * ROWS;
  const off = new Float32Array(N * 2);
  let i = 0;
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      off[i * 2] = (col - (COLS - 1) / 2) * 1.12;
      off[i * 2 + 1] = (row - (ROWS - 1) / 2) * 1.12;
      i++;
    }
  }
  const geo = instanced(bin, star, N);
  geo.setAttribute('aOff', new THREE.InstancedBufferAttribute(off, 2));

  const mat = bin.add(
    new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uDeep: { value: raw('#06126A') },
        uMid: { value: raw('#2450F5') },
        uHi: { value: raw('#C4D7FF') },
        uFog: { value: raw('#030A48') },
      },
      vertexShader: `
        attribute vec2 aOff;
        uniform float uTime;
        varying vec3 vN; varying float vLift; varying float vFade;
        vec3 rotX(vec3 p, float a) { float c = cos(a), s = sin(a); return vec3(p.x, p.y * c - p.z * s, p.y * s + p.z * c); }
        vec3 rotY(vec3 p, float a) { float c = cos(a), s = sin(a); return vec3(p.x * c + p.z * s, p.y, -p.x * s + p.z * c); }
        float wave(vec2 q) {
          vec2 c1 = vec2(sin(uTime * 0.21) * 7.0, cos(uTime * 0.17) * 3.5);
          vec2 c2 = vec2(-9.0 + cos(uTime * 0.13) * 3.0, 4.0);
          float a = sin(length(q - c1) * 0.75 - uTime * 1.7) * 0.5;
          float b = sin(length(q - c2) * 0.55 - uTime * 1.2) * 0.3;
          return a + b;
        }
        void main() {
          float e = 0.2;
          float w = wave(aOff);
          float gx = (wave(aOff + vec2(e, 0.0)) - wave(aOff - vec2(e, 0.0))) / (2.0 * e);
          float gy = (wave(aOff + vec2(0.0, e)) - wave(aOff - vec2(0.0, e))) / (2.0 * e);
          vec3 p = rotY(rotX(position, -gy * 0.9), gx * 0.9);
          vN = rotY(rotX(normal, -gy * 0.9), gx * 0.9);
          p += vec3(aOff, w * 0.9);
          vLift = w;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          vFade = smoothstep(12.0, 30.0, -mv.z);
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: `
        uniform vec3 uDeep; uniform vec3 uMid; uniform vec3 uHi; uniform vec3 uFog;
        varying vec3 vN; varying float vLift; varying float vFade;
        void main() {
          vec3 L = normalize(vec3(0.45, 0.55, 0.7));
          vec3 n = normalize(vN);
          float d = max(dot(n, L), 0.0);
          vec3 c = mix(uDeep, uMid, d);
          float spec = pow(max(dot(reflect(-L, n), vec3(0.0, 0.0, 1.0)), 0.0), 18.0);
          c += uHi * spec * 0.8;
          c += uHi * smoothstep(0.35, 0.8, vLift) * 0.25;
          c = mix(c, uFog, vFade * 0.85);
          gl_FragColor = vec4(c, 1.0);
        }
      `,
    }),
  );
  const screen = new THREE.Mesh(geo, mat);
  screen.frustumCulled = false;
  screen.rotation.set(-0.42, 0.34, 0.08);
  scene.add(screen);

  return {
    scene,
    camera,
    update(t) {
      mat.uniforms.uTime.value = t;
      camera.position.set(Math.sin(t * 0.1) * 1.2, Math.cos(t * 0.12) * 0.6, 14);
      camera.lookAt(0, 0, 0);
    },
    dispose: () => bin.dispose(),
  };
}

const BUILDERS: Record<EstateVariant, () => EstateScene> = {
  skyline: buildSkyline,
  dunes: buildDunes,
  arches: buildArches,
  globe: buildGlobe,
  lattice: buildLattice,
};

export function buildEstateScene(variant: EstateVariant): EstateScene {
  return BUILDERS[variant]();
}
