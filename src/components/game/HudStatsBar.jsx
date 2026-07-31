const Stat = ({ icon, label, value }) => (
  <div className="hud-stat">
    <span className="hud-stat-icon">{icon}</span>
    <span className="hud-stat-label">{label}</span>
    <b className="hud-stat-value">{value}</b>
  </div>
);

export default function HudStatsBar({ stats, fps }) {
  return (
    <div className="hud-stats-bar" aria-label="Match statistics">
      <Stat icon="⚖️" label="Mass" value={stats.mass.toLocaleString()} />
      <Stat icon="🪙" label="Season coins" value={stats.seasonCoins || 0} />
      <Stat icon="⚡" label="FPS" value={fps} />
      <Stat icon="📶" label="Ping" value="20 ms" />
      <Stat icon="☄️" label="Kills" value={stats.kills} />
      <Stat icon="▥" label="Bandwidth" value="1 KB/s" />
    </div>
  );
}