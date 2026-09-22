'use client';

/**
 * The six sectors as one explorer: the list on the left, the chosen sector
 * large on the right — its photograph, what drives value in it, what an
 * engagement typically involves and the related service. Hovering or
 * focusing a sector on a pointer device chooses it; a tap chooses it on
 * touch. On narrow screens the list becomes a row of chips over the panel.
 *
 * The panel cross-fades between sectors; with reduced motion it simply
 * swaps.
 */
import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

export interface Sector {
  n: string;
  title: string;
  desc: string;
  work: string[];
  href: string;
  img: string;
  alt: string;
}

function Tick() {
  return (
    <svg className="co-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12.5 2.6 2.6L16 9.6" />
    </svg>
  );
}

function Arrow({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export default function SectorExplorer({ sectors }: { sectors: (Sector & { link: string })[] }) {
  const [at, setAt] = useState(0);
  const reduce = useReducedMotion();
  const s = sectors[at] ?? sectors[0]!;
  const fine = () => typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  return (
    <div className="co-sx">
      <ol className="co-sx__list" role="tablist" aria-label="Sectors">
        {sectors.map((x, i) => (
          <li key={x.n}>
            <button
              type="button"
              role="tab"
              id={`co-sx-tab-${x.n}`}
              aria-selected={i === at}
              aria-controls="co-sx-panel"
              className={`co-sx__tab${i === at ? ' is-on' : ''}`}
              onClick={() => setAt(i)}
              onMouseEnter={() => fine() && setAt(i)}
              onFocus={() => setAt(i)}
            >
              <span className="co-sx__n">{x.n}</span>
              <span className="co-sx__t">{x.title}</span>
              <Arrow className="co-sx__arrow" />
            </button>
          </li>
        ))}
      </ol>

      <div className="co-sx__stage" id="co-sx-panel" role="tabpanel" aria-labelledby={`co-sx-tab-${s.n}`}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.article
            key={s.n}
            className="co-sx__panel"
            initial={reduce ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 1 } : { opacity: 0, y: -8 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="co-sx__shot">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.img} alt={s.alt} />
              <span className="co-sx__count">
                {s.n} / {String(sectors.length).padStart(2, '0')}
              </span>
            </span>
            <div className="co-sx__body">
              <div>
                <h3 className="co-sx__title">{s.title}</h3>
                <p className="co-sx__desc">{s.desc}</p>
              </div>
              <div>
                <p className="co-sx__label">What an engagement involves</p>
                <ul className="co-sx__work">
                  {s.work.map((w) => (
                    <li key={w}>
                      <Tick />
                      {w}
                    </li>
                  ))}
                </ul>
                <a className="co-sx__more" href={s.link}>
                  Related service
                  <Arrow />
                </a>
              </div>
            </div>
          </motion.article>
        </AnimatePresence>
      </div>
    </div>
  );
}
