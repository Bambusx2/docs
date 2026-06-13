import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  createSessionToken,
  verifySessionToken,
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
  const [v, exp, gen, sig] = token.split('.');
  const tampered = `${v}.${Number(exp) + 999999}.${gen}.${sig}`;
  assert.equal(await verifySessionToken(SECRET, tampered), false);
});

test('garbage tokens are rejected', async () => {
  // Includes the old 3-segment v1 format, which must no longer verify.
  for (const bad of [undefined, null, '', 'v1', 'v1.123', 'v1.9999999999.abc', 'a.b.c.d', 42]) {
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
  const [v, exp, , sig] = token.split('.');
  const forged = `${v}.${exp}.2.${sig}`; // claim generation 2 with a gen-1 signature
  assert.equal(await verifySessionToken(SECRET, forged, Date.now(), '2'), false);
});

test('correct password verifies', async () => {
  assert.equal(await verifyPassword(SECRET, 'hunter2', 'hunter2'), true);
});

test('wrong/empty passwords are rejected', async () => {
  assert.equal(await verifyPassword(SECRET, 'hunter3', 'hunter2'), false);
  assert.equal(await verifyPassword(SECRET, '', 'hunter2'), false);
  assert.equal(await verifyPassword(SECRET, null, 'hunter2'), false);
});
