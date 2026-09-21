'use client';

/**
 * What every section of the Dubai landing page shares: the arrival engine,
 * the pointer tilt, the count-up, the section header and the icon set.
 *
 * THE ARRIVAL ENGINE works by attribute rather than by wrapper: any element
 * carrying `data-rv` ("up", "left", "right", "scale" or "clip") is hidden by
 * this file on mount and played — on Framer Motion — the first time it comes
 * into view; `data-rv-i` staggers siblings. Nothing is hidden in the markup
 * itself, so with the bundle blocked or reduced motion on, the page renders
 * whole (the module's rule, see MotionRoot.tsx). Inline styles are stripped
 * once an arrival has played, so a card's hover lift is its own again.
 */
import { useEffect, useRef, type ReactNode } from 'react';
import { animate, inView, motionValue } from 'framer-motion';

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];
const FROM: Record<string, Record<string, unknown>> = {
  up: { opacity: 0, y: 56 },
  left: { opacity: 0, x: -64 },
  right: { opacity: 0, x: 64 },
  scale: { opacity: 0, scale: 0.9 },
  clip: { clipPath: 'inset(100% 0% 0% 0%)', scale: 1.08 },
};
const TO: Record<string, Record<string, unknown>> = {
  up: { opacity: 1, y: 0 },
  left: { opacity: 1, x: 0 },
  right: { opacity: 1, x: 0 },
  scale: { opacity: 1, scale: 1 },
  clip: { clipPath: 'inset(0% 0% 0% 0%)', scale: 1 },
};

export function reducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function useRevealEngine(root: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const host = root.current;
    if (!host || reducedMotion()) return;
    const stops: Array<() => void> = [];

    const els = Array.from(host.querySelectorAll<HTMLElement>('[data-rv]'));
    const vh = window.innerHeight || 800;
    els.forEach((el) => {
      const kind = el.dataset.rv || 'up';
      const from = FROM[kind] ?? FROM.up;
      const to = TO[kind] ?? TO.up;
      const r = el.getBoundingClientRect();
      /* Already painted well above the fold on a scrolled reload: left alone. */
      if (r.bottom < 0) return;
      el.style.transition = 'none';
      if ('opacity' in from) el.style.opacity = '0';
      if (kind === 'clip') el.style.clipPath = String(from.clipPath);
      const tx = (from as { x?: number }).x ?? 0;
      const ty = (from as { y?: number }).y ?? 0;
      const sc = (from as { scale?: number }).scale ?? 1;
      el.style.transform = `translate(${tx}px, ${ty}px) scale(${sc})`;
      el.style.willChange = 'transform, opacity';

      const delay = Number(el.dataset.rvI || 0) * 0.09;
      const play = () => {
        animate(el, to, { duration: kind === 'clip' ? 1.25 : 0.95, ease: EASE_OUT, delay }).then(() => {
          ['opacity', 'transform', 'clip-path', 'will-change', 'transition'].forEach((p) => el.style.removeProperty(p));
        });
      };
      const above = r.top < vh * 0.9;
      if (above) {
        const t = window.setTimeout(play, 60);
        stops.push(() => window.clearTimeout(t));
      } else {
        stops.push(inView(el, () => play(), { margin: '0px 0px -10% 0px' }));
      }
    });

    /* Figures roll up from zero to the number they already show. */
    host.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => {
      const target = Number(el.dataset.count);
      if (!Number.isFinite(target)) return;
      const final = el.textContent || '';
      const mv = motionValue(0);
      stops.push(
        inView(
          el,
          () => {
            const ctrl = animate(mv, target, { duration: 1.6, ease: EASE_OUT, delay: 0.15 });
            const unsub = mv.on('change', (v) => {
              el.textContent = String(Math.round(v));
            });
            ctrl.then(() => {
              unsub();
              el.textContent = final;
            });
          },
          { amount: 0.6 },
        ),
      );
    });

    return () => stops.forEach((fn) => fn());
  }, [root]);
}

/** While a full-bleed hero is under the module's fixed header, the header
    runs transparent with light type. It reads `data-re-on-video` on <html>,
    the hook the module's header already had. */
export function useHeaderOverHero(hero: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = hero.current;
    if (!el) return;
    const read = () => {
      const h = el.offsetHeight || window.innerHeight;
      document.documentElement.dataset.reOnVideo = window.scrollY < h - 120 ? 'true' : 'false';
    };
    read();
    window.dispatchEvent(new Event('scroll'));
    window.addEventListener('scroll', read, { passive: true });
    return () => {
      window.removeEventListener('scroll', read);
      delete document.documentElement.dataset.reOnVideo;
    };
  }, [hero]);
}

/** A card that leans toward the pointer and lifts. Individual transform
    properties only, so an arrival or a hover transform can share the element. */
export function useTilt<T extends HTMLElement>(max = 6) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion()) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const rx = motionValue(0);
    const ry = motionValue(0);
    const lift = motionValue(0);
    const paint = () => {
      const x = rx.get();
      const y = ry.get();
      const angle = Math.hypot(x, y);
      el.style.rotate = angle < 0.01 ? '' : `${x.toFixed(3)} ${y.toFixed(3)} 0 ${angle.toFixed(3)}deg`;
      const l = lift.get();
      el.style.scale = l < 0.002 ? '' : (1 + l * 0.02).toFixed(4);
      el.style.translate = l < 0.002 ? '' : `0 ${(-8 * l).toFixed(2)}px`;
    };
    const unsub = [rx.on('change', paint), ry.on('change', paint), lift.on('change', paint)];
    const spring = { type: 'spring', stiffness: 170, damping: 22, mass: 0.6 } as const;
    const settle = { type: 'spring', stiffness: 120, damping: 16, mass: 0.7 } as const;
    const move = (e: PointerEvent) => {
      if (el.style.opacity !== '' && el.style.opacity !== '1') return;
      const r = el.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width - 0.5;
      const ny = (e.clientY - r.top) / r.height - 0.5;
      animate(rx, -ny * max * 2, spring);
      animate(ry, nx * max * 2, spring);
      animate(lift, 1, spring);
    };
    const leave = () => {
      animate(rx, 0, settle);
      animate(ry, 0, settle);
      animate(lift, 0, settle);
    };
    const parent = el.parentElement;
    if (parent && !parent.style.perspective) parent.style.perspective = '1200px';
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);
    return () => {
      unsub.forEach((fn) => fn());
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', leave);
    };
  }, [max]);
  return ref;
}

export function SectionHead({
  eyebrow,
  title,
  lede,
  light,
  align = 'left',
  children,
}: {
  eyebrow: string;
  title: string;
  lede?: string;
  light?: boolean;
  align?: 'left' | 'center';
  children?: ReactNode;
}) {
  return (
    <div className={`re-l-head${light ? ' re-l-head--light' : ''}${align === 'center' ? ' re-l-head--center' : ''}`}>
      <span className="re-l-eyebrow" data-rv="up">
        {eyebrow}
      </span>
      <h2 className="re-l-h2" data-rv="up" data-rv-i="1">
        {title}
      </h2>
      {lede ? (
        <p className="re-l-lede" data-rv="up" data-rv-i="2">
          {lede}
        </p>
      ) : null}
      {children}
    </div>
  );
}

export function aed(n: number, opts: { compact?: boolean } = {}): string {
  if (opts.compact) {
    if (n >= 1_000_000) return `AED ${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 2).replace(/\.?0+$/, '')}M`;
    if (n >= 1_000) return `AED ${Math.round(n / 1_000)}K`;
  }
  return `AED ${Math.round(n).toLocaleString('en-US')}`;
}

/* ---- Icons ---------------------------------------------------------------- */
const I = ({ children, className }: { children: ReactNode; className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    {children}
  </svg>
);
export const IcBed = () => <I><path d="M3 11V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4" /><path d="M2 17v-4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4" /><path d="M2 20v-3M22 20v-3" /></I>;
export const IcBath = () => <I><path d="M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-3Z" /><path d="M6 12V6a2 2 0 0 1 2-2h1" /><path d="M8 20v1M16 20v1" /></I>;
export const IcArea = () => <I><path d="M4 4h6M4 4v6M20 20h-6M20 20v-6" /><path d="M4 4l16 16" /></I>;
export const IcPin = () => <I><path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21Z" /><circle cx="12" cy="9.5" r="2.5" /></I>;
export const IcArrow = () => <I><path d="M5 12h14M13 6l6 6-6 6" /></I>;
export const IcArrowUp = () => <I><path d="M7 17 17 7M9 7h8v8" /></I>;
export const IcCheck = () => <I><path d="m5 12 4 4L19 6" /></I>;
export const IcSearch = () => <I><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></I>;
export const IcPhone = () => <I><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" /></I>;
export const IcChat = () => <I><path d="M21 12a8 8 0 0 1-11.6 7.1L4 21l1.9-5.4A8 8 0 1 1 21 12Z" /></I>;
export const IcPlus = () => <I><path d="M12 5v14M5 12h14" /></I>;
export const IcMail = () => <I><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 7 8 6 8-6" /></I>;
export const IcClose = () => <I><path d="M6 6l12 12M18 6 6 18" /></I>;
export const IcStar = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" focusable="false">
    <path fill="currentColor" d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9Z" />
  </svg>
);
