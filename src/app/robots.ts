/**
 * /robots.txt — crawlers may read the site, not the admin panel or the form
 * endpoint, and the sitemap is where public/sitemap.xml is published.
 *
 * The sitemap's address is built on the same site URL its entries are (the Site
 * URL setting under Sitemap, https://valunxt.com unless changed), read on each
 * request so a change there applies without a rebuild. It reads through the
 * shared pool, as the public blog does: a crawler's request has no business
 * running the admin panel's start-up work. src/proxy.ts leaves this path alone,
 * so the market gateway never redirects it.
 */
import type { MetadataRoute } from 'next';

import { sql } from '@/lib/db';
import { vxnSeoOrigin } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export default async function robots(): Promise<MetadataRoute.Robots> {
  let site = vxnSeoOrigin();
  try {
    const [row] = await sql<{ v: string | null }>("SELECT v FROM vx_settings WHERE k = 'site_url' LIMIT 1");
    const configured = String(row?.v ?? '').trim().replace(/\/+$/, '');
    if (/^https?:\/\//i.test(configured)) site = configured;
  } catch {
    /* no database: the deployment's configured origin */
  }
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/form-handler'],
    },
    sitemap: `${site}/sitemap.xml`,
  };
}
