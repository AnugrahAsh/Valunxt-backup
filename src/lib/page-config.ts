/**
 * The per-page declaration every template carried as `$PAGE` in the PHP build.
 *
 * Nothing here is new: the field names, the values and their meaning are
 * exactly what each index.php declared. Typing it means a page can no longer
 * quietly omit the stylesheet list or the body class that its Elementor markup
 * depends on.
 */
export interface PageConfig {
  /** <title>, before the CMS row (if any) overrides it. */
  title: string;
  /** meta description, before the CMS row overrides it. */
  desc?: string;
  /** og:image, relative to the site root. */
  og_image?: string;
  /** The full class list WordPress put on <body>; the theme CSS keys off it. */
  body: string;
  /** Elementor per-post stylesheets: /assets/content/uploads/elementor/css/post-<id>.css */
  post_css: string[];
  /**
   * Stylesheets written for this conversion rather than captured from
   * WordPress, as site-root paths (e.g. '/assets/css/valunxt-uae-sub.css').
   *
   * HeadAssets emits them LAST — after the theme, Elementor, brand and landing
   * sheets — so a page that carries one can style itself with plain selectors
   * instead of out-specifying the theme. Page-scoped by convention: everything
   * in such a sheet should sit under one root class belonging to that page.
   */
  site_css?: string[];
  /** Which captured Elementor header template to render ('139' | '3134' | '3837' | 'none'). */
  header: string;
  /** '2094' | '3425' | 'uae' | 'none'. Since 20260911 every value but 'none'
   *  renders the same footer, FooterUae, in both markets; the ids are kept so
   *  no config had to change. */
  footer: string;
  /** True on templates that render their own full-bleed shell (no #page wrapper). */
  canvas?: boolean;
  /** The WordPress post id, echoed into elementorFrontendConfig. */
  post_id: number;
  /** URL-encoded post title, echoed into elementorFrontendConfig. */
  post_title?: string;
  post_excerpt?: string;
  /** Paths whose nav item should be marked current. */
  active_nav?: string[];
  /** Extra <style> the page carried inline; {{BASE}} is substituted. */
  inline_css?: string;
  /** Shared page-hero partial inputs. */
  hero_title?: string;
  hero_subtitle?: string;
  hero_image?: string;
  /** The page's own (unprefixed) path, e.g. '/services/'. */
  path: string;
  /**
   * The markets that publish this page, when not every market does — the UAE
   * services section, for one. Left unset, the page is in every edition. The
   * hreflang alternates read it, so a UAE-only page no longer names an India
   * URL that answers 404.
   */
  regions?: string[];
  /** Only pages outside the CMS set this (the 404 template). */
  robots?: string;
}
