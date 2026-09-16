/**
 * The "Showing 1–20 of 57" line and the page links beneath a listing, in the
 * same markup the Pages & SEO screen renders.
 */
import Icon from './Icon';

/**
 * Page numbers to render: always the first and last, plus a window around the
 * current page, with '…' standing in for the gaps.
 */
export function pagerNumbers(current: number, total: number, window = 1): Array<number | '…'> {
  const keep = new Set<number>([1, total]);
  for (let i = current - window; i <= current + window; i++) {
    if (i >= 1 && i <= total) keep.add(i);
  }
  const sorted = [...keep].sort((a, b) => a - b);
  const out: Array<number | '…'> = [];
  let prev = 0;
  for (const n of sorted) {
    if (prev && n > prev + 1) out.push('…');
    out.push(n);
    prev = n;
  }
  return out;
}

export default function Pager({
  page,
  pages,
  total,
  perPage,
  noun,
  href,
}: {
  page: number;
  pages: number;
  total: number;
  perPage: number;
  /** Plural, e.g. "leads". */
  noun: string;
  href: (page: number) => string;
}) {
  if (pages <= 1) return null;
  const first = (page - 1) * perPage + 1;
  const last = Math.min(page * perPage, total);
  return (
    <nav className="pager" aria-label={`${noun} pages`}>
      <span className="pager-count">
        Showing{' '}
        <strong>
          {first}–{last}
        </strong>{' '}
        of <strong>{total}</strong> {noun}
      </span>
      <span className="pager-links">
        {page > 1 ? (
          <a className="pg" href={href(page - 1)} rel="prev" aria-label="Previous page">
            <Icon name="chevronLeft" size={14} stroke={2.4} />
            Prev
          </a>
        ) : (
          <span className="pg is-disabled">
            <Icon name="chevronLeft" size={14} stroke={2.4} />
            Prev
          </span>
        )}
        {pagerNumbers(page, pages).map((n, i) =>
          n === '…' ? (
            <span className="pg gap" key={'gap' + i}>
              …
            </span>
          ) : n === page ? (
            <span className="pg current" aria-current="page" key={n}>
              {n}
            </span>
          ) : (
            <a className="pg" href={href(n)} key={n}>
              {n}
            </a>
          )
        )}
        {page < pages ? (
          <a className="pg" href={href(page + 1)} rel="next" aria-label="Next page">
            Next
            <Icon name="chevronRight" size={14} stroke={2.4} />
          </a>
        ) : (
          <span className="pg is-disabled">
            Next
            <Icon name="chevronRight" size={14} stroke={2.4} />
          </span>
        )}
      </span>
    </nav>
  );
}
