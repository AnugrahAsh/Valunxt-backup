'use client';

/**
 * The philosophy, read by scrolling. The section pins and its three
 * sentences light up a word at a time as the page moves through it: what
 * the group does not do stays in ink, what it does instead lights in the
 * brand gradient. When the last word is lit, the three practices it names
 * are offered as links.
 */
import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from 'framer-motion';

const LINES: { text: string; yes: boolean }[] = [
  { text: 'We do not simply sell properties.', yes: false },
  { text: 'We help clients build wealth through real estate.', yes: true },
  { text: 'We do not simply publish reports.', yes: false },
  { text: 'We deliver investment intelligence.', yes: true },
  { text: 'We do not simply build software.', yes: false },
  { text: 'We create intelligent platforms that improve investment decisions.', yes: true },
];

function Word({ w, yes, i, n, p }: { w: string; yes: boolean; i: number; n: number; p: MotionValue<number> }) {
  const a = (i / n) * 0.82;
  const opacity = useTransform(p, [a, a + 0.05], [0.13, 1]);
  return (
    <>
      <motion.span className={`ab-mw${yes ? ' ab-mw--yes' : ''}`} style={{ opacity }}>
        {w}
      </motion.span>{' '}
    </>
  );
}

export default function Manifesto({ links }: { links: { label: string; href: string }[] }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const bar = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);
  const linksOpacity = useTransform(scrollYProgress, [0.84, 0.94], [0, 1]);
  const linksY = useTransform(scrollYProgress, [0.84, 0.94], [18, 0]);

  const words = LINES.flatMap((l) => l.text.split(' ').map((w) => ({ w, yes: l.yes })));
  const n = words.length;

  return (
    <section className={`ab-mani${reduce ? ' ab-mani--still' : ''}`} id="ab-manifesto" ref={ref} aria-labelledby="ab-mani-head" data-reveal="none">
      <div className="ab-mani__pin">
        <div className="ab-in">
          <p className="ab-pill" id="ab-mani-head">
            Our Philosophy
          </p>
          <p className="ab-mani__text">
            {reduce
              ? LINES.map((l) => (
                  <span key={l.text} className={`ab-mw${l.yes ? ' ab-mw--yes' : ''}`}>
                    {l.text}{' '}
                  </span>
                ))
              : words.map((x, i) => <Word key={i} w={x.w} yes={x.yes} i={i} n={n} p={scrollYProgress} />)}
          </p>
          <motion.div className="ab-mani__links" style={reduce ? undefined : { opacity: linksOpacity, y: linksY }}>
            {links.map((l) => (
              <a key={l.label} href={l.href}>
                {l.label}
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M7 17 17 7M9 7h8v8" />
                </svg>
              </a>
            ))}
          </motion.div>
        </div>
        <motion.span className="ab-mani__bar" style={reduce ? undefined : { width: bar }} aria-hidden="true" />
      </div>
    </section>
  );
}
