/**
 * What a UAE service page says — the content behind ServiceTemplateBody.
 *
 * One object per service, one component for all six. Every string, link and
 * photograph that differs between /services/accounting-tax-services/ and
 * /services/mortgages-services/ is a field here; nothing about the layout is.
 *
 * PHOTOGRAPHS ARE CANDIDATE LISTS, in the house convention: a purpose-shot
 * filename first, an existing library photograph behind it, so commissioning a
 * proper shot is a drop into uploads/services/ and no code change. rimgFirst()
 * takes the first that exists, and a market can override any of them under
 * uploads/regions/<slug>/.
 *
 * FIGURES ARE NEVER OUTCOMES. The copy in these modules states what a service
 * does and who it is for; it does not promise what it will achieve. That is
 * the line the rest of the UAE content already holds (see ../content.ts) and a
 * regulated advisory firm's service page has to hold it too.
 */

export interface TemplateLink {
  label: string;
  href: string;
}

/** One page beneath the service — a panel in the strip and an item in the chooser. */
export interface TemplateSub {
  /** The card's title. Matches the registry's SubService.name. */
  name: string;
  /** Sub-service slug under /services/<service>/. Must exist in vxnServices('en-ae'). */
  slug: string;
  /** The short card body — one sentence. */
  cardText: string;
  /** The panel's photograph, candidates first. */
  figure: string[];
}

/** One tab of the "Find the Right Solution" chooser. Up to three items. */
export interface TemplateTab {
  tab: string;
  /** A line set above the intro, in bold, in the same text block. It is the
   *  tab's own heading where a document gives it one; the block has no heading
   *  widget of its own and the layout is not changed for it. */
  title?: string;
  intro: string;
  /** Sub-service slugs, in the order they list. A slug not in `subs` is skipped. */
  slugs?: string[];
  /** Items written for the tab itself, shown in place of `slugs` when set. Each
   *  renders the way a sub-service does: a name and one line under it. */
  items?: { name: string; text: string }[];
  /** The button on the tab's picture. `intro.primary` when unset. */
  cta?: TemplateLink;
}

export interface ServiceTemplateContent {
  /** The service slug — the page's own URL segment, and what the related cards exclude. */
  slug: string;
  /** The breadcrumb's last step, short. "Accounting & Tax", not the registry's full name. */
  crumb: string;

  /** The banner: a title, one line under it, a photograph behind both. */
  hero: {
    head: string;
    sub: string;
    image: string[];
    alt: string;
  };

  /** The proposition band under the banner. */
  intro: {
    /** The statement — left column of the head row. */
    head: string;
    /** Its gloss — right column. */
    lede: string;
    /** The ruled list. Four reads as a set; the layout holds any count. */
    proof: { label: string; note: string }[];
    /** The two pills under the list. */
    chips: string[];
    primary: TemplateLink;
    secondary: TemplateLink;
    image: string[];
  };

  /** The hover accordion of sub-services — the commercial centre of the page. */
  strip: {
    kicker: string;
    head: string;
    lede: string;
    /** The invitation beside the heading. */
    cta: string;
    subs: TemplateSub[];
    /** 'deck' draws the strip as the card deck of the 20260915 reference
     *  (ExploreDeck.tsx): the open card's copy on its photograph with an icon
     *  panel and a corner button, the closed cards on silk with their names
     *  on end. Unset, the template's own strip. Real Estate only, so far. */
    look?: 'deck';
    /** The silk each card shows while closed, in `subs` order (deck only). */
    silks?: string[][];
  };

  /** The three-tab chooser. Exactly three tabs render; a fourth is ignored. */
  solution: {
    head: string;
    tabs: TemplateTab[];
    /** The photograph behind each tab's right-hand pane, in tab order. */
    images: string[][];
    /** 'satin' draws the chooser as the green satin band of the 20260915
     *  reference (SolutionSatin.tsx) in place of the captured Elementor tabs.
     *  Unset, the captured block. Real Estate only, so far. */
    look?: 'satin';
    /** The band's texture, candidates first (satin only). */
    texture?: string[];
  };

  /** The split banner card. */
  banner: {
    head: string;
    body: string;
    cta: TemplateLink;
    image: string[];
  };

  related: {
    head: string;
    /** The three other service lines to show, by registry slug, in order.
     *  Unset, the first three in the registry other than this page's own. */
    slugs?: string[];
  };

  /** The closing band. */
  close: {
    head: string;
    lede: string;
    primary: TemplateLink;
    image: string[];
  };
}
