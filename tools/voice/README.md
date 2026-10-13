# Voice tools

These tools make the recorded voice for Animal Friends. The app itself has no
dependencies. These tools run only on your computer, and they write MP3 files
into `animal-friends-v2/voice/`, which the app plays. Nothing is sent to an
online service.

- **The voice:** [Chatterbox](https://github.com/resemble-ai/chatterbox) (MIT)
  from Resemble AI. It is a natural, expressive voice with a setting for how
  lively it sounds, and it runs on the Mac's GPU (Apple Silicon).
- **The quicker, flatter option:** [Kokoro](https://www.npmjs.com/package/kokoro-js)
  (Apache-2.0).
- **Paced for three-year-olds:** `post.py` stretches every take towards
  about 125 words a minute (never more than 60% longer). It adds pauses
  between sentences and before the last word, makes letter sounds pure
  (/t/ is a puff of air, not "tuh"), builds blends from those sounds, and
  evens the loudness. The numbers come from
  [`docs/research/kids-audio.md`](../../docs/research/kids-audio.md). To
  change them, edit `post.py`, bump `POST` in `gen.mjs`, and run
  `node gen.mjs --convert-only`. That takes about 3 minutes and records
  nothing again.
- **Still too fast:** `too-fast.txt` lists the lines still above 150 words a
  minute after `post.py`. The "lively" takes are quick, so these need
  recording again more calmly (see section 9 of the research).
- **Lines with no recording:** these use the device's own voice. For example,
  a story line naming a friend the child named themselves.

## After changing what the app says

With the app running (`python3 serve.py` in `animal-friends-v2/`):

```sh
cd tools/voice
node harvest.mjs                      # 1. collect every spoken line -> phrases.json (muted bot, ~30 min)
node gen.mjs --style lively           # 2. voice the new lines (only new ones; ~5 s each on an M4)
```

Then bump `VERSION` in `animal-friends-v2/sw.js`.

- **See progress before it finishes:** `node gen.mjs --convert-only` puts the
  clips made so far into the app.
- **Styles:** `calm` (gentle), `lively` (more expressive and slower; the
  default) and `bubbly` (most excited).
- **Switching style:** a new style records everything again.
- **Kokoro instead:** `node gen.mjs --engine kokoro --voice af_heart`.

## One-time set-up

```sh
cd tools/voice
npm install                                           # kokoro-js, lamejs (MP3), playwright
uv venv --python 3.11 .venv                           # https://docs.astral.sh/uv/
uv pip install --python .venv/bin/python chatterbox-tts "setuptools<81" audiotsm==0.1.2
```

The models download on first use, about 2 GB for Chatterbox.

## How the app uses it

- **The voice list:** `voice/index.js` maps each line to its file. Lines with
  the friend's name are recorded once for every ready-made and suggested name.
- **Playing a line:** `core/audio.js` plays the recording when there is one.
  A friend with a deep or squeaky voice gets the same recording played a
  little lower or higher.
- **Offline:** `voice/files.js` lists the clips `sw.js` stores for offline
  use.
