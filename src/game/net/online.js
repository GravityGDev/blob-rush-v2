import { api } from '@/api/authClient';
import { gameServerUrl } from './config';
import { connectToServer } from './client';

export async function startOnlineSession(profile, onStatus) {
  const url = gameServerUrl(profile);
  onStatus?.({ state: 'connecting' });
  const room = profile.room?.roomId || 'ffa-8080';
  const result = await api('/api/game/ticket', { method: 'POST', body: JSON.stringify({ room }) });
  const serverUrl = result.serverUrl || url;
  if (!serverUrl) throw new Error('The master server did not return a game server URL.');
  return connectToServer({ url: serverUrl, ticket: result.ticket, room: result.room || room, mode: profile.room?.modeId || 'ffa', profile, onStatus });
}
