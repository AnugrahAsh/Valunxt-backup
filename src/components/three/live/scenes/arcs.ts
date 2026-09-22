/**
 * ARCS — thin luminous arcs in the dark.
 *
 * Each arc is a partial torus with its own tilt, precessing on three axes
 * at its own slow rates, so the set never returns to a pose it has had. A
 * pulse runs along every arc, and its ends fade to nothing; a wider, fainter
 * copy behind each is the glow. `rings` is a few large arcs gathered to one
 * side (the practice banners); `fine` is more and thinner, spread across the
 * frame (the practices band's threads).
 */
import * as THREE from 'three';

import { backdrop, camera, halfWidth, PALETTES, raw, rng, tracker, type LiveScene } from '../kit';
import type { LiveSpec } from '../registry';

export function buildArcs(spec: LiveSpec): LiveScene {
  const bin = tracker();
  const scene = new THREE.Scene();
  const DIST = 10;
  const cam = camera(36, DIST);
  const pal = PALETTES[spec.tone];
  const r = rng(spec.seed);
  const fine = (spec.mode ?? 'rings') === 'fine';
  const count = spec.count ?? (fine ? 8 : 3);
  const anchor = spec.anchor ?? (fine ? 0.5 : 0.62);
  const speed = spec.speed ?? 1;

  scene.add(
    backdrop(bin, {
      top: pal.deep,
      bottom: '#010318',
      glow: pal.mid,
      at: [anchor, 0.5],
      amount: fine ? 0.55 : 0.9,
      spread: 1.5,
    }).mesh,
  );

  const arcMat = (color: THREE.Color, alpha: number, halo: boolean, phase: number) =>
    bin.add(
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        depthTest: false,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uPhase: { value: phase },
          uAlpha: { value: alpha },
          uColor: { value: color },
          uHalo: { value: halo ? 1 : 0 },
        },
        vertexShader: `
          varying float vA; varying vec3 vN; varying vec3 vV;
          void main() {
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            vN = normalize(normalMatrix * normal);
            vV = normalize(-mv.xyz);
            vA = uv.x;
            gl_Position = projectionMatrix * mv;
          }
        `,
        fragmentShader: `
          uniform float uTime; uniform float uPhase; uniform float uAlpha; uniform vec3 uColor; uniform float uHalo;
          varying float vA; varying vec3 vN; varying vec3 vV;
          void main() {
            float ends = smoothstep(0.0, 0.1, vA) * smoothstep(1.0, 0.9, vA);
            float pulse = 0.6 + 0.4 * sin(vA * 7.0 - uTime * 1.1 + uPhase);
            float travel = exp(-pow(fract(vA - uTime * 0.07 + uPhase * 0.3) - 0.5, 2.0) * 90.0);
            float f = pow(abs(dot(normalize(vN), normalize(vV))), mix(1.4, 0.9, uHalo));
            float a = uAlpha * ends * (0.4 + 0.6 * pulse) * f * (1.0 + travel * 1.6);
            gl_FragColor = vec4(uColor, a);
          }
        `,
      }),
    );

  interface Arc {
    group: THREE.Group;
    base: THREE.Vector3;
    rate: THREE.Vector3;
    x: number;
    y: number;
    mats: THREE.ShaderMaterial[];
  }
  const arcs: Arc[] = [];
  const colours = [raw(pal.glow), raw(pal.bright), raw(pal.glow).lerp(raw(pal.bright), 0.5)];

  for (let i = 0; i < count; i++) {
    const R = fine ? 3.2 + r() * 3.8 : 2.4 + r() * 2.4;
    const tube = fine ? 0.022 : 0.05;
    const arc = fine ? Math.PI * (0.7 + r() * 0.6) : Math.PI * (1.2 + r() * 0.8);
    const phase = r() * 6.28;
    const colour = colours[i % colours.length]!;
    const line = arcMat(colour, fine ? 0.75 : 0.95, false, phase);
    const halo = arcMat(colour, fine ? 0.07 : 0.14, true, phase);
    const group = new THREE.Group();
    const core = new THREE.Mesh(bin.add(new THREE.TorusGeometry(R, tube, 8, 220, arc)), line);
    const glow = new THREE.Mesh(bin.add(new THREE.TorusGeometry(R, tube * 5.5, 8, 140, arc)), halo);
    core.renderOrder = 2;
    glow.renderOrder = 1;
    group.add(glow, core);
    scene.add(group);
    arcs.push({
      group,
      base: new THREE.Vector3(r() * 3.14, r() * 3.14, r() * 3.14),
      rate: new THREE.Vector3((r() - 0.5) * 0.12, (r() - 0.5) * 0.14, (r() - 0.5) * 0.08),
      x: fine ? (r() - 0.5) * 9 : (r() - 0.5) * 3.2,
      y: fine ? (r() - 0.5) * 4 : (r() - 0.5) * 2.2,
      mats: [line, halo],
    });
  }

  return {
    scene,
    camera: cam,
    update(t) {
      const s = t * speed;
      const hw = halfWidth(cam, DIST);
      const ax = (anchor - 0.5) * 2 * hw;
      for (const a of arcs) {
        a.group.rotation.set(a.base.x + s * a.rate.x, a.base.y + s * a.rate.y, a.base.z + s * a.rate.z);
        a.group.position.set(ax + a.x, a.y + 0.15 * Math.sin(s * 0.2 + a.base.x), 0);
        for (const m of a.mats) m.uniforms.uTime!.value = s;
      }
    },
    dispose: bin.dispose,
  };
}
