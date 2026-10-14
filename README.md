# Animal Friends

A learning app for children aged about 3 to 7, built as a single offline web app
(PWA) that installs on Android phones and desktops. A child designs their own
animal friend, then plays short learning games across four "islands": letters
and words, numbers and science, feelings and healthy habits, and play (mazes,
memory, songs).

The curriculum is shaped by the Lingokids content model
(`animal-friends-v2/interface/lingokids_content_architecture.md`). All content and art are
original; Lingokids' characters and licensed content are not used.

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
└── tools/voice/           makes the recorded voice, on this computer
```

| Folder | What it is | Start with |
|---|---|---|
| [`animal-friends-v2/`](animal-friends-v2/) | **The current app.** 14 subjects, 192 levels, 14 game engines, painted characters, installable PWA | [README](animal-friends-v2/README.md), [TUTORIAL](animal-friends-v2/TUTORIAL.md) |
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
index.html?go=area:stem   ?go=map:letters   ?go=map:letters:2   ?go=play:maze:m3
           &friend=4      (start as the fifth ready-made friend, before one is made)
```

---

## The app at a glance (v2)

**How a child moves through it:** Home World → Island → Subject Map (Basic /
Intermediate / Advanced) → Game → Result. Alongside that are the Character
Maker, Tutorial, Grown-up Area and Settings.

| Island (`area`) | Subjects |
|---|---|
| ABC (`literacy`) | Letters, My Words, Say It!, Stories |
| STEM (`stem`) | Numbers, Shapes, Discover, Coding |
| Heart (`life`) | Feelings, Healthy Me, Our Planet |
| Play (`play`) | Maze, Memory, Songs |

- **Friends:** 11 painted animals with 8 poses each, 16 colours (a hue shift of
  the same painting), plus hats, glasses, scarves, things to hold and 3 voices.
  A three.js 3D builder is kept as a fallback.
- **Game engines:** choose, order, build, memory, maze, sort, match, trace, pop,
  code, speak, story, song, breathe.
- **Scoring:** stars count mistakes, never time (0 mistakes = 3 stars, 1–2 =
  2 stars, 3 or more = 1 star). A child can't fail, and stars never go down. A
  level unlocks once the one before it has any star.
- **Adaptive help (rule-based):** after 2 attempts at a level, a wrong answer
  fades out. After 4, the prompt also repeats by itself. At 3 stars, a replay
  adds one more choice ("stretch").
- **Grown-up area:** progress report, play limit, speech privacy mode, "try at
  home" tips, and **Open every level**.

### Code layout and rules

```
animal-friends-v2/
  index.html  manifest.webmanifest  sw.js  serve.py  start.command  start.bat
  core/       router, UI shell, profile/progress, audio, speech, fx, levels, world, art, icons, CSS
  engines/    HOW to play: one file per family of game mechanics
  content/    WHAT to teach: plain data, one file per island, plus bank.js
  art/        painted WebP/JPG assets cut from the sheets in animal-friends-v2/interface/assets/
  vendor/     three.min.js (MIT), fredoka.woff2 (OFL)
```

- Content never contains game code, and engines never contain subject matter.
  Engines talk only to `core/`.
- A new level is a data entry. A new subject is one `AF.register({...})` call,
  plus a `<script>` tag and a line in `sw.js`.
- **Bump `VERSION` in `animal-friends-v2/sw.js` whenever any file changes**, or
  installed copies keep serving the old files. The current value is
  `af-v3.5.7`.
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
