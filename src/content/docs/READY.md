---
title: "OnePoint — Implementation readiness"
---

> Purpose: How to start building from the locked Discovery Spec Bundle, and how PM + developers run delivery while discovery is on consult only.  
> Not this doc: Product story ([prd](/product/prd/)) · decisions ([constitution](/01-constitution/constitution/)) · behaviour (`05-specs/*/02-specify.md`) · field maps ([data-model](/03-data/data-model/)).  
> Living blockers: [status.md](/04-integrations/status/).

Discovery lock: 2026-07-17 · Bundle: [VERSION](/VERSION) · Implementation start: 2026-07-20

---

## How to read

| If you need… | Go to |
|---|---|
| Day-one rules and first slice | [§1](#1-day-one-rules) → [§3](#3-first-slice) |
| What is already locked | [§2](#2-what-is-locked) |
| Client credentials / field chase (parallel) | [§4](#4-parallel-client-track) |
| Consult SLA, change control, weekly demo | [§5](#5-delivery-ops-pm-led) |
| Pilot and security steering | [§6](#6-steer-toward-pilot) |

This file wins on stub-vs-wait posture when integrations are yellow. It defers to specify (behaviour), ADRs (decisions), and [prd §5.1](/product/prd/#51-pilot-definition-of-done) (pilot bar).

---

## At a glance

Cold start (~20 min): [prd](/product/prd/) → this file → [AGENTS](/agents/) → [05-specs/README](/05-specs/readme/) dependency graph → first pack `02-specify.md` + `05-contracts/`.

First slice: E01 scaffold → E02 mock IdP + `/me` → E03 effective flags → one domain with fixtures (prefer E07 Portfolio or E05 Team). Wire E04 Home as domains land. Treat E11 as a later pilot gate. Schedule CFG-02 preview web in parallel ([ADR-047](/01-constitution/constitution/#adr-047--advisor-preview-requires-web-client-surface)).

Staffing: Developers and the project manager own delivery. Discovery / architecture consult joins only on the triggers in [§5](#5-delivery-ops-pm-led).

UX: Figma is layout authority ([AGENTS.md](/agents/)).

---

## 1. Day-one rules

Yellow integrations do not block first commits — they change how you build (fixtures), not whether you build.

| Rule | Meaning |
|---|---|
| Build from locked specs | Open `02-specify.md`, pack `05-contracts/`, and the matching [04-integrations/](/04-integrations/readme/) contract |
| Never invent financial data | Missing holdings, performance, or fields → fixtures, empty list, or `unavailable` |
| Stub blocked integrations | Mock IdP, fixture vault/feed, local middleware until credentials land ([status](/04-integrations/status/)) |
| Change control | Behaviour change updates specify (and ADR / PRD if needed) before code |
| Respect approved Figma | Do not invent navigation chrome or screen structure in code review |

Hard constraints: [AGENTS.md](/agents/).

---

## 2. What is locked

| Item | Status |
|---|---|
| [Product brief](/product/prd/) | Locked for build (2026-07-17) |
| ADR-001 … ADR-047 | Accepted (ADR-019 Superseded) |
| Tier A ingest | Salesforce only |
| Tier B / Tier C in Neopix SOW | Out ([ADR-025](/01-constitution/constitution/#adr-025--tier-b-and-tier-c-in-neopix-sow)) |
| Holdings / performance | From SF Tier A ([ADR-024](/01-constitution/constitution/#adr-024--holdings-source-tier-c)); stub if empty |
| Document vault | eMoney Vault ([ADR-030](/01-constitution/constitution/#adr-030--document-vault-api-path)); fixture until credentials |
| MFA / biometrics / OS push | Won't this delivery |
| Advisor LWC preview | In scope — web client surface ([ADR-047](/01-constitution/constitution/#adr-047--advisor-preview-requires-web-client-surface)) |
| Phase 1 Figma | Complete (layout authority — [AGENTS.md](/agents/)) |

---

## 3. First slice

| Order | Pack | Build from | Stub posture |
|:---:|---|---|---|
| 1 | E01 Platform | [overview](/05-specs/01-platform/01-overview/) | Scaffold / CI stub |
| 2 | E02 Users | [specify](/05-specs/02-users/02-specify/) + contracts | Mock IdP until Okta tenant |
| 3 | E03 Configuration | [specify](/05-specs/03-configuration/02-specify/) + contracts | Flag fixtures OK |
| 4 | One domain | Prefer [E07](/05-specs/07-portfolio/02-specify/) or [E05](/05-specs/05-my-team/02-specify/) | Fixtures / empty / `unavailable` OK |
| later | E04 Home | [overview](/05-specs/04-home/01-overview/) | Wire as domains land |
| later | E06 · E08 · E09 · E10 | Pack specify + contracts | Fixture as needed |
| parallel | CFG-02 preview web | [E03](/05-specs/03-configuration/01-overview/) · [ADR-047](/01-constitution/constitution/#adr-047--advisor-preview-requires-web-client-surface) | Track in [status.md](/04-integrations/status/) |
| gate | E11 Release | [overview](/05-specs/11-release/01-overview/) | Pilot / store gate |

Pack index: [05-specs/README.md](/05-specs/readme/#pack--adr--contracts).

---

## 4. Parallel client track

Chase credentials and field maps beside engineering. Living list: [status.md](/04-integrations/status/). Until green, eng uses fixtures / `unavailable` / mock IdP per that tracker.

Live vs fixture for fly-in vs pilot: [prd §5.2](/product/prd/#52-live-vs-fixture-bar-pilot-discipline).

---

## 5. Delivery ops (PM-led)

### Roles

| Role | Owns |
|---|---|
| Developers | Build from specify, contracts, and approved Figma; fixtures when blocked |
| Project manager | Sequencing, demos, client chase, change control, weekly burn-down |
| Discovery consult | ADR / scope / field-map deadlocks, pilot readiness, “does this violate an ADR?” |
| OnePoint / Callaway | Data quality, Okta / Azure / vault / feed, SF field maps ([status](/04-integrations/status/)) |

### Consult SLA

Decide without consult: sprint order within locked Must stories; labeled fixtures; implementation choices that do not change behaviour or contracts; empty / `unavailable` when SF data is missing; scheduling chase from the status burn-down.

Escalate to discovery consult before coding:

| Trigger | Why |
|---|---|
| New user-visible behaviour or new Must / Should story | Specify must change first |
| Expanding or softening a Won't / ADR | Constitution first |
| Inventing or guessing an SF API name | Field gap — Callaway / OnePoint |
| Material Figma / UX change | Design change control + client re-approval |
| Waiving a [Pilot DoD](/product/prd/#51-pilot-definition-of-done) criterion | Product call with OnePoint |
| Overview / architecture / specify conflict | Specify wins — if still ambiguous, consult |
| “Just this once” Orion Connect, Tier B, or fabricated balances | Hard constraint ([AGENTS](/agents/)) |

If consult is unavailable: stub, fixture, or `unavailable`. Park the product question and continue other Must work.

### Change control

| Change type | Update first | Then |
|---|---|---|
| Behaviour / acceptance | `02-specify.md` (+ ADR / PRD if needed) | Code |
| Integration contract | [04-integrations/](/04-integrations/readme/) and/or pack `05-contracts/` | Code |
| SF field map | Pack `salesforce.md` + [data-model](/03-data/data-model/) | Sync / UI |
| Material UX | Neopix design change control → OnePoint re-approval | Implement against new Figma |
| Credential / environment | [status.md](/04-integrations/status/) only | Wire live path; keep fixture fallback until verified |

### Fixture policy

| Rule | Detail |
|---|---|
| Allowed | Deterministic mocks when Okta, Salesforce, vault, or feed are not ready |
| Labeled | Demo copy must not imply live Orion / eMoney accuracy when data is fixture |
| Never | Fabricate holdings, performance, allocation, or net worth that look like a real household |
| Missing live data | Empty list or `unavailable` |
| API names | Omit `(TBD)` fields; do not invent Salesforce API names |
| Toggle | Prefer explicit fixture / mock mode so going live is a switch |

### Weekly demo (PM-run)

Run on device or simulator. Prefer live sandbox when ready; otherwise fixtures — say which out loud.

| Step | Path | Pass if |
|:---:|---|---|
| 1 | Cold start → login | Session reaches Home |
| 2 | Home shell | Matches Figma; disabled domains hidden, not empty shells |
| 3 | Flags | Flip or fixture a domain flag — UI gates correctly |
| 4 | One Must domain | Happy path from specify |
| 5 | Honesty | At least one missing-data path shows empty / `unavailable` |
| 6 | Action Required | One concrete alert + deep link when ready; else N/A |
| 7 | Known limits | Fixture vs live + open status blockers in ~1 minute |

### Weekly burn-down

Living list: [status.md](/04-integrations/status/).

1. Walk Next actions — confirm owner and next date.  
2. Chase any `(TBD)` field that blocks the current Must demo.  
3. Record fixtures vs live.  
4. Escalate only on the triggers above.

---

## 6. Steer toward pilot

1. Ship the [first slice](#3-first-slice); run the [weekly demo](#weekly-demo-pm-run).  
2. Scope change → [change control](#change-control) before code.  
3. Use the [engineering proposal](/06-engineering/tech-spec-proposal/) as a guideline; Phase B `tech-spec.md` after stack lock.  
4. Hold [Pilot DoD §5.1](/product/prd/#51-pilot-definition-of-done) and [live vs fixture §5.2](/product/prd/#52-live-vs-fixture-bar-pilot-discipline).  
5. Before real client data or store submission: [architecture §9.9](/02-architecture/architecture/#99-before-real-client-data--store).
