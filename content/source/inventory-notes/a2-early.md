# Inventory note — range `a2-early` (A2-01 … A2-04)

WP-04 atomic curriculum and lexical inventory for blocks A2-01, A2-02, A2-03 and A2-04 (issue #111).
Every row is `reviewStatus: draft`: authored by one model, not language-reviewed, no task bank, clip
or lesson file exists yet. Files: `content/source/skills/A2-0{1,2,3,4}.json`,
`content/source/lexicon/A2-0{1,2,3,4}.json`. Ledger scope covered: 38 objectives, 30 lessons, 4
optional checks (`docs/contracts/curriculum-ledger.json`, rows filtered by blockId).

## Conventions used in this range

- **Skill IDs** follow the brief-03 convention. The convention has no `gerund`, `demonstrative` or
  `weather` area, so gerund forms live under `progressive.gerund-*`, demonstratives under
  `pron.demonstrative-*`, and weather frames under `formula.weather-hace`, `present.llover-nevar`,
  `estar.weather`, `tener.physical-state`.
- **Auxiliary and verb-form slots reuse existing form skills.** In `estar` + gerund, `ir a`,
  `tener que`, `poder` + infinitive and the CV-05 periphrases, the conjugated verb is attributed to
  `present.estar`, `present.ir`, `present.tener`, `present.stem-o-ue`, `present.stem-e-ie`; the
  construction skill covers framing (preposition/`que`, word order) and the contrast skill covers
  meaning. Only `haber` (new in A2-03) gets its own form skill (`perfecto.haber-forms`).
- **Modalities.** `written-form` = produce the exact form; `context-choice` = choose a form or
  construction from sufficient context without a named target; `reading-meaning` = interpret;
  `construction-use` = build a sentence or write a text; `listening-meaning` + `dictation` only on
  `listening.*` skills, and each listening skill implies ≥2 distinct reviewed clips (8 listening
  skills, two per block, so ≥16 clips for the range; clip-length bounds per CONTENT-PLAN).
- **Incidental rows** (`assessed: false`) carry exactly one modality, `reading-meaning`, because the
  schema requires `minItems: 1` even for incidental rows. No task should target them. Two rows:
  `object-pron.combination-attached`, `indefinido.nosotros-syncretism`.
- **CV rows hook to the objectives of the lesson that hosts them** (e.g. the CV-05 periphrases at
  A2-01-L6 have parents A2-01-O7/O8; CV-04 weather rows at A2-01-L7 have parent A2-01-O9).
- **Lexicon IDs**: `lex.` + lemma lowercased, `ñ` → `n`, diacritics stripped, every run of
  non-alphanumeric characters → `-`, trimmed (`pasado mañana` → `lex.pasado-manana`,
  `hace (+ tiempo)` → `lex.hace-tiempo`). Proposed homograph rule (no collision occurred here): the
  unaccented or more basic lemma keeps the bare slug, the other gets `-<pos>` (`lex.que` vs
  `lex.que-pronoun`). All 119 items were checked against this rule.
- **Situation IDs** (CV-06 table, nine rows) are proposed here because no `source/situations.json`
  exists yet: `greetings-social`, `people-home`, `routine-study-work-leisure`, `food-shopping`,
  `time-appointments-transport`, `places-accommodation`, `conditions-weather-problems`,
  `notes-invitations-replies`, `instructions-notices`. Fragment at the end of this note.

## Per-block summary

| Block | Skills (assessed / incidental) | Lexicon | CV rows placed | Heaviest lessons (first-taught skills) |
|---|---|---|---|---|
| A2-01 | 44 (44 / 0) | 53 | CV-05 L6, CV-04 L7, CV-06 L7, CV-03 extension L2 | L2: 11, L7: 9, L6: 8 |
| A2-02 | 39 (38 / 1) | 43 | CV-03 L3 and L7, CV-02 L8, CV-06 L8 | L1: 7, L6: 7, L3: 6 |
| A2-03 | 25 (25 / 0) | 9 | none allocated by CURRICULUM | L3: 9 |
| A2-04 | 33 (32 / 1) | 14 | CV-04 L8, CV-06 L8 | L5: 11 |

**Lesson-size flags (for the integrator, not decided here).** CURRICULUM asks for a size review
before authoring and an explicit revision for any split. A2-01-L2 (eleven O2 items), A2-01-L6 (five
frames plus three CV-05 periphrases), A2-01-L7 (integration plus five CV-04 rows), A2-03-L3 (nine
individual participles) and A2-04-L5 (strong endings plus ten verbs) look larger than one short
lesson. CONTENT-PLAN allows labelled resumable steps under the same lesson ID; that choice belongs
to lesson authoring.

### First-taught skills per lesson

- **A2-01-L1** (5): `present.stem-e-ie`, `present.stem-o-ue`, `present.jugar`, `present.stem-e-i`, `present.stem-unchanged-1p-2p`
- **A2-01-L2** (11): `present.yo-g`, `present.venir`, `present.decir`, `present.yo-zco`, `present.saber`, `ortho.se-accent`, `present.dar`, `present.ver`, `present.yo-spelling-g-j`, `contrast.saber-conocer`, `prep.a-personal`
- **A2-01-L3** (5): `progressive.gerund-regular-ar`, `progressive.gerund-regular-er-ir`, `progressive.gerund-yendo`, `progressive.gerund-e-i`, `progressive.gerund-o-u`
- **A2-01-L4** (3): `progressive.estar-gerund`, `contrast.present-progressive`, `listening.ongoing-actions`
- **A2-01-L5** (3): `future-ir.ir-a-inf`, `contrast.ir-a-place-vs-plan`, `contrast.plan-vs-wish`
- **A2-01-L6** (8): `ability.poder-inf`, `ability.saber-inf`, `contrast.poder-saber`, `obligation.tener-que`, `contrast.modal-meaning`, `perifrasis.acabar-de`, `perifrasis.empezar-a`, `perifrasis.volver-a`
- **A2-01-L7** (9): `contrast.routine-now-plan`, `reading.routine-now-plan`, `writing.routine-now-plan`, `listening.situation-plan`, `formula.weather-hace`, `present.llover-nevar`, `estar.weather`, `tener.physical-state`, `contrast.hace-tener-estar`
- **A2-02-L1** (7): `pron.demonstrative-agreement`, `pron.demonstrative-distance`, `pron.demonstrative-neuter`, `ortho.demonstrative-no-accent`, `poss.tonic-forms`, `poss.tonic-standalone`, `contrast.poss-mi-mio`
- **A2-02-L2** (4): `object-pron.direct-1-2`, `object-pron.direct-3`, `object-pron.direct-referent`, `object-pron.placement-finite`
- **A2-02-L3** (6): `object-pron.indirect-forms`, `object-pron.indirect-recipient`, `object-pron.indirect-doubling`, `pron.prepositional`, `ortho.mi-accent`, `listening.pronoun-reference`
- **A2-02-L4** (3): `object-pron.placement-infinitive`, `object-pron.placement-gerund`, `ortho.gerund-pronoun-accent`
- **A2-02-L5** (3): `object-pron.combination-order`, `object-pron.se-replacement`, `object-pron.combination-attached` (incidental)
- **A2-02-L6** (7): `compare.mas-menos-que`, `compare.tan-como`, `compare.tanto-como`, `compare.mas-de-number`, `compare.mejor`, `compare.peor`, `compare.mayor-menor`
- **A2-02-L7** (3): `relative.que`, `ortho.que-accent`, `writing.description-detail`
- **A2-02-L8** (6): `pron.algo-alguien`, `neg.nada-nadie`, `neg.double-negation`, `reading.description-comparison`, `writing.choice-description`, `listening.description-comparison`
- **A2-03-L1** (2): `perfecto.haber-forms`, `perfecto.haber-vs-hay`
- **A2-03-L2** (3): `participle.regular-ar`, `participle.regular-er-ir`, `contrast.gerund-participle`
- **A2-03-L3** (9): `participle.hecho`, `participle.dicho`, `participle.escrito`, `participle.visto`, `participle.puesto`, `participle.vuelto`, `participle.abierto`, `participle.roto`, `participle.muerto`
- **A2-03-L4** (1): `participle.ido-accent`
- **A2-03-L5** (4): `perfecto.word-order`, `perfecto.pronoun-placement`, `perfecto.participle-invariance`, `listening.perfecto-sentences`
- **A2-03-L6** (3): `perfecto.use-current-period`, `perfecto.use-experience`, `perfecto.choice-context`
- **A2-03-L7** (3): `reading.perfecto-account`, `listening.perfecto-account`, `writing.perfecto-account`
- **A2-04-L1** (2): `indefinido.regular-ar`, `time.past-markers`
- **A2-04-L2** (3): `indefinido.regular-er-ir`, `indefinido.nosotros-syncretism` (incidental), `listening.past-events`
- **A2-04-L3** (4): `indefinido.spelling-car`, `indefinido.spelling-gar`, `indefinido.spelling-zar`, `ortho.indefinido-accent`
- **A2-04-L4** (4): `indefinido.stem-e-i`, `indefinido.stem-o-u`, `indefinido.stem-change-boundary`, `indefinido.y-alternation`
- **A2-04-L5** (11): `indefinido.strong-endings`, `indefinido.tener`, `indefinido.estar`, `indefinido.poder`, `indefinido.poner`, `indefinido.hacer`, `indefinido.venir`, `indefinido.querer`, `indefinido.decir`, `indefinido.dar`, `indefinido.ver`
- **A2-04-L6** (2): `indefinido.ser-ir`, `contrast.fue-ser-ir`
- **A2-04-L7** (3): `indefinido.use-completed-event`, `time.hace-ago`, `contrast.perfecto-indefinido`
- **A2-04-L8** (4): `link.past-sequence`, `reading.past-sequence`, `listening.past-sequence`, `writing.past-sequence`

Every C1 check (A2-01-C1 … A2-04-C1) is in `returns.check` of every assessed skill of its block.

## CV allocations placed

The CURRICULUM lesson rows of this range carry CV tags only at A2-01-L6 (CV-05), A2-01-L7 (CV-04),
A2-02-L3 (CV-03), A2-02-L7 (CV-03), A2-02-L8 (CV-02) and A2-04-L8 (CV-04); A2-03 has none.

| CV | Lesson | Explicit rows |
|---|---|---|
| CV-02 | A2-02-L8 (internal step before independent use, per the lesson row) | `pron.algo-alguien`, `neg.nada-nadie`, `neg.double-negation` |
| CV-03 | A2-02-L3 | `pron.prepositional`, `ortho.mi-accent` |
| CV-03 | A2-02-L7 | `ortho.que-accent` |
| CV-03 (extension) | A2-01-L2 | `ortho.se-accent` — sé/se is not in the CV-03 pair list (tú/tu, él/el, mí/mi, qué/que); tagged CV-03 as the same diacritic family |
| CV-04 | A2-01-L7 (present weather/state before past use; handoff via `returns.later` A2-05-L5) | `formula.weather-hace`, `present.llover-nevar`, `estar.weather`, `tener.physical-state`, `contrast.hace-tener-estar` |
| CV-04 | A2-04-L8 (receives A1 sequence links) | `link.past-sequence` (prerequisite `link.sequence`), `writing.past-sequence` |
| CV-05 | A2-01-L6 (after the poder / tener que foundation) | `perifrasis.acabar-de`, `perifrasis.empezar-a`, `perifrasis.volver-a` |
| CV-06 | A2-01-L7, A2-02-L8, A2-04-L8 | `reading.routine-now-plan`, `writing.routine-now-plan`, `formula.weather-hace`, `reading.description-comparison`, `writing.choice-description`, `reading.past-sequence`, `writing.past-sequence`; every skill also carries `situations` |

CV-01 has no allocation in this range (A1-01/A1-03/A1-05 first use, reuse in A1-06/A2-07).
Handling of the A2-04-L8 "receive": an in-range row (`link.past-sequence`) receives the A1 skill;
the A1 skill's own `returns.later` is not edited here. The integrator may additionally add A2-04-L8
to `link.sequence.returns.later`.

## Cross-range prerequisites (guessed A1 IDs)

These IDs follow the brief convention but were not visible when this range was written (no A1 skill
file existed in any sibling worktree). If the A1 worker chose a different slug, rename here.

| Guessed ID | A1 lesson (objective) | Used by (prerequisite / exceptionOf) |
|---|---|---|
| `adj.agreement` | A1-02-L4 (A1-02-O4) | `compare.mas-menos-que`, `contrast.hace-tener-estar`, `object-pron.direct-3`, `perfecto.participle-invariance`, `poss.tonic-forms`, `pron.demonstrative-agreement`, `relative.que`, `writing.description-detail` |
| `date.days` | A1-05-L4 (A1-05-O4) | `time.past-markers` |
| `estar.state` | A1-03-L3 (A1-03-O3) | `contrast.hace-tener-estar`, `estar.weather` |
| `gustar.pronoun` | A1-06-L1 (A1-06-O1) | `object-pron.indirect-forms` |
| `hay.existence` | A1-03-L4 (A1-03-O4) | `perfecto.haber-vs-hay`, `pron.algo-alguien` |
| `link.porque` | A1-06-L5 (A1-06-O6) | `writing.choice-description` |
| `link.sequence` | A1-04-L6 (A1-04-O7, CV-04) | `link.past-sequence` |
| `neg.no` | A1-03-L6 (A1-03-O6) | `neg.nada-nadie`, `object-pron.placement-finite`, `perfecto.word-order` |
| `number.cardinal` | A1-05-L1 (A1-05-O1) | `compare.mas-de-number`, `time.hace-ago` |
| `ortho.el-accent` | A1-03-L1 (A1-03-O1, CV-03 él/el) | `pron.prepositional` |
| `perifrasis.querer-inf` | A1-06-L4 (A1-06-O4) | `future-ir.ir-a-inf`, `object-pron.placement-infinitive` |
| `poss.unstressed` | A1-02-L5 (A1-02-O5) | `contrast.poss-mi-mio`, `ortho.mi-accent`, `poss.tonic-forms` |
| `prep.al-del` | A1-04-L3 (A1-04-O4, CV-03 destination/contraction) | `contrast.ir-a-place-vs-plan`, `prep.a-personal` |
| `present.estar` | A1-03-L3 (A1-03-O3) | `indefinido.estar`, `progressive.estar-gerund` |
| `present.hacer` | A1-04-L3 (A1-04-O4) | `formula.weather-hace`, `indefinido.hacer`, `participle.hecho`, `present.yo-g` |
| `present.ir` | A1-04-L3 (A1-04-O4) | `future-ir.ir-a-inf`, `indefinido.ser-ir` |
| `present.querer` | A1-06-L4 (A1-06-O4) | `contrast.plan-vs-wish`, `indefinido.querer` |
| `present.regular-ar` | A1-04-L1 (A1-04-O1) | `indefinido.regular-ar`, `participle.regular-ar`, `perifrasis.acabar-de`, `present.dar`, `present.stem-e-ie`, `present.stem-o-ue`, `progressive.gerund-regular-ar` |
| `present.regular-er` | A1-04-L2 (A1-04-O2) | `indefinido.regular-er-ir`, `participle.regular-er-ir`, `present.saber`, `present.stem-e-ie`, `present.stem-o-ue`, `present.ver`, `present.yo-g`, `present.yo-spelling-g-j`, `present.yo-zco`, `progressive.gerund-regular-er-ir` |
| `present.regular-ir` | A1-04-L2 (A1-04-O3) | `indefinido.regular-er-ir`, `participle.regular-er-ir`, `present.stem-e-i`, `present.stem-e-ie`, `present.stem-o-ue`, `present.yo-g`, `present.yo-zco`, `progressive.gerund-regular-er-ir` |
| `present.ser` | A1-03-L2 (A1-03-O2) | `indefinido.ser-ir` |
| `present.tener` | A1-03-L5 (A1-03-O5) | `indefinido.tener`, `obligation.tener-que`, `present.venir`, `tener.physical-state` |
| `quant.muy-mucho` | A1-02-L4 (A1-02-O4 / A1-05-O1, CV-02) | `compare.tanto-como`, `formula.weather-hace`, `tener.physical-state` |
| `reflexive.routine` | A1-04-L4 (A1-04-O5) | `object-pron.direct-1-2`, `ortho.se-accent`, `perfecto.pronoun-placement` |
| `tener.age` | A1-05-L1 (A1-05-O1, CV-04) | `compare.mayor-menor` |
| `time.frequency` | A1-04-L5 (A1-04-O6) | `perfecto.use-experience` |

## Possible overlaps with other ranges (integrator checks)

- **Possible A1 duplicates** (keep the earlier `firstLesson`, turn the later one into a return):
  `prep.a-personal` (here A2-01-L2, with `conocer a`; A1 may have taught it with CV-03 `a` frames);
  `tener.physical-state` (A1-03-L5 "useful tener expressions" may include hambre/sed/frío);
  `ortho.que-accent` (CV-03 says "qué/que with questions/relative clauses"; placed at A2-02-L7 per
  its lesson row, but A1-05-L6 might also claim it); the CV-04 weather rows (the situation table
  also names A1-05 for present weather frames); `present.ver` (A1 routines may use *ver la tele*).
- **Possible A1 lexicon duplicates**: `lex.salir`, `lex.poner`, `lex.caro`, `lex.barato`,
  `lex.piso`, `lex.gente`, `lex.pagar`, `lex.terminar`, `lex.ayer`, `lex.playa`, `lex.futbol`,
  `lex.nadar`, `lex.tiempo` (the time sense may already exist; meanings were merged in one item).
  `ver` was deliberately not added (assumed A1).
- **IDs the A2-late range should reuse rather than recreate**: `contrast.perfecto-indefinido`
  (begins A2-04-L7; A2-06-L2/L5 are already listed in its `returns.later`), every `participle.*`
  and `indefinido.*` form (A2-06-L4), `perfecto.choice-context`, `indefinido.use-completed-event`
  (A2-05-L6), `link.past-sequence` (A2-05-L7), and the CV-04 rows received at A2-05-L5.

## Source items scoped out or deferred (with reason)

- `conmigo` / `contigo`: not needed for the A2-02-O4 recipient frame; named in
  `pron.prepositional` as not assessed. Candidate for a later explicit allocation.
- Superlatives (`el más … de`, `-ísimo`): A2-02-O7/O8 cover comparison only. Candidate for
  A2-08-L4 or B1.
- Present forms beyond the selected set: `oír` (oigo), `-uir` y-insertion (construyo),
  `seguir` (sigo), `elegir` (elijo), `-cer` exceptions such as `cocer`.
- Gerunds `muriendo` (morir is introduced in A2-03) and `pudiendo` (rare): explained, not
  assessed.
- Participles beyond the CONTENT-PLAN list: `devuelto`, `descubierto`, `resuelto`, `frito`,
  `impreso`, and `-uir` participles (`construido`).
- Indefinido beyond the selected set: `saber` (supe, meaning shift), `traer` (traje, trajeron),
  `conducir` (conduje), `andar`, and `-uir` forms (construyó, construiste).
- Postnominal possessives (`un amigo mío`) and place adverbs paired with demonstratives
  (aquí/ahí/allí): not assessed here.

## Additions beyond the literal CURRICULUM wording (review whether to keep)

Meaning boundaries that prevent a false rule: `contrast.saber-conocer`, `ability.saber-inf`,
`contrast.poder-saber`, `contrast.modal-meaning`, `contrast.plan-vs-wish`. Prerequisite microsteps:
`prep.a-personal`, `present.stem-unchanged-1p-2p`, `perfecto.haber-vs-hay`,
`contrast.gerund-participle`, `ortho.se-accent`. Wider form sets than the source names:
`indefinido.stem-o-u` (dormir, morir added to the pedir family), `indefinido.poder`, `poner`,
`venir`, `querer`, `decir` (S1 9.1.3 names tener/hacer/estar/ver/dar),
`indefinido.stem-change-boundary`. CV-04 state frames: `tener.physical-state`,
`contrast.hace-tener-estar`. Incidental: `object-pron.combination-attached`,
`indefinido.nosotros-syncretism`.

## Sources that would need adding (not added to `sources.json`)

Named without URLs; the exact pages and passages were not retrieved in this pass.

- RAE/ASALE, *Ortografía de la lengua española* (2010) on the diacritic accent and demonstratives,
  plus the RAE's 2023 clarification on the optional accent in ambiguity — for
  `ortho.demonstrative-no-accent`.
- RAE/ASALE, *Diccionario panhispánico de dudas*: entries on *leísmo*, *se* (the *se los* plural
  pattern), *mayor* (*más mayor*) and *hambre* (*mucha hambre*) — for `object-pron.direct-3`,
  `object-pron.se-replacement`, `compare.mayor-menor`, `tener.physical-state`.
- A descriptive source on regional perfecto/indefinido use in Spain — for
  `perfecto.use-current-period` and `contrast.perfecto-indefinido`.

Model numbers of S7 are cited only where CURRICULUM records them (haber/hecho 36/37, decir 27,
leer 40, pedir 46, ir 38, ser 61, ver 68); every other S7 citation says "model number not verified".
All S1/S4/S5/S6/S8/S9 sections are taken from the CURRICULUM anchors and were not re-read here.

## Doubts for language review (questions, not assertions)

1. Leísmo: accept `le` for one male person as direct object (`¿Juan? Le veo mañana`)? What about
   `les` for several male persons?
2. Demonstratives: treat `éste` as an orthographic remark rather than a wrong choice — consistent
   with the current RAE position?
3. `tengo mucha hambre` is the model; `mucho hambre` is treated as an error. Confirm.
4. Spain colloquial `ese` for distant objects: accept both `ese` and `aquel` unless distance is
   explicit?
5. Doubling: accept `Doy el libro a Marta` (no `le`) as correct but non-model?
6. `se los` for one object and several recipients: non-model in Spain — mark unresolved or
   incorrect?
7. `más bueno`, `más malo`, `más mayor`, `mi hermano pequeño`: policy as written in the rows.
8. `jugar al fútbol` vs `jugar fútbol`.
9. Hodiernal past: accept indefinido for `esta mañana`/`hoy` contexts (north-west Spain, Canarias)
   once indefinido is known?
10. `Voy al cine a ver una película` (purpose `a` + infinitive) shown in a note at A2-01-L5 — too
    early?
11. Weather: naturalness of `está despejado`; `hace sol` vs `hay sol`.
12. `vamos a` + infinitive as a suggestion — how tasks should avoid the ambiguity.
13. `coger` note about its sense in parts of Latin America — keep or drop for a Spain course?
14. `estoy yendo` in Spain: acceptable, or present `voy` only?
15. `Las cartas las he escrito yo` (fronted object with doubling) as an invariance example — too
    advanced for A2-03?
16. `-zco` rule wording ("most verbs in vowel + -cer/-cir", exceptions hacer/decir): sufficient?
17. Ukrainian terminology: `герундій` (gerundio), `дієприкметник` (participio),
    `простий минулий час` (indefinido), `складений минулий час` (perfecto compuesto) — align with
    the A1 range's glossary.
18. `poder` vs `saber` + infinitive: is the Ukrainian «могти/вміти» parallel accurate in every
    task context?

## Situations fragment (merge contribution)

`firstLessons` marked *explicit* are lesson IDs written in the CV-06 table; *inferred* ones map a
block named in the table to the lesson whose focus matches and must be confirmed by the A1 range.
`laterLessons` lists only this range's lessons named in the table's "later integration" column.
`conditions-weather-problems` also needs an A1-05 lesson if the A1 range places weather there.

```json
{
  "schemaVersion": 1,
  "situations": [
    { "id": "greetings-social", "titleUk": "Привітання, знайомство, подяка, вибачення, прощання", "firstLessons": ["A1-01-L3", "A1-03-L2"], "laterLessons": [] },
    { "id": "people-home", "titleUk": "Люди, родина, речі й дім", "firstLessons": ["A1-02-L4", "A1-02-L5", "A1-03-L3", "A1-03-L5"], "laterLessons": ["A2-02-L7", "A2-02-L8"] },
    { "id": "routine-study-work-leisure", "titleUk": "Розпорядок дня, навчання, робота, дозвілля", "firstLessons": ["A1-04-L6", "A1-06-L1", "A1-06-L4"], "laterLessons": ["A2-01-L7", "A2-04-L8"] },
    { "id": "food-shopping", "titleUk": "Їжа, покупки, меню, ціни, етикетки", "firstLessons": ["A1-05-L1", "A1-05-L2"], "laterLessons": ["A2-02-L6", "A2-02-L8"] },
    { "id": "time-appointments-transport", "titleUk": "Час, зустрічі, транспорт, квитки, розклади", "firstLessons": ["A1-05-L3", "A1-05-L4"], "laterLessons": ["A2-01-L5", "A2-01-L7"] },
    { "id": "places-accommodation", "titleUk": "Місця, житло, прості буклети й оголошення", "firstLessons": ["A1-05-L5", "A2-02-L6", "A2-02-L8"], "laterLessons": [] },
    { "id": "conditions-weather-problems", "titleUk": "Повсякденні умови, погода, прості проблеми", "firstLessons": ["A2-01-L7"], "laterLessons": ["A2-03-L3"] },
    { "id": "notes-invitations-replies", "titleUk": "Записки, запрошення, вибачення й відповіді", "firstLessons": ["A1-06-L6"], "laterLessons": ["A2-01-L7", "A2-03-L7", "A2-04-L8"] },
    { "id": "instructions-notices", "titleUk": "Короткі інструкції та оголошення", "firstLessons": ["A2-07-L7"], "laterLessons": [] }
  ]
}
```

Explicit: greetings-social, food-shopping, time-appointments-transport, places-accommodation
(A1-05-L5; the A2-02 lessons are this range's choice inside "A2-02 descriptions/options"),
instructions-notices. Inferred: people-home, routine-study-work-leisure, notes-invitations-replies.
`conditions-weather-problems` uses this range's A2-01-L7 placement.
