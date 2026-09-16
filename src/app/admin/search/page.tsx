/**
 * Admin — Search.
 *
 * Where the top-bar search box goes: leads, page SEO rows, blog posts and — for
 * administrators — portal clients matching the term, each linking to the screen
 * that manages it.
 */
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import AdminShell from '@/components/admin/AdminShell';
import Icon from '@/components/admin/Icon';
import MarketChips from '@/components/admin/MarketChips';
import { adminUrl } from '@/lib/admin/config';
import { dbStamp, formatDateTime } from '@/lib/admin/format';
import { isAdmin } from '@/lib/admin/guard';
import { leadWho, searchPanel, type SearchResults } from '@/lib/admin/insights';
import { seoMarketLinks, seoPlacement } from '@/lib/admin/seo-lib';
import { currentUser } from '@/lib/admin/session';
import { blogDateLong } from '@/lib/blog/types';
import { LEAD_STATUS_LABEL, LEAD_STATUS_PILL } from '@/lib/leads';

export const metadata: Metadata = {
  title: 'Search — Valunxt Admin',
  robots: 'noindex, nofollow',
};

const MIN_TERM = 2;

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

function Section({
  title,
  count,
  href,
  linkLabel,
  empty,
  children,
}: {
  title: string;
  count: number;
  href: string;
  linkLabel: string;
  empty: string;
  children: ReactNode;
}) {
  return (
    <section className="panel" style={{ marginTop: 20 }}>
      <div className="panel-head">
        <h3>
          {title} <span className="count-chip">{count}</span>
        </h3>
        <a href={href} className="link">
          {linkLabel}
          <Icon name="arrowRight" size={14} stroke={2.4} />
        </a>
      </div>
      <div className="panel-body flush">
        {count === 0 ? (
          <div className="empty-state compact">
            <p>{empty}</p>
          </div>
        ) : (
          <div className="table-wrap">{children}</div>
        )}
      </div>
    </section>
  );
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const user = await currentUser();
  if (!user) redirect(adminUrl(''));
  const admin = isAdmin(user);

  const q = String((await searchParams).q ?? '').trim().slice(0, 100);

  let results: SearchResults | null = null;
  let loadError = '';
  if (q.length >= MIN_TERM) {
    try {
      results = await searchPanel(q);
      if (!admin) results.clients = [];
    } catch {
      loadError = 'Search is unavailable. Please ensure MySQL is running.';
    }
  }
  const found = results ? results.leads.length + results.pages.length + results.posts.length + results.clients.length : 0;

  return (
    <AdminShell active="none" user={user} query={q}>
      <div className="page-head">
        <div className="crumbs">
          Home <span className="sep">/</span> Search
        </div>
        <h1>{q ? <>Results for &ldquo;{q}&rdquo;</> : 'Search'}</h1>
        <p>
          {!q
            ? 'Find leads by name, email, phone, company or message; pages by title or address; posts by title, slug, category or tag; and portal clients by name, licence or TRN.'
            : q.length < MIN_TERM
              ? `Enter at least ${MIN_TERM} characters to search.`
              : results
                ? `${found} result${found === 1 ? '' : 's'}.`
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
              Use the search box at the top of any screen. Press <kbd>Ctrl</kbd> + <kbd>K</kbd> to jump to it.
            </p>
          </div>
        </section>
      ) : (
        <>
          <Section title="Leads" count={results.leads.length} href={adminUrl('leads') + '?q=' + encodeURIComponent(q)} linkLabel="Open in Leads CRM" empty={`No leads match “${q}”.`}>
            <table className="data">
              <thead>
                <tr>
                  <th>Lead</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Stage</th>
                  <th>Received</th>
                </tr>
              </thead>
              <tbody>
                {results.leads.map((l) => (
                  <tr key={l.id}>
                    <td className="title-cell">
                      <a href={adminUrl('leads/view') + '?id=' + l.id}>{highlight(leadWho(l), q)}</a>
                      {l.service ? <span className="sub">{highlight(l.service, q)}</span> : null}
                    </td>
                    <td>{l.email ? highlight(l.email, q) : '—'}</td>
                    <td className="nowrap">{l.phone ? highlight(l.phone, q) : '—'}</td>
                    <td>
                      <span className={`pill ${LEAD_STATUS_PILL[l.status] ?? 'new'}`}>{LEAD_STATUS_LABEL[l.status as keyof typeof LEAD_STATUS_LABEL] ?? l.status}</span>
                    </td>
                    <td className="nowrap">{formatDateTime(dbStamp(l.created_at))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>

          <Section title="Pages" count={results.pages.length} href={adminUrl('pages') + '?q=' + encodeURIComponent(q)} linkLabel="Open in Page SEO" empty={`No pages match “${q}”.`}>
            <table className="data">
              <thead>
                <tr>
                  <th>Page</th>
                  <th>Address</th>
                  <th>Status</th>
                  <th>Robots</th>
                </tr>
              </thead>
              <tbody>
                {results.pages.map((p) => {
                  const place = seoPlacement(p);
                  return (
                    <tr key={p.id}>
                      <td className="title-cell">
                        <a href={adminUrl('pages/edit') + '?id=' + p.id}>{highlight(p.title || p.slug, q)}</a>
                        {p.meta_title ? <span className="sub">{highlight(p.meta_title, q)}</span> : null}
                      </td>
                      <td className="slug-cell">
                        <span className="addr">{highlight(place.path, q)}</span>
                        <MarketChips markets={seoMarketLinks(p)} links />
                      </td>
                      <td>
                        <span className={`pill ${p.status === 'published' ? 'ok' : 'off'}`}>
                          <span className="pill-dot" />
                          {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                        </span>
                      </td>
                      <td>
                        <span className={`pill ${p.robots_meta.startsWith('noindex') ? 'warnp' : 'ok'}`}>{p.robots_meta}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Section>

          <Section title="Posts" count={results.posts.length} href={adminUrl('blogs') + '?q=' + encodeURIComponent(q)} linkLabel="Open in Blog & Insights" empty={`No posts match “${q}”.`}>
            <table className="data">
              <thead>
                <tr>
                  <th>Post</th>
                  <th>Address</th>
                  <th>Published</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {results.posts.map((post) => (
                  <tr key={post.id}>
                    <td className="title-cell">
                      <a href={adminUrl('blogs/edit') + '?id=' + post.id}>{highlight(post.title, q)}</a>
                      {post.cat ? <span className="sub">{highlight(post.cat, q)}</span> : null}
                    </td>
                    <td className="slug-cell">
                      <span className="addr">{highlight(`/blogs/${post.slug}/`, q)}</span>
                    </td>
                    <td className="nowrap">{post.published_at ? blogDateLong(post.published_at) : <span className="counter-of">Not dated</span>}</td>
                    <td>
                      <span className={`pill ${post.status === 'published' ? 'ok' : 'off'}`}>
                        <span className="pill-dot" />
                        {post.status === 'published' ? 'Published' : 'Draft'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>

          {admin ? (
            <Section title="Portal clients" count={results.clients.length} href={adminUrl('clients') + '?q=' + encodeURIComponent(q)} linkLabel="Open in Clients" empty={`No clients match “${q}”.`}>
              <table className="data">
                <thead>
                  <tr>
                    <th>Client</th>
                    <th>Entity</th>
                    <th>Onboarding</th>
                  </tr>
                </thead>
                <tbody>
                  {results.clients.map((c) => (
                    <tr key={c.id}>
                      <td className="title-cell">
                        <a href={adminUrl('clients/view') + '?id=' + c.id}>{highlight(c.legal_name, q)}</a>
                        {c.trade_name ? <span className="sub">{highlight(c.trade_name, q)}</span> : null}
                      </td>
                      <td>{c.entity_type}</td>
                      <td>
                        <span className={`pill ${c.onboarding_status === 'Active' ? 'ok' : 'wait'}`}>{c.onboarding_status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Section>
          ) : null}
        </>
      )}
    </AdminShell>
  );
}
