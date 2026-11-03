#!/bin/bash
# tools/sheet.sh <variant-dir> out.jpg shot:frac [shot:frac ...]  → renders stills and tiles them (QA only)
cd "$(dirname "$0")/.." || exit 1
dir=$1; out=$2; shift 2; files=()
for a in "$@"; do s=${a%%:*}; f=${a##*:}; node skill/scripts/animate.mjs still "$dir" "$s" "$f" >/dev/null 2>&1; n=$(printf '%02d' "$s"); cp "$dir/frames/shot-$n.jpg" "/tmp/sheet-$s-$f.jpg"; files+=("/tmp/sheet-$s-$f.jpg"); done
python3 - "$out" "${files[@]}" <<'PY'
import sys
from PIL import Image
out=sys.argv[1]; ims=[Image.open(f) for f in sys.argv[2:]]
w,h=ims[0].size; cols=2 if w>=h else min(4,len(ims)); sc=min(1.0,1800/(cols*w)); tw,th=int(w*sc),int(h*sc); rows=(len(ims)+cols-1)//cols
S=Image.new('RGB',(cols*tw,rows*th),'white')
for i,im in enumerate(ims): S.paste(im.resize((tw,th)),((i%cols)*tw,(i//cols)*th))
S.save(out,quality=88)
PY
