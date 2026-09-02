// Polls the master server registry. Game servers appear while their heartbeat is
// fresh and disappear automatically after the master marks them offline.
import { useEffect, useState } from 'react';
import { api } from '@/api/authClient';

export default function useServerRooms(_profile, intervalMs = 3000) {
  const [state, setState] = useState({ status: 'loading', rooms: [], checkedAt: null });

  useEffect(() => {
    let cancelled = false;
    const poll = async () => {
      try {
        const data = await api('/api/servers');
        if (cancelled) return;
        const rooms = Array.isArray(data?.servers) ? data.servers : [];
        setState({ status: 'ready', rooms, checkedAt: Date.now() });
      } catch {
        if (!cancelled) setState({ status: 'error', rooms: [], checkedAt: Date.now() });
      }
    };
    poll();
    const id = setInterval(poll, intervalMs);
    return () => { cancelled = true; clearInterval(id); };
  }, [intervalMs]);

  return state;
}
