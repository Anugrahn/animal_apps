# Test tools

Headless checks for Animal Friends, run on this computer with the app served
(`cd animal-friends-v2 && python3 serve.py 8765`). They use the Playwright that
`tools/voice` installs (`node_modules` here links to `../voice/node_modules`).

| Script | What it does |
|---|---|
| `node validate.mjs phonics math english bahasa` | Checks a subject's data: every question has its answer among its options, no duplicate options, no two cards a child would read as the same picture, every traced letter has strokes, every step has an engine, no speaking step in Indonesian, and lists emoji without a painting. It plays each generator for 200 rounds **the way the engine does** — `ctx.last` is the answer it has just given — so a word list that empties out once a filter bites shows up as a throw or a line that says "undefined". It also fails: a card (or an intro card) with nothing on it; a question whose own picture is handed back as the answer card, so the child matches pictures instead of thinking (a game that means to do that says `same: true` on the round); a pool smaller than the rounds asked of it (the game stops early); two pairs that put the same card on one memory or match board; a sort basket nothing ever goes in; and the right card sitting in the same seat round after round, which teaches a child to tap card one and stop listening. It ends with two counts to watch: the pictures with no painting, and the English lines with no recording in `voice/` (the friend drops to the device's robot voice for those, mid-lesson). |
| `node play.mjs phonics math [--workers 8] [--only m3-5,m4-6]` | Plays every level of the subjects to its result screen, like a child tapping everything (it traces with the keyboard and taps the arrows in a maze). Prints levels that never finish and any page error. No subject named: all of them. |
| `node chime.mjs` | Asks a letter-sound question in the choose, pop and trace games and answers it part way through the letter. Fails if the "right" or "win" chime rings while the friend is still talking, or if stopping a line steps straight to silence (a click). |
| `node today.mjs` | Today's Study on a Monday, Tuesday, a Wednesday with yesterday's lessons left over, a Saturday (review) and a Sunday, with a fake clock. |
| `node migrate.mjs` | Loads a first-curriculum profile (Letters, Numbers, Stories stars) and checks the stars move to `legacyStars` once and the total stays the same. |
| `node trace.mjs [out-dir]` | Traces like a child: watches the demo, tries to jump to the end of a stroke (must not count), lifts the finger half-way and carries on, writes a 3-stroke m and a Bahasa word with a fast, wobbly finger. Saves screenshots to `out-dir` if given. |
| `node offline.mjs` | Lets the service worker store the app, goes offline, and opens lessons of every core subject from the cache. |
| `node count.mjs [--only m5-6] [--out dir]` | Opens every Math question and learning card that has things to count, at 390×844, 844×390, 1024×768 and 360×640, and lists any whose things are cut off; prints how big a thing is next to an answer card. |
| `sh steps.sh <out-dir> 844x390` | Screenshots of one step of every kind of game (choose, sort, order, memory, intro, trace, build, match, story, pop, maze) at a screen size. |
| `node shots.mjs 390x844 out home=go:home map=go:map:math:2` | Screenshots of deep links at a screen size (`name=go:<link>[@ms]`). |
