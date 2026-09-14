/**
 * The five pages under /en-ae/services/valuation-and-advisory/.
 *
 * Practice-level sections once, page-level copy per sub-service; the names
 * and slugs are the registry's. RICS-regulated property valuation runs through
 * group firm Reliant Surveyors, which is why that name appears where it does.
 * See ../template/subTypes.ts for the shape, the length rules and the note on
 * the success story being a placeholder.
 *
 * ALL FIVE PAGES ARE THE CLIENT'S page documents (20260914), word for word,
 * under the same two rules as the rest of the UAE pages: nothing added to the
 * documents or dropped from them, and no em dashes. Each document writes every
 * practice-level section for its page, so each page carries them in
 * `override`; the PARENT below is the shape they override and shows nowhere.
 * The same slot calls as the real-estate and mortgage pages apply, and the
 * ones particular to a page are marked at the line.
 *
 * THE FIGURE IN THE STORY PANEL. These documents write the panel's figure
 * inside its headline ("Trusted Across 11K+ Client Relationships."). The panel
 * sets its figure large on its own line, so the words before the figure are
 * the title, the figure is the stat, and the words after it open the note,
 * which keeps the document's word order top to bottom. Asset Valuation's
 * headline puts the figure first ("11K+ Clients. One Valuation Legacy."), so
 * there the title follows the figure rather than leading it.
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
import { VALUATION_TEMPLATE } from './content';

const PARENT: SubParent = {
  service: 'valuation-and-advisory',
  /* The documents write the breadcrumb out in full. */
  crumb: 'Valuation & Advisory',
  hero: { image: VALUATION_TEMPLATE.hero.image, alt: VALUATION_TEMPLATE.hero.alt },
  panel: PANEL_PLATE,
  why: {
    pill: 'Why us?',
    titleTop: 'Every Number',
    titleMid: 'Must',
    titleMark: 'Hold Up',
    note: 'Method documented, assumptions sourced, and RICS standards through the group.',
    cta: { label: 'Schedule a Call', href: '/free-consultation/' },
    ...WHY_PHOTO,
  },
  approach: {
    eyebrow: 'Our approach',
    columns: [
      {
        title: 'RICS through the group',
        body:
          'Property valuation runs through Reliant Surveyors, a RICS-regulated firm, to the Red ' +
          'Book — which is the standard a bank, an auditor or a court expects to see on the cover. ' +
          'Business, plant and financial valuations are prepared to the international standards ' +
          'each of them cites.',
      },
      {
        title: 'Method you can read',
        body:
          'A valuation is an argument, and ours are written to be followed: the basis stated, ' +
          'the approaches run and reconciled, every comparable dated and sourced, every discount ' +
          'explained. A reader who disagrees can see exactly where, which is the point.',
      },
      {
        title: 'Built for the reader who questions it',
        body:
          'We ask at the start who will test the number — a lender, an auditor, a buyer, a ' +
          'tribunal — and build the report to that reader. When the question comes, the valuer ' +
          'who signed the report answers it.',
      },
    ],
  },
  insights: {
    title: 'Numbers That Hold Up',
    lede:
      'A valuation is only useful once someone has questioned it. Explore our latest thinking on ' +
      'value, evidence and the decisions that rest on both in the UAE.',
    all: { label: 'Learn more', href: '/blogs/' },
    cards: SITE_ARTICLES,
  },
  story: {
    ...STORY_PHOTO,
    alt: 'A valuer reviewing a report',
    quote:
      'The bank’s panel valuer and our own number were twenty per cent apart. Valunxt’s report ' +
      'set out the method line by line, and the lender accepted it without a single query.',
    initials: 'MS',
    role: 'Finance director',
    org: 'Abu Dhabi industrial group',
    pill: 'Success story',
    title: 'A Plant & Machinery Valuation the Lender Accepted First Time',
    stat: 'Zero queries',
    note: 'from the lender on a report built to RICS standards, with every assumption sourced.',
    cta: { label: 'Discuss Your Case', href: '/free-consultation/' },
    arrow: { href: '/services/valuation-and-advisory/', label: 'More about Valuation' },
  },
  band: {
    ...BAND_PHOTO,
    title: 'Valunxt Valuation Intelligence',
    body:
      'Working with Reliant Surveyors, the research team and the group’s accountants, Valunxt ' +
      'turns a valuation instruction into a number that holds — method documented, evidence ' +
      'sourced, ready for whoever questions it next.',
    cta: { label: "Discover what's next", href: '/services/technology-data-ai/' },
  },
  vision: SHARED_VISION,
  strip: stripOf('valuation-and-advisory', [
    'Business Valuation',
    'Company Valuation',
    'Plant & Machinery',
    'Asset Valuation',
    'Financial Valuation',
    'Property Valuation',
  ]),
  talk: {
    head: VALUATION_TEMPLATE.close.head,
    lede: VALUATION_TEMPLATE.close.lede,
    cta: VALUATION_TEMPLATE.close.primary,
    image: VALUATION_TEMPLATE.close.image,
  },
};

const SPECS: SubSpec[] = [
  {
    slug: 'business-valuation',
    /* The document sets the heading in capitals; title case here, as every
       other page heading. */
    title: 'Business Valuation',
    lede: 'RICS-aligned business valuation combining financial analysis, market evidence and professional judgement for informed decision-making.',
    brief: {
      lede: [
        'A business valuation goes beyond its latest financial statements. It considers how the business performs, its ability to generate future earnings and cash flows, the market in which it operates, and the risks that can influence its value.',
        'ValuNxt brings these factors together through financial analysis, appropriate valuation methodologies and professional judgement to determine a well-supported value of the business for the purpose at hand.',
      ],
      whatIntro: 'What Drives Business Value',
      what: [
        { lead: 'Earnings & Cash Flow.', text: 'Assess the profitability, cash generation and financial performance underpinning the business.' },
        { lead: 'Future Earnings Potential.', text: 'Consider expected growth and the business’s ability to sustain future financial performance.' },
        { lead: 'Market & Competitive Position.', text: 'Evaluate the industry environment, competitive standing and market factors influencing value.' },
        { lead: 'Business & Financial Risk.', text: 'Consider the operational, commercial and financial risks that may affect the valuation.' },
      ],
      howIntro: 'When Business Valuation Matters',
      how: [
        { lead: 'Mergers & Acquisitions.', text: 'Establish an independent view of value when buying, selling or negotiating a business interest.' },
        { lead: 'Shareholder & Investment Decisions.', text: 'Support ownership changes, investor entry, shareholder exits and capital-related decisions.' },
        { lead: 'Financial Reporting.', text: 'Determine value where independent valuation is required for accounting or reporting purposes.' },
        { lead: 'Restructuring & Strategic Decisions.', text: 'Assess value when the business, ownership structure or strategic direction is changing.' },
      ],
      panel: {
        title: 'Value With Conviction.',
        sub: 'Independent analysis and considered judgement behind every conclusion of value.',
      },
    },
    override: {
      why: {
        pill: 'Why Valunxt?',
        titleTop: '48+ Years.',
        titleMid: 'One Standard',
        titleMark: 'of Value.',
        note: 'Decades of valuation experience bring depth, perspective and considered judgement to every business valuation we undertake.',
        cta: { label: 'Discuss Your Valuation', href: '/free-consultation/' },
        ...WHY_PHOTO,
      },
      approach: {
        eyebrow: 'Our valuation approach',
        columns: [
          { title: 'Understand the Business', body: 'We establish the purpose of the valuation and develop a clear understanding of the business, its operations, financial position and market environment.' },
          { title: 'Assess the Value Drivers', body: 'Historical performance, earnings potential, cash flows, market evidence and risk are examined to identify the factors influencing value.' },
          { title: 'Determine the Value', body: 'Relevant valuation methodologies are applied, assumptions are tested and professional judgement is used to arrive at a well-supported conclusion of value.' },
        ],
      },
      insights: {
        title: 'The Number Is the Outcome. The Drivers Matter More.',
        lede: 'Explore the financial and commercial forces that can change what a business is worth.',
        all: { label: 'Explore Valuation Insights', href: '/blogs/' },
        cards: [
          { title: 'What Really Drives the Value of a Business?', excerpt: 'The factors beyond revenue that can materially influence valuation.', href: '/blogs/', image: 'blogs/blog-1.webp', alt: '' },
          { title: 'Growth Is Valuable. But At What Price?', excerpt: 'Why future potential needs to be considered alongside the risk of achieving it.', href: '/blogs/', image: 'blogs/blog-2.webp', alt: '' },
          { title: 'When Is the Right Time to Value Your Business?', excerpt: 'The moments when knowing the number can change the decision you make next.', href: '/blogs/', image: 'blogs/blog-3.webp', alt: '' },
          { title: 'Selling a Business? Start With the Value.', excerpt: 'Why an independent perspective can matter before negotiations begin.', href: '/blogs/', image: 'blogs/blog-4.webp', alt: '' },
        ],
      },
      story: {
        ...STORY_PHOTO,
        alt: 'A valuer reviewing an asset file',
        quote: 'We needed an independent perspective before making a major business decision. ValuNxt helped us understand not only the valuation, but the assumptions and business factors behind it.',
        pill: 'Proven Experience',
        title: 'Trusted Across',
        stat: '11K+',
        note: 'Client Relationships. Valuation experience built across decades of assignments, industries and complex business decisions.',
        cta: { label: 'Discuss Your Valuation', href: '/free-consultation/' },
        arrow: { href: '/services/valuation-and-advisory/', label: 'More about Valuation & Advisory' },
      },
      band: {
        ...BAND_PHOTO,
        title: 'Valunxt Valuation Intelligence',
        /* The comma after "number" stands where the document's dash was. */
        body: 'What Is the Business Worth? And What Is Driving It? A valuation becomes more useful when you can see the factors moving the number, not simply the number itself.',
        cta: { label: 'Discover More', href: '/blogs/' },
      },
      vision: {
        steps: [
          { title: 'Performance', body: 'See what the business delivers. Look at the financial results and operating performance supporting value today.' },
          { title: 'Potential', body: 'Consider what comes next. Assess the expectations, opportunities and assumptions influencing future value.' },
          { title: 'Risk', body: 'Put uncertainty into perspective. Consider the commercial and financial factors that could affect whether future expectations are realised.' },
        ],
        pill: 'Our Vision',
        quote: 'To make business value a clearer foundation for better decisions.',
      },
      /* "Valuation For" heads the strip in the document; hidden slot. */
      strip: stripOf('valuation-and-advisory', ['Mergers & Acquisitions', 'Shareholder Transactions', 'Capital Raising', 'Financial Reporting', 'Restructuring', 'Strategic Planning']),
      talk: {
        head: 'When the Decision Matters, Know the Value.',
        lede: 'Get an independent business valuation built for the transaction, requirement or decision ahead.',
        cta: { label: 'Speak to a Valuer', href: '/free-consultation/' },
        image: VALUATION_TEMPLATE.close.image,
      },
    },
  },
  {
    slug: 'company-valuation',
    title: 'Company Valuation',
    lede: 'RICS-aligned company and equity valuations supported by financial analysis, market evidence, forecasts and recognised valuation approaches.',
    brief: {
      lede: [
        'A company’s value is shaped by both what it has achieved and what its financial outlook suggests lies ahead. Historical performance provides part of the picture; earnings expectations, cash flows, market conditions and the economics of ownership can materially influence the conclusion.',
        'ValuNxt brings these elements together to determine a well-supported value of the company or equity interest, applying the valuation approach most relevant to the purpose and circumstances of the assignment.',
      ],
      whatIntro: 'What Informs Company Value',
      what: [
        { lead: 'Financial Performance.', text: 'Examine historical earnings, profitability and cash generation to understand the company’s underlying financial position.' },
        { lead: 'Forecast Performance.', text: 'Assess projected earnings and cash flows alongside the assumptions supporting future expectations.' },
        { lead: 'Market Evidence.', text: 'Consider relevant market information and comparable evidence when assessing how the company may be valued.' },
        { lead: 'Capital & Ownership.', text: 'Understand how the company’s financing and ownership structure can influence the value attributable to equity holders.' },
      ],
      howIntro: 'What May Need to Be Valued',
      how: [
        { lead: 'The Company.', text: 'Determine the value of the company as a whole based on its financial and economic characteristics.' },
        { lead: 'Equity Interests.', text: 'Assess the value attributable to a particular ownership interest in the company.' },
        { lead: 'Shares & Shareholdings.', text: 'Establish value where shares are being issued, transferred, acquired or otherwise assessed.' },
        { lead: 'Investor Interests.', text: 'Provide an independent valuation perspective where new or existing investors need clarity around value.' },
      ],
      panel: {
        title: 'Value the Company. Understand the Equity.',
        sub: 'A clearer view of company value and the financial interests behind its ownership.',
      },
    },
    override: {
      why: {
        pill: 'Why Valunxt?',
        titleTop: 'Valuation Expertise.',
        titleMid: 'Built Over',
        titleMark: 'Decades.',
        note: '48+ years of valuation expertise bring analytical depth, market perspective and seasoned professional judgement to every assignment.',
        cta: { label: 'Speak With an Expert', href: '/free-consultation/' },
        ...WHY_PHOTO,
      },
      approach: {
        eyebrow: 'Our valuation approach',
        columns: [
          { title: 'Examine the Fundamentals', body: 'We assess financial performance, earnings quality, cash generation and capital structure to establish the basis for valuation.' },
          { title: 'Evaluate What Lies Ahead', body: 'Forecasts, growth expectations and key assumptions are considered alongside market evidence and relevant risks.' },
          { title: 'Conclude on Value', body: 'Appropriate valuation approaches are applied and reconciled through professional judgement to reach a considered conclusion of value.' },
        ],
      },
      insights: {
        title: 'What Sits Behind Company Value?',
        lede: 'Explore the financial, market and ownership factors that influence how companies and equity interests are valued.',
        all: { label: 'Explore Valuation Insights', href: '/blogs/' },
        cards: [
          /* The comma after "value" stands where the document's dash was. */
          { title: 'Enterprise Value or Equity Value?', excerpt: 'Understanding two important measures of company value, and why the distinction matters.', href: '/blogs/', image: 'blogs/blog-1.webp', alt: '' },
          { title: 'How Much Weight Should Forecasts Carry?', excerpt: 'Why future expectations need to be considered alongside the assumptions supporting them.', href: '/blogs/', image: 'blogs/blog-2.webp', alt: '' },
          { title: 'What Can Comparable Companies Tell You?', excerpt: 'How market evidence can provide perspective when assessing company value.', href: '/blogs/', image: 'blogs/blog-3.webp', alt: '' },
          { title: 'What Is a Shareholding Really Worth?', excerpt: 'Why the value of an ownership interest may require a closer look at the economics behind it.', href: '/blogs/', image: 'blogs/blog-4.webp', alt: '' },
        ],
      },
      story: {
        ...STORY_PHOTO,
        alt: 'A valuer reviewing an asset file',
        quote: 'We needed an independent view of the company’s value before progressing an ownership transaction. ValuNxt gave us a clear understanding of the financial analysis, assumptions and market evidence behind the conclusion.',
        pill: 'Built on Trust',
        title: 'Trusted Across',
        stat: '11K+',
        note: 'Clients. A valuation legacy shaped over 48+ years, bringing established professional standards and deep valuation experience to the ValuNxt platform.',
        cta: { label: 'Discover Our Expertise', href: '/services/valuation-and-advisory/' },
        arrow: { href: '/services/valuation-and-advisory/', label: 'More about Valuation & Advisory' },
      },
      band: {
        ...BAND_PHOTO,
        title: 'Valunxt Valuation Intelligence',
        body: 'From Financial Performance to Equity Value. Understanding company value means connecting what the company has delivered with what it may generate ahead and what that ultimately means for its owners.',
        cta: { label: 'Discover More', href: '/blogs/' },
      },
      vision: {
        steps: [
          { title: 'Performance', body: 'Establish the foundation. Look at the earnings, cash flows and financial characteristics supporting the company today.' },
          { title: 'Forecasts', body: 'Consider what lies ahead. Examine future expectations and the assumptions that underpin projected performance.' },
          { title: 'Equity', body: 'Understand the ownership value. Bring the company’s financial position and capital structure together to consider the value attributable to its owners.' },
        ],
        pill: 'Our Vision',
        quote: 'To bring greater clarity to company and equity value through analysis that looks beyond a single financial measure.',
      },
      /* "Company Valuation For" heads the strip in the document; hidden slot. */
      strip: stripOf('valuation-and-advisory', ['Whole Company', 'Equity Interests', 'Shareholdings', 'Investor Entry', 'Share Transfers', 'Ownership Transactions']),
      talk: {
        head: 'Know the Company. Understand the Value.',
        lede: 'Get an independent view of company or equity value grounded in financial performance, forecasts and relevant market evidence.',
        cta: { label: 'Speak to a Valuer', href: '/free-consultation/' },
        image: VALUATION_TEMPLATE.close.image,
      },
    },
  },
  {
    slug: 'plant-machinery-valuation',
    title: 'Plant & Machinery Valuation',
    lede: 'RICS-aligned valuation of plant, machinery and operational equipment for financial reporting, insurance, transactions, financing and asset decisions.',
    brief: {
      lede: [
        'Plant and machinery can represent a significant part of a business’s invested capital, yet its value cannot be understood from acquisition cost or age alone. Condition, specification, utilisation, remaining economic life, technological relevance and market demand can all affect what an asset is worth.',
        'ValuNxt combines asset-level inspection, technical understanding and relevant market evidence to establish an independent view of value appropriate to the asset, valuation purpose and reporting requirement.',
      ],
      whatIntro: 'What Shapes Machinery Value',
      what: [
        { lead: 'Condition & Age.', text: 'Assess the asset’s physical condition, maintenance history and stage within its useful economic life.' },
        { lead: 'Specification & Capacity.', text: 'Consider technical configuration, output capacity and the characteristics that influence utility and marketability.' },
        { lead: 'Market Evidence.', text: 'Review relevant transactions, comparable equipment and market conditions where reliable evidence is available.' },
        { lead: 'Obsolescence.', text: 'Consider physical deterioration alongside functional, technological and economic factors that may reduce value.' },
      ],
      howIntro: 'Where Valuation Is Required',
      how: [
        { lead: 'Financial Reporting.', text: 'Support the measurement and reporting of plant, machinery and equipment where an independent valuation is required.' },
        { lead: 'Insurance.', text: 'Establish an appropriate valuation basis to support asset insurance and risk-related requirements.' },
        { lead: 'Financing & Security.', text: 'Provide an independent assessment of machinery and equipment used in financing or security-related decisions.' },
        { lead: 'Transactions.', text: 'Support acquisitions, disposals and other transactions involving industrial and operational assets.' },
      ],
      panel: {
        title: 'Precision Behind Valuation.',
        sub: 'From specification and condition to utility and market relevance, every detail contributes to a more considered view of asset value.',
      },
    },
    override: {
      why: {
        pill: 'Why Valunxt?',
        titleTop: '48+ Years of',
        titleMid: 'Valuation',
        titleMark: 'Expertise.',
        note: 'Decades of experience across asset classes and industries bring technical depth, market perspective and professional judgement to every plant and machinery valuation.',
        cta: { label: 'Explore Our Expertise', href: '/services/valuation-and-advisory/' },
        ...WHY_PHOTO,
      },
      approach: {
        eyebrow: 'Our valuation approach',
        columns: [
          { title: 'Identify & Inspect', body: 'We establish the asset population and examine relevant machinery, equipment and installations to understand their condition, specification and operational characteristics.' },
          { title: 'Analyse & Benchmark', body: 'Technical information, available market evidence, replacement economics and relevant forms of obsolescence are considered in the valuation analysis.' },
          { title: 'Establish the Value', body: 'The appropriate valuation approach and basis are applied to determine a well-supported value for the stated purpose of the assignment.' },
        ],
      },
      insights: {
        title: 'What Is Your Equipment Really Worth Today?',
        lede: 'Explore the operational, technical and market factors that can materially change the value of plant and machinery.',
        all: { label: 'Explore Valuation Insights', href: '/blogs/' },
        cards: [
          { title: 'Age Is Only Part of the Story', excerpt: 'Why two machines of similar age can carry very different values.', href: '/blogs/', image: 'blogs/blog-1.webp', alt: '' },
          /* As the document has it; "Start to Affect" is probably meant. */
          { title: 'When Does Obsolescence Start Affect Value?', excerpt: 'How changing technology, efficiency and market requirements can influence equipment value.', href: '/blogs/', image: 'blogs/blog-2.webp', alt: '' },
          { title: 'Replacement Cost Is Not Market Value', excerpt: 'Why the purpose and basis of valuation matter when assessing industrial assets.', href: '/blogs/', image: 'blogs/blog-3.webp', alt: '' },
          { title: 'Before You Acquire Used Machinery', excerpt: 'What an independent valuation can reveal beyond the quoted purchase price.', href: '/blogs/', image: 'blogs/blog-4.webp', alt: '' },
        ],
      },
      story: {
        ...STORY_PHOTO,
        alt: 'A valuer reviewing an asset file',
        quote: 'We needed an independent assessment of machinery across a complex operating environment. ValuNxt gave us a structured view of the assets and the factors influencing their value.',
        pill: 'Valuation at Scale',
        /* The document leads with the figure; the panel sets it under the title. */
        title: 'Plant & Machinery Valued.',
        stat: 'USD 90B+',
        note: 'A substantial track record across industrial assets, specialist equipment and complex operational environments.',
        cta: { label: 'Explore Our Expertise', href: '/services/valuation-and-advisory/' },
        arrow: { href: '/services/valuation-and-advisory/', label: 'More about Valuation & Advisory' },
      },
      band: {
        ...BAND_PHOTO,
        title: 'Valunxt Asset Intelligence',
        body: 'From Physical Asset to Economic Value. Understanding machinery value means looking at what the asset is, how it performs, where it sits in its lifecycle and how the market views it today.',
        cta: { label: 'Discover More', href: '/blogs/' },
      },
      vision: {
        steps: [
          { title: 'Condition', body: 'Assess what exists today. Consider physical state, maintenance and remaining useful life as part of the asset’s current valuation profile.' },
          { title: 'Utility', body: 'Understand what the asset can deliver. Examine specification, capacity and operational relevance to understand its continuing economic usefulness.' },
          { title: 'Market', body: 'Put the asset in context. Consider comparable evidence, demand and market conditions to understand how external factors influence value.' },
        ],
        pill: 'Our Vision',
        quote: 'To bring greater certainty to the value of assets that power industry and enterprise.',
      },
      /* "Valuation Across" heads the strip in the document; hidden slot. */
      strip: stripOf('valuation-and-advisory', ['Manufacturing Plant', 'Construction Equipment', 'Industrial Machinery', 'Oilfield Equipment', 'Logistics & Transport Assets', 'Specialist Equipment']),
      talk: {
        head: 'Put a Defensible Value Behind Your Assets.',
        lede: 'Independent plant and machinery valuation for the financial, operational or transaction requirement ahead.',
        cta: { label: 'Request a Valuation', href: '/contact/' },
        image: VALUATION_TEMPLATE.close.image,
      },
    },
  },
  {
    slug: 'asset-valuation',
    title: 'Asset Valuation',
    lede: 'RICS-aligned asset valuations supported by market evidence, appropriate valuation methodologies and professional judgement for reporting, transactions, financing and business requirements.',
    brief: {
      lede: [
        'Assets can carry different values depending on their characteristics, condition, use and the purpose for which the valuation is required. Their recorded cost may provide historical context, but it does not necessarily reflect their value at a particular date.',
        'ValuNxt assesses the asset in its relevant commercial and market context, applying an appropriate basis and methodology to establish an independent, well-supported conclusion of value.',
      ],
      whatIntro: 'What Informs Asset Value',
      what: [
        { lead: 'Asset Characteristics.', text: 'Consider the nature, specification, use and attributes that influence the asset’s value.' },
        { lead: 'Condition & Lifecycle.', text: 'Assess physical condition, age and remaining economic life where relevant to the asset being valued.' },
        { lead: 'Market Evidence.', text: 'Examine available transactions, comparable assets and prevailing market conditions.' },
        { lead: 'Economic Utility.', text: 'Consider how the asset is used and the economic benefit it can provide within its relevant context.' },
      ],
      howIntro: 'Where Asset Valuation Matters',
      how: [
        { lead: 'Financial Reporting.', text: 'Support accounting and reporting requirements where independent asset values are required.' },
        { lead: 'Transactions.', text: 'Establish an independent view of value for acquisitions, disposals and asset transfers.' },
        { lead: 'Financing.', text: 'Provide valuation evidence where assets form part of financing, security or collateral considerations.' },
        { lead: 'Restructuring.', text: 'Bring greater clarity to asset values when ownership, operations or corporate structures are changing.' },
      ],
      panel: {
        title: 'The Perspective Behind Asset Value.',
        sub: 'Independent analysis brings the asset, its characteristics and relevant market evidence together to form a considered view of value.',
      },
    },
    override: {
      why: {
        pill: 'Why Valunxt?',
        titleTop: '48+ Years of',
        titleMid: 'Valuation',
        titleMark: 'Perspective.',
        note: 'Decades of valuation experience bring market understanding, analytical depth and professional judgement across diverse asset classes and requirements.',
        cta: { label: 'Connect With an Expert', href: '/free-consultation/' },
        ...WHY_PHOTO,
      },
      approach: {
        eyebrow: 'Our valuation approach',
        columns: [
          { title: 'Define the Asset', body: 'We establish what is being valued, the purpose of the assignment and the characteristics relevant to the valuation.' },
          { title: 'Examine the Evidence', body: 'Asset information, condition, market evidence and relevant economic factors are analysed within the appropriate valuation context.' },
          { title: 'Establish the Value', body: 'The appropriate basis and valuation methodology are applied to arrive at a well-supported conclusion for the stated requirement.' },
        ],
      },
      insights: {
        title: 'The Factors Behind Asset Value.',
        lede: 'Explore the factors, evidence and circumstances that can change how an asset is valued.',
        all: { label: 'Explore Valuation Insights', href: '/blogs/' },
        cards: [
          { title: 'Cost and Value Are Not the Same', excerpt: 'Why what an asset originally cost may say little about what it is worth today.', href: '/blogs/', image: 'blogs/blog-1.webp', alt: '' },
          { title: 'Why the Valuation Date Matters', excerpt: 'How changing markets and asset circumstances can influence value over time.', href: '/blogs/', image: 'blogs/blog-2.webp', alt: '' },
          { title: 'One Asset. Different Bases of Value.', excerpt: 'Why the purpose of a valuation can influence how an asset needs to be assessed.', href: '/blogs/', image: 'blogs/blog-3.webp', alt: '' },
          { title: 'When Should Assets Be Revalued?', excerpt: 'The business and reporting circumstances that can make an updated valuation important.', href: '/blogs/', image: 'blogs/blog-4.webp', alt: '' },
        ],
      },
      story: {
        ...STORY_PHOTO,
        alt: 'A valuer reviewing an asset file',
        quote: 'We needed a consistent and independent view of assets held across the business. ValuNxt brought structure to the exercise and gave us a clearer basis for our reporting and internal decisions.',
        pill: 'Built on Trust',
        /* "11K+ Clients. One Valuation Legacy." in the document, figure first. */
        title: 'One Valuation Legacy.',
        stat: '11K+',
        note: 'Clients. Established valuation expertise supporting businesses, institutions and investors across a wide range of asset and reporting requirements.',
        cta: { label: 'Discover Our Expertise', href: '/services/valuation-and-advisory/' },
        arrow: { href: '/services/valuation-and-advisory/', label: 'More about Valuation & Advisory' },
      },
      band: {
        ...BAND_PHOTO,
        title: 'Valunxt Asset Intelligence',
        body: 'The Asset Is Visible. Its Value Takes Analysis. Understanding asset value means looking beyond what appears on the register to the characteristics, market evidence and economic realities behind it.',
        cta: { label: 'Discover More', href: '/blogs/' },
      },
      vision: {
        steps: [
          { title: 'Characteristics', body: 'Understand the asset. Consider the attributes, condition and circumstances that distinguish one asset from another.' },
          { title: 'Evidence', body: 'Understand the market. Examine relevant market information and comparable evidence to put the asset into context.' },
          { title: 'Purpose', body: 'Understand the requirement. Apply the appropriate valuation perspective based on why the asset is being valued and how the conclusion will be used.' },
        ],
        pill: 'Our Vision',
        quote: 'To bring greater clarity and consistency to the way business assets are understood and valued.',
      },
      /* "Asset Valuation For" heads the strip in the document; hidden slot. */
      strip: stripOf('valuation-and-advisory', ['Financial Reporting', 'Asset Transactions', 'Financing & Security', 'Corporate Restructuring', 'Insurance Requirements', 'Internal Asset Reviews']),
      talk: {
        head: 'Put the Right Value Behind Every Decision.',
        lede: 'Independent asset valuation for the reporting, transaction, financing or business requirement ahead.',
        cta: { label: 'Speak With an Expert', href: '/free-consultation/' },
        image: VALUATION_TEMPLATE.close.image,
      },
    },
  },
  {
    slug: 'financial-valuation',
    title: 'Financial Valuation',
    lede: 'RICS-aligned valuation of financial interests, instruments and economic rights using robust financial analysis, relevant market inputs and recognised valuation techniques.',
    brief: {
      lede: [
        'Financial value is often shaped by variables that extend beyond a quoted price or reported figure. Contractual terms, expected cash flows, market conditions, risk and underlying assumptions can each materially influence the value of a financial interest or instrument.',
        'ValuNxt analyses these factors together, applying appropriate valuation techniques and professional judgement to establish a well-supported conclusion of value for the specific financial interest or right being assessed.',
      ],
      whatIntro: 'What Informs Financial Value',
      what: [
        { lead: 'Cash Flow Expectations.', text: 'Assess the timing, amount and characteristics of expected financial benefits associated with the interest or instrument.' },
        { lead: 'Contractual Terms.', text: 'Consider the rights, obligations and conditions that influence how value is created, received or transferred.' },
        { lead: 'Market Inputs.', text: 'Examine relevant market data and observable evidence where available to support the valuation analysis.' },
        { lead: 'Risk & Assumptions.', text: 'Evaluate the financial assumptions, uncertainties and risk factors that can materially influence the conclusion of value.' },
      ],
      howIntro: 'What May Need to Be Valued',
      how: [
        { lead: 'Financial Interests.', text: 'Assess financial interests where an independent conclusion of value is required.' },
        { lead: 'Financial Instruments.', text: 'Determine value using techniques appropriate to the characteristics, terms and available market evidence of the instrument.' },
        { lead: 'Economic Rights.', text: 'Assess contractual or economic rights capable of generating measurable financial benefits.' },
        { lead: 'Financial Assets & Liabilities.', text: 'Establish value where financial assets or obligations require independent assessment for the stated purpose.' },
      ],
      panel: {
        title: 'Value Beyond the Numbers.',
        sub: 'Financial analysis, market inputs and carefully considered assumptions come together to provide a more complete view of value.',
      },
    },
    override: {
      why: {
        pill: 'Why Valunxt?',
        titleTop: 'Decades of Valuation.',
        titleMid: 'Applied to',
        titleMark: 'Finance.',
        note: '48+ years of valuation expertise bring analytical discipline, market perspective and professional judgement to complex financial valuation requirements.',
        cta: { label: 'Speak With an Expert', href: '/free-consultation/' },
        ...WHY_PHOTO,
      },
      approach: {
        eyebrow: 'Our valuation approach',
        columns: [
          { title: 'Understand the Economics', body: 'We examine the financial interest or instrument, its contractual characteristics and the economic benefits or obligations that underpin it.' },
          { title: 'Test the Inputs', body: 'Market data, cash flow expectations, assumptions and relevant risk factors are assessed for their influence on value.' },
          { title: 'Model the Value', body: 'Appropriate valuation techniques are applied and key inputs considered to arrive at a well-supported conclusion for the stated purpose.' },
        ],
      },
      insights: {
        title: 'Where Financial Value Takes Shape.',
        lede: 'Explore how cash flows, market inputs, contractual terms and assumptions can influence financial value.',
        all: { label: 'Explore Valuation Insights', href: '/blogs/' },
        cards: [
          { title: 'When Market Price Is Not Enough', excerpt: 'Why some financial interests require analysis beyond an observable market figure.', href: '/blogs/', image: 'blogs/blog-1.webp', alt: '' },
          { title: 'How Assumptions Change Value', excerpt: 'A closer look at why valuation outcomes can be highly sensitive to the inputs behind them.', href: '/blogs/', image: 'blogs/blog-2.webp', alt: '' },
          { title: 'What Makes Future Cash Flows Valuable Today?', excerpt: 'Understanding how timing, uncertainty and expectations influence present value.', href: '/blogs/', image: 'blogs/blog-3.webp', alt: '' },
          { title: 'Why Contractual Terms Matter', excerpt: 'How the economics written into an agreement can materially influence the value of a financial interest.', href: '/blogs/', image: 'blogs/blog-4.webp', alt: '' },
        ],
      },
      story: {
        ...STORY_PHOTO,
        alt: 'A valuer reviewing an asset file',
        quote: 'We needed an independent view of a financial interest where the value was not immediately observable. ValuNxt brought structure to the assumptions, market inputs and financial analysis behind the conclusion.',
        pill: 'Built on Trust',
        title: 'Trusted Across',
        stat: '11K+',
        note: 'Clients. An established valuation legacy bringing independent perspective and professional discipline to complex financial and business requirements.',
        cta: { label: 'Discover Our Expertise', href: '/services/valuation-and-advisory/' },
        arrow: { href: '/services/valuation-and-advisory/', label: 'More about Valuation & Advisory' },
      },
      band: {
        ...BAND_PHOTO,
        title: 'Valunxt Financial Intelligence',
        body: 'From Financial Terms to Financial Value. A financial interest becomes clearer when its economics, future benefits, risks and market context are considered together.',
        cta: { label: 'Discover More', href: '/blogs/' },
      },
      vision: {
        steps: [
          { title: 'Economics', body: 'Understand the interest. Examine the contractual and financial characteristics that determine how economic value is created or received.' },
          { title: 'Inputs', body: 'Test what drives value. Consider market data, expected cash flows and assumptions that materially influence the valuation outcome.' },
          { title: 'Risk', body: 'Account for uncertainty. Assess the factors that can affect the timing, probability or amount of expected financial benefits.' },
        ],
        pill: 'Our Vision',
        quote: 'To bring greater clarity to financial value where markets, models and assumptions intersect.',
      },
      /* "Financial Valuation For" heads the strip in the document; hidden slot. */
      strip: stripOf('valuation-and-advisory', ['Financial Interests', 'Financial Instruments', 'Economic Rights', 'Financial Assets', 'Financial Liabilities', 'Contractual Interests']),
      talk: {
        head: 'Complex Financial Interests. Clearer Value.',
        lede: 'Independent financial valuation supported by rigorous analysis, relevant market inputs and appropriate valuation techniques.',
        cta: { label: 'Discuss Your Requirement', href: '/free-consultation/' },
        image: VALUATION_TEMPLATE.close.image,
      },
    },
  },
];

export const VALUATION_SUBS = buildSubs(PARENT, SPECS);
