import { useEffect, useRef } from 'react';
import { drawCell } from '@/game/render/cell';
import { drawCellCosmetics } from '@/game/render/cosmetics';
import { radiusFromMass } from '@/game/constants';
import { getSkin } from '@/game/skins';

// Live in-game cell preview used inside the Skins modal.
export default function SkinPreviewCanvas({ profile, skinId, compact = false, hideCell = false }) {
  const modeRef = useRef({ compact, hideCell });
  modeRef.current = { compact, hideCell };
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
      // Always fit the canvas to its container box so previews never overflow their card.
      const box = canvas.parentElement?.getBoundingClientRect();
      if (box && box.width > 10 && box.height > 10) {
        const w = `${Math.round(box.width)}px`;
        const h = `${Math.round(box.height)}px`;
        if (canvas.style.width !== w) canvas.style.width = w;
        if (canvas.style.height !== h) canvas.style.height = h;
      }
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
      const { compact: cmp, hideCell: hide } = modeRef.current;
      // Leave enough headroom so hats, halos and auras stay fully inside the card.
      const scale = cmp
        ? Math.min(rect.width / (radius * 4.4), rect.height / (radius * 4.4))
        : Math.min(rect.width / (radius * 2.65), rect.height / (radius * 3.35));
      ctx.save();
      ctx.translate(rect.width * 0.5, rect.height * (cmp ? 0.56 : 0.6));
      ctx.scale(scale, scale);
      if (hide) {
        const cosmeticProfile = { equippedCosmetics: p.equippedCosmetics, cosmeticTransforms: p.cosmeticTransforms, cosmeticPreview: p.cosmeticPreview };
        drawCellCosmetics(ctx, cosmeticProfile, { x: 0, y: 0 }, radius, t, 'back');
        drawCellCosmetics(ctx, cosmeticProfile, { x: 0, y: 0 }, radius, t, 'front');
        ctx.restore();
        return;
      }
      drawCell(ctx, {
        id: -88,
        name: p.nickname || 'Blob',
        skin: skin.id,
        isBot: false,
        equippedCosmetics: p.equippedCosmetics,
        cosmeticPreview: p.cosmeticPreview,
        cosmeticTransforms: p.cosmeticTransforms,
        equippedBadge: p.equippedBadge,
      }, cell, t, { quality: 'high' });
      ctx.restore();
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  return <canvas ref={ref} className={`skin-preview-canvas${compact ? ' fill' : ''}`} aria-label="Live in-game skin preview" />;
}