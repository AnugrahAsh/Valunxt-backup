/**
 * The steps, as hairline rows beside a sticky heading. Used by the landing
 * page (the five-step overview) and every service page (that service's own
 * steps).
 */
import { PROCESS, PROCESS_HEAD } from '../../data/landing';
import { IcArrowUp, SectionHead } from './shared';

export default function Process({
  eyebrow = PROCESS_HEAD.eyebrow,
  title = PROCESS_HEAD.title,
  steps = PROCESS,
  cta,
}: {
  eyebrow?: string;
  title?: string;
  steps?: { n: string; title: string; body: string }[];
  cta?: { label: string; href: string };
}) {
  return (
    <section className="re-l-sec re-l-proc" id="process">
      <div className="re-wrap">
        <div className="re-l-proc__grid">
          <div className="re-l-proc__side">
            <SectionHead eyebrow={eyebrow} title={title} />
            {cta ? (
              <a className="re-btn" href={cta.href} data-rv="up" data-rv-i="3">
                {cta.label}
                <IcArrowUp />
              </a>
            ) : null}
          </div>
          <ol className="re-l-steps">
            {steps.map((s, i) => (
              <li className="re-l-step" key={s.n} data-rv="left" data-rv-i={i}>
                <span className="re-l-step__n">{s.n}</span>
                <div>
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
