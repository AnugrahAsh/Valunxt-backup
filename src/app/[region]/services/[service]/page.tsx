/**
 * A UAE service page — /en-ae/services/<service>/.
 *
 * The six UAE services are one dynamic route rather than six folders: they all
 * render the same three sections, and their names and URLs already live in
 * vxnServices('en-ae'). Adding a service is an entry in that registry, not a
 * new file here.
 *
 * India's four services keep their own static folders next to this one, each
 * with real content behind it. A static segment beats a dynamic one in Next's
 * matcher, so /en-in/services/capital-advisory/ still reaches its own page and
 * never falls through to this route — and the region guard below means this
 * route answers for the UAE only, so India cannot reach a UAE slug either.
 *
 * /services/research-intelligence/ is the one slug both markets use. Its static
 * folder wins for both, so the branch lives there; see that file.
 */
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import PageShell from '@/components/layout/PageShell';
import PageHeroSection from '@/components/sections/PageHeroSection';
import UaeServiceBody from '@/components/pages/UaeServiceBody';
import ServicePageBody from '@/components/pages/uae-services/ServicePageBody';
import {
  uaeServiceBody,
  uaeServiceContent,
  uaeServiceIsWritten,
} from '@/components/pages/uae-services';
import { buildMetadata } from '@/lib/seo';
import { vxnRegion, vxnServiceBySlug } from '@/lib/region';
import { uaeServiceConfig } from '@/lib/uae-service-pages';

type Params = { params: Promise<{ region: string; service: string }> };

/** The service this URL names, or null when the market does not publish it. */
function resolve(rawRegion: string, service: string) {
  const region = vxnRegion(rawRegion);
  if (region !== 'en-ae') return null;
  const found = vxnServiceBySlug(decodeURIComponent(service), region);
  return found ? { region, service: found } : null;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { region, service } = await params;
  const hit = resolve(region, service);
  if (!hit) return {};
  return buildMetadata(
    uaeServiceConfig(hit.service, uaeServiceIsWritten(hit.service.slug)),
    hit.region,
  );
}

export default async function UaeServicePage({ params }: Params) {
  const { region, service } = await params;
  const hit = resolve(region, service);
  if (!hit) notFound();

  /* Three shapes, in order of specificity. A service with a body of its own
     renders that; one with template content renders the shared five sections;
     everything still unwritten gets the coming-soon body. The first two sit
     between the same breadcrumb hero and subscribe block, so the section reads
     the same however its middle is built. */
  const Body = uaeServiceBody(hit.service.slug);
  const content = uaeServiceContent(hit.service.slug);
  const page = uaeServiceConfig(hit.service, uaeServiceIsWritten(hit.service.slug));

  if (!Body && !content) {
    return (
      <PageShell page={page} region={hit.region}>
        <UaeServiceBody page={page} region={hit.region} />
      </PageShell>
    );
  }

  /* A bespoke body owns its whole page: it opens its own #main-content wrapper
     and leads with its own hero, so the shared breadcrumb band is NOT rendered
     above it. Stacking the two put two heroes on the page — the section banner
     with the service name, and then the written hero underneath saying the same
     thing at greater length. The bespoke hero carries the breadcrumb itself. */
  /* NO SUBSCRIBE BAND UNDER A BESPOKE BODY. "Stay Ahead. Subscribe for Market
     Intelligence." and the striped divider under it are Elementor template
     4557; removed by request. A written page closes on its own terms — this
     one ends on "Talk to an Expert" and then the footer.

     The band is gone site-wide now (20260914): every page ends on its own last
     section and then the footer. 4557 stays in POST_CSS as a harmless no-op. */
  if (Body) {
    return (
      <PageShell page={page} region={hit.region}>
        <Body region={hit.region} />
      </PageShell>
    );
  }

  return (
    <PageShell page={page} region={hit.region}>
      <PageHeroSection page={page} region={hit.region} tone="brand" />
      <ServicePageBody region={hit.region} content={content!} />
    </PageShell>
  );
}
