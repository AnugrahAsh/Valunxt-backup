'use client';

/**
 * An <img> that comes alive when it is one of the site's abstracts.
 *
 * Drop-in for a plain <img>: same props, same markup on the server. If the
 * file it resolved to has a scene in ./registry (or `live` names one), a
 * canvas is added right after the image on the client and the scene is
 * rendered into it by ./host. The image is never removed: it paints first,
 * it is what a crawler and a no-JS visitor see, and it stays for anyone on
 * prefers-reduced-motion or without WebGL, exactly as the hero does
 * (sections/HeroSlideMedia.tsx). The canvas fades in over it once its first
 * frame has drawn.
 *
 * THE CANVAS TAKES THE IMAGE'S CLASSES, so whatever the stylesheet does to
 * the image by class (its opacity, z-index, mask, a hover or an open state
 * that hides it) it does to the canvas too. Only its geometry is set inline:
 * it covers its parent when the parent is positioned, which is every plate
 * on the site, and the image's own box otherwise.
 *
 * `live`: a spec name from ./registry to use instead of the file's default,
 * for the places one file is reused and each needs its own scene. `null`
 * keeps the image static.
 */
import { useEffect, useRef, useState, type ImgHTMLAttributes } from 'react';

import { resolveSpec, type LiveSpec } from './registry';
import type { LiveHandle } from './host';

type Props = ImgHTMLAttributes<HTMLImageElement> & { live?: string | null };

function webglAvailable(): boolean {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

/** Lays the canvas over the image without changing anyone else's layout. */
function place(canvas: HTMLCanvasElement, image: HTMLImageElement) {
  const parent = image.parentElement;
  if (!parent) return;
  const s = canvas.style;
  const ics = getComputedStyle(image);
  s.position = 'absolute';
  s.display = 'block';
  s.pointerEvents = 'none';
  s.margin = '0';
  s.maxWidth = 'none';
  if (getComputedStyle(parent).position !== 'static') {
    s.left = '0';
    s.top = '0';
    s.right = 'auto';
    s.bottom = 'auto';
    s.width = '100%';
    s.height = '100%';
  } else {
    s.left = `${image.offsetLeft}px`;
    s.top = `${image.offsetTop}px`;
    s.width = `${image.offsetWidth}px`;
    s.height = `${image.offsetHeight}px`;
  }
  s.borderRadius = ics.borderRadius;
  s.objectFit = 'fill';
}

export default function LiveImage({ live, className, ...img }: Props) {
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [spec, setSpec] = useState<LiveSpec | null>(null);

  const src = String(img.src ?? '');

  useEffect(() => {
    const s = resolveSpec(live, src);
    if (!s) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!webglAvailable()) return;
    setSpec(s);
  }, [live, src]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const image = imgRef.current;
    if (!spec || !canvas || !image) return;
    let dead = false;
    let handle: LiveHandle | null = null;
    let io: IntersectionObserver | null = null;
    let ro: ResizeObserver | null = null;
    let fadeTimer = 0;

    canvas.style.opacity = '0';
    place(canvas, image);

    import('./host').then(({ host }) => {
      if (dead) return;
      handle = host.register(canvas, spec, {
        onReady: () => {
          /* Fade up to whatever opacity the classes give it (an inline value
             would pin it there and defeat any state rule that hides it). */
          canvas.style.transition = 'opacity .9s ease';
          requestAnimationFrame(() => canvas.style.removeProperty('opacity'));
          fadeTimer = window.setTimeout(() => canvas.style.removeProperty('transition'), 1100);
        },
      });
      const measure = () => {
        place(canvas, image);
        handle?.setSize(canvas.offsetWidth, canvas.offsetHeight);
      };
      measure();
      ro = new ResizeObserver(measure);
      ro.observe(canvas);
      ro.observe(image);
      io = new IntersectionObserver(([en]) => handle?.setActive(!!en?.isIntersecting), { rootMargin: '15% 0px' });
      io.observe(canvas);
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
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img ref={imgRef} className={className} {...img} />
      {spec ? <canvas ref={canvasRef} className={`${className ? `${className} ` : ''}vxn-live`} aria-hidden="true" /> : null}
    </>
  );
}
