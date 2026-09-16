/**
 * Date and number formatting shared by the admin screens.
 *
 * Every timestamp in the database is UTC. The imported www.valunxt.com data was
 * written by a server in UTC, and since the import every connection the site
 * opens pins its session to UTC (lib/db.ts), so NOW() and CURRENT_TIMESTAMP
 * write UTC too. Rows arrive as "YYYY-MM-DD HH:MM:SS" with no zone on them;
 * dbStamp() reads them as what they are, and the browser shows local time.
 */

/** A DATETIME read from the database: UTC. */
export function dbStamp(value: string | null | undefined): Date | null {
  return utcStamp(value);
}

/**
 * Kept for the call sites written before the import, when row timestamps were
 * in the database server's own zone. They are UTC now; this is dbStamp().
 */
export function localStamp(value: string | null | undefined): Date | null {
  return utcStamp(value);
}

/** A "YYYY-MM-DD HH:MM:SS" string written in UTC. */
export function utcStamp(value: string | null | undefined): Date | null {
  if (!value) return null;
  const s = String(value).trim();
  const d = new Date(/[zZ]|[+-]\d\d:?\d\d$/.test(s) ? s : s.replace(' ', 'T') + 'Z');
  return Number.isNaN(d.getTime()) ? null : d;
}

/** "15 Sep 2026, 17:05" */
export function formatDateTime(d: Date | null, fallback = '—'): string {
  if (!d) return fallback;
  return d.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

/** "15 Sep 2026" */
export function formatDate(d: Date | null, fallback = '—'): string {
  if (!d) return fallback;
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

/** "just now", "12 minutes ago", "Yesterday", "3 days ago", then the date. */
export function timeAgo(d: Date | null, now = new Date()): string {
  if (!d) return '—';
  const secs = Math.round((now.getTime() - d.getTime()) / 1000);
  if (secs < 60) return 'just now';
  const mins = Math.round(secs / 60);
  if (mins < 60) return `${mins} minute${mins === 1 ? '' : 's'} ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.round(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return formatDate(d);
}

/** 1248 → "1,248" */
export function formatCount(n: number): string {
  return Number(n || 0).toLocaleString('en-GB');
}
