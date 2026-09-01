import ModalShell from './ModalShell';
import { xpForLevel } from '@/game/save';
import { fmtTime } from '@/game/utils';
import { useAuth } from '@/lib/AuthContext';

const ROLE_LABEL = { admin: '🛡️ Admin', moderator: '🔨 Moderator', vip: '⭐ VIP', player: '🎮 Player' };

export default function AccountModal({ profile, account, user, onClose }) {
  const { logout } = useAuth();
  const stats = profile.stats;
  const need = xpForLevel(profile.level);
  const role = account?.role || 'player';
  return <ModalShell title="Account" onClose={onClose} bodyClass="profile-layout">
    <div className="profile-head"><span className="profile-skin-dot" /><div style={{ minWidth: 0, width: '100%' }}>
      <h3>{profile.nickname || user?.full_name || 'Blob'}</h3>
      <p>{ROLE_LABEL[role] || role} · Level {profile.level}</p>
      <div className="progress"><i style={{ width: `${Math.min(100, (profile.xp / need) * 100)}%` }} /></div>
      <p>{user?.email}</p>
    </div></div>
    <div className="stats-grid">
      <div className="stat-box"><b>{stats.games}</b><span>Games</span></div>
      <div className="stat-box"><b>{Math.round(stats.highestMass).toLocaleString()}</b><span>Highest mass</span></div>
      <div className="stat-box"><b>{stats.cellsEaten}</b><span>Cells eaten</span></div>
      <div className="stat-box"><b>{fmtTime(stats.timePlayed)}</b><span>Time played</span></div>
      <div className="stat-box"><b>{profile.ownedSkins.length}</b><span>Skins owned</span></div>
      <div className="stat-box"><b>{profile.coins.toLocaleString()}</b><span>Coins</span></div>
    </div>
    <div className="cosmetic-actions"><button className="primary-btn" disabled>Discord linking coming next</button><button className="cosmetic-reset" onClick={async () => { await logout(); window.location.href = '/login'; }}>Sign out</button></div>
  </ModalShell>;
}
