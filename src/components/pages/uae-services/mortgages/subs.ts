/**
 * The six pages under /en-ae/services/mortgages-services/.
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
 * The same slot calls as the real-estate pages apply (see ../real-estate/
 * subs.ts), and the ones particular to a page are marked at the line.
 *
 * Three of the documents carry the copywriter's own notes between sections
 * ("This feels much more like actual blog/editorial content...", "I
 * particularly prefer...", "This version is deliberately less repetitive...").
 * They are notes to the client, not page copy, and are not on the pages.
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
import { MORTGAGES_TEMPLATE } from './content';

const PARENT: SubParent = {
  service: 'mortgages-services',
  /* The documents write the breadcrumb out in full. */
  crumb: 'Mortgage Services',
  hero: { image: MORTGAGES_TEMPLATE.hero.image, alt: MORTGAGES_TEMPLATE.hero.alt },
  panel: PANEL_PLATE,
  why: {
    pill: 'Why us?',
    titleTop: 'Terms Negotiated',
    titleMid: 'on the',
    titleMark: 'Evidence',
    note: 'Whole of market, packaged for a yes, and a fee agreed before the first application.',
    cta: { label: 'Schedule a Call', href: '/free-consultation/' },
    ...WHY_PHOTO,
  },
  approach: {
    eyebrow: 'Our approach',
    columns: [
      {
        title: 'Whole of market',
        body:
          'Every UAE lender, Islamic and conventional, compared on one sheet — rate, fees, fixed ' +
          'period, early settlement — rather than the three a bank-tied broker is paid to place ' +
          'with. The recommendation is the loan that fits, and we can show why.',
      },
      {
        title: 'Packaged the way lenders read it',
        body:
          'A credit committee approves a case, not a form. We build the application the way ' +
          'underwriting assesses it — income evidenced, liabilities explained, the property file ' +
          'complete — so the first answer is the right one and the rate is negotiated from strength.',
      },
      {
        title: 'Structured for the long term',
        body:
          'The cheapest headline rate is rarely the cheapest loan. We shape the term, the fixed ' +
          'period and the settlement terms to how long you will actually hold the property, and ' +
          'we come back when the market has moved enough to be worth a refinance.',
      },
    ],
  },
  insights: {
    title: 'Reading the Market Before the Bank Does',
    lede:
      'A mortgage is a position in the property market as much as a loan against it. Explore our ' +
      'latest thinking on buying, funding and holding real estate in the UAE.',
    all: { label: 'Learn more', href: '/blogs/' },
    cards: SITE_ARTICLES,
  },
  story: {
    ...STORY_PHOTO,
    alt: 'A case manager reviewing a mortgage file',
    quote:
      'Three banks had said no before we called. Valunxt repackaged the application the way a ' +
      'credit committee reads it, and the fourth said yes — at a better rate than the first three ' +
      'had quoted.',
    initials: 'RK',
    role: 'Non-resident buyer',
    org: 'Dubai apartment purchase',
    pill: 'Success story',
    title: 'A Non-Resident Mortgage, Approved on the Fourth Application',
    stat: '4 lenders',
    note: 'compared on one term sheet, with the approval in place before the offer went in.',
    cta: { label: 'Discuss Your Case', href: '/free-consultation/' },
    arrow: { href: '/services/mortgages-services/', label: 'More about Mortgages' },
  },
  band: {
    ...BAND_PHOTO,
    title: 'Valunxt Finance Intelligence',
    body:
      'Working with the group’s valuers, accountants and technology partners, Valunxt turns a ' +
      'mortgage application into a case a lender can approve — packaged, evidenced and negotiated ' +
      'on the numbers.',
    cta: { label: "Discover what's next", href: '/services/technology-data-ai/' },
  },
  vision: SHARED_VISION,
  strip: stripOf('mortgages-services', [
    'Residential Mortgages',
    'Commercial Mortgages',
    'Pre-Approval',
    'Refinancing',
    'Non-Resident Finance',
    'Islamic Finance',
  ]),
  talk: {
    head: MORTGAGES_TEMPLATE.close.head,
    lede: MORTGAGES_TEMPLATE.close.lede,
    cta: MORTGAGES_TEMPLATE.close.primary,
    image: MORTGAGES_TEMPLATE.close.image,
  },
};

const SPECS: SubSpec[] = [
  {
    slug: 'residential-mortgages',
    title: 'Residential Mortgages',
    lede: 'Finance your home with a mortgage shaped around your property plans, financial position and long-term priorities.',
    brief: {
      lede: [
        'Buying a home starts with finding the right property. Financing it starts with understanding what works for you.',
        'From your available deposit and monthly commitments to mortgage structure and lender requirements, ValuNxt helps you bring the numbers into focus before you commit.',
      ],
      whatIntro: 'Start With What You Can Afford',
      what: [
        { lead: 'Your Buying Budget.', text: 'Get a clearer picture of the property budget your finances can comfortably support.' },
        { lead: 'Your Deposit.', text: 'Understand the upfront contribution you may need when planning your property purchase.' },
        { lead: 'Your Monthly Commitment.', text: 'See how the mortgage amount, term and financing structure can shape your monthly repayments.' },
        { lead: 'Your Mortgage Options.', text: 'Explore suitable financing routes based on your financial profile and the property you want to purchase.' },
      ],
      howIntro: 'Know Before You Apply',
      how: [
        { lead: 'Eligibility.', text: 'Understand the factors that can influence your mortgage eligibility before beginning an application.' },
        { lead: 'Pre-Approval.', text: 'Establish your potential borrowing position before moving further into your property search.' },
        { lead: 'Documentation.', text: 'Know what financial and supporting documents may be required to progress your application.' },
        { lead: 'Property Valuation.', text: 'Navigate the valuation stage required by the lender as your mortgage moves towards final approval.' },
      ],
      panel: {
        title: 'Your Dream Home. The Right Finance.',
        sub: 'Explore financing options suited to your property plans, with expert support from application to approval.',
      },
    },
    override: {
      why: {
        pill: 'Why us?',
        titleTop: 'Your',
        titleMid: 'Mortgage.',
        titleMark: 'Made Simpler.',
        note: 'From finding suitable financing to navigating the approval process, get the support you need to move closer to homeownership.',
        cta: { label: 'Explore Your Options', href: '/free-consultation/' },
        ...WHY_PHOTO,
      },
      approach: {
        eyebrow: 'Your mortgage journey',
        /* Four steps in the document; the grid runs four across for it. */
        columns: [
          { title: 'Assess', body: 'Understand your financial position and establish what you may be able to borrow.' },
          { title: 'Compare', body: 'Explore suitable mortgage options and evaluate the rates, terms and structures available to you.' },
          { title: 'Apply', body: 'Prepare your application and documentation for submission to the selected lender.' },
          { title: 'Complete', body: 'Move through valuation, final approval and mortgage completion towards your property purchase.' },
        ],
      },
      insights: {
        title: 'Understand the Mortgage. Not Just the Rate.',
        lede: 'Explore the numbers, structures and financing considerations that can influence the true cost of buying your home.',
        all: { label: 'Explore Mortgage Insights', href: '/blogs/' },
        cards: [
          { title: 'How Much Can You Borrow?', excerpt: 'What determines your potential borrowing capacity?', href: '/blogs/', image: 'blogs/blog-1.webp', alt: '' },
          { title: 'Fixed or Variable?', excerpt: 'How can different rate structures affect your mortgage?', href: '/blogs/', image: 'blogs/blog-2.webp', alt: '' },
          { title: 'Deposit & Upfront Costs', excerpt: 'What should you budget for beyond your monthly repayment?', href: '/blogs/', image: 'blogs/blog-3.webp', alt: '' },
          { title: 'Choosing a Mortgage Term', excerpt: 'How can the length of your mortgage change what you pay?', href: '/blogs/', image: 'blogs/blog-4.webp', alt: '' },
        ],
      },
      story: {
        ...STORY_PHOTO,
        alt: 'An adviser reviewing a mortgage file',
        quote: 'ValuNxt helped us understand the numbers before we committed. We had a much clearer view of our mortgage options and what worked for our finances.',
        pill: 'Mortgage Journey',
        title: 'From Numbers to Approval.',
        stat: '100%',
        note: 'guided support through mortgage assessment, application, valuation and approval.',
        cta: { label: 'Get Mortgage Ready', href: '/free-consultation/' },
        arrow: { href: '/services/mortgages-services/', label: 'More about Mortgages' },
      },
      band: {
        ...BAND_PHOTO,
        title: 'Mortgage Planning',
        body: 'Know What the Mortgage Really Means for You. A mortgage can shape your finances for years. Look beyond what you can borrow and understand what you can comfortably manage.',
        cta: { label: 'Plan Your Mortgage', href: '/free-consultation/' },
      },
      vision: {
        steps: [
          { title: 'Affordability', body: 'What works monthly? Understand how repayments could sit alongside your income, commitments and wider financial priorities.' },
          { title: 'Total Cost', body: 'What will you really pay? Consider rates, fees, mortgage term and other costs rather than judging an option on one number.' },
          { title: 'Flexibility', body: 'What happens later? Understand relevant mortgage terms and conditions that could matter as your circumstances change.' },
        ],
        pill: 'Our Vision',
        quote: 'To make the journey from financing a property to owning it simpler, clearer and more connected.',
      },
      /* "Finance Your Home" heads the strip in the document; hidden slot. */
      strip: stripOf('mortgages-services', ['Apartments', 'Villas', 'Townhouses', 'Ready Properties', 'First Homes', 'Investment Homes']),
      talk: {
        head: 'Ready to Finance Your Next Home?',
        lede: 'Take the first step towards the financing that can bring your property plans closer to home.',
        cta: { label: 'Get Started', href: '/free-consultation/' },
        image: MORTGAGES_TEMPLATE.close.image,
      },
    },
  },
  {
    slug: 'refinancing',
    title: 'Mortgage Refinancing',
    /* The document's breadcrumb keeps the registry's shorter name. */
    crumb: 'Refinancing',
    lede: 'Review your existing mortgage and explore whether a different rate, term or financing structure could work better for you.',
    brief: {
      lede: [
        'The mortgage you chose when you bought your property may not always remain the right one.',
        'Rates move. Financial circumstances change. Better lending terms may become available. Refinancing gives you the opportunity to reassess your existing mortgage and see whether switching could improve the way your property is financed.',
      ],
      whatIntro: 'Is Your Mortgage Still the Right Fit?',
      what: [
        { lead: 'Current Rate.', text: 'See how your existing mortgage rate compares with financing options available today.' },
        { lead: 'Monthly Repayment.', text: 'Explore whether refinancing could change what you pay each month.' },
        { lead: 'Remaining Term.', text: 'Consider how a different mortgage term may affect repayments and the overall cost of borrowing.' },
        { lead: 'Switching Costs.', text: 'Factor in settlement fees, valuation charges and other costs before deciding whether a switch makes financial sense.' },
      ],
      howIntro: 'When Refinancing May Be Worth Exploring',
      how: [
        { lead: 'Your Rate Has Changed.', text: 'A higher existing rate may be a reason to review what else is available.' },
        { lead: 'Your Fixed Period Is Ending.', text: 'An approaching rate change can be a natural point to reassess your mortgage.' },
        { lead: 'Your Finances Have Changed.', text: 'A stronger financial position may open up lending options that were not available before.' },
        { lead: 'You Want Different Terms.', text: 'Your priorities today may call for a mortgage structured differently from the one you originally chose.' },
      ],
      panel: {
        title: 'Your Mortgage Deserves a Review.',
        sub: 'Because the deal you started with does not have to be the one you stay with.',
      },
    },
    override: {
      why: {
        pill: 'Why refinance?',
        titleTop: 'What Worked Then',
        titleMid: 'May Not',
        titleMark: 'Work Now.',
        note: 'A mortgage can run for years. Reviewing it along the way can reveal whether there is a better fit for where you stand today.',
        cta: { label: 'Review Your Mortgage', href: '/free-consultation/' },
        ...WHY_PHOTO,
      },
      approach: {
        eyebrow: 'How refinancing works',
        columns: [
          { title: 'Review Your Existing Mortgage', body: 'We start with your current rate, outstanding balance, remaining term and relevant mortgage conditions.' },
          { title: 'Compare the Market', body: 'Available refinancing routes are considered alongside the costs and potential benefits of making a switch.' },
          { title: 'Make the Switch', body: 'If refinancing makes sense, the new application, valuation and lender requirements are progressed towards completion.' },
        ],
      },
      insights: {
        /* The document sets two kickers over this section ("Refinancing
           insights", "Mortgage insights"); the section has no kicker slot. */
        title: 'Could Your Current Mortgage Be Costing You More?',
        lede: 'Explore refinancing perspectives, market shifts and mortgage considerations that could change how you look at your existing finance.',
        all: { label: 'Explore Mortgage Insights', href: '/blogs/' },
        cards: [
          { title: 'When Your Mortgage Stops Working for You', excerpt: 'The signs that could make it worth taking another look at your current deal.', href: '/blogs/', image: 'blogs/blog-1.webp', alt: '' },
          { title: 'The Real Cost of a Lower Rate', excerpt: 'Why the headline rate does not always tell you whether refinancing is worthwhile.', href: '/blogs/', image: 'blogs/blog-2.webp', alt: '' },
          { title: 'The Right Time to Refinance', excerpt: 'How rates, mortgage terms and your financial position can influence the timing of a switch.', href: '/blogs/', image: 'blogs/blog-3.webp', alt: '' },
          { title: 'Refinancing Without the Regret', excerpt: 'What to weigh up before leaving your existing mortgage for a new one.', href: '/blogs/', image: 'blogs/blog-4.webp', alt: '' },
        ],
      },
      story: {
        ...STORY_PHOTO,
        alt: 'An adviser reviewing a mortgage file',
        quote: 'We wanted to know whether our existing mortgage was still the right fit. ValuNxt helped us compare the alternatives, weigh the costs and make the decision with a much clearer picture.',
        pill: 'Refinancing',
        title: 'From Review to Refinance.',
        stat: '3 Steps',
        note: 'review your current position, compare relevant alternatives and move forward when the numbers make sense.',
        cta: { label: 'Start Your Review', href: '/free-consultation/' },
        arrow: { href: '/services/mortgages-services/', label: 'More about Mortgages' },
      },
      band: {
        ...BAND_PHOTO,
        title: 'Valunxt Mortgage Intelligence',
        body: 'The Right Time to Rethink Your Mortgage. As rates, circumstances and priorities change, the mortgage that once worked for you may be worth another look.',
        cta: { label: 'Explore Your Options', href: '/free-consultation/' },
      },
      vision: {
        steps: [
          { title: 'What Changes?', body: 'See the difference. Compare where your current mortgage stands against what a new arrangement could offer.' },
          { title: 'What Do You Gain?', body: 'Find the real benefit. Look at the potential advantage once the costs and commitments of refinancing are taken into account.' },
          { title: 'What Comes Next?', body: 'Think beyond the switch. Consider how a new mortgage could fit your finances and property plans over the years ahead.' },
        ],
        pill: 'Our Vision',
        quote: 'To turn refinancing into an opportunity for greater financial flexibility and long-term value.',
      },
      /* "Refinancing For" heads the strip in the document; hidden slot. */
      strip: stripOf('mortgages-services', ['Residential Mortgages', 'Investment Properties', 'Fixed-Rate Mortgages', 'Variable-Rate Mortgages', 'Existing Homeowners', 'Property Investors']),
      talk: {
        head: 'Could Your Mortgage Be Working Better?',
        lede: 'Review where you stand today and find out whether refinancing could offer a better way forward.',
        cta: { label: 'Review Your Mortgage', href: '/free-consultation/' },
        image: MORTGAGES_TEMPLATE.close.image,
      },
    },
  },
  {
    slug: 'commercial-mortgages',
    title: 'Commercial Mortgages',
    lede: 'Finance commercial property with a mortgage structured around the asset, your business and your investment objectives.',
    brief: {
      lede: [
        'Commercial property financing starts with more than the purchase price. The asset, income potential, business profile, financing requirement and intended use can all influence the mortgage.',
        'Whether you are acquiring premises for your business or investing in a commercial asset, ValuNxt helps you understand the financing landscape and identify a route that supports the opportunity.',
      ],
      whatIntro: 'Finance the Opportunity',
      what: [
        { lead: 'Business Premises.', text: 'Explore financing for offices, retail spaces, warehouses and other properties intended for business use.' },
        { lead: 'Investment Assets.', text: 'Consider mortgage options for income-generating commercial properties and investment acquisitions.' },
        { lead: 'Financing Structure.', text: 'Understand how loan amount, tenure, rates and repayment structures could shape your acquisition.' },
        { lead: 'Lender Requirements.', text: 'Get clarity on the financial, business and property information that may be considered during financing.' },
      ],
      howIntro: 'Built Around the Asset',
      how: [
        { lead: 'Property Type.', text: 'Different commercial assets can carry different financing considerations.' },
        { lead: 'Business Profile.', text: 'Understand how your business position and financials can form part of the lender assessment.' },
        { lead: 'Income Potential.', text: 'Consider existing or expected rental income where relevant to the financing decision.' },
        { lead: 'Property Valuation.', text: 'Navigate the independent valuation required as part of the commercial mortgage process.' },
      ],
      panel: {
        title: 'Finance Built Around Your Ambition.',
        sub: 'Commercial mortgage solutions shaped around your property, business and investment goals.',
      },
    },
    override: {
      why: {
        pill: 'Why us?',
        titleTop: 'Every Deal',
        titleMid: 'Demands the',
        titleMark: 'Right Structure.',
        note: 'We help align the property, financing and commercial objectives to find a mortgage structure that works for the deal.',
        cta: { label: 'Explore Financing', href: '/free-consultation/' },
        ...WHY_PHOTO,
      },
      approach: {
        eyebrow: 'Your financing journey',
        /* Four steps in the document; the grid runs four across for it. */
        columns: [
          { title: 'Define the Requirement', body: 'Establish the property, financing requirement and purpose behind your commercial acquisition.' },
          { title: 'Assess the Opportunity', body: 'Bring the asset, business profile and relevant financial information together for a clearer financing picture.' },
          { title: 'Structure the Finance', body: 'Explore suitable mortgage routes and compare the terms and structures relevant to your requirements.' },
          { title: 'Move to Completion', body: 'Navigate application, valuation, lender requirements and final approval through to transaction completion.' },
        ],
      },
      insights: {
        title: 'Understand the Asset. Structure the Finance.',
        lede: 'Explore the financial and property considerations influencing commercial mortgage decisions across the UAE.',
        all: { label: 'Explore Insights', href: '/blogs/' },
        cards: [
          { title: 'Owner-Occupied or Investment?', excerpt: 'How can the purpose of the property influence financing?', href: '/blogs/', image: 'blogs/blog-1.webp', alt: '' },
          { title: 'Financing Commercial Assets', excerpt: 'What do lenders consider when assessing the property?', href: '/blogs/', image: 'blogs/blog-2.webp', alt: '' },
          { title: 'Understanding LTV', excerpt: 'How can the financing requirement affect your upfront capital?', href: '/blogs/', image: 'blogs/blog-3.webp', alt: '' },
          { title: 'Rental Income & Financing', excerpt: 'Where can income-generating potential fit into the assessment?', href: '/blogs/', image: 'blogs/blog-4.webp', alt: '' },
        ],
      },
      story: {
        ...STORY_PHOTO,
        alt: 'An adviser reviewing a mortgage file',
        quote: 'ValuNxt helped us navigate the commercial mortgage process with a clear understanding of both the property and our financing requirements. From assessing the available options to coordinating the valuation and lender requirements, the process was handled with clarity throughout.',
        pill: 'Commercial Financing',
        title: 'Application to Approval.',
        stat: '100%',
        note: 'support across the key stages that take your commercial mortgage towards completion.',
        cta: { label: 'Get Started', href: '/free-consultation/' },
        arrow: { href: '/services/mortgages-services/', label: 'More about Mortgages' },
      },
      band: {
        ...BAND_PHOTO,
        title: 'Beyond the Mortgage',
        body: 'See More Than the Finance. Commercial property decisions go beyond borrowing. Bring market, valuation and property expertise into the bigger investment picture.',
        cta: { label: 'Discover More', href: '/blogs/' },
      },
      vision: {
        steps: [
          { title: 'Property', body: 'Find the opportunity. Explore commercial properties aligned with your business requirements or investment objectives.' },
          { title: 'Valuation', body: 'Understand the asset. Access independent valuation expertise to bring greater clarity to the property and its value.' },
          { title: 'Financing', body: 'Structure the acquisition. Explore mortgage options around the asset, your financing requirement and wider commercial objectives.' },
        ],
        pill: 'Our Vision',
        /* The comma after "connected" stands where the document's dash was. */
        quote: 'To make commercial property financing more connected, bringing the asset, numbers and opportunity into one clearer decision.',
      },
      /* "Commercial Property Finance" heads the strip in the document; hidden slot. */
      strip: stripOf('mortgages-services', ['Offices', 'Retail', 'Warehouses', 'Industrial Properties', 'Mixed-Use Assets', 'Investment Properties']),
      talk: {
        head: 'Finance Your Next Commercial Move.',
        lede: 'Whether you are acquiring business premises or your next investment asset, start with a clearer financing strategy.',
        cta: { label: 'Discuss Your Requirement', href: '/free-consultation/' },
        image: MORTGAGES_TEMPLATE.close.image,
      },
    },
  },
  {
    slug: 'non-resident-mortgages',
    /* The document's heading is a line of its own; the page name stays in the
       breadcrumb, the menu and the title bar. */
    title: 'Invest in the UAE. From Wherever You Are.',
    crumb: 'Non-Resident Mortgages',
    lede: 'Mortgage solutions that bring international buyers closer to property ownership in the UAE.',
    brief: {
      /* The document opens the brief on its first list, with no paragraph. */
      lede: [],
      whatIntro: 'Build Your Buying Position',
      what: [
        { lead: 'Your Income Profile.', text: 'Understand how earnings generated overseas may shape your financing potential.' },
        { lead: 'Your Own Contribution.', text: 'Plan the capital you are prepared to bring into the purchase.' },
        { lead: 'Your Property Budget.', text: 'Set a buying range that reflects both your ambitions and financial capacity.' },
        { lead: 'Your Investment Intent.', text: 'Consider the mortgage in the context of how you plan to use or hold the property.' },
      ],
      howIntro: 'Prepare for the UAE Mortgage Market',
      how: [
        { lead: 'Borrower Profile.', text: 'Different financial circumstances can open different routes to financing.' },
        { lead: 'Supporting Financials.', text: 'Bring together the information needed to present your position effectively.' },
        { lead: 'Property Considerations.', text: 'Make sure the property you pursue works from a financing perspective as well as an investment one.' },
        { lead: 'Market Value.', text: 'Consider the property’s value alongside the price you are being asked to pay and the finance behind it.' },
      ],
      panel: {
        title: 'Your UAE Investment. Within Reach.',
        sub: 'Explore the mortgage possibilities behind your next property move.',
      },
    },
    override: {
      why: {
        /* The document offers two versions of this card and says which it
           prefers ("Global Buyer. Local Know-How."). The other, "The Right
           Connections. In the Right Market." with its own note, is not used. */
        pill: 'Why Valunxt?',
        titleTop: 'Global Buyer.',
        titleMid: 'Local',
        titleMark: 'Know-How.',
        note: 'Access the UAE mortgage market with expertise that connects your overseas financial profile to the opportunities available here.',
        cta: { label: 'Explore Your Options', href: '/free-consultation/' },
        ...WHY_PHOTO,
      },
      approach: {
        eyebrow: 'From interest to ownership',
        columns: [
          { title: 'Know What’s Possible', body: 'Start with a clear view of your buying capacity and the mortgage routes that could fit your position.' },
          { title: 'Find the Right Match', body: 'Consider lenders and financing options in the context of the property you want to own.' },
          { title: 'Bring the Purchase Home', body: 'Move from mortgage application to valuation and approval, with each stage coordinated towards completion.' },
        ],
      },
      insights: {
        title: 'Buying Here. While Living There.',
        lede: 'Explore the financial questions and property considerations that matter when your UAE purchase begins overseas.',
        all: { label: 'Explore Mortgage Insights', href: '/blogs/' },
        cards: [
          { title: 'Buying UAE Property Without UAE Residency', excerpt: 'What changes when you enter the property market as an overseas buyer?', href: '/blogs/', image: 'blogs/blog-1.webp', alt: '' },
          { title: 'How Banks Look at Overseas Income', excerpt: 'Why where and how you earn can matter to a mortgage application.', href: '/blogs/', image: 'blogs/blog-2.webp', alt: '' },
          { title: 'The Capital Behind the Purchase', excerpt: 'What overseas buyers should consider beyond the amount they plan to borrow.', href: '/blogs/', image: 'blogs/blog-3.webp', alt: '' },
          { title: 'Choosing Property From Abroad', excerpt: 'The decisions worth getting right when you cannot approach the purchase like a local buyer.', href: '/blogs/', image: 'blogs/blog-4.webp', alt: '' },
        ],
      },
      story: {
        ...STORY_PHOTO,
        alt: 'An adviser reviewing a mortgage file',
        quote: 'Buying property in the UAE while living overseas initially felt like a complicated process. ValuNxt made the financing much easier to understand, kept everything moving and gave us confidence at every stage of the purchase.',
        /* The document sets two labels over the panel ("Cross-Border
           Mortgages", "Non-Resident Mortgages"); the panel has one pill, and
           the page's own name is already in the hero above. */
        pill: 'Cross-Border Mortgages',
        title: 'From Overseas to Ownership.',
        stat: '3 Steps',
        note: 'from establishing your financing position to progressing your UAE property purchase.',
        cta: { label: 'Start Your Journey', href: '/free-consultation/' },
        arrow: { href: '/services/mortgages-services/', label: 'More about Mortgages' },
      },
      band: {
        ...BAND_PHOTO,
        title: 'Valunxt Mortgage Intelligence',
        body: 'Think Beyond the Distance. When your income is overseas and your property is in the UAE, the right mortgage decision needs to make sense on both sides.',
        cta: { label: 'Discover More', href: '/blogs/' },
      },
      vision: {
        steps: [
          { title: 'Your Finances', body: 'Start where you earn. Consider how income, commitments and available capital shape the financing position you bring to the UAE.' },
          { title: 'Your Property', body: 'Focus where you invest. Connect your financing capacity with the property and purpose behind the purchase.' },
          { title: 'Your Mortgage', body: 'Bring the two together. Find a financing route capable of connecting an overseas financial profile with a UAE property ambition.' },
        ],
        pill: 'Our Vision',
        quote: 'To bring UAE property opportunities within reach of buyers around the world.',
      },
      /* "Built for Global Buyers" heads the strip in the document; hidden slot. */
      strip: stripOf('mortgages-services', ['Overseas Professionals', 'Business Owners', 'International Investors', 'Portfolio Buyers', 'Future UAE Residents', 'Second-Home Buyers']),
      talk: {
        head: 'Your UAE Property Could Start From Anywhere.',
        lede: 'Wherever you are based, start exploring what it could take to finance your property in the UAE.',
        cta: { label: 'Explore Your Options', href: '/free-consultation/' },
        image: MORTGAGES_TEMPLATE.close.image,
      },
    },
  },
  {
    slug: 'mortgage-pre-approval',
    title: 'Mortgage Pre-Approval',
    lede: 'Know your potential borrowing position before you start searching, with mortgage pre-approval shaped around your finances and property plans.',
    brief: {
      lede: [
        'Finding a property you love is one thing. Knowing whether the numbers work is another.',
        'A mortgage pre-approval gives you an early view of your borrowing potential based on your financial profile. It can help put a more realistic budget behind your search and reduce uncertainty when you are ready to pursue a property.',
      ],
      whatIntro: 'Start With Your Buying Power',
      what: [
        { lead: 'Define Your Budget.', text: 'See what your financial profile could realistically support before setting your sights on a property.' },
        { lead: 'Prepare Your Deposit.', text: 'Get a clearer view of the upfront contribution you may need to make your purchase possible.' },
        { lead: 'Search With Purpose.', text: 'Focus on properties that align with both what you want and what your finances may support.' },
        { lead: 'Strengthen Your Position.', text: 'Approach your property search with a pre-approved financing position already taking shape.' },
      ],
      howIntro: 'What Goes Into Pre-Approval?',
      how: [
        { lead: 'Income.', text: 'Your salary or business income helps establish your potential borrowing capacity.' },
        { lead: 'Existing Commitments.', text: 'Loans, credit cards and other liabilities may affect how much a lender is prepared to offer.' },
        { lead: 'Financial History.', text: 'Your wider financial profile forms part of the lender’s assessment.' },
        { lead: 'Documentation.', text: 'The right paperwork helps move the assessment forward without unnecessary delays.' },
      ],
      panel: {
        title: 'Your Property Search. One Step Ahead.',
        sub: 'Know where you stand financially before narrowing down where you want to buy.',
      },
    },
    override: {
      why: {
        pill: 'Why pre-approval?',
        titleTop: 'Know Your Position',
        titleMid: 'From the',
        titleMark: 'Start.',
        note: 'Get an early indication of your borrowing potential and bring greater direction to your property search.',
        cta: { label: 'Get Pre-Approved', href: '/free-consultation/' },
        ...WHY_PHOTO,
      },
      approach: {
        eyebrow: 'How pre-approval works',
        columns: [
          { title: 'Assess Your Position', body: 'We review your income, existing commitments and financial profile to establish your potential borrowing position.' },
          { title: 'Prepare & Submit', body: 'The required documents are checked and your application is prepared for submission to a suitable lender.' },
          { title: 'Receive Pre-Approval', body: 'Once assessed, you receive an initial lending decision that can help define the budget for your property search.' },
        ],
      },
      insights: {
        /* "Before You Start House Hunting" is the document's kicker here; no slot. */
        title: 'A Budget Changes How You Search.',
        lede: 'Pre-approval is not simply about getting a number. It can influence which properties you consider, how you plan your deposit and the position you are in when it is time to make an offer.',
        all: { label: 'Explore Mortgage Insights', href: '/blogs/' },
        cards: [
          { title: 'Salary vs Borrowing Power', excerpt: 'How does income translate into potential mortgage capacity?', href: '/blogs/', image: 'blogs/blog-1.webp', alt: '' },
          { title: 'The Deposit Question', excerpt: 'How much cash might you need alongside the mortgage?', href: '/blogs/', image: 'blogs/blog-2.webp', alt: '' },
          { title: 'Existing Loans', excerpt: 'Could your current commitments change what you are able to borrow?', href: '/blogs/', image: 'blogs/blog-3.webp', alt: '' },
          { title: 'Pre-Approval Validity', excerpt: 'How long might an approval remain useful while you search for a property?', href: '/blogs/', image: 'blogs/blog-4.webp', alt: '' },
        ],
      },
      story: {
        ...STORY_PHOTO,
        alt: 'An adviser reviewing a mortgage file',
        quote: 'ValuNxt made the pre-approval process clear from the beginning. We understood our borrowing position, knew exactly what documents were needed, and could start our property search with a much more defined budget.',
        pill: 'Mortgage Pre-Approval',
        title: 'From Application to Pre-Approval.',
        stat: '100%',
        note: 'support through profile assessment, document preparation, lender submission and pre-approval.',
        cta: { label: 'Start Your Application', href: '/free-consultation/' },
        arrow: { href: '/services/mortgages-services/', label: 'More about Mortgages' },
      },
      band: {
        ...BAND_PHOTO,
        title: 'Valunxt Mortgage Intelligence',
        body: 'Your Finances. Your Property. Connected. Bring mortgage, property and valuation expertise together when your purchase needs a wider perspective.',
        cta: { label: 'Discover More', href: '/blogs/' },
      },
      vision: {
        steps: [
          { title: 'Mortgage Expertise', body: 'Navigate the finance. Explore lender requirements, eligibility and mortgage considerations with specialist support.' },
          { title: 'Property Expertise', body: 'Connect the search. Bring your potential financing position into the property search to focus on opportunities that make sense for you.' },
          { title: 'Valuation Expertise', body: 'Know the value. Access independent valuation expertise when a clearer view of the property’s value is needed.' },
        ],
        pill: 'Our Vision',
        /* The comma after "connected" stands where the document's dash was. */
        quote: 'To make property financing more connected, from knowing what you may be able to borrow to buying the property that fits.',
      },
      /* "Pre-Approval For" heads the strip in the document; hidden slot. */
      strip: stripOf('mortgages-services', ['Salaried Professionals', 'Self-Employed Buyers', 'First-Time Buyers', 'UAE Residents', 'UAE Nationals', 'Property Investors']),
      talk: {
        head: 'Know Your Position Before You Find the Property.',
        lede: 'Start your mortgage pre-approval and put a more defined financing position behind your property search.',
        cta: { label: 'Get Pre-Approved', href: '/free-consultation/' },
        image: MORTGAGES_TEMPLATE.close.image,
      },
    },
  },
  {
    slug: 'islamic-finance',
    /* The document's heading is a line of its own; the page name stays in the
       breadcrumb, the menu and the title bar. */
    title: 'Property Finance. Aligned With Your Principles.',
    crumb: 'Islamic Finance',
    lede: 'Explore Shari’ah-compliant financing solutions for buying property in the UAE.',
    brief: {
      /* The document heads the brief ("A Different Approach to Property
         Finance."); the brief has no heading, so it opens the first paragraph. */
      lede: [
        'A Different Approach to Property Finance. How you finance a property can matter just as much as the property you choose.',
        'Islamic finance offers an alternative route to property ownership, built around Shari’ah-compliant principles and defined contractual structures. ValuNxt helps you explore the available options and consider how they fit your finances, property plans and longer-term priorities.',
      ],
      whatIntro: 'Start With Your Property Plans',
      what: [
        { lead: 'Your Purchase.', text: 'Consider the property, its purpose and the amount you are looking to finance.' },
        { lead: 'Your Contribution.', text: 'Plan the capital you intend to bring into the purchase.' },
        { lead: 'Your Affordability.', text: 'Look at what a sustainable monthly commitment could mean for your finances.' },
        { lead: 'Your Priorities.', text: 'Choose a financing approach that reflects both your financial objectives and personal principles.' },
      ],
      howIntro: 'Understand the Finance',
      how: [
        { lead: 'Financing Structure.', text: 'See how the arrangement behind the property purchase is structured.' },
        { lead: 'Profit Rate.', text: 'Understand how the cost of finance is determined within the proposed arrangement.' },
        { lead: 'Finance Term.', text: 'Consider how the length of the agreement affects your ongoing commitments.' },
        { lead: 'Property Value.', text: 'Bring the property’s valuation into the financing decision before moving towards completion.' },
      ],
      panel: {
        title: 'Your Home. Your Principles.',
        sub: 'Put the right financing behind your property without losing sight of what matters to you.',
      },
    },
    override: {
      why: {
        pill: 'Why Valunxt?',
        titleTop: 'Understand the',
        titleMid: 'Structure. Then',
        titleMark: 'Make the Decision.',
        note: 'Look beyond the headline numbers and understand how the financing works, what it means for your purchase and how it fits your plans.',
        cta: { label: 'Explore Islamic Finance', href: '/free-consultation/' },
        ...WHY_PHOTO,
      },
      approach: {
        eyebrow: 'Your route to Islamic finance',
        columns: [
          { title: 'Define What Works for You', body: 'Start with your property plans, financial position and the kind of commitment you are comfortable taking on.' },
          { title: 'Explore the Possibilities', body: 'Consider relevant Shari’ah-compliant financing options and how their terms could work around your purchase.' },
          { title: 'Move Towards Ownership', body: 'Progress through application, property valuation and approval towards completing your purchase.' },
        ],
      },
      insights: {
        title: 'Know the Principles. Understand the Finance.',
        lede: 'Explore the ideas, structures and property considerations behind Islamic financing in the UAE.',
        all: { label: 'Explore Mortgage Insights', href: '/blogs/' },
        cards: [
          { title: 'Islamic Finance and Conventional Mortgages', excerpt: 'Understanding what makes the two approaches fundamentally different.', href: '/blogs/', image: 'blogs/blog-1.webp', alt: '' },
          { title: 'How Profit Rates Work in Property Finance', excerpt: 'A closer look at one of the numbers buyers are likely to encounter.', href: '/blogs/', image: 'blogs/blog-2.webp', alt: '' },
          { title: 'Choosing the Right Finance Term', excerpt: 'How the length of your financing can shape the commitment you make.', href: '/blogs/', image: 'blogs/blog-3.webp', alt: '' },
          { title: 'Before You Choose Islamic Property Finance', excerpt: 'The financial and property questions worth considering before you proceed.', href: '/blogs/', image: 'blogs/blog-4.webp', alt: '' },
        ],
      },
      story: {
        ...STORY_PHOTO,
        alt: 'An adviser reviewing a mortgage file',
        quote: 'We wanted our property financing to reflect the way we preferred to manage our finances. ValuNxt helped us understand the available options and the numbers behind them, so we could make our decision with much greater clarity.',
        pill: 'Islamic Property Finance',
        title: 'One Property. Three Considerations.',
        stat: '3',
        note: 'your principles, your finances and your property plans considered together.',
        cta: { label: 'Explore Your Options', href: '/free-consultation/' },
        arrow: { href: '/services/mortgages-services/', label: 'More about Mortgages' },
      },
      band: {
        ...BAND_PHOTO,
        title: 'Valunxt Mortgage Intelligence',
        body: 'The Right Finance Is About More Than Numbers. A property decision carries financial and personal considerations. We bring the wider picture into view before you commit.',
        cta: { label: 'Discover More', href: '/blogs/' },
      },
      vision: {
        steps: [
          { title: 'Principles', body: 'Start with what matters. Consider financing designed to operate within a Shari’ah-compliant framework.' },
          { title: 'Property', body: 'Focus on the asset. Look at the property, its value and the purpose behind your purchase.' },
          { title: 'Finance', body: 'Understand the commitment. Consider the structure, term and financial implications before making your decision.' },
        ],
        pill: 'Our Vision',
        quote: 'To make principled property financing easier to understand, evaluate and put into action.',
      },
      /* "Islamic Finance For" heads the strip in the document; hidden slot. */
      strip: stripOf('mortgages-services', ['Home Buyers', 'Property Investors', 'First-Time Buyers', 'UAE Nationals', 'UAE Residents', 'International Buyers']),
      talk: {
        head: 'Finance the Property. Stay True to Your Principles.',
        lede: 'Explore Shari’ah-compliant property financing built around the purchase you want to make.',
        cta: { label: 'Explore Islamic Finance', href: '/free-consultation/' },
        image: MORTGAGES_TEMPLATE.close.image,
      },
    },
  },
];

export const MORTGAGES_SUBS = buildSubs(PARENT, SPECS);
