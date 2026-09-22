/**
 * What every live abstract (scenes/*.ts) is built from: the brand palettes,
 * the disposal tracker, deterministic randomness, the full-frame backdrop and
 * the instancing helper. Same conventions as heroScenes.ts and the real-estate
 * practice's estateScenes.ts, kept here so the nine families share one copy.
 *
 * Colours go to the shaders through raw(): these shaders write gl_FragColor
 * straight to the canvas with no output colour-space conversion, so the usual
 * sRGB-to-linear decode of `new THREE.Color(hex)` would come out darker and
 * more saturated than the hex says.
 */
import * as THREE from 'three';

import type { Tone } from './registry';

export interface LiveScene {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  /** `t` is seconds the scene has been live for (it only advances on screen). */
  update: (t: number) => void;
  dispose: () => void;
}

export interface Palette {
  deep: string;
  mid: string;
  bright: string;
  glow: string;
}

/** The brand's blues, plus the two accents the site already uses in artwork:
    the wordmark's violet and the teal of the real-estate satin band. */
export const PALETTES: Record<Tone, Palette> = {
  royal: { deep: '#030B3F', mid: '#0B2DBE', bright: '#2F6BFF', glow: '#9CC8FF' },
  cobalt: { deep: '#020733', mid: '#0A2A9E', bright: '#1F63F0', glow: '#7FB2FF' },
  navy: { deep: '#01041F', mid: '#061A66', bright: '#1746C8', glow: '#5B8CFF' },
  electric: { deep: '#000A4A', mid: '#1436D8', bright: '#3A8CFF', glow: '#A8DAFF' },
  violet: { deep: '#07053A', mid: '#2A1A8C', bright: '#6A4BFF', glow: '#C9A6FF' },
  teal: { deep: '#10302A', mid: '#28453F', bright: '#4F8C7E', glow: '#A8DCCB' },
  ice: { deep: '#0B2DBE', mid: '#2266BD', bright: '#6FA6E8', glow: '#DDEEFF' },
};

export function raw(hex: string): THREE.Color {
  return new THREE.Color().setStyle(hex, THREE.LinearSRGBColorSpace);
}

export function paletteUniforms(p: Palette) {
  return {
    uDeep: { value: raw(p.deep) },
    uMid: { value: raw(p.mid) },
    uBright: { value: raw(p.bright) },
    uGlow: { value: raw(p.glow) },
  };
}

export const PALETTE_GLSL = 'uniform vec3 uDeep; uniform vec3 uMid; uniform vec3 uBright; uniform vec3 uGlow;';

/** Collects everything a builder creates so dispose() is one call. */
export function tracker() {
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

/** Deterministic randomness from a 0..1 seed, so a scene looks the same on
    every load and two placements with different seeds never match. */
export function rng(seed: number) {
  let s = (Math.floor(seed * 2147483647) ^ 0x9e3779b9) >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/** Half the visible world width / height at `dist` in front of the camera. */
export function halfHeight(camera: THREE.PerspectiveCamera, dist: number): number {
  return Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * dist;
}
export function halfWidth(camera: THREE.PerspectiveCamera, dist: number): number {
  return halfHeight(camera, dist) * camera.aspect;
}

/** A full-frame gradient drawn first, in clip space, so it fills any aspect.
    `at` is where the soft light sits (0..1 across, 0..1 up). */
export function backdrop(
  bin: ReturnType<typeof tracker>,
  opts: { top: string; bottom: string; glow: string; at: [number, number]; amount: number; horizon?: number; spread?: number },
): { mesh: THREE.Mesh; material: THREE.ShaderMaterial } {
  const material = bin.add(
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
        uSpread: { value: opts.spread ?? 2.2 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
      `,
      fragmentShader: `
        uniform vec3 uTop; uniform vec3 uBottom; uniform vec3 uGlow;
        uniform vec2 uAt; uniform float uAmt; uniform float uHorizon; uniform float uSpread;
        varying vec2 vUv;
        void main() {
          float k = smoothstep(0.0, 1.0, (vUv.y - uHorizon) * 1.4 + 0.5);
          vec3 c = mix(uBottom, uTop, k);
          float g = exp(-pow(length((vUv - uAt) * vec2(1.6, 1.0)) * uSpread, 2.0));
          c += uGlow * g * uAmt;
          gl_FragColor = vec4(c, 1.0);
        }
      `,
    }),
  );
  const mesh = new THREE.Mesh(bin.add(new THREE.PlaneGeometry(2, 2)), material);
  mesh.frustumCulled = false;
  mesh.renderOrder = -1000;
  return { mesh, material };
}

/** An instanced copy of a base geometry, ready for per-instance attributes. */
export function instanced(bin: ReturnType<typeof tracker>, base: THREE.BufferGeometry, count: number) {
  const g = bin.add(new THREE.InstancedBufferGeometry());
  g.index = base.index;
  g.setAttribute('position', base.getAttribute('position'));
  if (base.getAttribute('normal')) g.setAttribute('normal', base.getAttribute('normal'));
  if (base.getAttribute('uv')) g.setAttribute('uv', base.getAttribute('uv'));
  g.instanceCount = count;
  return g;
}

export function camera(fov: number, dist: number, y = 0): THREE.PerspectiveCamera {
  const cam = new THREE.PerspectiveCamera(fov, 16 / 9, 0.1, 120);
  cam.position.set(0, y, dist);
  return cam;
}

export function deg(d: number): number {
  return THREE.MathUtils.degToRad(d);
}
