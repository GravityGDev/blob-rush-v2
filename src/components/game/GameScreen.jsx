import { useEffect, useRef, useState } from 'react';
import '@/styles/blobrush-game.css';
import { createSession } from '@/game/loop';
import { state } from '@/game/state';
import { hudStyle } from '@/game/hudLayout';
import HudStatsBar from './HudStatsBar';
import HudMiniMap from './HudMiniMap';
import HudLeaderboard from './HudLeaderboard';
import DeathPanel from './DeathPanel';
import TouchControls from './TouchControls';
import EmojiWheel from './EmojiWheel';
import ModMenu from './ModMenu';
import LayoutEditor from './LayoutEditor';

const EMPTY = { mass: 0, kills: 0, rank: 0, leaderboard: [], playerPos: null, fps: 60, alive: true };

export default function GameScreen({ profile, onProfile, onExit, onMatchEnd }) {
  const canvasRef = useRef(null);
  const sessionRef = useRef(null);
  const startedAt = useRef(Date.now());
  const [stats, setStats] = useState(EMPTY);
  const [boardOpen, setBoardOpen] = useState(false);
  const [paused, setPaused] = useState(false);
  const [death, setDeath] = useState(null);
  const [modOpen, setModOpen] = useState(false);
  const [wheelOpen, setWheelOpen] = useState(false);
  const [editing, setEditing] = useState(false);

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

  useEffect(() => {
    const onKeyEsc = (e) => { if (e.code === 'Escape') setPaused((v) => !v); };
    window.addEventListener('keydown', onKeyEsc);
    return () => window.removeEventListener('keydown', onKeyEsc);
  }, []);

  const s = sessionRef.current;
  const settings = profile.settings;
  const setSettings = (next) => { state.profile = { ...profile, settings: next }; onProfile({ ...profile, settings: next }); };
  const setLayout = (layout) => setSettings({ ...settings, touch: { ...settings.touch, layout } });

  return (
    <section id="gameScreen" className="screen">
      <canvas id="gameCanvas" ref={canvasRef} />

      {settings.showStatsBar && !editing && (
        <div className="hud-stats-anchor" style={hudStyle(settings.touch.layout, 'stats')}>
          <HudStatsBar stats={{ ...stats, seasonCoins: profile.seasonCoinsPicked || 0 }} fps={settings.showFps ? (stats.fps || 60) : null} />
        </div>
      )}

      {!editing && (
        <nav className="hud-top-actions" style={hudStyle(settings.touch.layout, 'hudGroup')} aria-label="Game HUD controls">
          <button className={`hud-square-btn${boardOpen ? ' active' : ''}`} onClick={() => setBoardOpen((v) => !v)} title="Leaderboard">♛</button>
          {settings.showRecordButton && <button className="hud-square-btn record" title="Record coming later">🎬</button>}
          <button className={`hud-square-btn${modOpen ? ' active' : ''}`} onClick={() => setModOpen((v) => !v)} title="Mod menu">⚙</button>
          <button className="hud-square-btn" onClick={() => setPaused(true)} title="Pause">Ⅱ</button>
        </nav>
      )}

      {!editing && <HudLeaderboard rows={stats.leaderboard} open={boardOpen} />}
      {settings.showMiniMap && !editing && <HudMiniMap playerPos={stats.playerPos} />}

      {!editing && !death && (
        <TouchControls profile={profile} session={s} onEmoji={() => setWheelOpen(true)} />
      )}

      {wheelOpen && (
        <EmojiWheel
          profile={profile}
          onEmoji={(id) => s?.playEmoji(id)}
          onEmote={(id) => s?.playEmote(id)}
          onClose={() => setWheelOpen(false)}
        />
      )}

      {modOpen && !editing && (
        <ModMenu
          profile={profile}
          onSettings={setSettings}
          onAdmin={(action, value) => s?.admin(action, value)}
          onEditLayout={() => { setModOpen(false); setEditing(true); }}
          onClose={() => setModOpen(false)}
        />
      )}

      {editing && (
        <LayoutEditor layout={settings.touch.layout} onChange={setLayout} onFinish={() => setEditing(false)} />
      )}

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