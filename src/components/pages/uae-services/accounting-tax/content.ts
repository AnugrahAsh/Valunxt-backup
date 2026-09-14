/**
 * What /en-ae/services/accounting-tax-services/ says.
 *
 * SOURCE — "VALUNXT ACCOUNTING & TAX SERVICES — FINAL DEVELOPMENT-READY PARENT
 * SERVICE PAGE" (20260905). The copy below is that document; nothing here is
 * written or embellished. Where the document gave both a long form and a short
 * card form of the same service, both are kept — the long form is the decision
 * tool's answer, the short form is the card.
 *
 * WHY THIS PAGE HAS ITS OWN CONTENT MODULE. The other five UAE services share
 * ServicePageBody and the five-section shape in ../content.ts. This one is a
 * fifteen-section commercial page with a comparison table, a decision table, a
 * pricing rail and twelve FAQs; expressing it through the shared template would
 * mean bending the template to fit one page and leaving the other five carrying
 * fields they never set.
 *
 * ORDER IS LOAD-BEARING. The document closes with a development instruction:
 * hero, proof, a short problem statement, then THE EIGHT SERVICE CARDS — "the
 * commercial centre of the page" — and "do not allow generic accounting
 * education to push the eight services down the page". The section order in
 * ServiceTemplateBody follows that, which is why the problem section is three
 * short blocks and not the essay the source could support.
 *
 * SUB-SERVICE LINKS resolve through vxnServices('en-ae'), so every `slug` below
 * exists in that registry and the eight cards cannot point at a 404.
 */

import type { ServiceTemplateContent } from '../template/types';

export interface AtService {
  /** The card's title, and the decision tool's destination label. */
  name: string;
  /** Sub-service slug under /services/accounting-tax-services/. */
  slug: string;
  /** MegaIcon token. */
  icon: string;
  /** The short card headline. */
  cardHead: string;
  /** The short card body. */
  cardText: string;
  /** The long-form promise, used in the expanded detail. */
  head: string;
  /** The long-form body, one paragraph per entry. */
  body: string[];
  bestFor: string;
  outcome: string;
  /** Set where the source carries a scope disclaimer that must travel with it. */
  caveat?: string;
}

export const AT_SERVICES: AtService[] = [
  {
    name: 'Accounting & Bookkeeping',
    slug: 'accounting-bookkeeping',
    icon: 'ledger',
    cardHead: 'Keep Your Books Current',
    cardText:
      'Reliable monthly accounting and reconciliations without building the whole team internally.',
    head: 'Keep Your Books Current Without Building a Full Accounting Team',
    body: [
      'When the books fall behind, reporting, tax and management visibility become harder.',
      'Valunxt manages day-to-day accounting, reconciliations and financial-record maintenance so the business has a more reliable financial foundation.',
    ],
    bestFor: 'Startups, SMEs and growing businesses needing regular accounting support.',
    outcome: 'Know where the business stands without waiting until year-end.',
  },
  {
    name: 'Part-Time CFO',
    slug: 'cfo-services',
    icon: 'handshake',
    cardHead: 'Get CFO-Level Thinking',
    cardText:
      'Senior financial judgement for cash, growth and bigger management decisions.',
    head: 'Get CFO-Level Thinking Without a Full-Time CFO',
    body: [
      'As a business grows, management starts facing bigger questions around cash, financing, budgets, expansion and financial decisions.',
      'Part-Time CFO support brings senior finance judgement into those conversations without immediately requiring a permanent CFO.',
    ],
    bestFor: 'Businesses that have outgrown basic accounting.',
    outcome: 'Bring senior financial judgement into bigger business decisions.',
  },
  {
    name: 'Management Reporting',
    slug: 'management-reporting',
    icon: 'chart',
    cardHead: 'Turn Numbers Into Decisions',
    cardText:
      'Understand what changed, why it changed and what needs attention next.',
    head: 'Turn Accounting Data Into Decisions',
    body: [
      'Your accounts tell you the result.',
      'Management reporting helps explain what changed, why it changed and what deserves attention next.',
      'Valunxt turns accounting data into decision-focused financial information for leadership.',
    ],
    bestFor: 'Businesses needing better management visibility.',
    outcome: 'Get financial information early enough to act on.',
  },
  {
    name: 'Budgeting & Forecasting',
    slug: 'budgeting-forecasting',
    icon: 'chart',
    cardHead: 'Plan Before You Commit',
    cardText: 'Build a forward view of revenue, costs, cash and business scenarios.',
    head: 'Stop Managing the Future With Last Month’s Numbers',
    body: [
      'Hiring, expansion, investment and cash decisions happen before the final result is known.',
      'Budgets and forecasts help management understand possible revenue, costs, cash requirements and business scenarios before decisions are locked in.',
    ],
    bestFor: 'Businesses planning growth or major financial decisions.',
    outcome: 'Understand where the business may be heading—not only where it has been.',
  },
  {
    name: 'Financial Statements',
    slug: 'financial-reporting',
    icon: 'document',
    cardHead: 'Financials You Can Rely On',
    cardText:
      'Structured preparation and review of financial statements and supporting schedules.',
    head: 'Financial Statements Management Can Rely On',
    body: [
      'Valunxt supports the preparation and review of financial statements and supporting schedules based on properly maintained accounting records and applicable reporting requirements.',
    ],
    bestFor:
      'Businesses needing structured financial statements for management and relevant stakeholders.',
    outcome: 'Present the company’s financial position more clearly and consistently.',
  },
  {
    name: 'External Audit Support',
    slug: 'external-audit-support',
    icon: 'shield',
    cardHead: 'Be Ready Before the Audit Starts',
    cardText:
      'Prepare reconciliations, schedules and supporting information before audit pressure begins.',
    head: 'Don’t Start Preparing for the Audit After the Auditor Arrives',
    body: [
      'External audits become harder when reconciliations are unresolved, schedules are incomplete or supporting information is difficult to locate.',
      'Valunxt sits on your side of the audit process, helping finance prepare schedules, reconciliations and supporting information and manage auditor queries.',
    ],
    bestFor: 'Businesses preparing for an external audit.',
    outcome: 'Reduce last-minute finance disruption and make the audit easier to manage.',
    /* The source states this immediately under the service and again in the
       FAQ. It is a scope limit, not a marketing line, so it travels with the
       service wherever the service is shown. */
    caveat: 'Valunxt supports the audit. It does not act as the statutory external auditor.',
  },
  {
    name: 'Corporate Tax Filing',
    slug: 'corporate-tax-services',
    icon: 'scales',
    cardHead: 'Start With the Numbers Behind the Return',
    cardText: 'Connect Corporate Tax filing with the financial information underneath it.',
    head: 'Corporate Tax Filing Starts With the Numbers Behind the Return',
    body: [
      'A Corporate Tax Return is not simply a form.',
      'It begins with the financial records and accounting result behind the calculation.',
      'Valunxt supports preparation, review and filing based on the applicable scope and financial information.',
    ],
    bestFor: 'UAE businesses preparing for Corporate Tax filing.',
    outcome: 'Improve filing preparedness and reduce last-minute Corporate Tax pressure.',
  },
  {
    name: 'VAT Advisory',
    slug: 'vat-services',
    icon: 'ledger',
    cardHead: 'Connect VAT With the Transactions Behind It',
    cardText:
      'Bring greater consistency between accounting records, evidence and VAT reporting.',
    head: 'VAT Compliance Depends on More Than the Return',
    body: [
      'VAT starts with the underlying transactions—sales, purchases, invoices, payments and supporting evidence.',
      'Valunxt supports VAT compliance and advisory requirements while connecting the VAT position with the accounting records behind it.',
    ],
    bestFor: 'UAE businesses needing VAT compliance or specialist guidance.',
    outcome: 'Improve consistency between transactions, books and VAT reporting.',
  },
];

/* ---- Hero ---------------------------------------------------------------- */

export const AT_HERO = {
  head: 'Accounting & Tax Services in Dubai for Growing Businesses',
  lede: 'From monthly bookkeeping and financial reporting to VAT, Corporate Tax, forecasting and CFO-level support, Valunxt brings the finance capabilities growing UAE businesses need together under one team.',
  sub: 'Get the books right. Understand the numbers. Plan ahead. Stay tax-ready. Add senior finance support when you need it.',
  chips: ['Fixed-fee scope agreed upfront', 'Bookkeeping from AED 2,000/month'],
  primary: { label: 'Book a Free Consultation', href: '/free-consultation/' },
  secondary: { label: 'Explore Our Services', href: '#at-services' },
};

/* ---- Commercial proof ---------------------------------------------------- */

export const AT_PROOF: { label: string; note: string; icon: string }[] = [
  { label: 'Fixed-fee scope', note: 'Agreed before work begins', icon: 'ledger' },
  { label: 'Dubai-based', note: 'Supporting businesses across the UAE', icon: 'globe' },
  {
    label: 'Accounting + tax + reporting',
    note: 'Connected finance capability',
    icon: 'chart',
  },
  {
    label: 'Senior finance support',
    note: 'Available as your needs grow',
    icon: 'handshake',
  },
];

/* ---- The banner ----------------------------------------------------------
   AT_PROBLEM — the head, the lede, the six questions and the turn — was removed
   with the section that rendered it. The section is a banner card now: one
   heading, one paragraph, one button. Keeping the questions here unrendered
   would be dead content, which is content someone eventually edits believing it
   is on the page.

   PLACEHOLDER, AWAITING CLIENT COPY. Both strings below say only what the page
   already says elsewhere, sized to the banner's shape — a title and a single
   paragraph of roughly forty words. Replace them here and the section follows;
   nothing else reads these two fields. */
export const AT_BANNER = {
  head: 'The Finance Agenda from the Valunxt Accounting & Tax Team',
  body:
    'Our accounting and tax practice brings bookkeeping, reporting, VAT and Corporate Tax together under one team, so a growing UAE business has a single finance function behind it rather than a set of separate suppliers.',
  cta: { label: 'Learn more', href: '#at-services' },
};

/* ---- The finance journey ------------------------------------------------- */

export const AT_JOURNEY: { stage: string; head: string; service: string; note: string }[] = [
  {
    stage: 'Foundation',
    head: 'Get the Books Right',
    service: 'Accounting & Bookkeeping',
    note: 'Reliable accounting creates the financial foundation.',
  },
  {
    stage: 'Visibility',
    head: 'Understand Performance',
    service: 'Financial Statements + Management Reporting',
    note: 'Turn the records into clearer information about performance.',
  },
  {
    stage: 'Planning',
    head: 'Look Ahead',
    service: 'Budgeting & Forecasting',
    note: 'Use the financial foundation to plan revenue, spending and cash requirements.',
  },
  {
    stage: 'Leadership',
    head: 'Support Bigger Decisions',
    service: 'Part-Time CFO',
    note: 'Bring senior financial judgement into management decisions.',
  },
];

export const AT_JOURNEY_RAIL = {
  kicker: 'Running alongside the entire finance process',
  head: 'VAT + Corporate Tax',
  body: [
    'Tax requirements do not begin after a business reaches a particular finance stage.',
    'They can run alongside the financial process from the underlying transaction and accounting record through reporting, planning and filing.',
  ],
  close: 'One Financial Foundation. More Capability as You Grow.',
};

/* ---- Find the right solution --------------------------------------------
   The three-tab chooser. It carries NO COPY OF ITS OWN: the tab labels are the
   journey's own heads, each intro is that stage's own note, and the items are
   AT_SERVICES entries named by slug — so editing a service's card text edits
   it here too and the two can never drift apart.

   THE GROUPING IS THE ONE JUDGEMENT IN THIS BLOCK. The source document gives
   eight services and four journey stages; it does not group them into three.
   Books-and-reporting, tax-and-audit, planning-and-leadership is the split that
   falls out of the journey — Foundation and Visibility together, the tax rail
   that runs alongside them, then Planning and Leadership. It is the thing to
   change if the client wants a different set of tabs.

   Two items in the last tab, not three, because that is how many services the
   document puts there. The template renders what the array holds. */
export const AT_SOLUTION: { tab: string; intro: string; slugs: string[] }[] = [
  {
    tab: AT_JOURNEY[0].head,
    intro: `${AT_JOURNEY[0].note} ${AT_JOURNEY[1].note}`,
    slugs: ['accounting-bookkeeping', 'financial-reporting', 'management-reporting'],
  },
  {
    tab: AT_JOURNEY_RAIL.head,
    intro: AT_JOURNEY_RAIL.body.join(' '),
    slugs: ['corporate-tax-services', 'vat-services', 'external-audit-support'],
  },
  {
    tab: AT_JOURNEY[3].head,
    intro: `${AT_JOURNEY[2].note} ${AT_JOURNEY[3].note}`,
    slugs: ['budgeting-forecasting', 'cfo-services'],
  },
];

/* Read by the intro band's heading, and the last survivor of the WHY block
   that used to sit above it. */
export const AT_WHY_CLOSE = 'One Finance Partner from Bookkeeping to Boardroom Decisions.';

/* ---- Closing ------------------------------------------------------------- */

export const AT_CLOSE = {
  head: 'Start with the finance problem you need solved today.',
  lede: 'Whether you need monthly bookkeeping, better management information, help planning ahead, VAT or Corporate Tax support, audit preparation or CFO-level guidance, Valunxt can help identify the right place to start.',
  primary: { label: 'Book a Free Accounting & Tax Consultation', href: '/free-consultation/' },
  secondary: { label: 'Explore Our Services', href: '#at-services' },
  tertiary: { label: 'Request Fixed-Fee Pricing', href: '/contact/' },
  /* The source's final positioning block, kept as the last thing on the page. */
  positioning: [
    'Accounting is the foundation.',
    'Reporting creates visibility.',
    'Forecasting helps you plan.',
    'Tax runs through the financial process.',
    'CFO support helps management decide what comes next.',
  ],
  positioningClose: 'One Finance Partner—from Bookkeeping to Boardroom Decisions.',
};

/* ---- The photographs ------------------------------------------------------
   A photograph per service, for the strip. Same candidate convention as the
   rest of the market: a purpose-shot filename first, an existing library
   photograph behind it, so commissioning eight proper shots is a drop into
   uploads/services/ and no code change at all.

   The library files are picked for what they show, not for what they are
   called — services-2 is the one abstract of the eight because forecasting
   has nothing literal to photograph. accounting-and-tax-services.webp is not
   used here: it is the 6206x3888 original, and the chooser already spends it. */
const EXPLORE_FIGURE: Record<string, string[]> = {
  'accounting-bookkeeping': ['services/at-explore-accounting-bookkeeping.webp', 'new-folder/services-1.webp'],
  'cfo-services': ['services/at-explore-cfo-services.webp', 'new-folder/client-success-2.webp'],
  'management-reporting': ['services/at-explore-management-reporting.webp', 'new-folder/services-3.webp'],
  'budgeting-forecasting': ['services/at-explore-budgeting-forecasting.webp', 'new-folder/services-2.webp'],
  'financial-reporting': ['services/at-explore-financial-reporting.webp', 'new-folder/insights-2.webp'],
  'external-audit-support': ['services/at-explore-external-audit-support.webp', 'new-folder/insights-3.webp'],
  'corporate-tax-services': ['services/at-explore-corporate-tax-services.webp', 'homepage/client-2.webp'],
  'vat-services': ['services/at-explore-vat-services.webp', 'new-folder/insights-1.webp'],
};

/* ---- The page, as the template reads it -----------------------------------
   Everything above is the source document, kept in its own shape because the
   decision tool, the journey and the FAQs may come back. This is the one
   object ServiceTemplateBody renders; the other five services write theirs
   directly in this shape. See ../template/types.ts.

   THE HERO PHOTOGRAPH IS THE BOOKKEEPING SUB-PAGE'S, by request: the client
   asked for this banner to be the same as that page's, and the same plate is
   the plainest reading of "same". services/accounting-tax-hero.webp takes over
   the moment it exists. */
export const ACCOUNTING_TAX_TEMPLATE: ServiceTemplateContent = {
  slug: 'accounting-tax-services',
  crumb: 'Accounting & Tax',
  hero: {
    head: AT_HERO.head,
    sub: AT_HERO.sub,
    image: ['banners/services-banner.webp', 'services/accounting-tax-hero.webp', 'banners/service-main.webp'],
    alt: 'A meeting at dusk against a city skyline',
  },
  intro: {
    head: AT_WHY_CLOSE,
    lede: AT_HERO.lede,
    proof: AT_PROOF.map(({ label, note }) => ({ label, note })),
    chips: AT_HERO.chips,
    primary: AT_HERO.primary,
    secondary: AT_HERO.secondary,
    /* who-we-are-2 is the one library shot with Valunxt's own branding in it;
       services-1 shows at the top of the strip, and the same photograph twice
       inside one screen of scrolling read as a mistake. */
    image: ['services/accounting-tax-intro.webp', 'new-folder/who-we-are-2.webp'],
  },
  strip: {
    kicker: 'Explore services',
    head: 'Find the finance support your business needs',
    lede: 'Start with the problem you need solved today. Add more capability as your business grows.',
    cta: 'Ready to get started?',
    subs: AT_SERVICES.map((s) => ({
      name: s.name,
      slug: s.slug,
      cardText: s.cardText,
      figure: EXPLORE_FIGURE[s.slug] ?? [],
    })),
  },
  solution: {
    head: 'Find the Right Solution',
    tabs: AT_SOLUTION,
    images: [
      ['services/accounting-and-tax-services.webp'],
      ['new-folder/about-us-1.webp'],
      ['new-folder/who-we-are-1.webp'],
    ],
  },
  banner: {
    ...AT_BANNER,
    /* uae-slider-3 is a pale periwinkle field with a bright blue glass form in
       its right two-thirds, so the card reads dark-to-light across the join
       rather than blue-into-blue — and its left third is a flat field, which
       is the third sitting against the ramp's edge. */
    image: ['services/accounting-tax-banner.webp', 'banners/uae-slider-3.webp'],
  },
  related: { head: 'Explore Related Services' },
  close: {
    head: AT_CLOSE.head,
    lede: AT_CLOSE.lede,
    primary: AT_CLOSE.primary,
    /* A meeting, not a desk: the section asks the reader to talk to someone. */
    image: ['services/accounting-tax-talk.webp', 'new-folder/career-1.webp'],
  },
};
