#!/bin/bash
# scenes.js = drawing kit + scenes + flight, with the voice marks; copied into every variant
cd "$(dirname "$0")/.." && { cat src/film.js src/segments.js; echo "const MARKS = $(cat voice/marks.json);"; cat src/flight.js; } > scenes.js && node -e "new Function('window','document','IMAGES',require('fs').readFileSync('scenes.js','utf8'))" && for v in variants/*/; do cp scenes.js "$v"; done && echo "scenes.js ok ($(wc -l < scenes.js) lines) → $(ls -d variants/*/ 2>/dev/null | wc -l) variants"
