// Game session: owns the world, camera, input and the animation frame loop.
import { createWorld, movePlayerToSafeSpawn } from './world';
import { createCamera, updateCamera } from './camera';
import { updateWorld, splitPlayer, ejectMassBurst } from './physics';
import { render } from './render/scene';
import { playSfx, setSfxVolume } from './audio';
import { state } from './state';
import { START_MASS } from './constants';
import { boosterActive } from './progression';

export function createSession(canvas, profile, onStats) {
  const ctx = canvas.getContext('2d');
  const world = createWorld(profile.nickname || 'Blob', profile.skin, {
    startMass: boosterActive(profile, 'mass') ? Math.round(START_MASS * 1.25) : START_MASS,
    equippedCosmetics: profile.equippedCosmetics,
    cosmeticTransforms: profile.cosmeticTransforms,
    equippedBadge: profile.equippedBadge,
  });
  const cam = createCamera();
  const player = world.player;
  const centre = player.cells[0];
  cam.x = centre.x;
  cam.y = centre.y;

  state.profile = profile;
  state.world = world;
  state.camera = cam;
  setSfxVolume(Number(profile.settings?.sfx ?? 0.8));

  const settings = profile.settings || {};
  const opts = {
    quality: settings.quality || 'high',
    detail: 1,
    showCosmetics: settings.showCosmetics !== false,
    showGlows: settings.showGlows !== false,
    animateSkins: settings.animateSkins !== false,
  };

  const pointer = { x: 0, y: 0, active: false };
  let usingJoystick = false;
  let macroHeld = false;
  let macroTimer = 0;
  let running = true;
  let raf = 0;
  let last = performance.now();
  let statsTick = 0;

  function resize() {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    state.size = { w, h, dpr };
  }
  resize();

  function updateDirection() {
    const { w, h } = state.size;
    const dx = pointer.x - w / 2;
    const dy = pointer.y - h / 2;
    const dist = Math.hypot(dx, dy);
    if (dist < 12) {
      player.dir = { x: player.lastDir.x, y: player.lastDir.y, mag: 0 };
      return;
    }
    const nx = dx / dist;
    const ny = dy / dist;
    player.lastDir = { x: nx, y: ny };
    player.dir = { x: nx, y: ny, mag: Math.min(1, dist / (Math.min(w, h) * 0.42)) };
  }

  const onMove = (e) => {
    if (usingJoystick) return;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches?.[0];
    pointer.x = (touch ? touch.clientX : e.clientX) - rect.left;
    pointer.y = (touch ? touch.clientY : e.clientY) - rect.top;
    pointer.active = true;
  };
  function doSplit(times = 1) {
    let did = false;
    for (let i = 0; i < times; i++) if (splitPlayer(player)) did = true;
    if (did) playSfx('split');
  }
  function doFeed() {
    if (ejectMassBurst(world, player, 1)) playSfx('eject');
  }

  const onKey = (e) => {
    if (!player.cells.length) return;
    if (e.code === 'Space') { e.preventDefault(); doSplit(1); }
    else if (e.code === 'KeyQ') { e.preventDefault(); doSplit(2); }
    else if (e.code === 'KeyR') { e.preventDefault(); doSplit(4); }
    else if (e.code === 'KeyE' || e.code === 'KeyW') { e.preventDefault(); doFeed(); }
  };

  window.addEventListener('mousemove', onMove);
  window.addEventListener('touchmove', onMove, { passive: true });
  window.addEventListener('touchstart', onMove, { passive: true });
  window.addEventListener('keydown', onKey);
  window.addEventListener('resize', resize);

  function frame(now) {
    if (!running) return;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;

    if (pointer.active && !usingJoystick) updateDirection();

    if (macroHeld && player.cells.length) {
      macroTimer += dt * 1000;
      const speed = Math.max(10, Math.min(99, Number(profile.settings?.macroSpeed ?? 50)));
      const multi = Math.max(1, Math.min(300, Number(profile.settings?.macroMultiplier ?? 4)));
      while (macroTimer >= speed) {
        macroTimer -= speed;
        if (ejectMassBurst(world, player, multi)) playSfx('eject');
      }
    } else macroTimer = 0;

    updateWorld(world, dt, playSfx);
    updateCamera(cam, player, dt, state.size.w, state.size.h);
    render(ctx, state.size.w, state.size.h, world, cam, opts);

    const mass = player.cells.reduce((sum, c) => sum + c.mass, 0);
    state.stats.lastMass = mass;
    state.stats.maxMass = Math.max(state.stats.maxMass, mass);

    statsTick += dt;
    if (statsTick > 0.25) {
      statsTick = 0;
      const board = world.players
        .map((p) => ({ id: p.id, name: p.name, mass: p.cells.reduce((s, c) => s + c.mass, 0), isPlayer: p === player }))
        .filter((entry) => entry.mass > 0)
        .sort((a, b) => b.mass - a.mass);
      const rank = board.findIndex((entry) => entry.isPlayer) + 1;
      if (rank > 0) state.stats.bestRank = Math.min(state.stats.bestRank, rank);
      onStats({
        mass: Math.round(mass),
        cells: player.cells.length,
        kills: player.kills || 0,
        rank: rank || board.length + 1,
        leaderboard: board.slice(0, 10),
        alive: player.cells.length > 0,
        playerPos: player.cells[0] ? { x: player.cells[0].x, y: player.cells[0].y } : null,
        blobs: board.length,
        fps: Math.round(1 / Math.max(0.0001, dt)),
      });
    }

    raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);

  return {
    world,
    destroy() {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchstart', onMove);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', resize);
      state.world = null;
      state.camera = null;
    },
    split(times = 1) { doSplit(times); },
    eject() { doFeed(); },
    setMacro(on) { macroHeld = !!on; if (!on) macroTimer = 0; },
    setJoystick(dir) {
      if (!dir) {
        usingJoystick = false;
        if (profile.settings?.touch?.stopOnRelease !== false) player.dir = { x: player.lastDir.x, y: player.lastDir.y, mag: 0 };
        return;
      }
      usingJoystick = true;
      const sens = Math.max(0.4, Math.min(2, Number(profile.settings?.touch?.joystickSensitivity ?? 1)));
      if (dir.mag > 0.02) player.lastDir = { x: dir.x, y: dir.y };
      player.dir = { x: dir.x, y: dir.y, mag: Math.max(0, Math.min(1, dir.mag * sens)) };
    },
    playEmoji(id) { player.activeEmoji = { id, until: world.time + 2.3 }; },
    playEmote(id) { player.activeEmote = { id, startedAt: world.time }; },
    admin(action, value) {
      const cells = player.cells;
      if (action === 'setMass' && cells.length) { const each = Math.max(20, value / cells.length); cells.forEach((c) => { c.mass = each; }); }
      else if (action === 'addMass') cells.forEach((c) => { c.mass += value; });
      else if (action === 'god') player.modGodMode = !!value;
      else if (action === 'invisible') player.modInvisible = !!value;
      else if (action === 'speed') player.modSpeedMultiplier = value;
      else if (action === 'freezeBots') world.botsFrozen = !!value;
      else if (action === 'viruses') world.virusSpawningEnabled = !!value;
      else if (action === 'pellets') world.pelletSpawningEnabled = !!value;
      else if (action === 'timeScale') world.modTimeScale = value;
      else if (action === 'killBots') world.players.forEach((p) => { if (p.isBot) p.cells = []; });
      else if (action === 'respawnSafe') movePlayerToSafeSpawn(world, player);
    },
  };
}