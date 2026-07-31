// Shared mutable runtime state.
// The engine (physics, camera, renderer) reads from here instead of page-level
// globals, so a future networking layer can swap the local simulation for a
// server-authoritative world without touching the engine modules.
import { START_MASS } from './constants';

export const state = {
  profile: null,               // current saved player profile
  world: null,                 // active world simulation (local for now, remote later)
  camera: null,                // active camera
  input: { x: 0, y: 0, mag: 0 },
  size: { w: typeof innerWidth !== 'undefined' ? innerWidth : 1280, h: typeof innerHeight !== 'undefined' ? innerHeight : 720, dpr: 1 },
  stats: { maxMass: START_MASS, lastMass: START_MASS, bestRank: 99 },
};