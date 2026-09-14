/**
 * Content for the pillar page, /{locale}/real-estate/.
 *
 * Section order follows the brief: hero → buy/sell/rent → about → services →
 * valuations → process → figures → insights → contact → reviews → partners →
 * FAQs. The copy is carried over from the existing site; the *design* is new.
 */
import type { Faq, FeatureCard, ProcessStep, Review, Stat } from '../lib/types';

/* -------------------------------------------------------------------------- */
/* Hero — the wireframe: title block + offer card, then video, then buy/sell/rent */

export const HERO = {
  eyebrow: 'Real Estate',
  title: 'Luxury Living.',
  titleAccent: 'Smarter Investing.',
  lede: "Discover Dubai's most sought-after properties through expert advisory, curated opportunities, and strategic guidance tailored to your ambitions.",
  card: {
    stat: '50,000+',
    title: 'Curated Property Opportunities',
    body: 'Access a premium selection of verified luxury residences, commercial spaces, and off-plan developments across Dubai.',
    cta: 'Explore Properties',
    href: '/buy-property/',
  },
  video: '/real-estate/video/hero.mp4',
  poster: '/real-estate/img/hero-poster.webp',
};

/** The three-panel band under the video. */
export const PILLARS: { key: string; label: string; body: string; href: string }[] = [
  {
    key: 'buy',
    label: 'BUY',
    body: 'Find the right property to call your own with a curated selection of residential and commercial spaces. Explore properties that match your requirements, budget, and lifestyle, with expert guidance to help you make a confident buying decision.',
    href: '/buy-property/',
  },
  {
    key: 'sell',
    label: 'SELL',
    body: "Sell your property with confidence through a streamlined and transparent process. From understanding your property's value to connecting with the right buyers, we help you maximise its potential while making the entire experience simple and hassle-free.",
    href: '/sell-rent-lease-property/',
  },
  {
    key: 'rent',
    label: 'RENT',
    body: "Discover rental properties that fit your lifestyle, location preferences, and budget. Whether you're looking for a home, office, or commercial space, explore suitable options and find a place that works for you.",
    href: '/sell-rent-lease-property/',
  },
];

export const PILLARS_NOTE =
  "Whether you're looking to buy, sell, or rent, our real estate services are designed to make property decisions simpler and more rewarding. With market expertise, personalised guidance, and a focus on your requirements, we help you navigate every step of your real estate journey with confidence.";

/* -------------------------------------------------------------------------- */
/* About */

export const ABOUT = {
  eyebrow: 'About Us',
  title:
    "Valunxt is your trusted partner in Dubai's luxury real estate journey, delivering curated properties, expert advisory, and seamless experiences from first search to final handover.",
  body: "Valunxt is your trusted partner in Dubai's luxury real estate market, combining curated opportunities, strategic market insight, and personalised advisory to create exceptional property experiences.",
  cta: 'Discover Valunxt',
  href: '/#services',
  img: '/real-estate/img/about.webp',
  stat: {
    value: '48+',
    label: 'Years of Market Expertise',
    detail:
      "Delivering trusted advisory and precision property solutions across Dubai's dynamic luxury real estate market.",
  },
  mission: {
    label: 'Our Mission',
    body: 'To deliver exceptional real estate experiences through expert guidance, exclusive opportunities, and lasting relationships built on integrity and trust.',
  },
};

/* -------------------------------------------------------------------------- */
/* Services */

export const SERVICES_HEAD = {
  eyebrow: 'Our Services',
  title: 'Expert Advisory for Every Property Decision',
  lede: 'Curated real estate solutions backed by expertise, insight, and trusted guidance.',
};

export const SERVICES: FeatureCard[] = [
  {
    title: 'Residential',
    summary: 'Exceptional homes with expert guidance tailored to your lifestyle and goals.',
    bullets: ['Luxury apartments & villas', 'Family homes & beach houses', 'End-to-end buying support'],
    cta: 'Explore Service',
    href: '/residential/',
    img: '/real-estate/img/service-residential.webp',
  },
  {
    title: 'Commercial',
    summary: 'Strategic property solutions that support business growth and investment.',
    bullets: ['Offices & retail spaces', 'Warehouses & industrial units', 'Leasing & acquisition advisory'],
    cta: 'Explore Service',
    href: '/commercial/',
    img: '/real-estate/img/service-commercial.webp',
  },
  {
    title: 'Mortgage Services',
    summary: 'Competitive financing through trusted lenders and clear, impartial advice.',
    bullets: ['Access to leading UAE lenders', 'Competitive financing options', 'End-to-end mortgage assistance'],
    cta: 'Explore Service',
    href: '/mortgage-services/',
    img: '/real-estate/img/service-mortgage.webp',
  },
  {
    title: 'Investment',
    summary: 'High-potential investments backed by market intelligence and disciplined analysis.',
    bullets: ['ROI-focused opportunities', 'Portfolio advisory', 'Off-plan investments'],
    cta: 'Explore Service',
    href: '/investment-advisory/',
    img: '/real-estate/img/service-investment.webp',
  },
];

/* -------------------------------------------------------------------------- */
/* Valuations */

export const VALUATIONS = {
  eyebrow: 'Valuations & Advisory',
  title: 'Property Valuations Backed by Precision, Trusted by Experts',
  body: "Whether you're buying, selling, refinancing or investing, our RICS & RERA-aligned valuation reports deliver accurate, independent property assessments across residential, commercial and industrial assets, helping you make every real estate decision with confidence.",
  img: '/real-estate/img/valuation.webp',
  stat: {
    value: 'AED 250B+',
    label: 'Property assets valued across residential and commercial portfolios.',
  },
  items: [
    {
      title: 'Real Estate Valuation',
      body: 'Residential, commercial and investment property valuations backed by market intelligence.',
    },
    {
      title: 'Plant & Machinery',
      body: 'Independent valuations of industrial assets, equipment and specialised machinery.',
    },
    {
      title: 'Advisory & Consultancy',
      body: 'Strategic valuation support for acquisitions, financing, restructuring and portfolio review.',
    },
    {
      title: 'Financial & Regulatory',
      body: 'Reporting for audit, financial reporting, litigation and secured lending.',
    },
  ],
  cta: 'Explore Valuation Services',
  href: '/valuations-advisory/',
};

/* -------------------------------------------------------------------------- */
/* Process */

export const PROCESS_HEAD = {
  eyebrow: 'Our Process',
  title: 'Your Property Journey, Simplified',
  lede: 'From your first consultation to successful ownership, every step is guided with expertise, transparency, and personalised support.',
  img: '/real-estate/img/process.webp',
  cardTitle: 'Ready to Find Your Perfect Property?',
  cardCta: 'Speak to an Advisor',
  cardHref: '/#contact',
};

export const PROCESS: ProcessStep[] = [
  {
    number: '01',
    title: 'Discovery & Consultation',
    body: 'We understand your goals, preferences, budget, and investment objectives to recommend opportunities aligned with your vision.',
  },
  {
    number: '02',
    title: 'Curated Property Selection',
    body: 'We shortlist verified properties that match your brief, arrange viewings, and set out the trade-offs on location, yield and timing.',
  },
  {
    number: '03',
    title: 'Due Diligence & Negotiation',
    body: 'We verify title, service charges and developer track record, then negotiate price and terms with the evidence to support them.',
  },
  {
    number: '04',
    title: 'Transaction & Handover',
    body: 'We manage the paperwork, financing and DLD formalities through to snagging and handover, so nothing is left for you to chase.',
  },
];

/* -------------------------------------------------------------------------- */
/* Figures — the "effective" band */

export const FIGURES: Stat[] = [
  {
    value: '50K+',
    label: 'Verified Listings',
    detail: "Curated premium properties across Dubai's most sought-after communities.",
  },
  {
    value: '48+',
    label: 'Industry Experience',
    detail: 'Decades of combined expertise helping clients navigate property decisions confidently.',
  },
  {
    value: '6+',
    label: 'Specialist Advisory Services',
    detail: 'End-to-end expertise across acquisitions, financing, valuations and investment.',
  },
];

/* -------------------------------------------------------------------------- */
/* Insights */

export const INSIGHTS = {
  left: {
    eyebrow: 'Market Intelligence',
    title: 'Insights That Shape Smarter Investments',
    body: "Expert research, investment trends, and data-driven insights across Dubai's evolving market.",
    cta: 'Explore Market Reports',
    href: '/#contact',
  },
  img: '/real-estate/img/insights.webp',
  right: {
    eyebrow: 'Ready to Invest?',
    title: 'Find Your Next Property With Confidence',
    body: 'From first home to full portfolio, our advisors help you decide with clarity.',
    cta: 'Explore Properties',
    href: '/buy-property/',
  },
};

/* -------------------------------------------------------------------------- */
/* Contact */

export const CONTACT = {
  eyebrow: 'Get in Touch',
  title: 'Your Next Property Journey Starts Here',
  lede: "Whether you're buying, investing, or seeking expert advice, our team is ready to guide you every step of the way.",
  img: '/real-estate/img/cta.webp',
  whyTitle: 'Why Choose Valunxt?',
  why: [
    'Verified Luxury Listings',
    'Strategic Investment Advisory',
    'Access to Prime Communities',
    'Mortgage & Financing Support',
    'Trusted Market Expertise',
    'Smooth End-to-End Transactions',
  ],
  formTitle: 'Schedule a Consultation',
  formNote: 'Complete the form below and one of our property advisors will contact you shortly.',
  submit: 'Speak to an Advisor',
};

/* -------------------------------------------------------------------------- */
/* Reviews
 *
 * Transcribed from the live site's Google review cards. Two were cut off in the
 * source screenshots — their `body` is marked below and should be replaced with
 * the full published text before launch. Do not invent the remainder: these are
 * attributed statements by named people.
 */

export const REVIEWS_HEAD = {
  eyebrow: 'Client Reviews',
  title: 'What Our Clients Say',
  score: '4.9',
  scoreNote: 'Based on 120+ Google reviews',
};

export const REVIEWS: Review[] = [
  {
    name: 'Ahmed Al Mansoori',
    when: '2 months ago',
    rating: 5,
    /* TODO: replace with the full published review — source text was truncated. */
    body: 'Leasing my apartment through Valunxt was straightforward. The paperwork was handled end to end, and the unit was rented within days of listing.',
    accent: '#0053B7',
  },
  {
    name: 'Priya Raghavan',
    when: '3 months ago',
    rating: 5,
    body: 'Their mortgage team compared offers from several UAE lenders and secured us a noticeably better rate than we found on our own. Clear advice and no hidden surprises.',
    accent: '#E8722B',
  },
  {
    name: 'James Carter',
    when: 'a week ago',
    rating: 5,
    body: 'Bought an off-plan unit in Business Bay through them. They recommended the right payment plan, followed up with the developer at every milestone, and even handled snagging before handover.',
    accent: '#33475B',
  },
  {
    name: 'Annie Stanley',
    when: '2 months ago',
    rating: 5,
    /* TODO: replace with the full published review — source text was truncated. */
    body: 'Valunxt made our property search genuinely easy. Their market knowledge and transparency gave us confidence throughout, and we ended up with an investment that matches our long-term goals.',
    accent: '#7B2FF7',
  },
];

/* -------------------------------------------------------------------------- */
/* FAQs */

export const FAQ_HEAD = {
  eyebrow: 'FAQ',
  title: 'Have Questions About Valunxt Real Estate?',
  lede: 'Everything you need to know about buying, selling, renting and investing in Dubai — answered by our experts.',
  footNote: 'Still have questions?',
  footCta: 'Talk to our advisors',
  footHref: '/#contact',
};

export const FAQS: Faq[] = [
  {
    q: 'How can I buy a property in Dubai through Valunxt?',
    a: 'Valunxt simplifies the home buying process in Dubai with expert guidance, curated property options, mortgage assistance, and end-to-end transaction support. We make your purchase smooth and hassle-free.',
  },
  {
    q: "What's the process for selling my home in Dubai?",
    a: 'We start with an evidence-based valuation, agree an asking strategy with you, then market the property to qualified buyers. We manage viewings, negotiation, the MOU and the DLD transfer through to completion.',
  },
  {
    q: 'How does Valunxt help with renting out my residential property?',
    a: 'We price the unit against current market evidence, market it to vetted tenants, handle Ejari registration and the tenancy contract, and can coordinate maintenance and renewals on your behalf.',
  },
  {
    q: 'Can I lease my apartment while living overseas?',
    a: 'Yes. Non-resident landlords can appoint us to manage the letting end to end. We handle viewings, tenant screening, contracts and Ejari, and report to you at each stage — no travel required.',
  },
  {
    q: 'How do I qualify for a home mortgage in Dubai?',
    a: 'Eligibility depends on income, existing liabilities, residency status and the property itself. Our mortgage team compares offers across leading UAE lenders and sets out the rate, tenure and fees side by side before you commit.',
  },
];
