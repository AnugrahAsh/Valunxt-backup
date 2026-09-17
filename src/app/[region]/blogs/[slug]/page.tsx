/**
 * A published blog article.
 *
 * One route serves every post, from its `vx_posts` row: the copy, the byline
 * (its `vx_authors` profile), and everything the imported panel managed for
 * search — meta title and description, canonical, robots, Open Graph and X
 * cards, the FAQ and any JSON-LD blocks. An article is live the moment it is
 * saved and gone the moment it is deleted. The page itself — the dark hero, the
 * two-column body and the sticky sidebar — is unchanged.
 */
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import PageShell from '@/components/layout/PageShell';
import BlogArticleSection, { type Article } from '@/components/sections/BlogArticleSection';
import JsonLd, { faqPageSchema, schemaTypes } from '@/components/seo/JsonLd';
import { authorById, blogByline, blogCoverSrc, publishedPostBySlug, relatedCards } from '@/lib/blog/db';
import { blogDateLong, blogFaq, blogSchemaBlocks, type BlogAuthor, type BlogPost } from '@/lib/blog/types';
import { blogArticleConfig } from '@/lib/pages';
import type { PageConfig } from '@/lib/page-config';
import { rurl, vxnRegion } from '@/lib/region';
import { buildMetadata, vxnRequestOrigin } from '@/lib/seo';

type Params = { params: Promise<{ region: string; slug: string }> };

/** The row's declaration: the shared article config with its own title on top. */
function toPageConfig(post: BlogPost): PageConfig {
  const description = post.meta_desc.trim() || post.excerpt.trim();
  return blogArticleConfig(post.slug, {
    title: post.meta_title.trim() || `${post.title} | Valunxt`,
    desc: description,
    og_image: post.og_image.trim() || blogCoverSrc(post.cover) || undefined,
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

/** 'YYYY-MM-DD HH:MM:SS' (UTC) → ISO 8601. */
function iso(stamp: string): string | undefined {
  return /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(stamp) ? stamp.replace(' ', 'T') + 'Z' : undefined;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { region, slug } = await params;
  const post = await load(slug);
  if (!post) return {};
  const page = toPageConfig(post);
  return buildMetadata(page, vxnRegion(region), {
    title: page.title,
    description: page.desc,
    canonical: post.canonical,
    robots: post.robots,
    keywords: post.keywords,
    og_title: post.og_title,
    og_description: post.og_desc,
    og_image: post.og_image || blogCoverSrc(post.cover),
    og_type: 'article',
    twitter_card: post.tw_card === 'summary' ? 'summary' : 'summary_large_image',
    twitter_title: post.tw_title,
    twitter_description: post.tw_desc,
    twitter_image: post.tw_image,
    published_time: iso(post.published_at),
    modified_time: iso(post.updated_at),
  });
}

/**
 * The structured data every article publishes: its own article document and a
 * breadcrumb trail, generated from the row — unless a JSON-LD block the editors
 * attached already declares that type, as most imported posts' blocks do — then
 * the FAQ and the attached blocks themselves.
 */
async function structuredData(post: BlogPost, author: BlogAuthor | null, region: string): Promise<Array<string | object | null>> {
  const origin = await vxnRequestOrigin();
  const url = post.canonical.trim() || origin + rurl(region, `/blogs/${post.slug}/`);
  const custom = blogSchemaBlocks(post.schema_jsonld);
  const declared = new Set(custom.flatMap((b) => schemaTypes(b)));
  const byline = blogByline(post, author);
  const image = post.og_image || blogCoverSrc(post.cover);

  const article =
    declared.has(post.schema_type) || declared.has('BlogPosting') || declared.has('Article')
      ? null
      : {
          '@context': 'https://schema.org',
          '@type': post.schema_type || 'BlogPosting',
          headline: post.title,
          description: post.meta_desc || post.excerpt,
          url,
          mainEntityOfPage: url,
          image: /^https?:/i.test(image) ? image : origin + image,
          datePublished: iso(post.published_at),
          dateModified: iso(post.updated_at),
          ...(post.keywords ? { keywords: post.keywords } : {}),
          articleSection: post.cat,
          author: { '@type': author ? 'Person' : 'Organization', name: byline.name },
          publisher: { '@type': 'Organization', name: 'Valunxt', url: origin + rurl(region, '/') },
        };

  const breadcrumb = declared.has('BreadcrumbList')
    ? null
    : {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: origin + rurl(region, '/') },
          { '@type': 'ListItem', position: 2, name: 'Insights', item: origin + rurl(region, '/blogs/') },
          { '@type': 'ListItem', position: 3, name: post.title, item: url },
        ],
      };

  const faq = declared.has('FAQPage') ? null : faqPageSchema(blogFaq(post.faq_json));
  return [article, breadcrumb, faq, ...custom];
}

export default async function BlogPostPage({ params }: Params) {
  const { region: raw, slug } = await params;
  const region = vxnRegion(raw);
  const post = await load(slug);
  if (!post) notFound();

  const page = toPageConfig(post);
  let author: BlogAuthor | null = null;
  let related: Awaited<ReturnType<typeof relatedCards>> = [];
  try {
    [author, related] = await Promise.all([authorById(post.author_id), relatedCards(post.slug, 3)]);
  } catch {
    // The byline and the rail are extras; the article still renders without them.
  }
  const byline = blogByline(post, author);

  const article: Article = {
    slug: post.slug,
    title: post.title,
    category: post.cat || undefined,
    lede: post.excerpt.trim() || undefined,
    hero_image: blogCoverSrc(post.cover),
    hero_alt: post.cover_alt,
    author: byline.name,
    author_role: byline.role,
    author_avatar: byline.avatar,
    author_bio: author?.bio.trim() || undefined,
    body: post.body_html,
    read_time: `${post.read_mins} min read`,
    date: blogDateLong(post.published_at) || undefined,
    date_iso: post.published_at.slice(0, 10) || undefined,
    topics: post.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean),
    faq: blogFaq(post.faq_json),
  };

  return (
    <PageShell page={page} region={region}>
      <JsonLd blocks={await structuredData(post, author, region)} />
      <BlogArticleSection article={article} page={page} region={region} related={related} />
    </PageShell>
  );
}
