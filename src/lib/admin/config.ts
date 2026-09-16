/**
 * Admin panel configuration.
 *
 * Port of the non-database half of admin/config.php: the default administrator
 * seeded on first run, and the URL helpers the screens use.
 *
 * Nothing here is server-only, so client components (the shell, the flash
 * banner) can import it too.
 */

/** Seeded once, on the first connection to an empty `users` table. */
export const DEFAULT_ADMIN_NAME = process.env.ADMIN_DEFAULT_NAME ?? 'Valunxt Admin';
export const DEFAULT_ADMIN_EMAIL = process.env.ADMIN_DEFAULT_EMAIL ?? 'admin@valunxtcapital.com';
export const DEFAULT_ADMIN_PASS = process.env.ADMIN_DEFAULT_PASS ?? 'Admin@123';

/**
 * Whether the sign-in screen prefills and prints the default credentials.
 *
 * Development only: on a deployed panel the login page is public, and printing
 * a working password on it would hand the panel to anyone who opens it.
 */
export const SHOW_DEFAULT_CREDENTIALS = process.env.NODE_ENV !== 'production';

/** The panel is mounted at /admin; the public site at the root. */
export const ADMIN_BASE = '/admin';
export const SITE_BASE = '';

/**
 * Build a URL inside the admin panel.
 *
 * With a trailing slash: next.config.ts sets `trailingSlash: true`, so a link
 * without one costs every click a 308 hop.
 */
export function adminUrl(path = ''): string {
  const p = path.replace(/^\/+|\/+$/g, '');
  return ADMIN_BASE + '/' + (p ? p + '/' : '');
}

/** Build a URL on the public site. */
export function siteUrl(path = ''): string {
  return SITE_BASE + '/' + path.replace(/^\/+/, '');
}

/** The user's initials for the avatar (e.g. "VA"). */
export function userInitials(name: string): string {
  let ini = '';
  for (const part of String(name).trim().split(/\s+/)) {
    if (part !== '') ini += part[0].toUpperCase();
    if (ini.length >= 2) break;
  }
  return ini !== '' ? ini : 'A';
}

/**
 * The brand name as the site now sets it. VALUNXT in capitals is gone from the
 * public site on client instruction (see components/ui/BrandName.tsx), but the
 * administrator seeded by the PHP build is still called "VALUNXT Admin" in the
 * database, so names are passed through this before the panel prints them.
 */
export function brandText(text: string): string {
  return String(text).replace(/\bVALUNXT\b/g, 'Valunxt');
}

/** The logos and icons the panel uses: the site's current identity. */
export const ADMIN_LOGO_WHITE = SITE_BASE + '/assets/content/uploads/logo/valunxt-white.svg';
export const ADMIN_LOGO_DARK = SITE_BASE + '/assets/content/uploads/logo/valunxt-dark.svg';
export const ADMIN_MARK = SITE_BASE + '/assets/content/uploads/logo/favicon.svg';
export const ADMIN_ICONS = {
  icon: [
    { url: ADMIN_MARK, type: 'image/svg+xml' },
    { url: SITE_BASE + '/assets/content/uploads/logo/favicon-32.png', sizes: '32x32', type: 'image/png' },
    { url: SITE_BASE + '/assets/content/uploads/logo/favicon-192.png', sizes: '192x192', type: 'image/png' },
  ],
  apple: SITE_BASE + '/assets/content/uploads/logo/apple-touch-icon.png',
};

/** The brand blue, for the browser chrome. */
export const ADMIN_THEME_COLOR = '#0B2DBE';

/**
 * The panel's own stylesheet, served from /public. Bump the query whenever the
 * file changes: public files keep their URL, so browsers may hold the old one.
 */
export const ADMIN_CSS = '/admin/assets/admin.css?v=20260916a';

/**
 * The flash-message cookie. Scoped to the panel and readable by script: the
 * banner that shows a message deletes the cookie once it is on screen, which a
 * page render is not allowed to do (see lib/admin/session.ts).
 */
export const ADMIN_FLASH_COOKIE = 'vxn_admin_flash';
export const ADMIN_FLASH_PATH = ADMIN_BASE;
