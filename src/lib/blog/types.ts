/**
 * The blog post record, shared by the admin panel and the public site.
 *
 * A post is a row of `vx_posts` — the table the www.valunxt.com panel kept its
 * articles in — and its author a row of `vx_authors`. Field names are the
 * table's own.
 *
 * Pure and isomorphic on purpose: the editor is a client component and needs
 * the same shape, the same slug rule and the same validation the Server Action
 * applies, so a field can never be accepted in one place and rejected in the
 * other. Everything that touches MySQL lives in lib/blog/db.ts.
 */

/** Editorial status. A draft is invisible to the public site. */
export const BLOG_STATUSES = ['published', 'draft'] as const;
export type BlogStatus = (typeof BLOG_STATUSES)[number];

/** The categories the imported articles use, then the desks of the launch posts. */
export const BLOG_CATEGORIES = [
  'Accounting',
  'Corporate Tax',
  'VAT',
  'News',
  'Real Estate Wealth',
  'Capital Advisory',
  'Research & Intelligence',
  'Technology & AI',
  'Insights',
] as const;

/** The structured-data types an article can publish as (vx_posts.schema_type). */
export const BLOG_SCHEMA_TYPES = [
  ['BlogPosting', 'Blog post (BlogPosting)'],
  ['Article', 'Article'],
  ['NewsArticle', 'News article (NewsArticle)'],
  ['TechArticle', 'Guide (TechArticle)'],
] as const;

export const BLOG_ROBOTS = ['index, follow', 'noindex, follow', 'index, nofollow', 'noindex, nofollow'] as const;

export const BLOG_TWITTER_CARDS = ['summary_large_image', 'summary'] as const;

/** The cover image used when a post has none (and when its file is missing). */
export const BLOG_FALLBACK_COVER = '/assets/content/uploads/blogs/blog-1.webp';

/** The byline a post falls back to. */
export const BLOG_DEFAULT_AUTHOR = 'Valunxt';
export const BLOG_DEFAULT_AUTHOR_ROLE = 'Insights & Analysis Desk';

/** One row of `vx_posts`, as the application reads it: no nulls. */
export interface BlogPost {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  body_html: string;
  cover: string;
  cover_alt: string;
  cat: string;
  /** Comma-separated. */
  tags: string;
  status: BlogStatus;
  in_sitemap: number;
  featured: number;
  seo_score: number;
  meta_title: string;
  meta_desc: string;
  keywords: string;
  focus_kw: string;
  schema_type: string;
  /** JSON array of { q, a }. */
  faq_json: string;
  /** JSON array of JSON-LD documents, each a string. */
  schema_jsonld: string;
  og_image: string;
  og_title: string;
  og_desc: string;
  tw_card: string;
  tw_title: string;
  tw_desc: string;
  tw_image: string;
  canonical: string;
  robots: string;
  /** The byline as the row stores it, kept in step with the author's name. */
  author: string;
  author_id: number | null;
  /** A per-post byline role, over the author's own title. */
  author_role: string;
  read_mins: number;
  created_at: string;
  updated_at: string;
  /** 'YYYY-MM-DD HH:MM:SS' (UTC), or '' for a post never given a date. */
  published_at: string;
}

/** The fields the editor submits; the rest are derived or kept. */
export type BlogPostInput = Omit<BlogPost, 'id' | 'created_at' | 'updated_at' | 'seo_score'>;

/** One row of `vx_authors`. */
export interface BlogAuthor {
  id: number;
  name: string;
  slug: string;
  title: string;
  bio: string;
  avatar: string;
  email: string;
  linkedin: string;
}

/** A post as the public listing and the related-posts rail need it. */
export interface BlogCard {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  cover_image: string;
  cover_alt: string;
  /** 'July 28, 2026' */
  date: string;
  /** '2026-07-28' */
  date_iso: string;
  featured: number;
}

export interface FaqItem {
  q: string;
  a: string;
}

/* ---- Slugs --------------------------------------------------------------- */

/**
 * Turn a title into a URL-safe slug — one segment, no nesting: a post is
 * always published at /blogs/<slug>/.
 */
export function blogSlugify(value: string): string {
  return String(value ?? '')
    .toLowerCase()
    .replace(/\s*[|–—-]\s*valunxt.*$/i, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 190);
}

/* ---- Dates --------------------------------------------------------------- */

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

/**
 * '2026-07-28…' → 'July 28, 2026', the stamp the cards and the article show.
 *
 * Formatted from the string's own parts rather than through Date: a value read
 * as '2026-07-28' and parsed as UTC prints as the 27th anywhere west of
 * Greenwich, which is how a published date drifts by a day.
 */
export function blogDateLong(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(iso ?? ''));
  if (!m) return '';
  const month = MONTHS[Number(m[2]) - 1];
  return month ? `${month} ${Number(m[3])}, ${m[1]}` : '';
}

/** Today as 'YYYY-MM-DD' in UTC — the default publish date of a new post. */
export function blogToday(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Keep a date input's value if it is a real 'YYYY-MM-DD', else ''. */
export function blogNormalizeDate(value: string): string {
  const v = String(value ?? '').trim().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return '';
  const [y, m, d] = v.split('-').map(Number);
  if (m < 1 || m > 12 || d < 1 || d > 31) return '';
  const probe = new Date(Date.UTC(y, m - 1, d));
  return probe.getUTCMonth() === m - 1 && probe.getUTCDate() === d ? v : '';
}

/* ---- Derived text -------------------------------------------------------- */

/** The article body as plain text — for word counts and excerpt suggestions. */
export function blogPlainText(html: string): string {
  return String(html ?? '')
    .replace(/<\/(p|h[1-6]|li|div|blockquote|td|th)>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&#8217;|&#8216;/g, '’')
    .replace(/&#8220;|&#8221;/g, '"')
    .replace(/&#8212;/g, '—')
    .replace(/&amp;/gi, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Minutes to read at 200 words a minute — what vx_posts.read_mins stores. */
export function blogReadMinutes(html: string): number {
  const words = blogPlainText(html).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.min(255, Math.round(words / 200)));
}

/** '5 min read'. */
export function blogReadTime(html: string): string {
  return `${blogReadMinutes(html)} min read`;
}

/** The meta title a post falls back to when the field is left blank. */
export function blogAutoMetaTitle(title: string): string {
  const t = String(title ?? '').trim();
  return t ? `${t} | Valunxt` : 'Valunxt';
}

/* ---- Structured fields --------------------------------------------------- */

/** The FAQ pairs of a post. Malformed JSON reads as no FAQ. */
export function blogFaq(raw: string): FaqItem[] {
  if (!String(raw ?? '').trim()) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((f) => ({ q: String(f?.q ?? '').trim(), a: String(f?.a ?? '').trim() }))
      .filter((f) => f.q && f.a);
  } catch {
    return [];
  }
}

/** The custom JSON-LD blocks of a post, each a JSON document as text. */
export function blogSchemaBlocks(raw: string): string[] {
  if (!String(raw ?? '').trim()) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.map((b) => (typeof b === 'string' ? b : JSON.stringify(b))).filter((b) => b.trim());
    }
    return [JSON.stringify(parsed)];
  } catch {
    return [String(raw)];
  }
}

/* ---- Validation ---------------------------------------------------------- */

export const BLOG_LIMITS = {
  title: 255,
  slug: 190,
  cat: 80,
  tags: 500,
  excerpt: 1000,
  cover: 255,
  cover_alt: 255,
  author_role: 160,
  meta_title: 255,
  meta_desc: 320,
  keywords: 500,
  focus_kw: 190,
  og_title: 255,
  og_desc: 320,
  og_image: 255,
  tw_title: 255,
  tw_desc: 320,
  tw_image: 255,
  canonical: 255,
} as const;

export type BlogErrors = Partial<Record<keyof BlogPostInput | 'general' | 'schema', string>>;

const URLISH = /^(https?:\/\/|\/)[^\s]*$/i;

/**
 * Everything that can be judged without the database. The Server Action adds
 * the checks that need it — the slug's uniqueness and the author's existence.
 */
export function validateBlogPost(v: BlogPostInput, publishDate = ''): BlogErrors {
  const errors: BlogErrors = {};

  const title = v.title.trim();
  if (title === '') errors.title = 'A post title is required.';
  else if (title.length > BLOG_LIMITS.title) errors.title = `Keep the title under ${BLOG_LIMITS.title} characters.`;

  if (blogSlugify(v.slug) === '') errors.slug = 'A URL slug is required — use letters, numbers and hyphens.';

  if (blogPlainText(v.body_html) === '') errors.body_html = 'Write the article before saving it.';

  if (v.excerpt.trim().length > BLOG_LIMITS.excerpt)
    errors.excerpt = `Keep the excerpt under ${BLOG_LIMITS.excerpt} characters.`;

  if (publishDate !== '' && blogNormalizeDate(publishDate) === '') {
    errors.published_at = 'Enter the publish date as a real calendar date.';
  } else if (v.status === 'published' && v.published_at === '') {
    errors.published_at = 'A published post needs a publish date.';
  }

  const lengths: Array<[keyof typeof BLOG_LIMITS & keyof BlogPostInput, string]> = [
    ['cat', 'category'],
    ['tags', 'tag list'],
    ['meta_title', 'meta title'],
    ['meta_desc', 'meta description'],
    ['keywords', 'keyword list'],
    ['focus_kw', 'focus keyword'],
    ['og_title', 'social title'],
    ['og_desc', 'social description'],
    ['tw_title', 'X (Twitter) title'],
    ['tw_desc', 'X (Twitter) description'],
    ['author_role', 'byline role'],
  ];
  for (const [field, label] of lengths) {
    if (String(v[field] ?? '').length > BLOG_LIMITS[field]) {
      errors[field] = `Keep the ${label} under ${BLOG_LIMITS[field]} characters.`;
    }
  }

  for (const field of ['cover', 'og_image', 'tw_image'] as const) {
    const url = v[field].trim();
    if (url !== '' && !URLISH.test(url)) errors[field] = 'Enter a path beginning with / or a full https:// URL.';
  }
  if (v.canonical.trim() !== '' && !/^https?:\/\/[^\s]+$/i.test(v.canonical.trim())) {
    errors.canonical = 'Enter a full URL including https://, or leave this blank to use the post’s own address.';
  }

  for (const [i, block] of blogSchemaBlocks(v.schema_jsonld).entries()) {
    try {
      const parsed = JSON.parse(block);
      if (!parsed || typeof parsed !== 'object') throw new Error('not an object');
    } catch {
      errors.schema = `Schema block ${i + 1} is not valid JSON. Fix it or clear it.`;
      break;
    }
  }

  return errors;
}
