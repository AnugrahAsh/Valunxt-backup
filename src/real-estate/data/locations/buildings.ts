/**
 * THE DUBAI BUILDING PAGES.
 *
 * Same template as the area guides (components/location/LocationBody.tsx) and
 * the same two rules: figures are indicative bands, and tenure is stated
 * rather than inferred.
 *
 * A THIRD RULE APPLIES HERE. A building page is read by someone deciding
 * whether to view a specific address, so a wrong fact costs them a journey or
 * worse. Where the desk has confirmed a building's plot, `locate` is 'plot'
 * and the map marks the building. Where it has not, `locate` is 'district',
 * the map says so on screen, and the page carries no invented floor counts,
 * unit totals or completion dates. `facts` holds only what is known; rows are
 * omitted rather than guessed. Filling those in is a one-line edit per
 * building once the desk confirms them.
 */
import type { LocationPage } from './index';

export const BUILDINGS: LocationPage[] = [
  /* ---------------------------------------------------------------- 01 */
  {
    slug: 'sama-tower',
    kind: 'building',
    name: 'Sama Tower',
    sector: 'Al Nahda',
    tagline: 'A residential tower on the Nahda corridor',
    image: '/real-estate/listings/tower-tall.webp',
    lat: 25.2895,
    lng: 55.365,
    locate: 'district',
    tenure: 'Mixed',
    tenureNote:
      'The ownership route at this address is confirmed with the building management and the Land Department before an offer. We put the answer in writing rather than relying on what a listing says.',
    intro: [
      'Sama Tower is a residential address on the Al Nahda corridor, the dense, well-connected strip on the Dubai side of the Sharjah border where a great many households choose to live for the combination of low rents, metro access and a ten-minute run to the airport.',
      'Towers on this corridor are judged on a short list of things: which elevation the unit faces, how cooling is billed, whether a parking bay comes with it, and how well the building itself is run. Those four answers move the real cost of living there by thousands a year, and they differ unit to unit inside the same tower.',
      'This page sets out what the address offers and what we check on your behalf. For the specific unit you are considering, the desk pulls the building\'s service-charge record, confirms the tenure route and walks the floor with you before anything is signed.',
    ],
    stats: [
      { value: 'AED 650–950', label: 'Per sq ft, area band', detail: 'Indicative' },
      { value: '~7.8%', label: 'Gross yield', detail: 'Corridor average' },
      { value: '10 min', label: 'To the airport' },
      { value: 'Green Line', label: 'Metro nearby' },
    ],
    highlights: [
      { title: 'The corridor position', body: 'Sharjah in around ten minutes, Dubai airport in ten, and the Green Line close by. For households that use both emirates, this strip is the most practical address in the city.' },
      { title: 'Al Nahda Pond Park nearby', body: 'A proper municipal park with a lake and running track, which is what keeps this density liveable and is a genuine driver of rent on the buildings closest to it.' },
      { title: 'Street-level everything', body: 'Supermarkets, clinics, restaurants and salons occupy the ground floors along the corridor, so daily life happens without a car.' },
      { title: 'Rents that stay affordable', body: 'Among the lowest in metro-served Dubai, which is why occupancy across this corridor holds through every part of the cycle.' },
    ],
    suits: ['Dual-emirate commuters', 'Airport and aviation staff', 'Value-focused families', 'Yield-led landlords'],
    connections: [
      { to: 'Dubai International Airport', minutes: '10 min' },
      { to: 'Sharjah city centre', minutes: '10 min' },
      { to: 'Deira City Centre', minutes: '12 min' },
      { to: 'Downtown Dubai', minutes: '25 min' },
    ],
    living: [
      { title: 'Everyday', items: ['Al Nahda Pond Park', 'Ground-level retail along the corridor', 'Supermarkets and clinics on every block', 'Sahara Centre a short drive away'] },
      { title: 'Schools & nurseries', items: ['Schools within Al Nahda', 'Nurseries at ground level in many buildings', 'The Al Qusais cluster nearby'] },
      { title: 'Getting around', items: ['Green Line stations nearby', 'Dense bus network', 'Direct access to the Sharjah crossings', 'Emirates Road'] },
    ],
    invest: {
      body: 'Buildings on this corridor are income assets. Occupancy is close to permanent and the tenant pool is enormous; the returns are decided by how well the building is run and how the service charge and cooling are structured.',
      points: [
        'Interior elevations are quieter and, in this corridor, worth paying a little more for',
        'Confirm how cooling is recharged before you model a net yield',
        'Parking is the scarce resource: establish what comes with the unit rather than the building',
      ],
    },
    prices: [
      { type: 'Studio & 1 bed apartment', sale: 'On enquiry', rent: 'AED 33K – 54K / yr' },
      { type: '2 & 3 bed apartment', sale: 'On enquiry', rent: 'AED 58K – 95K / yr' },
      { type: 'Retail unit, per sq ft', sale: 'On enquiry', rent: 'AED 110 – 190 / sq ft' },
    ],
    checks: [
      'Confirm the tenure route at this address in writing before an offer',
      'Ask the building management for the service-charge record and the maintenance history',
      'Establish whether the unit is chiller-free and how cooling is billed',
      'Confirm the parking bay is allocated to the unit, not to the building',
    ],
    faqs: [
      { q: 'Can I buy an apartment in this building?', a: 'That depends on the address\'s tenure route, which we confirm with the building management and the Land Department before you make an offer. We put the answer in writing rather than relying on a listing.' },
      { q: 'What should I look at before viewing?', a: 'Which elevation the unit faces, whether it is chiller-free, whether a parking bay comes with it and how the building is maintained. Those four answers change the real cost more than the headline rent does.' },
      { q: 'Is the location good for commuting to Sharjah?', a: 'It is one of the best in Dubai for it, with the crossings minutes away. The peak-hour queues are real, so drive your actual commute before committing.' },
    ],
    nearby: ['al-nahda-1', 'al-nahda-2', 'al-qusais-2'],
    amenities: ['Passenger lifts', 'Covered parking', 'Building security', 'Ground-floor retail', 'Shared gym'],
    stock: [
      {
        type: 'Apartment',
        beds: 1,
        baths: 2,
        sqft: 840,
        rent: 49_000,
        img: 'living-bright',
        also: ['kitchen-bright', 'bedroom-soft'],
        tags: ['Interior elevation', 'To let'],
        summary: 'A one-bedroom on an interior elevation away from the main road, with a balcony, a separate kitchen and a parking bay.',
        features: ['Quiet interior elevation', 'Allocated parking bay', 'Separate closed kitchen', 'Walk to the park and the retail'],
      },
      {
        type: 'Apartment',
        beds: 2,
        baths: 3,
        sqft: 1_330,
        rent: 74_000,
        img: 'living-grey',
        also: ['dining-white', 'bedroom-white'],
        tags: ['Family size', 'Chiller free'],
        summary: 'A two-bedroom with two balconies and a maid\'s room, chiller-free, on a higher floor with an open outlook.',
        features: ['Chiller included in the rent', 'Maid\'s room off the kitchen', 'Two balconies', 'Higher floor with an open outlook'],
      },
    ],
    seoDesc:
      'Sama Tower, Al Nahda: what the address offers, indicative rents for the corridor, connectivity, and the tenure, service-charge and parking checks the Valunxt desk runs before you commit.',
  },

  /* ---------------------------------------------------------------- 02 */
  {
    slug: 'apricot-tower',
    kind: 'building',
    name: 'Apricot Tower',
    sector: 'Dubai Silicon Oasis',
    tagline: 'A mixed-use tower in Silicon Oasis',
    image: '/real-estate/listings/tower-modern.webp',
    lat: 25.12,
    lng: 55.38,
    locate: 'district',
    tenure: 'Mixed',
    tenureNote:
      'Dubai Silicon Oasis is a free-zone authority area with its own registration process. The ownership route at this address is confirmed with the authority and the building management before an offer.',
    intro: [
      'Apricot Tower is an address in Dubai Silicon Oasis, the technology free zone on the southern side of the city that has grown into a substantial mixed-use district with its own residential towers, retail, schools and university campus.',
      'Silicon Oasis works on a simple proposition: modern buildings, reasonable rents, and an employment base inside the district itself. The tenants are largely the technology, engineering and academic population who work within a short drive, which gives the residential stock here a demand floor that is not tied to the wider market.',
      'What matters at a specific address is the building rather than the district: how it is managed, what the service charge does, which elevation a unit faces and what parking comes with it. That is what the desk establishes before you view.',
    ],
    stats: [
      { value: 'AED 750–1.05K', label: 'Per sq ft, area band', detail: 'Indicative' },
      { value: '~7.8%', label: 'Gross yield', detail: 'District average' },
      { value: '20 min', label: 'To Downtown Dubai' },
      { value: 'Free zone', label: 'District status' },
    ],
    highlights: [
      { title: 'Employment inside the district', body: 'Technology companies, the academic campus and the free-zone businesses sit within Silicon Oasis itself, which supports residential demand independently of the rest of the market.' },
      { title: 'Modern stock, modern layouts', body: 'The residential towers here are largely from the last fifteen years, which means current layouts, working services and a lower maintenance burden than the older districts.' },
      { title: 'Self-contained amenity', body: 'Retail centres, supermarkets, schools, clinics and parks are all inside the district, so daily life does not require leaving it.' },
      { title: 'Roads in three directions', body: 'Sheikh Mohammed Bin Zayed Road, Al Ain Road and Emirates Road all serve the district, which makes the eastern and southern corridors straightforward.' },
    ],
    suits: ['Technology and academic staff', 'Value-focused families', 'Yield-led investors', 'Tenants wanting newer buildings'],
    connections: [
      { to: 'Academic City', minutes: '8 min' },
      { to: 'Downtown Dubai', minutes: '20 min' },
      { to: 'Dubai International Airport', minutes: '20 min' },
      { to: 'Dubai Marina', minutes: '35 min' },
    ],
    living: [
      { title: 'Everyday', items: ['Silicon Central and district retail', 'Supermarkets and clinics within the district', 'Parks and play areas', 'Restaurants and cafés at podium level'] },
      { title: 'Schools & nurseries', items: ['Schools within Dubai Silicon Oasis', 'Nurseries inside the residential clusters', 'Academic City campuses nearby'] },
      { title: 'Getting around', items: ['Sheikh Mohammed Bin Zayed Road', 'Dubai–Al Ain Road', 'Emirates Road', 'Bus routes to the metro network'] },
    ],
    invest: {
      body: 'A steady income district with newer stock than most of the value end of the market. The free-zone employment base underpins demand, and the discipline is in choosing a well-run building.',
      points: [
        'Service charges vary between towers and are the main driver of net yield here',
        'Units facing the district interior are quieter than those on the main roads',
        'Free-zone registration adds a step to the purchase process: factor the time in',
      ],
    },
    prices: [
      { type: 'Studio', sale: 'AED 420K – 650K', rent: 'AED 36K – 52K / yr' },
      { type: '1 bed apartment', sale: 'AED 620K – 950K', rent: 'AED 48K – 70K / yr' },
      { type: '2 & 3 bed apartment', sale: 'AED 950K – 1.7M', rent: 'AED 72K – 115K / yr' },
    ],
    checks: [
      'Confirm the registration and ownership route with the free-zone authority',
      'Obtain the building\'s service-charge record for at least two years',
      'Establish which elevation the unit faces and what the outlook is',
      'Confirm parking allocation and whether visitor parking is available',
    ],
    faqs: [
      { q: 'Can foreign nationals own property in Dubai Silicon Oasis?', a: 'Silicon Oasis operates its own authority and registration process. The route at a specific address is something we confirm with the authority and the building management before you offer, and it adds a step to the timeline.' },
      { q: 'Who lives in Silicon Oasis?', a: 'Largely people working in the technology and engineering businesses inside the free zone, plus academic staff and students from the campuses nearby, and families drawn by the newer stock and reasonable rents.' },
      { q: 'Is it far from the city?', a: 'Around twenty minutes to Downtown off-peak and similar to the airport. To the Marina it is a long run. It suits people whose work is in the southern and eastern corridors.' },
    ],
    nearby: ['the-villa', 'rukan-community', 'al-warqa-4'],
    amenities: ['Passenger lifts', 'Covered parking', 'Shared pool', 'Gym', 'Building security', 'Retail at podium level'],
    stock: [
      {
        type: 'Apartment',
        beds: 1,
        baths: 2,
        sqft: 790,
        buy: 780_000,
        rent: 58_000,
        img: 'living-modern',
        also: ['kitchen-bright', 'bedroom-white'],
        tags: ['District interior', 'Parking'],
        summary: 'A one-bedroom facing the district interior rather than the main road, with a fitted kitchen and covered parking.',
        features: ['Faces the district interior', 'Fitted kitchen with appliances', 'Covered parking bay', 'Pool and gym in the building'],
      },
      {
        type: 'Apartment',
        beds: 2,
        baths: 3,
        sqft: 1_260,
        buy: 1_150_000,
        rent: 88_000,
        img: 'living-bright',
        also: ['dining-white', 'bedroom-soft', 'bathroom'],
        tags: ['Two balconies', 'Family size'],
        summary: 'A two-bedroom on a higher floor with two balconies, a maid\'s room and an open outlook across the district.',
        features: ['Two balconies with an open outlook', 'Maid\'s room off the kitchen', 'Covered parking bay', 'Retail at podium level'],
      },
    ],
    seoDesc:
      'Apricot Tower, Dubai Silicon Oasis: what the address and the district offer, indicative prices and rents, and the registration, service-charge and parking checks to run first.',
  },

  /* ---------------------------------------------------------------- 03 */
  {
    slug: 'imperial-avenue',
    kind: 'building',
    name: 'Imperial Avenue',
    sector: 'Downtown Dubai',
    tagline: 'A Downtown residential tower minutes from the Burj',
    image: '/real-estate/listings/downtown-dusk.webp',
    lat: 25.188,
    lng: 55.28,
    locate: 'district',
    tenure: 'Freehold',
    tenureNote:
      'Downtown Dubai is a designated freehold district, open to buyers of any nationality, with title registered at the Dubai Land Department. Unit-level title is confirmed before an offer as a matter of routine.',
    intro: [
      'Imperial Avenue is a residential address in Downtown Dubai, the district built around the Burj Khalifa, Dubai Mall and the Opera, where the amenity is complete and the address carries its own weight in the market.',
      'Buying in Downtown is a different exercise from buying in the value districts. Yields are lower and service charges are higher, but liquidity is the best in the city, international demand is constant, and the view, where a unit has one, is a durable part of the value rather than a temporary one.',
      'At a specific tower the questions narrow quickly: what exactly the unit looks at, whether that outlook is protected, what the service charge actually runs at, and whether the building permits short-term letting. Those four answers decide the investment.',
    ],
    stats: [
      { value: 'AED 2.3–3.0K', label: 'Per sq ft, area band', detail: 'Indicative' },
      { value: '~5.6%', label: 'Gross yield', detail: 'District average' },
      { value: 'Freehold', label: 'Open to all buyers' },
      { value: '5 min', label: 'To Dubai Mall' },
    ],
    highlights: [
      { title: 'Amenity already built', body: 'The Mall, the Opera, the Fountain, the park and the boulevard are complete and operating. Nothing about what makes Downtown valuable is still a promise.' },
      { title: 'The best liquidity in Dubai', body: 'Downtown trades constantly and internationally. When it comes time to sell, the buyer pool here is the widest in the emirate.' },
      { title: 'Short-stay demand', body: 'Visitor numbers to the district are enormous year-round, which supports holiday-let performance well above the city average in buildings that permit it.' },
      { title: 'Walkable centre', body: 'The boulevard, the Mall and the park are connected on foot and through air-conditioned links, which residents genuinely use through most of the year.' },
    ],
    suits: ['Prestige buyers', 'Short-let investors', 'Executives on long stays', 'Owners prioritising liquidity'],
    connections: [
      { to: 'Dubai Mall', minutes: '5 min' },
      { to: 'DIFC', minutes: '8 min' },
      { to: 'Dubai International Airport', minutes: '15 min' },
      { to: 'Dubai Marina', minutes: '22 min' },
    ],
    living: [
      { title: 'Everyday', items: ['The Dubai Mall', 'Burj Park and the boulevard', 'Dubai Opera', 'Supermarkets and clinics within the towers'] },
      { title: 'Schools & nurseries', items: ['Nurseries within the district', 'Schools a short drive into Al Wasl and Jumeirah', 'The Business Bay cluster nearby'] },
      { title: 'Getting around', items: ['Burj Khalifa / Dubai Mall metro, Red Line', 'Sheikh Zayed Road', 'Air-conditioned pedestrian links', 'Extensive taxi and ride-hail coverage'] },
    ],
    invest: {
      body: 'A capital-preservation asset rather than a yield one. What is bought here is liquidity, international demand and an address that has historically held value better than most of the market through downturns.',
      points: [
        'Burj and Fountain outlooks carry a premium that survives cycles; interior views do not',
        'Service charges are among the highest in Dubai and must be modelled, not assumed',
        'Short-let permission is set by the building as well as the regulator: confirm both',
      ],
    },
    prices: [
      { type: 'Studio', sale: 'AED 1.1M – 1.7M', rent: 'AED 75K – 110K / yr' },
      { type: '1 & 2 bed apartment', sale: 'AED 1.8M – 5.5M', rent: 'AED 120K – 280K / yr' },
      { type: '3 bed and penthouse', sale: 'AED 5.5M – 25M+', rent: 'AED 300K – 900K / yr' },
    ],
    checks: [
      'Establish exactly what the unit looks at and what is consented on the plots in front',
      'Model the service charge properly: it is high in Downtown and decides the net',
      'Confirm the building\'s policy on short-term letting before relying on that income',
      'Check parking allocation, which varies by unit within the same tower',
    ],
    faqs: [
      { q: 'Is Imperial Avenue freehold?', a: 'It sits in Downtown Dubai, which is a designated freehold district open to buyers of any nationality. We confirm unit-level title at the Land Department before an offer as a matter of routine.' },
      { q: 'Are Downtown yields worth the price?', a: 'Gross yields here sit below the city average. Buyers are generally trading yield for liquidity, international demand and capital resilience, which for many portfolios is the correct trade.' },
      { q: 'Can I let it on a short-stay basis?', a: 'In many Downtown buildings yes, with the correct permit, but the building\'s own rules apply too. We confirm both before a purchase that depends on short-let income.' },
    ],
    nearby: ['downtown-dubai', 'business-bay', 'grand-views-meydan'],
    amenities: ['Concierge', 'Swimming pool', 'Gym and spa facilities', 'Covered parking', '24-hour security', 'Retail at podium level'],
    stock: [
      {
        type: 'Apartment',
        beds: 1,
        baths: 2,
        sqft: 870,
        buy: 2_350_000,
        rent: 140_000,
        img: 'downtown-dusk',
        also: ['lounge-city-view', 'living-modern', 'bedroom-luxe'],
        tags: ['Skyline view', 'High floor'],
        summary: 'A high-floor one-bedroom with a skyline outlook, in a managed tower with concierge, pool and covered parking.',
        features: ['High-floor skyline outlook', 'Concierge and 24-hour security', 'Pool and gym', 'Allocated covered parking'],
      },
      {
        type: 'Apartment',
        beds: 2,
        baths: 3,
        sqft: 1_420,
        buy: 3_950_000,
        rent: 235_000,
        img: 'living-bright',
        also: ['dining-open', 'bedroom-white', 'downtown-skyline'],
        tags: ['Two parking', 'Terrace'],
        summary: 'A two-bedroom with a wide terrace and a double aspect, two parking bays and direct access to the boulevard.',
        features: ['Wide terrace with a double aspect', 'Two allocated parking bays', 'Walk to Dubai Mall and the boulevard', 'Concierge service'],
      },
    ],
    seoDesc:
      'Imperial Avenue, Downtown Dubai: a freehold residential address minutes from the Burj, with indicative prices, rents, service-charge realities and short-let rules explained.',
  },

  /* ---------------------------------------------------------------- 04 */
  {
    slug: 'tameem-house',
    kind: 'building',
    name: 'Tameem House',
    sector: 'Barsha Heights',
    tagline: 'A Barsha Heights tower beside the free zones',
    image: '/real-estate/listings/tower-glass.webp',
    lat: 25.0982,
    lng: 55.176,
    locate: 'district',
    tenure: 'Mixed',
    tenureNote:
      'Barsha Heights holds a mixture of freehold and leasehold towers, set per building rather than across the district. The route at this address is confirmed before an offer.',
    intro: [
      'Tameem House is an address in Barsha Heights, the tower district between Sheikh Zayed Road and Al Khail Road that most residents still call Tecom. It was built to house the people working in the free zones next door, and that is still what defines it.',
      'Dubai Internet City, Media City and Knowledge Park are a walk or one metro stop away, which gives buildings here a tenant pool that renews itself continuously and is not dependent on the wider residential market.',
      'Buildings in this district are judged on service charge, cooling arrangement, parking and which way the units face. Two towers on the same street can produce very different net yields on those four factors alone.',
    ],
    stats: [
      { value: 'AED 1.1–1.5K', label: 'Per sq ft, area band', detail: 'Indicative' },
      { value: '~7.0%', label: 'Gross yield', detail: 'District average' },
      { value: '2', label: 'Metro stations nearby' },
      { value: '10 min', label: 'To Dubai Marina' },
    ],
    highlights: [
      { title: 'Walk to work', body: 'For anyone employed in Internet City, Media City or Knowledge Park this is the shortest commute in Dubai, and for many residents it is on foot.' },
      { title: 'Two Red Line stations', body: 'Dubai Internet City and Al Khail stations sit either side of the district, which widens the tenant pool well beyond the free zones themselves.' },
      { title: 'Podium-level life', body: 'Cafés, restaurants, clinics and grocers occupy the lower levels throughout the district, so errands happen without a car.' },
      { title: 'Central without the premium', body: 'The Marina, Mall of the Emirates and Downtown are each fifteen to twenty minutes away, at an entry price well below any of them.' },
    ],
    suits: ['Free-zone professionals', 'Corporate and staff lets', 'Yield-focused investors', 'Tenants without a car'],
    connections: [
      { to: 'Dubai Internet City', minutes: '4 min' },
      { to: 'Dubai Marina', minutes: '10 min' },
      { to: 'Mall of the Emirates', minutes: '8 min' },
      { to: 'Downtown Dubai', minutes: '20 min' },
    ],
    living: [
      { title: 'Everyday', items: ['Podium-level cafés, clinics and grocers', 'Mall of the Emirates a short drive away', 'Gyms and pools inside most towers', 'Hotel apartments for visiting family'] },
      { title: 'Work', items: ['Dubai Internet City', 'Dubai Media City', 'Dubai Knowledge Park', 'Serviced offices within the district'] },
      { title: 'Getting around', items: ['Dubai Internet City metro, Red Line', 'Al Khail metro, Red Line', 'Sheikh Zayed Road and Al Khail Road', 'Tram connection from the Marina'] },
    ],
    invest: {
      body: 'One of the more dependable yield positions in central Dubai, because the demand driver sits next door and does not move. Studios and one-bedrooms carry the strongest occupancy.',
      points: [
        'Corporate and staff-housing demand keeps voids short between tenancies',
        'Service charges differ sharply between towers and decide the net yield',
        'District cooling is recharged differently building to building: confirm it before modelling',
      ],
    },
    prices: [
      { type: 'Studio', sale: 'AED 480K – 750K', rent: 'AED 42K – 62K / yr' },
      { type: '1 & 2 bed apartment', sale: 'AED 800K – 1.9M', rent: 'AED 65K – 125K / yr' },
      { type: 'Office, per sq ft', sale: 'AED 900 – 1.3K', rent: 'AED 75 – 115 / sq ft' },
    ],
    checks: [
      'Confirm whether this specific tower is freehold before you offer',
      'Read the service-charge history across at least two years',
      'Ask how cooling is billed and whether the unit is chiller-free',
      'Check parking allocation, which is tight in several towers here',
    ],
    faqs: [
      { q: 'Is Barsha Heights the same as Tecom?', a: 'Yes. Tecom is the older name and most residents and agents still use it; Barsha Heights is the official district name.' },
      { q: 'Can I buy in this building?', a: 'Eligibility in Barsha Heights is set per tower, not across the district. We confirm the position on this address before you spend time on a unit.' },
      { q: 'Why do yields beat the Marina here?', a: 'Entry prices are lower while rents are supported by the free zones next door. You are trading the waterfront address for income.' },
    ],
    nearby: ['barsha-heights', 'al-barsha-1', 'dubai-marina'],
    amenities: ['Passenger lifts', 'Covered parking', 'Shared pool', 'Gym', 'Building reception', 'Retail at podium level'],
    stock: [
      {
        type: 'Apartment',
        beds: 0,
        baths: 1,
        sqft: 530,
        buy: 640_000,
        rent: 54_000,
        img: 'living-minimal',
        also: ['kitchen-bright', 'bathroom'],
        tags: ['Walk to metro', 'Furnished'],
        summary: 'A furnished studio on a mid floor with a city outlook, minutes on foot from the metro and the free zones.',
        features: ['Furnished and ready to occupy', 'Walk to Dubai Internet City metro', 'Pool and gym in the building', 'Allocated parking bay'],
      },
      {
        type: 'Apartment',
        beds: 1,
        baths: 2,
        sqft: 900,
        buy: 1_050_000,
        rent: 80_000,
        img: 'lounge-city-view',
        also: ['living-modern', 'bedroom-white'],
        tags: ['High floor', 'Quiet elevation'],
        summary: 'A one-bedroom high in the building facing away from Sheikh Zayed Road, with a wide balcony and a full-height living window.',
        features: ['Faces away from Sheikh Zayed Road', 'Wide balcony', 'Full-height living window', 'Allocated covered parking'],
      },
    ],
    seoDesc:
      'Tameem House, Barsha Heights: a Tecom address beside Dubai Internet City and Media City, with indicative prices, rents, yields and the tower-level checks that matter.',
  },

  /* ---------------------------------------------------------------- 05 */
  {
    slug: 'orchid-residence',
    kind: 'building',
    name: 'Orchid Residence',
    sector: 'Dubai',
    tagline: 'A residential address the desk covers in full',
    image: '/real-estate/listings/tower-curved-balconies.webp',
    lat: 25.12,
    lng: 55.38,
    locate: 'district',
    tenure: 'Mixed',
    tenureNote:
      'The tenure route, the registration authority and the title position at this address are confirmed in writing by the desk before an offer. More than one building in Dubai carries this name, so we identify the exact address with you first.',
    intro: [
      'Orchid Residence is an address our Dubai desk covers for buyers and tenants. Before anything else, we establish which building you mean: more than one development in the city carries this name, and the district a building sits in changes the price, the tenure route and the tenant pool entirely.',
      'Once the address is fixed, the work is the same as at any building. We pull the service-charge record, confirm the tenure and registration route, check what the specific unit faces, establish the parking and cooling arrangements, and review how the building has been maintained.',
      'This page sets out how we assess a building and what a buyer or tenant should establish before committing. For the specific address, the desk will send the building\'s own numbers rather than a district average.',
    ],
    stats: [
      { value: 'Confirmed', label: 'Tenure route', detail: 'Before any offer' },
      { value: 'Building', label: 'Service-charge record' },
      { value: 'Per unit', label: 'Outlook and parking' },
      { value: '20 min', label: 'To Downtown, typical' },
    ],
    highlights: [
      { title: 'We identify the address first', body: 'Several Dubai buildings share this name across different districts. Getting that wrong wastes a viewing at best and an offer at worst, so it is the first thing we settle.' },
      { title: 'The building, not the district average', body: 'Two towers on one street can produce very different net yields. We assess the specific building\'s service charge, management and maintenance rather than quoting a district figure.' },
      { title: 'Tenure in writing', body: 'The ownership route, the registering authority and whether a foreign buyer can take title are all confirmed in writing before an offer is discussed.' },
      { title: 'The unit-level questions', body: 'Which elevation it faces, whether the outlook is protected, whether it is chiller-free and whether a parking bay is allocated to the unit. These four change the real cost more than the headline price.' },
    ],
    suits: ['Buyers comparing specific buildings', 'Tenants weighing a particular unit', 'Investors modelling a net yield', 'Owners considering a sale'],
    connections: [
      { to: 'Downtown Dubai', minutes: 'On enquiry' },
      { to: 'Dubai International Airport', minutes: 'On enquiry' },
      { to: 'Nearest metro station', minutes: 'On enquiry' },
      { to: 'Dubai Marina', minutes: 'On enquiry' },
    ],
    living: [
      { title: 'What we confirm', items: ['The exact building and its district', 'Schools and nurseries in the catchment', 'Retail, clinics and parks within walking distance', 'The nearest metro or bus connection'] },
      { title: 'What we obtain', items: ['Two years of service-charge statements', 'The building maintenance record', 'The tenancy or rent roll where relevant', 'The title and tenure position in writing'] },
      { title: 'What you should see', items: ['The unit at the hour you would be home', 'The common areas and the parking', 'The lifts and the plant rooms', 'The route to the nearest transport'] },
    ],
    invest: {
      body: 'Any building-level investment case rests on four numbers: the achievable rent, the service charge, the maintenance liability and the void assumption. We produce all four for the specific address rather than applying a district average to it.',
      points: [
        'The service charge is what turns a good gross yield into a poor net one',
        'Maintenance history predicts your capital costs better than the building\'s age does',
        'Occupancy in the building itself matters more than occupancy in the district',
      ],
    },
    prices: [
      { type: 'Studio & 1 bed apartment', sale: 'On enquiry', rent: 'On enquiry' },
      { type: '2 & 3 bed apartment', sale: 'On enquiry', rent: 'On enquiry' },
      { type: 'Building service charge', sale: 'On enquiry', rent: 'Provided with the record' },
    ],
    checks: [
      'Identify the exact building and district before anything else',
      'Obtain the service-charge record for at least two years',
      'Confirm the tenure and registration route in writing',
      'Establish the outlook, the cooling arrangement and the parking on the specific unit',
    ],
    faqs: [
      { q: 'Why does this page not list prices?', a: 'Because more than one Dubai building carries this name, and quoting a figure before the address is fixed would be misleading. Tell us which building you mean and the desk sends that building\'s own numbers.' },
      { q: 'What will you send me?', a: 'The building\'s service-charge record, its maintenance history, the tenure and registration position in writing, current availability, and an indicative rent and net yield for the specific unit.' },
      { q: 'Can you act for me if I already have a unit in mind?', a: 'Yes. We will run the same checks, give you an independent view of the price, and represent you through the offer and the transfer.' },
    ],
    nearby: ['al-barsha-south', 'business-bay', 'al-furjan'],
    amenities: ['Confirmed per building', 'Parking allocation checked per unit', 'Pool and gym where provided', 'Security and reception arrangements verified'],
    stock: [],
    seoDesc:
      'Orchid Residence, Dubai: how the Valunxt desk assesses a specific building — tenure in writing, the service-charge record, maintenance history and unit-level checks before you commit.',
  },

  /* ---------------------------------------------------------------- 06 */
  {
    slug: 'red-residence',
    kind: 'building',
    name: 'Red Residence',
    sector: 'Dubai',
    tagline: 'A residential address the desk covers in full',
    image: '/real-estate/listings/tower-residential.webp',
    lat: 25.12,
    lng: 55.38,
    locate: 'district',
    tenure: 'Mixed',
    tenureNote:
      'The tenure route, the registration authority and the title position at this address are confirmed in writing before an offer. We identify the exact building with you first, since the name appears in more than one district.',
    intro: [
      'Red Residence is an address our Dubai desk covers for buyers and tenants. As with any building enquiry, the first step is to fix exactly which building and which district is meant, because that determines the price band, the tenure route and the tenant pool.',
      'From there the assessment is the same at every address: the service-charge record, the maintenance history, the tenure and registration position, what the specific unit faces, and how cooling and parking are arranged.',
      'This page explains what we establish and what a buyer or tenant should insist on seeing. For the specific address, the desk sends the building\'s own figures rather than a district average.',
    ],
    stats: [
      { value: 'Confirmed', label: 'Tenure route', detail: 'Before any offer' },
      { value: 'Building', label: 'Service-charge record' },
      { value: 'Per unit', label: 'Outlook and parking' },
      { value: 'Independent', label: 'Price opinion' },
    ],
    highlights: [
      { title: 'The address comes first', body: 'Buildings in Dubai share names across districts. We confirm the exact building before quoting anything, because a figure attached to the wrong address is worse than no figure.' },
      { title: 'Building-level numbers', body: 'The service charge, the maintenance record and the building\'s own occupancy tell you far more than a district average, and they are what we work from.' },
      { title: 'Tenure in writing', body: 'Whether a foreign buyer can take title here, through which authority, and on what terms, all confirmed in writing before an offer.' },
      { title: 'An independent price opinion', body: 'We are advisers rather than a listing portal. If the asking price does not stand up against comparable evidence, we will say so.' },
    ],
    suits: ['Buyers comparing specific buildings', 'Tenants weighing a particular unit', 'Investors modelling a net yield', 'Owners considering a sale'],
    connections: [
      { to: 'Downtown Dubai', minutes: 'On enquiry' },
      { to: 'Dubai International Airport', minutes: 'On enquiry' },
      { to: 'Nearest metro station', minutes: 'On enquiry' },
      { to: 'Dubai Marina', minutes: 'On enquiry' },
    ],
    living: [
      { title: 'What we confirm', items: ['The exact building and its district', 'Schools and nurseries in the catchment', 'Retail, clinics and parks within walking distance', 'The nearest metro or bus connection'] },
      { title: 'What we obtain', items: ['Two years of service-charge statements', 'The building maintenance record', 'The tenancy or rent roll where relevant', 'The title and tenure position in writing'] },
      { title: 'What you should see', items: ['The unit at the hour you would be home', 'The common areas and the parking', 'The lifts and the plant rooms', 'The route to the nearest transport'] },
    ],
    invest: {
      body: 'The investment case at a specific building rests on the achievable rent, the service charge, the maintenance liability and the void assumption. We produce all four for the address rather than applying a district figure.',
      points: [
        'A high gross yield with a heavy service charge is not a high net yield',
        'The building\'s maintenance record predicts your capital costs',
        'Occupancy in the building matters more than occupancy in the district',
      ],
    },
    prices: [
      { type: 'Studio & 1 bed apartment', sale: 'On enquiry', rent: 'On enquiry' },
      { type: '2 & 3 bed apartment', sale: 'On enquiry', rent: 'On enquiry' },
      { type: 'Building service charge', sale: 'On enquiry', rent: 'Provided with the record' },
    ],
    checks: [
      'Fix the exact building and district before anything else',
      'Obtain two years of service-charge statements',
      'Confirm the tenure and registration route in writing',
      'Establish the outlook, cooling and parking on the specific unit',
    ],
    faqs: [
      { q: 'Why are there no prices on this page?', a: 'Because the name appears at more than one Dubai address, and a price quoted against the wrong building is misleading. Tell us which one you mean and we will send that building\'s figures.' },
      { q: 'What does the desk provide?', a: 'The service-charge record, the maintenance history, the tenure position in writing, current availability, and an indicative rent and net yield for the unit you are considering.' },
      { q: 'I already have a unit in mind. Can you help?', a: 'Yes. We run the same checks, give you an independent view on the price, and act for you through the offer and transfer.' },
    ],
    nearby: ['al-barsha-south', 'warsan-2', 'business-bay'],
    amenities: ['Confirmed per building', 'Parking allocation checked per unit', 'Pool and gym where provided', 'Security and reception arrangements verified'],
    stock: [],
    seoDesc:
      'Red Residence, Dubai: how the Valunxt desk assesses a specific building — tenure confirmed in writing, service-charge records, maintenance history and unit-level checks.',
  },

  /* ---------------------------------------------------------------- 07 */
  {
    slug: 'liberty-house',
    kind: 'building',
    name: 'Liberty House',
    sector: 'DIFC',
    tagline: 'Offices and apartments inside the financial centre',
    image: '/real-estate/listings/office-tower.webp',
    lat: 25.211,
    lng: 55.279,
    locate: 'district',
    tenure: 'Freehold',
    tenureNote:
      'DIFC is a financial free zone with its own property registry and its own legal framework. Title within the centre is registered with the DIFC Registrar rather than the Dubai Land Department, and we set out what that means for a buyer before an offer.',
    intro: [
      'Liberty House is an address within the Dubai International Financial Centre, the free zone that houses the emirate\'s banking, legal and professional sector and operates under its own common-law framework and its own property registry.',
      'That legal distinction is the most important thing to understand about buying here. DIFC property is registered with the DIFC Registrar of Real Property rather than the Dubai Land Department, under DIFC law, and the process, the protections and the documentation all differ from the mainland.',
      'What a buyer gets in return is a position inside the financial centre itself: the Gate, the galleries and restaurants of the district, DIFC metro on the doorstep, and a tenant base of banks, law firms and the people who work in them.',
    ],
    stats: [
      { value: 'AED 2.0–2.8K', label: 'Per sq ft, area band', detail: 'Indicative' },
      { value: '~6.0%', label: 'Gross yield', detail: 'District average' },
      { value: 'DIFC', label: 'Own registry and law' },
      { value: 'Red Line', label: 'Metro at the district' },
    ],
    highlights: [
      { title: 'Inside the financial centre', body: 'Banks, law firms, funds and professional practices occupy the district, which produces a tenant base for both the office and the residential floors that is unlike anywhere else in the city.' },
      { title: 'Its own legal framework', body: 'DIFC operates under common law with its own courts and its own property registry. For many international buyers that framework is itself part of the appeal.' },
      { title: 'Walkable and connected', body: 'DIFC metro on the Red Line, air-conditioned links through the district, and Downtown a few minutes away on foot or by car.' },
      { title: 'The Gate district after hours', body: 'Galleries, restaurants and bars around the Gate give the centre an evening life that most business districts lack, which supports residential demand.' },
    ],
    suits: ['Finance and legal professionals', 'Office occupiers', 'Investors wanting DIFC title', 'Corporate lets'],
    connections: [
      { to: 'DIFC metro', minutes: '3 min' },
      { to: 'Downtown Dubai', minutes: '8 min' },
      { to: 'Dubai International Airport', minutes: '15 min' },
      { to: 'Dubai Marina', minutes: '25 min' },
    ],
    living: [
      { title: 'Everyday', items: ['Gate Avenue retail and dining', 'Galleries throughout the district', 'Supermarkets and clinics within DIFC', 'Hotels for visiting teams'] },
      { title: 'Work', items: ['Banks and financial institutions', 'Law firms and professional practices', 'The DIFC Courts and the Academy', 'Serviced offices and business centres'] },
      { title: 'Getting around', items: ['Financial Centre metro, Red Line', 'Sheikh Zayed Road', 'Air-conditioned links through the district', 'Extensive taxi coverage'] },
    ],
    invest: {
      body: 'A distinct market with its own legal regime and its own tenant base. Office and residential both benefit from the concentration of financial and professional occupiers, and the DIFC framework attracts international buyers who value it.',
      points: [
        'Title is registered with the DIFC Registrar, not the Land Department: the process differs',
        'Office covenant strength matters as much as the building when letting commercially',
        'Service charges in the centre are at the higher end and should be modelled carefully',
      ],
    },
    prices: [
      { type: 'Studio & 1 bed apartment', sale: 'AED 1.6M – 3.2M', rent: 'AED 110K – 190K / yr' },
      { type: '2 & 3 bed apartment', sale: 'AED 3.2M – 8M', rent: 'AED 190K – 420K / yr' },
      { type: 'Office, per sq ft', sale: 'AED 2.2K – 3.2K', rent: 'AED 180 – 320 / sq ft' },
    ],
    checks: [
      'Understand the DIFC registration process and how it differs from the mainland',
      'Confirm the service charge, which sits at the higher end within the centre',
      'For offices, establish the fit-out position and the reinstatement obligation',
      'Check parking allocation and visitor access, both tight within DIFC',
    ],
    faqs: [
      { q: 'Is DIFC property freehold?', a: 'Yes, and it is open to buyers of any nationality, but title is registered with the DIFC Registrar of Real Property under DIFC law rather than with the Dubai Land Department. The process and the documentation differ from a mainland purchase and we walk clients through both.' },
      { q: 'Who rents in DIFC?', a: 'Largely the banking, legal and professional population working inside the centre, along with corporate lets taken by the firms themselves. It is a narrower but deeper tenant pool than most districts.' },
      { q: 'Is it a good place to live as well as work?', a: 'For people working in or near the centre, very much so. Gate Avenue, the galleries and the restaurants give it an evening life, and the metro and Downtown are minutes away.' },
    ],
    nearby: ['business-bay', 'downtown-dubai', 'al-mankhool'],
    amenities: ['Concierge and reception', 'Covered parking', 'Gym and pool where provided', '24-hour security', 'Retail and dining at podium level'],
    stock: [
      {
        type: 'Apartment',
        beds: 1,
        baths: 2,
        sqft: 900,
        buy: 2_250_000,
        rent: 155_000,
        img: 'lounge-city-view',
        also: ['living-modern', 'bedroom-luxe'],
        tags: ['DIFC title', 'Walk to metro'],
        summary: 'A one-bedroom within the financial centre, minutes from the metro and Gate Avenue, in a managed building with concierge.',
        features: ['Inside the DIFC district', 'Three minutes to Financial Centre metro', 'Concierge and 24-hour security', 'Allocated covered parking'],
      },
      {
        type: 'Office',
        beds: 0,
        baths: 2,
        sqft: 2_400,
        buy: 6_200_000,
        rent: 520_000,
        img: 'office-tower',
        also: ['office-interior', 'office-glass'],
        tags: ['Fitted', 'DIFC registered'],
        summary: 'A fitted office floor with a reception, four meeting rooms and open plan for around thirty desks, registered within DIFC.',
        features: ['Fitted with reception and four meeting rooms', 'DIFC registered title', 'Three allocated parking bays', 'Manned building reception'],
      },
    ],
    seoDesc:
      'Liberty House, DIFC: offices and apartments inside the financial centre, with indicative prices and rents, and how DIFC title and registration differ from a mainland purchase.',
  },
];
