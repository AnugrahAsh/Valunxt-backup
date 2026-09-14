/**
 * The pieces every practice's sub-service pages share.
 *
 * The vision rail is a statement about the firm, so it is the same on all
 * thirty-three pages. The insights rail on the five practices other than
 * Accounting & Tax shows the four articles the site actually publishes — the
 * same four the UAE home page's carousel lists — rather than the placeholder
 * cards the bookkeeping page was built with; the bookkeeping page keeps its
 * own because the client has seen them. The strip's stand-in photographs are
 * the home page's six, in the home page's order.
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

/** The four articles the site publishes, as the home carousel lists them. */
export const SITE_ARTICLES: SubInsight[] = [
  {
    category: 'Real Estate',
    kind: 'Article',
    date: 'July 11, 2026',
    title: 'How High-Net-Worth Investors Build Wealth Through Real Estate',
    excerpt:
      'For affluent investors, real estate is a disciplined, multi-decade strategy for compounding ' +
      'capital, generating income, and preserving wealth across cycles.',
    href: '/blogs/how-high-net-worth-investors-build-wealth-through-real-estate/',
    image: 'blogs/blog-1.webp',
    alt: '',
  },
  {
    category: 'Capital',
    kind: 'Article',
    date: 'July 11, 2026',
    title: 'Capital Planning for Large Property Developments',
    excerpt:
      'Large developments rarely fail for lack of a good idea — they fail for lack of a capital ' +
      'plan mapped across the full lifecycle.',
    href: '/blogs/capital-planning-for-large-property-developments/',
    image: 'blogs/blog-2.webp',
    alt: '',
  },
  {
    category: 'Research',
    kind: 'Article',
    date: 'July 11, 2026',
    title: 'Why Market Intelligence Matters Before Every Property Investment',
    excerpt:
      'The best investment decisions are made before the deal, not during it — independent ' +
      'intelligence turns conviction into evidence.',
    href: '/blogs/why-market-intelligence-matters-before-every-property-investment/',
    image: 'blogs/blog-3.webp',
    alt: '',
  },
  {
    category: 'Valuation',
    kind: 'Article',
    date: 'July 11, 2026',
    title: 'The Future of Automated Valuation Models (AVMs)',
    excerpt:
      'Automated valuation models are reshaping how quickly property can be valued — knowing ' +
      'their strengths and limits is essential.',
    href: '/blogs/the-future-of-automated-valuation-models-avms/',
    image: 'blogs/blog-4.webp',
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
export const PANEL_PLATE = { mark: 'VALUNXT', image: 'homepage/abstract-2.webp', alt: '' };
