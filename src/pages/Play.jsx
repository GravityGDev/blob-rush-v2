import { useCallback, useEffect, useRef, useState } from 'react';
import { createSession } from '@/game/loop';
import { loadProfile, saveProfile, addXp } from '@/game/save';
import { state } from '@/game/state';
import { START_MASS } from '@/game/constants';
import MainMenu from '@/components/game/MainMenu';
import Hud from '@/components/game/Hud';
import GameOver from '@/components/game/GameOver';

const EMPTY_STATS = { mass: 0, cells: 1, kills: 0, rank: 1, leaderboard: [], alive: true, playerPos: null, blobs: 0 };

export default function Play() {
  const canvasRef = useRef(null);
  const sessionRef = useRef(null);
  const [profile, setProfile] = useState(() => loadProfile());
  const [screen, setScreen] = useState('menu');
  const [stats, setStats] = useState(EMPTY_STATS);
  const [summary, setSummary] = useState(null);

  const updateProfile = useCallback((next) => {
    setProfile(next);
    saveProfile(next);
  }, []);

  const endGame = useCallback((finalStats) => {
    const session = sessionRef.current;
    sessionRef.current = null;
    session?.destroy();

    const maxMass = Math.round(state.stats.maxMass);
    const xp = Math.max(10, Math.round(maxMass / 12) + finalStats.kills * 25);
    const coins = Math.max(5, Math.round(maxMass / 40) + finalStats.kills * 10);
    const next = loadProfile();
    next.coins += coins;
    addXp(next, xp);
    next.stats.games += 1;
    next.stats.highestMass = Math.max(next.stats.highestMass, maxMass);
    next.stats.cellsEaten += finalStats.kills;
    saveProfile(next);
    setProfile(loadProfile());
    setSummary({ maxMass, kills: finalStats.kills, bestRank: state.stats.bestRank, xp, coins });
    setScreen('over');
  }, []);

  const handleStats = useCallback((next) => {
    setStats(next);
    if (!next.alive) endGame(next);
  }, [endGame]);

  const startGame = useCallback(() => {
    state.stats = { maxMass: START_MASS, lastMass: START_MASS, bestRank: 99 };
    setStats(EMPTY_STATS);
    setSummary(null);
    setScreen('playing');
  }, []);

  useEffect(() => {
    if (screen !== 'playing' || !canvasRef.current) return;
    const session = createSession(canvasRef.current, loadProfile(), handleStats);
    sessionRef.current = session;
    return () => {
      session.destroy();
      if (sessionRef.current === session) sessionRef.current = null;
    };
  }, [screen, handleStats]);

  useEffect(() => () => sessionRef.current?.destroy(), []);

  return (
    <div className="fixed inset-0 overflow-hidden bg-slate-950 select-none">
      <canvas ref={canvasRef} className="h-full w-full block touch-none" />

      {screen === 'playing' && <Hud stats={stats} />}

      {screen === 'playing' && (
        <div className="absolute bottom-3 left-3 flex gap-2 md:hidden">
          <button
            onClick={() => sessionRef.current?.split()}
            className="h-14 w-14 rounded-full bg-emerald-500/85 text-slate-950 font-black shadow-lg active:scale-95"
          >
            Split
          </button>
          <button
            onClick={() => sessionRef.current?.eject()}
            className="h-14 w-14 rounded-full bg-sky-500/85 text-slate-950 font-black shadow-lg active:scale-95"
          >
            Feed
          </button>
        </div>
      )}

      {screen === 'menu' && (
        <MainMenu profile={profile} onProfileChange={updateProfile} onStart={startGame} />
      )}

      {screen === 'over' && summary && (
        <GameOver summary={summary} onPlayAgain={startGame} onMenu={() => setScreen('menu')} />
      )}
    </div>
  );
}