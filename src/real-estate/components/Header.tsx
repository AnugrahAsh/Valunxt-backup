'use client';

/**
 * The header.
 *
 * Rebuilt from the flat six-link bar, which wrapped at laptop widths and had no
 * working mobile state. Three things changed:
 *
 *   1. The services collapse into one grouped menu, so the bar carries five
 *      items instead of six and never wraps.
 *   2. There is a real mobile drawer rather than a burger that did nothing.
 *
 * There is no region or language switcher: this practice operates in the UAE
 * only, so offering the visitor a choice of market would be offering something
 * that does not exist.
 *
 * A client component because the menu, the switcher and the drawer all need
 * state, and because the bar changes appearance once the page scrolls: over the
 * hero video it is transparent with light type, and past it, solid with dark
 * type. That transition is the reason the old header's white text was
 * unreadable — it was light over a light page.
 */
import { useEffect, useRef, useState } from 'react';
import type { Locale } from '../lib/types';
import { url } from '../lib/routes';
import { BRAND, NAV, t } from '../data/site';
import { ArrowUpRight, Chevron } from './icons';
import Wordmark from './Wordmark';

export default function Header({ locale }: { locale: Locale }) {
  const [solid, setSolid] = useState(false);
  /* True only while the hero's expanded video sits behind the bar. */
  const [onVideo, setOnVideo] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [drawer, setDrawer] = useState(false);
  const bar = useRef<HTMLElement>(null);

  /* Solid past the first viewport; the hero owns the screen until then. */
  useEffect(() => {
    let frame = 0;
    const read = () => {
      frame = 0;
      setSolid(window.scrollY > 12);
      setOnVideo(document.documentElement.dataset.reOnVideo === 'true');
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(read);
    };
    read();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  /* One outside-click listener closes whichever popover is open. */
  useEffect(() => {
    if (!openMenu) return;
    const close = (e: MouseEvent) => {
      if (bar.current && !bar.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    const esc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenMenu(null);
      }
    };
    document.addEventListener('click', close);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('click', close);
      document.removeEventListener('keydown', esc);
    };
  }, [openMenu]);

  /* A drawer that scrolls the page behind it is a bug, not a feature. */
  useEffect(() => {
    document.body.style.overflow = drawer ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [drawer]);

  return (
    <header
      ref={bar}
      className={`re-head${solid ? ' is-solid' : ''}${onVideo ? ' re-head--onVideo' : ''}`}
    >
      <div className="re-wrap re-head__inner">
        <a className="re-head__brand" href={url(locale, '/')} aria-label={`${BRAND.full} Real Estate`}>
          <Wordmark />
          <span className="re-head__practice">{t(locale, BRAND.practice)}</span>
        </a>

        <nav className="re-nav" aria-label="Primary">
          {NAV.map((item) =>
            item.children ? (
              <div className="re-nav__group" key={item.label}>
                <button
                  type="button"
                  className="re-nav__trigger"
                  aria-expanded={openMenu === item.label}
                  aria-haspopup="true"
                  onClick={() => {
                    setOpenMenu(openMenu === item.label ? null : item.label);
                  }}
                >
                  {t(locale, item.label)}
                  <Chevron className="re-nav__chev" />
                </button>
                <div className="re-nav__panel" data-open={openMenu === item.label}>
                  {item.children.map((c) => (
                    <a key={c.href} href={url(locale, c.href)} onClick={() => setOpenMenu(null)}>
                      <strong>{t(locale, c.label)}</strong>
                      <span>{c.note}</span>
                    </a>
                  ))}
                </div>
              </div>
            ) : (
              <a className="re-nav__link" key={item.label} href={url(locale, item.href ?? '/')}>
                {t(locale, item.label)}
              </a>
            ),
          )}
        </nav>

        <div className="re-head__side">
          <a className="re-head__tel" href={BRAND.phoneHref}>
            {BRAND.phone}
          </a>

          <a className="re-btn re-btn--sm" href={url(locale, '/#enquire')}>
            {t(locale, 'Enquire Now')}
            <ArrowUpRight />
          </a>

          <button
            type="button"
            className="re-burger"
            aria-label="Menu"
            aria-expanded={drawer}
            onClick={() => setDrawer(true)}
          >
            <span />
          </button>
        </div>
      </div>

      {/* ---- Mobile drawer ---- */}
      <div className="re-drawer" data-open={drawer}>
        <div className="re-drawer__sheet">
          <div className="re-drawer__top">
            <Wordmark />
            <button type="button" className="re-drawer__close" aria-label="Close menu" onClick={() => setDrawer(false)}>
              ×
            </button>
          </div>

          <nav aria-label="Mobile">
            {NAV.map((item) =>
              item.children ? (
                <div key={item.label} className="re-drawer__group">
                  <p className="re-drawer__heading">{t(locale, item.label)}</p>
                  {item.children.map((c) => (
                    <a key={c.href} href={url(locale, c.href)} onClick={() => setDrawer(false)}>
                      {t(locale, c.label)}
                    </a>
                  ))}
                </div>
              ) : (
                <a key={item.label} href={url(locale, item.href ?? '/')} onClick={() => setDrawer(false)}>
                  {t(locale, item.label)}
                </a>
              ),
            )}
          </nav>

          <div className="re-drawer__foot">
            <a className="re-btn" href={url(locale, '/#enquire')} onClick={() => setDrawer(false)}>
              {t(locale, 'Enquire Now')}
              <ArrowUpRight />
            </a>
            <a className="re-drawer__tel" href={BRAND.phoneHref}>
              {BRAND.phone}
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
