import '@/styles/blobrush-cosmetic.css';
import { SHOP_COSMETICS, getCosmeticShopCategory } from '@/game/skins';
import SkinPreviewCanvas from '../SkinPreviewCanvas';

// Cosmetic shop cards, matching the original build's card layout.
export default function ShopCosmeticsTab({ profile, category, onBuy, onEquip }) {
  const items = SHOP_COSMETICS.filter((item) => category === 'all' || getCosmeticShopCategory(item) === category);

  return (
    <div className="shop-grid" id="shopCosmeticsGrid">
      {items.map((item) => {
        const owned = profile.ownedCosmetics.includes(item.id);
        const equipped = profile.equippedCosmetics[item.slot] === item.id;
        return (
          <article key={item.id} className="shop-card">
            <div className="shop-card-top">
              <div style={{ display: 'flex', gap: 10 }}>
                <span className="shop-card-icon">{item.icon}</span>
                <div><h3>{item.name}</h3><p>{item.slot === 'hat' ? 'Hat slot' : 'Overlay slot'} · {getCosmeticShopCategory(item)}</p></div>
              </div>
              {owned && <span className="shop-owned-chip">Owned</span>}
            </div>
            <div className="cosmetic-shop-preview">
              <span className="shop-pack-label">Live preview</span>
              <SkinPreviewCanvas compact hideCell profile={{ ...profile, equippedCosmetics: {}, cosmeticPreview: { id: item.id } }} skinId={profile.skin} />
            </div>
            <div className="shop-card-bottom">
              <span className="shop-price">{owned ? 'Adjustable in Skins' : `🪙 ${item.price}`}</span>
              {owned
                ? <button className="shop-buy-btn" disabled={equipped} onClick={() => onEquip(item.id)}>{equipped ? 'Equipped' : 'Equip'}</button>
                : <button className="shop-buy-btn" disabled={profile.coins < item.price} onClick={() => onBuy(item.id)}>Buy Cosmetic</button>}
            </div>
          </article>
        );
      })}
    </div>
  );
}