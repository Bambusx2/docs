---
title: "E10 Action Required — Alert Computation Contract"
---

> Owner: Middleware · Consumers: Home, bell badge, `GET /api/v1/alerts`  
> Behaviour: [../02-specify.md](/05-specs/10-alerts/02-specify/) · API: [openapi.yaml](/05-specs/10-alerts/05-contracts/openapi.yaml) · Entity: [data-model.md §8](/03-data/data-model/) · ADR: [ADR-016](/01-constitution/constitution/#adr-016--v1-action-required--concrete-items-only), [ADR-036](/01-constitution/constitution/#adr-036--alert-persistence-model)

Alerts are **computed in middleware** from synced upstream data at read time (preferred for Must types). The mobile app never derives alert rules locally.

---

## 1. Inputs

| Source | Used for |
|---|---|
| eMoney Vault metadata | `document_signature_pending` |
| Salesforce `FinServ__FinancialAccount__c` / eMoney linked-account sync | `linked_account_broken` |
| Salesforce Person Account (authenticated user) | `missing_required_field` |
| Salesforce `Mobile_Profile_Proposal__c` + staff decision events | `profile_proposal_decided` |
| eMoney plan `asOf` (via SF) | `planning_update` (Should) |
| Feature flags (`documents_enabled`, `planning_enabled`, etc.) | Gate emission |

---

## 2. Rules by type

| `alertType` | Emit when | Resolve when | Gated by |
|---|---|---|---|
| `document_signature_pending` | Vault doc `requiresSignature` true, signature incomplete | Signature complete or flag cleared | `documents_enabled` |
| `linked_account_broken` | Linked account `connectionStatus = broken` | Status `connected` | `planning_enabled`, `planning_linked_accounts` |
| `missing_required_field` | Person Account missing required fields per **AR-06** (Should — with **C-08**) | Fields populated in SF after sync | — |
| `profile_proposal_decided` | Staff approve/reject on proposal | Client dismisses or views decision | — |
| `planning_update` | Plan `asOf` changed since last ack | Client dismisses or new ack after next change | `planning_enabled` |

---

## 3. Identity and deduplication

- Stable `id` per `(clientUserId, alertType, relatedEntityId)` tuple for the open lifecycle.
- Recompute on: login, `GET /home`, `GET /alerts`, pull-to-refresh, post-`SFSyncBatch`.
- No duplicate open rows for the same underlying condition.

---

## 4. Sort and badge

- List sort: `severity` (critical → warning → info), then `createdAt` descending.
- `notificationSummary.totalOpenCount` = count of alerts with `status = open` in the returned set.

---

## 5. Persistence (implementation)

| Approach | Must types | Notes |
|---|---|---|
| Virtual at read time | Preferred | No SF `Client_Alert__c` rows required for Must types this delivery |
| Persisted rows | Optional | Required before advisor-authored custom tasks ([ADR-036](/01-constitution/constitution/#adr-036--alert-persistence-model)) |

Dismiss state for `planning_update` may be stored in middleware (`status = dismissed`) even when other types are virtual.

---

## 6. Done when

- [ ] All Must rules implemented against fixtures or sandbox upstreams  
- [ ] Badge count matches open list ([NFR-02](/05-specs/10-alerts/02-specify/#non-functional-requirements))  
- [ ] Feature-flag gating verified per type  
