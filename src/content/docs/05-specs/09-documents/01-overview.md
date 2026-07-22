---
title: "E09 Documents — Client Overview"
---

> Discovery package entry for E09. Household documents — list, filter, upload, download, and interim signature UX via eMoney Vault through middleware.  
> Behaviour SoT: [02-specify.md](/05-specs/09-documents/02-specify/) — specify wins if this overview and specify disagree.  
> Not included: Sprint plans, task lists, GWT suites, separate UAT files, runbooks (delivery / QA own those after handoff).  
> Shared conventions: [specs README](/05-specs/readme/) (MoSCoW, package shape, Discovery DoD, dependency graph).

| Field | Value |
|-------|-------|
| Status | Discovery locked |
| Package version | 1.0.0 |
| Date | 2026-07-17 |
| Specify | [02-specify.md](/05-specs/09-documents/02-specify/) (stories + NFRs) |
| API contract | [05-contracts/openapi.yaml](/05-specs/09-documents/05-contracts/openapi.yaml) |
| Vault contract | [05-contracts/vault.md](/05-specs/09-documents/05-contracts/vault/) |
| Vault (global) | [vault.md](/04-integrations/vault/) |
| Depends on | [E03 Configuration](/05-specs/03-configuration/01-overview/) |
| Unlocks | Soft — Home Docs shortcut ([E04](/05-specs/04-home/01-overview/)); Action Required signature deep link ([E10](/05-specs/10-alerts/01-overview/)); Release gate ([E11](/05-specs/11-release/01-overview/)) |
| Changelog | [CHANGELOG.md](/05-specs/09-documents/changelog/) |

Global context: [prd.md](/product/prd/) · [architecture.md](/02-architecture/architecture/) · [constitution.md](/01-constitution/constitution/) · [data-model.md](/03-data/data-model/) §5

Handoff: Build from [02-specify.md](/05-specs/09-documents/02-specify/) + OpenAPI + [vault.md](/05-specs/09-documents/05-contracts/vault/). Document metadata and binaries come from **eMoney Vault** via the middleware **VaultProvider** — an accepted exception to SF-only reads ([ADR-030](/01-constitution/constitution/#adr-030--document-vault-api-path), [ADR-002](/01-constitution/constitution/#adr-002--salesforce-tier-a-default-source)). Stub with fixtures until [status.md](/04-integrations/status/) clears vault credentials. Raise product gaps as ADRs — do not invent documents or store binaries in middleware.

---

## 1. Problem

Clients need a **Docs** tab to list, filter, upload, and download household documents stored in the firm’s document vault — statements, tax files, contracts, and planning reports — without leaving the mobile portal.

Without this pack:

- Home and Action Required cannot land on a trustworthy signature context  
- Advisors continue to email PDFs instead of a household vault  
- In-app signing pressure expands scope before DocuSign is ready  

E09 establishes the document surface: **eMoney Vault owns storage; middleware owns the VaultProvider port and household-scoped APIs; Salesforce owns only the feature flags; Sign is interim (external URL or coming-soon); in-app DocuSign is Won't** ([ADR-001](/01-constitution/constitution/#adr-001--middleware-as-the-only-mobile-data-plane), [ADR-030](/01-constitution/constitution/#adr-030--document-vault-api-path)).

---

## 2. Outcomes

| Measure | Target | Evidence |
|---|---|---|
| Docs tab | List with **Powered by eMoney Vault** when `documents_enabled` | §8 Path 1 · **DOC-01**, **DOC-02** |
| Filters | All (non-archived), needs signature, archive | §8 Path 1, 3, 4 · **DOC-02**–**DOC-04** |
| Download / upload | Short-lived vault URL download; upload when `documents_upload` on | §8 Path 1–2 · **DOC-05**, **DOC-06** |
| Signatures | Needs-signature list + interim Sign; Action Required deep link | §8 Path 3 · **DOC-03**, **DOC-07** |
| Flag gating | Tab, Home shortcut, and document AR items hidden when `documents_enabled` false | §8 Path 4 · [CFG-04](/05-specs/03-configuration/02-specify/#cfg-04--publish-the-domain-option-catalog) |
| No middleware binary store | Binaries in vault only | **NFR-03** · [vault.md](/05-specs/09-documents/05-contracts/vault/) |

---

## 3. Scope summary

Story MoSCoW tags use definitions in [specs README](/05-specs/readme/#moscow). Full acceptance criteria: [02-specify.md](/05-specs/09-documents/02-specify/).

### In scope (Must)

- Docs tab with flag gating (**DOC-01**)  
- Document list — current (non-archived) (**DOC-02**)  
- Needs signature list with interim Sign behavior (**DOC-03**)  
- Archive filter (**DOC-04**)  
- Download via short-lived vault URL (**DOC-05**)  
- Client upload when flagged (**DOC-06**)  
- Action Required deep link to needs-signature context (**DOC-07**)  

### Out of scope (Won't)

| Item | Story / note |
|---|---|
| In-app DocuSign signing | **DOC-08** · `documents_docusign` stays false |
| Jiffy / digital intake workflows | DOC-09 |
| Document push notifications | DOC-10 |
| Salesforce as document CMS / binary store | Vault only ([ADR-030](/01-constitution/constitution/#adr-030--document-vault-api-path)) |
| Signature alert computation | Owned by [E10 Alerts](/05-specs/10-alerts/02-specify/); Documents owns list + deep-link landing |

### Product constraints

| Constraint | Detail |
|---|---|
| Tab label | **Docs** (bottom navigation) |
| Attribution | **Powered by eMoney Vault** on Docs screen |
| Document metadata | eMoney Vault via middleware ([vault.md](/05-specs/09-documents/05-contracts/vault/)) — [ADR-030](/01-constitution/constitution/#adr-030--document-vault-api-path) exception to SF-only reads |
| Binary storage | Vault only; middleware proxies list/upload/download (**NFR-03**) |
| All vs Archive | **All** = non-archived only; archived only under archive filter |
| Sign interim UX | Open `externalSignUrl` in browser/WebView when vault provides it; otherwise show **Signing in the app is coming soon** |
| Flags | `documents_enabled`, `documents_upload` ([CFG-04](/05-specs/03-configuration/02-specify/#cfg-04--publish-the-domain-option-catalog)); `documents_docusign` remains **false** until in-app signing ships |
| UI | Figma is layout authority; specify defines data and business rules only |
| In-app signing / Jiffy / push | Won't (**DOC-08**–**DOC-10**) |

---

## 4. What the client must provide

| Item | Owner | Needed before |
|---|---|---|
| eMoney Vault API access and field map | Client / eMoney | Live list/upload/download |
| Interim Sign UX copy (app strings) | Neopix design | DOC-03 |
| Interim Sign compliance wording acceptance | OnePoint compliance / experience | DOC-03 |
| Pack overview available for client reference | Neopix | As needed |
| Vault product change (if not eMoney) | Phase 2 / ADR | Adapter swap only — mobile API stays stable ([ADR-030](/01-constitution/constitution/#adr-030--document-vault-api-path)) |

Operational blockers: [status.md](/04-integrations/status/). Missing vault credentials block live demo; fixtures are OK for build.

---

## 5. Assumptions

1. Document path is **eMoney Vault** via middleware ([ADR-030](/01-constitution/constitution/#adr-030--document-vault-api-path) Accepted).  
2. In-app DocuSign remains off (`documents_docusign` false); interim Sign uses external URL or coming-soon copy.  
3. Signature alerts are owned by [E10](/05-specs/10-alerts/02-specify/); Documents owns list and deep-link landing (**DOC-07**).  
4. Effective flags come from [E03](/05-specs/03-configuration/02-specify/) **CFG-04** / `/me`.  
5. Home shell and Docs shortcut come from [E04](/05-specs/04-home/01-overview/).  
6. Upload and download are household-scoped to the authenticated client (**NFR-04**).

---

## 6. Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Vault API delayed | No live Docs demo | Fixtures for build; `unavailable` / retryable errors; credentials block live Path 1 |
| Firm moves off eMoney vault | Re-integration work | [ADR-030](/01-constitution/constitution/#adr-030--document-vault-api-path); adapter swap behind VaultProvider; mobile OpenAPI stable |
| Pressure for in-app DocuSign | Scope creep | **DOC-08** Won't; `documents_docusign` false |
| Unsigned HTML / malware upload | Security incident | Vault vendor controls + household scope; middleware does not persist binaries (**NFR-03**) |
| Attribution drift | Brand / compliance | Overview constraint **Powered by eMoney Vault**; update only via product change control |

---

## 7. Cross-pack hooks

| Hook | Relationship | Doc |
|---|---|---|
| Configuration | `documents_enabled`, `documents_upload`, `documents_docusign` | [03-configuration CFG-04](/05-specs/03-configuration/02-specify/#cfg-04--publish-the-domain-option-catalog) |
| Home | Docs shortcut | [04-home/01-overview.md](/05-specs/04-home/01-overview/) |
| Alerts | `document_signature_pending` → needs-signature context | [10-alerts AR-04](/05-specs/10-alerts/02-specify/#ar-04--sign-a-document-waiting-for-my-signature) |
| Entities | Document | [data-model.md §5](/03-data/data-model/) |
| Global vault | Ops / credentials | [vault.md](/04-integrations/vault/) |
| Pack vault port | Adapter handoff | [vault.md](/05-specs/09-documents/05-contracts/vault/) |
| Release | Soft-parallel after E03 | [11-release](/05-specs/11-release/01-overview/) · [specs README](/05-specs/readme/) |

---

## 8. Acceptance demo

These four paths are the **client acceptance bar** for E09. Field lists and vault rules live in [02-specify.md](/05-specs/09-documents/02-specify/).

### Path 1 — Browse and download

1. `documents_enabled` on; open Docs — list with attribution (**DOC-01**, **DOC-02**).  
2. Download a document via short-lived URL (**DOC-05**).

### Path 2 — Upload

1. `documents_upload` on — upload file; appears in All list (**DOC-06**).  
2. `documents_upload` off — upload returns 403 / control hidden.

### Path 3 — Signatures

1. Needs signature filter shows pending items; Sign uses URL or coming-soon (**DOC-03**).  
2. Action Required alert deep-links to needs-signature context (**DOC-07**).

### Path 4 — Archive and flags

1. Archive filter shows archived rows only (**DOC-04**).  
2. `documents_enabled` off — tab and shortcuts **hidden** (**DOC-01**).

---

## 9. Discovery Definition of Done

Complete shared DoD in [specs README](/05-specs/readme/#discovery-definition-of-done), plus:

- [ ] [02-specify.md](/05-specs/09-documents/02-specify/) **DOC-01**–**DOC-07** accepted; Won't **DOC-08**–**DOC-10** acknowledged  
- [ ] NFRs accepted (latency, short-lived URLs, no middleware binary store, household scope)  
- [ ] Contracts reviewed — [OpenAPI](/05-specs/09-documents/05-contracts/openapi.yaml), [vault.md](/05-specs/09-documents/05-contracts/vault/)  
- [x] Neopix Docs Figma reviewed   
- [ ] Interim Sign copy accepted (Neopix + compliance)  
- [ ] §8 Paths 1–4 agreed as client demo bar  
- [ ] Open items have owners and blocks-build Y/N  

### Open items

| Item | Owner | Blocks build? |
|---|---|---|
| eMoney Vault sandbox credentials | Client / eMoney | Y for live demo; N for fixture build |
| Interim Sign message copy (Neopix) + client acceptance | Neopix design · Client | N |
| Docs Figma | Neopix | Done |
| Vault product change (if ever) | Product + ADR | N — ADR-030 Accepted = eMoney Vault |

---

## 10. Build baseline

This pack is part of the locked discovery baseline for build. Domain behaviour is governed by linked specifies where present — those specifies win. Figma is layout authority for build ([AGENTS.md](/agents/)). Behaviour changes update specify (and ADR/PRD if needed) before code.


---

Related: [Specify](/05-specs/09-documents/02-specify/) · [OpenAPI](/05-specs/09-documents/05-contracts/openapi.yaml) · [Vault](/05-specs/09-documents/05-contracts/vault/) · [specs README](/05-specs/readme/) · [CHANGELOG](/05-specs/09-documents/changelog/)
