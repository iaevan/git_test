"""Sound design v2 — soft, round, sparse.

Principles (what good SaaS-product sound design does):
  * few sounds, only on real interactions and transitions — never on every reveal
  * low-mid, rounded tones (no sharp highs, no chirps, no noise risers)
  * everything sits UNDER the music, in its key, with a touch of room
Vocabulary:  swoosh · tap · pop · toggle · thump · chime · nope · drop · tick (the app's own)
"""
import numpy as np
from dsp import *


def _norm(x, peak):
    return x * (peak / (np.max(np.abs(x)) + 1e-9))


def _soft(x, hp_hz=100, lp_hz=5000):
    """take the edge off: no rumble, no fizz"""
    return lp(hp(x, hp_hz, 1), lp_hz, 2)


# ── the app's own sound ────────────────────────────────────
def tick(g=1.0, **kw):
    """Forma's wheel tick, reproduced from the app's source (Hv()): a 35 ms downward sine chirp
    (1400 Hz sweeping down) + a little LCG noise, 1.5 ms attack, exp(-180 t) decay.
    Here it is only softened (low-passed) and scaled to sit under the music."""
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
    out = lp(out, 3800, 2)
    return pan(_norm(out, .17) * g, 0)


# ── taps & pops (soft, wooden, round) ──────────────────────
def tap(g=1.0, **kw):
    """a soft UI tap — felt, not heard"""
    N = int(.14 * SR); t = tt(N)
    f = 640 * (1 + .25 * np.exp(-t / .012))
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / .03)
    low = np.sin(2 * np.pi * 180 * t) * np.exp(-t / .045) * .55
    air = lp(noise(N, 3), 1800) * np.exp(-t / .005) * .22
    x = _soft((body * .55 + low + air) * np.minimum(1, t / .002), 90, 3800)
    return pan(_norm(x, .32) * g, 0)


def pop(n='A4', g=1.0, pn=0.0, **kw):
    """soft wooden 'tok' with a gentle downward settle"""
    f = hz(n)
    N = int(.26 * SR); t = tt(N)
    fe = f * (1 + .18 * np.exp(-t / .02))
    ph = 2 * np.pi * np.cumsum(fe) / SR
    x = (np.sin(ph) * np.exp(-t / .09) + .14 * np.sin(2 * ph) * np.exp(-t / .04)) * np.minimum(1, t / .003)
    x = _soft(x, 120, 3200)
    return pan(_norm(x, .26) * g, pn)


def toggle(on=1, g=1.0, **kw):
    """two soft taps: up for on, down for off"""
    a, b = (460, 690) if on else (690, 460)
    out = np.zeros((int(.25 * SR), 2))
    for k, f in enumerate((a, b)):
        N = int(.12 * SR); t = tt(N)
        x = np.sin(2 * np.pi * f * t) * np.exp(-t / .028) * np.minimum(1, t / .002)
        x = _soft(x + lp(noise(N, 5 + k), 1500) * np.exp(-t / .004) * .15, 100, 3500)
        place(out, pan(_norm(x, .26), 0), k * .06)
    return out * g


def drop(g=1.0, **kw):
    """a file settling into place: low pad of sound + a tap"""
    N = int(.4 * SR); t = tt(N)
    body = np.sin(2 * np.pi * np.cumsum(70 + 60 * np.exp(-t / .05)) / SR) * np.exp(-t / .12)
    out = pan(_soft(_norm(body, .4), 40, 600), 0)
    tp = tap(.8)
    out[:len(tp)] += tp
    return out * g


def nope(g=1.0, **kw):
    """a gentle 'uh-oh' (not an error buzzer): two soft falling notes"""
    out = np.zeros((int(.5 * SR), 2))
    for k, nn in enumerate(('G4', 'E4')):
        N = int(.3 * SR); t = tt(N)
        x = (np.sin(2 * np.pi * hz(nn) * t) + .18 * np.sin(2 * np.pi * 2 * hz(nn) * t)) * np.exp(-t / .1) * np.minimum(1, t / .006)
        place(out, pan(lp(_norm(x, .26), 1400), 0), k * .12)
    return out * g


# ── air & weight ───────────────────────────────────────────
def swoosh(d=.45, dir=1, g=1.0, **kw):
    """soft airy pass-by — filtered, low-mid, no hiss"""
    N = int(d * SR); u = np.arange(N) / N
    fc = 450 * 10 ** (u * .8) if dir > 0 else 2600 * 10 ** (-u * .8)
    y = sweep_filter(noise(N, 50 + int(d * 10)), fc, q=.7, kind='bp')
    y = lp(y, 3400, 2)
    env = np.sin(np.pi * np.clip(u, 0, 1)) ** 1.6
    y = _norm(y * env, .2) * g
    p = np.linspace(-.35, .35, N) * (1 if dir > 0 else -1)
    a = (p + 1) * np.pi / 4
    return np.stack([y * np.cos(a), y * np.sin(a)], axis=1)


def thump(g=1.0, **kw):
    """a soft low landing — for the logo hits and heavy objects"""
    N = int(1.0 * SR); t = tt(N)
    f = 40 + 55 * np.exp(-t / .09)
    sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / .3) * np.minimum(1, t / .006)
    body = lp(noise(N, 80), 700) * np.exp(-t / .1) * .18
    x = lp(sub + body, 900, 2)
    return pan(_norm(x, .5) * g, 0)


def chime(n='A5', g=1.0, **kw):
    """soft two-note 'done' chime — warm sines, long gentle tail"""
    out = np.zeros((int(2.2 * SR), 2))
    for k, (semi, p) in enumerate(((0, -.15), (7, .15))):
        f = hz(n) * 2 ** (semi / 12)
        N = int(1.8 * SR); t = tt(N)
        x = (np.sin(2 * np.pi * f * t) + .12 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t / .25)) * np.exp(-t / .5) * np.minimum(1, t / .004)
        place(out, pan(lp(_norm(x, .3), 5200), p), k * .11)
    return out * g


# name → (function, reverb send)
SFX = {
    'tick': (tick, 0.0), 'tap': (tap, .08), 'pop': (pop, .16), 'toggle': (toggle, .08), 'drop': (drop, .1),
    'nope': (nope, .12), 'swoosh': (swoosh, .12), 'thump': (thump, .12), 'chime': (chime, .5),
}
