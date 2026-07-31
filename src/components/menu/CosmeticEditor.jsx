import { useState } from 'react';
import '@/styles/blobrush-cosmetic.css';
import { SHOP_COSMETICS, findCosmetic, getDefaultCosmeticTransform } from '@/game/skins';
import CosmeticStage from './cosmetic/CosmeticStage';

const SECTIONS = [
  { slot: 'hat', title: 'Hats' },
  { slot: 'overlay', title: 'Overlays' },
];

// Fullscreen hat + overlay customisation editor (1:1 with the original build).
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
    <div className="cosmetic-fs-editor">
      <CosmeticStage previewProfile={previewProfile} skinId={profile.skin} draft={draft} onDraft={patch} hasItem={!!item} />

      <aside className="cosmetic-fs-panel">
        <div className="cosmetic-fs-head">
          <div>
            <small>Hat + Overlay Customisation</small>
            <h2>Cosmetic Editor</h2>
          </div>
          <button onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="cosmetic-fs-list">
          {SECTIONS.map((sec) => {
            const list = owned.filter((i) => i.slot === sec.slot);
            if (!list.length) return null;
            return [
              <div key={`${sec.slot}-head`} className="cosmetic-fs-section-head"><b>{sec.title}</b><i /></div>,
              ...list.map((entry) => (
                <button key={entry.id} type="button"
                  className={`cosmetic-fs-card${selected === entry.id ? ' active' : ''}${equipped[entry.slot] === entry.id ? ' equipped' : ''}`}
                  onClick={() => pick(entry)}>
                  <span className="cosmetic-icon">{entry.icon}</span>
                  <span className="cosmetic-name">{entry.name}</span>
                </button>
              )),
            ];
          })}
          {!owned.length && <div className="cosmetics-empty">You do not own any cosmetics yet. Buy hats and overlays in the Shop.</div>}
        </div>

        {item && (
          <div className="cosmetic-fs-selected">
            <div className="cosmetic-control-head">
              <h4>{item.name}</h4>
              <span>{item.slot === 'hat' ? 'Hat slot' : 'Overlay slot'} · {draft.layer === 'back' ? 'Behind cell' : 'In front'}</span>
            </div>
            <div className="cosmetic-layer-actions">
              <button className={draft.layer === 'back' ? 'active' : ''} onClick={() => patch({ layer: 'back' })}>Behind Cell</button>
              <button className={draft.layer !== 'back' ? 'active' : ''} onClick={() => patch({ layer: 'front' })}>Bring To Front</button>
              <button onClick={() => patch({ x: 0, y: 0 })}>Centre</button>
              <button onClick={() => patch({ rotation: 0 })}>Reset rotation</button>
            </div>
            <div className="cosmetic-actions">
              <button className="cosmetic-reset" onClick={() => patch({ ...defaults })}>Reset Selected</button>
              <button className="cosmetic-remove" onClick={() => setEquipped((e) => ({ ...e, [item.slot]: null }))}>Unequip Slot</button>
            </div>
          </div>
        )}

        <div className="cosmetic-fs-footer">
          <button className="cosmetic-fs-cancel" onClick={onClose}>Cancel</button>
          <button className="cosmetic-fs-save" onClick={save}>Save Hat &amp; Overlay</button>
        </div>
      </aside>
    </div>
  );
}