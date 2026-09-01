import http from 'node:http';
import process from 'node:process';
import crypto from 'node:crypto';
import { WebSocketServer } from 'ws';
import { connectDatabase, closeDatabase } from './db.js';
import { currentUser, handleAccount, handleAuth, readJson } from './auth.js';
import { verifyTicket } from './ticket.js';
import { createRoom, join, leave, handleMessage, send } from './room.js';
import { TICK_HZ, WORLD_SIZE } from './constants.js';

const PORT = Number(process.env.PORT || 8080);
const SECRET = process.env.GAME_SERVER_SECRET;
const SESSION_SECRET = process.env.SESSION_SECRET;
if (!SECRET || !SESSION_SECRET || SESSION_SECRET.length < 32) {
  console.error('GAME_SERVER_SECRET and a SESSION_SECRET of at least 32 characters are required.');
  process.exit(1);
}

const ROOM_DEFS = [{ id: 'ffa-8080', modeId: 'ffa', label: '#8080', region: 'EU West' }];
const rooms = new Map(ROOM_DEFS.map((def) => [def.id, createRoom(def)]));
const usedTickets = new Map();

const b64 = (value) => Buffer.from(value).toString('base64url');
function mintTicket(user, room) {
  const payload = JSON.stringify({ userId: user._id.toString(), name: user.displayName, role: user.role || 'player', room, nonce: crypto.randomUUID(), exp: Math.floor(Date.now() / 1000) + 120 });
  return `${b64(payload)}.${crypto.createHmac('sha256', SECRET).update(payload).digest('base64url')}`;
}

function cors(req, res) {
  const origin = req.headers.origin;
  const allowed = String(process.env.WEB_ORIGINS || '').split(',').map((v) => v.trim()).filter(Boolean);
  if (origin && allowed.includes(origin)) res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
}

const server = http.createServer(async (req, res) => {
  cors(req, res);
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }
  const pathname = new URL(req.url, 'http://localhost').pathname;
  try {
    if (pathname.startsWith('/api/auth/')) { await handleAuth(req, res, pathname); return; }
    if (pathname === '/api/account' || pathname === '/api/account/profile') { await handleAccount(req, res, pathname); return; }
    if (pathname === '/api/game/ticket' && req.method === 'POST') {
      const user = await currentUser(req);
      if (!user) { res.writeHead(401, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ error: 'Not signed in.' })); return; }
      const body = await readJson(req);
      const room = rooms.has(body.room) ? body.room : 'ffa-8080';
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ticket: mintTicket(user, room) }));
      return;
    }
    if (pathname === '/rooms') {
      const list = [...rooms.values()].map((room) => ({ id: room.id, modeId: room.modeId, label: room.label, region: room.region, players: room.humanCount, capacity: room.capacity }));
      res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(list)); return;
    }
    res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ ok: true, rooms: rooms.size }));
  } catch (error) {
    console.error(error); res.writeHead(500, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ error: 'Server error.' }));
  }
});

const wss = new WebSocketServer({ server, maxPayload: 16 * 1024 });
wss.on('connection', (ws) => {
  let room = null; let player = null; let windowAt = Date.now(); let messages = 0;
  ws.isAlive = true; ws.on('pong', () => { ws.isAlive = true; });
  ws.on('message', (raw) => {
    const now = Date.now(); if (now - windowAt >= 1000) { windowAt = now; messages = 0; }
    if (++messages > 80) { ws.close(1008, 'Rate limit'); return; }
    let msg; try { msg = JSON.parse(raw.toString()); } catch { return; }
    if (msg.t === 'ping') { send(ws, { t: 'pong', ts: msg.ts }); return; }
    if (msg.t === 'join') {
      if (player) return;
      const payload = verifyTicket(msg.ticket, SECRET);
      if (!payload || usedTickets.has(payload.nonce) || payload.room !== msg.room) { send(ws, { t: 'error', message: 'Invalid or expired login ticket.' }); ws.close(); return; }
      usedTickets.set(payload.nonce, payload.exp);
      room = rooms.get(payload.room);
      player = join(room, ws, payload, { ...msg, name: payload.name, badge: null, cosmetics: null });
      if (!player) { send(ws, { t: 'error', message: 'Room is full.' }); ws.close(); return; }
      send(ws, { t: 'joined', playerId: player.id, tickRate: TICK_HZ, world: { size: WORLD_SIZE } }); return;
    }
    if (player) handleMessage(room, player, msg);
  });
  ws.on('close', () => { if (room && player) leave(room, player.id); });
});

setInterval(() => {
  const now = Date.now() / 1000;
  for (const [nonce, exp] of usedTickets) if (exp < now) usedTickets.delete(nonce);
  for (const ws of wss.clients) { if (!ws.isAlive) ws.terminate(); else { ws.isAlive = false; ws.ping(); } }
}, 30000);

await connectDatabase();
server.listen(PORT, () => console.log(`Blob Rush API and game server listening on :${PORT}`));
for (const signal of ['SIGTERM', 'SIGINT']) process.on(signal, async () => { await closeDatabase(); process.exit(0); });
