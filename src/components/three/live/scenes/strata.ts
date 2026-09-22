/**
 * STRATA — layers of cut paper.
 *
 * A stack of sheets, each cut along a wavy edge, the front sheet lowest and
 * each one behind it rising higher. Every edge undulates on two waves of its
 * own, so the layers slide against each other slowly. Each sheet carries the
 * shadow of the one in front of it (a soft dark band just above that
 * sheet's edge) and a lit lip along its own edge, which is what makes the
 * stack read as paper with depth rather than stripes.
 *
 * All the sheets share one plane and are painted back to front, so the
 * shadow a front sheet casts is computed in the very coordinates the sheet
 * behind is drawn in, with no parallax to correct.
 */
import * as THREE from 'three';

import { backdrop, camera, PALETTES, PALETTE_GLSL, paletteUniforms, rng, tracker, type LiveScene } from '../kit';
import type { LiveSpec } from '../registry';

export function buildStrata(spec: LiveSpec): LiveScene {
  const bin = tracker();
  const scene = new THREE.Scene();
  const cam = camera(38, 9);
  const pal = PALETTES[spec.tone];
  const r = rng(spec.seed);
  const layers = spec.layers ?? 8;
  const ice = spec.tone === 'ice';
  const speed = spec.speed ?? 1;

  scene.add(
    backdrop(bin, {
      top: ice ? pal.bright : pal.deep,
      bottom: ice ? pal.mid : pal.mid,
      glow: ice ? pal.glow : pal.bright,
      at: [0.7, 0.85],
      amount: 0.35,
      spread: 2.0,
    }).mesh,
  );

  interface Edge {
    y0: number;
    f1: number;
    f2: number;
    s1: number;
    s2: number;
    p1: number;
    p2: number;
    amp: number;
  }
  const edges: Edge[] = [];
  const step = 6.6 / Math.max(1, layers - 1);
  for (let i = 0; i < layers; i++) {
    edges.push({
      y0: -2.6 + i * step,
      f1: 0.3 + r() * 0.25,
      f2: 0.65 + r() * 0.5,
      s1: 0.06 + r() * 0.08,
      s2: 0.04 + r() * 0.06,
      p1: r() * 6.28,
      p2: r() * 6.28,
      amp: 0.32 + r() * 0.3,
    });
  }
  const pack = (e: Edge) => [new THREE.Vector4(e.y0, e.f1, e.f2, e.amp), new THREE.Vector4(e.s1, e.s2, e.p1, e.p2)];

  const geo = bin.add(new THREE.PlaneGeometry(34, 18));
  const mats: THREE.ShaderMaterial[] = [];
  const group = new THREE.Group();
  scene.add(group);

  for (let i = layers - 1; i >= 0; i--) {
    const own = pack(edges[i]!);
    const front = i > 0 ? pack(edges[i - 1]!) : pack(edges[i]!);
    const mat = bin.add(
      new THREE.ShaderMaterial({
        depthTest: false,
        depthWrite: false,
        transparent: true,
        uniforms: {
          uTime: { value: 0 },
          uOwnA: { value: own[0] },
          uOwnB: { value: own[1] },
          uFrontA: { value: front[0] },
          uFrontB: { value: front[1] },
          uHasFront: { value: i > 0 ? 1 : 0 },
          uShade: { value: layers > 1 ? i / (layers - 1) : 0 },
          uIce: { value: ice ? 1 : 0 },
          ...paletteUniforms(pal),
        },
        vertexShader: `
          varying vec2 vP;
          void main() { vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
        `,
        fragmentShader: `
          ${PALETTE_GLSL}
          uniform float uTime; uniform vec4 uOwnA; uniform vec4 uOwnB; uniform vec4 uFrontA; uniform vec4 uFrontB;
          uniform float uHasFront; uniform float uShade; uniform float uIce;
          varying vec2 vP;
          float edgeOf(vec4 A, vec4 B, float x) {
            return A.x + A.w * (sin(x * A.y + uTime * B.x + B.z) + 0.55 * sin(x * A.z - uTime * B.y + B.w));
          }
          void main() {
            float e = edgeOf(uOwnA, uOwnB, vP.x);
            if (vP.y > e) discard;
            float ef = uHasFront > 0.5 ? edgeOf(uFrontA, uFrontB, vP.x) : -100.0;
            float shadow = 1.0 - smoothstep(ef, ef + 0.7, vP.y);
            float rim = 1.0 - smoothstep(e - 0.14, e, vP.y);
            vec3 tint = mix(uDeep, uBright, uShade * mix(0.85, 0.95, uIce));
            vec3 col = mix(tint, tint * 0.5, shadow * 0.85);
            col += uGlow * rim * mix(0.5, 0.7, uIce);
            col *= 0.9 + 0.1 * clamp(vP.x / 17.0 + 0.5, 0.0, 1.0);
            col *= 0.94 + 0.06 * sin(vP.x * 0.15 + uTime * 0.1 + uShade * 3.0);
            gl_FragColor = vec4(col, 1.0);
          }
        `,
      }),
    );
    const mesh = new THREE.Mesh(geo, mat);
    mesh.frustumCulled = false;
    mesh.renderOrder = layers - i;
    group.add(mesh);
    mats.push(mat);
  }

  return {
    scene,
    camera: cam,
    update(t) {
      const s = t * speed;
      for (const m of mats) m.uniforms.uTime!.value = s;
      group.position.x = 0.4 * Math.sin(s * 0.05);
      group.rotation.z = 0.015 * Math.sin(s * 0.08);
    },
    dispose: bin.dispose,
  };
}
