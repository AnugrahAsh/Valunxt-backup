'use client';

/**
 * A live abstract behind a box whose artwork used to be a CSS background
 * (the Elementor containers and the menu art, where there is no <img> for
 * LiveImage to stand beside).
 *
 * Renders a layer that fills its parent: the canvas, and over it the scrim
 * the background used to carry (`overlay`, any CSS background value), so the
 * type on the box keeps the contrast it had. Without WebGL, or on
 * prefers-reduced-motion, only the scrim renders and the box's own CSS
 * background shows through it as before. The parent must be positioned;
 * every box this is used in already is.
 */
import { useEffect, useRef, useState } from 'react';

import { resolveSpec, type LiveSpec } from './registry';
import type { LiveHandle } from './host';

function webglAvailable(): boolean {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

export default function LiveBackdrop({
  live,
  src,
  overlay,
  z = 0,
  className,
}: {
  /** A spec name from ./registry. */
  live?: string;
  /** Or the file the box's background resolved to; nothing renders for a photograph. */
  src?: string;
  overlay?: string;
  z?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [spec, setSpec] = useState<LiveSpec | null>(null);

  useEffect(() => {
    const s = resolveSpec(live, src ?? '');
    if (!s) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!webglAvailable()) return;
    setSpec(s);
  }, [live, src]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const box = ref.current;
    if (!spec || !canvas || !box) return;
    let dead = false;
    let handle: LiveHandle | null = null;
    let io: IntersectionObserver | null = null;
    let ro: ResizeObserver | null = null;
    let fadeTimer = 0;

    import('./host').then(({ host }) => {
      if (dead) return;
      handle = host.register(canvas, spec, {
        onReady: () => {
          canvas.style.transition = 'opacity .9s ease';
          requestAnimationFrame(() => {
            canvas.style.opacity = '1';
          });
          fadeTimer = window.setTimeout(() => canvas.style.removeProperty('transition'), 1100);
        },
      });
      const measure = () => handle?.setSize(box.offsetWidth, box.offsetHeight);
      measure();
      ro = new ResizeObserver(measure);
      ro.observe(box);
      io = new IntersectionObserver(([en]) => handle?.setActive(!!en?.isIntersecting), { rootMargin: '15% 0px' });
      io.observe(box);
    });

    return () => {
      dead = true;
      window.clearTimeout(fadeTimer);
      io?.disconnect();
      ro?.disconnect();
      handle?.destroy();
    };
  }, [spec]);

  return (
    <span
      ref={ref}
      className={`vxn-livebg${className ? ` ${className}` : ''}`}
      aria-hidden="true"
      style={{ position: 'absolute', inset: 0, zIndex: z, overflow: 'hidden', borderRadius: 'inherit', pointerEvents: 'none', display: 'block' }}
    >
      {spec ? (
        <canvas
          ref={canvasRef}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block', opacity: 0 }}
        />
      ) : null}
      {overlay ? <span style={{ position: 'absolute', inset: 0, display: 'block', background: overlay }} /> : null}
    </span>
  );
}
