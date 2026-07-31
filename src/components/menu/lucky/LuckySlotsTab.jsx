import { useEffect, useRef, useState } from 'react';
import { SLOT_SYMBOLS, spendTokens } from '@/game/progression';
import { cloneProfile } from '@/game/utils';

const rand = () => SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)];
const randCol = () => [rand(), rand(), rand()];

// Triple 7's: 3x3 reels, middle row is the payline.
export default function LuckySlotsTab({ profile, onProfile, onNote }) {
  const [cols, setCols] = useState(() => [randCol(), randCol(), randCol()]);
  const [spinning, setSpinning] = useState(false);
  const [locked, setLocked] = useState([false, false, false]);
  const timers = useRef([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const spin = () => {
    if (spinning) return;
    const next = cloneProfile(profile);
    if (!spendTokens(next, 1)) return onNote('You need 1 token 🎟️ to pull the lever.');
    const final = [randCol(), randCol(), randCol()];
    setSpinning(true);
    setLocked([false, false, false]);
    onNote('Reels spinning…');

    const cycle = setInterval(() => {
      setCols((cs) => cs.map((c, i) => (lockedRef.current[i] ? c : randCol())));
    }, 80);
    const lockedRef = { current: [false, false, false] };
    timers.current = [0, 1, 2].map((i) => setTimeout(() => {
      lockedRef.current[i] = true;
      setLocked([...lockedRef.current]);
      setCols((cs) => cs.map((c, j) => (j === i ? final[i] : c)));
      if (i === 2) {
        clearInterval(cycle);
        const row = final.map((c) => c[1]);
        next.luckyStats.slotSpins += 1;
        let message;
        if (row[0] === row[1] && row[1] === row[2]) {
          const jackpot = row[0] === '7️⃣' ? 2000 : 800;
          next.coins += jackpot;
          next.luckyStats.jackpots += 1;
          message = `💥 JACKPOT! ${row.join(' ')} · +${jackpot.toLocaleString()} coins`;
        } else if (row[0] === row[1] || row[1] === row[2] || row[0] === row[2]) {
          next.coins += 200;
          message = '✨ Two of a kind · +200 coins';
        } else {
          message = 'No match on the payline — try again!';
        }
        onProfile(next);
        setSpinning(false);
        onNote(message);
      }
    }, 900 + i * 550));
    timers.current.push(cycle);
  };

  return (
    <div className="lk-slots-wrap">
      <div className="lk-hint">Match the middle payline · 7️⃣ 7️⃣ 7️⃣ pays 2,000 🪙 · any triple 800 🪙 · any pair 200 🪙</div>
      <div className="lk-slots-stage">
        <div className="lk-reels">
          {cols.map((col, i) => (
            <div className={`lk-reel${spinning && !locked[i] ? ' rolling' : ''}`} key={i}>
              {col.map((s, j) => <span key={j} className={j === 1 ? 'payline' : ''}>{s}</span>)}
            </div>
          ))}
          <span className="lk-payline-bar" aria-hidden />
        </div>
        <button className="lk-lever" disabled={spinning || profile.tokens < 1} onClick={spin} aria-label="Pull to spin">
          <small>SPIN</small>
          <span className="lk-lever-track"><i /></span>
        </button>
      </div>
      <div className="lk-slots-foot">
        <span>🎰 Pulls: {profile.luckyStats.slotSpins}</span>
        <span>💥 Jackpots: {profile.luckyStats.jackpots}</span>
        <div className="lk-odds">
          {SLOT_SYMBOLS.map((s) => (
            <span key={s}>{s}<small>{(100 / SLOT_SYMBOLS.length).toFixed(0)}%</small></span>
          ))}
        </div>
      </div>
    </div>
  );
}