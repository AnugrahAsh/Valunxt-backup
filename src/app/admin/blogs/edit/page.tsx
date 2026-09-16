/**
 * Admin — Blog & Insights editor.
 *
 * Handles both writing a new post (?new=1) and editing an existing one (?id=N).
 * The post is a `vx_posts` row; its author choices are the `vx_authors`
 * profiles. Everything else is the editor component.
 */
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

import AdminShell from '@/components/admin/AdminShell';
import BlogEditor, { type BlogEditorMarket } from '@/components/admin/BlogEditor';
import { FlashErr, FlashOk } from '@/components/admin/Flash';
import Icon from '@/components/admin/Icon';
import { adminUrl } from '@/lib/admin/config';
import { dbStamp, formatDateTime } from '@/lib/admin/format';
import { csrfToken, currentUser, takeFlash } from '@/lib/admin/session';
import { seoSiteUrl } from '@/lib/admin/seo-lib';
import { allAuthors, blogCoverSrc, postById, usedCategories } from '@/lib/blog/db';
import { blogDateLong, blogToday, type BlogAuthor, type BlogPostInput } from '@/lib/blog/types';
import { vxnRegionList } from '@/lib/region';

export const metadata: Metadata = {
  title: 'Edit post — Valunxt Admin',
  robots: 'noindex, nofollow',
};

/** A blank post: a draft, in the sitemap, filed under Insights. */
const NEW_POST: BlogPostInput = {
  slug: '',
  title: '',
  excerpt: '',
  body_html: '',
  cover: '',
  cover_alt: '',
  cat: 'Insights',
  tags: '',
  status: 'draft',
  in_sitemap: 1,
  featured: 0,
  meta_title: '',
  meta_desc: '',
  keywords: '',
  focus_kw: '',
  schema_type: 'BlogPosting',
  faq_json: '',
  schema_jsonld: '',
  og_image: '',
  og_title: '',
  og_desc: '',
  tw_card: 'summary_large_image',
  tw_title: '',
  tw_desc: '',
  tw_image: '',
  canonical: '',
  robots: 'index, follow',
  author: '',
  author_id: null,
  author_role: '',
  read_mins: 1,
  published_at: '',
};

/** Every market publishes /blogs/, so a post has an address in each. */
const MARKETS: BlogEditorMarket[] = vxnRegionList().map((r) => ({ region: r.slug, label: r.short ?? r.name }));

export default async function BlogEditPage({ searchParams }: { searchParams: Promise<{ id?: string; new?: string }> }) {
  const user = await currentUser();
  if (!user) redirect(adminUrl(''));

  const sp = await searchParams;
  const isNew = sp.new !== undefined;
  const id = Number(sp.id ?? 0);

  let form: BlogPostInput = NEW_POST;
  let publishDate = blogToday();
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
    const { id: _id, created_at: _c, updated_at, seo_score: _s, ...input } = post;
    form = input;
    publishDate = post.published_at.slice(0, 10);
    updatedAt = updated_at;
  }

  const flash = await takeFlash();
  const csrf = await csrfToken();
  const site = await seoSiteUrl();
  let categories: string[] = [];
  let authors: BlogAuthor[] = [];
  try {
    [categories, authors] = await Promise.all([usedCategories(), allAuthors()]);
  } catch {
    /* the standard lists are enough to work with */
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
                  <Icon name="clock" size={14} /> Last saved {formatDateTime(dbStamp(updatedAt))}
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
        publishDate={publishDate}
        markets={MARKETS}
        categories={categories}
        authors={authors.map((a) => ({ id: a.id, name: a.name, title: a.title }))}
        coverMissing={form.cover.trim() !== '' && blogCoverSrc(form.cover) !== form.cover.trim()}
      />
    </AdminShell>
  );
}
