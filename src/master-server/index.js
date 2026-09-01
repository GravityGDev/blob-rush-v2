import http from 'node:http';
import process from 'node:process';
import crypto from 'node:crypto';
import { connectDatabase, closeDatabase, db } from './db.js';
import { currentUser, handleAccount, handleAuth, readJson } from './auth.js';

const PORT = Number(process.env.PORT || 8080);
const TICKET_SECRET = process.env.GAME_TICKET_SECRET;
const INTERNAL_SECRET = process.env.INTERNAL_SERVER_SECRET;
if (!TICKET_SECRET || !INTERNAL_SECRET || !process.env.SESSION_SECRET) {
  console.error('SESSION_SECRET, GAME_TICKET_SECRET and INTERNAL_SERVER_SECRET are required.');
  process.exit(1);
}

function json(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

function cors(req, res) {
  const origin = req.headers.origin;
  const allowed = String(process.env.WEB_ORIGINS || '').split(',').map((v) => v.trim()).filter(Boolean);
  if (origin && allowed.includes(origin)) res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,OPTIONS');
  res.setHeader('Vary', 'Origin');
}

function secureEqual(left, right) {
  const a = Buffer.from(String(left || ''));
  const b = Buffer.from(String(right || ''));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function mintTicket(user, server) {
  const payload = JSON.stringify({
    userId: user._id.toString(), name: user.displayName, role: user.role || 'player',
    room: server.roomId, serverId: server.serverId, nonce: crypto.randomUUID(),
    exp: Math.floor(Date.now() / 1000) + 60,
  });
  const encoded = Buffer.from(payload).toString('base64url');
  const signature = crypto.createHmac('sha256', TICKET_SECRET).update(payload).digest('base64url');
  return `${encoded}.${signature}`;
}

const server = http.createServer(async (req, res) => {
  cors(req, res);
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }
  const pathname = new URL(req.url, 'http://master').pathname;
  try {
    if (pathname.startsWith('/api/auth/')) { await handleAuth(req, res, pathname); return; }
    if (pathname === '/api/account' || pathname === '/api/account/profile') { await handleAccount(req, res, pathname); return; }

    if (pathname === '/internal/servers/heartbeat' && req.method === 'POST') {
      const supplied = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
      if (!secureEqual(supplied, INTERNAL_SECRET)) return json(res, 401, { error: 'Unauthorized.' });
      const body = await readJson(req);
      const serverId = String(body.serverId || '').slice(0, 64);
      const wsUrl = String(body.wsUrl || '').slice(0, 300);
      if (!serverId || !/^wss?:\/\//i.test(wsUrl)) return json(res, 400, { error: 'Invalid server registration.' });
      const document = {
        serverId, roomId: String(body.roomId || 'ffa-8080').slice(0, 64),
        modeId: String(body.modeId || 'ffa').slice(0, 32), wsUrl,
        label: String(body.label || '#8080').slice(0, 32), region: String(body.region || 'EU West').slice(0, 32),
        players: Math.max(0, Number(body.players) || 0), capacity: Math.max(1, Number(body.capacity) || 60),
        updatedAt: new Date(), expiresAt: new Date(Date.now() + 35000),
      };
      await db().collection('game_servers').updateOne({ serverId }, { $set: document }, { upsert: true });
      return json(res, 200, { ok: true });
    }

    if (pathname === '/api/servers' && req.method === 'GET') {
      const rows = await db().collection('game_servers').find({ expiresAt: { $gt: new Date() } }, { projection: { _id: 0, wsUrl: 0 } }).sort({ modeId: 1, players: 1 }).toArray();
      return json(res, 200, { servers: rows });
    }

    if (pathname === '/api/game/ticket' && req.method === 'POST') {
      const user = await currentUser(req);
      if (!user) return json(res, 401, { error: 'Not signed in.' });
      const body = await readJson(req);
      const requestedRoom = String(body.room || 'ffa-8080');
      let gameServer = await db().collection('game_servers').findOne({ roomId: requestedRoom, expiresAt: { $gt: new Date() }, $expr: { $lt: ['$players', '$capacity'] } }, { sort: { players: 1 } });
      if (!gameServer && process.env.FFA_SERVER_URL && requestedRoom === 'ffa-8080') {
        gameServer = { serverId: 'game-1', roomId: 'ffa-8080', wsUrl: process.env.FFA_SERVER_URL };
      }
      if (!gameServer) return json(res, 503, { error: 'No available game server.' });
      return json(res, 200, { ticket: mintTicket(user, gameServer), serverUrl: gameServer.wsUrl, room: gameServer.roomId });
    }

    if (pathname === '/health') return json(res, 200, { ok: true, service: 'blobrush-master' });
    return json(res, 404, { error: 'Not found.' });
  } catch (error) {
    console.error(error);
    return json(res, 500, { error: 'Server error.' });
  }
});

await connectDatabase();
await db().collection('game_servers').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
server.listen(PORT, () => console.log(`Blob Rush master server listening on :${PORT}`));
for (const signal of ['SIGTERM', 'SIGINT']) process.on(signal, async () => { await closeDatabase(); process.exit(0); });
