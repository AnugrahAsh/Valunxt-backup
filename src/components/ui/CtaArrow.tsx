/**
 * THE ONE ARROW (20260914, client).
 *
 * Every call to action on the site ends in this glyph: the theme's own
 * arrow-right from the theme-icons font, which is what the Elementor buttons
 * and the band pills were already drawing. It replaces the hand-drawn SVG
 * arrows the UAE sections carried, so one CTA cannot look sharper or heavier
 * than the next. The size and the hover nudge live on `.vxn-cta__arrow` in
 * valunxt-brand.css (THE ONE ARROW), next to the pill geometry.
 */
export default function CtaArrow() {
  return <i aria-hidden="true" className="vamtamtheme- vamtam-theme-arrow-right vxn-cta__arrow" />;
}
