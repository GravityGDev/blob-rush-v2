// Core gameplay constants and tuning curves.
export const BUILD_LABEL = '5K-25BOT-RENDER-CAMERA-VIRUS-SAFE';
export const WORLD_SIZE = 18000;
export const PELLET_COUNT = 3200;
export const VIRUS_COUNT = 85;
export const START_MASS = 5000;
export const MIN_SPLIT_MASS = 36;
export const MAX_CELLS = 16;
export const MAX_CELL_MASS = 22000;
export const EJECT_COST = 18;
export const EJECT_MASS = EJECT_COST;
export const VIRUS_MASS = 120;
export const VIRUS_FEEDS_TO_SPLIT = 7;
export const BOT_COUNT = 25;
export const SPAWN_PROTECTION_DURATION = 5;
export const FIXED_RENDER_WIDTH = 1280;
export const FIXED_RENDER_HEIGHT = 720;
export const MAX_EJECTED_ITEMS = 3800;
export const EJECT_EFFECT_LOAD_LIMIT = 1250;
export const MAX_RENDERED_BOT_CELLS = 92;
export const MAX_RENDERED_VIRUSES = 46;
export const VIRUS_PLAYER_SPAWN_CLEARANCE = 760;

export const GAME_MODES = [
  { id: 'ffa', name: 'Free For All', icon: '⚡', note: 'Classic survival', featured: true },
  { id: 'instant22', name: 'Instant 22K', icon: '🟣', note: 'Fast split battles' },
  { id: 'instant50', name: 'Instant 50K', icon: '⚪', note: 'High-mass chaos' },
  { id: 'duel', name: '1v1 Duel', icon: 'VS', note: 'Head-to-head arena' },
  { id: 'powers', name: 'Super Powers', icon: '✦', note: 'Ability testing' },
];

export const SERVER_ROOMS = [
  { id: 'ffa-8080', modeId: 'ffa', code: '8080', players: 26, max: 60, ping: 28, status: 'open' },
  { id: 'ffa-8081', modeId: 'ffa', code: '8081', players: 41, max: 60, ping: 34, status: 'open' },
  { id: 'ffa-8082', modeId: 'ffa', code: '8082', players: 57, max: 60, ping: 42, status: 'busy' },
  { id: 'i22-8090', modeId: 'instant22', code: '8090', players: 26, max: 60, ping: 31, status: 'open' },
  { id: 'i22-8091', modeId: 'instant22', code: '8091', players: 18, max: 60, ping: 26, status: 'open' },
  { id: 'i22-8092', modeId: 'instant22', code: '8092', players: 54, max: 60, ping: 47, status: 'busy' },
  { id: 'i50-8100', modeId: 'instant50', code: '8100', players: 36, max: 60, ping: 37, status: 'open' },
  { id: 'i50-8101', modeId: 'instant50', code: '8101', players: 52, max: 60, ping: 51, status: 'busy' },
  { id: 'duel-8110', modeId: 'duel', code: '8110', players: 2, max: 2, ping: 24, status: 'busy' },
  { id: 'duel-8111', modeId: 'duel', code: '8111', players: 1, max: 2, ping: 29, status: 'open' },
  { id: 'power-8120', modeId: 'powers', code: '8120', players: 12, max: 24, ping: 33, status: 'open' },
  { id: 'power-8121', modeId: 'powers', code: '8121', players: 20, max: 24, ping: 45, status: 'busy' },
];

export const radiusFromMass = (m) => Math.sqrt(m) * 9;
export const speedFromMass = (m) => 365 * Math.pow(Math.max(1, m) / START_MASS, -0.225);
export const mergeDelay = (m) => Math.min(42, 10 + Math.sqrt(Math.max(1, m)) * 0.38);

export const findMode = (id) => GAME_MODES.find((mode) => mode.id === id) || GAME_MODES[0];
export const findRoom = (id) => SERVER_ROOMS.find((room) => room.id === id) || SERVER_ROOMS[0];