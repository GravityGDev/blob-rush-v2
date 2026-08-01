// One arena: owns a world, ticks it, and broadcasts per-player snapshots.
import { TICK_HZ, SNAPSHOT_HZ, VIEW_RANGE, MODES } from './constants.js';
import { createWorld, addPlayer, removePlayer, playerMass, leaderboard } from './world.js';
import { step, split, feed } from './physics.js';
import { fillBots, updateBots } from './bots.js';

export function createRoom({ id, modeId, label, region }) {
  const world = createWorld(modeId);
  const mode = MODES[modeId] || MODES.ffa;
  fillBots(world, mode.bots);

  const room = {
    id, modeId, label, region, world,
    capacity: mode.capacity,
    sockets: new Map(), // playerId -> ws
    get humanCount() { return room.sockets.size; },
  };

  const dt = 1 / TICK_HZ;
  setInterval(() => {
    updateBots(world);
    step(world, dt);
    reapDead(room);
  }, 1000 / TICK_HZ);

  setInterval(() => broadcast(room), 1000 / SNAPSHOT_HZ);
  return room;
}

export function join(room, ws, payload, join_) {
  if (room.sockets.size >= room.capacity) return null;
  const player = addPlayer(room.world, {
    userId: payload.userId,
    name: payload.name,
    skin: join_.skin,
    badge: join_.badge,
    cosmetics: join_.cosmetics,
  });
  player.joinedAt = Date.now();
  room.sockets.set(player.id, ws);
  return player;
}

export function leave(room, playerId) {
  room.sockets.delete(playerId);
  removePlayer(room.world, playerId);
}

export function handleMessage(room, player, msg) {
  const world = room.world;
  if (msg.t === 'input') {
    const mag = Math.max(0, Math.min(1, Number(msg.mag) || 0));
    const x = Number(msg.x) || 0;
    const y = Number(msg.y) || 0;
    const len = Math.hypot(x, y) || 1;
    player.input = { x: x / len, y: y / len, mag };
  } else if (msg.t === 'split') {
    split(world, player, Number(msg.times) || 1);
  } else if (msg.t === 'feed') {
    feed(world, player, Number(msg.pulses) || 1);
  } else if (msg.t === 'emoji' || msg.t === 'emote') {
    player.reaction = { type: msg.t, id: msg.id, at: world.time };
  }
}

function reapDead(room) {
  for (const [playerId, ws] of room.sockets) {
    const player = room.world.players.get(playerId);
    if (!player || (!player.dead && player.cells.length)) continue;
    const board = leaderboard(room.world);
    send(ws, {
      t: 'dead',
      killer: player?.killedBy || null,
      mass: Math.round(player?.peakMass || 0),
      kills: player?.kills || 0,
      rank: board.findIndex((r) => r.id === playerId) + 1 || board.length + 1,
      time: (Date.now() - (player?.joinedAt || Date.now())) / 1000,
    });
    leave(room, playerId);
  }
}

function broadcast(room) {
  const world = room.world;
  const time = Date.now();
  for (const [playerId, ws] of room.sockets) {
    if (ws.readyState !== 1) continue;
    // Backpressure: if the socket is still draining, skip this snapshot instead of
    // queueing more. Otherwise slow links build a backlog and ping climbs to seconds.
    if (ws.bufferedAmount > 64 * 1024) continue;
    const self = world.players.get(playerId);
    if (!self || !self.cells.length) continue;
    self.peakMass = Math.max(self.peakMass || 0, playerMass(self));
    const head = self.cells[0];
    const inView = (e) => Math.abs(e.x - head.x) < VIEW_RANGE && Math.abs(e.y - head.y) < VIEW_RANGE;

    send(ws, {
      t: 'snapshot',
      time,
      players: [...world.players.values()]
        .filter((p) => p.cells.length && (p.id === playerId || p.cells.some(inView)))
        .map((p) => ({
          id: p.id, name: p.name, skin: p.skin, badge: p.badge || null,
          isBot: p.isBot, kills: p.kills, protected: p.protectedUntil > world.time,
          cosmetics: p.cosmetics || null,
          cells: p.cells.map((c) => ({ id: c.id, x: round(c.x), y: round(c.y), mass: round(c.mass) })),
        })),
      pellets: world.pellets.filter(inView).map((p) => ({ id: p.id, x: round(p.x), y: round(p.y), mass: p.mass, color: p.color })),
      viruses: world.viruses.filter(inView).map((v) => ({ id: v.id, x: round(v.x), y: round(v.y), mass: v.mass, feed: v.feed })),
      ejected: world.ejected.filter(inView).map((e) => ({ id: e.id, x: round(e.x), y: round(e.y), mass: round(e.mass), color: e.color })),
    });
  }
}

const round = (n) => Math.round(n * 10) / 10;

export function send(ws, msg) {
  if (ws.readyState === 1) ws.send(JSON.stringify(msg));
}