import { useState } from 'react';
import '@/styles/blobrush-menu.css';
import MenuAvatarCanvas from './MenuAvatarCanvas';

export default function MainMenuScreen({ profile, roomLabel, roomMeta, onNickname, onPlay, onOpenModal }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const open = (id) => { setDrawerOpen(false); onOpenModal?.(id); };

  return (
    <div className="br-root">
      <section id="menuScreen" className="screen">
        <span className="bg-cell" style={{ width: 150, height: 150, background: '#38bdf8', left: -30, top: '18%' }} />
        <span className="bg-cell" style={{ width: 105, height: 105, background: '#f472b6', right: '4%', top: '12%' }} />
        <span className="bg-cell" style={{ width: 190, height: 190, background: '#a78bfa', right: -60, bottom: '10%' }} />
        <span className="bg-cell" style={{ width: 80, height: 80, background: '#4ade80', left: '16%', bottom: '12%' }} />

        <main className="menu-shell">
          <header className="topbar">
            <div className="level-wrap">
              <button type="button" className="level-circle profile-orb-button" onClick={() => open('account')} aria-label="Open account">
                <span className="profile-orb-level">{profile.level}</span>
              </button>
              <div className="level-info">
                <small>Level {profile.level}</small>
                <div className="progress"><i style={{ width: `${Math.min(100, profile.xpPercent || 0)}%` }} /></div>
              </div>
              <div className="coin-pill">🪙 <span>{profile.coins}</span></div>
              <div className="token-pill">🎟️ <span>{profile.tokens}</span></div>
            </div>
          </header>

          <div className="menu-main menu-main-v3">
            <section className="menu-content">
              <div className="menu-head-row">
                <div className="logo"><h1>Blob Rush</h1></div>
                <button type="button" className="menu-fs-btn" onClick={() => document.documentElement.requestFullscreen?.()} aria-label="Open fullscreen mode">
                  ⛶ <span>Full Screen</span>
                </button>
              </div>

              <div className="play-panel player-connect-wrap">
                <div className="player-connect-card">
                  <div className="player-connect-inner">
                    <button type="button" className="menu-avatar-zone" onClick={() => open('skins')} aria-label="Open skins menu">
                      <MenuAvatarCanvas profile={profile} />
                    </button>
                    <div className="player-connect-fields">
                      <div className="name-card">
                        <input
                          maxLength={14}
                          autoComplete="off"
                          placeholder="Enter in-game name"
                          aria-label="In-game name"
                          value={profile.nickname}
                          onChange={(e) => onNickname?.(e.target.value)}
                        />
                      </div>
                      <div className="server-select-row">
                        <button className="change-server-btn" onClick={() => open('server')}>Change Server</button>
                        <div className="selected-room-summary">
                          <small>Selected arena</small>
                          <strong>{roomLabel}</strong>
                          <div className="selected-room-meta"><span className="room-online-dot" /><span>{roomMeta}</span></div>
                        </div>
                      </div>
                      <button className="primary-btn" onClick={onPlay}>▶ ENTER ARENA</button>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <aside className={`main-menu-drawer${drawerOpen ? ' open' : ''}`} aria-label="Main menu actions">
              <button className="main-menu-drawer-tab" aria-expanded={drawerOpen} onClick={() => setDrawerOpen((v) => !v)}>
                <i /><span>MENU</span>
              </button>
              <div className="main-menu-drawer-panel">
                <div className="main-menu-drawer-head">
                  <strong>Main Menu</strong>
                  <button className="main-menu-drawer-close" onClick={() => setDrawerOpen(false)} aria-label="Close side menu">✕</button>
                </div>
                <div className="main-menu-drawer-group">
                  <button className="menu-drawer-btn" onClick={() => open('shop')}><b>🛍️</b><span>Shop</span></button>
                  <button className="menu-drawer-btn" onClick={() => open('season')}><b>🏆</b><span>Season Pass</span></button>
                  <button className="menu-drawer-btn" onClick={() => open('lucky')}><b>🎰</b><span>Lucky</span></button>
                  <button className="menu-drawer-btn" onClick={() => open('settings')}><b>⚙️</b><span>Settings</span></button>
                </div>
                <div className="main-menu-divider"><span>Staff</span></div>
                <div className="main-menu-drawer-group staff">
                  <button className="menu-drawer-btn" onClick={() => open('admin')}><b>🛡️</b><span>Admin</span></button>
                  <button className="menu-drawer-btn" onClick={() => open('moderation')}><b>🔨</b><span>Moderation</span></button>
                </div>
              </div>
            </aside>
          </div>
        </main>
      </section>
    </div>
  );
}