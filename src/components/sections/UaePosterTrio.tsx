/**
 * The bento on /en-ae/ (20260912; rebuilt the same day from the poster trio).
 *
 * Built to the reference supplied that afternoon: a two-row grid of four
 * cards on a three-column track, the top row a wide photograph beside a
 * narrow colour card, the bottom row a narrow dark card beside a wide pale
 * one. The reference's cards are a customer story with a serif quote over
 * the photograph, a "facts and numbers" card with one large figure, a dark
 * story card with a photograph along its foot, and a review card carrying a
 * serif line and two buttons. Each is kept as a shape and given this brand's
 * content and colours: the blue is the CTA ramp, the pale card is the site's
 * cream, the type is the market's one face, Sanomat Sans.
 *
 * THE FILE KEEPS ITS NAME AND ITS PREFIX. UaeBandMotion.tsx reveals
 * .vxn-post__card by selector and section 15 of the stylesheet lists
 * .vxn-post in the page rhythm; renaming either would mean touching both for
 * no gain. The glass plates and the sheen of the trio are gone with it: the
 * reference has neither.
 *
 * THE COPY IS NOT THE CLIENT'S, as the trio's was not: the three statements
 * are the trio's own, drafted in the home document's register, and the
 * figure is the client's 48+ years from the careers band's lede. The card
 * labels are drafted here. Every link leads to a page this site already
 * publishes. No em dashes, as on every UAE page.
 *
 * WHERE IT SITS. After the careers band and before the insights carousel.
 * India renders none of it.
 *
 * Motion: components/sections/UaeBandMotion.tsx. Styles:
 * assets/css/valunxt-landing.css (section 20, .vxn-post).
 */
import { rurl } from '@/lib/region';
import { rimgFirst } from '@/lib/region-assets';

function Arrow() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false">
      <path d="M2.5 8h11M9 3.5 13.5 8 9 12.5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function UaePosterTrio({ region }: { region: string }) {
  return (
    <section className="vxn-post" aria-label="What Valunxt stands for">
      <div className="vxn-post__grid">
        {/* 1. The story: a photograph, the statement over its foot. The file
            is cut to the card's proportions (20260913) with both faces in the
            top band, so the plain centre crop holds them at every width. */}
        <a className="vxn-post__card vxn-post__card--story" href={rurl(region, '/free-consultation/')}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="vxn-post__media"
            src={rimgFirst(region, ['uae/home/who-we-work-with.webp', 'new-folder/about-us-1.webp', 'banners/careers.webp'])}
            alt="Two colleagues reviewing a report together"
            loading="lazy"
          />
          <span className="vxn-post__scrim" aria-hidden="true" />
          <span className="vxn-post__eyebrow">Who we work with</span>
          <div className="vxn-post__body">
            <h3 className="vxn-post__quote">We work beside the people making the decision.</h3>
            <p className="vxn-post__by">Founders, businesses, investors and developers across the UAE</p>
          </div>
          <span className="vxn-post__disc" aria-hidden="true">
            <Arrow />
          </span>
        </a>

        {/* 2. The figure: the client's own, from the careers band. */}
        <div className="vxn-post__card vxn-post__card--fact">
          <span className="vxn-post__eyebrow">Facts and numbers</span>
          <div className="vxn-post__body">
            <span className="vxn-post__big">48+</span>
            <p className="vxn-post__fact">years of expertise behind every valuation, report and recommendation.</p>
          </div>
        </div>

        {/* 3. The dark card: the statement above, a photograph along the foot.
            The Abu Dhabi skyline, cut as a 4:1 panorama at 1600px (20260913)
            so the strip needs no crop adjustment of its own. */}
        <a className="vxn-post__card vxn-post__card--dark" href={rurl(region, '/about/')}>
          <span className="vxn-post__eyebrow">About Valunxt</span>
          <h3 className="vxn-post__title">Advice that protects what you are building.</h3>
          <span className="vxn-post__band" aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="vxn-post__media"
              src={rimgFirst(region, ['uae/home/about-valunxt-band.webp', 'new-folder/who-we-are-1.webp', 'new-folder/career-1.webp', 'new-folder/about-us-1.webp'])}
              alt=""
              loading="lazy"
            />
          </span>
        </a>

        {/* 4. The pale card: the line and the two calls. */}
        <div className="vxn-post__card vxn-post__card--review">
          <span className="vxn-post__eyebrow">Our services</span>
          <div className="vxn-post__body">
            <h3 className="vxn-post__say">Complete financial advisory, in one place.</h3>
            <div className="vxn-post__ctas">
              <a className="vxn-post__btn vxn-post__btn--solid" href={rurl(region, '/services/')}>
                Explore Our Services
              </a>
              <a className="vxn-post__btn vxn-post__btn--line" href={rurl(region, '/free-consultation/')}>
                Book a Free Consultation
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
