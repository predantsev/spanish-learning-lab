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

## Initial proposals — not approved

These are product ideas, not empirical claims about learning effectiveness or settled requirements.

| ID | Proposal | Example or unresolved detail |
|---|---|---|
| P-001 | A daily session combines due review, a small amount of new material, and targeted practice. | The learner's time budget and the balance remain open. |
| P-002 | Track specific skills separately from lesson completion. | Recognizing a word, recalling it without hints, and using it in a sentence could have separate evidence. |
| P-003 | Return to the same skill through varied prompts. | A verb could reappear in translation, sentence completion, listening, or a short conversation; supported modes remain open. |
| P-004 | Offer an explicit repeat-more control for troublesome material. | The learner can keep a skill in frequent practice even after correct answers. |
| P-005 | Use spaced follow-up checks after successful practice. | Intervals, failure behavior, and what happens after the learner marks something learned are undecided. No permanent-retention guarantee. |
| P-006 | Keep review manageable after missed days. | Explore a session limit, prioritization, and optional extra practice rather than mandatory completion of an unlimited backlog. |

Illustrative skill: choosing between ser and estar. A possible sequence is a short explanation, a guided exercise, independent production, and later use in a different situation. This does not establish the learner's level or actual difficulties.

## Discussion sequence

1. What is forgotten most often? Ask for two or three concrete examples: vocabulary, forms/rules, listening, or producing a sentence.
2. What practical situations and starting/target levels should the course cover? Which Spanish variety?
3. What should a normal session feel like: time available, device, willingness to type, listen, or speak?
4. What does "I have learned this" mean to the learner, and who controls review frequency? Should occasional checks continue?
5. How should explanations, hints, mistakes, missed days, and progress work?
6. Agree on the curriculum, sample lesson and review flows, acceptance criteria, and implementation scope.

Discuss a small number of questions per turn. Answers may change the sequence. Do not treat suggested options as decisions.

## Open boundaries

Entry/target level; Spanish variety; explanation/UI languages; desktop/mobile; session duration; speaking/listening; source and rights of learning content; use alongside a teacher; progress storage and privacy; offline needs; AI/API usage and cost; accessibility; license; hosting; technology; review algorithm and mastery criteria.

## Reference inspected

On 2026-10-07, the existing JavaScript Learning Lab docs/REQUIREMENTS.md was read locally. REQ-007 calls for delayed review; REQ-033 distinguishes lesson states from understanding evidence. These are design references only and are not automatically adopted here. No claim is made about the current implementation satisfying those requirements.
