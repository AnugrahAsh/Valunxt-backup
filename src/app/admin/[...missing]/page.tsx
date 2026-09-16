/**
 * Any /admin/… address the panel does not have.
 *
 * Without this route such a URL fell through to the public site's [region]
 * route (with "admin" taken for a market), whose 404 needs the site stylesheets
 * the admin document does not load — so it rendered as a blank page. Throwing
 * notFound() here renders admin/not-found.tsx inside the panel's own layout.
 */
import { notFound } from 'next/navigation';

export default function AdminMissingPage() {
  notFound();
}
