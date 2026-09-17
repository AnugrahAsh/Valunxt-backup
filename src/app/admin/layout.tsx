/**
 * The admin panel's own document shell.
 *
 * A separate root layout from the public site: the panel has its own
 * stylesheet and is never indexed. Nothing from the site's Elementor cascade is
 * loaded here. It does share the site's identity — the wordmark, the tab icon,
 * the brand blue and Inter, which admin.css declares from /inter.
 */
import type { ReactNode } from 'react';
import type { Metadata, Viewport } from 'next';
import { ADMIN_CSS, ADMIN_ICONS, ADMIN_THEME_COLOR } from '@/lib/admin/config';

export const metadata: Metadata = {
  robots: 'noindex, nofollow',
  title: 'Valunxt Admin',
  icons: ADMIN_ICONS,
};

export const viewport: Viewport = {
  themeColor: ADMIN_THEME_COLOR,
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {/* precedence lets React hoist it into <head> and hold the first paint for it. */}
      <link rel="stylesheet" href={ADMIN_CSS} precedence="default" />
      {children}
    </>
  );
}
