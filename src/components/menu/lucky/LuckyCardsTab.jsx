import { useState } from 'react';
import { WHEEL_REWARDS, pickWheelIndex, applyLuckyReward, spendTokens } from '@/game/progression';
import { cloneProfile } from '@/game/utils';

const CARDS = 9;

// Pick one of nine face-down cards; every card hides a weighted reward.
export default function LuckyCardsTab({ profile, onProfile, onNote }) {
  const [picked, setPicked] = useState(null);
  const [deck, setDeck] = useState(null);

  const pick = (i) => {
    if (deck) return;
    const next = cloneProfile(profile);
    if (!spendTokens(next, 1)) return onNote('You need 1 token 🎟️ to flip a card.');
    const rewards = Array.from({ length: CARDS }, () => WHEEL_REWARDS[pickWheelIndex()]);
    const reward = rewards[i];
    const label = applyLuckyReward(next, reward);
    next.luckyStats.cardFlips = Number(next.luckyStats.cardFlips || 0) + 1;
    if (reward.amount === 1000) next.luckyStats.jackpots += 1;
    onProfile(next);
    setDeck(rewards);
    setPicked(i);
    onNote(`🃏 Your card held ${label}!`);
  };

  const reset = () => { setDeck(null); setPicked(null); onNote(''); };

  return (
    <div className="lk-cards-wrap">
      <div className="lk-hint">Flip one of nine mystery cards · 1 🎟️ per flip. Rarer prizes hide behind fewer cards.</div>
      <div className="lk-cards-grid">
        {Array.from({ length: CARDS }, (_, i) => {
          const revealed = !!deck;
          const reward = deck?.[i];
          return (
            <button
              key={i}
              className={`lk-card${revealed ? ' flipped' : ''}${picked === i ? ' picked' : ''}`}
              disabled={revealed || profile.tokens < 1}
              onClick={() => pick(i)}
              aria-label={revealed ? reward.label : `Mystery card ${i + 1}`}
            >
              <span className="lk-card-inner">
                <span className="lk-card-back">❓</span>
                <span className="lk-card-face">
                  <b>{reward?.icon}</b>
                  <small>{reward?.short}</small>
                </span>
              </span>
            </button>
          );
        })}
      </div>
      <div className="lk-cards-foot">
        <span>🃏 Flips: {profile.luckyStats.cardFlips || 0}</span>
        {deck && <button className="buy-btn lk-again" onClick={reset}>Play again · 🎟️ 1</button>}
      </div>
    </div>
  );
}