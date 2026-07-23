---
title: "OnePoint — Integration Specs"
sidebar:
  order: 1
---

> Purpose: Normative contracts for how systems connect — auth, sync, ownership, failure modes, Done checklists.  
> Not this folder: Pack UI stories (`05-specs/*/02-specify.md`) or living blocker tracking alone (`status.md`).  
> Bundle: [README.md](/readme/) · [READY.md](/ready/) · [AGENTS.md](/agents/)  
> Decisions: [constitution.md](/01-constitution/constitution/) · Systems picture: [architecture.md](/02-architecture/architecture/) · Entities: [data-model.md](/03-data/data-model/)

Last updated: July 19, 2026 · Bundle [VERSION](/VERSION)

---

## Precedence

| Priority | Source | Role |
|:---:|---|---|
| 1 | [constitution.md](/01-constitution/constitution/) Accepted ADRs | Why — product/tech decisions |
| 2 | **This folder** (`*.md` specs, except `status.md`) | How systems integrate |
| 3 | `05-specs/*/05-contracts/` | What this pack needs from those systems |
| 4 | `05-specs/*/02-specify.md` | Behaviour (wins on UI / acceptance conflicts) |

Rule: Global integration specs answer *how systems connect*. Pack contracts answer *what this pack needs*. Pack contracts link upward; they do not redefine the global contract.

Status tracker ([status.md](/04-integrations/status/)) is operational only — blockers, owners, next actions. It does not override Accepted ADRs or these specs.

---

## Document map (global vs pack)

| Layer | Lives in | Owns |
|---|---|---|
| Product | `product/prd.md` | Vision, personas, delivery story |
| Why | `01-constitution/` | ADRs |
| Systems | `02-architecture/` | Context diagrams, data plane, screen→source |
| Entities | `03-data/` | Fields, mappings, conventions |
| Integrations | `04-integrations/` | Per-system contracts |
| Tracker | `04-integrations/status.md` | Blockers / owners (ops only) |
| Behaviour | `05-specs/*/02-specify.md` | Stories + NFRs |
| Domain contracts | `05-specs/*/05-contracts/` | OpenAPI fragments, SF packages, provider ports |

---

## Ownership matrix ([ADR-023](/01-constitution/constitution/#adr-023--neopix-sow-vs-client-integration-boundary))

| Concern | Neopix | Callaway | OnePoint |
|---|---|---|---|
| Middleware + mobile + UI/UX (Figma) | Owns | — | Hosts Azure / GitHub / stores |
| SF → middleware sync | Owns | Field map / objects | SF org, data quality |
| SF LWC / invite action | Consumes | Owns | — |
| Okta wiring (middleware) | Owns | — | Tenant |
| Orion → SF accuracy | Consumes via SF; reports gaps | May assist (change order) | Owns |
| eMoney → SF accuracy | Consumes via SF | May assist | Owns |
| eMoney Vault credentials | Adapter | — | Owns product access |
| Insights feed URL | Proxy | — | Owns content source |
| Calendly | Adapter | Optional SF fields | Advisor accounts |

---

## Integration index (this delivery)

| Spec | System | Role this delivery | Pack consumers |
|---|---|---|---|
| [salesforce.md](/04-integrations/salesforce/) | Salesforce | Tier A ingest + config + invite trigger | E02–E08, E10 |
| [okta.md](/04-integrations/okta/) | Okta | Client IdP + invite provisioning | E02 |
| [orion.md](/04-integrations/orion/) | Orion (via SF) | Managed AUM / holdings expectations **in SF** | E07, E08 (NW), E04 teaser |
| [emoney.md](/04-integrations/emoney/) | eMoney (via SF + WebView) | Planning facts + institution link | E08, E04, E10 |
| [vault.md](/04-integrations/vault/) | eMoney Vault | Documents via `VaultProvider` | E09, E10 |
| [insights-feed.md](/04-integrations/insights-feed/) | RSS / website | Insights content | E06, E04 |
| [calendly.md](/04-integrations/calendly/) | Calendly | Scheduling deep-link | E05, E04 |
| [azure-hosting.md](/04-integrations/azure-hosting/) | Azure (+ stores / GitHub) | Middleware host & release prereqs | E01, E11 |
| [status.md](/04-integrations/status/) | — | Living blockers tracker | All |

Data-source tiers (locked): Tier A = Salesforce. Tier B (direct eMoney API) and Tier C (Orion holdings feed) = **out of Neopix SOW this delivery** ([ADR-024](/01-constitution/constitution/#adr-024--holdings--orion-performance-source), [ADR-025](/01-constitution/constitution/#adr-025--tier-b-and-tier-c-in-neopix-sow)).

---

## Spec template (each system file)

Default shape for data / IdP / provider contracts:

1. Purpose & scope (this delivery / out of scope)  
2. Ownership  
3. Trust boundary & credentials  
4. Sequence / data flow  
5. Sync cadence & `data_as_of`  
6. Objects / fields / claims (link to data-model; detail in pack contracts)  
7. Failure modes & client-visible behaviour  
8. Environments  
9. Done checklist  
10. Pack consumers & contract pointers  

Hosting variant: [azure-hosting.md](/04-integrations/azure-hosting/) uses logical layout, environments, known constraints, and release prerequisites instead of sync/objects sections — hosting is not a data-sync system.

Cross-cutting security posture lives in [architecture.md §9](/02-architecture/architecture/#9-security-baseline) — not as a separate integration file.

---

## Related

- [architecture.md](/02-architecture/architecture/) §1–3, §9 — context, data plane, ownership, security  
- [05-specs/README.md](/05-specs/readme/) — pack index, integration readiness, OpenAPI compose note  
- Phase B: [06-engineering/](/06-engineering/readme/) — tech-spec / composed OpenAPI after stack lock  
