'use client';

/**
 * The Blog & Insights editor: one form for both adding and editing a post.
 *
 * Laid out like the Pages editor it sits beside — the fields in the left
 * column, publishing and the live Google preview on the right — and built from
 * the same panel, field and button classes, so the two content screens are the
 * same screen with different fields.
 *
 * The submit is a Server Action, so the form still works with JavaScript
 * disabled; everything here (the slug suggestion, the counters, the preview,
 * the cover thumbnail) only adds the live feedback on top.
 */
import { useActionState, useEffect, useMemo, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';

import ConfirmSubmit from './ConfirmSubmit';
import Icon from './Icon';
import RichTextEditor from './RichTextEditor';
import { blogOpAction, saveBlogAction, type BlogFormState } from '@/lib/admin/blog-actions';
import { ADMIN_MARK, adminUrl } from '@/lib/admin/config';
import {
  BLOG_CATEGORIES,
  BLOG_DEFAULT_AUTHOR,
  BLOG_DEFAULT_AUTHOR_ROLE,
  BLOG_LIMITS,
  blogAutoMetaTitle,
  blogDateLong,
  blogPlainText,
  blogSlugify,
  type BlogPostInput,
} from '@/lib/blog/types';

export interface BlogEditorMarket {
  region: string;
  label: string;
}

function SaveButton({ isNew }: { isNew: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn primary" disabled={pending}>
      <Icon name="save" size={16} />
      {pending ? 'Saving…' : isNew ? 'Create Post' : 'Save Post'}
    </button>
  );
}

export default function BlogEditor({
  isNew,
  id,
  csrf,
  site,
  initial,
  markets,
  categories,
}: {
  isNew: boolean;
  id: number;
  csrf: string;
  /** The public site URL, e.g. https://valunxt.com */
  site: string;
  initial: BlogPostInput;
  /** Where the post is published — every market publishes /blogs/. */
  markets: BlogEditorMarket[];
  /** Categories already in use, merged with the standard list. */
  categories: string[];
}) {
  const [state, action] = useActionState<BlogFormState | null, FormData>(saveBlogAction, null);
  const errors = state?.errors ?? {};
  const v = { ...initial, ...(state?.values ?? {}) } as BlogPostInput;

  const [title, setTitle] = useState(v.title);
  const [slug, setSlug] = useState(v.slug);
  const [excerpt, setExcerpt] = useState(v.excerpt);
  const [body, setBody] = useState(v.body);
  const [cover, setCover] = useState(v.cover_image);
  const [status, setStatus] = useState(v.status);
  const [metaTitle, setMetaTitle] = useState(v.meta_title);
  const [metaDesc, setMetaDesc] = useState(v.meta_description);
  const [publishedAt, setPublishedAt] = useState(v.published_at);
  const [uploadName, setUploadName] = useState('');
  const slugTouched = useRef(!isNew && v.slug !== '');
  const formRef = useRef<HTMLFormElement>(null);

  // Keep the fields in step when the action returns with validation errors.
  useEffect(() => {
    const returned = state?.values;
    if (!returned) return;
    setTitle(String(returned.title ?? ''));
    setSlug(String(returned.slug ?? ''));
    setExcerpt(String(returned.excerpt ?? ''));
    setBody(String(returned.body ?? ''));
    setCover(String(returned.cover_image ?? ''));
    setMetaTitle(String(returned.meta_title ?? ''));
    setMetaDesc(String(returned.meta_description ?? ''));
    setPublishedAt(String(returned.published_at ?? ''));
    if (returned.status) setStatus(returned.status);
    /* A rejected save still stored any file that was chosen, and hands its path
       back above — so the pending-upload note has nothing left to announce, and
       the file input itself is empty again after the re-render. */
    setUploadName('');
  }, [state]);

  // A rejected save is reported at the top of the form, far above the button
  // that was pressed: bring the first field at fault into view.
  useEffect(() => {
    if (!state?.errors || !Object.keys(state.errors).length) return;
    const form = formRef.current;
    const target =
      form?.querySelector<HTMLElement>('.is-invalid') ?? form?.querySelector<HTMLElement>('.flash.err');
    if (!target) return;
    target.scrollIntoView({ block: 'center', behavior: 'smooth' });
    if (target.matches('input, textarea, select')) target.focus({ preventScroll: true });
  }, [state]);

  const liveSlug = slug.trim() || blogSlugify(title);
  const publicPaths = markets.map((m) => ({
    ...m,
    path: `/${m.region}/blogs/${liveSlug ? liveSlug + '/' : ''}`,
  }));
  const canonical = site + (publicPaths[0]?.path ?? '/blogs/');

  const autoTitle = useMemo(() => blogAutoMetaTitle(title), [title]);
  const autoExcerpt = useMemo(() => blogPlainText(body).slice(0, 180), [body]);

  const shownTitle = metaTitle.trim() || autoTitle;
  const effectiveDesc = metaDesc.trim() || excerpt.trim() || autoExcerpt;
  const shownDesc =
    effectiveDesc || 'Add an excerpt or meta description to control the snippet Google shows.';

  const counterClass = (len: number, min: number, max: number) => {
    if (!len) return 'counter';
    return 'counter ' + (len > max ? 'over' : len < min ? 'warn' : 'ok');
  };

  const allCategories = Array.from(new Set([...BLOG_CATEGORIES, ...categories])).sort();

  const fieldError = (key: keyof typeof errors) =>
    errors[key] ? (
      <div className="hint" style={{ color: 'var(--danger)' }}>
        {errors[key]}
      </div>
    ) : null;

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
            <span className="flash-text">
              The post was not saved. Correct the highlighted fields below and try again.
            </span>
          </div>
        ) : null}

        <div className="panel-grid editor-grid">
          {/* Left column: the post itself */}
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
                      className={errors.title ? 'is-invalid' : undefined}
                      aria-invalid={errors.title ? true : undefined}
                      value={title}
                      maxLength={BLOG_LIMITS.title}
                      required
                      placeholder="e.g. How High-Net-Worth Investors Build Wealth Through Real Estate"
                      onChange={(e) => {
                        setTitle(e.target.value);
                        if (!slugTouched.current) setSlug(blogSlugify(e.target.value));
                      }}
                    />
                    {fieldError('title')}
                    <div className="hint">
                      The headline on the article page, the Insights card and the browser tab.
                    </div>
                  </div>

                  <div className="fld full">
                    <label htmlFor="slug">URL Slug</label>
                    <div className="prefix-input">
                      <span className="px">{site}/&hellip;/blogs/</span>
                      <input
                        type="text"
                        id="slug"
                        name="slug"
                        className={errors.slug ? 'is-invalid' : undefined}
                        aria-invalid={errors.slug ? true : undefined}
                        value={slug}
                        maxLength={BLOG_LIMITS.slug}
                        placeholder="how-to-start-a-business"
                        onChange={(e) => {
                          slugTouched.current = true;
                          setSlug(e.target.value);
                        }}
                        onBlur={(e) => setSlug(blogSlugify(e.target.value))}
                      />
                    </div>
                    {fieldError('slug')}
                    <div className="hint">
                      Published at{' '}
                      {publicPaths.map((m, i) => (
                        <span key={m.region}>
                          {i > 0 ? (i === publicPaths.length - 1 ? ' and ' : ', ') : ''}
                          <code>{m.path}</code>
                        </span>
                      ))}
                      . Letters, numbers and hyphens only.
                      {isNew ? '' : ' Changing it changes the post’s address — the old one will 404.'}
                    </div>
                  </div>

                  <div className="fld">
                    <label htmlFor="category">Category</label>
                    <input
                      type="text"
                      id="category"
                      name="category"
                      list="blogCategories"
                      defaultValue={v.category}
                      maxLength={BLOG_LIMITS.category}
                      placeholder="Real Estate Wealth"
                    />
                    <datalist id="blogCategories">
                      {allCategories.map((c) => (
                        <option value={c} key={c} />
                      ))}
                    </datalist>
                    <div className="hint">Shown above the headline on the article page.</div>
                  </div>

                  <div className="fld">
                    <label htmlFor="published_at">Publish Date</label>
                    <input
                      type="date"
                      id="published_at"
                      name="published_at"
                      className={errors.published_at ? 'is-invalid' : undefined}
                      aria-invalid={errors.published_at ? true : undefined}
                      value={publishedAt}
                      onChange={(e) => setPublishedAt(e.target.value)}
                    />
                    {fieldError('published_at')}
                    <div className="hint">
                      {publishedAt
                        ? `Stamped “${blogDateLong(publishedAt)}”. A future date keeps the post off the site until then.`
                        : 'The date stamped on the card and the article.'}
                    </div>
                  </div>

                  <div className="fld full">
                    <label htmlFor="excerpt">
                      Excerpt{' '}
                      <span className={counterClass(excerpt.length, 80, BLOG_LIMITS.excerpt)}>
                        {excerpt.length}
                      </span>
                    </label>
                    <textarea
                      id="excerpt"
                      name="excerpt"
                      className={errors.excerpt ? 'is-invalid' : undefined}
                      aria-invalid={errors.excerpt ? true : undefined}
                      rows={3}
                      maxLength={BLOG_LIMITS.excerpt}
                      value={excerpt}
                      placeholder={autoExcerpt || 'One or two sentences shown on the Insights card.'}
                      onChange={(e) => setExcerpt(e.target.value)}
                    />
                    {fieldError('excerpt')}
                    <div className="hint">
                      Shown beneath the headline on the Insights listing, and used as the meta
                      description when that field is left blank.
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="panel" style={{ marginTop: 20 }}>
              <div className="panel-head">
                <h3>Article</h3>
              </div>
              <div className="panel-body">
                <RichTextEditor
                  name="body"
                  initialHtml={initial.body}
                  invalid={Boolean(errors.body)}
                  onChange={setBody}
                />
                {fieldError('body')}
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
                      <span className={counterClass(shownTitle.length, 50, 60)}>
                        {shownTitle.length}
                      </span>
                    </label>
                    <input
                      type="text"
                      id="meta_title"
                      name="meta_title"
                      className={errors.meta_title ? 'is-invalid' : undefined}
                      aria-invalid={errors.meta_title ? true : undefined}
                      value={metaTitle}
                      maxLength={BLOG_LIMITS.meta_title}
                      placeholder={autoTitle}
                      onChange={(e) => setMetaTitle(e.target.value)}
                    />
                    {fieldError('meta_title')}
                    <div className="hint">
                      Recommended 50–60 characters. Leave blank to use &ldquo;{autoTitle}&rdquo;.
                    </div>
                  </div>

                  <div className="fld full">
                    <label htmlFor="meta_description">
                      Meta Description{' '}
                      <span className={counterClass(effectiveDesc.length, 150, 160)}>
                        {effectiveDesc.length}
                      </span>
                    </label>
                    <textarea
                      id="meta_description"
                      name="meta_description"
                      className={errors.meta_description ? 'is-invalid' : undefined}
                      aria-invalid={errors.meta_description ? true : undefined}
                      rows={3}
                      maxLength={BLOG_LIMITS.meta_description}
                      value={metaDesc}
                      placeholder={excerpt.trim() || autoExcerpt || 'A short summary for search results.'}
                      onChange={(e) => setMetaDesc(e.target.value)}
                    />
                    {fieldError('meta_description')}
                    <div className="hint">
                      Recommended 150–160 characters. Leave blank to use the excerpt.
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
                      defaultValue={v.meta_keywords}
                      maxLength={BLOG_LIMITS.meta_keywords}
                      placeholder="real estate advisory, capital markets, dubai"
                    />
                    {fieldError('meta_keywords')}
                    <div className="hint">
                      Comma-separated. Most search engines ignore this tag, so it is safe to leave
                      empty.
                    </div>
                  </div>

                  <div className="fld full">
                    <label htmlFor="og_image">
                      Social Share Image{' '}
                      <span style={{ fontWeight: 400, color: 'var(--muted)' }}>(optional)</span>
                    </label>
                    <input
                      type="text"
                      id="og_image"
                      name="og_image"
                      className={errors.og_image ? 'is-invalid' : undefined}
                      aria-invalid={errors.og_image ? true : undefined}
                      defaultValue={v.og_image}
                      maxLength={BLOG_LIMITS.og_image}
                      placeholder="Defaults to the cover image"
                    />
                    {fieldError('og_image')}
                    <div className="hint">
                      What LinkedIn and X show when the article is shared.
                    </div>
                  </div>
                </div>
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
                      <a
                        key={m.region}
                        href={m.path}
                        target="_blank"
                        rel="noopener"
                        className="btn sm"
                      >
                        View in {m.label}
                        <Icon name="arrowUpRight" size={14} />
                      </a>
                    ))}
                  </>
                ) : null}
              </div>
            </section>
          </div>

          {/* Right column: publishing, the cover, the preview */}
          <div>
            <section className="panel">
              <div className="panel-head">
                <h3>Publish</h3>
              </div>
              <div className="panel-body">
                <div className="form-grid">
                  <div className="fld full">
                    <label htmlFor="status">Status</label>
                    <select
                      id="status"
                      name="status"
                      value={status}
                      onChange={(e) => setStatus(e.target.value as BlogPostInput['status'])}
                    >
                      <option value="published">Published</option>
                      <option value="draft">Draft (not on the website)</option>
                    </select>
                    <div className="hint">
                      {status === 'published'
                        ? 'Live on /blogs/ and listed in sitemap.xml.'
                        : 'Kept out of the listing, the sitemap and the article route.'}
                    </div>
                  </div>

                  <div className="fld full">
                    <label style={{ justifyContent: 'flex-start', gap: 10, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        name="featured"
                        value="1"
                        defaultChecked={Number(v.featured) === 1}
                        style={{ width: 'auto', accentColor: 'var(--brand)' }}
                      />
                      Featured post
                    </label>
                    <div className="hint">Pins the post to the top of the Insights listing.</div>
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
                      Include in sitemap.xml
                    </label>
                  </div>

                  <div className="fld full">
                    <label htmlFor="author">Author</label>
                    <input
                      type="text"
                      id="author"
                      name="author"
                      defaultValue={v.author}
                      maxLength={BLOG_LIMITS.author}
                      placeholder={BLOG_DEFAULT_AUTHOR}
                    />
                  </div>
                  <div className="fld full">
                    <label htmlFor="author_role">Author Role</label>
                    <input
                      type="text"
                      id="author_role"
                      name="author_role"
                      defaultValue={v.author_role}
                      maxLength={BLOG_LIMITS.author_role}
                      placeholder={BLOG_DEFAULT_AUTHOR_ROLE}
                    />
                    <div className="hint">The byline in the article sidebar.</div>
                  </div>
                </div>
              </div>
            </section>

            <section className="panel" style={{ marginTop: 20 }}>
              <div className="panel-head">
                <h3>Cover Image</h3>
              </div>
              <div className="panel-body">
                {cover ? (
                  <div className="cover-preview">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={cover} alt="" />
                  </div>
                ) : (
                  <div className="cover-preview is-empty">
                    <Icon name="image" size={26} />
                    <span>No cover image yet</span>
                  </div>
                )}

                <div className="form-grid" style={{ marginTop: 14 }}>
                  <div className="fld full">
                    <label htmlFor="cover_file">Upload a new image</label>
                    <input
                      type="file"
                      id="cover_file"
                      name="cover_file"
                      accept="image/webp,image/jpeg,image/png,image/avif,image/gif"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        setUploadName(file ? file.name : '');
                        if (!file) return;
                        // Release the last preview before replacing it.
                        setCover((prev) => {
                          if (prev.startsWith('blob:')) URL.revokeObjectURL(prev);
                          return URL.createObjectURL(file);
                        });
                      }}
                    />
                    <div className="hint">
                      {uploadName
                        ? `“${uploadName}” will replace the cover when you save.`
                        : 'WebP, JPEG, PNG, AVIF or GIF, up to 5 MB. Saved into /assets/content/uploads/blogs/.'}
                    </div>
                  </div>

                  <div className="fld full">
                    <label htmlFor="cover_image">…or an existing path</label>
                    <input
                      type="text"
                      id="cover_image"
                      name="cover_image"
                      className={errors.cover_image ? 'is-invalid' : undefined}
                      aria-invalid={errors.cover_image ? true : undefined}
                      value={cover.startsWith('blob:') ? v.cover_image : cover}
                      maxLength={BLOG_LIMITS.cover_image}
                      placeholder="/assets/content/uploads/blogs/blog-1.webp"
                      onChange={(e) => setCover(e.target.value)}
                    />
                    {fieldError('cover_image')}
                  </div>

                  <div className="fld full">
                    <label htmlFor="cover_alt">Alt Text</label>
                    <input
                      type="text"
                      id="cover_alt"
                      name="cover_alt"
                      defaultValue={v.cover_alt}
                      maxLength={BLOG_LIMITS.cover_alt}
                      placeholder="Describe what the image shows"
                    />
                    <div className="hint">Read out to screen readers in place of the picture.</div>
                  </div>
                </div>
              </div>
            </section>

            <section className="panel serp-panel" style={{ marginTop: 20 }}>
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
                      <span className="serp-url">{canonical}</span>
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

      {/* Deleting is its own form: a form cannot be nested inside another. */}
      {!isNew ? (
        <section className="panel" style={{ marginTop: 20 }}>
          <div className="panel-head">
            <h3>Danger Zone</h3>
          </div>
          <div className="panel-body">
            <div className="form-actions" style={{ padding: 0, border: 0 }}>
              <span className="form-note">
                Deleting removes the post from the database and from the website. This cannot be
                undone.
              </span>
              <span className="spacer" />
              <form action={blogOpAction}>
                <input type="hidden" name="op" value="delete" />
                <input type="hidden" name="csrf" value={csrf} />
                <input type="hidden" name="id" value={id} />
                <input type="hidden" name="back" value={adminUrl('blogs')} />
                <ConfirmSubmit
                  label={`Delete ${title}`}
                  confirmLabel="Delete this post?"
                  className="btn ghost-danger"
                >
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
