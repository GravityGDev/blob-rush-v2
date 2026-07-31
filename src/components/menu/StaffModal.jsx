import { useState } from 'react';
import ModalShell from './ModalShell';
import '@/styles/blobrush-shop.css';
import { cloneProfile } from '@/game/utils';
import { DEFAULTS } from '@/game/save';
import { addSeasonProgress } from '@/game/progression';

export default function StaffModal({ mode, profile, onProfile, onClose }) {
  const [note, setNote] = useState('');
  const isAdmin = mode === 'admin';

  const grant = (patch, message) => {
    const next = cloneProfile(profile);
    patch(next);
    onProfile(next);
    setNote(message);
  };

  return (
    <ModalShell title={isAdmin ? 'Admin Tools' : 'Moderation'} onClose={onClose}>
      <div className="shop-note">{note || (isAdmin ? 'Local test tools for this profile.' : 'Local moderation tools for this session.')}</div>
      <div className="shop-grid wide">
        {isAdmin ? (
          <>
            <div className="shop-item">
              <span className="icon">🪙</span><h4>Grant coins</h4><p>Add 1,000 coins to this profile.</p>
              <button className="buy-btn" onClick={() => grant((p) => { p.coins += 1000; }, '+1,000 coins granted.')}>Grant</button>
            </div>
            <div className="shop-item">
              <span className="icon">🎟️</span><h4>Grant tokens</h4><p>Add 5 lucky tokens.</p>
              <button className="buy-btn" onClick={() => grant((p) => { p.tokens += 5; }, '+5 tokens granted.')}>Grant</button>
            </div>
            <div className="shop-item">
              <span className="icon">🏆</span><h4>Season points</h4><p>Add 600 season pass points.</p>
              <button className="buy-btn" onClick={() => grant((p) => addSeasonProgress(p, 600), '+600 season points.')}>Grant</button>
            </div>
            <div className="shop-item">
              <span className="icon">♻️</span><h4>Reset profile</h4><p>Wipe progress back to a fresh save.</p>
              <button className="buy-btn secondary" onClick={() => grant((p) => Object.assign(p, JSON.parse(JSON.stringify(DEFAULTS))), 'Profile reset.')}>Reset</button>
            </div>
          </>
        ) : (
          <>
            <div className="shop-item">
              <span className="icon">🔇</span><h4>Mute chat</h4><p>Hide all in-game chat and emoji reactions.</p>
              <button className={`buy-btn${profile.settings.showCosmetics ? '' : ' equipped'}`} onClick={() => grant((p) => { p.settings.showCosmetics = !p.settings.showCosmetics; }, 'Toggled cosmetic visibility.')}>Toggle</button>
            </div>
            <div className="shop-item">
              <span className="icon">🚨</span><h4>Report log</h4><p>No reports have been filed in this session.</p>
              <button className="buy-btn secondary" disabled>Empty</button>
            </div>
          </>
        )}
      </div>
    </ModalShell>
  );
}