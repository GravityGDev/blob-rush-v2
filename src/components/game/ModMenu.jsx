import { useState } from 'react';

const Row = ({ label, value, hintLeft, hintRight, children }) => (
  <div className="mod-row">
    <div className="mod-row-head"><span>{label}</span><b>{value}</b></div>
    {children}
    {(hintLeft || hintRight) && <div className="mod-row-hint"><span>{hintLeft}</span><span>{hintRight}</span></div>}
  </div>
);

const Range = (props) => <input type="range" className="mod-range" {...props} />;

const Toggle = ({ label, on, onChange }) => (
  <button className={`mod-toggle${on ? ' on' : ''}`} onClick={() => onChange(!on)}>
    <span>{label}</span><i />
  </button>
);

// In-game Mod Menu: macro tuning plus admin/testing tools.
export default function ModMenu({ profile, onSettings, onAdmin, onEditLayout, onClose }) {
  const [tab, setTab] = useState('macro');
  const s = profile.settings;
  const [god, setGod] = useState(false);
  const [invisible, setInvisible] = useState(false);
  const [frozen, setFrozen] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [mass, setMass] = useState(5000);
  const set = (patch) => onSettings({ ...s, ...patch });

  return (
    <div className="mod-menu" role="dialog" aria-label="Mod menu">
      <div className="mod-menu-head">
        <h3>Mod Menu</h3>
        <button className="mod-close" onClick={onClose} aria-label="Close mod menu">✕</button>
      </div>
      <div className="mod-tabs">
        <button className={tab === 'macro' ? 'active' : ''} onClick={() => setTab('macro')}>Macro</button>
        <button className={tab === 'admin' ? 'active' : ''} onClick={() => setTab('admin')}>Admin Tools</button>
      </div>

      {tab === 'macro' ? (
        <div className="mod-body">
          <Row label="Macro speed" value={`${s.macroSpeed} MS`} hintLeft="10 ms · Fastest" hintRight="99 ms · Smooth">
            <Range min={10} max={99} value={s.macroSpeed} onChange={(e) => set({ macroSpeed: +e.target.value })} />
          </Row>
          <Row label="Macro multi" value={`${s.macroMultiplier}×`} hintLeft="1×" hintRight="300×">
            <Range min={1} max={300} value={s.macroMultiplier} onChange={(e) => set({ macroMultiplier: +e.target.value })} />
          </Row>
          <Row label="Camera zoom" value={`${s.cameraZoom}%`} hintLeft="50%" hintRight="180%">
            <Range min={50} max={180} value={s.cameraZoom} onChange={(e) => set({ cameraZoom: +e.target.value })} />
          </Row>
          <Row label="Animation delay" value={`${s.animationDelay} ms`} hintLeft="50 ms" hintRight="500 ms">
            <Range min={50} max={500} step={10} value={s.animationDelay} onChange={(e) => set({ animationDelay: +e.target.value })} />
          </Row>
          <Toggle label="Fixed camera zoom" on={s.fixedCameraZoom} onChange={(v) => set({ fixedCameraZoom: v })} />
          <button className="mod-action sky" onClick={onEditLayout}>Edit touch layout</button>
        </div>
      ) : (
        <div className="mod-body">
          <Row label="Set mass" value={mass.toLocaleString()} hintLeft="100" hintRight="100,000">
            <Range min={100} max={100000} step={100} value={mass} onChange={(e) => setMass(+e.target.value)} />
          </Row>
          <button className="mod-action sky" onClick={() => onAdmin('setMass', mass)}>Apply mass</button>
          <div className="mod-action-grid">
            <button className="mod-action" onClick={() => onAdmin('addMass', 1000)}>+1,000 mass</button>
            <button className="mod-action" onClick={() => onAdmin('addMass', 10000)}>+10,000 mass</button>
            <button className="mod-action" onClick={() => onAdmin('respawnSafe')}>Safe teleport</button>
            <button className="mod-action danger" onClick={() => onAdmin('killBots')}>Clear bots</button>
          </div>
          <Row label="Speed multiplier" value={`${speed.toFixed(1)}×`} hintLeft="0.5×" hintRight="4×">
            <Range min={0.5} max={4} step={0.1} value={speed} onChange={(e) => { setSpeed(+e.target.value); onAdmin('speed', +e.target.value); }} />
          </Row>
          <Toggle label="God mode" on={god} onChange={(v) => { setGod(v); onAdmin('god', v); }} />
          <Toggle label="Invisible" on={invisible} onChange={(v) => { setInvisible(v); onAdmin('invisible', v); }} />
          <Toggle label="Freeze bots" on={frozen} onChange={(v) => { setFrozen(v); onAdmin('freezeBots', v); }} />
        </div>
      )}
    </div>
  );
}