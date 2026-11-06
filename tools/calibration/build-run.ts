// Assembles one reviewer run directory so that both review directions receive byte-identical input.
//   <run>/packet/packet.json   exact copy of the packet (the reviewer's working directory contains only this file)
//   <run>/prompt.txt           prompt-as-sent: reviewer prompt template followed by the packet JSON
//   <run>/output-schema.json   strict JSON schema for the reviewer's final answer
//   <run>/input-manifest.json  SHA-256 and sizes of the three inputs
// Usage: node tools/calibration/build-run.ts <packet.json> <prompt-template.md> <output-schema.json> <run-dir>
import { createHash } from 'node:crypto';
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';
import { validatePacket } from './validate-cases.ts';

export function sha256(data: Buffer | string): string {
  return createHash('sha256').update(data).digest('hex');
}

export function buildPrompt(template: Buffer, packet: Buffer): Buffer {
  const head = template.toString('utf8').replace(/\s+$/, '');
  return Buffer.from(`${head}\n\n${packet.toString('utf8').replace(/\s+$/, '')}\n`, 'utf8');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [packetPath, templatePath, schemaPath, runArg] = process.argv.slice(2);
  if (!packetPath || !templatePath || !schemaPath || !runArg) {
    console.error('usage: build-run.ts <packet.json> <prompt-template.md> <output-schema.json> <run-dir>');
    process.exit(2);
  }
  const run = resolve(runArg);
  if (existsSync(run) && readdirSync(run).length > 0) {
    console.error(`refusing to overwrite non-empty run directory ${run}`);
    process.exit(2);
  }
  const packet = readFileSync(packetPath);
  const problems = validatePacket(JSON.parse(packet.toString('utf8')) as Parameters<typeof validatePacket>[0]);
  if (problems.length > 0) {
    console.error(`packet invalid:\n  ${problems.join('\n  ')}`);
    process.exit(1);
  }
  const template = readFileSync(templatePath);
  const schema = readFileSync(schemaPath);
  const prompt = buildPrompt(template, packet);
  mkdirSync(join(run, 'packet'), { recursive: true });
  copyFileSync(packetPath, join(run, 'packet', 'packet.json'));
  writeFileSync(join(run, 'prompt.txt'), prompt);
  writeFileSync(join(run, 'output-schema.json'), schema);
  const manifest = {
    createdAt: new Date().toISOString(),
    packet: { source: packetPath, sha256: sha256(packet), bytes: packet.length },
    promptTemplate: { source: templatePath, sha256: sha256(template), bytes: template.length },
    outputSchema: { source: schemaPath, sha256: sha256(schema), bytes: schema.length },
    promptAsSent: { file: 'prompt.txt', sha256: sha256(prompt), bytes: prompt.length },
    workingDirectoryContents: readdirSync(join(run, 'packet')),
  };
  writeFileSync(join(run, 'input-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`${basename(run)}: prompt ${manifest.promptAsSent.sha256} (${prompt.length} bytes), packet ${manifest.packet.sha256}`);
}
