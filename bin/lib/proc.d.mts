// Type declarations for proc.mjs (process identity used by lock decisions; never signals).
export declare function isAlive(pid: number): boolean;
export declare function processIdentity(pid: number): { start: string; command: string } | undefined;
export declare function sameProcess(pid: number, processStart: string): boolean;
export declare function matchesIdentity(pid: number, expected: { processStart: string; executable?: string; entry?: string }): boolean;
export declare function sleep(ms: number): Promise<void>;
