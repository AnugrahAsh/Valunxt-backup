/**
 * Admin — a record with records of its own (/admin/<resource>/view/?id=).
 *
 * A client of the portal is the case this exists for: the company's details,
 * then its contacts, deadlines, document requests, documents, ledger and
 * messages, each a listing scoped to the client with its own "New" button, and
 * the portal users and activity that belong to it.
 */
import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';

import AdminShell from '@/components/admin/AdminShell';
import ConfirmSubmit from '@/components/admin/ConfirmSubmit';
import { FlashErr, FlashOk } from '@/components/admin/Flash';
import Icon from '@/components/admin/Icon';
import ResourceTable from '@/components/admin/ResourceTable';
import ResourceValue from '@/components/admin/ResourceValue';
import { adminUrl } from '@/lib/admin/config';
import { isAdmin } from '@/lib/admin/guard';
import { resourceOpAction } from '@/lib/admin/resource-actions';
import { getRow, listRows, type ListResult } from '@/lib/admin/resource-db';
import { childResources, navKeyFor, resourceByKey } from '@/lib/admin/resources';
import { csrfToken, currentUser, takeFlash } from '@/lib/admin/session';
import { sql } from '@/lib/db';

type Params = { params: Promise<{ resource: string }>; searchParams: Promise<{ id?: string; missing?: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const def = resourceByKey((await params).resource);
  return { title: `${def?.singular ?? 'Not found'} — Valunxt Admin`, robots: 'noindex, nofollow' };
}

/** How many of a child resource the overview shows before "View all". */
const PREVIEW_ROWS = 8;

export default async function ResourceViewPage({ params, searchParams }: Params) {
  const def = resourceByKey((await params).resource);
  if (!def) notFound();
  const children = childResources(def.key);
  if (!children.length) redirect(adminUrl(`${def.key}/edit`) + '?id=' + encodeURIComponent(String((await searchParams).id ?? '')));

  const user = await currentUser();
  if (!user) redirect(adminUrl(''));
  if (def.adminOnly && !isAdmin(user)) redirect(adminUrl(def.key));

  const rowKey = String((await searchParams).id ?? '');
  const row = await getRow(def, rowKey).catch(() => null);
  if (!row) redirect(adminUrl(def.key) + '?missing=1');

  const csrf = await csrfToken();
  const flash = await takeFlash();
  // Sent back here by the form of a child record that no longer exists.
  if ((await searchParams).missing && !flash.err) flash.err = 'That record no longer exists.';
  const self = adminUrl(`${def.key}/view`) + '?id=' + encodeURIComponent(rowKey);

  const lists: Array<{ child: (typeof children)[number]; result: ListResult }> = [];
  for (const child of children) {
    const result = await listRows({ ...child, perPage: PREVIEW_ROWS }, { parentId: rowKey }).catch(
      () => ({ rows: [], total: 0, page: 1, perPage: PREVIEW_ROWS, pages: 1 }) as ListResult
    );
    lists.push({ child, result });
  }

  /* The portal users and activity that belong to this client, which are not
     child resources of it (a user may be firm staff; the log is global). */
  const portalUsers =
    def.key === 'clients'
      ? await sql<{ id: number; full_name: string; email: string; status: string }>(
          'SELECT id, full_name, email, status FROM pa_users WHERE client_id = ? ORDER BY full_name',
          [Number(rowKey)]
        ).catch(() => [])
      : [];
  const activity =
    def.key === 'clients'
      ? await sql<{ id: number; event_type: string; detail: string | null; created_at: string }>(
          'SELECT id, event_type, detail, created_at FROM pa_activity_log WHERE client_id = ? ORDER BY created_at DESC, id DESC LIMIT 8',
          [Number(rowKey)]
        ).catch(() => [])
      : [];

  const summary = def.fields.filter((f) => f.type !== 'password');
  const title = row[def.titleField] || `${def.singular} ${rowKey}`;

  return (
    <AdminShell active={navKeyFor(def)} user={user}>
      <div className="page-head">
        <div className="crumbs">
          Home <span className="sep">/</span>{' '}
          <a href={adminUrl(def.key)} style={{ color: 'inherit' }}>
            {def.label}
          </a>{' '}
          <span className="sep">/</span> {title}
        </div>
        <h1>{title}</h1>
        <p className="head-meta">
          {row.trade_name && row.trade_name !== title ? <span>{row.trade_name}</span> : null}
          {row.entity_type ? <span>{row.entity_type}{row.free_zone_name ? ` · ${row.free_zone_name}` : ''}</span> : null}
          {row.onboarding_status ? <span className="pill wait">{row.onboarding_status}</span> : null}
        </p>
      </div>

      <FlashOk key={'ok' + flash.id} message={flash.ok ?? ''} />
      <FlashErr key={'err' + flash.id} message={flash.err ?? ''} />

      <section className="panel">
        <div className="panel-head">
          <h3>Details</h3>
          <div className="toolbar">
            {def.edit ? (
              <a className="btn sm primary" href={adminUrl(`${def.key}/edit`) + '?id=' + encodeURIComponent(rowKey)}>
                <Icon name="edit" size={14} />
                Edit {def.singular.toLowerCase()}
              </a>
            ) : null}
            {def.remove ? (
              <form action={resourceOpAction}>
                <input type="hidden" name="resource" value={def.key} />
                <input type="hidden" name="op" value="delete" />
                <input type="hidden" name="csrf" value={csrf} />
                <input type="hidden" name="id" value={rowKey} />
                <input type="hidden" name="back" value={adminUrl(def.key)} />
                <ConfirmSubmit label={`Delete ${title}`} confirmLabel={`Delete ${def.singular.toLowerCase()} and all its records?`} className="btn sm ghost-danger">
                  <Icon name="trash" size={14} />
                  Delete
                </ConfirmSubmit>
              </form>
            ) : null}
          </div>
        </div>
        <div className="panel-body">
          <dl className="detail-grid">
            {summary.map((f) => (
              <div key={f.name} className={f.full || f.type === 'textarea' ? 'full' : undefined}>
                <dt>{f.label}</dt>
                <dd>
                  <ResourceValue field={f} row={row} long />
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {lists.map(({ child, result }) => {
        const scoped = adminUrl(child.key) + '?parent=' + encodeURIComponent(rowKey);
        return (
          <section className="panel" style={{ marginTop: 20 }} key={child.key}>
            <div className="panel-head">
              <h3>
                {child.label} <span className="count-chip">{result.total}</span>
              </h3>
              <div className="toolbar">
                {result.total > PREVIEW_ROWS ? (
                  <a className="btn sm" href={scoped}>
                    View all
                  </a>
                ) : null}
                {child.create ? (
                  <a className="btn sm primary" href={adminUrl(`${child.key}/edit`) + '?new=1&parent=' + encodeURIComponent(rowKey)}>
                    <Icon name="plus" size={14} stroke={2.4} />
                    New {child.singular.toLowerCase()}
                  </a>
                ) : null}
              </div>
            </div>
            <div className="panel-body flush">
              <ResourceTable def={child} rows={result.rows} csrf={csrf} back={self} parentId={rowKey} hideParentColumn />
            </div>
          </section>
        );
      })}

      {def.key === 'clients' ? (
        <div className="panel-grid" style={{ marginTop: 20 }}>
          <section className="panel">
            <div className="panel-head">
              <h3>
                Portal users <span className="count-chip">{portalUsers.length}</span>
              </h3>
              <a className="btn sm" href={adminUrl('portal-users') + '?client_id=' + encodeURIComponent(rowKey)}>
                Manage
              </a>
            </div>
            <div className="panel-body flush">
              {portalUsers.length ? (
                <ul className="mini-list">
                  {portalUsers.map((u) => (
                    <li key={u.id}>
                      <a href={adminUrl('portal-users/edit') + '?id=' + u.id}>{u.full_name}</a>
                      <span className="counter-of">{u.email}</span>
                      <span className={`pill ${u.status === 'active' ? 'ok' : u.status === 'disabled' ? 'warnp' : 'wait'}`}>{u.status}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="empty-state compact">
                  <p>No portal users belong to this client.</p>
                </div>
              )}
            </div>
          </section>
          <section className="panel">
            <div className="panel-head">
              <h3>Recent activity</h3>
              <a className="btn sm" href={adminUrl('portal-activity') + '?client_id=' + encodeURIComponent(rowKey)}>
                View all
              </a>
            </div>
            <div className="panel-body flush">
              {activity.length ? (
                <ul className="mini-list">
                  {activity.map((a) => (
                    <li key={a.id}>
                      <span className="pill new">{a.event_type}</span>
                      <span>{a.detail}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="empty-state compact">
                  <p>Nothing recorded yet.</p>
                </div>
              )}
            </div>
          </section>
        </div>
      ) : null}
    </AdminShell>
  );
}
