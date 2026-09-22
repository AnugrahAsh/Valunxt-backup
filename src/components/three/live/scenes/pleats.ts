/**
 * PLEATS — a corrugated sheet.
 *
 * A sheet folded into ridges: a triangle-wave profile for `sharp` (crisp
 * fins, each face either lit or in shade) or a sine for `wave` (rounded
 * ribs). The ridges bend, because the phase is warped along their length by
 * slow waves, and the whole sheet breathes. A band of light sweeps across
 * the ridges and back, which is what gives the surface its scale.
 * `angle` is the direction the ridge lines run, from horizontal.
 */
import * as THREE from 'three';

import { camera, deg, PALETTES, PALETTE_GLSL, paletteUniforms, rng, tracker, type LiveScene } from '../kit';
import type { LiveSpec } from '../registry';

export function buildPleats(spec: LiveSpec): LiveScene {
  const bin = tracker();
  const scene = new THREE.Scene();
  const cam = camera(38, 9);
  const pal = PALETTES[spec.tone];
  const r = rng(spec.seed);
  const ridge = deg(spec.angle ?? 30);
  const sharp = (spec.profile ?? 'sharp') === 'sharp';
  const speed = spec.speed ?? 1;
  const seed = r() * 6.28;
  const bandStart = r() * 26;

  const geo = bin.add(new THREE.PlaneGeometry(26, 16, 300, 180));
  const mat = bin.add(
    new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        /* Across the ridges: the ridge direction turned a quarter. */
        uDir: { value: new THREE.Vector2(-Math.sin(ridge), Math.cos(ridge)) },
        uPitch: { value: spec.pitch ?? 1.0 },
        uAmp: { value: spec.amp ?? (sharp ? 0.42 : 0.55) },
        uBend: { value: spec.bend ?? 0.4 },
        uSharp: { value: sharp ? 1.0 : 0.0 },
        uSeed: { value: seed },
        uContrast: { value: spec.contrast ?? 1.0 },
        uBandPos: { value: 0 },
        uBandW: { value: 0.35 },
        uLight: { value: new THREE.Vector3(-0.55, 0.5, 0.66) },
        ...paletteUniforms(pal),
      },
      vertexShader: `
        uniform float uTime; uniform vec2 uDir; uniform float uPitch; uniform float uAmp;
        uniform float uBend; uniform float uSharp; uniform float uSeed;
        varying vec3 vN; varying vec2 vP; varying float vU; varying float vH;
        float prof(vec2 q) {
          float u = dot(q, uDir);
          float v = dot(q, vec2(-uDir.y, uDir.x));
          float warp = uBend * (sin(v * 0.42 + uTime * 0.12 + uSeed)
                              + 0.5 * sin(v * 1.05 - uTime * 0.09 + 2.0)
                              + 0.35 * sin(u * 0.3 + uTime * 0.1 + uSeed));
          float ph = (u + warp) * uPitch;
          float tri = 1.0 - 2.0 * abs(fract(ph) - 0.5);
          float wav = sin(ph * 6.2831853);
          float s = mix(wav, tri, uSharp);
          float swell = 0.85 + 0.15 * sin(v * 0.5 + uTime * 0.23 + uSeed);
          return s * uAmp * swell;
        }
        void main() {
          vec2 q = position.xy;
          float e = 0.03;
          float h = prof(q);
          float hx = prof(q + vec2(e, 0.0));
          float hy = prof(q + vec2(0.0, e));
          vN = normalize(vec3(-(hx - h) / e, -(hy - h) / e, 1.0));
          vP = q;
          vU = dot(q, uDir);
          vH = h / max(uAmp, 0.001);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(q, h, 1.0);
        }
      `,
      fragmentShader: `
        ${PALETTE_GLSL}
        uniform vec3 uLight; uniform float uContrast; uniform float uBandPos; uniform float uBandW;
        varying vec3 vN; varying vec2 vP; varying float vU; varying float vH;
        void main() {
          vec3 n = normalize(vN);
          vec3 L = normalize(uLight);
          float diff = dot(n, L) * 0.5 + 0.5;
          vec3 col = mix(uDeep, uMid, smoothstep(0.2, 0.62, diff));
          col = mix(col, uBright, smoothstep(0.6, 0.98, diff) * 0.55 * uContrast);
          float spec = pow(max(dot(n, normalize(L + vec3(0.0, 0.0, 1.0))), 0.0), 26.0);
          col += uGlow * spec * 0.35 * uContrast;
          /* The valleys sit in shade, the crests catch the light. */
          col *= 0.72 + 0.28 * clamp(vH * 0.5 + 0.5, 0.0, 1.0);
          float band = exp(-pow((vU - uBandPos) * uBandW, 2.0));
          col += (uBright * 0.28 + uGlow * 0.22) * band * (0.35 + 0.65 * smoothstep(0.45, 0.95, diff));
          col += uGlow * pow(1.0 - max(n.z, 0.0), 4.0) * 0.18;
          col *= 1.0 - 0.2 * smoothstep(6.0, 12.0, length(vP));
          gl_FragColor = vec4(col, 1.0);
        }
      `,
    }),
  );
  const mesh = new THREE.Mesh(geo, mat);
  mesh.frustumCulled = false;
  scene.add(mesh);

  return {
    scene,
    camera: cam,
    update(t) {
      const s = t * speed;
      mat.uniforms.uTime!.value = s;
      mat.uniforms.uBandPos!.value = -13 + ((s * 0.85 + bandStart) % 26);
      mesh.rotation.y = 0.1 * Math.sin(s * 0.06);
      mesh.rotation.x = 0.05 * Math.sin(s * 0.08 + 1.0);
    },
    dispose: bin.dispose,
  };
}
