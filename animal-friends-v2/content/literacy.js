/* ============================================================
   content/literacy.js — Language, Literacy & Communication
   ------------------------------------------------------------
   Curriculum map (lingokids_content_architecture.md, section 3):
     Phonetics & pre-reading  -> Letters   (sounds, blending, rhyme, sight words)
     Vocabulary acquisition   -> My Words  (hear it, find it, read it)
     Speech practice          -> Say It!   (pronunciation)
     Audiobooks               -> Stories   (read-aloud + questions)
   ============================================================ */
(function (AF) {
  'use strict';

  const G = AF.Gen, W = AF.WORDS, PR = AF.Pairs;
  const w = (list) => list.map(x => ({ w: x[0], e: x[1] }));

  /* ---------------- Letters ---------------- */

  const SATPIN = ['s', 'a', 't', 'p', 'i', 'n'];
  const SET2 = SATPIN.concat(['m', 'd']);
  const SET3 = SET2.concat(['g', 'o', 'c', 'k']);
  const SET4 = SET3.concat(['e', 'u', 'r']);
  const SET5 = SET4.concat(['h', 'b', 'f', 'l']);
  const CVC = w([['cat', '🐱'], ['dog', '🐶'], ['pig', '🐷'], ['sun', '☀️'], ['hat', '🎩'], ['pin', '📌'], ['map', '🗺️'],
    ['cap', '🧢'], ['pot', '🍲'], ['bed', '🛏️'], ['bus', '🚌'], ['net', '🥅'], ['log', '🪵'], ['bug', '🐛']]);

  const RHYMES = [
    w([['cat', '🐱'], ['hat', '🎩'], ['bat', '🦇']]),
    w([['dog', '🐶'], ['frog', '🐸'], ['log', '🪵']]),
    w([['bee', '🐝'], ['tree', '🌳'], ['key', '🔑']]),
    w([['star', '⭐'], ['car', '🚗'], ['jar', '🍯']]),
    w([['cake', '🍰'], ['snake', '🐍'], ['lake', '🏞️']]),
    w([['moon', '🌙'], ['spoon', '🥄'], ['balloon', '🎈']]),
    w([['bear', '🐻'], ['pear', '🍐'], ['chair', '🪑']]),
    w([['goat', '🐐'], ['boat', '⛵'], ['coat', '🧥']]),
    w([['fox', '🦊'], ['box', '📦'], ['socks', '🧦']]),
    w([['sun', '☀️'], ['bun', '🥯'], ['run', '🏃']])
  ];

  AF.register({
    id: 'letters', area: 'literacy',
    title: 'Letters', icon: '🔤', colour: '#FFC93C',
    blurb: 'Sounds & words',
    note: 'Phonics order: s a t p · i n m d · g o c k',
    skill: 'Letter sounds and blending',
    tip: 'Say the first sound of things around you: “ssss… sock!” Let your child guess the next one.',
    levels: AF.tiers([
      /* ---- Basic: the first six sounds (ids l1–l5 match v1, so a v1 child keeps their stars) ---- */
      { id: 'l1', title: 'S and A', icon: 's', type: 'choose', rounds: 5, gen: G.letterSound(['s', 'a'], 2) },
      { id: 'l2', title: 'Add T', icon: 't', type: 'choose', rounds: 5, gen: G.letterSound(['s', 'a', 't'], 3, ['t']) },
      { id: 'lt1', title: 'Trace s a t', icon: '✏️', type: 'trace', kind: 'letter', set: ['s', 'a', 't'], ordered: true },
      { id: 'l3', title: 'Add P', icon: 'p', type: 'choose', rounds: 6, gen: G.letterSound(['s', 'a', 't', 'p'], 3, ['p']) },
      { id: 'l4', title: 'Add I', icon: 'i', type: 'choose', rounds: 6, gen: G.letterSound(['s', 'a', 't', 'p', 'i'], 4, ['i']) },
      { id: 'lp1', title: 'Pop the sound', icon: '🎈', type: 'pop', rounds: 4, gen: G.letterSound(SATPIN, 3) },
      { id: 'l5', title: 'All six', icon: 'n', type: 'choose', rounds: 8, gen: G.letterSound(SATPIN, 4, ['n', 'i']) }
    ], [
      /* ---- Intermediate: first sounds, first words, eight more letters ---- */
      { id: 'l6', title: 'First sound', icon: '👂', type: 'choose', rounds: 7, gen: G.firstSound(SATPIN, 3) },
      { id: 'lt2', title: 'Trace p i n', icon: '✏️', type: 'trace', kind: 'letter', set: ['p', 'i', 'n', 'm', 'd'], rounds: 4 },
      { id: 'l7', title: 'Build a word', icon: '🧩', type: 'build', rounds: 4, extra: 1, pool: 'satpin',
        words: w([['pin', '📌'], ['tap', '🚰'], ['nap', '😴'], ['sit', '🪑'], ['pan', '🍳'], ['tin', '🥫'], ['ant', '🐜']]) },
      { id: 'l8', title: 'M and D', icon: 'm', type: 'choose', rounds: 8, gen: G.letterSound(SET2, 4, ['m', 'd']) },
      { id: 'lm1', title: 'Letter friends', icon: '🤝', type: 'match', rounds: 3, n: 3, pairs: PR.letter(SET2),
        say: 'Match each letter to its picture.', text: 'Match each <b>letter</b> to its picture' },
      { id: 'l9', title: 'G O C K', icon: 'g', type: 'choose', rounds: 8, gen: G.letterSound(SET3, 4, ['g', 'o', 'c', 'k']) },
      { id: 'lp2', title: 'Sound bubbles', icon: '🎈', type: 'pop', rounds: 5, gen: G.letterSound(SET3, 4, ['g', 'o', 'c', 'k']) },
      { id: 'l10', title: 'More words', icon: '🧱', type: 'build', rounds: 5, extra: 2, pool: 'satpinmdgock',
        words: w([['map', '🗺️'], ['man', '👨'], ['dog', '🐶'], ['cat', '🐱'], ['sad', '😢'], ['mop', '🧹'],
          ['cap', '🧢'], ['pot', '🍲'], ['dig', '⛏️'], ['kid', '🧒']]) }
    ], [
      /* ---- Advanced: all nineteen letters, blending, rhyme, sight words, writing ---- */
      { id: 'l14', title: 'E U R', icon: 'e', type: 'choose', rounds: 8, gen: G.letterSound(SET4, 4, ['e', 'u', 'r']) },
      { id: 'l15', title: 'H B F L', icon: 'h', type: 'choose', rounds: 9, gen: G.letterSound(SET5, 4, ['h', 'b', 'f', 'l']) },
      { id: 'l16', title: 'Blend it', icon: '🔗', type: 'choose', rounds: 8, gen: G.blend(CVC, 3) },
      { id: 'l11', title: 'Rhymes', icon: '🎵', type: 'choose', rounds: 8, gen: G.rhyme(RHYMES) },
      { id: 'lt3', title: 'Trace more', icon: '✏️', type: 'trace', kind: 'letter', set: ['g', 'o', 'c', 'k', 'e', 'u', 'r', 'h', 'b', 'f', 'l'], rounds: 5 },
      { id: 'l12', title: 'Sight words', icon: '👀', type: 'choose', rounds: 8,
        gen: G.sight(['the', 'and', 'is', 'it', 'in', 'I', 'a', 'to', 'go', 'we', 'my', 'you', 'he', 'she', 'no', 'me'], 4) },
      { id: 'l17', title: 'Longer words', icon: '🏗️', type: 'build', rounds: 5, extra: 2, pool: 'satpinmdgockeurhbfl',
        words: w([['frog', '🐸'], ['hand', '✋'], ['milk', '🥛'], ['tent', '⛺'], ['lamp', '💡'], ['drum', '🥁'],
          ['flag', '🚩'], ['sock', '🧦'], ['duck', '🦆'], ['bird', '🐦']]) },
      { id: 'lt4', title: 'Write a word', icon: '📝', type: 'trace', kind: 'word', rounds: 3,
        set: w([['sat', '🪑'], ['pin', '📌'], ['dog', '🐶'], ['cat', '🐱'], ['sun', '☀️'], ['hat', '🎩'], ['bed', '🛏️']]) }
    ])
  });

  /* ---------------- My Words ---------------- */

  const EASY = W.animals.slice(0, 6).concat(W.food.slice(0, 4), W.go.slice(0, 3), W.nature.slice(0, 3));

  AF.register({
    id: 'words', area: 'literacy',
    title: 'My Words', icon: '🗣️', colour: '#FF8A4C',
    blurb: 'Hear it, find it',
    skill: 'Vocabulary',
    tip: 'Play “I spy” with the words from today: “I spy something you can eat…”',
    levels: AF.tiers([
      /* ---- Basic: hear it, find it ---- */
      { id: 'w1', title: 'Animals', icon: '🐶', type: 'choose', rounds: 6, gen: G.find(W.animals, 3) },
      { id: 'wm1', title: 'Shadows', icon: '👤', type: 'match', rounds: 3, n: 3, pairs: PR.shadow(W.animals),
        say: 'Match each animal to its shadow.', text: 'Match each animal to its <b>shadow</b>' },
      { id: 'w2', title: 'Food', icon: '🍎', type: 'choose', rounds: 6, gen: G.find(W.food, 3) },
      { id: 'w3', title: 'Colours', icon: '🎨', type: 'choose', rounds: 6, gen: G.colour(3) },
      { id: 'wp1', title: 'Pop the food', icon: '🎈', type: 'pop', rounds: 4, gen: G.find(W.food, 3) },
      { id: 'w4', title: 'My body', icon: '✋', type: 'choose', rounds: 6, gen: G.find(W.body, 3) }
    ], [
      /* ---- Intermediate: more words, more choices, sorting ---- */
      { id: 'w5', title: 'Things that go', icon: '🚗', type: 'choose', rounds: 7, gen: G.find(W.go, 4) },
      { id: 'w6', title: 'At home', icon: '🏠', type: 'choose', rounds: 7, gen: G.find(W.home, 4) },
      { id: 'ws1', title: 'Animal or food?', icon: '🧺', type: 'sort', rounds: 8,
        items: W.animals.slice(0, 7).map(x => ({ e: x.e, w: x.w, bin: 'animal' })).concat(W.food.slice(0, 7).map(x => ({ e: x.e, w: x.w, bin: 'food' }))),
        bins: [{ key: 'animal', emoji: '🐾', label: 'Animals', c: '#F2A03D' }, { key: 'food', emoji: '🍽️', label: 'Food', c: '#6CC27A' }],
        ask: i => `${i.w}. Is it an animal, or food?`, tell: (i, b) => `${i.w} is ${b.key === 'animal' ? 'an animal' : 'food'}` },
      { id: 'w7', title: 'Outside', icon: '🌳', type: 'choose', rounds: 7, gen: G.find(W.nature, 4) },
      { id: 'w9', title: 'Clothes', icon: '👕', type: 'choose', rounds: 7, gen: G.find(W.clothes, 4) },
      { id: 'wm2', title: 'Toy shadows', icon: '🧸', type: 'match', rounds: 3, n: 4, pairs: PR.shadow(W.toys.concat(W.go)),
        say: 'Match each one to its shadow.', text: 'Match each one to its <b>shadow</b>' },
      { id: 'w10', title: 'Toys', icon: '🪁', type: 'choose', rounds: 7, gen: G.find(W.toys, 4) }
    ], [
      /* ---- Advanced: reading, opposites, thinking about words ---- */
      { id: 'w8', title: 'Read it', icon: '📖', type: 'choose', rounds: 8, gen: G.read(EASY, 3) },
      { id: 'wm3', title: 'Word & picture', icon: '🔤', type: 'match', rounds: 3, n: 4, pairs: PR.word(EASY),
        say: 'Match each picture to its word.', text: 'Match each picture to its <b>word</b>' },
      { id: 'w11', title: 'Opposites', icon: '↔️', type: 'choose', rounds: 8, gen: G.opposite(AF.OPPOSITES) },
      { id: 'w12', title: 'Odd one out', icon: '🤔', type: 'choose', rounds: 8,
        gen: G.odd([W.animals, W.food, W.go, W.clothes, W.toys]) },
      { id: 'w13', title: 'People who help', icon: '🧑‍🚒', type: 'choose', rounds: 8, gen: G.find(W.jobs, 4) },
      { id: 'w14', title: 'Read more', icon: '📚', type: 'choose', rounds: 9,
        gen: G.read(W.animals.concat(W.food, W.home, W.go), 4) },
      { id: 'wp2', title: 'Pop the word', icon: '🎈', type: 'pop', rounds: 5, gen: G.read(EASY, 3) }
    ])
  });

  /* ---------------- Say It! ---------------- */

  AF.register({
    id: 'sayit', area: 'literacy',
    title: 'Say It!', icon: '🎤', colour: '#FF7AB6',
    blurb: 'Speak out loud',
    note: 'Listen, then say the word',
    skill: 'Pronunciation',
    tip: 'Take turns being the teacher: your child says a word and YOU copy them.',
    levels: AF.tiers([
      /* ---- Basic: short, everyday words ---- */
      { id: 's1', title: 'Animals', icon: '🐱', type: 'speak', rounds: 5,
        words: w([['cat', '🐱'], ['dog', '🐶'], ['cow', '🐮'], ['pig', '🐷'], ['duck', '🦆'], ['fish', '🐟'], ['bee', '🐝']]) },
      { id: 's2', title: 'Food', icon: '🍌', type: 'speak', rounds: 5,
        words: w([['apple', '🍎'], ['banana', '🍌'], ['milk', '🥛'], ['egg', '🥚'], ['bread', '🍞'], ['cake', '🍰']]) },
      { id: 's3', title: 'Colours', icon: '🌈', type: 'speak', rounds: 5,
        words: w([['red', '🔴'], ['blue', '🔵'], ['yellow', '🟡'], ['green', '🟢'], ['orange', '🟠'], ['purple', '🟣']]) }
    ], [
      /* ---- Intermediate: more topics, longer sets ---- */
      { id: 's4', title: 'Numbers', icon: '5', type: 'speak', rounds: 6, ordered: true,
        words: w([['one', '1️⃣'], ['two', '2️⃣'], ['three', '3️⃣'], ['four', '4️⃣'], ['five', '5️⃣'], ['six', '6️⃣'], ['seven', '7️⃣']]) },
      { id: 's6', title: 'My body', icon: '👃', type: 'speak', rounds: 6, words: W.body },
      { id: 's7', title: 'Things that go', icon: '🚗', type: 'speak', rounds: 6, words: W.go },
      { id: 's8', title: 'At home', icon: '🏠', type: 'speak', rounds: 6, words: W.home },
      { id: 's5', title: 'Kind words', icon: '👋', type: 'speak', rounds: 5,
        words: w([['hello', '👋'], ['thank you', '🙏'], ['please', '🤲'], ['good morning', '🌅'], ['sorry', '💐'], ['goodbye', '🤗']]) }
    ], [
      /* ---- Advanced: long words and whole sentences ---- */
      { id: 's9', title: 'Feelings', icon: '😀', type: 'speak', rounds: 6, words: W.feelings },
      { id: 's10', title: 'Long words', icon: '🦋', type: 'speak', rounds: 6, words: W.long },
      { id: 's11', title: 'I can say…', icon: '💬', type: 'speak', rounds: 6,
        words: w([['I am happy', '😀'], ['I see a cat', '🐱'], ['I like apples', '🍎'], ['the sun is hot', '☀️'],
          ['I can jump', '🤸'], ['it is raining', '🌧️'], ['I love you', '💛']]) },
      { id: 's12', title: 'Questions', icon: '❓', type: 'speak', rounds: 5,
        words: w([['how are you', '🙂'], ['what is your name', '🏷️'], ['can I play', '⚽'], ['where is the ball', '🔎'],
          ['may I have some water', '💧']]) }
    ])
  });

  /* ---------------- Stories ---------------- */

  const face = (word, e) => ({ key: word, emoji: e, label: word });

  AF.register({
    id: 'stories', area: 'literacy',
    title: 'Stories', icon: '📚', colour: '#B388EB',
    blurb: 'Listen & read',
    note: 'Tap any word to hear it',
    skill: 'Listening and understanding',
    tip: 'After the story, ask “What happened first? What happened next?”',
    levels: AF.tiers([
      {
        id: 'st1', title: 'The Little Seed', icon: '🌱', type: 'story',
        pages: [
          { art: '{me} 🌰', text: '{name} found a tiny seed.', bg: '#FFF1CF' },
          { art: '{me} 🕳️ 🌰', text: '{name} put the seed in the soil.', bg: '#F3E3C8' },
          { art: '🌧️ 🌧️ 🌱', text: 'The rain came. Drip, drop, drip.', bg: '#DCEBFF' },
          { art: '☀️ 🌿', text: 'The sun came out. The seed grew and grew.', bg: '#FFF6B8' },
          { art: '{me} 🌻', text: 'Look! A big yellow flower.', bg: '#E3F7D2' },
          { art: '{me} 🌻 🐝', text: '{name} was so happy. A bee was happy too!', bg: '#FFE6F0' }
        ],
        quiz: [
          { say: 'What did {name} find?', options: [{ key: 'seed', emoji: '🌰' }, { key: 'ball', emoji: '⚽' }, { key: 'shoe', emoji: '👟' }], answer: 'seed', praise: 'A seed!' },
          { say: 'What did the seed need to grow?', options: [{ key: 'rain', emoji: '🌧️', label: 'rain and sun' }, { key: 'cake', emoji: '🍰', label: 'cake' }], answer: 'rain', praise: 'Rain and sun!' },
          { say: 'What did the seed grow into?', options: [{ key: 'flower', emoji: '🌻' }, { key: 'car', emoji: '🚗' }, { key: 'fish', emoji: '🐟' }], answer: 'flower', praise: 'A flower!' }
        ]
      },
      {
        id: 'st4', title: 'Splash!', icon: '🦆', type: 'story',
        pages: [
          { art: '{me} 🦆', text: '{name} met a little duck.', bg: '#DCEBFF' },
          { art: '🦆 💦', text: 'Splash! The duck jumped in the pond.', bg: '#CDEBFF' },
          { art: '{me} 🌊', text: 'Splash! {name} jumped in too.', bg: '#BFE3FF' },
          { art: '{me} 🦆 💦', text: 'They made big bubbles. Pop, pop, pop!', bg: '#D9F7F0' },
          { art: '{me} ☀️ 🦆', text: 'Then the sun dried them. What a fun day!', bg: '#FFF6B8' }
        ],
        quiz: [
          { say: 'Who did {name} meet?', options: [{ key: 'duck', emoji: '🦆' }, { key: 'cow', emoji: '🐮' }, { key: 'lion', emoji: '🦁' }], answer: 'duck', praise: 'A duck!' },
          { say: 'Where did they jump?', options: [{ key: 'pond', emoji: '🌊', label: 'in the pond' }, { key: 'bed', emoji: '🛏️', label: 'on the bed' }], answer: 'pond', praise: 'In the pond!' }
        ]
      }
    ], [
      {
        id: 'st2', title: 'The First Day', icon: '🎒', type: 'story',
        pages: [
          { art: '{me} 🎒', text: 'It was the first day at a new school.', bg: '#DCEBFF' },
          { art: '{me} 😟', text: '{name} felt nervous. {name} had a funny feeling inside.', bg: '#E6E0FF' },
          { art: '{me} 🌬️', text: '{name} took a big, slow breath. In and out.', bg: '#D9F7F0' },
          { art: '🐥 👋 {me}', text: 'A little chick said, Hello! Do you want to play?', bg: '#FFF6B8' },
          { art: '🐥 ⚽ {me}', text: 'They played ball. They laughed and laughed.', bg: '#E3F7D2' },
          { art: '{me} 😊 🐥', text: 'Now {name} felt happy. {name} had a new friend.', bg: '#FFE6F0' }
        ],
        quiz: [
          { say: 'How did {name} feel at the start?', options: [face('nervous', '😟'), face('sleepy', '😴'), face('angry', '😠')], answer: 'nervous', praise: 'Nervous. That is okay.' },
          { say: 'What helped {name} feel calm?', options: [{ key: 'breath', emoji: '🌬️', label: 'a slow breath' }, { key: 'shout', emoji: '📢', label: 'shouting' }], answer: 'breath', praise: 'A slow breath!' },
          { say: 'How did {name} feel at the end?', options: [face('happy', '😊'), face('sad', '😢'), face('scared', '😨')], answer: 'happy', praise: 'Happy!' }
        ]
      },
      {
        id: 'st5', title: 'The Sharing Tree', icon: '🍎', type: 'story',
        pages: [
          { art: '🌳 🍎 {me}', text: '{name} found a tree with one red apple.', bg: '#E3F7D2' },
          { art: '🐿️ 🐦 🐰', text: 'A squirrel, a bird and a rabbit were hungry too.', bg: '#FFF1CF' },
          { art: '{me} 🤔 🍎', text: 'One apple. Four friends. What can we do? said {name}.', bg: '#E6E0FF' },
          { art: '{me} 🔪 🍎', text: 'I know! We can cut it and share.', bg: '#FFE6F0' },
          { art: '🐿️ 🐦 🐰 {me}', text: 'Everyone got a piece. Yum, yum, yum!', bg: '#FFF6B8' },
          { art: '🌱 🌳 🌳', text: 'They planted the seeds. One day there will be many apple trees.', bg: '#D9F7F0' },
          { art: '{me} 💛 🐰', text: 'Sharing made everyone happy. {name} most of all.', bg: '#FFE6F0' }
        ],
        quiz: [
          { say: 'How many apples were on the tree?', options: [{ key: 1, glyph: '1' }, { key: 3, glyph: '3' }, { key: 5, glyph: '5' }], answer: 1, praise: 'One apple.' },
          { say: 'What did {name} do with the apple?', options: [{ key: 'share', emoji: '🤝', label: 'shared it' }, { key: 'hide', emoji: '🙈', label: 'hid it' }, { key: 'throw', emoji: '🗑️', label: 'threw it away' }], answer: 'share', praise: 'Shared it!' },
          { say: 'What did they plant?', options: [{ key: 'seeds', emoji: '🌱', label: 'the seeds' }, { key: 'shoe', emoji: '👟', label: 'a shoe' }], answer: 'seeds', praise: 'The seeds!' },
          { say: 'How did everyone feel?', options: [face('happy', '😊'), face('angry', '😠'), face('scared', '😨')], answer: 'happy', praise: 'Happy!' }
        ]
      }
    ], [
      {
        id: 'st3', title: 'Trip to the Moon', icon: '🚀', type: 'story',
        pages: [
          { art: '{me} 🌙', text: 'One night, {name} looked up at the moon.', bg: '#2B2B5E' },
          { art: '{me} 📦 ✂️', text: 'I will build a rocket, said {name}.', bg: '#FFF1CF' },
          { art: '🚀 🔥', text: 'Five, four, three, two, one. Blast off!', bg: '#FFD9C2' },
          { art: '🌍 🚀 ⭐', text: 'The rocket flew past the clouds and past the stars.', bg: '#23234F' },
          { art: '{me} 🌙 🚩', text: '{name} landed on the moon. It was quiet and grey.', bg: '#3A3A6E' },
          { art: '🌍 💙 {me}', text: 'Far away was the Earth. It looked like a blue ball. Time to go home!', bg: '#23234F' }
        ],
        quiz: [
          { say: 'Where did {name} go?', options: [{ key: 'moon', emoji: '🌙' }, { key: 'beach', emoji: '🏖️' }, { key: 'shop', emoji: '🏪' }], answer: 'moon', praise: 'The moon!' },
          { say: 'What did {name} fly in?', options: [{ key: 'rocket', emoji: '🚀' }, { key: 'bus', emoji: '🚌' }, { key: 'boat', emoji: '⛵' }], answer: 'rocket', praise: 'A rocket!' },
          { say: 'What did the Earth look like?', options: [{ key: 'ball', emoji: '🌍', label: 'a blue ball' }, { key: 'box', emoji: '📦', label: 'a box' }], answer: 'ball', praise: 'A blue ball!' }
        ]
      },
      {
        id: 'st6', title: 'The Lost Kitten', icon: '🐱', type: 'story',
        pages: [
          { art: '{me} 🌧️', text: 'It was a rainy afternoon. {name} heard a tiny sound. Mew, mew.', bg: '#DCEBFF' },
          { art: '📦 🐱', text: 'Under a box sat a small wet kitten. It was shivering.', bg: '#E6E0FF' },
          { art: '{me} 🧣 🐱', text: '{name} wrapped the kitten in a warm scarf.', bg: '#FFE6F0' },
          { art: '{me} ❓ 🏠', text: 'Where do you live, little one? Let us find your home.', bg: '#FFF1CF' },
          { art: '🏠 🚪 🐶', text: 'At the first house there was a dog. Not here!', bg: '#E3F7D2' },
          { art: '🏠 🚪 🐔', text: 'At the second house there were hens. Not here!', bg: '#FFF6B8' },
          { art: '🏠 👧 😢', text: 'At the third house a girl was crying. I lost my kitten, she said.', bg: '#DCEBFF' },
          { art: '👧 🐱 💛', text: 'The kitten jumped into her arms. Purr, purr, purr.', bg: '#FFE6F0' },
          { art: '{me} 😊 🌈', text: 'Thank you! said the girl. The rain stopped, and {name} walked home under a rainbow.', bg: '#D9F7F0' }
        ],
        quiz: [
          { say: 'What did {name} find under the box?', options: [{ key: 'kitten', emoji: '🐱' }, { key: 'puppy', emoji: '🐶' }, { key: 'ball', emoji: '⚽' }], answer: 'kitten', praise: 'A kitten!' },
          { say: 'What was the weather like?', options: [{ key: 'rain', emoji: '🌧️', label: 'rainy' }, { key: 'sun', emoji: '☀️', label: 'sunny' }, { key: 'snow', emoji: '❄️', label: 'snowy' }], answer: 'rain', praise: 'It was rainy.' },
          { say: 'How did {name} keep the kitten warm?', options: [{ key: 'scarf', emoji: '🧣', label: 'a scarf' }, { key: 'ice', emoji: '🧊', label: 'ice' }], answer: 'scarf', praise: 'With a warm scarf.' },
          { say: 'Which house was the kitten’s home?', options: [{ key: 3, glyph: '3', label: 'the third' }, { key: 1, glyph: '1', label: 'the first' }, { key: 2, glyph: '2', label: 'the second' }], answer: 3, praise: 'The third house!' },
          { say: 'How did the girl feel at the end?', options: [face('happy', '😊'), face('sad', '😢'), face('angry', '😠')], answer: 'happy', praise: 'Happy!' }
        ]
      }
    ])
  });
})(window.AF = window.AF || {});
