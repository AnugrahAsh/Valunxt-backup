'use client';

/**
 * THE SIX-SERVICE BAND ON /en-ae/ (.vxn-klay--six), on Framer Motion.
 *
 * Six full-bleed panels share one row. The one under the pointer takes six
 * parts of the row and the other five take one each; the five closed panels
 * wear a frosted sheet with their name set vertically on it.
 *
 * WHY IT WAS STILL LAGGY (20260917, second pass). The first pass put the
 * widths on a spring and baked the frost, and the band was still reported as
 * "not smooth and way too laggy". The spring was animating `flex-grow`, and
 * that is a LAYOUT property: every frame of every move re-laid-out the row,
 * resized six `object-fit: cover` photographs (each a fresh raster at a new
 * size), resized six `background-size: cover` frost pictures, and cross-faded
 * `filter` and `opacity` on two full-bleed images. No curve makes that smooth;
 * the work per frame was the problem, not the timing of it.
 *
 * WHAT IT IS NOW: NOTHING BUT TRANSFORM AND OPACITY MOVES. On a desktop the
 * engine lifts the row out of flex (`.is-stacked`, valunxt-brand.css) and makes
 * every panel the full OPEN width, absolutely placed, each one layered above
 * the panel to its left. A panel's visible width is simply how far the next
 * panel's left edge is from its own — so opening and closing is six
 * `translate3d` values per frame and nothing else. No panel, photograph or
 * frost picture ever changes size, so nothing is laid out or rasterised while
 * the band moves; the compositor slides layers it already has.
 *
 *   - The photograph stays at full strength under every panel. The closed look
 *     (dimmed, blurred, under the dark ramp) is one opaque sheet above it — the
 *     baked frost picture (klay-frost.ts) — and opening a panel is that sheet's
 *     opacity going to nothing. The `filter`/`opacity` cross-fade on the
 *     photographs is gone with the need for it.
 *   - The widths still move on KLAY_SPRING, retargeted mid-flight without
 *     losing speed; a sweep across the row is one continuous movement.
 *   - A panel still opens after the pointer has rested on it for 70ms, the
 *     copy still rises in three beats, the band still arrives panel by panel.
 *
 * Below 1025px (stacked cards) and under reduced motion the row is left in the
 * stylesheet's own layout, exactly as before.
 *
 * WHAT IT REPLACES: the KLAY_ACCORDION block in layout/SiteScripts.tsx, which
 * still runs every other `.vxn-klay` on the site. It skips any row marked
 * `data-vxn-klay="motion"`, and the marker is in the server markup, so the two
 * are never both bound to one row.
 *
 * THE SAFETY RULE: the markup ships with the first panel open and the
 * stylesheet draws every state in flex, so with this bundle blocked the row
 * still shows and still works — it just does not glide.
 */

import { useEffect } from 'react';
import { animate, motionValue, stagger, type MotionValue } from 'framer-motion';

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
    read — the stacked-cards layout below 1025px zeroes both. */
const FALLBACK = { open: 6, shut: 1 };

function stripMotion(el: HTMLElement) {
  ['opacity', 'transform', 'will-change', 'transition'].forEach((p) => el.style.removeProperty(p));
}

interface PanelState {
  el: HTMLElement;
  frost: HTMLElement | null;
  /** 0 closed, 1 open. */
  open: MotionValue<number>;
  /** The entrance: pixels still to rise, and how visible. */
  rise: MotionValue<number>;
  alpha: MotionValue<number>;
}

export default function UaeKlayMotion() {
  useEffect(() => {
    const rows = Array.from(document.querySelectorAll<HTMLElement>(ROW));
    if (!rows.length) return;

    const reduce = prefersReducedMotion();
    const mqDesktop = window.matchMedia('(min-width: 1025px)');
    const undo: Array<() => void> = [];

    rows.forEach((row) => {
      const els = Array.from(row.querySelectorAll<HTMLElement>(PANEL));
      if (els.length < 2) return;

      let active = Math.max(0, els.findIndex((p) => p.classList.contains('is-active')));

      /* ---- The two widths, read rather than restated ------------------- */
      const grows = { ...FALLBACK };
      const readGrows = () => {
        const open = parseFloat(getComputedStyle(els[active]!).flexGrow);
        const other = els.find((_, i) => i !== active)!;
        const shut = parseFloat(getComputedStyle(other).flexGrow);
        if (open > shut && shut > 0) {
          grows.open = open;
          grows.shut = shut;
        }
      };
      readGrows();

      const panels: PanelState[] = els.map((el, i) => ({
        el,
        frost: null,
        open: motionValue(i === active ? 1 : 0),
        rise: motionValue(0),
        alpha: motionValue(1),
      }));

      /* ---- The stack ---------------------------------------------------- */
      let stacked = false;
      let rowW = 0;
      let openW = 0;

      const measure = () => {
        rowW = row.clientWidth;
        const ratio = grows.open / grows.shut;
        const shutW = rowW / (els.length - 1 + ratio);
        openW = shutW * ratio;
        row.style.setProperty('--klay-open', `${openW.toFixed(2)}px`);
        row.style.setProperty('--klay-shut', `${shutW.toFixed(2)}px`);
      };

      /* One write per frame, however many springs ticked in it. */
      let queued = 0;
      const render = () => {
        queued = 0;
        if (!stacked) return;
        const ratio = grows.open / grows.shut;
        let total = 0;
        const weights = panels.map((p) => {
          const o = Math.min(1, Math.max(0, p.open.get()));
          const w = 1 + (ratio - 1) * o;
          total += w;
          return w;
        });
        let x = 0;
        panels.forEach((p, i) => {
          p.el.style.transform = `translate3d(${x.toFixed(2)}px, ${p.rise.get().toFixed(2)}px, 0)`;
          const a = p.alpha.get();
          p.el.style.opacity = a >= 0.999 ? '' : a.toFixed(3);
          if (p.frost) {
            const o = Math.min(1, Math.max(0, p.open.get()));
            p.frost.style.opacity = (1 - o).toFixed(3);
          }
          x += (rowW * weights[i]!) / total;
        });
      };
      const schedule = () => {
        if (!queued) queued = requestAnimationFrame(render);
      };
      const unsub: Array<() => void> = [];
      panels.forEach((p) => {
        unsub.push(p.open.on('change', schedule), p.rise.on('change', schedule), p.alpha.on('change', schedule));
      });

      const stack = () => {
        if (stacked) return;
        stacked = true;
        readGrows();
        panels.forEach((p, i) => {
          p.el.style.removeProperty('flex-grow');
          p.el.style.zIndex = String(i + 1);
          if (!p.frost) {
            const frost = document.createElement('span');
            frost.className = 'vxn-klay__frost';
            frost.setAttribute('aria-hidden', 'true');
            (p.el.querySelector('.vxn-klay__bg') ?? p.el).appendChild(frost);
            p.frost = frost;
          }
        });
        measure();
        row.classList.add('is-stacked');
        render();
      };

      const unstack = () => {
        if (!stacked) return;
        stacked = false;
        row.classList.remove('is-stacked');
        panels.forEach((p) => {
          p.el.style.removeProperty('transform');
          p.el.style.removeProperty('opacity');
          p.el.style.removeProperty('z-index');
        });
      };

      /* The flex path: phones' stacked cards, and reduced motion. */
      const place = () =>
        els.forEach((p, i) => {
          p.style.flexGrow = String(i === active ? grows.open : grows.shut);
        });

      const layout = () => {
        if (mqDesktop.matches && !reduce) stack();
        else {
          unstack();
          place();
        }
      };
      layout();

      /* ---- Opening a panel -------------------------------------------- */
      const playCopy = (panel: HTMLElement) => {
        const parts = Array.from(panel.querySelectorAll<HTMLElement>(COPY));
        if (!parts.length || reduce || !mqDesktop.matches) return;
        parts.forEach((p) => {
          p.style.transition = 'none';
          p.style.opacity = '0';
          p.style.transform = 'translateY(22px)';
        });
        animate(
          parts,
          { opacity: [0, 1], y: [22, 0] },
          { duration: 0.7, ease: EASE.out, delay: stagger(0.09, { startDelay: 0.18 }) },
        ).then(
          () => parts.forEach(stripMotion),
          () => parts.forEach(stripMotion),
        );
      };

      const activate = (i: number) => {
        if (i === active) return;
        active = i;
        els.forEach((p, j) => p.classList.toggle('is-active', j === i));

        if (!stacked) {
          place();
          return;
        }
        /* Target only: a spring handed its target alone starts from where the
           value is AND how fast it is already moving, so a change of mind
           mid-flight bends rather than restarts. */
        panels.forEach((p, j) => {
          animate(p.open, j === i ? 1 : 0, KLAY_SPRING);
        });
        playCopy(els[i]!);
      };

      /* ---- The interaction rules -------------------------------------- */
      let intent = 0;
      els.forEach((panel, i) => {
        /* A mouse opens a panel it has rested on. */
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

      /* ---- The frost, baked ----------------------------------------------
         The closed look is drawn once as a picture (klay-frost.ts) when the
         band comes within a screen of the viewport, one panel at a time so no
         single task is long. Until a panel's picture is ready its sheet is the
         plain dark ramp, which is already legible. */
      const baked = new Map<HTMLElement, string>();
      let bakedFor = '';
      let baking = false;
      let bakeIo: IntersectionObserver | null = null;
      let near = false;

      /* The box the frost picture covers: the whole open-width panel when the
         row is stacked, each card's own box on a phone. */
      const frostBox = (panel: HTMLElement) => {
        if (stacked) return { w: openW, h: row.clientHeight };
        const r = panel.getBoundingClientRect();
        return { w: r.width, h: r.height };
      };
      const shapeKey = () => {
        const b = frostBox(els[0]!);
        const q = (v: number) => Math.round(Math.log(Math.max(1, v)) / Math.log(1.08));
        return `${stacked ? 'row' : 'stack'}:${q(b.w)}:${q(b.h)}`;
      };

      const bakeAll = async () => {
        if (baking || !near) return;
        const key = shapeKey();
        if (key === bakedFor) return;
        baking = true;
        for (const panel of els) {
          const img = panel.querySelector<HTMLImageElement>('.vxn-klay__bg img');
          if (!img) continue;
          const url = await bakeFrost(img, frostBox(panel));
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
        if (stacked) {
          measure();
          render();
        }
        window.clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(() => void bakeAll(), 300);
      };
      window.addEventListener('resize', onResize, { passive: true });

      const onBreakpoint = () => {
        layout();
        void bakeAll();
      };
      mqDesktop.addEventListener('change', onBreakpoint);

      /* ---- The entrance ------------------------------------------------ */
      let entryIo: IntersectionObserver | null = null;
      const rowTop = row.getBoundingClientRect().top;
      const alreadyRead = rowTop < (window.innerHeight || 0) * 0.9 && !freshPaint();
      if (!reduce && !alreadyRead && typeof IntersectionObserver === 'function') {
        const hideFlex = (p: HTMLElement) => {
          p.style.transition = 'none';
          p.style.opacity = '0';
          p.style.transform = 'translateY(64px)';
        };
        if (stacked) {
          panels.forEach((p) => {
            p.rise.set(72);
            p.alpha.set(0);
          });
          render();
        } else els.forEach(hideFlex);

        /* One observer per panel, batched: on a desktop the six arrive
           together, left to right; stacked on a phone, each as it is reached. */
        const waiting = new Set(els);
        entryIo = new IntersectionObserver(
          (entries) => {
            const due = entries
              .filter((e) => e.isIntersecting && waiting.has(e.target as HTMLElement))
              .map((e) => e.target as HTMLElement)
              .sort((a, b) => els.indexOf(a) - els.indexOf(b));
            if (!due.length) return;
            due.forEach((p) => {
              waiting.delete(p);
              entryIo?.unobserve(p);
            });
            if (stacked) {
              due.forEach((el, n) => {
                const p = panels[els.indexOf(el)]!;
                const delay = n * STAGGER.beat;
                animate(p.rise, 0, { duration: DUR.rise, ease: EASE.out, delay });
                animate(p.alpha, 1, { duration: DUR.rise * 0.8, ease: EASE.out, delay });
              });
              return;
            }
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
        els.forEach((p) => entryIo!.observe(p));
      }

      undo.push(() => {
        window.clearTimeout(intent);
        window.clearTimeout(resizeTimer);
        cancelAnimationFrame(queued);
        unsub.forEach((fn) => fn());
        entryIo?.disconnect();
        bakeIo?.disconnect();
        window.removeEventListener('resize', onResize);
        mqDesktop.removeEventListener('change', onBreakpoint);
        unstack();
        row.style.removeProperty('--klay-open');
        row.style.removeProperty('--klay-shut');
        panels.forEach((p) => {
          p.open.stop();
          p.rise.stop();
          p.alpha.stop();
          p.frost?.remove();
          p.el.style.removeProperty('flex-grow');
          p.el.style.removeProperty('--vxn-frost');
          delete p.el.dataset.vxnFrost;
          stripMotion(p.el);
        });
        baked.forEach((url) => URL.revokeObjectURL(url));
      });
    });

    return () => undo.forEach((fn) => fn());
  }, []);

  return null;
}
