/**
 * The per-page chrome: everything includes/header.php and includes/footer.php
 * wrapped around a page body, in the same order and with the same markup.
 *
 *   [preloader]                      includes/preloader.php
 *   [captured Elementor header]      includes/partials/header-<id>.php
 *   <div id="page" class="main-container">
 *     {children}                     the page's own sections
 *     [captured Elementor footer]    includes/partials/footer-<id>.php
 *   </div>
 *   #scroll-to-top
 *   [cookie consent]                 includes/partials/cookie-consent.php
 *   [scripts]                        includes/scripts.php
 *
 * The stylesheet block from includes/head.php is rendered by the root layout
 * instead, because it belongs inside the real <head> — see src/app/layout.tsx.
 */
import type { ReactNode } from 'react';
import type { PageConfig } from '@/lib/page-config';
import { vxnRegion } from '@/lib/region';
import { uaePageImageCss } from '@/lib/uae-page-images';
import { PageStructuredData } from '@/components/seo/JsonLd';

import Preloader from './Preloader';
import Header139 from './Header139';
import Header3134 from './Header3134';
import Header3837 from './Header3837';
import FooterUae from './FooterUae';
import CookieConsent from './CookieConsent';
import SiteMotion from './SiteMotion';
import SiteScripts from './SiteScripts';

function SiteHeader({
  which,
  region,
}: {
  which: string;
  region: string;
}) {
  if (which === '139') return <Header139 region={region} />;
  if (which === '3134') return <Header3134 region={region} />;
  if (which === '3837') return <Header3837 region={region} />;
  return null;
}

/* ONE FOOTER FOR EVERY PAGE IN BOTH MARKETS (20260911, on client instruction).
   The blue single-panel footer built for the UAE home now closes every page,
   India's included. The captured Elementor footers, 2094 (the four-column one
   every interior page and the India home used) and 3425 (the CTA-led one,
   which nothing had selected for some time), are no longer rendered; their
   components stay in this folder in case either is wanted back, and a page
   config still names one of the three ids, so 'none' is the only value that
   changes anything here. */
function SiteFooter({ which, region }: { which: string; region: string }) {
  if (which === 'none') return null;
  return <FooterUae region={region} />;
}

export default function PageShell({
  page,
  region: rawRegion,
  children,
}: {
  page: PageConfig;
  region: string;
  children: ReactNode;
}) {
  const region = vxnRegion(rawRegion);
  /* The UAE edition's own hero and panel images for this page (see
     lib/uae-page-images.ts). Empty for India and for any slot with no file. */
  const pageImageCss = uaePageImageCss(region, page.path);

  return (
    <>
      {pageImageCss ? <style id="uae-page-images" dangerouslySetInnerHTML={{ __html: pageImageCss }} /> : null}
      {/* JSON-LD and FAQ structured data set on the page in the admin panel
          (Page SEO). Renders nothing for a page without any. */}
      <PageStructuredData page={page} region={region} />
      <Preloader />
      <SiteHeader which={page.header} region={region} />
      <div id="page" className="main-container">
        {children}
        {page.canvas ? null : <SiteFooter which={page.footer} region={region} />}
      </div>
      {/* A <div> because the theme's stylesheet keys off the id and the tag —
          so it gets the button role and a tab stop by hand instead. The click
          itself is bound in SiteScripts (SCROLL_AND_NAV). */}
      <div
        id="scroll-to-top"
        className="vamtam-scroll-to-top"
        role="button"
        tabIndex={0}
        aria-label="Back to top"
      >
        <div id="scroll-to-top-text">top</div>
      </div>
      <CookieConsent region={region} />
      {/* The site's scroll motion (20260916): headings a line at a time, copy
          out of a blur, pictures rising and drifting. Before SiteScripts so
          it takes Elementor's entrance animations over before that replay
          runs. Renders nothing. */}
      <SiteMotion />
      <SiteScripts page={page} region={region} />
    </>
  );
}
