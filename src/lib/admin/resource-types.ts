/**
 * The shape of a table-backed admin screen.
 *
 * Most of the imported www.valunxt.com tables are plain records — authors,
 * redirects, keywords, accounts, the client portal's clients, contacts,
 * deadlines and ledger — or logs to be read. Rather than a hand-written list
 * and form for each, a screen is declared once (lib/admin/resources.ts) and the
 * generic list, form, validation and actions do the rest, so every table is
 * searched, filtered, paged, validated and confirmed the same way.
 *
 * Plain data only — no functions — because the field list travels to the
 * client-side form component as props.
 */
import type { IconName } from '@/components/admin/Icon';

export type FieldType =
  | 'text'
  | 'textarea'
  | 'email'
  | 'url'
  | 'path'
  | 'tel'
  | 'int'
  | 'decimal'
  | 'date'
  | 'datetime'
  | 'select'
  | 'checkbox'
  | 'password'
  | 'relation'
  | 'json'
  | 'code';

export interface FieldDef {
  /** The column. For a password field, the column the hash is written to. */
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  /** Maximum length for text; maximum value for numbers. */
  max?: number;
  min?: number;
  /** Choices for a select: [stored value, label]. */
  options?: ReadonlyArray<readonly [string, string]>;
  /** A relation: the resource whose rows are offered, and its label column. */
  relation?: { table: string; key: string; label: string; order?: string; where?: string };
  /** The column accepts NULL: an empty value is stored as NULL. */
  nullable?: boolean;
  help?: string;
  placeholder?: string;
  /** Shown in the listing table. */
  list?: boolean;
  /** Included in the free-text search. */
  search?: boolean;
  /** Offered as a select filter above the listing (select and relation fields). */
  filter?: boolean;
  /** Shown on the form but never written. */
  readOnly?: boolean;
  /** Only on the create form (e.g. an initial password). */
  createOnly?: boolean;
  /** Not on the form at all (listing only). */
  formHidden?: boolean;
  /** Spans the form's full width. */
  full?: boolean;
  /** Value no other row may hold. */
  unique?: boolean;
  /** How the listing prints the value. */
  display?: 'money' | 'bytes' | 'pill' | 'bool' | 'date' | 'datetime' | 'code' | 'mono' | 'excerpt';
  /** Default for a new row. */
  defaultValue?: string;
}

export type NavGroup = 'Main' | 'Content' | 'SEO' | 'Insights' | 'Client Portal' | 'System';

export interface ResourceDef {
  /** URL segment: /admin/<key>/ */
  key: string;
  table: string;
  /** Primary key column. String keys (vx_settings.k) are supported. */
  pk: string;
  /** The primary key is a number. */
  numericPk: boolean;
  label: string;
  singular: string;
  description: string;
  icon: IconName;
  group: NavGroup;
  /** Hidden from the sidebar (reached from a parent screen). */
  navHidden?: boolean;
  fields: FieldDef[];
  /** The column that names a row. */
  titleField: string;
  /** SQL ORDER BY for the listing (a constant from the registry, never input). */
  orderBy: string;
  create?: boolean;
  edit?: boolean;
  remove?: boolean;
  /** Only administrators may open it. */
  adminOnly?: boolean;
  /** Rows belong to a parent row: listed and created under it. */
  parent?: { field: string; resource: string; label: string };
  perPage?: number;
  /** A note shown above the listing, e.g. what a log records. */
  note?: string;
}
