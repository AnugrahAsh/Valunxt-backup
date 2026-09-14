/**
 * A mega menu as the burger drawer shows it (20260914).
 *
 * The desktop bar renders Services and Insights as UaeServicesMega: a blue
 * column, a tab row and a pane of links, all hanging off a fixed sheet. The
 * drawer copy of the menu used to render that same panel inline, and on a
 * phone it came out as a 54px-wide column with every word broken letter by
 * letter (the client's report). A tabbed sheet is a desktop shape; a drawer is
 * a list.
 *
 * So the drawer copy is a plain nested list, the markup the About item has
 * always had: an <a> with a `ul.sub-menu` beside it. That is exactly what
 * SmartMenus, which Elementor runs over the drawer, knows how to fold, so
 * Services, About and Insights open and close the same way, with the same
 * aria-expanded bookkeeping, from one mechanism. The UAE's services nest one
 * level deeper (service, then its pages). The words are the same preset the
 * desktop panel reads, so the two menus cannot drift apart.
 *
 * WHAT THE LIST CARRIES, per preset:
 *   one group (India's services, Insights)  the group's links, then its
 *                                           "View all" unless that page is
 *                                           already one of the links
 *   several groups (the UAE's services)     one row per service holding its
 *                                           pages and "View all <service>",
 *                                           then "View all services"
 * The last one exists because the drawer's parent rows fold rather than
 * navigate (see MOBILE_DRAWER in SiteScripts), so the section's own page needs
 * a link of its own.
 *
 * Styled by valunxt-mobile-menu.css. No client state: every link is tabindex
 * -1 at rest like the rest of the hidden drawer, and the drawer script hands
 * the sub-items a tab stop while it is open.
 */
import { rurl } from '@/lib/region';
import CtaArrow from '@/components/ui/CtaArrow';
import type { MegaLink, MegaPreset } from './mega-presets';

function Leaf({ region, link, all = false }: { region: string; link: MegaLink; all?: boolean }) {
  return (
    <li className={`menu-item${all ? ' vxn-mdrawer__all' : ''}`}>
      <a href={rurl(region, link.href)} className="elementor-sub-item" tabIndex={-1}>
        {link.name}
        {all ? <CtaArrow /> : null}
      </a>
    </li>
  );
}

export default function MegaDrawerItem({ region, preset }: { region: string; preset: MegaPreset }) {
  const nested = preset.groups.length > 1;
  const only = preset.groups[0];

  return (
    <li className="menu-item menu-item-type-post_type menu-item-object-page menu-item-has-children vxn-mdrawer">
      <a href={rurl(region, preset.href)} className="elementor-item" tabIndex={-1}>
        {preset.label}
      </a>
      <ul className="sub-menu elementor-nav-menu--dropdown">
        {nested ? (
          <>
            {preset.groups.map((g) => (
              <li key={g.key} className="menu-item menu-item-has-children vxn-mdrawer__group">
                <a href={rurl(region, g.href)} className="elementor-sub-item" tabIndex={-1}>
                  {g.label}
                </a>
                <ul className="sub-menu elementor-nav-menu--dropdown">
                  {g.links.map((link) => (
                    <Leaf key={link.href + link.name} region={region} link={link} />
                  ))}
                  <Leaf region={region} link={{ name: g.viewAll.label, href: g.viewAll.href }} all />
                </ul>
              </li>
            ))}
            <Leaf region={region} link={{ name: `View all ${preset.label.toLowerCase()}`, href: preset.href }} all />
          </>
        ) : only ? (
          <>
            {only.links.map((link) => (
              <Leaf key={link.href + link.name} region={region} link={link} />
            ))}
            {only.links.some((link) => link.href === only.viewAll.href) ? null : (
              <Leaf region={region} link={{ name: only.viewAll.label, href: only.viewAll.href }} all />
            )}
          </>
        ) : null}
      </ul>
    </li>
  );
}
