/**
 * Lightweight form endpoint for the converted site.
 *
 * Replaces Elementor Pro's admin-ajax form action. Accepts the same POST
 * payload the Elementor form widget sends, does the same server-side
 * validation, records the submission, and returns Elementor-compatible JSON so
 * the widget shows its success/error message exactly as before.
 *
 * Every submission becomes a lead in `vx_leads` — the Leads CRM of the
 * www.valunxt.com database — including newsletter signups, which that panel
 * recorded as leads too ("Newsletter Subscriber"). A copy also goes to a local
 * log, so nothing is lost if the database is down.
 */
import { NextResponse, type NextRequest } from 'next/server';
import fs from 'node:fs/promises';
import path from 'node:path';

import { exec } from '@/lib/db';
import { countryForIp, recordLead } from '@/lib/leads';

const LOG_DIR = path.join(process.cwd(), 'data');

/** Which lead form a submission came from, by Elementor form id. */
const SOURCE_MAP: Record<string, string> = {
  '7655e08': 'Contact',
  e67e0ee: 'Free Consultation',
  '5099fe1': 'Enquiry',
  partnership: 'Partnership',
  /* The real estate practice's consultation form. Named rather than numbered
     because that section is not Elementor markup and has no widget id — see
     src/real-estate/components/sections/ContactForm.tsx. */
  'real-estate': 'Real Estate',
  /* The Accounting & Tax parent page's lead form. Named for the same reason —
     it is written markup, not captured Elementor. Its "Service Required"
     answer rides in the message field, so the desk can see which of the eight
     services the enquiry names. */
  'accounting-tax': 'Accounting & Tax',
};

/** What Elementor posts alongside the fields themselves. */
const ELEMENTOR_META = new Set(['action', 'form_id', 'form_name', 'post_id', 'queried_id', 'referer_title', 'referrer', '_wpnonce']);

/** Field names a person never fills in: a value in one means a bot filled the form. */
const HONEYPOTS = ['website', 'url', 'hp', 'honeypot', 'fax'];

function fail(message: string, status: number) {
  return NextResponse.json({ success: false, data: { message } }, { status });
}

/** Best effort, never blocks the response — as in the PHP original. */
async function append(file: string, line: string) {
  try {
    await fs.mkdir(LOG_DIR, { recursive: true });
    await fs.appendFile(path.join(LOG_DIR, file), line, 'utf8');
  } catch {
    /* logging must never break a submission */
  }
}

const THANKS = NextResponse.json.bind(NextResponse, {
  success: true,
  data: {
    message: 'Thank you for contacting Valunxt. Our advisory team will review your enquiry and respond shortly.',
    data: [],
    meta: [],
  },
});

export async function POST(req: NextRequest) {
  const form = await req.formData();

  // Elementor sends fields as form_fields[<id>]; flat POST is accepted too.
  const clean: Record<string, string> = {};
  const flat: Record<string, string> = {};
  for (const [rawKey, rawValue] of form.entries()) {
    const value = typeof rawValue === 'string' ? rawValue : rawValue.name;
    const m = /^form_fields\[(.*)\]$/.exec(rawKey);
    const key = (m ? m[1] : rawKey).replace(/[^a-zA-Z0-9_\- ]/g, '');
    const text = value.replace(/<[^>]*>/g, '').trim();
    if (m) clean[key] = text;
    // The widget's own bookkeeping is not something a visitor typed.
    else if (ELEMENTOR_META.has(key)) continue;
    flat[key] = text;
  }
  const fields = Object.keys(clean).length ? clean : flat;

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? req.headers.get('x-real-ip') ?? '';
  const ua = req.headers.get('user-agent') ?? '';
  const pagePath = (() => {
    try {
      return new URL(req.headers.get('referer') ?? '').pathname;
    } catch {
      return '';
    }
  })();

  // A filled honeypot: record it the way the imported panel did, answer as if it worked.
  const trap = HONEYPOTS.filter((h) => (fields[h] ?? '').trim() !== '');
  if (trap.length) {
    try {
      await exec(
        "INSERT INTO vx_security_events (ts, ip, type, detail, ua, path) VALUES (UTC_TIMESTAMP(), ?, 'form_honeypot', ?, ?, ?)",
        [ip.slice(0, 45) || null, JSON.stringify(Object.keys(fields)).slice(0, 500), ua.slice(0, 255) || null, '/form-handler/']
      );
    } catch {
      /* best effort */
    }
    return THANKS();
  }

  // Basic validation: require at least one non-empty value; validate any
  // email-looking field.
  let hasValue = false;
  for (const [k, v] of Object.entries(fields)) {
    if (v !== '') hasValue = true;
    if (k.toLowerCase().includes('email') && v !== '' && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)) {
      return fail('Please enter a valid email address.', 400);
    }
  }
  if (!hasValue) return fail('Please fill in the form.', 400);

  // Record the submission to a local log (best effort; never blocks).
  await append(
    'form-submissions.log',
    JSON.stringify({
      time: new Date().toISOString(),
      ip,
      form: String(form.get('form_id') ?? form.get('form_name') ?? ''),
      fields,
    }) + '\n'
  );

  // Lead forms post fields named <prefix>_full_name|email|phone|company. Match
  // by suffix so one code path handles every form (Contact, Free Consultation,
  // homepage/Our Group enquiry).
  const pick = (...suffixes: string[]) => {
    for (const suffix of suffixes) {
      for (const [k, v] of Object.entries(fields)) {
        if (v !== '' && k.toLowerCase().endsWith(suffix)) return v;
      }
    }
    return '';
  };
  const fullName = pick('full_name', 'name');
  const phone = pick('phone', 'mobile', 'tel');
  const company = pick('company', 'organisation', 'organization');
  const email = pick('_email', 'email');
  const message = pick('message', 'comments', 'enquiry', 'details');
  const service = pick('service', 'service_required', 'interest');
  const formId = String(form.get('form_id') ?? '');
  const source = SOURCE_MAP[formId] ?? (formId !== '' ? formId : 'Website');

  const isLeadForm = fullName !== '' || phone !== '' || company !== '';
  const isNewsletter = !isLeadForm && email !== '';

  if (isLeadForm || isNewsletter) {
    try {
      await recordLead({
        name: isNewsletter ? 'Newsletter Subscriber' : fullName,
        email,
        phone,
        company,
        service: isNewsletter ? 'Newsletter' : service || 'General enquiry',
        message: isNewsletter ? 'Subscribe to Valunxt Insights' : message,
        page: pagePath,
        ip,
        country: req.headers.get('cf-ipcountry') || (await countryForIp(ip)),
        ua,
        source: isNewsletter ? 'Newsletter' : source,
      });
    } catch (e) {
      // Non-fatal: the submission is already captured in the file log above.
      await append('form-errors.log', `${new Date().toISOString()} ${String(e)}\n`);
    }
  }

  return THANKS();
}

export function GET() {
  return fail('Method not allowed.', 405);
}
