// Shared skin presentation helpers used by the menu modals (ported from the HTML build).
export function rarityColor(rarity) {
  return {
    Common: 'linear-gradient(90deg,#64748b,#94a3b8)',
    Rare: 'linear-gradient(90deg,#0ea5e9,#38bdf8)',
    Epic: 'linear-gradient(90deg,#7c3aed,#a855f7)',
    Legendary: 'linear-gradient(90deg,#f59e0b,#fbbf24)',
    Mythic: 'linear-gradient(90deg,#ec4899,#f472b6)',
    Transcendent: 'linear-gradient(90deg,#fbbf24,#8b5cf6)',
    VIP: 'linear-gradient(90deg,#9333ea,#22d3ee)',
  }[rarity] || 'linear-gradient(90deg,#64748b,#94a3b8)';
}

export function skinBackground(skin) {
  if (skin.pattern === 'custom' && skin.imageData) return `center/cover no-repeat url(${skin.imageData})`;
  if (skin.pattern === 'rainbow') return 'linear-gradient(90deg,#f87171,#fbbf24,#4ade80,#38bdf8,#a855f7,#f472b6)';
  if (skin.animated) return `linear-gradient(120deg, ${skin.base}, ${skin.accent}, ${skin.base})`;
  return `radial-gradient(circle at 34% 30%, ${skin.accent}, ${skin.base})`;
}

export function skinPreviewClass(skin) {
  if (skin.pattern === 'rainbow') return 'animated-rainbow';
  return skin.animated ? 'animated-preview' : '';
}

export function getSkinCategory(skin) {
  if (skin.category === 'vip' || skin.pattern === 'custom') return 'vip';
  if (skin.category === 'creators') return 'creators';
  return skin.animated ? 'premium' : 'free';
}

export function isSkinOwned(profile, id) {
  return (profile.ownedSkins || []).includes(id);
}

export function filterSkins(profile, skins, filter) {
  if (filter === 'owned') return skins.filter((skin) => isSkinOwned(profile, skin.id));
  if (filter === 'premium') return skins.filter((skin) => getSkinCategory(skin) === 'premium');
  if (filter === 'free') return skins.filter((skin) => getSkinCategory(skin) === 'free');
  if (filter === 'vip') return skins.filter((skin) => getSkinCategory(skin) === 'vip');
  if (filter === 'creators') return skins.filter((skin) => getSkinCategory(skin) === 'creators');
  return skins;
}

export function categoryIntro(filter) {
  return {
    owned: 'Skins you already own',
    premium: 'Premium animated skins',
    free: 'Free static skins',
    creators: 'Creator skins',
    vip: 'Your uploaded VIP skins',
  }[filter] || 'Skins';
}