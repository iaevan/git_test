"""Small DSP toolkit (numpy/scipy only) for the Forma launch film's music + SFX."""
import re
import numpy as np
from scipy import signal

SR = 48000

_N = {'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3, 'E': 4, 'F': 5, 'F#': 6, 'Gb': 6,
      'G': 7, 'G#': 8, 'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11}


def midi(n):
    if not isinstance(n, str):
        return n
    m = re.match(r'([A-G][#b]?)(-?\d)', n)
    return 12 * (int(m.group(2)) + 1) + _N[m.group(1)]


def hz(n):
    return 440.0 * 2 ** ((midi(n) - 69) / 12)


def tt(n):
    return np.arange(n) / SR


def exp_env(n, tau):
    return np.exp(-np.arange(n) / (SR * tau))


def adsr(n, a, d, s, r):
    """n-sample envelope: attack a, decay d to level s, release r at the tail (seconds)."""
    na, nd, nr = int(a * SR), int(d * SR), int(r * SR)
    nr = min(nr, n)
    env = np.ones(n)
    na = max(na, 1)
    env[:min(na, n)] = np.linspace(0, 1, min(na, n), endpoint=False)
    if n > na:
        nd_ = min(nd, n - na)
        env[na:na + nd_] = np.linspace(1, s, nd_, endpoint=False)
        env[na + nd_:] = s
    if nr > 0:
        env[n - nr:] *= np.linspace(1, 0, nr)
    return env


def fade(x, a=0.002, r=0.006):
    """tiny fades so nothing ever clicks"""
    x = x.copy()
    na, nr = int(a * SR), int(r * SR)
    if len(x) > na > 0:
        x[:na] *= np.linspace(0, 1, na)
    if len(x) > nr > 0:
        x[-nr:] *= np.linspace(1, 0, nr)
    return x


def noise(n, seed=0):
    return np.random.default_rng(seed).standard_normal(n).astype(np.float64)


# ── filters ────────────────────────────────────────────────
def _sos(kind, fc, order=2, fc2=None):
    ny = SR / 2
    if kind == 'bp':
        return signal.butter(order, [max(fc, 20) / ny, min(fc2, ny * .98) / ny], 'band', output='sos')
    return signal.butter(order, min(fc, ny * .98) / ny, kind, output='sos')


def lp(x, fc, order=2):
    return signal.sosfilt(_sos('low', fc, order), x, axis=0)


def hp(x, fc, order=2):
    return signal.sosfilt(_sos('high', fc, order), x, axis=0)


def bp(x, lo, hi, order=2):
    return signal.sosfilt(_sos('bp', lo, order, hi), x, axis=0)


def sweep_filter(x, fc, q=1.0, kind='lp', block=128):
    """Time-varying RBJ biquad. fc is an array (len(x)) of cutoff/centre frequencies in Hz."""
    x = np.asarray(x, dtype=np.float64)
    y = np.zeros_like(x)
    zi = np.zeros((1, 2))
    n = len(x)
    for s in range(0, n, block):
        e = min(n, s + block)
        f = float(np.clip(fc[min(s + block // 2, n - 1)], 25, SR * .45))
        w0 = 2 * np.pi * f / SR
        c, sn = np.cos(w0), np.sin(w0)
        al = sn / (2 * q)
        if kind == 'lp':
            b0, b1, b2 = (1 - c) / 2, 1 - c, (1 - c) / 2
        elif kind == 'hp':
            b0, b1, b2 = (1 + c) / 2, -(1 + c), (1 + c) / 2
        else:  # constant 0 dB peak band-pass
            b0, b1, b2 = al, 0.0, -al
        a0, a1, a2 = 1 + al, -2 * c, 1 - al
        sos = np.array([[b0 / a0, b1 / a0, b2 / a0, 1.0, a1 / a0, a2 / a0]])
        y[s:e], zi = signal.sosfilt(sos, x[s:e], zi=zi)
    return y


# ── oscillators ────────────────────────────────────────────
def saw(f, n, phase=0.0):
    """band-limited (PolyBLEP) sawtooth at constant frequency f."""
    dt = f / SR
    ph = (phase + dt * np.arange(n)) % 1.0
    y = 2 * ph - 1
    m = ph < dt
    t = ph[m] / dt
    y[m] -= (t + t - t * t - 1)
    m = ph > 1 - dt
    t = (ph[m] - 1) / dt
    y[m] -= (t * t + t + t + 1)
    return y


def sine(f, n, phase=0.0):
    return np.sin(2 * np.pi * f * np.arange(n) / SR + phase)


def tri(f, n):
    return 2 / np.pi * np.arcsin(np.sin(2 * np.pi * f * np.arange(n) / SR))


def pluck(f, dur, bright=1.0, detune=0.0035, n_harm=14, tau0=0.40, seed=0):
    """additive pluck: every harmonic decays faster than the one below it (a built-in filter sweep)."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    out = np.zeros(n)
    for k in range(1, n_harm + 1):
        if f * k > SR * 0.42:
            break
        tau = tau0 / (1 + bright * 0.55 * (k - 1))
        a = (1.0 / k) * np.exp(-t / tau)
        out += a * np.sin(2 * np.pi * f * k * t + 0.7 * k)
        if detune:
            out += 0.6 * a * np.sin(2 * np.pi * f * (1 + detune) * k * t + 1.9 * k)
    out *= np.minimum(1, t / 0.003)
    return out / (np.max(np.abs(out)) + 1e-9)


def bell(f, dur, tau=0.5, partials=(1, 2.0, 3.01, 4.2, 5.4), amps=(1, .55, .35, .22, .12)):
    n = int(dur * SR)
    t = np.arange(n) / SR
    out = np.zeros(n)
    for p, a in zip(partials, amps):
        if f * p > SR * 0.42:
            break
        out += a * np.sin(2 * np.pi * f * p * t) * np.exp(-t / (tau / (1 + .5 * (p - 1))))
    out *= np.minimum(1, t / 0.002)
    return out / (np.max(np.abs(out)) + 1e-9)


# ── stereo / space ─────────────────────────────────────────
def pan(x, p):
    """equal-power pan, p in [-1, 1]. Returns (n, 2)."""
    a = (p + 1) * np.pi / 4
    return np.stack([x * np.cos(a), x * np.sin(a)], axis=1)


def to_stereo(x):
    x = np.asarray(x)
    return np.stack([x, x], axis=1) if x.ndim == 1 else x


def place(buf, sig, t0, gain=1.0):
    """add sig (n or n×2) into buf (N×2) at time t0 seconds."""
    sig = to_stereo(sig) * gain
    i = int(round(t0 * SR))
    if i >= len(buf) or i + len(sig) <= 0:
        return
    s0 = max(0, -i)
    e = min(len(sig), len(buf) - i)
    buf[i + s0:i + e] += sig[s0:e]


def make_ir(rt60=1.6, predelay=0.012, seed=1, damp=7500):
    n = int((rt60 + predelay) * SR * 1.05)
    t = np.arange(n) / SR
    env = np.exp(-6.91 * np.maximum(t - predelay, 0) / rt60)
    env[t < predelay] = 0
    ir = np.stack([noise(n, seed), noise(n, seed + 1)], axis=1) * env[:, None]
    ir = lp(ir, damp)
    ir = hp(ir, 140)
    ir /= np.sqrt(np.sum(ir ** 2, axis=0, keepdims=True)) + 1e-9
    return ir


def reverb(x, ir, tail=True):
    """stereo convolution reverb (wet only)."""
    out = np.stack([signal.fftconvolve(x[:, c], ir[:, c]) for c in range(2)], axis=1)
    return out if tail else out[:len(x)]


def pingpong(x_mono, delay_s, fb=0.45, taps=5):
    """ping-pong echo (wet only) from a mono signal. Returns (n+tail, 2)."""
    d = int(delay_s * SR)
    out = np.zeros((len(x_mono) + d * taps, 2))
    for k in range(1, taps + 1):
        g = fb ** (k - 1) * 0.8
        ch = (k - 1) % 2
        out[d * k:d * k + len(x_mono), ch] += x_mono * g
    return out


def sidechain_curve(n, times, depth=0.6, tau=0.11, attack=0.004):
    """gain curve that ducks after each trigger time (kick)."""
    g = np.ones(n)
    for tk in times:
        i0 = int(tk * SR)
        if i0 >= n:
            continue
        m = min(n - i0, int(tau * 6 * SR))
        k = np.arange(m) / SR
        c = 1 - depth * np.exp(-k / tau) * np.minimum(1, k / attack)
        g[i0:i0 + m] = np.minimum(g[i0:i0 + m], c)
    return g


def soft_clip(x, drive=1.0):
    return np.tanh(x * drive)


def limiter(x, ceiling=0.9, look_ms=3.0, rel_ms=90.0, blk=48):
    """transparent-ish peak limiter: block-min gain with instant attack + smoothed release, linearly interpolated."""
    from scipy.ndimage import maximum_filter1d
    pk = np.max(np.abs(x), axis=1) if x.ndim > 1 else np.abs(x)
    pk = maximum_filter1d(pk, size=int(look_ms * SR / 1000) * 2 + 1)
    nb = len(pk) // blk
    pb = pk[:nb * blk].reshape(nb, blk).max(axis=1)
    g = np.minimum(1.0, ceiling / (pb + 1e-9))
    rel = np.exp(-blk / (SR * rel_ms / 1000))
    sm = np.empty(nb); cur = 1.0
    for i in range(nb):
        cur = g[i] if g[i] < cur else min(g[i], cur + (1 - cur) * (1 - rel))   # instant attack, smooth release
        sm[i] = cur
    # a gain that is also ≤ every neighbouring block's target (no overshoot between block centres)
    sm = np.minimum(sm, np.minimum(np.roll(g, 1), np.roll(g, -1)))
    gain = np.interp(np.arange(len(pk)), (np.arange(nb) + .5) * blk, sm)
    return x * (gain[:, None] if x.ndim > 1 else gain)


def compress(x, thresh_db=-20.0, ratio=2.5, attack_ms=12.0, release_ms=180.0, makeup_db=0.0, blk=48):
    """gentle feed-forward bus compressor (stereo-linked, block-rate gain computer + smoothed gain)."""
    n = len(x)
    lvl = np.max(np.abs(x), axis=1) if x.ndim > 1 else np.abs(x)
    nb = n // blk
    pk = lvl[:nb * blk].reshape(nb, blk).max(axis=1)
    db = 20 * np.log10(pk + 1e-9)
    over = np.maximum(db - thresh_db, 0)
    gr = -over * (1 - 1 / ratio)                       # dB of gain reduction wanted
    a = np.exp(-blk / (SR * attack_ms / 1000)); r = np.exp(-blk / (SR * release_ms / 1000))
    sm = np.empty(nb); cur = 0.0
    for i in range(nb):
        cur = a * cur + (1 - a) * gr[i] if gr[i] < cur else r * cur + (1 - r) * gr[i]
        sm[i] = cur
    g = 10 ** ((sm + makeup_db) / 20)
    gain = np.interp(np.arange(n), (np.arange(nb) + .5) * blk, g)
    return x * (gain[:, None] if x.ndim > 1 else gain)
