/**
 * Import the live www.valunxt.com database and make it the project's database.
 *
 *   node scripts/import-valunxt-db.mjs [dump.sql] [--database=name] [--dry-run]
 *
 * The dump defaults to data/imports/valunxt-2026-09-16.sql (the phpMyAdmin
 * export of the live site's database). Connection settings come from DB_HOST /
 * DB_PORT / DB_NAME / DB_USER / DB_PASS — read from .env.local when the shell
 * does not set them, as the site itself does — falling back to local XAMPP
 * (root, no password, valunxt_capital_admin), the development fallback
 * src/lib/db.ts uses.
 *
 * Six phases, each safe to run again:
 *
 *   1. IMPORT      Every table, column, key, index, foreign key and row of the
 *                  dump. Skipped when the dump's tables are already present;
 *                  refused when only some are, so a half-import is never
 *                  silently completed. Row counts are checked against the dump.
 *   2. EXTEND      The additive columns in src/lib/admin/schema.ts, so the
 *                  imported tables can hold what the project's own tables held.
 *   3. CONSOLIDATE The tables the Next.js build created before the import are
 *                  folded into their imported equivalents and retired:
 *                    users        -> vx_users
 *                    seo_settings -> vx_settings
 *                    enquiries    -> vx_leads
 *                    blog_posts   -> vx_posts (+ vx_authors)
 *                    pages        -> vx_page_seo
 *                  A table is dropped only after every one of its rows is found
 *                  in the destination.
 *   4. URLS        Own-domain references move to https://valunxt.com and to the
 *                  new site's routes (www.valunxt.com/insights/x ->
 *                  valunxt.com/en-ae/blogs/x/). Third-party URLs are untouched,
 *                  and so are historical logs (analytics referrers, lead
 *                  messages, the old sitemap snapshot).
 *   5. REDIRECTS   The old site's addresses become vx_redirects rows, so links
 *                  and search results pointing at them land on the new pages.
 *   6. REPORT      Counts before and after, written to data/imports/.
 *
 * Take a backup first (mysqldump); phase 3 drops tables.
 */
import fs from 'node:fs';
import path from 'node:path';
import mysql from 'mysql2/promise';

const argv = process.argv.slice(2);
const flag = (name) => argv.find((a) => a.startsWith(`--${name}=`))?.split('=').slice(1).join('=');
const DUMP = argv.find((a) => !a.startsWith('--')) ?? 'data/imports/valunxt-2026-09-16.sql';
const DRY = argv.includes('--dry-run');

// The site's own settings, so the script imports into the database the site
// reads. Variables already set in the shell win.
for (const file of ['.env.local', '.env']) {
  if (fs.existsSync(file) && typeof process.loadEnvFile === 'function') {
    process.loadEnvFile(file);
  }
}

const cfg = process.env.DB_HOST
  ? {
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT ?? 3306),
      database: flag('database') ?? process.env.DB_NAME ?? '',
      user: process.env.DB_USER ?? '',
      password: process.env.DB_PASS ?? '',
    }
  : {
      host: '127.0.0.1',
      port: 3306,
      database: flag('database') ?? 'valunxt_capital_admin',
      user: 'root',
      password: '',
    };

const SITE = 'https://valunxt.com';
const report = { started: new Date().toISOString(), database: cfg.database, dump: DUMP, phases: {} };
const log = (...a) => console.log(...a);

/* ---------------------------------------------------------------------------
 * The old site's URL structure, mapped onto the new one.
 *
 * www.valunxt.com was the UAE accounting site, so its pages land in the UAE
 * edition. Pages both editions publish (about, contact…) are marked `shared`:
 * a redirect sends those to the unprefixed address so the region gateway
 * (src/proxy.ts) still picks the visitor's market, while a link inside UAE
 * article copy points straight at /en-ae/.
 * ------------------------------------------------------------------------ */

const AT = 'accounting-tax-services';
const VA = 'valuation-and-advisory';
const RI = 'research-intelligence';
const TD = 'technology-data-ai';
const MS = 'mortgages-services';
const RE = 'real-estate-transactions';

/** Old /services/<slug> -> new /en-ae/services/<path>/ ('' = the services index). */
const SERVICE_MAP = {
  'accounting-and-bookkeeping': `${AT}/accounting-bookkeeping`,
  'accounting-bookkeeping': `${AT}/accounting-bookkeeping`,
  'accounting-bookkeeping-outsourcing': `${AT}/accounting-bookkeeping`,
  'accounting-services-dubai': AT,
  'accounting-supervision': `${AT}/accounting-bookkeeping`,
  'bookkeeping-services': `${AT}/accounting-bookkeeping`,
  'bookkeeping-services-dubai': `${AT}/accounting-bookkeeping`,
  'budgeting-forecasting': `${AT}/budgeting-forecasting`,
  'business-advisory': VA,
  'business-setup-services': AT,
  'business-valuation': `${VA}/business-valuation`,
  'buy-side-advisory': VA,
  'capital-markets': VA,
  'cloud-transformation': `${TD}/enterprise-solutions`,
  consulting: '',
  'corporate-loan-advisory': `${MS}/commercial-mortgages`,
  'corporate-tax-advisory': `${AT}/corporate-tax-services`,
  'corporate-tax-audit-support': `${AT}/corporate-tax-services`,
  'corporate-tax-deregistration': `${AT}/corporate-tax-services`,
  'corporate-tax-impact-assessment': `${AT}/corporate-tax-services`,
  'corporate-tax-registration': `${AT}/corporate-tax-services`,
  'corporate-tax-return-filing': `${AT}/corporate-tax-services`,
  'corporate-tax-services-uae': `${AT}/corporate-tax-services`,
  'corporate-tax-uae': `${AT}/corporate-tax-services`,
  'debt-financing': MS,
  'digital-customer-transformation': TD,
  'digital-marketing': TD,
  'enterprise-solutions': `${TD}/enterprise-solutions`,
  'equity-financing': VA,
  'external-audit-support': `${AT}/external-audit-support`,
  'feasibility-study': `${RI}/feasibility-studies`,
  'financial-accounting-advisory': AT,
  'financial-reporting': `${AT}/financial-reporting`,
  'financial-statement-preparation-review': `${AT}/financial-reporting`,
  'highest-best-use': `${RI}/real-estate-research`,
  'international-tax-services': `${AT}/corporate-tax-services`,
  'leasing-advisory': `${RE}/sell-rent-lease-property`,
  'management-reporting': `${AT}/management-reporting`,
  'mergers-acquisitions': VA,
  'mortgage-loan-advisory': MS,
  'part-time-cfo-services': `${AT}/cfo-services`,
  'plant-machinery-valuation': `${VA}/plant-machinery-valuation`,
  'property-valuation': `${VA}/property-valuation`,
  'real-estate-market-research': `${RI}/real-estate-research`,
  'sell-side-advisory': VA,
  'tax-advisory': AT,
  'tax-residency-certificate': AT,
  'technology-consulting': `${TD}/technology-consulting`,
  'transaction-advisory': VA,
  'transfer-pricing-benchmarking-analysis': `${AT}/corporate-tax-services`,
  'transfer-pricing-impact-assessment': `${AT}/corporate-tax-services`,
  'transfer-pricing-intercompany-agreements': `${AT}/corporate-tax-services`,
  'transfer-pricing-valuation': `${AT}/corporate-tax-services`,
  'valuation-advisory': VA,
  'vat-advisory': `${AT}/vat-services`,
  'vat-deregistration': `${AT}/vat-services`,
  'vat-health-check': `${AT}/vat-services`,
  'vat-reconsideration-services': `${AT}/vat-services`,
  'vat-registration': `${AT}/vat-services`,
  'vat-voluntary-disclosure': `${AT}/vat-services`,
};

/** Old top-level pages -> [new path inside a market, published by both markets?] */
const PAGE_MAP = {
  '/': ['/', true],
  '/index': ['/', true],
  '/about': ['/about/', true],
  '/careers': ['/about/careers/', true],
  '/consult': ['/free-consultation/', true],
  '/contact': ['/contact/', true],
  '/faq': ['/faq/', true],
  '/industries': ['/industries/', true],
  '/testimonials': ['/clients/', true],
  '/insights': ['/blogs/', true],
  '/services': ['/services/', true],
  '/lp-sbr': [`/services/${AT}/corporate-tax-services/`, false],
  '/accounting': [`/services/${AT}/`, false],
  '/lp-accounting': [`/services/${AT}/`, false],
};

/** A path of the new site already (market-prefixed, or an asset). */
function isNewPath(p) {
  return /^\/(en-in|en-ae|assets|images)(\/|$)/.test(p);
}

/**
 * Map an old-site path. Returns { market: '/en-ae/…', shared } for a page the new
 * site replaced, or null when the path is not an old page (an image, a new-site
 * path, anything unknown).
 */
function mapOldPath(rawPath) {
  let p = String(rawPath || '/').split('#')[0].split('?')[0];
  if (isNewPath(p)) return null;
  p = p.replace(/\.html$/i, '').replace(/\/+$/, '') || '/';

  if (PAGE_MAP[p]) {
    const [inner, shared] = PAGE_MAP[p];
    return { market: `/en-ae${inner}`, inner, shared };
  }
  let m = /^\/insights\/([a-z0-9-]+)$/i.exec(p);
  if (m) return { market: `/en-ae/blogs/${m[1]}/`, inner: `/blogs/${m[1]}/`, shared: false };
  m = /^\/industry\/[a-z0-9-]+$/i.exec(p);
  if (m) return { market: '/en-ae/industries/', inner: '/industries/', shared: true };
  m = /^\/services\/([a-z0-9-]+)$/i.exec(p);
  if (m && Object.prototype.hasOwnProperty.call(SERVICE_MAP, m[1])) {
    const target = SERVICE_MAP[m[1]];
    if (target === '') return { market: '/en-ae/services/', inner: '/services/', shared: true };
    return { market: `/en-ae/services/${target}/`, inner: `/services/${target}/`, shared: false };
  }
  return null;
}

/**
 * Rewrite every own-domain URL in a piece of text.
 *
 * `mode` 'absolute' keeps a full https://valunxt.com URL (canonical tags,
 * structured data); 'relative' leaves a root-relative path (links inside
 * article copy, which must work on every host the site runs on). JSON that
 * escapes its slashes (https:\/\/…) keeps its escaping.
 */
function rewriteOwnUrls(text, mode) {
  if (text === null || text === undefined) return { text, changes: 0 };
  let changes = 0;
  const re = /https?:(\\?\/){2}(?:www\.)?valunxt\.com((?:\\\/|[^\s"'<>)\\])*)/gi;
  const out = String(text).replace(re, (whole, slash, rest) => {
    const escaped = slash === '\\/';
    const plain = (rest || '').replace(/\\\//g, '/');
    const hashAt = plain.search(/[?#]/);
    const pathname = hashAt === -1 ? plain : plain.slice(0, hashAt);
    const suffix = hashAt === -1 ? '' : plain.slice(hashAt);
    const mapped = mapOldPath(pathname || '/');
    const newPath = mapped ? mapped.market : pathname || '/';
    let replacement = mode === 'relative' ? newPath + suffix : SITE + newPath + suffix;
    if (escaped) replacement = replacement.replace(/\//g, '\\/');
    if (replacement !== whole) changes++;
    return replacement;
  });
  return { text: out, changes };
}

/* ---------------------------------------------------------------------------
 * Helpers
 * ------------------------------------------------------------------------ */

/** Rows per table in a phpMyAdmin dump: one tuple per line inside each INSERT. */
function countDumpRows(sql) {
  const counts = {};
  let table = null;
  for (const line of sql.split(/\r?\n/)) {
    const ins = /^INSERT INTO `([^`]+)`/.exec(line);
    if (ins) {
      table = ins[1];
      counts[table] ??= 0;
      continue;
    }
    if (table && line.startsWith('(')) {
      counts[table]++;
      if (/\);\s*$/.test(line)) table = null;
    } else if (table && !line.startsWith('(')) {
      table = null;
    }
  }
  for (const m of sql.matchAll(/^CREATE TABLE `([^`]+)`/gm)) counts[m[1]] ??= 0;
  return counts;
}

function words(html) {
  return String(html ?? '')
    .replace(/<[^>]*>/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length;
}

function slugify(s) {
  return String(s)
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** The score the old panel gave a lead, approximated from what it had to go on. */
function leadScore({ name, phone, company, message, service }) {
  let s = 50;
  if (String(name ?? '').trim()) s += 5;
  if (String(phone ?? '').trim()) s += 10;
  if (String(company ?? '').trim()) s += 10;
  if (String(service ?? '').trim() && !/general|newsletter/i.test(service)) s += 5;
  if (String(message ?? '').trim().length >= 30) s += 15;
  return Math.min(100, s);
}

/* ---------------------------------------------------------------------------
 * Run
 * ------------------------------------------------------------------------ */

const conn = await mysql.createConnection({ ...cfg, charset: 'utf8mb4', multipleStatements: true, dateStrings: true });
log(`Connected to ${cfg.host}/${cfg.database}${DRY ? ' (dry run: nothing is written)' : ''}`);

const tables = async () =>
  new Set((await conn.query('SHOW TABLES'))[0].map((r) => String(Object.values(r)[0])));
const count = async (t) => Number((await conn.query(`SELECT COUNT(*) AS n FROM \`${t}\``))[0][0].n);
const columns = async (t) =>
  new Set(
    (await conn.query('SELECT column_name AS c FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = ?', [t]))[0].map(
      (r) => String(r.c)
    )
  );
const write = async (sql, args = []) => (DRY ? [{ affectedRows: 0, insertId: 0 }] : conn.query(sql, args));

/* ---- 1. IMPORT ---------------------------------------------------------- */

const dumpText = fs.readFileSync(DUMP, 'utf8');
const expected = countDumpRows(dumpText);
const dumpTables = Object.keys(expected);
const MARKER = 'valunxt_dump_import';
const dumpHash = (await import('node:crypto')).createHash('sha1').update(dumpText).digest('hex');
{
  const have = await tables();
  const present = dumpTables.filter((t) => have.has(t));
  const phase = { tables: dumpTables.length, expectedRows: expected };

  let marked = false;
  if (have.has('vx_settings')) {
    const [[m]] = await conn.query('SELECT COUNT(*) AS n FROM vx_settings WHERE k = ?', [MARKER]);
    marked = Number(m.n) > 0;
  }
  /* Tables present without the marker are either an import this script ran
     before it wrote markers (every table holds at least the dump's rows), or
     empty tables something else created — the running site, bootstrapping its
     schema. Only the first is safe to treat as imported. */
  let complete = present.length === dumpTables.length;
  if (complete && !marked) {
    for (const t of dumpTables) {
      if ((await count(t)) < expected[t]) {
        complete = false;
        break;
      }
    }
  }

  if (present.length === dumpTables.length && (marked || complete)) {
    log(`1. IMPORT: already imported${marked ? '' : ' (every table holds the dump’s rows)'}, skipping.`);
    phase.skipped = true;
    if (!marked && !DRY) {
      await conn.query('INSERT INTO vx_settings (k, v) VALUES (?, ?) ON DUPLICATE KEY UPDATE v = VALUES(v)', [
        MARKER,
        JSON.stringify({ dump: path.basename(DUMP), sha1: dumpHash, marked: new Date().toISOString() }),
      ]);
    }
  } else if (present.length > 0) {
    throw new Error(
      `1. IMPORT: ${present.length} of ${dumpTables.length} dump tables already exist without the dump's data ` +
        `(${present.slice(0, 6).join(', ')}${present.length > 6 ? '…' : ''}). This happens when the site was running ` +
        'on the new code before the import and created its schema. Stop the site, restore the pre-import backup ' +
        '(or drop those tables if they are empty), and run this script again.'
    );
  } else {
    const [[uca]] = await conn.query("SELECT COUNT(*) AS n FROM information_schema.collations WHERE collation_name = 'utf8mb4_uca1400_ai_ci'");
    let sql = dumpText;
    if (Number(uca.n) === 0) {
      sql = sql.replaceAll('utf8mb4_uca1400_ai_ci', 'utf8mb4_unicode_ci');
      phase.collation = 'utf8mb4_uca1400_ai_ci mapped to utf8mb4_unicode_ci (not supported by this server)';
    }
    log(`1. IMPORT: ${dumpTables.length} tables from ${DUMP}${phase.collation ? ' (' + phase.collation + ')' : ''}`);
    if (!DRY) await conn.query(sql);
    phase.imported = true;
  }

  if (!DRY) {
    const mismatches = [];
    phase.actualRows = {};
    for (const t of dumpTables) {
      const n = await count(t);
      phase.actualRows[t] = n;
      if (!phase.skipped && n !== expected[t]) mismatches.push(`${t}: expected ${expected[t]}, found ${n}`);
    }
    if (mismatches.length) throw new Error('1. IMPORT: row counts do not match the dump:\n  ' + mismatches.join('\n  '));
    // Marked only once every count is confirmed: the marker is what a later run trusts.
    if (phase.imported) {
      await conn.query('INSERT INTO vx_settings (k, v) VALUES (?, ?) ON DUPLICATE KEY UPDATE v = VALUES(v)', [
        MARKER,
        JSON.stringify({ dump: path.basename(DUMP), sha1: dumpHash, imported: new Date().toISOString() }),
      ]);
    }
    const total = Object.values(phase.actualRows).reduce((a, b) => a + b, 0);
    log(`   ${total} rows across ${dumpTables.length} tables${phase.skipped ? '' : ', every count matches the dump'}.`);
  }
  report.phases.import = phase;
}

/* ---- 2. EXTEND ---------------------------------------------------------- */

const EXTENSIONS = [
  ['vx_page_seo', 'title', "varchar(200) NOT NULL DEFAULT ''"],
  ['vx_page_seo', 'file_path', "varchar(255) NOT NULL DEFAULT ''"],
  ['vx_page_seo', 'keywords', 'varchar(500) DEFAULT NULL'],
  ['vx_page_seo', 'status', "varchar(20) NOT NULL DEFAULT 'published'"],
  ['vx_page_seo', 'in_sitemap', 'tinyint(1) NOT NULL DEFAULT 1'],
  ['vx_page_seo', 'priority', 'decimal(2,1) NOT NULL DEFAULT 0.5'],
  ['vx_page_seo', 'changefreq', "varchar(20) NOT NULL DEFAULT 'monthly'"],
  ['vx_page_seo', 'is_cms', 'tinyint(1) NOT NULL DEFAULT 0'],
  ['vx_page_seo', 'hero_image', "varchar(255) NOT NULL DEFAULT ''"],
  ['vx_page_seo', 'created_at', 'datetime DEFAULT NULL'],
  ['vx_posts', 'author_role', 'varchar(160) DEFAULT NULL'],
  ['vx_leads', 'source', 'varchar(80) DEFAULT NULL'],
  ['vx_users', 'created_at', 'datetime DEFAULT NULL'],
];
{
  const added = [];
  for (const [t, c, def] of EXTENSIONS) {
    if ((await columns(t)).has(c)) continue;
    await write(`ALTER TABLE \`${t}\` ADD COLUMN \`${c}\` ${def}`);
    added.push(`${t}.${c}`);
  }
  log(`2. EXTEND: ${added.length ? 'added ' + added.join(', ') : 'all extension columns already present'}.`);
  report.phases.extend = { added };
}

/* ---- 3. CONSOLIDATE ----------------------------------------------------- */

const consolidated = {};
const have = await tables();

/*
 * The retired tables' timestamps, moved to UTC. The Next.js build that wrote
 * them never set a session time zone, so NOW() and CURRENT_TIMESTAMP wrote the
 * server's own zone (IST on the XAMPP machines, UTC on a UTC host), while the
 * imported schema and the site keep UTC throughout (src/lib/db.ts). Those
 * sessions ran in the server's default zone, @@global.time_zone — not this
 * session's, which the dump's own `SET time_zone = "+00:00"` has already moved.
 * Converting from the default is exact, and a no-op on a server in UTC. A named
 * zone the server cannot resolve would turn every value into NULL, so that
 * case copies the values unchanged and says so.
 */
const [[zoneProbe]] = await conn.query(
  "SELECT @@global.time_zone AS zone, CONVERT_TZ('2026-01-01 12:00:00', @@global.time_zone, '+00:00') AS probe"
);
const convertZone = zoneProbe.probe !== null;
if (!convertZone) log(`   ! time zone ${zoneProbe.zone} cannot be converted here: retired tables' timestamps are copied as stored`);

/** A retired table's rows, with every DATETIME/TIMESTAMP column in UTC. */
async function rowsInUtc(table) {
  const [cols] = await conn.query(
    'SELECT column_name AS c, data_type AS t FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = ? ORDER BY ordinal_position',
    [table]
  );
  const list = cols.map(({ c, t }) =>
    convertZone && ['datetime', 'timestamp'].includes(String(t).toLowerCase())
      ? `CONVERT_TZ(\`${c}\`, @@global.time_zone, '+00:00') AS \`${c}\``
      : `\`${c}\``
  );
  const [rows] = await conn.query(`SELECT ${list.join(', ')} FROM \`${table}\` ORDER BY id`);
  return rows;
}

/** Drop a retired table once `verify` confirms every row reached its destination. */
async function retire(table, verify) {
  const missing = await verify();
  if (missing.length) {
    throw new Error(`3. CONSOLIDATE: ${table} not retired, ${missing.length} row(s) missing from the destination: ${missing.slice(0, 5).join(', ')}`);
  }
  await write(`DROP TABLE \`${table}\``);
}

if (have.has('users')) {
  const rows = await rowsInUtc('users');
  let moved = 0;
  for (const u of rows) {
    const [[hit]] = await conn.query('SELECT COUNT(*) AS n FROM vx_users WHERE email = ?', [u.email]);
    if (Number(hit.n)) continue;
    await write('INSERT INTO vx_users (email, pass_hash, name, role, last_login, created_at) VALUES (?, ?, ?, ?, ?, ?)', [
      u.email,
      u.password_hash,
      u.name,
      u.role || 'admin',
      u.last_login_at,
      u.created_at,
    ]);
    moved++;
  }
  if (!DRY)
    await retire('users', async () => {
      const miss = [];
      for (const u of rows) {
        const [[hit]] = await conn.query('SELECT COUNT(*) AS n FROM vx_users WHERE email = ?', [u.email]);
        if (!Number(hit.n)) miss.push(u.email);
      }
      return miss;
    });
  consolidated.users = { source: rows.length, inserted: moved, into: 'vx_users' };
}

if (have.has('seo_settings')) {
  const [rows] = await conn.query('SELECT k, v FROM seo_settings');
  const RENAME = { sitemap_generated_at: 'sitemap_last_generated' };
  let moved = 0;
  for (const { k, v } of rows) {
    const key = RENAME[k] ?? k;
    const [[cur]] = await conn.query('SELECT COUNT(*) AS n, MAX(v) AS v FROM vx_settings WHERE k = ?', [key]);
    if (Number(cur.n) === 0) {
      await write('INSERT INTO vx_settings (k, v) VALUES (?, ?)', [key, v]);
      moved++;
    } else if (key === 'sitemap_last_generated' && String(v) > String(cur.v)) {
      // Both builds stamped a generation; the later one is the sitemap on disk.
      await write('UPDATE vx_settings SET v = ? WHERE k = ?', [v, key]);
      moved++;
    }
  }
  if (!DRY)
    await retire('seo_settings', async () => {
      const miss = [];
      for (const { k } of rows) {
        const [[hit]] = await conn.query('SELECT COUNT(*) AS n FROM vx_settings WHERE k = ?', [RENAME[k] ?? k]);
        if (!Number(hit.n)) miss.push(k);
      }
      return miss;
    });
  consolidated.seo_settings = { source: rows.length, written: moved, into: 'vx_settings', renamed: RENAME };
}

if (have.has('enquiries')) {
  const rows = await rowsInUtc('enquiries');
  let moved = 0;
  const pathOf = (u) => {
    try {
      return new URL(u).pathname.slice(0, 255);
    } catch {
      return String(u ?? '').slice(0, 255);
    }
  };
  for (const e of rows) {
    const [[hit]] = await conn.query('SELECT COUNT(*) AS n FROM vx_leads WHERE email = ? AND created_at = ?', [e.email, e.created_at]);
    if (Number(hit.n)) continue;
    await write(
      `INSERT INTO vx_leads (name, email, phone, company, service, message, page, ip, country, ua, status, score, source, created_at, updated_at)
       VALUES (?, ?, ?, ?, NULL, NULL, ?, ?, NULL, NULL, 'new', ?, ?, ?, ?)`,
      [
        e.full_name,
        e.email,
        e.phone || null,
        e.company || null,
        pathOf(e.page_url),
        e.ip || null,
        leadScore({ name: e.full_name, phone: e.phone, company: e.company }),
        e.source || 'Website',
        e.created_at,
        e.created_at,
      ]
    );
    moved++;
  }
  if (!DRY)
    await retire('enquiries', async () => {
      const miss = [];
      for (const e of rows) {
        const [[hit]] = await conn.query('SELECT COUNT(*) AS n FROM vx_leads WHERE email = ? AND created_at = ?', [e.email, e.created_at]);
        if (!Number(hit.n)) miss.push(`#${e.id}`);
      }
      return miss;
    });
  consolidated.enquiries = { source: rows.length, inserted: moved, into: 'vx_leads' };
}

if (have.has('blog_posts')) {
  const rows = await rowsInUtc('blog_posts');
  let moved = 0;
  const authorIds = {};
  for (const p of rows) {
    const authorName = String(p.author || '').trim() || 'Valunxt Research Team';
    if (!authorIds[authorName]) {
      const slug = slugify(authorName);
      const [[found]] = await conn.query('SELECT id FROM vx_authors WHERE slug = ? LIMIT 1', [slug]);
      if (found) authorIds[authorName] = found.id;
      else {
        const [res] = await write('INSERT INTO vx_authors (name, slug, title) VALUES (?, ?, ?)', [
          authorName,
          slug,
          'Insights & Analysis Desk',
        ]);
        authorIds[authorName] = res.insertId;
      }
    }
    const [[hit]] = await conn.query('SELECT COUNT(*) AS n FROM vx_posts WHERE slug = ?', [p.slug]);
    if (Number(hit.n)) continue;
    await write(
      `INSERT INTO vx_posts
         (slug, title, excerpt, body_html, cover, cover_alt, cat, tags, status, in_sitemap, featured, seo_score,
          meta_title, meta_desc, keywords, focus_kw, schema_type, faq_json, schema_jsonld, og_image, og_title, og_desc,
          tw_card, tw_title, tw_desc, tw_image, canonical, robots, author, author_id, author_role, read_mins,
          created_at, updated_at, published_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NULL, ?, ?, ?, 0, ?, ?, ?, NULL, 'BlogPosting', NULL, NULL, ?, NULL, NULL,
               'summary_large_image', NULL, NULL, NULL, NULL, 'index, follow', ?, ?, ?, ?, ?, ?, ?)`,
      [
        p.slug,
        p.title,
        p.excerpt,
        p.body,
        p.cover_image || null,
        p.cover_alt || null,
        p.category || 'Insights',
        p.status === 'published' ? 'published' : 'draft',
        p.in_sitemap ? 1 : 0,
        p.featured ? 1 : 0,
        p.meta_title || null,
        String(p.meta_description ?? '').slice(0, 320) || null,
        p.meta_keywords || null,
        p.og_image || null,
        authorName,
        authorIds[authorName] || null,
        p.author_role || null,
        Math.max(1, Math.min(255, Math.round(words(p.body) / 200))),
        p.created_at,
        p.updated_at,
        p.published_at ? `${String(p.published_at).slice(0, 10)} 09:00:00` : null,
      ]
    );
    moved++;
  }
  if (!DRY)
    await retire('blog_posts', async () => {
      const miss = [];
      for (const p of rows) {
        const [[hit]] = await conn.query('SELECT COUNT(*) AS n FROM vx_posts WHERE slug = ?', [p.slug]);
        if (!Number(hit.n)) miss.push(p.slug);
      }
      return miss;
    });
  consolidated.blog_posts = { source: rows.length, inserted: moved, into: 'vx_posts', authors: authorIds };
}

if (have.has('pages')) {
  const rows = await rowsInUtc('pages');
  let moved = 0;
  const empty = (v) => (v === null || v === undefined || String(v).trim() === '' ? null : v);
  for (const p of rows) {
    const [[hit]] = await conn.query('SELECT COUNT(*) AS n FROM vx_page_seo WHERE rel_path = ?', [p.slug]);
    if (Number(hit.n)) continue;
    await write(
      `INSERT INTO vx_page_seo
         (rel_path, title, file_path, meta_title, meta_desc, canonical, keywords, robots, og_title, og_desc,
          status, in_sitemap, priority, changefreq, is_cms, hero_image, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        p.slug,
        p.title,
        p.file_path,
        empty(p.meta_title),
        empty(String(p.meta_description ?? '').slice(0, 320)),
        empty(p.canonical_url),
        empty(p.meta_keywords),
        p.robots_meta || 'index, follow',
        empty(p.og_title),
        empty(String(p.og_description ?? '').slice(0, 320)),
        p.status,
        p.in_sitemap,
        p.priority,
        p.changefreq,
        p.is_cms,
        p.hero_image,
        p.created_at,
        p.updated_at,
      ]
    );
    moved++;
  }
  if (!DRY)
    await retire('pages', async () => {
      const miss = [];
      for (const p of rows) {
        const [[hit]] = await conn.query('SELECT COUNT(*) AS n FROM vx_page_seo WHERE rel_path = ?', [p.slug]);
        if (!Number(hit.n)) miss.push(p.slug || '(home)');
      }
      return miss;
    });
  consolidated.pages = { source: rows.length, inserted: moved, into: 'vx_page_seo' };
}

log(
  `3. CONSOLIDATE: ${
    Object.keys(consolidated).length
      ? Object.entries(consolidated)
          .map(([t, r]) => `${t} (${r.source}) -> ${r.into}`)
          .join('; ')
      : 'nothing to fold in, the project tables are already retired'
  }.`
);
report.phases.consolidate = consolidated;

/* ---- 4. URLS ------------------------------------------------------------ */

const URL_COLUMNS = [
  ['vx_posts', 'id', 'body_html', 'relative'],
  ['vx_posts', 'id', 'schema_jsonld', 'absolute'],
  ['vx_posts', 'id', 'faq_json', 'relative'],
  ['vx_posts', 'id', 'canonical', 'absolute'],
  ['vx_posts', 'id', 'og_image', 'absolute'],
  ['vx_posts', 'id', 'tw_image', 'absolute'],
  ['vx_page_seo', 'id', 'canonical', 'absolute'],
  ['vx_page_seo', 'id', 'og_image', 'absolute'],
  ['vx_page_seo', 'id', 'tw_image', 'absolute'],
  ['vx_page_seo', 'id', 'schema_jsonld', 'absolute'],
  ['vx_page_seo', 'id', 'faq_json', 'relative'],
];
{
  const phase = {};
  /* A moved link is not an edit: a column with ON UPDATE CURRENT_TIMESTAMP is
     named in the UPDATE with its own value, so a post keeps the "last updated"
     date its article schema and sitemap entry report. */
  const [autoCols] = await conn.query(
    "SELECT table_name AS t, column_name AS c FROM information_schema.columns WHERE table_schema = DATABASE() AND extra LIKE '%on update%'"
  );
  const keepStamps = (table) =>
    autoCols
      .filter((a) => a.t === table)
      .map((a) => `, \`${a.c}\` = \`${a.c}\``)
      .join('');
  for (const [t, pk, col, mode] of URL_COLUMNS) {
    const [rows] = await conn.query(`SELECT \`${pk}\` AS id, \`${col}\` AS v FROM \`${t}\` WHERE \`${col}\` REGEXP 'valunxt[.]com'`);
    let changes = 0;
    let rowsChanged = 0;
    for (const r of rows) {
      const res = rewriteOwnUrls(r.v, mode);
      if (res.changes && res.text !== r.v) {
        await write(`UPDATE \`${t}\` SET \`${col}\` = ?${keepStamps(t)} WHERE \`${pk}\` = ?`, [res.text, r.id]);
        changes += res.changes;
        rowsChanged++;
      }
    }
    if (changes) phase[`${t}.${col}`] = { urls: changes, rows: rowsChanged };
  }
  const total = Object.values(phase).reduce((a, b) => a + b.urls, 0);
  log(`4. URLS: ${total ? total + ' own-domain URLs moved to ' + SITE + ' and the new routes' : 'nothing left to rewrite'}.`);
  for (const [k, v] of Object.entries(phase)) log(`   ${k}: ${v.urls} in ${v.rows} row(s)`);
  report.phases.urls = phase;
}

/* ---- 5. REDIRECTS ------------------------------------------------------- */
{
  const phase = { retargeted: [], added: [] };

  // The imported rows pointed at the old site's slugs, which the new site does not have.
  const [existing] = await conn.query('SELECT id, from_path, to_url FROM vx_redirects');
  for (const r of existing) {
    if (/^https?:\/\//i.test(r.to_url) && !/valunxt\.com/i.test(r.to_url)) continue;
    const toPath = r.to_url.replace(/^https?:\/\/(www\.)?valunxt\.com/i, '') || '/';
    const mapped = mapOldPath(toPath);
    if (!mapped) continue;
    const target = mapped.shared ? mapped.inner : mapped.market;
    if (target === r.to_url) continue;
    await write('UPDATE vx_redirects SET to_url = ? WHERE id = ?', [target, r.id]);
    phase.retargeted.push(`${r.from_path}: ${r.to_url} -> ${target}`);
  }

  // Every address in the old sitemap, plus the two landing pages the old analytics saw.
  const [olds] = await conn.query('SELECT url FROM vx_sitemap_urls');
  const oldPaths = new Set(['/accounting', '/lp-accounting']);
  for (const { url } of olds) {
    try {
      const u = new URL(url);
      if (/(^|\.)valunxt\.com$/i.test(u.hostname)) oldPaths.add(u.pathname.replace(/\/+$/, '') || '/');
    } catch {
      /* not a URL */
    }
  }
  const [[{ n: before }]] = await conn.query('SELECT COUNT(*) AS n FROM vx_redirects');
  for (const from of [...oldPaths].sort()) {
    const mapped = mapOldPath(from);
    // A page both editions publish needs no row: the gateway already forwards
    // /about to /<market>/about/. Only an address the new site does not have does.
    if (!mapped || (mapped.shared && mapped.inner.replace(/\/+$/, '') === from.replace(/\/+$/, ''))) continue;
    if (from === '/' || from === '') continue;
    const target = mapped.shared ? mapped.inner : mapped.market;
    const [res] = await write(
      "INSERT IGNORE INTO vx_redirects (from_path, to_url, code, active, note) VALUES (?, ?, 301, 1, 'www.valunxt.com migration')",
      [from, target]
    );
    if (DRY || res.affectedRows) phase.added.push(`${from} -> ${target}`);
  }
  const [[{ n: after }]] = await conn.query('SELECT COUNT(*) AS n FROM vx_redirects');
  log(`5. REDIRECTS: ${phase.retargeted.length} imported row(s) retargeted, ${phase.added.length} added (${before} -> ${after} rows).`);
  report.phases.redirects = phase;
}

/* ---- 6. REPORT ---------------------------------------------------------- */
{
  const final = {};
  for (const t of [...(await tables())].sort()) final[t] = await count(t);
  report.finalRows = final;
  report.finished = new Date().toISOString();
  const leftover = ['users', 'enquiries', 'pages', 'seo_settings', 'blog_posts'].filter((t) => t in final);
  if (leftover.length) log(`   WARNING: retired tables still present: ${leftover.join(', ')}`);

  const file = path.join('data', 'imports', `import-report-${report.started.replace(/[:.]/g, '-')}.json`);
  if (!DRY) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, JSON.stringify(report, null, 2));
  }
  log(`6. REPORT: ${Object.keys(final).length} tables, ${Object.values(final).reduce((a, b) => a + b, 0)} rows.${DRY ? '' : ' Written to ' + file}`);
}

await conn.end();
