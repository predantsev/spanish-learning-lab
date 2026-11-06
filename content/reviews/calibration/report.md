# A-32 text review calibration — report

Issue #111, brief 05, run on 2026-11-06 (UTC). This calibrates the opposite-provider **text review workflow**
(prompt, model, effort, output schema, CLI flags) before bulk authoring. It does **not** show that the course corpus
is correct, involves no human reviewer, and makes no retention or CEFR claim. Machine-readable results: `results.json`.
Pre-registration (thresholds, label hashes, every amendment before the runs it governs): `protocol.json`.

## Result

| Direction | Reviewer (resolved from tool output) | Main 40 (v1, corrected labels) | Repair cycle 1 (H1, prompt v2) | Repair cycle 2 (H2, prompt v3) | Final |
|---|---|---|---|---|---|
| **A** — Claude-authored → OpenAI | `gpt-6.1-sol`, effort `xhigh` (codex exec) | FAIL — 3 release-blocking misses | FAIL — 3 valid controls rejected without support | **PASS** (5/5 · 0 rejected · 3/3 · 0 misses) | **PASS, prompt v3** |
| **B** — fresh Claude reviewer | `claude-opus-5-5`, effort `medium` (claude -p, no tools, no advisor) | FAIL — 3 release-blocking misses, ambiguous 7/8 | **PASS** (5/5 · 0 rejected · 3/3 · 0 misses) | validation only: 5/5 · 0 rejected · **2/3** · 0 misses | **PASS, prompt v2** (v3 not fully validated for B) |

Thresholds (pre-registered, never lowered): release-blocking misses = 0; valid controls rejected without source support = 0;
seeded defect detection ≥ ceil(0.95 × n) (16/16 main, 5/5 held-out); ambiguous recognised as `uncertain` ≥ ceil(0.90 × n)
(8/8 main, 3/3 held-out). Seeded detection was perfect in every run (16/16 and 5/5); no run released a seeded defect.

**The bulk-review route is direction A** (the authoring workers are Claude, `work/briefs/09-authoring.md`) → use the
direction-A settings in "Recommended reviewer settings for bulk review" below.

## Truth sets

| Set | File | Cases | Flawed / valid / ambiguous | Notes |
|---|---|---|---|---|
| Main | `cases.json` (sha256 `d12c26f6…`) | 40 | 16 / 16 / 8 as authored; 16 seeded + 3 unintended / 13 / 8 after corrections | categories 12 tenses/participles, 8 reference/agreement, 8 orthography/prerequisites/Ukrainian, 12 listening/meaning |
| H1 | `cases-h1.json` (`049d0b7c…`) | 12 | 5 / 4 / 3 | fresh facts; seeded Ukrainian calque «апостроф»; «акут» trap |
| H2 | `cases-h2.json` (`ce5ac54b…`) | 12 | 5 / 4 / 3 | fresh facts; valid controls with ordinary unlisted words; one real untaught-prerequisite defect |

All 64 tasks and 18 clips validate against `content.schema.json` `$defs/Task` / `$defs/Clip` with strict Ajv 2020
(`node tools/calibration/validate-cases.ts <packet>` → "OK … all tasks/clips schema-valid, no label fields"). The ten
seeded defect types (wrong form ×2, wrong rule ×2, wrong stress/accent ×2, wrong meaning, unknown prerequisite ×2,
wrong key ×2, valid alternative rejected ×2, answer leakage, poor/incorrect Ukrainian, conflicting feedback/support
attribution) are all in the main set. Calibration tasks use the reserved task-number band **T9xx** (main T901–T940,
H1 T950–T961, H2 T970–T981) and `cal-*` families/clip ids; they must never be reused in `content/source`.

Hidden labels lived in `$TMPDIR/sll-calibration-labels/` (outside the repository and every reviewer working directory)
until all runs finished. `labels.json` is byte-identical to the hash committed before the first run
(`7f31d940…`); corrections are in a separate file.

## Source verification (before benchmarking)

`node tools/calibration/verify-sources.ts <labels> <source-spec> <out> <cache>` retrieved every cited source with plain
`curl`, recorded retrieval time, HTTP status, SHA-256 and a ≤300-character passage per needle
(`source-verification*.json`; raw pages stay outside the repository):

| Set | Sources | Labels with every cited passage found |
|---|---|---|
| Main | 41: 28 FundéuRAE, 2 Словник української мови (slovnyk.ua), 11 repository contracts | 40/40 |
| H1 | 14 (incl. СУМ «тильда» used for the corrections) | 12/12 |
| H2 | 15 | 12/12 |

Each passage was also read against its label's expected finding (author check, not independent). 34 main labels rest
on a published norm, 4 only on project contracts (cal-14, cal-19, cal-29, cal-30), 2 on both.
**Not retrievable**, recorded at 2026-11-06T00:19Z: `rae.es` DPD/DLE/S7 → HTTP 403 Cloudflare challenge ("Just a
moment..."), also for WebFetch; `cvc.cervantes.es` → HTTP 404 for every path including the root (registry sources
S1–S6, S9); the Internet Archive refused rae.es ("Please contact the site owner for access") and then rate-limited.
No bot-protection workaround was used.

## Runs

| Run | Packet / prompt | Started (UTC) | Duration | Cost / tokens | Notes |
|---|---|---|---|---|---|
| A-main | main / v1 | 00:20:24 | 375 s | 65,015 tokens | no shell commands executed |
| B-main | main / v1 | 00:20:24 | 260 s | $1.64 (list) | **contaminated**: consulted advisor `claude-fable-5-1` once |
| B-clean | main / v1 | 00:26:24 | 135 s | $0.63 | primary direction-B main run |
| A-h1-v2 | H1 / v2 | 00:42:23 | 336 s | 40,979 tokens | cycle-1 gate |
| B-h1-v2 | H1 / v2 | 00:42:23 | 69 s | $0.25 | cycle-1 gate |
| A-main-v2 | main / v2 | 00:42:24 | 497 s | 66,987 tokens | informational |
| B-main-v2 | main / v2 | 00:42:24 | 124 s | $0.59 | informational |
| A-h2-v3 | H2 / v3 | 00:54:43 | 265 s | 39,750 tokens | cycle-2 gate |
| B-h2-v3 | H2 / v3 | 00:54:43 | 53 s | $0.22 | validation of v3 for B |

Identities come from the tools' own output: the codex stderr banner (`model: gpt-6.1-sol`, `provider: openai`,
`reasoning effort: xhigh`, `sandbox: read-only`) and the claude JSON envelope (`modelUsage` → `claude-opus-5-5`; only
B-main also lists `claude-fable-5-1`). Versions: codex-cli 0.166.0, Claude Code 2.1.318. Each run directory
`runs/<runId>/` holds the exact command, raw output (`last-message.json` / `stdout.json`, `stderr.txt`), `parsed.json`,
`run-meta.json` and `evidence.json` (raw and committed SHA-256 per file; local paths redacted). Prompts-as-sent are
stored once per hash in `runs/prompts-as-sent/`; both directions always received byte-identical prompts
(`cmp` succeeded for every pair). Every reviewer JSON validated against the output schema with all cases returned in
packet order. The codex transcripts contain no `exec` entries, so the reviewer read no files, including the labels.

## Scores

Main set (strict definitions; "corrected" = labels after the evidence-backed corrections below):

| Run | Seeded | Unintended | Valid rejected | Ambiguous | Release-blocking misses | Precision / recall |
|---|---|---|---|---|---|---|
| A-main (original labels) | 16/16 | – | 0/16 | 8/8 | 0 | 1.00 / 1.00 → **PASS** |
| A-main (corrected) | 16/16 | 0/3 | 0/13 | 8/8 | 3 (cal-02, 21, 34) | 1.00 / 0.84 → FAIL |
| B-clean (corrected) | 16/16 | 0/3 | 0/13 | 7/8 (cal-28) | 3 | 0.94 / 0.84 → FAIL |
| B-main (corrected, contaminated) | 16/16 | 0/3 | 0/13 | 6/8 (cal-24, cal-28) | 4 (+cal-24 judged valid) | 0.94 / 0.84 → FAIL |
| A-main-v2 (corrected, informational) | 16/16 | 3/3 | 0/13 | 8/8 | 0 | 1.00 / 1.00 |
| B-main-v2 (corrected, informational) | 16/16 | 3/3 | 0/13 | 8/8 | 0 | 1.00 / 1.00 (cal-18 flagged uncertain) |

Held-out sets: A-h1-v2 5/5 · 3/4 valid rejected (unsupported) · 3/3 · 0 → FAIL; B-h1-v2 5/5 · 0/4 · 3/3 · 0 → PASS;
A-h2-v3 5/5 · 0/4 · 3/3 · 0 → PASS; B-h2-v3 5/5 · 0/4 · 2/3 · 0 → below the ambiguity threshold.

### Error table (every disagreement with a label)

| Case | Label | Run(s) | Verdict | Adjudication |
|---|---|---|---|---|
| cal-02, cal-21, cal-34 | flawed (corrected, unintended) | A-main, B-clean, B-main | valid | «тильда» used for the acute accent; both Opus runs noted the calque but explicitly did not count it; Sol did not mention it → missed (all three blocking) |
| cal-28 | ambiguous | B-main, B-clean | flawed/yes | Claimed «La» must be «Las» after «Marta y Lucía». A singular pronoun can take one conjunct, so the correction holds only under the 'both' reading; no retrievable source settles it; label kept, dispute recorded; item design (coordinated antecedent with *y*) invited the reading |
| cal-24 | ambiguous | B-main | valid/no | Saw the a ver/haber homophone but accepted the closed key ("Haber." is no plausible utterance); label kept (instruction: write what you heard, no context) → release-blocking miss in the contaminated run only |
| cal-18 | valid | B-main-v2 | uncertain/yes | taughtBefore lists the -duj- stem but not the strong endings condujo needs — a fair incomplete-context point; label kept; escalation flag, not a rejection |
| cal-h1-03, 06, 10 | valid | A-h1-v2 | flawed/yes | Rejected for ordinary words (mi/no/funciona, venir, muchos) missing from taughtBefore, read as exhaustive ("everything the learner has been taught"). The curriculum teaches them earlier (CURRICULUM lines 101, 142, 692; CONTENT-PLAN line 17) → unsupported rejections caused by the prompt's wording; fixed in v3 |
| cal-h2-05 | ambiguous | B-h2-v3 | flawed/yes | Stated the sentence does not rule out «viví», then called the closed choice a rejected valid answer → not recognised as uncertain; blocked, so not released |

No reviewer rejected a valid control on a linguistic claim; every flawed verdict on a seeded defect named the
labelled element. Secondary findings the reviewers got right about my packets are kept on record: «quedar» listed from a
later lesson (cal-04), «Todavía» also fitting cal-h2-01, «llegamos» present/preterite (cal-h2-06).

## Label corrections and disputes

`label-corrections.json`: cal-02, cal-21, cal-34 valid → flawed, release-blocking, poor/incorrect Ukrainian
(unintended). Evidence: СУМ «ТИЛЬДА … Друкарський знак, що має форму вигнутої риски (~)» (slovnyk.ua, HTTP 200,
2026-11-06T00:40:04Z); the integrator adopted `content/README.md` rule 6a and asked to score it as a blocking terminology
defect. Cases cal-06, 14, 15, 25, 35 carry the same term but were already flawed. Kept as labelled: cal-28 and cal-24
(above). Both original and corrected scores are reported; the corrected labels decide pass/fail.

## Repair cycles

1. **Prompt v2** (same models/efforts): rule-1 digest also allows a gloss in a hint (as `content/README.md` rule 1);
   a Ukrainian term used with a non-standard meaning is a blocking defect, quoting rule 6a; a correction that holds only
   under one of several readings must not be asserted ("uncertain"). Evaluated on fresh H1 → B passed, A failed.
2. **Prompt v3** (same models/efforts, direction A): `taughtBefore` is the mapped prerequisites, not an exhaustive word
   list; an unlisted item is a defect only when new/advanced for this point or when the answer depends on it.
   Evaluated on fresh H2 → A passed (including the real untaught-prerequisite case); B (validation) 2/3 ambiguous.

Both cycles were pre-registered (prompt and packet hashes, label hashes, thresholds) and committed before their runs.

## Recommended reviewer settings for bulk review

**Direction A — Claude-authored content → OpenAI reviewer (current authoring route). Validated (cycle 2).**

```bash
# <run>/packet contains ONLY packet.json; prompt.txt = reviewer-prompt.v3.md + blank line + packet JSON
CODEX_NO_LANG_DIRECTIVE=1 codex exec --cd <run>/packet --skip-git-repo-check --sandbox read-only \
  --ignore-user-config --disable memories -m gpt-6.1-sol -c model_reasoning_effort=xhigh --ephemeral \
  --output-schema <run>/output-schema.json -o <run>/last-message.json - < <run>/prompt.txt
```

- Prompt `prompts/reviewer-prompt.v3.md` (sha256 `c911aafe…`), schema `prompts/review-output.schema.json`
  (`232e9137…`); `tools/calibration/build-run.ts` + `run-direction-a.sh` + `parse-output.ts` do exactly this.
- Observed: 40 cases ≈ 6–8 min / ~66k tokens; 12 cases ≈ 4.5–5.5 min / ~40k tokens. Default batch: one lesson or
  ≤25 targets (CONTENT-PLAN); 40 cases per call worked.

**Direction B — OpenAI-authored content → Claude reviewer. Validated with prompt v2 (cycle 1).**

```bash
cd <run>/packet   # contains ONLY packet.json; prompt.txt = reviewer-prompt.v2.md + blank line + packet JSON
claude -p --model opus --effort medium --tools "" --safe-mode --setting-sources project,local \
  --no-session-persistence --output-format json --json-schema "$(cat <run>/output-schema.json)" < <run>/prompt.txt
```

- `--setting-sources project,local` is mandatory: without it the user-level `advisorModel` (Fable) is consulted even
  with `--tools "" --safe-mode` (run B-main). Observed: 40 cases ≈ 2 min / ~$0.6; 12 cases ≈ 1 min / ~$0.25.
- Prompt v3 on H2 recognised 2/3 ambiguous cases with Opus medium; prompt v2 is the configuration that met the gate.

**For both directions**

- Packet per task: `context` {lessonId, lessonTopic, `taughtBefore` = the mapped prerequisites, i.e. the assessed
  targets' earlier steps and every form, construction and new word the task depends on; targets}, `clips` for
  listening tasks, the complete Task JSON. No author reasoning, confidence or labels. Ukrainian follows rule 6a.
- `flawed` + blocking → author repair, new hash, fresh review. `uncertain` → CONTENT-PLAN escalation (fresh
  opposite-provider review at `xhigh` with exact source passages) or quarantine. A `flawed` verdict whose defect text
  says the context does not settle the reading should be routed like `uncertain` (Opus did this on cal-28, cal-h2-05).
- Reviewer citations are mostly "(from memory)": leads to verify, not evidence.
- Recalibrate when the model id, a CLI major version, the prompt or the output schema changes.

## Limitations

- Cases, labels and adjudication were produced by one Claude agent (Opus 5.5); adjudication is recorded with reasons
  (`adjudication*.json`) but is not independent.
- Direction B is same-provider (Claude reviews Claude-authored cases): it calibrates Opus as a reviewer, not the
  Sol-authored → Opus route.
- Authoritative RAE/ASALE and Instituto Cervantes pages were not retrievable (see above); four main labels rest only on
  project contracts.
- Held-out sets are small (12 cases), each configuration ran once, run-to-run variance is unmeasured (B passed H1 but
  missed 1/3 on H2). Efforts were not varied (Opus `xhigh`, Sol `high` untested), so the least costly passing
  configuration is not established.
- Codex loads the user's global `~/.codex/AGENTS.md` even with `--ignore-user-config` (a probe without an English
  instruction answered in Ukrainian); the prompt requires English output.
- Unintended defects in the calibration packets are documented above rather than hidden.

## Reproduce

```bash
node tools/calibration/validate-cases.ts content/reviews/calibration/cases.json
node tools/calibration/verify-sources.ts <labels.json> <source-spec.json> <out.json> <cache-dir>
node tools/calibration/build-run.ts <packet> <prompt> content/reviews/calibration/prompts/review-output.schema.json <run>
tools/calibration/run-direction-a.sh <run> xhigh gpt-6.1-sol      # or run-direction-b.sh <run> medium opus
node tools/calibration/parse-output.ts <run> a|b
node tools/calibration/score.ts <labels> <corrections|-> <adjudication> <scores.json> <runId>=<run> ...
node tools/calibration/export-run.ts <run> <runId>
node tools/calibration/assemble-results.ts content/reviews/calibration/results-narrative.json
```

Case scaffolds (they contain the labels) are in `tools/calibration/authoring/`.
