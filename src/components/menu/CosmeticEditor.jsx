import { useState } from 'react';
import '@/styles/blobrush-cosmetic.css';
import { findCosmetic, getDefaultCosmeticTransform } from '@/game/skins';
import SkinPreviewCanvas from './SkinPreviewCanvas';

const FIELDS = [
  { key: 'scale', label: 'Size', min: 0.35, max: 2.2, step: 0.01, format: (v) => `${Math.round(v * 100)}%` },
  { key: 'x', label: 'Horizontal', min: -90, max: 90, step: 1, format: (v) => `${Math.round(v)}` },
  { key: 'y', label: 'Vertical', min: -120, max: 90, step: 1, format: (v) => `${Math.round(v)}` },
  { key: 'rotation', label: 'Rotation', min: -180, max: 180, step: 1, format: (v) => `${Math.round(v)}°` },
];

// Fullscreen cosmetic adjustment editor with a live in-game preview.
export default function CosmeticEditor({ profile, cosmeticId, onProfile, onClose }) {
  const item = findCosmetic(cosmeticId);
  const defaults = getDefaultCosmeticTransform(item);
  const [draft, setDraft] = useState(() => ({ ...defaults, ...(profile.cosmeticTransforms?.[cosmeticId] || {}) }));
  if (!item) return null;

  const set = (key, value) => setDraft((d) => ({ ...d, [key]: value }));
  const previewProfile = { ...profile, cosmeticPreview: { id: cosmeticId, transform: draft } };

  const save = () => {
    onProfile({
      ...profile,
      equippedCosmetics: { ...profile.equippedCosmetics, [item.slot]: cosmeticId },
      cosmeticTransforms: { ...profile.cosmeticTransforms, [cosmeticId]: { ...draft } },
    });
    onClose();
  };

  return (
    <div className="cosmetic-editor-overlay">
      <div className="cosmetic-editor-head">
        <div>
          <h2>{item.icon} {item.name}</h2>
          <p>{item.slot === 'hat' ? 'Hat slot' : 'Overlay slot'} · adjust size, position, rotation and layer</p>
        </div>
        <button className="close-btn" onClick={onClose} aria-label="Close">✕</button>
      </div>

      <div className="cosmetic-editor-body">
        <div className="cosmetic-editor-stage">
          <SkinPreviewCanvas profile={previewProfile} skinId={profile.skin} />
          <span className="cosmetic-editor-hint">Live preview using your equipped skin</span>
        </div>

        <div className="cosmetic-editor-side">
          {FIELDS.map((f) => (
            <div key={f.key} className="cosmetic-editor-field">
              <label>{f.label}<b>{f.format(Number(draft[f.key] ?? 0))}</b></label>
              <input type="range" min={f.min} max={f.max} step={f.step}
                value={Number(draft[f.key] ?? (f.key === 'scale' ? 1 : 0))}
                onChange={(e) => set(f.key, Number(e.target.value))} />
            </div>
          ))}

          <div className="cosmetic-editor-field">
            <label>Layer<b>{draft.layer === 'back' ? 'Behind cell' : 'In front'}</b></label>
            <div className="cosmetic-layer-row">
              <button className={draft.layer === 'back' ? 'active' : ''} onClick={() => set('layer', 'back')}>Behind</button>
              <button className={draft.layer !== 'back' ? 'active' : ''} onClick={() => set('layer', 'front')}>In front</button>
            </div>
          </div>

          <div className="cosmetic-editor-actions">
            <button className="reset" onClick={() => setDraft({ ...defaults })}>Reset</button>
            <button className="save" onClick={save}>Save &amp; Equip</button>
          </div>
        </div>
      </div>
    </div>
  );
}