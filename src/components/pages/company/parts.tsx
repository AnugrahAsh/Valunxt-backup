/**
 * The pieces the three company pages share — /about/, /clients/ and
 * /industries/ (20260922).
 *
 * The hero, the blue banner and the closing band are the UAE service
 * template's own markup (ServiceTemplateBody), element for element, so they
 * take its sheet unchanged. Only the lead row and the page shell are new.
 */
import type { ReactNode } from 'react';

import CtaArrow from '@/components/ui/CtaArrow';
import { rurl } from '@/lib/region';
import { rimgFirst } from '@/lib/region-assets';
import LiveImage from '@/components/three/live/LiveImage';
import ServiceTemplateMotion, { type MotionGroup } from '@/components/pages/uae-services/template/Motion';
import { CSS as TEMPLATE_CSS } from '@/components/pages/uae-services/template/ServiceTemplateBody';
import { COMPANY_CSS } from './styles';

/** An image under uploads/, through the region-aware resolver. */
export const upl = (region: string, rel: string) => rimgFirst(region, [rel]);

/** Arrivals for the co- sections, on the template's engine. */
const MOTION: MotionGroup[] = [
  { sel: '.co-lead > *', variant: 'up', stagger: true },
  { sel: '.co-story__fig', variant: 'left' },
  { sel: '.co-story__copy > *', variant: 'up', stagger: true },
  { sel: '.co-pillar', variant: 'up', stagger: true },
  { sel: '.co-support', variant: 'up' },
  { sel: '.co-card', variant: 'up', stagger: true },
  { sel: '.co-ix', variant: 'up', stagger: true },
  { sel: '.co-seg__fig', variant: 'scale' },
  { sel: '.co-seg__copy > *', variant: 'up', stagger: true },
  { sel: '.co-std__item', variant: 'up', stagger: true },
  { sel: '.co-sx', variant: 'up' },
  { sel: '.co-tile', variant: 'up', stagger: true },
  { sel: '.co-segs__foot', variant: 'up' },
];

/** The page's article: the template's scope, both sheets and the motion engine. */
export function CompanyPage({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div id="main-content">
      <div id="main" role="main" className="vamtam-main layout-full">
        <article className={`full page type-page status-publish hentry at-root co ${className}`}>
          <style dangerouslySetInnerHTML={{ __html: TEMPLATE_CSS }} />
          <style dangerouslySetInnerHTML={{ __html: COMPANY_CSS }} />
          <ServiceTemplateMotion extra={MOTION} />
          {children}
        </article>
      </div>
    </div>
  );
}

/** The service pages' hero: a plate, the scrim, the crumb, the title and the lede. */
export function CompanyHero({ region, crumb, title, sub, plate, alt }: { region: string; crumb: string; title: string; sub: string; plate: string; alt: string }) {
  return (
    <section className="at-hero" aria-labelledby="at-hero-head">
      <div className="at-hero__media">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="at-zoom" src={upl(region, plate)} alt={alt} fetchPriority="high" />
      </div>
      <div className="at-hero__scrim" aria-hidden="true" />
      <div className="at-hero__inner">
        <div className="at-hero__copy">
          <nav className="at-hero__crumb" aria-label="Breadcrumb">
            <span>
              <a href={rurl(region, '/')}>Home</a>
              <span aria-hidden="true"> /</span>
            </span>
            <span aria-current="page">{crumb}</span>
          </nav>
          <h1 className="at-hero__head" id="at-hero-head">
            {title}
          </h1>
          <p className="at-hero__sub">{sub}</p>
        </div>
      </div>
    </section>
  );
}

/** A section's opening: the pill kicker and a two-line heading on the left, the gloss on the right. */
export function Lead({ id, kicker, head, accent, lede, center }: { id: string; kicker: string; head: string; accent?: string; lede?: ReactNode; center?: boolean }) {
  return (
    <div className={`co-lead${center ? ' co-lead--center' : ''}`}>
      <div className="co-lead__col">
        <span className="at-kicker">{kicker}</span>
        <h2 className="co-lead__head" id={id}>
          {head}
          {accent ? <em>{accent}</em> : null}
        </h2>
      </div>
      {lede ? <p className="co-lead__lede">{lede}</p> : null}
    </div>
  );
}

/** The template's blue banner: gradient panel with the copy, a plate beside it. */
export function Banner({ region, id, head, body, cta, plate, live, className = '' }: { region: string; id: string; head: string; body: string; cta: { label: string; href: string }; plate: string; /** The plate's live scene (components/three/live/registry), where it is an abstract. */ live?: string; className?: string }) {
  return (
    <section className={`at-prob ${className}`} aria-labelledby={id}>
      <div className="at-in">
        <div className="at-prob__card">
          <div className="at-prob__panel">
            <h2 className="at-prob__head" id={id}>
              {head}
            </h2>
            <p className="at-prob__body">{body}</p>
            <a className="at-prob__cta" href={rurl(region, cta.href)}>
              {cta.label}
              <CtaArrow />
            </a>
          </div>
          <div className="at-prob__art" aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <LiveImage className="at-plate at-zoom" src={upl(region, plate)} alt="" loading="lazy" live={live} />
          </div>
        </div>
      </div>
    </section>
  );
}

/** The template's closing band: a photograph, then the ask. */
export function Talk({ region, head, lede, cta, photo, alt }: { region: string; head: string; lede: string; cta: { label: string; href: string }; photo: string; alt: string }) {
  return (
    <section className="at-talk" aria-labelledby="at-talk-head">
      <div className="at-in">
        <div className="at-talk__grid">
          <figure className="at-talk__fig">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={upl(region, photo)} alt={alt} loading="lazy" />
          </figure>
          <div className="at-talk__copy">
            <h2 className="at-talk__head" id="at-talk-head">
              {head}
            </h2>
            <p className="at-talk__lede">{lede}</p>
            <a className="at-talk__cta" href={rurl(region, cta.href)}>
              {cta.label}
              <CtaArrow />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Check() {
  return (
    <svg className="co-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12.5 2.6 2.6L16 9.6" />
    </svg>
  );
}

export function Arrow({ down }: { down?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" style={down ? { transform: 'rotate(90deg)' } : undefined}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}
