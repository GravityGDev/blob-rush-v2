// Verifies the HMAC login tickets minted by the app's netTicket function.
import crypto from 'node:crypto';
import { Buffer } from 'node:buffer';

export function verifyTicket(ticket, secret) {
  if (typeof ticket !== 'string' || !ticket.includes('.')) return null;
  const [encoded, signature] = ticket.split('.');
  let json;
  try {
    json = Buffer.from(encoded, 'base64url').toString('utf8');
  } catch {
    return null;
  }
  const expected = crypto.createHmac('sha256', secret).update(json).digest('base64url');
  if (signature.length !== expected.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;

  let payload;
  try {
    payload = JSON.parse(json);
  } catch {
    return null;
  }
  if (!payload.userId || payload.exp * 1000 < Date.now()) return null;
  return payload;
}