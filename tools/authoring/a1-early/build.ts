// Writes the A1-01 … A1-03 lesson, task, clip and material files from the hand-authored units.
//   node tools/authoring/a1-early/build.ts
// Output is concrete JSON under content/source/ and is committed. Every registered unit is rebuilt;
// unchanged files are not rewritten and statuses of unchanged entities are preserved (see lib.ts).
import { writeUnits } from './lib.ts';
import type { Unit } from './lib.ts';
import { unit as a101l1 } from './units/A1-01-L1.ts';
import { unit as a101l2 } from './units/A1-01-L2.ts';
import { unit as a101l3 } from './units/A1-01-L3.ts';
import { unit as a101c1 } from './units/A1-01-C1.ts';
import { unit as a102l1 } from './units/A1-02-L1.ts';
import { unit as a102l2 } from './units/A1-02-L2.ts';
import { unit as a102l3 } from './units/A1-02-L3.ts';
import { unit as a102l4 } from './units/A1-02-L4.ts';
import { unit as a102l5 } from './units/A1-02-L5.ts';
import { unit as a102c1 } from './units/A1-02-C1.ts';
import { unit as a103l1 } from './units/A1-03-L1.ts';
import { unit as a103l2 } from './units/A1-03-L2.ts';
import { unit as a103l3 } from './units/A1-03-L3.ts';
import { unit as a103l4 } from './units/A1-03-L4.ts';
import { unit as a103l5 } from './units/A1-03-L5.ts';

export const UNITS: Unit[] = [a101l1, a101l2, a101l3, a101c1, a102l1, a102l2, a102l3, a102l4, a102l5, a102c1, a103l1, a103l2, a103l3, a103l4, a103l5];

for (const s of writeUnits(UNITS)) console.log(`${s.changed ? 'wrote' : 'same '} ${s.file} (${s.entities})`);
