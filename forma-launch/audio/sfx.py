"""Satisfying SaaS UI sound effects, synthesised from scratch.
All pitched cues are tuned to A major (the key of the score) so the SFX sit *inside* the music."""
import numpy as np
from dsp import *

PENT = [0, 2, 4, 7, 9]   # A major pentatonic steps


def _norm(x, peak):
    m = np.max(np.abs(x)) + 1e-9
    return x * (peak / m)


# ── the app's own sound ────────────────────────────────────
def tick(g=1.0, **kw):
    """Forma's wheel tick, reproduced from the app's source (Hv()): a 35 ms downward sine chirp
    (1400 Hz sweeping down) + a little LCG noise, with a 1.5 ms attack and exp(-180 t) decay.
    The original sits at ~0.055 amplitude; it is scaled up here so it reads inside a mix."""
    n = int(np.ceil(SR * .035))
    out = np.zeros(n)
    state = 17
    for r in range(n):
        i = r / SR
        state = (state * 1664525 + 1013904223) & 0xFFFFFFFF
        s = state - 0x100000000 if state & 0x80000000 else state       # int32 wrap, like Math.imul
        a = min(1.0, i / .0015) * np.exp(-i * 180) * (1 - r / n)
        o = np.sin(2 * np.pi * (1400 * i - 9000 * i * i))
        out[r] = a * (o * .055 + s / 2147483648 * .012)
    return pan(out * 16.0 * g, 0)


# ── pitched UI sounds ──────────────────────────────────────
def pop(n='A5', g=1.0, pn=0.0, **kw):
    f = hz(n)
    N = int(.24 * SR); t = tt(N)
    fe = f * (1 + .45 * np.exp(-t / .010))
    ph = 2 * np.pi * np.cumsum(fe) / SR
    body = np.sin(ph) * np.exp(-t / .075) + .22 * np.sin(2 * ph) * np.exp(-t / .03)
    click = hp(noise(N, 3) * np.exp(-t / .0012), 2800) * .16
    out = (body + click) * np.minimum(1, t / .0008)
    return pan(_norm(out, .5) * g, pn)


def count(i=0, g=1.0, **kw):
    i = int(i)
    f = hz('A5') * 2 ** ((PENT[i % 5] + 12 * (i // 5)) / 12)
    f = min(f, 3500)
    N = int(.06 * SR); t = tt(N)
    out = np.sin(2 * np.pi * f * t) * np.exp(-t / .014) * np.minimum(1, t / .0006)
    return pan(_norm(out, .22) * g, 0)


def toggle(on=1, i=0, g=1.0, **kw):
    n = ['E5', 'A5', 'C#6', 'E6', 'A6'][int(i) % 5] if on else 'A4'
    p = pop(n, 1.0)
    N = int(.05 * SR)
    c = hp(noise(N, 8) * np.exp(-tt(N) / .003), 3000) * .15
    out = p.copy(); out[:N, 0] += c; out[:N, 1] += c
    return out * (g * .8)


def select(g=1.0, **kw):
    N = int(.12 * SR); t = tt(N)
    f = np.where(t < .035, hz('E6'), hz('A6'))
    out = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-(t % .035) / .02) * np.exp(-t / .06)
    out += hp(noise(N, 5) * np.exp(-t / .002), 3000) * .15
    return pan(_norm(out, .35) * g, .1)


def sparkle(g=1.0, seed=5, **kw):
    rs = np.random.default_rng(seed)
    notes = ['A5', 'C#6', 'E6', 'A6', 'E6', 'C#7']
    out = np.zeros((int(1.2 * SR), 2))
    for k, nn in enumerate(notes):
        b = bell(hz(nn), .8, tau=.30) * (.85 ** k)
        place(out, pan(b, rs.uniform(-.7, .7)), k * .05, .28)
    return _norm(out, .45) * g


def success(g=1.0, **kw):
    out = np.zeros((int(2.0 * SR), 2))
    for k, (nn, p) in enumerate([('A5', -.3), ('C#6', 0), ('E6', .3), ('A6', 0)]):
        b = bell(hz(nn), 1.4, tau=.75)
        place(out, pan(b, p), k * .085, .5 if k < 3 else .3)
    return _norm(out, .5) * g


def ring(g=1.0, **kw):
    b = bell(hz('E6'), 1.6, tau=.9, partials=(1, 2.0, 3.0), amps=(1, .3, .1))
    return pan(_norm(b, .25) * g, 0) * 1.0


def download(g=1.0, **kw):
    out = np.zeros((int(1.2 * SR), 2))
    place(out, whoosh(.3, -1, .6), 0, .8)
    place(out, pop('A5', .8), .26, 1)
    place(out, pan(bell(hz('E6'), 1.0, tau=.5) * .3, .2), .3, 1)
    return out * g


# ── percussive UI sounds ───────────────────────────────────
def click(g=1.0, **kw):
    N = int(.09 * SR); t = tt(N)
    down = hp(noise(N, 11) * np.exp(-t / .0025), 2200) * .5
    body = np.sin(2 * np.pi * 1500 * t) * np.exp(-t / .006) * .35
    thock = np.sin(2 * np.pi * 210 * t * (1 + .5 * np.exp(-t / .01))) * np.exp(-t / .022) * .4
    return pan(_norm(down + body + thock, .6) * g, 0)


def lock(g=1.0, **kw):
    N = int(.2 * SR); out = np.zeros(N); t = tt(N)
    a = np.sin(2 * np.pi * 2200 * t) * np.exp(-t / .004) * .5 + hp(noise(N, 12) * np.exp(-t / .003), 4000) * .4
    out += a
    t2 = np.maximum(t - .03, 0)
    m = (t >= .03)
    b = (np.sin(2 * np.pi * 900 * t2) * np.exp(-t2 / .016) * .6 + np.sin(2 * np.pi * 105 * t2) * np.exp(-t2 / .04) * .7) * m
    out += b
    return pan(_norm(out, .6) * g, 0)


def thud(g=1.0, **kw):
    N = int(.35 * SR); t = tt(N)
    f = 52 + 78 * np.exp(-t / .03)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / .1)
    air = lp(noise(N, 20), 600) * np.exp(-t / .03) * .5
    return pan(_norm(body + air, .75) * g, 0)


def drop(g=1.0, **kw):
    N = int(.4 * SR); t = tt(N)
    f = 85 + 90 * np.exp(-t / .04)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / .1)
    paper = lp(noise(N, 21), 1400) * np.exp(-t / .04) * .45
    pp = pop('A4', .35)
    out = pan(_norm(body + paper, .6), 0)
    out[:len(pp)] += pp * .6
    return out * g


def bonk(g=1.0, **kw):
    """soft, rounded 'nope' — two falling notes plus a muted thud (never harsh)."""
    N = int(.42 * SR); t = tt(N)
    f = np.where(t < .11, 330.0, 247.0)
    ph = 2 * np.pi * np.cumsum(f) / SR
    env = np.where(t < .11, np.exp(-t / .09), np.exp(-(t - .11) / .12))
    tone = lp((np.sin(ph) * .7 + (2 / np.pi) * np.arcsin(np.sin(ph)) * .2) * env, 2400)
    out = pan(_norm(tone, .55), 0)
    td = thud(.55)
    out[:min(N, len(td))] += td[:N]
    return out * g


def type_(i=0, g=1.0, **kw):
    i = int(i)
    N = int(.06 * SR); t = tt(N)
    k = bp(noise(N, 30 + i), 1800, 5200) * np.exp(-t / .006) * .5
    b = np.sin(2 * np.pi * (260 + 25 * (i % 3)) * t) * np.exp(-t / .012) * .35
    return pan(_norm(k + b, .35) * g, 0)


def strike(g=1.0, p=0, **kw):
    N = int(.16 * SR); t = tt(N)
    x = bp(noise(N, 40 + int(p)), 2000 + 700 * int(p), 6500)
    env = (.55 + .45 * np.sin(2 * np.pi * 16 * t)) * np.exp(-t / .07)
    return pan(_norm(x * env, .3) * g, 0)


# ── motion ─────────────────────────────────────────────────
def whoosh(d=.5, dir=1, g=1.0, **kw):
    N = int(d * SR); u = np.arange(N) / N
    x = noise(N, 50 + int(d * 10))
    fc = 350 * 10 ** (u * 1.2) if dir > 0 else 5200 * 10 ** (-u * 1.2)
    y = sweep_filter(x, fc, q=1.5, kind='bp')
    y += .25 * hp(sweep_filter(noise(N, 51), fc * 1.6, q=1.0, kind='bp'), 1500)
    env = np.sin(np.pi * np.clip(u, 0, 1)) ** 1.7
    y = _norm(y * env, .5) * g
    p = (np.linspace(-.7, .7, N)) * (1 if dir > 0 else -1)
    a = (p + 1) * np.pi / 4
    return np.stack([y * np.cos(a), y * np.sin(a)], axis=1)


def swish(g=1.0, dir=1, **kw):
    N = int(.3 * SR); u = np.arange(N) / N
    x = noise(N, 60)
    fc = 1500 * 10 ** (u * .8) if dir > 0 else 9000 * 10 ** (-u * .8)
    y = sweep_filter(x, fc, q=2.0, kind='bp') * np.sin(np.pi * u) ** 1.5
    y = _norm(y, .22) * g
    p = np.linspace(-.5, .5, N) * (1 if dir > 0 else -1)
    a = (p + 1) * np.pi / 4
    return np.stack([y * np.cos(a), y * np.sin(a)], axis=1)


def riser(d=2.0, g=1.0, **kw):
    N = int(d * SR); u = np.arange(N) / N
    chans = []
    for s in (70, 71):
        x = noise(N, s)
        fc = 300 * 10 ** (u * 1.6)
        y = sweep_filter(x, fc, q=2.2, kind='bp') * u ** 2.0
        chans.append(y)
    y = np.stack(chans, axis=1)
    y = _norm(y, .5)
    rate = 3 + 13 * u
    trem = .75 + .25 * np.sin(2 * np.pi * np.cumsum(rate) / SR)
    gl = np.sin(2 * np.pi * np.cumsum(220 * 2 ** (u * 3)) / SR) * .12 * u ** 2.5
    y = y * trem[:, None] + gl[:, None]
    y[-int(.004 * SR):] *= np.linspace(1, 0, int(.004 * SR))[:, None]
    return y * g


def impact(g=1.0, **kw):
    N = int(2.4 * SR); t = tt(N)
    f = 32 + 70 * np.exp(-t / .22)
    sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / .75)
    body = lp(noise(N, 80), 1800) * np.exp(-t / .22) * .5
    crack = hp(noise(N, 81), 3200) * np.exp(-t / .05) * .45
    shim = np.zeros(N)
    for fr in (1760, 2349, 3520, 4698):
        shim += np.sin(2 * np.pi * fr * t) * np.exp(-t / .5) * .05
    out = lp(sub * .95 + body + crack + shim, 12000)
    st = pan(out, 0)
    st = st + .0
    return _norm(st, .9) * g


def boom(g=1.0, **kw):
    N = int(1.1 * SR); t = tt(N)
    f = 42 + 90 * np.exp(-t / .12)
    sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / .32)
    body = lp(noise(N, 90), 1500) * np.exp(-t / .12) * .45
    crack = hp(noise(N, 91), 3000) * np.exp(-t / .03) * .3
    return pan(_norm(sub + body + crack, .8) * g, 0)


# name → (function, reverb send)
SFX = {
    'tick': (tick, 0.0), 'pop': (pop, .22), 'count': (count, .08), 'toggle': (toggle, .12),
    'select': (select, .1), 'sparkle': (sparkle, .5), 'success': (success, .55), 'ring': (ring, .6),
    'download': (download, .3), 'click': (click, .04), 'lock': (lock, .1), 'thud': (thud, .08),
    'drop': (drop, .15), 'bonk': (bonk, .2), 'type': (type_, 0.0), 'strike': (strike, 0.0),
    'whoosh': (whoosh, .15), 'swish': (swish, .1), 'riser': (riser, .25), 'impact': (impact, .45),
    'boom': (boom, .3),
}
