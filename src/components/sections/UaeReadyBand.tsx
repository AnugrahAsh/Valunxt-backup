/**
 * "Let's begin" — the closing conversion band on /en-ae/ and, since
 * 20260914, on /en-in/ too.
 *
 * REDESIGNED FROM SCRATCH on client request. It was copy on the left and three
 * floating cards on the right, over a wash of blurred ribbons drifting on long
 * loops. It now reads top to bottom: the statement and its lede share one line,
 * and the ways to start are the rows of a single white card.
 *
 *   ── LET'S BEGIN
 *   The Right Advice Starts                      Tell us what you're looking
 *   With the Right Conversation.                 to achieve. We'll connect…
 *   ┌───────────────────────────────────────────────────────────────────┐
 *   │ (o)  Book a Free Consultation    Discuss your business, pro…  (↗) │
 *   └───────────────────────────────────────────────────────────────────┘
 *
 * WHY ROWS. The insights carousel directly above is a row of image cards, the
 * trio under the hero is three more, and the band directly below is a split
 * panel. A ruled list is the one shape nothing near it uses, and it gives each
 * route a full-width target with its note on the same line. Each row is the
 * whole of its link, and fills with the brand ramp when it is pointed at.
 *
 * ONE ROW, NOT THREE, since the client's home-page document (20260911): it
 * names the consultation and nothing else, and its rule is that nothing is
 * added to it. The fixed-fee quote and the phone row went with the old copy.
 * The list still takes any number of routes, so restoring one is an entry
 * below and the words to put in it.
 *
 * Styles: assets/css/valunxt-landing.css (.vxn-ready).
 */
import { rurl } from '@/lib/region';

/** The three glyphs, drawn rather than pulled from the icon font so they share
 *  a stroke weight with the rest of this block. */
function Glyph({ name }: { name: 'talk' | 'quote' | 'call' }) {
  const common = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.7,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    focusable: 'false' as const,
    'aria-hidden': true,
  };
  if (name === 'talk') {
    return (
      <svg {...common}>
        <path d="M8.5 11a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
        <path d="M16 11.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
        <path d="M3 19v-1a5.5 5.5 0 0 1 11 0v1" />
        <path d="M16 14a5 5 0 0 1 5 5v0" />
      </svg>
    );
  }
  if (name === 'quote') {
    return (
      <svg {...common}>
        <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" />
        <path d="M14 3v5h5" />
        <path d="M9 13h6M9 17h4" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M15.5 20.5A13.5 13.5 0 0 1 3.5 8.5a2.5 2.5 0 0 1 2.2-2.5l1.6-.2a1.4 1.4 0 0 1 1.5.9l.9 2.2a1.4 1.4 0 0 1-.4 1.6l-1 .8a10.6 10.6 0 0 0 4.4 4.4l.8-1a1.4 1.4 0 0 1 1.6-.4l2.2.9a1.4 1.4 0 0 1 .9 1.5l-.2 1.6a2.5 2.5 0 0 1-2.5 2.2Z" />
    </svg>
  );
}

/** The end cap on every row. The arrow turns to point along the row when the
 *  row is pointed at. */
function GoArrow() {
  return (
    <span className="vxn-ready__go" aria-hidden="true">
      <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" focusable="false">
        <path
          d="M4.5 11.5L11.5 4.5M11.5 4.5H5.5M11.5 4.5V10.5"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

type Route = {
  icon: 'talk' | 'quote' | 'call';
  name: string;
  note: string;
  href: string;
};

/** One face of a row. Every row draws two — see the note on the list. */
function RouteFace({ route, fill = false }: { route: Route; fill?: boolean }) {
  return (
    <span
      className={`vxn-ready__face${fill ? ' vxn-ready__face--fill' : ''}`}
      aria-hidden={fill || undefined}
    >
      <span className="vxn-ready__icon" aria-hidden="true">
        <Glyph name={route.icon} />
      </span>
      <span className="vxn-ready__name">{route.name}</span>
      <span className="vxn-ready__note">{route.note}</span>
      <GoArrow />
    </span>
  );
}

export default function UaeReadyBand({ region }: { region: string }) {
  const routes: Route[] = [
    {
      icon: 'talk',
      name: 'Book a Free Consultation',
      note: 'Discuss your business, property or investment requirements with our team.',
      href: rurl(region, '/free-consultation/'),
    },
  ];

  return (
    <section className="vxn-ready" aria-labelledby="vxn-ready-title">
      <div className="vxn-ready__inner">
        <div className="vxn-ready__head">
          <div className="vxn-ready__intro">
            <span className="vxn-ready__eyebrow">Let&rsquo;s Begin</span>
            {/* The second clause is an <i>, not a <span> or an <em> — see the
                note on .vxn-ready__accent for why it is the one inline element
                that keeps the heading's face. It starts where the document
                breaks the line. */}
            <h2 id="vxn-ready-title" className="vxn-ready__title">
              The Right Advice Starts <i className="vxn-ready__accent">With the Right Conversation.</i>
            </h2>
          </div>
          <p className="vxn-ready__lede">
            Tell us what you&rsquo;re looking to achieve. We&rsquo;ll connect you with the right
            expertise and a clear way forward.
          </p>
        </div>

        {/* EACH ROW IS DRAWN TWICE: in ink on the white card, and again in white
            on the brand ramp, stacked, with the white face uncovered by a clip
            that sweeps across the row. The text itself never changes colour, so
            no part of it can turn white ahead of the fill or stay white behind
            it — the fill's edge is the only thing moving. See THE FILL in the
            stylesheet for what fading the text instead measured at. The white
            face is aria-hidden, so the link is read once.

            The lead route is marked so its end cap is the one solid control in
            the card: the consultation is the route this page is built toward. */}
        <ul className="vxn-ready__list">
          {routes.map((it, i) => (
            <li className="vxn-ready__item" key={it.name}>
              <a className={`vxn-ready__route${i === 0 ? ' is-lead' : ''}`} href={it.href}>
                <RouteFace route={it} />
                <RouteFace route={it} fill />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
