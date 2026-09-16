/**
 * Admin — Blog & Insights editor.
 *
 * Handles both writing a new post (?new=1) and editing an existing one (?id=N),
 * the same way blogs/edit's neighbour pages/edit does. The post is loaded from
 * `blog_posts`; everything else is the editor component.
 */
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

import AdminShell from '@/components/admin/AdminShell';
import BlogEditor, { type BlogEditorMarket } from '@/components/admin/BlogEditor';
import { FlashErr, FlashOk } from '@/components/admin/Flash';
import Icon from '@/components/admin/Icon';
import { adminUrl } from '@/lib/admin/config';
import { csrfToken, currentUser, takeFlash } from '@/lib/admin/session';
import { seoSiteUrl } from '@/lib/admin/seo-lib';
import { postById, usedCategories } from '@/lib/blog/db';
import {
  BLOG_FALLBACK_COVER,
  blogDateLong,
  blogToday,
  type BlogPostInput,
} from '@/lib/blog/types';
import { vxnRegionList } from '@/lib/region';

export const metadata: Metadata = {
  title: 'Edit post — Valunxt Admin',
  robots: 'noindex, nofollow',
};

/** A blank post: published today, in the sitemap, with the standard cover. */
const NEW_POST: BlogPostInput = {
  title: '',
  slug: '',
  category: '',
  excerpt: '',
  body: '',
  cover_image: BLOG_FALLBACK_COVER,
  cover_alt: '',
  author: '',
  author_role: '',
  status: 'draft',
  featured: 0,
  in_sitemap: 1,
  published_at: '',
  meta_title: '',
  meta_description: '',
  meta_keywords: '',
  og_image: '',
};

/** Every market publishes /blogs/, so a post has an address in each. */
const MARKETS: BlogEditorMarket[] = vxnRegionList().map((r) => ({
  region: r.slug,
  label: r.short ?? r.name,
}));

export default async function BlogEditPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; new?: string }>;
}) {
  const user = await currentUser();
  if (!user) redirect(adminUrl(''));

  const sp = await searchParams;
  const isNew = sp.new !== undefined;
  const id = Number(sp.id ?? 0);

  let form: BlogPostInput = { ...NEW_POST, published_at: blogToday() };
  let updatedAt = '';

  if (!isNew) {
    let post: Awaited<ReturnType<typeof postById>> = null;
    let failed = false;
    try {
      post = id > 0 ? await postById(id) : null;
    } catch {
      failed = true;
    }
    if (!post) {
      // A render cannot set the flash cookie (see lib/admin/session.ts), so the
      // reason travels to the list screen in the URL instead.
      redirect(adminUrl('blogs') + '?missing=' + (failed ? 'db' : 'post'));
    }
    updatedAt = post.updated_at;
    form = {
      title: post.title,
      slug: post.slug,
      category: post.category,
      excerpt: post.excerpt,
      body: post.body,
      cover_image: post.cover_image,
      cover_alt: post.cover_alt,
      author: post.author,
      author_role: post.author_role,
      status: post.status,
      featured: post.featured,
      in_sitemap: post.in_sitemap,
      published_at: post.published_at,
      meta_title: post.meta_title,
      meta_description: post.meta_description,
      meta_keywords: post.meta_keywords,
      og_image: post.og_image,
    };
  }

  const flash = await takeFlash();
  const csrf = await csrfToken();
  const site = await seoSiteUrl();
  let categories: string[] = [];
  try {
    categories = await usedCategories();
  } catch {
    /* the standard list is enough to work with */
  }

  return (
    <AdminShell active="blogs" user={user}>
      <div className="page-head">
        <div className="crumbs">
          Home <span className="sep">/</span>{' '}
          <a href={adminUrl('blogs')} style={{ color: 'inherit' }}>
            Blog &amp; Insights
          </a>{' '}
          <span className="sep">/</span> {isNew ? 'New Post' : 'Edit'}
        </div>
        <h1>{isNew ? 'New Post' : 'Edit: ' + form.title}</h1>
        <p className="head-meta">
          {isNew ? (
            'Write the article, set its address and its search-engine metadata, then publish it. It appears on /blogs/ in every market.'
          ) : (
            <>
              <span>
                {form.status === 'published'
                  ? `Published ${blogDateLong(form.published_at) || 'without a date'}`
                  : 'Draft — not on the website'}
              </span>
              {updatedAt ? (
                <span>
                  <Icon name="clock" size={14} /> Last saved {updatedAt.replace('T', ' ').slice(0, 16)}
                </span>
              ) : null}
            </>
          )}
        </p>
      </div>

      <FlashOk key={'ok' + flash.id} message={flash.ok ?? ''} />
      <FlashErr key={'err' + flash.id} message={flash.err ?? ''} />

      <BlogEditor
        isNew={isNew}
        id={id}
        csrf={csrf}
        site={site}
        initial={form}
        markets={MARKETS}
        categories={categories}
      />
    </AdminShell>
  );
}
