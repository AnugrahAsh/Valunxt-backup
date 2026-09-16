/**
 * Admin — Security.
 *
 * The security records of the imported database in one place: the event log
 * (`vx_security_events`), the previous panel's malware scans (`vx_scans`) and
 * file-integrity baseline (`vx_file_hashes`), and the client portal's failed
 * sign-ins (`pa_login_attempts`). Each opens into its full listing.
 *
 * The event log is live: the panel records a failed or blocked sign-in there,
 * and the form endpoint records a submission caught by its honeypot, as the
 * previous panel did.
 */
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

import AdminShell from '@/components/admin/AdminShell';
import Icon from '@/components/admin/Icon';
import { adminUrl } from '@/lib/admin/config';
import { query } from '@/lib/admin/db';
import { dbStamp, formatCount, formatDateTime, timeAgo } from '@/lib/admin/format';
import { isAdmin } from '@/lib/admin/guard';
import { currentUser } from '@/lib/admin/session';

export const metadata: Metadata = {
  title: 'Security — Valunxt Admin',
  robots: 'noindex, nofollow',
};

export default async function SecurityPage() {
  const user = await currentUser();
  if (!user) redirect(adminUrl(''));
  if (!isAdmin(user)) redirect(adminUrl('dashboard'));

  let error = '';
  let byType: Array<{ type: string; total: number; last30: number }> = [];
  let events: Array<{ id: number; ts: string; ip: string | null; type: string; detail: string | null; path: string | null }> = [];
  let scans: Array<{ id: number; ts: string; kind: string; files_scanned: number; issues_found: number }> = [];
  let hashes = { files: 0, seen: '' };
  let portalAttempts = 0;

  try {
    byType = (
      await query<{ type: string; total: number; last30: string | null }>(
        `SELECT type, COUNT(*) AS total, SUM(ts >= UTC_TIMESTAMP() - INTERVAL 30 DAY) AS last30
           FROM vx_security_events GROUP BY type ORDER BY total DESC`
      )
    ).map((r) => ({ type: r.type, total: Number(r.total), last30: Number(r.last30 ?? 0) }));
    events = await query('SELECT id, ts, ip, type, detail, path FROM vx_security_events ORDER BY ts DESC, id DESC LIMIT 12');
    scans = await query('SELECT id, ts, kind, files_scanned, issues_found FROM vx_scans ORDER BY ts DESC, id DESC LIMIT 5');
    const [h] = await query<{ files: number; seen: string | null }>('SELECT COUNT(*) AS files, MAX(seen) AS seen FROM vx_file_hashes');
    hashes = { files: Number(h?.files ?? 0), seen: String(h?.seen ?? '') };
    const [a] = await query<{ n: number }>('SELECT COUNT(*) AS n FROM pa_login_attempts');
    portalAttempts = Number(a?.n ?? 0);
  } catch (e) {
    error = 'Security records unavailable. Please ensure MySQL is running. ' + String(e).slice(0, 120);
  }

  const total = byType.reduce((s, t) => s + t.total, 0);
  const last30 = byType.reduce((s, t) => s + t.last30, 0);
  const fails = byType.find((t) => t.type === 'login_fail');

  return (
    <AdminShell active="security" user={user}>
      <div className="page-head">
        <div className="crumbs">
          Home <span className="sep">/</span> Security
        </div>
        <h1>Security</h1>
        <p>
          Failed and blocked sign-ins, bot form submissions, and the previous panel&rsquo;s scans. Five failed sign-ins from
          one address lock it out of this panel for fifteen minutes.
        </p>
      </div>

      {error ? (
        <div className="flash err" role="alert">
          <Icon name="alertCircle" />
          <span className="flash-text">{error}</span>
        </div>
      ) : null}

      <section className="stat-grid">
        <a className="stat-card as-link feature" href={adminUrl('security-events')}>
          <div className="ico">
            <Icon name="alertCircle" size={22} />
          </div>
          <div className="label">Security Events</div>
          <div className="value">{formatCount(total)}</div>
          <div className="trend flat">
            <span className="muted">{last30} in the last 30 days</span>
          </div>
        </a>
        <a className="stat-card as-link" href={adminUrl('security-events') + '?type=login_fail'}>
          <div className="ico violet">
            <Icon name="lock" size={22} />
          </div>
          <div className="label">Failed Sign-ins</div>
          <div className="value">{formatCount(fails?.total ?? 0)}</div>
          <div className="trend flat">
            <span className="muted">{fails?.last30 ?? 0} in the last 30 days</span>
          </div>
        </a>
        <a className="stat-card as-link" href={adminUrl('scans')}>
          <div className="ico sky">
            <Icon name="shield" size={22} />
          </div>
          <div className="label">Malware Scans</div>
          <div className="value">{formatCount(scans.length)}</div>
          <div className="trend flat">
            <span className="muted">{scans[0] ? `last ${formatDateTime(dbStamp(scans[0].ts))}` : 'none run'}</span>
          </div>
        </a>
        <a className="stat-card as-link" href={adminUrl('file-hashes')}>
          <div className="ico green">
            <Icon name="key" size={22} />
          </div>
          <div className="label">Integrity Baseline</div>
          <div className="value">{formatCount(hashes.files)}</div>
          <div className="trend flat">
            <span className="muted">files{hashes.seen ? `, seen ${formatDateTime(dbStamp(hashes.seen))}` : ''}</span>
          </div>
        </a>
      </section>

      <div className="panel-grid" style={{ marginTop: 20 }}>
        <section className="panel">
          <div className="panel-head">
            <h3>Latest events</h3>
            <a href={adminUrl('security-events')} className="link">
              Full log
              <Icon name="arrowRight" size={14} stroke={2.4} />
            </a>
          </div>
          <div className="panel-body flush">
            {events.length ? (
              <div className="table-wrap">
                <table className="data">
                  <thead>
                    <tr>
                      <th>When</th>
                      <th>Type</th>
                      <th>Detail</th>
                      <th>IP address</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((e) => (
                      <tr key={e.id}>
                        <td className="nowrap" title={formatDateTime(dbStamp(e.ts))}>
                          {timeAgo(dbStamp(e.ts))}
                        </td>
                        <td>
                          <span className={`pill ${e.type === 'form_honeypot' ? 'wait' : 'warnp'}`}>{e.type.replace(/_/g, ' ')}</span>
                        </td>
                        <td>
                          {(e.detail ?? '').slice(0, 70)}
                          {e.path ? <span className="sub">{e.path}</span> : null}
                        </td>
                        <td>
                          <code className="cell-code">{e.ip || '—'}</code>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state compact">
                <p>No security events recorded.</p>
              </div>
            )}
          </div>
        </section>

        <section className="panel">
          <div className="panel-head">
            <h3>Events by type</h3>
          </div>
          <div className="panel-body">
            {byType.length ? (
              <ul className="mini-list">
                {byType.map((t) => (
                  <li key={t.type}>
                    <a href={adminUrl('security-events') + '?type=' + encodeURIComponent(t.type)}>{t.type.replace(/_/g, ' ')}</a>
                    <span className="counter-of">{t.last30} in 30 days</span>
                    <span className="count-chip">{t.total}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="counter-of">Nothing recorded.</p>
            )}
            <div className="hint" style={{ marginTop: 16 }}>
              Client portal failed sign-ins: <a className="link" href={adminUrl('login-attempts')}>{portalAttempts} recorded</a>.
            </div>
          </div>
        </section>
      </div>

      <section className="panel" style={{ marginTop: 20 }}>
        <div className="panel-head">
          <h3>Malware scans</h3>
          <a href={adminUrl('scans')} className="link">
            All scans
            <Icon name="arrowRight" size={14} stroke={2.4} />
          </a>
        </div>
        <div className="panel-body flush">
          {scans.length ? (
            <div className="table-wrap">
              <table className="data">
                <thead>
                  <tr>
                    <th>Run at</th>
                    <th>Kind</th>
                    <th>Files scanned</th>
                    <th>Issues</th>
                    <th className="right">Report</th>
                  </tr>
                </thead>
                <tbody>
                  {scans.map((s) => (
                    <tr key={s.id}>
                      <td className="nowrap">{formatDateTime(dbStamp(s.ts))}</td>
                      <td>{s.kind}</td>
                      <td>{formatCount(Number(s.files_scanned))}</td>
                      <td>
                        <span className={`pill ${Number(s.issues_found) ? 'warnp' : 'ok'}`}>{s.issues_found}</span>
                      </td>
                      <td className="right">
                        <a className="btn sm" href={adminUrl('scans/edit') + '?id=' + s.id}>
                          View
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state compact">
              <p>No scans recorded.</p>
            </div>
          )}
        </div>
      </section>
    </AdminShell>
  );
}
