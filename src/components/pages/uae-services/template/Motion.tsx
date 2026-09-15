'use client';

/**
 * The UAE service template's motion layer.
 *
 * WORKS BY SELECTOR, NOT BY WRAPPER. The alternative is a <Reveal> around every
 * block, which means the body file carries animation concerns in forty places
 * and anything added later has to remember to opt in. This reads a table and
 * animates whatever matches.
 *
 * THE SAFETY RULE. Reveal animations are the standard way to ship an invisible
 * page: the stylesheet sets opacity 0, the observer never fires, and the content
 * is simply gone. So the stylesheet's default is VISIBLE, and the hidden state
 * exists only under `[data-anim='pending']` — an attribute this file sets. If
 * the bundle fails to load, is blocked, or throws, every section renders
 * normally. Two further guards: anything already on screen when this runs is
 * revealed rather than left waiting for an intersection that will not come, and
 * a timeout sweeps the whole page after four seconds whatever the observer did.
 *
 * THE PLATES. `.at-zoom` media is driven by one rAF loop over whatever is
 * currently in view — not a scroll listener per element — and it writes two
 * custom properties the stylesheet turns into a transform:
 *
 *   --at-z   scale. 1 mid-screen, lifting to 1.12 at either end of the
 *            element's travel: a zoom-out as it arrives, back in as it leaves.
 *   --at-p   drift, -1..1 across the same travel. The stylesheet multiplies it
 *            into a translate so a plate moves against the scroll while the
 *            copy over it stays put. Parallax and zoom share one loop and one
 *            measurement, because they are the same measurement.
 *
 * Both are written as properties rather than as a transform string so the
 * stylesheet keeps control of the curve, the distance and the axis — a plate
 * behind a full-bleed banner wants a different throw from one inside a card.
 *
 * COST. One IntersectionObserver for the reveals, one for the zoom's in-view
 * set, one rAF loop that only runs while something is in view and stops itself
 * when nothing is. Revealed elements are unobserved.
 */

import { useEffect } from 'react';

/** What reveals, and how. `stagger` walks siblings of one parent in sequence. */
const GROUPS: { sel: string; variant: string; stagger?: boolean }[] = [
  { sel: '.at-sec__head', variant: 'up' },
  { sel: '.at-hero__copy > *', variant: 'up', stagger: true },
  { sel: '.at-intro__top > *', variant: 'up', stagger: true },
  { sel: '.at-intro__point', variant: 'up', stagger: true },
  { sel: '.at-intro__figure', variant: 'right' },
  { sel: '.at-prob__panel > *', variant: 'up', stagger: true },
  /* THE INNER, NOT THE PANEL. Revealing .at-acc__panel put data-anim on the
     element that owns the strip's flex-grow transition, and [data-anim='in']
     sets the whole `transition` shorthand at equal specificity from further
     down the stylesheet — so it replaced 'flex-grow 1.35s' with the reveal's
     own list and the panel snapped open with no transition at all. Revealing
     the inner keeps the staggered entrance and leaves the panel's transition
     to the panel. */
  { sel: '.at-acc__inner', variant: 'up', stagger: true },
  /* The satin chooser (SolutionSatin.tsx, 20260915): the card arrives whole. */
  { sel: '.at-sat__card', variant: 'up' },
  { sel: '.at-rel__card', variant: 'up', stagger: true },
  { sel: '.at-talk__fig', variant: 'left' },
  { sel: '.at-talk__copy > *', variant: 'up', stagger: true },
];

/** One reveal group: what matches `sel` arrives with `variant`. */
export interface MotionGroup {
  sel: string;
  variant: string;
  stagger?: boolean;
}

/**
 * `extra` (20260911): groups a page on this template adds to the table above,
 * so the UAE services index can reveal its own sections with the same engine
 * rather than carrying a second copy of it.
 */
export default function ServiceTemplateMotion({ extra = [] }: { extra?: MotionGroup[] }) {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>('.at-root');
    if (!root) return;

    /* Asked for less motion: nothing is marked pending, so the stylesheet's
       visible default stands and no loop ever starts. */
    if (
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      typeof IntersectionObserver === 'undefined'
    ) {
      return;
    }

    const cleanups: (() => void)[] = [];

    /* ---------- 1. Reveal on scroll ---------- */

    const show = (el: Element) => {
      (el as HTMLElement).dataset.anim = 'in';
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          show(e.target);
          io.unobserve(e.target);
        }
      },
      /* A little past the fold, so a block has finished arriving by the time
         the reader's eye reaches it rather than animating under their nose. */
      { rootMargin: '0px 0px -10% 0px', threshold: 0.08 },
    );
    cleanups.push(() => io.disconnect());

    const pending: HTMLElement[] = [];
    for (const g of [...GROUPS, ...extra]) {
      const els = [...root.querySelectorAll<HTMLElement>(g.sel)];
      /* Stagger is per parent: two card grids on the page each count from
         their own first child rather than the second grid starting at the
         delay the first one finished on. */
      const seen = new Map<Element, number>();
      for (const el of els) {
        el.dataset.anim = 'pending';
        el.dataset.animVariant = g.variant;
        if (g.stagger && el.parentElement) {
          const n = seen.get(el.parentElement) ?? 0;
          seen.set(el.parentElement, n + 1);
          /* Capped: an eight-panel strip should not make the last one wait
             most of a second after the first. */
          el.style.setProperty('--at-delay', `${Math.min(n, 7) * 70}ms`);
        }
        pending.push(el);
        io.observe(el);
      }
    }

    /* Anything already on screen when this runs never gets an intersection
       change, so reveal it now. */
    const vh = window.innerHeight || 0;
    for (const el of pending) {
      const r = el.getBoundingClientRect();
      if (r.top < vh && r.bottom > 0) {
        show(el);
        io.unobserve(el);
      }
    }

    /* Last resort. If anything is still pending after four seconds — a browser
       that fires no intersections, an element inside a container that never
       scrolls — it becomes visible anyway. */
    const sweep = window.setTimeout(() => {
      for (const el of pending) if (el.dataset.anim === 'pending') show(el);
    }, 4000);
    cleanups.push(() => window.clearTimeout(sweep));

    /* ---------- 2. Zoom on scroll ---------- */

    const zoomers = [...root.querySelectorAll<HTMLElement>('.at-zoom')];
    if (zoomers.length) {
      const inView = new Set<HTMLElement>();
      let frame = 0;

      const paint = () => {
        frame = 0;
        const h = window.innerHeight || 1;
        for (const el of inView) {
          const r = el.getBoundingClientRect();
          /* 0 when the element's top sits at the bottom of the viewport, 1
             when its bottom has reached the top — its whole travel across the
             screen, whatever its height. */
          const span = r.height + h || 1;
          const p = Math.min(1, Math.max(0, (h - r.top) / span));
          /* Scaled up at both ends and settled at 1 in the middle: a zoom-out
             as it arrives, a zoom back in as it leaves. */
          const away = Math.abs(p - 0.5) * 2;
          el.style.setProperty('--at-z', (1 + away * 0.12).toFixed(4));
          /* -1 at the bottom of its travel, +1 at the top. The stylesheet
             decides how far that throws and on which axis. */
          el.style.setProperty('--at-p', (p * 2 - 1).toFixed(4));
        }
        if (inView.size) frame = requestAnimationFrame(paint);
      };

      const zio = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            const el = e.target as HTMLElement;
            if (e.isIntersecting) inView.add(el);
            else {
              inView.delete(el);
              el.style.setProperty('--at-z', '1');
              el.style.setProperty('--at-p', '0');
            }
          }
          /* The loop only exists while something is on screen. */
          if (inView.size && !frame) frame = requestAnimationFrame(paint);
        },
        { rootMargin: '10% 0px' },
      );
      for (const el of zoomers) zio.observe(el);

      cleanups.push(() => {
        zio.disconnect();
        if (frame) cancelAnimationFrame(frame);
      });
    }

    return () => {
      for (const fn of cleanups) fn();
    };
  }, [extra]);

  return null;
}
