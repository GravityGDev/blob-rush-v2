# Blob Rush — game server protocol

The app is the **client only**. You host the authoritative server. This document is the
contract the client in `src/game/net/` already implements — build your server to match it
and online play works with no further changes to the app.

Transport: **WebSocket**, one connection per player, **JSON** text frames.
Server URL is configured in-game under *Choose Arena → Server connection* (e.g. `wss://play.example.com`).

---

## 1. Authentication

Before connecting, the client calls this app's `netTicket` backend function, which returns:

```
ticket = base64url(payloadJson) + "." + base64url(HMAC_SHA256(payloadJson, GAME_SERVER_SECRET))
```

`payloadJson` is:

```json
{ "userId": "...", "email": "...", "name": "Blob", "role": "player", "room": "ffa-8080", "exp": 1730000000 }
```

**Your server must:**
1. Split the ticket on `.`, base64url-decode both halves.
2. Recompute `HMAC_SHA256(payloadJson, GAME_SERVER_SECRET)` using the *same* `GAME_SERVER_SECRET`
   value set in this app's environment variables, and compare in constant time.
3. Reject if `exp` is in the past (tickets live 120 seconds).
4. Trust `userId`, `name` and `role` only from the ticket — never from the `join` message.

Node example:

```js
import crypto from 'node:crypto';

function verifyTicket(ticket, secret) {
  const [p, sig] = ticket.split('.');
  const json = Buffer.from(p, 'base64url').toString('utf8');
  const expected = crypto.createHmac('sha256', secret).update(json).digest('base64url');
  if (sig.length !== expected.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  const payload = JSON.parse(json);
  if (payload.exp * 1000 < Date.now()) return null;
  return payload;
}
```

---

## 2. Client → server messages

| Message | Shape | Notes |
|---|---|---|
| join | `{ t:"join", ticket, room, mode, name, skin, badge, cosmetics, cosmeticTransforms }` | First frame after open. Cosmetics are presentation only — safe to echo back to other clients. |
| input | `{ t:"input", x, y, mag }` | Sent 20×/sec. Unit direction vector; `mag` 0–1. |
| split | `{ t:"split", times }` | `times` is 1–4 (multi-split). |
| feed | `{ t:"feed", pulses }` | Eject mass; `pulses` ≥ 1 for macro feed. |
| emoji | `{ t:"emoji", id }` | Cosmetic reaction. |
| emote | `{ t:"emote", id }` | Cosmetic reaction. |
| ping | `{ t:"ping", ts }` | `ts` is client `Date.now()`. |

**Never trust client-reported mass, position or kills.** Movement intent is the only
authoritative input the client provides.

---

## 3. Server → client messages

### joined (once, after a valid join)
```json
{ "t":"joined", "playerId": 42, "tickRate": 20, "world": { "size": 12000 } }
```

### snapshot (every tick, 15–25 Hz recommended)
```json
{
  "t": "snapshot",
  "time": 1730000000123,
  "players": [
    { "id": 42, "name": "Blob", "skin": "aqua", "badge": null, "isBot": false, "kills": 3,
      "protected": false,
      "cosmetics": { "hat": null, "overlay": null },
      "cells": [ { "id": 900, "x": 5120.4, "y": 3300.1, "mass": 240.5 } ] }
  ],
  "pellets":  [ { "id": 1, "x": 100, "y": 220, "mass": 1, "color": "#ff5c8a" } ],
  "viruses":  [ { "id": 7, "x": 3000, "y": 4000, "mass": 100, "feed": 0 } ],
  "ejected":  [ { "id": 55, "x": 512, "y": 640, "mass": 12, "color": "#5cd6ff" } ]
}
```

- `time` is server wall-clock milliseconds. The client buffers snapshots and renders
  ~110 ms in the past, interpolating between the two surrounding ticks — so a steady tick
  rate matters far more than a high one.
- Send only entities within roughly two screens of that player (interest management);
  the client renders whatever it receives.
- `players`, `pellets`, `viruses`, `ejected` may each be omitted to leave the previous
  value untouched — useful for sending pellets less often than players.

### dead
```json
{ "t":"dead", "killer": "Wobbles", "mass": 1840, "kills": 3, "rank": 4, "time": 212.5 }
```

### pong
```json
{ "t":"pong", "ts": 1730000000123 }
```
Echo the client's `ts` back untouched; the client derives round-trip ping from it.

### error
```json
{ "t":"error", "message": "Room is full" }
```
Send this then close, for bad tickets, full rooms, or bans.

---

## 4. Room list (optional HTTP endpoint)

If you expose `GET /rooms` on the same host over HTTPS returning:

```json
[ { "id":"ffa-8080", "modeId":"ffa", "label":"#8080", "region":"EU West", "players":18, "capacity":35 } ]
```

the server browser will show live player counts instead of the built-in placeholder list.
Enable CORS for the app's origin. Without it the app falls back to `src/game/rooms.js`.

---

## 5. Recommended server behaviour

- Simulate at a fixed step (e.g. 60 Hz) and broadcast snapshots at 20 Hz.
- Cap mass gain per tick and validate split/feed cooldowns server-side — that is what makes
  the game cheat-proof and is the whole reason for an authoritative server.
- World size, pellet counts, virus behaviour and mass constants should mirror
  `src/game/constants.js` so the feel matches offline play.
- On disconnect, keep the blob alive for a few seconds before removing it, so brief network
  blips don't kill a player.