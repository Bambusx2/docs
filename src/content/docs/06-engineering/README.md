---
title: "Engineering (discovery proposal → Phase B SoT)"
---

> Discovery delivers: a tech-spec proposal so the build team has a shared guideline.  
> Discovery locks: product behaviour (specify), decisions (ADRs), systems (architecture) — not Azure SKUs or library versions.  
> Build day one from: specify + contracts + architecture + this proposal; stub per [READY.md](/ready/).

Bundle: [README.md](/readme/) · [tech-spec-proposal.md](/06-engineering/tech-spec-proposal/)

---

## Contents

| Artifact | Status | Role |
|---|---|---|
| [tech-spec-proposal.md](/06-engineering/tech-spec-proposal/) | Proposed | How we intend to build — stack, structure, practices |
| `tech-spec.md` | After stack lock | Engineering **SoT** (pinned versions / SKUs / confirmed choices) |
| `openapi.yaml` (composed) | Optional / later | Merged pack OpenAPI — see [05-specs/README.md](/05-specs/readme/#pack--adr--contracts) |

---

## Rules

1. Specify / ADRs / architecture / integrations **win** over this folder on conflict.  
2. Do not put new user-visible behaviour only here — add it to specify.  
3. At stack lock: confirm or amend the proposal → write `tech-spec.md` → [CHANGELOG](/changelog/) + [VERSION](/VERSION).
