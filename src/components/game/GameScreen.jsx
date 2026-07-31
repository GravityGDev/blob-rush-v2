import { useEffect, useRef, useState } from 'react';
import '@/styles/blobrush-game.css';
import { createSession } from '@/game/loop';
import { state } from '@/game/state';
import { getTouchSettings, controlStyle, touchActualPoint } from '@/game/hudLayout';
import HudStatsBar from './HudStatsBar';
import HudMiniMap from './HudMiniMap';
import HudLeaderboard from './HudLeaderboard';
import DeathPanel from './DeathPanel';
import TouchControls from './TouchControls';
import EmojiWheel from './EmojiWheel';
import ModMenu from './ModMenu';
import { playSfx, setSfxVolume } from '@/game/audio';

const EMPTY = { mass: 0, kills: 0, rank: 0, leaderboard: [], selfRank: 0, selfName: '', playerPos: null, fps: 60, ping: 20, bandwidth: 1, alive: true };

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
  const [toast, setToast] = useState('');

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
    const onKey = (e) => { if (e.code === 'Escape') setPaused((v) => { sessionRef.current?.setPaused(!v); return !v; }); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => { state.profile = profile; setSfxVolume(profile.settings.sfx); }, [profile]);

  const s = sessionRef.current;
  const settings = profile.settings;
  const touch = getTouchSettings(profile);
  const setSettings = (next) => onProfile({ ...profile, settings: next });
  const hudLeft = touchActualPoint(touch.layout.hudGroup, touch).x < 0.5;
  const groupScale = touch.layout.hudGroup.size;
  const statsWidth = Math.min(760, Math.max(560, window.innerWidth * 0.48));

  const showToast = (text) => { setToast(text); setTimeout(() => setToast(''), 1700); };

  return (
    <section id="gameScreen" className={`screen${death ? ' death-ui-hidden' : ''}`}>
      <canvas id="gameCanvas" ref={canvasRef} />

      <div id="touchControlLayer">
        {settings.showStatsBar !== false && touch.layout.stats.visible && (
          <div id="hudStatsBar" className="hud-stats-bar" style={controlStyle(touch, 'stats', statsWidth, 50)}>
            <HudStatsBar
              stats={{ ...stats, seasonCoins: profile.seasonCoinsPicked || 0 }}
              fps={settings.showFps === false ? null : stats.fps}
            />
          </div>
        )}

        {touch.layout.hudGroup.visible && (
          <nav id="hudTopActions" className="hud-top-actions" style={{ ...controlStyle(touch, 'hudGroup', 224, 50 * groupScale), width: 'auto', gap: `${8 * groupScale}px` }}>
            <button className={`hud-square-btn${boardOpen ? ' active' : ''}`} style={{ width: 50 * groupScale, height: 50 * groupScale, fontSize: 22 * groupScale }}
              onPointerDown={(e) => { e.preventDefault(); setBoardOpen((v) => !v); playSfx('button'); }}>♛</button>
            {settings.showRecordButton !== false && (
              <button className="hud-square-btn record" style={{ width: 50 * groupScale, height: 50 * groupScale, fontSize: 22 * groupScale }}
                onPointerDown={(e) => { e.preventDefault(); showToast('Recording button is ready — capture functionality will be added later.'); playSfx('button'); }}>🎬</button>
            )}
            <button className={`hud-square-btn${modOpen ? ' active' : ''}`} style={{ width: 50 * groupScale, height: 50 * groupScale, fontSize: 22 * groupScale }}
              onPointerDown={(e) => { e.preventDefault(); setModOpen((v) => !v); playSfx('button'); }}>⚙</button>
            <button className="hud-square-btn" style={{ width: 50 * groupScale, height: 50 * groupScale, fontSize: 22 * groupScale }}
              onPointerDown={(e) => { e.preventDefault(); setPaused(true); s?.setPaused(true); }}>Ⅱ</button>
          </nav>
        )}

        {!death && <TouchControls profile={profile} session={s} onEmoji={() => { setWheelOpen(true); playSfx('button'); }} />}
      </div>

      <HudLeaderboard rows={stats.leaderboard} selfRank={stats.selfRank} selfName={stats.selfName} open={boardOpen} />
      {settings.showMiniMap !== false && <HudMiniMap playerPos={stats.playerPos} />}
      <div className={`hud-toast${toast ? ' show' : ''}`}>{toast}</div>

      {wheelOpen && (
        <EmojiWheel profile={profile} onEmoji={(id) => s?.playEmoji(id)} onEmote={(id) => s?.playEmote(id)} onClose={() => setWheelOpen(false)} />
      )}

      {modOpen && (
        <ModMenu profile={profile} world={s?.world} leftSide={hudLeft} onSettings={setSettings} onClose={() => setModOpen(false)} />
      )}

      {paused && !death && (
        <div className="overlay">
          <div className="panel">
            <h2>Paused</h2>
            <div className="setting-row">
              <label>Sound effects</label>
              <input type="range" min="0" max="100" value={Math.round(settings.sfx * 100)}
                onChange={(e) => setSettings({ ...settings, sfx: Number(e.target.value) / 100 })} />
            </div>
            <div className="panel-actions">
              <button className="secondary" onClick={onExit}>Quit to Menu</button>
              <button className="sky" onClick={() => { setPaused(false); s?.setPaused(false); }}>Resume</button>
            </div>
          </div>
        </div>
      )}

      {death && <DeathPanel result={death} onMenu={onExit} onPlayAgain={() => window.location.reload()} />}
    </section>
  );
}