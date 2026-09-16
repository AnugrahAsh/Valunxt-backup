'use client';

/**
 * THE SITE'S SCROLL MOTION (20260916), built to the supplied recording
 * ("animation reference.mp4", a 720 x 540 capture of a wealth-management
 * site scrolled top to bottom). Mounted once, in PageShell, for every page
 * that shell renders; the real-estate section has its own engine
 * (real-estate/components/motion/MotionRoot.tsx) and is not touched, and
 * /en-ae/ is driven by Framer Motion instead — see WHERE THIS DOES NOT RUN.
 *
 * WHAT THE RECORDING DOES, measured at 10 frames a second:
 *   - Headings arrive a line at a time: each line rises through a mask from
 *     below its own box, about 0.5s a line, the next line starting about
 *     0.1s after the one above it ("Explore innovative investment /
 *     products in a new asset class", frames 4 to 8 at 4.4s; "Where
 *     High-Tech / meets High-Touch" at 11.4s).
 *   - Paragraphs and small lines come out of a blur: soft and faint, then
 *     sharp, over about 0.7s, starting a beat after the heading.
 *   - Pictures and cards slide up from about 60px below and fade in over
 *     about 0.8s, neighbours 80 to 100ms apart (the three cards at 4.6s, the
 *     two pillar pictures at 14s).
 *   - Once in, the larger pictures drift: as the page scrolls, the two
 *     pictures of a pillar move at different rates from the copy beside
 *     them (14s to 26s), whole boxes, not a window on the picture.
 *   - The hero comes up from white on load, its title a line at a time, then
 *     the lede, then the buttons, then the bar.
 *
 * HOW IT IS DONE HERE. On mount the PAGE WALK — motion/reveal-scan.ts, which
 * this file and the Framer Motion player share — classifies the content:
 *
 *   lines   h1 to h4, and Elementor's heading widgets whatever their tag,
 *           when they hold text and inline formatting only. Every word is
 *           wrapped (span.vxn-w > span.vxn-w__i), the words are grouped into
 *           lines by their rendered top, and each line gets its own delay.
 *   blur    paragraphs and list items.
 *   rise    pictures (an img or video with its pure wrapper, an image link,
 *           a figure), cards (article, loop items), and the elements a band
 *           marks data-reveal="rise" itself.
 *   rise-sm the buttons.
 *   fade    the first block in the content on a fresh load: the hero
 *           coming up.
 *   drift   the larger in-flow pictures, which take a --vxn-px the scroll
 *           handler writes, alternating in sign so neighbours part.
 *
 * This file is the CSS PLAYER of that walk. Marked elements carry
 * data-reveal="<kind>" and data-reveal-state, first "pending" then "in" when
 * an IntersectionObserver sees them (10% into the viewport); within one
 * observer batch the arrivals are 70ms apart, and the stylesheet
 * (assets/css/valunxt-brand.css) draws each one.
 *
 * THE SAFETY RULE, the one every engine on the site follows: the stylesheet's
 * default is VISIBLE, and the hidden state exists only under
 * data-reveal-state="pending", which only this file sets. If the bundle is
 * blocked or throws, the page renders whole. A timer sweeps whatever is
 * still pending after five seconds, and reduced motion marks nothing at all.
 *
 * WHAT IT LEAVES ALONE: see SKIP in motion/reveal-scan.ts — among others the
 * hero of /en-ae/ except its first panel's copy, carousels, tab and accordion
 * panels, the header and its menus, forms, the three-card trio and the footer
 * (both of which carry their own Framer Motion), and anything one of the
 * earlier engines already marks with data-anim. Elementor's own entrance
 * animations (.elementor-invisible) are taken over by the walk.
 *
 * ---------------------------------------------------------------------------
 * WHERE THIS DOES NOT RUN. A page that declares `data-vxn-motion="framer"` on
 * its content root drives its own arrivals through Framer Motion
 * (motion/UaeHomeMotion.tsx) and this engine stands down on it entirely —
 * otherwise both would hide the same element and race to show it again. Today
 * that is the UAE home page and nothing else.
 *
 * THE ABOVE-THE-FOLD FLASH. This runs after hydration, so what is already
 * on screen was painted visible. It is hidden and revealed only when the
 * first contentful paint was under 600ms ago (production), and otherwise
 * left as it stands (a slow dev load), so the page never blinks.
 */
import { useEffect } from 'react';

import { SCOPE, freshPaint, groupLines, scanReveal, startDrift } from '@/components/motion/reveal-scan';

export default function SiteMotion() {
  useEffect(() => {
    if (typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (typeof IntersectionObserver !== 'function') return;
    /* The page runs Framer Motion instead: see WHERE THIS DOES NOT RUN. */
    if (document.querySelector('[data-vxn-motion="framer"]')) return;

    const roots = Array.from(document.querySelectorAll<HTMLElement>(SCOPE));
    if (!roots.length) return;
    document.documentElement.classList.add('vxn-reveal');

    const { marks, drifters, first, firstSeen } = scanReveal(roots);
    const marked = marks.map((m) => {
      m.el.setAttribute('data-reveal', m.kind);
      if (m.delay !== undefined) m.el.style.setProperty('--vxn-d', `${m.delay}ms`);
      return m.el;
    });
    if (!marked.length) return;

    /* ---- Reveal -------------------------------------------------------- */
    const vh = window.innerHeight || 0;
    const fresh = freshPaint();

    /* Once an arrival has played the marks come off, so an element's own
       transition and transform (a card's hover lift, a pill's sweep) are
       its own again; the words of a split heading stay wrapped, inert. */
    const done = (el: HTMLElement) => {
      el.removeAttribute('data-reveal-state');
      el.removeAttribute('data-reveal');
      el.style.removeProperty('--vxn-d');
    };
    const show = (el: HTMLElement, order: number) => {
      if (el.dataset.revealState !== 'pending') return;
      if (!el.style.getPropertyValue('--vxn-d')) el.style.setProperty('--vxn-d', `${Math.min(order, 8) * 70}ms`);
      el.dataset.revealState = 'in';
      const d = parseFloat(el.style.getPropertyValue('--vxn-d')) || 0;
      const last = el.dataset.reveal === 'lines' ? el.querySelector<HTMLElement>('.vxn-w:last-of-type') : null;
      const lines = last ? Number(last.style.getPropertyValue('--vxn-line') || 0) * 95 : 0;
      window.setTimeout(() => done(el), 1300 + d + lines);
    };

    const io = new IntersectionObserver(
      (entries) => {
        const due = entries
          .filter((e) => e.isIntersecting)
          .map((e) => e.target as HTMLElement)
          .sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
        due.forEach((el, i) => {
          show(el, i);
          io.unobserve(el);
        });
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.01 }
    );

    const above: HTMLElement[] = [];
    marked.forEach((el) => {
      const r = el.getBoundingClientRect();
      const onScreen = r.top < vh * 0.9 && r.bottom > 0;
      if (onScreen && !fresh) {
        /* Painted a while ago: left as it stands rather than blinked. */
        done(el);
        return;
      }
      el.dataset.revealState = 'pending';
      if (onScreen) above.push(el);
      else io.observe(el);
    });
    if (first && fresh && !firstSeen) {
      first.setAttribute('data-reveal', 'fade');
      first.dataset.revealState = 'pending';
      marked.push(first);
      above.unshift(first);
    }
    /* Two frames on, so the pending state has painted before it transitions. */
    let raf = requestAnimationFrame(() => {
      raf = requestAnimationFrame(() => above.forEach((el, i) => show(el, i)));
    });

    /* The rescue: an element the observer missed is shown on the next
       scroll that finds it in the viewport, and anything without a box
       (a collapsed or hidden block) is shown after five seconds, since it
       will never intersect. There is no blanket sweep: that would reveal
       the whole page at once and end the effect. */
    let rescueTick = false;
    const rescue = () => {
      rescueTick = false;
      const h = window.innerHeight || 0;
      let order = 0;
      marked.forEach((el) => {
        if (el.dataset.revealState !== 'pending') return;
        const r = el.getBoundingClientRect();
        if (r.top < h * 0.95 && r.bottom > 0 && r.height > 0) {
          show(el, order++);
          io.unobserve(el);
        }
      });
    };
    const onRescue = () => {
      if (rescueTick) return;
      rescueTick = true;
      requestAnimationFrame(rescue);
    };
    window.addEventListener('scroll', onRescue, { passive: true });
    const sweep = window.setTimeout(() => {
      marked.forEach((el) => {
        if (el.dataset.revealState !== 'pending') return;
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) show(el, 0);
      });
    }, 5000);

    /* Lines regroup while a split heading is still waiting, since the words
       rewrap at another width. */
    let rz = 0;
    const onResize = () => {
      window.clearTimeout(rz);
      rz = window.setTimeout(() => {
        marked.forEach((el) => {
          if (el.dataset.reveal === 'lines' && el.dataset.revealState === 'pending') {
            groupLines(Array.from(el.querySelectorAll<HTMLElement>('.vxn-w')));
          }
        });
      }, 120);
    };
    window.addEventListener('resize', onResize, { passive: true });

    const stopDrift = startDrift(drifters);

    return () => {
      io.disconnect();
      stopDrift();
      cancelAnimationFrame(raf);
      window.clearTimeout(sweep);
      window.clearTimeout(rz);
      window.removeEventListener('scroll', onRescue);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return null;
}
