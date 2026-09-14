/**
 * What a UAE sub-service page says — the content behind SubServiceTemplateBody,
 * and the builder that assembles it.
 *
 * THIRTY-THREE PAGES, ONE SHAPE. On client instruction (20260910) every page
 * beneath the six UAE services takes the Accounting & Bookkeeping page's UI,
 * section for section, with only the words changed. Ten sections, of which two
 * are genuinely about the sub-service — the hero and the brief (a lede and two
 * four-point lists) — and eight are about the practice it belongs to: why us,
 * the approach, the insights rail, the success story, the band, the vision,
 * the strip and the close.
 *
 * So the content is written in two layers. A SubParent holds the eight
 * practice-level sections once per service; a SubSpec holds the two
 * page-level sections per sub-service; buildSubs() zips them into the flat
 * SubServiceTemplateContent the body renders. A sub-service that needs to
 * override a practice-level section can — see SubSpec — but none does today.
 *
 * LENGTHS ARE PART OF THE DESIGN. A point that runs to six lines breaks the
 * two-column list's alignment, and a lede longer than about 55 words pushes
 * the hero's copy into the blur band. Keep replacements near the sizes the
 * modules use.
 *
 * FIGURES ARE NEVER OUTCOMES, and the success stories are PLACEHOLDERS: the
 * one on the bookkeeping page was written as a stand-in for a real case study
 * and the five written for the other practices are the same. They read as
 * plausible, they are attributed to a role and a kind of client rather than a
 * name, and they must be replaced by, or approved as, real ones before this
 * section carries the firm's name in public.
 */
import type { Industry } from '@/components/sections/HomeIndustriesRow';

import { SUB_PAGE_IMAGES } from './subImages';

export interface SubLink {
  label: string;
  href: string;
}

/** A point in one of the two-column lists in the brief. */
export type SubPoint = {
  /** The bolded lead-in. Two or three words. */
  lead: string;
  /** The rest of the sentence. HTML is not parsed — see `stress`. */
  text: string;
  /** A phrase inside `text` to underline, as the reference marks key terms. */
  stress?: string;
};

/** A column in the approach section. */
export type SubColumn = { title: string; body: string };

/** One card in the insights rail. EXACTLY FOUR per page — the grid is four across. */
export type SubInsight = {
  /** The pill over the artwork. Shown at rest, faded out on hover. Optional
   *  since 20260912: a client document that names a card without a category,
   *  kind or date leaves those off rather than inventing them. */
  category?: string;
  /** Small caps line above the title: kind, then date. */
  kind?: string;
  date?: string;
  /** Clamped to three lines at rest; shown whole on hover. */
  title: string;
  /** Revealed on hover only. Four lines at the card's width. Optional since
   *  20260914: the technology documents give a card a category and a title. */
  excerpt?: string;
  href: string;
  /** Passed through rimg(), so it is a path under uploads/. */
  image: string;
  alt: string;
};

/** One item on the vision rail. */
export type SubStep = { title: string; body: string };

/** A path under uploads/, or candidates in preference order (first that exists). */
export type SubImage = string | string[];

/** A SubImage as a candidate list. */
export const subImageList = (img: SubImage): string[] => ([] as string[]).concat(img);

export interface SubWhy {
  pill: string;
  /** Three lines, because a fourth overflows the card at 1280. */
  titleTop: string;
  titleMid: string;
  titleMark: string;
  note: string;
  cta: SubLink;
  image: SubImage;
  alt: string;
}

export interface SubApproach {
  eyebrow: string;
  columns: SubColumn[];
}

export interface SubInsights {
  title: string;
  lede: string;
  all: SubLink;
  cards: SubInsight[];
}

export interface SubStory {
  photo: SubImage;
  alt: string;
  quote: string;
  /** Initials, not a photograph: a stock headshot attached to a named role reads
   *  as a real person who did not say this. All three optional since 20260912:
   *  a client document that gives a quote without an attribution shows the
   *  quote alone rather than a made-up role. */
  initials?: string;
  role?: string;
  org?: string;
  /** Optional for the same reason: a panel the document does not label gets no pill. */
  pill?: string;
  title: string;
  /** The whole point of the panel. Everything else on it is caption. Optional
   *  since 20260914: the research documents give the panel a headline and a
   *  sentence and no figure, and the sentence takes the caption's place. */
  stat?: string;
  note: string;
  /** Optional since 20260914, for the two research panels the document
   *  writes without a button. */
  cta?: SubLink;
  arrow: SubLink;
}

export interface SubBand {
  image: SubImage;
  alt: string;
  title: string;
  body: string;
  /** Optional since 20260914: the Accounting & Tax documents write the band
   *  with a heading and a paragraph and no button. */
  cta?: SubLink;
}

export interface SubVision {
  steps: SubStep[];
  pill: string;
  quote: string;
}

export interface SubTalk {
  head: string;
  lede: string;
  cta: SubLink;
  /** Candidates, first-that-exists. */
  image: string[];
}

export interface SubBrief {
  /** One paragraph, or several (20260912: the client documents open the brief
   *  with two). */
  lede: string | string[];
  whatIntro: string;
  what: SubPoint[];
  howIntro: string;
  how: SubPoint[];
  panel: {
    mark: string;
    title: string;
    sub: string;
    image: SubImage;
    alt: string;
  };
}

/** The flat content one page renders. */
export interface SubServiceTemplateContent {
  /** The parent service slug. */
  service: string;
  /** This page's slug under it. */
  slug: string;
  /** Services, then the parent. The page's own name is the crumb's last, unlinked step. */
  crumbs: SubLink[];
  hero: {
    title: string;
    /** The breadcrumb's last step, when the document writes it differently
     *  from the title (20260912: "Sell & Rent/Lease Property" over a page
     *  titled "Sell & Lease Property"). The title otherwise. */
    crumb?: string;
    lede: string;
    /** Candidates, first-that-exists. */
    image: string[];
    alt: string;
  };
  brief: SubBrief;
  why: SubWhy;
  approach: SubApproach;
  insights: SubInsights;
  story: SubStory;
  band: SubBand;
  vision: SubVision;
  /** Six, because the row divides the viewport between however many it is given
   *  and six is what the home pages are tuned for. */
  strip: Industry[];
  talk: SubTalk;
}

/** The practice-level layer: everything the pages under one service share. */
export interface SubParent {
  service: string;
  /** The breadcrumb's middle step, short. "Accounting & Tax", not the registry name. */
  crumb: string;
  hero: { image: string[]; alt: string };
  panel: { mark: string; image: SubImage; alt: string };
  why: SubWhy;
  approach: SubApproach;
  insights: SubInsights;
  story: SubStory;
  band: SubBand;
  vision: SubVision;
  strip: Industry[];
  talk: SubTalk;
}

/** The page-level layer: what one sub-service says for itself. */
export interface SubSpec {
  slug: string;
  /** The hero title. Matches the registry's SubService.name unless the
   *  document says otherwise, in which case `crumb` carries the registry's. */
  title: string;
  /** See SubServiceTemplateContent.hero.crumb. */
  crumb?: string;
  /** The hero paragraph — about 50 words. */
  lede: string;
  /** A photograph of its own, if it has one; otherwise the parent's. */
  hero?: { image?: string[]; alt?: string };
  brief: Omit<SubBrief, 'panel'> & { panel: { title: string; sub: string } };
  /** Per-page overrides of the practice-level sections. None used today. */
  override?: Partial<Pick<SubServiceTemplateContent, 'why' | 'approach' | 'insights' | 'story' | 'band' | 'vision' | 'strip' | 'talk'>>;
}

/**
 * The pages under one service, keyed by sub slug, ready for the registry.
 *
 * The breadcrumb, the hero photograph and the panel's mark and plate are the
 * parent's unless the spec says otherwise; everything in `override` replaces
 * the parent's section wholesale rather than merging into it.
 *
 * EVERY IMAGE HAS A PURPOSE-SHOT SLOT (20260913), so no photograph repeats
 * between pages: hero, panel, why, story, band, the six strip panels and the
 * close, all per page, under uploads/services/sub/<service>/<page>-<slot>.webp.
 * The insights cards are the exception: they are the site's articles' own images. Each leads its
 * candidate list with the stand-in it replaces behind it, so a page with no file
 * of its own still renders.
 */
export function buildSubs(parent: SubParent, specs: SubSpec[]): Record<string, SubServiceTemplateContent> {
  const out: Record<string, SubServiceTemplateContent> = {};
  const dir = `services/sub/${parent.service}`;
  for (const s of specs) {
    out[s.slug] = {
      service: parent.service,
      slug: s.slug,
      crumbs: [
        { label: 'Services', href: '/services/' },
        { label: parent.crumb, href: `/services/${parent.service}/` },
      ],
      hero: {
        title: s.title,
        crumb: s.crumb,
        lede: s.lede,
        image: parent.hero.image,
        alt: s.hero?.alt ?? parent.hero.alt,
      },
      brief: {
        ...s.brief,
        panel: { ...parent.panel, ...s.brief.panel },
      },
      why: parent.why,
      approach: parent.approach,
      insights: parent.insights,
      story: parent.story,
      band: parent.band,
      vision: parent.vision,
      strip: parent.strip,
      talk: parent.talk,
      ...s.override,
    };
    /* The plates are wrapped after the override lands. Every image on every
       page is that page's own, by client instruction (20260913): pages that share
       a structure still never share a photograph. The strip panels are keyed by
       position because each page's strip is its own list. */
    const o = out[s.slug];
    /* The page's entry in SUB_PAGE_IMAGES names its files; a page missing from
       the registry still gets page-keyed names, never a sibling's. */
    const reg = SUB_PAGE_IMAGES[`${parent.service}/${s.slug}`];
    const own = (name: string) => `${dir}/${s.slug}-${name}.webp`;
    o.hero = { ...o.hero, image: s.hero?.image ?? [...subImageList(reg?.hero ?? own('hero')), ...parent.hero.image] };
    o.brief = { ...o.brief, panel: { ...o.brief.panel, image: [...subImageList(reg?.panel ?? own('panel')), ...subImageList(parent.panel.image)] } };
    o.why = { ...o.why, image: [...subImageList(reg?.why ?? own('why')), ...subImageList(o.why.image)] };
    o.story = { ...o.story, photo: [...subImageList(reg?.story ?? own('story')), ...subImageList(o.story.photo)] };
    o.band = { ...o.band, image: [...subImageList(reg?.band ?? own('band')), ...subImageList(o.band.image)] };
    o.strip = o.strip.map((st, i) => ({ ...st, img: [...subImageList(reg?.strip[i] ?? own(`strip-${i + 1}`)), ...subImageList(st.img)] }));
    o.talk = { ...o.talk, image: [...subImageList(reg?.talk ?? own('talk')), ...o.talk.image] };
  }
  return out;
}
