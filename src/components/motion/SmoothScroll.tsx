'use client';

/**
 * SMOOTH INERTIA SCROLLING, EVERY PUBLIC PAGE (20260917) — Lenis.
 *
 * Mounted once from the root layout (app/layout.tsx) on the main site and on
 * the real estate section. Not on /admin: the admin panel is a working tool of
 * tables, forms and a rich-text editor, and a scroll that keeps travelling
 * after the hand stops is the wrong thing in a place where people type.
 *
 * WHAT IT DOES. The mouse wheel and the trackpad no longer jump the page by
 * whole notches: Lenis catches the wheel, moves the page towards where it
 * should be a share of the way each frame (SCROLL.lerp in motion-tokens.ts),
 * and keeps it gliding after the input stops. The page still scrolls the
 * WINDOW, natively — nothing is transformed — so position: sticky and fixed
 * headers, IntersectionObserver reveals, scroll listeners and CSS scroll-driven
 * animations all go on working exactly as before, only fed smoother numbers.
 *
 * Touch screens keep their own momentum scroll (syncTouch: false). A phone's
 * flick is already inertial and tuned by the OS; replacing it reads as worse,
 * not better, and breaks pull-to-refresh and the collapsing address bar.
 *
 * ---------------------------------------------------------------------------
 * ONE CLOCK WITH FRAMER MOTION. Lenis is advanced from Framer Motion's own
 * frame loop rather than from a requestAnimationFrame of its own, so on any
 * frame the scroll position and every animation that reads it are computed
 * together. Two separate loops can land a frame apart, and a picture drifting
 * against the scroll then shimmers by a pixel.
 *
 * THE LOCKS. The page locks its own scroll in three places — the burger drawer
 * (html.vxn-drawer-open), the cookie preferences (body.vxn-cookie-lock) and the
 * real estate drawer (an inline overflow on <body>) — and more may come. Lenis
 * scrolls the window programmatically, which an `overflow: hidden` does not
 * stop, so left alone it would carry on scrolling the page underneath an open
 * drawer. Rather than know about each lock, this watches <html> and <body> and
 * stops Lenis whenever either computes to a hidden overflow, whatever set it.
 * (Why Lenis's own stopped-state clip is left out of the stylesheet is noted
 * in smooth-scroll.css.)
 *
 * NESTED SCROLL. A panel that scrolls inside itself — the mega sheet on a short
 * laptop, the drawer's list, the cookie preferences, a long textarea — keeps
 * the wheel while it has room to scroll (allowNestedScroll), and then hands it
 * back to the page.
 *
 * SAME-PAGE ANCHORS (#jobs on Careers, #service_1 on Services, #contact and the
 * rest in the real estate section) now glide on the same curve instead of
 * jumping, and land below the fixed header rather than under it.
 *
 * REDUCED MOTION: Lenis honours prefers-reduced-motion itself — the wheel
 * tracks 1:1 and programmatic scrolls are instant — so a visitor who has asked
 * for less movement gets the browser's own scroll.
 *
 * THE SAFETY RULE: nothing here is needed for the page to scroll. With the
 * bundle blocked, the browser's own scrolling is simply what there is.
 */

import { useEffect } from 'react';
import Lenis from 'lenis';
import { cancelFrame, frame, type FrameData } from 'framer-motion';

import { SCROLL, easeOutExpo } from './motion-tokens';
import './smooth-scroll.css';

declare global {
  interface Window {
    /** The running Lenis instance, for scripts that need to scroll the page. */
    vxnLenis?: Lenis;
    /** Scroll to a number, an element or a selector on the house curve. */
    vxnScrollTo?: (target: number | string | HTMLElement) => void;
  }
}

/** The fixed bars an anchor has to land below. */
const HEADERS = '.elementor-location-header .vamtam-sticky-header:not(.vamtam-sticky-header--spacer), .re-head';

/** Breathing room between the bar and the anchored heading. */
const ANCHOR_GAP = 16;

/** The height of whichever fixed header is on the page. */
function headerOffset(): number {
  let h = 0;
  document.querySelectorAll<HTMLElement>(HEADERS).forEach((el) => {
    const pos = getComputedStyle(el).position;
    if (pos !== 'fixed' && pos !== 'sticky') return;
    h = Math.max(h, el.getBoundingClientRect().height);
  });
  return h;
}

function lockedOverflow(el: Element): boolean {
  const o = getComputedStyle(el).overflowY;
  return o === 'hidden' || o === 'clip';
}

export default function SmoothScroll() {
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;

    const lenis = new Lenis({
      lerp: SCROLL.lerp,
      wheelMultiplier: SCROLL.wheelMultiplier,
      smoothWheel: true,
      syncTouch: false,
      autoRaf: false,
      allowNestedScroll: true,
      stopInertiaOnNavigate: true,
    });

    const jump = { duration: SCROLL.jumpDuration, easing: easeOutExpo };
    window.vxnLenis = lenis;
    window.vxnScrollTo = (target) => {
      if (typeof target === 'number') {
        lenis.scrollTo(target, { ...jump, force: true });
        return;
      }
      const el = typeof target === 'string' ? document.querySelector<HTMLElement>(target) : target;
      if (!el) return;
      lenis.scrollTo(el, {
        ...jump,
        force: true,
        offset: -(headerOffset() + ANCHOR_GAP),
        /* The destination is measured when the trip starts, and a long trip
           passes pictures that finish loading on the way and push everything
           below them down (measured: #contact on the real estate page arrived
           155px short). If the target has moved by the time the glide lands,
           a short second glide takes up the difference. */
        onComplete: () => {
          const off = el.getBoundingClientRect().top - (headerOffset() + ANCHOR_GAP);
          if (Math.abs(off) > 24) {
            lenis.scrollTo(el, { duration: 0.6, easing: easeOutExpo, force: true, offset: -(headerOffset() + ANCHOR_GAP) });
          }
        },
      });
    };

    /* ---- One clock with Framer Motion ---------------------------------- */
    const tick = (data: FrameData) => lenis.raf(data.timestamp);
    frame.update(tick, true);

    /* ---- The locks ------------------------------------------------------ */
    const sync = () => {
      if (lockedOverflow(html) || lockedOverflow(body)) lenis.stop();
      else lenis.start();
    };
    /* Lenis rewrites its own state classes on <html> at the start and end of
       every scroll (lenis-scrolling, lenis-smooth). None of them sets an
       overflow, so a mutation that changed nothing but those is skipped rather
       than paid for with a style recalculation at the start of each glide. */
    const own = (v: string | null) =>
      (v ?? '')
        .split(/\s+/)
        .filter((c) => c && c !== 'lenis' && !c.startsWith('lenis-'))
        .join(' ');
    const mo = new MutationObserver((records) => {
      const relevant = records.some(
        (r) =>
          r.attributeName !== 'class' ||
          own(r.oldValue) !== own((r.target as Element).getAttribute('class')),
      );
      if (relevant) sync();
    });
    const watch = { attributes: true, attributeOldValue: true, attributeFilter: ['class', 'style'] };
    mo.observe(html, watch);
    mo.observe(body, watch);
    sync();

    /* ---- Same-page anchors ---------------------------------------------- */
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.('a[href*="#"]') as HTMLAnchorElement | null;
      if (!a || (a.target && a.target !== '_self') || a.hasAttribute('download')) return;
      let url: URL;
      try {
        url = new URL(a.href, window.location.href);
      } catch {
        return;
      }
      const here = window.location;
      if (url.origin !== here.origin || url.pathname !== here.pathname || url.search !== here.search) return;
      const id = decodeURIComponent(url.hash.slice(1));
      /* A bare "#" is a script's button, not a destination. */
      if (!id) return;
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      window.vxnScrollTo?.(target);
      if (here.hash !== url.hash) window.history.pushState(null, '', url.hash);
    };
    /* Bubble phase, after every handler on the link itself, so a tab or an
       accordion that owns its own hash link and prevents the default keeps it. */
    document.addEventListener('click', onClick);

    return () => {
      document.removeEventListener('click', onClick);
      mo.disconnect();
      cancelFrame(tick);
      lenis.destroy();
      if (window.vxnLenis === lenis) {
        delete window.vxnLenis;
        delete window.vxnScrollTo;
      }
    };
  }, []);

  return null;
}
