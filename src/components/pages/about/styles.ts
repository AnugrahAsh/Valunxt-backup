/**
 * The about page's sheet (20260922, second redesign on client feedback:
 * "too boring and generic").
 *
 * The group's language pushed further rather than a new one: Inter, the
 * brand blue ramp, the violet of the wordmark's x as the one accent, the pill
 * kicker, 18px radii, the 1520 measure with the site's gutter formula. What is
 * new is the pace — a dark living hero, a pinned manifesto, a dark sideways
 * strip, editorial rows and a live offices panel — so the page reads as a
 * story rather than a stack of boxes.
 *
 * Scoped to .ab-root. Headings are written .ab-root .ab-x with their type
 * marked, because the Elementor kit and the UAE type scale style bare h1/h2/
 * h3 at a specificity one class cannot reach. .ab-root sets no text colour of
 * its own, so the Ecosystem section inside it (the capture, verbatim) keeps
 * every colour it inherited before.
 *
 * A TEMPLATE LITERAL: no backtick anywhere inside it.
 */
export const ABOUT_CSS = `
.ab-root{
  --ink:#16233C;--ny:#0E355F;--blue:#0B2DBE;--blue2:#1436D8;--sky:#8FB7FF;--violet:#9C00DD;
  --body:#4d5863;--muted:#6A7590;--line:rgba(14,53,95,.12);--tint:#F4F8FD;--dark:#040B2E;
  --brand:linear-gradient(150deg,#0E3FA8 0%,#1436D8 48%,#0B2DBE 100%);
  --grad:linear-gradient(100deg,#1436D8 0%,#4B53F2 50%,#9C00DD 100%);
  --gradLight:linear-gradient(100deg,#8FB7FF 0%,#B9A8FF 55%,#E3A2FF 100%);
  --gutter:clamp(16px,4vw,48px);--maxw:1520px;--r:18px;--ease:cubic-bezier(.22,1,.36,1);
  --ab-hdr:74px; /* the site header once scrolled (fixed); pinned panels sit below it */
  background:#fff;overflow-x:clip;
}
.ab-root .ab-in,.ab-root .ab-in *,.ab-root .ab-in *::before,.ab-root .ab-in *::after{box-sizing:border-box;}
.ab-in{width:100%;max-width:min(var(--maxw),calc(100% - var(--gutter) * 2));margin:0 auto;padding:0;}
.ab-root ul.ab-in,.ab-root .ab-rows,.ab-root .ab-offgrid,.ab-root .ab-caps{margin-top:0;margin-bottom:0;padding:0;list-style:none;}

.ab-root .ab-pill{
  display:inline-flex;align-items:center;gap:9px;margin:0 0 22px!important;padding:7px 15px 7px 12px!important;
  border-radius:999px;background:rgba(0,83,183,.07);border:1px solid rgba(0,83,183,.18);
  font-size:11px!important;font-weight:700!important;letter-spacing:.15em!important;line-height:1!important;
  text-transform:uppercase;color:var(--blue)!important;
}
.ab-root .ab-pill::before{content:"";width:7px;height:7px;border-radius:50%;background:currentColor;box-shadow:0 0 0 3px rgba(0,83,183,.14);}
.ab-root .ab-pill--dark{background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.22);color:#fff!important;-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);}
.ab-root .ab-pill--dark::before{background:var(--sky);box-shadow:0 0 0 3px rgba(143,183,255,.2);}
.ab-root .ab-h2{
  margin:0!important;color:var(--ink)!important;font-weight:300!important;
  font-size:clamp(32px,4vw,60px)!important;line-height:1.06!important;letter-spacing:-.025em!important;
}
.ab-root .ab-h2 em{display:block;font-style:normal;background:var(--grad);-webkit-background-clip:text;background-clip:text;color:transparent;}

/* ---- Hero ---------------------------------------------------------------- */
.ab-hero{
  position:relative;isolation:isolate;overflow:hidden;display:flex;flex-direction:column;justify-content:flex-end;
  min-height:clamp(640px,calc(100svh - 94px),940px);color:#fff;
  background:radial-gradient(70% 90% at 72% 48%,#0B2DBE 0%,#081F8E 22%,#050F52 48%,#040B2E 78%);
}
.ab-hero__canvas{position:absolute;inset:0;z-index:-2;opacity:0;transition:opacity 1.4s ease;}
.ab-hero__canvas.is-ready{opacity:1;}
.ab-hero__canvas canvas{display:block;width:100%!important;height:100%!important;}
.ab-hero__scrim{
  position:absolute;inset:0;z-index:-1;pointer-events:none;
  background:linear-gradient(90deg,rgba(4,11,46,.78) 0%,rgba(4,11,46,.35) 36%,rgba(4,11,46,0) 60%),linear-gradient(0deg,rgba(4,11,46,.85) 0%,rgba(4,11,46,0) 30%);
}
.ab-hero__inner{padding:clamp(64px,10vh,120px) 0 clamp(28px,5vh,52px);}
.ab-crumb{display:flex;align-items:center;gap:8px;margin:0 0 26px;font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:rgba(255,255,255,.6);}
.ab-crumb a{color:rgba(255,255,255,.6)!important;text-decoration:none!important;transition:color .3s ease;}
.ab-crumb a:hover{color:#fff!important;}
.ab-root .ab-hero__title{
  max-width:13ch;margin:0 0 22px!important;color:#fff!important;font-weight:400!important;
  font-size:clamp(44px,5.6vw,88px)!important;line-height:.98!important;letter-spacing:-.04em!important;
}
.ab-w{display:inline-block;overflow:hidden;vertical-align:bottom;padding:0 .02em .1em 0;margin-bottom:-.1em;}
.ab-w > span{display:inline-block;will-change:transform;}
.ab-root .ab-hl{background:var(--gradLight);-webkit-background-clip:text;background-clip:text;color:transparent;}
.ab-root .ab-hero__lede{max-width:50ch;margin:0!important;font-size:clamp(15px,1.25vw,18.5px)!important;line-height:1.7!important;color:rgba(255,255,255,.8)!important;}
.ab-hero__cue{display:inline-flex;align-items:center;gap:12px;margin-top:28px;font-size:11.5px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:rgba(255,255,255,.72)!important;text-decoration:none!important;}
.ab-hero__cue i{position:relative;width:24px;height:38px;border:1.5px solid rgba(255,255,255,.5);border-radius:14px;}
.ab-hero__cue i::after{content:"";position:absolute;left:50%;top:7px;width:4px;height:8px;margin-left:-2px;border-radius:2px;background:#fff;animation:ab-wheel 1.9s ease-in-out infinite;}
@keyframes ab-wheel{0%{opacity:0;transform:translateY(0);}30%{opacity:1;}100%{opacity:0;transform:translateY(12px);}}
.ab-facts{position:relative;border-top:1px solid rgba(255,255,255,.14);background:rgba(4,11,46,.38);-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);}
.ab-facts ul{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));}
.ab-facts li{display:flex;align-items:center;gap:16px;padding:22px 20px 24px 0;}
.ab-facts li + li{padding-left:24px;border-left:1px solid rgba(255,255,255,.12);}
.ab-facts strong{font-size:clamp(30px,3vw,46px);font-weight:300;letter-spacing:-.03em;line-height:1;color:#fff;font-variant-numeric:tabular-nums;}
.ab-facts span{display:grid;gap:2px;font-size:12.5px;line-height:1.4;color:rgba(255,255,255,.62);}
.ab-facts b{font-size:14px;font-weight:500;color:#fff;}

/* ---- Manifesto ------------------------------------------------------------ */
.ab-mani{position:relative;height:280vh;background:#fff;}
.ab-mani--still{height:auto;}
.ab-mani__pin{position:sticky;top:var(--ab-hdr);display:flex;align-items:center;height:calc(100vh - var(--ab-hdr));height:calc(100svh - var(--ab-hdr));overflow:hidden;}
.ab-mani--still .ab-mani__pin{position:static;height:auto;padding:clamp(72px,9vw,140px) 0;}
.ab-root .ab-mani__text{
  max-width:1240px;margin:0!important;color:var(--ink)!important;font-weight:300!important;
  font-size:clamp(28px,4.3vw,66px)!important;line-height:1.14!important;letter-spacing:-.028em!important;
}
.ab-root .ab-mw{display:inline;}
.ab-root .ab-mw--yes{background:var(--grad);-webkit-background-clip:text;background-clip:text;color:transparent;}
.ab-mani__links{display:flex;flex-wrap:wrap;gap:10px;margin-top:clamp(30px,4vh,48px);}
.ab-mani__links a{
  display:inline-flex;align-items:center;gap:10px;min-height:44px;padding:0 20px;border-radius:999px;
  border:1px solid var(--line);font-size:14px;font-weight:500;color:var(--ink)!important;text-decoration:none!important;
  transition:background-color .3s ease,color .3s ease,border-color .3s ease;
}
.ab-mani__links a:hover{background:var(--blue);border-color:var(--blue);color:#fff!important;}
.ab-mani__bar{position:absolute;left:0;bottom:0;height:3px;width:0;background:var(--grad);}

/* ---- Who we are, in figures ---------------------------------------------- */
.ab-who{padding:clamp(72px,9vw,150px) 0;background:var(--tint);}
.ab-who__grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.05fr);gap:clamp(40px,6vw,120px);align-items:start;}
.ab-root .ab-who__head{
  margin:0 0 26px!important;color:var(--ink)!important;font-weight:300!important;
  font-size:clamp(26px,2.7vw,40px)!important;line-height:1.22!important;letter-spacing:-.018em!important;
}
.ab-root .ab-who__head em{font-style:normal;background:var(--grad);-webkit-background-clip:text;background-clip:text;color:transparent;}
.ab-root .ab-who__p{max-width:60ch;margin:0 0 30px!important;color:var(--body)!important;font-size:16.5px!important;line-height:1.75!important;}
.ab-caps{border-top:1px solid var(--line);}
.ab-caps a{
  display:grid;grid-template-columns:48px minmax(0,1fr) 40px;align-items:center;gap:14px;padding:20px 4px;
  border-bottom:1px solid var(--line);color:var(--ink)!important;text-decoration:none!important;transition:color .3s ease;
}
.ab-caps a:hover{color:var(--blue)!important;}
.ab-caps__n{font-size:12px;font-weight:700;letter-spacing:.12em;color:var(--muted);}
.ab-caps__t{font-size:clamp(17px,1.5vw,21px);font-weight:400;line-height:1.3;}
.ab-caps__go{display:grid;place-items:center;width:40px;height:40px;border-radius:50%;border:1px solid var(--line);color:var(--blue);transition:background-color .3s ease,color .3s ease,border-color .3s ease;}
.ab-caps a:hover .ab-caps__go{background:var(--blue);border-color:var(--blue);color:#fff;}
.ab-col{position:relative;min-height:clamp(480px,46vw,680px);}
.ab-col__main{position:absolute;right:0;top:0;width:80%;height:84%;overflow:hidden;border-radius:var(--r);box-shadow:0 50px 90px -60px rgba(6,18,32,.55);}
.ab-col__inset{position:absolute;left:0;bottom:0;width:48%;aspect-ratio:4/3.1;overflow:hidden;border-radius:var(--r);border:6px solid var(--tint);box-shadow:0 40px 80px -40px rgba(6,18,32,.5);}
.ab-col__main img,.ab-col__inset img{display:block;width:100%;height:100%;object-fit:cover;}
.ab-root .ab-col__note{
  position:absolute;right:5%;bottom:10%;z-index:2;max-width:270px;margin:0!important;padding:18px 20px;border-radius:14px;
  background:rgba(255,255,255,.74);border:1px solid rgba(255,255,255,.8);-webkit-backdrop-filter:blur(16px);backdrop-filter:blur(16px);
  box-shadow:0 30px 60px -34px rgba(6,18,32,.45);color:var(--ink)!important;font-size:15px!important;line-height:1.4!important;
}
.ab-col__note small{display:block;margin-bottom:6px;font-size:10.5px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--blue);}

/* ---- Practices, sideways -------------------------------------------------- */
.ab-prac{position:relative;background:var(--dark);color:#fff;background-image:radial-gradient(60% 70% at 85% 0%,rgba(20,54,216,.35),transparent 70%);}
.ab-prac__pin{box-sizing:border-box;display:flex;flex-direction:column;justify-content:center;gap:clamp(28px,4.5vh,52px);padding:clamp(72px,8vw,120px) 0;overflow:hidden;}
.ab-prac.is-pinned .ab-prac__pin{position:sticky;top:var(--ab-hdr);height:calc(100vh - var(--ab-hdr));height:calc(100svh - var(--ab-hdr));justify-content:flex-start;gap:clamp(22px,3.6vh,44px);padding:clamp(28px,5.5vh,64px) 0;}
.ab-prac.is-pinned .ab-prac__track{flex:1 1 auto;min-height:0;max-height:580px;align-items:stretch;}
.ab-prac.is-pinned .ab-pc{height:auto;min-height:0;}
.ab-prac__head{display:flex;align-items:flex-end;justify-content:space-between;gap:24px;}
.ab-root .ab-prac__h{color:#fff!important;}
.ab-root .ab-prac__h em{background:var(--gradLight);-webkit-background-clip:text;background-clip:text;}
.ab-prac__bar{flex:none;width:220px;height:2px;margin-bottom:12px;border-radius:2px;background:rgba(255,255,255,.14);overflow:hidden;}
.ab-prac__bar span{display:block;width:0;height:100%;background:var(--gradLight);}
.ab-prac__track{display:flex;gap:20px;width:max-content;padding:0 var(--gutter);will-change:transform;}
.ab-pc{
  position:relative;isolation:isolate;overflow:hidden;flex:none;display:flex;flex-direction:column;justify-content:flex-end;
  width:min(430px,78vw);height:min(560px,calc(100svh - 290px));min-height:400px;padding:clamp(22px,2.2vw,30px);
  border-radius:var(--r);background:#0B1540;color:#fff!important;text-decoration:none!important;
}
.ab-pc img{position:absolute;inset:0;z-index:-2;width:100%;height:100%;object-fit:cover;transition:transform 1.1s var(--ease);}
.ab-pc::after{content:"";position:absolute;inset:0;z-index:-1;background:linear-gradient(180deg,rgba(4,11,46,.42) 0%,rgba(4,11,46,0) 20%,rgba(4,11,46,.06) 42%,rgba(4,11,46,.92) 100%);transition:opacity .5s ease;}
.ab-pc::before{content:"";position:absolute;inset:0;z-index:-1;background:var(--brand);opacity:0;mix-blend-mode:multiply;transition:opacity .5s ease;}
.ab-pc:hover img{transform:scale(1.07);}
.ab-pc:hover::before{opacity:.55;}
.ab-pc__n{position:absolute;left:clamp(18px,1.8vw,24px);top:clamp(18px,1.8vw,24px);padding:7px 12px;border-radius:999px;border:1px solid rgba(255,255,255,.26);background:rgba(6,14,52,.38);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);font-size:12px;font-weight:600;line-height:1;letter-spacing:.14em;color:#fff;}
.ab-pc__t{display:block;margin:0 0 10px;font-size:clamp(22px,1.9vw,28px);font-weight:400;line-height:1.15;letter-spacing:-.01em;}
.ab-pc__d{display:block;margin:0 0 18px;font-size:14px;line-height:1.6;color:rgba(255,255,255,.8);}
.ab-pc__go{display:inline-flex;align-items:center;gap:8px;font-size:13px;font-weight:600;color:#fff;transition:gap .3s ease;}
.ab-pc:hover .ab-pc__go{gap:14px;}

/* ---- Purpose -------------------------------------------------------------- */
.ab-purpose{padding:clamp(80px,10vw,160px) 0 0;background:#fff;overflow:hidden;}
.ab-purpose__top{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(0,1fr);gap:clamp(32px,5vw,88px);align-items:center;margin:0 0 clamp(48px,5vw,80px);}
.ab-root .ab-purpose__big{
  max-width:12ch;margin:0!important;color:var(--ink)!important;font-weight:300!important;
  font-size:clamp(40px,5.6vw,92px)!important;line-height:1!important;letter-spacing:-.045em!important;
}
.ab-vc{margin:0;padding:clamp(18px,2vw,26px);border:1px solid var(--line);border-radius:var(--r);background:linear-gradient(180deg,#F6F9FE 0%,#fff 70%);box-shadow:0 30px 70px -48px rgba(11,45,190,.45);}
.ab-vc__head{display:flex;align-items:center;justify-content:space-between;gap:12px 20px;flex-wrap:wrap;margin:0 0 14px;}
.ab-vc__k{font-size:11px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:var(--ink);}
.ab-vc__legend{display:inline-flex;align-items:center;gap:8px;font-size:12px;color:var(--muted);}
.ab-vc__sw{display:inline-block;width:18px;height:3px;border-radius:3px;background:var(--grad);}
.ab-vc__sw--noise{height:2px;background:rgba(14,53,95,.34);}
.ab-vc__legend .ab-vc__sw:not(:first-child){margin-left:10px;}
.ab-vc__plot{position:relative;aspect-ratio:560 / 420;}
.ab-vc__plot svg{display:block;width:100%;height:100%;overflow:visible;}
.ab-vc__run{stroke-dasharray:.07 1.4;animation:ab-vc-run 3.8s cubic-bezier(.45,0,.35,1) infinite;}
@keyframes ab-vc-run{0%{stroke-dashoffset:.07;opacity:0}10%{opacity:1}82%{opacity:1}100%{stroke-dashoffset:-1;opacity:0}}
.ab-vc__dot{position:absolute;width:14px;height:14px;margin:-7px 0 0 -7px;border-radius:50%;background:#9C00DD;box-shadow:0 0 0 5px rgba(156,0,221,.16);}
.ab-vc__dot::after{content:"";position:absolute;inset:-5px;border-radius:50%;border:1.5px solid rgba(156,0,221,.45);animation:ab-vc-pulse 2.4s ease-out infinite;}
@keyframes ab-vc-pulse{from{transform:scale(.6);opacity:1}to{transform:scale(2.4);opacity:0}}
.ab-vc__tag{position:absolute;transform:translate(calc(-100% - 20px),-50%);padding:7px 12px;border-radius:999px;background:var(--ink);color:#fff;font-size:12px;font-weight:600;white-space:nowrap;box-shadow:0 14px 30px -14px rgba(22,35,60,.6);}
.ab-root .ab-purpose__big em{font-style:normal;background:var(--grad);-webkit-background-clip:text;background-clip:text;color:transparent;}
.ab-purpose__row{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,1fr) minmax(0,1fr);gap:clamp(24px,4vw,72px);padding-top:30px;border-top:1px solid var(--line);}
.ab-root .ab-purpose__p{margin:0!important;color:var(--body)!important;font-size:17px!important;line-height:1.72!important;}
.ab-pil{display:flex;flex-direction:column;gap:10px;}
.ab-pil__n{font-size:12px;font-weight:700;letter-spacing:.12em;color:var(--blue);}
.ab-root .ab-pil__t{margin:0!important;color:var(--ink)!important;font-weight:400!important;font-size:clamp(19px,1.6vw,23px)!important;line-height:1.25!important;}
.ab-root .ab-pil__d{margin:0!important;color:var(--body)!important;font-size:15px!important;line-height:1.65!important;}
.ab-marq{margin-top:clamp(64px,7vw,110px);padding:26px 0 30px;border-top:1px solid var(--line);border-bottom:1px solid var(--line);overflow:hidden;}
.ab-marq__label{display:block;margin:0 0 14px;text-align:center;font-size:11px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:var(--muted);}
.ab-marq__track{display:flex;width:max-content;animation:ab-marq 42s linear infinite;}
.ab-marq:hover .ab-marq__track{animation-play-state:paused;}
.ab-marq__track a{
  display:inline-flex;align-items:center;gap:30px;padding:0 30px;white-space:nowrap;text-decoration:none!important;
  font-size:clamp(36px,5vw,78px);font-weight:300;letter-spacing:-.035em;line-height:1.08;color:var(--ink)!important;transition:color .3s ease;
}
.ab-marq__track a:nth-child(even){color:transparent!important;-webkit-text-stroke:1.2px rgba(14,53,95,.42);}
.ab-marq__track a:hover{color:var(--blue)!important;-webkit-text-stroke:0 transparent;}
.ab-marq__track a::after{content:"";width:.22em;height:.22em;border-radius:50%;background:var(--grad);flex:none;}
@keyframes ab-marq{to{transform:translateX(-50%);}}

/* ---- Why Valunxt ---------------------------------------------------------- */
.ab-why{padding:clamp(72px,9vw,150px) 0;background:#fff;}
.ab-why__head{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:24px clamp(32px,6vw,96px);align-items:end;margin:0 0 clamp(32px,4vw,60px);}
.ab-root .ab-why__lede{justify-self:end;max-width:52ch;margin:0 0 6px!important;color:var(--body)!important;font-size:16.5px!important;line-height:1.7!important;}
.ab-rows{position:relative;border-top:1px solid var(--line);}
.ab-row{
  position:relative;isolation:isolate;display:grid;grid-template-columns:64px minmax(0,1.5fr) minmax(0,1fr) 44px;align-items:center;gap:clamp(16px,3vw,40px);
  padding:clamp(26px,3vw,44px) 0;border-bottom:1px solid var(--line);
}
.ab-row::before{content:"";position:absolute;top:0;bottom:0;left:calc(var(--gutter) * -1);right:calc(var(--gutter) * -1);z-index:-1;background:var(--tint);opacity:0;transition:opacity .45s ease;}
.ab-row.is-on::before,.ab-row:hover::before{opacity:1;}
.ab-row__n{font-size:13px;font-weight:600;letter-spacing:.12em;color:var(--muted);transition:color .35s ease;}
.ab-root .ab-row__t{margin:0!important;color:var(--ink)!important;font-weight:300!important;font-size:clamp(28px,3.3vw,52px)!important;line-height:1.02!important;letter-spacing:-.035em!important;transition:color .35s ease;}
.ab-root .ab-row__d{margin:0!important;max-width:46ch;color:var(--body)!important;font-size:15.5px!important;line-height:1.65!important;}
.ab-row__arrow{display:grid;place-items:center;width:44px;height:44px;border-radius:50%;border:1px solid var(--line);color:var(--blue);transition:background-color .35s ease,color .35s ease,border-color .35s ease;}
.ab-root .ab-row.is-on .ab-row__t,.ab-root .ab-row:hover .ab-row__t{color:var(--blue)!important;}
.ab-row.is-on .ab-row__n,.ab-row:hover .ab-row__n{color:var(--blue);}
.ab-row.is-on .ab-row__arrow,.ab-row:hover .ab-row__arrow{background:var(--blue);border-color:var(--blue);color:#fff;}
.ab-float{position:absolute;left:0;top:0;z-index:5;width:300px;height:210px;pointer-events:none;}
.ab-float__card{position:absolute;inset:0;overflow:hidden;border-radius:16px;box-shadow:0 34px 70px -30px rgba(6,18,32,.55);}
.ab-float__card img{width:100%;height:100%;object-fit:cover;}

/* ---- Offices -------------------------------------------------------------- */
.ab-off{padding:clamp(72px,9vw,150px) 0;background:var(--tint);}
.ab-off__head{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:24px clamp(32px,6vw,96px);align-items:end;margin:0 0 clamp(28px,3.5vw,48px);}
.ab-root .ab-off__lede{justify-self:end;max-width:50ch;margin:0 0 6px!important;color:var(--body)!important;font-size:16.5px!important;line-height:1.7!important;}
.ab-map{position:relative;overflow:hidden;margin:0 0 16px;padding:clamp(16px,2.4vw,34px) clamp(12px,2vw,28px);border-radius:var(--r);background:radial-gradient(80% 120% at 70% 20%,#0B2DBE 0%,#061A7A 34%,#040B2E 78%);}
.ab-map svg{display:block;width:100%;height:auto;}
.ab-map__region{font-size:13px;font-weight:700;letter-spacing:.3em;fill:rgba(143,183,255,.32);}
.ab-map__arc{fill:none;stroke:rgba(143,183,255,.22);stroke-width:1.4;}
.ab-map__flow{fill:none;stroke:url(#ab-arc);stroke-width:2.2;stroke-linecap:round;stroke-dasharray:60 540;animation:ab-flow 3.6s linear infinite;}
@keyframes ab-flow{from{stroke-dashoffset:600;}to{stroke-dashoffset:0;}}
.ab-map__dot{fill:#fff;stroke:#8FB7FF;stroke-width:3;}
.ab-map__pulse{fill:rgba(143,183,255,.25);transform-box:fill-box;transform-origin:center;animation:ab-pulse 2.4s ease-out infinite;}
@keyframes ab-pulse{0%{transform:scale(.3);opacity:.9;}100%{transform:scale(1.8);opacity:0;}}
.ab-map__label{font-size:17px;font-weight:500;fill:#fff;}
.ab-offgrid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px;}
.ab-office{display:flex;flex-direction:column;gap:12px;padding:clamp(20px,2vw,28px);border-radius:var(--r);background:#fff;border:1px solid var(--line);transition:border-color .35s ease,box-shadow .35s ease;}
.ab-office:hover{border-color:rgba(11,45,190,.28);box-shadow:0 30px 60px -42px rgba(6,18,32,.4);}
.ab-office__top{display:flex;align-items:center;justify-content:space-between;gap:10px;}
.ab-office__country{font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);}
.ab-office__status{display:inline-flex;align-items:center;gap:7px;font-size:12px;font-weight:600;color:var(--muted);}
.ab-office__status i{position:relative;width:8px;height:8px;border-radius:50%;background:#B7BECE;}
.ab-office__status.is-open{color:#128A57;}
.ab-office__status.is-open i{background:#1FA971;}
.ab-office__status.is-open i::after{content:"";position:absolute;inset:-4px;border-radius:50%;border:2px solid #1FA971;opacity:0;animation:ab-ping 2s ease-out infinite;}
@keyframes ab-ping{0%{transform:scale(.5);opacity:.8;}100%{transform:scale(1.6);opacity:0;}}
.ab-root .ab-office__city{margin:0!important;color:var(--ink)!important;font-weight:400!important;font-size:clamp(24px,2.1vw,32px)!important;line-height:1.1!important;letter-spacing:-.02em!important;}
.ab-office__time{display:flex;align-items:baseline;gap:4px;margin:0!important;font-size:clamp(38px,3.4vw,54px);font-weight:300;letter-spacing:-.04em;line-height:1;font-variant-numeric:tabular-nums;background:var(--grad);-webkit-background-clip:text;background-clip:text;color:transparent;}
.ab-office__time span{font-size:.42em;letter-spacing:0;}
.ab-office__time small{margin-left:8px;font-size:12px;font-weight:600;letter-spacing:.1em;color:var(--muted);-webkit-text-fill-color:var(--muted);}
.ab-root .ab-office__addr{margin:0!important;color:var(--body)!important;font-size:13.5px!important;line-height:1.6!important;}
.ab-office__links{display:flex;flex-wrap:wrap;justify-content:space-between;gap:10px;margin-top:auto;padding-top:14px;border-top:1px solid var(--line);}
.ab-office__links a{font-size:13px;font-weight:600;color:var(--blue)!important;text-decoration:none!important;}
.ab-office__links a:hover{text-decoration:underline!important;}

/* The Ecosystem section is the capture, verbatim, and this sheet leaves it
   alone. Only the gap around it is set, from outside. */
.ab-eco{background:#fff;}

/* ---- Responsive ----------------------------------------------------------- */
@media(max-width:1180px){
  .ab-offgrid{grid-template-columns:repeat(2,minmax(0,1fr));}
  .ab-purpose__row{grid-template-columns:minmax(0,1fr) minmax(0,1fr);}
  .ab-purpose__row > :first-child{grid-column:1 / -1;}
}
@media(max-width:1000px){
  .ab-purpose__top{grid-template-columns:minmax(0,1fr);}
  .ab-purpose__top .ab-vc{max-width:620px;}
}
@media(max-width:900px){
  .ab-facts ul{grid-template-columns:repeat(2,minmax(0,1fr));}
  .ab-facts li:nth-child(3){padding-left:0;border-left:0;}
  .ab-facts li:nth-child(n + 3){border-top:1px solid rgba(255,255,255,.12);}
  .ab-who__grid,.ab-why__head,.ab-off__head{grid-template-columns:minmax(0,1fr);}
  .ab-why__lede,.ab-off__lede{justify-self:start;}
  .ab-prac__track{overflow-x:auto;width:auto;padding-bottom:6px;scroll-snap-type:x mandatory;scrollbar-width:none;}
  .ab-prac__track::-webkit-scrollbar{display:none;}
  .ab-pc{scroll-snap-align:start;height:440px;min-height:0;}
  .ab-prac__bar{display:none;}
  .ab-row{grid-template-columns:44px minmax(0,1fr) 40px;}
  .ab-row__d{grid-column:2 / 3;}
  .ab-row__arrow{grid-row:1;grid-column:3;}
  .ab-float{display:none;}
  .ab-mani{height:220vh;}
}
@media(max-width:640px){
  .ab-hero{min-height:calc(100svh - 70px);}
  .ab-hero__inner{padding-top:120px;}
  .ab-hero__scrim{background:linear-gradient(0deg,rgba(4,11,46,.92) 0%,rgba(4,11,46,.55) 48%,rgba(4,11,46,.1) 100%);}
  .ab-facts li{flex-direction:column;align-items:flex-start;padding:16px 12px 18px 0;gap:8px;}
  .ab-facts strong{white-space:nowrap;font-size:32px;}
  .ab-facts li:nth-child(even){padding-left:16px;}
  .ab-col{min-height:400px;}
  .ab-col__main{width:88%;height:80%;}
  .ab-col__inset{width:56%;}
  .ab-root .ab-col__note{right:0;bottom:4%;max-width:210px;padding:14px 16px;font-size:13.5px!important;}
  .ab-purpose__row{grid-template-columns:minmax(0,1fr);}
  .ab-offgrid{grid-template-columns:minmax(0,1fr);}
  .ab-map{padding:10px 4px;}
  .ab-map__label{font-size:36px;}
}
@media (prefers-reduced-motion: reduce){
  .ab-marq__track,.ab-map__flow,.ab-map__pulse,.ab-office__status.is-open i::after,.ab-hero__cue i::after,.ab-vc__dot::after{animation:none;}
}
`;
