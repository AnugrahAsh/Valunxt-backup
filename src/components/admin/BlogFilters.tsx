'use client';

/**
 * The Blog & Insights search box, status filter and category filter.
 *
 * Behaves exactly like the Pages & SEO filter beside it: the search submits
 * itself shortly after typing stops, a select submits the moment it changes,
 * and neither carries a `p` field, so filtering always returns to page 1.
 */
import { useEffect, useRef } from 'react';

import Icon from './Icon';

export default function BlogFilters({
  action,
  value,
  status = '',
  category = '',
  categories = [],
}: {
  action: string;
  value: string;
  /** '' = every status. */
  status?: string;
  /** '' = every category. */
  category?: string;
  categories?: string[];
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

  const kept = new URLSearchParams();
  if (status) kept.set('s', status);
  if (category) kept.set('c', category);
  const clearHref = kept.toString() ? `${action}?${kept}` : action;

  return (
    <form method="get" action={action} className="pages-filter" role="search">
      <span className="enq-search">
        <Icon name="search" size={16} stroke={2.2} />
        <input
          ref={inputRef}
          type="text"
          name="q"
          id="blogFilter"
          defaultValue={value}
          placeholder="Search by title, slug or category…"
          aria-label="Search posts"
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

      <select
        name="s"
        className="market-select"
        defaultValue={status}
        aria-label="Filter by status"
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
      >
        <option value="">All statuses</option>
        <option value="published">Published</option>
        <option value="draft">Draft</option>
      </select>

      {categories.length ? (
        <select
          name="c"
          className="market-select"
          defaultValue={category}
          aria-label="Filter by category"
          onChange={(e) => e.currentTarget.form?.requestSubmit()}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option value={c} key={c}>
              {c}
            </option>
          ))}
        </select>
      ) : null}
    </form>
  );
}
