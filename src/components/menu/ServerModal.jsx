import { useState } from 'react';
import ModalShell from './ModalShell';
import '@/styles/blobrush-shop.css';
import { GAME_MODES } from '@/game/rooms';
import ServerConnectionPanel from './ServerConnectionPanel';
import useServerRooms from '@/hooks/use-server-rooms';

const modeLabel = (id) => GAME_MODES.find((m) => m.id === id) || { id, name: id, icon: '🎮', description: '' };

export default function ServerModal({ profile, onSelect, onSettings, onClose }) {
  const { status, rooms, checkedAt } = useServerRooms(profile);
  const modeIds = [...new Set(rooms.map((r) => r.modeId))];
  const [modeId, setModeId] = useState(profile.room.modeId);
  const activeMode = modeIds.includes(modeId) ? modeId : modeIds[0];
  const visible = rooms.filter((r) => r.modeId === activeMode);

  return (
    <ModalShell title="Choose Arena" onClose={onClose}>
      <ServerConnectionPanel
        settings={profile.settings}
        onSettings={onSettings}
        status={status}
        players={rooms.reduce((s, r) => s + (r.players || 0), 0)}
        checkedAt={checkedAt}
      />

      {status === 'none' && (
        <div className="shop-note">Add your server address above to see live arenas. Without it, matches run offline against bots.</div>
      )}
      {status === 'loading' && <div className="shop-note">Looking for arenas…</div>}
      {status === 'error' && (
        <div className="shop-note">Couldn’t reach that server. Check it’s running, then reopen this window.</div>
      )}

      {status === 'ready' && rooms.length === 0 && <div className="shop-note">The server reported no open arenas.</div>}

      {status === 'ready' && rooms.length > 0 && (
        <>
          <div className="server-modes">
            {modeIds.map((id) => {
              const mode = modeLabel(id);
              return (
                <button key={id} className={`shop-tab${activeMode === id ? ' active' : ''}`} onClick={() => setModeId(id)}>
                  {mode.icon} {mode.name}
                </button>
              );
            })}
          </div>
          <div className="shop-note">{modeLabel(activeMode).description}</div>
          <div className="room-grid">
            {visible.map((room) => (
              <button
                key={room.id}
                className={`room-card${profile.room.roomId === room.id ? ' active' : ''}`}
                onClick={() => { onSelect({ modeId: activeMode, roomId: room.id }); onClose(); }}
              >
                <b>{room.label}</b>
                <small>{room.region} · {room.players}/{room.capacity} players</small>
                <div className="room-bar"><i style={{ width: `${(room.players / room.capacity) * 100}%` }} /></div>
                <small>{profile.room.roomId === room.id ? '✓ Selected' : 'Tap to join'}</small>
              </button>
            ))}
          </div>
        </>
      )}
    </ModalShell>
  );
}