/**
 * Redirects managed in the admin panel (`vx_redirects`).
 *
 * The table came with the www.valunxt.com database, and the import added a row
 * for every address of the old site (/services/corporate-tax-uae,
 * /insights/<post>…) pointing at the page of the new site that replaced it. The
 * proxy (src/proxy.ts) consults it before anything else, so a redirect added in
 * the panel is live within seconds, with no rebuild.
 *
 * The table is read into memory and refreshed in the background every
 * REFRESH_MS: a request never waits on the database once the first load is in,
 * and if MySQL is down the site keeps serving with the last table it had (or
 * none), never an error.
 */
import 'server-only';

import { sql } from '@/lib/db';

export interface RedirectRule {
  to: string;
  code: 301 | 302 | 307 | 308;
}

const REFRESH_MS = 15_000;
/** How long the very first request waits for the table before going on without it. */
const FIRST_LOAD_WAIT_MS = 1_500;

let table = new Map<string, RedirectRule>();
let loadedAt = 0;
let loading: Promise<void> | null = null;

/**
 * The form a path is stored and looked up in: decoded, no trailing slash, no
 * ".html" (the old site served every page both with and without it). The root
 * stays "/".
 */
export function normaliseRedirectPath(raw: string): string {
  let p = String(raw ?? '').split('?')[0].split('#')[0];
  try {
    p = decodeURIComponent(p);
  } catch {
    /* keep it as it came */
  }
  if (!p.startsWith('/')) p = '/' + p;
  p = p.replace(/\.html?$/i, '').replace(/\/+$/, '');
  return p === '' ? '/' : p;
}

function validCode(code: unknown): RedirectRule['code'] {
  const n = Number(code);
  return n === 302 || n === 307 || n === 308 ? n : 301;
}

async function load(): Promise<void> {
  const rows = await sql<{ from_path: string; to_url: string; code: number }>(
    'SELECT from_path, to_url, code FROM vx_redirects WHERE active = 1'
  );
  const next = new Map<string, RedirectRule>();
  for (const r of rows) {
    const from = normaliseRedirectPath(String(r.from_path));
    const to = String(r.to_url ?? '').trim();
    if (!to) continue;
    next.set(from, { to, code: validCode(r.code) });
  }
  table = next;
  loadedAt = Date.now();
}

function refresh(): Promise<void> {
  if (!loading) {
    loading = load()
      .catch(() => {
        // Keep serving the last table; try again on the next interval.
        loadedAt = Date.now();
      })
      .finally(() => {
        loading = null;
      });
  }
  return loading;
}

/** The redirect for a request path, or null. */
export async function findRedirect(pathname: string): Promise<RedirectRule | null> {
  if (loadedAt === 0) {
    await Promise.race([refresh(), new Promise((r) => setTimeout(r, FIRST_LOAD_WAIT_MS))]);
  } else if (Date.now() - loadedAt > REFRESH_MS) {
    void refresh();
  }
  const rule = table.get(normaliseRedirectPath(pathname));
  if (!rule) return null;
  // Never answer a path with itself.
  const target = rule.to.startsWith('/') ? normaliseRedirectPath(rule.to) : null;
  if (target !== null && target === normaliseRedirectPath(pathname)) return null;
  return rule;
}
