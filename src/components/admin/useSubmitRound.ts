'use client';

import { useState } from 'react';

/**
 * A number that moves on each time a form's action answers.
 *
 * React resets a form once its action has run. A text field comes back holding
 * what was submitted, because the screens hand the submitted values back as its
 * defaultValue and React applies a changed defaultValue to an input. A <select>
 * reads defaultValue only when it mounts, so after a rejected save it would snap
 * back to the record's original choice and a second press would save that.
 * Keying an uncontrolled select on this number remounts it with the submitted
 * choice instead.
 */
export function useSubmitRound(state: unknown): number {
  const [seen, setSeen] = useState(state);
  const [round, setRound] = useState(0);
  if (state !== seen) {
    setSeen(state);
    setRound(round + 1);
  }
  return round;
}
