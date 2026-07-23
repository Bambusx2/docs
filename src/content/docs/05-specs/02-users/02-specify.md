---
title: "E02 Users & Identity — Specification"
---

> Scope: Invite-only client identity — Okta authentication, Salesforce provisioning actions, admin impersonation, identity sync, My Profile hub.  
> Source trail: Workshops 4, 3, 8 (external) · [data-model.md §1](/03-data/data-model/) · [ADR-007](/01-constitution/constitution/#adr-007--okta-invite-via-middleware) · [ADR-013](/01-constitution/constitution/#adr-013--roles-and-surfaces) · [ADR-046](/01-constitution/constitution/#adr-046--mfa-off-for-this-delivery-client-mobile) · [Figma — My Profile](https://www.figma.com/design/peO4G33tKiyu7RebDswKJb/OnePoint-App-UI?node-id=512-8983)
> Spec version: 1.0.0 · Last updated: July 17, 2026  
> Discovery package: [01-overview.md](/05-specs/02-users/01-overview/) (constraints, acceptance demo)  
> Delivery rules: [AGENTS.md](/agents/)

Stories carry MoSCoW tags; definitions in [specs README](/05-specs/readme/#moscow). Story bodies follow the index order. Each story is independently deliverable; **Depends on** does not expand acceptance. Client acceptance demo: [01-overview.md §8](/05-specs/02-users/01-overview/#8-acceptance-demo).

Contracts: [OpenAPI](/05-specs/02-users/05-contracts/openapi.yaml) is the machine-readable API source; this document defines behaviour. Salesforce build pack: [salesforce.md](/05-specs/02-users/05-contracts/salesforce/). Global integrations: [okta.md](/04-integrations/okta/) · [salesforce.md](/04-integrations/salesforce/). ---

## Non-functional requirements

| ID | Requirement |
|:---|:---|
| NFR-01 | Interactive login (credentials submitted → `/me` ready or wait state) completes within **5 seconds** p95 under normal load, excluding CRM sync wait (**C-19**). |
| NFR-02 | Middleware identity APIs availability target **99.5%** monthly (excluding planned maintenance). |
| NFR-03 | Tokens stored only in platform secure storage (Keychain / Keystore); never in AsyncStorage logs or crash reports. |
| NFR-04 | Logs and metrics **must not** include access tokens, refresh tokens, passwords, or full SSN; email is truncated. |
| NFR-05 | Profile API never returns full SSN/TIN; SSN last-4 only when present on Person Account. |
| NFR-06 | Impersonation audit retained **2 years** unless compliance sets a longer period. |
| NFR-07 | Auth failure responses are opaque (no account enumeration) for login, forgot-password, and disabled/removed users. |

---

## Story index

| ID | Actor | Story | MoSCoW | Cost |
|:---|:---|:---|:---|---:|
| [A-01](#a-01--invite-a-client-to-the-mobile-app) | Advisor | Invite a client to the mobile app | Must | 10 |
| [A-02](#a-02--resend-a-client-invitation) | Advisor | Resend a client invitation | Must | 2 |
| [A-03](#a-03--enable-a-clients-mobile-access) | Advisor | Enable a client's mobile access | Must | 2 |
| [A-04](#a-04--disable-a-clients-mobile-access) | Advisor | Disable a client's mobile access | Must | 2 |
| [A-05](#a-05--reset-a-clients-password) | Advisor | Reset a client's password | Must | 2 |
| [A-06](#a-06--view-invitation-status-in-salesforce) | Advisor | View invitation status in Salesforce | Must | 1 |
| [A-07](#a-07--remove-a-clients-portal-access) | Advisor | Remove a client's portal access | Must | 6 |
| [A-08](#a-08--view-last-mobile-login-in-salesforce) | Advisor | View last mobile login in Salesforce | Must | 1 |
| [A-09](#a-09--review-client-profile-proposals) | Advisor / staff | Review and apply or reject client profile proposals | Must | 6 |
| [C-01](#c-01--accept-my-invitation) | Client | Accept invitation / complete sign-up | Must | 10 |
| [C-02](#c-02--log-in-to-the-app) | Client | Log in (Okta OIDC) | Must | 6 |
| [C-03](#c-03--log-out) | Client | Log out | Must | 1 |
| [C-04](#c-04--reset-my-password) | Client | Forgot-password reset | Must | 1 |
| [C-05](#c-05--open-my-profile) | Client | Open My Profile hub | Must | 1 |
| [C-06](#c-06--view-my-personal-information) | Client | View personal information | Must | 2 |
| [C-07](#c-07--propose-profile-field-updates) | Client | Propose profile field updates | Must | 4 |
| [C-11](#c-11--view-terms-of-use) | Client | View Terms of Use | Must | 1 |
| [C-12](#c-12--view-privacy-policy) | Client | View Privacy Policy | Must | 1 |
| [C-18](#c-18--resume-an-existing-session) | Client | Resume an existing session | Must | 2 |
| [C-19](#c-19--wait-while-account-provisioning-completes) | Client | Wait while account provisioning completes | Must | 2 |
| [C-24](#c-24--accept-terms-of-use-and-privacy-policy) | Client | Accept current legal terms | Must | 2 |
| [C-25](#c-25--see-profile-proposal-decision) | Client | See profile proposal decision | Must | 2 |
| [C-26](#c-26--use-concurrent-devices-and-revoke-sessions) | Client / platform | Use concurrent devices and revoke sessions | Must | 6 |
| [AD-01](#ad-01--access-the-admin-identity-account) | Admin | Access admin identity account | Must | 1 |
| [AD-03](#ad-03--impersonate-a-client) | Admin | Impersonate a client | Must | 8 |
| [AD-04](#ad-04--end-impersonation) | Admin | End impersonation | Must | 1 |
| [S-01](#s-01--keep-identity-in-sync-with-salesforce) | Platform | Keep identity in sync with Salesforce | Must | 14 |
| [A-10](#a-10--cancel-a-pending-invitation) | Advisor | Cancel a pending invitation | Should | 2 |
| [C-08](#c-08--complete-missing-required-profile-fields) | Client | Complete missing required profile fields | Should | 2 |
| [C-09](#c-09--change-my-password-while-logged-in) | Client | Change password while logged in | Should | 2 |
| [C-20](#c-20--re-authenticate-after-email-change) | Client | Re-authenticate after email change | Should | 2 |
| [AD-02](#ad-02--list-enabled-client-users) | Admin | List enabled client users | Should | 1 |
| [AD-05](#ad-05--review-impersonation-audit-history) | Admin | Review impersonation audit history | Should | 1 |
| [SP-01](#sp-01--monitor-failed-user-syncs) | Support | Monitor failed user syncs | Should | 2 |
| [SP-03](#sp-03--monitor-invite-funnel) | Support / operations | Monitor invite funnel | Should | 3 |
| [C-10](#c-10--set-push-notification-preference) | Client | Set push notification preference | Won't | 2 |
| [C-13](#c-13--see-app-version) | Client | See app version | Could | 1 |
| [SP-02](#sp-02--monitor-in-progress-syncs) | Support | Monitor in-progress syncs | Could | 1 |
| [C-14](#c-14--request-deletion-of-my-app-account) | Client | Request deletion of app account | Won't | 8 |
| [C-15](#c-15--change-my-profile-photo) | Client | Change profile photo | Won't | 4 |
| [C-16](#c-16--receive-os-push-notifications) | Client | Receive OS push notifications | Won't | 12 |
| [C-17](#c-17--refer-a-friend) | Client | Refer a friend | Won't | 3 |
| [C-21](#c-21--complete-mfa-challenge) | Client | Complete MFA challenge | Won't | 8 |
| [C-22](#c-22--switch-active-household) | Client | Switch active household | Won't | 6 |
| [C-23](#c-23--unlock-with-biometrics) | Client | Unlock with biometrics | Won't | 4 |

---

## User stories

### A-01 — Invite a client to the mobile app

MoSCoW: Must  
As an advisor in Salesforce  
I want to invite a person to the client portal from their Person Account  
So that they can create an Okta account and access the app.

Expected behavior:

- The advisor runs **Invite to client portal** on a Person Account (`IsPersonAccount = true`).
- The action is available only to a Salesforce User who is the Person Account **Owner**, an Account Team Member on the parent Account with custom permission `Mobile_Invite_Client`, or assigned the `Mobile_Portal_Admin` permission set.
- Middleware reads the CRM identity tree required for `/me` (Person Account → parent Account → child household Accounts and related Financial Accounts as defined in [data-model.md](/03-data/data-model/) §1.3), provisions an Okta user with `PersonEmail` as username, and sends the invitation email.
- Invitations do not expire. There is no public self-sign-up path.
- Each spouse or other Person Account is invited independently; each has one Okta user and one `ClientUser` mapping.
- Middleware `ClientInvite.status` progresses `pending` → `syncing` → `sent`, or to `failed` if provisioning fails.
- Salesforce invite status is updated (**A-06**).

Error and edge cases:

- Blank or invalid `PersonEmail` — action is blocked with a validation message; no Okta user is created.
- Non-person Account — action is unavailable.
- Open invite already exists (status `pending`, `syncing`, `sent`, or `failed`) — action is unavailable; the advisor uses **Resend invitation** (**A-02**).
- Client already accepted or mobile status is `active` — action is unavailable; message indicates the client already has access.
- More than one successful invite create for the same Person Account within five minutes — action is blocked until the five-minute window ends. Failed validation does not consume the limit.
- Middleware or Okta provisioning fails — `ClientInvite.status` = `failed` with an error message for support (**SP-01**); Salesforce reflects `failed`; the advisor retries after the fault is cleared.

Salesforce:

- Surface: Person Account action **Invite to client portal** (advisors for their book of business).
- SF → MW: identity tree for `/me` provisioning: name, `PersonEmail`, and household links.
- MW → SF: `Mobile_Invite_Status__c`; `Okta_User_Id__c` when the Okta user is created; `Mobile_Status__c` = `invited`.
- Passwords and tokens are never written to Salesforce.

---

### A-02 — Resend a client invitation

MoSCoW: Must  
As an advisor  
I want to resend an invitation email  
So that a client who did not receive or complete the first invitation can still join.

Depends on: A-01; invite not accepted.

Expected behavior:

- The advisor runs **Resend invitation** when invite status is `pending`, `syncing`, `sent`, or `failed`.
- Middleware syncs current `PersonEmail` from Salesforce to Okta, then sends a new invitation email to that address.
- `Mobile_Invite_Last_Resent__c` is updated on success.

Error and edge cases:

- Status `accepted` or `cancelled` — resend is unavailable.
- After cancel (**A-10**), the advisor must run a new invite (**A-01**).
- Blank or invalid `PersonEmail` — action is blocked until the email is corrected in Salesforce.
- Okta send fails — invite status = `failed`; Salesforce reflects `failed`; the advisor retries with **Resend invitation**.
- A resend attempted within 60 seconds of the prior successful resend, or after three successful resends in the rolling prior 24 hours, is blocked. Failed sends do not consume either limit.

Salesforce:

- Surface: Person Account action **Resend invitation** (enabled only for re-sendable statuses).
- SF → MW: current `PersonEmail`.
- MW → SF: `Mobile_Invite_Status__c`; `Mobile_Invite_Last_Resent__c`.

---

### A-03 — Enable a client's mobile access

MoSCoW: Must  
As an advisor  
I want to re-enable a previously disabled client  
So that they can log in again without a new invitation.

Depends on: A-04 (mobile status `disabled`).

Expected behavior:

- The advisor runs **Enable mobile access** on a Person Account with `Mobile_Status__c` = `disabled`.
- Middleware sets client status to `active` and re-enables the Okta user.
- The client authenticates with existing credentials. No new invite and no full CRM re-provision are performed.

Error and edge cases:

- No Okta mapping / never invited — enable is blocked; the advisor must invite (**A-01**).
- Portal access removed (**A-07**) — enable is unavailable; a new invite is required.
- Okta re-enable fails — middleware and Salesforce remain `disabled`; the advisor sees a failure; login remains denied.

Salesforce:

- Surface: Person Account action **Enable mobile access**.
- MW → SF: `Mobile_Status__c` = `active`.

---

### A-04 — Disable a client's mobile access

MoSCoW: Must  
As an advisor  
I want to disable a client's mobile login  
So that they cannot access the app without removing their portal record.

Expected behavior:

- The advisor runs **Disable mobile access**.
- Middleware marks the client `disabled` and disables the Okta user so authentication fails.
- Middleware revokes all refresh tokens across the client's devices (**C-26**).
- The Person Account, `Okta_User_Id__c`, and middleware CRM cache are retained.

Error and edge cases:

- Already `disabled` — action completes as success with no change.
- No mobile mapping — action is unavailable.
- Active sessions — token refresh and subsequent authenticated calls fail with the same generic authentication error used for unknown users. Local tokens are cleared on failed refresh (**C-18**).
- Okta disable fails — the Salesforce action reports failure; `Mobile_Status__c` is not updated to `disabled`.

Salesforce:

- Surface: Person Account action **Disable mobile access**.
- MW → SF: `Mobile_Status__c` = `disabled`.
- `Okta_User_Id__c` is retained.

---

### A-05 — Reset a client's password

MoSCoW: Must  
As an advisor  
I want to trigger a password reset for a client  
So that they can regain access without contacting support.

Expected behavior:

- The advisor runs **Reset mobile password** for an enabled client who has an Okta account (`Mobile_Status__c` = `active`).
- Middleware requests Okta’s password-reset flow for the current `PersonEmail`.
- On successful reset initiation, middleware revokes all refresh tokens for the client's devices as defined in **C-26**.

Error and edge cases:

- Client is `disabled`, removed, or never provisioned — action is blocked with guidance to enable or invite first.
- Blank `PersonEmail` — action is blocked until the email is set in Salesforce.
- Okta reset fails — the advisor sees a failure; no success confirmation is shown.
- More than three successful resets for the same Person Account within the rolling prior 24 hours are blocked. Failed attempts do not consume the limit.

Salesforce:

- Surface: Person Account action **Reset mobile password**.
- SF → MW: `PersonEmail` (delivery address via Okta).
- No password data is written to Salesforce.

---

### A-06 — View invitation status in Salesforce

MoSCoW: Must  
As an advisor viewing a Person Account  
I want to see the mobile invite state  
So that I know whether the client has been invited or has accepted.

Depends on: A-01.

Expected behavior:

- The Person Account displays read-only `Mobile_Invite_Status__c` with values: `not_invited`, `pending`, `syncing`, `sent`, `accepted`, `failed`, `cancelled`.
- When available, it also displays read-only `Mobile_Invited_By__c` (Salesforce User name and Id) and `Mobile_Invite_Last_Resent_By__c`.
- Status is updated by invite lifecycle write-backs (**A-01**, **A-02**, **A-10**, **C-01**).

Error and edge cases:

- Never invited — value is `not_invited`.
- Write-back lag or failure — support investigates via **SP-01**; advisors do not edit the field.
- Advisors cannot manually set invite status.

Salesforce:

- Surface: read-only `Mobile_Invite_Status__c`, `Mobile_Invited_By__c`, and `Mobile_Invite_Last_Resent_By__c` on Person Account.
- MW → SF: invite lifecycle status plus `ClientInvite.invited_by` and the last-resend actor.

---

### A-07 — Remove a client's portal access

MoSCoW: Must  
As an advisor  
I want to delete a client's mobile user  
So that they no longer have app access when the relationship ends.

Expected behavior:

- The advisor runs **Remove portal access** and confirms the action.
- Middleware deletes the Okta user and removes the `ClientUser` mapping.
- Middleware revokes all refresh tokens across the client's devices before deleting the identity mapping (**C-26**).
- Subsequent login attempts fail with the same generic authentication error used for unknown users.
- The Person Account and its CRM data remain unchanged except for mobile control fields listed below.

Error and edge cases:

- Already removed — action completes as success with no change.
- Partial failure (Okta deleted but middleware mapping remains, or the reverse) — login must fail; the inconsistency is visible to support (**SP-01**).
- Pending invite never accepted — removal also cancels the invite so the invitation link cannot complete sign-up.

Salesforce:

- Surface: Person Account action **Remove portal access** with confirmation.
- MW → SF: `Mobile_Status__c` = `removed`; `Mobile_Invite_Status__c` = `cancelled` when an open invite existed; `Okta_User_Id__c` cleared.

---

### A-08 — View last mobile login in Salesforce

MoSCoW: Must  
As an advisor viewing a Person Account  
I want to see the client’s last mobile login  
So that I can gauge app engagement.

Depends on: C-02 write-back.

Expected behavior:

- Read-only `Last_Mobile_Login__c` on the Person Account shows the timestamp of the latest successful interactive client login (**C-02**).
- Admin impersonation sessions (**AD-03**) do not update this field.
- Session resume (**C-18**) does not update this field.

Error and edge cases:

- Never logged in — field is blank.
- Write-back failed — field is stale; the client can still use the app; support investigates via **SP-01**.
- Advisors cannot edit the field.

Salesforce:

- Surface: read-only `Last_Mobile_Login__c` on Person Account.
- **MW → SF** on successful interactive client login only.

---

### A-09 — Review client profile proposals

MoSCoW: Must  
As an advisor or staff reviewer in Salesforce  
I want to approve or reject client-proposed profile changes  
So that CRM remains accurate without granting clients direct field write access.

Depends on: C-07 or C-08.

Expected behavior:

- Salesforce presents pending `Mobile_Profile_Proposal__c` records with Person Account, field diffs, `submitted_at`, and submitter.
- **Approve** writes proposed values to the Person Account. Identity-relevant fields (notably `PersonEmail` and name) then sync through **S-01** (SF → MW → Okta). An email change invalidates client sessions (**C-20**).
- **Reject** leaves the Person Account unchanged, marks the proposal rejected, and clears the client’s pending state on the next Profile refresh.
- Approver identity and decision timestamp are recorded for audit.
- On approval or rejection, middleware emits a decision event that creates or updates the client alert `profile_proposal_decided` for **C-25**.

Error and edge cases:

- Proposed values fail validation (for example invalid email) — approve is blocked with a validation message.
- Person Account values changed since the proposal was created — approve is blocked; the reviewer is shown refreshed current CRM values and must act on an updated proposal or dismiss.
- A newer pending proposal supersedes an older one — the older proposal cannot be approved.
- Post-approve sync to middleware or Okta fails — Person Account retains approved values; **S-01** / **SP-01** surface the failure until repaired.

Salesforce:

- Surface: `Mobile_Profile_Proposal__c` queue (LWC) on or linked from Person Account — list, diff, **Approve**, **Reject**.
- App → MW → SF: proposal records (pending diffs). Clients do not write Person Account fields directly.
- On approve: Person Account fields updated in Salesforce; then **SF → MW** (and Okta when email or name changes) via **S-01**.
- On reject: proposal status only; Person Account unchanged.

---

### C-01 — Accept my invitation

MoSCoW: Must  
As an invited client  
I want to complete sign-up from the invitation email  
So that I can use the OnePoint mobile app.

Depends on: A-01.

Expected behavior:

- The invitation email opens the HTTPS App Link / Universal Link `https://{mobile-host}/invite/{token}`. It opens the app when installed; otherwise, an interstitial presents App Store and Play Store buttons and then returns the client to Okta activation.
- Okta redirect URIs include the app scheme and HTTPS callback, both allowlisted in the Okta app configuration. The email must match the invited `PersonEmail`.
- First successful authentication sets invite status to `accepted` and sets `Mobile_Status__c` = `active`.
- If household data is not yet ready, the app shows the provisioning wait state (**C-19**).
- Before Home, the client accepts the current Terms of Use and Privacy Policy (**C-24**).
- Biometrics and PIN are out of scope ([ADR-031](/01-constitution/constitution/#adr-031--biometric-unlock)).

Error and edge cases:

- A malformed, unknown, cancelled, or removed token cannot complete sign-up; show “This invitation is no longer valid.” Invitations do not expire.
- Email or username mismatch — sign-up cannot complete.
- Status still `syncing` after authentication — show **C-19**, not Home with empty data.
- Status `failed` — show contact-advisor guidance; do not present an empty portfolio as success.

Salesforce:

- MW → SF: `Mobile_Invite_Status__c` = `accepted`; `Mobile_Status__c` = `active`.

---

### C-02 — Log in to the app

MoSCoW: Must  
As a client with an active account  
I want to log in with email and password  
So that I can access my household data.

Expected behavior:

- The app authenticates with Okta OIDC (authorization code + PKCE).
- On success, the app receives tokens (refresh token lifetime 1 year) and `/me` scoped to the correct `ClientUser` → parent `ClientAccount` → households.
- Middleware updates `ClientUser.last_login_at` and writes `Last_Mobile_Login__c` (**A-08**).

Error and edge cases:

- Wrong password, unknown user, `disabled` (**A-04**), or `removed` (**A-07**) — the same generic authentication error is returned (no account enumeration).
- Okta or network failure — retryable error; no partial session is established.
- Authentication succeeds but `/me` is not ready — **C-19**.
- `PersonEmail` changed in Salesforce — previous email cannot authenticate; the new email can (**C-20**, **S-01**).

Salesforce:

- MW → SF: `Last_Mobile_Login__c` on successful interactive client login.
- Passwords, tokens, and device secrets are never written to Salesforce.
- Profile fields are read from prior **SF → MW** sync (**S-01** / invite), not written by login.

---

### C-03 — Log out

MoSCoW: Must  
As a logged-in client  
I want to log out  
So that my session ends on this device.

Expected behavior:

- **Log out** on My Profile clears local session storage and requests refresh-token revocation for this device only; it does not sign out concurrent devices (**C-26**).
- The next protected API call requires a full login (**C-02**).

Error and edge cases:

- Revocation request fails (network) — local session is still cleared; server-side token remains until natural expiry.
- Already logged out — the login screen is shown.

Salesforce:

- No Salesforce write. `Last_Mobile_Login__c` is unchanged.

---

### C-04 — Reset my password

MoSCoW: Must  
As a client who forgot my password  
I want to reset it from the login screen via Okta  
So that I can regain access without my advisor.

Expected behavior:

- The login screen provides the Okta-hosted forgot-password flow.
- Reset communication is sent to the Okta username, which equals `PersonEmail` maintained by **S-01**.

Error and edge cases:

- Disabled, removed, or unknown email — outcome matches login (no confirmation that an account exists).
- This flow is separate from authenticated password change (**C-09**) and advisor-triggered reset (**A-05**).

Salesforce:

- No Salesforce write. Password material never leaves Okta.

---

### C-05 — Open My Profile

MoSCoW: Must  
As a logged-in client  
I want to open the My Profile hub  
So that I can reach released settings.

Expected behavior:

- When `profile_enabled` is true, My Profile is reachable from the app shell ([ADR-045](/01-constitution/constitution/#adr-045--nav-shell-v1-vs-v2-3-vs-4-tabs)) and from the gear control on the Personal Information screen.
- The hub shows the client’s name, avatar initials when no photo is present, and **Client since** when `Account.CreatedDate` (or mapped equivalent) is available via `/me`.
- The hub lists only sections for Must, Should, or Could stories that are released: Personal Information, Security, Legal, Log out, and version (when **C-13** ships). Notifications / push preference (**C-10**) and referrals (**C-17**) are Won't this delivery.
- The Push Notifications toggle row is omitted while **C-10** is Won't.
- When alerts are released, the top-nav bell opens notifications / Action Required per [10-alerts/02-specify.md](/05-specs/10-alerts/02-specify/).

Error and edge cases:

- Unauthenticated — Profile is not available; the app presents login.
- `profile_enabled` is false — Profile entry is hidden.
- A section’s story is not released — the row is omitted (no placeholder).

Salesforce:

- **SF → MW** (via `/me` / feature flags): display name, **Client since**, `Mobile_Feature_Flags__c.Profile_Enabled__c`.
- The hub does not write Salesforce.

---

### C-06 — View my personal information

MoSCoW: Must  
As a client  
I want to view my personal information on file  
So that I can confirm what OnePoint holds for me.

Depends on: C-05.

Expected behavior:

- Hub → **Personal Information** opens a read-only screen with header, avatar initials, name, **Client since**, and **Edit Profile** (entry to **C-07**).
- Fields shown when populated; empty values render as an em dash (—). Values are never invented:

| Section | Fields |
|---|---|
| Personal Information | Date of birth; SSN last 4 only; occupation; employer; phone; email |
| Address | Street; city; state; ZIP |
| Suitability | Risk tolerance; time horizon; investment objective; liquidity needs; annual income range; net worth range |

- Full SSN/TIN is never displayed or editable.
- Footer states that profile data is stored in Salesforce and that changes are reviewed by the advisory team.

Error and edge cases:

- Profile API unavailable — show last successfully cached profile with a retry control, or an error with retry if no cache exists. Fields are never fabricated.
- Partial CRM data — show populated fields; blank fields show an em dash.
- Unauthorized or `profile_enabled` false — screen is not available.

Salesforce:

- Source of truth: Person Account (and FinServ suitability fields mapped in [data-model.md](/03-data/data-model/) §1) via **SF → MW** profile read.
- This screen does not write Person Account fields. Updates are proposals (**C-07**, **C-08**) until staff approval (**A-09**).

---

### C-07 — Propose profile field updates

MoSCoW: Must  
As a client  
I want to propose edits to my profile fields  
So that staff can review and apply them in Salesforce.

Depends on: C-06.

Expected behavior:

- **Edit Profile** opens the field set defined in **C-06**. Photo controls are omitted (**C-15** Won't).
- **Submit Changes For Review** creates a proposal. Person Account fields are not updated by this action ([ADR-022](/01-constitution/constitution/#adr-022--phase-1-explicit-exclusions)).
- **Cancel** discards unsaved edits and returns to read-only **C-06** without creating a proposal.
- UI states: success (sent for review; pending proposal remains visible until staff acts); error (retry); warning (client-side validation before submit).
- Footer states that changes are reviewed by the advisory team.
- Staff approve/reject UI is covered by **A-09**.

Error and edge cases:

- Validation failure — submit is blocked; no proposal is created.
- Submit API failure — error state; form values are retained for retry.
- A pending proposal already exists — submitting a new proposal replaces the pending proposal; the prior pending proposal is marked superseded and cannot be approved.
- Staff rejects — on refresh, pending state clears; Person Account values are unchanged.
- Staff approves — on next Profile refresh, fields match Salesforce. If email changed, **C-20** applies.

Salesforce:

- App → MW → SF: proposal record (Person Account Id, field diffs, `submitted_at`, status `pending`) for the **A-09** queue.
- Person Account field values are written only on **A-09** approve.

---

### C-11 — View Terms of Use

MoSCoW: Must  
As a client  
I want to open the firm’s Terms of Use  
So that I can read the legal terms.

Depends on: C-05.

Expected behavior:

- My Profile → Legal → **Terms of Use** opens the Terms URL from middleware configuration in an in-app browser.
- The URL is not embedded in the app binary.

Error and edge cases:

- URL missing or unreachable — clear error; Profile hub remains usable.

Salesforce:

- No Salesforce involvement.

---

### C-12 — View Privacy Policy

MoSCoW: Must  
As a client  
I want to open the firm’s Privacy Policy  
So that I can read how my data is used.

Depends on: C-05.

Expected behavior:

- My Profile → Legal → **Privacy Policy** opens the Privacy URL from middleware configuration in an in-app browser.

Error and edge cases:

- URL missing or unreachable — clear error; Profile hub remains usable.

Salesforce:

- No Salesforce involvement.

---

### C-18 — Resume an existing session

MoSCoW: Must  
As a client who previously logged in  
I want the app to restore my session when I reopen it  
So that I do not re-enter credentials on every launch.

Depends on: C-02; local secure storage.

Expected behavior:

- On cold start, the app uses the stored refresh token to obtain an access token and call `/me` without presenting the login screen when the session is valid.
- Refresh token lifetime is 1 year (same as **C-02**).

Error and edge cases:

- Refresh expired, revoked, or user `disabled`/`removed` — local tokens are cleared; login is shown with a generic message.
- Transient network error — retryable wait state; tokens are retained unless Okta returns `invalid_grant`.
- Email changed under an active session — session is invalid; **C-20** applies.

Salesforce:

- No Salesforce write on resume. `Last_Mobile_Login__c` is updated only by interactive login (**C-02**).

---

### C-19 — Wait while account provisioning completes

MoSCoW: Must  
As an invited client whose CRM sync is still running  
I want a clear account setup experience  
So that I wait instead of seeing an empty or broken Home screen.

Depends on: A-01 invite in `syncing`.

Expected behavior:

- After authentication, if household data is not ready, the app shows a dedicated waiting state with copy and a retry control.
- The app polls `/me` every three seconds for up to 120 seconds. When it reports ready, the app navigates to Home.
- Salesforce shows `syncing` on `Mobile_Invite_Status__c` until middleware completes (**A-06**).

Error and edge cases:

- Timeout or invite `failed` — show a contact-advisor fail state; no empty portfolio is presented as success.
- Retry starts a new 120-second polling window; while still syncing, remain on the wait state.
- Sync complete but `/me` errors — recoverable error state, not silent navigation to Home.

Salesforce:

- Status is driven by the invite/sync job started from **SF → MW** at invite time.
- The wait UI does not write Salesforce. Failures set `Mobile_Invite_Status__c` = `failed` (**MW → SF**) and appear in **SP-01**.

---

### C-24 — Accept Terms of Use and Privacy Policy

MoSCoW: Must  
As a client completing my first successful authentication  
I want to accept the current Terms of Use and Privacy Policy  
So that I can access the app under the current legal terms.

Depends on: C-01 or C-02.

Expected behavior:

- After successful authentication and before Home, the app retrieves configured Terms and Privacy version ids and presents both documents with required acceptance controls.
- `POST /api/v1/legal/accept` stores the accepted Terms version id, Privacy version id, and timestamp on `ClientUser`.
- Home remains blocked until both current versions are accepted. The client is prompted again only when either configured version id changes.

Error and edge cases:

- Legal configuration or document URL is unavailable — Home remains blocked; show a retryable contact-support state.
- Acceptance write fails — retain the legal screen and show retry; do not record a partial acceptance.
- A stale app submits an old version — middleware rejects it and returns the current versions for acceptance.

Salesforce:

- MW → SF: write `Mobile_Terms_Accepted_At__c`, `Mobile_Privacy_Accepted_At__c`, and their accepted version-string fields to the authenticated Person Account.
- No legal acceptance is accepted from Salesforce; middleware is the acceptance system of record.

---

### C-25 — See profile proposal decision

MoSCoW: Must  
As a client who submitted a profile proposal  
I want to see whether staff approved or rejected it  
So that I know the outcome of my requested changes.

Depends on: A-09; alerts framework.

Expected behavior:

- An A-09 approval or rejection produces or updates an in-app Action Required item and Profile banner of type `profile_proposal_decided` ([10-alerts AR-07](/05-specs/10-alerts/02-specify/#ar-07--see-my-profile-proposal-decision)), with the outcome and reviewed timestamp.
- The item clears when the client dismisses it or views the decision detail. Approved profile values appear after **S-01** completes.

Error and edge cases:

- Alert delivery or refresh is delayed — the proposal status remains available through Profile refresh; the alert is retried idempotently.
- The client has multiple decisions — each proposal decision is independently identifiable; a newer decision does not overwrite an unread earlier decision.

Salesforce:

- No app-to-Salesforce write. **A-09 → middleware → alerts** is the decision-event path.

---

### C-26 — Use concurrent devices and revoke sessions

MoSCoW: Must  
As a client or platform operator  
I want concurrent devices to be supported and security actions to revoke all device sessions  
So that access is convenient without weakening account recovery controls.

Expected behavior:

- A client authenticates and retains valid sessions on multiple devices.
- **C-03** logout revokes only the refresh token for the current device.
- Middleware revokes all refresh tokens for the Person Account's Okta user on **A-04** disable, **A-07** removal, successful **A-05** advisor password reset, successful **C-09** password change, and `PersonEmail` change through **S-01/C-20**.

Error and edge cases:

- A global revocation call fails — the originating action is reported failed and its mobile-status or password-change success state is not confirmed until revocation succeeds; the failure is recorded in **SP-01**.
- A device is offline during revocation — it loses access on the next token refresh or authenticated API call.

Salesforce:

- No session tokens or device identifiers are written to Salesforce. Salesforce-triggered actions invoke middleware, which performs the Okta revocation.

---

### AD-01 — Access the admin identity account

MoSCoW: Must  
As an administrator  
I want an admin account in the identity provider  
So that I can perform support actions outside the client role.

Expected behavior:

- Admin users exist in Okta and are provisioned by operations (not self-service, not via **A-01**).
- Admin authentication uses a role distinct from client.
- Advisors have no mobile app login (Workshop 3).

Error and edge cases:

- Client credentials presented to admin tooling — access denied.
- Advisor mobile login attempt — access denied.

Salesforce:

- Administrators use Salesforce for CRM support. This story does not create a Salesforce-provisioned mobile admin via invite.

---

### AD-03 — Impersonate a client

MoSCoW: Must  
As an administrator  
I want to use the mobile app as a specific client  
So that I can reproduce support issues.

Depends on: AD-01; target client `Mobile_Status__c` = `active`.

Expected behavior:

- The admin starts impersonation of an enabled client.
- Middleware creates `AdminImpersonationSession` with admin identity, client identity, and `started_at`.
- Session `/me` and APIs match that client’s view. No client approval step is required.

Error and edge cases:

- Target `disabled`, `removed`, or never invited — impersonation is blocked.
- Non-admin caller — access denied.
- Client data not ready — provisioning wait (**C-19**), not empty Home.

Salesforce:

- No Salesforce write. Audit is stored in middleware (**AD-05**).
- Impersonation does not modify Person Account fields and does not update `Last_Mobile_Login__c`.

---

### AD-04 — End impersonation

MoSCoW: Must  
As an administrator  
I want to end an impersonation session  
So that I return to my admin context.

Depends on: AD-03.

Expected behavior:

- Ending impersonation restores the admin context and sets `ended_at` on the audit row.
- If the app is killed during impersonation, the session remains open until the admin ends it or an idle timeout of 60 minutes elapses, at which point middleware sets `ended_at`.

Error and edge cases:

- No active session — no-op; admin context is shown.

Salesforce:

- No Salesforce write.

---

### S-01 — Keep identity in sync with Salesforce

MoSCoW: Must  
As a platform  
I want Person Account identity fields to sync to middleware and Okta  
So that login email and display data remain accurate.

Expected behavior:

- Name, `PersonEmail`, mobile status, and profile fields used by the app sync **SF → MW** on a schedule and on CRM events.
- Multiple Person Accounts under one parent Account each have their own Okta user and `ClientUser`. `/me` is scoped only to the authenticated Person Account’s tree; clients cannot view another person's login or switch into a spouse's identity (**C-22** remains Won't).
- When `PersonEmail` or login display name changes, middleware updates Okta (**SF → MW → Okta**) and invalidates active client sessions (**C-20**).
- **MW → SF** write-back includes `Mobile_Invite_Status__c`, `Mobile_Status__c`, `Last_Mobile_Login__c`, `Okta_User_Id__c`, `Mobile_Invite_Last_Resent__c`, `Mobile_Invited_By__c`, `Mobile_Invite_Last_Resent_By__c`, and the legal acceptance fields in **C-24**.
- Profile proposals are applied in Salesforce first (**A-09**); this sync then propagates values to middleware and Okta.

Error and edge cases:

- Sync job fails — automatic retry; failure visible in **SP-01**. Okta email is not left partially updated without a recoverable failure record.
- Concurrent CRM edits — last successful Salesforce commit wins for Person Account fields; client changes still require **A-09**.
- Person Account deleted or merged — middleware fails closed for login when the Person Account mapping is broken; support remediates the mapping.

Salesforce:

- SF → MW: Person Account identity and profile fields (**C-06**) and household graph for `/me`.
- SF → MW → Okta: `PersonEmail` and name when login identity changes; email changes revoke all refresh tokens (**C-26**).
- MW → SF: `Mobile_Invite_Status__c`, `Mobile_Status__c`, `Last_Mobile_Login__c`, `Okta_User_Id__c`, `Mobile_Invite_Last_Resent__c`, `Mobile_Invited_By__c`, `Mobile_Invite_Last_Resent_By__c`, and C-24 legal acceptance timestamps and version strings.
- Never written to Salesforce: passwords, refresh tokens, device biometrics.

---

### A-10 — Cancel a pending invitation

MoSCoW: Should  
As an advisor  
I want to cancel a pending mobile invitation  
So that an invitation sent in error cannot be completed.

Depends on: A-01; invite not accepted.

Expected behavior:

- The advisor runs **Cancel invitation** when invite status is `pending`, `syncing`, `sent`, or `failed`.
- Middleware sets `ClientInvite.status` = `cancelled`. The invitation link and incomplete Okta activation cannot complete sign-up.
- Middleware deletes the incomplete Okta user created for the invite.
- Salesforce invite status shows `cancelled` (**A-06**).

Error and edge cases:

- Status `accepted` — cancel is unavailable; use **A-04** or **A-07**.
- Middleware cancel succeeds but Okta deletion fails — the invitation link still cannot complete sign-up; support is alerted (**SP-01**).
- Access required again after cancel — the advisor runs a new invite (**A-01**).

Salesforce:

- Surface: Person Account action **Cancel invitation**.
- MW → SF: `Mobile_Invite_Status__c` = `cancelled`; `Mobile_Status__c` cleared to `not_invited` when no prior accepted access existed; `Okta_User_Id__c` cleared.

---

### C-08 — Complete missing required profile fields

MoSCoW: Should  
As a client with incomplete required profile data  
I want to fill those fields from an alert or Profile cue  
So that my record is complete for compliance and servicing.

Depends on: C-07 proposal pipeline.

Expected behavior:

- Action Required item `missing_required_field` ([10-alerts AR-06](/05-specs/10-alerts/02-specify/#ar-06--complete-missing-profile-information)) deep-links to a form limited to the missing fields: phone (`PersonMobilePhone` or `Phone` — the phone requirement is satisfied when either field has a value), mailing street, city, state, postal code, and birthdate. Email is required for the invite and is not evaluated as missing after invitation.
- My Profile hub shows an attention cue on **Personal Information** while required fields are missing.
- Submit creates a staff-review proposal identical to **C-07**.
- The alert and hub cue clear only after **A-09** approval and **S-01** sync populate every required field in middleware.

Error and edge cases:

- Alert dismissed without submit — hub cue remains until fields are populated via approved proposal.
- Submit fails — error shown; alert and cue remain.
- Staff rejects — alert and cue remain while fields are still missing.
- Required-field configuration error — login and Home remain available; the cue reflects middleware’s current missing-field evaluation once configuration is corrected.

Salesforce:

- Same proposal write path as **C-07** (**App → MW → SF**). Person Account values change only after **A-09**.
- The required-field set is supplied by middleware configuration consumed by alerts; it is not hard-coded in the app binary.

---

### C-09 — Change my password while logged in

MoSCoW: Should  
As a logged-in client  
I want to change my password from Security settings  
So that I can update credentials without using forgot-password.

Depends on: C-05.

Expected behavior:

- My Profile → Security → **Change Password** opens the Okta change-password challenge.
- On success, subsequent logins use the new password. If Okta invalidates existing sessions, the client completes **C-02** again.
- On success, middleware revokes all refresh tokens across the client's devices, including this device; the client signs in again (**C-26**).

Error and edge cases:

- Challenge fails or is cancelled — return to Security; password is unchanged.
- Network failure mid-flow — no password is stored in middleware; the client retries or uses **C-04**.

Salesforce:

- No Salesforce write. Passwords are never stored in middleware or Salesforce.

---

### C-20 — Re-authenticate after email change

MoSCoW: Should  
As a client whose login email was updated in Salesforce  
I want a clear prompt to sign in again with the new email  
So that I am not left on an invalid session.

Depends on: S-01 session invalidation on email change.

Expected behavior:

- When `PersonEmail` changes on the Person Account, **S-01** updates the Okta username and invalidates active client sessions.
- The email-change session invalidation revokes all refresh tokens across the client's devices (**C-26**).
- The app clears the local session and presents login with messaging that credentials were updated and to contact the advisor if needed (no account enumeration).
- Authentication succeeds only with the new `PersonEmail`.

Error and edge cases:

- Salesforce email changed but Okta update failed — **SP-01** records the failure; support repairs Okta to match Salesforce before login works.
- Client attempts the previous email — generic authentication failure until the new email is used.
- This path is not a voluntary logout (**C-03**).

Salesforce:

- Trigger: `PersonEmail` (and name when login display identity changes) on Person Account.
- SF → MW → Okta: username/email update and session invalidation.
- No app write to Salesforce.

---

### AD-02 — List enabled client users

MoSCoW: Should  
As an administrator  
I want to list clients with active mobile accounts  
So that I can support access issues.

Expected behavior:

- The middleware admin API returns enabled clients with name, email, status, last login, and Salesforce Person Account Id.
- Each row links to the Person Account in Salesforce by Id.

Error and edge cases:

- No matches — empty list.
- Stale `Last_Mobile_Login__c` in Salesforce does not change the list; the list uses middleware `last_login_at`.

Salesforce:

- System of record for the list is middleware. Salesforce is opened by Person Account Id deep-link only. No Salesforce list view is required.

---

### AD-05 — Review impersonation audit history

MoSCoW: Should  
As an administrator  
I want to list past impersonation sessions  
So that support access is traceable.

Expected behavior:

- The admin API lists sessions: admin, client, start, end, duration.
- Records are retained in middleware per the platform retention policy.

Error and edge cases:

- No history — empty list.
- Session with no `ended_at` — listed as in progress.

Salesforce:

- Middleware is the system of record. No Salesforce mirror.

---

### SP-01 — Monitor failed user syncs

MoSCoW: Should  
As a support engineer  
I want to list failed user-data sync jobs  
So that I can remediate provisioning before clients are blocked.

Expected behavior:

- The operations view lists failures with Person Account Id, error, timestamp, and correlation id.
- Failed invites appear as `failed` on `ClientInvite` and on `Mobile_Invite_Status__c` (**A-06**).
- Each row deep-links to the Person Account in Salesforce.

Error and edge cases:

- No failures — empty list.
- Failure without Person Account Id — listed with correlation id only.

Salesforce:

- Deep-link by Person Account Id. Invite failure status is written by the invite lifecycle (**MW → SF**). No separate Salesforce sync-error object is required.

---

### SP-03 — Monitor invite funnel

MoSCoW: Should  
As an operations user  
I want invite funnel counts and conversion rates  
So that I can identify onboarding friction and follow up on client access.

Expected behavior:

- The operations view reports counts for invited, sent, accepted, first login, and failed invites, plus conversion rates for the trailing 7 and 30 days.
- Metrics are computed by middleware from the invite and authentication lifecycle and support drill-down to the Person Account through a Salesforce deep-link.

Error and edge cases:

- A lifecycle write or metric aggregation is delayed — the view labels its last calculated timestamp and retries the aggregation; it does not fabricate counts.
- A Person Account has been removed or merged — its historical event remains included in aggregate metrics, while the drill-down identifies that the Salesforce record is unavailable.

Salesforce:

- No new Salesforce object is created. Salesforce is used only for Person Account deep-links; middleware is the metric system of record.

---

### C-10 — Set push notification preference

MoSCoW: Won't
As a client  
I want to turn the push preference on or off  
So that the platform records whether I opt into OS push notifications.

Depends on: C-05.

Expected behavior:

- My Profile → Notifications → **Push Notifications** toggle persists on `ClientUser` in middleware.
- Default value is off.
- Enabling the toggle requests OS notification permission. If the OS denies permission, the preference remains off and the UI explains that notifications are not enabled.
- This story does not send OS pushes (**C-16**). In-app notifications are unchanged ([10-alerts/02-specify.md](/05-specs/10-alerts/02-specify/)).

Error and edge cases:

- Persist API fails — the toggle reverts; an error is shown.
- OS permission later revoked — preference is treated as off for delivery when **C-16** is in scope; the UI reflects the effective state.

Salesforce:

- App ↔ middleware only. No Salesforce sync for this preference.

---

### C-13 — See app version

MoSCoW: Could  
As a client  
I want to see the installed app version on Profile  
So that I know which build I am running.

Depends on: C-05.

Expected behavior:

- The Profile footer displays the local app version string from the binary.
- Minimum-version and force-update behavior are owned by [11-release/01-overview.md](/05-specs/11-release/01-overview/).

Error and edge cases:

- Version string unavailable — display `Unknown`; Profile remains usable.

Salesforce:

- No Salesforce involvement.

---

### SP-02 — Monitor in-progress syncs

MoSCoW: Could  
As a support engineer  
I want to see running invite and sync jobs  
So that I can confirm progress when a client reports waiting.

Expected behavior:

- The operations view lists in-progress invite and sync jobs with Person Account Id and `started_at`.
- Client-facing wait behavior is **C-19**.
- Each row deep-links to the Person Account in Salesforce.

Error and edge cases:

- Job exceeds the hung-job threshold — marked failed and appears in **SP-01**.

Salesforce:

- Deep-link by Person Account Id. In-progress state is also visible as `syncing` on `Mobile_Invite_Status__c` (**A-06**).

---

### C-14 — Request deletion of my app account

MoSCoW: Won't

---

### C-15 — Change my profile photo

MoSCoW: Won't

---

### C-16 — Receive OS push notifications

MoSCoW: Won't

---

### C-17 — Refer a friend

MoSCoW: Won't

---

### C-21 — Complete MFA challenge

MoSCoW: Won't

---

### C-22 — Switch active household

MoSCoW: Won't

---

### C-23 — Unlock with biometrics

MoSCoW: Won't

---
