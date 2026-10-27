#!/bin/bash
# Usage: mux.sh <silent.mp4> <soundtrack.wav> <out.mp4>
# Video is stream-copied (no re-encode); audio becomes AAC 256k. +faststart for web/social.
set -e
ffmpeg -y -v error -i "$1" -i "$2" -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 256k -ar 48000 -shortest -movflags +faststart "$3"
ffprobe -v error -show_entries format=duration,size:stream=codec_name,width,height,r_frame_rate -of compact "$3"
