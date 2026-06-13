---
title: Vlatko
description: Requirements and step-by-step instructions for getting the platform running in your environment.
sidebar:
  order: 2
---

This guide walks you through a first-time installation. It should take about
15 minutes for a standard setup.

## Requirements

Before you begin, make sure your environment meets the following:

| Requirement | Minimum | Recommended |
| --- | --- | --- |
| Node.js | 18 LTS | 22 LTS |
| Memory | 2 GB | 4 GB |
| Disk | 5 GB free | 20 GB free |
| Network | Outbound HTTPS (443) | Outbound HTTPS (443) |

:::caution
Installations on unsupported runtime versions are not covered by support.
Check your version with `node --version` before continuing.
:::

## Install the CLI

The command-line tool is the fastest way to provision and manage your
workspace.

```bash
# Install globally with npm
npm install -g @ingsoftware/cli

# Verify the installation
ing --version
```

## Authenticate

Log in with the credentials provided by your Ingsoftware contact. This opens
a browser window to complete sign-in.

```bash
ing auth login
```

Once authenticated, your session token is stored locally and reused for
subsequent commands.

## Initialise a workspace

```bash title="Terminal"
ing workspace init --name "Acme Production"
```

You should see output confirming the workspace was created:

```
✔ Workspace "Acme Production" created
✔ Default project "main" added
→ Next: run `ing project list` to see your projects
```

:::tip
Run `ing --help` at any time to see the full list of available commands and
flags.
:::

## Next steps

With the workspace in place, continue to [Configuration](/setup/configuration/)
to tailor it to your team.
