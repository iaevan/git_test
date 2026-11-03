# Zavino services — motion explainer

A ~68 s motion-graphics explainer for Zavino's client services, built from the team's scene-by-scene script, plus the 30 s cutdown. Masters at **16:9**, cutdowns at **1:1** and **9:16**.

| file (in `out/`) | what |
|---|---|
| `zavino-services-60s-16x9.mp4` | the master: 1920×1080 |
| `zavino-services-60s-1x1.mp4`, `-60s-9x16.mp4` | the same film re-laid out for 1080×1080 and 1080×1920 (not crops: every scene has its own layout per frame shape) |
| `zavino-services-30s-16x9.mp4`, `-1x1`, `-9x16` | the 30 s cut: scenes 1, 3, 4, 5, 7, 9 with one line each |

All at 30 fps, AAC 192k, about −14 LUFS.

## How it follows the brief

* **Look** — sand `#E1D7C1` base, deep forest `#163524` for text and the logo, mid forest `#37634A` for highlights; one heavy rounded sans (**Nunito**, weights 800–1000) with the lowercase **zavino.** wordmark whose period is the closing mark.
* **Motif** — the ivory jet and the green paper-ribbon ramp from the homepage hero (`thezavino.com/media/flight-ramp.webp`): the film opens on a stone plinth with the ribbon ramp, the jet slides up and launches, and the ribbon unrolls across the frame. Every scene change is a **ribbon sweep** with the jet at its head — the outgoing scene eases out under it and the next eases in behind it, so there are **no hard cuts** and the film reads as one flight. The four process stops (scene 8) are plinths along the ribbon, and in the close the jet lands as the period of "zavino.".
* **Motion** — soft ease-in/out, small bounces on cards, ribbon sweeps as transitions.
* **Sound** — a light, warm instrumental (the skill's "story" bed) under the voice, soft taps, ticks and whooshes only, and a small lift (air riser + chime) at the logo.
* **Voice** — calm, confident, human: Higgsfield Eleven v4, preset voice **Julian** (the same narrator as the *regular.* teaser), directed `[calm, warm, confident]` etc. at stability 0.3; the exact script lines.
* **Claims** — only the homepage's own words (services, "Every lead has a next step.", "An answer, ready to review.", "Big ideas. A useful first step.", "Your team has the final say.", the four process steps, "Where vision takes flight."). No statistics, no client results, no Zavino Labs products (as the notes ask). No email on screen — only the website and the AI-audit call to action.

## Cutdown lines (30 s)

The brief asks for the first sentence of each kept scene. Two of those first sentences don't stand alone, so:

* scene 4 → "AI Operations builds assistants that answer from your approved documents." (the first sentence, shortened to one line)
* scene 5 → "Got an idea? We design, build and launch SaaS products, websites and web apps."
* scene 9 → "Have a project in mind? Book an AI audit. Zavino. Where vision takes flight."

These were recorded as separate takes so each ends naturally, rather than cut out of the long lines.

## Length

The script's voice-over reads at about 60 s on its own (Julian's calm pace). With room for the takeoff, the stamp and a held logo the full film is about 68 s. If it has to be 60 s flat, the quickest way is a slightly faster read (about 1.08×) or dropping the logo hold.

## Rebuild

```bash
python3 tools/voice.py              # download, trim, level and time the 13 voice takes → voice/<key>.wav + marks.json
python3 tools/make_variants.py      # variants/<cut>-<format>/short.json (timing, cues)
tools/build.sh                      # scenes.js (src/film.js + src/segments.js + marks + src/flight.js) → each variant
export CHROME=/path/to/chrome-headless-shell SHORTS_GL=swiftshader
node skill/scripts/animate.mjs render variants/60-16x9    # one variant (~10 min on 4 CPU cores); repeat per variant
tools/finish.sh                     # −14 LUFS → out/
```

| source | what |
|---|---|
| `src/film.js` | palette, type, layout per frame shape, the paper ribbon (a twisting band along a spline), the jet, plinths, cards, icons |
| `src/segments.js` | the nine scenes; each times its beats to the moment the matching phrase is spoken (`voice/marks.json`) |
| `src/flight.js` | the ribbon-sweep transitions and the dispatcher that draws every beat from global time |
| `voice/clips.json` | the 13 takes (ids, directed text, phrase breaks) |
| `skill/` | Shorts Animator working copy (clean look, per-line voice clips, cues, web fonts; Nunito up to weight 1000) |
