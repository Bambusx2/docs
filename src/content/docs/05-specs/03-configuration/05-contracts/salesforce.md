---
title: "E03 Configuration — Salesforce Work Package"
---

> Purpose: Domain Salesforce build pack for configurable options, firm/book/household objects, and advisor/admin LWCs (including client-view preview).  
> Global integration: [salesforce.md](/04-integrations/salesforce/)  
> Owner: Callaway · Consumers: Middleware, advisors, admins  
> Required before: live flag toggle + preview demos  
> Behaviour: [../02-specify.md](/05-specs/03-configuration/02-specify/) · API: [openapi.yaml](/05-specs/03-configuration/05-contracts/openapi.yaml) · Resolution: [resolution.md](/05-specs/03-configuration/05-contracts/resolution/) · Overview: [../01-overview.md](/05-specs/03-configuration/01-overview/)

This file implements the global Salesforce contract for **Configuration**. It does not redefine that global. Invite-to-portal actions remain under [02-users Salesforce pack](/05-specs/02-users/05-contracts/salesforce/).

---

## 2. Objects

| API name | Purpose | Stories |
|---|---|---|
| `Firm_Feature_Policy__c` | Firm-mandatory keys | CFG-03 |
| `Advisor_Book_Feature_Defaults__c` | Defaults by primary advisor | CFG-03 |
| `Mobile_Feature_Flags__c` | Per-household overrides (lookup → Orion child Account) | CFG-02, CFG-04 |

Field-level maps: [data-model.md §2](/03-data/data-model/).

### 2.1 `Mobile_Feature_Flags__c` (household) — catalog columns

| SF field | Effective key |
|---|---|
| `Portfolio_Enabled__c` | `portfolio_enabled` |
| `Portfolio_Provider__c` | `portfolio_provider` |
| `Portfolio_YTD_Realized_GL__c` | `portfolio_ytd_realized_gl` |
| `Planning_Enabled__c` | `planning_enabled` |
| `Planning_Overview__c` | `planning_overview` |
| `Planning_Expenses__c` | `planning_expenses` |
| `Planning_Goals__c` | `planning_goals` |
| `Planning_Linked_Accounts__c` | `planning_linked_accounts` |
| `Planning_Monte_Carlo__c` | `planning_monte_carlo` |
| `Documents_Enabled__c` | `documents_enabled` |
| `Documents_Upload__c` | `documents_upload` |
| `Documents_DocuSign__c` | `documents_docusign` (default false until DOC-08) |
| `Insights_Enabled__c` | `insights_enabled` |
| `Team_Enabled__c` | `team_enabled` |
| `Team_Scheduling__c` | `team_scheduling` |
| `Profile_Enabled__c` | `profile_enabled` |

Audit: `LastModifiedById`, `LastModifiedDate`; optional `Updated_By_Role__c` (`advisor` \| `administrator`).

---

## 3. LWC / admin surfaces

| Surface | Role | Story |
|---|---|---|
| Per-client options | Advisor (book) | CFG-02 |
| Client-view preview (iframe → Neopix web `previewUrl`) | Advisor | CFG-02 · [ADR-047](/01-constitution/constitution/#adr-047--advisor-preview-requires-a-web-deliverable-client-surface) |
| Firm-mandatory editor | Admin | CFG-03 |
| Book defaults editor | Admin | CFG-03 |
| Bulk book toggle | Admin | CFG-03 |
| Reset households to new advisor defaults | Admin | CFG-03 |

UX rules: lock/hide firm-mandatory and platform-disabled controls; show clear labels for V2 keys that are not yet releasable.

---

## 4. Permission sets

| Set | Who | Grants |
|---|---|---|
| `Mobile_Feature_Advisor` | Advisors | Edit `Mobile_Feature_Flags__c` for eligible households; open preview |
| `Mobile_Feature_Admin` | Firm admins | Firm policy, book defaults, bulk, reset-on-transfer |

Eligibility for advisor edit/preview: same book-of-business spirit as invite permissions (Account Team / Owner) — exact Apex filter agreed with Callaway.

---

## 5. Sync expectations

| Topic | Rule |
|---|---|
| Direction | SF → middleware for option values |
| Cadence | With identity/flags sync batch; `dataAsOf` on `/config` |
| Writes from mobile | None for feature flags |

---

## 6. Test data (sandbox)

| Scenario | Purpose |
|---|---|
| Household A — portfolio on | CFG-01 visible tab |
| Same household — advisor turns portfolio off | Tab hidden after refresh |
| Firm-mandatory key on | Advisor cannot disable |
| New household under advisor with book defaults | Defaults copied |
| Bulk toggle book | All households updated |
| Transfer with overrides | Overrides preserved until admin reset |
| Preview for Household A | Matches client flags |

---

## 7. Done when

- [ ] Objects + fields deployed to sandbox  
- [ ] Advisor + admin LWCs usable (CFG-02 / CFG-03)
- [ ] Preview iframe loads Neopix **web** `previewUrl` (not native app) — [ADR-047](/01-constitution/constitution/#adr-047--advisor-preview-requires-a-web-deliverable-client-surface)
- [ ] Preview URL + service auth agreed with middleware
- [ ] Permission sets documented and assigned in sandbox  
- [ ] Sample data covers §6 scenarios  
