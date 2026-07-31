import { SKIN_PACKS, getSkin } from '@/game/skins';
import { skinBackground } from '@/game/skinUi';
import SkinPreviewCanvas from '../SkinPreviewCanvas';

export default function ShopPacksTab({ profile, onBuyPack }) {
  return (
    <div className="shop-grid shop-grid-packs">
      {SKIN_PACKS.map((pack) => {
        const owned = profile.purchasedPacks.includes(pack.id);
        const previewSkin = getSkin(pack.skinIds.find((id) => getSkin(id)?.animated) || pack.skinIds[0]);
        return (
          <article key={pack.id} className="shop-card shop-card--pack">
            <div className="shop-card-top">
              <div><h3>{pack.name}</h3><p>{pack.description}</p></div>
              {owned && <span className="shop-owned-chip">Owned</span>}
            </div>
            <div className="shop-pack-preview">
              <span className="shop-pack-label">Live preview</span>
              <SkinPreviewCanvas compact profile={profile} skinId={previewSkin.id} />
            </div>
            <div className="shop-pack-swatches">
              {pack.skinIds.slice(0, 6).map((id) => {
                const skin = getSkin(id);
                return <span key={id} className="shop-pack-swatch" title={skin.name} style={{ background: skinBackground(skin), borderColor: skin.accent }} />;
              })}
            </div>
            <div className="shop-card-bottom">
              <span className="shop-price">🪙 {pack.price}</span>
              <button className="shop-buy-btn" disabled={owned} onClick={() => onBuyPack(pack.id)}>{owned ? 'Purchased' : 'Buy Pack'}</button>
            </div>
          </article>
        );
      })}
    </div>
  );
}