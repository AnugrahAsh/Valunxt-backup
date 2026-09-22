'use client';

/**
 * The group's practices, as a strip the page scrolls sideways through. The
 * section pins for the length of the strip and the cards travel past with the
 * scroll; the distance is measured, so the last card lands flush at any
 * width. On phones it is a swipeable row instead.
 */
import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';

export interface PracticeCard {
  name: string;
  desc: string;
  href: string;
  img: string;
}

export default function Practices({ title, items }: { title: string; items: PracticeCard[] }) {
  const ref = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [dist, setDist] = useState(0);

  useEffect(() => {
    const t = track.current;
    if (!t) return;
    const measure = () => setDist(window.innerWidth >= 900 ? Math.max(0, t.scrollWidth - window.innerWidth) : 0);
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
  const pinned = !reduce && dist > 0;

  return (
    <section className={`ab-prac${pinned ? ' is-pinned' : ''}`} ref={ref} style={pinned ? { height: `calc(100vh + ${dist}px)` } : undefined} aria-labelledby="ab-prac-head" data-reveal="none">
      <div className="ab-prac__pin">
        <div className="ab-in ab-prac__head">
          <div>
            <p className="ab-pill ab-pill--dark">What We Do</p>
            <h2 className="ab-h2 ab-prac__h" id="ab-prac-head">
              {title}
              <em>Under One Roof.</em>
            </h2>
          </div>
          <div className="ab-prac__bar" aria-hidden="true">
            <motion.span style={pinned ? { width: bar } : undefined} />
          </div>
        </div>
        <motion.div className="ab-prac__track" ref={track} style={pinned ? { x } : undefined}>
          {items.map((p, i) => (
            <a className="ab-pc" href={p.href} key={p.href}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.img} alt="" loading="lazy" />
              <span className="ab-pc__n">{String(i + 1).padStart(2, '0')}</span>
              <span className="ab-pc__t">{p.name}</span>
              <span className="ab-pc__d" dangerouslySetInnerHTML={{ __html: p.desc }} />
              <span className="ab-pc__go">
                Explore practice
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </span>
            </a>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
