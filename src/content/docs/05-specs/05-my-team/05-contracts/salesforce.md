---
title: "E05 Your Team — Salesforce Work Package"
---

> Global integration: [salesforce.md](/04-integrations/salesforce/) · [calendly.md](/04-integrations/calendly/)  
> Owner: Callaway · Consumers: Middleware, mobile  
> Required before: live team demo (fixtures OK until Done)  
> Behaviour: [../02-specify.md](/05-specs/05-my-team/02-specify/) · API: [openapi.yaml](/05-specs/05-my-team/05-contracts/openapi.yaml) · Scheduling: [scheduling.md](/05-specs/05-my-team/05-contracts/scheduling/)

---

## 1. Purpose

Expose the household’s **client-facing** advisory team from Salesforce so middleware can serve `GET /api/v1/team` and `home.team_preview` without inventing members.

Scheduling URLs are **not** stored as Calendly-specific CRM fields by default — see [scheduling.md](/05-specs/05-my-team/05-contracts/scheduling/). Optional SF flags only control *whether* a member may offer booking in the app.

---

## 2. Objects & fields

### 2.1 Account Team (standard) + custom fields

Query `AccountTeamMember` where `AccountId` = parent **Client Account** (not Person Account / not Orion child household).

| Field | Type | Required for UX | Notes |
|---|---|:---:|---|
| `UserId` | Lookup(User) | Yes | Advisor/staff user |
| `TeamMemberRole` | Picklist / text | Yes | Displayed as `role` |
| `Is_Primary__c` | Checkbox | Yes* | Lead advisor; *synthetic primary OK until deployed |
| `Sort_Order__c` | Number | Yes* | Home preview first 3; *synthetic sort OK until deployed |
| `Role_Type__c` | Picklist | Should | `advisor`, `associate`, `cpa`, `estate`, `operations`, `other` |
| `Mobile_Client_Facing__c` | Checkbox | Should | Explicit include for mobile; default true for known client-facing roles |
| `Mobile_Scheduling_Enabled__c` | Checkbox | Should | Member-level gate for Schedule affordance (AND household `team_scheduling`) |

\*If custom fields are not yet in sandbox, middleware applies: primary = first by role heuristic or Account Owner match; `sort_order` = index after primary-first + name sort. Document the synthetic rules in ops notes until fields ship.

### 2.2 User fields (read)

| Field | Maps to |
|---|---|
| `Id` | `sf_user_id` |
| `FirstName` / `LastName` / `Name` | names / `display_name` |
| `Email` | `email` (required for visible cards) |
| `Phone` | `phone` (optional) |
| `FullPhotoUrl` / `SmallPhotoUrl` | `photo_url` |
| `IsActive` | `is_active` |

### 2.3 Feature flags (household)

On `Mobile_Feature_Flags__c` (configuration pack):

| Flag | Behaviour |
|---|---|
| `Team_Enabled__c` → `team_enabled` | More → Your Team + Home preview |
| `Team_Scheduling__c` → `team_scheduling` | Schedule affordances |

---

## 3. Client-facing filter (enforce in middleware)

A member is returned only when **all** are true:

1. `User.IsActive` = true  
2. Email present  
3. Not operations: `Role_Type__c` ≠ `operations` **and** (`Mobile_Client_Facing__c` is true OR role is in firm allow-list)  
4. Linked to the authenticated client’s parent Account  

Operations / back-office staff never appear on mobile.

---

## 4. Sync expectations

| Topic | Rule |
|---|---|
| Direction | SF → middleware (read); no Account Team writes from mobile |
| Cadence | Same SF sync batch as identity/flags; `data_as_of` on team responses |
| Photo URLs | May require session or public CDN; mobile treats failure as initials (**NFR-03**) |
| Multi-member households | Team is on **parent** Account — both spouses see the same team list |

---

## 5. Test data (sandbox)

| Record | Purpose |
|---|---|
| Household A — 3+ client-facing members, one primary, phones on ≥1 | MT-01 / MT-02 happy |
| Household B — empty Account Team | Empty state; Home section hidden |
| Household C — scheduling enabled on 1 member only | Home Schedule single-member path |
| Household D — scheduling on 2+ members | Home Schedule → Team list |
| User with `Role_Type__c` = operations | Must **not** appear |

---

## 6. Done when

- [ ] `Is_Primary__c`, `Sort_Order__c` deployed **or** synthetic sort signed off  
- [ ] Client-facing filter rules documented and sample data matches  
- [ ] `Team_Enabled__c` / `Team_Scheduling__c` togglable on test households  
- [ ] Middleware can read Account Team for sandbox Account Ids used in demo  
- [ ] Optional: `Mobile_Scheduling_Enabled__c` on members used by Calendly mapping  
