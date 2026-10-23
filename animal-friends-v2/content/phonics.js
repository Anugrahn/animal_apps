/* ============================================================
   content/phonics.js — Phonics (Wink curriculum, four steps)
   ------------------------------------------------------------
   Danbi Education's Wink Phonics runs in four steps:
     Step 1  the alphabet's sounds, a to z
     Step 2  short and long vowels (cat, cake)
     Step 3  consonant blends and digraphs (frog, ship)
     Step 4  silent letters and other irregular sounds (knee, moon)

   Every lesson walks the same road (engines/lesson.js):
     Listen  meet the sounds, one big card at a time
     Trace   write the letter or the word
     Play    a game with them (pop, match, build, sort)
     Quiz    four quick questions
   and every step ends with a Review lesson before its treasure.

   The letter lines ("a … aaah … apple") are the ones the recorded
   voice already says, so the sounds stay pure.
   ============================================================ */
(function (AF) {
  'use strict';

  const G = AF.Gen, PR = AF.Pairs, L = AF.lesson, P = AF.PHONICS, U = AF.U;
  const w = (list) => list.map(x => ({ w: x[0], e: x[1] }));
  /* one question maker, then another, in turn */
  const mix = (...gens) => (ctx) => gens[ctx.round % gens.length](ctx);
  const pure = (k) => P[k].say.replace(/(.)\1+/g, '$1');
  const cap = (t) => t.charAt(0).toUpperCase() + t.slice(1);

  /* ---------------- Step 1: a to z ---------------- */

  const letterCard = (k) => ({
    big: k, pic: P[k].e, word: P[k].word, say: `${k} … ${P[k].say} … ${P[k].word}`,
    text: `<b>${k}</b> says /${pure(k)}/`
  });

  /** Four new letters: hear them, trace them, play, and a quiz that
      mixes in every letter met so far. */
  function alphabet(id, keys, sofar, game) {
    const play = game === 'match'
      ? { step: 'play', type: 'match', rounds: 1, n: Math.min(4, keys.length), pairs: PR.letter(keys),
          say: 'Match each letter to its picture.', text: 'Match each <b>letter</b> to its picture' }
      : { step: 'play', type: 'pop', rounds: 3, gen: G.letterSound(keys, 3) };
    return L(id, keys.join(' '), [
      { step: 'listen', type: 'intro', cards: keys.map(letterCard) },
      { step: 'trace', type: 'trace', kind: 'letter', set: keys, rounds: Math.min(3, keys.length) },
      play,
      { step: 'quiz', type: 'choose', rounds: 4, gen: G.letterSound(sofar, sofar.length > 6 ? 4 : 3, keys) }
    ], { topic: 'letters' });
  }
  const A = AF.ALPHABET;
  const upTo = (k) => A.slice(0, A.indexOf(k) + 1);
  const STARTS = A.filter(k => !P[k].end);           // (x is heard at the end of fox, so not "starts with")

  const step1 = [
    alphabet('ph1-1', ['a', 'b', 'c', 'd'], upTo('d')),
    alphabet('ph1-2', ['e', 'f', 'g', 'h'], upTo('h'), 'match'),
    alphabet('ph1-3', ['i', 'j', 'k', 'l'], upTo('l')),
    alphabet('ph1-4', ['m', 'n', 'o', 'p'], upTo('p'), 'match'),
    alphabet('ph1-5', ['q', 'r', 's', 't'], upTo('t')),
    alphabet('ph1-6', ['u', 'v', 'w', 'x'], upTo('x'), 'match'),
    L('ph1-7', 'y z', [
      { step: 'listen', type: 'intro', cards: ['y', 'z'].map(letterCard) },
      { step: 'trace', type: 'trace', kind: 'letter', set: ['y', 'z'], ordered: true },
      { step: 'play', type: 'match', rounds: 1, n: 4, pairs: PR.letter(['w', 'x', 'y', 'z']),
        say: 'Match each letter to its picture.', text: 'Match each <b>letter</b> to its picture' },
      { step: 'quiz', type: 'choose', rounds: 4, gen: G.letterSound(A, 4, ['y', 'z']) }
    ], { topic: 'letters' }),
    L('ph1-r', 'Review', [
      { step: 'review', type: 'choose', rounds: 6, gen: mix(G.letterSound(A, 4), G.firstSound(STARTS, 3)) },
      { step: 'play', type: 'memory', n: 4, peek: true, pairs: PR.letter(['a', 'b', 'c', 'd', 'm', 's', 't', 'p', 'n', 'g']) }
    ], { review: true })
  ];

  /* ---------------- Step 2: short and long vowels ---------------- */

  const SHORT_A = w([['cat', '🐱'], ['hat', '🎩'], ['map', '🗺️'], ['bat', '🦇'], ['jam', '🍯'], ['van', '🚐']]);
  const SHORT_E = w([['bed', '🛏️'], ['net', '🥅'], ['leg', '🦵'], ['web', '🕸️'], ['ten', '🔟']]);
  const SHORT_I = w([['pig', '🐷'], ['pin', '📌'], ['bin', '🗑️'], ['kid', '🧒'], ['zip', '🤐']]);
  const SHORT_O = w([['dog', '🐶'], ['pot', '🍲'], ['fox', '🦊'], ['box', '📦'], ['mop', '🧹']]);
  const SHORT_U = w([['sun', '☀️'], ['bus', '🚌'], ['bug', '🐛'], ['cup', '☕'], ['nut', '🥜']]);
  const LONG_A = w([['cake', '🍰'], ['snake', '🐍'], ['lake', '🏞️'], ['plane', '✈️'], ['wave', '🌊'], ['game', '🎮']]);
  const LONG_I = w([['bike', '🚲'], ['kite', '🪁'], ['five', '5️⃣'], ['nine', '9️⃣'], ['smile', '😁']]);
  const LONG_O = w([['nose', '👃'], ['rose', '🌹'], ['bone', '🦴'], ['home', '🏠'], ['globe', '🌍']]);
  const LONG_E = w([['bee', '🐝'], ['tree', '🌳'], ['sheep', '🐑'], ['feet', '🦶'], ['seed', '🌰'], ['queen', '👸']]);

  /* a word's card: the word, then its sounds run together */
  const wordCard = (x) => ({ big: x.w, pic: x.e, say: x.w, sound: AF.blend(x.w) });
  /* a vowel's card, with its own picture */
  const vowelCard = (k, extra) => Object.assign(letterCard(k), extra || {});
  const LETTERS = 'satpinmdgockeurhbflvwjz';

  /* Sort by sound: "Snake. Cat, or cake?" */
  function soundSort(items, a, b) {
    return {
      step: 'play', type: 'sort', rounds: 6,
      items: items, bins: [{ key: a.key, emoji: a.e, label: a.label, c: '#F2A03D' }, { key: b.key, emoji: b.e, label: b.label, c: '#4D9DE0' }],
      ask: i => `${cap(i.w)}. ${cap(a.word)}, or ${b.word}?`,
      tell: (i, bin) => `${cap(i.w)}, like ${bin.key === a.key ? a.word : b.word}`
    };
  }
  const tag = (list, bin) => list.map(x => ({ e: x.e, w: x.w, bin: bin }));

  const step2 = [
    L('ph2-1', 'Short a', [
      { step: 'listen', type: 'intro', cards: [vowelCard('a')].concat(SHORT_A.slice(0, 3).map(wordCard)) },
      { step: 'trace', type: 'trace', kind: 'word', rounds: 1, set: SHORT_A.slice(0, 2) },
      { step: 'play', type: 'build', rounds: 3, extra: 1, pool: LETTERS, words: SHORT_A },
      { step: 'quiz', type: 'choose', rounds: 4, gen: G.blend(SHORT_A, 3) }
    ], { topic: 'short' }),
    L('ph2-2', 'Short e and i', [
      { step: 'listen', type: 'intro', cards: [vowelCard('e'), wordCard(SHORT_E[0]), vowelCard('i'), wordCard(SHORT_I[0])] },
      { step: 'trace', type: 'trace', kind: 'word', rounds: 1, set: [SHORT_E[0], SHORT_I[0]] },
      soundSort(tag(SHORT_E, 'e').concat(tag(SHORT_I, 'i')),
        { key: 'e', e: '🥚', label: 'e — egg', word: 'egg' }, { key: 'i', e: '🐞', label: 'i — insect', word: 'insect' }),
      { step: 'quiz', type: 'choose', rounds: 4, gen: G.blend(SHORT_E.concat(SHORT_I), 3) }
    ], { topic: 'short' }),
    L('ph2-3', 'Short o and u', [
      { step: 'listen', type: 'intro', cards: [vowelCard('o'), wordCard(SHORT_O[0]), vowelCard('u'), wordCard(SHORT_U[0])] },
      { step: 'trace', type: 'trace', kind: 'word', rounds: 1, set: [SHORT_O[0], SHORT_U[0]] },
      { step: 'play', type: 'build', rounds: 3, extra: 1, pool: LETTERS, words: SHORT_O.concat(SHORT_U) },
      { step: 'quiz', type: 'choose', rounds: 4, gen: G.blend(SHORT_O.concat(SHORT_U), 3) }
    ], { topic: 'short' }),
    L('ph2-4', 'Magic e: a', [
      { step: 'listen', type: 'intro', cards: [
        { big: 'a_e', pic: '🍰', word: 'cake', say: 'Magic e! The e at the end makes a say its name. Cake!', text: '<b>Magic e</b>: a says its name' },
        { big: 'cat', pic: '🐱', say: 'Cat has a short a.' },
        { big: 'cake', pic: '🍰', say: 'Cake has a long a.' },
        wordCard(LONG_A[1])
      ] },
      { step: 'trace', type: 'trace', kind: 'word', rounds: 1, set: [LONG_A[0]] },
      soundSort(tag(SHORT_A.slice(0, 4), 'short').concat(tag(LONG_A.slice(1, 5), 'long')),
        { key: 'short', e: '🐱', label: 'a — cat', word: 'cat' }, { key: 'long', e: '🍰', label: 'a — cake', word: 'cake' }),
      { step: 'quiz', type: 'choose', rounds: 4, gen: G.read(LONG_A.concat(SHORT_A), 3) }
    ], { topic: 'long' }),
    L('ph2-5', 'Magic e: i and o', [
      { step: 'listen', type: 'intro', cards: [
        { big: 'i_e', pic: '🚲', word: 'bike', say: 'Magic e makes i say its name. Bike!', text: '<b>Magic e</b>: i says its name' },
        wordCard(LONG_I[1]),
        { big: 'o_e', pic: '👃', word: 'nose', say: 'Magic e makes o say its name. Nose!', text: '<b>Magic e</b>: o says its name' },
        wordCard(LONG_O[2])
      ] },
      { step: 'trace', type: 'trace', kind: 'word', rounds: 1, set: [LONG_I[1], LONG_O[3]] },
      { step: 'play', type: 'build', rounds: 3, extra: 1, pool: LETTERS, words: LONG_I.slice(0, 3).concat(LONG_O.slice(0, 4)) },
      { step: 'quiz', type: 'choose', rounds: 4, gen: G.read(LONG_I.concat(LONG_O), 3) }
    ], { topic: 'long' }),
    L('ph2-6', 'Long e: ee', [
      { step: 'listen', type: 'intro', cards: [
        { big: 'ee', pic: '🐝', word: 'bee', say: 'Two e letters say eee. Bee!', text: '<b>ee</b> says /ee/' },
        wordCard(LONG_E[1]), wordCard(LONG_E[2]), wordCard(LONG_E[3])
      ] },
      { step: 'trace', type: 'trace', kind: 'word', rounds: 1, set: [LONG_E[0], LONG_E[1]] },
      { step: 'play', type: 'match', rounds: 1, n: 4, pairs: PR.word(LONG_E),
        say: 'Match each picture to its word.', text: 'Match each picture to its <b>word</b>' },
      { step: 'quiz', type: 'choose', rounds: 4, gen: G.read(LONG_E.concat(SHORT_E), 3) }
    ], { topic: 'long' }),
    L('ph2-r', 'Review', [
      { step: 'review', type: 'choose', rounds: 6, gen: mix(G.blend(SHORT_A.concat(SHORT_E, SHORT_I, SHORT_O, SHORT_U), 3), G.read(LONG_A.concat(LONG_I, LONG_O, LONG_E), 3)) },
      { step: 'play', type: 'memory', n: 4, peek: true, words: true, pairs: SHORT_A.slice(0, 3).concat(LONG_A.slice(0, 2), LONG_E.slice(0, 2), SHORT_O.slice(0, 2)) }
    ], { review: true })
  ];

  /* ---------------- Step 3: blends and digraphs ---------------- */

  /* Two letters, one sound. `starts`: words that begin with it. */
  const DIGRAPH = {
    sh: { say: 'shhh', starts: w([['ship', '🚢'], ['shoe', '👟'], ['sheep', '🐑'], ['shell', '🐚']]), end: { w: 'fish', e: '🐟' } },
    ch: { say: 'ch', starts: w([['chick', '🐥'], ['chair', '🪑'], ['cheese', '🧀'], ['cherry', '🍒']]) },
    th: { say: 'th', starts: w([['thumb', '👍'], ['three', '3️⃣']]), end: { w: 'bath', e: '🛁' } }
  };
  const digraphCard = (k) => ({ big: k, pic: DIGRAPH[k].starts[0].e, word: DIGRAPH[k].starts[0].w,
    say: `${k.split('').join(' and ')} together say ${DIGRAPH[k].say}. ${DIGRAPH[k].say} … ${DIGRAPH[k].starts[0].w}!`, text: `<b>${k}</b> says /${k}/` });

  /** "Ship. What sound does ship start with?" — sh, ch or th. */
  function startsWith(keys) {
    const all = [];
    keys.forEach(k => DIGRAPH[k].starts.forEach(x => all.push({ k: k, x: x })));
    return (ctx) => {
      const t = U.one(all.filter(a => a.x.w !== ctx.last));
      return {
        say: `${t.x.w}. What sound does ${t.x.w} start with?`, text: `What sound does <b>${t.x.w}</b> start with?`,
        show: `<span class="big-e">${t.x.e}</span>`,
        options: U.shuffle(['sh', 'ch', 'th']).map(k => ({ key: k, glyph: k })),
        answer: t.k, praise: `${DIGRAPH[t.k].say} … ${t.x.w}`
      };
    };
  }
  /** "Which one starts with sh?" — three pictures. */
  function whichStarts(k) {
    const mine = DIGRAPH[k].starts, others = Object.keys(DIGRAPH).filter(o => o !== k).reduce((a, o) => a.concat(DIGRAPH[o].starts), []);
    return (ctx) => {
      const t = U.one(mine.filter(x => x.w !== ctx.last));
      return {
        say: `Which one starts with ${DIGRAPH[k].say}?`, text: `Which one starts with <b>${k}</b>?`,
        options: U.shuffle([t].concat(U.pick(others, 2))).map(o => ({ key: o.w, emoji: o.e })),
        answer: t.w, praise: `${DIGRAPH[k].say} … ${t.w}`
      };
    };
  }

  const L_BLEND = w([['flag', '🚩'], ['clock', '⏰'], ['plug', '🔌'], ['block', '🧱'], ['plane', '✈️'], ['glove', '🧤']]);
  const R_BLEND = w([['frog', '🐸'], ['drum', '🥁'], ['crab', '🦀'], ['tree', '🌳'], ['bread', '🍞'], ['grapes', '🍇']]);
  const S_BLEND = w([['stop', '🛑'], ['swim', '🏊'], ['snip', '✂️'], ['star', '⭐'], ['snake', '🐍'], ['spoon', '🥄']]);
  const regular = (list) => list.slice(0, 4);        // the first four of each spell as they sound
  const blendCard = (pair, x) => ({ big: pair, pic: x.e, word: x.w, say: `${pair.split('').join(' and ')}. ${x.w}!`, sound: AF.blend(x.w),
    text: `<b>${pair}</b> — two sounds, side by side` });

  const step3 = [
    L('ph3-1', 'sh', [
      { step: 'listen', type: 'intro', cards: [digraphCard('sh'), wordCard(DIGRAPH.sh.starts[1]),
        { big: 'fish', pic: '🐟', say: 'You can hear shhh at the end too. Fish!' }] },
      { step: 'trace', type: 'trace', kind: 'word', rounds: 1, set: [DIGRAPH.sh.starts[0]] },
      { step: 'play', type: 'pop', rounds: 3, gen: whichStarts('sh') },
      { step: 'quiz', type: 'choose', rounds: 4, gen: G.find(DIGRAPH.sh.starts.concat([DIGRAPH.sh.end]), 3) }
    ], { topic: 'blends' }),
    L('ph3-2', 'ch and th', [
      { step: 'listen', type: 'intro', cards: [digraphCard('ch'), wordCard(DIGRAPH.ch.starts[1]), digraphCard('th'),
        { big: 'bath', pic: '🛁', say: 'And at the end. Bath!' }] },
      { step: 'trace', type: 'trace', kind: 'word', rounds: 1, set: [DIGRAPH.ch.starts[0]] },
      { step: 'play', type: 'match', rounds: 1, n: 4, pairs: PR.word(DIGRAPH.ch.starts.concat(DIGRAPH.th.starts)),
        say: 'Match each picture to its word.', text: 'Match each picture to its <b>word</b>' },
      { step: 'quiz', type: 'choose', rounds: 4, gen: startsWith(['sh', 'ch', 'th']) }
    ], { topic: 'blends' }),
    L('ph3-3', 'fl cl pl', [
      { step: 'listen', type: 'intro', cards: [blendCard('fl', L_BLEND[0]), blendCard('cl', L_BLEND[1]), blendCard('pl', L_BLEND[2])] },
      { step: 'trace', type: 'trace', kind: 'word', rounds: 1, set: [L_BLEND[0]] },
      { step: 'play', type: 'build', rounds: 3, extra: 1, pool: LETTERS, words: regular(L_BLEND) },
      { step: 'quiz', type: 'choose', rounds: 4, gen: G.blend(regular(L_BLEND), 3) }
    ], { topic: 'blends' }),
    L('ph3-4', 'fr dr cr', [
      { step: 'listen', type: 'intro', cards: [blendCard('fr', R_BLEND[0]), blendCard('dr', R_BLEND[1]), blendCard('cr', R_BLEND[2])] },
      { step: 'trace', type: 'trace', kind: 'word', rounds: 1, set: [R_BLEND[0]] },
      { step: 'play', type: 'build', rounds: 3, extra: 1, pool: LETTERS, words: regular(R_BLEND).slice(0, 3) },
      { step: 'quiz', type: 'choose', rounds: 4, gen: G.find(R_BLEND, 3) }
    ], { topic: 'blends' }),
    L('ph3-5', 'st sw sn', [
      { step: 'listen', type: 'intro', cards: [blendCard('st', S_BLEND[0]), blendCard('sw', S_BLEND[1]), blendCard('sn', S_BLEND[2])] },
      { step: 'trace', type: 'trace', kind: 'word', rounds: 1, set: [S_BLEND[0]] },
      { step: 'play', type: 'build', rounds: 3, extra: 1, pool: LETTERS, words: S_BLEND.slice(0, 3) },
      { step: 'quiz', type: 'choose', rounds: 4, gen: G.find(S_BLEND, 3) }
    ], { topic: 'blends' }),
    L('ph3-r', 'Review', [
      { step: 'review', type: 'choose', rounds: 6, gen: mix(startsWith(['sh', 'ch', 'th']), G.blend(regular(L_BLEND).concat(R_BLEND.slice(0, 3), S_BLEND.slice(0, 3)), 3)) },
      { step: 'play', type: 'memory', n: 4, peek: true, words: true, pairs: DIGRAPH.sh.starts.concat(DIGRAPH.ch.starts.slice(0, 2), L_BLEND.slice(0, 2), R_BLEND.slice(0, 2)) }
    ], { review: true })
  ];

  /* ---------------- Step 4: silent letters and tricky sounds ---------------- */

  const SILENT_KW = w([['knee', '🦵'], ['knock', '🚪'], ['knit', '🧶'], ['write', '✍️'], ['wrap', '🎁']]);
  const SILENT_BH = w([['lamb', '🐑'], ['thumb', '👍'], ['climb', '🧗'], ['whale', '🐳'], ['hour', '⏰']]);
  const OW = w([['cow', '🐮'], ['owl', '🦉'], ['crown', '👑'], ['house', '🏠'], ['mouse', '🐭'], ['cloud', '☁️'], ['mouth', '👄']]);
  const OO_LONG = w([['moon', '🌙'], ['spoon', '🥄'], ['boot', '👢'], ['broom', '🧹']]);
  const OO_SHORT = w([['book', '📖'], ['foot', '🦶'], ['cook', '🧑‍🍳']]);
  const AR = w([['car', '🚗'], ['star', '⭐'], ['jar', '🍯'], ['shark', '🦈']]);
  const OR = w([['fork', '🍴'], ['horse', '🐴'], ['corn', '🌽'], ['storm', '⛈️']]);
  const TRICKY = ['the', 'said', 'was', 'you', 'they', 'are', 'come', 'some', 'one', 'two', 'what', 'my'];
  const quiet = (big, x, say) => ({ big: big, pic: x.e, word: x.w, say: say });

  const step4 = [
    L('ph4-1', 'Silent k and w', [
      { step: 'listen', type: 'intro', cards: [
        quiet('kn', SILENT_KW[0], 'In knee, the k is quiet. We just say nee. Knee!'),
        quiet('kn', SILENT_KW[1], 'Knock, knock! The k is quiet.'),
        quiet('wr', SILENT_KW[3], 'In write, the w is quiet. Write!'),
        quiet('wr', SILENT_KW[4], 'Wrap a present. The w is quiet.')
      ] },
      { step: 'trace', type: 'trace', kind: 'word', rounds: 1, set: [SILENT_KW[0]] },
      { step: 'play', type: 'match', rounds: 1, n: 4, pairs: PR.word(SILENT_KW),
        say: 'Match each picture to its word.', text: 'Match each picture to its <b>word</b>' },
      { step: 'quiz', type: 'choose', rounds: 4, gen: G.read(SILENT_KW, 3) }
    ], { topic: 'tricky' }),
    L('ph4-2', 'Silent b and h', [
      { step: 'listen', type: 'intro', cards: [
        quiet('mb', SILENT_BH[0], 'In lamb, the b is quiet. Lamb!'),
        quiet('mb', SILENT_BH[1], 'Thumb. The b is quiet again.'),
        quiet('wh', SILENT_BH[3], 'In whale, we hardly hear the h. Whale!'),
        quiet('h', SILENT_BH[4], 'Hour. The h is quiet. It sounds like our.')
      ] },
      { step: 'trace', type: 'trace', kind: 'word', rounds: 1, set: [SILENT_BH[0]] },
      { step: 'play', type: 'pop', rounds: 3, gen: G.find(SILENT_BH, 3) },
      { step: 'quiz', type: 'choose', rounds: 4, gen: G.read(SILENT_BH.concat(SILENT_KW), 3) }
    ], { topic: 'tricky' }),
    L('ph4-3', 'ow and ou', [
      { step: 'listen', type: 'intro', cards: [
        { big: 'ow', pic: '🐮', word: 'cow', say: 'o and w say ow. Cow!', text: '<b>ow</b> says /ow/' },
        { big: 'ou', pic: '🏠', word: 'house', say: 'o and u say ow too. House!', text: '<b>ou</b> says /ow/ too' },
        wordCard(OW[1]), wordCard(OW[4])
      ] },
      { step: 'trace', type: 'trace', kind: 'word', rounds: 1, set: [OW[0]] },
      { step: 'play', type: 'match', rounds: 1, n: 4, pairs: PR.word(OW),
        say: 'Match each picture to its word.', text: 'Match each picture to its <b>word</b>' },
      { step: 'quiz', type: 'choose', rounds: 4, gen: G.read(OW, 3) }
    ], { topic: 'tricky' }),
    L('ph4-4', 'oo', [
      { step: 'listen', type: 'intro', cards: [
        { big: 'oo', pic: '🌙', word: 'moon', say: 'oo can say a long ooo. Moon!', text: '<b>oo</b> says /oo/ in moon' },
        { big: 'oo', pic: '📖', word: 'book', say: 'oo can be short too. Book!', text: '<b>oo</b> says /u/ in book' },
        wordCard(OO_LONG[1]), wordCard(OO_SHORT[1])
      ] },
      { step: 'trace', type: 'trace', kind: 'word', rounds: 1, set: [OO_LONG[0]] },
      soundSort(tag(OO_LONG, 'long').concat(tag(OO_SHORT, 'short')),
        { key: 'long', e: '🌙', label: 'oo — moon', word: 'moon' }, { key: 'short', e: '📖', label: 'oo — book', word: 'book' }),
      { step: 'quiz', type: 'choose', rounds: 4, gen: G.read(OO_LONG.concat(OO_SHORT), 3) }
    ], { topic: 'tricky' }),
    L('ph4-5', 'ar and or', [
      { step: 'listen', type: 'intro', cards: [
        { big: 'ar', pic: '🚗', word: 'car', say: 'a and r say ar. Car!', text: '<b>ar</b> says /ar/' },
        wordCard(AR[1]),
        { big: 'or', pic: '🍴', word: 'fork', say: 'o and r say or. Fork!', text: '<b>or</b> says /or/' },
        wordCard(OR[2])
      ] },
      { step: 'trace', type: 'trace', kind: 'word', rounds: 1, set: [AR[0], OR[2]] },
      soundSort(tag(AR, 'ar').concat(tag(OR, 'or')),
        { key: 'ar', e: '🚗', label: 'ar — car', word: 'car' }, { key: 'or', e: '🍴', label: 'or — fork', word: 'fork' }),
      { step: 'quiz', type: 'choose', rounds: 4, gen: G.read(AR.concat(OR), 3) }
    ], { topic: 'tricky' }),
    L('ph4-6', 'Tricky words', [
      { step: 'listen', type: 'intro', cards: ['the', 'said', 'you', 'they'].map(t => ({ big: t, say: `${t}. We just know this one. ${t}!` })),
        text: '<b>Tricky words</b>: we just know them' },
      { step: 'trace', type: 'trace', kind: 'word', rounds: 2, set: w([['the', ''], ['you', '']]) },
      { step: 'play', type: 'pop', rounds: 3, gen: G.sight(TRICKY.slice(0, 6), 3) },
      { step: 'quiz', type: 'choose', rounds: 4, gen: G.sight(TRICKY, 4) }
    ], { topic: 'tricky' }),
    L('ph4-r', 'Review', [
      { step: 'review', type: 'choose', rounds: 6, gen: mix(G.read(SILENT_KW.concat(SILENT_BH, OW), 3), G.sight(TRICKY, 4), G.read(OO_LONG.concat(OO_SHORT, AR, OR), 3)) },
      { step: 'play', type: 'memory', n: 4, peek: true, words: true, pairs: SILENT_KW.slice(0, 2).concat(OW.slice(0, 2), OO_LONG.slice(0, 2), AR.slice(0, 2)) }
    ], { review: true })
  ];

  AF.register({
    id: 'phonics', area: 'literacy', core: 1,
    title: 'Phonics', icon: '🔤', colour: '#FFC93C',
    blurb: 'Sounds a to z',
    note: 'Listen, trace, play, quiz',
    skill: 'Letter sounds, vowels, blends and tricky words',
    tip: 'Play “I spy” with sounds: “I spy something that starts with ssss…” Let your child guess, then swap.',
    stages: ['Step 1', 'Step 2', 'Step 3', 'Step 4'],
    stageCrumbs: ['Letter sounds a–z', 'Short & long vowels', 'Blends & digraphs', 'Silent & tricky'],
    topics: { letters: 'Letter sounds', short: 'Short vowels', long: 'Long vowels', blends: 'Blends & digraphs', tricky: 'Silent & tricky' },
    levels: AF.tiers(step1, step2, step3, step4)
  });
})(window.AF = window.AF || {});
