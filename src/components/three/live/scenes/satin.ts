/**
 * SATIN — a folded silk sheet.
 *
 * One large sheet, folded by four overlapping waves that travel across it
 * at different rates, so a fold never repeats its shape. The normals come
 * from finite differences of the same height function, so the light (a
 * broad sheen with a tight specular) always follows the folds exactly. A
 * faint grain along the fold direction is what makes it read as fabric
 * rather than liquid. `gloss` sets how tight the highlight is, `angle` the
 * direction the folds run, `freq` how many there are.
 */
import * as THREE from 'three';

import { camera, deg, PALETTES, PALETTE_GLSL, paletteUniforms, rng, tracker, type LiveScene } from '../kit';
import type { LiveSpec } from '../registry';

export function buildSatin(spec: LiveSpec): LiveScene {
  const bin = tracker();
  const scene = new THREE.Scene();
  const cam = camera(38, 9);
  const pal = PALETTES[spec.tone];
  const r = rng(spec.seed);
  const a = deg(spec.angle ?? 25);
  const speed = spec.speed ?? 1;

  const geo = bin.add(new THREE.PlaneGeometry(24, 14, 240, 140));
  const mat = bin.add(
    new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uDir: { value: new THREE.Vector2(Math.cos(a), Math.sin(a)) },
        uFreq: { value: spec.freq ?? 1.6 },
        uAmp: { value: spec.amp ?? 1.0 },
        uA: { value: new THREE.Vector4(1.0, 0.45 + r() * 0.2, 0.14 + r() * 0.1, 0.06 + r() * 0.06) },
        uSeed: { value: new THREE.Vector4(r() * 6.28, r() * 6.28, r() * 6.28, r() * 6.28) },
        uGloss: { value: spec.gloss ?? 34 },
        uLight: { value: new THREE.Vector3(-0.5, 0.6, 0.62) },
        ...paletteUniforms(pal),
      },
      vertexShader: `
        uniform float uTime; uniform vec2 uDir; uniform float uFreq; uniform float uAmp;
        uniform vec4 uA; uniform vec4 uSeed;
        varying vec3 vN; varying vec2 vP; varying float vH;
        float fold(vec2 q) {
          float u = dot(q, uDir);
          float v = dot(q, vec2(-uDir.y, uDir.x));
          float f = uFreq;
          float z = uA.x * sin(u * f * 0.42 + v * 0.18 + uTime * 0.21 + uSeed.x)
                  + uA.y * sin(u * f * 0.85 - v * 0.3 - uTime * 0.17 + uSeed.y)
                  + uA.z * sin((u * 0.5 + v * 0.8) * f * 0.6 + uTime * 0.13 + uSeed.z)
                  + uA.w * sin(v * f * 1.1 + u * 0.3 - uTime * 0.27 + uSeed.w);
          return z * uAmp;
        }
        void main() {
          vec2 q = position.xy;
          float e = 0.06;
          float h = fold(q);
          float hx = fold(q + vec2(e, 0.0));
          float hy = fold(q + vec2(0.0, e));
          vN = normalize(vec3(-(hx - h) / e, -(hy - h) / e, 1.0));
          vP = q;
          vH = h;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(q, h, 1.0);
        }
      `,
      fragmentShader: `
        ${PALETTE_GLSL}
        uniform float uGloss; uniform vec3 uLight; uniform vec2 uDir;
        varying vec3 vN; varying vec2 vP; varying float vH;
        void main() {
          vec3 n = normalize(vN);
          vec3 L = normalize(uLight);
          vec3 V = vec3(0.0, 0.0, 1.0);
          float wrap = dot(n, L) * 0.5 + 0.5;
          vec3 H = normalize(L + V);
          float nh = max(dot(n, H), 0.0);
          float sheen = pow(nh, uGloss * 0.22);
          float spec = pow(nh, uGloss);
          float fres = pow(1.0 - max(n.z, 0.0), 3.0);
          vec3 col = mix(uDeep, uMid, smoothstep(0.12, 0.72, wrap));
          col = mix(col, uBright, smoothstep(0.6, 1.0, wrap) * 0.7);
          col += uBright * sheen * 0.3 + uGlow * spec * 0.55;
          col += uGlow * fres * 0.2;
          col *= 0.82 + 0.18 * clamp(vH * 0.5 + 0.5, 0.0, 1.0);
          col *= 1.0 - 0.18 * smoothstep(5.0, 11.0, length(vP));
          gl_FragColor = vec4(col, 1.0);
        }
      `,
    }),
  );
  const mesh = new THREE.Mesh(geo, mat);
  mesh.frustumCulled = false;
  scene.add(mesh);

  const light = mat.uniforms.uLight!.value as THREE.Vector3;
  return {
    scene,
    camera: cam,
    update(t) {
      const s = t * speed;
      mat.uniforms.uTime!.value = s;
      light.set(-0.5 + 0.25 * Math.sin(s * 0.11), 0.6 + 0.15 * Math.sin(s * 0.08 + 1.0), 0.62);
      mesh.rotation.z = 0.02 * Math.sin(s * 0.09);
      mesh.rotation.x = -0.22 + 0.06 * Math.sin(s * 0.07);
    },
    dispose: bin.dispose,
  };
}
