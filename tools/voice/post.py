"""Makes each take easy for a three-year-old to follow:
   .venv/bin/python post.py <jobs.json>
jobs.json: [{"in": raw wav, "out": wav to write, "text": line, "kind": "say" | "sound",
             "parts": [raw wav, ...] (a blend: one take per sound)}]
The numbers come from docs/research/kids-audio.md (section 9).

* slower: each line is stretched in time (WSOLA, so the pitch stays the
  same) towards about 125 words a minute, never more than 60% longer, so
  the voice stays natural; then a breath between sentences, a pause at
  natural breaks and a beat before the last word. (The research says to
  stretch 35% at most, but these takes are so quick that 35% leaves half
  the lines above 150 words a minute. The real cure is calmer takes.)
* pure letter sounds: /t/ /p/ /k/ /h/ are the puff of air only (no "uh"),
  /b/ /d/ /g/ keep only a tiny "uh", and /s/ /m/ /a/ ... are held long
  enough to hear
* blends ("buh … uh … guh") are built from those sounds the way a
  teacher blends them: each sound on its own, a breath, then the sounds
  run together ("b · u · g ... buuug"), instead of read out by the voice
* clearer and even: low rumble removed, every line at the same loudness
  (-16 LUFS), loud peaks held down (-1 dBTP) without turning the whole
  line down, and a little quiet before and after so nothing is clipped
Each line's pace goes in .wav-final/rates.json; gen.mjs lists the lines
still faster than 150 words a minute in too-fast.txt, the takes worth
recording again.
"""
import json, os, re, sys
import numpy as np
import librosa, soundfile as sf
import pyloudnorm
from scipy.signal import butter, sosfilt, resample_poly
from scipy.ndimage import maximum_filter1d, minimum_filter1d, uniform_filter1d
from audiotsm import wsola
from audiotsm.io.array import ArrayReader, ArrayWriter

TARGET_WPM = 125
MAX_STRETCH = 1.6
SHORT_STRETCH = 1.15          # one or two words ("Yay!", "Find blue.")

SENTENCE_GAP = 0.65           # seconds between sentences
PHRASE_GAP = 0.30             # at a comma or other natural break (a gap of 150 ms or more)
LAST_WORD_GAP = 0.35          # before the last word, which is usually the one to learn
KEEP_GAP = 0.10               # gaps shorter than this are inside a phrase: left alone

LUFS = -16.0
PEAK_DBTP = -1.0

# Letter sounds (content/bank.js AF.PHONICS), by how they are made.
BURST = {'tuh', 'puh', 'kuh', 'huh'}   # no voice: just the puff of air
SHORT = {'buh', 'duh', 'guh'}           # can't be said without a tiny "uh": keep 120 ms
VOWEL = {'aaah', 'ih', 'eh', 'uh', 'awh'}
HOLD = 0.9                    # /s/ /m/ ... held on their own (seconds)
HOLD_VOWEL = 0.65             # short vowels, held a little less so they stay short vowels
HOLD_APART = 0.45             # a blend, first time through: each held sound on its own...
APART_GAP = 0.3               # ...with this much quiet between the sounds
BLEND_GAP = 0.5               # then a breath
HOLD_IN_BLEND = 0.35          # then the sounds run together, each held this long


def stretch(y, mult):
    if mult <= 1.01:
        return y
    r = ArrayReader(y[np.newaxis, :])
    w = ArrayWriter(channels=1)
    wsola(channels=1, speed=1 / mult, frame_length=1024, synthesis_hop=256).run(r, w)
    return w.data[0].astype(np.float32)


def fade(y, sr, a=0.01, b=0.02):
    y = y.copy()
    na, nb = min(len(y) // 2, int(sr * a)), min(len(y) // 2, int(sr * b))
    if na: y[:na] *= np.linspace(0, 1, na)
    if nb: y[-nb:] *= np.linspace(1, 0, nb)
    return y


def hold(y, sr, secs):
    """Holds a sound for `secs`: only the steady middle is stretched, so
    the start and end of the sound stay natural. A longer take is cut
    short (the sound is steady, so its end can go)."""
    if len(y) > sr * secs * 1.1:
        return y[:int(sr * secs)]
    if len(y) >= sr * secs:
        return y
    a, b = len(y) // 4, len(y) * 3 // 4
    mid = y[a:b]
    want = sr * secs - (len(y) - len(mid))
    return np.concatenate([y[:a], stretch(mid, min(5.0, want / max(1, len(mid)))), y[b:]])


def burst(y, sr):
    """/t/ /p/ /k/ /h/: the part before the voice starts (the "uh")."""
    _, voiced, _ = librosa.pyin(y, fmin=70, fmax=500, sr=sr, frame_length=1024, hop_length=128)
    on = np.flatnonzero(voiced)
    cut = on[0] * 128 if len(on) else int(sr * 0.15)
    cut = int(np.clip(cut, sr * 0.06, sr * 0.18))
    return fade(y[:cut], sr, 0.003, 0.015)


def letter(y, sr, text, held):
    """A pure letter sound from a take of e.g. "tuh" or "ssss"."""
    y, _ = librosa.effects.trim(y, top_db=40)
    if text in BURST:
        return burst(y, sr)
    if text in SHORT:
        return fade(y[:int(sr * 0.12)], sr, 0.003, 0.03)
    return fade(hold(y, sr, min(held, HOLD_VOWEL) if text in VOWEL else held), sr)


def blend(parts, names, sr):
    """Each sound on its own, a breath, then the sounds run together."""
    quiet = lambda secs: np.zeros(int(sr * secs), np.float32)
    apart = [x for y, name in zip(parts, names) for x in (quiet(APART_GAP), letter(y, sr, name, HOLD_APART))][1:]
    return np.concatenate(apart + [quiet(BLEND_GAP), together(parts, names, sr)])


def together(parts, names, sr):
    """The sounds run together ("bbuuug"): held sounds overlap a little,
    and a stop gets the short silence it has in real speech."""
    out = np.zeros(0, np.float32)
    x = int(sr * 0.025)
    for y, name in zip(parts, names):
        s = letter(y, sr, name, HOLD_IN_BLEND)
        if not len(out):
            out = s
        elif name in BURST or name in SHORT:
            out = np.concatenate([out, np.zeros(int(sr * 0.05), np.float32), s])
        else:
            n = min(x, len(out), len(s))
            out = np.concatenate([out[:-n], out[-n:] * np.linspace(1, 0, n) + s[:n] * np.linspace(0, 1, n), s[n:]])
    return out


def breathe(y, sr, text):
    """Longer pauses: between sentences, at natural breaks and before the
    last word. Gaps inside a phrase are left as they are."""
    parts = librosa.effects.split(y, top_db=32, frame_length=1024, hop_length=128)
    if len(parts) < 2:
        return y
    gaps = [(parts[i][1], parts[i + 1][0]) for i in range(len(parts) - 1)]
    secs = [(b - a) / sr for a, b in gaps]
    want = [PHRASE_GAP if s >= 0.15 else 0 for s in secs]
    if secs[-1] >= KEEP_GAP:
        want[-1] = max(want[-1], LAST_WORD_GAP)
    sentences = len(re.findall(r'[.!?]["\')]*\s+\S', text))
    for i in sorted(range(len(gaps)), key=lambda i: -secs[i])[:sentences]:
        want[i] = SENTENCE_GAP
    out, last = [], 0
    for (a, b), s, w in zip(gaps, secs, want):
        out.append(y[last:a])
        if w > s:
            out.append(np.zeros(int((w - s) * sr), np.float32))
        last = a
    out.append(y[last:])
    return np.concatenate(out)


def loudness(y, sr):
    """-16 LUFS, then a limiter that holds peaks under -1 dBTP (measured
    on a 4x copy, so peaks between samples count too)."""
    m = pyloudnorm.Meter(sr)
    pad = np.concatenate([y, np.zeros(max(0, int(sr * 0.45) - len(y)), np.float32)])
    with np.errstate(divide='ignore'):
        lufs = m.integrated_loudness(pad)
    if np.isfinite(lufs):
        y = y * 10 ** ((LUFS - lufs) / 20)
    ceiling = 10 ** (PEAK_DBTP / 20)
    w = max(1, int(sr * 0.005))
    peak = maximum_filter1d(np.abs(resample_poly(y, 4, 1)), size=4 * w)[::4][:len(y)]
    gain = minimum_filter1d(np.minimum(1.0, ceiling / (peak + 1e-9)), size=w)
    y = y * uniform_filter1d(gain, size=w)
    tp = np.max(np.abs(resample_poly(y, 4, 1))) + 1e-9
    if tp > ceiling:
        y = y * (ceiling / tp)
    return y.astype(np.float32)


def process(job):
    sr = None
    if job.get('parts'):
        takes = []
        for f in job['parts']:
            t, sr = sf.read(f, dtype='float32')
            takes.append(t.mean(axis=1) if t.ndim > 1 else t)
        y, mult = blend(takes, job['text'].split(' … '), sr), 1.0
    else:
        y, sr = sf.read(job['in'], dtype='float32')
        if y.ndim > 1:
            y = y.mean(axis=1)
        y, _ = librosa.effects.trim(y, top_db=40)
        words = len(job['text'].split())
        if job['kind'] == 'sound':
            mult = 1.0
            y = letter(y, sr, job['text'], HOLD)
        else:
            secs = max(0.2, len(y) / sr)
            mult = SHORT_STRETCH if words <= 2 else min(MAX_STRETCH, max(1.0, (words / secs * 60) / TARGET_WPM))
            y = breathe(stretch(y, mult), sr, job['text'])
    y = sosfilt(butter(2, 100, 'highpass', fs=sr, output='sos'), y).astype(np.float32)
    y = loudness(y, sr)
    wpm = 0
    if job['kind'] != 'sound' and len(job['text'].split()) >= 3:
        wpm = len(job['text'].split()) / (len(y) / sr) * 60
    y = np.concatenate([np.zeros(int(sr * 0.08), np.float32), y, np.zeros(int(sr * 0.15), np.float32)])
    sf.write(job['out'], y, sr, subtype='PCM_16')
    return mult, wpm


jobs = json.load(open(sys.argv[1]))
done = [process(j) for j in jobs]
if done:
    path = os.path.join(os.path.dirname(jobs[0]['out']), 'rates.json')
    rates = json.load(open(path)) if os.path.exists(path) else {}
    rates.update({os.path.basename(j['out'])[:-4]: round(w) for (m, w), j in zip(done, jobs) if w})
    json.dump(rates, open(path, 'w'))
    wpm = [w for m, w in done if w]
    print(f'post: {len(done)} lines, stretched {np.mean([m for m, w in done]):.2f}x on average'
          + (f', median {np.median(wpm):.0f} words a minute' if wpm else ''), flush=True)
