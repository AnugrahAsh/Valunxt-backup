/**
 * The three L2 service pages.
 *
 * Each is one `ServicePage` record rendered by components/ServicePageBody.tsx.
 * Adding a fourth page means adding a record here and a route file — no new
 * component, no new CSS.
 *
 * These are SEO landing pages, so each carries its own FAQ set rather than
 * reusing the pillar page's: the questions a seller asks are not the questions
 * an off-plan buyer asks, and duplicated FAQ blocks compete with each other.
 */
import type { ServicePage } from '../lib/types';
import { SECTOR_PAGES } from './service-pages-2';

const BUY: ServicePage = {
  slug: 'buy-property',
  eyebrow: 'Buy Property',
  title: 'Find the Right Property,',
  titleAccent: 'Backed by Real Evidence.',
  lede: 'A curated selection of residential and commercial property across Dubai — matched to your requirements, budget and lifestyle, with independent advice at every step.',
  heroImg: '/assets/content/uploads/services/mortgages-hero.webp',
  highlights: [
    { value: '50K+', label: 'Verified listings', detail: 'Across Dubai’s prime and emerging communities.' },
    { value: 'RICS', label: 'Aligned valuations', detail: 'So the price you pay is the price it is worth.' },
    { value: '0', label: 'Inventory of our own', detail: 'We have nothing to push. The advice is yours.' },
  ],
  offerTitle: 'What Buying With Us Includes',
  offerLede:
    'From the first shortlist to the handover of keys, every stage is handled by the same team — so nothing is lost between one specialist and the next.',
  offer: [
    {
      title: 'Requirement Mapping',
      summary: 'We start with the brief, not the listings.',
      bullets: ['Budget, yield and timeline set out clearly', 'Community and building comparison', 'Financing capacity established upfront'],
    },
    {
      title: 'Curated Shortlist',
      summary: 'A shortlist you can act on, not a portal dump.',
      bullets: ['Verified availability and pricing', 'Accompanied viewings arranged', 'Trade-offs stated in writing'],
    },
    {
      title: 'Due Diligence',
      summary: 'What the listing does not tell you.',
      bullets: ['Title and encumbrance checks', 'Service charge history', 'Developer and building track record'],
    },
    {
      title: 'Negotiation & Offer',
      summary: 'Terms argued from evidence.',
      bullets: ['Comparable-backed offer strategy', 'Payment plan structuring', 'MOU drafted and reviewed'],
    },
    {
      title: 'Mortgage Support',
      summary: 'Whole-of-market, not one lender.',
      bullets: ['Offers compared across UAE lenders', 'Pre-approval managed for you', 'Rate, tenure and fees side by side'],
    },
    {
      title: 'Transfer & Handover',
      summary: 'Through to the keys in your hand.',
      bullets: ['DLD formalities managed', 'Snagging coordinated', 'Utilities and Ejari where relevant'],
    },
  ],
  stepsTitle: 'How a Purchase Runs',
  steps: [
    { number: '01', title: 'Consultation', body: 'We establish your objectives, budget and financing position before looking at a single property.' },
    { number: '02', title: 'Shortlist & Viewings', body: 'You receive a shortlist of verified properties with the reasoning attached, and we arrange the viewings.' },
    { number: '03', title: 'Offer & Due Diligence', body: 'We negotiate on comparable evidence and verify title, charges and developer record before you commit.' },
    { number: '04', title: 'Transfer & Handover', body: 'We manage financing, DLD transfer and snagging through to handover.' },
  ],
  faqs: [
    { q: 'Can I buy property in Dubai as a non-resident?', a: 'Yes. Non-residents can buy freehold property in designated areas. You will need a valid passport; residency is not required to own, and we can manage the whole purchase remotely if you are overseas.' },
    { q: 'What are the total costs beyond the purchase price?', a: 'Budget for the DLD transfer fee, trustee office fee, agency commission and, where financing is used, mortgage registration and bank arrangement fees. We set the full figure out in writing before you make an offer.' },
    { q: 'How long does a purchase take?', a: 'A cash purchase can complete within two to four weeks of a signed MOU. With a mortgage, allow four to six weeks to accommodate valuation and final offer issuance.' },
    { q: 'Do you charge buyers a fee?', a: 'Agency commission is disclosed and agreed in writing before any offer is submitted. There are no fees that appear later in the process.' },
  ],
  ctaTitle: 'Start With a Shortlist, Not a Sales Pitch',
  ctaBody: 'Tell us the brief and we will come back with properties that actually fit it — and the reasoning behind each one.',
};

const SELL: ServicePage = {
  slug: 'sell-rent-lease-property',
  eyebrow: 'Sell, Rent & Lease',
  title: 'Sell or Let With',
  titleAccent: 'Full Visibility.',
  lede: "From understanding your property's true value to connecting with the right buyer or tenant, we run a transparent process and keep you informed at every stage.",
  heroImg: '/assets/content/uploads/services/sub/real-estate-transactions/sell-rent-lease-property-hero.webp',
  highlights: [
    { value: 'Ejari', label: 'Registration handled', detail: 'Contracts and registration managed end to end.' },
    { value: 'Remote', label: 'Landlords welcome', detail: 'Let and manage from overseas without travelling.' },
    { value: 'Evidence', label: 'Led pricing', detail: 'Asking price argued from comparables, not optimism.' },
  ],
  offerTitle: 'What We Handle For You',
  offerLede:
    'Selling and letting share the same problem: pricing it right, reaching qualified people, and closing without surprises. Both are run the same disciplined way.',
  offer: [
    {
      title: 'Valuation & Pricing',
      summary: 'An asking price you can defend.',
      bullets: ['Comparable evidence assembled', 'RICS & RERA-aligned methodology', 'Realistic time-to-sell stated'],
    },
    {
      title: 'Marketing',
      summary: 'Presented to the people who actually buy.',
      bullets: ['Professional photography and floor plans', 'Portal and off-market distribution', 'Qualified enquiry filtering'],
    },
    {
      title: 'Viewings',
      summary: 'Managed, accompanied, reported.',
      bullets: ['Accompanied viewings arranged', 'Feedback reported after each one', 'Strategy adjusted on the evidence'],
    },
    {
      title: 'Negotiation',
      summary: 'Your position, argued properly.',
      bullets: ['Offers presented with context', 'Buyer or tenant financials verified', 'Terms negotiated in your interest'],
    },
    {
      title: 'Tenancy Management',
      summary: 'For landlords who would rather not.',
      bullets: ['Tenant screening and referencing', 'Ejari registration and contracts', 'Renewals and maintenance coordination'],
    },
    {
      title: 'Completion',
      summary: 'Through to transfer or move-in.',
      bullets: ['MOU and NOC managed', 'DLD transfer coordinated', 'Handover and utilities settled'],
    },
  ],
  stepsTitle: 'How a Sale or Letting Runs',
  steps: [
    { number: '01', title: 'Valuation', body: 'We assemble comparable evidence and agree an asking strategy with a realistic time-to-market.' },
    { number: '02', title: 'Marketing', body: 'The property is photographed, listed and distributed to qualified buyers or tenants.' },
    { number: '03', title: 'Viewings & Offers', body: 'We run accompanied viewings, report feedback and present offers with the context behind them.' },
    { number: '04', title: 'Completion', body: 'MOU, NOC and DLD transfer for a sale; contract and Ejari for a letting. Handover managed either way.' },
  ],
  faqs: [
    { q: 'Can I lease my apartment while living overseas?', a: 'Yes. Non-resident landlords can appoint us to manage the letting end to end — viewings, tenant screening, contracts and Ejari — and we report at each stage. No travel is required.' },
    { q: 'How is my asking price decided?', a: 'From comparable evidence in your building and community, adjusted for floor, view, condition and current supply. You see the comparables we used, not just the number.' },
    { q: 'What do I need before listing?', a: 'Title deed, passport or Emirates ID, and a developer NOC at the point of sale. For a letting, we also need the DEWA details and any existing Ejari.' },
    { q: 'Do you manage the tenancy after it starts?', a: 'We can. Property management covers rent collection, renewals, maintenance coordination and annual Ejari — quoted separately from the letting fee.' },
  ],
  ctaTitle: 'Find Out What Your Property Is Actually Worth',
  ctaBody: 'Request a valuation and we will show you the comparable evidence behind the number, not just the number.',
};

const OFFPLAN: ServicePage = {
  slug: 'off-plan-properties',
  eyebrow: 'Off-Plan Properties',
  title: 'Off-Plan, Assessed',
  titleAccent: 'Before You Commit.',
  lede: 'Launch access to Dubai’s most anticipated developments — with the developer track record, payment plan and handover risk examined before you sign anything.',
  heroImg: '/assets/content/uploads/services/re-explore-off-plan.webp',
  highlights: [
    { value: 'Launch', label: 'Day access', detail: 'Allocation at launch pricing with leading developers.' },
    { value: 'Escrow', label: 'Verified', detail: 'Project registration and escrow status checked.' },
    { value: 'Milestone', label: 'Tracking', detail: 'Construction progress followed to handover.' },
  ],
  offerTitle: 'What We Check Before You Sign',
  offerLede:
    'Off-plan is the part of the market where the difference between a good and a bad decision shows up years later. These are the checks that make that difference.',
  offer: [
    {
      title: 'Developer Record',
      summary: 'Delivery history, not marketing history.',
      bullets: ['Completed projects and delays', 'Build quality on handed-over stock', 'Financial standing reviewed'],
    },
    {
      title: 'Project Registration',
      summary: 'The formalities that protect you.',
      bullets: ['DLD project registration verified', 'Escrow account confirmed', 'Approved plans and permits checked'],
    },
    {
      title: 'Payment Plans',
      summary: 'Compared, not accepted.',
      bullets: ['Construction-linked vs post-handover', 'Total cost over the plan modelled', 'Exit and resale terms explained'],
    },
    {
      title: 'Launch Access',
      summary: 'Allocation at the right moment.',
      bullets: ['Priority unit selection', 'Launch pricing secured', 'Floor and view advice'],
    },
    {
      title: 'Milestone Tracking',
      summary: 'We follow it so you do not have to.',
      bullets: ['Construction progress reported', 'Payment schedule reminders', 'Developer chased on your behalf'],
    },
    {
      title: 'Handover & Snagging',
      summary: 'The last mile, done properly.',
      bullets: ['Snagging inspection coordinated', 'Defects logged and pursued', 'Title and utilities registered'],
    },
  ],
  stepsTitle: 'How an Off-Plan Purchase Runs',
  steps: [
    { number: '01', title: 'Objective & Budget', body: 'We establish whether you are buying to hold, to flip or to occupy — the answer changes which launch suits you.' },
    { number: '02', title: 'Project Assessment', body: 'Developer record, escrow and registration, payment plan and location fundamentals are examined before a unit is discussed.' },
    { number: '03', title: 'Allocation & Booking', body: 'We secure your unit at launch pricing and review the SPA before you sign.' },
    { number: '04', title: 'Construction to Handover', body: 'We track milestones, prompt payments, and coordinate snagging and handover at completion.' },
  ],
  faqs: [
    { q: 'Is off-plan riskier than a ready property?', a: 'It carries delivery and market-timing risk that a ready property does not. Those risks are manageable when the developer record, escrow registration and payment plan are checked first — which is what this service exists to do.' },
    { q: 'What deposit is typically required?', a: 'Most launches require 10–20% on booking, with the balance linked to construction milestones or spread post-handover. We model the full cost across the plan before you commit.' },
    { q: 'Can I sell before handover?', a: 'Usually yes, once a minimum percentage is paid — the threshold is set by the developer and varies. We confirm the resale terms in the SPA before booking, not after.' },
    { q: 'What protects my payments?', a: 'Registered projects must hold buyer funds in a DLD-supervised escrow account released against verified construction progress. We confirm the escrow is in place as part of assessment.' },
  ],
  ctaTitle: 'See the Next Launch Before It Is Public',
  ctaBody: 'Tell us your budget and horizon, and we will bring you the launches worth considering — with the assessment attached.',
};

/**
 * The three transaction pages above, plus the five sector and advisory pages in
 * service-pages-2.ts. Eight in all, one per service the landing page names.
 * SERVICE_SLUGS in lib/routes.ts must list the same slugs.
 */
export const SERVICE_PAGE_LIST: ServicePage[] = [BUY, SELL, OFFPLAN, ...SECTOR_PAGES];

export const SERVICE_PAGES: Record<string, ServicePage> = Object.fromEntries(
  SERVICE_PAGE_LIST.map((p) => [p.slug, p]),
);
