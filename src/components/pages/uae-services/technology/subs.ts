/**
 * The five pages under /en-ae/services/technology-data-ai/.
 *
 * Practice-level sections once, page-level copy per sub-service; the names
 * and slugs are the registry's. See ../template/subTypes.ts for the shape,
 * the length rules and the note on the success story being a placeholder.
 */
/*
 * ALL FIVE PAGES ARE THE CLIENT'S page documents (20260914), word for word,
 * under the same two rules as the rest of the UAE pages: nothing added to the
 * documents or dropped from them, and no em dashes. Each document writes every
 * practice-level section for its page, so each page carries them in
 * `override`; the PARENT below is the shape they override and shows nowhere.
 * The same slot calls as the other sub-services apply, and the ones particular
 * to a page are marked at the line.
 *
 * Three of the testimonials (AI Solutions, Enterprise Solutions, ERP
 * Dashboards) are marked "Draft testimonial pending approval" in the
 * document, with an attribution of the form "AI Solutions Client". They are on
 * the pages as written, attribution included, until the client approves or
 * replaces them; the note itself is not page copy.
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
import { TECHNOLOGY_TEMPLATE } from './content';

const PARENT: SubParent = {
  service: 'technology-data-ai',
  /* The documents write the breadcrumb out in full. */
  crumb: 'Technology, Data & AI',
  hero: { image: TECHNOLOGY_TEMPLATE.hero.image, alt: TECHNOLOGY_TEMPLATE.hero.alt },
  panel: PANEL_PLATE,
  why: {
    pill: 'Why us?',
    titleTop: 'Technology in',
    titleMid: 'Service of the',
    titleMark: 'Business Case',
    note: 'Measured on outcomes, not activity, and built by people who close books.',
    cta: { label: 'Schedule a Call', href: '/free-consultation/' },
    ...WHY_PHOTO,
  },
  approach: {
    eyebrow: 'Our approach',
    columns: [
      {
        title: 'Finance-grade discipline',
        body:
          'The people who design your systems are the people who will be asked to close on them. ' +
          'Chart of accounts, controls, audit trail and reporting are designed by accountants ' +
          'first, which is why the ERP we implement produces a set of books an auditor can test.',
      },
      {
        title: 'Cloud, with governance',
        body:
          'Moving a core system to the cloud is easy; keeping the data governed once it is there ' +
          'is not. Access, retention, residency and change control are set up as they would be ' +
          'for a financial system — because that is what it is.',
      },
      {
        title: 'Measured on outcomes',
        body:
          'Every engagement starts with the hours, errors or decisions it is meant to change, ' +
          'quantified, and ends with the same measures taken again. Activity is not an outcome, ' +
          'and a dashboard nobody reads is not a result.',
      },
    ],
  },
  insights: {
    title: 'Systems That Finance Can Stand Behind',
    lede:
      'Technology earns its place where it changes a decision or a number. Explore our latest ' +
      'thinking on data, valuation models and the systems behind property and finance in the UAE.',
    all: { label: 'Learn more', href: '/blogs/' },
    cards: SITE_ARTICLES,
  },
  story: {
    ...STORY_PHOTO,
    alt: 'A finance lead reviewing a dashboard',
    quote:
      'Month-end used to run on eleven spreadsheets. Valunxt moved us to a cloud ERP with a ' +
      'dashboard the board actually reads, and the close came down to four days.',
    initials: 'NP',
    role: 'Chief operating officer',
    org: 'Dubai trading group',
    pill: 'Success story',
    title: 'From Eleven Spreadsheets to One Dashboard',
    stat: '4 days',
    note: 'to a full month-end close, on a cloud ERP with governed data behind every number.',
    cta: { label: 'Discuss Your Case', href: '/free-consultation/' },
    arrow: { href: '/services/technology-data-ai/', label: 'More about Technology & AI' },
  },
  band: {
    ...BAND_PHOTO,
    title: 'Valunxt Finance Intelligence',
    body:
      'Working with the group’s accountants, valuers and research team, Valunxt turns a ' +
      'technology roadmap into systems finance can stand behind — governed, measured and built ' +
      'around the business case.',
    cta: { label: "Discover what's next", href: '/services/accounting-tax-services/' },
  },
  vision: SHARED_VISION,
  strip: stripOf('technology-data-ai', [
    'Technology Consulting',
    'AI Solutions',
    'ERP Dashboards',
    'PropTech',
    'Enterprise Solutions',
    'Cloud Migration',
  ]),
  talk: {
    head: TECHNOLOGY_TEMPLATE.close.head,
    lede: TECHNOLOGY_TEMPLATE.close.lede,
    cta: TECHNOLOGY_TEMPLATE.close.primary,
    image: TECHNOLOGY_TEMPLATE.close.image,
  },
};

const SPECS: SubSpec[] = [
  /* Where a comma stands in place of a dash the document carried, it is in:
     the Technology Consulting "System Modernisation" card title and the ERP
     Dashboards opening paragraph. */
  {
    slug: 'technology-consulting',
    title: 'Technology Consulting',
    lede: 'Make informed technology decisions through systems assessment, architecture review and a transformation roadmap aligned with your business priorities.',
    brief: {
      lede: [
        'Effective technology planning requires a clear understanding of how an organisation operates today and what it will require next. Disconnected applications, repeated manual work and limited access to reliable information can indicate gaps that individual software purchases may leave unresolved.',
        'ValuNxt assesses your existing systems, architecture and workflows to establish where change is needed and which improvements warrant investment. We help you evaluate what to retain, improve, connect or replace, then develop a practical roadmap that accounts for business priorities, technical dependencies and the resources required to proceed.',
      ],
      whatIntro: 'What We Examine',
      what: [
        { lead: 'Application Landscape.', text: 'Review the purpose, usage and limitations of existing systems, including overlapping tools and capabilities that remain underused.' },
        { lead: 'Architecture & Data Flow.', text: 'Map how applications exchange information, identifying disconnected records, integration gaps and dependencies between business functions.' },
        { lead: 'Workflow Performance.', text: 'Examine how tasks, approvals and information move across teams to locate bottlenecks, repeated work and avoidable manual intervention.' },
        { lead: 'Capability Gaps.', text: 'Compare current capabilities with business requirements, considering scalability, internal skills and readiness for planned changes.' },
      ],
      howIntro: 'What the Assessment Delivers',
      how: [
        { lead: 'A Defined Improvement Agenda.', text: 'A prioritised view of the gaps to address, the processes affected and the business reasons for taking action.' },
        { lead: 'Technology Options & Trade-offs.', text: 'An assessment of suitable improvement routes, weighing functional fit, integration requirements, cost and ongoing support needs.' },
        { lead: 'Target Architecture.', text: 'A proposed structure for how systems and information should connect to support future business requirements.' },
        { lead: 'A Phased Transformation Roadmap.', text: 'A sequence of initiatives with dependencies, indicative resource needs and milestones to guide implementation planning.' },
      ],
      panel: { title: 'Technology With Intent.', sub: 'Give each investment a defined purpose within the organisation you are building.' },
    },
    override: {
      why: {
        pill: 'Why Valunxt?',
        titleTop: 'Where Technology',
        titleMid: 'Meets Business',
        titleMark: 'Strategy.',
        note: 'We bring technical understanding and commercial perspective together to shape technology choices around what the business actually needs.',
        cta: { label: 'Speak to an Advisor', href: '/free-consultation/' },
        ...WHY_PHOTO,
      },
      approach: {
        eyebrow: 'Our consulting approach',
        columns: [
          { title: 'Diagnose the Current Environment', body: 'We combine stakeholder discussions with system and workflow reviews to understand where limitations originate, how they affect operations and which requirements remain unmet.' },
          { title: 'Evaluate the Way Forward', body: 'Improvement options are compared against agreed requirements, considering architectural fit, expected benefits, cost and delivery complexity before recommendations are prioritised for the organisation.' },
          { title: 'Build the Transformation Roadmap', body: 'We organise the recommended initiatives into practical phases, identifying dependencies, ownership and resource considerations so leadership can plan investment and prepare teams for change.' },
        ],
      },
      /* The document gives each card a category and a title; no excerpt. */
      insights: {
        title: 'Where Technology Decisions Make the Difference.',
        lede: 'Explore the questions behind system modernisation, technology spending and the planning choices that shape transformation.',
        all: { label: 'Explore Technology Insights', href: '/blogs/' },
        cards: [
          { category: 'System Modernisation', title: 'Replace the System, or Resolve the Integration Gap?', href: '/blogs/', image: 'blogs/blog-1.webp', alt: '' },
          { category: 'Operational Efficiency', title: 'What Your Spreadsheets Reveal About Your Systems', href: '/blogs/', image: 'blogs/blog-2.webp', alt: '' },
          { category: 'Investment Planning', title: 'The Technology Costs Beyond Implementation', href: '/blogs/', image: 'blogs/blog-3.webp', alt: '' },
          { category: 'Transformation Strategy', title: 'Why Some Improvements Need to Happen First', href: '/blogs/', image: 'blogs/blog-4.webp', alt: '' },
        ],
      },
      story: {
        ...STORY_PHOTO,
        alt: 'A consultant reviewing a systems map',
        quote: 'ValuNxt helped us look at our technology environment as a whole rather than addressing systems in isolation. Their assessment gave us a clear view of our priorities, dependencies and the sequence in which improvements should be approached.',
        pill: 'Your Transformation Roadmap',
        title: 'Separate Initiatives. One Coordinated Plan.',
        note: 'Bring technology priorities, dependencies and implementation stages together in a roadmap leadership can plan around.',
        cta: { label: 'Discuss Your Transformation', href: '/free-consultation/' },
        arrow: { href: '/services/technology-data-ai/', label: 'More about Technology, Data & AI' },
      },
      band: {
        ...BAND_PHOTO,
        title: 'Valunxt Technology Perspective',
        body: 'Decisions That Shape What Comes Next. Technology choices made today can influence how easily an organisation scales, introduces new capabilities and responds to changing requirements. Those implications deserve consideration while the options are still open.',
        cta: { label: 'Discuss Your Technology Plans', href: '/free-consultation/' },
      },
      vision: {
        steps: [
          { title: 'Investment Discipline', body: 'Establish the reason to proceed. Each initiative should address a defined requirement. Agreeing the intended benefit and how it will be assessed gives leadership a stronger basis for allocating resources.' },
          { title: 'Architectural Fit', body: 'Understand the wider implications. A platform may meet one team’s needs while creating additional work elsewhere. Its connections, data requirements and support demands need consideration across the organisation.' },
          { title: 'Readiness for Change', body: 'Prepare the people behind the systems. New technology can change responsibilities, routines and information ownership. Identifying those implications early helps make training, adoption and internal capacity part of the plan.' },
        ],
        pill: 'Our Vision',
        quote: 'To make technology a considered investment in how organisations operate, adapt and grow.',
      },
      /* The strip's heading in the document has no visible slot. */
      strip: stripOf('technology-data-ai', ['Systems Assessment', 'Digital Gap Analysis', 'Architecture Review', 'Workflow Improvement', 'Technology Investment Planning', 'Transformation Roadmaps']),
      talk: {
        head: 'Turn Technology Into Business Advantage.',
        lede: 'Speak with our advisors about technology choices that can strengthen operations, support growth and create lasting value.',
        cta: { label: 'Speak to an Expert', href: '/free-consultation/' },
        image: TECHNOLOGY_TEMPLATE.close.image,
      },
    },
  },
  {
    slug: 'ai-solutions',
    title: 'AI Solutions',
    lede: 'Apply AI to automate knowledge-intensive work, strengthen analysis and improve how information moves through everyday business processes.',
    brief: {
      lede: [
        'AI creates value when it is applied to the right problem. Across an organisation, significant time can be absorbed by reviewing documents, finding information, interpreting data, responding to enquiries and coordinating repetitive processes.',
        'ValuNxt identifies where AI can make a practical difference, then designs solutions around the data, workflows and people involved. From focused automation to intelligent assistance and analysis, we build AI capabilities with clear use cases, appropriate oversight and measurable objectives from the outset.',
      ],
      whatIntro: 'Where AI Can Contribute',
      what: [
        { lead: 'Document Intelligence.', text: 'Extract, classify and interpret information across invoices, forms, contracts and other business records, while directing exceptions for appropriate review.' },
        { lead: 'Knowledge Assistance.', text: 'Help teams retrieve relevant information, summarise complex material and work more effectively with approved organisational knowledge.' },
        { lead: 'Intelligent Analysis.', text: 'Examine business information to identify patterns, anomalies and emerging developments that warrant closer attention.' },
        { lead: 'Workflow Intelligence.', text: 'Support enquiry handling, request classification, task routing and other processes where AI can accelerate the path from information to action.' },
      ],
      howIntro: 'What Makes AI Work',
      how: [
        { lead: 'A Defined Use Case.', text: 'Establish the business problem, intended users and expected outcome before determining the appropriate AI solution.' },
        { lead: 'Relevant Data.', text: 'Assess whether the information available is suitable, accessible and sufficiently reliable for the intended application.' },
        { lead: 'Responsible Oversight.', text: 'Define review requirements, escalation points and decision ownership so accountability remains clear.' },
        { lead: 'Measurable Performance.', text: 'Evaluate quality, efficiency, adoption and other relevant outcomes against agreed expectations to guide ongoing improvement.' },
      ],
      panel: { title: 'Intelligence That Works With You.', sub: 'Bring AI into everyday business with purpose, relevance and a clear role in how work gets done.' },
    },
    override: {
      why: {
        pill: 'Why Valunxt?',
        titleTop: 'Intelligence Shaped',
        titleMid: 'Around Your',
        titleMark: 'Business.',
        note: 'We design AI around your processes, information and priorities, creating capabilities that have a defined role within the organisation.',
        cta: { label: 'Get in Touch', href: '/contact/' },
        ...WHY_PHOTO,
      },
      approach: {
        eyebrow: 'Our AI approach',
        columns: [
          { title: 'Identify the Opportunity', body: 'We examine information-intensive and repetitive activities, assess data readiness and identify where AI has a credible role to play.' },
          { title: 'Build & Validate', body: 'The solution is developed against representative business scenarios, with testing focused on quality, reliability, exceptions and appropriate human review.' },
          { title: 'Integrate & Improve', body: 'We connect the capability with the intended workflow, prepare users and establish performance measures so the solution can evolve with real-world use.' },
        ],
      },
      /* The document gives each card a category and a title; no excerpt. */
      insights: {
        title: 'Beyond the AI Hype.',
        lede: 'Explore the practical questions behind where AI creates value, how it should be implemented and what determines whether it works in practice.',
        all: { label: 'Explore AI Insights', href: '/blogs/' },
        cards: [
          { category: 'AI Adoption', title: 'Where Should a Business Actually Start With AI?', href: '/blogs/', image: 'blogs/blog-1.webp', alt: '' },
          { category: 'Document Intelligence', title: 'When Documents Become Usable Data', href: '/blogs/', image: 'blogs/blog-2.webp', alt: '' },
          { category: 'Knowledge Systems', title: 'What Makes an AI Assistant Worth Using?', href: '/blogs/', image: 'blogs/blog-3.webp', alt: '' },
          { category: 'AI Performance', title: 'How Do You Know AI Is Actually Working?', href: '/blogs/', image: 'blogs/blog-4.webp', alt: '' },
        ],
      },
      story: {
        ...STORY_PHOTO,
        alt: 'A consultant reviewing a systems map',
        quote: 'ValuNxt helped us move from discussing AI in broad terms to identifying where it could genuinely improve our day-to-day operations. The solution was built around a specific business need, with clear consideration of our data, workflow and internal review requirements.',
        role: 'AI Solutions Client',
        pill: 'From Use Case to Value',
        title: 'Start Where AI Can Matter Most.',
        note: 'Focus investment on a defined business requirement where the impact can be tested, measured and improved before broader adoption.',
        cta: { label: 'Explore Your AI Opportunity', href: '/free-consultation/' },
        arrow: { href: '/services/technology-data-ai/', label: 'More about Technology, Data & AI' },
      },
      band: {
        ...BAND_PHOTO,
        title: 'Valunxt AI Perspective',
        body: 'Capability With Accountability. AI should strengthen how people work without obscuring how outputs are produced, reviewed or ultimately acted upon.',
        cta: { label: 'Speak to Our Team', href: '/free-consultation/' },
      },
      vision: {
        steps: [
          { title: 'Relevant Context', body: 'Give AI the right foundation. Useful outputs depend on the information available to the solution. Relevant sources, current records and appropriate access need to form part of its design.' },
          { title: 'Human Judgement', body: 'Keep people where judgement matters. Review and escalation requirements should reflect the consequences of the task, keeping responsibility clear where decisions require human oversight.' },
          { title: 'Continuous Evaluation', body: 'Measure performance beyond launch. Business requirements, information and usage patterns evolve. Regular evaluation helps maintain quality and identify where the solution requires refinement.' },
        ],
        pill: 'Our Vision',
        quote: 'To make AI a practical capability that strengthens how organisations work, understand and decide.',
      },
      /* The strip's heading in the document has no visible slot. */
      strip: stripOf('technology-data-ai', ['Document Intelligence', 'Knowledge Assistants', 'Intelligent Analysis', 'Content Assistance', 'Enquiry Automation', 'Workflow Intelligence']),
      talk: {
        head: 'Turn AI Potential Into Business Value.',
        lede: 'Speak with our team about where AI can strengthen the way your organisation works, analyses and responds.',
        cta: { label: 'Talk to Experts', href: '/free-consultation/' },
        image: TECHNOLOGY_TEMPLATE.close.image,
      },
    },
  },
  {
    slug: 'erp-dashboards',
    title: 'ERP Dashboards',
    lede: 'Turn financial and operational data into connected management dashboards that reveal performance, movement and the detail behind the numbers.',
    brief: {
      lede: [
        'Business information often sits across ERP modules, operational systems and spreadsheets. While each source may answer part of the question, understanding what is changing, and why, can require significant preparation before management has a complete picture.',
        'ValuNxt brings relevant business data into connected dashboards designed around the way performance is reviewed and managed. We establish consistent measures, connect headline results with underlying detail and create reporting views that help leadership identify movements, investigate exceptions and focus attention where it is needed.',
      ],
      whatIntro: 'Performance in View',
      what: [
        { lead: 'Financial Performance.', text: 'Monitor revenue, costs, margins, profitability and other financial measures using consistent reporting definitions.' },
        { lead: 'Operational Performance.', text: 'Track activity across sales, procurement, inventory, projects, delivery or services according to the way your organisation operates.' },
        { lead: 'Working Capital.', text: 'Examine receivables, payables, inventory and related movements to understand where capital is tied up and where attention may be required.' },
        { lead: 'Management Performance.', text: 'Compare actual results with budgets, targets and prior periods across business units, departments, projects or other relevant dimensions.' },
      ],
      howIntro: 'Reporting Built on Consistency',
      how: [
        { lead: 'Connected Data.', text: 'Bring relevant ERP information and approved supporting sources together to reduce fragmented and repetitive reporting.' },
        { lead: 'Defined KPIs.', text: 'Establish how measures are calculated, which information they include and how they should be interpreted.' },
        { lead: 'Drill-Down Visibility.', text: 'Move from headline performance into the transactions, categories, periods or business areas contributing to the result.' },
        { lead: 'Reporting Controls.', text: 'Establish permissions, refresh schedules and validation processes appropriate to the information and its users.' },
      ],
      panel: { title: 'See the Business Behind the Numbers.', sub: 'Connect performance with the underlying activity to understand not only what changed, but where to look next.' },
    },
    override: {
      why: {
        pill: 'Why Valunxt?',
        titleTop: 'Dashboards Built',
        titleMid: 'Around',
        titleMark: 'Decisions.',
        note: 'We start with the questions management needs answered, then structure the data, measures and reporting views around how those decisions are made.',
        cta: { label: 'Discuss Your Reporting Needs', href: '/free-consultation/' },
        ...WHY_PHOTO,
      },
      approach: {
        eyebrow: 'Our dashboard approach',
        columns: [
          { title: 'Define What Matters', body: 'We identify the users, management questions and performance measures that should shape the reporting environment.' },
          { title: 'Connect & Validate', body: 'Relevant data sources are brought together, calculations are defined and outputs are reconciled against agreed references before they become part of management reporting.' },
          { title: 'Design for Use', body: 'Dashboards are structured around how users review performance, investigate movements and move from headline measures into the detail behind them.' },
        ],
      },
      /* The document gives each card a category and a title; no excerpt. */
      insights: {
        title: 'Beyond the Headline Number.',
        lede: 'Explore the reporting choices, performance measures and data disciplines behind management dashboards that provide genuine business visibility.',
        all: { label: 'Explore Data Insights', href: '/blogs/' },
        cards: [
          { category: 'KPI Design', title: 'When the Same KPI Tells Two Different Stories', href: '/blogs/', image: 'blogs/blog-1.webp', alt: '' },
          { category: 'Profitability', title: 'Revenue Is Growing. Is Profitability Following?', href: '/blogs/', image: 'blogs/blog-2.webp', alt: '' },
          { category: 'Data Reliability', title: 'What Makes Management Reporting Trustworthy?', href: '/blogs/', image: 'blogs/blog-3.webp', alt: '' },
          { category: 'Reporting Design', title: 'How Much Detail Does a Decision-Maker Really Need?', href: '/blogs/', image: 'blogs/blog-4.webp', alt: '' },
        ],
      },
      story: {
        ...STORY_PHOTO,
        alt: 'A consultant reviewing a systems map',
        quote: 'ValuNxt helped us bring financial and operational reporting into a much more connected view. Management can now move from headline performance into the underlying detail without relying on multiple reports and spreadsheets to understand what changed.',
        role: 'ERP Dashboards Client',
        pill: 'Connected Performance',
        title: 'One Business. One Performance View.',
        note: 'Bring financial and operational measures together so management can see how performance connects across the organisation.',
        cta: { label: 'Discuss Your Dashboard', href: '/free-consultation/' },
        arrow: { href: '/services/technology-data-ai/', label: 'More about Technology, Data & AI' },
      },
      band: {
        ...BAND_PHOTO,
        title: 'Valunxt Performance Perspective',
        body: 'From Performance to Perspective. The number shows the result. The right context helps explain what is driving it and where management attention may be required.',
        cta: { label: 'Talk to Our Team', href: '/free-consultation/' },
      },
      vision: {
        steps: [
          { title: 'Definition', body: 'Establish a common measure. Consistent calculations, reporting periods and exclusions create a shared basis for interpreting performance across teams and reporting cycles.' },
          { title: 'Context', body: 'Understand the movement. Targets, prior periods and relevant operational measures provide the context needed to assess whether a change is expected, significant or requires investigation.' },
          { title: 'Ownership', body: 'Connect insight with action. Performance becomes more useful when responsibility is clear and the right people can investigate exceptions, explain movements and determine the next step.' },
        ],
        pill: 'Our Vision',
        quote: 'To make business performance visible in a way that brings greater clarity to every management conversation.',
      },
      /* The strip's heading in the document has no visible slot. */
      strip: stripOf('technology-data-ai', ['Finance & Profitability', 'Cash & Working Capital', 'Sales Performance', 'Procurement & Inventory', 'Projects & Operations', 'Executive Reporting']),
      talk: {
        head: 'Your Business. Clearly in View.',
        lede: 'Speak with our team about bringing critical performance information together for clearer management oversight.',
        cta: { label: 'Start a Conversation', href: '/free-consultation/' },
        image: TECHNOLOGY_TEMPLATE.close.image,
      },
    },
  },
  {
    slug: 'proptech',
    title: 'PropTech',
    lede: 'Technology built around real estate connecting property information, workflows and client interactions across the property lifecycle.',
    brief: {
      lede: [
        'Real estate operations depend on information moving accurately between properties, people and processes. When records, documents and activity are spread across disconnected systems, even routine work becomes harder to coordinate.',
        'ValuNxt develops PropTech solutions around the realities of property businesses. We connect data, workflows and digital experiences across transactions, valuation, research and portfolio operations, helping teams work with greater continuity from one stage to the next.',
      ],
      whatIntro: 'The Property Workflows We Support',
      what: [
        { lead: 'CRM & Client Relationships.', text: 'Connect enquiries, requirements and client activity across teams and interactions.' },
        { lead: 'Property & Market Data.', text: 'Structure property records and relevant market information for easier access and analysis.' },
        { lead: 'Transaction Workflows.', text: 'Coordinate documentation, responsibilities and milestones across sales and leasing.' },
        { lead: 'Valuation & Research.', text: 'Organise evidence, comparable information and working records around professional workflows.' },
      ],
      howIntro: 'A More Connected Property Operation',
      how: [
        { lead: 'Consistent Records.', text: 'Keep property information structured and aligned as details change.' },
        { lead: 'Workflow Automation.', text: 'Automate tasks, reminders and status updates around defined property processes.' },
        { lead: 'Client Portals.', text: 'Give clients appropriate access to documents, updates and service requests.' },
        { lead: 'Operational Visibility.', text: 'Bring pipeline, portfolio and outstanding activity into clearer management view.' },
      ],
      panel: { title: 'Connect the Property Journey.', sub: 'Create continuity across the information, workflows and interactions surrounding every property.' },
    },
    override: {
      why: {
        pill: 'Why us?',
        titleTop: 'Real Estate',
        titleMid: 'Expertise. Built',
        titleMark: 'Into Technology.',
        note: 'Our experience across transactions, valuation and research gives us the context to build technology around how property businesses actually work.',
        cta: { label: 'Get in Touch', href: '/contact/' },
        ...WHY_PHOTO,
      },
      approach: {
        eyebrow: 'Our approach',
        columns: [
          { title: 'Understand the Property Journey', body: 'We examine how information, client interactions and responsibilities move through the business to identify where technology can create better continuity.' },
          { title: 'Shape the Solution', body: 'Data, workflows and user requirements are structured around the property activity, with relevant integrations considered from the outset.' },
          { title: 'Connect & Validate', body: 'The solution is tested against real property scenarios to validate information flow, user access and workflow progression.' },
        ],
      },
      /* The document gives each card a category and a title; no excerpt. */
      insights: {
        title: 'Where Property Meets Technology.',
        lede: 'Explore how digital systems are changing the way property information, transactions and client relationships are managed.',
        all: { label: 'Explore PropTech Insights', href: '/blogs/' },
        cards: [
          { category: 'Property Data', title: 'When One Property Exists Across Too Many Records', href: '/blogs/', image: 'blogs/blog-1.webp', alt: '' },
          { category: 'Brokerage Operations', title: 'What Happens Between an Enquiry and a Transaction?', href: '/blogs/', image: 'blogs/blog-2.webp', alt: '' },
          { category: 'Transaction Management', title: 'Where Property Transactions Lose Momentum', href: '/blogs/', image: 'blogs/blog-3.webp', alt: '' },
          { category: 'Client Experience', title: 'What Should a Property Client Portal Actually Do?', href: '/blogs/', image: 'blogs/blog-4.webp', alt: '' },
        ],
      },
      story: {
        ...STORY_PHOTO,
        alt: 'A consultant reviewing a systems map',
        quote: 'ValuNxt brought a much clearer structure to the way we manage property information and workflows. Our teams now have better visibility across activities, with fewer gaps between processes and a more consistent way of working.',
        pill: 'Built for Continuity',
        title: 'Property Operations. Connected End to End.',
        note: 'Bring data, systems and client activity into one coordinated environment that supports the business from one stage to the next.',
        cta: { label: 'Discuss Your Requirements', href: '/free-consultation/' },
        arrow: { href: '/services/technology-data-ai/', label: 'More about Technology, Data & AI' },
      },
      band: {
        ...BAND_PHOTO,
        title: 'Valunxt PropTech Intelligence',
        body: 'Property Technology With Context. Real estate expertise and technology thinking brought together to create digital environments designed around how property work actually happens.',
        cta: { label: 'Discover What’s Next', href: '/services/technology-data-ai/' },
      },
      vision: {
        steps: [
          { title: 'Our Focus', body: 'Connect the property journey. Bring information, activity and interactions together as properties move across transactions, management, valuation and research.' },
          { title: 'Our Approach', body: 'Build around real estate workflows. Shape technology around the people, processes and professional requirements behind property operations.' },
          { title: 'Our Experience', body: 'Property knowledge behind the technology. Draw on wider expertise across transactions, valuation and research to give technology the context real estate demands.' },
        ],
        pill: 'Our Vision',
        quote: 'To make property information and expertise work together throughout the real estate lifecycle.',
      },
      /* The strip's heading in the document has no visible slot. */
      strip: stripOf('technology-data-ai', ['Real Estate CRM', 'Property Data Systems', 'Transaction Workflows', 'Valuation Tools', 'Research Platforms', 'Client Portals']),
      talk: {
        head: 'Build the Future of Your Property Business.',
        lede: 'Speak with our PropTech team about the digital capabilities your organisation needs for what comes next.',
        cta: { label: 'Get in Touch', href: '/contact/' },
        image: TECHNOLOGY_TEMPLATE.close.image,
      },
    },
  },
  {
    slug: 'enterprise-solutions',
    title: 'Enterprise Solutions',
    lede: 'Technology built around complex business requirements, connecting applications, processes and teams across the organisation.',
    brief: {
      lede: [
        'As organisations grow, processes often extend across departments, systems and approval layers. Individual platforms may perform their own functions well, while the work between them still depends on manual coordination, disconnected information and processes that existing software was never designed to handle.',
        'ValuNxt develops enterprise solutions around these operational realities. We design applications, workflows, portals and integrations that bring structure to complex requirements, helping organisations create technology environments that work more effectively across functions.',
      ],
      whatIntro: 'Solutions Around Your Business',
      what: [
        { lead: 'Custom Applications.', text: 'Build applications around specific processes, business rules and requirements beyond standard software.' },
        { lead: 'Workflow & Approval Systems.', text: 'Structure requests, reviews, approvals and escalations across defined responsibilities.' },
        { lead: 'System Integrations.', text: 'Connect applications so information can move reliably between different business systems.' },
        { lead: 'Business Portals.', text: 'Create dedicated digital environments for employees, customers and business partners.' },
      ],
      howIntro: 'Built for Enterprise Requirements',
      how: [
        { lead: 'Roles & Permissions.', text: 'Define access and responsibilities across different functions, processes and user groups.' },
        { lead: 'Process Traceability.', text: 'Maintain visibility across activities, approvals, decisions and status changes.' },
        { lead: 'Scalable Architecture.', text: 'Design around evolving users, transaction volumes and future business requirements.' },
        { lead: 'Long-Term Usability.', text: 'Build systems that can be maintained and adapted as organisational needs develop.' },
      ],
      panel: { title: 'Technology That Fits the Enterprise.', sub: 'Shape applications and systems around the way your organisation needs to operate.' },
    },
    override: {
      why: {
        pill: 'Why us?',
        titleTop: 'Complexity',
        titleMid: 'Understood.',
        titleMark: 'Technology Considered.',
        note: 'We look beyond the software requirement to understand the processes, dependencies and responsibilities the solution needs to support.',
        cta: { label: 'Get in Touch', href: '/contact/' },
        ...WHY_PHOTO,
      },
      approach: {
        eyebrow: 'Our approach',
        columns: [
          { title: 'Understand the Requirement', body: 'We examine processes, users, business rules and system dependencies to define what the solution needs to accomplish.' },
          { title: 'Design the Environment', body: 'Applications, workflows and integrations are structured around the operating requirements and connections involved.' },
          { title: 'Develop & Validate', body: 'Solutions are developed in planned stages and tested against representative workflows, permissions and system interactions before rollout.' },
        ],
      },
      /* The document gives each card a category and a title; no excerpt. */
      insights: {
        title: 'Where Business Meets Technology.',
        lede: 'Explore the decisions behind custom applications, connected systems and technology designed around complex organisational requirements.',
        all: { label: 'Explore Enterprise Insights', href: '/blogs/' },
        cards: [
          { category: 'Custom Applications', title: 'When Standard Software No Longer Fits the Business', href: '/blogs/', image: 'blogs/blog-1.webp', alt: '' },
          { category: 'Workflow Design', title: 'The Exceptions That Define a Business Process', href: '/blogs/', image: 'blogs/blog-2.webp', alt: '' },
          { category: 'System Integration', title: 'What Happens Between Two Connected Systems?', href: '/blogs/', image: 'blogs/blog-3.webp', alt: '' },
          { category: 'User Experience', title: 'Why Enterprise Software Must Work for the People Using It', href: '/blogs/', image: 'blogs/blog-4.webp', alt: '' },
        ],
      },
      story: {
        ...STORY_PHOTO,
        alt: 'A consultant reviewing a systems map',
        quote: 'ValuNxt took the time to understand how work actually moved across our organisation before defining the solution. The result gave our teams a more structured way to manage responsibilities across functions without adding unnecessary complexity.',
        role: 'Enterprise Solutions Client',
        pill: 'Built for Complexity',
        title: 'Across Functions. One Operating Environment.',
        note: 'Bring processes, responsibilities and system interactions together around the way work moves across your organisation.',
        cta: { label: 'Discuss Your Requirements', href: '/free-consultation/' },
        arrow: { href: '/services/technology-data-ai/', label: 'More about Technology, Data & AI' },
      },
      band: {
        ...BAND_PHOTO,
        title: 'Valunxt Enterprise Intelligence',
        body: 'Technology With Organisational Context. Enterprise technology works best when the systems reflect the processes, responsibilities and relationships behind the organisation.',
        cta: { label: 'Discover What’s Next', href: '/services/technology-data-ai/' },
      },
      vision: {
        steps: [
          { title: 'Process Design', body: 'Structure how work moves. Translate business rules, responsibilities and exceptions into processes that technology can support consistently.' },
          { title: 'System Coordination', body: 'Make the connections work. Design integrations around how information needs to move between applications, including validation and exceptions.' },
          { title: 'Long-Term Control', body: 'Build beyond implementation. Consider maintainability, documentation and evolving requirements so the organisation retains control as the environment develops.' },
        ],
        pill: 'Our Vision',
        quote: 'To help organisations manage complexity through technology without passing that complexity on to their people.',
      },
      /* The strip's heading in the document has no visible slot. */
      strip: stripOf('technology-data-ai', ['Custom Applications', 'Approval Workflows', 'System Integrations', 'Employee Portals', 'Customer & Partner Portals', 'Multi-Department Platforms']),
      talk: {
        head: 'Build What Your Business Needs Next.',
        lede: 'Speak with our team about the applications, workflows and system connections your organisation needs to move forward.',
        cta: { label: 'Get in Touch', href: '/contact/' },
        image: TECHNOLOGY_TEMPLATE.close.image,
      },
    },
  },
];

export const TECHNOLOGY_SUBS = buildSubs(PARENT, SPECS);
