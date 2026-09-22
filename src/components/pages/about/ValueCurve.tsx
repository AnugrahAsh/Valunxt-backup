'use client';

/**
 * The purpose statement's figure: the market's noise against a disciplined
 * compounding line. Both draw themselves when the panel comes into view; a
 * light then keeps travelling up the disciplined line. Illustrative, so it
 * carries no axes or figures.
 */
import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const W = 560;
const H = 420;
const X0 = 24;
const X1 = 536;
const BASE = 388;

// The disciplined line: slow at first, compounding towards the end.
const CURVE = `M${X0} 360 C 170 352, 300 318, 392 246 S 500 98, ${X1} 74`;
const AREA = `${CURVE} L${X1} ${BASE} L${X0} ${BASE} Z`;

// The noise: a flatter trend with two interfering swings, deterministic so
// server and client agree.
const NOISE = (() => {
  const pts: string[] = [];
  for (let x = X0; x <= X1; x += 8) {
    const t = (x - X0) / (X1 - X0);
    const y = 352 - t * 118 + Math.sin(x * 0.085) * 20 + Math.sin(x * 0.23 + 1.3) * 9 + Math.sin(x * 0.041 + 0.6) * 14;
    pts.push(`${x.toFixed(0)} ${y.toFixed(1)}`);
  }
  return `M${pts.join(' L')}`;
})();

const EASE: [number, number, number, number] = [0.65, 0, 0.35, 1];

export default function ValueCurve() {
  const reduce = useReducedMotion();
  const [drawn, setDrawn] = useState(false);
  const draw = (delay: number, duration: number) =>
    reduce
      ? {}
      : {
          initial: { pathLength: 0 },
          whileInView: { pathLength: 1 },
          viewport: { once: true, amount: 0.45 },
          transition: { duration, ease: EASE, delay },
        };
  const fade = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0 },
          whileInView: { opacity: 1 },
          viewport: { once: true, amount: 0.45 },
          transition: { duration: 0.9, ease: 'easeOut' as const, delay },
        };

  return (
    <figure className="ab-vc" aria-hidden="true">
      <figcaption className="ab-vc__head">
        <span className="ab-vc__k">Long term value</span>
        <span className="ab-vc__legend">
          <i className="ab-vc__sw ab-vc__sw--noise" />
          Market noise
          <i className="ab-vc__sw" />
          Disciplined strategy
        </span>
      </figcaption>
      <div className="ab-vc__plot">
        <svg viewBox={`0 0 ${W} ${H}`}>
          <defs>
            <linearGradient id="ab-vc-stroke" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#1436D8" />
              <stop offset=".55" stopColor="#4B53F2" />
              <stop offset="1" stopColor="#9C00DD" />
            </linearGradient>
            <linearGradient id="ab-vc-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#4B53F2" stopOpacity=".2" />
              <stop offset="1" stopColor="#4B53F2" stopOpacity="0" />
            </linearGradient>
            <pattern id="ab-vc-dots" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="1.5" cy="1.5" r="1.2" fill="rgba(14,53,95,.13)" />
            </pattern>
          </defs>
          <rect x="0" y="0" width={W} height={H} fill="url(#ab-vc-dots)" />
          {[120, 200, 280].map((y) => (
            <line key={y} x1={X0} x2={X1} y1={y} y2={y} stroke="rgba(14,53,95,.07)" strokeDasharray="3 6" />
          ))}
          <line x1={X0} x2={X1} y1={BASE} y2={BASE} stroke="rgba(14,53,95,.22)" />
          <motion.path d={AREA} fill="url(#ab-vc-fill)" {...fade(2.1)} />
          <motion.path d={NOISE} fill="none" stroke="rgba(14,53,95,.34)" strokeWidth="1.6" strokeLinejoin="round" {...draw(0, 1.8)} />
          <motion.path d={CURVE} fill="none" stroke="url(#ab-vc-stroke)" strokeWidth="3.4" strokeLinecap="round" {...draw(0.35, 2.1)} onAnimationComplete={() => setDrawn(true)} />
          {drawn && !reduce ? <path className="ab-vc__run" d={CURVE} pathLength={1} fill="none" stroke="rgba(255,255,255,.9)" strokeWidth="2.2" strokeLinecap="round" /> : null}
        </svg>
        <motion.span className="ab-vc__dot" style={{ left: `${(X1 / W) * 100}%`, top: `${(74 / H) * 100}%` }} {...fade(2.2)} />
        <motion.span className="ab-vc__tag" style={{ left: `${(X1 / W) * 100}%`, top: `${(74 / H) * 100}%` }} {...fade(2.35)}>
          Compounding
        </motion.span>
      </div>
    </figure>
  );
}
