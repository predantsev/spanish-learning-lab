// Privileged local content-review tool (never reachable over HTTP).
//   node tools/review/review.ts packet (--lesson <id> | --skills a,b,… | --items kind:id,…)
//        --author-provider openai|anthropic|google|local|other [--author-model m] [--author-effort e]
//        [--batch-id id] [--dry-run]
//   node tools/review/review.ts run-codex --batch <id> [--model gpt-6.1-sol] [--effort xhigh] [--timeout-min 60] [--dry-run]
//        (direction A, calibrated prompt v3; for Claude-authored content)
//   node tools/review/review.ts run-claude --batch <id> [--model opus] [--effort medium] [--timeout-min 60] [--dry-run]
//        (direction B, calibrated prompt v2; for OpenAI-authored content)
//   node tools/review/review.ts apply --batch <id> [--run <jobId>] [--dry-run]
//   node tools/review/review.ts promote (--batch <id> | --items kind:id,…) [--dry-run]
// Common: [--source dir] [--ledger file] [--reviews dir]. Keys: $SLL_REVIEW_KEYS_DIR, else
// $SLL_HOME/keys, else ~/Library/Application Support/Spanish Learning Lab/keys.
import { DEFAULT_LEDGER_PATH, DEFAULT_REVIEWS_DIR, DEFAULT_SOURCE_DIR, flagString, isMain, parseArgs } from '../content/load.ts';
import type { EntityKind } from '../content/types.ts';
import { ENTITY_KINDS } from '../content/types.ts';
import { applyReview } from './apply.ts';
import { buildPacket, writePacket } from './packet.ts';
import type { PacketScope } from './packet.ts';
import { promote } from './promote.ts';
import { runReview } from './run-codex.ts';
import { REVIEW_PROVIDERS } from './store.ts';
import type { ReviewProvider } from './store.ts';

function fail(message: string): never {
  console.error(`review: ${message}`);
  process.exit(1);
}

function parseItems(value: string): Array<{ kind: EntityKind; id: string }> {
  return value.split(',').filter(Boolean).map((part) => {
    const colon = part.indexOf(':');
    const kind = part.slice(0, colon) as EntityKind;
    if (colon <= 0 || !ENTITY_KINDS.includes(kind)) fail(`bad item reference ${part} (expected kind:id)`);
    return { kind, id: part.slice(colon + 1) };
  });
}

async function main(): Promise<void> {
  const [command, ...rest] = process.argv.slice(2);
  const { flags } = parseArgs(rest);
  const sourceDir = flagString(flags, 'source') ?? DEFAULT_SOURCE_DIR;
  const reviewsDir = flagString(flags, 'reviews') ?? DEFAULT_REVIEWS_DIR;
  const ledgerPath = flagString(flags, 'ledger') ?? DEFAULT_LEDGER_PATH;
  const dryRun = flags.has('dry-run');
  const batchId = flagString(flags, 'batch');

  switch (command) {
    case 'packet': {
      const provider = flagString(flags, 'author-provider') as ReviewProvider | undefined;
      if (!provider || !REVIEW_PROVIDERS.includes(provider)) fail(`--author-provider must be one of ${REVIEW_PROVIDERS.join('|')} (the provider that authored this content)`);
      const lesson = flagString(flags, 'lesson');
      const skills = flagString(flags, 'skills');
      const items = flagString(flags, 'items');
      const scope: PacketScope | undefined = lesson
        ? { type: 'lesson', lessonId: lesson }
        : skills
          ? { type: 'skills', skillIds: skills.split(',').filter(Boolean) }
          : items
            ? { type: 'items', items: parseItems(items) }
            : undefined;
      if (!scope) fail('pass --lesson, --skills or --items');
      const authorModel = flagString(flags, 'author-model');
      const authorEffort = flagString(flags, 'author-effort');
      const requestedBatch = flagString(flags, 'batch-id');
      const packet = buildPacket({
        sourceDir,
        scope,
        authorProvider: provider,
        ...(authorModel ? { authorModel } : {}),
        ...(authorEffort ? { authorEffort } : {}),
        ...(requestedBatch ? { batchId: requestedBatch } : {}),
      });
      console.log(`batch ${packet.batchId}: ${packet.items.length} item(s), ${packet.targets.length} target(s), packetHash ${packet.packetHash}`);
      for (const item of packet.items) console.log(`  ${item.kind} ${item.logicalId} [${item.reviewStatus}] ${item.contentHash.slice(0, 12)}…`);
      if (dryRun) console.log('dry run: packet not written');
      else console.log(`wrote ${writePacket(reviewsDir, packet)}`);
      return;
    }
    case 'run-codex':
    case 'run-claude': {
      if (!batchId) fail('--batch is required');
      const model = flagString(flags, 'model');
      const effort = flagString(flags, 'effort');
      const timeoutMin = Number(flagString(flags, 'timeout-min') ?? '60');
      const result = await runReview({
        reviewsDir,
        batchId,
        direction: command === 'run-codex' ? 'A' : 'B',
        timeoutMs: timeoutMin * 60 * 1000,
        dryRun,
        ...(model ? { model } : {}),
        ...(effort ? { effort } : {}),
      });
      const shown = result.argv.map((a) => (a === '' || /[\s"'$]/.test(a) ? (a.length > 80 ? "'<contents of output-schema.json>'" : JSON.stringify(a)) : a));
      console.log(`command: ${shown.join(' ')} < prompt.txt (sha256 ${result.promptSha256})`);
      if (result.status === 'dry-run') {
        console.log('dry run: reviewer not executed, nothing written');
        return;
      }
      console.log(`run ${result.jobId} → ${result.status}${result.receiptId ? `, receipt ${result.receiptId}` : ''}${result.counts ? ` ${JSON.stringify(result.counts)}` : ''}\n  ${result.runDir}`);
      for (const p of result.problems) console.error(`  problem: ${p}`);
      if (!result.ok) process.exit(1);
      return;
    }
    case 'apply': {
      if (!batchId) fail('--batch is required');
      const run = flagString(flags, 'run');
      const result = applyReview({ reviewsDir, sourceDir, batchId, dryRun, ...(run ? { jobId: run } : {}) });
      console.log(`apply run ${result.jobId} (receipt ${result.receiptId})${dryRun ? ' — DRY RUN, nothing written' : ''}`);
      for (const t of result.transitions) console.log(`  ${t.kind} ${t.id}: ${t.from} → ${t.to} (${t.severity})`);
      for (const s of result.skipped) console.log(`  skip ${s.kind} ${s.id}: ${s.reason}`);
      if (result.findingsPath) console.log(`findings: ${result.findingsPath}`);
      return;
    }
    case 'promote': {
      const items = flagString(flags, 'items');
      const result = promote({ reviewsDir, sourceDir, ledgerPath, dryRun, ...(batchId ? { batchId } : {}), ...(items ? { items: parseItems(items) } : {}) });
      for (const p of result.promoted) console.log(`  ${dryRun ? 'would promote' : 'ready'}: ${p.kind} ${p.id} (review receipts ${p.reviewReceiptIds.join(', ')}${p.validationReceiptId ? `; validation receipt ${p.validationReceiptId}` : ''})`);
      for (const r of result.refused) console.log(`  refused: ${r.kind} ${r.id}: ${r.reasons.join('; ')}`);
      if (result.refused.length > 0) process.exit(1);
      return;
    }
    default:
      fail('usage: node tools/review/review.ts packet|run-codex|apply|promote … (see header comment)');
  }
}

if (isMain(import.meta.url)) {
  try {
    await main();
  } catch (error) {
    fail((error as Error).message);
  }
}
