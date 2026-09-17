/**
 * /en-ae/free-consultation/ — the UAE's Book a Consultation page.
 *
 * India keeps the captured Elementor page (FreeConsultationBody). The UAE's
 * pages are set in the service template's language — the .at-hero plate, the
 * kicker, the tint bands, the one CTA — and this page was the one UAE visitors
 * reached from every "Speak to an Advisor" that still looked like the Indian
 * site. Rebuilt 20260911 on client instruction ("according to the UAE page
 * reference") in that language, with the page's own copy kept word for word:
 * the hero title and its line, the ecosystem line and its names, the
 * kicker, the heading, the lede, the two ways to reach the desk, the four
 * fields and their labels, the privacy line, the "Supporting Investors..."
 * line and the group logos (two, since HouzzHunt and HouzzHunt Mortgage left
 * the group and came off the site, 20260917). Nothing else added, nothing else
 * dropped, and the logos still sit in one still row, as everything on the UAE
 * pages sits still. No em dash anywhere on the page.
 *
 * THE TEMPLATE'S SHEET AND ENGINE, NOT COPIES. The page renders inside
 * .at-root with ServiceTemplateBody's CSS and ServiceTemplateMotion, as the
 * services index does, so the hero, the kicker, the buttons, the container
 * and the reveal rules are the service pages' own. This file's sheet is only
 * the bands the template does not have, under an fc- prefix.
 *
 * THE FORM POSTS ITSELF. The site's lead-form script (SiteScripts.tsx,
 * LEAD_FORMS) finds the phone field through ".elementor-form input[type=tel]",
 * gives it the dial-code selector, validates the four fields on submit in the
 * capture phase and rewrites the phone to E.164 - so the form keeps the
 * elementor-form class, the field-group wrappers and the ids that script reads
 * (…_full_name, …_email, …_company). What it does NOT get is Elementor Pro's
 * AJAX handler: that binds per widget, to data-widget_type="form.default", and
 * never reaches hand-written markup (learnt on the UAE subscribe form, since
 * removed with the band). So the submit is that form's fifteen lines of fetch,
 * in a ClientScript rather than a client component: the dial-code selector
 * wraps the input in its own markup as soon as the DOM is ready, and a
 * hydrated form would see a tree it did not render. The form_id is the
 * captured widget's, e67e0ee, so form-handler labels the enquiry "Free
 * Consultation" as before.
 *
 * THE STYLESHEET IS A TEMPLATE LITERAL. No backtick inside it, ever: one ends
 * the string and the build fails with "Expected a semicolon".
 */
import ClientScript from '@/components/ClientScript';
import { BASE, rurl } from '@/lib/region';
import CtaArrow from '@/components/ui/CtaArrow';
import { rimgFirst } from '@/lib/region-assets';
import { vxnOffice } from '@/lib/site-data';
import type { PageConfig } from '@/lib/page-config';
import ServiceTemplateMotion, { type MotionGroup } from './uae-services/template/Motion';
import { CSS as TEMPLATE_CSS } from './uae-services/template/ServiceTemplateBody';

/**
 * The hero plate, as a candidate list in the house convention: a purpose-shot
 * filename first, the library photograph behind it. The handshake is the one
 * the services index's consultation promo carries, so the card and the page
 * it opens share a picture.
 */
const PLATE = ['uae/pages/free-consultation/hero.webp', 'banners/free-consultation-uae.webp', 'new-folder/who-we-are-1.webp', 'banners/contact.webp'];

/** The group companies. HouzzHunt and HouzzHunt Mortgage, both listed here as
    the captured page had them, left the group and came off the site
    (20260917); Reliant Surveyors and Valunxt Corporate Services remain. */
const GROUP = [
  { name: 'Reliant Surveyors', href: 'https://reliantsurveyors.com', logo: 'reliant-surveyors.svg', w: 114 },
  { name: 'Valunxt Corporate Services', href: 'https://valunxt.com', logo: 'valunxt-corporate.svg', w: 187 },
];

/** The ecosystem line's names, in the captured order. */
const ECOSYSTEM = ['Valunxt Corporate Services', 'Reliant Surveyors'];

/** What reveals on this page beyond the template's own table. */
const MOTION: MotionGroup[] = [
  { sel: '.fc-eco__in > *', variant: 'up', stagger: true },
  { sel: '.fc-book__copy > *', variant: 'up', stagger: true },
  { sel: '.fc-panel', variant: 'right' },
  { sel: '.fc-group__in > *', variant: 'up', stagger: true },
];

/**
 * The submit. Runs after the lead-form script's capture-phase validation, so
 * it only ever sees a form that passed; posts the same payload the Elementor
 * widget would have, and writes the endpoint's own message under the button.
 */
const SUBMIT = `
(function(){
  var form = document.getElementById('fc-form');
  if (!form || form.__fcBound) return;
  form.__fcBound = true;
  var status = form.querySelector('.fc-form__status');
  var button = form.querySelector('.fc-form__submit');
  var label = button ? button.querySelector('.fc-form__submit-label') : null;
  function say(text, error){
    if (!status) return;
    status.textContent = text;
    status.classList.toggle('is-error', !!error);
    status.classList.toggle('is-done', !error && !!text);
  }
  form.addEventListener('submit', function(e){
    e.preventDefault();
    say('', false);
    if (button) button.disabled = true;
    if (label) label.textContent = 'Sending';
    fetch(form.getAttribute('action'), { method: 'POST', body: new FormData(form) })
      .then(function(res){ return res.json().catch(function(){ return null; }).then(function(json){ return [res.ok, json]; }); })
      .then(function(r){
        var ok = r[0] && r[1] && r[1].success;
        var msg = r[1] && r[1].data && r[1].data.message;
        if (ok){ say(msg || 'Thank you. Our advisory team will be in touch shortly.', false); form.reset(); }
        else { say(msg || 'That did not go through. Please try again, or call us.', true); }
      })
      .catch(function(){ say('We could not send that just now. Please try again, or call us.', true); })
      .then(function(){ if (button) button.disabled = false; if (label) label.textContent = 'Submit'; });
  });
})();
`;

const CSS = `
/* ==========================================================================
   THE ECOSYSTEM LINE, a slim tint strip under the hero: the label and the
   group's names as the template's chips, so the group reads as a set of marks
   rather than as a sentence with ticks in it.
   ========================================================================== */
.fc-eco{background:var(--tint);padding:18px 0!important;border-bottom:1px solid var(--line2);}
.fc-eco__in{display:flex;flex-wrap:wrap;align-items:center;gap:12px 18px;}
.fc-eco__label{
  margin:0!important;color:var(--ny)!important;font-size:14px!important;font-weight:500!important;
  line-height:1.4!important;
}
.fc-eco__list{display:flex;flex-wrap:wrap;gap:10px;margin:0;padding:0;list-style:none;}
.fc-eco__chip{
  display:inline-flex;align-items:center;gap:9px;
  padding:8px 16px;border-radius:999px;
  background:#fff;border:1px solid rgba(0,83,183,.2);
  color:var(--ny);font-size:13.5px;font-weight:500;line-height:1.2;
}
.fc-eco__chip i{width:6px;height:6px;border-radius:50%;background:var(--ny2);flex:0 0 auto;}

/* ==========================================================================
   THE BOOKING BAND: the copy and the two ways to reach the desk on the left,
   the form on the right, as the template's close sets a photograph beside
   its copy. White, because the panel is what carries the weight here.
   ========================================================================== */
.fc-book{background:#fff;padding:clamp(48px,5.4vw,84px) 0!important;}
.fc-book__grid{
  display:grid;grid-template-columns:minmax(0,.94fr) minmax(0,1.06fr);
  gap:clamp(32px,5vw,88px);align-items:start;
}
.fc-book__copy{display:flex;flex-direction:column;align-items:flex-start;}
/* (0,2,0), over the UAE type scale's h2 rule; the market's heading weight
   applies from the face sheet. The close's size, because this is the page's
   one statement. */
.at-root .fc-book__head{
  color:#16233C!important;font-size:clamp(28px,3.1vw,42px)!important;
  line-height:1.14!important;letter-spacing:-.014em!important;margin:0 0 16px!important;max-width:14ch;
}
.fc-book__lede{
  color:var(--body)!important;font-size:15.5px!important;line-height:1.7!important;
  margin:0 0 30px!important;max-width:48ch;text-wrap:pretty;
}
/* The two ways, as the intro band's ruled list: a rule over each, the list
   owns the last one, a blue dot on every row. Each row is one link. */
.fc-ways{margin:0;padding:0;list-style:none;width:100%;max-width:440px;border-bottom:1px solid var(--line);}
.fc-way{border-top:1px solid var(--line);}
.fc-way__link{
  position:relative;display:flex;align-items:center;gap:16px;
  padding:18px 0 18px 22px;color:var(--ny)!important;text-decoration:none!important;
}
.fc-way__link::before{
  content:"";position:absolute;left:0;top:50%;width:8px;height:8px;margin-top:-4px;
  border-radius:50%;background:var(--ny2);
}
.fc-way__text{display:flex;flex-direction:column;gap:3px;min-width:0;flex:1 1 auto;}
.fc-way__label{color:var(--muted);font-size:12.5px;letter-spacing:.02em;line-height:1.3;}
.fc-way__value{color:var(--ny);font-size:17px;line-height:1.3;overflow-wrap:anywhere;}
.fc-way__go{
  flex:0 0 auto;display:inline-flex;align-items:center;justify-content:center;
  width:36px;height:36px;border-radius:50%;border:1px solid rgba(0,83,183,.22);color:var(--ny2);
  transition:background-color .25s ease,color .25s ease,border-color .25s ease;
}
.fc-way__link:hover .fc-way__go{background:var(--ny2);border-color:var(--ny2);color:#fff;}
.fc-way__link:hover .fc-way__value{color:var(--ny2);}

/* The panel: white on a rule and a soft shadow, the page radius. */
.fc-panel{
  background:#fff;border:1px solid var(--line);border-radius:var(--radius);
  box-shadow:0 24px 60px -32px rgba(14,53,95,.28);
  padding:clamp(24px,2.6vw,36px) clamp(22px,2.6vw,36px) clamp(22px,2.4vw,30px);
}
.fc-panel__head{
  display:flex;align-items:center;justify-content:space-between;gap:16px;
  padding:0 0 18px;margin:0 0 22px;border-bottom:1px solid var(--line);
}
.at-root .fc-panel__title{
  color:var(--ny)!important;font-size:20px!important;line-height:1.25!important;
  letter-spacing:-.01em!important;margin:0!important;
}
.fc-panel__mark{
  flex:0 0 auto;display:inline-flex;align-items:center;justify-content:center;
  width:40px;height:40px;border-radius:50%;background:rgba(0,83,183,.08);color:var(--ny2);
}
.fc-panel__mark svg{width:18px;height:18px;}

/* The fields. The Elementor kit lays each group out as a flex row and gives
   the input its own border and 3px radius at a specificity these rules
   cannot reach unmarked, so the visual rules are marked; the layout is the
   kit's, which is what the dial-code selector was built against. */
.fc-form .elementor-form-fields-wrapper{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px 16px;}
.fc-form .elementor-field-group{display:block;padding:0;margin:0;width:auto;min-width:0;}
.fc-form .elementor-field-group.fc-field--full{grid-column:1 / -1;}
.at-root .fc-form .elementor-field-label{
  display:block;padding:0 0 8px!important;margin:0;
  color:var(--ny)!important;font-size:13px!important;font-weight:500!important;line-height:1.3!important;
}
.at-root .fc-form .elementor-field-textual{
  display:block;width:100%!important;min-height:48px;padding:0 16px!important;
  border:1px solid rgba(14,53,95,.18)!important;border-radius:10px!important;
  background:#fff!important;color:var(--ny)!important;
  font-size:15px!important;line-height:1.3!important;box-shadow:none!important;
  transition:border-color .2s ease,box-shadow .2s ease;
}
.at-root .fc-form .elementor-field-textual::placeholder{color:#9AA5B8;opacity:1;}
.at-root .fc-form .elementor-field-textual:focus{
  outline:none!important;border-color:var(--ny2)!important;box-shadow:0 0 0 3px rgba(0,83,183,.14)!important;
}
/* The dial-code selector's own paddings: its wrapper takes the row, the
   input keeps room for the flag and code on the left. */
.fc-form .iti{width:100%;}
.at-root .fc-form .iti input[type="tel"]{padding-left:92px!important;}
.fc-form .iti__selected-flag{padding:0 8px 0 14px;border-radius:10px 0 0 10px;}
.fc-form__actions{display:flex;flex-wrap:wrap;align-items:center;gap:16px;margin:24px 0 0;}
.fc-form__submit{border:1px solid transparent;cursor:pointer;font-family:inherit;}
.fc-form__submit[disabled]{opacity:.7;cursor:progress;}
.fc-form__status{
  margin:0!important;color:var(--body)!important;font-size:14px!important;line-height:1.5!important;
  flex:1 1 220px;min-height:0;
}
.fc-form__status.is-done{color:#0B7A3E!important;}
.fc-form__status.is-error{color:#B3261E!important;}
.fc-form__status:empty{display:none;}
.fc-form__legal{
  margin:22px 0 0!important;padding:18px 0 0;border-top:1px solid var(--line);
  color:var(--muted)!important;font-size:12.5px!important;line-height:1.55!important;
}
.fc-form__legal a{color:var(--ny2)!important;text-decoration:underline!important;text-underline-offset:2px;}

/* ==========================================================================
   THE GROUP: the line, and the group's marks in one still row.
   ========================================================================== */
.fc-group{background:var(--tint);padding:clamp(36px,4vw,56px) 0!important;}
.fc-group__in{display:flex;flex-direction:column;align-items:center;text-align:center;}
.fc-group__label{
  margin:0 0 28px!important;color:var(--ny)!important;font-size:15px!important;font-weight:500!important;
  line-height:1.4!important;letter-spacing:0!important;
}
.fc-group__row{
  display:flex;flex-wrap:wrap;justify-content:center;align-items:center;
  gap:24px clamp(32px,5vw,80px);margin:0;padding:0;list-style:none;
}
.fc-group__row a{display:inline-flex;align-items:center;opacity:.92;transition:opacity .25s ease;}
.fc-group__row a:hover{opacity:1;}
.fc-group__row img{display:block;height:48px;width:auto;max-width:200px;object-fit:contain;}

/* ==========================================================================
   RESPONSIVE. One column under 1024; the fields stack under 640.
   ========================================================================== */
@media(max-width:1024px){
  .fc-book__grid{grid-template-columns:minmax(0,1fr);gap:36px;}
  .fc-ways{max-width:none;}
  .at-root .fc-book__head{max-width:none;}
}
@media(max-width:640px){
  .fc-eco{padding:16px 0!important;}
  .fc-form .elementor-form-fields-wrapper{grid-template-columns:minmax(0,1fr);}
  .fc-form__actions{flex-direction:column;align-items:stretch;}
  .fc-form__submit{justify-content:center;}
  .fc-way__value{font-size:16px;}
  .fc-group__row img{height:40px;}
}
`;

export default function FreeConsultationAeBody({ page, region }: { page: PageConfig; region: string }) {
  const office = vxnOffice('dubai')!;
  const sub =
    page.post_excerpt ??
    'Connect with our advisory team to explore real estate wealth, capital, research, and technology opportunities.';

  return (
    <div id="main-content">
      <div id="main" role="main" className="vamtam-main layout-full">
        <article className="full page type-page status-publish hentry at-root fc">
          <style dangerouslySetInnerHTML={{ __html: TEMPLATE_CSS }} />
          <style dangerouslySetInnerHTML={{ __html: CSS }} />
          <ServiceTemplateMotion extra={MOTION} />

          {/* ---- 1. HERO: the template's, line for line ---- */}
          <section className="at-hero" aria-labelledby="at-hero-head">
            <div className="at-hero__media">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="at-zoom" src={rimgFirst(region, PLATE)} alt="" fetchPriority="high" />
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
                  <span aria-current="page">Book a Consultation</span>
                </nav>
                <h1 className="at-hero__head" id="at-hero-head">
                  Book a Consultation
                </h1>
                <p className="at-hero__sub">{sub}</p>
              </div>
            </div>
          </section>

          {/* ---- 2. THE ECOSYSTEM LINE ---- */}
          <section className="fc-eco" aria-label="The Valunxt group">
            <div className="at-in fc-eco__in">
              <p className="fc-eco__label">Part of the Valunxt group ecosystem:</p>
              <ul className="fc-eco__list">
                {ECOSYSTEM.map((name) => (
                  <li className="fc-eco__chip" key={name}>
                    <i aria-hidden="true" />
                    {name}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* ---- 3. THE BOOKING BAND ---- */}
          <section className="fc-book" aria-labelledby="fc-book-head">
            <div className="at-in">
              <div className="fc-book__grid">
                <div className="fc-book__copy">
                  <span className="at-kicker">Connect with Our Advisory Team</span>
                  <h2 className="fc-book__head" id="fc-book-head">
                    Schedule an Advisory Consultation
                  </h2>
                  <p className="fc-book__lede">
                    Expect a structured conversation about your objectives, portfolio, and capital needs,
                    followed by relevant research and considered next steps.
                  </p>
                  <ul className="fc-ways">
                    <li className="fc-way">
                      <a className="fc-way__link" href={`mailto:${office.email}?subject=Hello`}>
                        <span className="fc-way__text">
                          <span className="fc-way__label">Email us at:</span>
                          <span className="fc-way__value">{office.email}</span>
                        </span>
                        <span className="fc-way__go" aria-hidden="true">
                          <CtaArrow />
                        </span>
                      </a>
                    </li>
                    <li className="fc-way">
                      <a className="fc-way__link" href={`tel:${office.tel}`}>
                        <span className="fc-way__text">
                          <span className="fc-way__label">Call us at:</span>
                          <span className="fc-way__value">{office.phone}</span>
                        </span>
                        <span className="fc-way__go" aria-hidden="true">
                          <CtaArrow />
                        </span>
                      </a>
                    </li>
                  </ul>
                </div>

                <div className="fc-panel">
                  <div className="fc-panel__head">
                    <h3 className="fc-panel__title">Book a Consultation</h3>
                    <span className="fc-panel__mark" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none">
                        <path
                          d="M21 3L10.5 13.5M21 3l-6.5 18-4-7.5L3 9.5 21 3z"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </div>

                  <form
                    className="elementor-form fc-form"
                    id="fc-form"
                    method="post"
                    action={`${BASE}/form-handler/`}
                    name="Free Consultation"
                    aria-label="Free Consultation"
                  >
                    <input type="hidden" name="post_id" value="296" />
                    <input type="hidden" name="form_id" value="e67e0ee" />
                    <input type="hidden" name="referer_title" value="Valunxt" />
                    <input type="hidden" name="queried_id" value="296" />

                    <div className="elementor-form-fields-wrapper">
                      <div className="elementor-field-group elementor-field-required fc-field">
                        <label htmlFor="form-field-consult_full_name" className="elementor-field-label">
                          Full Name
                        </label>
                        <input
                          type="text"
                          name="form_fields[consult_full_name]"
                          id="form-field-consult_full_name"
                          className="elementor-field elementor-size-sm elementor-field-textual"
                          placeholder="Full Name"
                          autoComplete="name"
                          required
                        />
                      </div>
                      <div className="elementor-field-group elementor-field-required fc-field">
                        <label htmlFor="form-field-consult_email" className="elementor-field-label">
                          Email
                        </label>
                        <input
                          type="email"
                          name="form_fields[consult_email]"
                          id="form-field-consult_email"
                          className="elementor-field elementor-size-sm elementor-field-textual"
                          placeholder="Email"
                          autoComplete="email"
                          required
                        />
                      </div>
                      <div className="elementor-field-group elementor-field-required fc-field">
                        <label htmlFor="form-field-consult_phone" className="elementor-field-label">
                          Phone No
                        </label>
                        <input
                          type="tel"
                          name="form_fields[consult_phone]"
                          id="form-field-consult_phone"
                          className="elementor-field elementor-size-sm elementor-field-textual"
                          placeholder="Phone No"
                          autoComplete="tel"
                          required
                        />
                      </div>
                      <div className="elementor-field-group elementor-field-required fc-field">
                        <label htmlFor="form-field-consult_company" className="elementor-field-label">
                          Company Name
                        </label>
                        <input
                          type="text"
                          name="form_fields[consult_company]"
                          id="form-field-consult_company"
                          className="elementor-field elementor-size-sm elementor-field-textual"
                          placeholder="Company Name"
                          autoComplete="organization"
                          required
                        />
                      </div>
                    </div>

                    <div className="fc-form__actions">
                      <button className="at-btn at-btn--solid fc-form__submit" type="submit">
                        <span className="fc-form__submit-label">Submit</span>
                        <CtaArrow />
                      </button>
                      {/* aria-live so the outcome is announced, not just drawn. */}
                      <p className="fc-form__status" role="status" aria-live="polite" />
                    </div>

                    <p className="fc-form__legal">
                      By submitting this form you agree to our{' '}
                      <a href={rurl(region, '/privacy-policy/')}>Privacy Policy</a>. Valunxt may contact you via
                      email or phone regarding your enquiry and scheduling.
                    </p>
                  </form>
                  <ClientScript code={SUBMIT} id="fc-submit" />
                </div>
              </div>
            </div>
          </section>

          {/* ---- 4. THE GROUP ---- */}
          <section className="fc-group" aria-label="Group companies">
            <div className="at-in fc-group__in">
              <p className="fc-group__label">Supporting Investors, Developers, Institutions &amp; Businesses</p>
              <ul className="fc-group__row">
                {GROUP.map((g) => (
                  <li key={g.name}>
                    <a href={g.href} target="_blank" rel="noopener">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={`${BASE}/LOGO/${g.logo}`} alt={g.name} width={g.w} height={56} loading="lazy" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </article>
      </div>
    </div>
  );
}
