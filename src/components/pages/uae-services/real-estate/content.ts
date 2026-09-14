/**
 * What /en-ae/services/real-estate-transactions/ says.
 *
 * THE COPY IS THE CLIENT'S page document (20260911), word for word, on the
 * service template, under the same two rules as the home page: nothing added
 * to the document or dropped from it, and no em dashes anywhere on the UAE
 * pages. Three things this document says that the template had no field for
 * are fields now, on every page: a tab's own heading line, a tab's own items
 * and button, and which three related services show (see ../template/types.ts).
 *
 * Two of the document's sentences arrived with a dash already taken out and
 * nothing put in its place; a colon and a comma stand where it was, and both
 * are marked below. "Speak to anAdvisor" is read as "Speak to an Advisor".
 *
 * SUB-SERVICE SLUGS resolve through vxnServices('en-ae'), so every slug below
 * exists in that registry and the strip cannot point at a 404. The card names
 * are the document's ("Sell & Rent/Lease", "Off-Plan Properties"); the
 * registry still carries the older forms for the menu and the breadcrumbs
 * until those pages' documents arrive.
 */
import type { ServiceTemplateContent } from '../template/types';

export const REAL_ESTATE_TEMPLATE: ServiceTemplateContent = {
  slug: 'real-estate-transactions',
  crumb: 'Real Estate',
  hero: {
    head: 'Real Estate Decisions, Guided From Search to Signature.',
    sub: 'Buy, sell, lease or invest with market insight and dedicated transaction guidance at every step.',
    /* building-real-esate is the plate the old template used for this
       practice's banner. Despite the name it is an adviser at a laptop, not a
       building; near square, so the band takes its middle. */
    image: ['banners/services-banner.webp', 'services/real-estate-hero.webp', 'homepage/building-real-esate.webp'],
    alt: 'An adviser at a laptop in an office',
  },
  intro: {
    head: 'One Real Estate Partner. For Every Step of the Transaction.',
    lede: 'From finding the right property to negotiating terms and completing the transaction, Valunxt brings market guidance and execution together under one team.',
    proof: [
      { label: 'Market-Led Guidance', note: 'Insight grounded in current property market dynamics.' },
      { label: 'Property Search & Selection', note: 'Opportunities aligned with your requirements and objectives.' },
      { label: 'Negotiation Support', note: 'Commercial guidance when price and terms matter.' },
      { label: 'Transaction Coordination', note: 'Support from initial discussions through completion.' },
    ],
    chips: ['100% Transparency', 'End-to-End Support'],
    primary: { label: 'Speak to an Advisor', href: '/free-consultation/' },
    secondary: { label: 'Explore Our Services', href: '#at-services' },
    image: ['services/real-estate-intro.webp', 'homepage/industry-2.webp'],
  },
  strip: {
    kicker: 'Explore Services',
    head: 'Your Property Goals. Our Expertise.',
    lede: 'From finding the right property to taking one to market, get the guidance you need to move forward with confidence.',
    cta: 'Ready to make your move?',
    subs: [
      {
        name: 'Buy Property',
        slug: 'buy-property',
        cardText: 'Property search, market comparison and negotiation guided by your requirements and investment objectives.',
        figure: ['services/re-explore-buy-property.webp', 'new-folder/who-we-are-2.webp'],
      },
      {
        name: 'Sell & Rent/Lease',
        slug: 'sell-rent-lease-property',
        cardText: 'Strategic pricing, positioning and negotiation to connect your property with the right buyer or tenant.',
        figure: ['services/re-explore-sell-rent-lease.webp', 'new-folder/client-success-1.webp'],
      },
      {
        name: 'Off-Plan Properties',
        slug: 'off-plan-properties',
        cardText: 'Navigate projects, developers, payment plans and location potential with a clearer view of the opportunity.',
        figure: ['services/re-explore-off-plan.webp', 'new-folder/services-1.webp'],
      },
    ],
  },
  solution: {
    head: 'Find the Right Solution',
    /* The document writes the tab names in capitals; they are set in title
       case here because the tab strip renders what it is given and every
       other label on the page is title case. Each tab's button leads to the
       sub-service its steps describe. */
    tabs: [
      {
        tab: 'I Want to Buy',
        title: 'Looking for the Right Property? Start Here.',
        /* The colon after "you" is the mark that stood in for a dash. */
        intro: 'Tell us what matters to you: location, budget, property type or investment goal. We help turn that brief into a focused property search.',
        items: [
          { name: 'Find Your Match', text: 'Explore properties selected around your priorities.' },
          { name: 'Compare Your Options', text: 'See how shortlisted properties compare on price, location and market potential.' },
          { name: 'Make Your Move', text: 'Get guidance through negotiation and purchase coordination.' },
        ],
        cta: { label: 'Start Your Search', href: '/services/real-estate-transactions/buy-property/' },
      },
      {
        tab: 'I Want to Sell or Lease',
        title: 'Ready to Put Your Property on the Market?',
        intro: 'We help you understand where your property stands, how it should be positioned and how to take it to the right buyers or tenants.',
        items: [
          { name: 'Know Your Position', text: 'Get market-led guidance on pricing and positioning.' },
          { name: 'Find the Right Audience', text: 'Connect your property with relevant buyers or tenants.' },
          { name: 'Close With Confidence', text: 'Get support through offers, negotiation and completion.' },
        ],
        cta: { label: 'List Your Property', href: '/services/real-estate-transactions/sell-rent-lease-property/' },
      },
      {
        tab: 'I’m Exploring Off-Plan',
        title: 'Found an Off-Plan Opportunity?',
        /* The comma after "launch" is the mark that stood in for a dash. */
        intro: 'Before you commit, understand what sits behind the launch, from the developer and project to the payment plan and location potential.',
        items: [
          { name: 'Know the Project', text: 'Understand the developer, development and proposition.' },
          { name: 'Know the Numbers', text: 'Review payment plans and key investment considerations.' },
          { name: 'Know the Potential', text: 'Assess the location and opportunity against your objectives.' },
        ],
        cta: { label: 'Explore Off-Plan', href: '/services/real-estate-transactions/off-plan-properties/' },
      },
    ],
    images: [['homepage/industry-2.webp'], ['new-folder/client-success-2.webp'], ['new-folder/who-we-are-3.webp']],
  },
  banner: {
    head: 'Read the Market Before You Move',
    body: 'Go beyond what’s available today with insight into pricing, demand, locations and the forces shaping property decisions.',
    /* /blogs/ is where the header's Insights item leads. */
    cta: { label: 'Discover Insights', href: '/blogs/' },
    image: ['services/real-estate-banner.webp', 'banners/uae-slider-1.webp'],
  },
  related: {
    head: 'Explore Related Services',
    slugs: ['mortgages-services', 'valuation-and-advisory', 'research-intelligence'],
  },
  close: {
    head: 'Your Next Property Decision Starts With the Right Advice.',
    lede: 'Whether you are buying, selling, leasing or exploring an off-plan opportunity, start with a conversation about what you want to achieve.',
    primary: { label: 'Speak to an Advisor', href: '/free-consultation/' },
    image: ['services/real-estate-talk.webp', 'new-folder/client-1.webp'],
  },
};
