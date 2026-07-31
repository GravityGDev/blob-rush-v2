// World simulation: movement, splitting, ejecting, eating, viruses and bot AI.
// This is the module a future networking layer replaces or mirrors on a server.
import {
  WORLD_SIZE, PELLET_COUNT, VIRUS_COUNT, START_MASS, MIN_SPLIT_MASS, MAX_CELLS,
  VIRUS_MASS, VIRUS_FEEDS_TO_SPLIT, EJECT_COST, MAX_EJECTED_ITEMS,
  EJECT_EFFECT_LOAD_LIMIT, radiusFromMass, speedFromMass, mergeDelay,
} from './constants';
import { getSkin, getSkinStroke } from './skins';
import { makeEffect, makePellet, makeVirus, makeCell, makePlayer, absorbMass, uid } from './world';
import { SPAWN_PROTECTION_DURATION } from './constants';
import { clamp } from './utils';
import { state } from './state';

// Bots far outside the local player's view get cheap AI updates: they still
// move, but they skip the expensive per-frame threat/prey scan.
function makeViewBounds() {
  const cam = state.camera;
  const size = state.size;
  if (!cam || !size || !(cam.scale > 0)) return null;
  const halfW = size.w / 2 / cam.scale;
  const halfH = size.h / 2 / cam.scale;
  const margin = Math.max(halfW, halfH) * 0.6 + 900;
  return { x: cam.x, y: cam.y, hw: halfW + margin, hh: halfH + margin };
}

function isOffScreen(view, cell) {
  if (!view || !cell) return false;
  return Math.abs(cell.x - view.x) > view.hw || Math.abs(cell.y - view.y) > view.hh;
}

export function updateWorld(world, dt, sfx) {
  world.time += dt;
  const view = makeViewBounds();
  const totalCellCount = world.players.reduce((sum, player) => sum + player.cells.length, 0);
  world.performancePressure = totalCellCount > 150 || world.ejected.length > 1900;
  for (const p of world.players) {
    if (p.cells.length === 0) {
      if (p.isBot) {
        p.respawn -= dt;
        if (p.respawn <= 0) {
          const fresh = makePlayer({ name: p.name, skin: p.skin, isBot: true });
          p.cells = fresh.cells;
          p.ai = fresh.ai;
          p.spawnProtection = SPAWN_PROTECTION_DURATION;
          p.spawnElapsed = 0;
        }
      }
      continue;
    }
    p.spawnElapsed = (p.spawnElapsed || 0) + dt;
    p.spawnProtection = Math.max(0, (p.spawnProtection || 0) - dt);
    if (p.modForceMergeActive) p.modForceMergeDelay = Math.max(0, (p.modForceMergeDelay || 0) - dt);
    if (p.isBot && world.botsFrozen) {
      p.dir = { x:0, y:0, mag:0 };
      for (const c of p.cells) { c.mx *= Math.exp(-dt * 8); c.my *= Math.exp(-dt * 8); c.vx *= Math.exp(-dt * 8); c.vy *= Math.exp(-dt * 8); }
    } else if (p.isBot) updateBot(world, p, dt, isOffScreen(view, p.cells[0]));
    moveCells(p, dt, world.performancePressure);
    resolveOwnCells(p, dt);
  }
  updateEjected(world, dt);
  const ejectedIndex = buildSpatialIndex(world.ejected);
  updateViruses(world, dt, ejectedIndex);
  updateEffects(world, dt);
  handleEating(world, sfx, ejectedIndex);
  if (world.pelletSpawningEnabled) while (world.pellets.length < PELLET_COUNT) world.pellets.push(makePellet(world.time));
  if (world.virusSpawningEnabled) while (world.viruses.length < VIRUS_COUNT) world.viruses.push(makeVirus(world));
}

export function playerCentroid(p) {
  let x = 0;
  let y = 0;
  let mass = 0;
  for (const c of p.cells) {
    x += c.x * c.mass;
    y += c.y * c.mass;
    mass += c.mass;
  }
  return mass > 0 ? { x: x / mass, y: y / mass, mass } : { x: 0, y: 0, mass: 0 };
}

function cursorLeadDistance(totalMass, player = null) {
  const largestMass = player?.cells?.reduce((max, cell) => Math.max(max, cell.mass), 0) || totalMass;
  const largestRadius = radiusFromMass(Math.max(1, largestMass));
  const formationRadius = radiusFromMass(Math.max(1, totalMass));
  return Math.max(460, largestRadius * 1.06 + 190 + Math.min(430, formationRadius * 0.16));
}

function cursorViewportLead(center, player, dirX, dirY) {
  const camera = state.camera;
  const size = state.size;
  const minimumLead = cursorLeadDistance(center.mass, player);
  const directionLength = Math.hypot(dirX, dirY);
  if (directionLength < 0.001 || !camera || !size || !(camera.scale > 0)) return minimumLead;

  const nx = dirX / directionLength;
  const ny = dirY / directionLength;
  const margin = 24;
  const screenX = (center.x - camera.x) * camera.scale + size.w / 2;
  const screenY = (center.y - camera.y) * camera.scale + size.h / 2;
  const reaches = [];

  if (nx > 0.0001) reaches.push((size.w - margin - screenX) / nx);
  else if (nx < -0.0001) reaches.push((margin - screenX) / nx);
  if (ny > 0.0001) reaches.push((size.h - margin - screenY) / ny);
  else if (ny < -0.0001) reaches.push((margin - screenY) / ny);

  const screenReach = reaches.filter((value) => Number.isFinite(value) && value > 0).reduce((min, value) => Math.min(min, value), Infinity);
  if (!Number.isFinite(screenReach)) return minimumLead;

  // Full joystick deflection places the cursor at the screen edge. For a very
  // large cell, the target is allowed beyond the edge so it never falls inside
  // the cell and creates an artificial movement dead-zone.
  return Math.max(minimumLead, screenReach / camera.scale);
}

export function cursorWorldTarget(p) {
  const center = playerCentroid(p);
  const mag = Math.max(0, Math.min(1, p.dir?.mag || 0));
  const dirX = p.dir?.x || 0;
  const dirY = p.dir?.y || 0;
  const lead = cursorViewportLead(center, p, dirX, dirY);
  return {
    x: center.x + dirX * mag * lead,
    y: center.y + dirY * mag * lead,
    centerX: center.x,
    centerY: center.y,
    mass: center.mass,
    mag,
    lead,
  };
}

function moveCells(p, dt, performancePressure = false) {
  const forceMerge = !!p.modForceMergeActive && p.cells.length > 1;
  const idleRegroup = !forceMerge && p.cells.length > 1 && (p.dir?.mag || 0) <= 0.045;
  const k = Math.min(1, dt * (forceMerge ? 11 : idleRegroup ? 5.2 : 8.6));
  // Releasing movement gently draws split cells toward their weighted centre.
  const target = (forceMerge || idleRegroup) ? playerCentroid(p) : cursorWorldTarget(p);
  const tx = target.x;
  const ty = target.y;
  for (const c of p.cells) {
    const dx = tx - c.x;
    const dy = ty - c.y;
    const dist = Math.hypot(dx, dy) || 0.001;
    const cursorDistance = idleRegroup ? dist : Math.hypot(tx - target.centerX, ty - target.centerY);
    const precision = (forceMerge || idleRegroup) ? 1 : Math.min(1, cursorDistance / Math.max(70, (target.lead || cursorLeadDistance(target.mass, p)) * 0.58));
    const throttle = forceMerge
      ? Math.min(1, dist / 40)
      : idleRegroup
        ? Math.min(1, Math.max(0, dist - radiusFromMass(c.mass) * 0.2) / 180)
        : Math.min(1, dist / 96) * precision;
    const normalSpeed = speedFromMass(c.mass) * Math.max(0.1, Number(p.modSpeedMultiplier || 1));
    const speed = forceMerge
      ? Math.max(360, normalSpeed * 2.4) * throttle
      : idleRegroup
        ? normalSpeed * 0.52 * throttle
        : normalSpeed * throttle;
    c.mx += ((dx / dist) * speed - c.mx) * k;
    c.my += ((dy / dist) * speed - c.my) * k;

    c.splitAge = Math.min(c.splitDuration || 0, (c.splitAge || 0) + dt);
    c.splitGrace = Math.max(0, (c.splitGrace || 0) - dt);
    c.splitVisualAge = Math.min(c.splitVisualDuration || 0, (c.splitVisualAge || 0) + dt);

    // One continuous Agar-style launch curve along a quadratic ease-out path.
    let steeringScale = 1;
    if ((c.splitBoostDistance || 0) > 0.01 && (c.splitBoostAge || 0) < (c.splitBoostDuration || 0)) {
      const duration = Math.max(0.08, c.splitBoostDuration || 0.52);
      const previousU = Math.max(0, Math.min(1, (c.splitBoostAge || 0) / duration));
      c.splitBoostAge = Math.min(duration, (c.splitBoostAge || 0) + dt);
      const nextU = Math.max(0, Math.min(1, c.splitBoostAge / duration));
      const easeDistance = (u) => 1 - Math.pow(1 - u, 2);
      const previousProgress = easeDistance(previousU);
      const nextProgress = easeDistance(nextU);
      const step = Math.max(0, (c.splitBoostDistance || 0) * (nextProgress - previousProgress));
      c.x += (c.splitBoostDirX || 0) * step;
      c.y += (c.splitBoostDirY || 0) * step;
      c.splitBoostTravelled = Math.min(c.splitBoostDistance, (c.splitBoostTravelled || 0) + step);
      c.splitBoostCurrentSpeed = ((c.splitBoostDistance || 0) * 2 / duration) * Math.max(0, 1 - nextU);

      const steeringEase = nextU * nextU * (3 - 2 * nextU);
      steeringScale = 0.12 + 0.88 * steeringEase;
      if (nextU >= 0.999) {
        c.splitBoostAge = duration;
        c.splitBoostCurrentSpeed = 0;
      }
    } else {
      c.splitBoostCurrentSpeed = 0;
    }

    const decay = Math.exp(-dt * 3.0);
    c.vx *= decay;
    c.vy *= decay;
    c.x += (c.mx * steeringScale + c.vx) * dt;
    c.y += (c.my * steeringScale + c.vy) * dt;
    c.trail ??= [];
    c.trailTick = (c.trailTick || 0) + 1;
    const trailStride = performancePressure ? 3 : 1;
    if (c.trailTick % trailStride === 0) {
      const speedMag = Math.hypot(c.mx + c.vx, c.my + c.vy);
      c.trail.push({ x: c.x, y: c.y, speed: speedMag, life: 0.42 });
      const trailLimit = performancePressure ? 4 : 8;
      if (c.trail.length > trailLimit) c.trail.splice(0, c.trail.length - trailLimit);
    }
    const r = radiusFromMass(c.mass);
    const lo = r * 0.35;
    const hi = WORLD_SIZE - r * 0.35;
    let wallNX = 0;
    let wallNY = 0;
    if (c.x < lo) { c.x = lo; wallNX += 1; }
    if (c.x > hi) { c.x = hi; wallNX -= 1; }
    if (c.y < lo) { c.y = lo; wallNY += 1; }
    if (c.y > hi) { c.y = hi; wallNY -= 1; }
    if (wallNX || wallNY) {
      const normalLength = Math.hypot(wallNX, wallNY) || 1;
      wallNX /= normalLength;
      wallNY /= normalLength;
      const movingIntoWall = (c.splitBoostDirX || c.boostDirX || 0) * wallNX + (c.splitBoostDirY || c.boostDirY || 0) * wallNY < -0.05;
      if (movingIntoWall && (c.splitBoostCurrentSpeed || 0) > 0) {
        c.splitBoostAge = c.splitBoostDuration || 0;
        c.splitBoostCurrentSpeed = 0;
      }

      // Hard boundary: remove only motion directed through the wall.
      const velocityIntoWall = c.vx * wallNX + c.vy * wallNY;
      if (velocityIntoWall < 0) {
        c.vx -= wallNX * velocityIntoWall;
        c.vy -= wallNY * velocityIntoWall;
      }
      const movementIntoWall = c.mx * wallNX + c.my * wallNY;
      if (movementIntoWall < 0) {
        c.mx -= wallNX * movementIntoWall;
        c.my -= wallNY * movementIntoWall;
      }
    }
    c.merge = Math.max(0, c.merge - dt);
  }
}

function resolveOwnCells(p, dt) {
  const cells = p.cells;
  for (let i = 0; i < cells.length; i++) {
    for (let j = i + 1; j < cells.length; j++) {
      const a = cells[i];
      const b = cells[j];
      if (a.dead || b.dead) continue;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.hypot(dx, dy) || 0.001;
      const ra = radiusFromMass(a.mass);
      const rb = radiusFromMass(b.mass);
      const aIsChild = a.splitParentId === b.id;
      const bIsChild = b.splitParentId === a.id;
      const aBoosting = (a.splitBoostCurrentSpeed || 0) > 8 || (a.splitBoostAge || 0) < (a.splitBoostDuration || 0);
      const bBoosting = (b.splitBoostCurrentSpeed || 0) > 8 || (b.splitBoostAge || 0) < (b.splitBoostDuration || 0);
      const freshPair = (
        (aIsChild && (a.splitGrace > 0 || aBoosting)) ||
        (bIsChild && (b.splitGrace > 0 || bBoosting))
      );
      const recentSplitPair = (aIsChild && (a.splitAge || 0) < 0.9) || (bIsChild && (b.splitAge || 0) < 0.9);

      // Classic split cells begin overlapped and shoot cleanly through the
      // parent's edge. Own-cell collision resumes after the launch has cleared.
      if (freshPair) continue;

      if (a.merge <= 0 && b.merge <= 0) {
        if (dist < Math.max(ra, rb) * 0.6) {
          const [big, small] = a.mass >= b.mass ? [a, b] : [b, a];
          absorbMass(big, small.mass);
          small.dead = true;
        } else if (dist < ra + rb) {
          // Smooth recombination — merge-ready cells squeeze into each other
          const pull = (ra + rb - dist) * Math.min(1, dt * 3);
          const nx = dx / dist;
          const ny = dy / dist;
          const total = a.mass + b.mass;
          a.x += nx * pull * (b.mass / total);
          a.y += ny * pull * (b.mass / total);
          b.x -= nx * pull * (a.mass / total);
          b.y -= ny * pull * (a.mass / total);
        }
      } else if (dist < ra + rb) {
        const overlap = ra + rb - dist;
        const nx = dx / dist;
        const ny = dy / dist;
        const total = a.mass + b.mass;
        // Recently split pairs separate over several frames to avoid a snap.
        const correctionRate = recentSplitPair ? 11 : 34;
        const correction = overlap * Math.min(1, dt * correctionRate);
        a.x -= nx * correction * (b.mass / total);
        a.y -= ny * correction * (b.mass / total);
        b.x += nx * correction * (a.mass / total);
        b.y += ny * correction * (a.mass / total);
      }
    }
  }
  p.cells = cells.filter((c) => !c.dead);
  if (p.cells.length <= 1) { p.modForceMergeActive = false; p.modForceMergeDelay = 0; }
}

function updateEjected(world, dt) {
  for (const e of world.ejected) {
    e.age += dt;
    const decay = Math.exp(-dt * Math.max(0.8, Number(e.drag || 1.48)));
    e.vx *= decay;
    e.vy *= decay;
    e.x = clamp(e.x + e.vx * dt, 10, WORLD_SIZE - 10);
    e.y = clamp(e.y + e.vy * dt, 10, WORLD_SIZE - 10);
  }
}

function updateEffects(world, dt) {
  for (const fx of world.effects) {
    for (const p of fx.particles) {
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= Math.exp(-dt * 4.2);
      p.vy *= Math.exp(-dt * 4.2);
    }
    fx.particles = fx.particles.filter((p) => p.life > 0);
  }
  world.effects = world.effects.filter((fx) => fx.particles.length);
}

const SPATIAL_BUCKET_SIZE = 360;

export function buildSpatialIndex(items) {
  const index = new Map();
  for (const item of items) {
    if (item.dead) continue;
    const bx = Math.floor(item.x / SPATIAL_BUCKET_SIZE);
    const by = Math.floor(item.y / SPATIAL_BUCKET_SIZE);
    const key = `${bx},${by}`;
    let bucket = index.get(key);
    if (!bucket) index.set(key, bucket = []);
    bucket.push(item);
  }
  return index;
}

export function nearbyItems(index, x, y, radius) {
  const result = [];
  const minX = Math.floor((x - radius) / SPATIAL_BUCKET_SIZE);
  const maxX = Math.floor((x + radius) / SPATIAL_BUCKET_SIZE);
  const minY = Math.floor((y - radius) / SPATIAL_BUCKET_SIZE);
  const maxY = Math.floor((y + radius) / SPATIAL_BUCKET_SIZE);
  for (let bx = minX; bx <= maxX; bx++) {
    for (let by = minY; by <= maxY; by++) {
      const bucket = index.get(`${bx},${by}`);
      if (bucket) result.push(...bucket);
    }
  }
  return result;
}

function updateViruses(world, dt, ejectedIndex = buildSpatialIndex(world.ejected)) {
  for (const v of world.viruses) {
    v.spawnAge = (v.spawnAge || 0) + dt;
    const decay = Math.exp(-dt * 2.4);
    v.vx *= decay;
    v.vy *= decay;
    v.x = clamp(v.x + v.vx * dt, 60, WORLD_SIZE - 60);
    v.y = clamp(v.y + v.vy * dt, 60, WORLD_SIZE - 60);
    const vr = radiusFromMass(v.mass);
    for (const e of nearbyItems(ejectedIndex, v.x, v.y, vr)) {
      if (e.dead) continue;
      const dx = e.x - v.x;
      const dy = e.y - v.y;
      if (dx * dx + dy * dy < vr * vr) {
        e.dead = true;
        v.feed += 1;
        const m = Math.hypot(e.vx, e.vy) || 1;
        v.fx = e.vx / m;
        v.fy = e.vy / m;
      }
    }
    if (v.feed >= VIRUS_FEEDS_TO_SPLIT) {
      v.feed = 0;
      if (world.virusSpawningEnabled) {
        const nv = makeVirus();
        nv.x = v.x;
        nv.y = v.y;
        nv.vx = (v.fx || 1) * 760;
        nv.vy = (v.fy || 0) * 760;
        world.viruses.push(nv);
      }
    }
  }
}

function handleEating(world, sfx, sharedEjectedIndex = null) {
  const entries = [];
  for (const p of world.players) for (const c of p.cells) entries.push([p, c]);
  entries.sort((x, y) => y[1].mass - x[1].mass);

  const pelletIndex = buildSpatialIndex(world.pellets);
  const ejectedIndex = sharedEjectedIndex || buildSpatialIndex(world.ejected);
  const virusIndex = buildSpatialIndex(world.viruses);

  for (const [p, c] of entries) {
    if (c.dead) continue;
    const r = radiusFromMass(c.mass);

    for (const f of nearbyItems(pelletIndex, c.x, c.y, r + 24)) {
      if (f.dead) continue;
      const dx = f.x - c.x;
      const dy = f.y - c.y;
      if (dx * dx + dy * dy < r * r) {
        f.dead = true;
        absorbMass(c, f.mass);
        if (Math.random() < 0.16) world.effects.push(makeEffect(f.x, f.y, f.color, 4, 55, 120, 0.28, 3));
        if (!p.isBot) sfx('eat');
      }
    }

    for (const e of nearbyItems(ejectedIndex, c.x, c.y, r + 100)) {
      if (e.dead) continue;
      if ((p.spawnProtection || 0) > 0 && e.owner !== p.id) continue;
      // The owner cannot collect freshly ejected mass with any of their split
      // cells for one second. This enables wall-feed-then-split techniques.
      if (e.owner === p.id && e.age < Math.max(0.7, Number(e.selfPickupDelay || 0))) continue;
      const dx = e.x - c.x;
      const dy = e.y - c.y;
      if (dx * dx + dy * dy < r * r * 0.8) {
        e.dead = true;
        absorbMass(c, e.mass);
        if (world.ejected.length < EJECT_EFFECT_LOAD_LIMIT || Math.random() < 0.12) {
          world.effects.push(makeEffect(e.x, e.y, e.color || p.color, world.ejected.length > 700 ? 2 : 5, 70, 145, 0.28, 3));
        }
      }
    }

    if (c.mass > VIRUS_MASS * 1.15 && (p.spawnProtection || 0) <= 0) {
      for (const v of nearbyItems(virusIndex, c.x, c.y, r + 120)) {
        if (v.dead) continue;
        const d = Math.hypot(v.x - c.x, v.y - c.y);
        if (d < r - radiusFromMass(v.mass) * 0.4) {
          v.dead = true;
          absorbMass(c, VIRUS_MASS * 0.5);
          world.effects.push(makeEffect(v.x, v.y, '#59c94f', 16, 130, 280, 0.52, 6));
          popCell(p, c);
          if (!p.isBot) sfx('pop');
          break;
        }
      }
    }
  }

  // Spatial cell-eating pass: heavily split matches no longer compare every
  // cell against every other cell each frame.
  const indexedCells = entries.map(([p, c]) => ({ p, c, x:c.x, y:c.y, dead:false }));
  const cellIndex = buildSpatialIndex(indexedCells);
  for (const [p, c] of entries) {
    if (c.dead) continue;
    const r = radiusFromMass(c.mass);
    for (const candidate of nearbyItems(cellIndex, c.x, c.y, r + 12)) {
      const q = candidate.p;
      const d = candidate.c;
      if (d === c || d.dead || q === p) continue;
      if ((q.spawnProtection || 0) > 0 || q.modGodMode) continue;
      if (c.mass < d.mass * 1.25) continue;
      const dx = d.x - c.x;
      const dy = d.y - c.y;
      const eatRadius = r - radiusFromMass(d.mass) * 0.4;
      if (eatRadius > 0 && dx * dx + dy * dy < eatRadius * eatRadius) {
        absorbMass(c, d.mass);
        d.dead = true;
        q.lastKillerId = p.id;
        world.effects.push(makeEffect(d.x, d.y, getSkin(q.skin).accent, 10, 120, 235, 0.4, 4));
        if (p === world.player) {
          world.eatenCells += 1;
          sfx('eatCell');
        } else if (q === world.player) {
          sfx('eatCell');
        }
      }
    }
  }

  world.pellets = world.pellets.filter((f) => !f.dead);
  world.ejected = world.ejected.filter((e) => !e.dead);
  world.viruses = world.viruses.filter((v) => !v.dead);
  for (const p of world.players) {
    const before = p.cells.length;
    p.cells = p.cells.filter((c) => !c.dead);
    if (before > 0 && p.cells.length === 0) {
      const killer = world.players.find((candidate) => candidate.id === p.lastKillerId);
      if (killer && killer !== p) killer.kills = (killer.kills || 0) + 1;
      p.lastKillerId = null;
      if (p.isBot) p.respawn = 2 + Math.random() * 3;
    }
  }
}

export function popCell(p, cell) {
  const avail = MAX_CELLS - p.cells.length;
  if (avail <= 0) return;
  const n = Math.min(avail, Math.max(3, Math.floor(cell.mass / 28)));
  const piece = cell.mass / (n + 1);
  cell.mass = piece;
  cell.merge = mergeDelay(piece);
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    const sp = 320 + Math.random() * 480;
    const nc = makeCell(cell.x, cell.y, piece);
    nc.drawR = radiusFromMass(piece) * 0.46;
    nc.vx = Math.cos(a) * sp;
    nc.vy = Math.sin(a) * sp;
    nc.merge = mergeDelay(piece);
    nc.splitAge = 0;
    nc.splitDuration = 0.28;
    nc.splitGrace = 0.2;
    nc.splitParentId = cell.id;
    nc.splitDirX = Math.cos(a);
    nc.splitDirY = Math.sin(a);
    nc.splitVisualAge = 0;
    nc.splitVisualDuration = 0.26;
    nc.splitVisualDirX = Math.cos(a);
    nc.splitVisualDirY = Math.sin(a);
    p.cells.push(nc);
  }
}

function splitWallRoom(x, y, radius, dx, dy) {
  const margin = Math.max(10, radius * 0.35);
  const min = margin;
  const max = WORLD_SIZE - margin;
  let distance = Infinity;
  let normalX = 0;
  let normalY = 0;
  const consider = (candidate, nx, ny) => {
    if (!Number.isFinite(candidate) || candidate < -0.001) return;
    if (candidate < distance - 0.75) {
      distance = candidate;
      normalX = nx;
      normalY = ny;
    } else if (Math.abs(candidate - distance) <= 0.75) {
      normalX += nx;
      normalY += ny;
    }
  };
  if (dx > 0.0001) consider((max - x) / dx, -1, 0);
  else if (dx < -0.0001) consider((min - x) / dx, 1, 0);
  if (dy > 0.0001) consider((max - y) / dy, 0, -1);
  else if (dy < -0.0001) consider((min - y) / dy, 0, 1);
  if (!Number.isFinite(distance)) distance = WORLD_SIZE;
  const normalLength = Math.hypot(normalX, normalY);
  if (normalLength > 0) {
    normalX /= normalLength;
    normalY /= normalLength;
  }
  return { distance: Math.max(0, distance), normalX, normalY };
}

export function movementAimDir(p) {
  return p.dir.mag > 0.08 ? { x: p.dir.x, y: p.dir.y } : (p.lastDir || { x: 1, y: 0 });
}

function startSmoothSplitBoost(cell, dx, dy, distance, duration = 0.52) {
  const length = Math.hypot(dx, dy) || 1;
  cell.splitBoostDistance = Math.max(0, distance);
  cell.splitBoostTravelled = 0;
  cell.splitBoostAge = 0;
  cell.splitBoostDuration = Math.max(0.08, duration);
  cell.splitBoostDirX = dx / length;
  cell.splitBoostDirY = dy / length;
  cell.splitBoostCurrentSpeed = cell.splitBoostDistance * 3 / cell.splitBoostDuration;
  // Clear the legacy staged boost so only one launch system is active.
  cell.boostDistance = 0;
  cell.boostStartDistance = 0;
  cell.boostDirX = cell.splitBoostDirX;
  cell.boostDirY = cell.splitBoostDirY;
}

export function splitPlayer(p) {
  const d = movementAimDir(p);
  const snapshot = [...p.cells].sort((a, b) => b.mass - a.mass);
  let did = false;

  for (const c of snapshot) {
    if (p.cells.length >= MAX_CELLS) break;
    if (c.mass < MIN_SPLIT_MASS) continue;

    const oldR = radiusFromMass(c.mass);
    const oldDrawR = c.drawR === undefined ? oldR : c.drawR;
    const piece = c.mass * 0.5;
    const r = radiusFromMass(piece);
    c.mass = piece;
    // Preserve the old visual radius so the animation-delay slider controls
    // how quickly the parent visibly shrinks after splitting.
    c.drawR = oldDrawR;
    c.merge = mergeDelay(piece);

    // Preserve the parent's existing movement exactly. The launched child gets
    // the only extra impulse, which makes the separation read as one motion.
    const movementSpeed = speedFromMass(piece) * Math.max(0.1, Number(p.modSpeedMultiplier || 1));
    const launchDuration = 0.62;
    const desiredStartOffset = Math.max(18, oldR * 0.2);
    const parentTravelAllowance = movementSpeed * launchDuration * 0.34;
    const separationTarget = r * 2.85 + parentTravelAllowance + 125;
    const desiredBoostDistance = Math.max(980, Math.min(2450, separationTarget - desiredStartOffset));
    const wallRoom = splitWallRoom(c.x, c.y, r, d.x, d.y);
    const startOffset = Math.min(desiredStartOffset, wallRoom.distance);
    const forwardRoom = Math.max(0, wallRoom.distance - startOffset);
    const boostDistance = Math.min(desiredBoostDistance, forwardRoom);
    const blockedRatio = Math.max(0, Math.min(1, 1 - boostDistance / Math.max(1, desiredBoostDistance)));
    const margin = Math.max(10, r * 0.35);

    const nc = makeCell(
      clamp(c.x + d.x * startOffset, margin, WORLD_SIZE - margin),
      clamp(c.y + d.y * startOffset, margin, WORLD_SIZE - margin),
      piece
    );
    // Grow the child from a small visual seed. drawCell eases it to
    // the true radius using the selected animation delay.
    nc.drawR = Math.max(8, r * 0.2);
    nc.mx = c.mx;
    nc.my = c.my;
    nc.vx = c.vx * 0.22;
    nc.vy = c.vy * 0.22;
    nc.merge = mergeDelay(piece);
    nc.splitAge = 0;
    nc.splitDuration = launchDuration;
    nc.splitGrace = Math.min(0.78, launchDuration + 0.12);
    nc.splitParentId = c.id;
    nc.splitDirX = d.x;
    nc.splitDirY = d.y;
    nc.splitVisualAge = 0;
    nc.splitVisualDuration = Math.max(0.05, Math.min(0.5, Number(state.profile?.settings?.animationDelay || 150) / 1000));
    nc.splitVisualDirX = d.x;
    nc.splitVisualDirY = d.y;
    startSmoothSplitBoost(nc, d.x, d.y, boostDistance, launchDuration);

    if (blockedRatio > 0.025) {
      const pushX = wallRoom.normalX || -d.x;
      const pushY = wallRoom.normalY || -d.y;

      // A wall split transfers the blocked part of the launch into the parent.
      const childFinalTravel = startOffset + boostDistance;
      const contactSeparation = r * 2.08 + Math.min(22, r * 0.08);
      const missingSeparation = Math.max(0, contactSeparation - childFinalTravel);
      const recoilDistance = Math.min(r * 2.35, missingSeparation + r * 0.12 * blockedRatio);
      const recoilDuration = 0.36;

      nc.x = clamp(c.x + d.x * startOffset, margin, WORLD_SIZE - margin);
      nc.y = clamp(c.y + d.y * startOffset, margin, WORLD_SIZE - margin);
      startSmoothSplitBoost(nc, d.x, d.y, boostDistance, launchDuration);

      if (recoilDistance > 0.5) {
        startSmoothSplitBoost(c, pushX, pushY, recoilDistance, recoilDuration);
      }
      c.vx = 0;
      c.vy = 0;
      c.mx *= 0.18;
      c.my *= 0.18;

      // Keep own-cell collision disabled until the recoil has created the full
      // separation.
      nc.splitGrace = Math.max(nc.splitGrace, recoilDuration + 0.12);
    }

    p.cells.push(nc);
    did = true;
  }
  return did;
}

export function availableEjectPulses(cell) {
  if (cell.mass < MIN_SPLIT_MASS) return 0;
  return Math.max(0, Math.floor((cell.mass - (MIN_SPLIT_MASS - EJECT_COST)) / EJECT_COST));
}

function addEjectedMass(world, p, c, d, options = {}) {
  const amount = EJECT_COST;
  if (c.mass < MIN_SPLIT_MASS || availableEjectPulses(c) < 1) return false;
  const length = Math.hypot(d.x, d.y);
  if (length < 0.001) return false;
  const nx = d.x / length;
  const ny = d.y / length;
  c.mass -= amount;

  const inward = !!options.inward;
  const packetIndex = Math.max(0, Number(options.packetIndex || 0));
  const packetCount = Math.max(1, Number(options.packetCount || 1));
  const baseAngle = Math.atan2(ny, nx);
  const randomBell = () => (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;

  // A broad cone plus varied stopping distance creates the dense, irregular
  // Agar-style pile instead of a straight necklace of large packets.
  const sequence = packetCount <= 1 ? Math.random() : packetIndex / Math.max(1, packetCount - 1);
  const coneGrowth = 0.38 + Math.sqrt(sequence) * 0.62;
  const angularSpread = inward ? 0.12 : 0.49 * coneGrowth;
  const angle = baseAngle + randomBell() * angularSpread;
  const r = radiusFromMass(c.mass);
  const speedBias = Math.pow(Math.random(), 0.62);
  const launchSpeed = inward
    ? 435 + speedBias * 220
    : 1435 + speedBias * 1390;
  const forwardOffset = r + 18 + Math.random() * Math.min(54, r * 0.15);
  const sideOffset = randomBell() * Math.min(54, r * 0.13 + packetCount * 0.14);
  const sideX = -ny;
  const sideY = nx;
  const inheritedX = (c.mx + c.vx) * (inward ? 0.06 : 0.12);
  const inheritedY = (c.my + c.vy) * (inward ? 0.06 : 0.12);

  world.ejected.push({
    id: uid(),
    owner: p.id,
    sourceCell: c.id,
    selfFeed: inward,
    selfPickupDelay: 0.72,
    x: c.x + nx * forwardOffset + sideX * sideOffset,
    y: c.y + ny * forwardOffset + sideY * sideOffset,
    vx: Math.cos(angle) * launchSpeed + inheritedX,
    vy: Math.sin(angle) * launchSpeed + inheritedY,
    drag: inward ? 3.18 + Math.random() * 0.86 : 2.30 + Math.random() * 1.02,
    mass: amount,
    skinId: p.skin,
    color: getSkinStroke(getSkin(p.skin), world.time, 0),
    age: 0,
  });
  return true;
}

function trimEjectedMass(world) {
  const excess = world.ejected.length - MAX_EJECTED_ITEMS;
  if (excess > 0) world.ejected.splice(0, excess);
}

export function ejectMassBurst(world, p, requestedPulses = 1) {
  const pulses = Math.max(1, Math.min(300, Math.floor(requestedPulses)));
  const target = cursorWorldTarget(p);
  const centered = target.mag <= 0.08;
  const inward = centered && p.cells.length > 1;
  let did = false;

  for (const c of p.cells) {
    let dx = target.x - c.x;
    let dy = target.y - c.y;
    let dist = Math.hypot(dx, dy);

    if (dist < Math.max(10, radiusFromMass(c.mass) * 0.16)) {
      if (p.cells.length === 1) {
        const d = movementAimDir(p);
        dx = d.x;
        dy = d.y;
        dist = 1;
      } else {
        continue;
      }
    }

    const actual = Math.min(pulses, availableEjectPulses(c), 300);
    if (actual <= 0) continue;
    for (let i = 0; i < actual; i++) {
      if (addEjectedMass(world, p, c, { x: dx / dist, y: dy / dist }, {
        inward,
        packetIndex: i,
        packetCount: actual,
      })) did = true;
      else break;
    }
  }
  if (did) trimEjectedMass(world);
  return did;
}

export function ejectMass(world, p) {
  return ejectMassBurst(world, p, 1);
}

function updateBot(world, p, dt, offScreen = false) {
  p.ai.t -= dt;
  const c = p.cells.reduce((m, x) => (x.mass > m.mass ? x : m), p.cells[0]);
  if (p.ai.t <= 0) {
    p.ai.t = offScreen ? 1.6 + Math.random() * 1.4 : 0.35 + Math.random() * 0.35;
    if (offScreen) {
      // Cheap wander for bots the player cannot see.
      if (Math.hypot(p.ai.tx - c.x, p.ai.ty - c.y) < 200) {
        p.ai.tx = clamp(c.x + (Math.random() - 0.5) * 2600, 100, WORLD_SIZE - 100);
        p.ai.ty = clamp(c.y + (Math.random() - 0.5) * 2600, 100, WORLD_SIZE - 100);
      }
      const wdx = p.ai.tx - c.x;
      const wdy = p.ai.ty - c.y;
      const wdd = Math.hypot(wdx, wdy) || 1;
      p.dir = { x: wdx / wdd, y: wdy / wdd, mag: Math.min(1, wdd / 80) };
      return;
    }
    let threat = null;
    let prey = null;
    let tD = 1e9;
    let pD = 1e9;
    for (const q of world.players) {
      if (q === p || q.modInvisible) continue;
      for (const d of q.cells) {
        const dist = Math.hypot(d.x - c.x, d.y - c.y);
        if (d.mass > c.mass * 1.3 && dist < 700 && dist < tD) { threat = d; tD = dist; }
        else if (c.mass > d.mass * 1.4 && dist < 800 && dist < pD) { prey = d; pD = dist; }
      }
    }
    if (threat) {
      p.ai.tx = c.x - (threat.x - c.x) * 2;
      p.ai.ty = c.y - (threat.y - c.y) * 2;
    } else if (prey) {
      p.ai.tx = prey.x;
      p.ai.ty = prey.y;
      if (p.cells.length < 3 && c.mass > prey.mass * 2.8 && pD < radiusFromMass(c.mass) * 3.2 && Math.random() < 0.35) {
        const dd = Math.hypot(prey.x - c.x, prey.y - c.y) || 1;
        p.lastDir = { x: (prey.x - c.x) / dd, y: (prey.y - c.y) / dd };
        p.dir = { ...p.lastDir, mag: 1 };
        splitPlayer(p);
      }
    } else if (Math.hypot(p.ai.tx - c.x, p.ai.ty - c.y) < 120 || Math.random() < 0.08) {
      let best = null;
      let bD = 1e9;
      for (let k = 0; k < 40; k++) {
        const f = world.pellets[(Math.random() * world.pellets.length) | 0];
        if (!f) break;
        const dd = Math.hypot(f.x - c.x, f.y - c.y);
        if (dd < bD) { bD = dd; best = f; }
      }
      if (best) { p.ai.tx = best.x; p.ai.ty = best.y; }
    }
  }
  const dx = p.ai.tx - c.x;
  const dy = p.ai.ty - c.y;
  const dd = Math.hypot(dx, dy) || 1;
  p.dir = { x: dx / dd, y: dy / dd, mag: Math.min(1, dd / 80) };
  if (p.dir.mag > 0.15) p.lastDir = { x: p.dir.x, y: p.dir.y };
}