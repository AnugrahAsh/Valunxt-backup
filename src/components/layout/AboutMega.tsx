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
 *   ┌──────────────────────┬──────────────────────┬───────────────────────┐
 *   │ Our Firm             │ Work With Us         │ Our Legacy        (x) │
 *   │ Who We Are         › │ Careers            › │ ┌───────────────────┐ │
 *   │ one line             │ one line             │ │ artwork     [48+] │ │
 *   │──────────────────────│──────────────────────│ └───────────────────┘ │
 *   │ Our Network        › │ FAQ                › │ Expertise Measured... │
 *   │ one line             │ one line             │ the sentence          │
 *   │──────────────────────│──────────────────────│ About Valunxt  →      │
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
 */

import { rurl } from '@/lib/region';
import CtaArrow from '@/components/ui/CtaArrow';
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
  const { feature } = preset;

  return (
    <li
      ref={itemRef}
      className={`menu-item menu-item-type-post_type menu-item-object-page menu-item-has-children vxn-umega vxn-umega--about${
        itemClass ? ` ${itemClass}` : ''
      }${dismissed ? ' is-dismissed' : ''}`}
    >
      {/* Re-armed by pointing at it or focusing it: see mega-dismiss.ts and the
          note on the trigger in UaeServicesMega.tsx. */}
      <a href={rurl(region, preset.href)} className="elementor-item" onMouseEnter={rearm} onFocus={rearm}>
        {preset.label}
      </a>

      <div className="vxn-umega__panel">
        <div className="vxn-umega__inner">
          <div className="vxn-amega">
            {preset.columns.map((col) => (
              <div key={col.key} className="vxn-amega__col">
                <div className="vxn-amega__head">
                  <span className="vxn-amega__title">{col.title}</span>
                </div>
                <div className="vxn-amega__list" role="list" aria-label={col.title}>
                  {col.links.map((link) => (
                    <div key={link.href} role="listitem">
                      <a className="vxn-amega__row" href={rurl(region, link.href)}>
                        <span className="vxn-amega__name">{link.name}</span>
                        <span className="vxn-amega__text">{link.text}</span>
                        <Chev />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="vxn-amega__col vxn-amega__col--feature">
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
                    <span className="vxn-amega__num">{feature.stat.value}</span>
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
            </div>
          </div>

          <span className="vxn-umega__rule" aria-hidden="true" />
        </div>
      </div>
    </li>
  );
}
