import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeKey, check, record, reset } from '../netlify/edge-functions/lib/ratelimit.mjs';

/** Minimal in-memory stand-in for the Netlify Blobs store API used here. */
function fakeStore() {
  const map = new Map();
  return {
    map,
    async get(key) {
      return map.has(key) ? map.get(key) : null;
    },
    async setJSON(key, value) {
      map.set(key, value);
    },
    async delete(key) {
      map.delete(key);
    },
  };
}

test('makeKey sanitizes and prefixes identifiers', () => {
  assert.equal(makeKey('login', '203.0.113.7'), 'login:203.0.113.7');
  assert.equal(makeKey('login', 'AB::CD!!'), 'login:ab::cd_');
  assert.equal(makeKey('login', ''), 'login:unknown');
  assert.equal(makeKey('login', undefined), 'login:unknown');
});

test('allows up to max, then blocks within the window', async () => {
  const store = fakeStore();
  const key = makeKey('login', '1.2.3.4');
  const opts = { max: 3, windowSec: 900, nowMs: 1000 };

  for (let i = 0; i < 3; i++) {
    const gate = await check(store, key, opts);
    assert.equal(gate.blocked, false, `attempt ${i} should be allowed`);
    await record(store, key, opts);
  }
  const blockedGate = await check(store, key, opts);
  assert.equal(blockedGate.blocked, true);
  assert.ok(blockedGate.retryAfterSec > 0);
});

test('window expiry resets the counter', async () => {
  const store = fakeStore();
  const key = makeKey('login', '5.6.7.8');
  const start = 1000;
  const opts = { max: 2, windowSec: 60 };

  await record(store, key, { ...opts, nowMs: start });
  await record(store, key, { ...opts, nowMs: start });
  assert.equal((await check(store, key, { ...opts, nowMs: start })).blocked, true);

  // 61s later the window has elapsed → fresh allowance.
  const later = start + 61_000;
  assert.equal((await check(store, key, { ...opts, nowMs: later })).blocked, false);
  const rec = await record(store, key, { ...opts, nowMs: later });
  assert.equal(rec.count, 1);
});

test('reset clears the counter (successful login)', async () => {
  const store = fakeStore();
  const key = makeKey('login', '9.9.9.9');
  const opts = { max: 1, windowSec: 900, nowMs: 1000 };

  await record(store, key, opts);
  assert.equal((await check(store, key, opts)).blocked, true);
  await reset(store, key);
  assert.equal((await check(store, key, opts)).blocked, false);
});
