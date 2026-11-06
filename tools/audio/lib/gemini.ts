// Actual-file language QA with Gemini (CONTENT-PLAN §Audio, D-024) — PREPARED, NOT EXECUTED.
// Two separate stateless jobs per file: (a) blind transcription without the script, compared
// deterministically with the reviewed transcript; (b) file-with-reference quality review.
// The transport is injected so tests use a fake; the real REST shape below is UNVERIFIED (never called).
import { compareTranscripts, type Comparison } from './compare.ts';

export const MODEL = 'gemini-3.8-flash';
/** Brief/CONTENT-PLAN planning figure for audio input tokens per second (upper-bound estimate). */
export const AUDIO_TOKENS_PER_SECOND = 32;
export const PROMPT_VERSION = 1;
export const MAX_OUTPUT_TOKENS = { blind: 2048, quality: 4096 } as const;

export interface GeminiPart {
  readonly text?: string;
  readonly inline_data?: { readonly mime_type: string; readonly data: string };
}

export interface GeminiRequest {
  readonly contents: Array<{ readonly role: 'user'; readonly parts: GeminiPart[] }>;
  readonly generationConfig: {
    readonly temperature: number;
    readonly maxOutputTokens: number;
    readonly responseMimeType: 'application/json';
    readonly responseSchema: Record<string, unknown>;
  };
}

export interface UsageMetadata {
  readonly promptTokenCount?: number;
  readonly candidatesTokenCount?: number;
  readonly thoughtsTokenCount?: number;
  readonly totalTokenCount?: number;
}

export interface GeminiResponse {
  readonly candidates?: Array<{ readonly content?: { readonly parts?: Array<{ readonly text?: string }> }; readonly finishReason?: string }>;
  readonly usageMetadata?: UsageMetadata;
  readonly modelVersion?: string;
}

export interface GeminiTransport {
  generateContent(model: string, request: GeminiRequest, apiKey: string): Promise<GeminiResponse>;
}

/** Real transport: Gemini API REST generateContent. UNVERIFIED — never invoked by this worker. */
export function fetchTransport(endpoint = 'https://generativelanguage.googleapis.com/v1beta'): GeminiTransport {
  return {
    async generateContent(model, request, apiKey) {
      const response = await fetch(`${endpoint}/models/${encodeURIComponent(model)}:generateContent`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-goog-api-key': apiKey },
        body: JSON.stringify(request),
      });
      const text = await response.text();
      if (!response.ok) throw new Error(`Gemini HTTP ${response.status}: ${text.slice(0, 300)}`);
      return JSON.parse(text) as GeminiResponse;
    },
  };
}

/** Generic on purpose: no example words, so no script content (amounts, times) can prime the "blind" job. */
export const BLIND_PROMPT =
  'You are checking a short audio clip of Spanish speech. Transcribe exactly what is spoken, word for word, ' +
  'in standard Spanish orthography with accent marks as you hear the stress. Write every number, price, amount ' +
  'and time in Spanish words exactly as spoken, never as digits or symbols. ' +
  'Do not correct grammar, do not complete words that are cut off, and do not guess missing words; write [?] for ' +
  'each unintelligible word. Report audible technical problems (clipping, distortion, noise, cut-off start or end). ' +
  'Answer only with the JSON object described by the schema.';

export const BLIND_SCHEMA = {
  type: 'OBJECT',
  properties: {
    transcript: { type: 'STRING' },
    unintelligibleWords: { type: 'INTEGER' },
    audioProblems: { type: 'ARRAY', items: { type: 'STRING' } },
  },
  required: ['transcript', 'unintelligibleWords', 'audioProblems'],
} as const;

export function qualityPrompt(reference: { transcript: string; claimedVariety: string }): string {
  return (
    'You are reviewing one synthetic Spanish audio clip for a Spanish course for Ukrainian learners. ' +
    `The clip claims to say exactly this reviewed transcript: «${reference.transcript}». ` +
    `It claims to be Spanish of Spain (${reference.claimedVariety}). Listen to the actual audio and report: whether the ` +
    'audio matches the transcript (missing, extra or different words), whether every amount/number/time and every ' +
    'negation is spoken as written, any word with wrong stress, intelligibility (1-5), naturalness (1-5), whether ' +
    'the pronunciation is consistent with Spanish of Spain (e.g. /θ/ for c/z, vosotros forms) or not, and any audio ' +
    'defects (clipping, distortion, noise, truncation). This is a model assessment, not native-speaker certification: ' +
    'when you are not sure, say "uncertain" and set uncertainty to medium or high. Answer only with the JSON object.'
  );
}

export const QUALITY_SCHEMA = {
  type: 'OBJECT',
  properties: {
    transcriptMatch: { type: 'STRING', enum: ['exact', 'minor-differences', 'major-differences'] },
    differences: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: { expected: { type: 'STRING' }, heard: { type: 'STRING' }, kind: { type: 'STRING', enum: ['missing', 'extra', 'different', 'stress'] } },
        required: ['expected', 'heard', 'kind'],
      },
    },
    amountsCorrect: { type: 'BOOLEAN' },
    negationCorrect: { type: 'BOOLEAN' },
    stressIssues: { type: 'ARRAY', items: { type: 'STRING' } },
    intelligibility: { type: 'INTEGER' },
    naturalness: { type: 'INTEGER' },
    varietyJudgment: { type: 'STRING', enum: ['consistent-with-spain', 'not-spain', 'uncertain'] },
    varietyEvidence: { type: 'STRING' },
    audioDefects: { type: 'ARRAY', items: { type: 'STRING' } },
    uncertainty: { type: 'STRING', enum: ['low', 'medium', 'high'] },
    notes: { type: 'STRING' },
  },
  required: [
    'transcriptMatch', 'differences', 'amountsCorrect', 'negationCorrect', 'stressIssues', 'intelligibility',
    'naturalness', 'varietyJudgment', 'varietyEvidence', 'audioDefects', 'uncertainty', 'notes',
  ],
} as const;

export function audioPart(base64: string): GeminiPart {
  return { inline_data: { mime_type: 'audio/mp3', data: base64 } };
}

/** Blind job: the audio and generic instructions only — never the transcript, translation or clip id. */
export function buildBlindRequest(audioBase64: string): GeminiRequest {
  return {
    contents: [{ role: 'user', parts: [{ text: BLIND_PROMPT }, audioPart(audioBase64)] }],
    generationConfig: { temperature: 0, maxOutputTokens: MAX_OUTPUT_TOKENS.blind, responseMimeType: 'application/json', responseSchema: BLIND_SCHEMA },
  };
}

export function buildQualityRequest(audioBase64: string, reference: { transcript: string; claimedVariety: string }): GeminiRequest {
  return {
    contents: [{ role: 'user', parts: [{ text: qualityPrompt(reference) }, audioPart(audioBase64)] }],
    generationConfig: { temperature: 0, maxOutputTokens: MAX_OUTPUT_TOKENS.quality, responseMimeType: 'application/json', responseSchema: QUALITY_SCHEMA },
  };
}

export interface BlindResult {
  readonly transcript: string;
  readonly unintelligibleWords: number;
  readonly audioProblems: string[];
}

export interface QualityResult {
  readonly transcriptMatch: 'exact' | 'minor-differences' | 'major-differences';
  readonly differences: Array<{ expected: string; heard: string; kind: string }>;
  readonly amountsCorrect: boolean;
  readonly negationCorrect: boolean;
  readonly stressIssues: string[];
  readonly intelligibility: number;
  readonly naturalness: number;
  readonly varietyJudgment: 'consistent-with-spain' | 'not-spain' | 'uncertain';
  readonly varietyEvidence: string;
  readonly audioDefects: string[];
  readonly uncertainty: 'low' | 'medium' | 'high';
  readonly notes: string;
}

export function responseText(response: GeminiResponse): string {
  const parts = response.candidates?.[0]?.content?.parts ?? [];
  return parts.map((p) => p.text ?? '').join('');
}

function isStringArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.every((x) => typeof x === 'string');
}

/** Strict parse; anything malformed is an error (and an error never becomes a pass). */
export function parseBlind(text: string): BlindResult {
  const v = JSON.parse(text) as Record<string, unknown>;
  if (typeof v.transcript !== 'string') throw new Error('blind result lacks transcript');
  if (typeof v.unintelligibleWords !== 'number' || !Number.isInteger(v.unintelligibleWords)) throw new Error('blind result lacks unintelligibleWords');
  if (!isStringArray(v.audioProblems)) throw new Error('blind result lacks audioProblems');
  return { transcript: v.transcript, unintelligibleWords: v.unintelligibleWords, audioProblems: v.audioProblems };
}

export function parseQuality(text: string): QualityResult {
  const v = JSON.parse(text) as Record<string, unknown>;
  const oneOf = <T extends string>(key: string, allowed: readonly T[]): T => {
    const x = v[key];
    if (typeof x !== 'string' || !(allowed as readonly string[]).includes(x)) throw new Error(`quality result ${key} invalid`);
    return x as T;
  };
  const int1to5 = (key: string): number => {
    const x = v[key];
    if (typeof x !== 'number' || !Number.isInteger(x) || x < 1 || x > 5) throw new Error(`quality result ${key} invalid`);
    return x;
  };
  const bool = (key: string): boolean => {
    if (typeof v[key] !== 'boolean') throw new Error(`quality result ${key} invalid`);
    return v[key] as boolean;
  };
  const differences = v.differences;
  if (!Array.isArray(differences)) throw new Error('quality result differences invalid');
  for (const d of differences) {
    const r = d as Record<string, unknown>;
    if (typeof r.expected !== 'string' || typeof r.heard !== 'string' || typeof r.kind !== 'string') throw new Error('quality difference invalid');
  }
  if (!isStringArray(v.stressIssues) || !isStringArray(v.audioDefects)) throw new Error('quality result arrays invalid');
  if (typeof v.varietyEvidence !== 'string' || typeof v.notes !== 'string') throw new Error('quality result text invalid');
  return {
    transcriptMatch: oneOf('transcriptMatch', ['exact', 'minor-differences', 'major-differences'] as const),
    differences: differences as QualityResult['differences'],
    amountsCorrect: bool('amountsCorrect'),
    negationCorrect: bool('negationCorrect'),
    stressIssues: v.stressIssues,
    intelligibility: int1to5('intelligibility'),
    naturalness: int1to5('naturalness'),
    varietyJudgment: oneOf('varietyJudgment', ['consistent-with-spain', 'not-spain', 'uncertain'] as const),
    varietyEvidence: v.varietyEvidence,
    audioDefects: v.audioDefects,
    uncertainty: oneOf('uncertainty', ['low', 'medium', 'high'] as const),
    notes: v.notes,
  };
}

// ---------- cost ----------

export interface PricePeriod {
  readonly from: string | null;
  readonly to: string | null;
  readonly inputUsdPerMTok: number;
  readonly outputUsdPerMTok: number;
}

export interface Pricing {
  readonly model: string;
  readonly periods: readonly PricePeriod[];
}

export function priceFor(pricing: Pricing, date: Date): PricePeriod {
  const day = date.toISOString().slice(0, 10);
  const p = pricing.periods.find((x) => (x.from === null || day >= x.from) && (x.to === null || day <= x.to));
  if (!p) throw new Error(`no ${pricing.model} price for ${day}`);
  return p;
}

/** Conservative text-token estimate (≈3 characters per token, rounded up). */
export function textTokens(text: string): number {
  return Math.ceil(text.length / 3);
}

export function audioTokens(durationMs: number): number {
  return Math.ceil((durationMs / 1000) * AUDIO_TOKENS_PER_SECOND);
}

export interface JobEstimate {
  readonly inputTokens: number;
  readonly maxOutputTokens: number;
  readonly upperBoundUsd: number;
}

export function estimateJob(durationMs: number, promptText: string, maxOutputTokens: number, price: PricePeriod): JobEstimate {
  const inputTokens = audioTokens(durationMs) + textTokens(promptText);
  const usd = (inputTokens * price.inputUsdPerMTok + maxOutputTokens * price.outputUsdPerMTok) / 1_000_000;
  return { inputTokens, maxOutputTokens, upperBoundUsd: usd };
}

/** Actual cost from usage metadata; missing usage is charged at the job's upper bound. */
export function actualCostUsd(usage: UsageMetadata | undefined, price: PricePeriod, fallbackUsd: number): number {
  if (!usage || typeof usage.promptTokenCount !== 'number') return fallbackUsd;
  const output = (usage.candidatesTokenCount ?? 0) + (usage.thoughtsTokenCount ?? 0);
  return (usage.promptTokenCount * price.inputUsdPerMTok + output * price.outputUsdPerMTok) / 1_000_000;
}

// ---------- verdict ----------

export type ClipVerdict = 'pass-model-assessment' | 'needs-review' | 'blocked';

export interface JobOutcome<T> {
  readonly status: 'ok' | 'error' | 'not-run';
  readonly result?: T;
  readonly error?: string;
}

export function blindComparison(reference: string, blind: JobOutcome<BlindResult>): Comparison | null {
  return blind.status === 'ok' && blind.result ? compareTranscripts(reference, blind.result.transcript) : null;
}

/** Combines both jobs; any error, gap or doubt prevents a pass. A pass is a model assessment only. */
export function clipVerdict(
  comparison: Comparison | null,
  blind: JobOutcome<BlindResult>,
  quality: JobOutcome<QualityResult>,
): { verdict: ClipVerdict; reasons: string[] } {
  const blocked: string[] = [];
  const review: string[] = [];
  if (blind.status !== 'ok') review.push(`blind job ${blind.status}${blind.error ? `: ${blind.error}` : ''}`);
  if (quality.status !== 'ok') review.push(`quality job ${quality.status}${quality.error ? `: ${quality.error}` : ''}`);
  if (comparison) {
    for (const f of comparison.findings) (f.severity === 'blocking' ? blocked : review).push(`blind ${f.code}: ${f.detail}`);
  }
  if (blind.status === 'ok' && blind.result) {
    if (blind.result.unintelligibleWords > 0) review.push(`blind: ${blind.result.unintelligibleWords} unintelligible word(s)`);
    if (blind.result.audioProblems.length > 0) review.push(`blind audio problems: ${blind.result.audioProblems.join('; ')}`);
  }
  const q = quality.status === 'ok' ? quality.result : undefined;
  if (q) {
    if (q.transcriptMatch === 'major-differences') blocked.push('quality: major transcript differences');
    else if (q.transcriptMatch === 'minor-differences') review.push('quality: minor transcript differences');
    if (!q.amountsCorrect) blocked.push('quality: amount/number not as written');
    if (!q.negationCorrect) blocked.push('quality: negation not as written');
    if (q.varietyJudgment === 'not-spain') blocked.push(`quality: not Spain Spanish (${q.varietyEvidence})`);
    else if (q.varietyJudgment === 'uncertain') review.push('quality: Spain-variety judgment uncertain');
    if (q.intelligibility <= 2) blocked.push(`quality: intelligibility ${q.intelligibility}/5`);
    else if (q.intelligibility === 3) review.push('quality: intelligibility 3/5');
    if (q.naturalness <= 2) review.push(`quality: naturalness ${q.naturalness}/5`);
    if (q.stressIssues.length > 0) review.push(`quality: stress ${q.stressIssues.join('; ')}`);
    const defects = q.audioDefects.join('; ');
    if (/clip|distort|truncat|cut/i.test(defects)) blocked.push(`quality: audio defect ${defects}`);
    else if (q.audioDefects.length > 0) review.push(`quality: audio ${defects}`);
    if (q.uncertainty !== 'low') review.push(`quality: uncertainty ${q.uncertainty}`);
  }
  if (blocked.length > 0) return { verdict: 'blocked', reasons: [...blocked, ...review] };
  if (review.length > 0) return { verdict: 'needs-review', reasons: review };
  return { verdict: 'pass-model-assessment', reasons: [] };
}
