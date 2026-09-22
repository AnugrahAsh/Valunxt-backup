/**
 * TRAILS — light streaking along curved lanes.
 *
 * Five lanes cross the frame, each a spline; hundreds of streaks run along
 * them at their own speeds, each an elongated sprite aligned to the lane's
 * tangent, bright at the head and fading down the tail, added onto a dark
 * ground. The lanes themselves sway. With `warm`, a share of the streaks
 * run amber, the way long-exposure traffic does.
 */
import * as THREE from 'three';

import { backdrop, camera, instanced, PALETTES, PALETTE_GLSL, paletteUniforms, rng, tracker, type LiveScene } from '../kit';
import type { LiveSpec } from '../registry';

const LANES = 5;
const PTS = 8;

export function buildTrails(spec: LiveSpec): LiveScene {
  const bin = tracker();
  const scene = new THREE.Scene();
  const cam = camera(40, 10);
  const pal = PALETTES[spec.tone];
  const r = rng(spec.seed);
  const warm = !!spec.warm;
  const speed = spec.speed ?? 1;
  const count = spec.count ?? 700;

  scene.add(backdrop(bin, { top: pal.deep, bottom: '#01030F', glow: pal.mid, at: [0.5, 0.5], amount: 0.6, spread: 1.6 }).mesh);

  const pts: THREE.Vector3[] = [];
  for (let l = 0; l < LANES; l++) {
    const y0 = (l - (LANES - 1) / 2) * 1.15 + (r() - 0.5) * 0.6;
    const wave = 0.6 + r() * 1.1;
    const ph = r() * 6.28;
    for (let i = 0; i < PTS; i++) {
      const x = -12 + (24 * i) / (PTS - 1);
      pts.push(new THREE.Vector3(x, y0 + Math.sin(x * 0.32 + ph) * wave + (r() - 0.5) * 0.5, (l - 2) * 0.3));
    }
  }

  const base = bin.add(new THREE.PlaneGeometry(1, 1));
  const geo = instanced(bin, base, count);
  const lane = new Float32Array(count);
  const off = new Float32Array(count);
  const spd = new Float32Array(count);
  const len = new Float32Array(count);
  const wid = new Float32Array(count);
  const shade = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    lane[i] = Math.floor(r() * LANES);
    off[i] = r();
    spd[i] = 0.6 + r() * 0.9;
    len[i] = 0.5 + r() * 1.3;
    wid[i] = 0.025 + r() * 0.07;
    shade[i] = r();
  }
  geo.setAttribute('aLane', new THREE.InstancedBufferAttribute(lane, 1));
  geo.setAttribute('aOff', new THREE.InstancedBufferAttribute(off, 1));
  geo.setAttribute('aSpeed', new THREE.InstancedBufferAttribute(spd, 1));
  geo.setAttribute('aLen', new THREE.InstancedBufferAttribute(len, 1));
  geo.setAttribute('aWidth', new THREE.InstancedBufferAttribute(wid, 1));
  geo.setAttribute('aShade', new THREE.InstancedBufferAttribute(shade, 1));

  const mat = bin.add(
    new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      depthTest: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uWarm: { value: warm ? 1 : 0 },
        uPts: { value: pts },
        ...paletteUniforms(pal),
      },
      vertexShader: `
        uniform vec3 uPts[${LANES * PTS}];
        uniform float uTime;
        attribute float aLane; attribute float aOff; attribute float aSpeed; attribute float aLen; attribute float aWidth; attribute float aShade;
        varying vec2 vUv; varying float vFade; varying float vShade;
        vec3 cr(vec3 p0, vec3 p1, vec3 p2, vec3 p3, float t) {
          float t2 = t * t;
          float t3 = t2 * t;
          return 0.5 * ((2.0 * p1) + (-p0 + p2) * t + (2.0 * p0 - 5.0 * p1 + 4.0 * p2 - p3) * t2 + (-p0 + 3.0 * p1 - 3.0 * p2 + p3) * t3);
        }
        vec3 lane(float l, float s) {
          float f = s * ${PTS - 1}.0;
          float seg = floor(f);
          float t = f - seg;
          float b = l * ${PTS}.0;
          vec3 p0 = uPts[int(b + max(seg - 1.0, 0.0))];
          vec3 p1 = uPts[int(b + seg)];
          vec3 p2 = uPts[int(b + min(seg + 1.0, ${PTS - 1}.0))];
          vec3 p3 = uPts[int(b + min(seg + 2.0, ${PTS - 1}.0))];
          vec3 p = cr(p0, p1, p2, p3, t);
          p.y += 0.25 * sin(p.x * 0.5 + uTime * 0.2 + l);
          return p;
        }
        void main() {
          float s = fract(aOff + uTime * aSpeed * 0.045);
          vec3 P = lane(aLane, s);
          vec3 P2 = lane(aLane, min(s + 0.012, 1.0));
          vec3 T = normalize(P2 - P);
          vec3 N = normalize(cross(T, vec3(0.0, 0.0, 1.0)));
          vec3 q = P + T * position.x * aLen + N * position.y * aWidth;
          vUv = uv;
          vFade = smoothstep(0.0, 0.1, s) * smoothstep(1.0, 0.9, s);
          vShade = aShade;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(q, 1.0);
        }
      `,
      fragmentShader: `
        ${PALETTE_GLSL}
        uniform float uWarm;
        varying vec2 vUv; varying float vFade; varying float vShade;
        void main() {
          float y = abs(vUv.y * 2.0 - 1.0);
          float core = pow(1.0 - y, 2.2);
          float head = smoothstep(0.0, 0.35, vUv.x) * (1.0 - smoothstep(0.55, 1.0, vUv.x));
          float a = core * head * vFade;
          vec3 cool = mix(uBright, uGlow, vShade);
          vec3 warmc = vec3(1.0, 0.72, 0.36);
          vec3 col = mix(cool, warmc, uWarm * step(0.72, vShade));
          gl_FragColor = vec4(col, a * 0.9);
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
      mesh.rotation.z = 0.02 * Math.sin(s * 0.11);
    },
    dispose: bin.dispose,
  };
}
