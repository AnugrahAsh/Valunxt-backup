/**
 * "Your Questions, Answered", the question band on /en-ae/ (20260911; restaged
 * 20260912; rebuilt light 20260914, twice; rebuilt as the grid card 20260915;
 * REBUILT 20260916 to the supplied recording, vxn-answer-section.mp4).
 *
 * WHAT IT IS NOW. The recording is a product feature reel: a column of short
 * labels on the left, one lit and the rest greyed, a coloured dot that drops
 * from the lit label to the next as the reel moves on, and on the right a
 * rounded panel whose photograph changes with the label, carrying two glass
 * cards, the first typed out character by character and the second sliding
 * up under it. Here the labels are the six practices, the first card is the
 * question a visitor might bring to that practice, typed, and the second is
 * the practice's own accordion sentence with a link to its page. Pressing
 * a label jumps to it; a pointer resting on the stage holds the reel. (The
 * recording's opening toggle stood under the list as an "Auto play" switch
 * until 20260916, when the client asked for it hidden; the reel still plays
 * itself.) The eyebrow, title, sentence and pill of the earlier editions
 * stand above the list, so nothing of the band's copy went.
 *
 * THE CONTENT. The eyebrow, title, sentence, pill, six questions and
 * "Explore <practice>" were drafted here, in the home document's
 * register, and are to be replaced when the client supplies its own; the
 * practice names and the answer sentences are the registry's, word for word.
 * No em dashes, as on every UAE page.
 *
 * THE PHOTOGRAPHS are the six per-practice pictures cut on 20260912
 * (uae/home/answer-<slug>.webp, 1600 x 667); the panel shows their middle.
 *
 * WHERE IT SITS. After the six services and before the impact strip, because
 * every question it answers is one of theirs. India renders nothing of this.
 *
 * Styles: assets/css/valunxt-landing.css (section 17, .vxn-answer). Reel:
 * UaeAnswerStage.tsx. Arrival: UaeBandMotion.tsx (the panel and the list
 * rise as the band scrolls in).
 */
import { rurl, vxnServiceName, vxnServices } from '@/lib/region';
import { rimgFirst } from '@/lib/region-assets';
import { RELATED_FIGURE } from '@/components/pages/uae-services/template/ServiceTemplateBody';
import CtaArrow from '@/components/ui/CtaArrow';
import UaeAnswerStage, { type AnswerScene } from './UaeAnswerStage';

/** One question a visitor might ask, per service. Drafted, see above. */
const QUESTIONS: Record<string, string> = {
  'accounting-tax-services': 'Is my business ready for UAE Corporate Tax?',
  'real-estate-transactions': 'Is now the right time to buy property in Dubai?',
  'mortgages-services': 'Can a non-resident get a mortgage in the UAE?',
  'valuation-and-advisory': 'What is my business actually worth today?',
  'research-intelligence': 'Is my project feasible in today’s market?',
  'technology-data-ai': 'How do we turn our data into better decisions?',
};

/** The dot's colour per practice: the recording moves through blue, green,
 *  teal and amber; two more of the same family for the six. */
const DOTS = ['#1D5CFF', '#22C07A', '#19B8D0', '#F2A93B', '#7A5CFF', '#FF5C7A'];

/** Registry strings may carry entities; the cards render text. */
function plain(v: string | undefined): string {
  return String(v ?? '')
    .replace(/\s*(?:&mdash;|&#8212;|&ndash;|&#8211;|—|–)\s*/g, ', ')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&rsquo;|&#8217;/g, '’')
    .replace(/<[^>]+>/g, '');
}

export default function UaeAnswerBand({ region }: { region: string }) {
  const scenes: AnswerScene[] = vxnServices(region).map((sv, i) => {
    const slug = sv.slug ?? sv.href;
    const name = plain(vxnServiceName(sv));
    return {
      key: slug,
      label: plain(sv.short),
      name,
      question: QUESTIONS[slug] ?? `What can ${name} do for my business?`,
      answer: plain(sv.desc),
      href: rurl(region, sv.href),
      img: rimgFirst(region, [
        `uae/home/answer-${slug}.webp`,
        ...(RELATED_FIGURE[slug] ?? []),
        sv.img.replace('/assets/content/uploads/', '').replace(/^\/+/, ''),
      ]),
      dot: DOTS[i % DOTS.length],
    };
  });

  return (
    <section className="vxn-answer" aria-labelledby="vxn-answer-title">
      <div className="vxn-answer__inner">
        <div className="vxn-answer__head">
          <div className="vxn-answer__lead">
            <span className="vxn-answer__eyebrow">Your Questions, Answered</span>
            <h2 id="vxn-answer-title" className="vxn-answer__title">
              Start With the Question on Your Mind
            </h2>
          </div>
          <div className="vxn-answer__aside">
            <p className="vxn-answer__lede">
              Six connected practices, one team. Choose the question closest to yours to see which
              practice answers it and where the work begins.
            </p>
            <a className="vxn-band__pill vxn-band__pill--solid vxn-answer__cta" href={rurl(region, '/free-consultation/')}>
              Ask Your Question
              <CtaArrow />
            </a>
          </div>
        </div>

        <UaeAnswerStage scenes={scenes} />
      </div>
    </section>
  );
}
