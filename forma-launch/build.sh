#!/bin/bash
# Full build: cues → soundtrack → both videos → muxed deliverables.   ./build.sh   (~35–45 min on 4 cores)
set -e
cd "$(dirname "$0")"
export NODE_PATH=$(npm root -g)
mkdir -p out dist
for F in reel land; do
  echo "→ [$F] export sound cues from the timeline"; node tools/cues.cjs $F
  echo "→ [$F] synthesise score + SFX, mix, normalise"
  python3 audio/mix.py out/cues_$F.json out/mix_$F.wav
  python3 tools/loudnorm.py out/mix_$F.wav out/forma-soundtrack-$F.wav
done
echo "→ render reel (1080×1920)";      node tools/render.cjs reel out/forma-reel-silent.mp4
echo "→ render landscape (1920×1080)"; node tools/render.cjs land out/forma-landscape-silent.mp4
echo "→ mux"
tools/mux.sh out/forma-reel-silent.mp4      out/forma-soundtrack-reel.wav dist/forma-launch-reel-1080x1920.mp4
tools/mux.sh out/forma-landscape-silent.mp4 out/forma-soundtrack-land.wav dist/forma-launch-landscape-1920x1080.mp4
