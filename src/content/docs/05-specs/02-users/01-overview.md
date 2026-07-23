---
title: "E02 Users & Identity — Client Overview"
---

> Discovery package entry for E02. Invite-only client identity, Salesforce-driven provisioning, Okta authentication, My Profile, and audited admin impersonation.  
> Behaviour SoT: [02-specify.md](/05-specs/02-users/02-specify/) — specify wins if this overview and specify disagree.  
> Not included: Sprint plans, task lists, GWT suites, separate UAT files, runbooks (delivery / QA own those after handoff).  
> Shared conventions: [specs README](/05-specs/readme/) (MoSCoW, package shape, Discovery DoD, dependency graph).

| Field | Value |
|-------|-------|
| Status | Discovery locked |
| Package version | 1.0.0 |
| Date | 2026-07-17 |
| Specify | [02-specify.md](/05-specs/02-users/02-specify/) (stories + NFRs) |
| API contract | [05-contracts/openapi.yaml](/05-specs/02-users/05-contracts/openapi/) |
| Salesforce contract | [05-contracts/salesforce.md](/05-specs/02-users/05-contracts/salesforce/) |
| Okta (global) | [okta.md](/04-integrations/okta/) |
| Depends on | [E01 Platform](/05-specs/01-platform/01-overview/) |
| Unlocks | E03 Configuration (and identity-gated work in later packs) |
| Changelog | [CHANGELOG.md](/05-specs/02-users/changelog/) |

Global context: [prd.md](/product/prd/) · [architecture.md](/02-architecture/architecture/) §5 · [constitution.md](/01-constitution/constitution/) · [data-model.md](/03-data/data-model/) §1

Handoff: Build from [02-specify.md](/05-specs/02-users/02-specify/) + OpenAPI + Salesforce pack + global Okta/Salesforce integrations. Stub against fixtures until [status.md](/04-integrations/status/) clears Okta/SF prerequisites. Raise product gaps as ADRs — do not invent scope, field API names, or MFA behaviour. Security posture: [architecture §9](/02-architecture/architecture/#9-security-baseline).

---

## 1. Problem

OnePoint’s mobile portal must be **invite-only**. Household members exist as Salesforce Person Accounts long before they should see money, plan, or documents. Today there is no consistent path to:

- Provision a client into Okta from CRM without public self-sign-up  
- Let advisors manage invite, disable, reset, and remove from Salesforce (where they already work)  
- Authenticate the React Native app through middleware with opaque errors and secure sessions  
- Let clients view and propose profile updates under staff review  
- Allow administrators to login-as-client with a durable audit trail  

Without this pack, every later domain (Portfolio, Planning, Docs) has no trustworthy identity boundary. E02 establishes that boundary: **Salesforce is the CRM trigger and field source; middleware owns tokens, invite orchestration, and audit; Okta is the client IdP; the mobile app never talks to Salesforce or Okta admin APIs directly** ([ADR-001](/01-constitution/constitution/#adr-001--middleware-as-the-only-mobile-data-plane), [ADR-007](/01-constitution/constitution/#adr-007--okta-invite-via-middleware), [ADR-013](/01-constitution/constitution/#adr-013--roles-and-surfaces)).

---

## 2. Outcomes

| Measure | Target | Evidence |
|---|---|---|
| Invite → Home | Sandbox Person Account invited; client activates, authenticates, accepts legal terms, reaches Home | §8 Path 1 · stories A-01, A-06, A-08, C-01, C-02, C-19, C-24, C-05, C-18 |
| Advisor control | Invite / disable / enable / reset from Salesforce without engineering | §8 Path 2 · A-01…A-05, A-07 |
| Opaque auth failures | Wrong password, disabled, and unknown user share the same client-visible error | NFR-07 · C-02 |
| Profile propose → decide | Client submits diffs; staff approve/reject; client sees outcome | §8 Path 3 · C-06, C-07, A-09, C-25 |
| Last login visible in CRM | Interactive login writes `Last_Mobile_Login__c` | A-08 · C-02 |
| Impersonation audited | Admin can start/end login-as-client; audit retained | AD-03, AD-04, AD-05 · NFR-06 |
| No MFA / biometrics this delivery | Login is password/session only | [ADR-046](/01-constitution/constitution/#adr-046--mfa-off-for-this-delivery-client-mobile), [ADR-031](/01-constitution/constitution/#adr-031--biometric-unlock) · C-21 / C-23 Won't |

---

## 3. Scope summary

Story MoSCoW tags use definitions in [specs README](/05-specs/readme/#moscow). Full acceptance criteria: [02-specify.md](/05-specs/02-users/02-specify/).

### In scope (Must)

Advisor / staff (Salesforce)
- Invite to client portal, resend, cancel (Should for cancel), enable, disable, reset password, remove portal access (**A-01**–**A-07**, **A-10** Should)  
- Invitation status and **last mobile login** visible on Person Account (**A-06**, **A-08**)  
- Review queue for `Mobile_Profile_Proposal__c` — approve / reject (**A-09**)

Client (React Native + Okta)
- Accept invitation / complete sign-up; login (OIDC + PKCE); logout; forgot-password (**C-01**–**C-04**)  
- Session resume; provisioning wait (ready within bounded wait or contact-advisor) (**C-18**, **C-19**)  
- Accept current Terms of Use and Privacy Policy before Home (**C-24**, **C-11**, **C-12**)  
- My Profile hub: open, view personal information (SSN last-4 only), propose updates (**C-05**–**C-07**)  
- See profile proposal decision (**C-25**)  
- Concurrent devices with revoke-all on security events (**C-26**)

Admin / platform / support
- Admin identity account; impersonate client; end impersonation (**AD-01**, **AD-03**, **AD-04**)  
- Keep identity in sync SF ↔ middleware ↔ Okta (**S-01**)  
- Should/Could: list clients, audit history, sync failure and invite funnel monitoring, in-progress syncs, password change while logged in, re-auth after email change, missing required fields, app version (**see specify index**)

### Out of scope (Won't)

| Item | Story / ADR |
|---|---|
| Client MFA challenge on mobile | **C-21** · [ADR-046](/01-constitution/constitution/#adr-046--mfa-off-for-this-delivery-client-mobile) Explicit Off |
| Biometric unlock | **C-23** · [ADR-031](/01-constitution/constitution/#adr-031--biometric-unlock) |
| OS push delivery | **C-16** · [ADR-032](/01-constitution/constitution/#adr-032--push-notifications-scope) (in-app bell is Alerts pack) |
| Push notification preference | **C-10** · [ADR-032](/01-constitution/constitution/#adr-032--push-notifications-scope) (no OS push this delivery) |
| Multi-household switcher | **C-22** · [ADR-035](/01-constitution/constitution/#adr-035--multi-household-switcher) |
| Profile photo | C-15 |
| Refer a friend | **C-17** · [ADR-022](/01-constitution/constitution/#adr-022--phase-1-explicit-exclusions) |
| In-app account self-deletion | C-14 |
| Advisor mobile login | [ADR-013](/01-constitution/constitution/#adr-013--roles-and-surfaces) — Salesforce only |

Figma frames for Refer a Friend and Change Photo are **not** acceptance criteria for this delivery.

### Product constraints

| Constraint | Detail |
|---|---|
| Identity chain | Invite: SF action → middleware `POST /invites` → Okta user + email. Person Account `PersonEmail` = Okta username ([ADR-007](/01-constitution/constitution/#adr-007--okta-invite-via-middleware)) |
| No self-sign-up | Public registration is unavailable; only invited Person Accounts |
| Surfaces | Client = React Native + Okta. Advisor/admin config and invite actions = Salesforce LWC ([ADR-013](/01-constitution/constitution/#adr-013--roles-and-surfaces)) |
| Mobile → middleware only | App never calls Salesforce or Okta management APIs directly ([ADR-001](/01-constitution/constitution/#adr-001--middleware-as-the-only-mobile-data-plane)) |
| MFA / biometrics | Won't this delivery ([ADR-046](/01-constitution/constitution/#adr-046--mfa-off-for-this-delivery-client-mobile), [ADR-031](/01-constitution/constitution/#adr-031--biometric-unlock)) |
| Household scope | Session scoped to primary/active permitted household; no in-app switcher ([ADR-035](/01-constitution/constitution/#adr-035--multi-household-switcher)) |
| Profile gating | `profile_enabled` (and related keys) owned by [CFG-04](/05-specs/03-configuration/02-specify/#cfg-04--publish-the-domain-option-catalog); Profile remains reachable when enabled regardless of 3- vs 4-tab shell ([ADR-045](/01-constitution/constitution/#adr-045--nav-shell-v1-vs-v2-3-vs-4-tabs)) |
| PII | Full SSN/TIN never returned to mobile; last-4 only when present (NFR-05) |
| UI | Figma is layout authority for My Profile; specify owns data and business rules only |
| Global contracts | [okta.md](/04-integrations/okta/) · [salesforce.md](/04-integrations/salesforce/) — pack contracts implement them |

---

## 4. What the client must provide

| Item | Owner | Needed before |
|---|---|---|
| Okta client app (PKCE), redirect URIs, MFA off for this app | OnePoint IT | Live auth (fixtures OK for early UI) |
| Terms of Use + Privacy Policy HTTPS URLs and version ids | OnePoint compliance | **C-24** / legal gate |
| Salesforce fields, actions, permission sets, `Mobile_Profile_Proposal__c` per [salesforce.md](/05-specs/02-users/05-contracts/salesforce/) | Callaway | Middleware invite integration |
| Sandbox Person Accounts (invitable + already-active) | Callaway / OnePoint ops | §8 Paths 1–3 |
| App Store / Play package ids for invite deep links | Mobile lead | Deep-link hardening on **C-01** |
| Confirmation E01 §8 foundation demo met (or stub waiver) | Delivery lead | Treating E02 Must as unblocked |

Operational readiness: [status.md](/04-integrations/status/). Okta/SF gaps do not rewrite ADR-046 or invite-only rules — they delay live demo, not discovery lock.

---

## 5. Assumptions

1. Person Account **PersonEmail** is the Okta username and the invite destination.  
2. Advisors have **no** mobile app login; all advisor identity actions are Salesforce ([ADR-013](/01-constitution/constitution/#adr-013--roles-and-surfaces)).  
3. Nav shell follows Figma freeze ([ADR-045](/01-constitution/constitution/#adr-045--nav-shell-v1-vs-v2-3-vs-4-tabs)); Profile stays reachable when `profile_enabled`.  
4. Middleware is system of record for access/refresh tokens, impersonation sessions, and invite funnel metrics.  
5. E01 scaffold (or agreed fixtures) provides runnable RN app, mock `/me`, and CI before E02 Must integration work.  
6. Effective feature flags for Profile come from E03 resolution once Configuration lands; until then, fixtures may hard-code `profile_enabled` true for demos.

---

## 6. Risks

| Risk | Impact | Mitigation |
|---|---|---|
| SF fields/actions slip | Invite middleware blocked | Do not mark invite integration Done until [salesforce.md](/05-specs/02-users/05-contracts/salesforce/) Done in sandbox |
| Okta tenant / MFA policy drift | Accidental MFA challenge | Document Explicit Off in Okta app policy; treat unexpected MFA as configuration failure (**C-21** Won't — no app MFA UX) |
| Store deep-link interstitial delayed | Worse first-run UX | Web Okta activation still completes; store CTA is hardening on **C-01** |
| Alerts pack late for C-08 / C-25 | Missing in-app notice | Interim Profile banner acceptable until [E10](/05-specs/10-alerts/01-overview/) ships |
| Enumerate-via-error regression | Security / compliance | NFR-07 + shared generic auth error across disabled/unknown/wrong password |

---

## 7. Cross-pack hooks

| Hook | Relationship | Doc |
|---|---|---|
| Platform foundation | Hard dependency — scaffold / fixtures | [01-platform/01-overview.md](/05-specs/01-platform/01-overview/) |
| Configuration | `profile_enabled` and effective flags | [03-configuration/02-specify.md](/05-specs/03-configuration/02-specify/) CFG-04 |
| Home | Post-legal landing surface | [04-home/01-overview.md](/05-specs/04-home/01-overview/) |
| Action Required | Missing-field (**AR-06** Should) and proposal decided (**AR-07**) | [10-alerts/02-specify.md](/05-specs/10-alerts/02-specify/) |
| Architecture invite sequence | Systems picture | [architecture.md §5](/02-architecture/architecture/#5-identity) |
| Entities / enums | ClientUser, invite, proposal | [data-model.md §1](/03-data/data-model/) |
| Pack index | Pack → ADR → OpenAPI | [specs README](/05-specs/readme/#pack--adr--contracts) |

---

## 8. Acceptance demo

These three paths are the **client acceptance bar** for E02. Edge cases and field lists live in [02-specify.md](/05-specs/02-users/02-specify/). Engineering owns test design beyond this demo.

### Path 1 — Invite → Home

1. Advisor opens a sandbox Person Account with valid `PersonEmail` → **Invite to client portal** available (**A-01**).  
2. Invite runs → invite status reaches `sent`; client receives email (**A-01**, **A-06**).  
3. Client opens invite link → Okta activation / app entry (**C-01**).  
4. Client authenticates successfully → Salesforce `Last_Mobile_Login__c` updates (**C-02**, **A-08**).  
5. If “setting up” appears → household ready within **120 seconds** or contact-advisor state (**C-19**).  
6. Client accepts Terms + Privacy → Home blocked until accepted (**C-24**).  
7. Client lands on Home; Profile is reachable; cold restart resumes session (**C-05**, **C-18**).

### Path 2 — Access control

1. Advisor **Disable** an active client → login fails with the **same generic error** as unknown user (**A-04**, **C-02**, NFR-07).  
2. Advisor **Enable** → client can log in again (**A-03**).  
3. Advisor **Reset mobile password** → reset email sent; other devices lose session (**A-05**, **C-26**).  
4. Wrong password → same generic error as disabled (no account enumeration) (**C-02**).

### Path 3 — Profile propose → decide

1. Client opens Personal Information → fields from Salesforce; suitability labelled **Suitability** (**C-06**).  
2. Edit + Submit for review → pending `Mobile_Profile_Proposal__c` in Salesforce (**C-07**).  
3. Staff **Approve** → Person Account updated; client sees decision (**A-09**, **C-25**).

Optional (if scheduled): Admin impersonation start/end with audit row (**AD-03**, **AD-04**, **AD-05**).

---

## 9. Discovery Definition of Done

Complete shared DoD in [specs README](/05-specs/readme/#discovery-definition-of-done), plus:

- [ ] MFA Explicit Off accepted ([ADR-046](/01-constitution/constitution/#adr-046--mfa-off-for-this-delivery-client-mobile)); biometrics / multi-HH / OS push Won't acknowledged  
- [ ] [02-specify.md](/05-specs/02-users/02-specify/) Must stories + NFRs accepted as acceptance baseline  
- [ ] Should / Could / Won't MoSCoW in specify index acknowledged  
- [ ] Salesforce pack Done or scheduled — [salesforce.md](/05-specs/02-users/05-contracts/salesforce/)  
- [ ] OpenAPI available — [openapi.yaml](/05-specs/02-users/05-contracts/openapi/)  
- [ ] Global Okta contract reviewed — [okta.md](/04-integrations/okta/)  
- [ ] §8 Paths 1–3 agreed as client demo bar  
- [ ] Open items have owners and blocks-build Y/N  

### Open items

| Item | Owner | Blocks build? |
|---|---|---|
| Okta `dev` app + MFA-off policy confirmed | OnePoint IT | Y for live Path 1; N if auth fixtures |
| SF permission sets + actions in sandbox per salesforce.md | Callaway | Y for live invite; N if MW mocked |
| Legal URL + version ids for Terms / Privacy | Compliance | Y for **C-24** |
| Deep-link store package ids | Mobile lead | N (hardening) |

---

## 10. Build baseline

This pack is part of the locked discovery baseline for build. Domain behaviour is governed by linked specifies where present — those specifies win. Figma is layout authority for build ([AGENTS.md](/agents/)). Behaviour changes update specify (and ADR/PRD if needed) before code.


---

Related: [Specify](/05-specs/02-users/02-specify/) · [OpenAPI](/05-specs/02-users/05-contracts/openapi/) · [Salesforce pack](/05-specs/02-users/05-contracts/salesforce/) · [Okta global](/04-integrations/okta/) · [CHANGELOG](/05-specs/02-users/changelog/)
