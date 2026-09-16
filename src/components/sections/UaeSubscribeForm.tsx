'use client';

/**
 * The email field on the "Valunxt Insights" newsletter band (both home pages).
 *
 * WHY THIS SUBMITS ITSELF RATHER THAN LEANING ON ELEMENTOR. The first pass gave
 * the form `.elementor-form` on the assumption that Elementor Pro's frontend
 * binds its AJAX submit handler to that class. It does not — the handler is
 * registered per WIDGET, attached to elements carrying
 * data-widget_type="form.default", so a bare `.elementor-form` on hand-written
 * markup never receives it. What actually happened was a native POST: no
 * `action`, so the browser posted to the current URL, the page reloaded, and
 * the address was silently thrown away. It looked like it worked.
 *
 * Fifteen lines of fetch is the whole fix, and it owes nothing to a plugin's
 * internals. /form-handler/ is the same endpoint every other form on the site
 * uses; it takes form_fields[<id>], logs the submission, and records an
 * email-only signup as a "Newsletter" lead in the Leads CRM.
 *
 * The market goes into form_id and post_id (uae-insights / uae-home as before,
 * in-insights / in-home for India), so the log says which home page a
 * subscription came from.
 *
 * It is a client component so that UaeSubscribeBand can stay a server one:
 * that file resolves its photograph through rimgFirst(), which reads the
 * filesystem and cannot cross into the browser bundle.
 */
import { useState } from 'react';

import { BASE } from '@/lib/region';

type State = 'idle' | 'sending' | 'done' | 'error';

export default function UaeSubscribeForm({ market = 'uae' }: { market?: 'uae' | 'in' }) {
  const [state, setState] = useState<State>('idle');
  const [message, setMessage] = useState('');

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    /* The browser's own validation still runs — required and type="email" are
       on the input — this only stops the fetch when it fails. */
    if (!form.reportValidity()) return;

    setState('sending');
    setMessage('');
    try {
      const res = await fetch(`${BASE}/form-handler/`, {
        method: 'POST',
        body: new FormData(form),
      });
      const json = await res.json().catch(() => null);
      if (res.ok && json?.success) {
        setState('done');
        setMessage(json?.data?.message ?? 'Thank you, you are subscribed.');
        form.reset();
      } else {
        setState('error');
        setMessage(json?.data?.message ?? 'Something went wrong. Please try again.');
      }
    } catch {
      setState('error');
      setMessage('Something went wrong. Please try again.');
    }
  }

  return (
    <div className="vxn-sub__formwrap">
      <form
        className="vxn-sub__form"
        method="post"
        action={`${BASE}/form-handler/`}
        name="Valunxt Insights"
        aria-label="Subscribe to Valunxt Insights"
        onSubmit={onSubmit}
      >
        <input type="hidden" name="form_id" value={`${market}-insights`} />
        <input type="hidden" name="post_id" value={`${market}-home`} />
        <input type="hidden" name="referer_title" value="Valunxt Insights" />

        {/* The placeholder is not the label: it disappears on the first
            keystroke and never reaches a screen reader as a name. */}
        <label className="vxn-sub__label" htmlFor="vxn-sub-email">
          Email address
        </label>
        <input
          className="vxn-sub__input"
          id="vxn-sub-email"
          type="email"
          name="form_fields[email]"
          placeholder="Enter Email"
          autoComplete="email"
          required
        />

        <button className="vxn-sub__cta" type="submit" disabled={state === 'sending'}>
          <span className="vxn-sub__cta-label">
            {state === 'sending' ? 'Sending' : 'Subscribe'}
          </span>
          <span className="vxn-sub__cta-go" aria-hidden="true">
            <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M4.5 11.5L11.5 4.5M11.5 4.5H5.5M11.5 4.5V10.5"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </button>
      </form>

      {/* aria-live so the outcome is announced, not just drawn. */}
      <p
        className={`vxn-sub__msg${state === 'error' ? ' is-error' : ''}`}
        role="status"
        aria-live="polite"
      >
        {message}
      </p>
    </div>
  );
}
