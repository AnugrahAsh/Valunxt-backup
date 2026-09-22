/**
 * EVERY STATIC ABSTRACT ON THE SITE, AND THE LIVE SCENE THAT STANDS IN FOR IT
 * (20260922, client instruction: a moving Three.js abstract for each abstract
 * on the whole site, every one different from the others).
 *
 * This file imports nothing from Three.js, so a Server Component can read it
 * to decide whether an image has a scene. The scenes themselves are in
 * ./scenes and load on the client only, through ./host.
 *
 * NINE FAMILIES, each hand-modeled and each unlike the four home-page hero
 * scenes (heroScenes.ts: blade wall, glass dishes, lit sheets, folded petals)
 * and the real-estate practice's five (estateScenes.ts: skyline, dunes,
 * arches, globe, lattice):
 *
 *   satin    a folded silk sheet, lit across the folds, drifting
 *   pleats   a corrugated sheet, its ridges bending, a band of light sweeping
 *   arcs     thin luminous arcs precessing in the dark, a pulse running along each
 *   ribbons  translucent ribbons crossing the frame, twisting as they go
 *   mesh     a wireframe sea, lines and sparks, waves running through it
 *   curtain  hundreds of hanging strands with a light wave passing through
 *   torus    a glass loop turning, catching a sweep of light
 *   strata   layers of cut paper, their edges undulating, shadows between
 *   trails   light streaking along curved lanes
 *
 * A PLACEMENT IS A SPEC: a family plus its parameters and a seed. Two
 * placements of one family never share parameters, so no two abstracts on
 * the site move the same way. The site's own artwork keeps its file; the
 * spec table below maps each file to a default spec, and a component can
 * name a spec directly (LiveImage's `live` prop) where one file used to be
 * repeated and now needs a different scene in each place.
 *
 * The thirty-three sub-service pages each carry a band and a panel. Their
 * families come from the practice (so a practice's pages read as a set) and
 * their parameters from the page's slug, so every page's pair differs from
 * every other page's, and its band never shares a family with its panel.
 */
export type Tone = 'royal' | 'cobalt' | 'navy' | 'electric' | 'violet' | 'teal' | 'ice';

export type Family = 'satin' | 'pleats' | 'arcs' | 'ribbons' | 'mesh' | 'curtain' | 'torus' | 'strata' | 'trails';

export interface LiveSpec {
  family: Family;
  /** 0..1; drives every random choice a family makes. */
  seed: number;
  tone: Tone;
  /** Family parameters; each builder reads what it knows and defaults the rest. */
  angle?: number;
  gloss?: number;
  freq?: number;
  amp?: number;
  speed?: number;
  pitch?: number;
  bend?: number;
  profile?: 'sharp' | 'wave';
  contrast?: number;
  mode?: 'rings' | 'fine';
  count?: number;
  width?: number;
  density?: number;
  tilt?: number;
  strands?: number;
  band?: number;
  knot?: boolean;
  layers?: number;
  warm?: boolean;
  /** Where the subject sits, 0 = left edge, 1 = right edge (families that anchor). */
  anchor?: number;
}

/* The named placements. The key is what a component passes as `live`; the
   comment says which file and which page it stands in for. */
export const SPECS: Record<string, LiveSpec> = {
  /* ---- /en-ae/ home ---- */
  'home-group': { family: 'pleats', seed: 0.12, tone: 'cobalt', angle: 34, profile: 'sharp', pitch: 1.15, bend: 0.5 }, // uae/home/the-group.webp, Who We Are brand card
  'home-figs': { family: 'arcs', seed: 0.3, tone: 'royal', mode: 'fine', count: 9 }, // uae/home/connected-practices.webp, practices band
  'home-impact': { family: 'satin', seed: 0.5, tone: 'navy', gloss: 48, freq: 1.4, angle: 20, amp: 0.95 }, // uae/home/advisory-scrutiny.webp, impact strip
  'home-mosaic': { family: 'mesh', seed: 0.7, tone: 'royal', density: 1 }, // banners/uae-slider-3.webp, mosaic research tile
  'home-story': { family: 'strata', seed: 0.2, tone: 'royal', layers: 8 }, // banners/uae-slider-4.webp, bento story card
  'home-about': { family: 'ribbons', seed: 0.8, tone: 'electric', count: 3 }, // banners/uae-slider-2.webp, bento about strip
  'home-whyus': { family: 'torus', seed: 0.4, tone: 'royal', knot: false, anchor: 0.78 }, // banners/uae-slider-2.webp, why-us banner
  'about-mega': { family: 'pleats', seed: 0.61, tone: 'electric', angle: 42, profile: 'sharp', pitch: 1.6, bend: 0.25, contrast: 1.2 }, // uae/home/expertise-abstract.webp, About menu art
  /* ---- /en-in/ home ---- */
  'home-in-cta': { family: 'curtain', seed: 0.33, tone: 'electric', strands: 240 }, // homepage/abstract-1.webp behind "Every Investment Decision Counts"
  /* ---- the six UAE practices: the services index card and the practice page's banner ---- */
  'svc-accounting': { family: 'arcs', seed: 0.05, tone: 'electric', mode: 'rings', count: 3 }, // services/accounting-tax-banner.webp
  'svc-real-estate': { family: 'pleats', seed: 0.15, tone: 'royal', angle: 82, profile: 'wave', pitch: 0.85, bend: 0.9, amp: 0.55 }, // services/real-estate-banner.webp
  'svc-mortgages': { family: 'ribbons', seed: 0.25, tone: 'royal', count: 4 }, // services/mortgages-banner.webp
  'svc-valuation': { family: 'mesh', seed: 0.35, tone: 'electric', density: 1.25, tilt: 0.9 }, // services/valuation-banner.webp
  'svc-research': { family: 'pleats', seed: 0.45, tone: 'cobalt', angle: 6, profile: 'wave', pitch: 0.5, bend: 0.4, amp: 1.1 }, // services/research-banner.webp
  'svc-technology': { family: 'curtain', seed: 0.55, tone: 'royal', strands: 320, band: 0.5 }, // services/technology-banner.webp
  'svc-hero': { family: 'torus', seed: 0.65, tone: 'royal', knot: true, anchor: 0.74 }, // banners/services-banner.webp, every practice page's hero
  /* ---- the real-estate practice page ---- */
  're-silk-1': { family: 'satin', seed: 0.71, tone: 'royal', gloss: 30, freq: 2.2, angle: 28 }, // banners/texture-1.webp, explore deck
  're-silk-2': { family: 'pleats', seed: 0.77, tone: 'electric', angle: 38, profile: 'sharp', pitch: 1.4, bend: 0.3 }, // uae/home/expertise-abstract.webp, explore deck
  're-silk-3': { family: 'ribbons', seed: 0.83, tone: 'electric', count: 2, width: 1.4 }, // banners/uae-slider-2.webp, explore deck
  're-satin': { family: 'satin', seed: 0.91, tone: 'teal', gloss: 24, freq: 1.6, angle: 12 }, // services/re-solution-texture.webp, solution band
  /* ---- elsewhere ---- */
  'ind-banner': { family: 'arcs', seed: 0.48, tone: 'cobalt', mode: 'fine', count: 7 }, // uae/home/connected-practices.webp, industries page banner
  'careers-card': { family: 'satin', seed: 0.57, tone: 'violet', gloss: 36, freq: 1.8, angle: 40 }, // banners/texture-2.webp, careers "Why work with" card
  'brand-hero': { family: 'strata', seed: 0.66, tone: 'ice', layers: 10 }, // banners/breadcrumb-banner.png, brand-tone page hero
  'in-capital-hero': { family: 'trails', seed: 0.73, tone: 'royal', warm: true }, // banners/capital-advisory.webp, India capital advisory hero
  /* ---- the generic files, where they appear on their own ---- */
  'abstract-1': { family: 'curtain', seed: 0.19, tone: 'royal', strands: 200, band: 0.8 }, // homepage/abstract-1.webp
  'abstract-2': { family: 'ribbons', seed: 0.29, tone: 'royal', count: 3, width: 1.1 }, // homepage/abstract-2.webp
  'abstract-3': { family: 'mesh', seed: 0.39, tone: 'navy', density: 0.9 }, // homepage/abstract-3.webp
  'texture-1': { family: 'satin', seed: 0.49, tone: 'royal', gloss: 26, freq: 2.0, angle: 32 }, // banners/texture-1.webp
  'texture-2': { family: 'satin', seed: 0.59, tone: 'violet', gloss: 40, freq: 1.5, angle: 48 }, // banners/texture-2.webp
  'answer-stage': { family: 'pleats', seed: 0.69, tone: 'royal', angle: 4, profile: 'wave', pitch: 0.7, bend: 0.5 }, // uae/home/answer-stage.webp
  'tech-solution-1': { family: 'trails', seed: 0.27, tone: 'electric', warm: false }, // services/technology-data-ai-solution-1.webp
  'tech-solution-3': { family: 'curtain', seed: 0.37, tone: 'cobalt', strands: 160, band: 0.35 }, // services/technology-data-ai-solution-3.webp
};

/** Which file gets which spec when a component does not name one. */
const FILES: Record<string, string> = {
  'uae/home/the-group.webp': 'home-group',
  'uae/home/connected-practices.webp': 'home-figs',
  'uae/home/advisory-scrutiny.webp': 'home-impact',
  'uae/home/expertise-abstract.webp': 'about-mega',
  'uae/home/answer-stage.webp': 'answer-stage',
  'homepage/abstract-1.webp': 'abstract-1',
  'homepage/abstract-2.webp': 'abstract-2',
  'homepage/abstract-3.webp': 'abstract-3',
  'homepage/abstract-2.png': 'abstract-2',
  'homepage/abstract-3.png': 'abstract-3',
  'banners/texture-1.webp': 'texture-1',
  'banners/texture-2.webp': 'texture-2',
  'banners/breadcrumb-banner.png': 'brand-hero',
  'banners/capital-advisory.webp': 'in-capital-hero',
  'banners/services-banner.webp': 'svc-hero',
  'services/accounting-tax-banner.webp': 'svc-accounting',
  'services/real-estate-banner.webp': 'svc-real-estate',
  'services/mortgages-banner.webp': 'svc-mortgages',
  'services/valuation-banner.webp': 'svc-valuation',
  'services/research-banner.webp': 'svc-research',
  'services/technology-banner.webp': 'svc-technology',
  'services/re-solution-texture.webp': 're-satin',
  'services/technology-data-ai-solution-1.webp': 'tech-solution-1',
  'services/technology-data-ai-solution-3.webp': 'tech-solution-3',
  /* The hero slider's four files, where they are reused as plates. The hero
     itself keeps its own scenes (HeroSlideMedia); these are the defaults for
     any other placement that does not name a spec. */
  'banners/uae-slider-1.webp': 'svc-accounting',
  'banners/uae-slider-2.webp': 'home-about',
  'banners/uae-slider-3.webp': 'home-mosaic',
  'banners/uae-slider-4.webp': 'home-story',
};

/* The sub-service pages: a family per practice for the band and for the
   panel, never the same two. */
const SUB_FAMILIES: Record<string, { band: Family; panel: Family }> = {
  'accounting-tax-services': { band: 'satin', panel: 'pleats' },
  'real-estate-transactions': { band: 'pleats', panel: 'arcs' },
  'mortgages-services': { band: 'arcs', panel: 'satin' },
  'valuation-and-advisory': { band: 'ribbons', panel: 'mesh' },
  'research-intelligence': { band: 'mesh', panel: 'ribbons' },
  'technology-data-ai': { band: 'curtain', panel: 'arcs' },
};

const SUB_TONES: Tone[] = ['royal', 'cobalt', 'electric', 'navy'];

/** 0..1 from a string, stable across builds. */
export function hash01(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 100000) / 100000;
}

/** A family's numbers from two hashes, so two computed specs of one family
    never coincide. `steep` asks the pleats to run upright rather than flat. */
function numbersFor(family: Family, h: number, h2: number, steep: boolean): LiveSpec {
  const tone = SUB_TONES[Math.floor(h2 * SUB_TONES.length)] ?? 'royal';
  const spec: LiveSpec = { family, seed: h, tone };
  switch (family) {
    case 'satin':
      Object.assign(spec, { angle: 8 + h2 * 64, gloss: 22 + h * 30, freq: 1.3 + h2 * 1.2 });
      break;
    case 'pleats':
      Object.assign(spec, { angle: steep ? 55 + h2 * 40 : 4 + h2 * 24, profile: h > 0.5 ? 'sharp' : 'wave', pitch: 0.6 + h2 * 0.9, bend: 0.25 + h * 0.6 });
      break;
    case 'arcs':
      Object.assign(spec, { mode: h2 > 0.5 ? 'rings' : 'fine', count: 3 + Math.floor(h * 5) });
      break;
    case 'ribbons':
      Object.assign(spec, { count: 2 + Math.floor(h2 * 3), width: 0.9 + h * 0.7 });
      break;
    case 'mesh':
      Object.assign(spec, { density: 0.8 + h2 * 0.6, tilt: 0.6 + h * 0.6 });
      break;
    case 'curtain':
      Object.assign(spec, { strands: 180 + Math.floor(h2 * 160), band: 0.4 + h * 0.6 });
      break;
    case 'strata':
      Object.assign(spec, { layers: 6 + Math.floor(h2 * 5) });
      break;
    case 'torus':
      Object.assign(spec, { knot: h > 0.5, anchor: 0.6 + h2 * 0.25 });
      break;
    default:
      break;
  }
  return spec;
}

/** A sub-service page's band or panel: its practice's family, its own numbers. */
export function subServiceSpec(practice: string, slug: string, kind: 'band' | 'panel'): LiveSpec | null {
  const fam = SUB_FAMILIES[practice];
  if (!fam) return null;
  return numbersFor(fam[kind], hash01(`${practice}/${slug}/${kind}`), hash01(`${kind}:${slug}`), kind === 'panel');
}

/* The practice pages' explore decks carry a silk plate on every closed card.
   The families go round in turn from a start the practice picks, so no two
   cards of one deck share a family, and the numbers are the card's own. */
const DECK_FAMILIES: Family[] = ['satin', 'pleats', 'ribbons', 'arcs', 'mesh', 'curtain', 'strata'];

export function deckSpec(practice: string, i: number): LiveSpec {
  const start = Math.floor(hash01(`deck:${practice}`) * DECK_FAMILIES.length);
  const family = DECK_FAMILIES[(start + i) % DECK_FAMILIES.length]!;
  return numbersFor(family, hash01(`deck/${practice}/${i}`), hash01(`${i}:${practice}/deck`), i % 2 === 1);
}

/** Strips the site's base path and any regional override folder, leaving
    the path relative to uploads/. */
function relative(src: string): string | null {
  const m = /\/assets\/content\/uploads\/(?:regions\/[^/]+\/)?(.+?)(?:[?#].*)?$/.exec(src);
  return m ? m[1]! : null;
}

/** The spec for an image, by the file it resolved to. Null for a photograph. */
export function specForSrc(src: string): LiveSpec | null {
  const rel = relative(src);
  if (!rel) return null;
  const key = FILES[rel];
  if (key) return SPECS[key] ?? null;
  const sub = /^services\/sub\/([^/]+)\/(.+)-(band|panel)\.webp$/.exec(rel);
  if (sub) return subServiceSpec(sub[1]!, sub[2]!, sub[3] as 'band' | 'panel');
  return null;
}

/** A spec by name (`deck:<practice>:<n>` for a deck card), or by file when
    `live` is not given. */
export function resolveSpec(live: string | null | undefined, src: string): LiveSpec | null {
  if (live === null) return null;
  if (live) {
    const deck = /^deck:([^:]+):(\d+)$/.exec(live);
    if (deck) return deckSpec(deck[1]!, Number(deck[2]));
    return SPECS[live] ?? null;
  }
  return specForSrc(src);
}
