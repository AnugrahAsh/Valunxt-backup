/**
 * Admin — Analytics.
 *
 * The page views the previous www.valunxt.com site's own tracker recorded in
 * `vx_hits` (with `vx_geo_cache` behind its countries): which pages, from
 * where, on what. The Next.js site does not write to this table — Google
 * Analytics measures it — so what is here is the history that came with the
 * database, reported rather than discarded.
 */
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

import AdminShell from '@/components/admin/AdminShell';
import Icon from '@/components/admin/Icon';
import Pager from '@/components/admin/Pager';
import { adminUrl } from '@/lib/admin/config';
import { query } from '@/lib/admin/db';
import { dbStamp, formatCount, formatDate, formatDateTime } from '@/lib/admin/format';
import { currentUser } from '@/lib/admin/session';

export const metadata: Metadata = {
  title: 'Analytics — Valunxt Admin',
  robots: 'noindex, nofollow',
};

const RANGES: Array<[string, string, number]> = [
  ['all', 'All recorded', 0],
  ['7', 'Last 7 days', 7],
  ['30', 'Last 30 days', 30],
  ['90', 'Last 90 days', 90],
];
const PER_PAGE = 25;

type Breakdown = Array<{ k: string; n: number }>;

function Bars({ title, rows, total, empty }: { title: string; rows: Breakdown; total: number; empty: string }) {
  return (
    <section className="panel">
      <div className="panel-head">
        <h3>{title}</h3>
      </div>
      <div className="panel-body">
        {rows.length ? (
          <ul className="hbar-list">
            {rows.map((r) => (
              <li key={r.k}>
                <div className="hbar-label">
                  <span title={r.k}>{r.k}</span>
                  <span className="counter-of">
                    {formatCount(r.n)} · {total ? Math.round((r.n / total) * 100) : 0}%
                  </span>
                </div>
                <div className="hbar-track">
                  <div className="hbar" style={{ width: `${total ? Math.max(2, (r.n / total) * 100) : 0}%` }} />
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="counter-of">{empty}</p>
        )}
      </div>
    </section>
  );
}

export default async function AnalyticsPage({ searchParams }: { searchParams: Promise<{ range?: string; bots?: string; p?: string }> }) {
  const user = await currentUser();
  if (!user) redirect(adminUrl(''));

  const sp = await searchParams;
  const range = RANGES.find(([k]) => k === sp.range) ?? RANGES[0];
  const withBots = sp.bots === '1';
  const where: string[] = [];
  if (!withBots) where.push('is_bot = 0');
  if (range[2]) where.push(`ts >= UTC_TIMESTAMP() - INTERVAL ${range[2]} DAY`);
  const W = where.length ? 'WHERE ' + where.join(' AND ') : '';

  const top = async (col: string, limit = 8, extra = '') =>
    (await query<{ k: string | null; n: number }>(
      `SELECT COALESCE(NULLIF(${col}, ''), '(none)') AS k, COUNT(*) AS n FROM vx_hits ${W} ${extra} GROUP BY k ORDER BY n DESC LIMIT ${limit}`
    )).map((r) => ({ k: String(r.k), n: Number(r.n) }));

  let error = '';
  let kpi = { views: 0, sessions: 0, bots: 0, avgLoad: 0, first: '', last: '', countries: 0 };
  let pages: Breakdown = [];
  let referrers: Breakdown = [];
  let devices: Breakdown = [];
  let browsers: Breakdown = [];
  let systems: Breakdown = [];
  let countries: Breakdown = [];
  let days: Breakdown = [];
  let recent: Array<Record<string, string>> = [];
  let recentTotal = 0;
  const page = Math.max(1, Number(sp.p ?? 1) || 1);

  try {
    const [k] = await query<{ views: number; sessions: number; first: string | null; last: string | null; countries: number; avg_load: number | null }>(
      `SELECT COUNT(*) AS views, COUNT(DISTINCT sid) AS sessions, MIN(ts) AS first, MAX(ts) AS last,
              COUNT(DISTINCT country) AS countries, AVG(NULLIF(load_ms, 0)) AS avg_load
         FROM vx_hits ${W}`
    );
    const [b] = await query<{ n: number }>(
      `SELECT COUNT(*) AS n FROM vx_hits WHERE is_bot = 1${range[2] ? ` AND ts >= UTC_TIMESTAMP() - INTERVAL ${range[2]} DAY` : ''}`
    );
    kpi = {
      views: Number(k?.views ?? 0),
      sessions: Number(k?.sessions ?? 0),
      bots: Number(b?.n ?? 0),
      avgLoad: Math.round(Number(k?.avg_load ?? 0)),
      first: String(k?.first ?? ''),
      last: String(k?.last ?? ''),
      countries: Number(k?.countries ?? 0),
    };
    [pages, referrers, devices, browsers, systems, countries] = await Promise.all([
      top('path', 10),
      top('ref_host', 8),
      top('device', 6),
      top('browser', 6),
      top('os', 6),
      top('country', 10),
    ]);
    days = (
      await query<{ k: string; n: number }>(`SELECT DATE(ts) AS k, COUNT(*) AS n FROM vx_hits ${W} GROUP BY k ORDER BY k DESC LIMIT 30`)
    )
      .map((r) => ({ k: String(r.k), n: Number(r.n) }))
      .reverse();
    const [c] = await query<{ n: number }>(`SELECT COUNT(*) AS n FROM vx_hits ${W}`);
    recentTotal = Number(c?.n ?? 0);
    recent = (
      await query<Record<string, unknown>>(
        `SELECT id, ts, path, ref_host, utm_source, device, browser, os, country, city, is_bot FROM vx_hits ${W} ORDER BY ts DESC, id DESC LIMIT ${PER_PAGE} OFFSET ${(page - 1) * PER_PAGE}`
      )
    ).map((r) => Object.fromEntries(Object.entries(r).map(([key, v]) => [key, v === null ? '' : String(v)])));
  } catch (e) {
    error = 'Analytics unavailable. Please ensure MySQL is running. ' + String(e).slice(0, 120);
  }

  const maxDay = Math.max(0, ...days.map((d) => d.n));
  const url = (over: { range?: string; bots?: boolean; p?: number }) => {
    const args = new URLSearchParams();
    const r = over.range ?? range[0];
    if (r !== 'all') args.set('range', r);
    if (over.bots ?? withBots) args.set('bots', '1');
    if ((over.p ?? 1) > 1) args.set('p', String(over.p));
    const s = args.toString();
    return adminUrl('analytics') + (s ? '?' + s : '');
  };

  return (
    <AdminShell active="analytics" user={user}>
      <div className="page-head">
        <div className="crumbs">
          Home <span className="sep">/</span> Analytics
        </div>
        <h1>Analytics</h1>
        <p>
          Page views recorded by the previous site&rsquo;s tracker
          {kpi.first ? `, ${formatDate(dbStamp(kpi.first))} to ${formatDate(dbStamp(kpi.last))}` : ''}. The current site is measured
          by Google Analytics; this is the history that came with the database.
        </p>
      </div>

      {error ? (
        <div className="flash err" role="alert">
          <Icon name="alertCircle" />
          <span className="flash-text">{error}</span>
        </div>
      ) : null}

      <div className="segmented" role="group" aria-label="Date range">
        {RANGES.map(([k, label]) => (
          <a key={k} href={url({ range: k, p: 1 })} className={'seg' + (k === range[0] ? ' is-on' : '')} aria-current={k === range[0] ? 'true' : undefined}>
            {label}
          </a>
        ))}
        <a href={url({ bots: !withBots, p: 1 })} className={'seg' + (withBots ? ' is-on' : '')}>
          {withBots ? 'Including bots' : 'Excluding bots'}
        </a>
      </div>

      <section className="stat-grid" style={{ marginTop: 16 }}>
        <div className="stat-card feature">
          <div className="ico">
            <Icon name="eye" size={22} />
          </div>
          <div className="label">Page Views</div>
          <div className="value">{formatCount(kpi.views)}</div>
        </div>
        <div className="stat-card">
          <div className="ico sky">
            <Icon name="users" size={22} />
          </div>
          <div className="label">Sessions</div>
          <div className="value">{formatCount(kpi.sessions)}</div>
          <div className="trend flat">
            <span className="muted">{kpi.sessions ? (kpi.views / kpi.sessions).toFixed(1) : '0'} pages per session</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="ico violet">
            <Icon name="globe" size={22} />
          </div>
          <div className="label">Countries</div>
          <div className="value">{formatCount(kpi.countries)}</div>
        </div>
        <div className="stat-card">
          <div className="ico green">
            <Icon name="shield" size={22} />
          </div>
          <div className="label">Bot Hits</div>
          <div className="value">{formatCount(kpi.bots)}</div>
          <div className="trend flat">
            <span className="muted">{kpi.avgLoad ? `avg load ${kpi.avgLoad} ms` : 'no load timings recorded'}</span>
          </div>
        </div>
      </section>

      <section className="panel" style={{ marginTop: 20 }}>
        <div className="panel-head">
          <div>
            <h3>Views per day</h3>
            <div className="panel-sub">{days.length ? `${days.length} day${days.length === 1 ? '' : 's'} with traffic` : 'No traffic recorded'}</div>
          </div>
        </div>
        <div className="panel-body">
          <div className={'chart' + (maxDay === 0 ? ' is-empty' : '')}>
            {days.map((d, i) => (
              <div className="bar-col" key={d.k} title={`${d.k}: ${d.n} views`}>
                <div className="bar-track">
                  <div className="bar" data-n={d.n} style={{ height: maxDay ? `${Math.max(3, (d.n / maxDay) * 100)}%` : '3%', animationDelay: `${i * 30}ms` }} />
                </div>
                <span className="m">{d.k.slice(5)}</span>
              </div>
            ))}
            {maxDay === 0 ? <div className="chart-empty">No page views in this range.</div> : null}
          </div>
        </div>
      </section>

      <div className="panel-grid" style={{ marginTop: 20 }}>
        <Bars title="Top pages" rows={pages} total={kpi.views} empty="No pages recorded." />
        <Bars title="Countries" rows={countries} total={kpi.views} empty="No countries recorded." />
      </div>
      <div className="panel-grid three" style={{ marginTop: 20 }}>
        <Bars title="Devices" rows={devices} total={kpi.views} empty="No devices recorded." />
        <Bars title="Browsers" rows={browsers} total={kpi.views} empty="No browsers recorded." />
        <Bars title="Operating systems" rows={systems} total={kpi.views} empty="No systems recorded." />
      </div>
      <div className="panel-grid" style={{ marginTop: 20 }}>
        <Bars title="Referrers" rows={referrers} total={kpi.views} empty="No referrers recorded." />
        <section className="panel">
          <div className="panel-head">
            <h3>What is recorded</h3>
          </div>
          <div className="panel-body">
            <p className="panel-lede">
              Each row of <code>vx_hits</code> is one page view: the path, the referring site and campaign, the device,
              browser and system, the country and city resolved through <code>vx_geo_cache</code>, the screen width, the
              load time, and whether the visitor was a bot. Sessions are counted by the tracker&rsquo;s session id.
            </p>
          </div>
        </section>
      </div>

      <section className="panel" style={{ marginTop: 20 }}>
        <div className="panel-head">
          <h3>
            Recent page views <span className="count-chip">{formatCount(recentTotal)}</span>
          </h3>
        </div>
        <div className="panel-body flush">
          {recent.length ? (
            <>
              <div className="table-wrap">
                <table className="data">
                  <thead>
                    <tr>
                      <th>When</th>
                      <th>Page</th>
                      <th>Referrer</th>
                      <th>Device</th>
                      <th>Location</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent.map((h) => (
                      <tr key={h.id}>
                        <td className="nowrap">{formatDateTime(dbStamp(h.ts))}</td>
                        <td>
                          <code className="cell-code">{h.path}</code>
                          {h.is_bot === '1' ? <span className="pill warnp" style={{ marginLeft: 6 }}>bot</span> : null}
                        </td>
                        <td>{h.ref_host || h.utm_source || <span className="counter-of">direct</span>}</td>
                        <td className="nowrap">{[h.device, h.browser, h.os].filter(Boolean).join(' · ') || '—'}</td>
                        <td>{[h.city, h.country].filter(Boolean).join(', ') || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pager page={page} pages={Math.max(1, Math.ceil(recentTotal / PER_PAGE))} total={recentTotal} perPage={PER_PAGE} noun="page views" href={(p) => url({ p })} />
            </>
          ) : (
            <div className="empty-state compact">
              <p>No page views in this range.</p>
            </div>
          )}
        </div>
      </section>
    </AdminShell>
  );
}
