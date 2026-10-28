#!/bin/bash
# Full build: cues → soundtrack → both videos → muxed deliverables.   ./build.sh   (~35–45 min on 4 cores)
set -e
cd "$(dirname "$0")"
export NODE_PATH=$(npm root -g)
mkdir -p out dist/audio

voiceover() {   # ./build.sh voice [ainsley|grady]   (needs out/mix_music.wav, out/mix_sfx.wav and the silent renders)
  V=${1:-ainsley}
  echo "→ voice-over ($V): fetch Higgsfield clips, mix under the score, master to -14 LUFS"
  python3 audio/vo_fetch.py
  (cd audio && python3 mix_vo.py "$V" "../out/mix_vo_$V.wav")
  python3 tools/loudnorm.py "out/mix_vo_$V.wav" "out/forma-soundtrack-vo-$V.wav"
  tools/mux.sh out/forma-reel-silent.mp4      "out/forma-soundtrack-vo-$V.wav" dist/forma-launch-reel-1080x1920-voiceover.mp4
  tools/mux.sh out/forma-landscape-silent.mp4 "out/forma-soundtrack-vo-$V.wav" dist/forma-launch-landscape-1920x1080-voiceover.mp4
  ffmpeg -y -v error -i "out/forma-soundtrack-vo-$V.wav" -c:a aac -b:a 256k "dist/audio/forma-full-mix-voiceover-$V.m4a"
  ffmpeg -y -v error -i "out/mix_vo_${V}_voice.wav" -af volume=4dB -c:a aac -b:a 192k "dist/audio/forma-voiceover-only-$V.m4a"
}
if [ "$1" = "voice" ]; then voiceover "$2"; exit 0; fi

echo "→ export sound cues from the timeline (identical in both layouts)"
node tools/cues.cjs reel
echo "→ synthesise score + SFX, mix, master to -14 LUFS"
python3 audio/mix.py out/cues_reel.json out/mix.wav
python3 tools/loudnorm.py out/mix.wav out/forma-soundtrack.wav
echo "→ render reel (1080×1920)";      node tools/render.cjs reel out/forma-reel-silent.mp4
echo "→ render landscape (1920×1080)"; node tools/render.cjs land out/forma-landscape-silent.mp4
echo "→ mux"
tools/mux.sh out/forma-reel-silent.mp4      out/forma-soundtrack.wav dist/forma-launch-reel-1080x1920.mp4
tools/mux.sh out/forma-landscape-silent.mp4 out/forma-soundtrack.wav dist/forma-launch-landscape-1920x1080.mp4
voiceover ainsley
