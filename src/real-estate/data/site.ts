/**
 * Chrome-level content: brand, regions, navigation, footer, contact details.
 *
 * This is Valunxt. The real estate practice is part of the group, not a
 * separate company, so the wordmark, the palette and the type are the group's —
 * what changes is the composition, not the identity.
 *
 * Copy lives here rather than inside components so the module can be re-worded
 * without opening a .tsx file.
 */
import { vxnEmail, vxnOffice } from '@/lib/site-data';
import { isRtl } from '../lib/routes';
import type { Link, Locale, Partner } from '../lib/types';

/**
 * Contact details are NOT restated here.
 *
 * Standalone, this object carried its own phone number and address, and they
 * had already drifted from the group's published ones — a different Dubai line
 * and a shortened address. The site keeps these facts in one place precisely so
 * that cannot happen (see src/lib/site-data.ts), so the module reads them from
 * there instead.
 *
 * Dubai specifically, in both editions: this practice is Dubai property and the
 * footer states the Dubai office, and the site's rule is that an office is never
 * listed under another country's telephone line.
 */
const DUBAI = vxnOffice('dubai')!;

export const BRAND = {
  name: 'Valunxt',
  full: 'Valunxt',
  /** The practice, shown as a lockup beside the wordmark. */
  practice: 'Real Estate',
  phone: DUBAI.phone,
  phoneHref: `tel:${DUBAI.tel}`,
  email: vxnEmail(),
  address: DUBAI.address,
};

/* -------------------------------------------------------------------------- */
/* NOTE: there is deliberately no region or locale switcher in this header.
   The site has its own, in the site header, and this practice is Dubai property
   in either edition — so offering a second market control here would promise a
   different set of listings behind it, which there is not. */

/* -------------------------------------------------------------------------- */
/* Navigation
 *
 * Grouped rather than flat: six top-level links crowded the bar and wrapped at
 * laptop widths, which is what was breaking. Three destinations plus one
 * grouped menu fits at every width and states the hierarchy.
 */

export interface NavGroup {
  label: string;
  href?: string;
  children?: { label: string; href: string; note: string }[];
}

export const NAV: NavGroup[] = [
  {
    label: 'Transact',
    children: [
      { label: 'Buy Property', href: '/buy-property/', note: 'Search, due diligence, negotiation and transfer' },
      { label: 'Sell, Rent & Lease', href: '/sell-rent-lease-property/', note: 'Valuation, marketing and tenancy management' },
      { label: 'Off-Plan Properties', href: '/off-plan-properties/', note: 'Launch access with the developer risk assessed' },
    ],
  },
  {
    label: 'Sectors',
    children: [
      { label: 'Residential', href: '/residential/', note: 'Homes matched to community, budget and lifestyle' },
      { label: 'Commercial', href: '/commercial/', note: 'Offices, retail, warehousing and industrial units' },
    ],
  },
  {
    label: 'Advisory',
    children: [
      { label: 'Mortgage Services', href: '/mortgage-services/', note: 'Whole-of-market financing, arranged end to end' },
      { label: 'Investment Advisory', href: '/investment-advisory/', note: 'Yield, portfolio construction and exit planning' },
      { label: 'Valuations & Advisory', href: '/valuations-advisory/', note: 'RICS and RERA-aligned independent valuation' },
    ],
  },
  { label: 'Our Process', href: '/#process' },
  { label: 'Contact', href: '/#contact' },
];

export const FOOTER_COLUMNS: { title: string; links: Link[] }[] = [
  {
    title: 'Transact',
    links: [
      { label: 'Buy Property', href: '/buy-property/' },
      { label: 'Sell, Rent & Lease', href: '/sell-rent-lease-property/' },
      { label: 'Off-Plan Properties', href: '/off-plan-properties/' },
    ],
  },
  {
    title: 'Services',
    links: [
      { label: 'Residential', href: '/residential/' },
      { label: 'Commercial', href: '/commercial/' },
      { label: 'Mortgage Services', href: '/mortgage-services/' },
      { label: 'Investment Advisory', href: '/investment-advisory/' },
      { label: 'Valuations & Advisory', href: '/valuations-advisory/' },
    ],
  },
  {
    title: 'The Group',
    links: [
      { label: 'About Valunxt', href: '/#about' },
      { label: 'Our Process', href: '/#process' },
      { label: 'Client Reviews', href: '/#reviews' },
      { label: 'Market Insights', href: '/#insights' },
    ],
  },
  {
    title: 'Get in Touch',
    links: [
      { label: 'Speak to an Advisor', href: '/#contact' },
      { label: 'Request a Valuation', href: '/#contact' },
      { label: 'FAQs', href: '/#faqs' },
    ],
  },
];

/**
 * Developer partners. `logo` is intentionally unset: a developer's mark is
 * their property and displaying it asserts a commercial relationship, so the
 * module type-sets the names and the host drops real files into
 * public/real-estate/img/partners/ once it has the right to use them.
 */
export const PARTNERS: Partner[] = [
  { name: 'EMAAR' },
  { name: 'DAMAC' },
  { name: 'NAKHEEL' },
  { name: 'SOBHA' },
  { name: 'ALDAR' },
  { name: 'MERAAS' },
  { name: 'OMNIYAT' },
  { name: 'ELLINGTON' },
];

export const PARTNERS_TITLE = 'Trusted by Leading Developers & Industry Partners';

/**
 * Arabic string table.
 *
 * Kept intact but dormant: this site publishes no Arabic edition, so isRtl() in
 * lib/routes.ts answers false for every market and t() below always returns the
 * English source. Add an Arabic slug to the site's region registry and to
 * isRtl(), and this table starts being used again with no change here.
 */
const AR: Record<string, string> = {
  Transact: 'المعاملات',
  Sectors: 'القطاعات',
  Advisory: 'الاستشارات',
  Services: 'خدماتنا',
  Residential: 'العقارات السكنية',
  Commercial: 'العقارات التجارية',
  'Mortgage Services': 'خدمات التمويل العقاري',
  'Investment Advisory': 'الاستشارات الاستثمارية',
  'Valuations & Advisory': 'التقييم والاستشارات',
  'Our Process': 'آلية العمل',
  Valuations: 'التقييم العقاري',
  Insights: 'رؤى السوق',
  Contact: 'تواصل معنا',
  'Buy Property': 'شراء عقار',
  'Sell, Rent & Lease': 'البيع والإيجار والتأجير',
  'Off-Plan Properties': 'عقارات على الخارطة',
  'Real Estate': 'العقارات',
  'The Group': 'المجموعة',
  'Get in Touch': 'تواصل معنا',
  'Speak to an Advisor': 'تحدث إلى مستشار',
  'Enquire Now': 'استفسر الآن',
  'Explore Properties': 'استكشف العقارات',
};

/** Translate, falling back to the English source string. */
export function t(locale: Locale, s: string): string {
  return isRtl(locale) ? (AR[s] ?? s) : s;
}
