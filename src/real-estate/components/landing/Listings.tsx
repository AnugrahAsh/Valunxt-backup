'use client';

/**
 * Featured listings, filtered by the same state the hero's search writes.
 * One quiet filter row, then the property cards: a swipeable gallery of the
 * property, the price, the community, beds, baths and size, and its tags.
 * Cards re-flow on a layout animation when the filter changes; "View
 * details" opens the quick view; "Enquire" names the property in the form.
 */
import { useState } from 'react';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';

import { AREAS, LISTINGS, LISTINGS_HEAD, SEARCH, type Listing } from '../../data/landing';
import { useSearch } from './LandingBody';
import PropertyCard, { type PropertyView } from './PropertyCard';
import PropertyModal from './PropertyModal';
import { SectionHead, aed } from './shared';

const plural = (n: number, one: string) => `${n} ${one}${n === 1 ? '' : 's'}`;

/** The landing page's listing record, as the shared card reads it. */
function toView(l: Listing): PropertyView {
  const facts = [
    l.handover ? { label: 'Handover', value: l.handover } : null,
    l.plan ? { label: 'Payment plan', value: l.plan } : null,
    l.yieldPct ? { label: 'Gross yield', value: `~${l.yieldPct}%` } : null,
  ].filter(Boolean) as { label: string; value: string }[];
  return {
    id: `VX-F-${1001 + LISTINGS.indexOf(l)}`,
    title: l.title,
    community: l.area,
    type: l.type,
    price: aed(l.price, { compact: true }),
    priceNote: l.mode === 'rent' ? 'per year' : l.mode === 'offplan' ? 'from' : 'guide price',
    value: l.price,
    beds: l.beds === 0 ? 'Studio' : plural(l.beds, 'bed'),
    baths: plural(l.baths, 'bath'),
    area: `${l.sqft.toLocaleString('en-US')} sq ft`,
    status: l.handover ?? (l.mode === 'rent' ? (l.tags.find((t) => /available/i.test(t)) ?? 'Available now') : 'Ready'),
    images: [l.image, ...(l.gallery ?? [])],
    tags: l.tags.filter((t) => !/^(ready|off-plan|available.*)$/i.test(t)),
    summary: l.summary,
    features: l.features,
    facts,
  };
}

export default function Listings() {
  const { search, set, results, enquire } = useSearch();
  const budgets = SEARCH.budgets[search.mode];
  const [open, setOpen] = useState<PropertyView | null>(null);
  const ask = (v: PropertyView, fromModal = false) => {
    setOpen(null);
    const go = () => enquire(`${v.title}, ${v.community} (ref ${v.id})`);
    if (fromModal) window.setTimeout(go, 560);
    else go();
  };

  return (
    <section className="re-l-sec re-l-listings" id="listings">
      <div className="re-wrap">
        <div className="re-l-split">
          <SectionHead eyebrow={LISTINGS_HEAD.eyebrow} title={LISTINGS_HEAD.title} />
          <p className="re-l-lede" data-rv="up" data-rv-i="2">
            {LISTINGS_HEAD.lede}
          </p>
        </div>

        <div className="re-l-filters" data-rv="up" data-rv-i="3">
          <div className="re-l-tabs" role="tablist" aria-label="I want to">
            {SEARCH.modes.map((m) => (
              <button type="button" key={m.key} role="tab" aria-selected={search.mode === m.key} className={`re-l-tab${search.mode === m.key ? ' is-on' : ''}`} onClick={() => set({ mode: m.key })}>
                {m.label}
              </button>
            ))}
          </div>
          <div className="re-l-filters__fields">
            <label>
              <span>Area</span>
              <select value={search.area} onChange={(e) => set({ area: e.target.value })}>
                <option value="any">All of Dubai</option>
                {AREAS.map((a) => (
                  <option key={a.key} value={a.key}>
                    {a.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Type</span>
              <select value={search.type} onChange={(e) => set({ type: e.target.value })}>
                {SEARCH.types.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Bedrooms</span>
              <select value={search.beds} onChange={(e) => set({ beds: e.target.value })}>
                {SEARCH.beds.map((b) => (
                  <option key={b}>{b}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Budget</span>
              <select value={search.budget} onChange={(e) => set({ budget: Number(e.target.value) })}>
                {budgets.map((b, i) => (
                  <option key={b.label} value={i}>
                    {b.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <p className="re-l-filters__count" aria-live="polite">
            <strong>{results.length}</strong> {results.length === 1 ? 'property' : 'properties'}
          </p>
        </div>

        <LayoutGroup>
          <motion.div className="re-l-pgrid" layout>
            <AnimatePresence mode="popLayout">
              {results.map((l, i) => {
                const v = toView(l);
                return <PropertyCard key={l.id} p={v} i={i} onOpen={() => setOpen(v)} onEnquire={() => ask(v)} />;
              })}
            </AnimatePresence>
          </motion.div>
        </LayoutGroup>

        <PropertyModal p={open} onClose={() => setOpen(null)} onEnquire={(v) => ask(v, true)} note={LISTINGS_HEAD.note} />

        <AnimatePresence>
          {results.length === 0 ? (
            <motion.div className="re-l-empty" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <h3>Nothing featured matches that — yet.</h3>
              <p>The featured set is a curated cut. Tell us the brief and we search the whole market.</p>
              <button type="button" className="re-btn" onClick={() => enquire('a property matching my search')}>
                Send us the brief
              </button>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <p className="re-l-note">{LISTINGS_HEAD.note}</p>
      </div>
    </section>
  );
}
