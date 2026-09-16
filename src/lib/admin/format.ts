/**
 * Date and number formatting shared by the admin screens.
 *
 * Two kinds of timestamp reach the panel, and they are not in the same zone:
 *
 *   - Row timestamps (enquiries.created_at, pages.updated_at, users.last_login_at)
 *     are MySQL DATETIMEs written by CURRENT_TIMESTAMP / NOW(), i.e. in the
 *     database server's local time. They arrive as "YYYY-MM-DD HH:MM:SS" and are
 *     read as local time.
 *   - seo_settings.sitemap_generated_at is written by lib/admin/seo-lib.ts from
 *     `new Date().toISOString()`, i.e. in UTC, in the same shape. Read as local
 *     time it showed the sitemap as generated hours earlier or later than it was
 *     (5h30 on an IST machine). utcStamp() reads it as what it is.
 */

/** A MySQL DATETIME string in the database's local time. */
export function localStamp(value: string | null | undefined): Date | null {
  if (!value) return null;
  const d = new Date(String(value).replace(' ', 'T'));
  return Number.isNaN(d.getTime()) ? null : d;
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
