/**
 * A published blog article.
 *
 * One route serves every post. The copy used to live in src/data/articles.ts
 * and its declaration in src/data/page-configs.json; both are now the row the
 * admin panel writes, so an article is live the moment it is saved and gone the
 * moment it is deleted. The page itself — the dark hero, the two-column body
 * and the sticky sidebar — is unchanged.
 */
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import PageShell from '@/components/layout/PageShell';
import BlogArticleSection, { type Article } from '@/components/sections/BlogArticleSection';
import { blogAuthor, publishedPostBySlug, relatedCards } from '@/lib/blog/db';
import { blogDateLong, blogReadTime, type BlogPost } from '@/lib/blog/types';
import { blogArticleConfig } from '@/lib/pages';
import type { PageConfig } from '@/lib/page-config';
import { buildMetadata } from '@/lib/seo';
import { vxnRegion } from '@/lib/region';

type Params = { params: Promise<{ region: string; slug: string }> };

/** The row as the article layout reads it. */
function toArticle(post: BlogPost): Article {
  const author = blogAuthor(post);
  return {
    slug: post.slug,
    title: post.title,
    category: post.category || undefined,
    hero_image: post.cover_image || undefined,
    author: author.name,
    author_role: author.role,
    body: post.body,
    read_time: blogReadTime(post.body),
    date: blogDateLong(post.published_at) || undefined,
    date_iso: post.published_at || undefined,
  };
}

/** The row's declaration: the shared article config with its own SEO on top. */
function toPageConfig(post: BlogPost): PageConfig {
  const description = post.meta_description.trim() || post.excerpt.trim();
  return blogArticleConfig(post.slug, {
    title: post.meta_title.trim() || `${post.title} | Valunxt`,
    desc: description,
    og_image: post.og_image.trim() || post.cover_image || undefined,
    post_title: post.title,
    post_excerpt: description,
  });
}

/** The published post behind a slug, or null. A missing database is a 404. */
async function load(slug: string): Promise<BlogPost | null> {
  try {
    return await publishedPostBySlug(decodeURIComponent(slug));
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { region, slug } = await params;
  const post = await load(slug);
  if (!post) return {};
  return buildMetadata(toPageConfig(post), vxnRegion(region));
}

export default async function BlogPostPage({ params }: Params) {
  const { region: raw, slug } = await params;
  const region = vxnRegion(raw);
  const post = await load(slug);
  if (!post) notFound();

  const page = toPageConfig(post);
  let related: Awaited<ReturnType<typeof relatedCards>> = [];
  try {
    related = await relatedCards(post.slug, 3);
  } catch {
    // The rail is an extra; the article still renders without it.
  }

  return (
    <PageShell page={page} region={region}>
      <BlogArticleSection article={toArticle(post)} page={page} region={region} related={related} />
    </PageShell>
  );
}
