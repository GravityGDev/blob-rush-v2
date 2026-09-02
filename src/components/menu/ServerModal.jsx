import { useEffect, useMemo, useState } from 'react';
import ModalShell from './ModalShell';
import { GAME_MODES } from '@/game/rooms';
import useServerRooms from '@/hooks/use-server-rooms';
import '@/styles/blobrush-connect.css';

const fallbackMode = (id) => ({ id, name: id, icon: '🎮', description: 'Live arena.' });

export default function ServerModal({ profile, onSelect, onClose }) {
  const { status, rooms, checkedAt } = useServerRooms(profile);
  const [modeId, setModeId] = useState(profile.room.modeId || 'ffa');
  const modes = useMemo(() => {
    const configured = [...GAME_MODES];
    for (const room of rooms) if (!configured.some((mode) => mode.id === room.modeId)) configured.push(fallbackMode(room.modeId));
    return configured;
  }, [rooms]);
  const counts = useMemo(() => Object.fromEntries(modes.map((mode) => [mode.id, rooms.filter((room) => room.modeId === mode.id).reduce((sum, room) => sum + Number(room.players || 0), 0)])), [modes, rooms]);
  const visible = rooms.filter((room) => room.modeId === modeId);
  const totalPlayers = rooms.reduce((sum, room) => sum + Number(room.players || 0), 0);

  useEffect(() => {
    if (!modes.some((mode) => mode.id === modeId)) setModeId('ffa');
  }, [modes, modeId]);

  return <ModalShell title="CONNECT" onClose={onClose} className="connect-modal">
    <div className="connect-grid">
      <section className="connect-pane connect-modes-pane">
        <div className="connect-pane-title"><span>1</span><h3>Game Mode</h3><em>{totalPlayers} player{totalPlayers === 1 ? '' : 's'} online</em></div>
        <div className="connect-mode-grid">
          {modes.map((mode) => {
            const online = rooms.some((room) => room.modeId === mode.id);
            return <button key={mode.id} className={`connect-mode-card${modeId === mode.id ? ' active' : ''}${mode.featured ? ' featured' : ''}${online ? '' : ' offline'}`} onClick={() => setModeId(mode.id)}>
              <i>{mode.icon}</i><div><b>{mode.name}</b><small>{counts[mode.id] || 0} players</small></div>{online && <span className="connect-live-dot" />}
            </button>;
          })}
        </div>
      </section>

      <section className="connect-pane connect-servers-pane">
        <div className="connect-pane-title"><span>2</span><h3>Servers</h3><em className={`connect-refresh ${status}`}>{status === 'loading' ? 'Checking…' : status === 'error' ? 'Master offline' : 'Live'}</em></div>
        <div className="connect-server-list">
          {status === 'loading' && <div className="connect-empty"><i className="connect-spinner" />Finding live arenas…</div>}
          {status === 'error' && <div className="connect-empty error"><b>Couldn’t reach the master server</b><small>The list will retry automatically.</small></div>}
          {status === 'ready' && visible.length === 0 && <div className="connect-empty"><b>No {modes.find((mode) => mode.id === modeId)?.name || ''} servers running</b><small>A server will appear automatically when it comes online.</small></div>}
          {status === 'ready' && visible.map((room) => {
            const full = room.players >= room.capacity;
            const selected = profile.room.roomId === room.roomId;
            const percent = Math.min(100, (Number(room.players || 0) / Math.max(1, Number(room.capacity || 1))) * 100);
            return <button key={room.serverId || room.roomId} className={`connect-server-card${selected ? ' selected' : ''}`} disabled={full} onClick={() => { onSelect({ modeId: room.modeId, roomId: room.roomId }); onClose(); }}>
              <div className="connect-server-top"><b>{modes.find((mode) => mode.id === room.modeId)?.name || room.modeId}</b><span className={full ? 'full' : 'open'}>{full ? 'FULL' : 'OPEN'}</span></div>
              <div className="connect-server-meta"><small>{room.players}/{room.capacity} players · {room.region}</small><em>Arena code: {String(room.label || room.roomId).replace(/^#/, '')}</em></div>
              <div className="connect-server-bar"><i style={{ width: `${percent}%` }} /></div>
              {selected && <strong>✓ Selected</strong>}
            </button>;
          })}
        </div>
        {checkedAt && status === 'ready' && <small className="connect-checked">Auto-refreshing · checked {new Date(checkedAt).toLocaleTimeString()}</small>}
      </section>
    </div>
  </ModalShell>;
}
