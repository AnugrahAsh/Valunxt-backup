/**
 * TORUS — a glass loop turning in the light.
 *
 * A ring (or a knotted loop, for `knot`) shaded as thick blue glass: the
 * face darkens toward the camera and lights at the rim, and two sweeps of
 * reflected light cross it as it turns. The back faces are drawn first and
 * dimmer, so the far side shows through the near side the way glass does.
 * A soft light sits behind it on the ground. Anchored to one side of the
 * frame so copy can sit on the other.
 */
import * as THREE from 'three';

import { backdrop, camera, halfWidth, PALETTES, PALETTE_GLSL, paletteUniforms, raw, rng, tracker, type LiveScene } from '../kit';
import type { LiveSpec } from '../registry';

export function buildTorus(spec: LiveSpec): LiveScene {
  const bin = tracker();
  const scene = new THREE.Scene();
  const DIST = 10;
  const cam = camera(36, DIST);
  const pal = PALETTES[spec.tone];
  const r = rng(spec.seed);
  const anchor = spec.anchor ?? 0.7;
  const knot = !!spec.knot;
  const speed = spec.speed ?? 1;

  scene.add(backdrop(bin, { top: pal.mid, bottom: pal.deep, glow: pal.bright, at: [anchor, 0.5], amount: 0.7, spread: 1.5 }).mesh);

  const geo = bin.add(knot ? new THREE.TorusKnotGeometry(2.0, 0.6, 400, 48, 2, 3) : new THREE.TorusGeometry(2.8, 1.0, 72, 240));

  const glass = (side: THREE.Side, dim: number) =>
    bin.add(
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        side,
        uniforms: {
          uTime: { value: 0 },
          uDim: { value: dim },
          uLight: { value: new THREE.Vector3(-0.6, 0.7, 0.4) },
          ...paletteUniforms(pal),
        },
        vertexShader: `
          varying vec3 vN; varying vec3 vV; varying vec3 vW;
          void main() {
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            vN = normalize(normalMatrix * normal);
            vV = normalize(-mv.xyz);
            vW = position;
            gl_Position = projectionMatrix * mv;
          }
        `,
        fragmentShader: `
          ${PALETTE_GLSL}
          uniform float uTime; uniform float uDim; uniform vec3 uLight;
          varying vec3 vN; varying vec3 vV; varying vec3 vW;
          void main() {
            vec3 n = normalize(vN);
            if (!gl_FrontFacing) n = -n;
            vec3 V = normalize(vV);
            float f = 1.0 - abs(dot(n, V));
            float rim = pow(f, 2.4);
            vec3 R = reflect(-V, n);
            float sweep = pow(max(dot(R, normalize(uLight)), 0.0), 34.0);
            float sweep2 = pow(max(dot(R, normalize(vec3(0.7, -0.3, 0.55))), 0.0), 70.0) * 0.55;
            float grad = clamp(vW.y * 0.18 + 0.5, 0.0, 1.0);
            vec3 face = mix(uDeep, uMid, grad * 0.8 + 0.2 * sin(uTime * 0.3 + vW.x * 0.8));
            face = mix(face, uBright, pow(f, 1.2) * 0.5);
            vec3 col = mix(face, uGlow, rim * 0.9) + uGlow * (sweep * 1.1 + sweep2);
            float a = mix(0.6, 0.97, rim) * uDim;
            gl_FragColor = vec4(col, a);
          }
        `,
      }),
    );

  const group = new THREE.Group();
  const back = new THREE.Mesh(geo, glass(THREE.BackSide, 0.55));
  const front = new THREE.Mesh(geo, glass(THREE.FrontSide, 1.0));
  back.renderOrder = 1;
  front.renderOrder = 2;
  group.add(back, front);
  scene.add(group);

  /* The soft light behind the loop. */
  const haloMat = bin.add(
    new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uColor: { value: raw(pal.bright) }, uAlpha: { value: 0.45 } },
      vertexShader: `
        varying vec2 vUv;
        void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
      `,
      fragmentShader: `
        uniform vec3 uColor; uniform float uAlpha;
        varying vec2 vUv;
        void main() {
          float d = distance(vUv, vec2(0.5)) * 2.0;
          float a = pow(1.0 - clamp(d, 0.0, 1.0), 2.2) * uAlpha;
          gl_FragColor = vec4(uColor, a);
        }
      `,
    }),
  );
  const halo = new THREE.Mesh(bin.add(new THREE.PlaneGeometry(9, 9)), haloMat);
  halo.position.z = -2.5;
  halo.renderOrder = 0;
  group.add(halo);

  const rx = 0.55 + (r() - 0.5) * 0.3;
  const phase = r() * 6.28;
  const mats = [back.material as THREE.ShaderMaterial, front.material as THREE.ShaderMaterial];

  return {
    scene,
    camera: cam,
    update(t) {
      const s = t * speed;
      group.position.x = (anchor - 0.5) * 2 * halfWidth(cam, DIST);
      group.position.y = 0.15 * Math.sin(s * 0.21);
      group.rotation.set(rx + 0.22 * Math.sin(s * 0.13), s * 0.1 + phase, 0.15 * Math.sin(s * 0.09));
      halo.rotation.set(-group.rotation.x, -group.rotation.y, -group.rotation.z);
      haloMat.uniforms.uAlpha!.value = 0.4 + 0.1 * Math.sin(s * 0.4);
      for (const m of mats) {
        m.uniforms.uTime!.value = s;
        (m.uniforms.uLight!.value as THREE.Vector3).set(-0.6 + 0.3 * Math.sin(s * 0.17), 0.7, 0.4 + 0.2 * Math.sin(s * 0.11));
      }
    },
    dispose: bin.dispose,
  };
}
