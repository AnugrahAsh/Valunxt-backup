/**
 * The Real Estate section.
 *
 * This layout exists to do one thing: load the module's stylesheets once for
 * every page beneath it, rather than importing them from each route file.
 * landing.css is the Dubai landing page's own; it is scoped to `.re-land` and
 * reaches nothing on the service pages. location.css is the area-guide and
 * building template's, scoped to `.re-loc`, which sits inside `.re-land` so it
 * inherits that sheet's primitives and only adds what those pages need.
 *
 * There is no chrome here. The module renders its own header and footer inside
 * `.re-root` (see src/real-estate/components/Shell.tsx), so these pages do not
 * go through PageShell the way the rest of the site does — two headers and two
 * footers is not a page. For the same reason the root layout skips the
 * Elementor stylesheet cascade on these URLs; see the note in src/app/layout.tsx.
 */
import type { ReactNode } from 'react';
import '@/real-estate/styles/real-estate.css';
import '@/real-estate/styles/landing.css';
import '@/real-estate/styles/location.css';

export default function RealEstateLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
