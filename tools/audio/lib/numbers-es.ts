// Spanish cardinal numbers (0-999 999) <-> integers, for deterministic amount comparison between a
// reviewed transcript (numbers in words) and an ASR transcript (words or digits). Pure.

const UNITS: Record<string, number> = {
  cero: 0, uno: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6, siete: 7, ocho: 8, nueve: 9,
};
/** "un"/"una"/"ún" only count as 1 inside a number (e.g. "treinta y una", "un mil") — alone they are articles. */
const BOUND_ONE: Record<string, number> = { un: 1, una: 1 };
const TEENS: Record<string, number> = {
  diez: 10, once: 11, doce: 12, trece: 13, catorce: 14, quince: 15,
  'dieciséis': 16, diecisiete: 17, dieciocho: 18, diecinueve: 19,
  veinte: 20, veintiuno: 21, 'veintiún': 21, veintiuna: 21, 'veintidós': 22, 'veintitrés': 23,
  veinticuatro: 24, veinticinco: 25, 'veintiséis': 26, veintisiete: 27, veintiocho: 28, veintinueve: 29,
};
const TENS: Record<string, number> = {
  treinta: 30, cuarenta: 40, cincuenta: 50, sesenta: 60, setenta: 70, ochenta: 80, noventa: 90,
};
const HUNDREDS: Record<string, number> = {
  cien: 100, ciento: 100, doscientos: 200, doscientas: 200, trescientos: 300, trescientas: 300,
  cuatrocientos: 400, cuatrocientas: 400, quinientos: 500, quinientas: 500, seiscientos: 600, seiscientas: 600,
  setecientos: 700, setecientas: 700, ochocientos: 800, ochocientas: 800, novecientos: 900, novecientas: 900,
};

type Kind = 'unit' | 'teen' | 'tens' | 'hundreds' | 'mil';

function classify(word: string): { kind: Kind; value: number } | null {
  if (word in UNITS) return { kind: 'unit', value: UNITS[word] ?? 0 };
  if (word in TEENS) return { kind: 'teen', value: TEENS[word] ?? 0 };
  if (word in TENS) return { kind: 'tens', value: TENS[word] ?? 0 };
  if (word in HUNDREDS) return { kind: 'hundreds', value: HUNDREDS[word] ?? 0 };
  if (word === 'mil') return { kind: 'mil', value: 1000 };
  return null;
}

/** Which kinds may directly follow `prev` inside one number (Spanish cardinal grammar). */
function canFollow(prev: Kind, next: Kind, afterMil: boolean): boolean {
  if (next === 'mil') return !afterMil && prev !== 'mil';
  switch (prev) {
    case 'hundreds':
      return next === 'tens' || next === 'teen' || next === 'unit';
    case 'mil':
      return next === 'hundreds' || next === 'tens' || next === 'teen' || next === 'unit';
    default:
      return false;
  }
}

/** Parses digit tokens: "1.500" -> [1500] (thousands dots), "3,50" -> [3, 50], "9:30" -> [9, 30]. */
export function digitTokenValues(token: string): number[] {
  if (/^\d{1,3}(\.\d{3})+$/.test(token)) return [Number(token.replaceAll('.', ''))];
  return token.split(/[.,:]/).filter(Boolean).map((part) => Number(part));
}

/**
 * Extracts the ordered list of cardinal amounts in a token list (lowercase, NFC words or digit tokens).
 * "tres euros con cincuenta" -> [3, 50]; "dos mil quinientos" -> [2500]; "treinta y cinco" -> [35];
 * "las nueve y media" -> [9]; articles "un/una" alone are not amounts.
 */
export function extractAmounts(tokens: readonly string[]): number[] {
  const out: number[] = [];
  let i = 0;
  while (i < tokens.length) {
    const token = tokens[i] ?? '';
    if (/^\d/.test(token)) {
      out.push(...digitTokenValues(token));
      i++;
      continue;
    }
    let first = classify(token);
    let j = i;
    // "un/una mil…" (rare) or a bound "un" handled only when followed by "mil".
    if (!first && token in BOUND_ONE && tokens[i + 1] === 'mil') first = { kind: 'unit', value: 1 };
    if (!first) {
      i++;
      continue;
    }
    let total = 0;
    let group = first.kind === 'mil' ? 0 : first.value;
    let prev: Kind = first.kind;
    let afterMil = false;
    if (first.kind === 'mil') {
      total = 1000;
      afterMil = true;
    }
    j = i + 1;
    while (j < tokens.length) {
      const word = tokens[j] ?? '';
      // "treinta y cinco" / "treinta y una": y only joins tens + unit.
      if (word === 'y' && prev === 'tens') {
        const nextWord = tokens[j + 1] ?? '';
        const unit = classify(nextWord) ?? (nextWord in BOUND_ONE ? { kind: 'unit' as const, value: 1 } : null);
        if (unit && unit.kind === 'unit' && unit.value > 0) {
          group += unit.value;
          prev = 'unit';
          j += 2;
          continue;
        }
        break;
      }
      const next = classify(word);
      if (!next || !canFollow(prev, next.kind, afterMil)) break;
      if (next.kind === 'mil') {
        total += (group === 0 ? 1 : group) * 1000;
        group = 0;
        afterMil = true;
      } else {
        group += next.value;
      }
      prev = next.kind;
      j++;
    }
    out.push(total + group);
    i = j;
  }
  return out;
}

const UNIT_WORDS = ['cero', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'];
const TEEN_WORDS = [
  'diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve',
  'veinte', 'veintiuno', 'veintidós', 'veintitrés', 'veinticuatro', 'veinticinco', 'veintiséis', 'veintisiete', 'veintiocho', 'veintinueve',
];
const TENS_WORDS = ['', '', '', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];
const HUNDRED_WORDS = ['', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos', 'seiscientos', 'setecientos', 'ochocientos', 'novecientos'];

function below1000(n: number): string[] {
  if (n === 100) return ['cien'];
  const words: string[] = [];
  const h = Math.floor(n / 100);
  const rest = n % 100;
  if (h > 0) words.push(HUNDRED_WORDS[h] ?? '');
  if (rest === 0) return words;
  if (rest < 10) words.push(UNIT_WORDS[rest] ?? '');
  else if (rest < 30) words.push(TEEN_WORDS[rest - 10] ?? '');
  else {
    words.push(TENS_WORDS[Math.floor(rest / 10)] ?? '');
    if (rest % 10) words.push('y', UNIT_WORDS[rest % 10] ?? '');
  }
  return words;
}

/** Integer (0-999 999) to Spanish words, masculine cardinal forms ("veintiuno", "ciento uno"). */
export function integerToSpanish(n: number): string[] {
  if (!Number.isInteger(n) || n < 0 || n > 999_999) throw new Error(`out of range: ${n}`);
  if (n === 0) return ['cero'];
  const thousands = Math.floor(n / 1000);
  const rest = n % 1000;
  const words: string[] = [];
  if (thousands === 1) words.push('mil');
  else if (thousands > 1) words.push(...below1000(thousands), 'mil');
  if (rest > 0) words.push(...below1000(rest));
  return words;
}
