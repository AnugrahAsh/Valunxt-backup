'use client';

/**
 * One hero slide's image, live where a hand-modeled 3D scene exists for it
 * (20260917, client instruction — every abstract on the UAE home page's hero
 * rebuilt as a moving Three.js scene). HomeAeBody (a Server Component) still
 * resolves the banner path with rimgFirst() exactly as before and hands it
 * here; this component decides, client-side only, whether that path has a
 * matching scene and whether this visitor should see it.
 *
 * THE IMAGE NEVER STOPS BEING RENDERED. It is what paints first (this is the
 * slide's whole visual until the canvas is ready), what a crawler or a
 * no-JS visitor sees, and what stays on screen for anyone on
 * prefers-reduced-motion, a browser with no WebGL, or a context Three.js
 * fails to acquire (a canvas element cap, a lost context, a driver
 * blacklist) — client instruction was the static original image on exactly
 * those paths, never a broken or blank slide. The canvas, when it mounts, is
 * an absolutely-positioned layer on top that fades in only once its first
 * frame has actually drawn.
 *
 * ACTIVE TRACKING: the slider itself is the plain vanilla-JS engine already
 * in HomeAeBody (ClientScript#uae-hero-js) toggling `.is-active` on this
 * image's ancestor `[data-vxae-slide]`; this component does not touch that
 * engine; it only watches the class it already sets, and only to start or
 * stop this one slide's render loop; the fade between two slides remains
 * exactly the CSS opacity transition it always was.
 */
import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

import { variantForBanner } from '@/components/three/heroScenes';

const HeroAbstractCanvas = dynamic(() => import('@/components/three/HeroAbstractCanvas'), { ssr: false });

function webglAvailable(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

export default function HeroSlideMedia({
  src,
  priority,
}: {
  src: string;
  priority: boolean;
}) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [live, setLive] = useState(false);
  const [active, setActive] = useState(false);
  const [ready, setReady] = useState(false);

  const variant = variantForBanner(src);

  useEffect(() => {
    if (!variant) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!webglAvailable()) return;
    setLive(true);
  }, [variant]);

  useEffect(() => {
    if (!live) return;
    const slide = imgRef.current?.closest('[data-vxae-slide]');
    if (!slide) return;

    const sync = () => setActive(slide.classList.contains('is-active'));
    sync();
    const mo = new MutationObserver(sync);
    mo.observe(slide, { attributes: true, attributeFilter: ['class'] });
    return () => mo.disconnect();
  }, [live]);

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={src}
        alt=""
        width={1685}
        height={950}
        {...(priority ? { fetchPriority: 'high' as const } : { loading: 'lazy' as const })}
      />
      {live && variant ? (
        <div className={`vxae-hero__threewrap${ready ? ' is-ready' : ''}`}>
          <HeroAbstractCanvas variant={variant} active={active} onReady={() => setReady(true)} />
        </div>
      ) : null}
    </>
  );
}
