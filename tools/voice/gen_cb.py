"""Voices lines with Chatterbox (runs on this computer; nothing is sent
anywhere). Called by gen.mjs:  .venv/bin/python gen_cb.py <jobs.json> <wav dir>
jobs.json: [{"text": ..., "f": <file id>, "ex": exaggeration, "cfg": cfg_weight, "calm": bool}]
Writes <wav dir>/<f>.wav. A clip far longer or shorter than its text
should take (a garbled or dragged-out take) is made again, up to 3 times.
Every take is also heard back with Whisper (asrcheck.py): a take that does
not say its words, or says more ("Lovely, didn't you?"), is made again, up
to 5 times, and the take that matches best is kept.
A calm job (gen.mjs --calm) is voiced a sentence at a time, joined with a
short pause, and a sentence quicker than 180 words a minute is made again
(up to 3 times, keeping the slowest good take)."""
import json, os, re, sys, time
import torch, torchaudio
from huggingface_hub import hf_hub_download
from chatterbox.tts import ChatterboxTTS

# The model as it was when the voice was made: a newer upload would make
# new lines sound different from the old ones.
MODEL = 'ResembleAI/chatterbox'
REVISION = '5bb1f6ee58e50c3b8d408bc82a6d3740c2db6e18'

jobs = json.load(open(sys.argv[1]))
out = sys.argv[2]
os.makedirs(out, exist_ok=True)
dev = 'mps' if torch.backends.mps.is_available() else 'cpu'
for name in ['ve.safetensors', 't3_cfg.safetensors', 's3gen.safetensors', 'tokenizer.json', 'conds.pt']:
    ckpt = os.path.dirname(hf_hub_download(MODEL, name, revision=REVISION))
model = ChatterboxTTS.from_local(ckpt, dev)
torch.manual_seed(7)
try:
    from asrcheck import Checker
    checker = Checker()
except Exception as e:                      # (no Whisper: duration checks only)
    print('no Whisper check:', e, flush=True)
    checker = None


def plausible(text, secs):
    # about 14 characters a second when speaking slowly to a child
    want = max(0.6, len(text) / 14.0)
    return want * 0.45 <= secs <= want * 2.4 + 0.8


MAX_WPM = 180


def take(text, j):
    """One take of `text`, made again if garbled (its length is far off, or
    Whisper hears other or extra words) or, for a calm job, quicker than
    MAX_WPM. The best take is kept: the one Whisper hears most rightly, then
    the slowest."""
    best, best_key = None, None
    # a short line is where Chatterbox goes astray ("kite" came out as "Great"): more tries
    tries = (5 if len(text.split()) <= 4 else 3) if checker else 3
    for attempt in range(tries):
        wav = model.generate(text, exaggeration=j['ex'], cfg_weight=j['cfg'], temperature=0.8)
        secs = wav.shape[-1] / model.sr
        ok = plausible(text, secs)
        words = len(text.split())
        quick = j.get('calm') and words >= 3 and words / secs * 60 > MAX_WPM
        score, extra, heard = (checker.check(text, wav.cpu().numpy(), model.sr) if checker else (1.0, 0, ''))
        right = checker is None or Checker.good(text, score, extra)
        key = (ok, right, score - 0.25 * extra, not quick, secs)
        if best is None or key > best_key:
            best, best_key = wav, key
        if ok and right and not quick:
            break
        why = 'length' if not ok else 'heard ' + repr(heard[:40]) if not right else 'quick'
        print(f'  retry {attempt + 1}: {secs:.1f}s, {why}, for "{text[:50]}"', flush=True)
    return best


t0 = time.time()
for n, j in enumerate(jobs, 1):
    path = os.path.join(out, j['f'] + '.wav')
    if os.path.exists(path):
        continue
    if j.get('calm') and len(j['text'].split()) > 6:
        # a sentence at a time, with a short pause between (post.py makes it the full pause);
        # a short line is said in one go: a lone "Cool!" is what the voice garbles most
        parts = [p for p in re.split(r'(?<=[.!?])\s+', j['text'].strip()) if p]
        gap = torch.zeros(1, int(model.sr * 0.4))
        pieces = []
        for k, p in enumerate(parts):
            pieces += ([gap] if k else []) + [take(p, j).cpu()]
        best = torch.cat(pieces, dim=-1)
    else:
        best = take(j['text'], j).cpu()
    torchaudio.save(path, best, model.sr, encoding='PCM_S', bits_per_sample=16)
    if n % 25 == 0:
        el = time.time() - t0
        print(f'{n}/{len(jobs)}  {el / 60:.1f} min, about {el / n * (len(jobs) - n) / 60:.0f} min to go', flush=True)
print('done', len(jobs), flush=True)
