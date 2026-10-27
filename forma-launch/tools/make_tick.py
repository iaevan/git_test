#!/usr/bin/env python3
"""Forma's wheel tick, regenerated from the app's own source (forma.thezavino.com main bundle, function Hv):

  t = new Float32Array(Math.ceil(sr * .035)); n = 17
  for r in 0..len: i = r / sr; n = Math.imul(n, 1664525) + 1013904223 | 0
      a = Math.min(1, i / .0015) * Math.exp(-i * 180) * (1 - r / len)
      o = Math.sin(2 * Math.PI * (1400 * i - 9e3 * i * i))
      t[r] = a * (o * .055 + n / 2147483648 * .012)

Writes assets/sfx/forma-tick.wav (48 kHz mono 16-bit, gain-matched so it is audible next to other effects).
"""
import math, struct, wave, sys, os

SR = 48000
GAIN = float(sys.argv[1]) if len(sys.argv) > 1 else 1.0   # applied after peak-normalising to -6 dBFS

def i32(x):
    x &= 0xFFFFFFFF
    return x - (1 << 32) if x & 0x80000000 else x

def tick(sr=SR):
    ln = math.ceil(sr * 0.035)
    out = []; n = 17
    for r in range(ln):
        i = r / sr
        n = i32(i32(n * 1664525) + 1013904223)
        a = min(1.0, i / 0.0015) * math.exp(-i * 180) * (1 - r / ln)
        o = math.sin(2 * math.pi * (1400 * i - 9000 * i * i))
        out.append(a * (o * 0.055 + n / 2147483648 * 0.012))
    return out

if __name__ == '__main__':
    s = tick()
    peak = max(abs(x) for x in s)
    scale = (10 ** (-6 / 20)) / peak * GAIN
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    path = os.path.join(root, 'assets', 'sfx', 'forma-tick.wav')
    with wave.open(path, 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes(b''.join(struct.pack('<h', max(-32767, min(32767, int(x * scale * 32767)))) for x in s))
    print(f'forma-tick.wav: {len(s)} samples ({len(s)/SR*1000:.1f} ms), app peak {peak:.4f} ({20*math.log10(peak):.1f} dBFS) -> normalised to -6 dBFS (x{scale/GAIN:.1f})')
