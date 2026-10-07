# Course design

Updated: 2026-10-07. This is a discovery document, not an approved implementation specification.

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
| C-006 | Start the course from beginner foundations even for a returning learner. The final target level remains open. |
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

## Design directions and unresolved details

The owner accepted the study/practice direction under C-014. Rows below retain candidate details; they are not empirical effectiveness claims or fully approved specifications. In particular P-009 capture mechanics and P-010 embedded AI remain undecided.

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
| P-009 | Maintain a private personal phrase collection with an explicit add action. | Save intended meaning, a checked Spanish expression, and relevant context; practice both the phrase and variations of its reusable construction. Do not turn an unchecked attempt into a memorization target. |
| P-010 | Explore a deterministic core with optional external assistant support. | See the deferred integration plan below. Embedded AI grading is a separate undecided feature; external help does not by itself solve arbitrary free-text grading during independent use. |

## Deferred external-assistant integration plan

Status: user-requested planning direction, with the following technical design proposed by the assistant. Revisit after course discovery; do not implement an API, CLI, MCP server, or skill now.

### Intended experience

The learner opens an assistant chat and requests help with the current exercise or a focused practice set. With an installed connection, the assistant retrieves an explicit application context, explains or prepares the requested change, applies authorized supported operations, and verifies the visible result. Ordinary course use should continue independently of the assistant (proposed design).

The application owns progress, learning events, and content versions; chat history is not the learning database. Drafts and private learning records stay outside public source control.

### Proposed connection

- Application API: explicit reads and bounded domain actions, sharing the same validation and persistence as the UI. Avoid arbitrary database editing or shell execution through this learning API.
- MCP adapter: expose useful API operations as assistant tools. A CLI could be a thin optional client of the same operations; it is not a second required implementation.
- Skill: explain the topic/skill model, how to fetch fresh context, how to distinguish assistance from independent evidence, and how to verify changes. Instructions alone do not create connectivity or grant access.
- Context: identify the chosen application session/tab, topic, exercise, selected fragment when available, current attempt, requested hint state, relevant recent evidence, and revision/timestamp. Multiple tabs and unsaved attempts need explicit handling; do not assume a global "currently open" page.
- Access: authenticated, limited to the selected learner/session; expose only the context needed for the requested help. A same-machine connection is an initial candidate, not an approved hosting choice. Recheck host/client support when implementing; an arbitrary cloud chat cannot be assumed to reach a local API.

### Proposed increments and acceptance checks

1. Define the application domain and minimal read/action contract during course implementation. Keep integration details deferred until the course scope is agreed.
2. Implement a read-only connection: retrieve the intended open exercise and relevant attempt/hint history. Verify selection across two open tabs and refresh stale context.
3. Add a bounded action: create and display a focused practice set from reviewed content, including only requested or already studied skills. Verify the result in the UI and ensure retries do not create duplicate sets.
4. Add supported personal-content operations: draft/import exercises or phrases, validate them, retain provenance, and show changes with undo. AI-generated material is not automatically a reviewed answer key. Exact publication/review policy remains open.
5. Add the skill and test the full request-to-UI workflow. Record external hints/answer reveals as assisted work through a supported mechanism; explanations in chat must not silently become independent mastery. If assistance cannot be captured reliably, mark the evidence incomplete instead of fabricating certainty.

For writes, check the relevant revision, preserve current attempts and progress, record the operation, and verify persisted state. Avoid repeated confirmations for clear, authorized, reversible actions; ask only for genuinely ambiguous scope or consequential replacement/deletion.

### What "change the application" can mean

Changing a practice selection, preferences, or supported personal content belongs in the domain API. Changing layout behavior, adding new exercise types, or modifying algorithms remains ordinary repository development with review and tests. A learning API does not automatically grant code-editing capability or authorize implementation.

### Decisions intentionally deferred

Exact transport and deployment; supported assistant hosts; endpoint/tool schemas; authentication; whether a CLI is useful; phrase capture; validation of generated content; external-assistance recording; and any embedded AI. No provider, model, price, or always-on background agent is selected.

### Feasibility source

On 2026-10-07, [official OpenAI documentation on skills and MCP](https://developers.openai.com/plugins/concepts/skills) was opened and read: MCP provides live information and controlled actions; skills describe workflows around those tools. This supports the proposed integration pattern, not an already-tested connection to this application. No application connection exists yet.

## Proposed evidence behavior

These are design candidates, not implemented or approved rules:

- Correct without help: evidence for that assessed skill and task type; later independent checks still matter.
- Correct after a targeted hint: assisted evidence for the hinted skill, not identical to independent recall.
- Full answer revealed: a learning opportunity, not a passed recall check.
- An incorrect form in an otherwise correct sentence: assess the target locally; do not penalize every skill in the sentence.
- Ambiguous free-text answer: allow valid alternatives, explicit uncertainty, and a correction/review path; never equate failure to match one reference string with a proven language error.
- Previously studied topic: eligible for practice, not automatically mastered.

Illustrative grammar reference: pretérito perfecto compuesto uses present-tense haber plus a participle; regular participles include -ado and -ido, with irregular forms such as hecho and dicho. This terminology was checked against [RAE conjugation tables](https://www.rae.es/buen-uso-espa%C3%B1ol/conjugaci%C3%B3n-espa%C3%B1ola) on 2026-10-07. These are synthetic curriculum examples, not learner performance records.

Illustrative skill: choosing between ser and estar. A possible sequence is a short explanation, a guided exercise, independent production, and later use in a different situation. This does not establish the learner's level or actual difficulties.

## Discussion sequence

1. Resolve how personal phrases enter the course: user-provided Spanish, a phrase written in the explanation language, selected lesson examples, or a combination. This informs the AI discussion without choosing a provider or model.
2. Discuss how focused practice and mixed review should interact, and what "I have learned this" should change.
3. Define target level, practical situations, Spanish variety, explanation/UI languages, and treatment of familiar foundations.
4. Define session duration, device, and whether listening-only exercises belong in scope. Speaking remains excluded.
5. Resolve feedback, valid answer variants, hint attribution, uncertainty, missed days, storage, and any AI cost/privacy constraints.
6. Agree on curriculum, sample lesson and review flows, acceptance criteria, and implementation scope.
7. Revisit the deferred external-assistant plan with the settled domain model and concrete user workflows.

Discuss a small number of questions per turn. Answers may change the sequence. Do not treat suggested options as decisions.

## Open boundaries

Target level and handling familiar foundations; Spanish variety; explanation/UI languages; desktop/mobile; session duration; listening-only exercises; source and rights of learning content; use alongside a teacher; progress storage and privacy; offline needs; AI/API usage and cost; accessibility; license; hosting; technology; review algorithm and mastery criteria. Beginner foundations and exclusion of conversation/speaking are settled.

## Reference inspected

On 2026-10-07, the existing JavaScript Learning Lab docs/REQUIREMENTS.md was read locally. REQ-007 calls for delayed review; REQ-033 distinguishes lesson states from understanding evidence. These are design references only and are not automatically adopted here. No claim is made about the current implementation satisfying those requirements.
