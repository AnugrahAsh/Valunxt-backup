/**
 * /en-ae/ — the UAE home page body.
 *
 * Port of en-ae/index.php. The captured Elementor markup is unchanged: the only
 * edits are the ones JSX requires (className, self-closed voids, style objects)
 * and internal links going through rurl() so they stay in the visitor's market.
 */
import { rimg, rimgFirst } from '@/lib/region-assets';
import { BASE, rurl, vxnServices, type Service } from '@/lib/region';
import CtaArrow from '@/components/ui/CtaArrow';
import Html from '@/components/Html';
import ClientScript from '@/components/ClientScript';
import type { PageConfig } from '@/lib/page-config';
import { LogoXClipDefs } from '@/components/brand/LogoX';
import WhoWeAreTrio from '@/components/sections/WhoWeAreTrio';
import UaeFigureBand from '@/components/sections/UaeFigureBand';
import UaeAnswerBand from '@/components/sections/UaeAnswerBand';
import UaeImpactBands from '@/components/sections/UaeImpactBands';
import UaeBandMotion from '@/components/sections/UaeBandMotion';
import UaeReadyBand from '@/components/sections/UaeReadyBand';
import UaeSubscribeBand from '@/components/sections/UaeSubscribeBand';

/** The small entity set the hero's aria-labels and alt text need decoded. */
function decodeEntities(v: string): string {
  return v
    .replace(/&amp;/g, '&')
    .replace(/&mdash;/g, '\u2014')
    .replace(/&ndash;/g, '\u2013')
    .replace(/&#8212;/g, '\u2014')
    .replace(/&nbsp;/g, '\u00a0');
}

export default function HomeAeBody({ page, region }: { page: PageConfig; region: string }) {
  /* One list behind the hero, the accordion below it and the Services menu in
     the header. Three of the six (accounting and tax, valuation, and the
     mortgage desk) opt out of the banner with hero: false. */
  const services = vxnServices(region);
  const hero = services.filter((s) => s.hero !== false);

  /* The pill on a slide is its own call: the free consultation unless the
     registry names another (the "Explore …" slides lead to their service
     page). The ring beside it takes whichever of the two routes the pill did
     not, so no slide offers the same page twice. */
  const heroPill = (s: Service) => s.cta ?? { label: 'Free Consultation', href: '/free-consultation/' };
  const heroRing = (s: Service) =>
    heroPill(s).href === s.href
      ? { label: 'Free Consultation', href: '/free-consultation/' }
      : { label: decodeEntities(s.title), href: s.href };

  return (
    <>
      {/* One definition of the wordmark's x, referenced by every card that
          shows a photograph through it. */}
      <LogoXClipDefs />

      <style id="home-icon-premium" dangerouslySetInnerHTML={{ __html: `
      	/* Premium uniform icon treatment: a 40px precision glyph centred in a
      	   72px soft tile — identical size in every section (the raw icons were
      	   rendering at 50/76/85px depending on the widget, which looked broken).
      	   The tile also isolates the glyph from the gold card-hover background,
      	   so the gold accents stay gold everywhere. */
      	svg.vxn-icon,
      	#main-content img[src*="/assets/icons/"] {
      		width: 72px !important;
      		height: 72px !important;
      		box-sizing: border-box;
      		padding: 16px;
      		background: #FBFAF7;
      		border: 1px solid rgba(14, 53, 95, .08);
      		border-radius: 16px;
      		transition: background .25s ease, border-color .25s ease;
      	}

      	:is(.elementor-element-a546be9, .elementor-element-ba03ed4, .elementor-element-1f1d60c,
      		.elementor-element-dbd27b0, .elementor-element-42a3d07, .elementor-element-d043720):hover svg.vxn-icon {
      		background: #ffffff;
      		border-color: rgba(14, 53, 95, .14);
      	}

      	/* This page carries no "Who We Are" section: the .elementor-2190 block it
      	   inherited was replaced by a .vxn-plat two-rail layout, and that has now been
      	   dropped as well. The India edition still renders the original block. */

      ` }} />
      {/* .vxn-ae-home scopes this page's section rhythm. The services wrapper,
          the insights containers and the Elementor post id are all shared with
          the India home, so the padding rules have to hang off a class only
          this page carries. */}
      <div id="main-content" className="vxn-ae-home">

      	<div id="sub-header" className="layout-full elementor-page-title">
      		<div className="meta-header">
      		</div>
      	</div>

      	<div id="main" role="main" className="vamtam-main layout-full">
      		<div className="page-wrapper">
      			<article id="post-17" className="full post-17 page type-page status-publish hentry">
      				<div className="page-content clearfix the-content-parent">
      					<div data-elementor-type="wp-page" data-elementor-id="17" className="elementor elementor-17" data-elementor-post-type="page">
      {/* UAE hero — one slide per service, driven by vxnServices() so the banner,
          the accordion below it and the Services menu in the header can never drift
          apart. The tab row along the bottom is the slider control. */}
      <style id="uae-hero-css" dangerouslySetInnerHTML={{ __html: `
      	/* The header is position:fixed with an in-flow spacer, so the hero is
      	   pulled up under the bar and given matching top padding — --vxae-hdr is
      	   measured from the spacer at runtime. Without JS the hero simply starts
      	   below the bar, which is how the rest of the site behaves. */
      	.vxae-hero {
      		--vxae-hdr: 0px;
      		position: relative;
      		display: flex;
      		align-items: center;
      		width: 100%;
      		/* Just short of the full viewport: 97vh leaves a sliver of the next
      		   section showing, which is what tells the visitor there is more below.
      		   The 560px floor is for short landscape viewports, where 97vh is not
      		   enough room for the headline, the CTA row and the tab strip. */
      		min-height: max(560px, 100vh);
      		/* No pull-up: the header now cancels its own reserved height (see
      		   valunxt-brand.css), so the hero already begins under the bar. It only
      		   needs the top padding that keeps the copy clear of it. */
      		padding: calc(var(--vxae-hdr) + 40px) 0 150px;
      		overflow: hidden;
      		background: #0E355F;
      		isolation: isolate;
      	}

      	.vxae-hero__stage {
      		position: absolute;
      		inset: 0;
      		z-index: -2;
      	}

      	.vxae-hero__slide {
      		position: absolute;
      		inset: 0;
      		opacity: 0;
      		transition: opacity 1.1s ease;
      	}

      	.vxae-hero__slide.is-active { opacity: 1; }

      	.vxae-hero__slide img {
      		width: 100%;
      		height: 100%;
      		object-fit: cover;
      		object-position: center 42%;
      		display: block;
      		transform: scale(1.02);
      	}

      	/* A slow drift on the live slide only — it keeps a still photograph from
      	   feeling like a screenshot without ever calling attention to itself. */
      	.vxae-hero__slide.is-active img { animation: vxae-drift 12s ease-out forwards; }

      	@keyframes vxae-drift {
      		from { transform: scale(1.02); }
      		to   { transform: scale(1.09); }
      	}

      	/* Left-weighted scrim, deliberately light: every one of the four
      	   photographs puts its subject right of centre, so only the copy side needs
      	   help and the picture is left to read as a picture. Just enough weight
      	   under the headline to hold white type, thinning to nothing across the
      	   subject; a whisper at the top so the nav stays legible, and at the bottom
      	   so the tab row has something to sit on. */
      	.vxae-hero__scrim {
      		position: absolute;
      		inset: 0;
      		z-index: 2;
      		background:
      			linear-gradient(90deg, rgba(6, 17, 26, .66) 0%, rgba(6, 17, 26, .48) 34%, rgba(6, 17, 26, .16) 64%, rgba(6, 17, 26, 0) 100%),
      			linear-gradient(180deg, rgba(6, 17, 26, .34) 0%, rgba(6, 17, 26, 0) 30%, rgba(6, 17, 26, .30) 100%);
      	}

      	/* The page's container (20260911): every band on this page runs to
      	   min(1520px, 100% - 2 gutters), and the hero used to be on 1560 with 34px
      	   inside it, so its headline sat 14px right of the trio at 1920 and 14px
      	   left of it at 1440. The gutter is the one declared on .vxn-ae-home. */
      	.vxae-hero__inner {
      		width: 100%;
      		max-width: min(1520px, calc(100% - var(--vxn-gutter, clamp(16px, 4vw, 48px)) * 2));
      		margin: 0 auto;
      		padding: 0;
      	}

      	.vxae-hero__copy {
      		position: relative;
      		max-width: 720px;
      		min-height: 330px;
      	}

      	.vxae-hero__panel {
      		position: absolute;
      		inset: 0;
      		opacity: 0;
      		visibility: hidden;
      		transform: translateY(18px);
      		/* The outgoing panel clears fast; the incoming one waits for it, so the two
      		   headlines never sit on top of each other mid-change. */
      		transition: opacity .26s ease, transform .26s ease, visibility .26s;
      		pointer-events: none;
      	}

      	.vxae-hero__panel.is-active {
      		position: relative;
      		opacity: 1;
      		visibility: visible;
      		transform: none;
      		pointer-events: auto;
      		transition: opacity .5s ease .18s, transform .55s ease .18s, visibility 0s;
      	}

      	.vxae-hero__title {
      		margin: 0 0 20px;
      		color: #fff !important;
      		font-size: clamp(34px, 4.1vw, 62px) !important;
      		line-height: 1.08 !important;
      		letter-spacing: -.015em;
      		font-weight: 400 !important;
      	}

      	.vxae-hero__lede {
      		margin: 0 0 34px;
      		max-width: 560px;
      		color: rgba(255, 255, 255, .82) !important;
      		font-size: clamp(15px, 1.15vw, 17px) !important;
      		line-height: 1.6 !important;
      	}

      	.vxae-hero__actions {
      		display: flex;
      		align-items: center;
      		gap: 14px;
      		flex-wrap: wrap;
      	}

      	/* The one CTA (20260911) in its inverse finish: white with the brand ink
      	   on the photograph, the site's 46px / 28px / 14px geometry from the
      	   tokens in valunxt-brand.css. The wedge sweeping it on hover is defined
      	   there for every CTA; a white pill takes the pale wedge and keeps its
      	   ink, so the label never has to turn. It was 54px tall at 15px. */
      	.vxae-hero__cta {
      		display: inline-flex;
      		align-items: center;
      		min-height: var(--vxn-cta-h, 46px);
      		padding: 0 var(--vxn-cta-px, 28px);
      		border-radius: var(--vxn-cta-r, 999px);
      		background: #fff;
      		color: var(--vxn-cta-ink, #0B2DBE) !important;
      		font-size: var(--vxn-cta-fs, 14px);
      		font-weight: var(--vxn-cta-fw, 400);
      		letter-spacing: var(--vxn-cta-ls, .01em);
      		text-decoration: none;
      		--vxn-cta-sweep: var(--vxn-cta-sweep-light, #EAF0FF);
      	}

      	.vxae-hero__cta:hover,
      	.vxae-hero__cta:focus-visible {
      		color: var(--vxn-cta-ink, #0B2DBE) !important;
      	}

      	/* The ring beside the pill matches the pill's height. */
      	.vxae-hero__go {
      		display: inline-flex;
      		align-items: center;
      		justify-content: center;
      		width: var(--vxn-cta-h, 46px);
      		height: var(--vxn-cta-h, 46px);
      		border-radius: 50%;
      		background-image: var(--vxn-cta-grad);
      		color: #fff !important;
      		text-decoration: none;
      		transition: transform .25s ease, filter .25s ease;
      	}

      	.vxae-hero__go:hover,
      	.vxae-hero__go:focus-visible { transform: translateY(-1px) rotate(45deg); }

      	.vxae-hero__go svg { display: block; }

      	/* ---- The tab row doubles as the slider control ---------------------- */

      	.vxae-hero__tabs {
      		position: absolute;
      		left: 0;
      		right: 0;
      		bottom: 34px;
      		z-index: 2;
      		display: grid;
      		/* One column per service, whatever vxn_services() returns — the tab row
      		   is the service list, so it must not be pinned to a count. */
      		grid-auto-flow: column;
      		grid-auto-columns: 1fr;
      		gap: 10px;
      		width: 100%;
      		/* The page's container, as .vxae-hero__inner. */
      		max-width: min(1520px, calc(100% - var(--vxn-gutter, clamp(16px, 4vw, 48px)) * 2));
      		margin: 0 auto;
      		padding: 0;
      	}

      	.vxae-hero__tab {
      		position: relative;
      		display: flex;
      		align-items: center;
      		min-height: 58px;
      		padding: 12px 16px;
      		border: 1px solid rgba(255, 255, 255, .24) !important;
      		border-radius: 6px !important;
      		background: rgba(9, 22, 33, .26) !important;
      		background-image: none !important;
      		-webkit-backdrop-filter: blur(18px) saturate(150%);
      		backdrop-filter: blur(18px) saturate(150%);
      		color: rgba(255, 255, 255, .82) !important;
      		font-size: 12px !important;
      		font-weight: 700;
      		letter-spacing: .14em;
      		line-height: 1.3;
      		text-align: left;
      		text-transform: uppercase;
      		cursor: pointer;
      		overflow: hidden;
      		transition: background-color .3s ease, color .3s ease, border-color .3s ease;
      	}

      	.vxae-hero__tab:hover { background: rgba(9, 22, 33, .44) !important; color: #fff !important; }

      	.vxae-hero__tab.is-active {
      		background: #fff !important;
      		border-color: #fff !important;
      		color: var(--vxn-navy) !important;
      	}

      	/* Autoplay made visible: the bar fills for as long as the slide is held. */
      	.vxae-hero__progress {
      		position: absolute;
      		left: 0;
      		bottom: 0;
      		height: 2px;
      		width: 100%;
      		transform: scaleX(0);
      		transform-origin: left;
      		background-image: var(--vxn-grad-gold);
      	}

      	.vxae-hero__tab.is-active .vxae-hero__progress { animation: vxae-fill var(--vxae-dur, 6500ms) linear forwards; }

      	@keyframes vxae-fill { to { transform: scaleX(1); } }

      	@media (max-width: 1024px) {
      		.vxae-hero { min-height: 0; padding: calc(var(--vxae-hdr) + 90px) 0 250px; }
      		/* No 18px inset of its own here any more: the container formula above
      		   already gives 4vw at these widths, 16px at the narrowest, which is what
      		   every other band on the page has. */
      		.vxae-hero__copy { min-height: 300px; }
      		.vxae-hero__scrim { background: linear-gradient(180deg, rgba(6, 17, 26, .62) 0%, rgba(6, 17, 26, .44) 45%, rgba(6, 17, 26, .70) 100%); }
      		.vxae-hero__tabs { grid-auto-flow: row; grid-template-columns: repeat(2, 1fr); gap: 8px; bottom: 22px; }
      		.vxae-hero__tab { min-height: 52px; padding: 10px 14px; font-size: 10.5px !important; letter-spacing: .1em; }
      	}

      	@media (max-width: 560px) {
      		.vxae-hero__copy { min-height: 340px; }
      		/* The pill and the ring keep the one CTA's size on phones too. */
      	}

      	@media (prefers-reduced-motion: reduce) {
      		.vxae-hero__slide.is-active img { animation: none; }
      		.vxae-hero__panel { transition: none; }
      		.vxae-hero__tab.is-active .vxae-hero__progress { animation: none; transform: scaleX(1); }
      	}
      ` }} />

      <section className="vxae-hero" data-vxae-hero="" aria-label="Valunxt in the United Arab Emirates">
      	<div className="vxae-hero__stage" aria-hidden="true">
      		{hero.map((s, i) => (
      			<div className={`vxae-hero__slide${i === 0 ? ' is-active' : ''}`} data-vxae-slide={String(i)} key={s.title}>
      				{/* eslint-disable-next-line @next/next/no-img-element */}
      				<img
      					src={rimgFirst(region, s.banner ?? [])}
      					alt=""
      					width={1685}
      					height={950}
      					{...(i === 0 ? { fetchPriority: 'high' as const } : { loading: 'lazy' as const })}
      				/>
      			</div>
      		))}
      		<span className="vxae-hero__scrim"></span>
      	</div>

      	<div className="vxae-hero__inner">
      		<div className="vxae-hero__copy">
      			{hero.map((s, i) => (
      				<div
      					className={`vxae-hero__panel${i === 0 ? ' is-active' : ''}`}
      					data-vxae-panel={String(i)}
      					role="group"
      					aria-roledescription="slide"
      					aria-label={`${i + 1} of ${hero.length}`}
      					key={s.title}
      				>
      					<Html as="h1" className="vxae-hero__title" html={s.headline ?? ''} />
      					<Html as="p" className="vxae-hero__lede" html={s.lede ?? ''} />
      					<div className="vxae-hero__actions">
      						<a className="vxae-hero__cta" href={rurl(region, heroPill(s).href)}>{heroPill(s).label}<CtaArrow /></a>
      						<a className="vxae-hero__go" href={rurl(region, heroRing(s).href)} aria-label={heroRing(s).label}>
      							<svg viewBox="0 0 18 18" width={18} height={18} aria-hidden="true" focusable="false">
      								<path d="M4.5 13.5L13.5 4.5M6 4.5h7.5V12" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      							</svg>
      						</a>
      					</div>
      				</div>
      			))}
      		</div>
      	</div>

      	<div className="vxae-hero__tabs" role="tablist" aria-label="Practice areas">
      		{hero.map((s, i) => (
      			<button
      				type="button"
      				className={`vxae-hero__tab${i === 0 ? ' is-active' : ''}`}
      				role="tab"
      				data-vxae-tab={String(i)}
      				aria-selected={i === 0}
      				key={s.title}
      			>
      				<Html as="span" html={s.short} />
      				<span className="vxae-hero__progress" aria-hidden="true"></span>
      			</button>
      		))}
      	</div>
      </section>

      <ClientScript id="uae-hero-js" code={`
      	(function () {
      		var root = document.querySelector('[data-vxae-hero]');
      		if (!root) return;

      		var slides = root.querySelectorAll('[data-vxae-slide]');
      		var panels = root.querySelectorAll('[data-vxae-panel]');
      		var tabs = root.querySelectorAll('[data-vxae-tab]');
      		var count = tabs.length;
      		var DUR = 6500;
      		var at = 0;
      		var timer = null;
      		var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      		/* The header is fixed with an in-flow spacer; measuring it here lets the
      		   hero sit under the bar the way the design shows, whatever height the
      		   bar ends up at on this breakpoint. */
      		function offset() {
      			var spacer = document.querySelector('.vamtam-sticky-header--spacer');
      			if (spacer) root.style.setProperty('--vxae-hdr', Math.round(spacer.getBoundingClientRect().height) + 'px');
      		}

      		function show(n) {
      			at = (n + count) % count;
      			for (var i = 0; i < count; i++) {
      				var on = i === at;
      				slides[i].classList.toggle('is-active', on);
      				panels[i].classList.toggle('is-active', on);
      				tabs[i].classList.remove('is-active');       // retrigger the progress fill
      				tabs[i].setAttribute('aria-selected', on ? 'true' : 'false');
      			}
      			void tabs[at].offsetWidth;
      			tabs[at].classList.add('is-active');
      		}

      		function play() {
      			stop();
      			if (still) return;
      			timer = setTimeout(function () { show(at + 1); play(); }, DUR);
      		}

      		function stop() { if (timer) { clearTimeout(timer); timer = null; } }

      		root.style.setProperty('--vxae-dur', DUR + 'ms');

      		for (var i = 0; i < count; i++) {
      			(function (n) {
      				tabs[n].addEventListener('click', function () { show(n); play(); });
      			})(i);
      		}

      		root.addEventListener('mouseenter', stop);
      		root.addEventListener('mouseleave', play);
      		root.addEventListener('focusin', stop);
      		document.addEventListener('visibilitychange', function () {
      			if (document.hidden) stop(); else play();
      		});
      		window.addEventListener('resize', offset);

      		offset();
      		play();
      	})();
      `} />

      						{/* The three feature cards that used to close this edition's "Who We Are"
      						    section. The section has gone; the cards stay, so they carry the container
      						    it used to give them — .vxn-trio is a bare 3-up grid with no width of its
      						    own. India still renders them inside its own section. */}
      						<section className="vxn-trio-solo">
      							<WhoWeAreTrio region={region} />
      						</section>
      						{/* The figures band (20260912), built to the reference supplied that
      						    day. It sits between the trio and the six services so the proof
      						    is read before the offer. UAE only. */}
      						<UaeFigureBand region={region} />
      						<div className="vxn-home-svc-section">
      							<div className="elementor-element elementor-element-85963b4 e-flex e-con-boxed e-con e-parent" data-id="85963b4" data-element_type="container" data-e-type="container">
      								<div className="e-con-inner">
      									<div className="elementor-element elementor-element-04c603a e-con-full e-flex e-con e-child" data-id="04c603a" data-element_type="container" data-e-type="container">
      										<div className="elementor-element elementor-element-118f825 elementor-invisible animated-fast elementor-widget elementor-widget-heading" data-id="118f825" data-element_type="widget" data-e-type="widget" data-settings={"{\"_animation\":\"slideInUp\"}"} data-widget_type="heading.default">
      											<div className="elementor-widget-container">
      												<span className="elementor-heading-title elementor-size-default">Our Services</span>
      											</div>
      										</div>
      										<div className="elementor-element elementor-element-e5cafd1 elementor-invisible elementor-widget__width-initial elementor-widget-tablet__width-inherit animated-fast elementor-widget elementor-widget-heading" data-id="e5cafd1" data-element_type="widget" data-e-type="widget" data-settings={"{\"_animation\":\"slideInUp\",\"_animation_delay\":100}"} data-widget_type="heading.default">
      											<div className="elementor-widget-container">
      												<h2 className="elementor-heading-title elementor-size-default">Six Services. One Integrated Platform.</h2>
      											</div>
      										</div>
      									</div>
      									<div className="elementor-element elementor-element-eb91688 elementor-invisible elementor-widget-tablet__width-initial elementor-widget__width-initial animated-fast elementor-widget elementor-widget-heading" data-id="eb91688" data-element_type="widget" data-e-type="widget" data-settings={"{\"_animation\":\"slideInUp\",\"_animation_delay\":200}"} data-widget_type="heading.default">
      										<div className="elementor-widget-container">
      											<span className="elementor-heading-title elementor-size-default">Accounting, transactions, mortgages, valuation, research and technology &#8212; six connected practices supporting confident, informed decisions in the UAE.</span>
      										</div>
      									</div>
      								</div>
      							</div>
      							{/* One list, three consumers: this accordion, the hero above it and the
      							    Services menu in the header all read vxnServices(). */}
      							<nav className="vxn-klay vxn-klay--six" aria-label="Our services">
      								{services.map((sv, i) => (
      									<a className={`vxn-klay__panel${i === 0 ? ' is-active' : ''}`} href={rurl(region, sv.href)} key={sv.title}>
      										{/* eslint-disable-next-line @next/next/no-img-element */}
      										<div className="vxn-klay__bg"><img src={rimg(region, sv.img.replace('/assets/content/uploads/', '').replace(/^\/+/, ''))} alt={decodeEntities(sv.title)} loading="lazy" /></div>
      										{/* No index number and no x motif on this edition — the
      										    collapsed panels carry the label alone. India still
      										    renders both. */}
      										<Html as="span" className="vxn-klay__label" aria-hidden="true" html={sv.short} />
      										<div className="vxn-klay__content">
      											<Html as="h3" className="vxn-klay__title" html={sv.title} />
      											<Html as="p" className="vxn-klay__desc" html={sv.desc} />
      											<span className="vxn-klay__btn">Learn more <i aria-hidden="true" className="vamtamtheme- vamtam-theme-arrow-right vxn-cta__arrow"></i></span>
      										</div>
      									</a>
      								))}
      							</nav>
      						</div>
      						{/* The question band (20260911; rebuilt light and static 20260914).
      						    It follows the six services because every question it answers is
      						    one of theirs. UAE only. */}
      						<UaeAnswerBand region={region} />
      						{/* The feature bands (impact, mosaic; the spotlight came off on 20260911
      						    and the careers band on 20260915), between the Answer band and the
      						    insights carousel. UAE only — India does not render them. */}
      						<UaeImpactBands region={region} />
      						{/* "Expertise Measured in Decades." (.vxn-xp, UaeExpertiseBand.tsx),
      						    built to the client's reference in the careers band's place,
      						    came off the page on 20260915, client instruction. The
      						    component and its styles stay, unrendered. */}
      						{/* The bento (.vxn-post, UaePosterTrio.tsx) came off the page on
      						    20260915, client instruction. The component and its styles
      						    stay, unrendered. */}
      						{/* One motion layer for both of the day's bands: the figure roll
      						    and the staggered arrival. Renders nothing. */}
      						<UaeBandMotion />
      						<div className="elementor-element elementor-element-c50d7c9 e-flex e-con-boxed e-con e-parent" data-id="c50d7c9" data-element_type="container" data-e-type="container">
      							<div className="e-con-inner">
      								<div className="elementor-element elementor-element-9317f8a e-con-full e-flex e-con e-child" data-id="9317f8a" data-element_type="container" data-e-type="container">
      									<div className="elementor-element elementor-element-fc98675 elementor-invisible animated-fast elementor-widget elementor-widget-heading" data-id="fc98675" data-element_type="widget" data-e-type="widget" data-settings={"{\"_animation\":\"slideInUp\"}"} data-widget_type="heading.default">
      										<div className="elementor-widget-container">
      											<span className="elementor-heading-title elementor-size-default">Insights</span>
      										</div>
      									</div>
      									<div className="elementor-element elementor-element-73bb323 elementor-invisible elementor-widget__width-initial elementor-widget-tablet__width-inherit animated-fast elementor-widget elementor-widget-heading" data-id="73bb323" data-element_type="widget" data-e-type="widget" data-settings={"{\"_animation\":\"slideInUp\",\"_animation_delay\":100}"} data-widget_type="heading.default">
      										<div className="elementor-widget-container">
      											<h2 className="elementor-heading-title elementor-size-default">Our Latest Insights</h2>
      										</div>
      									</div>
      								</div>
      								<div className="elementor-element elementor-element-e3649ed elementor-invisible elementor-widget-tablet__width-initial elementor-widget__width-initial animated-fast elementor-widget elementor-widget-heading" data-id="e3649ed" data-element_type="widget" data-e-type="widget" data-settings={"{\"_animation\":\"slideInUp\",\"_animation_delay\":200}"} data-widget_type="heading.default">
      									<div className="elementor-widget-container">
      										<span className="elementor-heading-title elementor-size-default">Practical guidance on UAE tax, accounting and valuation, written for the leaders who have to act on it.</span>
      									</div>
      								</div>
      							</div>
      						</div>
      						{/* .vxn-insights-round is a UAE-only hook: it rounds the post
      						    thumbnails in this carousel and nothing else. The Elementor
      						    ids in here are shared with the India home page, so the
      						    rounding has to hang off a class only this page carries. */}
      						<div className="elementor-element elementor-element-413d07d e-flex e-con-boxed e-con e-parent vxn-insights-round" data-id="413d07d" data-element_type="container" data-e-type="container">
      							<div className="e-con-inner">
      								<div className="vamtam-has-theme-widget-styles elementor-element elementor-element-9a8edf1 elementor-pagination-type-bullets elementor-pagination-position-outside elementor-widget elementor-widget-loop-carousel" data-id="9a8edf1" data-element_type="widget" data-e-type="widget" data-settings={"{\"template_id\":\"1961\",\"slides_to_show\":\"4\",\"image_spacing_custom\":{\"unit\":\"px\",\"size\":20,\"sizes\":[]},\"_skin\":\"post\",\"slides_to_show_tablet\":\"2\",\"slides_to_show_mobile\":\"1\",\"slides_to_scroll\":\"1\",\"edit_handle_selector\":\".elementor-loop-container\",\"speed\":500,\"pagination\":\"bullets\",\"image_spacing_custom_tablet\":{\"unit\":\"px\",\"size\":\"\",\"sizes\":[]},\"image_spacing_custom_mobile\":{\"unit\":\"px\",\"size\":\"\",\"sizes\":[]}}"} data-widget_type="loop-carousel.post">
      									<div className="elementor-widget-container">
      										<div className="swiper elementor-loop-container elementor-grid" role="list" dir="ltr">
      											<div className="swiper-wrapper" aria-live="polite">
      												<style id="loop-1961" dangerouslySetInnerHTML={{ __html: `
      													.elementor-1961 .elementor-element.elementor-element-8b3458c {
      														--display: flex;
      														--gap: 15px 15px;
      														--row-gap: 15px;
      														--column-gap: 15px;
      														--padding-top: 0px;
      														--padding-bottom: 0px;
      														--padding-left: 0px;
      														--padding-right: 0px;
      													}

      													.elementor-1961 .elementor-element.elementor-element-e4b59e9 {
      														--display: flex;
      														--flex-direction: row;
      														--container-widget-width: calc((1 - var(--container-widget-flex-grow)) * 100%);
      														--container-widget-height: 100%;
      														--container-widget-flex-grow: 1;
      														--container-widget-align-self: stretch;
      														--flex-wrap-mobile: wrap;
      														--align-items: center;
      														--gap: 10px 10px;
      														--row-gap: 10px;
      														--column-gap: 10px;
      														--padding-top: 0px;
      														--padding-bottom: 0px;
      														--padding-left: 0px;
      														--padding-right: 0px;
      													}

      													.elementor-1961 .elementor-element.elementor-element-4e1ffcd>.elementor-widget-container {
      														background-color: var(--e-global-color-vamtam_accent_3);
      														padding: 8px 8px 8px 8px;
      														border-radius: 4px 4px 4px 4px;
      													}

      													.elementor-1961 .elementor-element.elementor-element-4e1ffcd:hover .elementor-widget-container {
      														background-color: var(--e-global-color-vamtam_accent_4);
      													}

      													.elementor-1961 .elementor-element.elementor-element-4e1ffcd .elementor-icon-list-items:not(.elementor-inline-items) .elementor-icon-list-item:not(:last-child) {
      														padding-bottom: calc(10px/2);
      													}

      													.elementor-1961 .elementor-element.elementor-element-4e1ffcd .elementor-icon-list-items:not(.elementor-inline-items) .elementor-icon-list-item:not(:first-child) {
      														margin-top: calc(10px/2);
      													}

      													.elementor-1961 .elementor-element.elementor-element-4e1ffcd .elementor-icon-list-items.elementor-inline-items .elementor-icon-list-item {
      														margin-right: calc(10px/2);
      														margin-left: calc(10px/2);
      													}

      													.elementor-1961 .elementor-element.elementor-element-4e1ffcd .elementor-icon-list-items.elementor-inline-items {
      														margin-right: calc(-10px/2);
      														margin-left: calc(-10px/2);
      													}

      													body.rtl .elementor-1961 .elementor-element.elementor-element-4e1ffcd .elementor-icon-list-items.elementor-inline-items .elementor-icon-list-item:after {
      														left: calc(-10px/2);
      													}

      													body:not(.rtl) .elementor-1961 .elementor-element.elementor-element-4e1ffcd .elementor-icon-list-items.elementor-inline-items .elementor-icon-list-item:after {
      														right: calc(-10px/2);
      													}

      													.elementor-1961 .elementor-element.elementor-element-4e1ffcd .elementor-icon-list-icon {
      														width: 14px;
      													}

      													.elementor-1961 .elementor-element.elementor-element-4e1ffcd .elementor-icon-list-icon i {
      														font-size: 14px;
      													}

      													.elementor-1961 .elementor-element.elementor-element-4e1ffcd .elementor-icon-list-icon svg {
      														--e-icon-list-icon-size: 14px;
      													}

      													.elementor-1961 .elementor-element.elementor-element-4e1ffcd .elementor-icon-list-text,
      													.elementor-1961 .elementor-element.elementor-element-4e1ffcd .elementor-icon-list-text a {
      														color: var(--e-global-color-597ed21);
      													}

      													.elementor-1961 .elementor-element.elementor-element-4e1ffcd .elementor-icon-list-item {
      														font-size: var(--e-global-typography-798d94d-font-size);
      														font-weight: var(--e-global-typography-798d94d-font-weight);
      														line-height: var(--e-global-typography-798d94d-line-height);
      													}

      													.elementor-1961 .elementor-element.elementor-element-923a9ab .elementor-icon-list-icon {
      														width: 14px;
      													}

      													.elementor-1961 .elementor-element.elementor-element-923a9ab .elementor-icon-list-icon i {
      														font-size: 14px;
      													}

      													.elementor-1961 .elementor-element.elementor-element-923a9ab .elementor-icon-list-icon svg {
      														--e-icon-list-icon-size: 14px;
      													}

      													.elementor-1961 .elementor-element.elementor-element-923a9ab .elementor-icon-list-item {
      														font-size: var(--e-global-typography-798d94d-font-size);
      														font-weight: var(--e-global-typography-798d94d-font-weight);
      														line-height: var(--e-global-typography-798d94d-line-height);
      													}

      													.elementor-1961 .elementor-element.elementor-element-74fce07 .elementor-heading-title {
      														color: var(--e-global-color-vamtam_accent_6);
      													}

      													.elementor-1961 .elementor-element.elementor-element-74fce07 .elementor-heading-title a:hover,
      													.elementor-1961 .elementor-element.elementor-element-74fce07 .elementor-heading-title a:focus {
      														color: var(--e-global-color-vamtam_accent_1);
      													}

      													.elementor-1961 .elementor-element.elementor-element-abced80 .elementor-widget-container {
      														font-size: var(--e-global-typography-d778ca5-font-size);
      														line-height: var(--e-global-typography-d778ca5-line-height);
      														color: var(--e-global-color-vamtam_accent_8);
      													}

      													@media(max-width:1024px) {
      														.elementor-1961 .elementor-element.elementor-element-8b3458c {
      															--gap: 10px 10px;
      															--row-gap: 10px;
      															--column-gap: 10px;
      														}

      														.elementor-1961 .elementor-element.elementor-element-e4b59e9 {
      															--margin-top: 4px;
      															--margin-bottom: 0px;
      															--margin-left: 0px;
      															--margin-right: 0px;
      														}

      														.elementor-1961 .elementor-element.elementor-element-4e1ffcd .elementor-icon-list-item {
      															font-size: var(--e-global-typography-798d94d-font-size);
      															line-height: var(--e-global-typography-798d94d-line-height);
      														}

      														.elementor-1961 .elementor-element.elementor-element-923a9ab .elementor-icon-list-item {
      															font-size: var(--e-global-typography-798d94d-font-size);
      															line-height: var(--e-global-typography-798d94d-line-height);
      														}

      														.elementor-1961 .elementor-element.elementor-element-abced80>.elementor-widget-container {
      															margin: -0.3em 0em 0em 0em;
      														}

      														.elementor-1961 .elementor-element.elementor-element-abced80 .elementor-widget-container {
      															font-size: var(--e-global-typography-d778ca5-font-size);
      															line-height: var(--e-global-typography-d778ca5-line-height);
      														}
      													}

      													@media(max-width:767px) {
      														.elementor-1961 .elementor-element.elementor-element-4e1ffcd .elementor-icon-list-item {
      															font-size: var(--e-global-typography-798d94d-font-size);
      															line-height: var(--e-global-typography-798d94d-line-height);
      														}

      														.elementor-1961 .elementor-element.elementor-element-923a9ab .elementor-icon-list-item {
      															font-size: var(--e-global-typography-798d94d-font-size);
      															line-height: var(--e-global-typography-798d94d-line-height);
      														}

      														.elementor-1961 .elementor-element.elementor-element-abced80 .elementor-widget-container {
      															font-size: var(--e-global-typography-d778ca5-font-size);
      															line-height: var(--e-global-typography-d778ca5-line-height);
      														}
      													}
      												` }} />
      												<div data-elementor-type="loop-item" data-elementor-id="1961" className="elementor elementor-1961 swiper-slide e-loop-item e-loop-item-1959 post-1959 post type-post status-publish format-standard has-post-thumbnail hentry category-expert-advice category-industry-insights tag-property tag-taxes" data-elementor-post-type="elementor_library" role="group" aria-roledescription="slide" data-custom-edit-handle="1">
      													<div className="elementor-element elementor-element-8b3458c animated-fast e-flex e-con-boxed e-con e-parent" data-id="8b3458c" data-element_type="container" data-e-type="container" data-settings={"{\"animation\":\"none\",\"animation_delay\":100}"}>
      														<div className="e-con-inner">
      															<div className="elementor-element elementor-element-9b0d8db animated-fast elementor-widget elementor-widget-theme-post-featured-image elementor-widget-image" data-id="9b0d8db" data-element_type="widget" data-e-type="widget" data-settings={"{\"_animation\":\"none\"}"} data-widget_type="theme-post-featured-image.default">
      																<div className="elementor-widget-container">
      																	<a href={rurl(region, '/blogs/how-high-net-worth-investors-build-wealth-through-real-estate/')}>
      																		<img loading="lazy" decoding="async" width={750} height={1024} src={`${BASE}/assets/content/uploads/blogs/blog-1.webp`} className="attachment-large size-large wp-image-1948" alt="" /> </a>
      																</div>
      															</div>
      															<div className="elementor-element elementor-element-e4b59e9 e-con-full e-flex e-con e-child" data-id="e4b59e9" data-element_type="container" data-e-type="container">
      																<div className="elementor-element elementor-element-923a9ab elementor-widget elementor-widget-post-info" data-id="923a9ab" data-element_type="widget" data-e-type="widget" data-widget_type="post-info.default">
      																	<div className="elementor-widget-container">
      																		<ul className="elementor-inline-items elementor-icon-list-items elementor-post-info">
      																			<li className="elementor-icon-list-item elementor-repeater-item-3c380d1 elementor-inline-item" itemProp="datePublished">
      																				<span className="elementor-icon-list-text elementor-post-info__item elementor-post-info__item--type-date">
      																					<time>July 11, 2026</time> </span>
      																			</li>
      																		</ul>
      																	</div>
      																</div>
      															</div>
      															<div className="elementor-element elementor-element-74fce07 elementor-widget elementor-widget-theme-post-title elementor-page-title elementor-widget-heading" data-id="74fce07" data-element_type="widget" data-e-type="widget" data-widget_type="theme-post-title.default">
      																<div className="elementor-widget-container">
      																	<h5 className="elementor-heading-title elementor-size-default"><a href={rurl(region, '/blogs/how-high-net-worth-investors-build-wealth-through-real-estate/')}>How High-Net-Worth Investors Build Wealth Through Real Estate</a></h5>
      																</div>
      															</div>
      															<div className="elementor-element elementor-element-abced80 vamtam-show-on-hover elementor-widget elementor-widget-theme-post-excerpt" data-id="abced80" data-element_type="widget" data-e-type="widget" data-widget_type="theme-post-excerpt.default">
      																<div className="elementor-widget-container">
      																	For affluent investors, real estate is a disciplined, multi-decade strategy for compounding capital, generating income, and preserving wealth across cycles. </div>
      															</div>
      														</div>
      													</div>
      												</div>
      												<div data-elementor-type="loop-item" data-elementor-id="1961" className="elementor elementor-1961 swiper-slide e-loop-item e-loop-item-1955 post-1955 post type-post status-publish format-standard has-post-thumbnail hentry category-success-story tag-retail-brand-increase tag-sales" data-elementor-post-type="elementor_library" role="group" aria-roledescription="slide" data-custom-edit-handle="1">
      													<div className="elementor-element elementor-element-8b3458c animated-fast e-flex e-con-boxed e-con e-parent" data-id="8b3458c" data-element_type="container" data-e-type="container" data-settings={"{\"animation\":\"none\",\"animation_delay\":100}"}>
      														<div className="e-con-inner">
      															<div className="elementor-element elementor-element-9b0d8db animated-fast elementor-widget elementor-widget-theme-post-featured-image elementor-widget-image" data-id="9b0d8db" data-element_type="widget" data-e-type="widget" data-settings={"{\"_animation\":\"none\"}"} data-widget_type="theme-post-featured-image.default">
      																<div className="elementor-widget-container">
      																	<a href={rurl(region, '/blogs/capital-planning-for-large-property-developments/')}>
      																		<img loading="lazy" decoding="async" width={750} height={1024} src={`${BASE}/assets/content/uploads/blogs/blog-2.webp`} className="attachment-large size-large wp-image-1949" alt="" /> </a>
      																</div>
      															</div>
      															<div className="elementor-element elementor-element-e4b59e9 e-con-full e-flex e-con e-child" data-id="e4b59e9" data-element_type="container" data-e-type="container">
      																<div className="elementor-element elementor-element-923a9ab elementor-widget elementor-widget-post-info" data-id="923a9ab" data-element_type="widget" data-e-type="widget" data-widget_type="post-info.default">
      																	<div className="elementor-widget-container">
      																		<ul className="elementor-inline-items elementor-icon-list-items elementor-post-info">
      																			<li className="elementor-icon-list-item elementor-repeater-item-3c380d1 elementor-inline-item" itemProp="datePublished">
      																				<span className="elementor-icon-list-text elementor-post-info__item elementor-post-info__item--type-date">
      																					<time>July 11, 2026</time> </span>
      																			</li>
      																		</ul>
      																	</div>
      																</div>
      															</div>
      															<div className="elementor-element elementor-element-74fce07 elementor-widget elementor-widget-theme-post-title elementor-page-title elementor-widget-heading" data-id="74fce07" data-element_type="widget" data-e-type="widget" data-widget_type="theme-post-title.default">
      																<div className="elementor-widget-container">
      																	<h5 className="elementor-heading-title elementor-size-default"><a href={rurl(region, '/blogs/capital-planning-for-large-property-developments/')}>Capital Planning for Large Property Developments</a></h5>
      																</div>
      															</div>
      															<div className="elementor-element elementor-element-abced80 vamtam-show-on-hover elementor-widget elementor-widget-theme-post-excerpt" data-id="abced80" data-element_type="widget" data-e-type="widget" data-widget_type="theme-post-excerpt.default">
      																<div className="elementor-widget-container">
      																	Large developments rarely fail for lack of a good idea. They fail for lack of a capital plan mapped across the full lifecycle. </div>
      															</div>
      														</div>
      													</div>
      												</div>
      												<div data-elementor-type="loop-item" data-elementor-id="1961" className="elementor elementor-1961 swiper-slide e-loop-item e-loop-item-1953 post-1953 post type-post status-publish format-standard has-post-thumbnail hentry category-success-story tag-property tag-taxes" data-elementor-post-type="elementor_library" role="group" aria-roledescription="slide" data-custom-edit-handle="1">
      													<div className="elementor-element elementor-element-8b3458c animated-fast e-flex e-con-boxed e-con e-parent" data-id="8b3458c" data-element_type="container" data-e-type="container" data-settings={"{\"animation\":\"none\",\"animation_delay\":100}"}>
      														<div className="e-con-inner">
      															<div className="elementor-element elementor-element-9b0d8db animated-fast elementor-widget elementor-widget-theme-post-featured-image elementor-widget-image" data-id="9b0d8db" data-element_type="widget" data-e-type="widget" data-settings={"{\"_animation\":\"none\"}"} data-widget_type="theme-post-featured-image.default">
      																<div className="elementor-widget-container">
      																	<a href={rurl(region, '/blogs/why-market-intelligence-matters-before-every-property-investment/')}>
      																		<img loading="lazy" decoding="async" width={750} height={1024} src={`${BASE}/assets/content/uploads/blogs/blog-3.webp`} className="attachment-large size-large wp-image-1951" alt="" /> </a>
      																</div>
      															</div>
      															<div className="elementor-element elementor-element-e4b59e9 e-con-full e-flex e-con e-child" data-id="e4b59e9" data-element_type="container" data-e-type="container">
      																<div className="elementor-element elementor-element-923a9ab elementor-widget elementor-widget-post-info" data-id="923a9ab" data-element_type="widget" data-e-type="widget" data-widget_type="post-info.default">
      																	<div className="elementor-widget-container">
      																		<ul className="elementor-inline-items elementor-icon-list-items elementor-post-info">
      																			<li className="elementor-icon-list-item elementor-repeater-item-3c380d1 elementor-inline-item" itemProp="datePublished">
      																				<span className="elementor-icon-list-text elementor-post-info__item elementor-post-info__item--type-date">
      																					<time>July 11, 2026</time> </span>
      																			</li>
      																		</ul>
      																	</div>
      																</div>
      															</div>
      															<div className="elementor-element elementor-element-74fce07 elementor-widget elementor-widget-theme-post-title elementor-page-title elementor-widget-heading" data-id="74fce07" data-element_type="widget" data-e-type="widget" data-widget_type="theme-post-title.default">
      																<div className="elementor-widget-container">
      																	<h5 className="elementor-heading-title elementor-size-default"><a href={rurl(region, '/blogs/why-market-intelligence-matters-before-every-property-investment/')}>Why Market Intelligence Matters Before Every Property Investment</a></h5>
      																</div>
      															</div>
      															<div className="elementor-element elementor-element-abced80 vamtam-show-on-hover elementor-widget elementor-widget-theme-post-excerpt" data-id="abced80" data-element_type="widget" data-e-type="widget" data-widget_type="theme-post-excerpt.default">
      																<div className="elementor-widget-container">
      																	The best investment decisions are made before the deal, not during it. Independent intelligence turns conviction into evidence. </div>
      															</div>
      														</div>
      													</div>
      												</div>
      												<div data-elementor-type="loop-item" data-elementor-id="1961" className="elementor elementor-1961 swiper-slide e-loop-item e-loop-item-1945 post-1945 post type-post status-publish format-standard has-post-thumbnail hentry category-expert-advice tag-business-strategies" data-elementor-post-type="elementor_library" role="group" aria-roledescription="slide" data-custom-edit-handle="1">
      													<div className="elementor-element elementor-element-8b3458c animated-fast e-flex e-con-boxed e-con e-parent" data-id="8b3458c" data-element_type="container" data-e-type="container" data-settings={"{\"animation\":\"none\",\"animation_delay\":100}"}>
      														<div className="e-con-inner">
      															<div className="elementor-element elementor-element-9b0d8db animated-fast elementor-widget elementor-widget-theme-post-featured-image elementor-widget-image" data-id="9b0d8db" data-element_type="widget" data-e-type="widget" data-settings={"{\"_animation\":\"none\"}"} data-widget_type="theme-post-featured-image.default">
      																<div className="elementor-widget-container">
      																	<a href={rurl(region, '/blogs/the-future-of-automated-valuation-models-avms/')}>
      																		<img loading="lazy" decoding="async" width={750} height={1024} src={`${BASE}/assets/content/uploads/blogs/blog-4.webp`} className="attachment-large size-large wp-image-1950" alt="" /> </a>
      																</div>
      															</div>
      															<div className="elementor-element elementor-element-e4b59e9 e-con-full e-flex e-con e-child" data-id="e4b59e9" data-element_type="container" data-e-type="container">
      																<div className="elementor-element elementor-element-923a9ab elementor-widget elementor-widget-post-info" data-id="923a9ab" data-element_type="widget" data-e-type="widget" data-widget_type="post-info.default">
      																	<div className="elementor-widget-container">
      																		<ul className="elementor-inline-items elementor-icon-list-items elementor-post-info">
      																			<li className="elementor-icon-list-item elementor-repeater-item-3c380d1 elementor-inline-item" itemProp="datePublished">
      																				<span className="elementor-icon-list-text elementor-post-info__item elementor-post-info__item--type-date">
      																					<time>July 11, 2026</time> </span>
      																			</li>
      																		</ul>
      																	</div>
      																</div>
      															</div>
      															<div className="elementor-element elementor-element-74fce07 elementor-widget elementor-widget-theme-post-title elementor-page-title elementor-widget-heading" data-id="74fce07" data-element_type="widget" data-e-type="widget" data-widget_type="theme-post-title.default">
      																<div className="elementor-widget-container">
      																	<h5 className="elementor-heading-title elementor-size-default"><a href={rurl(region, '/blogs/the-future-of-automated-valuation-models-avms/')}>The Future of Automated Valuation Models (AVMs)</a></h5>
      																</div>
      															</div>
      															<div className="elementor-element elementor-element-abced80 vamtam-show-on-hover elementor-widget elementor-widget-theme-post-excerpt" data-id="abced80" data-element_type="widget" data-e-type="widget" data-widget_type="theme-post-excerpt.default">
      																<div className="elementor-widget-container">
      																	Automated valuation models are reshaping how quickly property can be valued. Knowing their strengths and limits is essential. </div>
      															</div>
      														</div>
      													</div>
      												</div>
      											</div>
      										</div>
      										<div className="swiper-pagination"></div>
      									</div>
      								</div>
      							</div>
      						</div>
      						{/* Closing bands: the three ways to start, then Valunxt Insights.
      						    India renders both since 20260915; the newsletter band had come
      						    off site-wide on 20260914 and is back by client instruction. */}
      						<UaeReadyBand region={region} />
      						<UaeSubscribeBand region={region} />
      					</div>
      				</div>
      			</article>


      		</div> {/* End of .page-wrapper */}




      	</div>{/* #main */}

      </div>
    </>
  );
}
