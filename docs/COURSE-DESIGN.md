# Course design

Updated: 2026-10-26. This is a discovery document, not an approved implementation specification.

## Discussion workflow

On 2026-10-21, the owner requested sequential discussion of three remaining planning parts: detailed curriculum, remaining visual designs, then the technical implementation/verification plan. Present a concrete proposal in text and use native agreement choices when available. On 2026-10-22 the owner reiterated the preference for short choices: Далі (accept this proposal and continue) or Хочу змінити (explain changes in chat); no typed agreement is required. A choice accepts the displayed proposal only; silence or a preselected option is not acceptance. This is a collaboration preference, separate from application UI requirements, and does not authorize implementation.

## Confirmed intent

Source for C-001 through C-005: the owner's initiating request on 2026-10-07 in the planning conversation. The request described forgetting material after reading and exercises, asked for repeated practice until the learner feels it is learned, and explicitly deferred implementation until discussion and a documented plan.

| ID | Confirmed requirement |
|---|---|
| C-001 | Design a Spanish-learning course, using JavaScript Learning Lab as a reference for the project approach. |
| C-002 | Repeatedly revisit previously studied material; finishing initial reading or exercises must not end access to practice. |
| C-003 | Account for the learner's own judgment of whether material has been learned. The interaction and mastery criteria are still open. |
| C-004 | Develop the design collaboratively through proposals, questions, and answers; agree on documentation and a plan before implementation. |
| C-005 | Create a public repository and a project directory in the maintainer's Startups area. |

Source for C-006 through C-013: the owner's follow-up on 2026-10-07 specifying foundations, selectable practice, hints, tense confusion, personally useful expressions, and the exclusion of conversation. Personal proficiency estimates and learning records are not published here.

| ID | Confirmed requirement |
|---|---|
| C-006 | Start the course from beginner foundations even for a returning learner. The course horizon is at least B2, delivered in stages under C-024. |
| C-007 | Allow practice-only sessions with no obligation to study new material. The learner can choose a topic directly and identify topics previously studied outside the course. |
| C-008 | A selected topic provides a rule refresher and continued varied written practice: translation, writing sentences, and selecting correct answers. |
| C-009 | Use errors and requests for hints as evidence for more practice of the relevant skill, including targeted recommendations and its appearance in later sentences. The attribution and scheduling design remain open. |
| C-010 | Address regular conjugation, exceptions, and confusion between tenses, including the distinction between forming a tense and choosing when to use it. |
| C-011 | Support repeated practice of personally useful words and recurring expressions, even when they are not globally frequent. Capture and validation workflows remain to be designed. |
| C-012 | Conversation and speaking practice are out of scope. Do not design a separate future conversation course. Listening is included under C-035/C-036; first-stage inclusion is settled under C-037; detailed coverage and content sourcing remain open. |
| C-013 | Evaluate deterministic operation and possible AI assistance before selecting an architecture. The external-assistant direction is now planned under C-015; embedded model calls, paid API use, and implementation remain unapproved. |

Source for C-014 through C-016: the owner's next follow-up on 2026-10-07 agreeing with the proposed course ideas and requesting a plan for an external assistant connection, to revisit after the other course discussions.

| ID | Confirmed requirement |
|---|---|
| C-014 | Adopt the direction of the preceding study/practice entry points, skill-specific evidence, differentiated hints, tense contrasts, and personal phrase practice. Exact schedules, mastery criteria, and phrase capture remain open. |
| C-015 | Plan an on-demand external assistant connection: the learner opens an assistant chat to discuss current application context, request help or additional practice, and request supported changes. Prefer an application API; CLI is an alternative. Plan a skill or equivalent operating instructions. |
| C-016 | Resolve and record this integration direction first, then resume the personal-phrase discussion. Revisit detailed integration design after the remaining course requirements. This is planning authorization, not implementation authorization. |

Source for C-017 through C-019: the owner's subsequent 2026-10-07 clarification accepting the integration direction and asking for context selection, assistance guidance, and safe content extension.

| ID | Confirmed requirement |
|---|---|
| C-017 | Let the assistant discover open learning contexts and use the most recently worked-on context as a likely default. Ask which context only when the target is ambiguous; multiple tabs alone must not force a question. |
| C-018 | Plan adding material during an assistant conversation so that a new item/button can appear in the application without changing its code for each addition. Explore stored content and possibly external HTML, conditional on an acceptable security design. No database technology or arbitrary HTML execution is approved. |
| C-019 | Provide a recommendation for external-assistance evidence and adjust the integration plan to accommodate content extension. Continue design only; implementation remains deferred. |

Source for C-020 and C-021: the owner's next 2026-10-07 response accepting the preceding recommendations, questioning whether MCP is necessary, and asking which course decisions remain.

| ID | Confirmed requirement |
|---|---|
| C-020 | Adopt recent-context selection, neutral external-assistance evidence, and structured supplemental content via the application API. Keep arbitrary HTML outside the proposed first version. Detailed implementation remains deferred. |
| C-021 | Evaluate API plus a skill as the simpler integration instead of assuming an MCP server is required. Identify remaining product decisions and discuss them gradually. |

Source for C-022: on 2026-10-07, after discussing the three personal-phrase entry paths, the owner explicitly requested all three for the future implementation. The discovery-only phase is unchanged.

| ID | Confirmed requirement |
|---|---|
| C-022 | Support all three personal-phrase entry paths: save a useful item from the course; add an existing Spanish phrase from outside the course with optional context; and capture an intended meaning in Ukrainian before knowing its Spanish wording. Unresolved entries remain drafts until the Spanish wording and meaning are checked; only ready entries become practice targets. |

Source for C-023: the owner explicitly accepted combining both phrase-practice modes on 2026-10-07 and requested moving to the next topic once the current topic was sufficiently resolved.

| ID | Confirmed requirement |
|---|---|
| C-023 | Combine recall of the saved phrase with appropriate variations of its reusable construction. Start from the saved phrase and introduce small variations using familiar vocabulary and grammar; preserve fixed expressions where variation is inappropriate. |

Source for C-024: the owner requested a complete course designed to at least B2 on 2026-10-07, implemented in parts: strong A2 first for hands-on testing, then B1, then B2. The surrounding conversation remains discovery-only.

| ID | Confirmed requirement |
|---|---|
| C-024 | Plan the full course through at least B2 from the outset, with staged delivery: beginner foundations through a strong A2 as the first complete usable stage, followed by B1 and B2. The owner must be able to start testing the first stage without waiting for later stages. |

Source for C-025 through C-027: the owner's 2026-10-08 request to plan a later visual-design exploration, support course use and exercises on a phone, and begin detailed A1-A2 planning.

| ID | Confirmed requirement |
|---|---|
| C-025 | Include a dedicated later design stage: explore visual alternatives, create sketches/mockups, compare usability, and choose a direction before final UI implementation. |
| C-026 | Support using the course on a mobile phone, including reading, scrolling, and completing exercises, alongside computer use. A native app, cloud sync, and specific hosting are not implied. |
| C-027 | Begin detailed A1-A2 curriculum design now; keep B1-B2 at roadmap depth for the time being. This authorizes planning, not application implementation. |

Source for C-028 and C-029: on 2026-10-08, the owner accepted the preceding A1-A2 outline and familiar-foundations proposal and explicitly selected Spanish of Spain.

| ID | Confirmed requirement |
|---|---|
| C-028 | Use Spanish of Spain as the main course variety for examples and language targets. UI and explanation languages are settled separately under C-030/C-031. |
| C-029 | Adopt the presented A1-A2 outline and a brief practical foundation with a short optional self-check for familiar basics, without forcing a long introduction. Detailed lessons, assessment thresholds, and coverage validation remain pending. |

Source for C-030 and C-031: the owner's 2026-10-08 follow-up selected Ukrainian only initially, requested future language expansion and agent-assisted translation through the API, and asked to discuss the remaining topics sequentially.

| ID | Confirmed requirement |
|---|---|
| C-030 | Initially provide the interface, instructions, explanations, hints, and feedback in Ukrainian only. Spanish of Spain remains the language being studied. No additional instructional language is required for the first release. |
| C-031 | Plan internationalization from the outset so additional interface and instructional languages can be added later. Include future agent API support for preparing and adding translations. This is design scope, not authorization to implement or automatically publish unchecked translations. |

Source for C-032: on 2026-10-08, the owner accepted the recommended-session proposal with free topic/mode selection and asked to move to the next discussion.

| ID | Confirmed requirement |
|---|---|
| C-032 | Combine a recommended session with direct access to course study, selected-topic/personal-phrase practice, and mixed review. Keep new material optional, offer flexible time guidance rather than a mandatory countdown, and allow stopping/resuming with saved work. Exact time presets and composition remain adjustable design details. |

Source for C-033: on 2026-10-13, the owner accepted the preceding review recommendations, including occasional checks after marking an item known and a separate pause, and requested moving to the next topic.

| ID | Confirmed requirement |
|---|---|
| C-033 | Use adaptive review for specific skills, exceptions, and ready phrases, with manual frequency controls. Independent success can reduce frequency; relevant errors or help can bring practice forward without resetting the whole topic. Marking an item known retains occasional checks; an explicit pause disables automatic selection while preserving history and manual access. Keep review manageable after missed days. Exact intervals, evidence thresholds, and labels remain to be designed. |

Source for C-034: on 2026-10-13, the owner accepted the preceding written-answer-checking recommendations and asked to continue planning.

| ID | Confirmed requirement |
|---|---|
| C-034 | Check supported written answers using reviewed rules and acceptable variants. Distinguish accepted answers, demonstrated target skills with separate corrections, confirmed errors, and unresolved answers. Do not penalize an unlisted answer merely for differing from a reference; retain it for optional external review without awarding an unverified pass. Give targeted Ukrainian feedback and retries, with full answers available separately. Preserve meaningful orthographic distinctions and allow reviewed corrections to answer variants and prior grading. Embedded AI is not required for the initial direction; exact checking mechanisms remain to be designed. |

Source for C-035/C-036: on 2026-10-14, the owner requested listening to Spanish from speakers from Spain, tracking material not recognized by ear, and returning to it later. The owner suggested everyday greetings/farewells and shop interactions as entry points, then sentences and texts. Exact first-release allocation was not specified.

| ID | Confirmed requirement |
|---|---|
| C-035 | Include listening comprehension in the planned course, using native speech from Spain as the target. Preserve the exclusion of learner speaking/conversation. Actual audio sources remain to be agreed; first-stage inclusion is settled under C-037; the original human-recording-only constraint is superseded by C-040, which permits reviewed synthetic Spain Spanish. |
| C-036 | Track difficulty recognizing material by ear and revisit it adaptively. Begin with useful everyday phrases and progressively expand to sentences and connected texts. Keep auditory recognition evidence separate from knowing a written phrase or its meaning. |

Source for C-037: on 2026-10-14, the owner accepted including short audio exercises in the first usable A1-A2 version and requested moving on.

| ID | Confirmed requirement |
|---|---|
| C-037 | Include a small set of everyday-phrase listening exercises using native speakers from Spain in the first usable A1-A2 version. Expand toward longer listening material incrementally. C-040 subsequently permits synthetic Spain Spanish for this first-stage material. Clip counts, detailed coverage, sources, and production arrangements remain open; this authorizes planning only. |

Source for C-038: on 2026-10-14, the owner accepted the prepared-course-plus-reviewed-additions model and requested moving to the next discussion.

| ID | Confirmed requirement |
|---|---|
| C-038 | Use a prepared reviewed course core with varied exercises and agent-assisted additions through the planned API. New material enters practice after review, including personal constructions. Maintain the draft/review/ready distinction. Review responsibility, audio sources, budgets, and detailed production arrangements remain open. |

Source for C-039: on 2026-10-15, after stating that no human reviewer is available, the owner explicitly requested a documented model/effort plan with Codex-authored material reviewed by Claude and Claude-authored material reviewed by Codex.

| ID | Confirmed requirement |
|---|---|
| C-039 | Plan reference-backed cross-provider content review without requiring a human reviewer. Codex authors receive Claude review; Claude authors receive Codex review. Record recommended concrete models and effort levels. Exact settings below are initial recommendations to evaluate, not measured Spanish-content performance or authorization to run production. |

Source for C-040: on 2026-10-16, the owner excluded a budget for hiring native speakers, proposed found recordings or voice-model generation with approximately $5-10 in one-time spending, and then accepted the proposed staged audio approach and requested moving on.

| ID | Confirmed requirement |
|---|---|
| C-040 | Use pre-generated, reviewed synthetic speech with pronunciation appropriate to Spain as the initial audio route; save and reuse the files. No budget for commissioned human recordings. Plan approximately $5-10 for an initial generation batch, not a guaranteed whole-course budget or recurring subscription. Compare a few voices before selecting a service; add suitable existing human recordings when available with appropriate rights. Clearly label synthetic audio. This accepts planning, not a purchase, subscription activation, or generation run. |

Source for C-041: on 2026-10-19, the owner explicitly chose initial use on their computer through a browser. A hosted site is a possible later stage; away-from-home use is uncertain, with VS Code port forwarding mentioned only as a future option to examine.

| ID | Confirmed requirement |
|---|---|
| C-041 | Deliver the first version for local browser use on the owner's computer. Defer hosting/cloud deployment and remote access until needed. Preserve the planned mobile-friendly interface under C-026; phone reachability and cross-device synchronization are not initial prerequisites. Investigate a private tunnel only if remote use becomes a concrete need. No tunnel setup, network exposure, hosting purchase, or implementation is authorized by this planning decision. |

Source for C-042: on 2026-10-19, the owner accepted the proposed single-profile local progress, automatic saving, backups, export/import, and history-preserving content updates, then requested moving to the next discussion.

| ID | Confirmed requirement |
|---|---|
| C-042 | Use one private local learner profile with automatic saving of answers, hint/reveal evidence, review state, personal phrases, preferences, and study location. Preserve progress across browser/application restarts in application-managed storage separate from browser cache. Provide automatic backups and export/import for moving computers or later hosting. Course updates must preserve learner history. Storage technology, backup frequency/retention/destination, and detailed restore behavior remain to be designed; no implementation is authorized. |

Source for C-043/C-044: on 2026-10-19, the owner clarified that learning and personal testing should begin only after the complete first application/course version is ready, then accepted the explanation that this means the agreed full beginner-to-A2 stage, locally available without internet. Internal incremental development is allowed; it is not an early-learning obligation for the owner.

| ID | Confirmed requirement |
|---|---|
| C-043 | Deliver ordinary practice offline after installation of the prepared course and assets, including lessons never previously opened. This is persistent local availability, not only continued use of an already-loaded browser page. Prepared lessons, exercises/checking, hints, review, audio, and progress saving must work with the local service running and no internet. External AI help, new generation, and downloads may require connectivity; unresolved answers retain their uncertainty status. |
| C-044 | Begin owner learning and personal testing only after the complete agreed first application and all beginner-to-A2 materials are prepared, reviewed, and available locally, with core scenarios tested. Include course study, selected-topic practice, adaptive review, hints, personal phrases, listening, persistence, and backups. B1/B2 remain subsequent expansions. An internal pilot may validate the implementation/content workflow but must not substitute for the complete first handoff or require the owner to learn while later A2 lessons are unfinished. This authorizes planning only. |

Source for C-045: on 2026-10-20, the owner accepted a concise home overview, optional topic/skill detail, and a short session summary, with course coverage kept separate from evidence of independent recall/use.

| ID | Confirmed requirement |
|---|---|
| C-045 | Show a concise overview of study location and actionable practice recommendations with evidence-based reasons; expose deeper skill history on demand and summarize completed sessions. Separate lessons covered from skill evidence, including differences between form production, construction choice, and listening where assessed. Do not make a statistics-heavy dashboard mandatory or equate lesson completion with mastery. Exact labels, charts, thresholds, and layouts remain design work. |

Source for C-046: on 2026-10-20, the owner accepted the complete studied-topic practice scenario, including optional rule refresh, varied tasks, targeted assistance, later revisits, personal-phrase capture, and a saved session summary.

| ID | Confirmed requirement |
|---|---|
| C-046 | Adopt the return-to-practice walkthrough below: choose a studied topic or narrower skill without new lessons, optionally refresh the rule, use varied tasks and targeted help, revisit difficulties without an endless forced loop, and finish with saved progress and an evidence-based summary. Listening is optional per session. Detailed task counts, scheduling, UI labels, and implementation remain open. |

Source for C-047: on 2026-10-20, the owner agreed to proceed after the proposed new-lesson walkthrough. This acceptance concerns the learning flow; visual alternatives remain proposals.

| ID | Confirmed requirement |
|---|---|
| C-047 | Adopt the new-lesson walkthrough below: a small practical objective, concise explanation, supported practice, varied independent opportunities with available help, a saved summary, and later review. Familiar-topic shortcuts and stopping/resuming remain available. Exact content, task counts, exit criteria, and UI design remain open; implementation is not authorized. |

Source for C-048: on 2026-10-20, after viewing the combined Focus/reference mockup and the recommendation to keep help available, the owner approved the direction and asked to continue.

| ID | Confirmed requirement |
|---|---|
| C-048 | Use Focus with a contextual reference panel collapsed by default as the exercise-screen direction. Keep rules, exceptions, and examples accessible without requiring an answer first; retain the answer draft when opening or closing the panel. Relevant help remains assistance evidence after closing, and does not retroactively change an already checked independent answer. The narrow-screen treatment, detailed attribution, and final visual polish still require verification. This approves design direction only. |

Source for C-049: on 2026-10-20, the owner explicitly accepted the proposed home-screen priority and asked to record it and continue.

| ID | Confirmed requirement |
|---|---|
| C-049 | Give recommended review the primary emphasis when eligible material exists, with a concrete reason for the recommendation. Keep Resume and Choose topic immediately accessible. Resume returns to saved work; review does not block course study or manual selection. With no eligible review, offer an appropriate course starting point. This accepts the home-screen hierarchy, not a finished visual layout or implementation. |

Source for C-050: on 2026-10-21, the owner explicitly selected both proposed navigation routes and asked to continue.

| ID | Confirmed requirement |
|---|---|
| C-050 | Provide both learning-topic navigation and everyday-situation navigation to the same reviewed materials and shared progress. The topic-first hierarchy remains a design recommendation. Detailed groups, search aliases, filtering, and screen layout still require design; no duplicate course or separate progress record is implied. |

Source for C-051: on 2026-10-21, in response to the optional-tags-versus-own-collections question, the owner requested collections as well.

| ID | Confirmed requirement |
|---|---|
| C-051 | Include named personal phrase collections in addition to the proposed list/search/tag organization. The owner wants useful collections rather than limiting organization to tags. Detailed collection controls and prepared thematic packs remain proposals; no implementation is authorized. |

Source for C-052/C-053: on 2026-10-21, the owner explicitly included prepared course collections, accepted the rest of the preceding collection proposal, and required reminders/explanations wherever the learner performs an action independently, suggesting a question-mark control.

| ID | Confirmed requirement |
|---|---|
| C-052 | Include both personal collections and prepared, reviewed thematic course collections. Allow a course collection to serve as the basis for a personal one, and practice the collection or selected ready items. Reuse phrase records and shared progress across collections. Exact pack coverage and size still require content planning. |
| C-053 | Provide discoverable contextual help for learner-operated features: explain what the learner can do and how to do it near the relevant action. A question-mark control is a suggested presentation, not the only allowed form. Apply this across the application, including creating collections, adding phrases, choosing practice, and using review controls. Exact wording and layout remain design work. |

Source for C-054: on 2026-10-21, the owner accepted the preceding listening-flow proposal and clarified that the meaning-comprehension/separate-dictation split suits them.

| ID | Confirmed requirement |
|---|---|
| C-054 | Make meaning comprehension the default listening task, starting with short situation-based recordings and Ukrainian choices, then adding short written responses. Treat dictation as a separate task type. Keep replay and requested language support available, distinguish supported from unaided listening, and allow saving reviewed phrases to collections. Replay alone is not failure, and spelling errors are not automatically listening-recognition errors. Detailed tasks, visual layout, and scheduling remain design work. |

Source for C-055: on 2026-10-21, the owner accepted the proposed seven-daily/four-weekly backup mode and the accompanying export/restore behavior, and asked to continue.

| ID | Confirmed requirement |
|---|---|
| C-055 | Automatically preserve working progress and maintain backups on days with changes, retaining seven daily and four weekly snapshots. Create a recovery snapshot before data-changing updates or restore. Provide portable personal-data export and a validated restore preview with explicit confirmation and rollback. Keep the latest valid backup after inactivity. Detailed storage, snapshot pruning, and implementation mechanisms remain to be specified and tested. |

Source for C-056: on 2026-10-21, the owner accepted keyboard checking, explicit Next navigation, and the remaining exercise interaction defaults, requested explanations of shortcuts, and clarified in a direct follow-up that the Spanish-character panel should be removed because they use the keyboard. The owner withdrew the temporary Mac-only shortcut restriction.

| ID | Confirmed requirement |
|---|---|
| C-056 | Use normal keyboard input without an on-screen Spanish-character panel. Enter checks a short answer; multiline input keeps Enter for a newline and uses a platform-appropriate checking shortcut (Command+Enter on macOS, Ctrl+Enter on Windows). Show a concise shortcut reminder and provide contextual help for first-time users. Keep visible checking controls, retain feedback until explicit Next, and require explicit playback of the next audio task. Preserve phone usability and drafts across help/reference panels. Detailed platform behavior remains to be verified. |

Source for C-057: on 2026-10-21, the owner explicitly accepted the proposed initial review ladder and its assistance/missed-day behavior and asked to continue.

| ID | Confirmed requirement |
|---|---|
| C-057 | Use initial delayed-review intervals of approximately 1, 3, 7, 14, and 30 days, advancing after independent scheduled success and measuring the next interval from the actual check. Keep occasional checks at the initial 30-day cap. A clearly attributed mistake or relevant language help brings the affected skill back sooner, initially the next day, with optional same-session practice. Preserve granular evidence and prior history, treat absence neutrally, and offer a manageable return set. These are accepted initial product defaults to calibrate, not validated retention guarantees; detailed override/queue mechanics remain open. |

Source for C-058/C-059: on 2026-10-21, the owner accepted the proposed first-release readiness criteria and asked to proceed. In response to the browser/device clarification, the owner specified Chrome on macOS and an iPhone running iOS.

| ID | Confirmed requirement |
|---|---|
| C-058 | Require the complete agreed reviewed A1-A2 course, validated core learning journeys and review evidence, offline operation, persistent/recoverable personal data, and understandable Ukrainian computer/phone interaction before owner handoff. Use the readiness gates below to collect evidence. Internal incremental checks remain allowed; accepting the gates is not a readiness claim or implementation authorization. |
| C-059 | Use Chrome on macOS as the owner's primary desktop target and an iPhone running iOS as the phone target for usability verification. The owner did not specify an iPhone browser. Safari is the proposed initial iPhone test browser; exact versions, hardware, and any additional supported browsers remain to be pinned before release. |

Source for C-060: on 2026-10-21, the owner explicitly accepted the preceding concrete Repeat more/Known/Pause behavior and asked to continue.

| ID | Confirmed requirement |
|---|---|
| C-060 | Repeat more requests a check by the next day and caps subsequent successful intervals at seven days while active. Known records a learner preference, proposes a seven-day independent check when stable later evidence is absent, and permits longer intervals after independent success; clear errors or relevant help bring the affected target back sooner. Pause excludes the target from automatic review until explicitly resumed while preserving manual access. Preserve evidence and explain/reverse these controls. Detailed queue fairness and combinations still need specification. |

Source for C-061: on 2026-10-21, the owner explicitly accepted the practice-variety proposal, including the initial 8-12-task preparation target, and asked to continue.

| ID | Confirmed requirement |
|---|---|
| C-061 | Start preparation with approximately 8-12 reviewed tasks per small teachable grammar objective, using familiar varied contexts and relevant task types, and reserve distinct prompts for later checks. Treat this as an initial calibration target rather than a fixed whole-tense size or validated learning optimum. Use only reviewed compatible template combinations. Recycle prepared material when variants run out without blocking practice, and expand it through the reviewed-content workflow. Fixed personal expressions retain appropriate exact/variation practice. |

Source for C-062: on 2026-10-21, the owner explicitly confirmed that the proposed API-plus-skill capabilities belong in the first complete application.

| ID | Confirmed requirement |
|---|---|
| C-062 | Include the bounded external-assistant API and repository-contained skill in the first owner handoff: selected context/evidence reads, observed assistance recording, focused sets from reviewed items, private material drafts, and verified/reversible supported changes. Preserve the content-review and draft boundaries, current attempts, private data, and standalone ordinary practice. MCP remains optional later. Require an end-to-end request-to-persisted-UI-result check before release. Exact contract, authentication, supported host, and implementation remain to be specified; this is release-scope acceptance, not authorization to implement now. |

Source for C-063: on 2026-10-22, after the three-lesson A1-01 proposal, the owner accepted it and asked to continue, while reiterating the requested decision-button workflow.

| ID | Confirmed requirement |
|---|---|
| C-063 | Adopt A1-01 as three short written-foundation lessons (letters/entry, initial stress and accents, punctuation/short phrases) plus an optional checkpoint and later review. Retain the familiar-material shortcuts under C-029. This approves the block grouping and direction, not a complete authored lesson/word list, audio bank, linguistic validation, or application implementation. Detailed IDs and open content requirements are in CURRICULUM-A1-A2.md. |

Source for C-064: on 2026-10-22, the owner selected Далі in the native decision for the five-lesson A1-02 proposal, explicitly accepting it and continuing to A1-03.

| ID | Confirmed requirement |
|---|---|
| C-064 | Adopt A1-02 as five short lessons covering noun gender, articles, plural noun phrases, adjective agreement, and possession, plus an optional mixed check and later review. Use familiar words and short phrases, with complete sentence building developed next in A1-03. This accepts grouping/direction only; exact content, inventory coverage, accepted answers, and audio still require preparation and review. |

Source for C-065: on 2026-10-22, the owner selected Далі in the native A1-03 decision, accepting the six-lesson short-sentence proposal and continuing to A1-04. In a separate native answer, the owner explicitly authorized merging documentation PR #84 after that acceptance and deleting its feature branch. That permission concerns PR #84 only.

| ID | Confirmed requirement |
|---|---|
| C-065 | Adopt A1-03 as six short lessons covering sentence foundations, ser, estar, hay versus estar in context, tener, and questions/negation, plus familiar-word practice, short listening, an optional mixed check, and later review. Keep verb-form production and contextual selection evidence separate. This accepts the grouping/direction, not authored content, complete inventory coverage, linguistic validation, or application implementation. |

Source for C-066: on 2026-10-22, the owner replied Далі after the displayed six-lesson A1-04 proposal and its native acceptance question. This accepts that curriculum block and continues to A1-05; it does not extend the separate merge permission for PR #84.

| ID | Confirmed requirement |
|---|---|
| C-066 | Adopt A1-04 as six short lessons covering regular -ar forms, regular -er/-ir forms, a limited useful irregular set, daily-routine pronominal patterns, frequency, and a brief written routine. Include short listening, an optional mixed check, and later review of specific forms/constructions. Preserve distinct regular-family, exception, pronoun, contextual, and listening evidence. The exact corpus, language/audio review, complete inventory mapping, and implementation remain pending. |

Source for C-067: on 2026-10-22, the owner selected Далі in the native decision accepting the six-lesson A1-05 concrete-information proposal and continuing to A1-06. This is curriculum acceptance only.

| ID | Confirmed requirement |
|---|---|
| C-067 | Adopt A1-05 as six short lessons covering numbers/quantities, prices, clock time/opening hours, days/dates, locations, and questions for missing information. Include short practical texts and listening, an optional mixed check, and later review. Keep understanding information distinct from writing Spanish forms. Exact content, accepted variants, full inventory mapping, linguistic/audio review, and implementation remain pending. |

Source for C-068: on 2026-10-23, the owner selected Далі in the native A1-06 decision, accepting the six-lesson grouping and optional cumulative A1 check, and continuing to A2-01. All six A1 block groupings are now accepted; lesson authoring and full coverage reconciliation remain pending.

| ID | Confirmed requirement |
|---|---|
| C-068 | Adopt A1-06 as six short lessons covering gustar, preferences with preferir, needs with necesitar, wishes/simple plans, y/pero/porque links, and a short personal message. Include listening, specific construction review, and an optional cumulative A1 check in small parts. This accepts the planning grouping/direction only; no complete reviewed corpus, proficiency certification, merge permission, or application implementation is implied. |

Source for C-069: on 2026-10-23, the owner replied Далі after the displayed seven-lesson A2-01 proposal and its acceptance question, accepting that grouping and continuing to A2-02.

| ID | Confirmed requirement |
|---|---|
| C-069 | Adopt A2-01 as seven short lessons covering frequent present stem changes, other selected irregular/spelling forms, gerund formation, estar plus gerund, plans with ir a plus infinitive, poder/tener que frames, and contextual integration. Include listening, an optional mixed check, and focused later review. Keep form production and contextual meaning distinct, with reviewed natural alternatives. Exact content, full mapping, linguistic/audio review, merge permission, and implementation remain pending. |

Source for C-070: on 2026-10-23, the owner selected Далі in the native A2-02 decision, accepting the eight-lesson grouping with listening, an optional mixed check, and focused review, then continuing to A2-03.

| ID | Confirmed requirement |
|---|---|
| C-070 | Adopt A2-02 as eight short lessons covering demonstrative/possessive reference, direct and indirect object pronouns, pronoun placement, selected two-pronoun combinations, comparison, fuller description with que, and an integrated choice text. Include listening, optional checking, and specific later review. Preserve distinct referent/role/form/placement/comparison evidence. Exact content, variants, full coverage, linguistic/audio review, merge permission, and implementation remain pending. |

Source for C-071: on 2026-10-23, the owner selected Далі in the native A2-03 decision, accepting the seven-lesson perfecto compuesto grouping, listening, optional mixed checking, and individual difficult-exception review, then continuing to A2-04.

| ID | Confirmed requirement |
|---|---|
| C-071 | Adopt A2-03 as seven short lessons covering present haber, regular participles, selected irregular participles, relevant accents, sentence structure/participle invariance, contextual use, and a short account or message. Include listening, optional mixed checking, and specific later review of difficult forms. Keep auxiliary, participle, orthography, structure, and contextual meaning evidence distinct. Exact content, full coverage, variants, linguistic/audio review, merge permission, and implementation remain pending. |

Source for C-072: on 2026-10-24, the owner selected Далі in the native A2-04 decision, accepting the eight-lesson indefinido grouping with listening, an optional mixed check, and focused review, then continuing to A2-05.

| ID | Confirmed requirement |
|---|---|
| C-072 | Adopt A2-04 as eight short lessons covering regular -ar/-er/-ir forms, spelling/accents, selected vowel/y patterns, common irregular forms, ser/ir interpretation, contextual use with an initial perfecto contrast, and a short event sequence. Include listening, optional mixed checking, and specific later review. Preserve separate form, spelling, lexical/contextual meaning, comprehension, and production evidence. Exact content, full mapping, variants, linguistic/audio review, merge permission, and implementation remain pending. |

Source for C-073: on 2026-10-24, the owner replied Далі after the displayed A2-05 proposal, accepting the seven-lesson imperfecto grouping with listening, an optional mixed check, and focused review, then continuing to A2-06.

| ID | Confirmed requirement |
|---|---|
| C-073 | Adopt A2-05 as seven short lessons covering regular -ar and -er/-ir forms, relevant accents, ser/ir/ver exceptions, past habits, past descriptions, introduced background meaning with an initial indefinido contrast, and a short memory/routine. Include listening, optional mixed checking, and specific later review. Preserve separate form/person, exception, orthography, contextual meaning, comprehension, and production evidence. Exact content, full mapping, variants, linguistic/audio review, merge permission, and implementation remain pending. |

Source for C-074: on 2026-10-24, the owner replied Далі after the displayed A2-06 proposal, accepting the six-lesson mixed present/past grouping, then continuing to A2-07.

| ID | Confirmed requirement |
|---|---|
| C-074 | Adopt A2-06 as six short lessons covering present/past framing, perfecto/indefinido and indefinido/imperfecto contrasts, focused form recall, mixed familiar situations without tense labels, and a short text/audio with a written response. Include optional mixed checking, manual tense-pair or difficult-form selection, and specific later review. Keep contextual construction choice distinct from form/exception recall and comprehension/production evidence; preserve earlier skill histories. Exact content, full mapping, variants, linguistic/audio review, merge permission, and implementation remain pending. |

Source for C-075: on 2026-10-24, the owner selected Далі in the native A2-07 decision, accepting the eight-lesson requests/instructions/messages grouping and continuing to A2-08.

| ID | Confirmed requirement |
|---|---|
| C-075 | Adopt A2-07 as eight short lessons covering requests for objects/help, permission and responses, regular affirmative tú/vosotros imperatives, frequent exceptions, usted/ustedes forms, pronoun attachment/accents, short instruction comprehension, and a practical message with a reason. Include listening, optional mixed checking, and specific later review. Keep comprehension, communicative fit, and specific form/placement/orthography evidence distinct. Exact content, full mapping, variants, linguistic/audio review, merge permission, and implementation remain pending. |

Source for C-076: on 2026-10-25, the owner selected Далі in the native A2-08 decision, accepting the six-lesson cumulative-practice grouping and proceeding to the full A1-A2 coverage/sequence check.

| ID | Confirmed requirement |
|---|---|
| C-076 | Adopt A2-08 as six short lessons covering practical information, message/reply, a past account, comparing options with a reason, short listening, and a useful text with reviewed personal constructions and supported revision. Include optional cumulative checking in short resumable parts and focused later review. Preserve separate comprehension, supported writing, and independent recall evidence. All fourteen A1-A2 block groupings are now accepted; complete source/coverage reconciliation, exact content, linguistic/audio review, visual/technical planning, merge permission, and implementation remain pending. |

Source for C-077: on 2026-10-26, the owner selected Далі in the native coverage decision, accepting CV-01 through CV-06 and the situation/genre allocation, then proceeding to the B1/B2 continuation map.

| ID | Confirmed requirement |
|---|---|
| C-077 | Adopt the six supporting A1-A2 allocations: early everyday fixed phrases/listening; quantity and short-response/negative words; first-use prepositions and meaningful accents; age/weather/time-link prerequisites; useful infinitive/impersonal-obligation constructions; and explicit situation/genre teaching homes. Teach, practice, and later revisit each adopted target. Preserve the fourteen-block baseline and accepted IDs/counts; separately agree any needed split of an overloaded lesson. Exact supporting microsteps, source-item/variant reconciliation, content authoring, linguistic/audio review, merge permission, and implementation remain pending. |

Source for C-078: on 2026-10-26, the owner selected Далі in the native B1/B2 decision, accepting the six-area-per-level continuation map and proceeding to home-screen visual design.

| ID | Confirmed requirement |
|---|---|
| C-078 | Adopt the proposed B1/B2 continuation direction: connected everyday accounts/plans/requests/explanations/messages/input at B1; more complex time relationships, hypotheses/nuance, argument, reformulation, register and richer input at B2. Retain personal constructions, prior skill histories and specific review across stages. Deliver the complete agreed A1-A2 stage first, then B1, then B2. The six roadmap areas per level are not fixed lesson counts; later detail/source/variant reconciliation and linguistic/audio review remain pending. Next explore the home-screen design. Content authoring, implementation, spending and merge permission are not inferred. |

## Language and localization direction

Accepted scope: C-030/C-031. Proposed design details, with no library or storage format selected:

- Separate the instructional locale (initially Ukrainian) from the learning target (Spanish of Spain). Localizing the interface does not translate away Spanish exercises or alter the learner's progress.
- Keep translatable interface messages and instructional content outside application logic, linked by stable keys/content IDs. Include explanations, hints, feedback, and source-language exercise prompts; a translated button catalog alone does not localize a course.
- Plan complete messages with named placeholders and locale-aware plural/date/number handling. Future UI designs should tolerate text expansion and other writing directions. Specific locale support requires its own checks.
- Agent API candidates: list missing/outdated translations, read source text and context, submit a versioned draft language pack, validate required entries/placeholders, preview, and activate reviewed translations with rollback. Reuse the bounded structured-content API; no arbitrary executable translation files. Exact endpoints and publication authority remain deferred.
- Track translation completeness and review state separately for interface and course content. A future incomplete pack should not silently appear as a fully supported course language; fallback/activation policy remains to be agreed.
- Translating a learning prompt can change its ambiguity and accepted Spanish answers. Review these together before use. An agent can draft translations, but generation or schema validation alone does not establish linguistic correctness. New locales must retain stable skill/progress identity.

Terminology and general design basis: [W3C, Localization vs. Internationalization](https://www.w3.org/International/questions/qa-i18n), read 2026-10-08, distinguishes preparing a product for localization from producing additional localizations and discusses separating localizable elements. The API and course-specific workflow above are design proposals, not W3C requirements or implemented behavior.

## Accepted session format and design details

The owner accepted the recommended-plus-manual direction on 2026-10-08 under C-032. The comparison below records the alternatives considered; exact durations and composition remain design details. Direct topic practice and optional new material remain required (C-007).

| Organization | Benefit | Trade-off |
|---|---|---|
| Course-led default: resume the next small lesson, with separate practice/review access | Clear sequence; fewer planning choices | May not fit a visit motivated by one forgotten construction; flexible stopping is still needed |
| Learner-selected default: choose a topic, phrases, or review set each time | Direct control over today's need | More decisions; easy to overlook material that needs returning to |
| Recommended session with manual overrides | Quick start while retaining topic and practice-only control | Recommendations must explain their selection and avoid unpredictable mixing |

Accepted direction: combine a suggested session with explicit course study, selected-topic/personal-phrase practice, and mixed review entry points. Personal phrases can be chosen separately or included where relevant, rather than requiring a separate mandatory daily routine.

Accepted flow direction; exact presets and composition remain adjustable:

1. Offer a suggested activity and resume access, plus direct topic selection. Show what the session covers and whether it includes anything new.
2. Optionally choose a rough time budget, for example 5, 15, or 30 minutes, or no limit. These are illustrative product choices, not evidence-backed optimal durations or mandatory countdowns. Preserve the previous preference instead of requiring setup every visit.
3. For a mixed session with new material enabled, combine a short return to earlier material, one small new concept, and practice of that concept. For review-only or focused practice, honor that choice and do not insert new theory or unrelated topics silently.
4. Permit a rule refresher when needed. Offer varied written tasks using familiar material, with explicit optional mixed contrasts. Detailed exercise balance belongs to the feedback and review discussion.
5. Allow stopping at any point, save completed attempts and the current draft, and offer a concise summary plus optional continuation. Ending early is not a failed session. Cross-device continuity remains a separate unresolved requirement.

An illustrative 15-minute mixed session might allocate roughly 3 minutes to earlier material, 4 to a small new concept, and 8 to written practice; reading speed and hints can change this. Never cut off an answer or require the estimate to be met. Detailed intervals, mastery rules, grading, and missed-day scheduling remain separate next topics.

The session direction is settled; continue with review and mastery controls below.

## Accepted review and mastery direction

The owner accepted the general review direction and manual controls on 2026-10-13 under C-033, building on C-002/C-003/C-009/C-014/C-020. Exact scheduling, thresholds, UI labels, and diagnostic mechanisms remain design details.

Compare three approaches: manual-only selection gives control but requires the learner to remember what needs revisiting; a fixed timetable is predictable but handles different difficulties poorly; adaptive recommendations plus manual controls balance assistance and choice but must explain why an item returns. The third is the accepted direction for this course. No scheduling library or implemented algorithm is selected; C-057 subsequently accepts initial interval defaults.

Accepted behavior direction, with detailed mechanics still to be designed:

- Schedule small skills, individual exceptions, and ready personal phrases, not an entire tense as a single pass/fail unit. Keep recognition, independent form production, and choosing a construction in context distinguishable. For example, recalling hacer -> hecho does not prove correct auxiliary selection or tense choice.
- Offer a recall attempt before a refresher, while keeping the rule and hints accessible. Revisit with varied prompts using familiar vocabulary. Include relevant items in later mixed review only within the learner's selected scope.
- Independent success supports gradually less frequent review. Success after a targeted hint or a revealed answer leads to an earlier independent check of the affected skill; immediately copying an answer is not durable recall evidence. Brief same-session practice can support learning, but later independent evidence remains distinct.
- Attribute evidence only when the target and error are reasonably clear. A vocabulary hint must not mark conjugation weak; a general explanation does not automatically fail an attempt. Ambiguous grading should request a focused follow-up or remain uncertain. No inference from slow typing alone; phone entry and interruptions can affect elapsed time.
- Preserve previous valid evidence after an error, rather than resetting the whole topic. Show neutral descriptions such as practiced, needs support, independently recalled, and stable in later checks; labels and thresholds are still proposals, not proficiency certification.
- Provide a learner-controlled practice preference separate from observed evidence: repeat more; usual recommendations; I know this / occasional checks; and an explicit pause of automatic review. Pausing keeps manual access and history. Marking a skill known should reduce routine repetition and offer a brief optional check, without fabricating passed attempts or silently overriding a pause.
- Explain recommendations from actual evidence (for example, a targeted hint on a previous attempt) instead of diagnosing the learner broadly. The preference applies to a visible skill/phrase or explicitly selected group.
- Keep suggested review within the chosen session budget after missed days; prioritize a manageable selection rather than require clearing a growing backlog. Allow extra practice on demand. Missed days alone do not erase learning evidence or prove forgetting.

Illustrative loop: the learner requests help with hecho, sees a short explanation, later produces it in a different familiar sentence without help, and encounters it again in a later session. Repeated independent successes can reduce frequency; a later relevant difficulty can bring it forward. Exact dates and evidence thresholds need a separate design and validation pass.

Evidence basis: the abstract of [Karpicke and Roediger (2008), The critical importance of retrieval for learning](https://pubmed.ncbi.nlm.nih.gov/18276894/), read 2026-10-08, reports improved delayed recall from continued retrieval in a foreign-vocabulary experiment after initial successful recall. This motivates including later retrieval opportunities; it does not validate this application's grammar scheduler, UI labels, or any exact interval.

Marking something known retains occasional checks; automatic review can be paused separately (C-033). Continue with written-answer checking below.

### Initial review intervals and return after a break — accepted defaults

C-033 accepts adaptive review and manual controls. C-057 accepts these initial defaults for later calibration rather than as a claim of optimal retention:

- After introducing a skill, offer a later independent check after approximately one day. After independent success at a scheduled check, increase the next interval through 3, 7, 14, and 30 days, measured from the actual completed check. At the initial 30-day cap, keep occasional checks; do not declare permanent mastery.
- A clearly attributed mistake, targeted hint, or answer reveal brings the affected skill back sooner, initially the next day. Same-session practice in a different familiar context remains available, but does not itself advance the delayed-review stage. Keep the earlier evidence and leave unrelated skills unchanged. An unresolved answer is not a failed attempt; replay alone is not a listening failure.
- Keep written form production, contextual choice, and listening evidence separate where assessed. Identical text or a memorized single recording should not be the only basis for later success. Exact task selection and the existing known/repeat-more controls need implementation-level rules before coding.
- After missed days, do not create a failure event for absence or demand completion of every overdue item. Offer a manageable set within the chosen scope/time preference, prioritizing explicit repeat-more targets and recent need for support while still sampling older due material. A late successful check schedules from the actual attempt date rather than stacking missed calendar reminders. Pause continues to exclude an item from automatic review.
- Show the reason for a recommendation and permit manual extra practice. A future implementation specification must pin how learner overrides interact with dates and queue fairness; these examples do not settle those mechanics. No notification or fixed daily quota is introduced.

C-057 settles the initial interval ladder and next-day follow-up after assistance. Queue fairness and exact override interactions still need a complete specification before coding. No scheduler, interval experiment, or learning-outcome validation has been performed.

### Manual review overrides — accepted behavior and remaining mechanics

C-033 accepts Repeat more, Known with occasional checks, and Pause. C-057 fixes the initial interval ladder; C-060 accepts these override rules:

- Repeat more: request the next automatic check by the following day without delaying an earlier due item; while active, cap later successful-review intervals at seven days. Keep voluntary immediate practice available. Turning it off resumes the ordinary ladder based on preserved evidence.
- Known: record a learner preference separately from tested mastery. For material without stable delayed evidence, offer an independent check in seven days, then longer checks on success; do not shorten an already appropriate longer interval for stable material. Subsequent clear mistakes or relevant help bring the target back sooner under C-057. Final interaction with the ordinary ladder must be specified without fabricating successful attempts.
- Pause: exclude the target from automatic recommendations until explicitly resumed. It remains discoverable and can be practiced manually. A manual attempt alone does not remove the pause; the learner chooses to resume. Pause takes precedence over the repeat-more preference for the automatic queue.
- Explain the actual scheduling effect beside each action using C-053 help. Keep previous evidence and make the controls reversible. Manual due-date changes must not be mistaken for successful recall events.

C-060 accepts this behavior. Complete queue fairness and exact control-combination rules in the scheduler specification alongside coverage and visual-design work. Scheduling remains unimplemented and unverified.

### Accepted progress presentation

C-033 settles granular review evidence and learner controls. C-045 accepts the following presentation direction; detailed labels, thresholds, and UI layouts remain to be designed:

- Separate course coverage (lessons/topics visited or completed) from evidence of recall and use. Completing all lessons must not display a claim of mastering the language.
- Offer a concise overview: current study location, a manageable practice recommendation, and specific recent difficulties with an evidence-based reason. Put detailed history behind a topic/skill view instead of requiring a statistics dashboard before practice.
- In a topic view, distinguish form production, construction choice, and listening recognition where assessed; show neutral states and recent assistance. Use the existing manual repeat/known/pause controls. Do not infer a topic-wide weakness from one targeted error.
- After a session, summarize what was practiced, where help was used, and a useful next step. Prefer actionable examples to an unexplained mastery percentage. Exact labels, thresholds, charts, and UI layouts remain open for the planned design stage.

The return-to-practice flow is accepted under C-046 and the new-lesson flow under C-047. Next compare visual directions before final acceptance planning.

### Accepted walkthrough: returning to a studied tense

The owner accepted this product flow under C-046. It is not implemented behavior, authored lesson content, or evidence about the owner's actual performance; exact counts and scheduling remain to be designed.

1. Open the local course. Home offers resume, recommended practice with a specific reason, and manual topic selection. Choose a previously studied tense and practice only; no new lesson is required.
2. Optionally narrow the focus to regular forms, specific exceptions, tense choice, or listening, using only reviewed tasks with appropriate prerequisites. Start with a recall attempt when desired, or open the concise rule first; reading the rule is never blocked.
3. Work through a small varied set: a bounded form task, a sentence task, and a contextual choice as appropriate. Listening is optional for this session. Unstudied material must not silently become part of the selected review.
4. If an irregular form is not recalled, request a targeted hint, a rule explanation, or the answer. Show local feedback and retain the help category for the relevant skill. Looking at an answer and then reproducing it is practice, not independent recall.
5. Offer another familiar context later in the set, then schedule an independent follow-up in a future session. Do not loop one mistake indefinitely. The learner can use the existing repeat-more, known/occasional-check, and pause controls or stop at any point. Exact set size and repeat counts remain to be designed.
6. Save a useful reviewed phrase into the personal collection if desired. New wording or a new intended meaning follows the existing draft/review path. An uncertain free-text result remains unresolved and does not block unrelated local practice.
7. Stop or continue voluntarily. Save completed attempts and the current draft; show a short summary distinguishing independent success, assistance, and an appropriate next practice target. Returning later resumes the saved location without resetting the topic.

### Accepted walkthrough: learning a new topic

The owner accepted this sequence under C-047. It uses the accepted session, help, evidence, and persistence directions; no lesson or application UI is implemented. The complete first handoff under C-044 remains required.

1. Select a new lesson from the course or continue the course path. State one small practical objective and relevant prerequisites in Ukrainian. Offer links to a brief prerequisite refresh when useful; do not turn discovery planning into a new mandatory placement test or lock all topics behind unagreed thresholds.
2. Present a short Ukrainian explanation with a few reviewed Spanish examples and their meanings. Split larger topics into small steps: introduce a basic pattern before adding exceptions or contrasts. Keep a fuller rule reference available without requiring a long lecture. Familiar material may use the already accepted optional self-check/direct-practice path.
3. Offer a guided task where the pattern or worked example is visible. Give local explanatory feedback. Treat this as supported learning, not independent recall; do not penalize asking for help while a skill is being introduced.
4. Move to varied tasks with the worked example hidden: complete a form, build or translate a short sentence, and apply the target in sufficient context. Keep hints/rules accessible and record their actual use. Use familiar supporting vocabulary and grammar. Include a short reviewed audio task where appropriate, with a written-only session path available.
5. If difficulty persists, offer a smaller step, another explanation, targeted practice, or stopping/resuming. Avoid an unlimited forced retry loop. If an answer cannot be confidently assessed, retain C-034's unresolved status; do not invent a pass or failure.
6. End with a short independent opportunity on the introduced target and a concise summary, while allowing help or stopping. Separate content covered from independent/assisted results. No mandatory perfect score, automatic mastery claim, or new unlock threshold is implied. Offer save-to-personal-phrases for reviewed useful expressions.
7. Make the new skills eligible for later review using C-033's evidence and learner preferences. A later task in a different familiar context supplies delayed evidence; finishing the lesson alone does not. Save attempts and the current draft so an interrupted lesson can resume.

Next compare the proposed visual directions and refine concrete acceptance checks. Lesson counts, lengths, exact exit criteria, and curriculum coverage still require detailed design.

## Accepted written-answer-checking direction

The owner accepted the direction on 2026-10-13 under C-034. Exact checking rules, hint levels, and implementation remain to be designed; no grader exists. Preserve written translation and sentence production under C-008; do not narrow the course to choice exercises just to simplify grading.

| Approach | Benefit | Limitation |
|---|---|---|
| A single reference answer | Easy to author a basic comparison | Cannot by itself distinguish an incorrect answer from an unlisted valid wording; unsuitable as the sole correctness test |
| Embedded AI for open responses | Candidate for flexible language review | Requires separate quality evaluation, uncertainty handling, cost/privacy choices, and provider integration; not approved |
| Reviewed rules and answer variants, with an explicit unresolved path | Bounded exercises can work without embedded AI; unknown wording is not automatically penalized | Accepted variants require authoring/review; open writing sometimes needs a separate review step |

The third is the accepted initial direction, with on-demand external assistance through the already planned API/skill connection. Embedded AI remains an option for a later explicit decision. This accepted direction follows the requested deterministic-core/external-assistant workflow; it is not a completed feasibility or accuracy test.

Accepted feedback direction; detailed mechanisms remain open:

- Every exercise declares its target: form production, choosing a tense, meaning, a particular construction, or orthography. When a specific construction is required, state it before the attempt. A valid paraphrase that avoids the target is not automatically bad Spanish; explain that the target remains unassessed and offer a targeted retry.
- For bounded exercises, use reviewed answers/alternatives and narrowly scoped rules. Preserve open translation and free writing, but do not claim exhaustive automatic coverage. Similarity to a reference string alone is not proof of semantic correctness or error.
- Distinguish fully accepted, target demonstrated with a separate correction needed, confirmed target error, and not confidently assessed. These accepted feedback categories remain separate from independent/assisted/answer-seen evidence. A valid alternative does not need to match a preferred phrase verbatim.
- Ignore harmless formatting differences where the exercise permits them. Keep accents, letter distinctions, and meaningful punctuation visible; never globally remove diacritics or infer that every one-character difference is a typing slip. Orthographic corrections should not automatically invalidate an independently established grammar skill. If the intended form is ambiguous, ask for a retry or leave that skill unresolved.
- Give specific Ukrainian feedback: highlight the relevant span, briefly explain the rule, and offer a retry. Reveal the full answer on request; preserve the initial attempt and distinguish correction after help from independent first-attempt success. Exact hint levels and retry limits remain open.
- If an answer is unlisted and cannot be judged reliably, say so, show a reference only on request, preserve the original answer, and allow skipping or requesting external review. An unresolved target yields neither a pass nor a failure; independently verified subskills may still retain their evidence. Self-reported correctness is labeled separately and must not silently become verified mastery.
- The future assistant may review the prompt, target, original answer, and allowed context, then propose an explained verdict or a new accepted variant via the API. Store the review provenance separately from the original attempt. A content correction should permit correction of affected grading evidence without inventing independent attempts. Public publication and language validation remain separate operations.

Orthography basis: [FundéuRAE, tilde diacrítica, uso](https://www.fundeu.es/recomendacion/tilde-diacritica/), checked 2026-10-13, distinguishes pairs including tú/tu and él/el by meaning or grammatical function. This supports preserving distinctions in evaluation; the accepted product feedback policy above is not a grading scheme prescribed by that source.

The owner accepted supported automatic checking plus an unresolved/external-review path (C-034). Continue with listening scope and content quality; exact retry counts and hint mechanics can be refined when detailing exercises.

## Accepted listening direction and proposed first exercises

Accepted scope: C-035/C-036. The prior suggestion to defer all audio is superseded as a recommendation. Listening is required in the planned course; the owner accepted a small listening component in the first usable A1-A2 stage under C-037. No audio corpus, recordings, or playback implementation exists.

The owner supplied everyday greetings/farewells and shop exchanges as starting contexts, including hola, buenas tardes, hasta luego, and ¿Algo más? These are examples of desired usefulness, not a researched frequency ranking or a fixed starter list. Build toward more substantial everyday expressions, short sentences, then brief connected messages/texts. Specific level placement and coverage need mapping; longer material should not introduce unexplained vocabulary simply to increase difficulty.

Proposed exercise loop:

1. Offer a familiar situation and play a short recording without the Spanish transcript visible. Ask for its meaning or a concrete detail using Ukrainian choices or a short written response. Choice and free recall are different evidence types; dictation is not required for every listening task.
2. Allow replay and an explicit did-not-catch action. Record the help actually used. Replay by itself is not proof of failure; exact effects on scheduling remain open. Slower playback or a short segment may be offered as assistance, with natural-speed playback still available.
3. On request, show the transcript and Ukrainian meaning. Distinguish learner-reported knew the written phrase but did not recognize it from phrase/meaning was unfamiliar; where evidence is insufficient, keep the cause uncertain. Longer clips may let the learner select a troublesome span after revealing the transcript, rather than claim automatic precise diagnosis.
4. Revisit the same phrase/skill later with text hidden. After initial familiarization, use reviewed recordings in another sentence/context or another speaker's voice to avoid relying only on recall of one clip. Keep difficult segments available for focused practice.
5. Track listening attempts against both the phrase/skill and the recording version: answer, replay/help, transcript reveal, and later independent performance. Transcript-assisted success is useful practice but does not establish unaided listening. A typing error or an unknown word must not automatically be classified as an auditory-recognition failure.

Proposed progression: short useful phrases -> familiar phrases within short sentences/exchanges -> brief connected announcements/messages with gist and detail questions. Recorded exchanges are listening material only; there is no requirement for the learner to speak or record a response. Introduce voice/speed/context variation gradually, without making noisy audio or regional difficulty an initial requirement.

C-040 permits synthetic Spain Spanish and supersedes the earlier human-recording-only boundary. Record whether a clip is synthetic or human, its source/model/voice and revision, intended-use permissions, accurate transcript, and actual-audio review before release. Human clips additionally require supported speaker/region provenance. No selected voice, source, or license is claimed. Written-only sessions remain available; proposed audio controls must work on phones and should not require autoplay.

First-stage inclusion is settled under C-037, content review under C-039, audio preparation under C-040, and local browser delivery under C-041. Next discuss progress persistence and recovery.

## Accepted content preparation model

The owner accepted the prepared core plus reviewed additions on 2026-10-14 under C-038. C-039 adds cross-provider agent review without a required human reviewer. Content sourcing, budgets, production, and actual review runs remain pending.

Three approaches to compare: a fixed prepared course is predictable but requires manual additions for new needs; generating each exercise during use offers flexibility but makes each new item another validation task and would introduce an unapproved runtime AI dependency; a prepared reviewed core plus reviewed extensions combines a stable course with personal additions. The third is accepted under C-038, consistent with the structured-content API and unresolved-answer path.

Accepted workflow direction, with the proposed review procedure below:

- Prepare original lessons against the agreed curriculum, using references to check coverage and language rather than importing whole third-party courses. Each small lesson includes a target/prerequisites, concise Ukrainian explanation, Spanish examples, varied written/listening tasks as applicable, accepted answers, hints, known confusions, and review links. Not every lesson must contain every exercise type.
- Keep a reviewed bank of varied examples and, where useful, validated templates with allowed combinations. Do not assume arbitrary word substitution preserves naturalness or correct answers. Repetition may reuse skills without requiring an unlimited supply of newly generated items.
- Agents may draft new explanations, examples, personal constructions, and practice sets through the planned API. Use the existing draft/needs-review/ready distinction. Generated content and a valid schema are not sufficient evidence that an item is suitable to teach.
- A ready item needs a language/content check: Spain usage and naturalness, intended meaning, target level/prerequisites, adequate context, accepted alternatives, hint correctness, and consistency between task and answer. Technical checks and linguistic checks are separate. C-039 assigns review to the opposite provider; the proposed evidence and release gates below still require calibration. No human sign-off is claimed.
- Audio follows C-040: pre-generated synthetic Spain Spanish initially, with suitably licensed existing human recordings as later additions. Check actual audio against the transcript and target, record origin and use permissions, and distinguish synthetic from human clips. Commissioned recordings are outside the budget. The approximate initial generation budget is accepted for planning; no supplier, voice, purchase, or batch is selected.
- For personal phrases, save quickly as a private draft, clarify intended meaning, check the Spanish wording and permitted variations, then make the item eligible for practice. Approved lesson phrases can retain their source review; new paraphrases need review. Learner acknowledgement of intended meaning is distinct from linguistic validation.
- Version published course items and reviewed personal additions. Provide a report-problem action; quarantine a suspect answer model from further practice while it is checked. Preserve original attempts and correct affected grading evidence when a content fault is confirmed. Public course publication remains separate from private learner additions.

### Practice-bank variety — accepted preparation and selection direction

C-038 accepts reviewed example banks and validated templates, and C-023 accepts personal-phrase variations. C-061 accepts the following refinements; it does not authorize content generation or application implementation.

- Accepted initial authoring target: start with approximately 8-12 reviewed tasks for a small teachable grammar objective, using several familiar contexts and more than one relevant response format. This is a pilot-calibration target, not a scientifically justified minimum, a fixed size for an entire tense, or a requirement for every single saved word/phrase. A coverage matrix must verify the actual forms and exceptions rather than equate item count with coverage.
- Keep at least some distinct prompts for later checks instead of using only the just-shown worked example. Favor an eligible context/task not seen recently. Changing option order or punctuation alone does not create a new context or independent evidence. Preserve the learner's chosen topic, vocabulary prerequisites, and measured skill.
- Use authored contexts for tense-choice and meaning tasks. Templates may change only reviewed compatible parameters, with their permitted answers, hints, and prerequisites. A natural-language template review does not approve every possible arbitrary substitution. Written variants do not silently create new listening clips; audio needs its own prepared reviewed assets.
- When eligible variants run out, allow continued practice by recycling the prepared set, favoring spaced/reordered contexts and relevant task-type variation. Do not block practice, imply an unlimited unseen bank, or insert unreviewed generated answers. A repeated item remains labeled/tracked as a repeat. If the learner chooses extra immediate practice, it does not manufacture delayed-review success.
- Expand banks later through the accepted draft/needs-review/ready workflow, including the future external-assistant API. New items become practice targets only after review; ordinary installed practice remains available offline. Fixed personal expressions retain exact-phrase practice and receive only linguistically appropriate reviewed variations.

C-061 accepts this starter-bank direction. Calibrate it internally on a grammar objective and representative phrase/listening material before full authoring. No exercise corpus or template engine exists; counts, review effort, and learning outcomes have not been measured.

A proposed first content pilot combines one small grammar lesson, several everyday listening phrases, and a few personal phrases to test the workflow before authoring the complete A1-A2 corpus. Under C-044 this is an internal development/verification milestone, not an early owner handoff. Owner learning/testing waits for the complete agreed A1-A2 stage. Exact quantities remain open.

### Cross-provider content-review plan

Confirmed direction: C-039. The model choices, efforts, pilot size, and procedure below are planning recommendations dated 2026-10-15. They apply to preparing course materials and personal additions, not to mandatory AI calls during every learner exercise. No review job or model benchmark has run.

#### Starting model and effort pairs

| Work | Author | Reviewer in a fresh session | Reason for the initial choice |
|---|---|---|---|
| Codex prepares a bounded lesson, explanation, exercise set, or personal construction | GPT-6.1 Sol (`gpt-6.1-sol`), `high` | Claude Opus 5.5 (`claude-opus-5-5`), `medium` | Sol is the balanced authoring candidate; Opus starts at its documented default for a focused linguistic/content check. |
| Claude prepares the same material | Claude Opus 5.5 (`claude-opus-5-5`), `medium` | GPT-6.1 Sol (`gpt-6.1-sol`), `xhigh` | Use a different provider and allocate additional reasoning to finding ambiguous prompts, valid alternatives, and unsupported rules. |
| A routine pass is shallow or a difficult item remains disputed | Keep the original author and version history | For Codex-authored content: Opus 5.5 `xhigh`; for Claude-authored content: GPT-6 Astra (`gpt-6-astra`) `xhigh` | Escalate the relevant items, not the entire bank; retrieve evidence before repeating judgments. |
| A pilot or complex module needs a dedicated adversarial audit beyond ordinary content review | Preserve the authored material unchanged for the audit | For Codex-authored content: Claude Fable 5.1 (`claude-fable-5-1`) `xhigh`; for Claude-authored content: GPT-6 Astra `xhigh` | Optional additional audit aimed at finding counterexamples. It supplements the primary opposite-provider check. |

The recommended initial production candidate is **Sol `high` author -> Opus `medium` reviewer**, with the reverse route fully supported. This is a starting hypothesis inferred from provider guidance, not evidence that either model is the best Spanish teacher. Equal effort labels across models do not imply equal work. Do not use `max` everywhere or choose a larger model solely because another model disagrees. Any author-side model substitution must retain an opposite-provider review of the resulting version.

Before a future run, verify the actual model/version, supported effort, account access, tool/input capabilities, and applicable host policy. Record the resolved values; do not silently fall back to the author's provider. CLI aliases can change. This document does not change global orchestration settings or approve paid runs. On the maintainer workstation, follow the canonical `claude-orchestrator` routing policy for launches, including its per-task approval requirement when the agent selects Fable. Routine content review and a specialist adversarial audit are distinct scopes.

#### Review procedure and evidence

1. The author produces a small versioned batch with target skills, prerequisites, Ukrainian explanation, Spanish tasks, answer alternatives, hints, and references. New personal phrases include intended meaning and context; private learner data never enters this public repository.
2. A fresh opposite-provider reviewer receives the brief and tasks without the author's reasoning or claimed confidence. First solve the tasks without the answer key; then inspect the key, explanations, hints, and sources. Additional reviewers must not see each other's verdicts before submitting their own.
3. Check grammar, naturalness in Spain, Ukrainian meaning, misleading simplifications, level/prerequisites, target-skill alignment, adequate context, valid alternatives, and accidental vocabulary load. Distinguish genuine errors from optional stylistic preferences. A constrained exercise can require a particular form only if the instruction makes that constraint clear.
4. Each finding identifies the item/version, exact disputed passage, proposed correction, and supporting reference or explicit unresolved uncertainty. Verify that cited passages actually exist and support the claim. Use appropriate RAE/FundeuRAE references for language questions and Instituto Cervantes inventories for curriculum mapping; neither a grammar reference nor model agreement certifies learning effectiveness.
5. Resolve disagreements using the evidence and task context, not majority voting or confidence scores. Repair or simplify an ambiguous task, then re-review the revised version with the opposite provider. After two unsuccessful repair/review cycles, leave it `needs-review` and move on; do not turn an unresolved answer into a memorization target.
6. Proposed `ready` gate: version-specific opposite-provider review completed, sources checked, no unresolved correctness/meaning/answer-acceptance findings, and relevant structural and media checks passed. Record author/reviewer model IDs, actual efforts, date, content revision, prompt/checklist version, findings, resolutions, and remaining limitations. Label this as model-reviewed, never human-reviewed or certified.
7. A later content correction invalidates the affected prior review and triggers another check. Quarantine reported defects and preserve/correct learner evidence as described above. Review completion does not itself publish a public course release.

Different providers can still share blind spots. Back-translation or Google Translate may expose a meaning mismatch, but agreement is not a correctness gate. A technically valid schema proves only structural validity.

#### Calibration before bulk authoring

Propose a small pilot of about 30-50 original, reference-backed items: regular/irregular forms, tense contrasts, everyday Spain usage, personal constructions, valid alternative answers, and intentionally ambiguous prompts. Include documented seeded mistakes and correct controls so a reviewer that rejects everything does not score well. Keep the defect labels hidden from reviewers. Expected results must have inspectable supporting passages; disputed cases are excluded from scored accuracy and tracked separately rather than resolved by another model vote.

Compare both directions on the same held-out material. Start with the table above, then compare Opus `medium` with `xhigh` and Sol `high` with `xhigh` on missed cases and correct controls. Track missed substantive errors, false corrections/rejection of valid answers, ambiguity detection, source accuracy, repair cycles, elapsed time, and actual usage/cost where available. Keep prompt-tuning examples separate from the held-out set. Select the least costly configuration that meets agreed quality criteria; exact thresholds and spending limits must be set before the pilot. Repeat targeted calibration when the model/version or review instructions materially change. Coding benchmarks and general provider rankings are not Spanish-course evaluation results.

#### Listening has an additional gate

The text pairs above can review scripts, transcripts, questions, and answer keys; they are not assumed to hear audio. Before any listening item becomes ready, a separately verified audio-capable route must inspect the actual clip and its transcript/alignment, intelligibility, and intended target. Independent transcription can flag mismatches but does not certify native pronunciation or Spain provenance. Under C-040, record synthetic model/voice provenance and check the intended Spain pronunciation; for human clips, confirm speaker/region provenance. Check reuse rights for either route. If actual-audio checking or required provenance is unavailable, keep the listening item pending. Exact service/voice selection and the audio-checking tool remain future execution decisions; generation is not authorized yet.

#### Source basis and limits

Official documentation inspected on 2026-10-15:

- [OpenAI model selection](https://developers.openai.com/api/docs/guides/model-selection): Sol balances complex work and cost; Astra is positioned for demanding analysis. Applying those roles to this course is an inference.
- [GPT-6.1 Sol](https://developers.openai.com/api/docs/models/gpt-6.1-sol): supports `low`, `medium`, `high`, `xhigh`, and `max`; the default is `medium`. The authoring `high` and reviewing `xhigh` settings here are proposed overrides.
- [Anthropic model selection](https://platform.claude.com/docs/en/about-claude/models/choosing-a-model): Opus 5.5 is the capability-first starting point; Fable 5.1 is an escalation candidate. These are general recommendations, not a measured language-review ranking.
- [Anthropic effort](https://platform.claude.com/docs/en/build-with-claude/effort): Opus 5.5 supports all five effort levels and defaults to `medium`; Fable 5.1 also supports `xhigh`. Effort needs task-specific evaluation.

Local maintainer routing was also inspected on that date: current Opus default `medium`, deliberate `xhigh` escalation, and Fable `xhigh` for adversarial review. Its engineering measurements are not evidence of Spanish-content quality. Public contributors need the source links above, not the maintainer's local files. Availability and exact launch settings must be rechecked at execution time.

### Accepted audio preparation direction

C-040 accepts the following sequence: review scripts first; compare approximately two or three candidate Spain Spanish voices on a small sample; estimate the initial batch including failed takes; generate within the agreed one-time limit after execution authorization; inspect and save the audio files for repeated playback. Generation is a preparation activity, not a per-playback model call. Hosting/storage costs and future regeneration are separate, still-unselected concerns. Do not promise the complete A1-B2 audio corpus for $5-10.

ElevenLabs is a candidate for the first comparison, not a selected provider. Official pages inspected during the 2026-10-16 discussion: [TTS capabilities](https://elevenlabs.io/docs/overview/capabilities/text-to-speech) lists Spanish (Spain) and recommends a matching regional voice; [pricing](https://elevenlabs.io/pricing) lists standard Starter at $6/month before taxes with 30,000 credits and a commercial license, with Multilingual v2 charged at one credit per character; [subscription-end guidance](https://elevenlabs.io/docs/help-center/account/general/what-happens-to-my-content-after-my-subscription-ends) says the commercial license for content generated during the paid subscription continues after it ends, while continued hosted file availability is not guaranteed. These are dated source observations, not a purchase quote or a blanket redistribution license. Recheck the selected plan, voice, and applicable terms before generation or publishing audio assets; a public code license does not automatically cover audio.

Illustrative capacity only: 100 phrases x 50 characters x 2 voices x 2 takes = 20,000 credits at one credit per character. Actual duration, quality, retries, taxes, and the chosen model affect the result. Save usable files and their provenance independently of the service. Synthetic audio must not be presented as a recording of a native speaker; later human recordings can broaden exposure without becoming a dependency for the pilot.

## Accepted local delivery and progress continuity

C-041 settles initial delivery: a locally running application opened in a browser on the owner's computer. Hosting is a possible later stage. Responsive phone layouts remain planned under C-026; mobile usability does not imply remote access, independent phone operation, or synchronization in the first version. Do not make local use depend on a cloud account or ongoing hosting subscription.

Proposed implementation direction, to refine after discovery: a local application service with private persistent learner data and the planned domain API. Keep the data boundary portable so later migration to a hosted deployment can preserve content IDs, learner history, saved phrases, and settings. Storage engine, startup/lifecycle tooling, and authentication details are not selected. A stable browser address and a documented launch/stop workflow belong in later implementation; no running endpoint exists now.

### Deferred remote access

The owner mentioned VS Code port forwarding as an option to examine if away-from-home use becomes necessary. [VS Code port-forwarding documentation](https://code.visualstudio.com/docs/debugtest/port-forwarding), inspected 2026-10-19, describes forwarding a local service through Microsoft dev tunnels with Private visibility by default and authenticated access. This is a candidate, not a configured connection. As a consequence of forwarding the local service, the host computer, application, and tunnel must remain running and connected; it does not provide hosting while the computer is off. If pursued, start with private access and verify who can reach the application/API. No public port, tunnel, account connection, or network configuration is being created.

### Accepted saved progress and recovery

The owner accepted the general behavior under C-042. Detailed backup scheduling, restore safeguards, and storage mechanisms below remain design proposals:

- One private local learner profile. Persist completed attempts, targeted hint/reveal events, review state, personal phrases, preferences, and the current study location. Retain resumable drafts without counting them as completed attempts.
- Keep authoritative progress in application-managed local storage, outside the public repository, rather than only in a browser tab or browser cache. Closing the browser or restarting the application should preserve it.
- Provide automatic local backups plus an explicit export/import path for moving computers and later hosted migration. Restore should preview what will be replaced and preserve a rollback. A backup on the same disk does not cover disk loss; an external backup destination remains a later user choice.
- Keep reviewed course content and reusable audio separate from private learner history. Content upgrades should preserve stable identifiers and existing evidence.
- No multi-device synchronization or offline-phone promise initially. Ordinary local practice without internet is accepted under C-043; external assistant help, new audio generation, and updates would still require their own connectivity.

### Backup schedule and recovery — accepted policy and remaining details

C-042 accepts persistent progress, automatic backups, export/import, and history-preserving updates. C-055 accepts the following policy; implementation details remain open:

- Save working progress during use independently of backups. Maintain a daily backup snapshot on days with saved changes while the local service is running; an inactive day does not require waking the computer or internet access. Refresh the day's snapshot safely as appropriate. Accepted retention: seven daily snapshots and four weekly snapshots, retaining the most recent valid backup even after a long absence.
- Create a separate recovery snapshot before a data-changing course/application update or restore. Verify the new snapshot before pruning an older valid one. Exact storage limits and pre-change snapshot retention must be pinned in the implementation specification; the initial default should not require routine learner administration.
- Offer Export my data as one portable archive containing progress, drafts, phrases, collections, preferences, and personal assets needed to restore them, plus format/content-version metadata. Reusable installed course/audio assets can be referenced by version rather than duplicated in every profile backup. Explain required course assets on import; do not promise that a profile archive alone installs the entire offline application. Exclude credentials and machine-specific connection secrets.
- Before restoring, validate archive integrity and compatibility and preview its date and what it will replace. Preserve a rollback snapshot, then replace the local profile only after an explicit learner confirmation. First-stage restore is replacement, not an unplanned cross-device merge. A failed validation leaves the current profile unchanged; source imports are treated as data, not executable content.
- Keep automatic backups local and private, outside public source control. Provide a manual export suitable for a user-chosen external destination. A copy on the same disk covers accidental edits or corruption but does not cover loss of that disk. Cloud storage or synchronization is not introduced by this proposal.
- Show the last successful backup and a concise actionable notice if saving or backup fails. Do not silently claim that unsaved work is safe. Add C-053 contextual help explaining automatic save, backup, export, and restore in Ukrainian.

Accepted under C-055: automatic daily snapshots with seven daily/four weekly retention, a pre-change recovery snapshot, and explicit export/restore controls. Storage technology, exact paths, encryption, and packaging remain unresolved. This is planning only; no backup has been created or restore tested.

### Accepted local practice without internet

Accepted scope under C-043/C-044: install the complete prepared first-stage A1-A2 course and its required assets before owner handoff. Ordinary local practice must work without internet while the local application service is running, including lessons never opened before and after a browser/application restart. Include saved lessons/rules, reviewed exercises and answer checking, prepared hints, scheduled review, personal phrases already marked ready, downloaded audio, and progress saving.

New cloud-model help, external review of unresolved answers, speech generation, content downloads, and software updates can require internet. An unresolved free-text answer keeps the C-034 uncertainty status offline; do not invent a verdict or block unrelated practice. New personal-phrase drafts may be captured offline but cannot silently become ready without review. Explain unavailable online actions without losing the current attempt.

This requires local availability of the application assets and required lesson/audio files, plus checks with internet disconnected before release, including a fresh start and a never-opened lesson. It does not promise offline phone use, synchronization, an installed mobile app, or running the computer-hosted application while the computer is off. The trade-off is initial download/disk space and explicitly unavailable online enrichment. Technical storage, packaging, and offline mechanisms remain implementation choices.

## Curriculum design documents

[CURRICULUM-A1-A2.md](CURRICULUM-A1-A2.md) owns the evolving detailed first-stage syllabus. Its initial block map and brief familiar-foundations approach are accepted under C-029. Detailed micro-lessons remain a working draft; this is not completed or validated coverage. Product scope and confirmed decisions remain in this document; current work remains in STATUS.md.

## Planned visual design and mobile usability stage

Accepted direction: C-025/C-026. Proposed execution sequence, to revisit after the main learning flows are settled:

1. Gather visual references and sketch two or three alternatives around the same representative lesson and review task. Do not choose a theme from appearance alone.
2. Compare course navigation, explanation, exercise entry, progressive hints, feedback, review selection, and the personal-phrase collection on both computer and phone.
3. Prototype the chosen direction and test its primary flows before final UI implementation. Keep findings and the chosen design alongside the canonical product docs when this stage begins.

A responsive browser application is the proposed initial delivery approach; native apps are not required by this request. Phone use must support actual practice, not just reading. Proposed checks: readable text, touch controls, on-screen keyboard and accented input, feedback visible while typing, resumable drafts, no hover-only controls, and alternatives to drag-only tasks. Verify on real mobile browsers in addition to viewport previews. Exact devices/browsers remain open.

Phone usability and progress sharing between devices are separate requirements: cross-device sync, hosting/reachability, offline behavior, and accounts are still undecided. Do not promise that a laptop-only local server or browser-local progress will automatically be available on a phone.

### Initial visual alternatives — proposed, 2026-10-20

An in-conversation comparison uses synthetic examples of the same participle exercise. These are design mockups, not the application or a reviewed lesson corpus. The subsequent hybrid direction is accepted under C-048.

| Direction | Layout and intended use | Tradeoff |
|---|---|---|
| Focus (Фокус) | One central exercise; rule and hint available on demand. | Keeps the current task prominent, but consulting reference material takes another action. |
| Notebook (Зошит) | Rule beside the exercise, stacking above it on a phone. | Supports first exposure; a visible answer model means supported practice and uses more space. |
| Workshop (Майстерня) | Skill selection beside the exercise, with quick switching between regular forms and exceptions. | Useful for targeted review; denser navigation needs care on a narrow screen. |

Recommendation for discussion: Focus as the everyday practice layout, an optional Notebook-style guided step for new lessons, and skill selection in the topic view. This initial recommendation was superseded by the owner-proposed hybrid accepted under C-048.

The comparison includes local answer entry, a bounded example check, hints, rule visibility, phrase-save feedback, a session summary, and a phone-width preview. These controls do not create real learner records, schedule reviews, play audio, or exercise an application API. Closing a rule must not erase assistance evidence for the current attempt. Future selected-design work must cover home, course navigation, listening, personal phrases, and unresolved-answer handling as well.

Validation: script syntax checked with `node --check`; the fragment was wrapped with the visualization renderer. Browser inspection was blocked by the browser tool's local-file navigation policy. Layout, mobile keyboard behavior, and browser interactions remain unverified. The owner subsequently selected the hybrid under C-048; refine the remaining key screens and verify them in an authorized preview environment.

### Focus with collapsible reference — accepted direction, 2026-10-20

Owner feedback: Focus looks promising, and Workshop's left-hand reference area is useful. The owner proposed combining them with a panel collapsed by default, and tentatively suggested preventing it from opening until an answer has been entered. The initial request was exploratory; the subsequent mockup and always-available-help direction were accepted under C-048. Application implementation remains unauthorized.

Accepted layout direction: a persistent, labeled Reference control on the left opens the current topic's rule, exceptions, and examples beside the focused exercise. Closing it preserves the answer draft. On narrow screens, reference content expands above the exercise rather than squeezing the input. The conversation mockup demonstrates open/close, Escape, draft preservation, expandable sections, a bounded example check, and a Do not remember action that opens exceptions.

Accepted under C-048: keep help available before an answer. Encouraging an independent attempt is useful, but requiring arbitrary text can produce guesses solely to unlock help. If an attempt-first mode is later chosen, use an explicit submitted attempt or Do not remember action, rather than treating any nonempty input as recall evidence. Opening relevant reference content records assistance; closing the panel does not erase it. Consulting the reference after a checked independent answer does not retroactively rewrite that answer's result. Exact per-rule attribution remains implementation design work.

C-048 confirms the overall layout and always-available help direction. The current mockup uses synthetic content, and has no course backend. Validation is limited to JavaScript syntax and static markup/selector checks; browser layout and runtime interactions remain unverified. Next plan the home screen and navigation before expanding the visual design.

### Home screen — accepted hierarchy

C-049 accepts the hierarchy building on C-045. Detailed navigation labels and visual layout remain design work:

- A manageable recommended review set, with one concrete evidence-based reason and an optional time estimate. Do not show an alarming overdue backlog or require review before new study. If no review is eligible yet, replace this with a suitable course starting point.
- A separate resume action naming the saved lesson or practice context. With no saved session, show Start course. Resume restores the interrupted activity rather than silently starting new material.
- A direct Choose topic route with study and practice options, including topics learned elsewhere. This remains available regardless of recommendations.
- Persistent navigation to Course, Practice, My phrases, and Progress; listening is an available practice filter rather than an obligatory separate course. Settings remain accessible without competing with the learning actions.

Accepted under C-049: emphasize recommended review when it exists, while keeping Resume and Choose topic immediately visible. With an unfinished session, make its saved context clear; do not force the learner into either route. On a phone, stack actions without removing manual choice. Use synthetic examples in subsequent mockups. No streaks, penalties, inferred mastery percentages, or new activity quotas are introduced. Next discuss manual topic navigation; the home-screen mockup remains planned before final UI implementation.

### Manual topic navigation — accepted routes and proposed details

C-007 and C-046 already require independent topic selection and narrower practice. C-050 accepts both topic and everyday-situation routes. Detailed discovery behavior, including when the formal Spanish name is forgotten, remains to be designed.

Proposed default: browse by learning topic with Ukrainian labels and Spanish terms together. Search can match curated aliases and representative constructions, such as a known verb form, without requiring runtime AI. Provide the accepted everyday-situation route, with its view/filter layout still proposed (shop, home, appointments), linking to the same relevant topics and reviewed tasks; it is not a second course or duplicate progress record. Exact groupings and alias coverage remain unapproved.

After choosing a topic, offer Read rule, Learn topic, and Practice. Practice has a quick default set for that topic and optional narrower targets such as regular forms, exceptions, or contextual tense choice. Listening can be included or omitted. Familiar topics learned elsewhere remain accessible without completing all earlier course lessons; a self-report of prior study does not count as tested mastery. Any recommendation based on difficulties must use actual evidence. Unrelated topics do not silently enter a manually scoped set; mixed-topic review is an explicit choice or a clearly labeled recommendation.

Both entry routes are accepted under C-050. The recommended topic-first hierarchy, search behavior, and detailed catalog screen remain design work. Next discuss organization of My phrases. No catalog, search index, or task-selection implementation exists.

### Exercise input and navigation — accepted defaults

Accepted under C-056, building on C-026/C-034/C-048/C-053:

- Use the normal keyboard to enter Spanish characters. Remove the proposed on-screen Spanish-character strip; the owner explicitly declined it.
- For single-line answers, Enter checks the answer. For multiline answers, Enter adds a newline; Command+Enter on macOS or Ctrl+Enter on Windows checks it. Show a concise platform-appropriate reminder beside the field or Check button, with contextual help explaining the action. All actions remain available as visible buttons and through ordinary keyboard navigation. Prevent accidental repeated submissions from held keys or input composition.
- After checking, keep the learner's answer, feedback, and explanation visible until an explicit Next action. Do not automatically advance, start a countdown, or autoplay the next recording. Preserve opportunities to reread the explanation, inspect the rule, or save a phrase. Keep retries and next-step behavior consistent with uncertainty handling and voluntary stopping.
- Phone layouts must leave input, checking, and feedback usable with the software keyboard open. Use tap-accessible controls, readable editable text, and accessible focus behavior. Do not require hover or drag gestures. Preserve drafts when opening reference or help panels.
- Do not silently correct Spanish spelling before grading. Retain the accepted distinction between form/meaning errors and meaningful orthography. Exact keyboard attributes, platform autocorrect behavior, and supported-browser verification belong in the implementation checks.

C-056 settles these interaction defaults. Continue with concrete review scheduling, content coverage, remaining mockups, and acceptance planning. No input controls or mobile behavior have been implemented or verified.

### Browser and device verification — confirmed targets and proposed scope

C-059 identifies Chrome on macOS and an iPhone running iOS. Recommended initial matrix: the current stable Chrome release on the owner's Mac and Safari on an iPhone, with actual version numbers recorded when the release is tested. Safari is a test-scope recommendation, not a claim about the owner's current phone browser. Do not equate changing viewport width with a completed real-phone check.

Desktop checks cover keyboard entry and shortcut reminders, rule/help panels, audio started by the learner, saved drafts, and the local offline/restart/backup scenarios. Phone checks cover readable layouts, touch controls, the software keyboard, text entry, help/reference opening without draft loss, and actual audio playback. Keep the accepted offline guarantee on the local computer; initial phone usability does not establish remote access, phone-offline installation, or synchronization. Internal phone test access must be scoped separately without opening a public service by default.

Exact supported browser/OS versions, real-phone test access, and additional-browser regression scope remain implementation-plan work. No browser, mobile connectivity, or audio verification has been performed.

## Course horizon and staged delivery

Accepted sequence: beginner foundations including A1 -> strong A2 -> B1 -> B2. The owner may have mentioned C1 in an unclear dictated fragment; a clarification was asked. Beyond-B2 scope is unconfirmed and does not block the confirmed A2/B1/B2 plan. Do not assign C1 to the required roadmap without clarification.

Level labels guide the in-scope curriculum and assessment; speaking/conversation remains excluded, and listening is included under C-035/C-036, with first-stage inclusion settled under C-037 and detailed coverage pending. Course completion must not be presented as demonstrated overall CEFR proficiency across unassessed skills. The [Council of Europe self-assessment grid](https://www.coe.int/en/web/portfolio/self%20-assessment-grid), read on 2026-10-07, distinguishes listening, reading, spoken interaction, spoken production, and writing.

Proposed design and delivery details, not yet a complete curriculum or authorized implementation plan:

| Stage | Design now | Deliver after implementation authorization |
|---|---|---|
| Beginner through A2 | Detailed objectives, prerequisites, modules, exercise coverage, review links, and practical reading/writing checks, plus listening targets and checks mapped under C-035/C-036. | The first complete in-scope course segment, available for daily use and owner testing. |
| B1 | Map objectives, prerequisites, and the way earlier skills return in harder contexts. | Extend the same course after feedback on the A2 stage. |
| B2 | Map objectives, prerequisites, and later assessment/transfer goals. | Extend the course again after B1, preserving earlier practice access. |

Use one application and stable content/skill identifiers across stages. Adding B1/B2 should preserve progress, personal phrases, and review history, and should not require restarting the course. Later stages should be visibly planned/unavailable until implemented, not presented as completed content. No fixed lesson count or delivery date is selected.

Accepted first-stage product scope includes the course path, selected-topic practice, hint-aware review, progress persistence, personal-phrase workflows, and the bounded API/skill integration required under C-062. Exact technical allocation and verification remain planning work; implementation is not authorized.

C-044 supersedes the proposed early owner pilot: an internal module can test the learning loop, review process, and UI before bulk authoring, but owner learning and personal testing start after the complete first-stage handoff. Do not ask the owner to study unfinished A2 material while the remaining lessons are authored.

First-handoff gate: implement the agreed first-version features; prepare and review all mapped beginner-to-A2 explanations, exercises, answers, hints, and planned audio; reconcile curriculum coverage; resolve blocking content/runtime findings; and verify core flows, offline fresh-start access, progress persistence, backup restoration, and history-preserving updates. All required first-stage materials must already be present locally. The exact scenario checklist and content quantities still need design. Passing this gate is not a guarantee of zero bugs or a certification of the learner's CEFR level. Internal calibration and sample checks remain necessary but cannot stand in for reviewing the remaining course items.

Proposed meaning of a strong A2 stage: cover the mapped in-scope A1/A2 objectives with reviewed lessons and sufficient varied practice; offer cumulative independent reading/writing tasks, listening checks aligned with the agreed delivery scope, and delayed mixed review; distinguish independent answers from hints. A single successful quiz or completed lesson does not prove durable mastery. Product completeness and an individual learner's assessed proficiency are separate.

Use the [Instituto Cervantes Plan curricular index](https://cvc.cervantes.es/ensenanza/biblioteca_ELE/plan_curricular/indice.htm), read on 2026-10-07, as a source for Spanish-specific objectives/content inventories. It organizes objectives and language content by A1-A2, B1-B2, and C1-C2. Detailed mapping to this course is not yet done; do not infer that browsing the index establishes coverage. Author original course material and track source/content rights separately.

### Accepted B1/B2 continuation map — 2026-10-26

Status: roadmap direction accepted on 2026-10-26 under C-078 via the native Далі choice. The owner requested a detailed first A1-A2 stage and a map of later B1/B2 stages under C-024/C-026. The six areas per level below are original planning groupings, not fixed module/lesson counts, an authored syllabus, or source-certified level coverage. Exact teaching order, vocabulary, grammatical scope, variants, listening sets, and assessments require later detailed design/review.

Proposed progression: B1 develops connected practical accounts, explanations and messages; B2 develops more precise viewpoint, argument, reformulation and work with richer input. Both retain Ukrainian instruction, Spain Spanish, reading/writing/listening, personal constructions, and targeted review. Speaking/conversation stays outside the course. Later levels extend the same application after the complete agreed A1-A2 handoff and subsequent B1 work; this map does not expand the first-release corpus to B2.

#### B1 — connected everyday use

| Map ID | Practical outcome to design | Supporting language candidates and earlier return |
|---|---|---|
| B1-R1 | Understand and write a connected familiar account, explaining events, background and what happened earlier. | Extend the A2-03/04/05/06 contrasts, sequence links and individual exceptions; introduce pluscuamperfecto in suitable small steps. |
| B1-R2 | Explain plans and expectations, make a polite suggestion, and describe a realistic condition and consequence. | Introduce reviewed simple future/conditional uses and real-condition frames; revisit A1-06/A2-01 plans, ability and obligation. Do not import the entire later hypothetical system at once. |
| B1-R3 | Express an introduced wish or request concerning someone else's action, give advice and understand/write a negative instruction. | Introduce selected present subjuntivo and negative-imperative frames after their prerequisites. Reuse A2-02 pronouns and A2-07 instructions; teach form and contextual choice separately. |
| B1-R4 | Describe in more detail, explain a view and connect reasons, alternatives and consequences in a short text. | Extend A1-06 links, A2-02 descriptions/reference and the CV supporting strands. Review selected clause and mode patterns rather than a universal keyword-to-answer rule. |
| B1-R5 | Read a routine practical message/document and write a useful request, clarification, response or simple complaint. | Extend CV-06 situations and A2-07/A2-08 text purposes. Introduce recipient/register wording and useful personal constructions before independent use. |
| B1-R6 | Understand the main point and relevant details of connected familiar written/audio material and give a brief written response or summary. | Integrate the preceding areas through reviewed everyday texts and clearly articulated Spain recordings, with gradually reduced support and separate comprehension/writing evidence. |

#### B2 — precision, argument and richer input

| Map ID | Practical outcome to design | Supporting language candidates and earlier return |
|---|---|---|
| B2-R1 | Follow and write accounts with more complex temporal relationships and a deliberately chosen viewpoint. | Extend B1-R1/R2 through reviewed compound-time and contextual-use contrasts, retaining earlier auxiliary/participle/exception histories. Exact form allocation remains to reconcile. |
| B2-R2 | Express a hypothetical alternative, uncertainty or a nuanced stance with an appropriate introduced construction. | Extend B1-R2/R3 through broader subjuntivo and unreal-condition work. Stage new forms and meanings separately, with explicit context and valid alternatives. |
| B2-R3 | Compare arguments, support a position, acknowledge a counterpoint and qualify a conclusion in writing. | Extend B1-R4 connectors, concession, reason/effect and reformulation. Language fit and reasoning structure remain distinct from factual knowledge about a topic. |
| B2-R4 | Report or reformulate information while preserving who said/did what, its timing and relevant emphasis. | Extend B1-R4/R6 reference and connected-text work with selected reported-speech, relative and impersonal/passive frames. Review exact meaning/variant boundaries. |
| B2-R5 | Adapt a practical text to its recipient and purpose, producing a structured request, complaint, explanation, short report or review. | Extend B1-R5 through appropriate register, cohesion and revision. Familiar personal/work/interests contexts can vary; no specialist subject knowledge is a general prerequisite. |
| B2-R6 | Understand longer, more varied reviewed texts/recordings and combine relevant information into a written response. | Integrate B1-R6 and B2 areas through selected richer Spain input, varied voices and less predictable wording. Do not promise effortless comprehension of every accent, speed or genre. |

These map IDs label roadmap areas; detailed objectives/lessons and actual item IDs will be designed later. Forms are supporting candidates, not the sole organizing principle. The progression includes useful vocabulary, fixed expressions, text conventions and listening recognition throughout.

#### Continuity, preparation and later delivery

- Keep one application, the private profile, personal collections and the original skill/phrase/recording histories. A previously learned participle remains the same recall target inside a harder text; a new mode/viewpoint choice receives its own evidence rather than resetting the old target.
- Use small introduced steps before integrated tasks. Review old material in new familiar contexts and retain independent versus assisted/revealed/revised evidence. A text-level result does not demonstrate mastery of every form it contains.
- Preserve direct topic/phrase practice, optional mixed checks, pause/resume and the C-057/C-060 review controls. Detailed B1/B2 assessment design must not invent a mandatory perfect-score entry lock.
- Retain C-038/C-039 reviewed-core and cross-provider content gates, valid-answer handling, private-draft boundaries and actual-audio checks. Source references or generated recordings alone do not make content ready. Authentic material requires suitable rights and review; the roadmap authorizes no acquisition, generation or spending.
- Deliver the complete agreed beginner-through-A2 stage first. Prepare B1 in a later detailed phase, then B2, preserving previous manual practice. Future areas remain visibly planned/unavailable until implemented/reviewed. No lesson count, schedule or total audio budget is fixed by this map.
- The next planning phase after acceptance is visual design, starting with the home screen's accepted Review / Resume / Choose topic hierarchy and computer/iPhone layouts. Technical design, calibration and implementation authorization retain their later boundaries.

#### Source basis and limits

The following official indexed extracts were inspected on 2026-10-26; direct full-page retrieval attempts returned 404. The excerpts support selected directions, not this six-area grouping or complete B1/B2 alignment:

- R1: [Instituto Cervantes, B1-B2 general objectives](https://cvc.cervantes.es/ensenanza/biblioteca_ele/plan_curricular/niveles/01_objetivos_relacion_b1-b2.htm), sections 1.1 and 1.3: practical information/transactions and understanding/using main ideas and details in oral/written texts. We adapt in-scope reception/writing; oral-production outcomes are not adopted.
- R2: [Instituto Cervantes, B1-B2 grammar inventory](https://cvc.cervantes.es/ensenanza/biblioteca_ele/plan_curricular/niveles/02_gramatica_inventario_b1-b2.htm), selected sections 9.1.4/9.1.5/9.1.8, 9.2/9.3 and 15.3.6: future/conditional, prior-past, subjuntivo, imperative and condition families. Exact row-to-level/meaning mapping remains to reconcile; later compound/mode breadth is not a claim of exhaustive coverage.
- R3: [Instituto Cervantes, B1-B2 genres and text products](https://cvc.cervantes.es/Ensenanza/biblioteca_ele/plan_curricular/niveles/07_generos_discursivos_inventario_b1-b2.htm), section 1.3: personal/formal messages, practical information and more developed written genres. These inform candidate tasks; the course does not promise every listed genre as a separate unit.

C-078 accepts this B1/B2 continuation direction. Next explore the home screen visually. A complete later-level syllabus, exact source/item mapping, first-release expansion, content authoring, application implementation and merging are not authorized by this roadmap acceptance.

### First-release readiness gates — accepted criteria

C-044 already requires a complete application and the entire agreed reviewed beginner-to-A2 course before owner learning/testing. C-058 accepts the following gates to make that boundary reviewable; they do not authorize implementation or claim current readiness.

| Gate | Required evidence before owner handoff |
|---|---|
| Curriculum coverage | Expand all 14 accepted outline blocks into reviewed objectives and lessons. Maintain a coverage matrix from each agreed in-scope objective to its teaching material, practice, and later review; map listening targets and everyday collections explicitly. Reconcile the relevant curriculum inventories with documented scope exclusions. The current outline alone is insufficient evidence of full A1/A2 coverage. |
| Prepared course material | All release-required explanations, examples, accepted answer variants, hints, tasks, personal-collection templates, and audio are present locally in the reviewed version. Apply C-039 cross-provider review with resolved substantive disagreements and actual-audio checks under C-040. Release-required items cannot remain draft or needs-review; personal learner drafts may still exist but cannot become practice keys. Agree calibration thresholds before bulk authoring. |
| Functional learning journeys | Demonstrate new lesson, studied-topic practice, both navigation routes, personal/course collections, hint and transcript disclosure, meaningful orthography feedback, unresolved answers, and resume after interruption. Check visible Ukrainian instructions and contextual help. Verify computer and responsive phone interactions against C-059's Chrome/macOS and iPhone targets; pin exact versions and the iPhone browser in the release test matrix. |
| Review evidence and scheduling | Use controlled test data and time to verify C-057 interval progression, next-day follow-up, separate form/context/listening evidence, no assistance from interface-only help, pause, known/repeat-more behavior, and manageable review after a break. Pin still-open override and queue rules before implementation. |
| Offline and recovery behavior | With internet disconnected, start the local application afresh and open an unseen installed lesson, use prepared listening and practice, then restart and verify saved attempts/drafts. Restore a known backup/export fixture and compare phrases, collections, history, settings, and study location; verify invalid imports leave the current profile intact and that rollback works. |
| External-assistant integration | Verify C-062 end to end with a supported assistant host: explicit learner request, correct context selection (including ambiguous/stale-tab cases), authorized API operation, persisted visible result, actual assistance evidence, preserved draft, and correct draft/review state. Verify invalid/stale/duplicate requests and recovery using synthetic fixtures; ordinary prepared practice must remain usable without the assistant. |
| Release blockers and delivery | Resolve known blockers to core learning, saving, restoring, grading safety, and required audio use. Record remaining nonblocking limitations honestly. Provide a documented local start/update path and learner-facing help. Preserve private data outside public source control and verify supported distribution rights for shipped materials. |

These gates assess a usable prepared product, not the owner's personal attainment of A2 or proof that every linguistic error has been eliminated. Technical checks cannot substitute for language/audio review. Internal development/content pilots remain allowed, but no incomplete A2 handoff replaces C-044. Home, catalog, collection, and listening mockups remain planned before final UI implementation.

The gate set is accepted under C-058 and the owner's primary device targets under C-059. Finish the detailed coverage matrix, remaining visual prototypes, exact browser/version test scope, quality calibration, and unresolved scheduler mechanics before producing an executor-ready implementation plan.

## Personal phrase collection

Accepted capture workflow under C-022:

- Course item: an explicit save-for-practice action preserves its reviewed wording and source context.
- Existing Spanish phrase: capture the phrase and optional context; check meaning and correctness before treating it as an answer model.
- Ukrainian intent: save a quick draft, then resolve it with the external assistant and store the checked Spanish expression. This path does not require embedded AI.

Use distinct draft/needs-review and ready-for-practice states. Exact validation responsibility and UI wording remain to be specified; a structurally valid record alone does not prove language correctness. These states do not measure learner mastery. Personal records remain outside public source control.

Practice under C-023 combines the saved phrase with appropriate variations using familiar vocabulary and grammar. Exact variation frequency and any manual mode control remain implementation/design details, not a blocker to the next product discussion. Checking responsibility will be resolved with the wider content-quality workflow.

### My phrases screen — proposed organization

Capture paths and exact-phrase/construction practice remain accepted under C-022/C-023. This proposal concerns finding and selecting saved material:

- One searchable list showing Spanish wording, Ukrainian meaning or intent, optional context, and review readiness. Drafts without validated Spanish remain visible but are excluded from practice targets.
- Quick filters for All, Ready for practice, Needs checking, and Paused. Readiness and review scheduling are different dimensions: paused items can still be linguistically ready, and ready items are not necessarily due.
- Reuse topic and situation tags where reviewed metadata exists. Let the learner correct or add optional personal tags, without requiring folder setup for every save. One phrase can belong to several situations without duplicate records. Automatic inference for external phrases is not assumed.
- Allow practice of selected ready phrases or ready items matching a filter, with recommended review as a quick action. Preserve the existing combined phrase/variation model. Listening is available only when a suitable reviewed recording exists.
- Expose repeat-more, known/occasional checks, and pause in phrase details using the accepted review controls. A draft edit requiring revalidation must not silently replace a reviewed practice answer.

C-051 requires named personal collections. The one-list, quick-filter, and optional-tag design remains proposed alongside them; nested folders are not required. These are screen-design proposals, not implemented storage or scheduling behavior.

### Phrase collections — accepted need and proposed behavior

C-051 accepts personal collections. Proposed behavior: create a named collection such as Before a trip or Useful for me, add existing phrases, reorder items, and practice its ready material. Collections reference phrase records: one phrase may belong to several collections, sharing its learning history. Removing collection membership or deleting the collection should leave the phrase and its history intact; deleting the underlying phrase is a separate action. Draft membership does not make an entry eligible for practice, and collection membership does not silently change automatic-review pause settings.

Accepted under C-052: include prepared, reviewed thematic packs such as At the shop, Booking an appointment, or Everyday expressions heard in Spain. Packs reuse suitable course material and existing situation mappings rather than creating duplicate lessons or progress. Keep them available locally with the prepared course; no live generation or embedded AI is implied. A learner could use a pack as the basis for a personal collection, preserving links to the reviewed source items; wording edits follow the established validation boundary. First-stage inclusion is accepted; exact pack coverage and size remain to be planned.

Recommended screen organization: My collections and Course collections, with search, optional favorites, and a short purpose/level description for each prepared pack. The recommendations concern written and listening practice only. Both collection types are accepted under C-052. Continue with contextual-help details and listening-screen design; remaining collection controls and layout still require refinement.

### Contextual interface help — accepted need, proposed presentation

C-053 requires contextual help. Proposed presentation: a small, accessibly named question-mark button beside an unfamiliar action or section heading, opening a short explanation on click, touch, or keyboard activation. Include what the feature does, a few concrete steps, and a small example where useful. Make closing straightforward and preserve the draft and current location. Essential instructions must remain visible; help is supplementary and must not rely solely on hover or a first-run tutorial.

For an empty collection, show a short visible invitation and Add phrases action with access to the explanation. For an existing collection, retain help near the relevant controls. Initial copy is Ukrainian and belongs to the planned localization resources. Examples cover Create collection, Add phrase, Practice selected, Repeat more, and Pause automatic review. The exact control style remains a design choice.

Interface-only guidance (how to operate a control) is separate from instructional hints (Spanish rules, translations, or answer reveals). Opening interface-only help must not count as evidence of language difficulty or assisted recall. Content that actually reveals language support still follows the established assistance rules. Help text should make review-control consequences clear without changing learner settings merely because the explanation was opened.

### Listening screen — accepted flow and remaining design details

Use the accepted Focus layout with a short situation label, a manually started player, the current task, and accessible contextual help. Initially hide the transcript and translation, including any sidebar material that would disclose the answer. The learner can request them at any time; such disclosure is recorded as relevant language support.

Accepted under C-054 for early short clips: assess meaning or a concrete detail with Ukrainian choices, gradually adding short written answers. Offer dictation as a distinct task type, not a prerequisite for all listening. Choice recognition, written recall, and transcription provide different evidence and should not be merged into one undifferentiated success measure.

Keep Replay, slower playback where supported, and Did not catch it available. Replaying is not automatically failure; show assistance neutrally. After a response, offer the transcript/meaning and optional learner reports such as Knew the words but did not recognize them or Meaning was unfamiliar. Preserve an unknown cause when evidence is insufficient. Save suitable reviewed expressions to a collection. Later reviews can use another reviewed recording or familiar context. A playback failure must offer retry or a written task without recording a listening failure.

C-054 accepts meaning comprehension as the default and dictation separately. The computer/phone listening mockup and actual-audio validation remain pending. Backup/restore policy is accepted under C-055; exact mechanisms and validation remain pending. No audio player, recordings, or assessment implementation exists.

## Design directions and unresolved details

The owner accepted the study/practice direction under C-014. Rows below retain candidate details; they are not empirical effectiveness claims or fully approved specifications. C-022 and C-023 settle the P-009 entry paths and combined practice direction; detailed scheduling, validation responsibility, and P-010 embedded AI remain undecided.

| ID | Proposal | Example or unresolved detail |
|---|---|---|
| P-001 | Offer separate entry points for course study, selected-topic practice, and recommended review. | New material is optional under C-007; session length and balance remain open. |
| P-002 | Track specific skills separately from lesson completion. | Recognizing a word, recalling it without hints, and using it in a sentence could have separate evidence. |
| P-003 | Return to the same skill through varied written prompts. | Translation, sentence completion, independent writing, and multiple choice are in scope under C-008. Conversation is excluded. |
| P-004 | Offer an explicit repeat-more control for troublesome material. | The learner can keep a skill in frequent practice even after correct answers. |
| P-005 | Use spaced follow-up checks after successful practice. | Intervals, failure behavior, and what happens after the learner marks something learned are undecided. No permanent-retention guarantee. |
| P-006 | Keep review manageable after missed days. | Explore a session limit, prioritization, and optional extra practice rather than mandatory completion of an unlimited backlog. |
| P-007 | Use skill-specific hints and separate evidence for independent, hinted, and revealed answers. | A vocabulary hint must not automatically mark the whole grammar topic weak. Ambiguous errors need a focused follow-up rather than a confident diagnosis. |
| P-008 | Alternate focused drills with optional contrast exercises across already studied tenses. | Forming a tense when its name is supplied differs from choosing it in context. Unstudied grammar should not silently enter a selected practice session. |
| P-009 | Maintain a private personal phrase collection with all three entry paths under C-022. | Capture and combined exact-phrase/reusable-variation practice are agreed under C-022 and C-023; detailed scheduling and checking workflow remain open. Do not turn an unchecked attempt into a memorization target. |
| P-010 | Explore a deterministic core with optional external assistant support. | See the deferred integration plan below. Embedded AI grading is a separate undecided feature; external help does not by itself solve arbitrary free-text grading during independent use. |

## External-assistant integration plan — accepted scope, deferred implementation

Status: user-requested planning direction, with the following technical design proposed by the assistant. Revisit after course discovery; do not implement an API, CLI, MCP server, or skill now.

### Intended experience

The learner opens an assistant chat and requests help with the current exercise or a focused practice set. With an installed connection, the assistant retrieves an explicit application context, explains or prepares the requested change, applies authorized supported operations, and verifies the visible result. Ordinary course use should continue independently of the assistant (proposed design).

The application owns progress, learning events, and content versions; chat history is not the learning database. Drafts and private learning records stay outside public source control.

### First-release external-assistant slice — accepted scope

The general API-plus-skill direction was requested under C-014 through C-021. C-062 explicitly includes a small, project-contained integration in the first complete application, with these bounded capabilities:

| Capability | Accepted first-release behavior |
|---|---|
| Read the requested learning context | List active/recent course contexts, select an explicit or unambiguous target, and read the relevant topic, task, draft, disclosed hints, and limited learning evidence. Follow the existing multiple-tab/stale-context rules; do not infer unrelated browser contents. |
| Explain and record actual assistance | Use that context in an owner-invoked external assistant chat, provide an explanation, and record targeted help or an answer reveal only when it was actually delivered. Interface-only guidance remains separate. Delivery/recording failures must not become independent success evidence. |
| Prepare focused practice | Create a named practice set from eligible reviewed bank items, preserving the chosen skill, prior-study scope, and optional listening. The learner sees and opens it from the application without losing the current draft. Newly authored tasks follow the separate draft/review path. |
| Capture personal material | Add a personal phrase, Ukrainian intent, or supported explanation as a private draft; attach it to a collection or show it in a supplemental-material area. Preview does not make it a correct practice key. Relevant reviewed additions can become eligible through the established cross-provider review/version workflow. |
| Verify and recover changes | Return created IDs/revisions, re-read persisted results, protect against stale writes and duplicate retries, and retain reversible operations/undo where supported. Keep progress and review state owned by the application. |

Provide a documented domain API and a repository-contained skill covering these workflows, permission boundaries, assistance semantics, and verification. Use the assistant host's existing authorized execution/network tools; initial integration is a same-computer candidate. Exact schemas, authentication, transport, compatibility checks, and any helper script belong in the later technical plan. No MCP service is required for this slice. Credentials and learner data remain outside the public repository.

Ordinary prepared study and practice continue without an assistant connection; an external cloud assistant can require internet. Layout/code changes, new exercise renderers, public publication, arbitrary HTML, and direct SQL are outside this learning API. Translation-pack automation and a later MCP adapter remain separate extensions.

C-062 adds an end-to-end integration gate to C-058: owner request -> correct context -> authorized operation -> visible persisted result, including uncertainty/review state, assistance recording, and preserved draft. Use synthetic fixtures for public verification evidence. This is accepted release scope only; no API, skill, client connection, or content-generation job has been implemented.

C-062 settles first-handoff inclusion. Define the exact API/skill contract, supported host, and acceptance cases in the implementation plan before implementation authorization.

### Proposed connection

- Application API: explicit reads and bounded domain actions, sharing the same validation and persistence as the UI. Avoid arbitrary database editing or shell execution through this learning API.
- Recommended initial client: use the documented application API directly through existing authorized HTTP/shell tools, guided by the skill. Add a small helper script only if repeated authentication, payload validation, or retries justify it; it is not a separate required service or CLI product.
- Optional later MCP adapter: expose the same API operations if a selected assistant client needs MCP or native tool discovery materially helps. MCP is removed from the initial critical path. A skill alone cannot provide execution, network access, authentication, or permissions unavailable in the host environment.
- Skill: explain the topic/skill model, how to fetch fresh context, how to distinguish assistance from independent evidence, and how to verify changes. Instructions alone do not create connectivity or grant access.
- Context: list open learning sessions/tabs with their topic, exercise, meaningful user activity time, focus/visibility when available, current attempt, hint state, and revision/timestamp. An explicit reference wins; otherwise use an unambiguous recent context and state the assumption briefly. Ask only if recent contexts conflict or the target is unclear. Background polling must not count as learner activity; closed/stale contexts must be labeled as such. Persist the last study location for resumption, while keeping each tab's unsaved attempt separate.
- Access: authenticated, limited to the selected learner/session; expose only the context needed for the requested help. A same-machine connection is an initial candidate, not an approved hosting choice. Recheck host/client support when implementing; an arbitrary cloud chat cannot be assumed to reach a local API.

### Proposed increments and acceptance checks

1. After course discovery, define versioned topic/exercise/attempt identifiers and a structured content format using supported UI blocks. Keep storage technology undecided.
2. Provide an extension area that renders stored supplemental materials using those blocks; validate data, revisions, and permitted actions. A saved item should appear after refresh, preserving the current exercise and draft. Live updates are optional.
3. Expose and document authorized API reads and writes: discover contexts, read relevant evidence, create a focused practice set or supplemental material, and fetch the resulting state. Check recent-context selection across tabs, stale revisions, access boundaries, and duplicate request handling.
4. Add the skill for direct API use through existing host tools and neutral assistance recording; verify the full request-to-UI workflow and later independent practice. Record only assistance that is actually observed or learner-reported. A helper script and a later MCP adapter are optional, not prerequisites.
5. Before release, test untrusted content rendering, rejected unsupported blocks/actions, learner-data isolation, invalid/oversized input, undo, and persistence. Schema validity does not establish language accuracy; generated answer keys need a separate content-quality check.
6. Only if a concrete learning need exceeds supported blocks, evaluate isolated interactive HTML as a separate future capability. It is not part of the recommended initial content-extension scope.

For writes, check the relevant revision, preserve current attempts and progress, record the operation, and verify persisted state. Avoid repeated confirmations for clear, authorized, reversible actions; ask only for genuinely ambiguous scope or consequential replacement/deletion.

### What "change the application" can mean

Changing a practice selection, preferences, or supported personal content belongs in the domain API. Changing layout behavior, adding new exercise types, or modifying algorithms remains ordinary repository development with review and tests. A learning API does not automatically grant code-editing capability or authorize implementation.

### Accepted content extension direction

The owner accepted this direction under C-020. Implementation choices and verification remain pending.

Use structured materials assembled from prebuilt blocks: explanations, examples, tables, comparison cards, revealable hints, multiple-choice items, gap-fills, translations, and supported practice sets. A title and internal material ID let the UI render a new card/button and open the material without accepting arbitrary executable button handlers.

Proposed flow: assistant creates a material through the domain API; the application validates and persists it; an extension area lists the new item; the learner opens it. Preview/undo and version history preserve earlier content and exercise attempts. Per-user additions stay private by default; public course publication is a separate operation.

Persisting a record does not require exposing database credentials or raw SQL to the assistant. The API owns storage and validation; a database or another store remains an implementation choice. Storing HTML in a database does not make its eventual rendering safe.

Treat imported and assistant-authored content as untrusted data. Render text with contextual escaping, permit only specified block types and parameters, validate any allowed links/media, and reject arbitrary scripts, event handlers, executable templates, remote embeds, and network-fetch actions in the initial format. Any future Markdown support must explicitly disable raw HTML or use a reviewed sanitization policy. These are design requirements to verify, not an assurance that an unimplemented renderer is secure.

External reference links, if supported, should open by explicit learner action in an isolated new tab with no opener and no learner state/credentials attached; they remain external sites, not trusted course components. Do not automatically fetch or embed an arbitrary submitted URL. Choosing a hosting product for an explainer does not establish the content's trustworthiness.

Arbitrary interactive HTML would require separate-origin isolation, a tightly restricted sandbox, controls on network requests/navigation/downloads, and narrowly validated messages rather than access to course storage or API credentials. An iframe sandbox alone does not block every outbound request. Any such implementation needs its own threat review and tests; do not claim risk-free embedding.

Security basis checked on 2026-10-07: [OWASP XSS Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html) describes risks from executable untrusted content and contextual encoding/sanitization; [MDN iframe documentation](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/iframe) documents sandbox capabilities and cautions. The recommendation for this application is a design inference from those sources. A public source repository does not itself publish learner data or authorize API access; those boundaries still require a correct implementation.

### Accepted external-assistance direction

The owner accepted this direction under C-020. Exact evidence weighting and intervals remain open.

- Use neutral evidence labels, not punishment or a reduction of previously demonstrated competence merely for asking a question.
- A general explanation is a learning event, not an automatic failure of the current attempt or whole topic.
- A hint targeted at the current exercise marks the relevant part as assisted; a revealed answer marks that attempt as answer-seen. Neither is independent recall evidence.
- After assistance, offer a different later exercise without hints to establish new independent evidence. Do not erase earlier valid evidence.
- Record only help actually delivered through the integration or explicitly reported by the learner. No monitoring of unrelated chats or claim to detect all external help. If an assistance-recording operation fails, report incomplete evidence instead of silently certifying independent work.
- Keep the exact weighting and review intervals open. Asking for help can increase practice opportunities without a shame-based score.

### Decisions intentionally deferred

Exact transport and deployment; supported assistant hosts; endpoint schemas; authentication; storage; whether a helper script or later MCP adapter is useful; detailed phrase validation and practice; validation of generated content; detailed evidence weighting; and any embedded AI. API plus a skill is the recommended first integration in response to C-021, conditional on host tool/network access. No provider, model, price, or always-on background agent is selected. Arbitrary HTML embedding remains optional and deferred, not part of the proposed first implementation.

### Feasibility source

On 2026-10-07, [official OpenAI documentation on skills and MCP](https://developers.openai.com/plugins/concepts/skills) was opened and read: MCP provides live information and controlled actions; skills describe workflows around those tools. A later check of [plugin architecture](https://developers.openai.com/plugins/concepts/plugins), specifically Skills and Choose a plugin shape, confirms that skills plus existing tools can suffice and MCP is optional. In this local Codex session, shell execution works and command -v resolved curl and python3. This supports recommending direct HTTP access from existing tools (design inference); network reachability, API authentication, and the complete application workflow are not yet verified. No application connection exists yet.

## Proposed evidence behavior

The general evidence direction is accepted under C-014 and C-020; exact weighting remains undecided, and no behavior is implemented:

- Correct without help: evidence for that assessed skill and task type; later independent checks still matter.
- Correct after a targeted hint: assisted evidence for the hinted skill, not identical to independent recall.
- Full answer revealed: a learning opportunity, not a passed recall check.
- An incorrect form in an otherwise correct sentence: assess the target locally; do not penalize every skill in the sentence.
- Ambiguous free-text answer: allow valid alternatives, explicit uncertainty, and a correction/review path; never equate failure to match one reference string with a proven language error.
- Previously studied topic: eligible for practice, not automatically mastered.

Illustrative grammar reference: pretérito perfecto compuesto uses present-tense haber plus a participle; regular participles include -ado and -ido, with irregular forms such as hecho and dicho. This terminology was checked against [RAE conjugation tables](https://www.rae.es/buen-uso-espa%C3%B1ol/conjugaci%C3%B3n-espa%C3%B1ola) on 2026-10-07. These are synthetic curriculum examples, not learner performance records.

Illustrative skill: choosing between ser and estar. A possible sequence is a short explanation, a guided exercise, independent production, and later use in a different situation. This does not establish the learner's level or actual difficulties.

## Discussion sequence

1. Personal phrase entry paths and combined practice are settled under C-022 and C-023. Revisit validation responsibility with content quality, rather than blocking the next topic.
2. Spanish of Spain and the A1-A2 outline/familiar-foundations direction are settled under C-028/C-029. Ukrainian-only initial localization and future expansion are settled under C-030/C-031. The recommended session with manual selection is accepted under C-032. Review and manual controls are accepted under C-033. Written-answer-checking direction is accepted under C-034. Listening is included under C-035/C-036. Short audio exercises are included in the first stage under C-037. The prepared core plus reviewed additions is accepted under C-038. Cross-provider review is planned under C-039 and audio preparation is accepted under C-040; local browser delivery is settled under C-041; progress persistence and recovery are accepted under C-042; offline practice and the complete A1-A2 handoff are settled under C-043/C-044; progress presentation is accepted under C-045; return-to-practice is accepted under C-046; the new-lesson flow is accepted under C-047; C-048/C-049 settle the Focus/reference direction and home priority; C-050 accepts both navigation routes; C-051/C-052 include personal and course collections; C-053 requires contextual help; C-054 settles the listening split; C-055 settles the backup policy; C-056 settles input/navigation; C-057 settles initial review intervals. C-058 accepts readiness gates and C-059 identifies the primary device targets. C-060 accepts manual review overrides. C-061 accepts practice-bank variety. C-062 includes the bounded API-plus-skill integration in the first handoff. Next complete curriculum detail, remaining visual prototypes, exact integration/technical contracts, calibration planning, and acceptance cases. Concrete voices and actual-audio validation still need a later pilot. Continue detailed curriculum work in CURRICULUM-A1-A2.md; beyond-B2 clarification remains non-blocking.
3. Written-answer-checking direction is settled under C-034. Refine exact grading rules, hints, and retries when detailing exercises; do not reopen the accepted unresolved-answer path.
4. Refine optional time presets if needed and settle content sourcing and calibrate the C-039 review plan. Local computer/browser delivery is settled under C-041; mobile layouts remain planned, while phone access and sync are deferred. Speaking remains excluded.
5. Resolve feedback, valid answer variants, hint attribution, uncertainty, missed days, storage, and any AI cost/privacy constraints.
6. Agree on curriculum and sample learning flows; run the planned visual-design comparison on computer and phone, then finalize acceptance criteria and implementation scope.
7. Revisit the deferred external-assistant plan with the settled domain model and concrete user workflows.

Discuss a small number of questions per turn. Answers may change the sequence. Do not treat suggested options as decisions.

### Remaining product decisions

- Personal phrase details: resolve checking responsibility with content quality and exact scheduling with review design. All three entry paths and the combined practice direction are settled under C-022/C-023.
- Curriculum detail: map practical abilities to the agreed A2 -> B1 -> B2 stages; clarify any beyond-B2 goal. Spanish of Spain and the brief familiar-foundations approach are settled; Ukrainian instruction with future localization is settled; detailed assessments remain open.
- Session flow: recommended sessions with manual selection, optional new material, flexible time guidance, and resumable work are settled (C-032). Exact presets/composition and missed-day review prioritization remain to be refined.
- Mastery and review control: adaptive per-skill review, occasional checks after marking known, and a separate pause are settled (C-033); initial intervals are accepted under C-057. Queue fairness, exact manual-preference interactions, and evidence thresholds remain to be specified.
- Exercise feedback: valid alternatives, targeted corrections, meaningful orthography, and unresolved answers with optional external review are settled (C-034). Exact checking rules, hint levels, retry limits, and content-review mechanics remain open.
- Content scope and quality: detailed listening coverage, native-speaker audio provenance, curriculum sources and rights, linguistic review, and the distinction between a validated data structure and a correct teaching example.
- Product environment and continuity: initial local browser operation is settled under C-041, and progress/backup/export direction under C-042. Offline practice is settled under C-043; supported browsers and backup implementation details remain open; hosting, remote phone access, and cross-device sync are deferred. Mobile-friendly layouts remain planned.
- Visual design: C-048 selects the Focus/reference exercise direction, C-049 sets the home priority, and C-050 accepts both navigation routes. Remaining screens, detailed layouts, and browser/mobile verification are still open.

These are open decisions, not a questionnaire to answer all at once. Learning and return-to-practice walkthroughs are accepted under C-046/C-047. Refine their concrete acceptance criteria alongside remaining screen design, then finalize the implementation plan and deferred integration design.

## Open boundaries

Beyond-B2 scope, detailed level mapping, and assessment thresholds; detailed localization pack validation/publication; supported computer/mobile browsers and cross-device continuity; exact optional session time presets/composition; detailed listening coverage and exercise design; source and rights of learning content; use alongside a teacher; progress storage implementation and privacy; offline packaging details; AI/API usage and cost; accessibility; license; hosting; technology; exact review algorithm and mastery evidence thresholds. Listening inclusion with adaptive recognition practice, Ukrainian-only initial instruction with future localization, Spanish of Spain, the accepted A1-A2 outline and brief familiar-foundations approach, staged delivery through at least B2 with A2 first, computer/phone use, a later visual-design stage, and exclusion of conversation/speaking are settled.

## Reference inspected

On 2026-10-07, the existing JavaScript Learning Lab docs/REQUIREMENTS.md was read locally. REQ-007 calls for delayed review; REQ-033 distinguishes lesson states from understanding evidence. These are design references only and are not automatically adopted here. No claim is made about the current implementation satisfying those requirements.
