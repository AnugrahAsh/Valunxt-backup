/**
 * /blogs/ pagination — 8 cards a page (client instruction 20260917).
 *
 * Plain `<a>` links to `?page=N`: the route slices the published list server
 * side, so this needs no client JavaScript and works with the page cached.
 */
import { rurl } from '@/lib/region';

/* `.vxn-pager .vxn-pager__link` (not the bare class): the host's global
   `.elementor-kit-5 a { color:#fff }` outranks a single-class selector, which
   left the numbered links invisible (white on white). */
const CSS = `
.vxn-pager{display:flex;align-items:center;justify-content:center;gap:8px;margin:48px 0 0;flex-wrap:wrap;font-family:"DM Sans",sans-serif;}
.vxn-pager__link,.vxn-pager__current,.vxn-pager__gap{display:inline-flex;align-items:center;justify-content:center;min-width:38px;height:38px;padding:0 12px;border-radius:8px;font-size:14px;line-height:1;}
.vxn-pager .vxn-pager__link{color:#0E355F;text-decoration:none;border:1px solid #e5e1d8;transition:border-color .2s,color .2s,background .2s;}
.vxn-pager .vxn-pager__link:hover{border-color:#0B2DBE;color:#0B2DBE;background:#f7f6f3;}
.vxn-pager__current{background:#0B2DBE;color:#fff;font-weight:600;}
.vxn-pager__gap{color:#9aa1a9;}
.vxn-pager__nav{font-weight:600;gap:6px;padding:0 16px;}
.vxn-pager__disabled{opacity:.4;pointer-events:none;}
`;

/** Page numbers to render: first, last, and a window around the current page. */
function pagerNumbers(current: number, total: number, span = 1): Array<number | '…'> {
  const keep = new Set<number>([1, total]);
  for (let i = current - span; i <= current + span; i++) {
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

export default function BlogPager({
  region,
  currentPage,
  totalPages,
}: {
  region: string;
  currentPage: number;
  totalPages: number;
}) {
  if (totalPages <= 1) return null;

  const href = (n: number) => rurl(region, n <= 1 ? '/blogs/' : `/blogs/?page=${n}`);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <nav className="vxn-pager" aria-label="Insights pagination">
        {currentPage > 1 ? (
          <a className="vxn-pager__link vxn-pager__nav" href={href(currentPage - 1)} rel="prev">
            &larr; Prev
          </a>
        ) : (
          <span className="vxn-pager__link vxn-pager__nav vxn-pager__disabled">&larr; Prev</span>
        )}

        {pagerNumbers(currentPage, totalPages).map((n, i) =>
          n === '…' ? (
            <span className="vxn-pager__gap" key={'gap' + i}>
              &hellip;
            </span>
          ) : n === currentPage ? (
            <span className="vxn-pager__current" aria-current="page" key={n}>
              {n}
            </span>
          ) : (
            <a className="vxn-pager__link" href={href(n)} key={n}>
              {n}
            </a>
          )
        )}

        {currentPage < totalPages ? (
          <a className="vxn-pager__link vxn-pager__nav" href={href(currentPage + 1)} rel="next">
            Next &rarr;
          </a>
        ) : (
          <span className="vxn-pager__link vxn-pager__nav vxn-pager__disabled">Next &rarr;</span>
        )}
      </nav>
    </>
  );
}
