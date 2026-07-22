---
title: "E06 Insights — External Feed Contract"
---

> Global integration: [insights-feed.md](/04-integrations/insights-feed/)  
> Owner: Solutions architecture / middleware · Consumers: Mobile  
> Behaviour: [../02-specify.md](/05-specs/06-insights/02-specify/) · API: [openapi.yaml](/05-specs/06-insights/05-contracts/openapi.yaml) · ADR: [ADR-017](/01-constitution/constitution/#adr-017--insights-v1-rss-website-feed) · Entity: [data-model.md §6.1](/03-data/data-model/)

Blog / news entries live in an **external source**. Middleware does not treat Salesforce as the content CMS for this delivery. All sources are adapted into one **standardized feed document**, then into `InsightArticle` for the mobile API. Global contract: [insights-feed.md](/04-integrations/insights-feed/).

---

## 1. Design goals

| Goal | Rule |
|---|---|
| External system of content | Firm website / blog / CMS owns publishing |
| Standard interchange | One JSON feed document schema — adapters map RSS, Atom, JSON Feed, or vendor CMS into it |
| Stable mobile contract | OpenAPI `InsightArticle` does not change when the transport or vendor changes |
| Same catalog this delivery | No per-client filtering in the provider path ([IC-03](/05-specs/06-insights/02-specify/) Won't) |

```text
┌──────────────┐   OpenAPI InsightArticle   ┌────────────────────┐
│  Mobile app  │ ◄────────────────────────── │    Middleware      │
└──────────────┘                             │  InsightsFeedPort  │
                                             └─────────┬──────────┘
                                                       │ normalize
                          ┌────────────────────────────┼────────────────────────────┐
                          ▼                            ▼                            ▼
                   RssAtomAdapter              JsonFeedAdapter              (Future) CMS API
                          │                            │
                          └────────────┬───────────────┘
                                       ▼
                         Standardized feed document (§2)
                         (HTTP GET from firm host)
```

---

## 2. Standardized feed document

Canonical interchange (what adapters **produce** and what a native JSON source **may publish directly**).

Media type: `application/vnd.onepoint.insights-feed+json` preferred; `application/json` accepted.

```json
{
  "specVersion": "1.0",
  "feedId": "onepoint-insights",
  "title": "OnePoint Insights & Commentary",
  "homePageUrl": "https://www.example.com/insights",
  "updatedAt": "2026-07-15T12:00:00Z",
  "items": [
    {
      "id": "guid-or-stable-slug",
      "title": "Market update: mid-year outlook",
      "summary": "Card excerpt for the app list.",
      "contentHtml": "<p>Optional full HTML body…</p>",
      "url": "https://www.example.com/insights/mid-year-outlook",
      "tags": ["Markets"],
      "authors": [
        {
          "name": "Investment Committee",
          "role": "investment_committee"
        }
      ],
      "publishedAt": "2026-07-10T15:00:00Z",
      "updatedAt": "2026-07-10T15:00:00Z",
      "imageUrl": "https://cdn.example.com/mid-year.jpg",
      "status": "published",
      "featured": false,
      "audience": "all",
      "language": "en"
    }
  ]
}
```

### 2.1 Item field rules

| Field | Req | Maps to `InsightArticle` | Notes |
|---|:---:|---|---|
| `id` | Yes | `external_id` | Stable across republish; RSS `guid` / Atom `id` / JSON Feed `id` |
| `title` | Yes | `title` | |
| `summary` | Yes* | `excerpt` | \*If absent, adapter derives from stripped `contentHtml` (≤512 chars) or title |
| `contentHtml` | No | `body_html` | Prefer when readable in-app |
| `url` | Soft | `body_url` | Required if `contentHtml` absent |
| `tags[0]` | No | `tag` | First tag used as primary card tag this delivery |
| `authors[].name` | Yes | `author_name` | First author |
| `authors[].role` | No | `author_role` | Enum: `investment_committee`, `planning`, `advisor`, `technology`, `cio`, `other` |
| `publishedAt` | Yes | `published_at` | ISO-8601 |
| `imageUrl` | No | `thumbnail_url` | |
| `status` | Yes | `status` | Only `published` items reach mobile; `draft` / `archived` skipped |
| `featured` | No | `is_featured` | Optional Home boost |
| `audience` | No | `audience` | Ignored for filtering this delivery (stored for later personalization) |

Rejection: Item without `id`, `title`, `publishedAt`, author name, and (`contentHtml` or `url`) is skipped and counted in adapter metrics — does not fail the whole feed.

---

## 3. Port — `InsightsFeedProvider`

| Method | Behavior |
|---|---|
| `fetchFeed()` | Returns standardized feed document (or throws typed upstream error) |
| `providerId()` | e.g. `rss_atom`, `json_feed`, `onepoint_json`, `fixture` |
| `sourceUri()` | Configured absolute URI (for ops) |

Middleware responsibilities after fetch:

1. Validate / skip invalid items.  
2. Upsert into store keyed by `external_id`.  
3. Expose via OpenAPI as `InsightArticle` (middleware UUID `id` ≠ `external_id`).  
4. Cache with TTL ≤ 15 minutes (**NFR-02**); serve last-good cache on upstream failure when available.

---

## 4. Adapters this delivery

### 4.1 RSS 2.0 / Atom

| Source | Standard field |
|---|---|
| `guid` / `id` | `id` |
| `title` | `title` |
| `description` / `summary` / `content:encoded` | `summary` / `contentHtml` |
| `link` | `url` |
| `pubDate` / `updated` | `publishedAt` |
| `dc:creator` / `author` | `authors[0].name` |
| categories | `tags` |

Config: `INSIGHTS_FEED_URL`, optional auth headers for private feeds.  
Note: Many firm sites are “RSS-ish” HTML dumps — adapter should be tolerant; prefer asking marketing for clean RSS/Atom or native JSON (§2).

### 4.2 JSON Feed 1.1

Map JSON Feed `items[]` into the standard document (straight field alignment). Preferred when the firm can publish it.

### 4.3 Native OnePoint JSON

If marketing can host the document in §2 directly, use `onepoint_json` adapter (identity transform + validation). **Best long-term** interchange.

### 4.4 Fixture

Non-prod `fixture` provider returns a canned standardized document — never enabled in production.

---

## 5. Replacing the source later

| Change | Impact |
|---|---|
| New RSS URL | Config only |
| WordPress / Contentful / custom CMS | New adapter → same standard document |
| Salesforce `Insight__c` | New adapter (not default this delivery) — mobile unchanged |
| Per-client feeds | Product + ADR (IC-03); may add query filters after normalize |

Do **not** change OpenAPI field names for a source swap.

---

## 6. Security & sanitization

- Fetch over HTTPS; pin allow-list host(s) in config.  
- Sanitize `contentHtml` before storing/serving (tags/attributes allow-list; no scripts).  
- Do not proxy arbitrary third-party HTML as middleware origin without sanitization.  
- Thumbnails: HTTPS only; mobile handles broken images.  
- No client-specific PII in feed items this delivery.

---

## 7. Salesforce

This delivery needs **no** insights objects in Salesforce. Household flag only:

| Flag | Source |
|---|---|
| `insights_enabled` | `Mobile_Feature_Flags__c.Insights_Enabled__c` ([configuration CFG-04](/05-specs/03-configuration/02-specify/#cfg-04--publish-the-domain-option-catalog)) |

---

## 8. Done when (SA / middleware)

- [ ] Standardized feed schema (§2) reviewed with marketing  
- [ ] At least one live adapter (RSS/Atom or JSON) **or** fixture path for pilot  
- [ ] Cache + last-good behavior matches NFRs  
- [ ] OpenAPI list + detail pass **IC-01** / **IC-02** demos  
- [ ] HTML sanitization owner assigned  
