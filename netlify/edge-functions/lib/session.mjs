/**
 * Session token + password verification using only the Web Crypto API,
 * so the same code runs on Netlify Edge (Deno) and in Node tests.
 *
 * Token format: "v1.<expiryEpochSeconds>.<hmacSha256Hex>"
 * The HMAC covers the version + expiry, keyed by SESSION_SECRET.
 */

const VERSION = 'v1';
const encoder = new TextEncoder();

async function hmacHex(secret, message) {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(message));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Constant-time comparison of two strings of equal expected length. */
function timingSafeEqual(a, b) {
  const bufA = encoder.encode(a);
  const bufB = encoder.encode(b);
  if (bufA.length !== bufB.length) return false;
  let diff = 0;
  for (let i = 0; i < bufA.length; i++) diff |= bufA[i] ^ bufB[i];
  return diff === 0;
}

/** Create a signed session token valid for ttlSeconds from now. */
export async function createSessionToken(secret, ttlSeconds, nowMs = Date.now()) {
  const expiry = Math.floor(nowMs / 1000) + ttlSeconds;
  const payload = `${VERSION}.${expiry}`;
  const sig = await hmacHex(secret, payload);
  return `${payload}.${sig}`;
}

/** Verify a session token: correct format, unexpired, valid signature. */
export async function verifySessionToken(secret, token, nowMs = Date.now()) {
  if (typeof token !== 'string') return false;
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  const [version, expiryStr, sig] = parts;
  if (version !== VERSION) return false;
  const expiry = Number.parseInt(expiryStr, 10);
  if (!Number.isFinite(expiry)) return false;
  if (expiry * 1000 <= nowMs) return false;
  const expected = await hmacHex(secret, `${version}.${expiryStr}`);
  return timingSafeEqual(sig, expected);
}

/**
 * Constant-time password check. Both inputs are HMAC-digested with the session
 * secret first, so the comparison length is fixed and reveals nothing about
 * the real password's length or content.
 */
export async function verifyPassword(secret, supplied, actual) {
  if (typeof supplied !== 'string' || supplied.length === 0) return false;
  const a = await hmacHex(secret, `pw.${supplied}`);
  const b = await hmacHex(secret, `pw.${actual}`);
  return timingSafeEqual(a, b);
}
