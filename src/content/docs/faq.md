---
title: FAQ
description: Answers to the questions customers ask most often.
sidebar:
  order: 2
---

Answers to the questions we hear most often. If yours isn't here, leave a
comment at the bottom of the relevant page or contact your Ingsoftware team.

## Access & accounts

### How do I reset my password?

Use the **Forgot password** link on the sign-in page. If your organisation
uses single sign-on, password resets are handled by your identity provider
instead.

### Can I have more than one workspace?

Yes. Most customers start with one and add more only if they need fully
separate environments (for example, production and staging).

## Data

### Is my data backed up?

Yes. Data is backed up continuously, and deleted records remain recoverable
for the period set by `retention.days` in your [configuration](/setup/configuration/).

### Where is my data stored?

In the region set by the `region` option in your configuration. Changing the
region after setup requires a migration — contact support before doing so.

## Billing & plans

### What's the difference between plans?

| Feature | Starter | Team | Enterprise |
| --- | :---: | :---: | :---: |
| Projects | 1 | 10 | Unlimited |
| Members | 3 | 25 | Unlimited |
| SSO | | | ✓ |
| Priority support | | ✓ | ✓ |

:::tip
Not sure which plan fits? Your Ingsoftware contact can help you compare based
on how your team actually uses the platform.
:::

## Troubleshooting

### An integration shows a warning — what now?

Run `ing status` to see the specific message. The most common cause is an
expired credential; re-authenticate the integration with
`ing integration reauth <name>`.

### My import reported errors

Re-run it with `--dry-run` to see exactly which rows failed and why. Imports
are validated row by row, so a single bad row won't block the rest unless you
used `--on-conflict fail`.
