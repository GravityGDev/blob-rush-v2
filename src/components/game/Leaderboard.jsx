export default function Leaderboard({ entries = [] }) {
  return (
    <div className="w-44 rounded-xl bg-slate-950/70 backdrop-blur px-3 py-2 text-slate-100 shadow-lg ring-1 ring-white/10">
      <div className="text-[11px] font-bold uppercase tracking-widest text-sky-300 mb-1">Leaderboard</div>
      <ol className="space-y-0.5 text-xs">
        {entries.map((entry, i) => (
          <li key={entry.id} className={`flex justify-between gap-2 ${entry.isPlayer ? 'text-emerald-300 font-bold' : 'text-slate-200'}`}>
            <span className="truncate">{i + 1}. {entry.name}</span>
            <span className="tabular-nums opacity-80">{Math.round(entry.mass)}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}