# Deploying a client documentation site

This portal uses a **branch-per-client** model. Each client gets their own
Git branch, their own docs, and their own live site — all from this one repo.

```
main ──────────────►  the template / shared baseline (design, components)
 └─ claude ─────────►  https://claude--<your-site>.netlify.app   (Claude's docs)
 └─ acme ───────────►  https://acme--<your-site>.netlify.app     (Acme's docs)
```

---

## One-time setup (done once, by an admin)

1. Push this repo to GitHub (or GitLab).
2. In Netlify: **Add new site → Import from Git**, pick the repo.
   - Build command: `npm run build`  •  Publish directory: `dist`
   (both already set in `netlify.toml`).
3. Turn on branch deploys: **Site settings → Build & deploy → Branch deploys
   → All / or list the client branches.**
4. Set the base environment variables (**Site settings → Environment variables**,
   scope must include *Functions* and *Edge Functions*):
   - `SESSION_SECRET` — a long random string (used to sign login sessions).
     Set a **per-branch** value too (see below) so each client's sessions are
     signed independently.
   - `PORTAL_PASSWORD` — a default password (each client branch overrides this).
   - `SESSION_VERSION` *(optional)* — defaults to `1`. Bump it for a branch to
     force every logged-in user of that client back to the login screen
     (no secret rotation needed).
   - `ADMIN_PASSWORD` *(optional)* — enables comment moderation. When set, staff
     can delete comments via the **Moderate** button in the comments widget.
     Use a value different from `PORTAL_PASSWORD`.

---

## Publishing a site for a new client

Say the client is **Claude**.

### 1. Create the client branch

```bash
git checkout main
git pull
git checkout -b claude
```

### 2. Add the client's docs

Put Markdown files in `src/content/docs/`. Folders become sidebar groups.

```
src/content/docs/
  index.mdx              ← homepage (keep it)
  overview.md
  Setup/
    installation.md
```

Each file needs a `title:` at the top:

```markdown
---
title: Overview
---

Your content here…
```

> Tip: preview locally first with `npm start`, then open the printed
> `http://localhost:8888` URL.

### 3. Push the branch

```bash
git add .
git commit -m "Docs for Claude"
git push -u origin claude
```

Netlify builds it automatically and gives you a URL like
`https://claude--<your-site>.netlify.app`.

### 4. Give the client their password + comment isolation

In Netlify, set **branch-scoped** environment variables for the `claude`
branch (**Environment variables → edit → "Different value for each deploy
context / branch" → claude**):

| Variable | Value | Why |
| --- | --- | --- |
| `PORTAL_PASSWORD` | a password just for this client | So each client logs in separately. |
| `SESSION_SECRET` | a fresh long random string per client | Signs this client's sessions independently — rotating one client never logs the others out. |
| `CLIENT_ID` | `claude` | **Keeps this client's comments separate** from every other client. |

> ⚠️ **Always set `CLIENT_ID` on a client branch.** Without it, comments fall
> back to a shared "default" store and could mix with other clients.

### 5. Share with the client

Send them:
- The URL: `https://claude--<your-site>.netlify.app`
- The password you set in `PORTAL_PASSWORD` for their branch.

---

## Reading a client's comments

Open that client's site (e.g. `https://claude--<your-site>.netlify.app`), log
in with their password, and scroll to the bottom of any doc page — comments
left on that page appear there. Because each branch has its own `CLIENT_ID`,
you only ever see that client's feedback.

---

## Updating a client's docs later

```bash
git checkout claude
# edit / add Markdown in src/content/docs/
git add .
git commit -m "Update Claude docs"
git push
```

The push redeploys that client's site automatically.

---

## Pulling shared improvements into a client branch

When `main` gets design or feature updates, bring them into a client branch:

```bash
git checkout claude
git merge main
git push
```
