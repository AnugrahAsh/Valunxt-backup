'use client';

/**
 * Client-side filter for the enquiries table.
 *
 * Port of the inline script at the foot of admin/enquiries.php: it hides rows
 * whose `data-search` attribute does not contain the query, and shows the
 * "no matches" panel when nothing is left.
 *
 * `initial` pre-fills it from `?q=`, which is how the dashboard and the search
 * screen link to one enquiry.
 */
import { useCallback, useEffect } from 'react';

function applyFilter(value: string): number {
  const q = value.trim().toLowerCase();
  const rows = Array.from(document.querySelectorAll<HTMLTableRowElement>('#enqTable tbody tr'));
  let shown = 0;
  for (const tr of rows) {
    const hit = !q || (tr.getAttribute('data-search') ?? '').includes(q);
    tr.style.display = hit ? '' : 'none';
    if (hit) shown++;
  }
  const noMatch = document.getElementById('noMatch');
  if (noMatch) noMatch.hidden = shown > 0;
  return shown;
}

export default function EnquiryFilter({ initial = '' }: { initial?: string }) {
  useEffect(() => {
    if (initial) applyFilter(initial);
  }, [initial]);

  const onInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    applyFilter(e.target.value);
  }, []);

  return (
    <input
      type="search"
      id="enqFilter"
      defaultValue={initial}
      placeholder="Filter by name, email, company…"
      aria-label="Filter enquiries"
      autoComplete="off"
      onChange={onInput}
    />
  );
}
