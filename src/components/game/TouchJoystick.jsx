import { useRef, useState } from 'react';

// Analog joystick: reports a normalised direction + magnitude while dragging.
export default function TouchJoystick({ style, onDir }) {
  const ref = useRef(null);
  const [knob, setKnob] = useState({ x: 0, y: 0 });

  const handle = (e) => {
    const rect = ref.current.getBoundingClientRect();
    const t = e.touches?.[0] || e;
    const dx = t.clientX - (rect.left + rect.width / 2);
    const dy = t.clientY - (rect.top + rect.height / 2);
    const max = rect.width / 2;
    const dist = Math.hypot(dx, dy) || 1;
    const clamped = Math.min(dist, max);
    setKnob({ x: (dx / dist) * clamped, y: (dy / dist) * clamped });
    onDir({ x: dx / dist, y: dy / dist, mag: clamped / max });
  };
  const end = () => { setKnob({ x: 0, y: 0 }); onDir(null); };

  return (
    <div
      ref={ref}
      className="touch-joystick"
      style={style}
      onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); handle(e); }}
      onPointerMove={(e) => { if (e.buttons || e.pointerType === 'touch') handle(e); }}
      onPointerUp={end}
      onPointerCancel={end}
    >
      <div className="touch-joystick-knob" style={{ transform: `translate(calc(-50% + ${knob.x}px), calc(-50% + ${knob.y}px))` }} />
    </div>
  );
}