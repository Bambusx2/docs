---
title: "E03 Configuration & App Shell — Client Overview"
---

> Discovery package entry for E03. Effective feature flags, Salesforce advisor/admin configuration, client-view preview, and the domain option catalog that gates later packs.  
> Behaviour SoT: [02-specify.md](/05-specs/03-configuration/02-specify/) — specify wins if this overview and specify disagree.  
> Shared conventions: [specs README](/05-specs/readme/).

| Field | Value |
|-------|-------|
| Status | Discovery locked |
| Package version | 1.0.0 |
| Date | 2026-07-17 |
| Specify | [02-specify.md](/05-specs/03-configuration/02-specify/) |
| API contract | [05-contracts/openapi.yaml](/05-specs/03-configuration/05-contracts/openapi.yaml) |
| Salesforce contract | [05-contracts/salesforce.md](/05-specs/03-configuration/05-contracts/salesforce/) |
| Resolution contract | [05-contracts/resolution.md](/05-specs/03-configuration/05-contracts/resolution/) |
| Depends on | [E02 Users](/05-specs/02-users/01-overview/) |
| Unlocks | E04–E09 soft-parallel after E03; E10 after its Depends on (E02, E04, E08, E09) |
| Changelog | [CHANGELOG.md](/05-specs/03-configuration/changelog/) |

Global context: [prd.md](/product/prd/) · [architecture.md](/02-architecture/architecture/) · [constitution.md](/01-constitution/constitution/) · [data-model.md](/03-data/data-model/) §2

Handoff: build from specify + OpenAPI + Salesforce pack + [resolution.md](/05-specs/03-configuration/05-contracts/resolution/). Middleware owns effective flag computation; Salesforce stores options and LWC tooling. Domain behaviour inside gated surfaces belongs to E04–E10.

---

## 1. Problem

Every household needs an advisor-controlled slice of the portal (which tabs and teasers appear). Advisors already work in Salesforce and will not adopt a separate admin SPA.

Without a single effective-flag model, the shell cannot hide tabs cleanly, platform capability drifts from CRM toggles, and later packs invent private flag keys.

E03 is the control plane: platform ∩ firm policy ∩ book defaults ∩ household overrides → effective flags on `/me`, configured in Salesforce LWC, with advisor preview using the same computation ([ADR-005](/01-constitution/constitution/#adr-005--platform-feature-flags-vs-salesforce-configurable-options), [ADR-006](/01-constitution/constitution/#adr-006--all-advisor-and-admin-configuration-in-salesforce), [ADR-014](/01-constitution/constitution/#adr-014--feature-configuration-hierarchy), [ADR-018](/01-constitution/constitution/#adr-018--effective-feature-flag-resolution)).

---

## 2. Outcomes

| Measure | Target | Evidence |
|---|---|---|
| Client gating | Domain off in SF → tab, More row, and Home teaser removed after refresh (not an empty shell) | §8 Path 1 · CFG-01, CFG-02 |
| Advisor preview | LWC iframe → web client; same effective flags as the real client | §8 Path 2 · CFG-02 · [ADR-047](/01-constitution/constitution/#adr-047--advisor-preview-requires-web-client-surface) |
| Admin policy | Firm-mandatory, book defaults, bulk, and transfer rules work | §8 Path 3 · CFG-03 |
| Catalog lock | Shared key set; other packs reference keys only | §8 Path 4 · CFG-04 |
| No store release for toggles | Option changes visible within ≤ 5 minutes of SF→MW sync | NFR-02 |
| No separate admin SPA | All config in Salesforce | CFG-05 Won't · [ADR-006](/01-constitution/constitution/#adr-006--all-advisor-and-admin-configuration-in-salesforce) |

---

## 3. Scope summary

Full acceptance criteria: [02-specify.md](/05-specs/03-configuration/02-specify/). MoSCoW: [specs README](/05-specs/readme/#moscow).

### In scope (Must)

- Effective flags on `/me` (and `/config` when present); shell and Home omit disabled targets (CFG-01)
- Mobile consumes middleware flags only — never re-merges layers (NFR-03)
- Advisor per-household overrides in Salesforce; client-view preview per CFG-02 / [ADR-047](/01-constitution/constitution/#adr-047--advisor-preview-requires-web-client-surface)
- Admin firm-mandatory, book defaults, bulk, and transfer (CFG-03)
- Domain option catalog for this delivery (CFG-04)

### Out of scope (Won't)

| Item | Note |
|---|---|
| Separate admin web app | CFG-05 · ADR-006 |
| Client self-toggles | CFG-06 |
| Product behaviour inside gated domains | E04–E10 |
| Invite / Okta provisioning | [E02](/05-specs/02-users/05-contracts/salesforce/) |
| Auto-detect planning off when no eMoney | `planning_enabled` is manual this delivery |

### Product constraints

| Constraint | Detail |
|---|---|
| Admin surface | Salesforce LWC only ([ADR-006](/01-constitution/constitution/#adr-006--all-advisor-and-admin-configuration-in-salesforce)) |
| Two layers | Platform flags vs SF options ([ADR-005](/01-constitution/constitution/#adr-005--platform-feature-flags-vs-salesforce-configurable-options)) |
| Resolution | [resolution.md](/05-specs/03-configuration/05-contracts/resolution/) · [ADR-018](/01-constitution/constitution/#adr-018--effective-feature-flag-resolution) |
| Hierarchy | Firm → book → household ([ADR-014](/01-constitution/constitution/#adr-014--feature-configuration-hierarchy)) |
| Firm-mandatory keys | Mechanism ships; no keys mandatory this delivery ([ADR-028](/01-constitution/constitution/#adr-028--firm-mandatory--toggle-policy)) |
| Nav shell | Figma freeze; prefer 3-tab when Planning hidden ([ADR-045](/01-constitution/constitution/#adr-045--nav-shell-v1-vs-v2)) |
| DocuSign flag | `documents_docusign` false until in-app signing ships |
| Advisors | No mobile login ([ADR-013](/01-constitution/constitution/#adr-013--roles-and-surfaces)) |

---

## 4. What the client must provide

| Item | Owner | Needed before |
|---|---|---|
| SF objects + LWCs | Callaway | Live flag toggle + preview demos |
| Preview web host + `preview-session` | Neopix | CFG-02 live preview ([ADR-047](/01-constitution/constitution/#adr-047--advisor-preview-requires-web-client-surface)) |
| Preview URL / token scheme (LWC ↔ MW) | Callaway + Neopix | Live iframe |
| Sandbox households with known flag matrices | Callaway / OnePoint | §8 Paths 1–3 |
| Firm-mandatory key list (if any later) | Client compliance | Not required to ship the mechanism |
| E02 `/me` baseline (real or fixture) | Delivery lead | Treating E03 Must as unblocked |

Living blockers: [status.md](/04-integrations/status/).

---

## 5. Assumptions

1. Advisors and admins configure only in Salesforce (CFG-06 Won't).
2. Middleware alone merges platform + SF layers ([ADR-018](/01-constitution/constitution/#adr-018--effective-feature-flag-resolution)).
3. `planning_enabled` is set manually when a plan exists.
4. E02 provides authenticated `/me` (or fixtures).
5. Domain packs may proceed in parallel after E03 catalog agreement ([specs README](/05-specs/readme/)).

---

## 6. Risks

| Risk | Mitigation |
|---|---|
| Firm-mandatory list unpublished | Ship mechanism now; zero mandatory keys ([ADR-028](/01-constitution/constitution/#adr-028--firm-mandatory--toggle-policy)) |
| Preview under-scheduled | Track as Neopix workstream ([ADR-047](/01-constitution/constitution/#adr-047--advisor-preview-requires-web-client-surface); [status.md](/04-integrations/status/)) |
| Preview token too privileged | Household-scoped; no book elevation (NFR-04) |
| Packs invent private flag keys | CFG-04 is sole catalog |
| SF→MW sync lag | NFR-02 ≤ 5 minutes |
| SF iframe CSP blocked | `frame-ancestors` for Salesforce domains |

---

## 7. Cross-pack hooks

| Hook | Doc |
|---|---|
| Users / Profile | [02-users](/05-specs/02-users/01-overview/) |
| Home | [04-home](/05-specs/04-home/01-overview/) |
| Team / Insights / Portfolio / Planning / Documents / Alerts | Matching pack specifies |
| Flag entities | [data-model.md §2](/03-data/data-model/) |
| Resolution | [resolution.md](/05-specs/03-configuration/05-contracts/resolution/) |

---

## 8. Acceptance demo

### Path 1 — Client gating

1. Portfolio on → tab visible.  
2. Advisor turns Portfolio off in SF.  
3. After refresh within sync window → tab and Home teaser gone (CFG-01, NFR-02).

### Path 2 — Preview

1. Advisor opens client-view preview in LWC.  
2. Preview matches that household’s effective flags (CFG-02, NFR-04/05, [ADR-047](/01-constitution/constitution/#adr-047--advisor-preview-requires-web-client-surface)).

### Path 3 — Admin

1. Firm-mandatory key → advisor cannot turn it off (CFG-03).  
2. Book defaults apply to a new household.  
3. Bulk and transfer preserve overrides unless explicit reset (CFG-03).

### Path 4 — Catalog

1. Walk LWC against CFG-04 keys.  
2. No undocumented keys in middleware effective payload.

---

## 9. Discovery Definition of Done

Shared DoD in [specs README](/05-specs/readme/#discovery-definition-of-done), plus:

- [ ] CFG-01–CFG-04 accepted; CFG-05–CFG-06 Won't acknowledged  
- [ ] NFRs accepted  
- [ ] Contracts reviewed  
- [ ] SF package Done or scheduled with Callaway  
- [ ] §8 Paths 1–4 agreed  
- [ ] Downstream packs use CFG-04 keys only  

### Open items

| Item | Owner | Blocks build? |
|---|---|---|
| Preview web approach + LWC wiring | Neopix / Callaway | Y for live CFG-02 — see [status.md](/04-integrations/status/) and [ADR-047](/01-constitution/constitution/#adr-047--advisor-preview-requires-web-client-surface) |
| Firm-mandatory key list (post-delivery) | Client compliance | N |
| Sandbox flag matrix households | Callaway / OnePoint | Y for §8 Paths 1–3 live |

---

## 10. Build baseline

Specify wins on behaviour. Figma is layout authority. See [AGENTS.md](/agents/).

---

Related: [Specify](/05-specs/03-configuration/02-specify/) · [OpenAPI](/05-specs/03-configuration/05-contracts/openapi.yaml) · [Salesforce](/05-specs/03-configuration/05-contracts/salesforce/) · [Resolution](/05-specs/03-configuration/05-contracts/resolution/) · [specs README](/05-specs/readme/) · [CHANGELOG](/05-specs/03-configuration/changelog/)
