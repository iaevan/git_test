#!/usr/bin/env python3
"""Download the Higgsfield narration clips in voice/clips.json and trim each to its speech -> voice/NN.wav (48 kHz mono)."""
import json, os, subprocess, numpy as np, soundfile as sf
from scipy.ndimage import uniform_filter1d
here = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'voice')
m = json.load(open(os.path.join(here, 'clips.json')))
SR = 48000
for i, ln in enumerate(m['lines'], 1):
    raw = os.path.join(here, 'raw-%02d.mp3' % i)
    if not os.path.exists(raw) or os.path.getsize(raw) < 1000:
        subprocess.run(['curl', '-sS', '-m', '90', '--fail', '-o', raw, m['cdn'] + ln['id'] + '.mp3'], check=True)
    af = ['-af', 'atempo=%.3f' % ln['tempo']] if ln.get('tempo') else []     # optional pitch-preserving speed-up for lines with long pauses
    r = subprocess.run(['ffmpeg', '-v', 'error', '-i', raw] + af + ['-f', 'f32le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True, check=True)
    x = np.frombuffer(r.stdout, dtype=np.float32).astype(np.float64)
    e = np.sqrt(uniform_filter1d(x ** 2, int(.01 * SR)) + 1e-12)
    idx = np.where(e > e.max() * 10 ** (-36 / 20))[0]
    a, b = max(0, idx[0] - int(.04 * SR)), min(len(x), idx[-1] + int(.10 * SR))
    y = x[a:b].copy()
    n = int(.01 * SR); y[:n] *= np.linspace(0, 1, n); m_ = int(.06 * SR); y[-m_:] *= np.linspace(1, 0, m_)
    y *= .9 / max(np.max(np.abs(y)), 1e-6)
    sf.write(os.path.join(here, '%02d.wav' % i), y, SR, subtype='PCM_16')
    print('%02d  %.2f s  %s' % (i, len(y) / SR, ln['say']))
