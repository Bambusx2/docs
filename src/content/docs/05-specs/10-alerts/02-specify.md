---
title: "E10 Action Required — Specification"
---

> Scope: Bell badge and Home Action Required list for concrete client tasks; middleware-computed alerts with deep links into domain packs.  
> Source trail: Workshop 3 · Requirements draft (external) · [data-model.md §8](/03-data/data-model/) · [ADR-016](/01-constitution/constitution/#adr-016--v1-action-required-concrete-items-only) · [ADR-032](/01-constitution/constitution/#adr-032--push-notifications-scope) · [ADR-036](/01-constitution/constitution/#adr-036--alert-persistence-model)
> Spec version: 1.0.0 · Last updated: July 17, 2026  
> Discovery package: [01-overview.md](/05-specs/10-alerts/01-overview/) (constraints, acceptance demo)  
> Delivery rules: [AGENTS.md](/agents/)

Client-facing label: **Action Required**. Backend entity and API: `Alert`. Pack title: **Alerts & Action Required**.

Stories carry MoSCoW tags; definitions in [specs README](/05-specs/readme/#moscow). Story bodies follow the index order. Each story is independently deliverable; **Depends on** does not expand acceptance. Client acceptance demo: [01-overview.md §8](/05-specs/10-alerts/01-overview/#8-acceptance-demo).

Contracts: [OpenAPI](/05-specs/10-alerts/05-contracts/openapi.yaml) is the machine-readable API source; this document defines behaviour. Computation rules: [computation.md](/05-specs/10-alerts/05-contracts/computation/). ---

## Non-functional requirements

| ID | Requirement |
|:---|:---|
| NFR-01 | Open alerts and badge count return within **1 second** p95 when middleware cache is warm. |
| NFR-02 | Badge count equals the number of open alerts with `status = open` — same set as Home **Action Required**. |
| NFR-03 | Alerts are computed in middleware from synced upstream data — not fabricated on device. |
| NFR-04 | Alert list and badge refresh after middleware sync, login, and Home pull-to-refresh without app reinstall. |
| NFR-05 | Only concrete, actionable alert types from **Must** stories, plus **Should** types when those stories ship (**AR-06**, **AR-10**) — no placeholder or marketing tasks. |

---

## Story index

| ID | Actor | Story | MoSCoW | Cost |
|:---|:---|:---|:---|---:|
| [AR-01](#ar-01--see-the-notification-badge) | Client | See the notification badge | Must | 1 |
| [AR-02](#ar-02--see-action-required-on-home) | Client | See Action Required on Home | Must | 2 |
| [AR-03](#ar-03--open-the-right-screen-from-an-alert) | Client | Open the right screen from an alert | Must | 2 |
| [AR-04](#ar-04--sign-a-document-waiting-for-my-signature) | Client | Sign a document waiting for my signature | Must | 2 |
| [AR-05](#ar-05--fix-a-broken-account-connection) | Client | Fix a broken account connection | Must | 2 |
| [AR-07](#ar-07--see-my-profile-proposal-decision) | Client | See my profile proposal decision | Must | 1 |
| [AR-08](#ar-08--see-alerts-clear-when-i-complete-them) | Client | See alerts clear when I complete them | Must | 4 |
| [AR-09](#ar-09--see-new-alerts-after-data-sync) | Client | See new alerts after data sync | Must | 3 |
| [AR-06](#ar-06--complete-missing-profile-information) | Client | Complete missing profile information | Should | 2 |
| [AR-10](#ar-10--see-a-planning-update-notice) | Client | See a planning update notice | Should | 2 |
| [AR-11](#ar-11--use-goal-based-to-do-lists) | Client | Use goal-based to-do lists | Won't | 12 |
| [AR-12](#ar-12--see-advisor-activity-feed-alerts) | Client | See advisor activity feed alerts | Won't | 5 |
| [AR-13](#ar-13--see-money-movement-alerts) | Client | See money-movement alerts | Won't | 8 |
| [AR-14](#ar-14--receive-os-push-notifications) | Client | Receive OS push notifications | Won't | 2 |

Won't Cost **2** on **AR-14** is incremental domain wiring on platform push (**C-16**); see [Cost](/05-specs/readme/#cost).

---

## User stories

### AR-01 — See the notification badge

MoSCoW: Must  
As a client anywhere in the app  
I want a notification bell with a badge count  
So that I know something needs my attention without opening Home.

Expected behavior:

- Bell appears in the app header.
- Badge shows `notificationSummary.totalOpenCount` — count of open alerts only.
- Badge hidden when `totalOpenCount` is 0.
- Tapping the bell navigates to Home scrolled to the **Action Required** section (same open items as **AR-02**).

Error and edge cases:

- No open alerts — badge hidden; not an error.

Integrations
- `notificationSummary` on `GET /api/v1/me` and `GET /api/v1/home` ([openapi.yaml](/05-specs/10-alerts/05-contracts/openapi.yaml)).

---

### AR-02 — See Action Required on Home

MoSCoW: Must  
As a client on Home  
I want an Action Required section listing my pending tasks  
So that I can complete them in one place.

Expected behavior:

- Section title: **Action Required**.
- Lists open alerts from `GET /api/v1/alerts` or embedded `actionRequired` on `GET /api/v1/home`.
- Each row includes: `id`, `alertType`, `title`, `message`, `actionLabel`, optional `severity` (`info` | `warning` | `critical`).
- Sorted by severity descending, then `createdAt` descending.
- Empty state when no open alerts: section shows **You're all caught up** — not an error.
- Only alert types defined in **AR-04**, **AR-05**, **AR-07** (and **AR-06** / **AR-10** when those stories ship) appear.

Error and edge cases:

- Upstream sync stale — list reflects last middleware computation; refresh on pull-to-refresh.

Integrations
- [computation.md](/05-specs/10-alerts/05-contracts/computation/).

---

### AR-03 — Open the right screen from an alert

MoSCoW: Must  
As a client tapping an Action Required row  
I want to land on the screen where I can fix the issue  
So that I do not hunt through the app.

Expected behavior:

- Each alert includes `actionDeepLink` — in-app route the client navigates to on row tap.
- Deep links by `alertType`:

| `alertType` | Destination |
|---|---|
| `document_signature_pending` | Docs → needs signature ([DOC-07](/05-specs/09-documents/02-specify/#doc-07--open-document-from-action-required)) |
| `linked_account_broken` | Planning → linked accounts → relink ([PL-09](/05-specs/08-planning/02-specify/#pl-09--relink-broken-account)) |
| `missing_required_field` | Profile → missing-field form ([C-08](/05-specs/02-users/02-specify/#c-08--complete-missing-required-profile-fields)) |
| `profile_proposal_decided` | Profile hub / decision detail ([C-25](/05-specs/02-users/02-specify/#c-25--see-profile-proposal-decision)) |
| `planning_update` | Planning → overview |

- When `relatedEntityId` is present, destination opens that entity in context (the related document, account, or proposal identified by the id).

Error and edge cases:

- Underlying issue already resolved — alert absent on next fetch; navigation shows empty or resolved context.

Integrations
- Deep-link destinations are owned by the destination packs cited in the table above.
- Alert type emission and resolution rules: [computation.md](/05-specs/10-alerts/05-contracts/computation/).
- No upstream write from this story — navigation only.

---

### AR-04 — Sign a document waiting for my signature

MoSCoW: Must  
As a client with a vault document awaiting signature  
I want an Action Required item for pending signatures  
So that I do not miss forms my advisory team sent.

Expected behavior:

- Alert type: `document_signature_pending`.
- Created when a vault document has `requiresSignature` true and signature is not completed.
- Shown only when `documents_enabled` is true.
- Row `actionLabel`: **Sign**.
- Resolves when signature completes or document no longer requires signature.
- Counted in bell badge.

Error and edge cases:

- `documents_enabled` false — alert not emitted.

Integrations
- eMoney Vault metadata ([09-documents/vault.md](/05-specs/09-documents/05-contracts/vault/)) · sign UX on landing screen ([DOC-03](/05-specs/09-documents/02-specify/#doc-03--see-documents-needing-signature)).

---

### AR-05 — Fix a broken account connection

MoSCoW: Must  
As a client with a broken eMoney aggregation link  
I want an Action Required item prompting me to relink  
So that my plan data stays accurate.

Expected behavior:

- Alert type: `linked_account_broken`.
- Created when a client-linked account has `connectionStatus = broken`.
- Shown only when `planning_enabled` and `planning_linked_accounts` are true.
- Row `actionLabel`: **Relink**.
- Resolves when connection status returns to `connected`.
- Counted in bell badge.

Error and edge cases:

- `planning_enabled` or `planning_linked_accounts` false — alert not emitted.

Integrations
- eMoney linked accounts via Salesforce ([08-planning/salesforce.md](/05-specs/08-planning/05-contracts/salesforce/)).

---

### AR-06 — Complete missing profile information

MoSCoW: Should  
As a client with required Person Account fields missing  
I want an Action Required item for each gap  
So that my advisor has accurate records.

Depends on: [C-08](/05-specs/02-users/02-specify/#c-08--complete-missing-required-profile-fields) (same MoSCoW — Should).

Expected behavior:

- Alert type: `missing_required_field`.
- Created when the authenticated user's Person Account is missing any of: phone (`PersonMobilePhone` or `Phone` — the phone requirement is satisfied when either field has a value), mailing street, city, state, postal code, birthdate.
- Message is client-safe (**Complete your phone number** — not Salesforce API names).
- Row `actionLabel`: **Update**.
- Submit on missing-field form creates `Mobile_Profile_Proposal__c` for staff review ([C-08](/05-specs/02-users/02-specify/#c-08--complete-missing-required-profile-fields), [A-09](/05-specs/02-users/02-specify/)).
- Resolves when required fields are populated in Salesforce after approval and synced to middleware.
- Counted in bell badge.

Error and edge cases:

- Proposal pending staff review — alert remains until fields are approved and synced.

Integrations
- Salesforce Person Account ([02-users/02-specify.md](/05-specs/02-users/02-specify/)).

---

### AR-07 — See my profile proposal decision

MoSCoW: Must  
As a client whose profile change was reviewed  
I want an Action Required item with the outcome  
So that I know whether my proposal was approved or rejected.

Expected behavior:

- Alert type: `profile_proposal_decided`.
- Created when staff completes approve or reject on a profile proposal ([A-09](/05-specs/02-users/02-specify/)).
- Message states approved or rejected; includes reviewer note when present and client-safe.
- Row `actionLabel`: **View**.
- Resolves when the client dismisses the alert or views the decision detail ([C-25](/05-specs/02-users/02-specify/#c-25--see-profile-proposal-decision)).
- Counted in bell badge while open.

Error and edge cases:

- Note absent — message shows outcome only.

Integrations
- `Mobile_Profile_Proposal__c` workflow ([02-users/02-specify.md](/05-specs/02-users/02-specify/)).

---

### AR-08 — See alerts clear when I complete them

MoSCoW: Must  
As a client who fixed an underlying issue  
I want the Action Required item and bell badge to update  
So that I am not nagged for completed work.

Expected behavior:

- Middleware recomputes alerts on sync, login, and screen refresh.
- Alert `status` transitions: `open` → `resolved` when source condition clears.
- Informational alerts (**AR-10**) transition `open` → `dismissed` when the client dismisses.
- Badge count decrements on next `/me` or `/home` fetch after resolution.

Error and edge cases:

- Brief lag after upstream fix until next sync — acceptable on daily cadence; pull-to-refresh accelerates.

Integrations
- [computation.md](/05-specs/10-alerts/05-contracts/computation/).

---

### AR-09 — See new alerts after data sync

MoSCoW: Must  
As a client  
I want new Action Required items after the daily data sync  
So that tasks my advisory team created show up without reinstalling the app.

Expected behavior:

- Alerts derived from middleware cache (Salesforce, vault, eMoney linked accounts) — not computed on device.
- New open alerts appear after `SFSyncBatch` or domain-specific refresh completes.
- Home pull-to-refresh triggers alert recomputation.

Error and edge cases:

- Sync failure — prior alert set retained; no fabricated alerts.

Integrations
- [computation.md](/05-specs/10-alerts/05-contracts/computation/) · daily sync ([data-model.md §10](/03-data/data-model/)).

---

### AR-10 — See a planning update notice

MoSCoW: Should
As a client with planning enabled  
I want an informational notice when eMoney plan data changes  
So that I am aware updates affect what I see.

Expected behavior:

- Alert type: `planning_update`.
- Created when eMoney plan `asOf` changes since the client's last acknowledged sync.
- Informational — dismissible; `actionLabel` optional.
- Shown only when `planning_enabled` is true.
- Lower priority than **AR-04**–**AR-07** in sort order.
- Does not block other alerts.

Error and edge cases:

- Client dismisses — `status` becomes `dismissed`; not recreated until next plan `asOf` change.

Integrations
- eMoney plan sync via Salesforce ([08-planning/salesforce.md](/05-specs/08-planning/05-contracts/salesforce/)).

---

### AR-11 — Use goal-based to-do lists

MoSCoW: Won't

---

### AR-12 — See advisor activity feed alerts

MoSCoW: Won't

---

### AR-13 — See money-movement alerts

MoSCoW: Won't

---

### AR-14 — Receive OS push notifications

MoSCoW: Won't
