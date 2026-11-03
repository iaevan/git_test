#!/bin/bash
# loudness-normalise each rendered variant to -14 LUFS (video stream copied) → out/zavino-services-<cut>s-<format>.mp4
cd "$(dirname "$0")/.." && mkdir -p out
for d in variants/*/; do
  v=$(basename "$d"); src=$(ls "$d"*.mp4 2>/dev/null | head -1); [ -z "$src" ] && continue
  dst="out/zavino-services-${v%%-*}s-${v#*-}.mp4"
  M=$(ffmpeg -hide_banner -i "$src" -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
  g(){ echo "$M" | python3 -c "import sys,json;print(json.load(sys.stdin)['$1'])"; }
  ffmpeg -v error -y -i "$src" -c:v copy -af "loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=$(g input_i):measured_TP=$(g input_tp):measured_LRA=$(g input_lra):measured_thresh=$(g input_thresh):offset=$(g target_offset):linear=true" -c:a aac -b:a 192k -movflags +faststart "$dst"
  echo "$dst  $(ffprobe -v error -show_entries format=duration:stream=width,height -of csv=p=0 "$dst" | tr '\n' ' ')  $(ffmpeg -hide_banner -nostats -i "$dst" -af ebur128 -f null - 2>&1 | grep -A3 Summary | grep 'I:' | xargs)"
done
