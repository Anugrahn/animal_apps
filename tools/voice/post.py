"""Makes each take easy for a three-year-old to follow:
   .venv/bin/python post.py <jobs.json>
jobs.json: [{"in": raw wav, "out": wav to write, "words": n, "sound": bool}]

* slower: each line is stretched in time (WSOLA, so the pitch stays the
  same) towards about 140 words a minute, a pace for small children,
  never more than 60% longer, so the voice stays natural
* clearer: a little more space between words, low rumble removed, every
  line brought to the same loudness,
  and a little quiet before and after so the first sound is not clipped
"""
import json, sys
import numpy as np
import librosa, soundfile as sf
from scipy.signal import butter, sosfilt
from audiotsm import wsola
from audiotsm.io.array import ArrayReader, ArrayWriter

TARGET_WPM = 140
MAX_STRETCH = 1.6
SHORT_STRETCH = 1.15          # one or two words ("Yay!", "Find blue.")


def stretch(y, mult):
    if mult <= 1.01:
        return y
    r = ArrayReader(y[np.newaxis, :])
    w = ArrayWriter(channels=1)
    wsola(channels=1, speed=1 / mult, frame_length=1024, synthesis_hop=256).run(r, w)
    return w.data[0].astype(np.float32)


def breathe(y, sr):
    """Longer gaps between words and phrases: slower without any
    stretching, and each word stands on its own for a small listener."""
    parts = librosa.effects.split(y, top_db=32, frame_length=1024, hop_length=128)
    if len(parts) < 2:
        return y
    out, last = [], 0
    for a, b in parts:
        gap = y[last:a]
        if last and len(gap) > sr * 0.03:          # a real gap, not the start
            extra = int(min(0.22, 0.06 + len(gap) / sr * 0.9) * sr)
            gap = np.concatenate([gap, np.zeros(extra, np.float32)])
        out += [gap, y[a:b]]
        last = b
    out.append(y[last:])
    return np.concatenate(out)


def process(job):
    y, sr = sf.read(job['in'], dtype='float32')
    if y.ndim > 1:
        y = y.mean(axis=1)
    y, _ = librosa.effects.trim(y, top_db=40)
    secs = max(0.2, len(y) / sr)
    if job.get('sound'):
        mult = 1.0                                      # letter sounds are already said slowly
    elif job['words'] <= 2:
        mult = SHORT_STRETCH
    else:
        mult = min(MAX_STRETCH, max(1.0, (job['words'] / secs * 60) / TARGET_WPM))
    y = stretch(y, mult)
    if not job.get('sound'):
        y = breathe(y, sr)
    y = sosfilt(butter(2, 70, 'highpass', fs=sr, output='sos'), y).astype(np.float32)
    rms = np.sqrt(np.mean(y ** 2)) + 1e-9
    y = y * (10 ** (-18 / 20) / rms)                    # same loudness for every line
    peak = np.max(np.abs(y)) + 1e-9
    if peak > 0.89:
        y = y * (0.89 / peak)                           # never clip
    y = np.concatenate([np.zeros(int(sr * 0.08), np.float32), y, np.zeros(int(sr * 0.15), np.float32)])
    sf.write(job['out'], y, sr, subtype='PCM_16')
    return mult


jobs = json.load(open(sys.argv[1]))
done = [process(j) for j in jobs]
if done:
    print(f'post: {len(done)} lines, slowed by {np.mean(done):.2f}x on average', flush=True)
