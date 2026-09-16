'use client';

/**
 * A submit button that asks once before it submits.
 *
 * The first press arms it — it widens to show "Delete?" — and only a second
 * press within a few seconds submits the form. Used for the deletes, which
 * cannot be undone and used to happen on a single stray click. Without
 * JavaScript it is a plain submit button, as before.
 */
import { useEffect, useRef, useState, type ReactNode } from 'react';

const DISARM_AFTER = 4000;

export default function ConfirmSubmit({
  label,
  confirmLabel = 'Delete?',
  className = '',
  children,
}: {
  /** Accessible name before arming, e.g. "Delete enquiry". */
  label: string;
  /** Shown once armed. */
  confirmLabel?: string;
  className?: string;
  children: ReactNode;
}) {
  const [armed, setArmed] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    []
  );

  return (
    <button
      type="submit"
      className={className + (armed ? ' is-armed' : '')}
      aria-label={armed ? `${confirmLabel} Press again to confirm` : label}
      title={armed ? 'Press again to confirm' : label}
      onClick={(e) => {
        if (armed) return;
        e.preventDefault();
        setArmed(true);
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => setArmed(false), DISARM_AFTER);
      }}
      onBlur={() => setArmed(false)}
    >
      {children}
      {armed ? <span className="confirm-label">{confirmLabel}</span> : null}
    </button>
  );
}
