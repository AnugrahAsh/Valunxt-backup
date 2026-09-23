/**
 * /{region}/real-estate/dubai/buildings/{slug}/ — one Dubai building.
 *
 * The area-guide route's twin, reading the building half of the registry.
 * See that file, and data/locations/buildings.ts for the rule that governs
 * what a building page may state as fact.
 */
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import Shell from '@/real-estate/components/Shell';
import LocationBody from '@/real-estate/components/location/LocationBody';
import { BUILDING_SLUGS, locationBySlug } from '@/real-estate/data/locations';
import { toLocale } from '@/real-estate/lib/routes';
import { locationMetadata } from '@/real-estate/lib/seo';
import { vxnRegionList } from '@/lib/region';

type Params = { params: Promise<{ region: string; slug: string }> };

export function generateStaticParams() {
  return vxnRegionList().flatMap((r) => BUILDING_SLUGS.map((slug) => ({ region: r.slug, slug })));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { region, slug } = await params;
  return locationMetadata(toLocale(region), 'building', decodeURIComponent(slug));
}

export default async function BuildingPage({ params }: Params) {
  const { region: raw, slug } = await params;
  const region = toLocale(raw);
  const loc = locationBySlug('building', decodeURIComponent(slug));
  if (!loc) notFound();

  return (
    <Shell locale={region}>
      <LocationBody locale={region} loc={loc} />
    </Shell>
  );
}
