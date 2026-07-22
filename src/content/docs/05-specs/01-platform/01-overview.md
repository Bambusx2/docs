---
title: "E01 Platform & Discovery — Client Overview"
---

> Discovery package entry for E01. Foundation gate for Phase 1 — establishes the decision baseline, design freeze, and engineering scaffold that later packs build on.  
> Specify: None (overview-only). Domain behaviour lives in E02–E10.  
> Not included: Sprint plans, task lists, GWT suites, UAT scripts, runbooks. Runtime pins wait for stack lock; use [engineering proposal](/06-engineering/tech-spec-proposal/) as guideline.
> Shared conventions: [specs README](/05-specs/readme/) (MoSCoW, package shape, Discovery DoD, dependency graph).

| Field | Value |
|-------|-------|
| Status | Discovery locked |
| Package version | 1.0.0 |
| Date | 2026-07-17 |
| Specify | — (cross-cutting foundation; no user stories) |
| Depends on | — |
| Unlocks | E02 Users & Identity (and all subsequent packs) |

Global context: [prd.md](/product/prd/) · [architecture.md](/02-architecture/architecture/) · [constitution.md](/01-constitution/constitution/) · [data-model.md](/03-data/data-model/) · [04-integrations/](/04-integrations/readme/)

Handoff: Complete the §8 acceptance demo before treating E02 product stories as unblocked. Do not invent domain scope, Salesforce field names, or integration credentials in this pack.

---

## 1. Problem

Phase 1 delivery cannot start feature work on a moving foundation. Workshops produced decisions and system boundaries; Phase 1 Figma is complete. Engineering still needs:

1. A **locked decision baseline** (Accepted ADRs) so later packs do not reopen Tier A/B/C, SOW, or Won'ts mid-build.  
2. An **approved visual and navigation shell** so domain screens inherit layout from Figma rather than inventing chrome.  
3. A **runnable technical scaffold** — middleware on OnePoint Azure, React Native iOS/Android, mock `/api/v1`, CI, and shared UI states — so E02+ can stub first and integrate second without rebuilding the platform each sprint.

Without this gate, invite flows, portfolio reads, and advisor config land on unstable contracts, incomplete OpenAPI drafts, and unreviewed design — creating rework and scope drift before the late-September advisor fly-in.

---

## 2. Outcomes

| Measure | Target | Evidence |
|---|---|---|
| Decision lock | Workshops Jun 23 – Jul 14 promoted into Accepted ADRs | [constitution.md](/01-constitution/constitution/) ADR-001…047 (019 superseded); discovery lock 2026-07-17; ADR-047 accepted 2026-07-19 |
| Design freeze | Phase 1 shell / nav / core screens complete in Figma | Figma OnePoint App UI; [ADR-045](/01-constitution/constitution/#adr-045--nav-shell-v1-vs-v2) |
| Systems picture | Context, data plane, and ownership understood by client + eng | [architecture.md](/02-architecture/architecture/) |
| Entity baseline | Middleware entities and known SF mappings documented (TBDs flagged) | [data-model.md](/03-data/data-model/) |
| App launch | RN app starts on simulator or device to a placeholder Home | Demo path 1 |
| Mock identity | Fixture `GET /api/v1/me` returns a deterministic client user | Demo path 2 |
| CI | Lint, unit/smoke tests, and build green on `main` | Demo path 3 |
| Contract draft | OpenAPI draft or architecture API map exists; pack fragments become normative under E02+; root compose is Phase B | [specs README](/05-specs/readme/#pack--adr--contracts); [architecture §7](/02-architecture/architecture/#7-api-map) |

---

## 3. Scope summary

### In scope (Must)

Discovery & decisions
- Capture and accept product/technical ADRs from workshops into the constitution (including SOW boundary, Tier A default, Tier B/C Won't, vault path, nav shell).  
- Align the Discovery Spec Bundle cover, build-start readiness, and agent rules so client and delivery share one reading order ([README.md](/readme/), [READY.md](/ready/), [AGENTS.md](/agents/)).

Design
- Phase 1 Figma design system and screen mocks are layout authority for scaffold and domain packs ([AGENTS.md](/agents/)).
- Freeze navigation shell rules (including Planning-hidden → prefer 3-tab) per [ADR-045](/01-constitution/constitution/#adr-045--nav-shell-v1-vs-v2) and [ADR-029](/01-constitution/constitution/#adr-029--home-without-emoney).

Engineering scaffold
- Middleware service skeleton hosted on OnePoint Azure `dev` ([ADR-008](/01-constitution/constitution/#adr-008--middleware-on-onepoint-azure)).  
- React Native application skeleton targeting **iOS and Android**.  
- Fixture mode (`MOCK_DATA=true` or equivalent) serving deterministic `/api/v1` responses for `/me` and placeholder Home.  
- Scaffold for Salesforce → middleware sync job (no production sync required for E01 demo).  
- Shared API client generated or typed from the OpenAPI draft.  
- Shared mobile presentation states: loading, empty, retryable error.  
- Continuous integration on `main`: lint, test, and build for middleware and mobile.

Documentation baselines
- Architecture systems picture and data-plane narrative.  
- Data-model entity hierarchy with known Salesforce API names; unknown names remain `(TBD)` and are tracked — never invented ([AGENTS.md](/agents/)).  
- Draft OpenAPI surface; per-pack contracts under E02+ supersede drafts for those domains.

### Out of scope (Won't)

| Item | Owner pack / note |
|---|---|
| Client invite, login, profile, Okta production wiring | [E02 Users](/05-specs/02-users/01-overview/) |
| Feature-flag catalog and advisor LWC behaviour | [E03 Configuration](/05-specs/03-configuration/01-overview/) |
| Domain screens (Home content, Team, Insights, Portfolio, Planning, Docs, Alerts) | E04–E10 |
| Live Salesforce sandbox sync with real household data | Blocked by [status.md](/04-integrations/status/); stub until ready |
| Production Okta tenant, App Store / Play submission, security sign-off | [E11 Release](/05-specs/11-release/01-overview/) |
| Stack versions, Azure SKUs, CI/CD depth, cost model | [06-engineering/](/06-engineering/readme/) Phase B |
| Client / product analytics (SDKs, funnels) | Won't — [ADR-022](/01-constitution/constitution/#adr-022--phase-1-explicit-exclusions); Cost 10 on [P2-06](/05-specs/readme/#phase-2-post-v1); [architecture §10.10](/02-architecture/architecture/#1010-product--user-analytics-wont) |

### Product constraints

| Constraint | Detail |
|---|---|
| Role of this pack | Foundation gate only — no domain user stories and no substitute for pack specifies |
| Decision authority | Accepted ADRs in [constitution.md](/01-constitution/constitution/) bind all later packs; workshops are source trail only |
| UI authority | Figma is layout authority for layout and chrome; this pack does not redefine visual design in prose ([AGENTS.md](/agents/)) |
| Data plane | Mobile talks to middleware only ([ADR-001](/01-constitution/constitution/#adr-001--middleware-as-the-only-mobile-data-plane)); fixtures until integrations are ready |
| Honesty of data | Even in mocks, do not invent financial figures that imply live Orion/eMoney accuracy — use clearly labeled fixtures |
| OpenAPI | E01 ships a draft; pack `05-contracts/openapi.yaml` fragments become normative per domain; root compose is Phase B |
| Naming | Prefer company names over individuals; client domains Home · Portfolio · Planning · Docs · More (Insights, Team, Profile) |
| Exit rule | E02 Must work does not start until §8 acceptance demo for E01 is met |

---

## 4. What the client must provide

| Item | Owner | Needed before |
|---|---|---|
| Stakeholder confirmation of Accepted ADRs / discovery lock | Client Product Owner (+ Callaway as required) | Treating E01 as complete |
| Phase 1 Figma (shell and screens) | Neopix design | Done — layout authority ([AGENTS.md](/agents/)) |
| Azure `dev` subscription access for middleware host | OnePoint IT | Middleware scaffold deploy |
| GitHub (or agreed) mobile/middleware repos | OnePoint | CI on `main` |
| Confirmation that fixtures are acceptable until SF/Okta/vault ready | Client PO + delivery | E01 demo and early E02 stubs |

Operational blockers beyond scaffold (sandbox holdings, Okta prod, vault credentials) remain in [status.md](/04-integrations/status/) and do **not** block E01 if fixtures are approved.

---

## 5. Assumptions

1. Middleware runs on **OnePoint Azure**; the client mobile app is **React Native** for iOS and Android ([ADR-008](/01-constitution/constitution/#adr-008--middleware-on-onepoint-azure), [architecture.md](/02-architecture/architecture/)).  
2. Fixture / mock data is an accepted delivery mode until [status.md](/04-integrations/status/) clears each integration.  
3. Callaway owns Salesforce metadata and LWC delivery; Neopix owns middleware and mobile ([ADR-023](/01-constitution/constitution/#adr-023--neopix-sow-vs-client-integration-boundary)).  
4. Design freeze means layout and navigation chrome; domain copy and field-level acceptance remain in later overviews and specifies.  
5. Phase B engineering tech-spec is intentionally deferred and is not required to exit E01.

---

## 6. Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Scope reopened after discovery lock | Rework across E02–E10 | Require new/superseding ADR before changing Accepted decisions; update specify/PRD as needed |
| Material Figma change after approval | UI thrash in every pack | Change control via **Neopix design** + client re-approval before build absorbs it |
| OpenAPI draft diverges from early pack contracts | Integration churn | Pack OpenAPI + specify win; update architecture API map afterward ([architecture.md §7](/02-architecture/architecture/#7-api-map)) |
| Azure / repo access delayed | Scaffold cannot demo | Track in status.md; use local fixtures for CI until `dev` deploy exists |
| Team treats E01 as “done product” | Missing domain bars before fly-in | E01 only unlocks E02; fly-in still requires Must packs per dependency graph |

---

## 7. Cross-pack hooks

| Hook | Relationship | Doc |
|---|---|---|
| Product brief | Vision and Phase 1 outcomes this scaffold serves | [prd.md](/product/prd/) |
| Constitution | Decision SoT established in E01 | [constitution.md](/01-constitution/constitution/) |
| Architecture / data / integrations | Systems baselines published for E02+ | [architecture](/02-architecture/architecture/) · [data-model](/03-data/data-model/) · [integrations](/04-integrations/readme/) |
| Users & Identity | First product pack unlocked by E01 exit | [02-users/01-overview.md](/05-specs/02-users/01-overview/) |
| Configuration | Consumes scaffold `/me` and later flag resolution | [03-configuration/01-overview.md](/05-specs/03-configuration/01-overview/) |
| Release | Production hardening and stores — not E01 | [11-release/01-overview.md](/05-specs/11-release/01-overview/) |
| Phase B | Stack-locked tech-spec after E01+ delivery starts | [06-engineering/](/06-engineering/readme/) |

---

## 8. Acceptance demo

The E01 bar is met when all paths below succeed on the agreed environment (local or Azure `dev`).

### Path 1 — Runnable client shell

1. Install or launch the React Native app on an iOS simulator **or** Android emulator/device.  
2. App reaches a **placeholder Home** (or equivalent shell) without crashing.  
3. Shared loading / empty / error components are present in the codebase and usable by later packs (spot-check one screen or storybook equivalent if available).

### Path 2 — Mock identity plane

1. With fixtures enabled, call `GET /api/v1/me` (or app cold start that triggers it).  
2. Response returns a deterministic fixture client (stable id, display name, household stub, effective-flag stub object).  
3. Response is clearly fixture-backed (header, flag, or documented mock mode) — not presented as live Salesforce data.

### Path 3 — Engineering readiness

1. CI pipeline on `main` shows green lint + test + build for middleware and mobile (or documented equivalent monorepo jobs).  
2. OpenAPI draft and/or architecture API map is checked into the repo and referenced from [specs README](/05-specs/readme/#pack--adr--contracts) ([architecture §7](/02-architecture/architecture/#7-api-map)). Root composed OpenAPI is Phase B — not an E01 exit criterion.
3. Data-model document exists with entity hierarchy; any unknown Salesforce API names are marked `(TBD)`.

### Path 4 — Discovery lock acknowledgment

1. Client Product Owner and discovery/delivery lead confirm discovery lock date **2026-07-17** and that constitution ADRs are the decision baseline.  
2. Design lead confirms Phase 1 Figma is complete — layout authority for build ([AGENTS.md](/agents/)).

---

## 9. Discovery Definition of Done

Complete shared DoD in [specs README](/05-specs/readme/#discovery-definition-of-done) **where applicable** (overview-only: no specify stories), plus:

- [ ] §3 in-scope scaffold and documentation baselines agreed  
- [ ] §3 out-of-scope and Product constraints acknowledged  
- [ ] §4 client prerequisites identified with owners  
- [ ] §8 acceptance demo paths 1–4 demonstrated or scheduled with date  
- [ ] Open items below have owners and “blocks E02? Y/N”  
- [ ] No domain behaviour accepted under E01 that belongs in E02–E10  

### Open items

| Item | Owner | Blocks E02? |
|---|---|---|
| Azure `dev` access confirmed for middleware deploy | OnePoint IT | N if local fixtures suffice for E02 stubs |
| Phase 1 Figma | Neopix | Done |
| OpenAPI draft path documented in repo README or specs pack index | Neopix eng | N if pack contracts land with E02 |

---

## 10. Build baseline

This pack is part of the locked discovery baseline for build. Domain behaviour is governed by linked specifies where present — those specifies win. Figma is layout authority for build ([AGENTS.md](/agents/)). Behaviour changes update specify (and ADR/PRD if needed) before code.

