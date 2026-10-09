# Animal Friends — asset sheets to make in ChatGPT

This file lists every picture still missing from the games, island by island, as
**sheets**: one image with many separate objects on a transparent background. I
cut each sheet into single pictures and put them into the app, the same way as
the character and icon sheets you already made.

Make them in this order:

1. **Part 2: character poses**. These make every friend move like the dino does now.
2. **Part 3: ABC Island**, **Part 4: STEM Island**, **Part 5: Heart Island**.
3. **Part 6: Play Island** (memory cards, maze kit, music).
4. **Part 7: shared game pieces**.
5. **Part 8: story pages** (optional, the most work).

---

## Part 1 — How to make a sheet

### Every new ChatGPT chat

1. Attach `new_interface/games.png` and `assets/Icon and characters/` sheet 2 (the
   eleven animals), so the style matches.
2. Paste the **Style lock** below once.
3. Then paste one sheet prompt at a time.

### Style lock (paste first)

```
You are making game art for "Animal Friends", a learning app for children aged 2 to 8.
Match the attached images exactly: soft rounded 3D clay / vinyl-toy style, matte with
gentle highlights, bright friendly colours, thick chunky shapes, no hard outlines,
warm soft light from the top left.

Every image in this chat is a SHEET of separate objects:
- Transparent background (PNG). Not white, not a checkerboard.
- Objects arranged in a neat grid, in the order I list them, left to right, top to bottom.
- Lots of empty space between objects (at least 60 px). No object touches another.
- Each object complete, centred in its own cell, nothing cut off.
- No text, no letters or numbers unless I ask for them, no labels, no watermark.
- No ground shadow and no background scenery under the objects.
- All objects on one sheet roughly the same size and seen from the same slight
  front-top angle.
- Landscape 1536 x 1024.
Reply "Ready".
```

### Saving

- Put each sheet in `interface/assets/sheets/` and name it with the sheet name given
  (for example `abc-letters.png`).
- If an object comes out wrong, ask ChatGPT to redo just that sheet. A sheet with
  missing or extra objects is fine: tell me what is missing.
- Check the background is really transparent: drop the file on a dark background
  (Preview → View → Show Image Background). White or a checkerboard won't work.

---

## Part 2 — Character poses (do these first)

Right now only the dino changes pose (wave, cheer, think, walk). The other ten
animals have one picture, so they can only hop. **One sheet per animal** gives each
of them the same moves.

Attach the animal from sheet 2 and say "the same character as the attached, exactly".

**Sheet `pose-<animal>.png`**, with `<animal>` = bear, rabbit, cat, puppy, panda,
fox, lion, frog, penguin, chick (10 sheets):

```
The same <animal> character as the attached image, exactly the same face, colours and
proportions, in 8 poses, full body, facing the viewer at a slight angle:
1 standing happy  2 waving one hand  3 cheering, both arms up, eyes closed, big smile
4 thinking, finger on chin  5 walking, one foot forward  6 sitting
7 pointing to the side  8 wearing a tan explorer hat with a paw badge and a small
brown backpack
```

Also one sheet of **faces**, `faces.png`, for the feelings games and the avatar:

```
The same green dino as the attached, head only, 12 faces in a 4 x 3 grid:
happy, sad, angry, scared, surprised, sleepy, proud, shy, worried, excited, bored, calm.
Each feeling very clear for a small child.
```

---

## Part 3 — ABC Island (Letters · My Words · Say It! · Stories)

### `abc-letters.png` — the letter-sound pictures (19)
```
sun, red apple, tree, pink pig, ladybird, a cute nose, crescent moon, puppy dog,
goat, purple octopus, cat, golden key, egg, umbrella, rabbit, top hat, bee, fish, lion
```

### `abc-blocks.png` — letter blocks (26)
```
26 chunky toy letter blocks, one lowercase letter each, a to z in order, every block a
different bright colour with a white rounded letter on the front. Letters must be
correct and readable.
```

### `words-animals.png` (14)
```
cat, dog, cow, pig, duck, fish, bird, horse, sheep, frog, lion, monkey, elephant, bee
— all as cute baby animals in the same style as the attached animals
```

### `words-food.png` (12)
```
apple, banana, bread loaf, glass of milk, egg, carrot, cheese wedge, bunch of grapes,
orange, bowl of rice, slice of cake, slice of pizza
```

### `words-home.png` (12)
```
bed, chair, door, book, ball, alarm clock, key, sneaker, top hat, t-shirt, sock, lamp
```

### `words-go.png` (8)
```
car, bus, train, sailing boat, aeroplane, bicycle, rocket, truck
```

### `words-nature.png` (8)
```
sun, moon, star, tree, flower, rain cloud, white cloud, campfire
```

### `words-body.png` (8)
```
eye, ear, nose, mouth, hand, foot, tooth, leg — friendly and cute, not realistic
```

### `words-clothes-toys.png` (16)
```
shirt, dress, coat, shoe, sock, cap, glove, scarf,
ball, kite, teddy bear, drum, robot, balloon, jigsaw piece, building blocks
```

### `words-people.png` (8)
```
Animal characters in the same style dressed as: doctor, farmer, cook, teacher,
firefighter, pilot, astronaut, artist
```

### `sayit-kit.png` (8)
```
a big glowing pink microphone on a little stand, a sound wave made of colourful bars,
a speech bubble, a megaphone, an ear with sound waves, a big green tick badge,
a gold star badge, a smiling mouth
```

### `abc-island-props.png` (12) — the ambience on ABC screens and maps
```
stack of books, pencil, crayons in a cup, alphabet train with three carriages,
wooden signpost, small bookshelf, reading lamp, scroll, paint pot, little blackboard,
toy letter bus, pile of letter blocks
```

---

## Part 4 — STEM Island (Numbers · Shapes · Discover · Coding)

### `stem-numbers.png` (11)
```
11 chunky toy number blocks, 0 1 2 3 4 5 6 7 8 9 10, each a different bright colour
with a big white number on the front. Numbers must be correct.
```

### `stem-count.png` (8) — things to count
```
red apple, gold star, yellow duck, football, blue fish, pink flower, red toy car, bee
— small and simple, so many can stand in a row
```

### `stem-shapes.png` (10)
```
clay shapes, each a different colour: circle, square, triangle, rectangle, star, heart,
oval, diamond, pentagon, hexagon
```

### `stem-discover-1.png` (16) — animals and nature
```
whale, octopus, dolphin, eagle, butterfly, caterpillar, owl, bat, rooster, hen, chick
hatching from an egg, egg, seed, sprout, small plant, sunflower
```

### `stem-discover-2.png` (16) — things and weather
```
rock, leaf, anchor, coin, spoon, log, rubber duck, toy boat, ice cube, snowman,
ice cream, bowl of hot soup, volcano, rainbow, umbrella, wool scarf
```

### `stem-space-seasons.png` (12)
```
sun, crescent moon, planet earth, saturn, rocket, astronaut, telescope,
spring blossom tree, summer beach umbrella, autumn tree with orange leaves,
winter snowy tree, watering can
```

### `stem-coding.png` (10) — the coding board
```
square grass tile (seen from above), square sandy path tile, grey boulder,
small bush, start flag, gold star token, little robot, four arrow tiles: up, down,
left, right (green, red, yellow, blue)
```

### `stem-island-props.png` (12) — ambience
```
microscope, test tubes in a rack, magnifying glass, telescope, globe, little volcano,
lily pond, toy rocket, gears, light bulb, abacus, ruler and set square
```

---

## Part 5 — Heart Island (Feelings · Healthy Me · Our Planet)

### `heart-feelings.png` (12) — kind and unkind choices
```
two hands shaking, a hug, a gift box, a waving hand, a heart, a helping hand lifting
a friend, two friends sharing a cookie, a bandage, a sad broken toy, a crossed arms
"grab" gesture, a calm breathing cloud, a cup of warm cocoa
```

### `heart-routine-1.png` (12) — washing and teeth
```
water drop, bar of soap with bubbles, two soapy hands, shower head, towel, tissue box,
toothbrush with toothpaste, toothpaste tube, glass of water, big clean smile,
sneezing into a tissue, rubbish bin
```

### `heart-routine-2.png` (12) — my day
```
sunrise, alarm clock, t-shirt and shorts, bowl of cereal, school backpack, bath tub
with bubbles, story book, moon and stars, bed with pillow, shoes, hairbrush, lunchbox
```

### `heart-food.png` (16) — every day or sometimes
```
apple, carrot, banana, glass of milk, egg, broccoli, water glass, bowl of rice,
corn, cucumber, juice box, cake, candy, doughnut, ice cream, fries
```

### `heart-safety.png` (8)
```
traffic light, seat belt, bike helmet, hot frying pan, medicine bottle, swimming ring,
shop helper with name badge, crossing stripes
```

### `planet-bins.png` (4) — and four matching items sheet
```
four recycling bins with a symbol on the front (no words): blue bin with paper symbol,
yellow bin with bottle symbol, green bin with leaf symbol, teal bin with jar symbol
```

### `planet-rubbish.png` (14)
```
newspaper, cardboard box, envelope, sheet of paper, plastic bottle, plastic cup,
plastic bag, banana peel, apple core, egg shell, autumn leaves, glass jar,
glass bottle, drinking glass
```

### `planet-wild.png` (12)
```
penguin, polar bear, camel, scorpion (cute), monkey, owl, fox, whale, shark (friendly),
sea turtle, panda, giraffe
```

### `planet-homes.png` (6) — the baskets for "where does it live?"
```
six woven baskets with a little scene inside each: forest trees, blue sea waves,
ice and snow, desert sand with a cactus, green land with flowers, sky with clouds
```

### `heart-island-props.png` (12) — ambience
```
heart-shaped bush, flower arch, bench, watering can, bird house, butterfly, rainbow,
hot air balloon, picnic blanket, kite, swing, little pond
```

---

## Part 6 — Play Island (Maze · Memory · Songs)

### `memory-backs.png` (8) — card backs
```
8 square clay game cards with rounded corners and a thick lighter bottom edge, seen
from the front, each a different colour (yellow, red, green, purple, blue, orange, pink,
teal), with a different white symbol pressed in: paw, star, heart, moon, flower, leaf,
fish, sun
```

### `memory-front.png` (3) — card fronts
```
1 a blank cream clay card, same shape as above, empty
2 the same card with a soft gold glowing edge (a matched card)
3 the same card with a small gold star in the top corner
```

### `maze-kit.png` (16)
```
red apple, gold star, carrot, golden key, blue gem, banana, sock, cake slice,
candy, crescent moon, cloud, little flame, small house with red roof, finish flag,
round grass bush, flower patch
— small and simple, seen from slightly above, for a maze board
```

### `maze-floors.png` (5) — the maze themes
```
5 square seamless floor tiles, seen straight from above, no objects:
forest grass and dirt, beach sand, candy pink, snowy white, night blue with tiny stars
```

### `maze-hedges.png` (5)
```
5 short straight pieces of hedge wall, seen from slightly above, the same size:
green leafy hedge with white flowers, sandy coral wall, pink candy wall,
icy blue snow wall, purple night bushes with tiny lights
```

### `songs-kit.png` (12)
```
red drum, xylophone, maracas, tambourine, little trumpet, guitar, piano keys,
music notes (three), a small stage with curtains, microphone, headphones, sun singing
```

---

## Part 7 — Shared game pieces

### `game-ui.png` (16)
```
round map button, round pause button, round next button (green arrow), round star
button, big green thumbs up, gold trophy, medal with ribbon, confetti burst,
sparkle burst, heart badge, speech bubble (empty), thought bubble (empty),
progress dot blue, progress dot white, small padlock, open padlock
```

### `game-cards.png` (8)
```
8 empty square cream answer cards with rounded corners and a thick coloured bottom
edge: yellow, blue, green, pink, orange, purple, red, teal edge
```

### `game-baskets.png` (6)
```
six empty woven baskets, each with a coloured ribbon: green, blue, red, yellow,
purple, orange
```

---

## Part 8 — Story pages (optional)

Each page is a full picture, **not** a sheet: portrait 1024 x 1024, a painted scene
with **no text**, the dino as the hero (attach `c1` dino sheet). Save as
`story-<n>-<page>.png` in `interface/assets/stories/`.

| Story | Pages |
|---|---|
| 1 The Little Seed | dino finds a tiny seed · plants it in soil · rain falls on a sprout · sun shines, plant grows · a big yellow sunflower · dino happy with a bee |
| 2 Splash! | dino meets a duck · duck jumps in a pond · dino jumps in too · they blow bubbles · sun dries them |
| 3 The First Day | dino with a backpack at school · dino nervous · dino takes a slow breath · a chick says hello · they play ball · dino happy with a new friend |
| 4 The Sharing Tree | a tree with one red apple · squirrel, bird and rabbit hungry · dino thinking · cutting the apple · everyone eating · planting the seeds · friends together |
| 5 Trip to the Moon | dino looks at the moon · builds a cardboard rocket · blast off · flying past stars · on the moon with a flag · earth far away |
| 6 The Lost Kitten | rainy afternoon · kitten under a box · dino wraps it in a scarf · walking to find its home · house with a dog · house with hens · a crying girl · kitten in her arms · rainbow walk home |

---

## What I do with them

When sheets are in `interface/assets/sheets/`, tell me which ones. For each I:

- cut it into single pictures and convert them to small WebP files;
- put them in place of the emoji or drawn pieces in the matching game;
- give every animal its pose set so it reacts the way the dino does;
- check it loads offline and on a phone-size screen, and that every level still plays.
