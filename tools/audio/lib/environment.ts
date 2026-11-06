// Records the actual tool environment (captured programmatically, never typed by hand).
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { run } from './exec.ts';
import { FFMPEG, FFPROBE, toolVersion } from './ffmpeg.ts';
import { type EngineContext, macosVersion, piperDir } from './voices.ts';

export interface SayVoiceLine {
  readonly name: string;
  readonly locale: string;
  readonly sample: string;
}

/** Parses `say -v '?'` lines: "<name> <locale> # <sample>" (names may contain spaces/parentheses). */
export function parseSayVoices(output: string): SayVoiceLine[] {
  const out: SayVoiceLine[] = [];
  for (const line of output.split('\n')) {
    const hash = line.indexOf('#');
    if (hash < 0) continue;
    const left = line.slice(0, hash).trim();
    const at = left.lastIndexOf(' ');
    if (at < 0) continue;
    out.push({ name: left.slice(0, at).trim(), locale: left.slice(at + 1), sample: line.slice(hash + 1).trim() });
  }
  return out;
}

export async function listSayVoices(locale?: string): Promise<SayVoiceLine[]> {
  const result = await run('say', ['-v', '?']);
  const all = parseSayVoices(result.stdout.toString('utf8'));
  return locale ? all.filter((v) => v.locale === locale) : all;
}

export async function captureEnvironment(ctx: EngineContext): Promise<Record<string, unknown>> {
  const env: Record<string, unknown> = {
    os: await macosVersion(),
    ffmpeg: await toolVersion(FFMPEG),
    ffprobe: await toolVersion(FFPROBE),
    node: process.version,
    sayVoicesEsES: (await listSayVoices('es_ES')).map((v) => `${v.name} (${v.locale})`),
  };
  const piperPython = join(piperDir(ctx), 'venv', 'bin', 'python');
  if (existsSync(piperPython)) {
    const py = await run(piperPython, ['--version']);
    env.piperPython = (py.stdout.toString('utf8') || py.stderr).trim();
  }
  return env;
}
