// Authoritative simulation step: movement, eating, splitting, merging, viruses.
import {
  MIN_SPLIT_MASS, MAX_CELLS, MAX_CELL_MASS, EJECT_COST, VIRUS_MASS,
  VIRUS_FEEDS_TO_SPLIT, MAX_EJECTED, radiusFromMass, speedFromMass, mergeDelay,
} from './constants.js';
import { refillPellets, playerMass } from './world.js';

const CELL = 260; // pellet grid cell size
const key = (x, y) => `${Math.floor(x / CELL)}:${Math.floor(y / CELL)}`;

function buildGrid(items) {
  const grid = new Map();
  for (const item of items) {
    const k = key(item.x, item.y);
    let bucket = grid.get(k);
    if (!bucket) grid.set(k, (bucket = []));
    bucket.push(item);
  }
  return grid;
}

function nearby(grid, x, y, radius) {
  const out = [];
  const span = Math.ceil(radius / CELL);
  const cx = Math.floor(x / CELL);
  const cy = Math.floor(y / CELL);
  for (let gx = cx - span; gx <= cx + span; gx += 1) {
    for (let gy = cy - span; gy <= cy + span; gy += 1) {
      const bucket = grid.get(`${gx}:${gy}`);
      if (bucket) out.push(...bucket);
    }
  }
  return out;
}

export function step(world, dt) {
  world.time += dt;
  const players = [...world.players.values()];

  // --- movement -------------------------------------------------------
  for (const player of players) {
    for (const cell of player.cells) {
      const speed = speedFromMass(cell.mass) * Math.min(1, player.input.mag);
      cell.x += player.input.x * speed * dt + cell.vx * dt;
      cell.y += player.input.y * speed * dt + cell.vy * dt;
      cell.vx *= Math.pow(0.06, dt);
      cell.vy *= Math.pow(0.06, dt);
      if (cell.mass > 1200) cell.mass *= 1 - 0.002 * dt; // slow decay for giants
      const r = radiusFromMass(cell.mass);
      cell.x = Math.max(r, Math.min(world.size - r, cell.x));
      cell.y = Math.max(r, Math.min(world.size - r, cell.y));
    }
    resolveOwnCells(player, world.time);
    mergeOwnCells(player, world.time);
  }

  // --- ejected mass drifting -------------------------------------------
  for (const blob of world.ejected) {
    blob.x += blob.vx * dt;
    blob.y += blob.vy * dt;
    blob.vx *= Math.pow(0.02, dt);
    blob.vy *= Math.pow(0.02, dt);
  }

  // --- eating ----------------------------------------------------------
  const pelletGrid = buildGrid(world.pellets);
  const ejectedGrid = buildGrid(world.ejected);
  const eatenPellets = new Set();
  const eatenEjected = new Set();

  for (const player of players) {
    for (const cell of player.cells) {
      const r = radiusFromMass(cell.mass);
      for (const pellet of nearby(pelletGrid, cell.x, cell.y, r + CELL)) {
        if (eatenPellets.has(pellet.id)) continue;
        if (Math.hypot(pellet.x - cell.x, pellet.y - cell.y) < r) {
          eatenPellets.add(pellet.id);
          cell.mass = Math.min(MAX_CELL_MASS, cell.mass + pellet.mass);
        }
      }
      for (const blob of nearby(ejectedGrid, cell.x, cell.y, r + CELL)) {
        if (eatenEjected.has(blob.id) || blob.ownerId === player.id && world.time - blob.bornAt < 0.6) continue;
        if (Math.hypot(blob.x - cell.x, blob.y - cell.y) < r) {
          eatenEjected.add(blob.id);
          cell.mass = Math.min(MAX_CELL_MASS, cell.mass + blob.mass);
        }
      }
      eatVirus(world, player, cell);
    }
  }
  if (eatenPellets.size) world.pellets = world.pellets.filter((p) => !eatenPellets.has(p.id));
  if (eatenEjected.size) world.ejected = world.ejected.filter((b) => !eatenEjected.has(b.id));
  refillPellets(world);

  // --- player vs player --------------------------------------------------
  for (const attacker of players) {
    if (!attacker.cells.length) continue;
    for (const victim of players) {
      if (victim === attacker || !victim.cells.length) continue;
      if (victim.protectedUntil > world.time) continue;
      for (const cell of attacker.cells) {
        const r = radiusFromMass(cell.mass);
        victim.cells = victim.cells.filter((target) => {
          if (cell.mass < target.mass * 1.22) return true;
          const dist = Math.hypot(target.x - cell.x, target.y - cell.y);
          if (dist > r - radiusFromMass(target.mass) * 0.4) return true;
          cell.mass = Math.min(MAX_CELL_MASS, cell.mass + target.mass);
          return false;
        });
      }
      if (!victim.cells.length) {
        attacker.kills += 1;
        victim.dead = true;
        victim.killedBy = attacker.name;
      }
    }
  }
}

function resolveOwnCells(player, time) {
  for (let i = 0; i < player.cells.length; i += 1) {
    for (let j = i + 1; j < player.cells.length; j += 1) {
      const a = player.cells[i];
      const b = player.cells[j];
      if (a.mergeAt <= time && b.mergeAt <= time) continue;
      const ra = radiusFromMass(a.mass);
      const rb = radiusFromMass(b.mass);
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.hypot(dx, dy) || 0.001;
      const overlap = ra + rb - dist;
      if (overlap <= 0) continue;
      const push = (overlap / dist) * 0.5;
      a.x -= dx * push;
      a.y -= dy * push;
      b.x += dx * push;
      b.y += dy * push;
    }
  }
}

function mergeOwnCells(player, time) {
  for (let i = 0; i < player.cells.length; i += 1) {
    for (let j = i + 1; j < player.cells.length; j += 1) {
      const a = player.cells[i];
      const b = player.cells[j];
      if (a.mergeAt > time || b.mergeAt > time) continue;
      if (Math.hypot(b.x - a.x, b.y - a.y) > radiusFromMass(a.mass)) continue;
      a.mass = Math.min(MAX_CELL_MASS, a.mass + b.mass);
      player.cells.splice(j, 1);
      j -= 1;
    }
  }
}

function eatVirus(world, player, cell) {
  const r = radiusFromMass(cell.mass);
  for (let i = 0; i < world.viruses.length; i += 1) {
    const virus = world.viruses[i];
    if (cell.mass < virus.mass * 1.25) continue;
    if (Math.hypot(virus.x - cell.x, virus.y - cell.y) > r * 0.75) continue;
    world.viruses.splice(i, 1);
    world.viruses.push({
      id: world.nextId++, x: Math.random() * world.size, y: Math.random() * world.size,
      mass: VIRUS_MASS, feed: 0, vx: 0, vy: 0,
    });
    burst(world, player, cell);
    return;
  }
}

function burst(world, player, cell) {
  const pieces = Math.min(MAX_CELLS - player.cells.length, 7);
  if (pieces <= 0) return;
  const share = cell.mass / (pieces + 1);
  cell.mass = share;
  for (let i = 0; i < pieces; i += 1) {
    const angle = (Math.PI * 2 * i) / pieces;
    player.cells.push({
      id: world.nextId++, x: cell.x, y: cell.y, mass: share,
      vx: Math.cos(angle) * 900, vy: Math.sin(angle) * 900,
      mergeAt: world.time + mergeDelay(share),
    });
  }
}

export function split(world, player, times = 1) {
  for (let round = 0; round < Math.min(4, times); round += 1) {
    const source = [...player.cells];
    for (const cell of source) {
      if (player.cells.length >= MAX_CELLS) return;
      if (cell.mass < MIN_SPLIT_MASS * 2) continue;
      cell.mass /= 2;
      player.cells.push({
        id: world.nextId++, x: cell.x, y: cell.y, mass: cell.mass,
        vx: player.input.x * 1400, vy: player.input.y * 1400,
        mergeAt: world.time + mergeDelay(cell.mass),
      });
    }
  }
}

export function feed(world, player, pulses = 1) {
  for (let i = 0; i < Math.min(8, pulses); i += 1) {
    for (const cell of player.cells) {
      if (cell.mass < EJECT_COST * 2) continue;
      if (world.ejected.length >= MAX_EJECTED) return;
      cell.mass -= EJECT_COST;
      const r = radiusFromMass(cell.mass);
      world.ejected.push({
        id: world.nextId++, ownerId: player.id, bornAt: world.time,
        x: cell.x + player.input.x * r, y: cell.y + player.input.y * r,
        mass: EJECT_COST * 0.75, color: '#5cd6ff',
        vx: player.input.x * 1500, vy: player.input.y * 1500,
      });
    }
  }
}

export const totalMass = playerMass;