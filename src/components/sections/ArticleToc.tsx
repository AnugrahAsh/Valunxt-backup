'use client';

/**
 * The sticky rail's "In this article" nav — highlights whichever section is
 * currently in view, the way the reference reading layout does. Pure
 * progressive enhancement: without JS the links still work, they just never
 * pick up the `.on` class.
 */
import { useEffect, useRef } from 'react';

import type { TocEntry } from '@/lib/blog/toc';

export default function ArticleToc({ toc }: { toc: TocEntry[] }) {
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav || !toc.length) return;

    const links = new Map(
      Array.from(nav.querySelectorAll<HTMLAnchorElement>('a[data-toc-id]')).map((a) => [
        a.dataset.tocId ?? '',
        a,
      ])
    );
    const headings = toc.map((t) => document.getElementById(t.id)).filter((el): el is HTMLElement => !!el);
    if (!headings.length) return;

    let current = '';
    const setActive = (id: string) => {
      if (id === current) return;
      current = id;
      links.forEach((a, key) => a.classList.toggle('on', key === id));
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]?.target instanceof HTMLElement) setActive(visible[0].target.id);
      },
      { rootMargin: '-112px 0px -70% 0px', threshold: 0 }
    );
    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [toc]);

  if (!toc.length) return null;

  return (
    <nav className="vxn-art-toc" aria-label="In this article" ref={navRef}>
      <div className="vxn-side-label">In this article</div>
      <ol>
        {toc.map((t) => (
          <li key={t.id}>
            <a href={`#${t.id}`} data-toc-id={t.id}>
              {t.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
