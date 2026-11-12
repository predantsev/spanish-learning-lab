// Streamed, bounded archive upload (≤ 512 MiB compressed): hashed while written, rejected the moment the bound is
// exceeded, then checked at central-directory level (entries, paths, declared sizes) before it is accepted.
import { createHash, randomUUID } from 'node:crypto';
import { createWriteStream, renameSync } from 'node:fs';
import { join } from 'node:path';
import { Transform, type Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import type { ProfileStore } from '../store/types.ts';
import { RecoveryError, type ArtifactInfo } from './types.ts';
import type { ArtifactRegistry } from './artifacts.ts';
import { scanArchive } from './archive.ts';
import { ensurePrivateDir, fsyncDir, fsyncFile, removeIfExists } from './fsutil.ts';
import type { ResolvedOptions } from './options.ts';

export async function storeUpload(store: ProfileStore, artifacts: ArtifactRegistry, o: ResolvedOptions, body: Readable): Promise<ArtifactInfo> {
  const paths = store.paths;
  ensurePrivateDir(paths.uploads);
  artifacts.sweepExpired();
  const id = randomUUID();
  const part = join(paths.uploads, `${id}.zip.part`);
  const final = join(paths.uploads, `${id}.zip`);
  const hash = createHash('sha256');
  let bytes = 0;
  const limit = o.limits.maxCompressedBytes;
  const meter = new Transform({
    transform(chunk: Buffer, _enc, cb) {
      bytes += chunk.length;
      if (bytes > limit) {
        cb(new RecoveryError('UPLOAD_TOO_LARGE', 413, 'archive exceeds the upload size limit'));
        return;
      }
      hash.update(chunk);
      cb(null, chunk);
    },
  });
  try {
    await pipeline(body, meter, createWriteStream(part, { mode: 0o600, flags: 'wx' }));
    fsyncFile(part);
    renameSync(part, final);
    fsyncDir(paths.uploads);
    const scanned = await scanArchive(final, o.limits);
    scanned.close();
    return artifacts.add('upload', { id, path: final, sha256: hash.digest('hex'), sizeBytes: bytes, expiresAt: artifacts.expiryFromNow() });
  } catch (err) {
    removeIfExists(part);
    removeIfExists(final);
    if (err instanceof RecoveryError) throw err;
    if ((err as NodeJS.ErrnoException).code === 'ENOSPC') throw new RecoveryError('UPLOAD_DISK_FULL', 503, 'not enough disk space for the upload', true);
    throw new RecoveryError('UPLOAD_FAILED', 400, 'upload failed');
  }
}
