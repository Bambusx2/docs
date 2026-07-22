import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  createSessionToken,
  verifySessionToken,
  verifySession,
  verifyPassword,
} from '../netlify/edge-functions/lib/session.mjs';

const SECRET = 'unit-test-secret-0123456789abcdef';

test('valid token round-trips', async () => {
  const token = await createSessionToken(SECRET, 3600);
  assert.equal(await verifySessionToken(SECRET, token), true);
});

test('expired token is rejected', async () => {
  const now = Date.now();
  const token = await createSessionToken(SECRET, 60, now);
  assert.equal(await verifySessionToken(SECRET, token, now + 61_000), false);
});

test('token signed with a different secret is rejected', async () => {
  const token = await createSessionToken('some-other-secret-secret', 3600);
  assert.equal(await verifySessionToken(SECRET, token), false);
});

test('tampered expiry is rejected', async () => {
  const token = await createSessionToken(SECRET, 60);
  const [v, exp, gen, role, sig] = token.split('.');
  const tampered = `${v}.${Number(exp) + 999999}.${gen}.${role}.${sig}`;
  assert.equal(await verifySessionToken(SECRET, tampered), false);
});

test('garbage tokens are rejected', async () => {
  // Includes older 3- and 4-segment formats, which must no longer verify.
  for (const bad of [undefined, null, '', 'v1', 'v1.123', 'v1.9999999999.abc', 'a.b.c.d.e', 42]) {
    assert.equal(await verifySessionToken(SECRET, bad), false, `should reject: ${bad}`);
  }
});

test('token from a newer generation is rejected after a SESSION_VERSION bump', async () => {
  const token = await createSessionToken(SECRET, 3600, Date.now(), '1');
  assert.equal(await verifySessionToken(SECRET, token, Date.now(), '1'), true);
  // Operator bumps SESSION_VERSION to "2" → every "1" token is now invalid.
  assert.equal(await verifySessionToken(SECRET, token, Date.now(), '2'), false);
});

test('tampered generation is rejected', async () => {
  const token = await createSessionToken(SECRET, 3600, Date.now(), '1');
  const [v, exp, , role, sig] = token.split('.');
  const forged = `${v}.${exp}.2.${role}.${sig}`; // claim generation 2 with a gen-1 signature
  assert.equal(await verifySessionToken(SECRET, forged, Date.now(), '2'), false);
});

test('verifySession reports the role for valid tokens', async () => {
  const userTok = await createSessionToken(SECRET, 3600, Date.now(), '1', 'user');
  const adminTok = await createSessionToken(SECRET, 3600, Date.now(), '1', 'admin');
  assert.deepEqual(await verifySession(SECRET, userTok), { valid: true, role: 'user' });
  assert.deepEqual(await verifySession(SECRET, adminTok), { valid: true, role: 'admin' });
});

test('verifySession returns role null for invalid tokens', async () => {
  assert.deepEqual(await verifySession(SECRET, 'nonsense'), { valid: false, role: null });
  const wrongSecret = await createSessionToken('a-different-secret-value-xx', 3600);
  assert.deepEqual(await verifySession(SECRET, wrongSecret), { valid: false, role: null });
});

test('a forged admin role (signed as user) cannot escalate', async () => {
  // Take a real user token and flip the role segment to admin.
  const userTok = await createSessionToken(SECRET, 3600, Date.now(), '1', 'user');
  const [v, exp, gen, , sig] = userTok.split('.');
  const forged = `${v}.${exp}.${gen}.a.${sig}`;
  assert.deepEqual(await verifySession(SECRET, forged), { valid: false, role: null });
});

test('correct password verifies', async () => {
  assert.equal(await verifyPassword(SECRET, 'hunter2', 'hunter2'), true);
});

test('wrong/empty passwords are rejected', async () => {
  assert.equal(await verifyPassword(SECRET, 'hunter3', 'hunter2'), false);
  assert.equal(await verifyPassword(SECRET, '', 'hunter2'), false);
  assert.equal(await verifyPassword(SECRET, null, 'hunter2'), false);
});
