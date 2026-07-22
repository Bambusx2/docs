---
title: "E05 Your Team — Client Overview"
---

> Discovery package entry for E05. Client-facing advisory team from Salesforce — browse, call, email, Home preview, and optional scheduling via a provider port (Calendly adapter).  
> Behaviour SoT: [02-specify.md](/05-specs/05-my-team/02-specify/) — specify wins if this overview and specify disagree.  
> Not included: Sprint plans, task lists, GWT suites, separate UAT files, runbooks (delivery / QA own those after handoff).  
> Shared conventions: [specs README](/05-specs/readme/) (MoSCoW, package shape, Discovery DoD, dependency graph).

| Field | Value |
|-------|-------|
| Status | Discovery locked |
| Package version | 1.0.0 |
| Date | 2026-07-17 |
| Specify | [02-specify.md](/05-specs/05-my-team/02-specify/) (stories + NFRs) |
| API contract | [05-contracts/openapi.yaml](/05-specs/05-my-team/05-contracts/openapi.yaml) |
| Salesforce contract | [05-contracts/salesforce.md](/05-specs/05-my-team/05-contracts/salesforce/) |
| Scheduling contract | [05-contracts/scheduling.md](/05-specs/05-my-team/05-contracts/scheduling/) |
| Calendly (global) | [calendly.md](/04-integrations/calendly/) |
| Depends on | [E03 Configuration](/05-specs/03-configuration/01-overview/) |
| Unlocks | Soft — Home **Your Team** preview and Schedule shortcut wiring ([E04](/05-specs/04-home/01-overview/)); Release gate ([E11](/05-specs/11-release/01-overview/)) |
| Changelog | [CHANGELOG.md](/05-specs/05-my-team/changelog/) |

Global context: [prd.md](/product/prd/) · [architecture.md](/02-architecture/architecture/) · [constitution.md](/01-constitution/constitution/) · [data-model.md](/03-data/data-model/) §7

Handoff: Build from [02-specify.md](/05-specs/05-my-team/02-specify/) + OpenAPI + Salesforce pack + [scheduling.md](/05-specs/05-my-team/05-contracts/scheduling/). Team membership is Salesforce Account Team only; scheduling goes through the **SchedulingProvider** port (Calendly adapter). Stub against fixtures until [status.md](/04-integrations/status/) clears SF team / Calendly prerequisites. Raise product gaps as ADRs — do not invent members, roles, or booking outcomes.

---

## 1. Problem

Between advisor meetings, clients need **easy reach to the people who support their household** — who they are, how to call or email, and how to book time — without burying support under investment screens or vendor brands.

Today that contact surface is fragmented: Account Team lives in Salesforce, booking links live in Calendly (or email), and the mobile shell has no first-class **Your Team** path. Without this pack:

- Home cannot show a trustworthy team preview  
- Call / Email / Schedule become ad-hoc deep links that break when flags flip  
- Operations / back-office staff risk appearing next to client-facing advisors  

E05 establishes the support surface: **Salesforce is the membership source; middleware filters to client-facing members and serves the API; Calendly is the scheduling adapter behind a provider-agnostic URL; the mobile app never calls Salesforce or Calendly admin APIs directly** ([ADR-001](/01-constitution/constitution/#adr-001--middleware-as-the-only-mobile-data-plane), [ADR-034](/01-constitution/constitution/#adr-034--calendly-depth-in-v1)).

---

## 2. Outcomes

| Measure | Target | Evidence |
|---|---|---|
| Team list | Sandbox Account Team appears on **Your Team** with name, role, photo/initials | §8 Path 1 · **MT-01** |
| Call / email | Native `tel:` / `mailto:` from cards when phone/email present | §8 Path 1 · **MT-01** |
| Home preview | Up to 3 members; **View all** opens full list; section hidden when empty or flagged off | §8 Path 1–2 · **MT-02** |
| Scheduling (when flagged) | Calendly deep-link / WebView from card or Home **Schedule** per single- vs multi-schedulable rules | §8 Path 3 · **MT-03** · [ADR-034](/01-constitution/constitution/#adr-034--calendly-depth-in-v1) |
| Client-facing only | Operations / back-office roles never appear | **MT-01** filter · [salesforce.md](/05-specs/05-my-team/05-contracts/salesforce/) |
| Flag gating | `team_enabled` / `team_scheduling` omit surfaces — no empty shells | §8 Path 2–3 · [CFG-04](/05-specs/03-configuration/02-specify/#cfg-04--publish-the-domain-option-catalog) |

---

## 3. Scope summary

Story MoSCoW tags use definitions in [specs README](/05-specs/readme/#moscow). Full acceptance criteria: [02-specify.md](/05-specs/05-my-team/02-specify/).

### In scope (Must)

- More → **Your Team** — cards with `display_name`, `role`, photo or initials; **Call** and **Email** (**MT-01**)  
- Home **Your Team** preview (≤3) and **View all** (**MT-02**)  
- **Schedule** via provider-agnostic HTTPS deep-link / in-app WebView when `team_scheduling` is on; Calendly is the adapter (**MT-03**, [ADR-034](/01-constitution/constitution/#adr-034--calendly-depth-in-v1))  
- Flags `team_enabled` / `team_scheduling` (keys owned by [CFG-04](/05-specs/03-configuration/02-specify/#cfg-04--publish-the-domain-option-catalog))  
- Empty state when team list is empty; Home section hidden when empty or `team_enabled` false  

### Out of scope (Won't)

| Item | Story / note |
|---|---|
| Insights & Commentary on the shared Team Figma frame | Owned by [E06 Insights](/05-specs/06-insights/01-overview/) |
| In-app chat / messaging | MT-04 |
| Refer-a-friend / share advisor contact | MT-05 |
| Advisor activity feed | MT-06 |
| Operations / non–client-facing staff in the list | **MT-01** filter |
| Embedded provider widgets, booking confirmation webhooks, native create-appointment APIs | **MT-03** depth · [ADR-034](/01-constitution/constitution/#adr-034--calendly-depth-in-v1) |

### Product constraints

| Constraint | Detail |
|---|---|
| Screen title | **Your Team** (API `/team`; flags `team_enabled` / `team_scheduling`) |
| Entry | More → Your Team (not a bottom tab) |
| Membership | Client-facing Account Team on parent Client Account only — exclude `operations` / non–client-facing |
| Display name | Full SF `User.Name` as `display_name` |
| Ordering | `sort_order` ascending; ties: `is_primary` first, then `display_name` A–Z. Synthetic primary-first + name sort until SF fields deploy ([salesforce.md](/05-specs/05-my-team/05-contracts/salesforce/)) |
| Scheduling | Provider-agnostic `schedulingUrl` + `providerAttribution`; Calendly adapter only ([ADR-034](/01-constitution/constitution/#adr-034--calendly-depth-in-v1), [scheduling.md](/05-specs/05-my-team/05-contracts/scheduling/)) |
| Meeting medium | Zoom vs phone configured in the provider, not in OnePoint |
| No booking write-back | Closing WebView without booking writes nothing to Salesforce |
| Flags | Keys owned by [CFG-04](/05-specs/03-configuration/02-specify/#cfg-04--publish-the-domain-option-catalog); this pack does not redefine the catalog |
| UI | Figma is layout authority; specify owns data and business rules only |
| Chat / refer / activity | Won't (**MT-04**–**MT-06**) |

---

## 4. What the client must provide

| Item | Owner | Needed before |
|---|---|---|
| Account Team populated (client-facing only) in sandbox | Callaway / OnePoint ops | §8 Path 1 live demo |
| `Sort_Order__c` / `Is_Primary__c` (or accept synthetic sort) | Callaway | Ordered UX |
| Client-facing role allow-list / `Role_Type__c` + `Mobile_Client_Facing__c` rules | Callaway / OnePoint | **MT-01** filter |
| Calendly URLs / event types for schedulable advisors | Client / ops | **MT-03** live demo |
| Pack overview available for client reference | Neopix | As needed |

Operational blockers: [status.md](/04-integrations/status/). Missing SF sort fields delay polished order only — synthetic sort is accepted until deploy.

---

## 5. Assumptions

1. Only **client-facing** Account Team members appear; operations / back-office never appear.  
2. Display name is full SF `User.Name` (`display_name`); every visible card has email.  
3. Effective flags come from [E03](/05-specs/03-configuration/02-specify/) **CFG-04** / `/me` — mobile does not re-merge.  
4. Insights content on the shared Figma frame is owned by **E06**, not E05.  
5. Home shell and composite `/home` DTO come from [E04](/05-specs/04-home/01-overview/); this pack owns `team_preview` slice rules and Schedule shortcut behaviour when Team is enabled.  
6. Calendly credentials and event-type mapping are ops/middleware-managed — never embedded in the mobile binary.

---

## 6. Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Empty or incomplete Account Team | Blank support surface at go-live | Empty state copy; hide Home section; ops populate before go-live |
| Calendly sandbox / mapping late | Schedule demo blocked | Ship **MT-01**/**MT-02** first; **MT-03** behind `team_scheduling` |
| SF sort / primary fields delayed | Unstable card order | Middleware synthetic primary-first + name sort until fields deploy |
| Operations staff leak into list | Trust / privacy issue | Middleware filter on `Role_Type__c` / `Mobile_Client_Facing__c` ([salesforce.md](/05-specs/05-my-team/05-contracts/salesforce/)) |
| Provider-specific fields leak to mobile | Hard to swap adapters | OpenAPI stays agnostic; Calendly only in adapter ([scheduling.md](/05-specs/05-my-team/05-contracts/scheduling/)) |

---

## 7. Cross-pack hooks

| Hook | Relationship | Doc |
|---|---|---|
| Configuration | `team_enabled`, `team_scheduling` keys | [03-configuration CFG-04](/05-specs/03-configuration/02-specify/#cfg-04--publish-the-domain-option-catalog) |
| Home | Preview section + Schedule quick action wiring | [04-home/01-overview.md](/05-specs/04-home/01-overview/) |
| Insights | Not this pack (shared Figma frame only) | [06-insights/01-overview.md](/05-specs/06-insights/01-overview/) |
| Entities | `TeamMember`, `MeetingType` | [data-model.md §7](/03-data/data-model/) |
| Global Calendly | Credential / ops integration | [calendly.md](/04-integrations/calendly/) |
| Scheduling port | Pack adapter handoff | [scheduling.md](/05-specs/05-my-team/05-contracts/scheduling/) |
| Release | Team in soft-parallel wave before E11 | [11-release](/05-specs/11-release/01-overview/) · [specs README](/05-specs/readme/) |

---

## 8. Acceptance demo

These three paths are the **client acceptance bar** for E05. Field lists and scheduling rules live in [02-specify.md](/05-specs/05-my-team/02-specify/).

### Path 1 — Browse and contact

1. Sandbox household with ≥2 client-facing Account Team members.  
2. More → **Your Team** — cards show name, role, photo or initials (**MT-01**).  
3. Call opens dialer when phone present; **Email** opens mail client.  
4. Home shows **Your Team** preview (≤3) and **View all** reaches the full list (**MT-02**).

### Path 2 — Empty / flags

1. Household with no team — Your Team empty state; Home section **hidden**.  
2. `team_enabled` off — More row and Home section **hidden** (not empty shells).

### Path 3 — Schedule (when `team_scheduling` on)

1. Card **Schedule** opens Calendly (direct URL or meeting-type sheet) (**MT-03**).  
2. Home **Schedule** follows single- vs multi-schedulable rules in **MT-03**.  
3. `team_scheduling` off — Schedule controls hidden; Call/Email remain when `team_enabled` is on.

---

## 9. Discovery Definition of Done

Complete shared DoD in [specs README](/05-specs/readme/#discovery-definition-of-done), plus:

- [ ] [02-specify.md](/05-specs/05-my-team/02-specify/) **MT-01**–**MT-03** accepted; Won't **MT-04**–**MT-06** acknowledged  
- [ ] NFRs accepted (latency, PII truncation, photo fallback)  
- [ ] Contracts reviewed — OpenAPI, [salesforce.md](/05-specs/05-my-team/05-contracts/salesforce/), [scheduling.md](/05-specs/05-my-team/05-contracts/scheduling/)  
- [x] Neopix Team + Scheduling Figma frames reviewed (Insights excluded)   
- [ ] Calendly adapter mapped or static URL mode accepted for demo  
- [ ] §8 Paths 1–3 agreed as client demo bar  
- [ ] Open items have owners and blocks-build Y/N  

### Open items

| Item | Owner | Blocks build? |
|---|---|---|
| SF `Sort_Order__c` / `Is_Primary__c` deploy | Callaway | N — synthetic sort OK |
| Client-facing role allow-list confirmed in sandbox | Callaway / OnePoint | Y for Path 1 live filter demo |
| Calendly sandbox event-type map | Client / ops | N for **MT-01**/**MT-02**; Y for **MT-03** live demo |
| Team Figma | Neopix | Done |

---

## 10. Build baseline

This pack is part of the locked discovery baseline for build. Domain behaviour is governed by linked specifies where present — those specifies win. Figma is layout authority for build ([AGENTS.md](/agents/)). Behaviour changes update specify (and ADR/PRD if needed) before code.


---

Related: [Specify](/05-specs/05-my-team/02-specify/) · [OpenAPI](/05-specs/05-my-team/05-contracts/openapi.yaml) · [Salesforce](/05-specs/05-my-team/05-contracts/salesforce/) · [Scheduling](/05-specs/05-my-team/05-contracts/scheduling/) · [specs README](/05-specs/readme/) · [CHANGELOG](/05-specs/05-my-team/changelog/)
