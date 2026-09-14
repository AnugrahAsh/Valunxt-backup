/**
 * Copy for /en-ae/services/accounting-tax-services/accounting-bookkeeping/,
 * and the practice-level sections every Accounting & Tax sub-page shares.
 *
 * This page was written first, as its own body; it is one of thirty-three on
 * the sub-service template now (../../template/SubServiceTemplateBody.tsx),
 * and ../subs.ts is what assembles it and its seven siblings from the blocks
 * below. Nothing here is rendered directly.
 *
 * PLACEHOLDER TEXT. The four sections were specified as reference designs, not
 * as a source document, so everything below is written to the shape the design
 * needs — a lede of roughly this length, two lists of four points each, three
 * approach columns — and says something plausible about bookkeeping while the
 * real copy is written. Swapping it is an edit to this file and nothing else.
 *
 * Lengths are part of the design. A point that runs to six lines breaks the
 * two-column list's alignment, and a lede longer than about 55 words pushes the
 * hero's call to action off the paragraph's baseline. Keep replacements near
 * the sizes below.
 */

/** A point in one of the two-column lists in section 2. */
export type AbkPoint = {
  /** The bolded lead-in. Two or three words. */
  lead: string;
  /** The rest of the sentence. HTML is not parsed — see `stress`. */
  text: string;
  /** A phrase inside `text` to underline, as the reference marks key terms. */
  stress?: string;
};

/** A column in section 4. */
export type AbkApproach = { title: string; body: string };

/* -------------------------------------------------------------------------
   1. HERO
   ------------------------------------------------------------------------- */

export const ABK_HERO = {
  title: 'Accounting & Bookkeeping',
  lede:
    'We keep ambitious businesses on top of their numbers with books that close on time, ' +
    'reconcile cleanly and stand up to scrutiny. Whether you are opening your first UAE ' +
    'entity, cleaning up a backlog, or preparing for an audit, we bring disciplined ' +
    'process and structured reporting that moves you forward.',
  /* The plate. Warm, architectural and already out of focus at the right, which
     is what lets the blur band at the foot dissolve rather than start. */
  image: 'banners/service-main.webp',
  alt: 'A meeting at dusk against a city skyline',
};

/* -------------------------------------------------------------------------
   2. THE BRIEF
   ------------------------------------------------------------------------- */

export const ABK_BRIEF = {
  lede:
    'We partner with clients to run bookkeeping as a controlled monthly process rather than ' +
    'a year-end scramble. The approach is built on work delivered across free zone and ' +
    'mainland entities, which has shown that dependable books need both the what of the ' +
    'ledger and the how of the routine behind it.',

  whatIntro: 'The what focuses on getting the record itself right, including:',

  what: [
    {
      lead: 'A single chart of accounts',
      text: 'mapped to how you actually report, so every entity, cost centre and project rolls up the same way.',
      stress: 'mapped to how you actually report',
    },
    {
      lead: 'Cost visibility',
      text: 'achieved through clean supplier coding, accrual discipline and prepaid schedules that are maintained, not rebuilt each quarter.',
      stress: 'clean supplier coding',
    },
    {
      lead: 'Revenue accuracy',
      text: 'driven by invoice-level reconciliation between your billing system, the bank and the ledger, tied to VAT treatment.',
    },
    {
      lead: 'An audit-ready balance sheet',
      text: 'where every control account is supported by a schedule that agrees to it on the day the period closes.',
    },
  ] satisfies AbkPoint[],

  howIntro: 'The how sets the routine up to hold, month after month:',

  how: [
    {
      lead: 'Close certainty.',
      text: 'Every period runs to a published calendar, with a fixed cut-off, a reconciliation checklist and a named reviewer before anything is reported.',
      stress: 'a published calendar',
    },
    {
      lead: 'Team engagement.',
      text: 'Your finance staff see what we do and why. They keep access, keep ownership of the system, and are trained on the parts they run themselves.',
    },
    {
      lead: 'Owner enablement.',
      text: 'Directors get one pack that answers the questions they actually ask — cash, margin, debtors and what changed since last month.',
    },
    {
      lead: 'Documented practice.',
      text: 'Policies, workpapers and journals are written down and version-controlled, so the process survives a change of staff on either side.',
    },
  ] satisfies AbkPoint[],

  panel: {
    mark: 'Valunxt',
    title: 'Managed Books',
    sub: 'Monthly bookkeeping, reconciliation and reporting for UAE entities, run by a dedicated team on your own systems.',
    image: 'homepage/abstract-2.webp',
    alt: '',
  },
};

/* -------------------------------------------------------------------------
   3. WHY US
   ------------------------------------------------------------------------- */

export const ABK_WHY = {
  pill: 'Why us?',
  /* Split so the second line can carry the highlight block the reference puts
     behind it. Three lines, because a fourth overflows the card at 1280. */
  titleTop: 'You’ll Always',
  titleMid: 'Know',
  titleMark: 'Where You Stand',
  note: 'We are transparent like that. Fixed monthly fees, no surprise invoices.',
  cta: { label: 'Schedule a Call', href: '/free-consultation/' },
  image: '2025/04/pexels-rdne-7889214.jpg',
  alt: 'A client team in discussion',
};

/* -------------------------------------------------------------------------
   4. OUR APPROACH
   ------------------------------------------------------------------------- */

export const ABK_APPROACH = {
  eyebrow: 'Our approach',
  columns: [
    {
      title: 'Built by practitioners',
      body:
        'Our team came up through audit and in-house finance functions, not through a call ' +
        'centre. That background is why the file we hand an auditor is the file they asked ' +
        'for, and why the questions we raise during the month are the ones that would have ' +
        'been raised at year end anyway.',
    },
    {
      title: 'Deep UAE specifics',
      body:
        'Corporate tax, VAT, free zone qualifying income and transfer pricing all land on ' +
        'the same ledger. We keep the bookkeeping compatible with each of them from the ' +
        'first entry, so a filing position is never something that has to be reconstructed ' +
        'from an export months later.',
    },
    {
      title: 'Obsessed with the close',
      body:
        'A set of books is only useful if it arrives while the decisions are still open. We ' +
        'commit to a close date, publish where each account stands against it, and treat a ' +
        'missed deadline as a process failure to fix rather than a delay to explain.',
    },
  ] satisfies AbkApproach[],
};

/* -------------------------------------------------------------------------
   5. INSIGHTS RAIL

   Modelled on the supplied screen recording. Every number that describes the
   card's behaviour is in the stylesheet (.abk-ins / .abk-card); what lives here
   is only the copy and the artwork.

   EXACTLY FOUR. The row is a four-column grid, not a scroller, so the count
   here is load-bearing: a fifth entry would start a second row of one. Add or
   remove in fours, or change the grid in the stylesheet to match.
   ------------------------------------------------------------------------- */

/** One card in the insights rail. */
export type AbkInsight = {
  /** The pill over the artwork. Shown at rest, faded out on hover. */
  category: string;
  /** Small caps line above the title: kind, then date. */
  kind: string;
  date: string;
  /** Clamped to three lines at rest; shown whole on hover. */
  title: string;
  /** Revealed on hover only. Four lines at the card's width. */
  excerpt: string;
  href: string;
  /** Passed through rimg(), so it is a path under uploads/. */
  image: string;
  alt: string;
};

export const ABK_INSIGHTS = {
  title: 'Bridging Records and Decisions',
  lede:
    'We bring disciplined process and applied technology to every engagement, so finance teams ' +
    'can close faster, report with confidence, and act on numbers that hold. Explore our latest ' +
    'thinking on the choices shaping finance in the UAE.',
  all: { label: 'Learn more', href: '/blogs/' },

  cards: [
    {
      category: 'Corporate Tax',
      kind: 'Article',
      date: 'September 3, 2026',
      title: 'What the Domestic Minimum Top-Up Tax Means for UAE Groups',
      excerpt:
        'Large groups now face a second calculation on top of the headline rate. The workings sit ' +
        'in the ledger, which means the bookkeeping has to carry them from the first entry.',
      href: '/blogs/',
      image: 'blogs/blog-1.webp',
      alt: '',
    },
    {
      category: 'VAT & Compliance',
      kind: 'Article',
      date: 'September 2, 2026',
      title: 'Input Tax Recovery: The Five Errors That Cost the Most',
      excerpt:
        'Most recovery disputes come down to the same handful of coding decisions. Each one is ' +
        'cheap to prevent at the point of entry and expensive to unwind at assessment.',
      href: '/blogs/',
      image: 'blogs/blog-2.webp',
      alt: '',
    },
    {
      category: 'Free Zone',
      kind: 'Article',
      date: 'September 1, 2026',
      title: 'Qualifying Income and the Bookkeeping It Actually Requires',
      excerpt:
        'A qualifying free zone position is a claim about how revenue was earned. Substantiating ' +
        'it means the ledger has to separate income streams before the year closes, not after.',
      href: '/blogs/',
      image: 'blogs/blog-3.webp',
      alt: '',
    },
    {
      category: 'Audit Readiness',
      kind: 'Article',
      date: 'August 27, 2026',
      title: 'Closing the Gap Between Your Ledger and Your Auditor',
      excerpt:
        'The file an auditor asks for is rarely the file that exists. Building it during the year ' +
        'costs a fraction of what it costs to reconstruct in the four weeks before sign-off.',
      href: '/blogs/',
      image: 'blogs/blog-4.webp',
      alt: '',
    },
  ] satisfies AbkInsight[],
};

/* -------------------------------------------------------------------------
   6. SUCCESS STORY

   Two panels of equal height side by side: a photograph carrying a frosted
   testimonial, and a gradient panel carrying the result. They are one band, not
   two cards — the gap between them is narrow on purpose so the pair reads as a
   single object split down the middle.
   ------------------------------------------------------------------------- */

export const ABK_CASE = {
  photo: '2025/03/GettyImages-2188611296.jpg',
  alt: 'A finance lead reviewing a filing',

  quote:
    'We came to Valunxt weeks before the corporate tax deadline, expecting penalties. They ' +
    'registered us, cleaned up a year of books and filed on time, and the fee never moved from ' +
    'the quote.',
  /* Initials, not a photograph: a stock headshot attached to a named role reads
     as a real person who did not say this. */
  initials: 'SM',
  role: 'Founder',
  org: 'Dubai-based trading SME',

  pill: 'Success story',
  title: 'Penalty-Free Corporate Tax Registration & First Filing',
  /* The whole point of the panel. Everything else on it is caption. */
  stat: 'AED 0',
  note: 'in FTA penalties, registered, reconciled and filed ahead of every deadline.',
  cta: { label: 'Discuss Your Case', href: '/free-consultation/' },
  /* The corner arrow opens the practice this story belongs to. It pointed at
     /track-record/ once, which is a 404 on purpose until data/track-record.ts
     is populated — see the note there. */
  arrow: { href: '/services/accounting-tax-services/', label: 'More about Accounting & Tax' },
};

/* -------------------------------------------------------------------------
   7. THE BAND

   One wide plate with a heading against it and the copy beside. Deliberately
   short — it is a rest between two dense sections, not a section of its own.
   ------------------------------------------------------------------------- */

export const ABK_BAND = {
  image: 'banners/technology-and-ai.webp',
  alt: '',
  title: 'Valunxt Finance Intelligence',
  body:
    'Working with tax specialists, auditors and technology partners, Valunxt Finance Intelligence ' +
    'turns a month of bookkeeping into a position you can act on — reconciled, documented and ' +
    'ready for whoever asks to see it next.',
  /* technology-data-ai, the UAE slug. It pointed at /services/technology-ai/,
     which is India's page and a 404 under /en-ae/. */
  cta: { label: "Discover what's next", href: '/services/technology-data-ai/' },
};

/* -------------------------------------------------------------------------
   8. FOCUS AND VISION
   ------------------------------------------------------------------------- */

/** One item on the left-hand rail. */
export type AbkStep = { title: string; body: string };

export const ABK_VISION = {
  steps: [
    {
      title: 'Our Focus',
      body:
        'One thing above all: numbers you can act on without second-guessing — compliance kept ' +
        'current, positions documented, deadlines met before they are due.',
    },
    {
      title: 'Our Approach',
      body:
        'Fixed fees agreed before work begins, senior people on every mandate, and every ' +
        'recommendation backed by verified data and sound method.',
    },
    {
      title: 'Our Experience',
      body:
        'A senior team of accountants, tax advisers and valuers, part of the Reliant Surveyors ' +
        'group — from Dubai to Noida to Mumbai.',
    },
  ] satisfies AbkStep[],

  pill: 'Our Vision',
  quote:
    'To be the UAE partner businesses trust with the numbers that decisions rest on — listening ' +
    'first, thinking independently, and advising with conviction.',
};

/* -------------------------------------------------------------------------
   9. THE EXPANDING STRIP

   The home page's `HomeIndustriesRow` reused verbatim — same component, same
   markup, same CSS in valunxt-brand.css, so the expand-and-desaturate hover is
   the one on the home pages and not a copy of it that can drift.

   THE LIST IS THE ONLY THING THAT CHANGES. The home pages show sectors; on a
   service page the six panels are that service's own disciplines, which is
   what makes the strip worth its full-bleed height here.

   SIX, because the row divides the viewport between however many it is given
   and six is what the home pages are tuned for. Artwork uses the same
   first-that-exists list as the home strip: drop a better file in at the first
   path and it takes over with no code change.
   ------------------------------------------------------------------------- */

export const ABK_STRIP: { name: string; img: string[] }[] = [
  { name: 'Ledger & Bookkeeping', img: ['homepage/service-ledger.webp', 'homepage/industry-5.webp'] },
  { name: 'Bank Reconciliation', img: ['homepage/service-reconciliation.webp', 'homepage/industry-4.webp'] },
  { name: 'Management Reporting', img: ['homepage/service-reporting.webp', 'homepage/industry-2.webp'] },
  { name: 'VAT & Corporate Tax', img: ['homepage/service-tax.webp', 'homepage/industry-1.webp'] },
  { name: 'Audit Preparation', img: ['homepage/service-audit.webp', 'homepage/industry-3.webp'] },
  { name: 'Payroll & WPS', img: ['homepage/service-payroll.webp', 'homepage/abstract-1.webp'] },
];

/* -------------------------------------------------------------------------
   10. TALK TO AN EXPERT

   The closing band from /en-ae/services/accounting-tax-services/, duplicated
   here by request. The copy, the artwork and the styling are the parent's —
   see the note on `.abk-talk` in the stylesheet for what that means for the
   button colour, which is NOT this page's blue.
   ------------------------------------------------------------------------- */

export const ABK_TALK = {
  head: 'Start with the finance problem you need solved today.',
  lede:
    'Whether you need monthly bookkeeping, better management information, help planning ahead, ' +
    'VAT or Corporate Tax support, audit preparation or CFO-level guidance, Valunxt can help ' +
    'identify the right place to start.',
  cta: { label: 'Book a Free Accounting & Tax Consultation', href: '/free-consultation/' },
  /* The same first-that-exists pair the parent page uses, so both pages pick up
     the real plate on the day it is supplied. */
  image: ['services/accounting-tax-talk.webp', 'new-folder/career-1.webp'],
};
