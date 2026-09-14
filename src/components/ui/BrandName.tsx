/**
 * THE NAME IS "Valunxt" (20260914, client): never "VALUNXT", anywhere on the
 * site. The source text says so everywhere now, but a label the stylesheet
 * sets in capitals (the eyebrows, tags and pills with text-transform:
 * uppercase) would still draw it as VALUNXT. Those labels keep their capitals;
 * the name inside them is wrapped in `.vxn-brand`, which valunxt-brand.css
 * (THE BRAND NAME) exempts from the transform.
 *
 * Plain text in, text or a fragment out, so it drops into any label that
 * renders a string: `{brandCase(card.tag)}`.
 */
import type { ReactNode } from 'react';

const NAME = 'Valunxt';

export function brandCase(text: string): ReactNode {
  if (!text.includes(NAME)) return text;
  return text.split(NAME).flatMap((part, i) =>
    i === 0
      ? [part]
      : [
          <span key={i} className="vxn-brand">
            {NAME}
          </span>,
          part,
        ],
  );
}
