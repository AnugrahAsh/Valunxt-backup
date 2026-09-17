/**
 * Valunxt — front-end SEO resolver.
 *
 * Reads the SEO metadata the admin panel manages and merges it over whatever
 * the page declared in its PageConfig. The values come from
 * src/data/seo-map.json, a plain JSON file the admin panel rewrites on every
 * save from `vx_page_seo` — so a page view never opens a database connection
 * and the site keeps rendering normally if MySQL is unavailable.
 *
 * The file is read at request time (checked for changes at most every two
 * seconds), not only bundled at build time, so an SEO edit made in the panel
 * reaches the live site as soon as it is saved. The copy bundled into the
 * build is the fallback when the file cannot be read.
 *
 * Port of includes/seo.php, extended (20260916) with the fields the imported
 * www.valunxt.com panel managed: an Open Graph image, X (Twitter) title,
 * description and image, JSON-LD blocks and FAQ structured data.
 */

import fs from 'node:fs';
import { publicPathFor } from './route-aliases';
import path from 'node:path';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import bundledSeoMap from '@/data/seo-map.json';
import { BASE, vxnRegionExists, vxnRegionList, vxnRegionData, rswap } from './region';
import { pageConfig } from './pages';
import type { PageConfig } from './page-config';

export interface SeoRow {
  title?: string;
  description?: string;
  canonical?: string;
  robots?: string;
  keywords?: string;
  og_title?: string;
  og_description?: string;
  og_image?: string;
  twitter_title?: string;
  twitter_description?: string;
  twitter_image?: string;
  /** JSON-LD documents, each as JSON text. */
  schema?: string[];
  faq?: Array<{ q: string; a: string }>;
}

let mapCache: { map: Record<string, SeoRow>; mtime: number; checkedAt: number } = {
  map: bundledSeoMap as Record<string, SeoRow>,
  mtime: 0,
  checkedAt: 0,
};

/** The generated SEO map — the file on disk when it can be read, else the bundled copy. */
export function vxnSeoMap(): Record<string, SeoRow> {
  const now = Date.now();
  if (now - mapCache.checkedAt < 2000) return mapCache.map;
  mapCache.checkedAt = now;
  try {
    const file = path.join(process.cwd(), 'src', 'data', 'seo-map.json');
    const mtime = fs.statSync(file).mtimeMs;
    if (mtime !== mapCache.mtime) {
      mapCache = { map: JSON.parse(fs.readFileSync(file, 'utf8')) as Record<string, SeoRow>, mtime, checkedAt: now };
    }
  } catch {
    /* keep the map already held: the bundled one, or the last good read */
  }
  return mapCache.map;
}

/** Normalise "/about/careers/" to the "about/careers" key used in the map. */
export function vxnSeoKey(p: string): string {
  return String(p ?? '').replace(/^\/+|\/+$/g, '');
}

/**
 * The admin-managed row for a path, region-aware.
 *
 * The CMS keys pages by their unprefixed path ("services", "about/careers")
 * because that is the page that actually exists; the country editions put a
 * prefix in front of it. So: look for a row keyed to this exact URL first —
 * that is how a market gets its own title — and fall back to the shared row for
 * the same page underneath.
 *
 * The one path that must not fall back blindly is a region home: "en-ae" and ""
 * are different pages, not the same page in two markets. Only the India home
 * inherits the legacy home row, because it *is* the page that used to live at
 * the root; the UAE home falls back to its own PageConfig values until the CMS
 * is given an "en-ae" row.
 */
export function vxnSeoResolveRow(p: string): SeoRow {
  const map = vxnSeoMap();
  const key = vxnSeoKey(p);
  if (Object.prototype.hasOwnProperty.call(map, key)) return map[key];

  const first = key.split('/')[0];
  if (vxnRegionExists(first)) {
    const rest = key.slice(first.length + 1);
    if (rest !== '') return map[rest] ?? {};
    if (first === 'en-in') return map[''] ?? {};
  }
  return {};
}

/**
 * Scheme + host for the site, as a static fallback — used for `metadataBase`
 * and anywhere the request is not in scope. Set NEXT_PUBLIC_SITE_ORIGIN to
 * pin it for a given deployment.
 */
export function vxnSeoOrigin(): string {
  const env =
    process.env.NEXT_PUBLIC_SITE_ORIGIN ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '');
  return (env || 'https://valunxt.com').replace(/\/+$/, '');
}

/**
 * Scheme + host for the current request — what PHP read off $_SERVER['HTTPS']
 * and $_SERVER['HTTP_HOST']. Falls back to vxnSeoOrigin() when there is no
 * request (a build-time render).
 */
export async function vxnRequestOrigin(): Promise<string> {
  try {
    const h = await headers();
    const host = h.get('x-forwarded-host') ?? h.get('host');
    if (!host) return vxnSeoOrigin();
    const proto = h.get('x-forwarded-proto') ?? (host.startsWith('localhost') || host.startsWith('127.') ? 'http' : 'https');
    return `${proto}://${host}`;
  } catch {
    return vxnSeoOrigin();
  }
}

const ROBOTS_ALLOWED = [
  'index, follow',
  'noindex, follow',
  'index, nofollow',
  'noindex, nofollow',
] as const;

/** Allowed robots directives. Anything else falls back to "index, follow". */
export function vxnSeoRobotsOk(value: string): boolean {
  return (ROBOTS_ALLOWED as readonly string[]).includes(value);
}

export interface ResolvedSeo {
  title: string;
  description: string;
  canonical: string;
  robots: string;
  keywords: string;
  og_title: string;
  og_description: string;
  og_image: string;
  twitter_title: string;
  twitter_description: string;
  twitter_image: string;
}

/** A market-prefixed path for a page reached through a country edition. */
function marketPathFor(page: PageConfig, region: string): string {
  let p = String(page.path ?? '/');
  // A shared page still declares its unprefixed path ("/services/"), but when
  // it was reached through a country edition the canonical URL — and the row
  // the CMS may have for that market — is the prefixed one.
  if (region !== '' && !p.startsWith('/' + region)) {
    p = '/' + region + (p === '' ? '/' : p);
  }
  return p;
}

/**
 * Resolve the SEO values for a page.
 *
 * Precedence: admin-managed value → the page's own PageConfig value →
 * a sensible site-wide default.
 */
export function vxnSeo(page: PageConfig, region: string, origin = vxnSeoOrigin()): ResolvedSeo {
  const p = marketPathFor(page, region);
  const seo = vxnSeoResolveRow(p);
  /* The address the page is PUBLISHED at, where the client's sheet gives it a
     flat one (lib/route-aliases.ts); the SEO row above is still looked up by
     the built path, which is what the CMS keys on. */
  const fallbackCanonical = origin + BASE + (publicPathFor(p) ?? (p !== '' ? p : '/'));

  let title = (seo.title ?? '').trim();
  if (title === '') title = (page.title ?? '').trim();
  if (title === '') title = 'Valunxt';

  let desc = (seo.description ?? '').trim();
  if (desc === '') desc = (page.desc ?? '').trim();

  let canonical = (seo.canonical ?? '').trim();
  if (canonical === '') canonical = fallbackCanonical;

  // A page outside the CMS (the 404 template, for instance) can still set its
  // own directive with page.robots.
  let robots = (seo.robots ?? '').trim();
  if (!vxnSeoRobotsOk(robots)) robots = (page.robots ?? '').trim();
  if (!vxnSeoRobotsOk(robots)) robots = 'index, follow';

  const ogTitle = (seo.og_title ?? '').trim() || title;
  const ogDesc = (seo.og_description ?? '').trim() || desc;
  const ogImage = (seo.og_image ?? '').trim() || (page.og_image ? BASE + page.og_image : '');

  return {
    title,
    description: desc,
    canonical,
    robots,
    keywords: (seo.keywords ?? '').trim(),
    og_title: ogTitle,
    og_description: ogDesc,
    og_image: ogImage,
    twitter_title: (seo.twitter_title ?? '').trim() || ogTitle,
    twitter_description: (seo.twitter_description ?? '').trim() || ogDesc,
    twitter_image: (seo.twitter_image ?? '').trim() || ogImage,
  };
}

/** Structured data for a page: the admin-managed JSON-LD blocks and FAQ. */
export function vxnSeoStructuredData(page: PageConfig, region: string): { schema: string[]; faq: SeoRow['faq'] } {
  const row = vxnSeoResolveRow(marketPathFor(page, region));
  return {
    schema: Array.isArray(row.schema) ? row.schema.filter((b) => typeof b === 'string' && b.trim() !== '') : [],
    faq: Array.isArray(row.faq) ? row.faq.filter((f) => f && f.q && f.a) : [],
  };
}

/**
 * What a caller can set over the page's resolved values — a blog post, whose
 * SEO lives on its own row rather than in the page map.
 */
export interface SeoOverrides {
  title?: string;
  description?: string;
  canonical?: string;
  robots?: string;
  keywords?: string;
  og_title?: string;
  og_description?: string;
  og_image?: string;
  og_type?: 'website' | 'article';
  twitter_card?: 'summary' | 'summary_large_image';
  twitter_title?: string;
  twitter_description?: string;
  twitter_image?: string;
  published_time?: string;
  modified_time?: string;
}

/** An absolute URL for an image path, on the request's own origin. */
function absolute(origin: string, src: string): string {
  if (!src) return '';
  return /^https?:\/\//i.test(src) ? src : origin + (src.startsWith('/') ? src : '/' + src);
}

/**
 * The Next.js Metadata object for a page, carrying exactly the tags
 * includes/head.php emitted: title, description, keywords, robots, canonical,
 * the per-market hreflang alternates, Open Graph and Twitter.
 */
export async function buildMetadata(page: PageConfig, region: string, over: SeoOverrides = {}): Promise<Metadata> {
  const origin = await vxnRequestOrigin();
  const base = vxnSeo(page, region, origin);
  const pick = (v: string | undefined, fallback: string) => (v !== undefined && v.trim() !== '' ? v.trim() : fallback);

  const title = pick(over.title, base.title);
  const description = pick(over.description, base.description);
  const robots = over.robots && vxnSeoRobotsOk(over.robots.trim()) ? over.robots.trim() : base.robots;
  const ogTitle = pick(over.og_title, over.title ? title : base.og_title);
  const ogDesc = pick(over.og_description, over.description ? description : base.og_description);
  const ogImage = absolute(origin, pick(over.og_image, base.og_image));
  const seo = {
    ...base,
    title,
    description,
    canonical: pick(over.canonical, base.canonical),
    robots,
    keywords: pick(over.keywords, base.keywords),
    og_title: ogTitle,
    og_description: ogDesc,
    twitter_title: pick(over.twitter_title, over.og_title || over.title ? ogTitle : base.twitter_title),
    twitter_description: pick(over.twitter_description, over.og_description || over.description ? ogDesc : base.twitter_description),
    twitter_image: absolute(origin, pick(over.twitter_image, pick(over.og_image, base.twitter_image))),
  };

  // Country editions: tell search engines that this page exists once per
  // market, and which one this URL is. x-default points at the gateway, which
  // routes the visitor to their own edition.
  //
  // The address inside a market, without the market: a home page declares its
  // own prefix ('/en-ae/'), and swapping a market onto that gave /en-in/en-ae/.
  const declared = String(page.path ?? '/') || '/';
  const first = declared.split('/')[1] ?? '';
  const regionPath = vxnRegionExists(first) ? declared.slice(first.length + 1) || '/' : declared;
  // Only markets that publish a page at this address. A page restricted to some
  // markets still has a twin wherever the registry itself declares the address
  // (the UAE's /services/research-intelligence/ and India's).
  const markets = vxnRegionList().filter(
    (r) => !page.regions || page.regions.includes(r.slug) || pageConfig(regionPath) !== null,
  );
  const languages: Record<string, string> = {};
  if (markets.length > 1) {
    for (const r of markets) {
      languages[r.lang] = origin + rswap(r.slug, regionPath);
    }
    languages['x-default'] = origin + BASE + '/';
  }

  const meta: Metadata = {
    title: seo.title,
    ...(seo.description !== '' ? { description: seo.description } : {}),
    ...(seo.keywords !== '' ? { keywords: seo.keywords } : {}),
    robots: seo.robots,
    alternates: {
      canonical: seo.canonical,
      ...(markets.length > 1 ? { languages } : {}),
    },
    openGraph: {
      locale: vxnRegionData(region).lang.replace('-', '_'),
      type: over.og_type ?? 'website',
      title: seo.og_title,
      ...(seo.og_description !== '' ? { description: seo.og_description } : {}),
      url: seo.canonical,
      siteName: 'Valunxt',
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
      ...(over.og_type === 'article' && over.published_time ? { publishedTime: over.published_time } : {}),
      ...(over.og_type === 'article' && over.modified_time ? { modifiedTime: over.modified_time } : {}),
    },
    twitter: {
      card: over.twitter_card ?? 'summary_large_image',
      title: seo.twitter_title,
      ...(seo.twitter_description !== '' ? { description: seo.twitter_description } : {}),
      ...(seo.twitter_image ? { images: [seo.twitter_image] } : {}),
    },
  };

  return meta;
}
