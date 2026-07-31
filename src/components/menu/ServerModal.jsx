import { useState } from 'react';
import ModalShell from './ModalShell';
import '@/styles/blobrush-shop.css';
import { GAME_MODES, roomsForMode } from '@/game/rooms';
import ServerConnectionPanel from './ServerConnectionPanel';

export default function ServerModal({ profile, onSelect, onSettings, onClose }) {
  const [modeId, setModeId] = useState(profile.room.modeId);
  const rooms = roomsForMode(modeId);

  return (
    <ModalShell title="Choose Arena" onClose={onClose}>
      <ServerConnectionPanel settings={profile.settings} onSettings={onSettings} />
      <div className="server-modes">
        {GAME_MODES.map((mode) => (
          <button key={mode.id} className={`shop-tab${modeId === mode.id ? ' active' : ''}`} onClick={() => setModeId(mode.id)}>
            {mode.icon} {mode.name}
          </button>
        ))}
      </div>
      <div className="shop-note">{GAME_MODES.find((m) => m.id === modeId)?.description}</div>
      <div className="room-grid">
        {rooms.map((room) => (
          <button
            key={room.id}
            className={`room-card${profile.room.roomId === room.id ? ' active' : ''}`}
            onClick={() => { onSelect({ modeId, roomId: room.id }); onClose(); }}
          >
            <b>{room.label}</b>
            <small>{room.region} · {room.players}/{room.capacity} players</small>
            <div className="room-bar"><i style={{ width: `${(room.players / room.capacity) * 100}%` }} /></div>
            <small>{profile.room.roomId === room.id ? '✓ Selected' : 'Tap to join'}</small>
          </button>
        ))}
      </div>
    </ModalShell>
  );
}