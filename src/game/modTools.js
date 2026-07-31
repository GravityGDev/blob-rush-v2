// Admin / mod tools — ported 1:1 from the original build's Admin Tools panel.
import { WORLD_SIZE, MAX_CELL_MASS, MAX_CELLS, START_MASS, PELLET_COUNT, radiusFromMass } from './constants';
import { makeCell, makeVirus, makePellet, makeEffect, randPos } from './world';
import { playerCentroid } from './physics';
import { playSfx } from './audio';

const TAU = Math.PI * 2;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export const playerTotalMass = (p) => p?.cells?.reduce((sum, c) => sum + c.mass, 0) || 0;

export function setPlayerTotalMass(world, p, requestedMass) {
  if (!p || !world) return;
  const desired = clamp(Number(requestedMass) || START_MASS, 10, MAX_CELL_MASS * MAX_CELLS);
  const center = p.cells.length ? playerCentroid(p) : { x: WORLD_SIZE / 2, y: WORLD_SIZE / 2 };
  let count = Math.max(1, p.cells.length, Math.ceil(desired / MAX_CELL_MASS));
  count = Math.min(MAX_CELLS, count);
  while (p.cells.length < count) {
    const a = (p.cells.length / count) * TAU;
    p.cells.push(makeCell(center.x + Math.cos(a) * 30, center.y + Math.sin(a) * 30, 10));
  }
  if (p.cells.length > count) p.cells = p.cells.slice(0, count);
  const each = desired / count;
  for (const c of p.cells) {
    c.mass = Math.min(MAX_CELL_MASS, each);
    c.drawR = radiusFromMass(c.mass);
    c.dead = false;
  }
  p.respawn = 0;
}

export function teleportPlayerTo(p, x, y) {
  if (!p?.cells?.length) return;
  const center = playerCentroid(p);
  const dx = clamp(x, 160, WORLD_SIZE - 160) - center.x;
  const dy = clamp(y, 160, WORLD_SIZE - 160) - center.y;
  for (const c of p.cells) {
    c.x = clamp(c.x + dx, 40, WORLD_SIZE - 40);
    c.y = clamp(c.y + dy, 40, WORLD_SIZE - 40);
    c.vx = c.vy = c.mx = c.my = 0;
    c.boostDistance = 0;
    c.splitBoostAge = c.splitBoostDuration || 0;
    c.splitBoostCurrentSpeed = 0;
  }
}

export function mergePlayerCells(p) {
  if (!p?.cells?.length || p.cells.length < 2) return;
  p.modForceMergeActive = true;
  p.modForceMergeDelay = 0.85;
  for (const c of p.cells) {
    c.merge = 0.85;
    c.boostDistance = 0;
    c.splitBoostAge = c.splitBoostDuration || 0;
    c.splitBoostCurrentSpeed = 0;
    c.vx *= 0.25;
    c.vy *= 0.25;
  }
}

export function shootModVirus(world) {
  const p = world?.player;
  if (!p?.cells?.length) return;
  const source = p.cells.reduce((best, c) => (c.mass > best.mass ? c : best), p.cells[0]);
  const d = p.dir?.mag > 0.05 ? p.dir : p.lastDir;
  const r = radiusFromMass(source.mass);
  const v = makeVirus();
  v.x = clamp(source.x + d.x * (r + 55), 60, WORLD_SIZE - 60);
  v.y = clamp(source.y + d.y * (r + 55), 60, WORLD_SIZE - 60);
  v.vx = d.x * 1050;
  v.vy = d.y * 1050;
  v.feed = 0;
  world.viruses.push(v);
  world.effects.push(makeEffect(v.x, v.y, '#59c94f', 12, 100, 230, 0.45, 5));
  playSfx('pop');
}

export function spawnVirusRing(world) {
  if (!world?.player?.cells?.length) return;
  const center = playerCentroid(world.player);
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * TAU;
    const v = makeVirus();
    v.x = clamp(center.x + Math.cos(a) * 520, 60, WORLD_SIZE - 60);
    v.y = clamp(center.y + Math.sin(a) * 520, 60, WORLD_SIZE - 60);
    world.viruses.push(v);
  }
}

export function spawnVirusStorm(world) {
  if (!world?.player?.cells?.length) return;
  const center = playerCentroid(world.player);
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * TAU + Math.random() * 0.16;
    const v = makeVirus();
    v.x = clamp(center.x + Math.cos(a) * 820, 60, WORLD_SIZE - 60);
    v.y = clamp(center.y + Math.sin(a) * 820, 60, WORLD_SIZE - 60);
    v.vx = -Math.cos(a) * (260 + Math.random() * 220);
    v.vy = -Math.sin(a) * (260 + Math.random() * 220);
    world.viruses.push(v);
  }
  playSfx('pop');
}

export function spawnPelletRain(world) {
  if (!world?.player?.cells?.length) return;
  const center = playerCentroid(world.player);
  for (let i = 0; i < 240; i++) {
    const pellet = makePellet(world.time);
    const a = Math.random() * TAU;
    const radius = Math.sqrt(Math.random()) * 650;
    pellet.x = clamp(center.x + Math.cos(a) * radius, 20, WORLD_SIZE - 20);
    pellet.y = clamp(center.y + Math.sin(a) * radius, 20, WORLD_SIZE - 20);
    world.pellets.push(pellet);
  }
  world.effects.push(makeEffect(center.x, center.y, '#fde047', 28, 260, 320, 0.8, 7));
}

export const randomTeleportPlayer = (p) => teleportPlayerTo(p, randPos(500), randPos(500));

export function swarmBotsAroundPlayer(world) {
  if (!world?.player?.cells?.length) return;
  const center = playerCentroid(world.player);
  const bots = world.players.filter((p) => p.isBot && p.cells.length);
  bots.forEach((bot, index) => {
    const a = (index / Math.max(1, bots.length)) * TAU;
    const radius = 300 + (index % 3) * 90;
    teleportPlayerTo(bot, center.x + Math.cos(a) * radius, center.y + Math.sin(a) * radius);
    bot.dir = { x: -Math.cos(a), y: -Math.sin(a), mag: 1 };
  });
}

export function scatterBots(world) {
  if (!world) return;
  for (const bot of world.players.filter((p) => p.isBot && p.cells.length)) randomTeleportPlayer(bot);
}

export function refillPellets(world) {
  while (world.pellets.length < PELLET_COUNT) world.pellets.push(makePellet(world.time));
}

export { WORLD_SIZE, MAX_CELL_MASS, MAX_CELLS };