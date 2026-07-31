// Turns authoritative server snapshots into the world shape the renderer already
// understands, with buffered interpolation so movement stays smooth between ticks.
import { makeCell, makePlayer } from '../world';
import { radiusFromMass } from '../constants';

const INTERP_DELAY = 110;   // ms rendered in the past, to smooth over jitter
const BUFFER_MAX = 12;

const lerp = (a, b, t) => a + (b - a) * t;

export function createWorldSync() {
  const buffer = [];
  let clockOffset = null;   // performance.now() - server time
  let selfId = null;

  const setSelfId = (id) => { selfId = id; };

  function push(snapshot) {
    if (!snapshot || typeof snapshot.time !== 'number') return;
    const offset = performance.now() - snapshot.time;
    // Track the tightest offset seen: that is the least-delayed packet.
    if (clockOffset === null || offset < clockOffset) clockOffset = offset;
    buffer.push(snapshot);
    buffer.sort((a, b) => a.time - b.time);
    while (buffer.length > BUFFER_MAX) buffer.shift();
  }

  // Picks the two snapshots surrounding the render time and returns a blend factor.
  function framePair() {
    if (!buffer.length) return null;
    if (clockOffset === null) return { a: buffer[buffer.length - 1], b: null, t: 0 };
    const renderTime = performance.now() - clockOffset - INTERP_DELAY;
    for (let i = buffer.length - 1; i > 0; i--) {
      if (buffer[i - 1].time <= renderTime && buffer[i].time >= renderTime) {
        const span = buffer[i].time - buffer[i - 1].time;
        return { a: buffer[i - 1], b: buffer[i], t: span > 0 ? (renderTime - buffer[i - 1].time) / span : 0 };
      }
    }
    return { a: buffer[buffer.length - 1], b: null, t: 0 };
  }

  function syncCells(target, cellsA, cellsB, t) {
    const byId = new Map(target.cells.map((c) => [c.netId, c]));
    const next = [];
    for (const cellA of cellsA || []) {
      const cellB = cellsB?.find((c) => c.id === cellA.id);
      const x = cellB ? lerp(cellA.x, cellB.x, t) : cellA.x;
      const y = cellB ? lerp(cellA.y, cellB.y, t) : cellA.y;
      const mass = cellB ? lerp(cellA.mass, cellB.mass, t) : cellA.mass;
      const cell = byId.get(cellA.id) || makeCell(x, y, mass);
      cell.netId = cellA.id;
      cell.vx = (x - cell.x) * 60;
      cell.vy = (y - cell.y) * 60;
      cell.x = x;
      cell.y = y;
      cell.mass = mass;
      cell.drawR = radiusFromMass(mass);
      next.push(cell);
    }
    target.cells = next;
  }

  function syncPlayer(target, snapA, snapB, t) {
    target.name = snapA.name ?? target.name;
    target.skin = snapA.skin ?? target.skin;
    target.kills = snapA.kills || 0;
    if (snapA.cosmetics) target.equippedCosmetics = snapA.cosmetics;
    if (snapA.cosmeticTransforms) target.cosmeticTransforms = snapA.cosmeticTransforms;
    if (snapA.badge !== undefined) target.equippedBadge = snapA.badge;
    if (snapA.emoji) target.activeEmoji = snapA.emoji;
    if (snapA.emote) target.activeEmote = snapA.emote;
    target.spawnProtection = snapA.protected ? 1 : 0;
    syncCells(target, snapA.cells, snapB?.cells, t);
  }

  // Copies the interpolated snapshot into the live world object, reusing the
  // local player object so the game loop keeps its references.
  function apply(world, localPlayer) {
    const pair = framePair();
    if (!pair) return false;
    const { a, b, t } = pair;

    const known = new Map(world.players.map((p) => [p.netId, p]));
    const players = [];
    for (const snapA of a.players || []) {
      const snapB = b?.players?.find((p) => p.id === snapA.id);
      const isSelf = selfId !== null && snapA.id === selfId;
      let target = isSelf ? localPlayer : known.get(snapA.id);
      if (!target) {
        target = makePlayer({ name: snapA.name || 'Blob', skin: snapA.skin || 'aqua', isBot: !!snapA.isBot });
        target.cells = [];
      }
      target.netId = snapA.id;
      syncPlayer(target, snapA, snapB, t);
      players.push(target);
    }
    world.players = players;
    if (!players.includes(localPlayer)) localPlayer.cells = [];

    if (a.pellets) {
      world.pellets = a.pellets.map((p) => ({
        id: p.id, x: p.x, y: p.y, mass: p.mass || 1, color: p.color || '#5cd6ff',
        spawnTime: -5, jellyPhase: (p.id % 628) / 100, jellyAmount: 1, jellySpeed: 3.6,
      }));
    }
    if (a.viruses) {
      world.viruses = a.viruses.map((v) => ({ id: v.id, x: v.x, y: v.y, mass: v.mass, feed: v.feed || 0, vx: 0, vy: 0, fx: 0, fy: 0, spawnAge: 5 }));
    }
    if (a.ejected) {
      world.ejected = a.ejected.map((e) => ({ id: e.id, x: e.x, y: e.y, mass: e.mass, color: e.color || '#5cd6ff', vx: 0, vy: 0, age: 1 }));
    }
    world.time = a.time / 1000;
    return true;
  }

  return { push, apply, setSelfId, get ready() { return buffer.length > 0; } };
}