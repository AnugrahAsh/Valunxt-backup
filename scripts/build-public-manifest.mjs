/**
 * Writes src/data/public-manifest.json: every file under /public, as a sorted
 * list of paths relative to it ("assets/content/uploads/uae/home/x.webp").
 *
 * WHY. The image helpers (lib/region-assets.ts, lib/uae-page-images.ts) pick
 * the first candidate file that exists. Checking the disk at request time made
 * Next's file tracing copy the whole of /public (237 MB) into every server
 * function, which is over Vercel's 250 MB function limit, so deploys failed
 * after a successful build. In production the helpers read this list instead,
 * and next.config.ts excludes /public from tracing; Vercel still serves /public
 * as static files. Development keeps checking the disk live.
 *
 * Runs before `next build` (prebuild) and before `next dev` (predev).
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const PUBLIC_DIR = path.join(ROOT, 'public');
const OUT = path.join(ROOT, 'src', 'data', 'public-manifest.json');

const files = [];
(function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.isFile()) files.push(path.relative(PUBLIC_DIR, full).split(path.sep).join('/'));
  }
})(PUBLIC_DIR);
files.sort();

const next = JSON.stringify(files, null, 0) + '\n';
const prev = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8') : '';
if (prev !== next) fs.writeFileSync(OUT, next);
console.log(`public manifest: ${files.length} files${prev === next ? ' (unchanged)' : ''}`);
