'use client';

/**
 * Who we are, in pictures: a tall photograph and an inset one that travel at
 * different speeds as the section scrolls past, with a glass note floating
 * between them. Depth without a single hover.
 */
import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';

export default function Collage({ main, inset, note, noteLabel }: { main: string; inset: string; note: string; noteLabel: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const a = useTransform(scrollYProgress, [0, 1], [40, -40]);
  const b = useTransform(scrollYProgress, [0, 1], [110, -110]);
  const c = useTransform(scrollYProgress, [0, 1], [70, -50]);

  return (
    <div className="ab-col" ref={ref} aria-hidden="true">
      <motion.div className="ab-col__main" style={reduce ? undefined : { y: a }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={main} alt="" loading="lazy" />
      </motion.div>
      <motion.div className="ab-col__inset" style={reduce ? undefined : { y: b }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={inset} alt="" loading="lazy" />
      </motion.div>
      <motion.p className="ab-col__note" style={reduce ? undefined : { y: c }}>
        <small>{noteLabel}</small>
        {note}
      </motion.p>
    </div>
  );
}
