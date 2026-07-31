// Top-level scene renderer: grid, pellets, ejected mass, viruses, cells, effects.
import { TAU, rgba, clamp } from '../utils';
import {
  WORLD_SIZE, FIXED_RENDER_WIDTH, FIXED_RENDER_HEIGHT,
  MAX_RENDERED_BOT_CELLS, MAX_RENDERED_VIRUSES, radiusFromMass,
} from '../constants';
import { getSkin } from '../skins';
import { drawCell } from './cell';

function easeSpawnOutBack(value) {
  const x = Math.max(0, Math.min(1, value));
  const c1 = 1.45;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
}

function drawSpawnArrivalAura(ctx, player, cell, radius, time, progress) {
  const skin = getSkin(player.skin);
  const introStrength = Math.max(0, 1 - progress);
  const pulse = 0.5 + 0.5 * Math.sin(time * 8.5);
  const mint = '#4ade80';
  const accent = skin?.accent || '#7dd3fc';

  ctx.save();

  const glowRadius = radius * (1.18 + introStrength * 0.42 + pulse * 0.035);
  const glow = ctx.createRadialGradient(
    cell.x, cell.y, radius * 0.72,
    cell.x, cell.y, glowRadius
  );
  glow.addColorStop(0, 'rgba(74,222,128,0)');
  glow.addColorStop(0.46, `rgba(74,222,128,${0.13 + introStrength * 0.12})`);
  glow.addColorStop(0.72, `rgba(74,222,128,${0.32 + introStrength * 0.32})`);
  glow.addColorStop(1, 'rgba(74,222,128,0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(cell.x, cell.y, glowRadius, 0, TAU);
  ctx.fill();

  ctx.globalCompositeOperation = 'screen';
  for (let ring = 0; ring < 3; ring++) {
    const local = (progress * 1.45 + ring / 3) % 1;
    const ringRadius = radius * (1.05 + local * 0.62);
    ctx.globalAlpha = (1 - local) * (0.62 + introStrength * 0.28);
    ctx.strokeStyle = ring === 1 ? accent : mint;
    ctx.shadowColor = ring === 1 ? accent : mint;
    ctx.shadowBlur = Math.max(10, radius * 0.15);
    ctx.lineWidth = Math.max(2, radius * (0.035 - local * 0.014));
    ctx.beginPath();
    ctx.arc(cell.x, cell.y, ringRadius, 0, TAU);
    ctx.stroke();
  }

  const particles = 18;
  for (let i = 0; i < particles; i++) {
    const phase = (i / particles + time * (0.12 + (i % 3) * 0.018)) % 1;
    const angle = i * 2.399963 + time * (i % 2 ? 0.42 : -0.35);
    const particleRadius = radius * (1.02 + phase * 0.48);
    const px = cell.x + Math.cos(angle) * particleRadius;
    const py = cell.y + Math.sin(angle) * particleRadius;
    const size = Math.max(1.2, radius * (0.022 + (1 - phase) * 0.016));
    ctx.globalAlpha = (1 - phase) * (0.48 + introStrength * 0.3);
    ctx.fillStyle = i % 4 === 0 ? '#dcfce7' : mint;
    ctx.shadowColor = mint;
    ctx.shadowBlur = Math.max(6, radius * 0.08);
    ctx.beginPath();
    ctx.arc(px, py, size, 0, TAU);
    ctx.fill();
  }

  ctx.restore();
}

function drawPlayerWithSpawnIntro(ctx, world, player, cell, time, opts, viewportHeight, cameraScale) {
  const elapsed = Math.max(0, Number(player.spawnElapsed || 0));
  const delay = 0.08;
  const duration = 1.02;
  const raw = Math.max(0, Math.min(1, (elapsed - delay) / duration));
  const eased = easeSpawnOutBack(raw);
  const radius = radiusFromMass(cell.mass);
  const floorY = cell.y + radius * 0.96;

  // A soft contact shadow and expanding map-surface ripple sell the idea that
  // the cell is pushing up through the arena rather than flying in from below.
  ctx.save();
  const contactFade = Math.max(0, 1 - raw);
  const shadowWidth = radius * (0.48 + raw * 0.76);
  const shadowHeight = radius * (0.055 + raw * 0.055);
  const contactGlow = ctx.createRadialGradient(
    cell.x, floorY, 0,
    cell.x, floorY, Math.max(radius * 0.12, shadowWidth)
  );
  contactGlow.addColorStop(0, `rgba(220,252,231,${0.42 * contactFade})`);
  contactGlow.addColorStop(0.28, `rgba(74,222,128,${0.34 * contactFade})`);
  contactGlow.addColorStop(1, 'rgba(74,222,128,0)');
  ctx.fillStyle = contactGlow;
  ctx.beginPath();
  ctx.ellipse(cell.x, floorY, shadowWidth, shadowHeight, 0, 0, TAU);
  ctx.fill();

  for (let ring = 0; ring < 3; ring++) {
    const phase = Math.max(0, Math.min(1, raw * 1.18 - ring * 0.13));
    const alpha = Math.max(0, 1 - phase) * (0.5 - ring * 0.09);
    if (alpha <= 0.001) continue;
    ctx.strokeStyle = ring === 1 ? `rgba(125,211,252,${alpha})` : `rgba(74,222,128,${alpha})`;
    ctx.lineWidth = Math.max(1.5, radius * (0.024 - ring * 0.003));
    ctx.shadowColor = ring === 1 ? '#7dd3fc' : '#4ade80';
    ctx.shadowBlur = Math.max(6, radius * 0.08);
    ctx.beginPath();
    ctx.ellipse(
      cell.x,
      floorY,
      radius * (0.38 + phase * 1.08 + ring * 0.08),
      radius * (0.055 + phase * 0.12),
      0,
      0,
      TAU
    );
    ctx.stroke();
  }
  ctx.restore();

  // Keep the bottom of the cell planted on the map. At the start it is almost
  // flat; it then grows upward and slightly overshoots before settling.
  const scaleY = Math.max(0.055, 0.055 + eased * 0.945);
  const scaleX = Math.max(0.58, 0.64 + eased * 0.36);
  const settleLift = Math.sin(Math.min(1, raw) * Math.PI) * radius * 0.025;

  ctx.save();
  ctx.translate(cell.x, floorY - settleLift);
  ctx.scale(scaleX, scaleY);
  ctx.translate(-cell.x, -floorY);

  drawSpawnArrivalAura(ctx, player, cell, radius, time, raw);
  drawCell(ctx, player, cell, time, opts);

  // Cell-only flash: clipped to the cell body, never the whole screen.
  const flashAlpha = Math.max(0, 1 - raw * 1.7);
  if (flashAlpha > 0.001) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(cell.x, cell.y, radius * 0.98, 0, TAU);
    ctx.clip();
    const flash = ctx.createRadialGradient(
      cell.x - radius * 0.2,
      cell.y - radius * 0.28,
      radius * 0.04,
      cell.x,
      cell.y,
      radius * 1.02
    );
    flash.addColorStop(0, `rgba(255,255,255,${0.84 * flashAlpha})`);
    flash.addColorStop(0.42, `rgba(220,252,231,${0.45 * flashAlpha})`);
    flash.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = flash;
    ctx.fillRect(cell.x - radius, cell.y - radius, radius * 2, radius * 2);
    ctx.restore();
  }

  ctx.restore();
}

export function render(ctx, w, h, world, cam, opts) {
  ctx.fillStyle = '#0b0f1e';
  ctx.fillRect(0, 0, w, h);
  ctx.save();
  ctx.translate(w / 2, h / 2);
  ctx.scale(cam.scale, cam.scale);
  ctx.translate(-cam.x, -cam.y);
  const view = {
    l: cam.x - w / 2 / cam.scale,
    r: cam.x + w / 2 / cam.scale,
    t: cam.y - h / 2 / cam.scale,
    b: cam.y + h / 2 / cam.scale,
  };
  // Fixed 1280x720 screen-space render budget. Convert it to world units
  // using the dynamic mass/formation scale before manual zoom is applied.
  const cullScale = Math.max(0.035, Math.min(1.2, Number(cam.renderScale || cam.scale || 0.2)));
  const renderHalfW = (FIXED_RENDER_WIDTH * 0.5) / cullScale;
  const renderHalfH = (FIXED_RENDER_HEIGHT * 0.5) / cullScale;
  const renderView = {
    l: cam.x - renderHalfW,
    r: cam.x + renderHalfW,
    t: cam.y - renderHalfH,
    b: cam.y + renderHalfH,
  };
  const renderOpts = { ...opts, screenScale: cam.scale };

  drawGrid(ctx, view, cam.scale);
  ctx.strokeStyle = 'rgba(255,80,120,0.45)';
  ctx.lineWidth = 8 / cam.scale;
  ctx.strokeRect(0, 0, WORLD_SIZE, WORLD_SIZE);

  drawPelletField(ctx, world.pellets, renderView, renderOpts, world.time);
  drawEjectedField(ctx, world.ejected, renderView, renderOpts, world.time);

  const visibleViruses = [];
  for (const v of world.viruses) {
    const vr = radiusFromMass(v.mass);
    if (!circleInView(v.x, v.y, vr, renderView, 1.05)) continue;
    visibleViruses.push([v, Math.hypot(v.x - cam.x, v.y - cam.y)]);
  }
  visibleViruses.sort((a,b) => a[1] - b[1]);
  for (const [v] of visibleViruses.slice(0, MAX_RENDERED_VIRUSES)) drawVirus(ctx, v, world.time);

  const playerCells = [];
  const botCells = [];
  for (const p of world.players) {
    if (p.modInvisible) continue;
    for (const c of p.cells) {
      const r = radiusFromMass(c.mass);
      if (!circleInView(c.x, c.y, r, renderView, 1.05)) continue;
      const entry = [p, c, Math.hypot(c.x - cam.x, c.y - cam.y)];
      if (p === world.player) playerCells.push(entry);
      else botCells.push(entry);
    }
  }
  botCells.sort((a,b) => a[2] - b[2]);
  const visibleCells = [...playerCells, ...botCells.slice(0, MAX_RENDERED_BOT_CELLS)].map(([p,c]) => [p,c]);
  visibleCells.sort((a, b) => a[1].mass - b[1].mass);

  const showBotTrails = opts.quality === 'high' && opts.detail > 0.78 && cam.scale > 0.14;
  const playerSpawnIntro = Math.max(0, Number(world.player?.spawnElapsed || 0)) < 1.3;
  if (renderOpts.showGlows !== false) {
    for (const [p, c] of visibleCells) {
      if (p === world.player && playerSpawnIntro) continue;
      if (p === world.player || showBotTrails) drawTrail(ctx, p, c, world.time);
    }
  }

  drawEffects(ctx, world, renderView, opts);
  drawSplitBridges(ctx, visibleCells, world.time);
  for (const [p, c] of visibleCells) {
    if (p === world.player && playerSpawnIntro) {
      drawPlayerWithSpawnIntro(ctx, world, p, c, world.time, renderOpts, h, cam.scale);
    } else {
      drawCell(ctx, p, c, world.time, renderOpts);
    }
  }
  ctx.restore();
}

function drawSplitBridges(ctx, visibleCells, t) {
  const byPlayer = new Map();
  for (const [p, c] of visibleCells) {
    if (!byPlayer.has(p.id)) byPlayer.set(p.id, { player: p, cells: new Map() });
    byPlayer.get(p.id).cells.set(c.id, c);
  }

  for (const { player, cells } of byPlayer.values()) {
    const skin = getSkin(player.skin);
    for (const child of cells.values()) {
      if (!child.splitParentId || child.splitAge >= child.splitDuration) continue;
      const parent = cells.get(child.splitParentId) || player.cells.find((cell) => cell.id === child.splitParentId);
      if (!parent) continue;

      const progress = Math.max(0, Math.min(1, child.splitAge / Math.max(0.001, child.splitDuration)));
      const fade = Math.sin(Math.PI * progress);
      if (fade <= 0.01) continue;
      const childR = Math.max(2, child.drawR || radiusFromMass(child.mass));
      const parentR = Math.max(2, parent.drawR || radiusFromMass(parent.mass));
      const width = Math.min(parentR, childR) * (0.64 - progress * 0.42) * fade;
      if (width <= 1) continue;

      ctx.save();
      ctx.globalAlpha = 0.72 * fade;
      ctx.strokeStyle = skin.base;
      ctx.lineWidth = width;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(parent.x, parent.y);
      ctx.lineTo(child.x, child.y);
      ctx.stroke();

      ctx.globalAlpha = 0.36 * fade;
      ctx.strokeStyle = skin.accent;
      ctx.lineWidth = Math.max(1, width * 0.16);
      ctx.beginPath();
      ctx.moveTo(parent.x, parent.y);
      ctx.lineTo(child.x, child.y);
      ctx.stroke();
      ctx.restore();
    }
  }
}

export function circleInView(x, y, radius, view, marginScale = 1) {
  const margin = radius * marginScale;
  return x >= view.l - margin && x <= view.r + margin && y >= view.t - margin && y <= view.b + margin;
}

function drawPelletField(ctx, pellets, view, opts, t = 0) {
  const budget = Math.max(280, Math.round((opts.quality === 'high' ? 900 : 520) * opts.detail));
  const groups = new Map();
  let drawn = 0;

  for (let i = 0; i < pellets.length && drawn < budget; i++) {
    const f = pellets[i];
    if (!circleInView(f.x, f.y, 20, view, 1)) continue;
    if (!groups.has(f.color)) groups.set(f.color, []);
    groups.get(f.color).push(f);
    drawn += 1;
  }

  for (const [color, items] of groups) {
    ctx.fillStyle = color;
    ctx.beginPath();
    for (const f of items) {
      const r = radiusFromMass(f.mass);
      const age = Math.max(0, t - (f.spawnTime ?? -10));
      const intro = age >= 0.65
        ? 1
        : clamp(1 - Math.exp(-age * 8.5) * Math.cos(age * 20), 0.05, 1.18);
      const spawnBounce = age < 0.9 ? Math.sin(age * 23) * Math.exp(-age * 4.7) * 0.22 : 0;
      const idleJelly = Math.sin(t * (f.jellySpeed || 4) + (f.jellyPhase || 0)) * 0.09 * (f.jellyAmount || 1);
      const squish = clamp(spawnBounce + idleJelly, -0.18, 0.2);
      const rx = Math.max(1, r * intro * (1 + squish));
      const ry = Math.max(1, r * intro * (1 - squish * 0.72));
      const rotation = (f.jellyPhase || 0) * 0.5 + Math.sin(t * 0.65 + (f.jellyPhase || 0)) * 0.24;
      ctx.moveTo(f.x + rx, f.y);
      ctx.ellipse(f.x, f.y, rx, ry, rotation, 0, TAU);
    }
    ctx.fill();
  }
}

function drawEjectedField(ctx, ejected, view, opts, t = 0) {
  const budget = Math.max(260, Math.round((opts.quality === 'high' ? 1050 : 620) * opts.detail));
  const groups = new Map();
  const rainbowItems = [];
  const scanStride = Math.max(1, Math.floor(ejected.length / Math.max(2200, budget * 3)));
  let drawn = 0;

  for (let i = 0; i < ejected.length && drawn < budget; i += scanStride) {
    const e = ejected[i];
    const r = radiusFromMass(e.mass) * 0.9;
    if (!circleInView(e.x, e.y, r, view, 1.15)) continue;
    const skin = getSkin(e.skinId);
    if (skin.pattern === 'rainbow') {
      rainbowItems.push([e, r]);
    } else {
      const color = e.color || skin.base;
      if (!groups.has(color)) groups.set(color, []);
      groups.get(color).push([e, r]);
    }
    drawn += 1;
  }

  for (const [color, items] of groups) {
    ctx.fillStyle = color;
    ctx.beginPath();
    for (const [e, r] of items) {
      ctx.moveTo(e.x + r, e.y);
      ctx.arc(e.x, e.y, r, 0, TAU);
    }
    ctx.fill();
  }

  // Rainbow Aurora packets keep the full multi-colour appearance rather than
  // collapsing to a single border hue.
  for (const [e, r] of rainbowItems) {
    const h = (t * 80 + e.id * 29) % 360;
    const g = ctx.createLinearGradient(e.x - r, e.y - r, e.x + r, e.y + r);
    g.addColorStop(0, `hsl(${h}, 96%, 62%)`);
    g.addColorStop(0.34, `hsl(${(h + 100) % 360}, 96%, 61%)`);
    g.addColorStop(0.67, `hsl(${(h + 205) % 360}, 94%, 59%)`);
    g.addColorStop(1, `hsl(${(h + 300) % 360}, 96%, 63%)`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(e.x, e.y, r, 0, TAU);
    ctx.fill();
  }
}

function drawEffects(ctx, world, view, opts) {
  const budget = Math.max(100, Math.round(360 * opts.detail));
  let drawn = 0;
  for (const fx of world.effects) {
    for (const p of fx.particles) {
      if (drawn >= budget) return;
      if (p.x < view.l - 60 || p.x > view.r + 60 || p.y < view.t - 60 || p.y > view.b + 60) continue;
      const alpha = Math.max(0, p.life / p.maxLife);
      ctx.fillStyle = p.color.startsWith('#') ? rgba(p.color, alpha * 0.9) : p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * (0.55 + alpha * 0.7), 0, TAU);
      ctx.fill();
      drawn += 1;
    }
  }
}

function drawTrail(ctx, p, c, t) {
  const skin = getSkin(p.skin);
  if (!c.trail || c.trail.length < 2) return;
  const baseAlpha = skin.animated ? 0.12 : 0.07;
  const reactiveBoost = skin.reactive ? Math.min(1, (Math.hypot(c.mx + c.vx, c.my + c.vy) / 340) + (c.mass / 280)) : 0;
  for (let i = 0; i < c.trail.length; i++) {
    const node = c.trail[i];
    const age = (i + 1) / c.trail.length;
    const r = radiusFromMass(c.mass) * (0.28 + age * 0.34);
    const alpha = baseAlpha * age * (1 + reactiveBoost * 0.8);
    ctx.fillStyle = p.modRainbowTrail ? `hsla(${(t * 180 + i * 38) % 360},95%,65%,${Math.min(.42, alpha * 2.5)})` : rgba(skin.accent, alpha);
    ctx.beginPath();
    ctx.arc(node.x, node.y, r, 0, TAU);
    ctx.fill();
  }
}

function drawGrid(ctx, view, scale) {
  let g = 120;
  while (g * scale < 44) g *= 2;
  ctx.strokeStyle = 'rgba(255,255,255,0.045)';
  ctx.lineWidth = 1 / scale;
  ctx.beginPath();
  for (let x = Math.floor(view.l / g) * g; x <= view.r; x += g) {
    ctx.moveTo(x, view.t);
    ctx.lineTo(x, view.b);
  }
  for (let y = Math.floor(view.t / g) * g; y <= view.b; y += g) {
    ctx.moveTo(view.l, y);
    ctx.lineTo(view.r, y);
  }
  ctx.stroke();
}

export function drawVirus(ctx, v, t) {
  const r = radiusFromMass(v.mass);
  const spikes = 20;
  ctx.beginPath();
  for (let i = 0; i <= spikes * 2; i++) {
    const a = (i / (spikes * 2)) * TAU;
    const rr = i % 2 ? r * 0.84 : r * (1 + 0.03 * Math.sin(t * 4 + i));
    const x = v.x + Math.cos(a) * rr;
    const y = v.y + Math.sin(a) * rr;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = '#59c94f';
  ctx.fill();
  ctx.lineWidth = 5;
  ctx.strokeStyle = '#3d9c36';
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(v.x, v.y, r * 0.62, 0, TAU);
  ctx.fillStyle = 'rgba(0,0,0,0.12)';
  ctx.fill();
}