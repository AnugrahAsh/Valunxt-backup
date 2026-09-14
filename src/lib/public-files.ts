/**
 * "Does this file exist under /public?" without shipping /public inside the
 * server functions.
 *
 * Production reads src/data/public-manifest.json, written by
 * scripts/build-public-manifest.mjs before every build; next.config.ts excludes
 * /public from output file tracing, because Vercel serves those files statically
 * and bundling them pushed every function past the 250 MB limit. Development
 * checks the disk, so a file dropped in while `next dev` runs is picked up at
 * once.
 *
 * Server only.
 */
import fs from 'node:fs';
import path from 'node:path';

import MANIFEST from '@/data/public-manifest.json';

const FILES = new Set<string>(MANIFEST as string[]);
const DEV = process.env.NODE_ENV === 'development';

/** `rel` is relative to /public, with or without a leading slash. */
export function publicFileExists(rel: string): boolean {
  const clean = String(rel ?? '').replace(/^\/+/, '').split('?')[0];
  if (!clean) return false;
  if (DEV) {
    try {
      return fs.existsSync(path.join(process.cwd(), 'public', clean));
    } catch {
      return false;
    }
  }
  return FILES.has(clean);
}

/** Files directly inside a /public folder (relative path, no leading slash). */
export function publicFilesIn(dir: string): string[] {
  const prefix = String(dir ?? '').replace(/^\/+|\/+$/g, '') + '/';
  if (DEV) {
    try {
      return fs
        .readdirSync(path.join(process.cwd(), 'public', prefix))
        .map((f) => prefix + f)
        .filter((f) => fs.statSync(path.join(process.cwd(), 'public', f)).isFile());
    } catch {
      return [];
    }
  }
  return [...FILES].filter((f) => f.startsWith(prefix) && !f.slice(prefix.length).includes('/'));
}
