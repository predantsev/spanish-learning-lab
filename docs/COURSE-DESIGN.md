# Course design

Updated: 2026-10-08. This is a discovery document, not an approved implementation specification.

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
| C-012 | Conversation and speaking practice are out of scope. Do not design a separate future conversation course. Listening-only exercises have not been decided. |
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

## Language and localization direction

Accepted scope: C-030/C-031. Proposed design details, with no library or storage format selected:

- Separate the instructional locale (initially Ukrainian) from the learning target (Spanish of Spain). Localizing the interface does not translate away Spanish exercises or alter the learner's progress.
- Keep translatable interface messages and instructional content outside application logic, linked by stable keys/content IDs. Include explanations, hints, feedback, and source-language exercise prompts; a translated button catalog alone does not localize a course.
- Plan complete messages with named placeholders and locale-aware plural/date/number handling. Future UI designs should tolerate text expansion and other writing directions. Specific locale support requires its own checks.
- Agent API candidates: list missing/outdated translations, read source text and context, submit a versioned draft language pack, validate required entries/placeholders, preview, and activate reviewed translations with rollback. Reuse the bounded structured-content API; no arbitrary executable translation files. Exact endpoints and publication authority remain deferred.
- Track translation completeness and review state separately for interface and course content. A future incomplete pack should not silently appear as a fully supported course language; fallback/activation policy remains to be agreed.
- Translating a learning prompt can change its ambiguity and accepted Spanish answers. Review these together before use. An agent can draft translations, but generation or schema validation alone does not establish linguistic correctness. New locales must retain stable skill/progress identity.

Terminology and general design basis: [W3C, Localization vs. Internationalization](https://www.w3.org/International/questions/qa-i18n), read 2026-10-08, distinguishes preparing a product for localization from producing additional localizations and discusses separating localizable elements. The API and course-specific workflow above are design proposals, not W3C requirements or implemented behavior.

## Session format: options for discussion

The owner requested alternatives and trade-offs on 2026-10-08. None of the following defaults, durations, or session compositions is approved yet. Every option preserves the already accepted direct topic practice and optional new material (C-007).

| Organization | Benefit | Trade-off |
|---|---|---|
| Course-led default: resume the next small lesson, with separate practice/review access | Clear sequence; fewer planning choices | May not fit a visit motivated by one forgotten construction; flexible stopping is still needed |
| Learner-selected default: choose a topic, phrases, or review set each time | Direct control over today's need | More decisions; easy to overlook material that needs returning to |
| Recommended session with manual overrides | Quick start while retaining topic and practice-only control | Recommendations must explain their selection and avoid unpredictable mixing |

Recommended proposal: combine a suggested session with explicit course study, selected-topic/personal-phrase practice, and mixed review entry points. Personal phrases can be chosen separately or included where relevant, rather than requiring a separate mandatory daily routine.

Proposed flow:

1. Offer a suggested activity and resume access, plus direct topic selection. Show what the session covers and whether it includes anything new.
2. Optionally choose a rough time budget, for example 5, 15, or 30 minutes, or no limit. These are illustrative product choices, not evidence-backed optimal durations or mandatory countdowns. Preserve the previous preference instead of requiring setup every visit.
3. For a mixed session with new material enabled, combine a short return to earlier material, one small new concept, and practice of that concept. For review-only or focused practice, honor that choice and do not insert new theory or unrelated topics silently.
4. Permit a rule refresher when needed. Offer varied written tasks using familiar material, with explicit optional mixed contrasts. Detailed exercise balance belongs to the feedback and review discussion.
5. Allow stopping at any point, save completed attempts and the current draft, and offer a concise summary plus optional continuation. Ending early is not a failed session. Cross-device continuity remains a separate unresolved requirement.

An illustrative 15-minute mixed session might allocate roughly 3 minutes to earlier material, 4 to a small new concept, and 8 to written practice; reading speed and hints can change this. Never cut off an answer or require the estimate to be met. Detailed intervals, mastery rules, grading, and missed-day scheduling remain separate next topics.

Next focused question: whether this recommended-plus-manual structure fits the owner, before settling session length and composition in detail.

## Curriculum design documents

[CURRICULUM-A1-A2.md](CURRICULUM-A1-A2.md) owns the evolving detailed first-stage syllabus. Its initial block map and brief familiar-foundations approach are accepted under C-029. Detailed micro-lessons remain a working draft; this is not completed or validated coverage. Product scope and confirmed decisions remain in this document; current work remains in STATUS.md.

## Planned visual design and mobile usability stage

Accepted direction: C-025/C-026. Proposed execution sequence, to revisit after the main learning flows are settled:

1. Gather visual references and sketch two or three alternatives around the same representative lesson and review task. Do not choose a theme from appearance alone.
2. Compare course navigation, explanation, exercise entry, progressive hints, feedback, review selection, and the personal-phrase collection on both computer and phone.
3. Prototype the chosen direction and test its primary flows before final UI implementation. Keep findings and the chosen design alongside the canonical product docs when this stage begins.

A responsive browser application is the proposed initial delivery approach; native apps are not required by this request. Phone use must support actual practice, not just reading. Proposed checks: readable text, touch controls, on-screen keyboard and accented input, feedback visible while typing, resumable drafts, no hover-only controls, and alternatives to drag-only tasks. Verify on real mobile browsers in addition to viewport previews. Exact devices/browsers remain open.

Phone usability and progress sharing between devices are separate requirements: cross-device sync, hosting/reachability, offline behavior, and accounts are still undecided. Do not promise that a laptop-only local server or browser-local progress will automatically be available on a phone.

## Course horizon and staged delivery

Accepted sequence: beginner foundations including A1 -> strong A2 -> B1 -> B2. The owner may have mentioned C1 in an unclear dictated fragment; a clarification was asked. Beyond-B2 scope is unconfirmed and does not block the confirmed A2/B1/B2 plan. Do not assign C1 to the required roadmap without clarification.

Level labels guide the in-scope curriculum and assessment; speaking/conversation remains excluded, and listening-only scope is still open. Course completion must not be presented as demonstrated overall CEFR proficiency across unassessed skills. The [Council of Europe self-assessment grid](https://www.coe.int/en/web/portfolio/self%20-assessment-grid), read on 2026-10-07, distinguishes listening, reading, spoken interaction, spoken production, and writing.

Proposed design and delivery details, not yet a complete curriculum or authorized implementation plan:

| Stage | Design now | Deliver after implementation authorization |
|---|---|---|
| Beginner through A2 | Detailed objectives, prerequisites, modules, exercise coverage, review links, and practical reading/writing checks. | The first complete in-scope course segment, available for daily use and owner testing. |
| B1 | Map objectives, prerequisites, and the way earlier skills return in harder contexts. | Extend the same course after feedback on the A2 stage. |
| B2 | Map objectives, prerequisites, and later assessment/transfer goals. | Extend the course again after B1, preserving earlier practice access. |

Use one application and stable content/skill identifiers across stages. Adding B1/B2 should preserve progress, personal phrases, and review history, and should not require restarting the course. Later stages should be visibly planned/unavailable until implemented, not presented as completed content. No fixed lesson count or delivery date is selected.

Suggested first-stage product scope: the course path, selected-topic practice, hint-aware review, progress persistence, and personal-phrase workflows. Final feature allocation, including API/skill delivery timing, remains to be agreed before implementation.

Before authoring all A2 material, propose a small complete pilot module to test the learning loop and UI with the owner. This is early feedback, not a substitute for the requested full A2 stage or a claim of A2 readiness.

Proposed meaning of a strong A2 stage: cover the mapped in-scope A1/A2 objectives with reviewed lessons and sufficient varied practice; offer cumulative independent reading/writing tasks and delayed mixed review; distinguish independent answers from hints. A single successful quiz or completed lesson does not prove durable mastery. Product completeness and an individual learner's assessed proficiency are separate.

Use the [Instituto Cervantes Plan curricular index](https://cvc.cervantes.es/ensenanza/biblioteca_ELE/plan_curricular/indice.htm), read on 2026-10-07, as a source for Spanish-specific objectives/content inventories. It organizes objectives and language content by A1-A2, B1-B2, and C1-C2. Detailed mapping to this course is not yet done; do not infer that browsing the index establishes coverage. Author original course material and track source/content rights separately.

## Personal phrase collection

Accepted capture workflow under C-022:

- Course item: an explicit save-for-practice action preserves its reviewed wording and source context.
- Existing Spanish phrase: capture the phrase and optional context; check meaning and correctness before treating it as an answer model.
- Ukrainian intent: save a quick draft, then resolve it with the external assistant and store the checked Spanish expression. This path does not require embedded AI.

Use distinct draft/needs-review and ready-for-practice states. Exact validation responsibility and UI wording remain to be specified; a structurally valid record alone does not prove language correctness. These states do not measure learner mastery. Personal records remain outside public source control.

Practice under C-023 combines the saved phrase with appropriate variations using familiar vocabulary and grammar. Exact variation frequency and any manual mode control remain implementation/design details, not a blocker to the next product discussion. Checking responsibility will be resolved with the wider content-quality workflow.

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

## Deferred external-assistant integration plan

Status: user-requested planning direction, with the following technical design proposed by the assistant. Revisit after course discovery; do not implement an API, CLI, MCP server, or skill now.

### Intended experience

The learner opens an assistant chat and requests help with the current exercise or a focused practice set. With an installed connection, the assistant retrieves an explicit application context, explains or prepares the requested change, applies authorized supported operations, and verifies the visible result. Ordinary course use should continue independently of the assistant (proposed design).

The application owns progress, learning events, and content versions; chat history is not the learning database. Drafts and private learning records stay outside public source control.

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
2. Spanish of Spain and the A1-A2 outline/familiar-foundations direction are settled under C-028/C-029. Ukrainian-only initial localization and future expansion are settled under C-030/C-031. Next discuss the session-format options above. Continue detailed curriculum work in CURRICULUM-A1-A2.md; beyond-B2 clarification remains non-blocking.
3. Discuss how focused practice and mixed review should interact, and what "I have learned this" should change.
4. Define session duration and whether listening-only exercises belong in scope. Computer and phone use are required; exact environments and sync are open. Speaking remains excluded.
5. Resolve feedback, valid answer variants, hint attribution, uncertainty, missed days, storage, and any AI cost/privacy constraints.
6. Agree on curriculum and sample learning flows; run the planned visual-design comparison on computer and phone, then finalize acceptance criteria and implementation scope.
7. Revisit the deferred external-assistant plan with the settled domain model and concrete user workflows.

Discuss a small number of questions per turn. Answers may change the sequence. Do not treat suggested options as decisions.

### Remaining product decisions

- Personal phrase details: resolve checking responsibility with content quality and exact scheduling with review design. All three entry paths and the combined practice direction are settled under C-022/C-023.
- Curriculum detail: map practical abilities to the agreed A2 -> B1 -> B2 stages; clarify any beyond-B2 goal. Spanish of Spain and the brief familiar-foundations approach are settled; Ukrainian instruction with future localization is settled; detailed assessments remain open.
- Session flow: time available, focused versus mixed practice, new-material balance, and recovery after missed days without an unbounded mandatory backlog.
- Mastery and review control: what marking a skill learned changes, whether occasional checks continue, and how manual practice preferences interact with scheduling.
- Exercise feedback: valid alternative translations, typing/accents versus grammar errors, hint levels, and what the app does when a free-text answer cannot be judged reliably without AI.
- Content scope and quality: whether listening-only activities are included, curriculum sources and rights, linguistic review, and the distinction between a validated data structure and a correct teaching example.
- Product environment and continuity: computer and phone use are settled; local/hosted operation, supported browsers, offline expectations, progress backup/export, and cross-device sync remain open.
- Visual design: a comparison/prototyping stage is required; concepts and final UI direction are not selected.

These are open decisions, not a questionnaire to answer all at once. After resolving them, walk through one complete lesson and one return-to-practice session, then finalize acceptance criteria and the deferred integration design.

## Open boundaries

Beyond-B2 scope, detailed level mapping, and assessment thresholds; detailed localization pack validation/publication; supported computer/mobile browsers and cross-device continuity; session duration; listening-only exercises; source and rights of learning content; use alongside a teacher; progress storage and privacy; offline needs; AI/API usage and cost; accessibility; license; hosting; technology; review algorithm and mastery criteria. Ukrainian-only initial instruction with future localization, Spanish of Spain, the accepted A1-A2 outline and brief familiar-foundations approach, staged delivery through at least B2 with A2 first, computer/phone use, a later visual-design stage, and exclusion of conversation/speaking are settled.

## Reference inspected

On 2026-10-07, the existing JavaScript Learning Lab docs/REQUIREMENTS.md was read locally. REQ-007 calls for delayed review; REQ-033 distinguishes lesson states from understanding evidence. These are design references only and are not automatically adopted here. No claim is made about the current implementation satisfying those requirements.
