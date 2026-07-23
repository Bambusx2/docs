---
title: "OnePoint Product Constitution"
---

> Purpose: Single record of product and technical decisions (ADR). Update this file when a decision is proposed, accepted, or superseded.  
> Bundle: [README.md](/readme/) · [READY.md](/ready/) · [AGENTS.md](/agents/) · Product: [prd.md](/product/prd/)  
> Systems architecture: [architecture.md](/02-architecture/architecture/) · Behaviour: [05-specs/*/02-specify.md](/05-specs/readme/) · Delivery: [05-specs/README.md](/05-specs/readme/) · Integrations: [04-integrations/](/04-integrations/readme/) · Tracker: [status.md](/04-integrations/status/)

Last updated: July 21, 2026

---



## How to use

1. New decision — add an ADR with status **Proposed**; assign owner and tags.
2. Agreed — set status **Accepted**, add date, move summary to architecture or specs if needed.
3. Reversed — set status **Superseded**; link to replacement ADR.
4. Do not duplicate open decisions in `architecture.md` or `data-model.md` — link here instead.



### ADR template

Each ADR is headed `ADR-NNN — Title` and follows this shape:

| Field  | Value                            |
| ------ | -------------------------------- |
| Status | Proposed / Accepted / Superseded |
| Date   | YYYY-MM-DD                        |
| Owners | Company                          |
| Tags   | e.g. data, ux, security          |

- **Context** — What problem or constraint?
- **Decision** — What we chose (or pending options).
- **Consequences** — What follows; links to specs / architecture.



### Document precedence


| Priority | Source                                                  | Role                                                 |
| -------- | ------------------------------------------------------- | ---------------------------------------------------- |
| 1        | This constitution (**Accepted** ADRs)                   | Decisions — **win** on decision conflicts            |
| 2        | [AGENTS.md](/agents/) hard constraints              | Non-negotiables for humans and agents                |
| 3        | [04-integrations/](/04-integrations/readme/) normative specs | How systems connect                                  |
| 4        | `05-specs/*/02-specify.md`                              | Behaviour — **wins** on UI / acceptance conflicts    |
| 5        | Workshop notes / research (external resources)          | **Source trail only** — never override Accepted ADRs |


Workshop notes inform history; they are not binding after discovery lock.

---



## ADR index


| ID                                                                             | Title                                                     | Status     |
| ------------------------------------------------------------------------------ | --------------------------------------------------------- | ---------- |
| [ADR-001](#adr-001--middleware-as-the-only-mobile-data-plane)                  | Middleware as the only mobile data plane                  | Accepted   |
| [ADR-002](#adr-002--salesforce-tier-a-default-source)                          | Salesforce Tier A default source                          | Accepted   |
| [ADR-003](#adr-003--no-orion-connect-api-in-neopix-scope)                      | No Orion Connect API in Neopix scope                      | Accepted   |
| [ADR-004](#adr-004--daily-data-cadence-and-data-as-of)                         | Daily data cadence and "data as of"                       | Accepted   |
| [ADR-005](#adr-005--platform-feature-flags-vs-salesforce-configurable-options) | Platform flags vs SF configurable options                 | Accepted   |
| [ADR-006](#adr-006--all-advisor-and-admin-configuration-in-salesforce)         | All advisor/admin configuration in Salesforce             | Accepted   |
| [ADR-007](#adr-007--okta-invite-via-middleware)                                | Okta invite via middleware                                | Accepted   |
| [ADR-008](#adr-008--middleware-on-onepoint-azure)                              | Middleware on OnePoint Azure                              | Accepted   |
| [ADR-009](#adr-009--portfolio-orion-only-planning-emoney-only)                 | Portfolio Orion-only; Planning eMoney-only                | Accepted   |
| [ADR-010](#adr-010--dual-allocation-scopes)                                    | Dual allocation scopes (never merge taxonomies)           | Accepted   |
| [ADR-011](#adr-011--orion-wins-on-duplicate-account-numbers)                   | Orion wins on duplicate account numbers                   | Accepted   |
| [ADR-012](#adr-012--no-emoney-gauge-embeds)                                    | No eMoney gauge embeds                                    | Accepted   |
| [ADR-013](#adr-013--roles-and-surfaces)                                        | Roles and surfaces                                        | Accepted   |
| [ADR-014](#adr-014--feature-configuration-hierarchy)                           | Feature configuration hierarchy                           | Accepted   |
| [ADR-015](#adr-015--home-as-neutral-summary-hub)                               | Home as neutral summary hub                               | Accepted   |
| [ADR-016](#adr-016--v1-action-required--concrete-items-only)                    | V1 Action Required — concrete items only                  | Accepted   |
| [ADR-017](#adr-017--insights-v1--rsswebsite-feed)                              | Insights V1 — RSS/website feed                            | Accepted   |
| [ADR-018](#adr-018--effective-feature-flag-resolution)                         | Effective feature-flag resolution                         | Accepted   |
| [ADR-019](#adr-019--holdings-not-in-salesforce-today)                          | Holdings not in Salesforce today                          | Superseded |
| [ADR-020](#adr-020--emoney-contract-signed-tier-b-candidate)                   | eMoney contract signed (Tier B candidate)                 | Accepted   |
| [ADR-021](#adr-021--phase-1-target-and-milestones)                             | Phase 1 target and milestones                             | Accepted   |
| [ADR-022](#adr-022--phase-1-explicit-exclusions)                               | Phase 1 explicit exclusions                               | Accepted   |
| [ADR-023](#adr-023--neopix-sow-vs-client-integration-boundary)                 | Neopix SOW vs client integration boundary                 | Accepted   |
| [ADR-024](#adr-024--holdings--orion-performance-source)                                    | Holdings / Orion performance source                       | Accepted   |
| [ADR-025](#adr-025--tier-b-and-tier-c-in-neopix-sow)                           | Tier B and Tier C in Neopix SOW                           | Accepted   |
| [ADR-026](#adr-026--householding-and-account-privacy)                          | Householding and account privacy                          | Accepted   |
| [ADR-027](#adr-027--salesforce-client-entity-mapping)                          | Salesforce Client Entity mapping                          | Accepted   |
| [ADR-028](#adr-028--firm-mandatory--toggle-policy)                       | Firm-mandatory / toggle policy                            | Accepted   |
| [ADR-029](#adr-029--home-without-emoney)                                       | Home without eMoney                                       | Accepted   |
| [ADR-030](#adr-030--document-vault-api-path)                                   | Document vault API path                                   | Accepted   |
| [ADR-031](#adr-031--biometric-unlock)                                          | Biometric unlock                                          | Accepted   |
| [ADR-032](#adr-032--push-notifications-scope)                                  | Push notifications scope                                  | Accepted   |
| [ADR-033](#adr-033--ytd-realized-gainloss-card)                                | YTD realized gain/loss card                               | Accepted   |
| [ADR-034](#adr-034--calendly-depth-in-v1)                                      | Calendly depth in V1                                      | Accepted   |
| [ADR-035](#adr-035--multi-household-switcher)                                  | Multi-household switcher                                  | Accepted   |
| [ADR-036](#adr-036--alert-persistence-model)                                   | Alert persistence model                                   | Accepted   |
| [ADR-037](#adr-037--holdings-storage-schema)                                   | Holdings storage schema                                   | Accepted   |
| [ADR-038](#adr-038--net-worth-calculation)                                     | Net worth calculation                                     | Accepted   |
| [ADR-039](#adr-039--client-expense-edit-path)                                  | Client expense edit path                                  | Accepted   |
| [ADR-040](#adr-040--institution-first-emoney-linking)                          | Institution-first eMoney linking                          | Accepted   |
| [ADR-041](#adr-041--manual-held-away-account-entry)                            | Manual held-away account entry                            | Accepted   |
| [ADR-042](#adr-042--account-nickname-write-back)                               | Account nickname write-back                               | Accepted   |
| [ADR-043](#adr-043--real-estate--zillow-home-value)                             | Real estate / Zillow home value                           | Accepted   |
| [ADR-044](#adr-044--orion-portal-parity-for-v1-portfolio)                          | Orion portal parity for V1 Portfolio                      | Accepted   |
| [ADR-045](#adr-045--nav-shell-v1-vs-v2-3-vs-4-tabs)                                        | Nav shell V1 vs V2 (3 vs 4 tabs)                          | Accepted   |
| [ADR-046](#adr-046--mfa-off-for-this-delivery-client-mobile)                                 | MFA off for this delivery (client mobile)                 | Accepted   |
| [ADR-047](#adr-047--advisor-preview-requires-a-web-deliverable-client-surface)               | Advisor preview requires a web-deliverable client surface | Accepted   |


 ADR-003 remains Accepted for Neopix calling Orion Connect live; holdings/performance for this delivery are Salesforce Tier A ([ADR-024](#adr-024--holdings--orion-performance-source)). Tier B/C out of Neopix V1 SOW ([ADR-025](#adr-025--tier-b-and-tier-c-in-neopix-sow)).  
 ADR-041: manual account is **Won't** for this delivery ([PL-12](/05-specs/08-planning/02-specify/#pl-12--add-manual-account)); Phase 2 if write-back is proven.

---



## Accepted decisions

> All ADRs below are Accepted as of discovery lock 2026-07-17. Bodies are in numeric order (ADR-001 … ADR-046).



### ADR-001 — Middleware as the only mobile data plane


|            |                        |
| ---------- | ---------------------- |
| Status | Accepted               |
| Date | 2026-06-30             |
| Owners | Neopix                 |
| Tags | architecture, security |


Context — Direct mobile access to Salesforce, Orion, or eMoney increases attack surface and couples releases to upstream APIs.

Decision — The React Native app calls **only** the middleware REST API. Middleware owns auth, caching, aggregation, and upstream integration.

Consequences — See [architecture.md](/02-architecture/architecture/) §2–3. No Orion credentials in the mobile app. Share middleware storage/cache plan with OnePoint for security review.

---



### ADR-002 — Salesforce Tier A default source


|            |                            |
| ---------- | -------------------------- |
| Status | Accepted                   |
| Date | 2026-06-30                 |
| Owners | Neopix, Callaway, OnePoint |
| Tags | data, salesforce           |


Context — Workshop 4 aligned on SF as system of record for mobile-visible CRM and Orion summary data.

Decision — Middleware ingests via **scheduled Salesforce REST sync** → local cache. Tier A covers identity, accounts, balances, team, feature flags, invite metadata.

Consequences — [architecture.md](/02-architecture/architecture/) §2 (Tier A). Exceptions require a separate ADR (ADR-019, ADR-024, ADR-025).

---



### ADR-003 — No Orion Connect API in Neopix scope


|            |                  |
| ---------- | ---------------- |
| Status | Accepted         |
| Date | 2026-06-30       |
| Owners | Neopix, OnePoint |
| Tags | scope, orion     |


Context — Orion Connect API integration is outside Neopix middleware runtime for this delivery.

Decision — Neopix middleware **does not** call Orion Connect API at request time. For this delivery, Orion data reaches mobile via Salesforce Tier A only ([ADR-024](#adr-024--holdings--orion-performance-source), [ADR-025](#adr-025--tier-b-and-tier-c-in-neopix-sow)). A staged Orion feed into Neopix requires a change order or superseding ADR.

Consequences — [integrations/status.md](/04-integrations/status/) · [orion.md](/04-integrations/orion/). Holdings path: [ADR-024](#adr-024--holdings--orion-performance-source).

---



### ADR-004 — Daily data cadence and "data as of"


|            |                   |
| ---------- | ----------------- |
| Status | Accepted          |
| Date | 2026-06-30        |
| Owners | Callaway, Product |
| Tags | data, ux          |


Context — Orion/eMoney data in SF updates roughly once per day.

Decision — Financial screens show **"data as of"** timestamp. No pull-to-refresh for live Orion intraday data in V1.

Consequences — All financial stories in pack specifies; `GET /meta/data-as-of`.

---



### ADR-005 — Platform feature flags vs Salesforce configurable options


|            |                  |
| ---------- | ---------------- |
| Status | Accepted         |
| Date | 2026-06-30       |
| Owners | Neopix, Callaway |
| Tags | configuration    |


Context — Neopix distinguished code-level rollout from per-client visibility.

Decision — **Feature flags** = what is deployed and vetted (01-platform/config). **Configurable options** = what each client sees (Salesforce, Callaway LWC). New platform capabilities ship **disabled** until admin enables.

Consequences — [03-configuration/02-specify.md](/05-specs/03-configuration/02-specify/) **CFG-01**; [resolution.md](/05-specs/03-configuration/05-contracts/resolution/).

---



### ADR-006 — All advisor and admin configuration in Salesforce


|            |                           |
| ---------- | ------------------------- |
| Status | Accepted                  |
| Date | 2026-06-30                |
| Owners | Neopix, Callaway          |
| Tags | configuration, salesforce |


Context — Avoid a second admin SPA; advisors already work in SF.

Decision — Per-client options, book defaults, bulk admin toggles, client-view preview, and invite action live in **Salesforce LWC**. Preview uses iframe to middleware-hosted client view.

Consequences — [03-configuration/01-overview.md](/05-specs/03-configuration/01-overview/). No separate admin web app. Preview iframe target: [ADR-047](#adr-047--advisor-preview-requires-a-web-deliverable-client-surface).

---



### ADR-007 — Okta invite via middleware


|            |                  |
| ---------- | ---------------- |
| Status | Accepted         |
| Date | 2026-06-30       |
| Owners | Neopix, Callaway |
| Tags | identity         |


Context — Invite-only access; no self-sign-up.

Decision — Advisor triggers **Invite to client portal** in SF → `POST /invites` → middleware provisions Okta user and sends email. Chain: Okta ↔ middleware ↔ SF Person Account. Person Account **PersonEmail** = Okta username.

Consequences — [02-specify.md](/05-specs/02-users/02-specify/) A-01, C-01.

---



### ADR-008 — Middleware on OnePoint Azure


|            |                  |
| ---------- | ---------------- |
| Status | Accepted         |
| Date | 2026-06-30       |
| Owners | Neopix, OnePoint |
| Tags | hosting          |


Context — CISO preference; client owns production infra.

Decision — Neopix builds middleware; **OnePoint hosts** on Azure (likely). Client owns App Store, SSL, Okta tenant.

Consequences — [architecture.md](/02-architecture/architecture/) §3 (ownership / hosting).

---



### ADR-009 — Portfolio Orion-only; Planning eMoney-only


|            |                  |
| ---------- | ---------------- |
| Status | Accepted         |
| Date | 2026-07-06       |
| Owners | Neopix, OnePoint |
| Tags | product, ux      |


Context — Workshop 6 separated advisory AUM from planning/held-away picture.

Decision — **Portfolio** = Orion-managed AUM (label may say OnePoint Portfolio / Powered by Orion for attribution — **do not brand eMoney vs Orion as separate products to clients**). **Planning** = eMoney-powered; **entire tab hidden** when client has no eMoney plan. Prefer **3 primary tabs** (Portfolio / Planning / …) over splitting “My Finances” + “Financial Plan”. Planning → Accounts = client-linked / held-away aggregation only (not Orion accounts).

Consequences — [07-portfolio/02-specify.md](/05-specs/07-portfolio/02-specify/), [08-planning/02-specify.md](/05-specs/08-planning/02-specify/), [ADR-029](#adr-029--home-without-emoney).

---



### ADR-010 — Dual allocation scopes


|            |                                   |
| ---------- | --------------------------------- |
| Status | Accepted                          |
| Date | 2026-07-06 · clarified 2026-07-10 |
| Owners | Neopix, OnePoint                  |
| Tags | data, ux                          |


Context — Orion subset vs full financial picture serve different questions. eMoney vs Orion **asset-class taxonomies do not match**; aligning is a large eMoney config project (Workshop 9).

Decision — Two calculations and **two separate allocation charts**: `portfolio_orion` (Portfolio + Home teaser) and `planning_combined` (Planning + Home net worth when planning enabled). **Never marry / remap** Orion and eMoney allocation categories into one taxonomy (OnePoint: “not ever try to marry them”).

Consequences — [data-model.md](/03-data/data-model/); [07-portfolio/02-specify.md](/05-specs/07-portfolio/02-specify/) **P-02**; [08-planning/02-specify.md](/05-specs/08-planning/02-specify/) **PL-03**; [architecture.md §2](/02-architecture/architecture/#2-data-plane).

---



### ADR-011 — Orion wins on duplicate account numbers


|            |                                 |
| ---------- | ------------------------------- |
| Status | Accepted                        |
| Date | 2026-07-06 · refined 2026-07-10 |
| Owners | Neopix, OnePoint                |
| Tags | data                            |


Context — Orion and eMoney may both reference the same account. Workshop 9 prefers filtering eMoney accounts by **under management / not under management** rather than only account-number cross-ref.

Decision — When account numbers match, **Orion is authoritative** for balances/holdings. Into Planning/NW, sync **held-away / not under management** eMoney accounts (and other eMoney fact types per [ADR-038](#adr-038--net-worth-calculation)). Prefer **under-management flag** when available. Never double-count.

Consequences — Middleware aggregation in [architecture.md](/02-architecture/architecture/) §2; [08-planning/02-specify.md](/05-specs/08-planning/02-specify/) Accounts tab.

---



### ADR-012 — No eMoney gauge embeds


|            |                    |
| ---------- | ------------------ |
| Status | Accepted           |
| Date | 2026-07-06         |
| Owners | Workshop consensus |
| Tags | ux, emoney         |


Context — Embedded eMoney gauges conflict with Orion-first presentation.

Decision — Rebuild allocation and planning UI in React Native; **no eMoney gauge embeds** in V1.

Consequences — [08-planning/02-specify.md](/05-specs/08-planning/02-specify/); custom charts only.

---



### ADR-013 — Roles and surfaces


|            |            |
| ---------- | ---------- |
| Status | Accepted   |
| Date | 2026-06-29 |
| Owners | OnePoint   |
| Tags | roles      |


Context — Workshop 3 defined who uses which surface.

Decision — Client: Okta → mobile app. Advisor: Salesforce only — per-client options + preview; no mobile login. Administrator: SF bulk toggles + optional **login-as-client** on native app with audit. **No advisor-facing mobile app.**

Consequences — [02-specify.md](/05-specs/02-users/02-specify/), [03-configuration/02-specify.md](/05-specs/03-configuration/02-specify/). Preview surface: [ADR-047](#adr-047--advisor-preview-requires-a-web-deliverable-client-surface).

---



### ADR-014 — Feature configuration hierarchy


|            |                  |
| ---------- | ---------------- |
| Status | Accepted         |
| Date | 2026-06-29       |
| Owners | Neopix, OnePoint |
| Tags | configuration    |


Context — Who can turn what on for whom.

Decision — (1) Firm mandatory always on. (2) Admin enables across advisor book; new features default off. (3) Advisor per-household overrides only. (4) Book transfer → defaults follow new primary advisor.

Consequences — [03-configuration/02-specify.md](/05-specs/03-configuration/02-specify/) **CFG-03**. Firm-mandatory list: [ADR-028](#adr-028--firm-mandatory--toggle-policy).

---



### ADR-015 — Home as neutral summary hub


|            |            |
| ---------- | ---------- |
| Status | Accepted   |
| Date | 2026-06-29 |
| Owners | OnePoint   |
| Tags | ux         |


Context — Avoid investments-first landing; equal access to all domains.

Decision — Home is a **summary hub** — greeting, shortcuts to Portfolio/Planning/Docs/Team/Insights, teasers, Action Required. Clarity, simplicity, warmth. Human support (Team) visible, not buried.

Consequences — [04-home/01-overview.md](/05-specs/04-home/01-overview/), [05-my-team/02-specify.md](/05-specs/05-my-team/02-specify/).

---



### ADR-016 — V1 Action Required — concrete items only


|            |                  |
| ---------- | ---------------- |
| Status | Accepted         |
| Date | 2026-06-29       |
| Owners | Neopix, OnePoint |
| Tags | alerts           |


Context — Clients asked for actionable tasks, not vague feeds.

Decision — Action Required **Must** types: pending signatures, broken linked accounts, profile proposal decided. **Should** (with Users **C-08**): missing required SF fields. **Should**: planning data updated notice. Won't: goal to-dos, advisor activity feed, journey timeline, money-movement alerts, payments schedule, OS push.

Consequences — [10-alerts/02-specify.md](/05-specs/10-alerts/02-specify/) AR-04–AR-07 Must/Should; AR-10 Should; AR-11–AR-14 Won't.

---



### ADR-017 — Insights V1 — RSS/website feed


|            |                                     |
| ---------- | ----------------------------------- |
| Status | Accepted                            |
| Date | 2026-07-06 · reconfirmed 2026-07-09 |
| Owners | Neopix, OnePoint                    |
| Tags | insights                            |


Context — CMS not ready; need simple V1 content path.

Decision — V1 = external insights feed (typically RSS/Atom or JSON from the firm website), same for all clients. Middleware normalizes into a standardized feed document then `InsightArticle` ([06-insights/05-contracts/feed.md](/05-specs/06-insights/05-contracts/feed/)). V2 = per-client preferences + agentic selection. Salesforce is not the V1 content CMS.

Consequences — [06-insights/02-specify.md](/05-specs/06-insights/02-specify/), [06-insights/05-contracts/](/05-specs/06-insights/05-contracts/feed/).

---



### ADR-018 — Effective feature-flag resolution


|            |                  |
| ---------- | ---------------- |
| Status | Accepted         |
| Date | 2026-06-30       |
| Owners | Neopix, Callaway |
| Tags | configuration    |


Context — Two layers must compose predictably.

Decision — `effective = platform_feature_flags ∩ firm_mandatory ON ∩ admin_advisor_book_defaults ∩ advisor_household_overrides`. Middleware computes on `/me`; mobile does not merge locally.

Consequences — [03-configuration/02-specify.md](/05-specs/03-configuration/02-specify/) **CFG-01**; [resolution.md](/05-specs/03-configuration/05-contracts/resolution/).

---



### ADR-019 — Holdings not in Salesforce today


|            |                  |
| ---------- | ---------------- |
| Status | Superseded       |
| Date | 2026-07-06       |
| Owners | OnePoint         |
| Tags | data, salesforce |


Context — Workshop 6 SF discovery; sandbox holdings empty.

Decision — Position-level holdings were not synced to SF at discovery; account list + summary balances were. Replaced by [ADR-024](#adr-024--holdings--orion-performance-source).

Consequences — See [ADR-024](#adr-024--holdings--orion-performance-source). Client owns SF data quality ([ADR-023](#adr-023--neopix-sow-vs-client-integration-boundary)).

---



### ADR-020 — eMoney contract signed (Tier B candidate)


|            |                                 |
| ---------- | ------------------------------- |
| Status | Accepted                        |
| Date | 2026-07-06 · refined 2026-07-10 |
| Owners | OnePoint                        |
| Tags | emoney, scope                   |


Context — Planning features need eMoney data beyond SF sync.

Decision — eMoney contract **signed Jul 6**. **eMoney fields sync into Salesforce**, then middleware reads SF (Tier A) for planning facts. Direct middleware eMoney API (Tier B) is **out of Neopix V1 SOW** ([ADR-025](#adr-025--tier-b-and-tier-c-in-neopix-sow)). Prefer **field-level sync** over consuming eMoney reports as the primary mobile path. WebView remains for link/relink.

Consequences — [08-planning/01-overview.md](/05-specs/08-planning/01-overview/); [integrations/status.md](/04-integrations/status/).

---



### ADR-021 — Phase 1 target and milestones


|            |            |
| ---------- | ---------- |
| Status | Accepted   |
| Date | 2026-06-29 |
| Owners | Neopix     |
| Tags | delivery   |


Context — Phase 1 milestones committed for fly-in and pilot.

Decision — V1 = production-ready MVP for **October 2026 pilot**. **Late September 2026** = advisor fly-in demo (production-quality screens). End 2026 = broader rollout target.

Consequences — [05-specs/README.md](/05-specs/readme/) sequencing · Pilot bar: [prd.md §5.1](/product/prd/#51-pilot-definition-of-done).

---



### ADR-022 — Phase 1 explicit exclusions


|            |                  |
| ---------- | ---------------- |
| Status | Accepted         |
| Date | 2026-07-07       |
| Owners | Neopix, OnePoint |
| Tags | scope            |


Context — Prevent scope creep from prototype and client wish-list.

Decision — Phase 1 excludes: Orion Connect live from Neopix, DocuSign in-app signing, full Profile/suitability auto-commit edit, advisor mobile app, chat/messaging, journey timeline, money-movement alerts, payments schedule, refer-a-friend (design may proceed; ship later), Jiffy / digital intake, eMoney gauge embeds, full eMoney platform breadth, client analytics, Orion transactions / cost basis. DocuSign this delivery = list + alert only (in-app signing Won't).

Profile: clients propose field changes for staff review/approve — not unrestricted self-edit ([02-users/02-specify.md](/05-specs/02-users/02-specify/) C-07, A-09, C-25 Must; C-08 / AR-06 Should). Portfolio portal extras deferred to [ADR-044](#adr-044--orion-portal-parity-for-v1-portfolio).

Consequences — Each specify Out of scope section; Phase 2 in [05-specs/README.md](/05-specs/readme/#phase-2-post-v1) (includes indicative Cost). Client / product analytics: Won't this delivery — obligations and UX implications in [architecture §10.10](/02-architecture/architecture/#1010-product--user-analytics-wont); indicative Cost [P2-06](/05-specs/readme/#phase-2-post-v1). Do not confuse with required ops signals ([architecture §9.7](/02-architecture/architecture/#97-ops-signals-required-vendor-phase-b)).

---



### ADR-023 — Neopix SOW vs client integration boundary


|            |            |
| ---------- | ---------- |
| Status | Accepted   |
| Date | 2026-06-30 |
| Owners | Neopix     |
| Tags | scope      |


Context — Workshop 4 ownership boundary between Neopix delivery and client/Callaway integrations.

Decision — Neopix SOW: mobile app, UI/UX design (Figma), middleware, SF REST sync, Okta (middleware), field gap analysis. Client/Callaway own: Orion API, SF↔Orion data accuracy, supplemental SF hydration, insights content/platform build-out. Assumption: Salesforce Tier A data is accurate for mobile display; accuracy of Orion→SF sync is outside Neopix runtime. Neopix authors the design system and screens. Material UX changes need Neopix design change control + client re-approval.

Consequences — [integrations/status.md](/04-integrations/status/).

---



### ADR-024 — Holdings / Orion performance source


|            |                                  |
| ---------- | -------------------------------- |
| Status | Accepted                         |
| Date | 2026-07-06 · accepted 2026-07-17 |
| Owners | Neopix, OnePoint                 |
| Tags | data, portfolio, orion           |


Context — Holdings often absent from SF sandbox. Portfolio packs lock Salesforce-only reads for this delivery ([ADR-019](#adr-019--holdings-not-in-salesforce-today) superseded).

Decision — For this delivery, **holdings and account performance come from Salesforce (Tier A)** only. Neopix does **not** call Orion Connect live ([ADR-003](#adr-003--no-orion-connect-api-in-neopix-scope)). Client-side Orion→AWS staging / Tier C is **out of Neopix V1 SOW** ([ADR-025](#adr-025--tier-b-and-tier-c-in-neopix-sow)). Missing SF rows → `unavailable` / empty list — do not invent holdings. Tax-lot drill-down remains Won't ([P-08](/05-specs/07-portfolio/02-specify/)).

Consequences — [07-portfolio/05-contracts/salesforce.md](/05-specs/07-portfolio/05-contracts/salesforce/); [ADR-037](#adr-037--holdings-storage-schema).

---



### ADR-025 — Tier B and Tier C in Neopix SOW


|            |                                  |
| ---------- | -------------------------------- |
| Status | Accepted                         |
| Date | 2026-07-06 · accepted 2026-07-17 |
| Owners | Neopix                           |
| Tags | scope, emoney, orion             |


Context — Original SOW was Tier A (SF sync) only. eMoney contract signed; Orion holdings staging was explored.

Decision — **Tier B (direct eMoney API reads) and Tier C (Orion holdings staging) are out of Neopix V1 SOW.** Planning facts via SF sync where possible; link/relink via eMoney WebView; documents via VaultProvider. Direct Orion/eMoney API work requires a **change order**.

Consequences — Do not implement Tier B/C without CO. [ADR-023](#adr-023--neopix-sow-vs-client-integration-boundary); [ADR-020](#adr-020--emoney-contract-signed-tier-b-candidate).

---



### ADR-026 — Householding and account privacy


|            |                                                   |
| ---------- | ------------------------------------------------- |
| Status | Accepted                                          |
| Date | 2026-07-06 · accepted 2026-07-17 (build fallback) |
| Owners | OnePoint, OnePoint compliance                     |
| Tags | compliance, data                                  |


Context — Today all household members see all accounts. Compliance may later require per-person visibility.

Decision — Build fallback Accepted: household-wide visibility of Orion FAs under the CRM parent. Per-person FAR filtering is **out of this delivery** until compliance publishes rules (Phase 2).

Controls (compensating — this delivery) — See [architecture §9.5](/02-architecture/architecture/#95-compensating-controls-accepted-risk-adrs). Risk acceptance: OnePoint compliance.

Consequences — [07-portfolio/01-overview.md](/05-specs/07-portfolio/01-overview/) account visibility; [data-model.md](/03-data/data-model/) FAR deferred.

---



### ADR-027 — Salesforce Client Entity mapping


|            |                                                   |
| ---------- | ------------------------------------------------- |
| Status | Accepted                                          |
| Date | 2026-07-06 · accepted 2026-07-17 (build fallback) |
| Owners | Callaway, OnePoint                                |
| Tags | salesforce, data-model                            |


Context — FA primary owner is Client Entity (Orion child Account), not Person Account. Traverse parent → client entities → FAs.

Decision — Build fallback Accepted: use the observed hierarchy from the SF sandbox export — parent CRM Account → Client Entity children → Financial Accounts. Middleware entity model follows [data-model.md](/03-data/data-model/) § Salesforce hierarchy. Refine field names if FSC walkthrough differs; do not block build.

Consequences — [07-portfolio/05-contracts/salesforce.md](/05-specs/07-portfolio/05-contracts/salesforce/); [data-model.md](/03-data/data-model/).

---



### ADR-028 — Firm-mandatory / toggle policy


|            |                                                   |
| ---------- | ------------------------------------------------- |
| Status | Accepted                                          |
| Date | 2026-06-29 · accepted 2026-07-17 (build fallback) |
| Owners | OnePoint                                          |
| Tags | configuration, compliance                         |


Context — Some features may become non-disableable; compliance may require same UX for same service. Firm-mandatory key list not published.

Decision — Build fallback Accepted: ship the CFG resolution mechanism ([ADR-014](#adr-014--feature-configuration-hierarchy), [ADR-018](#adr-018--effective-feature-flag-resolution)). **No keys are firm-mandatory** for this delivery except platform defaults (new capabilities ship **disabled**). Household/advisor overrides remain allowed per catalog. Compliance may publish a mandatory list later without changing the mechanism — promote keys then.

Consequences — [03-configuration/02-specify.md](/05-specs/03-configuration/02-specify/) **CFG-03** / **CFG-04**; [ADR-033](#adr-033--ytd-realized-gainloss-card) stays flag-gated.

---



### ADR-029 — Home without eMoney


|            |                  |
| ---------- | ---------------- |
| Status | Accepted         |
| Date | 2026-07-09       |
| Owners | Neopix, OnePoint |
| Tags | ux               |


Context — Clients without eMoney still have Orion portfolio. No liabilities without eMoney → no meaningful net worth.

Decision — When `planning_enabled` is false / no eMoney plan: **hide** Planning tab, Home net worth, and planning allocation. Show Orion portfolio allocation teaser only; Home deep-links to Portfolio. Prefer 3-tab shell without Planning.

Consequences — [08-planning/02-specify.md](/05-specs/08-planning/02-specify/) PL-01; [04-home/01-overview.md](/05-specs/04-home/01-overview/); [ADR-009](#adr-009--portfolio-orion-only-planning-emoney-only).

---



### ADR-030 — Document vault API path


|            |                                  |
| ---------- | -------------------------------- |
| Status | Accepted                         |
| Date | 2026-07-07 · accepted 2026-07-17 |
| Owners | Neopix, Callaway, OnePoint       |
| Tags | documents, emoney                |


Context — Prototype labels eMoney Vault / DocuSign. Firm may later move vault product.

Decision — This delivery uses **eMoney Vault** via middleware **VaultProvider** ([vault.md](/05-specs/09-documents/05-contracts/vault/)) — ADR-002 exception for document binary/metadata. In-app DocuSign remains Won't. If vault product changes, swap the adapter; mobile API stays stable.

Consequences — [09-documents/01-overview.md](/05-specs/09-documents/01-overview/); DOC-01–DOC-07 Must; DOC-08 Won't.

---



### ADR-031 — Biometric unlock


|            |                                  |
| ---------- | -------------------------------- |
| Status | Accepted                         |
| Date | 2026-07-07 · accepted 2026-07-17 |
| Owners | OnePoint                         |
| Tags | security                         |


Context — Face ID / fingerprint nice-to-have for re-auth convenience.

Decision — **Won't** for this delivery. Unlock uses password / existing session only ([C-23](/05-specs/02-users/02-specify/#c-23--unlock-with-biometrics) Won't).

Consequences — [11-release/01-overview.md](/05-specs/11-release/01-overview/); Phase 2 candidate.

---



### ADR-032 — Push notifications scope


|            |                                  |
| ---------- | -------------------------------- |
| Status | Accepted                         |
| Date | 2026-07-07 · accepted 2026-07-17 |
| Owners | OnePoint                         |
| Tags | notifications                    |


Context — Client survey wants messaging; push useful for alerts and insights.

Decision — **Won't** OS push (APNs/FCM) for this delivery. Notification surface = **in-app bell badge** counting Action Required ([AR-01](/05-specs/10-alerts/02-specify/#ar-01--see-the-notification-badge)). Push preference UI (**C-10**) is also **Won't** — no opt-in record without OS push. APNs/FCM is Phase 2 ([P2-03](/05-specs/readme/#phase-2-post-v1)).

Consequences — AR-14 / C-16 / IC-04 / DOC-10 / C-10 Won't.

---



### ADR-033 — YTD realized gain/loss card


|            |                                  |
| ---------- | -------------------------------- |
| Status | Accepted                         |
| Date | 2026-07-07 · accepted 2026-07-17 |
| Owners | OnePoint                         |
| Tags | portfolio, configuration         |


Context — Portfolio summary card; may become firm-mandatory later.

Decision — Ship **flag-gated** via `portfolio_ytd_realized_gl`. Not firm-mandatory this delivery ([ADR-028](#adr-028--firm-mandatory--toggle-policy)). Omit the card when flag false or value unavailable ([P-01](/05-specs/07-portfolio/02-specify/)).

Consequences — [07-portfolio/02-specify.md](/05-specs/07-portfolio/02-specify/) **P-01**; CFG-04 catalog.

---



### ADR-034 — Calendly depth in V1


|            |            |
| ---------- | ---------- |
| Status | Accepted   |
| Date | 2026-07-09 |
| Owners | OnePoint   |
| Tags | team       |


Context — Prototype shows per-member meeting types; Zoom/phone configured in Calendly.

Decision — V1 = **provider-agnostic deep-link / WebView** for availability ([05-my-team/05-contracts/scheduling.md](/05-specs/05-my-team/05-contracts/scheduling/)). **Calendly** is the V1 adapter. Meeting type (Zoom vs phone) is configured in the provider, not custom app logic. Hide **Schedule** when member has no scheduling ability (advisor-configured SF attribute / mapping). Full provider API / embedded widget enhancement is optional later. Replacing Calendly must not require mobile schema changes if the new provider supplies HTTPS booking URLs.

Consequences — [05-my-team/02-specify.md](/05-specs/05-my-team/02-specify/) **MT-03**; `team_scheduling` flag; OpenAPI `schedulingUrl`.

---



### ADR-035 — Multi-household switcher


|            |                                  |
| ---------- | -------------------------------- |
| Status | Accepted                         |
| Date | 2026-07-07 · accepted 2026-07-17 |
| Owners | Callaway                         |
| Tags | data-model, ux                   |


Context — Person may link to multiple child households (N > 1).

Decision — **Won't** in-app household switcher this delivery ([C-22](/05-specs/02-users/02-specify/#c-22--switch-active-household) Won't). Session scoped to the authenticated user's **primary / active** permitted household (`ClientUser.active_household_id`). Multi-household UX is Phase 2.

Consequences — `/me` household graph may list children for future use; UI does not switch.

---



### ADR-036 — Alert persistence model


|            |                                  |
| ---------- | -------------------------------- |
| Status | Accepted                         |
| Date | 2026-07-07 · accepted 2026-07-17 |
| Owners | Neopix                           |
| Tags | data-model, alerts               |


Context — Alerts may be computed at read time or stored. Workshop 8: advisors want custom Action Required items.

Decision — **Virtual compute at read time** for Must/Should alert types this delivery ([computation.md](/05-specs/10-alerts/05-contracts/computation/)). Dismiss state for informational alerts may be stored in middleware. **Advisor-authored** persisted Action Required items are **Won't** until a follow-up ADR ([ADR-016](#adr-016--v1-action-required--concrete-items-only)).

Consequences — [10-alerts/01-overview.md](/05-specs/10-alerts/01-overview/).

---



### ADR-037 — Holdings storage schema


|            |                                  |
| ---------- | -------------------------------- |
| Status | Accepted                         |
| Date | 2026-07-07 · accepted 2026-07-17 |
| Owners | Neopix                           |
| Tags | data-model, portfolio            |


Context — Depends on ADR-024 source choice (now SF Tier A).

Decision — Middleware exposes **normalized** `Holding` **rows** mapped from Salesforce position/holding fields ([data-model.md](/03-data/data-model/) §3.4). Do not ship opaque `SFEntitySnapshot` JSON as the mobile holdings contract.

Consequences — [07-portfolio/02-specify.md](/05-specs/07-portfolio/02-specify/) **P-06**; OpenAPI holdings schema.

---



### ADR-038 — Net worth calculation


|            |                            |
| ---------- | -------------------------- |
| Status | Accepted                   |
| Date | 2026-07-10                 |
| Owners | Neopix, Callaway, OnePoint |
| Tags | data, planning             |


Context — eMoney displays net worth that may not match an Orion-first mobile composition. Insurance cash value can count toward NW; death benefit does not.

Decision — Middleware computes net worth for Planning/Home as:

```
total_assets  = Σ Orion managed accounts
              + Σ eMoney held-away / external accounts (not under mgmt)
              + insurance cash value (if present)
              + real estate / home value when synced ([ADR-043](#adr-043--real-estate--zillow-home-value))
total_liabilities = eMoney liability figures (mortgages, loans, etc.)
net_worth = total_assets − total_liabilities
```

Do not trust eMoney’s displayed NW totals as the source of truth. Recalculate from accounts + facts synced via SF (Tier A). Home value is included when the eMoney→SF field is present ([ADR-043](#adr-043--real-estate--zillow-home-value)).

Consequences — [08-planning/02-specify.md](/05-specs/08-planning/02-specify/) PL-02; [architecture.md §2](/02-architecture/architecture/#2-data-plane); [data-model.md](/03-data/data-model/).

---



### ADR-039 — Client expense edit path


|            |                                  |
| ---------- | -------------------------------- |
| Status | Accepted                         |
| Date | 2026-07-10 · accepted 2026-07-17 |
| Owners | Callaway, OnePoint               |
| Tags | planning, ux                     |


Context — Expense changes are advisor-collaboration territory for this delivery.

Decision — **Won't** in-app expense edit this delivery. Expenses are **read-only** ([PL-06](/05-specs/08-planning/02-specify/) Must; [PL-13](/05-specs/08-planning/02-specify/#pl-13--edit-expenses-in-app) Won't). Contact-advisor CTA for plan changes is allowed in UX copy. Phase 2 if write-back is proven.

Consequences — [08-planning/02-specify.md](/05-specs/08-planning/02-specify/).

---



### ADR-040 — Institution-first eMoney linking


|            |                      |
| ---------- | -------------------- |
| Status | Accepted             |
| Date | 2026-07-14           |
| Owners | Neopix, OnePoint     |
| Tags | planning, emoney, ux |


Context — eMoney aggregation connects via institution, then the client selects accounts to pull.

Decision — Planning → Accounts linking is **institution-first** via eMoney API / hosted flow:

1. Client searches institutions (search bar required; show a short **most popular** list under search so users know the catalog is larger).
2. Client authenticates at the institution.
3. Client selects accounts to link; accounts sync into eMoney → SF → middleware.
4. Linked account rows **must show institution name** (clients refer to “my Fidelity / Wells Fargo account”).
5. Relink / broken-connection flows remain on the same path.

Consequences — [08-planning/02-specify.md](/05-specs/08-planning/02-specify/) PL-08 / PL-09 / PL-10; [data-model.md](/03-data/data-model/) `LinkedExternalAccount`; [ADR-041](#adr-041--manual-held-away-account-entry), [ADR-042](#adr-042--account-nickname-write-back).

---



### ADR-041 — Manual held-away account entry


|            |                                                  |
| ---------- | ------------------------------------------------ |
| Status | Accepted                                         |
| Date | 2026-07-14 · updated 2026-07-17 (discovery lock) |
| Owners | Neopix, OnePoint                                 |
| Tags | planning, emoney                                 |


Context — eMoney supports adding accounts without a live feed (name, value, where held, last updated). Useful for private equity / one-offs. Write-back to eMoney/SF unproven for this delivery.

Decision — **Won't** for this delivery. Manual held-away entry is a Phase 2 candidate **if** middleware can write the fact back to eMoney (or SF sync mirrors it). Until then, clients use **Link institution** only ([ADR-040](#adr-040--institution-first-emoney-linking)).

Consequences — [08-planning/02-specify.md](/05-specs/08-planning/02-specify/) **PL-12** Won't; `LinkedExternalAccount.is_manual` retained in [data-model.md](/03-data/data-model/) for future use.

---



### ADR-042 — Account nickname write-back


|            |                                  |
| ---------- | -------------------------------- |
| Status | Accepted                         |
| Date | 2026-07-14 · accepted 2026-07-17 |
| Owners | Neopix, OnePoint                 |
| Tags | planning, emoney, api            |


Context — Clients rename accounts in eMoney today; in-app rename desired; API write-back unconfirmed.

Decision — **Won't** nickname write-back this delivery ([PL-14](/05-specs/08-planning/02-specify/#pl-14--edit-linked-account-nickname) Won't). Display `nickname` when present ([PL-08](/05-specs/08-planning/02-specify/)). Phase 2 if bidirectional sync is confirmed.

Consequences — `LinkedExternalAccount.nickname` read-only in API.

---



### ADR-043 — Real estate / Zillow home value


|            |                                  |
| ---------- | -------------------------------- |
| Status | Accepted                         |
| Date | 2026-07-14 · accepted 2026-07-17 |
| Owners | Callaway, OnePoint               |
| Tags | planning, emoney, net-worth      |


Context — eMoney can pull home value; OnePoint wants it in net worth when available.

Decision — **Include home-value in middleware net-worth composition when the fact is synced** from eMoney→SF ([ADR-038](#adr-038--net-worth-calculation)). No dedicated Zillow / real-estate UI surface this delivery — value rolls into assets / NW totals only. Absent field → omit (do not invent).

Consequences — [08-planning/02-specify.md](/05-specs/08-planning/02-specify/) **PL-02**; SF field map when available.

---



### ADR-044 — Orion portal parity for V1 Portfolio


|            |                                 |
| ---------- | ------------------------------- |
| Status | Accepted                        |
| Date | 2026-07-14 · updated 2026-07-17 |
| Owners | Neopix, OnePoint                |
| Tags | portfolio, orion, scope         |


Context — Orion portal has richer surfaces (transactions, benchmarks, activity) than Phase 1 needs. Holdings list rows remain in scope; tax-lot detail stays out.

Decision — Phase 1 Portfolio sticks to prototype scope: household/account summary, YTD (flag-gated), allocation by category and class, managed accounts, account summary / performance / holdings. Orion portal extras (transactions/activities, benchmarks, activity summary, portfolio vs net invested as separate cards) are Won't for this delivery.

Consequences — [07-portfolio/02-specify.md](/05-specs/07-portfolio/02-specify/) Won't **P-08–P-10**; [ADR-022](#adr-022--phase-1-explicit-exclusions); [ADR-024](#adr-024--holdings--orion-performance-source).

---



### ADR-045 — Nav shell V1 vs V2 (3 vs 4 tabs)


|            |                                  |
| ---------- | -------------------------------- |
| Status | Accepted                         |
| Date | 2026-07-14 · accepted 2026-07-17 |
| Owners | OnePoint                         |
| Tags | ux, navigation                   |


Context — Design explored 3-page vs 4-page shells for the Phase 1 freeze.

Decision — **Ship the Figma shell as frozen for this delivery.** When Planning is hidden, prefer the **3-tab** shell ([ADR-029](#adr-029--home-without-emoney)). **Profile remains reachable** when `profile_enabled` regardless of tab count ([C-05](/05-specs/02-users/02-specify/)). Tab chrome is not a Must story — domain packages define content.

Consequences — [04-home/01-overview.md](/05-specs/04-home/01-overview/); Figma is layout authority for build ([AGENTS.md](/agents/)).

### ADR-046 — MFA off for this delivery (client mobile)


|            |                           |
| ---------- | ------------------------- |
| Status | Accepted                  |
| Date | 2026-07-15                |
| Owners | OnePoint / Neopix         |
| Tags | identity, security, scope |


Context — Client MFA policy was unresolved; identity stories cannot leave MFA as an unspoken gap. Wealth mobile access is invite-only via Okta.

Decision — For this delivery, **Okta MFA is not enforced** on client mobile login, invite accept, or password flows. [02-specify.md](/05-specs/02-users/02-specify/) **C-21** remains Won't. Revisit when firm MFA policy requires enrollment; then promote C-21 and update Okta factors.

Controls (compensating — this delivery) — See [architecture §9.5](/02-architecture/architecture/#95-compensating-controls-accepted-risk-adrs). Risk acceptance: OnePoint security (with Neopix).

Consequences — No MFA challenge UX in V1 mobile; security relies on the compensating controls above, not on MFA.

### ADR-047 — Advisor preview requires a web-deliverable client surface


|            |                                            |
| ---------- | ------------------------------------------ |
| Status | Accepted                                   |
| Date | 2026-07-19                                 |
| Owners | Neopix, Callaway                           |
| Tags | configuration, salesforce, scope, delivery |


Context — [ADR-006](#adr-006--all-advisor-and-admin-configuration-in-salesforce) and CFG-02 put client-view preview in a Salesforce LWC iframe. The production client is React Native; a native binary cannot be embedded in Lightning.

Decision — Preview is a Neopix-hosted web client surface. Salesforce obtains a short-lived household-scoped session ([E03 OpenAPI](/05-specs/03-configuration/05-contracts/openapi/)) and iframes `previewUrl`. The web client uses the same `/api/v1` APIs and effective-flag resolution as mobile (E03 NFR-04).

Pilot minimum: flag-accurate shell from `/me` + `/home`. Closer screen parity (e.g. RN Web / Expo web) is a follow-on workstream unless OnePoint waives visual parity. Admin device impersonation (AD-03) is not a substitute.

Out: Embedding the iOS/Android binary in Salesforce; a second full admin SPA.

Consequences — Neopix: preview host + `preview-session` + AuthZ. Callaway: LWC iframe. CFG-02 delivery includes the preview web surface alongside mobile. [E03](/05-specs/03-configuration/01-overview/) · [architecture §5](/02-architecture/architecture/#5-identity) · [tech-spec-proposal](/06-engineering/tech-spec-proposal/).

---



## Operational tracking

Pending deliverables (not ADRs) live only in **[04-integrations/status.md](/04-integrations/status/)**. Do not duplicate blocker tables here.

Closed at discovery lock (2026-07-17): ADR-001–046 Accepted; Tier B/C out of Neopix V1 SOW; nav shell = Figma freeze; biometrics / push / multi-HH switcher / expense edit / nickname / manual account / MFA = Won't this delivery.  
Post-lock: ADR-047 Accepted (advisor preview web surface).

---



## Client survey context

Workshop 3 survey → V1 mapping is summarized in [prd.md](/product/prd/) (product map + out of scope). Raw workshop notes remain **external resources** (source trail).

---



## Implementation start

Build from Accepted ADRs and locked specifies — see **[READY.md](/ready/)**.

Changes during delivery: route via Neopix change control; update constitution ADR (and PRD if the product story changes) before changing behaviour.