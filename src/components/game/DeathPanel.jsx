import { fmtTime } from '@/game/utils';

export default function DeathPanel({ result, onMenu, onPlayAgain }) {
  return (
    <div id="deathOverlay" className="overlay">
      <div className="panel">
        <div className="death-icon">💀</div>
        <h2>You were eaten!</h2>
        <div className="death-stats">
          <div className="death-row"><span>Final mass</span><b>{Math.round(result.finalMass).toLocaleString()}</b></div>
          <div className="death-row"><span>Highest mass</span><b>{Math.round(result.maxMass).toLocaleString()}</b></div>
          <div className="death-row"><span>Time survived</span><b>{fmtTime(result.time)}</b></div>
          <div className="death-row"><span>Best rank</span><b>#{result.bestRank}</b></div>
        </div>
        <div className="rewards">
          <span>🪙 <b>+{result.coins}</b></span>
          <span>⭐ <b>+{result.xp} XP</b></span>
          <span>🎟️ <b>+{result.tokens}</b></span>
        </div>
        {result.levelsGained > 0 && <p style={{ textAlign: 'center', color: '#4ade80', fontWeight: 900 }}>Level up! 🎉</p>}
        <div className="panel-actions">
          <button className="secondary" onClick={onMenu}>Menu</button>
          <button className="sky" onClick={onPlayAgain}>Play Again</button>
        </div>
      </div>
    </div>
  );
}