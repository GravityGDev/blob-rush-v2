import { useState } from 'react';
import ModalShell from './ModalShell';
import '@/styles/blobrush-shop.css';
import '@/styles/blobrush-admin.css';
import AdminGrantsTab from './admin/AdminGrantsTab';
import AdminUnlocksTab from './admin/AdminUnlocksTab';
import AdminPlayersTab from './admin/AdminPlayersTab';
import { cloneProfile } from '@/game/utils';
import { DEFAULTS, addXp, DEFAULT_TOUCH_SETTINGS } from '@/game/save';
import { addSeasonProgress } from '@/game/progression';

const TABS = [
  { id: 'grants', label: 'Grants' },
  { id: 'unlocks', label: 'Unlocks' },
  { id: 'players', label: 'Players & Roles' },
  { id: 'danger', label: 'Danger Zone' },
];

export default function AdminModal({ profile, onProfile, onClose }) {
  const [tab, setTab] = useState('grants');
  const [note, setNote] = useState('');

  const apply = (card, amt) => {
    const next = cloneProfile(profile);
    if (card.kind === 'xp') addXp(next, amt);
    else if (card.kind === 'season') addSeasonProgress(next, amt);
    else card.apply(next);
    onProfile(next);
    setNote(card.note);
  };

  const DANGER = [
    { icon: '♻️', title: 'Reset progress', desc: 'Wipe coins, level, stats and unlocks back to a fresh save.', apply: (p) => Object.assign(p, cloneProfile(DEFAULTS), { nickname: p.nickname, customSkins: p.customSkins }), note: 'Profile reset.' },
    { icon: '📊', title: 'Clear stats', desc: 'Zero out games, mass records and time played.', apply: (p) => { p.stats = cloneProfile(DEFAULTS.stats); }, note: 'Stats cleared.' },
    { icon: '🎛️', title: 'Reset settings', desc: 'Restore audio, quality and HUD options to default.', apply: (p) => { p.settings = cloneProfile(DEFAULTS.settings); }, note: 'Settings reset.' },
    { icon: '📱', title: 'Reset touch layout', desc: 'Restore the on-screen control positions.', apply: (p) => { p.settings.touch = cloneProfile(DEFAULT_TOUCH_SETTINGS); }, note: 'Touch layout reset.' },
    { icon: '🎟️', title: 'Clear redeemed codes', desc: 'Allow every promo code to be redeemed again.', apply: (p) => { p.redeemedCodes = []; }, note: 'Redeemed codes cleared.' },
    { icon: '🖼️', title: 'Delete custom skins', desc: `Remove all ${profile.customSkins.length} uploaded skins.`, apply: (p) => { p.customSkins = []; }, note: 'Custom skins deleted.' },
  ];

  return (
    <ModalShell
      title="Admin Tools"
      onClose={onClose}
      className="shop-modal"
      extraHead={<span className="shop-balance">🪙 {profile.coins.toLocaleString()}</span>}
      beforeBody={(
        <div className="shop-nav">
          <div className="shop-tabs">
            {TABS.map((t) => (
              <button key={t.id} className={`shop-tab${tab === t.id ? ' active' : ''}`} onClick={() => setTab(t.id)}>{t.label}</button>
            ))}
          </div>
        </div>
      )}
    >
      <div className="shop-message">{note || 'Grants and unlocks apply to your own profile. Roles apply to cloud accounts.'}</div>

      {tab === 'grants' && <AdminGrantsTab profile={profile} onGrant={apply} />}
      {tab === 'unlocks' && <AdminUnlocksTab profile={profile} onUnlock={(card) => apply(card, 0)} />}
      {tab === 'players' && <AdminPlayersTab onNote={setNote} />}
      {tab === 'danger' && (
        <div className="shop-grid wide">
          {DANGER.map((d) => (
            <div className="shop-item" key={d.title}>
              <span className="icon">{d.icon}</span>
              <h4>{d.title}</h4>
              <p>{d.desc}</p>
              <button className="buy-btn secondary" onClick={() => { if (confirm(`${d.title}?`)) apply(d, 0); }}>Run</button>
            </div>
          ))}
        </div>
      )}
    </ModalShell>
  );
}