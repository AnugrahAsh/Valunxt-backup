/**
 * Valunxt — canonical site facts.
 *
 * Single source of truth for the details that used to be retyped page by page
 * and drifted apart: the markets statement, the office list, the group company
 * names and URLs, and the enquiry addresses. Anything user-facing that states
 * one of these facts should read it from here rather than hard-coding it, so a
 * change lands everywhere at once.
 *
 * Port of includes/site-data.php.
 */

/* ---- Markets ------------------------------------------------------------- */

export type MarketForm = 'short' | 'long' | 'cities';

/**
 * The canonical markets statement, in the three grammatical shapes the copy
 * needs. Nothing else should invent a fourth phrasing.
 *
 *   'short'  — "India and the UAE"
 *   'long'   — "India, the UAE, and international markets"
 *   'cities' — "Dubai, Abu Dhabi, Mumbai, and Noida" (UAE offices lead, Dubai first)
 */
const MARKETS: Record<MarketForm, string> = {
  short: 'India and the UAE',
  long: 'India, the UAE, and international markets',
  cities: 'Dubai, Abu Dhabi, Mumbai, and Noida',
};

export function vxnMarkets(form: MarketForm = 'short'): string {
  return MARKETS[form] ?? MARKETS.short;
}

/* ---- Offices ------------------------------------------------------------- */

export interface Office {
  city: string;
  note: string;
  entity: string;
  address: string;
  country: string;
  phone: string;
  tel: string;
  email: string;
  hours: string;
  map: string;
}

export type OfficeKey = 'dubai' | 'abudhabi' | 'mumbai' | 'noida';

/**
 * Every Valunxt office, in canonical order: Dubai first — it is the UAE base
 * and the office that answers the published telephone line — then the other
 * Emirates office in Abu Dhabi, then the India practices. Anything that lists
 * offices (Location page, footer) iterates this record, so this order is the
 * order the site shows everywhere.
 *
 * `phone` is the number answered at that office. Two lines are published: the
 * UAE line for Dubai and Abu Dhabi, and the India line for Mumbai and Noida.
 * Templates must never pair an office with another country's number — that
 * mismatch is what made the old Contact page misleading.
 * `tel` is the E.164 form used in tel: links.
 */
const OFFICES: Record<OfficeKey, Office> = {
  dubai: {
    city: 'Dubai',
    note: 'UAE',
    entity: 'Valunxt Corporate Services LLC',
    address: 'Office 806, Capital Golden Tower, Business Bay, Dubai, United Arab Emirates',
    country: 'United Arab Emirates',
    phone: '+971 4 255 4683',
    tel: '+97142554683',
    email: 'contact@valunxt.com',
    hours: 'Mon – Sat, 9:00 AM – 6:00 PM GST',
    map: 'https://maps.google.com/?q=Capital+Golden+Tower,+Business+Bay,+Dubai,+United+Arab+Emirates',
  },
  abudhabi: {
    city: 'Abu Dhabi',
    note: 'UAE',
    entity: 'Valunxt Corporate Services LLC',
    address: 'Dar Al Salam 02, Liwa Street, Corniche, Abu Dhabi, United Arab Emirates',
    country: 'United Arab Emirates',
    phone: '+971 4 255 4683',
    tel: '+97142554683',
    email: 'contact@valunxt.com',
    hours: 'Mon – Sat, 9:00 AM – 6:00 PM GST',
    map: 'https://maps.google.com/?q=Dar+Al+Salam+02,+Liwa+Street,+Corniche,+Abu+Dhabi',
  },
  mumbai: {
    city: 'Mumbai',
    note: 'BKC',
    entity: 'Valunxt Capital Advisory Services Private Limited',
    address:
      '11th Floor, Platina Tower, Plot C 59, Bandra Kurla Complex Rd, G Block, Bandra Kurla Complex, Bandra East, Mumbai, Maharashtra 400051, India',
    country: 'India',
    phone: '+91 120 718 5322',
    tel: '+911207185322',
    email: 'contact@valunxt.com',
    hours: 'Mon – Sat, 9:00 AM – 6:00 PM IST',
    map: 'https://maps.google.com/?q=Platina+Tower,+Bandra+Kurla+Complex+Rd,+G+Block,+Bandra+East,+Mumbai,+Maharashtra+400051',
  },
  noida: {
    city: 'Noida',
    note: 'Max Towers',
    entity: 'Valunxt Group Business Services LLP',
    address:
      '16th and 17th Floor, Max Towers, Plot C-001A, Sector 16B, DND Flyway, Noida, Uttar Pradesh 201301, India',
    country: 'India',
    phone: '+91 120 718 5322',
    tel: '+911207185322',
    email: 'contact@valunxt.com',
    hours: 'Mon – Sat, 9:00 AM – 6:00 PM IST',
    map: 'https://maps.google.com/?q=Max+Towers,+Sector+16B,+Noida',
  },
};

export function vxnOffices(): Record<OfficeKey, Office> {
  return OFFICES;
}

/** A single office by key, or null. */
export function vxnOffice(key: string): Office | null {
  return OFFICES[key as OfficeKey] ?? null;
}

/* ---- Enquiry addresses --------------------------------------------------- */

/**
 * contact@valunxt.com is the only mailbox the group actually
 * publishes, and it is where the form endpoint delivers. The Contact page used
 * to dress it up as three separate routes — "main", "careers" and "general" —
 * that all resolved here, which is worse than saying so plainly. So the site
 * now states one address once.
 */
export function vxnEmail(): string {
  return 'contact@valunxt.com';
}

/* ---- Misc ---------------------------------------------------------------- */

/** Current year, for the footer copyright line. */
export function vxnYear(): number {
  return new Date().getFullYear();
}

/**
 * Reading time from a body of HTML, at 200 words per minute — the same figure
 * the blog layout uses, so report and article labels agree.
 */
export function vxnReadTime(html: string, extraWords = 0): string {
  const words = String(html)
    .replace(/<[^>]*>/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length;
  return `${Math.max(1, Math.round((words + extraWords) / 200))} min read`;
}
