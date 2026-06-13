---
title: Your first steps
description: A guided walkthrough of the most common tasks for new users, from inviting your team to creating your first project.
sidebar:
  order: 1
---

This guide takes you from an empty workspace to a working setup. Follow it in
order the first time; afterwards, each section stands on its own.

## 1. Invite your team

Add the people who need access. You can invite by email and assign a role at
the same time.

```bash
ing members invite jane@acme.com --role editor
```

Roles control what each member can do:

| Role | Can view | Can edit | Can manage members |
| --- | :---: | :---: | :---: |
| Viewer | ✓ | | |
| Editor | ✓ | ✓ | |
| Admin | ✓ | ✓ | ✓ |

## 2. Create a project

Projects keep work separated. Create one per team or product line.

```bash
ing project create "Mobile App" --description "iOS and Android"
```

## 3. Connect a data source

Link an external system so data flows in automatically.

```bash
ing integration add postgres \
  --host db.internal.acme.com \
  --database analytics \
  --read-only
```

:::tip
Start with a `--read-only` connection while you explore. You can grant write
access later once you're confident in the setup.
:::

## 4. Verify everything works

Run a status check to confirm the project, members, and integrations are
healthy:

```bash
ing status
```

A healthy workspace reports all green:

```
Workspace: Acme Production   ● healthy
  Projects        2          ● ok
  Members         5          ● ok
  Integrations    1          ● ok
```

:::note
If anything reports a warning, open the [FAQ](/faq/) — the most common causes
and fixes are listed there.
:::

## What's next

You now have a working workspace. To bring in existing data in bulk, continue
to [Importing data](/guides/importing-data/).
