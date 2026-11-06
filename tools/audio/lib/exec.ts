// Child-process wrapper: argument arrays only, never a shell string.
import { spawn } from 'node:child_process';

export interface RunResult {
  readonly code: number;
  readonly stdout: Buffer;
  readonly stderr: string;
}

export interface RunOptions {
  readonly cwd?: string;
  readonly env?: NodeJS.ProcessEnv;
  /** Upper bound for captured stdout bytes (decoded PCM can be large). */
  readonly maxStdoutBytes?: number;
}

/** Runs `cmd args…` without a shell; resolves with the exit code (non-zero is not an exception). */
export function run(cmd: string, args: readonly string[], options: RunOptions = {}): Promise<RunResult> {
  const maxStdout = options.maxStdoutBytes ?? 256 * 1024 * 1024;
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, [...args], {
      cwd: options.cwd,
      env: options.env ?? process.env,
      shell: false,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    const out: Buffer[] = [];
    let outBytes = 0;
    let err = '';
    child.stdout.on('data', (chunk: Buffer) => {
      outBytes += chunk.length;
      if (outBytes > maxStdout) {
        child.kill('SIGKILL');
        reject(new Error(`${cmd}: stdout exceeded ${maxStdout} bytes`));
        return;
      }
      out.push(chunk);
    });
    child.stderr.setEncoding('utf8');
    child.stderr.on('data', (chunk: string) => {
      err += chunk;
    });
    child.on('error', reject);
    child.on('close', (code, signal) => {
      resolve({ code: code ?? (signal ? 128 : 1), stdout: Buffer.concat(out), stderr: err });
    });
  });
}

/** Like run(), but throws with the stderr tail when the exit code is not 0. */
export async function runChecked(cmd: string, args: readonly string[], options: RunOptions = {}): Promise<RunResult> {
  const result = await run(cmd, args, options);
  if (result.code !== 0) {
    const tail = result.stderr.trim().split('\n').slice(-8).join('\n');
    throw new Error(`${cmd} exited with ${result.code}: ${tail}`);
  }
  return result;
}

/** True when `cmd` can be spawned (used to skip real-binary tests on machines without it). */
export async function commandExists(cmd: string, probeArgs: readonly string[] = ['-version']): Promise<boolean> {
  try {
    await run(cmd, probeArgs);
    return true;
  } catch {
    return false;
  }
}
