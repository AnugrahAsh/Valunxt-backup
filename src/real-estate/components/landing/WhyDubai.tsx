'use client';

/**
 * The case for Dubai in numbers, the way the home page states its own case:
 * four figures on white, counting up as they arrive, then a rounded band on
 * a live abstract carrying the other four in white type.
 */
import { WHY } from '../../data/landing';
import LiveAbstract from './LiveAbstract';
import { SectionHead } from './shared';

function Figure({ b }: { b: (typeof WHY.items)[number] }) {
  return (
    <p className="re-l-why__figure">
      {b.count !== undefined ? <span data-count={b.count}>{b.value}</span> : <span>{b.value}</span>}
      <small>{b.suffix}</small>
    </p>
  );
}

export default function WhyDubai() {
  const top = WHY.items.slice(0, 4);
  const band = WHY.items.slice(4);
  return (
    <section className="re-l-sec re-l-why" id="why-dubai">
      <div className="re-wrap">
        <div className="re-l-why__head">
          <SectionHead eyebrow={WHY.eyebrow} title={WHY.title} />
          <p className="re-l-lede re-l-why__lede" data-rv="up" data-rv-i="2">
            {WHY.lede}
          </p>
        </div>

        <ul className="re-l-why__row">
          {top.map((b, i) => (
            <li key={b.label} data-rv="up" data-rv-i={i}>
              <Figure b={b} />
              <h3>{b.label}</h3>
              <p>{b.body}</p>
            </li>
          ))}
        </ul>

        <div className="re-l-why__band" data-rv="clip" data-rv-i="2">
          <LiveAbstract variant="dunes" className="re-l-why__live" />
          <ul className="re-l-why__bandrow">
            {band.map((b) => (
              <li key={b.label}>
                <Figure b={b} />
                <h3>{b.label}</h3>
                <p>{b.body}</p>
              </li>
            ))}
          </ul>
        </div>

        <p className="re-l-note">{WHY.footnote}</p>
      </div>
    </section>
  );
}
