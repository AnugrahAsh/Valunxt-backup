/** /{region}/real-estate/dubai/buildings/ — every published building. */
import type { Metadata } from 'next';

import Shell from '@/real-estate/components/Shell';
import DirectoryBody from '@/real-estate/components/location/DirectoryBody';
import { BUILDINGS } from '@/real-estate/data/locations';
import { toLocale } from '@/real-estate/lib/routes';
import { locationIndexMetadata } from '@/real-estate/lib/seo';
import { vxnRegionList } from '@/lib/region';

type Params = { params: Promise<{ region: string }> };

export function generateStaticParams() {
  return vxnRegionList().map((r) => ({ region: r.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { region } = await params;
  return locationIndexMetadata(toLocale(region), 'building');
}

export default async function BuildingsIndex({ params }: Params) {
  const { region: raw } = await params;
  const region = toLocale(raw);
  return (
    <Shell locale={region}>
      <DirectoryBody locale={region} kind="building" items={BUILDINGS} />
    </Shell>
  );
}
