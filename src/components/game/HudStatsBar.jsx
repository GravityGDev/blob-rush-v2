const Stat = ({ icon, label, value }) => (
  <div className="hud-stat">
    <span className="hud-stat-icon">{icon}</span>
    <span className="hud-stat-label">{label}</span>
    <b className="hud-stat-value">{value}</b>
  </div>
);

// Six-slot match stats bar, same order as the original build.
export default function HudStatsBar({ stats, fps }) {
  return (
    <>
      <Stat icon="⚖️" label="Mass" value={Math.round(stats.mass || 0).toLocaleString('en-GB')} />
      <Stat icon="🪙" label="Season coins" value={Math.round(stats.seasonCoins || 0).toLocaleString('en-GB')} />
      {fps !== null && <Stat icon="⚡" label="FPS" value={fps} />}
      <Stat icon="📶" label="Ping" value={`${stats.ping ?? 20} ms`} />
      <Stat icon="☄️" label="Kills" value={stats.kills || 0} />
      <Stat icon="▥" label="Bandwidth" value={`${stats.bandwidth ?? 1} KB/s`} />
    </>
  );
}