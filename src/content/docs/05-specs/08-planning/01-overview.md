---
title: "E08 Planning — Client Overview"
---

> Discovery package entry for E08. Holistic financial picture for households with an eMoney plan — net worth, planning allocation, goals, expenses, linked accounts, institution linking, and Home planning context.  
> Behaviour SoT: [02-specify.md](/05-specs/08-planning/02-specify/) — specify wins if this overview and specify disagree.  
> Not included: Sprint plans, task lists, GWT suites, separate UAT files, runbooks (delivery / QA own those after handoff).  
> Shared conventions: [specs README](/05-specs/readme/) (MoSCoW, package shape, Discovery DoD, dependency graph).

| Field | Value |
|-------|-------|
| Status | Discovery locked |
| Package version | 1.0.0 |
| Date | 2026-07-17 |
| Specify | [02-specify.md](/05-specs/08-planning/02-specify/) (stories + NFRs) |
| API contract | [05-contracts/openapi.yaml](/05-specs/08-planning/05-contracts/openapi/) |
| Salesforce contract | [05-contracts/salesforce.md](/05-specs/08-planning/05-contracts/salesforce/) |
| eMoney (global) | [emoney.md](/04-integrations/emoney/) |
| Depends on | [E07 Portfolio](/05-specs/07-portfolio/01-overview/) *(for NW merge clarity; also [E03](/05-specs/03-configuration/01-overview/))* |
| Unlocks | Soft — Home net worth / planning allocation ([E04](/05-specs/04-home/01-overview/)); Action Required link-break alerts ([E10](/05-specs/10-alerts/01-overview/)); Release gate ([E11](/05-specs/11-release/01-overview/)) |
| Changelog | [CHANGELOG.md](/05-specs/08-planning/changelog/) |

Global context: [prd.md](/product/prd/) · [architecture.md](/02-architecture/architecture/) · [constitution.md](/01-constitution/constitution/) · [data-model.md](/03-data/data-model/) §4

Handoff: Build from [02-specify.md](/05-specs/08-planning/02-specify/) + OpenAPI + [salesforce.md](/05-specs/08-planning/05-contracts/salesforce/). **Reads are Salesforce-first** (eMoney → SF sync); middleware computes net worth and `planning_combined` allocation. Link/relink use eMoney-hosted WebView only — no Tier B eMoney API reads in Neopix SOW this delivery ([ADR-025](/01-constitution/constitution/#adr-025--tier-b-and-tier-c-in-neopix-sow)). Stub with fixtures / `unavailable` until [status.md](/04-integrations/status/) clears SF planning fields. Raise product gaps as ADRs — do not invent plan figures.

---

## 1. Problem

Clients with an eMoney financial plan need a **holistic view** — net worth, goals, expenses, and linked external accounts — that is clearly **separate from the Orion Portfolio tab**. Mixing the two surfaces confuses managed AUM with held-away assets and breaks trust when taxonomies are remapped.

Without this pack:

- Home cannot show honest net worth when a plan exists  
- Clients have no in-app path to fix broken institution links  
- Planning content disappears incorrectly when Portfolio alone should remain  

E08 establishes the planning surface: **Salesforce holds synced eMoney plan objects; middleware owns net worth and `planning_combined` allocation; Orion-managed accounts stay on Portfolio; linking is institution-first via eMoney WebView; custom UI only — no eMoney gauge embeds** ([ADR-009](/01-constitution/constitution/#adr-009--portfolio-orion-only-planning-emoney-only), [ADR-010](/01-constitution/constitution/#adr-010--dual-allocation-scopes), [ADR-012](/01-constitution/constitution/#adr-012--no-emoney-gauge-embeds), [ADR-029](/01-constitution/constitution/#adr-029--home-without-emoney), [ADR-038](/01-constitution/constitution/#adr-038--net-worth-calculation), [ADR-040](/01-constitution/constitution/#adr-040--institution-first-emoney-linking)).

---

## 2. Outcomes

| Measure | Target | Evidence |
|---|---|---|
| Planning tab | Overview, Goals, Expenses, Accounts for eMoney test household | §8 Path 1 · **PL-01**–**PL-08** |
| Net worth | Middleware-computed per [ADR-038](/01-constitution/constitution/#adr-038--net-worth-calculation); not eMoney-displayed totals | §8 Path 1 · **PL-02** |
| Allocation | `planning_combined` taxonomy; never merged with `portfolio_orion` | §8 Path 1 · **PL-03** · [ADR-010](/01-constitution/constitution/#adr-010--dual-allocation-scopes) |
| Linking | Relink broken + link institution via eMoney WebView | §8 Path 2 · **PL-09**, **PL-10** · [ADR-040](/01-constitution/constitution/#adr-040--institution-first-emoney-linking) |
| Home | Net worth + planning allocation when enabled | §8 Path 4 · **PL-11** |
| Without eMoney / flag off | Tab and Home planning context **hidden**; Portfolio context can remain | §8 Path 3 · **PL-01**, **PL-11** · [ADR-029](/01-constitution/constitution/#adr-029--home-without-emoney) |

---

## 3. Scope summary

Story MoSCoW tags use definitions in [specs README](/05-specs/readme/#moscow). Full acceptance criteria: [02-specify.md](/05-specs/08-planning/02-specify/).

### In scope (Must)

- Planning tab with flag-gated sections (**PL-01**)  
- Net worth (assets, liabilities, headline) (**PL-02**)  
- Planning allocation (`planning_combined`) (**PL-03**)  
- Plan probability and Monte Carlo when flagged (**PL-04**, **PL-05**)  
- Expenses (simple or itemized, read-only) (**PL-06**)  
- Goals list (**PL-07**)  
- Linked external accounts list (**PL-08**)  
- Relink broken account and link institution (eMoney WebView) (**PL-09**, **PL-10**)  
- Home net worth and planning allocation context (**PL-11**)  

### Out of scope (Won't)

| Item | Story / note |
|---|---|
| Manual held-away account entry | PL-12 |
| Client expense edits in app | PL-13 |
| Linked account nickname edit | PL-14 |
| eMoney gauge embeds | [ADR-012](/01-constitution/constitution/#adr-012--no-emoney-gauge-embeds) |
| Planning upsell / empty CTA when tab hidden | Not in this pack |
| Direct eMoney Tier B API reads for plan data | [ADR-025](/01-constitution/constitution/#adr-025--tier-b-and-tier-c-in-neopix-sow) — SF sync only |
| Planning alerts (`linked_account_broken`, `planning_update`) | Owned by [E10 Alerts](/05-specs/10-alerts/02-specify/) |

### Product constraints

| Constraint | Detail |
|---|---|
| Tab label | **Planning** with **Powered by eMoney** attribution |
| Data reads | Salesforce (eMoney → SF sync); middleware computes net worth and `planning_combined` allocation |
| Net worth formula | Assets = Orion managed AUM + eMoney held-away/external + insurance **cash value**; Liabilities = eMoney liabilities; Orion wins on duplicate account numbers ([ADR-038](/01-constitution/constitution/#adr-038--net-worth-calculation), [ADR-011](/01-constitution/constitution/#adr-011--orion-wins-on-duplicate-account-numbers)) |
| Real estate in NW | Include eMoney home/Zillow value when synced ([ADR-043](/01-constitution/constitution/#adr-043--real-estate--zillow-home-value)) |
| Allocation taxonomies | `planning_combined` separate from `portfolio_orion` — never merged ([ADR-010](/01-constitution/constitution/#adr-010--dual-allocation-scopes)) |
| Portfolio vs Planning accounts | Orion-managed accounts on Portfolio only; client-linked accounts on Planning only ([ADR-009](/01-constitution/constitution/#adr-009--portfolio-orion-only-planning-emoney-only)) |
| Linking | Institution-first via eMoney WebView ([ADR-040](/01-constitution/constitution/#adr-040--institution-first-emoney-linking)); credentials never stored in mobile (**NFR-04**) |
| UI | Figma is layout authority; custom components only — no eMoney gauge embeds ([ADR-012](/01-constitution/constitution/#adr-012--no-emoney-gauge-embeds)) |
| Without planning | Hide Planning tab, Home net worth, and planning allocation; Portfolio Home context remains when `portfolio_enabled` ([ADR-029](/01-constitution/constitution/#adr-029--home-without-emoney)) |
| Expenses | Read-only; optional **Contact your advisor** CTA (edit path is **PL-13** Won't) |
| Flags | `planning_enabled`, `planning_overview`, `planning_expenses`, `planning_goals`, `planning_linked_accounts`, `planning_monte_carlo` ([CFG-04](/05-specs/03-configuration/02-specify/#cfg-04--publish-the-domain-option-catalog)) |
| Manual / nickname / expense edit | Won't (**PL-12**–**PL-14**) until a superseding ADR |

---

## 4. What the client must provide

| Item | Owner | Needed before |
|---|---|---|
| eMoney → SF field sync for planning objects | Callaway | §8 Path 1 live demo |
| eMoney WebView URLs for link and relink | Client / eMoney | **PL-09**, **PL-10** |
| Test household with active eMoney plan | Client | Tab demo |
| NW formula sign-off | OnePoint | **PL-02** acceptance |
| Pack overview available for client reference | Neopix | As needed |

Operational blockers: [status.md](/04-integrations/status/). Missing SF fields authorize `unavailable` / hidden sections — not invented plan data.

---

## 5. Assumptions

1. `planning_enabled` is set **manually** by advisor/admin when a plan exists (no auto-detect Must).  
2. Read path is Salesforce-first; direct eMoney from middleware is WebView link/relink handoff only.  
3. Orion wins on duplicate account numbers in net worth and planning allocation ([ADR-011](/01-constitution/constitution/#adr-011--orion-wins-on-duplicate-account-numbers)).  
4. Effective flags come from [E03](/05-specs/03-configuration/02-specify/) **CFG-04** / `/me`.  
5. Home shell and composite `/home` DTO come from [E04](/05-specs/04-home/01-overview/); this pack owns net worth and `planning_combined` teaser slices.  
6. Plan probability is eMoney’s figure synced to SF — the app does not overlay Orion balances into probability.

---

## 6. Risks

| Risk | Impact | Mitigation |
|---|---|---|
| eMoney → SF sync gaps | Blank Planning sections | Section `unavailable` or hidden; do not invent (**NFR-03**) |
| Broken institution links | Stale balances / client frustration | Relink CTA (**PL-09**) + Home alert ([E10](/05-specs/10-alerts/02-specify/)) |
| Plan probability stale if Orion missing from eMoney plan | Misleading “on track” | Advisor data-quality issue; app does not overlay Orion into probability |
| Scope pressure for manual account / expense edit | Delivery thrash | Locked as Won't (**PL-12**–**PL-14**) until approved ADR |
| Mixing with Portfolio taxonomy | Wrong allocation story | Dual scopes never merged ([ADR-010](/01-constitution/constitution/#adr-010--dual-allocation-scopes)) |

---

## 7. Cross-pack hooks

| Hook | Relationship | Doc |
|---|---|---|
| Configuration | `planning_*` flags | [03-configuration CFG-04](/05-specs/03-configuration/02-specify/#cfg-04--publish-the-domain-option-catalog) |
| Home | Net worth + planning allocation teasers | [04-home/01-overview.md](/05-specs/04-home/01-overview/) |
| Portfolio | Separate taxonomy; Orion AUM for NW inputs; duplicate account rule | [07-portfolio](/05-specs/07-portfolio/01-overview/) · [ADR-009](/01-constitution/constitution/#adr-009--portfolio-orion-only-planning-emoney-only) · [ADR-011](/01-constitution/constitution/#adr-011--orion-wins-on-duplicate-account-numbers) |
| Alerts | `linked_account_broken`, `planning_update` | [10-alerts/02-specify.md](/05-specs/10-alerts/02-specify/) |
| Entities | Planning overview, goals, expenses, linked accounts | [data-model.md §4](/03-data/data-model/) |
| Global eMoney | Sync expectations; WebView linking | [emoney.md](/04-integrations/emoney/) |
| SF pack | Field maps | [salesforce.md](/05-specs/08-planning/05-contracts/salesforce/) |
| Release | Planning after Portfolio for NW clarity | [11-release](/05-specs/11-release/01-overview/) · [specs README](/05-specs/readme/) |

---

## 8. Acceptance demo

These four paths are the **client acceptance bar** for E08. Field lists and status rules live in [02-specify.md](/05-specs/08-planning/02-specify/).

### Path 1 — Planning tab

1. eMoney household; `planning_enabled` on.  
2. Overview — net worth, allocation, plan probability (**PL-02**–**PL-04**).  
3. Monte Carlo when `planning_monte_carlo` on (**PL-05**).  
4. Goals, Expenses, Linked accounts sections (**PL-06**–**PL-08**).

### Path 2 — Linking

1. Broken linked account — relink via WebView (**PL-09**).  
2. Link institution — new account appears after sync (**PL-10**).

### Path 3 — Without planning

1. `planning_enabled` off — tab hidden, Home planning context hidden (**PL-01**, **PL-11**).  
2. Portfolio Home context still shows when `portfolio_enabled` ([07-portfolio P-07](/05-specs/07-portfolio/02-specify/#p-07--see-portfolio-context-on-home)).

### Path 4 — Home

1. Home net worth + planning allocation → opens Planning (**PL-11**).

---

## 9. Discovery Definition of Done

Complete shared DoD in [specs README](/05-specs/readme/#discovery-definition-of-done), plus:

- [ ] [02-specify.md](/05-specs/08-planning/02-specify/) **PL-01**–**PL-11** accepted; Won't **PL-12**–**PL-14** acknowledged  
- [ ] NFRs accepted (latency, `dataAsOf`, no invented values, no credential storage)  
- [ ] Contracts reviewed — [OpenAPI](/05-specs/08-planning/05-contracts/openapi/), [salesforce.md](/05-specs/08-planning/05-contracts/salesforce/)  
- [ ] NW formula accepted ([ADR-038](/01-constitution/constitution/#adr-038--net-worth-calculation))  
- [x] Neopix Planning Figma reviewed   
- [ ] §8 Paths 1–4 agreed as client demo bar  
- [ ] Open items have owners and blocks-build Y/N  

### Open items

| Item | Owner | Blocks build? |
|---|---|---|
| SF planning object field map | Callaway | Partial — `unavailable` OK for build |
| eMoney WebView link/relink contract | Client / eMoney | Partial for **PL-09** / **PL-10** live demo |
| Planning Figma | Neopix | Done |

---

## 10. Build baseline

This pack is part of the locked discovery baseline for build. Domain behaviour is governed by linked specifies where present — those specifies win. Figma is layout authority for build ([AGENTS.md](/agents/)). Behaviour changes update specify (and ADR/PRD if needed) before code.


---

Related: [Specify](/05-specs/08-planning/02-specify/) · [OpenAPI](/05-specs/08-planning/05-contracts/openapi/) · [Salesforce](/05-specs/08-planning/05-contracts/salesforce/) · [specs README](/05-specs/readme/) · [CHANGELOG](/05-specs/08-planning/changelog/)
