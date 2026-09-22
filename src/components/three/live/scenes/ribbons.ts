/**
 * RIBBONS — translucent ribbons crossing the frame.
 *
 * Each ribbon follows its own spline across the frame; the geometry carries
 * the path and its tangent, and the vertex shader builds the ribbon around
 * them every frame: the path sways, the ribbon twists about it as it goes,
 * its width swells and narrows. The surface is lit as thin silk: a soft
 * diffuse, a bright rim where it turns edge-on, and glowing edges.
 */
import * as THREE from 'three';

import { backdrop, camera, PALETTES, PALETTE_GLSL, paletteUniforms, rng, tracker, type LiveScene } from '../kit';
import type { LiveSpec } from '../registry';

export function buildRibbons(spec: LiveSpec): LiveScene {
  const bin = tracker();
  const scene = new THREE.Scene();
  const cam = camera(40, 10);
  const pal = PALETTES[spec.tone];
  const r = rng(spec.seed);
  const count = spec.count ?? 3;
  const width = spec.width ?? 1.2;
  const speed = spec.speed ?? 1;

  scene.add(backdrop(bin, { top: pal.mid, bottom: pal.deep, glow: pal.bright, at: [0.3 + r() * 0.4, 0.65], amount: 0.5, spread: 1.6 }).mesh);

  const mats: THREE.ShaderMaterial[] = [];
  const N = 180;
  for (let k = 0; k < count; k++) {
    const y0 = (k - (count - 1) / 2) * 1.7 + (r() - 0.5);
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i < 7; i++) {
      const x = -10 + (20 * i) / 6;
      pts.push(new THREE.Vector3(x, y0 + (r() - 0.5) * 3.4, (k - count / 2) * 0.5 + (r() - 0.5) * 0.4));
    }
    const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal');
    const position = new Float32Array((N + 1) * 2 * 3);
    const tangent = new Float32Array((N + 1) * 2 * 3);
    const along = new Float32Array((N + 1) * 2);
    const across = new Float32Array((N + 1) * 2);
    const index: number[] = [];
    for (let i = 0; i <= N; i++) {
      const s = i / N;
      const p = curve.getPointAt(s);
      const tg = curve.getTangentAt(s);
      for (let j = 0; j < 2; j++) {
        const v = i * 2 + j;
        position.set([p.x, p.y, p.z], v * 3);
        tangent.set([tg.x, tg.y, tg.z], v * 3);
        along[v] = s;
        across[v] = j === 0 ? -1 : 1;
      }
      if (i < N) {
        const a = i * 2;
        index.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
      }
    }
    const geo = bin.add(new THREE.BufferGeometry());
    geo.setAttribute('position', new THREE.BufferAttribute(position, 3));
    geo.setAttribute('aT', new THREE.BufferAttribute(tangent, 3));
    geo.setAttribute('aS', new THREE.BufferAttribute(along, 1));
    geo.setAttribute('aX', new THREE.BufferAttribute(across, 1));
    geo.setIndex(index);

    const mat = bin.add(
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        uniforms: {
          uTime: { value: 0 },
          uSeed: { value: r() * 6.28 },
          uPhase: { value: r() * 6.28 },
          uWidth: { value: width * (0.8 + r() * 0.5) },
          uTwist: { value: 2.0 + r() * 3.0 },
          uShade: { value: k / Math.max(1, count - 1) },
          ...paletteUniforms(pal),
        },
        vertexShader: `
          attribute vec3 aT; attribute float aS; attribute float aX;
          uniform float uTime; uniform float uSeed; uniform float uWidth; uniform float uTwist; uniform float uPhase;
          varying float vS; varying float vX; varying vec3 vN; varying vec3 vV;
          void main() {
            vec3 p = position;
            p.y += 0.4 * sin(aS * 5.0 + uTime * 0.45 + uSeed) + 0.22 * sin(aS * 11.0 - uTime * 0.3 + uSeed * 2.0);
            p.x += 0.18 * sin(aS * 7.0 + uTime * 0.37 + uSeed);
            p.z += 0.3 * sin(aS * 4.0 + uTime * 0.25 + uPhase);
            vec3 t = normalize(aT);
            vec3 n1 = normalize(cross(t, vec3(0.0, 0.0, 1.0)));
            vec3 n2 = normalize(cross(n1, t));
            float tw = aS * uTwist + uTime * 0.3 + uPhase;
            vec3 side = n1 * cos(tw) + n2 * sin(tw);
            float w = uWidth * (0.7 + 0.3 * sin(aS * 3.0 + uTime * 0.2 + uSeed));
            vec3 q = p + side * aX * w;
            vN = normalize(cross(t, side));
            vec4 mv = modelViewMatrix * vec4(q, 1.0);
            vV = normalize(-mv.xyz);
            vS = aS;
            vX = aX;
            gl_Position = projectionMatrix * mv;
          }
        `,
        fragmentShader: `
          ${PALETTE_GLSL}
          uniform float uShade;
          varying float vS; varying float vX; varying vec3 vN; varying vec3 vV;
          void main() {
            vec3 n = normalize(vN);
            if (!gl_FrontFacing) n = -n;
            float f = abs(dot(n, normalize(vV)));
            float rim = pow(1.0 - f, 1.6);
            float lit = dot(n, normalize(vec3(-0.4, 0.7, 0.6))) * 0.5 + 0.5;
            vec3 col = mix(uMid, uBright, lit * 0.75 + uShade * 0.2);
            col += uGlow * (rim * 0.6 + pow(abs(vX), 5.0) * 0.55);
            float a = 0.78 + 0.22 * rim;
            a *= smoothstep(0.0, 0.06, vS) * smoothstep(1.0, 0.94, vS);
            gl_FragColor = vec4(col, a);
          }
        `,
      }),
    );
    const mesh = new THREE.Mesh(geo, mat);
    mesh.frustumCulled = false;
    mesh.renderOrder = k;
    scene.add(mesh);
    mats.push(mat);
  }

  return {
    scene,
    camera: cam,
    update(t) {
      const s = t * speed;
      for (const m of mats) m.uniforms.uTime!.value = s;
    },
    dispose: bin.dispose,
  };
}
