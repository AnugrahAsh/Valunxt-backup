/**
 * The document shell.
 *
 * `<html lang>`, `<body class>` and the whole `<head>` stylesheet block are all
 * per-page on this site — the lang comes from the visitor's edition, the body
 * class is the full WordPress class list the theme CSS keys off
 * (`body.elementor-page-264`, `body.responsive-layout`, …), and the Elementor
 * per-post stylesheets are listed by the page. Next.js only lets the root
 * layout render `<html>`, `<head>` and `<body>`, so it resolves the current page
 * itself from the request path that proxy.ts publishes as `x-vxn-path`.
 *
 * Keeping HeadAssets here rather than in the page matters: includes/head.php
 * interleaved `<link>` and `<style>` (post-*.css comes after the global inline
 * styles; valunxt-brand.css after both), and that interleaving is the cascade.
 * Rendered inside the real <head>, the order is byte-for-byte what PHP emitted.
 */
import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import Script from 'next/script';
import { headers } from 'next/headers';
import { vxnSeoOrigin } from '@/lib/seo';
import { BASE, vxnRegionData } from '@/lib/region';
import { blogArticleSlug, pageConfig, resolveRequest } from '@/lib/pages';
import { publishedPostExists } from '@/lib/blog/db';
import { UAE_FACE_CLASS, UAE_FACE_CSS, withUaeFace } from '@/lib/uae-typography';
import HeadAssets, { SiteFavicons } from '@/components/layout/HeadAssets';
import { PRELOADER_GATE_SCRIPT } from '@/components/layout/Preloader';
import SmoothScroll from '@/components/motion/SmoothScroll';
import { realEstateRequest } from '@/real-estate/lib/routes';
import type { PageConfig } from '@/lib/page-config';

export const metadata: Metadata = {
  metadataBase: new URL(vxnSeoOrigin()),
  title: 'Valunxt',
};

/* Elementor ships `.elementor-invisible { visibility: hidden }` and relies on
   JavaScript to remove the class once an element scrolls into view. On this
   conversion that reveal is reimplemented in SiteScripts — but until it runs,
   most of the copy on Services, About, Our Group and Clients is
   visibility:hidden. Anything that reads the page without executing our scripts
   (crawlers that skip JS, reader modes, a blocked or failed script) therefore
   saw only the handful of blocks that carry no entrance animation.

   PHP set this class from a script. Here it is rendered straight onto <html>:
   the outcome is identical — the <noscript> block below is what actually
   rescues a JS-less reader — and it keeps a script from editing an attribute
   React is about to hydrate. */
const HTML_CLASS = 'vxn-js';

const GTAG_INLINE = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());

        gtag('config', 'G-3LN0QDVS2F');
`;

/**
 * The body class a page created in the admin panel carries. It is the class
 * list the PHP scaffolder wrote, minus the per-post `elementor-page-<id>` hook
 * — no stylesheet defines a rule for an id that only exists in the CMS.
 */
const CMS_BODY_CLASS =
  'wp-singular page-template-default page wp-custom-logo wp-embed-responsive wp-theme-execor full ' +
  'header-layout-logo-menu has-page-header no-middle-header responsive-layout vamtam-is-elementor ' +
  'elementor-active elementor-pro-active vamtam-font-smoothing layout-full elementor-default ' +
  'elementor-kit-5 elementor-page elementor-page-3752';

/**
 * What head.php rendered for a URL with no page behind it — the 404 template.
 *
 * Read from the registry rather than restated here. It was restated, and it had
 * already drifted: the declaration lists the 404's own stylesheet (8623) and the
 * subscribe block's (4557, which NotFoundBody rendered until 20260914), and this copy listed
 * neither — so every 404 rendered the subscribe form unstyled. The literal below
 * is only a floor, so the layout can never throw on a missing registry entry.
 */
/**
 * The document reset the real estate section needs and nothing more.
 *
 * That section renders inside `.re-root`, and every rule in real-estate.css is
 * scoped under it — which is exactly why `body` itself is not covered. On the
 * rest of the site the Elementor cascade zeroes the body margin; here nothing
 * does, so the browser's default 8px would show as a white gutter down both
 * sides of every full-bleed section. The background matches `--re-page` so the
 * ground behind the module is the module's own, not white.
 */
const RE_DOCUMENT_CSS = `html,body{margin:0;padding:0;}body{background:#FCFBF8;}`;

const FALLBACK: PageConfig = pageConfig('/404/') ?? {
  title: 'Valunxt',
  body: '',
  post_css: ['5', '3837', '2094', '4557'],
  header: '3837',
  footer: '2094',
  post_id: 0,
  path: '/',
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const h = await headers();
  const path = h.get('x-vxn-path') ?? '/';
  const { region, page } = resolveRequest(path);

  // The admin panel is its own application: it has its own stylesheet and must
  // not load the site's Elementor cascade, analytics or body classes.
  if (path.startsWith('/admin')) {
    return (
      <html lang="en">
        <head>
          <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        </head>
        <body>{children}</body>
      </html>
    );
  }

  /* The real estate section, for the same reason and with one difference.
     It renders its own header and footer inside `.re-root`, and real-estate.css
     is self-contained — it needs none of the 53 Elementor stylesheets, the
     inline theme blocks or the WordPress body classes, and loading them only
     gives the host cascade something to reach in with. So it gets a lean head:
     the site's favicons, a body reset, and nothing else.

     Unlike /admin it IS a public page, so analytics still runs and the icons are
     still the site's — this is the same company, on the same domain.

     realEstateRequest() answers only for the pillar page and the eight published
     service slugs. An unknown slug under /real-estate/ therefore falls through
     to the branch below and 404s in the site's own chrome, styled. */
  const realEstate = realEstateRequest(path);
  if (realEstate) {
    /* The one thing from the host that does reach in: the UAE face, linked here
       for both markets. Until 20260917 that mattered — the module declared
       Forum and DM Sans for itself, right for /en-in/ and wrong under
       /en-ae/, where the whole site ran Sanomat Sans on client instruction.
       Both now say Inter (see the fonts note atop real-estate.css for the
       module's own copy), so the link is a belt-and-braces agreement rather
       than a correction. It names a family and nothing else, so the module's
       own sizes and weights stand either way. */
    return (
      <html lang={vxnRegionData(realEstate.region).lang}>
        <head>
          <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
          <SiteFavicons />
          <style dangerouslySetInnerHTML={{ __html: RE_DOCUMENT_CSS }} />
          {/* The face is site-wide since 20260914. */}
          <link rel="stylesheet" href={`${BASE}${UAE_FACE_CSS}`} media="all" />
        </head>
        <body className={UAE_FACE_CLASS}>
          {children}
          {/* Smooth inertia scrolling, as on the rest of the site. */}
          <SmoothScroll />
          {/* Google tag (gtag.js) — the same one the rest of the site runs. */}
          <Script src="https://www.googletagmanager.com/gtag/js?id=G-3LN0QDVS2F" strategy="afterInteractive" />
          <Script id="gtag-init" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: GTAG_INLINE }} />
        </body>
      </html>
    );
  }

  /* /blogs/<slug>/ resolves to the declaration every article shares, which
     resolveRequest can produce without a database. A slug with no published
     post behind it renders the 404 body instead, and that body wants the 404
     template's stylesheets — so the one thing the registry cannot answer is
     asked here, and nowhere else. */
  const article = blogArticleSlug(path);
  let resolved = page;
  if (article) {
    try {
      if (!(await publishedPostExists(article))) resolved = null;
    } catch {
      // No database: the route 404s too, so the 404 chrome is the right answer.
      resolved = null;
    }
  }

  /* A URL the registry has never heard of — a 404, or a page created in the
     admin panel — still renders in the market it was asked for, so under
     /en-ae/ it takes the UAE face like every registered page — and since
     20260914 so does every India page. withUaeFace is idempotent on a page
     resolveRequest has already decorated, so this line changes nothing else. The
     head keeps the 404 template's stylesheets and the body keeps the CMS class
     list, exactly as before. */
  const doc = withUaeFace(resolved ?? { ...FALLBACK, body: CMS_BODY_CLASS }, region);

  return (
    /* suppressHydrationWarning on both: the intro gate below adds a class to
       <html> before hydration, and jQuery, Elementor and the theme add classes
       and data attributes to <body> after it. Neither is React's to reconcile. */
    <html lang={vxnRegionData(region).lang} className={HTML_CLASS} suppressHydrationWarning>
      <head>
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <noscript>
          <style>{`.elementor-invisible{visibility:visible !important;}`}</style>
        </noscript>
        <HeadAssets page={doc} />
      </head>
      <body className={doc.body} suppressHydrationWarning>
        {/* The intro gate reads sessionStorage and must settle before the first
            paint, so it is the one script that runs ahead of hydration. It only
            touches <html>, which is why that element suppresses the warning. */}
        <Script
          id="vx-intro-gate"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: PRELOADER_GATE_SCRIPT }}
        />
        <div id="top" />
        {children}
        {/* Smooth inertia scrolling (Lenis) on every public page. The admin
            branch above returns before this, so the panel keeps the browser's
            own scroll: see components/motion/SmoothScroll.tsx. */}
        <SmoothScroll />
        {/* Google tag (gtag.js) — after hydration, like every other script. */}
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-3LN0QDVS2F" strategy="afterInteractive" />
        <Script id="gtag-init" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: GTAG_INLINE }} />
      </body>
    </html>
  );
}
