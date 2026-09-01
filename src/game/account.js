import { api } from '@/api/authClient';
import { mergeProfile } from './save';

const forCloud = (profile) => {
  const { customSkins, ...rest } = profile;
  return rest;
};

export async function fetchAccount() {
  try {
    const { user, profile } = await api('/api/account');
    return {
      user: { id: user.id, email: user.email, full_name: user.displayName },
      account: { id: user.id, role: user.role },
      profile: profile && Object.keys(profile).length ? mergeProfile(profile) : null,
    };
  } catch { return null; }
}

let pushTimer = null;
export function queueProfilePush(accountId, profile) {
  if (!accountId) return;
  clearTimeout(pushTimer);
  pushTimer = setTimeout(() => {
    api('/api/account/profile', { method: 'PUT', body: JSON.stringify({ profile: forCloud(profile) }) }).catch(() => {});
  }, 900);
}

export async function linkDiscord() { throw new Error('Discord linking will be added to the new account system next.'); }
export async function unlinkDiscord() { throw new Error('Discord linking is not configured yet.'); }
