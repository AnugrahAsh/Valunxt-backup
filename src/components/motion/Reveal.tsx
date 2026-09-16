'use client';

/**
 * THE TWO FRAMER MOTION PRIMITIVES the server-rendered sections use.
 *
 * `Reveal` arrives when it is scrolled to. `RevealItem` is a child of one and
 * arrives with it, in the order it sits in. Both render the tag and the class
 * they are given and NOTHING ELSE — no wrapper, no extra box — because every
 * section they go into is laid out by a stylesheet that counts its children.
 * Swapping `<div className="vxn-foot__top">` for
 * `<RevealItem className="vxn-foot__top">` changes the animation and not one
 * pixel of the layout.
 *
 * WHY THEY EXIST. Most of this site's sections are server components: they read
 * the services registry and resolve image paths through node:fs, so they cannot
 * become client components themselves. These two can, and a server component
 * may hand its children to a client component freely.
 *
 * ---------------------------------------------------------------------------
 * THE SAFETY RULE, the same one every motion layer here follows: the markup
 * the SERVER renders is the finished, visible page. Nothing is hidden until
 * this component has mounted in a browser and decided to play, so a blocked
 * bundle, a thrown error or reduced motion all leave the section whole.
 *
 * It also refuses to play over content that has been on screen for a while —
 * a slow dev compile, a back-navigation — for the same reason the site's other
 * engines do: hiding what the visitor is already reading, to then bring it
 * back, is a blink rather than an entrance.
 */

import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { motion, useInView, type Variants } from 'framer-motion';

import { DUR, EASE, prefersReducedMotion } from './motion-tokens';
import { freshPaint } from './reveal-scan';

/** The arrivals a section can ask for. They are the CSS engine's, in Framer's
    terms, so the two players move the same way. */
export type RevealVariant = 'rise' | 'rise-sm' | 'copy' | 'fade';

/* `out` is reached in no time at all, deliberately: it is not an animation but
   the hidden state being taken up, and on a fresh load the element taking it
   up may be one the visitor is already looking at. Only `in` moves. */
const SNAP = { duration: 0 };

const VARIANTS: Record<RevealVariant, Variants> = {
  /* A card or a picture, up from below. */
  rise: {
    out: { opacity: 0, y: 56, transition: SNAP },
    in: { opacity: 1, y: 0, transition: { duration: DUR.rise, ease: EASE.out } },
  },
  /* A button or a small row, a shorter trip. */
  'rise-sm': {
    out: { opacity: 0, y: 18, transition: SNAP },
    in: { opacity: 1, y: 0, transition: { duration: DUR.small, ease: EASE.out } },
  },
  /* Copy, out of a blur. */
  copy: {
    out: { opacity: 0, y: 14, filter: 'blur(10px)', transition: SNAP },
    in: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: DUR.copy, ease: EASE.out } },
  },
  /* Simply up from nothing. */
  fade: {
    out: { opacity: 0, transition: SNAP },
    in: { opacity: 1, transition: { duration: DUR.fade, ease: 'linear' } },
  },
};

/** The same arrival, held back by `d` seconds. */
function delayed(v: Variants, d: number): Variants {
  if (!d) return v;
  const to = v.in as { transition?: object };
  return { out: v.out!, in: { ...(v.in as object), transition: { ...(to.transition ?? {}), delay: d } } };
}

/* 'idle'  before the component has decided (and on the server)
   'play'  hidden, waiting to be scrolled to
   'done'  left exactly as the server rendered it */
type Mode = 'idle' | 'play' | 'done';

/* ---------------------------------------------------------------------------
   WHY THE STATE IS DRIVEN THROUGH `animate`, ON EVERY ELEMENT, AND NOT THROUGH
   `initial` AND FRAMER'S VARIANT PROPAGATION. Both of those are the obvious
   shape for this, and both were measured failing here.

   `initial` is read ONCE, when the motion component mounts, and these two
   mount before they know whether they should be playing at all — the decision
   needs a layout box and a paint timing, and neither exists until after the
   first render. By the time `initial` was being passed, Framer had long since
   stopped looking at it: the sections rendered visible and stayed visible.

   PROPAGATION — a parent with `animate="out"` carrying its `variants` children
   along — never reached the children either. Measured on the footer: the rows
   came out with no inline style of any kind while the panel around them was
   correctly at opacity 0, which is propagation not happening rather than
   happening wrongly. Rather than depend on why, each item asks for its own
   state: `Reveal` publishes the state and the beat through context, and every
   element carries its own `animate` and its own delay. Nothing is inherited,
   so nothing can fail to be.

   AN ITEM'S PLACE IN THE RUN IS PASSED BY HAND (`order`). Reveal used to count
   its RevealItem children itself, by comparing each child's type to
   RevealItem, and it never matched: the sections that use these are server
   components, and a child that crosses from the server arrives on the client
   as a reference to the component rather than as the function itself. Every
   row got place 0 and the footer's rows moved in lockstep. A number written
   next to each item cannot be lost that way.

   `armed` holds one committed render at `out` before `in` is allowed, so a
   section already on screen on a fresh load is SEEN to arrive rather than
   found to have arrived. It is a timer and not a frame on purpose: a
   background tab fires no frames at all, and a section must not be left
   waiting on one that never comes.

   THE RESCUE, the one every engine here carries in some form: if an arrival
   has not finished four seconds after the section came into view, it is taken
   as having failed and the section is shown. Nothing this file does is allowed
   to leave content hidden.
   --------------------------------------------------------------------------- */

interface Play {
  /** undefined while this Reveal is not playing at all. */
  state?: 'out' | 'in';
  /** Seconds between neighbouring items. */
  stagger: number;
  /** Seconds before the first item moves. */
  lead: number;
}

const PlayCtx = createContext<Play>({ stagger: 0, lead: 0 });

/** The elements these two can be. Kept to what the sections actually use, so
    the motion components are resolved once rather than through a proxy. */
const TAGS = {
  div: motion.div,
  section: motion.section,
  nav: motion.nav,
  ul: motion.ul,
  li: motion.li,
  p: motion.p,
  a: motion.a,
  span: motion.span,
  footer: motion.footer,
  h3: motion.h3,
  hr: motion.hr,
} as const;

export type RevealTag = keyof typeof TAGS;

interface Common {
  as?: RevealTag;
  className?: string;
  children?: ReactNode;
  /** Passed through to the anchor when `as` is "a". */
  href?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-hidden'?: boolean;
  id?: string;
}

/**
 * Decide, once, whether this instance plays at all. Runs after the first paint,
 * so what it measures is what the visitor is actually looking at.
 */
function usePlayMode(ref: React.RefObject<HTMLElement | null>): Mode {
  const [mode, setMode] = useState<Mode>('idle');
  useEffect(() => {
    if (prefersReducedMotion()) {
      setMode('done');
      return;
    }
    const r = ref.current?.getBoundingClientRect();
    const onScreen = !!r && r.top < (window.innerHeight || 0) * 0.9 && r.bottom > 0;
    /* Already on screen and painted a while ago: left as it stands. */
    setMode(onScreen && !freshPaint() ? 'done' : 'play');
  }, [ref]);
  return mode;
}

/**
 * A section, or a row of cards, that arrives when it is scrolled to.
 *
 * `stagger` turns it into a run: its RevealItem children arrive `stagger`
 * seconds apart, in the `order` each one is given. Left off, everything inside
 * arrives with it, as one movement — which is what the three cards under the
 * hero do.
 */
export default function Reveal({
  as = 'div',
  variant = 'rise',
  stagger = 0,
  delayChildren = 0,
  amount = 0.12,
  className,
  children,
  ...rest
}: Common & {
  variant?: RevealVariant;
  /** Seconds between neighbouring RevealItem children. 0 = all together. */
  stagger?: number;
  /** Seconds before the first child moves. */
  delayChildren?: number;
  /** How much of the element has to be in view before it plays. */
  amount?: number;
}) {
  const ref = useRef<HTMLElement>(null);
  const mode = usePlayMode(ref);
  const inView = useInView(ref, { once: true, amount, margin: '0px 0px -8% 0px' });
  const [armed, setArmed] = useState(false);
  const [rescued, setRescued] = useState(false);
  const Tag = TAGS[as];

  /* One committed render at `out` before `in` can be asked for. */
  useEffect(() => {
    if (mode !== 'play') return;
    const t = window.setTimeout(() => setArmed(true), 0);
    return () => window.clearTimeout(t);
  }, [mode]);

  /* The rescue. */
  useEffect(() => {
    if (mode !== 'play' || !inView) return;
    const t = window.setTimeout(() => setRescued(true), 4000);
    return () => window.clearTimeout(t);
  }, [mode, inView]);

  const state: Play['state'] = mode === 'play' ? ((armed && inView) || rescued ? 'in' : 'out') : undefined;
  const ctx = useMemo<Play>(() => ({ state, stagger, lead: delayChildren }), [state, stagger, delayChildren]);

  return (
    <PlayCtx.Provider value={ctx}>
      <Tag
        ref={ref as React.Ref<never>}
        className={className}
        {...(state ? { animate: state, variants: VARIANTS[variant] } : {})}
        {...rest}
      >
        {children}
      </Tag>
    </PlayCtx.Provider>
  );
}

/**
 * One member of a Reveal's run. Outside a playing Reveal it renders as the
 * plain element it names.
 */
export function RevealItem({
  as = 'div',
  variant = 'rise',
  order = 0,
  className,
  children,
  ...rest
}: Common & {
  variant?: RevealVariant;
  /** Its place in the run: 0 for the first item, 1 for the next. See AN
      ITEM'S PLACE IN THE RUN IS PASSED BY HAND. */
  order?: number;
}) {
  const { state, stagger, lead } = useContext(PlayCtx);
  const Tag = TAGS[as];
  const variants = useMemo(
    () => delayed(VARIANTS[variant], lead + order * stagger),
    [variant, lead, order, stagger],
  );
  return (
    <Tag className={className} {...(state ? { animate: state, variants } : {})} {...rest}>
      {children}
    </Tag>
  );
}
