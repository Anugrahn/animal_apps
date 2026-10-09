# Animal Friends — Phase 0

Foundation build. The goal of this phase was not new games; it was to make the
fourth and fifth game cheap to add.

Open `index.html` directly in a browser. No build step, no server, no installs.

---

## What is in this build

### Working
- **Character picker** — Rex (dino), Mochi (bear), Pip (rabbit)
- **Home** — module tiles built from a registry, star counter
- **Level map** — winding path, locks, 3-star marks, auto-scrolls to the next level
- **Letters** — one playable module, 5 levels of letter-sound matching
- **Result sheet** — stars land one at a time
- **Grown-up sheet** — sound, motion, change friend, start over
- **Progress saves** to `localStorage` and survives a reload

### Placeholder tiles (shown on purpose, not hidden)
- **Numbers** — Phase 2
- **Maze / Animals / Snack** — exist in v1, not yet ported to the new structure

---

## File layout

```
index.html
manifest.webmanifest
icon.svg
core/
  art.js        character SVGs + reactions
  profile.js    character, stars, attempts, settings
  audio.js      voice selection, speech, synthesised sound effects
  fx.js         sparkles, confetti, celebration
  levels.js     star rules, unlocking, level map, result sheet
  app.js        screen router + boot
  ui.css        tokens, base, shared components
  screens.css   layout for pick / home / map / play
modules/
  registry.js   module registration
  letters/      letters.js + letters.css
```

**Rule:** modules only ever talk to `core/`, never to each other, and never to
the router. Adding a module means one `AF.register({...})` call.

---

## The module contract

```js
AF.register({
  id: 'numbers',
  title: 'Numbers',
  icon: '🔢',
  colour: '#36D6B5',
  blurb: 'Count & add',
  levels: [ { id:'l1', title:'Count to 5', icon:'5' }, ... ],

  play(host, level, api) { /* render one level into host */ },
  stop() { /* clear timers and listeners */ }
});
```

`api` gives the module everything it needs and nothing more:

| Field | What it does |
|---|---|
| `api.character` | `'dino' \| 'bear' \| 'rabbit'` |
| `api.help` | `0` none · `1` dim wrong answers · `2` also replay the prompt |
| `api.say(text)` | speak in the chosen character's voice |
| `api.finish(mistakes)` | report the result; the app awards the stars |
| `api.exit()` | bail out to the level map |

A level marked `soon: true` renders as a locked tile and is skipped by the
unlock logic.

---

## Decisions already baked in

**Stars count mistakes, never time.** 0 mistakes → 3 stars, 1–2 → 2 stars,
3+ → 1 star. There is no countdown anywhere in the app, and finishing always
earns at least one star. Time pressure is what builds maths anxiety in young
children, so it is simply absent.

**No dead ends.** After two wrong taps on the same question the wrong cards
fade out, so the child can always move forward. A child who gets stuck quits.

**Difficulty bends to the child, not to an age setting.** Every retry is
counted. After 2 attempts the game dims a wrong answer; after 4 it also replays
the prompt automatically. This is why the build never asks how old the child is.

**Stars never go down.** A worse replay cannot take away what was already
earned.

**One voice, chosen automatically.** `audio.js` scores every English voice the
device offers and keeps the best one. Local voices beat network voices so the
app keeps talking offline; "compact" and novelty voices are pushed to the
bottom. There is no male/female picker — one clear voice, as requested.

**Sound effects are synthesised, not downloaded.** WebAudio oscillators, so
there are no asset files and everything works from `file://`. The "wrong"
sound is deliberately soft and low — a child should hear *not that one*, not
*you failed*.

**Letters start at s a t p i n, not A B C.** Those six letters already build
real words — sat, pin, tap, nap, sit — so the child reads something true in
the first week instead of reciting the alphabet for six months.

**Fake 3D, not a 3D engine.** Every character uses the same recipe: a radial
gradient lit from the upper-left, a gloss highlight, a rim light on the lower
right, and a cast shadow that shrinks when the character jumps. That last one
does most of the work. Total cost: no libraries, no model files.

---

## Known gaps

- **Fredoka loads from Google Fonts**, so the first run needs a connection.
  The CSS falls back to Baloo 2 → Arial Rounded → system rounded, which looks
  fine, but self-hosting the font file is the right fix before this goes fully
  offline.
- **Emoji are the device's**, so tiles look slightly different across phones.
  Swapping them for drawn SVG icons is a later polish pass.
- **Speech quality varies by device.** Check which voice was picked in the
  grown-up sheet. Recording a real human voice is still the biggest single
  upgrade available, and the one most worth doing.
- No service worker yet, so it is not installable offline as a PWA.

---

## Next

1. Port Maze, Animals and Snack into `modules/`, swapping Pip for the chosen character
2. Build the Numbers module — concrete → pictorial → symbolic
3. Add the remaining Letters levels: Build a word, Trace it, Listen & copy
4. Self-host the font, add a service worker
