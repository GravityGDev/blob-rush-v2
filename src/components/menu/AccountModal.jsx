import { useEffect, useState } from 'react';
import ModalShell from './ModalShell';
import { xpForLevel } from '@/game/save';
import { fmtTime } from '@/game/utils';
import { useAuth } from '@/lib/AuthContext';
import '@/styles/blobrush-account.css';

const ROLE_LABEL = { admin: '🛡️ Admin', moderator: '🔨 Moderator', vip: '⭐ VIP', player: '🎮 Player' };

export default function AccountModal({ profile, account, user, initialMode = 'login', onAuthenticated, onClose }) {
  const { isAuthenticated, login, register, logout } = useAuth();
  const [mode, setMode] = useState(initialMode === 'register' ? 'register' : 'login');
  const [form, setForm] = useState({ displayName: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  useEffect(() => setMode(initialMode === 'register' ? 'register' : 'login'), [initialMode]);

  if (!isAuthenticated) {
    const change = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));
    const submit = async (event) => {
      event.preventDefault(); setError('');
      if (mode === 'register' && form.password !== form.confirm) { setError('Passwords do not match.'); return; }
      setLoading(true);
      try {
        if (mode === 'login') await login(form.email, form.password);
        else await register(form.email, form.password, form.displayName);
        onAuthenticated?.(); onClose();
      } catch (err) { setError(err.message || 'Authentication failed.'); }
      finally { setLoading(false); }
    };
    const switchMode = (next) => { setMode(next); setError(''); };
    return <ModalShell title="Blob Rush Account" onClose={onClose} bodyClass="account-auth-layout">
      <div className="account-auth-hero"><div className="account-auth-blob">{mode === 'login' ? '↪' : '+'}</div><div><h3>{mode === 'login' ? 'Welcome back!' : 'Join Blob Rush!'}</h3><p>{mode === 'login' ? 'Continue your rush and saved progress.' : 'Save progress, unlock rewards and play online.'}</p></div></div>
      <div className="account-auth-tabs"><button className={mode === 'login' ? 'active' : ''} onClick={() => switchMode('login')}>Log In</button><button className={mode === 'register' ? 'active' : ''} onClick={() => switchMode('register')}>Register</button></div>
      {error && <div className="account-auth-error">{error}</div>}
      <form className="account-auth-form" onSubmit={submit}>
        {mode === 'register' && <label><span>Display name</span><input maxLength="24" autoComplete="nickname" value={form.displayName} onChange={change('displayName')} placeholder="Your blob name" required /></label>}
        <label><span>Email</span><input type="email" autoComplete="email" value={form.email} onChange={change('email')} placeholder="you@example.com" required /></label>
        <label><span>Password</span><input type="password" minLength="10" maxLength="128" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={form.password} onChange={change('password')} placeholder={mode === 'register' ? 'At least 10 characters' : 'Your password'} required /></label>
        {mode === 'register' && <label><span>Confirm password</span><input type="password" minLength="10" maxLength="128" autoComplete="new-password" value={form.confirm} onChange={change('confirm')} placeholder="Type it again" required /></label>}
        <button className="account-auth-submit" type="submit" disabled={loading}>{loading ? 'Please wait…' : mode === 'login' ? 'Enter Blob Rush' : 'Create Account'}</button>
      </form>
      <p className="account-auth-switch">{mode === 'login' ? "Don't have an account?" : 'Already have an account?'} <button onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}>{mode === 'login' ? 'Register' : 'Log in'}</button></p>
    </ModalShell>;
  }

  const stats = profile.stats;
  const need = xpForLevel(profile.level);
  const role = account?.role || 'player';
  return <ModalShell title="Account" onClose={onClose} bodyClass="profile-layout">
    <div className="profile-head"><span className="profile-skin-dot" /><div style={{ minWidth: 0, width: '100%' }}><h3>{profile.nickname || user?.full_name || 'Blob'}</h3><p>{ROLE_LABEL[role] || role} · Level {profile.level}</p><div className="progress"><i style={{ width: `${Math.min(100, (profile.xp / need) * 100)}%` }} /></div><p>{user?.email}</p></div></div>
    <div className="stats-grid"><div className="stat-box"><b>{stats.games}</b><span>Games</span></div><div className="stat-box"><b>{Math.round(stats.highestMass).toLocaleString()}</b><span>Highest mass</span></div><div className="stat-box"><b>{stats.cellsEaten}</b><span>Cells eaten</span></div><div className="stat-box"><b>{fmtTime(stats.timePlayed)}</b><span>Time played</span></div><div className="stat-box"><b>{profile.ownedSkins.length}</b><span>Skins owned</span></div><div className="stat-box"><b>{profile.coins.toLocaleString()}</b><span>Coins</span></div></div>
    <div className="cosmetic-actions"><button className="primary-btn" disabled>Discord linking coming next</button><button className="cosmetic-reset" onClick={async () => { await logout(); onClose(); }}>Sign out</button></div>
  </ModalShell>;
}
