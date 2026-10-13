/* ============================================================
   sw.js — offline support
   ------------------------------------------------------------
   After one visit over http(s) the whole app is stored on the
   device, so it opens with no connection and can be installed
   from the browser menu on Android and on a desktop.

   Bump VERSION whenever any file changes, or returning visitors
   keep the old copy.
   ============================================================ */
const VERSION = 'af-v3.5.2';

const FILES = [
  './', 'index.html', 'manifest.webmanifest', 'icon.svg', 'icon-192.png', 'icon-512.png',
  'vendor/three.min.js', 'vendor/fredoka.woff2',
  'art/bg-meadow.jpg', 'art/bg-abc.jpg', 'art/bg-stem.jpg', 'art/bg-heart.jpg', 'art/bg-play.jpg', 'art/bg-island.jpg', 'art/bg-map.jpg',
  'art/pic/act-brokenheart.webp', 'art/pic/act-clap.webp', 'art/pic/act-crash.webp', 'art/pic/act-flowers.webp', 'art/pic/act-grab.webp', 'art/pic/act-handup.webp', 'art/pic/act-hide.webp', 'art/pic/act-hit.webp', 'art/pic/act-jump.webp', 'art/pic/act-leftout.webp', 'art/pic/act-look.webp', 'art/pic/act-no.webp', 'art/pic/act-please.webp', 'art/pic/act-run.webp', 'art/pic/act-scrub.webp', 'art/pic/act-share.webp', 'art/pic/act-stop.webp', 'art/pic/act-stophand.webp', 'art/pic/act-talk.webp', 'art/pic/act-thanks.webp', 'art/pic/act-thumbsdown.webp', 'art/pic/act-touch.webp', 'art/pic/act-walkaway.webp', 'art/pic/act-wave.webp', 'art/pic/arm.webp', 'art/pic/arrow-down.webp', 'art/pic/arrow-up.webp', 'art/pic/ball-blue.webp', 'art/pic/ball-green.webp', 'art/pic/ball-orange.webp', 'art/pic/ball-purple.webp', 'art/pic/ball-red.webp', 'art/pic/ball-yellow.webp', 'art/pic/bath.webp', 'art/pic/coat.webp', 'art/pic/dress.webp', 'art/pic/ear.webp', 'art/pic/eye.webp', 'art/pic/face-angry.webp', 'art/pic/face-awake.webp', 'art/pic/face-bored.webp', 'art/pic/face-brushing.webp', 'art/pic/face-calm.webp', 'art/pic/face-cold.webp', 'art/pic/face-excited.webp', 'art/pic/face-eyeroll.webp', 'art/pic/face-gentle.webp', 'art/pic/face-happy.webp', 'art/pic/face-hot.webp', 'art/pic/face-huffing.webp', 'art/pic/face-hug.webp', 'art/pic/face-hurt.webp', 'art/pic/face-laugh.webp', 'art/pic/face-leftout.webp', 'art/pic/face-proud.webp', 'art/pic/face-quiet.webp', 'art/pic/face-sad.webp', 'art/pic/face-scared.webp', 'art/pic/face-shh.webp', 'art/pic/face-shy.webp', 'art/pic/face-sick.webp', 'art/pic/face-sleepy.webp', 'art/pic/face-slight.webp', 'art/pic/face-smile-big.webp', 'art/pic/face-sneeze.webp', 'art/pic/face-surprised.webp', 'art/pic/face-teasing.webp', 'art/pic/face-thinking.webp', 'art/pic/face-tongue.webp', 'art/pic/face-wink.webp', 'art/pic/face-worried.webp', 'art/pic/face-yawn.webp', 'art/pic/face-yummy.webp', 'art/pic/face-zip.webp', 'art/pic/foot.webp', 'art/pic/gloves.webp', 'art/pic/hand.webp', 'art/pic/heart-blue.webp', 'art/pic/helmet.webp', 'art/pic/job-artist.webp', 'art/pic/job-astronaut.webp', 'art/pic/job-child.webp', 'art/pic/job-cook.webp', 'art/pic/job-doctor.webp', 'art/pic/job-farmer.webp', 'art/pic/job-firefighter.webp', 'art/pic/job-girl.webp', 'art/pic/job-man.webp', 'art/pic/job-pilot.webp', 'art/pic/job-shophelper.webp', 'art/pic/job-teacher.webp', 'art/pic/leg.webp', 'art/pic/mouth.webp', 'art/pic/question.webp', 'art/pic/recycle.webp', 'art/pic/shower.webp', 'art/pic/sneaker.webp', 'art/pic/soap.webp', 'art/pic/socks.webp', 'art/pic/tap.webp', 'art/pic/tile-green.webp', 'art/pic/tile-orange.webp', 'art/pic/tile-purple.webp', 'art/pic/tongue.webp', 'art/pic/tooth.webp', 'art/pic/toothbrush.webp', 'art/pic/towel.webp', 'art/pic/trousers.webp', 'art/pic/tshirt.webp',
  'art/char/bear-cheer.webp', 'art/char/bear-explorer.webp', 'art/char/bear-idle.webp', 'art/char/bear-point.webp',
  'art/char/bear-sit.webp', 'art/char/bear-think.webp', 'art/char/bear-walk.webp', 'art/char/bear-wave.webp',
  'art/char/cat-cheer.webp', 'art/char/cat-explorer.webp', 'art/char/cat-idle.webp', 'art/char/cat-point.webp',
  'art/char/cat-sit.webp', 'art/char/cat-think.webp', 'art/char/cat-walk.webp', 'art/char/cat-wave.webp',
  'art/char/chick-cheer.webp', 'art/char/chick-explorer.webp', 'art/char/chick-idle.webp',
  'art/char/chick-point.webp', 'art/char/chick-sit.webp', 'art/char/chick-think.webp', 'art/char/chick-walk.webp',
  'art/char/chick-wave.webp', 'art/char/fox-cheer.webp', 'art/char/fox-explorer.webp', 'art/char/fox-idle.webp',
  'art/char/fox-point.webp', 'art/char/fox-sit.webp', 'art/char/fox-think.webp', 'art/char/fox-walk.webp',
  'art/char/fox-wave.webp', 'art/char/frog-cheer.webp', 'art/char/frog-explorer.webp', 'art/char/frog-idle.webp',
  'art/char/frog-point.webp', 'art/char/frog-sit.webp', 'art/char/frog-think.webp', 'art/char/frog-walk.webp',
  'art/char/frog-wave.webp', 'art/char/lion-cheer.webp', 'art/char/lion-explorer.webp', 'art/char/lion-idle.webp',
  'art/char/lion-point.webp', 'art/char/lion-sit.webp', 'art/char/lion-think.webp', 'art/char/lion-walk.webp',
  'art/char/lion-wave.webp', 'art/char/panda-cheer.webp', 'art/char/panda-explorer.webp', 'art/char/panda-idle.webp',
  'art/char/panda-point.webp', 'art/char/panda-sit.webp', 'art/char/panda-think.webp', 'art/char/panda-walk.webp',
  'art/char/panda-wave.webp', 'art/char/penguin-cheer.webp', 'art/char/penguin-explorer.webp',
  'art/char/penguin-idle.webp', 'art/char/penguin-point.webp', 'art/char/penguin-sit.webp',
  'art/char/penguin-think.webp', 'art/char/penguin-walk.webp', 'art/char/penguin-wave.webp',
  'art/char/puppy-cheer.webp', 'art/char/puppy-explorer.webp', 'art/char/puppy-idle.webp',
  'art/char/puppy-point.webp', 'art/char/puppy-sit.webp', 'art/char/puppy-think.webp', 'art/char/puppy-walk.webp',
  'art/char/puppy-wave.webp', 'art/char/rabbit-cheer.webp', 'art/char/rabbit-explorer.webp',
  'art/char/rabbit-idle.webp', 'art/char/rabbit-point.webp', 'art/char/rabbit-sit.webp',
  'art/char/rabbit-think.webp', 'art/char/rabbit-walk.webp', 'art/char/rabbit-wave.webp', 'art/game/code.webp',
  'art/game/coin.webp', 'art/game/match.webp', 'art/game/maze.webp', 'art/game/memory.webp', 'art/game/numbers.webp',
  'art/game/path.webp', 'art/game/pop.webp', 'art/game/puzzle.webp', 'art/game/shapes.webp', 'art/game/song.webp',
  'art/game/sort.webp', 'art/game/speak.webp', 'art/game/story.webp', 'art/game/trace.webp',
  'art/game/treasure.webp', 'art/pic/apple.webp', 'art/pic/apple2.webp', 'art/pic/banana.webp', 'art/pic/bee.webp',
  'art/pic/blueberry.webp', 'art/pic/cat.webp', 'art/pic/cherry.webp', 'art/pic/coconut.webp', 'art/pic/dog.webp',
  'art/pic/dragonfruit.webp', 'art/pic/egg.webp', 'art/pic/fish.webp', 'art/pic/goat.webp', 'art/pic/grapes.webp',
  'art/pic/icecream.webp', 'art/pic/key.webp', 'art/pic/kiwi.webp', 'art/pic/lemon.webp', 'art/pic/lion.webp',
  'art/pic/mango.webp', 'art/pic/moon.webp', 'art/pic/nose.webp', 'art/pic/orange.webp', 'art/pic/peach.webp',
  'art/pic/pear.webp', 'art/pic/pineapple.webp', 'art/pic/rabbit.webp', 'art/pic/strawberry.webp',
  'art/pic/sun.webp', 'art/pic/tophat.webp', 'art/pic/tree.webp', 'art/pic/watermelon.webp',
  'art/prop/abc-blackboard.webp', 'art/prop/abc-blocks.webp', 'art/prop/abc-books.webp', 'art/prop/abc-bus.webp',
  'art/prop/abc-crayons.webp', 'art/prop/abc-lamp.webp', 'art/prop/abc-paint.webp', 'art/prop/abc-pencil.webp',
  'art/prop/abc-scroll.webp', 'art/prop/abc-shelf.webp', 'art/prop/abc-signpost.webp', 'art/prop/abc-train.webp',
  'art/prop/heart-arch.webp', 'art/prop/heart-balloon.webp', 'art/prop/heart-bench.webp',
  'art/prop/heart-birdhouse.webp', 'art/prop/heart-bush.webp', 'art/prop/heart-butterfly.webp',
  'art/prop/heart-can.webp', 'art/prop/heart-kite.webp', 'art/prop/heart-picnic.webp', 'art/prop/heart-pond.webp',
  'art/prop/heart-rainbow.webp', 'art/prop/heart-swing.webp', 'art/prop/play-drum.webp', 'art/prop/play-flag.webp',
  'art/prop/play-guitar.webp', 'art/prop/play-maracas.webp', 'art/prop/play-maze.webp', 'art/prop/play-mic.webp',
  'art/prop/play-note.webp', 'art/prop/play-note2.webp', 'art/prop/play-note3.webp', 'art/prop/play-stage.webp',
  'art/prop/play-tambourine.webp', 'art/prop/play-tile-paw.webp', 'art/prop/play-tile-star.webp',
  'art/prop/play-xylophone.webp', 'art/prop/stem-abacus.webp', 'art/prop/stem-bulb.webp', 'art/prop/stem-gears.webp',
  'art/prop/stem-globe.webp', 'art/prop/stem-magnifier.webp', 'art/prop/stem-microscope.webp',
  'art/prop/stem-pond.webp', 'art/prop/stem-rocket.webp', 'art/prop/stem-ruler.webp', 'art/prop/stem-telescope.webp',
  'art/prop/stem-tubes.webp', 'art/prop/stem-volcano.webp', 'art/ui/card-blue.webp', 'art/ui/card-green.webp',
  'art/ui/card-orange.webp', 'art/ui/card-pink.webp', 'art/ui/card-purple.webp', 'art/ui/card-red.webp',
  'art/ui/card-teal.webp', 'art/ui/card-yellow.webp', 'art/ui/dot-blue.webp', 'art/ui/dot-white.webp',
  'art/ui/heart.webp', 'art/ui/map.webp', 'art/ui/medal.webp', 'art/ui/mem-fish.webp', 'art/ui/mem-flower.webp',
  'art/ui/mem-front-glow.webp', 'art/ui/mem-front-star.webp', 'art/ui/mem-front.webp', 'art/ui/mem-heart.webp',
  'art/ui/mem-leaf.webp', 'art/ui/mem-moon.webp', 'art/ui/mem-paw.webp', 'art/ui/mem-star.webp',
  'art/ui/mem-sun.webp', 'art/ui/next.webp', 'art/ui/sparkle.webp', 'art/ui/speech.webp', 'art/ui/star-btn.webp',
  'art/ui/thought.webp', 'art/ui/thumbs.webp', 'art/ui/trophy.webp',
  'art/world/blocks.webp', 'art/world/pond.webp', 'art/world/volcano.webp', 'art/world/waterfall.webp',
  'art/char/bear-face.webp', 'art/char/bear.webp', 'art/char/cat-face.webp', 'art/char/cat.webp',
  'art/char/chick-face.webp', 'art/char/chick.webp', 'art/char/dino-cheer.webp', 'art/char/dino-explorer.webp',
  'art/char/dino-face-laugh.webp', 'art/char/dino-face-oh.webp', 'art/char/dino-face-smile.webp',
  'art/char/dino-face.webp', 'art/char/dino-idle.webp', 'art/char/dino-point.webp', 'art/char/dino-sit.webp',
  'art/char/dino-think.webp', 'art/char/dino-walk.webp', 'art/char/dino-wave.webp', 'art/char/fox-face.webp',
  'art/char/fox.webp', 'art/char/frog-face.webp', 'art/char/frog.webp', 'art/char/lion-face.webp',
  'art/char/lion.webp', 'art/char/panda-face.webp', 'art/char/panda.webp', 'art/char/penguin-face.webp',
  'art/char/penguin.webp', 'art/char/puppy-face.webp', 'art/char/puppy.webp', 'art/char/rabbit-face.webp',
  'art/char/rabbit.webp', 'art/subj/coding.webp', 'art/subj/feelings.webp', 'art/subj/habits.webp',
  'art/subj/letters.webp', 'art/subj/maze.webp', 'art/subj/memory.webp', 'art/subj/numbers.webp',
  'art/subj/planet.webp', 'art/subj/sayit.webp', 'art/subj/science.webp', 'art/subj/shapes.webp',
  'art/subj/songs.webp', 'art/subj/stories.webp', 'art/subj/treasure.webp', 'art/subj/words.webp',
  'art/ui/back.webp', 'art/ui/basket-land.webp', 'art/ui/basket-sky.webp', 'art/ui/basket-water.webp',
  'art/ui/bubble.webp', 'art/ui/bulb-glow.webp', 'art/ui/card-paw.webp', 'art/ui/card-star.webp',
  'art/ui/check.webp', 'art/ui/clock.webp', 'art/ui/close.webp', 'art/ui/coin.webp', 'art/ui/dice.webp',
  'art/ui/help.webp', 'art/ui/home.webp', 'art/ui/lock.webp', 'art/ui/mic.webp', 'art/ui/pad-down.webp',
  'art/ui/pad-hint.webp', 'art/ui/pad-left.webp', 'art/ui/pad-right.webp', 'art/ui/pad-up.webp', 'art/ui/pause.webp',
  'art/ui/paw.webp', 'art/ui/play.webp', 'art/ui/retry.webp', 'art/ui/settings.webp', 'art/ui/sound.webp',
  'art/ui/star.webp', 'art/ui/stone-blue.webp', 'art/ui/stone-gold.webp', 'art/ui/stone-lock.webp',
  'art/ui/tab-animal.webp', 'art/ui/tab-colour.webp', 'art/ui/tab-hat.webp', 'art/ui/tab-hold.webp',
  'art/ui/tab-voice.webp', 'art/ui/tab-wear.webp', 'art/ui/tray.webp', 'art/ui/unlock.webp', 'art/wear/apple.webp',
  'art/wear/backpack.webp', 'art/wear/balloon.webp', 'art/wear/bandana.webp', 'art/wear/book.webp',
  'art/wear/bow.webp', 'art/wear/bowtie.webp', 'art/wear/cap.webp', 'art/wear/crown.webp', 'art/wear/explorer.webp',
  'art/wear/gamepad.webp', 'art/wear/glasses-blue.webp', 'art/wear/glasses.webp', 'art/wear/heart-glasses.webp',
  'art/wear/heart.webp', 'art/wear/scarf.webp', 'art/wear/sunglasses.webp', 'art/wear/tophat.webp',
  'art/wear/wand.webp', 'art/world/chest-open.webp', 'art/world/chest.webp', 'art/world/flag.webp',
  'art/world/flowers.webp', 'art/world/house.webp', 'art/world/island-life.webp', 'art/world/island-literacy.webp',
  'art/world/island-play.webp', 'art/world/island-stem.webp', 'art/world/palm.webp', 'art/world/rock.webp',
  'art/world/signpost.webp', 'art/world/stump.webp', 'art/world/tree.webp',
  'core/ui.css', 'core/screens.css', 'engines/engines.css', 'core/motion.css',
  'core/icons.js', 'core/world.js', 'core/art.js', 'core/profile.js', 'core/ui.js', 'core/audio.js', 'core/speech.js', 'core/fx.js', 'core/levels.js', 'core/app.js',
  'engines/base.js', 'engines/drag.js', 'engines/quiz.js', 'engines/maze.js', 'engines/touch.js', 'engines/code.js', 'engines/voice.js', 'engines/media.js',
  'content/bank.js', 'content/literacy.js', 'content/stem.js', 'content/life.js', 'content/play.js'
];

/* The recorded voice (made by tools/voice): voice/files.js lists the
   clips to store for offline use. Its list (voice/index.js) is needed
   like any code file; the clips themselves are not (see install). */
try { importScripts('voice/files.js'); } catch (e) { self.VOICE_FILES = []; }
const CLIPS = (self.VOICE_FILES || []).filter(f => f.endsWith('.mp3'));
FILES.push(...(self.VOICE_FILES || []).filter(f => !f.endsWith('.mp3')));

/* One file at a time. Asking for all of them at once can overwhelm a
   small local server (the launcher's) and make the install fail.
   Each file gets three tries, so one dropped request does not cost the
   whole offline copy, and skips the browser's own cache, so a new
   VERSION never stores an old picture. */
async function store(cache, file) {
  for (let i = 0; ; i++) {
    try { return await cache.add(new Request(file, { cache: 'reload' })); }
    catch (err) { if (i >= 2) throw err; await new Promise(r => setTimeout(r, 800 * (i + 1))); }
  }
}

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const cache = await caches.open(VERSION);
    for (const file of FILES) await store(cache, file);
    // A voice clip that won't come down is skipped, so it never costs the
    // whole offline copy: the device's voice says that line, and the clip
    // is stored the first time it plays (see fetch).
    for (const file of CLIPS) await store(cache, file).catch(() => {});
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* Pictures: cache first. Page, code and styles: network first, falling
   back to the stored copy when offline or slow. */
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  // Pictures never change under the same name: straight from the cache.
  // The page, code and styles do change: network first, so an update is
  // never mixed with old files, and the cache when there is no network.
  const page = e.request.mode === 'navigate';
  const code = page || /\.(html|js|css|webmanifest)$/.test(url.pathname) || url.pathname.endsWith('/');
  if (code) {
    // There is only one page, so every ?go=… link is stored as that page.
    const key = page ? 'index.html' : e.request;
    const stored = () => caches.match(key, { ignoreSearch: true });
    e.respondWith((async () => {
      const net = fetch(e.request).then(res => {
        if (res.ok) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(key, copy)); }
        return res;
      });
      net.catch(() => {});                          // (handled below; may lose the race)
      // A weak connection must not keep the child waiting: after a few
      // seconds the stored copy is used (the network still updates it).
      const slow = new Promise(r => setTimeout(r, 3500)).then(stored).then(hit => hit || net);
      try { return await Promise.race([net, slow]); }
      catch (err) { return (await stored()) || Response.error(); }
    })());
    return;
  }
  // A voice line not stored at install (a name line for a suggested
  // name) is stored the first time it plays, for next time offline.
  const keep = url.pathname.includes('/voice/');
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(hit => hit ||
      fetch(e.request).catch(() => fetch(e.request)).then(res => {
        if (keep && res.ok) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(e.request, copy)); }
        return res;
      }).catch(() => Response.error()))
  );
});
