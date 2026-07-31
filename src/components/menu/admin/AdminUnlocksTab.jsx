import { INDIVIDUAL_SHOP_SKINS, SHOP_COSMETICS, PLAYER_BADGES, SHOP_EMOJIS, SHOP_EMOTES, getDefaultCosmeticTransform, findCosmetic } from '@/game/skins';

// Bulk unlock / lock of every purchasable collection.
export default function AdminUnlocksTab({ profile, onUnlock }) {
  const rows = [
    {
      icon: '🎨', title: 'Animated skins', have: profile.purchasedSkins.length, total: INDIVIDUAL_SHOP_SKINS.length,
      unlock: (p) => {
        p.purchasedSkins = INDIVIDUAL_SHOP_SKINS.map((s) => s.id);
        p.ownedSkins = [...new Set([...p.ownedSkins, ...p.purchasedSkins])];
      },
      lock: (p) => { p.purchasedSkins = []; },
      note: 'All animated skins unlocked.',
    },
    {
      icon: '🎩', title: 'Cosmetics', have: profile.ownedCosmetics.length, total: SHOP_COSMETICS.length,
      unlock: (p) => {
        p.ownedCosmetics = SHOP_COSMETICS.map((c) => c.id);
        for (const id of p.ownedCosmetics) {
          p.cosmeticTransforms[id] = p.cosmeticTransforms[id] || getDefaultCosmeticTransform(findCosmetic(id));
        }
      },
      lock: (p) => { p.ownedCosmetics = []; p.equippedCosmetics = { hat: null, overlay: null }; },
      note: 'All cosmetics unlocked.',
    },
    {
      icon: '🛡️', title: 'Badges', have: profile.ownedBadges.length, total: PLAYER_BADGES.length,
      unlock: (p) => { p.ownedBadges = PLAYER_BADGES.map((b) => b.id); },
      lock: (p) => { p.ownedBadges = []; p.equippedBadge = null; },
      note: 'All badges unlocked.',
    },
    {
      icon: '😀', title: 'Emojis', have: profile.ownedEmojis.length, total: SHOP_EMOJIS.length,
      unlock: (p) => { p.ownedEmojis = SHOP_EMOJIS.map((e) => e.id); },
      lock: (p) => { p.ownedEmojis = []; },
      note: 'All emojis unlocked.',
    },
    {
      icon: '💫', title: 'Emotes', have: profile.ownedEmotes.length, total: SHOP_EMOTES.length,
      unlock: (p) => { p.ownedEmotes = SHOP_EMOTES.map((e) => e.id); },
      lock: (p) => { p.ownedEmotes = []; p.favoriteSocial = []; },
      note: 'All emotes unlocked.',
    },
  ];

  return (
    <div className="shop-grid wide">
      {rows.map((r) => (
        <div className="shop-item" key={r.title}>
          <span className="icon">{r.icon}</span>
          <h4>{r.title}</h4>
          <p>{r.have} / {r.total} owned</p>
          <div className="admin-row-actions">
            <button className="buy-btn" onClick={() => onUnlock({ apply: r.unlock, note: r.note })}>Unlock all</button>
            <button className="buy-btn secondary" onClick={() => onUnlock({ apply: r.lock, note: `${r.title} cleared.` })}>Clear</button>
          </div>
        </div>
      ))}
    </div>
  );
}