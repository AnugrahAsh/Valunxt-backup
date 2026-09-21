'use client';

/**
 * The service pages' enquiry state: which property the visitor asked about,
 * so the form at the foot of the page can name it. Provided by PageRoot;
 * read by the property grid (to set it) and by Enquire (to show it). The
 * landing page keeps the same state in its own search context.
 */
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

export interface EnquiryApi {
  about: string;
  enquire: (about?: string) => void;
  clear: () => void;
}

const EnquiryContext = createContext<EnquiryApi | null>(null);

export const useEnquiry = () => useContext(EnquiryContext);

/** Scroll to an element by id, through the site's smooth scroller when it is running. */
export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const w = window as Window & { vxnScrollTo?: (t: HTMLElement | string | number) => void };
  if (w.vxnScrollTo) w.vxnScrollTo(el);
  else window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 84, behavior: 'smooth' });
}

export function EnquiryProvider({ children }: { children: ReactNode }) {
  const [about, setAbout] = useState('');
  const enquire = useCallback((a?: string) => {
    setAbout(a ?? '');
    scrollToId('enquire');
  }, []);
  const clear = useCallback(() => setAbout(''), []);
  const api = useMemo(() => ({ about, enquire, clear }), [about, enquire, clear]);
  return <EnquiryContext.Provider value={api}>{children}</EnquiryContext.Provider>;
}
