/**
 * Admin — Overview.
 *
 * Every figure is a query against the imported www.valunxt.com database (see
 * lib/admin/insights.ts): leads from the CRM, posts, page SEO and redirects
 * from the CMS, the client portal's clients and deadlines, the security log,
 * the sitemap history and the analytics the previous panel collected. Nothing
 * here is a placeholder, and every card links to the screen that manages it.
 */
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

import AdminShell from '@/components/admin/AdminShell';
import Icon, { type IconName } from '@/components/admin/Icon';
import { adminUrl, brandText } from '@/lib/admin/config';
import { dbStamp, formatCount, formatDate, formatDateTime, timeAgo } from '@/lib/admin/format';
import { isAdmin } from '@/lib/admin/guard';
import { dashboardData, leadWho, type DashboardData } from '@/lib/admin/insights';
import { currentUser } from '@/lib/admin/session';
import { LEAD_STATUS_LABEL, LEAD_STATUS_PILL } from '@/lib/leads';

export const metadata: Metadata = {
  title: 'Overview — Valunxt Admin',
  robots: 'noindex, nofollow',
};

const ACTIVITY_ICON: Record<string, [IconName, string]> = {
  lead: ['message', ''],
  post: ['bookOpen', 'violet'],
  page: ['edit', 'violet'],
  sitemap: ['globe', 'green'],
  security: ['shield', 'sky'],
  portal: ['users', 'green'],
};

type Trend = { dir: 'up' | 'down' | 'flat'; text: string; muted?: string };

/** The last-30-days card's comparison line. */
function periodTrend(last30: number, prev30: number): Trend {
  if (prev30 === 0 && last30 === 0) return { dir: 'flat', text: 'No change', muted: 'vs previous 30 days' };
  if (prev30 === 0) return { dir: 'up', text: `+${last30} new`, muted: 'vs none before' };
  const pct = Math.round(((last30 - prev30) / prev30) * 100);
  if (pct === 0) return { dir: 'flat', text: '0%', muted: 'vs previous 30 days' };
  return { dir: pct > 0 ? 'up' : 'down', text: `${pct > 0 ? '+' : ''}${pct}%`, muted: 'vs previous 30 days' };
}

function TrendLine({ trend }: { trend: Trend }) {
  const icon: IconName = trend.dir === 'up' ? 'trendUp' : trend.dir === 'down' ? 'trendDown' : 'minus';
  return (
    <div className={`trend ${trend.dir}`}>
      <Icon name={icon} size={14} stroke={2.5} />
      {trend.text} {trend.muted ? <span className="muted">{trend.muted}</span> : null}
    </div>
  );
}

/** Days from today (UTC) to a 'YYYY-MM-DD' date; negative when past. */
function daysUntil(date: string, now = new Date()): number {
  const d = Date.UTC(Number(date.slice(0, 4)), Number(date.slice(5, 7)) - 1, Number(date.slice(8, 10)));
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return Math.round((d - today) / 86400000);
}

export default async function DashboardPage() {
  const user = await currentUser();
  if (!user) redirect(adminUrl(''));

  let data: DashboardData | null = null;
  let error = '';
  try {
    data = await dashboardData();
  } catch (e) {
    error = String(e).slice(0, 200);
  }

  const admin = isAdmin(user);
  const firstName = brandText(user.name).split(' ')[0];
  const now = new Date();
  const maxMonth = Math.max(0, ...(data?.months ?? []).map((m) => m.count));
  const thisMonthKey = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;

  const card = (
    href: string,
    icon: IconName,
    tone: string,
    label: string,
    value: string,
    foot: React.ReactNode,
    feature = false
  ) => (
    <a className={'stat-card as-link' + (feature ? ' feature' : '')} href={href}>
      <div className={`ico ${tone}`}>
        <Icon name={icon} size={22} />
      </div>
      <div className="label">{label}</div>
      <div className="value">{value}</div>
      {foot}
    </a>
  );

  return (
    <AdminShell active="dashboard" user={user}>
      <div className="page-head">
        <div className="crumbs">
          Home <span className="sep">/</span> Overview
        </div>
        <h1>Welcome back, {firstName} 👋</h1>
        <p>Here&rsquo;s what&rsquo;s happening across Valunxt today.</p>
      </div>

      {!data ? (
        <div className="flash err" role="alert">
          <Icon name="alertCircle" />
          <span className="flash-text">
            Could not load the dashboard figures. Please ensure MySQL is running, then reload.{error ? ` (${error})` : ''}
          </span>
        </div>
      ) : null}

      <section className="stat-grid">
        {card(
          adminUrl('leads'),
          'message',
          '',
          'Leads',
          data ? formatCount(data.leads.total) : '—',
          data ? (
            <div className="trend">
              <Icon name="clock" size={14} stroke={2.4} />
              {formatCount(data.leads.open)} <span className="muted">open in the pipeline</span>
            </div>
          ) : (
            <div className="trend flat">—</div>
          ),
          true
        )}
        {card(
          adminUrl('leads'),
          'trendUp',
          'sky',
          'Leads, Last 30 Days',
          data ? formatCount(data.leads.last30) : '—',
          data ? <TrendLine trend={periodTrend(data.leads.last30, data.leads.prev30)} /> : <div className="trend flat">—</div>
        )}
        {card(
          adminUrl('blogs'),
          'bookOpen',
          'violet',
          'Published Posts',
          data ? formatCount(data.posts.published) : '—',
          data ? (
            <div className="trend flat">
              <Icon name="edit" size={14} stroke={2.4} />
              {data.posts.draft} <span className="muted">draft{data.posts.draft === 1 ? '' : 's'} · {data.authors} author{data.authors === 1 ? '' : 's'}</span>
            </div>
          ) : (
            <div className="trend flat">—</div>
          )
        )}
        {card(
          adminUrl('pages'),
          'file',
          'green',
          'Published Pages',
          data ? formatCount(data.pages.published) : '—',
          data ? (
            <div className="trend flat">
              <Icon name="globe" size={14} stroke={2.4} />
              {data.sitemap.urlCount} <span className="muted">sitemap URLs{data.sitemap.generatedAt ? ` · ${formatDate(data.sitemap.generatedAt)}` : ''}</span>
            </div>
          ) : (
            <div className="trend flat">—</div>
          )
        )}
      </section>

      <section className="stat-grid" style={{ marginTop: 16 }}>
        {card(
          adminUrl('redirects'),
          'arrowRight',
          'sky',
          'Active Redirects',
          data ? formatCount(data.redirects.active) : '—',
          data ? (
            <div className="trend flat">
              <span className="muted">of {data.redirects.total} rules</span>
            </div>
          ) : null
        )}
        {admin
          ? card(
              adminUrl('clients'),
              'users',
              'green',
              'Portal Clients',
              data ? formatCount(data.portal.clients) : '—',
              data ? (
                <div className="trend flat">
                  <span className="muted">
                    {data.portal.active} active · {data.portal.openRequests} open document request{data.portal.openRequests === 1 ? '' : 's'}
                  </span>
                </div>
              ) : null
            )
          : null}
        {card(
          adminUrl('analytics'),
          'chart',
          'violet',
          'Recorded Page Views',
          data ? formatCount(data.analytics.hits) : '—',
          data ? (
            <div className="trend flat">
              <span className="muted">
                {data.analytics.sessions} sessions
                {data.analytics.first ? ` · ${formatDate(dbStamp(data.analytics.first))} – ${formatDate(dbStamp(data.analytics.last))}` : ''}
              </span>
            </div>
          ) : null
        )}
        {admin
          ? card(
              adminUrl('security'),
              'shield',
              data && data.security.loginFails30 ? 'violet' : 'green',
              'Security Events, 30 Days',
              data ? formatCount(data.security.last30) : '—',
              data ? (
                <div className="trend flat">
                  <span className="muted">
                    {data.security.loginFails30} failed sign-in{data.security.loginFails30 === 1 ? '' : 's'} · {data.admins} admin account{data.admins === 1 ? '' : 's'}
                  </span>
                </div>
              ) : null
            )
          : null}
      </section>

      <section className="panel-grid">
        <div className="panel">
          <div className="panel-head">
            <div>
              <h3>Leads Overview</h3>
              <div className="panel-sub">Leads per month, last 8 months</div>
            </div>
            <a href={adminUrl('leads')} className="link">
              Leads CRM
              <Icon name="arrowRight" size={14} stroke={2.4} />
            </a>
          </div>
          <div className="panel-body">
            <div className={'chart' + (maxMonth === 0 ? ' is-empty' : '')}>
              {(data?.months ?? []).map((m, i) => (
                <div className={'bar-col' + (m.key === thisMonthKey ? ' current' : '')} key={m.key} title={`${m.label}: ${m.count} lead${m.count === 1 ? '' : 's'}`}>
                  <div className="bar-track">
                    <div
                      className="bar"
                      data-n={m.count}
                      style={{ height: maxMonth ? `${Math.max(3, (m.count / maxMonth) * 100)}%` : '3%', animationDelay: `${i * 60}ms` }}
                    />
                  </div>
                  <span className="m">{m.label}</span>
                </div>
              ))}
              {maxMonth === 0 ? <div className="chart-empty">{data ? 'No leads in the last 8 months.' : 'Figures unavailable.'}</div> : null}
            </div>
            {data && data.sources.length ? (
              <ul className="source-list">
                {data.sources.map((s) => (
                  <li key={s.source}>
                    <span>{s.source}</span>
                    <span className="count-chip">{s.n}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <h3>Recent Activity</h3>
          </div>
          <div className="panel-body">
            {data && data.activity.length ? (
              <ul className="activity">
                {data.activity.map((a) => {
                  const [icon, tone] = ACTIVITY_ICON[a.kind];
                  return (
                    <li key={a.kind + a.href + a.at.getTime()}>
                      <span className={`dot ${tone}`}>
                        <Icon name={icon} size={17} />
                      </span>
                      <div className="txt">
                        <a className="who" href={a.href}>
                          {a.title}
                        </a>
                        <div className="what">{a.detail}</div>
                        <div className="when" title={formatDateTime(a.at)}>
                          {timeAgo(a.at, now)}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="empty-state compact">
                <p>{data ? 'Nothing has happened yet.' : 'Activity unavailable.'}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className={admin ? 'panel-grid' : ''} style={{ marginTop: 20 }}>
        <div className="panel">
          <div className="panel-head">
            <h3>Latest Leads</h3>
            <a href={adminUrl('leads')} className="link">
              Manage leads
              <Icon name="arrowRight" size={14} stroke={2.4} />
            </a>
          </div>
          <div className="panel-body flush">
            <div className="table-wrap">
              <table className="data">
                <thead>
                  <tr>
                    <th>Lead</th>
                    <th>Service</th>
                    <th>Stage</th>
                    <th>Received</th>
                  </tr>
                </thead>
                <tbody>
                  {!data || data.latest.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="muted-cell">
                        {data ? 'No leads yet. Submissions from the website forms appear here.' : 'Leads unavailable.'}
                      </td>
                    </tr>
                  ) : (
                    data.latest.map((l) => (
                      <tr key={l.id}>
                        <td className="title-cell">
                          <a href={adminUrl('leads/view') + '?id=' + l.id}>{leadWho(l)}</a>
                          <span className="sub">{l.email}</span>
                        </td>
                        <td>{l.service || l.source || '—'}</td>
                        <td>
                          <span className={`pill ${LEAD_STATUS_PILL[l.status] ?? 'new'}`}>
                            {LEAD_STATUS_LABEL[l.status as keyof typeof LEAD_STATUS_LABEL] ?? l.status}
                          </span>
                        </td>
                        <td className="nowrap">{formatDateTime(dbStamp(l.created_at))}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {admin ? (
          <div className="panel">
            <div className="panel-head">
              <h3>Upcoming Client Deadlines</h3>
              <a href={adminUrl('deadlines') + '?status=pending'} className="link">
                All deadlines
                <Icon name="arrowRight" size={14} stroke={2.4} />
              </a>
            </div>
            <div className="panel-body flush">
              {data && data.deadlines.length ? (
                <ul className="mini-list">
                  {data.deadlines.map((d) => {
                    const days = daysUntil(d.due_date, now);
                    return (
                      <li key={d.id}>
                        <a href={adminUrl('clients/view') + '?id=' + d.client_id}>
                          {d.type}
                          {d.period ? ` · ${d.period}` : ''}
                        </a>
                        <span className="counter-of">{d.client}</span>
                        <span className={`pill ${days < 0 ? 'warnp' : days <= 14 ? 'wait' : 'ok'}`}>
                          {days < 0 ? `${-days}d overdue` : days === 0 ? 'Due today' : `in ${days}d`}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="empty-state compact">
                  <p>{data ? 'No pending deadlines.' : 'Deadlines unavailable.'}</p>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </section>
    </AdminShell>
  );
}
