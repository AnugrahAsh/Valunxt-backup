/**
 * The why-Dubai ticker: one line of facts that never stops moving. Pure CSS
 * animation (translateX on a duplicated track), so it costs nothing and keeps
 * moving with the bundle blocked. Pauses under the pointer.
 */
import { TICKER } from '../../data/landing';

export default function Ticker() {
  const items = [...TICKER, ...TICKER];
  return (
    <div className="re-l-ticker" aria-label="Why Dubai, in one line">
      <div className="re-l-ticker__track">
        {items.map((t, i) => (
          <span className="re-l-ticker__item" key={i} aria-hidden={i >= TICKER.length ? 'true' : undefined}>
            <i />
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}
