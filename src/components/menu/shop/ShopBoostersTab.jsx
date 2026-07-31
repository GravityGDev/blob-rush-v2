import { SHOP_BOOSTERS } from '@/game/skins';
import { boosterRemainingMs, formatDurationShort } from '@/game/progression';

export default function ShopBoostersTab({ profile, onBuyBooster }) {
  return (
    <div className="shop-grid">
      {SHOP_BOOSTERS.map((booster) => {
        const remaining = boosterRemainingMs(profile, booster.id);
        const active = remaining > 0;
        return (
          <article key={booster.id} className="shop-card">
            <div className="shop-card-top">
              <div style={{ display: 'flex', gap: 10 }}>
                <span className="shop-card-icon">{booster.icon}</span>
                <div><h3>{booster.name}</h3><p>{booster.description}</p></div>
              </div>
            </div>
            <div className="shop-boost-state">{active ? `Active • ${formatDurationShort(remaining)} left` : 'Inactive • buy 6h or 24h access'}</div>
            <div className="shop-note">Purchases are locked while this boost is active. Rewarded boost time stacks on top of the current timer.</div>
            <div className="booster-tier-row">
              <button className="booster-tier-btn" disabled={active} onClick={() => onBuyBooster(booster.id, 6)}><span>Buy 6h</span><small>🪙 {booster.price6h}</small></button>
              <button className="booster-tier-btn" disabled={active} onClick={() => onBuyBooster(booster.id, 24)}><span>Buy 24h</span><small>🪙 {booster.price24h}</small></button>
            </div>
          </article>
        );
      })}
    </div>
  );
}