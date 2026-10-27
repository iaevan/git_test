#!/usr/bin/env python3
"""Two-pass, linear (no pumping) loudness normalisation to -14 LUFS / -1.5 dBTP.  Usage: loudnorm.py in.wav out.wav"""
import json, subprocess, sys
src, dst = sys.argv[1], sys.argv[2]
p1 = subprocess.run(['ffmpeg', '-nostats', '-i', src, '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'], capture_output=True, text=True).stderr
j = json.loads(p1[p1.index('{'):p1.rindex('}') + 1])
f = ('loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=%s:measured_TP=%s:measured_LRA=%s:measured_thresh=%s:offset=%s:linear=true:print_format=summary'
     % (j['input_i'], j['input_tp'], j['input_lra'], j['input_thresh'], j['target_offset']))
r = subprocess.run(['ffmpeg', '-nostats', '-y', '-i', src, '-af', f, '-ar', '48000', '-c:a', 'pcm_s24le', dst], capture_output=True, text=True)
print(r.stderr[r.stderr.rindex('Input Integrated'):] if 'Input Integrated' in r.stderr else r.stderr[-400:])
