/**
 * THE SITE'S MOTION VOCABULARY (20260917), in Framer Motion's terms.
 *
 * One set of curves, springs and durations, so a card rising on the home page,
 * a services panel opening, a mega sheet dropping and the page itself gliding
 * under the wheel all read as the same hand. Every Framer Motion layer and the
 * Lenis scroll take their timing from here rather than inventing their own,
 * which is what made the hand-tuned CSS transitions they replace disagree.
 *
 * WHY THESE CURVES.
 *   `out`   easeOutQuint. Nearly all the travel happens in the first third and
 *           the last pixels are almost free, which is what reads as smooth on
 *           an arrival.
 *   `glide` easeOutCubic. The same shape, less extreme, for a move that changes
 *           layout rather than just paint.
 *   `soft`  easeInOutCubic. For something that leaves as often as it arrives:
 *           the mega sheet, which has to close as gracefully as it opens.
 *
 * WHY A SPRING FOR THE SERVICES PANELS. A pointer sweeping the row retargets
 * the widths several times a second. An eased tween restarts from rest every
 * time it is retargeted, so each change of direction stalls and lurches — the
 * "chonky" feel. A spring keeps the velocity it already has and bends towards
 * the new target, so a sweep reads as one continuous movement. `bounce: 0`
 * means it never overshoots.
 *
 * Durations are in SECONDS, as Framer Motion takes them.
 */

/** A cubic bezier as Framer Motion wants it. */
export type Ease = [number, number, number, number];

export const EASE: Record<'out' | 'glide' | 'soft', Ease> = {
  out: [0.22, 1, 0.36, 1],
  glide: [0.33, 1, 0.68, 1],
  soft: [0.65, 0, 0.35, 1],
};

export const DUR = {
  /** A heading's line rising through its mask. */
  line: 0.9,
  /** A paragraph coming out of its blur. */
  copy: 0.85,
  /** A card or a picture rising. */
  rise: 1,
  /** A button, a beat behind its copy. */
  small: 0.75,
  /** A block simply coming up from nothing. */
  fade: 1,
  /** The figure roll. */
  count: 1.6,
  /** The services panels' photograph, scrim and frost changing state. */
  klayPaint: 0.7,
  /** The mega sheet opening. */
  megaOpen: 0.45,
  /** and closing — a shade quicker, so a dismissal feels answered. */
  megaClose: 0.3,
} as const;

/** The spring the services panels' widths move on. */
export const KLAY_SPRING = { type: 'spring', bounce: 0, visualDuration: 0.75 } as const;

/** The gaps between neighbours in a run. Seconds. */
export const STAGGER = {
  /** Line to line inside one heading. */
  line: 0.09,
  /** Element to element inside one band's arrival. */
  beat: 0.08,
  /** Card to card along a row. */
  row: 0.12,
  /** Link to link inside the mega sheet. */
  link: 0.03,
} as const;

/**
 * THE SCROLL (components/motion/SmoothScroll.tsx).
 *
 * `lerp` is the share of the remaining distance the page covers each frame
 * (frame-rate independent in Lenis 1.3). Lenis ships 0.1; 0.07 lets the page
 * keep gliding noticeably after the wheel stops — the inertia asked for —
 * without the page feeling as if it were dragging behind the hand. Below about
 * 0.05 it starts to feel detached. Anchor jumps and back-to-top use a fixed
 * duration instead, so a long jump takes the same time as a short one.
 */
export const SCROLL = {
  lerp: 0.07,
  wheelMultiplier: 1,
  /** Seconds for a programmatic scroll (an anchor link, back to top). */
  jumpDuration: 1.4,
} as const;

/** easeOutExpo, for programmatic scrolls: away fast, a long soft landing. */
export function easeOutExpo(t: number): number {
  return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

/** True when the visitor has asked for less movement. */
export function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}
