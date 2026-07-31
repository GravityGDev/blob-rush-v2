// Fetches the live room list from the configured authoritative game server.
import { useEffect, useState } from 'react';
import { gameServerUrl } from '@/game/net/config';

export default function useServerRooms(profile) {
  const url = gameServerUrl(profile);
  const [state, setState] = useState({ status: url ? 'loading' : 'none', rooms: [] });

  useEffect(() => {
    if (!url) { setState({ status: 'none', rooms: [] }); return; }
    let cancelled = false;
    setState({ status: 'loading', rooms: [] });
    const http = url.replace(/^ws/i, 'http');
    fetch(`${http}/rooms`)
      .then((r) => r.json())
      .then((list) => {
        if (cancelled) return;
        setState({ status: 'ready', rooms: Array.isArray(list) ? list : [] });
      })
      .catch(() => { if (!cancelled) setState({ status: 'error', rooms: [] }); });
    return () => { cancelled = true; };
  }, [url]);

  return state;
}