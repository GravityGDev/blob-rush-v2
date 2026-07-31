// Skin fills and animated pattern art drawn inside each cell.
import { TAU, rgba } from '../utils';

export function getSkinFill(ctx, c, r, skin, t, reactiveLevel = 0) {
  if (skin.pattern === 'rainbow') {
    const g = ctx.createLinearGradient(c.x - r, c.y - r, c.x + r, c.y + r);
    const h = (t * 80) % 360;
    g.addColorStop(0, `hsl(${h}, 95%, 62%)`);
    g.addColorStop(0.33, `hsl(${(h + 90) % 360}, 95%, 60%)`);
    g.addColorStop(0.66, `hsl(${(h + 180) % 360}, 92%, 58%)`);
    g.addColorStop(1, `hsl(${(h + 270) % 360}, 95%, 62%)`);
    return g;
  }
  if (skin.pattern === 'flame') {
    const g = ctx.createRadialGradient(c.x, c.y + r * 0.2, 0, c.x, c.y, r);
    g.addColorStop(0, rgba('#e0f2fe', .95));
    g.addColorStop(0.22, rgba('#38bdf8', .95));
    g.addColorStop(0.6, rgba(skin.accent, .82));
    g.addColorStop(1, rgba(skin.base, .98));
    return g;
  }
  if (skin.pattern === 'plasma') {
    const g = ctx.createRadialGradient(c.x - r * 0.18, c.y - r * 0.22, r * 0.05, c.x, c.y, r);
    g.addColorStop(0, rgba('#f5d0fe', .98));
    g.addColorStop(0.26, rgba(skin.accent, .9));
    g.addColorStop(0.74, rgba('#7c3aed', .92));
    g.addColorStop(1, rgba(skin.base, .98));
    return g;
  }
  if (skin.pattern === 'galaxy') {
    const g = ctx.createRadialGradient(c.x - r * 0.12, c.y - r * 0.16, 0, c.x, c.y, r);
    g.addColorStop(0, rgba('#ffffff', .96));
    g.addColorStop(0.08, rgba('#fde68a', .75));
    g.addColorStop(0.22, rgba('#c4b5fd', .9));
    g.addColorStop(0.65, rgba('#6d28d9', .88));
    g.addColorStop(1, rgba(skin.base, .99));
    return g;
  }
  if (skin.pattern === 'slime') {
    const g = ctx.createRadialGradient(c.x - r * 0.2, c.y - r * 0.2, 0, c.x, c.y, r);
    g.addColorStop(0, rgba('#ecfccb', .96));
    g.addColorStop(0.2, rgba('#d9f99d', .92));
    g.addColorStop(0.62, rgba('#84cc16', .95));
    g.addColorStop(1, rgba(skin.base, .98));
    return g;
  }
  if (skin.pattern === 'ice') {
    const g = ctx.createRadialGradient(c.x - r * 0.25, c.y - r * 0.3, 0, c.x, c.y, r);
    g.addColorStop(0, rgba('#ffffff', .98));
    g.addColorStop(0.18, rgba('#dbeafe', .96));
    g.addColorStop(0.6, rgba('#93c5fd', .9));
    g.addColorStop(1, rgba('#1d4ed8', .82));
    return g;
  }
  if (skin.pattern === 'lava') {
    const g = ctx.createRadialGradient(c.x, c.y, r * 0.08, c.x, c.y, r);
    g.addColorStop(0, rgba('#fdba74', .95));
    g.addColorStop(0.18, rgba('#fb923c', .92));
    g.addColorStop(0.48, rgba('#c2410c', .85));
    g.addColorStop(1, rgba(skin.base, .98));
    return g;
  }
  if (skin.pattern === 'grid') {
    const g = ctx.createLinearGradient(c.x - r, c.y - r, c.x + r, c.y + r);
    g.addColorStop(0, rgba('#082f49', .97));
    g.addColorStop(0.5, rgba(skin.base, .98));
    g.addColorStop(1, rgba('#111827', .97));
    return g;
  }
  if (skin.pattern === 'shadoweye') {
    const g = ctx.createRadialGradient(c.x, c.y, r * 0.08, c.x, c.y, r);
    g.addColorStop(0, rgba('#27272a', .75));
    g.addColorStop(0.5, rgba('#18181b', .95));
    g.addColorStop(1, rgba('#09090b', .99));
    return g;
  }
  if (skin.pattern === 'crown') {
    const g = ctx.createLinearGradient(c.x - r, c.y - r * 0.5, c.x + r, c.y + r);
    g.addColorStop(0, rgba('#fef9c3', .98));
    g.addColorStop(0.24, rgba('#fde047', .95));
    g.addColorStop(0.6, rgba('#f59e0b', .92));
    g.addColorStop(1, rgba('#b45309', .98));
    return g;
  }
  if (skin.pattern === 'void') {
    const g = ctx.createRadialGradient(c.x, c.y, r * 0.05, c.x, c.y, r);
    g.addColorStop(0, rgba('#02010a', .99));
    g.addColorStop(0.45, rgba('#14061f', .98));
    g.addColorStop(0.8, rgba('#2e1065', .94));
    g.addColorStop(1, rgba('#0b0416', .99));
    return g;
  }
  if (skin.pattern === 'thunder') {
    const g = ctx.createRadialGradient(c.x - r * 0.2, c.y - r * 0.24, 0, c.x, c.y, r);
    g.addColorStop(0, rgba('#e0f2fe', .32));
    g.addColorStop(0.3, rgba('#475569', .86));
    g.addColorStop(0.72, rgba('#1f2937', .96));
    g.addColorStop(1, rgba('#0f172a', .99));
    return g;
  }
  if (skin.pattern === 'solar') {
    const g = ctx.createRadialGradient(c.x, c.y, r * 0.04, c.x, c.y, r);
    g.addColorStop(0, rgba('#fff7ed', .98));
    g.addColorStop(0.16, rgba('#fde68a', .95));
    g.addColorStop(0.42, rgba('#fb923c', .93));
    g.addColorStop(0.76, rgba('#ea580c', .88));
    g.addColorStop(1, rgba('#7c2d12', .98));
    return g;
  }
  if (skin.pattern === 'sakura') {
    const g = ctx.createLinearGradient(c.x - r, c.y - r, c.x + r, c.y + r);
    g.addColorStop(0, rgba('#c084fc', .95));
    g.addColorStop(0.45, rgba('#8b5cf6', .9));
    g.addColorStop(0.75, rgba('#ec4899', .88));
    g.addColorStop(1, rgba('#4c1d95', .98));
    return g;
  }
  if (skin.pattern === 'glitch') {
    const g = ctx.createLinearGradient(c.x - r, c.y, c.x + r, c.y);
    g.addColorStop(0, rgba('#050816', .99));
    g.addColorStop(0.5, rgba('#0f172a', .97));
    g.addColorStop(1, rgba('#020617', .99));
    return g;
  }
  if (skin.pattern === 'chrome') {
    const g = ctx.createLinearGradient(c.x - r, c.y - r * 0.4, c.x + r, c.y + r * 0.4);
    g.addColorStop(0, rgba('#eef2ff', .98));
    g.addColorStop(0.18, rgba('#94a3b8', .92));
    g.addColorStop(0.36, rgba('#f8fafc', .98));
    g.addColorStop(0.56, rgba('#64748b', .9));
    g.addColorStop(0.76, rgba('#cbd5e1', .95));
    g.addColorStop(1, rgba('#334155', .98));
    return g;
  }
  if (skin.pattern === 'frostfire') {
    const g = ctx.createLinearGradient(c.x - r, c.y - r, c.x + r, c.y + r);
    const shift = 0.08 * Math.sin(t * 1.4);
    g.addColorStop(0, rgba('#dbeafe', .98));
    g.addColorStop(Math.max(0.18, 0.34 + shift), rgba('#38bdf8', .92));
    g.addColorStop(0.5, rgba('#f8fafc', .82));
    g.addColorStop(Math.min(0.82, 0.66 + shift), rgba('#fb923c', .93));
    g.addColorStop(1, rgba('#7c2d12', .98));
    return g;
  }
  if (skin.pattern === 'mist') {
    const g = ctx.createRadialGradient(c.x, c.y, r * 0.06, c.x, c.y, r);
    g.addColorStop(0, rgba('#d1fae5', .25));
    g.addColorStop(0.36, rgba('#14532d', .62));
    g.addColorStop(1, rgba('#04130f', .98));
    return g;
  }
  if (skin.pattern === 'rift') {
    const g = ctx.createRadialGradient(c.x, c.y, r * 0.05, c.x, c.y, r);
    g.addColorStop(0, rgba('#f5d0fe', .18));
    g.addColorStop(0.28, rgba('#111827', .72));
    g.addColorStop(0.72, rgba('#1e1b4b', .96));
    g.addColorStop(1, rgba('#020617', .99));
    return g;
  }
  if (skin.pattern === 'reactor') {
    const g = ctx.createRadialGradient(c.x, c.y, r * 0.06, c.x, c.y, r);
    g.addColorStop(0, rgba('#e0f2fe', .92));
    g.addColorStop(0.16, rgba('#38bdf8', .86));
    g.addColorStop(0.46, rgba('#0f172a', .92));
    g.addColorStop(1, rgba('#020617', .99));
    return g;
  }
  if (skin.pattern === 'bloodmoon') {
    const g = ctx.createRadialGradient(c.x - r * 0.15, c.y - r * 0.2, 0, c.x, c.y, r);
    g.addColorStop(0, rgba('#fecaca', .62));
    g.addColorStop(0.22, rgba('#f87171', .78));
    g.addColorStop(0.6, rgba('#991b1b', .92));
    g.addColorStop(1, rgba('#2b0a10', .99));
    return g;
  }
  if (skin.pattern === 'dragon') {
    const g = ctx.createRadialGradient(c.x - r * 0.16, c.y - r * 0.2, 0, c.x, c.y, r);
    g.addColorStop(0, rgba('#86efac', .72));
    g.addColorStop(0.26, rgba('#22c55e', .84));
    g.addColorStop(0.72, rgba('#14532d', .95));
    g.addColorStop(1, rgba('#052e16', .99));
    return g;
  }
  return skin.base;
}

export function clipCellCircle(ctx, c, r, scale = 0.93) {
  ctx.beginPath();
  ctx.arc(c.x, c.y, r * scale, 0, TAU);
  ctx.clip();
}

export function drawPetal(ctx, x, y, size, angle, color, alpha = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.globalAlpha *= alpha;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.15);
  ctx.quadraticCurveTo(size * 0.7, -size * 0.7, size * 0.15, -size * 1.05);
  ctx.quadraticCurveTo(-size * 0.22, -size * 0.98, -size * 0.18, -size * 0.24);
  ctx.quadraticCurveTo(-size * 0.5, 0, 0, -size * 0.15);
  ctx.fill();
  ctx.restore();
}

export function drawPattern(ctx, c, r, skin, t, reactiveLevel = 0, allowGlow = true) {
  if (skin.pattern === 'plain') return;
  ctx.save();
  ctx.globalAlpha = 0.5;
  if ([
    'nebulaforge','infernotide','aurorafrost','quantumpulse','stormsurge','moonlotus','obsidianflare','starlightnova','venombyte','celestialveil','prismaticorbit','seraphiccore','abyssalnova','chronoshatter','phoenixveil','crownedeclipse','nebulareign'
  ].includes(skin.pattern)) {
    clipCellCircle(ctx, c, r);
    ctx.globalAlpha = 0.92;
    if (skin.pattern === 'nebulaforge') {
      ctx.strokeStyle = rgba('#f5d0fe', .68);
      ctx.lineWidth = Math.max(1.2, r * 0.026);
      for (let arm = 0; arm < 3; arm++) {
        ctx.beginPath();
        for (let i = 0; i <= 30; i++) {
          const u = i / 30;
          const a = t * 1.05 + arm * (TAU / 3) + u * 4.8;
          const rr = r * (0.12 + u * 0.72);
          const x = c.x + Math.cos(a) * rr;
          const y = c.y + Math.sin(a) * rr;
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      ctx.fillStyle = rgba('#ffffff', .9);
      for (let i = 0; i < 12; i++) {
        const a = t * 1.6 + i * 0.52;
        const rr = r * (0.22 + (i % 5) * 0.1);
        ctx.beginPath(); ctx.arc(c.x + Math.cos(a) * rr, c.y + Math.sin(a * 1.25) * rr, r * 0.018, 0, TAU); ctx.fill();
      }
      const core = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, r * 0.42);
      core.addColorStop(0, rgba('#ffe4f6', .7)); core.addColorStop(1, 'rgba(255,123,213,0)');
      ctx.fillStyle = core; ctx.beginPath(); ctx.arc(c.x, c.y, r * 0.44, 0, TAU); ctx.fill();
    } else if (skin.pattern === 'infernotide') {
      for (let ring = 0; ring < 3; ring++) {
        ctx.strokeStyle = ring === 0 ? rgba('#ffedd5', .72) : rgba('#fb923c', .72 - ring * 0.14);
        ctx.lineWidth = Math.max(1.6, r * (0.026 + ring * 0.01));
        ctx.beginPath();
        for (let i = 0; i <= 24; i++) {
          const u = i / 24;
          const a = u * TAU;
          const wave = Math.sin(a * 4 + t * (2.4 + ring * 0.6) + ring) * r * (0.06 + ring * 0.014);
          const rr = r * (0.44 + ring * 0.12) + wave;
          const x = c.x + Math.cos(a) * rr;
          const y = c.y + Math.sin(a) * rr;
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.closePath(); ctx.stroke();
      }
      for (let i = 0; i < 7; i++) {
        const a = t * 1.5 + i * 0.8;
        const x = c.x + Math.cos(a) * r * 0.55;
        const y = c.y + Math.sin(a) * r * 0.55;
        const g = ctx.createRadialGradient(x, y, 0, x, y, r * 0.14);
        g.addColorStop(0, rgba('#fff7ed', .7)); g.addColorStop(1, 'rgba(255,107,74,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * 0.12, 0, TAU); ctx.fill();
      }
    } else if (skin.pattern === 'aurorafrost') {
      ctx.strokeStyle = rgba('#e0f2fe', .88);
      ctx.lineWidth = Math.max(1.1, r * 0.024);
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * TAU + t * 0.16;
        ctx.beginPath();
        ctx.moveTo(c.x + Math.cos(a) * r * 0.16, c.y + Math.sin(a) * r * 0.16);
        ctx.lineTo(c.x + Math.cos(a) * r * 0.72, c.y + Math.sin(a) * r * 0.72);
        ctx.lineTo(c.x + Math.cos(a + 0.14) * r * 0.52, c.y + Math.sin(a + 0.14) * r * 0.52);
        ctx.stroke();
      }
      const aurora = ctx.createLinearGradient(c.x - r * 0.8, c.y - r * 0.8, c.x + r * 0.8, c.y + r * 0.8);
      aurora.addColorStop(0, 'rgba(125,211,252,0)');
      aurora.addColorStop(0.35, 'rgba(125,211,252,0.35)');
      aurora.addColorStop(0.65, 'rgba(196,181,253,0.22)');
      aurora.addColorStop(1, 'rgba(125,211,252,0)');
      ctx.fillStyle = aurora; ctx.rotate(Math.sin(t * 0.9) * 0.35); ctx.fillRect(c.x - r, c.y - r, r * 2, r * 2);
    } else if (skin.pattern === 'quantumpulse') {
      ctx.strokeStyle = rgba('#99f6e4', .82);
      ctx.lineWidth = Math.max(1.4, r * 0.022);
      for (let ring = 0; ring < 3; ring++) {
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const a = t * (0.6 + ring * 0.25) + i * (TAU / 6);
          const rr = r * (0.26 + ring * 0.14);
          const x = c.x + Math.cos(a) * rr;
          const y = c.y + Math.sin(a) * rr;
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.closePath(); ctx.stroke();
      }
      ctx.fillStyle = rgba('#d1fae5', .94);
      for (let i = 0; i < 6; i++) {
        const a = -t * 1.4 + i * (TAU / 6);
        const rr = r * 0.58;
        ctx.beginPath(); ctx.arc(c.x + Math.cos(a) * rr, c.y + Math.sin(a) * rr, r * 0.035, 0, TAU); ctx.fill();
      }
      ctx.strokeStyle = rgba('#34d399', .85);
      ctx.beginPath(); ctx.arc(c.x, c.y, r * (0.18 + Math.sin(t * 2.8) * 0.03), 0, TAU); ctx.stroke();
    } else if (skin.pattern === 'stormsurge') {
      ctx.strokeStyle = rgba('#bfdbfe', .9);
      ctx.lineWidth = Math.max(1.4, r * 0.022);
      for (let i = 0; i < 4; i++) {
        const start = t * 0.9 + i * 1.35;
        ctx.beginPath();
        ctx.arc(c.x, c.y, r * (0.36 + i * 0.1), start, start + 1.2 + Math.sin(t * 2.2 + i) * 0.18);
        ctx.stroke();
      }
      for (let i = 0; i < 3; i++) {
        ctx.strokeStyle = i % 2 ? rgba('#60a5fa', .95) : rgba('#ffffff', .62);
        ctx.lineWidth = Math.max(1.2, r * 0.02);
        ctx.beginPath();
        let px = c.x - r * 0.4 + Math.sin(t * 2.4 + i) * r * 0.1;
        let py = c.y - r * 0.36 + i * r * 0.18;
        ctx.moveTo(px, py);
        for (let seg = 0; seg < 5; seg++) {
          const nx = px + r * 0.18 + Math.sin(t * 6 + seg + i) * r * 0.08;
          const ny = py + r * 0.12 + Math.cos(t * 4.8 + seg + i) * r * 0.08;
          ctx.lineTo(nx, ny); px = nx; py = ny;
        }
        ctx.stroke();
      }
    } else if (skin.pattern === 'moonlotus') {
      const halo = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, r * 0.7);
      halo.addColorStop(0, rgba('#fdf2f8', .55)); halo.addColorStop(1, 'rgba(249,168,212,0)');
      ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(c.x, c.y, r * 0.7, 0, TAU); ctx.fill();
      ctx.fillStyle = rgba('#fdf2f8', .95);
      ctx.beginPath(); ctx.arc(c.x, c.y - r * 0.04, r * 0.18, 0, TAU); ctx.fill();
      for (let i = 0; i < 8; i++) {
        const a = t * 0.5 + i * (TAU / 8);
        drawPetal(ctx, c.x + Math.cos(a) * r * 0.38, c.y + Math.sin(a) * r * 0.38, r * 0.16, a + Math.PI / 2, i % 2 ? '#f9a8d4' : '#fdf2f8', 0.88);
      }
    } else if (skin.pattern === 'obsidianflare') {
      ctx.fillStyle = rgba('#fb923c', .16);
      for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(c.x, c.y, r * (0.24 + i * 0.13), 0, TAU); ctx.fill(); }
      ctx.strokeStyle = rgba('#fb923c', .88);
      ctx.lineWidth = Math.max(1.5, r * 0.026);
      for (let i = 0; i < 6; i++) {
        const a = t * 0.7 + i * (TAU / 6);
        ctx.beginPath();
        ctx.moveTo(c.x + Math.cos(a) * r * 0.1, c.y + Math.sin(a) * r * 0.1);
        ctx.lineTo(c.x + Math.cos(a + 0.08) * r * 0.38, c.y + Math.sin(a + 0.08) * r * 0.38);
        ctx.lineTo(c.x + Math.cos(a - 0.06) * r * 0.74, c.y + Math.sin(a - 0.06) * r * 0.74);
        ctx.stroke();
      }
      ctx.fillStyle = rgba('#09090b', .52);
      for (let i = 0; i < 5; i++) {
        const a = t * 0.35 + i * 1.21;
        ctx.beginPath();
        ctx.moveTo(c.x + Math.cos(a) * r * 0.28, c.y + Math.sin(a) * r * 0.28);
        ctx.lineTo(c.x + Math.cos(a + 0.32) * r * 0.54, c.y + Math.sin(a + 0.32) * r * 0.54);
        ctx.lineTo(c.x + Math.cos(a - 0.22) * r * 0.68, c.y + Math.sin(a - 0.22) * r * 0.68);
        ctx.closePath(); ctx.fill();
      }
    } else if (skin.pattern === 'starlightnova') {
      const hue = (t * 90 + c.id * 17) % 360;
      for (let i = 0; i < 10; i++) {
        const a = t * 1.2 + i * (TAU / 10);
        const rr = r * (0.24 + (i % 3) * 0.16);
        const g = ctx.createRadialGradient(c.x + Math.cos(a) * rr, c.y + Math.sin(a) * rr, 0, c.x + Math.cos(a) * rr, c.y + Math.sin(a) * rr, r * 0.14);
        g.addColorStop(0, `hsla(${(hue + i * 30) % 360},100%,70%,0.95)`); g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(c.x + Math.cos(a) * rr, c.y + Math.sin(a) * rr, r * 0.12, 0, TAU); ctx.fill();
      }
      ctx.strokeStyle = rgba('#ffffff', .78); ctx.lineWidth = Math.max(1.2, r * 0.02);
      for (let i = 0; i < 4; i++) { const a = t * 0.75 + i * (Math.PI / 2); ctx.beginPath(); ctx.moveTo(c.x - Math.cos(a) * r * 0.65, c.y - Math.sin(a) * r * 0.65); ctx.lineTo(c.x + Math.cos(a) * r * 0.65, c.y + Math.sin(a) * r * 0.65); ctx.stroke(); }
    } else if (skin.pattern === 'venombyte') {
      for (let i = 0; i < 7; i++) {
        const y = c.y - r * 0.7 + i * r * 0.23 + Math.sin(t * 4.5 + i) * r * 0.05;
        ctx.fillStyle = i % 2 ? rgba('#67e8f9', .12) : rgba('#86efac', .14);
        ctx.fillRect(c.x - r * 0.72, y, r * 1.44, r * 0.08);
      }
      ctx.strokeStyle = rgba('#a3e635', .82); ctx.lineWidth = Math.max(1.2, r * 0.02);
      for (let i = 0; i < 5; i++) {
        const a = -0.4 + i * 0.42 + Math.sin(t * 2 + i) * 0.04;
        ctx.beginPath();
        ctx.moveTo(c.x + Math.cos(a) * r * 0.18, c.y + Math.sin(a) * r * 0.18);
        ctx.lineTo(c.x + Math.cos(a + 0.12) * r * 0.42, c.y + Math.sin(a + 0.12) * r * 0.42);
        ctx.lineTo(c.x + Math.cos(a - 0.1) * r * 0.62, c.y + Math.sin(a - 0.1) * r * 0.62);
        ctx.stroke();
      }
      ctx.fillStyle = rgba('#d9f99d', .9);
      for (let i = 0; i < 3; i++) { const a = t * 1.2 + i * 2; ctx.beginPath(); ctx.arc(c.x + Math.cos(a) * r * 0.56, c.y + Math.sin(a) * r * 0.56, r * 0.03, 0, TAU); ctx.fill(); }
    } else if (skin.pattern === 'celestialveil') {
      for (let i = 0; i < 4; i++) {
        const a = t * (0.45 + i * 0.08) + i;
        const x = c.x + Math.cos(a) * r * (0.18 + i * 0.1);
        const y = c.y + Math.sin(a * 1.2) * r * (0.12 + i * 0.08);
        const veil = ctx.createRadialGradient(x, y, 0, x, y, r * (0.22 + i * 0.05));
        veil.addColorStop(0, rgba(i % 2 ? '#c4b5fd' : '#93c5fd', .28)); veil.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = veil; ctx.beginPath(); ctx.arc(x, y, r * (0.16 + i * 0.03), 0, TAU); ctx.fill();
      }
      ctx.fillStyle = rgba('#ffffff', .84);
      for (let i = 0; i < 14; i++) { const a = t * 0.7 + i * 0.62; const rr = r * (0.12 + (i % 5) * 0.13); ctx.beginPath(); ctx.arc(c.x + Math.cos(a) * rr, c.y + Math.sin(a * 1.4) * rr, r * 0.013, 0, TAU); ctx.fill(); }
    } else if (skin.pattern === 'prismaticorbit') {
      for (let ring = 0; ring < 3; ring++) {
        const hue = (t * 85 + ring * 120) % 360;
        ctx.strokeStyle = `hsla(${hue},100%,72%,0.88)`;
        ctx.lineWidth = Math.max(1.2, r * 0.018 + ring * 0.5);
        ctx.beginPath();
        ctx.arc(c.x, c.y, r * (0.24 + ring * 0.16), t * (ring % 2 ? -0.9 : 0.9) + ring, t * (ring % 2 ? -0.9 : 0.9) + Math.PI * 1.3);
        ctx.stroke();
      }
      for (let i = 0; i < 6; i++) {
        const a = t * 1.1 + i * (TAU / 6);
        const rr = r * 0.58;
        ctx.fillStyle = i % 2 ? rgba('#f9a8d4', .9) : rgba('#93c5fd', .92);
        ctx.beginPath();
        ctx.moveTo(c.x + Math.cos(a) * rr, c.y + Math.sin(a) * rr - r * 0.04);
        ctx.lineTo(c.x + Math.cos(a + 0.08) * (rr + r * 0.06), c.y + Math.sin(a + 0.08) * (rr + r * 0.06));
        ctx.lineTo(c.x + Math.cos(a) * rr, c.y + Math.sin(a) * rr + r * 0.04);
        ctx.lineTo(c.x + Math.cos(a - 0.08) * (rr + r * 0.06), c.y + Math.sin(a - 0.08) * (rr + r * 0.06));
        ctx.closePath(); ctx.fill();
      }
    } else if (skin.pattern === 'seraphiccore') {
      const halo = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, r * 0.76);
      halo.addColorStop(0, rgba('#fff7ed', .38)); halo.addColorStop(1, 'rgba(253,224,71,0)');
      ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(c.x, c.y, r * 0.76, 0, TAU); ctx.fill();
      for (let i = 0; i < 6; i++) {
        const a = t * 0.38 + i * (TAU / 6);
        ctx.strokeStyle = rgba(i % 2 ? '#fde68a' : '#ffffff', .86);
        ctx.lineWidth = Math.max(1.4, r * 0.022);
        ctx.beginPath();
        ctx.moveTo(c.x + Math.cos(a) * r * 0.2, c.y + Math.sin(a) * r * 0.2);
        ctx.quadraticCurveTo(c.x + Math.cos(a + 0.18) * r * 0.44, c.y + Math.sin(a + 0.18) * r * 0.44, c.x + Math.cos(a) * r * 0.74, c.y + Math.sin(a) * r * 0.74);
        ctx.stroke();
      }
      ctx.strokeStyle = rgba('#fef3c7', .95); ctx.lineWidth = Math.max(1.2, r * 0.02); ctx.beginPath(); ctx.arc(c.x, c.y, r * 0.26, 0, TAU); ctx.stroke();
      ctx.fillStyle = rgba('#fde68a', .9); ctx.beginPath(); ctx.moveTo(c.x, c.y - r * 0.12); ctx.lineTo(c.x + r * 0.06, c.y); ctx.lineTo(c.x, c.y + r * 0.12); ctx.lineTo(c.x - r * 0.06, c.y); ctx.closePath(); ctx.fill();
    } else if (skin.pattern === 'abyssalnova') {
      const hole = ctx.createRadialGradient(c.x, c.y, r * 0.1, c.x, c.y, r * 0.82);
      hole.addColorStop(0, 'rgba(0,0,0,0.95)'); hole.addColorStop(0.35, 'rgba(45,6,92,0.68)'); hole.addColorStop(1, 'rgba(124,58,237,0)');
      ctx.fillStyle = hole; ctx.beginPath(); ctx.arc(c.x, c.y, r * 0.82, 0, TAU); ctx.fill();
      for (let ring = 0; ring < 3; ring++) {
        ctx.strokeStyle = rgba('#c4b5fd', .72 - ring * 0.14); ctx.lineWidth = Math.max(1.3, r * 0.02);
        ctx.beginPath(); ctx.arc(c.x, c.y, r * (0.26 + ring * 0.12), t * (0.55 + ring * 0.15), t * (0.55 + ring * 0.15) + Math.PI * 1.42); ctx.stroke();
      }
      ctx.fillStyle = rgba('#ffffff', .86);
      for (let i = 0; i < 12; i++) {
        const a = t * 1.2 + i * 0.65;
        const rr = r * (0.7 - (i % 5) * 0.1);
        ctx.beginPath(); ctx.arc(c.x + Math.cos(a) * rr, c.y + Math.sin(a * 1.15) * rr, r * 0.014, 0, TAU); ctx.fill();
      }
    } else if (skin.pattern === 'chronoshatter') {
      ctx.strokeStyle = rgba('#e0f2fe', .84); ctx.lineWidth = Math.max(1.4, r * 0.02);
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * TAU + t * 0.18;
        ctx.beginPath(); ctx.moveTo(c.x + Math.cos(a) * r * 0.18, c.y + Math.sin(a) * r * 0.18); ctx.lineTo(c.x + Math.cos(a) * r * 0.66, c.y + Math.sin(a) * r * 0.66); ctx.stroke();
      }
      for (let i = 0; i < 5; i++) {
        const a = t * 0.9 + i * 1.2;
        ctx.fillStyle = i % 2 ? rgba('#67e8f9', .22) : rgba('#a5f3fc', .16);
        ctx.beginPath();
        ctx.moveTo(c.x + Math.cos(a) * r * 0.2, c.y + Math.sin(a) * r * 0.2);
        ctx.lineTo(c.x + Math.cos(a + 0.18) * r * 0.54, c.y + Math.sin(a + 0.18) * r * 0.54);
        ctx.lineTo(c.x + Math.cos(a - 0.1) * r * 0.72, c.y + Math.sin(a - 0.1) * r * 0.72);
        ctx.closePath(); ctx.fill();
      }
      ctx.strokeStyle = rgba('#67e8f9', .7); ctx.beginPath(); ctx.arc(c.x, c.y, r * 0.48, -Math.PI / 2, -Math.PI / 2 + Math.sin(t * 1.2) * 2.4 + 2.1); ctx.stroke();
    } else if (skin.pattern === 'phoenixveil') {
      for (const dir of [-1, 1]) {
        ctx.strokeStyle = rgba(dir < 0 ? '#fb7185' : '#fdba74', .88);
        ctx.lineWidth = Math.max(1.4, r * 0.024);
        ctx.beginPath();
        ctx.moveTo(c.x, c.y - r * 0.06);
        ctx.quadraticCurveTo(c.x + dir * r * 0.2, c.y - r * 0.46, c.x + dir * r * 0.62, c.y - r * 0.08);
        ctx.quadraticCurveTo(c.x + dir * r * 0.42, c.y + r * 0.22, c.x + dir * r * 0.18, c.y + r * 0.38);
        ctx.stroke();
      }
      ctx.fillStyle = rgba('#fff7ed', .9); ctx.beginPath(); ctx.arc(c.x, c.y + r * 0.04, r * 0.13, 0, TAU); ctx.fill();
      for (let i = 0; i < 8; i++) {
        const a = -Math.PI / 2 + i * 0.22 + Math.sin(t * 1.8 + i) * 0.08;
        const x = c.x + Math.cos(a) * r * (0.18 + i * 0.06);
        const y = c.y + Math.sin(a) * r * (0.18 + i * 0.06);
        const g = ctx.createRadialGradient(x, y, 0, x, y, r * 0.12); g.addColorStop(0, rgba('#fb7185', .6)); g.addColorStop(1, 'rgba(251,113,133,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * 0.1, 0, TAU); ctx.fill();
      }
    } else if (skin.pattern === 'crownedeclipse') {
      ctx.fillStyle = rgba('#020617', .55); ctx.beginPath(); ctx.arc(c.x, c.y, r * 0.38, 0, TAU); ctx.fill();
      const corona = ctx.createRadialGradient(c.x, c.y, r * 0.42, c.x, c.y, r * 0.8); corona.addColorStop(0, 'rgba(245,215,110,0)'); corona.addColorStop(1, 'rgba(245,215,110,0.32)'); ctx.fillStyle = corona; ctx.beginPath(); ctx.arc(c.x, c.y, r * 0.8, 0, TAU); ctx.fill();
      ctx.fillStyle = rgba('#fde68a', .92);
      for (let i = 0; i < 5; i++) {
        const a = -Math.PI / 2 + i * 0.36 + Math.sin(t * 0.9) * 0.05;
        ctx.beginPath();
        ctx.moveTo(c.x + Math.cos(a) * r * 0.48, c.y + Math.sin(a) * r * 0.48);
        ctx.lineTo(c.x + Math.cos(a + 0.1) * r * 0.78, c.y + Math.sin(a + 0.1) * r * 0.78);
        ctx.lineTo(c.x + Math.cos(a + 0.22) * r * 0.5, c.y + Math.sin(a + 0.22) * r * 0.5);
        ctx.closePath(); ctx.fill();
      }
      ctx.strokeStyle = rgba('#fde68a', .86); ctx.lineWidth = Math.max(1.5, r * 0.022); ctx.beginPath(); ctx.arc(c.x, c.y, r * 0.58, t * 0.45, t * 0.45 + Math.PI * 1.65); ctx.stroke();
    } else if (skin.pattern === 'nebulareign') {
      for (let layer = 0; layer < 3; layer++) {
        const hue = layer === 0 ? '#60a5fa' : layer === 1 ? '#c084fc' : '#f472b6';
        for (let i = 0; i < 5; i++) {
          const a = t * (0.28 + layer * 0.05) + i * 1.2 + layer;
          const x = c.x + Math.cos(a) * r * (0.2 + i * 0.1);
          const y = c.y + Math.sin(a * 1.15) * r * (0.14 + i * 0.07);
          const cloud = ctx.createRadialGradient(x, y, 0, x, y, r * (0.16 + layer * 0.03));
          cloud.addColorStop(0, rgba(hue, .24)); cloud.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.fillStyle = cloud; ctx.beginPath(); ctx.arc(x, y, r * (0.12 + layer * 0.03), 0, TAU); ctx.fill();
        }
      }
      ctx.strokeStyle = rgba('#e0f2fe', .74); ctx.lineWidth = Math.max(1.2, r * 0.016);
      for (let i = 0; i < 5; i++) {
        const a1 = t * 0.45 + i * 1.1;
        const a2 = a1 + 0.6;
        ctx.beginPath(); ctx.moveTo(c.x + Math.cos(a1) * r * 0.58, c.y + Math.sin(a1) * r * 0.58); ctx.lineTo(c.x + Math.cos(a2) * r * 0.46, c.y + Math.sin(a2) * r * 0.46); ctx.stroke();
      }
      ctx.fillStyle = rgba('#fde68a', .92);
      for (let i = 0; i < 3; i++) {
        const a = -Math.PI / 2 + i * 0.22;
        ctx.beginPath(); ctx.moveTo(c.x + Math.cos(a) * r * 0.66, c.y + Math.sin(a) * r * 0.66); ctx.lineTo(c.x + Math.cos(a + 0.08) * r * 0.8, c.y + Math.sin(a + 0.08) * r * 0.8); ctx.lineTo(c.x + Math.cos(a + 0.16) * r * 0.66, c.y + Math.sin(a + 0.16) * r * 0.66); ctx.closePath(); ctx.fill();
      }
    }
    ctx.restore();
    return;
  }
  if (skin.pattern === 'ring') {
    ctx.strokeStyle = skin.accent;
    ctx.lineWidth = r * 0.1;
    ctx.beginPath();
    ctx.arc(c.x, c.y, r * 0.6, 0, TAU);
    ctx.stroke();
  } else if (skin.pattern === 'dots') {
    ctx.fillStyle = skin.accent;
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * TAU + c.id;
      ctx.beginPath();
      ctx.arc(c.x + Math.cos(a) * r * 0.55, c.y + Math.sin(a) * r * 0.55, r * 0.12, 0, TAU);
      ctx.fill();
    }
  } else if (skin.pattern === 'core') {
    const g = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, r * 0.7);
    g.addColorStop(0, skin.accent);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(c.x, c.y, r * 0.7, 0, TAU);
    ctx.fill();
  } else if (skin.pattern === 'duo') {
    ctx.fillStyle = skin.accent;
    ctx.beginPath();
    ctx.arc(c.x, c.y, r * 0.94, Math.PI * 0.5 + t * 0.5, Math.PI * 1.5 + t * 0.5);
    ctx.fill();
  } else if (skin.pattern === 'flame') {
    clipCellCircle(ctx, c, r);
    ctx.globalAlpha = 0.72;
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * TAU + t * 0.9;
      const rr = r * (0.62 + 0.12 * Math.sin(t * 5 + i) + reactiveLevel * 0.06);
      const x = c.x + Math.cos(a) * rr;
      const y = c.y + Math.sin(a) * rr;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r * 0.34);
      g.addColorStop(0, rgba('#e0f2fe', .75));
      g.addColorStop(1, 'rgba(14,165,233,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r * 0.34, 0, TAU);
      ctx.fill();
    }
  } else if (skin.pattern === 'plasma') {
    clipCellCircle(ctx, c, r);
    ctx.globalAlpha = 0.9;
    ctx.strokeStyle = rgba('#f5d0fe', .9);
    ctx.lineWidth = Math.max(1.5, r * (0.045 + reactiveLevel * 0.015));
    for (let i = 0; i < 4; i++) {
      const a = t * 2 + i * (TAU / 4);
      ctx.beginPath();
      ctx.moveTo(c.x + Math.cos(a) * r * 0.18, c.y + Math.sin(a) * r * 0.18);
      ctx.lineTo(c.x + Math.cos(a + 0.5) * r * 0.72, c.y + Math.sin(a + 0.5) * r * 0.72);
      ctx.lineTo(c.x + Math.cos(a + 1.0) * r * 0.32, c.y + Math.sin(a + 1.0) * r * 0.32);
      ctx.stroke();
    }
  } else if (skin.pattern === 'galaxy') {
    clipCellCircle(ctx, c, r);
    ctx.globalAlpha = 0.85;
    ctx.strokeStyle = rgba('#ddd6fe', .6);
    ctx.lineWidth = Math.max(1.2, r * 0.03);
    for (let arm = 0; arm < 2; arm++) {
      ctx.beginPath();
      for (let i = 0; i <= 26; i++) {
        const u = i / 26;
        const a = t * 0.9 + arm * Math.PI + u * 4.4;
        const rr = r * 0.16 + u * r * 0.58;
        const x = c.x + Math.cos(a) * rr;
        const y = c.y + Math.sin(a) * rr;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.fillStyle = rgba('#ffffff', .88);
    for (let i = 0; i < 7; i++) {
      const a = t * 0.7 + i * 1.7 + c.id;
      const rr = r * (0.22 + (i % 4) * 0.15);
      ctx.beginPath();
      ctx.arc(c.x + Math.cos(a) * rr, c.y + Math.sin(a * 1.2) * rr, r * 0.035, 0, TAU);
      ctx.fill();
    }
  } else if (skin.pattern === 'slime') {
    clipCellCircle(ctx, c, r);
    ctx.globalAlpha = 0.6;
    ctx.fillStyle = rgba('#ecfccb', .92);
    for (let i = 0; i < 5; i++) {
      const a = i * 1.25 + t * 0.9;
      const rr = r * (0.18 + (i % 3) * 0.15 + reactiveLevel * 0.03);
      ctx.beginPath();
      ctx.arc(c.x + Math.cos(a) * rr, c.y + Math.sin(a * 1.2 + t) * rr, r * (0.08 + (i % 2) * 0.03), 0, TAU);
      ctx.fill();
    }
  } else if (skin.pattern === 'ice') {
    clipCellCircle(ctx, c, r);
    ctx.globalAlpha = 0.78;
    ctx.strokeStyle = rgba('#ffffff', .82);
    ctx.lineWidth = Math.max(1.3, r * 0.032);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * TAU + t * 0.25;
      ctx.beginPath();
      ctx.moveTo(c.x + Math.cos(a) * r * 0.18, c.y + Math.sin(a) * r * 0.18);
      ctx.lineTo(c.x + Math.cos(a) * r * 0.7, c.y + Math.sin(a) * r * 0.7);
      ctx.stroke();
    }
    const shineX = c.x + Math.sin(t * 1.6 + c.id) * r * (0.48 + reactiveLevel * 0.12);
    const shine = ctx.createLinearGradient(shineX - r * 0.2, c.y - r, shineX + r * 0.2, c.y + r);
    shine.addColorStop(0, 'rgba(255,255,255,0)');
    shine.addColorStop(0.5, 'rgba(255,255,255,0.4)');
    shine.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = shine;
    ctx.fillRect(c.x - r, c.y - r, r * 2, r * 2);
  } else if (skin.pattern === 'lava') {
    clipCellCircle(ctx, c, r);
    ctx.globalAlpha = 0.92;
    ctx.strokeStyle = rgba('#fdba74', .88);
    ctx.lineWidth = Math.max(1.8, r * 0.042);
    for (let i = 0; i < 4; i++) {
      const a = t * 0.8 + i * (TAU / 4);
      ctx.beginPath();
      ctx.moveTo(c.x + Math.cos(a) * r * 0.12, c.y + Math.sin(a) * r * 0.12);
      ctx.lineTo(c.x + Math.cos(a + 0.25) * r * 0.35, c.y + Math.sin(a + 0.25) * r * 0.35);
      ctx.lineTo(c.x + Math.cos(a + 0.1) * r * 0.72, c.y + Math.sin(a + 0.1) * r * 0.72);
      ctx.stroke();
    }
  } else if (skin.pattern === 'grid') {
    clipCellCircle(ctx, c, r);
    ctx.globalAlpha = 0.62;
    ctx.strokeStyle = rgba('#67e8f9', .7);
    ctx.lineWidth = Math.max(1, r * 0.022);
    const step = r * 0.28;
    const xPhase = (t * 1.5 + c.id * 0.071) % 1;
    const yPhase = (t * 0.68 + c.id * 0.113) % 1;
    const xShift = xPhase * step - step;
    const yShift = yPhase * step - step;
    for (let dx = -r - step; dx <= r + step; dx += step) {
      ctx.beginPath();
      ctx.moveTo(c.x + dx + xShift, c.y - r - step);
      ctx.lineTo(c.x + dx + xShift, c.y + r + step);
      ctx.stroke();
    }
    for (let dy = -r - step; dy <= r + step; dy += step) {
      ctx.beginPath();
      ctx.moveTo(c.x - r - step, c.y + dy + yShift);
      ctx.lineTo(c.x + r + step, c.y + dy + yShift);
      ctx.stroke();
    }
  } else if (skin.pattern === 'shadoweye') {
    clipCellCircle(ctx, c, r);
    ctx.globalAlpha = 0.88;
    for (let i = 0; i < 4; i++) {
      const rr = r * (0.42 + i * 0.13);
      ctx.strokeStyle = rgba('#27272a', 0.22 - i * 0.03);
      ctx.lineWidth = r * 0.09;
      ctx.beginPath();
      ctx.arc(c.x + Math.sin(t * 0.8 + i) * r * 0.05, c.y + Math.cos(t * 0.6 + i) * r * 0.05, rr, 0, TAU);
      ctx.stroke();
    }
    const blink = 0.35 + Math.abs(Math.sin(t * 2.8 + c.id)) * 0.65;
    ctx.fillStyle = rgba('#ef4444', 0.9);
    ctx.beginPath();
    ctx.ellipse(c.x - r * 0.2, c.y - r * 0.06, r * 0.12, r * 0.08 * blink, 0, 0, TAU);
    ctx.ellipse(c.x + r * 0.2, c.y - r * 0.06, r * 0.12, r * 0.08 * blink, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = rgba('#ffffff', 0.75);
    ctx.beginPath();
    ctx.arc(c.x - r * 0.2, c.y - r * 0.07, r * 0.03, 0, TAU);
    ctx.arc(c.x + r * 0.2, c.y - r * 0.07, r * 0.03, 0, TAU);
    ctx.fill();
  } else if (skin.pattern === 'void') {
    clipCellCircle(ctx, c, r);
    ctx.globalAlpha = 0.92;
    ctx.strokeStyle = rgba('#c084fc', 0.74 + reactiveLevel * 0.16);
    ctx.lineWidth = Math.max(2, r * 0.05);
    for (let ring = 0; ring < 2; ring++) {
      ctx.beginPath();
      ctx.arc(c.x, c.y, r * (0.58 + ring * 0.13), t * (0.7 + ring * 0.18), t * (0.7 + ring * 0.18) + Math.PI * 1.15);
      ctx.stroke();
    }
    ctx.fillStyle = rgba('#f5d0fe', .88);
    for (let i = 0; i < 10; i++) {
      const u = i / 10;
      const a = t * 1.5 + i * 0.9;
      const rr = r * (0.15 + (1 - u) * 0.55);
      ctx.beginPath();
      ctx.arc(c.x + Math.cos(a + i) * rr, c.y + Math.sin(a * 1.1 + i) * rr, r * (0.014 + (i % 3) * 0.006), 0, TAU);
      ctx.fill();
    }
  } else if (skin.pattern === 'thunder') {
    clipCellCircle(ctx, c, r);
    ctx.globalAlpha = 0.9;
    for (let i = 0; i < 3; i++) {
      ctx.strokeStyle = i % 2 ? rgba('#67e8f9', .95) : rgba('#ffffff', .68);
      ctx.lineWidth = Math.max(1.4, r * (0.028 + i * 0.006));
      ctx.beginPath();
      let px = c.x - r * 0.35 + Math.sin(t * 2.8 + i) * r * 0.12;
      let py = c.y - r * (0.48 - i * 0.12);
      ctx.moveTo(px, py);
      for (let seg = 1; seg <= 5; seg++) {
        const nx = c.x - r * 0.25 + seg * r * 0.12 + Math.sin(t * 5.2 + seg * 1.7 + i) * r * 0.16;
        const ny = c.y - r * 0.4 + seg * r * 0.18 + Math.cos(t * 4.4 + seg * 1.3 + i) * r * 0.1;
        ctx.lineTo(nx, ny);
      }
      ctx.stroke();
    }
  } else if (skin.pattern === 'solar') {
    clipCellCircle(ctx, c, r);
    ctx.globalAlpha = 0.88;
    const corePulse = 0.54 + Math.sin(t * 2.8 + c.id) * 0.06 + reactiveLevel * 0.05;
    const glow = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, r * corePulse);
    glow.addColorStop(0, rgba('#fff7ed', .78));
    glow.addColorStop(1, 'rgba(255,237,213,0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(c.x, c.y, r * corePulse, 0, TAU);
    ctx.fill();
    for (let i = 0; i < 8; i++) {
      const a = t * 1.4 + i * (TAU / 8);
      const rr = r * 0.84;
      const x = c.x + Math.cos(a) * rr;
      const y = c.y + Math.sin(a) * rr;
      const flare = ctx.createRadialGradient(x, y, 0, x, y, r * 0.2);
      flare.addColorStop(0, rgba('#fde68a', .72));
      flare.addColorStop(1, 'rgba(251,146,60,0)');
      ctx.fillStyle = flare;
      ctx.beginPath();
      ctx.arc(x, y, r * (0.12 + 0.02 * Math.sin(t * 3 + i)), 0, TAU);
      ctx.fill();
    }
  } else if (skin.pattern === 'sakura') {
    clipCellCircle(ctx, c, r);
    ctx.globalAlpha = 0.92;
    const driftX = -(c.mx + c.vx) * 0.06;
    const driftY = -(c.my + c.vy) * 0.06;
    for (let i = 0; i < 7; i++) {
      const a = t * 0.9 + i * 0.8;
      const rr = r * (0.18 + (i % 4) * 0.12);
      const x = c.x + Math.cos(a + i * 0.4) * rr + driftX * (0.35 + i * 0.08);
      const y = c.y + Math.sin(a * 1.2 + i) * rr + driftY * (0.35 + i * 0.08);
      drawPetal(ctx, x, y, r * (0.12 + (i % 2) * 0.03), a, i % 2 ? '#f9a8d4' : '#fdf2f8', 0.78);
    }
  } else if (skin.pattern === 'glitch') {
    clipCellCircle(ctx, c, r);
    ctx.globalAlpha = 0.88;
    for (let i = 0; i < 6; i++) {
      const y = c.y - r * 0.76 + i * r * 0.28 + Math.sin(t * 6 + i) * r * 0.04;
      const shift = Math.sin(t * 8 + i * 3.2) * r * 0.1;
      ctx.fillStyle = i % 2 ? rgba('#22d3ee', .18) : rgba('#f472b6', .17);
      ctx.fillRect(c.x - r * 0.7 + shift, y, r * 1.4, r * 0.07);
    }
    ctx.strokeStyle = rgba('#22d3ee', .7);
    ctx.lineWidth = Math.max(1.2, r * 0.018);
    for (let i = 0; i < 4; i++) {
      const sx = c.x - r * 0.48 + Math.sin(t * 7 + i) * r * 0.18;
      const sy = c.y - r * 0.4 + i * r * 0.28;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx + r * 0.36, sy);
      ctx.stroke();
    }
  } else if (skin.pattern === 'chrome') {
    clipCellCircle(ctx, c, r);
    ctx.globalAlpha = 0.9;
    for (let i = 0; i < 3; i++) {
      const sweepX = c.x - r + ((t * (0.45 + i * 0.18) + i * 0.27) % 1) * r * 2;
      const shine = ctx.createLinearGradient(sweepX - r * 0.16, c.y - r, sweepX + r * 0.16, c.y + r);
      shine.addColorStop(0, 'rgba(255,255,255,0)');
      shine.addColorStop(0.5, i === 1 ? 'rgba(255,255,255,0.55)' : 'rgba(191,219,254,0.34)');
      shine.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = shine;
      ctx.fillRect(c.x - r, c.y - r, r * 2, r * 2);
    }
  } else if (skin.pattern === 'frostfire') {
    clipCellCircle(ctx, c, r);
    ctx.globalAlpha = 0.8;
    for (let i = 0; i < 6; i++) {
      const a = t * 1.1 + i * (TAU / 6);
      const coldX = c.x + Math.cos(a) * r * 0.52;
      const coldY = c.y + Math.sin(a) * r * 0.52;
      const hotX = c.x + Math.cos(a + Math.PI) * r * 0.52;
      const hotY = c.y + Math.sin(a + Math.PI) * r * 0.52;
      let g = ctx.createRadialGradient(coldX, coldY, 0, coldX, coldY, r * 0.18);
      g.addColorStop(0, rgba('#dbeafe', .48));
      g.addColorStop(1, 'rgba(56,189,248,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(coldX, coldY, r * 0.16, 0, TAU); ctx.fill();
      g = ctx.createRadialGradient(hotX, hotY, 0, hotX, hotY, r * 0.18);
      g.addColorStop(0, rgba('#fed7aa', .48));
      g.addColorStop(1, 'rgba(249,115,22,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(hotX, hotY, r * 0.16, 0, TAU); ctx.fill();
    }
  } else if (skin.pattern === 'mist') {
    clipCellCircle(ctx, c, r);
    ctx.globalAlpha = 0.74;
    for (let i = 0; i < 6; i++) {
      const a = t * 0.6 + i * 1.08;
      const x = c.x + Math.cos(a) * r * (0.26 + (i % 3) * 0.15);
      const y = c.y + Math.sin(a * 1.2) * r * (0.24 + (i % 2) * 0.16);
      const cloud = ctx.createRadialGradient(x, y, 0, x, y, r * 0.28);
      cloud.addColorStop(0, rgba('#a7f3d0', .28 + reactiveLevel * 0.12));
      cloud.addColorStop(1, 'rgba(16,185,129,0)');
      ctx.fillStyle = cloud;
      ctx.beginPath();
      ctx.arc(x, y, r * (0.16 + (i % 2) * 0.05), 0, TAU);
      ctx.fill();
    }
  } else if (skin.pattern === 'rift') {
    clipCellCircle(ctx, c, r);
    ctx.globalAlpha = 0.92;
    ctx.strokeStyle = rgba('#e9d5ff', .85);
    ctx.lineWidth = Math.max(1.8, r * 0.034);
    ctx.beginPath();
    for (let i = 0; i <= 6; i++) {
      const u = i / 6;
      const x = c.x - r * 0.55 + u * r * 1.1 + Math.sin(t * 1.8 + i * 1.4) * r * 0.08;
      const y = c.y - r * 0.32 + u * r * 0.64 + Math.cos(t * 2.1 + i) * r * 0.12;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.fillStyle = rgba('#ffffff', .72);
    for (let i = 0; i < 6; i++) {
      const a = t * 0.8 + i * 1.9;
      const rr = r * (0.2 + (i % 3) * 0.18);
      ctx.beginPath();
      ctx.arc(c.x + Math.cos(a) * rr, c.y + Math.sin(a * 1.3) * rr, r * 0.02, 0, TAU);
      ctx.fill();
    }
  } else if (skin.pattern === 'reactor') {
    clipCellCircle(ctx, c, r);
    ctx.globalAlpha = 0.92;
    for (let ring = 0; ring < 3; ring++) {
      ctx.strokeStyle = ring === 1 ? rgba('#e0f2fe', .8) : rgba('#38bdf8', .7 - ring * 0.12);
      ctx.lineWidth = Math.max(1.2, r * (0.022 + ring * 0.004));
      ctx.beginPath();
      ctx.arc(c.x, c.y, r * (0.28 + ring * 0.16), t * (ring % 2 ? -0.8 : 0.8) + ring, t * (ring % 2 ? -0.8 : 0.8) + ring + Math.PI * 1.55);
      ctx.stroke();
    }
    ctx.strokeStyle = rgba('#7dd3fc', .8);
    ctx.lineWidth = Math.max(1.3, r * 0.02);
    for (let i = 0; i < 3; i++) {
      const a = t * 1.7 + i * (TAU / 3);
      ctx.beginPath();
      ctx.moveTo(c.x + Math.cos(a) * r * 0.28, c.y + Math.sin(a) * r * 0.28);
      ctx.lineTo(c.x + Math.cos(a + 0.34) * r * 0.58, c.y + Math.sin(a + 0.34) * r * 0.58);
      ctx.stroke();
    }
  } else if (skin.pattern === 'bloodmoon') {
    clipCellCircle(ctx, c, r);
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = rgba('#fecaca', .12);
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.arc(c.x + Math.sin(i * 2.2 + c.id) * r * 0.38, c.y + Math.cos(i * 1.3 + c.id) * r * 0.34, r * (0.08 + (i % 2) * 0.03), 0, TAU);
      ctx.fill();
    }
    ctx.fillStyle = rgba('#020617', .34);
    ctx.beginPath();
    ctx.arc(c.x + Math.sin(t * 0.45) * r * 0.24, c.y - r * 0.08, r * 0.46, 0, TAU);
    ctx.fill();
    const mist = ctx.createRadialGradient(c.x, c.y, r * 0.55, c.x, c.y, r);
    mist.addColorStop(0, 'rgba(239,68,68,0)');
    mist.addColorStop(1, rgba('#ef4444', .18 + reactiveLevel * 0.06));
    ctx.fillStyle = mist;
    ctx.beginPath();
    ctx.arc(c.x, c.y, r, 0, TAU);
    ctx.fill();
  } else if (skin.pattern === 'dragon') {
    clipCellCircle(ctx, c, r);
    ctx.globalAlpha = 0.86;
    ctx.strokeStyle = rgba('#86efac', .34);
    ctx.lineWidth = Math.max(1, r * 0.018);
    for (let row = -2; row <= 2; row++) {
      for (let col = -2; col <= 2; col++) {
        const x = c.x + col * r * 0.23 + (Math.abs(row) % 2 ? r * 0.11 : 0);
        const y = c.y + row * r * 0.18;
        ctx.beginPath();
        ctx.arc(x, y, r * 0.1, Math.PI, 0, false);
        ctx.stroke();
      }
    }
    const blink = Math.max(0, Math.sin(t * 1.9 + c.id * 0.7));
    if (blink > 0.55) {
      ctx.fillStyle = rgba('#fde047', .95);
      ctx.beginPath();
      ctx.ellipse(c.x - r * 0.18, c.y - r * 0.1, r * 0.08, r * 0.05, -0.3, 0, TAU);
      ctx.ellipse(c.x + r * 0.18, c.y - r * 0.1, r * 0.08, r * 0.05, 0.3, 0, TAU);
      ctx.fill();
    }
    ctx.strokeStyle = rgba('#fde047', .65);
    ctx.lineWidth = Math.max(1.2, r * 0.024);
    ctx.beginPath();
    ctx.arc(c.x, c.y, r * 0.82, t * 0.8, t * 0.8 + Math.PI * 0.95);
    ctx.stroke();
  } else if (skin.pattern === 'rainbow') {
    // No extra inner pulse ring; keep the rainbow fill clean.
  } else if (skin.pattern === 'crown') {
    clipCellCircle(ctx, c, r);
    const sweepProgress = (t * (0.72 + reactiveLevel * 0.3) + c.id * 0.071) % 1;
    const sweepX = c.x - r + sweepProgress * r * 2;
    const shine = ctx.createLinearGradient(sweepX - r * 0.18, c.y - r, sweepX + r * 0.18, c.y + r);
    shine.addColorStop(0, 'rgba(255,255,255,0)');
    shine.addColorStop(0.5, 'rgba(255,255,255,0.45)');
    shine.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = shine;
    ctx.fillRect(c.x - r, c.y - r, r * 2, r * 2);
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = rgba('#fff7ae', .95);
    ctx.beginPath();
    ctx.moveTo(c.x - r * 0.34, c.y - r * 0.1);
    ctx.lineTo(c.x - r * 0.2, c.y - r * 0.42);
    ctx.lineTo(c.x, c.y - r * 0.15);
    ctx.lineTo(c.x + r * 0.2, c.y - r * 0.42);
    ctx.lineTo(c.x + r * 0.34, c.y - r * 0.1);
    ctx.lineTo(c.x + r * 0.34, c.y + r * 0.08);
    ctx.lineTo(c.x - r * 0.34, c.y + r * 0.08);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}