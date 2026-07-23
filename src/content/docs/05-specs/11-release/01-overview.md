---
title: "E11 Security, QA & Pilot Release — Client Overview"
---

> Discovery package entry for E11. Cross-cutting release gate — production-quality build, security/QA sign-off, store prep, and pilot readiness for the late-Sep advisor fly-in and October pilot.  
> Specify: None (overview-only). Domain behaviour lives in E02–E10; this pack does not redefine story acceptance.  
> Not included: Sprint plans, task lists, GWT suites, separate UAT files, or stack/SKU/cost tech-spec ([06-engineering/](/06-engineering/readme/) — Phase B).  
> Shared conventions: [specs README](/05-specs/readme/) (MoSCoW, package shape, Discovery DoD, dependency graph).

| Field | Value |
|-------|-------|
| Status | Discovery locked |
| Package version | 1.0.0 |
| Date | 2026-07-17 |
| Specify | — (cross-cutting release gate; no user stories) |
| Depends on | E02–E10 Must demo bars (soft parallel domains → hard gate here); [E04 Home](/05-specs/04-home/01-overview/) + [E10 Action Required](/05-specs/10-alerts/01-overview/) for shell/badge surface |
| Unlocks | Pilot declare · store distribution · fly-in demo on pilot build |
| Changelog | [CHANGELOG.md](/05-specs/11-release/changelog/) |

Global context: [prd.md](/product/prd/) · [architecture.md](/02-architecture/architecture/) · [constitution.md](/01-constitution/constitution/) · [azure-hosting.md](/04-integrations/azure-hosting/)

Handoff: Treat E11 as the **exit gate** after domain Must demos. Do not invent domain behaviour, MFA/biometric/push scope, or store account ownership here — follow Accepted ADRs and prior pack specifies. Raise product gaps as ADRs.

---

## 1. Problem

Phase 1 needs a **production-quality build** for the late-September advisor fly-in and the October pilot cohort. Domain packs can demo in isolation, but a client pilot cannot launch without:

1. End-to-end QA on real devices across the agreed Must surfaces  
2. Security review with critical/high findings fixed  
3. Store / distribution path (TestFlight + Play internal) and install instructions for the pilot cohort  
4. Rehearsed demo script that maps to prior pack acceptance bars — not a new feature invent  

Without this gate, the fly-in risks unfinished security debt, untested install paths, and demo scripts that claim domain behaviour the specifies do not support.

---

## 2. Outcomes

| Measure | Target | Evidence |
|---|---|---|
| Pilot build | Distributed via TestFlight + Play internal testing | §8 Path 1 |
| Security | Sign-off recorded (OnePoint security); critical/high findings fixed for pilot | §8 Path 2 |
| QA bar | E2E device paths for Must domains green (or waived with owner) | §8 Path 3 · prior pack §8 bars |
| Demo | Fly-in script rehearsed on the pilot build | §8 Path 4 |
| Ops readiness | Pilot runbook + min-version / force-update behaviour documented | §8 Path 1 · Product constraints |
| Honest scope | No MFA, biometrics, or OS push claimed in pilot | [ADR-046](/01-constitution/constitution/#adr-046--mfa-off-for-this-delivery-client-mobile) · [ADR-031](/01-constitution/constitution/#adr-031--biometric-unlock) · [ADR-032](/01-constitution/constitution/#adr-032--push-notifications-scope) |

---

## 3. Scope summary

### In scope (Must for this gate)

Quality & security
- End-to-end QA on iOS and Android devices against E02–E10 Must acceptance paths (fixtures where integrations still blocked — label clearly)  
- Security review; fix **critical** and **high** findings before pilot declare  
- Performance and accessibility baseline checks agreed with delivery (not a full WCAG audit unless client requires)  

Distribution & ops
- App Store / Play submission prep; TestFlight + Play internal tracks for pilot  
- Pilot runbook (install, invite, known limitations, escalation)  
- Minimum-version / force-update behaviour owned by this pack (referenced from [E02](/05-specs/02-users/02-specify/))  
- Handoff notes for OnePoint ops (Azure host, secrets ownership, store accounts)  

Demo
- Advisor fly-in demo script mapped to prior pack §8 paths  
- Dry-run on the pilot build  

### Out of scope (Won't)

| Item | Authority / note |
|---|---|
| Biometric unlock | [ADR-031](/01-constitution/constitution/#adr-031--biometric-unlock) Won't |
| MFA for this delivery | [ADR-046](/01-constitution/constitution/#adr-046--mfa-off-for-this-delivery-client-mobile) Won't |
| OS push notifications (APNs/FCM) | [ADR-032](/01-constitution/constitution/#adr-032--push-notifications-scope) Won't — badge minimum ([E10](/05-specs/10-alerts/01-overview/)) |
| New domain features or story changes | Belong in E02–E10 specifies + ADRs — not invented in E11 |
| Tier B / Tier C integrations | [ADR-025](/01-constitution/constitution/#adr-025--tier-b-and-tier-c-in-neopix-sow) out of Neopix SOW |
| Stack versions, Azure SKUs, CI/CD depth, cost model | [06-engineering/](/06-engineering/readme/) Phase B |
| Full production go-live beyond pilot cohort | Post-pilot / separate program decision |

### Product constraints

| Constraint | Detail |
|---|---|
| Role of this pack | Release / pilot gate only — not a substitute for domain specifies |
| Exit rule | Prior pack Must demo bars met (or explicitly waived with owner) before pilot declare |
| Auth hardening | MFA / biometrics Won't this delivery ([ADR-046](/01-constitution/constitution/#adr-046--mfa-off-for-this-delivery-client-mobile), [ADR-031](/01-constitution/constitution/#adr-031--biometric-unlock)) |
| Push | OS push Won't ([ADR-032](/01-constitution/constitution/#adr-032--push-notifications-scope)); Action Required = in-app badge |
| Hosting | Middleware on OnePoint Azure ([ADR-008](/01-constitution/constitution/#adr-008--middleware-on-onepoint-azure)); [azure-hosting.md](/04-integrations/azure-hosting/) |
| Store accounts | OnePoint owns App Store / Play accounts; Neopix provides submission support ([architecture.md](/02-architecture/architecture/)) |
| UI | Pilot build matches Phase 1 Figma; material changes via design change control ([AGENTS.md](/agents/)) |
| Data honesty | Pilot demos do not invent financial figures; use live sandbox or clearly labeled fixtures |
| Min version / force update | Owned by this pack; Users specify defers here |

---

## 4. What the client must provide

| Item | Owner | Needed before |
|---|---|---|
| App Store / Play developer accounts | OnePoint / Client | Store submission · §8 Path 1 |
| SSL certs / Okta production (or pilot) tenant | Client IT | Pilot auth path |
| Azure prod/pilot environment access | OnePoint IT | Pilot middleware host |
| Security reviewer availability (OnePoint) | OnePoint | §8 Path 2 |
| Pilot cohort list + invite path | Client PO / ops | Oct pilot |
| Confirmation prior pack Must bars met or waived | Delivery + Client PO | Pilot declare |
| E11 gate criteria agreed | Neopix + client | Before pilot |

Operational blockers: [status.md](/04-integrations/status/). Integration gaps that block a Must path must be waived explicitly — not silently stubbed as “live” in the fly-in script.

---

## 5. Assumptions

1. All prior pack Must exit / demo bars are met (or waived with named owner) before pilot declare.  
2. Neopix integrates and prepares builds; OnePoint owns store accounts and Azure hosting ([ADR-008](/01-constitution/constitution/#adr-008--middleware-on-onepoint-azure), [ADR-023](/01-constitution/constitution/#adr-023--neopix-sow-vs-client-integration-boundary)).  
3. Fly-in and pilot claim only Accepted ADR scope — no MFA, biometrics, or OS push.  
4. Phase B engineering tech-spec is not required to exit E11 discovery; delivery still needs runnable pilot ops docs.  
5. Domain behaviour regressions found in E11 QA update the owning pack specify first — not this overview alone.

---

## 6. Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Late security findings | Pilot slip | Buffer before late-Sep fly-in; fix critical/high only for pilot declare |
| Domain pack Must bars incomplete | Demo claims false | Dependency graph gate; waive with owner or drop from script |
| Store account / cert delays | No TestFlight/Play track | Track in status.md; start account prep early |
| Scope creep (MFA / push / portal parity) | Rework | Point to Accepted Won't ADRs; require superseding ADR |
| Fixture presented as live data | Trust damage | Label fixtures; sandbox households for money figures |

---

## 7. Cross-pack hooks

| Hook | Relationship | Doc |
|---|---|---|
| All domain packs | Must demo bars feed this gate | [specs README](/05-specs/readme/) dependency graph |
| Action Required / push | Badge-only; push Won't | [10-alerts/01-overview.md](/05-specs/10-alerts/01-overview/) · [ADR-032](/01-constitution/constitution/#adr-032--push-notifications-scope) |
| Users / auth | MFA off; min-version / force-update owned here | [02-users/02-specify.md](/05-specs/02-users/02-specify/) · [ADR-046](/01-constitution/constitution/#adr-046--mfa-off-for-this-delivery-client-mobile) |
| Platform foundation | Scaffold precedes release hardening | [01-platform/01-overview.md](/05-specs/01-platform/01-overview/) |
| Azure hosting | Pilot / prod middleware host | [azure-hosting.md](/04-integrations/azure-hosting/) |
| Phase B | Deeper CI/CD / NFR tech-spec | [06-engineering/](/06-engineering/readme/) |
| Product brief | Fly-in / pilot outcomes + **Pilot Definition of Done** | [prd.md §5](/product/prd/#5-phase-1-outcomes--success) |

---

## 8. Acceptance demo

These four paths are the **client acceptance bar** for E11. Domain field lists remain in E02–E10 specifies.

### Path 1 — Pilot distribution

1. Pilot build available on **TestFlight** and **Play internal** testing.  
2. Install path documented in the pilot runbook for the agreed cohort.  
3. Minimum-version / force-update behaviour documented (or confirmed N/A for first pilot build).

### Path 2 — Security review (pilot gate)

1. Security review completed (OnePoint security).  
2. Critical and high findings fixed or explicitly accepted with owner.  
3. Outcome recorded in pilot runbook / E11 open items.

### Path 3 — E2E QA bar

1. Device walkthrough of Must paths from E02–E10 (or waived list with owners).  
2. Action Required badge / Home list parity spot-checked ([E10](/05-specs/10-alerts/01-overview/)).  
3. Known limitations listed in the pilot runbook (fixtures, missing SF fields, etc.).

### Path 4 — Fly-in rehearsal

1. Advisor fly-in demo script run end-to-end on the pilot build.  
2. Script maps to prior pack §8 paths — no undocumented features.  
3. Dry-run notes captured (timing, who drives, rollback if live data fails).

---

## 9. Discovery Definition of Done

Complete shared DoD in [specs README](/05-specs/readme/#discovery-definition-of-done) **where applicable** (overview-only: no specify stories), plus:

- [ ] §3 in-scope release gate agreed; Won't / Product constraints acknowledged  
- [ ] §4 client prerequisites identified with owners  
- [ ] §8 Paths 1–4 agreed as client demo bar  
- [ ] Milestones below locked with Client PO  
- [ ] Open items have owners and blocks-pilot Y/N  
- [ ] No domain behaviour accepted under E11 that belongs in E02–E10  

### Open items

| Item | Owner | Blocks pilot? |
|---|---|---|
| App Store / Play account access confirmed | OnePoint / Client | Y for Path 1 store tracks |
| Okta pilot/prod tenant + SSL | Client IT | Y for live auth pilot |
| Security review scheduled (OnePoint) | OnePoint | Y for Path 2 |
| Prior-pack Must bar waiver list (if any) | Delivery + Client PO | Y if any Must path incomplete |
| Pilot cohort roster | Client PO / ops | Y for Oct pilot declare |

### Milestones

| Date | Event |
|---|---|
| Late Sep 2026 | Advisor fly-in demo (pilot build) |
| Oct 2026 | Pilot cohort |

---

## 10. Build baseline

This pack is part of the locked discovery baseline for build. Domain behaviour is governed by linked specifies where present — those specifies win. Figma is layout authority for build ([AGENTS.md](/agents/)). Behaviour changes update specify (and ADR/PRD if needed) before code.


---

Related: [specs README](/05-specs/readme/) · [prd.md](/product/prd/) · [azure-hosting.md](/04-integrations/azure-hosting/) · [CHANGELOG](/05-specs/11-release/changelog/)
