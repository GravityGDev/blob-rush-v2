import { useEffect, useRef, useState } from 'react';
import '@/styles/blobrush-game.css';
import { createSession } from '@/game/loop';
import { state } from '@/game/state';
import HudStatsBar from './HudStatsBar';
import HudMiniMap from './HudMiniMap';
import HudLeaderboard from './HudLeaderboard';
import DeathPanel from './DeathPanel';

const EMPTY = { mass: 0, kills: 0, rank: 0, leaderboard: [], playerPos: null, fps: 60, alive: true };

export default function GameScreen({ profile, onExit, onMatchEnd }) {
  const canvasRef = useRef(null);
  const sessionRef = useRef(null);
  const startedAt = useRef(Date.now());
  const [stats, setStats] = useState(EMPTY);
  const [boardOpen, setBoardOpen] = useState(false);
  const [paused, setPaused] = useState(false);
  const [death, setDeath] = useState(null);

  useEffect(() => {
    state.stats = { maxMass: 0, lastMass: 0, bestRank: 99 };
    startedAt.current = Date.now();
    const session = createSession(canvasRef.current, profile, (next) => {
      setStats(next);
      if (!next.alive && !sessionRef.current?.ended) {
        sessionRef.current.ended = true;
        setDeath(onMatchEnd({
          finalMass: state.stats.lastMass,
          maxMass: state.stats.maxMass,
          bestRank: state.stats.bestRank,
          kills: next.kills,
          time: (Date.now() - startedAt.current) / 1000,
        }));
      }
    });
    sessionRef.current = session;
    return () => session.destroy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onKeyEsc = (e) => { if (e.code === 'Escape') setPaused((v) => !v); };
  useEffect(() => {
    window.addEventListener('keydown', onKeyEsc);
    return () => window.removeEventListener('keydown', onKeyEsc);
  }, []);

  const s = sessionRef.current;

  return (
    <section id="gameScreen" className="screen">
      <canvas id="gameCanvas" ref={canvasRef} />

      <HudStatsBar stats={{ ...stats, seasonCoins: profile.seasonCoinsPicked || 0 }} fps={stats.fps || 60} />

      <nav className="hud-top-actions" aria-label="Game HUD controls">
        <button className={`hud-square-btn${boardOpen ? ' active' : ''}`} onClick={() => setBoardOpen((v) => !v)} title="Leaderboard">♛</button>
        <button className="hud-square-btn record" title="Record coming later">🎬</button>
        <button className="hud-square-btn" title="Mod menu">⚙</button>
        <button className="hud-square-btn" onClick={() => setPaused(true)} title="Pause">Ⅱ</button>
      </nav>

      <HudLeaderboard rows={stats.leaderboard} open={boardOpen} />
      <HudMiniMap playerPos={stats.playerPos} />

      <div className="action-stack">
        <button id="normalFeedBtn" className="round-btn" onClick={() => s?.eject()}>FEED</button>
        <button id="feedBtn" className="round-btn" onClick={() => s?.eject()}>MACRO</button>
        <button id="split4Btn" className="round-btn" onClick={() => s?.split(4)}>×4</button>
        <button id="split2Btn" className="round-btn" onClick={() => s?.split(2)}>×2</button>
        <button id="splitBtn" className="round-btn" onClick={() => s?.split(1)}>SPLIT</button>
      </div>

      {paused && !death && (
        <div className="overlay">
          <div className="panel">
            <h2>Paused</h2>
            <div className="panel-actions">
              <button className="secondary" onClick={onExit}>Quit to Menu</button>
              <button className="sky" onClick={() => setPaused(false)}>Resume</button>
            </div>
          </div>
        </div>
      )}

      {death && <DeathPanel result={death} onMenu={onExit} onPlayAgain={() => window.location.reload()} />}
    </section>
  );
}