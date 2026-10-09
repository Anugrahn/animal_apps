# How to play Animal Friends

A guide for the grown-up setting it up and for playing alongside your child.
Ages 3–7. Sessions of 10–15 minutes work best.

---

## 1. Start the app

### On a desktop or laptop

**Mac:** double-click `start.command`. A Terminal window opens (leave it open)
and the game appears in its own window. The first time, macOS may refuse to run
it: right-click the file, choose **Open**, then **Open** again.

**Windows:** double-click `start.bat`. It needs Python 3 from python.org.

**No launcher:** double-click `index.html`. It plays in any modern browser, but
the microphone will ask permission more often and it cannot be installed.

**Install it as a real desktop app (optional).** With the launcher running, open
`http://localhost:8765` in Chrome or Edge, click the install icon at the right
of the address bar, and choose **Install**. Animal Friends gets its own icon and
window. After that first visit it is stored on the computer and opens without
the launcher and without the internet.

### On an Android phone or tablet

Android will only install an app, or allow the microphone, from a secure
(`https://`) address. So there are two routes:

| You want | Do this |
|---|---|
| **A quick look, today** | On the computer run `python3 -m http.server 8766 --bind 0.0.0.0` inside the `animal-friends-v2` folder. On the phone (same Wi-Fi, or with the computer on the phone's hotspot) open `http://YOUR-COMPUTER-IP:8766` in Chrome. Everything plays except installing, offline use and the microphone. |
| **Everything, over a USB cable** | Turn on USB debugging on the phone, plug it in, run `start.command`, then in Chrome on the computer open `chrome://inspect/#devices` → Port forwarding → `8765` to `localhost:8765`. On the phone open `http://localhost:8765`. Installing, offline and the microphone all work. |
| **The real thing** | Upload the `animal-friends-v2` folder to any free static host that gives an `https://` address (Netlify Drop, GitHub Pages, Cloudflare Pages). Open that address in Chrome on the phone, tap **⋮ → Add to Home screen → Install**. It then opens full-screen like any app and works offline. |

Turn the volume up. The game talks.

---

## 2. Make a friend

The very first screen is the **character creator**. A plain white bear stands on
a round stand, turning slowly, waiting to be made into your child's own friend.
There is no right answer here; let them try everything.

Six jelly-bean buttons sit beside the friend. **Animal** is open to begin with.
Tap a bean, then tap a choice in the cream tray:

| Bean | What it changes |
|---|---|
| 🐾 Animal | Dino, bear, rabbit, cat, puppy, panda, fox, lion, frog, penguin, chick |
| 🎨 Colour | Sixteen colours. A pink dinosaur is fine. |
| 🎩 Hat | Party hat, crown, cap, top hat, bow, flower, explorer cap |
| 👓 Wear | Glasses, scarf, bow tie |
| 🎈 Hold | Heart, star, carrot, ball, flower, balloon, or a wave |
| 🗣️ Voice | Deep, middle or squeaky |

The tray shows each choice on your own friend, so a child can pick a hat by its
picture. Drag the friend to spin it round. Type a name in the tag at the top, or
tap the purple dice for a suggestion. Tap the big glowing **Done** at the bottom.

In a hurry? The blue back arrow (top left) opens eleven ready-made friends to
pick from instead. The friend then appears everywhere: in every game, in the maze, and
as the hero of the stories.

You can change friend later in the grown-up area → **Change friend**, which
reopens the creator with your friend in it. Stars are kept.

---

## 3. The home screen

Home is an outdoor world: hills, trees, drifting bubbles and, now and then, a
bird.

- **Your friend** stands in the middle. Tap for a cheer.
- **Top right:** your friend's face, a blue pill showing stars earned, and an
  orange pill showing days played in a row.
- **Four floating islands**, one per part of the curriculum. Tap an island to
  see its games:

| Island | Games |
|---|---|
| 🟠 ABC Island (Words & Letters) | Letters · My Words · Say It! · Stories |
| 🟡 STEM Island (Numbers & Science) | Numbers · Shapes · Discover · Coding |
| 🔴 Heart Island (Me & My World) | Feelings · Healthy Me · Our Planet |
| 🔵 Play Island (Play Time) | Maze · Memory · Songs |

- **Daily Journey** (the wooden bar at the bottom): tap it to see the three
  games picked for today, each from a different island. If you only have ten
  minutes, play these. Each one gets a green tick when it is finished, and
  finishing all three opens the treasure chest and earns a celebration.
- **Top left:** the **blue cog** is for grown-ups. The **yellow ?** replays the
  how-to-play walkthrough. The island with the **bouncing arrow** is the one to
  try next.

The frame around the screen stays the same everywhere: top left is the blue cog
on the home screen and a **blue back arrow** everywhere else; top right is your
friend's face, stars and day streak; a **wooden sign** in the middle says where
you are; and off the home screen a **blue house** in the bottom right corner
goes straight home.

**Inside an island** its games stand on little islets along a sandy path, from
the house at the start. Your friend waits by the one to play next. Each game
shows up to three stars, one for each stage finished, and a treasure chest once
all three are done.

**Tap a game to open its level map**, a meadow with a dirt path:

- Each round stone is a level. The **big blue stone with a gold rim** is the
  next one, and your friend stands beside it in an explorer's cap. When you come
  back from a level, your friend walks on to the next stone.
- Finished stones turn gold and show their stars. Grey stones with a padlock are
  still locked; a level unlocks as soon as the one before it has *any* star.
- The **treasure chest** at the end of the path opens when every level on that
  map has a star.

**Three stages.** Above the map are three tabs: **Basic**, **Intermediate** and
**Advanced**. Each stage has its own path and treasure chest. Finish a stage and
tap its open chest, or the next tab, to move on. A tab with a padlock is not
open yet. Later stages have bigger boards, more choices and longer levels.

### The buttons

Every button is a coloured "jelly" square, and each colour always means the
same thing:

| Button | Does |
|---|---|
| Blue arrow | Go back one step |
| Blue house | Go home to the islands |
| Blue speaker (in the cream bar at the top of a game) | Say it again |
| Yellow light bulb | Show me the way (maze) or the next arrow (coding) |
| Pink microphone | Say the word now |
| Green tick | Yes / I said it / done |
| Red cross | Close |

---

## 4. How each kind of game works

In every game your friend asks out loud. **Tap the speech bubble to hear it
again**, as often as you like. The blue arrow goes back to the map, the blue
house goes home.

| Game | What your child does |
|---|---|
| **Tap the answer** (most games) | Listen, then tap the right card. A wrong tap makes a soft sound and the card wobbles; nothing is lost. After two wrong taps the wrong cards fade so the right one is easy to find. |
| **Sorting** (Animal homes, Good food, Sort it, Tidy up…) | A picture appears. **Pick it up and carry it** to the basket it belongs in, or just tap the basket. A wrong basket shakes and the picture comes back. |
| **Matching** (Shadows, Number & stars, Who eats what?…) | Carry each picture at the bottom up to its partner at the top. Or tap the picture, then tap the partner. |
| **Put in order** (Wash hands, How it grows, In order…) | Tap the cards in the order they happen and they glide up into the numbered places. Or carry a card straight to its place. |
| **Build a word** (Letters) | Tap or carry the letters, in order, into the glowing space. Each letter says its sound, then the whole word is blended. |
| **Tracing** (Trace s a t, Trace 1 2 3, Draw lines, Write a word) | Put a finger on the **green dot** and follow the dotted line. A little dot runs along first to show the way. The ink only goes forward along the line, so it cannot be done wrong. On a keyboard, Space draws it. |
| **Bubbles** (Pop the sound, Pop the number…) | Pop the bubbles that carry the answer: three for each question. There is no hurry; they keep floating up. |
| **Coding** | Tap the coloured arrows to line up a plan, then press green **Go** and watch your friend follow it. If the plan bumps into a rock, your friend comes back and you mend the plan: the purple button takes the last arrow away, tapping an arrow in the plan cuts the plan back to there. The light bulb shows which arrow to tap next. |
| **Say It!** | Tap the green speaker to hear the word, then tap the big pink microphone and say it. See "Speaking practice" below. |
| **Stories** | Listen to each page, tap **Next**. Tap any single word to hear just that word. Easy questions come at the end. |
| **Maze** | Get your friend to the little house. Tap a coloured arrow to take **one step**, or hold it down to keep walking. You can also **hold a finger on the board and lead your friend along**, swipe, or use the arrow keys. An arrow pressed while your friend is still moving is taken at the very next square, so corners are one smooth move. Later mazes ask you to collect things first: only the right ones, and sometimes in order (1, 2, 3, or c-a-t). The glowing light bulb shows the way and costs nothing. |
| **Memory** | Tap two clay cards in the wooden tray. If they match they hop and stay face up. Each card says its word. The first levels show you every card for a moment before they turn over. |
| **Songs** | The tune plays and the words light up. Sing along and tap the drum. Tap **Done** when finished. |
| **Calm breathing** (Feelings) | Breathe in as the circle grows, out as it shrinks. |

### Stars

| Mistakes in a level | Stars |
|---|---|
| None | ⭐⭐⭐ |
| One or two | ⭐⭐ |
| Three or more | ⭐ |

There is no timer anywhere and no way to fail. Stars never go down: a worse
replay cannot take away stars already earned.

The game also adjusts quietly. If a level takes several tries, it starts fading
a wrong answer and repeating the question on its own. Once a level has three
stars, playing it again adds a little more challenge.

---

## 5. Speaking practice (Say It!)

The first time your child opens **Say It!** the game stops and asks *you* how it
should listen:

| Choice | What happens | Privacy |
|---|---|---|
| **Echo** | Records for about two seconds, plays your child's voice back, then the model voice. Your child taps the green tick when happy. | Nothing leaves the device. Nothing is saved. |
| **Voice check** | The browser listens and decides whether the word was said. | In Chrome the audio is sent to Google to be recognised. Needs internet. |
| **No microphone** | Listen, say it out loud, tap the green tick. | No microphone used. |

Voice check is the most game-like, but speech recognisers are noticeably less
accurate with young children than with adults. That is why the game accepts
near misses, and after two tries says "Good try!" and moves on. If your child is
getting "try again" on words they are clearly saying well, switch to Echo.

Allow the microphone when the browser asks. If you tap Block by mistake, the
game carries on in "No microphone" mode; re-allow it from the padlock icon in
the address bar.

---

## 6. The grown-up area (the blue cog)

Tap the blue cog on the home screen and answer the multiplication question. Inside:

- **Progress:** stars, levels finished, day streak, minutes played today, and a
  bar for each subject.
- **Worth another go:** levels that took three or more tries.
- **Try at home:** one screen-free idea linked to what was played last. A
  similar tip appears the first time each level is finished.
- **Settings:** voice and sounds, nature sounds (the bird song), bubbles,
  confetti and wiggles (turn off for a calmer screen), **open every level** (so
  an older child can start at Intermediate or Advanced), speaking practice mode, and a
  **daily play limit** (15, 30 or 45 minutes). When time is up the game says
  "Time for a break!" at the next level; you can add ten minutes from that
  screen.
- **How to play**, **Change friend**, and **Start over** (erases everything;
  tap twice to confirm).

Everything is stored on the device only. There are no accounts, ads or tracking.

---

## 7. A good first session

1. Let your child choose or build the friend. Do not rush this part; it is
   what makes them care.
2. Sit through the eight-slide walkthrough together.
3. Play the **Daily Journey**: three short games.
4. Let them pick one more of their own. The **Maze** is the usual favourite.
5. Stop while it is still fun, and try the "Try at home" idea later in the day.

---

## 8. If something is not working

| Problem | Fix |
|---|---|
| No voice | Check the volume and the grown-up area → Voice & sounds. Tap the screen once (phones stay silent until the first tap). The grown-up area shows which voice the device is using; if it says none, install an English text-to-speech voice in the device settings. |
| The voice sounds robotic | It is the device's built-in voice. Chrome on desktop and recent Android phones usually sound best. |
| Friends are flat coloured circles | The device does not support 3D graphics. The game still works. |
| The microphone does nothing | The microphone was blocked, or the page is not on `https://` or `localhost`. Use "No microphone" mode meanwhile. |
| "Install" does not appear | Installing needs `https://` or `localhost`, in Chrome or Edge. |
| Progress vanished | Progress lives in that browser on that device. Private windows and "clear browsing data" erase it. |
