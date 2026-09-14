/**
 * What /en-ae/services/valuation-and-advisory/ says.
 *
 * THE COPY IS THE CLIENT'S page document (20260911), word for word, on the
 * service template, under the same two rules as the home page: nothing added
 * to the document or dropped from it, and no em dashes anywhere on the UAE
 * pages. The figures (48+ years, 200Bn+ USD, 11K+ clients, award-winning)
 * are the client's own claims about Reliant Surveyors, the group's valuation
 * firm, which is why that name appears where it does.
 *
 * ONE SLOT THE DOCUMENT LEAVES EMPTY: the intro band's two buttons, which the
 * other service documents give and this one does not. The band keeps them,
 * labelled with the document's own closing call and the secondary every other
 * page carries, because the intro's primary is also where the strip's link
 * and any tab without a button of its own lead. Marked in the report.
 *
 * SUB-SERVICE SLUGS resolve through vxnServices('en-ae'), so every slug below
 * exists in that registry and the strip cannot point at a 404.
 */
import type { ServiceTemplateContent } from '../template/types';

export const VALUATION_TEMPLATE: ServiceTemplateContent = {
  slug: 'valuation-and-advisory',
  crumb: 'Valuation',
  hero: {
    head: 'Valuation That Stands Behind Every Decision.',
    sub: 'Independent valuation and advisory backed by rigorous analysis, professional judgement and 48+ years of expertise.',
    /* Reliant Surveyors is the group's valuation firm, so its photograph is
       the one that belongs on this banner. */
    image: ['banners/services-banner.webp', 'services/valuation-hero.webp', 'new-folder/reliant-surveyors-1.webp'],
    alt: 'A meeting under the Reliant Surveyors sign',
  },
  intro: {
    head: 'One Valuation Partner. Decades of Expertise Behind Every Conclusion.',
    lede: 'Through our Valuation & Advisory partnership with Reliant Surveyors, Valunxt brings established expertise, market evidence and professional judgement to valuations for transactions, reporting, investment and strategic decisions.',
    proof: [
      { label: 'RICS-Regulated Expertise', note: 'Valuations aligned with recognised global standards and professional practice.' },
      { label: '48+ Years of Experience', note: 'Decades of valuation and advisory expertise through Reliant Surveyors.' },
      { label: '200Bn+ USD Property Market Value', note: 'Extensive valuation experience across property and asset classes.' },
    ],
    chips: ['11K+ Clients Served', 'Award-Winning Advisory Firm'],
    primary: { label: 'Speak to a Valuation Advisor', href: '/free-consultation/' },
    secondary: { label: 'Explore Our Services', href: '#at-services' },
    image: ['services/valuation-intro.webp', 'new-folder/reliant-surveyors-2.webp'],
  },
  strip: {
    kicker: 'Explore Services',
    head: 'Valuation for Every Business Need.',
    lede: 'From businesses and companies to machinery, assets and financial interests, access credible valuation expertise built around the purpose of your decision.',
    cta: 'Speak to an Expert',
    subs: [
      {
        name: 'Business Valuation',
        slug: 'business-valuation',
        cardText: 'Assess the economic value of a business for transactions, planning, restructuring, disputes or strategic decisions.',
        figure: ['services/va-explore-business-valuation.webp', 'new-folder/services-1.webp'],
      },
      {
        name: 'Company Valuation',
        slug: 'company-valuation',
        cardText: 'Determine company or equity value using financial performance, market evidence, forecasts and relevant valuation approaches.',
        figure: ['services/va-explore-company-valuation.webp', 'new-folder/who-we-are-1.webp'],
      },
      {
        name: 'Plant & Machinery Valuation',
        slug: 'plant-machinery-valuation',
        cardText: 'Establish the value of machinery, equipment and industrial assets for reporting, insurance, financing and transactions.',
        figure: ['services/va-explore-plant-machinery-valuation.webp', 'homepage/industry-3.webp'],
      },
      {
        name: 'Asset Valuation',
        slug: 'asset-valuation',
        cardText: 'Understand the value of tangible and relevant business assets for reporting, financing, restructuring and transactions.',
        figure: ['services/va-explore-asset-valuation.webp', 'homepage/industry-2.webp'],
      },
      {
        name: 'Financial Valuation',
        slug: 'financial-valuation',
        cardText: 'Assess financial interests, instruments and economic rights using appropriate analysis and recognised valuation techniques.',
        figure: ['services/va-explore-financial-valuation.webp', 'new-folder/insights-1.webp'],
      },
    ],
  },
  solution: {
    head: 'Find the Right Valuation Solution',
    /* The document writes the tab names in capitals; they are set in title
       case here because the tab strip renders what it is given and every
       other label on the page is title case. Each tab's steps have lines of
       their own, so they are items rather than slugs. "Request a Valuation"
       leads to the contact form; the two conversations lead to the
       consultation. */
    tabs: [
      {
        tab: 'Business & Company',
        title: 'What Is the Business Really Worth?',
        intro: 'Whether you are preparing for a transaction, restructuring, planning ahead or evaluating an ownership interest, get a clear and supportable view of value.',
        items: [
          { name: 'Business Valuation', text: 'Assess the economic value of a business around the purpose of the valuation.' },
          { name: 'Company Valuation', text: 'Determine company or equity value using financial performance, forecasts and market evidence.' },
          { name: 'Right Approach, Right Purpose', text: 'Apply the valuation approach best suited to the requirement and intended use.' },
        ],
        cta: { label: 'Discuss Your Requirement', href: '/free-consultation/' },
      },
      {
        tab: 'Assets & Machinery',
        title: 'Know the Value Behind Your Assets.',
        intro: 'From operational machinery to wider business assets, establish credible values for reporting, financing, insurance, transactions or asset management.',
        items: [
          { name: 'Plant & Machinery Valuation', text: 'Assess machinery, equipment and industrial assets using relevant technical and market considerations.' },
          { name: 'Asset Valuation', text: 'Determine the value of tangible and relevant business assets around the required purpose.' },
          { name: 'Evidence-Led Reporting', text: 'Bring methodology, market evidence and professional judgement into a clear valuation conclusion.' },
        ],
        cta: { label: 'Request a Valuation', href: '/contact/' },
      },
      {
        tab: 'Financial Interests',
        title: 'When Value Goes Beyond Physical Assets.',
        intro: 'Financial interests and economic rights require analysis built around financial information, assumptions and appropriate valuation techniques.',
        items: [
          { name: 'Financial Valuation', text: 'Assess financial interests, instruments and economic rights.' },
          { name: 'Financial Analysis', text: 'Evaluate relevant information, assumptions and underlying value drivers.' },
          { name: 'Defensible Conclusions', text: 'Reach a reasoned conclusion supported by appropriate methodology and analysis.' },
        ],
        cta: { label: 'Speak to a Valuation Advisor', href: '/free-consultation/' },
      },
    ],
    images: [['new-folder/who-we-are-3.webp'], ['homepage/industry-3.webp'], ['new-folder/services-2.webp']],
  },
  banner: {
    head: 'Confidence Starts With a Credible Valuation.',
    body: 'Independent analysis and established methodology for values that support important business decisions.',
    cta: { label: 'Request a Valuation', href: '/contact/' },
    image: ['services/valuation-banner.webp', 'banners/uae-slider-4.webp'],
  },
  related: {
    head: 'Explore Related Services',
    slugs: ['accounting-tax-services', 'research-intelligence', 'technology-data-ai'],
  },
  close: {
    head: 'Experience Behind the Valuation. Confidence Behind the Decision.',
    lede: 'Access Valunxt’s Valuation & Advisory services with the established expertise of Reliant Surveyors, our Valuation & Advisory Partner.',
    primary: { label: 'Speak to a Valuation Advisor', href: '/free-consultation/' },
    image: ['services/valuation-talk.webp', 'new-folder/who-we-are-1.webp'],
  },
};
