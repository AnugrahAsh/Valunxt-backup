/**
 * Leads: every enquiry the website's forms capture, in `vx_leads`.
 *
 * `vx_leads` and `vx_lead_notes` are the Leads CRM of the www.valunxt.com panel,
 * imported on 2026-09-16. The site's forms (src/app/form-handler) write here,
 * and the admin panel's Leads screen works the pipeline: status, notes, score.
 * The project's own `enquiries` table was folded into this one and retired.
 */
import 'server-only';

import { exec, likePattern, rowLimit, sql } from '@/lib/db';

/** The pipeline a lead moves through. 'new' is where every form submission starts. */
export const LEAD_STATUSES = ['new', 'contacted', 'qualified', 'won', 'lost', 'spam'] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const LEAD_STATUS_LABEL: Record<LeadStatus, string> = {
  new: 'New',
  contacted: 'Contacted',
  qualified: 'Qualified',
  won: 'Won',
  lost: 'Lost',
  spam: 'Spam',
};

/** The pill colour class each stage shows in. */
export const LEAD_STATUS_PILL: Record<string, string> = {
  new: 'new',
  contacted: 'wait',
  qualified: 'wait',
  won: 'ok',
  lost: 'off',
  spam: 'warnp',
};

export interface Lead {
  id: number;
  name: string;
  email: string;
  phone: string;
  company: string;
  service: string;
  message: string;
  page: string;
  ip: string;
  country: string;
  ua: string;
  status: string;
  score: number;
  source: string;
  created_at: string;
  updated_at: string;
}

export interface LeadNote {
  id: number;
  lead_id: number;
  note: string;
  created_at: string;
}

function str(v: unknown): string {
  return v === null || v === undefined ? '' : String(v);
}

function toLead(r: Record<string, unknown>): Lead {
  return {
    id: Number(r.id),
    name: str(r.name),
    email: str(r.email),
    phone: str(r.phone),
    company: str(r.company),
    service: str(r.service),
    message: str(r.message),
    page: str(r.page),
    ip: str(r.ip),
    country: str(r.country),
    ua: str(r.ua),
    status: str(r.status) || 'new',
    score: Number(r.score ?? 0),
    source: str(r.source),
    created_at: str(r.created_at),
    updated_at: str(r.updated_at),
  };
}

export function isLeadStatus(v: unknown): v is LeadStatus {
  return (LEAD_STATUSES as readonly string[]).includes(String(v));
}

/**
 * A lead's score, 0–100: how much there is to act on. Reproduces the spread of
 * the imported panel's scores (a newsletter signup 50, a named enquiry with a
 * phone number and a real message in the 80s) from the fields a lead carries.
 */
export function leadScore(l: Pick<Lead, 'name' | 'phone' | 'company' | 'message' | 'service'>): number {
  let s = 50;
  if (l.name.trim()) s += 5;
  if (l.phone.trim()) s += 10;
  if (l.company.trim() && !/^none$/i.test(l.company.trim())) s += 10;
  if (l.service.trim() && !/general|newsletter/i.test(l.service)) s += 5;
  if (l.message.trim().length >= 30) s += 15;
  return Math.min(100, s);
}

/* ---- Capture ------------------------------------------------------------- */

export interface LeadInput {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  service?: string;
  message?: string;
  page?: string;
  ip?: string;
  country?: string;
  ua?: string;
  source?: string;
}

/** Record a form submission. Returns the new lead's id. */
export async function recordLead(input: LeadInput): Promise<number> {
  const lead = {
    name: input.name.trim().slice(0, 190),
    email: input.email.trim().slice(0, 190),
    phone: (input.phone ?? '').trim().slice(0, 60),
    company: (input.company ?? '').trim().slice(0, 190),
    service: (input.service ?? '').trim().slice(0, 190),
    message: (input.message ?? '').trim(),
  };
  const res = await exec(
    `INSERT INTO vx_leads (name, email, phone, company, service, message, page, ip, country, ua, status, score, source)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new', ?, ?)`,
    [
      lead.name,
      lead.email,
      lead.phone || null,
      lead.company || null,
      lead.service || null,
      lead.message || null,
      (input.page ?? '').slice(0, 255) || null,
      (input.ip ?? '').slice(0, 45) || null,
      (input.country ?? '').slice(0, 80) || null,
      (input.ua ?? '').slice(0, 255) || null,
      leadScore(lead),
      (input.source ?? '').slice(0, 80) || null,
    ]
  );
  return res.insertId;
}

/** A country for an address, from the imported geo cache when it has one. */
export async function countryForIp(ip: string): Promise<string> {
  if (!ip) return '';
  try {
    const rows = await sql<{ country: string }>('SELECT country FROM vx_geo_cache WHERE ip = ? LIMIT 1', [ip]);
    return str(rows[0]?.country);
  } catch {
    return '';
  }
}

/* ---- The CRM ------------------------------------------------------------- */

export interface LeadFilter {
  q?: string;
  status?: string;
  service?: string;
}

export async function listLeads(filter: LeadFilter = {}): Promise<Lead[]> {
  const where: string[] = [];
  const args: unknown[] = [];
  const q = String(filter.q ?? '').trim();
  if (q) {
    const like = likePattern(q);
    where.push('(name LIKE ? OR email LIKE ? OR phone LIKE ? OR company LIKE ? OR service LIKE ? OR message LIKE ?)');
    args.push(like, like, like, like, like, like);
  }
  if (isLeadStatus(filter.status)) {
    where.push('status = ?');
    args.push(filter.status);
  }
  if (String(filter.service ?? '').trim()) {
    where.push('service = ?');
    args.push(String(filter.service).trim());
  }
  const rows = await sql(
    `SELECT * FROM vx_leads ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY created_at DESC, id DESC`,
    args
  );
  return rows.map((r) => toLead(r as Record<string, unknown>));
}

export async function leadById(id: number): Promise<Lead | null> {
  const rows = await sql('SELECT * FROM vx_leads WHERE id = ? LIMIT 1', [Number(id)]);
  return rows[0] ? toLead(rows[0] as Record<string, unknown>) : null;
}

export async function leadNotes(leadId: number): Promise<LeadNote[]> {
  const rows = await sql<LeadNote>('SELECT id, lead_id, note, created_at FROM vx_lead_notes WHERE lead_id = ? ORDER BY created_at DESC, id DESC', [
    Number(leadId),
  ]);
  return rows.map((r) => ({ id: Number(r.id), lead_id: Number(r.lead_id), note: str(r.note), created_at: str(r.created_at) }));
}

export async function addLeadNote(leadId: number, note: string): Promise<void> {
  await exec('INSERT INTO vx_lead_notes (lead_id, note, created_at) VALUES (?, ?, UTC_TIMESTAMP())', [
    Number(leadId),
    note.trim(),
  ]);
}

/** Move a lead through the pipeline, noting the change the way the imported panel did. */
export async function setLeadStatus(leadId: number, status: LeadStatus): Promise<boolean> {
  const res = await exec('UPDATE vx_leads SET status = ? WHERE id = ?', [status, Number(leadId)]);
  if (res.affectedRows) await addLeadNote(leadId, `Status changed to ${status.toUpperCase()}`);
  return res.affectedRows > 0;
}

/**
 * Delete a lead and its notes. `vx_lead_notes` has no foreign key in the
 * imported schema, so the notes are removed here rather than by a cascade.
 */
export async function deleteLead(leadId: number): Promise<boolean> {
  await exec('DELETE FROM vx_lead_notes WHERE lead_id = ?', [Number(leadId)]);
  const res = await exec('DELETE FROM vx_leads WHERE id = ?', [Number(leadId)]);
  return res.affectedRows > 0;
}

export interface LeadStats {
  total: number;
  open: number;
  last30: number;
  prev30: number;
  byStatus: Record<string, number>;
}

export async function leadStats(): Promise<LeadStats> {
  const [row] = await sql<{ total: number; open: string | null; last30: string | null; prev30: string | null }>(
    `SELECT COUNT(*) AS total,
            SUM(status IN ('new', 'contacted', 'qualified')) AS open,
            SUM(created_at >= UTC_TIMESTAMP() - INTERVAL 30 DAY) AS last30,
            SUM(created_at >= UTC_TIMESTAMP() - INTERVAL 60 DAY AND created_at < UTC_TIMESTAMP() - INTERVAL 30 DAY) AS prev30
       FROM vx_leads`
  );
  const byStatus: Record<string, number> = {};
  for (const r of await sql<{ status: string; n: number }>('SELECT status, COUNT(*) AS n FROM vx_leads GROUP BY status')) {
    byStatus[str(r.status) || 'new'] = Number(r.n);
  }
  return {
    total: Number(row?.total ?? 0),
    open: Number(row?.open ?? 0),
    last30: Number(row?.last30 ?? 0),
    prev30: Number(row?.prev30 ?? 0),
    byStatus,
  };
}

/** The services leads have asked about, for the filter. */
export async function leadServices(): Promise<string[]> {
  const rows = await sql<{ service: string }>(
    "SELECT DISTINCT service FROM vx_leads WHERE service IS NOT NULL AND service <> '' ORDER BY service"
  );
  return rows.map((r) => str(r.service));
}

/** The newest leads, for the dashboard. */
export async function latestLeads(limit = 5): Promise<Lead[]> {
  const rows = await sql(`SELECT * FROM vx_leads ORDER BY created_at DESC, id DESC LIMIT ${rowLimit(limit, 5)}`);
  return rows.map((r) => toLead(r as Record<string, unknown>));
}
