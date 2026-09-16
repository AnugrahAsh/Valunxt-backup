'use server';

/**
 * Every write the Blog & Insights screens perform, on `vx_posts`.
 *
 * Same shape as the page actions beside it — check who is asking, validate,
 * act, set a flash, redirect — and the same sitemap regeneration after
 * anything that changes what search engines can see.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

import { adminUrl } from './config';
import { requestOrigin, requireCsrf, requireUser, safeBack } from './guard';
import { csrfOk, setFlash } from './session';
import { seoRegenerate } from './seo-lib';
import {
  authorById,
  createPost,
  deletePost,
  postById,
  slugTaken,
  togglePostFeatured,
  togglePostStatus,
  uniqueSlug,
  updatePost,
} from '@/lib/blog/db';
import {
  BLOG_LIMITS,
  BLOG_ROBOTS,
  BLOG_SCHEMA_TYPES,
  BLOG_TWITTER_CARDS,
  blogNormalizeDate,
  blogReadMinutes,
  blogSlugify,
  validateBlogPost,
  type BlogErrors,
  type BlogPostInput,
  type BlogStatus,
} from '@/lib/blog/types';

/** Where an uploaded cover lands, relative to the project root. */
const UPLOAD_DIR = path.join('public', 'assets', 'content', 'uploads', 'blogs');
/** The same folder as a site-root URL. */
const UPLOAD_URL = '/assets/content/uploads/blogs';
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const UPLOAD_TYPES: Record<string, string> = {
  'image/webp': '.webp',
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/avif': '.avif',
  'image/gif': '.gif',
};

/** The public pages that render from the blog table. */
function revalidateBlog() {
  revalidatePath('/', 'layout');
}

/**
 * Publish the sitemap again. Best effort: a post is saved whether or not the
 * file can be rewritten, and the Pages screen already surfaces a stale sitemap.
 */
async function regenerateSitemap(): Promise<string> {
  try {
    const gen = await seoRegenerate(await requestOrigin());
    return gen.errors.length ? gen.errors.join(' ') : '';
  } catch {
    return '';
  }
}

/* ---- The editor ---------------------------------------------------------- */

export interface BlogFormState {
  errors?: BlogErrors;
  /** What was submitted, so a rejected form comes back filled in. */
  values?: Partial<BlogPostInput> & { id?: number; publish_date?: string };
}

/** Save an uploaded cover image into /public, returning its site-root URL. */
async function storeCover(file: File, slug: string): Promise<{ url: string; error: string }> {
  const ext = UPLOAD_TYPES[file.type];
  if (!ext) return { url: '', error: 'The cover image must be a WebP, JPEG, PNG, AVIF or GIF file.' };
  if (file.size > MAX_UPLOAD_BYTES) return { url: '', error: 'The cover image must be 5 MB or smaller.' };

  const name = `${blogSlugify(slug) || 'post'}-${Date.now().toString(36)}${ext}`;
  const dir = path.join(process.cwd(), UPLOAD_DIR);
  try {
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));
  } catch (e) {
    return { url: '', error: `The cover image could not be saved to ${UPLOAD_DIR}. (${String(e)})` };
  }
  return { url: `${UPLOAD_URL}/${name}`, error: '' };
}

/** FAQ pairs posted as faq_q[] / faq_a[]; a pair missing either half is dropped. */
function faqFrom(form: FormData): string {
  const qs = form.getAll('faq_q').map((v) => String(v).trim());
  const as = form.getAll('faq_a').map((v) => String(v).trim());
  const out: Array<{ q: string; a: string }> = [];
  for (let i = 0; i < Math.max(qs.length, as.length); i++) {
    if (qs[i] && as[i]) out.push({ q: qs[i], a: as[i] });
  }
  return out.length ? JSON.stringify(out) : '';
}

/** JSON-LD blocks posted as schema_block[], stored as the imported panel stored them. */
function schemaFrom(form: FormData): string {
  const blocks = form
    .getAll('schema_block')
    .map((b) => String(b).trim())
    .filter((b) => b !== '');
  return blocks.length ? JSON.stringify(blocks) : '';
}

/**
 * The stored publish timestamp for a submitted date: the post's own time of day
 * when the date is unchanged, midnight UTC for a new date, empty for none.
 */
function publishStamp(date: string, previous: string): string {
  const d = blogNormalizeDate(date);
  if (!d) return '';
  if (previous.slice(0, 10) === d && /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(previous)) return previous;
  return `${d} 00:00:00`;
}

export async function saveBlogAction(_prev: BlogFormState | null, form: FormData): Promise<BlogFormState> {
  await requireUser();

  const isNew = String(form.get('mode') ?? '') === 'new';
  const id = Number(form.get('id') ?? 0);

  if (!(await csrfOk(String(form.get('csrf') ?? '')))) {
    return { errors: { general: 'Your session expired. Please submit the form again.' } };
  }

  const s = (k: string) => String(form.get(k) ?? '').trim();
  const pick = <T extends readonly string[]>(value: string, allowed: T, fallback: T[number]): T[number] =>
    (allowed as readonly string[]).includes(value) ? (value as T[number]) : fallback;

  let existing = null;
  if (!isNew) {
    try {
      existing = await postById(id);
    } catch {
      return { errors: { general: 'Could not reach the database. Please ensure MySQL is running.' } };
    }
    if (!existing) {
      await setFlash({ err: 'That post no longer exists.' });
      redirect(adminUrl('blogs'));
    }
  }

  const status: BlogStatus = s('status') === 'published' ? 'published' : 'draft';
  const publishDate = s('publish_date');
  const authorId = Number(s('author_id')) || null;
  const body = String(form.get('body_html') ?? '').trim();

  const values: BlogPostInput = {
    title: s('title'),
    slug: blogSlugify(s('slug') !== '' ? s('slug') : s('title')),
    excerpt: s('excerpt'),
    body_html: body,
    cover: s('cover').slice(0, BLOG_LIMITS.cover),
    cover_alt: s('cover_alt').slice(0, BLOG_LIMITS.cover_alt),
    cat: s('cat') || 'Insights',
    tags: s('tags')
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
      .join(', '),
    status,
    in_sitemap: form.get('in_sitemap') ? 1 : 0,
    featured: form.get('featured') ? 1 : 0,
    meta_title: s('meta_title'),
    meta_desc: s('meta_desc'),
    keywords: s('keywords'),
    focus_kw: s('focus_kw'),
    schema_type: pick(s('schema_type'), BLOG_SCHEMA_TYPES.map(([v]) => v), 'BlogPosting'),
    faq_json: faqFrom(form),
    schema_jsonld: schemaFrom(form),
    og_image: s('og_image'),
    og_title: s('og_title'),
    og_desc: s('og_desc'),
    tw_card: pick(s('tw_card'), BLOG_TWITTER_CARDS, 'summary_large_image'),
    tw_title: s('tw_title'),
    tw_desc: s('tw_desc'),
    tw_image: s('tw_image'),
    canonical: s('canonical'),
    robots: pick(s('robots'), BLOG_ROBOTS, 'index, follow'),
    author: '',
    author_id: authorId,
    author_role: s('author_role'),
    read_mins: blogReadMinutes(body),
    published_at: publishStamp(publishDate, existing?.published_at ?? ''),
  };

  const errors: BlogErrors = validateBlogPost(values, publishDate);

  // The byline follows the author profile; the text column keeps its name.
  if (authorId) {
    try {
      const author = await authorById(authorId);
      if (!author) errors.author_id = 'That author no longer exists. Choose another.';
      else values.author = author.name.slice(0, 120);
    } catch {
      errors.general = 'Could not reach the database. Please ensure MySQL is running.';
    }
  } else {
    values.author = (existing?.author || 'Valunxt').slice(0, 120);
  }

  if (!errors.slug) {
    try {
      if (await slugTaken(values.slug, isNew ? 0 : id)) {
        errors.slug = `The slug “${values.slug}” is already used by another post. Choose a different one.`;
      }
    } catch {
      errors.general = 'Could not reach the database. Please ensure MySQL is running.';
    }
  }

  /* The upload replaces the path field when a file was chosen. It runs even when
     the post is about to be rejected, on purpose: a file input does not survive
     the re-render a rejected save causes, so waiting until the post is valid
     would lose the picture without saying so. Storing it now and handing the
     path back in `values` means the form returns with the new cover set. */
  const file = form.get('cover_file');
  if (file instanceof File && file.size > 0) {
    const stored = await storeCover(file, values.slug || values.title);
    if (stored.error) errors.cover = stored.error;
    else values.cover = stored.url;
  }

  if (Object.keys(errors).length) return { errors, values: { ...values, id, publish_date: publishDate } };

  try {
    if (isNew) {
      const newId = await createPost(values);
      const warning = await regenerateSitemap();
      revalidateBlog();
      await setFlash({ ok: `Post “${values.title}” created at /blogs/${values.slug}/.`, err: warning || undefined });
      redirect(adminUrl('blogs/edit') + '?id=' + newId);
    }

    const saved = await updatePost(id, values);
    if (!saved) {
      await setFlash({ err: 'That post no longer exists.' });
      redirect(adminUrl('blogs'));
    }
    const warning = await regenerateSitemap();
    revalidateBlog();
    await setFlash({
      ok:
        values.status === 'published'
          ? `“${values.title}” saved and live at /blogs/${values.slug}/.`
          : `“${values.title}” saved as a draft.`,
      err: warning || undefined,
    });
    redirect(adminUrl('blogs/edit') + '?id=' + id);
  } catch (e) {
    // redirect() throws a control-flow signal; let it through.
    if (e && typeof e === 'object' && 'digest' in e) throw e;
    return {
      errors: { general: 'The post could not be saved: ' + String(e) },
      values: { ...values, id, publish_date: publishDate },
    };
  }
}

/* ---- The listing --------------------------------------------------------- */

export async function blogOpAction(form: FormData) {
  await requireUser();

  const op = String(form.get('op') ?? '');
  const id = Number(form.get('id') ?? 0);
  const back = safeBack(form.get('back'), adminUrl('blogs'));
  await requireCsrf(form, back);

  try {
    if (op === 'delete') {
      const post = await postById(id);
      if (!post) {
        await setFlash({ err: 'That post no longer exists.' });
      } else if (await deletePost(id)) {
        await regenerateSitemap();
        await setFlash({ ok: `“${post.title}” deleted. It no longer appears on the website.` });
      } else {
        await setFlash({ err: 'That post could not be deleted.' });
      }
    } else if (op === 'toggle_status') {
      const post = await postById(id);
      const next = await togglePostStatus(id);
      if (!next || !post) {
        await setFlash({ err: 'That post no longer exists.' });
      } else {
        await regenerateSitemap();
        await setFlash({
          ok:
            next === 'published'
              ? `“${post.title}” is now live at /blogs/${post.slug}/.`
              : `“${post.title}” is now a draft and has been taken off the website.`,
        });
      }
    } else if (op === 'toggle_featured') {
      const post = await postById(id);
      const next = await togglePostFeatured(id);
      if (next === null || !post) {
        await setFlash({ err: 'That post no longer exists.' });
      } else {
        await setFlash({
          ok: next
            ? `“${post.title}” is now pinned to the top of the Insights listing.`
            : `“${post.title}” is no longer featured.`,
        });
      }
    } else if (op === 'duplicate') {
      const post = await postById(id);
      if (!post) {
        await setFlash({ err: 'That post no longer exists.' });
      } else {
        const { id: _omit, created_at: _c, updated_at: _u, seo_score: _s, ...input } = post;
        const copyId = await createPost({
          ...input,
          title: `${post.title} (copy)`.slice(0, BLOG_LIMITS.title),
          slug: await uniqueSlug(post.slug),
          status: 'draft',
          featured: 0,
        });
        await setFlash({ ok: `“${post.title}” duplicated as a draft.` });
        revalidateBlog();
        redirect(adminUrl('blogs/edit') + '?id=' + copyId);
      }
    }
  } catch (e) {
    if (e && typeof e === 'object' && 'digest' in e) throw e;
    await setFlash({ err: 'That action could not be completed: ' + String(e) });
  }

  revalidateBlog();
  redirect(back);
}
