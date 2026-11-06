// release:check logic on a small synthetic release folder (the real 200+ MB build is exercised manually and
// recorded in the report): manifest integrity, unexpected/forbidden files, placeholder gating, `sll status` smoke.
import { describe, expect, it } from 'vitest';
import { appendFileSync, chmodSync, cpSync, mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe as describeEntry, walk, type ReleaseManifest } from '../../tools/release/build.ts';
import { checkRelease } from '../../tools/release/check.ts';
import { REPO } from './launcher-helpers.ts';

function fakeRelease(opts: { placeholder?: boolean } = {}): { dir: string; folder: string; writeManifest: () => void } {
  const dir = mkdtempSync(join(tmpdir(), 'sll-rel-'));
  const folder = join(dir, 'Spanish Learning Lab');
  mkdirSync(join(folder, 'runtime', 'node', 'bin'), { recursive: true });
  // A tiny wrapper standing in for the bundled binary: it execs the pinned test runtime.
  writeFileSync(join(folder, 'runtime', 'node', 'bin', 'node'), `#!/bin/sh\nexec '${process.execPath}' "$@"\n`);
  chmodSync(join(folder, 'runtime', 'node', 'bin', 'node'), 0o755);
  writeFileSync(join(folder, 'runtime', 'node', 'LICENSE'), 'synthetic license text\n');
  writeFileSync(join(folder, 'Start.command'), '#!/bin/sh\n');
  chmodSync(join(folder, 'Start.command'), 0o755);
  writeFileSync(join(folder, 'README-UK.md'), '# synthetic\n');
  writeFileSync(join(folder, 'THIRD-PARTY-NOTICES.txt'), 'synthetic\n');
  cpSync(join(REPO, 'bin'), join(folder, 'app', 'bin'), { recursive: true });
  mkdirSync(join(folder, 'app', 'dist', 'web'), { recursive: true });
  writeFileSync(join(folder, 'app', 'dist', 'web', 'index.html'), '<!doctype html>\n');
  mkdirSync(join(folder, 'app', 'content', 'pack'), { recursive: true });
  writeFileSync(join(folder, 'app', 'content', 'pack', 'pack.json'), '{"packId":"sll-synthetic","version":"0.0.0","synthetic":true}\n');
  const writeManifest = (): void => {
    const manifest: ReleaseManifest = {
      schemaVersion: 1,
      name: 'Spanish Learning Lab',
      appVersion: '0.1.0',
      folder: 'Spanish Learning Lab',
      builtAt: new Date().toISOString(),
      gitCommit: null,
      gitDirty: false,
      node: { version: process.version, platform: 'darwin', arch: 'arm64', sha256: '0'.repeat(64) },
      npm: { version: '11.19.1' },
      lockfileSha256: '0'.repeat(64),
      pack: { placeholder: opts.placeholder === true, packId: 'sll-synthetic', version: '0.0.0', manifestSha256: null, treeSha256: '0'.repeat(64) },
      web: { placeholder: false, treeSha256: '0'.repeat(64) },
      files: walk(folder).map((rel) => describeEntry(folder, rel)),
    };
    writeFileSync(join(dir, 'release-manifest.json'), JSON.stringify(manifest));
  };
  writeManifest();
  return { dir, folder, writeManifest };
}

describe('release check', () => {
  it('passes a complete release and runs the sll status smoke in a throwaway home', () => {
    const r = fakeRelease();
    expect(checkRelease(r.dir, { allowPlaceholders: false })).toEqual({ errors: [], warnings: [] });
  });

  it('detects changed, unexpected and missing files', () => {
    const r = fakeRelease();
    appendFileSync(join(r.folder, 'app', 'bin', 'sll.mjs'), '\n// tampered\n');
    writeFileSync(join(r.folder, 'app', 'extra.txt'), 'x');
    const { errors } = checkRelease(r.dir, { allowPlaceholders: false });
    expect(errors).toContain('content changed: app/bin/sll.mjs');
    expect(errors).toContain('unexpected file: app/extra.txt');
  });

  it('refuses private runtime material even when the manifest lists it', () => {
    const r = fakeRelease();
    writeFileSync(join(r.folder, 'app', 'runtime.json'), '{}');
    writeFileSync(join(r.folder, 'app', 'profile.sqlite'), 'x');
    r.writeManifest();
    const { errors } = checkRelease(r.dir, { allowPlaceholders: false });
    expect(errors).toContain('forbidden private/runtime file in release: app/runtime.json');
    expect(errors).toContain('forbidden private/runtime file in release: app/profile.sqlite');
  });

  it('fails placeholders unless explicitly allowed', () => {
    const r = fakeRelease({ placeholder: true });
    expect(checkRelease(r.dir, { allowPlaceholders: false }).errors).toEqual(['content pack (--pack) is a PLACEHOLDER: not a usable owner release']);
    const allowed = checkRelease(r.dir, { allowPlaceholders: true });
    expect(allowed.errors).toEqual([]);
    expect(allowed.warnings).toHaveLength(1);
  });
});
