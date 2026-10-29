#!/bin/bash
# scenes.js = lib + scene files (+ the authored-duration table) + post-processing; syntax-checked
cd "$(dirname "$0")/.." && { cat src/lib.js src/scenes_a.js src/scenes_b.js src/scenes_c.js src/scenes_d.js; echo "const AUTH = $(cat src/auth.json);"; cat src/scenes_z.js; } > scenes.js && node -e "new Function('window','document','IMAGES',require('fs').readFileSync('scenes.js','utf8'))" && echo "scenes.js ok ($(wc -l < scenes.js) lines)"
