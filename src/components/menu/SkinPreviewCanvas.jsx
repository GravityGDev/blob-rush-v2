import { useEffect, useRef } from 'react';
import { drawCell } from '@/game/render/cell';
import { radiusFromMass } from '@/game/constants';
import { getSkin } from '@/game/skins';

// Live in-game cell preview used inside the Skins modal.
export default function SkinPreviewCanvas({ profile, skinId }) {
  const ref = useRef(null);
  const dataRef = useRef({ profile, skinId });
  dataRef.current = { profile, skinId };

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext('2d');
    const cell = { id: -88, x: 0, y: 0, mass: 500, mx: 0, my: 0, vx: 0, vy: 0 };
    let raf = 0;
    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      const rect = canvas.getBoundingClientRect();
      if (rect.width < 10) return;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const pw = Math.round(rect.width * dpr);
      const ph = Math.round(rect.height * dpr);
      if (canvas.width !== pw || canvas.height !== ph) { canvas.width = pw; canvas.height = ph; }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, rect.width, rect.height);

      const { profile: p, skinId: id } = dataRef.current;
      const skin = getSkin(id || p.skin);
      const t = now / 1000;
      cell.mx = skin.reactive ? 250 + Math.sin(t * 2.1) * 80 : 0;
      cell.my = skin.reactive ? Math.cos(t * 1.7) * 130 : 0;

      const radius = radiusFromMass(500);
      const scale = Math.min(rect.width / (radius * 2.65), rect.height / (radius * 3.35));
      ctx.save();
      ctx.translate(rect.width * 0.5, rect.height * 0.6);
      ctx.scale(scale, scale);
      drawCell(ctx, {
        id: -88,
        name: p.nickname || 'Blob',
        skin: skin.id,
        isBot: false,
        equippedCosmetics: p.equippedCosmetics,
        cosmeticTransforms: p.cosmeticTransforms,
        equippedBadge: p.equippedBadge,
      }, cell, t, { quality: 'high' });
      ctx.restore();
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  return <canvas ref={ref} className="skin-preview-canvas" aria-label="Live in-game skin preview" />;
}