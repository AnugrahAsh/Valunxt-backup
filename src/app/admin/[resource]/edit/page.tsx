/**
 * Admin — a table-backed screen's create / edit form (/admin/<resource>/edit/).
 *
 * ?new=1 for a new row (&parent=<id> to create it under a parent), ?id=<key>
 * to edit one. A record every field of which is read-only — a log entry —
 * opens here as a read-only view.
 */
import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';

import AdminShell from '@/components/admin/AdminShell';
import { FlashErr, FlashOk } from '@/components/admin/Flash';
import ResourceForm from '@/components/admin/ResourceForm';
import { adminUrl } from '@/lib/admin/config';
import { isAdmin } from '@/lib/admin/guard';
import { getRow, relationOptions } from '@/lib/admin/resource-db';
import { navKeyFor, resourceByKey } from '@/lib/admin/resources';
import { csrfToken, currentUser, takeFlash } from '@/lib/admin/session';

type Params = {
  params: Promise<{ resource: string }>;
  searchParams: Promise<{ id?: string; new?: string; parent?: string }>;
};

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const def = resourceByKey((await params).resource);
  return { title: `${def?.singular ?? 'Not found'} — Valunxt Admin`, robots: 'noindex, nofollow' };
}

export default async function ResourceEditPage({ params, searchParams }: Params) {
  const def = resourceByKey((await params).resource);
  if (!def) notFound();
  const user = await currentUser();
  if (!user) redirect(adminUrl(''));
  if (def.adminOnly && !isAdmin(user)) redirect(adminUrl(def.key));

  const sp = await searchParams;
  const isNew = sp.new !== undefined;
  if ((isNew && !def.create) || (!isNew && !def.edit)) redirect(adminUrl(def.key));

  const rowKey = String(sp.id ?? '');
  const parentId = def.parent ? String(sp.parent ?? '') : '';
  const listHref = def.parent && parentId ? adminUrl(`${def.parent.resource}/view`) + '?id=' + encodeURIComponent(parentId) : adminUrl(def.key);

  let values: Record<string, string> = {};
  if (isNew) {
    for (const f of def.fields) values[f.name] = f.defaultValue ?? '';
    if (def.parent && parentId) values[def.parent.field] = parentId;
  } else {
    let row = null;
    try {
      row = await getRow(def, rowKey);
    } catch {
      /* reported below as missing */
    }
    if (!row) redirect(listHref + (listHref.includes('?') ? '&' : '?') + 'missing=1');
    values = row;
  }

  const relations: Record<string, Array<[string, string]>> = {};
  for (const f of def.fields.filter((x) => x.type === 'relation' && !x.readOnly)) {
    try {
      relations[f.name] = await relationOptions(f);
    } catch {
      relations[f.name] = [];
    }
  }

  const flash = await takeFlash();
  const csrf = await csrfToken();
  const title = isNew ? `New ${def.singular}` : String(values[def.titleField] || `${def.singular} ${rowKey}`).slice(0, 90);
  // A child's parent is fixed by where it was opened from; the form does not offer to move it.
  const fields = def.fields.filter((f) => !(def.parent && parentId && f.name === def.parent.field));

  return (
    <AdminShell active={navKeyFor(def)} user={user}>
      <div className="page-head">
        <div className="crumbs">
          Home <span className="sep">/</span>{' '}
          <a href={listHref} style={{ color: 'inherit' }}>
            {def.label}
          </a>{' '}
          <span className="sep">/</span> {isNew ? 'New' : 'Edit'}
        </div>
        <h1>{title}</h1>
        <p>{def.description}</p>
      </div>

      <FlashOk key={'ok' + flash.id} message={flash.ok ?? ''} />
      <FlashErr key={'err' + flash.id} message={flash.err ?? ''} />

      <ResourceForm
        resource={def.key}
        singular={def.singular}
        isNew={isNew}
        rowKey={rowKey}
        parentId={parentId}
        csrf={csrf}
        fields={fields}
        values={values}
        relationOptions={relations}
        cancelHref={listHref}
      />
    </AdminShell>
  );
}
