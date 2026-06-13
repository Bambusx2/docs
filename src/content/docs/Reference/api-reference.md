---
title: API reference
description: Authentication, endpoints, rate limits, and error formats for the platform REST API.
sidebar:
  order: 1
---

The REST API lets you automate everything you can do in the interface. All
endpoints are served over HTTPS from `https://api.ingsoftware.dev/v1`.

## Authentication

Authenticate every request with a bearer token in the `Authorization` header:

```bash
curl https://api.ingsoftware.dev/v1/projects \
  -H "Authorization: Bearer $ING_API_KEY"
```

:::danger
API keys carry the permissions of the member who created them. Scope keys to
the least access they need, and store them as environment variables — never in
source control.
:::

## Common endpoints

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/projects` | List all projects in the workspace. |
| `POST` | `/projects` | Create a new project. |
| `GET` | `/projects/{id}` | Retrieve a single project. |
| `PATCH` | `/projects/{id}` | Update a project. |
| `DELETE` | `/projects/{id}` | Delete a project. |

## Rate limits

Requests are limited per API key. The current limits are returned on every
response:

| Header | Meaning |
| --- | --- |
| `X-RateLimit-Limit` | Requests allowed per minute. |
| `X-RateLimit-Remaining` | Requests left in the current window. |
| `X-RateLimit-Reset` | Unix timestamp when the window resets. |

:::tip
If you receive a `429 Too Many Requests`, wait until the time in
`X-RateLimit-Reset` before retrying. Well-behaved clients back off
automatically.
:::

## Error format

Errors use standard HTTP status codes and a consistent JSON body:

```json
{
  "error": {
    "code": "not_found",
    "message": "Project 'prj_123' does not exist.",
    "request_id": "req_a1b2c3"
  }
}
```

Always include the `request_id` when contacting support about a failed
request — it lets us find the exact event in our logs.
