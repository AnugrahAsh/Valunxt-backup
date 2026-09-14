/**
 * Captured Elementor header template 3837 — the solid white bar used by every
 * interior page.
 *
 * Renders twice: the sticky bar itself and the spacer that reserves its height.
 *
 * Port of includes/partials/header-3837.php.
 */
import { BASE, rurl } from '@/lib/region';
import MainNav, { MenuToggle } from './MainNav';
import RegionSwitcher from './RegionSwitcher';

/* `full_width` is deliberately empty, and this is the ONE place the captured
   markup is not reproduced verbatim.

   The capture carried `"full_width":"stretch"`, which makes Elementor's nav
   widget try to stretch its dropdown against a container this conversion does
   not render. It threw on every page load —
   `TypeError: Cannot read properties of null (reading 'stretch')` — and, having
   thrown, never applied the stretch anyway. Emptying the flag removes the error
   and changes nothing visible: the menus are positioned by our own CSS. */
const NAV_SETTINGS =
  '{"submenu_icon":{"value":"&lt;i aria-hidden=\\"true\\" class=\\"\\"&gt;&lt;\\/i&gt;","library":""},"full_width":"","layout":"horizontal","toggle":"burger"}';

function Bar({
  region,
  spacer,
  copy,
  mainId,
  dropdownId,
}: {
  region: string;
  spacer: boolean;
  copy: number;
  mainId: string;
  dropdownId: string;
}) {
  return (
    <div
      className={`elementor-element elementor-element-70f59be1 vamtam-sticky-header${
        spacer ? ' vamtam-sticky-header--spacer' : ''
      } vamtam-sticky-header--mobile e-flex e-con-boxed e-con e-parent`}
      data-id="70f59be1"
      data-element_type="container"
      data-e-type="container"
    >
      <div className="e-con-inner">
        <div
          className="elementor-element elementor-element-2d2e9ea elementor-widget elementor-widget-theme-site-logo elementor-widget-image"
          data-id="2d2e9ea"
          data-element_type="widget"
          data-e-type="widget"
          data-widget_type="theme-site-logo.default"
        >
          <div className="elementor-widget-container">
            <a href={rurl(region, '/')}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                width={175}
                height={35}
                src={`${BASE}/assets/content/uploads/logo/valunxt-dark.svg`}
                className="attachment-full size-full vxn-logo"
                alt="Valunxt"
              />{' '}
            </a>
          </div>
        </div>
        <div
          className="vamtam-has-theme-widget-styles elementor-element elementor-element-30764865 elementor-nav-menu__align-center elementor-nav-menu--dropdown-mobile elementor-nav-menu--stretch elementor-nav-menu__text-align-aside elementor-nav-menu--toggle elementor-nav-menu--burger elementor-widget elementor-widget-nav-menu"
          data-id="30764865"
          data-element_type="widget"
          data-e-type="widget"
          data-settings={NAV_SETTINGS}
          data-widget_type="nav-menu.default"
        >
          <div className="elementor-widget-container">
            <nav
              aria-label="Menu"
              className="elementor-nav-menu--main elementor-nav-menu__container elementor-nav-menu--layout-horizontal e--pointer-underline e--animation-grow"
            >
              <MainNav region={region} id={mainId} />
            </nav>
            <MenuToggle />
            <nav className="elementor-nav-menu--dropdown elementor-nav-menu__container" aria-hidden="true">
              <MainNav region={region} id={dropdownId} hidden />
            </nav>
          </div>
        </div>
        <RegionSwitcher region={region} copy={copy} />
        <div
          className="vamtam-has-theme-widget-styles elementor-element elementor-element-60192122 vamtam-icon-pos-row-reverse elementor-hidden-mobile elementor-widget elementor-widget-button"
          data-id="60192122"
          data-element_type="widget"
          data-e-type="widget"
          data-widget_type="button.default"
        >
          <div className="elementor-widget-container">
            <div className="elementor-button-wrapper">
              <a
                className="elementor-button elementor-button-link elementor-size-sm"
                href={rurl(region, '/free-consultation/')}
              >
                <span className="elementor-button-content-wrapper">
                  <span className="elementor-button-icon">
                    <i aria-hidden="true" className="vamtamtheme- vamtam-theme-arrow-right vxn-cta__arrow" />{' '}
                  </span>
                  <span className="elementor-button-text">Free Consultation</span>
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Header3837({ region }: { region: string }) {
  return (
    <header
      data-elementor-type="header"
      data-elementor-id="3837"
      className="elementor elementor-3837 elementor-location-header"
      data-elementor-post-type="elementor_library"
    >
      <Bar
        region={region}
        spacer={false}
        copy={1}
        mainId="menu-1-30764865"
        dropdownId="menu-2-30764865"
      />
      <Bar
        region={region}
        spacer
        copy={2}
        mainId="menu-3-30764865"
        dropdownId="menu-4-30764865"
      />
    </header>
  );
}
