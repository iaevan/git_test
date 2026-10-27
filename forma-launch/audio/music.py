"""Upbeat 120 BPM score for the Forma launch film (A major), fully synthesised.

Arrangement (bar = 2 s) — mapped to the picture:
  bars 0–2   0:00–0:06  the problem: open fifths (no third = ambiguous), muted plucks, snare-roll build
  bar  3     0:06       DROP 1 on the logo reveal — the major third arrives, groove enters
  bars 3–12  0:06–0:24  app demo groove (arp from bar 5, bell hook from bar 7)
  bars 12–15 0:25–0:30  breakdown for the privacy scene (pad, glassy arp, heartbeat, riser)
  bars 15–22 0:30–0:44  DROP 2 for the feature run (octave bass, extra percussion, brand "tick" shaker)
  bars 22–23 0:44–0:46  snare-roll build, hard stop
  bar  23    0:46       end-card hit; outro groove + fade
"""
import functools
import numpy as np
from dsp import *

BAR, STEP = 2.0, 0.125
TOTAL, TAIL = 52.0, 3.0
N = int((TOTAL + TAIL) * SR)


def T(bar, step=0.0):
    return bar * BAR + step * STEP


# ── drum one-shots ─────────────────────────────────────────
@functools.lru_cache(None)
def kick_s():
    n = int(.42 * SR); t = tt(n)
    f = 47 + 125 * np.exp(-t / .027)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / .21)
    click = hp(noise(n, 1) * np.exp(-t / .0018), 1800) * .30
    out = soft_clip((body + click) * 1.5, 1.0)
    return fade(out, .0004, .01)


@functools.lru_cache(None)
def clap_s():
    n = int(.4 * SR); env = np.zeros(n)
    for k, off in enumerate([0, .011, .022, .036]):
        i = int(off * SR)
        env[i:] += np.exp(-np.arange(n - i) / (SR * (.006 if k < 3 else .085))) * (.8 if k < 3 else 1.0)
    return bp(noise(n, 2), 900, 3400) * env * .8


@functools.lru_cache(None)
def snare_s():
    n = int(.3 * SR); t = tt(n)
    nz = hp(noise(n, 4), 1200) * np.exp(-t / .085) * .65
    tone = np.sin(2 * np.pi * np.cumsum(185 + 75 * np.exp(-t / .02)) / SR) * np.exp(-t / .065) * .5
    return fade(nz + tone, .0005, .01)


@functools.lru_cache(None)
def hat_s(open_=False):
    n = int((.42 if open_ else .09) * SR); t = tt(n)
    return fade(hp(noise(n, 6 if open_ else 5), 7000) * np.exp(-t / (.2 if open_ else .03)), .0003, .005) * .6


@functools.lru_cache(None)
def shaker_s():
    n = int(.1 * SR); t = tt(n)
    return fade(bp(noise(n, 7), 4500, 9500) * np.minimum(1, t / .012) * np.exp(-t / .028), .002, .01) * .8


@functools.lru_cache(None)
def crash_s():
    n = int(3.0 * SR); t = tt(n)
    return hp(noise(n, 8), 3500) * np.exp(-t / 1.0) * .7


# ── tonal voices (cached) ──────────────────────────────────
@functools.lru_cache(None)
def pluck_c(f, dur, bright, tau0):
    return pluck(f, dur, bright=bright, tau0=tau0)


@functools.lru_cache(None)
def bell_c(f, dur, tau):
    return bell(f, dur, tau=tau)


def pad_note(f, dur, cutoff=1500, a=.5, r=.7, seed=0):
    n = int(dur * SR)
    rs = np.random.default_rng(seed)
    x = np.zeros(n)
    for det in (-9, -4, 0, 4, 9):
        x += saw(f * 2 ** (det / 1200), n, phase=rs.random())
    x = lp(x / 5, cutoff, 2)
    return x * adsr(n, a, .3, .9, r)


def bass_note(f, dur):
    n = int(dur * SR); t = tt(n)
    s = saw(f, n) * np.exp(-t / .2)
    s = sweep_filter(s, 120 + 700 * np.exp(-t / .09), q=1.1, kind='lp')
    sub = np.sin(2 * np.pi * f * t) * np.minimum(1, t / .004) * np.exp(-t / .3)
    return fade(s * .8 + sub * .8, .001, .02)


# ── harmony ────────────────────────────────────────────────
CH = {
    'A':   dict(stab=['E4', 'A4', 'C#5', 'E5'], pad=['A3', 'E4', 'B4', 'C#5'], root='A', arp=['A4', 'C#5', 'E5', 'A5'], lead=['E5', 'C#5', 'E5', 'A5']),
    'E':   dict(stab=['E4', 'G#4', 'B4', 'E5'], pad=['E3', 'B3', 'F#4', 'G#4'], root='E', arp=['B4', 'E5', 'G#5', 'B5'], lead=['B4', 'E5', 'G#5', 'E5']),
    'F#m': dict(stab=['F#4', 'A4', 'C#5', 'F#5'], pad=['F#3', 'C#4', 'E4', 'A4'], root='F#', arp=['C#5', 'F#5', 'A5', 'C#6'], lead=['A5', 'F#5', 'C#5', 'F#5']),
    'D':   dict(stab=['F#4', 'A4', 'D5', 'F#5'], pad=['D3', 'A3', 'C#4', 'F#4'], root='D', arp=['A4', 'D5', 'F#5', 'A5'], lead=['F#5', 'A5', 'F#5', 'D5']),
}
ROOT_HZ = {'A': 110.0, 'E': 82.41, 'F#': 92.50, 'D': 73.42}      # bass octave 2
ARP_PAT = [0, 1, 2, 3, 2, 1, 2, 1]


def build_music():
    z = lambda: np.zeros((N, 2))
    kick, drums, bass, stabs, pad, arp, lead, fx = z(), z(), z(), z(), z(), z(), z(), z()
    kick_times = []

    def K(t, v=1.0):
        place(kick, kick_s(), t, .95 * v); kick_times.append(t)

    def groove(b0, b1, chords, opts):
        """full 4-on-the-floor bars [b0, b1) with the chord given per bar"""
        for b in range(b0, b1):
            ch = CH[chords[b]]
            lo = opts.get('limit', 1e9)
            for s in range(16):
                t = T(b, s)
                if t >= lo:
                    continue
                if s % 4 == 0:
                    K(t)
                if s in (4, 12):
                    place(drums, clap_s(), t, .55); place(drums, snare_s(), t, .22)
                if s in (2, 6, 10, 14):
                    place(drums, hat_s(True), t, .2 * opts.get('hat', 1))
                if s % 2 == 1:
                    place(drums, hat_s(False), t, .16 * opts.get('hat', 1) * (1.25 if s % 4 == 3 else .8))
                if opts.get('shaker') and s % 2 == 0:
                    place(drums, shaker_s(), t, .13)
                if opts.get('tick') and s in (3, 7, 11, 15):
                    place(drums, pan(hp(__import__('sfx').tick(1.0)[:, 0], 600), .2), t, .22)
                # bass: off-beat saw + sustained sub
                if s in (2, 6, 10, 14):
                    place(bass, bass_note(ROOT_HZ[ch['root']], .2), t, .55)
                    if opts.get('oct'):
                        place(bass, pan(bass_note(ROOT_HZ[ch['root']] * 2, .14), 0), t + .0, .22)
                # chord stabs
                if s in opts.get('stab_steps', (0, 3, 6, 10, 12)):
                    v = 1.0 if s in (0, 6, 12) else .7
                    for k, nn in enumerate(ch['stab']):
                        place(stabs, pan(pluck_c(hz(nn), .5, .9, .28), -.35 + k * .23), t, .17 * v)
                # arpeggio
                if opts.get('arp'):
                    step_len = opts.get('arp_every', 2)
                    if s % step_len == 0 and (b * 16 + s) % step_len == 0:
                        idx = ARP_PAT[((b * 16 + s) // step_len) % 8]
                        nn = ch['arp'][idx]
                        v = pan(pluck_c(hz(nn), .32, 1.4, .17), -.5 if (s // step_len) % 2 == 0 else .5)
                        place(arp, v, t, .12 * opts.get('arp_g', 1))
                # lead hook (bell)
                if opts.get('lead') and s in (0, 3, 6, 10):
                    nn = ch['lead'][[0, 3, 6, 10].index(s) % 4]
                    place(lead, pan(bell_c(hz(nn), .7, .4), .15), t, .13)
            # pad per bar
            if opts.get('pad', True) and T(b) < opts.get('limit', 1e9):
                for k, nn in enumerate(ch['pad']):
                    place(pad, pan(pad_note(hz(nn), BAR + .25, 1700, .08, .4, seed=b * 7 + k), -.4 + k * .27), T(b), .08)

    # ── bars 0–2: the problem (open fifths, nothing sweet) ────
    for b in range(0, 3):
        for k, nn in enumerate(['A2', 'E3', 'A3', 'E4']):
            place(pad, pan(pad_note(hz(nn), BAR + .5, 650, 1.0 if b == 0 else .1, .8, seed=100 + k), -.3 + k * .2), T(b), .15 if b < 2 else .2)
        motif = ['A4', 'E5', 'B4', 'E5', 'A4', 'E5', 'B4', 'E5']
        for i in range(8):
            t = T(b, i * 2)
            if t >= T(2, 12):
                break
            vel = .5 + .5 * (i % 2 == 0)
            place(arp, pan(pluck_c(hz(motif[i]), .3, .7, .14), -.4 if i % 2 else .4), t, .07 * vel * (.7 if b == 0 else 1.0))
        for s in range(0, 16, 2):
            t = T(b, s)
            place(drums, hat_s(False), t, .07 + (.06 if b == 2 else 0))
    # sub heartbeat on the beats of bar 1–2
    for b in (1, 2):
        for beat in range(4):
            t = T(b, beat * 4)
            place(bass, pan(np.sin(2 * np.pi * 55 * tt(int(.35 * SR))) * exp_env(int(.35 * SR), .12) * .5, 0), t, .5)
    # build: snare roll 4.0 → 5.9 (8ths → 16ths → 32nds), crescendo
    roll = []
    t = 4.0
    while t < 5.0: roll.append(t); t += .25
    while t < 5.5: roll.append(t); t += .125
    while t < 5.92: roll.append(t); t += .0625
    for i, t in enumerate(roll):
        v = .12 + .5 * (i / len(roll))
        place(drums, snare_s(), t, v)
    # reverse crash into the drop
    rc = crash_s()[:int(1.9 * SR)][::-1].copy() * np.linspace(0, 1, int(1.9 * SR)) ** 1.6
    place(fx, rc, 6.0 - 1.9, .45)
    # music riser (noise sweep) — quiet; the SFX riser carries most of it
    nR = int(1.9 * SR); u = np.arange(nR) / nR
    rz = sweep_filter(noise(nR, 33), 400 * 10 ** (u * 1.4), q=2.0, kind='bp') * u ** 2
    place(fx, pan(rz / (np.max(np.abs(rz)) + 1e-9), 0), 4.0, .25)

    # ── DROP 1 (bars 3–12) ──────────────────────────────────
    ch1 = {b: c for b, c in zip(range(3, 13), ['A', 'E', 'F#m', 'D', 'A', 'E', 'F#m', 'D', 'A', 'E'])}
    place(fx, crash_s(), 6.0, .4)
    groove(3, 5, ch1, dict(hat=1.0))
    groove(5, 7, ch1, dict(arp=True, arp_every=2, arp_g=.9))
    groove(7, 13, ch1, dict(arp=True, arp_every=2, arp_g=.9, lead=True, limit=24.5))
    place(fx, crash_s(), 18.0, .35)                       # wheel lands
    for i, nn in enumerate(['A5', 'C#6', 'E6']):          # little fill into the landing
        place(arp, pan(pluck_c(hz(nn), .4, 1.2, .2), -.3 + i * .3), 17.75 + i * .08, .14)

    # ── breakdown (privacy) 24.75 → 30.0 ───────────────────
    place(fx, crash_s()[:int(1.6 * SR)][::-1].copy() * np.linspace(0, 1, int(1.6 * SR)) ** 1.5, 23.85, .22)   # swell into the flood
    bd = [(24.75, 26.0, 'A'), (26.0, 28.0, 'F#m'), (28.0, 29.0, 'D'), (29.0, 30.0, 'E')]
    for t0, t1, c in bd:
        for k, nn in enumerate(CH[c]['pad']):
            place(pad, pan(pad_note(hz(nn), t1 - t0 + .6, 2200, .35, .6, seed=300 + k + int(t0)), -.5 + k * .33), t0, .14)
        place(bass, pan(np.sin(2 * np.pi * (ROOT_HZ[CH[c]['root']] / 2) * tt(int((t1 - t0 + .3) * SR))) * adsr(int((t1 - t0 + .3) * SR), .05, .2, .9, .3), 0), t0, .14)
        # glassy 8th arp
        for i in range(int((t1 - t0) / .25)):
            if t0 + i * .25 < 25.4:
                continue
            nn = CH[c]['arp'][ARP_PAT[i % 8]]
            place(arp, pan(bell_c(hz(nn), .6, .38), -.6 if i % 2 else .6), t0 + i * .25, .09)
    for b in np.arange(26.0, 29.95, .5):                  # heartbeat
        K(float(b), .55)
    for t in np.arange(28.0, 29.9, .25):
        place(drums, shaker_s(), float(t), .11)
    roll2 = []
    t = 29.0
    while t < 29.5: roll2.append(t); t += .25
    while t < 29.8: roll2.append(t); t += .125
    while t < 29.94: roll2.append(t); t += .0625
    for i, t in enumerate(roll2):
        place(drums, snare_s(), t, .1 + .45 * i / len(roll2))
    rc = crash_s()[:int(1.5 * SR)][::-1].copy() * np.linspace(0, 1, int(1.5 * SR)) ** 1.6
    place(fx, rc, 30.0 - 1.5, .4)

    # ── DROP 2 (bars 15–22) ─────────────────────────────────
    ch2 = {15: 'A', 16: 'E', 17: 'F#m', 18: 'D', 19: 'A', 20: 'E', 21: 'D', 22: 'E'}
    place(fx, crash_s(), 30.0, .45)
    groove(15, 22, ch2, dict(arp=True, arp_every=1, arp_g=.75, lead=True, shaker=True, tick=True, oct=True, limit=43.0))
    for t in (34.0, 38.0, 42.0):
        place(fx, crash_s(), t, .28)
    # build 43.0 → 46.0 : keep hats/shaker, drop kick/bass, snare roll
    for b in range(21, 23):
        for s in range(16):
            t = T(b, s)
            if t < 43.0 or t >= 45.94:
                continue
            if s % 2 == 1: place(drums, hat_s(False), t, .14)
            if s % 4 == 2: place(drums, hat_s(True), t, .12)
    for b in (21, 22):
        for k, nn in enumerate(CH[ch2[b]]['pad']):
            tb = max(T(b), 43.0)
            place(pad, pan(pad_note(hz(nn), T(b) + BAR - tb + .1, 2000, .3, .3, seed=500 + k + b), -.4 + k * .27), tb, .12)
    roll3 = []
    t = 44.0
    while t < 45.0: roll3.append(t); t += .25
    while t < 45.5: roll3.append(t); t += .125
    while t < 45.94: roll3.append(t); t += .0625
    for i, t in enumerate(roll3):
        place(drums, snare_s(), t, .12 + .55 * i / len(roll3))
    rc = crash_s()[:int(2.0 * SR)][::-1].copy() * np.linspace(0, 1, int(2.0 * SR)) ** 1.6
    place(fx, rc, 46.0 - 2.0, .35)

    # ── END CARD (bar 23 →) ────────────────────────────────
    place(fx, crash_s(), 46.0, .5)
    ch3 = {23: 'A', 24: 'D', 25: 'A'}
    for b, c in ch3.items():
        for k, nn in enumerate(CH[c]['pad']):
            place(pad, pan(pad_note(hz(nn), BAR + (1.6 if b == 25 else .5), 2300, .12, .9 if b == 25 else .4, seed=700 + k + b), -.5 + k * .33), T(b), .15)
        place(bass, pan(bass_note(ROOT_HZ[CH[c]['root']], BAR * .9), 0), T(b), .5)
        for k, nn in enumerate(CH[c]['stab']):
            place(stabs, pan(pluck_c(hz(nn), 1.0, .7, .5), -.4 + k * .27), T(b), .16)
        for s in range(16):
            t = T(b, s)
            nn = CH[c]['arp'][ARP_PAT[(b * 16 + s) % 8]]
            if b < 25 or s < 8:
                place(arp, pan(pluck_c(hz(nn), .32, 1.4, .17), -.5 if s % 2 else .5), t, .1 * (1 - .06 * (b - 23)))
            if b < 25:
                if s in (0, 8): K(t, 1.0 if (b == 23 and s == 0) else .9)
                if s in (4, 12): place(drums, clap_s(), t, .35)
                if s in (2, 6, 10, 14): place(drums, hat_s(True), t, .13)
                if s % 2 == 1: place(drums, hat_s(False), t, .1)
    # final shimmer
    for i, nn in enumerate(['A5', 'C#6', 'E6', 'A6']):
        place(arp, pan(bell_c(hz(nn), 2.5, .9), -.4 + i * .27), T(25, 0) + i * .16, .12)

    # ── sidechain, EQ and bus levels ───────────────────────
    kt = [t for t in kick_times]
    sc_hard = sidechain_curve(N, kt, depth=.62, tau=.12)
    sc_med = sidechain_curve(N, kt, depth=.38, tau=.11)
    sc_soft = sidechain_curve(N, kt, depth=.2, tau=.1)
    bass *= sc_hard[:, None]; pad *= sc_hard[:, None]
    stabs *= sc_med[:, None]; lead *= sc_soft[:, None]; arp *= sc_soft[:, None]
    # keep every layer out of the others' way
    stabs = hp(stabs, 220); pad = hp(pad, 110); arp = hp(arp, 380); lead = hp(lead, 300)
    drums = hp(drums, 140); fx = hp(fx, 120)
    bass = lp(bass, 4500)
    # relative levels (dB re. measured stem RMS) — kick and bass sit together, everything else around them
    G = dict(kick=.40, bass=2.0, drums=1.35, stabs=2.5, pad=2.4, arp=3.0, lead=2.3, fx=.75)
    kick *= G['kick']; bass *= G['bass']; drums *= G['drums']; stabs *= G['stabs']
    pad *= G['pad']; arp *= G['arp']; lead *= G['lead']; fx *= G['fx']

    ir_s = make_ir(1.1, .010, 3)
    ir_l = make_ir(2.2, .02, 5)
    def rv(x, ir, amt):
        w = reverb(x, ir)[:N]
        return w * amt
    wet = rv(stabs, ir_s, .3) + rv(arp, ir_l, .4) + rv(lead, ir_l, .45) + rv(pad, ir_l, .35) + rv(drums, ir_s, .12)
    # dotted-eighth ping-pong on the arp / lead for that wide, sparkly SaaS shimmer
    for src, amt in ((arp, .32), (lead, .3)):
        mono = src.sum(axis=1)
        d = pingpong(mono, .375, fb=.42, taps=4)[:N]
        wet[:len(d)] += d * amt
    mix = (kick * 1.0 + drums * 1.0 + bass * 1.0 + stabs * 1.0 + pad * 1.0 + arp * 1.0 + lead * 1.0 + fx * 1.0 + wet)
    mix = hp(mix, 28, 2)
    mix = limiter(mix, .92)
    # fade out the last 2 s of the picture
    fo = np.ones(N)
    a, b = int((TOTAL - 2.2) * SR), int(TOTAL * SR)
    fo[a:b] = np.linspace(1, 0, b - a) ** 1.5
    fo[b:] = 0
    mix *= fo[:, None]
    return mix, kick_times


if __name__ == '__main__':
    import soundfile as sf, sys
    m, kt = build_music()
    print('peak', np.max(np.abs(m)), 'rms', np.sqrt(np.mean(m ** 2)), 'kicks', len(kt))
    sf.write(sys.argv[1] if len(sys.argv) > 1 else '/tmp/music.wav', m[:int(TOTAL * SR)], SR, subtype='FLOAT')
