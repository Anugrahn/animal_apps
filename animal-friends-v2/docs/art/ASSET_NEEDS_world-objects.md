# Asset sheet needed — a leg, and world objects used as learning pictures

## Problem 1 — `leg` is painted as a foot

`art/pic/leg.webp` and `art/pic/foot.webp` are **the same picture**: an orange
foot with three cream toes, at a slightly different angle. So a round whose
answer is "leg" teaches the word with a picture of a foot, and a round that
offered both showed a child two cards they read as identical. That is exactly
what the owner reported ("ada kaki dan kaki juga").

The code now refuses to put the two on screen together
(`AF.Icon.looksLike`, `core/icons.js`), but that is a guard, not a cure — the
word "leg" still needs a leg. When this picture is repainted, delete the
`ALIKE` entry in `core/icons.js`; its comment says so.

| Emoji | Shown for | New file | What it must be |
|---|---|---|---|
| 🦵 | leg | `art/pic/leg.webp` (replace) | ONE leg: thigh, knee and calf down to the ankle, no foot filling the frame. Clearly not the same object as `foot.webp`. |

## Problem 2 — scenery pictures used as learning pictures

`core/icons.js` maps some learning emoji to pictures in `art/world/`. Those
were painted as **scenery for the map**: each one sits on a patch of ground,
and some hold more than one object. Every other learning picture in
`art/pic/` is a single object floating with no ground under it.

So when a game asks for one of these, a child sees the wrong thing. The one
the owner spotted: the word **flower** shows `world/flowers.webp`, which is
two leafy bushes with small blossoms on them — it reads as a bush, not a
flower. `content/bank.js:137` already carries a note about this.

The scenery pictures stay as they are. The map still needs them. What is
missing is a matching single-object picture for each, in `art/pic/`.

## What to make

| Emoji | Shown for | Uses in content | New file | What it must be |
|---|---|---|---|---|
| 🌸 🌼 | flower | 14 | `art/pic/flower.webp` | ONE simple blossom on a short green stem with two leaves — five rounded pink petals, yellow middle. Not a bush, not a bunch, no ground. |
| 🏠 🏡 | house | 18 | `art/pic/house.webp` | ONE small house, front view. No garden, no grass base, no path, no flowers beside it. |
| 🪨 | rock | 7 | `art/pic/rock.webp` | ONE smooth grey stone. No grass tufts, no ground. |
| 🚩 | flag | 2 | `art/pic/flag.webp` | ONE red flag on a wooden pole. No grass mound at the foot. |
| 🌴 | palm tree | 1 | `art/pic/palm.webp` | ONE palm tree. No sand island, no second tree, no rocks. |

Already correct, leave alone: everything in `art/prop/` (kite, globe, rocket,
blocks, butterfly, bulb, drum, rainbow…) — those are single floating objects
and match `art/pic/` style.

## The prompt to paste in ChatGPT

Paste the **Style lock** from `ASSET_PROMPTS.md` first, in a new chat, with
the reference images attached as that file describes. Then paste this:

```
Sheet: world objects and a leg, as single pictures.

6 objects, two rows of 3, in this order:

1. A leg: one bare leg of a cartoon child seen from the side — thigh at the
   top, a rounded knee, calf, down to the ankle, cut off cleanly above the
   foot. Same warm orange skin as the hand and arm pictures you made. It must
   be obviously a LEG, not a foot: no toes, no sole.
2. A flower: one single blossom on a short green stem with two leaves.
   Five rounded petals, soft pink, a yellow middle. One flower only —
   not a bunch, not a bush, nothing growing around it.
3. A house: one small cottage seen from the front, warm cream walls, a red
   roof, a wooden door, two windows. The house alone — no garden, no grass,
   no path, no fence, no flowers.
4. A rock: one smooth grey stone, rounded, the kind a child would call a rock.
   The stone alone — no grass, no moss, no ground.
5. A flag: one red triangular flag on a plain wooden pole. The flag and pole
   alone — no grass, no mound, no base.
6. A palm tree: one palm tree with a curved trunk and green fronds. One tree
   only — no sand, no island, no rocks, no second tree.

Every object floats with nothing underneath it: no ground, no shadow on the
floor, no scenery. Same slight front-top angle for all six, same size.
```

## After the sheet comes back

1. Save the sheet (transparent PNG) somewhere like `~/Downloads/sheets/`.
2. Cut it: `python3 tools/art/cut.py <sheets dir> animal-friends-v2/art/pic`
   — or ask Claude to cut it, which also checks each piece by eye.
3. Point the emoji at the new pictures in `core/icons.js`:
   `'🌸': 'pic/flower', '🌼': 'pic/flower', '🏠': 'pic/house', '🏡': 'pic/house',`
   `'🪨': 'pic/rock', '🚩': 'pic/flag', '🌴': 'pic/palm',`
4. Add the five new files to the precache list in `sw.js`, and bump the
   service-worker version as usual.
5. Check a game that uses each one before calling it done.
