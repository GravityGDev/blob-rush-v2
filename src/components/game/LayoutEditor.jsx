import { useState } from 'react';
import { HUD_ELEMENTS, findHudElement, hudStyle } from '@/game/hudLayout';
import { DEFAULT_TOUCH_LAYOUT } from '@/game/save';

// Drag-and-drop touchscreen layout editor with per-control size/visibility.
export default function LayoutEditor({ layout, onChange, onFinish }) {
  const [selected, setSelected] = useState('split');
  const el = findHudElement(selected);
  const item = layout[selected] || { x: 0.5, y: 0.5, size: 1, visible: true };
  const patch = (key, values) => onChange({ ...layout, [key]: { ...layout[key], ...values } });

  const startDrag = (key) => (e) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setSelected(key);
    const move = (ev) => patch(key, {
      x: Math.max(0.03, Math.min(0.97, ev.clientX / window.innerWidth)),
      y: Math.max(0.05, Math.min(0.95, ev.clientY / window.innerHeight)),
    });
    const up = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  return (
    <div className="layout-editor">
      <div className="layout-editor-bar">
        <button className="layout-btn gold" onClick={onFinish}>Finish Edit</button>
        <button className="layout-btn gold" onClick={() => onChange(JSON.parse(JSON.stringify(DEFAULT_TOUCH_LAYOUT)))}>Reset Layout</button>
      </div>

      {HUD_ELEMENTS.map((entry) => (
        <div
          key={entry.key}
          className={`layout-handle${selected === entry.key ? ' selected' : ''}${layout[entry.key]?.visible === false ? ' hidden-el' : ''}`}
          style={hudStyle(layout, entry.key, Math.max(52, entry.base || 64))}
          onPointerDown={startDrag(entry.key)}
        >
          <span>{entry.icon}</span>
          <small>{entry.label}</small>
        </div>
      ))}

      <div className="layout-panel">
        <div className="layout-panel-head"><span className="layout-panel-icon">{el.icon}</span><h4>{el.label}</h4></div>
        <label className="layout-field">
          <span>Visible</span>
          <button className={`layout-switch${item.visible !== false ? ' on' : ''}`} onClick={() => patch(selected, { visible: item.visible === false })}><i /></button>
        </label>
        <label className="layout-field">
          <span>Size</span>
          <input type="range" min="50" max="160" value={Math.round((item.size || 1) * 100)} onChange={(e) => patch(selected, { size: +e.target.value / 100 })} />
          <b>{Math.round((item.size || 1) * 100)}%</b>
        </label>
        <label className="layout-field">
          <span>Horizontal</span>
          <input type="range" min="3" max="97" value={Math.round(item.x * 100)} onChange={(e) => patch(selected, { x: +e.target.value / 100 })} />
          <b>{Math.round(item.x * 100)}</b>
        </label>
        <label className="layout-field">
          <span>Vertical</span>
          <input type="range" min="5" max="95" value={Math.round(item.y * 100)} onChange={(e) => patch(selected, { y: +e.target.value / 100 })} />
          <b>{Math.round(item.y * 100)}</b>
        </label>
        <div className="layout-panel-meta">
          <span>Size: {Math.round((item.size || 1) * 100)}</span>
          <span>Bottom: {100 - Math.round(item.y * 100)}</span>
          <span>Right: {100 - Math.round(item.x * 100)}</span>
        </div>
        <button className="layout-btn gold wide" onClick={() => patch(selected, { x: Math.round(item.x * 20) / 20, y: Math.round(item.y * 20) / 20 })}>Snap On</button>
      </div>
    </div>
  );
}