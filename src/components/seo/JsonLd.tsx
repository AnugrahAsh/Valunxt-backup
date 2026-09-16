/**
 * Structured data, as <script type="application/ld+json"> tags.
 *
 * The admin panel stores JSON-LD as text (the imported www.valunxt.com panel
 * kept each block as a JSON document in a string), so what reaches here is
 * already JSON. It is parsed once to make sure it is, and to escape `<` so a
 * value containing "</script>" cannot end the tag early.
 */
import type { PageConfig } from '@/lib/page-config';
import { vxnSeoStructuredData } from '@/lib/seo';

export type FaqPair = { q: string; a: string };

/** A JSON-LD block as safe script text, or null when it is not valid JSON. */
function scriptText(block: string | object): string | null {
  try {
    const value = typeof block === 'string' ? JSON.parse(block) : block;
    if (!value || typeof value !== 'object') return null;
    return JSON.stringify(value).replace(/</g, '\\u003c');
  } catch {
    return null;
  }
}

/** The FAQPage document for a list of question and answer pairs. */
export function faqPageSchema(faq: FaqPair[]): object | null {
  const items = faq.filter((f) => f.q.trim() && f.a.trim());
  if (!items.length) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((f) => ({
      '@type': 'Question',
      name: f.q.trim(),
      acceptedAnswer: { '@type': 'Answer', text: f.a.trim() },
    })),
  };
}

/** Every @type a JSON-LD document declares, @graph members included. */
export function schemaTypes(block: string | object): string[] {
  let value: unknown;
  try {
    value = typeof block === 'string' ? JSON.parse(block) : block;
  } catch {
    return [];
  }
  const out: string[] = [];
  const visit = (node: unknown) => {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) return node.forEach(visit);
    const obj = node as Record<string, unknown>;
    const t = obj['@type'];
    if (typeof t === 'string') out.push(t);
    else if (Array.isArray(t)) out.push(...t.filter((x): x is string => typeof x === 'string'));
    if (Array.isArray(obj['@graph'])) (obj['@graph'] as unknown[]).forEach(visit);
  };
  visit(value);
  return out;
}

export default function JsonLd({ blocks }: { blocks: Array<string | object | null | undefined> }) {
  const texts = blocks.map((b) => (b ? scriptText(b) : null)).filter((t): t is string => t !== null);
  if (!texts.length) return null;
  return (
    <>
      {texts.map((text, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: text }} />
      ))}
    </>
  );
}

/** A page's admin-managed structured data: its JSON-LD blocks and FAQ. */
export function PageStructuredData({ page, region }: { page: PageConfig; region: string }) {
  const { schema, faq } = vxnSeoStructuredData(page, region);
  const hasFaqBlock = schema.some((b) => schemaTypes(b).includes('FAQPage'));
  return <JsonLd blocks={[...schema, hasFaqBlock ? null : faqPageSchema(faq ?? [])]} />;
}
