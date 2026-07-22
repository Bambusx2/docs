---
title: "E04 Home Dashboard — Client Overview"
---

> Discovery package entry for E04. Composite client hub — layout, greeting, shortcuts, and section slots. Domain section behaviour lives in E05–E10 specifies; Home owns composition and wiring.  
> Specify: None (overview-only composite). Acceptance for each teaser’s data rules is in the owning pack.  
> Not included: Sprint plans, task lists, GWT suites, UAT scripts, runbooks.  
> Shared conventions: [specs README](/05-specs/readme/) (MoSCoW, package shape, Discovery DoD, dependency graph).

| Field | Value |
|-------|-------|
| Status | Discovery locked |
| Package version | 1.0.0 |
| Date | 2026-07-17 |
| Specify | — (composite; see §7 wiring) |
| Depends on | [E03 Configuration](/05-specs/03-configuration/01-overview/) |
| Unlocks | Soft — Home shell for domain teasers; [E10 Action Required](/05-specs/10-alerts/01-overview/) hard-depends on Home for bell / list placement |
| Changelog | [CHANGELOG.md](/05-specs/04-home/changelog/) |

Global context: [prd.md](/product/prd/) · [architecture.md](/02-architecture/architecture/) · [constitution.md](/01-constitution/constitution/)

Handoff: Ship Home layout + `GET /api/v1/home` using the composite DTO in [data-model.md §12.2](/03-data/data-model/) (fixtures/placeholders OK). No separate Home OpenAPI fragment this wave — compose in Phase B or add a thin fragment when middleware needs it. Wire each §7 section as the owning pack demos. Do not invent domain field semantics here — follow the linked specifies.

---

## 1. Problem

Clients open the app between advisor meetings and need a **single warm landing surface**: who they are with OnePoint, what needs attention, and clear shortcuts into Portfolio, Planning (when enrolled), Docs, Insights, and Team — without leading with investment jargon or vendor brands.

Home must also respect **effective feature flags** and the **Planning-off** experience: when a household has no eMoney plan, net worth and planning teasers must disappear, while Orion portfolio context can remain ([ADR-015](/01-constitution/constitution/#adr-015--home-as-neutral-summary-hub), [ADR-029](/01-constitution/constitution/#adr-029--home-without-emoney), [ADR-045](/01-constitution/constitution/#adr-045--nav-shell-v1-vs-v2)).

E04 is the **composition layer**. It does not redefine how Team cards, Insights articles, Portfolio allocation, Planning net worth, Documents entry, or Action Required alerts work — those belong to domain packs. Home provides the shell, the composite API, and the wiring contract so those packs can land incrementally without thrashing navigation.

---

## 2. Outcomes

| Measure | Target | Evidence |
|---|---|---|
| Layout | Home matches approved Figma hub (placeholders OK until domains wire) | §8 Path 1 |
| Shortcuts | Quick actions navigate only to **enabled** domains | §8 Path 2 · effective flags from E03 |
| Planning-off | Net worth and planning allocation teasers **hidden** when `planning_enabled` is false; Orion portfolio teaser may remain | §8 Path 3 · [ADR-029](/01-constitution/constitution/#adr-029--home-without-emoney) |
| Incremental wiring | As each domain pack demos, its Home section updates without redesigning the hub | §8 Path 4 · §7 table |
| Action Required surface | Bell badge and Home Action Required list share the same open-item set | [E10](/05-specs/10-alerts/01-overview/) · AR-01, AR-02 |
| Tone | Neutral summary hub — not investments-first | [ADR-015](/01-constitution/constitution/#adr-015--home-as-neutral-summary-hub) |

---

## 3. Scope summary

### In scope (Must for this pack)

Composition & shell
- Home tab as primary post-login landing (after E02 legal gate)  
- Greeting / identity header consistent with approved mock  
- Quick-action / shortcut row gated by effective flags (**CFG-01**)  
- Shared empty, loading, and placeholder states for unwired sections  
- Navigation chrome per Figma freeze; when Planning is hidden prefer **3-tab** shell ([ADR-045](/01-constitution/constitution/#adr-045--nav-shell-v1-vs-v2))

API
- `GET /api/v1/home` composite DTO per [data-model.md §12.2](/03-data/data-model/) — assemble (or stub) section payloads for wired domains  
- OpenAPI fragment for Home is deferred at implementation start; use data-model + domain fragments until Phase B compose (or add a thin fragment when middleware needs it)  
- Omit or null-out sections the household cannot see (flag off / planning off) — **no empty shells** for disabled domains

Wiring
- Slots for each §7 domain section; placeholders until the owning pack supplies live behaviour  
- Hide net worth and planning allocation teasers when `planning_enabled` is false ([ADR-029](/01-constitution/constitution/#adr-029--home-without-emoney))

### Out of scope (Won't / owned elsewhere)

| Item | Owner |
|---|---|
| Team member cards, Call/Email/Schedule semantics | [E05](/05-specs/05-my-team/02-specify/) |
| Insights list/detail and ranking | [E06](/05-specs/06-insights/02-specify/) |
| Portfolio allocation taxonomy and account math | [E07](/05-specs/07-portfolio/02-specify/) |
| Net worth formula, planning allocation, Monte Carlo | [E08](/05-specs/08-planning/02-specify/) |
| Document list / vault / signatures | [E09](/05-specs/09-documents/02-specify/) |
| Alert computation, types, deep-link targets | [E10](/05-specs/10-alerts/02-specify/) |
| Feature-flag catalog and resolution | [E03](/05-specs/03-configuration/02-specify/) |
| Invite / login / legal acceptance | [E02](/05-specs/02-users/02-specify/) |

### Product constraints

| Constraint | Detail |
|---|---|
| Role | Composite hub only — section behaviour owned by domain specifies ([ADR-015](/01-constitution/constitution/#adr-015--home-as-neutral-summary-hub)) |
| Tone | Warm, clear, relationship-first — not investments-first or vendor-branded |
| Flags | Every teaser and shortcut respects effective flags from E03; hidden = removed, not empty |
| Without planning | Hide NW + planning teasers when `planning_enabled` false; Orion portfolio teaser may remain ([ADR-029](/01-constitution/constitution/#adr-029--home-without-emoney)) |
| Nav shell | Figma freeze; Planning-off → prefer 3-tab; Profile reachable when `profile_enabled` ([ADR-045](/01-constitution/constitution/#adr-045--nav-shell-v1-vs-v2)) |
| Action Required | Concrete tasks only on Home ([ADR-016](/01-constitution/constitution/#adr-016--v1-action-required-concrete-items-only)); computation owned by E10 |
| UI | Figma is layout authority; this overview does not redefine domain field lists |
| Data honesty | Placeholders and fixtures must not imply live Orion/eMoney accuracy |
| Specify | No `02-specify.md` — do not invent Home-only acceptance stories that duplicate domain packs |

---

## 4. What the client must provide

| Item | Owner | Needed before |
|---|---|---|
| Confirmation of Planning-off / 3-tab preference | — | N — [ADR-045](/01-constitution/constitution/#adr-045--nav-shell-v1-vs-v2) / [ADR-029](/01-constitution/constitution/#adr-029--home-without-emoney) Accepted |
| Effective-flag fixture or live CFG for demo households | Delivery / Callaway | §8 Paths 2–3 |
| Domain pack readiness (or stub payloads) for each wired section | Domain owners | §8 Path 4 incremental demos |

---

## 5. Assumptions

1. Home wires **incrementally** as E05–E10 land; E04 exit does not require every teaser live.  
2. Without planning enrollment, show Orion portfolio allocation teaser only (when Portfolio flagged on) — [ADR-029](/01-constitution/constitution/#adr-029--home-without-emoney).  
3. E03 effective flags are available on `/me` (or fixtures) before Home gating demos.  
4. E02 legal acceptance and session are complete before Home is the post-login landing.  
5. Bell tap navigates to the Home Action Required section (E10 rule); Home provides the scroll/anchor target.

---

## 6. Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Domain packs slip | Empty-looking Home at fly-in | Placeholders + fixtures; demo shell first; wire Must teasers by priority (Alerts, Portfolio, Planning) |
| Home invents domain rules | Spec drift | §7 wiring table is normative for ownership; specify wins in domain packs |
| Flag / Planning-off bugs | Client sees forbidden teasers | CFG-01 + ADR-029 checks in §8 Paths 2–3 |
| Nav 3 vs 4 tab thrash | Layout rework | Figma freeze ([ADR-045](/01-constitution/constitution/#adr-045--nav-shell-v1-vs-v2)); domains stay in More |

---

## 7. Cross-pack hooks (wiring)

Home **owns** the slot and navigation into the section. The linked specify **owns** data, MoSCoW, and acceptance for that content.

| Home section | Owning specify | Stories | Flag / gate |
|---|---|---|---|
| Notification bell | [10-alerts/02-specify.md](/05-specs/10-alerts/02-specify/) | AR-01 | Always (badge when open alerts) |
| Action Required list | [10-alerts/02-specify.md](/05-specs/10-alerts/02-specify/) | **AR-02**, **AR-03** | Empty / hidden when no open alerts |
| Your Team preview | [05-my-team/02-specify.md](/05-specs/05-my-team/02-specify/) | MT-02 | `team_enabled` |
| Schedule shortcut | [05-my-team/02-specify.md](/05-specs/05-my-team/02-specify/) | MT-03 | `team_enabled` ∧ `team_scheduling` |
| Latest Insights | [06-insights/02-specify.md](/05-specs/06-insights/02-specify/) | IC-02 | `insights_enabled` |
| Portfolio allocation teaser | [07-portfolio/02-specify.md](/05-specs/07-portfolio/02-specify/) | P-07 | `portfolio_enabled` |
| Net worth + planning allocation | [08-planning/02-specify.md](/05-specs/08-planning/02-specify/) | **PL-02**, **PL-03**, **PL-11** | `planning_enabled` (+ sub-flags as specified) |
| Documents shortcut | [09-documents/02-specify.md](/05-specs/09-documents/02-specify/) | DOC-01 | `documents_enabled` |

Also: Profile entry from shell/More when `profile_enabled` — [E02](/05-specs/02-users/02-specify/) **C-05**; not a Home teaser card.

---

## 8. Acceptance demo

### Path 1 — Shell & layout

1. Authenticated client (legal accepted) lands on Home.  
2. Layout matches approved Figma hub: greeting, shortcut row, section stack.  
3. Unwired sections show agreed placeholders (not fabricated financial totals).

### Path 2 — Flagged shortcuts

1. With Portfolio (and other domains) enabled → shortcuts navigate to the correct screens.  
2. Advisor turns a domain off (E03) → after refresh, corresponding Home shortcut and teaser are **removed**.

### Path 3 — Planning off

1. Household with `planning_enabled` false.  
2. Net worth and planning allocation teasers are **absent**.  
3. Portfolio allocation teaser may still show when `portfolio_enabled` is true ([ADR-029](/01-constitution/constitution/#adr-029--home-without-emoney)).

### Path 4 — Incremental domain wiring

1. As each owning pack reaches its demo bar, replace that section’s placeholder with live (or fixture) content per §7.  
2. Home layout does not require redesign when a section goes live.

---

## 9. Discovery Definition of Done

Complete shared DoD in [specs README](/05-specs/readme/#discovery-definition-of-done) **where applicable** (specify N/A), plus:

- [ ] §3 composition scope and Product constraints accepted  
- [ ] §7 wiring table agreed as ownership SoT for Home sections  
- [ ] §8 Paths 1–3 agreed as E04 demo bar; Path 4 acknowledged as incremental  
- [x] Neopix Home Figma complete  
- [ ] Open items have owners and blocks-build Y/N  
- [ ] No domain field semantics accepted under E04 that belong in E05–E10  

### Open items

| Item | Owner | Blocks build? |
|---|---|---|
| Fixture payloads for `/home` while domains stub | Neopix eng | N if placeholders acceptable |

---

## 10. Build baseline

This pack is part of the locked discovery baseline for build. Domain behaviour is governed by linked specifies where present — those specifies win. Figma is layout authority for build ([AGENTS.md](/agents/)). Behaviour changes update specify (and ADR/PRD if needed) before code.


---

Related: [Architecture — Home flows](/02-architecture/architecture/) · [E03 Configuration](/05-specs/03-configuration/01-overview/) · [specs README — Home contributions](/05-specs/readme/#what-each-pack-adds-to-home) · [CHANGELOG](/05-specs/04-home/changelog/)
