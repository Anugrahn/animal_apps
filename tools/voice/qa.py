"""Checks every recording says what it should, and nothing else.

    .venv/bin/python qa.py [--only "Roar!,Yay!"] [--only-file redo.txt] [--limit 50] [--out qa.json]

For each line in animal-friends-v2/voice/index.js (and each name line for
the ready-made friends) it:
  * transcribes the clip with Whisper (openai/whisper-base.en, on this
    computer; downloaded once, ~300 MB),
  * compares the words with the line (a share of words that match, 0-1),
  * looks at the sound itself: far too long for its words (a mumble or a
    growl tacked on), clipping, very quiet takes.
Short lines go first: they are the ones the voice garbles most.
Writes qa.json (every clip) and prints the worst ones. Letter sounds
("ssss", "tuh") are only checked for length and noise: Whisper cannot
read them.
Nothing is sent anywhere.
"""
import argparse, difflib, json, os, re, sys
import numpy as np
import librosa

HERE = os.path.dirname(os.path.abspath(__file__))
APP = os.path.join(HERE, '..', '..', 'animal-friends-v2')
VOICE = os.path.join(APP, 'voice')

ap = argparse.ArgumentParser()
ap.add_argument('--only', default='')
ap.add_argument('--only-file', default='', help='only the lines in this file, one a line ({name} lines: every name)')
ap.add_argument('--limit', type=int, default=0)
ap.add_argument('--out', default=os.path.join(HERE, 'qa.json'))
ap.add_argument('--model', default='openai/whisper-base.en')
ap.add_argument('--max-words', type=int, default=0, help='only lines this short (a quick first pass)')
ap.add_argument('--resume', action='store_true', help='keep what --out already holds and check the rest')
args = ap.parse_args()

src = open(os.path.join(VOICE, 'index.js'), encoding='utf8').read()
body = src[src.index('.VOICE =') + len('.VOICE ='):]
data = json.loads(body[:body.rindex('}') + 1])
phrases = json.load(open(os.path.join(HERE, 'phrases.json'), encoding='utf8'))

jobs = []                     # (text as spoken, file id, kind)
for text, fid in data['clips'].items():
    jobs.append((text, fid, phrases.get(text, 'say')))
for tpl, by in data.get('named', {}).items():
    for name, fid in by.items():
        jobs.append((tpl.replace('{name}', name), fid, 'say'))
if args.only:
    want = set(t.strip() for t in args.only.split(','))
    jobs = [j for j in jobs if j[0] in want]
if args.only_file:
    lines = [l.strip() for l in open(args.only_file, encoding='utf8') if l.strip()]
    plain = set(l for l in lines if '{name}' not in l)
    tpls = [l.split('{name}', 1) for l in lines if '{name}' in l]
    jobs = [j for j in jobs if j[0] in plain or any(j[0].startswith(a) and j[0].endswith(b) for a, b in tpls)]
if args.limit:
    jobs = jobs[:args.limit]

from asrcheck import words, match      # (the same forgiving comparison gen_cb.py uses)

print(f'loading {args.model} …', file=sys.stderr)
from transformers import pipeline
asr = pipeline('automatic-speech-recognition', model=args.model, device='cpu')

# short lines first: they are the ones Chatterbox garbles most ("Cool!" -> "Koogle")
jobs.sort(key=lambda j: len(words(j[0])))
if args.max_words:
    jobs = [j for j in jobs if len(words(j[0])) <= args.max_words]

def plausible_max(text):
    return max(0.6, len(text) / 14.0) * 2.4 + 0.8      # (gen_cb.py's limit for a take)

out = []
if args.resume and os.path.exists(args.out):
    out = json.load(open(args.out))
    seen = set((r['text'], r['file']) for r in out)
    jobs = [j for j in jobs if (j[0], j[1]) not in seen]
    print(f'resuming: {len(out)} done, {len(jobs)} to go', file=sys.stderr)
B = 16
for start in range(0, len(jobs), B):
    batch = []
    for text, fid, kind in jobs[start:start + B]:
        path = os.path.join(VOICE, fid + '.mp3')
        if not os.path.exists(path):
            continue
        y, sr = librosa.load(path, sr=16000, mono=True)
        batch.append((text, fid, kind, y))
    said = [b for b in batch if b[2] != 'sound']
    heard = asr([{'raw': b[3], 'sampling_rate': 16000} for b in said], batch_size=B) if said else []
    heard = {b[1]: h['text'].strip() for b, h in zip(said, heard)}
    for text, fid, kind, y in batch:
        dur = len(y) / 16000
        peak = float(np.max(np.abs(y))) if len(y) else 0.0
        rms = librosa.feature.rms(y=y, frame_length=400, hop_length=160)[0]
        loud = rms > max(0.02, 0.18 * (rms.max() if len(rms) else 0))
        idx = np.nonzero(loud)[0]
        t0 = (idx[0] * 160 / 16000) if len(idx) else 0.0
        t1 = (idx[-1] * 160 / 16000) if len(idx) else 0.0
        rec = {'text': text, 'file': fid, 'kind': kind, 'dur': round(dur, 2), 'peak': round(peak, 3), 'speech': round(t1 - t0, 2)}
        flags = []
        if kind != 'sound':
            h = heard.get(fid, '')
            score, extra = match(text, h)
            rec.update({'heard': h, 'score': round(score, 2), 'extra': extra})
            n = len(words(text))
            if score < (0.8 if n > 2 else 0.99): flags.append('words')
            if extra > (1 if n > 5 else 0): flags.append('extra')
            # post.py slows takes down for small children, so allow for that (x1.6)
            if t1 - t0 > plausible_max(text) * 1.6: flags.append('long')
        if peak > 0.99: flags.append('clip')
        if peak < 0.1: flags.append('quiet')
        rec['flags'] = flags
        out.append(rec)
    print(f'{min(start + B, len(jobs))}/{len(jobs)}', file=sys.stderr, flush=True)
    json.dump(out, open(args.out, 'w'), indent=1)

json.dump(out, open(args.out, 'w'), indent=1)
bad = [r for r in out if r['flags']]
bad.sort(key=lambda r: (r.get('score', 1), -len(r['flags'])))
print(f'{len(out)} clips checked, {len(bad)} flagged')
for r in bad[:80]:
    print(f"{','.join(r['flags']):14} {r.get('score', '-')!s:5} {r['text'][:60]!r:64} heard {r.get('heard', '')[:60]!r}")
