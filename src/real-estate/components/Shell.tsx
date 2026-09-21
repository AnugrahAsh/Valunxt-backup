/**
 * The module's frame: header, footer, and the `.re-root` wrapper.
 *
 * `.re-root` is load-bearing. Every rule in real-estate.css is scoped under it,
 * so this element is the boundary between the module's styles and the host
 * app's — put page content inside it and nothing escapes in either direction.
 *
 * `dir` and `lang` are set here rather than on <html> so the module can be
 * mounted inside an app whose shell is a different language.
 */
import type { ReactNode } from 'react';
import type { Locale } from '../lib/types';
import { dir, lang, url } from '../lib/routes';
import { BRAND, FOOTER_COLUMNS, t } from '../data/site';
import { ArrowUpRight } from './icons';
import Header from './Header';
import MotionRoot from './motion/MotionRoot';
import Wordmark from './Wordmark';

function Footer({ locale }: { locale: Locale }) {
  return (
    <footer className="re-foot">
      <div className="re-wrap">
        <div className="re-foot__top">
          <div className="re-foot__brand">
            <Wordmark />
            <p className="re-foot__practice">{t(locale, BRAND.practice)}</p>
            <p className="re-foot__lede">
              Real estate advisory from {BRAND.full} — one accountable partner across acquisition,
              disposal, letting and valuation.
            </p>
            <a className="re-btn re-btn--ghost" href={url(locale, '/#enquire')}>
              {t(locale, 'Speak to an Advisor')}
              <ArrowUpRight />
            </a>
          </div>

          {FOOTER_COLUMNS.map((col) => (
            <div className="re-foot__col" key={col.title}>
              <h4>{t(locale, col.title)}</h4>
              <ul>
                {col.links.map((link) => (
                  <li key={link.href + link.label}>
                    <a href={url(locale, link.href)}>{t(locale, link.label)}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="re-foot__contact">
          <span>
            <small>Call</small>
            <a href={BRAND.phoneHref}>{BRAND.phone}</a>
          </span>
          <span>
            <small>Email</small>
            <a href={`mailto:${BRAND.email}`}>{BRAND.email}</a>
          </span>
          <span>
            <small>Office</small>
            {BRAND.address}
          </span>
        </div>

        <div className="re-foot__bottom">
          <span>
            © {new Date().getFullYear()} {BRAND.full}. All rights reserved.
          </span>
          <span className="re-foot__note">
            Property advisory only. Nothing on this page is an offer, a valuation, or investment
            advice.
          </span>
        </div>
      </div>
    </footer>
  );
}

export default function Shell({
  locale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  return (
    <div className="re-root" dir={dir(locale)} lang={lang(locale)}>
      {/* Mounted once; animates every section on every route by selector, so
          sections do not have to opt in. See motion/MotionRoot.tsx. */}
      <MotionRoot />
      <Header locale={locale} />
      <main>{children}</main>
      <Footer locale={locale} />
    </div>
  );
}
