'use client';

/**
 * THE LOCATION PAGE TEMPLATE — one component behind all 38 area guides and
 * building pages (data/locations).
 *
 * It is written in the landing page's design language and built from the
 * landing page's own parts wherever one exists: PageRoot's arrival engine and
 * enquiry context, SectionHead, PropertyGrid for the stock, Faq, Voices, the
 * live-abstract Band and Enquire. What this file adds is the shape that is
 * particular to a location: the photographic hero with the breadcrumb, the
 * fact strip, the editorial intro beside a sticky at-a-glance card, the map
 * with its drive times, the everyday-life columns, the indicative price table,
 * the investment read beside the desk's own checks, and the nearby links.
 *
 * Sections render only where the record carries data for them, so a building
 * page with no stock shows no listings block rather than an empty one.
 */
import dynamic from 'next/dynamic';

import { listingsFor, locationPath, nearbyOf, type LocationPage } from '../../data/locations';
import { PRICE_NOTE } from '../../data/market';
import { url } from '../../lib/routes';
import type { Locale } from '../../lib/types';
import { ArrowRight } from '../icons';
import Enquire from '../landing/Enquire';
import Faq from '../landing/Faq';
import PageRoot from '../landing/PageRoot';
import PropertyGrid from '../landing/PropertyGrid';
import { Band, Developers, Voices } from '../landing/PageSections';
import { IcArrow, IcCheck, SectionHead } from '../landing/shared';

const LocationMap = dynamic(() => import('./LocationMap'), {
  ssr: false,
  loading: () => <div className="re-loc-map re-loc-map--loading" aria-hidden="true" />,
});

/** The live abstract behind each kind of call to action. The lattice belongs
    to the enquiry panel, so it is not used here. */
const BAND_VARIANT = { area: 'skyline', building: 'arches' } as const;

function Crumb({ locale, loc }: { locale: Locale; loc: LocationPage }) {
  const parent = loc.kind === 'building' ? 'Buildings' : 'Area Guides';
  const parentHref = url(locale, loc.kind === 'building' ? '/dubai/buildings/' : '/dubai/area-guides/');
  return (
    <nav className="re-loc__crumb" aria-label="Breadcrumb">
      <a href={url(locale, '/')}>Dubai Real Estate</a>
      <i aria-hidden="true">/</i>
      <a href={parentHref}>{parent}</a>
      <i aria-hidden="true">/</i>
      <span aria-current="page">{loc.name}</span>
    </nav>
  );
}

export default function LocationBody({ locale, loc }: { locale: Locale; loc: LocationPage }) {
  const groups = listingsFor(loc);
  const nearby = nearbyOf(loc);
  const isBuilding = loc.kind === 'building';

  return (
    <PageRoot>
      <div className="re-loc">
        {/* ---- 1. HERO ---- */}
        <section className="re-loc-hero" aria-label={loc.name}>
          <div className="re-loc-hero__bg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={loc.image} alt="" fetchPriority="high" />
          </div>
          <span className="re-loc-hero__scrim" aria-hidden="true" />
          <div className="re-wrap re-loc-hero__inner">
            <Crumb locale={locale} loc={loc} />
            <div className="re-loc-hero__copy">
              <span className="re-loc-hero__kind">{isBuilding ? 'Building' : 'Area Guide'} · {loc.sector}</span>
              <h1 className="re-loc-hero__title">{loc.name}</h1>
              <p className="re-loc-hero__tag">{loc.tagline}</p>
              <div className="re-loc-hero__actions">
                <a className="re-btn re-btn--light" href="#enquire">
                  Speak to an Advisor
                  <ArrowRight />
                </a>
                <a className="re-loc-hero__go" href={groups.length ? '#listings' : '#map'}>
                  {groups.length ? 'See what is available' : 'Where it sits'}
                  <IcArrow />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ---- 2. THE FACT STRIP ---- */}
        <div className="re-loc-facts">
          <ul className="re-wrap">
            {loc.stats.map((s) => (
              <li key={s.label}>
                <strong>{s.value}</strong>
                <b>{s.label}</b>
                {s.detail ? <small>{s.detail}</small> : null}
              </li>
            ))}
          </ul>
        </div>

        {/* ---- 3. THE INTRO, BESIDE THE AT-A-GLANCE CARD ---- */}
        <section className="re-l-sec re-loc-intro" id="overview">
          <div className="re-wrap">
            <div className="re-loc-intro__grid">
              <div>
                <SectionHead
                  eyebrow={isBuilding ? 'The address' : 'The district'}
                  title={`${loc.name} at a Glance`}
                />
                <div className="re-loc-prose" data-rv="up" data-rv-i="2">
                  {loc.intro.map((p) => (
                    <p key={p.slice(0, 40)}>{p}</p>
                  ))}
                </div>
                <ul className="re-loc-suits" data-rv="up" data-rv-i="3">
                  {loc.suits.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </div>

              <aside className="re-loc-card" data-rv="up" data-rv-i="2">
                <h2>Key facts</h2>
                <dl>
                  <div>
                    <dt>Sector</dt>
                    <dd>{loc.sector}</dd>
                  </div>
                  <div>
                    <dt>Tenure</dt>
                    <dd>{loc.tenure === 'Mixed' ? 'Confirm per plot' : loc.tenure}</dd>
                  </div>
                  {(loc.facts ?? []).map((f) => (
                    <div key={f.label}>
                      <dt>{f.label}</dt>
                      <dd>{f.value}</dd>
                    </div>
                  ))}
                  {loc.connections.slice(0, 2).map((c) => (
                    <div key={c.to}>
                      <dt>To {c.to}</dt>
                      <dd>{c.minutes}</dd>
                    </div>
                  ))}
                </dl>
                <p className="re-loc-card__note">{loc.tenureNote}</p>
                <a className="re-btn re-btn--primary" href="#enquire">
                  Ask about {loc.name}
                  <ArrowRight />
                </a>
              </aside>
            </div>
          </div>
        </section>

        {/* ---- 4. WHAT IT IS LIKE ---- */}
        <section className="re-l-sec re-loc-highlights">
          <div className="re-wrap">
            <SectionHead
              eyebrow={isBuilding ? 'What the address offers' : 'What it is like'}
              title={isBuilding ? 'Why People Choose This Address' : `Living in ${loc.name}`}
            />
            <ul className="re-loc-high">
              {loc.highlights.map((h, i) => (
                <li key={h.title} data-rv="up" data-rv-i={i % 2}>
                  <h3>{h.title}</h3>
                  <p>{h.body}</p>
                </li>
              ))}
            </ul>
            {loc.amenities?.length ? (
              <ul className="re-loc-amen" data-rv="up" data-rv-i="2">
                {loc.amenities.map((a) => (
                  <li key={a}>
                    <IcCheck />
                    {a}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </section>

        {/* ---- 5. THE MAP AND THE DRIVE TIMES ---- */}
        <section className="re-l-sec re-loc-map-sec" id="map">
          <div className="re-wrap">
            <div className="re-loc-map__grid">
              <div className="re-loc-map__side">
                <SectionHead eyebrow="Where it sits" title="On the Map, and How Far" />
                <ul className="re-loc-conn" data-rv="up" data-rv-i="2">
                  {loc.connections.map((c) => (
                    <li key={c.to}>
                      <span>{c.to}</span>
                      <strong>{c.minutes}</strong>
                    </li>
                  ))}
                </ul>
                <p className="re-loc-map__note">
                  Drive times are typical off-peak runs and will be longer in the morning and evening
                  peaks. We would always have you drive your own commute before committing to an address.
                </p>
              </div>
              <div data-rv="up" data-rv-i="3">
                <LocationMap lat={loc.lat} lng={loc.lng} name={loc.name} precise={loc.locate !== 'district'} />
                {loc.locate === 'district' ? (
                  <p className="re-loc-map__note">
                    This pin marks the district rather than the exact plot. The desk confirms the precise
                    address, and walks it with you, before any offer.
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        {/* ---- 6. EVERYDAY LIFE ---- */}
        <section className="re-l-sec re-loc-living-sec">
          <div className="re-wrap">
            <SectionHead
              eyebrow="Everyday life"
              title={isBuilding ? 'What Is Around It' : 'Schools, Shops and Getting Around'}
            />
            <ul className="re-loc-living">
              {loc.living.map((col, i) => (
                <li key={col.title} data-rv="up" data-rv-i={i}>
                  <h3>{col.title}</h3>
                  <ul>
                    {col.items.map((item) => (
                      <li key={item}>
                        <IcCheck />
                        {item}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ---- 7. STOCK ---- */}
        {groups.length ? (
          <section className="re-l-sec re-l-listings" id="listings">
            <div className="re-wrap">
              <div className="re-l-split">
                <SectionHead
                  eyebrow="Featured, indicative"
                  title={`Property in ${loc.name}`}
                />
                <p className="re-l-lede" data-rv="up" data-rv-i="2">
                  A representative selection of what the desk handles at this address and in the streets
                  around it. Open a card for the full details, or ask us for what is available today.
                </p>
              </div>
              <PropertyGrid groups={groups} note={PRICE_NOTE} />
              <p className="re-l-note">{PRICE_NOTE}</p>
            </div>
          </section>
        ) : null}

        {/* ---- 8. INDICATIVE PRICES ---- */}
        <section className="re-l-sec re-loc-prices">
          <div className="re-wrap">
            <div className="re-l-split">
              <SectionHead eyebrow="Indicative" title="What It Costs to Buy and to Rent" />
              <p className="re-l-lede" data-rv="up" data-rv-i="2">
                Market bands for {loc.name}, not a valuation of any one property. The desk prices a
                specific unit against comparable evidence before you offer.
              </p>
            </div>
            <div className="re-loc-table" data-rv="up" data-rv-i="3">
              <table>
                <thead>
                  <tr>
                    <th scope="col">Property type</th>
                    <th scope="col">To buy</th>
                    <th scope="col">To rent</th>
                  </tr>
                </thead>
                <tbody>
                  {loc.prices.map((r) => (
                    <tr key={r.type}>
                      <th scope="row">{r.type}</th>
                      <td>{r.sale}</td>
                      <td>{r.rent}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="re-l-note">{PRICE_NOTE}</p>
          </div>
        </section>

        {/* ---- 9. THE INVESTMENT READ, AND THE DESK'S CHECKS ---- */}
        <section className="re-l-sec re-loc-invest">
          <div className="re-wrap">
            <div className="re-loc-invest__grid">
              <div>
                <SectionHead eyebrow="The investment read" title="What the Numbers Say" />
                <div className="re-loc-prose" data-rv="up" data-rv-i="2">
                  <p>{loc.invest.body}</p>
                </div>
                <ul className="re-loc-points" data-rv="up" data-rv-i="3">
                  {loc.invest.points.map((p) => (
                    <li key={p}>
                      <IcCheck />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="re-loc-checks" data-rv="up" data-rv-i="3">
                <p className="re-loc-checks__head">Before you commit, we check</p>
                <ul className="re-loc-points">
                  {loc.checks.map((c) => (
                    <li key={c}>
                      <IcCheck />
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ---- 10. THE CALL, ON A LIVE ABSTRACT ---- */}
        <Band
          variant={BAND_VARIANT[loc.kind]}
          eyebrow={loc.sector}
          title={`Thinking About ${loc.name}?`}
          body={`Tell us what you are trying to do — buy, let, sell or simply understand the numbers — and we will come back with the evidence for ${loc.name} rather than a brochure.`}
        />

        {/* ---- 11. REVIEWS ---- */}
        <Voices />

        {/* ---- 12. QUESTIONS ---- */}
        <Faq items={loc.faqs} eyebrow="Questions" title={`${loc.name}: What People Ask`} />

        {/* ---- 13. NEARBY ---- */}
        {nearby.length ? (
          <section className="re-l-sec re-loc-near-sec">
            <div className="re-wrap">
              <SectionHead
                eyebrow="Nearby"
                title="Other Places Worth Looking At"
                lede="Districts and addresses our clients usually weigh against this one."
              />
              <ul className="re-loc-near">
                {nearby.map((n, i) => (
                  <li key={n.slug} data-rv="up" data-rv-i={i}>
                    <a href={url(locale, locationPath(n))}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={n.image} alt="" loading="lazy" />
                      <span className="re-loc-near__copy">
                        <small>{n.sector}</small>
                        <strong>{n.name}</strong>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ) : null}

        <Developers />

        {/* ---- 14. THE ENQUIRY ---- */}
        <Enquire
          title={`Talk to the Desk About ${loc.name}`}
          lede="One advisor, the building's own numbers, and an honest view on whether it is the right address for what you are trying to do."
        />
      </div>
    </PageRoot>
  );
}
