/**
 * /clients/ — page body (redesigned 20260922, client instruction).
 *
 * Rebuilt on the UAE service template's system (see company/parts.tsx and
 * company/styles.ts): the template's hero, an index of the four client
 * segments, a section per segment, the firm's commitments, the testimonials
 * block and the template's closing band.
 *
 * THE ANCHORS STAY. Each segment section keeps the id the capture gave its
 * menu anchor — service_1 to service_4 — so links elsewhere on the site to
 * /clients/#service_2 still land on Family Offices.
 *
 * COPY is the page's own: the segment headings, paragraphs and lists are the
 * capture's; the index lines are shortened from those paragraphs; the
 * commitments are the firm's own, stated verbatim on the service pages.
 */
import { MegaIcon } from '@/components/layout/MegaIcons';
import TestimonialsSection from '@/components/sections/TestimonialsSection';
import CtaArrow from '@/components/ui/CtaArrow';
import { rurl } from '@/lib/region';
import type { PageConfig } from '@/lib/page-config';
import { Arrow, Check, CompanyHero, CompanyPage, Lead, Talk, upl } from './company/parts';

const SEGMENTS = [
  {
    id: 'service_1',
    icon: 'users',
    name: 'Private & HNI Investors',
    line: 'Building and protecting wealth through real estate, with discreet, one to one advice.',
    head: 'Guiding Private Wealth With Clarity',
    body: 'We work with private individuals and high net worth investors seeking to build and protect wealth through real estate. From first acquisitions to sophisticated multi asset portfolios, our advisors bring the discipline, discretion, and personalised attention that discerning investors expect at every stage of their journey.',
    points: ['Personalised portfolio strategy', 'Discreet, one to one advisory', 'Access to curated opportunities'],
    img: 'uae/home/who-we-work-with.webp',
    alt: 'An adviser in conversation with a private investor',
  },
  {
    id: 'service_2',
    icon: 'shield',
    name: 'Family Offices',
    line: 'Real estate allocations managed with a long term, generational perspective.',
    head: 'Stewarding Family Capital Across Generations',
    body: 'We support single and multi family offices in managing real estate allocations with a long term, generational perspective. Our team integrates rigorous analysis, capital structuring, and independent oversight to help families preserve and grow wealth across market cycles, with governance and succession firmly in view.',
    points: ['Generational wealth planning', 'Consolidated portfolio oversight', 'Governance & succession alignment'],
    img: 'new-folder/hero-right-2.webp',
    alt: 'A family reviewing plans with an adviser',
  },
  {
    id: 'service_3',
    icon: 'globe',
    name: 'NRI Investors',
    line: 'Investing in Indian and Dubai real estate with confidence, from anywhere in the world.',
    head: 'Investing Back Home, With Confidence',
    body: 'We help Non Resident Indians invest with confidence in Indian and Dubai real estate from anywhere in the world. From remote due diligence and documentation to repatriation and tax aware structuring, we make cross border investing simple, transparent, and secure, so distance is never a barrier to opportunity.',
    points: ['End to end remote advisory', 'Cross border compliance support', 'Repatriation & tax guidance'],
    img: 'uae/home/answer-skyline.webp',
    alt: 'A city skyline across the water',
  },
  {
    id: 'service_4',
    icon: 'building',
    name: 'Developers & Institutions',
    line: 'Projects and portfolios that demand scale, precision and institutional grade rigour.',
    head: 'Scaling Projects & Portfolios at Institutional Grade',
    body: 'We partner with developers, funds, and institutional investors on projects and portfolios that demand scale and precision. From capital raising and feasibility to research and technology enablement, we bring institutional grade rigour, transparent reporting, and dependable execution to every mandate.',
    points: ['Capital raising & structuring', 'Feasibility & market research', 'Institutional reporting & analytics'],
    img: 'uae/home/expertise-boardroom.webp',
    alt: 'A boardroom meeting overlooking the city',
  },
];

/** The firm's stated commitments, verbatim — the same three the service pages carry. */
const COMMITMENTS = [
  { title: 'Fixed fees agreed before work begins', icon: 'ledger', label: 'Free Consultation', href: '/free-consultation/' },
  { title: 'A partner who answers when you call', icon: 'handshake', label: 'Talk to Us', href: '/contact/' },
  { title: 'RICS-regulated valuation through group firm Reliant Surveyors', icon: 'scales', label: 'Valuation & Advisory', href: '/services/valuation-and-advisory/' },
];

export default function ClientsBody({ region }: { page: PageConfig; region: string }) {
  return (
    <CompanyPage className="co-clients">
      <CompanyHero
        region={region}
        crumb="Clients"
        title="Investors, Families & Institutions"
        sub="Valunxt partners with private investors, family offices, NRIs, developers, and institutions, delivering tailored advisory, capital solutions, and intelligence at every stage of their investment journey across India and the UAE."
        plate="banners/clients.webp"
        alt="An office floor in motion"
      />

      {/* ---- 1. WHO WE WORK WITH — the index ---- */}
      <section className="co-index" aria-labelledby="co-index-head">
        <div className="at-in">
          <Lead
            id="co-index-head"
            kicker="Who We Work With"
            head="Tailored Advisory"
            accent="at Every Stage of the Journey"
            lede="Four kinds of client come to the group, each with a different question. Choose yours to see how we work with it."
          />
          <div className="co-index__grid">
            {SEGMENTS.map((s, i) => (
              <a className="co-ix" href={`#${s.id}`} key={s.id}>
                <span className="co-ix__top">
                  <span className="co-ix__n">{String(i + 1).padStart(2, '0')}</span>
                  <span className="co-ix__icon" aria-hidden="true">
                    <MegaIcon token={s.icon} />
                  </span>
                </span>
                <span className="co-ix__t">{s.name}</span>
                <span className="co-ix__d">{s.line}</span>
                <span className="co-ix__go">
                  See how we help
                  <Arrow down />
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ---- 2. A SECTION PER SEGMENT ---- */}
      {SEGMENTS.map((s, i) => (
        <section className={`co-seg${i % 2 === 0 ? ' co-seg--tint' : ''}`} id={s.id} key={s.id} aria-labelledby={`${s.id}-head`}>
          <div className="at-in">
            <div className={`co-seg__grid${i % 2 === 1 ? ' co-seg__grid--flip' : ''}`}>
              <figure className="co-seg__fig">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="at-plate at-zoom" src={upl(region, s.img)} alt={s.alt} loading="lazy" />
                <span className="co-seg__num" aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
              </figure>
              <div className="co-seg__copy">
                <span className="at-kicker">{s.name}</span>
                <h2 className="co-seg__head" id={`${s.id}-head`}>
                  {s.head}
                </h2>
                <p className="co-seg__lede">{s.body}</p>
                <ul className="co-seg__points">
                  {s.points.map((p) => (
                    <li key={p}>
                      <Check />
                      {p}
                    </li>
                  ))}
                </ul>
                <a className="at-btn at-btn--solid" href={rurl(region, '/contact/')}>
                  Get in Touch
                  <CtaArrow />
                </a>
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* ---- 3. THE COMMITMENTS ---- */}
      <section className="co-std" aria-labelledby="co-std-head">
        <div className="at-in">
          <Lead
            id="co-std-head"
            kicker="Our Commitments"
            head="The Same Standard,"
            accent="Whoever the Client"
            lede="Every engagement, for every kind of client, rests on the same three commitments."
          />
          <div className="co-std__grid">
            {COMMITMENTS.map((c) => (
              <div className="co-std__item" key={c.title}>
                <span className="co-std__icon" aria-hidden="true">
                  <MegaIcon token={c.icon} />
                </span>
                <h3 className="co-std__t">{c.title}</h3>
                <a className="co-std__link" href={rurl(region, c.href)}>
                  {c.label}
                  <Arrow />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Renders nothing until real, consented quotes exist — see the component. */}
      <TestimonialsSection />

      {/* ---- 4. THE CLOSE ---- */}
      <Talk
        region={region}
        head="Tell Us Where You Are in Your Investment Journey"
        lede="Whether you are making a first acquisition, consolidating a family portfolio, investing from abroad or raising capital for a project, our advisory team is here to help."
        cta={{ label: 'Get in Touch', href: '/contact/' }}
        photo="uae/home/why-choose-us.webp"
        alt="Valunxt advisers at work"
      />
    </CompanyPage>
  );
}
