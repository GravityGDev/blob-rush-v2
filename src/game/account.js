// Cloud account: Base44 login + Discord linking + profile sync.
import { base44 } from '@/api/base44Client';
import { mergeProfile } from './save';

export const DISCORD_CONNECTOR_ID = '6a600e70ee3817672e5197ce';

// Custom skins hold base64 image data, far too large for entity fields — keep them local only.
const forCloud = (profile) => {
  const { customSkins, ...rest } = profile;
  return rest;
};

export async function fetchAccount() {
  if (!(await base44.auth.isAuthenticated())) return null;
  const user = await base44.auth.me();
  const rows = await base44.entities.PlayerAccount.filter({ created_by_id: user.id });
  const account = rows[0] || (await base44.entities.PlayerAccount.create({
    role: user.role === 'admin' ? 'admin' : 'player',
    data: {},
  }));
  const saved = account.data && Object.keys(account.data).length ? account.data : null;
  return { user, account, profile: saved ? mergeProfile(saved) : null };
}

let pushTimer = null;
export function queueProfilePush(accountId, profile) {
  if (!accountId) return;
  clearTimeout(pushTimer);
  pushTimer = setTimeout(() => {
    base44.entities.PlayerAccount.update(accountId, { data: forCloud(profile) });
  }, 900);
}

export async function linkDiscord(accountId) {
  const url = await base44.connectors.connectAppUser(DISCORD_CONNECTOR_ID);
  const popup = window.open(url, '_blank');
  await new Promise((resolve) => {
    const timer = setInterval(() => {
      if (!popup || popup.closed) { clearInterval(timer); resolve(); }
    }, 500);
  });
  const { data } = await base44.functions.invoke('discordProfile', {});
  if (!data?.id) throw new Error(data?.error || 'Discord link failed');
  return base44.entities.PlayerAccount.update(accountId, {
    discord_id: data.id,
    discord_username: data.username,
    discord_avatar: data.avatar,
  });
}

export async function unlinkDiscord(accountId) {
  await base44.connectors.disconnectAppUser(DISCORD_CONNECTOR_ID);
  return base44.entities.PlayerAccount.update(accountId, {
    discord_id: '', discord_username: '', discord_avatar: '',
  });
}