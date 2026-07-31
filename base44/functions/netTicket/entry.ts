import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { secrets } from 'base44:runtime';

// Issues a short-lived, HMAC-signed ticket proving the connecting player is a
// logged-in user of this app. The game server verifies it with the same secret.
const TTL_SECONDS = 120;

function base64url(bytes) {
  let binary = '';
  for (const b of new Uint8Array(bytes)) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const secret = secrets.get('GAME_SERVER_SECRET');
    if (!secret) return Response.json({ error: 'GAME_SERVER_SECRET is not configured' }, { status: 500 });

    const accounts = await base44.entities.PlayerAccount.filter({ created_by_id: user.id });
    const account = accounts[0] || null;

    const payload = {
      userId: user.id,
      email: user.email,
      name: String(body.name || user.full_name || 'Blob').slice(0, 14),
      role: account?.role || 'player',
      room: String(body.room || ''),
      exp: Math.floor(Date.now() / 1000) + TTL_SECONDS,
    };

    const payloadJson = JSON.stringify(payload);
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign'],
    );
    const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payloadJson));
    const encodedPayload = base64url(new TextEncoder().encode(payloadJson));
    const ticket = `${encodedPayload}.${base64url(signature)}`;

    return Response.json({ ticket, player: payload });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}