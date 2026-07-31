import { useEffect, useRef } from 'react';
import { getTouchSettings, controlStyle, touchActualPoint, joystickRadius, uiScale } from '@/game/hudLayout';
import useViewport from '@/hooks/use-viewport';

// Full-screen joystick layer + the split / feed / emoji buttons, positioned
// exactly like the original build's touch control layer.
export default function TouchControls({ profile, session, onEmoji }) {
  const layerRef = useRef(null);
  const baseRef = useRef(null);
  const knobRef = useRef(null);
  useViewport();
  const touch = getTouchSettings(profile);
  const touchRef = useRef(touch);
  touchRef.current = touch;

  useEffect(() => {
    const layer = layerRef.current;
    const base = baseRef.current;
    const knob = knobRef.current;
    let joyOrigin = null;
    let joyAnchor = null;
    let joyPointer = null;

    const size = () => ({ w: window.innerWidth, h: window.innerHeight });

    const showIdle = () => {
      const t = touchRef.current;
      if (t.dynamicButtons || !t.showButtons || !t.layout.joystick.visible || joyPointer !== null) return false;
      const { w, h } = size();
      const R = joystickRadius(t);
      const item = touchActualPoint(t.layout.joystick, t);
      place(Math.max(R + 10, Math.min(w - R - 10, item.x * w)), Math.max(R + 10, Math.min(h - R - 10, item.y * h)), R);
      base.style.display = knob.style.display = 'block';
      return true;
    };

    const place = (x, y, R) => {
      base.style.width = base.style.height = `${R * 2}px`;
      base.style.left = `${x}px`;
      base.style.top = `${y}px`;
      knob.style.width = knob.style.height = `${R * 0.76}px`;
      knob.style.left = `${x}px`;
      knob.style.top = `${y}px`;
    };

    const show = (x, y) => {
      const t = touchRef.current;
      const { w, h } = size();
      const R = joystickRadius(t);
      const saved = touchActualPoint(t.layout.joystick, t);
      joyOrigin = t.dynamicButtons
        ? { x: Math.max(R + 10, Math.min(w - R - 10, x)), y: Math.max(R + 10, Math.min(h - R - 10, y)) }
        : { x: Math.max(R + 10, Math.min(w - R - 10, saved.x * w)), y: Math.max(R + 10, Math.min(h - R - 10, saved.y * h)) };
      joyAnchor = t.directionOnTouch
        ? (t.dynamicButtons ? { x: w / 2, y: h / 2 } : { ...joyOrigin })
        : { x, y };
      place(joyOrigin.x, joyOrigin.y, R);
      const visible = t.showButtons && t.layout.joystick.visible;
      base.style.display = knob.style.display = visible ? 'block' : 'none';
    };

    const move = (x, y) => {
      if (!joyOrigin || !joyAnchor) return;
      const t = touchRef.current;
      const { w, h } = size();
      const dx = x - joyAnchor.x;
      const dy = y - joyAnchor.y;
      const R = joystickRadius(t);
      const margin = 5;
      const availableX = dx < 0 ? Math.max(14, joyAnchor.x - margin) : Math.max(14, w - joyAnchor.x - margin);
      const availableY = dy < 0 ? Math.max(14, joyAnchor.y - margin) : Math.max(14, h - joyAnchor.y - margin);
      const scaledX = (dx / Math.min(R, availableX)) * t.joystickSensitivity;
      const scaledY = (dy / Math.min(R, availableY)) * t.joystickSensitivity;
      const distance = Math.hypot(scaledX, scaledY);
      const mag = Math.min(1, distance);
      const next = distance > 0.0001 ? { x: scaledX / distance, y: scaledY / distance, mag } : { x: 0, y: 0, mag: 0 };
      session?.setInput(next);
      knob.style.left = `${joyOrigin.x + next.x * R * mag}px`;
      knob.style.top = `${joyOrigin.y + next.y * R * mag}px`;
    };

    const hide = () => {
      joyOrigin = null;
      joyAnchor = null;
      joyPointer = null;
      session?.stopInput(touchRef.current.stopOnRelease);
      if (!showIdle()) base.style.display = knob.style.display = 'none';
    };

    const onDown = (e) => {
      if (joyPointer !== null) return;
      joyPointer = e.pointerId;
      try { layer.setPointerCapture(e.pointerId); } catch { /* ignore */ }
      show(e.clientX, e.clientY);
      move(e.clientX, e.clientY);
    };
    const onMove = (e) => { if (e.pointerId === joyPointer) move(e.clientX, e.clientY); };
    const onUp = (e) => { if (e.pointerId === joyPointer) hide(); };

    layer.addEventListener('pointerdown', onDown);
    layer.addEventListener('pointermove', onMove);
    layer.addEventListener('pointerup', onUp);
    layer.addEventListener('pointercancel', onUp);
    window.addEventListener('resize', showIdle);
    showIdle();
    return () => {
      window.removeEventListener('resize', showIdle);
      layer.removeEventListener('pointerdown', onDown);
      layer.removeEventListener('pointermove', onMove);
      layer.removeEventListener('pointerup', onUp);
      layer.removeEventListener('pointercancel', onUp);
    };
  }, [session]);

  const stop = (e) => { e.preventDefault(); e.stopPropagation(); };
  const scale = uiScale();
  const btn = (key, base, cls, label, handlers) => touch.layout[key].visible && touch.showButtons && (
    <button key={key} className={`round-btn ${cls}`}
      style={{ ...controlStyle(touch, key, base), fontSize: `${Math.max(8, Math.round(base * 0.17 * touch.layout[key].size * scale))}px` }}
      {...handlers}>{label}</button>
  );

  return (
    <>
      <div id="joystickLayer" ref={layerRef} />
      <div id="joystickBase" className="joy" ref={baseRef} style={{ display: 'none' }} />
      <div id="joystickKnob" className="joy" ref={knobRef} style={{ display: 'none' }} />

      {btn('split', 78, 'split-btn', 'SPLIT', { onPointerDown: (e) => { stop(e); session?.split(1); } })}
      {btn('split2', 58, 'split2-btn', '×2', { onPointerDown: (e) => { stop(e); session?.split(2); } })}
      {btn('split4', 58, 'split4-btn', '×4', { onPointerDown: (e) => { stop(e); session?.split(4); } })}
      {btn('feed', 64, 'macro-feed-btn', 'MACRO', {
        onPointerDown: (e) => { stop(e); session?.setMacro(true); },
        onPointerUp: () => session?.setMacro(false),
        onPointerCancel: () => session?.setMacro(false),
        onPointerLeave: () => session?.setMacro(false),
      })}
      {btn('normalFeed', 62, 'normal-feed-btn', 'FEED', {
        onPointerDown: (e) => { stop(e); session?.setNormalFeed(true); },
        onPointerUp: () => session?.setNormalFeed(false),
        onPointerCancel: () => session?.setNormalFeed(false),
        onPointerLeave: () => session?.setNormalFeed(false),
      })}

      {touch.layout.emoji.visible && touch.showButtons && (
        <button id="emojiHudBtn" style={{ ...controlStyle(touch, 'emoji', 54), fontSize: `${Math.round(26 * touch.layout.emoji.size * scale)}px` }} onPointerDown={(e) => { stop(e); onEmoji(); }}>😊</button>
      )}
    </>
  );
}