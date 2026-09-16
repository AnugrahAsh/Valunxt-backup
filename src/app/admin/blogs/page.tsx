/**
 * Admin — Blog & Insights.
 *
 * Lists every post in `vx_posts` with its status, category and address, and
 * handles the list-level operations: publish / unpublish, feature, duplicate
 * and delete. Editing a post happens in blogs/edit.
 *
 * Built from the same panel, table, pill and pager parts as Pages & SEO, so the
 * two content screens read as one module.
 */
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

import AdminShell from '@/components/admin/AdminShell';
import BlogFilters from '@/components/admin/BlogFilters';
import ConfirmSubmit from '@/components/admin/ConfirmSubmit';
import { FlashErr, FlashOk } from '@/components/admin/Flash';
import Icon from '@/components/admin/Icon';
import { adminUrl } from '@/lib/admin/config';
import { blogOpAction } from '@/lib/admin/blog-actions';
import { csrfToken, currentUser, takeFlash } from '@/lib/admin/session';
import { blogStats, listPosts, usedCategories, type BlogStats } from '@/lib/blog/db';
import { blogDateLong, type BlogPost } from '@/lib/blog/types';
import { vxnRegionList } from '@/lib/region';

export const metadata: Metadata = {
  title: 'Blog & Insights — Valunxt Admin',
  robots: 'noindex, nofollow',
};

const PER_PAGE = 20;

/** The first market's address for a post — where "View" opens it. */
const FIRST_REGION = vxnRegionList()[0]?.slug ?? 'en-in';

function postPath(post: BlogPost): string {
  return `/${FIRST_REGION}/blogs/${post.slug}/`;
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

export default async function AdminBlogsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; p?: string; s?: string; c?: string; missing?: string }>;
}) {
  const user = await currentUser();
  if (!user) redirect(adminUrl(''));

  const sp = await searchParams;
  const q = (sp.q ?? '').trim();
  const status = sp.s === 'published' || sp.s === 'draft' ? sp.s : '';
  const category = (sp.c ?? '').trim();
  let pageNo = Math.max(1, Number(sp.p ?? 1) || 1);

  const flash = await takeFlash();
  // Sent here by the editor when the post it was asked for could not be opened.
  if (sp.missing && !flash.err) {
    flash.err =
      sp.missing === 'db'
        ? 'That post could not be opened. Please ensure MySQL is running.'
        : 'That post no longer exists.';
  }
  const csrf = await csrfToken();

  const listUrl = (over: { q?: string; p?: number; s?: string; c?: string } = {}) => {
    const args = new URLSearchParams();
    const qq = over.q !== undefined ? over.q : q;
    const ss = over.s !== undefined ? over.s : status;
    const cc = over.c !== undefined ? over.c : category;
    const pp = over.p !== undefined ? over.p : pageNo;
    if (qq) args.set('q', qq);
    if (ss) args.set('s', ss);
    if (cc) args.set('c', cc);
    if (pp > 1) args.set('p', String(pp));
    const s = args.toString();
    return adminUrl('blogs') + (s ? '?' + s : '');
  };

  let all: BlogPost[] = [];
  let stats: BlogStats = { total: 0, published: 0, draft: 0, featured: 0 };
  let categories: string[] = [];
  let loadError = '';
  try {
    stats = await blogStats();
    all = await listPosts({ q, status, category });
    categories = await usedCategories();
  } catch {
    loadError = 'Could not load posts. Please ensure MySQL is running.';
  }

  const matched = all.length;
  const totalPages = Math.max(1, Math.ceil(matched / PER_PAGE));
  if (pageNo > totalPages) pageNo = totalPages;
  const rows = all.slice((pageNo - 1) * PER_PAGE, pageNo * PER_PAGE);
  const firstRow = matched ? (pageNo - 1) * PER_PAGE + 1 : 0;
  const lastRow = Math.min(pageNo * PER_PAGE, matched);
  const back = listUrl();
  const filtered = q !== '' || status !== '' || category !== '';

  return (
    <AdminShell active="blogs" user={user}>
      <div className="page-head">
        <div className="crumbs">
          Home <span className="sep">/</span> Blog &amp; Insights
        </div>
        <h1>Blog &amp; Insights</h1>
        <p>
          Write, publish and retire the articles the website lists at /blogs/. Everything here is
          stored in the database and appears on the public site as soon as it is saved.
        </p>
      </div>

      <FlashOk key={'ok' + flash.id} message={flash.ok ?? ''} />
      <FlashErr key={'err' + flash.id} message={flash.err ?? ''} />

      {/* KPI cards */}
      <section className="stat-grid">
        <div className="stat-card">
          <div className="ico">
            <Icon name="bookOpen" size={22} />
          </div>
          <div className="label">Total Posts</div>
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
            <Icon name="edit" size={22} />
          </div>
          <div className="label">Drafts</div>
          <div className="value">{stats.draft}</div>
        </div>
        <div className="stat-card">
          <div className="ico violet">
            <Icon name="star" size={22} />
          </div>
          <div className="label">Featured</div>
          <div className="value">{stats.featured}</div>
        </div>
      </section>

      <section className="panel" style={{ marginTop: 20 }}>
        <div className="panel-head">
          <h3>
            {filtered ? 'Matching Posts' : 'All Posts'} <span className="count-chip">{matched}</span>
          </h3>
          <div className="toolbar">
            <BlogFilters
              action={adminUrl('blogs')}
              value={q}
              status={status}
              category={category}
              categories={categories}
            />
            <a href={adminUrl('blogs/edit') + '?new=1'} className="btn primary sm">
              <Icon name="plus" size={15} stroke={2.4} />
              New Post
            </a>
          </div>
        </div>

        <div className="panel-body flush">
          {loadError ? (
            <div className="empty-state">
              <span className="empty-ico danger">
                <Icon name="alertCircle" size={26} />
              </span>
              <h4>Posts unavailable</h4>
              <p>{loadError}</p>
            </div>
          ) : !rows.length && filtered ? (
            <div className="empty-state">
              <span className="empty-ico">
                <Icon name="search" size={24} />
              </span>
              <h4>No posts match{q !== '' ? ` “${q}”` : ''}</h4>
              <p>
                <a className="link" href={adminUrl('blogs')}>
                  Clear the filters
                </a>{' '}
                to see every post.
              </p>
            </div>
          ) : !rows.length ? (
            <div className="empty-state">
              <span className="empty-ico">
                <Icon name="bookOpen" size={26} />
              </span>
              <h4>No posts yet</h4>
              <p>
                The Insights listing is empty until the first article is written. Use{' '}
                <strong>New Post</strong> to add one.
              </p>
              <a href={adminUrl('blogs/edit') + '?new=1'} className="btn primary sm" style={{ marginTop: 14 }}>
                <Icon name="plus" size={15} stroke={2.4} />
                Write the first post
              </a>
            </div>
          ) : (
            <>
              <div className="table-wrap">
                <table className="data" id="blogsTable">
                  <thead>
                    <tr>
                      <th>Post</th>
                      <th>Address</th>
                      <th>Category</th>
                      <th>Published</th>
                      <th>Featured</th>
                      <th>Status</th>
                      <th className="right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((post) => {
                      const published = post.status === 'published';
                      const featured = post.featured === 1;
                      return (
                        <tr key={post.id}>
                          <td className="title-cell">
                            <a href={adminUrl('blogs/edit') + '?id=' + post.id}>{post.title}</a>
                            <span className="sub">
                              {post.excerpt.trim()
                                ? post.excerpt.trim().slice(0, 90) +
                                  (post.excerpt.trim().length > 90 ? '…' : '')
                                : 'No excerpt yet'}
                            </span>
                          </td>
                          <td className="slug-cell">
                            <span className="addr">/blogs/{post.slug}/</span>
                          </td>
                          <td className="nowrap">{post.cat || <span className="counter-of">—</span>}</td>
                          <td className="nowrap">
                            {post.published_at ? (
                              <time dateTime={post.published_at}>{blogDateLong(post.published_at)}</time>
                            ) : (
                              <span className="counter-of">Not dated</span>
                            )}
                          </td>
                          <td>
                            <form action={blogOpAction} className="inline-form">
                              <input type="hidden" name="op" value="toggle_featured" />
                              <input type="hidden" name="csrf" value={csrf} />
                              <input type="hidden" name="id" value={post.id} />
                              <input type="hidden" name="back" value={back} />
                              <button
                                type="submit"
                                className={`pill as-button ${featured ? 'new' : 'off'}`}
                                title={featured ? 'Click to unfeature' : 'Click to feature'}
                              >
                                <span className="pill-dot" />
                                {featured ? 'Featured' : 'Standard'}
                              </button>
                            </form>
                          </td>
                          <td>
                            <form action={blogOpAction} className="inline-form">
                              <input type="hidden" name="op" value="toggle_status" />
                              <input type="hidden" name="csrf" value={csrf} />
                              <input type="hidden" name="id" value={post.id} />
                              <input type="hidden" name="back" value={back} />
                              <button
                                type="submit"
                                className={`pill as-button ${published ? 'ok' : 'off'}`}
                                title={`Click to ${published ? 'unpublish' : 'publish'}`}
                              >
                                <span className="pill-dot" />
                                {published ? 'Published' : 'Draft'}
                              </button>
                            </form>
                          </td>
                          <td>
                            <div className="row-actions">
                              {published ? (
                                <a
                                  className="icon-btn"
                                  href={postPath(post)}
                                  target="_blank"
                                  rel="noopener"
                                  title={`View ${postPath(post)}`}
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
                              <form action={blogOpAction}>
                                <input type="hidden" name="op" value="duplicate" />
                                <input type="hidden" name="csrf" value={csrf} />
                                <input type="hidden" name="id" value={post.id} />
                                <input type="hidden" name="back" value={back} />
                                <button
                                  type="submit"
                                  className="icon-btn"
                                  title="Duplicate as a draft"
                                  aria-label={`Duplicate ${post.title}`}
                                >
                                  <Icon name="copy" size={16} />
                                </button>
                              </form>
                              <form action={blogOpAction}>
                                <input type="hidden" name="op" value="delete" />
                                <input type="hidden" name="csrf" value={csrf} />
                                <input type="hidden" name="id" value={post.id} />
                                <input type="hidden" name="back" value={back} />
                                <ConfirmSubmit
                                  label={`Delete ${post.title}`}
                                  className="icon-btn danger"
                                >
                                  <Icon name="trash" size={16} />
                                </ConfirmSubmit>
                              </form>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 ? (
                <nav className="pager" aria-label="Posts navigation">
                  <span className="pager-count">
                    Showing{' '}
                    <strong>
                      {firstRow}–{lastRow}
                    </strong>{' '}
                    of <strong>{matched}</strong>
                    {filtered ? ' matching' : ''} posts
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
            Published posts appear on <strong>/blogs/</strong> in every market and are listed in
            sitemap.xml.
          </span>
          <span className="spacer" />
          <a href={`/${FIRST_REGION}/blogs/`} target="_blank" rel="noopener" className="btn sm">
            View the Insights page
            <Icon name="arrowUpRight" size={14} />
          </a>
        </div>
      </section>
    </AdminShell>
  );
}
