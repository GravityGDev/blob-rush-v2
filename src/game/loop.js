// Game session: world, camera, input and the animation frame loop.
// Input + macro behaviour is a 1:1 port of the original HTML build.
import { createWorld } from './world';
import { createCamera, updateCamera } from './camera';
import { updateWorld, splitPlayer, ejectMassBurst, cursorWorldTarget } from './physics';
import { render } from './render/scene';
import { playSfx, setSfxVolume } from './audio';
import { state } from './state';
import { START_MASS, MAX_CELLS } from './constants';
import { boosterActive } from './progression';

// `net` is an optional authoritative server connection. When present the server
// owns the simulation and this loop only sends intent and renders snapshots.
export function createSession(canvas, profile, onStats, net = null) {
  const online = () => !!net?.connected;
  const ctx = canvas.getContext('2d', { alpha: false });
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

  let input = { x: 0, y: 0, mag: 0 };
  let feedHeld = false;          // macro feed button
  let normalFeedHeld = false;    // classic feed button
  let normalFeedTimer = null;
  let macroAccumulator = 0;
  let macroSoundCooldown = 0;
  let multiSplitSequenceId = 0;
  let keyboardActive = false;
  const keys = new Set();

  let paused = false;
  let dead = false;
  let running = true;
  let raf = 0;
  let last = performance.now();
  let statsTick = 0;
  let fpsFrames = 0;
  let fpsAccum = 0;
  let fps = 60;
  let smoothFps = 60;

  const settings = () => state.profile?.settings || profile.settings || {};

  function resize() {
    const coarse = window.matchMedia('(pointer:coarse)').matches;
    const dpr = Math.min(coarse ? 1.35 : 1.75, window.devicePixelRatio || 1);
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    state.size = { w, h, dpr };
  }
  resize();

  function doSplit() {
    if (dead || !player.cells.length) return;
    if (online()) { net.split(1); playSfx('split'); return; }
    if (splitPlayer(player)) playSfx('split');
  }
  const animationDelayMs = () => Math.max(50, Math.min(500, Number(settings().animationDelay || 150)));

  function doMultiSplit(presses = 2) {
    if (dead || !player.cells.length) return;
    const total = Math.max(1, Math.min(4, Math.floor(presses)));
    const sequenceId = ++multiSplitSequenceId;
    let completed = 0;
    const step = () => {
      if (sequenceId !== multiSplitSequenceId || dead || paused || !player.cells.length) return;
      doSplit();
      completed += 1;
      if (completed < total && player.cells.length < MAX_CELLS) setTimeout(step, animationDelayMs());
    };
    step();
  }

  function doFeed(withSound = true, pulses = 1) {
    if (online()) {
      if (dead || !player.cells.length) return false;
      net.feed(pulses);
      if (withSound) playSfx('eject');
      return true;
    }
    const did = !!(!dead && player.cells.length && ejectMassBurst(world, player, pulses));
    if (did && withSound) playSfx('eject');
    return did;
  }

  function macroRate() {
    const speed = Math.max(10, Math.min(99, Number(settings().macroSpeed || 50)));
    const multiplier = Math.max(1, Math.min(300, Number(settings().macroMultiplier || 4)));
    return Math.min(6000, (1000 / speed) * multiplier);
  }

  function processMassStream(dt) {
    macroSoundCooldown = Math.max(0, macroSoundCooldown - dt);
    if (!feedHeld || paused || dead) {
      macroAccumulator = Math.min(macroAccumulator, 0.35);
      return;
    }
    macroAccumulator += dt * macroRate();
    const shots = Math.min(100, Math.floor(macroAccumulator));
    if (shots <= 0) return;
    macroAccumulator -= shots;
    const fired = doFeed(false, shots);
    if (fired && macroSoundCooldown <= 0) {
      playSfx('eject');
      macroSoundCooldown = 0.11;
    }
  }

  function updateKeyboardInput() {
    if (!keyboardActive) return;
    let x = 0, y = 0;
    if (keys.has('KeyA') || keys.has('ArrowLeft')) x -= 1;
    if (keys.has('KeyD') || keys.has('ArrowRight')) x += 1;
    if (keys.has('KeyW') || keys.has('ArrowUp')) y -= 1;
    if (keys.has('KeyS') || keys.has('ArrowDown')) y += 1;
    const d = Math.hypot(x, y);
    input = d ? { x: x / d, y: y / d, mag: 1 } : { ...input, mag: 0 };
  }

  const onKeyDown = (e) => {
    if (['Space','KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) e.preventDefault();
    keyboardActive = true;
    keys.add(e.code);
    if (e.code === 'Space') doSplit();
    if (e.code === 'KeyQ') doMultiSplit(2);
    if (e.code === 'KeyR') doMultiSplit(4);
    if (e.code === 'KeyE') doFeed();
  };
  const onKeyUp = (e) => keys.delete(e.code);

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  window.addEventListener('resize', resize);

  function frame(now) {
    if (!running) return;
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
    last = now;

    updateKeyboardInput();

    if (!paused && !dead) {
      player.dir = input;
      if (input.mag > 0.15) player.lastDir = { x: input.x, y: input.y };
      processMassStream(dt);
      if (online()) {
        net.sendInput(input);
        net.sync.apply(world, player);
      } else {
        updateWorld(world, dt * Math.max(0.15, Number(world.modTimeScale || 1)), playSfx);
      }
      updateCamera(cam, player, dt, state.size.w, state.size.h);
    }

    const visual = settings();
    // Adaptive detail: drop particle/pellet budgets when the frame rate sags.
    const frameFps = dt > 0 ? 1 / dt : 60;
    smoothFps += (frameFps - smoothFps) * Math.min(1, dt * 3);
    const detail = Math.max(0.55, Math.min(1, (smoothFps - 18) / 38));
    ctx.setTransform(state.size.dpr, 0, 0, state.size.dpr, 0, 0);
    render(ctx, state.size.w, state.size.h, world, cam, {
      quality: visual.quality || 'high',
      detail,
      showCosmetics: visual.showCosmetics !== false,
      showGlows: visual.showGlows !== false,
      animateSkins: visual.animateSkins !== false,
    });

    const reticle = state.reticleEl;
    if (reticle) {
      const show = visual.showReticle !== false && !dead && player.cells.length > 0;
      reticle.style.display = show ? 'block' : 'none';
      if (show) {
        const t = cursorWorldTarget(player);
        reticle.style.left = `${(t.x - cam.x) * cam.scale + state.size.w / 2}px`;
        reticle.style.top = `${(t.y - cam.y) * cam.scale + state.size.h / 2}px`;
        reticle.style.setProperty('--aim-angle', `${Math.atan2(player.dir?.y || 0, player.dir?.x || 1)}rad`);
        reticle.classList.toggle('centered', (player.dir?.mag || 0) <= 0.08);
      }
    }

    fpsFrames += 1;
    fpsAccum += dt;
    if (fpsAccum >= 1) { fps = Math.round(fpsFrames / fpsAccum); fpsFrames = 0; fpsAccum = 0; }

    const mass = player.cells.reduce((sum, c) => sum + c.mass, 0);
    state.stats.lastMass = mass;
    state.stats.maxMass = Math.max(state.stats.maxMass, mass);

    statsTick += dt;
    if (statsTick > 0.2) {
      statsTick = 0;
      const board = world.players
        .map((p) => ({ id: p.id, name: p.name, kills: p.kills || 0, mass: Math.round(p.cells.reduce((s, c) => s + c.mass, 0)), isPlayer: p === player }))
        .sort((a, b) => (b.kills - a.kills) || (b.mass - a.mass) || (a.id - b.id));
      const rank = board.findIndex((entry) => entry.isPlayer) + 1;
      if (rank > 0) state.stats.bestRank = Math.min(state.stats.bestRank, rank);
      const entities = world.players.reduce((s, pl) => s + (pl.cells?.length || 0), 0) + world.ejected.length + world.viruses.length;
      if (!player.cells.length) dead = true;
      onStats({
        mass: Math.round(mass),
        cells: player.cells.length,
        kills: player.kills || 0,
        rank: rank || board.length,
        leaderboard: board.slice(0, 5),
        selfRank: rank,
        selfName: player.name,
        alive: player.cells.length > 0,
        playerPos: player.cells[0] ? { x: player.cells[0].x, y: player.cells[0].y } : null,
        ping: online() ? net.ping : Math.round(20 + Math.sin(now / 1300) * 3 + Math.random() * 2),
        bandwidth: online() ? Math.max(1, net.bandwidth) : Math.max(1, Math.round(1 + entities * 0.055)),
        fps,
      });
    }
  }
  raf = requestAnimationFrame(frame);

  return {
    world,
    camera: cam,
    destroy() {
      running = false;
      cancelAnimationFrame(raf);
      clearInterval(normalFeedTimer);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('resize', resize);
      state.world = null;
      state.camera = null;
    },
    setPaused(value) {
      paused = !!value;
      if (paused) {
        feedHeld = false;
        normalFeedHeld = false;
        macroAccumulator = 0;
        clearInterval(normalFeedTimer);
        normalFeedTimer = null;
        multiSplitSequenceId += 1;
      }
    },
    setInput(next) {
      keyboardActive = false;
      input = next;
    },
    stopInput(stopOnRelease) {
      if (!keyboardActive && stopOnRelease) input = { ...input, mag: 0 };
    },
    split(times = 1) { if (times > 1) doMultiSplit(times); else doSplit(); },
    feed() { doFeed(); },
    setMacro(on) {
      feedHeld = !!on;
      macroAccumulator = 0;
      if (on) doFeed();
    },
    setNormalFeed(on) {
      normalFeedHeld = !!on;
      clearInterval(normalFeedTimer);
      normalFeedTimer = null;
      if (!on) return;
      doFeed();
      normalFeedTimer = setInterval(() => {
        if (!normalFeedHeld || paused || dead) return;
        doFeed(false, 1);
      }, 110);
    },
    playEmoji(id) { player.activeEmoji = { id, until: world.time + 2.3 }; if (online()) net.emoji(id); },
    playEmote(id) { player.activeEmote = { id, startedAt: world.time }; if (online()) net.emote(id); },
    reviveIfMassGiven() { if (player.cells.length) dead = false; },
  };
}