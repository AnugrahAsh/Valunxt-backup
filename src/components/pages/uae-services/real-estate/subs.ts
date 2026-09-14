/**
 * The three pages under /en-ae/services/real-estate-transactions/.
 *
 * Practice-level sections once, page-level copy per sub-service; the names
 * and slugs are the registry's. See ../template/subTypes.ts for the shape,
 * the length rules and the note on the success story being a placeholder.
 *
 * ALL THREE PAGES ARE THE CLIENT'S page documents (20260912), word for word,
 * under the same two rules as the home and service pages: nothing added to the
 * documents or dropped from them, and no em dashes anywhere on the UAE pages.
 * Each document writes every one of the eight practice-level sections for its
 * page in its own words, so each page carries them all in `override`; the
 * PARENT below is the shape they override and is no longer shown anywhere.
 * Where a document and a slot did not meet, the call is marked at the line.
 *
 * Two of the documents label the testimonial "Client story" and leave the
 * attribution as "[Verified ValuNxt client details to be added]": the quote
 * stands alone until those details arrive, and the label has no slot on the
 * photograph (the panel's pill is the panel's own label).
 */
import { buildSubs, type SubParent, type SubSpec } from '../template/subTypes';
import {
  BAND_PHOTO,
  PANEL_PLATE,
  SHARED_VISION,
  SITE_ARTICLES,
  STORY_PHOTO,
  WHY_PHOTO,
  stripOf,
} from '../template/subShared';
import { REAL_ESTATE_TEMPLATE } from './content';

const PARENT: SubParent = {
  service: 'real-estate-transactions',
  /* The Buy Property document writes the breadcrumb out in full. */
  crumb: 'Real Estate Transactions',
  hero: { image: REAL_ESTATE_TEMPLATE.hero.image, alt: REAL_ESTATE_TEMPLATE.hero.alt },
  panel: PANEL_PLATE,
  why: {
    pill: 'Why us?',
    titleTop: 'One Interest',
    titleMid: 'Represented:',
    titleMark: 'Yours',
    note: 'No inventory behind the advice, and no side of the table but yours.',
    cta: { label: 'Schedule a Call', href: '/free-consultation/' },
    ...WHY_PHOTO,
  },
  approach: {
    eyebrow: 'Our approach',
    columns: [
      {
        title: 'Independent by design',
        body:
          'We hold no inventory and take no listing fee, so a recommendation is never a way of moving ' +
          'stock. The property we suggest is the one we would buy with our own money at the price we ' +
          'would pay for it — and we say so when there is not one.',
      },
      {
        title: 'Evidence before opinion',
        body:
          'Every price we put to a buyer or a seller comes from transaction comparables and the ' +
          'group’s RICS-regulated valuers, not from the asking prices around it. That is what makes ' +
          'an offer defensible and a counter-offer credible.',
      },
      {
        title: 'One desk to completion',
        body:
          'The adviser who sources the property negotiates it, coordinates the mortgage desk and the ' +
          'valuers, and is at the transfer. Nothing is handed to a different team halfway through, ' +
          'which is where most transactions lose their thread.',
      },
    ],
  },
  insights: {
    title: 'Deciding Before the Deal',
    lede:
      'The best property decisions are made before the offer, on evidence rather than on instinct. ' +
      'Explore our latest thinking on buying, funding and holding real estate in the UAE.',
    all: { label: 'Learn more', href: '/blogs/' },
    cards: SITE_ARTICLES,
  },
  story: {
    ...STORY_PHOTO,
    alt: 'An adviser reviewing a property file',
    quote:
      'We had two offers on the table and no way to judge them. Valunxt priced the asset on ' +
      'comparables, ran the diligence and handled the negotiation — and the deal closed at the ' +
      'number they said it would.',
    initials: 'AH',
    role: 'Private investor',
    org: 'Dubai residential portfolio',
    pill: 'Success story',
    title: 'An Off-Market Acquisition, Priced on Evidence',
    stat: 'Two weeks',
    note: 'from instruction to a signed MOU, with valuation, diligence and negotiation from one desk.',
    cta: { label: 'Discuss Your Case', href: '/free-consultation/' },
    arrow: { href: '/services/real-estate-transactions/', label: 'More about Real Estate' },
  },
  band: {
    ...BAND_PHOTO,
    title: 'Valunxt Transaction Intelligence',
    body:
      'Working with the group’s RICS-regulated valuers, research team and mortgage desk, Valunxt ' +
      'turns a property search into a decision you can defend — priced, checked and negotiated ' +
      'before the money moves.',
    cta: { label: "Discover what's next", href: '/services/technology-data-ai/' },
  },
  vision: SHARED_VISION,
  strip: stripOf('real-estate-transactions', [
    'Buying',
    'Selling & Leasing',
    'Off-Plan',
    'Due Diligence',
    'Negotiation',
    'Completion',
  ]),
  talk: {
    head: REAL_ESTATE_TEMPLATE.close.head,
    lede: REAL_ESTATE_TEMPLATE.close.lede,
    cta: REAL_ESTATE_TEMPLATE.close.primary,
    image: REAL_ESTATE_TEMPLATE.close.image,
  },
};

const SPECS: SubSpec[] = [
  {
    slug: 'buy-property',
    title: 'Buy Property',
    lede: 'Your next home or investment starts with the right opportunity. Explore the UAE property market with expertise guiding every move.',
    brief: {
      lede: [
        'Buying property should feel exciting, not complicated. Whether it is a place to call home or an investment for the future, Valunxt brings the search, market perspective and transaction support together to make the journey easier from the start.',
        'Tell us what you are looking for. We help you narrow the market, explore the right opportunities and move forward when the right property comes along.',
      ],
      /* The document heads each list; the brief has a plain paragraph before
         each list and no heading, so the heading is set as that paragraph. */
      whatIntro: 'A Property Search Built Around You',
      /* The document's points are a title over a sentence. The list renders a
         bold lead-in followed by the rest on one line, so a full stop closes
         each lead, as the how-lists on the other pages do. */
      what: [
        { lead: 'Properties That Fit.', text: 'Explore homes and investment opportunities matched to your location, budget and priorities.' },
        { lead: 'More Relevant Options.', text: 'Compare apartments, villas, townhouses and investment properties without getting lost in endless listings.' },
        { lead: 'Market Perspective.', text: 'Understand the location, pricing and market dynamics behind the properties you are considering.' },
        { lead: '100% Transparency.', text: 'Stay informed on the property, price, process and next steps throughout your purchase.' },
      ],
      howIntro: 'From Search to Keys',
      how: [
        { lead: 'Curated Viewings.', text: 'View properties worth your time, selected around what you are actually looking for.' },
        { lead: 'Confident Negotiation.', text: 'Move into offers with market context and support when price and terms matter.' },
        { lead: 'Hassle-Free Coordination.', text: 'Navigate documentation, approvals and transaction requirements without chasing every step yourself.' },
        { lead: 'Seamless Closure.', text: 'From an accepted offer to transfer and handover, we help keep everything moving until the keys are yours.' },
      ],
      panel: {
        title: 'Buying Property, Made Effortless.',
        sub: 'From finding the right property to negotiating the right terms and completing the transaction, we stay with you through every move.',
      },
    },
    override: {
      why: {
        pill: 'Why us?',
        /* Two lines in the document, three in the card, the last of them
           highlighted: the second line is split so the highlight lands on its
           final word. */
        titleTop: 'Your Property Search.',
        titleMid: 'Without the',
        titleMark: 'Guesswork.',
        note: 'From the right opportunities to the right terms, we bring transparency, market insight and dedicated support to every move.',
        /* The document gives the buttons labels but no destinations; the
           search buttons lead where every other UAE consultation button does. */
        cta: { label: 'Find My Property', href: '/free-consultation/' },
        ...WHY_PHOTO,
      },
      approach: {
        eyebrow: 'Our approach',
        columns: [
          {
            title: 'Understand What Matters',
            /* The commas around "today and over the longer term" stand where
               the document's dashes were. */
            body: 'We start by understanding what you want from the property, today and over the longer term, before shaping the search around you.',
          },
          {
            title: 'Explore With Perspective',
            body: 'We help you compare opportunities beyond the surface, bringing greater context to the properties and communities you are considering.',
          },
          {
            title: 'Move With Confidence',
            body: 'When the right opportunity stands out, we help turn consideration into action with clear guidance through the decisions that follow.',
          },
        ],
      },
      insights: {
        title: 'Know the Market. Spot the Opportunity.',
        lede: 'Explore the locations, trends and market intelligence shaping smarter property decisions across the UAE.',
        /* /blogs/ is where the header's Insights item leads. The document's
           four cards are topics, not published articles, so each leads there
           too and carries no category, kind or date. The plates are the four
           the site's articles use. */
        all: { label: 'Explore Market Insights', href: '/blogs/' },
        cards: [
          { title: 'Where Buyers Are Looking', excerpt: 'Communities gaining attention and why.', href: '/blogs/', image: 'blogs/blog-1.webp', alt: '' },
          { title: 'Ready vs Off-Plan', excerpt: 'Which route fits your property goals?', href: '/blogs/', image: 'blogs/blog-2.webp', alt: '' },
          { title: 'What Drives Property Value?', excerpt: 'The factors influencing what a property is worth.', href: '/blogs/', image: 'blogs/blog-3.webp', alt: '' },
          { title: 'Before You Buy', excerpt: 'The insights worth knowing before you commit.', href: '/blogs/', image: 'blogs/blog-4.webp', alt: '' },
        ],
      },
      story: {
        ...STORY_PHOTO,
        alt: 'An adviser reviewing a property file',
        /* The document gives the quote no speaker and the panel no label, so
           the attribution row and the pill are left off rather than invented. */
        quote: 'Valunxt made our property search much more focused. We explored the right options, understood the market better and had support throughout the purchase.',
        title: 'More Choice. One Focused Property Search.',
        stat: '50K+',
        note: 'property listings giving buyers access to opportunities across the UAE market.',
        cta: { label: 'Find Your Property', href: '/free-consultation/' },
        arrow: { href: '/services/real-estate-transactions/', label: 'More about Real Estate' },
      },
      band: {
        ...BAND_PHOTO,
        /* The document sets a kicker over a headline; the band has one heading
           and one paragraph, so the kicker is the heading and the headline
           opens the paragraph. Its own paragraph was tried first and sat as a
           stray short line in the right-aligned side column. */
        title: 'Valunxt Property Intelligence',
        body: 'More Clarity Behind Every Property Choice. Go beyond the listing with a clearer view of location, pricing, market movement and investment potential so you understand the opportunity before you make your move.',
        cta: { label: 'Get in Touch', href: '/contact/' },
      },
      vision: {
        /* Each step in the document is a title, a one-line lead and a
           sentence; a step has a title and a body, so the lead opens the body. */
        steps: [
          {
            title: 'Property Selection',
            body: 'More relevant from the start. Explore opportunities aligned with your location, budget, lifestyle and investment priorities.',
          },
          {
            title: 'Market Intelligence',
            body: 'Know what sits behind the price. Understand pricing trends, demand, community dynamics and the market signals influencing your decision.',
          },
          {
            title: 'Connected Expertise',
            body: 'More support when you need it. Access valuation, mortgage and research expertise alongside your property journey when the decision calls for it.',
          },
        ],
        pill: 'Our Vision',
        /* The comma after "clearer" stands where the document's dash was. */
        quote: 'To make every property decision clearer, connecting the right opportunity with the insight to recognise its potential.',
      },
      /* "Explore by Property" heads the strip in the document; the row's
         heading block is hidden by the home page's CSS, so nothing shows it. */
      strip: stripOf('real-estate-transactions', [
        'Apartments',
        'Villas',
        'Townhouses',
        'Waterfront Homes',
        'Investment Properties',
        'Ready Properties',
      ]),
      talk: {
        head: 'Your Next Property Move Starts Here.',
        lede: 'Ready to turn your property plans into your next address? Start the conversation with Valunxt.',
        cta: { label: 'Start Your Search', href: '/free-consultation/' },
        image: REAL_ESTATE_TEMPLATE.close.image,
      },
    },
  },
  {
    slug: 'sell-rent-lease-property',
    title: 'Sell & Lease Property',
    /* The document's breadcrumb and kicker keep the registry's longer name. */
    crumb: 'Sell & Rent/Lease Property',
    lede: 'Take your property to market with the right positioning, the right audience and a strategy built around your goals.',
    brief: {
      lede: [
        'Putting a property on the market is easy. Positioning it to attract the right buyer or tenant takes a more considered approach.',
        'Whether you are selling a property, leasing an investment or looking for the right tenant, ValuNxt brings market perspective, property positioning and transaction support together to help you achieve the right outcome.',
      ],
      whatIntro: 'Position Your Property to Perform',
      what: [
        { lead: 'Market-Led Pricing.', text: 'Understand where your property sits in the current market and establish a price supported by relevant market context.' },
        { lead: 'Stronger Positioning.', text: 'Bring forward the features, location and advantages that make your property relevant to prospective buyers or tenants.' },
        { lead: 'Focused Market Reach.', text: 'Connect your property with relevant demand through a more targeted approach to the market.' },
        { lead: '100% Transparency.', text: 'Stay informed on enquiries, viewings, offers and progress throughout the process.' },
      ],
      howIntro: 'From Market to Move-Out',
      how: [
        { lead: 'Qualified Enquiries.', text: 'Focus on serious prospective buyers and tenants who match the opportunity.' },
        { lead: 'Managed Viewings.', text: 'Coordinate property viewings efficiently while keeping the experience organised for everyone involved.' },
        { lead: 'Confident Negotiation.', text: 'Navigate offers, rental terms and commercial discussions with market context behind every conversation.' },
        { lead: 'Hassle-Free Closure.', text: 'Move from agreed terms through documentation, coordination and final handover with support at every stage.' },
      ],
      panel: {
        title: 'Your Property. Positioned to Perform.',
        sub: 'From taking your property to market to negotiating terms and completing the transaction, we help keep every move focused on the right outcome.',
      },
    },
    override: {
      why: {
        pill: 'Why us?',
        /* Two lines in the document; split so each of the card's three lines
           holds at 1280, with the highlight on the closing words. */
        titleTop: 'Your Property',
        titleMid: 'Deserves More Than',
        titleMark: 'Market Exposure.',
        note: 'We combine market insight, strategic positioning and focused execution to connect your property with the right buyers or tenants.',
        cta: { label: 'List Your Property', href: '/free-consultation/' },
        ...WHY_PHOTO,
      },
      approach: {
        eyebrow: 'Our approach',
        columns: [
          {
            title: 'Understand the Property',
            body: 'We start with your property, priorities and timeline to understand what you want from the sale or lease before shaping the strategy.',
          },
          {
            title: 'Position for the Market',
            body: 'We bring pricing, presentation and market context together to position your property around the buyers or tenants you want to reach.',
          },
          {
            title: 'Turn Interest Into Action',
            body: 'When the right interest comes in, we help move conversations forward with clear guidance through offers, negotiation and the decisions that follow.',
          },
        ],
      },
      insights: {
        title: 'Know Your Market. Position With Purpose.',
        lede: 'Understand the pricing, demand and property trends influencing how buyers and tenants are moving across the UAE market.',
        all: { label: 'Explore Market Insights', href: '/blogs/' },
        cards: [
          { title: 'What Is Your Property Worth?', excerpt: 'The factors influencing sale and rental expectations.', href: '/blogs/', image: 'blogs/blog-1.webp', alt: '' },
          { title: 'What Are Buyers Looking For?', excerpt: 'Features and locations attracting market attention.', href: '/blogs/', image: 'blogs/blog-2.webp', alt: '' },
          { title: 'Price It Right', excerpt: 'Why market positioning matters from day one.', href: '/blogs/', image: 'blogs/blog-3.webp', alt: '' },
          { title: 'Sell or Lease?', excerpt: 'What to consider when deciding your property’s next move.', href: '/blogs/', image: 'blogs/blog-4.webp', alt: '' },
        ],
      },
      story: {
        ...STORY_PHOTO,
        alt: 'An adviser reviewing a property file',
        quote: 'ValuNxt gave us a clearer view of the market and helped keep the entire process focused, from positioning the property to completing the transaction.',
        pill: 'Market Reach',
        title: 'Your Property. More Opportunity to Be Seen.',
        stat: '30K+',
        note: 'property listings across the platform, connecting property opportunities with an active UAE market.',
        cta: { label: 'List Your Property', href: '/free-consultation/' },
        arrow: { href: '/services/real-estate-transactions/', label: 'More about Real Estate' },
      },
      band: {
        ...BAND_PHOTO,
        title: 'Valunxt Property Intelligence',
        /* The comma after "strategy" stands where a dash had already been
           taken out of the document's sentence. "Discover more" leads where
           the home page's "Discover insights" does. */
        body: 'Position Better. Move Smarter. Turn property insight into a stronger market strategy, from understanding value and demand to making the right move at the right time.',
        cta: { label: 'Discover More', href: '/blogs/' },
      },
      vision: {
        steps: [
          {
            title: 'Property Positioning',
            body: 'Make the opportunity clear. Bring together property characteristics, location and market context to create a stronger proposition for prospective buyers or tenants.',
          },
          {
            title: 'Valuation Perspective',
            body: 'Know where value stands. Access valuation expertise when you need an independent perspective on your property and its value.',
          },
          {
            title: 'Market Intelligence',
            body: 'Understand the demand. Use wider research and market intelligence to understand the trends influencing property decisions and market activity.',
          },
        ],
        pill: 'Our Vision',
        quote: 'To make selling and leasing property more transparent, strategic and seamless from market entry to final handover.',
      },
      /* "Property Types We Support" heads the strip in the document; the
         row's heading block is hidden, as on the other pages. */
      strip: stripOf('real-estate-transactions', [
        'Apartments',
        'Villas',
        'Townhouses',
        'Waterfront Properties',
        'Investment Properties',
        'Commercial Properties',
      ]),
      talk: {
        head: 'Ready to Make Your Property’s Next Move?',
        lede: 'Whether you are ready to sell, looking for the right tenant or exploring your options, start with a clearer view of the market.',
        cta: { label: 'List Your Property', href: '/free-consultation/' },
        image: REAL_ESTATE_TEMPLATE.close.image,
      },
    },
  },
  {
    slug: 'off-plan-properties',
    title: 'Off-Plan Properties',
    lede: 'Discover what’s coming next. Explore new developments and investment opportunities with a clearer view of their potential.',
    brief: {
      lede: [
        'Buying off-plan is about more than choosing a property before it is built. The developer, location, payment plan, project timeline and future market potential can all shape the opportunity.',
        'ValuNxt helps you navigate these considerations, compare projects and explore off-plan opportunities aligned with how you want to live, invest or build your property portfolio.',
      ],
      whatIntro: 'Explore What’s Coming Next',
      what: [
        { lead: 'Curated Developments.', text: 'Explore selected projects across emerging and established communities based on your requirements and investment goals.' },
        { lead: 'Developer Perspective.', text: 'Look beyond the project itself with greater context around the developer, development and proposition.' },
        { lead: 'Payment Plan Comparison.', text: 'Understand payment structures, milestones and financial commitments before deciding which opportunity fits.' },
        { lead: 'Market Potential.', text: 'Consider location, surrounding development, demand and wider market dynamics when evaluating an off-plan opportunity.' },
      ],
      howIntro: 'From Launch to Handover',
      how: [
        { lead: 'Project Comparison.', text: 'Compare developments, unit options and propositions before narrowing down your preferred opportunity.' },
        { lead: 'Unit Selection.', text: 'Explore available configurations, layouts and positioning to identify options aligned with your priorities.' },
        { lead: 'Booking & Documentation.', text: 'Navigate reservation, documentation and transaction requirements with support through the process.' },
        { lead: 'Handover Support.', text: 'Stay supported as the project progresses towards completion and your property moves closer to handover.' },
      ],
      panel: {
        title: 'Invest in Off-Plan Property.',
        sub: 'Explore off-plan developments with the market perspective and transaction support to look beyond the launch and understand the opportunity.',
      },
    },
    override: {
      why: {
        pill: 'Why us?',
        titleTop: 'Don’t Just Choose',
        titleMid: 'a Project. Choose',
        titleMark: 'Potential.',
        note: 'We help you look beyond brochures and launches to the location, developer, payment structure and market factors behind the opportunity.',
        cta: { label: 'Explore Off-Plan', href: '/free-consultation/' },
        ...WHY_PHOTO,
      },
      approach: {
        eyebrow: 'Our approach',
        columns: [
          {
            title: 'Start With Your Objective',
            /* The comma after "achieve" stands where a dash had already been
               taken out of the document's sentence. */
            body: 'We begin with what you want the property to achieve, from future living to investment potential, before exploring relevant developments.',
          },
          {
            title: 'Compare Beyond the Brochure',
            body: 'We bring projects, locations, developers and payment structures into perspective so you can compare opportunities on what matters.',
          },
          {
            title: 'Move From Interest to Ownership',
            body: 'Once an opportunity stands out, we help you navigate unit selection, booking and the decisions that take you towards ownership.',
          },
        ],
      },
      insights: {
        title: 'See Beyond the Launch. Read What Comes Next.',
        lede: 'Explore the developments, locations and market shifts shaping Dubai’s evolving off-plan landscape.',
        all: { label: 'Explore Market Insights', href: '/blogs/' },
        cards: [
          { title: 'Emerging Communities', excerpt: 'Where is Dubai’s next wave of development taking shape?', href: '/blogs/', image: 'blogs/blog-1.webp', alt: '' },
          { title: 'Developer & Project Insights', excerpt: 'What should you know before choosing a development?', href: '/blogs/', image: 'blogs/blog-2.webp', alt: '' },
          { title: 'Location Potential', excerpt: 'What can infrastructure and surrounding development mean for an area?', href: '/blogs/', image: 'blogs/blog-3.webp', alt: '' },
          { title: 'Off-Plan Market Trends', excerpt: 'What are buyer demand, launches and supply telling us about the market?', href: '/blogs/', image: 'blogs/blog-4.webp', alt: '' },
        ],
      },
      story: {
        ...STORY_PHOTO,
        alt: 'An adviser reviewing a property file',
        quote: 'ValuNxt helped us compare projects beyond the launch offers. We had a much clearer understanding of the location, payment plan and opportunity before making our decision.',
        pill: 'Off-Plan Access',
        title: 'More Projects. More Possibilities. One Focused Search.',
        stat: '100%',
        note: 'seamless support from project discovery and unit selection to booking, documentation and final handover.',
        cta: { label: 'Explore Projects', href: '/free-consultation/' },
        arrow: { href: '/services/real-estate-transactions/', label: 'More about Real Estate' },
      },
      band: {
        ...BAND_PHOTO,
        title: 'Valunxt Property Intelligence',
        body: 'Look Beyond the Launch. Bring project, location and market intelligence together to understand what could shape an off-plan opportunity over the years ahead.',
        cta: { label: 'Discover More', href: '/blogs/' },
      },
      vision: {
        steps: [
          {
            title: 'Developer Perspective',
            body: 'Know who is behind the project. Understand the developer, project proposition and relevant considerations before making a commitment.',
          },
          {
            title: 'Location Potential',
            body: 'Look at what is developing around it. Consider connectivity, infrastructure, surrounding development and community dynamics when assessing a location.',
          },
          {
            title: 'Investment Perspective',
            body: 'Think beyond the entry price. Look at payment structures, market dynamics and longer-term considerations when comparing opportunities.',
          },
        ],
        pill: 'Our Vision',
        /* The comma after "informed" stands where the document's dash was. */
        quote: 'To make off-plan decisions more informed, connecting today’s opportunities with a clearer view of what they could become.',
      },
      /* "Explore Off-Plan" heads the strip in the document; hidden, as above. */
      strip: stripOf('real-estate-transactions', [
        'New Launches',
        'Waterfront Developments',
        'Branded Residences',
        'Apartments',
        'Villas & Townhouses',
        'Investment Opportunities',
      ]),
      talk: {
        head: 'Your Next Property Move Starts Here.',
        lede: 'Ready to turn your property plans into your next address? Start the conversation with ValuNxt.',
        cta: { label: 'Get in Touch', href: '/contact/' },
        image: REAL_ESTATE_TEMPLATE.close.image,
      },
    },
  },
];

export const REAL_ESTATE_SUBS = buildSubs(PARENT, SPECS);
