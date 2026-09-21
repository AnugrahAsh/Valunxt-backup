'use client';

/**
 * The enquiry section, shared by the landing page and every service page:
 * one white panel, a live abstract (the mashrabiya lattice, used nowhere
 * else) carrying the headline and the direct lines on the left, and the
 * minimal form on the right.
 */
import { BRAND } from '../../data/site';
import { LEAD } from '../../data/landing';
import LeadForm, { type Interest } from './LeadForm';
import { useEnquiry } from './enquiry';
import LiveAbstract from './LiveAbstract';
import { IcArrowUp, IcChat, IcMail, IcPhone, SectionHead } from './shared';

export default function Enquire({
  title = LEAD.title,
  lede = LEAD.lede,
  interest,
  about,
  onClearAbout,
}: {
  title?: string;
  lede?: string;
  interest?: Interest;
  about?: string;
  onClearAbout?: () => void;
}) {
  const ctx = useEnquiry();
  const asking = about ?? ctx?.about;
  const clear = onClearAbout ?? ctx?.clear;
  const wa = BRAND.phoneHref.replace(/[^\d]/g, '');
  const lines = [
    { icon: <IcPhone />, label: 'Call the Dubai desk', value: BRAND.phone, href: BRAND.phoneHref },
    { icon: <IcChat />, label: 'WhatsApp', value: 'Message an advisor', href: `https://wa.me/${wa}`, external: true },
    { icon: <IcMail />, label: 'Email', value: BRAND.email, href: `mailto:${BRAND.email}` },
  ];

  return (
    <section className="re-l-sec re-l-enq" id="enquire">
      <div className="re-wrap">
        <div className="re-l-enq__panel" data-rv="up">
          <aside className="re-l-enq__side">
            <LiveAbstract variant="lattice" className="re-l-enq__live" />
            <div className="re-l-enq__copy">
              <SectionHead eyebrow={LEAD.eyebrow} title={title} lede={lede} light />
              <ul className="re-l-enq__lines">
                {lines.map((l) => (
                  <li key={l.label}>
                    <a href={l.href} {...(l.external ? { target: '_blank', rel: 'noopener' } : {})}>
                      {l.icon}
                      <span>
                        <small>{l.label}</small>
                        {l.value}
                      </span>
                      <IcArrowUp />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
          <div className="re-l-enq__main">
            <p className="re-l-enq__kicker">Book a twenty-minute call</p>
            <LeadForm interest={interest} about={asking || undefined} onClearAbout={clear} />
          </div>
        </div>
      </div>
    </section>
  );
}
