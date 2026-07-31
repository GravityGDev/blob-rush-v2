// Arena modes and rooms shown in the server browser.
export const GAME_MODES = [
  { id: 'ffa', name: 'Free For All', icon: '⚔️', description: 'Classic every-blob-for-itself arena.' },
  { id: 'teams', name: 'Teams', icon: '🛡️', description: 'Three colour teams fight for the map.' },
  { id: 'mega', name: 'Mega Split', icon: '💥', description: 'Faster mass, bigger splits, shorter rounds.' },
  { id: 'experimental', name: 'Experimental', icon: '🧪', description: 'New mechanics tested before release.' },
];

export const ROOMS = [
  { id: 'ffa-8080', modeId: 'ffa', label: '#8080', region: 'EU West', players: 18, capacity: 35 },
  { id: 'ffa-8081', modeId: 'ffa', label: '#8081', region: 'EU West', players: 27, capacity: 35 },
  { id: 'ffa-9090', modeId: 'ffa', label: '#9090', region: 'US East', players: 12, capacity: 35 },
  { id: 'teams-2020', modeId: 'teams', label: '#2020', region: 'EU West', players: 22, capacity: 40 },
  { id: 'teams-2021', modeId: 'teams', label: '#2021', region: 'US East', players: 9, capacity: 40 },
  { id: 'mega-3030', modeId: 'mega', label: '#3030', region: 'EU West', players: 15, capacity: 30 },
  { id: 'mega-3031', modeId: 'mega', label: '#3031', region: 'Asia', players: 6, capacity: 30 },
  { id: 'exp-4040', modeId: 'experimental', label: '#4040', region: 'EU West', players: 4, capacity: 25 },
];

export const findMode = (id) => GAME_MODES.find((m) => m.id === id) || GAME_MODES[0];
export const findRoom = (id) => ROOMS.find((r) => r.id === id) || ROOMS[0];
export const roomsForMode = (modeId) => ROOMS.filter((r) => r.modeId === modeId);