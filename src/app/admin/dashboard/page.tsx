/**
 * Admin dashboard.
 *
 * Port of admin/dashboard.php. The PHP page carried placeholder figures — KPI
 * cards, an eight-month chart and an activity feed that described no real
 * event. Every figure is now read from the panel's own tables (see
 * lib/admin/insights.ts), so the dashboard agrees with the screens it links to.
 */
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

import AdminShell from '@/components/admin/AdminShell';
import Icon, { type IconName } from '@/components/admin/Icon';
import { adminUrl, brandText } from '@/lib/admin/config';
import { formatCount, formatDate, formatDateTime, localStamp, timeAgo } from '@/lib/admin/format';
import { dashboardData, enquiryWho, type DashboardData } from '@/lib/admin/insights';
import { currentUser } from '@/lib/admin/session';

export const metadata: Metadata = {
  title: 'Dashboard — Valunxt Admin',
  robots: 'noindex, nofollow',
};

const SOURCE_PILL: Record<string, string> = {
  Contact: 'new',
  'Free Consultation': 'wait',
  Enquiry: 'ok',
};

const ACTIVITY_ICON: Record<string, [IconName, string]> = {
  enquiry: ['message', ''],
  page: ['edit', 'violet'],
  sitemap: ['globe', 'green'],
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

export default async function DashboardPage() {
  const user = await currentUser();
  if (!user) redirect(adminUrl(''));

  let data: DashboardData | null = null;
  try {
    data = await dashboardData();
  } catch {
    /* MySQL unavailable — the cards render dashes and a notice explains why */
  }

  const firstName = brandText(user.name).split(' ')[0];
  const now = new Date();
  const e = data?.enquiries;
  const pages = data?.pages;
  const maxMonth = Math.max(0, ...(data?.months ?? []).map((m) => m.count));
  const thisMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  return (
    <AdminShell active="dashboard" user={user}>
      <div className="page-head">
        <div className="crumbs">
          Home <span className="sep">/</span> Dashboard
        </div>
        <h1>Welcome back, {firstName} 👋</h1>
        <p>Here&rsquo;s what&rsquo;s happening across Valunxt today.</p>
      </div>

      {!data ? (
        <div className="flash err" role="alert">
          <Icon name="alertCircle" />
          <span className="flash-text">
            Could not load the dashboard figures. Please ensure MySQL is running, then reload.
          </span>
        </div>
      ) : null}

      {/* KPI cards */}
      <section className="stat-grid">
        <div className="stat-card feature">
          <div className="ico">
            <Icon name="message" size={22} />
          </div>
          <div className="label">Total Enquiries</div>
          <div className="value">{e ? formatCount(e.total) : '—'}</div>
          <div className="trend">
            {e ? (
              <>
                <Icon name="clock" size={14} stroke={2.4} />
                {formatCount(e.last30)} <span className="muted">in the last 30 days</span>
              </>
            ) : (
              <span className="muted">Unavailable</span>
            )}
          </div>
        </div>

        <div className="stat-card">
          <div className="ico sky">
            <Icon name="users" size={22} />
          </div>
          <div className="label">Enquiries, Last 30 Days</div>
          <div className="value">{e ? formatCount(e.last30) : '—'}</div>
          {e ? <TrendLine trend={periodTrend(e.last30, e.prev30)} /> : <div className="trend flat">—</div>}
        </div>

        <div className="stat-card">
          <div className="ico green">
            <Icon name="file" size={22} />
          </div>
          <div className="label">Published Pages</div>
          <div className="value">
            {pages ? formatCount(pages.published) : '—'}
            {pages ? <span className="value-of">/ {formatCount(pages.total)}</span> : null}
          </div>
          {pages ? (
            <div className={`trend ${pages.draft ? 'flat' : 'up'}`}>
              <Icon name={pages.draft ? 'edit' : 'checkCircle'} size={14} stroke={2.4} />
              {pages.draft ? (
                <>
                  {pages.draft} <span className="muted">draft{pages.draft === 1 ? '' : 's'}</span>
                </>
              ) : (
                <>
                  All live <span className="muted">no drafts</span>
                </>
              )}
            </div>
          ) : (
            <div className="trend flat">—</div>
          )}
        </div>

        <div className="stat-card">
          <div className="ico violet">
            <Icon name="globe" size={22} />
          </div>
          <div className="label">Pages in Sitemap</div>
          <div className="value">{pages ? formatCount(pages.sitemap) : '—'}</div>
          <div className="trend flat">
            <Icon name="refresh" size={14} stroke={2.4} />
            {data?.sitemap.generatedAt ? (
              <>
                Generated <span className="muted">{formatDate(data.sitemap.generatedAt)}</span>
              </>
            ) : (
              <span className="muted">Not generated yet</span>
            )}
          </div>
        </div>
      </section>

      {/* Chart + activity */}
      <section className="panel-grid">
        <div className="panel">
          <div className="panel-head">
            <div>
              <h3>Enquiries Overview</h3>
              <div className="panel-sub">Submissions per month, last 8 months</div>
            </div>
            <a href={adminUrl('enquiries')} className="link">
              View enquiries
              <Icon name="arrowRight" size={14} stroke={2.4} />
            </a>
          </div>
          <div className="panel-body">
            <div className={'chart' + (maxMonth === 0 ? ' is-empty' : '')}>
              {(data?.months ?? []).map((m, i) => (
                <div
                  className={'bar-col' + (m.key === thisMonthKey ? ' current' : '')}
                  key={m.key}
                  title={`${m.label}: ${m.count} enquir${m.count === 1 ? 'y' : 'ies'}`}
                >
                  <div className="bar-track">
                    <div
                      className="bar"
                      data-n={m.count}
                      style={{
                        height: maxMonth ? `${Math.max(3, (m.count / maxMonth) * 100)}%` : '3%',
                        animationDelay: `${i * 60}ms`,
                      }}
                    />
                  </div>
                  <span className="m">{m.label}</span>
                </div>
              ))}
              {maxMonth === 0 ? (
                <div className="chart-empty">
                  {data ? 'No enquiries in the last 8 months.' : 'Figures unavailable.'}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <h3>Recent Activity</h3>
            <a href={adminUrl('pages')} className="link">
              Pages &amp; SEO
              <Icon name="arrowRight" size={14} stroke={2.4} />
            </a>
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

      {/* Latest enquiries table */}
      <section className="panel" style={{ marginTop: 20 }}>
        <div className="panel-head">
          <h3>Latest Enquiries</h3>
          <a href={adminUrl('enquiries')} className="link">
            Manage enquiries
            <Icon name="arrowRight" size={14} stroke={2.4} />
          </a>
        </div>
        <div className="panel-body flush">
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>Ref</th>
                  <th>Client</th>
                  <th>Email</th>
                  <th>Source</th>
                  <th>Received</th>
                  <th className="right">Action</th>
                </tr>
              </thead>
              <tbody>
                {!data || data.latest.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="muted-cell">
                      {data
                        ? 'No enquiries yet. Submissions from the website forms appear here.'
                        : 'Enquiries unavailable.'}
                    </td>
                  </tr>
                ) : (
                  data.latest.map((row) => (
                    <tr key={row.id}>
                      <td className="strong nowrap">ENQ-{String(row.id).padStart(4, '0')}</td>
                      <td>{enquiryWho(row)}</td>
                      <td>
                        {row.email ? (
                          <a className="link" href={`mailto:${row.email}`}>
                            {row.email}
                          </a>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td>
                        <span className={`pill ${SOURCE_PILL[row.source] ?? 'new'}`}>
                          {row.source !== '' ? row.source : 'Website'}
                        </span>
                      </td>
                      <td className="nowrap">{formatDateTime(localStamp(row.created_at))}</td>
                      <td className="right">
                        <a
                          href={adminUrl('enquiries') + (row.email ? '?q=' + encodeURIComponent(row.email) : '')}
                          className="btn sm"
                        >
                          View
                        </a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </AdminShell>
  );
}
