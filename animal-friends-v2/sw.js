/* ============================================================
   sw.js — offline support
   ------------------------------------------------------------
   After one visit over http(s) the whole app is stored on the
   device, so it opens with no connection and can be installed
   from the browser menu on Android and on a desktop.

   Bump VERSION whenever any file changes, or returning visitors
   keep the old copy.
   ============================================================ */
const VERSION = 'af-naura-1.6.0';

const FILES = [
  './', 'index.html', 'privacy.html', 'manifest.webmanifest', 'icon.svg', 'icon-192.png', 'icon-512.png',
  'vendor/three.min.js', 'vendor/fredoka.woff2',
  'art/bg-meadow.jpg', 'art/bg-abc.jpg', 'art/bg-stem.jpg', 'art/bg-heart.jpg', 'art/bg-play.jpg', 'art/bg-island.jpg', 'art/bg-map.jpg',
  'art/char/bear-idle.webp', 'art/char/fox-idle.webp', 'art/char/frog-idle.webp', 'art/char/penguin-idle.webp', 'art/char/chick-idle.webp', 'art/char/panda-idle.webp', 'art/char/dino-idle.webp',
  'art/char/pinkfong-idle.webp', 'art/char/pinkfong-face.webp', 'art/char/hogi-idle.webp', 'art/char/hogi-face.webp', 'art/char/jeni-idle.webp', 'art/char/jeni-face.webp', 'art/char/poki-idle.webp', 'art/char/poki-face.webp',
  'art/party/party-logo.webp', 'art/party/party-banner.webp', 'art/party/party-cake.webp', 'art/party/party-gift.webp', 'art/party/party-star.webp', 'art/party/party-wand.webp', 'art/party/party-thanks.webp', 'art/party/party-treats.webp',
  'art/pic/act-brokenheart.webp', 'art/pic/act-clap.webp', 'art/pic/act-crash.webp', 'art/pic/act-flowers.webp', 'art/pic/act-grab.webp', 'art/pic/act-handup.webp', 'art/pic/act-hide.webp', 'art/pic/act-hit.webp', 'art/pic/act-jump.webp', 'art/pic/act-leftout.webp', 'art/pic/act-look.webp', 'art/pic/act-no.webp', 'art/pic/act-please.webp', 'art/pic/act-run.webp', 'art/pic/act-scrub.webp', 'art/pic/act-share.webp', 'art/pic/act-stop.webp', 'art/pic/act-stophand.webp', 'art/pic/act-talk.webp', 'art/pic/act-thanks.webp', 'art/pic/act-thumbsdown.webp', 'art/pic/act-touch.webp', 'art/pic/act-walkaway.webp', 'art/pic/act-wave.webp', 'art/pic/arm.webp', 'art/pic/arrow-down.webp', 'art/pic/arrow-up.webp', 'art/pic/ball-blue.webp', 'art/pic/ball-green.webp', 'art/pic/ball-orange.webp', 'art/pic/ball-purple.webp', 'art/pic/ball-red.webp', 'art/pic/ball-yellow.webp', 'art/pic/bath.webp', 'art/pic/coat.webp', 'art/pic/dress.webp', 'art/pic/ear.webp', 'art/pic/eye.webp', 'art/pic/face-angry.webp', 'art/pic/face-awake.webp', 'art/pic/face-bored.webp', 'art/pic/face-brushing.webp', 'art/pic/face-calm.webp', 'art/pic/face-cold.webp', 'art/pic/face-excited.webp', 'art/pic/face-eyeroll.webp', 'art/pic/face-gentle.webp', 'art/pic/face-happy.webp', 'art/pic/face-hot.webp', 'art/pic/face-huffing.webp', 'art/pic/face-hug.webp', 'art/pic/face-hurt.webp', 'art/pic/face-laugh.webp', 'art/pic/face-leftout.webp', 'art/pic/face-proud.webp', 'art/pic/face-quiet.webp', 'art/pic/face-sad.webp', 'art/pic/face-scared.webp', 'art/pic/face-shh.webp', 'art/pic/face-shy.webp', 'art/pic/face-sick.webp', 'art/pic/face-sleepy.webp', 'art/pic/face-slight.webp', 'art/pic/face-smile-big.webp', 'art/pic/face-sneeze.webp', 'art/pic/face-surprised.webp', 'art/pic/face-teasing.webp', 'art/pic/face-thinking.webp', 'art/pic/face-tongue.webp', 'art/pic/face-wink.webp', 'art/pic/face-worried.webp', 'art/pic/face-yawn.webp', 'art/pic/face-yummy.webp', 'art/pic/face-zip.webp', 'art/pic/foot.webp', 'art/pic/gloves.webp', 'art/pic/hand.webp', 'art/pic/heart-blue.webp', 'art/pic/helmet.webp', 'art/pic/job-artist.webp', 'art/pic/job-astronaut.webp', 'art/pic/job-child.webp', 'art/pic/job-cook.webp', 'art/pic/job-doctor.webp', 'art/pic/job-farmer.webp', 'art/pic/job-firefighter.webp', 'art/pic/job-girl.webp', 'art/pic/job-man.webp', 'art/pic/job-pilot.webp', 'art/pic/job-shophelper.webp', 'art/pic/job-teacher.webp', 'art/pic/leg.webp', 'art/pic/mouth.webp', 'art/pic/question.webp', 'art/pic/recycle.webp', 'art/pic/shower.webp', 'art/pic/sneaker.webp', 'art/pic/soap.webp', 'art/pic/socks.webp', 'art/pic/tap.webp', 'art/pic/tile-green.webp', 'art/pic/tile-orange.webp', 'art/pic/tile-purple.webp', 'art/pic/tongue.webp', 'art/pic/tooth.webp', 'art/pic/toothbrush.webp', 'art/pic/towel.webp', 'art/pic/trousers.webp', 'art/pic/tshirt.webp',
  'art/pic/rabbit-running.webp', 'art/pic/snake.webp', 'art/pic/sheep.webp', 'art/pic/rooster.webp', 'art/pic/hen.webp', 'art/pic/elephant.webp', 'art/pic/octopus.webp', 'art/pic/caterpillar.webp', 'art/pic/ant.webp', 'art/pic/ladybird.webp', 'art/pic/turtle.webp', 'art/pic/chick-hatching-from-an-egg.webp', 'art/pic/bird.webp', 'art/pic/camel.webp', 'art/pic/dolphin.webp', 'art/pic/mouse.webp', 'art/pic/cow.webp', 'art/pic/whale.webp', 'art/pic/horse.webp', 'art/pic/monkey.webp', 'art/pic/pig.webp', 'art/pic/squirrel.webp', 'art/pic/scorpion.webp', 'art/pic/eagle.webp', 'art/pic/duck.webp', 'art/pic/bat.webp', 'art/pic/friendly-shark.webp', 'art/pic/owl.webp', 'art/pic/reindeer.webp', 'art/pic/giraffe.webp', 'art/pic/teddy-bear.webp', 'art/pic/cup-of-hot-cocoa.webp', 'art/pic/corn-cob.webp', 'art/pic/slice-of-pizza.webp', 'art/pic/bowl-of-rice.webp', 'art/pic/loaf-of-bread.webp', 'art/pic/chips.webp', 'art/pic/doughnut.webp', 'art/pic/biscuit.webp', 'art/pic/sweets.webp', 'art/pic/honey-jar.webp', 'art/pic/slice-of-cake.webp', 'art/pic/pot-of-soup.webp', 'art/pic/frying-pan-with-an-egg.webp', 'art/pic/plate-with-knife-and-fork.webp', 'art/pic/spoon.webp', 'art/pic/cucumber.webp', 'art/pic/carrot.webp', 'art/pic/glass-of-milk.webp', 'art/pic/bowl-of-breakfast-cereal.webp', 'art/pic/fizzy-drink-cup-with-straw.webp', 'art/pic/broccoli.webp', 'art/pic/sandwich.webp', 'art/pic/tin-can.webp', 'art/pic/cheese.webp', 'art/pic/seed.webp', 'art/pic/little-sprout.webp', 'art/pic/tulip.webp', 'art/pic/red-rose.webp', 'art/pic/sunflower.webp', 'art/pic/green-plant.webp', 'art/pic/red-maple-leaf.webp', 'art/pic/autumn-leaves.webp', 'art/pic/green-leaves.webp', 'art/pic/cloud.webp', 'art/pic/comet.webp', 'art/pic/snowman.webp', 'art/pic/thunder-cloud-with-rain.webp', 'art/pic/mountain.webp', 'art/pic/sunrise-over-hills.webp', 'art/pic/sunset-over-a-town.webp', 'art/pic/water-wave.webp', 'art/pic/crescent-moon.webp', 'art/pic/sun-behind-a-rain-cloud.webp', 'art/pic/rain-cloud.webp', 'art/pic/fog-cloud.webp', 'art/pic/wind.webp', 'art/pic/bamboo.webp', 'art/pic/snowy-mountain.webp', 'art/pic/beach-with-umbrella.webp', 'art/pic/desert-with-cactus.webp', 'art/pic/water-splash.webp', 'art/pic/water-drop.webp', 'art/pic/campfire-flame.webp', 'art/pic/hole-in-the-ground.webp', 'art/pic/potted-plant.webp', 'art/pic/anchor.webp', 'art/pic/sailing-boat.webp', 'art/pic/aeroplane.webp', 'art/pic/helicopter.webp', 'art/pic/steam-train.webp', 'art/pic/bus.webp', 'art/pic/fire-engine.webp', 'art/pic/car.webp', 'art/pic/truck.webp', 'art/pic/traffic-light.webp', 'art/pic/bicycle.webp', 'art/pic/minus-sign.webp', 'art/pic/umbrella.webp', 'art/pic/football.webp', 'art/pic/spade-for-digging.webp', 'art/pic/scissors.webp', 'art/pic/envelope-letter.webp', 'art/pic/snowflake.webp', 'art/pic/gift-box.webp', 'art/pic/pumpkin.webp', 'art/pic/medicine-pill.webp', 'art/pic/gem.webp', 'art/pic/sheet-of-paper.webp', 'art/pic/pin.webp', 'art/pic/red-book.webp', 'art/pic/cardboard-box.webp', 'art/pic/newspaper.webp', 'art/pic/phone.webp', 'art/pic/television.webp', 'art/pic/bell.webp', 'art/pic/hammer.webp', 'art/pic/candle.webp', 'art/pic/framed-picture.webp', 'art/pic/rubbish-bin.webp', 'art/pic/treasure-map.webp', 'art/pic/sofa.webp', 'art/pic/plastic-shopping-bag.webp', 'art/pic/bed.webp', 'art/pic/shopping-trolley.webp', 'art/pic/toy-robot.webp', 'art/pic/goal-net.webp', 'art/pic/dog-bone.webp', 'art/pic/toy-box.webp', 'art/pic/sun-cream-bottle.webp', 'art/pic/broom.webp', 'art/pic/laundry-basket.webp', 'art/pic/sponge.webp', 'art/pic/chair.webp', 'art/pic/door.webp', 'art/pic/no-litter-sign.webp', 'art/pic/ice-skate.webp', 'art/pic/tent.webp', 'art/pic/child-swimming.webp', 'art/pic/lake-with-trees.webp', 'art/pic/small-shop.webp', 'art/pic/school-building.webp', 'art/pic/big-store.webp', 'art/pic/factory-with-smoke.webp', 'art/pic/sand-castle.webp', 'art/pic/scene-happy-puppy-opening-gift.webp', 'art/pic/scene-angry-child-holding-teddy.webp', 'art/pic/scene-sad-ice-cream-dropped.webp', 'art/pic/scene-sleepy-child-yawning-under.webp', 'art/pic/scene-bored-child-looking-window.webp', 'art/pic/scene-excited-birthday-cake-with.webp', 'art/pic/scene-surprised-surprise-birthday-party.webp', 'art/pic/scene-sad-waving-goodbye-house.webp', 'art/pic/scene-proud-child-tied-shoes.webp', 'art/pic/scene-happy-finished-tower-toy.webp', 'art/pic/sand-timer.webp', 'art/pic/car-park-sign.webp', 'art/pic/party-popper.webp', 'art/pic/name-tag.webp', 'art/pic/zzz-sleeping.webp', 'art/pic/loudspeaker.webp',
  'art/game/code.webp',
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
  'art/subj/bahasa.webp', 'art/subj/coding.webp', 'art/subj/feelings.webp', 'art/subj/habits.webp',
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
  'core/icons.js', 'core/world.js', 'core/art.js', 'core/profile.js', 'core/ui.js', 'core/fit.js', 'core/audio.js', 'core/speech.js', 'core/fx.js', 'core/levels.js', 'core/app.js',
  'engines/base.js', 'engines/drag.js', 'engines/quiz.js', 'engines/maze.js', 'engines/touch.js', 'engines/trace.js', 'engines/code.js', 'engines/voice.js', 'engines/media.js', 'engines/lesson.js',
  'content/bank.js', 'content/phonics.js', 'content/english.js', 'content/bahasa.js', 'content/math.js', 'content/stem.js', 'content/life.js', 'content/play.js', 'content/party.js'
];

/* The recorded voice (made by tools/voice): voice/files.js lists the
   clips to store for offline use. Its list (voice/index.js) is needed
   like any code file; the clips themselves are not (see install). */
try { importScripts('voice/files.js'); } catch (e) { self.VOICE_FILES = []; }
const CLIPS = (self.VOICE_FILES || []).filter(f => f.endsWith('.mp3'));
FILES.push(...(self.VOICE_FILES || []).filter(f => !f.endsWith('.mp3')));

/* A voice clip's name changes whenever its sound does, so a clip the last
   version stored is still right: it is copied over, not downloaded again
   (an update then costs the changed files, not the whole voice). */
async function reuse(cache, file) {
  const old = await caches.match(file);
  if (!old) return false;
  await cache.put(file, old);
  return true;
}

/* Each file gets three tries, so one dropped request does not cost the
   whole offline copy, and skips the browser's own cache, so a new VERSION
   never stores an old picture. A host may answer index.html by sending
   the browser on to "/" (Cloudflare does): the page itself is kept, not
   the detour, because a browser won't open a page from a detour. */
async function store(cache, file) {
  for (let i = 0; ; i++) {
    try {
      let res = await fetch(new Request(file, { cache: 'reload' }));
      if (!res.ok) throw new Error(res.status + ' ' + file);
      if (res.redirected) res = new Response(await res.blob(), { status: res.status, statusText: res.statusText, headers: res.headers });
      return await cache.put(file, res);
    } catch (err) { if (i >= 2) throw err; await new Promise(r => setTimeout(r, 800 * (i + 1))); }
  }
}

/* Sixteen files at a time: one by one, a phone on a real connection needed
   a quarter of an hour before the app worked offline. */
async function each(list, job, at = 16) {
  let next = 0;
  await Promise.all(Array.from({ length: at }, async () => { while (next < list.length) await job(list[next++]); }));
}

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const cache = await caches.open(VERSION);
    await each(FILES, file => store(cache, file));
    // A voice clip that won't come down is skipped, so it never costs the
    // whole offline copy: the device's voice says that line, and the clip
    // is stored the first time it plays (see fetch).
    await each(CLIPS, file => reuse(cache, file).catch(() => false).then(had => had || store(cache, file)).catch(() => {}));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      // only this app's old copies: another app on the same address (a
      // shared host such as user.github.io) keeps its own
      .then(keys => Promise.all(keys.filter(k => k.startsWith('af-') && k !== VERSION).map(k => caches.delete(k))))
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
  // Only the app's own pages are stored as pages (the app, and its privacy
  // page). Opening any other file of the folder must not replace them.
  const page = e.request.mode === 'navigate';
  const privacy = page && /\/privacy(\.html)?$/.test(url.pathname);
  if (page && !privacy && !/\/(index\.html)?$/.test(url.pathname)) return;
  const code = page || /\.(html|js|css|webmanifest)$/.test(url.pathname) || url.pathname.endsWith('/');
  if (code) {
    // Every ?go=… link is the same page, so it is stored once as that page.
    const key = privacy ? 'privacy.html' : page ? 'index.html' : e.request;
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
  const range = e.request.headers.get('range');
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(hit => hit ? (range ? piece(hit, range) : hit) :
      fetch(e.request).catch(() => fetch(e.request)).then(res => {
        if (keep && res.status === 200) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(e.request, copy)); }
        return range && res.status === 200 ? piece(res, range) : res;     // (a host that ignores Range)
      }).catch(() => Response.error()))
  );
});

/* Safari asks for a sound in pieces ("Range: bytes=0-1", then the rest)
   and won't play it if the whole file comes back instead, so a stored
   clip is cut to the piece asked for. */
async function piece(res, range) {
  const m = /bytes=(\d*)-(\d*)/.exec(range);
  if (!m || (m[1] === '' && m[2] === '')) return res;
  const buf = await res.arrayBuffer(), size = buf.byteLength;
  const start = m[1] === '' ? Math.max(0, size - +m[2]) : +m[1];
  const end = m[1] !== '' && m[2] !== '' ? Math.min(+m[2], size - 1) : size - 1;
  if (start >= size) return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${size}` } });
  return new Response(buf.slice(start, end + 1), {
    status: 206,
    headers: {
      'Content-Type': res.headers.get('Content-Type') || 'audio/mpeg',
      'Content-Range': `bytes ${start}-${end}/${size}`,
      'Content-Length': String(end - start + 1),
      'Accept-Ranges': 'bytes'
    }
  });
}
