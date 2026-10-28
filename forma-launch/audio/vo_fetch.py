#!/usr/bin/env python3
"""Download the Higgsfield voice-over clips listed in audio/vo/manifest.json -> out/vo/<voice>/NN.mp3"""
import json, os, subprocess, sys
here = os.path.dirname(os.path.abspath(__file__))
m = json.load(open(os.path.join(here, 'vo', 'manifest.json')))
root = os.path.join(here, '..', 'out', 'vo')
for voice in m['voices']:
    os.makedirs(os.path.join(root, voice), exist_ok=True)
    for ln in m['lines']:
        dst = os.path.join(root, voice, '%02d.mp3' % ln['i'])
        if os.path.exists(dst) and os.path.getsize(dst) > 1000: continue
        url = m['cdn'] + ln[voice] + '.mp3'
        subprocess.run(['curl', '-sS', '-m', '90', '--fail', '-o', dst, url], check=True)
        print(voice, ln['i'], os.path.getsize(dst))
