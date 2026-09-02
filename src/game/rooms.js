// Game modes are always discoverable in the Connect UI. Their server/player
// counts come exclusively from the master server's live registry.
export const GAME_MODES = [
  { id: 'powers', name: 'Super Powers', icon: '💥', description: 'Special abilities and chaotic battles.', featured: true },
  { id: 'duel', name: '1v1', icon: '⚔️', description: 'A private head-to-head arena.' },
  { id: 'ffa', name: 'Free For All', icon: '☠️', description: 'Classic every-blob-for-itself action.' },
  { id: 'instant22', name: 'Instant 22K', icon: '🔮', description: 'Spawn instantly with 22,000 mass.' },
  { id: 'instant50', name: 'Instant 50K', icon: '◉', description: 'Spawn huge with 50,000 mass.' },
];

export const ROOMS = [
  { id: 'ffa-8080', modeId: 'ffa', label: '#8080', region: 'EU West', players: 0, capacity: 60 },
];

export const findMode = (id) => GAME_MODES.find((mode) => mode.id === id) || GAME_MODES.find((mode) => mode.id === 'ffa');
export const findRoom = (id) => ROOMS.find((room) => room.id === id) || { id, modeId: 'ffa', label: `#${String(id || '8080').split('-').pop()}`, region: 'Online', players: 0, capacity: 60 };
export const roomsForMode = (modeId) => ROOMS.filter((room) => room.modeId === modeId);
