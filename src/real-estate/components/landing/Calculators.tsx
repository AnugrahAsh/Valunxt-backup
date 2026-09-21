'use client';

/**
 * Two calculators the desk opens the first conversation with.
 *
 *   Yield     price, rent, size and service charge → gross yield, net yield,
 *             the all-in cost of buying and monthly income, on live sliders.
 *   Off-plan  price and a payment plan → the instalment schedule as animated
 *             bars, so "60/40 over 30 months" becomes a picture.
 *
 * Every figure is labelled indicative; every real purchase gets a written
 * appraisal from the group's own valuers.
 */
import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';

import { CALC_HEAD, PLANS, ROI_DEFAULTS } from '../../data/landing';
import { useSearch } from './LandingBody';
import { IcArrow, SectionHead, aed } from './shared';

function Slider({ label, value, min, max, step, onChange, format }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; format: (v: number) => string }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <label className="re-l-slider">
      <span className="re-l-slider__row">
        <span>{label}</span>
        <strong>{format(value)}</strong>
      </span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} style={{ ['--pct' as string]: `${pct}%` }} />
    </label>
  );
}

function Yield() {
  const [price, setPrice] = useState(ROI_DEFAULTS.price);
  const [rent, setRent] = useState(ROI_DEFAULTS.rent);
  const [sqft, setSqft] = useState(ROI_DEFAULTS.sqft);
  const [sc, setSc] = useState(ROI_DEFAULTS.serviceChargePsf);
  const { enquire } = useSearch();

  const r = useMemo(() => {
    const gross = (rent / price) * 100;
    const charges = sqft * sc;
    const net = ((rent - charges) / price) * 100;
    const buyCosts = price * ROI_DEFAULTS.buyCostPct;
    const netOnTotal = ((rent - charges) / (price + buyCosts)) * 100;
    return { gross, net, charges, buyCosts, netOnTotal, monthly: (rent - charges) / 12 };
  }, [price, rent, sqft, sc]);

  return (
    <div className="re-l-calc" data-rv="up" data-rv-i="3">
      <div className="re-l-calc__in">
        <h3>Rental yield</h3>
        <Slider label="Purchase price" value={price} min={500_000} max={30_000_000} step={50_000} onChange={setPrice} format={(v) => aed(v, { compact: true })} />
        <Slider label="Annual rent" value={rent} min={30_000} max={1_500_000} step={5_000} onChange={setRent} format={(v) => aed(v, { compact: true })} />
        <Slider label="Size" value={sqft} min={350} max={10_000} step={10} onChange={setSqft} format={(v) => `${v.toLocaleString('en-US')} sqft`} />
        <Slider label="Service charge" value={sc} min={4} max={40} step={1} onChange={setSc} format={(v) => `AED ${v} / sqft`} />
      </div>
      <div className="re-l-calc__out">
        <div className="re-l-calc__big">
          <span>Net yield</span>
          <strong>
            <Num v={r.net} />%
          </strong>
          <em>gross <Num v={r.gross} />%</em>
        </div>
        <dl>
          <div>
            <dt>Monthly income, net of charges</dt>
            <dd>{aed(r.monthly)}</dd>
          </div>
          <div>
            <dt>Service charges per year</dt>
            <dd>{aed(r.charges)}</dd>
          </div>
          <div>
            <dt>Buying costs (DLD, registration, agency)</dt>
            <dd>{aed(r.buyCosts)}</dd>
          </div>
          <div>
            <dt>Net yield on total outlay</dt>
            <dd>
              <Num v={r.netOnTotal} />%
            </dd>
          </div>
        </dl>
        <button type="button" className="re-l-link" onClick={() => enquire(`a written appraisal for a ${aed(price, { compact: true })} purchase`)}>
          Get a written appraisal
          <IcArrow />
        </button>
      </div>
    </div>
  );
}

function Num({ v }: { v: number }) {
  return <>{v.toFixed(1)}</>;
}

function Plan() {
  const [price, setPrice] = useState(1_350_000);
  const [planKey, setPlanKey] = useState(PLANS[0]!.key);
  const plan = PLANS.find((p) => p.key === planKey) ?? PLANS[0]!;

  const schedule = useMemo(() => {
    const rows: { label: string; amount: number; when: string }[] = [];
    rows.push({ label: 'Booking', amount: price * 0.1, when: 'On signing' });
    if (plan.monthly) {
      rows.push({ label: 'On SPA', amount: price * (plan.during - 0.1), when: 'Within 30 days' });
      const n = plan.months;
      for (let i = 1; i <= n; i++) rows.push({ label: `Month ${i}`, amount: price * plan.monthly, when: `1% monthly` });
      const paid = price * plan.during + price * plan.monthly * n;
      rows.push({ label: 'Handover', amount: Math.max(0, price - paid), when: `Month ${n}` });
    } else {
      const steps = 4;
      const each = (price * (plan.during - 0.1)) / steps;
      for (let i = 1; i <= steps; i++) rows.push({ label: `Instalment ${i}`, amount: each, when: `Month ${Math.round((plan.months / (steps + 1)) * i)}` });
      rows.push({ label: 'Handover', amount: price * plan.handover, when: `Month ${plan.months}` });
    }
    return rows;
  }, [price, plan]);

  const shown = schedule.length > 9 ? [...schedule.slice(0, 3), { label: `… ${schedule.length - 5} monthly instalments`, amount: schedule.slice(3, -2).reduce((a, r) => a + r.amount, 0), when: '1% monthly' }, ...schedule.slice(-2)] : schedule;
  const max = Math.max(...shown.map((r) => r.amount));
  const { enquire } = useSearch();

  return (
    <div className="re-l-calc" data-rv="up" data-rv-i="4">
      <div className="re-l-calc__in">
        <h3>Off-plan payment plan</h3>
        <Slider label="Launch price" value={price} min={500_000} max={15_000_000} step={50_000} onChange={setPrice} format={(v) => aed(v, { compact: true })} />
        <div className="re-l-plan__modes" role="group" aria-label="Payment plan">
          {PLANS.map((p) => (
            <button type="button" key={p.key} className={`re-l-chip${p.key === planKey ? ' is-on' : ''}`} onClick={() => setPlanKey(p.key)}>
              {p.label}
            </button>
          ))}
        </div>
        <p className="re-l-calc__hint">
          {Math.round(plan.during * 100)}% during construction, {Math.round(plan.handover * 100)}% on handover over about {plan.months} months. Every dirham sits in a RERA escrow until the developer certifies progress.
        </p>
      </div>
      <div className="re-l-calc__out">
        <ol className="re-l-plan">
          {shown.map((r, i) => (
            <li key={r.label + i}>
              <span className="re-l-plan__label">
                {r.label}
                <small>{r.when}</small>
              </span>
              <span className="re-l-plan__bar">
                <motion.i
                  initial={false}
                  animate={{ width: `${Math.max(3, (r.amount / max) * 100)}%` }}
                  transition={{ type: 'spring', bounce: 0, duration: 0.7 }}
                />
              </span>
              <span className="re-l-plan__amt">{aed(r.amount, { compact: true })}</span>
            </li>
          ))}
        </ol>
        <button type="button" className="re-l-link" onClick={() => enquire(`off-plan launches on a ${plan.label} plan around ${aed(price, { compact: true })}`)}>
          See current launches on this plan
          <IcArrow />
        </button>
      </div>
    </div>
  );
}

export default function Calculators() {
  return (
    <section className="re-l-sec re-l-calcs" id="calculators">
      <div className="re-wrap">
        <SectionHead eyebrow={CALC_HEAD.eyebrow} title={CALC_HEAD.title} lede={CALC_HEAD.lede} />
        <div className="re-l-calcs__grid">
          <Yield />
          <Plan />
        </div>
      </div>
    </section>
  );
}
