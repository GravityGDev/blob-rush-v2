import { useRef, useState } from 'react';
import ModalShell from './ModalShell';
import '@/styles/blobrush-shop.css';
import { WHEEL_REWARDS, SLOT_SYMBOLS, applyLuckyReward, spendTokens } from '@/game/progression';
import { cloneProfile } from '@/game/utils';

const SEG = 360 / WHEEL_REWARDS.length;
const wheelGradient = `conic-gradient(${WHEEL_REWARDS.map((r, i) => `${r.color} ${i * SEG}deg ${(i + 1) * SEG}deg`).join(',')})`;

export default function LuckyModal({ profile, onProfile, onClose }) {
  const [note, setNote] = useState('');
  const [angle, setAngle] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [reels, setReels] = useState(['🪙', '⭐', '💎']);
  const timer = useRef(null);

  const spinWheel = () => {
    if (spinning) return;
    const next = cloneProfile(profile);
    if (!spendTokens(next, 1)) return setNote('You need 1 token to spin.');
    const index = Math.floor(Math.random() * WHEEL_REWARDS.length);
    const target = angle + 360 * 5 + (360 - (index * SEG + SEG / 2));
    setAngle(target);
    setSpinning(true);
    setNote('Spinning…');
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const label = applyLuckyReward(next, WHEEL_REWARDS[index]);
      next.luckyStats.wheelSpins += 1;
      if (WHEEL_REWARDS[index].amount === 1000) next.luckyStats.jackpots += 1;
      onProfile(next);
      setSpinning(false);
      setNote(`You won ${label}!`);
    }, 3500);
  };

  const spinSlots = () => {
    if (spinning) return;
    const next = cloneProfile(profile);
    if (!spendTokens(next, 1)) return setNote('You need 1 token to play.');
    const roll = Array.from({ length: 3 }, () => SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)]);
    setReels(roll);
    next.luckyStats.slotSpins += 1;
    let message;
    if (roll[0] === roll[1] && roll[1] === roll[2]) {
      const jackpot = roll[0] === '7️⃣' ? 2000 : 800;
      next.coins += jackpot;
      next.luckyStats.jackpots += 1;
      message = `JACKPOT! ${roll.join(' ')} · +${jackpot} coins`;
    } else if (roll[0] === roll[1] || roll[1] === roll[2] || roll[0] === roll[2]) {
      next.coins += 200;
      message = 'Two of a kind · +200 coins';
    } else {
      message = 'No match this time.';
    }
    onProfile(next);
    setNote(message);
  };

  return (
    <ModalShell
      title="Lucky Rewards"
      onClose={onClose}
      extraHead={<span className="shop-balance">🪙 {profile.coins.toLocaleString()} <span className="tokens">🎟️ {profile.tokens}</span></span>}
    >
      <div className="shop-note">{note || 'Each spin costs 1 token. Tokens come from levelling up and the season pass.'}</div>
      <div className="lucky-layout">
        <div className="lucky-card">
          <h3 style={{ margin: 0 }}>Reward Wheel</h3>
          <div className="wheel-wrap">
            <span className="pointer">🔻</span>
            <div className="wheel" style={{ background: wheelGradient, transform: `rotate(${angle}deg)` }} />
          </div>
          <button className="buy-btn" disabled={spinning || profile.tokens < 1} onClick={spinWheel}>
            {spinning ? 'Spinning…' : 'Spin · 🎟️ 1'}
          </button>
          <div className="lucky-result">Spins: {profile.luckyStats.wheelSpins}</div>
        </div>

        <div className="lucky-card">
          <h3 style={{ margin: 0 }}>Slot Machine</h3>
          <div className="slot-reels">
            {reels.map((symbol, i) => <div key={i} className="slot-reel">{symbol}</div>)}
          </div>
          <button className="buy-btn" disabled={profile.tokens < 1} onClick={spinSlots}>Pull · 🎟️ 1</button>
          <div className="lucky-result">Pulls: {profile.luckyStats.slotSpins} · Jackpots: {profile.luckyStats.jackpots}</div>
        </div>
      </div>
    </ModalShell>
  );
}