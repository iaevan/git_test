"""Score v2 — warm, simple, soothing. 120 BPM, A major, half-time feel.

Palette: soft electric piano (FM), kalimba, round sine bass, sine pad, quiet kick/snap/shaker.
No bright additive plucks, no saw buzz, no glassy 16th-note arps, no open hats, no snare rolls, no noise risers.

Arrangement (bar = 2 s) — still mapped to the picture:
  0:00–0:06  the problem: neutral open fifths (no third), a few sparse kalimba notes, a soft swell into…
  0:06       …the logo: the major third arrives, gentle groove starts
  0:06–0:24  app demo: kick on 1 & 3, snap on 2 & 4, EP comping, kalimba from bar 5
  0:25–0:30  privacy: pad + slow EP arpeggio, no drums
  0:30–0:44  feature run: same groove, a touch fuller
  0:44–0:46  one-breath build (no roll): held chord + a rising kalimba run
  0:46–0:52  end card: soft hit, chord, sparse sparkle, fade
"""
import functools
import numpy as np
from dsp import *

BAR, STEP = 2.0, 0.125
TOTAL, TAIL = 52.0, 3.0
N = int((TOTAL + TAIL) * SR)


def T(bar, step=0.0):
    return bar * BAR + step * STEP


# ── instruments ────────────────────────────────────────────
@functools.lru_cache(None)
def ep_mono(f, dur, vel):
    """FM electric piano: mellow, a little tine at the attack, warm low-pass"""
    n = int(dur * SR); t = tt(n)
    idx = (0.35 + 1.1 * vel) * np.exp(-t / .5) + .18
    mod = np.sin(2 * np.pi * f * t)
    car = np.sin(2 * np.pi * f * t + idx * mod)
    car += .12 * np.sin(2 * np.pi * 2 * f * t + .5 * idx * np.sin(2 * np.pi * 2 * f * t)) * np.exp(-t / .22)
    env = np.exp(-t / (1.3 if f < 330 else .95)) * np.minimum(1, t / .005)
    return lp(car * env, 4600)


def ep_st(f, dur, vel, wide=.28):
    a = ep_mono(f * (1 - .0012), dur, vel); b = ep_mono(f * (1 + .0012), dur, vel)
    return pan(a, -wide) + pan(b, wide)


@functools.lru_cache(None)
def kal_mono(f, dur=.8):
    """kalimba: soft fundamental + a brief, quiet metallic partial"""
    n = int(dur * SR); t = tt(n)
    x = (np.sin(2 * np.pi * f * t) * np.exp(-t / .24)
         + .16 * np.sin(2 * np.pi * f * 5.4 * t) * np.exp(-t / .03)
         + .08 * np.sin(2 * np.pi * f * 2 * t) * np.exp(-t / .1))
    return lp(x * np.minimum(1, t / .002), 7000)


def pad_note(f, dur, a=.6, r=.8, seed=0):
    """warm sine 'organ' pad: a few soft partials, two gently detuned voices"""
    n = int(dur * SR); t = tt(n)
    out = np.zeros(n)
    for det in (-5, 5):
        ff = f * 2 ** (det / 1200)
        for k, amp in enumerate((1.0, .34, .14, .05), start=1):
            out += amp * np.sin(2 * np.pi * ff * k * t + seed * k)
    out = lp(out / 3, 1700)
    return out * adsr(n, a, .3, .9, r)


def bass_note(f, dur):
    """round sine bass with a touch of 2nd harmonic and tanh warmth"""
    n = int(dur * SR); t = tt(n)
    x = np.sin(2 * np.pi * f * t) + .28 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t / .14)
    x = np.tanh(x * 1.25) * adsr(n, .008, .12, .75, min(.14, dur * .4))
    return lp(x, 900)


@functools.lru_cache(None)
def kick_s():
    n = int(.5 * SR); t = tt(n)
    x = np.sin(2 * np.pi * np.cumsum(43 + 95 * np.exp(-t / .03)) / SR) * np.exp(-t / .2) * np.minimum(1, t / .002)
    x += lp(noise(n, 1), 1500) * np.exp(-t / .002) * .12
    return fade(lp(np.tanh(x * 1.2), 1800), .0005, .02)


@functools.lru_cache(None)
def snap_s():
    """soft clap/finger-snap: a few low-passed noise bursts and a little wood body"""
    n = int(.3 * SR); t = tt(n); env = np.zeros(n)
    for off, tau in ((0, .006), (.010, .006), (.021, .05)):
        i = int(off * SR); env[i:] += np.exp(-np.arange(n - i) / (SR * tau))
    x = bp(noise(n, 2), 1100, 2800) * env * .7 + np.sin(2 * np.pi * 330 * t) * np.exp(-t / .02) * .22
    return fade(lp(x, 6500), .001, .02)


@functools.lru_cache(None)
def shaker_s():
    n = int(.12 * SR); t = tt(n)
    x = bp(noise(n, 7), 4500, 8000) * np.minimum(1, t / .014) * np.exp(-t / .04)
    return fade(lp(x, 9500), .003, .02)


def rev_chime(f, dur):
    """reversed chime: a soft swell that lands on the downbeat"""
    n = int(dur * SR); t = tt(n)
    x = np.zeros(n)
    for semi, a in ((0, 1.0), (7, .6), (12, .35)):
        ff = f * 2 ** (semi / 12)
        x += a * np.sin(2 * np.pi * ff * t)
    env = (t / dur) ** 2.2
    return lp(x * env, 3500) / 2.5


# ── harmony ────────────────────────────────────────────────
CH = {
    'A':   dict(ep=['A3', 'E4', 'G#4', 'C#5'], pad=['A2', 'E3', 'A3', 'C#4', 'E4'], arp=['E4', 'A4', 'C#5', 'E5'], root='A'),
    'E':   dict(ep=['E3', 'B3', 'F#4', 'G#4'], pad=['E2', 'B2', 'E3', 'G#3', 'B3'], arp=['B3', 'E4', 'G#4', 'B4'], root='E'),
    'F#m': dict(ep=['F#3', 'C#4', 'E4', 'A4'], pad=['F#2', 'C#3', 'F#3', 'A3', 'C#4'], arp=['C#4', 'F#4', 'A4', 'C#5'], root='F#'),
    'D':   dict(ep=['D3', 'A3', 'C#4', 'F#4'], pad=['D2', 'A2', 'D3', 'F#3', 'A3'], arp=['A3', 'D4', 'F#4', 'A4'], root='D'),
}
ROOT_HZ = {'A': 110.0, 'E': 82.41, 'F#': 92.50, 'D': 73.42}
KAL_STEPS = [(2, 2), (5, 3), (8, 1), (11, 3), (14, 2)]       # (16th step, chord-tone index) — sparse, syncopated


def build_music():
    z = lambda: np.zeros((N, 2))
    B = {k: z() for k in ('kick', 'snap', 'shaker', 'bass', 'ep', 'pad', 'kal', 'fx')}
    kick_times = []

    def K(t, v=1.0):
        place(B['kick'], kick_s(), t, v); kick_times.append(t)

    def padchord(c, t0, dur, a=.6, r=.9, g=1.0, seed=0):
        for k, nn in enumerate(CH[c]['pad']):
            place(B['pad'], pan(pad_note(hz(nn), dur + r, a, r, seed + k), -.4 + k * .2), t0, g)

    def groove(b0, b1, chords, limit=1e9, kalimba=True, shaker=True, snap=True, fuller=False):
        for b in range(b0, b1):
            c = chords[b]; ch = CH[c]
            padchord(c, T(b), BAR, a=.35, r=.5, g=.6 if not fuller else .7)
            for s, v, d in ((0, 1.0, 1.5), (6, .62, .8), (10, .8, .9)):
                t = T(b, s)
                if t >= limit: continue
                for k, nn in enumerate(ch['ep']):
                    place(B['ep'], ep_st(hz(nn), d, v), t + k * .014, .55)
            for s, d, v in ((0, .7, 1.0), (6, .22, .6), (10, .26, .7)):
                t = T(b, s)
                if t >= limit: continue
                place(B['bass'], pan(bass_note(ROOT_HZ[ch['root']], d), 0), t, v)
            for s in (0, 8):
                if T(b, s) < limit: K(T(b, s), 1.0 if s == 0 else .85)
            if snap:
                for s in (4, 12):
                    if T(b, s) < limit: place(B['snap'], snap_s(), T(b, s), .8 if s == 4 else .7)
            if shaker:
                for s in range(0, 16, 2):
                    if T(b, s) < limit: place(B['shaker'], shaker_s(), T(b, s), .7 if s % 4 == 2 else .4)
            if kalimba:
                for s, idx in KAL_STEPS:
                    if T(b, s) < limit:
                        place(B['kal'], pan(kal_mono(hz(ch['arp'][idx % 4]) * (2 if fuller and idx == 3 else 1)), -.45 if s % 2 else .45), T(b, s), .7)

    # ── 0:00–0:06  the problem: neutral open fifths ─────────
    for k, nn in enumerate(['A2', 'E3', 'A3', 'E4']):
        place(B['pad'], pan(pad_note(hz(nn), 6.6, 1.6, 1.0, k), -.3 + k * .2), 0.0, .55)
    for t, nn in ((.5, 'A4'), (1.0, 'E5'), (1.5, 'B4'), (2.5, 'E5'), (3.0, 'A4'), (3.5, 'B4'), (4.5, 'E5'), (5.0, 'B4')):
        place(B['kal'], pan(kal_mono(hz(nn)), .35 if int(t * 2) % 2 else -.35), t, .5)
    for t in (2.0, 4.0):                                      # a soft sus2 EP chord — no third yet
        for k, nn in enumerate(['A3', 'E4', 'B4']):
            place(B['ep'], ep_st(hz(nn), 2.0, .55), t + k * .02, .45)
    for t in np.arange(1.0, 5.9, .5):
        place(B['shaker'], shaker_s(), float(t), .25)
    place(B['fx'], pan(rev_chime(hz('A4'), 1.6), 0), 6.0 - 1.6, .5)   # swell into the logo

    # ── 0:06–0:24  groove 1 ─────────────────────────────────
    ch1 = dict(zip(range(3, 13), ['A', 'E', 'F#m', 'D', 'A', 'E', 'F#m', 'D', 'A', 'E']))
    groove(3, 5, ch1, kalimba=False)
    groove(5, 13, ch1, limit=24.5)

    # ── 0:25–0:30  privacy: pad + slow arpeggio, no drums ───
    bd = [(24.75, 26.0, 'A'), (26.0, 28.0, 'F#m'), (28.0, 29.0, 'D'), (29.0, 30.0, 'E')]
    for t0, t1, c in bd:
        padchord(c, t0, t1 - t0, a=.5, r=1.0, g=.9, seed=300)
        place(B['bass'], pan(bass_note(ROOT_HZ[CH[c]['root']], t1 - t0 + .2), 0), t0, .7)
        for i in range(int((t1 - t0) / .5)):
            tt_ = t0 + i * .5
            if tt_ < 25.4: continue
            nn = CH[c]['arp'][[0, 1, 2, 3, 2, 1][i % 6]]
            place(B['ep'], ep_st(hz(nn), 1.1, .5), tt_, .5)
    place(B['fx'], pan(rev_chime(hz('E4'), 1.4), 0), 30.0 - 1.4, .5)

    # ── 0:30–0:44  groove 2 ─────────────────────────────────
    ch2 = {15: 'A', 16: 'E', 17: 'F#m', 18: 'D', 19: 'A', 20: 'E', 21: 'D', 22: 'E'}
    groove(15, 22, ch2, limit=44.0, fuller=True)

    # ── 0:44–0:46  one-breath build: held chord + rising kalimba run ──
    padchord('E', 44.0, 2.0, a=.4, r=.5, g=.8)
    for k, nn in enumerate(CH['E']['ep']):
        place(B['ep'], ep_st(hz(nn), 2.0, .6), 44.0 + k * .014, .5)
    for i, nn in enumerate(['A4', 'B4', 'C#5', 'E5', 'F#5', 'A5']):
        place(B['kal'], pan(kal_mono(hz(nn)), -.3 + i * .12), 45.0 + i * .16, .75)
    place(B['fx'], pan(rev_chime(hz('A4'), 1.5), 0), 46.0 - 1.5, .55)

    # ── 0:46–0:52  end card ─────────────────────────────────
    ch3 = {23: 'A', 24: 'D', 25: 'A'}
    for b, c in ch3.items():
        padchord(c, T(b), BAR, a=.3, r=1.6 if b == 25 else .6, g=.9, seed=700)
        for k, nn in enumerate(CH[c]['ep']):
            place(B['ep'], ep_st(hz(nn), 2.4, .7 if b == 23 else .55), T(b) + k * .016, .6)
        place(B['bass'], pan(bass_note(ROOT_HZ[CH[c]['root']], 1.7), 0), T(b), .8)
        if b < 25:
            K(T(b), .9); K(T(b, 8), .7)
            place(B['snap'], snap_s(), T(b, 12), .5)
            for s in range(0, 16, 2): place(B['shaker'], shaker_s(), T(b, s), .35)
            for s, idx in ((3, 2), (7, 3), (11, 1), (14, 3)):
                place(B['kal'], pan(kal_mono(hz(CH[c]['arp'][idx])), -.4 if s % 2 else .4), T(b, s), .6)
    for i, nn in enumerate(['A5', 'E5', 'C#6', 'A5']):          # last little sparkle
        place(B['kal'], pan(kal_mono(hz(nn), 1.4), -.3 + i * .2), T(25, 0) + .3 + i * .28, .55)

    # ── stem levels: calibrated to target RMS (dBFS) in the groove ──
    def rms_db(x, a, b):
        s = x[int(a * SR):int(b * SR)]
        return 20 * np.log10(np.sqrt(np.mean(s ** 2)) + 1e-12)
    TARGET = dict(kick=-30, bass=-30.5, ep=-25.5, pad=-31.5, kal=-30.5, snap=-33.5, shaker=-37.5, fx=-33)
    for k, v in B.items():
        cur = rms_db(v, 12, 20) if k != 'fx' else rms_db(v, 0, 52) + 6
        B[k] = v * 10 ** ((TARGET[k] - cur) / 20)

    # gentle sidechain (kick breathes the bass + pad), EQ to keep layers apart
    kt = kick_times
    B['bass'] *= sidechain_curve(N, kt, depth=.3, tau=.14)[:, None]
    B['pad'] *= sidechain_curve(N, kt, depth=.22, tau=.16)[:, None]
    B['ep'] = hp(B['ep'], 170); B['kal'] = hp(B['kal'], 320); B['snap'] = hp(B['snap'], 600); B['pad'] = hp(B['pad'], 90)

    # a little room — dark, short; the pad/EP bloom, drums stay dry-ish
    ir = make_ir(1.7, .014, 4, damp=3800)
    def rv(x, amt):
        return reverb(x, ir)[:N] * amt
    wet = rv(B['ep'], .3) + rv(B['kal'], .5) + rv(B['pad'], .25) + rv(B['snap'], .35) + rv(B['shaker'], .15)
    # soft dotted-eighth echo on the kalimba only
    d = pingpong(B['kal'].sum(axis=1), .375, fb=.3, taps=3)[:N]
    wet[:len(d)] += d * .22

    mix = sum(B.values()) + wet
    mix = hp(mix, 30, 2)
    mix = limiter(mix, .84)
    fo = np.ones(N)
    a, b = int((TOTAL - 2.4) * SR), int(TOTAL * SR)
    fo[a:b] = np.linspace(1, 0, b - a) ** 1.4
    fo[b:] = 0
    return mix * fo[:, None], kick_times


if __name__ == '__main__':
    import soundfile as sf, sys
    m, kt = build_music()
    print('peak', np.max(np.abs(m)), 'rms', np.sqrt(np.mean(m ** 2)), 'kicks', len(kt))
    sf.write(sys.argv[1] if len(sys.argv) > 1 else '/tmp/music.wav', m[:int(TOTAL * SR)], SR, subtype='FLOAT')
