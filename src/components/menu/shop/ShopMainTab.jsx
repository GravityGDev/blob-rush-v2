import { useState } from 'react';
import { SHOP_COSMETICS, INDIVIDUAL_SHOP_SKINS } from '@/game/skins';
import { boosterRemainingMs, formatDurationShort } from '@/game/progression';
import SkinPreviewCanvas from '../SkinPreviewCanvas';

// "Main" shop landing tab from the original build: newest pack, cosmetic, solo skin, coupon and boost status.
export default function ShopMainTab({ profile, onBuyCosmetic, onBuySkin, onRedeem, onOpenTab }) {
  const [code, setCode] = useState('');
  const newestCosmetic = SHOP_COSMETICS[SHOP_COSMETICS.length - 1];
  const latestSingle = INDIVIDUAL_SHOP_SKINS[INDIVIDUAL_SHOP_SKINS.length - 1];
  const ownedCosmetic = profile.ownedCosmetics.includes(newestCosmetic.id);
  const ownedSingle = profile.ownedSkins.includes(latestSingle.id);
  const massRemaining = boosterRemainingMs(profile, 'mass');
  const xpRemaining = boosterRemainingMs(profile, 'xp');
  const redeem = () => { if (code.trim()) { onRedeem(code.trim()); setCode(''); } };

  return (
    <div className="shop-grid shop-grid-main">
      <article className="shop-card shop-card--pack">
        <div className="shop-card-top">
          <div><h3>{newestCosmetic.name}</h3><p>Newest cosmetic drop • {newestCosmetic.slot === 'hat' ? 'Hat' : 'Overlay'} cosmetic with full adjustment controls.</p></div>
          {ownedCosmetic && <span className="shop-owned-chip">Owned</span>}
        </div>
        <div className="shop-pack-preview">
          <span className="shop-pack-label">Newest cosmetic</span>
          <SkinPreviewCanvas profile={{ ...profile, cosmeticPreview: { id: newestCosmetic.id } }} skinId={profile.skin} />
        </div>
        <div className="shop-card-bottom">
          <span className="shop-price">🪙 {newestCosmetic.price}</span>
          <div className="shop-card-links">
            <button className="shop-mini-btn" onClick={() => onOpenTab('cosmetics')}>View cosmetics</button>
            <button className="shop-buy-btn" disabled={ownedCosmetic} onClick={() => onBuyCosmetic(newestCosmetic.id)}>{ownedCosmetic ? 'Purchased' : 'Buy Cosmetic'}</button>
          </div>
        </div>
      </article>

      <article className="shop-card shop-card--pack">
        <div className="shop-card-top">
          <div><h3>{latestSingle.name}</h3><p>{latestSingle.description || 'Animated skin sold separately from packs.'}</p></div>
          {ownedSingle && <span className="shop-owned-chip">Owned</span>}
        </div>
        <div className="shop-pack-preview">
          <span className="shop-pack-label">Newest animated skin</span>
          <SkinPreviewCanvas profile={profile} skinId={latestSingle.id} />
        </div>
        <div className="shop-feature-pills">
          <span className="shop-feature-pill">{latestSingle.rarity || 'Premium'}</span>
          {latestSingle.limited && <span className="shop-feature-pill shop-feature-pill--limited">Limited</span>}
          <span className="shop-feature-pill">Animated</span>
          <span className="shop-feature-pill">Sold solo</span>
        </div>
        <div className="shop-card-bottom">
          <span className="shop-price">🪙 {latestSingle.price}</span>
          <div className="shop-card-links">
            <button className="shop-mini-btn" onClick={() => onOpenTab('skins')}>View animated skins</button>
            <button className="shop-buy-btn" disabled={ownedSingle} onClick={() => onBuySkin(latestSingle.id)}>{ownedSingle ? 'Purchased' : 'Buy Skin'}</button>
          </div>
        </div>
      </article>

      <article className="shop-card">
        <div className="shop-card-top"><div><h3>Coupon / Redeem</h3><p>Redeem testing codes for coins, cosmetics or extra booster time.</p></div></div>
        <div className="shop-coupon-card">
          <div className="shop-coupon-row">
            <input className="shop-coupon-input" maxLength={24} placeholder="Enter code" value={code}
              onChange={(e) => setCode(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') redeem(); }} />
            <button className="shop-buy-btn" onClick={redeem}>Redeem</button>
          </div>
          <div className="shop-note">Test codes: <b>WELCOME500</b>, <b>MASS6H</b>, <b>XP24H</b>, <b>SPARKLE</b>.</div>
          <div className="shop-note">Boost rewards extend the existing timer automatically, even if a booster is already active.</div>
        </div>
      </article>

      <article className="shop-card">
        <div className="shop-card-top"><div><h3>Boost Status</h3><p>Boosters are now time-based. Buy 6h or 24h durations. You must wait until a purchased boost ends before buying that same boost again.</p></div></div>
        <div className="shop-boost-state">Mass Boost: {massRemaining ? `Active • ${formatDurationShort(massRemaining)} left` : 'Inactive'}</div>
        <div className="shop-boost-state">XP Boost: {xpRemaining ? `Active • ${formatDurationShort(xpRemaining)} left` : 'Inactive'}</div>
        <div className="shop-card-bottom">
          <span className="shop-price">Rewards stack time</span>
          <button className="shop-mini-btn" onClick={() => onOpenTab('boosters')}>Open boosters</button>
        </div>
      </article>
    </div>
  );
}