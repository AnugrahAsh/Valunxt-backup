/**
 * The admin panel's database access and its administrator accounts.
 *
 * Runs on the shared pool (src/lib/db.ts) against the imported schema. On top
 * of the schema the panel guarantees two things before any screen reads:
 *
 * - an administrator exists — seeded ONLY when `vx_users` is empty, so a fresh
 *   install can sign in while an imported database (which has its own admins)
 *   never gains an account with a password printed in the source;
 * - the page registry is in step with the website (seo-import.ts).
 */
import 'server-only';
import type mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

import { database, exec as dbExec, sql } from '@/lib/db';
import { DEFAULT_ADMIN_EMAIL, DEFAULT_ADMIN_NAME, DEFAULT_ADMIN_PASS } from './config';
import { syncSeoMap } from './seo-import';

let seeded: Promise<void> | null = null;

/** The first administrator, on an empty `vx_users` only. */
async function seedAdmin(p: mysql.Pool): Promise<void> {
  const [rows] = await p.query<mysql.RowDataPacket[]>('SELECT COUNT(*) AS n FROM vx_users');
  if (Number(rows[0]?.n ?? 0) > 0) return;
  await p.query('INSERT INTO vx_users (email, pass_hash, name, role, created_at) VALUES (?, ?, ?, ?, NOW())', [
    DEFAULT_ADMIN_EMAIL,
    await bcrypt.hash(DEFAULT_ADMIN_PASS, 10),
    DEFAULT_ADMIN_NAME,
    'admin',
  ]);
}

/**
 * The pool, with the schema guaranteed, an administrator present and the page
 * registry in step with src/data/seo-map.json. Throws if MySQL is unreachable.
 */
export async function db(): Promise<mysql.Pool> {
  const p = await database();
  if (!seeded) {
    seeded = seedAdmin(p).catch((e) => {
      seeded = null;
      throw e;
    });
  }
  await seeded;
  await syncSeoMap(p);
  return p;
}

/** A convenience SELECT that always returns rows. */
export async function query<T = mysql.RowDataPacket>(statement: string, args: unknown[] = []): Promise<T[]> {
  await db();
  return sql<T>(statement, args);
}

/** A convenience INSERT/UPDATE/DELETE. */
export async function execute(statement: string, args: unknown[] = []): Promise<mysql.ResultSetHeader> {
  await db();
  return dbExec(statement, args);
}

/* ---- Authentication ------------------------------------------------------ */

export interface UserRow {
  id: number;
  name: string;
  email: string;
  pass_hash: string;
  role: string;
}

/** PHP writes bcrypt as $2y$; it is the same algorithm as $2a$/$2b$. */
function phpHash(hash: string): string {
  return String(hash).replace(/^\$2y\$/, '$2a$');
}

/**
 * Authenticate an email + password pair against `vx_users`.
 *
 * The imported accounts carry PHP `password_hash()` digests from the old panel,
 * so they sign in unchanged.
 */
export async function attemptLogin(email: string, password: string): Promise<UserRow | null> {
  const rows = await query<UserRow>('SELECT id, name, email, pass_hash, role FROM vx_users WHERE email = ? LIMIT 1', [
    email,
  ]);
  const user = rows[0];
  if (!user || !user.pass_hash) return null;
  if (!(await bcrypt.compare(password, phpHash(user.pass_hash)))) return null;

  try {
    await execute('UPDATE vx_users SET last_login = NOW() WHERE id = ?', [user.id]);
  } catch {
    /* non-fatal */
  }
  return user;
}

/* ---- Account settings ---------------------------------------------------- */

export interface AccountRow {
  id: number;
  name: string;
  email: string;
  role: string;
  last_login_at: string | null;
  created_at: string | null;
}

/** The signed-in administrator's own row, without the password hash. */
export async function findAccount(id: number): Promise<AccountRow | null> {
  const rows = await query<AccountRow>(
    'SELECT id, name, email, role, last_login AS last_login_at, created_at FROM vx_users WHERE id = ? LIMIT 1',
    [id]
  );
  return rows[0] ?? null;
}

/** Whether `password` is the current password of user `id`. */
export async function passwordMatches(id: number, password: string): Promise<boolean> {
  const rows = await query<{ pass_hash: string }>('SELECT pass_hash FROM vx_users WHERE id = ? LIMIT 1', [id]);
  const hash = rows[0]?.pass_hash;
  if (!hash) return false;
  return bcrypt.compare(password, phpHash(hash));
}

/** Replace the password of user `id`. */
export async function setPassword(id: number, password: string): Promise<void> {
  await execute('UPDATE vx_users SET pass_hash = ? WHERE id = ?', [await bcrypt.hash(password, 10), id]);
}

/** A bcrypt digest for a new password, for the account screens. */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}
