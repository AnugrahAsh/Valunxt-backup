'use client';

/**
 * The service pages' listings: a tab per group where a page has more than
 * one (for rent / for sale), type chips built from what is actually in the
 * group, a sort, a live count, the property cards and the quick view.
 * "Enquire" names the property in the form at the foot of the page.
 */
import { useMemo, useState } from 'react';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';

import PropertyCard, { type PropertyView } from './PropertyCard';
import PropertyModal from './PropertyModal';
import { useEnquiry, scrollToId } from './enquiry';

type Sort = 'featured' | 'low' | 'high';

export default function PropertyGrid({ groups, note }: { groups: { key: string; label: string; items: PropertyView[] }[]; note?: string }) {
  const [g, setG] = useState(groups[0]?.key ?? '');
  const [type, setType] = useState('All');
  const [sort, setSort] = useState<Sort>('featured');
  const [open, setOpen] = useState<PropertyView | null>(null);
  const enquiry = useEnquiry();

  const group = groups.find((x) => x.key === g) ?? groups[0]!;
  const types = useMemo(() => ['All', ...Array.from(new Set(group.items.map((p) => p.type)))], [group]);
  const shown = useMemo(() => {
    const list = group.items.filter((p) => type === 'All' || p.type === type);
    if (sort === 'low') return [...list].sort((a, b) => (a.value ?? 0) - (b.value ?? 0));
    if (sort === 'high') return [...list].sort((a, b) => (b.value ?? 0) - (a.value ?? 0));
    return list;
  }, [group, type, sort]);

  /* From the quick view, the page only starts moving once the dialog has
     closed and released the scroll lock. */
  const enquire = (p: PropertyView, fromModal = false) => {
    setOpen(null);
    const about = `${p.title}, ${p.community} (ref ${p.id})`;
    const go = () => (enquiry ? enquiry.enquire(about) : scrollToId('enquire'));
    if (fromModal) window.setTimeout(go, 560);
    else go();
  };

  return (
    <>
      <div className="re-l-pbar" data-rv="up" data-rv-i="3">
        {groups.length > 1 ? (
          <div className="re-l-tabs" role="tablist" aria-label="Listings">
            {groups.map((x) => (
              <button
                type="button"
                key={x.key}
                role="tab"
                aria-selected={x.key === group.key}
                className={`re-l-tab${x.key === group.key ? ' is-on' : ''}`}
                onClick={() => {
                  setG(x.key);
                  setType('All');
                }}
              >
                {x.label}
              </button>
            ))}
          </div>
        ) : null}
        <div className="re-l-pbar__chips" role="group" aria-label="Property type">
          {types.map((t) => (
            <button type="button" key={t} className={`re-l-chip${t === type ? ' is-on' : ''}`} onClick={() => setType(t)}>
              {t === 'All' ? 'All types' : t}
            </button>
          ))}
        </div>
        <label className="re-l-pbar__sort">
          <span>Sort</span>
          <select value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
            <option value="featured">Featured</option>
            <option value="low">Price, low to high</option>
            <option value="high">Price, high to low</option>
          </select>
        </label>
        <p className="re-l-pbar__count" aria-live="polite">
          <strong>{shown.length}</strong> {shown.length === 1 ? 'property' : 'properties'}
        </p>
      </div>

      <LayoutGroup>
        <motion.div className="re-l-pgrid" layout>
          <AnimatePresence mode="popLayout">
            {shown.map((p, i) => (
              <PropertyCard key={p.id} p={p} i={i} onOpen={() => setOpen(p)} onEnquire={() => enquire(p)} />
            ))}
          </AnimatePresence>
        </motion.div>
      </LayoutGroup>

      <PropertyModal p={open} onClose={() => setOpen(null)} onEnquire={(p) => enquire(p, true)} note={note} />
    </>
  );
}
