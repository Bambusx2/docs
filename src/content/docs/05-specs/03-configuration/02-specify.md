---
title: "E03 Configuration & App Shell — Specification"
---

> Scope: Platform feature flags and Salesforce configurable options that gate tabs, More entries, and Home teasers; advisor/admin tooling in Salesforce (no separate admin SPA); domain option catalog (CFG-04).  
> Source trail: Workshops 4, 3, 6 (external) · [data-model.md §2](/03-data/data-model/) · [ADR-005](/01-constitution/constitution/#adr-005--platform-feature-flags-vs-salesforce-configurable-options) · [ADR-006](/01-constitution/constitution/#adr-006--all-advisor-and-admin-configuration-in-salesforce) · [ADR-014](/01-constitution/constitution/#adr-014--feature-configuration-hierarchy) · [ADR-018](/01-constitution/constitution/#adr-018--effective-feature-flag-resolution) · [ADR-028](/01-constitution/constitution/#adr-028--firm-mandatory--toggle-policy)
> Spec version: 1.0.0 · Last updated: July 17, 2026
> Discovery package: [01-overview.md](/05-specs/03-configuration/01-overview/) (constraints, acceptance demo)  
> Delivery rules: [AGENTS.md](/agents/)

Stories carry MoSCoW tags; definitions in [specs README](/05-specs/readme/#moscow). Story bodies follow the index order. Each story is independently deliverable; **Depends on** does not expand acceptance. Client acceptance demo: [01-overview.md §8](/05-specs/03-configuration/01-overview/#8-acceptance-demo).

Contracts: [OpenAPI](/05-specs/03-configuration/05-contracts/openapi/) · Salesforce build: [salesforce.md](/05-specs/03-configuration/05-contracts/salesforce/) · Effective-flag resolution: [resolution.md](/05-specs/03-configuration/05-contracts/resolution/). This document defines behaviour. Domain product behaviour inside gated surfaces is owned by those spec packs. ---

## Non-functional requirements

| ID | Requirement |
|:---|:---|
| NFR-01 | Effective flags on `GET /api/v1/me` (or dedicated config slice) are available within the same p95 budget as identity `/me` readiness once the household is ready. |
| NFR-02 | Salesforce option changes are visible to the client on next app foreground refresh or re-login within **≤ 5 minutes** of successful SF→MW sync (no app-store release). |
| NFR-03 | Mobile **never** re-implements firm/book/household merge logic — it consumes the middleware **effective** payload only ([ADR-018](/01-constitution/constitution/#adr-018--effective-feature-flag-resolution)). |
| NFR-04 | Preview sessions use the same effective-flag computation as the real client for that household; preview credentials must not elevate beyond the acting advisor’s book. |
| NFR-05 | Advisor preview targets a web client surface (LWC iframe). The native store build alone does not satisfy CFG-02 ([ADR-047](/01-constitution/constitution/#adr-047--advisor-preview-requires-a-web-deliverable-client-surface)). |

---

## Story index

| ID | Actor | Story | MoSCoW | Cost |
|:---|:---|:---|:---|---:|
| [CFG-01](#cfg-01--gate-the-app-on-effective-feature-flags) | Client / platform | Gate the app on effective feature flags | Must | 6 |
| [CFG-02](#cfg-02--configure-and-preview-one-household) | Advisor | Configure and preview one household | Must | 16 |
| [CFG-03](#cfg-03--administer-firm-policy-book-defaults-and-bulk-changes) | Administrator | Administer firm policy, book defaults, and bulk changes | Must | 5 |
| [CFG-04](#cfg-04--publish-the-domain-option-catalog) | Advisor / admin / platform | Publish the domain option catalog | Must | 2 |
| [CFG-05](#cfg-05--use-a-separate-admin-web-app) | Administrator | Use a separate admin web app | Won't | 20 |
| [CFG-06](#cfg-06--let-clients-toggle-their-own-features) | Client | Let clients toggle their own features | Won't | 5 |

---

## User stories

### CFG-01 — Gate the app on effective feature flags

MoSCoW: Must  
As a logged-in client  
I want the app to show only tabs, More entries, and Home teasers enabled for my household  
So that I am not exposed to capabilities that do not apply to my relationship.

Expected behavior:

- After authentication, middleware returns **effective feature flags** for the active household on `GET /api/v1/me`; also on `GET /api/v1/config` when that route exists (per [openapi.yaml](/05-specs/03-configuration/05-contracts/openapi/)).
- Hidden flags **remove** navigation targets, Home teasers, and shortcuts — not empty shells.
- Effective flags are computed only in middleware ([resolution.md](/05-specs/03-configuration/05-contracts/resolution/)):

```
effective = platform_feature_flags (what code supports)
          ∩ firm_mandatory ON
          ∩ admin_advisor_book_defaults
          ∩ advisor_household_overrides
```

- Platform flags off → feature hidden regardless of Salesforce ([ADR-005](/01-constitution/constitution/#adr-005--platform-feature-flags-vs-salesforce-configurable-options), [ADR-018](/01-constitution/constitution/#adr-018--effective-feature-flag-resolution)).
- Firm-mandatory ON → feature ON regardless of advisor off-toggle ([ADR-014](/01-constitution/constitution/#adr-014--feature-configuration-hierarchy)).
- New platform capabilities ship **disabled** until explicitly enabled at platform and then Salesforce layers (safe rollout).
- Salesforce option changes apply on next refresh/login (**NFR-02**) — no store update for option toggles.
- App shell (bottom tabs + More) and deep-link routing respect the same effective map. Profile remains reachable when `profile_enabled` regardless of 3- vs 4-tab shell ([ADR-045](/01-constitution/constitution/#adr-045--nav-shell-v1-vs-v2-3-vs-4-tabs)).

Error and edge cases:

- Unauthenticated — no flags; present login.
- Household flags missing in SF — middleware applies book defaults, then firm-mandatory, then platform; never invents “all on.”
- Platform flag off while SF shows on — client sees off; SF LWC should indicate platform-disabled where feasible.
- Impersonation — effective flags for the impersonated client household.

Salesforce / integrations
- Reads `Firm_Feature_Policy__c`, `Advisor_Book_Feature_Defaults__c`, `Mobile_Feature_Flags__c` ([salesforce.md](/05-specs/03-configuration/05-contracts/salesforce/), [data-model.md §2](/03-data/data-model/)).
- Platform flag source is middleware/app config — not Salesforce.

---

### CFG-02 — Configure and preview one household

MoSCoW: Must  
As an advisor in Salesforce  
I want to turn options on or off for one client household and preview what they see  
So that I can tailor the app without a mobile advisor login or screen-share.

Expected behavior:

- Configuration lives in Salesforce LWC — advisors have no mobile app login.
- Advisor edits per-household overrides on `Mobile_Feature_Flags__c` (linked to the Orion child household Account).
- Advisor toggles one household at a time — no book-wide bulk from the advisor role.
- Changes are audited (`updated_by_sf_user_id`, `updated_at`, role).
- Advisor cannot turn a firm-mandatory feature off — LWC shows locked/hidden controls ([CFG-03](#cfg-03--administer-firm-policy-book-defaults-and-bulk-changes)).
- Advisor cannot enable a feature that is off at the platform layer.
- Preview: LWC embeds a client-view iframe to the Neopix-hosted web client using the same APIs and effective flags (NFR-04, NFR-05, [ADR-047](/01-constitution/constitution/#adr-047--advisor-preview-requires-a-web-deliverable-client-surface)). Phased delivery (shell vs RN Web parity) is in ADR-047.
- Preview auth: short-lived household-scoped token via [openapi.yaml](/05-specs/03-configuration/05-contracts/openapi/); prefer read-only AuthZ.

Error and edge cases:

- Household outside advisor’s book — action unavailable.
- Save conflict / sync failure — surface SF error; do not claim success until MW can read the new values on next sync.
- Preview URL down — show retry; do not fall back to a different household’s flags.

Salesforce:

- Surface: Advisor LWC on household / related Account.
- SF → MW: `Mobile_Feature_Flags__c` fields in [CFG-04](#cfg-04--publish-the-domain-option-catalog).
- LWC → MW: `POST /api/v1/config/preview-session` → iframe `previewUrl`.

---

### CFG-03 — Administer firm policy, book defaults, and bulk changes

MoSCoW: Must  
As an administrator  
I want to set firm-mandatory features, per-advisor book defaults, bulk book toggles, and transfer behaviour  
So that rollout and compliance are controlled without editing every household by hand.

Expected behavior:

- **Firm-mandatory** (`Firm_Feature_Policy__c`, `is_mandatory = true`): always ON in effective flags; advisors cannot override off. Mandatory list is firm-owned ([ADR-028](/01-constitution/constitution/#adr-028--firm-mandatory--toggle-policy) — which keys are mandatory is firm-owned; the mechanism is Must).
- **Book defaults** (`Advisor_Book_Feature_Defaults__c`): admin-only; keyed by primary advisor User Id. When a **new** household is activated, defaults copy into `Mobile_Feature_Flags__c`; the advisor then overrides per **CFG-02**.
- **Bulk book toggle** (admin-only): sets the chosen option on all households in the advisor’s book. Firm-mandatory still wins. Locked precedence: bulk write updates household rows; later advisor edits are allowed; bulk does not require wiping audit history.
- Book transfer: when primary advisor changes, the **new** advisor’s book defaults become the baseline for households that have **no** household-level override recorded; households with existing overrides **keep** those overrides unless an admin runs an explicit “reset to new advisor defaults” action.

Error and edge cases:

- Non-admin caller — denied.
- Bulk on empty book — no-op success.
- Transfer with missing new-advisor defaults — leave existing household flags; alert admin that defaults are incomplete.

Salesforce:

- Admin LWCs / permission sets for firm policy, book defaults, bulk, reset-on-transfer ([salesforce.md](/05-specs/03-configuration/05-contracts/salesforce/)).
- Invite-to-portal remains under [02-users Salesforce contract](/05-specs/02-users/05-contracts/salesforce/).

---

### CFG-04 — Publish the domain option catalog

MoSCoW: Must  
As an advisor, administrator, or platform engineer  
I want a single catalog of domain option keys and behaviours for this delivery  
So that SF LWC, middleware resolution, and domain spec packs agree on names.

Expected behavior:

Domain spec packs own *product* behaviour; this story owns the **keys** and gating semantics.

#### Portfolio ([07-portfolio](/05-specs/07-portfolio/02-specify/))

| Flag | Behaviour |
|---|---|
| `portfolio_enabled` | Portfolio tab + `portfolio_orion` Home teaser |
| `portfolio_provider` | `orion` (this delivery), `investnet`, or `none` — platform-level provider |
| `portfolio_ytd_realized_gl` | YTD realized G/L card; firm-mandatory when set in `Firm_Feature_Policy__c` ([ADR-033](/01-constitution/constitution/#adr-033--ytd-realized-gainloss-card)) |

Portfolio defaults to **enabled** for invited clients; works without eMoney.

#### Planning ([08-planning](/05-specs/08-planning/02-specify/))

| Flag | Behaviour |
|---|---|
| `planning_enabled` | Planning tab, Home net worth, `planning_combined` allocation |
| `planning_overview` | Overview (NW, allocation, plan probability) |
| `planning_expenses` | Expenses |
| `planning_goals` | Goals |
| `planning_linked_accounts` | Linked accounts |
| `planning_monte_carlo` | Monte Carlo on Overview |

Sub-flags apply only when `planning_enabled` is true. `planning_enabled` is set by advisor/admin (manual). Auto-detect “no eMoney plan → force off” is not required for Must; recommended ops practice is to leave planning off until a plan exists ([ADR-029](/01-constitution/constitution/#adr-029--home-without-emoney)).

#### Documents, Insights, Team, Profile

| Flag | Behaviour |
|---|---|
| `documents_enabled` | Docs tab |
| `documents_upload` | Client upload |
| `documents_docusign` | Signing — remains **false** until DocuSign capability ships (DOC-08 Won't) |
| `insights_enabled` | Insights & Commentary + Home Latest Insights |
| `team_enabled` | Your Team + Home preview |
| `team_scheduling` | Schedule affordances |
| `profile_enabled` | My Profile hub |

Keys without platform capability ship **false** until the capability is released and admin-enabled (**CFG-01**).

Error and edge cases:

- Unknown key in SF — ignored by middleware; logged for ops.
- Sub-flag on while master off — effective sub-flag false.

Salesforce / integrations
- Field API names on `Mobile_Feature_Flags__c` per [salesforce.md](/05-specs/03-configuration/05-contracts/salesforce/) and [data-model.md §2.3](/03-data/data-model/).

---

### CFG-05 — Use a separate admin web app

MoSCoW: Won't

---

### CFG-06 — Let clients toggle their own features

MoSCoW: Won't

---
