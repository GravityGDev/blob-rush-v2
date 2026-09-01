// Public URLs injected into the frontend build by Dokploy.
export const DEFAULT_GAME_SERVER_URL = String(import.meta.env.VITE_GAME_SERVER_URL || '').trim();

export function gameServerUrl(profile) {
  const raw = String(DEFAULT_GAME_SERVER_URL || profile?.settings?.serverUrl || '').trim();
  if (!raw) return '';
  if (/^wss?:\/\//i.test(raw)) return raw.replace(/\/+$/, '');
  if (/^https:\/\//i.test(raw)) return `wss://${raw.slice(8)}`.replace(/\/+$/, '');
  if (/^http:\/\//i.test(raw)) return `ws://${raw.slice(7)}`.replace(/\/+$/, '');
  return `wss://${raw}`.replace(/\/+$/, '');
}

// The master server now selects the live game server and returns its WebSocket URL.
export const isOnlineEnabled = (profile) => profile?.settings?.onlineEnabled !== false;
