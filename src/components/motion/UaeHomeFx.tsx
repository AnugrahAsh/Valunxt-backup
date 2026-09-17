'use client';

/**
 * /en-ae/ — THE HOME PAGE'S SECOND MOTION LAYER, on Framer Motion (20260917).
 *
 * Client feedback: the page "does not look that much animated". UaeHomeMotion
 * already arrives everything once as it is scrolled to; what the page lacked
 * was movement that answers the visitor CONTINUOUSLY — to the scroll position,
 * to the pointer, to the hero changing slide. That is this file:
 *
 *   progress   a thin brand bar across the top that fills with the scroll, on a
 *              spring so it glides rather than ticks.
 *   hero       every slide change re-plays its copy: the headline rises a word
 *              at a time through a mask, the lede comes out of a blur, the two
 *              buttons spring in. As the page scrolls away the copy sinks and
 *              fades, the tab row follows, and the live 3D stage eases forward.
 *              A soft light follows the pointer across the hero.
 *   tilt       the cards lean toward the pointer in 3D and lift, on springs,
 *              and settle back when it leaves.
 *   magnetic   the CTAs pull toward the pointer while it is over them.
 *   scroll-in  the large band cards scale up into place as they are scrolled
 *              to, their textures drift against the scroll, and the section
 *              statements slide in from the side — all tied to the scroll
 *              position itself, so they move for as long as the page does.
 *
 * HOW IT STAYS OUT OF EVERY OTHER ENGINE'S WAY. UaeHomeMotion, the stylesheet's
 * hover lifts and the picture drift all write `transform`. Nothing here does.
 * This layer writes only the INDIVIDUAL transform properties — `translate`,
 * `rotate`, `scale` — which the browser composes with `transform` rather than
 * replacing it, so an arrival, a hover lift and a tilt can all be live on one
 * element without any of them knowing about the others. They are
 * compositor-only, like `transform`: nothing here lays out or paints per frame.
 *
 * THE SAFETY RULE: nothing is hidden by this file, ever. Every effect starts
 * from the finished page and eases away from it, and every one is removed on
 * unmount. Reduced motion skips the whole layer; the pointer effects also need
 * a real hover-capable pointer, so touch devices never pay for them.
 */

import { useEffect } from 'react';
import {
  animate,
  motion,
  motionValue,
  scroll,
  stagger,
  useReducedMotion,
  useScroll,
  useSpring,
} from 'framer-motion';

import { EASE, prefersReducedMotion } from './motion-tokens';
import { groupLines, splittable, wrapWords } from './reveal-scan';

/** The clip a rising word runs behind (UaeHomeMotion's own). */
const CLIP = 'inset(-.2em -.08em -.25em -.08em)';

const TILT = '.vxn-mosaic__card, .vxn-figs__card, .vxn-impact__card, .vxn-trio__card, .vxn-answer__panel';
const MAGNETIC = '.vxae-hero__cta, .vxae-hero__go, .vxn-figs__cta, .vxn-impact__cta, .vxn-sub__cta, .vxn-ready__route';
const SCALE_IN = '.vxn-figs__card, .vxn-impact__card, .vxn-ready__inner, .vxn-sub__shot, .vxn-answer__stage';
const TEXTURE = '.vxn-figs__texture, .vxn-impact__texture, .vxn-sub__ground';
const SLIDE_IN = '.vxn-answer__lead, .vxn-figs__lead, .vxn-ready__intro, .vxn-sub__head, .vxn-impact__side';

const SPRING_FOLLOW = { type: 'spring', stiffness: 170, damping: 22, mass: 0.6 } as const;
const SPRING_SETTLE = { type: 'spring', stiffness: 120, damping: 16, mass: 0.7 } as const;

/** One element's `scale`, owned by two effects (tilt and scroll-in) at once. */
const scales = new WeakMap<HTMLElement, { tilt: number; scroll: number }>();
function writeScale(el: HTMLElement, part: 'tilt' | 'scroll', v: number) {
  const s = scales.get(el) ?? { tilt: 1, scroll: 1 };
  s[part] = v;
  scales.set(el, s);
  const total = s.tilt * s.scroll;
  if (Math.abs(total - 1) < 0.0005) el.style.removeProperty('scale');
  else el.style.scale = total.toFixed(4);
}

export default function UaeHomeFx() {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 28, mass: 0.4 });

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const root = document.querySelector<HTMLElement>('#main-content');
    if (!root) return;

    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const stops: Array<() => void> = [];
    const all = <T extends HTMLElement = HTMLElement>(sel: string) => Array.from(root.querySelectorAll<T>(sel));

    /* ---- The hero ------------------------------------------------------- */
    const hero = root.querySelector<HTMLElement>('[data-vxae-hero]');
    if (hero) {
      const panels = Array.from(hero.querySelectorAll<HTMLElement>('.vxae-hero__panel'));
      panels.forEach((p) => {
        const t = p.querySelector<HTMLElement>('.vxae-hero__title');
        if (t && !t.querySelector('.vxn-w') && splittable(t)) groupLines(wrapWords(t));
      });

      const strip = (el: HTMLElement, props: string[]) => props.forEach((k) => el.style.removeProperty(k));

      const playPanel = (p: HTMLElement) => {
        const wraps = Array.from(p.querySelectorAll<HTMLElement>('.vxae-hero__title .vxn-w'));
        const words = Array.from(p.querySelectorAll<HTMLElement>('.vxae-hero__title .vxn-w__i'));
        const lede = p.querySelector<HTMLElement>('.vxae-hero__lede');
        const actions = Array.from(p.querySelectorAll<HTMLElement>('.vxae-hero__actions > *'));

        if (words.length) {
          wraps.forEach((w) => (w.style.clipPath = CLIP));
          animate(
            words,
            { y: ['120%', '0%'] },
            { duration: 0.95, ease: EASE.out, delay: stagger(0.05, { startDelay: 0.12 }) },
          ).then(() => {
            wraps.forEach((w) => strip(w, ['clip-path']));
            words.forEach((w) => strip(w, ['transform']));
          });
        }
        if (lede) {
          animate(
            lede,
            { opacity: [0, 1], y: [28, 0], filter: ['blur(10px)', 'blur(0px)'] },
            { duration: 0.85, ease: EASE.out, delay: 0.38 },
          ).then(() => strip(lede, ['opacity', 'transform', 'filter']));
        }
        if (actions.length) {
          animate(
            actions,
            { opacity: [0, 1], scale: [0.82, 1], y: [20, 0] },
            { type: 'spring', bounce: 0.38, duration: 0.95, delay: stagger(0.09, { startDelay: 0.55 }) },
          ).then(() => actions.forEach((a) => strip(a, ['opacity', 'transform'])));
        }
      };

      const was = new WeakMap<HTMLElement, boolean>();
      panels.forEach((p) => was.set(p, p.classList.contains('is-active')));
      const mo = new MutationObserver((records) => {
        records.forEach((r) => {
          const p = r.target as HTMLElement;
          const now = p.classList.contains('is-active');
          if (now && !was.get(p)) playPanel(p);
          was.set(p, now);
        });
      });
      panels.forEach((p) => mo.observe(p, { attributes: true, attributeFilter: ['class'] }));
      stops.push(() => mo.disconnect());

      /* The hero leaving: copy sinks and fades, the stage eases forward. At
         rest (progress 0) every property is taken off again, so the arrival
         UaeHomeMotion plays on a fresh load is never overwritten. */
      const inner = hero.querySelector<HTMLElement>('.vxae-hero__inner');
      const stage = hero.querySelector<HTMLElement>('.vxae-hero__stage');
      const tabs = hero.querySelector<HTMLElement>('.vxae-hero__tabs');
      stops.push(
        scroll(
          (p: number) => {
            if (p < 0.002) {
              [inner, stage, tabs].forEach((el) => el && strip(el, ['translate', 'opacity', 'scale']));
              return;
            }
            if (inner) {
              inner.style.translate = `0 ${(p * 150).toFixed(1)}px`;
              inner.style.opacity = Math.max(0, 1 - p * 1.7).toFixed(3);
            }
            if (tabs) {
              tabs.style.translate = `0 ${(p * 70).toFixed(1)}px`;
              tabs.style.opacity = Math.max(0, 1 - p * 2.4).toFixed(3);
            }
            if (stage) stage.style.scale = (1 + p * 0.14).toFixed(4);
          },
          { target: hero, offset: ['start start', 'end start'] },
        ),
      );

      /* The light under the pointer. One fixed-size blob moved by `translate`,
         so following the pointer never repaints the hero. */
      if (fine) {
        const spot = document.createElement('span');
        spot.className = 'vxfx-spot';
        spot.setAttribute('aria-hidden', 'true');
        hero.appendChild(spot);
        const mx = motionValue(0);
        const my = motionValue(0);
        const on = motionValue(0);
        const paint = () => {
          spot.style.translate = `${mx.get().toFixed(1)}px ${my.get().toFixed(1)}px`;
          spot.style.opacity = on.get().toFixed(3);
        };
        const unsub = [mx.on('change', paint), my.on('change', paint), on.on('change', paint)];
        const move = (e: PointerEvent) => {
          const r = hero.getBoundingClientRect();
          animate(mx, e.clientX - r.left - 380, SPRING_FOLLOW);
          animate(my, e.clientY - r.top - 380, SPRING_FOLLOW);
        };
        const enter = (e: PointerEvent) => {
          const r = hero.getBoundingClientRect();
          mx.jump(e.clientX - r.left - 380);
          my.jump(e.clientY - r.top - 380);
          animate(on, 1, { duration: 0.6, ease: EASE.out });
        };
        const leave = () => animate(on, 0, { duration: 0.8, ease: EASE.out });
        hero.addEventListener('pointerenter', enter);
        hero.addEventListener('pointermove', move);
        hero.addEventListener('pointerleave', leave);
        stops.push(() => {
          unsub.forEach((fn) => fn());
          hero.removeEventListener('pointerenter', enter);
          hero.removeEventListener('pointermove', move);
          hero.removeEventListener('pointerleave', leave);
          spot.remove();
        });
      }
    }

    /* ---- Tilt ------------------------------------------------------------ */
    if (fine) {
      all(TILT).forEach((el) => {
        const parent = el.parentElement;
        const hadPerspective = parent?.style.perspective ?? '';
        if (parent) parent.style.perspective = '1400px';

        const rx = motionValue(0);
        const ry = motionValue(0);
        const lift = motionValue(0);
        const paint = () => {
          const x = rx.get();
          const y = ry.get();
          const angle = Math.hypot(x, y);
          if (angle < 0.01) el.style.removeProperty('rotate');
          else el.style.rotate = `${x.toFixed(3)} ${y.toFixed(3)} 0 ${angle.toFixed(3)}deg`;
          const l = lift.get();
          writeScale(el, 'tilt', 1 + l * 0.018);
          if (l < 0.002) el.style.removeProperty('translate');
          else el.style.translate = `0 ${(-7 * l).toFixed(2)}px`;
        };
        const unsub = [rx.on('change', paint), ry.on('change', paint), lift.on('change', paint)];

        const move = (e: PointerEvent) => {
          /* An element the arrival engine still holds is left to it. */
          if (el.style.opacity !== '' && el.style.opacity !== '1') return;
          const r = el.getBoundingClientRect();
          const max = r.width > 900 ? 2.2 : 6;
          const nx = (e.clientX - r.left) / r.width - 0.5;
          const ny = (e.clientY - r.top) / r.height - 0.5;
          animate(rx, -ny * max * 2, SPRING_FOLLOW);
          animate(ry, nx * max * 2, SPRING_FOLLOW);
          animate(lift, 1, SPRING_FOLLOW);
        };
        const leave = () => {
          animate(rx, 0, SPRING_SETTLE);
          animate(ry, 0, SPRING_SETTLE);
          animate(lift, 0, SPRING_SETTLE);
        };
        el.addEventListener('pointermove', move);
        el.addEventListener('pointerleave', leave);
        stops.push(() => {
          unsub.forEach((fn) => fn());
          el.removeEventListener('pointermove', move);
          el.removeEventListener('pointerleave', leave);
          ['rotate', 'translate'].forEach((k) => el.style.removeProperty(k));
          writeScale(el, 'tilt', 1);
          if (parent) parent.style.perspective = hadPerspective;
        });
      });

      /* ---- Magnetic CTAs ------------------------------------------------ */
      all(MAGNETIC).forEach((el) => {
        const mx = motionValue(0);
        const my = motionValue(0);
        const paint = () => {
          const x = mx.get();
          const y = my.get();
          if (Math.abs(x) < 0.05 && Math.abs(y) < 0.05) el.style.removeProperty('translate');
          else el.style.translate = `${x.toFixed(2)}px ${y.toFixed(2)}px`;
        };
        const unsub = [mx.on('change', paint), my.on('change', paint)];
        const move = (e: PointerEvent) => {
          const r = el.getBoundingClientRect();
          const pull = r.width > 400 ? 0.04 : 0.28;
          animate(mx, (e.clientX - (r.left + r.width / 2)) * pull, SPRING_FOLLOW);
          animate(my, (e.clientY - (r.top + r.height / 2)) * pull, SPRING_FOLLOW);
        };
        const leave = () => {
          animate(mx, 0, SPRING_SETTLE);
          animate(my, 0, SPRING_SETTLE);
        };
        el.addEventListener('pointermove', move);
        el.addEventListener('pointerleave', leave);
        stops.push(() => {
          unsub.forEach((fn) => fn());
          el.removeEventListener('pointermove', move);
          el.removeEventListener('pointerleave', leave);
          el.style.removeProperty('translate');
        });
      });
    }

    /* ---- Tied to the scroll --------------------------------------------- */
    all(SCALE_IN).forEach((el) => {
      stops.push(
        scroll((p: number) => writeScale(el, 'scroll', 0.9 + 0.1 * Math.min(1, p)), {
          target: el,
          offset: ['start end', 'start 45%'],
        }),
      );
      stops.push(() => writeScale(el, 'scroll', 1));
    });

    all(TEXTURE).forEach((el) => {
      stops.push(
        scroll(
          (p: number) => {
            el.style.translate = `0 ${((p - 0.5) * 14).toFixed(2)}%`;
            el.style.scale = '1.18';
          },
          { target: el.parentElement ?? el, offset: ['start end', 'end start'] },
        ),
      );
      stops.push(() => ['translate', 'scale'].forEach((k) => el.style.removeProperty(k)));
    });

    all(SLIDE_IN).forEach((el, i) => {
      /* A tilted card already owns this element's `translate`. */
      if (el.matches(TILT) || el.matches(MAGNETIC)) return;
      const from = i % 2 === 0 ? -70 : 70;
      stops.push(
        scroll(
          (p: number) => {
            const k = 1 - Math.min(1, p);
            const eased = k * k;
            if (eased < 0.001) el.style.removeProperty('translate');
            else el.style.translate = `${(from * eased).toFixed(1)}px 0`;
          },
          { target: el, offset: ['start end', 'start 50%'] },
        ),
      );
      stops.push(() => el.style.removeProperty('translate'));
    });

    return () => stops.forEach((fn) => fn());
  }, []);

  if (reduce) return null;

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
.vxfx-progress{position:fixed;top:0;left:0;right:0;height:3px;z-index:2147483000;pointer-events:none;
  transform-origin:0 50%;background:linear-gradient(90deg,#0B2DBE 0%,#2F6BFF 55%,#9C00DD 100%);}
.vxfx-spot{position:absolute;top:0;left:0;width:760px;height:760px;border-radius:50%;pointer-events:none;
  z-index:-1;opacity:0;mix-blend-mode:screen;will-change:translate,opacity;
  background:radial-gradient(circle,rgba(86,156,255,.30) 0%,rgba(60,120,255,.12) 38%,rgba(40,90,255,0) 68%);}
`,
        }}
      />
      <motion.div className="vxfx-progress" style={{ scaleX: progress }} aria-hidden="true" />
    </>
  );
}
