/**
 * Admin — Account Settings.
 *
 * The signed-in administrator's own profile (name and email) and password.
 *
 * New to the Next.js build. The PHP panel linked "Settings", "My Profile" and
 * "Account Settings" to `#`, so the only way to change the seeded default
 * password — which the README says must be changed before the panel is public —
 * was an SQL statement.
 */
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

import AdminShell from '@/components/admin/AdminShell';
import { FlashErr, FlashOk } from '@/components/admin/Flash';
import Icon from '@/components/admin/Icon';
import { adminUrl, brandText, userInitials } from '@/lib/admin/config';
import { findAccount, type AccountRow } from '@/lib/admin/db';
import { formatDateTime, localStamp } from '@/lib/admin/format';
import { changePasswordAction, saveProfileAction } from '@/lib/admin/actions';
import { isAdmin } from '@/lib/admin/guard';
import { csrfToken, currentUser, takeFlash } from '@/lib/admin/session';

export const metadata: Metadata = {
  title: 'Account Settings — Valunxt Admin',
  robots: 'noindex, nofollow',
};

export default async function SettingsPage() {
  const user = await currentUser();
  if (!user) redirect(adminUrl(''));

  const flash = await takeFlash();
  const csrf = await csrfToken();

  let account: AccountRow | null = null;
  let loadError = '';
  try {
    account = await findAccount(user.id);
  } catch {
    loadError = 'Your account could not be loaded. Please ensure MySQL is running.';
  }

  const name = account?.name ?? user.name;
  const email = account?.email ?? user.email;
  const role = (account?.role ?? user.role).replace(/^./, (c) => c.toUpperCase());
  const disabled = loadError !== '';

  return (
    <AdminShell active="settings" user={user}>
      <div className="page-head">
        <div className="crumbs">
          Home <span className="sep">/</span> Settings
        </div>
        <h1>Account Settings</h1>
        <p>Update the name, email and password you use to sign in to the Valunxt admin panel.</p>
      </div>

      <FlashOk key={'ok' + flash.id} message={flash.ok ?? ''} />
      <FlashErr key={'err' + flash.id} message={flash.err || loadError} />

      <div className="settings-grid">
        <div className="settings-main">
          <section className="panel" id="profile">
            <div className="panel-head">
              <div>
                <h3>Profile</h3>
                <div className="panel-sub">How you appear in the panel, and the email you sign in with.</div>
              </div>
            </div>
            <form action={saveProfileAction}>
              <input type="hidden" name="csrf" value={csrf} />
              <div className="panel-body">
                <div className="profile-card">
                  <span className="avatar lg">{userInitials(brandText(name))}</span>
                  <div>
                    <div className="pc-name">{brandText(name)}</div>
                    <div className="pc-mail">{email}</div>
                    <span className="pill new">{role}</span>
                  </div>
                </div>
                <div className="form-grid">
                  <div className="fld">
                    <label htmlFor="name">Full name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      defaultValue={brandText(name)}
                      maxLength={120}
                      required
                      autoComplete="name"
                      disabled={disabled}
                    />
                  </div>
                  <div className="fld">
                    <label htmlFor="acct_email">Email address</label>
                    <input
                      type="email"
                      id="acct_email"
                      name="email"
                      defaultValue={email}
                      maxLength={190}
                      required
                      autoComplete="email"
                      disabled={disabled}
                    />
                    <div className="hint">You will use this address the next time you sign in.</div>
                  </div>
                </div>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn primary" disabled={disabled}>
                  <Icon name="save" size={16} />
                  Save Profile
                </button>
              </div>
            </form>
          </section>

          <section className="panel" id="password" style={{ marginTop: 20 }}>
            <div className="panel-head">
              <div>
                <h3>Password</h3>
                <div className="panel-sub">At least 8 characters. You stay signed in after changing it.</div>
              </div>
            </div>
            <form action={changePasswordAction}>
              <input type="hidden" name="csrf" value={csrf} />
              {/* Lets password managers file the new password against this account. */}
              <input type="text" name="username" value={email} autoComplete="username" readOnly hidden />
              <div className="panel-body">
                <div className="form-grid">
                  <div className="fld full">
                    <label htmlFor="current_password">Current password</label>
                    <input
                      type="password"
                      id="current_password"
                      name="current_password"
                      autoComplete="current-password"
                      required
                      disabled={disabled}
                    />
                  </div>
                  <div className="fld">
                    <label htmlFor="new_password">New password</label>
                    <input
                      type="password"
                      id="new_password"
                      name="new_password"
                      autoComplete="new-password"
                      minLength={8}
                      required
                      disabled={disabled}
                    />
                  </div>
                  <div className="fld">
                    <label htmlFor="confirm_password">Confirm new password</label>
                    <input
                      type="password"
                      id="confirm_password"
                      name="confirm_password"
                      autoComplete="new-password"
                      minLength={8}
                      required
                      disabled={disabled}
                    />
                  </div>
                </div>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn primary" disabled={disabled}>
                  <Icon name="key" size={16} />
                  Change Password
                </button>
              </div>
            </form>
          </section>
        </div>

        <aside className="settings-side">
          <section className="panel">
            <div className="panel-head">
              <h3>Session</h3>
            </div>
            <div className="panel-body">
              <dl className="meta-list">
                <div>
                  <dt>Signed in as</dt>
                  <dd>{email}</dd>
                </div>
                <div>
                  <dt>Role</dt>
                  <dd>{role}</dd>
                </div>
                <div>
                  <dt>Last sign-in</dt>
                  <dd>{formatDateTime(localStamp(account?.last_login_at))}</dd>
                </div>
                <div>
                  <dt>Account created</dt>
                  <dd>{formatDateTime(localStamp(account?.created_at))}</dd>
                </div>
              </dl>
            </div>
            <div className="form-actions">
              <a href={adminUrl('logout')} className="btn ghost-danger">
                <Icon name="logout" size={16} />
                Sign out
              </a>
            </div>
          </section>

          {isAdmin(user) ? (
            <section className="panel" style={{ marginTop: 20 }}>
              <div className="panel-head">
                <h3>System</h3>
              </div>
              <div className="panel-body flush">
                <ul className="mini-list">
                  <li>
                    <a href={adminUrl('admin-users')}>Admin users</a>
                    <span className="counter-of">Who can sign in here</span>
                  </li>
                  <li>
                    <a href={adminUrl('site-settings')}>Site settings</a>
                    <span className="counter-of">Site URL, sitemap stamps, sync state</span>
                  </li>
                  <li>
                    <a href={adminUrl('security')}>Security</a>
                    <span className="counter-of">Sign-in failures, honeypot, scans</span>
                  </li>
                </ul>
              </div>
            </section>
          ) : null}
        </aside>
      </div>
    </AdminShell>
  );
}
