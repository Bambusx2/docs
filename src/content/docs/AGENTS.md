---
title: "OnePoint — Delivery operating rules"
---

> Non-negotiables for anyone building or changing behaviour from this Discovery Spec Bundle.  
> Bundle: [README.md](/readme/) · [READY.md](/ready/) · [product/prd.md](/product/prd/) · [product/glossary.md](/product/glossary/) · [VERSION](/VERSION)

Read this file before editing product behaviour or implementing from specs. Part of the engineering / delivery path in [README.md](/readme/) — not required for product sign-off reading.

---

## Precedence (always)

| Priority | Source | Role |
|:---:|---|---|
| 1 | [product/prd.md](/product/prd/) | Product narrative |
| 2 | [constitution.md](/01-constitution/constitution/) Accepted ADRs | Decisions (win on decision conflicts) |
| 3 | [04-integrations/](/04-integrations/readme/) | How systems connect |
| 4 | [architecture.md](/02-architecture/architecture/) · [data-model.md](/03-data/data-model/) | Systems picture · entities |
| 5 | `05-specs/*/02-specify.md` | Behaviour (wins on UI / acceptance conflicts) |
| 6 | `05-specs/*/05-contracts/` | Domain OpenAPI / SF / provider packs |
| 7 | `05-specs/*/01-overview.md` | Pack context / acceptance demo — not behaviour SoT |
| 8 | [04-integrations/status.md](/04-integrations/status/) | Operational blockers only |
| 9 | [READY.md](/ready/) | Implementation start + PM delivery ops — not behaviour SoT |

Workshop notes and other research are external resources (source trail only). Do not treat them as higher priority than Accepted ADRs.

If the product story changes, update the PRD and any affected ADRs / specifies together.

---

## Hard constraints (do not violate)

1. Mobile → middleware only — no direct Salesforce, Orion, or eMoney API from the app ([ADR-001](/01-constitution/constitution/#adr-001--middleware-as-the-only-mobile-data-plane)).  
2. No live Orion Connect in Neopix runtime ([ADR-003](/01-constitution/constitution/#adr-003--no-orion-connect-api-in-neopix-scope)).  
3. Tier B / Tier C out of Neopix V1 SOW — planning via eMoney→SF + WebView link; holdings via SF Tier A ([ADR-024](/01-constitution/constitution/#adr-024--holdings--orion-performance-source), [ADR-025](/01-constitution/constitution/#adr-025--tier-b-and-tier-c-in-neopix-sow)).  
4. Never invent financial data — missing holdings/performance/allocation → empty list or `unavailable`.  
5. Dual allocation taxonomies — never marry Orion and eMoney classes ([ADR-010](/01-constitution/constitution/#adr-010--dual-allocation-scopes)).  
6. Recompute net worth in middleware — do not trust eMoney display totals ([ADR-038](/01-constitution/constitution/#adr-038--net-worth-calculation)).  
7. Documents via `VaultProvider` → eMoney Vault ([ADR-030](/01-constitution/constitution/#adr-030--document-vault-api-path)); no long-term binaries in middleware.  
8. Security baseline — [architecture.md §9](/02-architecture/architecture/#9-security-baseline). Do not weaken MFA-off / household-visibility compensating controls.  
9. Won't this delivery — biometrics, OS push, multi-HH switcher, expense edit, manual held-away create, nickname write-back, MFA ([ADR-031](/01-constitution/constitution/#adr-031--biometric-unlock)–[046](/01-constitution/constitution/#adr-046--mfa-off-for-this-delivery-client-mobile)).  
10. Advisor preview is a web client surface (CFG-02 / [ADR-047](/01-constitution/constitution/#adr-047--advisor-preview-requires-a-web-deliverable-client-surface)) — not the native store build inside Salesforce.

---

## Pack checklist (before coding a domain)

1. Confirm bundle [VERSION](/VERSION).  
2. Skim [prd.md](/product/prd/) + [glossary.md](/product/glossary/) for domain intent.  
3. Open pack `01-overview.md` then `02-specify.md` (wins on behaviour).  
4. Open linked `05-contracts/` and the matching [04-integrations/](/04-integrations/readme/) spec.  
5. Confirm entities in [data-model.md](/03-data/data-model/) — do not invent SF API names; leave `(TBD)`.  
6. Check [status.md](/04-integrations/status/) — stub/fixture if blocked.  
7. If behaviour must change — update specify (and ADR / PRD if needed) before code.

---

## What not to generate from this bundle

- Sprint plans, Jira dumps, or GWT suites as discovery artifacts  
- Direct Orion Connect or Tier B eMoney API clients “just for the demo”  
- Consolidated root OpenAPI under discovery unless asked  
- Treating [tech-spec-proposal.md](/06-engineering/tech-spec-proposal/) as behaviour or decision SoT  
- Pinning Azure SKUs or cost tables as client-approved before stack lock  

---

## Naming

- Company names (Neopix, Callaway, OnePoint) — not individuals — in client-facing docs.  
- Domains: Home · Portfolio · Planning · Docs · More (Insights, Team, Profile) — Planning hidden when not enrolled ([ADR-029](/01-constitution/constitution/#adr-029--home-without-emoney)).  
- Prefer “spec pack” / package id `E0N` over “epic”.  
- Figma is Neopix-authored and incrementally approved by OnePoint. Material changes need design change control + client re-approval.

---

## Package boundary

This Discovery Spec Bundle is the locked deliverable for client handoff and build. Do not add relative links that leave the package.

External resources (workshop notes, ICP research, Salesforce exports, authoring templates) inform updates but are not part of this deliverable. Cite by name in Source trail — never as file path links.

Implementation start and PM delivery ops: [READY.md](/ready/).

## Writing or rewriting a spec pack

| Artifact | Must include |
|---|---|
| `01-overview.md` | 10-section template; Product constraints under §3; acceptance demo §8 |
| `02-specify.md` | NFRs + MoSCoW index + stories; Must = behaviour + errors + integrations; Won't = MoSCoW tag only |
| `05-contracts/` | Match specify fields; link global [04-integrations/](/04-integrations/readme/) |

Reference pack: [05-specs/07-portfolio/](/05-specs/07-portfolio/01-overview/).
