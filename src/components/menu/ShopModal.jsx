import { useState } from 'react';
import ModalShell from './ModalShell';
import '@/styles/blobrush-shop.css';
import ShopMainTab from './shop/ShopMainTab';
import ShopSoloSkinsTab from './shop/ShopSoloSkinsTab';
import ShopBoostersTab from './shop/ShopBoostersTab';
import ShopCosmeticsTab from './shop/ShopCosmeticsTab';
import ShopSocialTab from './shop/ShopSocialTab';
import {
  buySingleSkin, buyCosmetic, equipCosmetic,
  buySocial, toggleFavoriteSocial, buyBooster, redeemCode,
} from '@/game/shop';

const TABS = [
  { id: 'main', label: 'Main' },
  { id: 'skins', label: 'Animated Skins' },
  { id: 'boosters', label: 'Boosters' },
  { id: 'cosmetics', label: 'Cosmetics' },
  { id: 'social', label: 'Emojis & Emotes' },
];
const COSMETIC_CATS = [
  { id: 'all', label: 'All' },
  { id: 'hats', label: 'Hats' },
  { id: 'face', label: 'Face' },
  { id: 'rings', label: 'Rings' },
  { id: 'auras', label: 'Auras' },
  { id: 'effects', label: 'Effects' },
];
const SOCIAL_CATS = [
  { id: 'all', label: 'All' },
  { id: 'emoji', label: 'Emojis' },
  { id: 'emote', label: 'Emotes' },
  { id: 'favourites', label: '★ Favourites' },
];

export default function ShopModal({ profile, onProfile, onClose }) {
  const [tab, setTab] = useState('main');
  const [cosmeticCat, setCosmeticCat] = useState('all');
  const [socialCat, setSocialCat] = useState('all');
  const [note, setNote] = useState('');

  const run = (result) => {
    setNote(result.message);
    if (result.ok) onProfile(result.profile);
  };
  const subnav = tab === 'cosmetics' ? COSMETIC_CATS : tab === 'social' ? SOCIAL_CATS : null;
  const subActive = tab === 'cosmetics' ? cosmeticCat : socialCat;
  const setSub = tab === 'cosmetics' ? setCosmeticCat : setSocialCat;

  return (
    <ModalShell
      title="Shop"
      onClose={onClose}
      className="shop-modal"
      extraHead={<span className="shop-balance">🪙 {profile.coins.toLocaleString()}</span>}
      beforeBody={(
        <div className="shop-nav">
          <div className="shop-tabs">
            {TABS.map((t) => (
              <button key={t.id} className={`shop-tab${tab === t.id ? ' active' : ''}`} onClick={() => setTab(t.id)}>{t.label}</button>
            ))}
          </div>
          {subnav && (
            <div className="shop-subnav">
              <div className="shop-cosmetic-cats">
                {subnav.map((c) => (
                  <button key={c.id} className={`shop-cosmetic-cat${subActive === c.id ? ' active' : ''}`} onClick={() => setSub(c.id)}>{c.label}</button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    >
      <div className="shop-message">
        {tab === 'social' && !note ? 'Purchased reactions can be starred. Favourites always appear first in the in-game wheel.' : note}
      </div>

      {tab === 'main' && (
        <ShopMainTab
          profile={profile}
          onBuySkin={(id) => run(buySingleSkin(profile, id))}
          onBuyCosmetic={(id) => run(buyCosmetic(profile, id))}
          onRedeem={(code) => run(redeemCode(profile, code))}
          onOpenTab={setTab}
        />
      )}
      {tab === 'skins' && <ShopSoloSkinsTab profile={profile} onBuySkin={(id) => run(buySingleSkin(profile, id))} />}
      {tab === 'boosters' && <ShopBoostersTab profile={profile} onBuyBooster={(id, hours) => run(buyBooster(profile, id, hours))} />}
      {tab === 'cosmetics' && (
        <ShopCosmeticsTab
          profile={profile}
          category={cosmeticCat}
          onBuy={(id) => run(buyCosmetic(profile, id))}
          onEquip={(id) => run(equipCosmetic(profile, id))}
        />
      )}
      {tab === 'social' && (
        <ShopSocialTab
          profile={profile}
          category={socialCat}
          onBuy={(kind, id) => run(buySocial(profile, kind, id))}
          onFavorite={(kind, id) => run(toggleFavoriteSocial(profile, kind, id))}
        />
      )}
    </ModalShell>
  );
}