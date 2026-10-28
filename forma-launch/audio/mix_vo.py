#!/usr/bin/env python3
"""Lay the Higgsfield voice-over on top of the existing score + SFX stems.

   python3 audio/mix_vo.py <voice> <out.wav>
   needs: out/mix_music.wav, out/mix_sfx.wav (from mix.py) and out/vo/<voice>/NN.mp3 (from vo_fetch.py)

   Each line is trimmed to its speech, levelled, lightly compressed/EQ'd and placed so that the first word
   lands on the beat in manifest.json.  Music and SFX duck softly under the voice (attack before the first
   word, slow release) so every word is clear without the bed disappearing."""
import json, os, subprocess, sys
import numpy as np
import soundfile as sf
from scipy.ndimage import uniform_filter1d
from dsp import *

voice, out_path = sys.argv[1], sys.argv[2]
here = os.path.dirname(os.path.abspath(__file__))
root = os.path.join(here, '..', 'out')
man = json.load(open(os.path.join(here, 'vo', 'manifest.json')))

music, sr = sf.read(os.path.join(root, 'mix_music.wav')); sfx, _ = sf.read(os.path.join(root, 'mix_sfx.wav'))
assert sr == SR
N = len(music)


def decode(path, tempo=1.0):
    af = ['-af', 'atempo=%.4f' % tempo] if abs(tempo - 1) > 1e-4 else []     # pitch-preserving speed change
    r = subprocess.run(['ffmpeg', '-v', 'error', '-i', path] + af + ['-f', 'f32le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True, check=True)
    return np.frombuffer(r.stdout, dtype=np.float32).astype(np.float64)


def rms_env(x, ms=10):
    n = int(ms * SR / 1000)
    return np.sqrt(uniform_filter1d(x ** 2, n) + 1e-12)


# ── voice bus ────────────────────────────────────────────
ir = make_ir(.55, .01, 5, damp=5000)                       # a small, soft room — just enough to sit with the music
dry = np.zeros((N, 2)); send = np.zeros((N, 2))
spans = []                                                 # (start, end) of audible speech, for ducking
TARGET_RMS = 10 ** (-20 / 20)                              # active-speech RMS before the bus gain
BASE_TEMPO, MAX_TEMPO = 1.0, 1.18                          # natural pace; stretch only where a beat demands it
for ln in man['lines']:
    src = os.path.join(root, 'vo', voice, '%02d.mp3' % ln['i'])
    x = decode(src)
    e = rms_env(x)
    idx = np.where(e > e.max() * 10 ** (-28 / 20))[0]
    nat = (idx[-1] - idx[0]) / SR                                           # natural first-to-last-word length
    tempo = min(MAX_TEMPO, max(BASE_TEMPO, nat / max(.5, ln['end'] - ln['t'])))   # just enough to fit before the next beat
    if tempo > 1.0:
        x = decode(src, tempo); e = rms_env(x)
    thr = e.max() * 10 ** (-36 / 20)
    idx = np.where(e > thr)[0]
    a = max(0, idx[0] - int(.045 * SR)); b = min(len(x), idx[-1] + int(.12 * SR))
    x = x[a:b]
    x = hp(x, 90, 2)
    act = x[rms_env(x) > np.max(rms_env(x)) * 10 ** (-24 / 20)]
    x = x * (TARGET_RMS / (np.sqrt(np.mean(act ** 2)) + 1e-9))        # even level from line to line
    x = compress(x, thresh_db=-20, ratio=2.2, attack_ms=8, release_ms=140, makeup_db=1.5)
    x = fade(x, .012, .09)
    t0 = ln['t'] - .045                                    # first word lands on the beat
    pk = np.max(np.abs(x))
    if pk > .95: x *= .95 / pk
    place(dry, x, t0, 1.0)
    place(send, x, t0, 1.0)
    spans.append((ln['t'] - .05, ln['t'] + (idx[-1] - idx[0]) / SR + .10))
    print('line %2d  %5.2f s  speech %.2f s  tempo x%.2f  ends %.2f (limit %.2f)  %s' % (ln['i'], ln['t'], (idx[-1] - idx[0]) / SR, tempo, ln['t'] + (idx[-1] - idx[0]) / SR, ln['end'], ln['text']))

wet = reverb(send, ir)[:N]
vo = dry + wet * .09

# ── gentle ducking of the bed under the voice ───────────
rate = 200                                                 # control-rate (Hz)
m = np.zeros(int(N / SR * rate) + 2)
for s0, s1 in spans:
    m[int(s0 * rate):int(s1 * rate) + 1] = 1
a_, r_ = np.exp(-1 / (rate * .07)), np.exp(-1 / (rate * .40))
env = np.zeros_like(m); cur = 0.0
for i, v in enumerate(m):                                  # fast attack, slow release
    cur = a_ * cur + (1 - a_) * v if v > cur else r_ * cur + (1 - r_) * v
    env[i] = cur
duck = lambda depth_db: np.interp(np.arange(N) / SR, np.arange(len(env)) / rate, 10 ** (-depth_db * env / 20))
dm, ds = duck(5.0), duck(3.0)
bed_m, bed_s = music * dm[:, None], sfx * ds[:, None]

# ── balance: voice sits ~+10 dB over what's under it ─────
speech = np.zeros(N, bool)
for s0, s1 in spans: speech[int(s0 * SR):int(s1 * SR)] = True
bed = (bed_m + bed_s)[speech]
vo_act = vo[speech]
ratio_db = 20 * np.log10(np.sqrt(np.mean(vo_act ** 2)) / np.sqrt(np.mean(bed ** 2)))
BEDG = 10 ** ((ratio_db - 10.0) / 20)                      # lower the bed (not raise the voice): keeps the limiter idle
print('voice/bed under speech: %.1f dB  ->  bed gain %.2f (%.1f dB) for +10 dB' % (ratio_db, BEDG, 20 * np.log10(BEDG)))

mix = (bed_m + bed_s) * BEDG + vo
mix = hp(mix, 25, 2)
mix = limiter(mix, .84)
sf.write(out_path, mix, SR, subtype='PCM_24')
sf.write(out_path.replace('.wav', '_voice.wav'), np.clip(vo, -1, 1), SR, subtype='PCM_24')
print('mix peak %.3f' % np.max(np.abs(mix)))
