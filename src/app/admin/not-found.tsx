/**
 * The panel's 404: inside the shell when signed in, a standalone card otherwise
 * (which also avoids telling a signed-out visitor which admin screens exist).
 */
import AdminShell from '@/components/admin/AdminShell';
import Icon from '@/components/admin/Icon';
import { ADMIN_LOGO_DARK, adminUrl } from '@/lib/admin/config';
import { currentUser } from '@/lib/admin/session';

export default async function AdminNotFound() {
  const user = await currentUser();

  const body = (
    <div className="not-found">
      <span className="nf-code">404</span>
      <h1>This screen doesn&rsquo;t exist</h1>
      <p>The address may be mistyped, or the screen may have moved.</p>
      <a href={adminUrl(user ? 'dashboard' : '')} className="btn primary">
        <Icon name="chevronLeft" size={16} stroke={2.4} />
        {user ? 'Back to dashboard' : 'Go to sign in'}
      </a>
    </div>
  );

  if (!user) {
    return (
      <div className="standalone">
        <div className="standalone-card">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="standalone-logo" src={ADMIN_LOGO_DARK} alt="Valunxt" width={150} height={30} />
          {body}
        </div>
      </div>
    );
  }

  return (
    <AdminShell active="none" user={user}>
      <section className="panel">{body}</section>
    </AdminShell>
  );
}
