/**
 * Every page the website publishes, market by market.
 *
 * The admin panel lists these under Page SEO, keeps one `vx_page_seo` row for
 * each, and builds sitemap.xml from them. They are derived from the registries
 * the routes themselves answer from — the page registry, the UAE services
 * registry and its written bodies — so a page added in code shows
 * up here without being declared a second time, and a page taken out of the
 * code drops out of the panel and the sitemap with it.
 *
 * Until 20260915 the panel read the page registry alone. It knew nothing of
 * the UAE services section (six services, thirty-three pages beneath them),
 * and it kept listing — and publishing in the sitemap — pages the site had
 * dropped (location, our-group/…, the old real-estate-wealth-advisory).
 *
 * KEYS are the ones the front-end SEO map is keyed by (see lib/seo.ts):
 *
 *   ''                      the India home (the legacy root row)
 *   'en-ae'                 the UAE home
 *   'about'                 a page both markets publish at /<market>/about/
 *   'en-ae/services/…'      a page only the UAE publishes
 *
 * DELIBERATELY ABSENT: the 404 template; pages that answer 404 until their data
 * file is filled in (about/leadership, track-record); the real estate module
 * under /<market>/real-estate/, which is published unlinked and kept out of the
 * sitemap until the practice launches (src/real-estate/lib/seo.ts); and the
 * blog articles at /blogs/<slug>/, which are rows in `vx_posts` rather than
 * pages in the code — the Blog & Insights screen manages them, and the sitemap
 * reads them straight from the table (lib/admin/seo-lib.ts).
 */
import 'server-only';
import crypto from 'node:crypto';

import rawConfigs from '@/data/page-configs.json';
import LEADERSHIP from '@/data/leadership';
import TRACK_RECORD from '@/data/track-record';
import { uaeServiceIsWritten, uaeSubServiceBody } from '@/components/pages/uae-services';
import type { PageConfig } from './page-config';
import {
  vxnRegionData,
  vxnRegionList,
  vxnServiceName,
  vxnServices,
  type RegionSlug,
} from './region';
import { uaeServiceConfig, uaeSubServiceConfig } from './uae-service-pages';

export type SiteSection = 'Home' | 'Pages' | 'Insights' | 'Research' | 'Services' | 'UAE Services';

/** The order sections are listed in. */
export const SITE_SECTIONS: SiteSection[] = ['Home', 'Pages', 'Insights', 'Research', 'Services', 'UAE Services'];

/** How a section is labelled beneath a page's name in the panel. */
export function sectionLabel(section: SiteSection): string {
  return section === 'Home' ? 'Market home' : section;
}

export interface SitePage {
  /** The CMS / SEO-map key (see the header). */
  slug: string;
  /** The address inside a market: '/about/', '/' for a home. */
  path: string;
  /** The markets that publish it. */
  regions: RegionSlug[];
  /** The page's name in the panel. */
  name: string;
  section: SiteSection;
  /** What the page itself declares, before any CMS value overrides it. */
  title: string;
  desc: string;
  robots: string;
  /** Sitemap defaults for a new row. */
  priority: string;
  changefreq: string;
}

const CONFIGS = rawConfigs as unknown as Record<string, PageConfig>;
const REGION_SLUGS = vxnRegionList().map((r) => r.slug);

/** "About | Valunxt" → "About" */
function nameFrom(title: string): string {
  return String(title).replace(/\s*\|\s*Valunxt.*$/iu, '').trim();
}

/** Priority by depth, as the panel has always defaulted it. */
function sitemapDefaults(path: string): { priority: string; changefreq: string } {
  const depth = path.split('/').filter(Boolean).length;
  if (depth === 0) return { priority: '1.0', changefreq: 'weekly' };
  if (depth === 1) return { priority: '0.8', changefreq: 'monthly' };
  if (depth === 2) return { priority: '0.6', changefreq: 'monthly' };
  return { priority: '0.5', changefreq: 'monthly' };
}

/** Registry pages that answer 404 until their data file is filled in — the test their routes make. */
function unpublishedPlaceholder(slug: string): boolean {
  if (slug === 'about/leadership') return LEADERSHIP.length === 0;
  if (slug === 'track-record') return TRACK_RECORD.metrics.length === 0;
  return false;
}

function sectionFor(slug: string): SiteSection {
  const first = slug.split('/')[0];
  if (first === 'blogs') return 'Insights';
  if (first === 'research') return 'Research';
  if (first === 'services') return 'Services';
  return 'Pages';
}

function page(
  slug: string,
  path: string,
  regions: RegionSlug[],
  section: SiteSection,
  cfg: PageConfig,
  name = nameFrom(cfg.title),
): SitePage {
  return {
    slug,
    path,
    regions,
    name,
    section,
    title: cfg.title,
    desc: cfg.desc ?? '',
    robots: cfg.robots ?? 'index, follow',
    ...sitemapDefaults(path),
  };
}

function build(): SitePage[] {
  /* The UAE services section, in registry order: each service, then the pages
     beneath it. Built first, because a registry page at the same address is
     not what the UAE publishes there (/services/research-intelligence/). */
  const uae: SitePage[] = [];
  for (const service of vxnServices('en-ae')) {
    if (!service.slug) continue;
    const cfg = uaeServiceConfig(service, uaeServiceIsWritten(service.slug));
    uae.push(page(`en-ae/services/${service.slug}`, cfg.path, ['en-ae'], 'UAE Services', cfg, vxnServiceName(service)));
    for (const sub of service.subs ?? []) {
      const subCfg = uaeSubServiceConfig(service, sub, !!uaeSubServiceBody(service.slug, sub.slug));
      uae.push(
        page(`en-ae/services/${service.slug}/${sub.slug}`, subCfg.path, ['en-ae'], 'UAE Services', subCfg, sub.name),
      );
    }
  }
  const uaePaths = new Set(uae.map((p) => p.path));

  /* The market homes. India's row keeps the legacy '' key the SEO map has
     always used for it; every other market is keyed by its own slug. */
  const homes: SitePage[] = [];
  for (const r of vxnRegionList()) {
    const cfg = CONFIGS[`/${r.slug}/`];
    if (!cfg) continue;
    const india = r.slug === 'en-in';
    homes.push(page(india ? '' : r.slug, '/', [r.slug], 'Home', cfg, india ? 'Home' : `${vxnRegionData(r.slug).short ?? vxnRegionData(r.slug).name} Home`));
  }

  /* Every other registry page, published in every market — less a market that
     publishes a page of its own at the same address. */
  const shared: SitePage[] = [];
  for (const [key, cfg] of Object.entries(CONFIGS)) {
    const slug = key.replace(/^\/+|\/+$/g, '');
    if (slug === '' || slug === '404' || (REGION_SLUGS as string[]).includes(slug)) continue;
    if (unpublishedPlaceholder(slug)) continue;
    const path = `/${slug}/`;
    const regions = REGION_SLUGS.filter((r) => !(r === 'en-ae' && uaePaths.has(path)));
    if (regions.length) shared.push(page(slug, path, regions, sectionFor(slug), cfg));
  }
  const rank = (s: SiteSection) => SITE_SECTIONS.indexOf(s);
  shared.sort((a, b) => rank(a.section) - rank(b.section) || a.path.localeCompare(b.path));

  return [...homes, ...shared, ...uae];
}

let cache: SitePage[] | null = null;
let bySlug: Map<string, SitePage> | null = null;

/** Every published page, homes first, the UAE services section last. */
export function sitePages(): SitePage[] {
  if (!cache) cache = build();
  return cache;
}

/** The page behind a CMS key, or undefined. */
export function sitePageBySlug(slug: string): SitePage | undefined {
  if (!bySlug) bySlug = new Map(sitePages().map((p) => [p.slug, p]));
  return bySlug.get(String(slug));
}

/** Position in sitePages(), for ordering rows the way the site is organised. */
export function sitePageRank(slug: string): number {
  const i = sitePages().findIndex((p) => p.slug === slug);
  return i === -1 ? Number.MAX_SAFE_INTEGER : i;
}

/**
 * A fingerprint of the published set — which pages, in which markets, with
 * which default directive. The panel stores it and syncs its rows when it moves.
 */
export function sitePagesFingerprint(): string {
  const text = sitePages()
    .map((p) => `${p.slug}|${p.regions.join(',')}|${p.robots}`)
    .join('\n');
  return crypto.createHash('sha1').update(text).digest('hex');
}

/** '/en-ae' + '/about/' — a page's address in one market, from the site root. */
export function marketPath(region: string, path: string): string {
  return `/${region}${path.startsWith('/') ? path : '/' + path}`;
}

/**
 * Addresses a CMS-created page may not take: anything a built-in route already
 * answers, and the first segments whose routes would answer before the CMS
 * catch-all could (a /blogs/<x>/ that is not an article 404s in blogs/[slug]).
 */
const RESERVED_ROOTS = new Set<string>([
  ...REGION_SLUGS,
  'admin',
  'form-handler',
  'blogs',
  'research',
  'services',
  'real-estate',
]);

export function reservedCmsSlug(slug: string): boolean {
  const clean = String(slug).replace(/^\/+|\/+$/g, '');
  if (clean === '') return true;
  if (RESERVED_ROOTS.has(clean.split('/')[0])) return true;
  return Boolean(CONFIGS[`/${clean}/`]) || sitePages().some((p) => p.path === `/${clean}/`);
}
