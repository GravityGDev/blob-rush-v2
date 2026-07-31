import { SKIN_PACKS, INDIVIDUAL_SHOP_SKINS, getSkin } from '@/game/skins';
import { skinBackground, skinPreviewClass, rarityColor } from '@/game/skinUi';

export default function ShopSkinsTab({ profile, onBuyPack, onBuySkin }) {
  return (
    <>
      <h3 style={{ margin: '0 0 10px', fontSize: 16 }}>Skin packs</h3>
      <div className="shop-grid wide">
        {SKIN_PACKS.map((pack) => {
          const owned = profile.purchasedPacks.includes(pack.id);
          return (
            <div key={pack.id} className={`shop-item${owned ? ' owned' : ''}`}>
              <span className="icon">{pack.icon}</span>
              <h4>{pack.name}</h4>
              <p>{pack.description}</p>
              <div className="row" style={{ gap: 6, flexWrap: 'wrap' }}>
                {pack.skinIds.map((id) => {
                  const skin = getSkin(id);
                  return <span key={id} className={`skin-swatch ${skinPreviewClass(skin)}`} style={{ width: 26, height: 26, borderWidth: 2, background: skinBackground(skin), borderColor: skin.accent }} />;
                })}
              </div>
              <div className="row">
                <span className="price-tag">🪙 {pack.price}</span>
                <button className="buy-btn" disabled={owned || profile.coins < pack.price} onClick={() => onBuyPack(pack.id)}>
                  {owned ? 'Owned' : 'Buy pack'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <h3 style={{ margin: '22px 0 10px', fontSize: 16 }}>Individual skins</h3>
      <div className="shop-grid">
        {INDIVIDUAL_SHOP_SKINS.map((skin) => {
          const owned = profile.ownedSkins.includes(skin.id);
          return (
            <div key={skin.id} className={`shop-item${owned ? ' owned' : ''}`}>
              <span className={`skin-swatch ${skinPreviewClass(skin)}`} style={{ background: skinBackground(skin), borderColor: skin.accent }} />
              <span className="skin-preview-rarity" style={{ background: rarityColor(skin.rarity), alignSelf: 'flex-start' }}>{skin.rarity}</span>
              <h4>{skin.name}{skin.limited ? ' ⏳' : ''}</h4>
              <p>{skin.description}</p>
              <div className="row">
                <span className="price-tag">🪙 {skin.price}</span>
                <button className="buy-btn" disabled={owned || profile.coins < skin.price} onClick={() => onBuySkin(skin.id)}>
                  {owned ? 'Owned' : 'Buy'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}