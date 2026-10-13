"""Voices lines with Chatterbox (runs on this computer; nothing is sent
anywhere). Called by gen.mjs:  .venv/bin/python gen_cb.py <jobs.json> <wav dir>
jobs.json: [{"text": ..., "f": <file id>, "ex": exaggeration, "cfg": cfg_weight}]
Writes <wav dir>/<f>.wav. A clip far longer or shorter than its text
should take (a garbled or dragged-out take) is made again, up to 3 times."""
import json, os, sys, time
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


def plausible(text, secs):
    # about 14 characters a second when speaking slowly to a child
    want = max(0.6, len(text) / 14.0)
    return want * 0.45 <= secs <= want * 2.4 + 0.8


t0 = time.time()
for n, j in enumerate(jobs, 1):
    path = os.path.join(out, j['f'] + '.wav')
    if os.path.exists(path):
        continue
    best = None
    for attempt in range(3):
        wav = model.generate(j['text'], exaggeration=j['ex'], cfg_weight=j['cfg'], temperature=0.8)
        secs = wav.shape[-1] / model.sr
        best = wav
        if plausible(j['text'], secs):
            break
        print(f'  retry {attempt + 1}: {secs:.1f}s for "{j["text"][:50]}"', flush=True)
    torchaudio.save(path, best.cpu(), model.sr, encoding='PCM_S', bits_per_sample=16)
    if n % 25 == 0:
        el = time.time() - t0
        print(f'{n}/{len(jobs)}  {el / 60:.1f} min, about {el / n * (len(jobs) - n) / 60:.0f} min to go', flush=True)
print('done', len(jobs), flush=True)
