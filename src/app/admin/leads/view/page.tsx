/**
 * Admin — one lead: who, what they asked, where from, its stage and its notes.
 */
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

import AdminShell from '@/components/admin/AdminShell';
import ConfirmSubmit from '@/components/admin/ConfirmSubmit';
import { FlashErr, FlashOk } from '@/components/admin/Flash';
import Icon from '@/components/admin/Icon';
import { adminUrl } from '@/lib/admin/config';
import { dbStamp, formatDateTime, timeAgo } from '@/lib/admin/format';
import { leadWho } from '@/lib/admin/insights';
import { leadOpAction } from '@/lib/admin/lead-actions';
import { csrfToken, currentUser, takeFlash } from '@/lib/admin/session';
import { LEAD_STATUSES, LEAD_STATUS_LABEL, LEAD_STATUS_PILL, leadById, leadNotes, type LeadNote } from '@/lib/leads';

export const metadata: Metadata = {
  title: 'Lead — Valunxt Admin',
  robots: 'noindex, nofollow',
};

export default async function LeadViewPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const user = await currentUser();
  if (!user) redirect(adminUrl(''));

  const id = Number((await searchParams).id ?? 0);
  const lead = await leadById(id).catch(() => null);
  if (!lead) redirect(adminUrl('leads') + '?missing=1');

  let notes: LeadNote[] = [];
  try {
    notes = await leadNotes(id);
  } catch {
    /* shown as none */
  }
  const flash = await takeFlash();
  const csrf = await csrfToken();
  const self = adminUrl('leads/view') + '?id=' + id;
  const received = dbStamp(lead.created_at);

  const facts: Array<[string, React.ReactNode]> = [
    ['Email', lead.email ? <a className="link" href={`mailto:${lead.email}`}>{lead.email}</a> : '—'],
    ['Phone', lead.phone ? <a className="link" href={`tel:${lead.phone.replace(/\s+/g, '')}`}>{lead.phone}</a> : '—'],
    ['Company', lead.company || '—'],
    ['Service', lead.service || '—'],
    ['Form', lead.source || '—'],
    ['Page', lead.page ? <code className="cell-code">{lead.page}</code> : '—'],
    ['Country', lead.country || '—'],
    ['IP address', lead.ip ? <code className="cell-code">{lead.ip}</code> : '—'],
    ['Received', `${formatDateTime(received)} (${timeAgo(received)})`],
    ['Score', <span className={`pill ${lead.score >= 80 ? 'ok' : lead.score >= 60 ? 'wait' : 'off'}`}>{lead.score} / 100</span>],
  ];

  return (
    <AdminShell active="leads" user={user}>
      <div className="page-head">
        <div className="crumbs">
          Home <span className="sep">/</span>{' '}
          <a href={adminUrl('leads')} style={{ color: 'inherit' }}>
            Leads CRM
          </a>{' '}
          <span className="sep">/</span> Lead #{lead.id}
        </div>
        <h1>{leadWho(lead)}</h1>
        <p className="head-meta">
          <span className={`pill ${LEAD_STATUS_PILL[lead.status] ?? 'new'}`}>
            <span className="pill-dot" />
            {LEAD_STATUS_LABEL[lead.status as keyof typeof LEAD_STATUS_LABEL] ?? lead.status}
          </span>
          <span>{lead.service || 'General enquiry'}</span>
        </p>
      </div>

      <FlashOk key={'ok' + flash.id} message={flash.ok ?? ''} />
      <FlashErr key={'err' + flash.id} message={flash.err ?? ''} />

      <div className="panel-grid editor-grid">
        <div>
          <section className="panel">
            <div className="panel-head">
              <h3>Enquiry</h3>
            </div>
            <div className="panel-body">
              <dl className="detail-grid">
                {facts.map(([label, value]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
                <div className="full">
                  <dt>Message</dt>
                  <dd className="prewrap">{lead.message || <span className="counter-of">No message was left.</span>}</dd>
                </div>
                {lead.ua ? (
                  <div className="full">
                    <dt>Browser</dt>
                    <dd className="counter-of">{lead.ua}</dd>
                  </div>
                ) : null}
              </dl>
            </div>
          </section>

          <section className="panel" style={{ marginTop: 20 }}>
            <div className="panel-head">
              <h3>
                Notes <span className="count-chip">{notes.length}</span>
              </h3>
            </div>
            <div className="panel-body">
              <form action={leadOpAction} className="note-form">
                <input type="hidden" name="op" value="note" />
                <input type="hidden" name="csrf" value={csrf} />
                <input type="hidden" name="id" value={lead.id} />
                <input type="hidden" name="back" value={self} />
                <div className="fld full">
                  <label htmlFor="note">Add a note</label>
                  <textarea id="note" name="note" rows={3} required maxLength={5000} placeholder="Called, left a voicemail. Follow up Thursday." />
                </div>
                <button type="submit" className="btn primary sm" style={{ marginTop: 10 }}>
                  <Icon name="plus" size={14} stroke={2.4} />
                  Add note
                </button>
              </form>
              {notes.length ? (
                <ul className="note-list">
                  {notes.map((n) => (
                    <li key={n.id}>
                      <div className="note-meta">
                        <span>{formatDateTime(dbStamp(n.created_at))}</span>
                        <form action={leadOpAction}>
                          <input type="hidden" name="op" value="delete_note" />
                          <input type="hidden" name="csrf" value={csrf} />
                          <input type="hidden" name="id" value={lead.id} />
                          <input type="hidden" name="note_id" value={n.id} />
                          <input type="hidden" name="back" value={self} />
                          <ConfirmSubmit label="Delete note" className="icon-btn danger">
                            <Icon name="trash" size={14} />
                          </ConfirmSubmit>
                        </form>
                      </div>
                      <div className="prewrap">{n.note}</div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="counter-of" style={{ marginTop: 16 }}>
                  No notes yet. Stage changes are noted here automatically.
                </p>
              )}
            </div>
          </section>
        </div>

        <div>
          <section className="panel">
            <div className="panel-head">
              <h3>Stage</h3>
            </div>
            <div className="panel-body">
              <div className="stage-list">
                {LEAD_STATUSES.map((s) => (
                  <form action={leadOpAction} key={s}>
                    <input type="hidden" name="op" value="status" />
                    <input type="hidden" name="csrf" value={csrf} />
                    <input type="hidden" name="id" value={lead.id} />
                    <input type="hidden" name="status" value={s} />
                    <input type="hidden" name="back" value={self} />
                    <button type="submit" className={'stage-btn' + (lead.status === s ? ' is-current' : '')} aria-pressed={lead.status === s}>
                      <span className={`pill ${LEAD_STATUS_PILL[s]}`}>
                        <span className="pill-dot" />
                        {LEAD_STATUS_LABEL[s]}
                      </span>
                      {lead.status === s ? <Icon name="checkCircle" size={16} /> : null}
                    </button>
                  </form>
                ))}
              </div>
            </div>
            <div className="form-actions">
              {lead.email ? (
                <a className="btn sm" href={`mailto:${lead.email}?subject=${encodeURIComponent('Your enquiry with Valunxt')}`}>
                  <Icon name="mail" size={14} />
                  Email
                </a>
              ) : null}
              <span className="spacer" />
              <form action={leadOpAction}>
                <input type="hidden" name="op" value="delete" />
                <input type="hidden" name="csrf" value={csrf} />
                <input type="hidden" name="id" value={lead.id} />
                <input type="hidden" name="back" value={self} />
                <input type="hidden" name="after_delete" value={adminUrl('leads')} />
                <ConfirmSubmit label="Delete lead" confirmLabel="Delete this lead?" className="btn sm ghost-danger">
                  <Icon name="trash" size={14} />
                  Delete
                </ConfirmSubmit>
              </form>
            </div>
          </section>
        </div>
      </div>
    </AdminShell>
  );
}
