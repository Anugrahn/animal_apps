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
  [`animal-friends-v2/docs/research/kids-audio.md`](../../animal-friends-v2/docs/research/kids-audio.md). To
  change them, edit `post.py`, bump `POST` in `gen.mjs`, and run
  `node gen.mjs --convert-only`. That takes about 3 minutes and records
  nothing again.
- **Still too fast:** `too-fast.txt` lists the lines still above 150 words a
  minute after `post.py`. The "lively" takes are quick, so these need
  recording again more calmly (see section 9 of the research).
- **Lines with no recording:** these use the device's own voice. For example,
  a story line naming a friend the child named themselves.
- **Every take is listened to:** Chatterbox sometimes garbles a short line
  ("Cool!" came out as "Koogle") or tacks a mumble onto the end. `gen_cb.py`
  transcribes each take with Whisper (`openai/whisper-base.en`, on this
  computer, ~300 MB, downloaded once; `asrcheck.py`) and makes it again, up to
  5 times for a line of 4 words or fewer and 3 for longer ones, keeping the take
  Whisper hears most rightly. Whisper cannot read letter sounds ("ssss"), so
  those are judged by length only.

## After changing what the app says

With the app running (`python3 serve.py` in `animal-friends-v2/`):

```sh
cd tools/voice
node harvest.mjs                      # 1. collect every spoken line -> phrases.json (muted bot, ~30 min)
node priority.mjs                     # 2. what to voice first -> priority.json (a minute)
node gen.mjs --calm                   # 3. voice the new lines (only new ones; ~20 s each with the checks)
```

`node harvest.mjs --quick` skips the bot (a minute): it adds the lines in the
level data and the fixed app lines to the `phrases.json` there is. Enough for
a small change after a full harvest.

`priority.mjs` puts first the lines every screen uses (the friend's cheers,
the result, the menus and celebrations, a lesson's step names), then each
subject's first stage, then the second, and so on.

Then bump `VERSION` in `animal-friends-v2/sw.js`.

- **See progress before it finishes:** `node gen.mjs --convert-only` puts the
  clips made so far into the app.
- **Calmer takes for the lines still too quick:** `node gen.mjs --calm`
  records again, with the research's settings (less lively, a sentence at a
  time, takes over 180 words a minute made again), every line in
  `too-fast.txt` and every line with no recording yet. `calm.json` keeps
  the list, so later runs keep them calm. Each line goes on playing its old
  take until its calm one is made. Try it first with `--dry-run` (counts
  and time, makes nothing) or `--limit 5`. About 2.5 hours on an M4 for
  everything, about 1.5 hours for the ready-made friends' lines, which come
  first. Run it plugged in, ideally overnight.
- **Checking what is recorded:** `.venv/bin/python qa.py --max-words 6 --out qa.json`
  transcribes the clips in `voice/index.js` (short lines first: they are the
  ones that go wrong) and flags those with words missing or extra, far too
  long for their words, clipped or very quiet. `--resume` carries on an
  interrupted run; `--only-file redo.txt` checks just those lines. Whisper mishears names and single words now and then, so
  read the list before trusting it.
- **Recording bad lines again:** put them in a file, one a line, and run
  `node gen.mjs --calm --redo redo.txt`. Their old files are deleted and they
  are recorded calmly, in priority order with everything else still to make.
- **Clean-up:** clips no line uses any more are deleted, unless that is more
  than a quarter of them (more likely a mistake). After changing `POST`,
  add `--prune` to delete the old clips.
- **Styles:** `calm` (gentle), `lively` (more expressive and slower; the
  default) and `bubbly` (most excited).
- **Switching style:** a new style records everything again.
- **Kokoro instead:** `node gen.mjs --engine kokoro --voice af_heart`.

## One-time set-up

```sh
cd tools/voice
npm install                                           # kokoro-js, lamejs (MP3), playwright
uv venv --python 3.11 .venv                           # https://docs.astral.sh/uv/
uv pip install --python .venv/bin/python chatterbox-tts==0.1.7 "setuptools<81" audiotsm==0.1.2 pyloudnorm==0.2.0 transformers==5.2.0 librosa==0.11.0
```

The models download on first use, about 2 GB for Chatterbox and 300 MB for Whisper.

## How the app uses it

- **The voice list:** `voice/index.js` maps each line to its file. Lines with
  the friend's name are recorded once for every ready-made and suggested name.
- **Playing a line:** `core/audio.js` plays the recording when there is one.
  A friend with a deep or squeaky voice gets the same recording played a
  little lower or higher.
- **Offline:** `voice/files.js` lists the clips `sw.js` stores for offline
  use.
