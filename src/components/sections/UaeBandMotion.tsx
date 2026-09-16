'use client';

/**
 * The motion layer for the two bands added on 20260912: the figures band
 * (.vxn-figs) and the poster trio (.vxn-post).
 *
 * WORKS BY SELECTOR, like the service template's Motion.tsx, so neither band's
 * markup carries animation concerns and a card added later is animated without
 * being opted in.
 *
 * THE SAFETY RULE, the same one that file states: the stylesheet's default is
 * VISIBLE, and the hidden state exists only under `[data-anim='pending']`,
 * which is an attribute set here. If this bundle is blocked, fails or throws,
 * both bands render in full. Anything already on screen when this runs is
 * revealed rather than left waiting for an intersection that will not come,
 * and a timer sweeps whatever is left after four seconds.
 *
 * THREE THINGS HAPPEN:
 *
 *   reveal   .vxn-figs__lead, each .vxn-figs__stat and each .vxn-post__card
 *            arrive in sequence, 90ms apart within their group; since
 *            20260915 so do the expertise
 *            band's copy and its photograph (the stylesheet draws each
 *            arrival: the tiles open by clip-path, the rest rise or slide).
 *   count    every [data-vxn-count] rolls from zero to its own value over
 *            1.1s. The value is in the markup as text, so the roll only ever
 *            replaces it with itself; the suffix ("+") is preserved.
 *   sheen    a card's specular sweep runs once as it arrives. Hover repeats it,
 *            and that is the stylesheet's, not this file's.
 *
 * REDUCED MOTION: no roll and no stagger. The observer still runs, so the
 * reveal is a plain fade with the transition the stylesheet neutralises.
 */
import { useEffect } from 'react';

/** What reveals, and in what order within its own group. The answer card's
 *  tiles and the expertise band's copy joined on 20260915; its figures carry
 *  [data-vxn-count], so they roll when their list arrives. The mosaic's three
 *  tiles joined with its new layout the same day. A group whose band is not
 *  rendered (the bento, the expertise band) simply matches nothing. */
const GROUPS = [
  '.vxn-figs__lead, .vxn-figs__stat',
  '.vxn-post__card',
  '.vxn-mosaic__card',
  '.vxn-xp__copy > *',
  '.vxn-xp__art',
];

/** 0 at 0, 1 at 1, fast then settling. */
function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export default function UaeBandMotion() {
  useEffect(() => {
    const reduce =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const targets: HTMLElement[] = [];
    GROUPS.forEach((sel) => {
      document.querySelectorAll<HTMLElement>(sel).forEach((el, i) => {
        el.dataset.anim = 'pending';
        /* The stagger is a delay the stylesheet reads, not a timer here, so a
           card revealed by the four-second sweep still arrives in order. */
        if (!reduce) el.style.setProperty('--vxn-anim-d', `${Math.min(i, 5) * 90}ms`);
        targets.push(el);
      });
    });
    if (!targets.length) return;

    /* ---- The figure roll ------------------------------------------------
       Each element's own text is the value; this only ever counts up to what
       is already rendered. */
    const rolled = new WeakSet<HTMLElement>();
    const roll = (host: HTMLElement) => {
      const nodes = host.matches('[data-vxn-count]')
        ? [host]
        : Array.from(host.querySelectorAll<HTMLElement>('[data-vxn-count]'));
      nodes.forEach((node) => {
        if (rolled.has(node)) return;
        rolled.add(node);
        const raw = node.dataset.vxnCount || node.textContent || '';
        const digits = raw.replace(/[^\d]/g, '');
        if (!digits) return;
        const target = Number(digits);
        if (!Number.isFinite(target) || target <= 0) return;
        const suffix = raw.slice(raw.indexOf(digits) + digits.length);
        const prefix = raw.slice(0, raw.indexOf(digits));
        if (reduce) return;
        const dur = 1100;
        /* The clock is the first frame's own timestamp, not performance.now()
           at the call: a rAF callback is handed the time the FRAME began, which
           can precede the moment the frame was requested. Taken the other way,
           the first step ran at a negative t, easeOut() went below zero, and
           every figure flashed its own negative before counting. Clamped as
           well, so no source of an early timestamp can do it again.

           THE VALUE IS NOT ZEROED UP FRONT, and a timer writes the real one
           whatever the frames do. rAF is throttled to a frame or two a second
           in a background tab and in headless Chrome, where this was measured:
           zeroing first and trusting the loop to climb back left "0+" on the
           page. So the figure only ever leaves its real value once a frame has
           actually arrived to replace it, and it is put back on a timer that
           does not depend on the loop running at all. */
        let start = 0;
        let done = false;
        const land = () => {
          if (done) return;
          done = true;
          node.textContent = raw;
        };
        const step = (now: number) => {
          if (done) return;
          if (!start) start = now;
          const t = Math.min(1, Math.max(0, (now - start) / dur));
          if (t >= 1) return land();
          node.textContent = `${prefix}${Math.round(easeOut(t) * target)}${suffix}`;
          requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        window.setTimeout(land, dur + 150);
      });
    };

    const show = (el: HTMLElement) => {
      if (el.dataset.anim === 'in') return;
      el.dataset.anim = 'in';
      roll(el);
    };

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          show(e.target as HTMLElement);
          io.unobserve(e.target);
        });
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.12 }
    );

    const vh = window.innerHeight || 0;
    targets.forEach((el) => {
      /* Already on screen: reveal now. An observer created below the fold
         never fires for what is above it. */
      const r = el.getBoundingClientRect();
      if (r.top < vh * 0.9 && r.bottom > 0) show(el);
      else io.observe(el);
    });

    const sweep = window.setTimeout(() => targets.forEach(show), 4000);

    return () => {
      io.disconnect();
      window.clearTimeout(sweep);
    };
  }, []);

  return null;
}
