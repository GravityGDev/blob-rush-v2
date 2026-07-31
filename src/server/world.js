// World state: creation, spawning, pellets, viruses and player lifecycle.
import {
  WORLD_SIZE, PELLET_COUNT, VIRUS_COUNT, VIRUS_MASS, SPAWN_PROTECTION,
  PELLET_COLORS, MODES, radiusFromMass,
} from './constants.js';

const rand = (max) => Math.random() * max;

export function createWorld(modeId) {
  const mode = MODES[modeId] || MODES.ffa;
  const world = {
    modeId, mode, size: WORLD_SIZE, time: 0, nextId: 1,
    players: new Map(), pellets: [], viruses: [], ejected: [],
  };
  for (let i = 0; i < PELLET_COUNT; i += 1) world.pellets.push(makePellet(world));
  for (let i = 0; i < VIRUS_COUNT; i += 1) {
    world.viruses.push({ id: world.nextId++, x: rand(WORLD_SIZE), y: rand(WORLD_SIZE), mass: VIRUS_MASS, feed: 0, vx: 0, vy: 0 });
  }
  return world;
}

export function makePellet(world) {
  return {
    id: world.nextId++,
    x: rand(world.size),
    y: rand(world.size),
    mass: 1,
    color: PELLET_COLORS[Math.floor(Math.random() * PELLET_COLORS.length)],
  };
}

export function refillPellets(world) {
  while (world.pellets.length < PELLET_COUNT) world.pellets.push(makePellet(world));
}

export function spawnPlayer(world, player) {
  const mass = world.mode.startMass;
  const r = radiusFromMass(mass);
  player.cells = [{
    id: world.nextId++,
    x: r + rand(world.size - r * 2),
    y: r + rand(world.size - r * 2),
    mass, vx: 0, vy: 0, mergeAt: 0,
  }];
  player.protectedUntil = world.time + SPAWN_PROTECTION;
  player.spawnedAt = world.time;
  player.kills = 0;
  return player;
}

export function addPlayer(world, { name, skin, badge, cosmetics, isBot = false, userId = null }) {
  const player = {
    id: world.nextId++, userId, name, skin, badge, cosmetics, isBot,
    kills: 0, cells: [], input: { x: 0, y: 0, mag: 0 }, dead: false,
  };
  spawnPlayer(world, player);
  world.players.set(player.id, player);
  return player;
}

export function removePlayer(world, id) {
  world.players.delete(id);
}

export function playerMass(player) {
  return player.cells.reduce((sum, c) => sum + c.mass, 0);
}

export function leaderboard(world) {
  return [...world.players.values()]
    .filter((p) => p.cells.length)
    .map((p) => ({ id: p.id, name: p.name, mass: Math.round(playerMass(p)) }))
    .sort((a, b) => b.mass - a.mass)
    .slice(0, 10);
}