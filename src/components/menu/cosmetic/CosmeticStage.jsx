import { useEffect, useRef, useState } from 'react';
import SkinPreviewCanvas from '../SkinPreviewCanvas';
import { radiusFromMass } from '@/game/constants';

const R = radiusFromMass(500);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// Interactive editing stage: drag to move, yellow handle resizes, blue handle rotates, pinch zooms.
export default function CosmeticStage({ previewProfile, skinId, draft, onDraft, hasItem }) {
  const wrapRef = useRef(null);
  const [box, setBox] = useState({ w: 0, h: 0 });
  const [zoom, setZoom] = useState(1);
  const drag = useRef(null);
  const pinch = useRef(null);

  useEffect(() => {
    const measure = () => {
      const el = wrapRef.current;
      if (el) setBox({ w: el.clientWidth, h: el.clientHeight });
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  // Same projection the preview canvas uses, so the box lines up with the drawn cosmetic.
  const unit = Math.min(box.w / (R * 2.65), box.h / (R * 3.35)) * R;
  const cx = box.w * 0.5;
  const cy = box.h * 0.5;
  const size = Math.max(24, unit * 1.35 * Number(draft.scale || 1));
  const left = cx + (Number(draft.x || 0) / 100) * unit;
  const top = cy + (Number(draft.y || 0) / 100) * unit;

  const toUnits = (px) => (px / (unit || 1)) * 100;

  // Two-finger pinch / twist directly on the selection box.
  const boxPointers = useRef(new Map());
  const gesture = useRef(null);

  const onPointerDown = (mode) => (e) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    if (mode === 'move') {
      boxPointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (boxPointers.current.size === 2) {
        const [a, b] = [...boxPointers.current.values()];
        gesture.current = {
          dist: Math.max(1, Math.hypot(a.x - b.x, a.y - b.y)),
          angle: Math.atan2(a.y - b.y, a.x - b.x) * 180 / Math.PI,
          start: { ...draft },
        };
        drag.current = null;
        return;
      }
    }
    drag.current = { mode, sx: e.clientX, sy: e.clientY, start: { ...draft } };
  };

  const onBoxPointerMove = (e) => {
    if (!boxPointers.current.has(e.pointerId)) return;
    boxPointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const g = gesture.current;
    if (!g || boxPointers.current.size < 2) return;
    e.stopPropagation();
    const [a, b] = [...boxPointers.current.values()];
    const dist = Math.max(1, Math.hypot(a.x - b.x, a.y - b.y));
    const angle = Math.atan2(a.y - b.y, a.x - b.x) * 180 / Math.PI;
    let delta = angle - g.angle;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    onDraft({
      scale: clamp(g.start.scale * (dist / g.dist), 0.35, 2.2),
      rotation: clamp(Math.round((g.start.rotation || 0) + delta), -180, 180),
    });
  };

  const onBoxPointerUp = (e) => {
    boxPointers.current.delete(e.pointerId);
    if (boxPointers.current.size < 2) gesture.current = null;
  };

  const onPointerMove = (e) => {
    const d = drag.current;
    if (!d || gesture.current) return;
    const dx = (e.clientX - d.sx) / zoom;
    const dy = (e.clientY - d.sy) / zoom;
    if (d.mode === 'move') {
      onDraft({ x: clamp(d.start.x + toUnits(dx), -160, 160), y: clamp(d.start.y + toUnits(dy), -160, 160) });
    } else if (d.mode === 'scale') {
      onDraft({ scale: clamp(d.start.scale * (1 + (dx + dy) / 220), 0.35, 2.2) });
    } else if (d.mode === 'rotate') {
      const ang = Math.atan2(e.clientY - d.sy, e.clientX - d.sx) * 180 / Math.PI;
      onDraft({ rotation: clamp(Math.round(d.start.rotation + ang), -180, 180) });
    }
  };
  const endDrag = () => { drag.current = null; };

  const stagePointers = useRef(new Map());
  const stageDown = (e) => {
    stagePointers.current.set(e.pointerId, e);
    if (stagePointers.current.size === 2) {
      const [a, b] = [...stagePointers.current.values()];
      pinch.current = { dist: Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY), zoom };
    }
  };
  const stageMove = (e) => {
    if (stagePointers.current.has(e.pointerId)) stagePointers.current.set(e.pointerId, e);
    if (stagePointers.current.size === 2 && pinch.current) {
      const [a, b] = [...stagePointers.current.values()];
      const dist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
      setZoom(clamp(pinch.current.zoom * (dist / pinch.current.dist), 0.6, 3));
    }
    onPointerMove(e);
  };
  const stageUp = (e) => {
    stagePointers.current.delete(e.pointerId);
    if (stagePointers.current.size < 2) pinch.current = null;
    endDrag();
  };

  return (
    <div
      className="cosmetic-fs-stage"
      onPointerDown={stageDown}
      onPointerMove={stageMove}
      onPointerUp={stageUp}
      onPointerCancel={stageUp}
      onWheel={(e) => setZoom((z) => clamp(z - e.deltaY / 900, 0.6, 3))}
    >
      <div className="cosmetic-fs-view-tools">
        <span>Preview {Math.round(zoom * 100)}%</span>
        <button onClick={() => setZoom(1)}>Reset zoom</button>
      </div>

      <div className="cosmetic-fs-stage-inner" ref={wrapRef} style={{ transform: `scale(${zoom})` }}>
        <SkinPreviewCanvas profile={previewProfile} skinId={skinId} />
        {hasItem && (
          <div
            className="cosmetic-direct-overlay active"
            style={{ left, top, width: size, height: size, transform: `translate(-50%,-50%) rotate(${draft.rotation || 0}deg)` }}
            onPointerDown={onPointerDown('move')}
            onPointerMove={onBoxPointerMove}
            onPointerUp={onBoxPointerUp}
            onPointerCancel={onBoxPointerUp}
          >
            <span className="cosmetic-direct-move">✥</span>
            <button className="cosmetic-direct-handle rotate" onPointerDown={onPointerDown('rotate')}>↻</button>
            <button className="cosmetic-direct-handle resize" onPointerDown={onPointerDown('scale')}>⤡</button>
          </div>
        )}
      </div>

      <div className="cosmetic-fs-tip">Drag to move • Pinch/twist on the box to scale &amp; rotate • Yellow resizes • Blue rotates • Pinch outside the box to zoom</div>
    </div>
  );
}