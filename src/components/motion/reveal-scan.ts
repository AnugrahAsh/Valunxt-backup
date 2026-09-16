/**
 * THE PAGE WALK the site's two reveal engines share.
 *
 * Lifted verbatim out of components/layout/SiteMotion.tsx (20260917) when the
 * UAE home page moved onto Framer Motion, so the two players cannot disagree
 * about what a heading is, what counts as a card, or which subtrees are out of
 * bounds. Nothing here animates anything: it walks the content, classifies what
 * it finds, wraps the words of a splittable heading, and hands back a list.
 *
 *   components/layout/SiteMotion.tsx     the CSS player, every page but one
 *   components/motion/UaeHomeMotion.tsx  the Framer Motion player, /en-ae/
 *
 * THE SAFETY RULE both players keep: this file never hides anything. It only
 * reports. A player hides an element and is then responsible for showing it
 * again, so a blocked bundle leaves the page whole.
 *
 * WHAT CHANGED WHEN IT MOVED HERE: two selectors joined SKIP — .vxn-trio and
 * .vxn-foot — because both now carry their own Framer Motion wherever they are
 * rendered (sections/WhoWeAreTrio.tsx, layout/FooterUae.tsx), and two engines
 * hiding the same element would race to show it. Nothing else in the walk is
 * different from the engine it came out of.
 */

/** The two subtrees a page's motion covers. */
export const SCOPE = '#main-content, #main-footer';

/** Subtrees no engine enters. */
export const SKIP =
  '[data-reveal="none"], [data-anim], .animated, .swiper, .swiper-wrapper, .e-n-accordion, .e-n-tabs-content, ' +
  '.elementor-tab-content, .elementor-tabs-content-wrapper, .at-acc__panel, header, nav, .elementor-location-header, ' +
  '.vxn-umega, .vxn-mmenu, form, select, textarea, iframe, [aria-hidden="true"], #vx-preloader, .vxn-klay, ' +
  '.elementor-widget-video, .elementor-widget-google_maps, .elementor-widget-counter, .vxn-cookie, [data-vxn-count], ' +
  'table, code, pre, .vamtam-scroll-to-top, [data-vxae-hero], .vxn-trio, .vxn-foot';

/** SKIP without [data-anim]: what a heading may not cross even for lines. */
export const SKIP_HARD = SKIP.replace('[data-anim], ', '');

/** Inline formatting a heading may hold and still be split into words. */
const INLINE = new Set(['SPAN', 'STRONG', 'EM', 'B', 'I', 'A', 'BR', 'MARK', 'SMALL', 'SUP', 'SUB', 'U']);

const HEADING = 'h1, h2, h3, h4, .elementor-heading-title';
const TEXT = 'p, li, dd, dt, blockquote, .elementor-icon-list-text';
const BUTTON = 'a.elementor-button, .elementor-button-wrapper, .vxn-band__pill, .at-btn, .abk-btn, .svcx-btn, .re-btn';
const CARD = 'article, .e-loop-item, .elementor-post, figure';
const MEDIA = 'img, video';

export type Kind = 'lines' | 'blur' | 'rise' | 'rise-sm' | 'fade';

export interface Mark {
  el: HTMLElement;
  kind: Kind;
  /** A delay, in ms, the walk already knows about: a list's items, a marked group. */
  delay?: number;
}

export interface Drifter {
  el: HTMLElement;
  /** Pixels of travel, signed so neighbours part. */
  s: number;
  /** True when the picture sits in a frame that clips, so it must be scaled. */
  scale: boolean;
}

export interface Scan {
  marks: Mark[];
  drifters: Drifter[];
  /** The first block in the content: the hero coming up on a fresh load. */
  first: HTMLElement | null;
  /** True when the marks already hold `first`. */
  firstSeen: boolean;
}

export function isSkipped(el: Element, root: Element, throughAnim = false): boolean {
  let n: Element | null = el;
  while (n && n !== root) {
    if (n.matches(SKIP) && !(throughAnim && n.matches('[data-anim]') && !n.matches(SKIP_HARD))) return true;
    if (n !== el && n.hasAttribute('data-reveal')) return true;
    n = n.parentElement;
  }
  return false;
}

export function isShown(el: Element): boolean {
  const r = el.getBoundingClientRect();
  return r.width > 0 && r.height > 0;
}

/** A heading can be split when it holds text and simple inline elements only. */
export function splittable(el: Element): boolean {
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
export function wrapWords(el: Element): HTMLElement[] {
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
export function groupLines(words: HTMLElement[]): void {
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

/** The line index the walk gave a word wrapper. */
export function lineOf(word: HTMLElement): number {
  return Number(word.style.getPropertyValue('--vxn-line') || 0);
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

/**
 * Walk the content and classify it. Also takes Elementor's own entrance
 * animations over, which is a mutation both players need and neither should
 * repeat.
 */
export function scanReveal(roots: HTMLElement[]): Scan {
  const marks: Mark[] = [];
  const drifters: Drifter[] = [];
  const seen = new Set<Element>();

  const mark = (el: Element, kind: Kind, delay?: number) => {
    if (seen.has(el)) return;
    seen.add(el);
    marks.push({ el: el as HTMLElement, kind, delay });
  };

  roots.forEach((root) => {
    /* Elementor's own entrance animations: taken over. The class comes off so
       the element is visible under this engine's rules, and the legacy replay
       (SiteScripts ENTRANCE_ANIMATIONS) sees it as done. */
    root.querySelectorAll<HTMLElement & { __vxnRevealed?: number }>('.elementor-invisible').forEach((el) => {
      el.__vxnRevealed = 1;
      el.classList.remove('elementor-invisible');
      /* Elementor's own frontend may still add `animated <name>` when its
         waypoint fires; the stylesheet voids that animation on this class, or
         the widget would blink a second time once on screen. */
      el.classList.add('vxn-took');
    });

    /* The hero of /en-ae/: its own script turns the slides by toggling classes
       on panels that are all in the markup, so the first panel's copy is
       marked by hand (the subtree is otherwise skipped). */
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
      marks.push({ el, kind: k });
    });
    root.querySelectorAll<HTMLElement>('[data-reveal-group]').forEach((g) => {
      if (isSkipped(g, root)) return;
      Array.from(g.children).forEach((c, i) => {
        if (!(c instanceof HTMLElement) || c.hasAttribute('data-reveal') || c.matches(SKIP)) return;
        mark(c, 'rise', Math.min(i, 8) * 90);
      });
    });

    /* Cards and pictures first, so their headings and copy are theirs. A card
       is a card only when it is smaller than the screen: the home pages wrap
       the whole of their content in an <article>. */
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
      let delay: number | undefined;
      if (p.matches('li') && parent) {
        delay = Math.min(Array.from(parent.children).indexOf(p), 8) * 70;
      }
      mark(p, 'blur', delay);
    });
  });

  /* The hero coming up on a fresh load: the first block in the content. */
  const first = (Array.from(roots[0]?.children ?? []).find((c) => isShown(c)) as HTMLElement | undefined) ?? null;

  return { marks, drifters, first, firstSeen: first ? seen.has(first) : true };
}

/**
 * Was the page painted moments ago? What is already on screen is hidden and
 * revealed only on a fresh load, and otherwise left as it stands, so the page
 * never blinks after a slow dev compile.
 */
export function freshPaint(): boolean {
  const paint = performance.getEntriesByType('paint').find((e) => e.name === 'first-contentful-paint');
  return (
    (paint ? performance.now() - paint.startTime < 600 : performance.now() < 1500) ||
    window.location.hash === '#vxn-fresh'
  );
}

/**
 * The drift: the larger in-flow pictures move against the scroll, each at its
 * own rate, so neighbours part. Writes --vxn-px, which the stylesheet reads.
 * Returns the teardown.
 */
export function startDrift(drifters: Drifter[]): () => void {
  if (!drifters.length) return () => {};
  const live = new Set<HTMLElement>();
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
  const dio = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (e.isIntersecting) live.add(e.target as HTMLElement);
        else live.delete(e.target as HTMLElement);
      }),
    { rootMargin: '15% 0px 15% 0px' }
  );
  drifters.forEach((d) => {
    if (d.scale) d.el.style.setProperty('--vxn-px-scale', '1.1');
    dio.observe(d.el);
  });
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  drift();

  return () => {
    dio.disconnect();
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onScroll);
  };
}
