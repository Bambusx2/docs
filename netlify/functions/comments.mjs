/**
 * Comments API for the documentation portal.
 *
 *   GET  /api/comments?page=<pathname>   → { comments: [...] }
 *   POST /api/comments  { page, name, body } → { comment }
 *
 * Storage is Netlify Blobs (one JSON array of comments per doc page). No
 * external database. Every request is gated by the SAME session cookie the
 * Edge auth function issues, verified here again as defense in depth — so the
 * endpoint is unreachable without a valid portal login.
 *
 * Authorship is self-declared: the `name` field is whatever the commenter
 * typed and is NOT verified (the portal uses a single shared password).
 */
import { getStore } from '@netlify/blobs';
import { verifySessionToken } from '../edge-functions/lib/session.mjs';

const COOKIE_NAME = '__docs_session';
const MAX_NAME = 80;
const MAX_BODY = 4000;
const MAX_COMMENTS_PER_PAGE = 500; // hard cap to keep a blob from growing unbounded

function env(name) {
  return globalThis.Netlify?.env?.get(name) ?? globalThis.process?.env?.[name];
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
  const raw = env('CLIENT_ID') || 'default';
  const id =
    raw
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'default';
  return getStore(`comments-${id}`);
}

function getCookie(cookieHeader, name) {
  for (const part of (cookieHeader ?? '').split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return v.join('=');
  }
  return undefined;
}

/** Normalize a page pathname into a stable, safe blob key. */
function pageKey(page) {
  const cleaned = String(page)
    .trim()
    .toLowerCase()
    .replace(/^\/+|\/+$/g, '') // drop leading/trailing slashes
    .replace(/[^a-z0-9/_-]+/g, '_') // keep word-ish chars, collapse the rest
    .replace(/\//g, '__'); // flatten path separators
  return cleaned || 'index';
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  });
}

export default async function handler(request) {
  const secret = env('SESSION_SECRET');
  if (!secret) return json({ error: 'Comments are not configured.' }, 503);

  // Reuse the portal session: no valid cookie, no access.
  const token = getCookie(request.headers.get('cookie'), COOKIE_NAME);
  if (!token || !(await verifySessionToken(secret, token))) {
    return json({ error: 'Not authenticated.' }, 401);
  }

  const store = commentStore();
  const url = new URL(request.url);

  if (request.method === 'GET') {
    const page = url.searchParams.get('page');
    if (!page) return json({ error: 'Missing "page" parameter.' }, 400);
    const comments = (await store.get(pageKey(page), { type: 'json' })) ?? [];
    return json({ comments });
  }

  if (request.method === 'POST') {
    const payload = await request.json().catch(() => null);
    if (!payload || typeof payload !== 'object') {
      return json({ error: 'Invalid request body.' }, 400);
    }

    const page = typeof payload.page === 'string' ? payload.page : '';
    const name = (typeof payload.name === 'string' ? payload.name : '')
      .trim()
      .slice(0, MAX_NAME);
    const body = (typeof payload.body === 'string' ? payload.body : '')
      .trim()
      .slice(0, MAX_BODY);

    if (!page) return json({ error: 'Missing page.' }, 400);
    if (!body) return json({ error: 'Comment text is required.' }, 400);

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

  return json({ error: 'Method not allowed.' }, 405);
}

export const config = { path: '/api/comments' };
