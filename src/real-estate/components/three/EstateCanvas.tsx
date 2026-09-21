'use client';

/**
 * The live canvas for one of the practice's own abstracts (estateScenes.ts).
 * Loaded only through next/dynamic(ssr: false) from LiveAbstract.tsx, since
 * Three.js needs `window` and a GPU.
 *
 * The first frame is always drawn, so a panel is never blank. After that the
 * loop runs only while `active` (the panel is on screen) and not `still`
 * (reduced motion), which keeps a page with several of these to one or two
 * live render loops at a time.
 */
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

import { buildEstateScene, type EstateVariant } from './estateScenes';

export default function EstateCanvas({
  variant,
  active,
  still,
  onReady,
}: {
  variant: EstateVariant;
  active: boolean;
  still?: boolean;
  onReady?: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeRef = useRef(active);
  activeRef.current = active && !still;

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    if (!canvas || !host) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'low-power' });
    } catch {
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));

    const { scene, camera, update, dispose } = buildEstateScene(variant);
    const resize = () => {
      const w = host.clientWidth || 1;
      const h = host.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();

    /* The clock only advances while the loop runs, so a scene resumes where
       it paused rather than jumping ahead. */
    const clock = { elapsedTime: 0, last: performance.now() };
    const ro = new ResizeObserver(() => {
      resize();
      if (!activeRef.current) {
        update(clock.elapsedTime);
        renderer.render(scene, camera);
      }
    });
    ro.observe(host);

    let raf = 0;
    let drawn = false;
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - clock.last) / 1000);
      clock.last = now;
      if (drawn && !activeRef.current) return;
      if (activeRef.current) clock.elapsedTime += dt;
      update(clock.elapsedTime);
      renderer.render(scene, camera);
      if (!drawn) {
        drawn = true;
        onReady?.();
      }
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      dispose();
      renderer.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- variant is the identity of this canvas; onReady is fire-once
  }, [variant]);

  return <canvas ref={canvasRef} className="re-l-live__canvas" aria-hidden="true" />;
}
