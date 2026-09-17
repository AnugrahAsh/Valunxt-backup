/**
 * Everything the blog reads from and writes to the database.
 *
 * Posts are rows of `vx_posts`, authors rows of `vx_authors` — the tables the
 * www.valunxt.com panel kept its articles in, imported on 2026-09-16. The admin
 * panel writes through this module and the public /blogs/ pages read through
 * it, so there is one definition of what a post is and one place a query can
 * be wrong.
 *
 * Runs on the shared pool (lib/db.ts), not the admin's: a public page view has
 * no business seeding administrators or reconciling the SEO map.
 */
import 'server-only';
import fs from 'node:fs';
import path from 'node:path';

import { exec, rowLimit, sql } from '@/lib/db';
import { publicFileExists } from '@/lib/public-files';
import {
  BLOG_DEFAULT_AUTHOR,
  BLOG_DEFAULT_AUTHOR_ROLE,
  BLOG_FALLBACK_COVER,
  blogDateLong,
  blogPlainText,
  blogSlugify,
  type BlogAuthor,
  type BlogCard,
  type BlogPost,
  type BlogPostInput,
  type BlogStatus,
} from './types';

/* ---- Row mapping --------------------------------------------------------- */

function str(v: unknown): string {
  return v === null || v === undefined ? '' : String(v);
}

/** A raw row as the rest of the application uses it: no nulls, known status. */
function toPost(row: Record<string, unknown>): BlogPost {
  return {
    id: Number(row.id),
    slug: str(row.slug),
    title: str(row.title),
    excerpt: str(row.excerpt),
    body_html: str(row.body_html),
    cover: str(row.cover),
    cover_alt: str(row.cover_alt),
    cat: str(row.cat) || 'Insights',
    tags: str(row.tags),
    status: (str(row.status) === 'published' ? 'published' : 'draft') as BlogStatus,
    in_sitemap: Number(row.in_sitemap ?? 1),
    featured: Number(row.featured ?? 0),
    seo_score: Number(row.seo_score ?? 0),
    meta_title: str(row.meta_title),
    meta_desc: str(row.meta_desc),
    keywords: str(row.keywords),
    focus_kw: str(row.focus_kw),
    schema_type: str(row.schema_type) || 'BlogPosting',
    faq_json: str(row.faq_json),
    schema_jsonld: str(row.schema_jsonld),
    og_image: str(row.og_image),
    og_title: str(row.og_title),
    og_desc: str(row.og_desc),
    tw_card: str(row.tw_card) || 'summary_large_image',
    tw_title: str(row.tw_title),
    tw_desc: str(row.tw_desc),
    tw_image: str(row.tw_image),
    canonical: str(row.canonical),
    robots: str(row.robots),
    author: str(row.author),
    author_id: row.author_id === null || row.author_id === undefined ? null : Number(row.author_id),
    author_role: str(row.author_role),
    read_mins: Number(row.read_mins ?? 5),
    created_at: str(row.created_at),
    updated_at: str(row.updated_at),
    published_at: str(row.published_at),
  };
}

function toAuthor(row: Record<string, unknown>): BlogAuthor {
  return {
    id: Number(row.id),
    name: str(row.name),
    slug: str(row.slug),
    title: str(row.title),
    bio: str(row.bio),
    avatar: str(row.avatar),
    email: str(row.email),
    linkedin: str(row.linkedin),
  };
}

/**
 * Whether a site-root image path is published. The imported articles reference
 * /images/blogs/cms/… files that lived on the old server; until they are copied
 * into /public, the card shows the fallback cover rather than a broken image.
 *
 * The build's list of /public (lib/public-files.ts) answers first: in production
 * /public is not traced into the server functions, so on Vercel the disk has no
 * copy to find. A path the list lacks is then looked for on disk, cached per
 * path, which finds a cover uploaded since the build on a server that keeps its
 * files (the upload itself cannot happen on a read-only host).
 */
const onDisk = new Map<string, { at: number; ok: boolean }>();
function publicImageExists(src: string): boolean {
  if (!src.startsWith('/') || src.startsWith('//')) return true; // external: not ours to judge
  const clean = decodeURIComponent(src.split('?')[0]);
  if (publicFileExists(clean)) return true;
  const hit = onDisk.get(clean);
  if (hit && Date.now() - hit.at < 60_000) return hit.ok;
  let ok = false;
  try {
    ok = fs.statSync(path.join(process.cwd(), 'public', clean)).isFile();
  } catch {
    ok = false;
  }
  onDisk.set(clean, { at: Date.now(), ok });
  return ok;
}

/** The cover a page should render: the post's own if its file exists, else the fallback. */
export function blogCoverSrc(cover: string): string {
  const c = cover.trim();
  return c && publicImageExists(c) ? c : BLOG_FALLBACK_COVER;
}

/** The listing card for a post: the fields /blogs/ and the related rail show. */
export function blogCard(post: BlogPost): BlogCard {
  const excerpt = post.excerpt.trim() || blogPlainText(post.body_html).slice(0, 180);
  const day = post.published_at.slice(0, 10);
  return {
    slug: post.slug,
    title: post.title,
    excerpt,
    category: post.cat,
    cover_image: blogCoverSrc(post.cover),
    cover_alt: post.cover_alt,
    date: blogDateLong(day),
    date_iso: day,
    featured: post.featured,
    read_mins: post.read_mins,
  };
}

/** The byline: the author profile when there is one, the row's own text otherwise. */
export function blogByline(post: BlogPost, author: BlogAuthor | null): { name: string; role: string; avatar: string } {
  return {
    name: author?.name || post.author.trim() || BLOG_DEFAULT_AUTHOR,
    role: post.author_role.trim() || author?.title || BLOG_DEFAULT_AUTHOR_ROLE,
    avatar: author?.avatar ?? '',
  };
}

/* ---- Public reads -------------------------------------------------------- */

/**
 * Newest first, featured posts pinned to the top — the order the listing shows
 * and the order "Related Insights" draws from.
 */
const LIVE_ORDER = 'ORDER BY featured DESC, COALESCE(published_at, created_at) DESC, id DESC';
/** Published, dated, and not dated in the future (published_at is UTC). */
const LIVE_WHERE = "status = 'published' AND published_at IS NOT NULL AND published_at <= UTC_TIMESTAMP()";

/** Every post the public site publishes, in display order. */
export async function publishedPosts(limit = 0): Promise<BlogPost[]> {
  const cap = rowLimit(limit) ? ` LIMIT ${rowLimit(limit)}` : '';
  const rows = await sql(`SELECT * FROM vx_posts WHERE ${LIVE_WHERE} ${LIVE_ORDER}${cap}`);
  return rows.map((r) => toPost(r as Record<string, unknown>));
}

/** The cards for the /blogs/ listing. */
export async function publishedCards(limit = 0): Promise<BlogCard[]> {
  return (await publishedPosts(limit)).map(blogCard);
}

/** One published post by its slug, or null — what /blogs/<slug>/ answers from. */
export async function publishedPostBySlug(slug: string): Promise<BlogPost | null> {
  const rows = await sql(`SELECT * FROM vx_posts WHERE slug = ? AND ${LIVE_WHERE} LIMIT 1`, [String(slug)]);
  return rows[0] ? toPost(rows[0] as Record<string, unknown>) : null;
}

/** Whether a slug has a published post behind it, without reading the post. */
export async function publishedPostExists(slug: string): Promise<boolean> {
  const rows = await sql<{ n: number }>(`SELECT COUNT(*) AS n FROM vx_posts WHERE slug = ? AND ${LIVE_WHERE}`, [
    String(slug),
  ]);
  return Number(rows[0]?.n ?? 0) > 0;
}

/** The other published posts, newest first — the article sidebar's rail. */
export async function relatedCards(excludeSlug: string, limit = 3): Promise<BlogCard[]> {
  const rows = await sql(
    `SELECT * FROM vx_posts WHERE ${LIVE_WHERE} AND slug <> ? ${LIVE_ORDER} LIMIT ${rowLimit(limit, 3)}`,
    [String(excludeSlug)]
  );
  return rows.map((r) => blogCard(toPost(r as Record<string, unknown>)));
}

/** Every published slug in the sitemap — the sitemap's blog entries. */
export async function publishedSlugs(): Promise<Array<{ slug: string; title: string; updated_at: string }>> {
  const rows = await sql<{ slug: string; title: string; updated_at: string }>(
    `SELECT slug, title, updated_at FROM vx_posts WHERE ${LIVE_WHERE} AND in_sitemap = 1 ${LIVE_ORDER}`
  );
  return rows.map((r) => ({ slug: str(r.slug), title: str(r.title), updated_at: str(r.updated_at) }));
}

/** An author profile by id, or null. */
export async function authorById(id: number | null): Promise<BlogAuthor | null> {
  if (!id) return null;
  const rows = await sql('SELECT * FROM vx_authors WHERE id = ? LIMIT 1', [Number(id)]);
  return rows[0] ? toAuthor(rows[0] as Record<string, unknown>) : null;
}

/* ---- Admin reads --------------------------------------------------------- */

export interface BlogListFilter {
  /** Free text over title, slug, category, tags and excerpt. */
  q?: string;
  /** '' for every status. */
  status?: string;
  /** '' for every category. */
  category?: string;
  /** 0 for every author. */
  authorId?: number;
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
    where.push('(title LIKE ? OR slug LIKE ? OR cat LIKE ? OR tags LIKE ? OR excerpt LIKE ?)');
    args.push(like, like, like, like, like);
  }
  const status = String(filter.status ?? '').trim();
  if (status === 'published' || status === 'draft') {
    where.push('status = ?');
    args.push(status);
  }
  const category = String(filter.category ?? '').trim();
  if (category !== '') {
    where.push('cat = ?');
    args.push(category);
  }
  if (filter.authorId) {
    where.push('author_id = ?');
    args.push(Number(filter.authorId));
  }

  const rows = await sql(
    `SELECT * FROM vx_posts
      ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
      ORDER BY COALESCE(published_at, created_at) DESC, id DESC`,
    args
  );
  return rows.map((r) => toPost(r as Record<string, unknown>));
}

/** One post by id, whatever its status — what the editor loads. */
export async function postById(id: number): Promise<BlogPost | null> {
  const rows = await sql('SELECT * FROM vx_posts WHERE id = ? LIMIT 1', [Number(id)]);
  return rows[0] ? toPost(rows[0] as Record<string, unknown>) : null;
}

/** Whether another post already holds this slug. */
export async function slugTaken(slug: string, exceptId = 0): Promise<boolean> {
  const rows = await sql<{ n: number }>('SELECT COUNT(*) AS n FROM vx_posts WHERE slug = ? AND id <> ?', [
    blogSlugify(slug),
    Number(exceptId),
  ]);
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
  const rows = await sql<{ cat: string }>("SELECT DISTINCT cat FROM vx_posts WHERE cat <> '' ORDER BY cat");
  return rows.map((r) => str(r.cat));
}

/** Every author, by name — the editor's byline choices. */
export async function allAuthors(): Promise<BlogAuthor[]> {
  const rows = await sql('SELECT * FROM vx_authors ORDER BY name');
  return rows.map((r) => toAuthor(r as Record<string, unknown>));
}

export interface BlogStats {
  total: number;
  published: number;
  draft: number;
  featured: number;
}

/** The counts the admin listing shows above the table. */
export async function blogStats(): Promise<BlogStats> {
  const rows = await sql<{ total: number; published: number; draft: number; featured: number }>(
    `SELECT COUNT(*) AS total,
            SUM(status = 'published') AS published,
            SUM(status <> 'published') AS draft,
            SUM(featured = 1) AS featured
       FROM vx_posts`
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
  'slug',
  'title',
  'excerpt',
  'body_html',
  'cover',
  'cover_alt',
  'cat',
  'tags',
  'status',
  'in_sitemap',
  'featured',
  'meta_title',
  'meta_desc',
  'keywords',
  'focus_kw',
  'schema_type',
  'faq_json',
  'schema_jsonld',
  'og_image',
  'og_title',
  'og_desc',
  'tw_card',
  'tw_title',
  'tw_desc',
  'tw_image',
  'canonical',
  'robots',
  'author',
  'author_id',
  'author_role',
  'read_mins',
  'published_at',
] as const satisfies ReadonlyArray<keyof BlogPostInput>;

/** '' as NULL for the columns the imported schema lets be NULL. */
const NULLABLE = new Set<string>([
  'excerpt', 'body_html', 'cover', 'cover_alt', 'tags', 'meta_title', 'meta_desc', 'keywords', 'focus_kw',
  'faq_json', 'schema_jsonld', 'og_image', 'og_title', 'og_desc', 'tw_title', 'tw_desc', 'tw_image',
  'canonical', 'robots', 'author_role', 'published_at',
]);

function columnValues(input: BlogPostInput): unknown[] {
  return COLUMNS.map((c) => {
    const v = input[c];
    if (c === 'in_sitemap' || c === 'featured') return v ? 1 : 0;
    if (c === 'author_id') return v ? Number(v) : null;
    if (c === 'read_mins') return Math.max(1, Math.min(255, Number(v) || 1));
    if (NULLABLE.has(c) && (v === '' || v === null || v === undefined)) return null;
    return v;
  });
}

/** Insert a post. Returns its new id. */
export async function createPost(input: BlogPostInput): Promise<number> {
  const res = await exec(
    `INSERT INTO vx_posts (${COLUMNS.join(', ')}) VALUES (${COLUMNS.map(() => '?').join(', ')})`,
    columnValues(input)
  );
  return res.insertId;
}

/** Overwrite a post. Returns false when the id no longer exists. */
export async function updatePost(id: number, input: BlogPostInput): Promise<boolean> {
  const res = await exec(`UPDATE vx_posts SET ${COLUMNS.map((c) => `${c} = ?`).join(', ')} WHERE id = ?`, [
    ...columnValues(input),
    Number(id),
  ]);
  return res.affectedRows > 0;
}

/** Remove a post. Returns false when the id no longer exists. */
export async function deletePost(id: number): Promise<boolean> {
  const res = await exec('DELETE FROM vx_posts WHERE id = ?', [Number(id)]);
  return res.affectedRows > 0;
}

/** Flip `status` between published and draft. Returns the new status, or null. */
export async function togglePostStatus(id: number): Promise<BlogStatus | null> {
  const post = await postById(id);
  if (!post) return null;
  const next: BlogStatus = post.status === 'published' ? 'draft' : 'published';
  // Publishing a post that never had a date stamps it now, so the public site's
  // "published_at is not in the future" rule does not hide it straight away.
  await exec(
    next === 'published' && post.published_at === ''
      ? 'UPDATE vx_posts SET status = ?, published_at = UTC_TIMESTAMP() WHERE id = ?'
      : 'UPDATE vx_posts SET status = ? WHERE id = ?',
    [next, Number(id)]
  );
  return next;
}

/** Flip `featured`. Returns the new value, or null when the post is gone. */
export async function togglePostFeatured(id: number): Promise<boolean | null> {
  const post = await postById(id);
  if (!post) return null;
  const next = post.featured ? 0 : 1;
  await exec('UPDATE vx_posts SET featured = ? WHERE id = ?', [next, Number(id)]);
  return next === 1;
}
