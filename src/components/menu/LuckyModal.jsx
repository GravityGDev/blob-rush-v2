import { useState } from 'react';
import ModalShell from './ModalShell';
import '@/styles/blobrush-shop.css';
import '@/styles/blobrush-lucky.css';
import LuckyWheelTab from './lucky/LuckyWheelTab';
import LuckyCardsTab from './lucky/LuckyCardsTab';
import LuckySlotsTab from './lucky/LuckySlotsTab';

const TABS = [
  { id: 'wheel', label: '🎡 Wheel' },
  { id: 'cards', label: '🃏 Lucky Cards' },
  { id: 'slots', label: '🎰 Triple 7\'s' },
];

export default function LuckyModal({ profile, onProfile, onClose }) {
  const [tab, setTab] = useState('wheel');
  const [note, setNote] = useState('');

  return (
    <ModalShell
      title="Am I Lucky?"
      onClose={onClose}
      className="shop-modal lucky-modal"
      extraHead={<span className="shop-balance">🪙 {profile.coins.toLocaleString()} <span className="tokens">🎟️ {profile.tokens}</span></span>}
      beforeBody={(
        <div className="shop-nav">
          <div className="shop-tabs">
            {TABS.map((t) => (
              <button key={t.id} className={`shop-tab${tab === t.id ? ' active' : ''}`} onClick={() => { setTab(t.id); setNote(''); }}>{t.label}</button>
            ))}
          </div>
        </div>
      )}
    >
      <div className="lk-message">{note || 'Every game costs 1 token 🎟️ — earn tokens by levelling up and from the season pass.'}</div>
      {tab === 'wheel' && <LuckyWheelTab profile={profile} onProfile={onProfile} onNote={setNote} />}
      {tab === 'cards' && <LuckyCardsTab profile={profile} onProfile={onProfile} onNote={setNote} />}
      {tab === 'slots' && <LuckySlotsTab profile={profile} onProfile={onProfile} onNote={setNote} />}
    </ModalShell>
  );
}