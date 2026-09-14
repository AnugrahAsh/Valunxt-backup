/**
 * "Valunxt Answer", the ask-and-answer band on /en-ae/ (20260911, restaged
 * 20260912, pared back the same day).
 *
 * The band began as a restaging of "BCG Answer", the promo on bcg.com's home
 * page, and was flagged as too close to it. It is now its own thing: the
 * stage sits on the LEFT, on the brand's dark pleated-blue artwork, and holds
 * a rail of the six questions (buttons, one lit and timed), an ask field
 * across the top and the answer card under it; the copy and the call to
 * action sit on the right. The measurements are in the stylesheet (section
 * 17 of assets/css/valunxt-landing.css) and the stage itself, with its
 * timeline and what the visitor can do with it, is UaeAnswerVisual.tsx. This
 * file is the section's copy and the six scenes the stage plays, one per
 * service.
 *
 * PARED BACK on client feedback: the first stage was cluttered. The answer
 * card carried a picture, a chip, a headline, the answer, a "Where to start"
 * label, three page links with thumbnails and the service link; it now
 * carries the picture, the chip, the headline, the answer and the one link,
 * and the rail lost its counter. The lede is one sentence. The motion (the
 * typing, the progress bar, the card sliding up) is what remains, with more
 * room around it.
 *
 * THE COPY IS NOT THE CLIENT'S. Every other band on this page carries the home
 * document word for word; this band was asked for after that document was
 * written, so its eyebrow, title, lede and button (rewritten 20260912 on
 * client feedback: "Valunxt Answer" went), the rail's "Pick a question"
 * label, the card's "Explore <service>" link and the six questions are
 * drafted here, in the document's register, to be replaced when the client
 * supplies theirs. Everything else the stage shows is the registry's: each
 * answer is the service's own accordion sentence, the card's title is the
 * service's headline and the picture is the service's own. No em dashes, as
 * on every UAE page: plain() turns any that reach it into a comma.
 *
 * WHERE IT SITS. After the six services and before the impact strip, because
 * every question it answers is one of theirs. India renders nothing of this.
 */
import { rurl, vxnServiceName, vxnServices } from '@/lib/region';
import { rimgFirst } from '@/lib/region-assets';

import UaeAnswerVisual, { type AnswerScene } from './UaeAnswerVisual';

/** One question a visitor might type, per service. Drafted, see above. */
const QUESTIONS: Record<string, string> = {
  'accounting-tax-services': 'Is my business ready for UAE Corporate Tax?',
  'real-estate-transactions': 'Is now the right time to buy property in Dubai?',
  'mortgages-services': 'Can a non-resident get a mortgage in the UAE?',
  'valuation-and-advisory': 'What is my business actually worth today?',
  'research-intelligence': 'Is my project feasible in today’s market?',
  'technology-data-ai': 'How do we turn our data into better decisions?',
};

/**
 * The stage's ground: the brand's cobalt field with folded ribbons in its
 * lower right, banners/uae-slider-4 (1920x1080, so it covers the landscape
 * stage with almost no crop and the folds land under the answer card).
 * Rehman's call, 20260912; the pleats, abstract-1, and then the diagonal
 * texture-1 were here earlier that day.
 */
const TEXTURE = 'banners/uae-slider-4.webp';

/**
 * Registry strings are authored for <Html> and may carry entities; the stage
 * renders text, so they are decoded here. The dash rule is applied at the
 * same time: an em or en dash, entity or character, becomes a comma.
 */
function plain(v: string | undefined): string {
  return String(v ?? '')
    .replace(/\s*(?:&mdash;|&#8212;|&ndash;|&#8211;|—|–)\s*/g, ', ')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&rsquo;|&#8217;/g, '’')
    .replace(/&lsquo;|&#8216;/g, '‘')
    .replace(/&ldquo;|&#8220;/g, '“')
    .replace(/&rdquo;|&#8221;/g, '”')
    .replace(/<[^>]+>/g, '');
}

export default function UaeAnswerBand({ region }: { region: string }) {
  const scenes: AnswerScene[] = vxnServices(region).map((sv) => {
    const slug = sv.slug ?? sv.href;
    const name = vxnServiceName(sv);
    const file = sv.img.replace('/assets/content/uploads/', '');

    return {
      key: slug,
      question: QUESTIONS[slug] ?? `What can ${name} do for my business?`,
      answer: plain(sv.desc),
      service: {
        name,
        short: plain(sv.short),
        headline: plain(sv.headline) || name,
        href: rurl(region, sv.href),
        /* The card's own picture first (20260914): the services accordion
           above this band shows the registry photograph, so the answer card
           must not repeat it. */
        img: rimgFirst(region, [`uae/home/answer-${slug}.webp`, file]),
        alt: name,
      },
    };
  });

  return (
    <section className="vxn-answer" aria-labelledby="vxn-answer-title">
      <div className="vxn-answer__inner">
        {/* Copy first in the source for readers; the grid puts the stage on
            the left of it. */}
        <div className="vxn-answer__copy">
          <span className="vxn-band__eyebrow">Your Questions, Answered</span>
          <h2 id="vxn-answer-title" className="vxn-answer__title">
            Start With the Question on Your Mind
          </h2>
          <p className="vxn-answer__lede">
            Six connected practices, one team. Choose the question closest to yours to see which
            practice answers it and where the work begins.
          </p>
        </div>

        {/* Its own cell, so the button sits at the foot of the copy column and
            ends level with the stage. The house pill, unaltered. */}
        <div className="vxn-answer__foot">
          <a className="vxn-band__pill vxn-band__pill--solid vxn-answer__cta" href={rurl(region, '/free-consultation/')}>
            Ask Your Question
            <i aria-hidden="true" className="vamtamtheme- vamtam-theme-arrow-right" />
          </a>
        </div>

        <div className="vxn-answer__media">
          {/* The stage's own plate first (20260914); the folds behind it are
              the fallback. */}
          <UaeAnswerVisual scenes={scenes} texture={rimgFirst(region, ['uae/home/answer-stage.webp', TEXTURE])} />
        </div>
      </div>
    </section>
  );
}
