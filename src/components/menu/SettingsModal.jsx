import ModalShell from './ModalShell';
import '@/styles/blobrush-shop.css';

function Slider({ label, value, min, max, step = 1, suffix = '', onChange }) {
  return (
    <div className="setting-row">
      <span>{label}</span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
      <b style={{ minWidth: 52, textAlign: 'right' }}>{value}{suffix}</b>
    </div>
  );
}

function Toggle({ label, value, onChange }) {
  return (
    <div className="setting-row">
      <span>{label}</span>
      <button className={`switch-btn${value ? ' on' : ''}`} onClick={() => onChange(!value)}>{value ? 'ON' : 'OFF'}</button>
    </div>
  );
}

export default function SettingsModal({ profile, onChange, onClose }) {
  const s = profile.settings;
  const set = (patch) => onChange({ ...s, ...patch });

  return (
    <ModalShell title="Settings" onClose={onClose}>
      <div className="settings-grid">
        <div className="settings-group">
          <h4>Audio</h4>
          <Slider label="Sound effects" value={Math.round(s.sfx * 100)} min={0} max={100} suffix="%" onChange={(v) => set({ sfx: v / 100 })} />
          <Slider label="Music" value={Math.round(s.music * 100)} min={0} max={100} suffix="%" onChange={(v) => set({ music: v / 100 })} />
        </div>

        <div className="settings-group">
          <h4>Graphics</h4>
          <div className="setting-row">
            <span>Quality</span>
            <select value={s.quality} onChange={(e) => set({ quality: e.target.value })}>
              <option value="high">High</option>
              <option value="low">Performance</option>
            </select>
          </div>
          <Toggle label="Cosmetics" value={s.showCosmetics} onChange={(v) => set({ showCosmetics: v })} />
          <Toggle label="Glow effects" value={s.showGlows} onChange={(v) => set({ showGlows: v })} />
          <Toggle label="Animated skins" value={s.animateSkins} onChange={(v) => set({ animateSkins: v })} />
          <Slider label="Animation delay" value={s.animationDelay} min={50} max={500} step={10} suffix="ms" onChange={(v) => set({ animationDelay: v })} />
        </div>

        <div className="settings-group">
          <h4>Camera</h4>
          <Slider label="Camera zoom" value={s.cameraZoom} min={60} max={160} step={5} suffix="%" onChange={(v) => set({ cameraZoom: v })} />
          <Toggle label="Fixed camera zoom" value={s.fixedCameraZoom} onChange={(v) => set({ fixedCameraZoom: v })} />
        </div>

        <div className="settings-group">
          <h4>HUD</h4>
          <Toggle label="Stats bar" value={s.showStatsBar} onChange={(v) => set({ showStatsBar: v })} />
          <Toggle label="Mini map" value={s.showMiniMap} onChange={(v) => set({ showMiniMap: v })} />
          <Toggle label="FPS counter" value={s.showFps} onChange={(v) => set({ showFps: v })} />
          <Toggle label="Aim reticle" value={s.showReticle} onChange={(v) => set({ showReticle: v })} />
        </div>

        <div className="settings-group">
          <h4>Controls</h4>
          <Slider label="Macro feed speed" value={s.macroSpeed} min={10} max={120} step={5} suffix="ms" onChange={(v) => set({ macroSpeed: v })} />
          <Slider label="Macro multiplier" value={s.macroMultiplier} min={1} max={16} onChange={(v) => set({ macroMultiplier: v })} />
          <Toggle label="Show touch buttons" value={s.touch.showButtons} onChange={(v) => set({ touch: { ...s.touch, showButtons: v } })} />
          <Toggle label="Dynamic joystick" value={s.touch.dynamicButtons} onChange={(v) => set({ touch: { ...s.touch, dynamicButtons: v } })} />
          <Slider label="Joystick size" value={Math.round(s.touch.joystickSize * 100)} min={60} max={160} step={5} suffix="%" onChange={(v) => set({ touch: { ...s.touch, joystickSize: v / 100 } })} />
        </div>
      </div>
    </ModalShell>
  );
}