import { Injectable, Logger } from '@nestjs/common';
import { createReadStream, existsSync, promises as fs, ReadStream } from 'fs';
import { extname, join, resolve, sep } from 'path';
import { randomUUID } from 'crypto';

/**
 * Where uploaded bytes live.
 *
 * Uploads used to be dropped on the floor: the media service kept a record in
 * an in-process array and never wrote the file, so every "uploaded" asset was a
 * name with nothing behind it. This writes to a directory on disk, which is the
 * right shape for a single-node deployment and swaps cleanly for S3 later —
 * callers only ever see an opaque `storageKey`.
 */
@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly root = resolve(
    process.env.MEDIA_STORAGE_DIR ?? join(process.cwd(), 'storage', 'media'),
  );

  /** Persist a buffer and return the key needed to read it back. */
  async save(buffer: Buffer, originalName: string): Promise<string> {
    // Two levels of fan-out keep any one directory small enough to list.
    const id = randomUUID();
    const ext = extname(originalName || '').slice(0, 12);
    const key = join(id.slice(0, 2), id.slice(2, 4), `${id}${ext}`);
    const target = join(this.root, key);

    await fs.mkdir(join(target, '..'), { recursive: true });
    await fs.writeFile(target, buffer);

    return key;
  }

  /**
   * Absolute path for a key, or null when the file is gone.
   *
   * The containment check matters: a key arriving from the database must never
   * be able to walk out of the storage root with `../`.
   */
  pathFor(key: string): string | null {
    if (!key) return null;
    const target = resolve(this.root, key);
    if (target !== this.root && !target.startsWith(this.root + sep)) {
      this.logger.warn(`Rejected storage key outside the root: ${key}`);
      return null;
    }
    return existsSync(target) ? target : null;
  }

  stream(key: string): ReadStream | null {
    const path = this.pathFor(key);
    return path ? createReadStream(path) : null;
  }

  /** Best-effort delete: a missing file is not an error worth failing on. */
  async remove(key: string | null): Promise<void> {
    if (!key) return;
    const path = this.pathFor(key);
    if (!path) return;
    try {
      await fs.unlink(path);
    } catch (error) {
      this.logger.warn(`Could not delete ${key}: ${(error as Error).message}`);
    }
  }
}
