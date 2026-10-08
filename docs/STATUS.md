# Current status

Updated: 2026-10-08.

## Goal and phase

Collaboratively design a Spanish-learning course with persistent opportunities to revisit material. Discovery only; implementation is not authorized.

## Current work

- Recorded the owner's initiating requirements in docs/COURSE-DESIGN.md.
- Recorded initial review-loop proposals and the owner's subsequent acceptance of their general study/practice direction; detailed mechanics remain open.
- Recorded the follow-up requirements C-006 through C-013: beginner foundations, practice-only topic selection, written exercises, hint/error-informed repetition, tense contrasts, personal expressions, no conversation/speaking, and an open AI decision.
- The owner accepted the direction of skill-specific evidence, differentiated hints, tense contrasts, and personal phrase practice. Exact scheduling and feedback remain open; all three phrase entry paths are now settled under C-022.
- Recorded C-014 through C-016 and a deferred external-assistant plan in COURSE-DESIGN.md. The revised recommendation is direct application API access plus a skill; MCP is optional for a later client need. No connection or skill has been implemented.
- Recorded C-017 through C-021. The owner accepted recent-context selection, structured content via the API, and neutral assistance evidence; exact implementation and evidence weighting remain open. Removed MCP from the initial critical path after evaluating the simpler local workflow.
- Created the public repository predantsev/spanish-learning-lab and the Startups checkout. Bootstrap documentation is tracked by issue #1 and delivered through its pull request.
- No application, authored lesson corpus, runtime, or technical stack has been created or selected. A proposed A1-A2 curriculum draft now exists.
- Recorded C-022: save from course, add an existing Spanish phrase, and capture Ukrainian intent as a draft; all three are required for future implementation. Unchecked drafts must not enter practice as correct answer models.
- Recorded C-023: combine exact saved-phrase recall with appropriate construction variations using familiar material. The core personal-phrase topic is now settled.
- Recorded C-024: design through at least B2; deliver beginner-to-A2 first for owner testing, then B1 and B2. A possible C1 mention is pending clarification. Proposed an early pilot and continuity across stages; no implementation started.

- Recorded C-025/C-026/C-027: later visual-design exploration, computer and phone practice, and detailed A1-A2 planning now.
- Created docs/CURRICULUM-A1-A2.md with a proposed block map, review connections, first-block micro-lessons, and a later tense-module sketch. This is partial curriculum design, not completed content.

## Next conversation

Continue the A1-A2 draft one block at a time. A question about the main Spanish variety has been asked; the common foundation can proceed while it remains open. Discuss A1-01 and how familiar basics should be handled, then progressively expand the remaining blocks. Visual design is planned for a later dedicated stage. Integration implementation remains deferred. The possible C1 mention, listening-only scope, explanation/UI languages, and cross-device sync remain open; speaking is excluded.

## Decisions and boundaries

- Public visibility is explicitly authorized by the owner's 2026-10-07 request.
- Documentation and brainstorming precede implementation.
- C-014 records acceptance of the general practice design, not blanket approval of every technical detail. Other product options remain proposals until agreed.
- C-020 records acceptance of structured content, recent-context selection, and neutral assistance. C-021 asks for the simpler integration evaluation; API plus skill is now the recommendation, with execution/network access required and MCP optional.
- Beginner foundations, independent practice selection, written exercises, adaptation to hints/errors, and exclusion of conversation/speaking are settled. An external-assistant connection is planned for later; embedded AI remains undecided.
- Keep personal learning data out of this public repository.

## Verification

Documentation-only bootstrap; no application tests apply. On 2026-10-07, gh repo create --public returned the repository URL; git init and push established the local checkout and main; gh repo edit set main and branch deletion after merge; the branch-protection API returned required pull requests, enforced admin protection, and disabled force pushes/deletions. Final PR state remains available in the GitHub issue/PR record.

Follow-up design update: compared confirmed requirements against the owner's 2026-10-07 follow-up, removed conversation from the exercise proposals, and kept unsupported product/AI choices explicitly proposed. Checked grammar example terminology against the linked RAE tables. No implementation or learning-effectiveness validation is claimed.

External-assistant planning update: checked the official OpenAI skills/MCP documentation linked in COURSE-DESIGN.md. The integration pattern is documented; application connectivity, transport, assistant host support, and the full workflow remain unimplemented and unverified.

Content-extension planning update: consulted OWASP XSS Prevention and MDN iframe documentation, linked in COURSE-DESIGN.md. Recommend validated structured data rendered by supported components, rather than arbitrary HTML execution. This is a sourced design recommendation, not a completed security review or tested implementation. No database, renderer, API, or integration was built.

API/skill planning update: read official OpenAI plugin architecture guidance on skills with existing tools; command -v confirmed local curl and python3 availability. API plus skill is feasible in principle for this local environment, but the future application's endpoint, authentication, and actual connectivity remain unverified. Documentation only.

Personal-phrase capture update: recorded the owner's explicit approval of all three entry paths on 2026-10-07. Documentation only; no application feature is implemented.

Personal-phrase practice update: recorded the owner's approval of combined exact-phrase and construction-variation practice. No implementation; core phrase design is settled.

Staged-course planning update: recorded the owner request for A2-first delivery and a horizon of at least B2. Read Council of Europe skill-domain guidance and the Instituto Cervantes curriculum index; detailed curriculum mapping and proficiency validation have not been performed. No overall CEFR level is certified.

A1-A2 design start (2026-10-08): read Instituto Cervantes A1-A2 grammar and general objectives plus the curriculum index. The new syllabus records source sections and distinguishes the proposed teaching sequence from verified inventory contents. Detailed orthography/function/genre mapping and language review remain pending. No UI or mobile runtime was built.
