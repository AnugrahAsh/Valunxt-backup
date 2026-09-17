/**
 * The pieces every practice's sub-service pages share.
 *
 * The vision rail is a statement about the firm, so it is the same on all
 * thirty-three pages. The insights rail on the five practices other than
 * Accounting & Tax shows four of the site's real published articles (the
 * launch-seed posts these used to point to were unpublished 20260917 on
 * client instruction, so this rail now names four of the imported vx_posts
 * articles instead) rather than the placeholder cards the bookkeeping page
 * was built with; the bookkeeping page keeps its own because the client has
 * seen them. The strip's stand-in photographs are the home page's six, in
 * the home page's order.
 */
import type { Industry } from '@/components/sections/HomeIndustriesRow';

import type { SubInsight, SubVision } from './subTypes';

/** Firm-level, unchanged from the bookkeeping page. */
export const SHARED_VISION: SubVision = {
  steps: [
    {
      title: 'Our Focus',
      body:
        'One thing above all: numbers you can act on without second-guessing — compliance kept ' +
        'current, positions documented, deadlines met before they are due.',
    },
    {
      title: 'Our Approach',
      body:
        'Fixed fees agreed before work begins, senior people on every mandate, and every ' +
        'recommendation backed by verified data and sound method.',
    },
    {
      title: 'Our Experience',
      body:
        'A senior team of accountants, tax advisers and valuers, part of the Reliant Surveyors ' +
        'group — from Dubai to Noida to Mumbai.',
    },
  ],
  pill: 'Our Vision',
  quote:
    'To be the UAE partner businesses trust with the numbers that decisions rest on — listening ' +
    'first, thinking independently, and advising with conviction.',
};

/** Four of the site's real published articles (vx_posts), newest first. */
export const SITE_ARTICLES: SubInsight[] = [
  {
    category: 'Corporate Tax',
    kind: 'Article',
    date: 'September 15, 2026',
    title: 'Tax Planning Strategies for UAE Business Owners: How to Save Money Legally',
    excerpt:
      'Legal UAE tax planning strategies, including Corporate Tax deductions, Small Business ' +
      'Relief, Free Zone rules, tax losses and compliance tips.',
    href: '/blogs/tax-planning-uae-business-owners/',
    image: 'blogs/tax-planning-uae-business-owners.webp',
    alt: '',
  },
  {
    category: 'Accounting',
    kind: 'Article',
    date: 'September 15, 2026',
    title: 'E-Commerce Accounting UAE: Bookkeeping, Inventory & Profit',
    excerpt:
      'Generic bookkeeping can hide marketplace fees, returns, inventory costs and weak margins ' +
      '— what growing UAE e-commerce businesses need from accounting.',
    href: '/blogs/ecommerce-accounting-uae/',
    image: 'blogs/ecommerce-accounting-uae.webp',
    alt: '',
  },
  {
    category: 'VAT',
    kind: 'Article',
    date: 'September 11, 2026',
    title: 'UAE VAT Compliance Checklist: Stay Ahead of Deadlines and Reduce Penalty Risk',
    excerpt:
      'Manage filing deadlines, reconciliations, supporting records, review, payment and audit ' +
      'readiness every Tax Period.',
    href: '/blogs/uae-vat-compliance-checklist/',
    image: 'blogs/uae-vat-compliance-checklist.png',
    alt: '',
  },
  {
    category: 'Corporate Tax',
    kind: 'Article',
    date: 'September 3, 2026',
    title: 'Why UAE Startups Struggle With Financial Due Diligence',
    excerpt:
      'Disorganised financial records, revenue documentation and reporting are what trip up a ' +
      'pre-investment financial review — and how to close those gaps early.',
    href: '/blogs/financial-due-diligence-uae-startups/',
    image: 'blogs/financial-due-diligence-uae-startups.webp',
    alt: '',
  },
];

/**
 * The strip's six stand-ins, in the home page's order:
 *   industry-5  advisers and a world map   industry-4  workstation and code
 *   industry-2  atrium architecture        industry-1  concourse of people
 *   industry-3  rows of server racks       abstract-1  neutral blue abstract
 * A practice names six disciplines and gets these six behind them; the first
 * path in each pair is where a purpose shot would go.
 */
const STRIP_STANDINS = [
  'homepage/industry-5.webp',
  'homepage/industry-4.webp',
  'homepage/industry-2.webp',
  'homepage/industry-1.webp',
  'homepage/industry-3.webp',
  'homepage/abstract-1.webp',
];

/** Six disciplines for the strip, with a purpose-shot slot in front of each stand-in.
 *  The slot is keyed by the discipline's name, not its position, so a page that
 *  overrides the strip with other disciplines can never pick up its siblings'
 *  photographs. */
export function stripOf(service: string, names: [string, string, string, string, string, string]): Industry[] {
  return names.map((name, i) => ({
    name,
    img: [`services/strip-${service}-${slugOf(name)}.webp`, STRIP_STANDINS[i]],
  }));
}

/** "Plant & Machinery" -> "plant-machinery". */
function slugOf(name: string): string {
  return name.toLowerCase().replace(/&/g, ' ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

/** The client-team photograph the bookkeeping page's Why-us card sits on. */
export const WHY_PHOTO = { image: '2025/04/pexels-rdne-7889214.jpg', alt: 'A client team in discussion' };

/** The photograph behind every practice's success story. */
export const STORY_PHOTO = { photo: '2025/03/GettyImages-2188611296.jpg', alt: 'A finance lead reviewing a filing' };

/** The band's plate, the same on every page. */
export const BAND_PHOTO = { image: 'banners/technology-and-ai.webp', alt: '' };

/** The brand ramp over an abstract plate that the brief's panel carries. */
export const PANEL_PLATE = { mark: 'Valunxt', image: 'homepage/abstract-2.webp', alt: '' };
