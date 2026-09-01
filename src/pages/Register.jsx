import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Lock, Mail, User, UserPlus } from 'lucide-react';
import AuthLayout from '@/components/AuthLayout';
import { useAuth } from '@/lib/AuthContext';

export default function Register() {
  const { register } = useAuth(); const navigate = useNavigate();
  const [form, setForm] = useState({ displayName: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState(''); const [loading, setLoading] = useState(false);
  const field = (key) => (e) => setForm({ ...form, [key]: e.target.value });
  const submit = async (event) => {
    event.preventDefault(); setError('');
    if (form.password !== form.confirm) return setError('Passwords do not match.');
    setLoading(true);
    try { await register(form.email, form.password, form.displayName); navigate('/', { replace: true }); }
    catch (err) { setError(err.message || 'Registration failed.'); }
    finally { setLoading(false); }
  };
  const Row = ({ id, label, type, icon: Icon, value, change, autoComplete }) => <div className="space-y-2"><Label htmlFor={id}>{label}</Label><div className="relative"><Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input id={id} type={type} autoComplete={autoComplete} className="pl-10 h-12" value={value} onChange={change} required /></div></div>;
  return <AuthLayout icon={UserPlus} title="Create your account" subtitle="Join Blob Rush" footer={<>Already registered? <Link to="/login" className="text-primary font-medium hover:underline">Log in</Link></>}>
    {error && <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}
    <form onSubmit={submit} className="space-y-4">
      <Row id="displayName" label="Display name" type="text" icon={User} value={form.displayName} change={field('displayName')} autoComplete="nickname" />
      <Row id="email" label="Email" type="email" icon={Mail} value={form.email} change={field('email')} autoComplete="email" />
      <Row id="password" label="Password (at least 10 characters)" type="password" icon={Lock} value={form.password} change={field('password')} autoComplete="new-password" />
      <Row id="confirm" label="Confirm password" type="password" icon={Lock} value={form.confirm} change={field('confirm')} autoComplete="new-password" />
      <Button type="submit" className="w-full h-12" disabled={loading}>{loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}{loading ? 'Creating account…' : 'Create account'}</Button>
    </form>
  </AuthLayout>;
}
