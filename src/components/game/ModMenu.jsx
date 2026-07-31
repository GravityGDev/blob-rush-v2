import { useState } from 'react';
import { playSfx } from '@/game/audio';
import {
  playerTotalMass, setPlayerTotalMass, teleportPlayerTo, mergePlayerCells, shootModVirus,
  spawnVirusRing, spawnVirusStorm, spawnPelletRain, randomTeleportPlayer, swarmBotsAroundPlayer,
  scatterBots, refillPellets, WORLD_SIZE, MAX_CELL_MASS, MAX_CELLS,
} from '@/game/modTools';

// The original "Mod Menu" drawer: Macro tuning + full Admin Tools.
export default function ModMenu({ profile, onSettings, world, onClose, leftSide }) {
  const [view, setView] = useState('macro');
  const [, force] = useState(0);
  const redraw = () => force((n) => n + 1);
  const s = profile.settings;
  const player = world?.player;
  const [targetId, setTargetId] = useState(player?.id);
  const target = world?.players.find((p) => p.id === Number(targetId)) || player;

  const setSetting = (key, value) => onSettings({ ...s, [key]: value });
  const act = (fn, sfx = 'button') => (e) => { e.preventDefault(); e.stopPropagation(); fn(); playSfx(sfx); redraw(); };

  const speed = Math.max(10, Math.min(99, Number(s.macroSpeed || 50)));
  const multiplier = Math.max(1, Math.min(300, Number(s.macroMultiplier || 4)));
  const rawRate = (1000 / speed) * multiplier;
  const rate = Math.min(6000, rawRate);

  const Control = ({ label, value, min, max, step = 1, scale, onChange, current }) => (
    <div className="macro-control">
      <div className="macro-label"><span>{label}</span><b>{current}</b></div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
      <div className="macro-scale"><span>{scale[0]}</span><span>{scale[1]}</span></div>
    </div>
  );

  const ModBtn = ({ id, cls = '', children, onClick, active }) => (
    <button id={id} className={`mod-button ${cls} ${active ? 'active' : ''}`} onClick={onClick}>{children}</button>
  );

  return (
    <aside className={`macro-drawer open${leftSide ? ' touch-left' : ''}`} aria-label="Mod controls">
      <div className="macro-panel">
        <div className="macro-head"><strong>Mod Menu</strong><button className="macro-close" onClick={onClose}>✕</button></div>
        <div className="mod-tabs">
          <button className={`mod-view-tab${view === 'macro' ? ' active' : ''}`} onClick={() => { setView('macro'); playSfx('button'); }}>Macro</button>
          <button className={`mod-view-tab${view === 'admin' ? ' active' : ''}`} onClick={() => { setView('admin'); playSfx('button'); }}>Admin Tools</button>
        </div>

        {view === 'macro' && (
          <div className="mod-view">
            <Control label="Macro speed" value={speed} min={10} max={99} current={`${Math.round(speed)} ms`}
              scale={['10 ms • Fastest', '99 ms • Smooth']} onChange={(v) => setSetting('macroSpeed', v)} />
            <Control label="Macro Multi" value={multiplier} min={1} max={300} current={`${Math.round(multiplier)}×`}
              scale={['1×', '300×']} onChange={(v) => setSetting('macroMultiplier', v)} />
            <Control label="Camera zoom" value={Math.round(s.cameraZoom || 100)} min={50} max={180} current={`${Math.round(s.cameraZoom || 100)}%`}
              scale={['Zoom out', 'Zoom in']} onChange={(v) => setSetting('cameraZoom', v)} />
            <Control label="Cell / multi-split delay" value={Math.round(s.animationDelay || 150)} min={50} max={500} step={10}
              current={`${Math.round(s.animationDelay || 150)} ms`} scale={['50 ms • Fast', '500 ms • Delayed']}
              onChange={(v) => setSetting('animationDelay', v)} />
            <div className="macro-toggle-row">
              <span>Keep camera zoom fixed</span>
              <button className="settings-switch" type="button" aria-pressed={!!s.fixedCameraZoom}
                onClick={() => { setSetting('fixedCameraZoom', !s.fixedCameraZoom); playSfx('button'); }}><span /></button>
            </div>
            <div className="macro-rate">Output: <b>{`${rate.toFixed(rate < 10 ? 1 : 0)} feed pulses/sec${rawRate > 6000 ? ' (capped)' : ''}`}</b><br />
              <span>Dense random mass piles • 1280×720 screen-space render budget</span></div>
          </div>
        )}

        {view === 'admin' && world && (
          <div className="mod-view">
            <section className="mod-section">
              <h4>Your player</h4>
              <div className="mod-field">
                <label>Movement speed</label>
                <input type="range" min="25" max="500" step="25" value={Math.round((player.modSpeedMultiplier || 1) * 100)}
                  onChange={(e) => { player.modSpeedMultiplier = Number(e.target.value) / 100; redraw(); }} />
                <div className="mod-status"><span>Speed multiplier</span><b>{(player.modSpeedMultiplier || 1).toFixed(2)}×</b></div>
              </div>
              <button className="mod-button mod-reset-speed" onClick={act(() => { player.modSpeedMultiplier = 1; })}>Reset Speed to 1×</button>
              <div className="mod-grid">
                <ModBtn active={!!player.modInvisible} onClick={act(() => { player.modInvisible = !player.modInvisible; })}>Invisible: {player.modInvisible ? 'On' : 'Off'}</ModBtn>
                <ModBtn active={!!player.modGodMode} onClick={act(() => { player.modGodMode = !player.modGodMode; })}>God Mode: {player.modGodMode ? 'On' : 'Off'}</ModBtn>
                <ModBtn active={!!player.modForceMergeActive} onClick={act(() => mergePlayerCells(player))}>{player.modForceMergeActive ? 'Recombining…' : 'Recombine Cells'}</ModBtn>
                <ModBtn onClick={act(() => teleportPlayerTo(player, WORLD_SIZE / 2, WORLD_SIZE / 2))}>Teleport Centre</ModBtn>
              </div>
            </section>

            <section className="mod-section">
              <h4>Mass &amp; teleport</h4>
              <div className="mod-field">
                <label>Target player / bot</label>
                <select value={target?.id} onChange={(e) => setTargetId(e.target.value)}>
                  {world.players.map((p) => (
                    <option key={p.id} value={p.id}>{p === player ? 'You' : p.name} · {Math.round(playerTotalMass(p))} mass</option>
                  ))}
                </select>
              </div>
              <div className="mod-field">
                <label>Live total mass</label>
                <input type="range" min="10" max={MAX_CELL_MASS * MAX_CELLS} step="100" value={Math.round(playerTotalMass(target))}
                  onChange={(e) => { setPlayerTotalMass(world, target, Number(e.target.value)); redraw(); }} />
                <div className="mod-status"><span>Target mass</span><b>{Math.round(playerTotalMass(target)).toLocaleString()}</b></div>
              </div>
              <div className="mod-grid">
                <ModBtn onClick={act(() => setPlayerTotalMass(world, target, playerTotalMass(target) + 1000))}>Add 1,000</ModBtn>
                <ModBtn onClick={act(() => {
                  if (!target || target === player) teleportPlayerTo(player, WORLD_SIZE / 2, WORLD_SIZE / 2);
                  else { const c = target.cells[0]; if (c) teleportPlayerTo(player, c.x + 220, c.y + 120); }
                })}>Teleport Near</ModBtn>
                <ModBtn onClick={act(() => randomTeleportPlayer(target))}>Random Teleport</ModBtn>
                <ModBtn cls="danger" onClick={act(() => { for (const c of target.cells) c.dead = true; target.cells = []; if (target.isBot) target.respawn = 3; }, 'death')}>Remove Target</ModBtn>
              </div>
            </section>

            <section className="mod-section">
              <h4>Virus &amp; map tools</h4>
              <div className="mod-grid">
                <ModBtn cls="warn" onClick={act(() => shootModVirus(world))}>Shoot Virus</ModBtn>
                <ModBtn active={!!world.virusSpawningEnabled} onClick={act(() => { world.virusSpawningEnabled = !world.virusSpawningEnabled; })}>Virus Spawn: {world.virusSpawningEnabled ? 'On' : 'Off'}</ModBtn>
                <ModBtn cls="danger" onClick={act(() => { world.viruses = []; })}>Remove Viruses</ModBtn>
                <ModBtn onClick={act(() => spawnVirusRing(world))}>Spawn Virus Ring</ModBtn>
                <ModBtn active={!!world.botsFrozen} onClick={act(() => { world.botsFrozen = !world.botsFrozen; })}>Freeze Bots: {world.botsFrozen ? 'On' : 'Off'}</ModBtn>
                <ModBtn onClick={act(() => { world.ejected = []; })}>Clear Ejected Mass</ModBtn>
                <ModBtn active={!!world.pelletSpawningEnabled} onClick={act(() => {
                  world.pelletSpawningEnabled = !world.pelletSpawningEnabled;
                  if (world.pelletSpawningEnabled) refillPellets(world);
                })}>Pellet Spawn: {world.pelletSpawningEnabled ? 'On' : 'Off'}</ModBtn>
                <ModBtn cls="danger" onClick={act(() => { world.pellets = []; world.pelletSpawningEnabled = false; })}>Clear Pellets</ModBtn>
              </div>
            </section>

            <section className="mod-section">
              <h4>Fun tools</h4>
              <div className="mod-fun-grid">
                <ModBtn onClick={act(() => setPlayerTotalMass(world, player, 22000), 'reward')}>Giant 22K</ModBtn>
                <ModBtn onClick={act(() => setPlayerTotalMass(world, player, 50))}>Tiny Mode</ModBtn>
                <ModBtn active={!!player.modRainbowTrail} onClick={act(() => { player.modRainbowTrail = !player.modRainbowTrail; })}>Rainbow Trail: {player.modRainbowTrail ? 'On' : 'Off'}</ModBtn>
                <ModBtn active={(world.modTimeScale || 1) < 1} onClick={act(() => { world.modTimeScale = (world.modTimeScale || 1) < 1 ? 1 : 0.35; })}>Slow Motion: {(world.modTimeScale || 1) < 1 ? 'On' : 'Off'}</ModBtn>
                <ModBtn onClick={act(() => swarmBotsAroundPlayer(world))}>Bot Swarm</ModBtn>
                <ModBtn onClick={act(() => spawnPelletRain(world), 'reward')}>Pellet Rain</ModBtn>
                <ModBtn cls="warn" onClick={act(() => spawnVirusStorm(world))}>Virus Storm</ModBtn>
                <ModBtn onClick={act(() => scatterBots(world))}>Scatter Bots</ModBtn>
              </div>
              <p className="mod-note">All Mod controls are session-only. You can keep moving with the joystick while using buttons and sliders.</p>
            </section>
          </div>
        )}
      </div>
    </aside>
  );
}