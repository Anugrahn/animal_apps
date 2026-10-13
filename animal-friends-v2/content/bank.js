/* ============================================================
   content/bank.js — the word bank and question makers
   ------------------------------------------------------------
   Everything the content files share: letter sounds, vocabulary
   by topic, and small "generators" that turn a word list into
   endless fresh questions for the choose engine.

   To add vocabulary, add a line to WORDS. Every game that uses
   that topic picks it up straight away.
   ============================================================ */
(function (AF) {
  'use strict';

  const U = AF.U;

  /* Letter sounds, in teaching order (Letters and Sounds, Phase 2:
     s a t p · i n m d · g o c k · e u r · h b f l).
     `say` is spelled for a speech synthesiser, not a linguist:
     "ssss" makes the device hold the sound, where "s" would make
     it say the letter name "ess". */
  AF.PHONICS = {
    s: { say: 'ssss', word: 'sun',      e: '☀️' },
    a: { say: 'aaah', word: 'apple',    e: '🍎' },
    t: { say: 'tuh',  word: 'tree',     e: '🌳' },
    p: { say: 'puh',  word: 'pig',      e: '🐷' },
    i: { say: 'ih',   word: 'insect',   e: '🐞' },
    n: { say: 'nnnn', word: 'nose',     e: '👃' },
    m: { say: 'mmmm', word: 'moon',     e: '🌙' },
    d: { say: 'duh',  word: 'dog',      e: '🐶' },
    g: { say: 'guh',  word: 'goat',     e: '🐐' },
    o: { say: 'awh',  word: 'octopus',  e: '🐙' },
    c: { say: 'kuh',  word: 'cat',      e: '🐱' },
    k: { say: 'kuh',  word: 'key',      e: '🔑' },
    e: { say: 'eh',   word: 'egg',      e: '🥚' },
    u: { say: 'uh',   word: 'umbrella', e: '☂️' },
    r: { say: 'rrrr', word: 'rabbit',   e: '🐰' },
    h: { say: 'huh',  word: 'hat',      e: '🎩' },
    b: { say: 'buh',  word: 'bee',      e: '🐝' },
    f: { say: 'ffff', word: 'fish',     e: '🐟' },
    l: { say: 'llll', word: 'lion',     e: '🦁' }
  };

  /** The sound a letter makes, as AF.PHONICS spells it. */
  AF.phonic = (ch) => (AF.PHONICS[ch] && AF.PHONICS[ch].say) || ch;
  /** A word's sounds in a row, "buh … uh … guh". A doubled sound
      (the c k in "duck") is said once. tools/voice runs them together. */
  AF.blend = (word) => word.split('').map(AF.phonic).filter((s, i, all) => s !== all[i - 1]).join(' … ');

  const w = (list) => list.map(x => ({ w: x[0], e: x[1] }));

  AF.WORDS = {
    animals: w([['cat', '🐱'], ['dog', '🐶'], ['cow', '🐮'], ['pig', '🐷'], ['duck', '🦆'], ['fish', '🐟'],
      ['bird', '🐦'], ['horse', '🐴'], ['sheep', '🐑'], ['frog', '🐸'], ['lion', '🦁'], ['monkey', '🐵'],
      ['elephant', '🐘'], ['bee', '🐝']]),
    food: w([['apple', '🍎'], ['banana', '🍌'], ['bread', '🍞'], ['milk', '🥛'], ['egg', '🥚'], ['carrot', '🥕'],
      ['cheese', '🧀'], ['grapes', '🍇'], ['orange', '🍊'], ['rice', '🍚'], ['cake', '🍰'], ['pizza', '🍕']]),
    body: w([['eye', '👁️'], ['ear', '👂'], ['nose', '👃'], ['mouth', '👄'], ['hand', '✋'], ['foot', '🦶'],
      ['tooth', '🦷'], ['leg', '🦵']]),
    go: w([['car', '🚗'], ['bus', '🚌'], ['train', '🚂'], ['boat', '⛵'], ['plane', '✈️'], ['bike', '🚲'],
      ['rocket', '🚀'], ['truck', '🚚']]),
    home: w([['bed', '🛏️'], ['chair', '🪑'], ['door', '🚪'], ['book', '📖'], ['ball', '⚽'], ['clock', '⏰'],
      ['key', '🔑'], ['shoe', '👟'], ['hat', '🎩'], ['shirt', '👕'], ['sock', '🧦']]),
    nature: w([['sun', '☀️'], ['moon', '🌙'], ['star', '⭐'], ['tree', '🌳'], ['flower', '🌸'], ['rain', '🌧️'],
      ['cloud', '☁️'], ['fire', '🔥']]),
    feelings: w([['happy', '😀'], ['sad', '😢'], ['angry', '😠'], ['scared', '😨'], ['surprised', '😲'], ['sleepy', '😴']]),
    clothes: w([['shirt', '👕'], ['dress', '👗'], ['coat', '🧥'], ['shoe', '👟'], ['sock', '🧦'], ['cap', '🧢'],
      ['glove', '🧤'], ['scarf', '🧣']]),
    toys: w([['ball', '⚽'], ['kite', '🪁'], ['teddy', '🧸'], ['drum', '🥁'], ['robot', '🤖'], ['balloon', '🎈'],
      ['puzzle', '🧩'], ['blocks', '🧱']]),
    jobs: w([['doctor', '🧑‍⚕️'], ['farmer', '🧑‍🌾'], ['cook', '🧑‍🍳'], ['teacher', '🧑‍🏫'], ['firefighter', '🧑‍🚒'],
      ['pilot', '🧑‍✈️'], ['astronaut', '🧑‍🚀'], ['artist', '🧑‍🎨']]),
    long: w([['elephant', '🐘'], ['butterfly', '🦋'], ['banana', '🍌'], ['umbrella', '☂️'], ['octopus', '🐙'],
      ['caterpillar', '🐛'], ['dinosaur', '🦕'], ['strawberry', '🍓'], ['helicopter', '🚁'], ['watermelon', '🍉']])
  };

  /* Pairs of opposites: [word, picture, its opposite, picture]. */
  AF.OPPOSITES = [['hot', '🔥', 'cold', '❄️'], ['big', '🐘', 'small', '🐭'], ['day', '☀️', 'night', '🌙'],
    ['happy', '😀', 'sad', '😢'], ['fast', '🐇', 'slow', '🐢'], ['up', '⬆️', 'down', '⬇️'],
    ['wet', '🌧️', 'dry', '🏜️'], ['awake', '😃', 'asleep', '😴'], ['loud', '📢', 'quiet', '🤫']];

  AF.COLOURS = [
    { w: 'red', c: '#F24B4B' }, { w: 'blue', c: '#3D8BFF' }, { w: 'yellow', c: '#FFD43B' },
    { w: 'green', c: '#3DBE5B' }, { w: 'orange', c: '#FF9130' }, { w: 'purple', c: '#9B5DE5' },
    { w: 'pink', c: '#FF8CC6' }, { w: 'brown', c: '#9C6B43' }, { w: 'black', c: '#2B2B33' }, { w: 'white', c: '#FFFFFF' }
  ];

  const NUM = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
    'eleven', 'twelve'];
  AF.NUM = NUM;

  /* Inline shapes, so they look the same on every device. */
  const SHAPE_PATH = {
    circle: '<circle cx="50" cy="50" r="42"/>',
    square: '<rect x="10" y="10" width="80" height="80" rx="6"/>',
    triangle: '<path d="M50 8 L94 88 H6 Z" stroke-linejoin="round"/>',
    rectangle: '<rect x="4" y="24" width="92" height="52" rx="6"/>',
    star: '<path d="M50 5 L61 37 L95 38 L68 58 L78 91 L50 72 L22 91 L32 58 L5 38 L39 37 Z" stroke-linejoin="round"/>',
    heart: '<path d="M50 88 C10 58 6 30 26 18 C38 11 48 18 50 28 C52 18 62 11 74 18 C94 30 90 58 50 88 Z"/>',
    oval: '<ellipse cx="50" cy="50" rx="46" ry="30"/>',
    diamond: '<path d="M50 6 L90 50 L50 94 L10 50 Z" stroke-linejoin="round"/>'
  };
  AF.SHAPES = Object.keys(SHAPE_PATH);
  SHAPE_PATH.pentagon = '<path d="M50 6 L94 38 L77 90 H23 L6 38 Z" stroke-linejoin="round"/>';
  SHAPE_PATH.hexagon = '<path d="M27 10 H73 L96 50 L73 90 H27 L4 50 Z" stroke-linejoin="round"/>';
  const SHAPE_COL = ['#F24B4B', '#3D8BFF', '#FFC93C', '#3DBE5B', '#9B5DE5', '#FF8CC6', '#FF9130'];

  function shape(name, colour) {
    return `<svg class="opt-svg" viewBox="0 0 100 100" fill="${colour}" stroke="${colour}" stroke-width="5">${SHAPE_PATH[name]}</svg>`;
  }
  function swatch(colour) {
    return `<span class="opt-swatch" style="background:${colour}"></span>`;
  }
  function row(emoji, n, cls) {
    return `<span class="group ${cls || ''}">${Array.from({ length: n }, () => `<i>${emoji}</i>`).join('')}</span>`;
  }

  const COUNTABLE = [['apple', 'apples', '🍎'], ['star', 'stars', '⭐'], ['duck', 'ducks', '🦆'], ['ball', 'balls', '⚽'],
    ['fish', 'fish', '🐟'], ['flower', 'flowers', '🌸'], ['car', 'cars', '🚗'], ['bee', 'bees', '🐝']];

  /** n numbers near `answer`, including it, between lo and hi. */
  function numberOptions(answer, n, lo, hi) {
    const near = [];
    for (let d = 1; near.length < 8; d++) {
      if (answer - d >= lo) near.push(answer - d);
      if (answer + d <= hi) near.push(answer + d);
      if (d > 12) break;
    }
    const opts = U.shuffle(near.slice(0, Math.max(n - 1, 3))).slice(0, n - 1).concat([answer]);
    return opts.sort((a, b) => a - b).map(v => ({ key: v, glyph: String(v) }));
  }

  /* ============================================================
     Generators. Each returns gen(ctx) -> round for the choose
     engine. ctx = { round, last, stretch }.
     `stretch` is true when the child already has 3 stars here, so
     the generator can offer one more choice.
     ============================================================ */
  /* Ready-made pairs for the match and memory engines.
     Each is { w, a: face, b: face, say? } where a face is
     { e } a picture, { t } text, { shadow } a silhouette or { html }. */
  AF.Pairs = {
    /** a picture and its shadow */
    shadow(words) { return words.map(x => ({ w: x.w, a: { e: x.e }, b: { shadow: x.e } })); },
    /** a picture and its written word */
    word(words) { return words.map(x => ({ w: x.w, a: { e: x.e }, b: { t: x.w } })); },
    /** a numeral and that many dots */
    count(lo, hi, e) {
      return Array.from({ length: hi - lo + 1 }, (_, i) => lo + i).map(v =>
        ({ w: NUM[v], a: { t: String(v) }, b: { html: row(e || '⭐', v) } }));
    },
    /** a letter and something that starts with its sound */
    letter(keys) {
      return keys.map(k => ({ w: AF.PHONICS[k].word, sayA: AF.PHONICS[k].say, a: { t: k }, b: { e: AF.PHONICS[k].e },
        say: `${AF.PHONICS[k].say} … ${AF.PHONICS[k].word}` }));
    },
    /** a shape and its outline */
    shape(names) {
      const cols = ['#F24B4B', '#3D8BFF', '#FFC93C', '#3DBE5B', '#9B5DE5', '#FF8CC6', '#FF9130', '#22B8CF'];
      return names.map((n, i) => ({ w: n, a: { html: shape(n, cols[i % cols.length]) }, b: { html: shape(n, 'rgba(60,80,90,.28)') } }));
    },
    /** any two pictures that go together: [word, picture A, picture B, what to say] */
    of(list) { return list.map(x => ({ w: x[0], a: { e: x[1] }, b: { e: x[2] }, say: x[3] || x[0] })); },
    /** two words that go together: [[wordA, pictureA], [wordB, pictureB]] */
    words(list) {
      return list.map(x => ({ w: x[0][0], sayA: x[0][0], sayB: x[1][0], a: { e: x[0][1] }, b: { e: x[1][1] }, say: `${x[0][0]}, ${x[1][0]}` }));
    }
  };

  const Gen = AF.Gen = {
    shape: shape, swatch: swatch, row: row,

    /** "Find the cat" — hear a word, tap its picture. */
    find(words, n) {
      return (ctx) => {
        const t = U.one(words.filter(x => x.w !== ctx.last));
        const others = U.pick(words, n - 1 + (ctx.stretch ? 1 : 0), [t]);
        return {
          say: `Find the ${t.w}.`, text: `Find the <b>${t.w}</b>`,
          options: U.shuffle([t].concat(others)).map(o => ({ key: o.w, emoji: o.e })),
          answer: t.w, praise: t.w
        };
      };
    },

    /** See a picture, tap the written word. */
    read(words, n) {
      return (ctx) => {
        const t = U.one(words.filter(x => x.w !== ctx.last));
        return {
          say: 'What is this? Find the word.', text: 'What is this? Find the <b>word</b>',
          show: `<span class="big-e">${t.e}</span>`,
          options: U.shuffle([t].concat(U.pick(words, n - 1, [t]))).map(o => ({ key: o.w, glyph: o.w })),
          answer: t.w, praise: t.w
        };
      };
    },

    /** "Which letter says /s/?" `focus` letters come up more often. */
    letterSound(pool, n, focus) {
      return (ctx) => {
        // Never the same letter twice running; a one-letter focus falls back to the pool.
        let from = (focus && Math.random() < 0.65 ? focus : pool).filter(k => k !== ctx.last);
        if (!from.length) from = pool.filter(k => k !== ctx.last);
        const t = U.one(from);
        const info = AF.PHONICS[t];
        // c and k make the same sound, so never offer both at once.
        const clash = (k) => k !== t && AF.PHONICS[k].say === info.say;
        const others = U.pick(pool.filter(k => !clash(k)), n - 1 + (ctx.stretch ? 1 : 0), [t]);
        return {
          say: 'Which letter says', sound: info.say,
          text: `Which letter says <b>/${info.say.replace(/(.)\1+/g, '$1')}/</b>?`,
          options: U.shuffle([t].concat(others)).map(k => ({ key: k, glyph: k, emoji: AF.PHONICS[k].e })),
          answer: t, praise: `${t} … ${info.say} … ${info.word}`
        };
      };
    },

    /** "What sound does sun start with?" */
    firstSound(pool, n) {
      return (ctx) => {
        const t = U.one(pool.filter(k => k !== ctx.last));
        const info = AF.PHONICS[t];
        const clash = (k) => k !== t && AF.PHONICS[k].say === info.say;
        return {
          say: `${info.word}. What sound does ${info.word} start with?`,
          text: `What sound does <b>${info.word}</b> start with?`,
          show: `<span class="big-e">${info.e}</span>`,
          options: U.shuffle([t].concat(U.pick(pool.filter(k => !clash(k)), n - 1, [t]))).map(k => ({ key: k, glyph: k })),
          answer: t, praise: `${info.say} … ${info.word}`
        };
      };
    },

    /** "What rhymes with cat?" sets = [[{w,e}, ...], ...] */
    rhyme(sets) {
      let prev = -1;
      return () => {
        const si = U.one(sets.map((s, i) => i).filter(i => i !== prev));
        prev = si;
        const pair = U.shuffle(sets[si]).slice(0, 2);
        const others = U.pick(sets.map((s, i) => i), 2, [si]).map(i => U.one(sets[i]));
        return {
          say: `What rhymes with ${pair[0].w}?`, text: `What rhymes with <b>${pair[0].w}</b>?`,
          show: `<span class="big-e">${pair[0].e}</span>`,
          options: U.shuffle([pair[1]].concat(others)).map(o => ({ key: o.w, emoji: o.e, label: o.w })),
          answer: pair[1].w, praise: `${pair[0].w}, ${pair[1].w}`
        };
      };
    },

    /** "Find the word: the" */
    sight(words, n) {
      return (ctx) => {
        const t = U.one(words.filter(x => x !== ctx.last));
        return {
          say: `Find the word, ${t}.`, text: 'Find the word you <b>hear</b>',
          options: U.shuffle([t].concat(U.pick(words, n - 1, [t]))).map(x => ({ key: x, glyph: x })),
          answer: t, praise: t
        };
      };
    },

    /** "Find something red" */
    colour(n) {
      return (ctx) => {
        const t = U.one(AF.COLOURS.filter(x => x.w !== ctx.last));
        return {
          say: `Find ${t.w}.`, text: `Find <b>${t.w}</b>`,
          options: U.shuffle([t].concat(U.pick(AF.COLOURS, n - 1 + (ctx.stretch ? 1 : 0), [t])))
            .map(o => ({ key: o.w, html: swatch(o.c) })),
          answer: t.w, praise: t.w
        };
      };
    },

    /** "Find the triangle" */
    shapes(names, n) {
      return (ctx) => {
        const t = U.one(names.filter(x => x !== ctx.last));
        const cols = U.shuffle(SHAPE_COL);
        return {
          say: `Find the ${t}.`, text: `Find the <b>${t}</b>`,
          options: U.shuffle([t].concat(U.pick(names, n - 1 + (ctx.stretch ? 1 : 0), [t])))
            .map((o, i) => ({ key: o, html: shape(o, cols[i]) })),
          answer: t, praise: t
        };
      };
    },

    /** "How many apples?" */
    count(lo, hi, n) {
      return (ctx) => {
        let v;
        do { v = lo + U.rand(hi - lo + 1); } while (v === ctx.last && hi > lo);
        const thing = U.one(COUNTABLE);
        return {
          say: `How many ${thing[1]}?`, text: `How many <b>${thing[1]}</b>?`,
          show: row(thing[2], v),
          options: numberOptions(v, n + (ctx.stretch ? 1 : 0), Math.max(1, lo - 1), hi + 1),
          answer: v, praise: `${NUM[v]} ${v === 1 ? thing[0] : thing[1]}`
        };
      };
    },

    /** "Find number seven" */
    numeral(lo, hi, n) {
      return (ctx) => {
        let v;
        do { v = lo + U.rand(hi - lo + 1); } while (v === ctx.last);
        return {
          say: `Find number ${NUM[v]}.`, text: 'Find the number you <b>hear</b>',
          options: numberOptions(v, n + (ctx.stretch ? 1 : 0), lo, hi),
          answer: v, praise: NUM[v]
        };
      };
    },

    /** "Which has more?" / "Which has fewer?" */
    compare(hi) {
      return (ctx) => {
        const a = 1 + U.rand(hi);
        let b;
        do { b = 1 + U.rand(hi); } while (b === a);
        const more = Math.random() < 0.6;
        const thing = U.one(COUNTABLE);
        const answer = more ? Math.max(a, b) : Math.min(a, b);
        return {
          say: more ? 'Which has more?' : 'Which has fewer?',
          text: more ? 'Which has <b>more</b>?' : 'Which has <b>fewer</b>?',
          options: [a, b].map(v => ({ key: v, html: row(thing[2], v, 'in-card') })),
          answer: answer, praise: `${NUM[answer]} is ${more ? 'more' : 'fewer'}`
        };
      };
    },

    /** "Two and one more. How many?" */
    add(max, n) {
      return (ctx) => {
        let a, b;
        do { a = 1 + U.rand(max - 1); b = 1 + U.rand(max - a); } while (a + b === ctx.last && max > 3);
        const thing = U.one(COUNTABLE);
        return {
          say: `${NUM[a]} and ${NUM[b]} more. How many altogether?`,
          text: `<b>${a}</b> and <b>${b}</b> more. How many?`,
          show: row(thing[2], a) + '<span class="op">+</span>' + row(thing[2], b),
          options: numberOptions(a + b, n, 1, max + 1),
          answer: a + b, praise: `${NUM[a]} and ${NUM[b]} make ${NUM[a + b]}`
        };
      };
    },

    /** "Four apples. Take away one. How many are left?" */
    takeAway(max, n) {
      return (ctx) => {
        let a, b;
        do { a = 2 + U.rand(max - 1); b = 1 + U.rand(a - 1); } while (a - b === ctx.last && max > 3);
        const thing = U.one(COUNTABLE);
        return {
          say: `${NUM[a]} ${thing[1]}. Take away ${NUM[b]}. How many are left?`,
          text: `<b>${a}</b> take away <b>${b}</b>. How many are left?`,
          show: row(thing[2], a - b) + row(thing[2], b, 'gone'),
          options: numberOptions(a - b, n, 0, max),
          answer: a - b, praise: `${NUM[a - b]} left`
        };
      };
    },

    /** "What comes next?" kinds = ['AB', 'ABB', 'ABC', ...] */
    pattern(kinds) {
      const SETS = [['🔴', '🔵', '🟡'], ['🍎', '🍌', '🍇'], ['🐶', '🐱', '🐸'], ['⭐', '🌙', '☀️'], ['🟩', '🟧', '🟪']];
      return () => {
        const kind = U.one(kinds), set = U.shuffle(U.one(SETS));
        const unit = kind.split('').map(ch => set[ch.charCodeAt(0) - 65]);
        const len = unit.length * 2 + 1 + U.rand(unit.length);
        const seq = Array.from({ length: len }, (_, i) => unit[i % unit.length]);
        const answer = unit[len % unit.length];
        return {
          say: 'What comes next?', text: 'What comes <b>next</b>?',
          show: `<span class="pattern">${seq.map(e => `<i>${e}</i>`).join('')}<i class="q">?</i></span>`,
          options: U.shuffle(set).map(e => ({ key: e, emoji: e })),
          answer: answer
        };
      };
    },

    /** "Which one is the biggest?" */
    size() {
      return () => {
        const thing = U.one(['🐘', '🎈', '🌳', '⚽', '🐟', '🍎', '🚗']);
        const big = Math.random() < 0.5;
        const sizes = U.shuffle([0.45, 0.72, 1]);
        return {
          say: big ? 'Which one is the biggest?' : 'Which one is the smallest?',
          text: big ? 'Which one is the <b>biggest</b>?' : 'Which one is the <b>smallest</b>?',
          options: sizes.map(s => ({ key: s, html: `<span class="sized" style="--k:${s}">${thing}</span>` })),
          answer: big ? 1 : 0.45
        };
      };
    },

    /** "What comes after four?" / "What comes before four?" */
    neighbour(lo, hi, n) {
      let prev = null;
      return () => {
        const after = Math.random() < 0.6;
        let v;
        do { v = lo + U.rand(hi - lo + 1); } while (v === prev && hi > lo);
        prev = v;
        const answer = after ? v + 1 : v - 1;
        const num = `<i class="num">${v}</i>`, q = '<i class="q">?</i>';
        return {
          say: `What comes ${after ? 'after' : 'before'} ${NUM[v] || v}?`,
          text: `What comes <b>${after ? 'after' : 'before'}</b> ${v}?`,
          show: `<span class="pattern">${after ? num + q : q + num}</span>`,
          options: numberOptions(answer, n, Math.max(0, lo - 1), hi + 1),
          answer: answer, praise: after ? `${NUM[v] || v}, ${NUM[answer] || answer}` : `${NUM[answer] || answer}, ${NUM[v] || v}`
        };
      };
    },

    /** "2, 4, 6 ... what comes next?" — counting in steps. */
    skip(steps, top) {
      return () => {
        const step = U.one(steps);
        const len = 3 + U.rand(2);
        const start = step * (1 + U.rand(Math.max(1, Math.floor(top / step) - len)));
        const seq = Array.from({ length: len }, (_, i) => start + i * step);
        const answer = start + len * step;
        const opts = [answer, answer - 1, answer + step].sort((a, b) => a - b);
        return {
          say: `Count in ${NUM[step]}s. What comes next?`, text: `Count in <b>${step}s</b>. What comes next?`,
          show: `<span class="pattern">${seq.map(v => `<i class="num">${v}</i>`).join('')}<i class="q">?</i></span>`,
          options: opts.map(v => ({ key: v, glyph: String(v) })),
          answer: answer, praise: seq.concat([answer]).join(', ')
        };
      };
    },

    /** "Two and how many more make five?" */
    missing(max, n) {
      return (ctx) => {
        let total, a;
        do { total = 3 + U.rand(max - 2); a = 1 + U.rand(total - 1); } while (total - a === ctx.last && max > 4);
        const thing = U.one(COUNTABLE);
        return {
          say: `${NUM[a]} and how many more make ${NUM[total]}?`,
          text: `<b>${a}</b> and how many more make <b>${total}</b>?`,
          show: row(thing[2], a) + '<span class="op">+</span><span class="pattern"><i class="q">?</i></span><span class="op">= ' + total + '</span>',
          options: numberOptions(total - a, n, 1, max),
          answer: total - a, praise: `${NUM[a]} and ${NUM[total - a]} make ${NUM[total]}`
        };
      };
    },

    /** "Which number is bigger?" — numerals only, no pictures. */
    bigger(lo, hi) {
      return () => {
        const a = lo + U.rand(hi - lo + 1);
        let b;
        do { b = lo + U.rand(hi - lo + 1); } while (b === a);
        const big = Math.random() < 0.6;
        const answer = big ? Math.max(a, b) : Math.min(a, b);
        return {
          say: big ? 'Which number is bigger?' : 'Which number is smaller?',
          text: big ? 'Which number is <b>bigger</b>?' : 'Which number is <b>smaller</b>?',
          options: [a, b].map(v => ({ key: v, glyph: String(v) })),
          answer: answer, praise: `${NUM[answer] || answer} is ${big ? 'bigger' : 'smaller'}`
        };
      };
    },

    /** "How many sides does a triangle have?" */
    sides() {
      const S = [['triangle', 3], ['square', 4], ['rectangle', 4], ['pentagon', 5], ['hexagon', 6], ['circle', 0]];
      let prev = null;
      return () => {
        const t = U.one(S.filter(x => x[0] !== prev));
        prev = t[0];
        return {
          say: `How many straight sides does a ${t[0]} have?`, text: `How many <b>sides</b> does a ${t[0]} have?`,
          show: shape(t[0], '#FFC93C'),
          options: [0, 3, 4, 5, 6].filter(v => v === t[1] || Math.abs(v - t[1]) <= 3).slice(0, 4).map(v => ({ key: v, glyph: String(v) })),
          answer: t[1], praise: t[1] ? `A ${t[0]} has ${NUM[t[1]]} sides` : 'A circle has no straight sides'
        };
      };
    },

    /** "Which one does not belong?" groups = [[{w,e}...], ...] */
    odd(groups) {
      let prev = -1;
      return () => {
        const gi = U.one(groups.map((g, i) => i).filter(i => i !== prev));
        prev = gi;
        const same = U.pick(groups[gi], 3);
        const other = U.one(groups[U.one(groups.map((g, i) => i).filter(i => i !== gi))]);
        return {
          say: 'Which one does not belong?', text: 'Which one does <b>not</b> belong?',
          options: U.shuffle(same.concat([other])).map(o => ({ key: o.w, emoji: o.e })),
          answer: other.w, praise: `The ${other.w} is different`
        };
      };
    },

    /** "What is the opposite of hot?" */
    opposite(list) {
      let prev = null;
      return () => {
        const t = U.one(list.filter(x => x !== prev));
        prev = t;
        const q = Math.random() < 0.5 ? [t[2], t[3], t[0], t[1]] : t;
        const others = U.pick(list.filter(x => x !== t), 2).map(x => Math.random() < 0.5 ? [x[0], x[1]] : [x[2], x[3]]);
        return {
          say: `What is the opposite of ${q[0]}?`, text: `What is the opposite of <b>${q[0]}</b>?`,
          show: `<span class="big-e">${q[1]}</span>`,
          options: U.shuffle([[q[2], q[3]]].concat(others)).map(o => ({ key: o[0], emoji: o[1], label: o[0] })),
          answer: q[2], praise: `${q[0]} and ${q[2]}`
        };
      };
    },

    /** Hear the sounds "c … a … t", tap the picture. words = [{w,e}] */
    blend(words, n) {
      return (ctx) => {
        const t = U.one(words.filter(x => x.w !== ctx.last));
        return {
          say: 'Put the sounds together.', sound: AF.blend(t.w),
          text: `Put the sounds together: <b>${t.w.split('').join(' · ')}</b>`,
          options: U.shuffle([t].concat(U.pick(words, n - 1, [t]))).map(o => ({ key: o.w, emoji: o.e })),
          answer: t.w, praise: t.w
        };
      };
    },

    /**
     * Sorting: every round shows one thing and the same bins.
     * items = [{ e, w, bin }], bins = [{ key, emoji, label }]
     * ask(item) -> spoken question.
     */
    sort(items, bins, ask, tell) {
      let bag = [];
      return () => {
        if (!bag.length) bag = U.shuffle(items);
        const it = bag.pop();
        const bin = bins.filter(b => b.key === it.bin)[0];
        return {
          say: ask(it), text: U.esc(ask(it)),
          show: `<span class="big-e">${it.e}</span>`,
          options: bins.map(b => ({ key: b.key, emoji: b.emoji, label: b.label, c: b.c })),
          answer: it.bin, praise: tell ? tell(it, bin) : bin.label
        };
      };
    },

    /** Questions asked in a shuffled order, each once before repeating.
        list = [{ say, text?, show?, options, answer, praise? }] */
    ask(list, shuffleOptions) {
      let bag = [];
      return () => {
        if (!bag.length) bag = U.shuffle(list);
        const q = bag.pop();
        return Object.assign({}, q, { options: shuffleOptions === false ? q.options : U.shuffle(q.options) });
      };
    }
  };
})(window.AF = window.AF || {});
