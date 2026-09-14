'use client';

/**
 * The mega menu panel — built to a supplied reference (the KPMG services
 * panel) for the UAE Services item, and since 20260914 the one UI for every
 * mega menu on the site: Services in both markets and Insights in both. The
 * file keeps its name because the stylesheet (valunxt-uae-mega.css, .vxn-umega)
 * and every note that points at it do too; the words come in as a preset from
 * mega-presets.ts.
 *
 *   ┌───────────────┬──────────────────────────────────────────────┐
 *   │               │  [tab] [tab] [tab] [tab]                 (x) │
 *   │   Services    ├──────────────────────────────────────────────┤
 *   │   lede…       │   link ›      link ›      link ›             │
 *   │               │   link ›      link ›      link ›             │
 *   │               │                                              │
 *   │   Learn More ›│   View all … ›                               │
 *   └──────────────────────────── accent rule ─────────────────────┘
 *
 * ---------------------------------------------------------------------------
 * WHY THIS IS A CLIENT COMPONENT
 *
 * The panel OPENS on hover in CSS (`li:hover > .panel`), so it works before
 * hydration and stays consistent with the About dropdown. React owns two
 * pieces of state hover cannot express: which tab is selected, and the close
 * button the reference puts in the tab row.
 *
 * `dismissed` clears on pointer leave AND on re-entering the trigger. Without
 * either, closing the panel once would leave it shut for the rest of the page —
 * the pointer is still inside the item that opens it, so no hover event would
 * ever re-fire. See the note on the trigger below.
 *
 * ---------------------------------------------------------------------------
 * THE TABS ARE THE GROUPS of the preset. For UAE Services that is one tab per
 * service with the service's own sub-pages under it, read from
 * vxnServices('en-ae') as before. For India Services and for Insights there
 * is one group, so the row carries one tab and the pane lists the pages.
 *
 * Each tab is also a LINK to its group's page, on client request. Hovering or
 * focusing a tab still swaps the pane, so the pointer previews a group and a
 * click commits to it. A tap is the one gesture where those two cannot share an
 * event — see the note on the tab row.
 */

import { useEffect, useRef, useState } from 'react';

import { rurl } from '@/lib/region';
import CtaArrow from '@/components/ui/CtaArrow';
import type { MegaGroup, MegaPreset } from './mega-presets';

function Chev() {
  return (
    <svg className="vxn-umega__chev" viewBox="0 0 12 12" fill="none" aria-hidden="true" focusable="false">
      <path d="m4 2 4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function UaeServicesMega({
  region,
  preset,
  tabIndex,
}: {
  region: string;
  preset: MegaPreset;
  /** -1 takes every control out of the tab order. Unused since 20260914: the
      hidden burger-drawer copy renders MegaDrawerItem instead of this panel. */
  tabIndex?: number;
}) {
  const groups = preset.groups;
  const [active, setActive] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const itemRef = useRef<HTMLLIElement>(null);
  /* The tab a touch went down on, and whether its pane was already showing at
     that moment. See the note on the tab row. */
  const tap = useRef<{ index: number; shown: boolean } | null>(null);

  /* Escape closes it from anywhere inside, which is the one thing a hover menu
     otherwise gives a keyboard user no way to do. */
  useEffect(() => {
    if (dismissed) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (!itemRef.current?.contains(document.activeElement)) return;
      setDismissed(true);
      itemRef.current?.querySelector<HTMLAnchorElement>('.elementor-item')?.focus();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [dismissed]);

  const tab = tabIndex === -1 ? { tabIndex: -1 } : {};
  const current: MegaGroup | undefined = groups[active] ?? groups[0];

  return (
    <li
      ref={itemRef}
      className={`menu-item menu-item-type-post_type menu-item-object-page menu-item-has-children vxn-umega${
        dismissed ? ' is-dismissed' : ''
      }`}
      onMouseLeave={() => setDismissed(false)}
    >
      {/* ---- WHY THE RE-ARM IS ON THE TRIGGER AND NOT ONLY ON LEAVE --------
          The panel is a DOM child of this <li>, so while the pointer is over
          the sheet the <li> is still hovered and `mouseleave` has not fired.
          Press ✕ and the sheet stops taking pointer events — but the browser
          does not re-run hit testing until the pointer next MOVES, and if that
          move lands straight on this link the browser fires one mouseout whose
          relatedTarget is this anchor. That is still inside the <li>, so React
          correctly does NOT fire onMouseLeave, `dismissed` stays set, and the
          menu is hovered but refuses to open. Clearing on entry to the trigger
          closes that hole. */}
      <a
        href={rurl(region, preset.href)}
        className="elementor-item"
        onMouseEnter={() => setDismissed(false)}
        {...tab}
      >
        {preset.label}
      </a>

      <div className="vxn-umega__panel">
        <div className="vxn-umega__inner">
          <div className="vxn-umega__body">
            {/* The blue column. A heading, a sentence and one link out — the
                reference gives it no navigation of its own. */}
            <aside className="vxn-umega__aside">
              <span className="vxn-umega__asidetitle">{preset.aside.title}</span>
              <p className="vxn-umega__asidelede">{preset.aside.lede}</p>
              <a className="vxn-umega__asidelink" href={rurl(region, preset.aside.linkHref)} {...tab}>
                {preset.aside.linkLabel}
                <CtaArrow />
              </a>
            </aside>

            <div className="vxn-umega__main">
              {/* ---- A TAP IS NOT A HOVER -----------------------------------
                  With a mouse, hovering a tab has selected it long before the
                  click lands, so the click simply follows the link. A touch has
                  no hover in front of it: the tap would navigate before the
                  pane was ever seen, so on a touch screen wide enough for this
                  panel only the first group's pages could be reached at all.
                  (The burger drawer no longer renders this panel; it lists
                  every group's pages itself, see MegaDrawerItem.)

                  So a tap on a tab whose pane is not showing opens that pane
                  and goes no further, and a second tap follows the link.

                  The check reads a snapshot taken at pointerdown, not `active`
                  at click time. A tap's emulated mouseenter and its focus both
                  select the tab before the click is dispatched, so read at
                  click time every tab would already look shown. `e.detail` is
                  0 for a keyboard activation, which focus has already
                  previewed, so Enter always follows the link. */}
              <div className="vxn-umega__tabs">
                {groups.map((g, i) => (
                  <a
                    key={g.key}
                    href={rurl(region, g.href)}
                    className={`vxn-umega__tab${i === active ? ' is-active' : ''}`}
                    onPointerDown={(e) => {
                      tap.current = e.pointerType === 'mouse' ? null : { index: i, shown: i === active };
                    }}
                    onPointerCancel={() => {
                      tap.current = null;
                    }}
                    onMouseEnter={() => setActive(i)}
                    onFocus={() => setActive(i)}
                    onClick={(e) => {
                      const t = tap.current;
                      tap.current = null;
                      if (t && t.index === i && !t.shown && e.detail !== 0) {
                        e.preventDefault();
                        setActive(i);
                      }
                    }}
                    {...tab}
                  >
                    {g.label}
                  </a>
                ))}

                <button
                  type="button"
                  className="vxn-umega__close"
                  aria-label={preset.closeLabel}
                  onClick={() => setDismissed(true)}
                  tabIndex={tabIndex === -1 ? -1 : undefined}
                >
                  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
                    <path d="m3 3 10 10M13 3 3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              <div className="vxn-umega__pane" role="group" aria-label={current?.label}>
                {/* NOT A <ul> — see THE GRID IS NOT A <ul> in the stylesheet.
                    As one it crashed Elementor's SmartMenus on every UAE page
                    and cut the nav widget's init short. role="list" keeps what
                    the <ul> said. */}
                <div className="vxn-umega__grid" role="list">
                  {(current?.links ?? []).map((link) => (
                    <div key={link.href + link.name} role="listitem">
                      <a href={rurl(region, link.href)} className="vxn-umega__link" {...tab}>
                        {link.name}
                        <Chev />
                      </a>
                    </div>
                  ))}
                </div>

                {current ? (
                  <a className="vxn-umega__viewall" href={rurl(region, current.viewAll.href)} {...tab}>
                    {current.viewAll.label}
                    <Chev />
                  </a>
                ) : null}
              </div>
            </div>
          </div>

          <span className="vxn-umega__rule" aria-hidden="true" />
        </div>
      </div>
    </li>
  );
}
