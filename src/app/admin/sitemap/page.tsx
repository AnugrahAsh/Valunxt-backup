/**
 * Admin — Sitemap Settings.
 *
 * Shows the state of public/sitemap.xml (last generated, URL count, file size),
 * lets an administrator regenerate, download or view it, and holds the site URL
 * that canonical tags and sitemap entries are built from.
 *
 * Port of admin/sitemap.php.
 */
import fs from 'node:fs/promises';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

import AdminShell from '@/components/admin/AdminShell';
import { FlashErr, FlashOk } from '@/components/admin/Flash';
import Icon from '@/components/admin/Icon';
import MarketChips from '@/components/admin/MarketChips';
import { adminUrl, siteUrl } from '@/lib/admin/config';
import { query } from '@/lib/admin/db';
import { dbStamp, formatDate, formatDateTime, localStamp, utcStamp } from '@/lib/admin/format';
import { csrfToken, currentUser, takeFlash } from '@/lib/admin/session';
import { sitemapOpAction } from '@/lib/admin/actions';
import { sectionLabel } from '@/lib/site-pages';
import {
  SITEMAP_COUNT_KEY,
  SITEMAP_GENERATED_KEY,
  seoDetectSiteUrl,
  seoMarketLinks,
  seoPlacement,
  seoSetting,
  seoSitemapPath,
  seoSitemapRows,
  seoSitemapStale,
  seoSitemapUrls,
  seoSiteUrl,
  seoStats,
  type PageRow,
  type SeoStats,
} from '@/lib/admin/seo-lib';

export const metadata: Metadata = {
  title: 'Sitemap Settings — Valunxt Admin',
  robots: 'noindex, nofollow',
};

/** Human-readable byte size. */
function fsize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(2) + ' MB';
}

export default async function SitemapPage() {
  const user = await currentUser();
  if (!user) redirect(adminUrl(''));

  const flash = await takeFlash();
  const csrf = await csrfToken();

  const file = seoSitemapPath();
  let exists = false;
  let fileSize = 0;
  let preview = '';
  try {
    const stat = await fs.stat(file);
    exists = stat.isFile();
    fileSize = stat.size;
    const text = await fs.readFile(file, 'utf8');
    const lines = text.split('\n');
    preview = lines.slice(0, 40).join('\n');
    if (lines.length > 40) preview += `\n… ${lines.length - 40} more lines`;
  } catch {
    exists = false;
  }

  let stats: SeoStats = { total: 0, published: 0, draft: 0, sitemap: 0, noindex: 0, legacy: 0 };
  let rows: PageRow[] = [];
  let generatedAt = '';
  let urlCount = 0;
  let configured = '';
  let site = '';
  let stale = false;
  try {
    stats = await seoStats();
    rows = await seoSitemapRows();
    generatedAt = await seoSetting(SITEMAP_GENERATED_KEY, '');
    urlCount = Number(await seoSetting(SITEMAP_COUNT_KEY, '0'));
    configured = await seoSetting('site_url', '');
    site = await seoSiteUrl();
    stale = await seoSitemapStale();
  } catch {
    /* shown as zeroes */
  }
  const detected = seoDetectSiteUrl();
  const listed = rows.reduce((n, r) => n + seoSitemapUrls(r, site || detected).length, 0);

  /* Every generation is recorded in vx_sitemap_runs, as the imported panel did;
     the latest few are shown here, the full history under Sitemap Runs. */
  let runs: Array<{ id: number; ts: string; status: string; total_urls: number; added: number; removed: number; modified: number; duration_ms: number }> = [];
  let runCount = 0;
  try {
    runs = await query('SELECT id, ts, status, total_urls, added, removed, modified, duration_ms FROM vx_sitemap_runs ORDER BY ts DESC, id DESC LIMIT 6');
    runCount = Number((await query<{ n: number }>('SELECT COUNT(*) AS n FROM vx_sitemap_runs'))[0]?.n ?? 0);
  } catch {
    /* shown as none */
  }

  return (
    <AdminShell active="sitemap" user={user}>
      <div className="page-head">
        <div className="crumbs">
          Home <span className="sep">/</span> Sitemap
        </div>
        <h1>Sitemap Settings</h1>
        <p>
          The XML sitemap lists every published page once per market, and regenerates automatically
          whenever a page is created, published, updated or deleted. You can also rebuild it here.
        </p>
      </div>

      <FlashOk key={'ok' + flash.id} message={flash.ok ?? ''} />
      <FlashErr key={'err' + flash.id} message={flash.err ?? ''} />

      {stale ? (
        <div className="notice" role="status">
          <Icon name="refresh" />
          <span className="notice-text">
            The website&rsquo;s pages have changed since this sitemap was generated. Generate it again to
            publish the current set.
          </span>
        </div>
      ) : null}

      <section className="panel">
        <div className="panel-head">
          <h3>Sitemap Status</h3>
          <span className={`pill ${exists ? 'ok' : 'warnp'}`}>
            <span className="pill-dot" />
            {exists ? 'Generated' : 'Not generated yet'}
          </span>
        </div>
        <div className="panel-body">
          <div className="kv">
            <div className="kv-item">
              <div className="k">Total URLs Included</div>
              <div className="v">{exists ? urlCount : 0}</div>
            </div>
            <div className="kv-item">
              <div className="k">Last Generated</div>
              <div className="v sm">{formatDateTime(utcStamp(generatedAt), 'Never')}</div>
            </div>
            <div className="kv-item">
              <div className="k">File Size</div>
              <div className="v sm">{exists ? fsize(fileSize) : '—'}</div>
            </div>
            <div className="kv-item">
              <div className="k">Public Address</div>
              <div className="v sm">
                <a className="link" href={siteUrl('sitemap.xml')} target="_blank" rel="noopener">
                  /sitemap.xml
                </a>
              </div>
            </div>
          </div>

          <div className="toolbar" style={{ marginTop: 20 }}>
            <form action={sitemapOpAction}>
              <input type="hidden" name="op" value="generate" />
              <input type="hidden" name="csrf" value={csrf} />
              <button type="submit" className="btn primary">
                <Icon name="refresh" size={16} />
                Generate Sitemap
              </button>
            </form>
            <a
              className={'btn' + (exists ? '' : ' is-disabled')}
              href={adminUrl('sitemap/download')}
              aria-disabled={exists ? undefined : true}
            >
              <Icon name="download" size={16} />
              Download Sitemap
            </a>
            <a
              className={'btn' + (exists ? '' : ' is-disabled')}
              href={siteUrl('sitemap.xml')}
              target="_blank"
              rel="noopener"
              aria-disabled={exists ? undefined : true}
            >
              <Icon name="eye" size={16} />
              View Sitemap
            </a>
            <span className="spacer" />
            <a className="btn sm" href={adminUrl('pages')}>
              Manage pages
            </a>
          </div>
        </div>
      </section>

      <section className="panel" style={{ marginTop: 20 }}>
        <div className="panel-head">
          <h3>Site URL</h3>
        </div>
        <form action={sitemapOpAction}>
          <input type="hidden" name="op" value="save_settings" />
          <input type="hidden" name="csrf" value={csrf} />
          <div className="panel-body">
            <div className="fld">
              <label htmlFor="site_url">Public website address</label>
              <input
                type="text"
                id="site_url"
                name="site_url"
                defaultValue={configured}
                placeholder={detected}
                maxLength={255}
              />
              <div className="hint">
                The main domain every sitemap URL is built on, e.g. <code>https://valunxt.com</code>.
                Leave blank to use the address the site is served from, or <code>{detected}</code>{' '}
                when the panel runs on a local development server.
              </div>
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn primary">
              <Icon name="save" size={16} />
              Save &amp; Regenerate
            </button>
            <span className="spacer" />
            <span className="form-note">
              {stats.published} published · {stats.draft} draft · {stats.noindex} no-index
            </span>
          </div>
        </form>
      </section>

      <section className="panel" style={{ marginTop: 20 }}>
        <div className="panel-head">
          <h3>
            URLs In The Sitemap <span className="count-chip">{listed}</span>
          </h3>
          <a className="link" href={adminUrl('pages')}>
            Edit page SEO
            <Icon name="arrowRight" size={14} stroke={2.4} />
          </a>
        </div>
        <div className="panel-body flush">
          {!rows.length ? (
            <div className="empty-state">
              <span className="empty-ico">
                <Icon name="globe" size={26} />
              </span>
              <h4>No URLs yet</h4>
              <p>Publish at least one page and include it in the sitemap.</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table className="data">
                <thead>
                  <tr>
                    <th>Page</th>
                    <th>URLs</th>
                    <th>Priority</th>
                    <th>Change Frequency</th>
                    <th>Last Modified</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => {
                    const urls = seoSitemapUrls(r, site || detected);
                    const place = seoPlacement(r);
                    return (
                      <tr key={r.id}>
                        <td className="title-cell">
                          <a href={adminUrl('pages/edit') + '?id=' + r.id}>{r.title}</a>
                          <span className="sub">
                            {place.site ? sectionLabel(place.site.section) : 'Created in the CMS'}
                            <MarketChips markets={seoMarketLinks(r)} />
                          </span>
                        </td>
                        <td className="slug-cell url-list">
                          {urls.map((u) => (
                            <a key={u.loc} className="link" href={u.loc} target="_blank" rel="noopener">
                              {u.loc}
                            </a>
                          ))}
                        </td>
                        <td>{Number(r.priority).toFixed(1)}</td>
                        <td>
                          {String(r.changefreq).charAt(0).toUpperCase() +
                            String(r.changefreq).slice(1)}
                        </td>
                        <td className="nowrap">{formatDate(localStamp(String(r.updated_at)))}</td>
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
            Generation history <span className="count-chip">{runCount}</span>
          </h3>
          <a href={adminUrl('sitemap-runs')} className="link">
            All runs
            <Icon name="arrowRight" size={14} stroke={2.4} />
          </a>
        </div>
        <div className="panel-body flush">
          {runs.length ? (
            <div className="table-wrap">
              <table className="data">
                <thead>
                  <tr>
                    <th>Run at</th>
                    <th>Status</th>
                    <th>URLs</th>
                    <th>Added</th>
                    <th>Removed</th>
                    <th>Modified</th>
                    <th>Took</th>
                  </tr>
                </thead>
                <tbody>
                  {runs.map((r) => (
                    <tr key={r.id}>
                      <td className="nowrap">{formatDateTime(dbStamp(r.ts))}</td>
                      <td>
                        <span className={`pill ${r.status === 'success' ? 'ok' : 'warnp'}`}>{r.status}</span>
                      </td>
                      <td>{r.total_urls}</td>
                      <td>{r.added}</td>
                      <td>{r.removed}</td>
                      <td>{r.modified}</td>
                      <td className="nowrap">{r.duration_ms} ms</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state compact">
              <p>No generations recorded yet.</p>
            </div>
          )}
        </div>
      </section>

      {preview !== '' ? (
        <section className="panel" style={{ marginTop: 20 }}>
          <div className="panel-head">
            <h3>sitemap.xml Preview</h3>
          </div>
          <div className="panel-body">
            <pre className="code-box">{preview}</pre>
          </div>
        </section>
      ) : null}

      {site !== detected ? (
        <p className="hint" style={{ marginTop: 12 }}>
          Sitemap URLs are being built against <code>{site}</code>.
        </p>
      ) : null}
    </AdminShell>
  );
}
