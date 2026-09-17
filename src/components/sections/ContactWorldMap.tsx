'use client';

/**
 * The Contact page's map (20260917), replacing the single Google Maps embed
 * that only ever showed the Mumbai office.
 *
 * WHAT IT WAS: one `google_maps` widget, a Google-hosted iframe centred on
 * Platina Tower — so a UAE visitor landed on a street in Mumbai and the other
 * three offices (Dubai, Abu Dhabi, Noida) were nowhere on the page.
 *
 * WHAT IT IS NOW: a real, pannable, zoomable map of the whole world — scroll
 * to zoom, drag to pan, the ordinary +/- controls — with the brand's own "x"
 * mark, the same glyph WhoWeAreTrio and ProofBand use elsewhere, planted at
 * all four cities Valunxt actually has an office in. `vxnOffices()`
 * (lib/site-data.ts, which carries a lat/lng for each office) is the one
 * source both this map and the office cards further up the page read, so a
 * location can never go stale on one and not the other. A click on a pin opens
 * the same Google Maps link the office cards use.
 *
 * THE MAP ITSELF IS LEAFLET OVER OPENSTREETMAP TILES (OfficeMap.tsx) rather
 * than the Google Maps JavaScript API: a real interactive map with no API key
 * or billing account tied to this repository. It is loaded with
 * `next/dynamic(..., { ssr: false })` — Leaflet touches `window` the moment its
 * module runs, and this file is the Client Component that call has to be made
 * from; see the note in OfficeMap.tsx for the rest of it.
 *
 * THIS FILE STAYS 'use client' EVEN THOUGH IT READS SERVER DATA. `vxnOffices()`
 * is a plain literal (lib/site-data.ts, no `server-only`), so calling it here
 * costs nothing — and it has to be called somewhere a `next/dynamic(ssr:false)`
 * is legal, which is only a Client Component.
 */

import dynamic from 'next/dynamic';

import { vxnOffices, type OfficeKey } from '@/lib/site-data';
import { LogoXGlyph } from '@/components/brand/LogoX';
import type { OfficeMarker } from './OfficeMap';

const OfficeMap = dynamic(() => import('./OfficeMap'), {
  ssr: false,
  loading: () => <div className="vxn-omap__stage vxn-omap__stage--loading" aria-hidden="true" />,
});

interface Marker {
  key: OfficeKey;
  /** The name shown on the map and in the strip — Noida's office is what the
      market knows as its New Delhi / NCR desk, so that is the name here; the
      popup and the link still carry the office's real, full address. */
  label: string;
}

const MARKERS: Marker[] = [
  { key: 'dubai', label: 'Dubai' },
  { key: 'abudhabi', label: 'Abu Dhabi' },
  { key: 'mumbai', label: 'Mumbai' },
  { key: 'noida', label: 'New Delhi' },
];

const CSS = `
.vxn-wmap{
  border-radius:20px;
  padding:clamp(24px,3vw,36px);
  background:#F6F4EF;
  border:1px solid #E5E1D8;
}
.vxn-wmap__head{max-width:640px;margin:0 0 clamp(18px,2.2vw,26px);}
.vxn-wmap__eyebrow{display:block;font-family:"DM Sans",sans-serif;font-size:12px;font-weight:600;letter-spacing:.2em;text-transform:uppercase;color:#0B2DBE;margin:0 0 10px;}
.vxn-wmap__title{font-family:"Forum",serif;font-weight:400;color:#0E355F;font-size:clamp(24px,2.6vw,34px);line-height:1.18;margin:0 0 10px;}
.vxn-wmap__lede{font-family:"DM Sans",sans-serif;font-size:15px;line-height:1.65;color:#4d5863;margin:0;max-width:56ch;}

.vxn-omap__stage{
  width:100%;
  height:clamp(340px,52vw,540px);
  border-radius:14px;
  overflow:hidden;
  background:#eef0f2;
  isolation:isolate;
}
.vxn-omap__stage--loading{display:flex;align-items:center;justify-content:center;}
.vxn-omap__stage--loading::after{
  content:"Loading map\\2026";
  font-family:"DM Sans",sans-serif;font-size:13px;color:#8a93a3;
}

/* The pin: a white disc holding the brand "x". Leaflet sizes the DivIcon's
   own wrapper (iconSize in OfficeMap.tsx); everything visual is drawn here. */
.vxn-omap__pin{
  display:flex;align-items:center;justify-content:center;
  width:32px;height:32px;border-radius:50% 50% 50% 4px;
  background:#0B2DBE;
  box-shadow:0 3px 10px rgba(11,45,190,.4),0 0 0 2px #fff;
  transform:rotate(45deg);
}
.vxn-omap__pinx{width:14px;height:14px;color:#fff;transform:rotate(-45deg);}

/* Leaflet's own popup chrome, restyled to the brand rather than left as the
   library default white-with-square-corners box. */
.vxn-omap__popwrap .leaflet-popup-content-wrapper{
  border-radius:12px;box-shadow:0 14px 30px rgba(6,14,40,.22);
}
.vxn-omap__popwrap .leaflet-popup-content{margin:14px 16px;}
.vxn-omap__popwrap .leaflet-popup-tip{box-shadow:0 4px 10px rgba(6,14,40,.12);}
.vxn-omap__pop{display:flex;flex-direction:column;font-family:"DM Sans",sans-serif;color:#0E355F;}
.vxn-omap__popcity{font-family:"Forum",serif;font-size:16px;line-height:1.2;margin:0 0 3px;}
.vxn-omap__popnote{font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:#8a93a3;margin:0 0 7px;}
.vxn-omap__popaddr{font-size:13px;line-height:1.5;color:#4d5863;margin:0 0 9px;max-width:26ch;}
.vxn-omap__popgo{font-size:13px;font-weight:600;color:#0B2DBE;text-decoration:none;}
.vxn-omap__popgo:hover,.vxn-omap__popgo:focus-visible{text-decoration:underline;}

.vxn-wmap__strip{
  display:flex;flex-wrap:wrap;gap:10px;margin:clamp(18px,2.4vw,24px) 0 0;
}
.vxn-wmap__stripitem{
  display:inline-flex;align-items:center;gap:8px;padding:8px 14px 8px 10px;border-radius:999px;
  background:#fff;border:1px solid #E5E1D8;color:#0E355F!important;text-decoration:none!important;
  font-family:"DM Sans",sans-serif;font-size:13.5px;font-weight:500;transition:border-color .2s ease,background-color .2s ease;
}
.vxn-wmap__stripitem:hover,.vxn-wmap__stripitem:focus-visible{border-color:#0B2DBE;background:#F0F3FF;}
.vxn-wmap__stripicon{width:12px;height:12px;color:#0B2DBE;flex:0 0 auto;}
.vxn-wmap__stripnote{color:#8a93a3;font-weight:400;}
`;

export default function ContactWorldMap() {
  const offices = vxnOffices();
  const markers: OfficeMarker[] = MARKERS.map((m) => {
    const o = offices[m.key];
    return { key: m.key, label: m.label, lat: o.lat, lng: o.lng, note: o.note, address: o.address, mapHref: o.map };
  });

  return (
    <div className="vxn-wmap">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <div className="vxn-wmap__head">
        <span className="vxn-wmap__eyebrow">Where We Are</span>
        <h2 className="vxn-wmap__title">Four Cities. One Advisory Team.</h2>
        <p className="vxn-wmap__lede">
          Two offices in the UAE, two in India &mdash; every engagement is run by the same group, wherever
          you reach us from. Scroll or use the controls to zoom in on a city.
        </p>
      </div>

      <OfficeMap markers={markers} />

      <div className="vxn-wmap__strip">
        {markers.map((m) => (
          <a className="vxn-wmap__stripitem" key={m.key} href={m.mapHref} target="_blank" rel="noopener">
            <LogoXGlyph className="vxn-wmap__stripicon" />
            {m.label}
            <span className="vxn-wmap__stripnote">&middot; {m.note}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
