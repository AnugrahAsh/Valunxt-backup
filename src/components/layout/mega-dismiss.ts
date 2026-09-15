'use client';

/**
 * The close behaviour every mega panel shares (lifted out of UaeServicesMega,
 * 20260915, when About became the second panel shape).
 *
 * A panel OPENS in CSS, on `li:hover` or `li:focus-within`, so it works before
 * hydration. What CSS cannot express is a dismissal: the ✕ button, and Escape
 * from anywhere inside. Both set `dismissed`, which puts `.is-dismissed` on the
 * <li> and out-specifies the open rule in valunxt-uae-mega.css.
 *
 * ---------------------------------------------------------------------------
 * THE RE-ARM IS THE TRIGGER, AND ONLY THE TRIGGER
 *
 * `rearm` goes on the trigger link's pointer enter and its focus. Opening
 * again means pointing at the item or tabbing to it, and those are the two
 * ways back in.
 *
 * It used to run on the <li>'s pointer leave as well, and that is what broke
 * the ✕ (measured 20260915, both panels): a mouse press FOCUSES the button;
 * the dismissal takes pointer events off the sheet; Chrome re-tests the
 * resting pointer at once and fires mouseleave; the leave re-armed; and the
 * focused button still held the <li> at :focus-within, so the sheet opened
 * again under the pointer 20ms after it closed. The trace read: focusin
 * BUTTON, dismissed=true, click, mouseleave, dismissed=false, mouseenter.
 *
 * So a CLICK on the ✕ also takes focus out of the panel, leaving the <li>
 * neither hovered nor focused once the sheet closes. A KEY on the ✕ (a click
 * whose `detail` is 0), like Escape, hands focus to the trigger instead so the
 * next Tab carries on along the bar, and that focus is moved `quiet`ly: the
 * trigger's own focus handler would otherwise re-arm the panel that was just
 * closed.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import type { MouseEvent as ReactMouseEvent } from 'react';

export function useMegaDismiss() {
  const itemRef = useRef<HTMLLIElement>(null);
  const quiet = useRef(false);
  const [dismissed, setDismissed] = useState(false);

  /* focus() dispatches the focus event synchronously, so the flag is still
     set when the trigger's handler reads it. */
  const focusTrigger = useCallback(() => {
    quiet.current = true;
    itemRef.current?.querySelector<HTMLAnchorElement>('.elementor-item')?.focus();
    quiet.current = false;
  }, []);

  /* Escape closes it from anywhere inside, which is the one thing a hover menu
     otherwise gives a keyboard user no way to do. */
  useEffect(() => {
    if (dismissed) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (!itemRef.current?.contains(document.activeElement)) return;
      setDismissed(true);
      focusTrigger();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [dismissed, focusTrigger]);

  /** The ✕ button's onClick. */
  const close = useCallback(
    (e: ReactMouseEvent) => {
      setDismissed(true);
      if (e.detail === 0) {
        focusTrigger();
      } else if (itemRef.current?.contains(document.activeElement)) {
        (document.activeElement as HTMLElement).blur();
      }
    },
    [focusTrigger],
  );

  /** The trigger link's onMouseEnter and onFocus. */
  const rearm = useCallback(() => {
    if (!quiet.current) setDismissed(false);
  }, []);

  return { itemRef, dismissed, close, rearm };
}
