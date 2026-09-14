/**
 * Valunxt — multi-region (country edition) support.
 *
 * The site is published as one edition per market, each mounted on its own URL
 * prefix:
 *
 *     /en-in/…   India   (the original site — unchanged content)
 *     /en-ae/…   UAE
 *
 * Only the pages that genuinely differ per market need their own file. The
 * home page does: app/[region]/page.tsx picks the India or UAE home so each
 * market gets its own hero, copy and imagery. Everything else is a single
 * shared page rendered under the region segment, so REGION still says "en-ae"
 * because detection reads the URL.
 *
 * Port of includes/region.php.
 */

/* ---- The registry --------------------------------------------------------- */

export type RegionSlug = 'en-in' | 'en-ae';

export interface Region {
  slug: RegionSlug;
  name: string;
  short?: string;
  code: string;
  lang: string;
  currency: string;
  symbol: string;
  tz: string;
  offices: string[];
  markets: string;
  markets_long: string;
  cities: string;
  entity: string;
  phone: string;
  tel: string;
  hours: string;
}

/** The market shown when nothing in the URL, the cookie or the request says otherwise. */
export function vxnRegionDefault(): RegionSlug {
  return 'en-in';
}

/**
 * Every published edition, in menu order. `offices` keys into vxnOffices() so
 * a region never has to restate an address.
 */
const REGIONS: Record<RegionSlug, Region> = {
  'en-in': {
    slug: 'en-in',
    name: 'India',
    code: 'IN',
    lang: 'en-IN',
    currency: 'INR',
    symbol: '₹',
    tz: 'IST',
    offices: ['mumbai', 'noida'],
    markets: 'India',
    markets_long: 'India, the UAE, and international markets',
    cities: 'Mumbai and Noida',
    entity: 'Valunxt Capital Advisory Services Private Limited',
    phone: '+91 120 718 5322',
    tel: '+911207185322',
    hours: 'Mon – Sat, 9:00 AM – 6:00 PM IST',
  },
  'en-ae': {
    slug: 'en-ae',
    name: 'United Arab Emirates',
    short: 'UAE',
    code: 'AE',
    lang: 'en-AE',
    currency: 'AED',
    symbol: 'AED',
    tz: 'GST',
    offices: ['dubai', 'abudhabi'],
    markets: 'the UAE',
    markets_long: 'the UAE, India, and international markets',
    cities: 'Dubai and Abu Dhabi',
    entity: 'Valunxt Corporate Services LLC',
    phone: '+971 4 255 4683',
    tel: '+97142554683',
    hours: 'Mon – Sat, 9:00 AM – 6:00 PM GST',
  },
};

export function vxnRegions(): Record<RegionSlug, Region> {
  return REGIONS;
}

/** Every published edition, in menu order. */
export function vxnRegionList(): Region[] {
  return Object.values(REGIONS);
}

/** True when `slug` is a published edition. */
export function vxnRegionExists(slug: unknown): slug is RegionSlug {
  return typeof slug === 'string' && Object.prototype.hasOwnProperty.call(REGIONS, slug);
}

/** A region record — the default one when the slug is not published. */
export function vxnRegionData(slug?: string | null): Region {
  if (vxnRegionExists(slug)) return REGIONS[slug];
  return REGIONS[vxnRegionDefault()];
}

/** Normalise an incoming route segment to a published edition. */
export function vxnRegion(slug?: string | null): RegionSlug {
  return vxnRegionExists(slug) ? slug : vxnRegionDefault();
}

/** The short label for the switcher ("India", "UAE"). */
export function vxnRegionLabel(slug?: string | null): string {
  const r = vxnRegionData(slug);
  return r.short ?? r.name;
}

/* ---- URLs ----------------------------------------------------------------- */

/**
 * The site is mounted at the web root under Next.js, so BASE is the empty
 * string. It is kept as a named export so ported templates read the same way
 * they did in PHP and a future sub-path deployment has one place to change.
 */
export const BASE = '';

/**
 * A region-scoped URL. rurl('en-ae', '/services/') → "/en-ae/services/".
 *
 * In the PHP build, page templates wrote `BASE . '/services/'` and the finished
 * HTML was filtered on the way out to add the region prefix. Here the prefix is
 * applied at the source instead: every internal page link goes through rurl(),
 * so there is no output filter and no chance of a link escaping it.
 *
 * Assets, files (anything with an extension) and absolute URLs are returned
 * untouched, exactly as the PHP filter left them.
 */
export function rurl(region: string, p = '/'): string {
  let out = String(p ?? '/');
  if (out === '') out = '/';

  // Absolute URLs, mailto:, tel:, and in-page anchors are not ours to prefix.
  if (/^([a-z][a-z0-9+.-]*:|\/\/|#)/i.test(out)) return out;

  if (out[0] !== '/') out = '/' + out;

  // Split off ?query / #hash before inspecting the path.
  const cut = out.search(/[?#]/);
  const pathPart = cut === -1 ? out : out.slice(0, cut);
  const suffix = cut === -1 ? '' : out.slice(cut);

  const skip = ['assets', 'LOGO', 'icons', 'admin', 'data', '_retired', '_wp-source', 'api'];
  const first = pathPart.replace(/^\/+/, '').split('/')[0];

  if (first !== '' && (skip.includes(first) || vxnRegionExists(first))) return out;

  // A file (sitemap.xml, a download) is not a page.
  const base = pathPart.split('/').filter(Boolean).pop() ?? '';
  if (base.includes('.')) return out;

  const slug = vxnRegionExists(region) ? region : vxnRegionDefault();
  return `${BASE}/${slug}${pathPart}${suffix}`;
}

/** The current page as it is addressed in another market. */
export function rswap(slug: string, currentRegionPath: string): string {
  const target = vxnRegionExists(slug) ? slug : vxnRegionDefault();
  const p = currentRegionPath === '' ? '/' : currentRegionPath;
  return `${BASE}/${target}${p.startsWith('/') ? p : '/' + p}`;
}

/* ---- Region facts --------------------------------------------------------- */

import { vxnOffices, type Office } from './site-data';

/** The offices in this market, in canonical order. */
export function vxnRegionOffices(slug?: string | null): Record<string, Office> {
  const r = vxnRegionData(slug);
  const all = vxnOffices();
  const out: Record<string, Office> = {};
  for (const k of r.offices) {
    const office = all[k as keyof typeof all];
    if (office) out[k] = office;
  }
  return out;
}

/** The telephone line answered in this market. */
export function vxnRegionPhone(slug?: string | null): string {
  return vxnRegionData(slug).phone;
}

/* ---- Services per market -------------------------------------------------- */

/** One published page beneath a service — UAE only, for now. */
export interface SubService {
  /** Plain text, for headings and breadcrumbs. */
  name: string;
  /** The last URL segment: /services/<service>/<slug>/. */
  slug: string;
}

export interface Service {
  title: string;
  icon: string;
  short: string;
  href: string;
  desc: string;
  img: string;
  /** Set false to keep a service out of the home banner while it still appears
   *  in the accordion and the Services menu. */
  hero?: boolean;
  banner?: string[];
  headline?: string;
  lede?: string;
  /** The hero slide's pill. Left unset it is the free consultation; a service
   *  whose slide leads to its own page names the label and the path here. */
  cta?: { label: string; href: string };
  /** Plain-text name. `title` may carry HTML entities (it is rendered through
   *  <Html>), which a page heading or a breadcrumb cannot use — React writes a
   *  string verbatim, so "Research &amp; Intelligence" would show its entity. */
  name?: string;
  /** The URL segment under /services/. Kept alongside `href` so a route can
   *  look a service up from a param without parsing the href back apart. */
  slug?: string;
  /** The pages published beneath this service. */
  subs?: SubService[];
}

/**
 * The services a market leads with — the one list behind the UAE home hero, the
 * services accordion below it, and the Services menu in the header. They were
 * written out separately at first and immediately started to disagree, which is
 * exactly the drift this module exists to prevent.
 *
 * India keeps the group's four verticals, unchanged.
 */
export function vxnServices(slug?: string | null): Service[] {
  const region = vxnRegionExists(slug) ? slug : vxnRegionDefault();

  if (region === 'en-ae') {
    /* THE COPY IS THE CLIENT'S (20260911): the names, the accordion sentences
       (`desc`) and the hero slides (`headline`, `lede`, `cta`) are their home
       page document, word for word. Two rules came with it: nothing is added
       to the document or dropped from it, and no em dashes anywhere on the
       UAE pages, so a sentence that needs a break takes a comma or a full
       stop, never a dash. Valuation and research sit out of the hero (hero:
       false), so their headline and lede are still the earlier copy; those
       show on /services/ until that page's document arrives. */
    return [
      {
        title: 'Accounting &amp; Tax Services',
        name: 'Accounting & Tax Services',
        slug: 'accounting-tax-services',
        icon: 'ledger',
        short: 'Accounting &amp; Tax',
        href: '/services/accounting-tax-services/',
        desc: 'From bookkeeping and financial reporting to VAT and Corporate Tax, reliable financial support that keeps your business compliant and decision-ready.',
        img: '/assets/content/uploads/services/accounting-and-tax-services.webp',
        banner: ['banners/uae-slider-5.webp', 'banners/uae-slider-3.webp'],
        headline: 'Financial Clarity. Confident Decisions.',
        lede: 'From bookkeeping and financial reporting to VAT and Corporate Tax, get reliable numbers, compliant processes and clearer financial control.',
        /* The eight named in the client's parent-page document (20260905),
           which is also what /services/accounting-tax-services/ now leads
           with. Three of them are new; the other five keep the slugs they
           already had rather than being renamed to match the new labels,
           because a slug change is a dead URL and the label is the part the
           document actually specifies. So `cfo-services` reads "Part-Time
           CFO", `financial-reporting` reads "Financial Statements", and
           `corporate-tax-services` / `vat-services` take the document's
           narrower names. */
        subs: [
          { name: 'Accounting & Bookkeeping', slug: 'accounting-bookkeeping' },
          { name: 'Part-Time CFO', slug: 'cfo-services' },
          { name: 'Management Reporting', slug: 'management-reporting' },
          { name: 'Budgeting & Forecasting', slug: 'budgeting-forecasting' },
          { name: 'Financial Statements', slug: 'financial-reporting' },
          { name: 'External Audit Support', slug: 'external-audit-support' },
          { name: 'Corporate Tax Filing', slug: 'corporate-tax-services' },
          { name: 'VAT Advisory', slug: 'vat-services' },
        ],
      },
      {
        title: 'Real Estate Transactions',
        name: 'Real Estate Transactions',
        slug: 'real-estate-transactions',
        icon: 'building',
        short: 'Real Estate',
        href: '/services/real-estate-transactions/',
        desc: 'Buy, sell, rent and invest in residential and commercial real estate, with expert advisory and market insight at every step.',
        img: '/assets/content/uploads/services/real-estate-transactions.webp',
        banner: ['banners/uae-slider-1.webp'],
        headline: 'Expert Advisory for Smarter Property Decisions.',
        lede: 'From identifying the right property to navigating the transaction, get expert guidance backed by market insight and investment expertise.',
        cta: { label: 'Explore Real Estate', href: '/services/real-estate-transactions/' },
        subs: [
          { name: 'Buy Property', slug: 'buy-property' },
          { name: 'Sell & Rent/Lease Property', slug: 'sell-rent-lease-property' },
          { name: 'Off-Plan Properties', slug: 'off-plan-properties' },
        ],
      },
      {
        title: 'Mortgage Services',
        name: 'Mortgage Services',
        slug: 'mortgages-services',
        icon: 'key',
        short: 'Mortgages',
        href: '/services/mortgages-services/',
        desc: 'Residential and commercial mortgage solutions, from pre-approval and refinancing to non-resident and Islamic finance, guided from application to completion.',
        img: '/assets/content/uploads/services/mortgage-services.webp',
        banner: ['banners/uae-slider-2.webp'],
        headline: 'Smarter Financing for Every Property Move.',
        lede: 'Navigate residential and commercial mortgages, refinancing and property finance with guidance tailored to your requirements.',
        cta: { label: 'Explore Mortgages', href: '/services/mortgages-services/' },
        subs: [
          { name: 'Residential Mortgages', slug: 'residential-mortgages' },
          { name: 'Commercial Mortgages', slug: 'commercial-mortgages' },
          { name: 'Mortgage Pre-Approval', slug: 'mortgage-pre-approval' },
          { name: 'Refinancing', slug: 'refinancing' },
          { name: 'Non-Resident Mortgages', slug: 'non-resident-mortgages' },
          { name: 'Islamic Finance', slug: 'islamic-finance' },
        ],
      },
      {
        title: 'Valuation &amp; Advisory',
        name: 'Valuation & Advisory',
        slug: 'valuation-and-advisory',
        icon: 'scales',
        short: 'Valuation',
        hero: false,
        href: '/services/valuation-and-advisory/',
        desc: 'Independent valuation of businesses, property, plant, machinery and other assets for transactions, financing, reporting and strategic decisions.',
        img: '/assets/content/uploads/services/valuation-and-advisory.webp',
        banner: ['banners/uae-slider-6.webp', 'banners/uae-slider-4.webp'],
        headline: 'Independent Valuations. Defensible Decisions.',
        lede: 'RICS-regulated property, business and plant valuation through group firm Reliant Surveyors &mdash; method documented to withstand scrutiny, not just review.',
        subs: [
          { name: 'Business Valuation', slug: 'business-valuation' },
          { name: 'Company Valuation', slug: 'company-valuation' },
          { name: 'Plant & Machinery Valuation', slug: 'plant-machinery-valuation' },
          { name: 'Asset Valuation', slug: 'asset-valuation' },
          { name: 'Financial Valuation', slug: 'financial-valuation' },
        ],
      },
      {
        title: 'Research &amp; Intelligence',
        name: 'Research & Intelligence',
        slug: 'research-intelligence',
        icon: 'chart',
        short: 'Research',
        hero: false,
        href: '/services/research-intelligence/',
        desc: 'Market research, feasibility studies and investment intelligence that turn supply, demand, pricing and risk into clearer strategic decisions.',
        img: '/assets/content/uploads/services/research-and-intelligences.webp',
        banner: ['banners/uae-slider-3.webp'],
        headline: 'Evidence Before the Commitment.',
        lede: 'Feasibility studies, highest-and-best-use analysis and market research &mdash; verified data and sound method, before the decision rather than after it.',
        subs: [
          { name: 'Real Estate Research', slug: 'real-estate-research' },
          { name: 'Market Research', slug: 'market-research' },
          { name: 'Investment Research', slug: 'investment-research' },
          { name: 'Feasibility Studies', slug: 'feasibility-studies' },
          { name: 'Market Intelligence', slug: 'market-intelligence' },
          { name: 'Research Reports', slug: 'research-reports' },
        ],
      },
      {
        title: 'Technology, Data &amp; AI',
        name: 'Technology, Data & AI',
        slug: 'technology-data-ai',
        icon: 'chip',
        short: 'Technology &amp; AI',
        href: '/services/technology-data-ai/',
        desc: 'Integrated systems, automation, data and AI solutions designed to streamline operations, improve visibility and enable smarter business decisions.',
        img: '/assets/content/uploads/services/technology-data-ai.webp',
        banner: ['banners/uae-slider-4.webp'],
        headline: 'Intelligent Solutions for Modern Business.',
        lede: 'Transform how your business operates with integrated systems, automation, data intelligence and AI-led solutions.',
        cta: { label: 'Explore Technology', href: '/services/technology-data-ai/' },
        subs: [
          { name: 'Technology Consulting', slug: 'technology-consulting' },
          { name: 'AI Solutions', slug: 'ai-solutions' },
          { name: 'ERP Dashboards', slug: 'erp-dashboards' },
          { name: 'PropTech', slug: 'proptech' },
          { name: 'Enterprise Solutions', slug: 'enterprise-solutions' },
        ],
      },
    ];
  }

  /* India — the group's four verticals. */
  return [
    {
      title: 'Real Estate Investment Advisory',
      icon: 'building',
      short: 'Real Estate Investment Advisory',
      href: '/services/real-estate-investment-advisory/',
      desc: 'Disciplined portfolio strategy and risk analysis to create, preserve, and grow real estate wealth.',
      img: '/assets/content/uploads/new-folder/real-estate-wealth-advisory-1.webp',
    },
    {
      title: 'Capital Advisory',
      icon: 'handshake',
      short: 'Capital Advisory',
      href: '/services/capital-advisory/',
      desc: 'Independent capital structuring &mdash; project funding, debt advisory, equity, joint ventures and syndication.',
      img: '/assets/content/uploads/banners/capital-advisory.webp',
    },
    {
      title: 'Research &amp; Intelligence',
      icon: 'chart',
      short: 'Research &amp; Intelligence',
      href: '/services/research-intelligence/',
      desc: 'Independent, data-driven research and valuation intelligence for clearer investment decisions.',
      img: '/assets/content/uploads/homepage/research-and-intellegance.webp',
    },
    {
      title: 'Technology &amp; AI',
      icon: 'chip',
      short: 'Technology &amp; AI',
      href: '/services/technology-ai/',
      desc: 'Intelligent platforms, analytics and AI systems that turn market data into better decisions.',
      img: '/assets/content/uploads/homepage/technology-and-ai.webp',
    },
  ];
}

/** The service published at /services/<slug>/ in this market, or null. */
export function vxnServiceBySlug(slug: string, region?: string | null): Service | null {
  return vxnServices(region).find((s) => s.slug === slug) ?? null;
}

/** A page published beneath `service`, or null. */
export function vxnSubService(service: Service, slug: string): SubService | null {
  return service.subs?.find((s) => s.slug === slug) ?? null;
}

/**
 * A service name safe to write as text. `title` is authored for <Html> and may
 * carry entities; React would print those literally in a heading or crumb.
 */
export function vxnServiceName(service: Service): string {
  return service.name ?? service.title;
}

/* ---- The flags ------------------------------------------------------------ */

/**
 * Inline SVG flags. Emoji flags are not an option: Windows ships no flag
 * glyphs, so 🇮🇳 renders as the bare letters "IN" in Chrome on the very
 * machines this site is being built on. These are drawn instead, 20×14 with a
 * hairline border so they read correctly on the dark header.
 *
 * Rendered as a component in components/layout/RegionFlag.tsx; the markup is
 * identical to the PHP vxn_region_flag() output.
 */
export function vxnRegionFlagId(slug: string): string {
  return 'vxnflag-' + String(slug).replace(/[^a-z0-9]+/gi, '');
}
