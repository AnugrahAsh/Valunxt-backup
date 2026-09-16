/**
 * Page metadata for the module, kept out of the route files.
 *
 * Standalone, this built its own hreflang pair for /ae-en/ and /ae-ar/. Inside
 * this site the module's pages are ordinary pages of the site, so they carry the
 * same tag set every other page carries — canonical against the request origin,
 * one hreflang alternate per published market plus x-default, Open Graph and
 * Twitter — assembled here from the site's own SEO helpers rather than from a
 * second, parallel implementation.
 *
 * The one thing they deliberately do NOT do is appear in src/lib/site-pages.ts.
 * That list is what the admin panel manages and what the sitemap is generated
 * from, and this section is published unlinked for now: reachable by typing the
 * URL, absent from the navigation and absent from the sitemap. Add the pillar and
 * its services there when the practice is ready to be advertised, and the panel
 * and the sitemap pick them up.
 */
import type { Metadata } from 'next';

import { vxnRegionData, vxnRegionList, rswap } from '@/lib/region';
import { vxnRequestOrigin } from '@/lib/seo';
import { SERVICE_PAGES } from '../data/pages';
import { BASE as MODULE_BASE } from './routes';
import type { Locale } from './types';

/** og:image for the section — a real photograph, per page where there is one. */
const PILLAR_IMAGE = '/real-estate/img/hero-poster.webp';

const PILLAR_TITLE = 'Dubai Real Estate — Buy, Sell, Rent & Off-Plan | Valunxt';
const PILLAR_DESC =
  "Discover Dubai's most sought-after properties through expert advisory, curated " +
  'opportunities, and strategic guidance tailored to your ambitions.';

/**
 * The shared shape. `path` is relative to the module root ('/' or '/<slug>/'),
 * so hreflang can be built by swapping the market on one path rather than by
 * restating every URL.
 */
async function build({
  region,
  path,
  title,
  description,
  image,
}: {
  region: Locale;
  path: string;
  title: string;
  description: string;
  image: string;
}): Promise<Metadata> {
  const origin = await vxnRequestOrigin();
  /* Unprefixed, the way every page declares its own path. rswap() puts a market
     in front of it, which is both the canonical for this edition and each
     hreflang alternate — one path, swapped, rather than a list to keep in step. */
  const modulePath = `${MODULE_BASE}${path}`;
  const canonical = origin + rswap(region, modulePath);

  const languages: Record<string, string> = {};
  for (const r of vxnRegionList()) {
    languages[r.lang] = origin + rswap(r.slug, modulePath);
  }
  /* The gateway, which forwards a visitor to their own edition — the same
     x-default the rest of the site publishes. */
  languages['x-default'] = `${origin}/`;

  return {
    title,
    description,
    alternates: { canonical, languages },
    openGraph: {
      locale: vxnRegionData(region).lang.replace('-', '_'),
      type: 'website',
      title,
      description,
      url: canonical,
      siteName: 'Valunxt',
      images: [{ url: image }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  };
}

export function pillarMetadata(region: Locale): Promise<Metadata> {
  return build({
    region,
    path: '/',
    title: PILLAR_TITLE,
    description: PILLAR_DESC,
    image: PILLAR_IMAGE,
  });
}

export async function serviceMetadata(region: Locale, slug: string): Promise<Metadata> {
  const page = SERVICE_PAGES[slug];
  /* An unknown slug 404s in the route; metadata just declines to guess. */
  if (!page) return {};

  return build({
    region,
    path: `/${slug}/`,
    title: `${page.eyebrow} in Dubai | Valunxt`,
    description: page.lede,
    image: page.heroImg || PILLAR_IMAGE,
  });
}
