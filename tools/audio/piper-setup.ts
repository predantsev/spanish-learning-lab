// Recreates the project-local Piper candidate under work/tools/piper (no global install, no system change).
//
//   node tools/audio/piper-setup.ts [--python /opt/homebrew/bin/python3.13] [--provenance-out <json>]
//
// 1. python3.13 -m venv work/tools/piper/venv (skipped when present)
// 2. pip install --only-binary=:all: --require-hashes -r tools/audio/piper-requirements.txt --report …
// 3. model/config/cards from huggingface.co/rhasspy/piper-voices at the pinned revision, each verified
//    against tools/audio/piper-pins.json (sha256 + bytes); a mismatch deletes the file and fails.
// 4. smoke test: one short synthesis through tools/audio/piper_synth.py.
// --provenance-out writes every wheel URL + sha256 (from the pip report) and every model file hash.
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { one, parseArgs } from './lib/args.ts';
import { runChecked } from './lib/exec.ts';
import { probe } from './lib/ffmpeg.ts';
import { sha256File, sha256Hex } from './lib/hash.ts';
import { piperPackageDir } from './lib/voices.ts';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const PIPER = join(ROOT, 'work', 'tools', 'piper');

interface PinnedFile {
  readonly path: string;
  readonly saveAs: string;
  readonly sha256: string;
  readonly bytes: number;
}

interface Pins {
  readonly python: string;
  readonly requirements: string;
  readonly pipFlags: string[];
  readonly huggingFace: { readonly repo: string; readonly revision: string; readonly files: PinnedFile[] };
}

function hfUrl(pins: Pins, file: PinnedFile): string {
  return `https://huggingface.co/${pins.huggingFace.repo}/resolve/${pins.huggingFace.revision}/${file.path}`;
}

async function ensureModelFile(pins: Pins, file: PinnedFile, dir: string): Promise<'present' | 'downloaded'> {
  const dest = join(dir, file.saveAs);
  if (existsSync(dest) && statSync(dest).size === file.bytes && sha256File(dest) === file.sha256) return 'present';
  const response = await fetch(hfUrl(pins, file), { redirect: 'follow' });
  if (!response.ok) throw new Error(`download failed ${response.status} for ${file.path}`);
  const bytes = new Uint8Array(await response.arrayBuffer());
  const digest = sha256Hex(bytes);
  if (bytes.byteLength !== file.bytes || digest !== file.sha256) {
    throw new Error(`hash mismatch for ${file.path}: got ${digest} (${bytes.byteLength} B), pinned ${file.sha256} (${file.bytes} B)`);
  }
  writeFileSync(dest, bytes);
  return 'downloaded';
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const pins = JSON.parse(readFileSync(join(ROOT, 'tools', 'audio', 'piper-pins.json'), 'utf8')) as Pins;
  const python = one(args, 'python') ?? `/opt/homebrew/bin/python${pins.python}`;
  const venv = join(PIPER, 'venv');
  mkdirSync(join(PIPER, 'model'), { recursive: true });

  const pyVersion = (await runChecked(python, ['--version'])).stdout.toString('utf8').trim();
  if (!pyVersion.startsWith(`Python ${pins.python}.`)) throw new Error(`${python} is ${pyVersion}; need Python ${pins.python}.x`);
  if (!existsSync(join(venv, 'bin', 'python'))) {
    await runChecked(python, ['-m', 'venv', venv]);
    console.log(`venv created: ${venv}`);
  }
  // The report comes from a full dry-run resolution so it lists every wheel even when already installed.
  const report = join(PIPER, 'pip-resolution-report.json');
  const pip = join(venv, 'bin', 'pip');
  const requirements = join(ROOT, pins.requirements);
  await runChecked(pip, ['install', ...pins.pipFlags, '--dry-run', '--ignore-installed', '-r', requirements, '--report', report]);
  await runChecked(pip, ['install', ...pins.pipFlags, '-r', requirements]);
  console.log(`pip install verified against ${pins.requirements} (--require-hashes)`);

  const modelDir = join(PIPER, 'model');
  for (const file of pins.huggingFace.files) {
    const state = await ensureModelFile(pins, file, modelDir);
    console.log(`${state.padEnd(10)} ${file.saveAs} sha256 ${file.sha256}`);
  }

  const tmp = mkdtempSync(join(PIPER, '.smoke-'));
  try {
    writeFileSync(join(tmp, 'in.txt'), 'Hola, buenos días.\n', 'utf8');
    await runChecked(
      join(venv, 'bin', 'python'),
      ['-I', join(ROOT, 'tools', 'audio', 'piper_synth.py'), '--model', join(modelDir, 'es_ES-davefx-medium.onnx'), '--input', join(tmp, 'in.txt'), '--output', join(tmp, 'out.wav')],
      { cwd: piperPackageDir({ root: ROOT }) },
    );
    const info = await probe(join(tmp, 'out.wav'));
    if (!info.ok) throw new Error(`smoke test produced no playable audio: ${info.errors.join('; ')}`);
    console.log(`smoke test ok: ${info.codec} ${info.sampleRate} Hz ${info.channels} ch ${info.durationMs} ms`);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }

  const out = one(args, 'provenance-out');
  if (out) {
    const pip = JSON.parse(readFileSync(report, 'utf8')) as {
      pip_version: string;
      environment: Record<string, string>;
      install: Array<{ metadata: { name: string; version: string; license?: string; license_expression?: string }; download_info: { url: string; archive_info?: { hashes?: Record<string, string> } } }>;
    };
    const doc = {
      schemaVersion: 1,
      kind: 'sll-piper-provenance',
      generatedAt: new Date().toISOString(),
      python: pyVersion,
      pip: pip.pip_version,
      platform: { sys_platform: pip.environment.sys_platform, platform_machine: pip.environment.platform_machine, python_full_version: pip.environment.python_full_version },
      wheels: pip.install.map((i) => ({
        name: i.metadata.name,
        version: i.metadata.version,
        license: i.metadata.license_expression ?? i.metadata.license ?? null,
        url: i.download_info.url,
        sha256: i.download_info.archive_info?.hashes?.sha256 ?? null,
      })),
      model: pins.huggingFace.files.map((f) => ({ url: hfUrl(pins, f), file: f.saveAs, sha256: sha256File(join(modelDir, f.saveAs)), bytes: statSync(join(modelDir, f.saveAs)).size })),
      licenseFiles: [
        { file: 'piper_tts-1.8.0.dist-info/licenses/COPYING', sha256: sha256File(join(dirname(piperPackageDir({ root: ROOT })), 'piper_tts-1.8.0.dist-info', 'licenses', 'COPYING')) },
        { file: 'piper_tts-1.8.0.dist-info/licenses/licenses/LICENSE.g2pW-Apache-2.0', sha256: sha256File(join(dirname(piperPackageDir({ root: ROOT })), 'piper_tts-1.8.0.dist-info', 'licenses', 'licenses', 'LICENSE.g2pW-Apache-2.0')) },
      ],
    };
    mkdirSync(dirname(resolve(out)), { recursive: true });
    writeFileSync(resolve(out), `${JSON.stringify(doc, null, 2)}\n`, 'utf8');
    console.log(`provenance -> ${out}`);
  }
}

main().catch((error: unknown) => {
  console.error((error as Error).message);
  process.exit(1);
});
