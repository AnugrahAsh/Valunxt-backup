'use client';

/**
 * The live SEO editor: slug suggestions, character counters, Google preview.
 *
 * Port of admin/page-edit.php's form and its inline script. The submit is a
 * Server Action, so the form still works with JavaScript disabled — the script
 * only adds the live preview.
 *
 * Two kinds of page come through here. A page BUILT INTO the website (every
 * page the site publishes from its code, the UAE services section included)
 * keeps the address its route answers at, so its address is shown rather than
 * edited, and a blank title or description falls back to what the page itself
 * declares. A page CREATED HERE picks its own slug and is published in every
 * market by the CMS catch-all route.
 */
import { useActionState, useEffect, useMemo, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';

import Icon from './Icon';
import MarketChips from './MarketChips';
import { FaqRepeater, SchemaRepeater } from './StructuredDataFields';
import { useSubmitRound } from './useSubmitRound';
import { savePageAction, type PageFormState } from '@/lib/admin/actions';
import { ADMIN_MARK, adminUrl } from '@/lib/admin/config';
import type { MarketLink } from '@/lib/admin/seo-lib';

export interface EditorForm {
  title: string;
  slug: string;
  meta_title: string;
  meta_description: string;
  canonical_url: string;
  meta_keywords: string;
  robots_meta: string;
  og_title: string;
  og_description: string;
  status: string;
  in_sitemap: number;
  priority: string;
  changefreq: string;
  hero_image: string;
  /* The fields the imported www.valunxt.com panel managed per page. */
  og_image: string;
  tw_title: string;
  tw_desc: string;
  tw_image: string;
  focus_kw: string;
  h1: string;
  /** JSON array of JSON-LD documents. */
  schema_jsonld: string;
  /** JSON array of { q, a }. */
  faq_json: string;
}

const ROBOTS = ['index, follow', 'noindex, follow', 'index, nofollow', 'noindex, nofollow'];
const CHANGEFREQ = ['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'];
const PRIORITIES = ['1.0', '0.9', '0.8', '0.7', '0.6', '0.5', '0.4', '0.3', '0.2', '0.1'];

/** Mirror of the server-side slug normaliser, for the live suggestion only. */
function slugify(value: string): string {
  return String(value)
    .toLowerCase()
    .replace(/\s*[|–—-]\s*valunxt.*$/i, '')
    .replace(/&/g, ' and ')
    .split('/')
    .map((part) => part.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''))
    .filter(Boolean)
    .join('/');
}

function SaveButton({ isNew }: { isNew: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn primary" disabled={pending}>
      <Icon name="save" size={16} />
      {pending ? 'Saving…' : isNew ? 'Create Page' : 'Save SEO Settings'}
    </button>
  );
}

export default function PageEditor({
  isNew,
  builtIn,
  id,
  csrf,
  site,
  initial,
  heroes,
  markets,
  defaults,
}: {
  isNew: boolean;
  /** Built into the website's code: the address is fixed. */
  builtIn: boolean;
  id: number;
  csrf: string;
  /** The public site URL, e.g. https://valunxt.com */
  site: string;
  initial: EditorForm;
  heroes: string[];
  /**
   * Where the page is published. For a page created here, every market with an
   * empty path — its address follows the slug as it is typed.
   */
  markets: MarketLink[];
  /** What the page itself declares, shown when a field is left blank. */
  defaults: { title: string; desc: string };
}) {
  const [state, action] = useActionState<PageFormState | null, FormData>(savePageAction, null);
  const errors = state?.errors ?? {};
  const v = { ...initial, ...(state?.values ?? {}) } as EditorForm;
  // Remounts the uncontrolled selects after a rejected save (see useSubmitRound).
  const round = useSubmitRound(state);

  const [title, setTitle] = useState(String(v.title));
  const [slug, setSlug] = useState(String(v.slug));
  const [metaTitle, setMetaTitle] = useState(String(v.meta_title));
  const [metaDesc, setMetaDesc] = useState(String(v.meta_description));
  const [canonical, setCanonical] = useState(String(v.canonical_url));
  const slugTouched = useRef(!isNew && String(v.slug) !== '');
  const formRef = useRef<HTMLFormElement>(null);

  // Keep the fields in step when the action returns with validation errors.
  useEffect(() => {
    if (!state?.values) return;
    setTitle(String(state.values.title ?? ''));
    setSlug(String(state.values.slug ?? ''));
    setMetaTitle(String(state.values.meta_title ?? ''));
    setMetaDesc(String(state.values.meta_description ?? ''));
    setCanonical(String(state.values.canonical_url ?? ''));
  }, [state]);

  // A rejected save is reported at the top of the form, far above the button
  // that was pressed: bring the first field at fault (or the notice) into view.
  useEffect(() => {
    if (!state?.errors || !Object.keys(state.errors).length) return;
    const form = formRef.current;
    const target = form?.querySelector<HTMLElement>('.is-invalid') ?? form?.querySelector<HTMLElement>('.flash.err');
    if (!target) return;
    target.scrollIntoView({ block: 'center', behavior: 'smooth' });
    if (target.matches('input, textarea, select')) target.focus({ preventScroll: true });
  }, [state]);

  /* A page created here is published at /<market>/<slug>/ in every market, so
     its addresses follow the slug field. A built-in page's are fixed. */
  const liveMarkets = useMemo<MarketLink[]>(() => {
    if (builtIn) return markets;
    const s = slug.trim().replace(/^\/+|\/+$/g, '');
    return markets.map((m) => ({ ...m, path: `/${m.region}/${s ? s + '/' : ''}` }));
  }, [builtIn, markets, slug]);

  const autoTitle = useMemo(() => {
    if (builtIn) return defaults.title;
    return title.trim() ? `${title.trim()} | Valunxt` : 'Valunxt';
  }, [builtIn, defaults.title, title]);
  const autoCanon = site + (liveMarkets[0]?.path ?? '/');

  const counterClass = (len: number, min: number, max: number) => {
    if (!len) return 'counter';
    return 'counter ' + (len > max ? 'over' : len < min ? 'warn' : 'ok');
  };

  const shownTitle = metaTitle.trim() || autoTitle;
  const effectiveDesc = metaDesc.trim() || defaults.desc;
  const shownDesc =
    effectiveDesc || 'Add a meta description to control the snippet Google shows beneath your page title.';

  return (
    <form action={action} id="seoForm" ref={formRef}>
      <input type="hidden" name="csrf" value={csrf} />
      <input type="hidden" name="mode" value={isNew ? 'new' : 'edit'} />
      <input type="hidden" name="id" value={id} />

      {errors.general ? (
        <div className="flash err" role="alert">
          <Icon name="alertCircle" />
          <span className="flash-text">{errors.general}</span>
        </div>
      ) : Object.keys(errors).length ? (
        <div className="flash err" role="alert">
          <Icon name="alertCircle" />
          <span className="flash-text">
            The page was not saved. Correct the highlighted fields below and try again.
          </span>
        </div>
      ) : null}

      <div className="panel-grid editor-grid">
        {/* Left column: the fields */}
        <div>
          <section className="panel">
            <div className="panel-head">
              <h3>Page</h3>
            </div>
            <div className="panel-body">
              <div className="form-grid">
                <div className="fld full">
                  <label htmlFor="title">
                    Page Title <span className="counter">{title.length}</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    className={errors.title ? 'is-invalid' : undefined}
                    aria-invalid={errors.title ? true : undefined}
                    value={title}
                    maxLength={200}
                    required
                    placeholder="e.g. Investor Relations"
                    onChange={(e) => {
                      setTitle(e.target.value);
                      if (!slugTouched.current && !builtIn) setSlug(slugify(e.target.value));
                    }}
                  />
                  {errors.title ? (
                    <div className="hint" style={{ color: 'var(--danger)' }}>
                      {errors.title}
                    </div>
                  ) : null}
                  <div className="hint">
                    {builtIn
                      ? 'The page’s name inside the CMS. It does not change the page on the website.'
                      : 'The page’s name inside the CMS. Also used to suggest the slug and meta title.'}
                  </div>
                </div>

                {builtIn ? (
                  <div className="fld full">
                    <input type="hidden" name="slug" value={slug} />
                    <label>Address</label>
                    <ul className="address-list">
                      {liveMarkets.map((m) => (
                        <li key={m.region}>
                          <MarketChips markets={[m]} />
                          <a className="link" href={m.path} target="_blank" rel="noopener">
                            {site + m.path}
                          </a>
                        </li>
                      ))}
                    </ul>
                    <div className="hint">
                      Built into the website, so its address is set by the site&rsquo;s code and cannot be
                      changed here.
                    </div>
                  </div>
                ) : (
                  <div className="fld full">
                    <label htmlFor="slug">URL Slug</label>
                    <div className="prefix-input">
                      <span className="px">{site}/&hellip;/</span>
                      <input
                        type="text"
                        id="slug"
                        name="slug"
                        className={errors.slug ? 'is-invalid' : undefined}
                        aria-invalid={errors.slug ? true : undefined}
                        value={slug}
                        maxLength={255}
                        placeholder="investor-relations"
                        onChange={(e) => {
                          slugTouched.current = true;
                          setSlug(e.target.value);
                        }}
                        onBlur={(e) => setSlug(slugify(e.target.value))}
                      />
                    </div>
                    {errors.slug ? (
                      <div className="hint" style={{ color: 'var(--danger)' }}>
                        {errors.slug}
                      </div>
                    ) : null}
                    <div className="hint">
                      Published at {liveMarkets.map((m, i) => (
                        <span key={m.region}>
                          {i > 0 ? (i === liveMarkets.length - 1 ? ' and ' : ', ') : ''}
                          <code>{m.path}</code>
                        </span>
                      ))}
                      . Letters, numbers and hyphens only; use <code>/</code> to nest under a parent (e.g.{' '}
                      <code>about/team</code>).
                    </div>
                  </div>
                )}

                {!builtIn && heroes.length ? (
                  <div className="fld full">
                    <label htmlFor="hero_image">Hero Banner Image</label>
                    <select key={round} id="hero_image" name="hero_image" defaultValue={String(v.hero_image)}>
                      {heroes.map((img) => (
                        <option value={img} key={img}>
                          {img.split('/').pop()}
                        </option>
                      ))}
                    </select>
                    <div className="hint">The banner behind this page&rsquo;s breadcrumb hero.</div>
                  </div>
                ) : null}
              </div>
            </div>
          </section>

          <section className="panel" style={{ marginTop: 20 }}>
            <div className="panel-head">
              <h3>Search Engine Metadata</h3>
            </div>
            <div className="panel-body">
              <div className="form-grid">
                <div className="fld full">
                  <label htmlFor="meta_title">
                    Meta Title{' '}
                    <span className={counterClass(shownTitle.length, 50, 60)}>{shownTitle.length}</span>
                  </label>
                  <input
                    type="text"
                    id="meta_title"
                    name="meta_title"
                    className={errors.meta_title ? 'is-invalid' : undefined}
                    aria-invalid={errors.meta_title ? true : undefined}
                    value={metaTitle}
                    maxLength={255}
                    placeholder={autoTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                  />
                  {errors.meta_title ? (
                    <div className="hint" style={{ color: 'var(--danger)' }}>
                      {errors.meta_title}
                    </div>
                  ) : null}
                  <div className="hint">
                    Recommended 50–60 characters. Leave blank to use &ldquo;{autoTitle}&rdquo;.
                  </div>
                </div>

                <div className="fld full">
                  <label htmlFor="meta_description">
                    Meta Description{' '}
                    <span className={counterClass(effectiveDesc.length, 150, 160)}>{effectiveDesc.length}</span>
                  </label>
                  <textarea
                    id="meta_description"
                    name="meta_description"
                    className={errors.meta_description ? 'is-invalid' : undefined}
                    aria-invalid={errors.meta_description ? true : undefined}
                    rows={3}
                    maxLength={500}
                    placeholder={defaults.desc || 'A short, compelling summary of the page.'}
                    value={metaDesc}
                    onChange={(e) => setMetaDesc(e.target.value)}
                  />
                  {errors.meta_description ? (
                    <div className="hint" style={{ color: 'var(--danger)' }}>
                      {errors.meta_description}
                    </div>
                  ) : null}
                  <div className="hint">
                    Recommended 150–160 characters.
                    {defaults.desc ? ' Leave blank to use the page’s own description, shown in the box.' : ''}
                  </div>
                </div>

                <div className="fld full">
                  <label htmlFor="canonical_url">Canonical URL</label>
                  <input
                    type="text"
                    id="canonical_url"
                    name="canonical_url"
                    className={errors.canonical_url ? 'is-invalid' : undefined}
                    aria-invalid={errors.canonical_url ? true : undefined}
                    value={canonical}
                    maxLength={255}
                    placeholder={autoCanon}
                    onChange={(e) => setCanonical(e.target.value)}
                  />
                  {errors.canonical_url ? (
                    <div className="hint" style={{ color: 'var(--danger)' }}>
                      {errors.canonical_url}
                    </div>
                  ) : null}
                  <div className="hint">
                    Leave blank and each market&rsquo;s page names itself as canonical
                    {liveMarkets.length ? (
                      <>
                        {' '}
                        (e.g. <code>{autoCanon}</code>)
                      </>
                    ) : null}
                    .
                  </div>
                </div>

                <div className="fld">
                  <label htmlFor="robots_meta">Robots Meta</label>
                  <select key={round} id="robots_meta" name="robots_meta" defaultValue={String(v.robots_meta)}>
                    {ROBOTS.map((opt) => (
                      <option value={opt} key={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                  <div className="hint">
                    Controls whether search engines index the page and follow its links.
                  </div>
                </div>

                <div className="fld">
                  <label htmlFor="status">Status</label>
                  <select key={round} id="status" name="status" defaultValue={String(v.status)}>
                    <option value="published">Published</option>
                    <option value="draft">Draft (no-index, excluded from sitemap)</option>
                  </select>
                  <div className="hint">
                    Draft pages are served with <code>noindex, nofollow</code> and left out of the
                    sitemap.
                  </div>
                </div>

                <div className="fld full">
                  <label htmlFor="meta_keywords">
                    Meta Keywords{' '}
                    <span style={{ fontWeight: 400, color: 'var(--muted)' }}>(optional)</span>
                  </label>
                  <input
                    type="text"
                    id="meta_keywords"
                    name="meta_keywords"
                    className={errors.meta_keywords ? 'is-invalid' : undefined}
                    aria-invalid={errors.meta_keywords ? true : undefined}
                    defaultValue={String(v.meta_keywords)}
                    maxLength={500}
                    placeholder="real estate advisory, capital markets, dubai"
                  />
                  {errors.meta_keywords ? (
                    <div className="hint" style={{ color: 'var(--danger)' }}>
                      {errors.meta_keywords}
                    </div>
                  ) : null}
                  <div className="hint">
                    Comma-separated. Most search engines ignore this tag, so it is safe to leave
                    empty.
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="panel" style={{ marginTop: 20 }}>
            <div className="panel-head">
              <h3>Social Image, X Card &amp; Structured Data</h3>
            </div>
            <div className="panel-body">
              <div className="form-grid">
                <div className="fld full">
                  <label htmlFor="og_image">
                    Social share image (OG){' '}
                    <span style={{ fontWeight: 400, color: 'var(--muted)' }}>(optional)</span>
                  </label>
                  <input
                    type="text"
                    id="og_image"
                    name="og_image"
                    className={errors.og_image ? 'is-invalid' : undefined}
                    defaultValue={String(v.og_image ?? '')}
                    maxLength={255}
                    placeholder="Defaults to the page’s own share image"
                  />
                  {errors.og_image ? (
                    <div className="hint" style={{ color: 'var(--danger)' }}>
                      {errors.og_image}
                    </div>
                  ) : null}
                </div>
                <div className="fld">
                  <label htmlFor="tw_title">X (Twitter) title</label>
                  <input type="text" id="tw_title" name="tw_title" defaultValue={String(v.tw_title ?? '')} maxLength={255} placeholder="Defaults to the Open Graph title" />
                </div>
                <div className="fld">
                  <label htmlFor="tw_image">X (Twitter) image</label>
                  <input
                    type="text"
                    id="tw_image"
                    name="tw_image"
                    className={errors.tw_image ? 'is-invalid' : undefined}
                    defaultValue={String(v.tw_image ?? '')}
                    maxLength={255}
                    placeholder="Defaults to the social share image"
                  />
                  {errors.tw_image ? (
                    <div className="hint" style={{ color: 'var(--danger)' }}>
                      {errors.tw_image}
                    </div>
                  ) : null}
                </div>
                <div className="fld full">
                  <label htmlFor="tw_desc">X (Twitter) description</label>
                  <textarea id="tw_desc" name="tw_desc" rows={2} maxLength={320} defaultValue={String(v.tw_desc ?? '')} placeholder="Defaults to the Open Graph description" />
                </div>
                <div className="fld">
                  <label htmlFor="focus_kw">Focus keyword</label>
                  <input type="text" id="focus_kw" name="focus_kw" defaultValue={String(v.focus_kw ?? '')} maxLength={190} placeholder="accounting services dubai" />
                  <div className="hint">For your own tracking; not published.</div>
                </div>
                <div className="fld">
                  <label htmlFor="h1">H1</label>
                  <input type="text" id="h1" name="h1" defaultValue={String(v.h1 ?? '')} maxLength={255} placeholder="The page’s main heading" />
                  <div className="hint">Recorded for reference. The page&rsquo;s design sets its visible heading.</div>
                </div>
                <div className="fld full">
                  <label>FAQ (rich result)</label>
                  <div className="hint" style={{ marginBottom: 10 }}>
                    Published as <code>FAQPage</code> structured data. Use it only for questions the page itself answers.
                  </div>
                  <FaqRepeater initial={String(v.faq_json ?? '')} resetToken={state} />
                </div>
                <div className="fld full">
                  <label>Custom schema (JSON-LD)</label>
                  <SchemaRepeater initial={String(v.schema_jsonld ?? '')} resetToken={state} invalid={errors.schema} />
                </div>
              </div>
            </div>
          </section>

          <section className="panel" style={{ marginTop: 20 }}>
            <div className="panel-head">
              <h3>Social Sharing &amp; Sitemap</h3>
            </div>
            <div className="panel-body">
              <div className="form-grid">
                <div className="fld full">
                  <label htmlFor="og_title">
                    Open Graph Title{' '}
                    <span style={{ fontWeight: 400, color: 'var(--muted)' }}>(optional)</span>
                  </label>
                  <input
                    type="text"
                    id="og_title"
                    name="og_title"
                    defaultValue={String(v.og_title)}
                    maxLength={255}
                    placeholder="Defaults to the meta title"
                  />
                </div>
                <div className="fld full">
                  <label htmlFor="og_description">
                    Open Graph Description{' '}
                    <span style={{ fontWeight: 400, color: 'var(--muted)' }}>(optional)</span>
                  </label>
                  <textarea
                    id="og_description"
                    name="og_description"
                    rows={2}
                    maxLength={500}
                    placeholder="Defaults to the meta description"
                    defaultValue={String(v.og_description)}
                  />
                </div>

                <div className="fld">
                  <label htmlFor="priority">Sitemap Priority</label>
                  <select key={round} id="priority" name="priority" defaultValue={String(v.priority)}>
                    {PRIORITIES.map((p) => (
                      <option value={p} key={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="fld">
                  <label htmlFor="changefreq">Change Frequency</label>
                  <select key={round} id="changefreq" name="changefreq" defaultValue={String(v.changefreq)}>
                    {CHANGEFREQ.map((cf) => (
                      <option value={cf} key={cf}>
                        {cf.charAt(0).toUpperCase() + cf.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="fld full">
                  <label style={{ justifyContent: 'flex-start', gap: 10, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      name="in_sitemap"
                      value="1"
                      defaultChecked={Number(v.in_sitemap) === 1}
                      style={{ width: 'auto', accentColor: 'var(--brand)' }}
                    />
                    Include this page in sitemap.xml
                  </label>
                </div>
              </div>
            </div>
            <div className="form-actions">
              <SaveButton isNew={isNew} />
              <a href={adminUrl('pages')} className="btn">
                Cancel
              </a>
              {!isNew && liveMarkets.length ? (
                <>
                  <span className="spacer" />
                  {liveMarkets.map((m) => (
                    <a key={m.region} href={m.path} target="_blank" rel="noopener" className="btn sm">
                      View in {m.label}
                      <Icon name="arrowUpRight" size={14} />
                    </a>
                  ))}
                </>
              ) : null}
            </div>
          </section>
        </div>

        {/* Right column: live Google preview */}
        <div>
          <section className="panel serp-panel">
            <div className="panel-head">
              <h3>Google Search Preview</h3>
            </div>
            <div className="panel-body">
              <div className="serp">
                <div className="serp-site">
                  <span className="serp-fav">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={ADMIN_MARK} alt="" width={18} height={18} />
                  </span>
                  <span>
                    <span className="serp-name">Valunxt</span>
                    <br />
                    <span className="serp-url">{canonical.trim() || autoCanon}</span>
                  </span>
                </div>
                <div className="serp-title">{shownTitle}</div>
                <div className="serp-desc">{shownDesc}</div>
              </div>
              <div className="hint" style={{ marginTop: 12 }}>
                Google may rewrite the title or snippet, but this is what you are asking it to show.
              </div>
            </div>
          </section>
        </div>
      </div>
    </form>
  );
}
