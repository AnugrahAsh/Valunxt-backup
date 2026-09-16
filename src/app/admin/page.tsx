/**
 * Admin login page.
 *
 * Port of admin/index.php.
 */
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

import {
  ADMIN_LOGO_DARK,
  ADMIN_LOGO_WHITE,
  DEFAULT_ADMIN_EMAIL,
  DEFAULT_ADMIN_PASS,
  SHOW_DEFAULT_CREDENTIALS,
  adminUrl,
  siteUrl,
} from '@/lib/admin/config';
import { currentUser } from '@/lib/admin/session';
import Icon from '@/components/admin/Icon';
import LoginForm from '@/components/admin/LoginForm';

export const metadata: Metadata = {
  title: 'Sign in — Valunxt Admin',
  robots: 'noindex, nofollow',
};

export default async function AdminLoginPage() {
  // Already signed in? Go straight to the dashboard.
  if (await currentUser()) redirect(adminUrl('dashboard'));

  return (
    <div className="login-body">
      {/* Brand panel */}
      <aside className="login-brand">
        <div className="brand-logo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={ADMIN_LOGO_WHITE} alt="Valunxt" width={176} height={35} />
        </div>

        <div className="brand-copy">
          <span className="eyebrow">Administrator Portal</span>
          <h1>
            Precision in every <span className="accent">decision.</span>
          </h1>
          <p className="lede">
            Manage your advisory content, client enquiries and insights from a single, secure control
            centre built for the Valunxt team.
          </p>
          <ul className="brand-points">
            <li>
              <span className="bp-ico">
                <Icon name="shield" size={18} />
              </span>
              Bank-grade session security
            </li>
            <li>
              <span className="bp-ico">
                <Icon name="chart" size={18} />
              </span>
              Real-time performance insights
            </li>
            <li>
              <span className="bp-ico">
                <Icon name="users" size={18} />
              </span>
              Centralised client &amp; enquiry management
            </li>
          </ul>
        </div>

        <div className="brand-foot">
          &copy; {new Date().getFullYear()} Valunxt. All rights reserved.
        </div>
      </aside>

      {/* Form panel */}
      <main className="login-form-wrap">
        <div className="login-card">
          <div className="form-logo">
            {/* Shown only on narrow screens; lazy, so wide ones never fetch it. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={ADMIN_LOGO_DARK} alt="Valunxt" width={150} height={30} loading="lazy" />
          </div>

          <h2>Welcome back</h2>
          <p className="sub">Sign in to your Valunxt admin account.</p>

          <LoginForm
            defaultEmail={SHOW_DEFAULT_CREDENTIALS ? DEFAULT_ADMIN_EMAIL : ''}
            defaultPassword={SHOW_DEFAULT_CREDENTIALS ? DEFAULT_ADMIN_PASS : ''}
          />

          {SHOW_DEFAULT_CREDENTIALS ? (
            <div className="cred-hint">
              <strong>Default credentials</strong>
              <span className="cred-tag">Development only</span>
              <br />
              Email: <code>{DEFAULT_ADMIN_EMAIL}</code>
              <br />
              Password: <code>{DEFAULT_ADMIN_PASS}</code>
            </div>
          ) : null}
        </div>

        <a className="login-back" href={siteUrl('')}>
          <Icon name="chevronLeft" size={16} stroke={2.2} />
          Back to website
        </a>
      </main>
    </div>
  );
}
