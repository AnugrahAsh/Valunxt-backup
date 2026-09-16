'use client';

/**
 * The sign-in form.
 *
 * A client component only because of the show/hide password toggle, the
 * password-help note and the pending state — the submit itself is a Server
 * Action, so the form still works with JavaScript disabled.
 *
 * Port of the form half of admin/index.php.
 */
import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';

import Icon from './Icon';
import { loginAction } from '@/lib/admin/actions';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary" disabled={pending}>
      <span>{pending ? 'Signing in…' : 'Sign in'}</span>
      <Icon name="arrowRight" size={18} stroke={2.2} className="btn-arrow" />
    </button>
  );
}

export default function LoginForm({
  defaultEmail,
  defaultPassword,
}: {
  defaultEmail: string;
  defaultPassword: string;
}) {
  const [state, action] = useActionState(loginAction, null);
  const [show, setShow] = useState(false);
  const [help, setHelp] = useState(false);
  const error = state?.error ?? '';

  return (
    <>
      {error ? (
        <div className="alert alert-error" role="alert">
          <Icon name="alertCircle" />
          <span>{error}</span>
        </div>
      ) : null}

      <form action={action} noValidate>
        <div className="field">
          <label htmlFor="email">Email address</label>
          <div className="input-shell">
            <span className="lead-icon">
              <Icon name="mail" />
            </span>
            <input
              type="email"
              id="email"
              name="email"
              autoComplete="username"
              defaultValue={String(state?.email ?? defaultEmail)}
              placeholder="you@valunxt.com"
              required
            />
          </div>
        </div>

        <div className="field">
          <label htmlFor="password">Password</label>
          <div className="input-shell has-toggle">
            <span className="lead-icon">
              <Icon name="lock" />
            </span>
            <input
              type={show ? 'text' : 'password'}
              id="password"
              name="password"
              autoComplete="current-password"
              defaultValue={defaultPassword}
              placeholder="Enter your password"
              required
            />
            <button
              type="button"
              className="toggle-eye"
              id="togglePw"
              aria-label={show ? 'Hide password' : 'Show password'}
              aria-pressed={show}
              onClick={() => setShow((v) => !v)}
            >
              <Icon name={show ? 'eyeOff' : 'eye'} size={19} />
            </button>
          </div>
        </div>

        <div className="form-row">
          <label className="remember">
            <input type="checkbox" name="remember" value="1" /> Remember me for 30 days
          </label>
          <button
            type="button"
            className="forgot"
            aria-expanded={help}
            aria-controls="pwHelp"
            onClick={() => setHelp((v) => !v)}
          >
            Forgot password?
          </button>
        </div>

        {help ? (
          <div className="login-help" id="pwHelp" role="note">
            <Icon name="key" size={17} />
            <span>
              Passwords are reset by your Valunxt site administrator. Once you are signed in, you can
              change your own password under <strong>Settings</strong>.
            </span>
          </div>
        ) : null}

        <SubmitButton />
      </form>
    </>
  );
}
