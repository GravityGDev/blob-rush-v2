import { useState } from 'react';

// Standalone "Codes" tab: coupon redemption moved out of the Main tab.
export default function ShopCodesTab({ onRedeem }) {
  const [code, setCode] = useState('');
  const redeem = () => { if (code.trim()) { onRedeem(code.trim()); setCode(''); } };

  return (
    <div className="shop-grid shop-grid-main">
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
    </div>
  );
}