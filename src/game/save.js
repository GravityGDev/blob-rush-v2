// Profile persistence (localStorage with in-memory fallback) and XP levelling.
import { cloneProfile } from './utils';
import {
  FREE_SKIN_IDS, findShopSingleSkin, findCosmetic, findBadge,
  findShopEmoji, findShopEmote, getDefaultCosmeticTransform, setRuntimeCustomSkins,
} from './skins';

const KEY = 'blobrush_save_v1';

export const DEFAULT_TOUCH_LAYOUT = {
  joystick: { x:0.16, y:0.74, size:1, visible:true },
  split: { x:0.89, y:0.66, size:1, visible:true },
  split2: { x:0.79, y:0.68, size:0.92, visible:true },
  split4: { x:0.70, y:0.72, size:0.92, visible:true },
  feed: { x:0.89, y:0.86, size:1, visible:true },
  normalFeed: { x:0.78, y:0.87, size:0.96, visible:true },
  stats: { x:0.39, y:0.073, size:1, visible:true },
  hudGroup: { x:0.80, y:0.073, size:1, visible:true },
  emoji: { x:0.50, y:0.92, size:1, visible:true },
};
export const DEFAULT_TOUCH_SETTINGS = {
  showButtons:true,
  invertButtons:false,
  dynamicButtons:true,
  stopOnRelease:true,
  directionOnTouch:false,
  joystickSize:1,
  joystickSensitivity:1,
  layout:DEFAULT_TOUCH_LAYOUT,
};

export const DEFAULTS = {
  nickname: '',
  skin: 'aqua',
  coins: 1800,
  xp: 0,
  level: 1,
  shopVersion: 2,
  rewardsVersion: 1,
  netVersion: 1,
  tokens: 0,
  seasonPass: { season: 1, points: 0, vip: false, claimedFree: [], claimedVip: [] },
  luckyStats: { wheelSpins: 0, slotSpins: 0, cardFlips: 0, jackpots: 0 },
  ownedSkins: [...FREE_SKIN_IDS],
  purchasedPacks: [],
  purchasedSkins: [],
  redeemedCodes: [],
  boosters: { mass: 0, xp: 0 },
  ownedCosmetics: [],
  equippedCosmetics: { hat: null, overlay: null },
  cosmeticTransforms: {},
  ownedBadges: ['moderator','admin','vip','youtube','tiktok','booster'],
  equippedBadge: null,
  ownedEmojis: ['smile','laugh'],
  ownedEmotes: ['bounce'],
  favoriteSocial: [],
  seasonCoinsPicked: 0,
  customSkins: [],
  room: { modeId: 'ffa', roomId: 'ffa-8080' },
  stats: { games: 0, highestMass: 0, timePlayed: 0, wins: 0, cellsEaten: 0 },
  settings: { serverUrl: '', onlineEnabled: true, sfx: 0.8, music: 0.5, joystick: 1, quality: 'high', macroSpeed: 50, macroMultiplier: 4, cameraZoom: 100, animationDelay: 150, fixedCameraZoom: false, showFps:true, showReticle:true, showStatsBar:true, showMiniMap:true, showRecordButton:true, showCosmetics:true, showGlows:true, animateSkins:true, touch:DEFAULT_TOUCH_SETTINGS },
};

let memoryProfile = null;

export function mergeProfile(p) {
  const customSkins = Array.isArray(p?.customSkins) ? p.customSkins.filter((skin) => skin?.id && skin?.imageData) : [];
  setRuntimeCustomSkins(cloneProfile(customSkins));
  const purchasedSkins = Array.isArray(p?.purchasedSkins) ? p.purchasedSkins.filter((id) => !!findShopSingleSkin(id)) : [];
  // Legacy pack-owned skins stay owned now that every animated skin is sold individually.
  const legacyOwned = Array.isArray(p?.ownedSkins) ? p.ownedSkins.filter((id) => !!findShopSingleSkin(id)) : [];
  const allOwned = [...new Set([...FREE_SKIN_IDS, ...legacyOwned, ...purchasedSkins, ...customSkins.map((skin) => skin.id)])];
  const selectedSkin = allOwned.includes(p?.skin) ? p.skin : DEFAULTS.skin;
  const ownedCosmetics = Array.isArray(p?.ownedCosmetics) ? p.ownedCosmetics.filter((id) => !!findCosmetic(id)) : [];
  const equippedCosmetics = { ...DEFAULTS.equippedCosmetics, ...(p?.equippedCosmetics || {}) };
  for (const slot of ['hat','overlay']) {
    if (!ownedCosmetics.includes(equippedCosmetics[slot])) equippedCosmetics[slot] = null;
  }
  const ownedBadges = [...new Set([...(Array.isArray(p?.ownedBadges) ? p.ownedBadges.filter((id) => !!findBadge(id)) : []), ...DEFAULTS.ownedBadges])];
  const equippedBadge = ownedBadges.includes(p?.equippedBadge) ? p.equippedBadge : null;
  const cosmeticTransforms = {};
  for (const id of ownedCosmetics) {
    const item = findCosmetic(id);
    cosmeticTransforms[id] = { ...getDefaultCosmeticTransform(item), ...(p?.cosmeticTransforms?.[id] || {}) };
  }
  const isLegacyProfile = p && p.shopVersion !== 2;
  const seasonPass = {
    ...DEFAULTS.seasonPass,
    ...(p?.seasonPass || {}),
    claimedFree: Array.isArray(p?.seasonPass?.claimedFree) ? [...new Set(p.seasonPass.claimedFree.map(Number))] : [],
    claimedVip: Array.isArray(p?.seasonPass?.claimedVip) ? [...new Set(p.seasonPass.claimedVip.map(Number))] : [],
  };
  const migratedTokens = p?.tokens === undefined ? Math.max(0, Math.floor(Number(p?.level || 1) / 3)) : Math.max(0, Number(p.tokens || 0));
  return {
    ...cloneProfile(DEFAULTS),
    ...p,
    shopVersion: 2,
    rewardsVersion: 1,
    netVersion: 1,
    tokens: migratedTokens,
    seasonPass,
    luckyStats: { ...DEFAULTS.luckyStats, ...(p?.luckyStats || {}) },
    coins: isLegacyProfile ? Math.max(Number(p?.coins || 0), 1800) : Math.max(0, Number(p?.coins ?? DEFAULTS.coins)),
    skin: selectedSkin,
    customSkins,
    purchasedSkins,
    redeemedCodes: Array.isArray(p?.redeemedCodes) ? [...new Set(p.redeemedCodes.map(String))] : [],
    ownedSkins: allOwned,
    boosters: {
      mass: Number(p?.boosters?.mass) > 1000000000000 ? Number(p.boosters.mass) : 0,
      xp: Number(p?.boosters?.xp) > 1000000000000 ? Number(p.boosters.xp) : 0,
    },
    ownedCosmetics,
    equippedCosmetics,
    cosmeticTransforms,
    ownedBadges,
    equippedBadge,
    ownedEmojis: [...new Set([...(Array.isArray(p?.ownedEmojis) ? p.ownedEmojis.filter(id => !!findShopEmoji(id)) : []), ...DEFAULTS.ownedEmojis])],
    ownedEmotes: [...new Set([...(Array.isArray(p?.ownedEmotes) ? p.ownedEmotes.filter(id => !!findShopEmote(id)) : []), ...DEFAULTS.ownedEmotes])],
    favoriteSocial: [...new Set((Array.isArray(p?.favoriteSocial) ? p.favoriteSocial : []).filter((key) => {
      const [kind,id] = String(key).split(':');
      return kind === 'emoji' ? !!findShopEmoji(id) : kind === 'emote' ? !!findShopEmote(id) : false;
    }))],
    seasonCoinsPicked: Math.max(0, Number(p?.seasonCoinsPicked || 0)),
    room: { ...DEFAULTS.room, ...(p?.room || {}) },
    stats: { ...DEFAULTS.stats, ...(p?.stats || {}) },
    settings: {
      ...DEFAULTS.settings,
      ...(p?.settings || {}),
      // Online play is now the default; flip legacy profiles saved before that change.
      onlineEnabled: p?.netVersion === 1 ? p?.settings?.onlineEnabled !== false : true,
      touch: {
        ...DEFAULT_TOUCH_SETTINGS,
        ...(p?.settings?.touch || {}),
        joystickSize: Number(p?.settings?.touch?.joystickSize ?? p?.settings?.joystick ?? 1),
        layout: {
          ...cloneProfile(DEFAULT_TOUCH_LAYOUT),
          ...(p?.settings?.touch?.layout || {}),
        },
      },
    },
  };
}

export function loadProfile() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = mergeProfile(JSON.parse(raw));
      memoryProfile = cloneProfile(parsed);
      return parsed;
    }
  } catch {
    // Some embedded previews disable storage. The in-memory profile still works.
  }
  return memoryProfile ? cloneProfile(memoryProfile) : cloneProfile(DEFAULTS);
}

export function saveProfile(p) {
  memoryProfile = cloneProfile(mergeProfile(p));
  try {
    localStorage.setItem(KEY, JSON.stringify(memoryProfile));
  } catch {
    // Keep playing with in-memory saves when storage is unavailable.
  }
}

export const xpForLevel = (lvl) => Math.round(80 * Math.pow(lvl, 1.35));

export function addXp(profile, amount) {
  profile.xp += amount;
  let levelsGained = 0;
  let tokensGained = 0;
  while (profile.xp >= xpForLevel(profile.level)) {
    profile.xp -= xpForLevel(profile.level);
    profile.level += 1;
    profile.coins += 100;
    const tokenReward = profile.level % 5 === 0 ? 3 : 1;
    profile.tokens = Math.max(0, Number(profile.tokens || 0)) + tokenReward;
    tokensGained += tokenReward;
    levelsGained += 1;
  }
  return { levelsGained, tokensGained };
}