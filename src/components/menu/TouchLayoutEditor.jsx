import { useEffect, useRef, useState } from 'react';
import { playSfx } from '@/game/audio';
import { DEFAULT_TOUCH_LAYOUT, TOUCH_CONTROL_META, TOUCH_CONTROL_KEYS, clampTouchLayoutItem, clamp, uiScale } from '@/game/hudLayout';

const clone = (v) => JSON.parse(JSON.stringify(v));

// 1:1 port of the Settings → Touch Screen layout editor stage.
export default function TouchLayoutEditor({ touch, onSave }) {
  const stageRef = useRef(null);
  const pointerRef = useRef(null);
  const [draft, setDraft] = useState(() => clone(touch.layout));
  const [editing, setEditing] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [selected, setSelected] = useState('split');
  const [snap, setSnap] = useState(true);
  const [status, setStatus] = useState('Layout saved automatically when you press Save Layout.');
  const [scale, setScale] = useState(0.3);

  useEffect(() => { if (!editing) setDraft(clone(touch.layout)); }, [touch.layout, editing]);

  useEffect(() => {
    const measure = () => {
      const stage = stageRef.current;
      if (!stage) return;
      const screenW = Math.max(1, window.innerWidth);
      const screenH = Math.max(1, window.innerHeight);
      if (!fullscreen) stage.style.aspectRatio = `${screenW} / ${screenH}`;
      else stage.style.removeProperty('aspect-ratio');
      const rect = stage.getBoundingClientRect();
      const width = Math.max(280, rect.width || 700);
      const height = Math.max(158, rect.height || width * (screenH / screenW));
      setScale(Math.min(width / screenW, height / screenH));
    };
    measure();
    const raf = requestAnimationFrame(measure);
    window.addEventListener('resize', measure);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', measure); };
  }, [fullscreen]);

  const item = clampTouchLayoutItem(draft[selected], DEFAULT_TOUCH_LAYOUT[selected]);
  const meta = TOUCH_CONTROL_META[selected];
  const actualX = touch.invertButtons ? 1 - item.x : item.x;
  const patch = (key, next) => setDraft((d) => ({ ...d, [key]: { ...clampTouchLayoutItem(d[key], DEFAULT_TOUCH_LAYOUT[key]), ...next } }));

  const onPointerDown = (e) => {
    if (!editing) return;
    const control = e.target.closest('[data-touch-control]');
    if (!control) return;
    e.preventDefault();
    const key = control.dataset.touchControl;
    setSelected(key);
    pointerRef.current = {
      id: e.pointerId, key,
      mode: e.target.hasAttribute('data-touch-resize') ? 'resize' : 'move',
      startX: e.clientX, startY: e.clientY,
      item: clampTouchLayoutItem(draft[key], DEFAULT_TOUCH_LAYOUT[key]),
    };
    try { control.setPointerCapture(e.pointerId); } catch { /* ignore */ }
  };
  const onPointerMove = (e) => {
    const p = pointerRef.current;
    if (!editing || !p || e.pointerId !== p.id) return;
    e.preventDefault();
    const rect = stageRef.current.getBoundingClientRect();
    if (p.mode === 'move') {
      let x = clamp((e.clientX - rect.left) / Math.max(1, rect.width), 0.04, 0.96);
      let y = clamp((e.clientY - rect.top) / Math.max(1, rect.height), 0.05, 0.95);
      if (snap) { const step = 0.025; x = Math.round(x / step) * step; y = Math.round(y / step) * step; }
      patch(p.key, { ...p.item, x: touch.invertButtons ? 1 - x : x, y });
    } else {
      const delta = ((e.clientX - p.startX) / Math.max(1, rect.width) + (e.clientY - p.startY) / Math.max(1, rect.height)) * 1.8;
      patch(p.key, { ...p.item, size: clamp(p.item.size + delta, 0.55, 1.85) });
    }
  };
  const endPointer = () => { pointerRef.current = null; };

  const save = (text = 'Touch layout saved and applied to the game.') => {
    onSave(clone(draft));
    setEditing(false);
    setFullscreen(false);
    setStatus(text);
    playSfx('reward');
  };

  const controlClass = {
    joystick: 'touch-edit-joystick', split: 'touch-edit-split', split2: 'touch-edit-split2', split4: 'touch-edit-split4',
    feed: 'touch-edit-macro-feed', normalFeed: 'touch-edit-normal-feed', stats: 'touch-edit-stats',
    hudGroup: 'touch-edit-hud-group', emoji: 'touch-edit-emoji',
  };

  return (
    <div className="touch-editor-section">
      <div className="touch-editor-heading"><span /><b>Touch Layout Editor</b><span /></div>
      <p>Drag controls to place them. While editing, drag the yellow corner handle to resize each control.</p>
      <div className="touch-editor-actions">
        {!editing && <button className="touch-editor-primary" onClick={() => { playSfx('button'); setDraft(clone(touch.layout)); setEditing(true); setStatus('Select a control, drag it to move, or use the quick settings panel.'); }}>Edit Layout</button>}
        {editing && (
          <div className="touch-editor-edit-actions">
            <button className="touch-editor-primary" onClick={() => save()}>Save Layout</button>
            <button onClick={() => { playSfx('button'); setDraft(clone(DEFAULT_TOUCH_LAYOUT)); setStatus('Default layout loaded. Press Save Layout to keep it.'); }}>Reset</button>
            <button onClick={() => { playSfx('button'); setDraft(clone(touch.layout)); setEditing(false); setFullscreen(false); }}>Cancel</button>
          </div>
        )}
      </div>

      <div
        ref={stageRef}
        className={`touch-editor-stage${editing ? ' editing' : ''}${fullscreen ? ' fullscreen-editor' : ''}`}
        style={{ '--editor-scale': scale }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endPointer}
        onPointerCancel={endPointer}
      >
        {editing && (
          <div className="touch-editor-toolbar">
            <button className="touch-toolbar-finish" onClick={() => save('Layout saved and editing finished.')}>Finish Edit</button>
            <button className="touch-toolbar-fullscreen" onClick={() => { playSfx('button'); setFullscreen((v) => !v); }}>{fullscreen ? 'Exit Full Screen' : 'Edit Full Screen'}</button>
            <button className="touch-toolbar-reset" onClick={() => { playSfx('button'); setDraft(clone(DEFAULT_TOUCH_LAYOUT)); setSelected('split'); }}>Reset Layout</button>
          </div>
        )}

        {editing && (
          <div className="touch-selection-panel">
            <div className="touch-selection-title"><span className="touch-selected-icon">{meta.icon}</span><strong>{meta.name}</strong></div>
            <div className="touch-selection-visible">
              <span>Visible</span>
              <button className="touch-mini-switch" aria-pressed={item.visible} onClick={() => { playSfx('button'); patch(selected, { visible: !item.visible }); }}><i /></button>
            </div>
            <label className="touch-selection-slider"><span>Size</span>
              <input type="range" min="55" max="185" value={Math.round(item.size * 100)} onChange={(e) => patch(selected, { size: Number(e.target.value) / 100 })} />
              <output>{Math.round(item.size * 100)}%</output></label>
            <label className="touch-selection-slider"><span>Horizontal</span>
              <input type="range" min="4" max="96" value={Math.round(actualX * 100)} onChange={(e) => { const v = Number(e.target.value) / 100; patch(selected, { x: touch.invertButtons ? 1 - v : v }); }} />
              <output>{Math.round(actualX * 100)}</output></label>
            <label className="touch-selection-slider"><span>Vertical</span>
              <input type="range" min="5" max="95" value={Math.round(item.y * 100)} onChange={(e) => patch(selected, { y: Number(e.target.value) / 100 })} />
              <output>{Math.round(item.y * 100)}</output></label>
            <div className="touch-selection-metrics">
              <span>Size: {Math.round(item.size * 100)}</span>
              <span>Bottom: {Math.round((1 - item.y) * 100)}</span>
              <span>Right: {Math.round((1 - actualX) * 100)}</span>
            </div>
            <button className="touch-snap-btn" onClick={() => { playSfx('button'); setSnap((v) => !v); }}>{snap ? 'Snap On' : 'Snap Off'}</button>
          </div>
        )}

        {TOUCH_CONTROL_KEYS.map((key) => {
          const entry = clampTouchLayoutItem(draft[key], DEFAULT_TOUCH_LAYOUT[key]);
          const m = TOUCH_CONTROL_META[key];
          // Mirror the in-game sizing (uiScale + joystick size) so the editor matches what is on screen.
          const px = m.baseW * entry.size * scale * uiScale() * (key === 'joystick' ? touch.joystickSize : 1);
          const py = m.baseH * entry.size * scale * uiScale() * (key === 'joystick' ? touch.joystickSize : 1);
          const rawX = touch.invertButtons ? 1 - entry.x : entry.x;
          const stageW = Math.max(1, stageRef.current?.clientWidth || 1);
          const stageH = Math.max(1, stageRef.current?.clientHeight || 1);
          const x = clamp(rawX, Math.min(0.5, (px / 2 + 4) / stageW), Math.max(0.5, 1 - (px / 2 + 4) / stageW));
          const y = clamp(entry.y, Math.min(0.5, (py / 2 + 4) / stageH), Math.max(0.5, 1 - (py / 2 + 4) / stageH));
          return (
            <div
              key={key}
              data-touch-control={key}
              className={`touch-edit-control ${controlClass[key]}${editing && key === selected ? ' selected' : ''}`}
              style={{
                left: `${x * 100}%`, top: `${y * 100}%`,
                width: `${px}px`, height: `${py}px`,
                fontSize: `${Math.max(6, 12 * entry.size * scale * uiScale())}px`, opacity: entry.visible ? 1 : 0.3,
              }}
            >
              {key === 'joystick' && <span className="touch-joystick-base"><i className="touch-joystick-knob" /></span>}
              {key === 'stats' && <><span>⚖ MASS</span><span>🪙 COINS</span><span>⚡ FPS</span><span>📶 PING</span><span>☄ KILLS</span><span>📡 KB/S</span></>}
              {key === 'hudGroup' && <><span>♛</span><span>🎬</span><span>⚙</span><span>Ⅱ</span></>}
              {!['joystick','stats','hudGroup'].includes(key) && <strong>{key === 'split' ? 'SPLIT' : key === 'split2' ? '×2' : key === 'split4' ? '×4' : key === 'feed' ? 'MACRO' : key === 'normalFeed' ? 'FEED' : '😊'}</strong>}
              <i className="touch-resize-handle" data-touch-resize />
            </div>
          );
        })}
      </div>
      <div className="touch-editor-status">{status}</div>
    </div>
  );
}