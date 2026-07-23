---
title: "E05 Your Team — Specification"
---

> Scope: Client-facing advisory team from Salesforce — browse, call, email, Home preview, optional scheduling (Calendly adapter).  
> Source trail: Requirements draft · Workshops 1, 3 (external) · [data-model.md §7](/03-data/data-model/) · [ADR-001](/01-constitution/constitution/#adr-001--middleware-as-the-only-mobile-data-plane) · [ADR-034](/01-constitution/constitution/#adr-034--calendly-depth-in-v1)
> Spec version: 1.0.0 · Last updated: July 17, 2026  
> Discovery package: [01-overview.md](/05-specs/05-my-team/01-overview/) (constraints, acceptance demo)  
> Delivery rules: [AGENTS.md](/agents/)

Stories carry MoSCoW tags; definitions in [specs README](/05-specs/readme/#moscow). Story bodies follow the index order. Each story is independently deliverable; **Depends on** does not expand acceptance. Client acceptance demo: [01-overview.md §8](/05-specs/05-my-team/01-overview/#8-acceptance-demo).

Naming: Screen title **Your Team**. API routes use `/team` and flags `team_enabled` / `team_scheduling`. Only **client-facing** Account Team members appear — back-office / operations staff are excluded.

Contracts: [OpenAPI](/05-specs/05-my-team/05-contracts/openapi/) is the machine-readable API source; this document defines behaviour. Salesforce build pack: [salesforce.md](/05-specs/05-my-team/05-contracts/salesforce/). Scheduling port (Calendly adapter): [scheduling.md](/05-specs/05-my-team/05-contracts/scheduling/). Global integration: [calendly.md](/04-integrations/calendly/). ---

## Non-functional requirements

| ID | Requirement |
|:---|:---|
| NFR-01 | `GET /api/v1/team` returns within **1 second** p95 under normal load for a household with ≤20 team members. |
| NFR-02 | Logs and metrics must not include full phone numbers or email beyond truncated forms (local-part truncated / domain kept). |
| NFR-03 | Broken or expired `photo_url` values never leave a broken-image UI; the client falls back to initials without retry storms (at most one failed load per member per session). |

---

## Story index

| ID | Actor | Story | MoSCoW | Cost |
|:---|:---|:---|:---|---:|
| [MT-01](#mt-01--browse-and-reach-my-advisory-team) | Client | Browse and reach my advisory team | Must | 3 |
| [MT-02](#mt-02--see-my-team-on-home) | Client | See my team on Home | Must | 1 |
| [MT-03](#mt-03--schedule-a-meeting-with-my-team) | Client | Schedule a meeting with my team | Must | 6 |
| [MT-04](#mt-04--chat-with-my-advisory-team) | Client | Chat with my advisory team | Won't | 20 |
| [MT-05](#mt-05--refer-a-friend-or-share-advisor-contact) | Client | Refer a friend or share advisor contact | Won't | 3 |
| [MT-06](#mt-06--see-advisor-activity-feed) | Client | See advisor activity feed | Won't | 8 |

---

## User stories

### MT-01 — Browse and reach my advisory team

MoSCoW: Must  
As a logged-in client with team enabled  
I want to open Your Team, see who supports my household, and call or email them  
So that human support is easy to reach without hunting for contact details.

Expected behavior:

- Entry: **More → Your Team** (not a bottom tab).
- The screen is available only when effective flag `team_enabled` is true ([03-configuration CFG-04](/05-specs/03-configuration/02-specify/#cfg-04--publish-the-domain-option-catalog)). When false, the More row is omitted (not an empty shell).
- `GET /api/v1/team` returns the household’s client-facing `TeamMember[]` from Salesforce `AccountTeamMember` on the parent Client Account ([data-model.md §7.1](/03-data/data-model/)).
- Each card shows: **display_name** (SF `User.Name` — full name), **role** (SF `AccountTeamMember.TeamMemberRole` string), and avatar (**photo_url** when usable, otherwise computed **initials**).
- Members are ordered by `sort_order` ascending. Ties: `is_primary` first, then `display_name` A–Z.
- Only members with `is_active` = true **and** a client-facing role are returned. Members with `role_type` = `operations`, or that fail the firm client-facing filter in [salesforce.md](/05-specs/05-my-team/05-contracts/salesforce/), are excluded.
- **Call** launches the native dialer via `tel:` using `TeamMember.phone` when phone is present. When phone is missing, Call is hidden (Email remains).
- **Email** launches the native mail client via `mailto:` using `TeamMember.email`. Every visible card has email.
- No in-app VoIP or messaging in this story.

Error and edge cases:

- `team_enabled` false — Your Team is not reachable from More or deep links; deep links fall back to Home.
- Empty team list — show empty state copy: **Your advisory team will appear here**. Call/Email actions are absent.
- API failure — retryable error state with retry; do not invent members.
- Stale or broken `photo_url` — initials avatar; no broken-image glyph.
- Unauthenticated — team is not available; present login.
- Impersonation — team for the impersonated client household (same as client view).

Salesforce:

- Source: `AccountTeamMember` on parent Account → `User` (name, email, phone, photo, `IsActive`).
- Required for ordered UX: `Sort_Order__c`, `Is_Primary__c` on AccountTeamMember. Until deployed, middleware sorts primary-first then name and sets `sort_order` synthetically for the response ([salesforce.md](/05-specs/05-my-team/05-contracts/salesforce/)).
- Client-facing filter: Firm configures which `TeamMemberRole` / `Role_Type__c` / `Mobile_Client_Facing__c` values are client-facing; operations staff never appear.
- Middleware does not write Account Team records for this story.

---

### MT-02 — See my team on Home

MoSCoW: Must  
As a client on Home  
I want a short preview of my advisory team  
So that support contacts are visible without opening More.

Depends on: MT-01 data contract (`TeamMember`); Home shell from [04-home](/05-specs/04-home/01-overview/).

Expected behavior:

- Home section **Your Team** shows up to **3** members from `home.team_preview` — first by the same sort rules as **MT-01**.
- Each preview row: display name, role, avatar/initials (same fields as the full list).
- **View all** navigates to the Your Team screen (**MT-01**).
- Section is hidden when `team_enabled` is false **or** the team list is empty (no empty Home card).

Error and edge cases:

- Home loads before team — omit section until preview payload is present; do not flash an error card.
- Preview count under 3 — show available members only.
- `team_enabled` flips off after cache — section disappears on next `/home` or `/me` refresh.

Salesforce:

- Same source as **MT-01**. No additional SF writes. Preview is a middleware slice of the full team list.

---

### MT-03 — Schedule a meeting with my team

MoSCoW: Must  
As a client who wants a meeting  
I want to schedule time with a team member from Your Team or Home  
So that I do not hunt for a booking link outside the app.

Depends on: MT-01 (team cards). Home Schedule shortcut also depends on Home quick actions ([04-home](/05-specs/04-home/01-overview/)).

Expected behavior:

- Available only when effective flag `team_scheduling` is true. When false: hide **Schedule** on cards and hide the Home **Schedule** quick action; Call/Email from **MT-01** remain when `team_enabled` is true.
- On each team card, **Schedule** appears only when `schedulingAvailable` is true (≥1 active meeting offer from the SchedulingProvider).
- Opens a provider-agnostic HTTPS **`schedulingUrl`** in deep-link / in-app WebView ([ADR-034](/01-constitution/constitution/#adr-034--calendly-depth-in-v1)). The adapter is **Calendly** ([scheduling.md](/05-specs/05-my-team/05-contracts/scheduling/)); meeting medium (Zoom vs phone) is configured in the provider, not in OnePoint. Mobile does not call provider APIs or embed provider SDKs.
- Offers come from `GET /api/v1/team/{memberId}/meeting-types` ([openapi.yaml](/05-specs/05-my-team/05-contracts/openapi/)).
- If a member has **one** active offer → open that `schedulingUrl` directly.
- If a member has **multiple** active offers → present the scheduling sheet (offer names + durations from the API); choosing an offer opens that URL.
- Footer displays the `providerAttribution` string returned by the API — not a hardcoded provider id in app logic.
- **Home Schedule** quick action:
  - Hidden when `team_enabled` or `team_scheduling` is false, or when no member is schedulable.
  - If **exactly one** member is schedulable → open that member’s scheduling flow (same as tapping Schedule on their card).
  - If **more than one** member is schedulable → navigate to Your Team so the client chooses whom to schedule with (Schedule affordances visible).

Error and edge cases:

- Member has no offers while flag is on — hide Schedule on that card only.
- WebView / URL fails to load — show retryable error; do not claim the meeting was booked.
- Client closes WebView without booking — no app-side confirmation; no Salesforce write required.
- `team_scheduling` on but `team_enabled` off — team and Schedule are both hidden (team flag wins).
- Scheduling provider unavailable — treat as 503 / hide Schedule per [scheduling.md](/05-specs/05-my-team/05-contracts/scheduling/).

Salesforce / integrations
- Who schedules: SF member flag or mapping table ([salesforce.md](/05-specs/05-my-team/05-contracts/salesforce/), [scheduling.md](/05-specs/05-my-team/05-contracts/scheduling/)). Hide Schedule when not configured ([ADR-034](/01-constitution/constitution/#adr-034--calendly-depth-in-v1)).
- Offers: `MeetingType` via SchedulingProvider ([data-model.md §7.2](/03-data/data-model/)); Calendly adapter (API or static URL mode).
- No meeting outcome written back to Salesforce.

---

### MT-04 — Chat with my advisory team

MoSCoW: Won't

---

### MT-05 — Refer a friend or share advisor contact

MoSCoW: Won't

---

### MT-06 — See advisor activity feed

MoSCoW: Won't

---
