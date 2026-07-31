# Blob Rush game server

A complete, runnable authoritative server for Blob Rush. Copy this whole `server/` folder
to a VPS and run it — no other files from the app are needed.

## 1. Install

```bash
# on the VPS (Node 18+)
sudo apt update && sudo apt install -y nodejs npm
cd /opt
# copy this folder here as /opt/blobrush-server, then:
cd blobrush-server
npm install
```

## 2. Configure

The only required setting is the shared secret — it must be **exactly** the
`GAME_SERVER_SECRET` value stored in your Base44 app.

```bash
export GAME_SERVER_SECRET="paste-the-same-secret-here"
export PORT=8080          # optional, defaults to 8080
npm start
```

You should see `Blob Rush server listening on :8080`.

## 3. Keep it running

```bash
sudo npm install -g pm2
pm2 start index.js --name blobrush --env production
pm2 save && pm2 startup
```

## 4. HTTPS / WSS (required — the app is served over HTTPS)

Browsers refuse plain `ws://` from an HTTPS page, so put Nginx + a Let's Encrypt
certificate in front:

```nginx
server {
  listen 443 ssl;
  server_name play.yourdomain.com;

  ssl_certificate     /etc/letsencrypt/live/play.yourdomain.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/play.yourdomain.com/privkey.pem;

  location / {
    proxy_pass http://127.0.0.1:8080;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_read_timeout 600s;
  }
}
```

```bash
sudo certbot --nginx -d play.yourdomain.com
```

## 5. Connect the game

In the app: **Choose Arena → Server connection** → enter `wss://play.yourdomain.com`,
turn **Online play** on, save, then press Play.

## What's inside

| File | Role |
|---|---|
| `index.js` | HTTP + WebSocket entry point, room registry, `GET /rooms` |
| `room.js` | One arena: tick loop, per-player snapshots with interest management |
| `world.js` | World state, pellets, viruses, spawning, leaderboard |
| `physics.js` | Authoritative simulation: movement, eating, splitting, merging, viruses |
| `bots.js` | AI opponents so rooms are never empty |
| `ticket.js` | HMAC verification of the app's login tickets |
| `constants.js` | Tuning — mirrors the client's `src/game/constants.js` |

Simulation runs at 60 Hz, snapshots go out at 20 Hz, and each player only receives
entities within ~4200 units of their blob. All mass, kills and collisions are decided
here — the client only ever sends movement intent, so scores can't be faked.

Tuning lives in `constants.js`; room list lives at the top of `index.js` (ids must match
the ones in the app's `src/game/rooms.js`).