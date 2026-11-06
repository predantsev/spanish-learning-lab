// Minimal ambient declarations for the two ZIP libraries the recovery module uses.
// yauzl@3.4.0 and yazl@3.3.1 ship no type definitions and adding @types packages is out of scope,
// so only the members actually called here are declared.
declare module 'yauzl' {
  import type { Readable } from 'node:stream';
  import type { EventEmitter } from 'node:events';

  export interface Options {
    autoClose?: boolean;
    lazyEntries?: boolean;
    decodeStrings?: boolean;
    validateEntrySizes?: boolean;
    strictFileNames?: boolean;
  }

  export interface Entry {
    readonly fileName: string;
    readonly versionMadeBy: number;
    readonly generalPurposeBitFlag: number;
    readonly compressionMethod: number;
    readonly compressedSize: number;
    readonly uncompressedSize: number;
    readonly externalFileAttributes: number;
    isEncrypted(): boolean;
    isCompressed(): boolean;
  }

  export interface ZipFile extends EventEmitter {
    readonly entryCount: number;
    readonly isOpen: boolean;
    readEntry(): void;
    openReadStream(entry: Entry, callback: (err: Error | null, stream: Readable) => void): void;
    close(): void;
  }

  const yauzl: {
    open(path: string, options: Options, callback: (err: Error | null, zipfile: ZipFile) => void): void;
    validateFileName(fileName: string): string | null;
  };
  export default yauzl;
}

declare module 'yazl' {
  import type { Readable } from 'node:stream';

  export interface EntryOptions {
    mtime?: Date;
    mode?: number;
    compress?: boolean;
    forceZip64Format?: boolean;
  }

  export interface ZipFile {
    readonly outputStream: Readable;
    addBuffer(buffer: Buffer, metadataPath: string, options?: EntryOptions): void;
    addFile(realPath: string, metadataPath: string, options?: EntryOptions): void;
    end(options?: { forceZip64Format?: boolean }, callback?: (finalSize: number) => void): void;
  }

  const yazl: { ZipFile: new () => ZipFile };
  export default yazl;
}
