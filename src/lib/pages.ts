/**
 * The page registry.
 *
 * Every page's `$PAGE` declaration from the PHP build, transcribed into
 * src/data/page-configs.json and keyed by its unprefixed path. Two things read
 * it: the page itself (for its stylesheets, body class and SEO), and the root
 * layout — which has to put the WordPress body class on `<body>` and therefore
 * needs to resolve a page from a URL rather than from a route param.
 *
 * `/en-in/` and `/en-ae/` are the two market home pages and keep their own
 * entries; every other key is a shared page rendered under whichever market the
 * visitor is in.
 */
import rawConfigs from '@/data/page-configs.json';
import type { PageConfig } from './page-config';
import { withUaeFace, withUaeType } from './uae-typography';
import { vxnRegion, vxnRegionExists, vxnServiceBySlug, vxnSubService } from './region';
import { uaeServiceConfig, uaeSubServiceConfig } from './uae-service-pages';

type RawConfigs = Record<string, PageConfig & Record<string, unknown>>;

const CONFIGS = rawConfigs as unknown as RawConfigs;

/** Normalise any URL path to the "/x/y/" form used as a registry key. */
export function normalisePath(p: string): string {
  const clean = String(p ?? '/').split('?')[0].split('#')[0];
  const trimmed = clean.replace(/^\/+|\/+$/g, '');
  return trimmed === '' ? '/' : `/${trimmed}/`;
}

/** The declaration for an unprefixed page path, or null. */
export function pageConfig(path: string): PageConfig | null {
  return CONFIGS[normalisePath(path)] ?? null;
}

/** Same, but throws rather than returning null — for pages that must exist. */
export function requirePageConfig(path: string): PageConfig {
  const c = pageConfig(path);
  if (!c) throw new Error(`No page config registered for ${path}`);
  return c;
}

/** Extra per-page fields the research report detail pages carry. */
export interface ReportPageConfig extends PageConfig {
  report_type: string;
  crumbs: Record<string, string>;
  topics: string[];
  intro: string;
  takeaways: string[];
  pdf: string;
}

export function reportConfig(path: string): ReportPageConfig {
  return requirePageConfig(path) as ReportPageConfig;
}

/**
 * The UAE services pages, which are derived from vxnServices() rather than
 * declared in the registry — see lib/uae-service-pages.ts for why.
 *
 * They have to be resolvable from a bare URL, not just from their route. The
 * root layout asks resolveRequest() which page a request is for and emits that
 * page's stylesheets into <head>; a page the registry has never heard of got
 * the 404 fallback's three, so the breadcrumb hero (post-3752) and the
 * subscribe block (post-4557) both rendered unstyled. Deriving them here means
 * the head and the route agree on one config rather than two.
 *
 * Matches /services/<service>/ and /services/<service>/<sub>/ only — the
 * /services/ index itself is a registry page in both markets.
 */
function derivedPage(region: string, rest: string): PageConfig | null {
  if (region !== 'en-ae') return null;

  const parts = rest.split('/').filter(Boolean);
  if (parts[0] !== 'services' || parts.length < 2 || parts.length > 3) return null;

  const service = vxnServiceBySlug(parts[1], region);
  if (!service) return null;
  if (parts.length === 2) return uaeServiceConfig(service);

  const sub = vxnSubService(service, parts[2]);
  return sub ? uaeSubServiceConfig(service, sub) : null;
}

/**
 * Resolve a full request path (region prefix included) to the page that answers
 * it, plus the market it was requested in.
 *
 * "/en-ae/services/" → { region: 'en-ae', page: <the shared /services/ page> }
 * "/en-ae/"          → { region: 'en-ae', page: <the UAE home> }
 */
export function resolveRequest(path: string): { region: string; page: PageConfig | null } {
  const norm = normalisePath(path);
  const first = norm.split('/')[1] ?? '';

  if (vxnRegionExists(first)) {
    const rest = norm.slice(first.length + 1) || '/';
    // A market home is its own page, not the shared root.
    if (rest === '/') {
      return { region: first, page: uaeType(CONFIGS[`/${first}/`] ?? null, first, rest) };
    }
    /* Derived pages are tried first: /services/research-intelligence/ has a
       registry entry for India, and the UAE publishes a different page at the
       same path. */
    const page = derivedPage(first, rest) ?? CONFIGS[rest] ?? null;
    return { region: first, page: uaeType(page, first, rest) };
  }

  return { region: vxnRegion(null), page: CONFIGS[norm] ?? null };
}

/**
 * The UAE type system, applied in the ONE place that decides what the document
 * actually gets.
 *
 * It has to be here rather than in the page factories. The root layout renders
 * `<head>` and `<body class>` from its OWN call to resolveRequest, not from the
 * config a route hands its body — so a page factory that decorated its copy
 * changed nothing a browser could see. Measured: with the decoration in
 * definePage and defineHome, /en-ae/services/accounting-tax-services/ picked
 * the stylesheet up (its config is derived, and derivedPage runs here) while
 * /en-ae/ and /en-ae/services/capital-advisory/ did not.
 *
 * TWO SCOPES. The FACE — Sanomat Sans — goes on every page in the market, by
 * client instruction (20260910), and since 20260914 on every India page too. The SCALE — the sizes, weights and line
 * heights in valunxt-uae-type.css — stays on the market home page and the
 * services section, which is what was asked for when it was built, and the
 * same instruction said to leave every size, weight and line height as it is.
 * About, Contact, Blogs and the rest therefore change face and nothing else.
 *
 * The 404 fallback and the real estate module do not pass through here; the
 * root layout gives them the face itself.
 */
function uaeType(page: PageConfig | null, region: string, rest: string): PageConfig | null {
  if (!page) return page;
  /* The face goes on every page in every market (20260914); the scale stays
     on the UAE home and services, which withUaeType itself enforces. */
  if (region !== 'en-ae') return withUaeFace(page, region);
  if (rest !== '/' && !rest.startsWith('/services/')) return withUaeFace(page, region);
  return withUaeType(page, region);
}

/** Every registered path — used to sanity-check the route tree. */
export function allPagePaths(): string[] {
  return Object.keys(CONFIGS);
}
