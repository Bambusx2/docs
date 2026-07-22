/**
 * Comments API for the documentation portal.
 *
 *   GET    /api/comments?page=<pathname>        → { comments: [...] }
 *   POST   /api/comments  { page, name, body }  → { comment }
 *   DELETE /api/comments  { page, id, adminPassword } → { ok: true }
 *
 * Storage is Netlify Blobs (one JSON array of comments per doc page). No
 * external database. Every request is gated by the SAME session cookie the
 * Edge auth function issues, verified here again as defense in depth — so the
 * endpoint is unreachable without a valid portal login.
 *
 * Authorship is self-declared: the `name` field is whatever the commenter
 * typed and is NOT verified (the portal uses a single shared password).
 *
 * Moderation: deletion is authorized by the SESSION, not by a password in the
 * request. A session is "admin" when the user logged in with ADMIN_PASSWORD
 * (see the auth edge function). Admins can DELETE any comment; everyone else
 * gets 403. GET reports `canModerate` so the UI can show delete controls only
 * to admins.
 */
import { getStore } from '@netlify/blobs';
import { verifySession } from '../edge-functions/lib/session.mjs';
import { makeKey, check, record } from '../edge-functions/lib/ratelimit.mjs';

const COOKIE_NAME = '__docs_session';
const MAX_NAME = 80;
const MAX_BODY = 4000;
const MAX_COMMENTS_PER_PAGE = 500; // hard cap to keep a blob from growing unbounded

// Per-IP comment posting throttle (anti-spam for the shared-password portal).
const MAX_POSTS = 20;
const POST_WINDOW_SECONDS = 60;

function env(name) {
  return globalThis.Netlify?.env?.get(name) ?? globalThis.process?.env?.[name];
}

function clientIp(request) {
  return (
    request.headers.get('x-nf-client-connection-ip') ??
    (request.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() ??
    'unknown'
  );
}

/** Stable client id from CLIENT_ID, used to namespace per-client stores. */
function clientId() {
  const raw = env('CLIENT_ID') || 'default';
  return (
    raw
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'default'
  );
}

/**
 * Isolate comments per client. Netlify Blobs are scoped to the SITE, so every
 * branch deploy of the same site would otherwise share one comment store and
 * clients could see each other's feedback on same-path pages. Each client
 * branch sets CLIENT_ID (a branch-scoped env var) so its comments live in
 * their own store. `main` and any branch without CLIENT_ID fall back to
 * "default".
 */
function commentStore() {
  // Strong consistency: a read always reflects the most recent write. Without
  // this, Netlify Blobs defaults to eventual consistency, so a just-deleted (or
  // just-posted) comment can still appear on the next GET until the read cache
  // catches up — which looks like "deleted comments come back".
  return getStore({ name: `comments-${clientId()}`, consistency: 'strong' });
}

/** Throttle store (per client), or null if Blobs is unavailable (fail-open). */
function throttleStore() {
  try {
    return getStore(`comment-throttle-${clientId()}`);
  } catch {
    return null;
  }
}

function getCookie(cookieHeader, name) {
  for (const part of (cookieHeader ?? '').split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return v.join('=');
  }
  return undefined;
}

/** Normalize a page pathname into a stable, safe blob key. */
export function pageKey(page) {
  const cleaned = String(page)
    .trim()
    .toLowerCase()
    .replace(/^\/+|\/+$/g, '') // drop leading/trailing slashes
    .replace(/[^a-z0-9/_-]+/g, '_') // keep word-ish chars, collapse the rest
    .replace(/\//g, '__'); // flatten path separators
  return cleaned || 'index';
}

/** Trim + length-cap a self-declared author name. */
export function clampName(value) {
  return (typeof value === 'string' ? value : '').trim().slice(0, MAX_NAME);
}

/** Trim + length-cap a comment body. */
export function clampBody(value) {
  return (typeof value === 'string' ? value : '').trim().slice(0, MAX_BODY);
}

/** Return a new array with the comment matching `id` removed. */
export function removeById(comments, id) {
  const list = Array.isArray(comments) ? comments : [];
  const out = list.filter((c) => c && c.id !== id);
  return { comments: out, removed: out.length !== list.length };
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
    },
  });
}

export default async function handler(request) {
  const secret = env('SESSION_SECRET');
  if (!secret) return json({ error: 'Comments are not configured.' }, 503);
  const generation = env('SESSION_VERSION') || '1';

  // Reuse the portal session: no valid cookie, no access. The session's role
  // (set at login) decides whether this user can moderate.
  const token = getCookie(request.headers.get('cookie'), COOKIE_NAME);
  const session = await verifySession(secret, token, Date.now(), generation);
  if (!session.valid) {
    return json({ error: 'Not authenticated.' }, 401);
  }
  const isAdmin = session.role === 'admin';

  const store = commentStore();
  const url = new URL(request.url);

  if (request.method === 'GET') {
    const page = url.searchParams.get('page');
    if (!page) return json({ error: 'Missing "page" parameter.' }, 400);
    const comments = (await store.get(pageKey(page), { type: 'json' })) ?? [];
    return json({ comments, canModerate: isAdmin });
  }

  if (request.method === 'POST') {
    const payload = await request.json().catch(() => null);
    if (!payload || typeof payload !== 'object') {
      return json({ error: 'Invalid request body.' }, 400);
    }

    const page = typeof payload.page === 'string' ? payload.page : '';
    const name = clampName(payload.name);
    const body = clampBody(payload.body);

    if (!page) return json({ error: 'Missing page.' }, 400);
    if (!body) return json({ error: 'Comment text is required.' }, 400);

    // Anti-spam: cap posts per IP per minute (fail-open if Blobs is down).
    const throttle = throttleStore();
    if (throttle) {
      const tkey = makeKey('post', clientIp(request));
      const topts = { max: MAX_POSTS, windowSec: POST_WINDOW_SECONDS };
      try {
        const gate = await check(throttle, tkey, topts);
        if (gate.blocked) {
          return json({ error: 'You are posting too fast. Please wait a moment.' }, 429);
        }
        await record(throttle, tkey, topts);
      } catch {
        /* fail-open on throttle errors */
      }
    }

    const key = pageKey(page);
    const comments = (await store.get(key, { type: 'json' })) ?? [];

    const comment = {
      id: crypto.randomUUID(),
      name: name || 'Anonymous',
      body,
      created_at: new Date().toISOString(),
    };
    comments.push(comment);

    // Keep only the most recent N to bound blob size.
    if (comments.length > MAX_COMMENTS_PER_PAGE) {
      comments.splice(0, comments.length - MAX_COMMENTS_PER_PAGE);
    }

    await store.setJSON(key, comments);
    return json({ comment }, 201);
  }

  if (request.method === 'DELETE') {
    // Only an admin session may delete. Customers never get here.
    if (!isAdmin) {
      return json({ error: 'Not allowed.' }, 403);
    }

    const payload = await request.json().catch(() => null);
    if (!payload || typeof payload !== 'object') {
      return json({ error: 'Invalid request body.' }, 400);
    }

    const page = typeof payload.page === 'string' ? payload.page : '';
    const id = typeof payload.id === 'string' ? payload.id : '';
    if (!page || !id) return json({ error: 'Missing page or id.' }, 400);

    const key = pageKey(page);
    const existing = (await store.get(key, { type: 'json' })) ?? [];
    const { comments, removed } = removeById(existing, id);
    if (!removed) return json({ error: 'Comment not found.' }, 404);
    await store.setJSON(key, comments);
    return json({ ok: true });
  }

  return json({ error: 'Method not allowed.' }, 405);
}

export const config = { path: '/api/comments' };
