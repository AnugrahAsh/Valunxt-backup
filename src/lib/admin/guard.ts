/**
 * What every admin write checks before it runs, and what it records.
 *
 * Kept out of the 'use server' action files because those may only export
 * async actions: anything exported from them becomes a public endpoint.
 *
 * ROLES. `vx_users.role` carries the imported panel's value, 'admin'. A second
 * role, 'editor', is recognised for accounts created here: an editor manages
 * content, SEO and leads, and cannot reach the client portal's financial
 * records, the security log, administrator accounts or site settings. Any other
 * value is treated as the least-privileged role.
 */
import 'server-only';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { exec, sql } from '@/lib/db';
import { adminUrl } from './config';
import { csrfOk, currentUser, setFlash, type AdminUser } from './session';

export type AdminRole = 'admin' | 'editor';

/** The roles an account can be given, in the order the form lists them. */
export const ADMIN_ROLES: readonly AdminRole[] = ['admin', 'editor'];

export function roleOf(user: Pick<AdminUser, 'role'> | null | undefined): AdminRole {
  return String(user?.role ?? '').toLowerCase() === 'admin' ? 'admin' : 'editor';
}

export function isAdmin(user: Pick<AdminUser, 'role'> | null | undefined): boolean {
  return roleOf(user) === 'admin';
}

/** Scheme + host of the panel request, so generated URLs match the site. */
export async function requestOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? '';
  if (!host) return '';
  const proto =
    h.get('x-forwarded-proto') ?? (host.startsWith('localhost') || host.startsWith('127.') ? 'http' : 'https');
  return `${proto}://${host}`;
}

/** The visitor's address, as the proxy in front of the app reports it. */
export async function clientIp(): Promise<string> {
  const h = await headers();
  return (h.get('x-forwarded-for')?.split(',')[0].trim() || h.get('x-real-ip') || '').slice(0, 45);
}

/**
 * The signed-in administrator, or a redirect to the sign-in screen.
 *
 * A Server Action is an endpoint in its own right: anyone can post to it, not
 * only the screen that renders its form. So every write checks this first.
 */
export async function requireUser(): Promise<AdminUser> {
  const user = await currentUser();
  if (!user) redirect(adminUrl(''));
  return user;
}

/** As requireUser, and the account must hold the admin role. */
export async function requireAdmin(back = adminUrl('dashboard')): Promise<AdminUser> {
  const user = await requireUser();
  if (!isAdmin(user)) {
    await setFlash({ err: 'That needs an administrator account.' });
    redirect(back);
  }
  return user;
}

/** The CSRF check every form carries, with the panel's standard message. */
export async function requireCsrf(form: FormData, back: string): Promise<void> {
  if (!(await csrfOk(String(form.get('csrf') ?? '')))) {
    await setFlash({ err: 'Your session expired. Please try again.' });
    redirect(back);
  }
}

/** Only ever send a form back into the panel: the field comes from the browser. */
export function safeBack(value: unknown, fallback: string): string {
  const v = String(value ?? '');
  return v.startsWith(adminUrl('')) ? v : fallback;
}

/**
 * Record a security event in `vx_security_events`, the log the imported panel
 * kept (login failures, form honeypot hits). Never throws: a log that cannot be
 * written must not break the request it describes.
 */
export async function logSecurityEvent(type: string, detail: string, pathName = ''): Promise<void> {
  try {
    const h = await headers();
    const ip = (h.get('x-forwarded-for')?.split(',')[0].trim() || h.get('x-real-ip') || '').slice(0, 45);
    await exec(
      'INSERT INTO vx_security_events (ts, ip, type, detail, ua, path) VALUES (UTC_TIMESTAMP(), ?, ?, ?, ?, ?)',
      [ip || null, type.slice(0, 40), detail.slice(0, 500), (h.get('user-agent') ?? '').slice(0, 255) || null, pathName.slice(0, 255) || null]
    );
  } catch {
    /* best effort */
  }
}

/**
 * Failed sign-ins for one account inside the lockout window, from any address.
 *
 * The address alone is not enough: it comes from X-Forwarded-For, which Next.js
 * passes through as the client sent it when no proxy overwrites it, so a
 * password guesser could name a new address on every attempt. The account
 * count holds whatever the header says.
 */
export async function recentAccountFailures(email: string, minutes = 15): Promise<number> {
  if (!email) return 0;
  try {
    const rows = await sql<{ n: number }>(
      "SELECT COUNT(*) AS n FROM vx_security_events WHERE type = 'login_fail' AND LOWER(detail) = LOWER(?) AND ts >= UTC_TIMESTAMP() - INTERVAL ? MINUTE",
      [email.slice(0, 500), minutes]
    );
    return Number(rows[0]?.n ?? 0);
  } catch {
    return 0;
  }
}

/** Failed sign-ins from one address inside the lockout window. */
export async function recentLoginFailures(ip: string, minutes = 15): Promise<number> {
  if (!ip) return 0;
  try {
    const rows = await sql<{ n: number }>(
      "SELECT COUNT(*) AS n FROM vx_security_events WHERE type = 'login_fail' AND ip = ? AND ts >= UTC_TIMESTAMP() - INTERVAL ? MINUTE",
      [ip, minutes]
    );
    return Number(rows[0]?.n ?? 0);
  } catch {
    return 0;
  }
}
