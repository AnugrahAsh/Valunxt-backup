'use client';

/**
 * The hero sells the lifestyle: a reel of Dubai scenes behind the headline,
 * one at a time, cross-faded with a slow drift (a CSS animation restarted
 * per scene), white type on the left, and the search bar sitting on the
 * hero's bottom edge the way the home page's practice tabs do. The copy
 * sinks and fades as the page leaves; the reel pauses while the tab is
 * hidden and under reduced motion.
 *
 * While the hero fills the screen the module's header runs transparent with
 * light type — it reads `data-re-on-video` on <html>, the hook the module's
 * header already had, so nothing in Header.tsx had to change.
 */
import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';

import { AREAS, HERO, SEARCH } from '../../data/landing';
import { ArrowRight } from '../icons';
import { useSearch } from './LandingBody';
import { IcArrow, useHeaderOverHero } from './shared';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function Words({ text, delay = 0 }: { text: string; delay?: number }) {
  return (
    <>
      {text.split(' ').map((w, i) => (
        <span key={i}>
          <span className="re-l-w">
            <motion.span className="re-l-w__i" initial={{ y: '115%' }} animate={{ y: '0%' }} transition={{ duration: 1, ease: EASE, delay: delay + i * 0.06 }}>
              {w}
            </motion.span>
          </span>{' '}
        </span>
      ))}
    </>
  );
}

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { search, set, results, goToResults, enquire } = useSearch();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const copyY = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '18%']);

  useHeaderOverHero(ref);

  /* The reel. */
  const [slide, setSlide] = useState(0);
  useEffect(() => {
    if (reduce) return;
    const n = HERO.slides.length;
    let t = 0;
    const arm = () => {
      window.clearInterval(t);
      t = window.setInterval(() => {
        if (!document.hidden) setSlide((i) => (i + 1) % n);
      }, 6500);
    };
    arm();
    return () => window.clearInterval(t);
  }, [reduce, slide]);

  const budgets = SEARCH.budgets[search.mode];

  return (
    <>
      <section className="re-l-hero" ref={ref} aria-label="Dubai real estate">
        <motion.div className="re-l-hero__bg" style={reduce ? undefined : { y: bgY }}>
          {HERO.slides.map((s, i) => (
            <div className={`re-l-hero__slide${i === slide ? ' is-on' : ''}`} key={s.image} aria-hidden={i === slide ? undefined : 'true'}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.image} alt={i === 0 ? HERO.imageAlt : ''} {...(i === 0 ? { fetchPriority: 'high' as const } : {})} />
            </div>
          ))}
        </motion.div>
        <span className="re-l-hero__scrim" aria-hidden="true" />

        <div className="re-l-hero__reel" aria-label="Scenes">
          <span className="re-l-hero__caption" key={slide}>
            {HERO.slides[slide]?.caption}
          </span>
          <span className="re-l-hero__dots" role="tablist">
            {HERO.slides.map((s, i) => (
              <button type="button" key={s.image} role="tab" aria-selected={i === slide} aria-label={s.caption} className={i === slide ? 'is-on' : ''} onClick={() => setSlide(i)} />
            ))}
          </span>
        </div>

        <div className="re-wrap re-l-hero__inner">
          <motion.div className="re-l-hero__copy" style={reduce ? undefined : { y: copyY, opacity: copyOpacity }}>
            <motion.span className="re-l-eyebrow re-l-eyebrow--ghost" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}>
              {HERO.eyebrow}
            </motion.span>
            <h1 className="re-l-hero__title">
              {mounted ? (
                <>
                  <Words text={HERO.titleA} delay={0.2} />
                  <br />
                  <span className="re-l-hero__accent">
                    <Words text={HERO.titleB} delay={0.5} />
                  </span>
                </>
              ) : (
                <>
                  {HERO.titleA}
                  <br />
                  <span className="re-l-hero__accent">{HERO.titleB}</span>
                </>
              )}
            </h1>
            <motion.p className="re-l-hero__lede" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: EASE, delay: 0.7 }}>
              {HERO.lede}
            </motion.p>
            <motion.div className="re-l-hero__actions" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: EASE, delay: 0.85 }}>
              <a className="re-btn re-btn--light" href="#listings">
                Explore Properties
                <ArrowRight />
              </a>
              <button type="button" className="re-l-hero__go" onClick={() => enquire()}>
                Talk to the Dubai desk
                <IcArrow />
              </button>
            </motion.div>
            <motion.ul className="re-l-hero__stats" initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1, delayChildren: 1 } } }} aria-label="Why Dubai">
              {HERO.stats.map((s) => (
                <motion.li key={s.label} variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: EASE }}>
                  <strong>{s.value}</strong>
                  <span>{s.label}</span>
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>
        </div>
      </section>

      <div className="re-wrap re-l-searchbar">
        <motion.form
          className="re-l-search"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: EASE, delay: 1.05 }}
          role="search"
          aria-label="Search featured properties"
          onSubmit={(e) => {
            e.preventDefault();
            goToResults();
          }}
        >
          <div className="re-l-search__modes" role="tablist" aria-label="I want to">
            {SEARCH.modes.map((m) => (
              <button type="button" key={m.key} role="tab" aria-selected={search.mode === m.key} className={`re-l-search__mode${search.mode === m.key ? ' is-on' : ''}`} onClick={() => set({ mode: m.key })}>
                {search.mode === m.key ? <motion.span layoutId="re-l-mode-pill" className="re-l-search__pill" transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }} /> : null}
                <span className="re-l-search__lbl">{m.label}</span>
              </button>
            ))}
          </div>
          <label className="re-l-search__field">
            <span>Area</span>
            <select value={search.area} onChange={(e) => set({ area: e.target.value })}>
              <option value="any">All of Dubai</option>
              {AREAS.map((a) => (
                <option key={a.key} value={a.key}>
                  {a.name}
                </option>
              ))}
            </select>
          </label>
          <label className="re-l-search__field">
            <span>Type</span>
            <select value={search.type} onChange={(e) => set({ type: e.target.value })}>
              {SEARCH.types.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
          <label className="re-l-search__field">
            <span>Bedrooms</span>
            <select value={search.beds} onChange={(e) => set({ beds: e.target.value })}>
              {SEARCH.beds.map((b) => (
                <option key={b}>{b}</option>
              ))}
            </select>
          </label>
          <label className="re-l-search__field">
            <span>Budget</span>
            <select value={search.budget} onChange={(e) => set({ budget: Number(e.target.value) })}>
              {budgets.map((b, i) => (
                <option key={b.label} value={i}>
                  {b.label}
                </option>
              ))}
            </select>
          </label>
          <button type="submit" className="re-btn re-l-search__go">
            Search
            <em>{results.length}</em>
          </button>
        </motion.form>
      </div>
    </>
  );
}
