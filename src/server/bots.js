// Simple AI opponents so rooms are never empty.
import { addPlayer, spawnPlayer, playerMass } from './world.js';
import { radiusFromMass } from './constants.js';

const NAMES = ['Wobbles', 'Squish', 'Bloop', 'Nimbus', 'Vortex', 'Pudding', 'Zephyr', 'Munch',
  'Gloop', 'Comet', 'Bubbles', 'Ripple', 'Nova', 'Jelly', 'Drift', 'Orbit', 'Pixel', 'Splash',
  'Quark', 'Fizz', 'Tumble', 'Echo', 'Mochi', 'Blitz', 'Puff'];

export function fillBots(world, count) {
  for (let i = 0; i < count; i += 1) {
    const bot = addPlayer(world, {
      name: NAMES[i % NAMES.length],
      skin: 'default',
      isBot: true,
    });
    bot.wander = { x: Math.random() * 2 - 1, y: Math.random() * 2 - 1, until: 0 };
  }
}

export function updateBots(world) {
  for (const bot of world.players.values()) {
    if (!bot.isBot) continue;
    if (bot.dead || !bot.cells.length) { spawnPlayer(world, bot); bot.dead = false; continue; }

    const head = bot.cells[0];
    const mass = playerMass(bot);
    let target = null;
    let bestScore = Infinity;

    for (const other of world.players.values()) {
      if (other === bot || !other.cells.length) continue;
      const cell = other.cells[0];
      const dist = Math.hypot(cell.x - head.x, cell.y - head.y);
      if (dist > 2600) continue;
      const prey = head.mass > cell.mass * 1.3;
      const threat = cell.mass > head.mass * 1.3;
      if (!prey && !threat) continue;
      const score = threat ? dist - 3000 : dist;
      if (score < bestScore) { bestScore = score; target = { cell, flee: threat }; }
    }

    if (!target) {
      // wander toward pellet-rich space
      if (world.time > bot.wander.until) {
        const angle = Math.random() * Math.PI * 2;
        bot.wander = { x: Math.cos(angle), y: Math.sin(angle), until: world.time + 2 + Math.random() * 3 };
      }
      bot.input = { x: bot.wander.x, y: bot.wander.y, mag: 1 };
    } else {
      const dx = target.cell.x - head.x;
      const dy = target.cell.y - head.y;
      const len = Math.hypot(dx, dy) || 1;
      const sign = target.flee ? -1 : 1;
      bot.input = { x: (dx / len) * sign, y: (dy / len) * sign, mag: 1 };
    }

    // stay inside the map
    const r = radiusFromMass(head.mass);
    if (head.x < r * 2) bot.input.x = Math.abs(bot.input.x);
    if (head.y < r * 2) bot.input.y = Math.abs(bot.input.y);
    if (head.x > world.size - r * 2) bot.input.x = -Math.abs(bot.input.x);
    if (head.y > world.size - r * 2) bot.input.y = -Math.abs(bot.input.y);
    void mass;
  }
}