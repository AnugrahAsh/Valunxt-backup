/**
 * /services/research-intelligence/ — the one services slug both markets use.
 *
 * India publishes it as a full page of its own. The UAE lists "Research &
 * Intelligence" among its six services, which all render the service
 * template — so under /en-ae/ this route does exactly what the dynamic
 * [service] route next door does for the other five.
 *
 * The branch has to live here rather than in that route: Next matches a
 * static segment before a dynamic one, so this folder answers for both
 * markets whatever the dynamic route would have done.
 */
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import PageShell from '@/components/layout/PageShell';
import ResearchIntelligenceBody from '@/components/pages/ResearchIntelligenceBody';
import UaeServiceBody from '@/components/pages/UaeServiceBody';
import PageHeroSection from '@/components/sections/PageHeroSection';
import ServicePageBody from '@/components/pages/uae-services/ServicePageBody';
import {
  uaeServiceBody,
  uaeServiceContent,
  uaeServiceIsWritten,
} from '@/components/pages/uae-services';
import { buildMetadata } from '@/lib/seo';
import { requirePageConfig } from '@/lib/pages';
import { vxnRegion, vxnServiceBySlug } from '@/lib/region';
import { uaeServiceConfig } from '@/lib/uae-service-pages';

const PATH = '/services/research-intelligence/';
const SLUG = 'research-intelligence';

type Params = { params: Promise<{ region: string }> };

/** The India page's own declaration, or the UAE service derived from the registry. */
function configFor(region: string) {
  if (region === 'en-ae') {
    const service = vxnServiceBySlug(SLUG, region);
    if (!service) return null;
    return uaeServiceConfig(service, uaeServiceIsWritten(SLUG));
  }
  return requirePageConfig(PATH);
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { region: raw } = await params;
  const region = vxnRegion(raw);
  const page = configFor(region);
  return page ? buildMetadata(page, region) : {};
}

export default async function ResearchIntelligencePage({ params }: Params) {
  const { region: raw } = await params;
  const region = vxnRegion(raw);
  const page = configFor(region);
  if (!page) notFound();

  if (region !== 'en-ae') {
    return (
      <PageShell page={page} region={region}>
        <ResearchIntelligenceBody page={page} region={region} />
      </PageShell>
    );
  }

  /* The same three shapes as the [service] route, in the same order. A body
     owns its whole page — its own hero, its own breadcrumb, no subscribe band
     under it; the template content sits between the shared hero and the
     subscribe block; and a slug with neither gets the coming-soon body. */
  const Body = uaeServiceBody(SLUG);
  const content = uaeServiceContent(SLUG);

  return (
    <PageShell page={page} region={region}>
      {Body ? (
        <Body region={region} />
      ) : content ? (
        <>
          <PageHeroSection page={page} region={region} tone="brand" />
          <ServicePageBody region={region} content={content} />
        </>
      ) : (
        <UaeServiceBody page={page} region={region} />
      )}
    </PageShell>
  );
}
