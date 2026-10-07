# Current status

Updated: 2026-10-07.

## Goal and phase

Collaboratively design a Spanish-learning course with persistent opportunities to revisit material. Discovery only; implementation is not authorized.

## Current work

- Recorded the owner's initiating requirements in docs/COURSE-DESIGN.md.
- Recorded initial review-loop proposals and the owner's subsequent acceptance of their general study/practice direction; detailed mechanics remain open.
- Recorded the follow-up requirements C-006 through C-013: beginner foundations, practice-only topic selection, written exercises, hint/error-informed repetition, tense contrasts, personal expressions, no conversation/speaking, and an open AI decision.
- The owner accepted the direction of skill-specific evidence, differentiated hints, tense contrasts, and personal phrase practice. Exact scheduling, feedback, and phrase capture remain open.
- Recorded C-014 through C-016 and a deferred external-assistant plan in COURSE-DESIGN.md: application API preferred, MCP adapter and skill proposed, read context first and then bounded actions. No connection or skill has been implemented.
- Created the public repository predantsev/spanish-learning-lab and the Startups checkout. Bootstrap documentation is tracked by issue #1 and delivered through its pull request.
- No application, curriculum corpus, runtime, or technical stack has been created or selected.

## Next conversation

The external-assistant idea is sufficiently clear to record; detailed integration work is parked until the remaining course discussion is complete. Next, gradually discuss how personally useful phrases enter the system, especially when the learner does not know their Spanish wording; do not treat this as decided. Then refine focused practice versus mixed review and the meaning of marking a skill learned. Conversation remains excluded.

## Decisions and boundaries

- Public visibility is explicitly authorized by the owner's 2026-10-07 request.
- Documentation and brainstorming precede implementation.
- C-014 records acceptance of the general practice design, not blanket approval of every technical detail. Other product options remain proposals until agreed.
- Beginner foundations, independent practice selection, written exercises, adaptation to hints/errors, and exclusion of conversation/speaking are settled. An external-assistant connection is planned for later; embedded AI remains undecided.
- Keep personal learning data out of this public repository.

## Verification

Documentation-only bootstrap; no application tests apply. On 2026-10-07, gh repo create --public returned the repository URL; git init and push established the local checkout and main; gh repo edit set main and branch deletion after merge; the branch-protection API returned required pull requests, enforced admin protection, and disabled force pushes/deletions. Final PR state remains available in the GitHub issue/PR record.

Follow-up design update: compared confirmed requirements against the owner's 2026-10-07 follow-up, removed conversation from the exercise proposals, and kept unsupported product/AI choices explicitly proposed. Checked grammar example terminology against the linked RAE tables. No implementation or learning-effectiveness validation is claimed.

External-assistant planning update: checked the official OpenAI skills/MCP documentation linked in COURSE-DESIGN.md. The integration pattern is documented; application connectivity, transport, assistant host support, and the full workflow remain unimplemented and unverified.
