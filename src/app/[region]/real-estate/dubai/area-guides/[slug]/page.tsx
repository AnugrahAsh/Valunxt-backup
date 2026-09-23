/**
 * /{region}/real-estate/dubai/area-guides/{slug}/ — one Dubai community.
 *
 * One dynamic segment covers all of them: the same template driven by a
 * different record from the module's data/locations, exactly as the service
 * routes are driven by SERVICE_PAGES. Publishing another community is an
 * entry in data/locations/areas.ts and nothing here changes.
 *
 * An unknown slug 404s in the site's own chrome, because realEstateRequest()
 * answers false for it and the root layout serves the normal head.
 */
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import Shell from '@/real-estate/components/Shell';
import LocationBody from '@/real-estate/components/location/LocationBody';
import { AREA_SLUGS, locationBySlug } from '@/real-estate/data/locations';
import { toLocale } from '@/real-estate/lib/routes';
import { locationMetadata } from '@/real-estate/lib/seo';
import { vxnRegionList } from '@/lib/region';

type Params = { params: Promise<{ region: string; slug: string }> };

export function generateStaticParams() {
  return vxnRegionList().flatMap((r) => AREA_SLUGS.map((slug) => ({ region: r.slug, slug })));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { region, slug } = await params;
  return locationMetadata(toLocale(region), 'area', decodeURIComponent(slug));
}

export default async function AreaGuidePage({ params }: Params) {
  const { region: raw, slug } = await params;
  const region = toLocale(raw);
  const loc = locationBySlug('area', decodeURIComponent(slug));
  if (!loc) notFound();

  return (
    <Shell locale={region}>
      <LocationBody locale={region} loc={loc} />
    </Shell>
  );
}
