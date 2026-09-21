'use client';

/**
 * The Dubai area map. Leaflet over a light OpenStreetMap tile set, with a
 * brand pin per community that grows when its card is hovered and fills when
 * selected. Loaded only through next/dynamic(ssr: false) from Areas.tsx.
 */
import { useEffect, useRef } from 'react';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import type { Area } from '../../data/landing';

const DUBAI: L.LatLngTuple = [25.12, 55.23];

function icon(state: 'idle' | 'hover' | 'on', label: string) {
  return L.divIcon({
    className: `re-l-pinwrap is-${state}`,
    html: `<span class="re-l-pin"><i></i><b>${label.replace(/</g, '&lt;')}</b></span>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

export default function AreasMap({
  areas,
  active,
  hover,
  onSelect,
}: {
  areas: Area[];
  active: string;
  hover: string | null;
  onSelect: (key: string) => void;
}) {
  const el = useRef<HTMLDivElement & { _leaflet_id?: number }>(null);
  const map = useRef<L.Map | null>(null);
  const markers = useRef<Map<string, L.Marker>>(new Map());

  useEffect(() => {
    const host = el.current;
    if (!host || host._leaflet_id) return;
    const m = L.map(host, {
      center: DUBAI,
      zoom: 11,
      minZoom: 10,
      maxZoom: 15,
      scrollWheelZoom: false,
      zoomControl: true,
      /* Attribution goes bottom-left: the area card sits bottom-right. */
      attributionControl: false,
    });
    map.current = m;
    L.control.attribution({ position: 'bottomleft', prefix: false }).addTo(m);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(m);

    areas.forEach((a) => {
      const mk = L.marker([a.lat, a.lng], { icon: icon('idle', a.name), title: a.name, riseOnHover: true }).addTo(m);
      mk.on('click', () => onSelect(a.key));
      markers.current.set(a.key, mk);
    });

    const kick = () => m.invalidateSize();
    const raf = requestAnimationFrame(kick);
    const ro = new ResizeObserver(kick);
    ro.observe(host);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      m.remove();
      map.current = null;
      markers.current.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    areas.forEach((a) => {
      const mk = markers.current.get(a.key);
      if (!mk) return;
      const state = a.key === active ? 'on' : a.key === hover ? 'hover' : 'idle';
      mk.setIcon(icon(state, a.name));
      mk.setZIndexOffset(state === 'on' ? 1000 : state === 'hover' ? 500 : 0);
    });
    const m = map.current;
    const a = areas.find((x) => x.key === active);
    if (m && a) m.panTo([a.lat, a.lng], { animate: true, duration: 0.8 });
  }, [areas, active, hover]);

  return <div className="re-l-map" ref={el} role="application" aria-label="Map of Dubai areas" />;
}
