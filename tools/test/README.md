# Test tools

Headless checks for Animal Friends, run on this computer with the app served
(`cd animal-friends-v2 && python3 serve.py 8765`). They use the Playwright that
`tools/voice` installs (`node_modules` here links to `../voice/node_modules`).

| Script | What it does |
|---|---|
| `node validate.mjs phonics math english bahasa` | Checks a subject's data: every question has its answer among its options, no duplicate options, every traced letter has strokes, every step has an engine, no speaking step in Indonesian, and lists emoji without a painting. |
| `node play.mjs phonics math [--workers 8] [--only m3-5,m4-6]` | Plays every level of the subjects to its result screen, like a child tapping everything (it traces with the keyboard and taps the arrows in a maze). Prints levels that never finish and any page error. No subject named: all of them. |
| `node today.mjs` | Today's Study on a Monday, Tuesday, a Wednesday with yesterday's lessons left over, a Saturday (review) and a Sunday, with a fake clock. |
| `node migrate.mjs` | Loads a first-curriculum profile (Letters, Numbers, Stories stars) and checks the stars move to `legacyStars` once and the total stays the same. |
| `node offline.mjs` | Lets the service worker store the app, goes offline, and opens lessons of every core subject from the cache. |
| `node shots.mjs 390x844 out home=go:home map=go:map:math:2` | Screenshots of deep links at a screen size (`name=go:<link>[@ms]`). |
