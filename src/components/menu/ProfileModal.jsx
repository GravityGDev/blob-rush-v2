import ModalShell from './ModalShell';
import { getSkin } from '@/game/skins';
import { skinBackground } from '@/game/skinUi';
import { xpForLevel } from '@/game/save';
import { fmtTime } from '@/game/utils';

export default function ProfileModal({ profile, onClose }) {
  const skin = getSkin(profile.skin);
  const need = xpForLevel(profile.level);
  const stats = profile.stats;

  return (
    <ModalShell title="Profile" onClose={onClose} bodyClass="profile-layout">
      <div className="profile-head">
        <span className="profile-skin-dot" style={{ background: skinBackground(skin), borderColor: skin.accent }} />
        <div style={{ minWidth: 0, width: '100%' }}>
          <h3>{profile.nickname || 'Blob'}</h3>
          <p>Level {profile.level}</p>
          <div className="progress"><i style={{ width: `${Math.min(100, (profile.xp / need) * 100)}%` }} /></div>
          <p>{profile.xp} / {need} XP</p>
        </div>
      </div>
      <div className="stats-grid">
        <div className="stat-box"><b>{stats.games}</b><span>Games</span></div>
        <div className="stat-box"><b>{Math.round(stats.highestMass).toLocaleString()}</b><span>Highest mass</span></div>
        <div className="stat-box"><b>{stats.cellsEaten}</b><span>Cells eaten</span></div>
        <div className="stat-box"><b>{fmtTime(stats.timePlayed)}</b><span>Time played</span></div>
        <div className="stat-box"><b>{profile.coins.toLocaleString()}</b><span>Coins</span></div>
        <div className="stat-box"><b>{profile.tokens}</b><span>Tokens</span></div>
      </div>
    </ModalShell>
  );
}