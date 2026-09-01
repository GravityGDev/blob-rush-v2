import { api } from '@/api/authClient';
import { gameServerUrl } from './config';
import { connectToServer } from './client';

export async function startOnlineSession(profile, onStatus) {
  const url = gameServerUrl(profile);
  if (!url) return null;
  onStatus?.({ state: 'connecting' });
  const room = profile.room?.roomId || 'ffa-8080';
  const { ticket } = await api('/api/game/ticket', { method: 'POST', body: JSON.stringify({ room }) });
  return connectToServer({ url, ticket, room, mode: profile.room?.modeId || 'ffa', profile, onStatus });
}
