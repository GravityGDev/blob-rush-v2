import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Lock, LogIn, Mail } from 'lucide-react';
import AuthLayout from '@/components/AuthLayout';
import { useAuth } from '@/lib/AuthContext';
import { safeReturnTo } from '@/lib/authReturnTo';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const submit = async (event) => {
    event.preventDefault(); setError(''); setLoading(true);
    try { await login(email, password); navigate(safeReturnTo(), { replace: true }); }
    catch (err) { setError(err.message || 'Invalid email or password.'); }
    finally { setLoading(false); }
  };
  return <AuthLayout icon={LogIn} title="Welcome back" subtitle="Log in to your Blob Rush account" footer={<>Don't have an account? <Link to="/register" className="text-primary font-medium hover:underline">Create one</Link></>}>
    {error && <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-2"><Label htmlFor="email">Email</Label><div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input id="email" type="email" autoComplete="email" className="pl-10 h-12" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus /></div></div>
      <div className="space-y-2"><Label htmlFor="password">Password</Label><div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input id="password" type="password" autoComplete="current-password" className="pl-10 h-12" value={password} onChange={(e) => setPassword(e.target.value)} required /></div></div>
      <Button type="submit" className="w-full h-12" disabled={loading}>{loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}{loading ? 'Logging in…' : 'Log in'}</Button>
    </form>
  </AuthLayout>;
}
