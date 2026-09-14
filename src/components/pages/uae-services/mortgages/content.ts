/**
 * What /en-ae/services/mortgages-services/ says.
 *
 * THE COPY IS THE CLIENT'S page document (20260911), word for word, on the
 * service template, under the same two rules as the home page: nothing added
 * to the document or dropped from it, and no em dashes anywhere on the UAE
 * pages. The document gives this page three proof points where the others
 * have four; the list takes any count. Every tab's button is the intro's
 * call, so the tabs name none of their own and take it by default.
 *
 * SUB-SERVICE SLUGS resolve through vxnServices('en-ae'), so every slug below
 * exists in that registry and the strip cannot point at a 404. The card names
 * are the document's ("Mortgage Pre-Approval", "Non-Resident Mortgages"); the
 * registry still carries the unhyphenated forms for the menu and the
 * breadcrumbs until those pages' documents arrive.
 */
import type { ServiceTemplateContent } from '../template/types';

export const MORTGAGES_TEMPLATE: ServiceTemplateContent = {
  slug: 'mortgages-services',
  crumb: 'Mortgages',
  hero: {
    head: 'The Right Mortgage Starts With the Right Guidance.',
    sub: 'Navigate your financing journey with expert guidance from eligibility and lender comparison through to approval.',
    /* about-us-banner is the plate the old template used for this desk's
       banner: wide, and quiet enough on the left for the copy. */
    image: ['banners/services-banner.webp', 'services/mortgages-hero.webp', 'new-folder/about-us-banner.webp'],
    alt: 'The Valunxt office reception',
  },
  intro: {
    head: 'One Mortgage Partner. From First Question to Final Approval.',
    lede: 'Whether you are buying, refinancing or financing property from overseas, Valunxt brings the mortgage process together from assessing your requirements to navigating lenders, documentation and approval.',
    proof: [
      { label: 'Know Your Eligibility', note: 'Understand your borrowing position and financing potential.' },
      { label: 'Find the Right Option', note: 'Explore suitable lenders and mortgage structures for your requirements.' },
      { label: 'Navigate to Approval', note: 'Get support across documentation, application and approval coordination.' },
    ],
    chips: ['360° Mortgage Support', 'End-to-End Guidance'],
    primary: { label: 'Speak to a Mortgage Advisor', href: '/free-consultation/' },
    secondary: { label: 'Explore Our Services', href: '#at-services' },
    image: ['services/mortgages-intro.webp', 'new-folder/houzzhunt-mortgage-2.webp'],
  },
  strip: {
    kicker: 'Explore Services',
    head: 'Financing for Every Property Move.',
    lede: 'From buying your first home to refinancing or investing from overseas, find mortgage support built around your requirements.',
    cta: 'Not sure where to start?',
    subs: [
      {
        name: 'Residential Mortgages',
        slug: 'residential-mortgages',
        cardText: 'Navigate home financing with support across eligibility, lender comparison, documentation and application.',
        figure: ['services/mo-explore-residential-mortgages.webp', 'new-folder/who-we-are-1.webp'],
      },
      {
        name: 'Commercial Mortgages',
        slug: 'commercial-mortgages',
        cardText: 'Explore financing for offices, retail, warehouses and other commercial property requirements.',
        figure: ['services/mo-explore-commercial-mortgages.webp', 'new-folder/services-4.webp'],
      },
      {
        name: 'Mortgage Pre-Approval',
        slug: 'mortgage-pre-approval',
        cardText: 'Understand your borrowing capacity and financing position before committing to a property.',
        figure: ['services/mo-explore-mortgage-pre-approval.webp', 'new-folder/services-1.webp'],
      },
      {
        name: 'Refinancing',
        slug: 'refinancing',
        cardText: 'Review your existing mortgage for better-aligned rates, terms, tenure or financing structures.',
        figure: ['services/mo-explore-refinancing.webp', 'new-folder/insights-2.webp'],
      },
      {
        name: 'Non-Resident Mortgages',
        slug: 'non-resident-mortgages',
        cardText: 'Navigate UAE property financing with guidance tailored to overseas and non-resident buyers.',
        figure: ['services/mo-explore-non-resident-mortgages.webp', 'new-folder/client-success-2.webp'],
      },
      {
        name: 'Islamic Finance',
        slug: 'islamic-finance',
        cardText: 'Explore Sharia-compliant property financing structures and compare suitable options with clarity.',
        figure: ['services/mo-explore-islamic-finance.webp', 'new-folder/who-we-are-3.webp'],
      },
    ],
  },
  solution: {
    head: 'Find the Right Mortgage Solution',
    /* The document writes the tab names in capitals; they are set in title
       case here because the tab strip renders what it is given and every
       other label on the page is title case. The first tab's steps name three
       of the sub-services above, but with lines of their own, so they are
       items here rather than slugs. */
    tabs: [
      {
        tab: 'Buying a Property',
        title: 'Start With What You Want to Finance.',
        intro: 'Whether you are buying a home or commercial property, we help you understand your borrowing position and navigate suitable mortgage options.',
        items: [
          { name: 'Residential Mortgages', text: 'Financing guidance for homebuyers and investors, from eligibility through application.' },
          { name: 'Commercial Mortgages', text: 'Mortgage support shaped around the property, borrower profile and lender criteria.' },
          { name: 'Mortgage Pre-Approval', text: 'Understand your borrowing capacity before committing to a property.' },
        ],
      },
      {
        tab: 'Reviewing Your Mortgage',
        title: 'Make Your Existing Mortgage Work Better.',
        intro: 'Your financing needs can change. We help you review your current mortgage and explore whether a different structure may suit you better.',
        items: [
          { name: 'Refinancing', text: 'Review rates, tenure and financing terms against your current requirements.' },
          { name: 'Better-Aligned Terms', text: 'Explore revised structures or equity-release options where applicable.' },
          { name: 'Switch With Support', text: 'Navigate lender requirements, documentation and the refinancing process.' },
        ],
      },
      {
        tab: 'Specialist Financing',
        title: 'Financing Needs That Require a Different Approach.',
        intro: 'From buying in the UAE as a non-resident to exploring Sharia-compliant financing, get guidance around the options relevant to you.',
        items: [
          { name: 'Non-Resident Mortgages', text: 'Navigate eligibility, documentation and lender options for overseas buyers.' },
          { name: 'Islamic Finance', text: 'Understand and compare Sharia-compliant property financing structures.' },
          { name: 'Guided Comparison', text: 'Explore suitable financing routes based on your profile and requirements.' },
        ],
      },
    ],
    images: [['new-folder/houzzhunt-mortgage-1.webp'], ['new-folder/services-2.webp'], ['new-folder/about-us-1.webp']],
  },
  banner: {
    head: 'Finance Your Next Move With Clarity',
    body: 'Mortgage insights that help you understand borrowing, lender options and the financing landscape before you decide.',
    /* The insights card, as on the real estate page: /blogs/ is where the
       header's Insights item leads. */
    cta: { label: 'Get Mortgage Guidance', href: '/blogs/' },
    image: ['services/mortgages-banner.webp', 'banners/uae-slider-2.webp'],
  },
  related: {
    head: 'Explore Related Services',
    slugs: ['real-estate-transactions', 'valuation-and-advisory', 'research-intelligence'],
  },
  close: {
    head: 'Your Property Plans Deserve the Right Financing Strategy.',
    lede: 'Whether you are buying, refinancing or exploring your options, start with a clear understanding of the financing available to you.',
    primary: { label: 'Speak to a Mortgage Advisor', href: '/free-consultation/' },
    image: ['services/mortgages-talk.webp', 'new-folder/houzzhunt-mortgage-1.webp'],
  },
};
