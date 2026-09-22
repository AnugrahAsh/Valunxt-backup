/**
 * The practices band on /en-ae/ (20260912, simplified the same day).
 *
 * Built to the reference supplied that day: one wide rounded card on a blue
 * gradient with flowing ribbons across it, a lead panel held apart on the left
 * and three points beside it with a hairline between each. The reference's
 * palette is not used; every surface here is the brand's own, and the ribbons
 * were homepage/abstract-2.webp, the artwork already in uploads that the
 * reference's background happens to be a near match for, until the client
 * supplied uae/home/connected-practices.webp (20260913).
 *
 * NO FIGURES. The first build carried four numbers (six practices, 48+ years,
 * 200+ years combined, 10+ industries) rolled up on arrival. Rehman asked for
 * the number content to go and simple headings to take its place, at a smaller
 * size, so each cell is now a short heading over one line of prose and the
 * roll is gone. The three points still say what the three figures said, in
 * words; the numbers themselves remain in the band below ("Expertise Measured
 * in Decades."), which is client copy and was left alone.
 *
 * THE WORDING IS MINE, drafted in the home document's register, because the
 * document gives no caption for any of it. A slot to be replaced when the
 * client supplies copy. No em dashes, as on every UAE page.
 *
 * WHERE IT SITS. Straight after the "Who We Are" trio and before the six
 * services, so the proof is read before the offer. India renders none of it.
 *
 * Motion: components/sections/UaeBandMotion.tsx fades the panel and the three
 * points in once the card is on screen; nothing here depends on it.
 *
 * Styles: assets/css/valunxt-landing.css (section 19, .vxn-figs).
 */
import { rimgFirst } from '@/lib/region-assets';
import { rurl } from '@/lib/region';
import LiveImage from '@/components/three/live/LiveImage';

/** One point: a short heading and the line under it. */
interface Point {
  title: string;
  label: string;
}

/* Drafted, see the header. */
const POINTS: Point[] = [
  {
    title: 'Decades of Expertise',
    label: 'Experience behind every valuation, report and recommendation.',
  },
  {
    title: 'A Senior Advisory Team',
    label: 'Accountants, tax advisers and valuers working as one team.',
  },
  {
    title: 'Every Industry, One Standard',
    label: 'Each sector served to the same standard of evidence.',
  },
];

export default function UaeFigureBand({ region }: { region: string }) {
  return (
    <section className="vxn-figs" aria-labelledby="vxn-figs-title">
      <div className="vxn-figs__card" data-vxn-figs="">
        {/* The client's plate for this band (20260913), with the ribbons it
            replaced behind it in case the file is ever missing. */}
        {/* Live since 20260922 (components/three/live): the plate's threads of
            light, drawn, with the file under them for anyone without WebGL. */}
        <LiveImage
          className="vxn-figs__texture"
          src={rimgFirst(region, ['uae/home/connected-practices.webp', 'homepage/abstract-2.webp'])}
          alt=""
          aria-hidden="true"
          loading="lazy"
        />
        {/* The two soft lights that lift the ribbons off the fill. Painted
            rather than drawn, so they cost nothing and scale with the card. */}
        <span className="vxn-figs__glow" aria-hidden="true" />

        <div className="vxn-figs__lead">
          <h2 id="vxn-figs-title" className="vxn-figs__leadTitle">
            Connected Practices for Businesses
          </h2>
          <p className="vxn-figs__leadCopy">
            Accounting and tax, real estate, mortgages, valuation, research and technology,
            advised from one view of your business.
          </p>
          <a className="vxn-figs__leadLink" href={rurl(region, '/services/')}>
            Explore Our Services
            <i aria-hidden="true" className="vamtamtheme- vamtam-theme-arrow-right vxn-cta__arrow" />
          </a>
        </div>

        <ul className="vxn-figs__stats">
          {POINTS.map((p) => (
            <li className="vxn-figs__stat" key={p.title}>
              <h3 className="vxn-figs__num">{p.title}</h3>
              <p className="vxn-figs__lbl">{p.label}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
