/**
 * Admin — Enquiries.
 *
 * Lists website lead-capture submissions stored in the `enquiries` table and
 * lets an administrator delete individual entries.
 *
 * Port of admin/enquiries.php.
 */
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

import AdminShell from '@/components/admin/AdminShell';
import ConfirmSubmit from '@/components/admin/ConfirmSubmit';
import { FlashErr, FlashOk } from '@/components/admin/Flash';
import EnquiryFilter from '@/components/admin/EnquiryFilter';
import Icon from '@/components/admin/Icon';
import { adminUrl } from '@/lib/admin/config';
import { query } from '@/lib/admin/db';
import { formatDateTime, localStamp } from '@/lib/admin/format';
import { csrfToken, currentUser, takeFlash } from '@/lib/admin/session';
import { deleteEnquiryAction } from '@/lib/admin/actions';

export const metadata: Metadata = {
  title: 'Enquiries — Valunxt Admin',
  robots: 'noindex, nofollow',
};

interface EnquiryRow {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  company: string;
  source: string;
  page_url: string;
  created_at: string;
}

/** Source → pill colour class. */
function sourcePill(src: string): string {
  const map: Record<string, string> = {
    Contact: 'new',
    'Free Consultation': 'wait',
    Enquiry: 'ok',
  };
  return map[src] ?? 'new';
}

/** The site path an enquiry was sent from, for its hint line. */
function sentFrom(url: string): string {
  if (!url) return '';
  try {
    return new URL(url, 'http://x').pathname;
  } catch {
    return url;
  }
}

export default async function EnquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const user = await currentUser();
  if (!user) redirect(adminUrl(''));

  const q = String((await searchParams).q ?? '').trim();
  const flash = await takeFlash();
  const csrf = await csrfToken();

  let rows: EnquiryRow[] = [];
  let loadError = '';
  try {
    rows = await query<EnquiryRow>(
      `SELECT id, full_name, email, phone, company, source, page_url, created_at
         FROM enquiries ORDER BY created_at DESC, id DESC`
    );
  } catch {
    loadError = 'Could not load enquiries. Please ensure MySQL is running.';
  }
  const total = rows.length;

  return (
    <AdminShell active="enquiries" user={user}>
      <div className="page-head">
        <div className="crumbs">
          Home <span className="sep">/</span> Enquiries
        </div>
        <h1>Enquiries</h1>
        <p>Lead-capture submissions from the website contact &amp; consultation forms.</p>
      </div>

      <FlashOk key={'ok' + flash.id} message={flash.ok ?? ''} />
      <FlashErr key={'err' + flash.id} message={flash.err ?? ''} />

      <section className="panel">
        <div className="panel-head">
          <h3>
            All Enquiries <span className="count-chip">{total}</span>
          </h3>
          {total > 0 ? (
            <div className="enq-search">
              <Icon name="search" size={16} stroke={2.2} />
              <EnquiryFilter initial={q} />
            </div>
          ) : null}
        </div>
        <div className="panel-body flush">
          {loadError ? (
            <div className="empty-state">
              <span className="empty-ico danger">
                <Icon name="alertCircle" size={26} />
              </span>
              <h4>Enquiries unavailable</h4>
              <p>{loadError}</p>
            </div>
          ) : total === 0 ? (
            <div className="empty-state">
              <span className="empty-ico">
                <Icon name="message" size={26} />
              </span>
              <h4>No enquiries yet</h4>
              <p>New submissions from the website forms will appear here automatically.</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table className="data" id="enqTable">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Company</th>
                    <th>Source</th>
                    <th>Received</th>
                    <th className="right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr
                      key={r.id}
                      data-search={`${r.full_name} ${r.email} ${r.company} ${r.phone} ${r.source}`.toLowerCase()}
                    >
                      <td className="strong">{r.full_name !== '' ? r.full_name : '—'}</td>
                      <td>
                        {r.email !== '' ? (
                          <a className="link" href={`mailto:${r.email}`}>
                            {r.email}
                          </a>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="nowrap">
                        {r.phone !== '' ? (
                          <a className="link" href={`tel:${r.phone}`}>
                            {r.phone}
                          </a>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td>{r.company !== '' ? r.company : '—'}</td>
                      <td>
                        <span className={`pill ${sourcePill(r.source)}`}>
                          {r.source !== '' ? r.source : 'Website'}
                        </span>
                        {r.page_url ? <span className="cell-sub">{sentFrom(r.page_url)}</span> : null}
                      </td>
                      <td className="nowrap">{formatDateTime(localStamp(r.created_at), r.created_at)}</td>
                      <td className="right">
                        <form action={deleteEnquiryAction} className="inline-del">
                          <input type="hidden" name="csrf" value={csrf} />
                          <input type="hidden" name="id" value={r.id} />
                          <ConfirmSubmit label="Delete enquiry" className="icon-btn danger">
                            <Icon name="trash" size={17} />
                          </ConfirmSubmit>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="empty-state" id="noMatch" hidden>
                <span className="empty-ico">
                  <Icon name="search" size={24} />
                </span>
                <h4>No matches</h4>
                <p>No enquiries match your filter.</p>
              </div>
            </div>
          )}
        </div>
      </section>
    </AdminShell>
  );
}
