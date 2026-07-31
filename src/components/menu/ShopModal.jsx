import { useState } from 'react';
import ModalShell from './ModalShell';
import '@/styles/blobrush-shop.css';
import ShopSkinsTab from './shop/ShopSkinsTab';
import ShopCosmeticsTab from './shop/ShopCosmeticsTab';
import ShopSocialTab from './shop/ShopSocialTab';
import ShopExtrasTab from './shop/ShopExtrasTab';
import {
  buySkinPack, buySingleSkin, buyCosmetic, equipCosmetic, equipBadge,
  buySocial, toggleFavoriteSocial, buyBooster, redeemCode,
} from '@/game/shop';

const TABS = [
  { id: 'skins', label: '🎨 Skins' },
  { id: 'cosmetics', label: '👑 Cosmetics' },
  { id: 'social', label: '😀 Emojis & Emotes' },
  { id: 'extras', label: '⚡ Boosters & Codes' },
];

export default function ShopModal({ profile, onProfile, onClose }) {
  const [tab, setTab] = useState('skins');
  const [note, setNote] = useState('');

  const run = (result) => {
    setNote(result.message);
    if (result.ok) onProfile(result.profile);
  };

  return (
    <ModalShell
      title="Shop"
      onClose={onClose}
      extraHead={<span className="shop-balance">🪙 {profile.coins.toLocaleString()} <span className="tokens">🎟️ {profile.tokens}</span></span>}
    >
      <div className="shop-tabs">
        {TABS.map((t) => (
          <button key={t.id} className={`shop-tab${tab === t.id ? ' active' : ''}`} onClick={() => setTab(t.id)}>{t.label}</button>
        ))}
      </div>
      <div className="shop-note">{note}</div>

      {tab === 'skins' && (
        <ShopSkinsTab
          profile={profile}
          onBuyPack={(id) => run(buySkinPack(profile, id))}
          onBuySkin={(id) => run(buySingleSkin(profile, id))}
        />
      )}
      {tab === 'cosmetics' && (
        <ShopCosmeticsTab
          profile={profile}
          onBuy={(id) => run(buyCosmetic(profile, id))}
          onEquip={(id) => run(equipCosmetic(profile, id))}
        />
      )}
      {tab === 'social' && (
        <ShopSocialTab
          profile={profile}
          onBuy={(kind, id) => run(buySocial(profile, kind, id))}
          onFavorite={(kind, id) => run(toggleFavoriteSocial(profile, kind, id))}
        />
      )}
      {tab === 'extras' && (
        <ShopExtrasTab
          profile={profile}
          onBuyBooster={(id, hours) => run(buyBooster(profile, id, hours))}
          onEquipBadge={(id) => run(equipBadge(profile, id))}
          onRedeem={(code) => run(redeemCode(profile, code))}
        />
      )}
    </ModalShell>
  );
}