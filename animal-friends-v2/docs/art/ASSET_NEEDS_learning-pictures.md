# Asset sheets needed — 30 learning pictures that are still raw emoji

Companion to `ASSET_NEEDS_world-objects.md`. Same style lock, same way of
working.

## The problem

Every learning picture in the app is a painted 3D clay object
(`art/pic/*.webp`), mapped from an emoji in `core/icons.js`. When an emoji
has no entry there, the browser falls back to the **device's own flat
emoji** — a different drawing on every phone, flat where everything beside
it is glossy and round. Four-year-olds notice: the cards stop looking like
one set.

Measured on 2026-10-27 by walking `content/*.js`, pulling every emoji
sequence (ZWJ joins, variation selectors, keycaps and flags included),
looking each one up in the `EMOJI` map in `core/icons.js` and checking the
`.webp` exists:

| | |
|---|---|
| distinct glyphs used in `content/*.js` | 377 |
| with no painting | 43 |
| of those, never shown to a child (a level's or subject's `icon:`, which only the grown-up area prints as text) | 13 |
| of those, a false alarm (`🎂` only ever appears inside the painted pair pictures `🎉🎂` and `🎈🎂`) | 1 |
| **learning pictures a child actually sees as a flat system emoji** | **30** |

Four more were fixed in content instead of being painted, because the thing
on the card was never an object in the first place: the picture-graph dot
(`⬤`, 6 uses — not painted and not in the app's own font, so it came from
whatever fallback the device had, at a size that matched nothing beside
it), the zig-zag line, the two raised hands for "ten fingers" and the
bar-chart card. See `content/math.js`.

**There is no honest stand-in for any of the 30 in `art/` today.** Every
near-match is a different word that is already taught with that painting —
a van would have to borrow the bus, a kerbau the cow, a boot the shoe, a
fork the plate — and a round that offered both words would then show the
same picture twice, which is exactly the bug `Icon.looksLike` exists to
stop. So nothing was pointed at a wrong picture; they all need painting.

One near-match was looked at and left alone: `art/wear/bowtie.webp` is a
clean single bow tie and nothing else uses it, so `👔` *could* point at it
today. But a bow tie is a *dasi kupu-kupu*, not the necktie the word
teaches. One line in `core/icons.js` (`'👔': 'wear/bowtie'`) if you would
rather have a painting than wait for the sheet.

## The Indonesian alphabet, letter by letter

`content/bahasa.js` teaches each letter with one word and one picture
(`ABC`). Audited 2026-10-27 against two questions: **is the word one a
four-year-old already says**, and **does the picture exist and read
clearly**?

| | Word | Picture | Verdict |
|---|---|---|---|
| a | apel | `pic/apple` | fine |
| b | bola | `pic/football` | fine |
| c | ceri | `pic/cherry` | word is a bit foreign — cherries are not an everyday fruit in Indonesia. `celana` 👖 (`pic/trousers`, already painted) is a word every child says. Owner's call; not changed. |
| d | domba | `pic/sheep` | fine |
| e | elang | `pic/eagle` | fine |
| f | foto | `pic/framed-picture` | **fine** — the painting does exist (a framed picture) and reads as "foto". |
| g | gajah | `pic/elephant` | fine |
| h | hidung | `pic/nose` | fine |
| i | ikan | `pic/fish` | fine |
| j | jeruk | `pic/orange` | fine |
| k | kucing | `pic/cat` | fine |
| l | lampu | `prop/stem-bulb` | fine |
| m | mobil | `pic/car` | fine |
| n | nanas | `pic/pineapple` | fine |
| o | ~~ombak~~ → **obat** | `pic/medicine-pill` | **fixed.** "Ombak" is an idea, not a thing a child can point at, and `pic/water-wave.webp` is a splash of blue that reads as "air". `obat` is a word every Indonesian child says, the picture is a clear red-and-white capsule, and `bahasa.js` already teaches `obat` in Tahap 3, so the two reinforce each other. |
| p | pisang | `pic/banana` | fine |
| q | — | — | taught as a shape only; no everyday Indonesian q word |
| r | rumah | `world/house` | the picture is **scenery** — a house on a patch of grass with flowers. Already on the list in `ASSET_NEEDS_world-objects.md`. |
| s | sapi | `pic/cow` | fine |
| t | topi | `pic/tophat` | a magician's top hat. It is a hat, so it is not wrong, but an Indonesian child pictures a cap. `wear/cap.webp` (🧢) is already painted and would read better. Owner's call; not changed, because the word also appears in Tahap 2 and 4 and all of them should move together. |
| u | ular | `pic/snake` | fine |
| v | vas | **none** | no painting — see Sheet 3. "Vas" is also marginal for a four-year-old; there is no better Indonesian v word with art (`vitamin` would share the pill with `obat`). |
| w | wortel | `pic/carrot` | fine |
| x | — | — | taught as a shape only |
| y | ya | `ui/thumbs` | "ya" is a yes, not a thing. Indonesian ABC charts usually use **yoyo**, which would need a painting. Owner's call. |
| z | zebra | **none** | no painting — see Sheet 1. The word itself is the right one (every Indonesian ABC chart uses it). |

## Sheet 1 — animals

| Emoji | Taught as | Uses | New file | What it must be |
|---|---|---|---|---|
| 🐊 | buaya (crocodile) | 11 | `art/pic/crocodile.webp` | ONE friendly crocodile, side on, green, a long snout with small blunt teeth, not scary. It carries the whole Si Kancil story (`content/bahasa.js`, `bi4-5`). |
| 🐃 | kerbau (water buffalo) | 2 | `art/pic/water-buffalo.webp` | ONE grey water buffalo with wide swept-back horns. Must not read as the cow in `pic/cow.webp` — "sapi" is a different word in the same lesson. |
| 🐯 | harimau (tiger) | 1 | `art/pic/tiger.webp` | ONE orange tiger with black stripes, front view. Clearly not `pic/lion.webp` — "singa" is taught in the same tahap. |
| 🦓 | zebra | 2 | `art/pic/zebra.webp` | ONE zebra, black and white stripes, side on. Teaches the letter z in both Bahasa Indonesia and English phonics. |
| 🦟 | nyamuk (mosquito) | 1 | `art/pic/mosquito.webp` | ONE mosquito, wings out, friendly not creepy. Bigger and thinner-legged than `pic/ant.webp`. |
| 🦀 | crab (phonics, cr blend) | 1 | `art/pic/crab.webp` | ONE red crab, front view, two claws up. |

## Sheet 2 — people and what they wear

| Emoji | Taught as | Uses | New file | What it must be |
|---|---|---|---|---|
| 👩 | ibu (a mum) | 5 | `art/pic/woman.webp` | ONE grown-up woman from the chest up, warm and friendly, the same style as `pic/job-man.webp` and `pic/job-child.webp` — she stands beside them in "Siapa yang memasak?" and must look like the same family of pictures, just a mum. |
| 👶 | bayi (baby) | 1 | `art/pic/baby.webp` | ONE baby, round cheeks, one tuft of hair. Obviously smaller/younger than `pic/job-child.webp`. |
| 🤠 | koboi (cowboy) | 2 | `art/pic/cowboy.webp` | ONE child in a wide brown cowboy hat and neckerchief, from the chest up. |
| 👸 | queen (phonics, letter q) | 2 | `art/pic/queen.webp` | ONE queen from the chest up with a gold crown. Not just a crown — `wear/crown.webp` already teaches the word "crown". |
| 👔 | dasi (necktie) | 1 | `art/pic/necktie.webp` | ONE necktie on its own, knotted, striped. No shirt around it (the shirt is `pic/tshirt.webp`). |
| 👢 | boot (phonics, long oo) | 1 | `art/pic/boot.webp` | ONE tall rubber boot, side on. Clearly not `pic/sneaker.webp` — "shoe" is taught in the same step. |

## Sheet 3 — things around the house

| Emoji | Taught as | Uses | New file | What it must be |
|---|---|---|---|---|
| 🏺 | vas (vase) | 1 | `art/pic/vase.webp` | ONE empty vase, round body, narrow neck. No flowers in it (a flower is its own picture). Teaches the letter v. |
| 🍅 | tomat (tomato) | 1 | `art/pic/tomato.webp` | ONE red tomato with a small green stalk on top. Must not read as `pic/apple.webp`: squatter, with the star-shaped green calyx. |
| 🌶️ | cabai (chilli) | 1 | `art/pic/chilli.webp` | ONE red chilli, curved, with a green stalk. |
| 🍴 | fork (phonics, "or") | 3 | `art/pic/fork.webp` | ONE fork on its own. `pic/plate-with-knife-and-fork.webp` is a plate with cutlery either side — a child reads it as "plate". |
| 🔌 | plug (phonics, pl blend) | 1 | `art/pic/plug.webp` | ONE electric plug with a short cable tail. |
| 🧶 | knit / a ball of wool | 1 | `art/pic/wool.webp` | ONE ball of wool with two knitting needles through it. |

## Sheet 4 — out in the world

| Emoji | Taught as | Uses | New file | What it must be |
|---|---|---|---|---|
| 🚐 | van (phonics, letter v) | 2 | `art/pic/van.webp` | ONE small van, side on, boxy. Clearly not `pic/bus.webp` (shorter, no row of windows) — "bus" is a word in the same step. |
| 🚢 | ship (phonics, sh) | 2 | `art/pic/ship.webp` | ONE big ship with a funnel, side on. Not `pic/sailing-boat.webp` — "boat" is its own word. |
| 🕸️ | web (phonics, letter w) | 2 | `art/pic/web.webp` | ONE spider's web, round, a few threads, no spider. |
| 🥜 | nut (phonics, short u) | 1 | `art/pic/peanut.webp` | TWO peanuts in their shell, the classic peanut shape. Not `pic/seed.webp` — "seed" is taught in the same step. |
| 🐚 | shell (phonics, sh) | 1 | `art/pic/shell.webp` | ONE spiral sea shell, pink and cream. |
| 🪶 | feather (maths, heavy and light) | 1 | `art/pic/feather.webp` | ONE light feather, soft and curved. It sits next to the elephant on the "heavy and light" card. |

## Sheet 5 — two actions

| Emoji | Taught as | Uses | New file | What it must be |
|---|---|---|---|---|
| ✍️ | write (phonics, silent w) | 1 | `art/pic/act-write.webp` | ONE hand holding a pencil, writing — same hand style as `pic/act-wave.webp` and the other `act-` pictures. |
| 🧗 | climb (phonics, silent b) | 1 | `art/pic/act-climb.webp` | ONE child climbing, both hands up on holds, seen from the side. |

## Still to decide — the four numerals

`content/phonics.js` teaches four number words with the device's keycap
emoji, which look nothing like the rest:

| Glyph | Word | Where |
|---|---|---|
| 🔟 | ten | `phonics.js:78` (short e: bed, net, leg, web, ten) |
| 3️⃣ | three | `phonics.js:169` (th digraph) |
| 5️⃣ 9️⃣ | five, nine | `phonics.js:83` (long i) |

Two honest ways out, owner's call:

1. **Paint four numeral tiles** — `art/pic/num-3.webp`, `num-5.webp`,
   `num-9.webp`, `num-10.webp`: a chunky clay numeral, one colour each, the
   same size as the other pictures.
2. **Teach a different word.** `ten` → `hen` (🐔, `pic/hen.webp`, already
   painted, and a better short-e word than a number). `five` → `dice` (🎲,
   `ui/dice.webp`, already painted, same long-i spelling pattern). `three`
   has no replacement — it is one of only two th words a four-year-old
   knows — so it would still want a numeral.

   Changing an English word also changes the line the friend says, and
   every English line is a **recording** in `voice/` — a changed line falls
   back to the device's robot voice until `tools/voice` records it again.
   So option 2 is a content change plus a voice run, not a one-liner.

## The prompt to paste in ChatGPT

Paste the **Style lock** from `ASSET_PROMPTS.md` first, in a new chat, with
the reference images attached as that file describes. Then paste one sheet
at a time.

```
Sheet: animals.

6 objects, two rows of 3, in this order:

1. A crocodile: one friendly cartoon crocodile seen from the side, soft
   green, long snout, small blunt white teeth, a gentle eye. Not scary.
2. A water buffalo: one grey buffalo seen from the side, wide horns that
   sweep back, a calm face. Heavier and darker than a cow.
3. A tiger: one orange tiger with black stripes and a cream muzzle, seen
   from the front, friendly.
4. A zebra: one zebra seen from the side, white with black stripes, a short
   dark mane.
5. A mosquito: one cartoon mosquito, thin legs, two clear wings, friendly.
6. A crab: one red crab seen from the front, two claws raised, small eyes
   on stalks.

Every object floats with nothing underneath it: no ground, no shadow on the
floor, no scenery. Same slight front-top angle for all six, same size.
```

```
Sheet: people and what they wear.

6 objects, two rows of 3, in this order:

1. A mum: one friendly grown-up woman from the chest up, warm skin, dark
   hair tied back, a simple top. Same cartoon style as the doctor and
   teacher figures you made.
2. A baby: one baby from the chest up, big round cheeks, one tuft of hair,
   smiling.
3. A cowboy: one child from the chest up in a wide brown cowboy hat and a
   red neckerchief.
4. A queen: one woman from the chest up wearing a gold crown with jewels,
   smiling kindly.
5. A necktie: one striped necktie on its own, knotted at the top. No shirt,
   no collar.
6. A rubber boot: one tall boot seen from the side, bright colour, the kind
   a child wears in the rain.

Every object floats with nothing underneath it: no ground, no shadow on the
floor, no scenery. Same slight front-top angle for all six, same size.
```

```
Sheet: things around the house.

6 objects, two rows of 3, in this order:

1. A vase: one empty vase, round body, narrow neck, soft blue. Nothing in
   it.
2. A tomato: one red tomato, a little squat, with a small green star-shaped
   stalk on top.
3. A chilli: one red chilli, gently curved, with a green stalk.
4. A fork: one fork on its own, four tines, a chunky handle. Nothing else
   beside it, no plate.
5. An electric plug: one plug with three pins and a short cable tail.
6. A ball of wool: one round ball of soft yarn with two knitting needles
   pushed through it.

Every object floats with nothing underneath it: no ground, no shadow on the
floor, no scenery. Same slight front-top angle for all six, same size.
```

```
Sheet: out in the world.

6 objects, two rows of 3, in this order:

1. A van: one small delivery van seen from the side, boxy, one window at
   the front, sliding door. Shorter than a bus, no row of windows.
2. A ship: one big ship seen from the side, a tall funnel, portholes along
   the hull. Not a sailing boat, no sails.
3. A spider's web: one round spider's web, a few threads, nothing in it, no
   spider.
4. Peanuts: two peanuts in their wrinkled shell, the classic figure-eight
   shape.
5. A sea shell: one spiral sea shell, pink and cream.
6. A feather: one soft feather, gently curved, pale with a darker quill.

Every object floats with nothing underneath it: no ground, no shadow on the
floor, no scenery. Same slight front-top angle for all six, same size.
```

```
Sheet: two actions.

2 objects, side by side, in this order:

1. A writing hand: one child's hand holding a pencil, writing. Same hand
   style, same warm orange skin as the waving and clapping hands you made.
2. A child climbing: one child seen from the side climbing a wall, both
   hands up on holds, one knee bent.

Every object floats with nothing underneath it: no ground, no shadow on the
floor, no scenery. Same slight front-top angle, same size.
```

## After the sheets come back

1. Save each sheet (transparent PNG) in `interface/assets/sheets/`.
2. Cut it: `python3 tools/art/cut.py <sheets dir> animal-friends-v2/art/pic`
   — or ask Claude to cut it, which also checks each piece by eye.
3. Point the emoji at the new pictures in `core/icons.js`:
   ```js
   '🐊': 'pic/crocodile', '🐃': 'pic/water-buffalo', '🐯': 'pic/tiger', '🦓': 'pic/zebra',
   '🦟': 'pic/mosquito', '🦀': 'pic/crab', '👩': 'pic/woman', '👶': 'pic/baby',
   '🤠': 'pic/cowboy', '👸': 'pic/queen', '👔': 'pic/necktie', '👢': 'pic/boot',
   '🏺': 'pic/vase', '🍅': 'pic/tomato', '🌶️': 'pic/chilli', '🍴': 'pic/fork',
   '🔌': 'pic/plug', '🧶': 'pic/wool', '🚐': 'pic/van', '🚢': 'pic/ship',
   '🕸️': 'pic/web', '🥜': 'pic/peanut', '🐚': 'pic/shell', '🪶': 'pic/feather',
   '✍️': 'pic/act-write', '🧗': 'pic/act-climb',
   ```
4. Add the new files to the precache list in `sw.js` and bump the
   service-worker version as usual.
5. `node tools/test/validate.mjs phonics english bahasa math science coding
   feelings habits planet maze memory songs stories` — the `emoji: … not
   painted:` line should shrink by one for every picture cut in. It read
   **30 not painted** when this file was written.
