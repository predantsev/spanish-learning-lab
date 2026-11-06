# Local Spain-Spanish TTS benchmark (issue #111, 2026-11-06)

Status: technical benchmark only. **No language QA, no listening, no rights clearance.** The worker that
produced this cannot hear audio: every statement about naturalness, stress, accent or intelligibility is
**not made here**. Numbers below come from `ffprobe`/`ffmpeg ebur128` on the actual MP3 files
([technical-2026-11-06.json](technical-2026-11-06.json)) and from the generation index
([benchmark-generation.json](benchmark-generation.json)). Audio bytes are not in Git; they live in the
private media store `work/media/` (gitignored).

## Environment (captured programmatically)

| Item | Value |
|---|---|
| OS | macOS 26.6.2 (25G83), arm64 |
| ffmpeg / ffprobe | 8.1.1 (Homebrew, pre-installed; nothing was installed globally) |
| Node | v24.22.1 (project runtime) |
| Piper | piper-tts 1.8.0 in `work/tools/piper/venv` (Python 3.13.12), hash-locked: [piper-provenance.json](piper-provenance.json) |

## Candidates

| Id | Engine | Voice / model | Notes |
|---|---|---|---|
| `macos.monica` | `say` | Mónica, `com.apple.voice.compact.es-ES.Monica` (AVSpeech reports `com.apple.voice.super-compact.es-ES.Monica`, quality 1) | The standard installed es_ES system voice. Only the compact variant is installed. |
| `macos.eddy` | `say` | Eddy (Spanish (Spain)), `com.apple.eloquence.es-ES.Eddy` | Eloquence novelty-class voice, included as the single contrast (brief cap). |
| `piper.davefx-medium` | Piper | `es_ES-davefx-medium.onnx` from `rhasspy/piper-voices@e7229f7d33a10e145e109b886d661984201ac3c4`, sha256 `6658b03b…a917` | Local ONNX voice (CONTENT-PLAN fallback 2). |

Not benchmarked: the other es_ES Eloquence voices (Flo, Grandma, Grandpa, Reed, Rocko, Sandy, Shelley — at most
one novelty voice allowed); enhanced/premium Spanish voices (need a System Settings download, a system
change outside this worker's authority); ElevenLabs (purchase not authorized; never contacted).

Per-voice asset versions for the macOS voices are **unconfirmed**: `NSSpeechSynthesizer` reports an empty
`VoiceVersion`, and no matching `Info.plist` was found under
`/System/Library/AssetsV2/com_apple_MobileAsset_VoiceServices_CombinedVocalizerVoices/`. The index records the
OS version/build instead.

### Piper install note

`pip install --only-binary=:all: piper-tts==1.8.0` succeeded, but the CLI aborted with
`Error processing file '/Users/runner/work/piper1-gpl/piper1-gpl/_skbuild/macosx-11.0-arm64-3.9/cmake-build/espeak_ng-install/share/espeak-ng-data/phontab': No such file or directory.`
Versions 1.7.0 and 1.3.0 failed the same way with the path truncated to exactly 160 characters
(`…/venv-1.7.0/lib/python3.13/phontab`). Inferred cause (from that length): the bundled espeak-ng keeps its
data path in a fixed 160-byte buffer and this worktree path is longer. Workaround used by
[`tools/audio/piper_synth.py`](../../../tools/audio/piper_synth.py): run with cwd = the `piper` package
directory and pass the relative `espeak-ng-data`. Piper output is **not byte-reproducible** (default
`noise_scale` 0.667 / `noise_w` 0.8): the same text gave different hashes on each run.

## Scripts (synthetic drafts, not course content)

Written for this benchmark in Peninsular Spanish; status `draft`, **not reviewed** by an opposite-provider
reviewer. Source: `tools/audio/fixtures/benchmark/<blockId>.json` (ClipFile schema).

| Clip | Lesson | Focus | Transcript |
|---|---|---|---|
| shop-greeting | A1-05-L2 | greeting/shop formula | Hola, buenos días. ¿Me pone un café con leche y una tostada, por favor? |
| amounts-time | A1-05-L3 | amounts/time | Son tres euros con cincuenta. La farmacia abre a las nueve y media y cierra a las ocho y cuarto. |
| question-negation | A1-03-L6 | question/negation | ¿Estás en casa ahora? No, ahora no estoy en casa. Estoy en el trabajo. |
| command-stress | A2-07-L6 | pronoun/command stress | Pásame la sal, por favor. Dímelo otra vez, más despacio. Vosotros, sentaos aquí. Señora, siéntese, por favor. Y las llaves, dámelas ahora, que me voy. |
| past-contrast | A2-06-L2 | participle/past contrast | Esta mañana he hecho la compra y he escrito a mi madre. Ayer no hice nada: vi una película y volví a casa pronto. |
| voice-message | A2-08-L5 | short connected message | Hola, Lucía, soy Javier. Te dejo un mensaje porque esta tarde no puedo ir a clase: tengo que trabajar hasta las siete. ¿Quedamos mañana a las seis en la cafetería de la plaza? Si no te viene bien, llámame esta noche. Un beso. |

## Measurements (actual MP3 files)

Delivery: MP3 44.1 kHz, 128 kbps CBR, mono; two-pass `loudnorm` (I = −19 LUFS, TP target −1.5 dBTP, LRA 20,
`linear=true`), ceiling −1 dBTP re-measured on the MP3. Every file: codec mp3, 44100 Hz, 1 channel,
128000 b/s, full decode OK, no near-full-scale samples. Originals kept in `work/media/originals/`.

| Clip | Voice | Duration s | LUFS | dBTP | LRA LU | Original | Technical |
|---|---|---:|---:|---:|---:|---|---|
| shop-greeting | Mónica | 4.04 | -19.2 | -6 | 1 | pcm_s16be 22050 Hz | pass |
| shop-greeting | Eddy | 4.64 | -19.5 | -3 | 1 | pcm_s16be 22050 Hz | pass |
| shop-greeting | Piper davefx | 3.62 | -19.4 | -4.3 | 0.9 | pcm_s16le 22050 Hz | pass |
| amounts-time | Mónica | 4.59 | -19.5 | -6.2 | 0.2 | pcm_s16be 22050 Hz | pass |
| amounts-time | Eddy | 5.57 | -19.5 | -4.8 | 1.8 | pcm_s16be 22050 Hz | pass |
| amounts-time | Piper davefx | 5.13 | -19.3 | -4.3 | 1 | pcm_s16le 22050 Hz | pass |
| question-negation | Mónica | 4.04 | -19.4 | -5.6 | 0.5 | pcm_s16be 22050 Hz | pass |
| question-negation | Eddy | 5.01 | -19.2 | -3.4 | 1.3 | pcm_s16be 22050 Hz | pass |
| question-negation | Piper davefx | 4.12 | -19.5 | -5.2 | 0.9 | pcm_s16le 22050 Hz | pass |
| command-stress | Mónica | 10.31 | -19.5 | -5.8 | 1.6 | pcm_s16be 22050 Hz | pass |
| command-stress | Eddy | 10.94 | -19.4 | -3 | 1.3 | pcm_s16be 22050 Hz | pass |
| command-stress | Piper davefx | 8.72 | -19.3 | -4.3 | 2 | pcm_s16le 22050 Hz | warn (duration.bounds) |
| past-contrast | Mónica | 5.65 | -19.4 | -7.1 | 0.6 | pcm_s16be 22050 Hz | warn (duration.bounds) |
| past-contrast | Eddy | 6.82 | -19.4 | -4.3 | 1.3 | pcm_s16be 22050 Hz | warn (duration.bounds) |
| past-contrast | Piper davefx | 6.49 | -19.2 | -3.9 | 1.2 | pcm_s16le 22050 Hz | warn (duration.bounds) |
| voice-message | Mónica | 12.41 | -19.6 | -5.4 | 1.5 | pcm_s16be 22050 Hz | pass |
| voice-message | Eddy | 13.69 | -19.3 | -2.6 | 1.4 | pcm_s16be 22050 Hz | pass |
| voice-message | Piper davefx | 13.46 | -19.3 | -4 | 1.4 | pcm_s16le 22050 Hz | pass |

| Voice | Files | Total s | Words | Words/s* | LUFS range | dBTP max | loudnorm mode | Byte-reproducible |
|---|---:|---:|---:|---:|---|---:|---|---|
| Mónica | 6 | 41.0 | 140 | 3.41 | -19.6 … -19.2 | -5.4 | linear | yes** |
| Eddy | 6 | 46.7 | 140 | 3.00 | -19.5 … -19.2 | -2.6 | linear | yes** |
| Piper davefx | 6 | 41.5 | 140 | 3.37 | -19.5 … -19.2 | -3.9 | linear | no |

\* Speech-rate proxy including pauses, at the default speed (rate 1; the app offers 0.85 via `playbackRate`).
\** Every macOS file generated twice came out with an identical hash: the Mónica and Eddy shop-greeting and
amounts-time files (scratch run vs final run) and all 20 calibration files (two full generations). Piper
produced a new hash each time.

Summary: 14 pass, 4 warn, 0 fail. The 4 warnings are the A2 production bound (10–60 s): the past-contrast
script is too short for an A2 clip with every voice, and Piper reads command-stress in 8.7 s. Informational
notes (not defects): 9 of the 12 `say` files (and none of the Piper files) start speech within 10 ms
(`edge.no-lead-in`), so a player's start latency could clip the first sound; the A1 scripts are 3.6–5.6 s.

## Listening-free observations

- All candidates are 22.05 kHz engines, so the 44.1 kHz MP3s carry at most ~11 kHz of audio bandwidth;
  the 44.1 kHz container meets the delivery format but adds no fidelity.
- Gain-only (linear) normalization was possible for all 18 files; true peaks stayed ≥ 1.6 dB under the ceiling.
- Eddy is the slowest reader of these texts (3.00 words/s vs 3.37–3.41). Whether any voice sounds natural,
  stresses `pásame`/`dímelo`/`siéntese`/`dámelas` correctly, or sounds Peninsular (/θ/ in `cincuenta`,
  `plaza`) is **not judged here** and needs actual-file language QA.
- Mónica and Eddy are deterministic, which makes regeneration and caching exact; Piper is not, so each Piper
  take must be reviewed on its own hash.

## Rights (see [rights.json](rights.json); all UNCONFIRMED)

- macOS system voices: the macOS Tahoe 26 license (§2.F, quoted with file path and hash in `rights.json`)
  permits System Voices "to create your own original content and projects for your personal, non-commercial
  use" and excludes publishing or redistribution "in a profit, non-profit, public sharing or commercial
  context". Interpretation (unconfirmed): owner-only, local, never distributed, never in Git or public artifacts.
- Piper davefx: tool GPL-3.0-or-later; repository card `license: mit`; model card dataset `CC0` and
  "Finetuned from U.S. English lessac voice"; the lessac card links to the Blizzard 2013 Lessac license, which
  grants use "exclusively for Research Purposes". Interpretation (unconfirmed): private evaluation only.
- No asset is rights-cleared by this benchmark.

## Recommended interim route

1. **Development and pipeline testing:** `macos.monica` through `tools/audio/synthesize.ts`. It is
   installed, offline, free and deterministic. The files stay in the owner's private media store,
   labelled synthetic and `unreviewed`. They are placeholders, not release audio.
2. **Keep Piper davefx as an evaluation-only alternative.** It is technically viable offline, but its
   rights chain is unresolved.
3. **Release audio stays blocked.** No candidate here has passed language QA. The CONTENT-PLAN default
   (ElevenLabs `eleven_multilingual_v2`, measured voice sweep) needs a purchase approval. Local voices for
   release need an owner/legal rights decision first.

## Blocked gates

| Gate | Needs | State |
|---|---|---|
| Actual-file language QA (Gemini 3.8 Flash) | Owner approval of the spend cap | Prepared, unit-tested with a fake transport only; never called. Upper-bound estimate: $0.4706 (20 calibration files) + $0.4278 (18 benchmark files) at the 2026 paid-tier price ([gemini-pricing.json](../../../tools/audio/gemini-pricing.json): $0.75/MTok in, $3.75/MTok out; doubles from 2027-01-01). A free tier also exists, but Google may use its content to improve products, so choosing it is an owner decision. |
| ElevenLabs voice sweep | Purchase approval (D-023: about $5–10, one cycle, no auto-renew) | Not contacted. The 6 scripts are 725 characters per voice, so 2,175 characters for 3 voices. No ElevenLabs engine is implemented. |
| Audio calibration pass | The Gemini approval above | The 20-file set is built (8 controls, 8 seeded defects, 4 uncertain). Labels are kept outside the repository. Its technical layer is measured: all 8 controls pass. Clipping and the low-level telephone case fail. Truncation, noise and fast speech warn. |
| Text review of the scripts | The opposite-provider text workflow (CONTENT-PLAN) | Not done; the scripts are drafts. |
| Rights decision for local voices | Owner/legal decision | Interpretations are recorded as unconfirmed. |

## Commands

Prerequisite in each shell: `. scripts/env.sh` (project Node).

| Step | Command |
|---|---|
| Regenerate benchmark audio | `node tools/audio/synthesize.ts --input tools/audio/fixtures/benchmark --voice macos.monica,macos.eddy,piper.davefx-medium --metadata-out content/reviews/audio/benchmark-generation.json` |
| Technical QA | `node tools/audio/qa-technical.ts` |
| Recreate Piper (hash-locked) | `node tools/audio/piper-setup.ts --provenance-out content/reviews/audio/piper-provenance.json` |
| Rebuild calibration set + hidden labels | `node tools/audio/calibration.ts` (labels: `$TMPDIR/sll-audio-calibration/labels.json`) |
| Cost estimate (no key read) | `node tools/audio/qa-gemini.ts estimate --index work/media/calibration/index.json` |
| **After approval:** ingestion probe (1 file) | `node tools/audio/qa-gemini.ts run --index work/media/calibration/index.json --limit 1 --i-have-owner-approval 0.05 --out work/media/calibration/gemini-probe.json` |
| **After approval:** calibration run | `node tools/audio/qa-gemini.ts run --index work/media/calibration/index.json --i-have-owner-approval 0.50 --out work/media/calibration/gemini-results.json` |
| Score calibration | `node tools/audio/qa-gemini.ts score --labels "$TMPDIR/sll-audio-calibration/labels.json" --gemini work/media/calibration/gemini-results.json --technical "$TMPDIR/sll-audio-calibration/technical.json"` |
| **After approval and a passing calibration:** benchmark language QA | `node tools/audio/qa-gemini.ts run --i-have-owner-approval 0.45` |
