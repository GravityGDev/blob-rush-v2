// Shared definitions for the movable on-screen controls (touch layout editor).
export const HUD_ELEMENTS = [
  { key:'joystick', label:'Joystick', icon:'🕹️', base:150 },
  { key:'split', label:'Split', icon:'✂️', base:78 },
  { key:'split2', label:'Double Split', icon:'✌️', base:58 },
  { key:'split4', label:'Quad Split', icon:'🍀', base:58 },
  { key:'feed', label:'Macro Feed', icon:'🔥', base:64 },
  { key:'normalFeed', label:'Feed', icon:'🟢', base:62 },
  { key:'emoji', label:'Emoji Wheel', icon:'😊', base:56 },
  { key:'stats', label:'Stats Bar', icon:'📊', base:0 },
  { key:'hudGroup', label:'HUD Buttons', icon:'⚙️', base:0 },
];

export const findHudElement = (key) => HUD_ELEMENTS.find((e) => e.key === key);

export function hudStyle(layout, key, base) {
  const l = layout?.[key] || { x: 0.5, y: 0.5, size: 1 };
  const size = base ? Math.round(base * (l.size || 1)) : undefined;
  return {
    left: `${(l.x ?? 0.5) * 100}%`,
    top: `${(l.y ?? 0.5) * 100}%`,
    ...(size ? { width: `${size}px`, height: `${size}px` } : {}),
  };
}