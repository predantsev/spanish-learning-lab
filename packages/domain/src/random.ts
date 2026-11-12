// Seeded deterministic selection (DOMAIN-SPEC §Queue): no randomness in grading or queue priority;
// optional prompt shuffle uses the stored session seed only. Never Math.random.

/** 32-bit FNV-1a over UTF-16 code units: a stable seed from a stored session seed string. */
export function hashSeed(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Seed for a sub-purpose (e.g. one task's option order) derived from the session seed. */
export function deriveSeed(seed: number, salt: string): number {
  return hashSeed(`${seed >>> 0}:${salt}`);
}

/** mulberry32: small, fast and fully deterministic for a given 32-bit seed. Returns values in [0, 1). */
export function createPrng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Fisher–Yates with a seeded PRNG; returns a new array and never mutates the input. */
export function seededShuffle<T>(items: readonly T[], seed: number): T[] {
  const out = [...items];
  const next = createPrng(seed);
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(next() * (i + 1));
    const tmp = out[i] as T;
    out[i] = out[j] as T;
    out[j] = tmp;
  }
  return out;
}
