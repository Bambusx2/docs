---
title: "E07 Portfolio — Specification"
---

> Scope: OnePoint-managed AUM (Orion) — portfolio summary, asset allocation, accounts, account summary, performance, holdings, Home context.  
> Source trail: Workshops 6, 7, 10 (external) · [data-model.md §3](/03-data/data-model/) · [ADR-003](/01-constitution/constitution/#adr-003--no-orion-connect-api-in-neopix-scope) · [ADR-009](/01-constitution/constitution/#adr-009--portfolio-orion-only-planning-emoney-only) · [ADR-010](/01-constitution/constitution/#adr-010--dual-allocation-scopes) · [ADR-044](/01-constitution/constitution/#adr-044--orion-portal-parity-v1-portfolio)
> Spec version: 1.0.0 · Last updated: July 17, 2026  
> Discovery package: [01-overview.md](/05-specs/07-portfolio/01-overview/) (constraints, acceptance demo)  
> Delivery rules: [AGENTS.md](/agents/)

Stories carry MoSCoW tags; definitions in [specs README](/05-specs/readme/#moscow). Story bodies follow the index order. Each story is independently deliverable; **Depends on** does not expand acceptance. Client acceptance demo: [01-overview.md §8](/05-specs/07-portfolio/01-overview/#8-acceptance-demo).

Naming: Tab **OnePoint BFG Portfolio**; attribution **Powered by Orion**. Flags `portfolio_enabled` / `portfolio_ytd_realized_gl`. Allocation scope `portfolio_orion` only.

Contracts: [OpenAPI](/05-specs/07-portfolio/05-contracts/openapi.yaml) is the machine-readable API source; this document defines behaviour. Salesforce build pack: [salesforce.md](/05-specs/07-portfolio/05-contracts/salesforce/). Global integrations: [salesforce.md](/04-integrations/salesforce/) · [orion.md](/04-integrations/orion/). ---

## Non-functional requirements

| ID | Requirement |
|:---|:---|
| NFR-01 | Portfolio summary and account list return within **1.5 seconds** p95 when SF sync cache is warm. |
| NFR-02 | All monetary, performance, and allocation figures carry a **data as of** timestamp. |
| NFR-03 | Missing allocation, holdings, or performance does not block account balances or account identity — return `unavailable` or omit fields; do not invent values. |
| NFR-04 | Full account numbers and CUSIPs are never logged in clear text; mobile receives masked account numbers only. |

---

## Story index

| ID | Actor | Story | MoSCoW | Cost |
|:---|:---|:---|:---|---:|
| [P-01](#p-01--browse-portfolio-summary) | Client | Browse Portfolio summary | Must | 3 |
| [P-02](#p-02--see-orion-asset-allocation) | Client | See Orion asset allocation | Must | 8 |
| [P-03](#p-03--browse-managed-accounts) | Client | Browse managed accounts | Must | 2 |
| [P-04](#p-04--see-account-summary) | Client | See account summary | Must | 2 |
| [P-05](#p-05--see-account-performance) | Client | See account performance | Must | 5 |
| [P-06](#p-06--see-account-holdings) | Client | See account holdings | Must | 5 |
| [P-07](#p-07--see-portfolio-context-on-home) | Client | See portfolio context on Home | Must | 1 |
| [P-08](#p-08--drill-into-tax-lots-or-holding-detail) | Client | Drill into tax lots or holding detail | Won't | 8 |
| [P-09](#p-09--see-transactions-and-activities) | Client | See transactions and activities | Won't | 10 |
| [P-10](#p-10--compare-performance-to-benchmarks) | Client | Compare performance to benchmarks | Won't | 8 |

---

## User stories

### P-01 — Browse Portfolio summary

MoSCoW: Must  
As a logged-in client with portfolio enabled  
I want the total value of my OnePoint-managed AUM and YTD realized gain/loss when available  
So that I know the headline value of advisory assets.

Expected behavior:

- Available when `portfolio_enabled` is true; unavailable when false.
- Returns **total market value**, **dataAsOf**, and **YTD realized gain/loss** when `portfolio_ytd_realized_gl` is true and a value exists; otherwise YTD realized gain/loss is absent.
- Total market value is the sum of market values of visible managed financial accounts in scope.
- Empty household returns an empty summary; totals are not fabricated.

Error and edge cases:

- `portfolio_enabled` false — 403; deep links fall back to Home.
- Salesforce unavailable — retryable error; totals are not fabricated.
- Unauthenticated — Portfolio unavailable.

Salesforce:

- Managed Financial Accounts and household YTD realized gain/loss fields ([salesforce.md](/05-specs/07-portfolio/05-contracts/salesforce/)).

---

### P-02 — See Orion asset allocation

MoSCoW: Must  
As a client with managed AUM  
I want asset allocation for my portfolio and for each managed account, by asset category and by asset class  
So that I can see how Orion-managed assets are distributed.

Expected behavior:

- Scope: `portfolio_orion` — Orion-managed accounts in the client’s visible set.
- Levels: **household (portfolio)** and **account**.
- Dimensions: **by category** and **by class** — independent breakdowns with status `ready` or `unavailable`.
- Household and account allocations use the same category codes and the same class codes.
- Household `marketValue` for a code equals the sum of account-level `marketValue` for that code across visible managed accounts.
- Each slice includes: `code`, `label`, `marketValue`, `weightPct` (0–1), `dataAsOf`.
- Weights for a level and dimension sum to 1.0 within ±0.01; residual rounding applies to the largest slice.
- Unclassified value appears in an **Unclassified** slice when present in Salesforce.
- Total slice `marketValue` equals the level total (household total from **P-01** or account market value from **P-04**) within ±0.01 when status is `ready`.
- Source: Salesforce Orion/OASP allocation rollups ([salesforce.md](/05-specs/07-portfolio/05-contracts/salesforce/)).

Error and edge cases:

- Empty portfolio — both dimensions return empty slices with status `unavailable`.
- Account not in household — 404.
- Dimension absent in Salesforce — status `unavailable` for that dimension.

Salesforce:

- Allocation rollups for household and account; category and class taxonomies ([data-model.md §3.6](/03-data/data-model/)).

---

### P-03 — Browse managed accounts

MoSCoW: Must  
As a client on Portfolio  
I want a list of my OnePoint-managed accounts  
So that I can scan balances and open an account.

Expected behavior:

- Lists Orion-managed financial accounts in the visible household set.
- Each row includes: `id`, display name, masked account number, custodian name, account type, market value, YTD return % (absent when no value), `dataAsOf`, source label **Orion**.
- Sorted by market value descending.
- Excludes orphan accounts not linked to the CRM parent household.
- Excludes closed and non-active managed accounts.
- Duplicate accounts between Orion and eMoney appear on Portfolio only.

Error and edge cases:

- Empty list when the household has no managed accounts.
- Missing YTD return — field absent; not zero.

Salesforce:

- Managed Financial Accounts and custodian ([salesforce.md](/05-specs/07-portfolio/05-contracts/salesforce/)).

---

### P-04 — See account summary

MoSCoW: Must  
As a client viewing one managed account  
I want that account’s identity and balance  
So that I know which account I am viewing and its current value.

Expected behavior:

- For account `{id}` in the household, returns: display name, masked account number, custodian, account type, market value, YTD return % (absent when no value), YTD gain/loss (absent when no value), `dataAsOf`, source **Orion**.
- Available when allocation (**P-02**), performance (**P-05**), or holdings (**P-06**) are `unavailable`.

Error and edge cases:

- Unknown id or account not in household — 404.
- Salesforce balance missing — retryable error; balance is not invented.

Salesforce:

- Financial Account fields ([salesforce.md](/05-specs/07-portfolio/05-contracts/salesforce/)).

---

### P-05 — See account performance

MoSCoW: Must  
As a client viewing one managed account  
I want performance over standard timeframes  
So that I can see how the account has performed.

Expected behavior:

- Performance series for timeframes: **1M, 3M, 6M, YTD, 1Y, 3Y**.
- Each point includes: date, market value, return % (absent when unavailable), `dataAsOf`.
- Status: `ready` or `unavailable`.
- Source: Salesforce Orion/OASP performance data ([salesforce.md](/05-specs/07-portfolio/05-contracts/salesforce/)).

Error and edge cases:

- Performance absent in Salesforce — status `unavailable`; series is not fabricated.
- Timeframe with no data — empty series with status `unavailable`.

Salesforce:

- Account performance time series ([data-model.md §3.5](/03-data/data-model/)).

---

### P-06 — See account holdings

MoSCoW: Must  
As a client viewing one managed account  
I want the list of positions in that account  
So that I can see what I hold and each position’s weight.

Expected behavior:

- Status: `ready` or `unavailable`.
- Source: Salesforce Orion holdings ([salesforce.md](/05-specs/07-portfolio/05-contracts/salesforce/)).
- When `ready`, each holding includes: name, symbol (absent when none), quantity, price, market value, weight % of the account, change % (absent when unavailable), category code (absent when unclassified), class code (absent when unclassified).
- Weight % is relative to account market value (**P-04**); weights sum to 1.0 within ±0.01.
- Search and filter by name or symbol.

Error and edge cases:

- Missing symbol — row includes name only.
- Holdings absent in Salesforce — status `unavailable`.

Salesforce:

- Financial Holding records per account ([data-model.md §3.4](/03-data/data-model/)).

---

### P-07 — See portfolio context on Home

MoSCoW: Must  
As a client on Home  
I want portfolio allocation context with a path to Portfolio  
So that I can see managed-asset mix without opening Portfolio first.

Expected behavior:

- When `portfolio_enabled` is true and household allocation is available, Home receives `portfolio_orion` household allocation **by category** from **P-02**.
- Home does not show allocation by class; class breakdown is on Portfolio only (**P-02**).
- Available when `planning_enabled` is false.
- Navigation from Home context opens Portfolio.
- Hidden when portfolio is disabled, empty, or allocation is unavailable.

Error and edge cases:

- Allocation unavailable — Home omits portfolio context; Home remains usable.

Salesforce:

- Same payload as **P-02** household `byCategory` dimension.

---

### P-08 — Drill into tax lots or holding detail

MoSCoW: Won't

---

### P-09 — See transactions and activities

MoSCoW: Won't

---

### P-10 — Compare performance to benchmarks

MoSCoW: Won't
