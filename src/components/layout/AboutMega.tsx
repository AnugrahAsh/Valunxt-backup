'use client';

/**
 * The About mega panel (20260915). Client request: add a mega menu to the
 * About dropdown, taking reference from two supplied mega menus, in the site's
 * mega menu UI. Until then About was a three-link dropdown.
 *
 * From the references, in Valunxt's colours and one face:
 *   Reliant Surveyors' "About Us" sheet  headed columns of links, each on its
 *                                        own hairline with a chevron, and a
 *                                        card whose artwork carries a figure
 *   Savills' "Why Savills" sheet         a sentence under each entry, so a
 *                                        link says what is behind it
 *
 * EVERY DESCRIPTION IS THE SAME LENGTH (client instruction 20260917: "content
 * count should be same for all"), so the four rows read as one deliberate
 * grid rather than whichever line each page's own copy happened to run to.
 * Contact Us was dropped from Work With Us the same instruction (it already
 * sits in the top bar as its own item).
 *
 *   ┌──────────────────────┬──────────────────────┬───────────────────────┐
 *   │ Our Firm             │ Work With Us         │ Our Legacy        (x) │
 *   │ Who We Are         › │ Careers            › │ ┌───────────────────┐ │
 *   │ one line             │ one line             │ │ artwork     [48+] │ │
 *   │──────────────────────│──────────────────────│ └───────────────────┘ │
 *   │ Clients            › │ FAQ                › │ Expertise Measured... │
 *   │ one line             │ one line             │ the sentence          │
 *   │                      │                      │ About Valunxt  →      │
 *   └──────────────────────────── accent rule ─────────────────────────────┘
 *
 * THE SHEET IS THE SERVICES SHEET. The <li> carries `vxn-umega`, so the panel
 * opens, fades, bridges the gap under the bar, takes the page's container and
 * closes exactly as Services and Insights do (valunxt-uae-mega.css, sections 1
 * and 5), and the ✕ is theirs. Only the body is new: section 7, `.vxn-amega`.
 * The ✕, Escape and the re-arm are the shared useMegaDismiss.
 *
 * The lists are <div role="list">, never <ul>: see THE GRID IS NOT A <ul> in
 * the stylesheet. The burger drawer does not render this component; MainNav
 * gives the drawer the same links as a nested list.
 *
 * THE MOVEMENT is the Services sheet's as well (20260917):
 * components/motion/MegaSheet.tsx opens the box and runs its contents in after
 * it (the three columns one after another, the rows inside each one after
 * another), and the figure on the artwork counts up as the sheet opens. The
 * stylesheet still opens the sheet before this bundle has run and whenever
 * reduced motion is asked for.
 */

import { motion } from 'framer-motion';

import { rurl } from '@/lib/region';
import CtaArrow from '@/components/ui/CtaArrow';
import {
  MEGA_BEAT,
  MEGA_LEAD,
  MEGA_LINK,
  MegaSheet,
  SheetCount,
  megaPiece,
  useMegaSheet,
  type MegaKind,
} from '@/components/motion/MegaSheet';
import { useMegaDismiss } from './mega-dismiss';
import type { AboutPreset } from './mega-presets';

function Chev() {
  return (
    <svg className="vxn-umega__chev" viewBox="0 0 12 12" fill="none" aria-hidden="true" focusable="false">
      <path d="m4 2 4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function AboutMega({
  region,
  preset,
  itemClass,
}: {
  region: string;
  preset: AboutPreset;
  /** The WordPress menu-item-<id> class the About item has always carried. */
  itemClass?: string;
}) {
  const { itemRef, dismissed, close, rearm } = useMegaDismiss();
  const { state, itemProps } = useMegaSheet(dismissed);
  const part = (kind: MegaKind, delay: number) => megaPiece(state, kind, delay);
  const { feature } = preset;

  return (
    <li
      ref={itemRef}
      className={`menu-item menu-item-type-post_type menu-item-object-page menu-item-has-children vxn-umega vxn-umega--about${
        itemClass ? ` ${itemClass}` : ''
      }${dismissed ? ' is-dismissed' : ''}`}
      {...itemProps}
    >
      {/* Re-armed by pointing at it or focusing it: see mega-dismiss.ts and the
          note on the trigger in UaeServicesMega.tsx. */}
      <a href={rurl(region, preset.href)} className="elementor-item" onMouseEnter={rearm} onFocus={rearm}>
        {preset.label}
      </a>

      <MegaSheet state={state}>
        <div className="vxn-umega__inner">
          <div className="vxn-amega">
            {preset.columns.map((col, ci) => (
              <motion.div key={col.key} className="vxn-amega__col" {...part('part', MEGA_LEAD + ci * MEGA_BEAT)}>
                <div className="vxn-amega__head">
                  <span className="vxn-amega__title">{col.title}</span>
                </div>
                <div className="vxn-amega__list" role="list" aria-label={col.title}>
                  {col.links.map((link, li) => (
                    <motion.div
                      key={link.href}
                      role="listitem"
                      {...part('item', MEGA_LEAD + ci * MEGA_BEAT + li * MEGA_LINK)}
                    >
                      <a className="vxn-amega__row" href={rurl(region, link.href)}>
                        <span className="vxn-amega__name">{link.name}</span>
                        <span className="vxn-amega__text">{link.text}</span>
                        <Chev />
                      </a>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}

            <motion.div
              className="vxn-amega__col vxn-amega__col--feature"
              {...part('part', MEGA_LEAD + preset.columns.length * MEGA_BEAT)}
            >
              {/* The ✕ sits on this heading's row, the sheet's top right
                  corner, where Services puts it at the end of its tab row. */}
              <div className="vxn-amega__head">
                <span className="vxn-amega__title">{feature.heading}</span>
                <button type="button" className="vxn-umega__close" aria-label={preset.closeLabel} onClick={close}>
                  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
                    <path d="m3 3 10 10M13 3 3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              {/* One link for the whole card. The figure on the artwork is
                  decoration: the sentence under it says the same, in words. */}
              <a className="vxn-amega__card" href={rurl(region, feature.link.href)}>
                <span className="vxn-amega__art" aria-hidden="true">
                  <span className="vxn-amega__stamp">
                    {/* Counts up from zero as the sheet opens. */}
                    <SheetCount className="vxn-amega__num" value={feature.stat.value} state={state} />
                    <span className="vxn-amega__label">{feature.stat.label}</span>
                  </span>
                </span>
                <span className="vxn-amega__cardtitle">{feature.title}</span>
                <span className="vxn-amega__cardtext">{feature.text}</span>
                <span className="vxn-amega__more">
                  {/* Its own span, so the underline when lit runs under the
                      words and not on under the arrow. */}
                  <span className="vxn-amega__morelabel">{feature.link.label}</span>
                  <CtaArrow />
                </span>
              </a>
            </motion.div>
          </div>

          <span className="vxn-umega__rule" aria-hidden="true" />
        </div>
      </MegaSheet>
    </li>
  );
}
