import { useState } from 'react';
import '@/styles/blobrush-cosmetic.css';
import { SHOP_COSMETICS, findCosmetic, getDefaultCosmeticTransform } from '@/game/skins';
import CosmeticStage from './cosmetic/CosmeticStage';

const SECTIONS = [
  { slot: 'hat', title: 'Hats' },
  { slot: 'overlay', title: 'Overlays' },
];

// Fullscreen hat + overlay customisation editor.
export default function CosmeticEditor({ profile, cosmeticId, onProfile, onClose }) {
  const owned = SHOP_COSMETICS.filter((i) => (profile.ownedCosmetics || []).includes(i.id));
  const [equipped, setEquipped] = useState(() => ({ hat: null, overlay: null, ...(profile.equippedCosmetics || {}) }));
  const [transforms, setTransforms] = useState(() => ({ ...(profile.cosmeticTransforms || {}) }));
  const [selected, setSelected] = useState(cosmeticId || equipped.hat || equipped.overlay || owned[0]?.id || null);

  const item = findCosmetic(selected);
  const defaults = item ? getDefaultCosmeticTransform(item) : {};
  const draft = { ...defaults, ...(transforms[selected] || {}) };

  const patch = (next) => setTransforms((t) => ({ ...t, [selected]: { ...draft, ...next } }));

  const pick = (entry) => {
    setSelected(entry.id);
    setEquipped((e) => ({ ...e, [entry.slot]: entry.id }));
  };

  const previewProfile = { ...profile, equippedCosmetics: equipped, cosmeticTransforms: transforms };

  const save = () => {
    onProfile({ ...profile, equippedCosmetics: equipped, cosmeticTransforms: transforms });
    onClose();
  };

  return (
    <div className="cosmetic-editor-overlay">
      <CosmeticStage previewProfile={previewProfile} skinId={profile.skin} draft={draft} onDraft={patch} />

      <aside className="cos-panel">
        <header className="cos-panel-head">
          <div>
            <span className="cos-kicker">Hat + Overlay Customisation</span>
            <h2>Cosmetic Editor</h2>
          </div>
          <button className="cos-close" onClick={onClose} aria-label="Close">✕</button>
        </header>

        <div className="cos-panel-body">
          {SECTIONS.map((sec) => {
            const list = owned.filter((i) => i.slot === sec.slot);
            if (!list.length) return null;
            return (
              <div key={sec.slot} className="cos-section">
                <h3>{sec.title}</h3>
                <div className="cos-card-grid">
                  {list.map((entry) => (
                    <button key={entry.id} type="button"
                      className={`cos-card${selected === entry.id ? ' selected' : ''}`}
                      onClick={() => pick(entry)}>
                      <span className="cos-card-icon">{entry.icon}</span>
                      <span className="cos-card-name">{entry.name}</span>
                      {equipped[entry.slot] === entry.id && <span className="cos-card-badge">Equipped</span>}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
          {!owned.length && <div className="cos-empty">You do not own any cosmetics yet. Buy hats and overlays in the Shop.</div>}
        </div>

        {item && (
          <div className="cos-controls">
            <div className="cos-controls-head">
              <strong>{item.name}</strong>
              <span>{item.slot === 'hat' ? 'Hat slot' : 'Overlay slot'} · {draft.layer === 'back' ? 'Behind cell' : 'In front'}</span>
            </div>
            <div className="cos-controls-grid">
              <button className={draft.layer === 'back' ? 'primary' : ''} onClick={() => patch({ layer: 'back' })}>Behind Cell</button>
              <button className={draft.layer !== 'back' ? 'primary' : ''} onClick={() => patch({ layer: 'front' })}>Bring To Front</button>
              <button onClick={() => patch({ x: 0, y: 0 })}>Centre</button>
              <button onClick={() => patch({ rotation: 0 })}>Reset rotation</button>
            </div>
            <div className="cos-controls-grid small">
              <button onClick={() => patch({ ...defaults })}>Reset Selected</button>
              <button className="danger" onClick={() => setEquipped((e) => ({ ...e, [item.slot]: null }))}>Unequip Slot</button>
            </div>
          </div>
        )}

        <footer className="cos-footer">
          <button className="cancel" onClick={onClose}>Cancel</button>
          <button className="save" onClick={save}>Save Hat &amp; Overlay</button>
        </footer>
      </aside>
    </div>
  );
}