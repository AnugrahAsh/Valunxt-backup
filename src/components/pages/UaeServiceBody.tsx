/**
 * The body every unpublished UAE services page renders: the breadcrumb hero,
 * the "Coming Soon" band, and the subscribe block that closes every other page.
 *
 * Three routes share it — the service pages, the pages beneath them, and the
 * UAE branch of /services/research-intelligence/ — so the section stays one
 * thing while it is being written, rather than three that drift apart.
 */
import PageHeroSection from '@/components/sections/PageHeroSection';
import ComingSoonBandSection from '@/components/sections/ComingSoonBandSection';
import type { PageConfig } from '@/lib/page-config';

export default function UaeServiceBody({
  page,
  region,
}: {
  page: PageConfig;
  region: string;
}) {
  return (
    <>
      <PageHeroSection page={page} region={region} tone="brand" />
      <ComingSoonBandSection page={page} region={region} />
    </>
  );
}
