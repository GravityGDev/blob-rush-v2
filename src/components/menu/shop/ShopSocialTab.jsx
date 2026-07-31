import { SHOP_EMOJIS, SHOP_EMOTES } from '@/game/skins';

// Emoji / emote shop grid, matching the original social shop cards.
export default function ShopSocialTab({ profile, category, onBuy, onFavorite }) {
  const favorites = profile.favoriteSocial || [];
  const cards = [];

  const push = (items, kind, owned) => items.forEach((item) => {
    const isOwned = owned.includes(item.id);
    const favourite = favorites.includes(`${kind}:${item.id}`);
    if (category === 'favourites' && !favourite) return;
    cards.push(
      <article key={`${kind}:${item.id}`} className={`social-shop-card${isOwned ? ' owned' : ''}${favourite ? ' favourite' : ''}`}>
        {isOwned && (
          <button className={`social-favourite-btn${favourite ? ' active' : ''}`} aria-pressed={favourite} onClick={() => onFavorite(kind, item.id)}>
            {favourite ? '★' : '☆'}
          </button>
        )}
        <div className={`social-shop-icon${kind === 'emote' ? ' emote' : ''}`}>{item.icon}</div>
        <h3>{item.name}</h3>
        <p>{item.description}</p>
        <button className="social-shop-buy" disabled={isOwned} onClick={() => onBuy(kind, item.id)}>
          {isOwned ? 'Owned' : item.price === 0 ? 'Claim free' : `🪙 ${item.price}`}
        </button>
      </article>
    );
  });

  if (category === 'all' || category === 'emoji' || category === 'favourites') push(SHOP_EMOJIS, 'emoji', profile.ownedEmojis || []);
  if (category === 'all' || category === 'emote' || category === 'favourites') push(SHOP_EMOTES, 'emote', profile.ownedEmotes || []);

  if (!cards.length) {
    return <div className="skin-empty-state">No favourites yet. Buy an emoji or emote, then tap its star.</div>;
  }
  return <div className="social-shop-grid">{cards}</div>;
}