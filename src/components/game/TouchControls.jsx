import TouchJoystick from './TouchJoystick';
import { hudStyle } from '@/game/hudLayout';

const BUTTONS = [
  { key:'split', base:78, label:'SPLIT', cls:'split', times:1 },
  { key:'split2', base:58, label:'×2', cls:'split2', times:2 },
  { key:'split4', base:58, label:'×4', cls:'split4', times:4 },
  { key:'normalFeed', base:62, label:'FEED', cls:'feed' },
  { key:'feed', base:64, label:'MACRO', cls:'macro' },
];

// The full on-screen control set: joystick, split/feed buttons and emoji wheel
// trigger, all positioned from the saved touch layout.
export default function TouchControls({ profile, session, onEmoji }) {
  const touch = profile.settings.touch;
  if (!touch.showButtons) return null;
  const layout = touch.layout;
  const flip = (style) => (touch.invertButtons ? { ...style, left: `${100 - parseFloat(style.left)}%` } : style);

  return (
    <>
      {layout.joystick.visible !== false && (
        <TouchJoystick
          style={flip(hudStyle(layout, 'joystick', 150 * (touch.joystickSize || 1)))}
          onDir={(dir) => session?.setJoystick(dir)}
        />
      )}

      {BUTTONS.map((b) => layout[b.key]?.visible !== false && (
        <button
          key={b.key}
          className={`touch-btn ${b.cls}`}
          style={flip(hudStyle(layout, b.key, b.base))}
          onPointerDown={() => { if (b.times) session?.split(b.times); else if (b.key === 'feed') session?.setMacro(true); else session?.eject(); }}
          onPointerUp={() => { if (b.key === 'feed') session?.setMacro(false); }}
          onPointerLeave={() => { if (b.key === 'feed') session?.setMacro(false); }}
        >
          {b.label}
        </button>
      ))}

      {layout.emoji.visible !== false && (
        <button className="touch-btn emoji" style={flip(hudStyle(layout, 'emoji', 56))} onClick={onEmoji}>😊</button>
      )}
    </>
  );
}