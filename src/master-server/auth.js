import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import { db } from './db.js';

const COOKIE = 'blobrush_session';
const SESSION_DAYS = 14;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DEFAULT_ALLOWED_EMAIL_DOMAINS = [
  'gmail.com', 'googlemail.com',
  'outlook.com', 'outlook.co.uk', 'hotmail.com', 'hotmail.co.uk', 'live.com', 'live.co.uk', 'msn.com',
  'yahoo.com', 'yahoo.co.uk', 'ymail.com',
  'aol.com', 'aol.co.uk',
  'icloud.com', 'me.com', 'mac.com',
  'proton.me', 'protonmail.com', 'pm.me',
  'gmx.com', 'gmx.co.uk', 'mail.com', 'fastmail.com', 'zoho.com',
  'btinternet.com', 'sky.com', 'virginmedia.com', 'talktalk.net',
];

function allowedEmailDomains() {
  const configured = String(process.env.ALLOWED_EMAIL_DOMAINS || '').trim();
  return new Set((configured ? configured.split(',') : DEFAULT_ALLOWED_EMAIL_DOMAINS)
    .map((domain) => domain.trim().toLowerCase().replace(/^@/, ''))
    .filter(Boolean));
}

function emailDomainAllowed(email) {
  const domain = email.slice(email.lastIndexOf('@') + 1).toLowerCase();
  const allowed = allowedEmailDomains();
  return allowed.has('*') || allowed.has(domain);
}

const publicUser = (user) => ({
  id: user._id.toString(), email: user.email, displayName: user.displayName,
  role: user.role || 'player', createdAt: user.createdAt,
});

const cookies = (req) => Object.fromEntries(String(req.headers.cookie || '').split(';').map((part) => {
  const i = part.indexOf('=');
  return i < 0 ? ['', ''] : [part.slice(0, i).trim(), decodeURIComponent(part.slice(i + 1))];
}).filter(([key]) => key));

function sessionToken(user) {
  return jwt.sign({ sub: user._id.toString(), role: user.role || 'player' }, process.env.SESSION_SECRET, {
    algorithm: 'HS256', expiresIn: `${SESSION_DAYS}d`, issuer: 'blob-rush', audience: 'blob-rush-web',
  });
}

function setSession(res, user) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader('Set-Cookie', `${COOKIE}=${encodeURIComponent(sessionToken(user))}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${SESSION_DAYS * 86400}${secure}`);
}

function clearSession(res) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader('Set-Cookie', `${COOKIE}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0${secure}`);
}

export async function currentUser(req) {
  try {
    const token = cookies(req)[COOKIE];
    if (!token) return null;
    const payload = jwt.verify(token, process.env.SESSION_SECRET, {
      algorithms: ['HS256'], issuer: 'blob-rush', audience: 'blob-rush-web',
    });
    return await db().collection('users').findOne({ _id: new ObjectId(payload.sub) });
  } catch { return null; }
}

const send = (res, status, data) => {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
};

export async function readJson(req, limit = 16 * 1024) {
  let body = '';
  for await (const chunk of req) {
    body += chunk;
    if (body.length > limit) throw new Error('Request too large');
  }
  return body ? JSON.parse(body) : {};
}

export async function handleAuth(req, res, pathname) {
  if (pathname === '/api/auth/register' && req.method === 'POST') {
    const body = await readJson(req);
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');
    const displayName = String(body.displayName || email.split('@')[0] || 'Blob').trim().slice(0, 24);
    if (!emailPattern.test(email)) return send(res, 400, { error: 'Enter a valid email address.' });
    if (!emailDomainAllowed(email)) return send(res, 400, { error: 'Please register with a supported email provider such as Gmail, Outlook, AOL, Yahoo or iCloud.' });
    if (password.length < 10 || password.length > 128) return send(res, 400, { error: 'Password must be 10–128 characters.' });
    const user = { email, displayName, passwordHash: await bcrypt.hash(password, 12), role: 'player', providers: [], profile: {}, createdAt: new Date(), updatedAt: new Date() };
    try {
      const result = await db().collection('users').insertOne(user);
      user._id = result.insertedId;
    } catch (error) {
      if (error?.code === 11000) return send(res, 409, { error: 'An account with that email already exists.' });
      throw error;
    }
    setSession(res, user);
    return send(res, 201, { user: publicUser(user) });
  }
  if (pathname === '/api/auth/login' && req.method === 'POST') {
    const body = await readJson(req);
    const email = String(body.email || '').trim().toLowerCase();
    const user = await db().collection('users').findOne({ email });
    if (!user || !user.passwordHash || !(await bcrypt.compare(String(body.password || ''), user.passwordHash))) {
      return send(res, 401, { error: 'Invalid email or password.' });
    }
    setSession(res, user);
    return send(res, 200, { user: publicUser(user) });
  }
  if (pathname === '/api/auth/logout' && req.method === 'POST') {
    clearSession(res);
    return send(res, 200, { ok: true });
  }
  if (pathname === '/api/auth/me' && req.method === 'GET') {
    const user = await currentUser(req);
    return user ? send(res, 200, { user: publicUser(user) }) : send(res, 401, { error: 'Not signed in.' });
  }
  return false;
}

export async function handleAccount(req, res, pathname) {
  const user = await currentUser(req);
  if (!user) return send(res, 401, { error: 'Not signed in.' });
  if (pathname === '/api/account' && req.method === 'GET') {
    return send(res, 200, { user: publicUser(user), profile: user.profile || {} });
  }
  if (pathname === '/api/account/profile' && req.method === 'PUT') {
    const { profile } = await readJson(req, 256 * 1024);
    if (!profile || typeof profile !== 'object' || Array.isArray(profile)) return send(res, 400, { error: 'Invalid profile.' });
    await db().collection('users').updateOne({ _id: user._id }, { $set: { profile, updatedAt: new Date() } });
    return send(res, 200, { ok: true });
  }
  return send(res, 404, { error: 'Not found.' });
}

export { publicUser };
