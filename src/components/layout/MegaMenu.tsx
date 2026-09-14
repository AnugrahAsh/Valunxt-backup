/**
 * Shared editorial mega-menu panel.
 *
 * Attach to a nav item with:
 *   preset    — 'insights' (default) | 'services'
 *   tabIndex  — -1 for the hidden mobile/sticky nav copies
 *   label     — optional override for the parent link text
 *   href      — optional override for the parent target (relative to the region)
 * All three menus share the exact same UI; only the preset content differs.
 *
 * Layout is two regions on one full-bleed white sheet: an index region on the
 * left (section title, lede, the two-up link list, and the ruled "view all" CTA
 * at its foot) and a pair of promo cards on the right.
 *
 * The icons live in MegaIcons.tsx and the services accordion in
 * MegaAccordion.tsx. The accordion is a client component and this file imports
 * the region registry, which is the whole reason the three are not one module:
 * importing MegaMenu from the accordion would drag every service, company and
 * region record in the site into the browser bundle.
 *
 * Port of includes/partials/more-mega.php.
 */
import { rurl, vxnServices } from '@/lib/region';
import Html from '@/components/Html';
import MegaAccordion, { type MegaAccordionGroup } from './MegaAccordion';
import { MegaArrow, MegaIcon } from './MegaIcons';

export type MegaPreset = 'insights' | 'services';

interface MegaSubLink {
  /** Plain text — SubService.name is documented as such, so no <Html>. */
  t: string;
  href: string;
}
interface MegaLink {
  t: string;
  href: string;
  icon: string;
  d: string;
  /** The pages beneath this one. UAE services only; everything else is flat. */
  subs?: MegaSubLink[];
}
interface MegaCard {
  eyebrow: string;
  title: string;
  href: string;
  img: string;
  cta: string;
}
interface MegaContent {
  label: string;
  href: string;
  title: string;
  lede: string;
  sidehead: string;
  links: MegaLink[];
  cards: MegaCard[];
  viewall: string;
  viewall_label: string;
}

function preset(key: MegaPreset, region: string): MegaContent {
  if (key === 'services') {
    /* Built from vxnServices() so the menu names whatever the visitor's market
       actually leads with — the UAE's six services in the UAE edition, the
       group's four verticals in India — and can't drift from the home page. */
    const services = vxnServices(region);
    return {
      label: 'Services',
      href: '/services/',
      title: 'Advisory Services',
      /* Deliberately not "four disciplines" / "six services": the list is
         per-market, and a counted lede goes stale the moment one is added. */
      lede: 'Every discipline under one roof, so a decision is advised, financed and executed by the same team.',
      sidehead: 'Explore services',
      /* The sub-service pages come from the same registry entry as the service
         above them, so the menu cannot list a page that does not exist — and a
         seventh sub added to vxnServices() appears here with no edit. The URL
         is assembled rather than stored because that is exactly the shape
         /services/[service]/[sub]/ resolves, and storing it twice is how the
         two would eventually disagree.

         `subs` is UAE-only. India's four verticals carry none, so its menu
         renders the flat list below with no branching of its own. */
      links: services.map((s) => ({
        t: s.title,
        href: s.href,
        icon: s.icon ?? 'document',
        d: s.desc ?? '',
        subs:
          s.slug && s.subs?.length
            ? s.subs.map((sub) => ({ t: sub.name, href: `/services/${s.slug}/${sub.slug}/` }))
            : undefined,
      })),
      /* The two cards mirror the first two entries of the list they sit beside,
         so a change to the registry carries into them without a second edit. */
      cards: services.slice(0, 2).map((s) => ({
        eyebrow: 'Advisory',
        title: s.short ?? s.title,
        href: s.href,
        img: s.img,
        cta: 'Discover',
      })),
      viewall: '/services/',
      viewall_label: 'View all services',
    };
  }

  return {
    label: 'Insights',
    href: '/blogs/',
    title: 'Insights &amp; Intelligence',
    lede: 'Independent research, market commentary and the thinking behind our advice.',
    sidehead: 'Explore',
    links: [
      {
        t: 'Research &amp; Reports',
        href: '/research/',
        icon: 'chart',
        d: 'Market intelligence and investment research',
      },
      { t: 'Blogs', href: '/blogs/', icon: 'pen', d: 'Commentary from our advisory desks' },
      { t: 'Community', href: '/community/', icon: 'users', d: 'Where we invest beyond the mandate' },
      { t: 'Clients', href: '/clients/', icon: 'shield', d: 'Who we act for, and how we act' },
      {
        t: 'Partnership',
        href: '/partnership/',
        icon: 'globe',
        d: 'Working with us across markets',
      },
    ],
    cards: [
      {
        eyebrow: 'Featured',
        title: 'Research &amp; Reports',
        href: '/research/',
        img: '/assets/content/uploads/new-folder/insights-1.webp',
        cta: 'Discover',
      },
      {
        eyebrow: 'Commentary',
        title: 'Market Insight',
        href: '/blogs/',
        img: '/assets/content/uploads/new-folder/insights-2.webp',
        cta: 'Discover',
      },
    ],
    viewall: '/blogs/',
    viewall_label: 'View all insights',
  };
}

export default function MegaMenu({
  region,
  presetKey = 'insights',
  tabIndex,
  label,
  href,
}: {
  region: string;
  presetKey?: MegaPreset;
  /** -1 for the hidden mobile/sticky nav copies. */
  tabIndex?: number;
  label?: string;
  href?: string;
}) {
  const p = preset(presetKey, region);
  const parentLabel = label && label !== '' ? label : p.label;
  const parentHref = rurl(region, href && href !== '' ? href : p.href);
  const tab = tabIndex === -1 ? { tabIndex: -1 } : {};

  /* Two shapes of index, chosen by the content rather than by the preset key:
     a menu whose entries have children is a directory and renders as the
     accordion — each entry a row, its pages folded into a drawer beneath it;
     one whose entries do not is a short list and keeps the two-up rows with a
     blurb under each. Read off the links so the UAE services menu picks up the
     accordion and India's four verticals — same preset, no subs — keep the
     rows, with nothing here naming a market. */
  const grouped = p.links.some((l) => l.subs && l.subs.length > 0);

  /* Region-prefixed here rather than inside the accordion: rurl() reads the
     region registry, and the accordion runs in the browser. What crosses the
     boundary is finished data — strings, no functions, nothing to resolve. */
  const groups: MegaAccordionGroup[] = grouped
    ? p.links.map((l) => ({
        t: l.t,
        href: rurl(region, l.href),
        icon: l.icon,
        /* `d` is not carried across. The accordion's rows are half the rail
           wide and drop the blurb; sending it anyway would put six sentences
           into the client payload for nothing. The flat list below still
           renders it. */
        subs: (l.subs ?? []).map((s) => ({ t: s.t, href: rurl(region, s.href) })),
      }))
    : [];

  return (
    <li className="menu-item menu-item-type-post_type menu-item-object-page menu-item-has-children vxn-mega">
      <a
        href={parentHref}
        className="elementor-item"
        {...tab}
        dangerouslySetInnerHTML={{ __html: parentLabel }}
      />
      <ul className="sub-menu elementor-nav-menu--dropdown vxn-mega__panel">
        <li className="vxn-mega__wrap">
          <div className={`vxn-mega__inner${grouped ? ' vxn-mega__inner--grouped' : ''}`}>
            <div className="vxn-mega__main">
              <div className="vxn-mega__intro">
                <Html as="span" className="vxn-mega__kicker" html={p.sidehead} />
                <Html as="span" className="vxn-mega__head" html={p.title} />
                <Html as="span" className="vxn-mega__lede" html={p.lede} />
              </div>

              {grouped ? (
                <MegaAccordion groups={groups} tabIndex={tabIndex} />
              ) : (
                <div className="vxn-mega__list">
                  {p.links.map((l) => (
                    <a
                      key={l.href + l.t}
                      className="vxn-mega__item"
                      href={rurl(region, l.href)}
                      {...tab}
                    >
                      <span className="vxn-mega__ico" aria-hidden="true">
                        <MegaIcon token={l.icon} />
                      </span>
                      <span className="vxn-mega__itembody">
                        <Html as="span" className="vxn-mega__itemtitle" html={l.t} />
                        {l.d ? <Html as="span" className="vxn-mega__itemdesc" html={l.d} /> : null}
                      </span>
                      <i className="vxn-mega__chev" aria-hidden="true">
                        &rsaquo;
                      </i>
                    </a>
                  ))}
                </div>
              )}

              <a className="vxn-mega__viewall" href={rurl(region, p.viewall)} {...tab}>
                <Html as="span" className="vxn-mega__viewalltxt" html={p.viewall_label} />
                <MegaArrow />
              </a>
            </div>

            {p.cards.length ? (
              <div className="vxn-mega__cards">
                {p.cards.map((c) => (
                  <a
                    key={c.href + c.title}
                    className="vxn-mega__card"
                    href={rurl(region, c.href)}
                    {...tab}
                  >
                    <Html as="span" className="vxn-mega__eyebrow" html={c.eyebrow} />
                    <Html as="span" className="vxn-mega__cardtitle" html={c.title} />
                    <span className="vxn-mega__cardmedia">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={c.img} alt="" loading="lazy" />
                    </span>
                    <span className="vxn-mega__cardcta">
                      <Html as="span" className="vxn-mega__cardctatxt" html={c.cta} />
                      <MegaArrow />
                    </span>
                  </a>
                ))}
              </div>
            ) : null}
          </div>
        </li>
      </ul>
    </li>
  );
}
