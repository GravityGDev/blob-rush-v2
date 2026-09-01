import http from 'node:http';
import process from 'node:process';
import { WebSocketServer } from 'ws';
import { verifyTicket } from './ticket.js';
import { createRoom, join, leave, handleMessage, send } from './room.js';
import { TICK_HZ, WORLD_SIZE } from './constants.js';

const PORT = Number(process.env.PORT || 8080);
const SERVER_ID = process.env.SERVER_ID || 'game-1';
const MASTER_URL = String(process.env.MASTER_SERVER_URL || '').replace(/\/+$/, '');
const PUBLIC_WS_URL = process.env.PUBLIC_WS_URL;
const TICKET_SECRET = process.env.GAME_TICKET_SECRET;
const INTERNAL_SECRET = process.env.INTERNAL_SERVER_SECRET;
if (!MASTER_URL || !PUBLIC_WS_URL || !TICKET_SECRET || !INTERNAL_SECRET) {
  console.error('MASTER_SERVER_URL, PUBLIC_WS_URL, GAME_TICKET_SECRET and INTERNAL_SERVER_SECRET are required.');
  process.exit(1);
}

const room = createRoom({ id: 'ffa-8080', modeId: 'ffa', label: '#8080', region: process.env.SERVER_REGION || 'EU West' });
const usedTickets = new Map();

const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json');
  if (req.url === '/health') { res.end(JSON.stringify({ ok: true, service: 'blobrush-game', serverId: SERVER_ID })); return; }
  if (req.url === '/rooms') {
    res.end(JSON.stringify([{ id: room.id, modeId: room.modeId, label: room.label, region: room.region, players: room.humanCount, capacity: room.capacity }])); return;
  }
  res.end(JSON.stringify({ ok: true, serverId: SERVER_ID }));
});

const wss = new WebSocketServer({ server, maxPayload: 16 * 1024, perMessageDeflate: false });
wss.on('connection', (ws) => {
  let player = null;
  let windowAt = Date.now();
  let messages = 0;
  ws.isAlive = true;
  ws.on('pong', () => { ws.isAlive = true; });

  ws.on('message', (raw) => {
    const now = Date.now();
    if (now - windowAt >= 1000) { windowAt = now; messages = 0; }
    if (++messages > 80) { ws.close(1008, 'Rate limit'); return; }
    let msg;
    try { msg = JSON.parse(raw.toString()); } catch { return; }
    if (msg.t === 'ping') { send(ws, { t: 'pong', ts: msg.ts }); return; }
    if (msg.t === 'join') {
      if (player) return;
      const payload = verifyTicket(msg.ticket, TICKET_SECRET);
      if (!payload || !payload.nonce || usedTickets.has(payload.nonce) || payload.serverId !== SERVER_ID || payload.room !== room.id || msg.room !== room.id) {
        send(ws, { t: 'error', message: 'Invalid or expired login ticket.' }); ws.close(); return;
      }
      usedTickets.set(payload.nonce, payload.exp);
      player = join(room, ws, payload, { ...msg, name: payload.name, badge: null, cosmetics: null });
      if (!player) { send(ws, { t: 'error', message: 'Room is full.' }); ws.close(); return; }
      send(ws, { t: 'joined', playerId: player.id, tickRate: TICK_HZ, world: { size: WORLD_SIZE } });
      return;
    }
    if (player) handleMessage(room, player, msg);
  });
  ws.on('close', () => { if (player) leave(room, player.id); });
});

async function heartbeat() {
  try {
    const response = await fetch(`${MASTER_URL}/internal/servers/heartbeat`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${INTERNAL_SECRET}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ serverId: SERVER_ID, roomId: room.id, modeId: room.modeId, label: room.label, region: room.region, wsUrl: PUBLIC_WS_URL, players: room.humanCount, capacity: room.capacity }),
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) console.error(`Master heartbeat rejected: ${response.status}`);
  } catch (error) { console.error(`Master heartbeat failed: ${error.message}`); }
}

setInterval(() => {
  const now = Date.now() / 1000;
  for (const [nonce, exp] of usedTickets) if (exp < now) usedTickets.delete(nonce);
  for (const ws of wss.clients) { if (!ws.isAlive) ws.terminate(); else { ws.isAlive = false; ws.ping(); } }
}, 30000);
setInterval(heartbeat, 10000);

server.listen(PORT, () => { console.log(`Blob Rush FFA game server listening on :${PORT}`); heartbeat(); });
