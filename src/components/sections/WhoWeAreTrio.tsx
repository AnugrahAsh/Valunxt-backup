/**
 * The three feature cards that close the "Who We Are" section on both home
 * pages — India's `.vxn-wwa` block and the UAE's `.vxn-plat` block.
 *
 * Added below whatever that section already had; nothing above is touched, so
 * no copy is lost. The middle card is the brand gradient; the outer two are cream cards.
 * Every card links somewhere that exists.
 *
 * WHAT FILLS THE BRAND CARD IS PER EDITION. India keeps the wordmark's x as a
 * window onto a photograph, on the gradient. The UAE takes a texture across
 * the whole card instead, by request — set `texture` on that edition's brand
 * card and the plate goes behind everything and the x is not rendered. It is a
 * field rather than a region check, so the two editions do not have to be read
 * together to know which one you are looking at.
 *
 * The copy differs per edition — the UAE leads with business, property and
 * investment advisory, India with the four investment verticals — so the
 * content lives here keyed by region rather than being passed down from two
 * nearly identical call sites. The UAE cards are the client's home-page
 * document (20260911); the middle card is the one it left unchanged.
 *
 * Styles: assets/css/valunxt-landing.css (.vxn-trio).
 */
import { rurl } from '@/lib/region';
import { rimg, rimgFirst } from '@/lib/region-assets';
import { LogoXWindow } from '@/components/brand/LogoX';

/** A path, or candidates in preference order: the first file that exists wins. */
type ImgSrc = string | readonly string[];

const srcOf = (region: string, img: ImgSrc) => rimgFirst(region, ([] as string[]).concat(img));

interface TrioCard {
  tag: string;
  title: React.ReactNode;
  href: string;
  /** Omitted on the gradient card, which shows the x window instead. */
  img?: ImgSrc;
  alt?: string;
}

interface TrioContent {
  left: TrioCard;
  /**
   * The gradient card. `img` is the photograph seen through the x — unless
   * `texture` is set, in which case that plate fills the slot and the x is not
   * drawn at all.
   */
  brand: TrioCard & { img: string; texture?: ImgSrc };
  right: TrioCard;
}

const CONTENT: Record<string, TrioContent> = {
  'en-in': {
    left: {
      tag: 'Who We Are',
      title: 'One Accountable Partner for Real Estate Wealth, Capital & Intelligence',
      href: '/about/',
      img: 'homepage/Integrated-Platform.webp',
      alt: 'Advisory team reviewing portfolio performance',
    },
    brand: {
      tag: 'The Group',
      title: 'RICS-Compliant Valuations Through Group Firm Reliant Surveyors',
      href: '/about/',
      img: 'homepage/research-and-intellegance.webp',
    },
    right: {
      tag: 'Guide',
      title: 'Market Intelligence: What to Establish Before Every Property Investment',
      href: '/services/research-intelligence/',
      img: 'homepage/building-real-esate.webp',
      alt: 'Commercial towers seen from street level',
    },
  },
  /* The client's artwork for these three cards (20260913) lives in
     uploads/uae/home/ and leads each list; the stand-in behind it is what
     shows if that file is ever missing. */
  'en-ae': {
    left: {
      tag: 'Who We Are',
      title: 'One Accountable Partner for Business, Property & Investment Advisory in the UAE',
      href: '/about/',
      img: ['uae/home/who-we-are.webp', 'services/accounting-and-tax-services.webp'],
      alt: 'Adviser shaking hands with a client',
    },
    brand: {
      tag: 'The Group',
      title: 'RICS-Compliant Valuations Through Group Firm Reliant Surveyors',
      href: '/services/valuation-and-advisory/',
      /* Unused while `texture` is set; kept so removing the texture restores
         the x window without hunting for a photograph. */
      img: 'services/valuation-and-advisory.webp',
      texture: ['uae/home/the-group.webp', 'banners/texture-2.webp'],
    },
    right: {
      tag: 'Why VALUNXT',
      title: 'Evidence-Led Advice. Built Around Your Goals.',
      href: '/about/',
      img: ['uae/home/why-choose-us.webp', 'banners/uae-slider-3.webp'],
      alt: 'Advisory team reviewing reports in a Dubai office',
    },
  },
};

/** The corner affordance, repeated on every card. */
function GoArrow() {
  return (
    <span className="vxn-trio__go" aria-hidden="true">
      <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M4.5 11.5L11.5 4.5M11.5 4.5H5.5M11.5 4.5V10.5"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

/** One of the two cream cards: pill and arrow, heading, photograph at the foot. */
function PlainCard({ region, card }: { region: string; card: TrioCard }) {
  return (
    <a className="vxn-trio__card" href={rurl(region, card.href)}>
      <div className="vxn-trio__top">
        <span className="vxn-trio__tag">{card.tag}</span>
        <GoArrow />
      </div>
      <h3 className="vxn-trio__title">{card.title}</h3>
      {card.img ? (
        <div className="vxn-trio__media">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={srcOf(region, card.img)} alt={card.alt ?? ''} loading="lazy" />
        </div>
      ) : null}
    </a>
  );
}

export default function WhoWeAreTrio({ region }: { region: string }) {
  const c = CONTENT[region] ?? CONTENT['en-in']!;

  return (
    <div className="vxn-trio">
      <PlainCard region={region} card={c.left} />

      <a className="vxn-trio__card vxn-trio__card--brand" href={rurl(region, c.brand.href)}>
        {/* THE PLATE IS THE CARD, not a panel inside it: absolutely positioned
            behind everything, so the tag, the arrow and the heading sit on the
            texture rather than beside it. Decorative — the heading is the
            card's whole message. */}
        {c.brand.texture ? (
          <div className="vxn-trio__tex" aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={srcOf(region, c.brand.texture)} alt="" loading="lazy" />
          </div>
        ) : null}

        <div className="vxn-trio__top">
          <span className="vxn-trio__tag">{c.brand.tag}</span>
          <GoArrow />
        </div>

        {/* No x where a texture fills the card — there is nothing left for it
            to be a window onto. */}
        {c.brand.texture ? null : (
          <div className="vxn-trio__x">
            <LogoXWindow src={rimg(region, c.brand.img)} />
          </div>
        )}

        <h3 className="vxn-trio__title">{c.brand.title}</h3>
      </a>

      <PlainCard region={region} card={c.right} />
    </div>
  );
}
