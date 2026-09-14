/**
 * The eight pages under /en-ae/services/accounting-tax-services/.
 *
 * ALL EIGHT PAGES ARE THE CLIENT'S page documents (20260914), word for word,
 * under the same two rules as the rest of the UAE pages: nothing added to the
 * documents or dropped from them, and no em dashes. The documents are written
 * to this template's own sections, so each page carries its practice-level
 * sections in `override`. The names and slugs are the registry's
 * (vxnServices('en-ae')).
 *
 * TWO SECTIONS THE DOCUMENTS DO NOT WRITE. There is no success story in any of
 * the eight, and the insights section is given a heading and a paragraph but
 * no cards. Both keep what the Accounting & Bookkeeping page carried before
 * the documents arrived, read from ./bookkeeping/content.ts: the placeholder
 * story (still a placeholder, see ../template/subTypes.ts) and the four
 * article cards. Nothing new was written for either.
 *
 * See ../template/subTypes.ts for the shape and the length rules.
 */
import { buildSubs, type SubParent, type SubSpec } from '../template/subTypes';
import { SHARED_VISION, stripOf } from '../template/subShared';
import {
  ABK_APPROACH,
  ABK_BAND,
  ABK_BRIEF,
  ABK_CASE,
  ABK_HERO,
  ABK_INSIGHTS,
  ABK_STRIP,
  ABK_TALK,
  ABK_WHY,
} from './bookkeeping/content';

const PARENT: SubParent = {
  service: 'accounting-tax-services',
  crumb: 'Accounting & Tax',
  hero: { image: ['services/accounting-tax-hero.webp', ABK_HERO.image], alt: ABK_HERO.alt },
  panel: { mark: ABK_BRIEF.panel.mark, image: ABK_BRIEF.panel.image, alt: ABK_BRIEF.panel.alt },
  why: ABK_WHY,
  approach: ABK_APPROACH,
  insights: ABK_INSIGHTS,
  story: ABK_CASE,
  band: ABK_BAND,
  vision: SHARED_VISION,
  strip: ABK_STRIP,
  talk: ABK_TALK,
};

const SPECS: SubSpec[] = [
  /* Where a comma stands in place of a dash the document carried, it is in:
     the Budgeting vision line; the Bookkeeping positioning paragraph and
     panel line; the Corporate Tax closing paragraph; the Part-Time CFO
     positioning paragraph and its Profitability point; the VAT vision line;
     the Audit Support hero, panel line and vision line. */
  {
    slug: 'budgeting-forecasting',
    title: 'Budgeting & Forecasting',
    lede: 'Growth decisions are easier to evaluate when management can see their likely financial impact before committing. Valunxt builds budgets, rolling forecasts, cash-flow views and scenarios for UAE businesses that need a practical forward view of revenue, cost, margin, working capital and funding requirements.',
    brief: {
      lede: 'A useful forecast is not a prediction dressed up as certainty. It is a management model built around clear assumptions, current actuals and the business drivers that matter. We structure the process so management can see what changed, why the outlook moved and which assumptions deserve attention.',
      whatIntro: 'The service builds a forward financial view management can use when planning, allocating resources and reviewing performance.',
      what: [
        { lead: 'Annual Budgets.', text: 'Build revenue, cost, headcount and cash assumptions into a structured budget that reflects how the business actually operates.' },
        { lead: 'Rolling Forecasts.', text: 'Update the financial outlook as actual results emerge, allowing management to revise expectations rather than rely on an outdated annual plan.' },
        { lead: 'Cash-Flow Forecasting.', text: 'Model expected collections, payments, payroll, tax obligations and planned expenditure to identify periods where liquidity may require closer management.' },
        { lead: 'Scenario Analysis.', text: 'Test the financial effect of hiring, pricing changes, expansion, new facilities, funding decisions or changes in revenue and margin assumptions.' },
      ],
      howIntro: 'A forecast becomes useful when assumptions are visible, ownership is clear and actual performance continuously feeds back into the model.',
      how: [
        { lead: 'Define the Drivers.', text: 'Identify the operational assumptions behind revenue, margin, headcount, working capital and major costs before building the financial model.' },
        { lead: 'Connect Actuals.', text: 'Compare reported performance against the plan so material variances can be understood and incorporated into the next forecast.' },
        { lead: 'Review With Management.', text: 'Challenge assumptions with the people responsible for sales, operations and spending rather than allowing Finance to plan in isolation.' },
        { lead: 'Maintain Version Discipline.', text: 'Keep each approved budget and forecast identifiable so management can see how expectations changed and what drove the revision.' },
      ],
      panel: { title: 'Forward View', sub: 'Budgets, forecasts and scenarios designed to show where the business may be heading before management commits capital or resources.' },
    },
    override: {
      why: {
        pill: 'Why Valunxt?',
        titleTop: 'Connect the',
        titleMid: 'Forecast to',
        titleMark: 'the Business',
        note: 'Valunxt brings accounting actuals, operating assumptions and management expectations into the same planning process so forecasts remain connected to how the business is performing.',
        cta: { label: 'Discuss Your Plans', href: '/free-consultation/' },
        image: ABK_WHY.image,
        alt: ABK_WHY.alt,
      },
      approach: {
        eyebrow: 'Our approach',
        columns: [
          { title: 'Driver-Led Planning', body: 'A strong model starts with the economics of the business. Revenue volumes, pricing, margins, headcount, collection periods and operating costs are identified explicitly, allowing management to see which assumptions matter most and what happens when they change.' },
          { title: 'Actuals Inform Forecasts', body: 'Planning should not operate separately from accounting. As actual results become available, they are compared with the budget, material differences are investigated and the remaining forecast is updated where management’s expectations have genuinely changed.' },
          { title: 'Scenarios Before Decisions', body: 'Major decisions rarely have only one possible outcome. We model realistic alternatives around management’s key choices so the discussion can move beyond “Can we afford it?” to understanding the cash, profitability and timing implications under different assumptions.' },
        ],
      },
      /* The document gives this section a heading and a paragraph only; the
         four cards stay the bookkeeping page's. */
      insights: {
        ...ABK_INSIGHTS,
        title: 'Planning Beyond Last Month',
        lede: 'Forecasting becomes more valuable as decisions become larger and less reversible. Explore practical thinking on cash planning, scenario modelling, budgets and the relationship between historical reporting and forward management decisions.',
      },
      band: {
        image: ABK_BAND.image,
        alt: ABK_BAND.alt,
        title: 'Valunxt Finance Intelligence',
        body: 'Forward planning becomes more credible when it begins with reliable historical information. Budgeting and forecasting sit between reporting and decision-making: actual results establish the base, assumptions create the forward view, and management judgement determines what happens next.',
      },
      vision: {
        steps: [
          { title: 'Our Focus', body: 'Make the financial implications of management assumptions visible before resources are committed.' },
          { title: 'Our Approach', body: 'Connect operational drivers, accounting actuals, cash requirements and management expectations within one planning framework.' },
          { title: 'Our Perspective', body: 'Forecasts are most useful when management can see which assumptions carry the greatest financial sensitivity and how changes affect cash, margin and capacity.' },
        ],
        pill: 'Our Vision',
        quote: 'Finance should help management look forward with discipline, not create a false sense of certainty about what the future will bring.',
      },
      /* "Our capabilities: where we add value" heads the strip in the
         document; the row's heading block is hidden. */
      strip: stripOf('accounting-tax-services', ['Annual Budgets', 'Rolling Forecasts', 'Cash-Flow Planning', 'Scenario Analysis', 'Variance Analysis', 'Management Reporting']),
      talk: {
        head: 'Make the Next Decision With a Forward View',
        lede: 'If management is planning hiring, investment, expansion or a change in strategy, build the financial implications into the discussion before the commitment is made.',
        cta: { label: 'Discuss Your Forecast', href: '/free-consultation/' },
        image: ABK_TALK.image,
      },
    },
  },
  {
    slug: 'accounting-bookkeeping',
    title: 'Accounting & Bookkeeping',
    lede: 'Growing businesses need more than transactions entered into software. Valunxt manages accounting and bookkeeping for UAE businesses that need current ledgers, reconciled balances, controlled payables and receivables, and financial records that can support reporting, VAT, Corporate Tax and year-end financial statements.',
    brief: {
      lede: 'Reliable accounting comes from the routine behind the ledger. Transactions need to be classified consistently, control accounts reconciled, supporting documents retained and open items investigated before they flow into reporting or tax. We treat bookkeeping as a recurring Finance process, not a year-end clean-up exercise.',
      whatIntro: 'The service covers the recurring accounting work required to keep the financial record complete, organised and usable.',
      what: [
        { lead: 'General Ledger & Bookkeeping.', text: 'Record and classify revenue, purchases, expenses, journals and other transactions using a chart of accounts aligned to reporting needs.' },
        { lead: 'Bank & Control Reconciliations.', text: 'Reconcile bank, receivables, payables and other key accounts so differences are investigated rather than carried indefinitely.' },
        { lead: 'Accounts Payable & Receivable.', text: 'Maintain supplier and customer balances, track outstanding items and give management clearer visibility over amounts due and owed.' },
        { lead: 'Period-End Accounting.', text: 'Process accruals, prepayments and other agreed closing entries so management reporting and financial statements start from a more complete ledger.' },
      ],
      howIntro: 'The accounting process is organised around repeatable controls rather than depending on one person remembering what needs to happen each month.',
      how: [
        { lead: 'Structured Onboarding.', text: 'Understand the existing ledger, chart of accounts, systems, reporting requirements, documentation flow and unresolved balances before recurring work begins.' },
        { lead: 'Recurring Reconciliation.', text: 'Match accounting balances to banks, schedules and supporting records so differences are surfaced during the period rather than at year-end.' },
        { lead: 'Documented Close Process.', text: 'Use an agreed closing checklist covering entries, reconciliations, review points and outstanding items before financial information is released.' },
        { lead: 'Clear Responsibility.', text: 'Define what remains with the client team and what Valunxt manages, reducing gaps between invoice handling, bookkeeping, approvals and reporting.' },
      ],
      panel: { title: 'Controlled Books', sub: 'Accounting built around reconciliations, supporting records and a recurring close process, not simply transaction entry.' },
    },
    override: {
      why: {
        pill: 'Why Valunxt?',
        titleTop: 'Build More',
        titleMid: 'Than a',
        titleMark: 'Clean Ledger',
        note: 'Valunxt connects bookkeeping with reporting, VAT, Corporate Tax and financial statements so the accounting process supports what the business needs next.',
        cta: { label: 'Discuss Your Accounts', href: '/free-consultation/' },
        image: ABK_WHY.image,
        alt: ABK_WHY.alt,
      },
      approach: {
        eyebrow: 'Our approach',
        columns: [
          { title: 'Reconcile, Don’t Assume', body: 'Balances are not treated as correct simply because they appear in the accounting system. Key accounts are supported by external records or schedules, and unexplained differences are investigated before they become embedded in later reporting.' },
          { title: 'Close With Discipline', body: 'Month-end should be a repeatable Finance routine. Cut-offs, accruals, reconciliations, supporting schedules and review points are organised into a practical close process so management receives information from a ledger that has actually been reviewed.' },
          { title: 'Keep Tax Connected', body: 'Corporate Tax and VAT do not sit outside the accounting system. Transaction coding, documentation and financial records influence the information used for tax compliance, which is why accounting needs to remain connected to the wider Finance process.' },
        ],
      },
      /* The document gives this section a heading and a paragraph only; the
         four cards stay the bookkeeping page's. */
      insights: {
        ...ABK_INSIGHTS,
        title: 'Better Records, Better Decisions',
        lede: 'Explore practical thinking on accounting controls, month-end close, VAT readiness, Corporate Tax and the point at which a growing business needs more than basic bookkeeping.',
      },
      band: {
        image: ABK_BAND.image,
        alt: ABK_BAND.alt,
        title: 'Valunxt Finance Intelligence',
        body: 'Accounting is the financial foundation of the wider Finance function. When the ledger is current, reconciled and supported, management reporting becomes easier to trust, tax positions become easier to trace and year-end financial statements require less reconstruction.',
      },
      vision: {
        steps: [
          { title: 'Our Focus', body: 'Create accounting records management can use as the foundation for reporting, tax and financial decision-making.' },
          { title: 'Our Approach', body: 'Combine transaction processing with reconciliations, supporting schedules, documented responsibilities and a controlled period-close process.' },
          { title: 'Our Perspective', body: 'The quality of accounting is often revealed by what happens when balances do not reconcile, documents are missing or unusual transactions require judgement.' },
        ],
        pill: 'Our Vision',
        quote: 'Move bookkeeping away from pure data entry and towards a disciplined financial process that supports the next level of business growth.',
      },
      /* "Our capabilities: where we add value" heads the strip in the
         document; the row's heading block is hidden. */
      strip: stripOf('accounting-tax-services', ['General Ledger', 'Bank Reconciliation', 'Accounts Payable', 'Accounts Receivable', 'Period-End Close', 'Tax-Ready Records']),
      talk: {
        head: 'Start With the Records Behind the Business',
        lede: 'If management is relying on incomplete books, old reconciliations or multiple spreadsheets to understand the company’s position, the first step is to strengthen the accounting foundation.',
        cta: { label: 'Discuss Your Accounting', href: '/free-consultation/' },
        image: ABK_TALK.image,
      },
    },
  },
  {
    slug: 'corporate-tax-services',
    title: 'Corporate Tax Filing',
    /* The document's breadcrumb keeps the shorter name. */
    crumb: 'Corporate Tax',
    lede: 'Corporate Tax filing starts before the Return is opened in EmaraTax. Valunxt supports UAE businesses with the accounting-to-tax review, computations, adjustments, supporting schedules and filing process needed to turn financial information into a documented Corporate Tax position.',
    brief: {
      lede: 'The Return is the final output. The underlying position is created through accounting results, transactions, elections, reliefs and other tax matters that may need to be considered during the Tax Period. Our approach connects the filing back to the records and reasoning behind it.',
      whatIntro: 'The service takes the business from accounting results to a reviewed Corporate Tax Return and supporting filing file.',
      what: [
        { lead: 'Accounting-to-Tax Computation.', text: 'Start with Accounting Income and identify applicable additions, deductions, exemptions, reliefs or other adjustments required to determine Taxable Income.' },
        { lead: 'Tax Position Review.', text: 'Consider relevant elections, reliefs, Tax Losses and Related Party matters where relevant and within the agreed scope.' },
        { lead: 'Supporting Schedules.', text: 'Prepare working papers showing how material tax figures and adjustments connect back to the financial information and underlying records.' },
        { lead: 'Return & Payment Support.', text: 'Prepare the Corporate Tax Return for review and submission through EmaraTax and identify the related payment requirement within the applicable statutory timeframe.' },
      ],
      howIntro: 'A defensible filing needs more than a final tax number. It needs a clear trail showing how the position was reached.',
      how: [
        { lead: 'Start With the Financials.', text: 'Review the accounting results and supporting records before determining the tax adjustments required under the applicable Corporate Tax rules.' },
        { lead: 'Document Material Positions.', text: 'Record the basis for significant treatments, elections or adjustments so the filing logic is not lost after submission.' },
        { lead: 'Review Before Filing.', text: 'Perform a structured technical and numerical review of the computation, supporting schedules and Return before submission.' },
        { lead: 'Retain the Filing File.', text: 'Organise the Return, computation, financial information and supporting documents so later queries can be addressed from an established record.' },
      ],
      panel: { title: 'Tax From Records', sub: 'Corporate Tax computation and filing connected to the accounting information, adjustments and documentation behind the Return.' },
    },
    override: {
      why: {
        pill: 'Why Valunxt?',
        titleTop: 'Connect Tax',
        titleMid: 'Back to',
        titleMark: 'the Numbers',
        note: 'Valunxt brings accounting, financial reporting and Corporate Tax into one process so material tax positions remain traceable to the financial information behind them.',
        cta: { label: 'Discuss Corporate Tax', href: '/free-consultation/' },
        image: ABK_WHY.image,
        alt: ABK_WHY.alt,
      },
      approach: {
        eyebrow: 'Our approach',
        columns: [
          { title: 'Accounting First', body: 'UAE Corporate Tax is calculated from financial information before applicable tax adjustments are made. We therefore begin with the underlying accounting records rather than treating the Return as an isolated compliance form.' },
          { title: 'Position by Position', body: 'Not every tax issue can be resolved with a generic checklist. Material adjustments, elections, reliefs and Related Party matters within scope are considered against the facts of the business.' },
          { title: 'Filing With a Trail', body: 'Computations, schedules and key supporting records are organised into a filing file so management can see how the reported position was reached and respond more efficiently if questions arise.' },
        ],
      },
      /* The document gives this section a heading and a paragraph only; the
         four cards stay the bookkeeping page's. */
      insights: {
        ...ABK_INSIGHTS,
        title: 'Corporate Tax Beyond Filing Day',
        lede: 'Corporate Tax decisions are made throughout the Tax Period, even though the Return is filed later. Explore current thinking on accounting adjustments, filing readiness, records, reliefs and UAE Corporate Tax developments.',
      },
      band: {
        image: ABK_BAND.image,
        alt: ABK_BAND.alt,
        title: 'Valunxt Finance Intelligence',
        body: 'Corporate Tax becomes easier to manage when the business does not wait until filing time to understand its tax position. Accounting, financial statements and tax analysis need to connect so adjustments can be reviewed with the records that created them.',
      },
      vision: {
        steps: [
          { title: 'Our Focus', body: 'Make the relationship between Accounting Income, tax adjustments, supporting records and the final Return clear.' },
          { title: 'Our Approach', body: 'Review the financial information first, identify relevant tax matters, document significant positions and maintain a filing trail.' },
          { title: 'Our Perspective', body: 'The strongest Corporate Tax process identifies which accounting movements require tax analysis before they become last-minute filing questions.' },
        ],
        pill: 'Our Vision',
        quote: 'Move Corporate Tax away from last-minute form completion and towards a documented Finance process management can understand throughout the year.',
      },
      /* "Our capabilities: where we add value" heads the strip in the
         document; the row's heading block is hidden. */
      strip: stripOf('accounting-tax-services', ['Tax Computation', 'Tax Adjustments', 'Return Preparation', 'Tax Loss Review', 'Reliefs & Elections', 'Filing Documentation']),
      talk: {
        head: 'Start With the Numbers Behind Your Tax Return',
        lede: 'If the Corporate Tax deadline is approaching, begin by understanding whether the financial records, adjustments and supporting schedules are ready, not simply whether the EmaraTax form has been opened.',
        cta: { label: 'Discuss Your Tax Position', href: '/free-consultation/' },
        image: ABK_TALK.image,
      },
    },
  },
  {
    slug: 'cfo-services',
    title: 'Part-Time CFO',
    lede: 'There is a point where better bookkeeping is no longer enough. Valunxt provides part-time CFO support for growing UAE businesses that need senior financial judgement around cash, profitability, funding, planning and management decisions without immediately building a full-time CFO function.',
    brief: {
      lede: 'CFO support should not be a monthly presentation of numbers management already knows. It should bring Finance into the decisions that shape the business, challenging assumptions, explaining financial consequences, improving visibility and helping management decide where attention and capital should go next.',
      whatIntro: 'The service adds senior Finance capability where management decisions require more interpretation, challenge and forward planning.',
      what: [
        { lead: 'Cash & Working Capital.', text: 'Review cash requirements, collections, supplier commitments and short-term liquidity so management can see where operational decisions affect available cash.' },
        { lead: 'Profitability & Performance.', text: 'Analyse margins, cost drivers, customer or segment performance and management KPIs to identify where growth is creating, or consuming, economic value.' },
        { lead: 'Planning & Scenarios.', text: 'Bring budgets, forecasts and financial scenarios into decisions involving hiring, pricing, expansion, investment or changes in operating strategy.' },
        { lead: 'Funding Readiness & Stakeholder Reporting.', text: 'Support discussions with owners, boards, lenders or investors through structured information, assumptions and management-ready financial analysis.' },
      ],
      howIntro: 'Part-time CFO support works best when senior input becomes part of management’s regular decision rhythm rather than an occasional intervention.',
      how: [
        { lead: 'Set the Decision Agenda.', text: 'Agree the financial questions that matter most to management rather than starting with a generic CFO reporting template.' },
        { lead: 'Work From the Same Numbers.', text: 'Use accounting and management information that can be traced back to the financial records, avoiding a second disconnected version of performance.' },
        { lead: 'Create a Review Cadence.', text: 'Establish recurring Finance discussions around cash, performance, forecast changes and decisions requiring management attention.' },
        { lead: 'Document Key Assumptions.', text: 'Record the financial reasoning behind important recommendations so management understands what must remain true for the decision to work.' },
      ],
      panel: { title: 'Finance Leadership', sub: 'Senior financial judgement brought into cash, performance, planning and management decisions as the business becomes more complex.' },
    },
    override: {
      why: {
        pill: 'Why Valunxt?',
        titleTop: 'Bring the Whole',
        titleMid: 'Finance Picture',
        titleMark: 'Together',
        note: 'Valunxt can connect accounting, management reporting and forecasting with CFO-level analysis, reducing the gap between what Finance reports and what management needs to decide.',
        cta: { label: 'Speak With Finance', href: '/free-consultation/' },
        image: ABK_WHY.image,
        alt: ABK_WHY.alt,
      },
      approach: {
        eyebrow: 'Our approach',
        columns: [
          { title: 'Decision-Led Finance', body: 'The CFO agenda begins with management’s actual decisions: cash pressure, margin, expansion, funding, pricing or investment. Reporting and analysis are then structured around those questions.' },
          { title: 'Connected to Accounting', body: 'Senior advice is only as useful as the information underneath it. CFO work connects back to accounting, reporting and forecasts so recommendations are based on financial information management can trace and challenge.' },
          { title: 'Capability That Can Scale', body: 'A business may not require a full-time CFO today, but it may still need CFO-level thinking. The scope can focus on areas where senior judgement adds value while internal Finance continues to own day-to-day execution.' },
        ],
      },
      /* The document gives this section a heading and a paragraph only; the
         four cards stay the bookkeeping page's. */
      insights: {
        ...ABK_INSIGHTS,
        title: 'Finance at Management Level',
        lede: 'Explore thinking on cash, profitability, financial leadership, funding readiness and the point where a growing business needs senior Finance capability beyond routine accounting.',
      },
      band: {
        image: ABK_BAND.image,
        alt: ABK_BAND.alt,
        title: 'Valunxt Finance Intelligence',
        body: 'Finance leadership sits above the accounting process but cannot be disconnected from it. Reliable records create the base, management reporting explains performance, forecasting shows the forward view and CFO judgement brings those elements into management decisions.',
      },
      vision: {
        steps: [
          { title: 'Our Focus', body: 'Help management understand the financial consequence of the decisions already on the table.' },
          { title: 'Our Approach', body: 'Bring accounting, reporting, cash, forecasting and management judgement into one recurring Finance conversation.' },
          { title: 'Our Perspective', body: 'Senior Finance adds most value when it identifies which numbers matter to the decision, which assumptions are weak and which risks deserve management attention.' },
        ],
        pill: 'Our Vision',
        quote: 'Give growing businesses access to deeper Finance capability at the stage they need it, without assuming every company requires the same Finance structure.',
      },
      /* "Our capabilities: where we add value" heads the strip in the
         document; the row's heading block is hidden. */
      strip: stripOf('accounting-tax-services', ['Cash Strategy', 'Profitability Review', 'Board Reporting', 'Funding Readiness', 'Financial Planning', 'Finance Oversight']),
      talk: {
        head: 'Bring Finance Into the Next Big Decision',
        lede: 'If the business has reliable accounting but management still lacks the financial perspective needed for growth, funding or major commitments, it may be time to add senior Finance capability.',
        cta: { label: 'Discuss CFO Support', href: '/free-consultation/' },
        image: ABK_TALK.image,
      },
    },
  },
  {
    slug: 'financial-reporting',
    title: 'Financial Statements',
    lede: 'Financial statements should explain the financial position of the business without requiring management to rebuild the year first. Valunxt prepares and reviews financial statements for UAE businesses using reconciled accounting records, supporting schedules and the reporting framework applicable to the engagement.',
    brief: {
      lede: 'Year-end reporting is strongest when the statements are the output of reliable accounting rather than a separate reconstruction exercise. We connect the trial balance, accounting treatments, supporting schedules and disclosures so material figures can be traced back to the records behind them.',
      whatIntro: 'The service turns closed accounting records into structured financial statements supported by the underlying accounting analysis.',
      what: [
        { lead: 'Statement Preparation.', text: 'Prepare the primary financial statements and related notes required by the agreed reporting framework and purpose of the engagement.' },
        { lead: 'Accounting Treatment Review.', text: 'Consider material accounting treatments, estimates and classifications that affect how transactions and balances appear in the statements.' },
        { lead: 'Supporting Schedules.', text: 'Build or review schedules supporting significant balance-sheet and income-statement figures so material balances can be reconciled to the ledger.' },
        { lead: 'Consolidation Support.', text: 'Where applicable, support group reporting through intercompany reconciliation, consolidation adjustments and consistent presentation across entities within scope.' },
      ],
      howIntro: 'The preparation process begins with the trial balance and ends only when the statements, schedules and accounting records agree.',
      how: [
        { lead: 'Start With Reconciled Records.', text: 'Identify unresolved or unsupported balances before drafting rather than allowing them to become financial statement presentation problems.' },
        { lead: 'Apply the Relevant Framework.', text: 'Consider IFRS, IFRS for SMEs or another applicable reporting basis where appropriate to the entity and agreed engagement.' },
        { lead: 'Review Material Areas.', text: 'Focus review effort on balances, estimates, disclosures and transactions that require judgement or have a significant effect on the statements.' },
        { lead: 'Maintain the Working File.', text: 'Keep financial statement workings, reconciliations and supporting schedules organised for management, audit or other stakeholder review.' },
      ],
      panel: { title: 'Statements From Records', sub: 'Financial statements prepared from reconciled accounting information, with material balances supported by schedules and review.' },
    },
    override: {
      why: {
        pill: 'Why Valunxt?',
        titleTop: 'Connect Year-End',
        titleMid: 'Reporting to',
        titleMark: 'Accounting',
        note: 'Valunxt can link recurring accounting, financial statement preparation and audit support so year-end reporting begins with the records already maintained during the year.',
        cta: { label: 'Discuss Your Reporting', href: '/free-consultation/' },
        image: ABK_WHY.image,
        alt: ABK_WHY.alt,
      },
      approach: {
        eyebrow: 'Our approach',
        columns: [
          { title: 'Ledger to Statements', body: 'The statements should remain connected to the accounting records from which they were prepared. We use the trial balance and supporting schedules as the starting point so changes remain visible and traceable.' },
          { title: 'Judgement Where It Matters', body: 'Material estimates, unusual transactions, accounting policies and disclosure areas are identified for closer review rather than applying the same mechanical process to every balance.' },
          { title: 'Built for Review', body: 'Financial statements may be read by management, shareholders, lenders, tax advisers or external auditors. The preparation file is structured so material amounts can be supported without reconstructing the financial year again.' },
        ],
      },
      /* The document gives this section a heading and a paragraph only; the
         four cards stay the bookkeeping page's. */
      insights: {
        ...ABK_INSIGHTS,
        title: 'Better Financial Reporting',
        lede: 'Explore practical thinking on financial statement preparation, closing adjustments, supporting schedules, IFRS developments and the accounting work that should happen before year-end reporting begins.',
      },
      band: {
        image: ABK_BAND.image,
        alt: ABK_BAND.alt,
        title: 'Valunxt Finance Intelligence',
        body: 'Financial statements connect recurring accounting work with information used by management, lenders, tax advisers and external auditors. The stronger that connection, the easier it becomes to explain how the reported financial position was produced.',
      },
      vision: {
        steps: [
          { title: 'Our Focus', body: 'Produce financial statements that remain traceable to reconciled accounting records and supporting schedules.' },
          { title: 'Our Approach', body: 'Work from the trial balance, identify material accounting questions, prepare the statements and retain a clear working file.' },
          { title: 'Our Perspective', body: 'Financial reporting requires the most judgement where estimates, unusual transactions, consolidation or disclosure requirements make the ledger balance insufficient on its own.' },
        ],
        pill: 'Our Vision',
        quote: 'Make financial statements a controlled output of the Finance process rather than an annual exercise in rebuilding information management already had.',
      },
      /* "Our capabilities: where we add value" heads the strip in the
         document; the row's heading block is hidden. */
      strip: stripOf('accounting-tax-services', ['Financial Statements', 'Closing Adjustments', 'Supporting Schedules', 'Accounting Review', 'Consolidation Support', 'Audit Preparation']),
      talk: {
        head: 'Prepare the Financials From the Records Up',
        lede: 'If year-end reporting currently begins with unresolved balances, missing schedules or disconnected spreadsheets, strengthen the preparation process before the statements reach management or the auditor.',
        cta: { label: 'Discuss Financial Statements', href: '/free-consultation/' },
        image: ABK_TALK.image,
      },
    },
  },
  {
    slug: 'vat-services',
    title: 'VAT Advisory',
    lede: 'VAT outcomes are created by transactions long before the Return is filed. Valunxt supports UAE businesses with VAT review, reconciliation, Return preparation and transaction-level advisory so the figures reported to the FTA remain connected to invoices, accounting records and the commercial activity behind them.',
    brief: {
      lede: 'VAT should be managed as part of the accounting process, not assembled near the filing deadline. Sales treatment, Input Tax recovery, credit notes, imports and supporting evidence all affect the Return. Our approach brings those issues into the Finance process before they become filing-day questions.',
      whatIntro: 'The service connects VAT reporting with the transactions, records and evidence that create the VAT position.',
      what: [
        { lead: 'VAT Return Preparation.', text: 'Prepare the Return from relevant accounting information and VAT records, subject to review before submission through EmaraTax.' },
        { lead: 'Input VAT Review.', text: 'Review material Input Tax claims against applicable recovery rules, Tax Invoice requirements and supporting transaction evidence.' },
        { lead: 'Output VAT Review.', text: 'Review sales treatment, credit notes and relevant adjustments so reported Output VAT can be traced to the underlying transactions.' },
        { lead: 'VAT Advisory.', text: 'Support transaction-specific questions involving imports, reverse charge, zero-rating, exemptions or other VAT matters where technical review is required.' },
      ],
      howIntro: 'Strong VAT compliance requires consistent treatment during the Tax Period and reconciliation before the Return is submitted.',
      how: [
        { lead: 'Reconcile to Accounting.', text: 'Compare Input VAT, Output VAT and relevant control accounts with underlying sales, purchase and transaction records.' },
        { lead: 'Review Supporting Evidence.', text: 'Check whether material positions are supported by the documents and information required for the treatment being applied.' },
        { lead: 'Investigate Exceptions.', text: 'Review unusual movements, manual adjustments, material credit notes or transactions that do not follow the normal VAT pattern of the business.' },
        { lead: 'Build Controls Upstream.', text: 'From 1 October 2026, incorporate applicable supplier and supply verification requirements into procurement, AP and Input VAT processes where FTA Decision No. 13 of 2026 applies.' },
      ],
      panel: { title: 'VAT From Transactions', sub: 'VAT reporting connected to invoices, accounting records, reconciliations and the evidence supporting the treatment applied.' },
    },
    override: {
      why: {
        pill: 'Why Valunxt?',
        titleTop: 'Connect VAT to',
        titleMid: 'the Accounting',
        titleMark: 'Behind It',
        note: 'Valunxt combines VAT review with accounting and reconciliation capability, helping businesses address transaction issues before they become Return-preparation problems.',
        cta: { label: 'Discuss Your VAT', href: '/free-consultation/' },
        image: ABK_WHY.image,
        alt: ABK_WHY.alt,
      },
      approach: {
        eyebrow: 'Our approach',
        columns: [
          { title: 'Transaction First', body: 'A VAT Return is only the summary. The underlying questions sit in individual supplies, purchases, invoices and adjustments. We review the transaction-level information behind material VAT positions.' },
          { title: 'Reconcile Before Filing', body: 'The VAT position should make sense against the accounting records. Input VAT, Output VAT and material adjustments are reconciled and investigated before the Return reaches final review.' },
          { title: 'Evidence Matters', body: 'VAT treatment and VAT recovery depend on more than accounting codes. Supporting documents, transaction evidence and current FTA requirements are considered so the financial record and compliance position remain connected.' },
        ],
      },
      /* The document gives this section a heading and a paragraph only; the
         four cards stay the bookkeeping page's. */
      insights: {
        ...ABK_INSIGHTS,
        title: 'VAT Starts Before the Return',
        lede: 'Explore current VAT thinking on Input Tax, supplier verification, transaction evidence, reconciliations and the Finance controls businesses should build before each filing cycle.',
      },
      band: {
        image: ABK_BAND.image,
        alt: ABK_BAND.alt,
        title: 'Valunxt Finance Intelligence',
        body: 'VAT sits inside the transaction and accounting cycle. Bringing VAT review closer to invoice creation, supplier documentation, ledger coding and reconciliation reduces the need to reconstruct the commercial story when the Return is prepared.',
      },
      vision: {
        steps: [
          { title: 'Our Focus', body: 'Connect the VAT position to the transactions and records that support it.' },
          { title: 'Our Approach', body: 'Review VAT through accounting, reconciliation, documentation and technical analysis rather than treating filing as an isolated task.' },
          { title: 'Our Perspective', body: 'VAT questions deserve closer attention when transactions fall outside normal patterns, recovery is uncertain or supporting evidence does not clearly match the accounting entry.' },
        ],
        pill: 'Our Vision',
        quote: 'Make VAT a recurring Finance control that management can understand and support, not a compliance exercise that appears only near the deadline.',
      },
      /* "Our capabilities: where we add value" heads the strip in the
         document; the row's heading block is hidden. */
      strip: stripOf('accounting-tax-services', ['VAT Returns', 'Input VAT Review', 'Output VAT Review', 'VAT Reconciliation', 'Transaction Advisory', 'Supplier Verification']),
      talk: {
        head: 'Strengthen the Process Behind Your VAT Return',
        lede: 'If VAT questions are only being raised when the Return is due, move the review upstream into transactions, accounting and documentation before the next filing cycle closes.',
        cta: { label: 'Discuss VAT Compliance', href: '/free-consultation/' },
        image: ABK_TALK.image,
      },
    },
  },
  {
    slug: 'management-reporting',
    title: 'Management Reporting',
    lede: 'Management can have accurate accounts and still lack the information needed to act. Valunxt turns closed accounting records into recurring management reports that explain performance, cash, working capital, profitability and material variances for the people responsible for running the business.',
    brief: {
      lede: 'A useful management pack does more than restate the P&L. It should show what changed, why it changed and where management attention is required. We connect financial results with KPIs, comparatives and commentary so the report supports decisions while those decisions are still open.',
      whatIntro: 'The service turns accounting data into a structured view of the financial and operating questions management needs to monitor.',
      what: [
        { lead: 'Management Pack.', text: 'Present profit and loss, balance sheet, cash and other agreed financial information in a consistent recurring format.' },
        { lead: 'KPI Reporting.', text: 'Track financial and operating indicators management uses to understand revenue quality, margin, working capital and business performance.' },
        { lead: 'Variance Analysis.', text: 'Compare actual performance with budget, forecast or prior periods and identify movements that require explanation.' },
        { lead: 'Segment & Profitability Views.', text: 'Analyse results by entity, project, location, product or another reporting dimension where the accounting structure supports it.' },
      ],
      howIntro: 'Management reporting becomes useful when the pack reconciles to the books, arrives consistently and explains rather than merely displays.',
      how: [
        { lead: 'Agree the Questions First.', text: 'Define what management needs to know before deciding which KPIs, tables and charts belong in the report.' },
        { lead: 'Build From the Ledger.', text: 'Use closed accounting information as the base so the management pack remains connected to the financial records.' },
        { lead: 'Explain Material Movement.', text: 'Add commentary around significant changes in revenue, margin, costs, cash, receivables or other agreed performance measures.' },
        { lead: 'Keep the Format Consistent.', text: 'Maintain recurring definitions and comparatives so management can identify genuine trends rather than relearn the report every month.' },
      ],
      panel: { title: 'Decision Reporting', sub: 'Management information that reconciles to the books and explains the movements requiring management attention.' },
    },
    override: {
      why: {
        pill: 'Why Valunxt?',
        titleTop: 'Reporting',
        titleMid: 'Connected to',
        titleMark: 'What Comes Next',
        note: 'Valunxt can connect management reporting with accounting, forecasting and CFO support, allowing the same financial information to move from explanation into planning and decision-making.',
        cta: { label: 'Discuss Your Reporting', href: '/free-consultation/' },
        image: ABK_WHY.image,
        alt: ABK_WHY.alt,
      },
      approach: {
        eyebrow: 'Our approach',
        columns: [
          { title: 'Start With Decisions', body: 'Reporting design begins with the decisions management needs to make. The pack focuses on measures that influence action rather than displaying every available number.' },
          { title: 'Reconcile to the Ledger', body: 'Management reporting should not become a parallel financial system. The pack starts from closed accounting data so management and Finance discuss the same underlying financial position.' },
          { title: 'Explain the Movement', body: 'A variance without an explanation is only a different number. Material changes are investigated so management can distinguish timing effects, operating issues and genuine changes in performance.' },
        ],
      },
      /* The document gives this section a heading and a paragraph only; the
         four cards stay the bookkeeping page's. */
      insights: {
        ...ABK_INSIGHTS,
        title: 'From Numbers to Management Decisions',
        lede: 'Explore practical thinking on management packs, KPIs, profitability, cash visibility and why growing businesses eventually outgrow reporting built mainly around spreadsheets and historical totals.',
      },
      band: {
        image: ABK_BAND.image,
        alt: ABK_BAND.alt,
        title: 'Valunxt Finance Intelligence',
        body: 'Management reporting sits between accounting and decision-making. The ledger records what happened; management information organises that data around performance, cash, profitability and the questions leadership needs to answer next.',
      },
      vision: {
        steps: [
          { title: 'Our Focus', body: 'Give management financial information that is timely enough and specific enough to influence a decision.' },
          { title: 'Our Approach', body: 'Start with the management question, build from reconciled accounting data and explain material changes rather than simply presenting them.' },
          { title: 'Our Perspective', body: 'Useful reporting depends on materiality: knowing which movements matter, which KPIs genuinely explain performance and where further analysis will change the management conversation.' },
        ],
        pill: 'Our Vision',
        quote: 'Make management reporting a recurring decision process rather than a monthly exercise in distributing financial statements.',
      },
      /* "Our capabilities: where we add value" heads the strip in the
         document; the row's heading block is hidden. */
      strip: stripOf('accounting-tax-services', ['Management Packs', 'KPI Reporting', 'Variance Analysis', 'Cash Visibility', 'Profitability Analysis', 'Segment Reporting']),
      talk: {
        head: 'Make the Numbers Useful Before the Decision Passes',
        lede: 'If management receives financial information but still needs separate spreadsheets or explanations to understand performance, redesign the reporting around the decisions the business actually makes.',
        cta: { label: 'Improve Your Reporting', href: '/free-consultation/' },
        image: ABK_TALK.image,
      },
    },
  },
  {
    slug: 'external-audit-support',
    title: 'External Audit Support',
    lede: 'External audit becomes disruptive when Finance starts preparing only after the auditor’s request list arrives. Valunxt works on the company’s side of the process, organising reconciliations, schedules, supporting evidence and query tracking so management enters fieldwork with a stronger financial file.',
    brief: {
      lede: 'Audit support is different from performing the statutory audit. The external auditor remains independent and responsible for the audit opinion. Valunxt helps the client prepare the accounting records and evidence the auditor will examine, coordinate requests and address accounting points that arise during the process.',
      whatIntro: 'The service prepares the company side of the external audit before and during the auditor’s fieldwork.',
      what: [
        { lead: 'Audit Request File.', text: 'Organise schedules, reconciliations, confirmations, agreements and other supporting documents against the auditor’s information request.' },
        { lead: 'Balance-Sheet Support.', text: 'Review material control accounts and supporting schedules so differences can be investigated before the external auditor raises them.' },
        { lead: 'Query Coordination.', text: 'Track auditor requests, identify the responsible person and maintain visibility over open questions, documents and accounting points.' },
        { lead: 'Adjustment Support.', text: 'Help Finance understand and process agreed accounting adjustments arising during audit, while management remains responsible for the company’s financial records.' },
      ],
      howIntro: 'The objective is to identify missing support and unresolved accounting issues before they become fieldwork delays.',
      how: [
        { lead: 'Readiness Review.', text: 'Compare the available accounting file with expected audit requirements and identify gaps in reconciliations, schedules or supporting evidence.' },
        { lead: 'Build the Audit Request File.', text: 'Structure documents around the auditor’s request list so support can be provided systematically rather than searched for repeatedly.' },
        { lead: 'Maintain a Query Log.', text: 'Track requests, owners, responses and outstanding items throughout fieldwork so management knows where the audit is slowing down.' },
        { lead: 'Close the Learning Loop.', text: 'Convert recurring audit findings into improvements in accounting, documentation or month-end processes before the next reporting cycle.' },
      ],
      panel: { title: 'Audit Prepared', sub: 'Reconciliations, schedules and supporting evidence organised before fieldwork, while the statutory auditor remains fully independent.' },
    },
    override: {
      why: {
        pill: 'Why Valunxt?',
        titleTop: 'Connect Audit',
        titleMid: 'Preparation to',
        titleMark: 'the Books',
        note: 'Valunxt can work across accounting, financial statement preparation and audit support, helping unresolved balances and missing schedules surface before external audit fieldwork begins.',
        cta: { label: 'Discuss Audit Readiness', href: '/free-consultation/' },
        image: ABK_WHY.image,
        alt: ABK_WHY.alt,
      },
      approach: {
        eyebrow: 'Our approach',
        columns: [
          { title: 'Readiness Before Fieldwork', body: 'The best time to find an unreconciled balance or missing document is before the auditor does. Preparation focuses on identifying open items early enough for Finance to investigate them properly.' },
          { title: 'Evidence, Not Explanations', body: 'Material balances and transactions are organised around reconciliations, schedules, contracts, invoices or other relevant evidence so the audit discussion begins with documentation rather than memory.' },
          { title: 'Keep Independence Clear', body: 'Valunxt sits with the client, not with the statutory auditor. We support preparation of accounting records and responses, while the external auditor independently performs audit procedures and reaches the audit opinion.' },
        ],
      },
      /* The document gives this section a heading and a paragraph only; the
         four cards stay the bookkeeping page's. */
      insights: {
        ...ABK_INSIGHTS,
        title: 'Prepare Before Audit Pressure Begins',
        lede: 'Explore practical thinking on audit readiness, balance-sheet reconciliations, year-end close, supporting schedules and the accounting controls that reduce unnecessary disruption during external audit.',
      },
      band: {
        image: ABK_BAND.image,
        alt: ABK_BAND.alt,
        title: 'Valunxt Finance Intelligence',
        body: 'Audit readiness is usually created before audit season. Reconciled accounting, supporting schedules and documented financial positions reduce the amount of reconstruction required when an independent auditor begins testing the financial statements.',
      },
      vision: {
        steps: [
          { title: 'Our Focus', body: 'Prepare the client’s financial records and supporting evidence so external audit requests can be answered from an organised file.' },
          { title: 'Our Approach', body: 'Identify gaps before fieldwork, structure the audit support file, coordinate open requests and carry recurring findings back into the Finance process.' },
          { title: 'Our Perspective', body: 'Audit preparation is strongest when unresolved balances and missing records are identified before they begin generating repeated questions during fieldwork.' },
        ],
        pill: 'Our Vision',
        quote: 'Make the annual audit a review of financial work already completed, not the point where the business first discovers what its Finance records are missing.',
      },
      /* "Our capabilities: where we add value" heads the strip in the
         document; the row's heading block is hidden. */
      strip: stripOf('accounting-tax-services', ['Audit Readiness', 'Audit Request File', 'Balance Reconciliations', 'Supporting Schedules', 'Query Coordination', 'Adjustment Support']),
      talk: {
        head: 'Get the Company Side Ready Before Fieldwork',
        lede: 'If the next audit is likely to begin with missing schedules, unreconciled accounts or repeated document requests, start preparing the evidence before the auditor’s timetable begins.',
        cta: { label: 'Discuss Audit Support', href: '/free-consultation/' },
        image: ABK_TALK.image,
      },
    },
  },
];

export const ACCOUNTING_TAX_SUBS = buildSubs(PARENT, SPECS);
