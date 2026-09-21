'use client';

/**
 * Questions, one open at a time; the answer's height animates with
 * AnimatePresence rather than snapping. Used by the landing page (its own
 * set) and every service page (that page's set).
 */
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import { FAQS, FAQ_HEAD } from '../../data/landing';
import { IcArrow, IcPlus, SectionHead } from './shared';

export default function Faq({
  items = FAQS,
  eyebrow = FAQ_HEAD.eyebrow,
  title = FAQ_HEAD.title,
}: {
  items?: { q: string; a: string }[];
  eyebrow?: string;
  title?: string;
}) {
  const [open, setOpen] = useState(0);
  return (
    <section className="re-l-sec re-l-faq" id="faq">
      <div className="re-wrap re-l-faq__grid">
        <div>
          <SectionHead eyebrow={eyebrow} title={title} />
          <a className="re-l-link" href="#enquire" data-rv="up" data-rv-i="3">
            Ask something else
            <IcArrow />
          </a>
        </div>
        <ul className="re-l-faq__list">
          {items.map((f, i) => {
            const on = open === i;
            return (
              <li className={`re-l-faq__item${on ? ' is-on' : ''}`} key={f.q} data-rv="up" data-rv-i={i}>
                <button type="button" className="re-l-faq__q" aria-expanded={on} onClick={() => setOpen(on ? -1 : i)}>
                  <span>{f.q}</span>
                  <motion.i animate={{ rotate: on ? 45 : 0 }} transition={{ duration: 0.3 }}>
                    <IcPlus />
                  </motion.i>
                </button>
                <AnimatePresence initial={false}>
                  {on ? (
                    <motion.div
                      className="re-l-faq__a"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <p>{f.a}</p>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
