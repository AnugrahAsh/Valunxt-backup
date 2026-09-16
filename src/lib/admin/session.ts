/**
 * Admin sessions and flash messages.
 *
 * PHP kept the signed-in user in `$_SESSION`. There is no server-side session
 * store here, so the same payload travels in an HMAC-signed, httpOnly cookie:
 * the browser cannot read or forge it, and the panel stays stateless.
 *
 * One rule shapes this file: a page render may READ cookies but never write
 * them (Next.js throws "Cookies can only be modified in a Server Action or
 * Route Handler"). Everything a screen calls while rendering — currentUser(),
 * csrfToken(), takeFlash() — is therefore read-only, and every write happens in
 * a Server Action or a Route Handler.
 *
 * Port of admin/auth.php.
 */
import 'server-only';
import crypto from 'node:crypto';
import { cookies } from 'next/headers';

import { sql } from '@/lib/db';
import { ADMIN_FLASH_COOKIE, ADMIN_FLASH_PATH } from './config';

const COOKIE = 'vxn_admin';
const MAX_AGE = 60 * 60 * 8; // eight hours, as a working day
const REMEMBER_AGE = 60 * 60 * 24 * 30; // "Remember me": thirty days

/**
 * Part of what every session cookie is signed with. Changing it signs every
 * administrator out.
 *
 * It moved to 'vx_users' when the accounts moved from the project's `users`
 * table into the imported `vx_users` (20260916). A cookie carries the account
 * id, and ids were renumbered by that move — an old cookie naming id 1 would
 * otherwise have resolved to whichever account holds id 1 now.
 */
const SESSION_SCOPE = 'vx_users';

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface SessionPayload extends AdminUser {
  exp: number;
  /** Signed in with "Remember me" — kept so a refreshed cookie keeps its length. */
  rem?: 1;
}

function secret(): string {
  const explicit = (process.env.ADMIN_SESSION_SECRET ?? '').trim();
  if (explicit !== '') return explicit;
  // A deployment without an explicit secret still gets a stable one derived
  // from the database password, so sessions survive a restart. Set
  // ADMIN_SESSION_SECRET in .env.local for anything public-facing.
  const dbPass = process.env.DB_PASS ?? '';
  if (dbPass !== '') return 'vxn-admin-' + dbPass;
  // With neither, the key would be a string printed in this file, and anyone
  // could sign a session cookie. Development only.
  if (process.env.NODE_ENV === 'production') {
    throw new Error('ADMIN_SESSION_SECRET is not set: the admin panel cannot sign sessions (see .env.example).');
  }
  return 'vxn-admin-local-development-only';
}

function sign(payload: string): string {
  return crypto
    .createHmac('sha256', secret())
    .update(SESSION_SCOPE + ':' + payload)
    .digest('base64url');
}

function safeEqual(a: string, b: string): boolean {
  // Constant-time compare, the equivalent of PHP's hash_equals().
  return a.length === b.length && crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

function encode(user: AdminUser, remember: boolean): string {
  const data: SessionPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    exp: Date.now() + (remember ? REMEMBER_AGE : MAX_AGE) * 1000,
    ...(remember ? { rem: 1 as const } : {}),
  };
  const payload = Buffer.from(JSON.stringify(data)).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

function decode(value: string): SessionPayload | null {
  const [payload, mac] = value.split('.');
  if (!payload || !mac || !safeEqual(mac, sign(payload))) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (typeof data.exp !== 'number' || data.exp < Date.now()) return null;
    return data as SessionPayload;
  } catch {
    return null;
  }
}

async function writeSession(user: AdminUser, remember: boolean): Promise<void> {
  const c = await cookies();
  c.set(COOKIE, encode(user, remember), {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: remember ? REMEMBER_AGE : MAX_AGE,
    secure: process.env.NODE_ENV === 'production',
  });
}

/**
 * The currently signed-in user, or null.
 *
 * The cookie proves who signed in; the account table says whether they still
 * may. An administrator deleted under Admin Users, or whose email was changed
 * by someone else, is signed out on their next request rather than when their
 * cookie expires. The name and role come from the table too, so a role change
 * applies at once.
 *
 * When the database cannot be reached the cookie is trusted as it stands, so a
 * signed-in administrator sees each screen's own "MySQL is not running" notice
 * instead of being bounced to the sign-in form, which cannot work either.
 */
export async function currentUser(): Promise<AdminUser | null> {
  const c = await cookies();
  const raw = c.get(COOKIE)?.value;
  const data = raw ? decode(raw) : null;
  if (!data) return null;

  try {
    const rows = await sql<{ id: number; name: string; email: string; role: string }>(
      'SELECT id, name, email, role FROM vx_users WHERE id = ? LIMIT 1',
      [data.id]
    );
    const row = rows[0];
    if (!row || String(row.email).toLowerCase() !== String(data.email).toLowerCase()) return null;
    return { id: Number(row.id), name: row.name, email: row.email, role: row.role };
  } catch {
    return { id: data.id, name: data.name, email: data.email, role: data.role };
  }
}

/** Store the authenticated user. "Remember me" keeps the session for thirty days. */
export async function loginUser(user: AdminUser, remember = false): Promise<void> {
  await writeSession(user, remember);
}

/**
 * Re-issue the session with updated details (after a profile change), keeping
 * the length the user signed in with.
 */
export async function refreshUser(user: AdminUser): Promise<void> {
  const c = await cookies();
  const raw = c.get(COOKIE)?.value;
  const data = raw ? decode(raw) : null;
  await writeSession(user, data?.rem === 1);
}

/** Sign the current administrator out. */
export async function logoutUser(): Promise<void> {
  const c = await cookies();
  c.delete(COOKIE);
}

/* ---- CSRF ---------------------------------------------------------------- */

/**
 * The panel's forms are Server Actions, which Next.js already protects against
 * cross-origin POSTs. The token is kept because the PHP forms carried one.
 *
 * It used to be a random value stored in its own cookie, created the first time
 * a screen asked for it — which meant writing a cookie during a page render,
 * and every screen with a form (Enquiries, Pages, the editor, Sitemap) failed
 * with a 500 as a result. It is now derived from the session cookie instead: an
 * HMAC the browser already holds the input for and cannot compute itself, so
 * rendering it needs no write, and it is bound to the signed-in session.
 */
export async function csrfToken(): Promise<string> {
  const c = await cookies();
  const session = c.get(COOKIE)?.value ?? '';
  return session ? sign('csrf.' + session) : '';
}

export async function csrfOk(token: string): Promise<boolean> {
  const expected = await csrfToken();
  return expected !== '' && safeEqual(String(token), expected);
}

/* ---- Flash messages ------------------------------------------------------ */

export interface Flash {
  ok?: string;
  err?: string;
  /** Distinguishes two identical messages in a row, so the second still shows. */
  id?: string;
}

/** Set the message shown after the next redirect. */
export async function setFlash(flash: Flash): Promise<void> {
  const c = await cookies();
  const value = { ...flash, id: crypto.randomBytes(6).toString('hex') };
  c.set(ADMIN_FLASH_COOKIE, Buffer.from(JSON.stringify(value)).toString('base64url'), {
    // Not httpOnly: the banner deletes it from the browser once it has shown
    // it (components/admin/Flash.tsx). It carries a UI message and nothing else.
    httpOnly: false,
    sameSite: 'lax',
    path: ADMIN_FLASH_PATH,
    maxAge: 60,
  });
}

/**
 * Read the pending message.
 *
 * Read-only, because it runs during a render. The banner clears the cookie in
 * the browser once the message is on screen; the one-minute max-age is the
 * backstop when scripts do not run.
 */
export async function takeFlash(): Promise<Flash> {
  const c = await cookies();
  const raw = c.get(ADMIN_FLASH_COOKIE)?.value;
  if (!raw) return {};
  try {
    return JSON.parse(Buffer.from(raw, 'base64url').toString('utf8')) as Flash;
  } catch {
    return {};
  }
}
