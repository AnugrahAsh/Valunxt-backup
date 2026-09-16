/**
 * /blogs/ — the Insights listing.
 *
 * The cards used to be four hand-written loop items over src/data/blog-catalog.ts.
 * They are now every published row of `vx_posts`, in the order the admin panel
 * puts them in (featured first, then newest); the markup around them is the same
 * captured Elementor page.
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

type Params = { params: Promise<{ region: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { region } = await params;
  return buildMetadata(requirePageConfig(PATH), vxnRegion(region));
}

export default async function BlogsPage({ params }: Params) {
  const { region: raw } = await params;
  const region = vxnRegion(raw);
  const page = requirePageConfig(PATH);

  let posts: BlogCard[] = [];
  try {
    posts = await publishedCards();
  } catch {
    // No database: the page still renders, with an empty grid, rather than 500.
    posts = [];
  }

  return (
    <PageShell page={page} region={region}>
      <BlogsBody page={page} region={region} posts={posts} />
    </PageShell>
  );
}
