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
 * hydration and stays consistent with the About panel. React owns three pieces
 * of state hover cannot express: which tab is selected, the close button the
 * reference puts in the tab row, and, since 20260917, the sheet's movement.
 * The close logic (the ✕, Escape, and the re-arm) is shared with AboutMega
 * through useMegaDismiss (mega-dismiss.ts).
 *
 * THE MOVEMENT is Framer Motion's and is shared with AboutMega too:
 * components/motion/MegaSheet.tsx has the sheet, the variants its parts arrive
 * on and how the two live alongside the stylesheet. The stylesheet opens the
 * sheet until this bundle has run and whenever reduced motion is asked for;
 * after that the inline styles Framer writes take precedence.
 *
 * `dismissed` clears when the pointer enters the trigger or focus arrives on
 * it, and nowhere else. It also cleared on the item's pointer leave until
 * 20260915, which is what made the ✕ reopen the sheet it had just closed; the
 * hook's note has the trace. See the note on the trigger below.
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

import { useRef, useState } from 'react';
import { motion } from 'framer-motion';

import { rurl } from '@/lib/region';
import CtaArrow from '@/components/ui/CtaArrow';
import { LogoXGlyph } from '@/components/brand/LogoX';
import {
  MEGA_BEAT,
  MEGA_LEAD,
  MEGA_LINK,
  MegaSheet,
  megaPiece,
  useMegaSheet,
  type MegaKind,
} from '@/components/motion/MegaSheet';
import { useMegaDismiss } from './mega-dismiss';
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
  /* The ✕, Escape from anywhere inside, and the re-arm: see mega-dismiss.ts. */
  const { itemRef, dismissed, close, rearm } = useMegaDismiss();
  /* The sheet's open and close, and the run its contents arrive on: the blue
     column, then the tab row, then the pane, the tabs and links one by one. */
  const { state, itemProps } = useMegaSheet(dismissed);
  const part = (kind: MegaKind, delay: number) => megaPiece(state, kind, delay);
  const tabsAt = MEGA_LEAD + MEGA_BEAT;
  const paneAt = MEGA_LEAD + MEGA_BEAT * 2;
  /* The tab a touch went down on, and whether its pane was already showing at
     that moment. See the note on the tab row. */
  const tap = useRef<{ index: number; shown: boolean } | null>(null);

  const tab = tabIndex === -1 ? { tabIndex: -1 } : {};
  const current: MegaGroup | undefined = groups[active] ?? groups[0];

  return (
    <li
      ref={itemRef}
      className={`menu-item menu-item-type-post_type menu-item-object-page menu-item-has-children vxn-umega${
        dismissed ? ' is-dismissed' : ''
      }`}
      {...itemProps}
    >
      {/* ---- WHY THE RE-ARM IS ON THE TRIGGER --------------------------------
          The panel is a DOM child of this <li>, so while the pointer is over
          the sheet the <li> is still hovered. Press ✕ and the sheet stops
          taking pointer events, and the way back in is to point at this link
          again: entering it re-arms, whatever path the pointer took. (Once
          that path could land straight on this link through a single mouseout
          whose relatedTarget was the anchor, which a leave handler on the
          <li> never saw.) Focusing it re-arms too, for the keyboard; the hook
          moves focus here quietly after Escape so that does not reopen what
          Escape closed. */}
      <a
        href={rurl(region, preset.href)}
        className="elementor-item"
        onMouseEnter={rearm}
        onFocus={rearm}
        {...tab}
      >
        {preset.label}
      </a>

      <MegaSheet state={state}>
        <div className="vxn-umega__inner">
          <div className="vxn-umega__body">
            {/* The blue column. A heading, a sentence and one link out — the
                reference gives it no navigation of its own. The first thing in
                after the box, from the sheet's own edge.

                PLAIN, THE OTHER ASIDE (20260917, client: "I don't like this
                blue image style"). The reference's photograph-under-a-blue-
                wash treatment was a stock picture on both Services and
                Insights — it never actually previewed the service or article
                the pointer was on, so it read as borrowed art rather than the
                brand's own. `preset.aside.plain`, set for every preset
                (mega-presets.ts), swaps it for a flat brand gradient and the
                wordmark's own "x" — the same mark WhoWeAreTrio and ProofBand
                carry elsewhere. See .vxn-umega__aside--plain in
                valunxt-uae-mega.css. */}
            <motion.aside
              className={`vxn-umega__aside${preset.aside.plain ? ' vxn-umega__aside--plain' : ''}`}
              {...part('aside', MEGA_LEAD)}
            >
              {preset.aside.plain ? <LogoXGlyph className="vxn-umega__asidex" /> : null}
              <span className="vxn-umega__asidetitle">{preset.aside.title}</span>
              <p className="vxn-umega__asidelede">{preset.aside.lede}</p>
              <a className="vxn-umega__asidelink" href={rurl(region, preset.aside.linkHref)} {...tab}>
                {preset.aside.linkLabel}
                <CtaArrow />
              </a>
            </motion.aside>

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
              <motion.div className="vxn-umega__tabs" {...part('part', tabsAt)}>
                {groups.map((g, i) => (
                  <motion.a
                    key={g.key}
                    {...part('item', tabsAt + i * MEGA_LINK)}
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
                  </motion.a>
                ))}

                <motion.button
                  {...part('item', tabsAt + groups.length * MEGA_LINK)}
                  type="button"
                  className="vxn-umega__close"
                  aria-label={preset.closeLabel}
                  onClick={close}
                  tabIndex={tabIndex === -1 ? -1 : undefined}
                >
                  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
                    <path d="m3 3 10 10M13 3 3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </motion.button>
              </motion.div>

              {/* The grid is KEYED ON THE SELECTED TAB, so picking another group
                  replays its run and the new pages arrive rather than cutting.
                  The pane box itself is not keyed, so the sheet's height does not
                  jump between groups. */}
              <div className="vxn-umega__pane" role="group" aria-label={current?.label}>
                {/* NOT A <ul> — see THE GRID IS NOT A <ul> in the stylesheet.
                    As one it crashed Elementor's SmartMenus on every UAE page
                    and cut the nav widget's init short. role="list" keeps what
                    the <ul> said. */}
                <motion.div key={active} className="vxn-umega__grid" role="list" {...part('part', paneAt)}>
                  {(current?.links ?? []).map((link, i) => (
                    <motion.div
                      key={link.href + link.name}
                      role="listitem"
                      {...part('item', paneAt + i * MEGA_LINK)}
                    >
                      <a href={rurl(region, link.href)} className="vxn-umega__link" {...tab}>
                        {link.name}
                        <Chev />
                      </a>
                    </motion.div>
                  ))}
                </motion.div>

                {current ? (
                  <motion.a
                    {...part('item', paneAt + (current.links?.length ?? 0) * MEGA_LINK)}
                    className="vxn-umega__viewall"
                    href={rurl(region, current.viewAll.href)}
                    {...tab}
                  >
                    {current.viewAll.label}
                    <Chev />
                  </motion.a>
                ) : null}
              </div>
            </div>
          </div>

          <span className="vxn-umega__rule" aria-hidden="true" />
        </div>
      </MegaSheet>
    </li>
  );
}
