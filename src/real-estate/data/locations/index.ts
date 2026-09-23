/**
 * DUBAI LOCATION PAGES — the area guides and the building pages.
 *
 * One record per published location, one template behind all of them
 * (components/location/LocationBody.tsx), so a new area or building is an
 * entry in ./areas.ts or ./buildings.ts and nothing else. The URL map is:
 *
 *   /{region}/real-estate/dubai/area-guides/           the directory
 *   /{region}/real-estate/dubai/area-guides/<slug>/    one community
 *   /{region}/real-estate/dubai/buildings/             the directory
 *   /{region}/real-estate/dubai/buildings/<slug>/      one building
 *
 * WHAT IS WRITTEN AND WHAT IS INDICATIVE. The prose — where a district sits,
 * what it is made of, who it suits, what to check before committing — is the
 * desk's own guidance and reads as editorial. Every FIGURE on these pages is
 * an indicative market band, labelled as one on screen and carrying the
 * module's standard note (PRICE_NOTE in ../market.ts). None of it is a
 * valuation of a specific property, and the pages say so.
 *
 * TENURE IS NEVER GUESSED. Freehold eligibility in Dubai is set per plot, not
 * per district, and getting it wrong is the one mistake on a page like this
 * that costs a buyer real money. So `tenure` carries what is known and,
 * wherever the answer varies inside the district, says so and points at the
 * title check the desk runs before an offer.
 */
import type { Listing } from '../../lib/types';
import { AREA_GUIDES } from './areas';
import { BUILDINGS } from './buildings';

export type LocationKind = 'area' | 'building';

/** Tenure as it is stated to a buyer, never inferred from the district. */
export type Tenure = 'Freehold' | 'Leasehold' | 'Mixed';

/** A compact stock row. One row becomes a sale listing, a rental listing, or
    both, depending on which prices it carries — see listingsFor(). */
export interface StockRow {
  type: 'Apartment' | 'Villa' | 'Townhouse' | 'Penthouse' | 'Office' | 'Retail' | 'Warehouse';
  /** 0 for a studio. */
  beds: number;
  baths: number;
  sqft: number;
  /** AED, indicative guide price. Omit where the desk does not quote a sale. */
  buy?: number;
  /** AED per year, indicative. Omit where the desk does not quote a let. */
  rent?: number;
  /** File stem under /real-estate/listings/. The cover; `also` follows it. */
  img: string;
  also?: string[];
  tags: string[];
  /** One sentence, this property's own. */
  summary: string;
  features: string[];
}

export interface LocationPage {
  slug: string;
  kind: LocationKind;
  /** "Al Barsha 1", "Sama Tower". */
  name: string;
  /** The district a building sits in, or the wider sector an area belongs to. */
  sector: string;
  /** The line under the title. Six to ten words. */
  tagline: string;
  /** Hero photograph, a path under /real-estate/listings/ or /real-estate/img/. */
  image: string;
  lat: number;
  lng: number;
  /**
   * How precise the pin is. 'plot' means it marks the building itself;
   * 'district' means the desk has not yet confirmed the exact plot and the
   * pin marks the district, which the map says on screen. A wrong pin on a
   * building page is worse than an honest approximate one.
   */
  locate?: 'plot' | 'district';
  tenure: Tenure;
  /** What the tenure line says on screen, in full. */
  tenureNote: string;
  /** Two or three paragraphs. The page's own voice. */
  intro: string[];
  /** The four figures under the hero. Indicative. */
  stats: { value: string; label: string; detail?: string }[];
  /** What the place is actually like, four to six of them. */
  highlights: { title: string; body: string }[];
  /** Who it suits, as short phrases. */
  suits: string[];
  /** Drive times. Minutes are typical off-peak. */
  connections: { to: string; minutes: string }[];
  /** Everyday life: schools, retail, parks, healthcare. */
  living: { title: string; items: string[] }[];
  /** The investment read. */
  invest: { body: string; points: string[] };
  /** Indicative bands by property type. */
  prices: { type: string; sale: string; rent: string }[];
  /** What the desk checks here before a client commits. */
  checks: string[];
  faqs: { q: string; a: string }[];
  /** Slugs of the locations offered at the foot. */
  nearby: string[];
  /** Up to four stock rows. */
  stock: StockRow[];
  /** Meta description. The title is built from the name. */
  seoDesc: string;
  /** Buildings only: the rows that are known. Anything unknown is omitted
      rather than invented — see the header. */
  facts?: { label: string; value: string }[];
  /** Buildings only. */
  amenities?: string[];
}

export const AREA_GUIDE_BASE = '/dubai/area-guides';
export const BUILDING_BASE = '/dubai/buildings';

export const LOCATIONS: LocationPage[] = [...AREA_GUIDES, ...BUILDINGS];

export const AREA_SLUGS = AREA_GUIDES.map((l) => l.slug);
export const BUILDING_SLUGS = BUILDINGS.map((l) => l.slug);

const BY_SLUG = new Map(LOCATIONS.map((l) => [l.slug, l] as const));

export function locationBySlug(kind: LocationKind, slug: string): LocationPage | null {
  const hit = BY_SLUG.get(slug);
  return hit && hit.kind === kind ? hit : null;
}

/** The module-relative path for a location, for url(). */
export function locationPath(loc: Pick<LocationPage, 'kind' | 'slug'>): string {
  return `${loc.kind === 'building' ? BUILDING_BASE : AREA_GUIDE_BASE}/${loc.slug}/`;
}

export { AREA_GUIDES, BUILDINGS };

/* -------------------------------------------------------------------------
   Stock rows to listings
   ------------------------------------------------------------------------- */

const PH = (name: string) => `/real-estate/listings/${name}.webp`;

const aed = (n: number) =>
  n >= 1_000_000 ? `AED ${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 2)}M` : `AED ${Math.round(n / 1000)}K`;

const bedLabel = (n: number) => (n === 0 ? 'Studio' : `${n} bed${n === 1 ? '' : 's'}`);

/** A stable reference per location and row, so the same card always shows the
    same reference; the desk quotes it back when a client calls. */
function ref(loc: LocationPage, i: number, mode: 'S' | 'R'): string {
  let h = 0;
  for (const ch of loc.slug) h = (h * 31 + ch.charCodeAt(0)) % 9000;
  return `VX-${mode}-${1000 + h + i}`;
}

function title(row: StockRow, loc: LocationPage): string {
  const what = row.beds === 0 ? 'Studio' : `${row.beds}-Bed ${row.type}`;
  return `${what} in ${loc.name}`;
}

function one(loc: LocationPage, row: StockRow, i: number, mode: 'S' | 'R'): Listing {
  const value = mode === 'S' ? row.buy! : row.rent!;
  return {
    id: ref(loc, i, mode),
    title: title(row, loc),
    community: loc.name,
    type: row.type,
    price: aed(value),
    value,
    priceNote: mode === 'S' ? 'guide price' : 'per year',
    beds: bedLabel(row.beds),
    baths: `${row.baths} bath${row.baths === 1 ? '' : 's'}`,
    area: `${row.sqft.toLocaleString('en-US')} sq ft`,
    status: mode === 'S' ? 'Ready' : 'Available now',
    images: [PH(row.img), ...(row.also ?? []).map(PH)],
    tags: row.tags,
    summary: row.summary,
    features: row.features,
    facts: [
      { label: 'Tenure', value: loc.tenure === 'Mixed' ? 'Confirmed per unit' : loc.tenure },
      { label: mode === 'S' ? 'Indicative gross yield' : 'Cheques', value: mode === 'S' ? yieldOf(loc, row) : '1 to 4' },
    ],
  };
}

/** Gross yield from this location's own two bands, where both are quoted. */
function yieldOf(loc: LocationPage, row: StockRow): string {
  if (!row.buy || !row.rent) return 'On enquiry';
  return `~${((row.rent / row.buy) * 100).toFixed(1)}%`;
}

/**
 * The listing groups a location page shows: what is for sale, what is to let.
 * A group with nothing in it is dropped, so a district the desk only lets
 * shows one tab rather than an empty one.
 */
export function listingsFor(loc: LocationPage): { key: string; label: string; items: Listing[] }[] {
  const sale = loc.stock.filter((r) => r.buy).map((r, i) => one(loc, r, i, 'S'));
  const rent = loc.stock.filter((r) => r.rent).map((r, i) => one(loc, r, i, 'R'));
  const groups: { key: string; label: string; items: Listing[] }[] = [];
  if (sale.length) groups.push({ key: 'sale', label: 'For sale', items: sale });
  if (rent.length) groups.push({ key: 'rent', label: 'For rent', items: rent });
  return groups;
}

/** The locations offered at the foot of a page, resolved and filtered. */
export function nearbyOf(loc: LocationPage): LocationPage[] {
  return loc.nearby.map((s) => BY_SLUG.get(s)).filter((x): x is LocationPage => !!x && x.slug !== loc.slug);
}
