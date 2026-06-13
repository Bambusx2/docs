/**
 * Session token + password verification using only the Web Crypto API,
 * so the same code runs on Netlify Edge (Deno) and in Node tests.
 *
 * Token format: "v1.<expiryEpochSeconds>.<generation>.<role>.<hmacSha256Hex>"
 * The HMAC covers version + expiry + generation + role, keyed by SESSION_SECRET.
 *
 * `generation` is a server-side revocation knob (the SESSION_VERSION env var).
 * Bumping it makes every previously issued token fail verification — a clean
 * "log everyone on this site out now" switch that does NOT require rotating
 * the signing secret. Defaults to "1".
 *
 * `role` is "u" (customer) or "a" (admin). An admin session is issued when
 * someone logs in with ADMIN_PASSWORD instead of PORTAL_PASSWORD; it unlocks
 * comment moderation. Because the role lives inside the signed payload, it
 * cannot be forged or upgraded client-side.
 */

const VERSION = 'v1';
const DEFAULT_GENERATION = '1';
const ROLE_ADMIN = 'a';
const ROLE_USER = 'u';
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

/**
 * Create a signed session token valid for ttlSeconds from now.
 * `role` is 'admin' or 'user' (anything else is treated as 'user').
 */
export async function createSessionToken(
  secret,
  ttlSeconds,
  nowMs = Date.now(),
  generation = DEFAULT_GENERATION,
  role = 'user'
) {
  const expiry = Math.floor(nowMs / 1000) + ttlSeconds;
  const gen = String(generation ?? DEFAULT_GENERATION);
  const r = role === 'admin' ? ROLE_ADMIN : ROLE_USER;
  const payload = `${VERSION}.${expiry}.${gen}.${r}`;
  const sig = await hmacHex(secret, payload);
  return `${payload}.${sig}`;
}

/**
 * Verify a session token and return its role.
 * Returns { valid, role } where role is 'admin' | 'user' | null.
 * Checks format, expiry, current generation, and signature.
 */
export async function verifySession(
  secret,
  token,
  nowMs = Date.now(),
  expectedGeneration = DEFAULT_GENERATION
) {
  const fail = { valid: false, role: null };
  if (typeof token !== 'string') return fail;
  const parts = token.split('.');
  if (parts.length !== 5) return fail;
  const [version, expiryStr, genStr, roleStr, sig] = parts;
  if (version !== VERSION) return fail;
  if (genStr !== String(expectedGeneration ?? DEFAULT_GENERATION)) return fail;
  if (roleStr !== ROLE_ADMIN && roleStr !== ROLE_USER) return fail;
  const expiry = Number.parseInt(expiryStr, 10);
  if (!Number.isFinite(expiry)) return fail;
  if (expiry * 1000 <= nowMs) return fail;
  const expected = await hmacHex(secret, `${version}.${expiryStr}.${genStr}.${roleStr}`);
  if (!timingSafeEqual(sig, expected)) return fail;
  return { valid: true, role: roleStr === ROLE_ADMIN ? 'admin' : 'user' };
}

/** Boolean convenience wrapper used by the auth gate (role-agnostic). */
export async function verifySessionToken(secret, token, nowMs = Date.now(), expectedGeneration = DEFAULT_GENERATION) {
  return (await verifySession(secret, token, nowMs, expectedGeneration)).valid;
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
