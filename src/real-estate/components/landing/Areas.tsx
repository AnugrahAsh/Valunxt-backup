'use client';

/**
 * Ten Dubai communities: cards on the left, a live map on the right (Leaflet
 * over OpenStreetMap, the same stack as the Contact page's office map — no
 * API key). Hovering a card highlights its pin; selecting a pin opens the
 * card. The map is loaded with `next/dynamic(ssr: false)`, since Leaflet
 * reads `window` the moment it is imported.
 */
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import { AREAS, AREAS_HEAD } from '../../data/landing';
import { useSearch } from './LandingBody';
import { IcArrow, SectionHead } from './shared';

const AreasMap = dynamic(() => import('./AreasMap'), {
  ssr: false,
  loading: () => <div className="re-l-map re-l-map--loading" aria-hidden="true" />,
});

export default function Areas() {
  const [active, setActive] = useState<string>(AREAS[0]!.key);
  const [hover, setHover] = useState<string | null>(null);
  const { set, goToResults } = useSearch();
  const current = AREAS.find((a) => a.key === active) ?? AREAS[0]!;

  return (
    <section className="re-l-sec re-l-areas" id="areas">
      <div className="re-wrap">
        <SectionHead eyebrow={AREAS_HEAD.eyebrow} title={AREAS_HEAD.title} lede={AREAS_HEAD.lede} />

        <div className="re-l-areas__stage" data-rv="up" data-rv-i="3">
          <div className="re-l-areas__list" role="listbox" aria-label="Dubai areas">
            {AREAS.map((a, i) => {
              const on = a.key === active;
              return (
                <button
                  type="button"
                  key={a.key}
                  role="option"
                  aria-selected={on}
                  className={`re-l-area${on ? ' is-on' : ''}${hover === a.key ? ' is-hover' : ''}`}
                  onMouseEnter={() => setHover(a.key)}
                  onMouseLeave={() => setHover(null)}
                  onFocus={() => setHover(a.key)}
                  onBlur={() => setHover(null)}
                  onClick={() => setActive(a.key)}
                  style={{ ['--i' as string]: i }}
                >
                  <span className="re-l-area__n">{String(i + 1).padStart(2, '0')}</span>
                  <span className="re-l-area__name">{a.name}</span>
                  <span className="re-l-area__vibe">{a.vibe}</span>
                  <span className="re-l-area__yield">
                    ~{a.yieldPct}%<small>yield</small>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="re-l-areas__map">
            <AreasMap areas={AREAS} active={active} hover={hover} onSelect={setActive} />

            <AnimatePresence mode="wait">
              <motion.aside
                key={current.key}
                className="re-l-areas__detail"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <span className="re-l-eyebrow">{current.vibe}</span>
                <h3>{current.name}</h3>
                <p>{current.body}</p>
                <dl>
                  <div>
                    <dt>Price band</dt>
                    <dd>AED {current.psf.toLocaleString('en-US')} / sqft</dd>
                  </div>
                  <div>
                    <dt>Gross yield</dt>
                    <dd>~{current.yieldPct}%</dd>
                  </div>
                </dl>
                <ul className="re-l-areas__best">
                  {current.bestFor.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
                <button
                  type="button"
                  className="re-l-link"
                  onClick={() => {
                    set({ area: current.key });
                    goToResults();
                  }}
                >
                  See featured stock in {current.name}
                  <IcArrow />
                </button>
              </motion.aside>
            </AnimatePresence>
          </div>
        </div>

        <p className="re-l-note">{AREAS_HEAD.note}</p>
      </div>
    </section>
  );
}
