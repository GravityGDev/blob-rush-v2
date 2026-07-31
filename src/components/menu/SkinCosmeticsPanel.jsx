import { useState } from 'react';
import '@/styles/blobrush-cosmetic.css';
import { SHOP_COSMETICS } from '@/game/skins';
import CosmeticEditor from './CosmeticEditor';

// Owned-cosmetics editor from the original skins menu (hat + overlay slots).
export default function SkinCosmeticsPanel({ profile, onProfile }) {
  const [editing, setEditing] = useState(null);
  const owned = SHOP_COSMETICS.filter((item) => (profile.ownedCosmetics || []).includes(item.id));

  const toggle = (item) => {
    const equipped = { ...(profile.equippedCosmetics || {}) };
    equipped[item.slot] = equipped[item.slot] === item.id ? null : item.id;
    onProfile({ ...profile, equippedCosmetics: equipped });
  };

  if (!owned.length) {
    return (
      <div className="cosmetics-editor">
        <div className="cosmetics-empty">You do not own any cosmetics yet. Buy hats and overlays in the Shop.</div>
      </div>
    );
  }

  return (
    <div className="cosmetics-editor">
      <div className="cosmetics-owned-grid">
        {owned.map((item) => {
          const equipped = profile.equippedCosmetics?.[item.slot] === item.id;
          return (
            <div key={item.id} className="cosmetic-card-row">
              <button type="button" className={`cosmetic-card${equipped ? ' active equipped' : ''}`} style={{ flex: 1 }} onClick={() => toggle(item)}>
                <span className="cosmetic-icon">{item.icon}</span>
                <span className="cosmetic-name">{item.name}</span>
              </button>
              <button type="button" className="cosmetic-adjust-btn" onClick={() => setEditing(item.id)}>Adjust</button>
            </div>
          );
        })}
      </div>
      <div className="cosmetic-slot-note">One hat, one overlay and one badge can be equipped together. Tap an owned cosmetic to equip it, or Adjust to open the fullscreen editor.</div>

      {editing && (
        <CosmeticEditor profile={profile} cosmeticId={editing} onProfile={onProfile} onClose={() => setEditing(null)} />
      )}
    </div>
  );
}