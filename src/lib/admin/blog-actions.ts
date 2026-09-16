'use server';

/**
 * Every write the Blog & Insights screens perform.
 *
 * Same shape as the Pages actions in lib/admin/actions.ts — validate, act, set
 * a flash, redirect — so the two content modules behave identically: the same
 * CSRF check, the same post-redirect-get, and the same sitemap regeneration
 * after anything that changes what search engines can see.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';

import { adminUrl } from './config';
import { csrfOk, currentUser, setFlash, type AdminUser } from './session';
import { seoRegenerate } from './seo-lib';
import {
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
  blogNormalizeDate,
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

/** Scheme + host of the panel request, so generated URLs match the site. */
async function requestOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? '';
  if (!host) return '';
  const proto =
    h.get('x-forwarded-proto') ??
    (host.startsWith('localhost') || host.startsWith('127.') ? 'http' : 'https');
  return `${proto}://${host}`;
}

/**
 * The signed-in administrator, or a redirect to the sign-in screen. A Server
 * Action is an endpoint anyone can post to, not only the screen that renders
 * its form, so every action that writes checks this first.
 */
async function requireUser(): Promise<AdminUser> {
  const user = await currentUser();
  if (!user) redirect(adminUrl(''));
  return user;
}

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
  values?: Partial<BlogPostInput> & { id?: number };
}

/** Save an uploaded cover image into /public, returning its site-root URL. */
async function storeCover(file: File, slug: string): Promise<{ url: string; error: string }> {
  const ext = UPLOAD_TYPES[file.type];
  if (!ext) {
    return { url: '', error: 'The cover image must be a WebP, JPEG, PNG, AVIF or GIF file.' };
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return { url: '', error: 'The cover image must be 5 MB or smaller.' };
  }

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

export async function saveBlogAction(
  _prev: BlogFormState | null,
  form: FormData
): Promise<BlogFormState> {
  await requireUser();

  const isNew = String(form.get('mode') ?? '') === 'new';
  const id = Number(form.get('id') ?? 0);

  if (!(await csrfOk(String(form.get('csrf') ?? '')))) {
    return { errors: { general: 'Your session expired. Please submit the form again.' } };
  }

  const s = (k: string) => String(form.get(k) ?? '').trim();
  const status: BlogStatus = s('status') === 'published' ? 'published' : 'draft';

  const values: BlogPostInput = {
    title: s('title').slice(0, BLOG_LIMITS.title),
    slug: blogSlugify(s('slug') !== '' ? s('slug') : s('title')),
    category: s('category').slice(0, BLOG_LIMITS.category),
    excerpt: s('excerpt'),
    // The body is HTML the editor composed; it is never trimmed of its markup.
    body: String(form.get('body') ?? '').trim(),
    cover_image: s('cover_image').slice(0, BLOG_LIMITS.cover_image),
    cover_alt: s('cover_alt').slice(0, BLOG_LIMITS.cover_alt),
    author: s('author').slice(0, BLOG_LIMITS.author),
    author_role: s('author_role').slice(0, BLOG_LIMITS.author_role),
    status,
    featured: form.get('featured') ? 1 : 0,
    in_sitemap: form.get('in_sitemap') ? 1 : 0,
    published_at: blogNormalizeDate(s('published_at')),
    meta_title: s('meta_title').slice(0, BLOG_LIMITS.meta_title),
    meta_description: s('meta_description'),
    meta_keywords: s('meta_keywords').slice(0, BLOG_LIMITS.meta_keywords),
    og_image: s('og_image').slice(0, BLOG_LIMITS.og_image),
  };

  // A date that was submitted but is not a real one must be reported, not
  // silently blanked — blogNormalizeDate returns '' for both.
  const rawDate = s('published_at');
  if (rawDate !== '' && values.published_at === '') values.published_at = rawDate;

  let existing = null;
  if (!isNew) {
    try {
      existing = await postById(id);
    } catch {
      return {
        errors: { general: 'Could not reach the database. Please ensure MySQL is running.' },
        values: { ...values, id },
      };
    }
    if (!existing) {
      await setFlash({ err: 'That post no longer exists.' });
      redirect(adminUrl('blogs'));
    }
  }

  const errors: BlogErrors = validateBlogPost(values);

  if (!errors.slug) {
    try {
      if (await slugTaken(values.slug, isNew ? 0 : id)) {
        errors.slug = `The slug “${values.slug}” is already used by another post. Choose a different one.`;
      }
    } catch {
      errors.general = 'Could not reach the database. Please ensure MySQL is running.';
    }
  }

  /* The upload replaces the path field when a file was chosen.
     It runs even when the post is about to be rejected, on purpose: a file
     input does not survive the re-render a rejected save causes, so waiting
     until the post is valid loses the picture the editor chose without saying
     so. Storing it now and handing the path back in `values` means the form
     returns with the new cover already set, and the next save keeps it. */
  const file = form.get('cover_file');
  if (file instanceof File && file.size > 0) {
    const stored = await storeCover(file, values.slug || values.title);
    if (stored.error) errors.cover_image = stored.error;
    else values.cover_image = stored.url;
  }

  if (Object.keys(errors).length) return { errors, values: { ...values, id } };

  try {
    if (isNew) {
      const newId = await createPost(values);
      const warning = await regenerateSitemap();
      revalidateBlog();
      await setFlash({
        ok: `Post “${values.title}” created at /blogs/${values.slug}/.`,
        err: warning || undefined,
      });
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
      values: { ...values, id },
    };
  }
}

/* ---- The listing --------------------------------------------------------- */

export async function blogOpAction(form: FormData) {
  await requireUser();

  const op = String(form.get('op') ?? '');
  const id = Number(form.get('id') ?? 0);
  // Only ever back into the panel: the field comes from the browser.
  const backField = String(form.get('back') ?? '');
  const back = backField.startsWith(adminUrl('')) ? backField : adminUrl('blogs');

  if (!(await csrfOk(String(form.get('csrf') ?? '')))) {
    await setFlash({ err: 'Your session expired. Please try again.' });
    redirect(back);
  }

  try {
    if (op === 'delete') {
      const post = await postById(id);
      if (!post) {
        await setFlash({ err: 'That post no longer exists.' });
      } else if (await deletePost(id)) {
        await regenerateSitemap();
        await setFlash({
          ok: `“${post.title}” deleted. It no longer appears on the website.`,
        });
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
        const copyId = await createPost({
          ...post,
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
