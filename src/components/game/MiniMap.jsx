import { WORLD_SIZE } from '@/game/constants';

export default function MiniMap({ pos }) {
  const x = pos ? (pos.x / WORLD_SIZE) * 100 : 50;
  const y = pos ? (pos.y / WORLD_SIZE) * 100 : 50;
  return (
    <div className="relative h-28 w-28 rounded-xl bg-slate-950/70 backdrop-blur ring-1 ring-white/10 overflow-hidden">
      <div className="absolute inset-0 grid grid-cols-5 grid-rows-5">
        {Array.from({ length: 25 }).map((_, i) => (
          <div key={i} className="border border-white/5" />
        ))}
      </div>
      <div
        className="absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-400 shadow-[0_0_8px_2px_rgba(74,222,128,0.7)]"
        style={{ left: `${x}%`, top: `${y}%` }}
      />
    </div>
  );
}