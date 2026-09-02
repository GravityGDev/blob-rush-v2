// WebSocket client for the authoritative game server.
// Protocol reference: src/game/net/PROTOCOL.md
import { createWorldSync } from './worldSync';

const INPUT_HZ = 20;
const PING_INTERVAL = 3000;

export function connectToServer({ url, room, mode, profile, ticket, onStatus, onDeath }) {
  const sync = createWorldSync();
  const socket = new WebSocket(url);
  let connected = false;
  let failed = false;
  let closed = false;
  let selfId = null;
  let ping = 0;
  let lastInputAt = 0;
  let pingTimer = 0;
  let inBytes = 0;
  let bytesWindow = performance.now();
  let bandwidth = 0;

  const status = (state, message) => onStatus?.({ state, message });
  const send = (msg) => { if (socket.readyState === 1) socket.send(JSON.stringify(msg)); };
  const connectionTimer = setTimeout(() => {
    if (connected || closed) return;
    failed = true;
    status('error', 'The game server did not accept the connection in time.');
    try { socket.close(); } catch { /* already closed */ }
  }, 12000);

  socket.onopen = () => {
    status('joining');
    send({
      t: 'join',
      ticket,
      room,
      mode,
      name: profile.nickname || 'Blob',
      skin: profile.skin,
      badge: profile.equippedBadge || null,
      cosmetics: profile.equippedCosmetics || null,
      cosmeticTransforms: profile.cosmeticTransforms || null,
    });
    pingTimer = setInterval(() => send({ t: 'ping', ts: Date.now() }), PING_INTERVAL);
  };

  socket.onmessage = (event) => {
    inBytes += event.data.length || 0;
    const now = performance.now();
    if (now - bytesWindow >= 1000) {
      bandwidth = Math.round((inBytes / 1024) * (1000 / (now - bytesWindow)));
      inBytes = 0;
      bytesWindow = now;
    }
    let msg;
    try { msg = JSON.parse(event.data); } catch { return; }
    if (msg.t === 'joined') {
      connected = true;
      clearTimeout(connectionTimer);
      selfId = msg.playerId;
      sync.setSelfId(msg.playerId);
      status('online');
    } else if (msg.t === 'snapshot') {
      sync.push(msg);
    } else if (msg.t === 'pong') {
      ping = Math.max(1, Date.now() - msg.ts);
    } else if (msg.t === 'dead') {
      onDeath?.(msg);
    } else if (msg.t === 'error') {
      failed = true;
      clearTimeout(connectionTimer);
      status('error', msg.message || 'Server rejected the connection.');
      try { socket.close(); } catch { /* already closed */ }
    }
  };

  socket.onerror = () => {
    if (!closed) {
      failed = true;
      clearTimeout(connectionTimer);
      status('error', 'Could not reach the game server WebSocket.');
    }
  };
  socket.onclose = () => {
    connected = false;
    clearTimeout(connectionTimer);
    clearInterval(pingTimer);
    if (!closed && !failed) status('disconnected', 'Connection to the game server was lost.');
  };

  return {
    sync,
    get connected() { return connected; },
    get selfId() { return selfId; },
    get ping() { return ping; },
    get bandwidth() { return bandwidth; },
    sendInput(dir) {
      const now = performance.now();
      if (now - lastInputAt < 1000 / INPUT_HZ) return;
      lastInputAt = now;
      send({ t: 'input', x: Number(dir.x.toFixed(3)), y: Number(dir.y.toFixed(3)), mag: Number(dir.mag.toFixed(3)) });
    },
    split(times = 1) { send({ t: 'split', times }); },
    feed(pulses = 1) { send({ t: 'feed', pulses }); },
    emoji(id) { send({ t: 'emoji', id }); },
    emote(id) { send({ t: 'emote', id }); },
    close() {
      closed = true;
      clearTimeout(connectionTimer);
      clearInterval(pingTimer);
      try { socket.close(); } catch { /* already closed */ }
    },
  };
}
