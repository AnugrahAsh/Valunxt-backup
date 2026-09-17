/**
 * The content behind the mega menus — one shape, three panels.
 *
 * The UAE Services panel (UaeServicesMega, built to the client's KPMG
 * reference) is now the UI for every mega menu on the site: Services in both
 * markets and Insights in both markets (20260914, on client instruction:
 * "change the mega menu UI of Services and Insights, take reference from the
 * UAE services mega menu"). The component draws a blue introduction column, a
 * tab row, a pane of links under the selected tab and a "View all" link; what
 * differs per panel is only the words, and those are assembled here so the
 * component stays one component.
 *
 * Everything is read from the region registry where it can be. The UAE
 * services and their sub-pages come from vxnServices('en-ae') exactly as
 * before; India's four verticals come from vxnServices('en-in'). Insights is
 * the one hand-written list, because those five pages are not services and
 * live in no registry.
 *
 * About (20260915) is the one panel of a different shape: two headed columns
 * of described links and a feature card, built from two supplied references
 * (Savills' "Why Savills" sheet and Reliant Surveyors' "About Us" sheet) and
 * drawn by AboutMega.tsx inside the same sheet. Its words are aboutPreset()
 * below.
 *
 * Plain objects only: UaeServicesMega and AboutMega are client components and
 * these cross the server/client boundary as props.
 */
import { vxnServiceName, vxnServices } from '@/lib/region';
import { vxnMarkets } from '@/lib/site-data';

export interface MegaLink {
  /** Plain text. */
  name: string;
  /** Region-relative, e.g. '/services/x/'. */
  href: string;
}

export interface MegaGroup {
  key: string;
  /** The tab. Plain text. */
  label: string;
  /** Where the tab itself links. */
  href: string;
  links: MegaLink[];
  viewAll: { label: string; href: string };
}

export interface MegaPreset {
  /** The bar item's text and target. */
  label: string;
  href: string;
  aside: {
    title: string;
    lede: string;
    linkLabel: string;
    linkHref: string;
    /** Drop the client photograph and paint the column as a plain brand
        gradient with the wordmark's "x" instead — see PLAIN, THE OTHER ASIDE
        in UaeServicesMega.tsx for why Insights carries this and Services
        does not. */
    plain?: boolean;
  };
  groups: MegaGroup[];
  closeLabel: string;
}

/**
 * Short labels for the UAE tab row.
 *
 * The reference fits four tabs on one line and that is what makes the row read
 * as a row. There are six services here, and their registry names run to
 * "Accounting and Tax Services" — six of those need ~1060px against a pane
 * about 833px wide, so the row would wrap to two lines and stop looking like
 * the reference at all. The full name is still on the tab's own page and in
 * the "View all …" link under the grid.
 */
const UAE_TAB_LABEL: Record<string, string> = {
  'accounting-tax-services': 'Accounting & Tax',
  'real-estate-transactions': 'Real Estate',
  'mortgages-services': 'Mortgages',
  'valuation-and-advisory': 'Valuation',
  'research-intelligence': 'Research',
  'technology-data-ai': 'Technology & AI',
};

/** Strip the entities the India registry titles are authored with. */
function text(s: string): string {
  return s.replace(/&amp;/g, '&').replace(/&#8217;/g, '’');
}

export function servicesPreset(region: string): MegaPreset {
  const all = vxnServices(region);
  const withSubs = all.filter((s) => (s.subs?.length ?? 0) > 0);

  /* THE TABS ARE THE SERVICES where the services have children (the UAE),
     each pane listing that service's own sub-pages. Where they have none
     (India), the one tab is the practice and the pane lists the services
     themselves — the same sheet, one level up. */
  const groups: MegaGroup[] = withSubs.length
    ? withSubs.map((s) => ({
        key: s.slug ?? s.href,
        label: UAE_TAB_LABEL[s.slug ?? ''] ?? text(vxnServiceName(s)),
        href: s.href,
        links: (s.subs ?? []).map((sub) => ({ name: sub.name, href: `/services/${s.slug}/${sub.slug}/` })),
        viewAll: { label: `View all ${text(vxnServiceName(s))}`, href: s.href },
      }))
    : [
        {
          key: 'services',
          label: 'Advisory Services',
          href: '/services/',
          links: all.map((s) => ({ name: text(vxnServiceName(s)), href: s.href })),
          viewAll: { label: 'View all services', href: '/services/' },
        },
      ];

  return {
    label: 'Services',
    href: '/services/',
    aside: {
      title: 'Services',
      lede:
        region === 'en-ae'
          ? 'Valunxt brings accounting, tax, valuation, real estate and technology under one accountable partner, so every number you act on holds up to scrutiny.'
          : 'Every discipline under one roof, so a decision is advised, financed and executed by the same team.',
      linkLabel: 'Learn More',
      linkHref: '/services/',
      /* Off the client photograph too (20260917) — see PLAIN, THE OTHER ASIDE
         in UaeServicesMega.tsx. */
      plain: true,
    },
    groups,
    closeLabel: 'Close the services menu',
  };
}

/* ---------------------------------------------------------------------------
   ABOUT
   --------------------------------------------------------------------------- */

export interface AboutLink extends MegaLink {
  /** The one line under the link's name. Plain text. */
  text: string;
}

export interface AboutColumn {
  key: string;
  title: string;
  links: AboutLink[];
}

export interface AboutPreset {
  label: string;
  href: string;
  columns: AboutColumn[];
  feature: {
    /** The third column's heading, over the card. */
    heading: string;
    title: string;
    text: string;
    /** The figure on the card's artwork. */
    stat: { value: string; label: string };
    link: { label: string; href: string };
  };
  closeLabel: string;
}

/**
 * The About panel.
 *
 * EVERY LINK IS A PAGE THIS SITE PUBLISHES, in both markets. The references
 * list leadership, news and awards pages; this site has none to link (its
 * /about/leadership/ and /track-record/ 404 until their data files are filled),
 * so the columns carry the About family instead: Who We Are, Careers and FAQ,
 * which the old dropdown listed, and the three pages that say who Valunxt works
 * with and how to reach it.
 *
 * THE WORDS. The card is the client's own copy from the home document (the
 * Expertise band's title, sentence and link, and its "Years of Expertise"
 * figure label). The link lines are drafted, each from its page's own lede or
 * meta description, shortened and with no dashes; the column headings and
 * "Our Legacy" are drafted too. Who We Are reads the UAE home's positioning on
 * /en-ae/ and the About page's own on /en-in/. The markets and the office
 * cities come from site-data.ts, as everything that states them must.
 */
export function aboutPreset(region: string): AboutPreset {
  return {
    label: 'About',
    href: '/about/',
    columns: [
      {
        key: 'firm',
        title: 'Our Firm',
        links: [
          {
            name: 'Who We Are',
            href: '/about/',
            text:
              region === 'en-ae'
                ? 'One accountable partner for business, property and investment advisory in the UAE.'
                : `A real estate wealth, capital, intelligence and technology group across ${vxnMarkets('short')}.`,
          },
          {
            name: 'Clients',
            href: '/clients/',
            text: 'The investors, families, developers and institutions we advise.',
          },
        ],
      },
      {
        key: 'work',
        title: 'Work With Us',
        links: [
          {
            name: 'Careers',
            href: '/about/careers/',
            text: `Build a career with purpose across ${vxnMarkets('short')}.`,
          },
          {
            name: 'FAQ',
            href: '/faq/',
            text: 'Common questions on mandates, valuation, the group and how we are paid.',
          },
          {
            name: 'Contact Us',
            href: '/contact/',
            text: `Speak to our advisory team in ${vxnMarkets('cities')}.`,
          },
        ],
      },
    ],
    feature: {
      heading: 'Our Legacy',
      title: 'Expertise Measured in Decades.',
      text: '48+ years of expertise. 200+ years of combined experience. 10+ industries served. A depth of knowledge brought to every business, property and investment mandate.',
      stat: { value: '48+', label: 'Years of Expertise' },
      link: { label: 'About Valunxt', href: '/about/' },
    },
    closeLabel: 'Close the about menu',
  };
}

export function insightsPreset(): MegaPreset {
  return {
    label: 'Insights',
    href: '/blogs/',
    aside: {
      title: 'Insights',
      lede: 'Independent research, market commentary and the thinking behind our advice.',
      linkLabel: 'Read the latest',
      linkHref: '/blogs/',
      plain: true,
    },
    groups: [
      {
        key: 'insights',
        label: 'Insights & Intelligence',
        href: '/blogs/',
        links: [
          { name: 'Research & Reports', href: '/research/' },
          { name: 'Blogs', href: '/blogs/' },
          { name: 'Community', href: '/community/' },
          { name: 'Clients', href: '/clients/' },
          { name: 'Partnership', href: '/partnership/' },
        ],
        viewAll: { label: 'View all insights', href: '/blogs/' },
      },
    ],
    closeLabel: 'Close the insights menu',
  };
}
