---
title: "OnePoint Client Portal — Product Brief (PRD)"
---

> Purpose: Signed product narrative — what we are building, for whom, and what Phase 1 success looks like.  
> Not this doc: ADRs ([constitution](/01-constitution/constitution/)), systems detail ([architecture](/02-architecture/architecture/)), or story-level acceptance ([05-specs](/05-specs/readme/)).  
> Bundle: [README.md](/readme/) · [READY.md](/ready/) · [AGENTS.md](/agents/) · [glossary.md](/product/glossary/)

Status: Discovery lock 2026-07-17 · Bundle version: [VERSION](/VERSION) · Audience: Client stakeholders and delivery leadership

---



## 1. One-liner

A mobile client portal for OnePoint households to see managed portfolio, planning (when enrolled), documents, insights, and their advisory team — with advisors configuring the experience in Salesforce, not a separate admin app.

---



## 2. Problem & opportunity

OnePoint’s brand promise is to be *the first call when life gets complex* — planning-first wealth management for affluent households. Clients today experience that relationship through advisors and a scatter of web tools (Orion, eMoney, vault, firm content), not a single modern mobile surface.

Client pain. Portfolio, plan, and documents live in different places. It is hard to know what needs attention — signatures, broken links, concrete next steps. “Data as of” and the boundary between Orion-managed money and planning are easy to confuse.

Advisor / firm pain. There is no consistent way to invite clients and control what each household sees. Configuration must stay in Salesforce, where advisors already work. Pilot and advisor fly-in need a credible, scoped product — not a full wealth operating system.

Opportunity (Phase 1). Ship a focused React Native portal that makes OnePoint feel present between meetings: clear money, clear plan signals, clear actions — without boiling the ocean of Orion portal parity, chat, or digital intake.

---



## 3. Who it is for



### 3.1 Personas & surfaces


| Role          | Primary job                                                         | Surface                              |
| ------------- | ------------------------------------------------------------------- | ------------------------------------ |
| Client        | See money, plan status, docs, and team; act on concrete tasks       | React Native app (Okta)              |
| Advisor       | Invite clients; set household options; preview what the client sees | Salesforce LWC                       |
| Administrator | Firm and book defaults; optional login-as-client                    | Salesforce (+ audited impersonation) |


Detail: [ADR-013](/01-constitution/constitution/#adr-013--roles-and-surfaces). Advisor preview is a web view inside Salesforce, not the native app itself — see [glossary](/product/glossary/) and [ADR-047](/01-constitution/constitution/#adr-047--advisor-preview-requires-web-client-surface).

### 3.2 Who the clients are

OnePoint’s clients are affluent households — from mass-affluent to high-net-worth. The firm has research on typical segments (business owners at a liquidity event, executives with concentrated equity, pre-retirees, multigenerational families, and so on). That research is an external document used for marketing and UX tone.

For this portal, V1 is one app for every invited household. We do not build separate product variants or navigation per client segment.

---



## 4. Product principles

1. One relationship, one mobile door — client-facing copy prefers “money / plan” over vendor branding noise.
2. Honest data — daily cadence; always show data as of; never invent holdings or performance; missing data is empty or `unavailable`.
3. Portfolio ≠ Planning — Orion-managed AUM and eMoney planning stay separate, including allocation taxonomies.
4. Advisors configure in Salesforce — no standalone admin SPA.
5. Concrete actions only (V1) — Action Required is specific tasks, not a generic inbox.
6. Middleware is the only mobile data plane — security and release isolation.

---



## 5. Phase 1 outcomes & success


| Outcome                        | Signal                                                                       |
| ------------------------------ | ---------------------------------------------------------------------------- |
| Advisor fly-in (late Sep 2026) | Working demo on device or simulator for Must domains                         |
| Pilot (Oct 2026)               | Invited cohort can log in (Okta), see gated domains, act on V1 alerts        |
| Trust                          | Advisors can invite, set flags, and preview client view from Salesforce      |
| Clarity                        | Clients understand managed portfolio vs plan / net worth when planning is on |


Milestones: [ADR-021](/01-constitution/constitution/#adr-021--phase-1-target-and-milestones).

Fly-in is a demo milestone. Pilot success is defined by the Definition of Done below — not by “screens look good in a meeting.”

### 5.1 Pilot Definition of Done

Pilot is done when all of the following are true for the agreed pilot cohort (target: October 2026). Fly-in may use fixtures; pilot requires the live paths in §5.2 unless OnePoint waives an item.


| #   | Criterion                     | Evidence                                                                                                                                                                          |
| --- | ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Invite → login                | Advisor invites from Salesforce; client completes Okta login and reaches Home                                                                                                     |
| 2   | Cohort size                   | At least 5 invited households (or the number OnePoint names before pilot week)                                                                                                    |
| 3   | Gated domains                 | Effective flags hide disabled domains; Planning tab absent when not enrolled                                                                                                      |
| 4   | Real money path               | At least one household shows Portfolio with SF-sourced balances and data as of (empty holdings or `unavailable` OK if SF has no rows — never fabricated)                          |
| 5   | Planning path (when enrolled) | At least one enrolled household shows NW / planning teasers; non-enrolled households do not                                                                                       |
| 6   | Advisor control               | Advisor can set household flags and open client-view preview from Salesforce ([ADR-047](/01-constitution/constitution/#adr-047--advisor-preview-requires-web-client-surface)) |
| 7   | Action Required               | At least one concrete alert type demonstrated (signature-pending, broken link, or profile decision) with a deep link into the owning domain                                       |
| 8   | Honest failure                | Missing SF / vault / feed data surfaces empty or `unavailable` — no invented figures                                                                                              |
| 9   | Pilot ops                     | TestFlight / Play internal (or agreed distribution) plus a known-limitations list for the cohort                                                                                  |


Not required for Pilot DoD: MFA, OS push, in-app DocuSign, chat, Orion portal extras, full field-map perfection on every `(TBD)`, or a Phase B tech-spec.

### 5.2 Live vs fixture bar (pilot discipline)

This table is the honesty contract between fly-in and pilot. Fixtures keep delivery moving; they do not redefine “done” for October.


| Path                            | Fly-in (late Sep)                        | Pilot (Oct)                                         |
| ------------------------------- | ---------------------------------------- | --------------------------------------------------- |
| Invite → Okta login → Home      | Mock IdP OK if Okta not ready            | Live Okta + SF invite                               |
| Effective flags / preview       | Flag fixtures OK; preview may be stubbed | Live SF preference objects and LWC → web preview    |
| Portfolio balances + data as of | Fixtures OK                              | Live SF for ≥1 household (empty holdings OK)        |
| Planning (enrolled)             | Fixtures OK                              | Live eMoney→SF for ≥1 enrolled household            |
| Documents                       | Fixture vault OK                         | Live vault or OnePoint written waiver               |
| Insights feed                   | Fixture feed OK                          | Fixture OK if URL pending (call out in limitations) |
| Calendly                        | Static URL map OK                        | Static or live advisor URLs                         |
| Action Required                 | Computed from fixtures OK                | ≥1 concrete type on live or agreed demo data        |


Field API names still marked `(TBD)`: omit or fixture — do not invent. Security gates before production client data: [architecture §9.9](/02-architecture/architecture/#99-before-real-client-data--store).

Operational blockers that threaten this bar live in [status.md](/04-integrations/status/). Build posture: [READY.md](/ready/).

---



## 6. Product map (client app)

The shell follows the Figma freeze ([ADR-045](/01-constitution/constitution/#adr-045--nav-shell-v1-vs-v2)). When Planning is off, prefer a three-tab shell (no Planning tab). More holds Insights, Your Team, and Profile.


| Domain          | Client sees                                                                                      | Phase 1 intent                                         |
| --------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------ |
| Home            | Warm summary hub — teasers, shortcuts, Action Required                                           | Neutral, not investments-first                         |
| Portfolio       | Orion-managed AUM, allocation, accounts, holdings, performance                                   | Prototype-scope parity — not the full Orion portal     |
| Planning        | Net worth, combined allocation, goals, expenses (read-only), linked accounts, Monte Carlo fields | Hidden if not enrolled; institution-first link/relink  |
| Docs            | List / download / upload via eMoney Vault                                                        | Signature list + external sign URL; no in-app DocuSign |
| Insights        | Firm commentary from website / RSS                                                               | Same catalog for all clients                           |
| Your Team       | Advisory team + schedule deep-link (Calendly)                                                    | No chat                                                |
| Action Required | Concrete open tasks + in-app bell                                                                | No OS push                                             |
| Profile         | View + propose changes for review                                                                | Reachable when enabled                                 |


Feature packs: [05-specs/](/05-specs/readme/).

---



## 7. In scope vs out of scope (story level)



### In scope (Phase 1)

Phase 1 includes invite-only client identity (Okta via middleware), effective feature flags from the Salesforce hierarchy, and the client domains above — Portfolio (managed), Planning when enrolled, Docs, Insights, Team, Home composite, and V1 alerts. Advisors configure households and open client-view preview from Salesforce; Neopix delivers the preview as a web surface alongside the mobile app. Financial figures come from daily Salesforce sync and always carry data as of.

### Out of scope (Phase 1) — highlights

Pointed decisions live in [ADR-022](/01-constitution/constitution/#adr-022--phase-1-explicit-exclusions) and related ADRs. The short list for leadership:


| Not in V1                                                     | Direction                                     |
| ------------------------------------------------------------- | --------------------------------------------- |
| Live Orion Connect from Neopix                                | Client owns Orion→SF; holdings via Salesforce |
| Direct eMoney Tier B API (Neopix SOW)                         | eMoney→SF + WebView link only                 |
| Separate admin web app                                        | Salesforce LWC only                           |
| In-app DocuSign signing                                       | List + alert; sign externally                 |
| Chat / messaging / OS push                                    | Phase 2                                       |
| Client / product analytics (SDKs, funnels, behavioural)       | Phase 2 — [ADR-022](/01-constitution/constitution/#adr-022--phase-1-explicit-exclusions); Cost [P2-06](/05-specs/readme/#phase-2-post-v1); not ops signals ([architecture §10.10](/02-architecture/architecture/#1010-product--user-analytics-wont)) |
| Advisor mobile app                                            | Salesforce only                               |
| Full Orion portal extras (transactions, benchmarks, tax lots) | Portfolio Won't                               |
| Manual held-away entry, nickname write-back, expense edit     | Won't this delivery                           |
| MFA / biometrics (this delivery)                              | Password / session only                       |
| Jiffy / digital intake                                        | Separate multi-month track                    |


---



## 8. Delivery boundary


| Party    | Owns                                                                                                                                                |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Neopix   | Middleware, mobile app, advisor preview web surface, UI/UX (Figma), Salesforce→middleware sync, Okta wiring, and adapters (vault, feed, scheduling) |
| Callaway | Salesforce field map, LWC (including preview iframe), preference objects, invite actions                                                            |
| OnePoint | Data accuracy in Salesforce (Orion / eMoney), vault and feed sources, Azure / Okta / store accounts                                                 |


[ADR-023](/01-constitution/constitution/#adr-023--neopix-sow-vs-client-integration-boundary) · readiness tracker: [status.md](/04-integrations/status/).

---



## 9. How to read the rest of the bundle


| Next                                                  | When                                                   |
| ----------------------------------------------------- | ------------------------------------------------------ |
| [glossary.md](/product/glossary/)                            | Shared terms (middleware, tiers, fixtures, preview, …) |
| [READY.md](/ready/)                               | How to start building and how PM runs delivery         |
| [01-constitution](/01-constitution/constitution/) | Decision log (ADRs)                                    |
| [02-architecture](/02-architecture/architecture/) | Systems and data plane · §9 security                   |
| [04-integrations](/04-integrations/readme/)                | How systems connect                                    |
| [05-specs](/05-specs/readme/)                              | Feature overviews → specify → contracts                |


This brief narrates the product. Specify wins on behaviour. Constitution wins on decisions. Living credential and field blockers live in [status.md](/04-integrations/status/) — they do not reopen Accepted ADRs.

---



## 10. Survey context (source trail)

Workshop 3 client ranking informed V1 priorities: plans and reports → Planning + Documents; statement download → Documents; sign documents → V1 list + alert (in-app DocuSign later); message team → Phase 2 chat. Raw workshop notes remain external resources.