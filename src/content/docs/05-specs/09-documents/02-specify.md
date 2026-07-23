---
title: "E09 Documents — Specification"
---

> Scope: List, filter, upload, and download household documents via eMoney Vault (middleware VaultProvider); interim signature UX.  
> Source trail: Requirements draft · Workshop 3 (external) · [data-model.md §5](/03-data/data-model/) · [ADR-002](/01-constitution/constitution/#adr-002--salesforce-tier-a-default-source) · [ADR-030](/01-constitution/constitution/#adr-030--document-vault-api-path)
> Spec version: 1.0.0 · Last updated: July 17, 2026  
> Discovery package: [01-overview.md](/05-specs/09-documents/01-overview/) (constraints, acceptance demo)  
> Delivery rules: [AGENTS.md](/agents/)

Stories carry MoSCoW tags; definitions in [specs README](/05-specs/readme/#moscow). Story bodies follow the index order. Each story is independently deliverable; **Depends on** does not expand acceptance. Client acceptance demo: [01-overview.md §8](/05-specs/09-documents/01-overview/#8-acceptance-demo).

Naming: Tab **Docs**; attribution **Powered by eMoney Vault**. Flags `documents_enabled`, `documents_upload`; `documents_docusign` remains false this delivery.

Contracts: [OpenAPI](/05-specs/09-documents/05-contracts/openapi/) is the machine-readable API source; this document defines behaviour. Vault port: [vault.md](/05-specs/09-documents/05-contracts/vault/). Global integration: [vault.md](/04-integrations/vault/). ---

## Non-functional requirements

| ID | Requirement |
|:---|:---|
| NFR-01 | Document list returns within **1.5 seconds** p95 when vault metadata cache is warm. |
| NFR-02 | Download URLs are short-lived; expired URLs are refreshed on retry. |
| NFR-03 | Document binaries are stored in the vault only — not in middleware persistent storage. |
| NFR-04 | Upload and download are scoped to the authenticated client’s household. |

---

## Story index

| ID | Actor | Story | MoSCoW | Cost |
|:---|:---|:---|:---|---:|
| [DOC-01](#doc-01--open-the-docs-tab) | Client | Open the Docs tab | Must | 1 |
| [DOC-02](#doc-02--browse-all-documents) | Client | Browse all documents | Must | 4 |
| [DOC-03](#doc-03--see-documents-needing-signature) | Client | See documents needing signature | Must | 2 |
| [DOC-04](#doc-04--browse-archived-documents) | Client | Browse archived documents | Must | 1 |
| [DOC-05](#doc-05--download-a-document) | Client | Download a document | Must | 2 |
| [DOC-06](#doc-06--upload-a-document) | Client | Upload a document | Must | 6 |
| [DOC-07](#doc-07--open-document-from-action-required) | Client | Open document from Action Required | Must | 1 |
| [DOC-08](#doc-08--sign-document-in-app) | Client | Sign document in app | Won't | 16 |
| [DOC-09](#doc-09--use-jiffy-or-digital-intake) | Client | Use Jiffy or digital intake | Won't | 20 |
| [DOC-10](#doc-10--receive-document-push-notifications) | Client | Receive document push notifications | Won't | 2 |

Won't Cost **2** on **DOC-10** is incremental domain wiring on platform push (**C-16**); see [Cost](/05-specs/readme/#cost).

---

## User stories

### DOC-01 — Open the Docs tab

MoSCoW: Must  
As a client with documents enabled  
I want to open the Docs tab  
So that I can access files from my advisory team.

Expected behavior:

- Available when `documents_enabled` is true.
- Unavailable when `documents_enabled` is false — Docs tab hidden, Home Docs shortcut hidden, document Action Required items hidden.

Error and edge cases:

- `documents_enabled` false — 403 on Documents APIs; tab hidden.

Salesforce:

- `Mobile_Feature_Flags__c.Documents_Enabled__c` ([03-configuration CFG-04](/05-specs/03-configuration/02-specify/#cfg-04--publish-the-domain-option-catalog)).

---

### DOC-02 — Browse all documents

MoSCoW: Must  
As a client on Docs  
I want a list of my current documents  
So that I can find statements, tax files, and planning reports.

Expected behavior:

- Returns non-archived documents for the household.
- Each row includes: `id`, `name`, `uploadedAt`, `documentType` (`statement` | `tax` | `contract` | `plan` | `other`), `uploadedBy` (`client` | `advisor` | `system`), `requiresSignature`.
- Sorted by `uploadedAt` descending.
- Empty list when the household has no non-archived documents.

Error and edge cases:

- Vault unavailable — retryable error; list is not fabricated.

Integrations
- Document metadata from eMoney Vault via middleware ([vault.md](/05-specs/09-documents/05-contracts/vault/)).

---

### DOC-03 — See documents needing signature

MoSCoW: Must  
As a client with forms waiting to be signed  
I want documents that need my signature  
So that I can find what is outstanding.

Expected behavior:

- Returns documents where `requiresSignature` is true and signature is not completed.
- Each row includes the same fields as **DOC-02**, plus `externalSignUrl` when the vault provides one.
- **Sign** action: opens `externalSignUrl` in browser/WebView when present; otherwise shows the message **Signing in the app is coming soon**.
- Empty list when none pending.

Error and edge cases:

- `externalSignUrl` absent — Sign shows the coming-soon message only.

Integrations
- eMoney Vault metadata ([vault.md](/05-specs/09-documents/05-contracts/vault/)) · Home alerts: [10-alerts AR-04](/05-specs/10-alerts/02-specify/#ar-04--sign-a-document-waiting-for-my-signature).

---

### DOC-04 — Browse archived documents

MoSCoW: Must  
As a client on Docs  
I want archived documents separately  
So that my main list stays focused on current files.

Expected behavior:

- Returns documents where `isArchived` is true.
- Each row includes the same fields as **DOC-02**.
- Archived documents are excluded from **DOC-02**.

Error and edge cases:

- Empty list when no archived documents.

Integrations
- eMoney Vault metadata ([vault.md](/05-specs/09-documents/05-contracts/vault/)).

---

### DOC-05 — Download a document

MoSCoW: Must  
As a client  
I want to download a document  
So that I can save statements and tax forms locally.

Expected behavior:

- For document `{id}` in the household, returns a short-lived **download URL** and **expiresAt**.
- Binary is served from the vault via the signed URL — not from middleware storage.
- Client is authorized for the document’s household.

Error and edge cases:

- Unknown id — 404.
- Expired URL — client requests a fresh download URL.
- Vault unavailable — retryable error.

Integrations
- eMoney Vault signed URL ([vault.md](/05-specs/09-documents/05-contracts/vault/)).

---

### DOC-06 — Upload a document

MoSCoW: Must  
As a client  
I want to upload a file  
So that I can share it securely with my advisory team.

Expected behavior:

- Available when `documents_upload` is true.
- Accepts file upload; stores binary in eMoney Vault; returns new document metadata matching **DOC-02** row fields.
- New document appears in **DOC-02** after sync.
- Upload unavailable when `documents_upload` is false.

Error and edge cases:

- `documents_upload` false — upload returns 403.
- Vault reject or timeout — retryable error; partial upload is not committed.

Integrations
- eMoney Vault upload API ([vault.md](/05-specs/09-documents/05-contracts/vault/)).

Salesforce:

- `Mobile_Feature_Flags__c.Documents_Upload__c`.

---

### DOC-07 — Open document from Action Required

MoSCoW: Must  
As a client with a pending signature alert  
I want the alert to open the right document context  
So that I can act on it immediately.

Expected behavior:

- Deep link from `document_signature_pending` alert opens Docs on the **needs signature** list.
- When alert includes `documentId`, scrolls or opens that document in the needs-signature context.

Error and edge cases:

- Document no longer requires signature — alert resolves per [10-alerts AR-08](/05-specs/10-alerts/02-specify/#ar-08--see-alerts-clear-when-i-complete-them); deep link shows empty needs-signature list.

Integrations
- [10-alerts AR-04](/05-specs/10-alerts/02-specify/) · **DOC-03**.

---

### DOC-08 — Sign document in app

MoSCoW: Won't

---

### DOC-09 — Use Jiffy or digital intake

MoSCoW: Won't

---

### DOC-10 — Receive document push notifications

MoSCoW: Won't
