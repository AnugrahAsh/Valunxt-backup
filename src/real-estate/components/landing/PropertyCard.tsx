'use client';

/**
 * A property card that shows the property: a photo gallery you can swipe,
 * scrub with the pointer or step through with arrows, the status and type on
 * the photo, then the price, the title, the community, beds, baths and size
 * with icons, and the property's tags. "View details" opens the quick view;
 * "Enquire" names the property in the form.
 *
 * Only the cover is loaded until the visitor shows interest (hover, focus or
 * a swipe), so a grid of nine cards costs nine photos, not forty.
 */
import { useRef, useState } from 'react';
import { motion } from 'framer-motion';

import { IcArea, IcArrow, IcBath, IcBed, IcPin } from './shared';

export interface PropertyView {
  id: string;
  title: string;
  community: string;
  type: string;
  price: string;
  priceNote?: string;
  value?: number;
  beds: string;
  baths?: string;
  area: string;
  status: string;
  images: string[];
  tags: string[];
  summary?: string;
  features?: string[];
  facts?: { label: string; value: string }[];
}

/** Off-plan statuses name a quarter or a year. */
export const isOffPlan = (status: string) => /q\d|20\d\d/i.test(status);

export function IcCamera() {
  return (
    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M4 8h3l2-2.5h6L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z" />
      <circle cx="12" cy="13" r="3.5" />
    </svg>
  );
}

export default function PropertyCard({
  p,
  i = 0,
  onOpen,
  onEnquire,
}: {
  p: PropertyView;
  i?: number;
  onOpen: () => void;
  onEnquire: () => void;
}) {
  const [at, setAt] = useState(0);
  const [warm, setWarm] = useState(false);
  const swipe = useRef<{ x: number; id: number } | null>(null);
  const n = p.images.length;
  const go = (k: number) => {
    setWarm(true);
    setAt(((k % n) + n) % n);
  };

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse' || n < 2) return;
    const r = e.currentTarget.getBoundingClientRect();
    const k = Math.min(n - 1, Math.max(0, Math.floor(((e.clientX - r.left) / r.width) * n)));
    if (k !== at) setAt(k);
  };

  const fact = p.facts?.find((f) => /yield|handover/i.test(f.label));

  return (
    <motion.article
      layout
      className="re-l-pc"
      initial={{ opacity: 0, y: 36 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.25 } }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: Math.min(i, 8) * 0.06, layout: { type: 'spring', bounce: 0, duration: 0.6 } }}
    >
      <div
        className="re-l-pc__media"
        onPointerEnter={() => setWarm(true)}
        onPointerMove={onMove}
        onPointerLeave={(e) => e.pointerType === 'mouse' && setAt(0)}
        onPointerDown={(e) => {
          if (e.pointerType !== 'mouse') swipe.current = { x: e.clientX, id: e.pointerId };
        }}
        onPointerUp={(e) => {
          const s = swipe.current;
          swipe.current = null;
          if (!s || s.id !== e.pointerId) return;
          const dx = e.clientX - s.x;
          if (Math.abs(dx) > 40) go(at + (dx < 0 ? 1 : -1));
        }}
      >
        {p.images.map((src, k) =>
          warm || k === 0 ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={src} className={`re-l-pc__img${k === at ? ' is-on' : ''}`} src={src} alt={k === 0 ? `${p.title}, ${p.community}` : ''} loading="lazy" draggable={false} />
          ) : null,
        )}

        <button type="button" className="re-l-pc__open" onClick={onOpen} onFocus={() => setWarm(true)} aria-label={`View details: ${p.title}`} />

        <div className="re-l-pc__badges">
          <span className={`re-l-pc__badge${isOffPlan(p.status) ? ' is-op' : ''}`}>
            <i aria-hidden="true" />
            {p.status}
          </span>
          <span className="re-l-pc__badge re-l-pc__badge--type">{p.type}</span>
        </div>
        {n > 1 ? (
          <span className="re-l-pc__count">
            <IcCamera />
            {at + 1}/{n}
          </span>
        ) : null}

        {n > 1 ? (
          <>
            <button type="button" className="re-l-pc__nav re-l-pc__nav--prev" aria-label="Previous photo" onClick={() => go(at - 1)}>
              <IcArrow />
            </button>
            <button type="button" className="re-l-pc__nav re-l-pc__nav--next" aria-label="Next photo" onClick={() => go(at + 1)}>
              <IcArrow />
            </button>
            <span className="re-l-pc__dots" aria-hidden="true">
              {p.images.map((src, k) => (
                <span key={src} className={k === at ? 'is-on' : ''} />
              ))}
            </span>
          </>
        ) : null}
      </div>

      <div className="re-l-pc__body">
        <p className="re-l-pc__price">
          <strong>{p.price}</strong>
          {p.priceNote ? <span>{p.priceNote}</span> : null}
          {fact ? <em>{fact.label === 'Handover' ? `Handover ${fact.value}` : `${fact.value} ${fact.label.toLowerCase()}`}</em> : null}
        </p>
        <h3 className="re-l-pc__title">
          <button type="button" onClick={onOpen}>
            {p.title}
          </button>
        </h3>
        <p className="re-l-pc__loc">
          <IcPin />
          {p.community}
        </p>
        <ul className="re-l-pc__specs">
          <li>
            <IcBed />
            {p.beds}
          </li>
          {p.baths ? (
            <li>
              <IcBath />
              {p.baths}
            </li>
          ) : null}
          <li>
            <IcArea />
            {p.area}
          </li>
        </ul>
        {p.tags.length ? (
          <ul className="re-l-pc__tags">
            {p.tags.slice(0, 3).map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        ) : null}
        <div className="re-l-pc__foot">
          <button type="button" className="re-l-link" onClick={onOpen}>
            View details
            <IcArrow />
          </button>
          <button type="button" className="re-l-pc__enq" onClick={onEnquire}>
            Enquire
          </button>
        </div>
      </div>
    </motion.article>
  );
}
