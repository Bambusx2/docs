---
title: "E07 Portfolio — Client Overview"
---

> Discovery package entry for E07. Orion-managed AUM — household summary, allocation (category + class), managed accounts, account summary / performance / holdings, and Home portfolio context.  
> Behaviour SoT: [02-specify.md](/05-specs/07-portfolio/02-specify/) — specify wins if this overview and specify disagree.  
> Not included: Sprint plans, task lists, GWT suites, separate UAT files, runbooks (delivery / QA own those after handoff).  
> Shared conventions: [specs README](/05-specs/readme/) (MoSCoW, package shape, Discovery DoD, dependency graph).

| Field | Value |
|-------|-------|
| Status | Discovery locked |
| Package version | 1.0.0 |
| Date | 2026-07-17 |
| Specify | [02-specify.md](/05-specs/07-portfolio/02-specify/) (stories + NFRs) |
| API contract | [05-contracts/openapi.yaml](/05-specs/07-portfolio/05-contracts/openapi/) |
| Salesforce contract | [05-contracts/salesforce.md](/05-specs/07-portfolio/05-contracts/salesforce/) |
| Orion (global) | [orion.md](/04-integrations/orion/) |
| Depends on | [E03 Configuration](/05-specs/03-configuration/01-overview/) *(soft calendar: after E06)* |
| Unlocks | Soft — Home `portfolio_orion` context ([E04](/05-specs/04-home/01-overview/)); Planning NW merge clarity ([E08](/05-specs/08-planning/01-overview/)); Release gate ([E11](/05-specs/11-release/01-overview/)) |
| Changelog | [CHANGELOG.md](/05-specs/07-portfolio/changelog/) |

Global context: [prd.md](/product/prd/) · [architecture.md](/02-architecture/architecture/) · [constitution.md](/01-constitution/constitution/) · [data-model.md](/03-data/data-model/) §3

Handoff: Build from [02-specify.md](/05-specs/07-portfolio/02-specify/) + OpenAPI + [salesforce.md](/05-specs/07-portfolio/05-contracts/salesforce/). **All Portfolio data is Salesforce Tier A** (Orion Data Sync / OASP) — never live Orion Connect, never invent balances, allocation, holdings, or performance. Stub with fixtures / `unavailable` until [status.md](/04-integrations/status/) clears SF field maps. Raise product gaps as ADRs.

---

## 1. Problem

Clients need a clear view of **OnePoint-managed AUM** — how much they have with the firm, how it is allocated, which accounts they hold, and how each account has performed — **independent of eMoney planning**, with an honest **data as of** on every figure.

Without this pack:

- Home cannot show a trustworthy Orion allocation teaser  
- Planning and Portfolio taxonomies get mixed or remapped incorrectly  
- Missing SF holdings/performance gets coerced to zeros and erodes trust  

E07 establishes the managed-asset surface: **Salesforce is the only read path; Orion is attribution and upstream sync, not a live API from Neopix; Portfolio never includes held-away or net worth; allocation scope is `portfolio_orion` only** ([ADR-001](/01-constitution/constitution/#adr-001--middleware-as-the-only-mobile-data-plane), [ADR-003](/01-constitution/constitution/#adr-003--no-orion-connect-api-in-neopix-scope), [ADR-009](/01-constitution/constitution/#adr-009--portfolio-orion-only-planning-emoney-only), [ADR-010](/01-constitution/constitution/#adr-010--dual-allocation-scopes), [ADR-044](/01-constitution/constitution/#adr-044--orion-portal-parity-for-v1-portfolio)).

---

## 2. Outcomes

| Measure | Target | Evidence |
|---|---|---|
| Summary + accounts | Total market value (+ YTD realized G/L when flagged); managed account list matches sandbox expectation | §8 Path 1 · **P-01**, **P-03** |
| Allocation | Household and account; by **category** and by **class**; same codes; no invented slices | §8 Path 1–2 · **P-02** |
| Account drill-down | Summary, performance (1M–3Y), and holdings independently; missing → `unavailable` | §8 Path 2 · **P-04**–**P-06** |
| Home context | `portfolio_orion` allocation **by category** only; still available when planning is off | §8 Path 3 · **P-07** · [ADR-029](/01-constitution/constitution/#adr-029--home-without-emoney) |
| Flag gating | Tab and Home context omitted when `portfolio_enabled` false | §8 Path 1 · [CFG-04](/05-specs/03-configuration/02-specify/#cfg-04--publish-the-domain-option-catalog) |
| Honest timestamps | Every monetary / performance / allocation figure carries `dataAsOf` | **NFR-02** · [ADR-004](/01-constitution/constitution/#adr-004--daily-data-cadence-and-data-as-of) |

---

## 3. Scope summary

Story MoSCoW tags use definitions in [specs README](/05-specs/readme/#moscow). Full acceptance criteria: [02-specify.md](/05-specs/07-portfolio/02-specify/).

### In scope (Must)

- Portfolio summary: total market value; YTD realized gain/loss when `portfolio_ytd_realized_gl` is on (**P-01**)  
- Asset allocation: household and account; by category and by class (**P-02**)  
- Managed account list (**P-03**)  
- Account summary, account performance, account holdings (**P-04**–**P-06**)  
- Home portfolio allocation context — category only (**P-07**)  
- Flag gating and `dataAsOf` on all figures  

### Out of scope (Won't)

| Item | Story / note |
|---|---|
| Tax lots / holding deep drill | P-08 |
| Transactions / activities | P-09 |
| Benchmark comparison | P-10 |
| Live Orion Connect from Neopix | [ADR-003](/01-constitution/constitution/#adr-003--no-orion-connect-api-in-neopix-scope) |
| eMoney / held-away / net worth on Portfolio | [ADR-009](/01-constitution/constitution/#adr-009--portfolio-orion-only-planning-emoney-only) — owned by [E08](/05-specs/08-planning/01-overview/) |
| Merging `portfolio_orion` with planning taxonomies | [ADR-010](/01-constitution/constitution/#adr-010--dual-allocation-scopes) |
| Orion portal extras beyond prototype scope | [ADR-044](/01-constitution/constitution/#adr-044--orion-portal-parity-for-v1-portfolio) |

### Product constraints

| Constraint | Detail |
|---|---|
| Scope lock | Prototype scope only — [ADR-044](/01-constitution/constitution/#adr-044--orion-portal-parity-for-v1-portfolio) Accepted; Orion portal extras (transactions, benchmarks, tax lots) are Won't (**P-08**–**P-10**) |
| Data source | All Portfolio data from Salesforce (Orion Data Sync / OASP) — [salesforce.md](/05-specs/07-portfolio/05-contracts/salesforce/) |
| Domain scope | Orion-managed AUM only — not eMoney, not net worth, not held-away ([ADR-009](/01-constitution/constitution/#adr-009--portfolio-orion-only-planning-emoney-only)) |
| Allocation taxonomies | `portfolio_orion` separate from planning — never merged ([ADR-010](/01-constitution/constitution/#adr-010--dual-allocation-scopes)) |
| Live data | Synced snapshots with `dataAsOf` — not live Orion Connect ([ADR-003](/01-constitution/constitution/#adr-003--no-orion-connect-api-in-neopix-scope), [ADR-004](/01-constitution/constitution/#adr-004--daily-data-cadence-and-data-as-of)) |
| Account visibility | All Orion FAs under the CRM parent household; per-person FAR filtering is out of this delivery ([data-model.md §14](/03-data/data-model/)) |
| Duplicate accounts | Orion wins over eMoney on duplicate account numbers ([ADR-011](/01-constitution/constitution/#adr-011--orion-wins-on-duplicate-account-numbers)) |
| Missing data | `unavailable` or omit — never invent zeros for allocation, holdings, or performance (**NFR-03**) |
| YTD realized G/L | Flag-gated by `portfolio_ytd_realized_gl`; omit when absent ([ADR-033](/01-constitution/constitution/#adr-033--ytd-realized-gainloss-card)) |
| Naming | Tab **OnePoint BFG Portfolio** with **Powered by Orion** attribution |
| Flags | `portfolio_enabled`, `portfolio_ytd_realized_gl` ([CFG-04](/05-specs/03-configuration/02-specify/#cfg-04--publish-the-domain-option-catalog)) |
| UI | Figma is layout authority; specify defines data and business rules only |

---

## 4. What the client must provide

| Item | Owner | Needed before |
|---|---|---|
| SF Orion account list + balances (sandbox household) | Callaway | §8 Path 1 live demo |
| Category + class allocation mapping (household + account) | OnePoint / Callaway | Allocation demo (**P-02**) |
| SF holdings rows on managed FAs | Callaway / OnePoint | Holdings demo (**P-06**) |
| SF performance series on managed FAs | Callaway / OnePoint | Performance demo (**P-05**) |
| YTD realized G/L field + firm toggle intent | OnePoint | Flag-gated **P-01** card |
| Pack overview available for client reference | Neopix | As needed |

Operational blockers: [status.md](/04-integrations/status/). Missing holdings/performance/allocation maps authorize `unavailable` — not invented values.

---

## 5. Assumptions

1. Portfolio shows **Orion-managed AUM only**; Planning owns eMoney / net worth / held-away ([ADR-009](/01-constitution/constitution/#adr-009--portfolio-orion-only-planning-emoney-only)).  
2. Portfolio remains usable when `planning_enabled` is false ([ADR-029](/01-constitution/constitution/#adr-029--home-without-emoney)).  
3. All Must stories (**P-01**–**P-07**) read from Salesforce Tier A only — no live Orion Connect from Neopix ([ADR-003](/01-constitution/constitution/#adr-003--no-orion-connect-api-in-neopix-scope)).  
4. Effective flags come from [E03](/05-specs/03-configuration/02-specify/) **CFG-04** / `/me`.  
5. Home shell and composite `/home` DTO come from [E04](/05-specs/04-home/01-overview/); this pack owns the `portfolio_orion` category teaser slice.  
6. SF field accuracy (Orion↔SF sync) is a client / Callaway concern; Neopix does not invent supplemental holdings ([ADR-023](/01-constitution/constitution/#adr-023--neopix-sow-vs-client-integration-boundary)).

---

## 6. Risks

| Risk | Impact | Mitigation |
|---|---|---|
| SF holdings or performance not hydrated | Blank account facets | Status `unavailable` for **P-05** / **P-06**; balances still available (**NFR-03**) |
| Category vs class taxonomy gaps | Incomplete allocation UI | Per-dimension `unavailable`; slices are not invented |
| YTD realized G/L not populated | Misleading zero G/L | Field gated by `portfolio_ytd_realized_gl`; omit when absent ([ADR-033](/01-constitution/constitution/#adr-033--ytd-realized-gainloss-card)) |
| Mixing Portfolio with Planning taxonomies | Wrong client story | Dual scopes never merged ([ADR-010](/01-constitution/constitution/#adr-010--dual-allocation-scopes)) |
| Pressure to match full Orion portal | Scope creep | [ADR-044](/01-constitution/constitution/#adr-044--orion-portal-parity-for-v1-portfolio) locks prototype scope; **P-08**–**P-10** Won't |

---

## 7. Cross-pack hooks

| Hook | Relationship | Doc |
|---|---|---|
| Configuration | `portfolio_enabled`, `portfolio_ytd_realized_gl` | [03-configuration CFG-04](/05-specs/03-configuration/02-specify/#cfg-04--publish-the-domain-option-catalog) |
| Home | `portfolio_orion` category context | [04-home/01-overview.md](/05-specs/04-home/01-overview/) |
| Planning / net worth | Separate domain; Orion wins on duplicate account numbers | [08-planning](/05-specs/08-planning/01-overview/) · [ADR-009](/01-constitution/constitution/#adr-009--portfolio-orion-only-planning-emoney-only) · [ADR-011](/01-constitution/constitution/#adr-011--orion-wins-on-duplicate-account-numbers) |
| Entities | Accounts, holdings, performance, allocation | [data-model.md §3](/03-data/data-model/) |
| Global Orion | Reference / attribution; not live Neopix API | [orion.md](/04-integrations/orion/) |
| SF pack | Field maps and visibility | [salesforce.md](/05-specs/07-portfolio/05-contracts/salesforce/) |
| Release | Portfolio before / with Planning wave | [11-release](/05-specs/11-release/01-overview/) · [specs README](/05-specs/readme/) |

---

## 8. Acceptance demo

These three paths are the **client acceptance bar** for E07. Field lists and status rules live in [02-specify.md](/05-specs/07-portfolio/02-specify/).

### Path 1 — Summary + accounts + allocation

1. Sandbox household with Orion FAs; `portfolio_enabled` on.  
2. Portfolio — total market value and YTD realized G/L when flagged (**P-01**); account list (**P-03**).  
3. Household allocation by category and by class (**P-02**).  
4. Flag off — tab and Home portfolio context **hidden**.

### Path 2 — Account drill-down

1. Open an account — summary balances + `dataAsOf` (**P-04**).  
2. Account allocation by category and by class (**P-02**).  
3. Performance series for standard timeframes (**P-05**).  
4. Holdings list with weights (**P-06**).  
5. Missing facet → `unavailable`; other facets still usable.

### Path 3 — Home

1. Home `portfolio_orion` context shows category allocation → opens Portfolio (**P-07**).  
2. With `planning_enabled` off, portfolio context remains available.

---

## 9. Discovery Definition of Done

Complete shared DoD in [specs README](/05-specs/readme/#discovery-definition-of-done), plus:

- [ ] [02-specify.md](/05-specs/07-portfolio/02-specify/) **P-01**–**P-07** accepted; Won't **P-08**–**P-10** acknowledged  
- [ ] NFRs accepted (latency, `dataAsOf`, no invented values, PII masking)  
- [ ] Contracts reviewed — [OpenAPI](/05-specs/07-portfolio/05-contracts/openapi/), [salesforce.md](/05-specs/07-portfolio/05-contracts/salesforce/)  
- [x] Neopix Portfolio Figma reviewed   
- [ ] §8 Paths 1–3 agreed as client demo bar  
- [ ] Open items have owners and blocks-build Y/N  

### Open items

| Item | Owner | Blocks build? |
|---|---|---|
| SF holdings + performance field map + demo rows | Callaway / OnePoint | Partial — `unavailable` OK for build |
| Category/class field map (household + account) | OnePoint / Callaway | Partial — `unavailable` OK for build |
| YTD realized G/L + firm toggle | OnePoint | N — flag-gated |
| Portfolio Figma | Neopix | Done |

---

## 10. Build baseline

This pack is part of the locked discovery baseline for build. Domain behaviour is governed by linked specifies where present — those specifies win. Figma is layout authority for build ([AGENTS.md](/agents/)). Behaviour changes update specify (and ADR/PRD if needed) before code.


---

Related: [Specify](/05-specs/07-portfolio/02-specify/) · [OpenAPI](/05-specs/07-portfolio/05-contracts/openapi/) · [Salesforce](/05-specs/07-portfolio/05-contracts/salesforce/) · [specs README](/05-specs/readme/) · [CHANGELOG](/05-specs/07-portfolio/changelog/)
