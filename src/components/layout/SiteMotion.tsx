'use client';

/**
 * THE SITE'S SCROLL MOTION (20260916), built to the supplied recording
 * ("animation reference.mp4", a 720 x 540 capture of a wealth-management
 * site scrolled top to bottom). Mounted once, in PageShell, for every page
 * that shell renders; the real-estate section has its own engine
 * (real-estate/components/motion/MotionRoot.tsx) and is not touched.
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
 * HOW IT IS DONE HERE. On mount the engine walks the page's content
 * (#main-content, and the footer) and marks what it finds:
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
 * Marked elements carry data-reveal="<kind>" and data-reveal-state, first
 * "pending" then "in" when an IntersectionObserver sees them (10% into the
 * viewport); within one observer batch the arrivals are 70ms apart.
 *
 * THE SAFETY RULE, the one every engine on the site follows: the stylesheet's
 * default is VISIBLE, and the hidden state exists only under
 * data-reveal-state="pending", which only this file sets. If the bundle is
 * blocked or throws, the page renders whole. A timer sweeps whatever is
 * still pending after five seconds, and reduced motion marks nothing at all.
 *
 * WHAT IT LEAVES ALONE: anything under data-reveal="none"; the hero of
 * /en-ae/ except its first panel's copy (its own script turns the slides);
 * carousels (.swiper), tab and accordion panels; the header and its menus;
 * forms; anything one of the earlier engines already marks with data-anim
 * (the UAE service templates' groups, the home's figure, mosaic and
 * expertise bands), and elements Elementor has already animated (.animated).
 * Elementor's own entrance animations (.elementor-invisible) are taken over:
 * the class comes off here and the element is marked revealed for the
 * legacy replay in SiteScripts, so the India pages move the same way as the
 * UAE ones.
 *
 * THE ABOVE-THE-FOLD FLASH. This runs after hydration, so what is already
 * on screen was painted visible. It is hidden and revealed only when the
 * first contentful paint was under 600ms ago (production), and otherwise
 * left as it stands (a slow dev load), so the page never blinks.
 */
import { useEffect } from 'react';

const SCOPE = '#main-content, #main-footer';

/** Subtrees the engine never enters. */
const SKIP =
  '[data-reveal="none"], [data-anim], .animated, .swiper, .swiper-wrapper, .e-n-accordion, .e-n-tabs-content, ' +
  '.elementor-tab-content, .elementor-tabs-content-wrapper, .at-acc__panel, header, nav, .elementor-location-header, ' +
  '.vxn-umega, .vxn-mmenu, form, select, textarea, iframe, [aria-hidden="true"], #vx-preloader, .vxn-klay, ' +
  '.elementor-widget-video, .elementor-widget-google_maps, .elementor-widget-counter, .vxn-cookie, [data-vxn-count], ' +
  'table, code, pre, .vamtam-scroll-to-top, [data-vxae-hero]';

/** SKIP without [data-anim]: what a heading may not cross even for lines. */
const SKIP_HARD = SKIP.replace('[data-anim], ', '');

/** Inline formatting a heading may hold and still be split into words. */
const INLINE = new Set(['SPAN', 'STRONG', 'EM', 'B', 'I', 'A', 'BR', 'MARK', 'SMALL', 'SUP', 'SUB', 'U']);

const HEADING = 'h1, h2, h3, h4, .elementor-heading-title';
const TEXT = 'p, li, dd, dt, blockquote, .elementor-icon-list-text';
const BUTTON = 'a.elementor-button, .elementor-button-wrapper, .vxn-band__pill, .at-btn, .abk-btn, .svcx-btn, .re-btn';
const CARD = 'article, .e-loop-item, .elementor-post, figure';
const MEDIA = 'img, video';

type Kind = 'lines' | 'blur' | 'rise' | 'rise-sm' | 'fade';

function isSkipped(el: Element, root: Element, throughAnim = false): boolean {
  let n: Element | null = el;
  while (n && n !== root) {
    if (n.matches(SKIP) && !(throughAnim && n.matches('[data-anim]') && !n.matches(SKIP_HARD))) return true;
    if (n !== el && n.hasAttribute('data-reveal')) return true;
    n = n.parentElement;
  }
  return false;
}

function isShown(el: Element): boolean {
  const r = el.getBoundingClientRect();
  return r.width > 0 && r.height > 0;
}

/** A heading can be split when it holds text and simple inline elements only. */
function splittable(el: Element): boolean {
  if (el.querySelector('img, svg, video, button, input, select, br + br')) return false;
  const text = (el.textContent || '').trim();
  if (!text || text.length > 260) return false;
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_ELEMENT);
  let n = walker.nextNode() as Element | null;
  while (n) {
    if (!INLINE.has(n.tagName)) return false;
    n = walker.nextNode() as Element | null;
  }
  return true;
}

/** Wrap every word of the element's text nodes: span.vxn-w > span.vxn-w__i. */
function wrapWords(el: Element): HTMLElement[] {
  const texts: Text[] = [];
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  let t = walker.nextNode() as Text | null;
  while (t) {
    if (t.nodeValue && t.nodeValue.trim()) texts.push(t);
    t = walker.nextNode() as Text | null;
  }
  const words: HTMLElement[] = [];
  texts.forEach((node) => {
    const parts = (node.nodeValue || '').split(/(\s+)/);
    const frag = document.createDocumentFragment();
    parts.forEach((part) => {
      if (!part) return;
      if (/^\s+$/.test(part)) {
        frag.appendChild(document.createTextNode(part));
        return;
      }
      const w = document.createElement('span');
      w.className = 'vxn-w';
      const i = document.createElement('span');
      i.className = 'vxn-w__i';
      i.textContent = part;
      w.appendChild(i);
      frag.appendChild(w);
      words.push(w);
    });
    node.parentNode?.replaceChild(frag, node);
  });
  return words;
}

/** Group the words into rendered lines and give each line its index. */
function groupLines(words: HTMLElement[]): void {
  let line = -1;
  let lastTop = -Infinity;
  words.forEach((w) => {
    const top = w.getBoundingClientRect().top;
    if (Math.abs(top - lastTop) > 2) {
      line += 1;
      lastTop = top;
    }
    w.style.setProperty('--vxn-line', String(line));
  });
}

/** The pure wrapper chain above a picture: parents holding nothing but it. */
function mediaHost(img: Element, root: Element): Element {
  let host: Element = img;
  const box = img.getBoundingClientRect();
  let p = host.parentElement;
  while (p && p !== root && p.childElementCount === 1 && !(p.textContent || '').trim()) {
    const pb = p.getBoundingClientRect();
    if (pb.height > box.height + 12 || pb.width > box.width + 12) break;
    if (p.matches(SCOPE) || p.matches('section, main, article')) break;
    host = p;
    p = host.parentElement;
  }
  /* An image link is revealed whole: the card the picture is part of. */
  const link = img.closest('a');
  if (link && root.contains(link) && !link.matches(SKIP)) {
    const d = getComputedStyle(link).display;
    if (d !== 'inline') host = link;
  }
  return host;
}

export default function SiteMotion() {
  useEffect(() => {
    if (typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (typeof IntersectionObserver !== 'function') return;

    const roots = Array.from(document.querySelectorAll<HTMLElement>(SCOPE));
    if (!roots.length) return;
    document.documentElement.classList.add('vxn-reveal');

    const marked: HTMLElement[] = [];
    const seen = new Set<Element>();
    const drifters: { el: HTMLElement; s: number; scale: boolean }[] = [];

    const mark = (el: Element, kind: Kind) => {
      if (seen.has(el)) return;
      seen.add(el);
      el.setAttribute('data-reveal', kind);
      marked.push(el as HTMLElement);
    };

    roots.forEach((root) => {
      /* Elementor's own entrance animations: taken over. The class comes off
         so the element is visible under this engine's rules, and the legacy
         replay (SiteScripts ENTRANCE_ANIMATIONS) sees it as done. */
      root.querySelectorAll<HTMLElement & { __vxnRevealed?: number }>('.elementor-invisible').forEach((el) => {
        el.__vxnRevealed = 1;
        el.classList.remove('elementor-invisible');
        /* Elementor's own frontend may still add `animated <name>` when its
           waypoint fires; the stylesheet voids that animation on this class,
           or the widget would blink a second time once on screen. */
        el.classList.add('vxn-took');
      });

      /* The hero of /en-ae/: its own script turns the slides by toggling
         classes on panels that are all in the markup, so the first panel's
         copy is marked by hand (the subtree is otherwise skipped). */
      const hero = root.querySelector('[data-vxae-hero] .vxae-hero__panel.is-active');
      if (hero) {
        const t = hero.querySelector('.vxae-hero__title');
        if (t && splittable(t)) {
          groupLines(wrapWords(t));
          mark(t, 'lines');
        } else if (t) mark(t, 'rise');
        const l = hero.querySelector('.vxae-hero__lede');
        if (l) mark(l, 'blur');
        const a = hero.querySelector('.vxae-hero__actions');
        if (a) mark(a, 'rise-sm');
        const tabs = root.querySelector('[data-vxae-hero] .vxae-hero__tabs');
        if (tabs) mark(tabs, 'fade');
      }

      /* Bands that mark themselves. */
      root.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
        const k = el.getAttribute('data-reveal') as Kind | 'none';
        if (k === 'none' || isSkipped(el, root)) return;
        seen.add(el);
        marked.push(el);
      });
      root.querySelectorAll<HTMLElement>('[data-reveal-group]').forEach((g) => {
        if (isSkipped(g, root)) return;
        Array.from(g.children).forEach((c, i) => {
          if (!(c instanceof HTMLElement) || c.hasAttribute('data-reveal') || c.matches(SKIP)) return;
          mark(c, 'rise');
          c.style.setProperty('--vxn-d', `${Math.min(i, 8) * 90}ms`);
        });
      });

      /* Cards and pictures first, so their headings and copy are theirs. A
         card is a card only when it is smaller than the screen: the home
         pages wrap the whole of their content in an <article>. */
      const vh0 = window.innerHeight || 800;
      const vw0 = window.innerWidth || 1200;
      root.querySelectorAll(CARD).forEach((el) => {
        if (isSkipped(el, root) || !isShown(el)) return;
        const r = el.getBoundingClientRect();
        if (r.height > vh0 * 0.8 || (r.width > vw0 * 0.9 && r.height > vh0 * 0.5)) return;
        mark(el, 'rise');
      });
      root.querySelectorAll(MEDIA).forEach((m) => {
        if (isSkipped(m, root) || !isShown(m)) return;
        const r = m.getBoundingClientRect();
        if (r.width < 80 || r.height < 80) return;
        const host = mediaHost(m, root);
        if (isSkipped(host, root) || seen.has(host)) return;
        mark(host, 'rise');
        /* The drift: in-flow pictures at least 220px tall, on wide screens. */
        if (r.height >= 220 && window.innerWidth >= 900 && host !== m && host.tagName !== 'A') {
          const clips = host !== m && getComputedStyle(host).overflow !== 'visible';
          const i = drifters.length;
          drifters.push({ el: m as HTMLElement, s: (i % 2 === 0 ? 1 : -0.55) * 34, scale: clips });
          m.setAttribute('data-reveal-drift', '');
        }
      });

      root.querySelectorAll(HEADING).forEach((h) => {
        if (isSkipped(h, root, true) || !isShown(h) || seen.has(h)) return;
        if (h.closest('a, button')) return;
        if (h.matches('.elementor-heading-title') && h.parentElement?.closest(HEADING)) return;
        if (splittable(h)) {
          const words = wrapWords(h);
          groupLines(words);
          (h as HTMLElement).dataset.revealWords = String(words.length);
          mark(h, 'lines');
        } else {
          mark(h, 'rise');
        }
      });

      root.querySelectorAll(BUTTON).forEach((b) => {
        if (isSkipped(b, root) || !isShown(b) || seen.has(b)) return;
        if (b.closest('[data-reveal]')) return;
        mark(b, 'rise-sm');
      });

      root.querySelectorAll(TEXT).forEach((p) => {
        if (isSkipped(p, root) || !isShown(p) || seen.has(p)) return;
        if (!(p.textContent || '').trim()) return;
        if (p.closest('[data-reveal], a, button')) return;
        if (p.querySelector(HEADING) || p.querySelector('img, video')) return;
        /* A list's items arrive one after another. */
        const parent = p.parentElement;
        if (p.matches('li') && parent) {
          const i = Array.from(parent.children).indexOf(p);
          (p as HTMLElement).style.setProperty('--vxn-d', `${Math.min(i, 8) * 70}ms`);
        }
        mark(p, 'blur');
      });
    });

    /* The hero coming up on a fresh load: the first block in the content. */
    const first = (Array.from(roots[0].children).find((c) => isShown(c)) as HTMLElement | undefined) ?? null;

    if (!marked.length) return;

    /* ---- Reveal -------------------------------------------------------- */
    const vh = window.innerHeight || 0;
    const paint = performance.getEntriesByType('paint').find((e) => e.name === 'first-contentful-paint');
    const fresh =
      (paint ? performance.now() - paint.startTime < 600 : performance.now() < 1500) ||
      window.location.hash === '#vxn-fresh';

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
    if (first && fresh && !seen.has(first)) {
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

    /* ---- Drift --------------------------------------------------------- */
    const live = new Set<HTMLElement>();
    let dio: IntersectionObserver | null = null;
    let ticking = false;
    const drift = () => {
      ticking = false;
      const h = window.innerHeight || 1;
      drifters.forEach((d) => {
        if (!live.has(d.el)) return;
        const r = d.el.getBoundingClientRect();
        const p = Math.max(-1, Math.min(1, (r.top + r.height / 2 - h / 2) / (h / 2)));
        d.el.style.setProperty('--vxn-px', `${(p * d.s).toFixed(1)}px`);
      });
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(drift);
    };
    if (drifters.length) {
      dio = new IntersectionObserver(
        (entries) =>
          entries.forEach((e) => {
            if (e.isIntersecting) live.add(e.target as HTMLElement);
            else live.delete(e.target as HTMLElement);
          }),
        { rootMargin: '15% 0px 15% 0px' }
      );
      drifters.forEach((d) => {
        if (d.scale) d.el.style.setProperty('--vxn-px-scale', '1.1');
        dio!.observe(d.el);
      });
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll, { passive: true });
      drift();
    }

    return () => {
      io.disconnect();
      dio?.disconnect();
      cancelAnimationFrame(raf);
      window.clearTimeout(sweep);
      window.clearTimeout(rz);
      window.removeEventListener('scroll', onRescue);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return null;
}
