/**
 * Valunxt — SEO & Sitemap library.
 *
 * Everything the admin panel needs to manage per-page SEO metadata, page slugs
 * and the XML sitemap, so the individual admin screens stay thin. Nothing here
 * renders anything.
 *
 * Data model (the imported www.valunxt.com schema, see schema.ts)
 *   vx_page_seo      one row per public page, keyed by rel_path — the key the
 *                    front-end SEO map uses ('' = India home, 'en-ae' = UAE home,
 *                    'about' = a page both markets publish, 'en-ae/services/…' =
 *                    UAE only). Rows imported from the previous site keep their
 *                    old keys ('about.html') until an administrator retires them.
 *   vx_settings      key/value store (site URL, last sitemap run, …)
 *   vx_sitemap_urls  the URL set of the sitemap as last generated
 *   vx_sitemap_runs  one row per generation: how many URLs were added, removed
 *                    or modified since the one before
 *
 * Generated artefacts
 *   public/sitemap.xml       XML Sitemap protocol 0.9, one entry per page per market
 *   src/data/seo-map.json    the map the public front end reads, so a page view
 *                            never opens a database connection
 *
 * The rest of the panel works with PageRow, whose field names predate the
 * import (slug, meta_description, robots_meta…). PAGE_SELECT maps the imported
 * columns onto them in one place, so the screens did not all have to change.
 */
import 'server-only';
import fs from 'node:fs/promises';
import path from 'node:path';

import { db, execute, query } from './db';
import { SITE_BASE } from './config';
import {
  SEO_MAP_HASH_KEY,
  SITEMAP_STALE_KEY,
  seoMapHash,
  seoMapPath,
  syncSitePages,
  type MapRow,
} from './seo-import';
import { publishedSlugs } from '@/lib/blog/db';
import { publicFilesIn } from '@/lib/public-files';
import { vxnRegionData, vxnRegionList, type RegionSlug } from '@/lib/region';
import {
  marketPath,
  reservedCmsSlug,
  sitePageBySlug,
  sitePageRank,
  sitePages,
  type SitePage,
} from '@/lib/site-pages';

export { reservedCmsSlug };

/** The public address the panel builds absolute URLs on when none is configured. */
export const DEFAULT_SITE_ORIGIN = 'https://valunxt.com';

/** vx_settings keys the sitemap screens read. The first is the imported panel's own. */
export const SITEMAP_GENERATED_KEY = 'sitemap_last_generated';
export const SITEMAP_COUNT_KEY = 'sitemap_url_count';

/* ---------------------------------------------------------------------------
 * Paths & constants
 * ------------------------------------------------------------------------ */

/** The project root — where public/ and src/ live. */
export function seoRoot(): string {
  return process.cwd();
}

/** Absolute path of the generated sitemap. */
export function seoSitemapPath(): string {
  return path.join(seoRoot(), 'public', 'sitemap.xml');
}

/** Absolute path of the front-end SEO cache written on every save. */
export function seoCachePath(): string {
  return seoMapPath();
}

/** Allowed robots directives, in the order shown in the admin UI. */
export const ROBOTS_OPTIONS = [
  'index, follow',
  'noindex, follow',
  'index, nofollow',
  'noindex, nofollow',
] as const;

/** Allowed sitemap change frequencies. */
export const CHANGEFREQ_OPTIONS = [
  'always',
  'hourly',
  'daily',
  'weekly',
  'monthly',
  'yearly',
  'never',
] as const;

/* ---------------------------------------------------------------------------
 * Settings
 * ------------------------------------------------------------------------ */

export async function seoSettingsAll(): Promise<Record<string, string>> {
  const out: Record<string, string> = {};
  try {
    for (const r of await query<{ k: string; v: string | null }>('SELECT k, v FROM vx_settings')) {
      out[r.k] = r.v ?? '';
    }
  } catch {
    /* table not ready yet */
  }
  return out;
}

export async function seoSetting(key: string, fallback = ''): Promise<string> {
  const all = await seoSettingsAll();
  return all[key] !== undefined && all[key] !== '' ? all[key] : fallback;
}

export async function seoSettingSet(key: string, value: string): Promise<void> {
  await execute('INSERT INTO vx_settings (k, v) VALUES (?, ?) ON DUPLICATE KEY UPDATE v = VALUES(v)', [
    key,
    String(value),
  ]);
}

/**
 * Best-guess public site URL, when none is configured.
 *
 * A local address is never the public one, so a request from localhost does not
 * count: generating the sitemap from a development server used to write
 * http://localhost:3000 URLs into the committed public/sitemap.xml.
 */
export function seoDetectSiteUrl(requestOrigin = ''): string {
  const local = /^https?:\/\/(localhost|127\.|\[::1\]|0\.0\.0\.0)/i.test(requestOrigin);
  if (requestOrigin && !local) return requestOrigin.replace(/\/+$/, '') + SITE_BASE;
  const env =
    process.env.NEXT_PUBLIC_SITE_ORIGIN ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '');
  return (env || DEFAULT_SITE_ORIGIN).replace(/\/+$/, '') + SITE_BASE;
}

/** Configured public site URL (no trailing slash). */
export async function seoSiteUrl(requestOrigin = ''): Promise<string> {
  const url = (await seoSetting('site_url', '')).trim();
  return (url !== '' ? url : seoDetectSiteUrl(requestOrigin)).replace(/\/+$/, '');
}

/* ---------------------------------------------------------------------------
 * Slugs
 * ------------------------------------------------------------------------ */

/** Turn arbitrary text into a single URL-safe slug segment. */
export function seoSlugifySegment(text: string): string {
  let t = String(text);
  // Strip a trailing "| Site Name" suffix that page titles commonly carry.
  t = t.replace(/\s*[|–—-]\s*Valunxt.*$/iu, '');
  // Fold accents the way iconv//TRANSLIT did.
  t = t.normalize('NFKD').replace(/[̀-ͯ]/g, '');
  t = t.toLowerCase();
  t = t.replace(/&/g, ' and ');
  t = t.replace(/[^a-z0-9]+/g, '-');
  return t.replace(/^-+|-+$/g, '');
}

/**
 * Normalise a full path slug: "About/ Careers " → "about/careers".
 * An empty result means the home page.
 */
export function seoNormalizeSlug(slug: string): string {
  return String(slug)
    .split('/')
    .map(seoSlugifySegment)
    .filter((s) => s !== '')
    .join('/');
}

/** Whether a slug is already taken by another page. */
export async function seoSlugTaken(slug: string, exceptId = 0): Promise<boolean> {
  const rows = await query<{ n: number }>('SELECT COUNT(*) AS n FROM vx_page_seo WHERE rel_path = ? AND id <> ?', [
    slug,
    exceptId,
  ]);
  return Number(rows[0]?.n ?? 0) > 0;
}

/* ---------------------------------------------------------------------------
 * Rows
 * ------------------------------------------------------------------------ */

export interface PageRow {
  id: number;
  title: string;
  /** vx_page_seo.rel_path */
  slug: string;
  file_path: string;
  meta_title: string;
  /** vx_page_seo.meta_desc */
  meta_description: string | null;
  /** vx_page_seo.canonical */
  canonical_url: string;
  /** vx_page_seo.keywords */
  meta_keywords: string;
  /** vx_page_seo.robots */
  robots_meta: string;
  og_title: string;
  /** vx_page_seo.og_desc */
  og_description: string | null;
  og_image: string;
  tw_title: string;
  tw_desc: string;
  tw_image: string;
  focus_kw: string;
  h1: string;
  /** JSON array of JSON-LD blocks, as the imported panel stored them. */
  schema_jsonld: string | null;
  /** JSON array of { q, a }. */
  faq_json: string | null;
  updated_by: string | null;
  status: string;
  in_sitemap: number;
  priority: string;
  changefreq: string;
  is_cms: number;
  /** The banner behind a CMS page's breadcrumb hero. */
  hero_image: string;
  created_at: string | null;
  updated_at: string;
}

/** Every PageRow field, read from the imported columns. */
const PAGE_SELECT = `SELECT id, title, rel_path AS slug, file_path,
       COALESCE(meta_title, '') AS meta_title, meta_desc AS meta_description,
       COALESCE(canonical, '') AS canonical_url, COALESCE(keywords, '') AS meta_keywords,
       COALESCE(NULLIF(robots, ''), 'index, follow') AS robots_meta,
       COALESCE(og_title, '') AS og_title, og_desc AS og_description, COALESCE(og_image, '') AS og_image,
       COALESCE(tw_title, '') AS tw_title, COALESCE(tw_desc, '') AS tw_desc, COALESCE(tw_image, '') AS tw_image,
       COALESCE(focus_kw, '') AS focus_kw, COALESCE(h1, '') AS h1, schema_jsonld, faq_json, updated_by,
       status, in_sitemap, priority, changefreq, is_cms, hero_image, created_at, updated_at
  FROM vx_page_seo`;

/* ---------------------------------------------------------------------------
 * Where a row's page lives
 * ------------------------------------------------------------------------ */

export interface PagePlacement {
  /** Built into the website's code, rather than created in the panel. */
  builtIn: boolean;
  /** The website publishes it. False for a built-in row whose page has gone. */
  exists: boolean;
  /**
   * Imported from the previous www.valunxt.com site: a row with no file_path
   * (nothing in this build declares its page), describing a page the new site
   * replaced.
   */
  legacy: boolean;
  /** The address inside a market: '/about/', '/' for a home. */
  path: string;
  /** The markets that publish it. */
  regions: RegionSlug[];
  /** The published page, for a built-in row. */
  site?: SitePage;
}

const ALL_REGIONS: RegionSlug[] = vxnRegionList().map((r) => r.slug);

/** Where the page behind a row is published. */
export function seoPlacement(row: Pick<PageRow, 'slug' | 'is_cms'> & { file_path?: string }): PagePlacement {
  const slug = String(row.slug ?? '');
  const site = sitePageBySlug(slug);
  if (site) return { builtIn: true, exists: true, legacy: false, path: site.path, regions: site.regions, site };
  const cmsPath = `/${slug.replace(/^\/+|\/+$/g, '')}/`;
  // A page created in the panel is served by the CMS catch-all in every market.
  if (Number(row.is_cms) === 1) {
    return { builtIn: false, exists: true, legacy: false, path: cmsPath, regions: ALL_REGIONS };
  }
  const legacy = row.file_path !== undefined && String(row.file_path) === '';
  return { builtIn: true, exists: false, legacy, path: cmsPath, regions: [] };
}

/** Whether the page behind a row still exists on the site. */
export function seoPageExists(row: Pick<PageRow, 'slug' | 'is_cms'>): boolean {
  return seoPlacement(row).exists;
}

/**
 * The page of the new site an imported row's canonical URL points at — the page
 * that replaced it — or null. The import rewrote those canonicals onto the new
 * routes, so the row can say where its values now belong.
 */
export function seoLegacyReplacement(row: Pick<PageRow, 'canonical_url'>): SitePage | null {
  const canon = String(row.canonical_url ?? '').trim();
  if (!canon) return null;
  let p: string;
  try {
    p = new URL(canon).pathname;
  } catch {
    return null;
  }
  const parts = p.split('/').filter(Boolean);
  const region = parts[0];
  if (!region || !(ALL_REGIONS as string[]).includes(region)) return null;
  const rest = parts.slice(1).join('/');
  const inMarket = rest === '' ? (region === 'en-in' ? '' : region) : rest;
  return sitePageBySlug(inMarket) ?? sitePageBySlug(`${region}/${rest}`) ?? null;
}

export interface MarketLink {
  region: RegionSlug;
  /** "IN", "AE" */
  code: string;
  /** "India", "UAE" */
  label: string;
  /** '/en-in/about/' — relative, so it opens on whichever host the panel is on. */
  path: string;
}

/** The page's address in each market that publishes it. */
export function seoMarketLinks(row: Pick<PageRow, 'slug' | 'is_cms'>): MarketLink[] {
  const place = seoPlacement(row);
  return place.regions.map((region) => {
    const r = vxnRegionData(region);
    return { region, code: r.code, label: r.short ?? r.name, path: marketPath(region, place.path) };
  });
}

/** What the page itself declares, for the editor's placeholders. */
export function seoPageDefaults(row: Pick<PageRow, 'slug' | 'is_cms' | 'title'>): { title: string; desc: string } {
  const site = seoPlacement(row).site;
  return {
    title: site?.title ?? (String(row.title ?? '').trim() ? `${String(row.title).trim()} | Valunxt` : 'Valunxt'),
    desc: site?.desc ?? '',
  };
}

/**
 * Bring the table in line with the pages the website publishes: add rows for
 * new pages, remove sync-managed rows whose page has gone. Pages created in the
 * panel, and rows imported from the previous site, are never touched.
 */
export async function seoSyncPages(): Promise<{ added: number; removed: number; total: number }> {
  const res = await syncSitePages(await db(), true);
  return res ?? { added: 0, removed: 0, total: sitePages().length };
}

/* ---------------------------------------------------------------------------
 * Structured data fields
 * ------------------------------------------------------------------------ */

/** The JSON-LD blocks of a row: an array of JSON documents, each kept as text. */
export function seoSchemaBlocks(raw: string | null | undefined): string[] {
  if (!raw || !String(raw).trim()) return [];
  try {
    const parsed = JSON.parse(String(raw));
    if (Array.isArray(parsed)) return parsed.map((b) => (typeof b === 'string' ? b : JSON.stringify(b))).filter((b) => b.trim());
    return [JSON.stringify(parsed)];
  } catch {
    return [String(raw)];
  }
}

/** The FAQ pairs of a row. Malformed JSON reads as no FAQ. */
export function seoFaq(raw: string | null | undefined): Array<{ q: string; a: string }> {
  if (!raw || !String(raw).trim()) return [];
  try {
    const parsed = JSON.parse(String(raw));
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((f) => ({ q: String(f?.q ?? '').trim(), a: String(f?.a ?? '').trim() }))
      .filter((f) => f.q && f.a);
  } catch {
    return [];
  }
}

/* ---------------------------------------------------------------------------
 * Effective (resolved) SEO values
 * ------------------------------------------------------------------------ */

export interface EffectiveSeo {
  title: string;
  description: string;
  canonical: string;
  robots: string;
  keywords: string;
  og_title: string;
  og_description: string;
  url: string;
}

/** Apply the documented fallbacks to a raw row. */
export async function seoEffective(row: PageRow, requestOrigin = ''): Promise<EffectiveSeo> {
  let metaTitle = String(row.meta_title ?? '').trim();
  const metaDesc = String(row.meta_description ?? '').trim();
  let canonical = String(row.canonical_url ?? '').trim();
  let robots = String(row.robots_meta ?? '').trim();
  let ogTitle = String(row.og_title ?? '').trim();
  let ogDesc = String(row.og_description ?? '').trim();

  const first = seoMarketLinks(row)[0];
  const url = (await seoSiteUrl(requestOrigin)) + (first ? first.path : '/');

  // Blank means "what the page itself says": its own title for a built-in page,
  // "<name> | Valunxt" for one created here (what the CMS catch-all renders).
  if (metaTitle === '') metaTitle = seoPageDefaults(row).title;
  if (canonical === '') canonical = url;
  if (!(ROBOTS_OPTIONS as readonly string[]).includes(robots)) robots = 'index, follow';
  if (ogTitle === '') ogTitle = metaTitle;
  if (ogDesc === '') ogDesc = metaDesc;

  return {
    title: metaTitle,
    description: metaDesc,
    canonical,
    robots,
    keywords: String(row.meta_keywords ?? '').trim(),
    og_title: ogTitle,
    og_description: ogDesc,
    url,
  };
}

/* ---------------------------------------------------------------------------
 * Sitemap generation
 * ------------------------------------------------------------------------ */

/** Rows in the order the site is organised: homes, pages, insights, research, services, UAE services. */
function bySiteOrder(a: PageRow, b: PageRow): number {
  return sitePageRank(String(a.slug)) - sitePageRank(String(b.slug)) || String(a.slug).localeCompare(String(b.slug));
}

/**
 * Rows eligible for the sitemap: published, included, not noindex — and still
 * a page on the website. A row whose page has gone would otherwise list a URL
 * that answers 404.
 */
export async function seoSitemapRows(): Promise<PageRow[]> {
  const rows = await query<PageRow>(
    `${PAGE_SELECT}
      WHERE status = 'published'
        AND in_sitemap = 1
        AND COALESCE(robots, 'index, follow') NOT LIKE 'noindex%'`
  );
  return rows.filter(seoPageExists).sort(bySiteOrder);
}

export interface SitemapUrl {
  loc: string;
  region: RegionSlug | null;
  /** hreflang → href: this address in every market that publishes it, plus x-default. */
  alternates: Array<[string, string]>;
}

/**
 * The sitemap entries for one page.
 *
 * Every public page lives under a market prefix (/en-in/…, /en-ae/…) and the
 * unprefixed URL only redirects, so a page is listed once per market that
 * publishes it. Where more than one market publishes the same address — a
 * shared page, the two homes, India's and the UAE's Research & Intelligence —
 * each entry names the others as alternates; a page only one market publishes
 * (the UAE services section) names none, rather than an address that 404s. A
 * page with an explicit canonical URL is listed at that URL alone.
 */
export function seoSitemapUrls(row: PageRow, site: string): SitemapUrl[] {
  const canonical = String(row.canonical_url ?? '').trim();
  if (canonical !== '') return [{ loc: canonical, region: null, alternates: [] }];

  const place = seoPlacement(row);
  if (!place.exists) return [];

  // The same address in every market, from whichever pages publish it.
  const twins = new Map<RegionSlug, string>();
  for (const p of sitePages()) {
    if (p.path !== place.path) continue;
    for (const r of p.regions) twins.set(r, site + marketPath(r, p.path));
  }
  for (const r of place.regions) twins.set(r, site + marketPath(r, place.path));

  const alternates: Array<[string, string]> =
    twins.size > 1
      ? [
          ...vxnRegionList()
            .filter((r) => twins.has(r.slug))
            .map((r): [string, string] => [r.lang, twins.get(r.slug)!]),
          ['x-default', site + place.path],
        ]
      : [];

  return place.regions.map((region) => ({ loc: site + marketPath(region, place.path), region, alternates }));
}

/** One URL of the generated sitemap, as vx_sitemap_urls records it. */
interface GeneratedUrl extends SitemapUrl {
  /** The page key or post slug the URL was generated from. */
  file: string;
  title: string;
  lastmod: string;
  changefreq: string;
  priority: string;
}

/** 'YYYY-MM-DD' from a DATETIME string, or today. */
function dateOf(stamp: unknown): string {
  const s = String(stamp ?? '');
  return /^\d{4}-\d{2}-\d{2}/.test(s) ? s.slice(0, 10) : new Date().toISOString().slice(0, 10);
}

/**
 * The sitemap entries for the published blog posts.
 *
 * Posts are rows in vx_posts, not pages in the code, so they are not in
 * sitePages() and have no vx_page_seo row. Every market publishes /blogs/, so
 * each post is listed once per market with the others as its hreflang
 * alternates — the treatment a shared page gets above.
 */
async function blogSitemapUrls(site: string): Promise<GeneratedUrl[]> {
  let posts: Awaited<ReturnType<typeof publishedSlugs>> = [];
  try {
    posts = await publishedSlugs();
  } catch {
    // No database: the rest of the sitemap still writes.
    return [];
  }

  const regions = vxnRegionList();
  const out: GeneratedUrl[] = [];
  for (const post of posts) {
    const path = `/blogs/${post.slug}/`;
    const alternates: Array<[string, string]> =
      regions.length > 1
        ? [
            ...regions.map((r): [string, string] => [r.lang, site + marketPath(r.slug, path)]),
            ['x-default', site + path],
          ]
        : [];
    for (const r of regions) {
      out.push({
        loc: site + marketPath(r.slug, path),
        region: r.slug,
        alternates,
        file: `blogs/${post.slug}`,
        title: post.title,
        lastmod: dateOf(post.updated_at),
        changefreq: 'monthly',
        priority: '0.6',
      });
    }
  }
  return out;
}

function xmlEscape(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Record a generation: compare the new URL set with vx_sitemap_urls, replace it,
 * and add a vx_sitemap_runs row — the history the imported panel kept.
 */
async function recordSitemapRun(urls: GeneratedUrl[], started: number, error = ''): Promise<void> {
  try {
    const before = new Map<string, string>();
    for (const r of await query<{ url: string; lastmod: string }>('SELECT url, lastmod FROM vx_sitemap_urls')) {
      before.set(String(r.url), String(r.lastmod));
    }
    const after = new Map(urls.map((u) => [u.loc, u]));
    let added = 0;
    let modified = 0;
    for (const [loc, u] of after) {
      if (!before.has(loc)) added++;
      else if (before.get(loc) !== u.lastmod) modified++;
    }
    const removed = [...before.keys()].filter((loc) => !after.has(loc)).length;
    const changed = added + removed + modified > 0 ? 1 : 0;

    if (!error) {
      await execute('DELETE FROM vx_sitemap_urls');
      for (const u of after.values()) {
        await execute(
          'INSERT INTO vx_sitemap_urls (url, file, title, lastmod, changefreq, priority) VALUES (?, ?, ?, ?, ?, ?)',
          [u.loc.slice(0, 500), u.file.slice(0, 255), u.title.slice(0, 255) || null, u.lastmod, u.changefreq.slice(0, 10), u.priority.slice(0, 4)]
        );
      }
    }
    await execute(
      'INSERT INTO vx_sitemap_runs (ts, status, total_urls, added, removed, modified, changed, duration_ms, error) VALUES (UTC_TIMESTAMP(), ?, ?, ?, ?, ?, ?, ?, ?)',
      [error ? 'error' : 'success', error ? 0 : after.size, error ? 0 : added, error ? 0 : removed, error ? 0 : modified, error ? 0 : changed, Date.now() - started, error ? error.slice(0, 500) : null]
    );
  } catch {
    /* the history is a record, not a requirement: the sitemap itself was written */
  }
}

/** Write public/sitemap.xml from the current page set and the published posts. */
export async function seoGenerateSitemap(
  requestOrigin = ''
): Promise<{ ok: boolean; count: number; path: string; error: string }> {
  const started = Date.now();
  const rows = await seoSitemapRows();
  const site = await seoSiteUrl(requestOrigin);

  const urls: GeneratedUrl[] = [];
  for (const r of rows) {
    for (const u of seoSitemapUrls(r, site)) {
      urls.push({
        ...u,
        file: String(r.slug),
        title: String(r.meta_title || r.title || ''),
        lastmod: dateOf(r.updated_at),
        changefreq: String(r.changefreq),
        priority: Number(r.priority).toFixed(1),
      });
    }
  }
  urls.push(...(await blogSitemapUrls(site)));

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<!-- Generated by the Valunxt admin panel (Sitemap). One entry per page per country\n';
  xml += '     edition that publishes it: every public URL lives under a market prefix, and the\n';
  xml += '     unprefixed form redirects, so listing it would list a redirect. -->\n';
  xml +=
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n';
  for (const u of urls) {
    xml += '    <url>\n';
    xml += `        <loc>${xmlEscape(u.loc)}</loc>\n`;
    for (const [lang, href] of u.alternates) {
      xml += `        <xhtml:link rel="alternate" hreflang="${xmlEscape(lang)}" href="${xmlEscape(href)}" />\n`;
    }
    xml += `        <lastmod>${u.lastmod}</lastmod>\n`;
    xml += `        <changefreq>${xmlEscape(u.changefreq)}</changefreq>\n`;
    xml += `        <priority>${u.priority}</priority>\n`;
    xml += '    </url>\n';
  }
  xml += '</urlset>\n';

  const target = seoSitemapPath();
  try {
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, xml, 'utf8');
  } catch (e) {
    const error = `Could not write ${target}. Check folder permissions. (${String(e)})`;
    await recordSitemapRun(urls, started, error);
    return { ok: false, count: 0, path: target, error };
  }

  await recordSitemapRun(urls, started);
  try {
    await seoSettingSet(SITEMAP_GENERATED_KEY, new Date().toISOString().slice(0, 19).replace('T', ' '));
    await seoSettingSet(SITEMAP_COUNT_KEY, String(urls.length));
    await seoSettingSet(SITEMAP_STALE_KEY, '0');
  } catch {
    /* non-fatal */
  }

  return { ok: true, count: urls.length, path: target, error: '' };
}

/* ---------------------------------------------------------------------------
 * Front-end cache
 * ------------------------------------------------------------------------ */

/**
 * Write src/data/seo-map.json — the resolved SEO values keyed by page. The
 * public site reads this file instead of the database so page views stay fast
 * and keep working if MySQL is unavailable.
 */
export async function seoWriteCache(
  requestOrigin = ''
): Promise<{ ok: boolean; count: number; path: string; error: string }> {
  const rows = await query<PageRow>(`${PAGE_SELECT} ORDER BY rel_path ASC`);

  const map: Record<string, MapRow> = {};
  for (const r of rows) {
    // A row whose page has left the website can shape no page.
    if (!seoPageExists(r)) continue;
    const eff = await seoEffective(r, requestOrigin);
    const entry: MapRow = {
      title: eff.title,
      description: eff.description,
      // Only an explicitly set canonical is cached; when it is blank the front
      // end derives one from the live request, so the same cache file stays
      // correct on localhost and in production.
      canonical: String(r.canonical_url ?? '').trim(),
      robots: r.status === 'published' ? eff.robots : 'noindex, nofollow',
      keywords: eff.keywords,
      og_title: eff.og_title,
      og_description: eff.og_description,
    };
    // The fields the imported schema added: written only when set, so the map
    // stays readable and an older map still imports without blanking them.
    if (r.og_image.trim()) entry.og_image = r.og_image.trim();
    if (r.tw_title.trim()) entry.twitter_title = r.tw_title.trim();
    if (r.tw_desc.trim()) entry.twitter_description = r.tw_desc.trim();
    if (r.tw_image.trim()) entry.twitter_image = r.tw_image.trim();
    const schema = seoSchemaBlocks(r.schema_jsonld);
    if (schema.length) entry.schema = schema;
    const faq = seoFaq(r.faq_json);
    if (faq.length) entry.faq = faq;
    map[String(r.slug)] = entry;
  }

  const target = seoCachePath();
  const text = JSON.stringify(map, null, 2) + '\n';
  try {
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, text, 'utf8');
  } catch (e) {
    return { ok: false, count: 0, path: target, error: `Could not write ${target}. (${String(e)})` };
  }
  // Remember this map as the panel's own, so seo-import.ts does not read it back.
  try {
    await seoSettingSet(SEO_MAP_HASH_KEY, seoMapHash(text));
  } catch {
    /* non-fatal: at worst the same values are imported once */
  }

  return { ok: true, count: Object.keys(map).length, path: target, error: '' };
}

/**
 * Regenerate every derived artefact. Called after any page or post create,
 * update, slug change, publish/unpublish or delete.
 */
export async function seoRegenerate(
  requestOrigin = ''
): Promise<{ ok: boolean; count: number; errors: string[] }> {
  const errors: string[] = [];
  const map = await seoWriteCache(requestOrigin);
  if (!map.ok) errors.push(map.error);
  const sm = await seoGenerateSitemap(requestOrigin);
  if (!sm.ok) errors.push(sm.error);
  return { ok: errors.length === 0, count: sm.count, errors };
}

/** True when pages changed since sitemap.xml and the SEO map were last generated. */
export async function seoSitemapStale(): Promise<boolean> {
  return (await seoSetting(SITEMAP_STALE_KEY, '0')) === '1';
}

/* ---------------------------------------------------------------------------
 * Convenience accessors used by the admin screens
 * ------------------------------------------------------------------------ */

export async function seoPage(id: number): Promise<PageRow | null> {
  const rows = await query<PageRow>(`${PAGE_SELECT} WHERE id = ? LIMIT 1`, [id]);
  return rows[0] ?? null;
}

export async function seoPageBySlug(slug: string): Promise<PageRow | null> {
  const rows = await query<PageRow>(`${PAGE_SELECT} WHERE rel_path = ? LIMIT 1`, [slug]);
  return rows[0] ?? null;
}

function pagesFilter(q: string): { where: string; args: string[] } {
  const t = q.trim();
  if (t === '') return { where: '', args: [] };
  const like = '%' + t.replace(/[\\%_]/g, (c) => '\\' + c) + '%';
  return {
    where: 'WHERE (title LIKE ? OR rel_path LIKE ? OR meta_title LIKE ?)',
    args: [like, like, like],
  };
}

/**
 * Every row matching the search, and the market filter when one is given, in
 * the order the site is organised. The listing pages through this in memory:
 * the table holds a row per page of one website, not a data set.
 */
export async function seoPagesList(q = '', market = ''): Promise<PageRow[]> {
  const { where, args } = pagesFilter(q);
  const rows = await query<PageRow>(`${PAGE_SELECT} ${where}`, args);
  const filtered = market ? rows.filter((r) => seoPlacement(r).regions.includes(market as RegionSlug)) : rows;
  return filtered.sort(bySiteOrder);
}

export interface SeoStats {
  total: number;
  published: number;
  draft: number;
  sitemap: number;
  noindex: number;
  /** Rows imported from the previous site, awaiting review. */
  legacy: number;
}

export async function seoStats(): Promise<SeoStats> {
  const one = async (statement: string) => Number((await query<{ n: number }>(statement))[0]?.n ?? 0);
  return {
    total: await one('SELECT COUNT(*) AS n FROM vx_page_seo'),
    published: await one("SELECT COUNT(*) AS n FROM vx_page_seo WHERE status = 'published'"),
    draft: await one("SELECT COUNT(*) AS n FROM vx_page_seo WHERE status <> 'published'"),
    sitemap: (await seoSitemapRows()).length,
    noindex: await one("SELECT COUNT(*) AS n FROM vx_page_seo WHERE robots LIKE 'noindex%'"),
    legacy: await one("SELECT COUNT(*) AS n FROM vx_page_seo WHERE is_cms = 0 AND file_path = ''"),
  };
}

/** The hero banners a new CMS page can choose from. */
export function seoHeroImages(): string[] {
  /* Through the build-time manifest, not the disk: /public is not bundled into
     the server functions (lib/public-files.ts). */
  return publicFilesIn('assets/content/uploads/banners')
    .filter((f) => /\.(webp|jpe?g|png)$/i.test(f))
    .sort()
    .map((f) => '/' + f);
}

/**
 * Create the CMS record for a new page.
 *
 * The PHP panel scaffolded a folder and an index.php on disk. A Next.js route
 * cannot appear at runtime, so CMS pages are served instead by the catch-all
 * route (src/app/[region]/[...slug]/page.tsx), which renders the same shared
 * page-hero + subscribe body from this row. The page is therefore live the
 * moment it is saved, with no redeploy — which is what the old scaffolding was
 * trying to achieve.
 */
export function seoCmsFilePath(slug: string): string {
  return `src/app/[region]/[...slug]/page.tsx#/${String(slug).replace(/^\/+|\/+$/g, '')}/`;
}
