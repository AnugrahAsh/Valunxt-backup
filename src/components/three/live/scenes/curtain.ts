/**
 * CURTAIN — hanging strands with a light passing through.
 *
 * Hundreds of thin vertical strands, each bending a little in its own way,
 * lit by a horizontal wave of light that rolls across them: the band's
 * height varies along the width and drifts with time, and a fainter echo
 * follows above it. Away from the light the strands sit dark against the
 * ground, so what moves is the light, not the curtain.
 */
import * as THREE from 'three';

import { backdrop, camera, instanced, PALETTES, PALETTE_GLSL, paletteUniforms, rng, tracker, type LiveScene } from '../kit';
import type { LiveSpec } from '../registry';

export function buildCurtain(spec: LiveSpec): LiveScene {
  const bin = tracker();
  const scene = new THREE.Scene();
  const cam = camera(40, 9);
  const pal = PALETTES[spec.tone];
  const r = rng(spec.seed);
  const strands = spec.strands ?? 240;
  const band = spec.band ?? 0.6;
  const speed = spec.speed ?? 1;
  const seed = r() * 6.28;

  const ground = backdrop(bin, { top: pal.deep, bottom: '#01041A', glow: pal.mid, at: [0.5, 0.45], amount: 1.0, spread: 1.4 });
  scene.add(ground.mesh);

  const base = bin.add(new THREE.PlaneGeometry(0.03, 9, 1, 28));
  const geo = instanced(bin, base, strands);
  const ax = new Float32Array(strands);
  const aph = new Float32Array(strands);
  const abase = new Float32Array(strands);
  for (let i = 0; i < strands; i++) {
    ax[i] = -11 + (22 * (i + r() * 0.8)) / strands;
    aph[i] = r() * 6.28;
    abase[i] = 0.35 + r() * 0.65;
  }
  geo.setAttribute('aX', new THREE.InstancedBufferAttribute(ax, 1));
  geo.setAttribute('aPhase', new THREE.InstancedBufferAttribute(aph, 1));
  geo.setAttribute('aBase', new THREE.InstancedBufferAttribute(abase, 1));

  const mat = bin.add(
    new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      depthTest: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uSeed: { value: seed },
        uBandK: { value: 1.1 / band },
        uBend: { value: 0.35 },
        ...paletteUniforms(pal),
      },
      vertexShader: `
        attribute float aX; attribute float aPhase; attribute float aBase;
        uniform float uTime; uniform float uSeed; uniform float uBandK; uniform float uBend;
        varying float vL; varying float vBase; varying float vY;
        void main() {
          float y01 = position.y / 9.0 + 0.5;
          float bendx = uBend * sin(y01 * 3.3 + aPhase + uTime * 0.22) * (0.25 + 0.75 * y01);
          vec3 p = vec3(position.x + aX + bendx, position.y, 0.0);
          float yc = sin(aX * 0.5 + uTime * 0.42 + uSeed) + 0.5 * sin(aX * 1.3 - uTime * 0.27 + aPhase * 0.2) + 0.5 * sin(uTime * 0.3);
          float b1 = exp(-pow((position.y - yc) * uBandK, 2.0));
          float b2 = 0.3 * exp(-pow((position.y - yc - 2.4) * uBandK * 0.7, 2.0));
          vL = b1 + b2;
          vBase = aBase;
          vY = y01;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }
      `,
      fragmentShader: `
        ${PALETTE_GLSL}
        varying float vL; varying float vBase; varying float vY;
        void main() {
          float fadeY = smoothstep(0.0, 0.12, vY) * smoothstep(1.0, 0.88, vY);
          vec3 col = uMid * vBase * 0.35 + uBright * vL * 0.95 + uGlow * vL * vL * 0.75;
          float a = (0.22 * vBase + vL * 1.1) * fadeY;
          gl_FragColor = vec4(col, a);
        }
      `,
    }),
  );
  const mesh = new THREE.Mesh(geo, mat);
  mesh.frustumCulled = false;
  scene.add(mesh);

  const at = ground.material.uniforms.uAt!.value as THREE.Vector2;
  return {
    scene,
    camera: cam,
    update(t) {
      const s = t * speed;
      mat.uniforms.uTime!.value = s;
      at.set(0.5 + 0.15 * Math.sin(s * 0.19), 0.5 + 0.08 * Math.sin(s * 0.3));
      mesh.rotation.y = 0.06 * Math.sin(s * 0.05);
    },
    dispose: bin.dispose,
  };
}
