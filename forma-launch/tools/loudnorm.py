#!/usr/bin/env python3
"""Master to -14 LUFS with true-peak <= ~-1.5 dB:  gain -> transparent limiter -> verify (iterated).
   (Plain loudnorm falls back to dynamic mode on material with sparse peaks, so we do the gain ourselves.)
   Usage: loudnorm.py in.wav out.wav"""
import os, re, subprocess, sys, tempfile
import numpy as np, soundfile as sf
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'audio'))
from dsp import limiter

src, dst = sys.argv[1], sys.argv[2]
x, sr = sf.read(src)

def measure(a):
    with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as f:
        sf.write(f.name, a, sr, subtype='PCM_24')
        r = subprocess.run(['ffmpeg', '-nostats', '-i', f.name, '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True).stderr
    os.unlink(f.name)
    s = r[r.rindex('Summary:'):]
    return float(re.search(r'I:\s+(-?[\d.]+) LUFS', s).group(1)), float(re.search(r'Peak:\s+(-?[\d.]+) dBFS', s).group(1))

CEIL = .80                                   # ~ -1.9 dBFS sample peak
y = x
for _ in range(4):
    I, TP = measure(y)
    if abs(-14 - I) < .15 and TP <= -1.4:
        break
    y = limiter(y * 10 ** ((-14 - I) / 20), CEIL, look_ms=4, rel_ms=120)
I, TP = measure(y)
sf.write(dst, y, sr, subtype='PCM_24')
print('Output Integrated: %.1f LUFS   True Peak: %.1f dBTP' % (I, TP))
