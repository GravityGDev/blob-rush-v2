// Blob Rush authoritative game server. Run with: npm start
import http from 'node:http';
import process from 'node:process';
import { WebSocketServer } from 'ws';
import { verifyTicket } from './ticket.js';
import { createRoom, join, leave, handleMessage, send } from './room.js';
import { TICK_HZ, WORLD_SIZE } from './constants.js';

const PORT = Number(process.env.PORT || 8080);
const SECRET = process.env.GAME_SERVER_SECRET;
if (!SECRET) {
  console.error('GAME_SERVER_SECRET is not set. Use the same value as in your Base44 app.');
  process.exit(1);
}

// Room ids must match the ones the app sends (see src/game/rooms.js).
const ROOM_DEFS = [
  { id: 'ffa-8080', modeId: 'ffa', label: '#8080', region: 'EU West' },
  { id: 'ffa-8081', modeId: 'ffa', label: '#8081', region: 'EU West' },
  { id: 'i22-8090', modeId: 'instant22', label: '#8090', region: 'EU West' },
  { id: 'i50-8100', modeId: 'instant50', label: '#8100', region: 'EU West' },
  { id: 'duel-8110', modeId: 'duel', label: '#8110', region: 'EU West' },
  { id: 'power-8120', modeId: 'powers', label: '#8120', region: 'EU West' },
];

const rooms = new Map(ROOM_DEFS.map((def) => [def.id, createRoom(def)]));
const defaultRoom = rooms.get('ffa-8080');

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.url === '/rooms') {
    const list = [...rooms.values()].map((room) => ({
      id: room.id, modeId: room.modeId, label: room.label, region: room.region,
      players: room.humanCount, capacity: room.capacity,
    }));
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(list));
    return;
  }
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ ok: true, rooms: rooms.size }));
});

const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  let room = null;
  let player = null;
  ws.isAlive = true;
  ws.on('pong', () => { ws.isAlive = true; });

  ws.on('message', (raw) => {
    let msg;
    try { msg = JSON.parse(raw.toString()); } catch { return; }

    if (msg.t === 'ping') { send(ws, { t: 'pong', ts: msg.ts }); return; }

    if (msg.t === 'join') {
      if (player) return;
      const payload = verifyTicket(msg.ticket, SECRET);
      if (!payload) { send(ws, { t: 'error', message: 'Invalid or expired login ticket.' }); ws.close(); return; }
      room = rooms.get(msg.room) || defaultRoom;
      player = join(room, ws, payload, msg);
      if (!player) { send(ws, { t: 'error', message: 'Room is full.' }); ws.close(); return; }
      send(ws, { t: 'joined', playerId: player.id, tickRate: TICK_HZ, world: { size: WORLD_SIZE } });
      console.log(`join ${payload.name} (${payload.userId}) -> ${room.id}`);
      return;
    }

    if (player) handleMessage(room, player, msg);
  });

  ws.on('close', () => { if (room && player) leave(room, player.id); });
});

// Drop dead connections.
setInterval(() => {
  for (const ws of wss.clients) {
    if (!ws.isAlive) { ws.terminate(); continue; }
    ws.isAlive = false;
    ws.ping();
  }
}, 30000);

server.listen(PORT, () => console.log(`Blob Rush server listening on :${PORT}`));