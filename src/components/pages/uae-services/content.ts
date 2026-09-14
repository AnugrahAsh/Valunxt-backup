/**
 * What each written UAE service page says.
 *
 * ServicePageBody renders the layout; everything below is the copy, the tiles
 * and the artwork that differ between the six services.
 *
 * SOURCES — all prose is taken from valunxt.com rather than written here:
 *   home page              the firm statement, the commitments, "You'll Always
 *                          Know Where You Stand", "Six practices. Forty-five
 *                          services. One accountable partner."
 *   /services/accounting-and-bookkeeping   the accounting prose and its services
 *   /services/corporate-tax-uae            the tax services
 *   /services/capital-markets              transactions and mortgage services
 *   /services/valuation-advisory           the valuation services
 *   /services/consulting                   research and feasibility services
 *   /services/technology-consulting        the technology services
 *
 * The `head` of each page mirrors that service's `headline` in vxnServices() so
 * the page and the UAE home hero lead with the same line.
 *
 * FIGURES are counts, never outcomes. valunxt.com publishes service counts and
 * per-practice totals; its one outcome figure ("AED 0 in FTA penalties") belongs
 * to a single case study and is deliberately absent — as a headline on a
 * regulated advisory firm's services page it would read as a general promise.
 *
 * ARTWORK is existing library photography. Every entry names a purpose-shot
 * filename first, so dropping that file into uploads replaces the stand-in with
 * no code change; a market can override either under uploads/regions/<slug>/.
 */

export interface ServiceCapability {
  /** Shown on the tile. */
  name: string;
  /** Preferred artwork first, current library stand-in last. */
  img: string[];
}

export interface ServiceHighlight {
  figure: string;
  label: string;
  note: string;
}

export interface ServicePageContent {
  eyebrow: string;
  head: string;
  intro: string[];
  capHead: string;
  capLede: string;
  /** Four tiles a row, or three when the service has six of them. */
  capColumns: 3 | 4;
  capabilities: ServiceCapability[];
  glass: {
    eyebrow: string;
    head: string;
    text: string;
    img: string[];
  };
  highlightsIntro: string;
  highlights: ServiceHighlight[];
}

/** Repeated on every page's highlights block; it is a statement about the firm. */
const FIRM_SPREAD =
  'Six practices. Forty-five services. One accountable partner. This practice sits alongside ' +
  'RICS-regulated valuation and evidence-led advisory under one roof, from Dubai to Noida to Mumbai.';

const SERVICES_ACROSS_PRACTICES: ServiceHighlight = {
  figure: '45',
  label: 'Services across six practices',
  note: 'One accountable partner for every one of them',
};

const PRACTICES: ServiceHighlight = {
  figure: '6',
  label: 'Practices under one roof',
  note: 'Accounting, tax, valuation, capital, research and technology',
};

export const UAE_SERVICE_CONTENT: Record<string, ServicePageContent> = {
  'accounting-tax-services': {
    eyebrow: 'Accounting & Tax Services',
    head: 'Accounting that Inspires Confident Decisions.',
    intro: [
      'We’re a senior team of accountants, tax advisers and valuers dedicated to one thing: numbers you can act on without second-guessing. Part of the Reliant Surveyors group — RICS-regulated valuation and evidence-led advisory under one roof, from Dubai to Noida to Mumbai. Fixed fees agreed before work begins, a partner who answers when you call, and positions documented as if the audit letter arrives tomorrow.',
      'Good decisions start with clean books. We maintain your accounts to IFRS standards, reconcile every figure and report with clarity — from day-to-day bookkeeping to part-time CFO leadership, audit support and board-ready financial statements.',
    ],
    capHead: 'Accounting and tax, handled end to end',
    capLede:
      'From day-to-day bookkeeping to corporate tax filing — one senior team, one standard of evidence, and every position documented as if the audit letter arrives tomorrow.',
    capColumns: 4,
    capabilities: [
      {
        name: 'Accounting & Bookkeeping Outsourcing',
        img: [
          'services/accounting-bookkeeping-outsourcing.webp',
          'new-folder/research-intelligence-1.webp',
        ],
      },
      { name: 'Part-Time CFO Service', img: ['services/part-time-cfo.webp', 'new-folder/who-we-are-1.webp'] },
      { name: 'Management Reporting', img: ['services/management-reporting.webp', 'new-folder/services-3.webp'] },
      { name: 'Budgeting & Forecasting', img: ['services/budgeting-forecasting.webp', 'new-folder/services-2.webp'] },
      {
        name: 'Preparation & Review of Financial Statements',
        img: ['services/financial-statements.webp', 'new-folder/services-4.webp'],
      },
      { name: 'External Audit Support', img: ['services/external-audit-support.webp', 'new-folder/services-1.webp'] },
      { name: 'Corporate Tax Return Filing', img: ['services/corporate-tax-filing.webp', 'new-folder/who-we-are-2.webp'] },
      { name: 'VAT Advisory', img: ['services/vat-advisory.webp', 'new-folder/who-we-are-3.webp'] },
    ],
    glass: {
      eyebrow: 'Why Valunxt',
      head: 'You’ll Always Know Where You Stand',
      text: 'We are transparent like that. Fixed fees, no gimmicks.',
      img: ['services/accounting-tax-banner.webp', 'homepage/abstract-1.webp'],
    },
    highlightsIntro: FIRM_SPREAD,
    highlights: [
      {
        figure: '7',
        label: 'Accounting & bookkeeping services',
        note: 'Day-to-day books through to board-ready statements',
      },
      {
        figure: '17',
        label: 'Tax advisory services',
        note: 'Corporate tax and VAT, registration through to defence',
      },
      SERVICES_ACROSS_PRACTICES,
    ],
  },

  'real-estate-transactions': {
    eyebrow: 'Real Estate Transactions',
    head: 'Property Decisions, Independently Advised.',
    intro: [
      'Financing, M&A and transaction advisory across the UAE — structured on evidence and negotiated with one interest represented: yours. We hold no inventory, so the advice you get on a building is the advice we would take ourselves.',
      'Sourcing, acquisition and disposal across residential and commercial property, with diligence, pricing and deal management handled by the same team that values the asset — in Dubai, Abu Dhabi and beyond.',
    ],
    capHead: 'Every stage of the transaction, on your side of the table',
    capLede:
      'Diligence, pricing and deal management across property and investments, with RICS-compliant valuation through group firm Reliant Surveyors behind every number.',
    capColumns: 3,
    capabilities: [
      { name: 'Buy Property', img: ['services/buy-property.webp', 'homepage/industry-2.webp'] },
      { name: 'Sell & Rent/Lease Property', img: ['services/sell-rent-lease.webp', 'new-folder/who-we-are-2.webp'] },
      { name: 'Off-Plan Properties', img: ['services/off-plan.webp', 'new-folder/client-success-1.webp'] },
      { name: 'Transaction Advisory', img: ['services/transaction-advisory.webp', 'new-folder/services-1.webp'] },
      { name: 'Leasing Advisory', img: ['services/leasing-advisory.webp', 'new-folder/who-we-are-1.webp'] },
      { name: 'Property Valuation', img: ['services/property-valuation.webp', 'new-folder/who-we-are-3.webp'] },
    ],
    glass: {
      eyebrow: 'Why Valunxt',
      head: 'One Interest Represented: Yours',
      text: 'No inventory behind the advice, and no side of the table but yours.',
      img: ['services/real-estate-banner.webp', 'homepage/building-real-esate.webp', 'homepage/industry-2.webp'],
    },
    highlightsIntro: FIRM_SPREAD,
    highlights: [
      {
        figure: '9',
        label: 'Capital markets services',
        note: 'Buy-side and sell-side through to leasing, from one desk',
      },
      PRACTICES,
      SERVICES_ACROSS_PRACTICES,
    ],
  },

  'mortgages-services': {
    eyebrow: 'Mortgages Services',
    head: 'Funding Structured Around Your Position.',
    intro: [
      'Property finance structured, packaged and negotiated with UAE lenders — whole-of-market, for resident, non-resident and corporate borrowers alike. Terms are argued on the evidence, not on whichever lender happens to be closest.',
      'The same desk handles corporate loan advisory, structured debt across banks and private credit, and equity where debt is the wrong answer — so the question of how a purchase should be funded is settled before it becomes urgent.',
    ],
    capHead: 'Whole-of-market, whatever your position',
    capLede:
      'Working capital and term facilities your business can actually service, and property finance packaged so a lender can say yes quickly.',
    capColumns: 3,
    capabilities: [
      { name: 'Residential Mortgages', img: ['services/residential-mortgages.webp', 'homepage/industry-2.webp'] },
      { name: 'Commercial Mortgages', img: ['services/commercial-mortgages.webp', 'new-folder/who-we-are-3.webp'] },
      { name: 'Mortgage Pre-Approval', img: ['services/mortgage-pre-approval.webp', 'new-folder/services-1.webp'] },
      { name: 'Refinancing', img: ['services/refinancing.webp', 'new-folder/research-intelligence-1.webp'] },
      { name: 'Non-Resident Mortgages', img: ['services/non-resident-mortgages.webp', 'new-folder/who-we-are-1.webp'] },
      { name: 'Islamic Finance', img: ['services/islamic-finance.webp', 'new-folder/who-we-are-2.webp'] },
    ],
    glass: {
      eyebrow: 'Why Valunxt',
      head: 'Terms Negotiated on the Evidence',
      text: 'Property finance structured, packaged and negotiated with UAE lenders.',
      img: ['services/mortgages-banner.webp', 'new-folder/about-us-banner.webp'],
    },
    highlightsIntro: FIRM_SPREAD,
    highlights: [
      {
        figure: '9',
        label: 'Capital markets services',
        note: 'Mortgage, corporate, debt and equity advisory in one place',
      },
      SERVICES_ACROSS_PRACTICES,
      PRACTICES,
    ],
  },

  'valuation-and-advisory': {
    eyebrow: 'Valuation and Advisory',
    head: 'Independent Valuations. Defensible Decisions.',
    intro: [
      'Independent, evidence-led valuations of businesses, property, plant and machinery — built to withstand scrutiny from banks, auditors and investors.',
      'RICS-compliant real estate valuation runs through group firm Reliant Surveyors, and the method behind every figure is documented rather than asserted — so a number holds up when it is questioned, not just when it is read.',
    ],
    capHead: 'Valuations built to withstand scrutiny',
    capLede:
      'Defensible company valuations for deals, disputes and reporting; industrial asset valuations for lending, insurance and reporting; and senior counsel on the decisions that shape the business.',
    capColumns: 3,
    capabilities: [
      { name: 'Business Valuation', img: ['services/business-valuation.webp', 'new-folder/research-intelligence-1.webp'] },
      { name: 'Company Valuation', img: ['services/company-valuation.webp', 'new-folder/services-1.webp'] },
      {
        name: 'Plant & Machinery Valuation',
        img: ['services/plant-machinery-valuation.webp', 'homepage/industry-3.webp'],
      },
      { name: 'Asset Valuation', img: ['services/asset-valuation.webp', 'new-folder/who-we-are-3.webp'] },
      { name: 'Financial Valuation', img: ['services/financial-valuation.webp', 'new-folder/services-2.webp'] },
      { name: 'Property Valuation', img: ['services/property-valuation.webp', 'homepage/industry-2.webp'] },
    ],
    glass: {
      eyebrow: 'Why Valunxt',
      head: 'Founded on the Standard That Every Number Must Hold Up.',
      text: 'Built to withstand scrutiny from banks, auditors and investors.',
      img: ['services/valuation-banner.webp', 'new-folder/who-we-are-3.webp'],
    },
    highlightsIntro: FIRM_SPREAD,
    highlights: [
      {
        figure: '4',
        label: 'Valuation & advisory services',
        note: 'Business, property, plant and machinery, plus senior counsel',
      },
      PRACTICES,
      SERVICES_ACROSS_PRACTICES,
    ],
  },

  'research-intelligence': {
    eyebrow: 'Research & Intelligence',
    head: 'Evidence Before the Commitment.',
    intro: [
      'Before capital is committed, the questions deserve real answers. Our consulting team delivers feasibility studies, real estate market research, highest-and-best-use analysis, financial accounting advisory and complete UAE business setup support.',
      'Supply, demand and pricing evidence for UAE property decisions — gathered, tested and quantified, so what should this land become is a question with a defended answer rather than an opinion.',
    ],
    capHead: 'Questions answered before the money moves',
    capLede:
      'Bankable feasibility studies before capital is committed, and the market evidence to support what the study concludes.',
    capColumns: 3,
    capabilities: [
      { name: 'Real Estate Research', img: ['services/real-estate-research.webp', 'homepage/industry-2.webp'] },
      { name: 'Market Research', img: ['services/market-research.webp', 'new-folder/services-3.webp'] },
      { name: 'Investment Research', img: ['services/investment-research.webp', 'new-folder/services-2.webp'] },
      { name: 'Feasibility Studies', img: ['services/feasibility-studies.webp', 'new-folder/research-intelligence-1.webp'] },
      { name: 'Market Intelligence', img: ['services/market-intelligence.webp', 'new-folder/research-intelligence-2.webp'] },
      { name: 'Research Reports', img: ['services/research-reports.webp', 'new-folder/services-1.webp'] },
    ],
    glass: {
      eyebrow: 'Why Valunxt',
      head: 'The Questions Deserve Real Answers',
      text: 'Tested, compared and quantified — before capital is committed.',
      img: ['services/research-banner.webp', 'homepage/research-and-intellegance.webp'],
    },
    highlightsIntro: FIRM_SPREAD,
    highlights: [
      {
        figure: '5',
        label: 'Consulting services',
        note: 'Feasibility, market research, highest-and-best-use and advisory',
      },
      PRACTICES,
      SERVICES_ACROSS_PRACTICES,
    ],
  },

  'technology-data-ai': {
    eyebrow: 'Technology, Data & AI',
    head: 'Technology that Turns Finance into Advantage.',
    intro: [
      'Digital transformation, cloud-era enterprise solutions and performance marketing — technology in service of the business case, never the other way round.',
      'ERP, accounting and core systems migrated to the cloud with finance-grade discipline: governed, measured, and redesigned around value you can point at rather than activity you can count.',
    ],
    capHead: 'Systems that finance can stand behind',
    capLede:
      'Customer journeys and operations redesigned around measurable value, and core systems moved to the cloud with the same discipline we apply to a set of books.',
    capColumns: 3,
    capabilities: [
      { name: 'Technology Consulting', img: ['services/technology-consulting.webp', 'new-folder/services-1.webp'] },
      { name: 'AI Solutions', img: ['services/ai-solutions.webp', 'new-folder/services-4.webp'] },
      { name: 'ERP Dashboards', img: ['services/erp-dashboards.webp', 'new-folder/services-2.webp'] },
      { name: 'PropTech', img: ['services/proptech.webp', 'homepage/industry-2.webp'] },
      { name: 'Enterprise Solutions', img: ['services/enterprise-solutions.webp', 'homepage/industry-3.webp'] },
      { name: 'Cloud Transformation', img: ['services/cloud-transformation.webp', 'new-folder/technology-ai-1.webp'] },
    ],
    glass: {
      eyebrow: 'Why Valunxt',
      head: 'Technology in Service of the Business Case',
      text: 'Measured on pipeline and outcomes, not impressions and activity.',
      img: ['services/technology-banner.webp', 'homepage/technology-and-ai.webp'],
    },
    highlightsIntro: FIRM_SPREAD,
    highlights: [
      {
        figure: '4',
        label: 'Technology consulting services',
        note: 'Transformation, enterprise systems, cloud and performance marketing',
      },
      PRACTICES,
      SERVICES_ACROSS_PRACTICES,
    ],
  },
};
