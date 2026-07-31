import { useRef, useState } from 'react';
import { WHEEL_REWARDS, WHEEL_TOTAL_WEIGHT, pickWheelIndex, applyLuckyReward, spendTokens } from '@/game/progression';
import { cloneProfile } from '@/game/utils';

const SEG = 360 / WHEEL_REWARDS.length;
const CX = 130, CY = 130, R = 124;
const pctOf = (r) => {
  const p = (r.weight / WHEEL_TOTAL_WEIGHT) * 100;
  return `${p % 1 ? p.toFixed(1) : p}%`;
};
const polar = (deg, radius) => {
  const rad = ((deg - 90) * Math.PI) / 180;
  return [CX + radius * Math.cos(rad), CY + radius * Math.sin(rad)];
};
const wedge = (i) => {
  const [x1, y1] = polar(i * SEG, R);
  const [x2, y2] = polar((i + 1) * SEG, R);
  return `M ${CX} ${CY} L ${x1} ${y1} A ${R} ${R} 0 0 1 ${x2} ${y2} Z`;
};

export default function LuckyWheelTab({ profile, onProfile, onNote }) {
  const [angle, setAngle] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const timer = useRef(null);

  const spin = () => {
    if (spinning) return;
    const next = cloneProfile(profile);
    if (!spendTokens(next, 1)) return onNote('You need 1 token 🎟️ to spin the wheel.');
    const index = pickWheelIndex();
    const jitter = (Math.random() - 0.5) * (SEG * 0.6);
    setAngle((a) => {
      const current = ((a % 360) + 360) % 360;
      const resting = (360 - (index * SEG + SEG / 2 + jitter) + 360) % 360;
      const delta = ((resting - current) % 360 + 360) % 360;
      return a + 360 * 6 + delta;
    });
    setSpinning(true);
    onNote('Spinning…');
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const label = applyLuckyReward(next, WHEEL_REWARDS[index]);
      next.luckyStats.wheelSpins += 1;
      if (WHEEL_REWARDS[index].amount === 1000) next.luckyStats.jackpots += 1;
      onProfile(next);
      setSpinning(false);
      onNote(`🎉 You won ${label}!`);
    }, 4200);
  };

  const top = [...WHEEL_REWARDS].sort((a, b) => a.weight - b.weight).slice(0, 4);

  return (
    <div className="lk-wheel-layout">
      <aside className="lk-rewards-panel">
        <div className="lk-rewards-head">🏆 REWARDS 🏆</div>
        <div className="lk-rewards-list">
          {top.map((r) => (
            <div className="lk-reward-row" key={r.label}>
              <span className="lk-reward-icon">{r.icon}</span>
              <span className="lk-reward-name">{r.label}</span>
              <span className="lk-reward-pct">{pctOf(r)}</span>
            </div>
          ))}
        </div>
        <div className="lk-rewards-foot">
          <span>🎡 Spins: {profile.luckyStats.wheelSpins}</span>
          <span>💥 Jackpots: {profile.luckyStats.jackpots}</span>
          <span>🎟️ Tokens: {profile.tokens}</span>
        </div>
      </aside>

      <div className="lk-wheel-stage">
        <span className="lk-wheel-pointer">📍</span>
        <svg
          viewBox="0 0 260 260"
          className="lk-wheel-svg"
          style={{ transform: `rotate(${angle}deg)`, transition: spinning ? 'transform 4.2s cubic-bezier(.12,.65,.1,1)' : 'none' }}
        >
          {WHEEL_REWARDS.map((r, i) => (
            <g key={r.label}>
              <path d={wedge(i)} fill={r.color} stroke="rgba(6,10,24,.55)" strokeWidth="1.6" />
              <g transform={`rotate(${i * SEG + SEG / 2} ${CX} ${CY})`}>
                <text x={CX} y={CY - 96} textAnchor="middle" transform={`rotate(90 ${CX} ${CY - 96})`} className="lk-wheel-label">
                  <tspan x={CX + 26} y={CY - 92}>{r.short}</tspan>
                  <tspan x={CX + 26} y={CY - 80} className="lk-wheel-pct">{pctOf(r)}</tspan>
                </text>
              </g>
            </g>
          ))}
          <circle cx={CX} cy={CY} r={R} fill="none" stroke="rgba(255,255,255,.85)" strokeWidth="4" />
        </svg>
        <button className="lk-wheel-hub" disabled={spinning || profile.tokens < 1} onClick={spin} aria-label="Spin the wheel">
          {spinning ? '…' : '▶'}
        </button>
      </div>
    </div>
  );
}