/**
 * The UAE typography opt-ins.
 *
 * Two sheets, two helpers, one mechanism. Each helper does two things that only
 * make sense together:
 *
 *   1. appends its stylesheet to the page's `site_css`, which HeadAssets emits
 *      LAST — after the theme, Elementor, the brand sheet and any per-page
 *      sheet, which is what lets it win;
 *   2. adds its class to the body class, which is the hook every selector in
 *      that file is scoped to.
 *
 * Miss (1) and nothing loads. Miss (2) and it loads and matches nothing. Doing
 * both from one function is the point.
 *
 * THE TWO SHEETS, and why they are two:
 *
 *   withUaeFace   valunxt-uae-face.css   Sanomat Sans, and only the family.
 *                                        EVERY page under /en-ae/, including the
 *                                        404 fallback and the real estate module.
 *   withUaeType   valunxt-uae-type.css   The type scale — sizes, weights, line
 *                                        heights. The market home page and the
 *                                        services section, as it always was.
 *                                        Loads the face too, because a scale
 *                                        with no face would be theme fonts at
 *                                        UAE sizes, which nobody asked for.
 *
 * They were one sheet until 20260910. The client then asked for the whole
 * market to change face — About, Contact, Blogs, Industries and the rest — with
 * every size, weight and line height left exactly as it was. Widening the one
 * sheet would have put those pages on the scale as well; splitting the family
 * out is what lets the face travel alone. See lib/pages.ts for where each is
 * applied.
 *
 * The append order matters. `site_css` is emitted in array order, and these
 * sheets have to come after a page's own — /accounting-bookkeeping/ carries
 * one, and a family declared there would otherwise outlive this.
 */
import type { PageConfig } from './page-config';

/** Bump the query when a sheet changes; they are served with a long cache. */
export const UAE_FACE_CSS = '/assets/css/valunxt-uae-face.css?v=2';
export const UAE_TYPE_CSS = '/assets/css/valunxt-uae-type.css?v=6';

/** The classes every selector in those stylesheets is scoped to. */
export const UAE_FACE_CLASS = 'vxn-uae-face';
export const UAE_TYPE_CLASS = 'vxn-uae-type';

/**
 * The two cuts every UAE page draws before anything else — the body and all
 * six heading levels — preloaded by HeadAssets so the first paint is not a
 * flash of the theme's face. The other seven cuts load when first asked for.
 * The paths mirror the @font-face block in valunxt-uae-face.css; a CSS file
 * cannot import this constant, so a rename has to land in both places.
 */
export const UAE_FACE_PRELOAD = [
  '/sanomat-sans/Sanomat%20SansRegular.otf',
  '/sanomat-sans/Sanomat%20SansMedium.otf',
];

/**
 * A page with one sheet and its class applied. Idempotent: calling it twice on
 * one config is a no-op, so a route that decorates a config the factory already
 * decorated cannot double up the stylesheet link or the class.
 */
function decorate(page: PageConfig, sheet: string, cls: string): PageConfig {
  const sheets = page.site_css ?? [];
  const body = page.body ?? '';
  const hasSheet = sheets.includes(sheet);
  const hasClass = body.split(/\s+/).includes(cls);
  if (hasSheet && hasClass) return page;

  return {
    ...page,
    site_css: hasSheet ? sheets : [...sheets, sheet],
    body: hasClass ? body : `${body} ${cls}`.trim(),
  };
}

/**
 * The page in the face. THE FACE IS SITE-WIDE since 20260914, on client
 * instruction: Sanomat Sans on every page in both markets, the services and
 * sub-services included. The region argument stays so every caller reads as
 * before; it no longer gates anything here. The SCALE below is still the
 * UAE's alone.
 */
export function withUaeFace(page: PageConfig, region: string): PageConfig {
  void region;
  return decorate(page, UAE_FACE_CSS, UAE_FACE_CLASS);
}

/** The page on the UAE type scale — face included — or, outside en-ae, the face alone. */
export function withUaeType(page: PageConfig, region: string): PageConfig {
  const faced = withUaeFace(page, region);
  if (region !== 'en-ae') return faced;
  return decorate(faced, UAE_TYPE_CSS, UAE_TYPE_CLASS);
}
