'use client';

/**
 * The enquiry form, minimal: what the visitor is after as a row of chips,
 * then name, email, phone, budget, area and an optional note on hairline
 * fields. Used by the landing page and every service page.
 *
 * WIRING. Posts to /form-handler/ like every lead form on the site, which
 * records it and writes it to the admin panel's Leads CRM. Field names are
 * load-bearing — the handler matches by suffix: `re_full_name`, `re_email`,
 * `re_phone`, `re_interest` (stored as the service) and `re_message` (stored
 * as the message). Budget, area and the listing being asked about have no
 * column of their own, so on submit they are folded into the message, where
 * the desk will see them. With JavaScript off the form still posts natively.
 */
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import { AREAS } from '../../data/landing';
import { BRAND } from '../../data/site';
import { IcArrow, IcCheck, IcClose } from './shared';

export const LEAD_ENDPOINT = '/form-handler/';

export const INTERESTS = ['Buying', 'Renting', 'Off-plan', 'Selling or letting', 'Mortgage', 'Valuation'] as const;
export type Interest = (typeof INTERESTS)[number];

const BUDGETS = ['Under AED 1M', 'AED 1M – 3M', 'AED 3M – 7M', 'AED 7M – 15M', 'AED 15M+'];

type Status = { state: 'idle' | 'sending' } | { state: 'sent' | 'error'; message: string };

export default function LeadForm({
  interest = 'Buying',
  about,
  onClearAbout,
}: {
  interest?: Interest;
  /** A listing or topic the visitor clicked "Enquire" on. */
  about?: string;
  onClearAbout?: () => void;
}) {
  const [status, setStatus] = useState<Status>({ state: 'idle' });

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const extras = [
      fd.get('re_budget') ? `Budget: ${fd.get('re_budget')}` : '',
      fd.get('re_location') ? `Area: ${fd.get('re_location')}` : '',
      about ? `Asking about: ${about}` : '',
    ].filter(Boolean);
    const note = String(fd.get('re_message') ?? '').trim();
    fd.set('re_message', [note, ...extras].filter(Boolean).join('\n'));

    setStatus({ state: 'sending' });
    try {
      const res = await fetch(LEAD_ENDPOINT, { method: 'POST', body: fd });
      const body = await res.json().catch(() => null);
      const message = body?.data?.message;
      if (res.ok && body?.success) {
        setStatus({ state: 'sent', message: message || 'Thank you — an advisor will be in touch within one working day.' });
        form.reset();
        return;
      }
      setStatus({ state: 'error', message: message || 'That did not go through. Please try again, or call us.' });
    } catch {
      setStatus({ state: 'error', message: `We could not send that just now. Please try again, or call ${BRAND.phone}.` });
    }
  }

  const sending = status.state === 'sending';

  return (
    <AnimatePresence mode="wait" initial={false}>
      {status.state === 'sent' ? (
        <motion.div
          key="sent"
          className="re-l-form__done"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          role="status"
        >
          <motion.span className="re-l-form__tick" initial={{ scale: 0.6 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.5, duration: 0.7 }}>
            <IcCheck />
          </motion.span>
          <h3>Enquiry received</h3>
          <p>{status.message}</p>
          <button type="button" className="re-l-link" onClick={() => setStatus({ state: 'idle' })}>
            Send another
            <IcArrow />
          </button>
        </motion.div>
      ) : (
        <motion.form
          key="form"
          className="re-l-form"
          method="post"
          action={LEAD_ENDPOINT}
          onSubmit={onSubmit}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, y: -10 }}
        >
          <input type="hidden" name="form_id" value="real-estate" />
          <input type="hidden" name="form_name" value="Real Estate Enquiry" />
          <input type="hidden" name="re_about" value={about ?? ''} />

          <fieldset className="re-l-form__chips">
            <legend>I am interested in</legend>
            <div>
              {INTERESTS.map((i) => (
                <label key={i}>
                  <input type="radio" name="re_interest" value={i} defaultChecked={i === interest} />
                  <span>{i}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <AnimatePresence initial={false}>
            {about ? (
              <motion.p className="re-l-form__about" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                <span>
                  Asking about <strong>{about}</strong>
                </span>
                {onClearAbout ? (
                  <button type="button" aria-label="Clear" onClick={onClearAbout}>
                    <IcClose />
                  </button>
                ) : null}
              </motion.p>
            ) : null}
          </AnimatePresence>

          <div className="re-l-form__grid">
            <label className="re-l-field re-l-field--wide">
              <span>Full name</span>
              <input type="text" name="re_full_name" required autoComplete="name" placeholder="Your name" />
            </label>
            <label className="re-l-field">
              <span>Email</span>
              <input type="email" name="re_email" required autoComplete="email" placeholder="you@example.com" />
            </label>
            <label className="re-l-field">
              <span>Phone</span>
              <input type="tel" name="re_phone" autoComplete="tel" placeholder="+971 50 000 0000" />
            </label>
            <label className="re-l-field">
              <span>Budget</span>
              <select name="re_budget" defaultValue="">
                <option value="">Not sure yet</option>
                {BUDGETS.map((b) => (
                  <option key={b}>{b}</option>
                ))}
              </select>
            </label>
            <label className="re-l-field">
              <span>Preferred area</span>
              <select name="re_location" defaultValue="">
                <option value="">Open to suggestions</option>
                {AREAS.map((a) => (
                  <option key={a.key}>{a.name}</option>
                ))}
              </select>
            </label>
            <label className="re-l-field re-l-field--wide">
              <span>Anything we should know? (optional)</span>
              <textarea name="re_message" rows={2} placeholder="Timing, must-haves, questions…" />
            </label>
          </div>

          <div className="re-l-form__foot">
            <button type="submit" className="re-btn re-l-form__send" disabled={sending}>
              {sending ? 'Sending…' : 'Send enquiry'}
              <IcArrow />
            </button>
            <p className="re-l-form__legal">We reply within one working day. By sending, you agree to be contacted by {BRAND.name} about this enquiry.</p>
          </div>

          <p className="re-l-form__status" data-state={status.state} role="status" aria-live="polite">
            {status.state === 'error' ? status.message : ''}
          </p>
        </motion.form>
      )}
    </AnimatePresence>
  );
}
