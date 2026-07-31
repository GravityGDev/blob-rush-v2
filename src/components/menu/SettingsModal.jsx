import { useState } from 'react';
import ModalShell from './ModalShell';
import TouchLayoutEditor from './TouchLayoutEditor';
import { getTouchSettings } from '@/game/hudLayout';
import { playSfx } from '@/game/audio';
import '@/styles/blobrush-modal.css';
import '@/styles/blobrush-settings.css';

const TABS = [
  { id:'game', icon:'⚙️', label:'Game Options' },
  { id:'graphics', icon:'🖥️', label:'Graphic Settings' },
  { id:'sfx', icon:'🔊', label:'SFX' },
  { id:'touch', icon:'📱', label:'Touch Screen' },
  { id:'keys', icon:'⌨️', label:'Key Bindings' },
  { id:'thanks', icon:'❤️', label:'Thanks' },
];

const Switch = ({ on, onClick }) => (
  <button className="settings-switch" type="button" aria-pressed={!!on} onClick={() => { playSfx('button'); onClick(); }}><span /></button>
);

// Settings modal, tab for tab identical to the original build.
export default function SettingsModal({ profile, onChange, onClose }) {
  const [tab, setTab] = useState('touch');
  const s = profile.settings;
  const touch = getTouchSettings(profile);
  const set = (patch) => onChange({ ...s, ...patch });
  const setTouch = (patch) => onChange({ ...s, joystick: patch.joystickSize ?? touch.joystickSize, touch: { ...touch, ...patch } });

  const TouchToggle = ({ label, k }) => (
    <div className="setting-row setting-toggle-row"><label>{label}</label><Switch on={!!touch[k]} onClick={() => setTouch({ [k]: !touch[k] })} /></div>
  );

  return (
    <ModalShell title="Settings" onClose={onClose} className="settings-modal">
      <div className="settings-tabs" role="tablist">
        {TABS.map((t) => (
          <button key={t.id} className={`settings-tab${tab === t.id ? ' active' : ''}`} onClick={() => { playSfx('button'); setTab(t.id); }}>
            {t.icon} <span>{t.label}</span>
          </button>
        ))}
      </div>

      <div className="settings-tab-scroll">
        {tab === 'game' && (
          <section className="settings-panel active">
            <h3 className="settings-panel-title">Game Options</h3>
            <div className="setting-row setting-toggle-row"><label>📊 Show FPS counter</label><Switch on={s.showFps !== false} onClick={() => set({ showFps: s.showFps === false })} /></div>
            <div className="setting-row setting-toggle-row"><label>🎯 Show aiming cursor</label><Switch on={s.showReticle !== false} onClick={() => set({ showReticle: s.showReticle === false })} /></div>
            <div className="setting-row setting-toggle-row"><label>📈 Show top stats bar</label><Switch on={s.showStatsBar !== false} onClick={() => set({ showStatsBar: s.showStatsBar === false })} /></div>
            <div className="setting-row setting-toggle-row"><label>🗺️ Show mini map</label><Switch on={s.showMiniMap !== false} onClick={() => set({ showMiniMap: s.showMiniMap === false })} /></div>
            <div className="setting-row setting-toggle-row"><label>🎬 Show record button</label><Switch on={s.showRecordButton !== false} onClick={() => set({ showRecordButton: s.showRecordButton === false })} /></div>
          </section>
        )}

        {tab === 'graphics' && (
          <section className="settings-panel active">
            <h3 className="settings-panel-title">Graphic Settings</h3>
            <div className="setting-row"><label>✨ Graphics quality</label>
              <div className="pills">
                <button className={s.quality === 'high' ? 'active' : ''} onClick={() => set({ quality: 'high' })}>High</button>
                <button className={s.quality === 'low' ? 'active' : ''} onClick={() => set({ quality: 'low' })}>Battery saver</button>
              </div>
            </div>
            <div className="setting-row setting-toggle-row"><label>🎩 Show player cosmetics</label><Switch on={s.showCosmetics !== false} onClick={() => set({ showCosmetics: s.showCosmetics === false })} /></div>
            <div className="setting-row setting-toggle-row"><label>💫 Show cell glows</label><Switch on={s.showGlows !== false} onClick={() => set({ showGlows: s.showGlows === false })} /></div>
            <div className="setting-row setting-toggle-row"><label>🌊 Animate player skins</label><Switch on={s.animateSkins !== false} onClick={() => set({ animateSkins: s.animateSkins === false })} /></div>
            <p className="settings-help">Turning animated skins off keeps every animated skin visible as a static frame.</p>
          </section>
        )}

        {tab === 'sfx' && (
          <section className="settings-panel active">
            <h3 className="settings-panel-title">Sound</h3>
            <div className="setting-row setting-range-row"><label>🔊 Sound effects</label>
              <input type="range" min="0" max="100" step="5" value={Math.round(s.sfx * 100)} onChange={(e) => set({ sfx: Number(e.target.value) / 100 })} />
              <output>{Math.round(s.sfx * 100)}%</output></div>
            <div className="setting-row setting-range-row"><label>🎵 Music</label>
              <input type="range" min="0" max="100" step="5" value={Math.round(s.music * 100)} onChange={(e) => set({ music: Number(e.target.value) / 100 })} />
              <output>{Math.round(s.music * 100)}%</output></div>
          </section>
        )}

        {tab === 'touch' && (
          <section className="settings-panel active">
            <h3 className="settings-panel-title">TouchScreen Layout</h3>
            <TouchToggle label="📱 Show Mobile Buttons" k="showButtons" />
            <TouchToggle label="↔️ Invert Buttons Positions" k="invertButtons" />
            <TouchToggle label="◀️▶️ Dynamic Buttons Position" k="dynamicButtons" />
            <TouchToggle label="🛑 Stop On Release" k="stopOnRelease" />
            <TouchToggle label="👉 Direction on touch" k="directionOnTouch" />
            <div className="setting-row setting-range-row"><label>🕹️ Joystick Size</label>
              <input type="range" min="65" max="165" step="5" value={Math.round(touch.joystickSize * 100)} onChange={(e) => setTouch({ joystickSize: Number(e.target.value) / 100 })} />
              <output>{Math.round(touch.joystickSize * 100)}%</output></div>
            <div className="setting-row setting-range-row"><label>🕹️ Joystick Sensibility</label>
              <input type="range" min="50" max="200" step="5" value={Math.round(touch.joystickSensitivity * 100)} onChange={(e) => setTouch({ joystickSensitivity: Number(e.target.value) / 100 })} />
              <output>{Math.round(touch.joystickSensitivity * 100)}%</output></div>
            <TouchLayoutEditor touch={touch} onSave={(layout) => setTouch({ layout })} />
          </section>
        )}

        {tab === 'keys' && (
          <section className="settings-panel active">
            <h3 className="settings-panel-title">Key Bindings</h3>
            <div className="key-bind-row"><span>Move</span><b>W A S D / Arrow keys</b></div>
            <div className="key-bind-row"><span>Split</span><b>Space</b></div>
            <div className="key-bind-row"><span>Split ×2 / ×4</span><b>Q / R</b></div>
            <div className="key-bind-row"><span>Feed mass</span><b>E</b></div>
            <div className="key-bind-row"><span>Pause</span><b>Escape</b></div>
          </section>
        )}

        {tab === 'thanks' && (
          <section className="settings-panel active">
            <h3 className="settings-panel-title">Thanks</h3>
            <div className="settings-thanks">❤️ Thanks for play-testing Blob Rush. Your control layout is stored locally on this device.</div>
          </section>
        )}
      </div>
    </ModalShell>
  );
}