---
title: "E06 Insights & Commentary — Client Overview"
---

> Discovery package entry for E06. Firm market commentary from an external feed — list, detail, and Home teaser. Same catalog for all clients; Salesforce is not the content CMS.  
> Behaviour SoT: [02-specify.md](/05-specs/06-insights/02-specify/) — specify wins if this overview and specify disagree.  
> Not included: Sprint plans, task lists, GWT suites, separate UAT files, runbooks (delivery / QA own those after handoff).  
> Shared conventions: [specs README](/05-specs/readme/) (MoSCoW, package shape, Discovery DoD, dependency graph).

| Field | Value |
|-------|-------|
| Status | Discovery locked |
| Package version | 1.0.0 |
| Date | 2026-07-17 |
| Specify | [02-specify.md](/05-specs/06-insights/02-specify/) (stories + NFRs) |
| API contract | [05-contracts/openapi.yaml](/05-specs/06-insights/05-contracts/openapi.yaml) |
| Feed contract | [05-contracts/feed.md](/05-specs/06-insights/05-contracts/feed/) |
| Insights feed (global) | [insights-feed.md](/04-integrations/insights-feed/) |
| Depends on | [E03 Configuration](/05-specs/03-configuration/01-overview/) |
| Unlocks | Soft — Home **Latest Insights** teaser wiring ([E04](/05-specs/04-home/01-overview/)); Release gate ([E11](/05-specs/11-release/01-overview/)) |
| Changelog | [CHANGELOG.md](/05-specs/06-insights/changelog/) |

Global context: [prd.md](/product/prd/) · [architecture.md](/02-architecture/architecture/) · [constitution.md](/01-constitution/constitution/) · [data-model.md](/03-data/data-model/) §6

Handoff: Build from [02-specify.md](/05-specs/06-insights/02-specify/) + OpenAPI + [feed.md](/05-specs/06-insights/05-contracts/feed/). Ingest the firm blog/news source through the **standardized feed document**; adapters map RSS/Atom or JSON Feed into `InsightArticle`. Stub with fixtures until the production URL is ready. Raise product gaps as ADRs — do not invent articles or market claims.

---

## 1. Problem

Clients expect **firm market and planning commentary** in the portal — reachable from More and teased on Home — without waiting for an app store release when marketing publishes a new piece.

Rebuilding a CMS inside Salesforce for this delivery is out of scope and the wrong system of record. Without a feed-backed Insights pack:

- Home cannot show a trustworthy **Latest Insights** teaser  
- Marketing content stays on the public website only  
- Packs invent ad-hoc article shapes that break when the transport changes  

E06 establishes the content surface: **the firm website / blog owns publishing; middleware normalizes every source into one feed document then `InsightArticle`; Salesforce stores only the `insights_enabled` flag; the mobile app never scrapes or calls the CMS admin APIs directly** ([ADR-001](/01-constitution/constitution/#adr-001--middleware-as-the-only-mobile-data-plane), [ADR-017](/01-constitution/constitution/#adr-017--insights-v1-rss-website-feed)).

---

## 2. Outcomes

| Measure | Target | Evidence |
|---|---|---|
| Feed list | Published cards from external source or fixtures (tag, title, excerpt, author, date) | §8 Path 1 · **IC-01** |
| Detail | In-app sanitized HTML when `bodyHtml` present; otherwise WebView of `bodyUrl` | §8 Path 1 · **IC-01** |
| Home teaser | Up to 2 latest (featured first, then `published_at` desc); **View all** | §8 Path 2 · **IC-02** |
| Flag gating | More row and Home section omitted when `insights_enabled` false | §8 Path 3 · [CFG-04](/05-specs/03-configuration/02-specify/#cfg-04--publish-the-domain-option-catalog) |
| Firm-wide catalog | Same articles for every household with the flag on | **IC-01** · [ADR-017](/01-constitution/constitution/#adr-017--insights-v1-rss-website-feed) |
| No store release for content | New articles appear via middleware feed pull + cache | **NFR-02** · [feed.md](/05-specs/06-insights/05-contracts/feed/) |

---

## 3. Scope summary

Story MoSCoW tags use definitions in [specs README](/05-specs/readme/#moscow). Full acceptance criteria: [02-specify.md](/05-specs/06-insights/02-specify/).

### In scope (Must)

- More → **Insights & Commentary** — paginated list + article detail (**IC-01**)  
- Home **Latest Insights** (≤2) + **View all** (**IC-02**)  
- Middleware proxy/cache of external feed via standard feed model ([feed.md](/05-specs/06-insights/05-contracts/feed/))  
- `insights_enabled` gating; empty state; fixture strategy in non-prod  

### Out of scope (Won't)

| Item | Story / note |
|---|---|
| Per-client personalization / targeting | IC-03 |
| Push notifications for new articles | IC-04 |
| Agentic / AI article selection or ranking | IC-05 |
| Insights as a bottom navigation tab | Entry is More only |
| Salesforce `Insight__c` as system of content | [ADR-017](/01-constitution/constitution/#adr-017--insights-v1-rss-website-feed) |
| Client-authored posts or comments | Not in this pack |

### Product constraints

| Constraint | Detail |
|---|---|
| Screen title | **Insights & Commentary** (API `/insights`; flag `insights_enabled`) |
| Entry | More → Insights & Commentary (not a bottom tab) |
| Content | Firm-wide catalog for all clients ([ADR-017](/01-constitution/constitution/#adr-017--insights-v1-rss-website-feed)) |
| Source | External feed via middleware `InsightsFeedPort`; fixtures OK until URL ready; production never invents market commentary |
| Detail rendering | Prefer sanitized `bodyHtml` in-app; else in-app WebView of `bodyUrl`; system browser only if WebView cannot load |
| Home sort | Featured (`is_featured`) first, then `published_at` descending; no filler cards |
| Empty state | Copy: **No articles available** |
| Flags | `insights_enabled` — [CFG-04](/05-specs/03-configuration/02-specify/#cfg-04--publish-the-domain-option-catalog) |
| UI | Figma is layout authority; specify owns feed fields and Home preview rules |
| Personalization / push / AI | Won't (**IC-03**–**IC-05**) |

---

## 4. What the client must provide

| Item | Owner | Needed before |
|---|---|---|
| Insights feed endpoint (RSS/Atom, JSON Feed, or JSON conforming to [feed.md](/05-specs/06-insights/05-contracts/feed/)) | OnePoint marketing | Live feed (fixtures OK in non-prod) |
| Confirm article HTML vs URL-only publishing pattern | Client marketing | Detail UX polish |
| Pack overview available for client reference | Neopix | As needed |

Operational blockers: [status.md](/04-integrations/status/). Missing production URL does not authorize inventing articles in production.

---

## 5. Assumptions

1. The same firm-wide feed is shown to every household with `insights_enabled` on.  
2. The external source is the system of content; middleware normalizes to `InsightArticle` only.  
3. Effective flag comes from [E03](/05-specs/03-configuration/02-specify/) **CFG-04** / `/me` — mobile does not re-merge.  
4. Home shell and composite `/home` DTO come from [E04](/05-specs/04-home/01-overview/); this pack owns `insights_preview` slice rules.  
5. Content platform build-out beyond the feed adapter remains client / Callaway (not Neopix CMS work) per [ADR-023](/01-constitution/constitution/#adr-023--neopix-sow-vs-client-integration-boundary).

---

## 6. Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Feed URL delayed | Empty Insights in prod | Fixtures in non-prod; empty state in prod until live; never invent commentary |
| Irregular source markup | Broken cards / bad HTML | Adapter maps into standard feed doc; reject/skip invalid items ([feed.md](/05-specs/06-insights/05-contracts/feed/)) |
| Unsanitized HTML | XSS / crash in WebView | Mobile + security allow-list for `bodyHtml`; WebView for URL-only pieces |
| Feed outage during Home load | Home feels broken | **NFR-03** — last-good cache or omit section; no hard error card on Home |
| Marketing publishes drafts | Clients see unfinished copy | Middleware returns **published** only |

---

## 7. Cross-pack hooks

| Hook | Relationship | Doc |
|---|---|---|
| Configuration | `insights_enabled` key | [03-configuration CFG-04](/05-specs/03-configuration/02-specify/#cfg-04--publish-the-domain-option-catalog) |
| Home | **Latest Insights** teaser wiring | [04-home/01-overview.md](/05-specs/04-home/01-overview/) |
| Your Team | Related More-tab surface | [05-my-team/01-overview.md](/05-specs/05-my-team/01-overview/) |
| Entities | `InsightArticle` | [data-model.md §6](/03-data/data-model/) |
| Global feed | Ops / URL / format | [insights-feed.md](/04-integrations/insights-feed/) |
| Pack feed port | Adapter handoff | [feed.md](/05-specs/06-insights/05-contracts/feed/) |
| Release | Insights in soft-parallel wave before E11 | [11-release](/05-specs/11-release/01-overview/) · [specs README](/05-specs/readme/) |

---

## 8. Acceptance demo

These three paths are the **client acceptance bar** for E06. Field lists and feed rules live in [02-specify.md](/05-specs/06-insights/02-specify/).

### Path 1 — Browse and read

1. `insights_enabled` on; feed or fixtures populated.  
2. More → **Insights & Commentary** — cards show tag (when present), title, excerpt, author, date (**IC-01**).  
3. Open an article — sanitized in-app body or WebView of article URL.

### Path 2 — Home

1. Home **Latest Insights** shows up to two items (featured first); **View all** opens the full list (**IC-02**).  
2. Fewer than two published articles — show available cards only (no filler).

### Path 3 — Flag / empty

1. Flag off — More row and Home section **hidden**.  
2. Empty feed — empty state **No articles available**; no fake advice.

---

## 9. Discovery Definition of Done

Complete shared DoD in [specs README](/05-specs/readme/#discovery-definition-of-done), plus:

- [ ] [02-specify.md](/05-specs/06-insights/02-specify/) **IC-01**–**IC-02** accepted; Won't **IC-03**–**IC-05** acknowledged  
- [ ] NFRs accepted (latency, cache TTL, Home isolation)  
- [ ] Contracts reviewed — [OpenAPI](/05-specs/06-insights/05-contracts/openapi.yaml) + [feed.md](/05-specs/06-insights/05-contracts/feed/)  
- [ ] Feed URL or fixture strategy agreed  
- [x] Neopix Insights Figma reviewed   
- [ ] §8 Paths 1–3 agreed as client demo bar  
- [ ] Open items have owners and blocks-build Y/N  

### Open items

| Item | Owner | Blocks build? |
|---|---|---|
| Production feed URL / format | OnePoint marketing | N — fixtures OK for build |
| HTML sanitization allow-list | Mobile + security | Partial for `bodyHtml` detail |
| Insights Figma | Neopix | Done |

---

## 10. Build baseline

This pack is part of the locked discovery baseline for build. Domain behaviour is governed by linked specifies where present — those specifies win. Figma is layout authority for build ([AGENTS.md](/agents/)). Behaviour changes update specify (and ADR/PRD if needed) before code.


---

Related: [Specify](/05-specs/06-insights/02-specify/) · [OpenAPI](/05-specs/06-insights/05-contracts/openapi.yaml) · [Feed](/05-specs/06-insights/05-contracts/feed/) · [specs README](/05-specs/readme/) · [CHANGELOG](/05-specs/06-insights/changelog/)
