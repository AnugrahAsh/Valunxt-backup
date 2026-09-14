/* Lightweight "Coming Soon" band rendered BELOW the image page-hero on sections
   not yet published — today, the UAE services pages.
   Uses page.hero_title (if set) as a small context eyebrow.

   The band's line is a <p>, not the <h1> it was ported as. It always sits under
   PageHeroSection, which already gives the page its <h1> — and that heading is
   the page's name, which is the one worth having. "Coming Soon" is its status.

   Port of includes/partials/coming-soon-band.php. */
import { rurl } from '@/lib/region';
import CtaArrow from '@/components/ui/CtaArrow';
import type { PageConfig } from '@/lib/page-config';

const CSS = `
/* UAE services house rule: 40px 0 on the section, gutter on the inner wrapper. */
.vxn-coming{background:#fff;text-align:center;padding:40px 0;}
.vxn-coming__inner{max-width:640px;margin:0 auto;padding:0 24px;}
.vxn-coming__eyebrow{font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:#9C00DD;font-weight:600;margin-bottom:18px;}
.vxn-coming .vxn-coming__title{font-weight:400!important;color:#0E355F!important;font-size:clamp(40px,6vw,72px);line-height:1.05;margin:0 0 18px;}
.vxn-coming__text{color:#5b6670;font-size:17px;line-height:1.7;margin:0 auto 32px;max-width:520px;}
/* Fills by wedge on hover — mechanism in valunxt-brand.css, this only names
   the colour it sweeps. */
/* The one CTA (20260911): the site's pill and gradient; was a 2px-radius uppercase button. */
.vxn-coming__cta{display:inline-flex;align-items:center;justify-content:center;min-height:var(--vxn-cta-h,46px);padding:0 var(--vxn-cta-px,28px);background-image:var(--vxn-cta-grad);background-color:var(--vxn-cta-ink,#0B2DBE);color:#fff!important;font-weight:var(--vxn-cta-fw,400);font-size:var(--vxn-cta-fs,14px);letter-spacing:var(--vxn-cta-ls,.01em);text-transform:none;line-height:1;text-decoration:none;border-radius:var(--vxn-cta-r,999px);--vxn-cta-sweep:var(--vxn-cta-sweep-dark,#08248F);}
@media(max-width:600px){.vxn-coming__inner{padding:0 20px;}}
`;

export default function ComingSoonBandSection({
  page,
  region,
}: {
  page: PageConfig;
  region: string;
}) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <section className="vxn-coming">
        <div className="vxn-coming__inner">
          {page.hero_title ? <div className="vxn-coming__eyebrow">{page.hero_title}</div> : null}
          <p className="vxn-coming__title">Coming Soon</p>
          <p className="vxn-coming__text">
            This section is on its way. We&#8217;re putting the finishing touches in place &#8212;
            please check back shortly.
          </p>
          <a className="vxn-coming__cta" href={rurl(region, '/contact/')}>
            Talk to us
            <CtaArrow />
          </a>
        </div>
      </section>
    </>
  );
}
