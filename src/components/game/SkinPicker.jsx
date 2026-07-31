import { SKINS } from '@/game/skins';

export default function SkinPicker({ owned = [], value, onChange }) {
  const list = SKINS.filter((skin) => owned.includes(skin.id));
  return (
    <div className="grid grid-cols-6 gap-2 max-h-40 overflow-y-auto pr-1">
      {list.map((skin) => (
        <button
          key={skin.id}
          type="button"
          title={skin.name}
          onClick={() => onChange(skin.id)}
          className={`aspect-square rounded-full ring-2 transition ${value === skin.id ? 'ring-emerald-400 scale-105' : 'ring-white/15 hover:ring-white/40'}`}
          style={{ background: `radial-gradient(circle at 35% 30%, ${skin.accent}, ${skin.base})` }}
        />
      ))}
    </div>
  );
}