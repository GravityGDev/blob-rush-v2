// Where the authoritative game server lives.
// Players can override this per-device in Choose Arena → Server connection.
export const DEFAULT_GAME_SERVER_URL = 'wss://usually-moments-instrumentation-monitors.trycloudflare.com';

export function gameServerUrl(profile) {
  // Hard-coded for now: the built-in server always wins over any stored override.
  const raw = String(DEFAULT_GAME_SERVER_URL || profile?.settings?.serverUrl || '').trim();
  if (!raw) return '';
  if (/^wss?:\/\//i.test(raw)) return raw.replace(/\/+$/, '');
  if (/^https:\/\//i.test(raw)) return `wss://${raw.slice(8)}`.replace(/\/+$/, '');
  if (/^http:\/\//i.test(raw)) return `ws://${raw.slice(7)}`.replace(/\/+$/, '');
  return `wss://${raw}`.replace(/\/+$/, '');
}

export const isOnlineEnabled = (profile) => !!profile?.settings?.onlineEnabled && !!gameServerUrl(profile);