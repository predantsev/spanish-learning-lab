// Block manifests for build.mjs: lessons in course order; clips and materials are collected from
// the lesson modules (each module may export `clips` and `materials`).
import a207l1 from './a2-07-l1.mjs';
import a207l2 from './a2-07-l2.mjs';
import a207l3 from './a2-07-l3.mjs';
import a207l4 from './a2-07-l4.mjs';
import a207l5 from './a2-07-l5.mjs';
import a207l6 from './a2-07-l6.mjs';
import a207l7 from './a2-07-l7.mjs';
import a207l8 from './a2-07-l8.mjs';
import a207c1 from './a2-07-c1.mjs';
import a208l1 from './a2-08-l1.mjs';
import a208l2 from './a2-08-l2.mjs';
import a208l3 from './a2-08-l3.mjs';
import a208l4 from './a2-08-l4.mjs';

const block = (blockId, lessons, extraMaterials = []) => ({
  blockId,
  lessons,
  clips: lessons.flatMap((l) => l.clips ?? []),
  materials: [...lessons.flatMap((l) => l.materials ?? []), ...extraMaterials],
});

export const BLOCKS = [
  block('A2-07', [a207l1, a207l2, a207l3, a207l4, a207l5, a207l6, a207l7, a207l8, a207c1]),
  block('A2-08', [a208l1, a208l2, a208l3, a208l4]),
];
