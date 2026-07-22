---
title: "OnePoint — Glossary"
---

> Shared vocabulary for client stakeholders and engineers.  
> Bundle: [README.md](/readme/) · [prd.md](/product/prd/)

One-line definitions. Depth lives in the linked docs.

---

## Package & process

| Term | Meaning |
|---|---|
| Discovery Spec Bundle | This deliverable — PRD, ADRs, architecture, data, integrations, feature specs |
| Discovery lock | Date ADRs + product story froze for build (`2026-07-17`). Later clarifications bump [VERSION](/VERSION). Start build: [READY.md](/ready/) |
| Spec pack | One folder under `05-specs/NN-slug/` (e.g. Portfolio). Prefer “spec pack” over “epic” |
| Package ID (E0N) | Stable id `E01`…`E11` for cross-reference |
| Overview (`01-overview`) | Pack context and demo bar — not behaviour SoT |
| Specify (`02-specify`) | Behaviour source of truth (stories + NFRs). Specify wins on UI/acceptance conflicts |
| Contracts (`05-contracts/`) | OpenAPI / Salesforce / provider packs for a feature |
| Constitution / ADR | Architecture Decision Record — wins on decision conflicts |
| MoSCoW | Must / Should / Could / Won't priority tags on stories — [05-specs/README](/05-specs/readme/#moscow) |
| Cost | Relative delivery-cost score on story indexes — higher = more delivery investment to ship the story. Won't stories and Phase 2 capabilities include an indicative Cost when detail is thin. Not calendar duration. See [05-specs/README](/05-specs/readme/#cost) |
| SoT | Source of truth for a concern (e.g. specify = behaviour SoT) |
| Pilot Definition of Done | October pilot bar — [prd §5.1](/product/prd/#51-pilot-definition-of-done); live vs fixture [§5.2](/product/prd/#52-live-vs-fixture-bar-pilot-discipline) |
| Fly-in | Late September advisor demo — production-quality screens; fixtures OK where noted |
| Pilot | October invited cohort on live paths per Pilot DoD (unless waived in writing) |
| Phase B | After stack lock: pinned tech-spec, CI/CD, cost, composed OpenAPI |
| Stack lock | OnePoint confirms runtime versions / SKUs → promote engineering proposal to `tech-spec.md` |
| Engineering proposal | Proposed how to build — [tech-spec-proposal.md](/06-engineering/tech-spec-proposal/); not behaviour SoT |
| Fixture / stub | Deterministic mock data or adapter used until a live integration is ready ([READY](/ready/)) |
| `unavailable` | Honest empty/missing state for financial or provider data — never invent figures |
| Operational blocker | Credential / data readiness item in [status.md](/04-integrations/status/) — does not override ADRs |
| Won't this delivery | Explicitly out of Phase 1; usually backed by an ADR |
| Source trail | Workshop notes / research that informed a decision — not binding after lock |
| External resource | Material outside this package (workshops, ICP draft, SF exports). Cite by name; do not link with relative paths |

---

## Product & data

| Term | Meaning |
|---|---|
| Middleware | Neopix API + sync layer on OnePoint Azure — the only mobile data plane ([ADR-001](/01-constitution/constitution/#adr-001--middleware-as-the-only-mobile-data-plane)) |
| Tier A | Salesforce as default ingest for middleware |
| Tier B | Direct eMoney API — out of Neopix V1 SOW |
| Tier C | Orion holdings staging into Neopix — out of Neopix V1 SOW; holdings via SF Tier A |
| Data as of | Timestamp on financial figures; daily cadence, not live market data |
| Effective flags | Resolved feature map on `/me` after platform ∩ firm ∩ book ∩ household merge ([ADR-018](/01-constitution/constitution/#adr-018--effective-feature-flag-resolution)) |
| Household | CRM grouping of clients and financial accounts (Orion child Account is the usual flag/target unit) |
| Person Account | Salesforce person record for a client; email aligns with Okta username on invite |
| Book | Advisor’s book of business — households they may configure or preview |
| portfolio_orion | Orion managed-AUM allocation taxonomy (Portfolio tab) |
| planning_combined | eMoney planning allocation taxonomy (Planning tab) — never merged with Orion classes |
| Action Required | Concrete client tasks (signatures, broken links, …) — not a generic inbox |
| VaultProvider | Middleware port to eMoney Vault for documents |
| Security baseline | Trust / AuthN/Z / logging obligations — [architecture §9](/02-architecture/architecture/#9-security-baseline) |

---

## Roles & surfaces

| Term | Meaning |
|---|---|
| Client | End user of the React Native app (Okta login) |
| Advisor | Configures households and invites in Salesforce; no mobile advisor login |
| Administrator | Firm/book policy in Salesforce; optional audited login-as-client on the native app |
| LWC | Lightning Web Component — Salesforce UI for advisor/admin config and preview |
| Advisor preview | LWC iframe of a Neopix-hosted web client for one household — same APIs/flags as mobile ([ADR-047](/01-constitution/constitution/#adr-047--advisor-preview-requires-web-client-surface)) |
| Impersonation | Admin login-as-client on the native app with middleware audit — not the same as advisor preview |
| Figma (Phase 1) | Layout authority for build — ownership and change control in [AGENTS.md](/agents/) |

---

## Parties

| Party | Role |
|---|---|
| Neopix | Middleware, mobile, preview web, Figma, SF→MW sync, Okta wiring, adapters |
| Callaway | Salesforce field map, LWC, preference objects, invite actions |
| OnePoint | Data in SF (Orion/eMoney), vault & feed, Azure / Okta / store accounts |

Detail: [prd §8](/product/prd/) · [ADR-023](/01-constitution/constitution/#adr-023--neopix-sow-vs-client-integration-boundary).
