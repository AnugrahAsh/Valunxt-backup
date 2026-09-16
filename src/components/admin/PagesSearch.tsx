'use client';

/**
 * The Pages & SEO search box and market filter.
 *
 * The search submits itself shortly after typing stops, and the market filter
 * the moment it changes, so results stay in step without needing the Enter
 * key. Searching always returns to page 1 because the form carries no `p`
 * field.
 *
 * Port of the inline script at the foot of admin/pages.php.
 */
import { useEffect, useRef } from 'react';

import Icon from './Icon';

export default function PagesSearch({
  action,
  value,
  market = '',
  markets = [],
}: {
  action: string;
  value: string;
  /** The market filter in effect ('' = every market). */
  market?: string;
  /** [slug, label] for each market. */
  markets?: Array<[string, string]>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Keep the caret in the box after a search reloads the page.
    const el = inputRef.current;
    if (el && el.value !== '') {
      el.focus();
      el.setSelectionRange(el.value.length, el.value.length);
    }
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const clearHref = market ? `${action}?m=${encodeURIComponent(market)}` : action;

  return (
    <form method="get" action={action} className="pages-filter" role="search">
      <span className="enq-search">
        <Icon name="search" size={16} stroke={2.2} />
        <input
          ref={inputRef}
          type="text"
          name="q"
          id="pageFilter"
          defaultValue={value}
          placeholder="Search by title or slug…"
          aria-label="Search pages"
          autoComplete="off"
          onChange={(e) => {
            const form = e.currentTarget.form;
            if (timer.current) clearTimeout(timer.current);
            timer.current = setTimeout(() => form?.requestSubmit(), 450);
          }}
        />
        {value !== '' ? (
          <a href={clearHref} className="clear-search" title="Clear search" aria-label="Clear search">
            <Icon name="close" size={12} stroke={2.6} />
          </a>
        ) : null}
      </span>
      {markets.length ? (
        <select
          name="m"
          className="market-select"
          defaultValue={market}
          aria-label="Filter by market"
          onChange={(e) => e.currentTarget.form?.requestSubmit()}
        >
          <option value="">All markets</option>
          {markets.map(([slug, label]) => (
            <option value={slug} key={slug}>
              {label}
            </option>
          ))}
        </select>
      ) : null}
    </form>
  );
}
