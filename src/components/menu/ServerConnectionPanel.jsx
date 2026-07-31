// Configures the authoritative game server used for online play.
import { useState } from 'react';
import { gameServerUrl } from '@/game/net/config';
import '@/styles/blobrush-net.css';

export default function ServerConnectionPanel({ settings, onSettings }) {
  const [url, setUrl] = useState(settings.serverUrl || '');
  const online = !!settings.onlineEnabled;
  const resolved = gameServerUrl({ settings: { serverUrl: url } });

  return (
    <div className="net-panel">
      <div className="net-panel-head">
        <strong>Server connection</strong>
        <label className="net-toggle">
          <input
            type="checkbox"
            checked={online}
            onChange={(e) => onSettings({ ...settings, onlineEnabled: e.target.checked })}
          />
          <span>{online ? 'Online play on' : 'Offline (bots)'}</span>
        </label>
      </div>
      <div className="net-panel-row">
        <input
          className="net-url-input"
          placeholder="wss://play.yourserver.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onBlur={() => onSettings({ ...settings, serverUrl: url.trim() })}
        />
        <button className="net-save-btn" onClick={() => onSettings({ ...settings, serverUrl: url.trim() })}>Save</button>
      </div>
      <small className="net-panel-note">
        {resolved
          ? `Matches will connect to ${resolved}. Leave online play off to practise against bots.`
          : 'Enter your game server address to play against real people. Without it, arenas run locally against bots.'}
      </small>
    </div>
  );
}