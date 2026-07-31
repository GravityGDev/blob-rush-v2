// Small connection banner shown while playing online.
import '@/styles/blobrush-net.css';

const LABELS = {
  connecting: { text: 'Connecting to server…', tone: 'wait' },
  joining: { text: 'Joining arena…', tone: 'wait' },
  online: { text: 'Online', tone: 'good' },
  disconnected: { text: 'Disconnected — playing offline', tone: 'bad' },
  error: { text: 'Server unavailable — playing offline', tone: 'bad' },
};

export default function NetStatus({ status }) {
  if (!status) return null;
  const info = LABELS[status.state] || LABELS.error;
  if (status.state === 'online') return <div className="net-status good">🟢 Online</div>;
  return <div className={`net-status ${info.tone}`}>{status.message || info.text}</div>;
}