#!/bin/bash
# usage: rec.sh [take ...]
cd "$(dirname "$0")"
W=1280; H=720; DSF=2; CHROME=87
pkill Xvfb 2>/dev/null; sleep 0.3
Xvfb :99 -screen 0 $((W*DSF))x$(((H+CHROME)*DSF))x24 -nolisten tcp >/dev/null 2>&1 &
XV=$!
sleep 1
export DISPLAY=:99
node record.js "$@"
RC=$?
kill $XV 2>/dev/null
exit $RC
