'use client';

/**
 * A service page's hero, in the landing page's language: the page's own
 * photograph full-bleed with a slow drift, white type rising a word at a
 * time on the left, two actions and the page's three highlights on a
 * hairline. The header runs transparent while it is under it.
 */
import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';

import type { Stat } from '../../lib/types';
import { ArrowRight } from '../icons';
import { Words } from './Hero';
import { IcArrow, useHeaderOverHero } from './shared';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function PageHero({
  eyebrow,
  title,
  accent,
  lede,
  image,
  highlights,
}: {
  eyebrow: string;
  title: string;
  accent: string;
  lede: string;
  image: string;
  highlights: Stat[];
}) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  useHeaderOverHero(ref);

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const copyY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '16%']);

  return (
    <section className="re-l-hero re-l-hero--page" ref={ref} aria-label={eyebrow}>
      <motion.div className="re-l-hero__bg" style={reduce ? undefined : { y: bgY }}>
        <div className="re-l-hero__slide is-on">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt="" fetchPriority="high" />
        </div>
      </motion.div>
      <span className="re-l-hero__scrim" aria-hidden="true" />

      <div className="re-wrap re-l-hero__inner">
        <motion.div className="re-l-hero__copy" style={reduce ? undefined : { y: copyY, opacity: copyOpacity }}>
          <motion.span className="re-l-eyebrow re-l-eyebrow--ghost" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}>
            {eyebrow}
          </motion.span>
          <h1 className="re-l-hero__title">
            {mounted ? (
              <>
                <Words text={title} delay={0.2} />
                <br />
                <span className="re-l-hero__accent">
                  <Words text={accent} delay={0.45} />
                </span>
              </>
            ) : (
              <>
                {title}
                <br />
                <span className="re-l-hero__accent">{accent}</span>
              </>
            )}
          </h1>
          <motion.p className="re-l-hero__lede" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: EASE, delay: 0.65 }}>
            {lede}
          </motion.p>
          <motion.div className="re-l-hero__actions" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: EASE, delay: 0.8 }}>
            <a className="re-btn re-btn--light" href="#enquire">
              Speak to an Advisor
              <ArrowRight />
            </a>
            <a className="re-l-hero__go" href="#process">
              How it works
              <IcArrow />
            </a>
          </motion.div>
          <motion.ul className="re-l-hero__stats" initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1, delayChildren: 0.95 } } }}>
            {highlights.map((h) => (
              <motion.li key={h.label} variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: EASE }}>
                <strong>{h.value}</strong>
                <span>{h.label}</span>
                {h.detail ? <small>{h.detail}</small> : null}
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>
      </div>
    </section>
  );
}
