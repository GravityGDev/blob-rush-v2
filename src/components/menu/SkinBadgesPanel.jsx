import { PLAYER_BADGES, badgePreviewSvg } from '@/game/skins';

// Badge picker from the original skins menu.
export default function SkinBadgesPanel({ profile, onProfile }) {
  const equip = (id) => onProfile({ ...profile, equippedBadge: id });

  return (
    <div className="badges-grid">
      <button type="button" className={`badge-card none-card${!profile.equippedBadge ? ' active' : ''}`} onClick={() => equip(null)}>
        <span className="badge-preview-icon">🚫</span>
        <span className="badge-card-name">No badge</span>
        <span className="badge-card-note">Play without a nameplate badge.</span>
      </button>
      {PLAYER_BADGES.map((badge) => (
        <button
          key={badge.id}
          type="button"
          className={`badge-card${profile.equippedBadge === badge.id ? ' active' : ''}`}
          onClick={() => equip(badge.id)}
        >
          <span className="badge-preview-icon" dangerouslySetInnerHTML={{ __html: badgePreviewSvg(badge) }} />
          <span className="badge-card-name">{badge.name}</span>
          <span className="badge-card-note">{badge.note || 'Shown next to your name in game.'}</span>
        </button>
      ))}
      <div className="badge-exclusive-note">Exclusive badges are granted by the Blob Rush team and cannot be bought.</div>
    </div>
  );
}