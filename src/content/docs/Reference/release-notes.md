---
title: Release notes
description: A chronological record of new features, improvements, and fixes to the platform.
sidebar:
  order: 2
---

The latest changes to the platform, newest first. Dates are in ISO format
(YYYY-MM-DD).

## 2026-06-01 — v2.4

**New**

- Single sign-on (SSO) via SAML is now available on Enterprise plans.
- Imports now support an `--on-conflict` strategy for handling duplicates.

**Improved**

- The CLI `ing status` command now reports integration health individually.
- Audit log exports are up to 3× faster for large workspaces.

:::note
SSO requires a one-time setup with your identity provider. See your Ingsoftware
contact to enable it for your workspace.
:::

## 2026-04-15 — v2.3

**New**

- Added the `/imports` API endpoint for programmatic bulk imports.

**Fixed**

- Resolved an issue where read-only integrations could briefly report a
  write error during initial sync.
- Corrected pagination on the `/projects` endpoint when more than 100 projects
  existed.

## 2026-02-20 — v2.2

**Improved**

- Reduced cold-start time for new workspaces.
- Clearer validation messages during `ing config validate`.

**Fixed**

- Fixed a rare case where CSV imports with trailing empty rows reported an
  incorrect total.
