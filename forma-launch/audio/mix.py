#!/usr/bin/env python3
"""Final audio mix: score + frame-locked SFX (from the cues authored in the timeline).
   python3 mix.py <cues.json> <out.wav>"""
import sys, json
import numpy as np
import soundfile as sf
from dsp import *
from music import build_music, TOTAL
import sfx as S

cues = json.load(open(sys.argv[1]))
out_path = sys.argv[2]
N = int((TOTAL + 3) * SR)

music, _ = build_music()
music = music[:N]

# ── SFX bus (+ shared reverb send) ───────────────────────
# Every cue is a soft sound (see sfx.py); here they're gently band-limited and placed UNDER the music.
dry = np.zeros((N, 2)); send = np.zeros((N, 2))
rs = np.random.default_rng(11)
for i, c in enumerate(cues):
    name = c['name']
    if name not in S.SFX:
        print('!! unknown cue', name); continue
    fn, rv = S.SFX[name]
    kw = {k: v for k, v in c.items() if k not in ('t', 'name')}
    if name == 'pop':
        kw['pn'] = float(rs.uniform(-.2, .2))
    y = fn(**kw)
    place(dry, y, c['t'], 1.0)
    if rv:
        place(send, y, c['t'], rv)
ir = make_ir(1.6, .015, 9, damp=3800)
wet = reverb(send, ir)[:N]
sfx_bus = dry + wet
sfx_bus = lp(hp(sfx_bus, 80, 1), 7500, 2)

# ── duck the music under the big hits so they punch through ─
duck = np.ones(N)
for c in cues:
    if c['name'] == 'thump' and c.get('g', 1) >= .9:
        i0 = int(c['t'] * SR); m = int(.9 * SR); k = np.arange(m) / SR
        d = 1 - .25 * np.exp(-k / .3) * np.minimum(1, k / .01)
        seg = duck[i0:i0 + m]; seg[:] = np.minimum(seg, d[:len(seg)])
music = music * duck[:, None]

MUSIC_G, SFX_G = 1.0, 1.0
mix = music * MUSIC_G + sfx_bus * SFX_G
mix = hp(mix, 25, 2)
mix = limiter(mix, .84)
mix = mix[:int(TOTAL * SR)]
sf.write(out_path, mix, SR, subtype='PCM_24')
print('mix peak %.3f  rms %.1f dBFS' % (np.max(np.abs(mix)), 20 * np.log10(np.sqrt(np.mean(mix ** 2)) + 1e-9)))
sf.write(out_path.replace('.wav', '_music.wav'), (music * MUSIC_G)[:int(TOTAL * SR)], SR, subtype='PCM_24')

sf.write(out_path.replace('.wav', '_sfx.wav'), (sfx_bus * SFX_G)[:int(TOTAL * SR)], SR, subtype='PCM_24')
