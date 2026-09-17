/**
 * Admin — Leads CRM.
 *
 * Every enquiry the website's forms have captured, from `vx_leads` — the CRM of
 * the imported www.valunxt.com database, into which the Next.js build's own
 * `enquiries` were folded. Search, filter by stage or service, move a lead
 * through the pipeline, open it for its notes.
 */
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

import AdminShell from '@/components/admin/AdminShell';
import ConfirmSubmit from '@/components/admin/ConfirmSubmit';
import { FlashErr, FlashOk } from '@/components/admin/Flash';
import Icon from '@/components/admin/Icon';
import Pager from '@/components/admin/Pager';
import ResourceFilters from '@/components/admin/ResourceFilters';
import { adminUrl } from '@/lib/admin/config';
import { dbStamp, formatDateTime, timeAgo } from '@/lib/admin/format';
import { leadWho } from '@/lib/admin/insights';
import { leadOpAction } from '@/lib/admin/lead-actions';
import { csrfToken, currentUser, takeFlash } from '@/lib/admin/session';
import { LEAD_STATUSES, LEAD_STATUS_LABEL, LEAD_STATUS_PILL as STATUS_PILL, leadServices, leadStats, listLeads, type Lead, type LeadStats } from '@/lib/leads';

export const metadata: Metadata = {
  title: 'Leads CRM — Valunxt Admin',
  robots: 'noindex, nofollow',
};

const PER_PAGE = 10;

function scorePill(n: number): string {
  return n >= 80 ? 'ok' : n >= 60 ? 'wait' : 'off';
}

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; service?: string; p?: string; missing?: string }>;
}) {
  const user = await currentUser();
  if (!user) redirect(adminUrl(''));

  const sp = await searchParams;
  const q = String(sp.q ?? '').trim();
  const status = (LEAD_STATUSES as readonly string[]).includes(String(sp.status)) ? String(sp.status) : '';
  const service = String(sp.service ?? '').trim();
  const flash = await takeFlash();
  // Sent here from a lead that no longer exists (deleted, or an old link).
  if (sp.missing && !flash.err) flash.err = 'That lead no longer exists.';
  const csrf = await csrfToken();

  let all: Lead[] = [];
  let stats: LeadStats = { total: 0, open: 0, last30: 0, prev30: 0, byStatus: {} };
  let services: string[] = [];
  let loadError = '';
  try {
    [all, stats, services] = await Promise.all([listLeads({ q, status, service }), leadStats(), leadServices()]);
  } catch {
    loadError = 'Could not load leads. Please ensure MySQL is running.';
  }

  const pages = Math.max(1, Math.ceil(all.length / PER_PAGE));
  const page = Math.min(Math.max(1, Number(sp.p ?? 1) || 1), pages);
  const rows = all.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const url = (p: number) => {
    const args = new URLSearchParams();
    if (q) args.set('q', q);
    if (status) args.set('status', status);
    if (service) args.set('service', service);
    if (p > 1) args.set('p', String(p));
    const s = args.toString();
    return adminUrl('leads') + (s ? '?' + s : '');
  };
  const back = url(page);
  const filtered = q !== '' || status !== '' || service !== '';

  return (
    <AdminShell active="leads" user={user}>
      <div className="page-head">
        <div className="crumbs">
          Home <span className="sep">/</span> Leads CRM
        </div>
        <h1>Leads CRM</h1>
        <p>Every enquiry from the website&rsquo;s forms. Move a lead through the pipeline and keep notes on it.</p>
      </div>

      <FlashOk key={'ok' + flash.id} message={flash.ok ?? ''} />
      <FlashErr key={'err' + flash.id} message={flash.err ?? ''} />

      <section className="stat-grid">
        <div className="stat-card">
          <div className="ico">
            <Icon name="message" size={22} />
          </div>
          <div className="label">Total Leads</div>
          <div className="value">{stats.total}</div>
        </div>
        <div className="stat-card">
          <div className="ico sky">
            <Icon name="clock" size={22} />
          </div>
          <div className="label">Open Pipeline</div>
          <div className="value">{stats.open}</div>
        </div>
        <div className="stat-card">
          <div className="ico violet">
            <Icon name="trendUp" size={22} />
          </div>
          <div className="label">Last 30 Days</div>
          <div className="value">{stats.last30}</div>
        </div>
        <div className="stat-card">
          <div className="ico green">
            <Icon name="checkCircle" size={22} />
          </div>
          <div className="label">Won</div>
          <div className="value">{stats.byStatus.won ?? 0}</div>
        </div>
      </section>

      <section className="panel" style={{ marginTop: 20 }}>
        <div className="panel-head">
          <h3>
            {filtered ? 'Matching leads' : 'All leads'} <span className="count-chip">{all.length}</span>
          </h3>
          <div className="toolbar">
            <ResourceFilters
              action={adminUrl('leads')}
              value={q}
              searchable
              filters={[
                {
                  name: 'status',
                  label: 'Stages',
                  value: status,
                  options: LEAD_STATUSES.map((s) => [s, `${LEAD_STATUS_LABEL[s]} (${stats.byStatus[s] ?? 0})`]),
                },
                { name: 'service', label: 'Services', value: service, options: services.map((s) => [s, s]) },
              ]}
            />
          </div>
        </div>
        <div className="panel-body flush">
          {loadError ? (
            <div className="empty-state">
              <span className="empty-ico danger">
                <Icon name="alertCircle" size={26} />
              </span>
              <h4>Leads unavailable</h4>
              <p>{loadError}</p>
            </div>
          ) : !rows.length ? (
            <div className="empty-state">
              <span className="empty-ico">
                <Icon name={filtered ? 'search' : 'message'} size={24} />
              </span>
              <h4>{filtered ? 'No leads match' : 'No leads yet'}</h4>
              <p>
                {filtered ? (
                  <a className="link" href={adminUrl('leads')}>
                    Clear the filters
                  </a>
                ) : (
                  'Enquiries sent through the website’s forms will appear here.'
                )}
              </p>
            </div>
          ) : (
            <>
              <div className="table-wrap">
                <table className="data">
                  <thead>
                    <tr>
                      <th>Lead</th>
                      <th>Contact</th>
                      <th>Service</th>
                      <th>Score</th>
                      <th>Stage</th>
                      <th>Received</th>
                      <th className="right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((l) => {
                      const received = dbStamp(l.created_at);
                      return (
                        <tr key={l.id}>
                          <td className="title-cell">
                            <a href={adminUrl('leads/view') + '?id=' + l.id}>{leadWho(l)}</a>
                            <span className="sub">
                              {[l.source, l.page, l.country].filter(Boolean).join(' · ') || 'Website'}
                            </span>
                          </td>
                          <td>
                            {l.email ? (
                              <a className="link" href={`mailto:${l.email}`}>
                                {l.email}
                              </a>
                            ) : (
                              '—'
                            )}
                            {l.phone ? <span className="sub">{l.phone}</span> : null}
                          </td>
                          <td>{l.service || <span className="counter-of">—</span>}</td>
                          <td>
                            <span className={`pill ${scorePill(l.score)}`}>{l.score}</span>
                          </td>
                          <td>
                            <span className={`pill ${STATUS_PILL[l.status] ?? 'new'}`}>
                              <span className="pill-dot" />
                              {LEAD_STATUS_LABEL[l.status as keyof typeof LEAD_STATUS_LABEL] ?? l.status}
                            </span>
                          </td>
                          <td className="nowrap" title={formatDateTime(received)}>
                            {timeAgo(received)}
                          </td>
                          <td>
                            <div className="row-actions">
                              <a className="icon-btn" href={adminUrl('leads/view') + '?id=' + l.id} title="Open lead" aria-label={`Open lead from ${leadWho(l)}`}>
                                <Icon name="eye" size={16} />
                              </a>
                              <form action={leadOpAction}>
                                <input type="hidden" name="op" value="delete" />
                                <input type="hidden" name="csrf" value={csrf} />
                                <input type="hidden" name="id" value={l.id} />
                                <input type="hidden" name="back" value={back} />
                                <input type="hidden" name="after_delete" value={back} />
                                <ConfirmSubmit label={`Delete lead from ${leadWho(l)}`} className="icon-btn danger">
                                  <Icon name="trash" size={16} />
                                </ConfirmSubmit>
                              </form>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <Pager page={page} pages={pages} total={all.length} perPage={PER_PAGE} noun="leads" href={url} />
            </>
          )}
        </div>
      </section>
    </AdminShell>
  );
}
