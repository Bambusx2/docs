---
title: "Integration Status Tracker"
---

> Operational only. Blockers, owners, and next actions.  
> Does not override Accepted ADRs or [normative integration specs](/04-integrations/readme/). When this file and an ADR disagree, the ADR wins.  
> Maintained by: Neopix · Parties: Neopix · Callaway · OnePoint

Last updated: July 19, 2026 (ADR-047 preview web surface)

---

## Implementation-start posture

Development begins **with stubs/fixtures**. Client credentials and SF field maps are a **parallel track** — they do not gate first commits. See [READY.md](/ready/).

PM ritual: walk this file weekly per [READY.md §5](/ready/#5-delivery-ops-pm-led) — owners, next dates, what stayed on fixtures vs went live.

| If blocked… | Implementation-start posture |
|---|---|
| SF holdings / field TBDs | Empty list / `unavailable` / fixtures — never invent |
| Okta / Azure | Mock IdP + local middleware |
| Vault credentials | Fixture `VaultProvider` |
| Insights feed URL | Bundled fixture feed |
| Golden client | Demo fixtures |

### Live vs fixture (pilot)

See [prd.md §5.2](/product/prd/#52-live-vs-fixture-bar-pilot-discipline). Fly-in may stay on fixtures; pilot requires live invite/login and ≥1 real SF portfolio path unless OnePoint waives in writing.

## Summary

| Integration | Need | Status | Blocker | Client owner | Delivery owner | Spec |
|---|---|---|---|---|---|---|
| Salesforce | Required | 🟡 In progress | Sandbox refresh; holdings often absent; FSC license | OnePoint | Callaway + Neopix | [salesforce.md](/04-integrations/salesforce/) |
| Okta | Required | 🟡 In progress | Tenant + invite flow not provisioned | OnePoint | Neopix + Callaway (SF actions) | [okta.md](/04-integrations/okta/) |
| Orion → SF | Prerequisite | 🟡 In progress | Holdings/performance must land in SF ([ADR-024](/01-constitution/constitution/#adr-024--holdings--orion-performance-source)) | OnePoint | Callaway (assist) · Neopix (consume / gap report) | [orion.md](/04-integrations/orion/) |
| eMoney → SF | Required | 🟡 In progress | Field map + golden client | OnePoint | Callaway (assist) · Neopix (consume) | [emoney.md](/04-integrations/emoney/) |
| eMoney API (Tier B) | Out of SOW | ⚪ Out of scope | Won't without change order ([ADR-025](/01-constitution/constitution/#adr-025--tier-b-and-tier-c-in-neopix-sow)); WebView link only | — | — | [emoney.md](/04-integrations/emoney/) |
| Orion holdings feed (Tier C) | Out of SOW | ⚪ Out of scope | Holdings via SF Tier A; Tier C Won't without change order | — | — | [orion.md](/04-integrations/orion/) |
| Middleware SF sync | Required | 🟡 In progress | Tier A path locked; implementation open | — | Neopix | [salesforce.md](/04-integrations/salesforce/) |
| Advisor preview web | Required (CFG-02) | Not started | Needs web host + `preview-session` ([ADR-047](/01-constitution/constitution/#adr-047--advisor-preview-requires-a-web-deliverable-client-surface)) | — | Neopix + Callaway | [E03](/05-specs/03-configuration/01-overview/) |
| Document vault | Required | 🟡 In progress | Path locked (eMoney Vault); credentials pending ([ADR-030](/01-constitution/constitution/#adr-030--document-vault-api-path)) | OnePoint | Neopix | [vault.md](/04-integrations/vault/) |
| DocuSign (in-app) | Out of SOW | ⚪ Out of scope | In-app signing Won't ([ADR-022](/01-constitution/constitution/#adr-022--phase-1-explicit-exclusions)) | OnePoint | — | [vault.md](/04-integrations/vault/) |
| Calendly | Required (deep-link) | 🟡 In progress | Depth locked ([ADR-034](/01-constitution/constitution/#adr-034--calendly-depth-in-v1)); adapter / URL map open | OnePoint | Neopix | [calendly.md](/04-integrations/calendly/) |
| Insights feed | Required | 🟡 In progress | Production feed URL pending | OnePoint | Neopix | [insights-feed.md](/04-integrations/insights-feed/) |
| Jiffy / digital intake | Out of SOW | ⚪ Out of scope | Won't this delivery ([ADR-022](/01-constitution/constitution/#adr-022--phase-1-explicit-exclusions)) | OnePoint | — | — |
| Azure (middleware host) | Required | 🟡 In progress | Host locked ([ADR-008](/01-constitution/constitution/#adr-008--middleware-on-onepoint-azure)); SKU / Phase B open | OnePoint | Neopix | [azure-hosting.md](/04-integrations/azure-hosting/) |
| App Store / Play | Required for pilot | 🟡 In progress | Developer accounts not provisioned | OnePoint | Neopix (submission support) | [azure-hosting.md](/04-integrations/azure-hosting/) |
| GitHub (mobile) | Required | 🟡 In progress | Repo not provisioned | OnePoint | Neopix | [azure-hosting.md](/04-integrations/azure-hosting/) |

Legend: 🟢 Ready · 🟡 In progress · 🔴 Blocked · ⚪ Out of scope

Data-source tiers (locked): Tier A = Salesforce. Tier B and Tier C = out of Neopix SOW this delivery. See [architecture §2](/02-architecture/architecture/#2-data-plane).

---

## Client-owned prerequisites

| Item | Status | Owner | Notes |
|---|---|---|---|
| SF sandbox (refreshed + test data) | 🟡 In progress | OnePoint / Callaway | Holdings often absent |
| FSC licenses for delivery sandbox users | 🟡 In progress | Callaway | FAR / Relationships |
| Holdings / performance in SF | 🟡 In progress | OnePoint | [ADR-024](/01-constitution/constitution/#adr-024--holdings--orion-performance-source) |
| Okta non-prod tenant | 🟡 In progress | OnePoint | |
| Azure subscription for middleware | 🟡 In progress | OnePoint | Host locked; SKU Phase B |
| Apple / Google developer accounts | 🟡 In progress | OnePoint | Pilot / E11 |
| Insights feed URL | 🟡 In progress | OnePoint | |
| eMoney Vault credentials | 🟡 In progress | OnePoint | [ADR-030](/01-constitution/constitution/#adr-030--document-vault-api-path) Accepted path |
| eMoney → SF field map + golden client | 🟡 In progress | OnePoint / Callaway | |
| Orion Connect exploration credentials | 🟢 Ready | OnePoint | Gap analysis only — not production Connect |

---

## Next actions

- [ ] OnePoint: hydrate holdings/performance in SF (or accept `unavailable` UX) — [ADR-024](/01-constitution/constitution/#adr-024--holdings--orion-performance-source)  
- [ ] OnePoint: eMoney Vault credentials for middleware  
- [ ] OnePoint: Insights feed URL  
- [ ] OnePoint: Okta + Azure tenant access for Neopix  
- [ ] Callaway: refreshed sandbox + FSC + preference objects  
- [ ] OnePoint / Callaway: golden client (SF + Orion + eMoney) + eMoney field map  
- [ ] Neopix: storage/cache model → OnePoint security review  
- [ ] Neopix: advisor preview web host + `preview-session` (shell MVP) — [ADR-047](/01-constitution/constitution/#adr-047--advisor-preview-requires-a-web-deliverable-client-surface)
- [ ] Callaway: LWC iframe → `previewUrl` once host is reachable
- [ ] Neopix: Calendly adapter or static URL map ([calendly.md](/04-integrations/calendly/))

---

## Meeting log (source trail)

| Date | Meeting | Outcome relevant to integrations |
|---|---|---|
| 2026-06-23 | Internal kickoff | SF = Tier A source of truth; middleware concept |
| 2026-06-25 | Client kickoff | eMoney at goal line; Sep fly-in + Oct pilot |
| 2026-06-30 | Workshop 4 | Middleware SF-only (Tier A); live Orion out of SOW |
| 2026-07-06 | Workshops 5–6 | Holdings gap; Orion vs eMoney precedence; eMoney contract signed |
| 2026-07-08 | Workshop 7 | Orion landscape; Tier C deferred from Neopix SOW |
| 2026-07-09–14 | Workshops 8–10 | Nav; no NW without eMoney; Calendly deep-link; institution-first linking; portal parity cut |
| 2026-07-17 | Discovery lock | ADRs Accepted; Tier B/C out of Neopix SOW; vault = eMoney Vault |

Normative decisions live in [constitution.md](/01-constitution/constitution/) — not in this log.
