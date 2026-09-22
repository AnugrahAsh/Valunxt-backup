/**
 * The company pages' own sheet — /about/, /clients/ and /industries/
 * (20260922, redesign on client instruction).
 *
 * THE TEMPLATE'S SYSTEM, NOT A NEW ONE. These pages render inside .at-root
 * with the UAE service template's sheet (ServiceTemplateBody's CSS) and its
 * motion engine, exactly as the services index does, so the hero, the pill
 * kicker, the headings, the buttons, the blue banner, the closing band, the
 * 1520 measure, the 18px radius and the reveal rules are the service pages'
 * own and cannot drift from them. This sheet is only the sections the
 * template does not have, under a co- prefix, built on the template's
 * tokens (--ny, --ny2, --body, --muted, --brand, --line, --tint, --gap,
 * --radius, --headgap).
 *
 * HOVER MOVES NOTHING, the template's rule: hovers change colour, light or
 * coverage (a brand fill rising, a photograph scaling inside its frame, an
 * arrow's gap opening), never an element's position.
 *
 * TYPE AND !IMPORTANT. The Elementor kit and the UAE type scale style bare
 * headings at a specificity a single class cannot reach, so every heading
 * here is written .at-root .co-x (0,2,0) and its type is marked, the same as
 * the template.
 *
 * A TEMPLATE LITERAL: no backtick anywhere inside it, or the build fails.
 */
export const COMPANY_CSS = `
/* ---- Lead row: kicker and heading left, the gloss right ----------------- */
.co-lead{
  display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,1fr);
  gap:18px clamp(32px,6vw,96px);align-items:end;margin:0 0 var(--headgap);
}
.co-lead__col{min-width:0;}
.at-root .co-lead__head{
  font-weight:300!important;color:#16233C!important;
  font-size:clamp(30px,3.6vw,50px)!important;line-height:1.12!important;
  letter-spacing:-.016em!important;margin:0!important;max-width:20ch;
}
.at-root .co-lead__head em{display:block;font-style:normal;color:var(--ny2);}
.co-lead__lede{
  justify-self:end;max-width:58ch;
  color:var(--body)!important;font-size:clamp(15px,1.15vw,17px)!important;line-height:1.7!important;margin:0 0 4px!important;
}
.co-lead__lede a{color:var(--ny2)!important;}
.co-lead--center{grid-template-columns:minmax(0,1fr);justify-items:center;text-align:center;}
.co-lead--center .co-lead__lede{justify-self:center;}
.co-lead--center .co-lead__head{max-width:24ch;}

.co-check{flex:none;width:18px;height:18px;color:var(--ny2);}

/* ---- ABOUT: who we are ---------------------------------------------------- */
.at-root section.co-story{padding:clamp(48px,5.4vw,88px) 0!important;}
.co-story__grid{
  display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);
  gap:clamp(32px,6vw,104px);align-items:center;
}
.co-story__fig{
  position:relative;isolation:isolate;overflow:hidden;margin:0;
  border-radius:var(--radius);min-height:clamp(440px,44vw,640px);background:#07142f;
}
.co-story__fig .at-plate{--throw:18px;}
.co-why{
  position:absolute;left:clamp(16px,2vw,24px);bottom:clamp(16px,2vw,24px);z-index:2;
  width:min(330px,calc(100% - 32px));padding:22px 24px 16px;border-radius:16px;
  background:rgba(8,20,54,.52);border:1px solid rgba(255,255,255,.18);
  -webkit-backdrop-filter:blur(16px) saturate(140%);backdrop-filter:blur(16px) saturate(140%);
  color:#fff;
}
.co-why__t{margin:0 0 10px!important;font-size:11px!important;font-weight:700!important;letter-spacing:.15em!important;text-transform:uppercase;color:rgba(255,255,255,.72)!important;}
.co-why ul{margin:0;padding:0;list-style:none;}
.co-why li{display:flex;align-items:center;gap:10px;padding:10px 0;border-top:1px solid rgba(255,255,255,.14);font-size:15px;line-height:1.35;color:#fff;}
.co-why .co-check{color:#BFD5F5;}
.at-root .co-story__head{
  font-weight:300!important;color:#16233C!important;font-size:clamp(30px,3.4vw,48px)!important;
  line-height:1.14!important;letter-spacing:-.015em!important;margin:0 0 22px!important;max-width:18ch;
}
.at-root .co-story__head em{display:block;font-style:normal;color:var(--ny2);}
.co-story__copy p.co-story__p{color:var(--body)!important;font-size:16px!important;line-height:1.75!important;margin:0 0 14px!important;max-width:60ch;}
.co-caps{margin:26px 0 0;padding:0;list-style:none;border-top:1px solid var(--line);}
.co-caps a{
  display:grid;grid-template-columns:44px minmax(0,1fr) auto;align-items:center;gap:14px;
  padding:18px 6px;border-bottom:1px solid var(--line);
  color:var(--ny)!important;text-decoration:none!important;transition:background-color .3s ease;
}
.co-caps li:first-child a{border-top:0;}
.co-caps a:hover{background:var(--tint);}
.co-caps__n{font-size:12px;font-weight:700;letter-spacing:.1em;color:var(--ny2);}
.co-caps__t{font-size:clamp(16px,1.3vw,19px);font-weight:400;line-height:1.3;}
.co-caps__go{display:inline-flex;align-items:center;gap:8px;font-size:13px;font-weight:600;color:var(--ny2);transition:gap .3s ease;white-space:nowrap;}
.co-caps a:hover .co-caps__go{gap:14px;}

/* ---- ABOUT: purpose ------------------------------------------------------- */
.at-root section.co-purpose{background:var(--tint);padding:clamp(52px,5.6vw,92px) 0!important;}
.co-pillars{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:var(--gap);}
.co-pillar{
  display:flex;flex-direction:column;min-height:clamp(300px,26vw,380px);padding:clamp(24px,2.4vw,34px);
  border-radius:var(--radius);background:#fff;border:1px solid var(--line2);
  transition:box-shadow .35s ease,border-color .35s ease;
}
.co-pillar:hover{border-color:var(--line);box-shadow:0 28px 54px -36px rgba(6,18,32,.36);}
.co-pillar__icon{display:grid;place-items:center;width:54px;height:54px;border-radius:15px;background:var(--brand);color:#fff;margin:0 0 auto;box-shadow:0 14px 28px -16px rgba(11,45,190,.7);}
.co-pillar__icon svg{width:24px;height:24px;}
.at-root .co-pillar__t{font-weight:400!important;color:var(--ny)!important;font-size:clamp(20px,1.8vw,25px)!important;line-height:1.24!important;margin:30px 0 10px!important;}
.co-pillar p.co-pillar__d{color:var(--body)!important;font-size:15px!important;line-height:1.68!important;margin:0!important;max-width:40ch;}
.co-pillar--photo{position:relative;isolation:isolate;overflow:hidden;padding:0;border:0;background:#07142f;justify-content:flex-end;}
.co-pillar--photo .at-plate{--throw:16px;}
.co-pillar--photo::after{content:"";position:absolute;inset:0;z-index:-1;background:linear-gradient(180deg,rgba(4,14,36,0) 40%,rgba(4,14,36,.78) 100%);}
.co-pillar__cap{position:relative;padding:clamp(22px,2.2vw,30px);color:#fff;font-size:clamp(18px,1.5vw,21px);line-height:1.3;font-weight:400;}
.co-pillar__cap small{display:block;margin-bottom:8px;font-size:10.5px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:rgba(255,255,255,.7);}
.co-support{display:flex;flex-wrap:wrap;align-items:center;gap:10px;margin:calc(var(--gap) + 8px) 0 0;}
.co-support__t{margin:0 8px 0 0!important;font-size:13px!important;color:var(--muted)!important;}
.co-support a{
  display:inline-flex;align-items:center;min-height:38px;padding:0 16px;border-radius:999px;
  background:#fff;border:1px solid var(--line);font-size:13.5px;color:var(--ny)!important;text-decoration:none!important;
  transition:border-color .3s ease,color .3s ease;
}
.co-support a:hover{border-color:var(--ny2);color:var(--ny2)!important;}

/* ---- ABOUT: the ecosystem stays exactly as it was -------------------------
   Its markup is the capture's, verbatim, inside .elementor-258, so
   post-258.css, valunxt-brand.css and the UAE page-image rule that paint it
   all still reach it. Nothing in this sheet touches it. */

/* ---- ABOUT: philosophy ---------------------------------------------------- */
.at-root section.co-philo{padding:clamp(52px,5.6vw,92px) 0 clamp(28px,3vw,44px)!important;}
.co-philo__grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:var(--gap);}
.co-card{display:flex;flex-direction:column;text-decoration:none!important;color:inherit;}
.co-card__shot{position:relative;isolation:isolate;overflow:hidden;display:block;aspect-ratio:1/1.02;border-radius:var(--radius);background:#07142f;}
.co-card__shot img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:transform .9s cubic-bezier(.22,1,.36,1);}
.co-card:hover .co-card__shot img{transform:scale(1.05);}
.co-card__shot::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(4,14,36,.05) 30%,rgba(4,14,36,.78) 100%);}
.co-card__tag{position:absolute;left:clamp(18px,1.8vw,26px);right:18px;bottom:clamp(18px,1.8vw,24px);z-index:1;color:#fff;font-size:clamp(20px,1.8vw,26px);font-weight:400;line-height:1.18;letter-spacing:-.01em;}
.co-card__tag small{display:block;margin-bottom:8px;font-size:10.5px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:rgba(255,255,255,.72);}
.co-card__not{display:block;margin:22px 0 6px;font-size:14px;line-height:1.5;color:var(--muted);text-decoration:line-through;text-decoration-color:rgba(106,117,144,.55);}
.co-card__yes{display:block;margin:0 0 16px;font-size:clamp(16px,1.3vw,18px);line-height:1.5;color:var(--ny);}
.co-card__more{display:inline-flex;align-items:center;gap:8px;margin-top:auto;font-size:13px;font-weight:600;color:var(--ny2);transition:gap .3s ease;}
.co-card:hover .co-card__more{gap:14px;}

/* The banner's quote runs a little larger than a service banner's head. */
.at-root .co-quote .at-prob__head{font-size:clamp(22px,2.3vw,32px)!important;max-width:22ch;}

/* ---- CLIENTS: the index --------------------------------------------------- */
.at-root section.co-index{padding:clamp(48px,5.4vw,84px) 0 clamp(24px,3vw,40px)!important;}
.co-index__grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:var(--gap);}
.co-ix{
  position:relative;isolation:isolate;overflow:hidden;display:flex;flex-direction:column;
  min-height:clamp(250px,21vw,300px);padding:clamp(22px,2vw,28px);
  border-radius:var(--radius);border:1px solid var(--line);background:#fff;
  color:var(--ny)!important;text-decoration:none!important;transition:border-color .4s ease,color .4s ease;
}
.co-ix::before{content:"";position:absolute;inset:0;z-index:-1;background:var(--brand);opacity:0;transition:opacity .45s ease;}
.co-ix:hover{border-color:transparent;color:#fff!important;}
.co-ix:hover::before{opacity:1;}
.co-ix__top{display:flex;align-items:center;justify-content:space-between;margin:0;}
.co-ix__n{font-size:12px;font-weight:700;letter-spacing:.12em;color:var(--ny2);transition:color .4s ease;}
.co-ix__icon{display:grid;place-items:center;width:46px;height:46px;border-radius:13px;background:var(--tint);color:var(--ny2);transition:background-color .4s ease,color .4s ease;}
.co-ix__icon svg{width:22px;height:22px;}
.co-ix__t{display:block;margin:30px 0 8px;font-size:clamp(18px,1.5vw,21px);font-weight:400;line-height:1.25;}
.co-ix__d{display:block;font-size:14px;line-height:1.6;color:var(--body);transition:color .4s ease;}
.co-ix__go{display:inline-flex;align-items:center;gap:8px;margin-top:auto;padding-top:18px;font-size:13px;font-weight:600;color:var(--ny2);transition:color .4s ease,gap .3s ease;}
.co-ix__go svg{width:14px;height:14px;}
.co-ix:hover .co-ix__n,.co-ix:hover .co-ix__go{color:#fff;}
.co-ix:hover .co-ix__go{gap:14px;}
.co-ix:hover .co-ix__d{color:rgba(255,255,255,.86);}
.co-ix:hover .co-ix__icon{background:rgba(255,255,255,.16);color:#fff;}

/* ---- CLIENTS: one section per segment ------------------------------------ */
.at-root section.co-seg{padding:clamp(44px,5vw,80px) 0!important;scroll-margin-top:110px;}
.at-root section.co-seg--tint{background:var(--tint);}
.co-seg__grid{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(0,.95fr);gap:clamp(32px,6vw,104px);align-items:center;}
.co-seg__grid--flip .co-seg__fig{order:2;}
.co-seg__fig{position:relative;isolation:isolate;overflow:hidden;margin:0;border-radius:var(--radius);aspect-ratio:5/4;background:#07142f;}
.co-seg__fig .at-plate{--throw:18px;}
.co-seg__fig::after{content:"";position:absolute;inset:0;z-index:-1;background:linear-gradient(180deg,rgba(4,14,36,.35) 0%,rgba(4,14,36,0) 34%);}
.co-seg__num{position:absolute;left:clamp(18px,2vw,26px);top:clamp(12px,1.6vw,20px);z-index:1;font-size:clamp(54px,6vw,92px);font-weight:300;line-height:1;letter-spacing:-.04em;color:rgba(255,255,255,.94);}
.at-root .co-seg__head{
  font-weight:300!important;color:#16233C!important;font-size:clamp(28px,3.2vw,44px)!important;
  line-height:1.14!important;letter-spacing:-.014em!important;margin:0 0 18px!important;max-width:20ch;
}
.co-seg__copy p.co-seg__lede{color:var(--body)!important;font-size:16px!important;line-height:1.75!important;margin:0 0 24px!important;max-width:58ch;}
.co-seg__points{margin:0 0 30px;padding:0;list-style:none;border-top:1px solid var(--line);max-width:520px;}
.co-seg__points li{display:flex;align-items:center;gap:12px;padding:13px 0;border-bottom:1px solid var(--line);font-size:15px;line-height:1.4;color:var(--ny);}

/* ---- CLIENTS: the commitments -------------------------------------------- */
.at-root section.co-std{padding:clamp(48px,5.4vw,84px) 0!important;}
.co-std__grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));border-top:1px solid var(--line);}
.co-std__item{display:flex;flex-direction:column;gap:18px;padding:30px 28px 32px 0;border-right:1px solid var(--line);}
.co-std__item + .co-std__item{padding-left:28px;}
.co-std__item:last-child{border-right:0;}
.co-std__icon{display:grid;place-items:center;width:54px;height:54px;border-radius:50%;background:var(--brand);color:#fff;box-shadow:0 14px 28px -16px rgba(11,45,190,.7);}
.co-std__icon svg{width:24px;height:24px;}
.at-root .co-std__t{font-weight:400!important;color:var(--ny)!important;font-size:clamp(18px,1.5vw,21px)!important;line-height:1.35!important;margin:0!important;max-width:24ch;}
.co-std__link{display:inline-flex;align-items:center;gap:8px;margin-top:auto;font-size:13px;font-weight:600;color:var(--ny2)!important;text-decoration:none!important;transition:gap .3s ease;}
.co-std__link:hover{gap:14px;}

/* ---- INDUSTRIES: the sector explorer ------------------------------------- */
.at-root section.co-sectors{padding:clamp(48px,5.4vw,88px) 0!important;}
.co-sx{display:grid;grid-template-columns:minmax(0,.78fr) minmax(0,1.22fr);gap:clamp(24px,4vw,64px);align-items:start;}
.co-sx__list{position:sticky;top:120px;margin:0;padding:0;list-style:none;border-top:1px solid var(--line);}
.at-root .co-sx__tab{
  position:relative;display:grid;grid-template-columns:40px minmax(0,1fr) 18px;align-items:center;gap:12px;
  width:100%;min-height:0;margin:0;padding:clamp(16px,1.6vw,22px) 8px!important;
  border:0!important;border-bottom:1px solid var(--line)!important;border-radius:0!important;box-shadow:none!important;
  background:transparent!important;text-align:left;text-transform:none!important;letter-spacing:0!important;
  font-family:inherit;font-size:inherit;font-weight:400;line-height:1.3;color:var(--ny)!important;cursor:pointer;
  transition:background-color .3s ease,color .3s ease;
}
/* The kit paints every button's hover; both states are stated here, marked. */
.at-root .co-sx__tab::before{content:"";position:absolute;left:0;top:-1px;bottom:-1px;width:3px;background:var(--brand);opacity:0;transition:opacity .35s ease;}
.at-root .co-sx__tab:hover{background:var(--tint)!important;color:var(--ny)!important;}
.at-root .co-sx__tab.is-on,.at-root .co-sx__tab.is-on:hover{color:var(--ny2)!important;background:var(--tint)!important;}
.at-root .co-sx__tab.is-on::before{opacity:1;}
.at-root .co-sx__tab:focus-visible{outline:2px solid var(--ny2);outline-offset:-2px;}
.co-sx__n{font-size:12px;font-weight:700;letter-spacing:.1em;color:var(--muted);transition:color .3s ease;}
.at-root .co-sx__tab.is-on .co-sx__n{color:var(--ny2);}
.co-sx__t{font-size:clamp(17px,1.5vw,21px);font-weight:400;line-height:1.25;}
.co-sx__arrow{width:16px;height:16px;opacity:0;transition:opacity .3s ease;}
.at-root .co-sx__tab.is-on .co-sx__arrow{opacity:1;}
.co-sx__stage{min-width:0;}
.co-sx__panel{overflow:hidden;border-radius:var(--radius);background:#fff;border:1px solid var(--line2);box-shadow:0 44px 90px -64px rgba(6,18,32,.45);}
.co-sx__shot{position:relative;display:block;aspect-ratio:16/8.4;overflow:hidden;background:#07142f;}
.co-sx__shot img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;}
.co-sx__shot::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(4,14,36,.35) 0%,rgba(4,14,36,0) 30%);}
.co-sx__count{position:absolute;left:20px;top:18px;z-index:1;padding:7px 12px;border-radius:999px;background:rgba(8,20,54,.5);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);font-size:12px;font-weight:500;letter-spacing:.08em;color:#fff;}
.co-sx__body{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,.9fr);gap:clamp(20px,2.6vw,36px);padding:clamp(24px,2.6vw,36px);}
.at-root .co-sx__title{font-weight:400!important;color:var(--ny)!important;font-size:clamp(24px,2.4vw,34px)!important;line-height:1.14!important;letter-spacing:-.012em!important;margin:0 0 14px!important;}
.co-sx__body p.co-sx__desc{color:var(--body)!important;font-size:15.5px!important;line-height:1.72!important;margin:0!important;}
.co-sx__label{margin:0 0 10px!important;font-size:10.5px!important;font-weight:700!important;letter-spacing:.14em!important;text-transform:uppercase;color:var(--muted)!important;}
.co-sx__work{margin:0 0 22px;padding:0;list-style:none;border-top:1px solid var(--line);}
.co-sx__work li{display:flex;align-items:center;gap:10px;padding:11px 0;border-bottom:1px solid var(--line);font-size:14.5px;line-height:1.4;color:var(--ny);}
.co-sx__more{display:inline-flex;align-items:center;gap:8px;font-size:13px;font-weight:600;color:var(--ny2)!important;text-decoration:none!important;transition:gap .3s ease;}
.co-sx__more:hover{gap:14px;}

/* ---- INDUSTRIES: client segments ----------------------------------------- */
.at-root section.co-segs{background:var(--tint);padding:clamp(52px,5.6vw,92px) 0!important;}
.co-tiles{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:var(--gap);}
.co-tile{
  position:relative;isolation:isolate;overflow:hidden;display:flex;flex-direction:column;
  min-height:clamp(220px,18vw,260px);padding:clamp(22px,2.2vw,30px);
  border-radius:var(--radius);background:#fff;border:1px solid var(--line2);transition:color .4s ease,border-color .4s ease;
}
.co-tile::before{content:"";position:absolute;inset:0;z-index:-1;background:var(--brand);opacity:0;transition:opacity .45s ease;}
.co-tile:hover{border-color:transparent;}
.co-tile:hover::before{opacity:1;}
.co-tile__icon{display:grid;place-items:center;width:50px;height:50px;border-radius:14px;background:var(--tint);color:var(--ny2);margin:0;transition:background-color .4s ease,color .4s ease;}
.co-tile__icon svg{width:24px;height:24px;}
.at-root .co-tile__t{font-weight:400!important;color:var(--ny)!important;font-size:clamp(18px,1.5vw,21px)!important;line-height:1.28!important;margin:28px 0 8px!important;transition:color .4s ease;}
.co-tile p.co-tile__d{color:var(--body)!important;font-size:14.5px!important;line-height:1.62!important;margin:0!important;transition:color .4s ease;}
.at-root .co-tile:hover .co-tile__t{color:#fff!important;}
.co-tile:hover p.co-tile__d{color:rgba(255,255,255,.86)!important;}
.co-tile:hover .co-tile__icon{background:rgba(255,255,255,.16);color:#fff;}
.co-segs__foot{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:16px;margin:calc(var(--gap) + 8px) 0 0;}
.co-segs__foot p{margin:0!important;color:var(--body)!important;font-size:15px!important;line-height:1.6!important;max-width:64ch;}

/* ---- Responsive, at the template's steps --------------------------------- */
@media(max-width:1180px){
  .co-index__grid{grid-template-columns:repeat(2,minmax(0,1fr));}
  .co-pillars{grid-template-columns:repeat(2,minmax(0,1fr));}
  .co-pillar--photo{grid-column:1 / -1;min-height:320px;}
  .co-sx__body{grid-template-columns:minmax(0,1fr);}
}
@media(max-width:900px){
  .co-lead{grid-template-columns:minmax(0,1fr);gap:14px;}
  .co-lead__lede{justify-self:start;}
  .co-story__grid,.co-seg__grid{grid-template-columns:minmax(0,1fr);}
  .co-seg__grid--flip .co-seg__fig{order:0;}
  .co-story__fig{min-height:0;aspect-ratio:4/3.4;}
  .co-philo__grid{grid-template-columns:minmax(0,1fr);}
  .co-card__shot{aspect-ratio:16/10;}
  .co-std__grid{grid-template-columns:minmax(0,1fr);}
  .co-std__item,.co-std__item + .co-std__item{padding:24px 0;border-right:0;border-bottom:1px solid var(--line);}
  .co-tiles{grid-template-columns:repeat(2,minmax(0,1fr));}
  .co-sx{grid-template-columns:minmax(0,1fr);}
  .co-sx__list{position:static;display:flex;gap:8px;overflow-x:auto;border-top:0;padding:0 0 4px;scrollbar-width:none;}
  .co-sx__list::-webkit-scrollbar{display:none;}
  .co-sx__list li{flex:none;}
  .at-root .co-sx__tab{display:inline-flex;gap:8px;width:auto;padding:10px 16px!important;border:1px solid var(--line)!important;border-radius:999px!important;white-space:nowrap;}
  .at-root .co-sx__tab::before,.co-sx__arrow{display:none;}
  .at-root .co-sx__tab.is-on,.at-root .co-sx__tab.is-on:hover{background:var(--ny2)!important;border-color:var(--ny2)!important;color:#fff!important;}
  .at-root .co-sx__tab.is-on .co-sx__n{color:rgba(255,255,255,.75);}
  .co-sx__t{font-size:15px;}
}
@media(max-width:640px){
  .co-index__grid,.co-pillars,.co-tiles{grid-template-columns:minmax(0,1fr);}
  .co-ix{min-height:0;}
  .co-ix__t{margin-top:22px;}
  .co-pillar{min-height:0;}
  .at-root .co-pillar__t{margin-top:22px!important;}
  .co-tile{min-height:0;}
  .co-caps a{grid-template-columns:34px minmax(0,1fr);}
  .co-caps__go{grid-column:2;}
  .co-story__fig{aspect-ratio:4/4.4;}
  .co-why{padding:18px 18px 10px;}
  .co-why li{font-size:14px;padding:8px 0;}
}
@media (prefers-reduced-motion: reduce){
  .co-card__shot img,.co-ix::before,.co-tile::before{transition:none;}
}
`;
