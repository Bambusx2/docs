/**
 * Auth gate for the entire documentation portal.
 *
 * Runs on EVERY request (path: "/*"), including static assets, so nothing is
 * reachable without a valid session cookie. Fails closed: if the required
 * environment variables are missing, no content is served.
 *
 * Required environment variables (set in the Netlify UI, never committed):
 *   PORTAL_PASSWORD — shared access password for customers
 *   SESSION_SECRET  — long random string used to sign session cookies
 */
import {
  createSessionToken,
  verifySessionToken,
  verifyPassword,
} from './lib/session.mjs';

const COOKIE_NAME = '__docs_session';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days
const FAILED_LOGIN_DELAY_MS = 400; // slow down brute-force attempts

function env(name) {
  // Netlify Edge exposes Netlify.env; Node (tests) uses process.env.
  return globalThis.Netlify?.env?.get(name) ?? globalThis.process?.env?.[name];
}

function getCookie(request, name) {
  const header = request.headers.get('cookie') ?? '';
  for (const part of header.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return v.join('=');
  }
  return undefined;
}

function sessionCookie(value, maxAgeSeconds) {
  return [
    `${COOKIE_NAME}=${value}`,
    'Path=/',
    'HttpOnly',
    'Secure',
    'SameSite=Lax',
    `Max-Age=${maxAgeSeconds}`,
  ].join('; ');
}

/** Only allow same-site relative redirect targets (no open redirects). */
function safeNext(raw) {
  if (typeof raw !== 'string') return '/';
  if (!raw.startsWith('/') || raw.startsWith('//') || raw.includes('\\')) return '/';
  return raw;
}

function securityHeaders(headers) {
  headers.set('X-Robots-Tag', 'noindex, nofollow');
  headers.set('X-Frame-Options', 'DENY');
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('Referrer-Policy', 'same-origin');
  return headers;
}

function loginPage({ error = '', next = '/' } = {}) {
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Sign in — Ingsoftware Docs</title>
<style>
  :root { color-scheme: dark; }
  * { box-sizing: border-box; margin: 0; }
  body {
    font-family: "Manrope", "Helvetica Neue", "Segoe UI", ui-sans-serif, system-ui, sans-serif;
    background: #050c27;
    color: #e8ecf7;
    min-height: 100vh;
    display: grid;
    place-items: center;
    padding: 1.5rem;
  }
  .card {
    width: 100%;
    max-width: 24rem;
    background: #131a3c;
    border: 1px solid #2b3155;
    border-radius: 1rem;
    padding: 2.25rem 2rem;
  }
  .mark {
    width: 3rem; height: 3rem; border-radius: 0.75rem;
    background: #3412de; color: #fff;
    display: grid; place-items: center;
    font-weight: 800; font-size: 1.4rem;
    margin-bottom: 1.25rem;
  }
  h1 { font-size: 1.3rem; letter-spacing: -0.02em; margin-bottom: 0.4rem; }
  p.sub { color: #8b93b3; font-size: 0.92rem; margin-bottom: 1.5rem; }
  label { display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.4rem; }
  input[type="password"] {
    width: 100%; padding: 0.65rem 0.8rem;
    border-radius: 0.5rem; border: 1px solid #565e80;
    background: #050c27; color: #e8ecf7; font-size: 1rem;
  }
  input[type="password"]:focus { outline: 2px solid #5b4cff; border-color: transparent; }
  button {
    width: 100%; margin-top: 1.1rem; padding: 0.7rem;
    border: 0; border-radius: 999px;
    background: #3412de; color: #fff;
    font-size: 1rem; font-weight: 700; cursor: pointer;
  }
  button:hover { background: #2a0eb5; }
  .error {
    background: #2d0712; border: 1px solid #eb062e; color: #ffb3c0;
    border-radius: 0.5rem; padding: 0.6rem 0.8rem;
    font-size: 0.88rem; margin-bottom: 1.1rem;
  }
  footer { margin-top: 1.5rem; text-align: center; color: #565e80; font-size: 0.8rem; }
</style>
</head>
<body>
  <main class="card">
    <div class="mark" aria-hidden="true">in</div>
    <h1>Customer documentation</h1>
    <p class="sub">This portal is private. Enter the access password provided by your Ingsoftware team.</p>
    ${error ? `<div class="error" role="alert">${error}</div>` : ''}
    <form method="post" action="/login">
      <input type="hidden" name="next" value="${next.replaceAll('"', '&quot;')}">
      <label for="password">Access password</label>
      <input id="password" name="password" type="password" autocomplete="current-password" autofocus required>
      <button type="submit">Sign in</button>
    </form>
    <footer>© Ingsoftware</footer>
  </main>
</body>
</html>`;
  return html;
}

function htmlResponse(body, status, extraHeaders = {}) {
  const headers = securityHeaders(
    new Headers({
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'no-store',
      ...extraHeaders,
    })
  );
  return new Response(body, { status, headers });
}

function redirect(location, extraHeaders = {}) {
  const headers = securityHeaders(
    new Headers({ location, 'cache-control': 'no-store', ...extraHeaders })
  );
  return new Response(null, { status: 303, headers });
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default async function handler(request, context) {
  const url = new URL(request.url);
  const password = env('PORTAL_PASSWORD');
  const secret = env('SESSION_SECRET');

  // Fail closed: never serve content if auth is not configured.
  if (!password || !secret || secret.length < 16) {
    return htmlResponse(
      '<h1>503 — Portal not configured</h1><p>PORTAL_PASSWORD and SESSION_SECRET (16+ chars) must be set.</p>',
      503
    );
  }

  if (url.pathname === '/logout') {
    return redirect('/login', { 'set-cookie': sessionCookie('', 0) });
  }

  if (url.pathname === '/login') {
    if (request.method === 'POST') {
      const form = await request.formData();
      const supplied = form.get('password');
      const next = safeNext(form.get('next'));
      if (await verifyPassword(secret, supplied, password)) {
        const token = await createSessionToken(secret, SESSION_TTL_SECONDS);
        return redirect(next, {
          'set-cookie': sessionCookie(token, SESSION_TTL_SECONDS),
        });
      }
      await sleep(FAILED_LOGIN_DELAY_MS);
      return htmlResponse(loginPage({ error: 'Incorrect password. Please try again.', next }), 401);
    }
    // Already signed in? Go straight to the docs.
    const existing = getCookie(request, COOKIE_NAME);
    if (existing && (await verifySessionToken(secret, existing))) {
      return redirect('/');
    }
    return htmlResponse(loginPage({ next: safeNext(url.searchParams.get('next')) }), 200);
  }

  // Gate everything else, static assets included.
  const token = getCookie(request, COOKIE_NAME);
  if (token && (await verifySessionToken(secret, token))) {
    const response = await context.next();
    const out = new Response(response.body, response);
    securityHeaders(out.headers);
    return out;
  }

  const next = encodeURIComponent(url.pathname + url.search);
  return redirect(`/login?next=${next}`);
}

export const config = { path: '/*' };
