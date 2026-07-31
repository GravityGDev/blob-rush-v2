import { useState } from 'react';
import ModalShell from './ModalShell';
import { base44 } from '@/api/base44Client';
import { linkDiscord, unlinkDiscord } from '@/game/account';
import { xpForLevel } from '@/game/save';
import { fmtTime } from '@/game/utils';

const ROLE_LABEL = { admin: '🛡️ Admin', moderator: '🔨 Moderator', vip: '⭐ VIP', player: '🎮 Player' };

export default function AccountModal({ profile, account, user, onAccount, onClose }) {
  const [busy, setBusy] = useState('');
  const stats = profile.stats;
  const need = xpForLevel(profile.level);

  const run = async (label, fn) => {
    setBusy(label);
    try { onAccount(await fn()); } catch (e) { alert(e.message); } finally { setBusy(''); }
  };

  if (!user) {
    return (
      <ModalShell title="Account" onClose={onClose} bodyClass="profile-layout">
        <div className="profile-head">
          <div style={{ minWidth: 0, width: '100%' }}>
            <h3>Sign in to save your progress</h3>
            <p>Your coins, level, skins, cosmetics and stats will follow you on every device — then link Discord to your account.</p>
          </div>
        </div>
        <button className="primary-btn" onClick={() => base44.auth.redirectToLogin()}>Sign in</button>
      </ModalShell>
    );
  }

  const role = account?.role || 'player';
  return (
    <ModalShell title="Account" onClose={onClose} bodyClass="profile-layout">
      <div className="profile-head">
        {account?.discord_avatar
          ? <img className="profile-skin-dot" src={account.discord_avatar} alt="" style={{ objectFit: 'cover' }} />
          : <span className="profile-skin-dot" />}
        <div style={{ minWidth: 0, width: '100%' }}>
          <h3>{account?.discord_username || profile.nickname || user.full_name || 'Blob'}</h3>
          <p>{ROLE_LABEL[role] || role} · Level {profile.level}</p>
          <div className="progress"><i style={{ width: `${Math.min(100, (profile.xp / need) * 100)}%` }} /></div>
          <p>{user.email}</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-box"><b>{stats.games}</b><span>Games</span></div>
        <div className="stat-box"><b>{Math.round(stats.highestMass).toLocaleString()}</b><span>Highest mass</span></div>
        <div className="stat-box"><b>{stats.cellsEaten}</b><span>Cells eaten</span></div>
        <div className="stat-box"><b>{fmtTime(stats.timePlayed)}</b><span>Time played</span></div>
        <div className="stat-box"><b>{profile.ownedSkins.length}</b><span>Skins owned</span></div>
        <div className="stat-box"><b>{profile.coins.toLocaleString()}</b><span>Coins</span></div>
      </div>

      <div className="cosmetic-actions">
        {account?.discord_id ? (
          <button className="cosmetic-remove" disabled={!!busy} onClick={() => run('unlink', () => unlinkDiscord(account.id))}>
            {busy === 'unlink' ? 'Unlinking…' : 'Unlink Discord'}
          </button>
        ) : (
          <button className="primary-btn" disabled={!!busy} onClick={() => run('link', () => linkDiscord(account.id))}>
            {busy === 'link' ? 'Waiting for Discord…' : '🎮 Link Discord'}
          </button>
        )}
        <button className="cosmetic-reset" onClick={() => base44.auth.logout()}>Sign out</button>
      </div>
    </ModalShell>
  );
}