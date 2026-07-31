// Polls the authoritative game server for its live room list and status.
import { useEffect, useState } from 'react';
import { gameServerUrl } from '@/game/net/config';

export default function useServerRooms(profile, intervalMs = 5000) {
  const url = gameServerUrl(profile);
  const [state, setState] = useState({ status: url ? 'loading' : 'none', rooms: [], checkedAt: null });

  useEffect(() => {
    if (!url) { setState({ status: 'none', rooms: [], checkedAt: null }); return; }
    let cancelled = false;
    const http = url.replace(/^ws/i, 'http');
    setState((s) => ({ ...s, status: s.rooms.length ? s.status : 'loading' }));

    const poll = () => fetch(`${http}/rooms`)
      .then((r) => r.json())
      .then((list) => {
        if (cancelled) return;
        setState({ status: 'ready', rooms: Array.isArray(list) ? list : [], checkedAt: Date.now() });
      })
      .catch(() => { if (!cancelled) setState({ status: 'error', rooms: [], checkedAt: Date.now() }); });

    poll();
    const id = setInterval(poll, intervalMs);
    return () => { cancelled = true; clearInterval(id); };
  }, [url, intervalMs]);

  return state;
}