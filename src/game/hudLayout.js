// Touch layout helpers — 1:1 with the original HTML build.
import { DEFAULT_TOUCH_LAYOUT, DEFAULT_TOUCH_SETTINGS } from './save';

export { DEFAULT_TOUCH_LAYOUT, DEFAULT_TOUCH_SETTINGS };

export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export const TOUCH_CONTROL_META = {
  joystick: { name:'Move Joystick', icon:'🕹️', baseW:112, baseH:112 },
  split: { name:'Split', icon:'✂️', baseW:78, baseH:78 },
  split2: { name:'Split ×2', icon:'2×', baseW:58, baseH:58 },
  split4: { name:'Split ×4', icon:'4×', baseW:58, baseH:58 },
  feed: { name:'Macro Feed', icon:'⚡', baseW:64, baseH:64 },
  normalFeed: { name:'Normal Feed', icon:'●', baseW:62, baseH:62 },
  stats: { name:'Stats Bar', icon:'📊', baseW:820, baseH:62 },
  hudGroup: { name:'Top HUD Buttons', icon:'♛ 🎬 ⚙ Ⅱ', baseW:224, baseH:50 },
  emoji: { name:'Emoji / Emote', icon:'😊', baseW:54, baseH:54 },
};

export const TOUCH_CONTROL_KEYS = Object.keys(DEFAULT_TOUCH_LAYOUT);

export function clampTouchLayoutItem(raw, fallback) {
  const item = { ...fallback, ...(raw || {}) };
  return {
    x: clamp(Number(item.x) || fallback.x, 0.04, 0.96),
    y: clamp(Number(item.y) || fallback.y, 0.05, 0.95),
    size: clamp(Number(item.size) || fallback.size, 0.55, 1.85),
    visible: item.visible !== false,
  };
}

export function getTouchSettings(profile) {
  const raw = profile?.settings?.touch || {};
  const layoutRaw = raw.layout || {};
  const layout = {};
  for (const key of TOUCH_CONTROL_KEYS) layout[key] = clampTouchLayoutItem(layoutRaw[key], DEFAULT_TOUCH_LAYOUT[key]);
  return {
    ...DEFAULT_TOUCH_SETTINGS,
    ...raw,
    showButtons: raw.showButtons !== false,
    invertButtons: !!raw.invertButtons,
    dynamicButtons: raw.dynamicButtons !== false,
    stopOnRelease: raw.stopOnRelease !== false,
    directionOnTouch: !!raw.directionOnTouch,
    joystickSize: clamp(Number(raw.joystickSize ?? profile?.settings?.joystick ?? 1), 0.65, 1.65),
    joystickSensitivity: clamp(Number(raw.joystickSensitivity ?? 1), 0.5, 2),
    layout,
  };
}

export function touchActualPoint(item, touch) {
  return { ...item, x: touch.invertButtons ? 1 - item.x : item.x };
}

// Absolute px style for a control placed inside the fixed touch layer.
export function controlStyle(touch, key, baseW, baseH = baseW) {
  const point = touchActualPoint(touch.layout[key], touch);
  return {
    position: 'absolute',
    left: `${point.x * 100}%`,
    top: `${point.y * 100}%`,
    width: `${baseW * point.size}px`,
    height: `${baseH * point.size}px`,
    transform: 'translate(-50%,-50%)',
  };
}

export const joystickRadius = (touch) => 56 * touch.joystickSize * touch.layout.joystick.size;