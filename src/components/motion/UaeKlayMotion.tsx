'use client';

/**
 * THE SIX-SERVICE BAND ON /en-ae/ (.vxn-klay--six), on Framer Motion (20260917).
 *
 * Six full-bleed panels share one flex row. The one under the pointer takes six
 * parts of the row and the other five take one each; the five closed panels
 * wear a frosted sheet with their name set vertically on it. It was reported as
 * "too chonky, not at all smooth", and on inspection five different things were
 * each contributing. All five are addressed; the band looks exactly as it did
 * at rest and in every state, only the movement between states has changed.
 *
 *   1. THE WIDTHS STALLED ON EVERY CHANGE OF MIND. A CSS transition restarts
 *      from rest whenever it is retargeted, so a pointer moving across the row
 *      made the band lurch towards each panel in turn. The widths now move on a
 *      spring (KLAY_SPRING in motion-tokens.ts): retargeted mid-flight it keeps
 *      the speed it already has and bends towards the new panel, never
 *      overshooting.
 *
 *   2. EVERY PANEL THE POINTER CROSSED OPENED. Sweeping from the first panel to
 *      the last set four panels moving on the way. A panel now opens once the
 *      pointer has rested on it for 70ms — too short to notice when pointing on
 *      purpose, long enough that passing over a panel does nothing. Keyboard
 *      focus opens at once.
 *
 *   3. THE FROST POPPED. The sheet over a closed panel was created and
 *      destroyed by `:not(.is-active)::after`, so it vanished from the opening
 *      panel and appeared, fully frosted, over the closing one on the first
 *      frame of every hover. It now exists on every panel of this row and
 *      cross-fades (valunxt-brand.css, THE SERVICES ROW FRAMER MOTION DRIVES).
 *
 *   4. EVERY FROST WAS REDRAWN ON EVERY FRAME. A backdrop blur samples whatever
 *      is painted behind it, and while any panel moved, all five sheets had to
 *      be recomputed. Each panel is now its own isolation root, so a panel that
 *      only slides along the row — four of the six on any change — keeps the
 *      blur it already has, and the layer hint on the photographs is raised
 *      only while the row is moving.
 *
 *   5. THE COPY ARRIVED AS ONE BLOCK, while the panel was still widening under
 *      it. The heading, the sentence and "Learn more" now rise one after
 *      another, a beat after the panel has started to open.
 *
 * The band also gets an entrance: its panels rise into place one after another
 * as it is scrolled to.
 *
 * WHAT IT REPLACES: the KLAY_ACCORDION block in layout/SiteScripts.tsx, which
 * still runs every other `.vxn-klay` on the site (the India home page's four).
 * It skips any row marked `data-vxn-klay="motion"`, and the marker is in the
 * server markup, so the two are never both bound to one row. The rules for
 * touch are that script's, unchanged.
 *
 * THE SAFETY RULE: the markup ships with the first panel open and the
 * stylesheet draws every state, so with this bundle blocked the row still
 * shows — and the width change simply stops being animated.
 */

import { useEffect } from 'react';
import { animate, stagger } from 'framer-motion';

import { bakeFrost, canBakeFrost } from './klay-frost';
import { DUR, EASE, KLAY_SPRING, STAGGER, prefersReducedMotion } from './motion-tokens';
import { freshPaint } from './reveal-scan';

/** Rows this file owns. The marker is set in the page's markup. */
const ROW = '.vxn-klay[data-vxn-klay="motion"]';
const PANEL = '.vxn-klay__panel';
/** The copy inside the open panel, in the order it arrives. */
const COPY = '.vxn-klay__title, .vxn-klay__desc, .vxn-klay__btn';

/** How long the pointer rests on a closed panel before it opens. */
const INTENT_MS = 70;

/** The widths the stylesheet gives this row (valunxt-brand.css,
    `.vxn-klay--six .vxn-klay__panel.is-active`), used only when they cannot be
    read — the stacked layout below 1025px zeroes both. */
const FALLBACK = { open: 6, shut: 1 };

function stripMotion(el: HTMLElement) {
  ['opacity', 'transform', 'will-change', 'transition'].forEach((p) => el.style.removeProperty(p));
}

export default function UaeKlayMotion() {
  useEffect(() => {
    const rows = Array.from(document.querySelectorAll<HTMLElement>(ROW));
    if (!rows.length) return;

    const reduce = prefersReducedMotion();
    const mqDesktop = window.matchMedia('(min-width: 1025px)');
    const undo: Array<() => void> = [];

    rows.forEach((row) => {
      const panels = Array.from(row.querySelectorAll<HTMLElement>(PANEL));
      if (panels.length < 2) return;

      let active = Math.max(0, panels.findIndex((p) => p.classList.contains('is-active')));

      /* ---- The two widths, read rather than restated ------------------- */
      const grows = { ...FALLBACK };
      const readGrows = () => {
        const open = parseFloat(getComputedStyle(panels[active]!).flexGrow);
        const other = panels.find((_, i) => i !== active)!;
        const shut = parseFloat(getComputedStyle(other).flexGrow);
        if (open > shut && shut > 0) {
          grows.open = open;
          grows.shut = shut;
        }
      };
      readGrows();

      /* The widths are inline from here on — the stylesheet's own flex-grow
         transition stands down on this row — so every move starts from a
         value this file wrote. Below 1025px the stacked layout's
         `flex: 0 0 auto !important` beats these, so phones are untouched. */
      const place = () =>
        panels.forEach((p, i) => {
          p.style.flexGrow = String(i === active ? grows.open : grows.shut);
        });
      place();

      /* ---- Opening a panel -------------------------------------------- */
      const playCopy = (panel: HTMLElement) => {
        const parts = Array.from(panel.querySelectorAll<HTMLElement>(COPY));
        if (!parts.length || reduce || !mqDesktop.matches) return;
        parts.forEach((p) => {
          p.style.transition = 'none';
          p.style.opacity = '0';
          p.style.transform = 'translateY(18px)';
        });
        animate(
          parts,
          { opacity: [0, 1], y: [18, 0] },
          { duration: 0.65, ease: EASE.out, delay: stagger(0.08, { startDelay: 0.2 }) },
        ).then(
          () => parts.forEach(stripMotion),
          () => parts.forEach(stripMotion),
        );
      };

      const activate = (i: number) => {
        if (i === active) return;
        active = i;
        panels.forEach((p, j) => p.classList.toggle('is-active', j === i));

        if (reduce || !mqDesktop.matches) {
          place();
          return;
        }

        /* Target only, never [from, to]: a spring handed its target alone
           starts from where the width is AND how fast it is already moving,
           which is the whole of fix 1.

           NOTHING ELSE IS TOUCHED AT THE START OR END OF A MOVE. This used to
           raise a layer hint on the row's six photographs for the length of
           each move and drop it after. Measured, that was the opposite of an
           optimisation: every raise re-rasterised six full-bleed pictures onto
           new layers and every drop merged them back, which put a stall at
           both ends of every hover. The photographs keep their layers
           (valunxt-brand.css) and the move is just the widths. */
        panels.forEach((p, j) => {
          animate(p, { flexGrow: j === i ? grows.open : grows.shut }, KLAY_SPRING);
        });
        playCopy(panels[i]!);
      };

      /* ---- The interaction rules -------------------------------------- */
      let intent = 0;
      panels.forEach((panel, i) => {
        /* A mouse opens a panel it has rested on (fix 2). */
        const onEnter = (e: PointerEvent) => {
          if (e.pointerType !== 'mouse' || !mqDesktop.matches) return;
          window.clearTimeout(intent);
          intent = window.setTimeout(() => activate(i), INTENT_MS);
        };
        const onLeave = () => window.clearTimeout(intent);
        /* The keyboard opens at once. */
        const onFocus = () => {
          if (mqDesktop.matches) activate(i);
        };
        /* Desktop TOUCH, which has no hover in front of it: the first tap opens
           the panel instead of following the link, a second tap follows it.
           Below 1025px the panels are stacked cards and taps navigate. */
        const onClick = (e: MouseEvent) => {
          if (mqDesktop.matches && !panel.classList.contains('is-active')) {
            e.preventDefault();
            window.clearTimeout(intent);
            activate(i);
          }
        };
        panel.addEventListener('pointerenter', onEnter);
        panel.addEventListener('pointerleave', onLeave);
        panel.addEventListener('focusin', onFocus);
        panel.addEventListener('click', onClick);
        undo.push(() => {
          panel.removeEventListener('pointerenter', onEnter);
          panel.removeEventListener('pointerleave', onLeave);
          panel.removeEventListener('focusin', onFocus);
          panel.removeEventListener('click', onClick);
        });
      });

      /* ---- The frost, baked (fix 4) --------------------------------------
         The sheet over a closed panel is drawn once as a picture instead of
         being blurred live on every frame: components/motion/klay-frost.ts has
         the measurements and the method. It is made when the band comes within
         a screen of the viewport, one panel at a time so no single task is
         long, and made again if the panels change shape enough for the blur to
         read differently. Until a panel's bitmap is ready it keeps the live
         frost, so there is never a moment without one. */
      const baked = new Map<HTMLElement, string>();
      let bakedFor = '';
      let baking = false;
      let bakeIo: IntersectionObserver | null = null;
      let near = false;

      /* The box a closed panel occupies: shared by every closed panel in the
         row; each card's own box when they are stacked. */
      const closedBox = (panel: HTMLElement) => {
        const ref = mqDesktop.matches ? panels.find((_, j) => j !== active) ?? panel : panel;
        const r = ref.getBoundingClientRect();
        return { w: r.width, h: r.height };
      };
      /* A key that changes when the frost would read differently: the layout,
         and the closed box to the nearest 8%. */
      const shapeKey = () => {
        const b = closedBox(panels[active === 0 ? 1 : 0]!);
        const q = (v: number) => Math.round(Math.log(Math.max(1, v)) / Math.log(1.08));
        return `${mqDesktop.matches ? 'row' : 'stack'}:${q(b.w)}:${q(b.h)}`;
      };

      const bakeAll = async () => {
        if (baking || !near) return;
        const key = shapeKey();
        if (key === bakedFor) return;
        baking = true;
        for (const panel of panels) {
          const img = panel.querySelector<HTMLImageElement>('.vxn-klay__bg img');
          if (!img) continue;
          const url = await bakeFrost(img, closedBox(panel));
          if (url) {
            const old = baked.get(panel);
            panel.style.setProperty('--vxn-frost', `url("${url}")`);
            panel.dataset.vxnFrost = 'baked';
            baked.set(panel, url);
            if (old) URL.revokeObjectURL(old);
          }
          /* Hand the main thread back between panels. */
          await new Promise((r) => window.setTimeout(r, 0));
        }
        bakedFor = key;
        baking = false;
        /* The shape may have changed again while this ran. */
        if (shapeKey() !== bakedFor) void bakeAll();
      };

      if (canBakeFrost() && typeof IntersectionObserver === 'function') {
        bakeIo = new IntersectionObserver(
          (entries) => {
            if (!entries.some((e) => e.isIntersecting)) return;
            near = true;
            bakeIo?.disconnect();
            void bakeAll();
          },
          { rootMargin: '100% 0px 100% 0px' },
        );
        bakeIo.observe(row);
      }

      let resizeTimer = 0;
      const onResize = () => {
        window.clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(() => void bakeAll(), 300);
      };
      window.addEventListener('resize', onResize, { passive: true });

      /* The widths come back when a phone-width window is widened. */
      const onBreakpoint = () => {
        if (mqDesktop.matches) {
          readGrows();
          place();
        }
        void bakeAll();
      };
      mqDesktop.addEventListener('change', onBreakpoint);

      /* ---- The entrance ------------------------------------------------ */
      let entryIo: IntersectionObserver | null = null;
      const rowTop = row.getBoundingClientRect().top;
      const alreadyRead = rowTop < (window.innerHeight || 0) * 0.9 && !freshPaint();
      if (!reduce && !alreadyRead && typeof IntersectionObserver === 'function') {
        panels.forEach((p) => {
          p.style.transition = 'none';
          p.style.opacity = '0';
          p.style.transform = 'translateY(64px)';
        });
        /* One observer per panel, batched: on a desktop the six arrive
           together, left to right; stacked on a phone, each as it is reached. */
        const waiting = new Set(panels);
        entryIo = new IntersectionObserver(
          (entries) => {
            const due = entries
              .filter((e) => e.isIntersecting && waiting.has(e.target as HTMLElement))
              .map((e) => e.target as HTMLElement)
              .sort((a, b) => panels.indexOf(a) - panels.indexOf(b));
            if (!due.length) return;
            due.forEach((p) => {
              waiting.delete(p);
              entryIo?.unobserve(p);
            });
            animate(
              due,
              { opacity: [0, 1], y: [64, 0] },
              { duration: DUR.rise, ease: EASE.out, delay: stagger(STAGGER.beat) },
            ).then(
              () => due.forEach(stripMotion),
              () => due.forEach(stripMotion),
            );
          },
          { rootMargin: '0px 0px -10% 0px', threshold: 0.01 },
        );
        panels.forEach((p) => entryIo!.observe(p));
      }

      undo.push(() => {
        window.clearTimeout(intent);
        window.clearTimeout(resizeTimer);
        entryIo?.disconnect();
        bakeIo?.disconnect();
        window.removeEventListener('resize', onResize);
        mqDesktop.removeEventListener('change', onBreakpoint);
        panels.forEach((p) => {
          p.style.removeProperty('flex-grow');
          p.style.removeProperty('--vxn-frost');
          delete p.dataset.vxnFrost;
          stripMotion(p);
        });
        baked.forEach((url) => URL.revokeObjectURL(url));
      });
    });

    return () => undo.forEach((fn) => fn());
  }, []);

  return null;
}
