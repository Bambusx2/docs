---
title: "E08 Planning — Specification"
---

> Scope: Holistic financial picture — net worth, goals, expenses, client-linked accounts; Orion + eMoney combined for planning.  
> Source trail: Workshops 6, 8, 9, 10 (external) · [data-model.md §4](/03-data/data-model/) · [ADR-009](/01-constitution/constitution/#adr-009--portfolio-orion-only-planning-emoney-only) · [ADR-010](/01-constitution/constitution/#adr-010--dual-allocation-scopes) · [ADR-012](/01-constitution/constitution/#adr-012--no-emoney-gauge-embeds) · [ADR-029](/01-constitution/constitution/#adr-029--home-without-emoney) · [ADR-038](/01-constitution/constitution/#adr-038--net-worth-calculation) · [ADR-040](/01-constitution/constitution/#adr-040--institution-first-emoney-linking)
> Spec version: 1.0.0 · Last updated: July 17, 2026  
> Discovery package: [01-overview.md](/05-specs/08-planning/01-overview/) (constraints, acceptance demo)  
> Delivery rules: [AGENTS.md](/agents/)

Stories carry MoSCoW tags; definitions in [specs README](/05-specs/readme/#moscow). Story bodies follow the index order. Each story is independently deliverable; **Depends on** does not expand acceptance. Client acceptance demo: [01-overview.md §8](/05-specs/08-planning/01-overview/#8-acceptance-demo).

Naming: Tab **Planning**; attribution **Powered by eMoney**. Allocation scope `planning_combined`. Flags `planning_enabled`, `planning_overview`, `planning_expenses`, `planning_goals`, `planning_linked_accounts`, `planning_monte_carlo`.

Contracts: [OpenAPI](/05-specs/08-planning/05-contracts/openapi.yaml) is the machine-readable API source; this document defines behaviour. Salesforce build pack: [salesforce.md](/05-specs/08-planning/05-contracts/salesforce/). Global integrations: [salesforce.md](/04-integrations/salesforce/) · [emoney.md](/04-integrations/emoney/). ---

## Non-functional requirements

| ID | Requirement |
|:---|:---|
| NFR-01 | Planning overview and linked-account list return within **1.5 seconds** p95 when SF sync cache is warm. |
| NFR-02 | All monetary figures carry a **data as of** timestamp. |
| NFR-03 | Missing goals, expenses, Monte Carlo, or linked-account data does not block net worth or allocation — return `unavailable` or omit sections; do not invent values. |
| NFR-04 | Linked-account credentials are never stored in the mobile app; relink and link flows run in eMoney-hosted WebView. |

---

## Story index

| ID | Actor | Story | MoSCoW | Cost |
|:---|:---|:---|:---|---:|
| [PL-01](#pl-01--open-the-planning-tab) | Client | Open the Planning tab | Must | 1 |
| [PL-02](#pl-02--see-net-worth) | Client | See net worth | Must | 8 |
| [PL-03](#pl-03--see-planning-allocation) | Client | See planning allocation | Must | 6 |
| [PL-04](#pl-04--see-plan-probability) | Client | See plan probability | Must | 1 |
| [PL-05](#pl-05--see-monte-carlo-projection) | Client | See Monte Carlo projection | Must | 2 |
| [PL-06](#pl-06--see-expenses) | Client | See expenses | Must | 2 |
| [PL-07](#pl-07--see-financial-goals) | Client | See financial goals | Must | 2 |
| [PL-08](#pl-08--see-linked-accounts) | Client | See linked accounts | Must | 3 |
| [PL-09](#pl-09--relink-broken-account) | Client | Relink broken account | Must | 4 |
| [PL-10](#pl-10--link-institution) | Client | Link institution | Must | 8 |
| [PL-11](#pl-11--see-planning-context-on-home) | Client | See planning context on Home | Must | 1 |
| [PL-12](#pl-12--add-manual-account) | Client | Add manual account | Won't | 8 |
| [PL-13](#pl-13--edit-expenses-in-app) | Client | Edit expenses in app | Won't | 6 |
| [PL-14](#pl-14--edit-linked-account-nickname) | Client | Edit linked account nickname | Won't | 2 |

---

## User stories

### PL-01 — Open the Planning tab

MoSCoW: Must  
As a client with planning enabled and an active eMoney plan  
I want to open the Planning tab  
So that I can see my full financial picture beyond Orion-managed assets.

Expected behavior:

- Available when `planning_enabled` is true and the household has an active eMoney plan synced to Salesforce.
- Unavailable when `planning_enabled` is false or no active plan exists — Planning tab hidden, Home planning context hidden (**PL-11**).
- Overview section available when `planning_overview` is true.
- Expenses section available when `planning_expenses` is true.
- Goals section available when `planning_goals` is true.
- Linked accounts section available when `planning_linked_accounts` is true.

Error and edge cases:

- `planning_enabled` false — 403 on Planning APIs; tab hidden.
- No active eMoney plan — tab hidden; same as `planning_enabled` false for client UX.

Salesforce:

- `Planning_Overview__c` presence and `Mobile_Feature_Flags__c` planning flags ([salesforce.md](/05-specs/08-planning/05-contracts/salesforce/)).

---

### PL-02 — See net worth

MoSCoW: Must  
As a client on Planning  
I want my net worth with assets and liabilities  
So that I understand my overall financial position.

Expected behavior:

- Available when `planning_overview` is true.
- Returns: **net worth**, **total assets**, **total liabilities**, **dataAsOf**.
- Optional when present: **net worth YTD change** (amount), **net worth YTD change %** — absent when unavailable.
- Net worth is middleware-computed from Salesforce inputs per [ADR-038](/01-constitution/constitution/#adr-038--net-worth-calculation): Orion managed AUM + eMoney held-away assets + insurance cash value − eMoney liabilities; Orion wins on duplicate account numbers ([ADR-011](/01-constitution/constitution/#adr-011--orion-wins-on-duplicate-account-numbers)). Include eMoney home/Zillow value when synced ([ADR-043](/01-constitution/constitution/#adr-043--real-estate-zillow-home-value)).
- Does not use eMoney-displayed net worth totals as the source value.

Error and edge cases:

- `planning_overview` false — section hidden.
- Required inputs missing — retryable error; values are not invented.

Salesforce:

- `Planning_Overview__c`, Orion FA balances, eMoney-linked account balances ([data-model.md §4.1](/03-data/data-model/)).

---

### PL-03 — See planning allocation

MoSCoW: Must  
As a client on Planning  
I want asset allocation across my full financial picture  
So that I understand exposure including assets outside OnePoint management.

Expected behavior:

- Available when `planning_overview` is true.
- Scope: `planning_combined` — Orion ∪ eMoney assets for net worth composition; Orion wins on managed duplicates.
- Uses the **planning taxonomy** only — not the Orion `portfolio_orion` taxonomy.
- Returns allocation slices: `code`, `label`, `marketValue`, `weightPct` (0–1), `dataAsOf`.
- Weights sum to 1.0 within ±0.01.
- Status: `ready` or `unavailable`.

Error and edge cases:

- `planning_overview` false — section hidden.
- Allocation absent in Salesforce — status `unavailable`; slices are not invented.

Salesforce:

- Planning allocation rollups or middleware-computed slices from SF inputs ([data-model.md §3.6](/03-data/data-model/), `scope=planning_combined`).

---

### PL-04 — See plan probability

MoSCoW: Must  
As a client on Planning  
I want the probability that my financial plan will succeed  
So that I know whether I am on track.

Expected behavior:

- Available when `planning_overview` is true.
- Returns: **plan probability %** (0–1), **dataAsOf**.
- Source: eMoney plan probability synced to Salesforce (`Planning_Overview__c.Plan_Probability_Pct__c`).

Error and edge cases:

- `planning_overview` false — field hidden.
- Probability absent — field omitted.

Salesforce:

- `Planning_Overview__c` ([data-model.md §4.1](/03-data/data-model/)).

---

### PL-05 — See Monte Carlo projection

MoSCoW: Must  
As a client on Planning  
I want upside, median, and downside Monte Carlo outcomes  
So that I understand the range of possible futures for my plan.

Expected behavior:

- Available when `planning_monte_carlo` is true.
- Returns: **upside %**, **median %**, **downside %**, **dataAsOf** — each absent when unavailable.
- Source: eMoney Monte Carlo synced to Salesforce.

Error and edge cases:

- `planning_monte_carlo` false — section hidden.
- All three values absent — section hidden.

Salesforce:

- `Planning_Overview__c` Monte Carlo fields ([data-model.md §4.1](/03-data/data-model/)).

---

### PL-06 — See expenses

MoSCoW: Must  
As a client on Planning  
I want my plan expenses  
So that I understand my cash outflows.

Expected behavior:

- Available when `planning_expenses` is true.
- Simple plan: returns **annual living expense** total, **monthly average**, **dataAsOf** only.
- Itemized plan: returns header **annual total**, **monthly average**, **dataAsOf**, plus:
  - Category summaries: `categoryType`, `label`, `annualTotal`, `percentOfTotal`
  - Line items: `name`, `categoryType`, `amount`, `frequency`
- Read-only — no in-app expense edits.
- Section hidden when no expense data exists in Salesforce.

Error and edge cases:

- `planning_expenses` false — section hidden.
- No expense rows — section hidden.

Salesforce:

- `Expense_Item__c` and rollups ([data-model.md §4.3–4.4](/03-data/data-model/)).

---

### PL-07 — See financial goals

MoSCoW: Must  
As a client on Planning  
I want progress toward my financial goals  
So that I know if I am on track for retirement and other targets.

Expected behavior:

- Available when `planning_goals` is true.
- Each goal returns: `name`, `fundedPct`, `probabilityPct`, `targetYear`, `status` (`on_track` | `at_risk` | `off_track`), `dataAsOf`.
- Section hidden when the household has no goals in Salesforce.

Error and edge cases:

- `planning_goals` false — section hidden.
- Empty goal list — section hidden.

Salesforce:

- `Financial_Goal__c` ([data-model.md §4.2](/03-data/data-model/)).

---

### PL-08 — See linked accounts

MoSCoW: Must  
As a client on Planning  
I want external accounts I linked through eMoney  
So that I know what feeds my plan and whether connections are healthy.

Expected behavior:

- Available when `planning_linked_accounts` is true.
- Lists **client-linked and held-away accounts only** — Orion-managed accounts are excluded.
- Each row returns: `institutionName`, `accountName`, `nickname` (absent when none), `accountType`, `connectionStatus` (`connected` | `broken` | `pending` | `disconnected`), `balance` (absent when connection is `broken`), `isManual`, `lastSyncAt`, `dataAsOf`.
- Duplicate Orion/eMoney accounts appear on Portfolio only, not in this list.
- Manual accounts (`isManual` true) show balance without holdings.

Error and edge cases:

- `planning_linked_accounts` false — section hidden.
- Empty list — section shows empty state.

Salesforce:

- `Linked_Account__c` ([data-model.md §4.5](/03-data/data-model/)).

---

### PL-09 — Relink broken account

MoSCoW: Must  
As a client with a broken linked account  
I want to relink that account  
So that my plan reflects current data.

Expected behavior:

- Accounts with `connectionStatus` = `broken` expose a **relink URL** from Salesforce.
- Relink opens the eMoney-hosted flow in WebView.
- After successful relink and sync, account returns to `connected` with updated balance.

Error and edge cases:

- `relinkUrl` absent — relink action unavailable for that row.
- WebView cancelled — account remains `broken`.

Salesforce:

- `Linked_Account__c.Relink_Url__c` (field name TBD) · Home alert wiring: [10-alerts](/05-specs/10-alerts/02-specify/).

---

### PL-10 — Link institution

MoSCoW: Must  
As a client on Planning  
I want to link a financial institution  
So that new accounts feed my plan.

Expected behavior:

- **Link institution** opens eMoney institution linking in WebView: institution search → institution authentication → account selection.
- Newly linked accounts appear in **PL-08** after eMoney → Salesforce → middleware sync.
- Source: eMoney linking API via middleware-issued WebView URL.

Error and edge cases:

- Link flow cancelled — no new accounts added.
- Sync pending — new accounts show `connectionStatus` = `pending` until sync completes.

Salesforce:

- New `Linked_Account__c` rows after eMoney sync ([salesforce.md](/05-specs/08-planning/05-contracts/salesforce/)).

---

### PL-11 — See planning context on Home

MoSCoW: Must  
As a client on Home  
I want net worth and planning allocation with a path to Planning  
So that I can see my full financial picture at a glance.

Expected behavior:

- Available when `planning_enabled` is true and planning data exists.
- Home receives **net worth** from **PL-02** (`netWorth`, `dataAsOf`).
- Home receives **`planning_combined` allocation** from **PL-03** (same slices as Planning overview).
- Navigation from Home context opens Planning.
- Hidden when planning is disabled or net worth is unavailable.

Error and edge cases:

- Planning unavailable — Home omits planning context; Home remains usable.
- Allocation unavailable — Home shows net worth only.

Salesforce:

- Same payloads as **PL-02** and **PL-03**.

---

### PL-12 — Add manual account

MoSCoW: Won't

---

### PL-13 — Edit expenses in app

MoSCoW: Won't

---

### PL-14 — Edit linked account nickname

MoSCoW: Won't
