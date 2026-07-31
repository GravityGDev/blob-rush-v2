// Pure purchase / equip helpers for the shop. Each returns { profile, message, ok }.
import { cloneProfile } from './utils';
import {
  findShopSingleSkin, findCosmetic, findBadge, findShopEmoji, findShopEmote,
  getDefaultCosmeticTransform, SHOP_REDEEM_CODES, SHOP_BOOSTERS,
} from './skins';
import { extendBooster } from './progression';

const fail = (profile, message) => ({ profile, message, ok: false });

function spend(next, cost) {
  if (next.coins < cost) return false;
  next.coins -= cost;
  return true;
}

export function buySingleSkin(profile, skinId) {
  const skin = findShopSingleSkin(skinId);
  if (!skin) return fail(profile, 'Unknown skin.');
  if (profile.ownedSkins.includes(skinId)) return fail(profile, 'You already own this skin.');
  const next = cloneProfile(profile);
  if (!spend(next, skin.price)) return fail(profile, 'Not enough coins.');
  next.purchasedSkins.push(skinId);
  next.ownedSkins.push(skinId);
  return { profile: next, message: `Unlocked ${skin.name}!`, ok: true };
}

export function buyCosmetic(profile, cosmeticId) {
  const item = findCosmetic(cosmeticId);
  if (!item) return fail(profile, 'Unknown cosmetic.');
  if (profile.ownedCosmetics.includes(cosmeticId)) return fail(profile, 'Already owned.');
  const next = cloneProfile(profile);
  if (!spend(next, item.price)) return fail(profile, 'Not enough coins.');
  next.ownedCosmetics.push(cosmeticId);
  next.cosmeticTransforms[cosmeticId] = getDefaultCosmeticTransform(item);
  return { profile: next, message: `Unlocked ${item.name}!`, ok: true };
}

export function equipCosmetic(profile, cosmeticId) {
  const item = findCosmetic(cosmeticId);
  if (!item || !profile.ownedCosmetics.includes(cosmeticId)) return fail(profile, 'You do not own this yet.');
  const next = cloneProfile(profile);
  const equipped = next.equippedCosmetics[item.slot] === cosmeticId;
  next.equippedCosmetics[item.slot] = equipped ? null : cosmeticId;
  return { profile: next, message: equipped ? `${item.name} unequipped.` : `${item.name} equipped.`, ok: true };
}

export function equipBadge(profile, badgeId) {
  const badge = findBadge(badgeId);
  if (badgeId && !badge) return fail(profile, 'Unknown badge.');
  const next = cloneProfile(profile);
  next.equippedBadge = next.equippedBadge === badgeId ? null : badgeId;
  return { profile: next, message: next.equippedBadge ? `${badge.name} badge equipped.` : 'Badge removed.', ok: true };
}

export function buySocial(profile, kind, id) {
  const item = kind === 'emoji' ? findShopEmoji(id) : findShopEmote(id);
  if (!item) return fail(profile, 'Unknown item.');
  const list = kind === 'emoji' ? 'ownedEmojis' : 'ownedEmotes';
  if (profile[list].includes(id)) return fail(profile, 'Already owned.');
  const next = cloneProfile(profile);
  if (!spend(next, item.price)) return fail(profile, 'Not enough coins.');
  next[list].push(id);
  return { profile: next, message: `Unlocked ${item.name}!`, ok: true };
}

export function toggleFavoriteSocial(profile, kind, id) {
  const key = `${kind}:${id}`;
  const next = cloneProfile(profile);
  next.favoriteSocial = next.favoriteSocial.includes(key)
    ? next.favoriteSocial.filter((k) => k !== key)
    : [...next.favoriteSocial, key].slice(-8);
  return { profile: next, message: next.favoriteSocial.includes(key) ? 'Added to quick wheel.' : 'Removed from quick wheel.', ok: true };
}

export function buyBooster(profile, boosterId, hours) {
  const booster = SHOP_BOOSTERS.find((b) => b.id === boosterId);
  if (!booster) return fail(profile, 'Unknown booster.');
  const price = hours === 24 ? booster.price24h : booster.price6h;
  const next = cloneProfile(profile);
  if (!spend(next, price)) return fail(profile, 'Not enough coins.');
  extendBooster(next, boosterId, hours);
  return { profile: next, message: `${booster.name} extended by ${hours}h!`, ok: true };
}

export function redeemCode(profile, rawCode) {
  const code = String(rawCode || '').trim().toUpperCase();
  const reward = SHOP_REDEEM_CODES[code];
  if (!reward) return fail(profile, 'Invalid code.');
  if (profile.redeemedCodes.includes(code)) return fail(profile, 'Code already redeemed.');
  const next = cloneProfile(profile);
  next.redeemedCodes.push(code);
  if (reward.type === 'coins') next.coins += reward.amount;
  if (reward.type === 'boost') extendBooster(next, reward.boost, reward.hours);
  if (reward.type === 'cosmetic' && !next.ownedCosmetics.includes(reward.cosmeticId)) {
    next.ownedCosmetics.push(reward.cosmeticId);
    next.cosmeticTransforms[reward.cosmeticId] = getDefaultCosmeticTransform(findCosmetic(reward.cosmeticId));
  }
  return { profile: next, message: `Redeemed: ${reward.label}`, ok: true };
}