// Boosters, season pass and lucky rewards — helpers that mutate a profile.
import { SHOP_COSMETICS, getDefaultCosmeticTransform } from './skins';
import { DEFAULTS } from './save';

export function boosterRemainingMs(profileNow, id) {
  return Math.max(0, Number(profileNow?.boosters?.[id] || 0) - Date.now());
}
export function boosterActive(profileNow, id) {
  return boosterRemainingMs(profileNow, id) > 0;
}
export function extendBooster(profileNow, id, hours) {
  const now = Date.now();
  const current = Math.max(now, Number(profileNow?.boosters?.[id] || 0));
  profileNow.boosters[id] = current + hours * 60 * 60 * 1000;
}
export function formatDurationShort(ms) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export const SEASON_TIERS = Array.from({ length: 12 }, (_, i) => ({
  tier: i + 1,
  required: (i + 1) * 300,
  freeTokens: [1,1,2,1,2,1,2,2,2,3,3,5][i],
  vipTokens: [2,2,3,2,3,3,3,4,4,5,5,8][i],
}));
export const WHEEL_REWARDS = [
  { label:'100 Coins', short:'100', type:'coins', amount:100, color:'#0ea5e9' },
  { label:'1h XP Boost', short:'XP 1h', type:'boost', boost:'xp', hours:1, color:'#8b5cf6' },
  { label:'250 Coins', short:'250', type:'coins', amount:250, color:'#22c55e' },
  { label:'1h Mass Boost', short:'Mass 1h', type:'boost', boost:'mass', hours:1, color:'#f97316' },
  { label:'500 Coins', short:'500', type:'coins', amount:500, color:'#ec4899' },
  { label:'Random Cosmetic', short:'Cosmetic', type:'cosmetic', color:'#14b8a6' },
  { label:'150 Coins', short:'150', type:'coins', amount:150, color:'#eab308' },
  { label:'1000 Coin Jackpot', short:'1000', type:'coins', amount:1000, color:'#ef4444' },
];
export const SLOT_SYMBOLS = ['🪙','⭐','🟢','💎','7️⃣'];

export function seasonUnlockedTier(profileNow) {
  return Math.min(SEASON_TIERS.length, Math.floor(Math.max(0, Number(profileNow?.seasonPass?.points || 0)) / 300));
}
export function addSeasonProgress(profileNow, amount) {
  profileNow.seasonPass = { ...DEFAULTS.seasonPass, ...(profileNow.seasonPass || {}) };
  profileNow.seasonPass.points = Math.max(0, Number(profileNow.seasonPass.points || 0)) + Math.max(0, Math.round(amount));
}
export function applyLuckyReward(profileNow, reward) {
  if (reward.type === 'coins') {
    profileNow.coins += reward.amount;
    return `${reward.amount} coins`;
  }
  if (reward.type === 'boost') {
    extendBooster(profileNow, reward.boost, reward.hours);
    return `${reward.hours}h ${reward.boost === 'xp' ? 'XP' : 'Mass'} Booster`;
  }
  if (reward.type === 'cosmetic') {
    const unowned = SHOP_COSMETICS.filter((item) => !profileNow.ownedCosmetics.includes(item.id));
    if (!unowned.length) { profileNow.coins += 600; return '600 coins (all cosmetics owned)'; }
    const item = unowned[Math.floor(Math.random() * unowned.length)];
    profileNow.ownedCosmetics.push(item.id);
    profileNow.cosmeticTransforms[item.id] = getDefaultCosmeticTransform(item);
    return item.name;
  }
  return 'Reward';
}
export function spendTokens(profileNow, amount) {
  const current = Math.max(0, Number(profileNow.tokens || 0));
  if (current < amount) return false;
  profileNow.tokens = current - amount;
  return true;
}