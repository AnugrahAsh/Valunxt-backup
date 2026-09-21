/**
 * THE DUBAI LANDING PAGE'S CONTENT (20260921).
 *
 * Everything the page says and shows, in one file, so the page can be
 * re-worded and re-stocked without opening a component. Sections, in page
 * order: hero and search, the ticker, listings, why Dubai, areas, lifestyle,
 * the two calculators, the process, FAQs, the lead form's copy.
 *
 * WHAT IS INDICATIVE, AND SAID SO ON THE PAGE. The listings are curated
 * examples of the stock this desk handles, priced at current market bands —
 * not live inventory, and the page labels them "Featured, indicative". The
 * area price bands and yields are typical published market figures rounded
 * to a band, labelled indicative and dated. Replace LISTINGS with a feed and
 * AREAS' figures with the desk's own numbers when those are ready; nothing
 * else needs to change.
 */

export type ListingMode = 'buy' | 'rent' | 'offplan';
export type PropertyType = 'Apartment' | 'Villa' | 'Townhouse' | 'Penthouse';

export interface Listing {
  id: string;
  mode: ListingMode;
  title: string;
  area: string;
  /** Area key in AREAS, for the "view on map" link. */
  areaKey: string;
  type: PropertyType;
  beds: number;
  baths: number;
  sqft: number;
  /** AED. For rent, per year. */
  price: number;
  /** The cover photo; `gallery` holds the rest. All from /real-estate/listings/. */
  image: string;
  gallery?: string[];
  tags: string[];
  summary?: string;
  features?: string[];
  /** Off-plan only. */
  handover?: string;
  plan?: string;
  /** Indicative gross yield, %, where the desk quotes one. */
  yieldPct?: number;
}

const IMG = '/assets/content/uploads';
const RE = `${IMG}/services/sub/real-estate-transactions`;
const PH = (name: string) => `/real-estate/listings/${name}.webp`;

export const HERO = {
  eyebrow: 'Dubai Real Estate',
  titleA: 'Live Where the World',
  titleB: 'Is Moving To.',
  lede:
    "Dubai property, handled the Valunxt way: independent advice, the numbers in front of you, and one accountable team from the first search to the keys. Tax-free income, freehold ownership, and a city built for the way you want to live.",
  image: `${IMG}/services/real-estate-hero.webp`,
  imageAlt: 'Dubai Marina from above — the towers and the yachts',
  /** The lifestyle reel behind the headline: one scene at a time, cross-faded
      with a slow drift. The first is the LCP image; keep it the strongest. */
  slides: [
    { image: `${IMG}/services/real-estate-hero.webp`, caption: 'Dubai Marina, from above' },
    { image: `${RE}/buy-property-hero.webp`, caption: 'Villa living, at sunset' },
    { image: `${IMG}/services/re-explore-buy-property.webp`, caption: 'A private pool, all year' },
    { image: `${IMG}/services/real-estate-transactions-solution-2.webp`, caption: 'Home, on the fiftieth floor' },
  ],
  stats: [
    { value: '0%', label: 'Income tax' },
    { value: '6–9%', label: 'Gross yields, typical*' },
    { value: '10 yr', label: 'Golden Visa from AED 2M' },
  ],
};

export const SEARCH = {
  modes: [
    { key: 'buy', label: 'Buy' },
    { key: 'rent', label: 'Rent' },
    { key: 'offplan', label: 'Off-Plan' },
  ] as { key: ListingMode; label: string }[],
  types: ['Any type', 'Apartment', 'Villa', 'Townhouse', 'Penthouse'],
  beds: ['Any beds', 'Studio', '1', '2', '3', '4+'],
  budgets: {
    buy: [
      { label: 'Any budget', max: Infinity },
      { label: 'Up to AED 1M', max: 1_000_000 },
      { label: 'Up to AED 3M', max: 3_000_000 },
      { label: 'Up to AED 7M', max: 7_000_000 },
      { label: 'Up to AED 15M', max: 15_000_000 },
      { label: 'AED 15M+', max: Infinity, min: 15_000_000 },
    ],
    rent: [
      { label: 'Any budget', max: Infinity },
      { label: 'Up to AED 80K / yr', max: 80_000 },
      { label: 'Up to AED 150K / yr', max: 150_000 },
      { label: 'Up to AED 300K / yr', max: 300_000 },
      { label: 'AED 300K+ / yr', max: Infinity, min: 300_000 },
    ],
    offplan: [
      { label: 'Any budget', max: Infinity },
      { label: 'Up to AED 1M', max: 1_000_000 },
      { label: 'Up to AED 2M', max: 2_000_000 },
      { label: 'Up to AED 5M', max: 5_000_000 },
      { label: 'AED 5M+', max: Infinity, min: 5_000_000 },
    ],
  } as Record<ListingMode, { label: string; max: number; min?: number }[]>,
};

export const TICKER = [
  '0% personal income tax',
  '0% capital gains tax',
  '100% freehold ownership in designated areas',
  '10-year Golden Visa from AED 2M in property',
  '4% DLD transfer fee — one line, no surprises',
  'Escrow-protected off-plan payments (RERA)',
  '200+ nationalities call Dubai home',
  'Two-thirds of the world within 8 hours',
];

export const LISTINGS: Listing[] = [
  {
    id: 'marina-2br',
    mode: 'buy',
    title: 'Waterfront 2-Bed with Marina Views',
    area: 'Dubai Marina',
    areaKey: 'marina',
    type: 'Apartment',
    beds: 2,
    baths: 3,
    sqft: 1380,
    price: 2_450_000,
    image: PH('marina-towers-pool'),
    gallery: [PH('living-modern'), PH('bedroom-soft'), PH('kitchen-bright'), PH('marina-bay')],
    summary: 'A high-floor corner unit with the marina in every window, in a building with a pool deck, gym and concierge.',
    features: ['Marina view from every room', 'Two parking bays', 'Pool, gym and concierge', 'Walk to the tram and JBR beach'],
    tags: ['Ready', 'Sea view', 'Vacant'],
    yieldPct: 6.4,
  },
  {
    id: 'palm-villa',
    mode: 'buy',
    title: 'Signature 4-Bed Villa, Private Beach',
    area: 'Palm Jumeirah',
    areaKey: 'palm',
    type: 'Villa',
    beds: 4,
    baths: 5,
    sqft: 6200,
    price: 18_500_000,
    image: PH('villa-white-pool'),
    gallery: [PH('living-grey'), PH('bedroom-luxe'), PH('bathroom'), PH('dining-white')],
    summary: 'A frond villa with its own stretch of beach and a pool facing the sea, upgraded throughout.',
    features: ['Private beach and pool', 'Upgraded throughout', 'Sea-facing principal suite', 'Staff quarters'],
    tags: ['Ready', 'Beach access', 'Upgraded'],
  },
  {
    id: 'creek-1br',
    mode: 'offplan',
    title: '1-Bed on the Creek, Skyline Facing',
    area: 'Dubai Creek Harbour',
    areaKey: 'creek',
    type: 'Apartment',
    beds: 1,
    baths: 2,
    sqft: 780,
    price: 1_350_000,
    image: PH('offplan-rising'),
    gallery: [PH('waterfront-towers'), PH('living-modern'), PH('bedroom-white')],
    summary: 'A launch-price one-bedroom in a waterfront tower rising on the Creek, facing the Downtown skyline. Payments sit in escrow until the build is certified.',
    features: ['Creek and skyline views', 'Escrow registered', '60/40 payment plan', 'Resort pool deck'],
    tags: ['Off-plan', 'Escrow', 'Launch price'],
    handover: 'Q4 2027',
    plan: '60 / 40',
  },
  {
    id: 'downtown-3br',
    mode: 'buy',
    title: '3-Bed with a Burj Khalifa View',
    area: 'Downtown Dubai',
    areaKey: 'downtown',
    type: 'Apartment',
    beds: 3,
    baths: 4,
    sqft: 2050,
    price: 5_900_000,
    image: PH('downtown-skyline'),
    gallery: [PH('lounge-city-view'), PH('dining-white'), PH('bedroom-white'), PH('kitchen-dark')],
    summary: 'A high-floor three-bedroom looking straight at the Burj Khalifa and the Fountain, minutes on foot from Dubai Mall.',
    features: ['Uninterrupted Burj view', 'Study and maid’s room', 'Pool and gym', 'Walk to Dubai Mall'],
    tags: ['Ready', 'Burj view', 'High floor'],
    yieldPct: 5.6,
  },
  {
    id: 'jvc-studio',
    mode: 'buy',
    title: 'Investor Studio, Tenanted',
    area: 'Jumeirah Village Circle',
    areaKey: 'jvc',
    type: 'Apartment',
    beds: 0,
    baths: 1,
    sqft: 430,
    price: 620_000,
    image: PH('apartment-balconies'),
    gallery: [PH('living-minimal'), PH('bathroom')],
    summary: 'A tenanted studio producing rent from the day of transfer. Where most investors start.',
    features: ['Tenant in place', 'Balcony', 'Pool and gym', 'Low service charge'],
    tags: ['Ready', 'Tenanted', '8.2% yield'],
    yieldPct: 8.2,
  },
  {
    id: 'hills-villa',
    mode: 'buy',
    title: '5-Bed Golf-Course Villa',
    area: 'Dubai Hills Estate',
    areaKey: 'hills',
    type: 'Villa',
    beds: 5,
    baths: 6,
    sqft: 5400,
    price: 12_800_000,
    image: PH('villa-modern-pool'),
    gallery: [PH('living-bright'), PH('dining-open'), PH('bedroom-luxe'), PH('bathroom')],
    summary: 'A contemporary villa on the championship course, with a private pool and the park and schools a short walk away.',
    features: ['Golf-course frontage', 'Private pool and garden', 'Maid’s and driver’s rooms', 'Covered parking for three'],
    tags: ['Ready', 'Golf view', 'Landscaped'],
  },
  {
    id: 'bay-2br-op',
    mode: 'offplan',
    title: '2-Bed on the Canal, Branded Residence',
    area: 'Business Bay',
    areaKey: 'bay',
    type: 'Apartment',
    beds: 2,
    baths: 3,
    sqft: 1240,
    price: 2_100_000,
    image: PH('offplan-crane'),
    gallery: [PH('tower-modern'), PH('living-minimal'), PH('kitchen-dark')],
    summary: 'A two-bedroom in a branded canal-front tower under construction, minutes from Downtown.',
    features: ['Canal and skyline views', 'Branded residence services', '70/30 payment plan', 'Escrow registered'],
    tags: ['Off-plan', 'Escrow', 'Canal view'],
    handover: 'Q2 2027',
    plan: '70 / 30',
  },
  {
    id: 'jbr-3br',
    mode: 'buy',
    title: 'Beachfront 3-Bed, The Walk',
    area: 'Jumeirah Beach Residence',
    areaKey: 'jbr',
    type: 'Apartment',
    beds: 3,
    baths: 4,
    sqft: 1960,
    price: 4_200_000,
    image: PH('marina-canal'),
    gallery: [PH('living-classic'), PH('bedroom-soft'), PH('dining-open')],
    summary: 'The beach at the lobby and the sea from the balcony. Sold furnished, and a favourite for holiday lets.',
    features: ['Sea-view balcony', 'Sold furnished', 'Beach access', 'Holiday-let permit possible'],
    tags: ['Ready', 'Beach', 'Furnished'],
    yieldPct: 6.1,
  },
  {
    id: 'ranches-th',
    mode: 'buy',
    title: '4-Bed Townhouse, Park Backing',
    area: 'Arabian Ranches',
    areaKey: 'ranches',
    type: 'Townhouse',
    beds: 4,
    baths: 4,
    sqft: 3100,
    price: 4_600_000,
    image: PH('villa-palms'),
    gallery: [PH('sofa-living'), PH('living-fireplace'), PH('bedroom-soft')],
    summary: 'An end-of-row family townhouse backing onto the park, in an established community with its own schools.',
    features: ['Backs onto the park', 'Private garden', 'Maid’s room', 'Walk to schools'],
    tags: ['Ready', 'Family', 'Park view'],
  },
  {
    id: 'marina-1br-rent',
    mode: 'rent',
    title: '1-Bed, Marina Promenade',
    area: 'Dubai Marina',
    areaKey: 'marina',
    type: 'Apartment',
    beds: 1,
    baths: 2,
    sqft: 850,
    price: 110_000,
    image: PH('marina-bay'),
    gallery: [PH('living-classic'), PH('bedroom-soft'), PH('kitchen-bright')],
    summary: 'A furnished one-bedroom on the promenade, with the marina walk, the tram and the beach on the doorstep.',
    features: ['Fully furnished', 'Chiller included', 'Pool and gym', 'One parking bay'],
    tags: ['Chiller free', 'Furnished', 'Available now'],
  },
  {
    id: 'downtown-2br-rent',
    mode: 'rent',
    title: '2-Bed, Fountain Views',
    area: 'Downtown Dubai',
    areaKey: 'downtown',
    type: 'Apartment',
    beds: 2,
    baths: 3,
    sqft: 1400,
    price: 190_000,
    image: PH('downtown-dusk'),
    gallery: [PH('living-grey'), PH('dining-white'), PH('bedroom-white')],
    summary: 'A two-bedroom over the Fountain, a walk from Dubai Mall and the metro.',
    features: ['Fountain view', 'Walk to the metro', 'Pool and gym', 'Two parking bays'],
    tags: ['Unfurnished', 'Pool & gym', '1 cheque'],
  },
  {
    id: 'hills-villa-rent',
    mode: 'rent',
    title: '4-Bed Villa, Dubai Hills Park',
    area: 'Dubai Hills Estate',
    areaKey: 'hills',
    type: 'Villa',
    beds: 4,
    baths: 5,
    sqft: 4300,
    price: 420_000,
    image: PH('villa-garden-pool'),
    gallery: [PH('living-bright'), PH('bedroom-luxe'), PH('bathroom')],
    summary: 'A family villa with a private pool and garden beside Dubai Hills Park.',
    features: ['Private pool', 'Landscaped garden', 'Maid’s room', 'Near schools'],
    tags: ['Private pool', 'Landscaped', 'Available Q1'],
  },
  {
    id: 'penthouse-palm',
    mode: 'buy',
    title: 'Sky Penthouse, 360° Palm Views',
    area: 'Palm Jumeirah',
    areaKey: 'palm',
    type: 'Penthouse',
    beds: 4,
    baths: 6,
    sqft: 7800,
    price: 32_000_000,
    image: PH('lounge-city-view'),
    gallery: [PH('marina-aerial'), PH('bedroom-luxe'), PH('bathroom')],
    summary: 'A full-floor penthouse with glass on every side and a private lift to the door.',
    features: ['Full floor, private lift', 'Wraparound terrace', 'Hotel services on call', 'Four parking bays'],
    tags: ['Ready', 'Full floor', 'Private lift'],
  },
];

export const LISTINGS_HEAD = {
  eyebrow: 'Featured, indicative',
  title: 'Homes and Investments We Are Working On',
  lede:
    'A curated cut of the stock this desk handles across Dubai, priced at current market bands. Filter by what you are looking for, or tell us and we search the whole market for you.',
  note: '* Indicative examples of current stock and price bands, updated by the desk. Availability and pricing are confirmed on enquiry.',
};

export interface Benefit {
  value: string;
  suffix?: string;
  label: string;
  body: string;
  /** For the count-up: the number the value rolls to, if it is a number. */
  count?: number;
}

export const WHY = {
  eyebrow: 'Why Dubai',
  title: 'The Case for Dubai, in Numbers',
  lede:
    'The reasons capital and families keep choosing Dubai are not slogans — they are line items. Here is what actually changes when you own here.',
  items: [
    { value: '0', suffix: '%', count: 0, label: 'Personal income tax', body: 'No tax on salary, rental income or dividends for individuals. What you earn from the property is what you keep.' },
    { value: '0', suffix: '%', count: 0, label: 'Capital gains tax', body: 'Sell for more than you paid and the gain is yours in full. There is no annual property tax either.' },
    { value: '6–9', suffix: '%', label: 'Gross rental yields*', body: 'Typical gross yields across the communities on this page, against 2–4% in London, New York or Mumbai.' },
    { value: '10', suffix: ' yr', count: 10, label: 'Golden Visa', body: 'Own property worth AED 2M or more and you, your spouse and children qualify for a renewable ten-year residency.' },
    { value: '100', suffix: '%', count: 100, label: 'Freehold ownership', body: 'Foreign nationals own outright — the land and the title — in every designated freehold area, with no local partner.' },
    { value: '4', suffix: '%', count: 4, label: 'Transfer fee, all in', body: 'One Dubai Land Department fee on purchase and a transparent cost stack. We show you the total before you commit.' },
    { value: '200', suffix: '+', count: 200, label: 'Nationalities', body: 'A city built by people who moved here, with the schools, healthcare and safety record that come with that.' },
    { value: '8', suffix: ' hrs', count: 8, label: 'To two-thirds of the world', body: 'Between Asia and Europe, on the routes of two of the largest airlines in the world — home and the office are both close.' },
  ] as Benefit[],
  footnote: '* Yields are indicative market bands, gross, before service charges; the calculator below shows the net. Tax treatment depends on your country of tax residence — we will walk through yours.',
};

export interface Area {
  key: string;
  name: string;
  lat: number;
  lng: number;
  /** AED per sq ft, indicative band for apartments unless noted. */
  psf: number;
  yieldPct: number;
  vibe: string;
  body: string;
  bestFor: string[];
}

export const AREAS_HEAD = {
  eyebrow: 'Where to live',
  title: 'Dubai, Area by Area',
  lede:
    'Ten communities, each a different answer to how you want to live and what you want the property to do. Hover a card to find it on the map; tap a pin to read about it.',
  note: 'Price and yield bands are indicative market figures for the community, not a valuation of any property. Updated by the desk each quarter.',
};

export const AREAS: Area[] = [
  { key: 'downtown', name: 'Downtown Dubai', lat: 25.1972, lng: 55.2744, psf: 2600, yieldPct: 5.5, vibe: 'The centre of the city', body: 'Burj Khalifa, the Opera and the Fountain at the door. Liquid, prestigious, and the address that holds its value.', bestFor: ['Prestige', 'Liquidity', 'Short lets'] },
  { key: 'marina', name: 'Dubai Marina', lat: 25.0805, lng: 55.1403, psf: 1900, yieldPct: 6.5, vibe: 'Waterfront, always awake', body: 'Towers around a working marina, the promenade below, the beach a walk away. The strongest rental demand in the city.', bestFor: ['Rental yield', 'Young professionals', 'Sea views'] },
  { key: 'palm', name: 'Palm Jumeirah', lat: 25.1124, lng: 55.139, psf: 3400, yieldPct: 5.0, vibe: 'Beachfront, branded, private', body: 'Villas with their own beach, branded residences with hotel service. The trophy end of the market and it trades like one.', bestFor: ['Trophy homes', 'Beachfront', 'Branded residences'] },
  { key: 'bay', name: 'Business Bay', lat: 25.185, lng: 55.265, psf: 1850, yieldPct: 6.8, vibe: 'Downtown, one step over', body: 'Canal-side towers minutes from Downtown at a materially lower entry price, with a deep pool of corporate tenants.', bestFor: ['Yield', 'Corporate lets', 'Off-plan'] },
  { key: 'jvc', name: 'Jumeirah Village Circle', lat: 25.055, lng: 55.209, psf: 1150, yieldPct: 8.0, vibe: 'The yield play', body: 'Mid-market apartments and townhouses, strong occupancy and the highest gross yields on this list. Where investors start.', bestFor: ['First investment', 'High yield', 'Studios & 1-beds'] },
  { key: 'hills', name: 'Dubai Hills Estate', lat: 25.109, lng: 55.244, psf: 2300, yieldPct: 5.6, vibe: 'Green, family, golf', body: 'A master-planned community around an 18-hole course, with the schools, park and mall inside it. The family default.', bestFor: ['Families', 'Villas', 'Schools'] },
  { key: 'creek', name: 'Dubai Creek Harbour', lat: 25.202, lng: 55.344, psf: 2000, yieldPct: 6.0, vibe: 'The next skyline', body: 'A new waterfront district facing the old city and the wildlife sanctuary. Off-plan led, with the growth curve still ahead of it.', bestFor: ['Off-plan', 'Capital growth', 'Waterfront'] },
  { key: 'jbr', name: 'Jumeirah Beach Residence', lat: 25.078, lng: 55.133, psf: 2100, yieldPct: 6.2, vibe: 'Beach at the lobby', body: 'The Walk, the beach and the restaurants at street level; the sea from most windows. A holiday-let favourite.', bestFor: ['Holiday lets', 'Beach living', 'Furnished'] },
  { key: 'ranches', name: 'Arabian Ranches', lat: 25.052, lng: 55.268, psf: 1500, yieldPct: 5.4, vibe: 'Villas, space, quiet', body: 'Established villa community with mature landscaping, its own schools and a polo club. Space per dirham that towers cannot match.', bestFor: ['Villas', 'Families', 'Space'] },
  { key: 'damac', name: 'DAMAC Hills', lat: 25.035, lng: 55.247, psf: 1250, yieldPct: 7.2, vibe: 'Golf, at an entry price', body: 'Golf-course villas, townhouses and apartments at a lower entry point than Dubai Hills, with yields to match.', bestFor: ['Value villas', 'Golf', 'Yield'] },
];

export interface LifestylePanel {
  eyebrow: string;
  title: string;
  body: string;
  /** A photograph, or — */
  image?: string;
  /** — one of the practice's own live abstracts (components/three/estateScenes). */
  variant?: 'skyline' | 'dunes' | 'arches' | 'globe' | 'lattice';
}

export const LIFESTYLE_HEAD = {
  eyebrow: 'Dubai, every day',
  title: 'A City Built for the Way You Want to Live',
};

export const LIFESTYLE: LifestylePanel[] = [
  { eyebrow: '06:30', title: 'The beach before the office.', body: 'Kite Beach, JBR, the Palm — a swim and a coffee are a normal Tuesday, not a holiday.', image: `${IMG}/services/real-estate-transactions-solution-1.webp` },
  { eyebrow: '09:00', title: 'Twenty minutes to anywhere that matters.', body: 'DIFC, Downtown, Media City and the airport are all a short drive from every community on this page.', image: `${IMG}/services/real-estate-hero.webp` },
  { eyebrow: '15:00', title: 'Schools that rank, minutes from home.', body: 'British, IB, American and Indian curricula, many inside the communities themselves, with waiting lists we know how to navigate.', variant: 'arches' },
  { eyebrow: '18:30', title: 'Golf at sunset. Or the marina. Or the desert.', body: 'Championship courses, a coastline of beach clubs and the dunes an hour away. Weekends here are a choice, not a search.', image: `${RE}/buy-property-hero.webp` },
  { eyebrow: '21:00', title: 'Dinner on the 50th floor, home by ten.', body: 'The safest big city most people will ever live in, with a restaurant scene that does not close. Walk home.', variant: 'skyline' },
  { eyebrow: 'Always', title: 'Two-thirds of the world within eight hours.', body: 'Family in Mumbai, an office in London, a board in Singapore — Dubai is the one place all three are a direct flight.', variant: 'globe' },
];

export const CALC_HEAD = {
  eyebrow: 'Run the numbers',
  title: 'What Would It Actually Return?',
  lede: 'Two calculators the desk uses in the first conversation. Indicative — every real purchase gets a written appraisal — but honest enough to plan around.',
};

export const ROI_DEFAULTS = {
  price: 2_450_000,
  rent: 155_000,
  sqft: 1380,
  serviceChargePsf: 18,
  /** DLD 4% + registration and agency, as a share of price. */
  buyCostPct: 0.065,
};

export const PLANS = [
  { key: '60-40', label: '60 / 40', during: 0.6, handover: 0.4, months: 30 },
  { key: '70-30', label: '70 / 30', during: 0.7, handover: 0.3, months: 36 },
  { key: '80-20', label: '80 / 20', during: 0.8, handover: 0.2, months: 36 },
  { key: '1-monthly', label: '20% then 1% monthly', during: 0.2, handover: 0.8, months: 36, monthly: 0.01 },
];

export const PROCESS_HEAD = {
  eyebrow: 'How it works',
  title: 'From First Search to the Keys, One Team',
};

export const PROCESS = [
  { n: '01', title: 'Brief', body: 'What the property has to do — home, income, a visa, a hedge — and the budget it has to do it within. We shortlist against that, not against what is easiest to sell.' },
  { n: '02', title: 'Diligence', body: 'Title, RERA and DLD checks, service-charge history, the developer’s escrow position on off-plan, and an independent valuation from our own RICS-regulated valuers.' },
  { n: '03', title: 'Structure', body: 'Mortgage or cash, personal name or entity, resident or non-resident, Golden Visa eligibility — set up correctly once, so it never has to be undone.' },
  { n: '04', title: 'Transact', body: 'The MOU, the deposit, the NOC and the DLD transfer, managed end to end. You sign twice and attend once.' },
  { n: '05', title: 'Own', body: 'Letting, tenant vetting, Ejari and management for landlords who live elsewhere. Quarterly reporting, one point of contact.' },
];

export const INSIGHTS_HEAD = {
  eyebrow: 'Insights',
  title: 'Reading the Dubai Market',
  cta: 'All insights',
};

export const LEAD = {
  eyebrow: 'Talk to the desk',
  title: 'Tell Us What the Property Has to Do',
  lede: 'A twenty-minute call with a Dubai advisor — no listings pushed at you, just the questions that narrow the search. We come back within one working day.',
  points: ['Independent: we are advisers, not a developer’s sales office', 'Group valuers, mortgage desk and tax team on the same call', 'Non-resident buyers handled remotely, end to end'],
};

export const FAQ_HEAD = {
  eyebrow: 'Questions',
  title: 'What Buyers Ask Us First',
};

export const FAQS = [
  { q: 'Can a foreign national own property in Dubai outright?', a: 'Yes. In the designated freehold areas — which include every community on this page — non-UAE nationals own the property and the land it stands on, in their own name or through a company, with no local partner and no time limit. Title is registered with the Dubai Land Department.' },
  { q: 'What does it cost to buy, beyond the price?', a: 'Budget around 6–7% on top of the purchase price: a 4% Dubai Land Department transfer fee, a fixed registration fee, and agency at 2%. On a mortgage there is a 0.25% registration fee and valuation costs. We put the full stack in writing before you make an offer.' },
  { q: 'How does the Golden Visa work with property?', a: 'Own property worth AED 2 million or more — a single unit or several, ready or off-plan from approved developers, and it can be mortgaged — and you qualify for a renewable ten-year residency for yourself, your spouse and your children. We prepare the application alongside the purchase.' },
  { q: 'Is off-plan safe?', a: 'Every off-plan payment goes into a RERA-regulated escrow account held for the specific project and released to the developer only against certified construction progress. We check the developer’s track record, the escrow status and the completion date before you commit, and the payment plan against your cash flow.' },
  { q: 'I do not live in the UAE. Can I buy, and can I get a mortgage?', a: 'Yes to both. Non-residents buy remotely with a power of attorney we arrange, and several UAE banks lend to non-residents — typically up to 50–60% of value. Our mortgage desk compares the offers side by side.' },
  { q: 'What return should I expect?', a: 'Gross yields across these communities typically run 5–8%, net of service charges roughly 1–2 points lower; the calculator above shows both for any price and rent. Capital growth has been strong but is not guaranteed, and we will say so — our own valuers write the appraisal, not the seller’s agent.' },
];
