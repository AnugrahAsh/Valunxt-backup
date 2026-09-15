/**
 * "Your Questions, Answered", the question band on /en-ae/ (20260911; restaged
 * 20260912; rebuilt light 20260914, then rebuilt again that day as copy beside
 * a textured list; REBUILT 20260915 to the grid card of the supplied reference).
 *
 * WHAT IT IS NOW. One blue card on the brand gradient, laid out on six equal
 * columns and three rows as the reference is: the wordmark's x in the first
 * cell, a photograph broken into six staggered tiles across the middle four
 * columns (the top-right and bottom-left cells of its box left blue), a framed
 * corner cell carrying the eyebrow over a hairline and the "Ask Your Question"
 * pill, the title and the one sentence beside the lower tiles, a slowly
 * turning "Pick a question" badge on the photograph's right edge, and the six
 * questions as the numbered row along the foot (the reference's figures, with
 * a hairline under each number). Each question is the whole of its link.
 *
 * THE CONTENT IS UNCHANGED from the 20260914 band: the same eyebrow, title,
 * sentence, pill, "Pick a question" label and six questions, and the practice
 * names are still the registry's. It was drafted here, in the home document's
 * register, and is to be replaced when the client supplies its own. No em
 * dashes, as on every UAE page.
 *
 * THE PHOTOGRAPH is the Abu Dhabi skyline that sat unused in
 * uploads/new-folder (a 12.6 MB original), cut to 2400px as
 * uae/home/answer-skyline.webp. Every tile shows its own slice of the one
 * picture, so the six read as a single image, as in the reference.
 *
 * WHERE IT SITS. After the six services and before the impact strip, because
 * every question it answers is one of theirs. India renders nothing of this.
 *
 * Styles: assets/css/valunxt-landing.css (section 17, .vxn-answer). Motion:
 * UaeBandMotion.tsx (the tiles assemble as the card scrolls in).
 */
import { rurl, vxnServiceName, vxnServices } from '@/lib/region';
import { rimgFirst } from '@/lib/region-assets';
import { LogoXGlyph } from '@/components/brand/LogoX';
import CtaArrow from '@/components/ui/CtaArrow';

/** One question a visitor might ask, per service. Drafted, see above. */
const QUESTIONS: Record<string, string> = {
  'accounting-tax-services': 'Is my business ready for UAE Corporate Tax?',
  'real-estate-transactions': 'Is now the right time to buy property in Dubai?',
  'mortgages-services': 'Can a non-resident get a mortgage in the UAE?',
  'valuation-and-advisory': 'What is my business actually worth today?',
  'research-intelligence': 'Is my project feasible in today’s market?',
  'technology-data-ai': 'How do we turn our data into better decisions?',
};

/**
 * The photograph's six tiles as [column, row] inside its own box of four
 * columns by two rows. The box's top-right and bottom-left cells are not
 * tiles: they stay blue, which is what staggers the picture.
 */
const TILES: Array<[number, number]> = [
  [0, 0],
  [1, 0],
  [2, 0],
  [1, 1],
  [2, 1],
  [3, 1],
];

/** Registry strings may carry entities; the rows render text. */
function plain(v: string | undefined): string {
  return String(v ?? '')
    .replace(/\s*(?:&mdash;|&#8212;|&ndash;|&#8211;|—|–)\s*/g, ', ')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&rsquo;|&#8217;/g, '’')
    .replace(/<[^>]+>/g, '');
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
  const photo = rimgFirst(region, ['uae/home/answer-skyline.webp', 'new-folder/abudhabi.webp', 'homepage/abstract-2.webp']);

  return (
    <section className="vxn-answer" aria-labelledby="vxn-answer-title">
      <div className="vxn-answer__inner">
        <div className="vxn-answer__card">
          <span className="vxn-answer__mark" aria-hidden="true">
            <LogoXGlyph />
          </span>

          {TILES.map(([x, y]) => (
            <span
              key={`${x}-${y}`}
              className={[
                'vxn-answer__tile',
                /* The seams: a hairline wherever a tile meets another. */
                x > (y === 0 ? 0 : 1) ? 'vxn-answer__tile--l' : '',
                y === 1 && x < 3 ? 'vxn-answer__tile--t' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              data-x={x}
              data-y={y}
              aria-hidden="true"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="vxn-answer__shot" src={photo} alt="" loading="lazy" decoding="async" />
            </span>
          ))}

          {/* The framed corner cell: the eyebrow at its head, the pill at its
              foot under a hairline. Three grid items rather than one box, so
              the reading order stays eyebrow, title, sentence, pill. */}
          <span className="vxn-answer__frame" aria-hidden="true" />
          <span className="vxn-answer__eyebrow">Your Questions, Answered</span>

          <div className="vxn-answer__head">
            <h2 id="vxn-answer-title" className="vxn-answer__title">
              Start With the Question on Your Mind
            </h2>
            <p className="vxn-answer__lede">
              Six connected practices, one team. Choose the question closest to yours to see which
              practice answers it and where the work begins.
            </p>
          </div>

          <div className="vxn-answer__ask">
            <a className="vxn-band__pill vxn-band__pill--accent vxn-answer__cta" href={rurl(region, '/free-consultation/')}>
              Ask Your Question
              <CtaArrow />
            </a>
          </div>

          {/* The reference's turning badge, carrying the list's own label. */}
          <span className="vxn-answer__badge" aria-hidden="true">
            <svg viewBox="0 0 140 140" focusable="false">
              <defs>
                <path id="vxn-answer-ring" d="M18 70a52 52 0 1 1 104 0a52 52 0 1 1-104 0" />
              </defs>
              <g className="vxn-answer__ring">
                <text>
                  <textPath href="#vxn-answer-ring" textLength="326.7" lengthAdjust="spacing">
                    PICK A QUESTION • PICK A QUESTION •
                  </textPath>
                </text>
              </g>
              <path className="vxn-answer__down" d="M70 54v32M59.5 75.5 70 86l10.5-10.5" />
            </svg>
          </span>

          <ol className="vxn-answer__list" aria-label="Pick a question">
            {rows.map((r, i) => (
              <li key={r.key} className="vxn-answer__item">
                <a className="vxn-answer__row" href={r.href}>
                  <span className="vxn-answer__num" aria-hidden="true">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="vxn-answer__rule" aria-hidden="true" />
                  <span className="vxn-answer__q">{r.question}</span>
                  <span className="vxn-answer__svc">{r.practice}</span>
                </a>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
