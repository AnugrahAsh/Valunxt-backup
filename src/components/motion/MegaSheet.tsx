'use client';

/**
 * THE MEGA SHEET'S OPEN AND CLOSE, on Framer Motion (20260917).
 *
 * Shared by every panel in the header — Services and Insights
 * (layout/UaeServicesMega.tsx) and About (layout/AboutMega.tsx) — because all
 * three are the same sheet: one `.vxn-umega__panel`, one stylesheet, one ✕.
 *
 * WHAT WAS WRONG. The sheet opened on a 200ms fade with a 10px drop, and
 * everything inside it was simply there the moment the box was. At that length
 * the eye reads an appearance rather than an opening, and a sheet this large
 * appearing whole is what feels abrupt, not the fade itself.
 *
 * WHAT IT DOES NOW. The box takes 450ms on an ease-in-out, and its contents
 * follow it in: the blue column in from the left, then the tab row, then the
 * pane, and inside those the tabs and the links one after another. Changing tab
 * replays the pane's run, so the new group's links arrive rather than cutting.
 * About's figure counts up as its sheet opens. Closing is 300ms and everything
 * leaves together — a dismissal should feel answered, not narrated.
 *
 * ---------------------------------------------------------------------------
 * HOW IT SITS WITH THE STYLESHEET, which still owns the sheet before this
 * bundle has run and whenever reduced motion is asked for.
 *
 * valunxt-uae-mega.css opens the panel on `li:hover` and `li:focus-within`, so
 * the menu works with no JavaScript at all. Once `live` is set, this takes the
 * same two signals as React state and writes opacity, transform, visibility and
 * pointer-events inline, which beat the stylesheet's rules — none of them is
 * `!important` — so there is no fight and no flag to keep in step. The one
 * thing that would fight is the stylesheet's own `transition` on those very
 * properties, easing values Framer is already easing, so the live panel carries
 * `transition: none` inline.
 *
 * `visibility` is the property a fade cannot carry: it takes the shut sheet out
 * of the tab order and the accessibility tree, which opacity 0 alone does not.
 * It is set in `transitionEnd` on the way out, so the sheet stays visible for
 * the length of its own close and only then goes.
 *
 * WHY THE PANEL IS ALWAYS MOUNTED, rather than under AnimatePresence: the
 * stylesheet lays it out at all times on desktop (see WHY THIS IS NOT
 * display:none in that file) and its `position: fixed` geometry depends on
 * that. Nothing is gained by removing it, and the close is what would be lost.
 *
 * WHY EVERY PART CARRIES ITS OWN `animate` AND ITS OWN DELAY, rather than the
 * sheet carrying them down through `staggerChildren`, and why the state is
 * passed down by hand rather than through context: both were the first shape
 * this took, and both were measured not arriving. Propagation left the parts
 * with no inline style at all; a context left them its default, because the
 * parts are written in the component that RENDERS the sheet — they are its
 * children, above any provider it could open. So `megaPiece` hands each element
 * its variant and the delay that puts it in the run, from the state its parent
 * already has. Nothing is inherited, so nothing can fail to be.
 */

import { useEffect, useState, type FocusEvent, type ReactNode } from 'react';
import { animate, motion, useMotionValue, useTransform, type Variants } from 'framer-motion';

import { DUR, EASE, STAGGER, prefersReducedMotion } from './motion-tokens';

/** The sheet's state: undefined while the stylesheet still owns it. */
export type MegaState = 'open' | 'shut' | undefined;

/** The sheet itself. */
export const megaPanel: Variants = {
  shut: {
    opacity: 0,
    y: -10,
    pointerEvents: 'none',
    transition: { duration: DUR.megaClose, ease: EASE.soft },
    transitionEnd: { visibility: 'hidden' },
  },
  open: {
    opacity: 1,
    y: 0,
    visibility: 'visible',
    pointerEvents: 'auto',
    transition: { duration: DUR.megaOpen, ease: EASE.soft },
  },
};

/** What a part of the sheet can be. */
export type MegaKind = 'aside' | 'part' | 'item';

const PIECE: Record<MegaKind, Variants> = {
  /* The blue column, in from the sheet's edge. */
  aside: {
    shut: { opacity: 0, x: -16, transition: { duration: 0.18, ease: EASE.soft } },
    open: { opacity: 1, x: 0, transition: { duration: 0.5, ease: EASE.out } },
  },
  /* A block of the sheet: the tab row, the pane's grid, a column of About's. */
  part: {
    shut: { opacity: 0, y: -6, transition: { duration: 0.18, ease: EASE.soft } },
    open: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE.out } },
  },
  /* One tab, one link, one row. */
  item: {
    shut: { opacity: 0, y: 8, transition: { duration: 0.16, ease: EASE.soft } },
    open: { opacity: 1, y: 0, transition: { duration: 0.38, ease: EASE.out } },
  },
};

/** Seconds before the contents start to follow the box in. */
export const MEGA_LEAD = 0.08;
/** Seconds between the blue column, the tab row and the pane. */
export const MEGA_BEAT = 0.06;
/** Seconds between neighbouring links. */
export const MEGA_LINK = STAGGER.link;

/* Built once per (kind, delay) rather than per render: Framer re-reads a
   variant object whenever its identity changes, and the sheet re-renders on
   every hover and every tab. */
const CACHE = new Map<string, Variants>();

function piece(kind: MegaKind, delay: number): Variants {
  const key = `${kind}:${delay.toFixed(3)}`;
  const hit = CACHE.get(key);
  if (hit) return hit;
  const base = PIECE[kind];
  const open = base.open as { transition?: object };
  const made: Variants = {
    shut: base.shut!,
    open: { ...(base.open as object), transition: { ...(open.transition ?? {}), delay } },
  };
  CACHE.set(key, made);
  return made;
}

/**
 * The props one part of the sheet spreads onto its motion element:
 *
 *   <motion.aside className="vxn-umega__aside" {...megaPiece(state, 'aside', MEGA_LEAD)} />
 */
export function megaPiece(state: MegaState, kind: MegaKind, delay = 0) {
  return state ? { animate: state, variants: piece(kind, delay) } : {};
}

/**
 * Hover and focus as React state, and whether this browser should be driving
 * the sheet at all.
 *
 * `dismissed` comes from useMegaDismiss: the ✕ and Escape. Both handlers go on
 * the <li>. `mouseleave` on it covers the panel too, since the panel is one of
 * its children and the 40px bridge under the bar is its own ::before, so the
 * pointer can travel from the trigger to the sheet without the item ever being
 * left. onFocus/onBlur are React's, which listen on focusin/focusout, so
 * between them they carry `:focus-within`.
 */
export function useMegaSheet(dismissed: boolean) {
  const [live, setLive] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  /* After mount, and never under reduced motion: the stylesheet's own open is
     what that visitor gets. */
  useEffect(() => {
    if (!prefersReducedMotion()) setLive(true);
  }, []);

  const itemProps = {
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
    onFocus: () => setFocused(true),
    onBlur: (e: FocusEvent<HTMLLIElement>) => {
      if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false);
    },
  };

  const open = live && (hovered || focused) && !dismissed;
  const state: MegaState = live ? (open ? 'open' : 'shut') : undefined;
  return { state, itemProps };
}

/**
 * The panel box. Renders the same `<div class="vxn-umega__panel">` the markup
 * has always had — before `live`, with nothing on it at all, so the stylesheet
 * is in charge exactly as it was.
 */
export function MegaSheet({ state, children }: { state: MegaState; children: ReactNode }) {
  return (
    <motion.div
      className="vxn-umega__panel"
      {...(state
        ? {
            animate: state,
            variants: megaPanel,
            /* See HOW IT SITS WITH THE STYLESHEET. */
            style: { transition: 'none' },
          }
        : {})}
    >
      {children}
    </motion.div>
  );
}

/**
 * A figure that counts up from zero each time its sheet opens ("48+" on
 * About). Rendered from a motion value, so React owns the text the whole time
 * and the server renders the real figure: with this bundle blocked, or before
 * the sheet has ever opened, it simply reads "48+".
 */
export function SheetCount({ value, state, className }: { value: string; state: MegaState; className?: string }) {
  const digits = value.replace(/[^\d]/g, '');
  const target = Number(digits) || 0;
  const at = digits ? value.indexOf(digits) : 0;
  const prefix = digits ? value.slice(0, at) : '';
  const suffix = digits ? value.slice(at + digits.length) : '';

  const count = useMotionValue(target);
  const text = useTransform(count, (v) => (digits ? `${prefix}${Math.round(v)}${suffix}` : value));

  useEffect(() => {
    if (state !== 'open' || !target) return;
    count.set(0);
    const controls = animate(count, target, {
      duration: 1.1,
      ease: EASE.out,
      delay: MEGA_LEAD + MEGA_BEAT * 2,
    });
    return () => {
      controls.stop();
      count.set(target);
    };
  }, [state, target, count]);

  return <motion.span className={className}>{text}</motion.span>;
}
