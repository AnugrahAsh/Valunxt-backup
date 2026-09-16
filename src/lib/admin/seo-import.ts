/**
 * Keeps the page registry (`vx_page_seo`) in step with the website.
 *
 * Two things can move under the panel without passing through it, and both
 * used to leave it wrong:
 *
 * 1. THE PAGES THE SITE PUBLISHES (lib/site-pages.ts). A page added in code
 *    never reached the table unless someone pressed "Rescan website", and a page
 *    taken out of the code stayed listed — and in the sitemap — for good. So the
 *    published set is fingerprinted (vx_settings.site_pages_hash); when it
 *    moves, rows are added for new pages and built-in rows whose page is gone are
 *    removed. Two kinds of row are never removed here: pages created in the panel
 *    (is_cms = 1), and rows this sync did not create — the page SEO imported from
 *    the previous www.valunxt.com site, which an administrator retires by hand.
 *
 * 2. src/data/seo-map.json. The panel treats the table as the source and the
 *    map as its output: every save rewrites the file from the table. That only
 *    holds while nobody else writes the file — and the site's SEO copy has been
 *    revised directly in the repository ("Valunxt" for "VALUNXT Capital", "the
 *    UAE" for "Dubai") while the table kept the PHP-era values. The first save
 *    then put the old copy back on every public page (20260915). So the panel
 *    records the hash of every map it writes (vx_settings.seo_map_hash); when
 *    the file on disk does not match — edited, pulled, deployed — its values are
 *    imported into the table before anything reads from it.
 *
 * Either change leaves sitemap.xml and the map behind the table, so both set
 * vx_settings.sitemap_stale, which the Pages and Sitemap screens surface with a
 * prompt to regenerate. Regenerating here would write repository files from
 * inside a page render.
 *
 * Kept free of imports from db.ts and seo-lib.ts, because db.ts runs it and both
 * of those import db.ts. It works on the pool it is given.
 */
import 'server-only';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import type mysql from 'mysql2/promise';

import {
  marketPath,
  sitePageBySlug,
  sitePages,
  sitePagesFingerprint,
  type SitePage,
} from '@/lib/site-pages';

export const SEO_MAP_HASH_KEY = 'seo_map_hash';
export const SITE_PAGES_HASH_KEY = 'site_pages_hash';
export const SITEMAP_STALE_KEY = 'sitemap_stale';

const ROBOTS = ['index, follow', 'noindex, follow', 'index, nofollow', 'noindex, nofollow'];

/** One page's entry in src/data/seo-map.json. */
export interface MapRow {
  title?: string;
  description?: string;
  canonical?: string;
  robots?: string;
  keywords?: string;
  og_title?: string;
  og_description?: string;
  /* Added with the imported schema (20260916). Optional, so a map written before
     them imports without blanking what the table holds. */
  og_image?: string;
  twitter_title?: string;
  twitter_description?: string;
  twitter_image?: string;
  /** JSON-LD blocks, each a JSON document as a string. */
  schema?: string[];
  /** FAQ pairs published as FAQPage structured data. */
  faq?: Array<{ q: string; a: string }>;
}

/** Absolute path of the front-end SEO map. */
export function seoMapPath(): string {
  return path.join(process.cwd(), 'src', 'data', 'seo-map.json');
}

/**
 * Fingerprint of a map's text. Line endings are normalised first: a Windows
 * checkout turns the panel's LF into CRLF without changing a single value.
 */
export function seoMapHash(text: string): string {
  return crypto.createHash('sha1').update(text.replace(/\r\n/g, '\n')).digest('hex');
}

/** Where a built-in page is declared, for the row's file_path. */
export function sitePageSource(p: SitePage): string {
  if (p.section === 'UAE Services') return 'src/lib/region.ts#vxnServices(en-ae)' + marketPath('en-ae', p.path);
  if (p.section === 'Home') return `src/data/page-configs.json#/${p.regions[0]}/`;
  return 'src/data/page-configs.json#' + p.path;
}

/**
 * Whether this sync owns a row, and so may remove it once its page is gone: a
 * built-in page's row names what declares the page in file_path (src/…, or the
 * PHP template for rows kept from the PHP build). Rows imported from the
 * previous www.valunxt.com site carry none, and are retired by hand.
 */
function syncManaged(row: { file_path?: unknown; is_cms?: unknown }): boolean {
  return Number(row.is_cms) !== 1 && String(row.file_path ?? '') !== '';
}

/**
 * The meta title a new row stores. Empty when the page's own title is exactly
 * what an empty field falls back to ("<name> | Valunxt"), so the row keeps
 * following the page; the page's title otherwise (the market homes).
 */
function storedTitle(p: SitePage): string | null {
  return p.title === `${p.name} | Valunxt` ? null : p.title;
}

function str(v: unknown): string {
  return String(v ?? '').trim();
}

/** '' as NULL: the imported schema's optional columns hold NULL for "not set". */
function nul(v: string): string | null {
  return v === '' ? null : v;
}

async function setSetting(pool: mysql.Pool, key: string, value: string): Promise<void> {
  await pool.query('INSERT INTO vx_settings (k, v) VALUES (?, ?) ON DUPLICATE KEY UPDATE v = VALUES(v)', [
    key,
    value,
  ]);
}

async function getSetting(pool: mysql.Pool, key: string): Promise<string> {
  const [rows] = await pool.query<mysql.RowDataPacket[]>('SELECT v FROM vx_settings WHERE k = ?', [key]);
  return String(rows[0]?.v ?? '');
}

/* ---- 1. The published set ------------------------------------------------ */

/**
 * Add a row for every published page the table lacks, and remove sync-managed
 * rows whose page the site no longer publishes. Runs when the published set's
 * fingerprint has moved, or always with `force` (the "Rescan website" button).
 */
export async function syncSitePages(
  pool: mysql.Pool,
  force = false,
): Promise<{ added: number; removed: number; total: number } | null> {
  const pages = sitePages();
  // Never prune against an empty list: that would be a bug, not a site.
  if (pages.length === 0) return null;

  const hash = sitePagesFingerprint();
  if (!force && (await getSetting(pool, SITE_PAGES_HASH_KEY)) === hash) return null;

  const [rows] = await pool.query<mysql.RowDataPacket[]>('SELECT id, rel_path, is_cms, file_path FROM vx_page_seo');
  const known = new Set(rows.map((r) => String(r.rel_path)));

  let added = 0;
  for (const p of pages) {
    if (known.has(p.slug)) continue;
    await pool.query(
      `INSERT INTO vx_page_seo
          (rel_path, title, file_path, meta_title, robots, priority, changefreq, status, in_sitemap, is_cms, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'published', 1, 0, NOW())`,
      [p.slug, p.name, sitePageSource(p), storedTitle(p), p.robots, p.priority, p.changefreq],
    );
    added++;
  }

  let removed = 0;
  for (const r of rows) {
    if (!syncManaged(r as { file_path?: unknown; is_cms?: unknown }) || sitePageBySlug(String(r.rel_path))) continue;
    await pool.query('DELETE FROM vx_page_seo WHERE id = ?', [r.id]);
    removed++;
  }

  await setSetting(pool, SITE_PAGES_HASH_KEY, hash);
  if (added || removed) await setSetting(pool, SITEMAP_STALE_KEY, '1');
  return { added, removed, total: pages.length };
}

/* ---- 2. The SEO map ------------------------------------------------------ */

/** The optional map fields, as [map key, column, value from the row]. */
function extendedFields(row: MapRow): Array<[string, unknown]> {
  const out: Array<[string, unknown]> = [];
  if ('og_image' in row) out.push(['og_image', nul(str(row.og_image))]);
  if ('twitter_title' in row) out.push(['tw_title', nul(str(row.twitter_title))]);
  if ('twitter_description' in row) out.push(['tw_desc', nul(str(row.twitter_description))]);
  if ('twitter_image' in row) out.push(['tw_image', nul(str(row.twitter_image))]);
  if ('schema' in row) {
    const blocks = Array.isArray(row.schema) ? row.schema.map(String).filter((b) => b.trim() !== '') : [];
    out.push(['schema_jsonld', blocks.length ? JSON.stringify(blocks) : null]);
  }
  if ('faq' in row) {
    const faq = Array.isArray(row.faq) ? row.faq.filter((f) => f && str(f.q) && str(f.a)) : [];
    out.push(['faq_json', faq.length ? JSON.stringify(faq.map((f) => ({ q: str(f.q), a: str(f.a) }))) : null]);
  }
  return out;
}

/** Import src/data/seo-map.json into `vx_page_seo` unless the panel wrote this exact file. */
export async function importSeoMap(pool: mysql.Pool): Promise<{ updated: number; added: number } | null> {
  let text: string;
  let map: Record<string, MapRow>;
  try {
    text = await fs.readFile(seoMapPath(), 'utf8');
    map = JSON.parse(text) as Record<string, MapRow>;
  } catch {
    return null;
  }

  const hash = seoMapHash(text);
  if ((await getSetting(pool, SEO_MAP_HASH_KEY)) === hash) return null;

  let updated = 0;
  let added = 0;

  for (const [slug, row] of Object.entries(map)) {
    const title = str(row.title);
    const description = str(row.description);
    const ogTitle = str(row.og_title);
    const ogDesc = str(row.og_description);
    const robots = str(row.robots);
    const fields: Array<[string, unknown]> = [
      ['meta_title', nul(title)],
      ['meta_desc', nul(description)],
      ['canonical', nul(str(row.canonical))],
      ['keywords', nul(str(row.keywords))],
      // The map spells out the Open Graph fallbacks; store them only when they differ,
      // so a later meta title or description edit still flows through to them.
      ['og_title', ogTitle === title ? null : nul(ogTitle)],
      ['og_desc', ogDesc === description ? null : nul(ogDesc)],
      ...extendedFields(row),
    ];

    const [found] = await pool.query<mysql.RowDataPacket[]>(
      'SELECT id, status FROM vx_page_seo WHERE rel_path = ? LIMIT 1',
      [slug],
    );

    if (found[0]) {
      const sets = fields.map(([col]) => `${col} = ?`);
      const args: unknown[] = fields.map(([, v]) => v);
      // A draft is written to the map as "noindex, nofollow" whatever its own
      // directive is, so only a published row's value is its robots setting.
      if (found[0].status === 'published' && ROBOTS.includes(robots)) {
        sets.push('robots = ?');
        args.push(robots);
      }
      args.push(found[0].id);
      const [res] = await pool.query<mysql.ResultSetHeader>(
        `UPDATE vx_page_seo SET ${sets.join(', ')} WHERE id = ?`,
        args,
      );
      if (res.changedRows) updated++;
      continue;
    }

    const site = sitePageBySlug(slug);
    if (!site) continue; // a key for a page the site no longer publishes
    const cols = [
      'rel_path',
      'title',
      'file_path',
      'robots',
      'priority',
      'changefreq',
      'status',
      'in_sitemap',
      'is_cms',
      'created_at',
      ...fields.map(([col]) => col),
    ];
    await pool.query(
      `INSERT INTO vx_page_seo (${cols.join(', ')})
       VALUES (?, ?, ?, ?, ?, ?, 'published', 1, 0, NOW(), ${fields.map(() => '?').join(', ')})`,
      [
        slug,
        site.name,
        sitePageSource(site),
        ROBOTS.includes(robots) ? robots : site.robots,
        site.priority,
        site.changefreq,
        ...fields.map(([, v]) => v),
      ],
    );
    added++;
  }

  await setSetting(pool, SEO_MAP_HASH_KEY, hash);
  if (updated || added) await setSetting(pool, SITEMAP_STALE_KEY, '1');
  return { updated, added };
}

/* ---- Scheduling ---------------------------------------------------------- */

let lastCheck = 0;
let lastMtime = 0;
let pagesChecked = false;
let running: Promise<void> | null = null;

/**
 * Run both syncs when there may be something to do.
 *
 * Cheap to call on every database access: the published set can only change
 * with the code, so it is compared once per server start (or hot reload); the
 * map is looked at through its modification time, at most every two seconds.
 */
export function syncSeoMap(pool: mysql.Pool): Promise<void> {
  if (running) return running;
  const now = Date.now();
  if (pagesChecked && now - lastCheck < 2000) return Promise.resolve();
  lastCheck = now;

  running = (async () => {
    // The map first: it may carry the approved copy for a page the set adds.
    let mtime = 0;
    try {
      mtime = (await fs.stat(seoMapPath())).mtimeMs;
    } catch {
      mtime = -1; // no map on disk
    }
    if (mtime > 0 && mtime !== lastMtime) {
      await importSeoMap(pool);
      lastMtime = mtime;
    }
    if (!pagesChecked) {
      await syncSitePages(pool);
      pagesChecked = true;
    }
  })()
    .catch(() => {
      /* the panel keeps working on the table as it is; the next call retries */
    })
    .finally(() => {
      running = null;
    });
  return running;
}
