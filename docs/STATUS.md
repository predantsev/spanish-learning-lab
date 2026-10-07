# Current status

Updated: 2026-10-07.

## Goal and phase

Collaboratively design a Spanish-learning course with persistent opportunities to revisit material. Discovery only; implementation is not authorized.

## Current work

- Recorded the owner's initiating requirements in docs/COURSE-DESIGN.md.
- Added initial review-loop proposals, explicitly unapproved.
- Recorded the follow-up requirements C-006 through C-013: beginner foundations, practice-only topic selection, written exercises, hint/error-informed repetition, tense contrasts, personal expressions, no conversation/speaking, and an open AI decision.
- Proposed skill-specific evidence and a private phrase collection. Exact scheduling, feedback, and AI architecture remain unapproved.
- Created the public repository predantsev/spanish-learning-lab and the Startups checkout. Bootstrap documentation is tracked by issue #1 and delivered through its pull request.
- No application, curriculum corpus, runtime, or technical stack has been created or selected.

## Next conversation

Discuss how personally useful phrases enter the system, especially when the learner does not know their Spanish wording. Then refine focused practice versus mixed review and the meaning of marking a skill learned. Do not revisit whether conversation should be included: it is excluded.

## Decisions and boundaries

- Public visibility is explicitly authorized by the owner's 2026-10-07 request.
- Documentation and brainstorming precede implementation.
- Product options in COURSE-DESIGN.md remain proposals until the owner agrees.
- The owner's follow-up resolves beginner foundations, independent practice selection, written exercises, adaptation to hints/errors, and exclusion of conversation/speaking. AI is still undecided.
- Keep personal learning data out of this public repository.

## Verification

Documentation-only bootstrap; no application tests apply. On 2026-10-07, gh repo create --public returned the repository URL; git init and push established the local checkout and main; gh repo edit set main and branch deletion after merge; the branch-protection API returned required pull requests, enforced admin protection, and disabled force pushes/deletions. Final PR state remains available in the GitHub issue/PR record.

Follow-up design update: compared confirmed requirements against the owner's 2026-10-07 follow-up, removed conversation from the exercise proposals, and kept unsupported product/AI choices explicitly proposed. Checked grammar example terminology against the linked RAE tables. No implementation or learning-effectiveness validation is claimed.
