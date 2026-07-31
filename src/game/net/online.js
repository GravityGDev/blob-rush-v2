// Fetches a signed login ticket, then opens the authoritative server connection.
import { base44 } from '@/api/base44Client';
import { gameServerUrl } from './config';
import { connectToServer } from './client';

export async function startOnlineSession(profile, onStatus) {
  const url = gameServerUrl(profile);
  if (!url) return null;

  onStatus?.({ state: 'connecting' });
  const res = await base44.functions.invoke('netTicket', {
    room: profile.room?.roomId || '',
    name: profile.nickname || 'Blob',
  });
  const ticket = res?.data?.ticket;
  if (!ticket) {
    onStatus?.({ state: 'error', message: 'Sign in to play online.' });
    return null;
  }

  return connectToServer({
    url,
    ticket,
    room: profile.room?.roomId || '',
    mode: profile.room?.modeId || 'ffa',
    profile,
    onStatus,
  });
}