/**
 * The figures behind the dashboard and the panel-wide search.
 *
 * The PHP dashboard carried placeholder numbers ("1,248 enquiries", "$4.7B
 * under review") and an invented activity feed. Every figure here is read from
 * the same tables the other screens manage, so the dashboard agrees with them.
 */
import 'server-only';

import { adminUrl } from './config';
import { query } from './db';
import { localStamp, utcStamp } from './format';
import { seoSetting, seoStats, type SeoStats } from './seo-lib';

export interface EnquiryRow {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  company: string;
  source: string;
  page_url: string;
  created_at: string;
}

export interface MonthCount {
  /** "2026-09" */
  key: string;
  /** "Sep" */
  label: string;
  count: number;
}

export interface ActivityItem {
  kind: 'enquiry' | 'page' | 'sitemap';
  title: string;
  detail: string;
  at: Date;
  href: string;
}

export interface DashboardData {
  enquiries: { total: number; last30: number; prev30: number };
  sources: Array<{ source: string; n: number }>;
  months: MonthCount[];
  pages: SeoStats;
  sitemap: { generatedAt: Date | null; urlCount: number };
  latest: EnquiryRow[];
  activity: ActivityItem[];
}

const MONTHS = 8;

/** The last `MONTHS` calendar months, oldest first, ending with this one. */
function monthKeys(now = new Date()): MonthCount[] {
  const out: MonthCount[] = [];
  for (let i = MONTHS - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      label: d.toLocaleDateString('en-GB', { month: 'short' }),
      count: 0,
    });
  }
  return out;
}

/** Who an enquiry is from, for one line of copy. */
export function enquiryWho(e: Pick<EnquiryRow, 'full_name' | 'company' | 'email'>): string {
  const name = e.full_name?.trim();
  const company = e.company?.trim();
  if (name && company) return `${name}, ${company}`;
  return name || company || e.email || 'Website visitor';
}

/** Everything the dashboard shows. Throws if MySQL is unreachable. */
export async function dashboardData(): Promise<DashboardData> {
  const [counts] = await query<{ total: number; last30: string | null; prev30: string | null }>(
    `SELECT COUNT(*) AS total,
            SUM(created_at >= NOW() - INTERVAL 30 DAY) AS last30,
            SUM(created_at >= NOW() - INTERVAL 60 DAY AND created_at < NOW() - INTERVAL 30 DAY) AS prev30
       FROM enquiries`
  );

  const sources = await query<{ source: string; n: number }>(
    `SELECT source, COUNT(*) AS n FROM enquiries GROUP BY source ORDER BY n DESC`
  );

  const months = monthKeys();
  const byMonth = await query<{ ym: string; n: number }>(
    `SELECT DATE_FORMAT(created_at, '%Y-%m') AS ym, COUNT(*) AS n
       FROM enquiries
      WHERE created_at >= ?
      GROUP BY ym`,
    [`${months[0].key}-01 00:00:00`]
  );
  for (const row of byMonth) {
    const m = months.find((x) => x.key === row.ym);
    if (m) m.count = Number(row.n);
  }

  const latest = await query<EnquiryRow>(
    `SELECT id, full_name, email, phone, company, source, page_url, created_at
       FROM enquiries ORDER BY created_at DESC, id DESC LIMIT 5`
  );

  const pages = await seoStats();
  const generatedRaw = await seoSetting('sitemap_generated_at', '');
  const urlCount = Number(await seoSetting('sitemap_url_count', '0'));

  // Activity: the newest enquiries, page edits and the last sitemap run, merged.
  const recentPages = await query<{
    id: number;
    title: string;
    slug: string;
    status: string;
    created_at: string;
    updated_at: string;
  }>(
    `SELECT id, title, slug, status, created_at, updated_at
       FROM pages ORDER BY updated_at DESC, id DESC LIMIT 5`
  );

  const activity: ActivityItem[] = [];
  for (const e of latest) {
    const at = localStamp(e.created_at);
    if (!at) continue;
    activity.push({
      kind: 'enquiry',
      title: 'New enquiry received',
      detail: `${enquiryWho(e)} · ${e.source || 'Website'}`,
      at,
      href: adminUrl('enquiries') + (e.email ? '?q=' + encodeURIComponent(e.email) : ''),
    });
  }
  for (const p of recentPages) {
    const at = localStamp(p.updated_at);
    if (!at) continue;
    const created = p.created_at === p.updated_at;
    activity.push({
      kind: 'page',
      title: created ? 'Page added to the CMS' : 'Page updated',
      detail: `${p.title} · /${p.slug ? p.slug + '/' : ''}`,
      at,
      href: adminUrl('pages/edit') + '?id=' + p.id,
    });
  }
  const generatedAt = utcStamp(generatedRaw);
  if (generatedAt) {
    activity.push({
      kind: 'sitemap',
      title: 'Sitemap generated',
      detail: `${urlCount} URL${urlCount === 1 ? '' : 's'} published to sitemap.xml`,
      at: generatedAt,
      href: adminUrl('sitemap'),
    });
  }
  activity.sort((a, b) => b.at.getTime() - a.at.getTime());

  return {
    enquiries: {
      total: Number(counts?.total ?? 0),
      last30: Number(counts?.last30 ?? 0),
      prev30: Number(counts?.prev30 ?? 0),
    },
    sources: sources.map((s) => ({ source: s.source || 'Website', n: Number(s.n) })),
    months,
    pages,
    sitemap: { generatedAt, urlCount },
    latest,
    activity: activity.slice(0, 5),
  };
}

/* ---- Search -------------------------------------------------------------- */

export interface SearchPageRow {
  id: number;
  title: string;
  slug: string;
  meta_title: string;
  status: string;
  robots_meta: string;
  is_cms: number;
}

export interface SearchResults {
  enquiries: EnquiryRow[];
  pages: SearchPageRow[];
}

/** A LIKE pattern for a free-text term, with its wildcards escaped. */
function likePattern(term: string): string {
  return '%' + term.replace(/[\\%_]/g, (c) => '\\' + c) + '%';
}

/** Enquiries and pages matching `term`. Throws if MySQL is unreachable. */
export async function searchPanel(term: string, limit = 25): Promise<SearchResults> {
  const like = likePattern(term);
  const lim = Math.max(1, Math.trunc(limit));

  const enquiries = await query<EnquiryRow>(
    `SELECT id, full_name, email, phone, company, source, page_url, created_at
       FROM enquiries
      WHERE full_name LIKE ? OR email LIKE ? OR company LIKE ? OR phone LIKE ? OR source LIKE ?
      ORDER BY created_at DESC, id DESC
      LIMIT ${lim}`,
    [like, like, like, like, like]
  );

  const pages = await query<SearchPageRow>(
    `SELECT id, title, slug, meta_title, status, robots_meta, is_cms
       FROM pages
      WHERE title LIKE ? OR slug LIKE ? OR meta_title LIKE ?
      ORDER BY slug = '' DESC, slug ASC
      LIMIT ${lim}`,
    [like, like, like]
  );

  return { enquiries, pages };
}
