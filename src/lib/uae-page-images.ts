/**
 * Every UAE interior page's own images (client instruction, 20260914).
 *
 * The About, Industries, Network, Insights and Contact pages and everything
 * beneath them are captured Elementor bodies shared with the India edition, and
 * their pictures arrive four different ways: the --vxn-hero-img variable, the
 * inline style of a simple hero, Elementor container backgrounds in captured
 * CSS, and static <img> tags. This module gives the UAE edition its own image
 * for each of those slots WITHOUT touching India:
 *
 *   - one file convention: public/assets/content/uploads/uae/pages/<id>.webp
 *   - uaePageImage(region, id, fallback) for <img> tags and inline styles
 *   - uaePageImageCss(region, path) for the hero variable and container
 *     backgrounds, emitted by PageShell
 *
 * A slot only changes when its file exists AND the page is being served for
 * en-ae; otherwise the page renders exactly as before. Branded group-company
 * artwork (Reliant Surveyors, HouzzHunt, HouzzHunt Mortgage, VALUNXT Corporate
 * and the VALUNXT office banner) is deliberately not listed, so it never changes.
 *
 * Server only: existence checks read the filesystem.
 */
import { publicFileExists } from './public-files';
import { BASE, vxnRegion } from './region';

/** Where the UAE page images live, under uploads/. */
export const UAE_PAGE_IMAGE_DIR = 'uae/pages';

function fileFor(id: string): string {
  return `${UAE_PAGE_IMAGE_DIR}/${id}.webp`;
}

function exists(rel: string): boolean {
  return publicFileExists(`assets/content/uploads/${rel}`);
}

/** The page's image for `id` on the UAE edition, or `fallback` everywhere else. */
export function uaePageImage(region: string, id: string, fallback: string): string {
  if (vxnRegion(region) !== 'en-ae') return fallback;
  const rel = fileFor(id);
  return exists(rel) ? `${BASE}/assets/content/uploads/${rel}` : fallback;
}

/** "/about/careers/" -> "about/careers": the id prefix for a page's slots. */
export function uaePageKey(pagePath: string | undefined): string {
  return String(pagePath ?? '').replace(/^\/+|\/+$/g, '');
}

/**
 * Captured Elementor container backgrounds, per page path. `selector` is the
 * element as the captured CSS targets it; both the element and its motion
 * layer are overridden, as the captured sheets do. Branded containers are
 * omitted on purpose.
 */
export const UAE_PAGE_BACKGROUNDS: Record<string, { id: string; selector: string }[]> = {
  '/about/': [
    { id: 'about/story', selector: '.elementor-258 .elementor-element.elementor-element-dffdb84' },
    { id: 'about/closing', selector: '.elementor-258 .elementor-element.elementor-element-46476c1' },
  ],
  '/about/careers/': [
    { id: 'about/careers/intro', selector: '.elementor-268 .elementor-element.elementor-element-cd90497' },
    { id: 'about/careers/card', selector: '.elementor-268 .elementor-element.elementor-element-7d7674e' },
  ],
  '/clients/': [
    { id: 'clients/panel-1', selector: '.elementor-248 .elementor-element.elementor-element-ae003e2' },
    { id: 'clients/panel-2', selector: '.elementor-248 .elementor-element.elementor-element-f9a35b6' },
    { id: 'clients/panel-3', selector: '.elementor-248 .elementor-element.elementor-element-33b4d28' },
    { id: 'clients/panel-4', selector: '.elementor-248 .elementor-element.elementor-element-cee6c01' },
  ],
  '/partnership/': [
    { id: 'partnership/panel-1', selector: '.elementor-2281 .elementor-element.elementor-element-577ba48b' },
    { id: 'partnership/panel-2', selector: '.elementor-2281 .elementor-element.elementor-element-302da00' },
    { id: 'partnership/band', selector: '.elementor-2281 .elementor-element.elementor-element-d279756' },
  ],
  '/our-group/reliant-surveyors/': [
    { id: 'our-group/reliant-surveyors/contact-band', selector: '.elementor-17 .elementor-element.elementor-element-76d6fd8' },
  ],
  '/our-group/houzzhunt/': [
    { id: 'our-group/houzzhunt/video-band', selector: '.elementor-248 .elementor-element.elementor-element-c1904cb' },
  ],
  '/our-group/houzzhunt-mortgage/': [
    { id: 'our-group/houzzhunt-mortgage/panel', selector: '.elementor-252 .elementor-element.elementor-element-1a75c5fa' },
    { id: 'our-group/houzzhunt-mortgage/band', selector: '.elementor-17 .elementor-element.elementor-element-611b40a' },
    { id: 'our-group/houzzhunt-mortgage/contact-band', selector: '.elementor-17 .elementor-element.elementor-element-76d6fd8' },
  ],
  '/our-group/valunxt-corporate-services/': [
    /* The "Find the Right Solution" tab panes (20260914, client instruction). */
    { id: 'our-group/valunxt-corporate-services/solution-1', selector: '.elementor-17 .elementor-element.elementor-element-aa3aa17' },
    { id: 'our-group/valunxt-corporate-services/solution-2', selector: '.elementor-17 .elementor-element.elementor-element-b12020e' },
    { id: 'our-group/valunxt-corporate-services/solution-3', selector: '.elementor-17 .elementor-element.elementor-element-9106445' },
    { id: 'our-group/valunxt-corporate-services/band', selector: '.elementor-17 .elementor-element.elementor-element-79f93d1' },
    { id: 'our-group/valunxt-corporate-services/video-band', selector: '.elementor-248 .elementor-element.elementor-element-c1904cb' },
  ],
};

/**
 * Pages whose hero is a group company's own branded banner. Their hero is
 * never overridden, whatever files exist.
 */
const BRANDED_HEROES = new Set([
  '/our-group/reliant-surveyors/',
  '/our-group/houzzhunt/',
  '/our-group/houzzhunt-mortgage/',
  '/our-group/valunxt-corporate-services/',
]);

/**
 * The page-scoped stylesheet for the UAE edition: the hero variable (on body
 * and on the hero element, so a modifier class that sets it there cannot win)
 * and every listed container background whose file exists. `html body` plus
 * !important outranks the captured inline_css, valunxt-brand.css and the
 * bodies' own page-scoped override blocks. Empty string when nothing applies.
 */
export function uaePageImageCss(region: string, pagePath: string | undefined): string {
  if (vxnRegion(region) !== 'en-ae' || !pagePath) return '';
  const rules: string[] = [];
  const key = uaePageKey(pagePath);
  if (key && !BRANDED_HEROES.has(pagePath)) {
    const hero = fileFor(`${key}/hero`);
    if (exists(hero)) {
      const url = `url("${BASE}/assets/content/uploads/${hero}")`;
      rules.push(`html body,html body .elementor-element.elementor-element-c4d353f,html body .elementor-element.elementor-element-d726ecf{--vxn-hero-img:${url}!important}`);
    }
  }
  for (const { id, selector } of UAE_PAGE_BACKGROUNDS[pagePath] ?? []) {
    const rel = fileFor(id);
    if (!exists(rel)) continue;
    const url = `url("${BASE}/assets/content/uploads/${rel}")`;
    rules.push(
      `html body ${selector}:not(.elementor-motion-effects-element-type-background),` +
        `html body ${selector}>.elementor-motion-effects-container>.elementor-motion-effects-layer` +
        `{background-image:${url}!important}`,
    );
  }
  return rules.join('\n');
}
