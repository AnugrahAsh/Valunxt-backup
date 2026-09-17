'use client';

/**
 * The live canvas for one hero slide. Loaded only through
 * `next/dynamic(() => import('./HeroAbstractCanvas'), { ssr: false })` in
 * HeroSlideMedia.tsx — same reason as OfficeMap.tsx (see that file's note):
 * Three.js reads `window`/WebGL at module and render time, and only a
 * dynamic import with `ssr: false`, called from a Client Component, skips
 * the server render pass that would otherwise run this once with no GPU
 * behind it.
 *
 * `active` starts and stops the render loop; it does not mount or unmount
 * this component. Six of these can exist on the page (one per hero slide)
 * with only one ever actually rendering a new frame, so switching slides is
 * an instant resume rather than a rebuild — the outgoing scene simply stops
 * on whatever frame it was last drawn, which is what sits under the 1.1s
 * opacity fade in valunxt's hero CSS while the next slide's canvas takes
 * over.
 */
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

import { buildHeroScene, type HeroVariant } from './heroScenes';

export default function HeroAbstractCanvas({
  variant,
  active,
  onReady,
}: {
  variant: HeroVariant;
  active: boolean;
  /** Fired once the first frame has actually been drawn, so the wrapper can
      fade the canvas in over the poster image rather than showing a blank
      or half-initialised one. */
  onReady?: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeRef = useRef(active);
  activeRef.current = active;

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = canvas?.parentElement;
    if (!canvas || !container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'low-power' });
    } catch {
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const built = buildHeroScene(variant);
    const { scene, camera, update, dispose } = built;

    const resize = () => {
      const w = container.clientWidth || 1;
      const h = container.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    const clock = new THREE.Clock();
    let raf = 0;
    let reported = false;

    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!activeRef.current) return;
      const t = clock.getElapsedTime();
      const delta = clock.getDelta();
      update(t, delta);
      renderer.render(scene, camera);
      if (!reported) {
        reported = true;
        onReady?.();
      }
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      dispose();
      renderer.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- variant is the identity of this canvas; onReady is fire-once
  }, [variant]);

  return <canvas ref={canvasRef} className="vxae-hero__three" aria-hidden="true" />;
}
