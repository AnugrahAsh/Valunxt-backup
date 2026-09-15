/**
 * The UAE service page template — /en-ae/services/<service>/, all six.
 *
 * ONE COMPONENT, SIX CONTENT MODULES. This began as the Accounting & Tax page,
 * written as its own body because the client's fifteen-section document did
 * not fit the shared five-section template. The client then asked for the
 * other five services to take the same page — every section, every plate, the
 * same footer — with only the words changed. So the body became this: a
 * component that reads a ServiceTemplateContent (see ./types.ts) and renders
 * the page, and a content module per service under ../<service>/content.ts.
 * The `at-` class prefix is that history; it is the template's prefix now.
 *
 * SECTION ORDER IS FROM THE SOURCE DOCUMENT, not chosen here: hero, the
 * proposition, then the sub-service strip — "the commercial centre of the
 * page" — the chooser, the banner, the related services and the close. "Do
 * not allow generic education to push the services down the page."
 *
 * ---------------------------------------------------------------------------
 * THE VISUAL SYSTEM
 *
 * 1. ARTWORK, NOT COLOUR, CARRIES THE DARK BANDS. Every plate is on .at-zoom,
 *    so it scales and drifts against the scroll — see Motion.tsx. A plate that
 *    moves is what stops a full-bleed band reading as a rectangle of paint.
 *
 * 2. ONE SPACING SCALE. --pad, --gap, --cardpad and --radius are declared once
 *    on .at-root and every section reads them, so no two grids can drift apart
 *    and the rhythm down the page is even at all three breakpoints.
 *
 * ---------------------------------------------------------------------------
 * HOVER MOVES NOTHING
 *
 * Every hover state here changes colour, light or coverage — never position.
 * There is no `transform` under any `:hover` rule in this file, deliberately:
 * a strip of eight panels that each jump 5px on approach is restless to read,
 * and on a trackpad it flickers as the pointer crosses a gap. What replaced it:
 *
 *   the texture      a plate already inside the card, fading up from 0
 *   the arrow        the link's own `gap` opens, so the glyph travels without
 *                    a transform on anything
 *
 * ---------------------------------------------------------------------------
 * MOTION, and the rule that matters most
 *
 *   hover        CSS only. Never gated on JavaScript.
 *   reveal       Motion.tsx, by selector. The stylesheet's default is VISIBLE;
 *                the hidden state exists only under [data-anim='pending'],
 *                which that file sets — so a failed bundle cannot produce a
 *                blank page. See its header for the rest of the guards.
 *   plates       .at-zoom, also Motion.tsx: one rAF loop writing --at-z and
 *                --at-p, which this stylesheet turns into scale and drift.
 *
 * TYPE AND !IMPORTANT. The Elementor kit styles bare h2/h3/p at a specificity
 * these classes cannot reach on their own, which is why every type declaration
 * below is marked. Same reason ServicePageBody marks its own.
 *
 * THE STYLESHEET IS A TEMPLATE LITERAL. A backtick anywhere inside it — in a
 * comment quoting a property, say — ends the string and the build fails with
 * "Expected a semicolon". Properties in the comments below are written bare
 * for that reason.
 */
import type { ComponentType } from "react";
import CtaArrow from '@/components/ui/CtaArrow';
import type React from "react";

import Html from "@/components/Html";
import { rurl, vxnServiceName, vxnServices } from "@/lib/region";
import { rimgFirst } from "@/lib/region-assets";
import ExploreDeck from "./ExploreDeck";
import ServiceTemplateMotion from "./Motion";
import SolutionSatin from "./SolutionSatin";
import type { ServiceTemplateContent, TemplateSub } from "./types";

/**
 * A photograph per service line, for the related cards in section 4.
 *
 * NOT Service.img FROM THE REGISTRY. That field points at the full-bleed
 * original each service page opened with under the old template, and those
 * files are enormous — valuation-and-advisory.webp alone is 2.3MB at 6206px
 * wide. Three of them behind three 640x172 cards would be most of the page's
 * weight for a postage stamp each.
 *
 * The library files below are 24KB-406KB and 1024-1920px. Same candidate
 * convention as everything else, so dropping a properly cropped
 * services/at-related-<slug>.webp in replaces the stand-in with no code
 * change. Shared by every page on the template because every page shows three
 * of the other five; a service line with no entry still renders — it falls
 * through to its registry image, heavy but not missing.
 */
export const RELATED_FIGURE: Record<string, string[]> = {
  "accounting-tax-services": [
    "services/at-related-accounting-tax-services.webp",
    "new-folder/who-we-are-2.webp",
  ],
  "real-estate-transactions": [
    "services/at-related-real-estate-transactions.webp",
    "new-folder/real-estate-wealth-advisory-1.webp",
  ],
  "mortgages-services": [
    "services/at-related-mortgages-services.webp",
    "new-folder/houzzhunt-mortgage-1.webp",
  ],
  "valuation-and-advisory": [
    "services/at-related-valuation-and-advisory.webp",
    "new-folder/reliant-surveyors-2.webp",
  ],
  "research-intelligence": [
    "services/at-related-research-intelligence.webp",
    "new-folder/research-intelligence-1.webp",
  ],
  "technology-data-ai": [
    "services/at-related-technology-data-ai.webp",
    "new-folder/technology-ai-1.webp",
  ],
};

/**
 * The Elementor element ids of the "Find the Right Solution" block, per tab.
 *
 * THE BLOCK IS THE HOME PAGE'S SECTION, and post-17.css styles it BY ID:
 * `.elementor-17 .elementor-element.elementor-element-b39c796 { --width: 370px }`
 * and so on for every container and heading in it. The markup below therefore
 * has to carry these exact ids to be styled at all, which is why they are a
 * table rather than something generated.
 *
 * WHY IT CAN BE A LOOP. Read across the three tabs, the rules are the same
 * rule three times: every item block is flex, zero gap, 370px wide; every
 * name carries the accent_1 left rule and every line under it the accent_7
 * one. The ids differ, the styling does not. So a tab with fewer items than
 * ids simply renders fewer, and one with more than the table holds reuses its
 * last set — a duplicate data-id is not a DOM id and nothing reads it. The
 * home page had three items in the third tab (a55c103); its heading ids were
 * never captured, so that slot reuses the second item's.
 *
 * The first tab's right-hand pane wraps its blur layers in template 7162, the
 * other two carry them inline. Both shapes are kept as captured.
 */
type TabIds = {
  panel: string;
  col: string;
  intro: string;
  spacer: string;
  items: [string, string, string][];
  pane: string;
  abs: string;
  /** Inline blur-layer ids, or null for the tab that uses template 7162. */
  blur: string[] | null;
  btn: string;
};

const SOLUTION_IDS: TabIds[] = [
  {
    panel: "2c53b5e",
    col: "304a6aa",
    intro: "ebee893",
    spacer: "013bb2d",
    items: [
      ["b39c796", "8bd2e78", "fb1cbfe"],
      ["76e2ddb", "088c3c8", "3669349"],
      ["1b6f08c", "860873a", "d6dd169"],
    ],
    pane: "aa3aa17",
    abs: "c645356",
    blur: null,
    btn: "d48003c",
  },
  {
    panel: "b09ef26",
    col: "1f65f56",
    intro: "f17fe4b",
    spacer: "0613e1d",
    items: [
      ["6f77473", "62bf561", "3fd1366"],
      ["c4d2bf3", "a8c50aa", "606e001"],
      ["1cf2afa", "27dcb8b", "e2fb95b"],
    ],
    pane: "b12020e",
    abs: "4bec2ed",
    blur: ["c0a24aa", "8c08fe0", "acc151c", "b133692", "83dbc33", "11b87a4"],
    btn: "369ca21",
  },
  {
    panel: "8c8b5b0",
    col: "9cbfb46",
    intro: "70aeb57",
    spacer: "e1c4161",
    items: [
      ["7b2bedd", "43e1c5b", "91573d5"],
      ["25d7ebe", "713a3f8", "ccb9733"],
      ["a55c103", "713a3f8", "ccb9733"],
    ],
    pane: "9106445",
    abs: "a43d0e7",
    blur: ["8578008", "0eb77e5", "23dfb15", "a8bfe90", "a5886a5", "530e76b"],
    btn: "0a6c708",
  },
];

/** The blur layers template 7162 renders inside the first tab's pane. */
const TEMPLATE_BLUR = ["37bc217", "7aa6fbd", "5500eb5", "ba4229b", "0df9fbc"];

/**
 * EXPORTED (20260911) for the UAE services index, UaeServicesBody, which
 * opens on this template's hero and sets its sections in this template's
 * kicker, headings, buttons and reveal rules, so the index and the six pages
 * it indexes read as one section of the site. The whole sheet goes with it
 * rather than a hero-only extract: every rule is scoped to .at-root or an
 * at- class, so the unused ones are inert there, and one copy of the hero is
 * one place to change it.
 */
export const CSS = `
.at-root{
  /* Palette */
  --ny:#0E355F;
  --ny2:#0B2DBE;
  --ny3:#08248F;
  --body:#4d5863;
  --muted:#6A7590;
  --gold:#F5B301;
  /* The supplied brand ramp. Everything blue in the service strip is painted
     with this one gradient — the description card, the number badges and the
     filled arrow — so the section reads as one colour rather than as three
     flat blues that happen to be near each other. */
  --brand:linear-gradient(150deg,#0E3FA8 0%,#1436D8 48%,#0B2DBE 100%);
  --line:rgba(14,53,95,.12);
  --line2:rgba(14,53,95,.08);
  --tint:#F4F8FD;
  --tint2:#EDF3FB;

  /* One spacing scale for the whole page. Every section, grid and card reads
     these, so nothing can drift out of step with anything else.

     40px, flat, at every width — the UAE services house rule. The horizontal
     gutter lives on the inner wrapper, so 0 here cannot let copy touch the
     edge. The measure is the UAE home page's: 1520 with clamp(16px,4vw,48px)
     either side, so these pages' bands line up with the home's when a visitor
     moves between them. See .at-in for why the formula matters as much as the
     number. */
  --pad:40px;
  --gutter:clamp(16px, 4vw, 48px);
  --maxw:1520px;
  --gap:24px;
  --cardpad:24px;
  --radius:18px;
  --headgap:44px;

  background:#fff;
}
/* border-box across the page. Without it --maxw sets the CONTENT box and the
   gutter is added outside it, so a 1280 container measured 1328 and no two
   things that declared the same width actually shared an edge. This is the
   single declaration that makes "equal width" true rather than approximately
   true. */
.at-root,.at-root *,.at-root *::before,.at-root *::after{box-sizing:border-box;}

.at-root section{padding:var(--pad) 0;}
/* The one container. Every band on the page uses it or copies it exactly.

   THE GUTTER IS SUBTRACTED FROM THE MEASURE, not padded inside it. That is the
   home page's own formula (see the .vxn-ae-home block in valunxt-landing.css),
   and copying the 1520 without copying the formula is what leaves two pages
   misaligned: padding inside a 1520 box centres the BOX and then insets the
   content, so at a 1600 viewport the copy starts at 81px instead of 48px.
   Subtracting centres the CONTENT, which is what has to line up. */
.at-in{
  width:100%;max-width:min(var(--maxw),calc(100% - var(--gutter) * 2));margin:0 auto;padding:0;
}

/* ==========================================================================
   PLATES — the shared artwork layer.

   One class for every plate on the page. It is always absolutely positioned,
   always object-fit:cover, and always driven by Motion.tsx: --at-z scales it
   and --at-p drifts it, so the artwork moves against the scroll while the copy
   over it stays where it was set. The --throw each plate declares is how far
   it drifts — a full-bleed band can take 26px without showing its edge; a
   plate inside a 280px card cannot.
   ========================================================================== */
.at-plate{
  position:absolute;inset:calc(var(--throw,18px) * -1) 0;
  width:100%;height:calc(100% + var(--throw,18px) * 2);
  object-fit:cover;pointer-events:none;
  z-index:-2;
}
.at-zoom{
  transform:translate3d(0,calc(var(--at-p,0) * var(--throw,18px)),0) scale(var(--at-z,1));
  transform-origin:center;
  will-change:transform;
}

/* ---- Shared type -------------------------------------------------------- */
/* The eyebrow. It was a rule and a word — the same mark the rest of the site
   uses, which made every section on this page open the same anonymous way. It
   is a badge now: a tinted pill with a lit dot, so a section label reads as an
   object rather than as a line of small caps floating above the heading. */
.at-kicker{
  display:inline-flex;align-items:center;gap:9px;
  padding:7px 15px 7px 12px!important;border-radius:999px;
  background:rgba(0,83,183,.07);border:1px solid rgba(0,83,183,.18);
  font-size:11px!important;font-weight:700!important;letter-spacing:.15em!important;
  text-transform:uppercase;color:var(--ny2)!important;margin:0 0 18px!important;
}
.at-kicker::before{
  content:"";flex:0 0 auto;width:7px;height:7px;border-radius:50%;
  background:currentColor;box-shadow:0 0 0 3px rgba(0,83,183,.14);
}
.at-h2{
  font-weight:400!important;
  color:var(--ny)!important;
  font-size:clamp(28px,3.4vw,42px)!important;line-height:1.13!important;
  margin:0 0 16px!important;max-width:38ch;
}
.at-lede{
  color:var(--body)!important;font-size:17px!important;line-height:1.7!important;
  margin:0 0 10px!important;max-width:76ch;
}
.at-sec__head{margin-bottom:var(--headgap);}
/* ---- Buttons ------------------------------------------------------------
   THE ONE CTA (20260911): the site's geometry from the tokens in
   valunxt-brand.css (46px tall, 28px sides, 14px/600, a full pill) and its
   gradient. The hover is the site's wedge, which that sheet applies to
   .at-btn; the gap still opens so the arrow travels with it. */
.at-btn{
  display:inline-flex;align-items:center;gap:10px;
  min-height:var(--vxn-cta-h,46px);padding:0 var(--vxn-cta-px,28px);border-radius:var(--vxn-cta-r,999px);
  font-size:var(--vxn-cta-fs,14px);font-weight:var(--vxn-cta-fw,400);letter-spacing:var(--vxn-cta-ls,.01em);
  line-height:1;text-decoration:none!important;
  transition:background-color .25s ease,color .25s ease,border-color .25s ease,
             box-shadow .3s ease;
}
.at-btn--solid{
  background-image:var(--vxn-cta-grad);background-color:var(--vxn-cta-ink,#0B2DBE);
  color:#fff!important;border:1px solid transparent;
  --vxn-cta-sweep:var(--vxn-cta-sweep-dark,#08248F);
}
.at-btn--solid:hover{color:#fff!important;box-shadow:0 14px 30px -14px rgba(0,64,140,.7);}
/* The intro band's second button: the outline, which the wedge fills with the
   gradient. The page is down to two button finishes. */
.at-btn--line{
  background:transparent;color:var(--vxn-cta-ink,#0B2DBE)!important;border:1px solid rgba(11,45,190,.35);
  --vxn-cta-sweep:var(--vxn-cta-grad);
}
.at-btn--line:hover{border-color:transparent;color:#fff!important;}

/* ==========================================================================
   HERO — a photograph, and the copy at its foot.

   Built to the accounting-bookkeeping sub-page's banner on client feedback,
   and to the pixel: the same plate treatment, the same two scrims, the same
   four-layer blur rising out of the bottom edge, the same crumb, title and
   lede at the same sizes. The blue ramp and the masked sculpture this band
   carried before are gone with it.

   THE PLATE is a full-bleed photograph on .at-zoom, so Motion.tsx drifts and
   scales it against the scroll the way it does every other plate here; the
   16px throw is the sub-page's. Two scrims in one paint: a wash from the left
   so the copy has a dark ground whatever the photograph is doing under it,
   and a lift from the foot so the blur has something to dissolve into.

   THE BLUR FROM THE BOTTOM is four stacked backdrop-filters, each masked to
   start lower than the one before, so the strength the reader sees ramps from
   nothing to 22px at the bottom edge — a single masked backdrop-filter can
   only fade one strength in and out. It sits UNDER the copy in the z-order,
   and the band's bottom padding keeps the copy clear of it, so the text is
   never the thing being blurred. The wash over it is what hands the band to
   the white section beneath instead of a hard edge; a gradient rather than a
   solid, so a browser without backdrop-filter still gets a soft foot.

   The band is sized by min-height and its own padding, so the 40px section
   rule the rest of the page runs on would only add a seam here. The padding
   is marked because .at-root section is (0,1,1) and this is (0,1,0).
   ========================================================================== */
.at-hero{
  position:relative;isolation:isolate;overflow:hidden;
  display:flex;align-items:flex-end;
  min-height:clamp(500px,72vh,680px);
  padding:clamp(96px,14vh,150px) 0 clamp(104px,15vh,158px)!important;
  background:#07142f;
}
.at-hero__media{position:absolute;inset:0;z-index:0;overflow:hidden;}
.at-hero__media img{
  --throw:16px;
  display:block;width:100%;height:100%;
  object-fit:cover;object-position:50% 46%;
}
.at-hero__scrim{
  position:absolute;inset:0;z-index:1;pointer-events:none;
  background:
    linear-gradient(100deg,rgba(4,14,36,.82) 0%,rgba(4,14,36,.58) 36%,rgba(4,14,36,.2) 66%,rgba(4,14,36,0) 92%),
    linear-gradient(to top,rgba(4,14,36,.42) 0%,rgba(4,14,36,0) 42%);
}
/* The blur stack and the wash are no longer rendered by the six main
   service heroes (client, 20260914) — the rules stay because the UAE services
   index and the UAE free-consultation page import this sheet and still emit
   both layers. On the six services they are simply unused. */
.at-hero__blur{
  position:absolute;right:0;bottom:0;left:0;z-index:2;
  height:clamp(150px,24%,230px);pointer-events:none;
}
.at-hero__blur i{position:absolute;inset:0;display:block;}
.at-hero__blur i:nth-child(1){
  -webkit-backdrop-filter:blur(2px);backdrop-filter:blur(2px);
  -webkit-mask-image:linear-gradient(to bottom,rgba(0,0,0,0) 0%,#000 24%);
          mask-image:linear-gradient(to bottom,rgba(0,0,0,0) 0%,#000 24%);
}
.at-hero__blur i:nth-child(2){
  -webkit-backdrop-filter:blur(5px);backdrop-filter:blur(5px);
  -webkit-mask-image:linear-gradient(to bottom,rgba(0,0,0,0) 22%,#000 47%);
          mask-image:linear-gradient(to bottom,rgba(0,0,0,0) 22%,#000 47%);
}
.at-hero__blur i:nth-child(3){
  -webkit-backdrop-filter:blur(11px);backdrop-filter:blur(11px);
  -webkit-mask-image:linear-gradient(to bottom,rgba(0,0,0,0) 45%,#000 70%);
          mask-image:linear-gradient(to bottom,rgba(0,0,0,0) 45%,#000 70%);
}
.at-hero__blur i:nth-child(4){
  -webkit-backdrop-filter:blur(22px);backdrop-filter:blur(22px);
  -webkit-mask-image:linear-gradient(to bottom,rgba(0,0,0,0) 68%,#000 92%);
          mask-image:linear-gradient(to bottom,rgba(0,0,0,0) 68%,#000 92%);
}
.at-hero__wash{
  position:absolute;right:0;bottom:0;left:0;z-index:2;
  height:clamp(150px,24%,230px);pointer-events:none;
  background:linear-gradient(to bottom,rgba(255,255,255,0) 0%,rgba(255,255,255,.05) 42%,rgba(255,255,255,.22) 74%,rgba(255,255,255,.6) 100%);
}
/* Same measure as .at-in, so the banner's copy starts on the same vertical
   line as every section under it. */
.at-hero__inner{
  position:relative;z-index:3;width:100%;
  max-width:min(var(--maxw),calc(100% - var(--gutter) * 2));margin:0 auto;padding:0;
}
.at-hero__crumb{
  display:flex;flex-wrap:wrap;align-items:center;gap:8px;
  margin:0 0 22px;font-size:12px;letter-spacing:.06em;text-transform:uppercase;
  color:rgba(255,255,255,.62);
}
.at-hero__crumb a{color:rgba(255,255,255,.62)!important;text-decoration:none!important;transition:color .3s ease;}
.at-hero__crumb a:hover{color:#fff!important;}
.at-hero__crumb span[aria-hidden]{opacity:.5;}
/* Scoped to .at-root so it beats the UAE type scale, the same reason as the
   intro head below. The weight is the scale's 500 on every heading. */
/* 70% of the measure, on client instruction (20260911): the headline wraps to
   two lines instead of running the whole width in one. Full width again under
   820px, with the lede. */
.at-root .at-hero__head{
  max-width:70%;
  margin:0 0 24px!important;color:#fff!important;
  font-size:clamp(42px,6.2vw,62px)!important;line-height:1.03!important;
  letter-spacing:-.022em!important;
}
.at-hero__sub{
  max-width:50%;margin:0!important;
  font-size:clamp(13.5px,1.02vw,15.5px)!important;font-weight:400;line-height:1.78!important;
  color:rgba(255,255,255,.86)!important;
}

/* ==========================================================================
   THE INTRO BAND — the proposition, stated.

   A head-and-lede row over a two-rail body: the statement on the left and its
   description on the right, then the commercial points as a ruled list on the
   left with the photograph filling the right.

   THE HEAD ROW IS TWO COLUMNS, NOT A CENTRED BLOCK — on client feedback. It
   was a 760px centred stack, heading over paragraph. It is now the heading in
   the left column and the paragraph in the right, bottom-aligned so the
   paragraph's last line sits on the heading's baseline row and the two read
   as one line across the band. The paragraph is pushed to its column's far
   edge so the row spans the whole measure — the same construction as the head
   of the home page's "Ready when you are" band.

   WHY THE HEAD IS LIGHT AND THE TERMS UNDER IT ARE NOT. The head is set at 300
   at display size — one thin statement across the top of the band — and the
   point titles under it sit at the body weight. That is the contrast the band
   is built on: the statement is light and wide, the terms under it are solid
   and small.

   THE LIST IS RULED TOP AND BOTTOM. Each point owns its top rule and the list
   owns the last one, so four points read as a stated set rather than as four
   loose paragraphs — and a fifth needs no change to the closing rule.

   THE RAILS STRETCH. align-items:stretch, and the figure is sized by the copy
   beside it — see .at-intro__figure — so the photograph runs to the same
   bottom line as the buttons however long the notes turn out to be.
   ========================================================================== */
/* Height and measure both cut on client feedback. This band was the tallest
   on the page and ran the full 1520 the rest of it uses, which is more measure
   than a four-item list beside one photograph needs. The narrower box is on
   .at-intro .at-in only — every other band keeps the page measure. */
.at-intro{
  background:#fff;
  padding:clamp(34px,3.8vw,54px) 0 clamp(36px,4vw,58px)!important;
}
/* ONE MEASURE (20260912, client instruction): this band took a 1140 box of
   its own for a while; every band on the page now shares .at-in, so the
   list and the photograph line up with the strip below and the hero above
   at every width. */
/* CENTRED (20260912, to the reference supplied that afternoon): the
   statement on two lines over its gloss, both on the band's centre line, and
   the list and the photograph under them. The head row was a statement on
   the left with the gloss on the right; the reference stacks them. */
.at-intro__top{
  display:flex;flex-direction:column;align-items:center;text-align:center;
  gap:16px;
  margin:0 0 clamp(40px,5.2vw,76px);
}
/* Scoped to .at-root so it beats the UAE type scale. valunxt-uae-type.css sets
   "body.vxn-uae-type h2" at (0,1,2) with !important; a bare .at-intro__head is
   (0,1,0) and lost, so this heading rendered at the scale's 42px however it was
   written here. (0,2,0) clears it — which is the escape hatch that type sheet
   documents for a heading a page sizes on purpose. */
.at-root .at-intro__head{
  font-weight:300!important;
  color:#16233C!important;font-size:clamp(30px,3.5vw,48px)!important;
  line-height:1.24!important;letter-spacing:-.01em!important;margin:0!important;
  max-width:70%;
}
/* text-wrap:pretty keeps a lone word off the last line. */
.at-intro__lede{
  color:var(--muted)!important;font-size:16px!important;line-height:1.6!important;
  margin:0!important;max-width:78ch;text-wrap:pretty;
}
/* The reference's columns: the list a little wider than the photograph, and
   a wide gutter between them, about a tenth of the measure. */
.at-intro__grid{
  display:grid;grid-template-columns:minmax(0,1.04fr) minmax(0,.96fr);
  gap:clamp(32px,7.5vw,120px);align-items:stretch;
}
.at-intro__copy{display:flex;flex-direction:column;}
.at-intro__points{
  margin:0;padding:0;list-style:none;border-bottom:1px solid var(--line);
}
.at-intro__point{
  position:relative;border-top:1px solid var(--line);
  padding:20px 0 24px 24px;
}
/* The reference's marker: a small square in the brand's gold, set on the
   title's first line. (It was a blue dot on 20260911's instruction; the
   reference supplied on 20260912 draws the square, so the square is back.
   One line to change if the dot is wanted after all.) */
.at-intro__point::before{
  content:"";position:absolute;left:0;top:28px;width:8px;height:8px;
  border-radius:1px;background:#0b2dbe;
}
/* The title. The reference sets its own in a serif; the UAE market runs one
   face, Sanomat Sans, on client instruction (20260910, valunxt-uae-face.css),
   so the size and the weight carry the reference's emphasis instead. Two
   classes, over the h3 scale (27px). */
.at-root .at-intro__label{
  font-weight:400!important;
  color:#1F2933!important;font-size:21px!important;line-height:1.3!important;
  letter-spacing:0!important;text-transform:none!important;margin:0 0 8px!important;
}
.at-intro__note{
  color:var(--muted)!important;font-size:14px!important;line-height:1.55!important;
  margin:0!important;
}
/* THE PHOTOGRAPH MUST NOT SET THE ROW HEIGHT. As an in-flow child with
   height:100% against an auto-height figure, an image resolves to its own
   intrinsic height, so a near-square plate asked the grid for more than the
   copy needed and align-items:stretch handed the copy the difference as empty
   space under the buttons.

   Taking the image out of flow removes the figure's content height entirely:
   the row is sized by the copy, the figure stretches to match it exactly, and
   object-fit:cover crops the plate to whatever that comes to. The two columns
   are equal by construction rather than by coincidence — nothing here needs
   revisiting when the list gains or loses a point.

   min-height is the floor for the case the copy ever gets very short; the two
   narrow breakpoints below swap it for an aspect-ratio, which still works
   because a figure with no in-flow content is exactly what aspect-ratio sizes. */
.at-intro__figure{
  position:relative;margin:0;overflow:hidden;border-radius:0;min-height:300px;
}
.at-intro__figure img{
  position:absolute;inset:0;display:block;width:100%;height:100%;
  object-fit:cover;object-position:center 28%;
}

/* ==========================================================================
   THE CHOOSER TAKES THE PAGE MEASURE (20260912, client instruction: one
   container width for every section). post-17.css gives its outer container
   a 1400px content width and 30px side padding (20px below 1024), so the
   chooser sat 60px inside the other bands at 1920 and 18px outside them at
   1280. The two custom properties Elementor reads are set here to the same
   formula .at-in uses; nothing else about the captured markup changes.
   ========================================================================== */
.at-root .elementor-17 .elementor-element.elementor-element-d50462f{
  --padding-left:0px!important;--padding-right:0px!important;
  --content-width:min(var(--maxw),calc(100% - var(--gutter) * 2))!important;
}

/* ==========================================================================
   THE CHOOSER'S PANES HOLD ONE HEIGHT.

   The right-hand pane of each tab is an Elementor container with no height
   of its own on desktop: the tab row is a flex row, so the pane is as tall as
   the list beside it. Its blur bars are an absolutely positioned child
   anchored to the pane's foot and 340-390px tall (post-17.css, c645356 /
   4bec2ed / a43d0e7 and their children). On the home page every tab lists
   three items, the row is 480px and the bars fit. A tab with one item — Real
   Estate's three, Mortgages' "Business Property" — makes a 242px row, and the
   bars ran 150px above the pane's top edge, across the tab titles.

   Measured on /mortgages-services/ tab 2: pane 455 -> 697, bars from 307.

   So the pane gets the height the home page's rows come to, and clips. Every
   tab's pane is then the same size whatever it lists, which also stops the
   section changing height as the reader moves between tabs. Written at
   (0,5,0) to clear post-17's (0,3,0); above 1024 only, because below that the
   captured sheet stacks the pane under the list and gives it 60vh itself.
   ========================================================================== */
@media(min-width:1025px){
  .at-root .elementor-17 .e-n-tabs-content > [role="tabpanel"] > .e-con-full:last-child{
    min-height:480px;overflow:hidden;
  }
}

/* ==========================================================================
   THE BANNER — the reference card.

   One rounded card split down the middle: the brand ramp and three things on
   the left — a heading, a paragraph and a button — a plate on the right. That
   is the whole section, and it is drawn short and wide: anything that has to
   be said here has to fit a heading and about forty words, or the shape is
   gone.

   THE BUTTON IS PINNED, NOT SPACED. margin-top:auto on .at-prob__cta is what
   puts it on the panel's bottom edge with the gap opening above it. A margin
   instead would leave it floating under the paragraph at one card height and
   detached at another.

   THE SPLIT IS 50/50 AND HARD, by request — the ramp fills the left column,
   the plate fills the right, and the join is the column edge. IF A BLEND IS
   EVER WANTED BACK, feather the plate's left edge with a mask rather than
   painting a matching colour over it: --brand is a 150deg ramp, so the colour
   at the column edge changes down its height, and no single flat blue can
   match it; the first attempt at this card tried exactly that and the join
   showed as a faint vertical line.
   ========================================================================== */
/* Taller on client feedback: was clamp(250px,25vw,360px), a 350px card at 1400
   and the 360 cap at the client's 1900. The floor is what sets the height —
   the copy needs about 230px — so this is the number to move, and the panel's
   padding goes up with it so the copy does not sit in one corner of the room
   it was given. */
.at-prob__card{
  display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);
  overflow:hidden;border-radius:14px;
  background:var(--brand);
  min-height:clamp(320px,31vw,460px);
}
.at-prob__panel{
  display:flex;flex-direction:column;
  padding:clamp(30px,3.6vw,56px);
}
/* Half gradient, half picture, and the join is the column edge. It carries no
   background of its own so the card's ramp shows while the plate is still
   loading — after that the plate covers this column completely. */
.at-prob__art{position:relative;isolation:isolate;overflow:hidden;}
.at-prob__art .at-plate{
  --throw:20px;opacity:1;
  /* A small saturation lift and nothing else: dimming a plate whose lightness
     IS the contrast would only flatten the card. */
  filter:saturate(1.06);
}
/* Only a little larger than the paragraph under it: the reference sets both
   at nearly one size, and that restraint is most of why the card reads as a
   banner rather than as another section opening. */
.at-prob__head{
  font-weight:500!important;color:#fff!important;
  font-size:clamp(19px,1.9vw,26px)!important;line-height:1.32!important;
  letter-spacing:-.005em!important;margin:0 0 15px!important;max-width:26ch;
}
.at-prob__body{
  color:rgba(255,255,255,.85)!important;font-size:13.5px!important;line-height:1.72!important;
  margin:0!important;max-width:52ch;
}
/* THE BUTTON, redrawn on client feedback. It was a pale-blue pill with an
   11.5px tracked small-caps label, pinned to the panel's bottom-right; on a
   card this tall it read as a footnote in the wrong corner. It is now a white
   pill at the page's own button size — 15px/600, the same as .at-btn — with
   the arrow in a filled brand-blue disc at its end, the construction the home
   page's subscribe and hero buttons use. Hover: the pill tints, the disc goes
   navy and the gap opens — colour and spacing, no movement, like every other
   hover on this page.

   IT SITS ON THE COPY'S LEFT EDGE, not the panel's right. Still pinned to the
   foot with margin-top:auto, so the gap still opens above it as the card
   grows; only the horizontal anchor changed. align-self:flex-end puts it back
   in the corner if that is wanted. */
/* The one CTA (20260911) in its inverse finish, white on the photograph, at
   the site's 46px (7px of pill either side of a 32px chip) and 14px/600. It
   keeps its chip and its 26px label inset because the chip is the arrow. The
   wedge is the site's, in the pale value an inverse pill takes. */
.at-prob__cta{
  align-self:flex-start;margin-top:auto;
  display:inline-flex;align-items:center;gap:10px;
  min-height:var(--vxn-cta-h,46px);padding:0 var(--vxn-cta-px,28px);border-radius:var(--vxn-cta-r,999px);
  background:#fff;color:var(--vxn-cta-ink,#0B2DBE)!important;
  font-size:var(--vxn-cta-fs,14px);font-weight:var(--vxn-cta-fw,400);letter-spacing:var(--vxn-cta-ls,.01em);line-height:1;
  text-decoration:none!important;white-space:nowrap;
  box-shadow:0 16px 36px -20px rgba(3,14,58,.7);
  --vxn-cta-sweep:var(--vxn-cta-sweep-light,#EAF0FF);
  transition:background-color .3s ease,box-shadow .3s ease;
}
.at-prob__cta:hover{box-shadow:0 20px 40px -20px rgba(3,14,58,.8);color:var(--vxn-cta-ink,#0B2DBE)!important;}

/* ==========================================================================
   THE SERVICE STRIP — the sub-services, one open.

   A hover accordion: photographic panels side by side, one expanded and
   carrying its description, the rest collapsed to a title and a number. The
   first panel is the resting state, so the strip is never a row of anonymous
   slivers.

   IT IS CSS ONLY, and which panel is open is three selectors:

     .at-acc__panel:first-child                          resting
     .at-acc:hover .at-acc__panel:hover                   pointer
     .at-acc:focus-within .at-acc__panel:focus-visible    keyboard

   — plus two rules between them that close the first child the moment the
   strip is pointed at or tabbed into. ORDER IS LOAD-BEARING: those closing
   rules must sit between the resting rules and the opening ones, because the
   resting rule and the closing rule carry the same specificity and the later
   one has to win.

   THE GAP IS PADDING, NOT A FLEX GAP. A flex gap is dead space: crossing it makes
   .at-acc:hover true while no panel is hovered, every panel collapses, and the
   strip flickers on the way from one panel to the next. Here the gap is
   padding-right on the panel, so the hit areas are contiguous and the pointer
   is always inside exactly one of them.

   THE OPEN PANEL'S CARD HAS A FIXED WIDTH and is clipped by the panel it sits
   in. A percentage width would re-wrap its paragraph on every frame of the
   expansion; a fixed one simply slides out from behind the panel's edge.

   The count is whatever the service publishes — eight for Accounting & Tax,
   three for Real Estate — and nothing here is written to a number. --open is
   the open panel's share in closed panels, and 3.2 holds at both ends: at
   eight the closed ones are still a readable width, and at three the open one
   is still clearly the open one.
   ========================================================================== */
.at-services{background:var(--tint);}
/* THE HEAD ROW, to the reference supplied on 20260912: a plain eyebrow and a
   large heading on the left, its last word underlined by a drawn stroke; the
   gloss and one dark pill with a white disc on the right, top-aligned with
   the heading. */
.at-services__head{
  display:grid;grid-template-columns:minmax(0,1.25fr) minmax(280px,.75fr);
  align-items:start;gap:clamp(24px,4vw,64px);margin:0 0 var(--headgap);
}
.at-services__head .at-sec__head{margin:0!important;}
/* The eyebrow is a word here, not the badge the rest of the page uses: the
   reference sets it as plain small caps. */
.at-services .at-kicker{
  background:none;border:0;padding:0!important;margin:0 0 16px!important;
  letter-spacing:.16em!important;
}
.at-services .at-kicker::before{display:none;}
.at-root .at-services__h2{
  font-size:clamp(30px,3.6vw,50px)!important;line-height:1.1!important;
  margin:0!important;max-width:20ch;
}
.at-services__aside{
  display:flex;flex-direction:column;align-items:flex-start;gap:20px;
  justify-self:end;max-width:380px;padding-top:clamp(8px,2vw,34px);
}
.at-services__lede{font-size:15.5px!important;line-height:1.55!important;margin:0!important;}
/* The call is the house pill (.at-btn--solid), on client feedback
   (20260912): the reference's disc pill was one more button shape than the
   site has. */
.at-services__cta{flex:0 0 auto;}
/* The stroke under the heading's last word: an SVG behind the word, wider
   than it on the right, drawn in over .9s once the head row has arrived.
   Visible by default; only the pending state hides it, so a blocked bundle
   leaves the heading underlined rather than bare. */
.at-swash{position:relative;display:inline-block;white-space:nowrap;isolation:isolate;}
.at-swash__ink{
  position:absolute;left:-2%;bottom:-.16em;width:118%;height:.42em;
  z-index:-1;overflow:visible;color:#9DC1F5;
}
.at-swash__ink path{stroke-dasharray:1;stroke-dashoffset:0;}
.at-sec__head[data-anim='pending'] .at-swash__ink path{stroke-dashoffset:1;}
.at-sec__head[data-anim='in'] .at-swash__ink path{
  animation:at-swash-draw .9s cubic-bezier(.22,.61,.36,1) .5s both;
}
@keyframes at-swash-draw{from{stroke-dashoffset:1;}to{stroke-dashoffset:0;}}

.at-acc{
  /* 4.4, not 3.2 (20260912): the open panel is a card of copy beside a
     photograph now and needs the room; at eight panels the closed ones are
     still 117px, enough for one line of their name set on its side. */
  --open:4.4;

  /* ---- THE TIMING, IN ONE PLACE --------------------------------------
     --ease is a long deceleration (an ease-out quint): it leaves fast and
     lands slowly, which is what makes a width change read as a panel opening
     rather than as a layout jump.

     THE TWO DIRECTIONS ARE NOT THE SAME LENGTH. Every piece of content in here
     fades OUT quickly and with no delay, and fades IN slowly and after one.
     The fast, no-delay transition is the BASE rule, and the slow delayed one
     is set on the open-state rules only. A transition runs with the value the
     element has in the state it is moving TO, so an element gaining the open
     rule takes the slow curve and an element losing it falls back to the fast
     one. No JavaScript and no duplicate keyframes.

     The open sequence is deliberately staggered — panel, then card at .42s,
     then the link at .62s — so the three arrive in the order you read them.

     WHY IT IS ALSO CHEAPER THAN IT LOOKS. A flex-grow transition is layout
     work on every frame; the dim on a closed panel is an opacity-animated
     overlay (.at-acc__inner::after) rather than a filter on the photograph,
     and contain:layout paint stops a panel's repaint at its own edge.
     will-change on the image is applied only while the strip is engaged, so
     the photographs are not each holding a promoted layer at rest. */
  --ease:cubic-bezier(.25,1,.3,1);

  display:flex;align-items:stretch;
  height:clamp(360px,32vw,470px);
}
.at-acc__panel{
  position:relative;flex:1 1 0;min-width:0;
  /* 24px between the pictures (20260911, on client feedback, twice: 8 to 16,
     then to 24). Still padding, not a gap, for the reason above. */
  padding-right:24px;text-decoration:none!important;
  transition:flex-grow 1.35s var(--ease);
}
.at-acc__panel:last-child{padding-right:0;}
.at-acc__inner{
  position:relative;display:block;height:100%;overflow:hidden;
  border-radius:22px;background:#EEF3FB;isolation:isolate;
  contain:layout paint;
}
.at-acc__img{
  position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:-2;
  transform:scale(1.04);
  transition:transform 1.6s var(--ease);
}
.at-acc:hover .at-acc__img,
.at-acc:focus-within .at-acc__img{will-change:transform;}
/* THE PHOTOGRAPHS ARE SHOWN AS THEY ARE (20260912, client instruction). The
   blue tint on the closed panels and the pale wash on the open one both
   came off; what remains on a closed panel is a dark gradient up from the
   foot, only as far as the name set on its side needs, and the open panel's
   copy sits on a white card of its own instead of on a washed picture. The
   gradient is ::after, on in the closed state and off in the open one. */
.at-acc__inner::after{
  content:"";position:absolute;inset:0;z-index:-1;pointer-events:none;
  background:linear-gradient(180deg,rgba(5,18,52,0) 34%,rgba(5,18,52,.34) 62%,rgba(5,18,52,.72) 100%);
  opacity:1;
  transition:opacity 1.2s ease;
}
/* The closed panel's name, set on its side and read from the foot up, as the
   reference sets its narrow cards. It is one line; a name longer than the
   panel is tall is cut with an ellipsis rather than wrapped. */
.at-acc__title{
  position:absolute;left:50%;bottom:24px;
  translate:-50% 0;rotate:180deg;writing-mode:vertical-rl;
  max-height:calc(100% - 64px);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
  color:#fff;font-size:clamp(17px,1.5vw,24px);font-weight:500;line-height:1.1;
  opacity:1;transform:none;
  /* This is the title ARRIVING — a panel closing behind you — so it waits for
     the card it is replacing to clear out first. Leaving is the fast rule on
     the open states below. */
  transition:opacity .6s ease .3s,transform .6s var(--ease) .3s;
}
/* The open panel's copy: a white card, top left, over the photograph. */
.at-acc__card{
  position:absolute;left:24px;top:24px;
  width:clamp(230px,25vw,360px);
  padding:22px 22px 20px;border-radius:16px;
  background:#fff;box-shadow:0 14px 36px rgba(6,20,54,.16);
  opacity:0;transform:translateY(18px);
  /* The base is the card LEAVING: quick, and immediately. */
  transition:opacity .34s ease,transform .46s var(--ease);
}
.at-acc__head{
  display:block;color:#16233C!important;
  font-size:clamp(20px,1.8vw,27px)!important;font-weight:500!important;line-height:1.2!important;
  letter-spacing:0!important;margin:0 0 10px!important;
}
.at-acc__text{
  display:block;color:var(--body);font-size:14px;line-height:1.55;
  margin:0 0 18px;
}
/* Later than the card, so the invitation arrives after the panel it sits on.
   The house pill (the .at-btn--solid geometry and ramp), on client
   instruction: the white tile with a disc was one more button shape. The
   gap opens on hover as every .at-btn does. */
.at-acc__more{
  display:inline-flex;align-items:center;gap:10px;
  min-height:var(--vxn-cta-h,46px);padding:0 var(--vxn-cta-px,28px);border-radius:var(--vxn-cta-r,999px);
  background-image:var(--vxn-cta-grad,var(--brand));background-color:#0B2DBE;
  color:#fff;font-size:var(--vxn-cta-fs,14px);font-weight:var(--vxn-cta-fw,400);letter-spacing:var(--vxn-cta-ls,.01em);
  line-height:1;
  opacity:0;transition:opacity .28s ease;
}
/* The number, a frosted disc in the top corner in both states. */
.at-acc__num{
  position:absolute;right:16px;top:16px;
  display:inline-flex;align-items:center;justify-content:center;
  width:36px;height:36px;border-radius:50%;
  background:rgba(5,18,52,.42);border:1px solid rgba(255,255,255,.34);
  -webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);
  color:#fff;font-size:11.5px;font-weight:600;letter-spacing:.04em;
}

/* ---- OPEN, at rest ------------------------------------------------------ */
.at-acc__panel:first-child{flex-grow:var(--open);}
.at-acc__panel:first-child .at-acc__img{transform:scale(1);}
.at-acc__panel:first-child .at-acc__inner::after{opacity:0;}
.at-acc__panel:first-child .at-acc__title{
  opacity:0;transform:translateY(-6px);
  transition:opacity .32s ease,transform .32s ease;
}
.at-acc__panel:first-child .at-acc__card{
  opacity:1;transform:none;
  transition:opacity .75s ease .42s,transform 1s var(--ease) .42s;
}
.at-acc__panel:first-child .at-acc__more{opacity:1;transition:opacity .65s ease .62s;}
/* ---- CLOSED, the moment the strip is engaged ---------------------------- */
.at-acc:hover .at-acc__panel,
.at-acc:focus-within .at-acc__panel{flex-grow:1;}
.at-acc:hover .at-acc__panel .at-acc__img,
.at-acc:focus-within .at-acc__panel .at-acc__img{transform:scale(1.04);}
.at-acc:hover .at-acc__panel .at-acc__inner::after,
.at-acc:focus-within .at-acc__panel .at-acc__inner::after{opacity:1;}
.at-acc:hover .at-acc__panel .at-acc__title,
.at-acc:focus-within .at-acc__panel .at-acc__title{opacity:1;transform:none;}
.at-acc:hover .at-acc__panel .at-acc__card,
.at-acc:focus-within .at-acc__panel .at-acc__card{opacity:0;transform:translateY(18px);}
.at-acc:hover .at-acc__panel .at-acc__more,
.at-acc:focus-within .at-acc__panel .at-acc__more{opacity:0;}
/* ---- OPEN, the engaged one ---------------------------------------------- */
.at-acc:hover .at-acc__panel:hover,
.at-acc:focus-within .at-acc__panel:focus-visible{flex-grow:var(--open);}
.at-acc:hover .at-acc__panel:hover .at-acc__img,
.at-acc:focus-within .at-acc__panel:focus-visible .at-acc__img{transform:scale(1);}
.at-acc:hover .at-acc__panel:hover .at-acc__inner::after,
.at-acc:focus-within .at-acc__panel:focus-visible .at-acc__inner::after{opacity:0;}
.at-acc:hover .at-acc__panel:hover .at-acc__title,
.at-acc:focus-within .at-acc__panel:focus-visible .at-acc__title{
  opacity:0;transform:translateY(-6px);
  transition:opacity .32s ease,transform .32s ease;
}
.at-acc:hover .at-acc__panel:hover .at-acc__card,
.at-acc:focus-within .at-acc__panel:focus-visible .at-acc__card{
  opacity:1;transform:none;
  transition:opacity .75s ease .42s,transform 1s var(--ease) .42s;
}
.at-acc:hover .at-acc__panel:hover .at-acc__more,
.at-acc:focus-within .at-acc__panel:focus-visible .at-acc__more{
  opacity:1;transition:opacity .65s ease .62s;
}

/* ==========================================================================
   RELATED SERVICES — three of the other UAE service lines.

   A grid of split cards: a tinted panel carrying a label, a name, the
   service's one-line description and an invitation, a photograph beside it,
   one rounded frame around both. The first card is the feature and takes both
   rows of the left column — that asymmetry is the whole composition, and
   without it three equal tiles read as a table of contents.

   The three are vxnServices('en-ae') minus this page's own service, so adding
   a service line to the registry adds a card here and removing one removes it.
   Nothing about this section is written down twice.
   ========================================================================== */
/* Given more room on client feedback. The band ran on the page's shared 40px
   rhythm, which is right for the sections that carry a lot of text and wrong
   for this one. !important because .at-root section sets the rhythm at
   (0,1,1) and a bare .at-rel is (0,1,0), the same reason .at-intro carries
   one. */
.at-rel{padding:clamp(58px,6vw,88px) 0!important;}
.at-rel__head{
  font-weight:400!important;color:var(--ny)!important;
  font-size:clamp(26px,3vw,36px)!important;line-height:1.2!important;
  margin:0 0 var(--headgap)!important;
}
/* Two columns and two rows, which is all three cards need: the feature takes
   the left column whole, the other two stack in the right.

   The row floor is what actually sizes this band — the cards have no content
   tall enough to push past it — so it is the number to move, not the card. At
   172 the feature comes to 368 (two rows plus the gap) and the stacked pair to
   172 each, which is enough depth for the photograph beside the label to read
   as a photograph rather than as a swatch. */
.at-rel__grid{
  display:grid;grid-template-columns:repeat(2,minmax(0,1fr));
  grid-auto-rows:minmax(172px,1fr);gap:var(--gap);
}
.at-rel__card{
  display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);
  overflow:hidden;border-radius:10px;background:var(--tint2);
  text-decoration:none!important;
  transition:background-color .35s ease,box-shadow .35s ease;
}
.at-rel__card:first-child{grid-row:span 2;}
.at-rel__card:hover{background:var(--tint);box-shadow:0 22px 44px -32px rgba(6,18,32,.42);}
.at-rel__panel{
  display:flex;flex-direction:column;justify-content:start;
  padding:20px 22px;
}
.at-rel__card:first-child .at-rel__panel{padding:30px 32px;}
.at-rel__eyebrow{
  display:block;font-size:9.5px;font-weight:700;letter-spacing:.16em;
  text-transform:uppercase;color:var(--muted);margin:0 0 9px;
}
.at-rel__title{
  display:block;font-weight:400;
  color:var(--ny);font-size:15px;line-height:1.32;margin:0 0 8px;
}
.at-rel__card:first-child .at-rel__title{
  font-size:clamp(19px,2vw,25px);line-height:1.24;margin:0 0 12px;
}
/* The description, added on client feedback. It is the registry's own desc
   for the service — the sentence the home accordion and the service's own hero
   already use — so the three cards say what a service IS, in the words that
   service uses for itself elsewhere. Rendered through <Html> because those
   strings carry entities. */
.at-rel__desc{
  display:block;color:var(--body);font-size:13px;line-height:1.55;
  margin:0 0 16px;
}
.at-rel__card:first-child .at-rel__desc{font-size:14.5px;line-height:1.6;max-width:34ch;}
/* Pinned to the panel's foot, so the three cards end on the same kind of line
   however long their descriptions run. The gap opens on hover — the page's
   arrow convention, and no transform. */
.at-rel__more{
  display:inline-flex;align-items:center;gap:8px;margin-top:auto;
  color:var(--ny2);font-size:13px;font-weight:600;line-height:1;
}
.at-rel__shot{position:relative;display:block;overflow:hidden;}
.at-rel__shot img{
  position:absolute;inset:0;width:100%;height:100%;object-fit:cover;
  transition:transform .9s cubic-bezier(.22,1,.36,1);
}
.at-rel__card:hover .at-rel__shot img{transform:scale(1.05);}

/* ==========================================================================
   TALK TO AN EXPERT — the page's last word.

   A tinted band, a photograph on the left, and the close's own copy on the
   right under a squared button rather than the pill the rest of the page uses.
   The square is deliberate: it is the only one on the page, and this is the
   only place the page asks for something outright.
   ========================================================================== */
.at-talk{
  background:var(--tint);
  padding:clamp(44px,5vw,72px) 0!important;
}
.at-talk__grid{
  display:grid;grid-template-columns:minmax(0,.92fr) minmax(0,1.08fr);
  gap:clamp(28px,4.5vw,72px);align-items:center;
}
.at-talk__fig{
  margin:0;position:relative;overflow:hidden;aspect-ratio:4/3;border-radius:2px;
}
.at-talk__fig img{
  position:absolute;inset:0;width:100%;height:100%;object-fit:cover;
}
.at-talk__head{
  font-weight:300!important;
  color:#16233C!important;font-size:clamp(25px,3.1vw,40px)!important;
  line-height:1.18!important;letter-spacing:-.012em!important;
  margin:0 0 16px!important;max-width:100%;
}
.at-talk__lede{
  color:var(--body)!important;font-size:15px!important;line-height:1.7!important;
  margin:0 0 26px!important;max-width:52ch;
}
/* The one CTA (20260911). It was the page's one squared button, 3px; every
   CTA on the site is the same pill now. */
.at-talk__cta{
  display:inline-flex;align-items:center;justify-content:center;
  min-height:var(--vxn-cta-h,46px);padding:0 var(--vxn-cta-px,28px);border-radius:var(--vxn-cta-r,999px);
  background-image:var(--vxn-cta-grad);background-color:var(--vxn-cta-ink,#0B2DBE);color:#fff!important;
  font-size:var(--vxn-cta-fs,14px);font-weight:var(--vxn-cta-fw,400);letter-spacing:var(--vxn-cta-ls,.01em);
  line-height:1;text-decoration:none!important;
  --vxn-cta-sweep:var(--vxn-cta-sweep-dark,#08248F);
}
.at-talk__cta:hover{color:#fff!important;}

/* ==========================================================================
   RESPONSIVE — four steps, and the scale tokens do most of the work.
   ========================================================================== */
@media(max-width:1180px){
  .at-root{--gap:20px;--cardpad:24px;--headgap:36px;}
  .at-acc{--open:4;height:clamp(340px,34vw,420px);}
  .at-acc__title{bottom:20px;font-size:16px;}
  /* One rail. The figure loses its stretch height with the row it was
     stretching to, so it takes an aspect ratio instead of a min-height —
     a 340px band under the list would crop the photograph to a strip. */
  .at-intro__grid{grid-template-columns:minmax(0,1fr);gap:calc(var(--gap) * 1.6);}
  .at-intro__figure{min-height:0;aspect-ratio:16/9;}
}
@media(max-width:900px){
  .at-root{--headgap:30px;}
  /* THE ACCORDION STOPS HERE, and it stops before it stops being readable: at
     this width a closed panel is under 90px and its title is about one word a
     line. Two columns of open cards instead — same panels, same content, and
     nothing held behind a hover a touch screen cannot perform.

     Every state rule has to be restated with its full selector. The mechanism
     above is written at three, four and five classes deep, so a bare
     .at-acc__card in here would lose to it. */
  .at-acc{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:24px;height:auto;}
  .at-acc__panel{padding-right:0;}
  .at-acc__inner{height:300px;}
  .at-acc__title,
  .at-acc:hover .at-acc__panel .at-acc__title,
  .at-acc:focus-within .at-acc__panel .at-acc__title{display:none;}
  .at-acc__card,
  .at-acc__panel:first-child .at-acc__card,
  .at-acc:hover .at-acc__panel .at-acc__card,
  .at-acc:hover .at-acc__panel:hover .at-acc__card,
  .at-acc:focus-within .at-acc__panel .at-acc__card,
  .at-acc:focus-within .at-acc__panel:focus-visible .at-acc__card{
    opacity:1;transform:none;width:auto;left:16px;top:16px;right:16px;
  }
  .at-acc__more,
  .at-acc__panel:first-child .at-acc__more,
  .at-acc:hover .at-acc__panel .at-acc__more,
  .at-acc:hover .at-acc__panel:hover .at-acc__more,
  .at-acc:focus-within .at-acc__panel .at-acc__more,
  .at-acc:focus-within .at-acc__panel:focus-visible .at-acc__more{opacity:1;}
  .at-acc__img,
  .at-acc__panel:first-child .at-acc__img,
  .at-acc:hover .at-acc__panel .at-acc__img,
  .at-acc:hover .at-acc__panel:hover .at-acc__img,
  .at-acc:focus-within .at-acc__panel .at-acc__img,
  .at-acc:focus-within .at-acc__panel:focus-visible .at-acc__img{transform:none;}
  .at-acc__inner::after,
  .at-acc__panel:first-child .at-acc__inner::after,
  .at-acc:hover .at-acc__panel .at-acc__inner::after,
  .at-acc:hover .at-acc__panel:hover .at-acc__inner::after,
  .at-acc:focus-within .at-acc__panel .at-acc__inner::after,
  .at-acc:focus-within .at-acc__panel:focus-visible .at-acc__inner::after{opacity:0;}
  /* The head row stacks: the gloss and the pill under the heading. */
  .at-services__head{grid-template-columns:minmax(0,1fr);}
  .at-services__aside{justify-self:start;padding-top:0;max-width:60ch;}
  /* The card has the bottom of the panel to itself now, so the number moves
     up rather than fighting it for the corner. */
  /* The card runs the full width of the panel here and the badge sat on
     its corner, so the badge goes. */
  .at-acc__num{display:none;}
  /* One column: the picture becomes a band under the copy rather than half the
     card. The 50/50 split is a two-column idea and there is only one column
     here, so the halves become top and bottom. */
  .at-prob__card{grid-template-columns:minmax(0,1fr);min-height:0;}
  .at-prob__art{aspect-ratio:16/6;}
  /* The head row stacks: a heading and a paragraph side by side need the
     measure they have above this width. */
  .at-intro__top{gap:12px;}
  .at-intro__lede{max-width:60ch;}
  .at-talk__grid{grid-template-columns:minmax(0,1fr);gap:calc(var(--gap) * 1.5);}
  .at-talk__fig{aspect-ratio:16/9;}
}
/* The banner's own step, at the sub-page's breakpoint so the two bands turn
   together. The desktop scrim is a wash from the LEFT, because that is the
   only side the copy occupies there; in one column the copy runs the full
   width and the last words of every line were landing on the brightest part
   of the plate. An even scrim instead — it costs the photograph some depth
   and buys the paragraph a contrast ratio it can be read at. The lede lets go
   of its half-measure for the same reason. */
@media(max-width:820px){
  .at-hero{min-height:clamp(440px,76vh,560px);}
  .at-hero__scrim{
    background:linear-gradient(170deg,rgba(4,14,36,.64) 0%,rgba(4,14,36,.52) 45%,rgba(4,14,36,.64) 100%);
  }
  .at-root .at-hero__head,.at-hero__sub{max-width:100%;}
}
@media(max-width:640px){
  .at-root{--gutter:20px;--cardpad:22px;--radius:16px;--headgap:26px;}
  .at-acc{grid-template-columns:minmax(0,1fr);}
  .at-acc__inner{height:280px;}
  /* One column, and the feature card stops spanning: a row span in a
     single-column grid is just a taller card with nothing beside it. */
  .at-rel__grid{grid-template-columns:minmax(0,1fr);grid-auto-rows:minmax(104px,auto);}
  .at-rel__card:first-child{grid-row:auto;}
  /* The card stacks too — photograph as a band on top, copy under it. Split
     down the middle on a 350px card the panel was 130px wide, and a two-line
     description became six. The shot has no in-flow content, so aspect-ratio
     is what gives the band its height. */
  .at-rel__card{grid-template-columns:minmax(0,1fr);}
  .at-rel__shot{order:-1;aspect-ratio:16/7;}
  .at-rel__card:first-child .at-rel__panel{padding:20px 22px;}
  .at-rel__card:first-child .at-rel__title{font-size:17px;}
  .at-rel__card:first-child .at-rel__desc{font-size:13px;max-width:none;}
  .at-talk__cta{width:100%;justify-content:center;}
  .at-services__head{gap:18px;}
  /* Full width, the label at one end and the disc at the other, because a
     pill hanging off the left of a full-width paragraph reads as an orphan at
     this measure. */
  .at-prob__cta{align-self:stretch;justify-content:center;margin-top:24px;}
  .at-prob__art{aspect-ratio:16/8;}
  .at-intro__figure{aspect-ratio:4/3;}
  .at-intro__point{padding:18px 0 20px 22px;}
}

/* ==========================================================================
   MOTION — see Motion.tsx. The default here is VISIBLE; only [data-anim]
   values that JavaScript sets can hide anything, so a blocked or failed bundle
   leaves the page fully readable.
   ========================================================================== */
[data-anim='pending']{opacity:0;}
[data-anim='pending'][data-anim-variant='up']{translate:0 22px;}
[data-anim='pending'][data-anim-variant='left']{translate:-18px 0;}
[data-anim='pending'][data-anim-variant='right']{translate:18px 0;}
[data-anim='pending'][data-anim-variant='scale']{scale:.97;}
[data-anim='in']{
  opacity:1;translate:none;scale:none;
  transition:opacity .6s cubic-bezier(.22,.61,.36,1) var(--at-delay,0ms),
             translate .7s cubic-bezier(.22,.61,.36,1) var(--at-delay,0ms),
             scale .7s cubic-bezier(.22,.61,.36,1) var(--at-delay,0ms);
}

@media(prefers-reduced-motion:reduce){
  /* The plate drift and every entrance come off. Colour, frost and the hover
     states that carry meaning stay — none of them moved anything to begin
     with. */
  .at-zoom{transform:none;will-change:auto;}
  [data-anim]{opacity:1!important;translate:none!important;scale:none!important;transition:none!important;}
  /* The strip still opens and closes — it is how the section is read — but it
     does it instantly rather than easing across 1.35s.

     !important, and it is load-bearing: the open-state rules above set their
     own transition at four and five classes deep, so a bare declaration here
     would lose to them and reduced-motion users would still get the full
     expansion. */
  .at-acc__panel,.at-acc__img,.at-acc__title,.at-acc__card,.at-acc__more,
  .at-acc__more i,.at-acc__inner::after{transition:none!important;}
  .at-btn{transition:background-color .25s ease,color .25s ease;}
}
`;

/**
 * The strip's heading with its last word underlined by a hand-drawn stroke,
 * the device the reference draws under one word of its own heading. The
 * stroke is an SVG path with pathLength 1, so the stylesheet can draw it in
 * on arrival with a dash offset; without the motion script it is simply
 * there. The word keeps its punctuation ("Move." is underlined whole).
 */
function Swash({ text }: { text: string }) {
  const t = text.trimEnd();
  const i = t.lastIndexOf(" ");
  if (i < 0) return <>{t}</>;
  return (
    <>
      {t.slice(0, i + 1)}
      <span className="at-swash">
        {t.slice(i + 1)}
        <svg className="at-swash__ink" viewBox="0 0 200 24" preserveAspectRatio="none" aria-hidden="true" focusable="false">
          <path d="M3 18 C 52 6, 122 2, 197 9" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" pathLength="1" />
        </svg>
      </span>
    </>
  );
}

/** The arrow that ends every CTA on the page. */
/** A captured Elementor container: the class list the theme keys off, and nothing else. */
function Con({
  id,
  extra = "",
  settings,
  children,
}: {
  id: string;
  extra?: string;
  settings?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={`elementor-element elementor-element-${id} ${extra} e-flex e-con e-child`.replace(/\s+/g, " ")}
      data-id={id}
      data-element_type="container"
      data-e-type="container"
      {...(settings ? { "data-settings": settings } : {})}
    >
      {children}
    </div>
  );
}

/** The blur-background layers a chooser pane carries, as captured. */
function BlurLayers({ ids, hideLast = false }: { ids: string[]; hideLast?: boolean }) {
  return (
    <>
      {ids.map((id, i) => (
        <Con
          key={id}
          id={id}
          extra={`e-con-full blur-background${hideLast && i === ids.length - 1 ? " elementor-hidden-mobile" : ""}`}
        />
      ))}
    </>
  );
}

export default function ServiceTemplateBody({
  region,
  content,
}: {
  region: string;
  content: ServiceTemplateContent;
}) {
  const { hero, intro, strip, solution, banner, related, close } = content;
  const sub = (slug: string) => rurl(region, `/services/${content.slug}/${slug}/`);

  /* The cards in section 4: every UAE service line except this page's own,
     cut to three.

     THREE IS THE COMPOSITION, NOT A CONTENT DECISION. The grid is one feature
     card spanning both rows of the left column beside two stacked cards in the
     right — that shape needs exactly three. A fourth and fifth flowed onto a
     third row and left the feature card orphaned above them. Change the count
     and the layout has to change with it; RELATED_FIGURE holds all six, so
     which three show is this one number.

     WHICH THREE is the page's to say (related.slugs, in the order given); a
     page that says nothing takes the first three. */
  const others = vxnServices(region).filter((sv) => sv.slug !== content.slug);
  const pick = related.slugs;
  const RELATED = (pick
    ? others
        .filter((sv) => pick.includes(sv.slug ?? ""))
        .sort((a, b) => pick.indexOf(a.slug ?? "") - pick.indexOf(b.slug ?? ""))
    : others
  ).slice(0, 3);

  /* The chooser names its items by slug; this is where they become the
     sub-services themselves, so the tab block renders the same cardText the
     strip above it does and cannot fall out of step with it. A slug that is
     not in the strip drops out here rather than rendering as undefined.

     A tab may instead carry items of its own (`items`), when what it lists is
     not a sub-service but a step; they take the same two slots. Its heading
     line and its button are the tab's where it has them, and the intro's
     primary call where it does not. */
  const SOL = solution.tabs.slice(0, SOLUTION_IDS.length).map((g) => ({
    tab: g.tab,
    title: g.title,
    intro: g.intro,
    cta: g.cta ?? intro.primary,
    items: g.items
      ? g.items.map((it) => ({ key: it.name, name: it.name, text: it.text }))
      : (g.slugs ?? [])
          .map((sl) => strip.subs.find((x) => x.slug === sl))
          .filter((x): x is TemplateSub => Boolean(x))
          .map((x) => ({ key: x.slug, name: x.name, text: x.cardText })),
  }));

  /* #main-content / #main / <article> are the theme's page wrappers. Every
     other page body opens them; skipping them would drop the skip-link target
     and the layout-full class the theme's own rules key off. */
  return (
    <div id="main-content">
      <div id="main" role="main" className="vamtam-main layout-full">
        <article className="full page type-page status-publish hentry at-root">
          <style dangerouslySetInnerHTML={{ __html: CSS }} />
          <ServiceTemplateMotion />

          {/* ---- 1. HERO — the photograph, the crumb, the title, one line ---- */}
          <section className="at-hero" aria-labelledby="at-hero-head">
            <div className="at-hero__media">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="at-zoom" src={rimgFirst(region, hero.image)} alt={hero.alt} fetchPriority="high" />
            </div>
            <div className="at-hero__scrim" aria-hidden="true" />
            {/* No blur stack and no white wash under the copy (client, 20260914):
                the photograph runs clean to the bottom edge of the band, and
                the scrim above is all that sits between it and the type. */}

            <div className="at-hero__inner">
              <div className="at-hero__copy">
                <nav className="at-hero__crumb" aria-label="Breadcrumb">
                  <span>
                    <a href={rurl(region, "/services/")}>Services</a>
                    <span aria-hidden="true"> /</span>
                  </span>
                  <span aria-current="page">{content.crumb}</span>
                </nav>
                <h1 className="at-hero__head" id="at-hero-head">
                  {hero.head}
                </h1>
                <p className="at-hero__sub">{hero.sub}</p>
              </div>
            </div>
          </section>

          {/* ---- 2. THE INTRO BAND ----
              The head sits left and the lede right across the top of the band;
              the proof points are a ruled list in the left rail with the
              photograph beside them. */}
          <section className="at-intro" aria-labelledby="at-intro-head">
            <div className="at-in">
              <div className="at-intro__top">
                <h2 className="at-intro__head" id="at-intro-head">
                  {intro.head}
                </h2>
                <p className="at-intro__lede">{intro.lede}</p>
              </div>

              <div className="at-intro__grid">
                <div className="at-intro__copy">
                  {/* The proof points read as terms, so they are headings with
                      a note under each rather than an icon rail. */}
                  <ul className="at-intro__points" aria-label={`What working with Valunxt means`}>
                    {intro.proof.map((pr) => (
                      <li className="at-intro__point" key={pr.label}>
                        <h3 className="at-intro__label">{pr.label}</h3>
                        <p className="at-intro__note">{pr.note}</p>
                      </li>
                    ))}
                  </ul>

                  {/* The chips and the two buttons that followed the list came
                      off on client feedback (20260912): the band is the
                      statement, the list and the photograph, as the
                      reference has it. intro.chips, intro.primary and
                      intro.secondary stay in the content: the strip's call and
                      the chooser's tabs still read intro.primary. */}
                </div>

                {/* Decorative: the points beside it say what it shows. */}
                <figure className="at-intro__figure">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={rimgFirst(region, intro.image)} alt="" loading="lazy" />
                </figure>
              </div>
            </div>
          </section>

          {/* ---- 2b. THE SERVICE STRIP — the commercial centre ----
              Directly under the proposition, because the source document's
              own instruction is not to let generic education push the
              services down the page. The id is what the hero's secondary
              button and the banner's link jump to. A page whose content asks
              for the card deck (strip.look, 20260915; Real Estate) gets
              ExploreDeck instead, on the same accordion. */}
          {strip.look === "deck" ? (
            <ExploreDeck region={region} content={content} />
          ) : (
          <section className="at-services" id="at-services" aria-labelledby="at-services-head">
            <div className="at-in">
              <div className="at-services__head">
                <div className="at-sec__head">
                  <span className="at-kicker">{strip.kicker}</span>
                  <h2 className="at-h2 at-services__h2" id="at-services-head">
                    <Swash text={strip.head} />
                  </h2>
                </div>
                {/* The gloss and the call, top-aligned with the heading on the
                    right, as the reference sets them. */}
                <div className="at-services__aside">
                  <p className="at-lede at-services__lede">{strip.lede}</p>
                  <a className="at-btn at-btn--solid at-services__cta" href={rurl(region, intro.primary.href)}>
                    {strip.cta}
                    <CtaArrow />
                  </a>
                </div>
              </div>

              <div className="at-acc">
                {strip.subs.map((sv, i) => (
                  <a className="at-acc__panel" href={sub(sv.slug)} key={sv.slug}>
                    <span className="at-acc__inner">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img className="at-acc__img" src={rimgFirst(region, sv.figure)} alt="" loading="lazy" />
                      {/* The closed panel's label. It repeats the heading in
                          the card below it, so it is hidden from assistive
                          technology — the h3 is always in the accessibility
                          tree whether or not its panel is the open one. */}
                      <span className="at-acc__title" aria-hidden="true">
                        {sv.name}
                      </span>
                      <span className="at-acc__card">
                        <h3 className="at-acc__head">{sv.name}</h3>
                        <span className="at-acc__text">{sv.cardText}</span>
                        <span className="at-acc__more">
                          Explore More
                          <CtaArrow />
                        </span>
                      </span>
                      <span className="at-acc__num" aria-hidden="true">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </section>
          )}

          {/* ---- 2c. FIND THE RIGHT SOLUTION ----
              THE HOME PAGE'S SECTION, COPIED. Everything inside the
              <div data-elementor-id="17"> is the captured Elementor markup
              already running at / — same element ids, same structure, same tab widget — rendered
              from SOLUTION_IDS rather than written out three times.

              WHY IT IS COPIED AND NOT REBUILT. The tab behaviour is Elementor's
              nested-tabs widget, and elements-handlers.min.js — which every
              page already loads — is what switches the panels. Rebuilding the
              markup would mean rebuilding that too. The .elementor-17 wrapper
              is what lets post-17.css style it; see EXTRA_CSS in
              lib/uae-service-pages.ts for how these pages come to load it. */}
          {/* The three tab pictures. post-17.css sets them to the home page's
              own shots; these are this service's. A page-scoped override
              rather than an edit to that sheet, because the home page loads it
              too.

              The pane also takes flex-end here. The captured sheet spaces its
              children apart, which held the corner mark at the top and the
              button at the foot; the mark is gone (client instruction,
              20260911) and the button is the only child left, so without this
              it would rise to the top.

              A page whose content asks for the satin band (solution.look,
              20260915; Real Estate) gets SolutionSatin instead: the same
              heading, tabs, titles, intros, steps and buttons, on the green
              satin of that day's reference, switched by its own script. */}
          {solution.look === "satin" ? (
            <SolutionSatin
              head={solution.head}
              texture={rimgFirst(region, solution.texture ?? ["services/re-solution-texture.webp"])}
              tabs={SOL.map((g) => ({
                tab: g.tab,
                title: g.title,
                intro: g.intro,
                items: g.items,
                cta: { label: g.cta.label, href: rurl(region, g.cta.href) },
              }))}
            />
          ) : (
          <>
          <style
            id={`${content.slug}-solution-images`}
            dangerouslySetInnerHTML={{
              __html: SOLUTION_IDS.map(
                (t, k) => `
.elementor-17 .elementor-element.elementor-element-${t.pane}:not(.elementor-motion-effects-element-type-background),
.elementor-17 .elementor-element.elementor-element-${t.pane} > .elementor-motion-effects-container > .elementor-motion-effects-layer{
  background-image:url("${rimgFirst(region, [`services/${content.slug}-solution-${k + 1}.webp`, ...(solution.images[k] ?? solution.images[0] ?? [])])}")!important;
  background-position:center center!important;
  background-size:cover!important;
}
.elementor-17 .elementor-element.elementor-element-${t.pane}{
  --justify-content:flex-end!important;justify-content:flex-end!important;
}`,
              ).join("\n"),
            }}
          />

          <div data-elementor-type="wp-page" data-elementor-id="17" className="elementor elementor-17" data-elementor-post-type="page">
            <div className="elementor-element elementor-element-d50462f e-flex e-con-boxed e-con e-parent" data-id="d50462f" data-element_type="container" data-e-type="container">
              <div className="e-con-inner">
                <Con id="82cf741" extra="e-con-full" settings={"{\"background_background\":\"classic\"}"}>
                  <Con id="79f93d1" extra="e-con-full" settings={"{\"background_background\":\"classic\"}"}>
                    <div className="elementor-element elementor-element-e81eaa1 elementor-invisible animated-fast elementor-widget elementor-widget-heading" data-id="e81eaa1" data-element_type="widget" data-e-type="widget" data-settings={"{\"_animation\":\"slideInUp\"}"} data-widget_type="heading.default">
                      <div className="elementor-widget-container">
                        <h2 className="elementor-heading-title elementor-size-default">{solution.head}</h2>
                      </div>
                    </div>
                  </Con>
                  <div className="elementor-element elementor-element-21fcef5 e-flex e-con-boxed e-con e-child" data-id="21fcef5" data-element_type="container" data-e-type="container">
                    <div className="e-con-inner">
                      <div className="elementor-element elementor-element-9af78b4 e-n-tabs-none elementor-widget elementor-widget-n-tabs" data-id="9af78b4" data-element_type="widget" data-e-type="widget" data-settings={"{\"tabs_justify_horizontal\":\"stretch\",\"horizontal_scroll\":\"enable\"}"} data-widget_type="nested-tabs.default">
                        <div className="elementor-widget-container">
                          <div className="e-n-tabs" data-widget-number="162494644" aria-label="Tabs. Open items with Enter or Space, close with Escape and navigate using the Arrow keys.">
                            <div className="e-n-tabs-heading" role="tablist">
                              {SOL.map((g, k) => (
                                <button
                                  key={g.tab}
                                  id={`e-n-tab-title-162494644${k + 1}`}
                                  data-tab-title-id={`e-n-tab-title-162494644${k + 1}`}
                                  className="e-n-tab-title"
                                  aria-selected={k === 0}
                                  data-tab-index={k + 1}
                                  role="tab"
                                  tabIndex={k === 0 ? 0 : -1}
                                  aria-controls={`e-n-tab-content-162494644${k + 1}`}
                                  style={{ "--n-tabs-title-order": String(k + 1) } as React.CSSProperties}
                                >
                                  <span className="e-n-tab-title-text">{g.tab} </span>
                                </button>
                              ))}
                            </div>
                            <div className="e-n-tabs-content">
                              {SOL.map((g, k) => {
                                const t = SOLUTION_IDS[k];
                                return (
                                  <div
                                    key={t.panel}
                                    id={`e-n-tab-content-162494644${k + 1}`}
                                    role="tabpanel"
                                    aria-labelledby={`e-n-tab-title-162494644${k + 1}`}
                                    data-tab-index={k + 1}
                                    style={{ "--n-tabs-title-order": String(k + 1) } as React.CSSProperties}
                                    className={`${k === 0 ? "e-active " : ""}elementor-element elementor-element-${t.panel} e-con-full e-flex e-con e-child`}
                                    data-id={t.panel}
                                    data-element_type="container"
                                    data-e-type="container"
                                  >
                                    <Con id={t.col} extra="e-con-full">
                                      <div className={`vamtam-has-theme-widget-styles elementor-element elementor-element-${t.intro} elementor-invisible animated-fast elementor-widget elementor-widget-text-editor`} data-id={t.intro} data-element_type="widget" data-e-type="widget" data-settings={"{\"_animation\":\"fadeIn\"}"} data-widget_type="text-editor.default">
                                        <div className="elementor-widget-container">
                                          {g.title ? (
                                            <p>
                                              <strong>{g.title}</strong>
                                            </p>
                                          ) : null}
                                          <p>{g.intro}</p>
                                        </div>
                                      </div>
                                      <div className={`elementor-element elementor-element-${t.spacer} elementor-hidden-tablet elementor-hidden-mobile elementor-widget elementor-widget-spacer`} data-id={t.spacer} data-element_type="widget" data-e-type="widget" data-widget_type="spacer.default">
                                        <div className="elementor-widget-container">
                                          <div className="elementor-spacer">
                                            <div className="elementor-spacer-inner"></div>
                                          </div>
                                        </div>
                                      </div>
                                      {g.items.map((item, i) => {
                                        const [block, name, text] = t.items[Math.min(i, t.items.length - 1)];
                                        return (
                                          <Con
                                            key={item.key}
                                            id={block}
                                            extra="elementor-invisible e-con-full animated-fast"
                                            settings={i === 0 ? "{\"animation\":\"slideInUp\"}" : `{"animation":"slideInUp","animation_delay":${i * 50}}`}
                                          >
                                            <div className={`elementor-element elementor-element-${name} elementor-widget elementor-widget-heading`} data-id={name} data-element_type="widget" data-e-type="widget" data-widget_type="heading.default">
                                              <div className="elementor-widget-container">
                                                <h5 className="elementor-heading-title elementor-size-default">{item.name}</h5>
                                              </div>
                                            </div>
                                            <div className={`elementor-element elementor-element-${text} elementor-widget elementor-widget-heading`} data-id={text} data-element_type="widget" data-e-type="widget" data-widget_type="heading.default">
                                              <div className="elementor-widget-container">
                                                <span className="elementor-heading-title elementor-size-default">{item.text}</span>
                                              </div>
                                            </div>
                                          </Con>
                                        );
                                      })}
                                    </Con>
                                    <Con id={t.pane} extra="e-con-full" settings={"{\"background_background\":\"classic\"}"}>
                                      <Con id={t.abs} extra="e-con-full" settings={"{\"position\":\"absolute\"}"}>
                                        {t.blur ? (
                                          <BlurLayers ids={t.blur} />
                                        ) : (
                                          <div className="elementor-element elementor-element-a7ee314 elementor-widget elementor-widget-template" data-id="a7ee314" data-element_type="widget" data-e-type="widget" data-widget_type="template.default">
                                            <div className="elementor-widget-container">
                                              <div className="elementor-template">
                                                <div data-elementor-type="container" data-elementor-id="7162" className="elementor elementor-7162" data-elementor-post-type="elementor_library">
                                                  <Con id="c895366" extra="e-con-full">
                                                    <BlurLayers ids={[...TEMPLATE_BLUR, "a5c7002"]} hideLast />
                                                  </Con>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        )}
                                      </Con>
                                      {/* The corner mark (the wordmark's x on a tile) that sat at
                                          the top of the pane was removed on client instruction
                                          (20260911); the button keeps the foot through the
                                          flex-end in the page-scoped style above. */}
                                      <div className={`vamtam-has-theme-widget-styles elementor-element elementor-element-${t.btn} vamtam-icon-pos-row-reverse elementor-widget elementor-widget-button`} data-id={t.btn} data-element_type="widget" data-e-type="widget" data-widget_type="button.default">
                                        <div className="elementor-widget-container">
                                          <div className="elementor-button-wrapper">
                                            <a className="elementor-button elementor-button-link elementor-size-sm" href={rurl(region, g.cta.href)}>
                                              <span className="elementor-button-content-wrapper">
                                                <span className="elementor-button-icon">
                                                  <i aria-hidden="true" className="vamtamtheme- vamtam-theme-arrow-right vxn-cta__arrow"></i>{" "}
                                                </span>
                                                <span className="elementor-button-text">{g.cta.label}</span>
                                              </span>
                                            </a>
                                          </div>
                                        </div>
                                      </div>
                                    </Con>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Con>
              </div>
            </div>
          </div>
          </>
          )}

          {/* ---- 3. THE BANNER ---- */}
          <section className="at-prob" aria-labelledby="at-problem-head">
            <div className="at-in">
              <div className="at-prob__card">
                <div className="at-prob__panel">
                  <h2 className="at-prob__head" id="at-problem-head">
                    {banner.head}
                  </h2>
                  <p className="at-prob__body">{banner.body}</p>
                  <a className="at-prob__cta" href={rurl(region, banner.cta.href)}>
                    {banner.cta.label}
                    <CtaArrow />
                  </a>
                </div>

                {/* Decorative: the copy beside it is the whole of the section. */}
                <div className="at-prob__art" aria-hidden="true">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className="at-plate at-zoom" src={rimgFirst(region, banner.image)} alt="" loading="lazy" />
                </div>
              </div>
            </div>
          </section>

          {/* ---- 4. RELATED SERVICES ----
              The registry's other UAE service lines, not this page's own
              sub-services — those are already the strip above, and repeating
              them here would be the same list twice. */}
          <section className="at-rel" aria-labelledby="at-rel-head">
            <div className="at-in">
              <h2 className="at-rel__head" id="at-rel-head">
                {related.head}
              </h2>

              <div className="at-rel__grid">
                {RELATED.map((sv) => (
                  <a className="at-rel__card" href={rurl(region, sv.href)} key={sv.slug ?? sv.href}>
                    <span className="at-rel__panel">
                      <span className="at-rel__eyebrow">Service</span>
                      <span className="at-rel__title">{vxnServiceName(sv)}</span>
                      {/* The registry's own line on the service — see
                          .at-rel__desc. Entities, hence <Html>. */}
                      <Html as="span" className="at-rel__desc" html={sv.desc} />
                      <span className="at-rel__more">
                        Explore service
                        <CtaArrow />
                      </span>
                    </span>
                    {/* Decorative: the name beside it is the link's label. */}
                    <span className="at-rel__shot">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={rimgFirst(region, [
                          /* This page's own shot of that service first
                             (20260913): the same service is related from
                             several pages, and each card takes a different
                             photograph so none repeats across the section. */
                          `services/at-related-${content.slug}--${sv.slug}.webp`,
                          ...(RELATED_FIGURE[sv.slug ?? ""] ?? []),
                          sv.img.replace("/assets/content/uploads/", ""),
                        ])}
                        alt=""
                        loading="lazy"
                      />
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </section>

          {/* ---- 5. TALK TO AN EXPERT — one heading, one paragraph, one ask ---- */}
          <section className="at-talk" aria-labelledby="at-talk-head">
            <div className="at-in">
              <div className="at-talk__grid">
                {/* Decorative: the copy beside it says what it shows. */}
                <figure className="at-talk__fig">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={rimgFirst(region, close.image)} alt="" loading="lazy" />
                </figure>

                <div className="at-talk__copy">
                  <h2 className="at-talk__head" id="at-talk-head">
                    {close.head}
                  </h2>
                  <p className="at-talk__lede">{close.lede}</p>
                  <a className="at-talk__cta" href={rurl(region, close.primary.href)}>
                    {close.primary.label}
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

/**
 * A body component for one service, ready for the registry in ../index.ts.
 *
 * The routes render a body as <Body region={…} /> and know nothing about
 * content; this closes the content over that shape so the registry can list
 * the six services as six one-liners.
 */
export function templatedBody(content: ServiceTemplateContent): ComponentType<{ region: string }> {
  const Body = ({ region }: { region: string }) => <ServiceTemplateBody region={region} content={content} />;
  Body.displayName = `ServiceTemplateBody(${content.slug})`;
  return Body;
}
