/**
 * THE PUBLIC ADDRESSES THE CLIENT ASKED FOR (20260917), in one table.
 *
 * The service pages are BUILT at /<market>/services/<service>/<sub>/ — that is
 * where the routes, the page registry, the SEO rows and every `href` in the
 * content files point, and none of that moves. The client's sheet publishes
 * them at short, flat addresses instead (/en-ae/cfo-services/). This file is
 * the whole of the difference, and four places read it:
 *
 *   lib/region.ts    rurl() emits the public address for every internal href,
 *                    so no link on the site points at an address that redirects.
 *   proxy.ts         a request for a public address is REWRITTEN to the page
 *                    that renders it; a request for the old built address is
 *                    sent, 301, to its public one.
 *   lib/seo.ts       the fallback canonical is the public address.
 *   lib/site-pages   marketPath(), which the sitemap is generated from.
 *
 * Keep it a plain data module: the proxy imports it, so nothing here may touch
 * the filesystem, the database or React.
 *
 * TWO ROWS OF THE SHEET ARE NOT HERE, because each names an address another
 * page already lives at, and pointing it elsewhere would take that page down:
 *   /en-ae/real-estate/   is the real estate module's own landing page.
 *   /en-ae/research/      is the Research & Reports listing.
 * The service pages for those two keep their built addresses until the client
 * says which page each address should show.
 *
 * TWO ROWS ARE HERE THAT THE SHEET DOES NOT HAVE, so the section has one URL
 * shape rather than two: Budgeting & Forecasting and Property Valuation, both
 * live pages the sheet predates. /en-ae/company-valuation/, which the sheet
 * does name, is the page Property Valuation replaced on 20260916 and is sent
 * on to it.
 */

/** [public, built] — both without the market prefix, both with a trailing slash. */
type Row = readonly [string, string];

const UAE: Row[] = [
  ['/accounting-services-dubai/', '/services/accounting-tax-services/'],
  ['/accounting-bookkeeping-services/', '/services/accounting-tax-services/accounting-bookkeeping/'],
  ['/corporate-tax-services/', '/services/accounting-tax-services/corporate-tax-services/'],
  ['/vat-advisory-services/', '/services/accounting-tax-services/vat-services/'],
  ['/cfo-services/', '/services/accounting-tax-services/cfo-services/'],
  ['/financial-reporting/', '/services/accounting-tax-services/financial-reporting/'],
  ['/management-reporting/', '/services/accounting-tax-services/management-reporting/'],
  ['/external-audit-services/', '/services/accounting-tax-services/external-audit-support/'],
  ['/budgeting-forecasting/', '/services/accounting-tax-services/budgeting-forecasting/'],

  ['/buy-property/', '/services/real-estate-transactions/buy-property/'],
  ['/sell-property/', '/services/real-estate-transactions/sell-rent-lease-property/'],
  ['/off-plan-properties/', '/services/real-estate-transactions/off-plan-properties/'],

  ['/mortgages/', '/services/mortgages-services/'],
  ['/residential-mortgage/', '/services/mortgages-services/residential-mortgages/'],
  ['/commercial-mortgage/', '/services/mortgages-services/commercial-mortgages/'],
  ['/mortgage-pre-approval/', '/services/mortgages-services/mortgage-pre-approval/'],
  ['/mortgage-refinancing/', '/services/mortgages-services/refinancing/'],
  ['/non-resident-mortgage/', '/services/mortgages-services/non-resident-mortgages/'],
  ['/islamic-finance/', '/services/mortgages-services/islamic-finance/'],

  ['/valuation-advisory/', '/services/valuation-and-advisory/'],
  ['/business-valuation/', '/services/valuation-and-advisory/business-valuation/'],
  ['/property-valuation/', '/services/valuation-and-advisory/property-valuation/'],
  ['/plant-machinery-valuation/', '/services/valuation-and-advisory/plant-machinery-valuation/'],
  ['/asset-valuation/', '/services/valuation-and-advisory/asset-valuation/'],
  ['/financial-valuation/', '/services/valuation-and-advisory/financial-valuation/'],

  ['/real-estate-research/', '/services/research-intelligence/real-estate-research/'],
  ['/market-research/', '/services/research-intelligence/market-research/'],
  ['/investment-research/', '/services/research-intelligence/investment-research/'],
  ['/feasibility-studies/', '/services/research-intelligence/feasibility-studies/'],
  ['/market-intelligence/', '/services/research-intelligence/market-intelligence/'],
  ['/research-reports/', '/services/research-intelligence/research-reports/'],

  ['/technology-ai/', '/services/technology-data-ai/'],
  ['/technology-consulting/', '/services/technology-data-ai/technology-consulting/'],
  ['/ai-solutions/', '/services/technology-data-ai/ai-solutions/'],
  ['/erp-dashboard/', '/services/technology-data-ai/erp-dashboards/'],
  ['/proptech/', '/services/technology-data-ai/proptech/'],
  ['/enterprise-solutions/', '/services/technology-data-ai/enterprise-solutions/'],
];

const INDIA: Row[] = [
  ['/advisory-services/', '/services/'],
  ['/real-estate-investment-advisory/', '/services/real-estate-investment-advisory/'],
  ['/capital-advisory/', '/services/capital-advisory/'],
  ['/research-intelligence/', '/services/research-intelligence/'],
  ['/technology-ai/', '/services/technology-ai/'],
];

/** Addresses the sheet names for pages that have since been replaced. */
const UAE_MOVED: Row[] = [['/company-valuation/', '/property-valuation/']];

const TABLES: Record<string, { rows: Row[]; moved: Row[] }> = {
  'en-ae': { rows: UAE, moved: UAE_MOVED },
  'en-in': { rows: INDIA, moved: [] },
};

interface Index {
  toBuilt: Map<string, string>;
  toPublic: Map<string, string>;
  moved: Map<string, string>;
}

const INDEX: Record<string, Index> = Object.fromEntries(
  Object.entries(TABLES).map(([region, t]) => [
    region,
    {
      toBuilt: new Map(t.rows.map(([pub, built]) => [pub, built])),
      toPublic: new Map(t.rows.map(([pub, built]) => [built, pub])),
      moved: new Map(t.moved.map(([from, to]) => [from, to])),
    },
  ]),
);

function slashed(p: string): string {
  const clean = ('/' + p).replace(/\/{2,}/g, '/');
  return clean.endsWith('/') ? clean : clean + '/';
}

/** '/en-ae/cfo-services' → ['en-ae', '/cfo-services/'], or null outside a market. */
function split(pathname: string): [string, string] | null {
  const parts = pathname.split('/').filter(Boolean);
  const region = parts[0] ?? '';
  if (!INDEX[region]) return null;
  return [region, slashed(parts.slice(1).join('/'))];
}

/** The public address of a built, unprefixed path in a market — or null. */
export function publicPathIn(region: string, builtPath: string): string | null {
  return INDEX[region]?.toPublic.get(slashed(builtPath)) ?? null;
}

/** A full request path's public form: '/en-ae/services/…/' → '/en-ae/cfo-services/'. */
export function publicPathFor(pathname: string): string | null {
  const s = split(pathname);
  if (!s) return null;
  const pub = INDEX[s[0]]!.toPublic.get(s[1]);
  return pub ? `/${s[0]}${pub}` : null;
}

/** A full public request path's built form, for the proxy's rewrite. */
export function builtPathFor(pathname: string): string | null {
  const s = split(pathname);
  if (!s) return null;
  const built = INDEX[s[0]]!.toBuilt.get(s[1]);
  return built ? `/${s[0]}${built}` : null;
}

/** A full request path the sheet names but another page has replaced. */
export function movedPathFor(pathname: string): string | null {
  const s = split(pathname);
  if (!s) return null;
  const to = INDEX[s[0]]!.moved.get(s[1]);
  return to ? `/${s[0]}${to}` : null;
}
