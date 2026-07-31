// Live connection indicator for the configured game server.
const LABELS = {
  none: ['No server set', 'idle'],
  loading: ['Checking…', 'idle'],
  ready: ['Online', 'up'],
  error: ['Offline', 'down'],
};

export default function ServerStatusBadge({ status, players, checkedAt }) {
  const [label, tone] = LABELS[status] || LABELS.none;
  return (
    <span className={`net-status-badge ${tone}`}>
      <i className="net-status-dot" />
      {label}
      {status === 'ready' && typeof players === 'number' && <em>· {players} online</em>}
      {checkedAt && <em className="net-status-time">{new Date(checkedAt).toLocaleTimeString()}</em>}
    </span>
  );
}