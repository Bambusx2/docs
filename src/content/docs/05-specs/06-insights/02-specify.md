---
title: "E06 Insights & Commentary — Specification"
---

> Scope: Firm market commentary and educational content from an external insights feed — list, detail, Home teaser; same feed for all clients.  
> Source trail: Requirements draft · RSS research notes · Workshop 4 (external) · [data-model.md §6](/03-data/data-model/) · [ADR-001](/01-constitution/constitution/#adr-001--middleware-as-the-only-mobile-data-plane) · [ADR-017](/01-constitution/constitution/#adr-017--insights-v1--rsswebsite-feed)
> Spec version: 1.0.0 · Last updated: July 17, 2026  
> Discovery package: [01-overview.md](/05-specs/06-insights/01-overview/) (constraints, acceptance demo)  
> Delivery rules: [AGENTS.md](/agents/)

Stories carry MoSCoW tags; definitions in [specs README](/05-specs/readme/#moscow). Story bodies follow the index order. Each story is independently deliverable; **Depends on** does not expand acceptance. Client acceptance demo: [01-overview.md §8](/05-specs/06-insights/01-overview/#8-acceptance-demo).

Naming: Screen title **Insights & Commentary**. API and flags use `insights` / `insights_enabled`.

Contracts: [OpenAPI](/05-specs/06-insights/05-contracts/openapi.yaml) is the machine-readable API source; this document defines behaviour. External feed is provider-agnostic via a **standardized feed document** mapped by adapters (RSS/Atom or JSON Feed): [feed.md](/05-specs/06-insights/05-contracts/feed/). Global integration: [insights-feed.md](/04-integrations/insights-feed/). ---

## Non-functional requirements

| ID | Requirement |
|:---|:---|
| NFR-01 | `GET /api/v1/insights` (first page, ≤20 items) returns within **1.5 seconds** p95 when the middleware cache is warm. |
| NFR-02 | Middleware cache TTL for the insights feed is **≤ 15 minutes**; screen open always serves cache or a refresh already in flight (no multi-minute stale window without background refresh). |
| NFR-03 | Feed fetch failures must not block `/home` or `/me`; Home insights section omits or shows last-good cache, never a hard error card that breaks Home. |

---

## Story index

| ID | Actor | Story | MoSCoW | Cost |
|:---|:---|:---|:---|---:|
| [IC-01](#ic-01--browse-and-read-insights--commentary) | Client | Browse and read Insights & Commentary | Must | 5 |
| [IC-02](#ic-02--see-latest-insights-on-home) | Client | See latest insights on Home | Must | 1 |
| [IC-03](#ic-03--personalize-insights-by-client) | Client | Personalize insights by client | Won't | 10 |
| [IC-04](#ic-04--get-push-for-new-insights) | Client | Get push for new insights | Won't | 2 |
| [IC-05](#ic-05--use-agentic-article-selection) | Client | Use agentic article selection | Won't | 12 |

Won't Cost **2** on **IC-04** is incremental domain wiring on platform push (**C-16**); see [Cost](/05-specs/readme/#cost).

---

## User stories

### IC-01 — Browse and read Insights & Commentary

MoSCoW: Must  
As a logged-in client with insights enabled  
I want to open Insights & Commentary, browse firm articles, and read a full piece  
So that I can see market and planning commentary without leaving the app ecosystem.

Expected behavior:

- Entry: **More → Insights & Commentary** (not a bottom tab). Available only when effective flag `insights_enabled` is true ([03-configuration CFG-04](/05-specs/03-configuration/02-specify/#cfg-04--publish-the-domain-option-catalog)). When false, the More row is omitted.
- `GET /api/v1/insights` returns paginated **published** `InsightArticle` items for all clients (no per-client filter). Drafts and archived items are excluded.
- Each card shows: **tag** (when present), **title**, **excerpt**, **author_name**, **published_at** (and thumbnail when present).
- Tapping a card opens detail:
  - If `bodyHtml` is present → render in-app (sanitized HTML).
  - Else if `bodyUrl` is present → open in-app WebView of that URL.
  - System browser only as fallback when WebView cannot load.
- Author display: **author_name** is required on cards; **author_role** is shown on detail when provided by the feed.
- Content is not client-specific — same catalog for every household with the flag on.
- New articles appear without an app store update: middleware pulls the external feed through the Insights feed adapter ([feed.md](/05-specs/06-insights/05-contracts/feed/)); freshness is on screen open plus cache TTL (**NFR-02**). Pull-to-refresh on the list is supported.
- Empty feed: empty state copy **No articles available** — not lorem ipsum or fake advice.
- Non-prod serves **fixture** articles when the external source is not connected. Production uses the live adapter or an empty published list — never invent market commentary in production.

Error and edge cases:

- `insights_enabled` false — Insights not reachable; deep links fall back to Home.
- Upstream feed unavailable and no cache — empty state with retry; do not crash the More hub.
- Partial article (title + url, no excerpt) — middleware synthesizes excerpt from title or first text field per [feed.md](/05-specs/06-insights/05-contracts/feed/); never invent market claims.
- Broken `thumbnailUrl` — omit image; keep text card.
- Unauthenticated — Insights not available; present login.
- Impersonation — same firm-wide feed as the client.

Salesforce / integrations
- SF: flag only — `Mobile_Feature_Flags__c.Insights_Enabled__c`. No `Insight__c` object required ([ADR-017](/01-constitution/constitution/#adr-017--insights-v1--rsswebsite-feed)).
- External: firm blog / news source ingested via standardized feed document → `InsightArticle` ([data-model.md §6.1](/03-data/data-model/), [feed.md](/05-specs/06-insights/05-contracts/feed/)). Transport is RSS/Atom or JSON Feed from the website; other CMSes adapt into the same schema without mobile changes.

---

### IC-02 — See latest insights on Home

MoSCoW: Must  
As a client on Home  
I want to see the two most recent insights and open the full feed  
So that commentary is visible without opening More.

Depends on: IC-01 data contract; Home shell ([04-home](/05-specs/04-home/01-overview/)).

Expected behavior:

- Home section **Latest Insights** shows a maximum of **2** published articles from `home.insights_preview` with the same card fields as **IC-01**. Sort: featured articles (`is_featured` true) first, then by `published_at` descending. Do not invent filler when fewer than two articles exist.
- **View all** (or section header) navigates to Insights & Commentary (**IC-01**).
- Section hidden when `insights_enabled` is false **or** there are zero published articles.
- Feed outage must not break Home (**NFR-03**).

Error and edge cases:

- One published article — show one card, no placeholder second card.
- Flag flips off — section disappears on next `/home` or `/me` refresh.

Salesforce / integrations
- Same feed source and flag as **IC-01**. Preview is a middleware slice of the published list.

---

### IC-03 — Personalize insights by client

MoSCoW: Won't

---

### IC-04 — Get push for new insights

MoSCoW: Won't

---

### IC-05 — Use agentic article selection

MoSCoW: Won't

---
