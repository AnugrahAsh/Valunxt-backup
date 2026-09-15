/**
 * The "Explore Services" strip drawn as the card deck of the reference the
 * client supplied on 20260915 (a banking landing page: "Discover the freedom
 * of banking on your terms", a Personal card, Business and Freelance cards on
 * silk). ServiceTemplateBody renders this instead of its own strip when a
 * page's content sets strip.look = 'deck'; only Real Estate does.
 *
 * WHAT IS THE REFERENCE'S, measured off the 800 x 600 original (its content
 * measure is 629px, 85 to 713, and every length below is that image's pixels
 * times --k, which is 100cqw / 629 of this band's own measure):
 *
 *   head row   eyebrow; a two-line heading with a hand-drawn loop under a
 *              word; on the right, from 62.8% of the measure, a two-line
 *              paragraph over a pill with a white disc, the row's foot on the
 *              heading's foot
 *   the deck   231 tall; the open card 417 wide, the closed ones 101 and 100,
 *              6 apart; corners 18
 *   open card  the name at 19 in and 20 down (cap 13, so 18.3px type), the
 *              sentence under it (9px on 10.8), a white panel of five icon
 *              tiles in a 3 x 2 grid bottom-left (151 x 105, 17 in, tiles 39,
 *              gaps 7 and 8, corners 12), and a round button in a notch cut
 *              out of the bottom-right corner (34 across, its right and bottom
 *              on the card's, a 7px moat with rounded joins)
 *   closed     a silk in place of the photograph and the name on end, read
 *              from the foot up, white, centred, 14px type
 *
 * WHAT IS VALUNXT'S: the palette (the brand ramp on the pill, the first tile
 * and the button; the brand's blue silks for the reference's orange and green;
 * the page's navy ink), Sanomat at the market's weights, and the copy, which
 * is the page's own. The icon tiles carry no words.
 *
 * DEPARTURES, all small: the heading stops at 60px (the reference's proportion
 * is 75px at a 1520 measure; the page's own hero title is 62) and the pill is
 * the house's 46px composite pill (the subscribe band's construction) rather
 * than the reference's 75px one. The fourth tile is a people glyph where the
 * reference has four portraits.
 *
 * HOW IT OPENS is the template's accordion, unchanged: the same .at-acc
 * classes, so the first card is open at rest, the pointer or focus opens any
 * other, and below 900px the cards stand as a grid, all open. This file only
 * adds the layers the reference has and the template does not.
 *
 * THE STYLESHEET IS A TEMPLATE LITERAL: no backticks and no dollar-brace
 * sequences anywhere inside DECK_CSS, comments included.
 */
import type { ReactNode } from 'react';

import CtaArrow from '@/components/ui/CtaArrow';
import { rurl } from '@/lib/region';
import { rimgFirst } from '@/lib/region-assets';

import type { ServiceTemplateContent } from './types';

/* ---- Icons for the panel's tiles (24px grid, stroked) ------------------------ */
const ICON: Record<string, ReactNode> = {
  plus: <path d="M12 5v14M5 12h14" />,
  calendar: (
    <>
      <rect x="4" y="5.5" width="16" height="14.5" rx="3" />
      <path d="M4 10.5h16M9 3.5v4M15 3.5v4" />
    </>
  ),
  home: <path d="M4 11.2 12 4.5l8 6.7M6.5 9.6V19.5h11V9.6M10.2 19.5v-4.8h3.6v4.8" />,
  users: (
    <>
      <circle cx="9.5" cy="8.5" r="3.2" />
      <path d="M3.8 19.5a5.7 5.7 0 0 1 11.4 0" />
      <path d="M15.6 5.6a3 3 0 0 1 0 5.8M17.4 14.2a5.2 5.2 0 0 1 3 5.3" />
    </>
  ),
  compare: <path d="M6 8h12l-3.2-3.2M18 16H6l3.2 3.2" />,
  tag: (
    <>
      <path d="M4 12.6V4.5h8.1l7.6 7.6-8.1 8.1Z" />
      <circle cx="8.4" cy="8.9" r="1.4" />
    </>
  ),
  key: (
    <>
      <circle cx="8.5" cy="15.5" r="4" />
      <path d="M11.4 12.6 20 4M16.6 7.4l2.4 2.4M14.3 9.7l1.9 1.9" />
    </>
  ),
  building: <path d="M3 20.5h18M5.5 20.5V9.5h6v11M11.5 20.5V4h7v16.5M8 12.5h1.2M8 16h1.2M14.5 7.5h2M14.5 11h2M14.5 14.5h2" />,
  chart: <path d="M4 20.5h16M6.5 20.5v-6M11 20.5V9.5M15.5 20.5v-8.5M20 20.5V5.5" />,
};

/** The five tiles per card, by sub-service: the first is the filled one. */
const TILES: Record<string, string[]> = {
  'buy-property': ['plus', 'calendar', 'home', 'users', 'compare'],
  'sell-rent-lease-property': ['plus', 'calendar', 'tag', 'users', 'key'],
  'off-plan-properties': ['plus', 'calendar', 'building', 'users', 'chart'],
};

function Tile({ name, index }: { name: string; index: number }) {
  return (
    <span className={`at-deck__tile at-deck__tile--${index % 2 === 0 ? 'round' : 'square'}${index === 0 ? ' at-deck__tile--lead' : ''}`}>
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        {ICON[name] ?? ICON.plus}
      </svg>
    </span>
  );
}

/**
 * The heading with the reference's hand-drawn loop under its last word: a
 * stroke that rises under the word, doubles back on itself in a small hook and
 * runs on past the end, where the template's own swash is a plain arc. Drawn
 * in with the same dash offset (pathLength 1) when the head row arrives.
 */
function LoopSwash({ text }: { text: string }) {
  const t = text.trimEnd();
  const i = t.lastIndexOf(' ');
  if (i < 0) return <>{t}</>;
  return (
    <>
      {t.slice(0, i + 1)}
      <span className="at-swash at-deck__swash">
        {t.slice(i + 1)}
        <svg className="at-swash__ink" viewBox="0 0 240 34" preserveAspectRatio="none" aria-hidden="true" focusable="false">
          <path
            d="M4 22C40 31 96 30 142 15c9-3 9 6-4 11 36-6 68-11 98-12"
            fill="none"
            stroke="currentColor"
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength="1"
          />
        </svg>
      </span>
    </>
  );
}

export const DECK_CSS = `
/* ==========================================================================
   THE DECK — ExploreDeck.tsx. Scoped to .at-deck, so no other page's strip
   can match any of it.
   ========================================================================== */
.at-deck__in{container-type:inline-size;}
.at-deck{--k:calc(100cqw / 629);}

/* ---- The head row ---------------------------------------------------------
   The right column starts at 62.8% of the measure; the row's foot is the
   heading's foot, so the pill sits level with the heading's second line. */
.at-deck .at-services__head{
  grid-template-columns:minmax(0,62.8fr) minmax(0,37.2fr);gap:0;align-items:end;
  margin:0 0 calc(28 * var(--k));
}
.at-deck .at-kicker{font-size:13px!important;font-weight:500!important;letter-spacing:.16em!important;margin:0 0 calc(8 * var(--k))!important;}
/* Two lines, as the reference sets its heading: 10em takes "Your Property
   Goals." (8.6em) and not the "Our" after it (10.7em). */
.at-root .at-deck .at-services__h2{
  font-size:clamp(34px,calc(31 * var(--k)),60px)!important;line-height:1.13!important;
  letter-spacing:-.012em!important;max-width:10em;
}
.at-deck .at-services__aside{justify-self:stretch;max-width:none;padding:0 0 calc(2 * var(--k));gap:calc(12 * var(--k));}
.at-deck .at-services__lede{font-size:clamp(15px,calc(8.4 * var(--k)),19px)!important;line-height:1.5!important;max-width:34em;}

/* The loop is wider than the word and hangs a little lower than the arc. */
.at-deck__swash .at-swash__ink{left:-4%;bottom:-.3em;width:116%;height:.52em;}

/* The pill with the white disc: the house's composite pill (46px, the label
   on the brand ramp, a 32px disc seated 7px in), which is the reference's
   construction at the site's size. */
.at-deck__cta{
  display:inline-flex;align-items:center;gap:14px;
  min-height:var(--vxn-cta-h,46px);padding:7px 7px 7px 26px;border-radius:999px;
  background-image:var(--vxn-cta-grad);background-color:var(--vxn-cta-ink,#0B2DBE);
  color:#fff!important;text-decoration:none!important;white-space:nowrap;
  font-size:var(--vxn-cta-fs,14px);font-weight:var(--vxn-cta-fw,400);letter-spacing:var(--vxn-cta-ls,.01em);line-height:1;
  box-shadow:0 14px 30px -18px rgba(8,36,143,.7);
  transition:box-shadow .3s ease,background-color .3s ease;
}
.at-deck__cta:hover,.at-deck__cta:focus-visible{box-shadow:0 18px 36px -16px rgba(8,36,143,.8);color:#fff!important;}
.at-deck__ctaGo{
  display:grid;place-items:center;flex:none;width:32px;height:32px;border-radius:50%;
  background:#fff;color:var(--vxn-cta-ink,#0B2DBE);transition:background-color .3s ease;
}
.at-deck__cta:hover .at-deck__ctaGo{background:#EAF0FF;}

/* ---- The deck --------------------------------------------------------------- */
.at-deck .at-acc{--open:4.15;height:calc(231 * var(--k));}
.at-deck .at-acc__panel{padding-right:calc(6 * var(--k));}
.at-deck .at-acc__panel:last-child{padding-right:0;}
.at-deck .at-acc__inner{border-radius:calc(18 * var(--k));background:#0B2DBE;}
.at-deck .at-acc__inner::after{display:none;}

/* The silk: the closed card's ground, over the photograph. */
.at-deck__silk{
  position:absolute;inset:0;z-index:0;width:100%;height:100%;object-fit:cover;
  opacity:1;transition:opacity .7s ease .2s;
}

/* The name on end, centred both ways. */
.at-deck .at-acc__title{
  top:50%;bottom:auto;translate:-50% -50%;z-index:2;
  font-size:clamp(17px,calc(14 * var(--k)),34px);font-weight:500;letter-spacing:.005em;
  max-height:calc(100% - 48px);
}

/* Everything the open card adds, in one layer that fades as a piece. */
.at-deck__open{
  position:absolute;inset:0;z-index:1;pointer-events:none;
  opacity:0;transition:opacity .3s ease;
}
.at-deck__scrim{
  position:absolute;inset:0;
  background:
    linear-gradient(100deg,rgba(4,16,52,.66) 0%,rgba(4,16,52,.42) 30%,rgba(4,16,52,.1) 58%,rgba(4,16,52,0) 76%),
    linear-gradient(0deg,rgba(4,16,52,.34) 0%,rgba(4,16,52,0) 40%);
}
.at-deck__body{
  position:absolute;left:calc(19 * var(--k));top:calc(14.8 * var(--k));
  width:min(calc(180 * var(--k)),calc(100% - 40px));
}
.at-deck .at-deck__name{
  display:block;margin:0!important;color:#fff!important;
  font-size:clamp(22px,calc(18.3 * var(--k)),44px)!important;line-height:1.1!important;letter-spacing:-.01em!important;
}
.at-deck__text{
  display:block;margin-top:calc(9.4 * var(--k));color:rgba(255,255,255,.92);
  font-size:clamp(14px,calc(9 * var(--k)),22px);line-height:1.32;
}

/* The icon panel. */
.at-deck__panelTiles{
  position:absolute;left:calc(16.7 * var(--k));bottom:calc(16 * var(--k));
  display:grid;grid-template-columns:repeat(3,calc(39 * var(--k)));grid-auto-rows:calc(39 * var(--k));
  gap:calc(8 * var(--k)) calc(7.3 * var(--k));padding:calc(10 * var(--k));
  border-radius:calc(12 * var(--k));background:rgba(255,255,255,.95);
  box-shadow:0 20px 40px -24px rgba(4,16,52,.55);
}
/* The reference's tiles are a light grey on a white panel; #E4ECFB is the
   brand's tint at the same step, so the tiles read as tiles. */
.at-deck__tile{display:grid;place-items:center;background:#E4ECFB;color:#0B2DBE;}
.at-deck__tile--round{border-radius:50%;}
.at-deck__tile--square{border-radius:calc(10 * var(--k));}
.at-deck__tile--lead{background-image:var(--vxn-cta-grad);background-color:#0B2DBE;color:#fff;}
.at-deck__tile svg{
  width:44%;height:44%;fill:none;stroke:currentColor;stroke-width:1.7;
  stroke-linecap:round;stroke-linejoin:round;
}
.at-deck__tile--lead svg{stroke-width:2;}

/* The notch: the corner painted in the section's own ground, a rounded moat
   round the button, and two small concave joins where it meets the card's
   right edge and its foot. */
.at-deck__notch{
  position:absolute;right:0;bottom:0;width:calc(41 * var(--k));height:calc(41 * var(--k));
  background:var(--tint);border-top-left-radius:calc(24 * var(--k));
}
.at-deck__notch::before,
.at-deck__notch::after{
  content:"";position:absolute;width:calc(11 * var(--k));height:calc(11 * var(--k));
  background:radial-gradient(circle at 0 0,rgba(244,248,253,0) calc(11 * var(--k) - .5px),var(--tint) calc(11 * var(--k)));
}
.at-deck__notch::before{right:0;bottom:100%;}
.at-deck__notch::after{right:100%;bottom:0;}
.at-deck__go{
  position:absolute;right:0;bottom:0;display:grid;place-items:center;
  width:calc(34 * var(--k));height:calc(34 * var(--k));border-radius:50%;
  background-image:var(--vxn-cta-grad);background-color:#0B2DBE;color:#fff;
  font-size:15px;transition:background-color .3s ease,box-shadow .3s ease;
}
.at-deck__go .vxn-cta__arrow{font-size:clamp(14px,calc(8 * var(--k)),20px)!important;}
.at-deck .at-acc__panel:hover .at-deck__go{box-shadow:0 12px 26px -12px rgba(8,36,143,.8);}

/* ---- Open, at rest ------------------------------------------------------------ */
.at-deck .at-acc__panel:first-child .at-deck__silk{opacity:0;transition:opacity .45s ease;}
.at-deck .at-acc__panel:first-child .at-deck__open{opacity:1;transition:opacity .75s ease .42s;}
/* ---- Closed, the moment the deck is engaged -------------------------------------- */
.at-deck .at-acc:hover .at-acc__panel .at-deck__silk,
.at-deck .at-acc:focus-within .at-acc__panel .at-deck__silk{opacity:1;transition:opacity .7s ease .2s;}
.at-deck .at-acc:hover .at-acc__panel .at-deck__open,
.at-deck .at-acc:focus-within .at-acc__panel .at-deck__open{opacity:0;transition:opacity .3s ease;}
/* ---- Open, the engaged one -------------------------------------------------------- */
.at-deck .at-acc:hover .at-acc__panel:hover .at-deck__silk,
.at-deck .at-acc:focus-within .at-acc__panel:focus-visible .at-deck__silk{opacity:0;transition:opacity .45s ease;}
.at-deck .at-acc:hover .at-acc__panel:hover .at-deck__open,
.at-deck .at-acc:focus-within .at-acc__panel:focus-visible .at-deck__open{opacity:1;transition:opacity .75s ease .42s;}

/* ---- Narrower ---------------------------------------------------------------------- */
@media(max-width:1180px){
  .at-deck .at-acc{--open:4.15;height:max(360px,calc(231 * var(--k)));}
}
@media(max-width:900px){
  .at-deck .at-services__head{grid-template-columns:minmax(0,1fr);gap:18px;align-items:start;}
  .at-deck .at-acc{height:auto;gap:16px;}
  .at-deck .at-acc__inner{height:380px;border-radius:28px;}
  .at-deck__silk,
  .at-deck .at-acc__panel:first-child .at-deck__silk,
  .at-deck .at-acc:hover .at-acc__panel .at-deck__silk,
  .at-deck .at-acc:hover .at-acc__panel:hover .at-deck__silk,
  .at-deck .at-acc:focus-within .at-acc__panel .at-deck__silk,
  .at-deck .at-acc:focus-within .at-acc__panel:focus-visible .at-deck__silk{opacity:0;}
  .at-deck__open,
  .at-deck .at-acc__panel:first-child .at-deck__open,
  .at-deck .at-acc:hover .at-acc__panel .at-deck__open,
  .at-deck .at-acc:hover .at-acc__panel:hover .at-deck__open,
  .at-deck .at-acc:focus-within .at-acc__panel .at-deck__open,
  .at-deck .at-acc:focus-within .at-acc__panel:focus-visible .at-deck__open{opacity:1;}
  .at-deck__body{left:24px;top:22px;width:calc(100% - 48px);}
  .at-deck__panelTiles{display:none;}
  .at-deck__notch{width:66px;height:66px;border-top-left-radius:38px;}
  .at-deck__notch::before,.at-deck__notch::after{width:18px;height:18px;background:radial-gradient(circle at 0 0,rgba(244,248,253,0) 17.5px,var(--tint) 18px);}
  .at-deck__go{width:54px;height:54px;}
}
@media(prefers-reduced-motion:reduce){
  .at-deck__silk,.at-deck__open,.at-deck__go{transition:none!important;}
}
`;

export default function ExploreDeck({
  region,
  content,
}: {
  region: string;
  content: ServiceTemplateContent;
}) {
  const { strip, intro } = content;
  const sub = (slug: string) => rurl(region, `/services/${content.slug}/${slug}/`);

  return (
    <section className="at-services at-deck" id="at-services" aria-labelledby="at-services-head">
      <style dangerouslySetInnerHTML={{ __html: DECK_CSS }} />
      <div className="at-in">
        <div className="at-deck__in">
          <div className="at-services__head">
            <div className="at-sec__head">
              <span className="at-kicker">{strip.kicker}</span>
              <h2 className="at-h2 at-services__h2" id="at-services-head">
                <LoopSwash text={strip.head} />
              </h2>
            </div>
            <div className="at-services__aside">
              <p className="at-lede at-services__lede">{strip.lede}</p>
              <a className="at-deck__cta" href={rurl(region, intro.primary.href)}>
                <span>{strip.cta}</span>
                <span className="at-deck__ctaGo" aria-hidden="true">
                  <CtaArrow />
                </span>
              </a>
            </div>
          </div>

          <div className="at-acc">
            {strip.subs.map((sv, i) => (
              <a className="at-acc__panel" href={sub(sv.slug)} key={sv.slug}>
                <span className="at-acc__inner">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className="at-acc__img" src={rimgFirst(region, sv.figure)} alt="" loading="lazy" />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className="at-deck__silk"
                    src={rimgFirst(region, strip.silks?.[i] ?? strip.silks?.[0] ?? ['banners/uae-slider-2.webp'])}
                    alt=""
                    loading="lazy"
                    aria-hidden="true"
                  />
                  {/* The closed card's name. It repeats the heading in the open
                      layer, so it is hidden from assistive technology. */}
                  <span className="at-acc__title" aria-hidden="true">
                    {sv.name}
                  </span>
                  <span className="at-deck__open">
                    <span className="at-deck__scrim" aria-hidden="true" />
                    <span className="at-deck__body">
                      <h3 className="at-deck__name">{sv.name}</h3>
                      <span className="at-deck__text">{sv.cardText}</span>
                    </span>
                    <span className="at-deck__panelTiles" aria-hidden="true">
                      {(TILES[sv.slug] ?? TILES['buy-property']).map((name, k) => (
                        <Tile name={name} index={k} key={name} />
                      ))}
                    </span>
                    <span className="at-deck__notch" aria-hidden="true" />
                    <span className="at-deck__go" aria-hidden="true">
                      <CtaArrow />
                    </span>
                  </span>
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
