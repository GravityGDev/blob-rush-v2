import { useState } from 'react';
import { SHOP_EMOJIS, SHOP_EMOTES } from '@/game/skins';

// In-game reaction wheel — favourites first, exactly like the HTML build.
export default function EmojiWheel({ profile, onEmoji, onEmote, onClose }) {
  const [tab, setTab] = useState('emoji');
  const favs = profile.favoriteSocial || [];
  const sort = (list, kind) => [...list].sort((a, b) => (favs.includes(`${kind}:${b.id}`) ? 1 : 0) - (favs.includes(`${kind}:${a.id}`) ? 1 : 0));
  const emojis = sort(SHOP_EMOJIS.filter((e) => profile.ownedEmojis.includes(e.id)), 'emoji');
  const emotes = sort(SHOP_EMOTES.filter((e) => profile.ownedEmotes.includes(e.id)), 'emote');
  const items = tab === 'emoji' ? emojis : emotes;

  return (
    <div className="emoji-wheel-backdrop" onClick={onClose}>
      <div className="emoji-wheel" onClick={(e) => e.stopPropagation()}>
        <div className="emoji-wheel-tabs">
          <button className={tab === 'emoji' ? 'active' : ''} onClick={() => setTab('emoji')}>Emojis</button>
          <button className={tab === 'emote' ? 'active' : ''} onClick={() => setTab('emote')}>Emotes</button>
        </div>
        <div className="emoji-wheel-grid">
          {items.map((item) => (
            <button
              key={item.id}
              className="emoji-wheel-item"
              onClick={() => { tab === 'emoji' ? onEmoji(item.id) : onEmote(item.id); onClose(); }}
            >
              <span>{item.icon}</span>
              <small>{item.name}</small>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}