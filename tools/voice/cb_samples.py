"""Chatterbox voice samples to compare:  .venv/bin/python cb_samples.py <out dir>"""
import os, sys, time
import torch, torchaudio
from chatterbox.tts import ChatterboxTTS

OUT = sys.argv[1]
os.makedirs(OUT, exist_ok=True)
dev = 'mps' if torch.backends.mps.is_available() else 'cpu'
t = time.time()
model = ChatterboxTTS.from_pretrained(device=dev)
print('loaded on', dev, f'{time.time() - t:.1f}s', flush=True)

LINES = [
    'Hooray! You found the apple! Well done!',
    'Which letter says sss?',
    'Rex found a tiny seed. What will it grow into?',
    'Pick up three apples, only apples! Then find the house!',
    'Good try! Let\'s do it together.',
]
STYLES = {            # name: (exaggeration, cfg_weight)
    'calm':    (0.5, 0.5),
    'lively':  (0.8, 0.3),
    'bubbly':  (1.1, 0.25),
}
for name, (ex, cfg) in STYLES.items():
    for i, line in enumerate(LINES):
        t = time.time()
        wav = model.generate(line, exaggeration=ex, cfg_weight=cfg, temperature=0.8)
        torchaudio.save(f'{OUT}/cb-{name}-{i}.wav', wav.cpu(), model.sr, encoding='PCM_S', bits_per_sample=16)
        print(name, i, f'{time.time() - t:.1f}s', flush=True)
