'use client';

/**
 * Why Valunxt, as three large rows. Hovering a row fills it, lights its
 * title and carries a photograph along with the pointer — a card that
 * follows on a spring and swaps as the pointer moves between rows. Touch
 * screens get the rows without the card.
 */
import { useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionValue, useSpring } from 'framer-motion';

export interface WhyRow {
  t: string;
  d: string;
  img: string;
}

export default function WhyRows({ rows }: { rows: WhyRow[] }) {
  const box = useRef<HTMLDivElement>(null);
  const [at, setAt] = useState<number | null>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 220, damping: 26, mass: 0.6 });
  const y = useSpring(my, { stiffness: 220, damping: 26, mass: 0.6 });

  const move = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    const r = box.current?.getBoundingClientRect();
    if (!r) return;
    mx.set(e.clientX - r.left - 150);
    my.set(e.clientY - r.top - 105);
  };

  return (
    <div className="ab-rows" ref={box} onPointerMove={move} onPointerLeave={() => setAt(null)}>
      {rows.map((r, i) => (
        <article className={`ab-row${at === i ? ' is-on' : ''}`} key={r.t} data-ab="up" data-ab-i={i} onPointerEnter={(e) => e.pointerType === 'mouse' && setAt(i)}>
          <span className="ab-row__n">{String(i + 1).padStart(2, '0')}</span>
          <h3 className="ab-row__t">{r.t}</h3>
          <p className="ab-row__d">{r.d}</p>
          <span className="ab-row__arrow" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 17 17 7M9 7h8v8" />
            </svg>
          </span>
        </article>
      ))}
      <motion.div className="ab-float" style={{ x, y }} aria-hidden="true">
        <AnimatePresence>
          {at !== null ? (
            <motion.div
              key={at}
              className="ab-float__card"
              initial={{ opacity: 0, scale: 0.85, rotate: -4 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={rows[at]!.img} alt="" />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
