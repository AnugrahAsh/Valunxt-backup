/**
 * The Valunxt wordmark.
 *
 * These are the group's actual logo files — `valunxt-dark.svg` and
 * `valunxt-white.svg`, the same two the main site's header serves — copied into
 * the module at public/real-estate/img/brand/. An earlier version of this file
 * rebuilt the letterforms as inline paths; that was wrong. The real asset is
 * the real asset.
 *
 * Both variants are rendered and CSS swaps them, rather than switching `src` in
 * JavaScript: the header flips between light and dark as the page scrolls past
 * the hero, and re-fetching an image mid-transition shows a blank frame.
 */

export default function Wordmark({ className }: { className?: string }) {
  return (
    <span className={`re-mark${className ? ` ${className}` : ''}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="re-mark__dark" src="/real-estate/img/brand/valunxt-dark.svg" alt="Valunxt" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="re-mark__light" src="/real-estate/img/brand/valunxt-white.svg" alt="" aria-hidden="true" />
    </span>
  );
}
