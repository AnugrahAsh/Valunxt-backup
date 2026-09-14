/**
 * PageConfigs for the UAE services section.
 *
 * Every other page has a hand-transcribed entry in data/page-configs.json,
 * because every other page was a real WordPress page with a real `$PAGE`
 * declaration behind it. These are not: the six UAE services and the twenty-nine
 * pages beneath them are new, they all render the same three sections, and the
 * only thing that differs between them is a name and a URL. Thirty-five
 * near-identical JSON blocks would be thirty-five places for one of them to
 * drift, so they are derived from vxnServices('en-ae') instead — the same
 * registry the header menu and the UAE home page already read.
 *
 * The shape is copied from the /community/ entry, which is the other
 * "hero image, coming soon, subscribe" page in the registry: header 3837,
 * footer 2094, and the 3752 (single page) + 4557 (subscribe) stylesheets that
 * PageHeroSection needs (4557 is a no-op now the subscribe band is gone).
 */
import type { PageConfig } from './page-config';
import { vxnServiceName, type Service, type SubService } from './region';

/** Elementor template ids these pages' sections were captured from. */
const POST_CSS = ['5', '3837', '2094', '3752', '4557'];

/**
 * A stable post id per path. WordPress ids identify the captured stylesheets a
 * page loads; these pages have no captured CSS of their own, but the id still
 * lands in the `<body>` class and the Elementor config, so it has to be stable
 * across renders and distinct between pages. Same derivation as the CMS
 * catch-all, in the same 9000+ band that is reserved for pages with no WordPress
 * row behind them.
 */
function postId(path: string): number {
  let h = 0;
  for (let i = 0; i < path.length; i += 1) h = (h * 31 + path.charCodeAt(i)) | 0;
  return 9000 + (Math.abs(h) % 900);
}

function bodyClass(id: number): string {
  return (
    `wp-singular page-template-default page page-id-${id} wp-custom-logo wp-embed-responsive ` +
    'wp-theme-execor full header-layout-logo-menu has-page-header no-middle-header responsive-layout ' +
    'vamtam-is-elementor elementor-active elementor-pro-active vamtam-font-smoothing layout-full ' +
    `elementor-default elementor-kit-5 elementor-page elementor-page-${id} elementor-page-3752`
  );
}

function config({
  name,
  path,
  heroImage,
  desc,
  written = false,
  extraCss = [],
  siteCss = [],
}: {
  name: string;
  path: string;
  heroImage: string;
  desc: string;
  /** True once the page has a body of its own rather than the coming-soon one. */
  written?: boolean;
  /** Captured stylesheets this one page needs on top of POST_CSS. */
  extraCss?: string[];
  /** Stylesheets written for this page by hand; see `site_css` on PageConfig. */
  siteCss?: string[];
}): PageConfig {
  const id = postId(path);
  const title = `${name} | VALUNXT`;
  /* NOTE: the UAE type system is NOT applied here. It is applied once, in
     resolveRequest — the only resolution the root layout actually renders from.
     See the note on uaeType() in lib/pages.ts. */
  return {
    title,
    desc,
    og_image: '/assets/content/uploads/2025/03/valunxt-og.png',
    body: bodyClass(id),
    post_css: [...POST_CSS, ...extraCss],
    site_css: siteCss,
    header: '3837',
    /* The UAE home page's footer, not the shared 2094 one. Every page under
       /en-ae/services/ is a UAE page, so they all take the market's own
       footer — see FooterUae, which /en-ae/ already selects the same way. */
    footer: 'uae',
    canvas: false,
    post_id: id,
    post_title: encodeURIComponent(title),
    post_excerpt: desc,
    /* Marks "Services" on the bar, so a visitor deep in the section still sees
       where they are. The sub-pages point at the same parent for the same
       reason — there is no menu item of their own to light up. */
    active_nav: ['/services/'],
    inline_css: '',
    hero_title: name,
    hero_image: heroImage,
    path,
    /* Nothing to index while the page says "coming soon": the URLs are live so
       they can be linked and reviewed, not so they can be ranked. A written page
       has something to say, so it indexes like any other. */
    robots: written ? undefined : 'noindex, follow',
  };
}

/**
 * Stylesheets every service page needs beyond the shared five.
 *
 * The service template carries the "Find the Right Solution" tab block, which
 * is the home page's section reused verbatim — so it needs the home page's
 * own captured stylesheet (17) and the blur-background template inside it
 * (7162), exactly as the home page does for the same block. Both are scoped under .elementor-17 / .elementor-7162, so they reach
 * nothing outside the markup that asks for them.
 *
 * This was keyed by slug while only Accounting & Tax rendered the block —
 * post-17.css is 250KB and the other five had no use for it. All six render
 * the template now (see components/pages/uae-services/index.ts), so all six
 * load it. The sub-pages do not: they are not on the template.
 */
const SERVICE_EXTRA_CSS = ['17', '7162'];

/** The page at /services/<service>/. */
export function uaeServiceConfig(service: Service, written = false): PageConfig {
  const name = vxnServiceName(service);
  return config({
    name,
    path: `/services/${service.slug}/`,
    heroImage: service.img,
    extraCss: SERVICE_EXTRA_CSS,
    desc: written
      ? `${name} in the UAE from VALUNXT.`
      : `${name} in the UAE from VALUNXT — coming soon.`,
    written,
  });
}

/**
 * The sub-service template's stylesheet, loaded by every page beneath a
 * service.
 *
 * A hand-written sheet under public/assets/css/, not captured Elementor CSS —
 * see `site_css` on PageConfig for where it lands in the cascade. It is scoped
 * to the template's root class, `.abk-root`, and was the Accounting &
 * Bookkeeping page's own sheet until every sub-service took that page's UI;
 * it was keyed by `<service slug>/<sub slug>` then, and all thirty-three
 * pages load it now. Bump the query when it changes.
 */
const SUB_SITE_CSS = ['/assets/css/valunxt-uae-sub.css?v=10'];

/** The page at /services/<service>/<sub>/. */
export function uaeSubServiceConfig(
  service: Service,
  sub: SubService,
  written = false,
): PageConfig {
  return config({
    name: sub.name,
    path: `/services/${service.slug}/${sub.slug}/`,
    /* The sub-pages borrow the parent's image for the shared hero band. A
       written page sets its own artwork in its body and never reads this. */
    heroImage: service.img,
    desc: written
      ? `${sub.name} — part of ${vxnServiceName(service)} at VALUNXT.`
      : `${sub.name} — part of ${vxnServiceName(service)} at VALUNXT. Coming soon.`,
    written,
    siteCss: SUB_SITE_CSS,
  });
}
