/**
 * The market home page.
 *
 * /en-in/ and /en-ae/ are separate templates so each market gets its own hero,
 * copy and imagery — the split the PHP build made when it moved the home page
 * out of the root into en-in/index.php and en-ae/index.php.
 *
 * Both close on the Insights carousel, whose four cards are the newest posts
 * the admin panel has published, so the home page can never link to an article
 * that has been retired.
 */
import type { Metadata } from 'next';

import PageShell from '@/components/layout/PageShell';
import HomeInBody from '@/components/pages/HomeInBody';
import HomeAeBody from '@/components/pages/HomeAeBody';
import { publishedCards } from '@/lib/blog/db';
import type { BlogCard } from '@/lib/blog/types';
import { requirePageConfig } from '@/lib/pages';
import { vxnRegion } from '@/lib/region';
import { buildMetadata } from '@/lib/seo';

type Params = { params: Promise<{ region: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { region: raw } = await params;
  const region = vxnRegion(raw);
  return buildMetadata(requirePageConfig(`/${region}/`), region);
}

export default async function HomePage({ params }: Params) {
  const { region: raw } = await params;
  const region = vxnRegion(raw);
  const page = requirePageConfig(`/${region}/`);

  let posts: BlogCard[] = [];
  try {
    posts = await publishedCards(4);
  } catch {
    // The carousel is an extra; the home page still renders without it.
  }

  return (
    <PageShell page={page} region={region}>
      {region === 'en-ae' ? (
        <HomeAeBody page={page} region={region} posts={posts} />
      ) : (
        <HomeInBody page={page} region={region} posts={posts} />
      )}
    </PageShell>
  );
}
