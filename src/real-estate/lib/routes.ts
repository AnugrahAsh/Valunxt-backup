/**
 * Routing helpers for the Real Estate module.
 *
 * ---------------------------------------------------------------------------
 * HOST INTEGRATION NOTE
 *
 * The module was written standalone against its own locale segments — /ae-en/
 * and /ae-ar/. This site already publishes one edition per market under
 * src/app/[region]/ (/en-in/ and /en-ae/), and Next.js allows only one dynamic
 * name per level, so a second [locale] segment beside [region] is not possible.
 *
 * Rather than mount the module on static segments beside the region tree — which
 * would give the practice its own parallel URL space and two different ideas of
 * "which market am I in" — the module now speaks the host's region language:
 * `Locale` IS the host's RegionSlug, and url() delegates to the site's rurl().
 * That means every link the module renders keeps the visitor in the market they
 * arrived in, exactly like every other link on the site, and there is one
 * prefixing rule in the codebase rather than two.
 *
 * The published URL map is therefore:
 *
 *   L1  /en-ae/real-estate/                            /en-in/real-estate/
 *   L2  /en-ae/real-estate/buy-property/               /en-in/…
 *   L2  /en-ae/real-estate/sell-rent-lease-property/   /en-in/…
 *   L2  /en-ae/real-estate/off-plan-properties/        /en-in/…
 *   L2  …and residential, commercial, mortgage-services,
 *        investment-advisory, valuations-advisory
 *
 * ARABIC. The module shipped an ae-ar edition: RTL layout, a translated nav and
 * page titles, with body copy still in English. This site publishes no Arabic
 * edition, so there is no route for it to live at and dir() answers 'ltr' for
 * both markets today. Nothing was deleted — the AR string table and t() in
 * data/site.ts are intact, and isRtl() below is the single switch. When an
 * Arabic edition is added to the site (a slug in REGIONS in src/lib/region.ts),
 * add it to isRtl() here and the module renders RTL again with no other change.
 * ---------------------------------------------------------------------------
 *
 * Every internal href still goes through `url()`, so the whole tree moves by
 * changing BASE alone. Trailing slashes are always emitted: `trailingSlash` is
 * on in next.config.ts, and a mismatch costs a 308 redirect on every link.
 */
import {
  rurl,
  vxnRegion,
  vxnRegionData,
  vxnRegionExists,
  vxnRegionList,
} from '@/lib/region';
import { AREA_SLUGS, BUILDING_SLUGS } from '../data/locations';
import type { Locale } from './types';

/** Mount point, relative to the region segment. Change here to relocate. */
export const BASE = '/real-estate';

/** Every market the module renders in — the site's own published editions. */
export const LOCALES: Locale[] = vxnRegionList().map((r) => r.slug);

export const DEFAULT_LOCALE: Locale = 'en-ae';

export function isLocale(value: string | undefined): value is Locale {
  return vxnRegionExists(value);
}

/** Falls back rather than throwing: a bad segment should still render a page. */
export function toLocale(value: string | undefined): Locale {
  return vxnRegion(value);
}

/**
 * Writing direction. Drives `dir` on the wrapper and the RTL block in
 * real-estate.css.
 *
 * No published edition is right-to-left today — see the Arabic note at the top
 * of this file. This is the one place to change when one is.
 */
export function isRtl(_locale: Locale): boolean {
  return false;
}

export function dir(locale: Locale): 'ltr' | 'rtl' {
  return isRtl(locale) ? 'rtl' : 'ltr';
}

/** BCP-47 tag for the `lang` attribute — the market's own, from the registry. */
export function lang(locale: Locale): string {
  return vxnRegionData(locale).lang;
}

/**
 * Build an absolute in-app path.
 *
 * `path` is relative to the module root: url('en-ae', '/buy-property/') gives
 * '/en-ae/real-estate/buy-property/'. Pass '/' for the pillar page.
 *
 * Absolute URLs, mailto:, tel: and bare fragments are returned untouched, and a
 * path that already carries a region prefix is left alone — so a link that needs
 * to leave the module (back to /en-ae/contact/, say) still can, by passing the
 * site path through rurl() itself.
 */
export function url(locale: Locale, path = '/'): string {
  if (/^([a-z][a-z0-9+.-]*:|\/\/|#)/i.test(path)) return path;

  /* Split the fragment off before the trailing slash is added. '/#contact' was
     becoming '/en-ae/real-estate/#contact/' — the slash lands after the hash, so
     the fragment is '#contact/', which matches no element and the anchor simply
     does nothing. Every in-page link in the module goes through here. */
  const hash = path.indexOf('#');
  const bare = hash === -1 ? path : path.slice(0, hash);
  const frag = hash === -1 ? '' : path.slice(hash);

  const clean = `/${bare}`.replace(/\/+/g, '/');
  const withSlash = clean.endsWith('/') ? clean : `${clean}/`;

  /* rurl() adds the market prefix and is the site's single prefixing rule; BASE
     is what makes the result land inside this module rather than beside it. */
  return rurl(locale, `${BASE}${withSlash}`) + frag;
}

/**
 * Every L2 service slug, in navigation order.
 *
 * These must stay in step with SERVICE_PAGES in data/pages.ts: the landing page
 * advertises each of these as a service, and a service the site names but cannot
 * open is worse than one it does not mention.
 */
export const SERVICE_SLUGS = [
  'buy-property',
  'sell-rent-lease-property',
  'off-plan-properties',
  'residential',
  'commercial',
  'mortgage-services',
  'investment-advisory',
  'valuations-advisory',
] as const;

export type ServiceSlug = (typeof SERVICE_SLUGS)[number];

/**
 * Does this request path belong to the module?
 *
 * The root layout asks, because these pages render their own chrome and must
 * not be served the site's Elementor stylesheet cascade — see src/app/layout.tsx.
 * It answers for the pillar page, the eight published service pages and the
 * Dubai location pages: an unknown slug under /real-estate/ is a 404, and a
 * 404 renders the site's own NotFoundBody, which needs that cascade.
 *
 * The location slugs are read from the registry rather than restated, so
 * publishing a new area guide or building is still a data edit alone.
 */
export function realEstateRequest(path: string): { region: Locale; slug: string | null } | null {
  const parts = String(path ?? '')
    .split('?')[0]
    .split('#')[0]
    .split('/')
    .filter(Boolean);

  if (!vxnRegionExists(parts[0])) return null;
  if (parts[1] !== 'real-estate') return null;

  if (parts.length === 2) return { region: parts[0], slug: null };
  if (parts.length === 3 && (SERVICE_SLUGS as readonly string[]).includes(parts[2])) {
    return { region: parts[0], slug: parts[2] };
  }

  /* /real-estate/dubai/area-guides/ and /real-estate/dubai/buildings/, with or
     without a location slug. */
  if (parts[2] === 'dubai' && (parts[3] === 'area-guides' || parts[3] === 'buildings')) {
    if (parts.length === 4) return { region: parts[0], slug: parts[3] };
    if (parts.length === 5) {
      const set = parts[3] === 'buildings' ? BUILDING_SLUGS : AREA_SLUGS;
      if (set.includes(parts[4]!)) return { region: parts[0], slug: parts[4]! };
    }
  }
  return null;
}
