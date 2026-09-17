import { NextResponse, type NextRequest } from 'next/server';

import { findRedirect } from '@/lib/redirects';
import { builtPathFor, movedPathFor, publicPathFor } from '@/lib/route-aliases';

/**
 * Three jobs, after one check.
 *
 * The previous site's host. www.valunxt.com is the old address; the site lives
 * on https://valunxt.com. If the www host is pointed at this deployment, a page
 * request there is sent once, permanently, to the same path on the main domain
 * (where job 0 then maps an old path onto its new page), so no page is ever
 * served, canonicalised or indexed under the old host.
 *
 * 0. Redirects managed in the admin panel (vx_redirects), before anything else
 *    — including the addresses of the previous www.valunxt.com site, so an old
 *    link or search result lands on the page that replaced it rather than on the
 *    gateway below, which would forward it to a market that 404s. See
 *    src/lib/redirects.ts; the table is cached, so this is a Map lookup.
 *
 * 1. The region gateway. The site is published as one edition per market and
 *    the root is not a page any more (index.php did the same). A bare URL — the
 *    root, an old inbound link, a bookmark from before the split — is forwarded
 *    to the same page in the visitor's market: their last choice (cookie), then
 *    the country the host reports, then India. 302 rather than 301, because the
 *    answer depends on the visitor and must not be cached as if it were the one
 *    true destination for everybody.
 *
 * 2. Publishing the request path as a header, so the root layout can resolve
 *    which page is being rendered. `<body class>` carries the full WordPress
 *    class list the theme CSS keys off (body.elementor-page-264 and friends),
 *    and only the root layout may render `<body>`.
 */

/** Hosts the site used to answer on, sent to the main domain. */
const OLD_HOSTS = new Set(['www.valunxt.com']);
const MAIN_ORIGIN = 'https://valunxt.com';

const REGIONS = ['en-in', 'en-ae'] as const;
const DEFAULT_REGION = 'en-in';

function detectRegion(req: NextRequest): string {
  const cookie = req.cookies.get('vxn_region')?.value ?? '';
  if ((REGIONS as readonly string[]).includes(cookie)) return cookie;

  // Set by Cloudflare / some hosts, and by Vercel's geo headers. Harmless when
  // absent.
  const cc = (
    req.headers.get('cf-ipcountry') ??
    req.headers.get('x-vercel-ip-country') ??
    ''
  ).toUpperCase();
  if (cc === 'IN') return 'en-in';
  if (cc === 'AE') return 'en-ae';

  return DEFAULT_REGION;
}

export async function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // Host, not X-Forwarded-Host: a client can send the latter for any address,
  // and a cache in front would then keep a redirect from the main domain to itself.
  const host = (req.headers.get('host') ?? '').trim().toLowerCase().replace(/:\d+$/, '');
  if (OLD_HOSTS.has(host) && (req.method === 'GET' || req.method === 'HEAD')) {
    return NextResponse.redirect(`${MAIN_ORIGIN}${pathname}${search}`, 301);
  }
  const first = pathname.split('/')[1] ?? '';
  const inRegion = (REGIONS as readonly string[]).includes(first);

  // The admin panel and the form endpoint are not part of either edition.
  if (first === 'admin' || first === 'form-handler') {
    const h = new Headers(req.headers);
    h.set('x-vxn-path', pathname);
    return NextResponse.next({ request: { headers: h } });
  }

  if (req.method === 'GET' || req.method === 'HEAD') {
    const rule = await findRedirect(pathname);
    if (rule) {
      const target = /^https?:\/\//i.test(rule.to) ? new URL(rule.to) : new URL(rule.to, req.url);
      // Carry the query string over unless the rule sets its own.
      if (!target.search && search) target.search = search;
      const res = NextResponse.redirect(target, rule.code);
      if (rule.code === 302 || rule.code === 307) res.headers.set('Cache-Control', 'no-store, max-age=0');
      return res;
    }
  }

  if (!inRegion) {
    // A file (sitemap.xml, a download) is not a page; neither is the API.
    const last = pathname.split('/').filter(Boolean).pop() ?? '';
    const isFile = last.includes('.');
    if (!isFile && req.method === 'GET') {
      const region = detectRegion(req);
      const target = new URL(`/${region}${pathname === '/' ? '/' : pathname}${search}`, req.url);
      const res = NextResponse.redirect(target, 302);
      res.headers.set('Cache-Control', 'no-store, max-age=0');
      return res;
    }
    return NextResponse.next();
  }

  /* 1b. The client's flat public addresses (lib/route-aliases.ts). The pages
     are built at /<market>/services/<service>/<sub>/ and published at short
     addresses: the built address is sent, permanently, to its public one, and
     the public one is rewritten to the page that renders it. x-vxn-path stays
     the BUILT path, because that is what the page registry, the body class and
     the SEO rows are all keyed on. */
  if (req.method === 'GET' || req.method === 'HEAD') {
    const onward = movedPathFor(pathname) ?? publicPathFor(pathname);
    if (onward) return NextResponse.redirect(new URL(`${onward}${search}`, req.url), 301);
  }
  const built = builtPathFor(pathname);

  const headers = new Headers(req.headers);
  headers.set('x-vxn-path', built ?? pathname);

  const res = built
    ? NextResponse.rewrite(new URL(`${built}${search}`, req.url), { request: { headers } })
    : NextResponse.next({ request: { headers } });

  // Remember the market the visitor is actually browsing, so an unprefixed
  // entry point puts them back where they were rather than in the default
  // edition.
  if (req.cookies.get('vxn_region')?.value !== first) {
    res.cookies.set('vxn_region', first, {
      path: '/',
      maxAge: 31536000,
      sameSite: 'lax',
    });
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Everything except Next's own build output, the API route and the static
     * files served straight out of /public.
     *
     * The real estate module's assets are listed by subfolder, not as a bare
     * `real-estate/`: the section's own URLs live under a market prefix
     * (/en-ae/real-estate/), so an unprefixed /real-estate/ is an inbound link
     * with no market on it and must still reach the gateway above — which
     * forwards it to the visitor's edition, exactly as it does for /about/.
     */
    '/((?!_next/static|_next/image|api/|assets/|LOGO/|icons/|real-estate/img/|real-estate/video/|real-estate/fonts/|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
