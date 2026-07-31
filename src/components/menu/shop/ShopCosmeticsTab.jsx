import { useState } from 'react';
import { SHOP_COSMETICS, getCosmeticShopCategory } from '@/game/skins';

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'hats', label: 'Hats' },
  { id: 'face', label: 'Face' },
  { id: 'rings', label: 'Rings' },
  { id: 'auras', label: 'Auras' },
  { id: 'effects', label: 'Effects' },
];

export default function ShopCosmeticsTab({ profile, onBuy, onEquip }) {
  const [category, setCategory] = useState('all');
  const items = SHOP_COSMETICS.filter((item) => category === 'all' || getCosmeticShopCategory(item) === category);

  return (
    <>
      <div className="shop-tabs">
        {CATEGORIES.map((c) => (
          <button key={c.id} className={`shop-tab${category === c.id ? ' active' : ''}`} onClick={() => setCategory(c.id)}>{c.label}</button>
        ))}
      </div>
      <div className="shop-grid">
        {items.map((item) => {
          const owned = profile.ownedCosmetics.includes(item.id);
          const equipped = profile.equippedCosmetics[item.slot] === item.id;
          return (
            <div key={item.id} className={`shop-item${owned ? ' owned' : ''}`}>
              <span className="icon">{item.icon}</span>
              <h4>{item.name}</h4>
              <p>{item.slot === 'hat' ? 'Hat slot' : 'Overlay slot'} · {getCosmeticShopCategory(item)}</p>
              <div className="row">
                {owned ? (
                  <button className={`buy-btn${equipped ? ' equipped' : ''}`} onClick={() => onEquip(item.id)}>
                    {equipped ? '✓ Equipped' : 'Equip'}
                  </button>
                ) : (
                  <>
                    <span className="price-tag">🪙 {item.price}</span>
                    <button className="buy-btn" disabled={profile.coins < item.price} onClick={() => onBuy(item.id)}>Buy</button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}