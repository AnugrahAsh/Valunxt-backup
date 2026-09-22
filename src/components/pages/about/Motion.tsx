'use client';

/**
 * The about page's arrivals, counters and spotlights, in one pass.
 *
 *   [data-ab]       up | scale | left — hidden on mount by this file, played
 *                   on Framer Motion the first time it scrolls in, staggered
 *                   by [data-ab-i]. Nothing is hidden in the markup, so with
 *                   the bundle blocked or reduced motion on the page renders
 *                   whole.
 *   [data-count]    rolls up from zero to the figure it already shows.
 *   .ab-spot        tracks the pointer in --mx / --my for a light under it.
 */
import { useEffect } from 'react';
import { animate, inView, motionValue } from 'framer-motion';

const FROM: Record<string, { opacity: number; y?: number; x?: number; scale?: number }> = {
  up: { opacity: 0, y: 44 },
  left: { opacity: 0, x: -44 },
  scale: { opacity: 0, scale: 0.94 },
};

export default function AboutMotion() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>('.ab-root');
    if (!root) return;
    const stops: (() => void)[] = [];
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!still) {
      const vh = window.innerHeight || 800;
      root.querySelectorAll<HTMLElement>('[data-ab]').forEach((el) => {
        const from = FROM[el.dataset.ab || 'up'] ?? FROM.up!;
        const r = el.getBoundingClientRect();
        if (r.bottom < 0) return;
        el.style.opacity = '0';
        el.style.transform = `translate(${from.x ?? 0}px, ${from.y ?? 0}px) scale(${from.scale ?? 1})`;
        const delay = Math.min(Number(el.dataset.abI || 0), 6) * 0.08;
        const play = () =>
          animate(el, { opacity: 1, x: 0, y: 0, scale: 1 }, { duration: 0.95, ease: [0.22, 1, 0.36, 1], delay }).then(() => {
            el.style.removeProperty('opacity');
            el.style.removeProperty('transform');
          });
        if (r.top < vh * 0.9) {
          const t = window.setTimeout(play, 80);
          stops.push(() => window.clearTimeout(t));
        } else stops.push(inView(el, () => void play(), { margin: '0px 0px -10% 0px' }));
      });

      root.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => {
        const target = Number(el.dataset.count);
        if (!Number.isFinite(target)) return;
        const final = el.textContent || '';
        const pad = final.length;
        const mv = motionValue(0);
        stops.push(
          inView(
            el,
            () => {
              const unsub = mv.on('change', (v) => {
                el.textContent = String(Math.round(v)).padStart(pad, '0');
              });
              animate(mv, target, { duration: 1.6, ease: [0.22, 1, 0.36, 1], delay: 0.2 }).then(() => {
                unsub();
                el.textContent = final;
              });
            },
            { amount: 0.6 },
          ),
        );
      });
    }

    root.querySelectorAll<HTMLElement>('.ab-spot').forEach((el) => {
      const move = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        el.style.setProperty('--mx', `${e.clientX - r.left}px`);
        el.style.setProperty('--my', `${e.clientY - r.top}px`);
      };
      el.addEventListener('pointermove', move);
      stops.push(() => el.removeEventListener('pointermove', move));
    });

    return () => stops.forEach((f) => f());
  }, []);
  return null;
}
