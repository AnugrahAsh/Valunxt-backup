'use client';

/**
 * One location on a map. Leaflet over OpenStreetMap, the same stack the
 * landing page's area map and the site's office map use, so no API key and
 * no second mapping dependency.
 *
 * Loaded only through next/dynamic(ssr: false) from LocationBody, because
 * Leaflet reads `window` at import time.
 *
 * `precise` is what the pin means. At 'plot' the marker is the building or
 * the community centre and the map opens close in. At 'district' the desk
 * has not confirmed the exact plot, so the map opens wider and the caller
 * prints a note under it — an approximate pin that says so is useful, a
 * confident pin in the wrong place is not.
 */
import { useEffect, useRef } from 'react';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function LocationMap({
  lat,
  lng,
  name,
  precise = true,
}: {
  lat: number;
  lng: number;
  name: string;
  precise?: boolean;
}) {
  const el = useRef<HTMLDivElement & { _leaflet_id?: number }>(null);

  useEffect(() => {
    const host = el.current;
    if (!host || host._leaflet_id) return;

    const map = L.map(host, {
      center: [lat, lng],
      zoom: precise ? 14 : 12,
      minZoom: 9,
      maxZoom: 18,
      scrollWheelZoom: false,
      zoomControl: true,
      attributionControl: false,
    });
    L.control.attribution({ position: 'bottomleft', prefix: false }).addTo(map);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    const marker = L.marker([lat, lng], {
      title: name,
      icon: L.divIcon({
        className: 're-loc-pinwrap',
        html: '<span class="re-loc-pin"></span>',
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      }),
    }).addTo(map);
    marker.bindPopup(precise ? name : `${name} — approximate`);

    /* An approximate pin gets a radius rather than a false point. */
    if (!precise) {
      L.circle([lat, lng], {
        radius: 900,
        color: '#0053B7',
        weight: 1,
        opacity: 0.5,
        fillColor: '#0053B7',
        fillOpacity: 0.08,
      }).addTo(map);
    }

    const kick = () => map.invalidateSize();
    const raf = requestAnimationFrame(kick);
    const ro = new ResizeObserver(kick);
    ro.observe(host);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      map.remove();
    };
  }, [lat, lng, name, precise]);

  return <div className="re-loc-map" ref={el} role="application" aria-label={`Map showing ${name}`} />;
}
