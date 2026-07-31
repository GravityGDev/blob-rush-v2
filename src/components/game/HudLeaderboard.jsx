// Slide-in leaderboard panel: top five by kills plus your own position.
export default function HudLeaderboard({ rows, selfRank, selfName, open }) {
  const me = rows.find((r) => r.isPlayer);
  return (
    <aside id="leaderboardPanel" className={`hud-card leaderboard${open ? ' open' : ''}`}>
      <h3><span>Top players</span><span>Kills</span></h3>
      <div>
        {rows.map((row, i) => (
          <div key={row.id} className={`lb-row${i === 0 ? ' top-one' : ''}`}>
            <span className="lb-rank">{i + 1}.</span>
            <span className="lb-name">{row.name}</span>
            <b>{row.kills}</b>
          </div>
        ))}
        {selfRank > 0 && (
          <>
            <div className="lb-self-divider" />
            <div className="lb-self-label">Your position</div>
            <div className="lb-row me">
              <span className="lb-rank">#{selfRank}</span>
              <span className="lb-name">{selfName}</span>
              <b>{me?.kills ?? 0}</b>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}