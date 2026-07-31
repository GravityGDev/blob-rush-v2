import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

const ROLES = ['player', 'vip', 'moderator', 'admin'];

// Every cloud account, with manual role assignment.
export default function AdminPlayersTab({ onNote }) {
  const [rows, setRows] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    base44.entities.PlayerAccount.list('-updated_date', 200)
      .then(setRows)
      .catch((e) => { setRows([]); onNote(e.message); });
  }, []);

  const setRole = async (row, role) => {
    setRows((list) => list.map((r) => (r.id === row.id ? { ...r, role } : r)));
    try {
      await base44.entities.PlayerAccount.update(row.id, { role });
      onNote(`${row.discord_username || 'Player'} is now ${role}.`);
    } catch (e) { onNote(e.message); }
  };

  if (!rows) return <div className="shop-note">Loading accounts…</div>;

  const term = search.trim().toLowerCase();
  const list = rows.filter((r) => {
    if (!term) return true;
    return `${r.discord_username || ''} ${r.data?.nickname || ''} ${r.discord_id || ''}`.toLowerCase().includes(term);
  });

  return (
    <>
      <div className="admin-amount">
        <label>Search</label>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Nickname, Discord name or ID" />
      </div>
      {list.length === 0 && <div className="shop-note">No accounts match.</div>}
      <div className="admin-players">
        {list.map((r) => (
          <div className="admin-player" key={r.id}>
            {r.discord_avatar
              ? <img src={r.discord_avatar} alt="" />
              : <span className="admin-player-dot" />}
            <div className="admin-player-info">
              <b>{r.data?.nickname || r.discord_username || 'Unnamed blob'}</b>
              <small>
                {r.discord_username ? `Discord: ${r.discord_username}` : 'Discord not linked'}
                {' · '}Lv {r.data?.level || 1}
                {' · '}{Math.round(r.data?.coins || 0).toLocaleString()} 🪙
              </small>
            </div>
            <div className="admin-role-picker">
              {ROLES.map((role) => (
                <button
                  key={role}
                  className={(r.role || 'player') === role ? 'active' : ''}
                  onClick={() => setRole(r, role)}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}