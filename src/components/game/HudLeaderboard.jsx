export default function HudLeaderboard({ rows, open }) {
  return (
    <aside id="leaderboardPanel" className={`hud-card leaderboard${open ? ' open' : ''}`}>
      <h3><span>Top players</span><span>Mass</span></h3>
      <div>
        {rows.map((row, i) => (
          <div key={row.id} className={`lb-row${i === 0 ? ' top-one' : ''}${row.isPlayer ? ' me' : ''}`}>
            <span className="lb-rank">{i + 1}</span>
            <span className="lb-name">{row.name}</span>
            <b>{Math.round(row.mass).toLocaleString()}</b>
          </div>
        ))}
      </div>
    </aside>
  );
}