/**
 * "Expertise Measured in Decades.", the About band on /en-ae/ (20260915).
 *
 * Built to the reference the client supplied that day, measured off it at
 * 1717px: copy on the deep brand blue at the left (eyebrow with a short rule,
 * the two-line title, the sentence, three figures with icons between
 * hairlines, and a text link), and at the right a boardroom photograph cut to
 * a wedge that runs off the top and right edges, its left corner rounded,
 * traced by a thin light-blue line set about 38px outside it.
 *
 * CLIENT PASS, 20260915: the title is all white (the reference set its last
 * word in light blue), and the accent bar under the title and the underline
 * under the link are gone.
 *
 * OFF THE PAGE, 20260915 (client, later that day): HomeAeBody no longer
 * renders this band. The component, its motion groups and section 21 of the
 * stylesheet stay, so putting it back is the one line in HomeAeBody.
 *
 * IT REPLACES THE CAREERS BAND (CareersBand in UaeImpactBands.tsx), which
 * carried the same title, sentence and link on a cream split. The words are
 * the client's home document, unchanged; the eyebrow and the three figure
 * labels are the reference's own. Switch back: render <CareersBand> again in
 * UaeImpactBands' default export and drop this band from HomeAeBody.
 *
 * THE PHOTOGRAPH is the reference's own, cut from it as
 * uae/home/expertise-boardroom.webp (945 x 846). Only the wedge was ever
 * visible, so the clip below is the reference's wedge exactly: its edges were
 * fitted to the picture (the diagonal at 44.6 degrees, the foot at 9.5), set
 * 2.5px inside so no blue fringe from the cut shows. Dropping a sharper
 * original in at that path takes over with no other change.
 *
 * GEOMETRY. The art is drawn in the reference's own pixels (viewBox from
 * x 680 to 1717, the full 916 height), and the stylesheet sizes the whole band
 * in those pixels too, one reference pixel being the band's width / 1717 up
 * to 1920. The outline's corner is a cubic fitted to the reference's line
 * (0.3px RMS over eighteen points).
 *
 * Styles: assets/css/valunxt-landing.css (section 21, .vxn-xp). Motion:
 * UaeBandMotion.tsx (the copy arrives in sequence and the figures roll).
 */
import { rurl } from '@/lib/region';
import { rimgFirst } from '@/lib/region-assets';
import { brandCase } from '@/components/ui/BrandName';
import CtaArrow from '@/components/ui/CtaArrow';

/** The wedge the photograph shows through, in reference pixels. */
const WEDGE = 'M1452.5-2H1720V843.3L799.5 690Q773.9 685.7 792.2 667.2Z';

/** The thin line outside it: the diagonal, the fitted corner, the foot. */
const OUTLINE = 'M1397.9-5 814.1 587.8C774.5 627.9 686.8 722.7 776.1 741.5L1720 940.5';

/* The three icons, drawn to fill the reference's 46 x 40 box with its
   outline weight: two people at a laptop, two buildings on a ground line,
   a pie with its slice lifted out and an arrow. */
function IconPeople() {
  return (
    <svg viewBox="0 0 46 40" aria-hidden="true" focusable="false">
      <circle cx="14" cy="9.5" r="8" />
      <path d="M26.2 3.1a8 8 0 1 1 3.3 14.3" />
      <path d="M2 38.5v-4.5a12 12 0 0 1 12-12h1a12 12 0 0 1 12 12v4.5" />
      <path d="M30 22h2a12 12 0 0 1 12 12v4.5" />
      <path d="M9.5 38.5V33a1.5 1.5 0 0 1 1.5-1.5h7a1.5 1.5 0 0 1 1.5 1.5v5.5" />
    </svg>
  );
}

function IconBuildings() {
  return (
    <svg viewBox="0 0 46 40" aria-hidden="true" focusable="false">
      <path d="M1.5 38.5h43" />
      <path d="M5 38.5V3a1.5 1.5 0 0 1 1.5-1.5h16A1.5 1.5 0 0 1 24 3v35.5" />
      <path d="M24 12.5h14.5A1.5 1.5 0 0 1 40 14v24.5" />
      <path d="M10.5 8h2.5M16 8h2.5M10.5 14.5h2.5M16 14.5h2.5M10.5 21h2.5M16 21h2.5" />
      <path d="M32 18.5v12" />
      <path d="M12 38.5v-7h5v7" />
    </svg>
  );
}

function IconChart() {
  return (
    <svg viewBox="0 0 46 40" aria-hidden="true" focusable="false">
      <path d="M18.5 5.5a16.5 16.5 0 1 0 16.5 16.5H18.5Z" />
      <path d="M23 1.5A16.5 16.5 0 0 1 39.5 18H23Z" />
      <path d="M31.5 30.5 44 38.5M44 38.5h-6.5M44 38.5V32" />
    </svg>
  );
}

const STATS = [
  { value: '48+', label: ['Years of', 'Expertise'], Icon: IconPeople },
  { value: '200+', label: ['Years Combined', 'Experience'], Icon: IconBuildings },
  { value: '10+', label: ['Industries', 'Served'], Icon: IconChart },
];

export default function UaeExpertiseBand({ region }: { region: string }) {
  const photo = rimgFirst(region, ['uae/home/expertise-boardroom.webp', 'uae/home/expertise-inset.webp']);

  return (
    <section className="vxn-xp" aria-labelledby="vxn-xp-title">
      <div className="vxn-xp__art">
        <svg
          viewBox="680 0 1037 916"
          preserveAspectRatio="xMaxYMin meet"
          role="img"
          aria-label="Valunxt team around a boardroom table"
          focusable="false"
        >
          <defs>
            <clipPath id="vxn-xp-wedge">
              <path d={WEDGE} />
            </clipPath>
            <radialGradient id="vxn-xp-glow" gradientUnits="userSpaceOnUse" cx="860" cy="560" r="780">
              <stop offset="0" stopColor="#6FD0FF" />
              <stop offset=".35" stopColor="#3E9DF7" stopOpacity=".92" />
              <stop offset=".7" stopColor="#1C66DC" stopOpacity=".6" />
              <stop offset="1" stopColor="#0B45C0" stopOpacity=".25" />
            </radialGradient>
          </defs>
          <image
            className="vxn-xp__photo"
            href={photo}
            x="772"
            y="0"
            width="945"
            height="846"
            preserveAspectRatio="xMidYMid slice"
            clipPath="url(#vxn-xp-wedge)"
          />
          <path className="vxn-xp__outline" d={OUTLINE} stroke="url(#vxn-xp-glow)" />
        </svg>
      </div>

      <div className="vxn-xp__inner">
        <div className="vxn-xp__copy">
          {/* The words in their own span: the eyebrow is a flex row (words,
              then the rule), and brandCase() returns loose fragments that
              would each become a flex item and lose the space between them. */}
          <span className="vxn-xp__eyebrow">
            <span>{brandCase('About Valunxt')}</span>
          </span>
          {/* All white since 20260915 (client): "Decades." is no longer in the
              light blue, and the accent bar that sat under the title is gone. */}
          <h2 id="vxn-xp-title" className="vxn-xp__title">
            Expertise Measured
            <br />
            in Decades.
          </h2>
          <p className="vxn-xp__lede">
            48+ years of expertise. 200+ years of combined experience. 10+ industries served. A
            depth of knowledge brought to every business, property and investment mandate.
          </p>
          <ul className="vxn-xp__stats">
            {STATS.map(({ value, label, Icon }) => (
              <li key={value} className="vxn-xp__stat">
                <span className="vxn-xp__icon">
                  <Icon />
                </span>
                <span className="vxn-xp__num" data-vxn-count={value}>
                  {value}
                </span>
                <span className="vxn-xp__lbl">
                  {label[0]}
                  <br />
                  {label[1]}
                </span>
              </li>
            ))}
          </ul>
          <a className="vxn-xp__link" href={rurl(region, '/about/')}>
            About Valunxt
            <CtaArrow />
          </a>
        </div>
      </div>
    </section>
  );
}
