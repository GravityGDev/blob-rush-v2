// Server-side tuning. Mirrors src/game/constants.js so online feels like offline.
export const WORLD_SIZE = 18000;
export const PELLET_COUNT = 3200;
export const VIRUS_COUNT = 85;
export const START_MASS = 5000;
export const MIN_SPLIT_MASS = 36;
export const MAX_CELLS = 16;
export const MAX_CELL_MASS = 22000;
export const EJECT_COST = 18;
export const VIRUS_MASS = 120;
export const VIRUS_FEEDS_TO_SPLIT = 7;
export const SPAWN_PROTECTION = 5;
export const MAX_EJECTED = 3800;

export const TICK_HZ = 60;
export const SNAPSHOT_HZ = 20;
export const VIEW_RANGE = 4200; // interest management radius around a player

export const MODES = {
  ffa: { startMass: START_MASS, bots: 25, capacity: 60 },
  instant22: { startMass: 22000, bots: 20, capacity: 60 },
  instant50: { startMass: 50000, bots: 16, capacity: 60 },
  duel: { startMass: START_MASS, bots: 0, capacity: 2 },
  powers: { startMass: 12000, bots: 12, capacity: 24 },
};

export const PELLET_COLORS = ['#ff5c8a', '#5cd6ff', '#ffd75c', '#7cf59a', '#c08cff', '#ff9d5c'];

export const radiusFromMass = (m) => Math.sqrt(m) * 9;
export const speedFromMass = (m) => 365 * Math.pow(Math.max(1, m) / START_MASS, -0.225);
export const mergeDelay = (m) => Math.min(42, 10 + Math.sqrt(Math.max(1, m)) * 0.38);