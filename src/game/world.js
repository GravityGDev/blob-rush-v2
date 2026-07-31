// World creation: pellets, viruses, cells, players and bots.
import {
  WORLD_SIZE, PELLET_COUNT, START_MASS, MAX_CELL_MASS, VIRUS_MASS, VIRUS_COUNT,
  BOT_COUNT, SPAWN_PROTECTION_DURATION, VIRUS_PLAYER_SPAWN_CLEARANCE, radiusFromMass,
} from './constants';
import { SKINS, SHOP_SKIN_IDS, getSkin, findBadge } from './skins';
import { cloneProfile } from './utils';

let nextId = 1;
export const uid = () => nextId++;

export function makeEffect(x, y, color, count = 8, spread = 90, speed = 220, life = 0.5, size = 5) {
  const particles = [];
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2;
    const sp = speed * (0.35 + Math.random() * 0.9);
    particles.push({
      x, y,
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp,
      life: life * (0.65 + Math.random() * 0.55),
      maxLife: life,
      size: size * (0.6 + Math.random() * 0.8),
      color,
      spread,
    });
  }
  return { id: uid(), particles };
}

export const PELLET_COLORS = ['#ff5c8a', '#ffb020', '#5cd6ff', '#7dff8a', '#c58cff', '#ff8a5c', '#5cffd6', '#ffe45c'];
export const BOT_NAMES = ['Gloop','Wobbles','Nimbus','Splodge','Orbit','Puddle','Zorb','Mochi','Blip','Drift','Squish','Nova','Pip','Gelato','Murk','Bloop','Rift','Vex','Echo','Jelly','Kairo','Flux','Noodle','Pixel','Comet'];

export const randPos = (margin = 100) => margin + Math.random() * (WORLD_SIZE - 2 * margin);

export function makePellet(spawnTime = -1 - Math.random() * 3) {
  return {
    id: uid(),
    x: randPos(20),
    y: randPos(20),
    mass: 1,
    color: PELLET_COLORS[(Math.random() * PELLET_COLORS.length) | 0],
    spawnTime,
    jellyPhase: Math.random() * Math.PI * 2,
    jellyAmount: 0.72 + Math.random() * 0.56,
    jellySpeed: 3.4 + Math.random() * 1.6,
  };
}

function virusSpawnClearance(world, x, y) {
  const virusRadius = radiusFromMass(VIRUS_MASS);
  let clearance = Infinity;
  if (world?.players) {
    for (const player of world.players) {
      for (const cell of player.cells || []) {
        if (cell.dead) continue;
        const wanted = virusRadius + radiusFromMass(cell.mass) + VIRUS_PLAYER_SPAWN_CLEARANCE;
        clearance = Math.min(clearance, Math.hypot(x - cell.x, y - cell.y) - wanted);
      }
    }
  }
  if (world?.viruses) {
    for (const virus of world.viruses) {
      if (virus.dead) continue;
      const wanted = virusRadius + radiusFromMass(virus.mass || VIRUS_MASS) + 120;
      clearance = Math.min(clearance, Math.hypot(x - virus.x, y - virus.y) - wanted);
    }
  }
  return clearance;
}

export function makeVirus(world = null) {
  let best = { x:randPos(360), y:randPos(360), clearance:-Infinity };
  const attempts = world ? 72 : 1;
  for (let attempt = 0; attempt < attempts; attempt++) {
    const x = randPos(360);
    const y = randPos(360);
    const clearance = world ? virusSpawnClearance(world, x, y) : Infinity;
    if (clearance > best.clearance) best = { x, y, clearance };
    if (clearance >= 0) break;
  }
  return { id: uid(), x: best.x, y: best.y, mass: VIRUS_MASS, feed: 0, vx: 0, vy: 0, fx: 0, fy: 0, spawnAge: 0 };
}

export function makeCell(x, y, mass) {
  const cappedMass = Math.min(MAX_CELL_MASS, mass);
  return {
    id: uid(), x, y, mass: cappedMass,
    vx: 0, vy: 0, mx: 0, my: 0,
    merge: 0,
    drawR: radiusFromMass(cappedMass),
    trail: [],
    splitAge: 1,
    splitDuration: 0,
    splitGrace: 0,
    splitParentId: null,
    splitDirX: 0,
    splitDirY: 0,
    splitVisualAge: 1,
    splitVisualDuration: 0,
    splitVisualDirX: 0,
    splitVisualDirY: 0,
    boostDistance: 0,
    boostStartDistance: 0,
    boostDirX: 0,
    boostDirY: 0,
    splitBoostDistance: 0,
    splitBoostTravelled: 0,
    splitBoostAge: 0,
    splitBoostDuration: 0,
    splitBoostDirX: 0,
    splitBoostDirY: 0,
    splitBoostCurrentSpeed: 0,
    wallRecoilX: 0,
    wallRecoilY: 0,
    wallRecoilTime: 0,
  };
}

export function absorbMass(cell, amount) {
  if (!cell || amount <= 0) return 0;
  const before = cell.mass;
  cell.mass = Math.min(MAX_CELL_MASS, cell.mass + amount);
  return cell.mass - before;
}

export function makePlayer({ name, skin, isBot, startMass = START_MASS, equippedCosmetics = null, cosmeticTransforms = null, equippedBadge = null }) {
  const spawnMargin = Math.max(720, radiusFromMass(startMass) + 280);
  const x = randPos(spawnMargin);
  const y = randPos(spawnMargin);
  return {
    id: uid(),
    name,
    skin,
    color: getSkin(skin).base,
    isBot,
    equippedCosmetics: equippedCosmetics ? cloneProfile(equippedCosmetics) : { hat:null, overlay:null },
    cosmeticTransforms: cosmeticTransforms ? cloneProfile(cosmeticTransforms) : {},
    equippedBadge: findBadge(equippedBadge) ? equippedBadge : null,
    cells: [makeCell(x, y, startMass)],
    dir: { x: 0, y: 0, mag: 0 },
    lastDir: { x: 1, y: 0 },
    ai: { t: 0, tx: x, ty: y },
    respawn: 0,
    kills: 0,
    lastKillerId: null,
    spawnProtection: SPAWN_PROTECTION_DURATION,
    spawnElapsed: 0,
    modSpeedMultiplier: 1,
    modInvisible: false,
    modGodMode: false,
    modRainbowTrail: false,
    modForceMergeActive: false,
    modForceMergeDelay: 0,
  };
}

export function movePlayerToSafeSpawn(world, player) {
  const cell = player.cells[0];
  if (!cell) return;
  const radius = radiusFromMass(cell.mass);
  const margin = Math.max(760, radius + 300);
  let best = { x:randPos(margin), y:randPos(margin), clearance:-Infinity };
  for (let attempt = 0; attempt < 36; attempt++) {
    const x = randPos(margin);
    const y = randPos(margin);
    let clearance = Infinity;
    for (const other of world.players) {
      for (const otherCell of other.cells) {
        const wanted = radius + radiusFromMass(otherCell.mass) + 520;
        clearance = Math.min(clearance, Math.hypot(x - otherCell.x, y - otherCell.y) - wanted);
      }
    }
    for (let i = 0; i < world.viruses.length; i += 3) {
      const virus = world.viruses[i];
      clearance = Math.min(clearance, Math.hypot(x - virus.x, y - virus.y) - radius - 260);
    }
    if (clearance > best.clearance) best = { x, y, clearance };
    if (clearance >= 0) break;
  }
  cell.x = best.x;
  cell.y = best.y;
  player.ai.tx = best.x;
  player.ai.ty = best.y;
}

export function createWorld(playerName, skinId, playerOptions = {}) {
  const world = { pellets: [], viruses: [], ejected: [], players: [], time: 0, eatenCells: 0, effects: [], virusSpawningEnabled: true, pelletSpawningEnabled: true, botsFrozen: false, modTimeScale: 1 };
  for (let i = 0; i < PELLET_COUNT; i++) world.pellets.push(makePellet());
  world.player = makePlayer({
    name: playerName || 'Blob',
    skin: skinId,
    isBot: false,
    startMass: playerOptions.startMass || START_MASS,
    equippedCosmetics: playerOptions.equippedCosmetics,
    cosmeticTransforms: playerOptions.cosmeticTransforms,
    equippedBadge: playerOptions.equippedBadge,
  });
  movePlayerToSafeSpawn(world, world.player);
  world.players.push(world.player);
  const names = [...BOT_NAMES].sort(() => Math.random() - 0.5);
  const botSkinPool = SKINS.filter((skin) => !SHOP_SKIN_IDS.has(skin.id) || Math.random() < 0.45);
  for (let i = 0; i < BOT_COUNT; i++) {
    const bot = makePlayer({ name: names[i % names.length], skin: botSkinPool[(Math.random() * botSkinPool.length) | 0].id, isBot: true, startMass: Math.round(START_MASS * (0.72 + Math.random() * 0.56)) });
    movePlayerToSafeSpawn(world, bot);
    world.players.push(bot);
  }
  // Place viruses only after players exist, so no normal virus can appear on
  // top of a player or immediately trigger a split at match start.
  for (let i = 0; i < VIRUS_COUNT; i++) world.viruses.push(makeVirus(world));
  return world;
}