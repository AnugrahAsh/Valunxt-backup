'use client';

/**
 * "Find the Right Solution" drawn as the green satin band of the reference the
 * client supplied on 20260915 (a numbers band: two large figures with a
 * caption under each on a teal satin ground, an eyebrow and a two-line heading
 * on the right). ServiceTemplateBody renders this in place of the captured
 * Elementor tabs when a page's content sets solution.look = 'satin'; only Real
 * Estate does.
 *
 * THE MAPPING. The reference's eyebrow is the section's own heading (the h2,
 * set small); its heading is the chosen tab's title; its figures are the tab's
 * three steps, numbered, with the step's name and line as the caption. The
 * tabs sit top left, the intro and the tab's button follow the heading on the
 * right. Every word is the page's; nothing from the reference's copy is used.
 * The three tab photographs the captured block showed are not: the satin is
 * the section's picture now.
 *
 * THE TEXTURE is banners/texture-1.webp re-toned to the reference's teal
 * (average #425D59 against its #375954), saved as
 * services/re-solution-texture.webp; a scrim holds the type on it.
 *
 * WHY A CLIENT COMPONENT. The captured block's tabs were switched by
 * Elementor's nested-tabs handler; this markup is new, so it switches itself:
 * a roving tabindex, arrow keys, Home and End, the WAI-ARIA tabs pattern.
 * Without JavaScript the first tab's panel shows. The panels share one grid
 * cell so the card never changes height between tabs (see the panel rule).
 *
 * THE STYLESHEET IS A TEMPLATE LITERAL: no backticks and no dollar-brace
 * sequences anywhere inside SATIN_CSS, comments included.
 */
import { useId, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';

import CtaArrow from '@/components/ui/CtaArrow';

export interface SatinTab {
  tab: string;
  title?: string;
  intro: string;
  items: { key: string; name: string; text: string }[];
  cta: { label: string; href: string };
}

const SATIN_CSS = `
/* ==========================================================================
   THE SATIN BAND — SolutionSatin.tsx. Scoped to .at-sat.
   ========================================================================== */
.at-sat__wrap{container-type:inline-size;}
.at-sat__card{
  position:relative;isolation:isolate;overflow:hidden;
  display:grid;grid-template-columns:minmax(0,1fr) minmax(0,34%);grid-template-rows:auto 1fr;
  column-gap:clamp(32px,6cqw,110px);row-gap:clamp(28px,3cqw,48px);
  min-height:clamp(460px,36cqw,560px);
  padding:clamp(28px,4.2cqw,64px) clamp(24px,4.6cqw,72px) clamp(32px,4.4cqw,68px);
  border-radius:24px;background:#28453F;color:#fff;
}
.at-sat__texture{
  position:absolute;inset:0;z-index:-2;width:100%;height:100%!important;
  object-fit:cover;object-position:50% 50%;border-radius:0!important;
}
/* Deeper where the type sits: the heading's column on the right and the
   figures along the foot, the satin left open between. */
.at-sat__scrim{
  position:absolute;inset:0;z-index:-1;pointer-events:none;
  background:
    linear-gradient(90deg,rgba(9,28,25,.34) 0%,rgba(9,28,25,.08) 46%,rgba(9,28,25,.44) 100%),
    linear-gradient(0deg,rgba(9,28,25,.42) 0%,rgba(9,28,25,0) 46%);
}

/* ---- The tabs, top left ---- */
.at-sat__tabs{grid-area:1 / 1;align-self:start;display:flex;flex-wrap:wrap;gap:10px;}
.at-sat .at-sat__tab{
  appearance:none;display:inline-flex;align-items:center;min-height:42px;padding:0 20px!important;
  border:1px solid rgba(255,255,255,.34)!important;border-radius:999px!important;
  background:rgba(255,255,255,.04)!important;color:rgba(255,255,255,.86)!important;
  font-size:14px!important;font-weight:400!important;letter-spacing:.01em;line-height:1!important;
  text-transform:none!important;cursor:pointer;box-shadow:none!important;
  transition:background-color .3s ease,color .3s ease,border-color .3s ease;
}
.at-sat .at-sat__tab:hover{border-color:rgba(255,255,255,.7)!important;color:#fff!important;}
.at-sat .at-sat__tab[aria-selected="true"]{background:#fff!important;border-color:#fff!important;color:#1E3B35!important;}
.at-sat .at-sat__tab:focus-visible{outline:2px solid #fff;outline-offset:3px;}

/* ---- The eyebrow: the section heading, set small, top right ---- */
.at-sat .at-sat__head{
  grid-area:1 / 2;align-self:center;margin:0!important;
  color:rgba(255,255,255,.78)!important;font-size:12px!important;font-weight:500!important;
  letter-spacing:.18em!important;line-height:1.4!important;text-transform:uppercase;
}

/* ---- One tab's panel, across both columns of the second row ----
   ALL THREE PANELS SHARE THE ONE CELL, the ones not chosen hidden by
   visibility (and inert, so neither focus nor a screen reader reaches them).
   The row is then as tall as the tallest tab, and the card keeps one height
   whichever tab is open; with display:none it grew 30px when the second
   tab's title took three lines. */
.at-sat__panel{
  grid-area:2 / 1 / 3 / 3;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,34%);
  column-gap:clamp(32px,6cqw,110px);align-items:start;
}
.at-sat__panel:not([data-active]){visibility:hidden;opacity:0;pointer-events:none;}
.at-sat__panel[data-active]{animation:at-sat-in .6s cubic-bezier(.22,.61,.36,1) both;}
@keyframes at-sat-in{from{opacity:0;translate:0 10px;}to{opacity:1;translate:none;}}

/* The figures: large numbers, a caption under each, along the foot. */
.at-sat .at-sat__figs{
  grid-column:1;align-self:end;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));
  column-gap:clamp(20px,3.2cqw,56px);margin:0;padding:0;list-style:none;
}
.at-sat .at-sat__fig{margin:0;padding:0;}
.at-sat__num{
  display:block;color:#fff;font-size:clamp(56px,6.2cqw,98px);font-weight:400;
  line-height:.9;letter-spacing:-.03em;margin:0 0 clamp(14px,1.6cqw,26px);
}
.at-sat .at-sat__figName{
  margin:0 0 6px!important;color:#fff!important;
  font-size:clamp(16px,1.2cqw,19px)!important;line-height:1.3!important;letter-spacing:0!important;
}
.at-sat .at-sat__figText{
  margin:0!important;color:rgba(255,255,255,.78)!important;
  font-size:clamp(13.5px,.98cqw,15px)!important;line-height:1.5!important;max-width:30ch;
}

/* The side: the tab's heading, its intro and its button. */
.at-sat__side{grid-column:2;display:flex;flex-direction:column;align-items:flex-start;}
.at-sat .at-sat__title{
  margin:0 0 clamp(14px,1.4cqw,22px)!important;color:#fff!important;
  font-size:clamp(28px,3.1cqw,48px)!important;line-height:1.1!important;letter-spacing:-.012em!important;
}
.at-sat .at-sat__intro{
  margin:0 0 clamp(22px,2.2cqw,32px)!important;color:rgba(255,255,255,.84)!important;
  font-size:clamp(15px,1.1cqw,17px)!important;line-height:1.6!important;max-width:44ch;
}
.at-sat .at-sat__cta{
  display:inline-flex;align-items:center;gap:10px;
  min-height:var(--vxn-cta-h,46px);padding:0 var(--vxn-cta-px,28px);border-radius:var(--vxn-cta-r,999px);
  background:#fff;color:#1E3B35!important;text-decoration:none!important;white-space:nowrap;
  font-size:var(--vxn-cta-fs,14px);font-weight:var(--vxn-cta-fw,400);letter-spacing:var(--vxn-cta-ls,.01em);line-height:1;
  transition:background-color .3s ease,box-shadow .3s ease;
}
.at-sat .at-sat__cta:hover,.at-sat .at-sat__cta:focus-visible{background:#E8F1EE;color:#1E3B35!important;box-shadow:0 14px 30px -16px rgba(0,0,0,.5);}

@media(max-width:1180px){
  .at-sat__card{grid-template-columns:minmax(0,1fr);grid-template-rows:auto auto auto;min-height:0;}
  .at-sat .at-sat__head{grid-area:1 / 1;}
  .at-sat__tabs{grid-area:2 / 1;}
  .at-sat__panel{grid-area:3 / 1;grid-template-columns:minmax(0,1fr);row-gap:clamp(32px,5cqw,48px);}
  .at-sat__side{grid-column:1;grid-row:1;}
  .at-sat .at-sat__figs{grid-column:1;grid-row:2;}
}
@media(max-width:640px){
  .at-sat .at-sat__tab{min-height:38px;padding:0 14px!important;font-size:13px!important;}
  .at-sat .at-sat__figs{grid-template-columns:minmax(0,1fr);row-gap:26px;}
  .at-sat__num{font-size:48px;margin-bottom:10px;}
}
@media(prefers-reduced-motion:reduce){
  .at-sat__panel{animation:none;}
}
`;

export default function SolutionSatin({
  head,
  texture,
  tabs,
}: {
  head: string;
  texture: string;
  tabs: SatinTab[];
}) {
  const [active, setActive] = useState(0);
  const uid = useId().replace(/:/g, '');
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const select = (i: number, focus = false) => {
    const n = (i + tabs.length) % tabs.length;
    setActive(n);
    if (focus) tabRefs.current[n]?.focus();
  };

  const onKey = (event: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const moves: Record<string, number> = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 };
    if (event.key in moves) {
      event.preventDefault();
      select(moves[event.key], true);
    }
  };

  return (
    <section className="at-sat" aria-labelledby={`${uid}-head`}>
      <style dangerouslySetInnerHTML={{ __html: SATIN_CSS }} />
      <div className="at-in">
        <div className="at-sat__wrap">
          <div className="at-sat__card">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="at-sat__texture" src={texture} alt="" loading="lazy" aria-hidden="true" />
            <span className="at-sat__scrim" aria-hidden="true" />

            <div className="at-sat__tabs" role="tablist" aria-labelledby={`${uid}-head`}>
              {tabs.map((t, i) => (
                <button
                  key={t.tab}
                  ref={(el) => {
                    tabRefs.current[i] = el;
                  }}
                  type="button"
                  role="tab"
                  id={`${uid}-tab-${i}`}
                  className="at-sat__tab"
                  aria-selected={i === active}
                  aria-controls={`${uid}-panel-${i}`}
                  tabIndex={i === active ? 0 : -1}
                  onClick={() => select(i)}
                  onKeyDown={(e) => onKey(e, i)}
                >
                  {t.tab}
                </button>
              ))}
            </div>

            <h2 className="at-sat__head" id={`${uid}-head`}>
              {head}
            </h2>

            {tabs.map((t, i) => (
              <div
                key={t.tab}
                className="at-sat__panel"
                role="tabpanel"
                id={`${uid}-panel-${i}`}
                aria-labelledby={`${uid}-tab-${i}`}
                data-active={i === active ? '' : undefined}
                inert={i !== active}
              >
                <div className="at-sat__side">
                  {t.title ? <h3 className="at-sat__title">{t.title}</h3> : null}
                  <p className="at-sat__intro">{t.intro}</p>
                  <a className="at-sat__cta" href={t.cta.href}>
                    {t.cta.label}
                    <CtaArrow />
                  </a>
                </div>
                <ol className="at-sat__figs">
                  {t.items.map((it, k) => (
                    <li className="at-sat__fig" key={it.key}>
                      <span className="at-sat__num" aria-hidden="true">
                        {String(k + 1).padStart(2, '0')}
                      </span>
                      <h4 className="at-sat__figName">{it.name}</h4>
                      <p className="at-sat__figText">{it.text}</p>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
