/**
 * The feature bands that run between the services accordion and the insights
 * carousel on /en-ae/ only: a dark impact strip, a three-card mosaic and a
 * careers band. A fourth, the split spotlight, is still written here but no
 * longer rendered; see the default export.
 *
 * The layouts are the ones supplied as reference (a dark impact strip, a split
 * spotlight, a three-card mosaic and a careers band). The palette is not: every
 * surface here is built from the brand tokens in valunxt-brand.css. The
 * artwork was the abstract/texture set already in uploads until the client
 * supplied its own (20260913, see UAE_HOME below). The recurring device is the same one the rest of the page uses — the
 * wordmark's x as a corner motif, see components/brand/LogoX.tsx.
 *
 * THE COPY IS THE CLIENT'S home-page document (20260911), word for word, with
 * two rules attached: nothing added to it or dropped from it, and no em dashes
 * anywhere on the UAE pages. The figures on the last band (48+ years, 200+
 * years combined, 10+ industries) are the client's own claims. Where the
 * document gives a band no button text or no eyebrow, the band keeps the label
 * it had or renders without one; nothing is invented to fill a slot.
 *
 * India renders none of this — HomeInBody does not import it.
 *
 * Styles: assets/css/valunxt-landing.css (.vxn-impact, .vxn-spotlight,
 * .vxn-mosaic, .vxn-careers).
 */
import { rurl } from '@/lib/region';
import { rimg, rimgFirst } from '@/lib/region-assets';
import { LogoXGlyph } from '@/components/brand/LogoX';
import { brandCase } from '@/components/ui/BrandName';

/** The client's artwork for these bands (20260913). Each leads its slot's
 *  candidate list, so the stand-in it replaced still shows if a file goes. */
const UAE_HOME = {
  impact: 'uae/home/advisory-scrutiny.webp',
  mosaicLead: 'uae/home/about-valunxt.webp',
  careersTexture: 'uae/home/expertise-abstract.webp',
  /* Cut to the inset's 4:3 from the client's square original. */
  careersInset: 'uae/home/expertise-inset.webp',
} as const;

/** The pill CTA used across all four bands. */
function Pill({
  href,
  label,
  variant = 'accent',
}: {
  href: string;
  label: string;
  variant?: 'accent' | 'solid' | 'ghost';
}) {
  return (
    <a className={`vxn-band__pill vxn-band__pill--${variant}`} href={href}>
      {label}
      <i aria-hidden="true" className="vamtamtheme- vamtam-theme-arrow-right vxn-cta__arrow" />
    </a>
  );
}

/* -------------------------------------------------------------------------- */

/**
 * 1. The impact strip. A single dark card, headline left and the case for it
 *    right, with the texture washed back far enough to stay a background.
 */
export function ImpactBand({ region }: { region: string }) {
  return (
    <section className="vxn-impact" aria-labelledby="vxn-impact-title">
      <div className="vxn-impact__card">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="vxn-impact__texture"
          src={rimgFirst(region, [UAE_HOME.impact, 'homepage/abstract-3.webp'])}
          alt=""
          aria-hidden="true"
          loading="lazy"
        />
        <h2 id="vxn-impact-title" className="vxn-impact__title">
          Advisory That Stands Up to Scrutiny.
        </h2>
        <div className="vxn-impact__side">
          {/* The document joins the two halves of this sentence with an em
              dash; a comma carries the join here, under the no-dash rule. */}
          <p className="vxn-impact__copy">
            We work alongside founders, businesses, investors and developers across the UAE,
            delivering compliant financial reporting, defensible valuations and advice backed by
            evidence, not assumptions.
          </p>
          <Pill href={rurl(region, '/services/')} label="Explore Our Expertise" />
        </div>
      </div>
    </section>
  );
}

/**
 * 2. The spotlight. One practice given the full width: copy on the left,
 *    artwork on the right, on a tinted band that separates it from the cream
 *    sections either side.
 */
export function SpotlightBand({ region }: { region: string }) {
  return (
    <section className="vxn-spotlight" aria-labelledby="vxn-spotlight-title">
      <div className="vxn-spotlight__inner">
        <div className="vxn-spotlight__copy">
          <span className="vxn-band__eyebrow">Technology, Data &amp; AI</span>
          <h2 id="vxn-spotlight-title" className="vxn-spotlight__title">
            Intelligence Behind Every Decision.
          </h2>
          <p className="vxn-spotlight__lede">
            Enterprise systems, automation, dashboards and AI solutions that turn financial and
            operational data into measurable business performance.
          </p>
          <Pill
            href={rurl(region, '/services/technology-data-ai/')}
            label="Explore Our Solutions"
            variant="solid"
          />
        </div>
        <figure className="vxn-spotlight__media">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={rimg(region, 'homepage/abstract-2.webp')}
            alt="Abstract rendering of layered data surfaces"
            loading="lazy"
          />
          <span className="vxn-spotlight__x" aria-hidden="true">
            <LogoXGlyph />
          </span>
        </figure>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */

interface MosaicCard {
  eyebrow: string;
  title: string;
  cta: string;
  href: string;
  /** Candidates in preference order; the first that exists wins. */
  images?: string[];
  alt?: string;
}

/** The tall card on the left, then the two stacked beside it.
 *
 *  The eyebrows and titles are the client's. The document gives the tiles no
 *  button text, so the first two keep the labels they had, and the third,
 *  which was the group's card, now goes where its new title points: the
 *  services index, with a label to match. */
const MOSAIC_LEAD: MosaicCard = {
  eyebrow: 'About Valunxt',
  title: 'Expertise That Moves Business Forward.',
  cta: 'See How We Work',
  href: '/about/',
  images: [UAE_HOME.mosaicLead, 'banners/clients.webp', 'homepage/client-2.webp'],
  alt: 'Valunxt adviser in conversation with a client',
};

const MOSAIC_STACK: MosaicCard[] = [
  {
    eyebrow: 'Research &amp; Intelligence',
    title: 'Intelligence That Turns Decisions Into Impact.',
    cta: 'Read the Research',
    href: '/research/',
  },
  {
    eyebrow: 'Integrated Advisory',
    title: 'Business. Property. Finance. All Connected.',
    cta: 'Explore Our Services',
    href: '/services/',
    images: ['banners/our-group.webp', 'banners/network.webp'],
    alt: 'Valuation team reviewing a property file',
  },
];

/**
 * 3. The mosaic. A tall photographic card beside two shorter ones — the middle
 *    card takes the brand gradient so the group does not read as three
 *    photographs in a row.
 */
export function MosaicBand({ region }: { region: string }) {
  return (
    <section className="vxn-mosaic" aria-label="More from Valunxt">
      <div className="vxn-mosaic__grid">
        <a className="vxn-mosaic__card vxn-mosaic__card--lead" href={rurl(region, MOSAIC_LEAD.href)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="vxn-mosaic__media"
            src={rimgFirst(region, MOSAIC_LEAD.images ?? [])}
            alt={MOSAIC_LEAD.alt ?? ''}
            loading="lazy"
          />
          <div className="vxn-mosaic__body">
            <span className="vxn-band__eyebrow">{brandCase(MOSAIC_LEAD.eyebrow)}</span>
            <h3 className="vxn-mosaic__title">{MOSAIC_LEAD.title}</h3>
            <span className="vxn-band__pill vxn-band__pill--accent">
              {MOSAIC_LEAD.cta}
              <i aria-hidden="true" className="vamtamtheme- vamtam-theme-arrow-right vxn-cta__arrow" />
            </span>
          </div>
        </a>

        <div className="vxn-mosaic__stack">
          {MOSAIC_STACK.map((card, i) => (
            <a
              className={`vxn-mosaic__card vxn-mosaic__card--${i === 0 ? 'grad' : 'photo'}`}
              href={rurl(region, card.href)}
              key={card.href}
            >
              {card.images ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className="vxn-mosaic__media"
                    src={rimgFirst(region, card.images)}
                    alt={card.alt ?? ''}
                    loading="lazy"
                  />
                </>
              ) : (
                <span className="vxn-mosaic__x" aria-hidden="true">
                  <LogoXGlyph />
                </span>
              )}
              <div className="vxn-mosaic__body">
                <span
                  className="vxn-band__eyebrow"
                  dangerouslySetInnerHTML={{ __html: card.eyebrow }}
                />
                <h3 className="vxn-mosaic__title">{card.title}</h3>
                <span className="vxn-band__pill vxn-band__pill--accent">
                  {card.cta}
                  <i aria-hidden="true" className="vamtamtheme- vamtam-theme-arrow-right vxn-cta__arrow" />
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * 4. The split band. Copy on a cream half, artwork on the other with the
 *    team photograph inset over it — the framed-photo-on-texture treatment from
 *    the reference, in the brand's blues.
 *
 *    It carried the careers copy, which is why the class names and the id say
 *    so; it now carries the client's experience figures and leads to /about/.
 *    The band is the same band, so the names stay.
 */
export function CareersBand({ region }: { region: string }) {
  return (
    <section className="vxn-careers" aria-labelledby="vxn-careers-title">
      <div className="vxn-careers__copy">
        {/* No eyebrow: the document gives this band none. One pill, because
            the document names one call. */}
        <h2 id="vxn-careers-title" className="vxn-careers__title">
          Expertise Measured in Decades.
        </h2>
        <p className="vxn-careers__lede">
          48+ years of expertise. 200+ years of combined experience. 10+ industries served. A
          depth of knowledge brought to every business, property and investment mandate.
        </p>
        <div className="vxn-careers__actions">
          <Pill href={rurl(region, '/about/')} label="About Valunxt" variant="solid" />
        </div>
      </div>
      <div className="vxn-careers__media">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="vxn-careers__texture"
          src={rimgFirst(region, [UAE_HOME.careersTexture, 'banners/texture-2.webp'])}
          alt=""
          aria-hidden="true"
          loading="lazy"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="vxn-careers__inset"
          src={rimgFirst(region, [UAE_HOME.careersInset, 'banners/careers.webp', 'banners/community.webp'])}
          alt="Valunxt team around a boardroom table"
          loading="lazy"
        />
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */

/**
 * The bands the page runs, in order. TWO since 20260915. The spotlight
 * ("Intelligence Behind Every Decision.") came off the home page on client
 * instruction on 20260911, and the careers band followed on 20260915: its copy
 * now renders in UaeExpertiseBand.tsx, rebuilt to the client's reference, which
 * HomeAeBody places straight after these two. Both stay exported above, and
 * their styles stay in the stylesheet, so putting either back is one line.
 */
export default function UaeImpactBands({ region }: { region: string }) {
  return (
    <>
      <ImpactBand region={region} />
      <MosaicBand region={region} />
    </>
  );
}
