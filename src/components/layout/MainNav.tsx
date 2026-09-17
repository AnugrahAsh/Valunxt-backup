/**
 * The main navigation list, shared by all three captured header templates.
 *
 * Every header renders its menu two or four times over (a sticky bar and its
 * spacer, each with a desktop <nav> and a hidden burger-drawer <nav>). The PHP
 * partials repeated the same block of <li>s verbatim in each; here it is one
 * component parameterised by the two things that actually differed: the
 * per-copy `<ul id>` and whether the copy is the hidden one (tabindex="-1").
 *
 * The WordPress `menu-item-<id>` classes are kept because the theme CSS and the
 * captured per-post stylesheets target them.
 */
import { rurl } from '@/lib/region';
import AboutMega from './AboutMega';
import MegaDrawerItem from './MegaDrawerItem';
import UaeServicesMega from './UaeServicesMega';
import { aboutPreset, insightsPreset, servicesPreset, type AboutPreset, type MegaPreset } from './mega-presets';

export interface NavIds {
  /** menu-item-<n> on the About parent. */
  about: string;
  /** menu-item-<n> on Contact. */
  contact: string;
}

/* The ids of About's old sub-items ("Who We Are" 288 / 3202, "Careers"
   282 / 3204) went with the dropdown (20260915): nothing styles them, and the
   links they marked are now rows in the About panel. */

/** Header 139 and 3837 share the original WordPress menu ids. */
export const NAV_IDS_DEFAULT: NavIds = {
  about: '278',
  contact: '275',
};

/** Header 3134 was built from a second menu, so its ids differ. */
export const NAV_IDS_3134: NavIds = {
  about: '3201',
  contact: '3206',
};

export type NavOrder = 'insights-last' | 'contact-before-insights';

/**
 * About as the burger drawer shows it: the panel's links, column by column, as
 * the one nested list SmartMenus folds, the markup About has always had in the
 * drawer. The desktop bar renders AboutMega from the same preset, so the two
 * cannot list different pages.
 */
function AboutDrawerItem({ region, ids, preset }: { region: string; ids: NavIds; preset: AboutPreset }) {
  return (
    <li
      className={`menu-item menu-item-type-post_type menu-item-object-page menu-item-has-children menu-item-${ids.about}`}
    >
      <a href={rurl(region, preset.href)} className="elementor-item" tabIndex={-1}>
        {preset.label}
      </a>
      <ul className="sub-menu elementor-nav-menu--dropdown">
        {preset.columns
          .flatMap((col) => col.links)
          .map((link) => (
            <li key={link.href} className="menu-item menu-item-type-post_type menu-item-object-page">
              <a href={rurl(region, link.href)} className="elementor-sub-item" tabIndex={-1}>
                {link.name}
              </a>
            </li>
          ))}
      </ul>
    </li>
  );
}

export default function MainNav({
  region,
  id,
  hidden = false,
  ids = NAV_IDS_DEFAULT,
  order = 'insights-last',
  className = 'elementor-nav-menu',
}: {
  region: string;
  /** The <ul id>, e.g. "menu-1-1243e1d". */
  id: string;
  /** True for the hidden burger-drawer copy — every link gets tabindex="-1". */
  hidden?: boolean;
  ids?: NavIds;
  order?: NavOrder;
  className?: string;
}) {
  const tab = hidden ? { tabIndex: -1 } : {};

  const contact = (
    <li
      key="contact"
      className={`menu-item menu-item-type-post_type menu-item-object-page menu-item-${ids.contact}`}
    >
      <a href={rurl(region, '/contact/')} className="elementor-item" {...tab}>
        Contact
      </a>
    </li>
  );
  /* Services and Insights are the tabbed panel built to the client's UAE
     reference (20260914), About the columned panel in the same sheet
     (20260915) — see mega-presets.ts for the words each one carries. The
     hidden burger-drawer copy renders all three as nested lists instead, which
     is what a drawer can fold (MegaDrawerItem, AboutDrawerItem,
     valunxt-mobile-menu.css). */
  const mega = (key: string, preset: MegaPreset) =>
    hidden ? (
      <MegaDrawerItem key={key} region={region} preset={preset} />
    ) : (
      <UaeServicesMega key={key} region={region} preset={preset} />
    );
  const insights = mega('insights', insightsPreset());
  const about = aboutPreset(region);

  return (
    <ul id={id} className={className}>
      {/* No "Home" item: the wordmark to the left of this list is the link
          home on every header, and both markets already land on their own home
          page by default — /en-in/ and /en-ae/ — so the item only repeated an
          affordance the bar already had. The route is untouched. */}
      {mega('services', servicesPreset(region))}
      {hidden ? (
        <AboutDrawerItem region={region} ids={ids} preset={about} />
      ) : (
        <AboutMega region={region} preset={about} itemClass={`menu-item-${ids.about}`} />
      )}
      {/* "Our Group" and its pages were removed from the site (20260914); the
          Network page followed it on 20260917 — its content lived under
          About's "Our Firm" panel anyway, so nothing it said is gone, only
          this second listing of it. */}
      <li className="menu-item menu-item-type-post_type menu-item-object-page menu-item-industries">
        <a href={rurl(region, '/industries/')} className="elementor-item" {...tab}>
          Industries
        </a>
      </li>
      {order === 'contact-before-insights' ? [contact, insights] : [insights, contact]}
    </ul>
  );
}

/** The burger button rendered between the two <nav>s in every header. */
export function MenuToggle() {
  return (
    <div className="elementor-menu-toggle" role="button" tabIndex={0} aria-label="Menu Toggle" aria-expanded="false">
      <i
        aria-hidden="true"
        role="presentation"
        className="elementor-menu-toggle__icon--open vamtamtheme- vamtam-theme-menu"
      />
      <i
        aria-hidden="true"
        role="presentation"
        className="elementor-menu-toggle__icon--close vamtamtheme- vamtam-theme-close"
      />
    </div>
  );
}
