#!/usr/bin/env python3
"""Download the Higgsfield narration clips in voice/clips.json, slow them a touch, trim each to its speech,
insert breathing room at chosen caption-chunk boundaries, and write
  voice/NN.wav     (48 kHz mono)
  voice/marks.json for each line, the time (s) each caption chunk starts being spoken (from word timings),
                   so the video cuts on the words instead of on a guess.
Per-line options in clips.json: "tempo" (default 0.95 = a little slower), "gaps": {"<chunk index>": seconds of silence before that chunk}."""
import json, os, re, subprocess, numpy as np, soundfile as sf
from scipy.ndimage import uniform_filter1d
root = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
here = os.path.join(root, 'voice')
m = json.load(open(os.path.join(here, 'clips.json')))
short = json.load(open(os.path.join(root, 'short.json')))
SR = 48000
DEFAULT_TEMPO = m.get('tempo', 0.95)

from faster_whisper import WhisperModel
asr = WhisperModel('base.en', device='cpu', compute_type='int8', local_files_only=True)

def norm(w): return re.sub(r'[^a-z0-9]', '', w.lower())

marks_all = []
for i, ln in enumerate(m['lines'], 1):
    raw = os.path.join(here, 'raw-%02d.mp3' % i)
    if not os.path.exists(raw) or os.path.getsize(raw) < 1000:
        subprocess.run(['curl', '-sS', '-m', '90', '--fail', '-o', raw, m['cdn'] + ln['id'] + '.mp3'], check=True)
    tempo = ln.get('tempo', DEFAULT_TEMPO)
    af = ['-af', 'atempo=%.3f' % tempo] if tempo and abs(tempo - 1) > 1e-3 else []
    r = subprocess.run(['ffmpeg', '-v', 'error', '-i', raw] + af + ['-f', 'f32le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True, check=True)
    x = np.frombuffer(r.stdout, dtype=np.float32).astype(np.float64)
    e = np.sqrt(uniform_filter1d(x ** 2, int(.01 * SR)) + 1e-12)
    idx = np.where(e > e.max() * 10 ** (-36 / 20))[0]
    a, b = max(0, idx[0] - int(.04 * SR)), min(len(x), idx[-1] + int(.10 * SR))
    y = x[a:b].copy()
    # word timings on the trimmed clip
    y16 = np.asarray(y[::3], dtype=np.float32)
    segs, _ = asr.transcribe(y16, language='en', word_timestamps=True)
    W = [(w.start, w.end, w.word) for s in segs for w in s.words]
    # caption chunks of this line (as written in short.json)
    cap = short['lines'][i - 1].get('caption') or short['lines'][i - 1]['say']
    chunks = [c.strip() for c in cap.split('/') if c.strip()] if '/' in cap else [cap]
    counts = [len(c.split()) for c in chunks]
    tot = sum(counts)
    if len(W) == tot:                                   # words line up one to one: exact
        starts = []; k = 0
        for c in counts: starts.append(W[k][0]); k += c
        ends = []; k = 0
        for c in counts: k += c; ends.append(W[k - 1][1])
    else:                                               # fall back to a character-proportional guess, snapped to the nearest word start
        L = sum(len(c) + 4 for c in chunks); dur = len(y) / SR; acc = 0; starts = []
        for c in chunks:
            g = dur * acc / L; acc += len(c) + 4
            near = min(W, key=lambda w: abs(w[0] - g)) if W else None
            starts.append(near[0] if near and abs(near[0] - g) < 0.35 else g)
        ends = [starts[j + 1] - 0.05 for j in range(len(chunks) - 1)] + [len(y) / SR]
    starts[0] = 0.0
    # breathing room: split in the pause before a chunk and insert silence there
    gaps = {int(k): float(v) for k, v in (ln.get('gaps') or {}).items()}
    shift = 0.0; pieces = []; prev_cut = 0
    marks = []
    for j in range(len(chunks)):
        if j > 0 and gaps.get(j):
            cut_t = max(ends[j - 1] + 0.02, starts[j] - 0.12) if starts[j] - ends[j - 1] > 0.1 else starts[j] - 0.04
            cut = int(cut_t * SR)
            pieces.append(y[prev_cut:cut]); pieces.append(np.zeros(int(gaps[j] * SR))); prev_cut = cut; shift += gaps[j]
        marks.append(round(starts[j] + shift, 3))
    pieces.append(y[prev_cut:]); y = np.concatenate(pieces)
    n = int(.01 * SR); y[:n] *= np.linspace(0, 1, n); m_ = int(.06 * SR); y[-m_:] *= np.linspace(1, 0, m_)
    y *= .9 / max(np.max(np.abs(y)), 1e-6)
    sf.write(os.path.join(here, '%02d.wav' % i), y, SR, subtype='PCM_16')
    marks_all.append(marks)
    print('%02d  %.2f s  marks %s  %s' % (i, len(y) / SR, marks, 'exact' if len(W) == tot else 'guess(%d/%d words)' % (len(W), tot)))
json.dump(marks_all, open(os.path.join(here, 'marks.json'), 'w'))
