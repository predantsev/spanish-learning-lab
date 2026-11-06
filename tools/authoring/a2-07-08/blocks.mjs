// Block manifests for build.mjs: lessons in course order; clips and materials are collected from
// the lesson modules (each module may export `clips` and `materials`).
import a207l1 from './a2-07-l1.mjs';
import a207l2 from './a2-07-l2.mjs';
import a207l3 from './a2-07-l3.mjs';
import a207l4 from './a2-07-l4.mjs';
import a207l5 from './a2-07-l5.mjs';
import a207l6 from './a2-07-l6.mjs';
import a207l7 from './a2-07-l7.mjs';

const block = (blockId, lessons, extraMaterials = []) => ({
  blockId,
  lessons,
  clips: lessons.flatMap((l) => l.clips ?? []),
  materials: [...lessons.flatMap((l) => l.materials ?? []), ...extraMaterials],
});

export const BLOCKS = [block('A2-07', [a207l1, a207l2, a207l3, a207l4, a207l5, a207l6, a207l7])];
