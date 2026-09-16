'use client';

/**
 * The search box and select filters above a table-backed listing.
 *
 * Behaves like the Pages and Blog filters beside it: the search submits itself
 * shortly after typing stops, a select submits the moment it changes, and
 * neither carries the page number, so filtering always returns to page 1.
 */
import { useEffect, useRef } from 'react';

import Icon from './Icon';

export interface FilterSpec {
  name: string;
  label: string;
  value: string;
  options: Array<[string, string]>;
}

export default function ResourceFilters({
  action,
  value,
  searchable,
  filters,
  hidden = {},
}: {
  action: string;
  value: string;
  searchable: boolean;
  filters: FilterSpec[];
  /** Kept on every submit, e.g. the parent id. */
  hidden?: Record<string, string>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const el = inputRef.current;
    if (el && el.value !== '') {
      el.focus();
      el.setSelectionRange(el.value.length, el.value.length);
    }
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const kept = new URLSearchParams(hidden);
  for (const f of filters) if (f.value) kept.set(f.name, f.value);
  const clearHref = kept.toString() ? `${action}?${kept}` : action;

  return (
    <form method="get" action={action} className="pages-filter" role="search">
      {Object.entries(hidden).map(([k, v]) => (
        <input type="hidden" name={k} value={v} key={k} />
      ))}
      {searchable ? (
        <span className="enq-search">
          <Icon name="search" size={16} stroke={2.2} />
          <input
            ref={inputRef}
            type="text"
            name="q"
            defaultValue={value}
            placeholder="Search…"
            aria-label="Search"
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
      ) : null}

      {filters.map((f) => (
        <select
          key={f.name}
          name={f.name}
          className="market-select"
          defaultValue={f.value}
          aria-label={`Filter by ${f.label.toLowerCase()}`}
          onChange={(e) => e.currentTarget.form?.requestSubmit()}
        >
          <option value="">All {f.label.toLowerCase()}</option>
          {f.options.map(([v, l]) => (
            <option value={v} key={v}>
              {l}
            </option>
          ))}
        </select>
      ))}
    </form>
  );
}
