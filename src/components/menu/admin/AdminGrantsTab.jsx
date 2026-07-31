import { useState } from 'react';

// Currency / XP / season grants with a custom amount box.
export default function AdminGrantsTab({ profile, onGrant }) {
  const [amount, setAmount] = useState(1000);
  const amt = Math.max(1, Math.floor(Number(amount) || 0));

  const CARDS = [
    { icon: '🪙', title: 'Coins', desc: `Add ${amt.toLocaleString()} coins.`, apply: (p) => { p.coins += amt; }, note: `+${amt.toLocaleString()} coins granted.` },
    { icon: '🎟️', title: 'Lucky tokens', desc: `Add ${amt.toLocaleString()} tokens.`, apply: (p) => { p.tokens = Number(p.tokens || 0) + amt; }, note: `+${amt.toLocaleString()} tokens granted.` },
    { icon: '⚡', title: 'XP', desc: `Add ${amt.toLocaleString()} XP and level up as needed.`, kind: 'xp', note: `+${amt.toLocaleString()} XP granted.` },
    { icon: '🏆', title: 'Season points', desc: `Add ${amt.toLocaleString()} season pass points.`, kind: 'season', note: `+${amt.toLocaleString()} season points.` },
    { icon: '🚀', title: 'Mass booster', desc: 'Activate a 24h mass booster.', apply: (p) => { p.boosters.mass = Date.now() + 24 * 3600 * 1000; }, note: 'Mass booster active for 24h.' },
    { icon: '📈', title: 'XP booster', desc: 'Activate a 24h XP booster.', apply: (p) => { p.boosters.xp = Date.now() + 24 * 3600 * 1000; }, note: 'XP booster active for 24h.' },
    { icon: '👑', title: 'Season VIP', desc: profile.seasonPass.vip ? 'VIP pass already active.' : 'Unlock the VIP reward track.', apply: (p) => { p.seasonPass.vip = true; }, note: 'VIP season pass unlocked.' },
  ];

  return (
    <>
      <div className="admin-amount">
        <label>Amount</label>
        <input type="number" min="1" value={amount} onChange={(e) => setAmount(e.target.value)} />
        {[100, 1000, 10000, 100000].map((v) => (
          <button key={v} onClick={() => setAmount(v)}>{v.toLocaleString()}</button>
        ))}
      </div>
      <div className="shop-grid wide">
        {CARDS.map((c) => (
          <div className="shop-item" key={c.title}>
            <span className="icon">{c.icon}</span>
            <h4>{c.title}</h4>
            <p>{c.desc}</p>
            <button className="buy-btn" onClick={() => onGrant(c, amt)}>Grant</button>
          </div>
        ))}
      </div>
    </>
  );
}