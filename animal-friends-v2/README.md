# Animal Friends — v2 first look

v1 proved the plumbing with one game. v2 turns it into a small learning
platform shaped like `lingokids_content_architecture.md`: real 3D characters the
child designs, 14 subjects, 192 playable levels in three stages (Basic,
Intermediate, Advanced), a grown-up area, and offline install on Android and
desktop.

The look follows the reference images in `../interface/` (`home_screen.png`,
`game_level.png`, `charcter_setting.png`, `interface.png`, `icon.png`,
`icon2.png`, `maze_n_card.png`): an outdoor island world, level maps drawn as
islands, glossy "jelly" icons, and games played with soft clay pieces on a
wooden tray. See "Look and feel" and "How it moves" below.

Still no build step and no dependencies to install. To play, see
[TUTORIAL.md](TUTORIAL.md). The short version: double-click `start.command`
(Mac) or `start.bat` (Windows), or just open `index.html`.

v1 is untouched in `../animal-friends/`.

---

## What is new

| | v1 | v2 |
|---|---|---|
| Characters | 3 fixed SVG drawings | Real 3D (three.js), 11 animals × 16 colours × hats, glasses, things to hold, 3 voices |
| Subjects | Letters | 14, across the four areas below |
| Playable levels | 5 | 192, in three stages per subject |
| Game types | 1 | 14 engines: choose, order, build, memory, maze, sort, match, trace, pop, code, speak, story, song, breathe |
| Touch | Tap | Tap everywhere, plus pick-up-and-carry, finger tracing and leading the friend through the maze |
| Pronunciation | — | Say It!, with voice check or on-device echo |
| Home | Tile grid | An island world: 4 floating islands, the child's friend in the middle, a Daily Journey river (3 daily picks) |
| Look | Violet, emoji buttons | Sky, hills, trees, bubbles, bird song; 40 custom jelly icons; a different sky per island |
| Grown-ups | Sound / motion | Progress report, play limit, speech privacy choice, "try at home" tips |
| Onboarding | — | Eight-slide how-to-play, replayable from ❓ |
| Offline | Needed Google Fonts | Fully self-contained; service worker; installable |

A v1 profile is migrated on first run: the friend and the stars for Letters
levels 1–5 carry over.

---

## Three stages per subject

Every subject's levels are split into **Basic**, **Intermediate** and
**Advanced**. Each stage has its own island map and its own treasure chest; the
chest at the end of one stage opens the next. Three pills above the map switch
between stages.

| Subject | Basic | Intermediate | Advanced |
|---|---|---|---|
| Letters (23) | s a t p i n: hear, trace, pop | first sounds, m d g o c k, build 3-letter words, letter-and-picture match | e u r h b f l, blending, rhymes, sight words, 4-letter words, write a word |
| My Words (20) | animals, food, colours, body, shadows | vehicles, home, outside, clothes, toys, animal-or-food sort | reading, opposites, odd one out, jobs |
| Say It! (12) | animals, food, colours | numbers, body, vehicles, home, kind words | feelings, long words, sentences, questions |
| Stories (6) | 2 short stories | 2 medium | 2 long, up to 9 pages and 5 questions |
| Numbers (23) | to 5: count, trace, match, pop | to 10, more/fewer, order, before/after, add and take away to 5 | sums to 10, missing number, bigger number, counting in 2s, 5s and 10s |
| Shapes (17) | 4 shapes, lines, size, AB patterns | 8 shapes, shape hunt, colour sort, ABB/ABC | sides, long patterns, ordering by size, pentagon and hexagon |
| Discover (15) | animal homes, senses, food chains, living or not, day or night | life cycles, weather, float/sink, hot/cold | space, hard/soft, seasons, water cycle, what plants need |
| Coding (15) | straight lines, one turn, with footprints | rocks to walk round, stars to collect | 5×5 and 6×5 boards, three stars, 16-step plans |
| Feelings (12) | faces, breathing | reading situations, kind choices, kind/unkind sort | bigger feelings, what helps, being a good friend |
| Healthy Me (9) | washing, brushing, everyday food | the day, tidying up, staying safe | sneezes and germs, food groups, healthy body |
| Our Planet (9) | recycling, help or hurt | wild homes, growing a garden, saving water and power | four bins, reusing things, what living things need |
| Maze (13) | 4×4 to 5×5, Forest | 6×6 to 7×7, letters and counting in order, Beach | 8×8 to 9×9, spelling a word in order, Snow and Night |
| Memory (12) | 3 to 5 pairs, with a first look | 6 pairs; word, number and sound pairs | 8 and 10 pairs; rhyme and opposite pairs |
| Songs (6) | ABC, Tidy up | Count to ten, Wash your hands | Rainbow song, Days of the week |

Later stages also run longer: about 5–6 questions per level in Basic, 7–8 in
Intermediate, 8–10 in Advanced.

A level unlocks when the one before it has any star, so the stages open in
order. **Open every level** in the grown-up area removes the locks, for an older
child who should start further on.

---

## How it moves

The first v2 looked soft and moved stiffly. `core/motion.css` is the fix, in
one file:

- **One spring** (`--spring`) shared by everything: a pressed button, a card
  landing, a new screen.
- **Screens grow out of the spot that was touched**; the screen being left
  fades back behind it.
- **Anything pressed squashes fast and springs back.**
- **Things arrive one after another**, and one question tumbles away before the
  next drops in. The friend and the speech bubble stay put between questions.
- **Things can be picked up.** In order, build, sort and match the piece follows
  the finger, leans the way it is pulled, and springs back if dropped on
  nothing. A tapped piece glides to its place in an arc.
- **Nothing is quite still:** tiles bob, icons wobble, the friend sways, things
  in the maze hover.
- **Every touch is answered** with a ring where the finger landed.

"Bubbles, confetti & wiggles" off in the grown-up area calms all of it.

### The clay-and-wood games (`maze_n_card.png`)

| From the reference | In the app |
|---|---|
| Memory: pillowy coloured tiles in a wooden tray, white shapes pressed in, a "Pairs: 0/4" counter | The same, drawn in CSS. Card backs are coloured clay with a paw; the Clay shapes levels use the white star, moon, sun, heart, fish, leaf and flower from the picture. Cards tip up on a spring, hop when they match and shake their heads when they do not. Basic levels show every card for a moment first. |
| Maze: thick soft hedges on a wooden board, a little house, four coloured arrows round a glowing bulb | Each wall is one thick round-ended line drawn three times (shadow side, body, highlight). The friend waddles, turns to face the way it walks, kicks up dust and squashes when it stops. Hedges change with the stage: green forest, coral beach, pink candy, blue snow, purple night. |
| | New: hold a finger on the board and the friend follows it. |

### Five new kinds of game

Chosen from what Lingokids and similar apps use most, and from research on what
under-fives can physically do (see Sources): tap and drag-and-drop are the two
gestures they manage reliably.

| Game | What it is | Where |
|---|---|---|
| **Sort** | Carry each thing to the basket it belongs in | Discover, Healthy Me, Our Planet, Shapes, Words, Feelings |
| **Match** | Join a thing to its shadow, its word, its number or its partner | Words, Letters, Numbers, Shapes, Discover, Our Planet |
| **Trace** | Follow a letter, number or line from the green dot. The ink only moves forward along the line, so a wobbly finger still succeeds | Letters, Numbers, Shapes |
| **Pop** | Bubbles drift up; pop the three that carry the answer. No clock: they keep coming | Letters, Words, Numbers, Shapes, Feelings |
| **Coding** | Line up arrows, then press Go and watch the friend follow the plan. A plan that hits a rock is mended, not failed | its own subject on STEM Island |

Suggested next, not built: colouring and stickers, jigsaw pieces, dot-to-dot,
a cooking game (follow a recipe in order), and a piano for the songs.

---

## Curriculum map

How each part of `lingokids_content_architecture.md` is covered.

### Subject matrix (section 3)

| Curriculum | Module | Levels |
|---|---|---|
| Phonetics & pre-reading | **Letters** | Letter sounds in Phase 2 order (s a t p · i n m d · g o c k · e u r · h b f l), tracing, first sounds, blending, building words, rhymes, sight words |
| Vocabulary acquisition | **My Words** | Animals, food, colours, body, vehicles, home, outside, reading words |
| Speech practice | **Say It!** | Animals, food, colours, numbers, kind words, body |
| Pre-numeracy | **Numbers**, **Shapes** | Counting to 10, numerals, more/fewer, ordering, adding, taking away; shapes, size, patterns, real-life shape hunt |
| Scientific inquiry | **Discover**, **Coding** | Animal homes, senses, living/non-living, life cycles, weather, float or sink, seasons, space; first coding (planning steps in order) |
| Emotional intelligence | **Feelings** | Naming faces, reading situations, calm breathing, kind choices |
| Hygiene & routines | **Healthy Me** | Hand washing, tooth brushing, everyday vs sometimes food, morning and bedtime |
| Global citizenship | **Our Planet** | Sorting recycling, what helps the Earth, wild habitats |

### Formats (section 4)

| Format | Status |
|---|---|
| Interactive games | Done: Maze, Memory and every quiz engine |
| Audiobooks | Done: 3 read-aloud stories starring the child's own character, with questions |
| Music & songs | Done: 3 sing-alongs on public-domain tunes, with a drum |
| Videos & cartoons | **Not built.** Needs produced video. |
| Podcasts | **Not built.** Needs recorded audio. |

### The eight pillars (section 2)

| Pillar | How it shows up |
|---|---|
| Whole child | Four areas: literacy, STEM, social-emotional, play |
| Engineered motivation | Own character, stars, level maps, day streak, daily adventure, celebrations |
| Personalised & adaptive | Per-level attempts drive help; mastered levels get harder (see below) |
| Guided stretch | Wrong answers fade after two misses; maze hints; "stretch" mode at 3 stars |
| Structure & critical thinking | Recall games beside maze, patterns, sorting |
| Assessment for progress | No tests. Mistakes and thinking time are logged quietly and shown to the grown-up |
| Real-life application | A "try at home" idea per subject, shown after a first win and in the grown-up area |
| Social & family | Grown-up area; tips are things to do together. No multi-child profiles yet |

**On "AI-driven" adaptivity:** this build is rule-based, not a model. After 2
attempts at a level a wrong answer fades; after 4 the question also repeats by
itself; at 3 stars a replay adds one more choice or pair. Response time is
recorded for the parent report but does not yet change difficulty.

Lingokids' licensed content (Disney, NASA, Oxford) and its own characters are
deliberately not imitated. Everything here is original.

---

## The mock-up redesign (v2.5)

Every menu level was rebuilt to match `../interface/new_interface/`
(`Animal Friends App Storyboard Mockup.png`, `main_menu.png`, `Menu.png`,
`games.png`), following `CLAUDE.md` and `UI_REDESIGN_SPEC.md`.

- **One frame everywhere** (`AF.UI.hud` in `core/ui.js`): Back (Settings at
  Home) top-left, a wooden sign with the screen's name, the friend's face with
  star and streak pills top-right, Home bottom-right off the home screen.
- **Shared pieces** in `core/ui.js` and `core/ui.css`: pills, wooden sign,
  bubble-letter logo, star row, stage tabs, tree stump, cream card, big round
  buttons, toggles. Spacing, touch sizes, radii, depth and timing are tokens at
  the top of `ui.css`.
- **Home:** the logo, the friend on a stump, four islands with their own outline
  (round, lagoon, heart, square) on a lake, the island to try next marked, and a
  wooden Daily Journey bar that opens its own screen.
- **Island:** subjects are landmarks on islets along a sandy path, not a grid;
  stars count stages finished. Sideways on wide screens.
- **Level map:** a meadow with a dirt path read top to bottom, gold coins for
  finished levels, a bigger blue stone with a gold rim for the next one, grey
  padlocked stones, the friend walking on after each level.
- **Games:** a cream prompt bar with a blue speaker, the friend on a stump,
  cream tiles with big coloured letters, round arrow buttons, a wooden tracing
  board, a sound wave by the microphone. Nothing decorative moves behind a game.
- **Result:** full screen, in order: confetti, stars landing, the friend
  cheering, then Next and Play again (Map smaller).
- **Tutorial:** one sentence per page, the friend on a stump, a blue Next pill,
  "Start playing" at the end.
- **Grown-ups:** a full-screen list of cream rows that open in place, with
  switches; little motion.

Not taken from the mock-ups: the Settings rows "Text size" and "Language" (the
app has neither yet), and Back at the bottom-left of the map (`CLAUDE.md` puts
Back top-left everywhere). The mock-ups' painted 3D scenery is drawn in code, so
it is flatter.

### v2.6: closer to the full-screen mock-ups in `../interface/assets/`

Wooden signs with bolts and leaves for every title, the logo on a sign, the
friend's face and counters on a white card, coloured Basic / Intermediate /
Advanced pills with stars, a map path that climbs to the chest on flat
coloured stones, the game header back · sign · home with the friend and a white
bubble, answer cards on coloured edges, square arrow pads round a cream light
bulb, a bolted maze board with leafy hedges, cream caption pills, a Daily
Journey star track, a distant volcano, a waterfall, a lake and leaves in the
foreground. The dino has an orange crest and an open smile, and every friend is
shown at a three-quarter turn.

### v2.7: painted backgrounds

`art/bg-*.jpg` are the seven backgrounds made from
`../interface/DESIGN_PROMPTS.md` Part 3 (originals in
`../interface/assets/background/`): meadow (home, maker, grown-ups), one per
area behind its games (abc, stem, heart, play), the islets (an island's
subjects) and the dirt path (level maps). Subjects are placed on the painted
islets and level stones along the painted path, in percent of the picture
(`ISLETS` in `core/world.js`, `PATH` in `core/levels.js`); if a picture is
replaced, those points must be re-measured. On wide screens the island and map
pictures stand in the middle with a blurred copy behind them. The drawn hills
remain in `index.html` only as a fallback.

### v2.8: painted characters, icons and world

The transparent sheets in `../interface/assets/Icon and characters/` and
`../interface/assets/island_environment/` were cut into single pictures
(`art/char`, `art/ui`, `art/subj`, `art/world`, `art/wear`, WebP with
transparency, about 2.5 MB). Now painted:

- **Friends:** all 11 animals, with the dino's poses (wave, cheer, think, walk,
  explorer) and painted faces for the avatar. Hats, glasses, scarves and things
  to hold are separate painted pictures placed at points measured on each
  animal (`ANCHOR` in `core/art.js`); another colour is a hue shift of the same
  picture. The 3D builder is now only a fallback.
- **Movement:** friends breathe and sway all the time, and every reaction (hop,
  cheer, think, talk) uses squash and stretch with a shadow that shrinks in the
  air (`MOVES` in `core/art.js`).
- **Icons:** round buttons, maze arrow pads, maker category buttons, subject
  icons, stars and locks (`PAINT` in `core/icons.js`; drawn glyphs remain for
  anything without a painting).
- **World:** the four home islands, treasure chests, the house, the tree stump
  and the level stones.

`serve.py` replaces `python3 -m http.server`: the plain server accepts only
five waiting connections, and with many pictures loading at once some were
refused and showed as broken.

### v3.0: second asset batch

From `../interface/assets/icon_characters/` and `../interface/assets/sheets/`
(sliced into `art/char`, `art/ui`, `art/prop`, `art/game`, `art/pic`):

- **Every animal now has eight painted poses** (idle, wave, cheer, think, walk,
  point, sit, explorer). Reactions change pose for all of them, the friend walks
  in the walk pose through the maze and coding board, and every animal wears its
  own explorer outfit on the level map. Accessory points were re-measured on the
  new standing poses (`ANCHOR` in `core/art.js`).
- **Answer cards, memory card backs and fronts, progress beads, next / map /
  trophy / drum buttons** are the painted ones.
- **Island decorations:** books, train and pencil on ABC screens; microscope,
  rocket and telescope on STEM; heart bush, swing and butterfly on Heart;
  xylophone, drum and notes on Play (`PROPS` in `core/app.js`).
- **The next level** shows a painted icon of its kind of game over its stone.
- **Learning pictures:** fruit, the letter-sound pictures and many objects now
  use paintings in place of emoji (`EMOJI` in `core/icons.js`).

The two "WonderF4ur World" sticker sheets in `icon_characters/` were not used:
they are for a birthday, not this app.

### v3.1: game-needs batch and flow

- From `../interface/assets/game-needs/`: 35 dino feelings faces, body parts,
  clothes, 12 animal friends dressed for jobs, kind and unkind choices, washing
  and routine objects, colour balls and tiles, arrows and symbols (`art/pic/`).
  A picture made of several emoji now gets each one painted separately.
- **Game icons:** each game's painted icon sits in its title sign, over every
  open stone on the map, and on a short "ready" card as the game opens. Question
  games use their subject's icon.
- **Flow:** a game started from the Daily Journey goes back to the Journey, not
  to a map; "Play again" and "Next" keep that. The result shows a trophy (3
  stars), medal (2) or thumbs up (1).
- Still emoji: animals, food, nature, places, things and vehicles (153 pictures,
  listed in `../interface/GAME_NEEDS.md`).

### v3.4: a natural recorded voice

The device's robotic text-to-speech is replaced by recordings of a warm,
expressive voice for nearly every line the app says (about 2,150 lines, plus
the story and greeting lines once for each ready-made and suggested name).
They are made on this computer with Chatterbox (`../tools/voice/`), so nothing
is sent anywhere, and paced for three-year-olds: about 140 words a minute,
with a little space between words and even loudness.

- `voice/index.js` maps each line to its clip, and `core/audio.js` plays it.
  A friend with a deep or squeaky voice hears the same clip a little lower or
  higher.
- A line with no recording (a friend named by the child) uses the device's
  voice as before.
- The clips are stored for offline use (`voice/files.js`, `sw.js`).
- To change what the app says, run `../tools/voice/` harvest and gen again;
  see its README.

### v3.3: review fixes

A code review of every engine, core file and content file, plus a headless
bot run of all 192 levels and screenshots at four screen sizes.

- **Fairer stars:** a quick double tap on a wrong card, basket or slot counts
  as one slip, not two; faded wrong bubbles in Pop can no longer be popped;
  following a finger in the maze never walks onto a wrong thing by itself;
  a mishearing in Say It! no longer costs a star.
- **Voice and microphone:** leaving Say It! while recording no longer plays
  the recording back on the next screen (or records after the permission
  question); switching apps mid-listen no longer drops Voice check to Echo;
  a prompt that is cut off no longer plays its letter sound over newer speech.
- **Games:** Match shows every pair before repeating any; every Basic Memory
  level shows the cards first; Build never offers k as a spare for a c word
  (or c for a k word); a second maze hint keeps its full time; a resting palm
  no longer stops tracing or the maze.
- **Progress:** a level that already has stars is never locked (v1 profiles
  and "Open every level" turned off); `soon` levels are stepped over; a
  mastered level replays as a stretch without help; "10 more minutes" always
  gives ten minutes; two open copies of the app no longer erase each other's
  stars; Daily Journey picks rotate by the local day.
- **Navigation:** a late timer no longer pulls the child back to a screen
  they left (picking a friend, Done in the maker, the treasure chest).
- **Content:** spoken grammar ("Where do the socks go?"), British English
  throughout, clearer sorts (fish, drinking glass, leaves), a morning routine
  with one obvious order, science wording (chrysalis, flying in the sky), no
  champagne bottle or knife, "Same feeling" matches face to face, a tapped
  thing in Match says its own name.
- **Offline:** a slow connection no longer holds the app up (the stored copy
  is used after 3.5 s); install retries each file and skips stale browser
  caches; deep links no longer pile up in the cache.
- **Layout:** level stones keep a finger-sized touch on a phone held sideways;
  the friend no longer covers the privacy line in the grown-up area.
  `serve.py --lan` prints the address to open on the phone.

## Look and feel

Taken from the reference images, rebuilt in code so there are still no image
files to ship (apart from the app icon).

| From the reference | In the app |
|---|---|
| Outdoor world: sky, rolling hills, path, trees, bubbles | One inline SVG scene behind every screen plus CSS bubbles and drifting clouds. Colours are CSS variables, so `body[data-scene]` re-tints the whole world per island. |
| Floating islands with props and a label pill (`home_screen.png`) | Home screen. Each island is an SVG drawn in `core/world.js`: letter blocks and a book, a lily pond and volcano, a heart with faces, a hedge maze and card. |
| Level map as one island with a stone path, a gold "you are here" stone and a treasure chest (`game_level.png`) | `Levels.renderMap`. The path snakes from bottom-left up to the chest, the child's friend stands by the next level, and the chest opens when the module is finished. Laid out on a grid and scaled to fit, so it never scrolls; 3 stones per row on a phone, up to 5 on a wide screen. |
| A different ambience per menu level | Home is the open meadow. Each island's game list has its own sky. Each level map sits on its own sea (peach for ABC, lagoon teal for STEM, rose for Heart, blue for Play) with that area's own props. The maker is the meadow out of focus. |
| Character setting: podium, name tag, jelly-bean buttons, tray, big Done (`charcter_setting.png`) | The maker, and the first screen a new child sees. It starts from a plain white bear with only Animal open; the other five beans carry drawn icons (paw, palette, hat, glasses, balloon, speaker). The tray shows each choice as a 3D picture of the child's own friend wearing it. Done is oversized and glows. The ready-made friends are one tap away behind Back. |
| Same frame on every menu (`game_level.png`) | `renderHud` draws one frame for home, an island and a level map: cog top-left (How to play under it at home, Back elsewhere), title with a "where am I" label, and avatar, stars and streak top-right. A blue home button sits bottom-right off the home screen. |
| The guide wears an explorer's cap | On level maps the friend is drawn in an explorer cap, whatever hat they normally wear. The cap is also a choice in the maker. |
| Big character in the middle | The child's own 3D friend. |
| Outlined title, profile tile, star and streak pills | Title reads "Animal Friends"; the profile tile is the friend's face; blue pill = stars, orange pill = day streak. |
| Daily Journey river with three star boxes | The three daily picks. A box turns gold when its game is done, a gold line joins them, and the river fills with more stars each time. |
| Glossy squircle icons, one hue each | `.jelly` in `ui.css` draws the squircle from a single `--h` colour; `core/icons.js` holds 46 glyphs. Subject icons are tone-on-tone; buttons carry a white glyph. Each colour keeps one meaning (blue = back, home and settings, green = hear/yes, yellow = hint and help, pink = microphone, red = close, purple = dice). |
| Ambience | Soft synthesised bird chirps on the map screens, silent inside a game. Switchable under "Nature sounds". |

Not copied from the references: the "Playlearning™" title and the Lingokids
characters in the first mock-up, and the back and home buttons shown on the home
screen itself (there is nowhere to go back to from home). The islands are
vector drawings, flatter than the painted 3D look of the mock-ups.

Emoji are still used for the *pictures a child learns from* (cat, apple, sun)
and inside the grown-up area. They are no longer used for the child's buttons.

---

## File layout

```
index.html              screens and sheets
manifest.webmanifest    install metadata          sw.js   offline cache
start.command / .bat    desktop launchers
vendor/                 three.min.js (MIT), fredoka.woff2 (OFL)
core/
  icons.js      the jelly icon glyphs; fills in any [data-ic] element
  world.js      drawn scenery: home islands, level-map props, treasure chest
  art.js        3D character builder, snapshots, live maker view
  profile.js    character, stars, attempts, results, play time, settings
  audio.js      voice selection, speech, synthesised effects and notes
  speech.js     listening: recogniser, echo recorder, forgiving matching
  fx.js         sparkles, confetti, celebration, touch ripple, glide-to-place
  levels.js     star rules, unlocking, stages, help level, island level map, result sheet
  app.js        router, maker, island home, daily picks, grown-up area, tutorial
  ui.js         shared pieces: frame, pills, sign, logo, stars, stage tabs
  ui.css        tokens and shared component styles
  screens.css   one section per screen
  motion.css    how everything moves: the spring, screen changes, presses, idling
engines/        HOW to play
  base.js       registry, stages, session (auto-cancelled timers), shared frame
  drag.js       pick a thing up and put it somewhere
  quiz.js       choose · order · build · memory
  maze.js       the hedge maze
  touch.js      sort · match · trace · pop
  code.js       first coding: plan the walk, then press Go
  voice.js   media.js (story · song · breathe)
  engines.css
content/        WHAT to teach — plain data
  bank.js       phonics, word bank, question generators, ready-made pairs
  literacy.js   stem.js   life.js   play.js
```

**Rule:** content never contains game code and engines never contain subject
matter. Engines talk only to `core/`.

---

## Adding content

A level is data. To add a vocabulary level:

```js
// content/literacy.js, inside the 'words' module
{ id: 'w9', title: 'Jobs', icon: '👩‍🚒', type: 'choose', rounds: 6,
  gen: AF.Gen.find([{ w: 'doctor', e: '🧑‍⚕️' }, { w: 'farmer', e: '🧑‍🌾' }, { w: 'cook', e: '🧑‍🍳' }], 3) }
```

A whole new subject is one `AF.register({ id, area, title, icon, colour, blurb,
skill, tip, levels: [...] })` in a content file, plus a `<script>` tag and a
line in `sw.js`. No screen code changes.

Level `type` picks the engine. Each engine's header comment documents its
config. Mark a level `soon: true` to show it locked.

**When you change any file, bump `VERSION` in `sw.js`**, or people who already
installed the app keep the old copy.

---

## Design decisions

Carried over from v1: stars count mistakes and never time; no fail state; stars
never go down; one automatically chosen voice; synthesised sound effects;
phonics order rather than alphabet order.

New in v2:

**Real 3D, shown as snapshots.** Characters are built from spheres, cones and
tubes with a matte clay material and studio lighting. A phone will not give one
page a dozen WebGL contexts, so a single hidden renderer draws each character
and pose once and every screen shows the cached image. Only the maker runs a
live, spinnable view. Without WebGL the app falls back to flat badges.

**Tap only.** Research on under-fives and touchscreens finds taps are reliable
from about age 3 while drag-and-drop is not, and recommends targets of 2 cm or
more. Nothing here needs a drag; sorting and ordering are taps; the whole grid
cell around a card is tappable.

**Speech recognition is opt-in and never fails a child.** In Chrome the Web
Speech API sends audio to Google's servers, and general recognisers are
markedly less accurate on young children. So a grown-up chooses the mode behind
a gate, on-device Echo is offered first, matching accepts near misses and
common mishearings, two tries is always enough, and a microphone or network
failure silently drops to the next mode.

**The maze never forces a mistake.** Wrong pickups are placed only in dead
ends. Hints, wall bumps and wandering are free.

**Every timer dies with its level.** Engines schedule through `S.later()`; in
v1 a stray timeout could fire into the next level.

---

## Testing

Deep links jump to any screen:

```
index.html?go=home          ?go=maker         ?go=parents      ?go=tutorial
index.html?go=area:stem     ?go=map:letters   ?go=map:letters:2 (Advanced)   ?go=play:maze:m3
           &friend=4  (use the fifth ready-made friend; only before a friend is made)
```

`?go=parents` and `&speech=check` still show the grown-up sum, so a link can't skip it.

What was checked for this build, in headless Chrome on macOS:

- A bot played all 192 levels twice: as a new child, and with adaptive help
  plus "stretch" on. 192/192 finished each time, no script errors. It taps
  blindly, so this also shows no level can dead-end.
- Simulated finger drags were run through sort, match, order, build, trace and
  the maze's follow-my-finger, including a wrong drop springing back.
- Screens were captured at 390×844 and 1280×720 and reviewed.
- Offline: loaded once, stopped the server, loaded again from the cache.

**How the motion was checked, and was not.** The headless browser does not play
animations that start after its first frame, so the pictures were taken with
every animation moved to its end state. That shows where things land. It does
not show how the springs, drags and screen changes *feel*: that has only been
reasoned about, not watched. The first run on a real phone is the real test.

**Not tested:** a real Android device, real touch input, audible speech output
(including how the bird song actually sounds), the microphone (both voice check and echo), Safari, Firefox, Windows, and the
installed-app flow. Treat those as unverified until tried on hardware.

---

## Known gaps

- **The voice is the device's text-to-speech.** Letter sounds are spelled
  phonetically ("ssss", "tuh") to coax it, which is approximate. Recorded human
  audio for the phonemes is still the biggest single quality upgrade.
- **Learning pictures are still emoji**, so they vary by phone. Every emoji that
  needs Android 10 or later is either painted or was swapped for an older one in v3.3.
- **Songs have a tune but no sung vocal.**
- **One child per device.** No multi-profile, no cloud sync.
- **Tracing has no capital letters** and no letters beyond the 19 taught.
- **Maps open on the right stage but do not animate the walk** from one stone to the next.
- **Not a store app.** It installs as a PWA. A Play Store build needs a wrapper
  (Trusted Web Activity via Bubblewrap, or Capacitor), which needs Node and
  Android Studio; neither is on this machine.
- **Not reviewed for compliance.** Nothing is collected or sent by the app
  itself, but publishing to children would still need a proper privacy review
  (COPPA / GDPR-K), especially around the voice-check option.

---

## Next

1. Try it on a real Android phone and a real four-year-old; fix what they find
2. Record human audio for the 19 letter sounds and the prompts
3. Host on https so Android can install it and use the microphone
4. Multi-child profiles
5. Colouring, jigsaws and a cooking game; video once there is art to show

---

## Sources behind the decisions

- Lingokids structure (daily picks, topics, parent controls): [Google Play listing](https://play.google.com/store/apps/details?id=es.monkimun.lingokids&hl=en_GB&gl=US), [Tech Savvy Mama review](https://techsavvymama.com/2025/12/lingokids-review-effective-playlearning-app.html)
- Phonics order: [Letters and Sounds, Phase 2](https://letters-and-sounds.com/phase-2-introduction/)
- Speech recognition support and privacy: [AssemblyAI on the Web Speech API](https://www.assemblyai.com/blog/speech-recognition-javascript-web-speech-api), [on-device recognition explainer](https://github.com/WebAudio/web-speech-api/blob/main/explainers/on-device-speech-recognition.md)
- Game types (mazes, tracing, matching, memory, puzzle-path coding): [Lingokids on Google Play](https://play.google.com/store/apps/details?id=es.monkimun.lingokids&hl=en_IN&gl=US), [Lingokids Playlearning sections](https://help.lingokids.com/hc/en-us/articles/23532720590610-Playlearning-Sections), [Common Sense Media review](https://www.commonsensemedia.org/app-reviews/lingokids-play-and-learn)
- Drag, sort, shadow-match and trace mechanics for under-fives: [Kids Matching & Sorting Games](https://play.google.com/store/apps/details?id=educational.games.kids.children&hl=en_US), [ABCmouse games](https://www.abcmouse.com/learn/games)
- Touch design for young children: [TIDRC framework](https://init.cise.ufl.edu/wp-content/uploads/sites/378/2019/04/TIDRC-Framework-soni-et-al-IDC19-final.pdf), [NN/g on children's physical development](https://www.nngroup.com/articles/children-ux-physical-development/)
