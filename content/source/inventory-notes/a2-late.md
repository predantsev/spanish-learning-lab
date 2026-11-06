# Inventory note — a2-late (A2-05, A2-06, A2-07, A2-08)

WP-04 atomic skill and lexical inventory for issue #111, brief `work/briefs/03-inventory.md`.
Author: Claude Opus 5.5 worker, 2026-11-06. All rows are `reviewStatus: "draft"`. No opposite-provider
language review, source re-retrieval, task, clip or lesson authoring has happened yet.

Files: `content/source/skills/A2-0{5,6,7,8}.json` and `content/source/lexicon/A2-0{5,6,7,8}.json`.
All eight validate against `content.schema.json` `$defs/SkillFile` / `$defs/LexiconFile` with strict Ajv 2020 +
ajv-formats.

## Counts per block

| Block | Ledger O / L / C | Skills (assessed / incidental) | Assessed targets (skill × modality) | Lexicon | CV rows placed |
|---|---|---|---|---|---|
| A2-05 | 9 / 7 / 1 | 27 (26 / 1) | 35 | 30 | CV-04 ×5, CV-06 ×4 |
| A2-06 | 7 / 6 / 1 | 11 (11 / 0) | 18 | 3 | — |
| A2-07 | 8 / 8 / 1 | 37 (37 / 0) | 46 | 51 | CV-01 ×7, CV-03 ×1, CV-05 ×5, CV-06 ×11 |
| A2-08 | 8 / 6 / 1 | 13 (13 / 0) | 15 | 21 | CV-05 ×2, CV-06 ×9 |
| **Total** | 32 / 27 / 4 | **88 (87 / 1)** | **114** | **105** | — |

Every objective of the four blocks is the parent of at least one skill. Every lesson and check is the
`firstLesson` or a `returns` entry of at least one skill. No check (`-C1`) is used as a `firstLesson`.

Modalities by block:
- **A2-05:** written-form 12, construction-use 10, context-choice 5, reading-meaning 5, listening-meaning 2, dictation 2.
- **A2-06:** context-choice 7, construction-use 6, reading-meaning 1, listening-meaning 2, dictation 2.
- **A2-07:** written-form 16, construction-use 11, reading-meaning 8, context-choice 6, phrase-recall 1, listening-meaning 2, dictation 2.
- **A2-08:** construction-use 6, reading-meaning 4, phrase-recall 1, listening-meaning 2, dictation 2.

## Conventions used in this range

- **Person groups.** Regular paradigms are split into `.singular` (1s/2s/3s) and `.plural` (1p/2p/3p), e.g.
  `imperfecto.regular-ar.singular`. Usted takes the `3s` form and ustedes the `3p` form; vosotros is taught
  as the Spain plural "tú". The 1s = 3s syncretism has its own skill (`imperfecto.person-1s-3s`). So does the
  present/indefinido `nosotros` syncretism (`contrast.nosotros-present-indefinido`).
- **Irregulars.** One skill per irregular verb (`imperfecto.ser|ir|ver`, `imperative.tu.<verb>`). Usted
  imperative irregulars are grouped by derivation rule: `imperative.usted.yo-g`, `.stem-change`, `.spelling`,
  and the individual `.ir`.
- **`scope.exceptionOf`** points to the first person-group skill of the regular family the exception
  departs from: `imperfecto.ser|ir|ver` → `imperfecto.regular-er-ir.singular`, `imperative.tu.<verb>` →
  `imperative.tu.regular`, and the usted groups → `imperative.usted.regular`.
- **Orthography is separate** from form recall: `imperfecto.abamos-accent`, `imperfecto.ia-accent`,
  `imperfecto.eramos-ibamos-accent`, `imperative.pronoun-accent`, `imperative.usted.spelling`.
- **Form, use and contrast are separate** skills. Imperfecto forms are one group, and its uses another:
  `imperfecto.use-habit`, `use-description` and `use-background`. Tense choice is a third group of
  `contrast.*` skills, each with a `variantPolicyUk`.
- **Listening modalities** (`listening-meaning`, `dictation`) appear only on `listening.*` skills. Each of these
  needs at least 2 distinct clips (CONTENT-PLAN). Dictation is listed because every block section names it
  as a separate optional task.
- **`returns`**:
  - `practice` = later lessons of the same block.
  - `check` = the block's C1, plus a later C1 when CURRICULUM names a mixed or cumulative return (A2-06-C1).
  - `later` = lessons of later blocks named in the block's "later return" text.
- **Cross-block parent.** `contrast.indefinido-imperfecto.background-event` is first taught at A2-05-L6
  (CURRICULUM: "initial meaning contrast") and is also parented to A2-06-O3, where the full contrast is
  practised. The single incidental row is `link.cuando-temporal` (`assessed: false`, see "Scoped out" item 2).

## CV allocations placed

- **CV-01** (reuse of early fixed formulas in A2-07 messages): `formula.request-puedes`, `formula.request-object`
  (¿Me pone…?), `formula.request-queria`, `formula.response-accept`, `formula.response-refuse-reason`
  (lo siento), `formula.message-formal-informal`, `listening.requests-responses`.
- **CV-03** ("bounded reason/purpose frames later", no lesson named): `prep.para-purpose`, first taught at
  A2-07-L8. That lesson's objective, O8, requires "a reason".
- **CV-04:**
  - A2-05-L5, present-to-past handoff: `imperfecto.age-tenia`, `imperfecto.weather` and `imperfecto.estar-state`.
  - A2-05-L6, taught background/event context: `imperfecto.use-background` and
    `contrast.indefinido-imperfecto.background-event`.
  - Mientras and the past progressive are deliberately absent.
- **CV-05:**
  - Impersonal obligation: `obligation.hay-que` at A2-07-L7, reused in `writing.practical-message-reason` at L8.
  - Fixed notice wording at A2-07-L7: `formula.notice-prohibido`, `formula.notice-infinitive`, `formula.notice-se`.
  - Reused at A2-08-L1: `reading.practical-information`, `reading.required-actions`.
- **CV-06:**
  - A2-05 memories: reading, listening and writing rows.
  - A2-07: requests, directions, notices and messages.
  - A2-08: practical reading/listening, messages, comparison.
- **CV-02:** none in this range. It belongs to A1-02, A1-05, A1-06 and A2-02.

## Situation slugs

`situations.json` has no owner in the briefs. This range uses one slug per CV-06 table row:

| Slug | CV-06 row |
|---|---|
| `greetings-social` | Greetings, introductions, thanks, apology and leave-taking |
| `people-home` | People, family, belongings and home |
| `routine-work-leisure` | Daily routine, study/work and leisure |
| `food-shopping` | Food, shopping, menus, prices and product labels |
| `time-transport` | Time, appointments, transport, tickets and timetables |
| `places-accommodation` | Places, accommodation, simple leaflets and adverts |
| `conditions-problems` | Everyday conditions, weather and simple problems |
| `messages-invitations` | Personal notes, invitations, excuses and replies |
| `instructions-notices` | Short instructions and notices, including a simple recipe or posted rule |

## Cross-range prerequisites

Tags: `brief-literal` means the ID or its exact pattern appears in `work/briefs/03-inventory.md`. `guessed`
means it is derived from the brief's area convention. Both need reconciliation against the earlier-range
inventories. The "expected first lesson" column is where CURRICULUM teaches the item, and every use satisfies
prerequisite order against it.

| Cross-range ID | Expected first lesson | Tag | Meaning to map | Used by |
|---|---|---|---|---|
| `ortho.stress-rules` | A1-01-L2 | guessed | Stress position and the general written-accent rules (esp. words stressed on the third-last syllable always carry a mark). | `imperfecto.abamos-accent`, `imperfecto.ia-accent`, `imperative.pronoun-accent` |
| `adj.agreement` | A1-02-L4 | guessed | Adjective gender/number agreement. | `imperfecto.use-description` |
| `pron.subject` | A1-03-L1 | guessed | Subject pronouns incl. vosotros and usted/ustedes with 3rd-person verb forms. | `imperfecto.regular-ar.singular`, `imperfecto.person-1s-3s`, `contrast.tu-usted-register`, `imperative.vosotros.regular` |
| `ser.identity-description` | A1-03-L2 | guessed | Present ser for identity/origin/description. | `imperfecto.ser` |
| `estar.location-state` | A1-03-L3 | guessed | Present estar for location and a small state set. | `imperfecto.estar-state` |
| `hay.existential` | A1-03-L4 | guessed | Existential hay (vs estar). | `imperfecto.habia`, `obligation.hay-que` |
| `question.yes-no` | A1-03-L6 | guessed | Yes/no question formation and punctuation. | `formula.request-puedes`, `formula.request-object` |
| `present.regular-ar` | A1-04-L1 | brief-literal | Regular -ar present. | `imperfecto.regular-ar.singular`, `contrast.present-past`, `contrast.nosotros-present-indefinido`, `imperative.tu.regular` |
| `present.regular-er` | A1-04-L2 | guessed | Regular -er present. | `imperfecto.regular-er-ir.singular`, `imperative.tu.regular` |
| `present.regular-ir` | A1-04-L2 | guessed | Regular -ir present. | `imperfecto.regular-er-ir.singular`, `imperative.tu.regular` |
| `present.ir` | A1-04-L3 | brief-literal | Present of ir. | `imperfecto.ir`, `imperative.usted.ir` |
| `time.frequency` | A1-04-L5 | guessed | Frequency expressions (siempre, normalmente, a veces, todos los días). | `time.past-habit-frames` |
| `link.sequence` | A1-04-L6 | guessed | Sequence links primero/luego/después/al final (CV-04). | `reading.instructions-order` |
| `tener.age` | A1-05-L1 | guessed | Age with tener + number + años (CV-04 age-after-numbers). | `imperfecto.age-tenia` |
| `time.clock` | A1-05-L3 | guessed | Clock time es la una / son las dos. | `imperfecto.ser-time-setting`, `reading.practical-information` |
| `prep.spatial` | A1-05-L5 | guessed | Taught spatial expressions (a la derecha/izquierda, al lado de, cerca de). | `formula.directions` |
| `present.querer` | A1-06-L4 | guessed | querer + noun/infinitive with its present forms. | `formula.request-queria` |
| `link.porque` | A1-06-L5 | guessed | Reason connector porque (A1-06 starter set y/pero/porque). | `formula.response-refuse-reason`, `formula.opinion-choice` |
| `formula.message-opening-closing` | A1-06-L6 | guessed | Small reviewed message opening/closing set. | `formula.message-formal-informal` |
| `present.stem-e-i` | A2-01-L1 | brief-literal | Present e→i stem group (pedir, seguir, repetir). | `imperative.tu.stem-change`, `imperative.usted.stem-change` |
| `present.stem-e-ie` | A2-01-L1 | brief-literal | Present e→ie stem group. | `imperfecto.present-irregulars-regular`, `imperative.tu.stem-change`, `imperative.usted.stem-change` |
| `present.stem-o-ue` | A2-01-L1 | brief-literal | Present o→ue stem group (incl. poder). | `imperfecto.present-irregulars-regular`, `formula.request-puedes`, `imperative.tu.stem-change`, `imperative.usted.stem-change` |
| `present.yo-g` | A2-01-L2 | brief-literal | Present yo-g group (digo, hago, pongo, salgo, tengo, vengo). | `imperfecto.present-irregulars-regular`, `imperative.usted.yo-g` |
| `ability.poder-infinitive` | A2-01-L6 | guessed | poder + infinitive (ability/possibility). | `formula.request-puedes`, `formula.permission-puedo` |
| `obligation.tener-que` | A2-01-L6 | guessed | tener que + infinitive (personal obligation). | `obligation.hay-que` |
| `present.weather-state` | A2-01-L7 | guessed | Present weather/state frames (hace frío, llueve, está nublado) staged by CV-04. | `imperfecto.weather` |
| `object-pron.direct` | A2-02-L2 | guessed | Direct-object pronouns lo/la/los/las (me/te/nos/os). | `imperative.pronoun-placement` |
| `object-pron.indirect` | A2-02-L3 | guessed | Indirect-object pronouns me/te/le/nos/os/les. | `formula.request-object`, `imperative.pronoun-placement` |
| `object-pron.placement` | A2-02-L4 | guessed | Pronoun placement with finite verb/infinitive/gerund. | `imperative.pronoun-placement` |
| `compare.regular` | A2-02-L6 | guessed | Regular comparison frames más/menos … que, tan … como. | `writing.compare-choose-reason` |
| `participle.hecho` | A2-03-L3 | brief-literal | Irregular participle hecho. | `contrast.past-form-identification` |
| `perfecto.choice-context` | A2-03-L6 | brief-literal | Contextual choice of perfecto compuesto. | `contrast.perfecto-indefinido.time-frame`, `contrast.perfecto-indefinido.experience-occasion` |
| `indefinido.regular-ar` | A2-04-L1 | brief-literal | Regular -ar indefinido. | `imperfecto.use-background`, `contrast.nosotros-present-indefinido` |
| `indefinido.regular-er-ir` | A2-04-L2 | guessed | Regular -er/-ir indefinido. | `imperfecto.use-background`, `contrast.nosotros-present-indefinido` |
| `indefinido.spelling-changes` | A2-04-L3 | guessed | Spelling-preserving changes c→qu, g→gu, z→c (busqué, llegué, crucé). | `imperative.usted.spelling` |
| `indefinido.ser-ir` | A2-04-L6 | guessed | Shared ser/ir indefinido forms (fui, fue…) and their contextual reading. | `contrast.past-form-identification` |
| `indefinido.choice-context` | A2-04-L7 | guessed | Contextual choice of indefinido incl. its initial contrast with perfecto. | `contrast.indefinido-imperfecto.background-event`, `contrast.perfecto-indefinido.time-frame`, `contrast.perfecto-indefinido.experience-occasion`, `contrast.indefinido-imperfecto.habit-event` |

### Reverse links the earlier-range owners should add

These skills are reused as targets in this range. Their `returns.later` should name the lessons below:
- `object-pron.direct` and `object-pron.indirect` → A2-07-L6.
- `participle.hecho` and `indefinido.ser-ir` → A2-06-L4.
- `perfecto.choice-context` and `indefinido.choice-context` → A2-06-L2, L3 and L5.
- `tener.age` → A2-05-L5, and `present.weather-state` → A2-05-L5 (both CV-04).
- `obligation.tener-que` → A2-07-L7 (CV-05).
- `link.sequence` → A2-07-L7.
- Recorded A1-05/A2-01/A2-02 constructions reused in A2-08 texts.

### Possible duplicates with earlier ranges

- **Temporal `cuando`:** may already be taught in A2-04-L8. If so, move `link.cuando-temporal` to that
  owner.
- **An initial perfecto/indefinido contrast row at A2-04-L7:** my A2-06 rows are suffixed
  (`.time-frame`, `.experience-occasion`) so they cannot collide by ID.
- **`prep.para-purpose`:** may already be taught in A1-06 or A2-01.
- **Lexicon:** possible duplicates are `colegio`, `entonces`, `usar`, `fumar`, `aparcar`, `encender`,
  `recoger`, `perder`, `cómodo`, `quedar`, `todo recto` and `sonar`.

## Lexicon: words assumed to be taught earlier (not added here)

- **Time and frequency:** ayer, hoy, ahora, siempre, nunca, normalmente, a veces, todos los días, cada,
  seasons/months.
- **Family and description:** family words, pelo, alto/bajo, rubio/moreno, grande/pequeño.
- **Places:** casa, piso, calle, plaza, parque, playa, escuela.
- **Weather:** hace frío/calor/sol, llover, nublado (CV-04, A2-01-L7).
- **Information words:** clock and price words, horario, abierto/cerrado, entrada/salida, cita, billete,
  tren, autobús, estación.
- **Food and objects:** basic food, pan, sal, agua, café, vaso, ventana, puerta, móvil.
- **Verbs:** common A1 verbs and the A2-01 stem-change/yo-g sets.
- **Comparison and space:** caro/barato, mejor/peor, cerca/lejos, a la derecha/izquierda.

The integrator should confirm these against the earlier lexicon files.

## Scoped out, with reasons

1. **`soler` + infinitive (solía).** It is not allocated by CURRICULUM or CV-05. It is a candidate support
   step for A2-05-L4 once the S1 12.1 level is checked.
2. **Mientras, `estaba` + gerund and new subordinate clauses.** CV-04 says these are not assumed for the
   A2-05-L6 contrast. `cuando` is taught for comprehension only (`assessed: false`). The cuándo/cuando accent
   pair therefore gets no assessed row. Add one under CV-03 if `cuando` becomes productive.
3. **`iba a` + infinitive** (past intention). Not allocated.
4. **Evaluating a completed episode with indefinido** (El viaje fue estupendo). Handled as a variant policy on
   `imperfecto.use-description`, not as a separate contrast row. See review question 5.
5. **Negative imperatives** (`no` + subjunctive). CURRICULUM defers them to B1. Fixed notices `No tocar` /
   `No fumar` are reading-only.
6. **Two-pronoun imperative combinations** (dímelo, dáselo). A2-07-O6 requires separate mapping.
7. **Reflexive imperatives** (levántate, siéntese, sentaos, idos/iros). They are not object pronouns, and
   vosotros d-drop needs its own rule and review.
8. **Tú `sé` (ser) and usted `dé`/`sea`.** Low need in A2-07 contexts. They would add the diacritic pairs
   sé/se and dé/de as further accent targets.
9. **¿Podría(s)…? and quisiera.** Untaught conditional and imperfect-subjunctive morphology. Only the
   imperfecto courtesy form `quería` is used.
10. **¿Se puede? and productive impersonal/passive `se`.** Only fixed advert/notice wording (`Se alquila…`)
    is included, for reading.
11. **`desde` / `desde hace` + present, and `si` + present conditional clauses in messages.** Not allocated.
12. **`me parece` as an opinion frame.** It may belong to the A1-06 gustar-family extensions (CV-05). Only
    `creo que` / `para mí` are used in `formula.opinion-choice`.
13. **Weather vocabulary.** Assumed from the A2-01-L7 present frames. Only the past frames are new here.

## Doubts for language review (review questions, not settled facts)

1. **Vosotros imperative with the infinitive** (¡Mirar esto!): marked not accepted in form tasks
   (`imperative.vosotros.regular` variant policy). Confirm the policy and the feedback wording.
2. **Existential `habían`:** not accepted (`imperfecto.habia`). The basis is the RAE norm on impersonal
   haber; the DPD passage was not re-retrieved in this pass.
3. **Leísmo:** `le` for a masculine singular person direct object is accepted
   (`imperative.pronoun-placement`). The RAE admission was stated from knowledge and not re-retrieved.
4. **Tú/usted register descriptions for Spain** (`contrast.tu-usted-register`): this is a sociolinguistic
   generalisation. Confirm the wording does not overclaim.
5. **Perfecto/indefinido regional note** (Canarias, part of the north-west, Latin America) and "esta mañana
   allows both" (`contrast.perfecto-indefinido.time-frame`). Confirm the wording and acceptability policy.
   Also confirm whether "fue + evaluation" needs its own row (scoped-out item 4).
6. **Is the courtesy `quería` inside S1 9.1.2 at A1-A2?** Not verified (`formula.request-queria` source note).
7. **`ten`/`ven`/`ve` as assessed tú irregulars** beyond S1's di/haz/pon/sal: a course proposal. The ve
   (ir) / ve (ver) homonymy is noted in the row.
8. **`coja` in `imperative.usted.spelling`** derives from yo `cojo`. Confirm that A2-01-L2 teaches cojo.
   Otherwise move coja to its own exception or scope it out.
9. **Door signs `Empujar`/`Tirar`** (also seen as Empuje/Tire) and **recipe infinitives**: confirm these
   are typical Spain usage.
10. **Source anchors:**
    - `S5 2.6` for age/weather is cited only because the CURRICULUM CV-04 row cites it.
    - S7 regular model numbers and the S7 imperative rows were not inspected.
    - The S1 "selected temporal/reason/purpose passages" carry no section number.
    - The courtesy-quería and opinion-frame anchors are unverified.
    - Every such source entry says so in its `note`.
11. **`imperfecto.ser-time-setting`** (era la una, eran las diez) is included under A2-05-O6's
    "including time/setting" anchor. Confirm the scope.
12. **Ukrainian:**
    - The aspect warning in `contrast.indefinido-imperfecto.background-event` (do not map Ukrainian
      verb aspect mechanically).
    - The hiatus wording in `imperfecto.ia-accent`.
    - Whether "наказовий спосіб" is the preferred learner-facing term for imperativo.
13. **Bank sizing:** single-form exceptions are unlikely to need a full 10-task bank. They are
    `imperative.tu.*` (one form each), `imperative.usted.ir` (vaya/vayan) and `imperfecto.habia`.
    Set `bankJustificationUk` at WP-05 calibration, not here.
14. **Lexicon notes:**
    - The `coger` note mentions the Latin American vulgar sense. Confirm that it is appropriate.
    - `sartén` is noted as feminine in Spain.
    - The `DNI` pronunciation hint is given in Ukrainian letters.

## Method

- **Generation:** rows were generated from a scratch script outside the repository and written as plain
  JSON. No tool code is committed.
- **Checks:** a scratch Ajv 2020 (strict) script validated the files. It also checked:
  - unique skill and lexical IDs;
  - existence against the ledger;
  - `firstLesson` inside the owning block, and never a check;
  - return ordering;
  - prerequisite order against the expected cross-range first lessons;
  - an acyclic prerequisite graph;
  - `exceptionOf` targets;
  - situation slugs;
  - listening modalities only on listening skills;
  - objective and lesson coverage.
- **Sources:** all `section` strings cite only sections recorded in `docs/CURRICULUM-A1-A2.md`.
  Unverified anchors say so in their `note`. No source text or tables were copied.
