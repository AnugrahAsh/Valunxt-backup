/**
 * Reads for the table-backed admin screens (lib/admin/resources.ts).
 *
 * Every identifier in the SQL built here — table, columns, ORDER BY, the label
 * expression of a relation — comes from the registry, never from the request;
 * every value from the request is a placeholder. A screen can therefore only
 * ever read the table and columns it was declared with.
 */
import 'server-only';

import { likePattern, rowLimit, sql } from '@/lib/db';
import type { FieldDef, ResourceDef } from './resource-types';

export type ResourceRow = Record<string, string>;

export interface ListQuery {
  q?: string;
  /** column -> value, for the declared filter fields only. */
  filters?: Record<string, string>;
  /** The parent row's id, for a resource declared with `parent`. */
  parentId?: string;
  page?: number;
}

export interface ListResult {
  rows: ResourceRow[];
  total: number;
  page: number;
  perPage: number;
  pages: number;
}

const id = (name: string) => '`' + name.replace(/`/g, '') + '`';

function toStrings(r: Record<string, unknown>): ResourceRow {
  const out: ResourceRow = {};
  for (const [k, v] of Object.entries(r)) out[k] = v === null || v === undefined ? '' : String(v);
  return out;
}

/** The select list: every column, plus a readable label for each relation. */
function selectList(def: ResourceDef): string {
  const labels = def.fields
    .filter((f) => f.type === 'relation' && f.relation)
    .map((f) => {
      const r = f.relation!;
      return `(SELECT ${r.label} FROM ${id(r.table)} r WHERE r.${id(r.key)} = t.${id(f.name)} LIMIT 1) AS ${id(f.name + '__label')}`;
    });
  return ['t.*', ...labels].join(', ');
}

function whereFor(def: ResourceDef, q: ListQuery): { where: string; args: unknown[] } {
  const parts: string[] = [];
  const args: unknown[] = [];

  const term = String(q.q ?? '').trim();
  const searchable = def.fields.filter((f) => f.search);
  if (term && searchable.length) {
    const like = likePattern(term);
    parts.push('(' + searchable.map((f) => `t.${id(f.name)} LIKE ?`).join(' OR ') + ')');
    for (let i = 0; i < searchable.length; i++) args.push(like);
  }

  for (const f of def.fields.filter((x) => x.filter)) {
    const value = q.filters?.[f.name];
    if (value === undefined || value === '') continue;
    if (value === '__none__') {
      parts.push(`t.${id(f.name)} IS NULL`);
    } else {
      parts.push(`t.${id(f.name)} = ?`);
      args.push(value);
    }
  }

  if (def.parent && q.parentId) {
    parts.push(`t.${id(def.parent.field)} = ?`);
    args.push(q.parentId);
  }

  return { where: parts.length ? 'WHERE ' + parts.join(' AND ') : '', args };
}

/** A page of rows matching the search, filters and parent. */
export async function listRows(def: ResourceDef, q: ListQuery = {}): Promise<ListResult> {
  const perPage = rowLimit(def.perPage, 20);
  const { where, args } = whereFor(def, q);
  const [countRow] = await sql<{ n: number }>(`SELECT COUNT(*) AS n FROM ${id(def.table)} t ${where}`, args);
  const total = Number(countRow?.n ?? 0);
  const pages = Math.max(1, Math.ceil(total / perPage));
  const page = Math.min(Math.max(1, Math.trunc(Number(q.page) || 1)), pages);
  const rows = await sql(
    `SELECT ${selectList(def)} FROM ${id(def.table)} t ${where} ORDER BY ${def.orderBy} LIMIT ${perPage} OFFSET ${(page - 1) * perPage}`,
    args
  );
  return { rows: rows.map((r) => toStrings(r as Record<string, unknown>)), total, page, perPage, pages };
}

/** One row by primary key, with its relation labels, or null. */
export async function getRow(def: ResourceDef, key: string): Promise<ResourceRow | null> {
  const rows = await sql(`SELECT ${selectList(def)} FROM ${id(def.table)} t WHERE t.${id(def.pk)} = ? LIMIT 1`, [
    def.numericPk ? Number(key) : String(key),
  ]);
  return rows[0] ? toStrings(rows[0] as Record<string, unknown>) : null;
}

/** The rows a relation field may point at, as [value, label]. */
export async function relationOptions(field: FieldDef): Promise<Array<[string, string]>> {
  const r = field.relation;
  if (!r) return [];
  const rows = await sql<{ v: unknown; l: unknown }>(
    `SELECT ${id(r.key)} AS v, ${r.label} AS l FROM ${id(r.table)} ${r.where ? 'WHERE ' + r.where : ''} ORDER BY ${r.order ?? id(r.key)} LIMIT 500`
  );
  return rows.map((x) => [String(x.v), String(x.l ?? x.v)]);
}

/** The choices a filter offers: the declared options, the relation's rows, or the values in use. */
export async function filterOptions(def: ResourceDef, field: FieldDef): Promise<Array<[string, string]>> {
  if (field.options?.length) return field.options.map(([v, l]) => [v, l]);
  if (field.type === 'checkbox') return [['1', 'Yes'], ['0', 'No']];
  if (field.type === 'relation') return relationOptions(field);
  const rows = await sql<{ v: unknown }>(
    `SELECT DISTINCT ${id(field.name)} AS v FROM ${id(def.table)} WHERE ${id(field.name)} IS NOT NULL AND ${id(field.name)} <> '' ORDER BY v LIMIT 100`
  );
  return rows.map((x) => [String(x.v), String(x.v)]);
}

/** Whether another row already holds `value` in a unique column. */
export async function valueTaken(def: ResourceDef, column: string, value: string, exceptKey: string | null): Promise<boolean> {
  const args: unknown[] = [value];
  let except = '';
  if (exceptKey !== null) {
    except = ` AND ${id(def.pk)} <> ?`;
    args.push(def.numericPk ? Number(exceptKey) : exceptKey);
  }
  const [row] = await sql<{ n: number }>(`SELECT COUNT(*) AS n FROM ${id(def.table)} WHERE ${id(column)} = ?${except}`, args);
  return Number(row?.n ?? 0) > 0;
}

/** Whether a relation value points at a row that exists. */
export async function relationExists(field: FieldDef, value: string): Promise<boolean> {
  const r = field.relation;
  if (!r) return true;
  const [row] = await sql<{ n: number }>(
    `SELECT COUNT(*) AS n FROM ${id(r.table)} WHERE ${id(r.key)} = ? ${r.where ? 'AND ' + r.where : ''}`,
    [value]
  );
  return Number(row?.n ?? 0) > 0;
}

/** Row counts of child resources for a parent row, for the parent's detail page. */
export async function childCount(def: ResourceDef, parentId: string): Promise<number> {
  if (!def.parent) return 0;
  const [row] = await sql<{ n: number }>(`SELECT COUNT(*) AS n FROM ${id(def.table)} WHERE ${id(def.parent.field)} = ?`, [parentId]);
  return Number(row?.n ?? 0);
}
