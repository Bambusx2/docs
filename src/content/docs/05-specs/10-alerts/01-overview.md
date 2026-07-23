---
title: "E10 Action Required — Client Overview"
---

> Discovery package entry for E10. In-app bell badge and Home Action Required list for concrete client tasks — signatures, broken links, profile proposal outcomes — with deep links into domain packs.  
> Behaviour SoT: [02-specify.md](/05-specs/10-alerts/02-specify/) — specify wins if this overview and specify disagree.  
> Not included: Sprint plans, task lists, GWT suites, separate UAT files, runbooks (delivery / QA own those after handoff).  
> Shared conventions: [specs README](/05-specs/readme/) (MoSCoW, package shape, Discovery DoD, dependency graph).

| Field | Value |
|-------|-------|
| Status | Discovery locked |
| Package version | 1.0.0 |
| Date | 2026-07-17 |
| Specify | [02-specify.md](/05-specs/10-alerts/02-specify/) (stories + NFRs) |
| API contract | [05-contracts/openapi.yaml](/05-specs/10-alerts/05-contracts/openapi/) |
| Computation contract | [05-contracts/computation.md](/05-specs/10-alerts/05-contracts/computation/) |
| Depends on | [E04 Home](/05-specs/04-home/01-overview/), [E02 Users](/05-specs/02-users/01-overview/), [E08 Planning](/05-specs/08-planning/01-overview/), [E09 Documents](/05-specs/09-documents/01-overview/) |
| Unlocks | Soft — Release gate ([E11](/05-specs/11-release/01-overview/)); E2E Action Required demos |
| Changelog | [CHANGELOG.md](/05-specs/10-alerts/changelog/) |

Global context: [prd.md](/product/prd/) · [architecture.md](/02-architecture/architecture/) · [constitution.md](/01-constitution/constitution/) · [data-model.md](/03-data/data-model/) §8

Handoff: Build from [02-specify.md](/05-specs/10-alerts/02-specify/) + OpenAPI + [computation.md](/05-specs/10-alerts/05-contracts/computation/). Alerts are **middleware-computed** from synced SF / vault / linked-account data at read time — never invented on device. Domain packs own the landing screens; this pack owns emission, badge parity, deep-link routing, and resolve/refresh. Stub alert types with fixtures until upstream packs demo. Raise product gaps as ADRs.

---

## 1. Problem

Clients need a single place to see **concrete tasks that need their attention** — a form to sign, a broken institution link, a profile proposal decision — without hunting through Docs, Planning, and Profile.

Without this pack:

- Home has no trustworthy **Action Required** surface  
- Bell badge drifts from the list clients actually see  
- Deep links land on the wrong screen or invent tasks  

E10 establishes the attention surface: **middleware computes open alerts from upstream facts; badge count equals the Home list; each type deep-links into the owning pack; OS push and advisor-authored custom tasks are out of scope** ([ADR-016](/01-constitution/constitution/#adr-016--v1-action-required--concrete-items-only), [ADR-032](/01-constitution/constitution/#adr-032--push-notifications-scope), [ADR-036](/01-constitution/constitution/#adr-036--alert-persistence-model)).

---

## 2. Outcomes

| Measure | Target | Evidence |
|---|---|---|
| Badge | Matches open alert count (`status = open`) | §8 Path 1 · **AR-01** · **NFR-02** |
| Home list | Same open items as badge; title **Action Required** | §8 Path 1 · **AR-02** |
| Deep links | Correct domain screen per `alertType` | §8 Path 2 · **AR-03**–**AR-05**, **AR-07** |
| Resolve | Clears when underlying issue fixed; badge decrements | §8 Path 3 · **AR-08** |
| Refresh | New alerts after sync / pull-to-refresh | §8 Path 3 · **AR-09** |
| Concrete only | No marketing placeholders or advisor-authored custom tasks | **NFR-05** · [ADR-016](/01-constitution/constitution/#adr-016--v1-action-required--concrete-items-only) |

---

## 3. Scope summary

Story MoSCoW tags use definitions in [specs README](/05-specs/readme/#moscow). Full acceptance criteria: [02-specify.md](/05-specs/10-alerts/02-specify/).

### In scope (Must)

- Notification bell with badge count (**AR-01**)  
- Home **Action Required** section (**AR-02**)  
- Deep-link routing by type (**AR-03**)  
- Alert types: `document_signature_pending`, `linked_account_broken`, `profile_proposal_decided` (**AR-04**, **AR-05**, **AR-07**)  
- Recompute and resolve on upstream change (**AR-08**, **AR-09**)  
- Empty state when nothing pending  

### Should

| Item | Story |
|---|---|
| Missing required profile fields (with Users C-08) | AR-06 |
| Planning data updated notice (`planning_update`) | AR-10 |

### Out of scope (Won't)

| Item | Story / note |
|---|---|
| Goal-based to-do lists | AR-11 |
| Advisor activity feed | AR-12 |
| Money-movement alerts (ACAT, wire) | AR-13 |
| OS push notifications (APNs/FCM) | **AR-14** · [ADR-032](/01-constitution/constitution/#adr-032--push-notifications-scope) |
| Advisor-authored custom Action Required items | [ADR-016](/01-constitution/constitution/#adr-016--v1-action-required--concrete-items-only) / [ADR-036](/01-constitution/constitution/#adr-036--alert-persistence-model) |
| Domain sign / relink / profile UX | Owned by [E09](/05-specs/09-documents/02-specify/), [E08](/05-specs/08-planning/02-specify/), [E02](/05-specs/02-users/02-specify/) |

### Product constraints

| Constraint | Detail |
|---|---|
| Client label | **Action Required** (Home section); backend entity `Alert` |
| Alert set | Concrete tasks only per [ADR-016](/01-constitution/constitution/#adr-016--v1-action-required--concrete-items-only) — no advisor-authored custom tasks until follow-up ADR |
| Notification surface | In-app bell badge only this delivery ([ADR-032](/01-constitution/constitution/#adr-032--push-notifications-scope)) |
| Bell tap | Navigates to Home scrolled to **Action Required** (same open set as **AR-02**) |
| Empty state | Badge hidden; Home section shows **You're all caught up** |
| Computation | Middleware-computed from synced SF, vault, eMoney data ([computation.md](/05-specs/10-alerts/05-contracts/computation/)) |
| Persistence | Virtual compute at read time ([ADR-036](/01-constitution/constitution/#adr-036--alert-persistence-model) Accepted); dismiss state for informational alerts may be stored in middleware |
| Document signatures | Hidden when `documents_enabled` false; sign UX owned by [E09](/05-specs/09-documents/02-specify/) |
| Broken links | Hidden when planning/linked-account flags false; relink UX owned by [E08](/05-specs/08-planning/02-specify/) |
| UI | Figma is layout authority; specify defines data and business rules only |
| Copy | Client-safe strings only (no Salesforce API names in messages) |

---

## 4. What the client must provide

| Item | Owner | Needed before |
|---|---|---|
| Downstream domain packages demoable (Docs, Planning, Profile) | Delivery | §8 E2E paths |
| Missing-field list confirmation | Client / SF | **AR-06** / **C-08** (Should — not Must baseline) |
| Client-safe alert copy (UX strings) | Neopix design | Live demo |
| Alert copy acceptance | OnePoint experience / compliance | Live demo |
| Pack overview available for client reference | Neopix | As needed |

Operational blockers: [status.md](/04-integrations/status/). Upstream pack slip → stub alert types with fixtures; do not invent non-concrete tasks.

---

## 5. Assumptions

1. Bell badge is sufficient this delivery; OS push is Won't (**AR-14**, [ADR-032](/01-constitution/constitution/#adr-032--push-notifications-scope)).  
2. Profile missing-field flow uses propose → staff review ([C-08](/05-specs/02-users/02-specify/)); **AR-06** aligns as Should.  
3. Money-movement and journey-timeline alerts are Won't / post-delivery ([P2-04](/05-specs/readme/#phase-2-post-v1)).  
4. Home shell and Action Required placement come from [E04](/05-specs/04-home/01-overview/).  
5. Effective domain flags come from [E03](/05-specs/03-configuration/02-specify/) **CFG-04** / `/me`.

---

## 6. Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Upstream pack slip | Incomplete E2E deep links | Stub alert types with fixtures; deep-link destinations still owned by domain packs |
| Badge ≠ list drift | Client distrust | **NFR-02** — same open set for badge and Home |
| Pressure for advisor-authored AR | Persistence redesign | Virtual compute locked ([ADR-036](/01-constitution/constitution/#adr-036--alert-persistence-model)); custom items Won't |
| Unsafe / CRM-jargon copy | Confusion / compliance | Neopix strings + client acceptance; no SF API names in messages |
| Stale alerts after fix | Nudging completed work | Recompute on sync / login / pull-to-refresh (**AR-08**, **AR-09**) |

---

## 7. Cross-pack hooks

| Hook | Relationship | Doc |
|---|---|---|
| Home | Bell + Action Required section wiring | [04-home/01-overview.md](/05-specs/04-home/01-overview/) |
| Documents | `document_signature_pending` → needs-signature | [09-documents DOC-03 / DOC-07](/05-specs/09-documents/02-specify/) |
| Planning | `linked_account_broken` → relink | [08-planning PL-09](/05-specs/08-planning/02-specify/#pl-09--relink-broken-account) |
| Users / Profile | `missing_required_field`, `profile_proposal_decided` | [02-users C-08, C-25, A-09](/05-specs/02-users/02-specify/) |
| Configuration | Domain flags gate emission | [03-configuration CFG-04](/05-specs/03-configuration/02-specify/#cfg-04--publish-the-domain-option-catalog) |
| Entities | `Alert`, `NotificationSummary` | [data-model.md §8](/03-data/data-model/) |
| Computation | Emission / resolve rules | [computation.md](/05-specs/10-alerts/05-contracts/computation/) |
| Release | Soft gate before E11 | [11-release](/05-specs/11-release/01-overview/) · [specs README](/05-specs/readme/) |

---

## 8. Acceptance demo

These three paths are the **client acceptance bar** for E10. Field lists and emission rules live in [02-specify.md](/05-specs/10-alerts/02-specify/).

### Path 1 — Badge and list

1. Seed open alerts → bell badge count matches Home **Action Required** rows (**AR-01**, **AR-02**).  
2. No open alerts → badge hidden; Home shows **You're all caught up**.

### Path 2 — Deep links

1. Tap `document_signature_pending` → Docs needs-signature context (**AR-03**, **AR-04**).  
2. Tap `linked_account_broken` → Planning relink flow (**AR-05**).  
3. Tap `profile_proposal_decided` → Profile decision (**AR-07**).  
4. *(Should)* When **C-08** / **AR-06** ship: tap `missing_required_field` → Profile missing-field form.

### Path 3 — Resolve and refresh

1. Fix underlying issue → alert clears; badge decrements (**AR-08**).  
2. After sync batch → new alert appears (**AR-09**).

---

## 9. Discovery Definition of Done

Complete shared DoD in [specs README](/05-specs/readme/#discovery-definition-of-done), plus:

- [ ] [02-specify.md](/05-specs/10-alerts/02-specify/) **AR-01**–**AR-05**, **AR-07**–**AR-09** accepted; Should **AR-06** and **AR-10** acknowledged; Won't **AR-11**–**AR-14** acknowledged
- [ ] NFRs accepted (latency, badge parity, middleware compute, refresh)  
- [ ] Contracts reviewed — [OpenAPI](/05-specs/10-alerts/05-contracts/openapi/), [computation.md](/05-specs/10-alerts/05-contracts/computation/)  
- [x] Neopix Action Required / bell Figma reviewed  + alert copy  
- [ ] §8 Paths 1–3 agreed as client demo bar  
- [ ] Open items have owners and blocks-build Y/N  

### Open items

| Item | Owner | Blocks build? |
|---|---|---|
| Alert copy freeze + client acceptance | Neopix design · Client | N for build; Y for live demo polish |
| Missing-field list confirmation (AR-06 Should) | Client / SF | N — Should, not Must baseline |
| Action Required / bell Figma | Neopix | Done |
| Advisor-authored Action Required items | Product | N — Won't until ADR |
| OS push | — | N — **AR-14** Won't · [ADR-032](/01-constitution/constitution/#adr-032--push-notifications-scope) |

---

## 10. Build baseline

This pack is part of the locked discovery baseline for build. Domain behaviour is governed by linked specifies where present — those specifies win. Figma is layout authority for build ([AGENTS.md](/agents/)). Behaviour changes update specify (and ADR/PRD if needed) before code.


---

Related: [Specify](/05-specs/10-alerts/02-specify/) · [OpenAPI](/05-specs/10-alerts/05-contracts/openapi/) · [Computation](/05-specs/10-alerts/05-contracts/computation/) · [specs README](/05-specs/readme/) · [CHANGELOG](/05-specs/10-alerts/changelog/)
