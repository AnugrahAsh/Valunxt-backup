/**
 * /industries/ — page body (redesigned 20260922, client instruction).
 *
 * Rebuilt on the UAE service template's system (see company/parts.tsx and
 * company/styles.ts): the template's hero, the six sectors as an explorer,
 * the six client segments, the template's blue banner and its closing band.
 *
 * WHAT THIS PAGE ANSWERS is unchanged: /industries/ is WHAT the group covers
 * (asset classes and the clients in each); /clients/ is how it works with
 * each kind of client.
 *
 * COPY is the page's own, from the sectors section it replaces
 * (IndustriesSectorsSection): the sector descriptions, the engagement lists,
 * the segments and the leads. Sector photographs are photographs of the
 * asset class, from the site's own image set.
 */
import { MegaIcon } from '@/components/layout/MegaIcons';
import { BASE, rurl } from '@/lib/region';
import { vxnMarkets } from '@/lib/site-data';
import type { PageConfig } from '@/lib/page-config';
import { Arrow, Banner, CompanyHero, CompanyPage, Lead, Talk } from './company/parts';
import SectorExplorer, { type Sector } from './company/SectorExplorer';

const SECTORS: Sector[] = [
  {
    n: '01',
    title: 'Residential',
    desc: 'Primary and secondary residential across metros and emerging corridors, from single-unit acquisition for private owners to bulk and floor-level deals for funds. Valuation, pricing benchmarks, and exit planning.',
    work: ['Acquisition & exit advisory', 'Portfolio valuation', 'Rental yield benchmarking'],
    href: '/services/real-estate-investment-advisory/',
    img: `${BASE}/real-estate/listings/marina-towers-pool.webp`,
    alt: 'Residential towers around a marina',
  },
  {
    n: '02',
    title: 'Grade-A Office',
    desc: 'Institutional office assets and business parks. We advise on entry pricing, tenant covenant quality, lease structuring, and the gap between headline and effective rents that drives real returns.',
    work: ['Asset valuation', 'Covenant & lease review', 'Cap-rate analysis'],
    href: '/services/research-intelligence/',
    img: `${BASE}/real-estate/listings/office-glass.webp`,
    alt: 'A glass office building',
  },
  {
    n: '03',
    title: 'Retail & Mixed-Use',
    desc: 'High-street, mall, and mixed-use schemes where trade-area strength and tenant mix decide value. Feasibility, catchment analysis, and repositioning strategy for underperforming assets.',
    work: ['Catchment & footfall analysis', 'Highest & best use', 'Repositioning strategy'],
    href: '/services/research-intelligence/',
    img: `${BASE}/assets/content/uploads/regions/en-in/homepage/industry-retail-fnb.webp`,
    alt: 'Shoppers in a mall atrium',
  },
  {
    n: '04',
    title: 'Warehousing & Logistics',
    desc: 'Grade-A warehousing, fulfilment, and cold chain, one of the fastest-repricing sectors in both our markets. Site selection, build-to-suit structuring, and yield benchmarking against comparable stock.',
    work: ['Site selection', 'Build-to-suit structuring', 'Yield benchmarking'],
    href: '/services/capital-advisory/',
    img: `${BASE}/assets/content/uploads/regions/en-in/homepage/industry-manufacturing-logistics.webp`,
    alt: 'Racking inside a large warehouse',
  },
  {
    n: '05',
    title: 'Land & Development',
    desc: 'Raw land, joint development agreements, and phased schemes. We work with developers on capital stack design, phasing, and the funding runway a project needs before the first sale is booked.',
    work: ['Feasibility & residual valuation', 'JV & JDA structuring', 'Development finance'],
    href: '/services/capital-advisory/',
    img: `${BASE}/real-estate/listings/offplan-rising.webp`,
    alt: 'Towers under construction on open land',
  },
  {
    n: '06',
    title: 'Hospitality',
    desc: 'Hotels, serviced apartments, and branded residences. Operator selection, management-agreement review, and trading-based valuation where the asset and the business are inseparable.',
    work: ['Trading-based valuation', 'Operator & brand selection', 'Feasibility studies'],
    href: '/services/research-intelligence/',
    img: `${BASE}/real-estate/listings/lounge-city-view.webp`,
    alt: 'A lounge overlooking the city',
  },
];

const SEGMENTS = [
  { icon: 'users', t: 'Private investors & HNIs', d: 'Individuals building or consolidating a real estate allocation alongside other assets.' },
  { icon: 'shield', t: 'Family offices', d: 'Multi-generational structures needing governance, valuation discipline, and succession-ready holding vehicles.' },
  { icon: 'globe', t: 'NRIs & cross-border buyers', d: 'Non-resident buyers allocating between India and the UAE, with structuring and repatriation in scope.' },
  { icon: 'building', t: 'Developers', d: 'Sponsors raising project capital, structuring JVs, and pricing phased releases.' },
  { icon: 'scales', t: 'Banks & lenders', d: 'Institutions requiring independent, standards-aligned valuation for credit and provisioning.' },
  { icon: 'chart', t: 'Funds & institutions', d: 'Allocators underwriting portfolios and needing independent research before committee.' },
];

export default function IndustriesBody({ region }: { page: PageConfig; region: string }) {
  return (
    <CompanyPage className="co-industries">
      <CompanyHero
        region={region}
        crumb="Industries"
        title="Industries & Sectors"
        sub="Residential, office, retail, warehousing, land and hospitality: the sectors we value, research and fund, and the clients we act for in each."
        plate="banners/industry.webp"
        alt="City lights at dusk"
      />

      {/* ---- 1. THE SECTORS ---- */}
      <section className="co-sectors" aria-labelledby="co-sectors-head">
        <div className="at-in">
          <Lead
            id="co-sectors-head"
            kicker="Sectors We Cover"
            head="Six Asset Classes."
            accent="One Valuation Discipline."
            lede={`These are the sectors our valuers, researchers and capital team cover across ${vxnMarkets('short')}, and what an engagement in each typically involves. Choose a sector to see it.`}
          />
          <SectorExplorer sectors={SECTORS.map((s) => ({ ...s, link: rurl(region, s.href) }))} />
        </div>
      </section>

      {/* ---- 2. WHO WE ACT FOR ---- */}
      <section className="co-segs" aria-labelledby="co-segs-head">
        <div className="at-in">
          <Lead
            id="co-segs-head"
            kicker="Who We Act For"
            head="Six Client Segments"
            lede="The sector sets the analysis; the client sets the mandate. Most engagements sit at the intersection of one of the sectors above and one of the segments below."
          />
          <div className="co-tiles">
            {SEGMENTS.map((g) => (
              <article className="co-tile" key={g.t}>
                <span className="co-tile__icon" aria-hidden="true">
                  <MegaIcon token={g.icon} />
                </span>
                <h3 className="co-tile__t">{g.t}</h3>
                <p className="co-tile__d">{g.d}</p>
              </article>
            ))}
          </div>
          <div className="co-segs__foot">
            <p>How we work with investors, families, NRIs, developers and institutions, segment by segment.</p>
            <a className="at-btn at-btn--line" href={rurl(region, '/clients/')}>
              Our clients
              <Arrow />
            </a>
          </div>
        </div>
      </section>

      {/* ---- 3. THE BANNER ---- */}
      <Banner
        region={region}
        id="co-banner-head"
        head="Real estate is not a single market."
        body="A warehouse in a logistics corridor, a Grade-A floor let to a listed tenant, and a phased residential scheme are priced by different drivers and fail for different reasons."
        cta={{ label: 'Explore our services', href: '/services/' }}
        plate="uae/home/connected-practices.webp"
        live="ind-banner"
      />

      {/* ---- 4. THE CLOSE ---- */}
      <Talk
        region={region}
        head="Discuss a Sector, an Asset or a Portfolio"
        lede="Tell us what you are valuing, researching or funding, and we will connect you with the team that covers it."
        cta={{ label: 'Get in Touch', href: '/contact/' }}
        photo="uae/home/expertise-inset.webp"
        alt="A Valunxt team meeting"
      />
    </CompanyPage>
  );
}
