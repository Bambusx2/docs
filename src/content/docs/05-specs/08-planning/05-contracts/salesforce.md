---
title: "E08 Planning — Salesforce Work Package"
---

> Global integration: [salesforce.md](/04-integrations/salesforce/) · [emoney.md](/04-integrations/emoney/)  
> Owner: Callaway · Consumers: Middleware  
> Required before: Planning tab demo  
> Behaviour: [../02-specify.md](/05-specs/08-planning/02-specify/) · API: [openapi.yaml](/05-specs/08-planning/05-contracts/openapi.yaml)

---

## 1. Purpose

Serve **planning read data** from Salesforce (eMoney → SF sync). Middleware computes **net worth** and **`planning_combined` allocation** from SF inputs. **Link and relink** open eMoney-hosted WebViews; the **relink URL** for broken accounts is read from Salesforce (`Linked_Account__c.Relink_Url__c` TBD) after eMoney→SF sync — not invented by mobile.

| Story | Data | Source |
|---|---|---|
| PL-01 Tab gating | Active plan + flags | SF |
| PL-02 Net worth | Computed NW, assets, liabilities | SF inputs + middleware |
| PL-03 Allocation | `planning_combined` slices | SF / middleware |
| PL-04 Plan probability | Plan probability % | SF |
| PL-05 Monte Carlo | Upside / median / downside % | SF |
| PL-06 Expenses | Simple or itemized expenses | SF |
| PL-07 Goals | Goal list | SF |
| PL-08 Linked accounts | Client-linked external accounts | SF |
| PL-09 Relink | `Linked_Account__c.Relink_Url__c` → eMoney WebView | SF URL + eMoney WebView |
| PL-10 Link institution | Middleware-issued eMoney WebView URL | eMoney (handoff) |

---

## 2. Objects (read)

| SF object | Middleware use |
|---|---|
| `Planning_Overview__c` | NW inputs (assets, liabilities, insurance cash value TBD, home value TBD), plan probability, Monte Carlo |
| `Financial_Goal__c` | Goals (**PL-07**) |
| `Expense_Item__c` | Expenses (**PL-06**) |
| `Linked_Account__c` | Linked accounts (**PL-08**); `Relink_Url__c (TBD)` for **PL-09** |
| `FinServ__FinancialAccount__c` | Orion balances for NW (managed AUM) |
| Allocation rollups (TBD) | `planning_combined` slices (**PL-03**) |
| `Mobile_Feature_Flags__c` | Planning flags |

Field maps: [data-model.md §4](/03-data/data-model/).

---

## 3. Net worth (middleware-computed)

Inputs from SF:

- Orion managed FA balances (visible household set)
- eMoney linked account balances (`feeds_planning` / held-away)
- Insurance cash value (`Planning_Overview__c.Insurance_Cash_Value__c` TBD — [ADR-038](/01-constitution/constitution/#adr-038--net-worth-calculation))
- Home / real-estate value when synced (`Planning_Overview__c.Home_Real_Estate_Value__c` TBD — [ADR-043](/01-constitution/constitution/#adr-043--real-estate-zillow-home-value))
- eMoney liability totals

Rules:

- Orion wins when the same account number exists in Orion and eMoney.
- Do not use eMoney `Net_Worth__c` as the displayed headline value.
- Include real-estate home value when synced.

---

## 4. Allocation (`planning_combined`)

- Separate taxonomy from `portfolio_orion` — do not remap codes between scopes.
- Slices: `code`, `label`, `value`, `percent`, `as_of`.
- Orion managed value + eMoney held-away investment value; Orion wins duplicates.

---

## 5. Linked accounts visibility

- Include client-linked / held-away aggregation rows only (`linked_by` is **middleware-computed** — not a required SF column).
- Exclude Orion-managed FAs (those appear on Portfolio only).
- `institution_name` required on every row.
- Broken rows expose `Relink_Url__c` when present (**PL-09**).

---

## 6. Test data (sandbox)

| Household | Purpose |
|---|---|
| A — active eMoney plan, all sections populated | PL-01–PL-08 happy |
| A — broken linked account | PL-09 |
| B — `planning_enabled` false | Tab hidden |
| C — no eMoney plan | Tab hidden |

---

## 7. Done when

- [ ] `Planning_Overview__c` readable for demo household (incl. TBD NW insurance/home fields or documented omit)  
- [ ] Goals, expenses, linked accounts readable or explicitly empty  
- [ ] `Linked_Account__c.Relink_Url__c` (or agreed name) for broken-account demo  
- [ ] Planning flags togglable  
- [ ] eMoney WebView link URL available for **PL-10**; relink uses SF URL → WebView for **PL-09**  
