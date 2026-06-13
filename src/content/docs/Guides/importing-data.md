---
title: Importing data
description: How to bring existing records into the platform in bulk using CSV files or the import API.
sidebar:
  order: 2
---

When you're moving from another system, you'll usually want to import your
existing records in bulk rather than recreating them by hand. There are two
supported methods: CSV upload and the import API.

## Method 1 — CSV upload

Best for one-off migrations and non-technical users.

### Prepare your file

Your CSV must include a header row. Columns map to fields by name; extra
columns are ignored.

```csv title="customers.csv"
external_id,name,email,plan
1001,Acme Corp,ops@acme.com,enterprise
1002,Globex,hello@globex.io,team
1003,Initech,admin@initech.com,starter
```

### Run the import

```bash
ing import customers.csv --type customer --dry-run
```

:::caution
Always run with `--dry-run` first. It validates every row and reports problems
**without** writing anything. Remove the flag only once the dry run is clean.
:::

A dry run reports what *would* happen:

```
Validated 3 rows
  ✓ 3 valid
  ✗ 0 errors
Dry run complete — no records were created.
```

## Method 2 — Import API

Best for automated or recurring imports.

```bash
curl -X POST https://api.ingsoftware.dev/v1/imports \
  -H "Authorization: Bearer $ING_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "customer",
    "records": [
      { "external_id": "1001", "name": "Acme Corp", "email": "ops@acme.com" }
    ]
  }'
```

The API responds with an import job you can poll for status:

```json
{
  "id": "imp_8f2a",
  "status": "processing",
  "received": 1
}
```

## Handling duplicates

By default, records with an `external_id` that already exists are **updated**
rather than duplicated. To change this behaviour, pass `--on-conflict skip`.

| Strategy | Flag | Behaviour |
| --- | --- | --- |
| Update (default) | — | Existing records are overwritten. |
| Skip | `--on-conflict skip` | Existing records are left untouched. |
| Fail | `--on-conflict fail` | The whole import stops on the first conflict. |
