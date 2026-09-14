/**
 * The site footer, both markets.
 *
 * A flat, single-panel footer on the brand blue — logo and practice links on
 * one row, a rule, then the positioning line beside the social row, and the
 * legal links and copyright below. Built for the UAE home (`"footer": "uae"`
 * in page-configs.json); since 20260911, on client instruction, PageShell
 * renders it on every page of both markets, in place of the captured
 * Elementor footers 2094 and 3425.
 *
 * WHAT CHANGES BY MARKET. Every link goes through rurl(), so it stays in the
 * visitor's edition, and the positioning line names that market's practices:
 * the UAE's six (the client's line) or India's four. The India line is drafted
 * here from the registry's names and is the one piece of copy in this file
 * the client has not supplied. No em dashes in either.
 *
 * THE SERVICES ROW (20260912, on client instruction) lists the UAE's six main
 * services under the positioning line, read from the services registry so
 * the footer can never disagree with the header menu or the home page. UAE
 * only: India was not part of that instruction.
 *
 * The wrapper elements and ids are the ones the captured footers used, so the
 * theme's layout rules and the back-to-top offset behave the same.
 *
 * The social accounts are still unpublished — footer 2094 records why the icons
 * were captured without hrefs — so they render here as unlinked marks rather
 * than pointing visitors at profiles that may not be the company's.
 *
 * Styles: assets/css/valunxt-landing.css (.vxn-foot).
 */
import { BASE, rurl, vxnRegion, vxnServiceName, vxnServices } from '@/lib/region';
import Html from '@/components/Html';
import { vxnEmail, vxnYear } from '@/lib/site-data';
import SocialIcons, { type SocialItem } from './SocialIcons';

/** The positioning line, per market. */
const BLURB: Record<string, string> = {
  'en-ae':
    'We are a senior team of accountants, tax advisers and valuers bringing accounting and tax, transactions, mortgages, valuation, research and technology together under one accountable partner, so every number you act on holds up to scrutiny.',
  'en-in':
    'We are a senior team of advisers bringing real estate investment advisory, capital advisory, research and intelligence, and technology and AI together under one accountable partner, so every number you act on holds up to scrutiny.',
};

const SOCIAL: readonly SocialItem[] = [
  { network: 'linkedin-in', repeater: 'elementor-repeater-item-01247a2' },
  { network: 'x-twitter', repeater: 'elementor-repeater-item-dd89806' },
  { network: 'youtube', repeater: 'elementor-repeater-item-5c328d0' },
  { network: 'instagram', repeater: 'elementor-repeater-item-inst0001' },
];

/** The practice row along the top, mirroring the header's Services set. */
const PRACTICES: readonly (readonly [string, string])[] = [
  ['/services/', 'Services'],
  ['/about/', 'About us'],
  ['/industries/', 'Industries'],
  ['/network/', 'Network'],
  ['/blogs/', 'Insights'],
];

const LEGAL: readonly (readonly [string, string])[] = [
  ['/terms-conditions/', 'Terms & conditions'],
  ['/privacy-policy/', 'Privacy policy'],
  ['/disclaimer/', 'Disclaimer'],
  ['/contact/', 'Contact us'],
];

export default function FooterUae({ region }: { region: string }) {
  const market = vxnRegion(region);
  const blurb = BLURB[market] ?? BLURB['en-ae'];
  /* Both markets list their own services (India added 20260914). */
  const services = vxnServices(market);
  return (
    <div data-wpr-lazyrender="1" className="footer-wrapper">
      <footer id="main-footer" className="main-footer">
        <footer className="vxn-foot" aria-label="Site footer">
          <div className="vxn-foot__inner">
            <div className="vxn-foot__top">
              <a className="vxn-foot__logo" href={rurl(region, '/')} aria-label="Valunxt — home">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`${BASE}/assets/content/uploads/logo/valunxt-white.svg`}
                  width={190}
                  height={38}
                  alt="Valunxt"
                />
              </a>
              <nav className="vxn-foot__nav" aria-label="Practices">
                {PRACTICES.map(([href, label]) => (
                  <a key={href} href={rurl(region, href)}>
                    {label}
                  </a>
                ))}
              </nav>
            </div>

            <hr className="vxn-foot__rule" />

            <div className="vxn-foot__mid">
              <p className="vxn-foot__blurb">{blurb}</p>
              <div className="vxn-foot__social">
                <SocialIcons items={SOCIAL} />
              </div>
            </div>

            {services.length ? (
              <nav className="vxn-foot__services" aria-labelledby="vxn-foot-services-title">
                <span id="vxn-foot-services-title" className="vxn-foot__servicesTitle">
                  Our Services
                </span>
                <ul className="vxn-foot__servicesList">
                  {services.map((sv) => (
                    <li key={sv.href}>
                      {/* Html, not text: the India titles are authored with entities (&amp;). */}
                      <Html as="a" href={rurl(region, sv.href)} html={vxnServiceName(sv)} />
                    </li>
                  ))}
                </ul>
              </nav>
            ) : null}

            <div className="vxn-foot__legal">
              {LEGAL.map(([href, label]) => (
                <a key={href} href={rurl(region, href)}>
                  {label}
                </a>
              ))}
              <a href={`mailto:${vxnEmail()}`}>{vxnEmail()}</a>
            </div>

            <p className="vxn-foot__copy">
              &copy; {vxnYear()} Valunxt. All rights reserved.
            </p>
          </div>
        </footer>
      </footer>
    </div>
  );
}
