/**
 * "Your Questions, Answered", the question band on /en-ae/ (20260911; restaged
 * 20260912; rebuilt light 20260914; REBUILT AGAIN the same day on client
 * instruction: texture back, the left-and-right split back, no cards).
 *
 * WHAT IT IS NOW. Two halves. The copy on the left: eyebrow, title, the one
 * sentence and the "Ask Your Question" pill. A textured panel on the right,
 * the brand's own blue abstract (uploads/homepage/abstract-2.webp, the
 * client's pick, 20260914), carrying the six questions as one
 * ruled list: the question, the practice that answers it, an arrow. Each row
 * is the whole of its link. No cards, no boxes, no tabs, nothing plays and
 * nothing is selected: hairlines between the rows are the only drawing.
 *
 * THE COPY IS NOT THE CLIENT'S. Every other band on this page carries the home
 * document word for word; this band was asked for after that document was
 * written, so its eyebrow, title, lede and button, the panel's "Pick a
 * question" label and the six questions are drafted here, in the document's
 * register, to be replaced when the client supplies theirs. The practice
 * names are the registry's. No em dashes, as on every UAE page.
 *
 * WHERE IT SITS. After the six services and before the impact strip, because
 * every question it answers is one of theirs. India renders nothing of this.
 *
 * Styles: assets/css/valunxt-landing.css (section 17, .vxn-answer).
 */
import { rurl, vxnServiceName, vxnServices } from '@/lib/region';
import { rimgFirst } from '@/lib/region-assets';

/** One question a visitor might ask, per service. Drafted, see above. */
const QUESTIONS: Record<string, string> = {
  'accounting-tax-services': 'Is my business ready for UAE Corporate Tax?',
  'real-estate-transactions': 'Is now the right time to buy property in Dubai?',
  'mortgages-services': 'Can a non-resident get a mortgage in the UAE?',
  'valuation-and-advisory': 'What is my business actually worth today?',
  'research-intelligence': 'Is my project feasible in today’s market?',
  'technology-data-ai': 'How do we turn our data into better decisions?',
};

/** Registry strings may carry entities; the rows render text. */
function plain(v: string | undefined): string {
  return String(v ?? '')
    .replace(/\s*(?:&mdash;|&#8212;|&ndash;|&#8211;|—|–)\s*/g, ', ')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&rsquo;|&#8217;/g, '’')
    .replace(/<[^>]+>/g, '');
}

function Arrow() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false">
      <path d="M2.5 8h11M9 3.5 13.5 8 9 12.5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function UaeAnswerBand({ region }: { region: string }) {
  const rows = vxnServices(region).map((sv) => {
    const slug = sv.slug ?? sv.href;
    const name = plain(vxnServiceName(sv));
    return {
      key: slug,
      question: QUESTIONS[slug] ?? `What can ${name} do for my business?`,
      practice: name,
      href: rurl(region, sv.href),
    };
  });
  /* The brand's own abstract (homepage/abstract-2), on client instruction 20260914; no new image. */
  const texture = rimgFirst(region, ['homepage/abstract-2.webp', 'banners/uae-slider-4.webp']);

  return (
    <section className="vxn-answer" aria-labelledby="vxn-answer-title">
      <div className="vxn-answer__inner">
        <div className="vxn-answer__copy">
          <span className="vxn-band__eyebrow">Your Questions, Answered</span>
          <h2 id="vxn-answer-title" className="vxn-answer__title">
            Start With the Question on Your Mind
          </h2>
          <p className="vxn-answer__lede">
            Six connected practices, one team. Choose the question closest to yours to see which
            practice answers it and where the work begins.
          </p>
          <a className="vxn-band__pill vxn-band__pill--solid vxn-answer__cta" href={rurl(region, '/free-consultation/')}>
            Ask Your Question
            <i aria-hidden="true" className="vamtamtheme- vamtam-theme-arrow-right vxn-cta__arrow" />
          </a>
        </div>

        {/* The textured panel. The image is an <img> rather than a CSS
            background so it resolves through the region assets like every
            other picture on the page. */}
        <div className="vxn-answer__panel">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="vxn-answer__texture" src={texture} alt="" loading="lazy" aria-hidden="true" />
          <div className="vxn-answer__panelin">
            <span className="vxn-answer__label">Pick a question</span>
            <ul className="vxn-answer__list">
              {rows.map((r) => (
                <li key={r.key} className="vxn-answer__item">
                  <a className="vxn-answer__row" href={r.href}>
                    <span className="vxn-answer__q">{r.question}</span>
                    <span className="vxn-answer__svc">{r.practice}</span>
                    <span className="vxn-answer__go" aria-hidden="true">
                      <Arrow />
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
