/**
 * Admin — a table-backed screen's listing (/admin/<resource>/).
 *
 * Which table, which columns, what can be searched and filtered, and whether
 * rows can be added or deleted all come from the screen's declaration in
 * lib/admin/resources.ts. Static routes (blogs, leads, pages…) take precedence
 * over this one, so it only ever answers for a declared resource — or 404s.
 */
import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';

import AdminShell from '@/components/admin/AdminShell';
import { FlashErr, FlashOk } from '@/components/admin/Flash';
import Icon from '@/components/admin/Icon';
import Pager from '@/components/admin/Pager';
import ResourceFilters, { type FilterSpec } from '@/components/admin/ResourceFilters';
import ResourceTable from '@/components/admin/ResourceTable';
import { adminUrl } from '@/lib/admin/config';
import { isAdmin } from '@/lib/admin/guard';
import { filterOptions, getRow, listRows, type ListResult } from '@/lib/admin/resource-db';
import { navKeyFor, resourceByKey } from '@/lib/admin/resources';
import { csrfToken, currentUser, takeFlash } from '@/lib/admin/session';

type Params = { params: Promise<{ resource: string }>; searchParams: Promise<Record<string, string | undefined>> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const def = resourceByKey((await params).resource);
  return { title: `${def?.label ?? 'Not found'} — Valunxt Admin`, robots: 'noindex, nofollow' };
}

export default async function ResourceListPage({ params, searchParams }: Params) {
  const def = resourceByKey((await params).resource);
  if (!def) notFound();
  const user = await currentUser();
  if (!user) redirect(adminUrl(''));

  const sp = await searchParams;
  const flash = await takeFlash();
  // Sent here from a record that no longer exists (deleted, or an old link).
  if (sp.missing && !flash.err) flash.err = `That ${def.singular.toLowerCase()} no longer exists.`;

  if (def.adminOnly && !isAdmin(user)) {
    return (
      <AdminShell active={navKeyFor(def)} user={user}>
        <div className="page-head">
          <h1>{def.label}</h1>
        </div>
        <section className="panel">
          <div className="empty-state">
            <span className="empty-ico danger">
              <Icon name="lock" size={26} />
            </span>
            <h4>Administrators only</h4>
            <p>Your account is an editor account. Ask an administrator for access to {def.label.toLowerCase()}.</p>
          </div>
        </section>
      </AdminShell>
    );
  }

  const csrf = await csrfToken();
  const q = String(sp.q ?? '').trim();
  const parentId = def.parent ? String(sp.parent ?? '') : '';
  const filterFields = def.fields.filter((f) => f.filter && !(parentId && f.name === def.parent?.field));
  const filterValues: Record<string, string> = {};
  for (const f of filterFields) if (sp[f.name]) filterValues[f.name] = String(sp[f.name]);

  const url = (page: number) => {
    const args = new URLSearchParams();
    if (q) args.set('q', q);
    if (parentId) args.set('parent', parentId);
    for (const [k, v] of Object.entries(filterValues)) args.set(k, v);
    if (page > 1) args.set('p', String(page));
    const s = args.toString();
    return adminUrl(def.key) + (s ? '?' + s : '');
  };

  let result: ListResult = { rows: [], total: 0, page: 1, perPage: 20, pages: 1 };
  let filters: FilterSpec[] = [];
  let parentLabel = '';
  let loadError = '';
  try {
    result = await listRows(def, { q, filters: filterValues, parentId, page: Number(sp.p ?? 1) });
    filters = await Promise.all(
      filterFields.map(async (f) => ({ name: f.name, label: f.label, value: filterValues[f.name] ?? '', options: await filterOptions(def, f) }))
    );
    if (def.parent && parentId) {
      const parentDef = resourceByKey(def.parent.resource);
      const parent = parentDef ? await getRow(parentDef, parentId) : null;
      parentLabel = parent && parentDef ? parent[parentDef.titleField] : '';
    }
  } catch (e) {
    loadError = `Could not load ${def.label.toLowerCase()}. Please ensure MySQL is running. (${String(e).slice(0, 160)})`;
  }

  const filtered = q !== '' || Object.keys(filterValues).length > 0;
  const newHref = adminUrl(`${def.key}/edit`) + '?new=1' + (parentId ? '&parent=' + encodeURIComponent(parentId) : '');

  return (
    <AdminShell active={navKeyFor(def)} user={user}>
      <div className="page-head">
        <div className="crumbs">
          Home <span className="sep">/</span>{' '}
          {def.parent && parentId ? (
            <>
              <a href={adminUrl(def.parent.resource)} style={{ color: 'inherit' }}>
                {resourceByKey(def.parent.resource)?.label}
              </a>{' '}
              <span className="sep">/</span>{' '}
              <a href={adminUrl(`${def.parent.resource}/view`) + '?id=' + encodeURIComponent(parentId)} style={{ color: 'inherit' }}>
                {parentLabel || `#${parentId}`}
              </a>{' '}
              <span className="sep">/</span>{' '}
            </>
          ) : null}
          {def.label}
        </div>
        <h1>
          {def.label}
          {parentLabel ? <span className="head-sub"> — {parentLabel}</span> : null}
        </h1>
        <p>{def.description}</p>
      </div>

      <FlashOk key={'ok' + flash.id} message={flash.ok ?? ''} />
      <FlashErr key={'err' + flash.id} message={flash.err ?? ''} />

      <section className="panel">
        <div className="panel-head">
          <h3>
            {filtered ? `Matching ${def.label.toLowerCase()}` : `All ${def.label.toLowerCase()}`}{' '}
            <span className="count-chip">{result.total}</span>
          </h3>
          <div className="toolbar">
            <ResourceFilters
              action={adminUrl(def.key)}
              value={q}
              searchable={def.fields.some((f) => f.search)}
              filters={filters}
              hidden={parentId ? { parent: parentId } : {}}
            />
            {def.create ? (
              <a href={newHref} className="btn primary sm">
                <Icon name="plus" size={15} stroke={2.4} />
                New {def.singular}
              </a>
            ) : null}
          </div>
        </div>
        <div className="panel-body flush">
          {loadError ? (
            <div className="empty-state">
              <span className="empty-ico danger">
                <Icon name="alertCircle" size={26} />
              </span>
              <h4>{def.label} unavailable</h4>
              <p>{loadError}</p>
            </div>
          ) : (
            <>
              <ResourceTable
                def={def}
                rows={result.rows}
                csrf={csrf}
                back={url(result.page)}
                parentId={parentId}
                hideParentColumn={Boolean(parentId)}
                filtered={filtered}
              />
              <Pager
                page={result.page}
                pages={result.pages}
                total={result.total}
                perPage={result.perPage}
                noun={def.label.toLowerCase()}
                href={url}
              />
            </>
          )}
        </div>
      </section>
    </AdminShell>
  );
}
