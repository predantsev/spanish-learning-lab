# Content and review tools

Node 24 runs these TypeScript files directly (`node <file>.ts`). Every command accepts
`--source <dir>` (default `content/source`), `--ledger <file>` (default
`docs/contracts/curriculum-ledger.json`) and, where relevant, `--reviews <dir>` (default
`content/reviews`), so they can run against a synthetic corpus.

| Command | Purpose |
|---|---|
| `node tools/content/load.ts` | Schema-validate every source file (Ajv 2020, strict, no coercion) and print counts. |
| `npm run content:validate` | Release gate A-31. Exit 1 on errors; warnings printed separately. `--allow-incomplete` reports completeness gaps as warnings; `--verify-signatures` checks receipt HMACs with the local key; `--json`. |
| `npm run content:coverage` | Writes `content/reports/coverage.json` (`--out` to redirect) and prints a summary. |
| `node tools/content/pack.ts --out <dir>` | Builds an immutable pack; `--verify <dir>` re-hashes one. |
| `node tools/review/review.ts packet\|run-codex\|apply\|promote` | Privileged local review workflow (never exposed over HTTP). |

## Identity and hashes

- Canonical JSON: keys sorted, no whitespace, UTF-8 (`canonical.ts`).
- **Content hash** of an entity = SHA-256 of the canonical body **without `reviewStatus`**. Review
  and validation receipts bind to it, so status changes never invalidate them, while any content
  edit does.
- **revisionId** = first 16 bytes of `sha256(kind|logicalId|canonicalJSON(body))` with the RFC 9562
  version-8 and variant bits set, rendered as a UUID.
- `sourceDigest` = SHA-256 over the sorted `[path, canonical sha256]` list of source files;
  `coverageDigest` = SHA-256 of the canonical coverage report without its digest field.

## Validation

Schema; unique IDs (per kind, plus local option/variant/slot/step IDs); references between
lessons, tasks, skills, clips, phrases, collections, materials, situations, lexicon and sources;
every ledger lesson/check exactly once as a lesson file and every objective under ≥1 skill;
CV-01…CV-06 on ≥1 lesson and ≥1 skill; prerequisite DAG with prerequisites taught no later than
the dependent; tasks/clips target only skills taught no later than their lesson; outcome keys,
hint targets and slots restricted to the task's own targets; no adjacent template slots; `closed`
only on single-target exact-variants; answer-key self-consistency under the rule-4 checker
(`checker.ts`: accepted variants/exemplars/slot values check as correct, error variants never
collide with accepted ones after normalization); no TBD/FIXME/placeholder text in reviewed/ready
items (uppercase `TODO:` markers only — Spanish *todo* is ordinary text); ≥2 distinct clips per
listening target and a meaning task per clip; exactly 8 collections of 12 existing phrases; every
assessed target has a task; `reviewed` needs a verified opposite-provider review receipt and
`ready` a local validation receipt for the current hash. Warnings: bank size 8–12 / roles 2-4-4 /
≥2 families for productive grammar skills (kind orthography/form/exception/contrast/construction
with written-form or construction-use) unless `bankJustificationUk`; language heuristics (Cyrillic
in `*Uk` fields, Latin-only `uk` blocks, Cyrillic in `es-ES` blocks, Russian-only letters); NFC.

The checker in `checker.ts` is a local mirror of content/README rule 4. **TODO:** switch
`checkTask` to the `@sll/domain` checker once that package exports it.

## Pack

`pack.json` (`schemaVersion`, `packId: "sll-a1-a2"`, `version` = `--version` or the root
package version, `minAppVersion`, `minSchemaVersion`, `createdAt` = `--created-at` or now,
`language: "es-ES"`, `instructionLanguage: "uk"`, `sourceDigest`, `coverageDigest`, `files[]`
with SHA-256/bytes, `counts`, `media[]`, `validation`, `preview: true` when built with
`--allow-unreviewed`), `entities.ndjson` (canonical lines `{kind, logicalId, revisionId, sha256,
state, body}`; `body` excludes `reviewStatus`, `state` carries it), `coverage.json`, and
`media/<sha256>.mp3`. The SHA-256 of `pack.json` is the pack hash. The output directory must not
exist or be empty; files are written to a staging directory, made read-only and renamed.

Release mode (no `--allow-unreviewed`) packs only `ready` entities and fails on validation errors,
on any required entity that is not ready (all ledger lessons/checks, all their tasks, skills,
lexemes, clips, collections and their phrases, referenced situations and sources; materials and
other phrases are optional) and on any packed clip without reviewed media.

`--media <dir>` reads `<dir>/index.json`: an array or `{ "entries": [...] }` of
`{ clipId, sha256, file?, durationMs, receiptIds: [uuid, …], rights: {…} | rightsRecordId }`.
An entry without `receiptIds` or rights is skipped; the file (default `<sha256>.mp3`) must match
its hash and be an MP3 stream.

## Review workflow

Keys: `$SLL_REVIEW_KEYS_DIR`, else `$SLL_HOME/keys`, else
`~/Library/Application Support/Spanish Learning Lab/keys/` (`review-hmac.key`, directory 0700,
file 0600, created on first use with a UUID `keyId`; loose permissions are refused). Tests and dev
runs must point one of the variables at a temporary directory.

1. `packet --lesson A1-01-L1 --author-provider anthropic [--author-model … --author-effort …]`
   (or `--skills a,b` ≤25, or `--items kind:id,…` ≤25 for collections/block materials). Writes
   `content/reviews/<batchId>/packet.json` (exact content, hashes, targets ≤30, prerequisite skills,
   source anchors, CONTENT-PLAN reviewer duties; `packetHash` over canonical JSON).
2. `run-codex --batch <id>` runs `codex exec --cd <repo> --sandbox read-only -m gpt-6.1-sol
   -c model_reasoning_effort=xhigh --ephemeral --json -o … --output-schema … -` with the prompt on
   stdin. The local `codex` wrapper only prefixes positional prompts, so the tool includes the
   English directive itself and stores `prompt.txt` exactly as sent, plus `events.jsonl`,
   `stderr.txt`, `last-message.txt`, `report.json`, `run.json` (command, versions, usage, file
   hashes) and a signed `receipt.json` (ExecutionReceipt) under `runs/<jobId>/`. Refused when the
   packet's author provider is `openai`. Reports cannot be imported; only an executed run yields a
   receipt.
3. `apply --batch <id>` verifies the receipt (HMAC, packet/report hashes, opposite provider) and
   sets `reviewed` (no blocking finding) or `needs-review` (findings kept in
   `findings-<jobId>.json`) for items whose hash is unchanged. Never sets `ready`, never edits text;
   touched files are rewritten as 2-space JSON.
4. `promote --batch <id>` sets `ready` only for `reviewed` items with a verified opposite-provider
   receipt for the current hash, no blocking finding and no validation error, and writes a signed
   validation receipt to `content/reviews/validation/<id>.json`.

All commands take `--dry-run`. `run-codex` accepts `--model`, `--effort`, `--repo`,
`--no-output-schema` and `--timeout-min`.
