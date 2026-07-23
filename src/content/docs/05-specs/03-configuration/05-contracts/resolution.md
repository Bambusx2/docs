---
title: "E03 Configuration — Effective Flag Resolution"
---

> Purpose: Normative algorithm for merging platform + Salesforce layers into one effective flag map per household.  
> Global integration: [salesforce.md](/04-integrations/salesforce/) · [ADR-018](/01-constitution/constitution/#adr-018--effective-feature-flag-resolution)  
> Owner: Solutions architecture / middleware · Consumers: Mobile, Salesforce preview  
> Behaviour: [../02-specify.md](/05-specs/03-configuration/02-specify/) CFG-01 · API: [openapi.yaml](/05-specs/03-configuration/05-contracts/openapi/) · ADRs: [ADR-005](/01-constitution/constitution/#adr-005--platform-feature-flags-vs-salesforce-configurable-options) · [ADR-014](/01-constitution/constitution/#adr-014--feature-configuration-hierarchy) · [ADR-018](/01-constitution/constitution/#adr-018--effective-feature-flag-resolution) · Overview: [../01-overview.md](/05-specs/03-configuration/01-overview/)

Mobile never merges layers. Middleware publishes one **effective** map per household.

---

## 1. Layers

| Layer | Source | Role |
|---|---|---|
| Platform | Middleware / deploy config | What the binary and integrations support |
| Firm-mandatory | `Firm_Feature_Policy__c` | Always ON when `is_mandatory` |
| Book defaults | `Advisor_Book_Feature_Defaults__c` | Baseline for advisor’s book / new households |
| Household overrides | `Mobile_Feature_Flags__c` | Per Orion child household |

```text
platform (off wins)
    ∩
firm-mandatory (on wins over advisor off)
    ∩
book defaults
    ∩
household overrides
    →
effective flags → /me | /config | preview
```

Boolean “enabled” semantics: a feature is shown only when **every** applicable layer allows it, except firm-mandatory which **forces on** even if household/book say off.

Enum keys (e.g. `portfolio_provider`): platform constrains allowed values; SF stores the chosen value; invalid combinations fall back to platform default (`orion` for this delivery).

---

## 2. Algorithm (normative)

For each known catalog key `k` (CFG-04):

1. If `platform[k]` is false / unsupported → `effective[k] = false` (or enum default `none`). **Stop.**  
2. If firm policy marks `k` mandatory → `effective[k] = true`. **Stop** for booleans.  
3. Else let `base = book_defaults[k]` if present, else platform default for new keys.  
4. If household override for `k` is present → `effective[k] = household[k]`.  
5. Else → `effective[k] = base`.  
6. If `k` is a sub-flag (e.g. `planning_goals`) and master (`planning_enabled`) is effectively false → `effective[k] = false`.

V2 keys (`documents_docusign`, etc.): platform default **false** until release.

---

## 3. Platform flag store

Implementation choice (env, config service, or DB) is delivery-owned. Requirements:

- Changeable without mobile store release.  
- Readable by middleware at resolve time.  
- Auditable who flipped a platform key for a release.

Examples: DocuSign binary, InvestNet provider support, unfinished tabs.

---

## 4. Caching

- Resolve on `/me` and `/config` from last SF sync snapshot + live platform map.  
- Invalidate household resolution when SF sync updates that household’s flags or firm/book tables.  
- Preview sessions resolve at session start (and may refresh on interval ≤ 60s).

---

## 5. Done when

- [ ] Unit tests cover mandatory-on, platform-off, sub-flag gating, missing household row  
- [ ] `/me.flags` === `/config.flags` for same session  
- [ ] Preview uses identical function  
- [ ] Catalog keys match CFG-04 / data-model §2.3  
