/**
 * Admin — Enquiries, now the Leads CRM.
 *
 * The project's `enquiries` table was folded into the imported `vx_leads`
 * (20260916), and its screen into /admin/leads/. This address forwards there,
 * search term included, so a bookmark still lands somewhere useful.
 */
import { redirect } from 'next/navigation';

import { adminUrl } from '@/lib/admin/config';

export default async function EnquiriesPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const q = String((await searchParams).q ?? '').trim();
  redirect(adminUrl('leads') + (q ? '?q=' + encodeURIComponent(q) : ''));
}
