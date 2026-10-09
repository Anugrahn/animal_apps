# Animal Friends — design prompts for ChatGPT

How to use this file:

1. Open a new ChatGPT chat (image generation on).
2. Attach `char.png` and the reference picture named in the screen's section.
3. Paste **Part 1 (Style lock)** once at the start of the chat.
4. Then paste one screen prompt from Part 2 or one asset prompt from Part 3 at a time.
5. Save each result into `interface/screens/` (full mock-ups) or `interface/assets/` (single pieces), using the file name given with the prompt.

Keep one chat per batch of 4–6 images. A long chat starts to drift away from the style.

---

## Part 1 — Style lock (paste first, every new chat)

```
You are designing screens for "Animal Friends", a learning app for children aged 2 to 8,
played on an Android phone held upright. Every image you make in this chat must follow
these rules exactly.

LOOK
- Soft, rounded, toy-like 3D, like clay or vinyl toys under warm studio light.
  Matte surfaces, gentle highlights, soft contact shadows. No hard outlines.
- Bright, friendly, uncluttered. Big shapes, lots of breathing room.
- Outdoor world: blue sky with soft clouds, rolling green hills, a sandy path,
  round trees, floating soap bubbles, a few butterflies.
- Game boards are made of light wood with soft clay pieces on top.

CHARACTER
- The guide is the attached character (char.png): a small round 3D animal friend.
  Keep its proportions, face and colours exactly the same in every image:
  big head, small body, two dot eyes with a white shine, small smile, rosy cheeks.
- It can be one of: dino, bear, rabbit, cat, puppy, panda, fox, lion, frog, penguin, chick.
  Unless told otherwise, use the green dino.
- Show it with clear, friendly poses (waving, pointing, cheering, thinking).

COLOURS (keep these meanings)
- ABC Island orange #F28A2E · STEM Island yellow #F2B618 ·
  Heart Island red #E5535A · Play Island blue #3E9BF0
- Buttons: blue #3DA5F4 = back, home, settings · green #3CCB7F = hear again / yes ·
  yellow #FFC93C = hint and help · pink #FF6FAE = microphone · red #F0565B = close
- Arrows: up blue #3E9BF0, left green #58B368, down red #EE5B5B, right yellow #F5B81C
- Stars and rewards: gold #FFC93C

BUTTONS AND TEXT
- Buttons are glossy rounded squares ("jelly" buttons) with a white symbol,
  a light top-left highlight and a darker bottom edge.
- Font: a rounded, bold, friendly font like Fredoka. Titles are white with a thick
  coloured outline.
- Use ONLY the exact words I give you. Do not invent any other words, labels or numbers.
  If unsure, leave text out.

FRAME
- Portrait phone screen, 2:3 (1024 x 1536). Keep the top 6% and bottom 4% free of
  important things (status bar and gesture bar).
- Same frame on every menu screen: settings cog top-left, the child's friend's face,
  a blue star counter and an orange day-streak pill top-right.
- Buttons at least as big as a fingertip; nothing tiny.

DO NOT
- No brand logos, no real company names, no Lingokids characters.
- No scary or sharp things, no small print, no dark mode.
- No photorealism and no flat vector style — always soft toy 3D.

Reply "Ready" and wait for the first screen.
```

---

## Part 2 — One prompt per screen

Each prompt says which reference picture to attach and what to name the result.

### 1. Character creator (first screen for a new child)
Attach: `char.png`, `charcter_setting.png` · Save as: `screens/01-creator.png`

```
Screen: Character creator. A soft-focus meadow background (blurred hills, warm light).
Centre: the friend, large, standing on a round wooden podium, turning slightly.
Above it: a cream name tag pill that says "Name your friend!" with a purple dice button beside it.
Below: a row of six candy-coloured jelly-bean buttons with a white icon and one word each:
"Animal" (paw, blue), "Colour" (palette, pink), "Hat" (top hat, yellow),
"Wear" (glasses, teal), "Hold" (balloon, red), "Voice" (speaker, purple).
"Animal" is selected (slightly bigger, white ring).
Under it: a cream rounded tray showing 11 small animal friends in a grid
(dino, bear, rabbit, cat, puppy, panda, fox, lion, frog, penguin, chick), one with a gold ring.
Top-left: blue back-arrow button.
Bottom-centre: a big glowing purple button with a green tick and the word "Done".
```

### 2. Home — the island world
Attach: `home_screen.png` · Save as: `screens/02-home.png`

```
Screen: Home. Title "Animal Friends" at the top centre.
The friend stands in the upper middle, waving, with a white speech bubble:
"Hello! Where shall we go?"
Four floating islands, two per row, each a small round island with its own props
and a coloured label pill:
- "ABC Island" (orange): letter blocks A B C and an open book
- "STEM Island" (yellow): a pond with lily pads and a little volcano
- "Heart Island" (red): a big soft heart with smiling faces
- "Play Island" (blue): a little hedge maze and a playing card
Each island has a small white pill with a gold star and "0".
Bottom: a curved blue river full of tiny stars, called "Daily Journey",
with three dark-blue star boxes on it joined by a gold line; the first box glows gold.
Top-left: blue settings cog and a small yellow "?" button under it.
```

### 3. One island — its games
Attach: `home_screen.png` · Save as: `screens/03-island-abc.png`
(Repeat with the other islands; change name, colour and game list.)

```
Screen: inside ABC Island. Warm orange-peach sky, same hills.
Title "Animal Friends" with a small orange pill "ABC Island" under it.
Four big rounded white cards in a 2 x 2 grid, each with a glossy jelly icon,
a name, and a thin progress bar:
"Letters" (Aa icon), "My Words" (speech bubble), "Say It!" (microphone), "Stories" (book).
Cards gently tilted and bobbing, like toys on a shelf.
Top-left: settings cog with a blue back arrow under it. Bottom-right: blue home button.
Other islands:
STEM Island (yellow, lagoon sky): "Numbers", "Shapes", "Discover", "Coding"
Heart Island (red, rose sky): "Feelings", "Healthy Me", "Our Planet"
Play Island (blue sky): "Maze", "Memory", "Songs"
```

### 4. Level map with three stages
Attach: `game_level.png` · Save as: `screens/04-map.png`

```
Screen: level map for "Letters". The island floats on calm orange-peach water.
Under the title, three pill tabs: "Basic" (green, one star, selected),
"Intermediate" (blue, two stars, locked with a padlock),
"Advanced" (purple, three stars, locked).
One green island with a winding pastel stone path from bottom-left to a treasure chest at the top.
Numbered round stones 1 to 7 on the path: 1 and 2 done (orange, gold stars under them),
3 glowing gold and bouncing (the next one), 4 to 7 grey.
The friend wears a tan explorer cap and stands next to stone 3.
Small trees, letter blocks and flowers between the path bends.
Top-left: cog and back arrow. Bottom-right: home button.
```

### 5. Question game (tap the answer)
Save as: `screens/05-choose.png`

```
Screen: a question game. Top bar: blue back arrow, title "Animals", blue home button.
Under it: the small friend with a speech bubble "Find the cat" and a little green speaker icon,
and a row of progress dots on the right.
Below: four large rounded white cards in a 2 x 2 grid, each with a big cute 3D picture:
a cat, a dog, a cow, a duck. Cards have a coloured bottom edge and soft shadow,
as if they are thick toy tiles. The cat card is lifting with a gentle golden glow.
Background: same meadow, slightly softer so the cards stand out.
```

### 6. Memory match
Attach: `maze_n_card.png` · Save as: `screens/06-memory.png`

```
Screen: Memory Match. Top bar: back arrow, title "Memory Match", home button.
The small friend says "Find the pairs!". A cream pill top-right: gold star + "Pairs: 1/4".
A light wooden tray holding 8 thick clay tiles in a 4 x 2 grid.
6 tiles face down: pastel clay (yellow, red, green, purple, blue, orange) with a white paw pressed in.
2 tiles face up and matched, glowing gold at the edges, both showing a white star.
Under the tray: "Match the pairs!"
```

### 7. Maze
Attach: `maze_n_card.png` · Save as: `screens/07-maze.png`

```
Screen: Maze. Top bar: back arrow, title "Forest Fun", home button.
The friend says "Find the house!". A cream pill shows three grey apples, an arrow and a tiny house.
A wooden board with thick, soft, rounded green clay hedges forming a simple maze.
The friend stands at the top-left entrance; a small red-roofed house sits at the bottom-right exit.
Three red apples sit in the corridors.
Under the board: four chunky clay arrow buttons in a cross (up blue, left green,
right yellow, down red) with a glowing yellow light bulb in the middle.
Bottom: "Find the house!"
```

### 8. Sort into baskets
Save as: `screens/08-sort.png`

```
Screen: sorting game "Animal homes". The friend asks "Where does the fish live?".
Centre: a big cream clay tile with a cute 3D fish and the word "fish",
tilted as if a finger is carrying it, with a soft drop shadow.
Bottom: three soft open baskets side by side, each with a picture peeking out and a label:
"Land" (green, a tree), "Water" (blue, a wave), "Sky" (lilac, a cloud).
The "Water" basket is slightly open wider, as if ready to catch the fish.
```

### 9. Match to the shadow
Save as: `screens/09-match.png`

```
Screen: "Shadows". The friend says "Match each animal to its shadow".
Top row: three soft glass-like slots, each holding a dark grey silhouette (lion, duck, elephant).
Bottom row: three cream clay tiles with the colourful animals (duck, elephant, lion), mixed order.
One duck tile is mid-air, flying in a little arc towards the duck shadow, with a sparkle trail.
```

### 10. Trace a letter
Save as: `screens/10-trace.png`

```
Screen: "Trace s a t". The friend says "Trace s" with a speaker icon.
Above the board: a small 3D sun.
A wooden frame holding cream paper. On it, a big lowercase letter "s" drawn as a soft wide
pale path with small dots along the centre.
A green dot with a white star marks the start. Half of the letter is already filled in
with thick, glossy blue ink, ending at a gold pen dot.
A dashed baseline under the letter. Bottom: "Start at the green dot".
```

### 11. Pop the bubbles
Save as: `screens/11-pop.png`

```
Screen: "Pop the number". The friend says "Pop number three".
A tall soft-glass panel full of large shiny soap bubbles floating up, each with a pastel tint
and one big number inside: 3, 5, 3, 2, 3, 4. One "3" bubble is bursting into sparkles.
Top-right of the panel: three star slots, the first one gold.
```

### 12. Coding — plan the walk
Save as: `screens/12-coding.png`

```
Screen: "Star path". The friend says "Get the stars on the way home".
A wooden board with a 4 x 3 grid of soft green clay squares; two grey rocks, one gold star,
the friend in the top-left square and a little red-roofed house in the bottom-right square.
Below: a wooden strip with slots holding a row of small coloured arrow tiles
(right yellow, right yellow, down red) and empty slots, and a big green "Go" button.
Bottom row: clay arrow buttons left green, up blue, down red, right yellow,
a purple undo button, and a glowing yellow light bulb.
```

### 13. Say it (pronunciation)
Save as: `screens/13-sayit.png`

```
Screen: "Say It!". The friend says "Say apple".
A big rounded white card with a shiny 3D apple and the word "apple".
Below: a green speaker button, a large round pink microphone button in the middle
glowing with two soft rings (listening), and a green tick button.
Small pill at the bottom: "Echo - hear yourself".
```

### 14. Story page
Save as: `screens/14-story.png`

```
Screen: a picture book page, "The Little Seed".
A large rounded white page. Top two-thirds: a warm illustration of the friend
planting a seed in soft brown soil, with a watering can.
Bottom: one big line of text: "Pip put the seed in the soil."
Under it: back arrow, green speaker, "2 / 6", and a green "Next" button with a play arrow.
```

### 15. Well done (result)
Save as: `screens/15-result.png`

```
Screen: the end of a level. The game is dimmed behind a big white rounded card.
The friend jumps and cheers at the top of the card.
Title: "Perfect!". Three big gold stars in a row, popping in with sparkles.
Three buttons: "Map" (flag icon), "Again" (circular arrow), and a green "Next" (play arrow).
Confetti in the background.
```

### 16. Grown-ups area
Save as: `screens/16-grownups.png`

```
Screen: "For grown-ups". A calm white sheet over a blurred meadow, red close button top-right.
Four small stat tiles: "12 stars", "8/192 levels", "3 day streak", "14 min today".
A "Progress" list with a coloured bar per subject.
Switches: "Voice & sounds", "Bubbles, confetti & wiggles", "Open every level".
Calmer and more grown-up than the child screens, same rounded font and colours.
```

---

## Part 3 — The pieces to make now (these go straight into the app)

**This is the part to do.** Full-screen mock-ups (Part 2) are only a guide; these
single pieces are what makes the app look like `new_interface/`.

Steps:
1. New ChatGPT chat. Attach `new_interface/main_menu.png` and `new_interface/games.png`.
2. Paste the **Style lock** (Part 1), then add this line:
   `Match the painted look of the attached mock-ups exactly.`
3. Paste the prompts below **one at a time**. Download each image and save it
   with the file name shown, into `interface/assets/`.

For **transparent** pieces, add this line to the prompt:

```
Transparent background (PNG). Only the object, centred, nothing cut off at the edges, no text, no shadow on the ground.
```

For **backgrounds**, add this line instead:

```
Full picture, no transparency, no characters, no buttons, no text. Portrait 1024 x 1536.
```

### Backgrounds (most important)

| Save as | Prompt |
|---|---|
| `bg-meadow.png` | A sunny painted meadow: blue sky with soft clouds, rolling green hills, round leafy trees at both sides, lots of small flowers in the grass, a winding sandy path. Keep the middle of the picture calm and open, because buttons and cards will sit on top |
| `bg-abc.png` | The same meadow at a warm golden morning, peach-orange sky |
| `bg-stem.png` | The same meadow by a turquoise lagoon, light aqua sky |
| `bg-heart.png` | The same meadow with soft pink sky and pink blossoms |
| `bg-play.png` | The same meadow, bright blue sky, a few kites in the distance |
| `bg-island.png` | Looking down at a calm blue lake with small grassy islets joined by a sandy path, trees and flowers on the shore. Leave the islets empty |
| `bg-map.png` | Looking down at a green meadow with a winding light-brown dirt path that snakes from the top to the bottom in three loops, small trees and flowers beside it. Nothing on the path |

### Islands and objects (transparent)

| Save as | Prompt |
|---|---|
| `island-abc.png` | A small floating round island seen from slightly above, grass top, rocky earth underside, with big toy letter blocks A B C and an open book on it |
| `island-stem.png` | Same island style, a little pond with lily pads and a tiny friendly volcano |
| `island-heart.png` | Same island style, a big soft red heart with two little smiling faces |
| `island-play.png` | Same island style, a tiny green hedge maze and a small red flag |
| `stump.png` | A short round tree stump with light rings on top, for a character to stand on |
| `chest-closed.png` | A cute wooden treasure chest with gold trim, closed |
| `chest-open.png` | The same chest, open, gold stars and coins spilling out |
| `house.png` | A tiny cosy house with a red-orange roof, cream walls and blue windows |

### Interface pieces (transparent, no text)

| Save as | Prompt |
|---|---|
| `sign.png` | An empty wooden sign board, wide and short, rounded ends, light wood with darker edges. No text. 1536 x 512 |
| `bar.png` | An empty long wooden plank button, rounded ends. No text. 1536 x 384 |
| `stone-gold.png` | A round gold coin-like level button, seen from the front, thick and shiny. No number. 512 x 512 |
| `stone-blue.png` | The same round button in light blue with a gold rim, glowing. No number |
| `stone-grey.png` | The same round button in soft grey with a small padlock at the bottom. No number |
| `tile.png` | A square cream clay tile with rounded corners and a thick lighter bottom edge, empty. 512 x 512 |

That is 21 pictures. Start with the five backgrounds and `bg-map.png`: those
change the look of the most screens.

---

## Part 4 — Tips for good results

- **Same character every time:** always attach `char.png` and say "the same character as the attached image". If it changes, reply "Keep the character exactly as in char.png" and regenerate.
- **Text comes out wrong:** don't fix it in ChatGPT. I re-draw all text in code anyway; the picture only needs the layout, shapes and colours.
- **One change at a time:** "Make the buttons bigger" works better than five changes at once.
- **Too busy:** reply "Simpler: fewer props, more empty space".
- **When a screen looks right, keep it.** Put it in `interface/screens/` and tell me which number it is.

---

## What happens next

Bring the images back into this folder and tell me which ones you like. For each:

- **Full screens** (`screens/`): I rebuild the screen in the app's code to match: layout, colours, sizes, motion. The result stays sharp at every screen size, works offline and keeps all the game logic.
- **Single pieces** (`assets/`): I drop them into the app as images, for example replacing the drawn islands, the chest or the house with the painted versions. They need to be on a transparent background, and I keep the total size small so the app stays quick to load.
