/**
 * Admin — Page & SEO editor.
 *
 * Handles both creating a new page (?new=1) and editing an existing one (?id=N).
 * Any successful save regenerates public/sitemap.xml and the front-end SEO
 * cache.
 *
 * Port of admin/page-edit.php.
 */
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

import AdminShell from '@/components/admin/AdminShell';
import { FlashErr, FlashOk } from '@/components/admin/Flash';
import MarketChips from '@/components/admin/MarketChips';
import PageEditor, { type EditorForm } from '@/components/admin/PageEditor';
import { adminUrl } from '@/lib/admin/config';
import { csrfToken, currentUser, takeFlash } from '@/lib/admin/session';
import {
  seoHeroImages,
  seoMarketLinks,
  seoPage,
  seoPageDefaults,
  seoPlacement,
  seoSiteUrl,
  type MarketLink,
} from '@/lib/admin/seo-lib';
import { vxnRegionList } from '@/lib/region';
import { sectionLabel } from '@/lib/site-pages';

export const metadata: Metadata = {
  title: 'Edit page — Valunxt Admin',
  robots: 'noindex, nofollow',
};

const NEW_FORM: EditorForm = {
  title: '',
  slug: '',
  meta_title: '',
  meta_description: '',
  canonical_url: '',
  meta_keywords: '',
  robots_meta: 'index, follow',
  og_title: '',
  og_description: '',
  status: 'published',
  in_sitemap: 1,
  priority: '0.8',
  changefreq: 'monthly',
  hero_image: '/assets/content/uploads/banners/about-us.webp',
};

/** Every market, for a page created here: its addresses follow the slug. */
const ALL_MARKETS: MarketLink[] = vxnRegionList().map((r) => ({
  region: r.slug,
  code: r.code,
  label: r.short ?? r.name,
  path: `/${r.slug}/`,
}));

export default async function PageEditPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; new?: string }>;
}) {
  const user = await currentUser();
  if (!user) redirect(adminUrl(''));

  const sp = await searchParams;
  const isNew = sp.new !== undefined;
  const id = Number(sp.id ?? 0);

  let form: EditorForm = NEW_FORM;
  let builtIn = false;
  let markets: MarketLink[] = ALL_MARKETS;
  let defaults = { title: 'Valunxt', desc: '' };
  let section = '';

  if (!isNew) {
    let page: Awaited<ReturnType<typeof seoPage>> = null;
    let failed = false;
    try {
      page = id > 0 ? await seoPage(id) : null;
    } catch {
      failed = true;
    }
    if (!page) {
      // A render cannot set the flash cookie (see lib/admin/session.ts), so the
      // reason travels to the list screen in the URL instead.
      redirect(adminUrl('pages') + '?missing=' + (failed ? 'db' : 'page'));
    }
    const place = seoPlacement(page);
    builtIn = place.builtIn;
    markets = place.builtIn ? seoMarketLinks(page) : ALL_MARKETS;
    defaults = seoPageDefaults(page);
    section = place.site
      ? sectionLabel(place.site.section)
      : place.exists
        ? 'Created in the CMS'
        : 'No longer on the website';
    form = {
      title: String(page.title ?? ''),
      slug: String(page.slug ?? ''),
      meta_title: String(page.meta_title ?? ''),
      meta_description: String(page.meta_description ?? ''),
      canonical_url: String(page.canonical_url ?? ''),
      meta_keywords: String(page.meta_keywords ?? ''),
      robots_meta: String(page.robots_meta ?? 'index, follow'),
      og_title: String(page.og_title ?? ''),
      og_description: String(page.og_description ?? ''),
      status: String(page.status ?? 'published'),
      in_sitemap: Number(page.in_sitemap ?? 1),
      priority: Number(page.priority ?? 0.5).toFixed(1),
      changefreq: String(page.changefreq ?? 'monthly'),
      hero_image: String(page.hero_image ?? '') || NEW_FORM.hero_image,
    };
  }

  const flash = await takeFlash();
  const csrf = await csrfToken();
  const site = await seoSiteUrl();
  const heroes = seoHeroImages();
  const heading = isNew ? 'New Page' : 'Edit: ' + form.title;

  return (
    <AdminShell active="pages" user={user}>
      <div className="page-head">
        <div className="crumbs">
          Home <span className="sep">/</span>{' '}
          <a href={adminUrl('pages')} style={{ color: 'inherit' }}>
            Pages &amp; SEO
          </a>{' '}
          <span className="sep">/</span> {isNew ? 'New Page' : 'Edit'}
        </div>
        <h1>{heading}</h1>
        <p className="head-meta">
          {isNew ? (
            'Create a page on the website and set its search-engine metadata in one step. It is published in every market.'
          ) : (
            <>
              <span>{section}</span>
              {builtIn && markets.length ? <MarketChips markets={markets} /> : null}
              <span>Update the meta tags, canonical URL and robots directive for this page.</span>
            </>
          )}
        </p>
      </div>

      <FlashOk key={'ok' + flash.id} message={flash.ok ?? ''} />
      <FlashErr key={'err' + flash.id} message={flash.err ?? ''} />

      <PageEditor
        isNew={isNew}
        builtIn={builtIn}
        id={id}
        csrf={csrf}
        site={site}
        initial={form}
        heroes={heroes}
        markets={markets}
        defaults={defaults}
      />
    </AdminShell>
  );
}
