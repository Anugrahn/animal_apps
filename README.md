# Animal Friends

A learning app for children aged about 3 to 7, built as a single offline web app
(PWA) that installs on Android phones and desktops. A child designs their own
animal friend, then learns across four "islands": Phonics, English and Bahasa
Indonesia; Math and science; feelings and healthy habits; and play (mazes,
memory, songs, stories).

Since v4 (October 2026) the four core subjects — Phonics, English, Math and
Bahasa Indonesia — are modelled on the curriculum Danbi Education describes
for its Wink home-learning programme: short daily lessons that each walk from
a new idea to using it (concept → practice → problem-solving → review), a
"Today's Study" plan of two subjects a day, and a review at the end of every
stage. The extras keep the earlier Lingokids-shaped content model
(`animal-friends-v2/interface/lingokids_content_architecture.md`). All content
and art are original; nothing of Wink's or Lingokids' is used, and the app is
not affiliated with either.

- **No build step and no dependencies.** Plain HTML, CSS and JavaScript. Open
  `index.html` or run the bundled launcher.
- **Works offline.** A service worker caches everything after the first visit.
- **Nothing leaves the device.** Progress is kept in `localStorage`. Speech
  recognition is optional, and a grown-up has to turn it on.

---

## Repository layout

```
project_apps/
├── animal-friends-v2/     the current app (all active work happens here)
│   ├── docs/research/     the research behind decisions (kids-audio.md: the voice)
│   └── interface/         design references, mock-ups, AI art prompts and raw art sheets
├── tools/voice/           makes the recorded voice, on this computer
└── tools/test/            headless checks: content validator, a bot that plays every level, Today's Study, migration
```

| Folder | What it is | Start with |
|---|---|---|
| [`animal-friends-v2/`](animal-friends-v2/) | **The current app.** 4 core subjects (121 lessons) and 9 extras (97 levels), 16 game engines, painted characters, installable PWA | [README](animal-friends-v2/README.md), [TUTORIAL](animal-friends-v2/TUTORIAL.md) |
| [`animal-friends-v2/interface/`](animal-friends-v2/interface/) | Reference images, UI mock-ups, ChatGPT prompts used to make the art, and the original art sheets before they were cut up | see [Design and art pipeline](#design-and-art-pipeline) |

---

## Running it

From `animal-friends-v2/`:

| Platform | How |
|---|---|
| Mac | Double-click `start.command`. It starts `serve.py` on port 8765 and opens the app in a Chrome or Edge app window. The first time, right-click it and choose **Open**. |
| Windows | Double-click `start.bat`. Needs Python 3. |
| Any browser | Open `index.html` directly. Everything plays, but the app can't be installed and the microphone asks for permission more often. |
| Phone on the same Wi-Fi | `python3 serve.py 8765 --lan`, then open `http://<computer-ip>:8765` on the phone. Installing, offline use and the microphone need `https://`, so they won't work this way. |
| Online, for everyone | Cloudflare Pages builds and publishes every `git push` (free). Set-up, updates and how parents install it: [DEPLOY.md](DEPLOY.md). |

Use `serve.py` rather than `python3 -m http.server`. The plain server accepts
only five queued connections, so with many pictures loading at once some
requests get refused and the pictures show as broken.

Full setup steps for grown-ups, including USB port-forwarding to a phone, are in
[TUTORIAL.md](animal-friends-v2/TUTORIAL.md).

### Deep links for testing

```
index.html?go=home   ?go=maker   ?go=parents   ?go=tutorial
index.html?go=area:stem   ?go=map:math   ?go=map:math:4   ?go=play:phonics:ph1-1   ?go=play:maze:m3
           &friend=4      (start as the fifth ready-made friend, before one is made)
```

---

## The app at a glance (v4)

**How a child moves through it:** Home World → Island → Subject Map (stage
tabs: Step 1–4, Level 1–5, Tahap 1–4, or Basic / Intermediate / Advanced) →
Lesson or Game → Result. Alongside that are Today's Study, the Character
Maker, Tutorial, Grown-up Area and Settings.

| Island (`area`) | Subjects |
|---|---|
| ABC (`literacy`) | **Phonics**, **English**, **Bahasa Indonesia** (core) |
| STEM (`stem`) | **Math** (core), Discover, Coding |
| Heart (`life`) | Feelings, Healthy Me, Our Planet |
| Play (`play`) | Maze, Memory, Songs, Story Time |

A core lesson is three or four short games in a row (for example Listen →
Trace → Play → Quiz), about five minutes; see
[the curriculum section](animal-friends-v2/README.md#the-curriculum-v4-modelled-on-wink).

- **Friends:** 11 painted animals with 8 poses each, 16 colours (a hue shift of
  the same painting), plus hats, glasses, scarves, things to hold and 3 voices.
  A three.js 3D builder is kept as a fallback.
- **Game engines:** choose, order, build, memory, maze, sort, match, trace, pop,
  code, speak, story, song, breathe, plus `lesson` (a lesson's steps in a row)
  and `intro` (meet-it cards).
- **Scoring:** stars count mistakes, never time (0 mistakes = 3 stars, 1–2 =
  2 stars, 3 or more = 1 star; a lesson allows a little more). A child can't
  fail, and stars never go down. A level unlocks once the one before it has any
  star.
- **Adaptive help (rule-based):** after 2 attempts at a level, a wrong answer
  fades out. After 4, the prompt also repeats by itself. At 3 stars, a replay
  adds one more choice ("stretch").
- **Grown-up area:** progress report (this week's minutes, where the child is in
  each core subject, which topics are sure and which need practice), how the
  lessons work, play limit, speech privacy mode, "try at home" tips, and
  **Open every level**.

### Code layout and rules

```
animal-friends-v2/
  index.html  manifest.webmanifest  sw.js  serve.py  start.command  start.bat
  core/       router, UI shell, profile/progress, audio, speech, fx, levels, world, art, icons, CSS
  engines/    HOW to play: one file per family of game mechanics
  content/    WHAT to teach: plain data — phonics, english, bahasa, math (core), stem, life, play, plus bank.js
  art/        painted WebP/JPG assets cut from the sheets in animal-friends-v2/interface/assets/
  vendor/     three.min.js (MIT), fredoka.woff2 (OFL)
```

- Content never contains game code, and engines never contain subject matter.
  Engines talk only to `core/`.
- A new level is a data entry. A new subject is one `AF.register({...})` call,
  plus a `<script>` tag and a line in `sw.js`.
- **Bump `VERSION` in `animal-friends-v2/sw.js` whenever any file changes**, or
  installed copies keep serving the old files. The current value is
  `af-v4.2.0`.
- Don't add a framework, a build step or a package dependency, and keep the
  app working offline. See [`animal-friends-v2/CLAUDE.md`](animal-friends-v2/CLAUDE.md)
  for the full list of rules and
  [`UI_REDESIGN_SPEC.md`](animal-friends-v2/UI_REDESIGN_SPEC.md) for the
  visual system.

---

## Version history

| Version | What changed |
|---|---|
| v1 / Phase 0 (`animal-friends/`, removed in v3.5.2; see commit `d28a71f` or earlier) | Module registry, star rules, level map, one Letters module, `localStorage` progress |
| v2.0 | 3D characters, 14 subjects, 192 levels, 14 engines, island home, grown-up area, offline PWA |
| v2.5 | Every menu rebuilt from the mock-ups in `animal-friends-v2/interface/new_interface/`: one shared HUD and shared UI primitives |
| v2.6 | Closer match to the full-screen mock-ups: wooden signs, stage pills, maze board, Daily Journey track |
| v2.7 | Painted backgrounds (`art/bg-*.jpg`). Subjects and level stones are placed at measured points on them |
| v2.8 | Painted characters, icons and world pieces. `serve.py` added |
| v3.0 | 8 poses for every animal, painted cards, props, game icons and learning pictures |
| v3.1 | Game-needs batch (feelings faces, body, clothes, jobs, routines). Game icons on the map, and Daily Journey flow fixes |
| v3.3 | Review fixes: fairer stars, microphone and voice bugs, unlocking, offline on slow networks, content corrections |
| v3.4 | A natural recorded voice (Chatterbox, made on this Mac), paced for 3-year-olds; device voice only as a fallback. See `tools/voice/` |
| v4.0 | Curriculum modelled on Danbi Education's Wink: Phonics, English, Math (5 levels × 6 areas) and Bahasa Indonesia as multi-step lessons, Today's Study with carry-over and weekend review, review lessons, a Wink-style grown-up report. Letters, My Words, Say It!, Numbers and Shapes retired (their stars kept) |
| v4.1 | Smoother engines for small hands: tracing rewritten (the friend writes it first, the ink glides after the finger), forgiving taps, no talking over praise, the same help after two misses everywhere |
| v4.2 | Fits every screen (one fluid size scale, tablets sideways, lighter animation) and a design review: counting pictures first, Today's Study as a road, one green "go on", single-colour stage tabs, bigger game controls, a clearer grown-up report. Every recorded take is checked with Whisper and garbled ones recorded again |

The details for each version are in the
[v2 README](animal-friends-v2/README.md#the-mock-up-redesign-v25).

---

## Design and art pipeline

The art is made in ChatGPT image generation as **sheets** (many objects on a
transparent background). Each sheet is cut into single WebP pictures under
`animal-friends-v2/art/`.

| File / folder | Purpose |
|---|---|
| `animal-friends-v2/interface/*.png` | First reference images: home screen, level map, character setting, icons, maze and memory cards |
| `animal-friends-v2/interface/new_interface/` | Storyboard and menu/game mock-ups behind the v2.5 redesign |
| `animal-friends-v2/interface/DESIGN_PROMPTS.md` | The style lock and the prompts for full screens and backgrounds |
| `animal-friends-v2/interface/ASSET_PROMPTS.md` | Prompts for the character pose and island asset sheets |
| `animal-friends-v2/interface/GAME_NEEDS.md` | Every picture each game still needs, island by island, with ready-to-paste sheet prompts |
| `animal-friends-v2/interface/assets/` | The raw sheets: `background/`, `main/`, `icon_characters/`, `island_environment/`, `sheets/`, `game-needs/` |
| `animal-friends-v2/interface/lingokids_content_architecture.md` | Research report the curriculum is mapped against |

If a background picture is replaced, the points measured on it (`ISLETS` in
`core/world.js`, `PATH` in `core/levels.js`) have to be measured again. The
same goes for accessory anchor points on a character (`ANCHOR` in
`core/art.js`).

---

## Status, known gaps and next steps

**Tested:** a headless-Chrome bot played all 192 levels as a new child and
again with stretch mode on, with no dead ends and no script errors. Drag
gestures were simulated, screens were captured at 390×844 and 1280×720, and an
offline reload was checked.

**Not yet tested on real hardware:** an Android device, real touch, audible
speech, the microphone, Safari, Firefox, Windows, and the installed-app flow.

**Known gaps:**
- The voice is the device's text-to-speech, so letter sounds are approximate.
  Recorded human audio would be the biggest quality upgrade.
- 153 learning pictures are still emoji (animals, food, things, vehicles,
  nature, places). The sheets still to make are listed in `GAME_NEEDS.md`.
- One child per device, with no cloud sync. Songs have no sung vocal. Tracing
  has no capital letters.
- It's a PWA, not a store app. A Play Store build needs a TWA or Capacitor
  wrapper.
- It has no privacy/compliance review yet (COPPA / GDPR-K), which matters
  especially for the voice-check option.

**Next:**
1. Try it on a real Android phone with a real 4-year-old and fix what comes up
2. Make the remaining `GAME_NEEDS.md` art sheets
3. Record human audio for the 19 letter sounds and the prompts
4. Host it on `https://` so Android can install it and use the microphone
5. Add multi-child profiles, then colouring, jigsaws and a cooking game
