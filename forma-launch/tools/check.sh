#!/bin/bash
# usage: tools/check.sh [project_dir]   -> prints a compact summary of `hyperframes check --json`
D=${1:-.}; cd "$D"
OUT=$(mktemp); timeout 280 npx -y hyperframes check --json >"$OUT" 2>"$OUT.err"
python3 - "$OUT" <<'PY'
import json,sys,re
raw=open(sys.argv[1]).read()
i=raw.find('{'); 
if i<0: print('NO JSON:', raw[:800], open(sys.argv[1]+'.err').read()[:800]); sys.exit(1)
d=json.loads(raw[i:raw.rfind('}')+1])
print('ok', d['ok'], '| browserSkipped', d.get('browserSkipped'))
for sec in ['lint','runtime','layout','motion','contrast','craft','audio']:
    x=d.get(sec,{})
    print(f"{sec:9s} errors={x.get('errorCount')} warnings={x.get('warningCount')} info={x.get('infoCount')}")
    for f in x.get('findings',[])[:14]: print('   -',f['severity'],f['code'],'|',f['message'][:230].replace('\n',' '),'|',f.get('selector'),'|',f.get('sourceFile'),'t=',f.get('time'))
PY
