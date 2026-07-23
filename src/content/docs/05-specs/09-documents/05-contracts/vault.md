---
title: "E09 Documents — Vault Provider Contract"
---

> Global integration: [vault.md](/04-integrations/vault/)  
> Owner: Solutions architecture / middleware · Consumers: Mobile Docs tab  
> Behaviour: [../02-specify.md](/05-specs/09-documents/02-specify/) · API: [openapi.yaml](/05-specs/09-documents/05-contracts/openapi/) · ADR: [ADR-030](/01-constitution/constitution/#adr-030--document-vault-api-path) · Entity: [data-model.md §5](/03-data/data-model/)

Document **metadata, upload, and download** come from **eMoney Vault** via a replaceable **VaultProvider** port. Feature flags come from Salesforce. Binaries are never stored in middleware long-term. Global contract: [vault.md](/04-integrations/vault/).

---

## 1. Port — `VaultProvider`

| Method | Input | Output |
|---|---|---|
| `listDocuments(household, filter)` | `all` \| `needs_signature` \| `archive` | `Document[]` |
| `getDownloadUrl(document)` | Document id | `downloadUrl`, `expiresAt` |
| `uploadDocument(household, file)` | Multipart file | `Document` |
| `providerId()` | — | `emoney_vault` (this delivery) |

### Document metadata (maps to API)

| Field | Source |
|---|---|
| `id` | Middleware uuid |
| `vaultDocumentExternalId` | Vault document id |
| `name` | Vault name |
| `documentType` | Vault type → enum |
| `uploadedAt` | Vault uploaded timestamp |
| `uploadedBy` | Vault uploader role |
| `requiresSignature` | Vault / envelope status |
| `isArchived` | Vault archived flag |
| `externalSignUrl` | Vault-provided signing URL when present |

---

## 2. Filters

| Filter | Rule |
|---|---|
| `all` | `isArchived` = false |
| `needs_signature` | `requiresSignature` = true and signature not completed |
| `archive` | `isArchived` = true |

---

## 3. Download

- Middleware requests short-lived signed URL from vault.
- Default TTL documented with vault vendor; client refreshes on expiry.
- No binary streaming through middleware except as pass-through redirect if vault requires.

---

## 4. Upload

- Multipart POST accepted by middleware → vault upload API.
- Metadata synced to middleware cache after successful vault write.
- Max file size and MIME allowlist per vault vendor config.

---

## 5. Security

- Vault credentials only in middleware.
- Household scoping on every list/download/upload.
- Download URLs are single-household scoped and time-limited.

---

## 6. Done when

- [ ] Port + eMoney Vault adapter implemented **or** fixture adapter for demo  
- [ ] List filters match **DOC-02**–**DOC-04**  
- [ ] Upload and download paths verified in sandbox  
