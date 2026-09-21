/**
 * The service pages' own sections, in the landing page's design language:
 * hairlines rather than boxes, pill section labels, the electric blue for
 * the one thing on each row that matters, and the practice's live abstracts
 * where a panel carries a message.
 *
 *   Offer       what the service includes, a numbered hairline grid
 *   Stock       listings: gallery cards, type filters, sort and a quick view
 *   Prices      an indicative price or rent table
 *   Costs       what a transaction costs beyond the price
 *   Plans       off-plan payment structures
 *   Band        the page's call to action, on a live abstract
 *   Voices      client reviews
 *   Developers  the developers the desk works with, as a slow marquee
 */
import { PRICE_NOTE } from '../../data/market';
import { REVIEWS, REVIEWS_HEAD } from '../../data/home';
import { PARTNERS, PARTNERS_TITLE } from '../../data/site';
import type { FeatureCard, Listing, PaymentPlan, PriceRow } from '../../lib/types';
import type { EstateVariant } from '../three/estateScenes';
import { ArrowRight } from '../icons';
import LiveAbstract from './LiveAbstract';
import PropertyGrid from './PropertyGrid';
import { IcCheck, IcStar, SectionHead } from './shared';

function Head({ eyebrow, title, lede }: { eyebrow: string; title: string; lede?: string }) {
  return (
    <div className="re-l-split">
      <SectionHead eyebrow={eyebrow} title={title} />
      {lede ? (
        <p className="re-l-lede" data-rv="up" data-rv-i="2">
          {lede}
        </p>
      ) : null}
    </div>
  );
}

export function Offer({ title, lede, items }: { title: string; lede: string; items: FeatureCard[] }) {
  return (
    <section className="re-l-sec re-l-offer" id="included">
      <div className="re-wrap">
        <Head eyebrow="What’s included" title={title} lede={lede} />
        <ol className="re-l-offer__grid">
          {items.map((o, i) => (
            <li key={o.title} data-rv="up" data-rv-i={i % 3}>
              <span className="re-l-offer__n">{String(i + 1).padStart(2, '0')}</span>
              <h3>{o.title}</h3>
              <p>{o.summary}</p>
              <ul>
                {o.bullets.map((b) => (
                  <li key={b}>
                    <IcCheck />
                    {b}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function Stock({ title, lede, groups }: { title: string; lede: string; groups: { key: string; label: string; items: Listing[] }[] }) {
  return (
    <section className="re-l-sec re-l-listings" id="listings">
      <div className="re-wrap">
        <Head eyebrow="Featured, indicative" title={title} lede={lede} />
        <PropertyGrid groups={groups} note={PRICE_NOTE} />
        <p className="re-l-note">{PRICE_NOTE}</p>
      </div>
    </section>
  );
}

export function Prices({ title, lede, rows, columns }: { title: string; lede: string; rows: PriceRow[]; columns: [string, string, string] }) {
  return (
    <section className="re-l-sec re-l-prices">
      <div className="re-wrap">
        <Head eyebrow="Indicative" title={title} lede={lede} />
        <div className="re-l-table" data-rv="up" data-rv-i="2">
          <table>
            <thead>
              <tr>
                <th scope="col">Community</th>
                <th scope="col">{columns[0]}</th>
                <th scope="col">{columns[1]}</th>
                <th scope="col">{columns[2]}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.area}>
                  <th scope="row">{r.area}</th>
                  <td>{r.apartment}</td>
                  <td>{r.villa}</td>
                  <td>{r.yield}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="re-l-note">{PRICE_NOTE}</p>
      </div>
    </section>
  );
}

export function Costs({ title, lede, rows }: { title: string; lede: string; rows: { label: string; value: string; note: string }[] }) {
  return (
    <section className="re-l-sec re-l-costs-sec">
      <div className="re-wrap">
        <Head eyebrow="What it costs" title={title} lede={lede} />
        <ul className="re-l-costs">
          {rows.map((r, i) => (
            <li key={r.label} data-rv="up" data-rv-i={i}>
              <span className="re-l-costs__label">{r.label}</span>
              <span className="re-l-costs__value">{r.value}</span>
              <span className="re-l-costs__note">{r.note}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function Plans({ items }: { items: PaymentPlan[] }) {
  return (
    <section className="re-l-sec re-l-plans-sec">
      <div className="re-wrap">
        <Head
          eyebrow="Payment plans"
          title="How Off-Plan Payments Are Structured"
          lede="The plan matters as much as the price. These are the structures you will be offered, and what each one actually costs you over its life."
        />
        <ul className="re-l-plans">
          {items.map((pl, i) => (
            <li key={pl.name} data-rv="up" data-rv-i={i}>
              <p className="re-l-plans__split">{pl.split}</p>
              <h3>{pl.name}</h3>
              <p className="re-l-plans__sum">{pl.summary}</p>
              <dl>
                {pl.rows.map((r) => (
                  <div key={r.label}>
                    <dt>{r.label}</dt>
                    <dd>{r.value}</dd>
                  </div>
                ))}
              </dl>
              <p className="re-l-plans__best">
                <strong>Suits</strong> {pl.best}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function Band({ variant, eyebrow, title, body }: { variant: EstateVariant; eyebrow: string; title: string; body: string }) {
  return (
    <section className="re-l-sec re-l-band-sec">
      <div className="re-wrap">
        <div className="re-l-band" data-rv="clip">
          <LiveAbstract variant={variant} className="re-l-band__live" />
          <div className="re-l-band__copy">
            <span className="re-l-eyebrow re-l-eyebrow--ghost">{eyebrow}</span>
            <h2>{title}</h2>
            <p>{body}</p>
            <a className="re-btn re-btn--light" href="#enquire">
              Speak to an Advisor
              <ArrowRight />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stars({ n = 5 }: { n?: number }) {
  return (
    <span className="re-l-stars" aria-label={`${n} out of 5`}>
      {Array.from({ length: n }, (_, i) => (
        <IcStar key={i} />
      ))}
    </span>
  );
}

export function Voices() {
  return (
    <section className="re-l-sec re-l-voices" id="reviews">
      <div className="re-wrap">
        <div className="re-l-split">
          <SectionHead eyebrow={REVIEWS_HEAD.eyebrow} title={REVIEWS_HEAD.title} />
          <div className="re-l-voices__score" data-rv="up" data-rv-i="2">
            <strong>{REVIEWS_HEAD.score}</strong>
            <span>
              <Stars />
              <small>{REVIEWS_HEAD.scoreNote}</small>
            </span>
          </div>
        </div>
        <ul className="re-l-voices__grid">
          {REVIEWS.map((r, i) => (
            <li key={r.name} data-rv="up" data-rv-i={i}>
              <Stars n={r.rating} />
              <blockquote>{r.body}</blockquote>
              <p className="re-l-voices__who">
                <span className="re-l-voices__av" aria-hidden="true">
                  {r.name.trim().charAt(0).toUpperCase()}
                </span>
                <span>
                  <strong>{r.name}</strong>
                  <small>{r.when} · Google</small>
                </span>
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function Developers() {
  const names = [...PARTNERS, ...PARTNERS];
  return (
    <section className="re-l-devs" aria-label={PARTNERS_TITLE}>
      <p className="re-l-devs__title">{PARTNERS_TITLE}</p>
      <div className="re-l-devs__marquee">
        <div className="re-l-devs__track">
          {names.map((p, i) => (
            <span key={i} aria-hidden={i >= PARTNERS.length ? 'true' : undefined}>
              {p.name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
