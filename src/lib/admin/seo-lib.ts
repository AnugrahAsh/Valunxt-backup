/**
 * Valunxt — SEO & Sitemap library.
 *
 * Everything the admin panel needs to manage per-page SEO metadata, page slugs
 * and the XML sitemap, so the individual admin screens stay thin. Nothing here
 * renders anything.
 *
 * Data model
 *   pages          one row per public page, keyed by slug — the key the front-end
 *                  SEO map uses ('' = India home, 'en-ae' = UAE home, 'about' =
 *                  a page both markets publish, 'en-ae/services/…' = UAE only)
 *   seo_settings   simple key/value store (site URL, last sitemap run, …)
 *
 * Generated artefacts
 *   public/sitemap.xml       XML Sitemap protocol 0.9, one entry per page per market
 *   src/data/seo-map.json    the map the public front end reads, so a page view
 *                            never opens a database connection
 *
 * Port of admin/includes/seo-lib.php. Page discovery reads lib/site-pages.ts —
 * the published set derived from the routes' own registries — rather than
 * scanning the filesystem for index.php files, because pages are TypeScript
 * routes now rather than PHP directories.
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
} from './seo-import';
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
    for (const r of await query<{ k: string; v: string | null }>('SELECT k, v FROM seo_settings')) {
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
  await execute('INSERT INTO seo_settings (k, v) VALUES (?, ?) ON DUPLICATE KEY UPDATE v = VALUES(v)', [
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
  const rows = await query<{ n: number }>('SELECT COUNT(*) AS n FROM pages WHERE slug = ? AND id <> ?', [
    slug,
    exceptId,
  ]);
  return Number(rows[0]?.n ?? 0) > 0;
}

/* ---------------------------------------------------------------------------
 * Where a row's page lives
 * ------------------------------------------------------------------------ */

export interface PageRow {
  id: number;
  title: string;
  slug: string;
  file_path: string;
  meta_title: string;
  meta_description: string | null;
  canonical_url: string;
  meta_keywords: string;
  robots_meta: string;
  og_title: string;
  og_description: string | null;
  status: string;
  in_sitemap: number;
  priority: string;
  changefreq: string;
  is_cms: number;
  /** The banner behind a CMS page's breadcrumb hero. */
  hero_image: string;
  created_at: string;
  updated_at: string;
}

export interface PagePlacement {
  /** Built into the website's code, rather than created in the panel. */
  builtIn: boolean;
  /** The website publishes it. False only for a built-in row whose page has gone. */
  exists: boolean;
  /** The address inside a market: '/about/', '/' for a home. */
  path: string;
  /** The markets that publish it. */
  regions: RegionSlug[];
  /** The published page, for a built-in row. */
  site?: SitePage;
}

const ALL_REGIONS: RegionSlug[] = vxnRegionList().map((r) => r.slug);

/** Where the page behind a row is published. */
export function seoPlacement(row: Pick<PageRow, 'slug' | 'is_cms'>): PagePlacement {
  const slug = String(row.slug ?? '');
  const site = sitePageBySlug(slug);
  if (site) return { builtIn: true, exists: true, path: site.path, regions: site.regions, site };
  const cmsPath = `/${slug.replace(/^\/+|\/+$/g, '')}/`;
  // A page created in the panel is served by the CMS catch-all in every market.
  if (Number(row.is_cms) === 1) return { builtIn: false, exists: true, path: cmsPath, regions: ALL_REGIONS };
  return { builtIn: true, exists: false, path: cmsPath, regions: [] };
}

/** Whether the page behind a row still exists on the site. */
export function seoPageExists(row: Pick<PageRow, 'slug' | 'is_cms'>): boolean {
  return seoPlacement(row).exists;
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
 * new pages, remove built-in rows whose page has gone. Pages created in the
 * panel are never touched.
 */
export async function seoSyncPages(): Promise<{ added: number; removed: number; total: number }> {
  const res = await syncSitePages(await db(), true);
  return res ?? { added: 0, removed: 0, total: sitePages().length };
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

/** Apply the documented fallbacks to a raw pages row. */
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
    `SELECT * FROM pages
         WHERE status = 'published'
           AND in_sitemap = 1
           AND robots_meta NOT LIKE 'noindex%'`
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

function xmlEscape(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** Write public/sitemap.xml from the current page set. */
export async function seoGenerateSitemap(
  requestOrigin = ''
): Promise<{ ok: boolean; count: number; path: string; error: string }> {
  const rows = await seoSitemapRows();
  const site = await seoSiteUrl(requestOrigin);

  let count = 0;
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<!-- Generated by the Valunxt admin panel (Sitemap). One entry per page per country\n';
  xml += '     edition that publishes it: every public URL lives under a market prefix, and the\n';
  xml += '     unprefixed form redirects, so listing it would list a redirect. -->\n';
  xml +=
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n';
  for (const r of rows) {
    // updated_at is a local-time DATETIME string; keep its calendar date as written.
    const stamp = String(r.updated_at ?? '');
    const lastmod = /^\d{4}-\d{2}-\d{2}/.test(stamp)
      ? stamp.slice(0, 10)
      : new Date().toISOString().slice(0, 10);
    for (const u of seoSitemapUrls(r, site)) {
      xml += '    <url>\n';
      xml += `        <loc>${xmlEscape(u.loc)}</loc>\n`;
      for (const [lang, href] of u.alternates) {
        xml += `        <xhtml:link rel="alternate" hreflang="${xmlEscape(lang)}" href="${xmlEscape(href)}" />\n`;
      }
      xml += `        <lastmod>${lastmod}</lastmod>\n`;
      xml += `        <changefreq>${xmlEscape(String(r.changefreq))}</changefreq>\n`;
      xml += `        <priority>${Number(r.priority).toFixed(1)}</priority>\n`;
      xml += '    </url>\n';
      count++;
    }
  }
  xml += '</urlset>\n';

  const target = seoSitemapPath();
  try {
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, xml, 'utf8');
  } catch (e) {
    return {
      ok: false,
      count: 0,
      path: target,
      error: `Could not write ${target}. Check folder permissions. (${String(e)})`,
    };
  }

  try {
    await seoSettingSet('sitemap_generated_at', new Date().toISOString().slice(0, 19).replace('T', ' '));
    await seoSettingSet('sitemap_url_count', String(count));
    await seoSettingSet(SITEMAP_STALE_KEY, '0');
  } catch {
    /* non-fatal */
  }

  return { ok: true, count, path: target, error: '' };
}

/* ---------------------------------------------------------------------------
 * Front-end cache
 * ------------------------------------------------------------------------ */

/**
 * Write src/data/seo-map.json — the resolved SEO values keyed by slug. The
 * public site reads this file instead of the database so page views stay fast
 * and keep working if MySQL is unavailable.
 */
export async function seoWriteCache(
  requestOrigin = ''
): Promise<{ ok: boolean; count: number; path: string; error: string }> {
  const rows = await query<PageRow>('SELECT * FROM pages ORDER BY slug ASC');

  const map: Record<string, Record<string, string>> = {};
  for (const r of rows) {
    // A row whose page has left the website can shape no page.
    if (!seoPageExists(r)) continue;
    const eff = await seoEffective(r, requestOrigin);
    map[String(r.slug)] = {
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
 * Regenerate every derived artefact. Called after any page create, update,
 * slug change, publish/unpublish or delete.
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
  const rows = await query<PageRow>('SELECT * FROM pages WHERE id = ? LIMIT 1', [id]);
  return rows[0] ?? null;
}

export async function seoPageBySlug(slug: string): Promise<PageRow | null> {
  const rows = await query<PageRow>('SELECT * FROM pages WHERE slug = ? LIMIT 1', [slug]);
  return rows[0] ?? null;
}

function pagesFilter(q: string): { where: string; args: string[] } {
  const t = q.trim();
  if (t === '') return { where: '', args: [] };
  const like = '%' + t.replace(/[\\%_]/g, (c) => '\\' + c) + '%';
  return { where: 'WHERE (title LIKE ? OR slug LIKE ? OR meta_title LIKE ?)', args: [like, like, like] };
}

/**
 * Every row matching the search, and the market filter when one is given, in
 * the order the site is organised. The listing pages through this in memory:
 * the table holds a row per page of one website, not a data set.
 */
export async function seoPagesList(q = '', market = ''): Promise<PageRow[]> {
  const { where, args } = pagesFilter(q);
  const rows = await query<PageRow>(`SELECT * FROM pages ${where}`, args);
  const filtered = market
    ? rows.filter((r) => seoPlacement(r).regions.includes(market as RegionSlug))
    : rows;
  return filtered.sort(bySiteOrder);
}

export interface SeoStats {
  total: number;
  published: number;
  draft: number;
  sitemap: number;
  noindex: number;
}

export async function seoStats(): Promise<SeoStats> {
  const one = async (sql: string) => Number((await query<{ n: number }>(sql))[0]?.n ?? 0);
  return {
    total: await one('SELECT COUNT(*) AS n FROM pages'),
    published: await one("SELECT COUNT(*) AS n FROM pages WHERE status = 'published'"),
    draft: await one("SELECT COUNT(*) AS n FROM pages WHERE status <> 'published'"),
    sitemap: (await seoSitemapRows()).length,
    noindex: await one("SELECT COUNT(*) AS n FROM pages WHERE robots_meta LIKE 'noindex%'"),
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
