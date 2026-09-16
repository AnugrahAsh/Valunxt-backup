'use client';

/**
 * The Blog & Insights editor: one form for writing and editing a `vx_posts` row.
 *
 * Laid out like the www.valunxt.com panel's post form it replaces — the post
 * and its structured data on the left, publishing and SEO on the right — and
 * built from the Pages editor's panel, field and button classes, so the content
 * screens read as one module.
 *
 * The submit is a Server Action, so the form still works with JavaScript
 * disabled; the slug suggestion, the counters, the preview and the repeaters
 * only add live feedback on top.
 */
import { useActionState, useEffect, useMemo, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';

import ConfirmSubmit from './ConfirmSubmit';
import Icon from './Icon';
import RichTextEditor from './RichTextEditor';
import { FaqRepeater, SchemaRepeater } from './StructuredDataFields';
import { useSubmitRound } from './useSubmitRound';
import { blogOpAction, saveBlogAction, type BlogFormState } from '@/lib/admin/blog-actions';
import { ADMIN_MARK, adminUrl } from '@/lib/admin/config';
import {
  BLOG_CATEGORIES,
  BLOG_DEFAULT_AUTHOR_ROLE,
  BLOG_LIMITS,
  BLOG_ROBOTS,
  BLOG_SCHEMA_TYPES,
  blogAutoMetaTitle,
  blogDateLong,
  blogPlainText,
  blogReadMinutes,
  blogSlugify,
  type BlogPostInput,
} from '@/lib/blog/types';

export interface BlogEditorMarket {
  region: string;
  label: string;
}

export interface BlogEditorAuthor {
  id: number;
  name: string;
  title: string;
}

function SaveButton({ isNew, block }: { isNew: boolean; block?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={'btn primary' + (block ? ' block' : '')} disabled={pending}>
      <Icon name="save" size={16} />
      {pending ? 'Saving…' : isNew ? 'Create Post' : 'Save'}
    </button>
  );
}

export default function BlogEditor({
  isNew,
  id,
  csrf,
  site,
  initial,
  publishDate,
  markets,
  categories,
  authors,
  coverMissing = false,
}: {
  isNew: boolean;
  id: number;
  csrf: string;
  /** The public site URL, e.g. https://valunxt.com */
  site: string;
  initial: BlogPostInput;
  /** 'YYYY-MM-DD' of initial.published_at, or today for a new post. */
  publishDate: string;
  /** Where the post is published — every market publishes /blogs/. */
  markets: BlogEditorMarket[];
  /** Categories already in use, merged with the standard list. */
  categories: string[];
  authors: BlogEditorAuthor[];
  /** The saved cover names a file public/ does not have (an imported post's). */
  coverMissing?: boolean;
}) {
  const [state, action] = useActionState<BlogFormState | null, FormData>(saveBlogAction, null);
  const errors = state?.errors ?? {};
  const v = { ...initial, ...(state?.values ?? {}) } as BlogPostInput;
  // Remounts the uncontrolled selects after a rejected save (see useSubmitRound).
  const round = useSubmitRound(state);

  const [title, setTitle] = useState(v.title);
  const [slug, setSlug] = useState(v.slug);
  const [excerpt, setExcerpt] = useState(v.excerpt);
  const [body, setBody] = useState(v.body_html);
  const [cover, setCover] = useState(v.cover);
  // The cover path whose file could not be loaded: its preview explains instead.
  const [brokenCover, setBrokenCover] = useState(coverMissing ? v.cover : '');
  const [status, setStatus] = useState(v.status);
  const [metaTitle, setMetaTitle] = useState(v.meta_title);
  const [metaDesc, setMetaDesc] = useState(v.meta_desc);
  const [date, setDate] = useState(publishDate);
  const [authorId, setAuthorId] = useState(v.author_id ? String(v.author_id) : '');
  const [uploadName, setUploadName] = useState('');
  const slugTouched = useRef(!isNew && v.slug !== '');
  const formRef = useRef<HTMLFormElement>(null);

  // Keep the fields in step when the action returns with validation errors.
  useEffect(() => {
    const r = state?.values;
    if (!r) return;
    setTitle(String(r.title ?? ''));
    setSlug(String(r.slug ?? ''));
    setExcerpt(String(r.excerpt ?? ''));
    setBody(String(r.body_html ?? ''));
    setCover(String(r.cover ?? ''));
    setMetaTitle(String(r.meta_title ?? ''));
    setMetaDesc(String(r.meta_desc ?? ''));
    setDate(String(r.publish_date ?? ''));
    setAuthorId(r.author_id ? String(r.author_id) : '');
    if (r.status) setStatus(r.status);
    // A rejected save still stored any chosen file and handed its path back.
    setUploadName('');
  }, [state]);

  // A rejected save is reported at the top of the form: bring the first field at fault into view.
  useEffect(() => {
    if (!state?.errors || !Object.keys(state.errors).length) return;
    const form = formRef.current;
    const target = form?.querySelector<HTMLElement>('.is-invalid') ?? form?.querySelector<HTMLElement>('.flash.err');
    if (!target) return;
    target.scrollIntoView({ block: 'center', behavior: 'smooth' });
    if (target.matches('input, textarea, select')) target.focus({ preventScroll: true });
  }, [state]);

  const liveSlug = slug.trim() || blogSlugify(title);
  const publicPaths = markets.map((m) => ({ ...m, path: `/${m.region}/blogs/${liveSlug ? liveSlug + '/' : ''}` }));
  const uaePath = publicPaths.find((p) => p.region === 'en-ae') ?? publicPaths[0];
  const canonical = site + (uaePath?.path ?? '/blogs/');

  const autoTitle = useMemo(() => blogAutoMetaTitle(title), [title]);
  const autoExcerpt = useMemo(() => blogPlainText(body).slice(0, 180), [body]);
  const shownTitle = metaTitle.trim() || autoTitle;
  const effectiveDesc = metaDesc.trim() || excerpt.trim() || autoExcerpt;
  const selectedAuthor = authors.find((a) => String(a.id) === authorId);

  const counterClass = (len: number, min: number, max: number) =>
    !len ? 'counter' : 'counter ' + (len > max ? 'over' : len < min ? 'warn' : 'ok');

  const allCategories = Array.from(new Set([...BLOG_CATEGORIES, ...categories])).sort();

  const fieldError = (key: keyof typeof errors) =>
    errors[key] ? (
      <div className="hint" style={{ color: 'var(--danger)' }}>
        {errors[key]}
      </div>
    ) : null;
  const invalid = (key: keyof typeof errors) => (errors[key] ? 'is-invalid' : undefined);

  return (
    <>
      <form action={action} id="blogForm" ref={formRef}>
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
            <span className="flash-text">The post was not saved. Correct the highlighted fields below and try again.</span>
          </div>
        ) : null}

        <div className="panel-grid editor-grid">
          {/* ---- Left: the post and its structured data ---- */}
          <div>
            <section className="panel">
              <div className="panel-head">
                <h3>Post</h3>
              </div>
              <div className="panel-body">
                <div className="form-grid">
                  <div className="fld full">
                    <label htmlFor="title">
                      Title <span className="counter">{title.length}</span>
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      className={invalid('title')}
                      aria-invalid={errors.title ? true : undefined}
                      value={title}
                      maxLength={BLOG_LIMITS.title}
                      required
                      placeholder="e.g. VAT Refunds in the UAE: A Practical Guide"
                      onChange={(e) => {
                        setTitle(e.target.value);
                        if (!slugTouched.current) setSlug(blogSlugify(e.target.value));
                      }}
                    />
                    {fieldError('title')}
                  </div>

                  <div className="fld">
                    <label htmlFor="slug">Slug</label>
                    <input
                      type="text"
                      id="slug"
                      name="slug"
                      className={invalid('slug')}
                      aria-invalid={errors.slug ? true : undefined}
                      value={slug}
                      maxLength={BLOG_LIMITS.slug}
                      placeholder="vat-refunds-guide"
                      onChange={(e) => {
                        slugTouched.current = true;
                        setSlug(e.target.value);
                      }}
                      onBlur={(e) => setSlug(blogSlugify(e.target.value))}
                    />
                    {fieldError('slug')}
                    <div className="hint">
                      URL: <code>/blogs/{liveSlug || 'slug'}/</code>
                      {isNew ? '' : ' — changing it breaks the old address unless you add a redirect.'}
                    </div>
                  </div>

                  <div className="fld">
                    <label htmlFor="cat">Category</label>
                    <input
                      type="text"
                      id="cat"
                      name="cat"
                      list="blogCategories"
                      className={invalid('cat')}
                      defaultValue={v.cat}
                      maxLength={BLOG_LIMITS.cat}
                      placeholder="Corporate Tax"
                    />
                    <datalist id="blogCategories">
                      {allCategories.map((c) => (
                        <option value={c} key={c} />
                      ))}
                    </datalist>
                    {fieldError('cat')}
                  </div>

                  <div className="fld full">
                    <label htmlFor="excerpt">
                      Excerpt <span className={counterClass(excerpt.length, 80, 320)}>{excerpt.length}</span>
                    </label>
                    <textarea
                      id="excerpt"
                      name="excerpt"
                      className={invalid('excerpt')}
                      rows={3}
                      maxLength={BLOG_LIMITS.excerpt}
                      value={excerpt}
                      placeholder={autoExcerpt || 'One or two sentences used on listing cards and as the default meta description.'}
                      onChange={(e) => setExcerpt(e.target.value)}
                    />
                    {fieldError('excerpt')}
                  </div>

                  <div className="fld full">
                    <label htmlFor="tags">
                      Tags <span style={{ fontWeight: 400, color: 'var(--muted)' }}>(optional)</span>
                    </label>
                    <input
                      type="text"
                      id="tags"
                      name="tags"
                      className={invalid('tags')}
                      defaultValue={v.tags}
                      maxLength={BLOG_LIMITS.tags}
                      placeholder="vat, penalties, startups"
                    />
                    {fieldError('tags')}
                    <div className="hint">Comma-separated. Shown as the article&rsquo;s topics; the category is used when empty.</div>
                  </div>
                </div>
              </div>
            </section>

            <section className="panel" style={{ marginTop: 20 }}>
              <div className="panel-head">
                <h3>Text Editor for Blog Details Page</h3>
              </div>
              <div className="panel-body">
                <RichTextEditor name="body_html" initialHtml={initial.body_html} invalid={Boolean(errors.body_html)} onChange={setBody} />
                {fieldError('body_html')}
                <div className="hint">Estimated {blogReadMinutes(body)} min read, stored with the post.</div>
              </div>
            </section>

            <section className="panel" style={{ marginTop: 20 }}>
              <div className="panel-head">
                <h3>Schema &amp; Structured Data</h3>
              </div>
              <div className="panel-body">
                <p className="panel-lede">
                  Every article publishes its own <code>{v.schema_type || 'BlogPosting'}</code> and{' '}
                  <code>BreadcrumbList</code> JSON-LD automatically, unless a block below already declares that type.
                </p>
                <div className="form-grid">
                  <div className="fld">
                    <label htmlFor="schema_type">Article type</label>
                    <select key={round} id="schema_type" name="schema_type" defaultValue={v.schema_type || 'BlogPosting'}>
                      {BLOG_SCHEMA_TYPES.map(([value, label]) => (
                        <option value={value} key={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <h4 className="panel-subhead">FAQ (rich result)</h4>
                <p className="panel-lede">
                  Question and answer pairs render as a visible FAQ at the end of the article and publish a{' '}
                  <code>FAQPage</code> schema. Rows with an empty question or answer are ignored.
                </p>
                <FaqRepeater initial={v.faq_json} resetToken={state} />

                <h4 className="panel-subhead">Custom schema (JSON-LD)</h4>
                <p className="panel-lede">Optional extra blocks. Each must be valid JSON; empty blocks are ignored.</p>
                <SchemaRepeater initial={v.schema_jsonld} resetToken={state} invalid={errors.schema} />
              </div>
              <div className="form-actions">
                <SaveButton isNew={isNew} />
                <a href={adminUrl('blogs')} className="btn">
                  Cancel
                </a>
                {!isNew && status === 'published' ? (
                  <>
                    <span className="spacer" />
                    {publicPaths.map((m) => (
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

          {/* ---- Right: publishing and SEO ---- */}
          <div>
            <section className="panel">
              <div className="panel-head">
                <h3>Publish</h3>
                <span className={`pill ${status === 'published' ? 'ok' : 'off'}`}>
                  <span className="pill-dot" />
                  {status === 'published' ? 'Published' : 'Draft'}
                </span>
              </div>
              <div className="panel-body">
                <div className="form-grid">
                  <div className="fld">
                    <label htmlFor="status">Status</label>
                    {/* Uncontrolled, like every select here: after a rejected save React
                        resets the form, which puts a controlled select back on the option it
                        first rendered while its state still says otherwise. The state only
                        drives the pill and the hint. */}
                    <select
                      key={round}
                      id="status"
                      name="status"
                      defaultValue={v.status}
                      onChange={(e) => setStatus(e.target.value as BlogPostInput['status'])}
                    >
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>
                  <div className="fld">
                    <label htmlFor="publish_date">Publish date</label>
                    <input
                      type="date"
                      id="publish_date"
                      name="publish_date"
                      className={invalid('published_at')}
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                    />
                  </div>
                  <div className="fld full">
                    {fieldError('published_at')}
                    <div className="hint">
                      {status === 'published'
                        ? date
                          ? `Live from ${blogDateLong(date)}. A future date keeps it off the site until then.`
                          : 'A published post needs a date.'
                        : 'Drafts are kept off the listing, the sitemap and the article route.'}
                    </div>
                  </div>

                  <div className="fld full">
                    <label className="check">
                      <input type="checkbox" name="featured" value="1" defaultChecked={Number(v.featured) === 1} />
                      Featured post
                    </label>
                    <div className="hint">Pins this article to the top of the Insights listing.</div>
                  </div>
                  <div className="fld full">
                    <label className="check">
                      <input type="checkbox" name="in_sitemap" value="1" defaultChecked={Number(v.in_sitemap) === 1} />
                      Include in sitemap
                    </label>
                    <div className="hint">
                      Lists this URL in <code>sitemap.xml</code> for search engines.
                    </div>
                  </div>

                  <div className="fld full">
                    <label htmlFor="author_id">Author</label>
                    <select
                      id="author_id"
                      name="author_id"
                      key={round}
                      className={invalid('author_id')}
                      defaultValue={v.author_id ? String(v.author_id) : ''}
                      onChange={(e) => setAuthorId(e.target.value)}
                    >
                      <option value="">{v.author ? `${v.author} (no profile)` : 'Valunxt (no profile)'}</option>
                      {authors.map((a) => (
                        <option value={a.id} key={a.id}>
                          {a.name}
                        </option>
                      ))}
                    </select>
                    {fieldError('author_id')}
                    <div className="hint">
                      <a className="link" href={adminUrl('authors')} target="_blank" rel="noopener">
                        Manage author profiles →
                      </a>{' '}
                      add a photo, role and bio.
                    </div>
                  </div>
                  <div className="fld full">
                    <label htmlFor="author_role">
                      Byline role <span style={{ fontWeight: 400, color: 'var(--muted)' }}>(optional)</span>
                    </label>
                    <input
                      type="text"
                      id="author_role"
                      name="author_role"
                      className={invalid('author_role')}
                      defaultValue={v.author_role}
                      maxLength={BLOG_LIMITS.author_role}
                      placeholder={selectedAuthor?.title || BLOG_DEFAULT_AUTHOR_ROLE}
                    />
                    {fieldError('author_role')}
                  </div>

                  <div className="fld full">
                    <label htmlFor="cover_file">Cover image</label>
                    {cover && cover === brokenCover ? (
                      <div className="cover-preview is-empty">
                        <Icon name="image" size={26} />
                        <span>
                          This image is not on the website yet. The site shows the default cover until it is
                          uploaded.
                        </span>
                      </div>
                    ) : cover ? (
                      <div className="cover-preview">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={cover} alt="" onError={() => setBrokenCover(cover)} />
                      </div>
                    ) : (
                      <div className="cover-preview is-empty">
                        <Icon name="image" size={26} />
                        <span>No cover image yet</span>
                      </div>
                    )}
                    <input
                      type="file"
                      id="cover_file"
                      name="cover_file"
                      style={{ marginTop: 10 }}
                      accept="image/webp,image/jpeg,image/png,image/avif,image/gif"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        setUploadName(file ? file.name : '');
                        if (!file) return;
                        setCover((prev) => {
                          if (prev.startsWith('blob:')) URL.revokeObjectURL(prev);
                          return URL.createObjectURL(file);
                        });
                      }}
                    />
                    <input
                      type="text"
                      id="cover"
                      name="cover"
                      aria-label="Cover image path"
                      style={{ marginTop: 10 }}
                      className={invalid('cover')}
                      value={cover.startsWith('blob:') ? v.cover : cover}
                      maxLength={BLOG_LIMITS.cover}
                      placeholder="…or an existing path, e.g. /images/blogs/cms/cover.webp"
                      onChange={(e) => setCover(e.target.value)}
                    />
                    {fieldError('cover')}
                    <div className="hint">
                      {uploadName ? `“${uploadName}” will replace the cover when you save.` : 'WebP, JPEG, PNG, AVIF or GIF, up to 5 MB.'}
                    </div>
                  </div>
                  <div className="fld full">
                    <label htmlFor="cover_alt">Cover image alt text</label>
                    <input
                      type="text"
                      id="cover_alt"
                      name="cover_alt"
                      defaultValue={v.cover_alt}
                      maxLength={BLOG_LIMITS.cover_alt}
                      placeholder="Describe what the image shows — defaults to the title"
                    />
                    <div className="hint">Used for the social share image and image SEO, and read out to screen readers.</div>
                  </div>
                </div>
              </div>
              <div className="form-actions">
                <SaveButton isNew={isNew} />
              </div>
            </section>

            <section className="panel" style={{ marginTop: 20 }}>
              <div className="panel-head">
                <h3>SEO</h3>
              </div>
              <div className="panel-body">
                <div className="form-grid">
                  <div className="fld full">
                    <label htmlFor="meta_title">
                      Meta title <span className={counterClass(shownTitle.length, 30, 60)}>{shownTitle.length} / 60</span>
                    </label>
                    <input
                      type="text"
                      id="meta_title"
                      name="meta_title"
                      className={invalid('meta_title')}
                      value={metaTitle}
                      maxLength={BLOG_LIMITS.meta_title}
                      placeholder={`Defaults to “${autoTitle}”`}
                      onChange={(e) => setMetaTitle(e.target.value)}
                    />
                    {fieldError('meta_title')}
                  </div>
                  <div className="fld full">
                    <label htmlFor="meta_desc">
                      Meta description{' '}
                      <span className={counterClass(effectiveDesc.length, 120, 158)}>{effectiveDesc.length} / 158</span>
                    </label>
                    <textarea
                      id="meta_desc"
                      name="meta_desc"
                      className={invalid('meta_desc')}
                      rows={3}
                      maxLength={BLOG_LIMITS.meta_desc}
                      value={metaDesc}
                      placeholder="Defaults to the excerpt"
                      onChange={(e) => setMetaDesc(e.target.value)}
                    />
                    {fieldError('meta_desc')}
                  </div>
                  <div className="fld full">
                    <label htmlFor="focus_kw">Focus keyword</label>
                    <input
                      type="text"
                      id="focus_kw"
                      name="focus_kw"
                      className={invalid('focus_kw')}
                      defaultValue={v.focus_kw}
                      maxLength={BLOG_LIMITS.focus_kw}
                      placeholder="uae vat refund"
                    />
                    {fieldError('focus_kw')}
                  </div>
                  <div className="fld full">
                    <label htmlFor="keywords">Keywords</label>
                    <input
                      type="text"
                      id="keywords"
                      name="keywords"
                      className={invalid('keywords')}
                      defaultValue={v.keywords}
                      maxLength={BLOG_LIMITS.keywords}
                      placeholder="uae vat refund, fta vat claim"
                    />
                    {fieldError('keywords')}
                  </div>
                  <div className="fld full">
                    <label htmlFor="og_image">Social share image (OG)</label>
                    <input
                      type="text"
                      id="og_image"
                      name="og_image"
                      className={invalid('og_image')}
                      defaultValue={v.og_image}
                      maxLength={BLOG_LIMITS.og_image}
                      placeholder="Defaults to the cover image"
                    />
                    {fieldError('og_image')}
                  </div>
                  <div className="fld full">
                    <label htmlFor="og_title">Social title</label>
                    <input type="text" id="og_title" name="og_title" defaultValue={v.og_title} maxLength={BLOG_LIMITS.og_title} placeholder="Defaults to the meta title" />
                    {fieldError('og_title')}
                  </div>
                  <div className="fld full">
                    <label htmlFor="og_desc">Social description</label>
                    <textarea id="og_desc" name="og_desc" rows={2} defaultValue={v.og_desc} maxLength={BLOG_LIMITS.og_desc} placeholder="Defaults to the meta description" />
                    {fieldError('og_desc')}
                  </div>

                  <details className="fld full field-group">
                    <summary>X (Twitter) card, canonical and robots</summary>
                    <div className="form-grid" style={{ marginTop: 12 }}>
                      <div className="fld">
                        <label htmlFor="tw_card">Card</label>
                        <select key={round} id="tw_card" name="tw_card" defaultValue={v.tw_card || 'summary_large_image'}>
                          <option value="summary_large_image">Large image</option>
                          <option value="summary">Summary</option>
                        </select>
                      </div>
                      <div className="fld">
                        <label htmlFor="robots">Robots</label>
                        <select key={round} id="robots" name="robots" defaultValue={v.robots || 'index, follow'}>
                          {BLOG_ROBOTS.map((r) => (
                            <option value={r} key={r}>
                              {r}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="fld full">
                        <label htmlFor="tw_title">X title</label>
                        <input type="text" id="tw_title" name="tw_title" defaultValue={v.tw_title} maxLength={BLOG_LIMITS.tw_title} placeholder="Defaults to the social title" />
                      </div>
                      <div className="fld full">
                        <label htmlFor="tw_desc">X description</label>
                        <textarea id="tw_desc" name="tw_desc" rows={2} defaultValue={v.tw_desc} maxLength={BLOG_LIMITS.tw_desc} placeholder="Defaults to the social description" />
                      </div>
                      <div className="fld full">
                        <label htmlFor="tw_image">X image</label>
                        <input type="text" id="tw_image" name="tw_image" className={invalid('tw_image')} defaultValue={v.tw_image} maxLength={BLOG_LIMITS.tw_image} placeholder="Defaults to the social share image" />
                        {fieldError('tw_image')}
                      </div>
                      <div className="fld full">
                        <label htmlFor="canonical">Canonical URL</label>
                        <input type="text" id="canonical" name="canonical" className={invalid('canonical')} defaultValue={v.canonical} maxLength={BLOG_LIMITS.canonical} placeholder={canonical} />
                        {fieldError('canonical')}
                      </div>
                    </div>
                  </details>

                  <div className="fld full">
                    <label>Google preview</label>
                    <div className="serp">
                      <div className="serp-site">
                        <span className="serp-fav">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={ADMIN_MARK} alt="" width={18} height={18} />
                        </span>
                        <span>
                          <span className="serp-name">Valunxt</span>
                          <br />
                          <span className="serp-url">{canonical}</span>
                        </span>
                      </div>
                      <div className="serp-title">{shownTitle}</div>
                      <div className="serp-desc">{effectiveDesc || 'Meta description preview…'}</div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </form>

      {/* Deleting is its own form: a form cannot be nested inside another. */}
      {!isNew ? (
        <section className="panel" style={{ marginTop: 20 }}>
          <div className="panel-head">
            <h3>Danger Zone</h3>
          </div>
          <div className="panel-body">
            <div className="form-actions" style={{ padding: 0, border: 0 }}>
              <span className="form-note">
                Deleting removes the post from the database and from the website. This cannot be undone.
              </span>
              <span className="spacer" />
              <form action={blogOpAction}>
                <input type="hidden" name="op" value="delete" />
                <input type="hidden" name="csrf" value={csrf} />
                <input type="hidden" name="id" value={id} />
                <input type="hidden" name="back" value={adminUrl('blogs')} />
                <ConfirmSubmit label={`Delete ${title}`} confirmLabel="Delete this post?" className="btn ghost-danger">
                  <Icon name="trash" size={15} />
                  Delete post
                </ConfirmSubmit>
              </form>
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
