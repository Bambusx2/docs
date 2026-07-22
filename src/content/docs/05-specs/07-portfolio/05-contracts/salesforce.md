---
title: "E07 Portfolio — Salesforce Work Package (Tier A)"
---

> Global integration: [salesforce.md](/04-integrations/salesforce/) · [orion.md](/04-integrations/orion/)  
> Owner: Callaway · Consumers: Middleware  
> Required before: Portfolio demo (summary, accounts, allocation, holdings, performance)  
> Behaviour: [../02-specify.md](/05-specs/07-portfolio/02-specify/) · API: [openapi.yaml](/05-specs/07-portfolio/05-contracts/openapi.yaml)

---

## 1. Purpose

Serve **all Portfolio data** from Salesforce (Orion Data Sync for FSC / OASP). Middleware does **not** call Orion Connect live ([ADR-003](/01-constitution/constitution/#adr-003--no-orion-connect-api-in-neopix-scope)) and does **not** read external staging feeds for Portfolio.

| Story | Data | Source |
|---|---|---|
| P-01 Summary | Total market value, YTD realized G/L | SF |
| P-02 Allocation | Household and account; by category and by class | SF |
| P-03 Account list | Managed FAs, balances | SF |
| P-04 Account summary | FA identity, balances | SF |
| P-05 Performance | Account performance series | SF |
| P-06 Holdings | Position rows per FA | SF |

No Positions provider, no PerformanceProvider, no middleware computation from external staging.

---

## 2. Objects (read)

| SF object | Middleware use |
|---|---|
| Parent + Orion child `Account` | Household graph; OASP performance % / as-of |
| `FinServ__FinancialAccount__c` | Managed accounts, balances, YTD return/G/L fields |
| `FinServ__FinancialHolding__c` (or OASP equivalent) | Position rows per FA — **P-06** |
| Performance / OASP series objects (TBD with OnePoint) | Account performance time series — **P-05** |
| `OASP_FSC__Custodian__c` | Custodian display name |
| Allocation / OASP rollup objects (TBD with OnePoint) | `portfolio_orion` allocation — household and account; by category and by class |
| `Mobile_Feature_Flags__c` | `Portfolio_Enabled__c`, `Portfolio_YTD_Realized_GL__c`, provider |

Field-level maps: [data-model.md §3](/03-data/data-model/). Prefer Callaway sandbox export names over docs when they differ.

---

## 3. Visibility & dedupe rules (middleware)

1. Include FA only when `is_managed` / `FinServ__Managed__c` indicates OnePoint-managed (Orion).  
2. Must belong under authenticated client’s parent Account → Client Entity children.  
3. Exclude orphans not linked to the CRM household.  
4. Orion wins on account-number duplicates vs eMoney ([ADR-011](/01-constitution/constitution/#adr-011--orion-wins-on-duplicate-account-numbers)).  
5. This delivery: show all household FAs (FAR per-person filter is out of scope).

---

## 4. Allocation (`portfolio_orion`) — Salesforce only

Middleware reads allocation slices from SF for:

| Level | Dimensions |
|---|---|
| Household | by category, by class |
| Account (`scope_entity_id` = FA) | by category, by class |

Rules:

- **Without** remapping eMoney classes ([ADR-010](/01-constitution/constitution/#adr-010--dual-allocation-scopes)).  
- Household and account use the **same** category codes and **same** class codes.  
- Each dimension is independent: if category exists in SF and class does not → `byCategory.status` = `ready`, `byClass.status` = `unavailable`.  
- If SF lacks slices for a dimension → `unavailable`; do not invent categories/classes.  
- Unclassified value in an explicit **Unclassified** slice when SF supplies it.

See [02-specify.md P-02](/05-specs/07-portfolio/02-specify/#p-02--see-orion-asset-allocation) and [data-model.md §3.6](/03-data/data-model/).

---

## 5. Holdings (positions) — Salesforce only

Middleware reads position rows from SF for each managed FA:

| Field | SF source (TBD) |
|---|---|
| Name | `FinServ__FinancialHolding__c` security name |
| Symbol | Symbol / ticker field |
| Quantity | Units |
| Price | Unit price |
| Market value | Market value |
| Change % | Change % field |
| Category code | Orion category classification |
| Class code | Orion class classification |
| Is alternative | Alternative flag |
| As-of | Holding as-of |
| Parent FA lookup | `FinServ__FinancialHolding__c.FinServ__FinancialAccount__c` (TBD confirm with OnePoint) |

Rules:

- Return only holdings for FAs in the client’s visible managed set.  
- `weight_pct` computed in middleware: holding market value ÷ account market value (**P-04**).  
- If SF has no holding rows for an account → holdings status `unavailable`; do not invent rows.  
- Category/class codes on holdings must match allocation taxonomy codes (**P-02**).

See [02-specify.md P-06](/05-specs/07-portfolio/02-specify/#p-06--see-account-holdings) and [data-model.md §3.4](/03-data/data-model/).

---

## 6. Performance series — Salesforce only

Middleware reads account performance time series from SF for timeframes **1M, 3M, 6M, YTD, 1Y, 3Y**:

| Field | SF source (TBD) |
|---|---|
| Date | Performance point date |
| Market value | Market value at date |
| Return % | Return % (absent when unavailable) |
| Timeframe | Request param mapped to SF series |
| As-of | Sync / snapshot timestamp |

Rules:

- Return series only for FAs in the client’s visible managed set.  
- If SF has no series for a timeframe → status `unavailable` for that timeframe; do not invent points.  
- Unavailable performance does not block account summary (**P-04**).

See [02-specify.md P-05](/05-specs/07-portfolio/02-specify/#p-05--see-account-performance) and [data-model.md §3.5](/03-data/data-model/).

---

## 7. Test data (sandbox)

| Household | Purpose |
|---|---|
| A — 2+ managed FAs, performance fields populated | P-01 / P-03 happy |
| A — household category + class allocation rollups | P-02 household |
| A — per-account category + class allocation rollups | P-02 account |
| A — holding rows on 1+ managed FAs | P-06 happy |
| A — performance series on 1+ managed FAs | P-05 happy |
| B — no managed FAs | Empty state |
| C — FA also present in eMoney | Appears on Portfolio only |
| D — `portfolio_enabled` false | Tab hidden |

---

## 8. Done when

- [ ] FA list + balances readable for demo households  
- [ ] Custodian names resolve  
- [ ] Household allocation by category and by class from SF  
- [ ] Account allocation by category and by class from SF  
- [ ] Holding rows readable for demo accounts (or explicitly unavailable)  
- [ ] Performance series readable for demo accounts (or explicitly unavailable)  
- [ ] Feature flags togglable  
- [ ] Masked account numbers only on API responses  
