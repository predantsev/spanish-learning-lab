// The 20-file audio calibration set (CONTENT-PLAN §Audio): 8 correct controls, 8 seeded defects,
// 4 uncertain cases. Pure data + a seeded shuffle so file order never reveals the class.
// Labels are constructed facts (what was fed to the engine and how it was processed). Whether an engine
// actually pronounced the input as written is NOT verified by listening: phoneticJudgmentConfirmed=false.

export type CaseClass = 'valid' | 'defect' | 'uncertain';
export type Expected = 'pass' | 'block' | 'flag';

export type Manipulation =
  | { readonly kind: 'none' }
  | { readonly kind: 'truncate'; readonly fraction: number }
  | { readonly kind: 'clip'; readonly gainDb: number }
  | { readonly kind: 'fast'; readonly wordsPerMinute: number }
  | { readonly kind: 'noise'; readonly amplitude: number; readonly seed: number }
  | { readonly kind: 'telephone-low'; readonly gainDb: number };

export interface CaseSpec {
  readonly key: string;
  readonly class: CaseClass;
  readonly type: string;
  readonly expected: Expected;
  readonly voice: string;
  readonly ttsText: string;
  readonly claimedTranscript: string;
  /** Claimed A1 lesson: only drives the technical duration bounds (2-15 s). */
  readonly claimedLessonId: string;
  readonly claimedVariety: 'es-ES';
  readonly manipulation: Manipulation;
  readonly labelEvidence: string;
}

const none = { kind: 'none' } as const;
const asWritten = 'TTS input equals the claimed transcript; correct pronunciation is assumed, not verified by listening.';

export const CALIBRATION_CASES: readonly CaseSpec[] = [
  // ---- 8 correct controls (Mónica, normal pipeline) ----
  { key: 'control.bakery', class: 'valid', type: 'control', expected: 'pass', voice: 'macos.monica', ttsText: 'Buenos días. ¿Tiene pan de centeno para hoy?', claimedTranscript: 'Buenos días. ¿Tiene pan de centeno para hoy?', claimedLessonId: 'A1-05-L2', claimedVariety: 'es-ES', manipulation: none, labelEvidence: asWritten },
  { key: 'control.meeting', class: 'valid', type: 'control', expected: 'pass', voice: 'macos.monica', ttsText: 'La reunión es el martes a las diez y media, en la oficina.', claimedTranscript: 'La reunión es el martes a las diez y media, en la oficina.', claimedLessonId: 'A1-05-L4', claimedVariety: 'es-ES', manipulation: none, labelEvidence: asWritten },
  { key: 'control.coffee', class: 'valid', type: 'control', expected: 'pass', voice: 'macos.monica', ttsText: 'No me gusta el café sin azúcar, prefiero el té.', claimedTranscript: 'No me gusta el café sin azúcar, prefiero el té.', claimedLessonId: 'A1-06-L2', claimedVariety: 'es-ES', manipulation: none, labelEvidence: asWritten },
  { key: 'control.bus', class: 'valid', type: 'control', expected: 'pass', voice: 'macos.monica', ttsText: 'Perdone, ¿dónde está la parada del autobús número doce?', claimedTranscript: 'Perdone, ¿dónde está la parada del autobús número doce?', claimedLessonId: 'A1-03-L3', claimedVariety: 'es-ES', manipulation: none, labelEvidence: asWritten },
  { key: 'control.market', class: 'valid', type: 'control', expected: 'pass', voice: 'macos.monica', ttsText: 'Mañana voy al mercado con mi hermana y compramos fruta.', claimedTranscript: 'Mañana voy al mercado con mi hermana y compramos fruta.', claimedLessonId: 'A1-04-L2', claimedVariety: 'es-ES', manipulation: none, labelEvidence: asWritten },
  { key: 'control.grandparents', class: 'valid', type: 'control', expected: 'pass', voice: 'macos.monica', ttsText: 'Este fin de semana hemos visitado a mis abuelos en el pueblo.', claimedTranscript: 'Este fin de semana hemos visitado a mis abuelos en el pueblo.', claimedLessonId: 'A1-06-L4', claimedVariety: 'es-ES', manipulation: none, labelEvidence: asWritten },
  { key: 'control.price', class: 'valid', type: 'control', expected: 'pass', voice: 'macos.monica', ttsText: 'Son dos euros con veinte, por favor. ¿Quiere una bolsa?', claimedTranscript: 'Son dos euros con veinte, por favor. ¿Quiere una bolsa?', claimedLessonId: 'A1-05-L2', claimedVariety: 'es-ES', manipulation: none, labelEvidence: asWritten },
  { key: 'control.windows', class: 'valid', type: 'control', expected: 'pass', voice: 'macos.monica', ttsText: 'Abrid las ventanas, por favor, que hace mucho calor aquí.', claimedTranscript: 'Abrid las ventanas, por favor, que hace mucho calor aquí.', claimedLessonId: 'A1-04-L4', claimedVariety: 'es-ES', manipulation: none, labelEvidence: asWritten },
  // ---- 8 seeded defects ----
  { key: 'defect.wrong-word', class: 'defect', type: 'wrong-word', expected: 'block', voice: 'macos.monica', ttsText: 'Buenos días, quiero un té con limón y un poco de azúcar, por favor.', claimedTranscript: 'Buenos días, quiero un café con limón y un poco de azúcar, por favor.', claimedLessonId: 'A1-05-L2', claimedVariety: 'es-ES', manipulation: none, labelEvidence: 'TTS input says "té" where the claimed transcript says "café".' },
  { key: 'defect.missing-negation', class: 'defect', type: 'missing-word', expected: 'block', voice: 'macos.monica', ttsText: 'Hoy trabajo por la tarde, hasta las ocho.', claimedTranscript: 'Hoy no trabajo por la tarde, hasta las ocho.', claimedLessonId: 'A1-03-L6', claimedVariety: 'es-ES', manipulation: none, labelEvidence: 'TTS input omits the negation "no" that the claimed transcript contains.' },
  { key: 'defect.wrong-stress', class: 'defect', type: 'wrong-stress', expected: 'block', voice: 'macos.monica', ttsText: 'Ayer Marta hablo con el médico del centro.', claimedTranscript: 'Ayer Marta habló con el médico del centro.', claimedLessonId: 'A1-04-L5', claimedVariety: 'es-ES', manipulation: none, labelEvidence: 'Misaccented TTS input "hablo" (present, stress on the first syllable) for "habló" (past, final stress). That the engine followed the spelling is NOT verified by listening.' },
  { key: 'defect.wrong-amount', class: 'defect', type: 'wrong-amount', expected: 'block', voice: 'macos.monica', ttsText: 'Son cuatro euros con treinta, por favor.', claimedTranscript: 'Son cuatro euros con veinte, por favor.', claimedLessonId: 'A1-05-L2', claimedVariety: 'es-ES', manipulation: none, labelEvidence: 'TTS input says "treinta" where the claimed transcript says "veinte".' },
  { key: 'defect.transcript-mismatch', class: 'defect', type: 'transcript-mismatch', expected: 'block', voice: 'macos.monica', ttsText: 'Perdone, ¿a qué hora sale el próximo tren para Sevilla?', claimedTranscript: 'Perdone, ¿dónde está la estación de tren más cercana?', claimedLessonId: 'A1-05-L6', claimedVariety: 'es-ES', manipulation: none, labelEvidence: 'The claimed transcript belongs to a different utterance.' },
  { key: 'defect.truncation', class: 'defect', type: 'truncation', expected: 'block', voice: 'macos.monica', ttsText: 'Mañana por la mañana voy a la playa con mis amigos del trabajo.', claimedTranscript: 'Mañana por la mañana voy a la playa con mis amigos del trabajo.', claimedLessonId: 'A1-04-L3', claimedVariety: 'es-ES', manipulation: { kind: 'truncate', fraction: 0.55 }, labelEvidence: 'The original was cut to 55 % of its duration before normalization (ffmpeg -t).' },
  { key: 'defect.clipping', class: 'defect', type: 'clipping', expected: 'block', voice: 'macos.monica', ttsText: 'Los sábados desayuno en la terraza con mi familia.', claimedTranscript: 'Los sábados desayuno en la terraza con mi familia.', claimedLessonId: 'A1-04-L2', claimedVariety: 'es-ES', manipulation: { kind: 'clip', gainDb: 24 }, labelEvidence: '+24 dB gain then 16-bit conversion (hard clipping), encoded without loudness normalization.' },
  { key: 'defect.accent-claim', class: 'defect', type: 'unsuitable-accent-claim', expected: 'block', voice: 'macos.paulina', ttsText: 'Hace mucho calor en la plaza del centro.', claimedTranscript: 'Hace mucho calor en la plaza del centro.', claimedLessonId: 'A1-03-L3', claimedVariety: 'es-ES', manipulation: none, labelEvidence: 'Synthesized with the es_MX voice Paulina (say -v "?" locale es_MX; identifier com.apple.voice.compact.es-MX.Paulina) but claimed as Spain Spanish. The audible accent itself is NOT verified by listening.' },
  // ---- 4 uncertain cases ----
  { key: 'uncertain.fast', class: 'uncertain', type: 'fast-speech', expected: 'flag', voice: 'macos.monica', ttsText: 'Primero gira a la derecha y después sigue todo recto hasta el semáforo.', claimedTranscript: 'Primero gira a la derecha y después sigue todo recto hasta el semáforo.', claimedLessonId: 'A1-05-L6', claimedVariety: 'es-ES', manipulation: { kind: 'fast', wordsPerMinute: 330 }, labelEvidence: 'say -r 330 (far above the default speed); intelligibility is genuinely uncertain.' },
  { key: 'uncertain.noise', class: 'uncertain', type: 'background-noise', expected: 'flag', voice: 'macos.monica', ttsText: 'Perdone, ¿sabe si esta farmacia abre los domingos?', claimedTranscript: 'Perdone, ¿sabe si esta farmacia abre los domingos?', claimedLessonId: 'A1-05-L3', claimedVariety: 'es-ES', manipulation: { kind: 'noise', amplitude: 0.12, seed: 7 }, labelEvidence: 'Pink noise (ffmpeg anoisesrc amplitude 0.12, seed 7) mixed under the speech; intelligibility is genuinely uncertain.' },
  { key: 'uncertain.abbreviation', class: 'uncertain', type: 'abbreviation-reading', expected: 'flag', voice: 'macos.monica', ttsText: 'Vivo en la C/ Mayor, n.º 3, 2.º B.', claimedTranscript: 'Vivo en la calle Mayor, número tres, segundo be.', claimedLessonId: 'A1-05-L1', claimedVariety: 'es-ES', manipulation: none, labelEvidence: 'TTS input uses abbreviations (C/, n.º, 2.º); whether the engine expanded them as the claimed transcript says is unknown.' },
  { key: 'uncertain.telephone', class: 'uncertain', type: 'telephone-band-low-level', expected: 'flag', voice: 'macos.monica', ttsText: 'Te espero en la puerta del cine a las ocho.', claimedTranscript: 'Te espero en la puerta del cine a las ocho.', claimedLessonId: 'A1-05-L4', claimedVariety: 'es-ES', manipulation: { kind: 'telephone-low', gainDb: -14 }, labelEvidence: '300-3400 Hz band-pass and -14 dB, encoded without normalization; quality/intelligibility uncertain.' },
];

export const CALIBRATION_SEED = 20261106;

/** mulberry32: small deterministic PRNG. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Fisher-Yates with a seeded PRNG; returns case specs with their public ids cal.01…cal.20. */
export function assignCaseIds(cases: readonly CaseSpec[], seed: number = CALIBRATION_SEED): Array<{ caseId: string; spec: CaseSpec }> {
  const order = cases.map((_, i) => i);
  const rand = mulberry32(seed);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const tmp = order[i]!;
    order[i] = order[j]!;
    order[j] = tmp;
  }
  return order.map((specIndex, position) => ({ caseId: `cal.${String(position + 1).padStart(2, '0')}`, spec: cases[specIndex]! }));
}
