/* ============================================================
   content/play.js — Maze, Memory and Songs
   ------------------------------------------------------------
   Curriculum map (lingokids_content_architecture.md, section 4):
     Interactive games -> Maze    (planning, problem solving)
                       -> Memory  (working memory, vocabulary)
     Music & songs     -> Songs   (rhythm, repetition, routines)
     Audiobooks        -> Story Time (read-aloud stories starring the
                          child's friend, with questions; moved here
                          from ABC Island in v4, which now holds the
                          Wink core subjects)

   The games are not a break from the curriculum: the maze asks
   for letters and numbers, memory says every word it turns over.
   ============================================================ */
(function (AF) {
  'use strict';

  const W = AF.WORDS, PR = AF.Pairs;
  const many = (n, item) => Array.from({ length: n }, () => item);

  /* ---------------- Maze ---------------- */

  AF.register({
    id: 'maze', area: 'play',
    title: 'Maze', icon: '🧭', colour: '#4CC3FF',
    blurb: 'Find the way',
    note: 'Tap the arrows, or tap the maze',
    skill: 'Planning and problem solving',
    tip: 'Draw a simple maze on paper and take turns finding the way with a finger.',
    levels: AF.tiers([
      /* ---- Basic: small boards, one thing to do (Forest Fun) ---- */
      { id: 'm1', title: 'Go home', icon: '🏠', type: 'maze', w: 4, h: 4, theme: 'forest',
        say: 'Help me find my way home!', text: 'Help me get <b>home</b>' },
      { id: 'm7', title: 'Find the key', icon: '🔑', type: 'maze', w: 4, h: 5, theme: 'forest', want: 'key',
        say: 'Find the key. Then go home!', text: 'Find the <b>key</b>, then go home',
        targets: [{ e: '🔑', label: 'key' }] },
      { id: 'm2', title: 'Two stars', icon: '⭐', type: 'maze', w: 5, h: 5, theme: 'forest', want: 'stars',
        say: 'Pick up two stars. Then go home!', text: 'Pick up <b>2 stars</b>, then go home',
        targets: many(2, { e: '⭐', label: 'star' }) },
      { id: 'm3', title: 'Apples only', icon: '🍎', type: 'maze', w: 5, h: 5, theme: 'forest', want: 'apples',
        say: 'Pick up three apples. Only apples! Then go home.', text: 'Pick up <b>3 apples</b> — only apples!',
        targets: many(3, { e: '🍎', label: 'apple' }),
        decoys: [{ e: '🍌', label: 'banana' }, { e: '🧦', label: 'sock' }] }
    ], [
      /* ---- Intermediate: bigger boards, letters and counting (Beach Day) ---- */
      { id: 'm4', title: 'Letter hunt', icon: 's', type: 'maze', w: 6, h: 6, theme: 'beach', want: 'letter that says ssss',
        say: 'Find the letter that says ssss. There are three!', text: 'Find the letter that says <b>/s/</b>',
        targets: many(3, { glyph: 's', label: 'ssss' }),
        decoys: [{ glyph: 'a', label: 'a', say: 'the letter for aaah' }, { glyph: 't', label: 't', say: 'the letter for tuh' }] },
      { id: 'm8', title: 'One, two, three', icon: '3', type: 'maze', w: 6, h: 6, theme: 'beach', ordered: true,
        say: 'Pick up one, then two, then three. In order! Then go home.', text: 'Pick up <b>1, 2, 3</b> in order',
        targets: [{ glyph: '1', label: 'one' }, { glyph: '2', label: 'two' }, { glyph: '3', label: 'three' }] },
      { id: 'm5', title: 'Four carrots', icon: '🥕', type: 'maze', w: 7, h: 6, theme: 'beach', want: 'carrots',
        say: 'Count four carrots. Then go home!', text: 'Count <b>4 carrots</b>, then go home',
        targets: many(4, { e: '🥕', label: 'carrot' }),
        decoys: [{ e: '🍰', label: 'cake' }, { e: '🍬', label: 'sweet' }, { e: '👟', label: 'shoe' }] },
      { id: 'm9', title: 'Animals only', icon: '🐶', type: 'maze', w: 7, h: 7, theme: 'candy', want: 'animals',
        say: 'Find the four animals. Only animals! Then go home.', text: 'Find the <b>4 animals</b> — only animals!',
        targets: [{ e: '🐶', label: 'dog' }, { e: '🐱', label: 'cat' }, { e: '🐰', label: 'rabbit' }, { e: '🐸', label: 'frog' }],
        decoys: [{ e: '🚗', label: 'car' }, { e: '🍕', label: 'pizza' }, { e: '⚽', label: 'ball' }] }
    ], [
      /* ---- Advanced: big boards, spelling and counting in order (Snow and Night) ---- */
      { id: 'm6', title: 'Big maze', icon: '🗺️', type: 'maze', w: 8, h: 8, theme: 'snow', want: 'stars',
        say: 'A big one! Find five stars. Then go home.', text: 'Find <b>5 stars</b> in the big maze',
        targets: many(5, { e: '⭐', label: 'star' }),
        decoys: [{ e: '🌙', label: 'moon' }, { e: '☁️', label: 'cloud' }, { e: '🔥', label: 'fire' }] },
      { id: 'm10', title: 'Spell CAT', icon: 'c', type: 'maze', w: 7, h: 7, theme: 'snow', ordered: true, done: 'Cat! Now go home!',
        say: 'Spell cat. Pick up kuh, then aaah, then tuh. Then go home.', text: 'Spell <b>c a t</b> in order',
        targets: [{ glyph: 'c', label: 'kuh', say: 'kuh' }, { glyph: 'a', label: 'aaah', say: 'aaah' }, { glyph: 't', label: 'tuh', say: 'tuh' }],
        decoys: [{ glyph: 'm', label: 'm', say: 'the letter for mmmm' }, { glyph: 'p', label: 'p', say: 'the letter for puh' }] },
      { id: 'm11', title: 'Count to five', icon: '5', type: 'maze', w: 8, h: 7, theme: 'night', ordered: true,
        say: 'Pick up one, two, three, four, five. In order! Then go home.', text: 'Pick up <b>1 to 5</b> in order',
        targets: [1, 2, 3, 4, 5].map(n => ({ glyph: String(n), label: AF.NUM[n] })) },
      { id: 'm12', title: 'Spell DOG', icon: 'd', type: 'maze', w: 8, h: 8, theme: 'night', ordered: true, done: 'Dog! Now go home!',
        say: 'Spell dog. Pick up duh, then awh, then guh. Then go home.', text: 'Spell <b>d o g</b> in order',
        targets: [{ glyph: 'd', label: 'duh', say: 'duh' }, { glyph: 'o', label: 'awh', say: 'awh' }, { glyph: 'g', label: 'guh', say: 'guh' }],
        decoys: [{ glyph: 's', label: 's', say: 'the letter for ssss' }, { glyph: 'n', label: 'n', say: 'the letter for nnnn' }, { glyph: 'k', label: 'k', say: 'the letter for kuh' }] },
      { id: 'm13', title: 'Giant maze', icon: '🏔️', type: 'maze', w: 9, h: 9, theme: 'candy', want: 'gems',
        say: 'The giant maze! Find six gems. Then go home.', text: 'Find <b>6 gems</b> in the giant maze',
        targets: many(6, { e: '💎', label: 'gem' }),
        decoys: [{ e: '🪨', label: 'rock' }, { e: '🍂', label: 'leaf' }, { e: '🧦', label: 'sock' }, { e: '🥄', label: 'spoon' }] }
    ])
  });

  /* ---------------- Memory ---------------- */

  AF.register({
    id: 'memory', area: 'play',
    title: 'Memory', icon: '🃏', colour: '#B388EB',
    blurb: 'Find the pairs',
    skill: 'Working memory',
    tip: 'Put three toys on a tray, cover them, take one away. Which one is missing?',
    levels: AF.tiers([
      /* ---- Basic: a first look at the cards, few pairs ---- */
      { id: 'g1', title: 'Three pairs', icon: '🐶', type: 'memory', n: 3, peek: true, pairs: W.animals },
      { id: 'g6', title: 'Clay shapes', icon: '⭐', type: 'memory', n: 4, peek: true, clay: true },
      { id: 'g2', title: 'Four pairs', icon: '🍎', type: 'memory', n: 4, pairs: W.food },
      { id: 'g7', title: 'Five pairs', icon: '🧸', type: 'memory', n: 5, clay: true }
    ], [
      /* ---- Intermediate: more cards, and pairs that are not twins ---- */
      { id: 'g3', title: 'Six pairs', icon: '🚗', type: 'memory', n: 6, pairs: W.go.concat(W.nature) },
      { id: 'g4', title: 'Word & picture', icon: '📖', type: 'memory', n: 4, words: true,
        pairs: W.animals.slice(0, 7).concat(W.nature.slice(0, 4)) },
      { id: 'g8', title: 'Number & stars', icon: '🔢', type: 'memory', n: 5, pairs: PR.count(1, 6) },
      { id: 'g9', title: 'Sound & picture', icon: '🔤', type: 'memory', n: 5, pairs: PR.letter(['s', 'a', 't', 'p', 'i', 'n', 'm', 'd']) }
    ], [
      /* ---- Advanced: many cards, and pairs you have to think about ---- */
      { id: 'g5', title: 'Eight pairs', icon: '🧠', type: 'memory', n: 8, pairs: W.animals.concat(W.food) },
      { id: 'g10', title: 'Rhyme pairs', icon: '🎵', type: 'memory', n: 5,
        pairs: PR.words([[['cat', '🐱'], ['hat', '🎩']], [['dog', '🐶'], ['frog', '🐸']], [['bee', '🐝'], ['tree', '🌳']],
          [['star', '⭐'], ['car', '🚗']], [['moon', '🌙'], ['spoon', '🥄']], [['goat', '🐐'], ['boat', '⛵']], [['fox', '🦊'], ['box', '📦']]]) },
      { id: 'g11', title: 'Opposites', icon: '↔️', type: 'memory', n: 6,
        pairs: PR.words(AF.OPPOSITES.map(o => [[o[0], o[1]], [o[2], o[3]]])) },
      { id: 'g12', title: 'Ten pairs', icon: '🏆', type: 'memory', n: 10, pairs: W.animals.concat(W.food, W.go, W.toys) }
    ])
  });

  /* ---------------- Songs ----------------
     Traditional, public-domain melodies with new words.
     One note per word; `beats` gives each note's length. */

  AF.register({
    id: 'songs', area: 'play',
    title: 'Songs', icon: '🎵', colour: '#FFC93C',
    blurb: 'Sing & drum',
    note: 'Sing along and tap the drum',
    skill: 'Rhythm and memory',
    tip: 'Clap the beat of your child’s name: “Na-o-mi” is three claps.',
    levels: AF.tiers([
      /* ---- Basic ---- */
      { id: 'so1', title: 'ABC song', icon: '🔤', type: 'song', tempo: 0.46, lines: [
        { words: ['A', 'B', 'C', 'D', 'E', 'F', 'G'], notes: 'C C G G A A G', beats: [1, 1, 1, 1, 1, 1, 2] },
        { words: ['H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P'], notes: 'F F E E D D D D C', beats: [1, 1, 1, 1, 0.5, 0.5, 0.5, 0.5, 2] },
        { words: ['Q', 'R', 'S', 'T', 'U', 'V'], notes: 'G G F E E D', beats: [1, 1, 2, 1, 1, 2] },
        { words: ['W', 'X', 'Y', 'and', 'Z'], notes: 'G F E E D', beats: [2, 2, 1, 1, 2] },
        { words: ['Now', 'I', 'know', 'my', 'A', 'B', 'C'], notes: 'C C G G A A G', beats: [1, 1, 1, 1, 1, 1, 2] },
        { words: ['Next', 'time', 'sing', 'a-', 'long', 'with', 'me'], notes: 'F F E E D D C', beats: [1, 1, 1, 1, 1, 1, 2] }
      ] },
      { id: 'so6', title: 'Tidy up', icon: '🧺', type: 'song', tempo: 0.46, lines: [
        { words: ['Ti-', 'dy', 'up'], notes: 'E D C', beats: [1, 1, 2] },
        { words: ['ti-', 'dy', 'up'], notes: 'E D C', beats: [1, 1, 2] },
        { words: ['Put', 'the', 'toys', 'a-', 'way', 'and', 'then', 'we'], notes: 'C C C C D D D D', beats: [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5] },
        { words: ['ti-', 'dy', 'up!'], notes: 'E D C', beats: [1, 1, 2] }
      ] }
    ], [
      /* ---- Intermediate ---- */
      { id: 'so3', title: 'Count to ten', icon: '🔟', type: 'song', tempo: 0.44, lines: [
        { words: ['One', 'two', 'three', 'four'], notes: 'C D E C', beats: [1, 1, 1, 1] },
        { words: ['one', 'two', 'three', 'four'], notes: 'C D E C', beats: [1, 1, 1, 1] },
        { words: ['Five', 'six', 'sev\'n'], notes: 'E F G', beats: [1, 1, 2] },
        { words: ['eight', 'nine', 'ten'], notes: 'E F G', beats: [1, 1, 2] },
        { words: ['Count-', 'ing', 'on', 'my', 'fin-', 'gers'], notes: 'G A G F E C', beats: [0.5, 0.5, 0.5, 0.5, 1, 1] },
        { words: ['count-', 'ing', 'on', 'my', 'fin-', 'gers'], notes: 'G A G F E C', beats: [0.5, 0.5, 0.5, 0.5, 1, 1] },
        { words: ['Here', 'are', 'ten!'], notes: 'C G C', beats: [1, 1, 2] },
        { words: ['Here', 'are', 'ten!'], notes: 'C G C', beats: [1, 1, 2] }
      ] },
      { id: 'so2', title: 'Wash your hands', icon: '🧼', type: 'song', tempo: 0.42, lines: [
        { words: ['Wash,', 'wash,', 'wash', 'your', 'hands'], notes: 'C C C D E', beats: [1.5, 1.5, 1, 0.5, 1.5] },
        { words: ['Scrub', 'them', 'nice', 'and', 'clean'], notes: 'E D E F G', beats: [1, 0.5, 1, 0.5, 3] },
        { words: ['Bub-', 'bles', 'bub-', 'bles', 'bub-', 'bles', 'bub-', 'bles', 'bub-', 'bles', 'ev\'ry-', 'where'],
          notes: 'c c c G G G E E E C C C', beats: [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5] },
        { words: ['Rinse', 'and', 'dry', 'all', 'clean!'], notes: 'G F E D C', beats: [1, 0.5, 1, 0.5, 3] }
      ] }
    ], [
      /* ---- Advanced ---- */
      { id: 'so4', title: 'Rainbow song', icon: '🌈', type: 'song', tempo: 0.44, lines: [
        { words: ['Red', 'and', 'yel-', 'low,', 'pink', 'and', 'green'], notes: 'E D C D E E E', beats: [1, 1, 1, 1, 1, 1, 2] },
        { words: ['or-', 'ange', 'too'], notes: 'D D D', beats: [1, 1, 2] },
        { words: ['pur-', 'ple,', 'blue'], notes: 'E G G', beats: [1, 1, 2] },
        { words: ['Ev\'-', 'ry', 'col-', 'our', 'in', 'the', 'sky'], notes: 'E D C D E E E', beats: [1, 1, 1, 1, 1, 1, 1] },
        { words: ['makes', 'a', 'rain-', 'bow', 'just', 'for', 'you'], notes: 'E D D E D C C', beats: [1, 1, 1, 1, 1, 1, 2] }
      ] },
      { id: 'so5', title: 'Days of the week', icon: '📅', type: 'song', tempo: 0.44, lines: [
        { words: ['Sun-', 'day,', 'Mon-', 'day,', 'Tues-', 'day', 'too'], notes: 'G A G F E F G', beats: [1.5, 0.5, 1, 1, 1, 1, 2] },
        { words: ['Wed-', 'nes-', 'day'], notes: 'D E F', beats: [1, 1, 2] },
        { words: ['Thurs-', 'day', 'too'], notes: 'E F G', beats: [1, 1, 2] },
        { words: ['Fri-', 'day,', 'Sat-', 'ur-', 'day', 'and', 'then'], notes: 'G A G F E F G', beats: [1.5, 0.5, 1, 1, 1, 1, 2] },
        { words: ['we', 'start', 'a-', 'gain!'], notes: 'D G E C', beats: [2, 2, 1, 3] }
      ] }
    ])
  });

  /* ---------------- Stories ---------------- */

  const face = (word, e) => ({ key: word, emoji: e, label: word });

  AF.register({
    id: 'stories', area: 'play',
    title: 'Story Time', icon: '📚', colour: '#B388EB',
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
          { art: '{me} 🍽️ 🍎', text: 'I know! A grown-up can cut it, and we can share.', bg: '#FFE6F0' },
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
          { art: '🌍 🚀 ⭐', text: 'The rocket flew up, past the clouds and into space.', bg: '#23234F' },
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
          { say: 'How did {name} keep the kitten warm?', options: [{ key: 'scarf', emoji: '🧣', label: 'a scarf' }, { key: 'snow', emoji: '❄️', label: 'snow' }], answer: 'scarf', praise: 'With a warm scarf.' },
          { say: 'Which house was the kitten’s home?', options: [{ key: 3, glyph: '3', label: 'the third' }, { key: 1, glyph: '1', label: 'the first' }, { key: 2, glyph: '2', label: 'the second' }], answer: 3, praise: 'The third house!' },
          { say: 'How did the girl feel at the end?', options: [face('happy', '😊'), face('sad', '😢'), face('angry', '😠')], answer: 'happy', praise: 'Happy!' }
        ]
      }
    ])
  });
})(window.AF = window.AF || {});
