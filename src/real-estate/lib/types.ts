/**
 * Shared shapes for the Real Estate module.
 *
 * Everything the pages render is data, not markup: the three service pages are
 * one template driven by a `ServicePage` record, so adding a fourth is a data
 * edit rather than a new component. Keep it that way — it is the reason the
 * module stays small enough to hand to someone else.
 */

/**
 * The market an edition is rendered in.
 *
 * Standalone, this was the module's own `'ae-en' | 'ae-ar'`. Inside this site it
 * is the site's own region slug, so the module's pages sit in the same edition
 * as every other page and one prefixing rule serves both — see the host
 * integration note at the top of lib/routes.ts.
 */
export type { RegionSlug as Locale } from '@/lib/region';

export interface Link {
  label: string;
  /** Locale-relative, always with a trailing slash, e.g. '/real-estate/'. */
  href: string;
  /** External links open in a new tab and skip locale prefixing. */
  external?: boolean;
}

/** A labelled statistic. `basis` is optional but rendered when present. */
export interface Stat {
  value: string;
  label: string;
  detail?: string;
}

export interface FeatureCard {
  title: string;
  summary: string;
  bullets: string[];
  href?: string;
  cta?: string;
  img?: string;
}

export interface ProcessStep {
  /** '01' … '04'. Rendered, so it is copy rather than an index. */
  number: string;
  title: string;
  body: string;
}

export interface Faq {
  q: string;
  a: string;
}

export interface Review {
  name: string;
  /** e.g. '3 months ago'. Free text — it mirrors the Google review card. */
  when: string;
  rating: number;
  body: string;
  /** Tint for the initial avatar; cycles through the brand set when omitted. */
  accent?: string;
}

export interface Partner {
  name: string;
  /** Path under /real-estate/img/, or omit to render the name as a wordmark. */
  logo?: string;
}

/** One of the three L2 service pages. */
export interface ServicePage {
  /** Last path segment, e.g. 'buy-property'. */
  slug: string;
  eyebrow: string;
  title: string;
  /** Second line of the hero title, set in the display serif. */
  titleAccent: string;
  lede: string;
  heroImg: string;
  /** The three-up value strip under the hero. */
  highlights: Stat[];
  /** "What's included" grid. */
  offer: FeatureCard[];
  /** Section heading above `offer`. */
  offerTitle: string;
  offerLede: string;
  steps: ProcessStep[];
  stepsTitle: string;
  faqs: Faq[];
  ctaTitle: string;
  ctaBody: string;
}

/* --------------------------------------------------------------------------
   Service-page detail blocks
   --------------------------------------------------------------------------
   Each is optional on a ServicePage. A page renders a block only when it
   carries data for it, so buy/sell/off-plan can each show what is relevant
   without three different templates.
   -------------------------------------------------------------------------- */

/**
 * A featured property. Prices are indicative and labelled as such on screen.
 * Photos live in public/real-estate/listings/ — every one of them a photo of
 * a property (exterior, interior or the building), cover first.
 */
export interface Listing {
  /** Short, stable, shown in the quick view as the reference. */
  id: string;
  title: string;
  community: string;
  type: 'Apartment' | 'Villa' | 'Townhouse' | 'Penthouse' | 'Office' | 'Retail' | 'Warehouse';
  /** Formatted for display, e.g. 'AED 2.4M'. */
  price: string;
  /** The same price in AED, for sorting. */
  value: number;
  /** 'guide price' for resale, 'per year' for rentals, 'from' for launches. */
  priceNote: string;
  beds: string;
  baths: string;
  area: string;
  /** e.g. 'Ready', 'Q4 2027', 'Available now'. */
  status: string;
  /** Cover first, then the rest of the gallery. */
  images: string[];
  tags: string[];
  summary: string;
  features: string[];
  /** Extra facts for the quick view, e.g. handover, plan, service charge. */
  facts?: { label: string; value: string }[];
}

/** A developer payment plan. */
export interface PaymentPlan {
  name: string;
  /** e.g. '20 / 80'. */
  split: string;
  summary: string;
  rows: { label: string; value: string }[];
  best: string;
}

/** One row of an indicative price or rent table. */
export interface PriceRow {
  area: string;
  apartment: string;
  villa: string;
  yield: string;
}
