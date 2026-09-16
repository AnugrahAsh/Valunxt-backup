/**
 * One field's value, printed the way its declaration asks — money, bytes, a
 * status pill, a date — for the listing tables and the read-only detail view.
 */
import type { FieldDef } from '@/lib/admin/resource-types';
import type { ResourceRow } from '@/lib/admin/resource-db';
import { dbStamp, formatDate, formatDateTime } from '@/lib/admin/format';

/** Status words that read as good, pending or bad, for the pill colour. */
const GOOD = /^(active|published|success|filed|fulfilled|reviewed|shared|won|admin|firm_admin|cfo|1|301|308)$/i;
const WAIT = /^(pending|open|invited|details pending|documents pending|contacted|qualified|growth|uploaded|requested|302|307|editor|accountant)$/i;
const BAD = /^(disabled|cancelled|error|lost|spam|login_fail|login_blocked|form_honeypot|malware|0)$/i;

function pillClass(v: string): string {
  if (GOOD.test(v)) return 'ok';
  if (WAIT.test(v)) return 'wait';
  if (BAD.test(v)) return 'warnp';
  return 'new';
}

function scorePill(n: number): string {
  if (n >= 90) return 'ok';
  if (n >= 50) return 'wait';
  return 'warnp';
}

export function optionLabel(f: FieldDef, v: string): string {
  return f.options?.find(([o]) => o === v)?.[1] ?? v;
}

export default function ResourceValue({ field, row, long = false }: { field: FieldDef; row: ResourceRow; long?: boolean }) {
  const raw = row[field.name] ?? '';
  const empty = <span className="counter-of">—</span>;

  if (field.type === 'password') return <span className="counter-of">••••••••</span>;
  if (field.type === 'relation') {
    const label = row[field.name + '__label'];
    return raw ? <span>{label || `#${raw}`}</span> : empty;
  }
  if (field.display === 'bool' || field.type === 'checkbox') {
    const on = raw === '1';
    return (
      <span className={`pill ${on ? 'ok' : 'off'}`}>
        <span className="pill-dot" />
        {on ? 'Yes' : 'No'}
      </span>
    );
  }
  if (raw === '') return empty;

  switch (field.display) {
    case 'money':
      return <span className="nowrap">AED {Number(raw).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>;
    case 'bytes': {
      const n = Number(raw);
      const text = n >= 1048576 ? `${(n / 1048576).toFixed(1)} MB` : n >= 1024 ? `${(n / 1024).toFixed(0)} KB` : `${n} B`;
      return <span className="nowrap">{text}</span>;
    }
    case 'date':
      return <span className="nowrap">{formatDate(dbStamp(raw.length === 10 ? raw + ' 00:00:00' : raw))}</span>;
    case 'datetime':
      return <span className="nowrap">{formatDateTime(dbStamp(raw))}</span>;
    case 'pill': {
      const n = Number(raw);
      const scored = field.type === 'int' && !Number.isNaN(n);
      return <span className={`pill ${scored ? scorePill(n) : pillClass(raw)}`}>{optionLabel(field, raw).replace(/_/g, ' ')}</span>;
    }
    case 'mono':
    case 'code':
      return <code className="cell-code">{raw}</code>;
    case 'excerpt':
      if (long) return <pre className="cell-pre">{prettyJson(raw)}</pre>;
      return <span>{raw.length > 110 ? raw.slice(0, 110) + '…' : raw}</span>;
  }
  if (field.type === 'json' || field.type === 'code') return long ? <pre className="cell-pre">{prettyJson(raw)}</pre> : <code className="cell-code">{raw.slice(0, 80)}</code>;
  if (field.type === 'url' && /^https?:\/\//.test(raw)) {
    return (
      <a className="link" href={raw} target="_blank" rel="noopener noreferrer">
        {raw}
      </a>
    );
  }
  const text = optionLabel(field, raw);
  return <span>{!long && text.length > 120 ? text.slice(0, 120) + '…' : text}</span>;
}

function prettyJson(raw: string): string {
  try {
    return JSON.stringify(JSON.parse(raw), null, 2);
  } catch {
    return raw;
  }
}
