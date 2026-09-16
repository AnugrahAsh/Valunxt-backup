'use server';

/**
 * The panel's session, page-SEO, sitemap and account writes.
 *
 * Same shape throughout: check who is asking (lib/admin/guard.ts), validate,
 * act, set a flash, redirect. Every operation that can change what search
 * engines see finishes by calling seoRegenerate(). Blog posts, leads and the
 * table-backed screens have their own action files beside this one.
 */
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

import { adminUrl, brandText, DEFAULT_ADMIN_PASS, SHOW_DEFAULT_CREDENTIALS } from './config';
import { attemptLogin, execute, findAccount, passwordMatches, query, setPassword } from './db';
import {
  clientIp,
  recentAccountFailures,
  logSecurityEvent,
  recentLoginFailures,
  requestOrigin,
  requireAdmin,
  requireCsrf,
  requireUser,
  safeBack,
} from './guard';
import { csrfOk, loginUser, logoutUser, refreshUser, setFlash } from './session';
import {
  CHANGEFREQ_OPTIONS,
  DEFAULT_SITE_ORIGIN,
  ROBOTS_OPTIONS,
  reservedCmsSlug,
  seoCmsFilePath,
  seoLegacyReplacement,
  seoNormalizeSlug,
  seoPage,
  seoPageBySlug,
  seoPlacement,
  seoRegenerate,
  seoSettingSet,
  seoSlugTaken,
  seoSyncPages,
  type PageRow,
} from './seo-lib';

/** The public pages whose rendered output depends on the SEO cache. */
function revalidateSite() {
  revalidatePath('/', 'layout');
}

/* ---- Session ------------------------------------------------------------- */

/**
 * Failed sign-ins before further attempts are turned away for a while: from one
 * address, or against one account from any address (see recentAccountFailures).
 * The account limit is higher, so a stranger's typos cost an administrator less.
 */
const LOCKOUT_AFTER = 5;
const ACCOUNT_LOCKOUT_AFTER = 10;
const LOCKOUT_MINUTES = 15;

export async function loginAction(_prev: { error?: string } | null, form: FormData) {
  const email = String(form.get('email') ?? '').trim();
  const password = String(form.get('password') ?? '');

  if (email === '' || password === '') {
    return { error: 'Please enter both your email and password.', email };
  }

  const ip = await clientIp();
  if (
    (await recentLoginFailures(ip, LOCKOUT_MINUTES)) >= LOCKOUT_AFTER ||
    (await recentAccountFailures(email, LOCKOUT_MINUTES)) >= ACCOUNT_LOCKOUT_AFTER
  ) {
    await logSecurityEvent('login_blocked', email, '/admin/');
    return {
      error: `Too many failed sign-in attempts. Try again in ${LOCKOUT_MINUTES} minutes.`,
      email,
    };
  }

  let user;
  try {
    user = await attemptLogin(email, password);
  } catch {
    return { error: 'Could not reach the database. Please ensure MySQL is running.', email };
  }

  if (!user) {
    await logSecurityEvent('login_fail', email, '/admin/');
    return { error: 'Invalid credentials. Please check your email and password.', email };
  }

  await loginUser({ id: user.id, name: user.name, email: user.email, role: user.role }, form.get('remember') === '1');
  // The seeded default password is printed in the README and .env.example. On a
  // deployed panel, an account still using it goes straight to the password
  // form. (In development the sign-in screen prefills it on purpose.)
  if (!SHOW_DEFAULT_CREDENTIALS && password === DEFAULT_ADMIN_PASS) {
    await setFlash({ err: 'This account still uses the default password. Choose a new one before continuing.' });
    redirect(adminUrl('settings') + '#password');
  }
  redirect(adminUrl('dashboard'));
}

export async function logoutAction() {
  await logoutUser();
  redirect(adminUrl(''));
}

/* ---- Pages listing ------------------------------------------------------- */

export async function pagesOpAction(form: FormData) {
  await requireUser();
  const op = String(form.get('op') ?? '');
  const id = Number(form.get('id') ?? 0);
  const back = safeBack(form.get('back'), adminUrl('pages'));
  const origin = await requestOrigin();
  await requireCsrf(form, back);

  try {
    if (op === 'sync') {
      const res = await seoSyncPages();
      const gen = await seoRegenerate(origin);
      const changes = [
        res.added ? `${res.added} new page${res.added === 1 ? '' : 's'} added` : '',
        res.removed ? `${res.removed} old page${res.removed === 1 ? '' : 's'} removed` : '',
      ].filter(Boolean);
      await setFlash({
        ok:
          (changes.length
            ? `${changes.join(', ')}.`
            : `The CMS already lists all ${res.total} pages the website publishes.`) +
          ` Sitemap regenerated with ${gen.count} URLs.`,
        err: gen.errors.length ? gen.errors.join(' ') : undefined,
      });
    } else if (op === 'toggle_status') {
      const page = await seoPage(id);
      if (page) {
        const next = page.status === 'published' ? 'draft' : 'published';
        await execute('UPDATE vx_page_seo SET status = ? WHERE id = ?', [next, id]);
        await seoRegenerate(origin);
        await setFlash({ ok: `“${page.title || page.slug}” is now ${next}. Sitemap regenerated.` });
      }
    } else if (op === 'toggle_sitemap') {
      const page = await seoPage(id);
      if (page) {
        const next = Number(page.in_sitemap) === 1 ? 0 : 1;
        await execute('UPDATE vx_page_seo SET in_sitemap = ? WHERE id = ?', [next, id]);
        await seoRegenerate(origin);
        await setFlash({ ok: `“${page.title || page.slug}” ${next ? 'added to' : 'removed from'} the sitemap.` });
      }
    } else if (op === 'apply_legacy') {
      /* An imported previous-site record onto the page that replaced it: only
         the replacement's EMPTY fields are filled, so its approved copy stays. */
      const page = await seoPage(id);
      const target = page ? seoLegacyReplacement(page) : null;
      const row = target ? await seoPageBySlug(target.slug) : null;
      if (!page || !target || !row) {
        await setFlash({ err: 'That record has no replacement page to apply to.' });
      } else {
        const pairs: Array<[column: string, from: string, to: string, label: string]> = [
          ['meta_title', page.meta_title, row.meta_title, 'meta title'],
          ['meta_desc', String(page.meta_description ?? ''), String(row.meta_description ?? ''), 'meta description'],
          ['keywords', page.meta_keywords, row.meta_keywords, 'keywords'],
          ['og_title', page.og_title, row.og_title, 'social title'],
          ['og_desc', String(page.og_description ?? ''), String(row.og_description ?? ''), 'social description'],
          ['og_image', page.og_image, row.og_image, 'social image'],
          ['tw_title', page.tw_title, row.tw_title, 'X title'],
          ['tw_desc', page.tw_desc, row.tw_desc, 'X description'],
          ['tw_image', page.tw_image, row.tw_image, 'X image'],
          ['focus_kw', page.focus_kw, row.focus_kw, 'focus keyword'],
          ['h1', page.h1, row.h1, 'H1'],
          ['schema_jsonld', String(page.schema_jsonld ?? ''), String(row.schema_jsonld ?? ''), 'JSON-LD'],
          ['faq_json', String(page.faq_json ?? ''), String(row.faq_json ?? ''), 'FAQ'],
        ];
        const fill = pairs.filter(([, from, to]) => from.trim() !== '' && to.trim() === '');
        if (!fill.length) {
          await setFlash({ ok: `“${target.name}” already has every field this record could fill. Nothing was changed.` });
        } else {
          await execute(
            `UPDATE vx_page_seo SET ${fill.map(([c]) => `${c} = ?`).join(', ')}, updated_by = ? WHERE id = ?`,
            [...fill.map(([, from]) => from), 'Imported from www.valunxt.com', row.id]
          );
          await seoRegenerate(origin);
          await setFlash({
            ok: `Filled ${fill.length} empty field${fill.length === 1 ? '' : 's'} of “${target.name}”: ${fill.map(([, , , l]) => l).join(', ')}. Its own values were kept. You can now delete this record.`,
          });
        }
      }
    } else if (op === 'delete') {
      const page = await seoPage(id);
      const place = page ? seoPlacement(page) : null;
      if (page && place?.builtIn && place.exists) {
        // The page is part of the website's code: removing its row would only
        // lose its SEO settings, and the next sync would list it again.
        await setFlash({
          err: `“${page.title || page.slug}” is built into the website, so it cannot be deleted here. Set it to Draft or leave it out of the sitemap instead.`,
        });
      } else if (page) {
        const wasCms = Number(page.is_cms) === 1;
        await execute('DELETE FROM vx_page_seo WHERE id = ?', [id]);
        await seoRegenerate(origin);
        await setFlash({
          ok: `“${page.title || page.slug}” deleted${
            wasCms ? ' along with its page' : place?.legacy ? ' (previous-site SEO record)' : ' from the CMS'
          }. Sitemap regenerated.`,
        });
      }
    }
  } catch (e) {
    if (e && typeof e === 'object' && 'digest' in e) throw e;
    await setFlash({ err: 'That action could not be completed: ' + String(e) });
  }

  revalidateSite();
  redirect(back);
}

/* ---- Page editor --------------------------------------------------------- */

export interface PageFormState {
  errors?: Record<string, string>;
  values?: Record<string, string | number>;
}

/** Validate a JSON-LD block list posted as schema_block[]; returns [blocks, error]. */
function schemaBlocksFrom(form: FormData): [string[], string] {
  const blocks = form
    .getAll('schema_block')
    .map((b) => String(b).trim())
    .filter((b) => b !== '');
  for (let i = 0; i < blocks.length; i++) {
    try {
      const parsed = JSON.parse(blocks[i]);
      if (!parsed || typeof parsed !== 'object') throw new Error('not an object');
    } catch {
      return [blocks, `Schema block ${i + 1} is not valid JSON. Fix it or clear it.`];
    }
  }
  return [blocks, ''];
}

/** FAQ pairs posted as faq_q[] / faq_a[]; pairs missing either half are dropped. */
function faqFrom(form: FormData): Array<{ q: string; a: string }> {
  const qs = form.getAll('faq_q').map((v) => String(v).trim());
  const as = form.getAll('faq_a').map((v) => String(v).trim());
  const out: Array<{ q: string; a: string }> = [];
  for (let i = 0; i < Math.max(qs.length, as.length); i++) {
    if (qs[i] && as[i]) out.push({ q: qs[i], a: as[i] });
  }
  return out;
}

export async function savePageAction(_prev: PageFormState | null, form: FormData): Promise<PageFormState> {
  const user = await requireUser();
  const origin = await requestOrigin();
  const isNew = String(form.get('mode') ?? '') === 'new';
  const id = Number(form.get('id') ?? 0);

  if (!(await csrfOk(String(form.get('csrf') ?? '')))) {
    return { errors: { general: 'Your session expired. Please submit the form again.' } };
  }

  const s = (k: string) => String(form.get(k) ?? '').trim();
  const values: Record<string, string | number> = {
    title: s('title'),
    slug: s('slug'),
    meta_title: s('meta_title'),
    meta_description: s('meta_description'),
    canonical_url: s('canonical_url'),
    meta_keywords: s('meta_keywords'),
    robots_meta: s('robots_meta'),
    og_title: s('og_title'),
    og_description: s('og_description'),
    status: s('status'),
    changefreq: s('changefreq'),
    priority: s('priority'),
    hero_image: s('hero_image'),
    in_sitemap: form.get('in_sitemap') ? 1 : 0,
  };
  /* The fields the imported schema added. An editor that does not render them
     sends none, and the columns are then left as they are. */
  const extended = form.has('og_image');
  if (extended) {
    values.og_image = s('og_image');
    values.tw_title = s('tw_title');
    values.tw_desc = s('tw_desc');
    values.tw_image = s('tw_image');
    values.focus_kw = s('focus_kw');
    values.h1 = s('h1');
  }

  let existing: PageRow | null = null;
  if (!isNew) {
    existing = await seoPage(id);
    if (!existing) {
      await setFlash({ err: 'That page no longer exists.' });
      redirect(adminUrl('pages'));
    }
  }
  // A page built into the website keeps the address its route answers at; only
  // a page created here can move.
  const place = isNew ? null : seoPlacement(existing!);
  const builtIn = !isNew && place!.builtIn;

  const errors: Record<string, string> = {};

  if (values.title === '') errors.title = 'A page title is required.';
  else if (String(values.title).length > 200) errors.title = 'Keep the page title under 200 characters.';

  const slug = builtIn
    ? String(existing!.slug)
    : seoNormalizeSlug(values.slug !== '' ? String(values.slug) : String(values.title));
  if (!builtIn) {
    if (slug === '') {
      errors.slug = 'A URL slug is required — use letters, numbers and hyphens.';
    } else if (reservedCmsSlug(slug)) {
      errors.slug = `“/${slug}/” belongs to a page or section built into the website. Choose a different slug.`;
    } else if (await seoSlugTaken(slug, isNew ? 0 : id)) {
      errors.slug = `The slug “${slug}” is already used by another page. Choose a different one.`;
    }
  }
  values.slug = slug;

  if (String(values.meta_title).length > 255) errors.meta_title = 'Keep the meta title under 255 characters.';
  if (String(values.meta_description).length > 320)
    errors.meta_description = 'Keep the meta description under 320 characters.';
  if (String(values.meta_keywords).length > 500) errors.meta_keywords = 'Keep the keyword list under 500 characters.';
  if (values.canonical_url !== '' && !/^https?:\/\/[^\s]+$/i.test(String(values.canonical_url))) {
    errors.canonical_url = 'Enter a full URL including https://, or leave this blank to generate one automatically.';
  }
  for (const [field, label] of [
    ['og_image', 'Social share image'],
    ['tw_image', 'X (Twitter) image'],
  ] as const) {
    const v = String(values[field] ?? '');
    if (v !== '' && !/^(https?:\/\/|\/)[^\s]*$/i.test(v)) errors[field] = `${label}: enter a path beginning with / or a full https:// URL.`;
  }
  if (!(ROBOTS_OPTIONS as readonly string[]).includes(String(values.robots_meta))) values.robots_meta = 'index, follow';
  if (!(CHANGEFREQ_OPTIONS as readonly string[]).includes(String(values.changefreq))) values.changefreq = 'monthly';
  let priority = Number(values.priority);
  if (!(priority >= 0 && priority <= 1)) priority = 0.5;
  values.priority = priority.toFixed(1);
  if (!['published', 'draft'].includes(String(values.status))) values.status = 'published';

  const [schemaBlocks, schemaError] = extended ? schemaBlocksFrom(form) : [[], ''];
  if (schemaError) errors.schema = schemaError;
  const faq = extended ? faqFrom(form) : [];
  if (extended) {
    // Handed back on a rejected save, so the repeaters return as they were submitted.
    values.schema_jsonld = schemaBlocks.length ? JSON.stringify(schemaBlocks) : '';
    values.faq_json = faq.length ? JSON.stringify(faq) : '';
  }

  if (Object.keys(errors).length) return { errors, values };

  const nul = (v: unknown) => (String(v ?? '') === '' ? null : String(v));
  const extendedCols: Array<[string, unknown]> = extended
    ? [
        ['og_image', nul(values.og_image)],
        ['tw_title', nul(values.tw_title)],
        ['tw_desc', nul(String(values.tw_desc).slice(0, 320))],
        ['tw_image', nul(values.tw_image)],
        ['focus_kw', nul(String(values.focus_kw).slice(0, 190))],
        ['h1', nul(String(values.h1).slice(0, 255))],
        ['schema_jsonld', schemaBlocks.length ? JSON.stringify(schemaBlocks) : null],
        ['faq_json', faq.length ? JSON.stringify(faq) : null],
      ]
    : [];

  try {
    if (isNew) {
      const cols = [
        'rel_path', 'title', 'file_path', 'meta_title', 'meta_desc', 'canonical', 'keywords', 'robots', 'og_title', 'og_desc',
        'status', 'in_sitemap', 'priority', 'changefreq', 'hero_image', 'is_cms', 'created_at', 'updated_by',
        ...extendedCols.map(([c]) => c),
      ];
      const res = await execute(
        `INSERT INTO vx_page_seo (${cols.join(', ')})
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NOW(), ?${', ?'.repeat(extendedCols.length)})`,
        [
          values.slug,
          values.title,
          seoCmsFilePath(String(values.slug)),
          nul(values.meta_title),
          nul(values.meta_description),
          nul(values.canonical_url),
          nul(values.meta_keywords),
          values.robots_meta,
          nul(values.og_title),
          nul(String(values.og_description).slice(0, 320)),
          values.status,
          values.in_sitemap,
          values.priority,
          values.changefreq,
          values.hero_image || '/assets/content/uploads/banners/about-us.webp',
          brandText(user.name).slice(0, 120),
          ...extendedCols.map(([, v]) => v),
        ]
      );
      const gen = await seoRegenerate(origin);
      await setFlash({
        ok: `Page “${values.title}” created at /${values.slug}/. Sitemap regenerated with ${gen.count} URLs.`,
      });
      revalidateSite();
      redirect(adminUrl('pages/edit') + '?id=' + res.insertId);
    }

    const oldSlug = String(existing!.slug);
    const notices: string[] = [];

    if (!builtIn && values.slug !== oldSlug) {
      // Pages created beneath this one move with it, as they did in PHP.
      const kids = await query<{ id: number; rel_path: string }>(
        'SELECT id, rel_path FROM vx_page_seo WHERE rel_path LIKE ? AND id <> ? AND is_cms = 1',
        [oldSlug + '/%', id]
      );
      for (const kid of kids) {
        const kidSlug = values.slug + kid.rel_path.slice(oldSlug.length);
        await execute('UPDATE vx_page_seo SET rel_path = ?, file_path = ? WHERE id = ?', [
          kidSlug,
          seoCmsFilePath(kidSlug),
          kid.id,
        ]);
      }
      if (kids.length) notices.push(`${kids.length} child page${kids.length === 1 ? '' : 's'} moved under the new slug.`);
    }

    const sets: Array<[string, unknown]> = [
      ['title', values.title],
      ['rel_path', values.slug],
      ['meta_title', nul(values.meta_title)],
      ['meta_desc', nul(values.meta_description)],
      ['canonical', nul(values.canonical_url)],
      ['keywords', nul(values.meta_keywords)],
      ['robots', values.robots_meta],
      ['og_title', nul(values.og_title)],
      ['og_desc', nul(String(values.og_description).slice(0, 320))],
      ['status', values.status],
      ['in_sitemap', values.in_sitemap],
      ['priority', values.priority],
      ['changefreq', values.changefreq],
      ['hero_image', values.hero_image || existing!.hero_image || ''],
      ['updated_by', brandText(user.name).slice(0, 120)],
      ...extendedCols,
    ];
    await execute(`UPDATE vx_page_seo SET ${sets.map(([c]) => `${c} = ?`).join(', ')} WHERE id = ?`, [
      ...sets.map(([, v]) => v),
      id,
    ]);

    const gen = await seoRegenerate(origin);
    let msg = `SEO settings saved. Sitemap regenerated with ${gen.count} URLs.`;
    if (notices.length) msg += ' ' + notices.join(' ');
    await setFlash({ ok: msg, err: gen.errors.length ? gen.errors.join(' ') : undefined });
    revalidateSite();
    redirect(adminUrl('pages/edit') + '?id=' + id);
  } catch (e) {
    // redirect() throws a control-flow signal; let it through.
    if (e && typeof e === 'object' && 'digest' in e) throw e;
    return { errors: { general: 'The page could not be saved: ' + String(e) }, values };
  }
}

/* ---- Sitemap screen ------------------------------------------------------ */

export async function sitemapOpAction(form: FormData) {
  const op = String(form.get('op') ?? '');
  // Changing the site URL rewrites every canonical the site derives: admins only.
  if (op === 'save_settings') await requireAdmin(adminUrl('sitemap'));
  else await requireUser();
  const origin = await requestOrigin();
  await requireCsrf(form, adminUrl('sitemap'));

  try {
    if (op === 'generate') {
      const res = await seoRegenerate(origin);
      if (res.ok) {
        await setFlash({ ok: `Sitemap regenerated with ${res.count} URL${res.count === 1 ? '' : 's'}.` });
      } else {
        await setFlash({ err: res.errors.join(' ') });
      }
    } else if (op === 'save_settings') {
      const url = String(form.get('site_url') ?? '').trim().replace(/\/+$/, '');
      if (url !== '' && !/^https?:\/\/[^\s]+$/i.test(url)) {
        await setFlash({ err: `Enter a full site URL including https:// — for example ${DEFAULT_SITE_ORIGIN}` });
      } else {
        await seoSettingSet('site_url', url);
        const res = await seoRegenerate(origin);
        await setFlash({
          ok:
            url === ''
              ? 'Site URL cleared — URLs are detected from the current request. Sitemap regenerated.'
              : `Site URL saved as ${url}. Sitemap regenerated with ${res.count} URLs.`,
        });
      }
    }
  } catch (e) {
    if (e && typeof e === 'object' && 'digest' in e) throw e;
    await setFlash({ err: 'That action could not be completed: ' + String(e) });
  }

  revalidateSite();
  redirect(adminUrl('sitemap'));
}

/* ---- Account settings ---------------------------------------------------- */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 8;

export async function saveProfileAction(form: FormData) {
  const user = await requireUser();
  await requireCsrf(form, adminUrl('settings'));

  const name = String(form.get('name') ?? '').trim();
  const email = String(form.get('email') ?? '').trim();

  if (name === '' || name.length > 120) {
    await setFlash({ err: 'Enter your name, up to 120 characters.' });
  } else if (!EMAIL_RE.test(email) || email.length > 190) {
    await setFlash({ err: 'Enter a valid email address.' });
  } else {
    try {
      const taken = await query<{ n: number }>('SELECT COUNT(*) AS n FROM vx_users WHERE email = ? AND id <> ?', [
        email,
        user.id,
      ]);
      if (Number(taken[0]?.n ?? 0) > 0) {
        await setFlash({ err: `${email} is already used by another administrator.` });
      } else {
        await execute('UPDATE vx_users SET name = ?, email = ? WHERE id = ?', [name, email, user.id]);
        const account = await findAccount(user.id);
        await refreshUser({
          id: user.id,
          name: account?.name ?? name,
          email: account?.email ?? email,
          role: account?.role ?? user.role,
        });
        await setFlash({ ok: 'Profile saved.' });
      }
    } catch {
      await setFlash({ err: 'Could not save your profile. Please ensure MySQL is running.' });
    }
  }
  redirect(adminUrl('settings'));
}

export async function changePasswordAction(form: FormData) {
  const user = await requireUser();
  await requireCsrf(form, adminUrl('settings'));

  const current = String(form.get('current_password') ?? '');
  const next = String(form.get('new_password') ?? '');
  const confirm = String(form.get('confirm_password') ?? '');

  if (current === '' || next === '' || confirm === '') {
    await setFlash({ err: 'Fill in all three password fields.' });
  } else if (next.length < MIN_PASSWORD) {
    await setFlash({ err: `Choose a new password of at least ${MIN_PASSWORD} characters.` });
  } else if (next !== confirm) {
    await setFlash({ err: 'The new password and its confirmation do not match.' });
  } else {
    try {
      if (!(await passwordMatches(user.id, current))) {
        await setFlash({ err: 'Your current password is not correct.' });
      } else if (current === next) {
        await setFlash({ err: 'The new password must be different from the current one.' });
      } else {
        await setPassword(user.id, next);
        await setFlash({ ok: 'Password changed. Use the new password the next time you sign in.' });
      }
    } catch {
      await setFlash({ err: 'Could not change your password. Please ensure MySQL is running.' });
    }
  }
  redirect(adminUrl('settings'));
}
