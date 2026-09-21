/**
 * The template behind all eight service pages, in the landing page's design
 * (20260921). One component driven by a `ServicePage` record from
 * data/pages.ts and data/service-pages-2.ts, so a ninth page is still a data
 * entry and a slug, not a new component.
 *
 * Shape: photograph hero with the page's highlights → what the service
 * includes → the steps → page-specific stock, prices, costs or plans → the
 * call to action on a live abstract → reviews → the page's FAQs → developer
 * marquee → the enquiry form, preset to what this page is about.
 */
import type { Locale, ServicePage } from '../lib/types';
import type { EstateVariant } from './three/estateScenes';
import type { Interest } from './landing/LeadForm';
import PageRoot from './landing/PageRoot';
import PageHero from './landing/PageHero';
import Process from './landing/Process';
import Faq from './landing/Faq';
import Enquire from './landing/Enquire';
import { Band, Costs, Developers, Offer, Plans, Prices, Stock, Voices } from './landing/PageSections';
import {
  BUY_COSTS,
  BUY_LISTINGS,
  OFFPLAN_LISTINGS,
  PAYMENT_PLANS,
  RENT_LISTINGS,
  RENT_PRICES,
  SALE_PRICES,
  SELL_COSTS,
} from '../data/market';

/** Which detail blocks each page carries, keyed by slug. */
const DETAIL: Record<string, React.ReactNode> = {
  'buy-property': (
    <>
      <Stock
        title="Properties on the Market Now"
        lede="Current stock across Dubai's freehold communities — apartments, villas, townhouses, penthouses and offices. Swipe a card for more photos, or open it for the full details."
        groups={[{ key: 'sale', label: 'For sale', items: BUY_LISTINGS }]}
      />
      <Prices
        title="What Property Costs, by Community"
        lede="Indicative sale prices per square foot and the gross yields those prices imply."
        rows={SALE_PRICES}
        columns={['Apartments', 'Villas & townhouses', 'Gross yield']}
      />
      <Costs title="The Full Cost of a Purchase" lede="Everything payable beyond the price itself, set out before you make an offer rather than after." rows={BUY_COSTS} />
    </>
  ),
  'sell-rent-lease-property': (
    <>
      <Stock
        title="Properties We Are Letting and Selling"
        lede="Homes and commercial space our clients have instructed us on — to rent now, or to buy. Swipe a card for more photos, or open it for the full details."
        groups={[
          { key: 'rent', label: 'For rent', items: RENT_LISTINGS },
          { key: 'sale', label: 'For sale', items: BUY_LISTINGS },
        ]}
      />
      <Prices
        title="What Rents Achieve, by Community"
        lede="Indicative annual rents and the cheque structures landlords in each community typically accept."
        rows={RENT_PRICES}
        columns={['Apartments', 'Villas & townhouses', 'Payment terms']}
      />
      <Costs title="What Selling Costs You" lede="The deductions between the achieved price and what reaches your account." rows={SELL_COSTS} />
    </>
  ),
  'off-plan-properties': (
    <>
      <Stock
        title="Launches Worth Considering"
        lede="Registered projects with escrow in place, their current payment plans and expected handover. Open a launch for the plan, the unit mix and the photos."
        groups={[{ key: 'launch', label: 'Launches', items: OFFPLAN_LISTINGS }]}
      />
      <Plans items={PAYMENT_PLANS} />
    </>
  ),
};

/** The abstract behind each page's call to action. The lattice is the
    enquiry panel's, so it is not used here. */
const BAND: Record<string, EstateVariant> = {
  'buy-property': 'skyline',
  'sell-rent-lease-property': 'dunes',
  'off-plan-properties': 'arches',
  residential: 'arches',
  commercial: 'skyline',
  'mortgage-services': 'globe',
  'investment-advisory': 'globe',
  'valuations-advisory': 'dunes',
};

/** What the enquiry form starts on, for each page. */
const INTEREST: Record<string, Interest> = {
  'buy-property': 'Buying',
  'sell-rent-lease-property': 'Selling or letting',
  'off-plan-properties': 'Off-plan',
  residential: 'Buying',
  commercial: 'Buying',
  'mortgage-services': 'Mortgage',
  'investment-advisory': 'Buying',
  'valuations-advisory': 'Valuation',
};

export default function ServicePageBody({ page }: { locale: Locale; page: ServicePage }) {
  return (
    <PageRoot>
      <PageHero eyebrow={page.eyebrow} title={page.title} accent={page.titleAccent} lede={page.lede} image={page.heroImg} highlights={page.highlights} />
      <Offer title={page.offerTitle} lede={page.offerLede} items={page.offer} />
      <Process
        eyebrow="How it works"
        title={page.stepsTitle}
        steps={page.steps.map((s) => ({ n: s.number, title: s.title, body: s.body }))}
        cta={{ label: 'Speak to an advisor', href: '#enquire' }}
      />
      {DETAIL[page.slug] ?? null}
      <Band variant={BAND[page.slug] ?? 'skyline'} eyebrow={page.eyebrow} title={page.ctaTitle} body={page.ctaBody} />
      <Voices />
      <Faq items={page.faqs} eyebrow="Questions" title={`${page.eyebrow}: What People Ask`} />
      <Developers />
      <Enquire interest={INTEREST[page.slug] ?? 'Buying'} />
    </PageRoot>
  );
}
