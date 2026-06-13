/**
 * Fixed-window rate limiter backed by an injected key-value store.
 *
 * In production the store is Netlify Blobs; in tests it's a tiny in-memory
 * fake. The store only needs three methods:
 *   get(key, { type: 'json' }) -> value | null
 *   setJSON(key, value)        -> void
 *   delete(key)                -> void            (optional)
 *
 * Approximate by design: Blobs writes are not atomic, so two simultaneous
 * failures could under-count by one. That is irrelevant for brute-force
 * throttling, where the goal is to make sustained guessing impractical.
 *
 * Stored record shape: { count: number, reset: epochMillis }
 */

/** Build a safe store key from an arbitrary identifier (e.g. an IP address). */
export function makeKey(prefix, id) {
  const safe =
    String(id ?? '')
      .toLowerCase()
      .replace(/[^a-z0-9_.:-]+/g, '_')
      .slice(0, 100) || 'unknown';
  return `${prefix}:${safe}`;
}

/**
 * Read the current state for a key without mutating it.
 * Returns { blocked, count, remaining, retryAfterSec, reset }.
 */
export async function check(store, key, { max, windowSec, nowMs = Date.now() }) {
  const rec = await store.get(key, { type: 'json' });
  const active = rec && typeof rec.reset === 'number' && nowMs < rec.reset ? rec : null;
  const count = active ? active.count : 0;
  const reset = active ? active.reset : nowMs + windowSec * 1000;
  return {
    blocked: count >= max,
    count,
    remaining: Math.max(0, max - count),
    retryAfterSec: Math.max(1, Math.ceil((reset - nowMs) / 1000)),
    reset,
  };
}

/**
 * Record one event against a key, opening a fresh window if the previous one
 * has elapsed. Returns the updated record.
 */
export async function record(store, key, { windowSec, nowMs = Date.now() }) {
  const rec = await store.get(key, { type: 'json' });
  const active = rec && typeof rec.reset === 'number' && nowMs < rec.reset ? rec : null;
  const next = active
    ? { count: active.count + 1, reset: active.reset }
    : { count: 1, reset: nowMs + windowSec * 1000 };
  await store.setJSON(key, next);
  return next;
}

/** Clear a key's counter (e.g. after a successful login). */
export async function reset(store, key) {
  if (typeof store.delete === 'function') {
    await store.delete(key);
  } else {
    await store.setJSON(key, { count: 0, reset: 0 });
  }
}
