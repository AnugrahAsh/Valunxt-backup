/**
 * The six pages under /en-ae/services/research-intelligence/.
 *
 * Practice-level sections once, page-level copy per sub-service; the names
 * and slugs are the registry's. See ../template/subTypes.ts for the shape,
 * the length rules and the note on the success story being a placeholder.
 *
 * ALL SIX PAGES ARE THE CLIENT'S page documents (20260914), word for word,
 * under the same two rules as the rest of the UAE pages: nothing added to the
 * documents or dropped from them, and no em dashes. Each document writes every
 * practice-level section for its page, so each page carries them in
 * `override`; the PARENT below is the shape they override and shows nowhere.
 * The same slot calls as the other sub-services apply, and the ones particular
 * to a page are marked at the line.
 *
 * THE STORY PANEL ON THESE PAGES has a headline and a sentence and no figure,
 * so the sentence stands where the figure's caption would, and two of the
 * panels have no button (Feasibility Studies, Investment Research).
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
import { RESEARCH_TEMPLATE } from './content';

const PARENT: SubParent = {
  service: 'research-intelligence',
  /* The documents write the breadcrumb out in full. */
  crumb: 'Research & Intelligence',
  hero: { image: RESEARCH_TEMPLATE.hero.image, alt: RESEARCH_TEMPLATE.hero.alt },
  panel: PANEL_PLATE,
  why: {
    pill: 'Why us?',
    titleTop: 'The Questions',
    titleMid: 'Deserve',
    titleMark: 'Real Answers',
    note: 'Tested, compared and quantified — before capital is committed.',
    cta: { label: 'Schedule a Call', href: '/free-consultation/' },
    ...WHY_PHOTO,
  },
  approach: {
    eyebrow: 'Our approach',
    columns: [
      {
        title: 'Evidence before recommendation',
        body:
          'We gather the data before we form the view, and we show the data in the report. A ' +
          'conclusion that cannot be traced to a source, a sample or a dataset is not one we ' +
          'publish — which is the difference between research and a well-written opinion.',
      },
      {
        title: 'UAE markets, first hand',
        body:
          'The group values, transacts and finances property across the emirates every week, so ' +
          'our researchers read the market from live evidence rather than from published ' +
          'indices alone — and know when an index is running behind what is actually happening.',
      },
      {
        title: 'Written for the decision',
        body:
          'Every study opens with the question that was asked and the answer that was found. The ' +
          'method and the data follow, for the reader who needs to test them; the summary is for ' +
          'the board that has ten minutes and a decision to make.',
      },
    ],
  },
  insights: {
    title: 'Evidence Before Commitment',
    lede:
      'The best investment decisions are made before the deal, not during it. Explore our latest ' +
      'thinking on markets, feasibility and the evidence behind property decisions in the UAE.',
    all: { label: 'Learn more', href: '/blogs/' },
    cards: SITE_ARTICLES,
  },
  story: {
    ...STORY_PHOTO,
    alt: 'A researcher reviewing a feasibility study',
    quote:
      'We had a site and three ideas for it. Valunxt’s feasibility study showed which one the ' +
      'market would actually absorb, and the numbers behind it went straight into the lender’s ' +
      'credit paper.',
    initials: 'FA',
    role: 'Development director',
    org: 'Sharjah mixed-use scheme',
    pill: 'Success story',
    title: 'A Feasibility Study That Chose the Scheme',
    stat: '3 options',
    note: 'tested on supply, demand and pricing evidence before a dirham of capital was committed.',
    cta: { label: 'Discuss Your Case', href: '/free-consultation/' },
    arrow: { href: '/services/research-intelligence/', label: 'More about Research' },
  },
  band: {
    ...BAND_PHOTO,
    title: 'Valunxt Market Intelligence',
    body:
      'Working with the group’s valuers, transaction desk and technology team, Valunxt turns a ' +
      'market question into evidence you can act on — gathered, tested and quantified before ' +
      'capital is committed.',
    cta: { label: "Discover what's next", href: '/services/technology-data-ai/' },
  },
  vision: SHARED_VISION,
  strip: stripOf('research-intelligence', [
    'Real Estate Research',
    'Market Research',
    'Investment Research',
    'Feasibility Studies',
    'Market Intelligence',
    'Research Reports',
  ]),
  talk: {
    head: RESEARCH_TEMPLATE.close.head,
    lede: RESEARCH_TEMPLATE.close.lede,
    cta: RESEARCH_TEMPLATE.close.primary,
    image: RESEARCH_TEMPLATE.close.image,
  },
};

const SPECS: SubSpec[] = [
  {
    slug: 'real-estate-research',
    title: 'Real Estate Research',
    lede: 'Independent research into property markets, sectors and locations to reveal the forces shaping performance, demand and opportunity.',
    brief: {
      lede: [
        'Real estate markets rarely move as one. Performance can differ significantly between locations, asset classes and price segments as supply, demand, transactions, occupier behaviour and development activity change.',
        'ValuNxt examines these market dynamics together, turning property data into a more complete understanding of where the market stands, what is influencing its direction and where meaningful shifts may be emerging.',
      ],
      whatIntro: 'What We Examine',
      what: [
        { lead: 'Transactions & Pricing.', text: 'Track transaction activity, sales values and pricing movements to understand how market behaviour is changing.' },
        { lead: 'Supply & Pipeline.', text: 'Assess existing inventory, upcoming developments and future supply that could influence market balance.' },
        { lead: 'Demand & Absorption.', text: 'Examine demand patterns and market absorption to understand where activity is strengthening, stabilising or changing.' },
        { lead: 'Rents & Yields.', text: 'Analyse rental performance and relevant yield movements to provide perspective on income and market conditions.' },
      ],
      howIntro: 'Research Across the Market',
      how: [
        { lead: 'Residential.', text: 'Examine sales, rentals, supply, demand and location-level performance across residential markets.' },
        { lead: 'Office.', text: 'Assess occupier demand, rental movements, availability, new supply and changing workplace requirements.' },
        { lead: 'Retail & Hospitality.', text: 'Study market performance, demand patterns, supply dynamics and sector-specific indicators.' },
        { lead: 'Industrial & Logistics.', text: 'Analyse occupier activity, supply, rents, location dynamics and the forces influencing industrial and logistics markets.' },
      ],
      panel: {
        title: 'See the Market Beneath the Headlines.',
        sub: 'Look beyond market-wide averages to understand the locations, sectors and signals shaping real estate performance.',
      },
    },
    override: {
      why: {
        pill: 'Why Valunxt?',
        titleTop: 'Research',
        titleMid: 'Grounded in',
        titleMark: 'Real Estate.',
        note: 'Property expertise, market evidence and analytical thinking come together to provide a more informed perspective on changing real estate markets.',
        cta: { label: 'Explore Our Expertise', href: '/services/research-intelligence/' },
        ...WHY_PHOTO,
      },
      approach: {
        eyebrow: 'Our research approach',
        columns: [
          { title: 'Define the Market', body: 'We establish the geography, property sector, market segment and decision context to focus the research on what is genuinely relevant.' },
          { title: 'Analyse the Evidence', body: 'Transactions, pricing, rents, supply, demand and other relevant indicators are examined to identify patterns, relationships and changes within the market.' },
          { title: 'Interpret the Direction', body: 'We connect the evidence to the wider market context, highlighting the forces influencing current performance and the developments that may shape what comes next.' },
        ],
      },
      insights: {
        title: 'Markets Move Differently. Research Shows Where.',
        lede: 'Explore the trends, locations and property sectors shaping the next phase of the real estate market.',
        all: { label: 'Explore Research Insights', href: '/blogs/' },
        cards: [
          { title: 'Is Headline Growth Hiding a Different Story?', excerpt: 'Why market-wide performance can look very different when examined by location, segment and property type.', href: '/blogs/', image: 'blogs/blog-1.webp', alt: '' },
          { title: 'What Happens When Supply Catches Up?', excerpt: 'How development pipelines and future completions can reshape market balance.', href: '/blogs/', image: 'blogs/blog-2.webp', alt: '' },
          { title: 'Where Is Rental Demand Moving?', excerpt: 'What changing occupier and tenant behaviour can reveal about emerging market dynamics.', href: '/blogs/', image: 'blogs/blog-3.webp', alt: '' },
          { title: 'Which Signals Matter Before Prices Move?', excerpt: 'Looking beyond headline values to the indicators that can reveal changes developing beneath the market.', href: '/blogs/', image: 'blogs/blog-4.webp', alt: '' },
        ],
      },
      story: {
        ...STORY_PHOTO,
        alt: 'A researcher reviewing a market report',
        quote: 'We needed a clearer view of how different locations and property segments were actually performing. ValuNxt helped us look beyond headline market figures and understand the dynamics influencing the areas relevant to our strategy.',
        pill: 'Market Perspective',
        title: 'From Market Data to Market Direction.',
        note: 'Research that brings transactions, supply, demand, pricing and sector performance together to reveal a more complete picture of the property market.',
        cta: { label: 'Explore Our Research', href: '/research/' },
        arrow: { href: '/services/research-intelligence/', label: 'More about Research & Intelligence' },
      },
      band: {
        ...BAND_PHOTO,
        title: 'Valunxt Real Estate Intelligence',
        /* The comma after "interact" stands where the document's dash was. */
        body: 'What Is Moving the Market? Understanding real estate requires more than tracking prices. It means recognising how supply, demand, activity and location interact, and how those relationships are changing.',
        cta: { label: 'Discover More', href: '/blogs/' },
      },
      vision: {
        steps: [
          { title: 'Activity', body: 'Follow where the market moves. Examine transactions, leasing activity and other indicators to understand where momentum is building or changing.' },
          { title: 'Balance', body: 'Read supply against demand. Assess existing and future supply alongside demand to understand the forces influencing market conditions.' },
          { title: 'Location', body: 'Look beneath the average. Compare areas and submarkets to identify differences that broader market figures may not reveal.' },
        ],
        pill: 'Our Vision',
        quote: 'To make property markets more understandable through research that reveals what the headline numbers cannot.',
      },
      /* "Research Across" heads the strip in the document; hidden slot. */
      strip: stripOf('research-intelligence', ['Residential', 'Office', 'Retail', 'Hospitality', 'Industrial & Logistics', 'Mixed-Use']),
      talk: {
        head: 'The Market Is Moving. Know What Is Driving It.',
        lede: 'Get a research-led view of the property markets, sectors and locations relevant to your next decision.',
        cta: { label: 'Speak to Our Research Team', href: '/free-consultation/' },
        image: RESEARCH_TEMPLATE.close.image,
      },
    },
  },
  {
    slug: 'market-research',
    title: 'Market Research',
    lede: 'Structured market research into demand, customers, competition and commercial dynamics to uncover where opportunity exists.',
    brief: {
      /* The commas after "angles" and around "or could sit" stand where the
         document's dashes were. */
      lede: [
        'A market can look attractive at headline level while telling a very different story beneath the surface. Demand may vary by customer segment, competitive intensity can change quickly, and pricing or positioning can determine whether an opportunity is commercially compelling.',
        'ValuNxt examines the market from multiple angles, bringing together demand, customer behaviour, competitive activity and commercial evidence to help businesses understand how a market works and where meaningful opportunities may exist.',
      ],
      whatIntro: 'What We Examine',
      what: [
        { lead: 'Market Size & Demand.', text: 'Assess the scale of the market, demand characteristics and the factors influencing current and future activity.' },
        { lead: 'Customers & Segments.', text: 'Understand target audiences, customer needs, behaviours and the segments most relevant to the opportunity.' },
        { lead: 'Competition & Positioning.', text: 'Examine competitors, propositions and market positioning to understand where a business sits, or could sit, within the landscape.' },
        { lead: 'Pricing & Market Dynamics.', text: 'Analyse pricing structures, market movements and commercial factors that can influence competitiveness and demand.' },
      ],
      howIntro: 'Research Built Around the Decision',
      how: [
        { lead: 'Market Entry.', text: 'Understand the opportunity, competitive environment and market conditions before entering a new geography or sector.' },
        { lead: 'Expansion.', text: 'Assess demand and market potential when considering new locations, customer segments or areas of growth.' },
        { lead: 'Product & Service Positioning.', text: 'Explore customer expectations, competitive propositions and pricing to inform how an offering enters or evolves within the market.' },
        { lead: 'Strategic Planning.', text: 'Bring external market evidence into business planning, growth priorities and longer-term commercial decisions.' },
      ],
      panel: {
        title: 'Know What Shapes the Market.',
        sub: 'Look deeper into demand, customer behaviour and competition to understand the forces influencing commercial potential.',
      },
    },
    override: {
      why: {
        pill: 'Why Valunxt?',
        titleTop: 'Market Understanding.',
        titleMid: 'Built Over',
        titleMark: 'Decades.',
        note: 'Deep market experience brings context to the data, helping us interpret what is changing, what matters and what it could mean for your business.',
        cta: { label: 'Speak With an Expert', href: '/free-consultation/' },
        ...WHY_PHOTO,
      },
      approach: {
        eyebrow: 'Our research approach',
        columns: [
          { title: 'Frame the Question', body: 'We define the market, audience and commercial objective so the research begins with the decision that needs to be informed.' },
          { title: 'Build the Evidence', body: 'Relevant market, customer, competitor and pricing information is gathered and analysed to establish a credible view of the landscape.' },
          { title: 'Find What Matters', body: 'We interpret the evidence to identify patterns, gaps, risks and opportunities with the greatest relevance to the business question.' },
        ],
      },
      insights: {
        title: 'Beyond the Headline Numbers.',
        lede: 'Explore the customer, competitive and commercial forces that can change how a market opportunity is understood.',
        all: { label: 'Explore Market Insights', href: '/blogs/' },
        cards: [
          { title: 'A Large Market Is Not Always a Large Opportunity', excerpt: 'Why addressable demand matters more than the headline size of a market.', href: '/blogs/', image: 'blogs/blog-1.webp', alt: '' },
          { title: 'What Are Your Competitors Really Competing On?', excerpt: 'Looking beyond price to understand positioning, proposition and differentiation.', href: '/blogs/', image: 'blogs/blog-2.webp', alt: '' },
          { title: 'When Customer Behaviour Changes the Strategy', excerpt: 'How shifts in expectations and purchasing behaviour can reshape commercial opportunity.', href: '/blogs/', image: 'blogs/blog-3.webp', alt: '' },
          { title: 'Is the Market Ready for Another Player?', excerpt: 'What demand, competition and market structure can reveal before entry.', href: '/blogs/', image: 'blogs/blog-4.webp', alt: '' },
        ],
      },
      story: {
        ...STORY_PHOTO,
        alt: 'A researcher reviewing a market report',
        quote: 'We were evaluating a new market and needed more than high-level industry data. ValuNxt helped us understand the customer landscape, competitive environment and commercial factors that mattered to our decision.',
        pill: 'From Research to Strategy',
        title: 'Evidence That Moves Strategy Forward.',
        note: 'Research that brings customers, competitors, demand and commercial conditions together to reveal where a business can realistically compete and grow.',
        cta: { label: 'Explore Our Research', href: '/research/' },
        arrow: { href: '/services/research-intelligence/', label: 'More about Research & Intelligence' },
      },
      band: {
        ...BAND_PHOTO,
        title: 'Valunxt Market Perspective',
        body: 'The Forces Behind Market Opportunity. Its real potential becomes clearer when demand, customers, competition and commercial conditions are examined together.',
        cta: { label: 'Discover More', href: '/blogs/' },
      },
      vision: {
        steps: [
          { title: 'Demand', body: 'Understand who wants what. Examine where demand exists, how it differs across segments and what may influence its direction.' },
          { title: 'Competition', body: 'See where others stand. Understand the competitive landscape, existing propositions and the areas where differentiation may be possible.' },
          { title: 'Opportunity', body: 'Find where the gap is. Connect market and customer evidence to identify areas with stronger commercial potential.' },
        ],
        pill: 'Our Vision',
        quote: 'To reveal the market realities behind meaningful commercial opportunity.',
      },
      /* "Research For" heads the strip in the document; hidden slot. */
      strip: stripOf('research-intelligence', ['Market Entry', 'Business Expansion', 'Customer Segmentation', 'Competitive Analysis', 'Product Positioning', 'Growth Strategy']),
      talk: {
        head: 'Before You Enter the Market, Understand It.',
        lede: 'Build your next commercial move on a deeper understanding of demand, customers, competition and opportunity.',
        cta: { label: 'Speak to Our Research Team', href: '/free-consultation/' },
        image: RESEARCH_TEMPLATE.close.image,
      },
    },
  },
  {
    slug: 'investment-research',
    title: 'Investment Research',
    lede: 'Independent research into markets, sectors and opportunities to understand the fundamentals, risks and forces that can shape investment performance.',
    brief: {
      lede: [
        'An investment case is rarely defined by a single return measure. Market fundamentals, income potential, capital flows, economic conditions, sector dynamics and risk can all influence how an opportunity performs over time.',
        'ValuNxt brings these factors into one research framework, helping investors understand what supports an opportunity, where the uncertainties lie and how it compares within the wider market.',
      ],
      whatIntro: 'What We Examine',
      what: [
        { lead: 'Market Fundamentals.', text: 'Assess the economic, sector and demand conditions supporting the investment environment.' },
        { lead: 'Performance Drivers.', text: 'Examine the income, growth and market factors that could influence investment performance.' },
        { lead: 'Capital & Market Activity.', text: 'Consider transaction activity, investor behaviour, liquidity and capital movements relevant to the opportunity.' },
        { lead: 'Risk & Outlook.', text: 'Evaluate market risks, changing conditions and forward-looking factors that could affect the investment case.' },
      ],
      howIntro: 'Research Around the Investment',
      how: [
        { lead: 'Opportunity Assessment.', text: 'Examine the fundamentals and market conditions surrounding a potential investment opportunity.' },
        { lead: 'Sector Analysis.', text: 'Compare sectors to understand differences in performance drivers, market maturity and investment dynamics.' },
        { lead: 'Location Analysis.', text: 'Assess the economic, demographic and market characteristics influencing investment potential across locations.' },
        { lead: 'Comparative Research.', text: 'Place opportunities alongside relevant alternatives to understand their relative strengths, risks and market positioning.' },
      ],
      panel: {
        title: 'Look Beyond the Opportunity.',
        sub: 'Understand the market forces, performance drivers and risks that determine whether an investment case deserves a closer look.',
      },
    },
    override: {
      why: {
        pill: 'Why Valunxt?',
        titleTop: 'Evidence Behind',
        titleMid: 'Investment',
        titleMark: 'Decisions.',
        note: 'Research brings market evidence, commercial understanding and analytical perspective together to examine opportunities in the context that matters to investors.',
        cta: { label: 'Speak With an Expert', href: '/free-consultation/' },
        ...WHY_PHOTO,
      },
      approach: {
        eyebrow: 'Our research approach',
        columns: [
          { title: 'Define the Investment Case', body: 'We establish the opportunity, investment objectives and market context to determine the questions the research needs to answer.' },
          { title: 'Test the Fundamentals', body: 'We examine market conditions, demand, performance drivers, capital activity and risk to understand the strength of the underlying investment case.' },
          { title: 'Assess the Opportunity', body: 'We bring the evidence together, compare relevant alternatives and identify the factors that could strengthen or challenge future investment performance.' },
        ],
      },
      insights: {
        title: 'What’s Changing the Investment Landscape?',
        lede: 'Perspectives on the forces, risks and opportunities reshaping markets and investment thinking.',
        all: { label: 'Explore Investment Insights', href: '/blogs/' },
        cards: [
          { title: 'Strong Market. Strong Investment?', excerpt: 'Why favourable market conditions do not automatically make every opportunity equally compelling.', href: '/blogs/', image: 'blogs/blog-1.webp', alt: '' },
          { title: 'Where Will Returns Really Come From?', excerpt: 'Understanding the role of income, growth and changing market conditions in investment performance.', href: '/blogs/', image: 'blogs/blog-2.webp', alt: '' },
          { title: 'When Does Risk Change the Investment Case?', excerpt: 'Why the same opportunity can look different when uncertainty, timing and market exposure are considered.', href: '/blogs/', image: 'blogs/blog-3.webp', alt: '' },
          { title: 'What Is Capital Telling the Market?', excerpt: 'How investor activity, transaction volumes and liquidity can reveal changing market conviction.', href: '/blogs/', image: 'blogs/blog-4.webp', alt: '' },
        ],
      },
      story: {
        ...STORY_PHOTO,
        alt: 'A researcher reviewing a market report',
        quote: 'We needed to understand how an opportunity stood against the wider market before taking it further. ValuNxt helped us examine the fundamentals, risks and market factors behind the investment case.',
        pill: 'Investment Perspective',
        title: 'Research the Market. Read the Opportunity.',
        /* No button in the document. */
        note: 'Understand how market conditions, capital dynamics and performance drivers come together to shape investment potential.',
        arrow: { href: '/services/research-intelligence/', label: 'More about Research & Intelligence' },
      },
      band: {
        ...BAND_PHOTO,
        title: 'Valunxt Investment Perspective',
        body: 'See What Supports the Investment Case. Bring market fundamentals, performance potential and risk into one view of the opportunity.',
        cta: { label: 'Discover More', href: '/blogs/' },
      },
      vision: {
        steps: [
          { title: 'Fundamentals', body: 'Understand the foundation. Examine the market, demand and economic conditions supporting the opportunity.' },
          { title: 'Performance', body: 'Understand what could drive returns. Consider the income, growth and market factors that may influence investment performance.' },
          { title: 'Risk', body: 'Understand what could change. Assess uncertainty and market exposure alongside the factors that could challenge expected performance.' },
        ],
        pill: 'Our Vision',
        quote: 'To bring deeper intelligence to the decisions that shape investment outcomes.',
      },
      /* "Research For" heads the strip in the document; hidden slot. */
      strip: stripOf('research-intelligence', ['Investment Opportunities', 'Market & Sector Selection', 'Location Assessment', 'Comparative Analysis', 'Portfolio Strategy', 'Investment Planning']),
      talk: {
        head: 'Better Investment Decisions Start With Research.',
        lede: 'Bring deeper research, market evidence and investment perspective to your next capital decision.',
        cta: { label: 'Start a Conversation', href: '/free-consultation/' },
        image: RESEARCH_TEMPLATE.close.image,
      },
    },
  },
  {
    slug: 'feasibility-studies',
    title: 'Feasibility Studies',
    lede: 'Independent feasibility analysis that tests market demand, commercial assumptions and financial viability before a project moves forward.',
    brief: {
      lede: [
        'The viability of a project depends on how effectively its market potential, commercial structure and financial assumptions align. A feasibility study provides an objective assessment of these factors, examining demand, positioning, pricing, costs and other critical variables before significant commitments are made.',
        'ValuNxt combines market intelligence with commercial and financial analysis to assess the strength of the underlying proposition, test key assumptions and provide a clear basis for determining whether and under what conditions a project is commercially viable.',
      ],
      whatIntro: 'What We Assess',
      what: [
        { lead: 'Market Demand.', text: 'Examine the depth and characteristics of demand to understand whether the market can support the proposed concept.' },
        { lead: 'Competitive Landscape.', text: 'Assess existing and planned competition to understand market positioning, differentiation and potential pressure points.' },
        { lead: 'Concept & Positioning.', text: 'Evaluate whether the proposed offering, scale, customer proposition and positioning align with identified market requirements.' },
        { lead: 'Commercial Assumptions.', text: 'Test relevant pricing, revenue, cost and operating assumptions to understand the commercial foundations of the project.' },
      ],
      howIntro: 'Where Feasibility Matters',
      how: [
        { lead: 'New Developments.', text: 'Assess market support and commercial viability before progressing a proposed development.' },
        { lead: 'New Business Concepts.', text: 'Test demand, positioning and underlying assumptions before bringing a new concept to market.' },
        { lead: 'Expansion Plans.', text: 'Evaluate the case for entering a new location, increasing capacity or extending an existing operation.' },
        { lead: 'Project Repositioning.', text: 'Reassess the market proposition when changing conditions or performance require a different commercial direction.' },
      ],
      panel: {
        title: 'Clarity Before Commitment.',
        sub: 'Understand the commercial foundations of a project before taking it from concept to execution.',
      },
    },
    override: {
      why: {
        pill: 'Why Valunxt?',
        titleTop: 'Evidence Behind',
        titleMid: 'Every',
        titleMark: 'Assumption.',
        note: 'We examine market demand, commercial fundamentals and project economics together, testing the assumptions that ultimately determine viability.',
        cta: { label: 'Discuss Your Project', href: '/free-consultation/' },
        ...WHY_PHOTO,
      },
      approach: {
        eyebrow: 'Our feasibility approach',
        columns: [
          { title: 'Establish the Proposition', body: 'We define the project, target market, proposed positioning and commercial objectives to establish what needs to be tested.' },
          { title: 'Test the Assumptions', body: 'Demand, competition, pricing, costs, revenues and other relevant variables are examined to determine whether the underlying assumptions stand up to analysis.' },
          { title: 'Assess the Viability', body: 'Market findings and commercial analysis are brought together to identify key sensitivities, potential constraints and the overall feasibility of the proposition.' },
        ],
      },
      insights: {
        title: 'From Market Potential to Project Reality.',
        lede: 'Explore the trends, assumptions and commercial considerations influencing whether projects move forward.',
        all: { label: 'Explore Feasibility Insights', href: '/blogs/' },
        cards: [
          { title: 'Strong Demand. Wrong Concept?', excerpt: 'Why an attractive market does not guarantee that every proposition will succeed within it.', href: '/blogs/', image: 'blogs/blog-1.webp', alt: '' },
          { title: 'How Much Demand Is Enough?', excerpt: 'Why market size needs to be considered alongside realistic capture, competition and project scale.', href: '/blogs/', image: 'blogs/blog-2.webp', alt: '' },
          { title: 'When Pricing Changes the Entire Feasibility', excerpt: 'How seemingly small changes in pricing assumptions can influence the commercial case for a project.', href: '/blogs/', image: 'blogs/blog-3.webp', alt: '' },
          { title: 'What Happens When the Assumptions Move?', excerpt: 'Why sensitivity and scenario analysis matter when testing the resilience of a proposed project.', href: '/blogs/', image: 'blogs/blog-4.webp', alt: '' },
        ],
      },
      story: {
        ...STORY_PHOTO,
        alt: 'A researcher reviewing a market report',
        quote: 'We needed to know whether the opportunity was commercially sound before progressing further. ValuNxt challenged the key assumptions and helped us understand where the project was strong and where it needed reconsideration.',
        pill: 'Before Capital Is Committed',
        title: 'Evidence Before Execution.',
        /* No button in the document. */
        note: 'Test the commercial foundations of a project against the market conditions that will ultimately shape its performance.',
        arrow: { href: '/services/research-intelligence/', label: 'More about Research & Intelligence' },
      },
      band: {
        ...BAND_PHOTO,
        title: 'Valunxt Feasibility Perspective',
        body: 'Three Dimensions of Viability. A robust feasibility assessment considers whether the market can support the proposition, whether its economics are sustainable and how resilient the case remains as conditions change.',
        cta: { label: 'Discover More', href: '/blogs/' },
      },
      vision: {
        /* The document's step leads are title-case lines without a full stop;
           one closes each so the sentence after it can follow on. */
        steps: [
          { title: 'Demand', body: 'Market Support. Assess the depth, characteristics and direction of demand relevant to the proposed project.' },
          { title: 'Economics', body: 'Commercial Fundamentals. Test the assumptions behind revenues, costs, pricing and expected project performance.' },
          { title: 'Resilience', body: 'Sensitivity to Change. Examine how movements in critical assumptions and market conditions could affect overall viability.' },
        ],
        pill: 'Our Vision',
        quote: 'To bring evidence, perspective and commercial rigour to decisions that shape new projects.',
      },
      /* "Feasibility Studies For" heads the strip in the document; hidden slot. */
      strip: stripOf('research-intelligence', ['Real Estate Developments', 'New Business Concepts', 'Market Entry', 'Business Expansion', 'Project Repositioning', 'Product & Concept Assessment']),
      talk: {
        head: 'Before You Build the Opportunity, Test It.',
        lede: 'Understand whether the market, concept and commercial assumptions support the project before moving forward.',
        cta: { label: 'Discuss Your Project', href: '/free-consultation/' },
        image: RESEARCH_TEMPLATE.close.image,
      },
    },
  },
  {
    slug: 'market-intelligence',
    title: 'Market Intelligence',
    lede: 'Ongoing intelligence that identifies meaningful market shifts, interprets their implications and keeps decision-makers ahead of changing commercial conditions.',
    brief: {
      /* The comma after "movements" stands where the document's dash was. */
      lede: [
        'Markets rarely announce a turning point. Change often begins with smaller movements, shifts in demand, competitor activity, pricing behaviour, investment patterns or wider economic and regulatory developments.',
        'ValuNxt brings these developments into a continuous intelligence framework, separating meaningful change from market noise and providing decision-makers with a sharper view of the forces influencing their commercial environment.',
      ],
      whatIntro: 'What We Monitor',
      what: [
        { lead: 'Market Dynamics.', text: 'Follow changes in demand, activity, pricing and wider conditions to identify movements that could influence market direction.' },
        { lead: 'Competitive Landscape.', text: 'Examine competitor activity, new entrants, positioning and strategic developments that may alter the competitive environment.' },
        { lead: 'Customer & Demand Signals.', text: 'Track evolving behaviours, preferences and demand patterns that can indicate where commercial momentum is building or weakening.' },
        { lead: 'External Drivers.', text: 'Consider economic, regulatory, technological and sector developments that could reshape market conditions.' },
      ],
      howIntro: 'Intelligence Around Your Priorities',
      how: [
        { lead: 'Competitive Position.', text: 'Understand how the competitive landscape is evolving and where relative positioning may be changing.' },
        { lead: 'Growth Markets.', text: 'Identify markets, segments and areas where emerging activity warrants closer attention.' },
        { lead: 'Pricing Environment.', text: 'Follow movements in pricing and commercial behaviour that may influence positioning and performance.' },
        { lead: 'Strategic Exposure.', text: 'Recognise developments that could create new pressures, risks or implications for existing plans.' },
      ],
      panel: {
        title: 'The Market Beneath the Market.',
        sub: 'See beyond visible activity to the underlying movements shaping demand, competition and direction.',
      },
    },
    override: {
      why: {
        pill: 'Why Valunxt?',
        titleTop: 'Experience',
        titleMid: 'Behind the',
        titleMark: 'Insight.',
        note: 'Decades of market experience bring context to emerging developments, helping us recognise which movements deserve attention and what they could mean for the decisions ahead.',
        cta: { label: 'Speak With an Expert', href: '/free-consultation/' },
        ...WHY_PHOTO,
      },
      approach: {
        eyebrow: 'Our intelligence approach',
        columns: [
          { title: 'Focus on What Matters', body: 'We establish the markets, competitors, indicators and external developments most relevant to your commercial priorities.' },
          { title: 'Connect the Evidence', body: 'Market activity, demand behaviour, competitive movements and wider developments are examined together rather than as isolated information.' },
          { title: 'Interpret What Is Emerging', body: 'We identify meaningful patterns, assess their implications and bring attention to developments that could influence the decisions ahead.' },
        ],
      },
      insights: {
        title: 'Markets Change Before Headlines Do.',
        lede: 'Explore the early movements, competitive shifts and wider forces that can signal where markets are heading.',
        all: { label: 'Explore Insights', href: '/blogs/' },
        cards: [
          { title: 'Where Is Market Momentum Building?', excerpt: 'The indicators that can reveal strengthening or weakening activity before the wider direction becomes obvious.', href: '/blogs/', image: 'blogs/blog-1.webp', alt: '' },
          { title: 'What Is the Competition Seeing?', excerpt: 'How competitor movements can provide a different perspective on changing market expectations.', href: '/blogs/', image: 'blogs/blog-2.webp', alt: '' },
          { title: 'When Does Pricing Signal Something Bigger?', excerpt: 'What changes in pricing behaviour can reveal about demand, competition and market direction.', href: '/blogs/', image: 'blogs/blog-3.webp', alt: '' },
          { title: 'Which Changes Deserve Attention?', excerpt: 'Why the significance of a market development depends on its context, persistence and commercial relevance.', href: '/blogs/', image: 'blogs/blog-4.webp', alt: '' },
        ],
      },
      story: {
        ...STORY_PHOTO,
        alt: 'A researcher reviewing a market report',
        quote: 'We had access to plenty of market information, but needed a clearer understanding of which developments genuinely mattered to our business. ValuNxt helped us connect the changes across our market and focus attention on the issues most relevant to our strategy.',
        pill: 'From Information to Foresight',
        title: 'Know What Matters as It Changes.',
        note: 'Bring market developments into context and understand their potential implications before they become established market realities.',
        cta: { label: 'Explore Our Expertise', href: '/services/research-intelligence/' },
        arrow: { href: '/services/research-intelligence/', label: 'More about Research & Intelligence' },
      },
      band: {
        ...BAND_PHOTO,
        title: 'Valunxt Intelligence Perspective',
        body: 'The Forces Reshaping Markets. Examine how movements across demand, competition and market conditions can reshape the commercial landscape.',
        cta: { label: 'Discover More', href: '/blogs/' },
      },
      vision: {
        /* Step leads as on Feasibility Studies: a full stop closes each. */
        steps: [
          { title: 'Signals', body: 'Detect the Movement. Identify developments across markets, customers and competitors that indicate conditions may be shifting.' },
          { title: 'Meaning', body: 'Understand the Implication. Examine how emerging developments could affect market structure, competitive position and commercial priorities.' },
          { title: 'Foresight', body: 'Consider What Follows. Connect current movements with wider patterns to develop a more forward-looking perspective on the market.' },
        ],
        pill: 'Our Vision',
        quote: 'To turn market change into foresight for the decisions ahead.',
      },
      /* "Intelligence Across" heads the strip in the document; hidden slot. */
      strip: stripOf('research-intelligence', ['Markets & Sectors', 'Customers & Demand', 'Competitors', 'Pricing & Positioning', 'Economic & Regulatory Change', 'Emerging Trends']),
      talk: {
        head: 'The Market Will Change. Your Perspective Should Move With It.',
        lede: 'Stay connected to the developments shaping your market and the implications they may hold for your business.',
        cta: { label: 'Speak to Our Research Team', href: '/free-consultation/' },
        image: RESEARCH_TEMPLATE.close.image,
      },
    },
  },
  {
    slug: 'research-reports',
    title: 'Research Reports',
    lede: 'In-depth research reports that examine markets, sectors and emerging developments through evidence, analysis and informed interpretation.',
    brief: {
      lede: [
        'A strong research report should do more than document what has happened. It should establish the market context, examine the forces behind performance and provide a considered view of the developments likely to matter next.',
        'ValuNxt develops market, sector and bespoke research reports that bring together relevant data, comparative analysis and commercial interpretation. Each report is structured around a defined subject and audience, creating a credible reference point for investors, businesses and decision-makers.',
      ],
      whatIntro: 'What Our Reports Examine',
      what: [
        { lead: 'Market Performance.', text: 'Analyse activity, demand, pricing, performance indicators and other measures relevant to the market being studied.' },
        { lead: 'Supply & Demand.', text: 'Examine the balance between current demand, existing supply and future pipeline to understand evolving market conditions.' },
        { lead: 'Sector Dynamics.', text: 'Assess the structural, economic and commercial factors influencing individual sectors and their performance.' },
        { lead: 'Outlook & Emerging Themes.', text: 'Consider developing trends, changing conditions and wider forces that could influence the direction of the market.' },
      ],
      howIntro: 'Research Across Different Perspectives',
      how: [
        { lead: 'Market Reports.', text: 'Detailed studies of market conditions, performance and direction across defined geographies.' },
        { lead: 'Sector Reports.', text: 'Focused analysis of individual industries, asset classes and their underlying dynamics.' },
        { lead: 'Thematic Research.', text: 'Research centred on a specific trend, structural change or issue with wider market implications.' },
        { lead: 'Bespoke Reports.', text: 'Commissioned research developed around a particular market, commercial or strategic requirement.' },
      ],
      panel: {
        title: 'Where Research Gains Perspective.',
        sub: 'Bring evidence, context and interpretation together to understand markets beyond individual findings.',
      },
    },
    override: {
      why: {
        pill: 'Why Valunxt?',
        titleTop: 'Research Built',
        titleMid: 'on Market',
        titleMark: 'Understanding.',
        note: 'Our research combines analytical depth with commercial and sector perspective, bringing greater context to the evidence and greater substance to the conclusions drawn from it.',
        cta: { label: 'Speak With an Expert', href: '/free-consultation/' },
        ...WHY_PHOTO,
      },
      approach: {
        eyebrow: 'Our research approach',
        columns: [
          { title: 'Establish the Scope', body: 'We define the subject, geography, timeframe and research objectives to establish a clear framework for the report.' },
          { title: 'Examine the Market', body: 'Relevant data, market activity, comparative evidence and wider influences are analysed to understand performance and identify significant patterns.' },
          { title: 'Develop the Perspective', body: 'The findings are brought together into a structured narrative that explains what is happening, what is driving it and what deserves attention next.' },
        ],
      },
      insights: {
        /* "Latest research" is the document's kicker here; no slot. The four
           cards are report categories, not published reports (the document
           says so in a note to the client), so they and the button lead to
           the research index. */
        title: 'Markets in Focus.',
        lede: 'Explore our latest perspectives on the markets, sectors and developments shaping the commercial landscape.',
        all: { label: 'View All Reports', href: '/research/' },
        cards: [
          { title: 'UAE Real Estate Market Outlook', excerpt: 'A broader view of the market forces influencing performance, demand and future direction across the Emirates.', href: '/research/', image: 'blogs/blog-1.webp', alt: '' },
          { title: 'Dubai Residential Market Review', excerpt: 'An examination of transactions, pricing, supply and demand across Dubai’s evolving residential market.', href: '/research/', image: 'blogs/blog-2.webp', alt: '' },
          { title: 'Office Market Perspective', excerpt: 'Research into occupier demand, rental performance, availability and the pipeline shaping the office sector.', href: '/research/', image: 'blogs/blog-3.webp', alt: '' },
          { title: 'Hospitality Market Outlook', excerpt: 'Analysis of demand, performance and development activity influencing the hospitality landscape.', href: '/research/', image: 'blogs/blog-4.webp', alt: '' },
        ],
      },
      story: {
        ...STORY_PHOTO,
        alt: 'A researcher reviewing a market report',
        quote: 'We needed a detailed view of the market that could be shared across our investment and leadership teams. ValuNxt brought the evidence together in a structured report that gave us a much stronger understanding of the market and the factors shaping its direction.',
        pill: 'Research With Longer Relevance',
        title: 'Understand the Market Behind the Moment.',
        note: 'Look beyond current performance to the underlying dynamics influencing how markets and sectors are evolving.',
        cta: { label: 'Explore Our Research', href: '/research/' },
        arrow: { href: '/services/research-intelligence/', label: 'More about Research & Intelligence' },
      },
      band: {
        ...BAND_PHOTO,
        title: 'Valunxt Research Perspective',
        body: 'From Evidence to Understanding. Research becomes more valuable when individual findings are connected to the wider market forces that give them meaning.',
        cta: { label: 'Discover More', href: '/blogs/' },
      },
      vision: {
        /* Step leads as on Feasibility Studies: a full stop closes each. */
        steps: [
          { title: 'Evidence', body: 'Establish the Picture. Bring together the market information and comparative evidence required to understand current conditions.' },
          { title: 'Interpretation', body: 'Explain the Movement. Examine the relationships and underlying factors influencing changes in market and sector performance.' },
          { title: 'Outlook', body: 'Consider the Direction. Assess emerging developments and wider influences to provide perspective on how conditions may evolve.' },
        ],
        pill: 'Our Vision',
        quote: 'To create research that becomes a reference point for understanding markets as they evolve.',
      },
      /* "Research Reports Across" heads the strip in the document; hidden slot. */
      strip: stripOf('research-intelligence', ['Real Estate Markets', 'Residential', 'Office & Commercial', 'Retail', 'Hospitality', 'Industrial & Logistics']),
      talk: {
        head: 'Start With the Right Question.',
        lede: 'Speak with our research team about the market, sector or strategic question you need to explore.',
        cta: { label: 'Start a Conversation', href: '/free-consultation/' },
        image: RESEARCH_TEMPLATE.close.image,
      },
    },
  },
];

export const RESEARCH_SUBS = buildSubs(PARENT, SPECS);
