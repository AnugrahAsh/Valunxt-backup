'use client';

/**
 * The about page's hero artwork: the Valunxt "x", made of light.
 *
 * Several thousand particles are sampled from the mark's own outlines
 * (components/brand/LogoX.tsx — the same geometry as the wordmark), fly in
 * from a scattered cloud on load and settle into the letterform, then keep
 * breathing: each drifts on its own small orbit and twinkles. The pointer
 * pushes them aside and forward as it passes; scrolling away from the hero
 * lets the mark dissolve back into the cloud. A few hundred slower motes
 * hang around it for depth. Colour runs across the mark from the brand blue
 * to the violet of the wordmark's x.
 *
 * One WebGL context, rendered only while the hero is on screen and the tab is
 * visible. Reduced motion draws the settled mark once and stops.
 */
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

import { BOX, X_PATHS } from '@/components/brand/LogoX';

function raw(hex: string): THREE.Color {
  return new THREE.Color().setStyle(hex, THREE.LinearSRGBColorSpace);
}

/** Points inside the glyph, from a filled 2D render of its paths. World width 6.4. */
function sampleMark(count: number): Float32Array {
  const W = 560;
  const H = Math.round((W * BOX.h) / BOX.w);
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const g = c.getContext('2d');
  const out = new Float32Array(count * 3);
  if (!g) return out;
  g.setTransform(W / BOX.w, 0, 0, H / BOX.h, (-BOX.x * W) / BOX.w, (-BOX.y * H) / BOX.h);
  g.fillStyle = '#fff';
  for (const d of X_PATHS) g.fill(new Path2D(d));
  const px = g.getImageData(0, 0, W, H).data;
  const inside: number[] = [];
  for (let y = 0; y < H; y += 2) for (let x = 0; x < W; x += 2) if (px[(y * W + x) * 4 + 3] > 128) inside.push(x, y);
  const n = inside.length / 2;
  const s = 6.4 / W;
  for (let i = 0; i < count; i++) {
    const k = Math.floor(Math.random() * n);
    out[i * 3] = (inside[k * 2]! + Math.random() * 2 - W / 2) * s;
    out[i * 3 + 1] = -(inside[k * 2 + 1]! + Math.random() * 2 - H / 2) * s;
    out[i * 3 + 2] = (Math.random() - 0.5) * 0.55;
  }
  return out;
}

export default function XField({ onReady }: { onReady?: () => void }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const host = canvas?.parentElement;
    const hero = canvas?.closest('section');
    if (!canvas || !host || !hero) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
    } catch {
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const small = window.innerWidth < 760;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 16 / 9, 0.1, 100);
    camera.position.set(0, 0, 12);

    /* The ground: a full-frame gradient drawn first, so the canvas is opaque
       and additive light has something dark to add to. */
    const bgMat = new THREE.ShaderMaterial({
      depthWrite: false,
      depthTest: false,
      uniforms: { uAt: { value: new THREE.Vector2(0.72, 0.5) } },
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
      fragmentShader: `
        uniform vec2 uAt; varying vec2 vUv;
        void main(){
          vec3 deep = vec3(0.012, 0.03, 0.14);
          vec3 blue = vec3(0.02, 0.09, 0.55);
          vec3 violet = vec3(0.22, 0.02, 0.42);
          float g = exp(-pow(length((vUv - uAt) * vec2(1.5, 1.0)) * 2.1, 2.0));
          float v = exp(-pow(length((vUv - vec2(0.95, 0.12)) * vec2(1.4, 1.0)) * 2.6, 2.0));
          vec3 c = deep + blue * g * 0.9 + violet * v * 0.5;
          gl_FragColor = vec4(c, 1.0);
        }
      `,
    });
    const bg = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), bgMat);
    bg.frustumCulled = false;
    bg.renderOrder = -1;
    scene.add(bg);

    const NX = small ? 5200 : 10000;
    const ND = small ? 600 : 1200;
    const N = NX + ND;
    const home = new Float32Array(N * 3);
    const start = new Float32Array(N * 3);
    const seed = new Float32Array(N);
    const kind = new Float32Array(N);
    home.set(sampleMark(NX));
    for (let i = 0; i < N; i++) {
      const dust = i >= NX;
      if (dust) {
        home[i * 3] = (Math.random() - 0.5) * 20;
        home[i * 3 + 1] = (Math.random() - 0.5) * 11;
        home[i * 3 + 2] = -Math.random() * 6 + 1.5;
      }
      const r = 7 + Math.random() * 9;
      const a = Math.random() * Math.PI * 2;
      const b = (Math.random() - 0.5) * Math.PI;
      start[i * 3] = Math.cos(a) * Math.cos(b) * r;
      start[i * 3 + 1] = Math.sin(b) * r * 0.7;
      start[i * 3 + 2] = Math.sin(a) * Math.cos(b) * r * 0.6;
      seed[i] = Math.random();
      kind[i] = dust ? 1 : 0;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(home, 3));
    geo.setAttribute('aStart', new THREE.BufferAttribute(start, 3));
    geo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
    geo.setAttribute('aKind', new THREE.BufferAttribute(kind, 1));

    const mat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uIntro: { value: still ? 1 : 0 },
        uScroll: { value: 0 },
        uPointer: { value: new THREE.Vector2(99, 99) },
        uPointerOn: { value: 0 },
        uSize: { value: small ? 3.2 : 3.6 },
        uPR: { value: renderer.getPixelRatio() },
        uA: { value: raw('#5A86FF') },
        uB: { value: raw('#C77BFF') },
        uC: { value: raw('#8FB7FF') },
      },
      vertexShader: `
        uniform float uTime; uniform float uIntro; uniform float uScroll; uniform float uSize; uniform float uPR;
        uniform vec2 uPointer; uniform float uPointerOn;
        attribute vec3 aStart; attribute float aSeed; attribute float aKind;
        varying float vA; varying float vMix; varying float vKind;
        void main(){
          float p = clamp((uIntro - aSeed * 0.45) / 0.55, 0.0, 1.0);
          p = 1.0 - pow(1.0 - p, 3.0);
          float settle = mix(p, 1.0, aKind);
          vec3 drift = vec3(sin(uTime * 0.6 + aSeed * 40.0), cos(uTime * 0.5 + aSeed * 31.0), sin(uTime * 0.4 + aSeed * 17.0)) * mix(0.028, 0.28, aKind);
          vec3 pos = mix(aStart, position, settle) + drift;
          pos += (aStart - position) * uScroll * 0.6 * (1.0 - aKind);
          vec2 d = pos.xy - uPointer;
          float f = exp(-dot(d, d) * 1.5) * uPointerOn * (1.0 - aKind * 0.7);
          pos.xy += normalize(d + vec2(0.0001)) * f * 0.6;
          pos.z += f * 1.1;
          vec4 mv = modelViewMatrix * vec4(pos, 1.0);
          gl_Position = projectionMatrix * mv;
          float tw = 0.7 + 0.3 * sin(uTime * 2.3 + aSeed * 60.0);
          gl_PointSize = uSize * mix(1.0, 0.85, aKind) * tw * (1.0 + f * 1.4) * uPR * (12.0 / -mv.z);
          vA = mix(1.0, 0.32, aKind) * mix(settle, uIntro, aKind) * (1.0 - uScroll * 0.55);
          vMix = clamp((position.x + 3.2) / 6.4, 0.0, 1.0);
          vKind = aKind;
        }
      `,
      fragmentShader: `
        uniform vec3 uA; uniform vec3 uB; uniform vec3 uC;
        varying float vA; varying float vMix; varying float vKind;
        void main(){
          float d = length(gl_PointCoord - 0.5);
          float a = smoothstep(0.5, 0.05, d);
          vec3 col = mix(uA, uB, smoothstep(0.42, 0.98, vMix));
          col = mix(col, uC, vKind * 0.7);
          gl_FragColor = vec4(col, a * vA);
        }
      `,
    });
    const group = new THREE.Group();
    const points = new THREE.Points(geo, mat);
    points.frustumCulled = false;
    group.add(points);
    scene.add(group);

    const layout = () => {
      const w = host.clientWidth || 1;
      const h = host.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      const wide = camera.aspect > 1.15;
      const halfH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
      const halfW = halfH * camera.aspect;
      /* Wide: the mark sits in the right half, its right edge short of the
         frame, sized to the height. Narrow: centred above the copy. */
      const k = wide ? Math.min((halfH * 1.2) / 5.7, (halfW * 0.78) / 6.4) : Math.min(0.9, (halfW * 1.6) / 6.4);
      group.scale.setScalar(k);
      group.position.set(wide ? Math.max(halfW * 0.3, halfW * 0.92 - 3.2 * k) : 0, wide ? 0.25 : halfH * 0.34, 0);
      bgMat.uniforms.uAt.value.set(wide ? 0.72 : 0.5, wide ? 0.5 : 0.7);
    };
    layout();
    const ro = new ResizeObserver(layout);
    ro.observe(host);

    /* The pointer, in the group's own plane. */
    const target = new THREE.Vector2(99, 99);
    let on = 0;
    let onTarget = 0;
    let tiltX = 0;
    let tiltY = 0;
    const move = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      const nx = ((e.clientX - r.left) / r.width) * 2 - 1;
      const ny = -(((e.clientY - r.top) / r.height) * 2 - 1);
      const halfH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
      const halfW = halfH * camera.aspect;
      target.set((nx * halfW - group.position.x) / group.scale.x, (ny * halfH - group.position.y) / group.scale.x);
      tiltX = nx;
      tiltY = ny;
      onTarget = 1;
    };
    const leave = () => {
      onTarget = 0;
      tiltX = 0;
      tiltY = 0;
    };
    hero.addEventListener('pointermove', move);
    hero.addEventListener('pointerleave', leave);

    let visible = true;
    const io = new IntersectionObserver(([e]) => {
      visible = !!e?.isIntersecting;
    });
    io.observe(hero);

    let raf = 0;
    let last = performance.now();
    let t = 0;
    let drawn = false;
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (drawn && (still || !visible || document.hidden)) return;
      t += dt;
      const u = mat.uniforms;
      u.uTime.value = t;
      if (!still) u.uIntro.value = Math.min(1, u.uIntro.value + dt / 2.6);
      const sc = Math.min(1, Math.max(0, window.scrollY / (hero.offsetHeight || 1)));
      u.uScroll.value += (sc - u.uScroll.value) * 0.12;
      on += (onTarget - on) * 0.08;
      u.uPointerOn.value = on;
      u.uPointer.value.lerp(target, 0.18);
      group.rotation.y += (Math.sin(t * 0.28) * 0.3 + tiltX * 0.22 - group.rotation.y) * 0.05;
      group.rotation.x += (-tiltY * 0.12 - group.rotation.x) * 0.05;
      renderer.render(scene, camera);
      if (!drawn) {
        drawn = true;
        onReady?.();
      }
    };
    raf = requestAnimationFrame(frame);

    /* A tab opened in the background, or a throttled embed, may not give a
       single animation frame for a long time. Rather than leave a blank
       panel, draw the settled mark once; the loop picks up from there as
       soon as frames arrive. */
    const fallback = window.setTimeout(() => {
      if (drawn) return;
      mat.uniforms.uIntro.value = 1;
      renderer.render(scene, camera);
      drawn = true;
      onReady?.();
    }, 700);

    return () => {
      window.clearTimeout(fallback);
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      hero.removeEventListener('pointermove', move);
      hero.removeEventListener('pointerleave', leave);
      geo.dispose();
      mat.dispose();
      bg.geometry.dispose();
      bgMat.dispose();
      renderer.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mounted once; onReady is fire-once
  }, []);

  return <canvas ref={ref} aria-hidden="true" />;
}
