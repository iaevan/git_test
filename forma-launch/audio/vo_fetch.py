#!/usr/bin/env python3
"""Download the Higgsfield voice-over clips listed in audio/vo/manifest.json -> out/vo/<clip>.mp3"""
import json, os, subprocess
here = os.path.dirname(os.path.abspath(__file__))
m = json.load(open(os.path.join(here, 'vo', 'manifest.json')))
root = os.path.join(here, '..', 'out', 'vo')
os.makedirs(root, exist_ok=True)
for key, c in m['clips'].items():
    dst = os.path.join(root, key + '.mp3')
    if os.path.exists(dst) and os.path.getsize(dst) > 1000: continue
    subprocess.run(['curl', '-sS', '-m', '90', '--fail', '-o', dst, m['cdn'] + c['id'] + '.mp3'], check=True)
    print(key, os.path.getsize(dst))
