'use client';

/**
 * The success / error banners the admin screens show after a redirect.
 *
 * The message arrives in a cookie set by the Server Action. A page render may
 * only read cookies, so the banner is what clears it: once a message is on
 * screen it deletes the cookie, and a reload does not show it again. Success
 * messages then dismiss themselves; errors stay until closed, so they can be
 * read and acted on.
 *
 * Screens render it with `key={flash.id}`, so the same message twice in a row
 * (two deletions, say) still shows the second time.
 */
import { useEffect, useState } from 'react';

import Icon from './Icon';
import { ADMIN_FLASH_COOKIE, ADMIN_FLASH_PATH } from '@/lib/admin/config';

const OK_DELAY = 4000;
const FADE = 400;

function clearFlashCookie() {
  document.cookie = `${ADMIN_FLASH_COOKIE}=; Max-Age=0; path=${ADMIN_FLASH_PATH}; SameSite=Lax`;
}

function Banner({ message, tone }: { message: string; tone: 'ok' | 'err' }) {
  const [state, setState] = useState<'shown' | 'hiding' | 'gone'>('shown');

  useEffect(() => {
    clearFlashCookie();
    if (tone !== 'ok') return;
    const hide = setTimeout(() => setState('hiding'), OK_DELAY);
    const gone = setTimeout(() => setState('gone'), OK_DELAY + FADE);
    return () => {
      clearTimeout(hide);
      clearTimeout(gone);
    };
  }, [tone]);

  if (!message || state === 'gone') return null;

  const dismiss = () => {
    setState('hiding');
    setTimeout(() => setState('gone'), FADE);
  };

  return (
    <div
      className={'flash' + (tone === 'err' ? ' err' : '') + (state === 'hiding' ? ' is-hiding' : '')}
      role={tone === 'err' ? 'alert' : 'status'}
    >
      <Icon name={tone === 'err' ? 'alertCircle' : 'checkCircle'} />
      <span className="flash-text">{message}</span>
      <button type="button" className="flash-close" aria-label="Dismiss message" onClick={dismiss}>
        <Icon name="close" size={16} />
      </button>
    </div>
  );
}

export function FlashOk({ message }: { message: string }) {
  return message ? <Banner message={message} tone="ok" /> : null;
}

export function FlashErr({ message }: { message: string }) {
  return message ? <Banner message={message} tone="err" /> : null;
}
