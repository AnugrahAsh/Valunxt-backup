/**
 * MESH — a wireframe sea.
 *
 * A grid of thin lines, seen from above at an angle, with waves running
 * through it; the lines brighten on the crests and fade to nothing away
 * from a sinuous centre band, so the sheet reads as a ribbon of mesh
 * floating in the dark rather than a floor. Sparks sit on every third node
 * and ride the same waves.
 */
import * as THREE from 'three';

import { backdrop, PALETTES, PALETTE_GLSL, paletteUniforms, rng, tracker, type LiveScene } from '../kit';
import type { LiveSpec } from '../registry';

const HEIGHT_GLSL = `
  uniform float uTime; uniform float uSeed;
  float hgt(vec2 q) {
    return 0.75 * sin(q.x * 0.55 + uTime * 0.5 + uSeed) * cos(q.y * 0.6 - uTime * 0.35)
         + 0.45 * sin((q.x * 0.35 + q.y * 0.5) + uTime * 0.6 + uSeed)
         + 0.25 * sin(q.x * 1.3 - uTime * 0.9);
  }
  float band(vec2 q) {
    float c = 1.1 * sin(q.x * 0.28 + uTime * 0.15 + uSeed);
    return 1.0 - smoothstep(2.4, 4.8, abs(q.y - c));
  }
`;

export function buildMesh(spec: LiveSpec): LiveScene {
  const bin = tracker();
  const scene = new THREE.Scene();
  const pal = PALETTES[spec.tone];
  const r = rng(spec.seed);
  const density = spec.density ?? 1;
  const tilt = spec.tilt ?? 0.8;
  const speed = spec.speed ?? 1;
  const seed = r() * 6.28;

  const cam = new THREE.PerspectiveCamera(42, 16 / 9, 0.1, 120);
  cam.position.set(0, 4.6 * tilt, 9.5);
  cam.lookAt(0, -0.2, 0);

  scene.add(backdrop(bin, { top: pal.deep, bottom: '#010314', glow: pal.mid, at: [0.5, 0.55], amount: 0.7, spread: 1.7 }).mesh);

  const NX = Math.round(90 * density);
  const NY = Math.round(42 * density);
  const W = 22;
  const H = 11;
  const node = (i: number, j: number): [number, number, number] => [(-W / 2) + (W * i) / NX, (-H / 2) + (H * j) / NY, 0];

  const lines: number[] = [];
  for (let j = 0; j <= NY; j++) for (let i = 0; i < NX; i++) lines.push(...node(i, j), ...node(i + 1, j));
  for (let i = 0; i <= NX; i++) for (let j = 0; j < NY; j++) lines.push(...node(i, j), ...node(i, j + 1));
  const lineGeo = bin.add(new THREE.BufferGeometry());
  lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(lines, 3));

  const lineMat = bin.add(
    new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uTime: { value: 0 }, uSeed: { value: seed }, uAlpha: { value: 0.55 }, ...paletteUniforms(pal) },
      vertexShader: `
        ${HEIGHT_GLSL}
        varying float vB; varying float vM;
        void main() {
          vec3 p = position;
          p.z = hgt(p.xy);
          vB = smoothstep(-0.9, 1.2, p.z);
          vM = band(p.xy);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }
      `,
      fragmentShader: `
        ${PALETTE_GLSL}
        uniform float uAlpha;
        varying float vB; varying float vM;
        void main() {
          float a = vM * (0.18 + 0.82 * vB) * uAlpha;
          vec3 col = mix(uMid, uGlow, vB);
          gl_FragColor = vec4(col, a);
        }
      `,
    }),
  );
  const mesh = new THREE.LineSegments(lineGeo, lineMat);
  mesh.frustumCulled = false;
  scene.add(mesh);

  const dots: number[] = [];
  for (let j = 0; j <= NY; j += 3) for (let i = 0; i <= NX; i += 3) dots.push(...node(i, j));
  const dotGeo = bin.add(new THREE.BufferGeometry());
  dotGeo.setAttribute('position', new THREE.Float32BufferAttribute(dots, 3));
  const dotMat = bin.add(
    new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uTime: { value: 0 }, uSeed: { value: seed }, uSize: { value: 3.0 }, ...paletteUniforms(pal) },
      vertexShader: `
        ${HEIGHT_GLSL}
        uniform float uSize;
        varying float vB; varying float vM;
        void main() {
          vec3 p = position;
          p.z = hgt(p.xy);
          vB = smoothstep(-0.9, 1.2, p.z);
          vM = band(p.xy);
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_PointSize = uSize * (0.6 + vB) * (10.0 / -mv.z);
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: `
        ${PALETTE_GLSL}
        varying float vB; varying float vM;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          float a = smoothstep(0.5, 0.12, d) * vM * (0.25 + 0.75 * vB);
          gl_FragColor = vec4(mix(uBright, uGlow, vB), a);
        }
      `,
    }),
  );
  const points = new THREE.Points(dotGeo, dotMat);
  points.frustumCulled = false;
  scene.add(points);

  const group = new THREE.Group();
  group.add(mesh, points);
  scene.add(group);

  return {
    scene,
    camera: cam,
    update(t) {
      const s = t * speed;
      lineMat.uniforms.uTime!.value = s;
      dotMat.uniforms.uTime!.value = s;
      dotMat.uniforms.uSize!.value = 3.0 * Math.min(window.devicePixelRatio || 1, 1.5);
      group.rotation.z = 0.04 * Math.sin(s * 0.07);
      group.position.x = 0.4 * Math.sin(s * 0.05);
    },
    dispose: bin.dispose,
  };
}
