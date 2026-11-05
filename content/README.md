# Course content source (A1–A2)

Original course material for Spanish Learning Lab. The normative format is
[`schemas/content.schema.json`](schemas/content.schema.json); production rules are in
[`docs/CONTENT-PLAN.md`](../docs/CONTENT-PLAN.md), evidence/checker rules in
[`docs/DOMAIN-SPEC.md`](../docs/DOMAIN-SPEC.md). Nothing here is a copy of a textbook: sources are
cited as inclusion anchors only, explanations/examples/texts are written for this course.
Synthetic audio files are generated from the transcripts below and are **not** stored in Git.

## Layout

| Path | One file per | Schema `$defs` |
|---|---|---|
| `source/sources.json` | registry of cited sources (`S1`…) | `SourceRegistry` |
| `source/situations.json` | situation/genre families used by the catalog (CV-06) | `SituationFile` |
| `source/skills/<blockId>.json` | atomic skill inventory of a block (WP-04 ledger) | `SkillFile` |
| `source/lexicon/<blockId>.json` | words first taught in a block | `LexiconFile` |
| `source/lessons/<lessonId>.json` | lesson or optional check (`A1-01-L1`, `A1-01-C1`) | `Lesson` |
| `source/tasks/<lessonId>.json` | every task owned by that lesson/check | `TaskFile` |
| `source/audio/<blockId>.json` | listening clip scripts of a block | `ClipFile` |
| `source/materials/<blockId>.json` | topic materials (Materials in topic) | `MaterialFile` |
| `source/phrases.json` | shared course phrase identities | `PhraseFile` |
| `source/collections.json` | the eight prepared collections × 12 phrase references | `CollectionFile` |
| `reviews/` | review packets, reports and receipt metadata (no private learner data) | — |
| `reports/` | generated `coverage.json` / `content-report.json` | — |

IDs are stable and never renumbered: objective `A1-01-O1`, lesson `A1-01-L1`, check `A1-01-C1`,
task `A1-01-L1-T01`, skill slug `participle.hecho`, clip `clip.…`, phrase `phrase.…`,
collection `collection.…`, material `material.…`, lexical item `lex.…`. A target is
`skillId/modality`; modalities: `written-form`, `context-choice`, `reading-meaning`,
`listening-meaning`, `dictation`, `phrase-recall`, `construction-use`.

## Authoring rules (binding)

1. **Teach before testing.** Every assessed skill has a `firstLesson`; a task may only assess a
   target whose skill is introduced in the same or an earlier lesson (by course order), and may only
   *use* words/forms that are introduced earlier or glossed in the prompt (example block or hint).
   A prerequisite is a skill id, so the validator can check the DAG.
2. **Atomic skills.** One skill per form/contrast/exception: each irregular participle, each
   irregular stem group, each person group where it is a distinct learning step, each meaningful
   accent pair that is actually assessed. Never “present tense learned”. Exceptions carry
   `scope.exceptionOf`. Vocabulary that is only support is `assessed: false`.
3. **Bank size.** Small productive grammar target: 10 reviewed task instances (accepted 8–12):
   2 `supported`, 4 `independent`, 4 `delayed`/`transfer` held-out, ≥2 `family` values and ≥2 task
   modes where meaningful. A smaller/larger bank needs `bankJustificationUk` on the skill.
   Listening target: ≥2 distinct clips (different utterance/context, not speed copies), ≥1 meaning
   task per clip; dictation is a separate optional task.
4. **Deterministic checking only** (DOMAIN-SPEC § Checking):
   - `choice`: each option lists `outcomes` per target key; the correct option marks all its
     targets `correct`. Distractors mark only the target they actually test as `incorrect`.
   - `exact-variants`: `accepted` lists every reviewed acceptable answer; `errors` lists reviewed
     wrong answers with per-target outcomes and Ukrainian feedback. An unlisted answer is
     `incorrect` only when `closed: true` and the task has exactly one target; otherwise it is
     `unresolved` (never a fake failure).
   - `finite-slots`: one text answer parsed against `template` (literals + slots). Each slot maps
     to one target and has its own accepted/error values; `closed: true` per slot makes an unlisted
     value incorrect for that slot only. A response that does not match the literals is
     `unresolved` for every target.
   - `rubric-review`: free writing. Exact match to an exemplar may be marked correct; anything else
     is `unresolved` with the reference shown as an example, never as the unique answer.
   - Normalization: Unicode NFC, trim, collapse whitespace, then only the task `policy`
     (`case`, optional terminal punctuation). Accents, ñ/ü, ¿¡, tú/tu, él/el, mí/mi, qué/que are
     never normalized away.
5. **Help is targeted.** `hints[].targets` lists exactly the targets the help explains. A
   vocabulary gloss has no grammar target. `reveal` shows the reference answer.
6. **Ukrainian** for every instruction, explanation, hint and feedback; Spanish of Spain for every
   Spanish text (vosotros where person forms are taught; usted/ustedes as reference). Prompts mark
   Spanish blocks `language: "es-ES"`.
7. **No speaking.** Listening = meaning tasks and optional dictation only. No microphone.
8. **Review status.** Authors write `draft`. Opposite-provider review moves items to `reviewed`
   (receipt bound to the content hash); only `tools/review` sets `ready`. An edit after review
   returns the item to `draft`. A disputed key is `quarantined`, never forced.
9. **Rights.** Only original text. Quote at most a short identifying phrase from a source when
   recording a source anchor; never copy tables, exercises or texts.

## Build

`npm run content:validate` checks schema, IDs, references, DAG, first-teaching order, bank
allocation, held-out families, clip/collection links and review states.
`npm run content:coverage` writes `reports/coverage.json`: per objective/lesson/check/CV/skill
counts of concrete artifacts and their production state. The pack builder turns `source/` into an
immutable pack manifest with SHA-256 digests and deterministic revision IDs; audio files are added
from the private media store only when their review/rights receipts exist.
