import { useEffect, useRef, useState } from 'react';
import '@/styles/blobrush-game.css';
import { createSession } from '@/game/loop';
import { state } from '@/game/state';
import { getTouchSettings, controlStyle, touchActualPoint, uiScale } from '@/game/hudLayout';
import useViewport from '@/hooks/use-viewport';
import HudStatsBar from './HudStatsBar';
import HudMiniMap from './HudMiniMap';
import HudLeaderboard from './HudLeaderboard';
import DeathPanel from './DeathPanel';
import TouchControls from './TouchControls';
import EmojiWheel from './EmojiWheel';
import ModMenu from './ModMenu';
import NetStatus from './NetStatus';
import { playSfx, setSfxVolume } from '@/game/audio';
import { createNetHolder } from '@/game/net/holder';
import { startOnlineSession } from '@/game/net/online';
import { isOnlineEnabled } from '@/game/net/config';

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
  const [netStatus, setNetStatus] = useState(null);
  const netRef = useRef(null);

  useEffect(() => {
    state.stats = { maxMass: 0, lastMass: 0, bestRank: 99 };
    startedAt.current = Date.now();
    const onlineRequired = isOnlineEnabled(profile);
    const net = createNetHolder({ required: onlineRequired });
    netRef.current = net;
    if (onlineRequired) {
      startOnlineSession(profile, setNetStatus)
        .then((client) => {
          if (!client) throw new Error('No online game server was returned by the master server.');
          net.client = client;
        })
        .catch((error) => setNetStatus({ state: 'error', message: error?.message || 'Could not join the online server.' }));
    } else {
      setNetStatus({ state: 'offline' });
    }
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
    }, net);
    sessionRef.current = session;
    return () => { session.destroy(); net.close(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onKey = (e) => { if (e.code === 'Escape') setPaused((v) => { sessionRef.current?.setPaused(!v); return !v; }); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => { state.profile = profile; setSfxVolume(profile.settings.sfx); }, [profile]);

  const viewport = useViewport();
  const s = sessionRef.current;
  const settings = profile.settings;
  const touch = getTouchSettings(profile);
  const setSettings = (next) => onProfile({ ...profile, settings: next });
  const hudLeft = touchActualPoint(touch.layout.hudGroup, touch).x < 0.5;
  const scale = uiScale();
  const groupScale = touch.layout.hudGroup.size * scale;
  const btnSize = Math.round(50 * groupScale);
  const statCount = settings.showFps === false ? 5 : 6;
  const statsWidth = statCount * 96;

  const showToast = (text) => { setToast(text); setTimeout(() => setToast(''), 1700); };

  return (
    <section id="gameScreen" className={`screen${death || paused ? ' death-ui-hidden' : ''}`}>
      <canvas id="gameCanvas" ref={canvasRef} />
      <div id="aimReticle" className="aim-reticle centered" ref={(el) => { state.reticleEl = el; }} aria-hidden="true" />

      <div id="touchControlLayer">
        {settings.showStatsBar !== false && touch.layout.stats.visible && (
          <div id="hudStatsBar" className="hud-stats-bar" style={{ ...controlStyle(touch, 'stats', statsWidth, 50), maxWidth: 'calc(100vw - 20px)' }}>
            <HudStatsBar
              stats={{ ...stats, seasonCoins: profile.seasonCoinsPicked || 0 }}
              fps={settings.showFps === false ? null : stats.fps}
            />
          </div>
        )}

        {touch.layout.hudGroup.visible && (
          <nav id="hudTopActions" className="hud-top-actions" style={{ ...controlStyle(touch, 'hudGroup', (settings.showRecordButton === false ? 3 : 4) * 50 + (settings.showRecordButton === false ? 2 : 3) * 8, 50), height: btnSize, gap: `${Math.round(8 * groupScale)}px` }}>
            <button className={`hud-square-btn${boardOpen ? ' active' : ''}`} style={{ width: btnSize, height: btnSize, fontSize: Math.round(22 * groupScale) }}
              onPointerDown={(e) => { e.preventDefault(); setBoardOpen((v) => !v); playSfx('button'); }}>♛</button>
            {settings.showRecordButton !== false && (
              <button className="hud-square-btn record" style={{ width: btnSize, height: btnSize, fontSize: Math.round(22 * groupScale) }}
                onPointerDown={(e) => { e.preventDefault(); showToast('Recording button is ready — capture functionality will be added later.'); playSfx('button'); }}>🎬</button>
            )}
            <button className={`hud-square-btn${modOpen ? ' active' : ''}`} style={{ width: btnSize, height: btnSize, fontSize: Math.round(22 * groupScale) }}
              onPointerDown={(e) => { e.preventDefault(); setModOpen((v) => !v); playSfx('button'); }}>⚙</button>
            <button className="hud-square-btn" style={{ width: btnSize, height: btnSize, fontSize: Math.round(22 * groupScale) }}
              onPointerDown={(e) => { e.preventDefault(); setPaused(true); s?.setPaused(true); }}>Ⅱ</button>
          </nav>
        )}

        {!death && !paused && <TouchControls profile={profile} session={s} onEmoji={() => { setWheelOpen(true); playSfx('button'); }} />}
      </div>

      <HudLeaderboard rows={stats.leaderboard} selfRank={stats.selfRank} selfName={stats.selfName} open={boardOpen} />
      {settings.showMiniMap !== false && <HudMiniMap playerPos={stats.playerPos} />}
      <div className={`hud-toast${toast ? ' show' : ''}`}>{toast}</div>
      <NetStatus status={netStatus} />

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
