'use client';

/**
 * The actual Leaflet map. Kept in its own file, loaded only through
 * `next/dynamic(() => import('./OfficeMap'), { ssr: false })` in
 * ContactWorldMap.tsx, because Leaflet reads `window` the moment its module is
 * evaluated, not only when a map is created — and a plain 'use client'
 * component is still server-rendered once for its initial HTML in the App
 * Router. Only a dynamic import with `ssr: false` skips that pass, and Next's
 * own docs are explicit that the flag only takes effect called from a Client
 * Component, which is the whole of what ContactWorldMap.tsx is for. Because
 * that guarantee already keeps this module off the server, `leaflet` and its
 * stylesheet are imported the plain, static way below — an `await import()`
 * inside a `useEffect` would be redundant, and a CSS file is not something
 * Next's bundler resolves as a dynamic import target.
 *
 * WHY LEAFLET AND OPENSTREETMAP, AND NOT GOOGLE MAPS: a real, pannable,
 * zoomable map — scroll to zoom, drag to pan, the familiar +/- controls — with
 * no Maps API key or billing account tied to this repository. Leaflet is the
 * tile renderer; OpenStreetMap's standard tile set is the map itself, free to
 * use here under its own tile usage policy, which the attribution control
 * below satisfies.
 */

import { useEffect, useRef } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { LogoXGlyph } from '@/components/brand/LogoX';

export interface OfficeMarker {
  key: string;
  /** The name shown on the pin and in the popup. */
  label: string;
  lat: number;
  lng: number;
  /** A short descriptor under the name — the office's `note` (e.g. "BKC"). */
  note: string;
  address: string;
  /** Opens the same Google Maps link the office cards elsewhere use. */
  mapHref: string;
}

/** The pin: a white disc holding the wordmark's "x" — the same mark
    WhoWeAreTrio and ProofBand use elsewhere — rather than a generic map
    teardrop, so the four cities read as Valunxt's own. Built once as a string,
    not a client render: Leaflet's DivIcon wants HTML, not a React tree. */
const PIN_HTML = renderToStaticMarkup(
  <span className="vxn-omap__pin">
    <LogoXGlyph className="vxn-omap__pinx" />
  </span>,
);

const ICON = L.divIcon({
  className: 'vxn-omap__icon',
  html: PIN_HTML,
  iconSize: [34, 34],
  iconAnchor: [17, 30],
  popupAnchor: [0, -28],
});

function popupHtml(m: OfficeMarker): string {
  const esc = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  return (
    `<div class="vxn-omap__pop">` +
    `<span class="vxn-omap__popcity">${esc(m.label)}</span>` +
    `<span class="vxn-omap__popnote">${esc(m.note)}</span>` +
    `<p class="vxn-omap__popaddr">${esc(m.address)}</p>` +
    `<a class="vxn-omap__popgo" href="${esc(m.mapHref)}" target="_blank" rel="noopener">Get directions &rarr;</a>` +
    `</div>`
  );
}

export default function OfficeMap({ markers }: { markers: OfficeMarker[] }) {
  const elRef = useRef<HTMLDivElement & { _leaflet_id?: number }>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;

    /* React 18/19 Strict Mode mounts effects twice in development; Leaflet
       throws "Map container is already initialized" if a second map is built
       on a container the first never released. The cleanup below always tears
       the first one down before this re-runs, but the guard costs nothing and
       protects against a stray remount too. */
    if (el._leaflet_id) return;

    const map = L.map(el, {
      center: [18, 45],
      zoom: 2,
      minZoom: 2,
      maxZoom: 18,
      scrollWheelZoom: true,
      worldCopyJump: true,
    });
    mapRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    markers.forEach((m) => {
      L.marker([m.lat, m.lng], { icon: ICON, alt: m.label, title: m.label })
        .addTo(map)
        .bindPopup(popupHtml(m), { closeButton: true, className: 'vxn-omap__popwrap' });
    });

    /* Leaflet measures its container once, on creation. A section still
       settling into place from the page's own reveal animation, or a late
       web-font swap, can leave that measurement short — invalidateSize asks it
       to measure again, which is also what keeps a later window resize from
       leaving the tiles short of the box. */
    const kick = () => map.invalidateSize();
    const raf = requestAnimationFrame(kick);
    const t = window.setTimeout(kick, 300);
    const ro = new ResizeObserver(kick);
    ro.observe(el);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(t);
      ro.disconnect();
      map.remove();
      mapRef.current = null;
    };
  }, [markers]);

  return (
    <div
      ref={elRef}
      className="vxn-omap__stage"
      role="application"
      aria-label="Interactive map of Valunxt's offices"
    />
  );
}
