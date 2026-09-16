/**
 * Admin — Pages & SEO.
 *
 * Lists every page the website publishes — both markets, the UAE services
 * section included — with its SEO status, and handles the list-level
 * operations: rescan the site, publish / unpublish, and delete the pages that
 * were created here.
 *
 * Every operation that can change what search engines see finishes by calling
 * seoRegenerate(), which rewrites public/sitemap.xml and the front-end SEO cache.
 *
 * Port of admin/pages.php.
 */
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

import AdminShell from '@/components/admin/AdminShell';
import ConfirmSubmit from '@/components/admin/ConfirmSubmit';
import { FlashErr, FlashOk } from '@/components/admin/Flash';
import Icon from '@/components/admin/Icon';
import MarketChips from '@/components/admin/MarketChips';
import PagesSearch from '@/components/admin/PagesSearch';
import { adminUrl } from '@/lib/admin/config';
import { formatDateTime, utcStamp } from '@/lib/admin/format';
import { csrfToken, currentUser, takeFlash } from '@/lib/admin/session';
import { pagesOpAction } from '@/lib/admin/actions';
import {
  SITEMAP_COUNT_KEY,
  SITEMAP_GENERATED_KEY,
  seoMarketLinks,
  seoPageDefaults,
  seoPagesList,
  seoLegacyReplacement,
  seoPlacement,
  seoSetting,
  seoSitemapStale,
  seoStats,
  type PageRow,
  type SeoStats,
} from '@/lib/admin/seo-lib';
import { vxnRegionList } from '@/lib/region';
import { sectionLabel } from '@/lib/site-pages';

export const metadata: Metadata = {
  title: 'Page SEO — Valunxt Admin',
  robots: 'noindex, nofollow',
};

const PER_PAGE = 20;

const MARKETS: Array<[string, string]> = vxnRegionList().map((r) => [r.slug, r.short ?? r.name]);

/** Length badge class for a meta title / description against its target range. */
function lenClass(len: number, min: number, max: number): string {
  if (len === 0) return '';
  if (len > max) return 'over';
  if (len < min) return 'warn';
  return 'ok';
}

/**
 * Page numbers to render: always the first and last, plus a window around the
 * current page, with '…' standing in for the gaps.
 */
function pagerNumbers(current: number, total: number, window = 1): Array<number | '…'> {
  const keep = new Set<number>([1, total]);
  for (let i = current - window; i <= current + window; i++) {
    if (i >= 1 && i <= total) keep.add(i);
  }
  const sorted = [...keep].sort((a, b) => a - b);
  const out: Array<number | '…'> = [];
  let prev = 0;
  for (const n of sorted) {
    if (prev && n > prev + 1) out.push('…');
    out.push(n);
    prev = n;
  }
  return out;
}

export default async function AdminPagesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; p?: string; m?: string; missing?: string }>;
}) {
  const user = await currentUser();
  if (!user) redirect(adminUrl(''));

  const sp = await searchParams;
  const q = (sp.q ?? '').trim();
  const market = MARKETS.some(([slug]) => slug === sp.m) ? String(sp.m) : '';
  let pageNo = Math.max(1, Number(sp.p ?? 1) || 1);

  const flash = await takeFlash();
  // Sent here by the editor when the page it was asked for could not be opened.
  if (sp.missing && !flash.err) {
    flash.err =
      sp.missing === 'db'
        ? 'That page could not be opened. Please ensure MySQL is running.'
        : 'That page no longer exists.';
  }
  const csrf = await csrfToken();

  const listUrl = (over: { q?: string; p?: number; m?: string } = {}) => {
    const args = new URLSearchParams();
    const qq = over.q !== undefined ? over.q : q;
    const mm = over.m !== undefined ? over.m : market;
    const pp = over.p !== undefined ? over.p : pageNo;
    if (qq) args.set('q', qq);
    if (mm) args.set('m', mm);
    if (pp > 1) args.set('p', String(pp));
    const s = args.toString();
    return adminUrl('pages') + (s ? '?' + s : '');
  };

  let all: PageRow[] = [];
  let stats: SeoStats = { total: 0, published: 0, draft: 0, sitemap: 0, noindex: 0, legacy: 0 };
  let loadError = '';
  let generatedAt = '';
  let urlCount = 0;
  let stale = false;
  try {
    stats = await seoStats();
    all = await seoPagesList(q, market);
    generatedAt = await seoSetting(SITEMAP_GENERATED_KEY, '');
    urlCount = Number(await seoSetting(SITEMAP_COUNT_KEY, '0'));
    stale = await seoSitemapStale();
  } catch {
    loadError = 'Could not load pages. Please ensure MySQL is running.';
  }

  const matched = all.length;
  const totalPages = Math.max(1, Math.ceil(matched / PER_PAGE));
  if (pageNo > totalPages) pageNo = totalPages;
  const rows = all.slice((pageNo - 1) * PER_PAGE, pageNo * PER_PAGE);
  const firstRow = matched ? (pageNo - 1) * PER_PAGE + 1 : 0;
  const lastRow = Math.min(pageNo * PER_PAGE, matched);
  const back = listUrl();
  const filtered = q !== '' || market !== '';

  return (
    <AdminShell active="pages" user={user}>
      <div className="page-head">
        <div className="crumbs">
          Home <span className="sep">/</span> Page SEO
        </div>
        <h1>Page SEO</h1>
        <p>
          Manage the title, meta tags, canonical URL and robots directive for every page the website
          publishes, in India and the UAE.
        </p>
      </div>

      <FlashOk key={'ok' + flash.id} message={flash.ok ?? ''} />
      <FlashErr key={'err' + flash.id} message={flash.err ?? ''} />

      {stale && !loadError ? (
        <div className="notice" role="status">
          <Icon name="refresh" />
          <span className="notice-text">
            The website&rsquo;s pages have changed since the sitemap was last generated.
          </span>
          <form action={pagesOpAction}>
            <input type="hidden" name="op" value="sync" />
            <input type="hidden" name="csrf" value={csrf} />
            <input type="hidden" name="back" value={back} />
            <button type="submit" className="btn primary sm">
              Update sitemap
            </button>
          </form>
        </div>
      ) : null}

      {stats.legacy && !loadError ? (
        <div className="notice" role="status">
          <Icon name="alertCircle" />
          <span className="notice-text">
            {stats.legacy} SEO record{stats.legacy === 1 ? '' : 's'} came from the previous www.valunxt.com site. Each
            names the page that replaced it; copy anything worth keeping onto that page, then delete the record. Nothing is
            applied to the live pages until you do.
          </span>
        </div>
      ) : null}

      {/* KPI cards */}
      <section className="stat-grid">
        <div className="stat-card">
          <div className="ico">
            <Icon name="file" size={22} />
          </div>
          <div className="label">Total Pages</div>
          <div className="value">{stats.total}</div>
        </div>
        <div className="stat-card">
          <div className="ico green">
            <Icon name="checkCircle" size={22} />
          </div>
          <div className="label">Published</div>
          <div className="value">{stats.published}</div>
        </div>
        <div className="stat-card">
          <div className="ico sky">
            <Icon name="globe" size={22} />
          </div>
          <div className="label">In Sitemap</div>
          <div className="value">{stats.sitemap}</div>
        </div>
        <div className="stat-card">
          <div className="ico violet">
            <Icon name="noIndex" size={22} />
          </div>
          <div className="label">No-index Pages</div>
          <div className="value">{stats.noindex}</div>
        </div>
      </section>

      <section className="panel" style={{ marginTop: 20 }}>
        <div className="panel-head">
          <h3>
            {filtered ? 'Matching Pages' : 'All Pages'} <span className="count-chip">{matched}</span>
          </h3>
          <div className="toolbar">
            <PagesSearch action={adminUrl('pages')} value={q} market={market} markets={MARKETS} />
            <form action={pagesOpAction}>
              <input type="hidden" name="op" value="sync" />
              <input type="hidden" name="csrf" value={csrf} />
              <input type="hidden" name="back" value={back} />
              <button
                type="submit"
                className="btn sm"
                title="Add pages the website publishes that are not listed yet, remove pages it no longer publishes, and regenerate the sitemap"
              >
                <Icon name="refresh" size={15} />
                Rescan website
              </button>
            </form>
            <a href={adminUrl('pages/edit') + '?new=1'} className="btn primary sm">
              <Icon name="plus" size={15} stroke={2.4} />
              New Page
            </a>
          </div>
        </div>
        <div className="panel-body flush">
          {loadError ? (
            <div className="empty-state">
              <span className="empty-ico danger">
                <Icon name="alertCircle" size={26} />
              </span>
              <h4>Pages unavailable</h4>
              <p>{loadError}</p>
            </div>
          ) : !rows.length && filtered ? (
            <div className="empty-state">
              <span className="empty-ico">
                <Icon name="search" size={24} />
              </span>
              <h4>No pages match{q !== '' ? ` “${q}”` : ''}</h4>
              <p>
                <a className="link" href={adminUrl('pages')}>
                  Clear the filters
                </a>{' '}
                to see all pages.
              </p>
            </div>
          ) : !rows.length ? (
            <div className="empty-state">
              <span className="empty-ico">
                <Icon name="file" size={26} />
              </span>
              <h4>No pages yet</h4>
              <p>
                Use <strong>Rescan website</strong> to list the pages the website publishes, or create a
                new one.
              </p>
            </div>
          ) : (
            <>
              <div className="table-wrap">
                <table className="data" id="pagesTable">
                  <thead>
                    <tr>
                      <th>Page</th>
                      <th>Address</th>
                      <th>Meta Title</th>
                      <th>Meta Description</th>
                      <th>Robots</th>
                      <th>Status</th>
                      <th className="right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => {
                      const place = seoPlacement(r);
                      const links = seoMarketLinks(r);
                      const defaults = seoPageDefaults(r);
                      const mtLen = (String(r.meta_title ?? '').trim() || defaults.title).length;
                      const mdLen = (String(r.meta_description ?? '').trim() || defaults.desc).length;
                      const noindex = String(r.robots_meta ?? '').startsWith('noindex');
                      const published = r.status === 'published';
                      const deletable = !place.builtIn || !place.exists;
                      const replacement = place.legacy ? seoLegacyReplacement(r) : null;
                      return (
                        <tr key={r.id}>
                          <td className="title-cell">
                            <a href={adminUrl('pages/edit') + '?id=' + r.id}>{r.title || r.slug}</a>
                            {place.legacy ? (
                              <span className="sub is-warn">
                                Previous site (www.valunxt.com){replacement ? ` · now ${replacement.name}` : ''}
                              </span>
                            ) : !place.exists ? (
                              <span className="sub is-danger">No longer on the website</span>
                            ) : place.site ? (
                              <span className="sub">{sectionLabel(place.site.section)}</span>
                            ) : (
                              <span className="sub">Created in the CMS</span>
                            )}
                          </td>
                          <td className="slug-cell">
                            <span className="addr">{place.path}</span>
                            <MarketChips markets={links} links />
                          </td>
                          <td className="nowrap">
                            <span className={`counter ${lenClass(mtLen, 50, 60)}`}>{mtLen}</span>{' '}
                            <span className="counter-of">/ 60</span>
                          </td>
                          <td className="nowrap">
                            <span className={`counter ${lenClass(mdLen, 150, 160)}`}>{mdLen}</span>{' '}
                            <span className="counter-of">/ 160</span>
                          </td>
                          <td>
                            <span className={`pill ${noindex ? 'warnp' : 'ok'}`}>{r.robots_meta}</span>
                          </td>
                          <td>
                            <form action={pagesOpAction} className="inline-form">
                              <input type="hidden" name="op" value="toggle_status" />
                              <input type="hidden" name="csrf" value={csrf} />
                              <input type="hidden" name="id" value={r.id} />
                              <input type="hidden" name="back" value={back} />
                              <button
                                type="submit"
                                className={`pill as-button ${published ? 'ok' : 'off'}`}
                                title={`Click to ${published ? 'unpublish' : 'publish'}`}
                              >
                                <span className="pill-dot" />
                                {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                              </button>
                            </form>
                          </td>
                          <td>
                            <div className="row-actions">
                              {links[0] ? (
                                <a
                                  className="icon-btn"
                                  href={links[0].path}
                                  target="_blank"
                                  rel="noopener"
                                  title={`View ${links[0].path}`}
                                  aria-label={`View ${r.title} on the website`}
                                >
                                  <Icon name="external" size={16} />
                                </a>
                              ) : null}
                              <a
                                className="icon-btn"
                                href={adminUrl('pages/edit') + '?id=' + r.id}
                                title="Edit SEO"
                                aria-label={`Edit SEO for ${r.title}`}
                              >
                                <Icon name="edit" size={16} />
                              </a>
                              {deletable ? (
                                <form action={pagesOpAction}>
                                  <input type="hidden" name="op" value="delete" />
                                  <input type="hidden" name="csrf" value={csrf} />
                                  <input type="hidden" name="id" value={r.id} />
                                  <input type="hidden" name="back" value={back} />
                                  <ConfirmSubmit label={`Delete ${r.title}`} className="icon-btn danger">
                                    <Icon name="trash" size={16} />
                                  </ConfirmSubmit>
                                </form>
                              ) : null}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 ? (
                <nav className="pager" aria-label="Pages navigation">
                  <span className="pager-count">
                    Showing{' '}
                    <strong>
                      {firstRow}–{lastRow}
                    </strong>{' '}
                    of <strong>{matched}</strong>
                    {filtered ? ' matching' : ''} pages
                  </span>
                  <span className="pager-links">
                    {pageNo > 1 ? (
                      <a className="pg" href={listUrl({ p: pageNo - 1 })} rel="prev" aria-label="Previous page">
                        <Icon name="chevronLeft" size={14} stroke={2.4} />
                        Prev
                      </a>
                    ) : (
                      <span className="pg is-disabled">
                        <Icon name="chevronLeft" size={14} stroke={2.4} />
                        Prev
                      </span>
                    )}

                    {pagerNumbers(pageNo, totalPages).map((n, i) =>
                      n === '…' ? (
                        <span className="pg gap" key={'gap' + i}>
                          …
                        </span>
                      ) : n === pageNo ? (
                        <span className="pg current" aria-current="page" key={n}>
                          {n}
                        </span>
                      ) : (
                        <a className="pg" href={listUrl({ p: n })} key={n}>
                          {n}
                        </a>
                      )
                    )}

                    {pageNo < totalPages ? (
                      <a className="pg" href={listUrl({ p: pageNo + 1 })} rel="next" aria-label="Next page">
                        Next
                        <Icon name="chevronRight" size={14} stroke={2.4} />
                      </a>
                    ) : (
                      <span className="pg is-disabled">
                        Next
                        <Icon name="chevronRight" size={14} stroke={2.4} />
                      </span>
                    )}
                  </span>
                </nav>
              ) : null}
            </>
          )}
        </div>
        <div className="form-actions">
          <span className="form-note">
            Sitemap last generated: <strong>{formatDateTime(utcStamp(generatedAt), 'never')}</strong> —{' '}
            {urlCount} URL{urlCount === 1 ? '' : 's'} for {stats.sitemap} page{stats.sitemap === 1 ? '' : 's'}
          </span>
          <span className="spacer" />
          <a href={adminUrl('sitemap')} className="btn sm">
            Sitemap settings
          </a>
        </div>
      </section>
    </AdminShell>
  );
}
