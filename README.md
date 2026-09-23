# Valunxt

The Valunxt website and admin panel, on Next.js 16 (App Router) and
TypeScript.

This is a direct port of the PHP build that preceded it. **The rendered page is
the same page**: the same Elementor markup, the same stylesheets in the same
order, the same scripts, the same copy, the same URLs. The whole of the PHP
source is kept verbatim in [`_php-backup/`](_php-backup) so any question about
"what did it used to do?" has an answer in the repository.

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm start          # serve the production build
npm run typecheck  # tsc --noEmit
```

---

## How the site is put together

### Two editions, one set of pages

The site is published once per market, on its own URL prefix:

| Prefix    | Market                                        |
| --------- | --------------------------------------------- |
| `/en-in/` | India (the default)                           |
| `/en-ae/` | United Arab Emirates                          |

Only the home page genuinely differs per market, so only the home page has two
templates ([`HomeInBody`](src/components/pages/HomeInBody.tsx) and
[`HomeAeBody`](src/components/pages/HomeAeBody.tsx)). Every other page is one
component rendered under `src/app/[region]/…`, region-aware through
[`rurl()`](src/lib/region.ts) — which is why the header, the footer and every
in-page link keep the visitor in the market they arrived in.

A bare URL — the root, an old inbound link, a bookmark from before the split —
is forwarded to the visitor's edition by [`src/proxy.ts`](src/proxy.ts):
their last choice (cookie), then the country the host reports, then India. It is
a 302, because the answer depends on the visitor.

The previous site's host, `www.valunxt.com`, is not an edition. If it is pointed
at this deployment, the proxy sends every page request there, permanently, to the
same path on `https://valunxt.com`, where the redirects managed in the admin
panel map the old site's paths (`/insights/…`, `/services/….html`) onto their
new pages.

### Sections, not micro-components

Each page is the sequence of sections the PHP template required, in the same
order. A route file reads like the `index.php` it replaces:

```tsx
// src/app/[region]/faq/page.tsx
const { generateMetadata, Page } = definePage('/faq/', ({ page, region }) => (
  <>
    <PageHeroSection page={page} region={region} />
    <FaqSection region={region} />
    <SubscribeSection page={page} region={region} />
  </>
));
```

| Directory                                             | What lives there |
| ----------------------------------------------------- | ---------------- |
| [`src/components/layout/`](src/components/layout)      | The chrome: preloader, the three captured headers, the two captured footers, the mega menu, the region switcher, the cookie banner, the script block |
| [`src/components/sections/`](src/components/sections)  | Sections shared by more than one page: page hero, subscribe band, FAQ, community, platform, research list and detail, industries, leadership, testimonials, track record, blog article, clients advisory |
| [`src/components/pages/`](src/components/pages)        | One component per page body, where that body is unique to the page |
| [`src/app/`](src/app)                                  | Routes — thin files that name a page and list its sections |

### One route for pages that only differ by content

Where the PHP build had several near-identical files, there is now one route:

| Was                                        | Is now |
| ------------------------------------------ | ------ |
| 4 × `blogs/<slug>/index.php`               | [`app/[region]/blogs/[slug]/page.tsx`](src/app/[region]/blogs/[slug]/page.tsx), served from the database |
| 5 × `research/<slug>/index.php`            | [`app/[region]/research/[slug]/page.tsx`](src/app/[region]/research/[slug]/page.tsx) + the page registry |
| 4 × service pages, 4 × group company pages | still one component each — their bodies genuinely differ |
| Pages created in the admin panel           | [`app/[region]/[...slug]/page.tsx`](src/app/[region]/[...slug]/page.tsx), served from the database |

### The page registry

Every page's `$PAGE` declaration — body class, Elementor stylesheet list, header
and footer template, post id, hero, path — is transcribed into
[`src/data/page-configs.json`](src/data/page-configs.json) and typed by
[`PageConfig`](src/lib/page-config.ts). Two things read it: the page itself, and
the root layout, which has to put the WordPress body class on `<body>` and so
resolves the page from the URL that `proxy.ts` publishes as `x-vxn-path`.

### Why the styles cannot drift

- Every asset — CSS, JS, fonts, images, video — moved to `public/` unchanged.
  Nothing was re-minified, re-ordered or rewritten.
- [`HeadAssets`](src/components/layout/HeadAssets.tsx) emits the 53 stylesheets
  and 9 inline `<style>` blocks in the exact order `includes/head.php` did, from
  inside the real `<head>`. That interleaving *is* the cascade: `post-*.css`
  comes after the global inline styles, `valunxt-brand.css` after both.
- `next.config.ts` sets `images.unoptimized` — a rewritten `<img src>` would
  change the DOM the theme CSS is written against.
- Navigation uses plain `<a href>`, not `next/link`, so every page load re-runs
  jQuery, SmartMenus and the Elementor bundles against a fresh document — the
  same lifecycle they had under PHP.

---

## The admin panel

`/admin` — a separate application with its own stylesheet
([`public/admin/assets/admin.css`](public/admin/assets/admin.css)), never
indexed, and loading none of the site's Elementor cascade. It carries the site's
identity: the brand blue and its gradient, Sanomat Sans, the current wordmark
and tab icon.

Every screen reads and writes the imported www.valunxt.com database (see
[Database](#database)); there is no separate admin data layer.

| Screen              | Route | Table |
| ------------------- | ----- | ----- |
| Sign in             | `/admin/` | `vx_users` |
| Overview            | `/admin/dashboard` — live counts, lead trend, activity | all |
| Leads CRM           | `/admin/leads` (`?q=`, `?status=`, `?service=`), `/admin/leads/view?id=N` — stage, notes | `vx_leads`, `vx_lead_notes` |
| Blog & Insights     | `/admin/blogs` (`?q=`, `?s=` status, `?c=` category), editor `/admin/blogs/edit?id=N` or `?new=1` | `vx_posts` |
| Authors             | `/admin/authors` | `vx_authors` |
| Page SEO            | `/admin/pages`, editor `/admin/pages/edit?id=N` or `?new=1` | `vx_page_seo` |
| Redirects           | `/admin/redirects` — applied by `src/proxy.ts` within 15 seconds | `vx_redirects` |
| Sitemap             | `/admin/sitemap`, history `/admin/sitemap-runs` | `vx_sitemap_urls`, `vx_sitemap_runs` |
| Keywords            | `/admin/keywords` | `vx_keywords` |
| SEO Audits          | `/admin/seo-audits` (read-only history) | `vx_seo_audits` |
| Analytics           | `/admin/analytics` (`?range=`, `?bots=1`) | `vx_hits` |
| Performance         | `/admin/performance` (read-only history) | `vx_psi` |
| Clients *           | `/admin/clients`, `/admin/clients/view?id=N` with contacts, deadlines, document requests, documents, ledger, messages | `pa_*` |
| Deadlines *         | `/admin/deadlines` | `pa_deadlines` |
| Portal users *      | `/admin/portal-users` | `pa_users` |
| Portal activity *   | `/admin/portal-activity` | `pa_activity_log` |
| Security *          | `/admin/security`, `/admin/security-events`, `/admin/scans`, `/admin/file-hashes`, `/admin/login-attempts` | `vx_security_events`, `vx_scans`… |
| Admin users *       | `/admin/admin-users` | `vx_users` |
| Site settings *     | `/admin/site-settings` | `vx_settings` |
| Account settings    | `/admin/settings` — your name, email, password | `vx_users` |
| Search              | `/admin/search?q=` — leads, pages, posts, clients | |

The plain table screens (authors, redirects, clients and the rest) are one
generic module driven by [`src/lib/admin/resources.ts`](src/lib/admin/resources.ts):
each entry names its table, fields, validation and permissions, and
`src/app/admin/[resource]/` renders the list (search, filters, pagination), the
form and the record view from it. A read-only table is shown, never edited.

**Accounts and roles.** Admin accounts are the `vx_users` rows the import
brought (plus the Next.js build's own account, folded in). Two roles: **admin**
sees everything; **editor** manages content, leads and SEO but not the screens
marked * (client data, accounts, security, settings) — hidden from the menu and
refused by the server. The panel will not delete or demote the last admin, nor
let you delete yourself.

A fresh, empty install seeds one administrator on first connection:
`admin@valunxtcapital.com` / `Admin@123` (`ADMIN_DEFAULT_*`), which the sign-in
screen prefills in development only. On a deployed panel, signing in with the
default password leads straight to the password form. **Set
`ADMIN_SESSION_SECRET` before the panel is reachable from the internet** (see
Configuration).

Sessions are an HMAC-signed, httpOnly cookie rather than a PHP session — there is
no server-side session store to keep — and each request re-checks the account in
`vx_users`, so a deleted or demoted administrator loses access at once. Every
form behind the sign-in carries a CSRF token. Sign-in locks for fifteen minutes after five
failures from one address or ten against one account; failures and lockouts are
logged to `vx_security_events`.
bcrypt digests from PHP's `password_hash()` (`$2y$`) verify unchanged, so the
imported accounts keep their passwords. Signing the cookie against the new
account table signed everyone out once, at the import.

**Which pages it lists.** Page SEO lists every page the website publishes, in
both markets, and nothing else. The list is derived from the registries the
routes answer from ([`src/lib/site-pages.ts`](src/lib/site-pages.ts)): the page
registry and the UAE services registry with its thirty-three sub-pages. A page
added in code appears in the panel on its own; a page taken out
of the code is removed from the panel and the sitemap (pages created in the panel
are never removed). The unlinked real estate module under `/real-estate/` and
pages that 404 until their data exists (leadership, track record) are left out on
purpose. Rows are keyed the way the SEO map is: `about` for a page both markets
publish, `en-ae/services/…` for a UAE-only page, `''` and `en-ae` for the homes.

Saving a page rewrites two files, exactly as the PHP panel did:

- `public/sitemap.xml` — one entry per page (and published post) per market that publishes it, on the
  main domain (`https://valunxt.com` unless the Site URL setting says otherwise),
  with hreflang alternates where more than one market publishes the address
- `src/data/seo-map.json` — the map the public pages read, so a page view never
  opens a database connection and the site keeps rendering if MySQL is down.

`/robots.txt` is generated by [`src/app/robots.ts`](src/app/robots.ts): it points crawlers at
`sitemap.xml` on the same Site URL and keeps them out of `/admin/` and `/form-handler`.

The database is the source of those files, so the two must not drift. When
`seo-map.json` is changed outside the panel — edited in the repository, pulled,
deployed — the panel notices (it records a hash of every map it writes) and
imports the file's values into the `vx_page_seo` table before anything reads from it
([`seo-import.ts`](src/lib/admin/seo-import.ts)). Without that, the first save
would rewrite the file from stale rows and put old SEO copy back on the site. When
the set of pages changes, the Pages and Sitemap screens say so and offer to
regenerate.

These files are part of the repository. The public site reads the SEO map from
disk and re-reads it when the file changes, so a saved edit is live at once
wherever the panel can write the file (a local checkout, a Node server); on a
read-only host (Vercel) the copy bundled at build time is used, and edits reach
the site with the next build.

Beyond the title and description, each page's record holds what the imported
panel kept per page: Open Graph and X images and copy, a focus keyword and H1,
FAQ pairs (emitted as `FAQPage` JSON-LD) and any number of custom JSON-LD blocks,
rendered by [`JsonLd.tsx`](src/components/seo/JsonLd.tsx).

**Records from the previous site.** The import also brought the page SEO records
of the old www.valunxt.com pages. They are never removed automatically; the list
flags each with the page that replaced it, and its editor can copy its values
into that page's empty fields. Delete one once it has been reviewed.

**One deliberate difference.** The PHP panel created a new page by writing a
folder and an `index.php` to disk. A Next.js route cannot appear at runtime, so a
page created in the panel is stored in the database and served by the catch-all
route instead — through the same shared page-hero + subscribe body the scaffolded
file used. The page is live the moment it is saved, with no redeploy, which is
what the scaffolding was reaching for.

### Blog & Insights

The articles at `/blogs/` are rows in `vx_posts`, not pages in the code. The
whole flow is the panel: write a post, publish it, and it is on the site; delete
it and it is gone from the site. Nothing is duplicated in the front end.

One module owns the table ([`src/lib/blog/db.ts`](src/lib/blog/db.ts)) — the
panel writes through it and the public pages read through it — and one file holds
the record shape, the slug rule and the validation both sides apply
([`types.ts`](src/lib/blog/types.ts)), so a field cannot be accepted in the
editor and rejected on the server.

Four surfaces render posts, all from the same query and the same card component
([`BlogLoopCard.tsx`](src/components/pages/BlogLoopCard.tsx)): the `/blogs/`
grid, `/blogs/<slug>/`, the Insights carousel that closes each market's home
page, and the strip on the UAE services index. They used to be four hand-written
copies of the same four posts, which is why the home carousel stamped every card
"July 11, 2026" whatever it linked to.

A post carries what the two pages show — title, slug, category, tags, excerpt,
body, cover image and alt text, author (a `vx_authors` profile) and role, publish
date — plus its SEO: meta title and description, focus keyword, keywords, Open
Graph and X card fields, canonical, robots, a schema type, FAQ pairs and custom
JSON-LD blocks. The article page emits `BlogPosting` (or the chosen type),
`BreadcrumbList` and `FAQPage` structured data unless a custom block already
declares one, and shows the FAQ under the body. Two switches: **Featured**, which
pins it to the top of the listing, and **Include in sitemap**. A draft, or a post
dated in the future, is not listed, not in the sitemap, and its URL answers 404.
Covers can be uploaded from the editor; they are written to
`public/assets/content/uploads/blogs/`.

Articles are not `pages` rows and are not in
[`site-pages.ts`](src/lib/site-pages.ts) — the sitemap reads them straight from
the table, one entry per market with hreflang alternates, and the declaration
every article renders in (its stylesheets and body class) is derived in
[`pages.ts`](src/lib/pages.ts) rather than declared per post.

The fifteen articles of the previous www.valunxt.com site arrived with the
import, alongside this build's own four. Their covers are referenced under
`/images/blogs/cms/`; a cover whose file is missing from `public/` renders the
default blog image instead of a broken one.

---

## Database

The site and the panel run on the database of the previous www.valunxt.com site,
imported from its phpMyAdmin dump: 30 tables, declared column for column in
[`src/lib/admin/schema.ts`](src/lib/admin/schema.ts) with their keys, indexes and
eleven foreign keys.

- `vx_*` — the website CMS: posts, authors, page SEO, leads and notes,
  redirects, sitemap URLs and runs, keywords, audits, analytics hits, security
  events and scans, settings, admin accounts.
- `pa_*` — the client portal: clients, contacts, deadlines, document requests,
  documents, ledger, messages, portal users, activity and login attempts.

The tables this build created for itself before the import were folded into
their `vx_*` equivalents and dropped once every row was verified present:
`users` → `vx_users`, `enquiries` → `vx_leads`, `blog_posts` → `vx_posts`,
`pages` → `vx_page_seo`, `seo_settings` → `vx_settings`. Where a `vx_*`
table needed a column to hold them, one was added (`SCHEMA_EXTENSIONS`); nothing
of the dump's was removed or renamed. Links inside imported content were moved
from www.valunxt.com onto this site's routes, and the old site's addresses have
301s in `vx_redirects`.

**Importing** (once per environment, e.g. production):

1. Stop the site — a running site would create the empty schema first.
2. Back up the database.
3. `node scripts/import-valunxt-db.mjs [dump.sql]` — reads `DB_*` from the
   shell or `.env.local`; `--dry-run` reports without writing. Each phase is
   safe to run again, and a finished import is recorded in `vx_settings`.
4. Start the site, sign in, and generate the sitemap.

Keep the dump and backups in `data/imports/` and `data/backups/`, which git
ignores: they hold password hashes and client data.

A site started against a database that still has the old tables but not the
imported ones refuses to create anything, and says to run the import.

---

## Configuration

Copy `.env.example` to `.env.local` and fill in what applies. In development
everything has a working default, so a fresh clone runs with no configuration.

| Variable                 | Purpose |
| ------------------------ | ------- |
| `NEXT_PUBLIC_SITE_ORIGIN`| Canonical/OG/sitemap origin when the request host is not authoritative (default `https://valunxt.com`) |
| `DB_HOST` … `DB_PASS`    | The MySQL/MariaDB database. **Required in production** |
| `ADMIN_SESSION_SECRET`   | Signs admin sessions and CSRF tokens. **Set in production** |
| `ADMIN_DEFAULT_*`        | The administrator seeded into an empty `vx_users` table |

Without `DB_HOST`, development connects to local XAMPP (127.0.0.1, root, no
password, `valunxt_capital_admin`); a production build refuses to connect.
Without `ADMIN_SESSION_SECRET` the session key is derived from `DB_PASS`, and a
production build with neither refuses to sign anyone in. No credential is in the
source, and none of these reach the browser.

---

## What moved where

| PHP                                   | Next.js |
| ------------------------------------- | ------- |
| `config.php`, `includes/region.php`   | [`src/lib/region.ts`](src/lib/region.ts), [`region-assets.ts`](src/lib/region-assets.ts) |
| `includes/site-data.php`              | [`src/lib/site-data.ts`](src/lib/site-data.ts) |
| `includes/seo.php`                    | [`src/lib/seo.ts`](src/lib/seo.ts) |
| `includes/head.php`                   | [`HeadAssets`](src/components/layout/HeadAssets.tsx) + `src/app/layout.tsx` |
| `includes/header.php`, `footer.php`   | [`PageShell`](src/components/layout/PageShell.tsx) |
| `includes/scripts.php`                | [`SiteScripts`](src/components/layout/SiteScripts.tsx) |
| `includes/preloader.php`              | [`Preloader`](src/components/layout/Preloader.tsx) |
| `includes/partials/*`                 | `src/components/layout/`, `src/components/sections/` |
| `includes/blog-catalog.php`           | the `vx_posts` table ([`src/lib/blog/`](src/lib/blog/db.ts)) |
| `data/leadership.php` etc.            | `src/data/leadership.ts`, `testimonials.ts`, `track-record.ts` |
| `data/seo/seo-map.php`                | [`src/data/seo-map.json`](src/data/seo-map.json) |
| `form-handler.php`                    | [`src/app/form-handler/route.ts`](src/app/form-handler/route.ts) |
| `.htaccess` redirects                 | `redirects()` in [`next.config.ts`](next.config.ts); editable ones in `vx_redirects`, applied by [`src/proxy.ts`](src/proxy.ts) |
| `admin/*`                             | `src/app/admin/`, `src/lib/admin/`, `src/components/admin/` |
| `assets/`, `LOGO/`, `icons/`          | `public/` (byte-identical) |

Three data files ship empty **on purpose** — `leadership.ts`, `testimonials.ts`
and `track-record.ts`. Each carries the reason at the top; `/about/leadership/`
and `/track-record/` return 404 until they are filled in, exactly as before.
