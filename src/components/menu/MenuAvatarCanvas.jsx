import { useEffect, useRef } from 'react';
import { getSkin, getSkinStroke } from '@/game/skins';
import { getSkinFill, drawPattern } from '@/game/render/skinArt';

export default function MenuAvatarCanvas({ skinId }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const skin = getSkin(skinId);
    let raf = 0;
    const start = performance.now();

    const draw = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const size = canvas.clientWidth || 260;
      canvas.width = size * dpr;
      canvas.height = size * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, size, size);

      const t = (performance.now() - start) / 1000;
      const cx = size / 2;
      const cy = size / 2;
      const r = size * 0.4;

      const cell = { x: cx, y: cy, id: 1, mass: 5000, mx: 0, my: 0, vx: 0, vy: 0 };
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = getSkinFill(ctx, cell, r, skin, t) || skin.base;
      ctx.fill();
      ctx.lineWidth = r * 0.14;
      ctx.strokeStyle = getSkinStroke(skin, t, 0);
      ctx.stroke();
      ctx.restore();
      drawPattern(ctx, cell, r, skin, t, 0, true);

      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [skinId]);

  return <canvas ref={ref} id="menuAvatarCanvas" className="menu-avatar-canvas" aria-hidden="true" />;
}