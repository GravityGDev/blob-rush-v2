import { useEffect, useRef } from 'react';
import { WORLD_SIZE } from '@/game/constants';

export default function HudMiniMap({ playerPos }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const size = canvas.clientWidth || 150;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size, size);

    ctx.strokeStyle = 'rgba(255,255,255,.09)';
    ctx.lineWidth = 1;
    for (let i = 1; i < 5; i++) {
      const p = (size / 5) * i;
      ctx.beginPath(); ctx.moveTo(p, 0); ctx.lineTo(p, size); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, p); ctx.lineTo(size, p); ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(125,211,252,.28)';
    ctx.strokeRect(1, 1, size - 2, size - 2);

    if (playerPos) {
      const x = (playerPos.x / WORLD_SIZE) * size;
      const y = (playerPos.y / WORLD_SIZE) * size;
      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [playerPos]);

  return (
    <aside className="mini-map-panel" aria-label="Mini map">
      <canvas id="miniMapCanvas" ref={ref} />
    </aside>
  );
}