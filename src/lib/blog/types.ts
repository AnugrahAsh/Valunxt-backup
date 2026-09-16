/**
 * The blog post record, shared by the admin panel and the public site.
 *
 * Pure and isomorphic on purpose: the editor is a client component and needs
 * the same shape, the same slug rule and the same validation the Server Action
 * applies, so a field can never be accepted in one place and rejected in the
 * other. Everything that touches MySQL lives in lib/blog/db.ts.
 */

/** Editorial status. A draft is invisible to the public site. */
export const BLOG_STATUSES = ['published', 'draft'] as const;
export type BlogStatus = (typeof BLOG_STATUSES)[number];

/** The desks posts are filed under — the categories the four launch posts used. */
export const BLOG_CATEGORIES = [
  'Real Estate Wealth',
  'Capital Advisory',
  'Research & Intelligence',
  'Technology & AI',
  'Market Insights',
] as const;

/** The cover image used when a post is saved without one. */
export const BLOG_FALLBACK_COVER = '/assets/content/uploads/blogs/blog-1.webp';

/** The byline a post falls back to, as the launch posts carried it. */
export const BLOG_DEFAULT_AUTHOR = 'Valunxt Research Team';
export const BLOG_DEFAULT_AUTHOR_ROLE = 'Insights & Analysis Desk';

/** One row of `blog_posts`, as the application reads it. */
export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  body: string;
  cover_image: string;
  cover_alt: string;
  author: string;
  author_role: string;
  status: BlogStatus;
  featured: number;
  in_sitemap: number;
  /** 'YYYY-MM-DD'. Empty until a post is given a publish date. */
  published_at: string;
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  og_image: string;
  created_at: string;
  updated_at: string;
}

/** The fields the editor submits; everything else is derived or kept. */
export type BlogPostInput = Omit<BlogPost, 'id' | 'created_at' | 'updated_at'>;

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

/* ---- Slugs --------------------------------------------------------------- */

/**
 * Turn a title into a URL-safe slug — one segment, no nesting: a post is
 * always published at /blogs/<slug>/.
 *
 * Mirrors seoSlugifySegment() in lib/admin/seo-lib.ts, less the '/' handling,
 * so a blog slug and a page slug are made the same way.
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
 * '2026-07-28' → 'July 28, 2026', the stamp the cards and the article have
 * always shown.
 *
 * Formatted from the string's own parts rather than through Date: a DATE column
 * read as '2026-07-28' and parsed as UTC prints as the 27th anywhere west of
 * Greenwich, which is how a published date drifts by a day.
 */
export function blogDateLong(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(iso ?? ''));
  if (!m) return '';
  const month = MONTHS[Number(m[2]) - 1];
  return month ? `${month} ${Number(m[3])}, ${m[1]}` : '';
}

/** Today as 'YYYY-MM-DD' in local time — the default publish date of a new post. */
export function blogToday(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
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
    .replace(/<\/(p|h[1-6]|li|div|blockquote)>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&#8217;|&#8216;/g, '’')
    .replace(/&#8220;|&#8221;/g, '"')
    .replace(/&#8212;/g, '—')
    .replace(/&amp;/gi, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

/** '5 min read', at the 200 words-per-minute the article page has always used. */
export function blogReadTime(html: string): string {
  const words = blogPlainText(html).split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.round(words / 200))} min read`;
}

/** The meta title a post falls back to when the field is left blank. */
export function blogAutoMetaTitle(title: string): string {
  const t = String(title ?? '').trim();
  return t ? `${t} | Valunxt` : 'Valunxt';
}

/* ---- Validation ---------------------------------------------------------- */

export const BLOG_LIMITS = {
  title: 200,
  slug: 190,
  category: 120,
  excerpt: 500,
  cover_image: 255,
  cover_alt: 255,
  author: 160,
  author_role: 160,
  meta_title: 255,
  meta_description: 500,
  meta_keywords: 500,
  og_image: 255,
} as const;

export type BlogErrors = Partial<Record<keyof BlogPostInput | 'general', string>>;

/**
 * Everything that can be judged without the database. The Server Action adds
 * the one check that needs it — whether the slug is already taken.
 */
export function validateBlogPost(v: BlogPostInput): BlogErrors {
  const errors: BlogErrors = {};

  const title = v.title.trim();
  if (title === '') errors.title = 'A post title is required.';
  else if (title.length > BLOG_LIMITS.title)
    errors.title = `Keep the title under ${BLOG_LIMITS.title} characters.`;

  if (blogSlugify(v.slug) === '')
    errors.slug = 'A URL slug is required — use letters, numbers and hyphens.';

  if (blogPlainText(v.body) === '') errors.body = 'Write the article before saving it.';

  if (v.excerpt.trim().length > BLOG_LIMITS.excerpt)
    errors.excerpt = `Keep the excerpt under ${BLOG_LIMITS.excerpt} characters.`;

  if (v.published_at !== '' && blogNormalizeDate(v.published_at) === '') {
    errors.published_at = 'Enter the publish date as a real calendar date.';
  } else if (v.status === 'published' && v.published_at === '') {
    errors.published_at = 'A published post needs a publish date.';
  }

  if (v.meta_title.length > BLOG_LIMITS.meta_title)
    errors.meta_title = `Keep the meta title under ${BLOG_LIMITS.meta_title} characters.`;
  if (v.meta_description.length > BLOG_LIMITS.meta_description)
    errors.meta_description = `Keep the meta description under ${BLOG_LIMITS.meta_description} characters.`;
  if (v.meta_keywords.length > BLOG_LIMITS.meta_keywords)
    errors.meta_keywords = `Keep the keyword list under ${BLOG_LIMITS.meta_keywords} characters.`;

  for (const field of ['cover_image', 'og_image'] as const) {
    const url = v[field].trim();
    if (url !== '' && !/^(https?:\/\/|\/)/i.test(url)) {
      errors[field] = 'Enter a path beginning with / or a full https:// URL.';
    }
  }

  return errors;
}
