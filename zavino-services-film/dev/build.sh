#!/bin/bash
cd "$(dirname "$0")" && cat ../src/logo.js ../src/hero3d.js scene_test.js > scenes.js && node -e "new Function('window','document','IMAGES','THREE',require('fs').readFileSync('scenes.js','utf8'))" && echo built
