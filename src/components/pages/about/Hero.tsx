'use client';

/**
 * The about page's opening: the living "x" (XField) behind a statement set
 * large, rising a word at a time, and the group in four figures on a glass
 * strip along the foot. The copy drifts up and fades as the page leaves.
 */
import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';

const XField = dynamic(() => import('./XField'), { ssr: false });

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

function Words({ text, delay, className }: { text: string; delay: number; className?: string }) {
  return (
    <>
      {text.split(' ').map((w, i) => (
        <span key={i}>
          <span className="ab-w">
            <motion.span className={className} initial={{ y: '112%' }} animate={{ y: '0%' }} transition={{ duration: 1.05, ease: EASE, delay: delay + i * 0.07 }}>
              {w}
            </motion.span>
          </span>{' '}
        </span>
      ))}
    </>
  );
}

export interface Fact {
  n: number;
  label: string;
  note: string;
}

export default function AboutHero({ homeHref, facts }: { homeHref: string; facts: Fact[] }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [live, setLive] = useState(false);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setMounted(true);
    try {
      const c = document.createElement('canvas');
      setLive(!!(c.getContext('webgl2') || c.getContext('webgl')));
    } catch {
      setLive(false);
    }
  }, []);

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [0, -90]);
  const o = useTransform(scrollYProgress, [0, 0.65], [1, 0]);

  return (
    <section className="ab-hero" ref={ref} aria-labelledby="ab-hero-head" data-reveal="none">
      {live ? (
        <div className={`ab-hero__canvas${ready ? ' is-ready' : ''}`}>
          <XField onReady={() => setReady(true)} />
        </div>
      ) : null}
      <div className="ab-hero__scrim" aria-hidden="true" />

      <motion.div className="ab-in ab-hero__inner" style={reduce ? undefined : { y, opacity: o }}>
        <nav className="ab-crumb" aria-label="Breadcrumb">
          <a href={homeHref}>Home</a>
          <span aria-hidden="true">/</span>
          <span aria-current="page">About</span>
        </nav>
        <motion.p className="ab-pill ab-pill--dark" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}>
          Who We Are
        </motion.p>
        <h1 className="ab-hero__title" id="ab-hero-head">
          {mounted ? (
            <>
              <Words text="Intelligence Behind" delay={0.2} />
              <br />
              <Words text="Every Investment Decision." delay={0.45} className="ab-hl" />
            </>
          ) : (
            <>
              Intelligence Behind
              <br />
              <span className="ab-hl">Every Investment Decision.</span>
            </>
          )}
        </h1>
        <motion.p className="ab-hero__lede" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: EASE, delay: 0.85 }}>
          A premium real estate wealth, capital, intelligence, and technology group helping clients create long term value through strategic advisory.
        </motion.p>
        <motion.a className="ab-hero__cue" href="#ab-manifesto" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.9, delay: 1.2 }}>
          <i aria-hidden="true" />
          Scroll to explore
        </motion.a>
      </motion.div>

      <div className="ab-facts">
        <ul className="ab-in">
          {facts.map((f, i) => (
            <motion.li key={f.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EASE, delay: 1 + i * 0.09 }}>
              <strong data-count={f.n}>{String(f.n).padStart(2, '0')}</strong>
              <span>
                <b>{f.label}</b>
                {f.note}
              </span>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
