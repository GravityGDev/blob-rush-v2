// Drawing a single player cell: body, skin, cosmetics, name, badge, emotes.
import { TAU, rgba } from '../utils';
import { radiusFromMass } from '../constants';
import { getSkin, getSkinStroke, getCustomSkinImage, findBadge, findShopEmoji, findShopEmote } from '../skins';
import { drawCellCosmetics } from './cosmetics';
import { getSkinFill, drawPattern } from './skinArt';
import { playerCentroid } from '../physics';
import { state } from '../state';

function getPlayerNameStyleForBadge(badgeId) {
  if (badgeId === 'youtube') {
    return { fill:'#ef4444', stroke:'rgba(69,10,10,.88)' };
  }
  if (badgeId === 'vip') {
    return { fill:'#facc15', stroke:'rgba(113,63,18,.9)' };
  }
  return { fill:'#fff', stroke:'rgba(0,0,0,0.45)' };
}

function drawPlayerNameBadge(ctx, p, c, fontSize, nameWidth) {
  const badge = findBadge(p?.equippedBadge);
  if (!badge) return;

  const size = fontSize * .82;
  const gap = fontSize * .15;
  const x = c.x - nameWidth * .5 - gap - size * .56;
  const y = c.y;
  const now = performance.now() * 0.001;

  ctx.save();
  ctx.translate(x, y);

  if (badge.id === 'vip') {
    for (let i = 0; i < 7; i++) {
      const phase = (now * (.42 + (i % 3) * .05) + i / 7) % 1;
      const side = i % 2 ? 1 : -1;
      const px = side * size * (.42 + phase * .62);
      const py = size * (.2 - phase * .9) + Math.sin(now * 3 + i) * size * .08;
      const particleSize = Math.max(1.1, size * (.035 + (1 - phase) * .035));
      ctx.globalAlpha = (1 - phase) * .95;
      ctx.fillStyle = i % 3 === 0 ? '#fff7cc' : '#facc15';
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = size * .24;
      ctx.beginPath();
      ctx.arc(px, py, particleSize, 0, TAU);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  ctx.shadowColor = badge.primary;
  ctx.shadowBlur = size * .32;
  const gradient = ctx.createLinearGradient(-size*.5,-size*.55,size*.5,size*.55);
  gradient.addColorStop(0,badge.secondary);
  gradient.addColorStop(1,badge.primary);
  ctx.fillStyle = gradient;
  ctx.strokeStyle = badge.accent;
  ctx.lineWidth = Math.max(1.3,size*.075);

  if (badge.id === 'youtube') {
    const w = size * 1.12;
    const h = size * .74;
    const radius = size * .2;
    ctx.beginPath();
    ctx.roundRect(-w/2,-h/2,w,h,radius);
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.moveTo(-size*.10,-size*.18);
    ctx.lineTo(size*.23,0);
    ctx.lineTo(-size*.10,size*.18);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    return;
  }

  if (badge.id === 'tiktok') {
    ctx.beginPath();
    ctx.arc(0,0,size*.55,0,TAU);
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.font = `1000 ${Math.max(8,size*.62)}px Arial`;
    ctx.textAlign='center';
    ctx.textBaseline='middle';
    ctx.strokeStyle='#22d3ee';
    ctx.lineWidth=Math.max(1,size*.08);
    ctx.strokeText('♪',-size*.035,size*.03);
    ctx.fillStyle='#fff';
    ctx.fillText('♪',0,0);
    ctx.restore();
    return;
  }

  ctx.beginPath();
  ctx.moveTo(0,-size*.55);
  ctx.lineTo(size*.48,-size*.33);
  ctx.lineTo(size*.42,size*.18);
  ctx.quadraticCurveTo(size*.25,size*.49,0,size*.62);
  ctx.quadraticCurveTo(-size*.25,size*.49,-size*.42,size*.18);
  ctx.lineTo(-size*.48,-size*.33);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.shadowBlur = 0;

  if (badge.id === 'admin' || badge.id === 'vip') {
    ctx.fillStyle = badge.id === 'vip' ? '#fff7cc' : '#fde68a';
    ctx.strokeStyle = badge.id === 'vip' ? '#a16207' : '#92400e';
    ctx.lineWidth = Math.max(1,size*.04);
    ctx.beginPath();
    ctx.moveTo(-size*.27,-size*.13);
    ctx.lineTo(-size*.18,-size*.34);
    ctx.lineTo(0,-size*.17);
    ctx.lineTo(size*.18,-size*.34);
    ctx.lineTo(size*.27,-size*.13);
    ctx.lineTo(size*.2,size*.02);
    ctx.lineTo(-size*.2,size*.02);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (badge.id === 'booster') {
    ctx.fillStyle='rgba(255,255,255,.17)';
    ctx.beginPath();
    ctx.arc(0,-size*.03,size*.27,0,TAU);
    ctx.fill();
  }

  ctx.font=`1000 ${Math.max(7,size*.48)}px Arial`;
  ctx.textAlign='center';
  ctx.textBaseline='middle';
  const textY = (badge.id === 'admin' || badge.id === 'vip') ? size*.25 : size*.06;
  ctx.lineWidth=Math.max(1,size*.06);
  ctx.strokeStyle='rgba(0,0,0,.5)';
  ctx.strokeText(badge.short,0,textY);
  ctx.fillStyle='#fff';
  ctx.fillText(badge.short,0,textY);
  ctx.restore();
}

function applyCellSocialEmoteTransform(ctx, p, c, r, t) {
  const state_ = p?.activeEmote;
  if (!state_) return;
  const item = findShopEmote(state_.id);
  const duration = Number(item?.duration || 1.1);
  const elapsed = Math.max(0, t - Number(state_.startedAt || 0));
  if (elapsed >= duration) { p.activeEmote = null; return; }
  const q = Math.max(0, Math.min(1, elapsed / duration));
  const settle = Math.sin(Math.PI * q);
  const phase = ((Number(c.id || 0) % 17) / 17) * TAU;
  let lift = 0, angle = 0, sx = 1, sy = 1, offsetX = 0, offsetY = 0;

  if (state_.id === 'bounce') {
    lift = Math.abs(Math.sin(q * Math.PI * 2)) * r * .34 * (1 - q * .35);
    sx = 1 + settle * .08;
    sy = 1 - settle * .07;
  } else if (state_.id === 'spin') {
    angle = q * TAU * (1 - Math.pow(1 - q, 3) * .08);
    sx = sy = 1 + Math.sin(Math.PI * q) * .05;
  } else if (state_.id === 'pulse') {
    sx = sy = 1 + Math.sin(q * Math.PI * 3) * .12 * (1 - q * .45);
  } else if (state_.id === 'wobble') {
    angle = Math.sin(q * Math.PI * 5) * .16 * (1 - q);
    sx = 1 + Math.sin(q * Math.PI * 4) * .045;
    sy = 1 - Math.sin(q * Math.PI * 4) * .035;
  } else if (state_.id === 'backflip') {
    lift = Math.sin(Math.PI * q) * r * .62;
    angle = q * TAU;
    sx = 1 + settle * .05;
    sy = .86 + Math.abs(Math.cos(q * Math.PI)) * .14;
  } else if (state_.id === 'shake') {
    const fade = 1 - q;
    offsetX = Math.sin(q * TAU * 12 + phase) * r * .14 * fade;
    offsetY = Math.cos(q * TAU * 10 + phase) * r * .075 * fade;
    angle = Math.sin(q * TAU * 9 + phase) * .06 * fade;
  } else if (state_.id === 'squash') {
    const squash = Math.sin(q * Math.PI * 5) * (1 - q * .35);
    sx = 1 + squash * .16;
    sy = 1 - squash * .18;
  } else if (state_.id === 'zoom') {
    const pop = Math.sin(Math.PI * q);
    sx = sy = 1 + pop * .30;
  } else if (state_.id === 'dance') {
    lift = Math.abs(Math.sin(q * TAU * 2)) * r * .25 * (1 - q * .2);
    angle = Math.sin(q * TAU * 4 + phase * .15) * .15 * settle;
    sx = 1 + Math.sin(q * TAU * 4) * .055;
    sy = 1 - Math.sin(q * TAU * 4) * .045;
  } else if (state_.id === 'wave') {
    lift = Math.max(0, Math.sin(q * TAU * 2 + phase)) * r * .34 * settle;
    angle = Math.sin(q * TAU * 2 + phase) * .08 * settle;
  } else if (state_.id === 'orbit') {
    const centre = playerCentroid(p);
    const dx = c.x - centre.x;
    const dy = c.y - centre.y;
    const turn = Math.sin(Math.PI * q) * .92;
    const cos = Math.cos(turn), sin = Math.sin(turn);
    offsetX = dx * cos - dy * sin - dx;
    offsetY = dx * sin + dy * cos - dy;
    angle = turn * .55;
    sx = sy = 1 + settle * .055;
  } else if (state_.id === 'tornado') {
    angle = q * TAU * 2.2;
    lift = Math.sin(Math.PI * q) * r * .28;
    sx = 1 + Math.sin(q * TAU * 4) * .08 * settle;
    sy = 1 - Math.sin(q * TAU * 4) * .06 * settle;
  } else if (state_.id === 'heartbeat') {
    const beat = Math.max(0, Math.sin(q * Math.PI * 6)) * (1 - q * .28);
    sx = sy = 1 + beat * .16;
  } else if (state_.id === 'moonwalk') {
    offsetX = Math.sin(Math.PI * q) * r * .82;
    offsetY = Math.sin(q * TAU * 2 + phase) * r * .035 * settle;
    angle = -Math.sin(Math.PI * q) * .11;
  } else if (state_.id === 'jelly') {
    const jiggle = Math.sin(q * Math.PI * 8 + phase * .22) * (1 - q * .35);
    sx = 1 + jiggle * .12;
    sy = 1 - jiggle * .14;
    angle = Math.sin(q * Math.PI * 6 + phase) * .045 * (1 - q);
  } else if (state_.id === 'drift') {
    offsetX = Math.sin(Math.PI * q) * r * .68;
    offsetY = -Math.sin(Math.PI * q) * r * .10;
    angle = -Math.sin(Math.PI * q) * .20;
    sx = 1 + settle * .06;
  } else if (state_.id === 'victory') {
    lift = Math.sin(Math.PI * q) * r * .68;
    angle = Math.sin(q * TAU * 2) * .10 * settle;
    sx = sy = 1 + settle * .10;
  } else if (state_.id === 'doublebounce') {
    lift = Math.abs(Math.sin(q * Math.PI * 3)) * r * .42 * (1 - q * .25);
    const squash = Math.sin(q * Math.PI * 6) * .07 * (1 - q);
    sx = 1 + squash;
    sy = 1 - squash;
  }

  ctx.translate(offsetX, offsetY);
  ctx.translate(c.x, c.y - lift);
  ctx.rotate(angle);
  ctx.scale(sx, sy);
  ctx.translate(-c.x, -c.y);
}

function drawActiveCellEmoji(ctx, p, c, r, t) {
  const state_ = p?.activeEmoji;
  if (!state_ || t >= Number(state_.until || 0)) return;
  const item = findShopEmoji(state_.id);
  if (!item) return;
  const remaining = Math.max(0, Number(state_.until) - t);
  const enter = Math.min(1, (2.3 - remaining) / .22);
  const exit = Math.min(1, remaining / .25);
  const alpha = Math.min(enter, exit);
  const bob = Math.sin(t * 5.5 + c.id) * r * .025;
  const bubbleR = Math.max(20, r * .25);
  const bx = c.x;
  const by = c.y - r - bubbleR * .9 - bob;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.shadowColor = 'rgba(0,0,0,.42)';
  ctx.shadowBlur = bubbleR * .3;
  ctx.fillStyle = 'rgba(2,6,23,.9)';
  ctx.strokeStyle = 'rgba(255,255,255,.72)';
  ctx.lineWidth = Math.max(2,bubbleR*.065);
  ctx.beginPath(); ctx.arc(bx,by,bubbleR,0,TAU); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(bx-bubbleR*.16,by+bubbleR*.78); ctx.lineTo(bx,by+bubbleR*1.18); ctx.lineTo(bx+bubbleR*.17,by+bubbleR*.78); ctx.closePath(); ctx.fill();
  ctx.shadowBlur = 0;
  ctx.font = `${bubbleR*1.2}px Arial`;
  ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillText(item.icon,bx,by+bubbleR*.05);
  ctx.restore();
}

export function getReactiveLevel(c, skin, t) {
  if (!skin.reactive) return 0;
  const speed = Math.hypot(c.mx + c.vx, c.my + c.vy);
  const speedFactor = Math.min(1, speed / 360);
  const massFactor = Math.min(1, c.mass / 240);
  return Math.max(0.18, Math.min(1, speedFactor * 0.7 + massFactor * 0.45 + (0.15 + 0.15 * Math.sin(t * 3 + c.id))));
}

export function drawCell(ctx, p, c, t, opts = {}) {
  const skin = getSkin(p.skin);
  const animateSkin = opts.animateSkins !== false || !skin.animated;
  const skinTime = animateSkin ? t : 0;
  const reactiveLevel = animateSkin ? getReactiveLevel(c, skin, skinTime) : 0;
  const targetR = radiusFromMass(c.mass);
  const animationDelayMs = Math.max(50, Math.min(500, Number(state.profile?.settings?.animationDelay || 150)));
  const radiusEase = 1 - Math.exp(-16.667 / animationDelayMs);
  c.drawR = c.drawR === undefined ? targetR : c.drawR + (targetR - c.drawR) * radiusEase;
  const r = c.drawR;
  ctx.save();
  applyCellSocialEmoteTransform(ctx, p, c, r, t);
  const high = opts.quality === 'high';
  // More points plus curved joins keep large cells round.
  const points = high ? Math.min(76, Math.max(36, Math.round(r / 14))) : 24;
  const movement = Math.min(1, Math.hypot((c.mx || 0) + (c.vx || 0), (c.my || 0) + (c.vy || 0)) / 420);
  const amp = r * (0.0048 + movement * 0.0042);
  const jellyPoints = [];
  for (let i = 0; i < points; i++) {
    const a = (i / points) * TAU;
    const rr = r
      + Math.sin(a * 7 + t * 3.05 + c.id * 1.7) * amp
      + Math.sin(a * 3 - t * 1.95 + c.id) * amp * 0.52;
    jellyPoints.push({
      x: c.x + Math.cos(a) * rr,
      y: c.y + Math.sin(a) * rr,
    });
  }
  const jellyPath = new Path2D();
  const last = jellyPoints[jellyPoints.length - 1];
  const first = jellyPoints[0];
  jellyPath.moveTo((last.x + first.x) * 0.5, (last.y + first.y) * 0.5);
  for (let i = 0; i < jellyPoints.length; i++) {
    const point = jellyPoints[i];
    const next = jellyPoints[(i + 1) % jellyPoints.length];
    jellyPath.quadraticCurveTo(point.x, point.y, (point.x + next.x) * 0.5, (point.y + next.y) * 0.5);
  }
  jellyPath.closePath();

  if (high && opts.showGlows !== false) {
    ctx.shadowColor = skin.animated ? rgba(skin.accent, 0.35 + reactiveLevel * 0.2) : 'rgba(0,0,0,0.35)';
    ctx.shadowBlur = skin.animated ? r * (0.34 + reactiveLevel * 0.18) : r * 0.2;
  }
  if (opts.showCosmetics !== false) drawCellCosmetics(ctx, p, c, r, skinTime, 'back');
  ctx.fillStyle = getSkinFill(ctx, c, r, skin, skinTime, reactiveLevel);
  ctx.fill(jellyPath);
  if (skin.pattern === 'custom') {
    const customImage = getCustomSkinImage(skin);
    if (customImage?.complete && customImage.naturalWidth > 0) {
      ctx.save();
      ctx.clip(jellyPath);
      const imageScale = 1.025;
      ctx.drawImage(customImage, c.x - r * imageScale, c.y - r * imageScale, r * 2 * imageScale, r * 2 * imageScale);
      ctx.restore();
    }
  }
  ctx.shadowBlur = 0;
  ctx.lineWidth = Math.max(2, r * 0.07);
  ctx.strokeStyle = getSkinStroke(skin, skinTime, reactiveLevel);
  ctx.stroke(jellyPath);
  if (opts.quality === 'high' || !p.isBot || opts.detail > 0.55) {
    drawPattern(ctx, c, r, skin, skinTime, reactiveLevel, opts.showGlows !== false);
  }
  if (opts.showCosmetics !== false) drawCellCosmetics(ctx, p, c, r, skinTime, 'front');

  const screenRadius = r * Math.max(0.04, Number(opts.screenScale || 1));
  if (r > 24 && (!p.isBot || screenRadius > 18)) {
    const fs = Math.max(11, r * 0.34);
    ctx.font = `800 ${fs}px 'Baloo 2', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';
    ctx.lineWidth = fs * 0.14;
    const playerNameStyle = getPlayerNameStyleForBadge(p?.equippedBadge);
    ctx.strokeStyle = playerNameStyle.stroke;
    const playerNameWidth = ctx.measureText(p.name).width;
    drawPlayerNameBadge(ctx, p, c, fs, playerNameWidth);
    ctx.strokeText(p.name, c.x, c.y);
    ctx.fillStyle = playerNameStyle.fill;
    ctx.fillText(p.name, c.x, c.y);
    if (r > 42) {
      const ms = fs * 0.6;
      ctx.font = `700 ${ms}px 'Baloo 2', sans-serif`;
      ctx.lineWidth = ms * 0.14;
      ctx.strokeText(Math.round(c.mass), c.x, c.y + fs * 0.85);
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.fillText(Math.round(c.mass), c.x, c.y + fs * 0.85);
    }
  }

  drawActiveCellEmoji(ctx, p, c, r, t);
  if ((p.spawnProtection || 0) > 0) drawSpawnProtection(ctx, p, c, r, t);
  ctx.restore();
}

function drawSpawnProtection(ctx, p, c, r, t) {
  const remaining = Math.max(0, p.spawnProtection || 0);
  if (remaining <= 0) return;

  const elapsed = Math.max(0, p.spawnElapsed || 0);
  const intro = Math.min(1, elapsed / 1.15);
  const fadeOut = Math.min(1, remaining / 0.65);
  const pulse = 0.5 + 0.5 * Math.sin(t * 6.8 + p.id * 0.37);
  const strength = fadeOut * (0.66 + (1 - intro) * 0.34);

  ctx.save();
  ctx.globalCompositeOperation = 'screen';

  const auraRadius = r * (1.18 + pulse * 0.045);
  const aura = ctx.createRadialGradient(c.x, c.y, r * 0.74, c.x, c.y, auraRadius);
  aura.addColorStop(0, 'rgba(74,222,128,0)');
  aura.addColorStop(0.55, `rgba(74,222,128,${0.10 * strength})`);
  aura.addColorStop(0.78, `rgba(74,222,128,${0.46 * strength})`);
  aura.addColorStop(1, 'rgba(74,222,128,0)');
  ctx.fillStyle = aura;
  ctx.beginPath();
  ctx.arc(c.x, c.y, auraRadius, 0, TAU);
  ctx.fill();

  ctx.globalAlpha = (0.3 + pulse * 0.28) * strength;
  ctx.strokeStyle = '#86efac';
  ctx.shadowColor = '#4ade80';
  ctx.shadowBlur = Math.max(12, r * 0.18);
  ctx.lineWidth = Math.max(2, r * 0.035);
  ctx.beginPath();
  ctx.arc(c.x, c.y, r * (1.06 + pulse * 0.025), 0, TAU);
  ctx.stroke();

  for (let i = 0; i < 10; i++) {
    const angle = i * 0.628 + t * (i % 2 ? 0.65 : -0.48);
    const distance = r * (1.08 + 0.08 * Math.sin(t * 2.7 + i));
    const px = c.x + Math.cos(angle) * distance;
    const py = c.y + Math.sin(angle) * distance;
    ctx.globalAlpha = (0.22 + pulse * 0.22) * strength;
    ctx.fillStyle = i % 3 === 0 ? '#dcfce7' : '#4ade80';
    ctx.beginPath();
    ctx.arc(px, py, Math.max(1.2, r * 0.018), 0, TAU);
    ctx.fill();
  }

  ctx.restore();
}