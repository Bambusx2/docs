---
title: "E05 Your Team — Scheduling Provider Contract"
---

> Global integration: [calendly.md](/04-integrations/calendly/)  
> Owner: Solutions architecture / middleware · Consumers: Mobile (WebView), ops  
> Behaviour: [../02-specify.md](/05-specs/05-my-team/02-specify/) MT-03 · API: [openapi.yaml](/05-specs/05-my-team/05-contracts/openapi.yaml) · ADR: [ADR-034](/01-constitution/constitution/#adr-034--calendly-depth-in-v1)

This document is the **pack port/adapter handoff** under the global Calendly integration. This delivery’s adapter = **Calendly**. Mobile and OpenAPI stay provider-agnostic.

---

## 1. Design goals

| Goal | Rule |
|---|---|
| Replaceable provider | Middleware owns a `SchedulingProvider` port; only adapters know Calendly (or future Tools) |
| Stable mobile contract | Clients receive `MeetingType.schedulingUrl` + display fields — never `calendly_*` properties |
| Depth this delivery | Deep-link / in-app WebView only — no embedded widget SDK, no booking confirmation webhook required for Must |
| Attribution | UI footer string from API `providerAttribution` (copy), not hardcoded “Calendly” in code paths |

```text
┌─────────────┐     OpenAPI (agnostic)     ┌──────────────────┐
│  Mobile app │ ◄───────────────────────── │    Middleware    │
└─────────────┘   TeamMember               │                  │
                    MeetingType.schedulingUrl│  SchedulingPort │
                                           └────────┬─────────┘
                                                    │
                          ┌─────────────────────────┼─────────────────────────┐
                          ▼                         ▼                         ▼
                   CalendlyAdapter          (Future) SavvyCal          (Future) …

Salesforce supplies who is on the team + optional per-member scheduling enablement.
The provider supplies bookable offers (name, duration, URL).
```

---

## 2. Port — `SchedulingProvider`

Middleware interface (conceptual; language-agnostic):

| Method | Input | Output |
|---|---|---|
| `listOffers(member)` | Internal team member (incl. `sf_user_id`, provider mapping keys) | `SchedulingOffer[]` |
| `providerId()` | — | Stable id: `calendly` (this delivery) |
| `attributionCopy()` | — | String for UI footer, e.g. `Powered by Calendly / Zoom` |

### 2.1 `SchedulingOffer` (internal → maps to API `MeetingType`)

| Field | API field | Notes |
|---|---|---|
| `id` | `id` | Middleware UUID (stable per provider event type + member) |
| `name` | `name` | Client-visible |
| `duration_minutes` | `durationMinutes` | |
| `description` | `description` | Optional |
| `scheduling_url` | `schedulingUrl` | **HTTPS** URL for WebView / browser |
| `is_active` | `isActive` | Inactive offers omitted from default list |
| `sort_order` | `sortOrder` | Optional |
| `provider_ref` | *(not exposed)* | External id for sync/debug only |

Non-goals for the port (this delivery): create/cancel appointment APIs, availability slots JSON, webhook “booked” events, OAuth in the mobile app.

---

## 3. Adapter this delivery — Calendly

| Concern | Decision |
|---|---|
| Integration style | Server-side: Calendly API and/or config-mapped scheduling URLs |
| Mobile | Opens `schedulingUrl` in WebView or external browser ([ADR-034](/01-constitution/constitution/#adr-034--calendly-depth-in-v1)) |
| Meeting medium | Zoom vs phone configured **inside Calendly**, not in OnePoint |
| Auth to Calendly | Middleware (or ops-managed) token — **not** embedded in the mobile binary |
| Mapping member → Calendly user | Config table or SF custom field holding Calendly user/event owner id; never send Calendly tokens to the client |

### 3.1 Suggested mapping store (middleware)

| Column | Description |
|---|---|
| `sf_user_id` | Salesforce User Id |
| `provider` | `calendly` |
| `provider_user_uri` | Calendly user URI / uuid |
| `event_type_uris[]` | Optional allow-list of event types; empty = all active types for that user |
| `enabled` | AND with SF `Mobile_Scheduling_Enabled__c` and household `team_scheduling` |

### 3.2 Calendly → `SchedulingOffer` map

| Calendly | Offer field |
|---|---|
| Event type name | `name` |
| duration | `duration_minutes` |
| scheduling_url / EventType.scheduling_url | `scheduling_url` |
| description | `description` |
| active | `is_active` |
| uri | `provider_ref` |

If API access is delayed, ops may seed **static HTTPS scheduling URLs** per member in the mapping table — still served through the same port (fixture adapter or Calendly adapter in “static mode”). Mobile behaviour unchanged.

### 3.3 Failure behaviour

| Case | Middleware | Mobile |
|---|---|---|
| Provider down | `503` on meeting-types; `schedulingAvailable=false` on team list if probe fails | Hide Schedule or show retry per **MT-03** |
| Member not mapped | Empty offers | Hide Schedule on card |
| Household `team_scheduling` off | `403` | No Schedule UI |

---

## 4. Replacing Calendly later

To swap providers:

1. Implement a new adapter satisfying `SchedulingProvider`.  
2. Change config `SCHEDULING_PROVIDER=…` (or equivalent).  
3. Update `attributionCopy()` for UI footer.  
4. Remap member → provider users/event types.  
5. Do not change OpenAPI field names or mobile WebView flow unless the new provider cannot supply a single HTTPS booking URL (would need a new ADR).

Acceptance regression: **MT-03** demo paths still pass with the new adapter.

---

## 5. Alignment with data model

Canonical entities: [data-model.md §7](/03-data/data-model/).

| Entity | Role |
|---|---|
| `TeamMember` | SF-backed identity card |
| `MeetingType` | Provider-backed offer; persisted or projected by middleware; `scheduling_url` is provider-agnostic |

Calendly-specific URIs stay in adapter storage / `provider_ref`, not in mobile DTOs.

---

## 6. Security & privacy

- No Calendly (or other provider) API secrets in the mobile app.  
- Scheduling URLs may be personalised; treat as sensitive in logs (truncate query strings).  
- Do not log full attendee PII from provider webhooks if added later.  
- Impersonation: admin sees the client’s team and offers; bookings still use the opened URL’s provider rules.

---

## 7. Done when (SA / middleware)

- [ ] `SchedulingProvider` port implemented with **Calendly** adapter (API or static URL mode)  
- [ ] OpenAPI `schedulingUrl` + `providerAttribution` returned for mapped members  
- [ ] Feature flags gate team vs scheduling independently  
- [ ] Runbook note: how to remap a member or disable scheduling without an app release  
- [ ] Swap drill documented (this file §4) — reviewed with delivery lead  
