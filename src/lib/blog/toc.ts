/**
 * "In this article" — built from an article's own `<h2>` headings.
 *
 * The imported body_html carries no heading ids (the CMS that generated the
 * reference layout injected them at render time, not in the stored HTML), so
 * this does the same: slugify each top-level heading's text into an id, write
 * it onto the heading in the returned markup, and hand back the matching list
 * for the sticky rail's nav. Regex over trusted, authored HTML — the same
 * approach blogPlainText() already takes.
 */

export interface TocEntry {
  id: string;
  text: string;
}

function stripTags(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#8217;|&#8216;/g, '’')
    .replace(/&#8220;|&#8221;/g, '"')
    .replace(/&#8212;/g, '—')
    .replace(/\s+/g, ' ')
    .trim();
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

/**
 * Injects an `id` onto every `<h2>` and returns the TOC those headings make.
 * A heading that already carries an id keeps it. Ids are de-duplicated so two
 * same-worded headings do not collide.
 */
export function blogToc(html: string): { html: string; toc: TocEntry[] } {
  const toc: TocEntry[] = [];
  const seen = new Map<string, number>();

  const out = String(html ?? '').replace(/<h2(\s[^>]*)?>([\s\S]*?)<\/h2>/gi, (match, attrs = '', inner: string) => {
    const text = stripTags(inner);
    if (!text) return match;

    const existing = /\bid="([^"]*)"/.exec(attrs);
    let id = existing?.[1] || slugify(text) || 'section';
    const n = seen.get(id) ?? 0;
    seen.set(id, n + 1);
    if (n > 0) id = `${id}-${n + 1}`;

    toc.push({ id, text });
    const rest = String(attrs).replace(/\s*\bid="[^"]*"/i, '');
    return `<h2${rest} id="${id}">${inner}</h2>`;
  });

  return { html: out, toc };
}
