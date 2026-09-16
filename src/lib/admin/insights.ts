/**
 * The figures behind the dashboard and the panel-wide search.
 *
 * Every number is a query against the tables the other screens manage — the
 * imported www.valunxt.com database — so the dashboard can never disagree with
 * them, and nothing here is a placeholder.
 */
import 'server-only';

import { likePattern, rowLimit } from '@/lib/db';
import { adminUrl } from './config';
import { query } from './db';
import { dbStamp, utcStamp } from './format';
import { SITEMAP_COUNT_KEY, SITEMAP_GENERATED_KEY, seoSetting, seoStats, type SeoStats } from './seo-lib';
import { listPosts } from '@/lib/blog/db';
import type { BlogPost } from '@/lib/blog/types';
import { latestLeads, leadStats, listLeads, type Lead, type LeadStats } from '@/lib/leads';

export interface MonthCount {
  /** "2026-09" */
  key: string;
  /** "Sep" */
  label: string;
  count: number;
}

export interface ActivityItem {
  kind: 'lead' | 'post' | 'page' | 'sitemap' | 'security' | 'portal';
  title: string;
  detail: string;
  at: Date;
  href: string;
}

export interface Deadline {
  id: number;
  client_id: number;
  client: string;
  type: string;
  period: string;
  due_date: string;
  penalty_note: string;
}

export interface DashboardData {
  leads: LeadStats;
  posts: { total: number; published: number; draft: number; featured: number };
  pages: SeoStats;
  authors: number;
  redirects: { total: number; active: number };
  admins: number;
  portal: { clients: number; active: number; users: number; openRequests: number };
  deadlines: Deadline[];
  security: { last30: number; loginFails30: number };
  analytics: { hits: number; sessions: number; first: string; last: string };
  sitemap: { generatedAt: Date | null; urlCount: number; runs: number };
  months: MonthCount[];
  sources: Array<{ source: string; n: number }>;
  latest: Lead[];
  activity: ActivityItem[];
}

const MONTHS = 8;

/** The last `MONTHS` calendar months, oldest first, ending with this one. */
function monthKeys(now = new Date()): MonthCount[] {
  const out: MonthCount[] = [];
  for (let i = MONTHS - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    out.push({
      key: `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`,
      label: d.toLocaleDateString('en-GB', { month: 'short', timeZone: 'UTC' }),
      count: 0,
    });
  }
  return out;
}

/** Who a lead is from, for one line of copy. */
export function leadWho(l: Pick<Lead, 'name' | 'company' | 'email'>): string {
  const name = l.name?.trim();
  const company = l.company?.trim();
  if (name && company && !/^none$/i.test(company)) return `${name}, ${company}`;
  return name || company || l.email || 'Website visitor';
}

async function one(statement: string, args: unknown[] = []): Promise<number> {
  const rows = await query<{ n: number | string | null }>(statement, args);
  return Number(rows[0]?.n ?? 0);
}

/** Everything the dashboard shows. Throws if MySQL is unreachable. */
export async function dashboardData(): Promise<DashboardData> {
  const leads = await leadStats();

  const [postRow] = await query<{ total: number; published: string | null; draft: string | null; featured: string | null }>(
    `SELECT COUNT(*) AS total, SUM(status = 'published') AS published, SUM(status <> 'published') AS draft,
            SUM(featured = 1) AS featured FROM vx_posts`
  );

  const months = monthKeys();
  for (const row of await query<{ ym: string; n: number }>(
    `SELECT DATE_FORMAT(created_at, '%Y-%m') AS ym, COUNT(*) AS n FROM vx_leads WHERE created_at >= ? GROUP BY ym`,
    [`${months[0].key}-01 00:00:00`]
  )) {
    const m = months.find((x) => x.key === row.ym);
    if (m) m.count = Number(row.n);
  }

  const sources = (
    await query<{ source: string | null; n: number }>(
      "SELECT COALESCE(NULLIF(service, ''), NULLIF(source, ''), 'Website') AS source, COUNT(*) AS n FROM vx_leads GROUP BY 1 ORDER BY n DESC LIMIT 6"
    )
  ).map((s) => ({ source: String(s.source), n: Number(s.n) }));

  const deadlines = await query<Deadline>(
    `SELECT d.id, d.client_id, COALESCE(NULLIF(c.trade_name, ''), c.legal_name) AS client, d.type,
            COALESCE(d.period, '') AS period, d.due_date, COALESCE(d.penalty_note, '') AS penalty_note
       FROM pa_deadlines d JOIN pa_clients c ON c.id = d.client_id
      WHERE d.status = 'pending'
      ORDER BY d.due_date ASC, d.id ASC
      LIMIT 6`
  );

  const [hitRow] = await query<{ hits: number; sessions: number; first: string | null; last: string | null }>(
    'SELECT COUNT(*) AS hits, COUNT(DISTINCT sid) AS sessions, MIN(ts) AS first, MAX(ts) AS last FROM vx_hits WHERE is_bot = 0'
  );

  const generatedRaw = await seoSetting(SITEMAP_GENERATED_KEY, '');

  /* ---- Activity: the newest events of every kind, merged ---- */
  const activity: ActivityItem[] = [];
  const latest = await latestLeads(5);
  for (const l of latest) {
    const at = dbStamp(l.created_at);
    if (at) {
      activity.push({
        kind: 'lead',
        title: 'New lead',
        detail: `${leadWho(l)} · ${l.service || l.source || 'Website'}`,
        at,
        href: adminUrl('leads/view') + '?id=' + l.id,
      });
    }
  }
  for (const p of await query<{ id: number; title: string; created_at: string; updated_at: string }>(
    'SELECT id, title, created_at, updated_at FROM vx_posts ORDER BY updated_at DESC, id DESC LIMIT 4'
  )) {
    const at = dbStamp(p.updated_at);
    if (at) {
      activity.push({
        kind: 'post',
        title: p.created_at === p.updated_at ? 'Post created' : 'Post updated',
        detail: p.title,
        at,
        href: adminUrl('blogs/edit') + '?id=' + p.id,
      });
    }
  }
  for (const p of await query<{ id: number; title: string; rel_path: string; updated_at: string; updated_by: string | null }>(
    "SELECT id, title, rel_path, updated_at, updated_by FROM vx_page_seo WHERE updated_by IS NOT NULL AND updated_by <> '' ORDER BY updated_at DESC LIMIT 4"
  )) {
    const at = dbStamp(p.updated_at);
    if (at) {
      activity.push({
        kind: 'page',
        title: 'Page SEO updated',
        detail: `${p.title || p.rel_path} · by ${p.updated_by}`,
        at,
        href: adminUrl('pages/edit') + '?id=' + p.id,
      });
    }
  }
  for (const r of await query<{ ts: string; total_urls: number; added: number; removed: number; status: string }>(
    'SELECT ts, total_urls, added, removed, status FROM vx_sitemap_runs ORDER BY ts DESC, id DESC LIMIT 2'
  )) {
    const at = dbStamp(r.ts);
    if (at) {
      activity.push({
        kind: 'sitemap',
        title: r.status === 'success' ? 'Sitemap generated' : 'Sitemap generation failed',
        detail: `${r.total_urls} URLs · +${r.added} / −${r.removed}`,
        at,
        href: adminUrl('sitemap'),
      });
    }
  }
  for (const e of await query<{ ts: string; type: string; detail: string | null; ip: string | null }>(
    'SELECT ts, type, detail, ip FROM vx_security_events ORDER BY ts DESC, id DESC LIMIT 3'
  )) {
    const at = dbStamp(e.ts);
    if (at) {
      activity.push({
        kind: 'security',
        title: e.type.replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase()),
        detail: [e.detail, e.ip].filter(Boolean).join(' · ').slice(0, 90),
        at,
        href: adminUrl('security'),
      });
    }
  }
  for (const a of await query<{ event_type: string; detail: string | null; created_at: string; client_id: number | null }>(
    "SELECT event_type, detail, created_at, client_id FROM pa_activity_log WHERE event_type <> 'login' ORDER BY created_at DESC, id DESC LIMIT 3"
  )) {
    const at = dbStamp(a.created_at);
    if (at) {
      activity.push({
        kind: 'portal',
        title: `Portal: ${a.event_type}`,
        detail: String(a.detail ?? ''),
        at,
        href: a.client_id ? adminUrl('clients/view') + '?id=' + a.client_id : adminUrl('portal-activity'),
      });
    }
  }
  activity.sort((a, b) => b.at.getTime() - a.at.getTime());

  return {
    leads,
    posts: {
      total: Number(postRow?.total ?? 0),
      published: Number(postRow?.published ?? 0),
      draft: Number(postRow?.draft ?? 0),
      featured: Number(postRow?.featured ?? 0),
    },
    pages: await seoStats(),
    authors: await one('SELECT COUNT(*) AS n FROM vx_authors'),
    redirects: {
      total: await one('SELECT COUNT(*) AS n FROM vx_redirects'),
      active: await one('SELECT COUNT(*) AS n FROM vx_redirects WHERE active = 1'),
    },
    admins: await one('SELECT COUNT(*) AS n FROM vx_users'),
    portal: {
      clients: await one('SELECT COUNT(*) AS n FROM pa_clients'),
      active: await one("SELECT COUNT(*) AS n FROM pa_clients WHERE onboarding_status = 'Active'"),
      users: await one('SELECT COUNT(*) AS n FROM pa_users'),
      openRequests: await one("SELECT COUNT(*) AS n FROM pa_document_requests WHERE status = 'Open'"),
    },
    deadlines: deadlines.map((d) => ({ ...d, id: Number(d.id), client_id: Number(d.client_id) })),
    security: {
      last30: await one('SELECT COUNT(*) AS n FROM vx_security_events WHERE ts >= UTC_TIMESTAMP() - INTERVAL 30 DAY'),
      loginFails30: await one(
        "SELECT COUNT(*) AS n FROM vx_security_events WHERE type = 'login_fail' AND ts >= UTC_TIMESTAMP() - INTERVAL 30 DAY"
      ),
    },
    analytics: {
      hits: Number(hitRow?.hits ?? 0),
      sessions: Number(hitRow?.sessions ?? 0),
      first: String(hitRow?.first ?? ''),
      last: String(hitRow?.last ?? ''),
    },
    sitemap: {
      generatedAt: utcStamp(generatedRaw),
      urlCount: Number(await seoSetting(SITEMAP_COUNT_KEY, '0')),
      runs: await one('SELECT COUNT(*) AS n FROM vx_sitemap_runs'),
    },
    months,
    sources,
    latest,
    activity: activity.slice(0, 8),
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

export interface SearchClientRow {
  id: number;
  legal_name: string;
  trade_name: string;
  entity_type: string;
  onboarding_status: string;
}

export interface SearchResults {
  leads: Lead[];
  pages: SearchPageRow[];
  posts: BlogPost[];
  clients: SearchClientRow[];
}

/** Leads, pages, posts and portal clients matching `term`. Throws if MySQL is unreachable. */
export async function searchPanel(term: string, limit = 25): Promise<SearchResults> {
  const like = likePattern(term);
  const lim = rowLimit(limit, 25);

  const leads = (await listLeads({ q: term })).slice(0, lim);

  const pages = await query<SearchPageRow>(
    `SELECT id, title, rel_path AS slug, COALESCE(meta_title, '') AS meta_title, status,
            COALESCE(NULLIF(robots, ''), 'index, follow') AS robots_meta, is_cms
       FROM vx_page_seo
      WHERE title LIKE ? OR rel_path LIKE ? OR meta_title LIKE ?
      ORDER BY rel_path = '' DESC, rel_path ASC
      LIMIT ${lim}`,
    [like, like, like]
  );

  let posts: BlogPost[] = [];
  try {
    posts = (await listPosts({ q: term })).slice(0, lim);
  } catch {
    /* the other sets are still worth showing */
  }

  const clients = await query<SearchClientRow>(
    `SELECT id, legal_name, COALESCE(trade_name, '') AS trade_name, entity_type, onboarding_status
       FROM pa_clients
      WHERE legal_name LIKE ? OR trade_name LIKE ? OR trade_licence_no LIKE ? OR vat_trn LIKE ?
      ORDER BY legal_name
      LIMIT ${lim}`,
    [like, like, like, like]
  );

  return { leads, pages, posts, clients };
}
