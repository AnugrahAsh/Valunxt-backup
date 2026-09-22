/**
 * The shared body for a written UAE service page.
 *
 * Five sections in a fixed order — opening statement, capability tiles, the
 * firm's commitments, a glass banner, and the highlights — driven entirely by
 * the content object handed in. The first of these pages (accounting and tax)
 * was written as its own component; the moment there were six, that shape had
 * to become a template or the same 450 lines of CSS would exist six times over.
 *
 * What varies per service lives in ./content.ts: the copy, the tiles and how
 * many columns they run in, the banner artwork and its message, and the
 * highlight figures. What does not vary is here — the layout, the type scale
 * and every transition.
 *
 * The commitments are the firm's, not the service's, so they are stated once
 * here rather than repeated in six content objects.
 *
 * Animation is all CSS: hover throughout, plus a load-time rise on the
 * commitments and the glass panel. Deliberately not the site's scroll-reveal —
 * see the note above the @keyframes.
 */
import { rurl } from "@/lib/region";
import { rimgFirst } from "@/lib/region-assets";
import LiveImage from "@/components/three/live/LiveImage";
import { MegaIcon } from "@/components/layout/MegaIcons";
import type { ServicePageContent } from "./content";

interface Commitment {
  title: string;
  icon: string;
  label: string;
  href: string;
}

/** The firm's stated commitments, verbatim from valunxt.com. Same on every page. */
const COMMITMENTS: Commitment[] = [
  {
    title: "Fixed fees agreed before work begins",
    icon: "ledger",
    label: "Free Consultation",
    href: "/free-consultation/",
  },
  {
    title: "A partner who answers when you call",
    icon: "handshake",
    label: "Talk to Us",
    href: "/contact/",
  },
  {
    title: "RICS-regulated valuation through group firm Reliant Surveyors",
    icon: "scales",
    label: "Valuation & Advisory",
    href: "/services/valuation-and-advisory/",
  },
];

const CSS = `
.vxn-svcintro{
  --ny:#0E355F; --ny2:#0B2DBE; --body:#4d5863;
  background:#fff;
  /* UAE services house rule: every section is padded 40px 0. The horizontal
     gutter lives on the inner wrapper, so 0 here cannot let copy touch the
     viewport edge on a narrow screen. */
  padding:40px 0;
}
.vxn-svcintro__inner{max-width:1200px;margin:0 auto;padding:0 24px;}
.vxn-svcintro__eyebrow{
  display:block;
  font-size:13px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;
  color:var(--ny2);
  margin:0 0 22px;
}
/* !important throughout: the Elementor kit styles bare h2/h3/p at a specificity
   these classes cannot reach on their own — the same reason
   ComingSoonBandSection marks its own title. */
.vxn-svcintro__head{
  font-weight:400!important;
  color:var(--ny)!important;
  font-size:clamp(32px,4.2vw,48px)!important;
  line-height:1.14!important;
  margin:0 0 34px!important;
  max-width:20ch;
}
.vxn-svcintro__body p{
  color:var(--body)!important;
  font-size:17px!important;
  line-height:1.75!important;
  margin:0 0 20px!important;
}
.vxn-svcintro__body p:last-child{margin-bottom:0;}
@media(max-width:767px){
  .vxn-svcintro__inner{padding:0 20px;}
  /* Marked too, or the base rules above would outrank these at any width. */
  .vxn-svcintro__head{margin-bottom:26px!important;max-width:none;}
  .vxn-svcintro__body p{font-size:16px!important;}
}

/* ---- Capability tiles ---------------------------------------------------- */

.vxn-cap{
  --ny:#0E355F; --body:#4d5863;
  background:#f2f7fc;
  padding:40px 0;
}
.vxn-cap__inner{max-width:1240px;margin:0 auto;padding:0 24px;}
.vxn-cap__head{
  font-weight:400!important;
  color:var(--ny)!important;
  font-size:clamp(28px,3.6vw,44px)!important;
  line-height:1.16!important;
  text-align:center!important;
  margin:0 auto 16px!important;
  max-width:24ch;
}
.vxn-cap__lede{
  color:var(--body)!important;
  font-size:17px!important;
  line-height:1.7!important;
  text-align:center!important;
  margin:0 auto!important;
  max-width:760px;
}
.vxn-cap__grid{
  display:grid;
  grid-template-columns:repeat(4,1fr);
  gap:24px;
  margin-top:34px;
}
/* Six tiles read as 3+3 rather than 4+2. Set per service in content.ts.
   Three across a 1240px container would make each tile 400px wide; the grid is
   reined in so a six-tile row lands near the same size as an eight-tile one. */
.vxn-cap__grid--3{
  grid-template-columns:repeat(3,1fr);
  max-width:1020px;
  margin-left:auto;
  margin-right:auto;
}
.vxn-cap__tile{
  position:relative;
  /* Landscape, not square: square tiles at this width were taller than the copy
     above them. */
  aspect-ratio:4/3;
  overflow:hidden;
  border-radius:2px;
  background:var(--ny);
  margin:0;
}
.vxn-cap__img{
  position:absolute;inset:0;z-index:0;
  width:100%;height:100%;
  object-fit:cover;
  /* The tiles read as one family rather than a wall of photographs, so each
     image is held back and the label sits on it. */
  filter:grayscale(.35) brightness(.62);
  transition:filter .55s ease;
}
/* The hover: a brand veil rises over the photograph rather than the photograph
   moving. Kept between the image and the caption by z-index — a pseudo-element
   is the tile's last child and would otherwise paint over the label. */
.vxn-cap__tile::after{
  content:"";position:absolute;inset:0;z-index:1;
  background:linear-gradient(180deg, rgba(0,83,183,.15) 0%, rgba(0,83,183,.82) 100%);
  opacity:0;
  transition:opacity .5s ease;
}
.vxn-cap__cap{
  position:absolute;inset:0;z-index:2;
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  gap:11px;
  padding:0 16px;
  text-align:center;
  transform:translateY(0);
  transition:transform .5s cubic-bezier(.22,.61,.36,1);
}
.vxn-cap__rule{
  display:block;
  width:38px;height:1px;
  background:rgba(255,255,255,.8);
  transition:width .5s cubic-bezier(.22,.61,.36,1);
}
.vxn-cap__name{
  color:#fff;
  font-size:13px;font-weight:500;
  letter-spacing:.07em;text-transform:uppercase;
  line-height:1.4;
}
.vxn-cap__tile:hover .vxn-cap__img{filter:grayscale(0) brightness(.5);}
.vxn-cap__tile:hover::after{opacity:1;}
.vxn-cap__tile:hover .vxn-cap__cap{transform:translateY(-4px);}
.vxn-cap__tile:hover .vxn-cap__rule{width:66px;}

@media(max-width:1100px){.vxn-cap__grid,.vxn-cap__grid--3{grid-template-columns:repeat(3,1fr);}}
@media(max-width:820px){.vxn-cap__grid,.vxn-cap__grid--3{grid-template-columns:repeat(2,1fr);gap:18px;}}
@media(max-width:767px){
  .vxn-cap__inner{padding:0 20px;}
  .vxn-cap__lede{font-size:16px!important;}
  .vxn-cap__name{font-size:12px;}
}
@media(max-width:520px){
  .vxn-cap__grid,.vxn-cap__grid--3{grid-template-columns:1fr;gap:16px;}
}

/* ---- Commitments --------------------------------------------------------- */

.vxn-comm{
  --ny:#0E355F; --ny2:#0B2DBE;
  background:#fff;
  padding:40px 0;
}
.vxn-comm__inner{max-width:1240px;margin:0 auto;padding:0 24px;}
.vxn-comm__grid{display:grid;grid-template-columns:repeat(3,1fr);gap:44px;}
.vxn-comm__card{
  display:flex;flex-direction:column;align-items:flex-start;
  text-decoration:none!important;
  color:inherit;
}
.vxn-comm__ico{
  display:inline-flex;color:var(--ny);
  margin-bottom:22px;
  transform:translateY(0);
  transition:transform .45s cubic-bezier(.22,.61,.36,1), color .35s ease;
}
.vxn-comm__ico svg{width:30px;height:30px;}
.vxn-comm__title{
  font-weight:400!important;
  color:var(--ny)!important;
  font-size:22px!important;
  line-height:1.35!important;
  margin:0 0 26px!important;
  transition:color .35s ease;
}
.vxn-comm__link{
  margin-top:auto;
  display:inline-flex;align-items:center;gap:14px;
  font-size:14px;font-weight:600;
  color:var(--ny);
  transition:color .35s ease;
}
.vxn-comm__dash{
  display:block;width:34px;height:1px;
  background:currentColor;
  transition:width .45s cubic-bezier(.22,.61,.36,1);
}
.vxn-comm__card:hover .vxn-comm__ico{transform:translateY(-4px);color:var(--ny2);}
.vxn-comm__card:hover .vxn-comm__title,
.vxn-comm__card:hover .vxn-comm__link{color:var(--ny2)!important;}
.vxn-comm__card:hover .vxn-comm__dash{width:58px;}
@media(max-width:900px){.vxn-comm__grid{grid-template-columns:1fr 1fr;gap:36px;}}
@media(max-width:640px){
  .vxn-comm__inner{padding:0 20px;}
  .vxn-comm__grid{grid-template-columns:1fr;gap:32px;}
  .vxn-comm__title{font-size:20px!important;margin-bottom:18px!important;}
}

/* ---- Glass banner -------------------------------------------------------- */

.vxn-glass{
  --ny:#0E355F;
  position:relative;
  overflow:hidden;
  display:flex;align-items:center;
  min-height:460px;
  padding:40px 0;
  background:var(--ny);
}
.vxn-glass__bg{
  position:absolute;inset:0;
  width:100%;height:100%;
  object-fit:cover;
  transform:scale(1);
  transition:transform 1.4s cubic-bezier(.22,.61,.36,1);
  will-change:transform;
}
/* A light wash on the left only — enough to seat the panel and hold the type,
   without crushing the artwork it is there to show. */
.vxn-glass::after{
  content:"";position:absolute;inset:0;
  background:linear-gradient(90deg, rgba(6,18,32,.42) 0%, rgba(6,18,32,.14) 52%, rgba(6,18,32,0) 100%);
}
.vxn-glass__inner{
  position:relative;z-index:1;
  width:100%;max-width:1240px;margin:0 auto;padding:0 24px;
}
.vxn-glass__panel{
  box-sizing:border-box;
  max-width:560px;
  padding:38px 36px 34px;
  border-radius:20px;
  border:1px solid rgba(255,255,255,.24);
  /* A light frost, not a navy one: the panel sits on a dark ground, and navy on
     navy has no edge. This reads as glass and keeps the type at full contrast. */
  background:rgba(255,255,255,.10);
  -webkit-backdrop-filter:blur(16px) saturate(150%);
  backdrop-filter:blur(16px) saturate(150%);
  box-shadow:0 24px 60px rgba(6,18,32,.28);
  transition:border-color .45s ease, background-color .45s ease, transform .55s cubic-bezier(.22,.61,.36,1);
}
/* Safari before 15 and any engine without backdrop-filter get a solid panel
   rather than a transparent one with unreadable type over the artwork. */
@supports not ((backdrop-filter:blur(1px)) or (-webkit-backdrop-filter:blur(1px))){
  .vxn-glass__panel{background:rgba(14,53,95,.86);}
}
.vxn-glass__eyebrow{
  display:block;
  font-size:12px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;
  color:rgba(255,255,255,.86);
  margin:0 0 18px;
}
.vxn-glass__head{
  font-weight:400!important;
  color:#fff!important;
  font-size:clamp(28px,3.4vw,42px)!important;
  line-height:1.18!important;
  margin:0 0 16px!important;
}
.vxn-glass__text{
  color:rgba(255,255,255,.82)!important;
  font-size:16px!important;
  line-height:1.7!important;
  margin:0 0 26px!important;
}
.vxn-glass__link{
  display:inline-flex;align-items:center;gap:14px;
  font-size:14px;font-weight:600;
  color:#fff!important;
  text-decoration:none!important;
}
.vxn-glass__dash{
  display:block;width:34px;height:1px;background:currentColor;
  transition:width .45s cubic-bezier(.22,.61,.36,1);
}
.vxn-glass__link:hover .vxn-glass__dash{width:62px;}
.vxn-glass:hover .vxn-glass__bg{transform:scale(1.06);}
.vxn-glass:hover .vxn-glass__panel{
  border-color:rgba(255,255,255,.40);
  background:rgba(255,255,255,.14);
  transform:translateY(-3px);
}
@media(max-width:640px){
  .vxn-glass{min-height:420px;}
  .vxn-glass__inner{padding:0 20px;}
  .vxn-glass__panel{padding:28px 24px 26px;}
}

/* ---- Highlights ---------------------------------------------------------- */

.vxn-hl{
  --ny:#0E355F; --ny2:#0B2DBE; --body:#4d5863;
  background:#eef4fc;
  padding:40px 0;
}
.vxn-hl__inner{max-width:1240px;margin:0 auto;padding:0 24px;}
.vxn-hl__top{
  display:grid;
  grid-template-columns:minmax(0,320px) minmax(0,1fr);
  gap:56px;
  align-items:start;
  margin-bottom:34px;
}
.vxn-hl__head{
  font-weight:400!important;
  color:var(--ny)!important;
  font-size:clamp(28px,3.4vw,40px)!important;
  line-height:1.15!important;
  margin:0!important;
}
.vxn-hl__intro{
  color:var(--body)!important;
  font-size:17px!important;
  line-height:1.7!important;
  margin:0!important;
}
.vxn-hl__grid{display:grid;grid-template-columns:repeat(3,1fr);gap:22px;}
.vxn-hl__card{
  position:relative;
  overflow:hidden;
  border-radius:20px;
  background:#fff;
  padding:38px 28px 32px;
  text-align:center;
  /* Everything the hover changes is named here, so the card returns as smoothly
     as it arrives. */
  transition:background-color .4s ease, transform .4s cubic-bezier(.22,.61,.36,1), box-shadow .4s ease;
}
/* The rule across the top, drawn as a pseudo-element rather than a border-top so
   it follows the 20px corners instead of tapering into them. */
.vxn-hl__card::before{
  content:"";position:absolute;top:0;left:0;right:0;height:4px;
  background:var(--ny2);
  transition:background-color .4s ease;
}
.vxn-hl__figure{
  display:block;
  font-size:clamp(36px,4vw,46px);
  line-height:1.1;
  color:var(--ny);
  margin-bottom:14px;
  transition:color .4s ease;
}
.vxn-hl__label{
  font-weight:400!important;
  color:var(--ny)!important;
  font-size:17px!important;
  line-height:1.45!important;
  margin:0 0 14px!important;
  transition:color .4s ease;
}
.vxn-hl__note{
  display:block;
  color:var(--body);
  font-size:13px;
  line-height:1.55;
  transition:color .4s ease;
}
.vxn-hl__card:hover{
  background:var(--ny2);
  transform:translateY(-4px);
  box-shadow:0 18px 44px rgba(0,83,183,.24);
}
.vxn-hl__card:hover::before{background:#fff;}
.vxn-hl__card:hover .vxn-hl__figure,
.vxn-hl__card:hover .vxn-hl__label,
.vxn-hl__card:hover .vxn-hl__note{color:#fff!important;}

@media(max-width:900px){
  .vxn-hl__top{grid-template-columns:1fr;gap:18px;}
  .vxn-hl__grid{grid-template-columns:1fr;gap:16px;}
}
@media(max-width:767px){
  .vxn-hl__inner{padding:0 20px;}
  .vxn-hl__intro{font-size:16px!important;}
}

/* ---- Entrance ------------------------------------------------------------
   Deliberately NOT the site's scroll-reveal (.elementor-invisible plus a
   _animation in data-settings). That mechanism hides the element with
   visibility:hidden until a script reveals it, which is fine for the captured
   markup's decorative headings but would put a whole section's content behind
   JS — and it could not be verified here, because the browser pane runs
   backgrounded and requestAnimationFrame, which the reveal's scroll handler
   depends on, never fires in a hidden document.

   This runs on load instead, and carries no fill-mode: before and after the
   animation the element uses its normal, visible style, so nothing can leave it
   stranded at opacity 0 — not a failed script, not a browser that ignores the
   animation.
   -------------------------------------------------------------------------- */
@keyframes vxn-rise{
  from{opacity:0;transform:translateY(18px);}
  to{opacity:1;transform:none;}
}
.vxn-comm__card,.vxn-glass__panel{
  animation:vxn-rise .7s cubic-bezier(.22,.61,.36,1);
}

/* The movement is decoration; anyone who has asked for less keeps the colour
   and the frost and loses the travel. */
@media(prefers-reduced-motion:reduce){
  .vxn-comm__card,.vxn-glass__panel{animation:none;}
  .vxn-cap__img,.vxn-cap__rule,.vxn-cap__cap,.vxn-cap__tile::after,
  .vxn-comm__ico,.vxn-comm__dash,
  .vxn-glass__bg,.vxn-glass__panel,.vxn-glass__dash,
  .vxn-hl__card{transition:none;}
  .vxn-glass:hover .vxn-glass__bg{transform:none;}
  .vxn-cap__tile:hover .vxn-cap__cap,
  .vxn-comm__card:hover .vxn-comm__ico,
  .vxn-glass:hover .vxn-glass__panel,
  .vxn-hl__card:hover{transform:none;}
}
`;

export default function ServicePageBody({
  region,
  content,
}: {
  region: string;
  content: ServicePageContent;
}) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <section className="vxn-svcintro" aria-labelledby="vxn-svcintro-head">
        <div className="vxn-svcintro__inner">
          <span className="vxn-svcintro__eyebrow">{content.eyebrow}</span>
          <h2 className="vxn-svcintro__head" id="vxn-svcintro-head">
            {content.head}
          </h2>
          <div className="vxn-svcintro__body">
            {content.intro.map((p) => (
              <p key={p.slice(0, 40)}>{p}</p>
            ))}
          </div>
        </div>
      </section>

      <section className="vxn-cap" aria-labelledby="vxn-cap-head">
        <div className="vxn-cap__inner">
          <h2 className="vxn-cap__head" id="vxn-cap-head">
            {content.capHead}
          </h2>
          <p className="vxn-cap__lede">{content.capLede}</p>

          <div
            className={`vxn-cap__grid${content.capColumns === 3 ? " vxn-cap__grid--3" : ""}`}
          >
            {content.capabilities.map((c) => (
              <figure className="vxn-cap__tile" key={c.name}>
                {/* Decorative: the caption beside it already names the capability. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="vxn-cap__img"
                  src={rimgFirst(region, c.img)}
                  alt=""
                  loading="lazy"
                />
                <figcaption className="vxn-cap__cap">
                  <span className="vxn-cap__rule" aria-hidden="true" />
                  <span className="vxn-cap__name">{c.name}</span>
                  <span className="vxn-cap__rule" aria-hidden="true" />
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="vxn-comm" aria-label="Our commitments">
        <div className="vxn-comm__inner">
          <div className="vxn-comm__grid">
            {COMMITMENTS.map((c, i) => (
              <a
                key={c.title}
                className="vxn-comm__card"
                style={{ animationDelay: `${i * 110}ms` }}
                href={rurl(region, c.href)}
              >
                <span className="vxn-comm__ico" aria-hidden="true">
                  <MegaIcon token={c.icon} />
                </span>
                <h3 className="vxn-comm__title">{c.title}</h3>
                <span className="vxn-comm__link">
                  {c.label}
                  <i className="vxn-comm__dash" aria-hidden="true" />
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="vxn-glass" aria-labelledby="vxn-glass-head">
        {/* Decorative: the panel over it carries the message. Live where the
            plate is the practice's abstract (components/three/live). */}
        <LiveImage
          className="vxn-glass__bg"
          src={rimgFirst(region, content.glass.img)}
          alt=""
          loading="lazy"
        />
        <div className="vxn-glass__inner">
          <div className="vxn-glass__panel">
            <span className="vxn-glass__eyebrow">{content.glass.eyebrow}</span>
            <h2 className="vxn-glass__head" id="vxn-glass-head">
              {content.glass.head}
            </h2>
            <p className="vxn-glass__text">{content.glass.text}</p>
            <a
              className="vxn-glass__link"
              href={rurl(region, "/free-consultation/")}
            >
              Free Consultation
              <i className="vxn-glass__dash" aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>

      <section className="vxn-hl" aria-labelledby="vxn-hl-head">
        <div className="vxn-hl__inner">
          <div className="vxn-hl__top">
            <h2 className="vxn-hl__head" id="vxn-hl-head">
              Highlights
            </h2>
            <p className="vxn-hl__intro">{content.highlightsIntro}</p>
          </div>

          <div className="vxn-hl__grid">
            {content.highlights.map((h) => (
              <article className="vxn-hl__card" key={h.label}>
                <span className="vxn-hl__figure">{h.figure}</span>
                <h3 className="vxn-hl__label">{h.label}</h3>
                <span className="vxn-hl__note">{h.note}</span>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
