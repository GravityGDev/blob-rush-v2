import { useState } from 'react';
import ModalShell from './ModalShell';
import '@/styles/blobrush-shop.css';
import { SEASON_TIERS, seasonUnlockedTier } from '@/game/progression';
import { cloneProfile } from '@/game/utils';

const VIP_PRICE = 2500;

export default function SeasonPassModal({ profile, onProfile, onClose }) {
  const [note, setNote] = useState('');
  const pass = profile.seasonPass;
  const unlocked = seasonUnlockedTier(profile);
  const nextTier = SEASON_TIERS.find((t) => t.tier === unlocked + 1);
  const progress = nextTier ? ((pass.points % 300) / 300) * 100 : 100;

  const claim = (tier, vip) => {
    const list = vip ? 'claimedVip' : 'claimedFree';
    if (tier.tier > unlocked) return setNote('Tier not unlocked yet.');
    if (vip && !pass.vip) return setNote('VIP pass required.');
    if (pass[list].includes(tier.tier)) return setNote('Already claimed.');
    const next = cloneProfile(profile);
    next.seasonPass[list].push(tier.tier);
    const tokens = vip ? tier.vipTokens : tier.freeTokens;
    next.tokens += tokens;
    next.coins += tier.tier * 50;
    onProfile(next);
    setNote(`Claimed tier ${tier.tier}: +${tokens} tokens, +${tier.tier * 50} coins.`);
  };

  const buyVip = () => {
    if (pass.vip) return setNote('You already own the VIP pass.');
    if (profile.coins < VIP_PRICE) return setNote('Not enough coins.');
    const next = cloneProfile(profile);
    next.coins -= VIP_PRICE;
    next.seasonPass.vip = true;
    onProfile(next);
    setNote('VIP pass unlocked for this season!');
  };

  return (
    <ModalShell
      title={`Season Pass · Season ${pass.season}`}
      onClose={onClose}
      extraHead={<span className="shop-balance">🪙 {profile.coins.toLocaleString()} <span className="tokens">🎟️ {profile.tokens}</span></span>}
    >
      <div className="season-head">
        <div style={{ minWidth: 220, flex: 1 }}>
          <strong>{pass.points} season points</strong>
          <div className="progress" style={{ height: 8, background: 'rgba(255,255,255,.1)', borderRadius: 999, overflow: 'hidden', marginTop: 8 }}>
            <i style={{ display: 'block', height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg,#38bdf8,#a78bfa)' }} />
          </div>
          <small style={{ color: 'rgba(255,255,255,.5)' }}>
            {nextTier ? `${300 - (pass.points % 300)} points to tier ${nextTier.tier}` : 'All tiers unlocked'}
          </small>
        </div>
        <button className="buy-btn" style={{ flex: '0 0 auto', padding: '11px 20px' }} disabled={pass.vip} onClick={buyVip}>
          {pass.vip ? '✓ VIP Pass owned' : `Unlock VIP · 🪙 ${VIP_PRICE}`}
        </button>
      </div>
      <div className="shop-note">{note}</div>

      <div className="season-tiers">
        {SEASON_TIERS.map((tier) => {
          const open = tier.tier <= unlocked;
          const freeDone = pass.claimedFree.includes(tier.tier);
          const vipDone = pass.claimedVip.includes(tier.tier);
          return (
            <div key={tier.tier} className={`season-tier${open ? '' : ' locked'}`}>
              <b>Tier {tier.tier}</b>
              <small>{tier.required} pts</small>
              <button className={`buy-btn claim${freeDone ? ' equipped' : ''}`} disabled={!open || freeDone} onClick={() => claim(tier, false)}>
                {freeDone ? '✓ Free' : `Free · 🎟️ ${tier.freeTokens}`}
              </button>
              <button className={`buy-btn claim${vipDone ? ' equipped' : ' secondary'}`} disabled={!open || vipDone || !pass.vip} onClick={() => claim(tier, true)}>
                {vipDone ? '✓ VIP' : `VIP · 🎟️ ${tier.vipTokens}`}
              </button>
            </div>
          );
        })}
      </div>
    </ModalShell>
  );
}