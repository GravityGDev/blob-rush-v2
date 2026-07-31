import { useState } from 'react';
import { SHOP_BOOSTERS, PLAYER_BADGES, badgePreviewSvg } from '@/game/skins';
import { boosterRemainingMs, formatDurationShort } from '@/game/progression';

export default function ShopExtrasTab({ profile, onBuyBooster, onEquipBadge, onRedeem }) {
  const [code, setCode] = useState('');

  return (
    <>
      <h3 style={{ margin: '0 0 10px', fontSize: 16 }}>Boosters</h3>
      <div className="shop-grid wide">
        {SHOP_BOOSTERS.map((booster) => {
          const remaining = boosterRemainingMs(profile, booster.id);
          return (
            <div key={booster.id} className={`shop-item${remaining > 0 ? ' owned' : ''}`}>
              <span className="icon">{booster.icon}</span>
              <h4>{booster.name}</h4>
              <p>{booster.description}{remaining > 0 ? ` · Active for ${formatDurationShort(remaining)}` : ''}</p>
              <div className="row">
                <button className="buy-btn" disabled={profile.coins < booster.price6h} onClick={() => onBuyBooster(booster.id, 6)}>6h · 🪙 {booster.price6h}</button>
                <button className="buy-btn secondary" disabled={profile.coins < booster.price24h} onClick={() => onBuyBooster(booster.id, 24)}>24h · 🪙 {booster.price24h}</button>
              </div>
            </div>
          );
        })}
      </div>

      <h3 style={{ margin: '22px 0 10px', fontSize: 16 }}>Badges</h3>
      <div className="shop-grid">
        {PLAYER_BADGES.map((badge) => {
          const equipped = profile.equippedBadge === badge.id;
          return (
            <div key={badge.id} className={`shop-item${equipped ? ' owned' : ''}`}>
              <span className="badge-preview" dangerouslySetInnerHTML={{ __html: badgePreviewSvg(badge) }} />
              <h4>{badge.name}</h4>
              <p>{badge.description}</p>
              <button className={`buy-btn${equipped ? ' equipped' : ''}`} onClick={() => onEquipBadge(badge.id)}>
                {equipped ? '✓ Equipped' : 'Equip'}
              </button>
            </div>
          );
        })}
      </div>

      <h3 style={{ margin: '22px 0 10px', fontSize: 16 }}>Redeem a code</h3>
      <div className="redeem-row">
        <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Enter code" maxLength={20} />
        <button className="buy-btn" style={{ flex: '0 0 auto', padding: '10px 22px' }} onClick={() => { onRedeem(code); setCode(''); }}>Redeem</button>
      </div>
    </>
  );
}