#!/usr/bin/env python3
"""Visual + numeric audio QA (I can't listen, so I inspect structure, balance and sync).
Usage: analyze.py <in.wav> <out.png> [cues.json]"""
import sys, json
import numpy as np
import soundfile as sf
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from scipy import signal

x, sr = sf.read(sys.argv[1])
if x.ndim > 1: m = x.mean(axis=1)
else: m = x
dur = len(m) / sr
fig, ax = plt.subplots(4, 1, figsize=(20, 11), sharex=True, gridspec_kw={'height_ratios': [1.1, 2.2, 1.2, 0.8]})
t = np.arange(len(m)) / sr
# envelope
w = int(sr * .02)
env = np.sqrt(np.convolve(m ** 2, np.ones(w) / w, mode='same'))
ax[0].fill_between(t, -env, env, color='#3448ed', lw=0)
ax[0].plot(t, np.clip(m, -1, 1), color='#3448ed', lw=.15, alpha=.35)
ax[0].set_ylim(-1, 1); ax[0].set_ylabel('waveform')
f, tt, S = signal.spectrogram(m, sr, nperseg=2048, noverlap=1536)
ax[1].pcolormesh(tt, f, 10 * np.log10(S + 1e-12), shading='auto', cmap='magma', vmin=-110, vmax=-35)
ax[1].set_yscale('symlog', linthresh=200); ax[1].set_ylim(30, 20000); ax[1].set_ylabel('spectrogram (Hz)')
# bands over time
bands = {'sub 30-80': (30, 80), 'bass 80-250': (80, 250), 'mid 250-2k': (250, 2000), 'high 2-8k': (2000, 8000), 'air 8k+': (8000, 20000)}
cols = ['#222', '#3448ed', '#2f8a5b', '#d9822b', '#c23b6e']
for (name, (lo, hi)), c in zip(bands.items(), cols):
    idx = (f >= lo) & (f < hi)
    e = 10 * np.log10(S[idx].sum(axis=0) + 1e-14)
    ax[2].plot(tt, e, label=name, color=c, lw=1)
ax[2].legend(ncol=5, fontsize=8, loc='lower center'); ax[2].set_ylabel('band dB')
# short-term loudness proxy
hop = int(sr * .1)
rms = [20 * np.log10(np.sqrt(np.mean(m[i:i + sr // 2] ** 2)) + 1e-9) for i in range(0, len(m) - sr // 2, hop)]
ax[3].plot(np.arange(len(rms)) * .1, rms, color='#444'); ax[3].set_ylabel('RMS dBFS (0.5s)'); ax[3].set_xlabel('seconds')
if len(sys.argv) > 3:
    cues = json.load(open(sys.argv[3]))
    for c in cues:
        col = {'impact': 'red', 'boom': 'orange', 'riser': 'purple', 'tick': '#08a'}.get(c['name'])
        if col:
            for a in ax[:2]: a.axvline(c['t'], color=col, lw=.7, alpha=.7)
for a in ax:
    a.set_xlim(0, dur); a.set_xticks(np.arange(0, dur, 2)); a.grid(alpha=.15)
plt.tight_layout(); plt.savefig(sys.argv[2], dpi=70)
print('peak %.3f  rms %.3f dBFS  dur %.2fs' % (np.max(np.abs(x)), 20 * np.log10(np.sqrt(np.mean(m ** 2)) + 1e-9), dur))
