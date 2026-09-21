'use client';

/**
 * The quick view: one property, large. A full gallery with arrows,
 * thumbnails, swipe and the keyboard's arrow keys on the left; the price,
 * the facts, the description and what the property has on the right, with
 * the ways to act on it — the enquiry form, WhatsApp with the property
 * named, or a call.
 *
 * Esc or the backdrop closes it, focus goes to the close button on open and
 * back to where it was on close, and the page behind stops scrolling (the
 * site's smooth scroller stands down while <html> is overflow-locked).
 */
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import { BRAND } from '../../data/site';
import { IcCamera, isOffPlan, type PropertyView } from './PropertyCard';
import { IcArea, IcArrow, IcBath, IcBed, IcChat, IcCheck, IcClose, IcPhone, IcPin } from './shared';

export default function PropertyModal({ p, onClose, onEnquire, note }: { p: PropertyView | null; onClose: () => void; onEnquire: (p: PropertyView) => void; note?: string }) {
  return <AnimatePresence>{p ? <Dialog key={p.id} p={p} onClose={onClose} onEnquire={onEnquire} note={note} /> : null}</AnimatePresence>;
}

function Dialog({ p, onClose, onEnquire, note }: { p: PropertyView; onClose: () => void; onEnquire: (p: PropertyView) => void; note?: string }) {
  const [at, setAt] = useState(0);
  const [dir, setDir] = useState(1);
  const closeRef = useRef<HTMLButtonElement>(null);
  const swipe = useRef<{ x: number; id: number } | null>(null);
  const n = p.images.length;
  const go = (k: number) => {
    setDir(k > at ? 1 : -1);
    setAt(((k % n) + n) % n);
  };

  useEffect(() => {
    const back = document.activeElement as HTMLElement | null;
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = 'hidden';
    closeRef.current?.focus();
    return () => {
      html.style.overflow = prev;
      /* Without preventScroll, focusing the card again would scroll the page
         back to it, fighting the trip to the form after "Enquire". */
      back?.focus?.({ preventScroll: true });
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') go(at + 1);
      else if (e.key === 'ArrowLeft') go(at - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const wa = BRAND.phoneHref.replace(/[^\d]/g, '');
  const waText = encodeURIComponent(`Hello, I am interested in ${p.title}, ${p.community} (ref ${p.id}).`);
  const specs = [
    { icon: <IcBed />, label: 'Bedrooms', value: p.beds },
    p.baths ? { icon: <IcBath />, label: 'Bathrooms', value: p.baths } : null,
    { icon: <IcArea />, label: 'Size', value: p.area },
    { icon: <IcPin />, label: 'Type', value: p.type },
  ].filter(Boolean) as { icon: React.ReactNode; label: string; value: string }[];

  return (
    <motion.div className="re-l-qv" role="dialog" aria-modal="true" aria-label={p.title} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
      <div className="re-l-qv__backdrop" onClick={onClose} />
      <motion.div
        className="re-l-qv__panel"
        data-lenis-prevent
        initial={{ opacity: 0, y: 40, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.98 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <button type="button" className="re-l-qv__close" ref={closeRef} onClick={onClose} aria-label="Close">
          <IcClose />
        </button>

        <div className="re-l-qv__gallery">
          <div
            className="re-l-qv__stage"
            onPointerDown={(e) => {
              swipe.current = { x: e.clientX, id: e.pointerId };
            }}
            onPointerUp={(e) => {
              const s = swipe.current;
              swipe.current = null;
              if (!s || s.id !== e.pointerId) return;
              const dx = e.clientX - s.x;
              if (Math.abs(dx) > 40) go(at + (dx < 0 ? 1 : -1));
            }}
          >
            <AnimatePresence initial={false} custom={dir}>
              <motion.img
                key={p.images[at]}
                src={p.images[at]}
                alt={`${p.title}, photo ${at + 1} of ${n}`}
                draggable={false}
                custom={dir}
                initial={{ opacity: 0, x: dir * 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: dir * -40 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              />
            </AnimatePresence>
            {n > 1 ? (
              <>
                <button type="button" className="re-l-qv__nav re-l-qv__nav--prev" aria-label="Previous photo" onClick={() => go(at - 1)}>
                  <IcArrow />
                </button>
                <button type="button" className="re-l-qv__nav re-l-qv__nav--next" aria-label="Next photo" onClick={() => go(at + 1)}>
                  <IcArrow />
                </button>
              </>
            ) : null}
            <span className="re-l-qv__count">
              <IcCamera />
              {at + 1} / {n}
            </span>
          </div>
          {n > 1 ? (
            <div className="re-l-qv__thumbs" role="tablist" aria-label="Photos">
              {p.images.map((src, k) => (
                <button type="button" key={src} role="tab" aria-selected={k === at} className={k === at ? 'is-on' : ''} onClick={() => go(k)}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" loading="lazy" />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="re-l-qv__info">
          <div className="re-l-qv__badges">
            <span className={`re-l-pc__badge${isOffPlan(p.status) ? ' is-op' : ''}`}>
              <i aria-hidden="true" />
              {p.status}
            </span>
            <span className="re-l-qv__ref">Ref {p.id}</span>
          </div>
          <p className="re-l-qv__price">
            <strong>{p.price}</strong>
            {p.priceNote ? <span>{p.priceNote}</span> : null}
          </p>
          <h2 className="re-l-qv__title">{p.title}</h2>
          <p className="re-l-pc__loc">
            <IcPin />
            {p.community}
          </p>

          <dl className="re-l-qv__specs">
            {specs.map((s) => (
              <div key={s.label}>
                <dt>{s.label}</dt>
                <dd>
                  {s.icon}
                  {s.value}
                </dd>
              </div>
            ))}
          </dl>

          {p.summary ? <p className="re-l-qv__summary">{p.summary}</p> : null}

          {p.features?.length ? (
            <ul className="re-l-qv__features">
              {p.features.map((f) => (
                <li key={f}>
                  <IcCheck />
                  {f}
                </li>
              ))}
            </ul>
          ) : null}

          {p.facts?.length ? (
            <dl className="re-l-qv__facts">
              {p.facts.map((f) => (
                <div key={f.label}>
                  <dt>{f.label}</dt>
                  <dd>{f.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}

          <div className="re-l-qv__actions">
            <button type="button" className="re-btn re-l-qv__primary" onClick={() => onEnquire(p)}>
              Enquire about this property
              <IcArrow />
            </button>
            <div>
              <a className="re-l-qv__alt" href={`https://wa.me/${wa}?text=${waText}`} target="_blank" rel="noopener">
                <IcChat />
                WhatsApp
              </a>
              <a className="re-l-qv__alt" href={BRAND.phoneHref}>
                <IcPhone />
                Call
              </a>
            </div>
          </div>
          <p className="re-l-qv__note">{note ?? 'Indicative listing. Availability and price are confirmed on enquiry.'}</p>
        </div>
      </motion.div>
    </motion.div>
  );
}
