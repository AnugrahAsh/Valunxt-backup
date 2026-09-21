'use client';

/**
 * One of the practice's own live abstracts (components/three/estateScenes.ts)
 * in a panel. None of them repeats the home page hero's four scenes.
 *
 * The panel paints the scene's gradient first, so it is never an empty box;
 * the canvas fades in over it once its first frame has drawn. It only renders
 * while the panel is on screen (an IntersectionObserver drives `active`).
 * Reduced motion draws one still frame; no WebGL leaves the gradient.
 */
import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

import type { EstateVariant } from '../three/estateScenes';

const EstateCanvas = dynamic(() => import('../three/EstateCanvas'), { ssr: false });

function webglAvailable(): boolean {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

export default function LiveAbstract({ variant, className }: { variant: EstateVariant; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [live, setLive] = useState(false);
  const [still, setStill] = useState(false);
  const [active, setActive] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!webglAvailable()) return;
    setStill(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    setLive(true);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!live || !el) return;
    const io = new IntersectionObserver(([e]) => setActive(!!e?.isIntersecting), { rootMargin: '10% 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, [live]);

  return (
    <div className={`re-l-live re-l-live--${variant}${className ? ` ${className}` : ''}${ready ? ' is-ready' : ''}`} ref={ref} aria-hidden="true">
      {live ? (
        <div className="re-l-live__wrap">
          <EstateCanvas variant={variant} active={active} still={still} onReady={() => setReady(true)} />
        </div>
      ) : null}
    </div>
  );
}
