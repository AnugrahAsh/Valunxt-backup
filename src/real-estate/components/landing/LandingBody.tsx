'use client';

/**
 * /{market}/real-estate/ — THE DUBAI LANDING PAGE (20260921).
 *
 * Rebuilt from scratch on client brief: the group's corporate design, applied
 * to Dubai lifestyle. In page order — a hero with a real search, a ticker of
 * why-Dubai facts, filterable featured listings, the case for Dubai in
 * numbers, ten areas on an interactive map, a horizontal lifestyle strip, two
 * calculators (yield and off-plan payment plan), the process, the newest
 * insights, the lead form and the FAQs. The module's own header and footer
 * frame it (Shell.tsx).
 *
 * ONE PIECE OF SHARED STATE: the search. The hero's search bar and the
 * listings section's filter chips read and write the same object through
 * SearchContext, so "Search" in the hero scrolls to results that are already
 * filtered, and "Enquire" on a card scrolls to the form with the listing
 * named. Everything else is local to its section.
 */
import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';

import type { BlogCard } from '@/lib/blog/types';
import type { Locale } from '../../lib/types';
import { url } from '../../lib/routes';
import { LISTINGS, SEARCH, type Listing, type ListingMode } from '../../data/landing';
import { useRevealEngine } from './shared';
import { scrollToId } from './enquiry';
import Hero from './Hero';
import Ticker from './Ticker';
import Listings from './Listings';
import WhyDubai from './WhyDubai';
import Areas from './Areas';
import Lifestyle from './Lifestyle';
import Calculators from './Calculators';
import Process from './Process';
import Insights from './Insights';
import Enquire from './Enquire';
import Faq from './Faq';

export interface SearchState {
  mode: ListingMode;
  area: string;
  type: string;
  beds: string;
  budget: number;
}

interface SearchApi {
  search: SearchState;
  set: (patch: Partial<SearchState>) => void;
  results: Listing[];
  /** Scroll the listings into view (the hero's Search button). */
  goToResults: () => void;
  /** Scroll to the form with a listing named in the message. */
  enquire: (about?: string) => void;
  enquiryAbout: string;
}

const SearchContext = createContext<SearchApi | null>(null);
export const useSearch = () => {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error('useSearch outside LandingBody');
  return ctx;
};

export const DEFAULT_SEARCH: SearchState = { mode: 'buy', area: 'any', type: 'Any type', beds: 'Any beds', budget: 0 };

export function filterListings(all: Listing[], s: SearchState, budgets: { max: number; min?: number }[]): Listing[] {
  const b = budgets[s.budget] ?? budgets[0]!;
  return all.filter((l) => {
    if (l.mode !== s.mode) return false;
    if (s.area !== 'any' && l.areaKey !== s.area) return false;
    if (s.type !== 'Any type' && l.type !== s.type) return false;
    if (s.beds !== 'Any beds') {
      if (s.beds === 'Studio' && l.beds !== 0) return false;
      if (s.beds === '4+' && l.beds < 4) return false;
      if (/^\d$/.test(s.beds) && l.beds !== Number(s.beds)) return false;
    }
    if (l.price > b.max) return false;
    if (b.min && l.price < b.min) return false;
    return true;
  });
}

export default function LandingBody({ locale, posts }: { locale: Locale; posts: BlogCard[] }) {
  const root = useRef<HTMLDivElement>(null);
  useRevealEngine(root);

  const [search, setSearch] = useState<SearchState>(DEFAULT_SEARCH);
  const [enquiryAbout, setEnquiryAbout] = useState('');

  const set = useCallback((patch: Partial<SearchState>) => {
    setSearch((s) => {
      const next = { ...s, ...patch };
      /* A new mode has its own budget bands; start it from "any". */
      if (patch.mode && patch.mode !== s.mode) next.budget = 0;
      return next;
    });
  }, []);


  const api = useMemo<SearchApi>(() => {
    return {
      search,
      set,
      results: filterListings(LISTINGS, search, SEARCH.budgets[search.mode]),
      goToResults: () => scrollToId('listings'),
      enquire: (about) => {
        setEnquiryAbout(about ?? '');
        scrollToId('enquire');
      },
      enquiryAbout,
    };
  }, [search, set, enquiryAbout]);

  return (
    <SearchContext.Provider value={api}>
      <div className="re-land" ref={root}>
        <Hero />
        <Ticker />
        <Listings />
        <WhyDubai />
        <Areas />
        <Lifestyle />
        <Calculators />
        <Process cta={{ label: 'How we buy', href: url(locale, '/buy-property/') }} />
        <Insights posts={posts} locale={locale} />
        <Enquire interest={search.mode === 'rent' ? 'Renting' : search.mode === 'offplan' ? 'Off-plan' : 'Buying'} about={enquiryAbout} onClearAbout={() => setEnquiryAbout('')} />
        <Faq />
      </div>
    </SearchContext.Provider>
  );
}
