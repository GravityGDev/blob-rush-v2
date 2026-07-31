import { Button } from '@/components/ui/button';

export default function GameOver({ summary, onPlayAgain, onMenu }) {
  return (
    <div className="absolute inset-0 grid place-items-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-xs rounded-2xl bg-slate-900/90 p-6 text-center ring-1 ring-white/10 shadow-2xl">
        <h2 className="text-2xl font-black text-rose-300">You were eaten</h2>
        <div className="mt-4 grid grid-cols-3 gap-2 text-slate-100">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-slate-400">Best mass</div>
            <div className="text-lg font-black tabular-nums">{summary.maxMass}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-slate-400">Kills</div>
            <div className="text-lg font-black tabular-nums">{summary.kills}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-slate-400">Best rank</div>
            <div className="text-lg font-black tabular-nums">#{summary.bestRank}</div>
          </div>
        </div>
        <div className="mt-3 text-xs text-emerald-300">+{summary.xp} XP · +{summary.coins} coins</div>
        <div className="mt-5 space-y-2">
          <Button onClick={onPlayAgain} className="w-full font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950">Play again</Button>
          <Button onClick={onMenu} variant="ghost" className="w-full text-slate-300 hover:text-white hover:bg-white/10">Main menu</Button>
        </div>
      </div>
    </div>
  );
}