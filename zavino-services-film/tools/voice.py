#!/usr/bin/env python3
"""Download the Higgsfield narration clips in voice/clips.json, trim each to its speech, balance levels (keeping
some of the natural loud/quiet difference) and write voice/<key>.wav (48 kHz mono), plus voice/marks.json:
for each clip, the time (s) each " / "-separated chunk starts being spoken, from word timings."""
import json, os, re, subprocess, numpy as np, soundfile as sf
from scipy.ndimage import uniform_filter1d
here = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'voice')
m = json.load(open(os.path.join(here, 'clips.json')))
SR = 48000
from faster_whisper import WhisperModel
asr = WhisperModel('base.en', device='cpu', compute_type='int8', local_files_only=True)
clips, marks = {}, {}
for c in m['clips']:
    k = c['key']; raw = os.path.join(here, 'raw-%s.mp3' % k)
    if not os.path.exists(raw) or os.path.getsize(raw) < 1000:
        subprocess.run(['curl', '-sS', '-m', '90', '--fail', '-o', raw, m['cdn'] + c['id'] + '.mp3'], check=True)
    r = subprocess.run(['ffmpeg', '-v', 'error', '-i', raw, '-f', 'f32le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True, check=True)
    x = np.frombuffer(r.stdout, dtype=np.float32).astype(np.float64)
    e = np.sqrt(uniform_filter1d(x ** 2, int(.01 * SR)) + 1e-12)
    idx = np.where(e > e.max() * 10 ** (-36 / 20))[0]
    y = x[max(0, idx[0] - int(.04 * SR)):min(len(x), idx[-1] + int(.10 * SR))].copy()
    n = int(.01 * SR); y[:n] *= np.linspace(0, 1, n); q = int(.06 * SR); y[-q:] *= np.linspace(1, 0, q)
    segs, _ = asr.transcribe(np.asarray(y[::3], dtype=np.float32), language='en', word_timestamps=True)
    W = [(w.start, w.word) for s in segs for w in s.words]
    chunks = [p.strip() for p in c['chunks'].split('/') if p.strip()]
    counts = [len(p.split()) for p in chunks]
    if len(W) == sum(counts):
        st, i = [], 0
        for n_ in counts: st.append(W[i][0]); i += n_
        how = 'exact'
    else:
        L = sum(len(p) + 4 for p in chunks); dur = len(y) / SR; acc = 0; st = []
        for p in chunks:
            gss = dur * acc / L; acc += len(p) + 4
            near = min(W, key=lambda w: abs(w[0] - gss)) if W else None
            st.append(near[0] if near and abs(near[0] - gss) < 0.4 else gss)
        how = 'guess %d/%d words' % (len(W), sum(counts))
    st[0] = 0.0
    clips[k] = y; marks[k] = [round(float(v), 3) for v in st]
    print('%-3s %.2f s  marks %s  %s | %s' % (k, len(y) / SR, marks[k], how, ' '.join(w for _, w in W)))
keys = list(clips)
rms = np.array([20 * np.log10(np.sqrt(np.mean(clips[k][np.abs(clips[k]) > .01 * np.abs(clips[k]).max()] ** 2)) + 1e-9) for k in keys])
gain = (rms.mean() + m.get('keep_dynamics', 0.6) * (rms - rms.mean())) - rms
gain += 20 * np.log10(.9 / max(np.max(np.abs(clips[k])) * 10 ** (g / 20) for k, g in zip(keys, gain)))
for k, g in zip(keys, gain): sf.write(os.path.join(here, '%s.wav' % k), np.clip(clips[k] * 10 ** (g / 20), -1, 1), SR, subtype='PCM_16')
json.dump(marks, open(os.path.join(here, 'marks.json'), 'w'), indent=1)
