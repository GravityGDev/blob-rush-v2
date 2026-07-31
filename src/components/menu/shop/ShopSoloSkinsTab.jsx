import { INDIVIDUAL_SHOP_SKINS } from '@/game/skins';
import SkinPreviewCanvas from '../SkinPreviewCanvas';

export default function ShopSoloSkinsTab({ profile, onBuySkin }) {
  return (
    <div className="shop-grid shop-grid-packs">
      {INDIVIDUAL_SHOP_SKINS.map((skin) => {
        const owned = profile.ownedSkins.includes(skin.id);
        return (
          <article key={skin.id} className="shop-card shop-card--pack">
            <div className="shop-card-top">
              <div><h3>{skin.name}</h3><p>{skin.description || 'Animated skin available for individual purchase.'}</p></div>
              {owned && <span className="shop-owned-chip">Owned</span>}
            </div>
            <div className="shop-pack-preview">
              <span className="shop-pack-label">Live preview</span>
              <SkinPreviewCanvas compact profile={profile} skinId={skin.id} />
            </div>
            <div className="shop-feature-pills">
              <span className="shop-feature-pill">{skin.rarity || 'Premium'}</span>
              {skin.limited && <span className="shop-feature-pill shop-feature-pill--limited">Limited</span>}
              <span className="shop-feature-pill">{skin.reactive ? 'Reactive' : 'Animated'}</span>
            </div>
            <div className="shop-card-bottom">
              <span className="shop-price">🪙 {skin.price}</span>
              <button className="shop-buy-btn" disabled={owned} onClick={() => onBuySkin(skin.id)}>{owned ? 'Purchased' : 'Buy Skin'}</button>
            </div>
          </article>
        );
      })}
    </div>
  );
}