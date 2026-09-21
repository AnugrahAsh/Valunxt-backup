'use client';

/**
 * A day in Dubai, as a horizontal strip the page scrolls through: the section
 * pins for the length of the strip and the panels slide past with the scroll
 * (Framer Motion's useScroll → translateX). The distance is measured, not
 * guessed — the track's overflow beyond the viewport — so the last panel lands
 * flush at every width. Photograph panels alternate with the group's live
 * abstracts. On phones the strip is a plain horizontal scroller with snap
 * points, which is what a strip should be on a phone.
 */
import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from 'framer-motion';

import { LIFESTYLE, LIFESTYLE_HEAD } from '../../data/landing';
import LiveAbstract from './LiveAbstract';
import { SectionHead } from './shared';

export default function Lifestyle() {
  const ref = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [dist, setDist] = useState(0);

  useEffect(() => {
    const t = track.current;
    if (!t) return;
    const measure = () => {
      const wide = window.innerWidth >= 820;
      setDist(wide ? Math.max(0, t.scrollWidth - window.innerWidth) : 0);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(t);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const x = useTransform(scrollYProgress, [0, 1], [0, -dist]);
  const bar = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);
  const still = reduce || dist === 0;

  return (
    <section className="re-l-life" ref={ref} id="lifestyle">
      <div className="re-l-life__pin">
        <div className="re-wrap re-l-life__top">
          <SectionHead eyebrow={LIFESTYLE_HEAD.eyebrow} title={LIFESTYLE_HEAD.title} />
          <div className="re-l-life__bar" aria-hidden="true">
            <motion.span style={still ? undefined : { width: bar }} />
          </div>
        </div>
        <motion.div className="re-l-life__track" ref={track} style={still ? undefined : { x }}>
          {LIFESTYLE.map((p, i) => (
            <Panel p={p} i={i} key={p.title} progress={scrollYProgress} still={still} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function Panel({ p, i, progress, still }: { p: (typeof LIFESTYLE)[number]; i: number; progress: MotionValue<number>; still: boolean }) {
  const drift = useTransform(progress, [0, 1], ['-7%', '7%']);
  return (
    <article className={`re-l-life__panel${p.variant ? ' re-l-life__panel--live' : ''}`} data-rv="up" data-rv-i={i}>
      {p.variant ? (
        <LiveAbstract variant={p.variant} className="re-l-life__shot" />
      ) : (
        <motion.div className="re-l-life__shot" style={still ? undefined : { x: drift }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={p.image} alt="" loading="lazy" />
        </motion.div>
      )}
      <div className="re-l-life__copy">
        <span className="re-l-life__time">{p.eyebrow}</span>
        <h3>{p.title}</h3>
        <p>{p.body}</p>
      </div>
    </article>
  );
}
