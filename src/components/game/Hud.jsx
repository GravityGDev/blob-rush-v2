import Leaderboard from './Leaderboard';
import MiniMap from './MiniMap';

export default function Hud({ stats }) {
  return (
    <>
      <div className="pointer-events-none absolute top-3 left-3 flex gap-2 text-slate-100">
        <div className="rounded-xl bg-slate-950/70 backdrop-blur px-3 py-2 ring-1 ring-white/10">
          <div className="text-[10px] uppercase tracking-widest text-slate-400">Mass</div>
          <div className="text-xl font-black tabular-nums">{stats.mass}</div>
        </div>
        <div className="rounded-xl bg-slate-950/70 backdrop-blur px-3 py-2 ring-1 ring-white/10">
          <div className="text-[10px] uppercase tracking-widest text-slate-400">Rank</div>
          <div className="text-xl font-black tabular-nums">#{stats.rank}</div>
        </div>
        <div className="rounded-xl bg-slate-950/70 backdrop-blur px-3 py-2 ring-1 ring-white/10">
          <div className="text-[10px] uppercase tracking-widest text-slate-400">Kills</div>
          <div className="text-xl font-black tabular-nums">{stats.kills}</div>
        </div>
      </div>

      <div className="pointer-events-none absolute top-3 right-3">
        <Leaderboard entries={stats.leaderboard} />
      </div>

      <div className="pointer-events-none absolute bottom-3 right-3">
        <MiniMap pos={stats.playerPos} />
      </div>
    </>
  );
}