/**
 * /en-ae/services/ — the UAE services index.
 *
 * The shared ServicesBody is India's: 1,000 lines of captured Elementor markup
 * naming the group's four verticals and linking to their four pages. Serving it
 * to the UAE put four Indian services, and four Indian URLs, under a UAE
 * visitor's Services menu. This is the UAE's own index, built from
 * vxnServices('en-ae'), the same registry behind the header menu and the UAE
 * home page, so the six services are listed wherever they are listed and
 * adding one is still a single entry in that registry.
 *
 * ---------------------------------------------------------------------------
 * REBUILT 20260911 to bcg.com's capabilities index, on client instruction,
 * and set in the UAE service pages' own language.
 *
 * WHAT THE REFERENCE IS. bcg.com/capabilities, measured at 1600: a lead (an
 * 86px title and a 28px paragraph, no picture), then a directory of twenty-one
 * capabilities as cards on a 3-column grid (349px cards, 16px gutters, a 3:2
 * photograph with the top corners rounded, a beige panel carrying a 28px light
 * title and, hidden until asked for, one sentence and a "Learn More"), then a
 * row of four portrait insight cards with a glass caption (tag pill, ARTICLE
 * and a date, the title), then two large promo cards (photograph, eyebrow,
 * title, a paragraph, a button). Hovering a card changes nothing on it.
 *
 * WHAT IS BUILT FROM IT, and where it departs:
 *
 *   hero        NOT the reference's plain lead: the client asked for the same
 *               hero the six service pages open on, so the page opens on the
 *               template's .at-hero, to the pixel: the plate, the two scrims,
 *               the four-layer blur, the crumb, the title and the lede.
 *   lead        the reference's title-and-paragraph, as the template's head row
 *               (statement left, gloss right) under a kicker.
 *   directory   the reference's grid, six cards on three columns; the page's
 *               24px gap and 18px radius rather than 16 and 25; the panel is
 *               the template's tint. Each card shows the sentence the
 *               reference hides, the service's own accordion line from the
 *               registry, and the names of its pages, because a visitor on an
 *               index is choosing. The picture eases up on hover, as the
 *               template's related cards do.
 *   insights    the reference's four portrait cards, from the blog catalog.
 *   promos      the reference's two: the consultation, and the industries.
 *
 * It was six alternating bands, figure one side and copy the other, with a
 * jump rail and three counters. Those went with the rebuild.
 *
 * ---------------------------------------------------------------------------
 * THE TEMPLATE'S SHEET AND ENGINE, NOT COPIES. The page renders inside
 * .at-root with ServiceTemplateBody's CSS and ServiceTemplateMotion, so the
 * hero, the kicker, the headings, the buttons, the container and the reveal
 * rules are the service pages' own and cannot drift from them. This file's
 * own sheet is only the sections the template does not have: the lead row,
 * the directory, the insight rail and the promos, under an sx- prefix.
 *
 * COPY. The hero line and the lead's statement are the client's home-page
 * lines; the card sentences and the page names are the registry's. The lead's
 * gloss, the first promo's text and the second promo's line are drafted here
 * and flagged as such in the JSX; none carries an em dash.
 *
 * HOVER MOVES NOTHING, as on the template: a hover changes colour, light or
 * coverage, a photograph eases inside its frame, and a link's own gap opens so
 * the arrow travels without a transform on anything.
 *
 * THE STYLESHEET IS A TEMPLATE LITERAL. No backtick inside it, ever: one ends
 * the string and the build fails with "Expected a semicolon".
 */
import type { BlogCard } from '@/lib/blog/types';
import Html from '@/components/Html';
import { rurl, vxnRegionData, vxnServiceName, vxnServices } from '@/lib/region';
import CtaArrow from '@/components/ui/CtaArrow';
import { rimgFirst } from '@/lib/region-assets';
import type { PageConfig } from '@/lib/page-config';
import ServiceTemplateMotion, { type MotionGroup } from './uae-services/template/Motion';
import { CSS as TEMPLATE_CSS, RELATED_FIGURE } from './uae-services/template/ServiceTemplateBody';

/**
 * The plates, as candidate lists in the house convention: a purpose-shot
 * filename first, the library photograph behind it, so a commissioned file
 * dropped into uploads/services/ replaces the stand-in with no code change.
 */
const PLATE = {
  /* The hero: the office photograph the page's config already names for it. */
  hero: ['services/services-hero.webp', 'banners/service-main.webp', 'homepage/abstract-3.webp'],
  /* The two promos: a handshake for the consultation, a sector shot for the
     industries. */
  /* who-we-are-1 rather than banners/get-in-touch-uae: that file carries the
     wordmark's x across its top-left corner, which read as a stray logo on
     the card. */
  start: ['services/services-start.webp', 'new-folder/who-we-are-1.webp', 'banners/clients.webp'],
  industries: ['services/services-industries.webp', 'banners/industry.webp', 'homepage/industry-5.webp'],
};

/** What reveals on this page beyond the template's own table. */
const MOTION: MotionGroup[] = [
  { sel: '.sx-lead > *', variant: 'up', stagger: true },
  { sel: '.sx-card', variant: 'up', stagger: true },
  { sel: '.sx-ins__head > *', variant: 'up', stagger: true },
  { sel: '.sx-post', variant: 'up', stagger: true },
  { sel: '.sx-promo__card', variant: 'up', stagger: true },
];

const CSS = `
/* ==========================================================================
   THE LEAD AND THE DIRECTORY, one band: the reference's title-and-paragraph
   over its grid of cards. The lead is the template's head row, statement left
   and gloss right, bottom-aligned so the two read as one line across.
   ========================================================================== */
.sx-dir{background:#fff;padding:clamp(40px,4.4vw,64px) 0 clamp(48px,5vw,76px)!important;}
.sx-lead{
  display:grid;grid-template-columns:minmax(0,1.12fr) minmax(0,.88fr);
  gap:clamp(20px,4vw,72px);align-items:end;
  margin:0 0 clamp(28px,3.2vw,44px);
}
.sx-lead__col{display:flex;flex-direction:column;align-items:flex-start;}
/* (0,2,0), over the UAE type scale's h2 rule; the market's heading weight
   applies from the face sheet. */
.at-root .sx-lead__head{
  color:var(--ny)!important;font-size:clamp(30px,3.6vw,48px)!important;
  line-height:1.1!important;letter-spacing:-.016em!important;margin:0!important;max-width:16ch;
}
.sx-lead__lede{
  justify-self:end;max-width:52ch;
  color:var(--body)!important;font-size:clamp(15px,1.15vw,17px)!important;line-height:1.7!important;margin:0!important;
}

/* The grid: the reference's three columns on the page's own gap, and the
   reference's width, 1080 for three 349px tiles, so the tiles are tiles and
   not panels (the client, 20260911: the boxes were too large at 485). Left
   on the container's line, as the reference leaves its grid. */
.sx-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:var(--gap);max-width:1096px;}

/* ---- THE CARD: the reference's tile, measured (20260911) --------------------
   bcg.com/industries/insurance/overview, "Our Insurance Industry Services",
   at 1600: a 349px square tile, radius 20, the photograph across its top 227px
   (65%), and a panel the tile's full height parked at top 237.5px (68%) so
   only the title shows. Under the pointer the panel rises to top 0 on
   .75s cubic-bezier(.47,1.64,.41,.8), a spring that overshoots by 10px at
   .39s and settles at .79s, while the photograph fades out over .5s and the
   panel's hidden block (the sentence and the button) fades in over .5s. All
   of it runs back on leave. Padding 16px 20px, title 28/300 with 12 below,
   description 14/18.2 clamped to five lines, the button pinned to the foot.

   Here: the same square, the same rest position, the same three transitions,
   with the page's 24px sides, the site's pill, and the service's number over
   the title. This is the one hover on the template pages that moves
   something, on the client's instruction; everything else here still holds
   the no-transform rule.

   THE HIDDEN BLOCK IS HIDDEN BY OPACITY, as on the reference: at rest its
   first lines sit inside the visible band and would otherwise show through
   under the title. Keyboard users get the same opening on focus.
   -------------------------------------------------------------------------- */
.sx-card{
  position:relative;display:block;aspect-ratio:1/1;overflow:hidden;
  border-radius:20px;background:var(--tint2);
  color:var(--ny)!important;text-decoration:none!important;
}
/* No ground of its own: as the photograph fades the tile's tint has to show
   through, as the reference's beige does, or the risen panel sits on a dark
   block with its title lost on it. */
.sx-card__shot{position:absolute;left:0;top:0;width:100%;height:65%;overflow:hidden;background:transparent;}
.sx-card__shot img{
  position:absolute;inset:0;width:100%;height:100%;object-fit:cover;
  transition:opacity .5s;
}
.sx-card__body{
  position:absolute;left:0;right:0;top:68%;height:100%;
  display:flex;flex-direction:column;align-items:flex-start;
  padding:16px 20px 18px;
  transition:top .75s cubic-bezier(.47,1.64,.41,.8);
}
/* The title alone at rest, as on the reference (the number over it came off
   on client instruction). 24px at the tile's width. */
.at-root .sx-card__title{
  color:var(--ny)!important;font-size:clamp(19px,1.5vw,24px)!important;
  line-height:1.2!important;letter-spacing:-.01em!important;margin:0 0 12px!important;
}
.sx-card__inner{
  display:flex;flex-direction:column;align-items:flex-start;flex:1 1 auto;width:100%;min-height:0;
  opacity:0;transition:opacity .5s;
}
.sx-card__desc{
  display:-webkit-box;-webkit-line-clamp:5;-webkit-box-orient:vertical;overflow:hidden;
  color:var(--body);font-size:13.5px;line-height:1.5;margin:0 0 10px;
}
/* The service's pages, named. Two lines at most; the page itself has the rest. */
.sx-card__subs{
  display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;
  color:var(--muted);font-size:12px;line-height:1.5;margin:0 0 12px;
}
/* The button, pinned to the foot as the reference pins its own. It is the
   site's pill, drawn on a span inside the card's link. */
.sx-card__more{margin-top:auto;}

.sx-card:hover .sx-card__body,
.sx-card:focus-visible .sx-card__body{top:0;}
.sx-card:hover .sx-card__shot img,
.sx-card:focus-visible .sx-card__shot img{opacity:0;}
.sx-card:hover .sx-card__inner,
.sx-card:focus-visible .sx-card__inner{opacity:1;}
.sx-card:focus-visible{outline:2px solid var(--ny2);outline-offset:3px;}

@media(prefers-reduced-motion:reduce){
  .sx-card__body,.sx-card__shot img,.sx-card__inner{transition:none;}
}

/* ==========================================================================
   INSIGHTS, the reference's row of four: a portrait photograph, a tag pill,
   and a glass caption at the foot with the kind, the date and the title.
   ========================================================================== */
.sx-ins{background:var(--tint);padding:clamp(48px,5vw,76px) 0!important;}
.sx-ins__head{
  display:flex;align-items:flex-end;justify-content:space-between;gap:var(--gap);
  margin:0 0 var(--headgap);
}
.sx-ins__intro{display:flex;flex-direction:column;align-items:flex-start;}
.at-root .sx-ins__title{
  color:var(--ny)!important;font-size:clamp(26px,3vw,36px)!important;line-height:1.2!important;margin:0!important;
}
.sx-ins__all{
  display:inline-flex;align-items:center;gap:8px;flex:0 0 auto;padding-bottom:6px;
  color:var(--ny2)!important;text-decoration:none!important;font-size:14px;font-weight:500;line-height:1;
  transition:gap .3s cubic-bezier(.22,.61,.36,1);
}
.sx-ins__all:hover{gap:13px;}
.sx-rail{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:var(--gap);}
.sx-post{
  position:relative;display:block;aspect-ratio:3/4;overflow:hidden;
  border-radius:var(--radius);background:#0d1b33;
  color:var(--ny)!important;text-decoration:none!important;
}
.sx-post img{
  position:absolute;inset:0;width:100%;height:100%;object-fit:cover;
  transition:transform .9s cubic-bezier(.22,1,.36,1);
}
.sx-post:hover img{transform:scale(1.05);}
.sx-post__tag{
  position:absolute;left:16px;top:16px;z-index:2;
  display:inline-flex;align-items:center;padding:6px 12px;border-radius:999px;
  background:rgba(6,18,44,.62);color:#fff;
  font-size:10.5px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;
  -webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);
}
.sx-post__panel{
  position:absolute;left:16px;right:16px;bottom:16px;z-index:2;
  padding:18px 18px 20px;border-radius:12px;
  background:rgba(255,255,255,.8);border:1px solid rgba(255,255,255,.6);
  -webkit-backdrop-filter:blur(14px) saturate(140%);backdrop-filter:blur(14px) saturate(140%);
}
.sx-post__meta{
  display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin:0 0 8px;
  font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);
}
.sx-post__meta b{font-weight:700;color:var(--ny);}
.sx-post__title{display:block;color:var(--ny);font-size:17px;line-height:1.3;}

/* ==========================================================================
   THE PROMOS, the reference's two: a photograph under a scrim, an eyebrow,
   a title, a paragraph and the site's pill in its white finish.
   ========================================================================== */
.sx-promo{background:#fff;padding:clamp(40px,4.4vw,64px) 0 clamp(48px,5vw,76px)!important;}
.sx-promo__grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--gap);}
.sx-promo__card{
  position:relative;isolation:isolate;overflow:hidden;
  display:flex;flex-direction:column;justify-content:flex-end;align-items:flex-start;
  min-height:clamp(360px,34vw,520px);padding:clamp(24px,2.6vw,36px);
  border-radius:var(--radius);background:#07142f;color:#fff;
}
.sx-promo__card img{position:absolute;inset:0;z-index:-2;width:100%;height:100%;object-fit:cover;}
.sx-promo__scrim{
  position:absolute;inset:0;z-index:-1;
  background:linear-gradient(to top,rgba(4,14,36,.86) 0%,rgba(4,14,36,.55) 45%,rgba(4,14,36,.15) 100%);
}
.sx-promo__kick{
  display:block;margin:0 0 12px;
  font-size:11px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:rgba(255,255,255,.85);
}
.at-root .sx-promo__head{
  color:#fff!important;font-size:clamp(24px,2.4vw,34px)!important;line-height:1.16!important;
  margin:0 0 12px!important;max-width:20ch;
}
.sx-promo__text{
  color:rgba(255,255,255,.88)!important;font-size:15px!important;line-height:1.65!important;
  margin:0 0 22px!important;max-width:50ch;
}
/* The arrow inside the pill is sized here as well as on the glyph: an SVG
   with no size of its own is 300 by 150 to the browser, and the pill grew to
   fit it. */
/* The pill on a photograph takes the site's white finish. */
.sx-promo .at-btn--solid{
  background-image:none;background-color:#fff;color:var(--vxn-cta-ink,#0B2DBE)!important;border-color:#fff;
  --vxn-cta-sweep:var(--vxn-cta-sweep-light,#EAF0FF);
}
.sx-promo .at-btn--solid:hover{color:var(--vxn-cta-ink,#0B2DBE)!important;}

/* ==========================================================================
   RESPONSIVE. The template's steps.
   ========================================================================== */
@media(max-width:1180px){
  .sx-rail{grid-template-columns:repeat(2,minmax(0,1fr));}
}
@media(max-width:1024px){
  .sx-lead{grid-template-columns:minmax(0,1fr);gap:12px;}
  .sx-lead__lede{justify-self:start;}
  .sx-grid{grid-template-columns:repeat(2,minmax(0,1fr));max-width:none;}
  /* No pointer to hover with: the tile opens out into a plain card, the
     photograph on top and everything under it in flow. */
  .sx-card{aspect-ratio:auto;display:flex;flex-direction:column;}
  .sx-card__shot{position:relative;height:auto;aspect-ratio:3/2;}
  .sx-card__body{position:static;height:auto;flex:1 1 auto;padding:18px 22px 22px;transition:none;}
  .sx-card__inner{opacity:1;transition:none;}
  .sx-card__more{margin-top:auto;}
  .sx-ins__head{flex-direction:column;align-items:flex-start;gap:12px;}
  .sx-promo__grid{grid-template-columns:minmax(0,1fr);}
}
@media(max-width:640px){
  .sx-grid{grid-template-columns:minmax(0,1fr);}
  .sx-rail{grid-template-columns:minmax(0,1fr);}
  .sx-post{aspect-ratio:4/5;}
}
`;

export default function UaeServicesBody({
  region,
  posts = [],
}: {
  page: PageConfig;
  region: string;
  /** The four newest published posts, read from the database by the route. */
  posts?: BlogCard[];
}) {
  const services = vxnServices(region);
  const market = vxnRegionData(region);

  return (
    <div id="main-content">
      <div id="main" role="main" className="vamtam-main layout-full">
        <article className="full page type-page status-publish hentry at-root sx">
          <style dangerouslySetInnerHTML={{ __html: TEMPLATE_CSS }} />
          <style dangerouslySetInnerHTML={{ __html: CSS }} />
          <ServiceTemplateMotion extra={MOTION} />

          {/* ---- 1. HERO, the service pages' own ----
              The markup is ServiceTemplateBody's, line for line, so the two
              cannot drift: the plate, the scrim, the four blur layers, the
              wash, the crumb, the title and the lede. */}
          <section className="at-hero" aria-labelledby="at-hero-head">
            <div className="at-hero__media">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="at-zoom" src={rimgFirst(region, PLATE.hero)} alt={`Valunxt advisers in ${market.cities}`} fetchPriority="high" />
            </div>
            <div className="at-hero__scrim" aria-hidden="true" />
            <div className="at-hero__blur" aria-hidden="true">
              <i />
              <i />
              <i />
              <i />
            </div>
            <div className="at-hero__wash" aria-hidden="true" />

            <div className="at-hero__inner">
              <div className="at-hero__copy">
                <nav className="at-hero__crumb" aria-label="Breadcrumb">
                  <span>
                    <a href={rurl(region, '/')}>Home</a>
                    <span aria-hidden="true"> /</span>
                  </span>
                  <span aria-current="page">Services</span>
                </nav>
                <h1 className="at-hero__head" id="at-hero-head">
                  Services
                </h1>
                {/* The client's home-page line on the six, its dash a comma. */}
                <p className="at-hero__sub">
                  Accounting, transactions, mortgages, valuation, research and technology, six
                  connected practices supporting confident, informed decisions in the UAE.
                </p>
              </div>
            </div>
          </section>

          {/* ---- 2. THE LEAD AND THE DIRECTORY ---- */}
          <section className="sx-dir" aria-labelledby="sx-lead-head">
            <div className="at-in">
              <div className="sx-lead">
                <div className="sx-lead__col">
                  <span className="at-kicker">What we do</span>
                  {/* "Our Services", as the reference titles its directory
                      ("Our Capabilities"); the client's home line, "Six
                      Services. One Integrated Platform.", stood here for a
                      day and came off because it counts them. */}
                  <h2 className="sx-lead__head" id="sx-lead-head">
                    Our Services
                  </h2>
                </div>
                {/* DRAFTED: the index's earlier proposition line, its dash
                    gone, until the client's services document arrives. */}
                <p className="sx-lead__lede">
                  Every discipline under one roof, so a decision is advised, financed and executed
                  by the same team. Choose a service to see what it covers, who it is for and the
                  pages beneath it.
                </p>
              </div>

              <div className="sx-grid">
                {services.map((sv, i) => {
                  const name = vxnServiceName(sv);
                  const subs = sv.subs ?? [];
                  return (
                    <a className="sx-card" href={rurl(region, sv.href)} key={sv.slug ?? sv.href}>
                      {/* Decorative: the title below is the link's label. The
                          service's own photograph, the registry's `img`, on
                          client instruction (20260911); the template's lighter
                          related-card file is the fallback if it is ever
                          missing. */}
                      <span className="sx-card__shot">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={rimgFirst(region, [
                            /* Its own card shot first (20260913), so the
                               index does not repeat the home page's
                               accordion photograph. */
                            `services/index-${sv.slug}.webp`,
                            sv.img.replace('/assets/content/uploads/', ''),
                            ...(RELATED_FIGURE[sv.slug ?? ''] ?? []),
                          ])}
                          alt=""
                          loading={i < 3 ? 'eager' : 'lazy'}
                        />
                      </span>
                      <span className="sx-card__body">
                        <span className="sx-card__title">{name}</span>
                        {/* The hidden block, shown as the panel rises. */}
                        <span className="sx-card__inner">
                          {/* The registry's own sentence, the one the home
                              accordion uses. Entities, hence <Html>. */}
                          <Html as="span" className="sx-card__desc" html={sv.desc} />
                          {subs.length ? (
                            <span className="sx-card__subs">
                              {subs.length} {subs.length === 1 ? 'service' : 'services'}:{' '}
                              {subs.map((s) => s.name).join(', ')}
                            </span>
                          ) : null}
                          <span className="sx-card__more at-btn at-btn--solid">
                            Learn more
                            <CtaArrow />
                          </span>
                        </span>
                      </span>
                    </a>
                  );
                })}
              </div>
            </div>
          </section>

          {/* ---- 3. INSIGHTS ---- */}
          <section className="sx-ins" aria-labelledby="sx-ins-title">
            <div className="at-in">
              <div className="sx-ins__head">
                <div className="sx-ins__intro">
                  <span className="at-kicker">Insights</span>
                  <h2 className="sx-ins__title" id="sx-ins-title">
                    Our Latest Insights
                  </h2>
                </div>
                <a className="sx-ins__all" href={rurl(region, '/blogs/')}>
                  View all insights
                  <CtaArrow />
                </a>
              </div>

              <div className="sx-rail">
                {posts.map((post) => (
                  <a className="sx-post" href={rurl(region, `/blogs/${post.slug}/`)} key={post.slug}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={post.cover_image} alt={post.cover_alt} loading="lazy" />
                    <span className="sx-post__tag">{post.category}</span>
                    <span className="sx-post__panel">
                      <span className="sx-post__meta">
                        <b>Article</b>
                        <span>{post.date}</span>
                      </span>
                      <span className="sx-post__title">{post.title}</span>
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </section>

          {/* ---- 4. THE PROMOS ---- */}
          <section className="sx-promo" aria-label="Next steps">
            <div className="at-in">
              <div className="sx-promo__grid">
                <div className="sx-promo__card">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={rimgFirst(region, PLATE.start)} alt="" loading="lazy" />
                  <span className="sx-promo__scrim" aria-hidden="true" />
                  <span className="sx-promo__kick">Start here</span>
                  <h2 className="sx-promo__head">Not sure which of the six you need?</h2>
                  {/* DRAFTED: the index's earlier closing line, its dash a
                      full stop. */}
                  <p className="sx-promo__text">
                    Most engagements start as one question and end up touching two or three of these
                    practices. Tell us the decision you are facing and we will tell you what it
                    takes, at a fee agreed before any work begins.
                  </p>
                  <a className="at-btn at-btn--solid" href={rurl(region, '/free-consultation/')}>
                    Book a Free Consultation
                    <CtaArrow />
                  </a>
                </div>

                <div className="sx-promo__card">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={rimgFirst(region, PLATE.industries)} alt="" loading="lazy" />
                  <span className="sx-promo__scrim" aria-hidden="true" />
                  <span className="sx-promo__kick">Our expertise</span>
                  <h2 className="sx-promo__head">Industries We Serve</h2>
                  {/* DRAFTED. */}
                  <p className="sx-promo__text">
                    Sector knowledge across the industries that shape {market.markets}, from real
                    estate and construction to financial services and technology.
                  </p>
                  <a className="at-btn at-btn--solid" href={rurl(region, '/industries/')}>
                    Explore Industries
                    <CtaArrow />
                  </a>
                </div>
              </div>
            </div>
          </section>
        </article>
      </div>
    </div>
  );
}
