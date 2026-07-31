import { useState } from 'react';
import { SHOP_EMOJIS, SHOP_EMOTES } from '@/game/skins';
import { playSfx } from '@/game/audio';

const SLOT_ANGLES = [150, 190, 230, 270, 310, 350, 390];
const PAGE_SIZE = 7;

function ownedItems(profile) {
  const emojis = new Set(profile.ownedEmojis?.length ? profile.ownedEmojis : ['smile']);
  const emotes = new Set(profile.ownedEmotes?.length ? profile.ownedEmotes : ['bounce']);
  const favourites = new Set(profile.favoriteSocial || []);
  return [
    ...SHOP_EMOJIS.filter((i) => emojis.has(i.id)).map((i) => ({ ...i, kind: 'emoji' })),
    ...SHOP_EMOTES.filter((i) => emotes.has(i.id)).map((i) => ({ ...i, kind: 'emote' })),
  ]
    .map((item, index) => ({ ...item, favourite: favourites.has(`${item.kind}:${item.id}`), originalIndex: index }))
    .sort((a, b) => Number(b.favourite) - Number(a.favourite) || a.originalIndex - b.originalIndex);
}

// Radial social wheel — same slot angles, paging and favourite stars as the original.
export default function EmojiWheel({ profile, onEmoji, onEmote, onClose }) {
  const [page, setPage] = useState(0);
  const all = ownedItems(profile);
  const pages = Math.max(1, Math.ceil(all.length / PAGE_SIZE));
  const current = ((page % pages) + pages) % pages;
  const items = all.slice(current * PAGE_SIZE, current * PAGE_SIZE + PAGE_SIZE);
  const offset = Math.max(0, Math.floor((SLOT_ANGLES.length - items.length) / 2));

  const trigger = (item) => {
    if (item.kind === 'emoji') onEmoji(item.id); else onEmote(item.id);
    playSfx('reward');
    onClose();
  };

  return (
    <div className="emoji-wheel-overlay open" onPointerDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="emoji-wheel-ring">
        <div>
          {items.map((item, index) => {
            const angle = (SLOT_ANGLES[index + offset] * Math.PI) / 180;
            return (
              <button
                key={`${item.kind}:${item.id}`}
                className="emoji-wheel-item"
                style={{ left: `${50 + Math.cos(angle) * 39}%`, top: `${50 + Math.sin(angle) * 39}%`, '--wheel-delay': `${index * 34}ms` }}
                onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); trigger(item); }}
              >
                <span>{item.icon}</span>
                {item.favourite && <i className="emoji-wheel-favourite">★</i>}
                <small>{item.name}</small>
              </button>
            );
          })}
        </div>
        <button className="emoji-wheel-centre" onPointerDown={(e) => { e.preventDefault(); onClose(); }}>✕</button>
        <div className="emoji-wheel-page">
          <button id="emojiWheelPrev" style={{ visibility: pages > 1 ? '' : 'hidden' }} onPointerDown={(e) => { e.preventDefault(); setPage(current - 1); }}>‹</button>
          <button id="emojiWheelNext" style={{ visibility: pages > 1 ? '' : 'hidden' }} onPointerDown={(e) => { e.preventDefault(); setPage(current + 1); }}>›</button>
        </div>
      </div>
    </div>
  );
}