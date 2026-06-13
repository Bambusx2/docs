---
title: Configuration
description: How to configure your workspace using the configuration file and environment variables.
sidebar:
  order: 2
---

The platform is configured through a single `ing.config.json` file at the root
of your project, with sensitive values supplied via environment variables.

## The configuration file

A minimal configuration looks like this:

```json title="ing.config.json"
{
  "workspace": "acme-production",
  "region": "eu-central",
  "features": {
    "auditLog": true,
    "sso": false
  },
  "retention": {
    "days": 90
  }
}
```

### Available options

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `workspace` | string | — | The workspace slug. Required. |
| `region` | string | `eu-central` | Data residency region. |
| `features.auditLog` | boolean | `true` | Records every change for compliance. |
| `features.sso` | boolean | `false` | Enables single sign-on (Enterprise plans). |
| `retention.days` | number | `90` | How long deleted records are recoverable. |

## Environment variables

Never commit secrets to the configuration file. Supply them through the
environment instead:

```bash
# .env  (do not commit this file)
ING_API_KEY=sk_live_xxxxxxxxxxxxxxxx
ING_WEBHOOK_SECRET=whsec_xxxxxxxxxxxx
```

:::danger
Treat `ING_API_KEY` like a password. If it is ever exposed, rotate it
immediately from **Settings → API keys** and update your environment.
:::

## Applying changes

After editing the configuration, validate and apply it:

```bash
ing config validate
ing config apply
```

:::note
`ing config validate` checks your file against the schema without making any
changes — run it in CI to catch mistakes before they reach production.
:::
