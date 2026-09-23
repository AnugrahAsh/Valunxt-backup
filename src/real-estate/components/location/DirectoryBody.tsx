'use client';

/**
 * The two directory pages: every Dubai area guide, and every building page.
 *
 * Same template for both, driven by which set it is handed. Cards carry the
 * photograph, the sector, the tagline and the district's indicative headline
 * figure, and a sector filter narrows the list without a page load — with all
 * cards in the markup from the start, so the page is complete for a crawler
 * and for anyone without the bundle.
 */
import { useMemo, useState } from 'react';

import { locationPath, type LocationPage } from '../../data/locations';
import { PRICE_NOTE } from '../../data/market';
import { url } from '../../lib/routes';
import type { Locale } from '../../lib/types';
import { ArrowRight } from '../icons';
import Enquire from '../landing/Enquire';
import PageRoot from '../landing/PageRoot';
import { Developers } from '../landing/PageSections';
import { SectionHead } from '../landing/shared';

export default function DirectoryBody({
  locale,
  kind,
  items,
}: {
  locale: Locale;
  kind: 'area' | 'building';
  items: LocationPage[];
}) {
  const [sector, setSector] = useState('All');
  const sectors = useMemo(() => ['All', ...Array.from(new Set(items.map((i) => i.sector))).sort()], [items]);
  const shown = sector === 'All' ? items : items.filter((i) => i.sector === sector);

  const isArea = kind === 'area';
  const heading = isArea ? 'Dubai Area Guides' : 'Dubai Buildings';

  return (
    <PageRoot>
      <div className="re-loc">
        <section className="re-loc-hero" aria-label={heading}>
          <div className="re-loc-hero__bg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={isArea ? '/real-estate/listings/downtown-skyline.webp' : '/real-estate/listings/tower-glass.webp'}
              alt=""
              fetchPriority="high"
            />
          </div>
          <span className="re-loc-hero__scrim" aria-hidden="true" />
          <div className="re-wrap re-loc-hero__inner">
            <nav className="re-loc__crumb" aria-label="Breadcrumb">
              <a href={url(locale, '/')}>Dubai Real Estate</a>
              <i aria-hidden="true">/</i>
              <span aria-current="page">{isArea ? 'Area Guides' : 'Buildings'}</span>
            </nav>
            <div className="re-loc-hero__copy">
              <span className="re-loc-hero__kind">{items.length} {isArea ? 'communities' : 'addresses'}</span>
              <h1 className="re-loc-hero__title">{heading}</h1>
              <p className="re-loc-hero__tag">
                {isArea
                  ? 'Independent guides to the communities we work in: what each district is actually like, what it costs to buy and to rent, and what we check before a client commits.'
                  : 'Building-level guidance: the address, what is around it, the indicative numbers, and the tenure, service-charge and maintenance questions we settle before an offer.'}
              </p>
              <div className="re-loc-hero__actions">
                <a className="re-btn re-btn--light" href="#enquire">
                  Speak to an Advisor
                  <ArrowRight />
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="re-l-sec">
          <div className="re-wrap">
            <div className="re-l-split">
              <SectionHead
                eyebrow={isArea ? 'Where to live' : 'Where to buy'}
                title={isArea ? 'Choose a Community' : 'Choose an Address'}
              />
              <p className="re-l-lede" data-rv="up" data-rv-i="2">
                Every figure on these pages is an indicative market band rather than a valuation. Ask the
                desk for the evidence behind any of them.
              </p>
            </div>

            {sectors.length > 2 ? (
              <div className="re-loc-filter" role="group" aria-label="Filter by sector">
                {sectors.map((s) => (
                  <button
                    key={s}
                    type="button"
                    aria-pressed={s === sector}
                    onClick={() => setSector(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            ) : null}

            <ul className="re-loc-dir">
              {shown.map((loc, i) => (
                <li key={loc.slug} data-rv="up" data-rv-i={i % 3}>
                  <a href={url(locale, locationPath(loc))}>
                    <span className="re-loc-dir__shot">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={loc.image} alt="" loading={i < 6 ? 'eager' : 'lazy'} />
                      <span className="re-loc-dir__sector">{loc.sector}</span>
                    </span>
                    <span className="re-loc-dir__body">
                      <h3>{loc.name}</h3>
                      <p>{loc.tagline}</p>
                      <span className="re-loc-dir__foot">
                        <span>{loc.stats[0]?.label ?? 'Indicative'}</span>
                        <b>{loc.stats[0]?.value ?? 'On enquiry'}</b>
                      </span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>

            {shown.length === 0 ? <p className="re-loc-dir__empty">Nothing published in that sector yet.</p> : null}
            <p className="re-l-note">{PRICE_NOTE}</p>
          </div>
        </section>

        <Developers />

        <Enquire
          title={isArea ? 'Not Sure Which Community Fits?' : 'Looking at a Specific Building?'}
          lede={
            isArea
              ? 'Tell us the budget, the commute and who is moving, and we will shortlist the districts that actually work rather than the ones that market best.'
              : 'Send us the address and we will come back with the tenure position, the service-charge record and an honest view on the price.'
          }
        />
      </div>
    </PageRoot>
  );
}
