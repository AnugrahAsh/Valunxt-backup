/**
 * The markets a page is published in, as small chips ("IN", "AE").
 *
 * Linked when `links` is set, so a chip opens the page in that market. Safe in
 * server and client components.
 */
import type { MarketLink } from '@/lib/admin/seo-lib';

export default function MarketChips({ markets, links = false }: { markets: MarketLink[]; links?: boolean }) {
  if (!markets.length) return null;
  return (
    <span className="market-chips">
      {markets.map((m) =>
        links ? (
          <a
            key={m.region}
            className={`market-chip ${m.region}`}
            href={m.path}
            target="_blank"
            rel="noopener"
            title={`Open ${m.path} (${m.label})`}
          >
            {m.code}
          </a>
        ) : (
          <span key={m.region} className={`market-chip ${m.region}`} title={m.label}>
            {m.code}
          </span>
        ),
      )}
    </span>
  );
}
