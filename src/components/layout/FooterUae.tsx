/**
 * The site footer, both markets.
 *
 * A flat, single-panel footer on the brand blue — logo and practice links on
 * one row, a rule, then the services row beside the social marks, and the
 * legal links and copyright below. The positioning line that stood between
 * the rule and the services was removed on 20260916, on client instruction,
 * from every page of both markets. Built for the UAE home (`"footer": "uae"`
 * in page-configs.json); since 20260911, on client instruction, PageShell
 * renders it on every page of both markets, in place of the captured
 * Elementor footers 2094 and 3425.
 *
 * WHAT CHANGES BY MARKET. Every link goes through rurl(), so it stays in the
 * visitor's edition, and the services row lists that market's practices. No
 * em dashes.
 *
 * THE SERVICES ROW (20260912, on client instruction) lists the UAE's six main
 * services under the rule, read from the services registry so
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
 * MOTION (20260917). The footer had no entrance, and the reason is worth
 * recording: the site's general engine does cover #main-footer, but almost
 * nothing in here is something it recognises. The practice row and the
 * services row are <nav>s, which it never enters; the wordmark is 190x38,
 * under the 80px floor it uses to tell a picture from an icon; the legal links
 * are plain anchors rather than buttons. Only the copyright line qualified.
 *
 * So the rows say so themselves, on Framer Motion: the panel is a Reveal and
 * each row a RevealItem, arriving in reading order, 120ms apart — logo and
 * practices, the rule, the services row with the social marks, the legal line,
 * the copyright. The footer is in the general engine's SKIP list
 * (components/motion/reveal-scan.ts) so the two cannot both claim it. One
 * footer, one behaviour, every page.
 *
 * Styles: assets/css/valunxt-landing.css (.vxn-foot).
 */
import { BASE, rurl, vxnRegion, vxnServiceName, vxnServices } from '@/lib/region';
import Html from '@/components/Html';
import { vxnEmail, vxnYear } from '@/lib/site-data';
import Reveal, { RevealItem } from '@/components/motion/Reveal';
import { STAGGER } from '@/components/motion/motion-tokens';
import SocialIcons, { type SocialItem } from './SocialIcons';

const SOCIAL: readonly SocialItem[] = [
  { network: 'linkedin-in', repeater: 'elementor-repeater-item-01247a2' },
  { network: 'x-twitter', repeater: 'elementor-repeater-item-dd89806' },
  { network: 'youtube', repeater: 'elementor-repeater-item-5c328d0' },
  { network: 'instagram', repeater: 'elementor-repeater-item-inst0001' },
];

/** The practice row along the top, mirroring the header's Services set. The
    Network page it once listed was removed from the site (20260917). */
const PRACTICES: readonly (readonly [string, string])[] = [
  ['/services/', 'Services'],
  ['/about/', 'About us'],
  ['/industries/', 'Industries'],
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
  /* Both markets list their own services (India added 20260914). */
  const services = vxnServices(market);
  return (
    <div data-wpr-lazyrender="1" className="footer-wrapper">
      <footer id="main-footer" className="main-footer">
        <footer className="vxn-foot" aria-label="Site footer">
          <Reveal className="vxn-foot__inner" variant="fade" stagger={STAGGER.row} amount={0.05}>
            <RevealItem className="vxn-foot__top" variant="rise-sm" order={0}>
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
            </RevealItem>

            <RevealItem as="hr" className="vxn-foot__rule" variant="fade" order={1} />

            <RevealItem className="vxn-foot__mid" variant="rise-sm" order={2}>
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
              <div className="vxn-foot__social">
                <SocialIcons items={SOCIAL} />
              </div>
            </RevealItem>

            <RevealItem className="vxn-foot__legal" variant="rise-sm" order={3}>
              {LEGAL.map(([href, label]) => (
                <a key={href} href={rurl(region, href)}>
                  {label}
                </a>
              ))}
              <a href={`mailto:${vxnEmail()}`}>{vxnEmail()}</a>
            </RevealItem>

            <RevealItem as="p" className="vxn-foot__copy" variant="rise-sm" order={4}>
              &copy; {vxnYear()} Valunxt. All rights reserved.
            </RevealItem>
          </Reveal>
        </footer>
      </footer>
    </div>
  );
}
