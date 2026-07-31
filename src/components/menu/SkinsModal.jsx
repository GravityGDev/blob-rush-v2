import { useMemo, useState } from 'react';
import ModalShell from './ModalShell';
import SkinPreviewCanvas from './SkinPreviewCanvas';
import { getAvailableSkins, getSkin } from '@/game/skins';
import { rarityColor, skinBackground, skinPreviewClass, getSkinCategory, isSkinOwned, filterSkins, categoryIntro } from '@/game/skinUi';
import SkinCosmeticsPanel from './SkinCosmeticsPanel';
import SkinBadgesPanel from './SkinBadgesPanel';
import CosmeticEditor from './CosmeticEditor';

const FILTERS = [
  { id: 'owned', label: 'Owned' },
  { id: 'premium', label: 'Premium' },
  { id: 'free', label: 'Free' },
  { id: 'creators', label: 'Creators' },
  { id: 'vip', label: 'VIP Skins' },
  { id: 'cosmetics', label: 'Cosmetics' },
  { id: 'badges', label: 'Badges' },
];

export default function SkinsModal({ profile, onEquip, onProfile, onClose }) {
  const [filter, setFilter] = useState('owned');
  const [previewId, setPreviewId] = useState(profile.skin);
  const [editorOpen, setEditorOpen] = useState(false);
  const [cosmeticSel, setCosmeticSel] = useState(null);

  const isCosmetics = filter === 'cosmetics';
  const isBadges = filter === 'badges';
  const skins = useMemo(() => filterSkins(profile, getAvailableSkins(), filter), [profile, filter]);
  const preview = getSkin(skins.some((s) => s.id === previewId) ? previewId : skins[0]?.id || profile.skin);
  const owned = isSkinOwned(profile, preview.id);
  const equipped = profile.skin === preview.id;

  return (
    <ModalShell title="Skins" onClose={onClose} bodyClass="skins-layout">
      <aside className="skin-preview-panel">
        <div className={`skin-preview-stage${isCosmetics ? ' grid-bg' : ''}`}>
          <SkinPreviewCanvas profile={profile} skinId={preview.id} />
        </div>
        <div>
          <span className="skin-preview-rarity" style={{ background: isCosmetics ? '#f59e0b' : rarityColor(preview.rarity) }}>
            {isCosmetics ? 'Cosmetic' : preview.rarity}
          </span>
          <h3 className="skin-preview-name">{isCosmetics ? (cosmeticSel?.name || 'Cosmetics') : preview.name}</h3>
          <p className="skin-preview-type" hidden={isCosmetics}>
            {preview.pattern === 'custom' ? 'VIP custom skin • uploaded by you' : `${preview.animated ? 'Premium animated' : 'Free static'} skin`}
          </p>
          <div className="skin-preview-status" hidden={isCosmetics}>
            <span className="skin-preview-pill">{equipped ? '✓ Currently equipped' : owned ? 'Ready to equip' : '🔒 Not owned'}</span>
            <span className="skin-preview-pill">{getSkinCategory(preview) === 'vip' ? 'VIP' : preview.animated ? 'Premium' : 'Free'}</span>
            {preview.reactive && <span className="skin-preview-pill">Reactive movement FX</span>}
          </div>
        </div>
        {isCosmetics && (
          <button className="cos-edit-fullscreen" onClick={() => setEditorOpen(true)}>⛶ Edit Cosmetics Full Screen</button>
        )}
        <button className="skin-equip-btn" hidden={isCosmetics || isBadges} disabled={equipped || !owned} onClick={() => onEquip(preview.id)}>
          {equipped ? 'Equipped' : owned ? 'Equip' : 'Locked'}
        </button>
      </aside>

      <section className="skin-browser">
        <div className="shop-top">{categoryIntro(filter)}</div>
        <div className="skin-filter-row">
          {FILTERS.map((f) => (
            <button key={f.id} className={`skin-filter-btn${filter === f.id ? ' active' : ''}`} onClick={() => setFilter(f.id)}>{f.label}</button>
          ))}
        </div>
        {isCosmetics && <SkinCosmeticsPanel profile={profile} onProfile={onProfile} onSelect={setCosmeticSel} />}
        {isBadges && <SkinBadgesPanel profile={profile} onProfile={onProfile} />}
        <div className="shop-message" hidden={isCosmetics || isBadges}>
          {filter === 'premium'
            ? `${skins.filter((s) => isSkinOwned(profile, s.id)).length}/${skins.length} premium skins owned`
            : `${skins.length} skin${skins.length === 1 ? '' : 's'} shown`}
        </div>
        <div className="skins-grid" hidden={isCosmetics || isBadges}>
          {skins.length === 0 && <div className="skin-empty-state">No skins are available in this category.</div>}
          {skins.map((skin) => (
            <button
              key={skin.id}
              className={`skin-card${profile.skin === skin.id ? ' selected' : ''}${preview.id === skin.id ? ' previewing' : ''}`}
              onClick={() => setPreviewId(skin.id)}
              onPointerEnter={() => setPreviewId(skin.id)}
            >
              <span className="skin-rarity" style={{ background: rarityColor(skin.rarity) }}>{skin.rarity}</span>
              <span className={`skin-swatch ${skinPreviewClass(skin)}`} style={{ background: skinBackground(skin), borderColor: skin.accent }} />
              <span className="skin-name">{skin.name}</span>
              <small className={skin.reactive ? 'reactive' : skin.animated ? 'animated' : 'static'}>
                {skin.reactive ? 'Reactive' : skin.animated ? 'Animated' : 'Static'}
              </small>
              {profile.skin === skin.id
                ? <span className="skin-equipped-badge">✓ Equipped</span>
                : !isSkinOwned(profile, skin.id) && <span className="skin-locked-badge">🔒 Shop</span>}
            </button>
          ))}
        </div>
      </section>

      {editorOpen && (
        <CosmeticEditor profile={profile} cosmeticId={cosmeticSel?.id} onProfile={onProfile} onClose={() => setEditorOpen(false)} />
      )}
    </ModalShell>
  );
}