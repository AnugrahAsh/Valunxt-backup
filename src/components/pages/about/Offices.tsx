'use client';

/**
 * Where the group is, live. A map panel joins the four offices with arcs of
 * light, and each office card keeps its own local time, ticking, with an
 * open or closed mark read from the office's published hours (Monday to
 * Saturday, nine to six, local). Times render after mount, so the server and
 * the first client paint agree.
 */
import { useEffect, useState } from 'react';

export interface OfficeCard {
  key: string;
  city: string;
  country: string;
  address: string;
  phone: string;
  tel: string;
  map: string;
  tz: string;
  zone: string;
  lat: number;
  lng: number;
}

function clock(tz: string, now: Date) {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: tz, hour: '2-digit', minute: '2-digit', second: '2-digit', weekday: 'short', hour12: false }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
  const h = Number(get('hour'));
  const day = get('weekday');
  const open = day !== 'Sun' && h >= 9 && h < 18;
  return { hm: `${get('hour')}:${get('minute')}`, s: get('second'), day, open };
}

/* The panel's projection: longitude 48 to 82, latitude 16 to 32, into 1000 by 300. */
const px = (lng: number) => ((lng - 48) / 34) * 1000;
const py = (lat: number) => ((32 - lat) / 16) * 300;

export default function Offices({ offices }: { offices: OfficeCard[] }) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const pts = offices.map((o) => ({ ...o, x: px(o.lng), y: py(o.lat) }));
  const byKey = Object.fromEntries(pts.map((p) => [p.key, p]));
  const pairs: [string, string][] = [
    ['dubai', 'mumbai'],
    ['dubai', 'noida'],
    ['abudhabi', 'mumbai'],
    ['mumbai', 'noida'],
  ];

  return (
    <>
      <div className="ab-map" data-ab="scale">
        <svg viewBox="0 0 1000 300" preserveAspectRatio="xMidYMid meet" role="img" aria-label="The group's four offices, in the UAE and India">
          <defs>
            <pattern id="ab-dots" width="14" height="14" patternUnits="userSpaceOnUse">
              <circle cx="1.5" cy="1.5" r="1.2" fill="rgba(143,183,255,.16)" />
            </pattern>
            <linearGradient id="ab-arc" x1="0" x2="1">
              <stop offset="0" stopColor="#8FB7FF" />
              <stop offset="1" stopColor="#C58BFF" />
            </linearGradient>
          </defs>
          <rect width="1000" height="300" fill="url(#ab-dots)" />
          <text x="200" y="40" className="ab-map__region">
            UAE
          </text>
          <text x="790" y="170" className="ab-map__region">
            INDIA
          </text>
          {pairs.map(([a, b], i) => {
            const p = byKey[a];
            const q = byKey[b];
            if (!p || !q) return null;
            const cx = (p.x + q.x) / 2;
            const cy = Math.min(p.y, q.y) - 70 - i * 6;
            return (
              <g key={`${a}-${b}`}>
                <path d={`M${p.x},${p.y} Q${cx},${cy} ${q.x},${q.y}`} className="ab-map__arc" />
                <path d={`M${p.x},${p.y} Q${cx},${cy} ${q.x},${q.y}`} className="ab-map__flow" style={{ animationDelay: `${i * 0.7}s` }} />
              </g>
            );
          })}
          {pts.map((p) => (
            <g key={p.key} transform={`translate(${p.x} ${p.y})`}>
              <circle r="16" className="ab-map__pulse" />
              <circle r="5" className="ab-map__dot" />
              <text x={p.key === 'abudhabi' ? -12 : 12} y={p.key === 'abudhabi' ? 22 : -10} textAnchor={p.key === 'abudhabi' ? 'end' : 'start'} className="ab-map__label">
                {p.city}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <ul className="ab-offgrid">
        {offices.map((o, i) => {
          const c = now ? clock(o.tz, now) : null;
          return (
            <li className="ab-office" key={o.key} data-ab="up" data-ab-i={i}>
              <div className="ab-office__top">
                <span className="ab-office__country">{o.country}</span>
                <span className={`ab-office__status${c?.open ? ' is-open' : ''}`}>
                  <i aria-hidden="true" />
                  {c ? (c.open ? 'Open now' : 'Closed') : ' '}
                </span>
              </div>
              <h3 className="ab-office__city">{o.city}</h3>
              <p className="ab-office__time" aria-label={c ? `Local time ${c.hm}` : undefined}>
                {c ? c.hm : '--:--'}
                <span>{c ? c.s : '--'}</span>
                <small>{o.zone}</small>
              </p>
              <p className="ab-office__addr">{o.address}</p>
              <div className="ab-office__links">
                <a href={`tel:${o.tel}`}>{o.phone}</a>
                <a href={o.map} target="_blank" rel="noopener">
                  Directions
                </a>
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}
