'use client';

/**
 * /en-ae/ — THE HOME PAGE'S SCROLL MOTION, on Framer Motion (20260917).
 *
 * The UAE home page is the one page the CSS engine (layout/SiteMotion.tsx) does
 * not drive: this file takes its place, and SiteMotion stands down when it
 * finds the page marked `data-vxn-motion="framer"`. Every other page is
 * untouched.
 *
 * WHY IT IS A SECOND PLAYER RATHER THAN A REWRITE. The two share the whole of
 * their page walk — motion/reveal-scan.ts — so "what is a heading", "what is a
 * card", "which subtrees are out of bounds" have one answer on every page of
 * the site. What differs is the playback: CSS transitions there, Framer Motion
 * here, which buys three things the stylesheet could not give:
 *
 *   - one curve and one clock for the whole page (motion/motion-tokens.ts), and
 *     the same clock Lenis scrolls the page on (motion/SmoothScroll.tsx), so an
 *     arrival and the glide that brought it into view are computed together;
 *   - runs composed after the fact — the insights cards, the three practice
 *     points and the mosaic tiles arrive left to right off one observer each;
 *   - sections that arrive as a piece, with their copy following inside them.
 *
 * WHAT ARRIVES, AND HOW. Everything the walk marks is observed and played in
 * the batch it is seen in, in document order, each neighbour a beat behind the
 * last: headings a line at a time through a mask, copy out of a blur a beat
 * later, cards and pictures rising, buttons a beat behind their copy. On top
 * of that, this file's own:
 *
 *   runs      .vxn-figs__stat, .vxn-mosaic__card and the insights carousel's
 *             cards rise one after another, left to right. The figures and the
 *             mosaic used to be sections/UaeBandMotion.tsx's, on CSS
 *             transitions; the carousel is Swiper's DOM, which no engine walks
 *             into, so only a run can reach it.
 *   sections  .vxn-impact__card and .vxn-sub rise as one panel, and the copy
 *             inside them follows on its own beat.
 *   figures   any [data-vxn-count] rolls from zero to its own value.
 *   drift     the larger pictures move against the scroll, as before.
 *
 * WHAT IT LEAVES ALONE, beyond the walk's SKIP list: anything the stylesheet
 * is already animating. The rows of "The Right Advice Starts…" rise on a CSS
 * scroll timeline, and a second arrival laid over the first only blurred them.
 * The services accordion (.vxn-klay) is UaeKlayMotion's; the trio, the footer
 * and the header's sheets carry their own.
 *
 * THE SAFETY RULE, the one every engine on this site follows: the page the
 * server renders is the finished page. Nothing is hidden until this file has
 * run in a browser, and it takes its own inline styles off again once an
 * arrival has played, so a card's hover lift is its own transform once more.
 * A blocked bundle, a thrown error or reduced motion all leave the page whole.
 * A timer plays whatever never intersects, and anything already on screen from
 * an older paint is left exactly as it stands rather than blinked.
 */

import { useEffect } from 'react';
import { animate, stagger } from 'framer-motion';

import { DUR, EASE, STAGGER, prefersReducedMotion } from './motion-tokens';
import { freshPaint, groupLines, lineOf, scanReveal, startDrift, type Kind, type Mark } from './reveal-scan';

/** Rows this file arrives itself, one item after another. */
const RUNS: { host: string; items: string; gap: number }[] = [
  { host: '.vxn-figs', items: '.vxn-figs__stat', gap: STAGGER.row },
  { host: '.vxn-mosaic', items: '.vxn-mosaic__card', gap: STAGGER.row },
  { host: '.vxn-insights-round', items: '.swiper-slide', gap: STAGGER.row },
];

/** Panels that rise as one piece, with their copy following inside them. */
const SECTIONS = '.vxn-impact__card, .vxn-sub';

/** Figures, rolled from zero. */
const COUNT = '[data-vxn-count]';

/** The clip a rising line runs behind: .2em over the top and .25em under, for
    the ascenders and descenders of a 1.08 line-height heading. The CSS
    engine's own, so a split heading reads the same under either player. */
const CLIP = 'inset(-.2em -.08em -.25em -.08em)';

/** Where each kind starts from. */
const FROM: Record<Exclude<Kind, 'lines'>, { y: number; blur?: number }> = {
  rise: { y: 56 },
  'rise-sm': { y: 18 },
  blur: { y: 14, blur: 10 },
  fade: { y: 0 },
};

/** Seconds a kind waits after its place in the batch, so copy follows its
    heading and a button follows its copy. */
const OFFSET: Record<Kind, number> = { lines: 0, rise: 0, fade: 0, blur: 0.14, 'rise-sm': 0.24 };

/** Every inline property this file ever writes, for taking them off again. */
const OWN = ['opacity', 'transform', 'filter', 'clip-path', 'will-change', 'transition'];

function strip(el: HTMLElement) {
  OWN.forEach((p) => el.style.removeProperty(p));
}

/** Is the stylesheet already animating this element? */
function cssAnimated(el: Element): boolean {
  const name = getComputedStyle(el).animationName;
  return !!name && name !== 'none';
}

export default function UaeHomeMotion() {
  useEffect(() => {
    if (prefersReducedMotion()) return;
    if (typeof IntersectionObserver !== 'function') return;

    const root = document.querySelector<HTMLElement>('#main-content');
    if (!root) return;

    const fresh = freshPaint();
    const vh = () => window.innerHeight || 0;
    const onScreen = (el: Element) => {
      const r = el.getBoundingClientRect();
      return r.top < vh() * 0.9 && r.bottom > 0;
    };

    /* ---- What moves ----------------------------------------------------- */
    const scan = scanReveal([root]);

    const runs = RUNS.map((r) => {
      const host = root.querySelector<HTMLElement>(r.host);
      const items = host ? Array.from(host.querySelectorAll<HTMLElement>(r.items)) : [];
      return { host, items, gap: r.gap };
    }).filter((r) => r.host && r.items.length);
    const inRun = (el: Element) => runs.some((r) => r.items.some((it) => it === el || it.contains(el)));

    const marks: Mark[] = scan.marks.filter((m) => !inRun(m.el) && !cssAnimated(m.el));
    root.querySelectorAll<HTMLElement>(SECTIONS).forEach((el) => {
      if (!marks.some((m) => m.el === el)) marks.push({ el, kind: 'rise' });
    });
    /* The hero coming up on a fresh load: the first block in the content. */
    if (scan.first && !scan.firstSeen && fresh) marks.push({ el: scan.first, kind: 'fade' });
    /* Document order, so the batches below can trust it. */
    marks.sort((a, b) => (a.el.compareDocumentPosition(b.el) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));

    const byEl = new Map<HTMLElement, Mark>();
    marks.forEach((m) => byEl.set(m.el, m));

    /* ---- Hiding ---------------------------------------------------------- */
    const hide = (m: Mark) => {
      if (m.kind === 'lines') {
        m.el.querySelectorAll<HTMLElement>('.vxn-w').forEach((w) => {
          w.style.clipPath = CLIP;
        });
        m.el.querySelectorAll<HTMLElement>('.vxn-w__i').forEach((i) => {
          i.style.transform = 'translateY(140%)';
        });
        return;
      }
      const f = FROM[m.kind];
      /* The element's own transitions stand down while this file owns its
         opacity and transform, or they would ease values already being eased. */
      m.el.style.transition = 'none';
      m.el.style.opacity = '0';
      if (f.y) m.el.style.transform = `translateY(${f.y}px)`;
      if (f.blur) m.el.style.filter = `blur(${f.blur}px)`;
    };

    const clear = (m: Mark) => {
      if (m.kind === 'lines') m.el.querySelectorAll<HTMLElement>('.vxn-w, .vxn-w__i').forEach(strip);
      else strip(m.el);
    };

    /* ---- Playing a mark -------------------------------------------------- */
    const pending = new Set<HTMLElement>();

    const play = (m: Mark, order: number) => {
      if (!pending.has(m.el)) return;
      pending.delete(m.el);
      const delay = (m.delay ?? 0) / 1000 + Math.min(order, 8) * STAGGER.beat + OFFSET[m.kind];

      if (m.kind === 'lines') {
        const words = Array.from(m.el.querySelectorAll<HTMLElement>('.vxn-w'));
        const inners = Array.from(m.el.querySelectorAll<HTMLElement>('.vxn-w__i'));
        if (!inners.length) return clear(m);
        animate(
          inners,
          { y: ['140%', '0%'] },
          {
            duration: DUR.line,
            ease: EASE.out,
            /* Each line a beat after the one above it, so a two-line heading
               reads as two lines rather than one block sliding. */
            delay: (i: number) => delay + lineOf(words[i]!) * STAGGER.line,
          },
        ).then(() => clear(m), () => clear(m));
        return;
      }

      const f = FROM[m.kind];
      const keyframes: Record<string, unknown> = { opacity: [0, 1] };
      if (f.y) keyframes.y = [f.y, 0];
      if (f.blur) keyframes.filter = [`blur(${f.blur}px)`, 'blur(0px)'];
      const duration =
        m.kind === 'rise' ? DUR.rise : m.kind === 'rise-sm' ? DUR.small : m.kind === 'blur' ? DUR.copy : DUR.fade;
      animate(m.el, keyframes, { duration, ease: EASE.out, delay }).then(() => clear(m), () => clear(m));
    };

    const io = new IntersectionObserver(
      (entries) => {
        const due = entries
          .filter((e) => e.isIntersecting)
          .map((e) => e.target as HTMLElement)
          .sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
        due.forEach((el, i) => {
          io.unobserve(el);
          const m = byEl.get(el);
          if (m) play(m, i);
        });
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.01 },
    );

    const above: Mark[] = [];
    marks.forEach((m) => {
      if (onScreen(m.el) && !fresh) return; /* painted a while ago: left as it stands */
      hide(m);
      pending.add(m.el);
      if (onScreen(m.el)) above.push(m);
      else io.observe(m.el);
    });

    /* ---- Runs ------------------------------------------------------------ */
    const runObservers: IntersectionObserver[] = [];
    runs.forEach((run) => {
      const host = run.host!;
      if (onScreen(host) && !fresh) return;
      run.items.forEach((it) => {
        it.style.transition = 'none';
        it.style.opacity = '0';
        it.style.transform = 'translateY(48px)';
      });
      const go = () =>
        animate(
          run.items,
          { opacity: [0, 1], y: [48, 0] },
          { duration: DUR.rise, ease: EASE.out, delay: stagger(run.gap) },
        ).then(
          () => run.items.forEach(strip),
          () => run.items.forEach(strip),
        );
      const rio = new IntersectionObserver(
        (entries) => {
          if (!entries.some((e) => e.isIntersecting)) return;
          rio.disconnect();
          go();
        },
        { rootMargin: '0px 0px -12% 0px', threshold: 0.01 },
      );
      rio.observe(host);
      runObservers.push(rio);
    });

    /* Two frames on, so the hidden state has painted before it moves. */
    let raf = requestAnimationFrame(() => {
      raf = requestAnimationFrame(() => above.forEach((m, i) => play(m, i)));
    });

    /* ---- Figures --------------------------------------------------------- */
    /* Each element's own text is the value, so the roll only ever counts up to
       what is already on the page, and a blocked bundle changes nothing. */
    const countIo = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          countIo.unobserve(e.target);
          const node = e.target as HTMLElement;
          const raw = node.dataset.vxnCount || node.textContent || '';
          const digits = raw.replace(/[^\d]/g, '');
          const target = Number(digits);
          if (!digits || !Number.isFinite(target) || target <= 0) return;
          const at = raw.indexOf(digits);
          const prefix = raw.slice(0, at);
          const suffix = raw.slice(at + digits.length);
          animate(0, target, {
            duration: DUR.count,
            ease: EASE.out,
            onUpdate: (v) => {
              node.textContent = `${prefix}${Math.round(v)}${suffix}`;
            },
            /* Written back whatever the frames did, so a figure is never left
               on a number it only counted through. */
            onComplete: () => {
              node.textContent = raw;
            },
          });
        }),
      { rootMargin: '0px 0px -12% 0px', threshold: 0.2 },
    );
    root.querySelectorAll<HTMLElement>(COUNT).forEach((n) => countIo.observe(n));

    /* ---- The rescues ----------------------------------------------------- */
    /* An element the observer missed is played on the next scroll that finds
       it in the viewport, and anything without a box is played after five
       seconds, since it will never intersect. No blanket sweep: that would
       arrive the whole page at once. */
    let tick = false;
    const rescue = () => {
      tick = false;
      let order = 0;
      marks.forEach((m) => {
        if (!pending.has(m.el)) return;
        const r = m.el.getBoundingClientRect();
        if (r.top < vh() * 0.95 && r.bottom > 0 && r.height > 0) {
          io.unobserve(m.el);
          play(m, order++);
        }
      });
    };
    const onScroll = () => {
      if (tick) return;
      tick = true;
      requestAnimationFrame(rescue);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    const sweep = window.setTimeout(() => {
      marks.forEach((m) => {
        if (!pending.has(m.el)) return;
        const r = m.el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) play(m, 0);
      });
    }, 5000);

    /* A split heading still waiting regroups at another width: its words
       rewrap, and the line each belongs to changes with them. */
    let rz = 0;
    const onResize = () => {
      window.clearTimeout(rz);
      rz = window.setTimeout(() => {
        marks.forEach((m) => {
          if (m.kind === 'lines' && pending.has(m.el)) {
            groupLines(Array.from(m.el.querySelectorAll<HTMLElement>('.vxn-w')));
          }
        });
      }, 120);
    };
    window.addEventListener('resize', onResize, { passive: true });

    const stopDrift = startDrift(scan.drifters);

    return () => {
      io.disconnect();
      countIo.disconnect();
      runObservers.forEach((o) => o.disconnect());
      stopDrift();
      cancelAnimationFrame(raf);
      window.clearTimeout(sweep);
      window.clearTimeout(rz);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return null;
}
