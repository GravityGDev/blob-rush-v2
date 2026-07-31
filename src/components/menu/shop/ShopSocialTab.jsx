import { SHOP_EMOJIS, SHOP_EMOTES } from '@/game/skins';

function SocialGrid({ kind, items, owned, favorites, coins, onBuy, onFavorite }) {
  return (
    <div className="shop-grid tiny">
      {items.map((item) => {
        const isOwned = owned.includes(item.id);
        const fav = favorites.includes(`${kind}:${item.id}`);
        return (
          <div key={item.id} className={`shop-item${isOwned ? ' owned' : ''}`}>
            <span className="icon">{item.icon}</span>
            <h4 style={{ fontSize: 13 }}>{item.name}</h4>
            <p style={{ fontSize: 11 }}>{item.description}</p>
            {isOwned ? (
              <button className={`buy-btn${fav ? ' equipped' : ' secondary'}`} onClick={() => onFavorite(kind, item.id)}>
                {fav ? '★ On wheel' : '☆ Add to wheel'}
              </button>
            ) : (
              <div className="row">
                <span className="price-tag">🪙 {item.price}</span>
                <button className="buy-btn" disabled={coins < item.price} onClick={() => onBuy(kind, item.id)}>Buy</button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function ShopSocialTab({ profile, onBuy, onFavorite }) {
  return (
    <>
      <h3 style={{ margin: '0 0 10px', fontSize: 16 }}>Emojis</h3>
      <SocialGrid kind="emoji" items={SHOP_EMOJIS} owned={profile.ownedEmojis} favorites={profile.favoriteSocial} coins={profile.coins} onBuy={onBuy} onFavorite={onFavorite} />
      <h3 style={{ margin: '22px 0 10px', fontSize: 16 }}>Emotes</h3>
      <SocialGrid kind="emote" items={SHOP_EMOTES} owned={profile.ownedEmotes} favorites={profile.favoriteSocial} coins={profile.coins} onBuy={onBuy} onFavorite={onFavorite} />
    </>
  );
}