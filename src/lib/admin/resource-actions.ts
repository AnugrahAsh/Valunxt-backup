'use server';

/**
 * Writes for the table-backed admin screens (lib/admin/resources.ts).
 *
 * The form names a resource; the registry decides everything else — which
 * columns may be written, how each is validated, who may write it. A column the
 * registry does not declare writable is never touched, whatever the form posts.
 *
 * A few tables carry rules of their own, applied here after the generic
 * validation: an author's name is copied onto their posts' bylines; a redirect's
 * path is normalised and cannot point at itself; the last administrator cannot
 * be demoted or deleted, nor can you delete yourself; a portal client user must
 * belong to a client; and every change to the client portal is written to its
 * activity log, as the portal itself does.
 */
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

import { exec, sql } from '@/lib/db';
import { blogSlugify } from '@/lib/blog/types';
import { normaliseRedirectPath } from '@/lib/redirects';
import { adminUrl, brandText } from './config';
import { hashPassword } from './db';
import { isAdmin, requireCsrf, requireUser, safeBack } from './guard';
import { relationExists, valueTaken } from './resource-db';
import { resourceByKey } from './resources';
import type { FieldDef, ResourceDef } from './resource-types';
import { csrfOk, refreshUser, setFlash, type AdminUser } from './session';

export interface ResourceFormState {
  errors?: Record<string, string>;
  values?: Record<string, string>;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 8;
const id = (name: string) => '`' + name.replace(/`/g, '') + '`';

function realDate(v: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
  const [y, m, d] = v.split('-').map(Number);
  const probe = new Date(Date.UTC(y, m - 1, d));
  return probe.getUTCFullYear() === y && probe.getUTCMonth() === m - 1 && probe.getUTCDate() === d;
}

/** Where a resource's listing is — under its parent's page when it has one. */
function listingUrl(def: ResourceDef, parentId: string): string {
  if (def.parent && parentId) return adminUrl(`${def.parent.resource}/view`) + '?id=' + encodeURIComponent(parentId);
  return adminUrl(def.key);
}

/** The portal records every change; admin-panel changes are recorded the same way. */
async function logPortal(def: ResourceDef, user: AdminUser, verb: string, clientId: string | null, label: string) {
  if (def.group !== 'Client Portal' || def.key === 'portal-activity') return;
  try {
    await exec(
      'INSERT INTO pa_activity_log (client_id, actor_id, event_type, detail, created_at) VALUES (?, NULL, ?, ?, UTC_TIMESTAMP())',
      [clientId ? Number(clientId) || null : null, 'admin', `${def.singular} ${verb}: ${label} (by ${brandText(user.name)}, admin panel)`.slice(0, 500)]
    );
  } catch {
    /* the log is a record, not a requirement */
  }
}

/** Refuse a resource the account may not open. */
async function authorise(def: ResourceDef | undefined, user: AdminUser, back: string): Promise<ResourceDef> {
  if (!def) {
    await setFlash({ err: 'That screen does not exist.' });
    redirect(adminUrl('dashboard'));
  }
  if (def.adminOnly && !isAdmin(user)) {
    await setFlash({ err: 'That needs an administrator account.' });
    redirect(back);
  }
  return def;
}

/* ---- Save ---------------------------------------------------------------- */

/**
 * Validate one field's submitted value. Returns [stored value, error]. The
 * stored value is null for an empty nullable field.
 */
async function validateField(f: FieldDef, raw: string, isNew: boolean): Promise<[unknown, string]> {
  const v = raw.trim();
  const empty = v === '';

  if (f.type === 'checkbox') return [raw === '1' ? 1 : 0, ''];

  if (f.type === 'password') {
    if (empty) {
      if (isNew && !f.nullable) return [undefined, `${f.label} is required for a new account.`];
      return [undefined, '']; // keep the current hash
    }
    if (raw.length < MIN_PASSWORD) return [undefined, `${f.label} must be at least ${MIN_PASSWORD} characters.`];
    return [await hashPassword(raw), ''];
  }

  if (empty) {
    if (f.required) return [undefined, `${f.label} is required.`];
    return [f.nullable ? null : '', ''];
  }

  switch (f.type) {
    case 'email':
      if (!EMAIL_RE.test(v)) return [undefined, `${f.label}: enter a valid email address.`];
      break;
    case 'url':
      if (!/^https?:\/\/[^\s]+$/i.test(v)) return [undefined, `${f.label}: enter a full URL beginning with https://.`];
      break;
    case 'path':
      if (!/^(\/|https?:\/\/)[^\s]*$/i.test(v)) return [undefined, `${f.label}: enter a path beginning with / or a full https:// URL.`];
      break;
    case 'int': {
      if (!/^-?\d+$/.test(v)) return [undefined, `${f.label}: enter a whole number.`];
      const n = Number(v);
      if (f.min !== undefined && n < f.min) return [undefined, `${f.label}: at least ${f.min}.`];
      if (f.max !== undefined && n > f.max) return [undefined, `${f.label}: at most ${f.max}.`];
      return [n, ''];
    }
    case 'decimal': {
      if (!/^-?\d+(\.\d{1,2})?$/.test(v)) return [undefined, `${f.label}: enter an amount with up to two decimals.`];
      const n = Number(v);
      if (f.min !== undefined && n < f.min) return [undefined, `${f.label}: at least ${f.min}.`];
      if (f.max !== undefined && n > f.max) return [undefined, `${f.label}: at most ${f.max}.`];
      return [n.toFixed(2), ''];
    }
    case 'date':
      if (!realDate(v)) return [undefined, `${f.label}: enter a real calendar date.`];
      return [v, ''];
    case 'datetime': {
      const m = /^(\d{4}-\d{2}-\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?$/.exec(v);
      if (!m || !realDate(m[1])) return [undefined, `${f.label}: enter a real date and time.`];
      return [`${m[1]} ${m[2]}:${m[3]}:${m[4] ?? '00'}`, ''];
    }
    case 'select':
      if (f.options && !f.options.some(([o]) => o === v)) return [undefined, `${f.label}: choose one of the listed options.`];
      break;
    case 'relation':
      if (!(await relationExists(f, v))) return [undefined, `${f.label}: that record no longer exists.`];
      return [Number.isNaN(Number(v)) ? v : Number(v), ''];
    case 'json':
      try {
        JSON.parse(v);
      } catch {
        return [undefined, `${f.label}: not valid JSON.`];
      }
      break;
  }

  if (f.max !== undefined && ['text', 'textarea', 'email', 'url', 'path', 'tel', 'code'].includes(f.type) && v.length > f.max) {
    return [undefined, `${f.label}: keep it under ${f.max} characters.`];
  }
  return [v, ''];
}

export async function saveResourceAction(_prev: ResourceFormState | null, form: FormData): Promise<ResourceFormState> {
  const user = await requireUser();
  const key = String(form.get('resource') ?? '');
  const def = await authorise(resourceByKey(key), user, adminUrl('dashboard'));

  const isNew = String(form.get('mode') ?? '') === 'new';
  const rowKey = String(form.get('id') ?? '');
  const parentId = String(form.get('parent') ?? '');
  const submitted: Record<string, string> = {};
  for (const f of def.fields) {
    if (f.type !== 'password') submitted[f.name] = String(form.get(f.name) ?? '');
  }

  if (!(await csrfOk(String(form.get('csrf') ?? '')))) {
    return { errors: { general: 'Your session expired. Please submit the form again.' }, values: submitted };
  }
  if ((isNew && !def.create) || (!isNew && !def.edit)) {
    return { errors: { general: `${def.label} cannot be ${isNew ? 'created' : 'edited'} here.` }, values: submitted };
  }

  const writable = def.fields.filter(
    (f) => !f.readOnly && !f.formHidden && !(f.createOnly && !isNew) && !(def.parent && f.name === def.parent.field && parentId)
  );
  if (!writable.length) return { errors: { general: 'Nothing on this record can be changed here.' }, values: submitted };

  const values: Record<string, unknown> = {};
  const errors: Record<string, string> = {};

  // A child created under its parent belongs to that parent, whatever was posted.
  if (def.parent && parentId) {
    const parentField = def.fields.find((f) => f.name === def.parent!.field);
    if (parentField && !(await relationExists(parentField, parentId))) {
      return { errors: { general: `That ${def.parent.label.toLowerCase()} no longer exists.` }, values: submitted };
    }
    values[def.parent.field] = def.numericPk ? Number(parentId) : parentId;
  }

  /* ---- Table rules that shape a value before it is validated ---- */
  if (def.key === 'authors' && !submitted.slug?.trim()) submitted.slug = blogSlugify(submitted.name ?? '');
  if (def.key === 'authors') submitted.slug = blogSlugify(submitted.slug ?? '');
  if (def.key === 'redirects' && submitted.from_path?.trim()) submitted.from_path = normaliseRedirectPath(submitted.from_path);

  for (const f of writable) {
    const raw = f.type === 'checkbox' ? (form.get(f.name) ? '1' : '0') : f.type === 'password' ? String(form.get(f.name) ?? '') : submitted[f.name] ?? '';
    const [stored, error] = await validateField(f, raw, isNew);
    if (error) errors[f.name] = error;
    else if (stored !== undefined) values[f.name] = stored;
  }

  for (const f of writable.filter((x) => x.unique)) {
    const v = values[f.name];
    if (errors[f.name] || v === null || v === undefined || v === '') continue;
    if (await valueTaken(def, f.name, String(v), isNew ? null : rowKey)) {
      errors[f.name] = `${f.label} “${v}” is already used by another ${def.singular.toLowerCase()}.`;
    }
  }

  /* ---- Table rules that need the whole record ---- */
  if (def.key === 'redirects' && !errors.from_path && !errors.to_url) {
    const to = String(values.to_url ?? '');
    if (!/^(\/|https?:\/\/)/i.test(to)) errors.to_url = 'To: enter a site path beginning with / or a full https:// URL.';
    else if (to.startsWith('/') && normaliseRedirectPath(to) === values.from_path) errors.to_url = 'A redirect cannot point at its own address.';
    if (!['301', '302', '307', '308'].includes(String(values.code))) errors.code = 'Choose a redirect type.';
    else values.code = Number(values.code);
  }

  if (def.key === 'admin-users') {
    const [row] = rowKey ? await sql<{ role: string }>('SELECT role FROM vx_users WHERE id = ?', [Number(rowKey)]) : [];
    const wasAdmin = row?.role === 'admin';
    if (!isNew && wasAdmin && values.role !== 'admin') {
      const [others] = await sql<{ n: number }>("SELECT COUNT(*) AS n FROM vx_users WHERE role = 'admin' AND id <> ?", [Number(rowKey)]);
      if (Number(others?.n ?? 0) === 0) errors.role = 'This is the last administrator; keep the role, or make someone else an administrator first.';
      else if (Number(rowKey) === user.id) errors.role = 'You cannot remove your own administrator role.';
    }
    if (isNew) values.created_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
  }

  if (def.key === 'portal-users') {
    if (values.role === 'client' && !values.client_id) errors.client_id = 'A client user must belong to a client.';
    if (values.role !== 'client') values.client_id = null;
    if (isNew && values.password_hash && values.status === 'invited') values.status = 'active';
  }

  if (Object.keys(errors).length) return { errors, values: submitted };

  /* ---- Write ---- */
  let savedKey = rowKey;
  try {
    const cols = Object.keys(values);
    if (isNew) {
      const res = await exec(
        `INSERT INTO ${id(def.table)} (${cols.map(id).join(', ')}) VALUES (${cols.map(() => '?').join(', ')})`,
        cols.map((c) => values[c])
      );
      savedKey = def.numericPk ? String(res.insertId) : String(values[def.pk] ?? '');
    } else {
      const res = await exec(
        `UPDATE ${id(def.table)} SET ${cols.map((c) => `${id(c)} = ?`).join(', ')} WHERE ${id(def.pk)} = ?`,
        [...cols.map((c) => values[c]), def.numericPk ? Number(rowKey) : rowKey]
      );
      if (!res.affectedRows) {
        await setFlash({ err: `That ${def.singular.toLowerCase()} no longer exists.` });
        redirect(listingUrl(def, parentId));
      }
    }
  } catch (e) {
    if (e && typeof e === 'object' && 'digest' in e) throw e;
    return { errors: { general: `The ${def.singular.toLowerCase()} could not be saved: ${String(e)}` }, values: submitted };
  }

  /* ---- After the write ---- */
  const label = String(values[def.titleField] ?? submitted[def.titleField] ?? savedKey).slice(0, 80);
  if (def.key === 'authors' && !isNew) {
    // The byline text on each post follows the profile's name.
    await exec('UPDATE vx_posts SET author = ? WHERE author_id = ?', [String(values.name).slice(0, 120), Number(savedKey)]);
  }
  if (def.key === 'admin-users' && Number(savedKey) === user.id) {
    await refreshUser({ id: user.id, name: String(values.name), email: String(values.email), role: String(values.role) });
  }
  const clientId = def.key === 'clients' ? savedKey : String(values.client_id ?? parentId ?? '') || null;
  await logPortal(def, user, isNew ? 'created' : 'updated', clientId, label);

  if (['authors', 'redirects'].includes(def.key)) revalidatePath('/', 'layout');
  await setFlash({ ok: `${def.singular} “${label}” ${isNew ? 'created' : 'saved'}.` });
  redirect(def.key === 'clients' && isNew ? adminUrl('clients/view') + '?id=' + savedKey : listingUrl(def, parentId));
}

/* ---- Delete -------------------------------------------------------------- */

export async function resourceOpAction(form: FormData) {
  const user = await requireUser();
  const key = String(form.get('resource') ?? '');
  const def = resourceByKey(key);
  const back = safeBack(form.get('back'), def ? adminUrl(def.key) : adminUrl('dashboard'));
  await authorise(def, user, back);
  await requireCsrf(form, back);
  const resource = def!;

  const op = String(form.get('op') ?? '');
  const rowKey = String(form.get('id') ?? '');

  if (op !== 'delete' || !resource.remove) {
    await setFlash({ err: 'That action is not available here.' });
    redirect(back);
  }

  try {
    const [row] = await sql<Record<string, unknown>>(
      `SELECT * FROM ${id(resource.table)} WHERE ${id(resource.pk)} = ? LIMIT 1`,
      [resource.numericPk ? Number(rowKey) : rowKey]
    );
    if (!row) {
      await setFlash({ err: `That ${resource.singular.toLowerCase()} no longer exists.` });
      redirect(back);
    }
    const label = String(row[resource.titleField] ?? rowKey).slice(0, 80);

    if (resource.key === 'admin-users') {
      if (Number(rowKey) === user.id) {
        await setFlash({ err: 'You cannot delete your own account while signed in to it.' });
        redirect(back);
      }
      if (row.role === 'admin') {
        const [others] = await sql<{ n: number }>("SELECT COUNT(*) AS n FROM vx_users WHERE role = 'admin' AND id <> ?", [Number(rowKey)]);
        if (Number(others?.n ?? 0) === 0) {
          await setFlash({ err: 'That is the last administrator account, so it cannot be deleted.' });
          redirect(back);
        }
      }
    }
    if (resource.key === 'authors') {
      // vx_posts.author_id has no foreign key: detach the posts, keep their byline text.
      await exec('UPDATE vx_posts SET author_id = NULL WHERE author_id = ?', [Number(rowKey)]);
    }

    await exec(`DELETE FROM ${id(resource.table)} WHERE ${id(resource.pk)} = ?`, [resource.numericPk ? Number(rowKey) : rowKey]);
    const clientId = resource.key === 'clients' ? null : String(row.client_id ?? '') || null;
    await logPortal(resource, user, 'deleted', clientId, label);
    if (['authors', 'redirects'].includes(resource.key)) revalidatePath('/', 'layout');
    await setFlash({
      ok:
        resource.key === 'clients'
          ? `Client “${label}” deleted, with its contacts, deadlines, documents, ledger, messages and portal users.`
          : `${resource.singular} “${label}” deleted.`,
    });
  } catch (e) {
    if (e && typeof e === 'object' && 'digest' in e) throw e;
    await setFlash({ err: `The ${resource.singular.toLowerCase()} could not be deleted: ${String(e)}` });
  }
  redirect(back);
}
