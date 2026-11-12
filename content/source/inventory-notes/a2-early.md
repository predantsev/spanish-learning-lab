# Inventory note — range `a2-early` (A2-01 … A2-04)

WP-04 atomic curriculum and lexical inventory for blocks A2-01, A2-02, A2-03 and A2-04 (issue #111).
Every row is `reviewStatus: draft`: authored by one model, not language-reviewed, no task bank, clip
or lesson file exists yet. Files: `content/source/skills/A2-0{1,2,3,4}.json`,
`content/source/lexicon/A2-0{1,2,3,4}.json`. Ledger scope covered: 38 objectives, 30 lessons, 4
optional checks (`docs/contracts/curriculum-ledger.json`, rows filtered by blockId).

Totals: 141 skills (139 assessed, 2 incidental), 91 lexical items.

## Conventions used in this range

- **Skill IDs** follow the brief-03 convention and, where the A1 range had already fixed a pattern,
  the A1 spelling: accent pairs are `ortho.accent-pair.<x>` (A1 has `.tu`, `.el`; this range adds
  `.se`, `.mi`, `.que`), preposition uses are `prep.<preposition>.<use>` (`prep.a.personal`). The
  convention has no `gerund`, `demonstrative` or `weather` area, so gerund forms live under
  `progressive.gerund-*`, demonstratives under `pron.demonstrative-*`, and weather frames under
  `formula.weather-hace`, `present.llover-nevar` and `estar.weather`.
- **Auxiliary and verb-form slots reuse existing form skills.** In `estar` + gerund, `ir a`,
  `tener que`, `poder` + infinitive and the CV-05 periphrases, the conjugated verb is attributed to
  `present.estar`, `present.ir`, `present.tener`, `present.stem-o-ue`, `present.stem-e-ie`; the
  construction skill covers framing (preposition, `que`, word order) and the contrast skill covers
  meaning. Only `haber` (new in A2-03) gets its own form skill (`perfecto.haber-forms`).
- **Modalities.** `written-form` = produce the exact form; `context-choice` = choose a form or
  construction from sufficient context without a named target; `reading-meaning` = interpret;
  `construction-use` = build a sentence or write a text; `listening-meaning` + `dictation` only on
  `listening.*` skills. Each listening skill implies ≥2 distinct reviewed clips: 8 listening skills,
  two per block, so ≥16 clips for the range.
- **Incidental rows** (`assessed: false`) carry exactly one modality, `reading-meaning`, because the
  schema requires `minItems: 1` even for incidental rows. No task should target them. Two rows:
  `object-pron.combination-attached`, `indefinido.nosotros-syncretism`.
- **CV rows hook to the objectives of the lesson that hosts them** (e.g. the CV-05 periphrases at
  A2-01-L6 have parents A2-01-O7/O8; the CV-04 weather rows at A2-01-L7 have parent A2-01-O9).
- **Lexicon IDs** use the same rule as the A1 range: `lex.` + lemma lowercased, diacritics folded,
  `ñ` → `n`, spaces → `-`, punctuation removed (`hace (+ tiempo)` → `lex.hace-tiempo`); homographs
  take A1's dot suffix (`lex.manana.adv` / `lex.manana.noun`). No homograph occurred in this range.
  All 91 items were checked against the rule.
- **Situation IDs** are the nine slugs of the A1 range's committed `content/source/situations.json`.

## Per-block summary

| Block | Skills (assessed / incidental) | Lexicon | CV rows placed | Heaviest lessons (first-taught skills) |
|---|---|---|---|---|
| A2-01 | 43 (43 / 0) | 38 | CV-05 L6, CV-04 L7, CV-06 L7, CV-03 extension L2 | L2: 11, L6: 8, L7: 8 |
| A2-02 | 40 (39 / 1) | 32 | CV-03 L3 and L7, CV-02 L8, CV-06 L8 | L3: 8, L1: 7, L6: 7 |
| A2-03 | 25 (25 / 0) | 9 | none allocated by CURRICULUM | L3: 9 |
| A2-04 | 33 (32 / 1) | 12 | CV-04 L8, CV-06 L8 | L5: 11 |

**Lesson-size flags (for the integrator, not decided here).** CURRICULUM asks for a size review
before authoring and an explicit revision for any split. A2-01-L2 (eleven O2 items), A2-01-L6 (five
frames plus three CV-05 periphrases), A2-01-L7 (integration plus four CV-04 rows), A2-02-L3
(recipient pronouns, prepositional forms, conmigo/contigo, su clarification, mí/mi), A2-03-L3 (nine
individual participles) and A2-04-L5 (strong endings plus ten verbs) look larger than one short
lesson. CONTENT-PLAN allows labelled resumable steps under the same lesson ID; that choice belongs
to lesson authoring.

### First-taught skills per lesson

- **A2-01-L1** (5): `present.stem-e-ie`, `present.stem-o-ue`, `present.jugar`, `present.stem-e-i`, `present.stem-unchanged-1p-2p`
- **A2-01-L2** (11): `present.yo-g`, `present.venir`, `present.decir`, `present.yo-zco`, `present.saber`, `ortho.accent-pair.se`, `present.dar`, `present.ver`, `present.yo-spelling-g-j`, `contrast.saber-conocer`, `prep.a.personal`
- **A2-01-L3** (5): `progressive.gerund-regular-ar`, `progressive.gerund-regular-er-ir`, `progressive.gerund-yendo`, `progressive.gerund-e-i`, `progressive.gerund-o-u`
- **A2-01-L4** (3): `progressive.estar-gerund`, `contrast.present-progressive`, `listening.ongoing-actions`
- **A2-01-L5** (3): `future-ir.ir-a-inf`, `contrast.ir-a-place-vs-plan`, `contrast.plan-vs-wish`
- **A2-01-L6** (8): `ability.poder-inf`, `ability.saber-inf`, `contrast.poder-saber`, `obligation.tener-que`, `contrast.modal-meaning`, `perifrasis.acabar-de`, `perifrasis.empezar-a`, `perifrasis.volver-a`
- **A2-01-L7** (8): `contrast.routine-now-plan`, `reading.routine-now-plan`, `writing.routine-now-plan`, `listening.situation-plan`, `formula.weather-hace`, `present.llover-nevar`, `estar.weather`, `contrast.hace-tener-estar`
- **A2-02-L1** (7): `pron.demonstrative-agreement`, `pron.demonstrative-distance`, `pron.demonstrative-neuter`, `ortho.demonstrative-no-accent`, `poss.tonic-forms`, `poss.tonic-standalone`, `contrast.poss-mi-mio`
- **A2-02-L2** (4): `object-pron.direct-1-2`, `object-pron.direct-3`, `object-pron.direct-referent`, `object-pron.placement-finite`
- **A2-02-L3** (8): `object-pron.indirect-forms`, `object-pron.indirect-recipient`, `object-pron.indirect-doubling`, `pron.prepositional`, `pron.conmigo-contigo`, `poss.su-clarification`, `ortho.accent-pair.mi`, `listening.pronoun-reference`
- **A2-02-L4** (3): `object-pron.placement-infinitive`, `object-pron.placement-gerund`, `ortho.gerund-pronoun-accent`
- **A2-02-L5** (3): `object-pron.combination-order`, `object-pron.se-replacement`, `object-pron.combination-attached` (incidental)
- **A2-02-L6** (7): `compare.mas-menos-que`, `compare.tan-como`, `compare.tanto-como`, `compare.mas-de-number`, `compare.mejor`, `compare.peor`, `compare.mayor-menor`
- **A2-02-L7** (3): `relative.que`, `ortho.accent-pair.que`, `writing.description-detail`
- **A2-02-L8** (5): `pron.algo-alguien`, `neg.double-negation`, `reading.description-comparison`, `writing.choice-description`, `listening.description-comparison`
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
| CV-02 | A2-02-L8 (internal step before independent use, per the lesson row) | `pron.algo-alguien`, `neg.double-negation` — productive `no` + verb + `nada`/`nadie`; the one-word answers are A1's `neg.short-answer.nada-nadie` (A1-06-L5) |
| CV-03 | A2-02-L3 | `pron.prepositional`, `pron.conmigo-contigo`, `ortho.accent-pair.mi` |
| CV-03 | A2-02-L7 | `ortho.accent-pair.que` (builds on A1 `ortho.interrogative-accent` and `ortho.porque-por-que`) |
| CV-03 (extension) | A2-01-L2 | `ortho.accent-pair.se` — sé/se is not in the CV-03 pair list; tagged CV-03 as the same diacritic family |
| CV-04 | A2-01-L7 (present weather/state before past use; handoff via `returns.later` A2-05-L5) | `formula.weather-hace`, `present.llover-nevar`, `estar.weather`, `contrast.hace-tener-estar` (revisits A1 `tener.physical-states` and `estar.state`) |
| CV-04 | A2-04-L8 (receives A1 sequence links) | `link.past-sequence` (prerequisites `link.sequence`, `link.sequence.antes-despues-de`), `writing.past-sequence` |
| CV-05 | A2-01-L6 (after the poder / tener que foundation) | `perifrasis.acabar-de`, `perifrasis.empezar-a`, `perifrasis.volver-a` |
| CV-06 | A2-01-L7, A2-02-L8, A2-04-L8 | `reading.routine-now-plan`, `writing.routine-now-plan`, `formula.weather-hace`, `reading.description-comparison`, `writing.choice-description`, `reading.past-sequence`, `writing.past-sequence`; every skill also carries `situations` |

CV-01 has no allocation in this range (A1-01/A1-03/A1-05 first use, reuse in A1-06/A2-07).

## Cross-range prerequisites (A1 range)

All earlier-range IDs referenced here exist in the A1 range as committed on branch
`worktree-agent-a4ee6409cb5ae08ee` (head `3205589`, 2026-11-06 01:21 +0100); the lessons below are
that commit's `firstLesson` values. Nothing in this range still depends on a guessed A1 ID. If the
A1 range is renamed before integration, these are the references to update.

| A1 ID | A1 first lesson (objectives) | Used by (prerequisite / exceptionOf) |
|---|---|---|
| `adj.agreement.o-a` | A1-02-L4 (A1-02-O4) | `compare.mas-menos-que`, `contrast.hace-tener-estar`, `object-pron.direct-3`, `perfecto.participle-invariance`, `poss.tonic-forms`, `pron.demonstrative-agreement`, `relative.que`, `writing.description-detail` |
| `article.contraction-al` | A1-04-L3 (A1-04-O4) | `contrast.ir-a-place-vs-plan`, `prep.a.personal` |
| `contrast.muy-mucho` | A1-05-L1 (A1-05-O1) | `formula.weather-hace` |
| `contrast.wish-plan` | A1-06-L4 (A1-06-O4/O5) | `contrast.plan-vs-wish` |
| `date.days-of-week` | A1-05-L4 (A1-05-O4) | `time.past-markers` |
| `estar.state` | A1-03-L3 (A1-03-O3) | `contrast.hace-tener-estar`, `estar.weather` |
| `gustar.a-noun-le` | A1-06-L1 (A1-06-O1) | `object-pron.indirect-doubling` |
| `gustar.pronouns`, `gustar.pronouns.plural` | A1-06-L1 (A1-06-O1) | `object-pron.indirect-forms` |
| `gustar.responses` | A1-06-L1 (A1-06-O1) | `pron.prepositional` |
| `hay.existence` | A1-03-L4 (A1-03-O4) | `perfecto.haber-vs-hay`, `pron.algo-alguien` |
| `link.porque` | A1-06-L5 (A1-06-O6) | `writing.choice-description` |
| `link.sequence` | A1-04-L6 (A1-04-O7) | `link.past-sequence` |
| `link.sequence.antes-despues-de` | A1-06-L5 (A1-06-O6) | `link.past-sequence` |
| `neg.no-before-verb` | A1-03-L6 (A1-03-O6) | `neg.double-negation`, `object-pron.placement-finite`, `perfecto.word-order` |
| `neg.nunca` | A1-04-L5 (A1-04-O6) | `neg.double-negation`, `perfecto.use-experience` |
| `neg.short-answer.nada-nadie` | A1-06-L5 (A1-06-O6/O7) | `neg.double-negation`, `pron.algo-alguien` |
| `number.0-15` | A1-05-L1 (A1-05-O1) | `time.hace-ago` |
| `number.16-29` | A1-05-L1 (A1-05-O1) | `compare.mas-de-number` |
| `ortho.accent-pair.el` | A1-03-L1 (A1-03-O1) | `pron.prepositional` |
| `ortho.interrogative-accent` | A1-03-L6 (A1-03-O6) | `ortho.accent-pair.que` |
| `ortho.porque-por-que` | A1-06-L5 (A1-06-O6) | `ortho.accent-pair.que` |
| `poss.mi-tu-su` | A1-02-L5 (A1-02-O5) | `contrast.poss-mi-mio`, `ortho.accent-pair.mi`, `poss.tonic-forms` |
| `poss.nuestro-vuestro` | A1-02-L5 (A1-02-O5) | `poss.tonic-forms` |
| `poss.su-reference` | A1-02-L5 (A1-02-O5) | `poss.su-clarification` |
| `prep.a.destination` | A1-04-L3 (A1-04-O4) | `contrast.ir-a-place-vs-plan` |
| `prep.con.company` | A1-04-L1 (A1-04-O1) | `pron.conmigo-contigo` |
| `present.estar` | A1-03-L3 (A1-03-O3) | `indefinido.estar`, `progressive.estar-gerund` |
| `present.hacer` | A1-04-L3 (A1-04-O4) | `formula.weather-hace`, `indefinido.hacer`, `participle.hecho`, `present.yo-g` |
| `present.ir` | A1-04-L3 (A1-04-O4) | `future-ir.ir-a-inf`, `indefinido.ser-ir` |
| `present.querer` | A1-06-L4 (A1-06-O4) | `indefinido.querer` |
| `present.regular-ar` | A1-04-L1 (A1-04-O1) | `indefinido.regular-ar`, `participle.regular-ar`, `perifrasis.acabar-de`, `present.dar`, `present.stem-e-ie`, `present.stem-o-ue`, `progressive.gerund-regular-ar` |
| `present.regular-er` | A1-04-L2 (A1-04-O2) | `indefinido.regular-er-ir`, `participle.regular-er-ir`, `present.saber`, `present.stem-e-ie`, `present.stem-o-ue`, `present.ver`, `present.yo-g`, `present.yo-spelling-g-j`, `present.yo-zco`, `progressive.gerund-regular-er-ir` |
| `present.regular-ir` | A1-04-L2 (A1-04-O3) | `indefinido.regular-er-ir`, `participle.regular-er-ir`, `present.stem-e-i`, `present.stem-e-ie`, `present.stem-o-ue`, `present.yo-g`, `present.yo-zco`, `progressive.gerund-regular-er-ir` |
| `present.ser` | A1-03-L1 (A1-03-O1/O2) | `indefinido.ser-ir` |
| `present.tener` | A1-03-L5 (A1-03-O5) | `indefinido.tener`, `obligation.tener-que`, `present.venir` |
| `quant.mucho` | A1-05-L1 (A1-05-O1) | `compare.tanto-como` |
| `querer.infinitive` | A1-06-L4 (A1-06-O4) | `future-ir.ir-a-inf`, `object-pron.placement-infinitive` |
| `reflexive.placement` | A1-04-L4 (A1-04-O5) | `perfecto.pronoun-placement` |
| `reflexive.pronouns` | A1-04-L4 (A1-04-O5) | `object-pron.direct-1-2`, `ortho.accent-pair.se` |
| `tener.age` | A1-05-L1 (A1-05-O1) | `compare.mayor-menor` |
| `tener.physical-states` | A1-03-L5 (A1-03-O5) | `contrast.hace-tener-estar` |
| `time.future-expressions` | A1-06-L4 (A1-06-O5) | `future-ir.ir-a-inf` |
| `time.plan.present-for-future` | A1-06-L4 (A1-06-O5) | `contrast.plan-vs-wish` |

The A1 range's own `returns.later` already name lessons of this range (A2-01-L1/L2/L4/L5/L6/L7,
A2-02-L1/L3/L4/L6/L7/L8, A2-03-L4, A2-04-L8); lesson authors should revisit those A1 IDs there.
Personal *a* has no A1 allocation (A1 note); this range teaches it at A2-01-L2 with *conocer a* and
returns to it at A2-02-L2/L8. The A1 range defers `conmigo`/`contigo` and the *de él / de ella*
clarification of *su* to A2-02; both are rows here (`pron.conmigo-contigo`,
`poss.su-clarification`, A2-02-L3).

## Mapping for the A2-late range (later blocks)

The A2-late range (branch `worktree-agent-a58f7081ceba23a5c`, head `e5ce5fb`) references these
IDs of this range correctly: `present.stem-e-ie`, `present.stem-o-ue`, `present.stem-e-i`,
`present.yo-g`, `obligation.tener-que`, `participle.hecho`, `perfecto.choice-context`,
`indefinido.regular-ar`, `indefinido.regular-er-ir`, `indefinido.ser-ir`. Its other guesses map
here as follows:

| A2-late guessed ID | ID(s) in this range |
|---|---|
| `ability.poder-infinitive` | `ability.poder-inf` |
| `present.weather-state` | `formula.weather-hace`, `present.llover-nevar`, `estar.weather` (+ A1 `tener.physical-states`, `estar.state`) |
| `object-pron.direct` | `object-pron.direct-3`, `object-pron.direct-1-2` |
| `object-pron.indirect` | `object-pron.indirect-forms` (role: `object-pron.indirect-recipient`) |
| `object-pron.placement` | `object-pron.placement-finite`, `-infinitive`, `-gerund` |
| `compare.regular` | `compare.mas-menos-que`, `compare.tan-como` (`compare.tanto-como` for quantity) |
| `indefinido.spelling-changes` | `indefinido.spelling-car`, `-gar`, `-zar` |
| `indefinido.choice-context` | `indefinido.use-completed-event`; the initial contrast is `contrast.perfecto-indefinido` (A2-04-L7), which A2-late's `contrast.perfecto-indefinido.time-frame` / `.experience-occasion` can take as a prerequisite |

Other points for the integrator: A2-late's `present.yo-g` description lists *digo, tengo, vengo*,
which here are `present.decir`, `present.venir` and A1 `present.tener`; its `present.stem-e-i` lists
*seguir*, which this range does not teach (only pedir, repetir, servir). *Cojo* is taught at
A2-01-L2 (`present.yo-spelling-g-j`), as A2-late's question 8 asks. Temporal *cuando* and *para* +
infinitive are not taught in this range. A2-late's `contrast.nosotros-present-indefinido` overlaps
in subject with the incidental `indefinido.nosotros-syncretism` (A2-04-L2); they can coexist (first
exposure vs assessed contrast). A2-late uses different situation slugs (`people-home`,
`routine-work-leisure`, `time-transport`, `messages-invitations`, `conditions-problems`,
`greetings-social`) from the A1 `situations.json`. Thirteen A2-late lexicon IDs duplicate items first
taught here (`lex.antiguo`, `anuncio`, `coger`, `comodo`, `cruzar`, `gafas`, `jardin`, `mandar`,
`prestar`, `recoger`, `ruidoso`, `tranquilo`, `ultimamente`); the earlier firstLesson is here.
A2-late also has references that resolve in neither this range nor the committed A1 range and are
not this range's to map: `adj.agreement`, `estar.location-state`, `hay.existential`,
`ortho.stress-rules`, `prep.spatial`, `ser.identity-description`, `time.clock`, `time.frequency`.

## Lexicon removed because the A1 range teaches it first

28 items were dropped from this range because the A1 range already owns them: `cerrar`, `costar`,
`fútbol`, `salir`, `playa`, `nadar`, `pasado mañana`, `la semana que viene`, `próximo`, `calor`,
`frío`, `hambre`, `sed`, `sueño`, `tiempo` (A2-01); `llave`, `mochila`, `paraguas`, `barato`, `caro`,
`piso`, `habitación`, `idioma`, `algo`, `nada`, `nadie` (A2-02); `más tarde`, `al final` (A2-04).
Senses this range relies on that the A1 rows lack (to merge into the A1 items, not new IDs):
`lex.tiempo` «погода» (¿Qué tiempo hace?; the A1 note already announces it); `lex.frio` adjective
use (frío, fría); `lex.habitacion` «номер (у готелі)»; `lex.nadie` «нікого»;
`lex.la-semana-que-viene` with *el mes / el año que viene*; `lex.hambre` *mucha hambre* (the rule
now lives in `contrast.hace-tener-estar`).

## Reconciliation log (relative to this range's first commits)

Duplicates removed: `tener.physical-state` (A1 `tener.physical-states`), `neg.nada-nadie` (A1
`neg.short-answer.nada-nadie`). Renamed: `ortho.se-accent` → `ortho.accent-pair.se`,
`ortho.mi-accent` → `ortho.accent-pair.mi`, `ortho.que-accent` → `ortho.accent-pair.que`,
`prep.a-personal` → `prep.a.personal`. Situation slugs aligned to A1's `situations.json`. Added:
`pron.conmigo-contigo`, `poss.su-clarification`. `link.past-sequence` narrowed to what is new
(*al día siguiente* and the past-narrative use).

## Source items scoped out or deferred (with reason)

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
`prep.a.personal`, `present.stem-unchanged-1p-2p`, `perfecto.haber-vs-hay`,
`contrast.gerund-participle`, `ortho.accent-pair.se`. Items the A1 range deferred to A2-02:
`pron.conmigo-contigo`, `poss.su-clarification`. Wider form sets than the source names:
`indefinido.stem-o-u` (dormir, morir added to the pedir family), `indefinido.poder`, `poner`,
`venir`, `querer`, `decir` (S1 9.1.3 names tener/hacer/estar/ver/dar),
`indefinido.stem-change-boundary`. CV-04 contrast: `contrast.hace-tener-estar`. Incidental:
`object-pron.combination-attached`, `indefinido.nosotros-syncretism`.

## Sources that would need adding (not added to `sources.json`)

Named without URLs; the exact pages and passages were not retrieved in this pass.

- RAE/ASALE, *Ortografía de la lengua española* (2010) on the diacritic accent and demonstratives,
  plus the RAE's 2023 clarification on the optional accent in ambiguity — for
  `ortho.demonstrative-no-accent`.
- RAE/ASALE, *Diccionario panhispánico de dudas*: entries on *leísmo*, *se* (the *se los* plural
  pattern), *mayor* (*más mayor*) and *hambre* (*mucha hambre*) — for `object-pron.direct-3`,
  `object-pron.se-replacement`, `compare.mayor-menor`, `contrast.hace-tener-estar`.
- A descriptive source on regional perfecto/indefinido use in Spain — for
  `perfecto.use-current-period` and `contrast.perfecto-indefinido`.

Model numbers of S7 are cited only where CURRICULUM records them (haber/hecho 36/37, decir 27,
leer 40, pedir 46, ir 38, ser 61, ver 68); every other S7 citation says "model number not verified".
All S1/S4/S5/S6/S8/S9 sections are taken from the CURRICULUM anchors and were not re-read here.

## Doubts for language review (questions, not assertions)

1. Leísmo: accept `le` for one male person as direct object (`¿Juan? Le veo mañana`)? What about
   `les` for several male persons? (The A2-late range accepts `le` in its imperative row as well.)
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
17. Ukrainian terminology: `форма gerundio` (gerundio; the one course-wide term per the C-084
    integrator decision of 2026-11-09), `дієприкметник` (participio),
    `простий минулий час` (indefinido), `складений минулий час` (perfecto compuesto) — align with
    the A1 range's wording.
18. `poder` vs `saber` + infinitive: is the Ukrainian «могти/вміти» parallel accurate in every
    task context?

## Situations — proposed additions to the A1 `situations.json`

The committed A1 file already lists several lessons of this range (A2-01-L5/L7 and A2-04-L8 for
routine, A2-02-L6/L7/L8 for people and home, A2-02-L7/L8 as first use of places and accommodation,
A2-01-L7 as first use of weather). Additions this range's skills support:

| Situation | Add to | Lessons | Basis |
|---|---|---|---|
| `food-shopping` | laterLessons | A2-02-L6 | product and price comparisons (`compare.*`) |
| `time-appointments-transport` | laterLessons | A2-01-L7 | plans with explicit time in the integrated situation |
| `places-accommodation` | firstLessons | A2-02-L6 | accommodation comparisons precede the L7/L8 descriptions |
| `routine-study-leisure` | laterLessons | A2-03-L7 | account of the day / experiences |
| `personal-messages` | laterLessons | A2-01-L7, A2-03-L7, A2-04-L8 | the range's writing tasks are short messages and replies |
