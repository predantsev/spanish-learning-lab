// The installer's pack-format primitives must match the content tooling that produces real packs
// (tools/content/canonical.ts + load.ts entityHash/stripStatus semantics used by tools/content/pack.ts).
import { describe, expect, it } from 'vitest';
import { canonicalJson as toolCanonical, canonicalSha256, revisionId as toolRevisionId } from '../../tools/content/canonical.ts';
import { canonicalJson, deriveRevisionId, entitySha256 } from '../../apps/server/src/content/pack-format.ts';
import { syntheticEntities } from '../fixtures/pack-synthetic/entities.ts';

describe('pack format parity with tools/content', () => {
  it('canonical JSON, entity sha256 and revision ids are byte-identical for every fixture entity', () => {
    const e = syntheticEntities();
    const all: Array<[string, any, string]> = [
      ...e.lessons.map((b) => ['lesson', b, b.id] as [string, any, string]),
      ...e.tasks.map((b) => ['task', b, b.id] as [string, any, string]),
      ...e.skills.map((b) => ['skill', b, b.skillId] as [string, any, string]),
      ...e.clips.map((b) => ['clip', b, b.id] as [string, any, string]),
      ...e.phrases.map((b) => ['phrase', b, b.id] as [string, any, string]),
      ...e.collections.map((b) => ['collection', b, b.id] as [string, any, string]),
      ...e.materials.map((b) => ['material', b, b.id] as [string, any, string]),
    ];
    expect(all.length).toBeGreaterThan(30);
    for (const [kind, raw, id] of all) {
      const { reviewStatus: _s, ...body } = raw;
      expect(canonicalJson(body)).toBe(toolCanonical(body));
      expect(entitySha256(body)).toBe(canonicalSha256(body));
      expect(deriveRevisionId(kind, id, body)).toBe(toolRevisionId(kind, id, body));
    }
  });
});
