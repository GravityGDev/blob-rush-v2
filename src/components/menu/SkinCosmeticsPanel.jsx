import { useEffect } from 'react';
import '@/styles/blobrush-cosmetic.css';
import { SHOP_COSMETICS } from '@/game/skins';

const SECTIONS = [
  { slot: 'hat', title: 'Hats', note: 'Equip one hat cosmetic above your cell.' },
  { slot: 'overlay', title: 'Overlays', note: 'Equip one overlay effect on your cell.' },
];

// Owned-cosmetics grid from the original skins menu (hat + overlay slots).
export default function SkinCosmeticsPanel({ profile, onProfile, onSelect }) {
  const owned = SHOP_COSMETICS.filter((item) => (profile.ownedCosmetics || []).includes(item.id));

  useEffect(() => {
    const current = owned.find((i) => profile.equippedCosmetics?.[i.slot] === i.id) || owned[0];
    if (current) onSelect?.(current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggle = (item) => {
    onSelect?.(item);
    const equipped = { ...(profile.equippedCosmetics || {}) };
    equipped[item.slot] = equipped[item.slot] === item.id ? null : item.id;
    onProfile({ ...profile, equippedCosmetics: equipped });
  };

  if (!owned.length) {
    return <div className="cos-empty">You do not own any cosmetics yet. Buy hats and overlays in the Shop.</div>;
  }

  return (
    <div className="cosmetics-editor">
      {SECTIONS.map((sec) => {
        const list = owned.filter((i) => i.slot === sec.slot);
        if (!list.length) return null;
        return (
          <div key={sec.slot} className="cos-section">
            <h3>{sec.title}</h3>
            <p>{sec.note}</p>
            <div className="cos-card-grid">
              {list.map((item) => {
                const equipped = profile.equippedCosmetics?.[item.slot] === item.id;
                return (
                  <button key={item.id} type="button" className={`cos-card${equipped ? ' selected' : ''}`} onClick={() => toggle(item)}>
                    <span className="cos-card-icon">{item.icon}</span>
                    <span className="cos-card-name">{item.name}</span>
                    {equipped && <span className="cos-card-badge">Equipped</span>}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}