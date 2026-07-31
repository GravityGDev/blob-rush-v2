// Lightweight WebAudio sound effects.
let ctx = null;
let vol = 0.8;

export function setSfxVolume(v) { vol = v; }

function ac() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone(freq, dur = 0.08, type = 'sine', gain = 0.12, slide = 0) {
  if (vol <= 0) return;
  try {
    const a = ac();
    const o = a.createOscillator();
    const g = a.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, a.currentTime);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), a.currentTime + dur);
    g.gain.setValueAtTime(gain * vol, a.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + dur);
    o.connect(g).connect(a.destination);
    o.start();
    o.stop(a.currentTime + dur);
  } catch {
    // audio not available yet (needs user gesture)
  }
}

export function playSfx(name) {
  switch (name) {
    case 'eat': tone(520 + Math.random() * 220, 0.06, 'sine', 0.05, 200); break;
    case 'eatCell': tone(300, 0.2, 'sine', 0.16, -150); break;
    case 'split': tone(240, 0.12, 'square', 0.07, 240); break;
    case 'eject': tone(420, 0.07, 'triangle', 0.07, -130); break;
    case 'pop': tone(130, 0.32, 'sawtooth', 0.14, -80); break;
    case 'button': tone(600, 0.05, 'sine', 0.08, 90); break;
    case 'reward': tone(660, 0.12, 'triangle', 0.1, 220); setTimeout(() => tone(880, 0.16, 'triangle', 0.1, 130), 100); break;
    case 'death': tone(220, 0.55, 'sawtooth', 0.13, -170); break;
    default: break;
  }
}