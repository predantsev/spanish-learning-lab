// Source-verification pass for calibration labels (brief 05 step 3).
// For every source a label cites: retrieve it (public web page via plain `curl`, or a repository file), record the
// retrieval time, HTTP status, SHA-256 and a <=300-character passage around each expected needle, then mark each label
// verified only when every cited passage was actually found. Status probes record sources that could not be retrieved.
// Raw pages are cached outside the repository (copyrighted third-party text is never committed; only short passages).
// Usage: node tools/calibration/verify-sources.ts <labels.json> <source-spec.json> <out.json> <cache-dir>
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const PASSAGE_MAX = 300;

interface SourceSpec { url?: string; path?: string; needles: string[] }
interface Spec { sources: Record<string, SourceSpec>; statusProbes: Array<{ url: string; why: string }> }
interface Label { caseId: string; class: string; sourceRefs: string[]; expectedFinding: string }
interface Passage { needle: string; found: boolean; passage: string | null }
interface SourceRecord {
  sourceId: string;
  kind: 'web' | 'repo';
  location: string;
  retrievedAt: string;
  httpStatus: number | null;
  bytes: number;
  sha256: string;
  title: string | null;
  passages: Passage[];
}

const ENTITIES: Record<string, string> = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', laquo: '«', raquo: '»', ldquo: '“', rdquo: '”',
  lsquo: '‘', rsquo: '’', hellip: '…', ndash: '–', mdash: '—', iexcl: '¡', iquest: '¿', aacute: 'á', eacute: 'é',
  iacute: 'í', oacute: 'ó', uacute: 'ú', ntilde: 'ñ', uuml: 'ü', Aacute: 'Á', Eacute: 'É', Iacute: 'Í', Oacute: 'Ó',
  Uacute: 'Ú', Ntilde: 'Ñ', ordm: 'º', ordf: 'ª', NoBreak: '',
};

function decodeEntities(s: string): string {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e: string) => {
    if (e[0] === '#') {
      const code = e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : m;
    }
    return ENTITIES[e] ?? m;
  });
}

/** Whitespace/punctuation normalisation applied identically to pages and needles. */
export function normalise(s: string): string {
  return s
    .replace(/[⁠­​]/g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.;:)»”?!])/g, '$1')
    .replace(/([(«“¿¡])\s+/g, '$1')
    .trim();
}

function htmlToText(html: string): { text: string; title: string | null } {
  const title = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1] ?? null;
  // FundéuRAE article body; fall back to the whole page (e.g. slovnyk.ua).
  let start = html.indexOf('class="art-content');
  if (start < 0) start = html.indexOf('class="layout-main');
  let body = html;
  if (start >= 0) {
    const end = html.indexOf('Últimas', start);
    body = html.slice(html.indexOf('>', start) + 1, end > start ? end : undefined);
  }
  body = body.replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, ' ').replace(/<[^>]+>/g, ' ');
  // Drop page-furniture labels (audio button, rating/share widgets) that are not part of the text.
  body = decodeEntities(body).replace(/\b(Escuchar|Valora esta recomendación|Comparte en)\b/g, ' ');
  return { text: normalise(body), title: title ? normalise(decodeEntities(title)) : null };
}

export function passageAround(text: string, needle: string): string | null {
  const n = normalise(needle);
  const at = text.indexOf(n);
  if (at < 0) return null;
  const room = Math.max(0, PASSAGE_MAX - n.length);
  let from = Math.max(0, at - Math.floor(room / 3));
  const sentenceStart = text.lastIndexOf('. ', at);
  if (sentenceStart >= from && sentenceStart < at) from = sentenceStart + 2;
  else if (from > 0 && text[from - 1] !== ' ') {
    const nextSpace = text.indexOf(' ', from);
    if (nextSpace >= 0 && nextSpace < at) from = nextSpace + 1; // never start a passage mid-word
  }
  let to = Math.min(text.length, from + PASSAGE_MAX);
  if (to < at + n.length) to = at + n.length;
  const sentenceEnd = text.indexOf('. ', at + n.length);
  if (sentenceEnd >= 0 && sentenceEnd + 1 <= to) to = sentenceEnd + 1;
  return text.slice(from, to).trim();
}

function sha256(buf: Buffer | string): string {
  return createHash('sha256').update(buf).digest('hex');
}

function curl(url: string, file: string): number | null {
  try {
    const code = execFileSync('curl', ['-sS', '-L', '--max-time', '40', '-o', file, '-w', '%{http_code}', url], {
      encoding: 'utf8',
    });
    return Number.parseInt(code.trim(), 10);
  } catch {
    return null;
  }
}

function retrieve(id: string, spec: SourceSpec, cacheDir: string): SourceRecord {
  const retrievedAt = new Date().toISOString();
  if (spec.path) {
    const raw = readFileSync(join(root, spec.path));
    const text = normalise(raw.toString('utf8'));
    return {
      sourceId: id, kind: 'repo', location: spec.path, retrievedAt, httpStatus: null, bytes: raw.length, sha256: sha256(raw),
      title: null, passages: spec.needles.map((needle) => ({ needle, found: passageAround(text, needle) !== null, passage: passageAround(text, needle) })),
    };
  }
  const url = spec.url ?? '';
  const file = join(cacheDir, `${id}.html`);
  const status = curl(url, file);
  let raw: Buffer = Buffer.alloc(0);
  try { raw = readFileSync(file); } catch { /* not retrieved */ }
  const { text, title } = htmlToText(raw.toString('utf8'));
  return {
    sourceId: id, kind: 'web', location: url, retrievedAt, httpStatus: status, bytes: raw.length, sha256: sha256(raw), title,
    passages: spec.needles.map((needle) => {
      const passage = status === 200 ? passageAround(text, needle) : null;
      return { needle, found: passage !== null, passage };
    }),
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [labelsPath, specPath, outPath, cacheDir] = process.argv.slice(2);
  if (!labelsPath || !specPath || !outPath || !cacheDir) {
    console.error('usage: verify-sources.ts <labels.json> <source-spec.json> <out.json> <cache-dir>');
    process.exit(2);
  }
  mkdirSync(cacheDir, { recursive: true });
  const labels = (JSON.parse(readFileSync(labelsPath, 'utf8')) as { labels: Label[] }).labels;
  const spec = JSON.parse(readFileSync(specPath, 'utf8')) as Spec;
  const used = [...new Set(labels.flatMap((l) => l.sourceRefs))].sort();
  const missingSpec = used.filter((id) => !spec.sources[id]);
  const records = new Map<string, SourceRecord>();
  for (const id of used) if (spec.sources[id]) records.set(id, retrieve(id, spec.sources[id] as SourceSpec, cacheDir));
  const probes = spec.statusProbes.map((p, i) => {
    const file = join(cacheDir, `probe-${i}.html`);
    const status = curl(p.url, file);
    let raw: Buffer = Buffer.alloc(0);
    try { raw = readFileSync(file); } catch { /* none */ }
    return { ...p, checkedAt: new Date().toISOString(), httpStatus: status, bytes: raw.length, title: htmlToText(raw.toString('utf8')).title };
  });
  const labelResults = labels.map((l) => {
    const refs = l.sourceRefs.map((id) => records.get(id));
    const ok = refs.every((r) => r !== undefined && (r.kind === 'repo' || r.httpStatus === 200) && r.passages.every((p) => p.found));
    return {
      caseId: l.caseId, class: l.class, expectedFinding: l.expectedFinding, sourceRefs: l.sourceRefs,
      mechanicalCheck: ok ? 'all-cited-passages-found' : 'missing-passage-or-source',
    };
  });
  const out = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    tool: 'tools/calibration/verify-sources.ts',
    curl: execFileSync('curl', ['--version'], { encoding: 'utf8' }).split('\n')[0],
    passageMaxChars: PASSAGE_MAX,
    missingSpec,
    sources: [...records.values()],
    statusProbes: probes,
    labels: labelResults,
  };
  writeFileSync(outPath, `${JSON.stringify(out, null, 2)}\n`);
  const bad = labelResults.filter((l) => l.mechanicalCheck !== 'all-cited-passages-found');
  console.log(`sources: ${records.size} retrieved, missing spec: ${missingSpec.length}; labels mechanically verified: ${labelResults.length - bad.length}/${labelResults.length}`);
  for (const r of records.values()) {
    for (const p of r.passages) if (!p.found) console.log(`  NOT FOUND ${r.sourceId} (${r.httpStatus ?? 'repo'}): ${p.needle}`);
  }
  for (const p of probes) console.log(`  probe ${p.httpStatus} ${p.url} ${p.title ?? ''}`);
  process.exit(bad.length > 0 || missingSpec.length > 0 ? 1 : 0);
}
