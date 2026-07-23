---
title: "E02 Users & Identity — Salesforce Work Package"
---

> Purpose: Domain Salesforce build pack for invite, portal status, profile proposals, and permission sets.  
> Global integration: [salesforce.md](/04-integrations/salesforce/) · [okta.md](/04-integrations/okta/)  
> Owner: Callaway · Consumers: Middleware, advisors, admins · Required before: live middleware invite integration  
> Behaviour: [../02-specify.md](/05-specs/02-users/02-specify/) · API: [openapi.yaml](/05-specs/02-users/05-contracts/openapi/) · Overview: [../01-overview.md](/05-specs/02-users/01-overview/)

This file implements the global Salesforce and Okta contracts for **Users & Identity**. It does not redefine those globals. Invite flow: SF action → middleware → Okta ([okta.md](/04-integrations/okta/)). Field API names marked elsewhere as `(TBD)` must be resolved here before Done.

---

## 1. Permission sets

| API name | Who | Grants |
|---|---|---|
| `Mobile_Portal_Admin` | Firm admins / ops | All mobile portal actions on any Person Account |
| `Mobile_Invite_Client` | Advisors on Account Team | Invite / resend / cancel / enable / disable / reset / remove on eligible records |

Invite eligibility rule (enforce in LWC/Apex): acting user is Person Account **Owner**, OR parent Account Team Member **and** has `Mobile_Invite_Client`, OR has `Mobile_Portal_Admin`.

---

## 2. Person Account fields

| API name | Type | Read-only for advisors | Values / notes |
|---|---|:---:|---|
| `Mobile_Status__c` | Picklist | Yes* | `not_invited`, `invited`, `active`, `disabled`, `removed` |
| `Mobile_Invite_Status__c` | Picklist | Yes | `not_invited`, `pending`, `syncing`, `sent`, `accepted`, `failed`, `cancelled` |
| `Mobile_Invited_By__c` | Text (255) or Lookup(User) | Yes | Set by MW |
| `Mobile_Invite_Last_Resent__c` | DateTime | Yes | |
| `Mobile_Invite_Last_Resent_By__c` | Text or Lookup(User) | Yes | |
| `Last_Mobile_Login__c` | DateTime | Yes | Interactive login only |
| `Okta_User_Id__c` | Text (128) | Yes | Cleared on remove |
| `Mobile_Terms_Accepted_At__c` | DateTime | Yes | |
| `Mobile_Terms_Accepted_Version__c` | Text (64) | Yes | |
| `Mobile_Privacy_Accepted_At__c` | DateTime | Yes | |
| `Mobile_Privacy_Accepted_Version__c` | Text (64) | Yes | |

\*Status changes only via actions (not manual edit), except `Mobile_Portal_Admin` may not bypass MW — actions always call middleware.

Profile display (read from Person Account / parent — [data-model.md §1.2](/03-data/data-model/)): **Client since** = Person Account `CreatedDate`. Suitability fields per **C-06**; `liquidity_needs` has no confirmed SF API name yet — omit until Callaway field audit.

Feature flags remain on existing household / `Mobile_Feature_Flags__c` pattern ([configuration specify](/05-specs/03-configuration/02-specify/)); include `Profile_Enabled__c`.

---

## 3. Actions (LWC / quick actions)

| Label | Call | Guards |
|---|---|---|
| Invite to client portal | `POST /api/v1/invites` | Person Account; valid PersonEmail; no open invite; not already active |
| Resend invitation | `.../resend` | Status pending/syncing/sent/failed; rate limit UX |
| Cancel invitation | `.../cancel` | Not accepted |
| Enable mobile access | `.../portal/enable` | Status disabled |
| Disable mobile access | `.../portal/disable` | Has mapping |
| Reset mobile password | `.../portal/reset-password` | Status active |
| Remove portal access | `.../portal/remove` | Confirm dialog |

Return MW error bodies to the advisor (validation, rate limit). Never display Okta passwords.

---

## 4. Custom object `Mobile_Profile_Proposal__c`

| Field | Type | Notes |
|---|---|---|
| `Person_Account__c` | Master-Detail or Lookup(Account) | Required |
| `Status__c` | Picklist | `pending`, `approved`, `rejected`, `superseded` |
| `Field_Diffs__c` | Long Text (JSON) | |
| `Submitted_At__c` | DateTime | |
| `Submitted_By_Client__c` | Text | Middleware ClientUser id |
| `Reviewed_By__c` | Lookup(User) | |
| `Reviewed_At__c` | DateTime | |
| `Review_Note__c` | Long Text | Optional client-safe note |

LWC: queue list on Person Account + Approve / Reject. On Approve: apply Field_Diffs to Person Account fields mapped in [C-06](/05-specs/02-users/02-specify/#c-06--view-my-personal-information), set Status approved, notify MW webhook/event for alert C-25. On Reject: Status rejected + event. Concurrent CRM change: block approve and refresh diffs.

Sharing: advisor of record / Account Team can review book; `Mobile_Portal_Admin` all.

---

## 5. Middleware call-out

- Named credential to middleware base URL  
- Auth: service bearer (`sfServiceAuth` in OpenAPI)  
- Timeout / retry: surface failure; do not mark SF success if MW fails  

---

## 6. Test data (sandbox)

| Record | Purpose |
|---|---|
| Person A — email valid, never invited | A-01 happy |
| Person B — invite sent | A-02 / A-10 |
| Person C — active mobile | A-04 / A-05 / login |
| Person D — disabled | A-03 |
| Person E — missing phone/address/DOB | C-08 |
| User with only Account Team + Mobile_Invite_Client | Permission test |
| User without access | Negative permission |

---

## 7. Done when

- [ ] All fields deployed to sandbox  
- [ ] All actions visible per permission matrix  
- [ ] Proposal object + LWC approve/reject works  
- [ ] Named credential reaches MW health or stub  
- [ ] Test data loaded  
- [ ] Neopix MW lead confirms payload shapes  

Reviewed: Callaway _____________ Date _____________
