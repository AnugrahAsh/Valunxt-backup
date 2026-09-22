/**
 * The bento on /en-ae/ (20260912; rebuilt light 20260914; revised the same
 * day on client instruction: no arrows, no photographs, texture instead, and
 * a description on the services card).
 *
 * Four light cards on a twelve-column track, two rows:
 *
 *   ┌────────────────────────────────┬──────────────┐
 *   │ WHO WE WORK WITH      texture  │ FACTS        │
 *   │ statement, byline              │ 48+ figure   │
 *   ├──────────────┬─────────────────┴──────────────┤
 *   │ ABOUT        │ OUR SERVICES                   │
 *   │ statement    │ line, description, two pills   │
 *   │ texture strip│                                │
 *   └──────────────┴────────────────────────────────┘
 *
 * The textures are the brand's own blue abstracts (client instruction
 * 20260914: blue only): banners/uae-slider-4 beside the story and
 * banners/uae-slider-2 along the foot of the About card. They are decoration
 * with nothing written over them.
 *
 * THE FILE KEEPS ITS NAME AND ITS PREFIX. UaeBandMotion.tsx reveals
 * .vxn-post__card by selector and section 15 of the stylesheet lists
 * .vxn-post in the page rhythm; renaming either would mean touching both for
 * no gain.
 *
 * THE COPY IS NOT THE CLIENT'S, as before: the three statements and the new
 * services description are drafted in the home document's register, and the
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
import { brandCase } from '@/components/ui/BrandName';
import CtaArrow from '@/components/ui/CtaArrow';
import { rimgFirst } from '@/lib/region-assets';
import LiveImage from '@/components/three/live/LiveImage';

export default function UaePosterTrio({ region }: { region: string }) {
  return (
    <section className="vxn-post" aria-label="What Valunxt stands for">
      <div className="vxn-post__grid">
        {/* 1. The story: words on the left, texture on the right. */}
        <a className="vxn-post__card vxn-post__card--story" href={rurl(region, '/free-consultation/')}>
          <span className="vxn-post__text">
            <span className="vxn-post__eyebrow">Who we work with</span>
            <h3 className="vxn-post__quote">We work beside the people making the decision.</h3>
            <span className="vxn-post__by">Founders, businesses, investors and developers across the UAE</span>
          </span>
          <span className="vxn-post__figure" aria-hidden="true">
            {/* Live since 20260922 (components/three/live). The hero already
                moves this file's own scene, so the card gets the paper strata;
                the file stays under it for anyone without WebGL. */}
            <LiveImage
              className="vxn-post__media"
              src={rimgFirst(region, ['banners/uae-slider-4.webp', 'homepage/abstract-1.webp'])}
              alt=""
              loading="lazy"
              live="home-story"
            />
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

        {/* 3. About: the statement, then a strip of texture along the foot. */}
        <a className="vxn-post__card vxn-post__card--dark" href={rurl(region, '/about/')}>
          <span className="vxn-post__text">
            <span className="vxn-post__eyebrow">{brandCase('About Valunxt')}</span>
            <h3 className="vxn-post__title">Advice that protects what you are building.</h3>
          </span>
          <span className="vxn-post__band" aria-hidden="true">
            {/* Live: the ribbons, for the same reason as the story card. */}
            <LiveImage
              className="vxn-post__media"
              src={rimgFirst(region, ['banners/uae-slider-2.webp', 'homepage/abstract-3.webp'])}
              alt=""
              loading="lazy"
              live="home-about"
            />
          </span>
        </a>

        {/* 4. The services card: the line, its description and the two
            house pills. The description is drafted (20260914), see above. */}
        <div className="vxn-post__card vxn-post__card--review">
          <span className="vxn-post__eyebrow">Our services</span>
          <div className="vxn-post__body">
            <h3 className="vxn-post__say">Complete financial advisory, in one place.</h3>
            <p className="vxn-post__desc">
              Accounting and tax, real estate, mortgages, valuation, research and technology,
              delivered by one team so every number you act on holds up to scrutiny.
            </p>
            <div className="vxn-post__ctas">
              <a className="vxn-band__pill vxn-band__pill--solid" href={rurl(region, '/services/')}>
                Explore Our Services
                <CtaArrow />
              </a>
              <a className="vxn-band__pill vxn-band__pill--ghost" href={rurl(region, '/free-consultation/')}>
                Book a Free Consultation
                <CtaArrow />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
