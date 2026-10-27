#!/usr/bin/env python3
"""Mix every sound cue in data/cues.json into assets/sfx/mix.wav (48 kHz stereo, SFX only: no music, no voice).

Each cue's `t` is the film time at which the sound's *hit* must land, so the file is placed at t - hit.
Effects come from assets/sfx (HyperFrames' bundled Pixabay library) plus forma-tick.wav, the app's own wheel tick.
Variation is deterministic (index based) so repeated whooshes / pops / clicks never play identically.
"""
import json, math, os, subprocess, sys
import numpy as np

SR = 48000
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SFX = os.path.join(ROOT, 'assets', 'sfx')
TRUE_PEAK = -2.0   # sparse SFX have a high crest factor: normalise by true peak, not by integrated loudness

# name -> (file, hit seconds into the file, extra ffmpeg filters, default segment)
LIB = {
    'whoosh':           ('whoosh.mp3',           0.161, '', None),
    'whoosh-short':     ('whoosh-short.mp3',     0.161, 'highpass=f=220', None),
    'pop':              ('pop.mp3',              0.120, '', None),
    'click':            ('click.mp3',            0.073, '', None),
    'click-soft':       ('click-soft.mp3',       0.073, 'lowpass=f=7000', None),
    'key':              ('key-press.mp3',        0.077, '', None),
    'sparkle':          ('sparkle.mp3',          0.028, '', None),
    'chime':            ('chime.mp3',            0.419, '', None),
    'tick':             ('forma-tick.wav',       0.003, '', None),
    'impact':           ('impact-bass-1.mp3',    0.048, 'highpass=f=62,afade=t=out:st=0.55:d=0.65', (0.0, 1.25)),
    'riser':            ('riser.mp3',            0.0,   'afade=t=in:st=0:d=0.7', (1.6, 4.15)),
    'whoosh-cinematic': ('whoosh-cinematic.mp3', 0.95,  'afade=t=in:st=0:d=0.35,afade=t=out:st=0.95:d=0.3', (1.55, 2.8)),
}
JITTER = {'whoosh': [0, -0.8, 0.7, -0.4, 0.5], 'whoosh-short': [0, 0.9, -0.7, 0.4, -0.3, 0.6],
          'pop': [0, 0.35, -0.3, 0.2], 'click': [0, 0.3, -0.25, 0.15], 'click-soft': [0, 0.3, -0.25, 0.15]}
GJIT = [0, -0.6, 0.5, -0.3, 0.4]


def decode(name, pitch, seg):
    f, hit, flt, dseg = LIB[name]
    seg = seg or dseg
    chain = []
    if seg: chain.append(f'atrim=start={seg[0]}:end={seg[1]},asetpts=PTS-STARTPTS')
    if pitch:
        r = 2 ** (pitch / 12.0)
        chain += [f'asetrate={int(SR * r)}', f'aresample={SR}']
    if flt: chain.append(flt)
    cmd = ['ffmpeg', '-v', 'error', '-i', os.path.join(SFX, f), '-ac', '1', '-ar', str(SR)]
    if chain: cmd += ['-af', ','.join(chain)]
    cmd += ['-f', 'f32le', '-']
    x = np.frombuffer(subprocess.run(cmd, capture_output=True, check=True).stdout, dtype=np.float32).copy()
    r = 2 ** (pitch / 12.0) if pitch else 1.0
    hit_s = (hit - (seg[0] if seg else 0)) / r
    # normalise each source to a -1 dBFS peak so `gain` is a predictable mix level
    pk = float(np.abs(x).max()) or 1.0
    return x / pk * 0.891, max(0.0, hit_s)


def main():
    spec = json.load(open(os.path.join(ROOT, 'data', 'cues.json')))
    film = spec['film']; n = int((film + 1.0) * SR)
    L = np.zeros(n, dtype=np.float64); R = np.zeros(n, dtype=np.float64)
    cache = {}; counts = {}
    for c in spec['cues']:
        name = c['name']
        if name not in LIB: print('unknown cue', name); continue
        i = counts.get(name, 0); counts[name] = i + 1
        pitch = c.get('pitch', 0) + (JITTER.get(name, [0])[i % len(JITTER.get(name, [0]))])
        pitch = round(pitch * 2) / 2   # half-semitone grid keeps the cache small
        seg = tuple(c['seg']) if c.get('seg') else None
        key = (name, pitch, seg)
        if key not in cache: cache[key] = decode(name, pitch, seg)
        x, hit = cache[key]
        gain_db = c.get('gain', -10) + GJIT[i % len(GJIT)]
        g = 10 ** (gain_db / 20)
        start = int(round((c['t'] - hit) * SR))
        a = max(0, start); b = min(n, start + len(x))
        if b <= a: continue
        seg_x = x[a - start:b - start] * g
        pan = c.get('pan', 0.0)  # -1..1
        L[a:b] += seg_x * math.cos((pan + 1) * math.pi / 4); R[a:b] += seg_x * math.sin((pan + 1) * math.pi / 4)
    raw = os.path.join(ROOT, 'assets', 'sfx', '_mix_raw.wav')
    st = np.stack([L, R], axis=1).astype(np.float32)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', '-c:a', 'pcm_f32le', raw], input=st.tobytes(), check=True)
    # measure the true peak, apply the linear gain that puts it at TRUE_PEAK, then a safety limiter
    meas = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', raw, '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True).stderr
    lufs = float(meas.split('I:')[-1].split('LUFS')[0]); tp = float(meas.split('Peak:')[-1].split('dBFS')[0])
    gain = TRUE_PEAK - tp
    out = os.path.join(ROOT, 'assets', 'sfx', 'mix.wav')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', raw, '-af', f'volume={gain:.2f}dB,alimiter=limit={10 ** (TRUE_PEAK / 20):.4f}:attack=1:release=60:level=disabled,atrim=0:{film}', '-ar', str(SR), '-c:a', 'pcm_s16le', out], check=True)
    os.remove(raw)
    chk = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', out, '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True).stderr
    lufs2 = float(chk.split('I:')[-1].split('LUFS')[0]); tp2 = float(chk.split('Peak:')[-1].split('dBFS')[0])
    print(f'{len(spec["cues"])} cues -> {os.path.relpath(out, ROOT)}  raw {lufs:.1f} LUFS / {tp:.1f} dBTP  ->  final {lufs2:.1f} LUFS / {tp2:.1f} dBTP  ({film:.2f}s)')
    print('cues by sound:', ', '.join(f'{k}={v}' for k, v in sorted(counts.items())))


if __name__ == '__main__':
    main()
