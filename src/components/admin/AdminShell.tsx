'use client';

/**
 * The admin panel chrome: sidebar + topbar around a page's content.
 *
 * Port of the shared `admin-shell` markup that admin/dashboard.php,
 * enquiries.php, pages.php, page-edit.php and sitemap.php each repeated,
 * together with includes/sidebar.php and includes/topbar.php.
 *
 * It is a client component because it owns the panel's interactions — the
 * profile menu, the mobile drawer and Ctrl/Cmd+K — which used to live in
 * /admin/assets/admin.js, loaded by a <script> tag in this component. React
 * never runs a <script> it renders on the client, so after signing in, or after
 * any form on a screen (both arrive as client-side navigations), the menu and
 * the drawer went dead until a full reload. State here survives both.
 */
import { useEffect, useRef, useState, type ReactNode } from 'react';

import Icon, { type IconName } from './Icon';
import { ADMIN_LOGO_WHITE, adminUrl, brandText, siteUrl, userInitials } from '@/lib/admin/config';

export type AdminNavKey = 'dashboard' | 'enquiries' | 'pages' | 'sitemap' | 'settings' | 'none';

/** What the shell shows of the signed-in user. */
export interface ShellUser {
  name: string;
  email: string;
  role: string;
}

type NavItem = [AdminNavKey, string, string, IconName];

const NAV: Array<{ label: string; items: NavItem[] }> = [
  {
    label: 'Main',
    items: [
      ['dashboard', 'Dashboard', adminUrl('dashboard'), 'dashboard'],
      ['enquiries', 'Enquiries', adminUrl('enquiries'), 'message'],
    ],
  },
  {
    label: 'Content & SEO',
    items: [
      ['pages', 'Pages & SEO', adminUrl('pages'), 'pages'],
      ['sitemap', 'Sitemap', adminUrl('sitemap'), 'globe'],
    ],
  },
  {
    label: 'System',
    items: [['settings', 'Settings', adminUrl('settings'), 'settings']],
  },
];

export default function AdminShell({
  active,
  user,
  query = '',
  children,
}: {
  active: AdminNavKey;
  user: ShellUser;
  /** The current search term, when the search screen is showing. */
  query?: string;
  children: ReactNode;
}) {
  const [navOpen, setNavOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const name = brandText(user.name);
  const role = user.role.charAt(0).toUpperCase() + user.role.slice(1);

  useEffect(() => {
    const onPointer = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        setNavOpen(false);
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.select();
      }
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  // The page behind the open drawer does not scroll.
  useEffect(() => {
    document.documentElement.classList.toggle('adm-nav-open', navOpen);
    return () => document.documentElement.classList.remove('adm-nav-open');
  }, [navOpen]);

  return (
    <div className="admin-shell">
      <aside className={'sidebar' + (navOpen ? ' open' : '')} id="sidebar" aria-label="Admin navigation">
        <div className="sidebar-head">
          <a href={adminUrl('dashboard')} className="sidebar-logo" aria-label="Valunxt admin — dashboard">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={ADMIN_LOGO_WHITE} alt="Valunxt" width={164} height={33} />
          </a>
          <span className="sidebar-tag">Admin</span>
          <button
            type="button"
            className="sidebar-close"
            aria-label="Close menu"
            onClick={() => setNavOpen(false)}
          >
            <Icon name="close" size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {NAV.map((group) => (
            <div className="nav-group" key={group.label}>
              <div className="nav-label">{group.label}</div>
              {group.items.map(([key, label, href, icon]) => (
                <a
                  key={key}
                  href={href}
                  className={'nav-item' + (key === active ? ' active' : '')}
                  aria-current={key === active ? 'page' : undefined}
                >
                  <Icon name={icon} size={19} />
                  <span>{label}</span>
                </a>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-foot">
          <div className="sidebar-card">
            <div className="t">Need help?</div>
            <p>Reach the Valunxt support desk for onboarding and account assistance.</p>
            <a className="sidebar-card__link" href={siteUrl('')} target="_blank" rel="noopener">
              View website
              <Icon name="arrowUpRight" size={15} />
            </a>
          </div>
        </div>
      </aside>
      <div
        className={'sidebar-backdrop' + (navOpen ? ' show' : '')}
        id="sidebarBackdrop"
        onClick={() => setNavOpen(false)}
        aria-hidden="true"
      />

      <div className="main">
        <header className="topbar">
          <button
            type="button"
            className="menu-toggle"
            id="menuToggle"
            aria-label="Open menu"
            aria-controls="sidebar"
            aria-expanded={navOpen}
            onClick={() => setNavOpen((v) => !v)}
          >
            <Icon name="menu" size={20} />
          </button>

          <form className="search" role="search" method="get" action={adminUrl('search')}>
            <span className="s-icon">
              <Icon name="search" size={18} stroke={2.2} />
            </span>
            <input
              ref={searchRef}
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Search enquiries and pages…"
              aria-label="Search enquiries and pages"
              autoComplete="off"
            />
            <span className="kbd" aria-hidden="true">
              Ctrl K
            </span>
          </form>

          <div className="topbar-right">
            <div className={'profile' + (menuOpen ? ' open' : '')} ref={profileRef}>
              <button
                type="button"
                className="profile-btn"
                id="profileBtn"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((v) => !v)}
              >
                <span className="avatar">{userInitials(name)}</span>
                <span className="profile-meta">
                  <span className="pn">{name}</span>
                  <span className="pr">{role}</span>
                </span>
                <Icon name="chevronDown" size={16} stroke={2.2} className="chev" />
              </button>

              <div className="profile-menu" role="menu">
                <div className="pm-head">
                  <span className="avatar sm">{userInitials(name)}</span>
                  <span>
                    <span className="n">{name}</span>
                    <span className="e">{user.email}</span>
                  </span>
                </div>
                <a href={adminUrl('settings') + '#profile'} role="menuitem">
                  <Icon name="user" />
                  My Profile
                </a>
                <a href={adminUrl('settings')} role="menuitem">
                  <Icon name="settings" />
                  Account Settings
                </a>
                <a href={siteUrl('')} target="_blank" rel="noopener" role="menuitem">
                  <Icon name="external" />
                  View Website
                </a>
                <a href={adminUrl('logout')} className="danger" role="menuitem">
                  <Icon name="logout" />
                  Sign out
                </a>
              </div>
            </div>
          </div>
        </header>

        <main className="content">{children}</main>
      </div>
    </div>
  );
}
