/**
 * Everything the blog reads from and writes to MySQL.
 *
 * One module owns the `blog_posts` table: the admin panel writes through it and
 * the public /blogs/ pages read through it, so there is exactly one definition
 * of what a post is and one place a query can be wrong. It connects with the
 * same credentials as the rest of the site (lib/db.ts) rather than introducing
 * a second configuration, and bootstraps its table on first use so a fresh
 * install needs no manual SQL import — the pattern lib/admin/db.ts established.
 *
 * It deliberately does NOT go through lib/admin/db.ts: that pool also seeds the
 * administrator and reconciles the SEO map on every call, work a public page
 * view has no business doing.
 */
import 'server-only';
import mysql from 'mysql2/promise';

import { dbConfig } from '@/lib/db';
import {
  BLOG_DEFAULT_AUTHOR,
  BLOG_DEFAULT_AUTHOR_ROLE,
  BLOG_FALLBACK_COVER,
  blogDateLong,
  blogPlainText,
  blogSlugify,
  type BlogCard,
  type BlogPost,
  type BlogPostInput,
  type BlogStatus,
} from './types';

export const BLOG_POSTS_TABLE_SQL = `CREATE TABLE IF NOT EXISTS blog_posts (
                id               INT UNSIGNED NOT NULL AUTO_INCREMENT,
                title            VARCHAR(200)  NOT NULL DEFAULT '',
                slug             VARCHAR(190)  NOT NULL DEFAULT '',
                category         VARCHAR(120)  NOT NULL DEFAULT '',
                excerpt          TEXT          NULL,
                body             MEDIUMTEXT    NULL,
                cover_image      VARCHAR(255)  NOT NULL DEFAULT '',
                cover_alt        VARCHAR(255)  NOT NULL DEFAULT '',
                author           VARCHAR(160)  NOT NULL DEFAULT '',
                author_role      VARCHAR(160)  NOT NULL DEFAULT '',
                status           VARCHAR(20)   NOT NULL DEFAULT 'draft',
                featured         TINYINT(1)    NOT NULL DEFAULT 0,
                in_sitemap       TINYINT(1)    NOT NULL DEFAULT 1,
                published_at     DATE          NULL DEFAULT NULL,
                meta_title       VARCHAR(255)  NOT NULL DEFAULT '',
                meta_description TEXT          NULL,
                meta_keywords    VARCHAR(500)  NOT NULL DEFAULT '',
                og_image         VARCHAR(255)  NOT NULL DEFAULT '',
                created_at       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                PRIMARY KEY (id),
                UNIQUE KEY uq_blog_slug (slug),
                KEY idx_blog_live (status, published_at)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`;

let pool: mysql.Pool | null = null;
let ready: Promise<void> | null = null;

function getPool(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool({
      ...dbConfig(process.env.DB_HOST ? '' : 'localhost'),
      charset: 'utf8mb4',
      waitForConnections: true,
      connectionLimit: 5,
      // DATE and DATETIME as written, so a publish date cannot shift a day
      // through the server's timezone on its way out of MySQL.
      dateStrings: true,
    });
  }
  return pool;
}

/** The pool with `blog_posts` guaranteed. Throws if MySQL is unreachable. */
async function blogDb(): Promise<mysql.Pool> {
  if (!ready) {
    ready = getPool()
      .query(BLOG_POSTS_TABLE_SQL)
      .then(() => undefined)
      .catch((e) => {
        // Let the next call retry rather than caching the failure for good.
        ready = null;
        throw e;
      });
  }
  await ready;
  return getPool();
}

async function select<T = mysql.RowDataPacket>(sql: string, args: unknown[] = []): Promise<T[]> {
  const p = await blogDb();
  const [rows] = await p.query<mysql.RowDataPacket[]>(sql, args);
  return rows as T[];
}

async function write(sql: string, args: unknown[] = []): Promise<mysql.ResultSetHeader> {
  const p = await blogDb();
  const [res] = await p.query<mysql.ResultSetHeader>(sql, args);
  return res;
}

/* ---- Row mapping --------------------------------------------------------- */

function str(v: unknown): string {
  return v === null || v === undefined ? '' : String(v);
}

/** A raw row as the rest of the application uses it: no nulls, known status. */
function toPost(row: Record<string, unknown>): BlogPost {
  return {
    id: Number(row.id),
    title: str(row.title),
    slug: str(row.slug),
    category: str(row.category),
    excerpt: str(row.excerpt),
    body: str(row.body),
    cover_image: str(row.cover_image),
    cover_alt: str(row.cover_alt),
    author: str(row.author),
    author_role: str(row.author_role),
    status: (str(row.status) === 'published' ? 'published' : 'draft') as BlogStatus,
    featured: Number(row.featured ?? 0),
    in_sitemap: Number(row.in_sitemap ?? 1),
    published_at: str(row.published_at).slice(0, 10),
    meta_title: str(row.meta_title),
    meta_description: str(row.meta_description),
    meta_keywords: str(row.meta_keywords),
    og_image: str(row.og_image),
    created_at: str(row.created_at),
    updated_at: str(row.updated_at),
  };
}

/** The listing card for a post: the fields /blogs/ and the related rail show. */
export function blogCard(post: BlogPost): BlogCard {
  const excerpt = post.excerpt.trim() || blogPlainText(post.body).slice(0, 180);
  return {
    slug: post.slug,
    title: post.title,
    excerpt,
    category: post.category,
    cover_image: post.cover_image || BLOG_FALLBACK_COVER,
    cover_alt: post.cover_alt,
    date: blogDateLong(post.published_at),
    date_iso: post.published_at,
    featured: post.featured,
  };
}

/** The byline, with the defaults the launch posts carried. */
export function blogAuthor(post: BlogPost): { name: string; role: string } {
  return {
    name: post.author.trim() || BLOG_DEFAULT_AUTHOR,
    role: post.author_role.trim() || BLOG_DEFAULT_AUTHOR_ROLE,
  };
}

/* ---- Public reads -------------------------------------------------------- */

/**
 * Newest first, featured posts pinned to the top — the order the listing shows
 * and the order "Related Insights" draws from. A post with no publish date
 * falls back to when it was created, so it is never stranded at the bottom.
 */
const LIVE_ORDER = 'ORDER BY featured DESC, COALESCE(published_at, DATE(created_at)) DESC, id DESC';
const LIVE_WHERE = "status = 'published' AND published_at IS NOT NULL AND published_at <= CURDATE()";

/**
 * A row count safe to interpolate. MySQL will not take LIMIT as a placeholder
 * in a prepared statement, so the value is forced to an integer here rather
 * than trusted from the caller.
 */
function rowLimit(n: unknown, fallback = 0): number {
  const v = Math.trunc(Number(n));
  return Number.isFinite(v) && v > 0 ? v : fallback;
}

/** Every post the public site publishes, in display order. */
export async function publishedPosts(limit = 0): Promise<BlogPost[]> {
  const cap = rowLimit(limit) ? ` LIMIT ${rowLimit(limit)}` : '';
  const rows = await select(`SELECT * FROM blog_posts WHERE ${LIVE_WHERE} ${LIVE_ORDER}${cap}`);
  return rows.map((r) => toPost(r as Record<string, unknown>));
}

/** The cards for the /blogs/ listing. */
export async function publishedCards(limit = 0): Promise<BlogCard[]> {
  return (await publishedPosts(limit)).map(blogCard);
}

/** One published post by its slug, or null — what /blogs/<slug>/ answers from. */
export async function publishedPostBySlug(slug: string): Promise<BlogPost | null> {
  const rows = await select(`SELECT * FROM blog_posts WHERE slug = ? AND ${LIVE_WHERE} LIMIT 1`, [
    String(slug),
  ]);
  return rows[0] ? toPost(rows[0] as Record<string, unknown>) : null;
}

/** Whether a slug has a published post behind it, without reading the post. */
export async function publishedPostExists(slug: string): Promise<boolean> {
  const rows = await select<{ n: number }>(
    `SELECT COUNT(*) AS n FROM blog_posts WHERE slug = ? AND ${LIVE_WHERE}`,
    [String(slug)]
  );
  return Number(rows[0]?.n ?? 0) > 0;
}

/** The other published posts, newest first — the article sidebar's rail. */
export async function relatedCards(excludeSlug: string, limit = 3): Promise<BlogCard[]> {
  const rows = await select(
    `SELECT * FROM blog_posts WHERE ${LIVE_WHERE} AND slug <> ? ${LIVE_ORDER} LIMIT ${rowLimit(limit, 3)}`,
    [String(excludeSlug)]
  );
  return rows.map((r) => blogCard(toPost(r as Record<string, unknown>)));
}

/** Every published slug — the sitemap's blog entries. */
export async function publishedSlugs(): Promise<Array<{ slug: string; updated_at: string }>> {
  const rows = await select<{ slug: string; updated_at: string }>(
    `SELECT slug, updated_at FROM blog_posts WHERE ${LIVE_WHERE} AND in_sitemap = 1 ${LIVE_ORDER}`
  );
  return rows.map((r) => ({ slug: str(r.slug), updated_at: str(r.updated_at) }));
}

/* ---- Admin reads --------------------------------------------------------- */

export interface BlogListFilter {
  /** Free text over title, slug, category and excerpt. */
  q?: string;
  /** '' for every status. */
  status?: string;
  /** '' for every category. */
  category?: string;
}

/** A LIKE pattern for a free-text term, with its wildcards escaped. */
function likePattern(term: string): string {
  return '%' + term.replace(/[\\%_]/g, (c) => '\\' + c) + '%';
}

/** Every post, newest first, for the admin listing. */
export async function listPosts(filter: BlogListFilter = {}): Promise<BlogPost[]> {
  const where: string[] = [];
  const args: unknown[] = [];

  const q = String(filter.q ?? '').trim();
  if (q !== '') {
    const like = likePattern(q);
    where.push('(title LIKE ? OR slug LIKE ? OR category LIKE ? OR excerpt LIKE ?)');
    args.push(like, like, like, like);
  }
  const status = String(filter.status ?? '').trim();
  if (status === 'published' || status === 'draft') {
    where.push('status = ?');
    args.push(status);
  }
  const category = String(filter.category ?? '').trim();
  if (category !== '') {
    where.push('category = ?');
    args.push(category);
  }

  const rows = await select(
    `SELECT * FROM blog_posts
      ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
      ORDER BY COALESCE(published_at, DATE(created_at)) DESC, id DESC`,
    args
  );
  return rows.map((r) => toPost(r as Record<string, unknown>));
}

/** One post by id, whatever its status — what the editor loads. */
export async function postById(id: number): Promise<BlogPost | null> {
  const rows = await select('SELECT * FROM blog_posts WHERE id = ? LIMIT 1', [Number(id)]);
  return rows[0] ? toPost(rows[0] as Record<string, unknown>) : null;
}

/** Whether another post already holds this slug. */
export async function slugTaken(slug: string, exceptId = 0): Promise<boolean> {
  const rows = await select<{ n: number }>(
    'SELECT COUNT(*) AS n FROM blog_posts WHERE slug = ? AND id <> ?',
    [blogSlugify(slug), Number(exceptId)]
  );
  return Number(rows[0]?.n ?? 0) > 0;
}

/** `base`, or `base-2`, `base-3`… — the first slug no other post holds. */
export async function uniqueSlug(base: string, exceptId = 0): Promise<string> {
  const root = blogSlugify(base) || 'post';
  let candidate = root;
  for (let n = 2; await slugTaken(candidate, exceptId); n++) {
    candidate = `${root.slice(0, 180)}-${n}`;
  }
  return candidate;
}

/** The categories in use, for the listing filter. */
export async function usedCategories(): Promise<string[]> {
  const rows = await select<{ category: string }>(
    "SELECT DISTINCT category FROM blog_posts WHERE category <> '' ORDER BY category"
  );
  return rows.map((r) => str(r.category));
}

export interface BlogStats {
  total: number;
  published: number;
  draft: number;
  featured: number;
}

/** The counts the admin listing shows above the table. */
export async function blogStats(): Promise<BlogStats> {
  const rows = await select<{ total: number; published: number; draft: number; featured: number }>(
    `SELECT COUNT(*) AS total,
            SUM(status = 'published') AS published,
            SUM(status <> 'published') AS draft,
            SUM(featured = 1) AS featured
       FROM blog_posts`
  );
  const r = rows[0];
  return {
    total: Number(r?.total ?? 0),
    published: Number(r?.published ?? 0),
    draft: Number(r?.draft ?? 0),
    featured: Number(r?.featured ?? 0),
  };
}

/* ---- Writes -------------------------------------------------------------- */

const COLUMNS = [
  'title',
  'slug',
  'category',
  'excerpt',
  'body',
  'cover_image',
  'cover_alt',
  'author',
  'author_role',
  'status',
  'featured',
  'in_sitemap',
  'published_at',
  'meta_title',
  'meta_description',
  'meta_keywords',
  'og_image',
] as const;

/** The column values for an input, in COLUMNS order. */
function columnValues(input: BlogPostInput): unknown[] {
  return [
    input.title,
    input.slug,
    input.category,
    input.excerpt,
    input.body,
    input.cover_image,
    input.cover_alt,
    input.author,
    input.author_role,
    input.status,
    input.featured ? 1 : 0,
    input.in_sitemap ? 1 : 0,
    // An empty date is NULL, not '0000-00-00', which strict mode rejects.
    input.published_at || null,
    input.meta_title,
    input.meta_description,
    input.meta_keywords,
    input.og_image,
  ];
}

/** Insert a post. Returns its new id. */
export async function createPost(input: BlogPostInput): Promise<number> {
  const res = await write(
    `INSERT INTO blog_posts (${COLUMNS.join(', ')}) VALUES (${COLUMNS.map(() => '?').join(', ')})`,
    columnValues(input)
  );
  return res.insertId;
}

/** Overwrite a post. Returns false when the id no longer exists. */
export async function updatePost(id: number, input: BlogPostInput): Promise<boolean> {
  const res = await write(
    `UPDATE blog_posts SET ${COLUMNS.map((c) => `${c} = ?`).join(', ')} WHERE id = ?`,
    [...columnValues(input), Number(id)]
  );
  return res.affectedRows > 0;
}

/** Remove a post. Returns false when the id no longer exists. */
export async function deletePost(id: number): Promise<boolean> {
  const res = await write('DELETE FROM blog_posts WHERE id = ?', [Number(id)]);
  return res.affectedRows > 0;
}

/** Flip `status` between published and draft. Returns the new status, or null. */
export async function togglePostStatus(id: number): Promise<BlogStatus | null> {
  const post = await postById(id);
  if (!post) return null;
  const next: BlogStatus = post.status === 'published' ? 'draft' : 'published';
  // Publishing a post that never had a date gets today's, so it is not filtered
  // straight back out by the "published_at <= today" rule the public site uses.
  const date = next === 'published' && post.published_at === '' ? new Date() : null;
  await write(
    date
      ? 'UPDATE blog_posts SET status = ?, published_at = CURDATE() WHERE id = ?'
      : 'UPDATE blog_posts SET status = ? WHERE id = ?',
    [next, Number(id)]
  );
  return next;
}

/** Flip `featured`. Returns the new value, or null when the post is gone. */
export async function togglePostFeatured(id: number): Promise<boolean | null> {
  const post = await postById(id);
  if (!post) return null;
  const next = post.featured ? 0 : 1;
  await write('UPDATE blog_posts SET featured = ? WHERE id = ?', [next, Number(id)]);
  return next === 1;
}
