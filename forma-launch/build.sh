#!/bin/bash
# Full build: cues → soundtrack → both videos → muxed deliverables.   ./build.sh   (~35–45 min on 4 cores)
set -e
cd "$(dirname "$0")"
export NODE_PATH=$(npm root -g)
mkdir -p out dist/audio

voiceover() {   # ./build.sh voice   (needs out/mix_music.wav, out/mix_sfx.wav and the silent renders)
  echo "→ voice-over (original timing): fetch Higgsfield clips, mix under the score, master to -14 LUFS"
  python3 audio/vo_fetch.py
  (cd audio && python3 mix_vo.py short ../out/vo_short.wav ../out/mix)
  python3 tools/loudnorm.py out/vo_short.wav out/forma-soundtrack-vo-short.wav
  tools/mux.sh out/forma-reel-silent.mp4      out/forma-soundtrack-vo-short.wav dist/forma-launch-reel-1080x1920-voiceover.mp4
  tools/mux.sh out/forma-landscape-silent.mp4 out/forma-soundtrack-vo-short.wav dist/forma-launch-landscape-1920x1080-voiceover.mp4
  ffmpeg -y -v error -i out/forma-soundtrack-vo-short.wav -c:a aac -b:a 256k dist/audio/forma-full-mix-voiceover-bella.m4a
  ffmpeg -y -v error -i out/vo_short_voice.wav -af volume=4dB -c:a aac -b:a 192k dist/audio/forma-voiceover-only-bella.m4a
}

longcut() {     # ./build.sh long   — extended pain intro (58 s): cues, score, both renders, narration
  echo "→ extended intro: cues + score (+6 s), renders, narration"
  INTRO=6 node tools/cues.cjs reel
  FORMA_SHIFT=6 python3 audio/mix.py out/cues_reel_long.json out/mixL.wav
  python3 tools/loudnorm.py out/mixL.wav out/forma-soundtrack-long.wav
  INTRO=6 node tools/render.cjs reel out/forma-reel-silent-long.mp4
  INTRO=6 node tools/render.cjs land out/forma-landscape-silent-long.mp4
  python3 audio/vo_fetch.py
  (cd audio && python3 mix_vo.py long ../out/vo_long.wav ../out/mixL)
  python3 tools/loudnorm.py out/vo_long.wav out/forma-soundtrack-vo-long.wav
  tools/mux.sh out/forma-reel-silent-long.mp4      out/forma-soundtrack-vo-long.wav dist/forma-launch-reel-1080x1920-voiceover-long-intro.mp4
  tools/mux.sh out/forma-landscape-silent-long.mp4 out/forma-soundtrack-vo-long.wav dist/forma-launch-landscape-1920x1080-voiceover-long-intro.mp4
}
if [ "$1" = "long" ]; then longcut; exit 0; fi
if [ "$1" = "voice" ]; then voiceover; exit 0; fi

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
voiceover
longcut
