/**
 * What /en-ae/services/research-intelligence/ says.
 *
 * THE COPY IS THE CLIENT'S page document (20260911), word for word, on the
 * service template, under the same two rules as the home page: nothing added
 * to the document or dropped from it, and no em dashes anywhere on the UAE
 * pages. Three proof points, as the document gives; every tab has a button
 * of its own.
 *
 * This slug is the one both markets use; the UAE branch of the static route
 * at app/[region]/services/research-intelligence/ is what renders this.
 *
 * SUB-SERVICE SLUGS resolve through vxnServices('en-ae'), so every slug below
 * exists in that registry and the strip cannot point at a 404.
 */
import type { ServiceTemplateContent } from '../template/types';

export const RESEARCH_TEMPLATE: ServiceTemplateContent = {
  slug: 'research-intelligence',
  crumb: 'Research',
  hero: {
    head: 'Research That Turns Market Signals Into Direction.',
    sub: 'Research & intelligence that turns market data, trends and opportunities into actionable insight for better-informed decisions.',
    image: ['banners/services-banner.webp', 'services/research-hero.webp', 'homepage/research-and-intellegance.webp'],
    alt: 'A research team reviewing figures on a laptop',
  },
  intro: {
    head: 'One Intelligence Partner. From Market Data to Strategic Direction.',
    lede: 'Valunxt brings research, market intelligence and analytical expertise together to help investors, developers and businesses understand market conditions, evaluate opportunities and plan what comes next.',
    proof: [
      { label: 'Market Research & Benchmarking', note: 'Track market trends, pricing shifts, sector performance and competitive positioning.' },
      { label: 'Feasibility & Product Analysis', note: 'Assess market potential, product positioning, pricing and commercial viability.' },
      { label: 'Research Reports & Publications', note: 'Access structured market intelligence across markets, sectors and asset classes.' },
    ],
    chips: ['Market Trends & Forecasting', 'Highest & Best Use Analysis'],
    primary: { label: 'Speak to a Research Advisor', href: '/free-consultation/' },
    secondary: { label: 'Explore Research Services', href: '#at-services' },
    image: ['services/research-intro.webp', 'new-folder/research-intelligence-1.webp'],
  },
  strip: {
    kicker: 'Explore Services',
    head: 'Research Across Markets & Opportunities.',
    lede: 'From real estate and investment research to feasibility and market intelligence, access the insight needed to understand opportunities, risks and market direction.',
    cta: 'Speak to an Expert',
    subs: [
      {
        name: 'Real Estate Research',
        slug: 'real-estate-research',
        cardText: 'Analyse transactions, pricing, supply, demand and sector performance to understand where property markets stand and where they may be heading.',
        figure: ['services/ri-explore-real-estate-research.webp', 'new-folder/research-intelligence-2.webp'],
      },
      {
        name: 'Market Research',
        slug: 'market-research',
        cardText: 'Understand market trends, competitive positioning, pricing movements and demand dynamics through focused research and benchmarking.',
        figure: ['services/ri-explore-market-research.webp', 'new-folder/services-3.webp'],
      },
      {
        name: 'Investment Research',
        slug: 'investment-research',
        cardText: 'Evaluate markets, sectors and opportunities through research that brings investment potential, market dynamics and key risks into focus.',
        figure: ['services/ri-explore-investment-research.webp', 'new-folder/insights-3.webp'],
      },
      {
        name: 'Feasibility Studies',
        slug: 'feasibility-studies',
        cardText: 'Test the market viability of a project through demand assessment, concept analysis, product positioning, pricing and highest & best use considerations.',
        figure: ['services/ri-explore-feasibility-studies.webp', 'new-folder/services-2.webp'],
      },
      {
        name: 'Market Intelligence',
        slug: 'market-intelligence',
        cardText: 'Stay informed on market movements through trend analysis, forecasting, benchmarking and sector-specific intelligence.',
        figure: ['services/ri-explore-market-intelligence.webp', 'new-folder/insights-2.webp'],
      },
      {
        name: 'Research Reports',
        slug: 'research-reports',
        cardText: 'Access market updates and sector-focused research covering property trends, performance and emerging opportunities across the UAE.',
        figure: ['services/ri-explore-research-reports.webp', 'new-folder/insights-1.webp'],
      },
    ],
  },
  solution: {
    head: 'Find the Right Research Solution',
    /* The document writes the tab names in capitals; they are set in title
       case here because the tab strip renders what it is given and every
       other label on the page is title case. Each tab's steps have lines of
       their own, so they are items rather than slugs. The two conversations
       lead to the consultation; "Explore Research Reports" leads to the
       published reports at /research/. */
    tabs: [
      {
        tab: 'Market & Opportunity',
        title: 'Understand the Market Before You Make Your Move.',
        intro: 'Build a clearer view of the market, location or sector through research into demand, pricing, competition and performance.',
        items: [
          { name: 'Real Estate Research', text: 'Analyse transactions, pricing, supply, demand and sector dynamics across property markets.' },
          { name: 'Market Research', text: 'Understand trends, competition, demand patterns and positioning within your target market.' },
          { name: 'Market Benchmarking', text: 'Compare pricing, performance and positioning against relevant market benchmarks.' },
        ],
        cta: { label: 'Discuss Your Research Requirement', href: '/free-consultation/' },
      },
      {
        tab: 'Investment & Feasibility',
        title: 'Test the Opportunity Before You Commit.',
        intro: 'Understand whether the market supports the opportunity through focused analysis of demand, positioning, pricing and commercial viability.',
        items: [
          { name: 'Investment Research', text: 'Evaluate sectors, locations and opportunities through focused investment analysis.' },
          { name: 'Feasibility Studies', text: 'Assess demand, commercial potential, positioning and viability before moving forward.' },
          { name: 'Highest & Best Use', text: 'Identify the most viable use and positioning for a property or development opportunity.' },
        ],
        cta: { label: 'Assess Your Opportunity', href: '/free-consultation/' },
      },
      {
        tab: 'Intelligence & Reports',
        title: 'Stay Closer to Where the Market Is Heading.',
        intro: 'Follow the trends, movements and emerging signals shaping property markets through ongoing intelligence and published research.',
        items: [
          { name: 'Market Intelligence', text: 'Track pricing, supply, demand, transaction activity and changing market dynamics.' },
          { name: 'Research Reports', text: 'Access market and sector-focused research covering trends, performance and emerging developments.' },
          { name: 'Trends & Forecasting', text: 'Interpret changing market indicators to build a forward-looking view of what may come next.' },
        ],
        cta: { label: 'Explore Research Reports', href: '/research/' },
      },
    ],
    images: [['new-folder/research-intelligence-2.webp'], ['new-folder/insights-3.webp'], ['new-folder/services-3.webp']],
  },
  banner: {
    head: 'See Beyond the Market Headlines.',
    body: 'Go deeper into the data, trends and market dynamics shaping investment, development and business opportunities.',
    /* The published research lives at /research/. */
    cta: { label: 'Explore Research', href: '/research/' },
    image: ['services/research-banner.webp', 'banners/uae-slider-3.webp'],
  },
  related: {
    head: 'Explore Related Services',
    slugs: ['real-estate-transactions', 'valuation-and-advisory', 'technology-data-ai'],
  },
  close: {
    head: 'From Market Understanding To Strategic Advantage.',
    lede: 'Use research and intelligence to uncover opportunities, assess potential and plan what comes next.',
    primary: { label: 'Speak to a Research Advisor', href: '/free-consultation/' },
    image: ['services/research-talk.webp', 'new-folder/insights-main.webp'],
  },
};
