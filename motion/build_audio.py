#!/usr/bin/env python3
"""Place each voiceover clip at its scene time and mix to one track. Missing clips are skipped (silent).
usage: python3 build_audio.py [out.wav]   (reads stage/vo.json, audio/*.mp3)"""
import json,os,subprocess,sys
HERE=os.path.dirname(os.path.abspath(__file__))
vo=json.load(open(f'{HERE}/stage/vo.json'))
st=[];a=0
for d in vo['scenes']: st.append(a); a+=d
total=a; out=sys.argv[1] if len(sys.argv)>1 else f'{HERE}/audio/vo_track.wav'
ins=[];flt=[];labels=[];n=0
for c in vo['cues']:
    f=c.get('audio')
    if not f: continue
    p=f'{HERE}/audio/{f}'
    if not os.path.exists(p): print('missing',f); continue
    start=st[c['s']-1]+c['off']
    ins+=['-i',p]; flt.append(f'[{n}:a]aresample=44100,aformat=channel_layouts=mono,adelay={int(start*1000)}:all=1,volume=1.0[a{n}]'); labels.append(f'[a{n}]'); n+=1
    print(f"  scene {c['s']:>2} @ {start:6.2f}s  {f}")
if n==0: sys.exit('no audio clips found')
flt.append(''.join(labels)+f'amix=inputs={n}:normalize=0:duration=longest,apad=whole_dur={total},atrim=0:{total},alimiter=limit=0.95[m]')
cmd=['ffmpeg','-v','error','-y']+ins+['-filter_complex',';'.join(flt),'-map','[m]','-ar','44100','-ac','1',out]
subprocess.run(cmd,check=True); print('wrote',out,'(%d clips, %.1fs)'%(n,total))
