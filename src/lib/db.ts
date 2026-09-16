/**
 * The database connection every part of the site shares.
 *
 * One pool for the whole application: the admin panel, the public blog, the
 * lead forms and the redirect table all read and write through it. The schema
 * is the imported www.valunxt.com database (src/lib/admin/schema.ts), created on
 * first use if it is missing, so a fresh install needs no manual SQL import.
 *
 * Credentials come from the environment — DB_HOST, DB_PORT, DB_NAME, DB_USER,
 * DB_PASS in .env.local — and nowhere else in production. In development, with
 * no DB_HOST set, it falls back to XAMPP's defaults (root, no password), which
 * is all a local machine needs. Nothing here is ever sent to the browser: the
 * module is server-only.
 */
import 'server-only';
import mysql from 'mysql2/promise';

import { SCHEMA_EXTENSIONS, SCHEMA_TABLES } from './admin/schema';

export interface DbConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
}

/**
 * Connection settings. The environment wins; without it, a local XAMPP
 * database — in development only. There is deliberately no production
 * fallback: a production build without DB_HOST refuses to connect (every query
 * fails with the message below) instead of trying a passwordless root account
 * or credentials baked into the source.
 */
export function dbConfig(): DbConfig {
  if (process.env.DB_HOST) {
    return {
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT ?? 3306),
      database: process.env.DB_NAME ?? '',
      user: process.env.DB_USER ?? '',
      password: process.env.DB_PASS ?? '',
    };
  }
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'DB_HOST is not set. Configure DB_HOST, DB_PORT, DB_NAME, DB_USER and DB_PASS for this deployment (see .env.example).'
    );
  }
  return {
    host: '127.0.0.1',
    port: 3306,
    database: process.env.DB_NAME ?? 'valunxt_capital_admin',
    user: 'root',
    password: '',
  };
}

let pool: mysql.Pool | null = null;
let schemaReady: Promise<void> | null = null;

function getPool(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool({
      ...dbConfig(),
      charset: 'utf8mb4',
      waitForConnections: true,
      connectionLimit: 8,
      // DATE and DATETIME as written: a publish date must not shift a day
      // through the server's timezone on its way out of MySQL.
      dateStrings: true,
    });
    /* Every session in UTC. The imported database was written by a server in
       UTC (the dump sets time_zone +00:00), while a development machine's
       MariaDB runs in its own zone (IST here). Pinning the session makes NOW()
       and CURRENT_TIMESTAMP write UTC everywhere, so a row the panel writes and
       a row it imported mean the same instant, and lib/admin/format.ts reads
       them both as UTC. */
    pool.on('connection', (conn) => {
      conn.query("SET time_zone = '+00:00'");
    });
  }
  return pool;
}

/** Whether a column exists, for the idempotent extensions. */
async function hasColumn(p: mysql.Pool, table: string, column: string): Promise<boolean> {
  const [rows] = await p.query<mysql.RowDataPacket[]>(
    'SELECT COUNT(*) AS n FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = ? AND column_name = ?',
    [table, column]
  );
  return Number(rows[0]?.n ?? 0) > 0;
}

/**
 * Create any missing table and apply any missing extension column.
 *
 * Except on a database still waiting for the import: one that holds the tables
 * the Next.js build used before it (users, pages, enquiries…) but not the
 * imported schema. Creating the schema there would leave empty tables with the
 * dump's names, and scripts/import-valunxt-db.mjs would then have nowhere to
 * put the dump's rows with their original ids (which the posts' authors and the
 * client portal's foreign keys depend on). So the site refuses instead, and says
 * what to run.
 */
async function ensureSchema(p: mysql.Pool): Promise<void> {
  const [present] = await p.query<mysql.RowDataPacket[]>(
    `SELECT table_name AS t FROM information_schema.tables
      WHERE table_schema = DATABASE() AND table_name IN ('users', 'enquiries', 'pages', 'seo_settings', 'blog_posts', 'vx_posts')`
  );
  const names = new Set(present.map((r) => String(r.t)));
  if (names.size > 0 && !names.has('vx_posts')) {
    throw new Error(
      'This database has not been migrated to the www.valunxt.com schema yet. ' +
        'Stop the site, run `node scripts/import-valunxt-db.mjs`, then start it again.'
    );
  }
  for (const [, ddl] of SCHEMA_TABLES) await p.query(ddl);
  for (const [table, column, definition] of SCHEMA_EXTENSIONS) {
    if (!(await hasColumn(p, table, column))) {
      await p.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`);
    }
  }
}

/** The pool, with the schema guaranteed. Throws if the database is unreachable. */
export async function database(): Promise<mysql.Pool> {
  const p = getPool();
  if (!schemaReady) {
    schemaReady = ensureSchema(p).catch((e) => {
      // Let the next call retry rather than caching the failure for good.
      schemaReady = null;
      throw e;
    });
  }
  await schemaReady;
  return p;
}

/** A SELECT that always returns rows. */
export async function sql<T = mysql.RowDataPacket>(statement: string, args: unknown[] = []): Promise<T[]> {
  const p = await database();
  const [rows] = await p.query<mysql.RowDataPacket[]>(statement, args);
  return rows as T[];
}

/** An INSERT, UPDATE or DELETE. */
export async function exec(statement: string, args: unknown[] = []): Promise<mysql.ResultSetHeader> {
  const p = await database();
  const [res] = await p.query<mysql.ResultSetHeader>(statement, args);
  return res;
}

/** A LIKE pattern for a free-text term, with its wildcards escaped. */
export function likePattern(term: string): string {
  return '%' + String(term).replace(/[\\%_]/g, (c) => '\\' + c) + '%';
}

/** A row count safe to interpolate (MySQL will not take LIMIT as a placeholder everywhere). */
export function rowLimit(n: unknown, fallback = 0): number {
  const v = Math.trunc(Number(n));
  return Number.isFinite(v) && v > 0 ? v : fallback;
}

/** 'YYYY-MM-DD HH:MM:SS' in UTC, the form the panel stores its own timestamps in. */
export function utcNow(): string {
  return new Date().toISOString().slice(0, 19).replace('T', ' ');
}
