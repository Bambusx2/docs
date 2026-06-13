import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import handler from '../netlify/edge-functions/auth.mjs';
import { createSessionToken } from '../netlify/edge-functions/lib/session.mjs';

const SECRET = 'integration-test-secret-0123456789';
const PASSWORD = 'correct horse battery staple';
const ORIGIN = 'https://docs.example.com';

const context = {
  next: async () => new Response('PROTECTED CONTENT', { status: 200 }),
};

function getCookieValue(response) {
  const setCookie = response.headers.get('set-cookie') ?? '';
  const match = setCookie.match(/__docs_session=([^;]*)/);
  return match ? match[1] : undefined;
}

beforeEach(() => {
  process.env.PORTAL_PASSWORD = PASSWORD;
  process.env.SESSION_SECRET = SECRET;
});

test('fails closed (503) when env vars are missing', async () => {
  delete process.env.PORTAL_PASSWORD;
  delete process.env.SESSION_SECRET;
  const res = await handler(new Request(`${ORIGIN}/`), context);
  assert.equal(res.status, 503);
});

test('fails closed (503) when secret is too short', async () => {
  process.env.SESSION_SECRET = 'short';
  const res = await handler(new Request(`${ORIGIN}/`), context);
  assert.equal(res.status, 503);
});

test('unauthenticated page request redirects to /login', async () => {
  const res = await handler(new Request(`${ORIGIN}/guides/managing-users/`), context);
  assert.equal(res.status, 303);
  assert.equal(res.headers.get('location'), '/login?next=%2Fguides%2Fmanaging-users%2F');
});

test('unauthenticated static asset request is also gated', async () => {
  const res = await handler(new Request(`${ORIGIN}/_astro/app.123abc.css`), context);
  assert.equal(res.status, 303);
  assert.match(res.headers.get('location'), /^\/login\?next=/);
});

test('login page is served with noindex and no-store', async () => {
  const res = await handler(new Request(`${ORIGIN}/login`), context);
  assert.equal(res.status, 200);
  assert.match(await res.text(), /Customer documentation/);
  assert.match(res.headers.get('x-robots-tag'), /noindex/);
  assert.equal(res.headers.get('cache-control'), 'no-store');
});

test('correct password sets HttpOnly Secure cookie and redirects to next', async () => {
  const res = await handler(
    new Request(`${ORIGIN}/login`, {
      method: 'POST',
      body: new URLSearchParams({ password: PASSWORD, next: '/faq/' }),
    }),
    context
  );
  assert.equal(res.status, 303);
  assert.equal(res.headers.get('location'), '/faq/');
  const setCookie = res.headers.get('set-cookie');
  assert.match(setCookie, /__docs_session=v1\./);
  assert.match(setCookie, /HttpOnly/);
  assert.match(setCookie, /Secure/);
  assert.match(setCookie, /SameSite=Lax/);
});

test('wrong password returns 401 and no cookie', async () => {
  const res = await handler(
    new Request(`${ORIGIN}/login`, {
      method: 'POST',
      body: new URLSearchParams({ password: 'nope', next: '/' }),
    }),
    context
  );
  assert.equal(res.status, 401);
  assert.equal(res.headers.get('set-cookie'), null);
  assert.match(await res.text(), /Incorrect password/);
});

test('open-redirect attempts in next are neutralized', async () => {
  for (const evil of ['https://evil.example', '//evil.example', '/\\evil']) {
    const res = await handler(
      new Request(`${ORIGIN}/login`, {
        method: 'POST',
        body: new URLSearchParams({ password: PASSWORD, next: evil }),
      }),
      context
    );
    assert.equal(res.headers.get('location'), '/', `should sanitize: ${evil}`);
  }
});

test('valid session cookie unlocks content with security headers', async () => {
  const token = await createSessionToken(SECRET, 3600);
  const res = await handler(
    new Request(`${ORIGIN}/`, { headers: { cookie: `__docs_session=${token}` } }),
    context
  );
  assert.equal(res.status, 200);
  assert.equal(await res.text(), 'PROTECTED CONTENT');
  assert.match(res.headers.get('x-robots-tag'), /noindex/);
  assert.equal(res.headers.get('x-frame-options'), 'DENY');
});

test('expired session cookie redirects to login', async () => {
  const token = await createSessionToken(SECRET, 1, Date.now() - 10_000);
  const res = await handler(
    new Request(`${ORIGIN}/`, { headers: { cookie: `__docs_session=${token}` } }),
    context
  );
  assert.equal(res.status, 303);
  assert.match(res.headers.get('location'), /^\/login/);
});

test('forged cookie (wrong secret) redirects to login', async () => {
  const token = await createSessionToken('attacker-controlled-secret-xx', 3600);
  const res = await handler(
    new Request(`${ORIGIN}/`, { headers: { cookie: `__docs_session=${token}` } }),
    context
  );
  assert.equal(res.status, 303);
});

test('/logout clears the cookie and redirects to /login', async () => {
  const res = await handler(new Request(`${ORIGIN}/logout`), context);
  assert.equal(res.status, 303);
  assert.equal(res.headers.get('location'), '/login');
  assert.match(res.headers.get('set-cookie'), /Max-Age=0/);
});

test('already-authenticated visit to /login redirects home', async () => {
  const token = await createSessionToken(SECRET, 3600);
  const res = await handler(
    new Request(`${ORIGIN}/login`, { headers: { cookie: `__docs_session=${token}` } }),
    context
  );
  assert.equal(res.status, 303);
  assert.equal(res.headers.get('location'), '/');
});
