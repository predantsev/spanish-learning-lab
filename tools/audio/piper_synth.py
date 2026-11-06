"""Synthesize one WAV with the project-local Piper venv (called by tools/audio/lib/voices.ts).

Run with ``python -I`` and cwd = <venv>/lib/python3.X/site-packages/piper. The espeak-ng copy
bundled in piper-tts keeps its data path in a fixed 160-byte buffer; absolute paths inside a
deep git worktree are truncated and synthesis aborts, so the relative "espeak-ng-data" is used.
Default synthesis settings come from the model config (length_scale 1 = normal speed).
"""

import argparse
import wave

from piper import PiperVoice


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--model", required=True)
    parser.add_argument("--input", required=True, help="UTF-8 text file")
    parser.add_argument("--output", required=True, help="WAV path")
    args = parser.parse_args()

    voice = PiperVoice.load(args.model, espeak_data_dir="espeak-ng-data")
    with open(args.input, encoding="utf-8") as handle:
        text = handle.read().strip()
    with wave.open(args.output, "wb") as wav_file:
        voice.synthesize_wav(text, wav_file)


if __name__ == "__main__":
    main()
