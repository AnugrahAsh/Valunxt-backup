/**
 * /{region}/real-estate/ — the Dubai real estate landing page.
 *
 * A static segment inside the market tree, so it beats the CMS catch-all at
 * [region]/[...slug]/ and reaches the same page in either edition:
 *
 *   /en-ae/real-estate/    /en-in/real-estate/
 *
 * The practice is Dubai property in both editions (see data/site.ts), so the
 * page is the same page under either prefix; only the links it writes change.
 *
 * Rebuilt 20260921 on the client's brief — search, listings, the case for
 * Dubai, areas on a map, lifestyle, calculators, process, insights, the lead
 * form and FAQs. The body is src/real-estate/components/landing/.
 */
import type { Metadata } from 'next';

import Shell from '@/real-estate/components/Shell';
import LandingBody from '@/real-estate/components/landing/LandingBody';
import { pillarMetadata } from '@/real-estate/lib/seo';
import { toLocale } from '@/real-estate/lib/routes';
import { vxnRegionList } from '@/lib/region';
import { publishedCards } from '@/lib/blog/db';
import type { BlogCard } from '@/lib/blog/types';

type Params = { params: Promise<{ region: string }> };

export function generateStaticParams() {
  return vxnRegionList().map((r) => ({ region: r.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  return pillarMetadata(toLocale((await params).region));
}

export default async function RealEstatePage({ params }: Params) {
  const region = toLocale((await params).region);

  let posts: BlogCard[] = [];
  try {
    posts = await publishedCards(3);
  } catch {
    // Insights are an extra; the page renders without them.
  }

  return (
    <Shell locale={region}>
      <LandingBody locale={region} posts={posts} />
    </Shell>
  );
}
