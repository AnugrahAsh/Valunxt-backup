/**
 * The UAE sub-service page template — /en-ae/services/<service>/<sub>/, all
 * thirty-three of them.
 *
 * ONE COMPONENT, SIX CONTENT MODULES. This began as the Accounting &
 * Bookkeeping page, written as its own body to a set of reference designs.
 * The client then asked for every page beneath the six UAE services to take
 * the same page — every section, the same plates, the same footer — with only
 * the words changed. So the body became this: a component that reads a
 * SubServiceTemplateContent (see ./subTypes.ts) and renders the page, and a
 * subs.ts module per service under ../<service>/ that builds the content for
 * each of its pages. The `abk-` class prefix is that history; it is the
 * template's prefix now, the way `at-` is the service template's.
 *
 * Like the service template it owns its whole page: it opens its own
 * #main-content wrapper and leads with its own hero, so the shared breadcrumb
 * band is NOT rendered above it.
 *
 * ---------------------------------------------------------------------------
 * THE STYLESHEET IS A FILE, NOT A <style> BLOCK
 *
 * public/assets/css/valunxt-uae-sub.css, declared by every sub-page's
 * PageConfig as `site_css` and emitted by HeadAssets after the brand and
 * landing sheets. That is the one structural difference from the service
 * template, which carries its CSS inline. It was asked for that way, and it
 * buys two things: the sheet is cached separately from the HTML, and it is in
 * <head> before first paint rather than mid-body — so there is no window in
 * which the page renders unstyled. It also loads LAST, which is what lets a
 * plain `.abk-*` selector outrank the theme without reaching for `!important`.
 *
 * Nothing in this file sets a style attribute. Every rule lives in that sheet.
 *
 * ---------------------------------------------------------------------------
 * THE TEN SECTIONS, and what each one is doing
 *
 *   1  HERO       A full-bleed plate with the copy hanging off its foot and a
 *                 progressive blur rising out of the bottom edge — four stacked
 *                 backdrop-filters, each masked to start lower than the last.
 *   2  BRIEF      An editorial column beside a blue panel: plain prose and two
 *                 2-up lists; the panel is the brand ramp over an abstract
 *                 plate, the mark at the top and the title at the foot.
 *   3  WHY US     A wide picture band with a frosted card floated on it.
 *   4  APPROACH   A rule, an eyebrow, three columns. The whitespace is the design.
 *   5  INSIGHTS   Four cards, CSS hover only.
 *   6  STORY      A photograph carrying a frosted testimonial beside a gradient
 *                 panel carrying the result — one band split down the middle.
 *   7  BAND       One wide plate, a heading against it, the copy beside.
 *   8  VISION     Three steps on a rail beside a pull quote.
 *   9  STRIP      The home page's own expanding row, over the practice's disciplines.
 *  10  TALK       The parent service's closing band, restated.
 *
 * ---------------------------------------------------------------------------
 * MOTION. Hover changes colour and light, never position: there is no
 * `transform` under any `:hover` rule in the stylesheet. Scroll reveals come
 * from ./SubMotion.tsx by selector, and the stylesheet's default is visible — a
 * failed bundle cannot produce a blank page.
 */
import type { ComponentType } from 'react';
import type React from 'react';

import HomeIndustriesRow from '@/components/sections/HomeIndustriesRow';
import { rurl } from '@/lib/region';
import { brandCase } from '@/components/ui/BrandName';
import CtaArrow from '@/components/ui/CtaArrow';
import { rimg, rimgFirst } from '@/lib/region-assets';

import SubServiceTemplateMotion from './SubMotion';
import { subImageList, type SubPoint, type SubServiceTemplateContent } from './subTypes';

/* -------------------------------------------------------------------------
   Small pieces
   ------------------------------------------------------------------------- */

function Plus() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
      <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function ArrowUpRight() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
      <path d="M4.5 11.5 11.5 4.5M5.5 4.5h6v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** A paragraph or a list of them, as the content modules may give either. */
function paras(text: string | string[]): string[] {
  return Array.isArray(text) ? text : [text];
}

function CheckCircle() {
  return (
    <svg viewBox="0 0 22 22" fill="none" aria-hidden="true" focusable="false">
      <circle cx="11" cy="11" r="9.25" stroke="currentColor" strokeWidth="1.3" />
      <path d="m7.2 11.3 2.6 2.5 5-5.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * One point in a two-column list.
 *
 * `stress` is a substring of `text` to underline, the way the reference marks a
 * key term mid-sentence. Matched rather than authored as HTML so the content
 * modules stay plain strings — nothing in this page is ever
 * dangerouslySetInnerHTML, and a phrase that no longer appears in the text
 * simply renders unmarked instead of throwing or printing a tag.
 */
function Point({ point }: { point: SubPoint }) {
  const { lead, text, stress } = point;
  let rest: React.ReactNode = text;

  if (stress) {
    const at = text.indexOf(stress);
    if (at !== -1) {
      rest = (
        <>
          {text.slice(0, at)}
          <u>{stress}</u>
          {text.slice(at + stress.length)}
        </>
      );
    }
  }

  return (
    <li>
      <b>{lead}</b> {rest}
    </li>
  );
}

/* -------------------------------------------------------------------------
   The page
   ------------------------------------------------------------------------- */

export default function SubServiceTemplateBody({
  region,
  content,
}: {
  region: string;
  content: SubServiceTemplateContent;
}) {
  const { hero, brief, why, approach, insights, story, band, vision, strip, talk } = content;

  return (
    <div className="abk-root" id="main-content">
      {/* ================= 1. HERO ================= */}
      <section className="abk-hero">
        <div className="abk-hero__media abk-zoom">
          <img src={rimgFirst(region, hero.image)} alt={hero.alt} fetchPriority="high" />
        </div>
        <div className="abk-hero__scrim" aria-hidden="true" />

        {/* Four layers, not one. Each adds its own blur on top of the ones
            before it, so the strength ramps from nothing to 22px down the band
            — which a single masked backdrop-filter cannot do. */}
        <div className="abk-hero__blur" aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
        </div>
        <div className="abk-hero__wash" aria-hidden="true" />

        <div className="abk-hero__inner">
          {/* One column: a two-column grid with nothing in its second track
              only narrows the paragraph for no reason. */}
          <div className="abk-hero__grid">
            <div>
              <nav className="abk-hero__crumb" aria-label="Breadcrumb">
                {content.crumbs.map((c) => (
                  <span key={c.href}>
                    <a href={rurl(region, c.href)}>{c.label}</a>
                    <span aria-hidden="true"> /</span>
                  </span>
                ))}
                <span>{hero.crumb ?? hero.title}</span>
              </nav>

              <h1 className="abk-hero__title">{hero.title}</h1>
              <p className="abk-hero__lede">{hero.lede}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 2. THE BRIEF ================= */}
      <section className="abk-brief">
        <div className="abk-in">
          <div className="abk-brief__grid">
            <div className="abk-brief__copy">
              {paras(brief.lede).map((p) => (
                <p key={p}>{p}</p>
              ))}
              <p>{brief.whatIntro}</p>

              <ul className="abk-brief__list">
                {brief.what.map((p) => (
                  <Point key={p.lead} point={p} />
                ))}
              </ul>

              <p>{brief.howIntro}</p>

              <ul className="abk-brief__list">
                {brief.how.map((p) => (
                  <Point key={p.lead} point={p} />
                ))}
              </ul>
            </div>

            <figure className="abk-panel">
              <div className="abk-panel__media abk-zoom">
                <img src={rimgFirst(region, subImageList(brief.panel.image))} alt={brief.panel.alt} loading="lazy" />
              </div>
              <div className="abk-panel__glow" aria-hidden="true" />

              {/* The wordmark alone. A decorative burger glyph sat opposite it
                  in the reference; removed by request — it read as a control
                  that opens nothing. */}
              <div className="abk-panel__top">
                <span className="abk-panel__mark">{brandCase(brief.panel.mark)}</span>
              </div>

              <figcaption className="abk-panel__foot">
                <p className="abk-panel__title">{brief.panel.title}</p>
                <p className="abk-panel__sub">{brief.panel.sub}</p>
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* ================= 3. WHY US ================= */}
      <section className="abk-why">
        <div className="abk-in">
          <div className="abk-why__band">
            <div className="abk-why__media abk-zoom">
              <img src={rimgFirst(region, subImageList(why.image))} alt={why.alt} loading="lazy" />
            </div>
            <div className="abk-why__tint" aria-hidden="true" />

            <div className="abk-why__card">
              <span className="abk-why__pill">{brandCase(why.pill)}</span>

              {/* A link to the same place the button goes, not a <button> that
                  does nothing. The reference shows a round "+" in the corner;
                  giving it the card's own destination is the one reading of it
                  that leaves no dead control on the page. */}
              <a className="abk-why__plus" href={rurl(region, why.cta.href)} aria-label={why.cta.label}>
                <Plus />
              </a>

              <h2 className="abk-why__title">
                {why.titleTop}
                <br />
                {why.titleMid}
                <br />
                <span className="abk-why__mark">{why.titleMark}</span>
              </h2>

              <p className="abk-why__note">{why.note}</p>

              <a className="abk-why__btn" href={rurl(region, why.cta.href)}>
                {why.cta.label}
                <CtaArrow />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 4. OUR APPROACH ================= */}
      <section className="abk-appr">
        <div className="abk-in">
          <div className="abk-appr__rule" aria-hidden="true" />
          <p className="abk-appr__eyebrow">{approach.eyebrow}</p>

          {/* data-cols lets the stylesheet run four across when a document
              gives four steps (20260914, the mortgage journeys); three is the
              default and every other page. */}
          <div className="abk-appr__grid" data-cols={approach.columns.length}>
            {approach.columns.map((c) => (
              <div className="abk-appr__col" key={c.title}>
                <h3 className="abk-appr__h">{c.title}</h3>
                <p className="abk-appr__p">{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= 5. INSIGHTS RAIL ================= */}
      {/* The card's whole interaction is CSS — :hover and :focus-within on the
          <li>, nothing else. No JavaScript listens to this section, so it works
          before hydration and keeps working if the bundle never arrives.

          The <a> wraps the media and the glass together rather than sitting
          inside the glass, so the entire card is the hit target and keyboard
          focus lands once per card instead of twice. */}
      <section className="abk-ins">
        <div className="abk-in">
          <div className="abk-ins__head">
            <div className="abk-ins__intro">
              <h2 className="abk-ins__h">{insights.title}</h2>
              <p className="abk-ins__lede">{insights.lede}</p>
            </div>
            <a className="abk-ins__all" href={rurl(region, insights.all.href)}>
              {insights.all.label}
            </a>
          </div>

          {/* Four across, inside the container — no scroller. The count in the
              content module is load-bearing: the grid is four columns, so a
              fifth entry would start a second row holding one card. */}
          <ul className="abk-ins__rail">
            {insights.cards.map((c) => (
              <li className="abk-card" key={c.title}>
                <a className="abk-card__link" href={rurl(region, c.href)}>
                  <span className="abk-card__media">
                    <img src={rimg(region, c.image)} alt={c.alt} loading="lazy" />
                  </span>

                  {/* Optional since 20260912: an empty pill is a visible blob, so
                      a card without a category gets none at all. */}
                  {c.category && <span className="abk-card__pill">{c.category}</span>}

                  <span className="abk-card__glass">
                    {(c.kind || c.date) && (
                      <span className="abk-card__meta">
                        {c.kind && <b>{c.kind}</b>}
                        {c.date && <i>{c.date}</i>}
                      </span>
                    )}

                    <span className="abk-card__title">{c.title}</span>

                    {c.excerpt && <span className="abk-card__excerpt">{c.excerpt}</span>}

                    <span className="abk-card__btn">
                      {insights.all.label}
                      <CtaArrow />
                    </span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ================= 6. SUCCESS STORY ================= */}
      {/* Two panels, one band. They share a row and a height, and the gap
          between them is narrow so the pair reads as one object split down the
          middle rather than as two cards that happen to be adjacent. */}
      <section className="abk-case">
        <div className="abk-in">
          <div className="abk-case__grid">
            <figure className="abk-case__photo">
              <img src={rimgFirst(region, subImageList(story.photo))} alt={story.alt} loading="lazy" />

              {/* Same frosted treatment as the Why Us card — the frost is its
                  own masked layer inside the box, so the panel dissolves into
                  the photograph at its right edge with the text still sharp. */}
              <blockquote className="abk-case__quote">
                <span className="abk-case__mark" aria-hidden="true">
                  &rdquo;
                </span>
                <p className="abk-case__said">{story.quote}</p>
                {/* Optional since 20260912: a quote the document leaves
                    unattributed stands alone rather than over an invented role. */}
                {(story.initials || story.role || story.org) && (
                  <footer className="abk-case__by">
                    {story.initials && (
                      <span className="abk-case__avatar" aria-hidden="true">
                        {story.initials}
                      </span>
                    )}
                    <span className="abk-case__who">
                      {story.role && <b>{story.role}</b>}
                      {story.org && <i>{story.org}</i>}
                    </span>
                  </footer>
                )}
              </blockquote>
            </figure>

            <div className="abk-case__panel">
              <a className="abk-case__arrow" href={rurl(region, story.arrow.href)} aria-label={story.arrow.label}>
                <ArrowUpRight />
              </a>

              {story.pill && <span className="abk-case__pill">{story.pill}</span>}
              <h2 className="abk-case__h">{story.title}</h2>

              {/* The result and the button share the panel's foot, which is why
                  they are one row rather than two stacked blocks. */}
              <div className="abk-case__foot">
                <div className="abk-case__result">
                  {story.stat && <p className="abk-case__stat">{story.stat}</p>}
                  <p className="abk-case__note">{story.note}</p>
                </div>
                {story.cta && (
                  <a className="abk-case__cta" href={rurl(region, story.cta.href)}>
                    {story.cta.label}
                    <CtaArrow />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 7. THE BAND ================= */}
      <section className="abk-band">
        <div className="abk-in">
          <div className="abk-band__box">
            <span className="abk-band__media abk-zoom">
              <img src={rimgFirst(region, subImageList(band.image))} alt={band.alt} loading="lazy" />
            </span>
            <span className="abk-band__tint" aria-hidden="true" />

            <div className="abk-band__inner">
              <h2 className="abk-band__h">{band.title}</h2>
              <div className="abk-band__side">
                <p className="abk-band__p">{band.body}</p>
                {band.cta && (
                  <a className="abk-band__cta" href={rurl(region, band.cta.href)}>
                    {band.cta.label}
                    <CtaArrow />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 8. FOCUS AND VISION ================= */}
      <section className="abk-vision">
        <div className="abk-in">
          <div className="abk-vision__grid">
            {/* An ordered list, because these are three parts of one statement
                read in sequence — which is also what the rail down their left
                is drawing. */}
            <ol className="abk-vision__steps">
              {vision.steps.map((s) => (
                <li className="abk-vision__step" key={s.title}>
                  <span className="abk-vision__ico" aria-hidden="true">
                    <CheckCircle />
                  </span>
                  <div className="abk-vision__body">
                    <h3 className="abk-vision__h">{s.title}</h3>
                    <p className="abk-vision__p">{s.body}</p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="abk-vision__side">
              <span className="abk-vision__pill">{vision.pill}</span>
              <p className="abk-vision__quote">{vision.quote}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 9. THE EXPANDING STRIP ================= */}
      {/* The home page's own component, not a copy of it — so the expand and
          desaturate on hover is the same CSS (.vxn-svc-card in
          valunxt-brand.css) rather than a second implementation that can drift
          from it. Only the list differs.

          It sits OUTSIDE .abk-in on purpose: the .vxn-home-svc-section variant
          strips the container's padding and max-width to run the row full
          bleed, edge to edge, with no gaps and no radii. */}
      <HomeIndustriesRow region={region} items={strip} />

      {/* ================= 10. TALK TO AN EXPERT ================= */}
      {/* The parent service's closing band, restated. The parent carries its
          CSS inline under .at-root, which cannot reach this page, so the rules
          are restated in the stylesheet under .abk-talk with the parent's
          values resolved rather than its tokens. */}
      <section className="abk-talk" aria-labelledby="abk-talk-head">
        <div className="abk-in">
          <div className="abk-talk__grid">
            {/* Decorative: the copy beside it says what it shows. */}
            <figure className="abk-talk__fig">
              <img src={rimgFirst(region, talk.image)} alt="" loading="lazy" />
            </figure>

            <div className="abk-talk__copy">
              <h2 className="abk-talk__head" id="abk-talk-head">
                {talk.head}
              </h2>
              <p className="abk-talk__lede">{talk.lede}</p>
              <a className="abk-talk__cta" href={rurl(region, talk.cta.href)}>
                {talk.cta.label}
                <CtaArrow />
              </a>
            </div>
          </div>
        </div>
      </section>

      <SubServiceTemplateMotion />
    </div>
  );
}

/**
 * A body component for one sub-service, ready for the registry in ../index.ts.
 *
 * The [service]/[sub] route renders a body as <Body region={…} /> and knows
 * nothing about content; this closes the content over that shape so the
 * registry can be built from the six modules in a loop.
 */
export function templatedSubBody(content: SubServiceTemplateContent): ComponentType<{ region: string }> {
  const Body = ({ region }: { region: string }) => <SubServiceTemplateBody region={region} content={content} />;
  Body.displayName = `SubServiceTemplateBody(${content.service}/${content.slug})`;
  return Body;
}
