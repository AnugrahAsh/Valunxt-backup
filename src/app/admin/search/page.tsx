/**
 * Admin — Search.
 *
 * Where the top-bar search box goes: enquiries, pages and blog posts matching
 * the term, each linking to the screen that manages it.
 *
 * New to the Next.js build. The PHP top bar had the box (and a Ctrl K hint)
 * but nothing behind it.
 */
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import AdminShell from '@/components/admin/AdminShell';
import Icon from '@/components/admin/Icon';
import MarketChips from '@/components/admin/MarketChips';
import { adminUrl } from '@/lib/admin/config';
import { formatDateTime, localStamp } from '@/lib/admin/format';
import { enquiryWho, searchPanel, type SearchResults } from '@/lib/admin/insights';
import { seoMarketLinks, seoPlacement } from '@/lib/admin/seo-lib';
import { currentUser } from '@/lib/admin/session';
import { blogDateLong } from '@/lib/blog/types';
import { vxnRegionList } from '@/lib/region';

export const metadata: Metadata = {
  title: 'Search — Valunxt Admin',
  robots: 'noindex, nofollow',
};

const MIN_TERM = 2;

/** The first market's address for a post — where "View" opens it. */
const FIRST_REGION = vxnRegionList()[0]?.slug ?? 'en-in';

const SOURCE_PILL: Record<string, string> = {
  Contact: 'new',
  'Free Consultation': 'wait',
  Enquiry: 'ok',
};

/** Wrap each case-insensitive occurrence of `term` in <mark>. */
function highlight(text: string, term: string): ReactNode {
  if (!text || !term) return text;
  const lower = text.toLowerCase();
  const needle = term.toLowerCase();
  const out: ReactNode[] = [];
  let from = 0;
  let at = lower.indexOf(needle);
  while (at !== -1) {
    if (at > from) out.push(text.slice(from, at));
    out.push(<mark key={at}>{text.slice(at, at + needle.length)}</mark>);
    from = at + needle.length;
    at = lower.indexOf(needle, from);
  }
  if (from < text.length) out.push(text.slice(from));
  return out;
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const user = await currentUser();
  if (!user) redirect(adminUrl(''));

  const q = String((await searchParams).q ?? '').trim().slice(0, 100);

  let results: SearchResults | null = null;
  let loadError = '';
  if (q.length >= MIN_TERM) {
    try {
      results = await searchPanel(q);
    } catch {
      loadError = 'Search is unavailable. Please ensure MySQL is running.';
    }
  }
  const found = results ? results.enquiries.length + results.pages.length + results.posts.length : 0;

  return (
    <AdminShell active="none" user={user} query={q}>
      <div className="page-head">
        <div className="crumbs">
          Home <span className="sep">/</span> Search
        </div>
        <h1>{q ? <>Results for &ldquo;{q}&rdquo;</> : 'Search'}</h1>
        <p>
          {!q
            ? 'Find enquiries by name, email, company, phone or source, pages by title or slug, and posts by title, slug or category.'
            : q.length < MIN_TERM
              ? `Enter at least ${MIN_TERM} characters to search.`
              : results
                ? `${found} result${found === 1 ? '' : 's'} across enquiries, pages and posts.`
                : ''}
        </p>
      </div>

      {loadError ? (
        <div className="flash err" role="alert">
          <Icon name="alertCircle" />
          <span className="flash-text">{loadError}</span>
        </div>
      ) : null}

      {!results ? (
        <section className="panel">
          <div className="empty-state">
            <span className="empty-ico">
              <Icon name="search" size={26} />
            </span>
            <h4>{q ? 'Keep typing' : 'Search the panel'}</h4>
            <p>
              Use the search box at the top of any screen. Press <kbd>Ctrl</kbd> + <kbd>K</kbd> to jump to
              it.
            </p>
          </div>
        </section>
      ) : (
        <>
          <section className="panel">
            <div className="panel-head">
              <h3>
                Enquiries <span className="count-chip">{results.enquiries.length}</span>
              </h3>
              <a href={adminUrl('enquiries')} className="link">
                All enquiries
                <Icon name="arrowRight" size={14} stroke={2.4} />
              </a>
            </div>
            <div className="panel-body flush">
              {results.enquiries.length === 0 ? (
                <div className="empty-state compact">
                  <p>No enquiries match &ldquo;{q}&rdquo;.</p>
                </div>
              ) : (
                <div className="table-wrap">
                  <table className="data">
                    <thead>
                      <tr>
                        <th>Client</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Source</th>
                        <th>Received</th>
                        <th className="right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.enquiries.map((e) => (
                        <tr key={e.id}>
                          <td className="strong">{highlight(enquiryWho(e), q)}</td>
                          <td>{e.email ? highlight(e.email, q) : '—'}</td>
                          <td className="nowrap">{e.phone ? highlight(e.phone, q) : '—'}</td>
                          <td>
                            <span className={`pill ${SOURCE_PILL[e.source] ?? 'new'}`}>
                              {e.source || 'Website'}
                            </span>
                          </td>
                          <td className="nowrap">{formatDateTime(localStamp(e.created_at))}</td>
                          <td className="right">
                            <a
                              className="btn sm"
                              href={adminUrl('enquiries') + '?q=' + encodeURIComponent(e.email || e.full_name || q)}
                            >
                              View
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>

          <section className="panel" style={{ marginTop: 20 }}>
            <div className="panel-head">
              <h3>
                Pages <span className="count-chip">{results.pages.length}</span>
              </h3>
              <a href={adminUrl('pages') + '?q=' + encodeURIComponent(q)} className="link">
                Open in Pages &amp; SEO
                <Icon name="arrowRight" size={14} stroke={2.4} />
              </a>
            </div>
            <div className="panel-body flush">
              {results.pages.length === 0 ? (
                <div className="empty-state compact">
                  <p>No pages match &ldquo;{q}&rdquo;.</p>
                </div>
              ) : (
                <div className="table-wrap">
                  <table className="data">
                    <thead>
                      <tr>
                        <th>Page</th>
                        <th>Address</th>
                        <th>Status</th>
                        <th>Robots</th>
                        <th className="right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.pages.map((p) => {
                        const place = seoPlacement(p);
                        const links = seoMarketLinks(p);
                        return (
                        <tr key={p.id}>
                          <td className="title-cell">
                            <a href={adminUrl('pages/edit') + '?id=' + p.id}>{highlight(p.title, q)}</a>
                            {p.meta_title ? <span className="sub">{highlight(p.meta_title, q)}</span> : null}
                          </td>
                          <td className="slug-cell">
                            <span className="addr">{highlight(place.path, q)}</span>
                            <MarketChips markets={links} links />
                          </td>
                          <td>
                            <span className={`pill ${p.status === 'published' ? 'ok' : 'off'}`}>
                              <span className="pill-dot" />
                              {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                            </span>
                          </td>
                          <td>
                            <span className={`pill ${p.robots_meta.startsWith('noindex') ? 'warnp' : 'ok'}`}>
                              {p.robots_meta}
                            </span>
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
                                  aria-label={`View ${p.title} on the website`}
                                >
                                  <Icon name="external" size={16} />
                                </a>
                              ) : null}
                              <a
                                className="icon-btn"
                                href={adminUrl('pages/edit') + '?id=' + p.id}
                                title="Edit SEO"
                                aria-label={`Edit SEO for ${p.title}`}
                              >
                                <Icon name="edit" size={16} />
                              </a>
                            </div>
                          </td>
                        </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>

          <section className="panel" style={{ marginTop: 20 }}>
            <div className="panel-head">
              <h3>
                Posts <span className="count-chip">{results.posts.length}</span>
              </h3>
              <a href={adminUrl('blogs') + '?q=' + encodeURIComponent(q)} className="link">
                Open in Blog &amp; Insights
                <Icon name="arrowRight" size={14} stroke={2.4} />
              </a>
            </div>
            <div className="panel-body flush">
              {results.posts.length === 0 ? (
                <div className="empty-state compact">
                  <p>No posts match &ldquo;{q}&rdquo;.</p>
                </div>
              ) : (
                <div className="table-wrap">
                  <table className="data">
                    <thead>
                      <tr>
                        <th>Post</th>
                        <th>Address</th>
                        <th>Published</th>
                        <th>Status</th>
                        <th className="right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.posts.map((post) => {
                        const path = `/${FIRST_REGION}/blogs/${post.slug}/`;
                        return (
                          <tr key={post.id}>
                            <td className="title-cell">
                              <a href={adminUrl('blogs/edit') + '?id=' + post.id}>
                                {highlight(post.title, q)}
                              </a>
                              {post.category ? (
                                <span className="sub">{highlight(post.category, q)}</span>
                              ) : null}
                            </td>
                            <td className="slug-cell">
                              <span className="addr">{highlight(`/blogs/${post.slug}/`, q)}</span>
                            </td>
                            <td className="nowrap">
                              {post.published_at ? (
                                <time dateTime={post.published_at}>
                                  {blogDateLong(post.published_at)}
                                </time>
                              ) : (
                                <span className="counter-of">Not dated</span>
                              )}
                            </td>
                            <td>
                              <span className={`pill ${post.status === 'published' ? 'ok' : 'off'}`}>
                                <span className="pill-dot" />
                                {post.status === 'published' ? 'Published' : 'Draft'}
                              </span>
                            </td>
                            <td>
                              <div className="row-actions">
                                {post.status === 'published' ? (
                                  <a
                                    className="icon-btn"
                                    href={path}
                                    target="_blank"
                                    rel="noopener"
                                    title={`View ${path}`}
                                    aria-label={`View ${post.title} on the website`}
                                  >
                                    <Icon name="external" size={16} />
                                  </a>
                                ) : null}
                                <a
                                  className="icon-btn"
                                  href={adminUrl('blogs/edit') + '?id=' + post.id}
                                  title="Edit post"
                                  aria-label={`Edit ${post.title}`}
                                >
                                  <Icon name="edit" size={16} />
                                </a>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </AdminShell>
  );
}
