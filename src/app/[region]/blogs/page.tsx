/**
 * /blogs/ — the Insights listing.
 *
 * The cards used to be four hand-written loop items over src/data/blog-catalog.ts.
 * They are now every published row of `vx_posts`, in the order the admin panel
 * puts them in (featured first, then newest); the markup around them is the same
 * captured Elementor page.
 *
 * PAGINATION (20260917): the Elementor capture's own loop-grid was set to
 * "load more on click" but never wired up. Client instruction now asks for
 * pagination after 8 cards, so `?page=` slices the published list server
 * side — plain links, no client JS required.
 */
import type { Metadata } from 'next';

import PageShell from '@/components/layout/PageShell';
import BlogsBody from '@/components/pages/BlogsBody';
import { publishedCards } from '@/lib/blog/db';
import type { BlogCard } from '@/lib/blog/types';
import { requirePageConfig } from '@/lib/pages';
import { vxnRegion } from '@/lib/region';
import { buildMetadata } from '@/lib/seo';

const PATH = '/blogs/';
const PER_PAGE = 8;

type Params = {
  params: Promise<{ region: string }>;
  searchParams: Promise<{ page?: string }>;
};

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { region } = await params;
  return buildMetadata(requirePageConfig(PATH), vxnRegion(region));
}

export default async function BlogsPage({ params, searchParams }: Params) {
  const { region: raw } = await params;
  const region = vxnRegion(raw);
  const page = requirePageConfig(PATH);

  let all: BlogCard[] = [];
  try {
    all = await publishedCards();
  } catch {
    // No database: the page still renders, with an empty grid, rather than 500.
    all = [];
  }

  const totalPages = Math.max(1, Math.ceil(all.length / PER_PAGE));
  const sp = await searchParams;
  const current = Math.min(totalPages, Math.max(1, Number(sp.page ?? 1) || 1));
  const posts = all.slice((current - 1) * PER_PAGE, current * PER_PAGE);

  return (
    <PageShell page={page} region={region}>
      <BlogsBody page={page} region={region} posts={posts} currentPage={current} totalPages={totalPages} />
    </PageShell>
  );
}
