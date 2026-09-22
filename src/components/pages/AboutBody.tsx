/**
 * /about/ — page body (20260922, second redesign: the client found the first
 * "too boring and generic").
 *
 * The page is told as a sequence rather than a stack of boxes:
 *
 *   1. Hero        the Valunxt "x" built from light (XField, Three.js), a
 *                  statement rising word by word, the group in four figures
 *   2. Manifesto   the philosophy, pinned, lit a word at a time by scrolling
 *   3. Who we are  the group in its own words beside a parallax collage
 *   4. Practices   the registry's services as a strip the page scrolls
 *                  sideways through
 *   5. Purpose     one large statement, the two pillars, and the clients the
 *                  group supports running past as a marquee
 *   6. Why         three editorial rows with a photograph that follows the
 *                  pointer
 *   7. Ecosystem   UNCHANGED, see below
 *   8. Offices     the four offices joined on a live map, each with its local
 *                  time ticking and whether it is open
 *
 * THE VALUNXT ECOSYSTEM IS UNCHANGED, on client instruction. Its markup below
 * is the Elementor capture's, character for character, inside the
 * .elementor-258 wrapper its stylesheet (post-258.css) is scoped to, so that
 * sheet, the brand sheet's override for its glass card, the UAE page-image
 * rule that paints its photograph (uae-page-images.ts, about/closing) and the
 * site's reveal script all reach it exactly as before. Change it in the
 * capture's terms or not at all.
 *
 * COPY. The headings and paragraphs are the page's own, from the capture. The
 * figures are the site's registries: the offices (vxnOffices), the services
 * (vxnServices), the markets (vxnMarkets) and the group companies the
 * Ecosystem card itself states. The buttons the client took off this page
 * (20260914) stay off; links here are text links. No em dashes: a UAE page
 * rule.
 *
 * THE SITE'S SCROLL ENGINE (SiteMotion) WALKS EVERY PAGE and wraps heading
 * words in spans after hydration. The React sections here re-render (the
 * hero's title, the live clocks), and React cannot remove text the walk has
 * already replaced, so each of them carries data-reveal="none" and animates
 * itself (about/Motion.tsx). The Ecosystem does not, so the walk still reveals
 * its Elementor entrances exactly as before.
 */
import { rurl, vxnServiceName, vxnServices } from '@/lib/region';
import { rimgFirst } from '@/lib/region-assets';
import { vxnMarkets, vxnOffices } from '@/lib/site-data';
import type { PageConfig } from '@/lib/page-config';
import { RELATED_FIGURE } from './uae-services/template/ServiceTemplateBody';
import AboutHero, { type Fact } from './about/Hero';
import AboutMotion from './about/Motion';
import Collage from './about/Collage';
import Manifesto from './about/Manifesto';
import Offices, { type OfficeCard } from './about/Offices';
import Practices from './about/Practices';
import ValueCurve from './about/ValueCurve';
import WhyRows from './about/WhyRows';
import { ABOUT_CSS } from './about/styles';

const NUM = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'];

const CAPABILITIES = [
  { n: '01', t: 'Real Estate Investment Advisory', href: '/services/real-estate-investment-advisory/' },
  { n: '02', t: 'Capital Advisory & Structuring', href: '/services/capital-advisory/' },
  { n: '03', t: 'Research, Intelligence & Technology', href: '/services/research-intelligence/' },
];

const SUPPORT = [
  { t: 'Private & HNI investors', href: '/clients/#service_1' },
  { t: 'Family offices', href: '/clients/#service_2' },
  { t: 'NRI investors', href: '/clients/#service_3' },
  { t: 'Developers', href: '/clients/#service_4' },
  { t: 'Institutions', href: '/clients/#service_4' },
];

const TZ: Record<string, { tz: string; zone: string; country: string }> = {
  dubai: { tz: 'Asia/Dubai', zone: 'GST', country: 'UAE' },
  abudhabi: { tz: 'Asia/Dubai', zone: 'GST', country: 'UAE' },
  mumbai: { tz: 'Asia/Kolkata', zone: 'IST', country: 'India' },
  noida: { tz: 'Asia/Kolkata', zone: 'IST', country: 'India' },
};

const up = (region: string, rel: string) => rimgFirst(region, [rel]);

export default function AboutBody({ region }: { page: PageConfig; region: string }) {
  const services = vxnServices(region);
  const offices = Object.entries(vxnOffices());
  const markets = vxnMarkets('short');

  const facts: Fact[] = [
    { n: 4, label: 'Group companies', note: 'One integrated platform' },
    { n: 2, label: 'Markets', note: markets.charAt(0).toUpperCase() + markets.slice(1) },
    { n: services.length, label: 'Practices', note: 'Connected, under one roof' },
    { n: offices.length, label: 'Offices', note: offices.map(([, o]) => o.city).join(', ') },
  ];

  const practices = services.map((sv) => ({
    name: vxnServiceName(sv),
    desc: sv.desc,
    href: rurl(region, sv.href),
    img: rimgFirst(region, [
      `services/index-${sv.slug ?? ''}.webp`,
      ...(RELATED_FIGURE[sv.slug ?? ''] ?? []),
      sv.img.replace('/assets/content/uploads/', ''),
    ]),
  }));

  const officeCards: OfficeCard[] = offices.map(([key, o]) => ({
    key,
    city: o.city,
    country: TZ[key]?.country ?? o.country,
    address: o.address,
    phone: o.phone,
    tel: o.tel,
    map: o.map,
    tz: TZ[key]?.tz ?? 'Asia/Dubai',
    zone: TZ[key]?.zone ?? '',
    lat: o.lat,
    lng: o.lng,
  }));

  return (
    <div id="main-content">
      <div id="main" role="main" className="vamtam-main layout-full">
        <article className="full page type-page status-publish hentry ab-root">
          <style dangerouslySetInnerHTML={{ __html: ABOUT_CSS }} />
          <AboutMotion />

          {/* ---- 1. HERO ---- */}
          <AboutHero homeHref={rurl(region, '/')} facts={facts} />

          {/* ---- 2. MANIFESTO ---- */}
          <Manifesto
            links={[
              { label: 'Real Estate Wealth', href: rurl(region, '/services/real-estate-investment-advisory/') },
              { label: 'Research & Intelligence', href: rurl(region, '/services/research-intelligence/') },
              { label: 'Technology & AI', href: rurl(region, '/services/technology-ai/') },
            ]}
          />

          {/* ---- 3. WHO WE ARE ---- */}
          <section className="ab-who" aria-labelledby="ab-who-head" data-reveal="none">
            <div className="ab-in ab-who__grid">
              <div>
                <p className="ab-pill" data-ab="up">
                  Who We Are
                </p>
                <h2 className="ab-who__head" id="ab-who-head" data-ab="up" data-ab-i="1">
                  Valunxt is a premium <em>real estate wealth, capital, intelligence, and technology group</em> supporting investors, developers, institutions, and businesses.
                </h2>
                <p className="ab-who__p" data-ab="up" data-ab-i="2">
                  We operate as an integrated platform of strategic advisory, independent research, capital solutions, and intelligent technology. Whether you are building a real estate portfolio, structuring capital, or seeking data driven market intelligence, our advisory team is here to help. Our capabilities span:
                </p>
                <ul className="ab-caps" data-ab="up" data-ab-i="3">
                  {CAPABILITIES.map((c) => (
                    <li key={c.n}>
                      <a href={rurl(region, c.href)}>
                        <span className="ab-caps__n">{c.n}</span>
                        <span className="ab-caps__t">{c.t}</span>
                        <span className="ab-caps__go" aria-hidden="true">
                          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M7 17 17 7M9 7h8v8" />
                          </svg>
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <Collage
                main={up(region, 'uae/home/who-we-are.webp')}
                inset={up(region, 'new-folder/about-us-banner.webp')}
                noteLabel="Group firm"
                note="RICS-regulated valuation through Reliant Surveyors"
              />
            </div>
          </section>

          {/* ---- 4. PRACTICES ---- */}
          <Practices title={`${NUM[practices.length] ?? practices.length} Connected Practices,`} items={practices} />

          {/* ---- 5. PURPOSE ---- */}
          <section className="ab-purpose" aria-labelledby="ab-purpose-head" data-reveal="none">
            <div className="ab-in">
              <p className="ab-pill" data-ab="up">
                Our Purpose
              </p>
              <div className="ab-purpose__top">
                <h2 className="ab-purpose__big" id="ab-purpose-head" data-ab="up" data-ab-i="1">
                  Helping clients create <em>sustainable long term value.</em>
                </h2>
                <div data-ab="up" data-ab-i="2">
                  <ValueCurve />
                </div>
              </div>
              <div className="ab-purpose__row">
                <p className="ab-purpose__p" data-ab="up">
                  Our purpose is to help clients make informed investment decisions, structure capital effectively, and create sustainable long term value through real estate. We support HNIs, family offices, NRIs, developers, and institutions with disciplined, data driven advisory.
                </p>
                <div className="ab-pil" data-ab="up" data-ab-i="1">
                  <span className="ab-pil__n">01</span>
                  <h3 className="ab-pil__t">Advisory led investing</h3>
                  <p className="ab-pil__d">We help investors pursue disciplined portfolio growth through strategy led advisory across India, the UAE, and international markets.</p>
                </div>
                <div className="ab-pil" data-ab="up" data-ab-i="2">
                  <span className="ab-pil__n">02</span>
                  <h3 className="ab-pil__t">Independent research</h3>
                  <p className="ab-pil__d">We help clients assess opportunities with clarity through independent research, valuation intelligence, and market analysis.</p>
                </div>
              </div>
            </div>
            <div className="ab-marq">
              <span className="ab-marq__label">We support</span>
              <div className="ab-marq__track">
                {[...SUPPORT, ...SUPPORT].map((s, i) => (
                  <a key={i} href={rurl(region, s.href)} aria-hidden={i >= SUPPORT.length ? 'true' : undefined} tabIndex={i >= SUPPORT.length ? -1 : undefined}>
                    {s.t}
                  </a>
                ))}
              </div>
            </div>
          </section>

          {/* ---- 6. WHY VALUNXT ---- */}
          <section className="ab-why" aria-labelledby="ab-why-head" data-reveal="none">
            <div className="ab-in">
              <div className="ab-why__head">
                <div>
                  <p className="ab-pill" data-ab="up">
                    Why Valunxt?
                  </p>
                  <h2 className="ab-h2" id="ab-why-head" data-ab="up" data-ab-i="1">
                    What Sets
                    <em>the Group Apart</em>
                  </h2>
                </div>
                <p className="ab-why__lede" data-ab="up" data-ab-i="2">
                  An integrated platform of strategic advisory, independent research, capital solutions, and intelligent technology.
                </p>
              </div>
              <WhyRows
                rows={[
                  { t: 'India & UAE Market Access', d: 'Strategy led advisory across India, the UAE, and international markets, from offices in both.', img: up(region, 'uae/home/answer-skyline.webp') },
                  { t: 'Advisory Led Approach', d: 'Disciplined, data driven advisory for HNIs, family offices, NRIs, developers, and institutions.', img: up(region, 'uae/home/expertise-boardroom.webp') },
                  { t: 'Independent Research', d: 'Opportunities assessed with clarity through independent research, valuation intelligence, and market analysis.', img: up(region, 'new-folder/research-intelligence-1.webp') },
                ]}
              />
            </div>
          </section>

          {/* ---- 7. THE VALUNXT ECOSYSTEM — unchanged, see the header ---- */}
          <div className="ab-eco">
            <div data-elementor-type="wp-page" data-elementor-id="258" className="elementor elementor-258" data-elementor-post-type="page">
      								<div className="elementor-element elementor-element-15ccbd4 e-con-full e-flex e-con e-parent" data-id="15ccbd4" data-element_type="container" data-e-type="container">
      									<div className="elementor-element elementor-element-46476c1 e-flex e-con-boxed e-con e-child" data-id="46476c1" data-element_type="container" data-e-type="container" data-settings={"{\"background_background\":\"classic\"}"}>
      										<div className="e-con-inner">
      											<div className="elementor-element elementor-element-7292604 e-con-full e-flex e-con e-child" data-id="7292604" data-element_type="container" data-e-type="container">
      												<div className="elementor-element elementor-element-1e67f45 e-con-full blur-background e-flex e-con e-child" data-id="1e67f45" data-element_type="container" data-e-type="container" data-settings={"{\"background_background\":\"classic\"}"}>
      													<div className="elementor-element elementor-element-02b4fcd elementor-invisible e-con-full animated-fast e-flex e-con e-child" data-id="02b4fcd" data-element_type="container" data-e-type="container" data-settings={"{\"animation\":\"slideInUp\"}"}>
      														<div className="elementor-element elementor-element-daec1d8 elementor-widget elementor-widget-heading" data-id="daec1d8" data-element_type="widget" data-e-type="widget" data-widget_type="heading.default">
      															<div className="elementor-widget-container">
      																<span className="elementor-heading-title elementor-size-default">Valunxt</span>
      															</div>
      														</div>
      														<div className="elementor-element elementor-element-08af19a elementor-widget elementor-widget-heading" data-id="08af19a" data-element_type="widget" data-e-type="widget" data-widget_type="heading.default">
      															<div className="elementor-widget-container">
      																<span className="elementor-heading-title elementor-size-default">4</span>
      															</div>
      														</div>
      														<div className="elementor-element elementor-element-cd7cc23 elementor-widget elementor-widget-heading" data-id="cd7cc23" data-element_type="widget" data-e-type="widget" data-widget_type="heading.default">
      															<div className="elementor-widget-container">
      																<span className="elementor-heading-title elementor-size-default">Group Companies, One Integrated Platform</span>
      															</div>
      														</div>
      													</div>
      													{/* The "Contact Us" button came off the foot of this glass card
      													    on client instruction (20260914). */}
      												</div>
      											</div>
      											<div className="elementor-element elementor-element-d5bea02 e-con-full e-flex e-con e-child" data-id="d5bea02" data-element_type="container" data-e-type="container">
      												<div className="elementor-element elementor-element-79395d4 elementor-invisible animated-fast elementor-widget elementor-widget-heading" data-id="79395d4" data-element_type="widget" data-e-type="widget" data-settings={"{\"_animation\":\"slideInUp\"}"} data-widget_type="heading.default">
      													<div className="elementor-widget-container">
      														<span className="elementor-heading-title elementor-size-default">The Valunxt Ecosystem</span>
      													</div>
      												</div>
      												<div className="elementor-element elementor-element-d3199ef elementor-invisible elementor-widget-tablet__width-inherit animated-fast elementor-widget elementor-widget-heading" data-id="d3199ef" data-element_type="widget" data-e-type="widget" data-settings={"{\"_animation\":\"slideInUp\",\"_animation_delay\":50}"} data-widget_type="heading.default">
      													<div className="elementor-widget-container">
      														<h2 className="elementor-heading-title elementor-size-default">Specialist Companies. One Integrated Group.</h2>
      													</div>
      												</div>
      												<div className="vamtam-has-theme-widget-styles elementor-element elementor-element-b2c46c3 elementor-invisible elementor-widget-tablet__width-inherit animated-fast elementor-widget elementor-widget-text-editor" data-id="b2c46c3" data-element_type="widget" data-e-type="widget" data-settings={"{\"_animation\":\"fadeIn\",\"_animation_delay\":200}"} data-widget_type="text-editor.default">
      													<div className="elementor-widget-container">
      														<p>Valunxt operates as a connected group of specialist companies delivering expertise across real estate, valuation, mortgage, corporate services, research, and technology. Valunxt Corporate Services provides business setup, accounting, tax, compliance, and business advisory. Reliant Surveyors delivers valuation, advisory, research, and consultancy. Together they operate as one integrated platform serving clients across India and the UAE.</p>
      													</div>
      												</div>
      											</div>
      										</div>
      									</div>
      								</div>
            </div>
          </div>

          {/* ---- 8. OFFICES ---- */}
          <section className="ab-off" aria-labelledby="ab-off-head" data-reveal="none">
            <div className="ab-in">
              <div className="ab-off__head">
                <div>
                  <p className="ab-pill" data-ab="up">
                    Where We Are
                  </p>
                  <h2 className="ab-h2" id="ab-off-head" data-ab="up" data-ab-i="1">
                    {NUM[officeCards.length] ?? officeCards.length} Offices,
                    <em>Two Markets.</em>
                  </h2>
                </div>
                <p className="ab-off__lede" data-ab="up" data-ab-i="2">
                  The group&rsquo;s teams in {officeCards.map((o) => o.city).join(', ').replace(/, ([^,]*)$/, ' and $1')}, serving clients across {markets}. Each office&rsquo;s local time, live.
                </p>
              </div>
              <Offices offices={officeCards} />
            </div>
          </section>
        </article>
      </div>
    </div>
  );
}
