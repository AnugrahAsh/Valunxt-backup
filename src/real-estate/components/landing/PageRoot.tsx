'use client';

/**
 * The root of a service page in the landing page's design: the `.re-land`
 * scope every `re-l-*` style hangs off, and the arrival engine that plays
 * each `[data-rv]` element as it scrolls in (see shared.tsx).
 */
import { useRef, type ReactNode } from 'react';

import { EnquiryProvider } from './enquiry';
import { useRevealEngine } from './shared';

export default function PageRoot({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  useRevealEngine(root);
  return (
    <EnquiryProvider>
      <div className="re-land re-land--page" ref={root}>
        {children}
      </div>
    </EnquiryProvider>
  );
}
