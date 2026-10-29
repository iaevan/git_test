#!/bin/bash
# scenes.js = lib + the two scene files; syntax-checked
cd "$(dirname "$0")/.." && cat src/lib.js src/scenes_a.js src/scenes_b.js > scenes.js && node -e "new Function('window','document','IMAGES',require('fs').readFileSync('scenes.js','utf8'))" && echo "scenes.js ok ($(wc -l < scenes.js) lines)"
