'use client';

/**
 * The reel of the question band (UaeAnswerBand.tsx, 20260916), built to the
 * supplied recording: six labels down the left with a coloured dot beside
 * the lit one, and a photograph panel on the right carrying two glass
 * cards, the question typed out and the answer sliding up beneath it.
 *
 * THE CLOCK. One scene is: the cards clear and the photograph crosses
 * (380ms), the question types on a 14ms timer a character, which lands at
 * about 30 to 40ms a character once each React commit is counted (the
 * recording types about 70 characters in 1.6s), the answer card rises 320ms after the last
 * character, and the scene holds 3.4s before the dot drops to the next
 * label. The clock runs only while the band is on screen and no pointer
 * rests on the panel; touch never holds it, since a finger cannot leave.
 * (The recording's "Auto play" switch was rendered under the list until
 * 20260916; the client asked for it hidden with the reel still playing, so
 * the markup went and the clock no longer reads a switch.) Pressing a label plays that scene from its
 * first character. With reduced motion the reel stands still on whatever
 * label was pressed, typed in full.
 *
 * SERVER MARKUP is the first scene complete, so the band reads whole before
 * this bundle runs and if it never does. The reel starts from a blank card
 * the first time the band scrolls into view.
 */
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import CtaArrow from '@/components/ui/CtaArrow';

export type AnswerScene = {
  key: string;
  /** The label in the list (the practice's short name). */
  label: string;
  /** The practice's full name, on the answer card. */
  name: string;
  question: string;
  answer: string;
  href: string;
  img: string;
  /** The dot's colour while this label is lit. */
  dot: string;
};

type Phase = 'enter' | 'typing' | 'answered';

const ENTER_MS = 380;
const CHAR_MS = 14;
const ANSWER_MS = 320;
const HOLD_MS = 3400;

export default function UaeAnswerStage({ scenes }: { scenes: AnswerScene[] }) {
  const [active, setActive] = useState(0);
  const [phase, setPhase] = useState<Phase>('answered');
  const [typed, setTyped] = useState(() => scenes[0]?.question.length ?? 0);
  const [held, setHeld] = useState(false);
  const [visible, setVisible] = useState(false);
  const [reduce, setReduce] = useState(false);
  const [started, setStarted] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const [dotTop, setDotTop] = useState<number | null>(null);

  const scene = scenes[active] ?? scenes[0];
  const running = started && visible && !held && !reduce;

  /* Reduced motion, read once the bundle is up. */
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const on = () => setReduce(mq.matches);
    on();
    mq.addEventListener?.('change', on);
    return () => mq.removeEventListener?.('change', on);
  }, []);

  /* On screen or not: the reel only turns while the band is in view. */
  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver !== 'function') {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => setVisible(e.isIntersecting)),
      { threshold: 0.25 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /* The first time it is seen, the reel starts from a blank card. */
  useEffect(() => {
    if (started || !visible || reduce) return;
    setStarted(true);
    setActive(0);
    setTyped(0);
    setPhase('enter');
  }, [visible, started, reduce]);

  /* The clock: one timer at a time, cleared whenever it is not running. */
  useEffect(() => {
    if (!running) return;
    const len = scene?.question.length ?? 0;
    let t: number;
    if (phase === 'enter') {
      t = window.setTimeout(() => setPhase('typing'), ENTER_MS);
    } else if (phase === 'typing') {
      t =
        typed < len
          ? window.setTimeout(() => setTyped((n) => n + 1), CHAR_MS)
          : window.setTimeout(() => setPhase('answered'), ANSWER_MS);
    } else {
      t = window.setTimeout(() => {
        setActive((i) => (i + 1) % scenes.length);
        setTyped(0);
        setPhase('enter');
      }, HOLD_MS);
    }
    return () => window.clearTimeout(t);
  }, [running, phase, typed, scene, scenes.length]);

  /* The dot sits on the lit label's middle; measured, because the labels
     wrap differently at every width. */
  const placeDot = useCallback(() => {
    const list = listRef.current;
    if (!list) return;
    const item = list.children[active] as HTMLElement | undefined;
    if (!item) return;
    setDotTop(item.offsetTop + item.offsetHeight / 2);
  }, [active]);

  useLayoutEffect(() => {
    placeDot();
    window.addEventListener('resize', placeDot);
    return () => window.removeEventListener('resize', placeDot);
  }, [placeDot]);

  const pick = (i: number) => {
    setActive(i);
    setStarted(true);
    if (reduce) {
      setTyped(scenes[i].question.length);
      setPhase('answered');
    } else {
      setTyped(0);
      setPhase('enter');
    }
  };

  const shown = scene ? scene.question.slice(0, typed) : '';

  return (
    <div
      ref={rootRef}
      className={`vxn-answer__stage${running ? ' is-running' : ''}${reduce ? ' is-static' : ''}`}
      data-phase={phase}
    >
      <div className="vxn-answer__side">
        <ol ref={listRef} className="vxn-answer__list" aria-label="Pick a practice" data-reveal-group="">
          {scenes.map((s, i) => (
            <li key={s.key} className="vxn-answer__item">
              <button
                type="button"
                className={`vxn-answer__label${i === active ? ' is-on' : ''}`}
                aria-current={i === active ? 'true' : undefined}
                onClick={() => pick(i)}
              >
                {s.label}
              </button>
            </li>
          ))}
          <span
            className="vxn-answer__dot"
            aria-hidden="true"
            style={{
              top: dotTop == null ? undefined : `${dotTop}px`,
              background: scene?.dot,
              boxShadow: `0 0 0 6px ${scene?.dot}22`,
            }}
          />
        </ol>
      </div>

      <div
        className="vxn-answer__panel"
        data-reveal="rise"
        onPointerEnter={(e) => e.pointerType === 'mouse' && setHeld(true)}
        onPointerLeave={(e) => e.pointerType === 'mouse' && setHeld(false)}
      >
        <div className="vxn-answer__photos" aria-hidden="true">
          {scenes.map((s, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={s.key}
              className="vxn-answer__photo"
              src={s.img}
              alt=""
              loading={i === 0 ? 'eager' : 'lazy'}
              decoding="async"
              data-on={i === active ? 'true' : undefined}
            />
          ))}
        </div>

        <div className="vxn-answer__cards" aria-live="polite">
          <div className="vxn-answer__card vxn-answer__card--q" data-on={phase !== 'enter' ? 'true' : undefined}>
            <span className="vxn-answer__from">Your question</span>
            <p className="vxn-answer__q">
              {shown}
              <span className="vxn-answer__caret" aria-hidden="true" />
            </p>
          </div>
          <div className="vxn-answer__card vxn-answer__card--a" data-on={phase === 'answered' ? 'true' : undefined}>
            <span className="vxn-answer__from">{scene?.name}</span>
            <p className="vxn-answer__a">{scene?.answer}</p>
            <a className="vxn-answer__more" href={scene?.href}>
              Explore {scene?.name}
              <CtaArrow />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
